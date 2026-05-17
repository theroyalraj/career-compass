import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import { createClient } from 'redis';
import { rootLogger } from './log.js';
import { useDirectIntake, enqueueDirectToPcAgent } from './directIntake.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = Number(process.env.PORT || 3848);
const PC_AGENT_SECRET = (process.env.PC_AGENT_SECRET || '').trim();

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  req.senseiReqId = crypto.randomUUID();
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(
  pinoHttp({
    logger: rootLogger,
    genReqId: (req) => req.senseiReqId,
    autoLogging: { ignore: (req) => req.url === '/health' },
  }),
);

app.use(express.json({ limit: '1mb' }));

function requireSecret(req, res) {
  if (!PC_AGENT_SECRET) return true;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.headers['x-sensei-secret'];
  if (token !== PC_AGENT_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

/** Direct voice command intake → pc-agent */
app.post('/sensei/command', async (req, res) => {
  if (!requireSecret(req, res)) return;
  const { text, userId, source } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text' });
  }
  const payload = {
    commandText: text.trim(),
    userId: userId || 'sensei-voice',
    source: source || 'voice-gateway',
    correlationId: crypto.randomUUID(),
  };
  try {
    await enqueueDirectToPcAgent(payload, req.log, PC_AGENT_SECRET);
    res.status(202).json({ ok: true, correlationId: payload.correlationId });
  } catch (e) {
    req.log.error({ err: String(e.message || e) }, 'command intake failed');
    res.status(500).json({ error: 'Internal error' });
  }
});

/** Speak text via TTS (called by pc-agent or external triggers) */
app.post('/sensei/speak', async (req, res) => {
  if (!requireSecret(req, res)) return;
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text required' });
  }
  const { spawn } = await import('node:child_process');
  const speakScript = path.resolve(__dirname, '../scripts/sensei-speak.py');
  const child = spawn('python', [speakScript, text.trim()], {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'ignore',
    detached: true,
    windowsHide: true,
  });
  child.unref();
  res.json({ ok: true });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sensei-voice-gateway' });
});

// Error handler
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'unhandled error');
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

process.on('unhandledRejection', (reason) => {
  rootLogger.error({ err: String(reason) }, 'unhandledRejection');
});

const server = app.listen(PORT, () => {
  process.stdout.write(
    '\n  ┌──────────────────────────────────────────────────┐\n' +
    '  │   S E N S E I  —  Voice Gateway  —  Port ' + PORT + '   │\n' +
    '  └──────────────────────────────────────────────────┘\n\n',
  );
  rootLogger.info({ port: PORT }, 'Sensei voice gateway listening');

  // Start Redis Heartbeat
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => {
    // Suppress connection errors
  });
  redisClient.connect().then(() => {
    setInterval(() => {
      redisClient.set('sensei:heartbeat:gateway', 'active', { EX: 15 }).catch(() => {});
    }, 5000);
  }).catch((err) => {
    rootLogger.warn({ err: err.message }, 'Redis heartbeat connection failed');
  });
});

server.on('error', (err) => {
  rootLogger.fatal({ err }, 'server listen error');
  process.exit(1);
});

function shutdown(signal) {
  rootLogger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2500);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
