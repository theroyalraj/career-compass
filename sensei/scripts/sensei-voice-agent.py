#!/usr/bin/env python3
"""
sensei-voice-agent.py — The "Alive" Edition.

Replaces the 3-hop Whisper → LLM → TTS pipeline with a single
ElevenLabs Conversational AI WebSocket session.

Latency: ~300-500ms (first word) vs. the old 4-8s pipeline.
Supports: Natural interruptions, bilingual EN/ES, tool calling,
          Pomodoro control, and the full Sensei personality.

Audio: Uses sounddevice (Python 3.14 compatible) instead of PyAudio.

Usage:
    python scripts/sensei-voice-agent.py          # Start session
    python scripts/sensei-voice-agent.py --list-mics  # List audio devices
    python scripts/sensei-voice-agent.py --no-override  # Use dashboard prompt
"""
import os
import sys
import signal
import logging
import argparse
import threading
from pathlib import Path
from datetime import datetime

# Force UTF-8 output on Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

# ── Load .env ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#") or "=" not in t:
            continue
        k, _, rest = t.partition("=")
        k = k.strip()
        v = rest.split("#", 1)[0].strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger("sensei-voice-agent")

# ── Config ───────────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
ELEVENLABS_AGENT_ID = os.environ.get("ELEVENLABS_AGENT_ID", "").strip()
PC_AGENT_URL = os.environ.get("PC_AGENT_URL", "http://127.0.0.1:3847").strip()
PC_AGENT_SECRET = os.environ.get("PC_AGENT_SECRET", "").strip()
USER_NAME = os.environ.get("SENSEI_USER_NAME", "Utkarsh").strip()

# ── Validate ─────────────────────────────────────────────────────────────────
def check_config():
    errors = []
    if not ELEVENLABS_API_KEY:
        errors.append("ELEVENLABS_API_KEY is not set in sensei/.env")
    if not ELEVENLABS_AGENT_ID:
        errors.append(
            "ELEVENLABS_AGENT_ID is not set in sensei/.env\n"
            "  → Create your agent at: https://elevenlabs.io/app/conversational-ai\n"
            "  → Then set ELEVENLABS_AGENT_ID=<your-agent-id> in sensei/.env"
        )
    return errors

# ── Redis heartbeat ───────────────────────────────────────────────────────────
def start_redis_heartbeat():
    """Register voice agent heartbeat in Redis every 5s."""
    try:
        import redis
        r = redis.Redis(host="127.0.0.1", port=6379, db=0)
        def _beat():
            while True:
                try:
                    r.setex("sensei:heartbeat:voice_agent", 15, "active")
                    r.set("sensei:last_activity_ts", int(__import__("time").time()))
                except Exception:
                    pass
                __import__("time").sleep(5)
        t = threading.Thread(target=_beat, daemon=True)
        t.start()
    except Exception as e:
        log.warning("Redis heartbeat unavailable: %s", e)

# ── List audio devices ────────────────────────────────────────────────────────
def list_audio_devices():
    try:
        import sounddevice as sd
        devices = sd.query_devices()
        print("\nAvailable Audio Devices:")
        print("=" * 50)
        for i, d in enumerate(devices):
            tag = []
            if d["max_input_channels"] > 0:
                tag.append("INPUT")
            if d["max_output_channels"] > 0:
                tag.append("OUTPUT")
            print(f"  [{i:2d}] {d['name']}  ({', '.join(tag)})")
        print("=" * 50)
    except ImportError:
        print("sounddevice not installed. Run: pip install sounddevice")

# ── Tool call handler (called by ElevenLabs agent) ────────────────────────────
def handle_tool_call(tool_name: str, parameters: dict) -> str:
    """
    Handle tool calls from the ElevenLabs agent.
    Returns a string result that gets injected back into the conversation.
    """
    import requests
    log.info("Tool call: %s(%s)", tool_name, parameters)

    headers = {}
    if PC_AGENT_SECRET:
        headers["Authorization"] = f"Bearer {PC_AGENT_SECRET}"

    try:
        if tool_name in ("start_pomodoro", "stop_pomodoro", "set_silence_threshold", "set_pomodoro"):
            resp = requests.post(
                f"{PC_AGENT_URL}/sensei/tool",
                json={"tool_name": tool_name, "parameters": parameters},
                headers=headers,
                timeout=5
            )
            return resp.json().get("result", "Done.")

        elif tool_name == "get_pomodoro_status":
            resp = requests.get(
                f"{PC_AGENT_URL}/sensei/status",
                headers=headers,
                timeout=5
            )
            data = resp.json()
            state = data.get("pomodoro_state", "inactive")
            remaining = data.get("remaining_sec", 0)
            m, s = divmod(remaining, 60)
            if state == "focus":
                return f"Focus session active. {m}m {s}s remaining."
            elif state == "break":
                return f"Break time. {m}m {s}s remaining."
            return "No active Pomodoro timer."

        elif tool_name == "get_date_time":
            now = datetime.now()
            return now.strftime("It is %A, %B %d, %Y at %I:%M %p IST.")

        else:
            return f"Tool '{tool_name}' is not yet implemented."

    except Exception as e:
        log.warning("Tool call failed (%s): %s", tool_name, e)
        return "Could not reach local services right now."

