/**
 * Direct pc-agent intake — routes voice commands to the Sensei agent.
 */
import crypto from 'node:crypto';

const PC_AGENT_URL = (process.env.PC_AGENT_URL || 'http://127.0.0.1:3847').replace(/\/$/, '');
const PC_AGENT_SECRET = (process.env.PC_AGENT_SECRET || '').trim();

/** @returns {boolean} Always true for Sensei (no N8N layer). */
export function useDirectIntake() {
  return true;
}

/**
 * @param {object} payload - { commandText, userId, correlationId, source }
 * @param {{ info: Function, warn: Function, error: Function }} reqLog
 */
export async function enqueueDirectToPcAgent(payload, reqLog) {
  const t0 = Date.now();
  const cmd = String(payload.commandText ?? '').trim();
  if (!cmd) {
    reqLog.warn('intake: empty commandText');
    return;
  }

  if (!PC_AGENT_SECRET) {
    reqLog.error('intake: PC_AGENT_SECRET not set');
    return;
  }

  const body = {
    text: cmd,
    userId: payload.userId || 'sensei-voice',
    correlationId: payload.correlationId || crypto.randomUUID(),
    source: String(payload.source || 'voice-gateway').slice(0, 48),
  };

  try {
    const r = await fetch(`${PC_AGENT_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PC_AGENT_SECRET}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json().catch(() => ({}));
    reqLog.info(
      { pcStatus: r.status, ok: Boolean(data.ok), ms: Date.now() - t0 },
      'sensei agent task completed',
    );
  } catch (e) {
    reqLog.error({ err: String(e.message || e), ms: Date.now() - t0 }, 'agent intake failed');
  }
}
