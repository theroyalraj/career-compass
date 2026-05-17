import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import { runSenseiTask } from './senseiAgent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = Number(process.env.PC_AGENT_PORT || 3847);
const SECRET = (process.env.PC_AGENT_SECRET || '').trim();

const app = express();
app.disable('x-powered-by');

// ── SSE event bus ────────────────────────────────────────────────────────────
const sseClients = new Set();
const sseBuffer = [];

function broadcastEvent(type, data = {}) {
  const payload = JSON.stringify({ type, ts: Date.now(), ...data });
  const msg = `data: ${payload}\n\n`;
  sseBuffer.push(msg);
  if (sseBuffer.length > 100) sseBuffer.shift();
  for (const res of sseClients) {
    try { res.write(msg); } catch { sseClients.delete(res); }
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '1mb' }));

function requireAuth(req, res, next) {
  if (!SECRET) return next();
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Voice command endpoint (from sensei-listen.py) ───────────────────────────
app.post('/voice/command', requireAuth, async (req, res) => {
  const { text, userId, source } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text' });
  }

  broadcastEvent('heard', { text });
  broadcastEvent('thinking', { text: 'Processing...' });

  try {
    const result = await runSenseiTask(text.trim(), { userId, source });
    broadcastEvent('reply', { text: result.summary });

    // Trigger voice speak over speakers if the request originates from the Web UI
    if (source === 'web' || source === 'web-ui') {
      try {
        const gatewayPort = process.env.PORT || 3848;
        // Call the gateway's speak API
        await fetch(`http://127.0.0.1:${gatewayPort}/sensei/speak`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SECRET}`
          },
          body: JSON.stringify({ text: result.summary })
        });
      } catch (e) {
        console.error('[pc-agent] Failed to trigger speech on voice-gateway:', e.message);
      }
    }

    res.json({ ok: true, summary: result.summary });
  } catch (e) {
    const errMsg = `Error: ${e.message || e}`;
    broadcastEvent('error', { text: errMsg });
    res.status(500).json({ error: errMsg });
  }
});

// ── Task endpoint (from voice gateway direct intake) ─────────────────────────
app.post('/task', requireAuth, async (req, res) => {
  const { text, userId, source, correlationId } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const result = await runSenseiTask(text.trim(), { userId, source });
    res.json({ ok: true, summary: result.summary, correlationId });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// ── Voice events (from sensei-listen.py daemon status updates) ────────────────
app.post('/voice/event', requireAuth, (req, res) => {
  const { type, text } = req.body || {};
  if (type) broadcastEvent(type, { text: text || '' });
  res.json({ ok: true });
});

// ── SSE stream (for web UI) ──────────────────────────────────────────────────
app.get('/voice/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });
  res.write(': ping\n\n');
  for (const msg of sseBuffer) res.write(msg);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sensei-agent', uptime: process.uptime() });
});

// ── Static (future web UI) ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n  ┌───────────────────────────────────────────────┐`);
  console.log(`  │   S E N S E I  —  Agent Server  —  Port ${PORT}  │`);
  console.log(`  └───────────────────────────────────────────────┘\n`);
  console.log(`  Endpoints:`);
  console.log(`    POST /voice/command  — voice command intake`);
  console.log(`    POST /task           — task execution`);
  console.log(`    GET  /voice/stream   — SSE event stream`);
  console.log(`    GET  /health         — health check\n`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGINT', () => { server.close(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); process.exit(0); });
