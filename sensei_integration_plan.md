# Sensei AI Integration Plan

## 1. Project Initialization & Pruning
- **Copy Directory**: Copy `D:\code\openclaw` to `e:\career\career-compass\sensei`, excluding `.git`, `node_modules`, and cache directories to keep it clean.
- **Remove "Nonsense"**:
  - Delete Alexa skills (`skill/`, `alexa-lambda-python/`).
  - Delete ambient scripts (`friday-ambient.py`, `friday-play.py`) that play random music and talk about cricket/news.
  - Delete WhatsApp and external non-essential integrations if they aren't needed.
  - Remove irrelevant npm scripts from `package.json`.
- **Rename**: Rename core scripts and references from "Friday" and "OpenClaw" to "Sensei".

## 2. Interactive Voice Architecture
- **Voice Input**: Keep `friday-listen.py` (rename to `sensei-listen.py`) as the background mic daemon to capture voice commands.
- **Voice Output (TTS)**:
  - Modify the TTS script (`sensei-speak.py`) to primarily use **ElevenLabs** for high-quality, expressive tutor voices.
  - Implement a **fallback to Edge TTS** (which was the default in OpenClaw) in case of API failure, quota limits, or network issues.
  - Add `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` to `.env`.

## 3. Tutor Persona & Context Indexing
- **System Prompting**: Update the AI agent's system prompt (in `pc-agent` and `.cursor/rules`) to adopt the persona of a strict but encouraging "Tutor".
- **Context Awareness**: 
  - Ensure the AI reads the `Barcelona_MSc_Execution_PLAN.md` and the user's "dream" (UPF Master's in Sound and Music Computing).
  - Modify the agent's working directory context so it is fully aware of the `e:\career\career-compass` structure.

## 4. Open Questions for the User
1. **N8N / Workflows**: Do you want to keep the `n8n` integration (which was used for webhooks and automations in OpenClaw), or should we strip Sensei down to just Voice -> Agent -> Voice?
2. **UI Integration**: Should Sensei only live in the terminal/background, or do you want a web UI component for Sensei built into your Career Compass Next.js app (e.g., a "Talk to Sensei" button)?
3. **ElevenLabs Cost**: ElevenLabs can be costly. Do you want to restrict it to shorter responses, or use it for everything?
4. **Claude API vs Local**: Are we continuing to use Claude Code CLI under the hood, or do you want to route the LLM calls directly to an API (like OpenAI or Anthropic directly) for faster tutor response times without necessarily executing code every time?

## 5. Execution Steps
1. Run `robocopy` to copy the files safely.
2. Clean out the directories as outlined in Step 1.
3. Rewrite the TTS Python script for ElevenLabs + Edge TTS.
4. Update the prompts and workspace targets.
5. Test the voice daemon.
