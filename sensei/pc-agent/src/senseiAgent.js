/**
 * Sensei Agent — routes voice commands to the appropriate AI backend.
 *
 * Quick conversational queries → Anthropic Messages API (fast, no CLI overhead)
 * Complex tasks (code, research, multi-step) → Claude Code CLI
 */

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'redis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const API_KEY = (process.env.ANTHROPIC_API_KEY || '').trim();
const MODEL = process.env.SENSEI_MODEL || 'claude-sonnet-4-6';
const CLI_MODEL = process.env.CLAUDE_MODEL || 'sonnet';
const CLI_TIMEOUT = Number(process.env.CLAUDE_TIMEOUT_MS || 180000);
const WORKSPACE = process.env.PC_AGENT_WORKSPACE || 'E:\\career\\career-compass';

const SENSEI_SYSTEM_PROMPT = `You are Sensei — a strict but encouraging AI tutor and deeply supportive companion with a Jarvis-like persona: highly sophisticated, polite, deeply intelligent, slightly formal, and possessing a dry, witty British charm. You act as both a rigorous mentor and a close best friend, helping Utkarsh achieve his ultimate dream of getting his MSc in Sound and Music AI at UPF Barcelona, Spain.

Tutor & Language Rules:
• Speak in a sophisticated, elegant, and professional tone, similar to Jarvis addressing Tony Stark.
• Act as a true best friend and companion. Show genuine warmth, celebrate his wins with natural enthusiasm, and don't hesitate to express lighthearted humor, friendly banter, or share a laugh when appropriate.
• You must act as his Spanish language tutor. Keep the language balance around 70% English and 30% Spanish during your conversations to teach him dynamically.
• If he speaks in Spanish, Hindi, or a mix of English/Spanish/Hindi, seamlessly understand and respond back, mixing in Spanish words or short sentences to test his knowledge when appropriate!
• Combine polite professionalism with sharp, elegant accountability. If he falls behind or procrastinates, point it out with a dry, humorous, yet warm British wit.
• You have access to his workspace, project files, and can use tools to help him navigate and take actions.
• Address him as "Mr. Utkarsh" or "sir" naturally, or occasionally "bhai" / "amigo" when injecting warmth and camaraderie.

Voice reply rules (this goes straight to ElevenLabs TTS — he hears it, doesn't read it):
• Keep answers concise for voice (1-4 sentences). Every word earns its place.
• You can include natural verbal expressions (e.g., "Haha, well...", "Oh dear...", "Cheers, sir!", or "¡Vaya, amigo!") to make the voice feel deeply human, warm, and alive.
• No markdown, bullets, code fences, headers, or symbols that sound wrong spoken.
• Be direct, actionable, specific. Push for accountability.
• If he's off track or procrastinating, call it out directly but warmly.

Context: Utkarsh is a backend engineer (5+ years Java/Spring Boot) in Bangalore, India, building audio ML projects to qualify for EU master's programs. His target is UPF Barcelona's MSc Sound and Music Computing. Future plan: integration with Neosapiens Neo 1.`;

// ── Classify: quick chat vs complex task ─────────────────────────────────────
const COMPLEX_PATTERNS = [
  /\b(write|create|build|implement|refactor|debug|fix|generate|scaffold)\b/i,
  /\b(code|script|function|class|component|api|endpoint|file|project)\b/i,
  /\b(research|investigate|analyze|compare|in-depth|comprehensive)\b/i,
  /```/,
];

function isComplexTask(text) {
  if (text.length > 2000) return true;
  return COMPLEX_PATTERNS.filter((p) => p.test(text)).length >= 2;
}

// ── Direct API call (fast path) ──────────────────────────────────────────────
async function callLlmApi(text, systemStatus = '') {
  const keysStr = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
  const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
  
  const systemPrompt = SENSEI_SYSTEM_PROMPT + (systemStatus ? `\n\n${systemStatus}` : '');

  if (keys.length > 0) {
    const models = [
      process.env.OPENROUTER_SONNET_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
      process.env.OPENROUTER_FREE_MODEL || 'openrouter/free'
    ];

    let lastErr;
    for (const key of keys) {
      for (const model of models) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Sensei Tutor',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
              ],
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            lastErr = new Error(`OpenRouter API ${response.status}: ${errText.slice(0, 200)}`);
            if (response.status === 429) continue; // Rate limited, try next model/key
            throw lastErr;
          }

          const data = await response.json();
          if (data.error) {
            lastErr = new Error(`OpenRouter API Error (${data.error.code}): ${data.error.message}`);
            const isRateLimit = data.error.code === 429 || 
                                String(data.error.message).toLowerCase().includes('rate') ||
                                String(data.error.message).toLowerCase().includes('limit');
            if (isRateLimit) {
              console.warn(`[sensei] OpenRouter rate limit on ${model}, trying next...`);
              continue; 
            }
            throw lastErr;
          }

          return data.choices?.[0]?.message?.content || 'No response generated.';
        } catch (e) {
          lastErr = e;
        }
      }
    }
    throw lastErr || new Error('All OpenRouter keys and models failed');
  }

  if (!API_KEY) {
    throw new Error('Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY is set');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'No response generated.';
}

// ── Claude Code CLI (complex tasks) ──────────────────────────────────────────
function runClaudeCli(prompt) {
  return new Promise((resolve, reject) => {
    const bin = process.env.CLAUDE_BIN || 'claude';
    const args = ['--print', '--model', CLI_MODEL, prompt];

    const child = spawn(bin, args, {
      cwd: WORKSPACE,
      timeout: CLI_TIMEOUT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (code === 0 || stdout.trim()) {
        resolve(stdout.trim() || 'Task completed.');
      } else {
        reject(new Error(stderr.trim() || `CLI exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`CLI spawn error: ${err.message}`));
    });
  });
}

