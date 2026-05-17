# Sensei — AI Tutor Voice Assistant

> A strict but encouraging AI tutor that coaches you via voice toward your career goals.

---

## What it is

Sensei is a voice-driven AI tutor built on top of Claude. It listens via microphone, processes commands through the Anthropic API (for quick responses) or Claude Code CLI (for complex tasks), and speaks back using ElevenLabs (short responses) or Edge TTS (longer ones).

## Architecture

```
[Microphone] → sensei-listen.py → pc-agent (:3847) → Claude API / CLI
                                        ↓
                                  sensei-speak.py → [Speaker]
                                        ↓
                               Web UI (SSE stream)
```

## Quick Start

```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies
pip install SpeechRecognition sounddevice numpy requests edge-tts

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, etc.

# 4. Start all services
npm run start:all
```

## Individual Services

```bash
# Voice gateway only (port 3848)
npm run start:gateway

# Agent server only (port 3847)
npm run start:agent

# Voice daemon only (requires agent running)
npm run voice:daemon

# List available microphones
python scripts/sensei-listen.py --list-mics
```

## Configuration

See `.env.example` for all available options. Key settings:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key (required) |
| `ELEVENLABS_API_KEY` | Premium voice for short responses |
| `ELEVENLABS_MAX_CHARS` | Threshold for ElevenLabs vs Edge TTS (default: 200) |
| `SENSEI_TTS_VOICE` | Edge TTS voice name |
| `SENSEI_USER_NAME` | How Sensei addresses you |
| `SENSEI_LISTEN_WAKE` | Wake word (empty = always-on) |

## TTS Strategy

- **Under 200 chars** → ElevenLabs (expressive, high quality)
- **Over 200 chars** → Edge TTS (free, fast, neural voice)
- **Fallback** → Windows SAPI (offline)

## Project Structure

```
sensei/
├── scripts/
│   └── sensei-listen.py      # Always-on mic daemon
│   └── start.mjs             # Start all services
├── skill-gateway/
│   ├── scripts/
│   │   └── sensei-speak.py   # TTS engine (ElevenLabs + Edge)
│   └── src/
│       └── server.js         # Voice gateway (:3848)
├── pc-agent/
│   ├── src/
│   │   ├── server.js         # Agent server (:3847)
│   │   └── senseiAgent.js    # AI routing (API vs CLI)
│   └── public/               # Web UI static files
├── .env.example              # Configuration template
├── CLAUDE.md                 # Tutor persona & context
└── package.json              # Monorepo workspace
```