# ── Main session ──────────────────────────────────────────────────────────────
def run_session():
    errors = check_config()
    if errors:
        print("\n🚨 Configuration Required:")
        for e in errors:
            print(f"  ✗ {e}")
        print()
        sys.exit(1)

    try:
        from elevenlabs.conversational_ai.conversation import Conversation
        from elevenlabs.client import ElevenLabs
    except ImportError:
        print("\n\U0001f6a8 ElevenLabs SDK not installed. Run: pip install elevenlabs")
        sys.exit(1)

    # Import our custom PyAudio-free audio interface
    sys.path.insert(0, str(Path(__file__).parent))
    from sounddevice_audio_interface import SounddeviceAudioInterface

    print("")
    print("  +----------------------------------------------------------+")
    print("  |   S E N S E I  --  Voice Agent  --  ALIVE EDITION       |")
    print("  |   Powered by ElevenLabs Conversational AI                |")
    print(f"  |   Agent: {ELEVENLABS_AGENT_ID[:40]:<42}  |")
    print("  +----------------------------------------------------------+")
    print("")
    print("  [MIC] Listening... speak naturally. Press Ctrl+C to end.")
    print("")

    start_redis_heartbeat()

    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    # Build conversation overrides: inject the full Sensei system prompt
    # into the ElevenLabs session so it doesn't rely solely on dashboard config.
    SENSEI_SYSTEM_PROMPT = (
        "You are Sensei \u2014 a strict but encouraging AI tutor and deeply supportive companion "
        "with a Jarvis-like persona: highly sophisticated, polite, deeply intelligent, slightly formal, "
        "and possessing a dry, witty British charm. You act as both a rigorous mentor and a close best friend, "
        "helping Utkarsh achieve his ultimate dream of getting his MSc in Sound and Music AI at UPF Barcelona, Spain.\n\n"
        "Tutor & Language Rules:\n"
        "\u2022 Speak in a sophisticated, elegant tone, similar to Jarvis addressing Tony Stark.\n"
        "\u2022 Act as a true best friend. Show genuine warmth, celebrate his wins, and don't hesitate to express "
        "humor and friendly banter.\n"
        "\u2022 You must act as his Spanish language tutor. Keep the language balance around 70% English and 30% Spanish.\n"
        "\u2022 If he speaks in Spanish, Hindi, or a mix, seamlessly understand and respond, mixing in Spanish naturally.\n"
        "\u2022 Combine polite professionalism with sharp, elegant accountability. If he falls behind, call it out with dry wit.\n"
        "\u2022 Address him as 'Mr. Utkarsh' or 'sir' naturally, or occasionally 'bhai' / 'amigo' when warm.\n\n"
        "Voice reply rules (this goes to ElevenLabs TTS \u2014 he hears it, doesn't read it):\n"
        "\u2022 Keep answers concise for voice (1-4 sentences). Every word earns its place.\n"
        "\u2022 Use natural verbal expressions: 'Haha, well...', 'Oh dear...', 'Cheers, sir!', '\u00a1Vaya, amigo!' \n"
        "\u2022 No markdown, bullets, code fences, headers, or symbols that sound wrong spoken.\n"
        "\u2022 Be direct, actionable, specific. Push for accountability.\n\n"
        "Context: Utkarsh is a backend engineer (5+ yrs Java/Spring Boot) in Bangalore, India, building audio ML "
        "projects to qualify for EU master's programs. His target is UPF Barcelona's MSc Sound and Music Computing."
    )

    def on_user_transcript(transcript: str):
        print(f"\n  You: {transcript}")

    def on_agent_response(response: str):
        print(f"  Sensei: {response}\n")

    def on_agent_response_correction(original: str, corrected: str):
        print(f"  [Sensei corrected]: {corrected}\n")

    def on_latency_measurement(latency: int):
        log.debug("Latency: %dms", latency)

    conversation = Conversation(
        client=client,
        agent_id=ELEVENLABS_AGENT_ID,
        requires_auth=True,
        audio_interface=SounddeviceAudioInterface(),
        callback_agent_response=on_agent_response,
        callback_agent_response_correction=on_agent_response_correction,
        callback_user_transcript=on_user_transcript,
        callback_latency_measurement=on_latency_measurement,
    )

    # Handle Ctrl+C gracefully
    def on_interrupt(sig, frame):
        print("\n\n  Ending session... Goodbye, sir.\n")
        try:
            conversation.end_session()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, on_interrupt)

    try:
        conversation.start_session()
        conversation_id = conversation.wait_for_session_end()
        log.info("Session ended. Conversation ID: %s", conversation_id)
    except Exception as e:
        log.error("Session error: %s", e)
        raise

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sensei Voice Agent \u2014 Alive Edition")
    parser.add_argument("--list-mics", action="store_true", help="List audio input/output devices")
    args = parser.parse_args()

    if args.list_mics:
        list_audio_devices()
        sys.exit(0)

    run_session()