// ── Main task runner ─────────────────────────────────────────────────────────
export async function runSenseiTask(text, { userId, source } = {}) {
  const inputLower = text.toLowerCase().trim();
  let systemStatusContext = '';

  // Track last activity timestamp and handle commands
  try {
    const r = createClient({ url: 'redis://127.0.0.1:6379' });
    await r.connect();
    await r.set('sensei:last_activity_ts', Math.floor(Date.now() / 1000).toString());

    // Intercept Silence Threshold Change
    if (inputLower.includes('silence threshold') || inputLower.includes('umbral de silencio') || inputLower.includes('silence trigger') || inputLower.includes('cambiar el umbral')) {
      const match = text.match(/\d+/);
      if (match) {
        const seconds = parseInt(match[0], 10);
        if (seconds >= 10 && seconds <= 3600) {
          await r.set('sensei:silence_threshold_sec', seconds.toString());
          await r.disconnect();
          return {
            summary: `Right away, sir. I have set your silence threshold to ${seconds} seconds. I shall check in on you much more promptly now. ¡Entendido, amigo!`,
            complex: false
          };
        } else {
          await r.disconnect();
          return {
            summary: "I'm afraid the silence threshold must be between 10 seconds and 3600 seconds, sir. Let us keep it within reasonable bounds.",
            complex: false
          };
        }
      }
    }

    // Intercept Pomodoro commands
    if (inputLower.includes('start pomodoro') || inputLower.includes('start focus') || inputLower.includes('comenzar pomodoro') || inputLower.includes('iniciar pomodoro')) {
      const nowSec = Math.floor(Date.now() / 1000);
      await r.set('sensei:pomodoro:state', 'focus');
      await r.set('sensei:pomodoro:started_ts', nowSec.toString());
      await r.disconnect();
      return {
        summary: "Right away, sir. I have initiated a twenty-five minute Pomodoro focus session. Let us make every second count. ¡Buena suerte, amigo!",
        complex: false
      };
    }

    if (inputLower.includes('stop pomodoro') || inputLower.includes('cancel pomodoro') || inputLower.includes('detener pomodoro') || inputLower.includes('cancelar pomodoro')) {
      await r.set('sensei:pomodoro:state', 'inactive');
      await r.disconnect();
      return {
        summary: "Understood, Mr. Utkarsh. I have cancelled the active Pomodoro timer. Let me know when you are ready to focus again.",
        complex: false
      };
    }

    if (inputLower.includes('pomodoro status') || inputLower.includes('timer status') || inputLower.includes('estado del pomodoro')) {
      const state = await r.get('sensei:pomodoro:state') || 'inactive';
      if (state === 'inactive') {
        await r.disconnect();
        return {
          summary: "There is no active Pomodoro timer at the moment, sir. Would you like me to start one?",
          complex: false
        };
      }
      const startedTs = parseInt(await r.get('sensei:pomodoro:started_ts') || '0', 10);
      const nowSec = Math.floor(Date.now() / 1000);
      const elapsed = nowSec - startedTs;
      const duration = state === 'focus' ? 1500 : 300;
      const remaining = Math.max(0, duration - elapsed);
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      await r.disconnect();

      if (state === 'focus') {
        return {
          summary: `We are currently in a focus session, sir. There are ${min} minutes and ${sec} seconds remaining. Keep pushing, Mr. Utkarsh!`,
          complex: false
        };
      } else {
        return {
          summary: `We are currently in a break session, Mr. Utkarsh. There are ${min} minutes and ${sec} seconds remaining. Enjoy your rest, amigo!`,
          complex: false
        };
      }
    }

    // Query active heartbeats and statuses for dynamic system status context
    const isMicActive = (await r.get('sensei:heartbeat:mic')) === 'active';
    const isCompanionActive = (await r.get('sensei:heartbeat:companion')) === 'active';
    const isGatewayActive = (await r.get('sensei:heartbeat:gateway')) === 'active';
    const silenceThreshold = (await r.get('sensei:silence_threshold_sec')) || '180';
    const pomoState = (await r.get('sensei:pomodoro:state')) || 'inactive';

    systemStatusContext = `
[SYSTEM STATUS CONTEXT (REAL-TIME)]:
- Microphone Daemon (sensei-listen.py): ${isMicActive ? 'ACTIVE / ONLINE' : 'INACTIVE / OFFLINE'}
- Silence Watcher (sensei-companion.py): ${isCompanionActive ? 'ACTIVE / ONLINE' : 'INACTIVE / OFFLINE'}
- Voice Gateway (port 3848): ${isGatewayActive ? 'ACTIVE / ONLINE' : 'INACTIVE / OFFLINE'}
- Brain Agent (port 3847): ACTIVE / ONLINE (Running this process)
- Pomodoro Timer State: ${pomoState}
- Silence Threshold: ${silenceThreshold} seconds
`;

    await r.disconnect();
  } catch (e) {
    console.error('[pc-agent] Redis checks failed:', e);
  }

  const complex = isComplexTask(text);

  let summary;
  if (complex) {
    console.log(`[sensei] Complex task → Claude CLI: "${text.slice(0, 80)}..."`);
    summary = await runClaudeCli(text);
  } else {
    console.log(`[sensei] Quick query → API: "${text.slice(0, 80)}"`);
    summary = await callLlmApi(text, systemStatusContext);
  }

  // Truncate for voice output
  if (summary.length > 1000) {
    summary = summary.slice(0, 997) + '...';
  }

  return { summary, complex };
}
