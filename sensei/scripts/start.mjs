#!/usr/bin/env node
/**
 * start.mjs — runs all Sensei services in the current terminal.
 *
 * Services:
 *   [gateway]  voice gateway on :3848
 *   [agent]    sensei agent on :3847
 *   [listener] sensei-listen.py voice daemon
 *
 * Ctrl+C kills all three cleanly.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const COLORS = {
  reset: '\x1b[0m',
  gateway: '\x1b[36m',   // cyan
  agent: '\x1b[33m',     // yellow
  listener: '\x1b[32m',  // green
};

function prefix(name, data) {
  const color = COLORS[name] || '';
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    process.stdout.write(`${color}[${name}]${COLORS.reset} ${line}\n`);
  }
}

const children = [];

function startService(name, cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    ...opts,
  });
  child.stdout.on('data', (d) => prefix(name, d));
  child.stderr.on('data', (d) => prefix(name, d));
  child.on('exit', (code) => {
    prefix(name, `exited (code ${code})`);
  });
  children.push(child);
  return child;
}

console.log('\n  S E N S E I — Starting all services...\n');

// 1. Voice Gateway
startService('gateway', 'node', ['skill-gateway/src/server.js']);

// 2. Agent Server
startService('agent', 'node', ['pc-agent/src/server.js']);

// 3. Voice Listener (after a short delay for servers to start)
setTimeout(() => {
  startService('listener', 'python', ['scripts/sensei-listen.py']);
}, 2000);

// Cleanup on exit
function cleanup() {
  console.log('\n  Shutting down Sensei...');
  for (const child of children) {
    try { child.kill('SIGTERM'); } catch {}
  }
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
