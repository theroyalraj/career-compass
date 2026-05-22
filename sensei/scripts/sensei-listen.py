#!/usr/bin/env python3
"""
sensei-listen.py — always-on voice daemon for Sensei AI Tutor.

Listens via microphone using sounddevice, routes commands to pc-agent,
and speaks responses back through sensei-speak.py (ElevenLabs / Edge TTS).

Usage:
  python scripts/sensei-listen.py
  python scripts/sensei-listen.py --list-mics

Requirements:
  pip install SpeechRecognition sounddevice numpy requests

Env vars (reads from .env):
  SENSEI_TTS_VOICE       Edge TTS voice (default: en-US-AndrewMultilingualNeural)
  SENSEI_USER_NAME       spoken address (default: Utkarsh)
  PC_AGENT_URL           pc-agent base URL (default: http://127.0.0.1:3847)
  LISTEN_DEVICE_INDEX    mic device index (default: system default)
  LISTEN_LANGUAGE        speech language (default: en-US)
  LISTEN_PHRASE_LIMIT    max seconds/phrase (default: 10)
  LISTEN_SILENCE_SEC     silence threshold (default: 1.2)
  SENSEI_LISTEN_WAKE     wake word (default: disabled = always-on)
"""

import io
import logging
import os
import random
import signal
import subprocess
import sys
import tempfile
import threading
import time
import wave
from pathlib import Path
from typing import Optional

# ── Load .env ─────────────────────────────────────────────────────────────────
root = Path(__file__).resolve().parent.parent
env_path = root / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#"):
            continue
        i = t.find("=")
        if i < 1:
            continue
        k, v = t[:i].strip(), t[i + 1:].strip()
        if v.startswith('"') and v.endswith('"'):
            v = v[1:-1]
        elif v.startswith("'") and v.endswith("'"):
            v = v[1:-1]
        if k not in os.environ:
            os.environ[k] = v

# ── Config ────────────────────────────────────────────────────────────────────
VOICE = os.environ.get("SENSEI_TTS_VOICE", "en-GB-RyanNeural")
USER_NAME = os.environ.get("SENSEI_USER_NAME", "Utkarsh")
AGENT_URL = os.environ.get("PC_AGENT_URL", "http://127.0.0.1:3847").rstrip("/")
MIC_INDEX = os.environ.get("LISTEN_DEVICE_INDEX")
LANGUAGE = os.environ.get("LISTEN_LANGUAGE", "en-US")
PHRASE_LIMIT = float(os.environ.get("LISTEN_PHRASE_LIMIT", "10"))
SILENCE_SEC = float(os.environ.get("LISTEN_SILENCE_SEC", "1.2"))
ENERGY_THRESHOLD = float(os.environ.get("LISTEN_ENERGY_THRESHOLD", "300"))
WAKE_WORD = os.environ.get("SENSEI_LISTEN_WAKE", "").strip().lower()
SPEAK_SCRIPT = root / "skill-gateway" / "scripts" / "sensei-speak.py"
SAMPLE_RATE = 16000
CHANNELS = 1

MIC_INDEX = int(MIC_INDEX) if MIC_INDEX else None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sensei-listen")

# ── Dependencies ──────────────────────────────────────────────────────────────
try:
    import numpy as np
except ImportError:
    print("ERROR: pip install numpy", file=sys.stderr)
    sys.exit(1)

try:
    import sounddevice as sd
except ImportError:
    print("ERROR: pip install sounddevice", file=sys.stderr)
    sys.exit(1)

try:
    import speech_recognition as sr
except ImportError:
    print("ERROR: pip install SpeechRecognition", file=sys.stderr)
    sys.exit(1)

try:
    import requests as req_lib
except ImportError:
    print("ERROR: pip install requests", file=sys.stderr)
    sys.exit(1)

# ── Event bus (pushes to pc-agent /voice/event → SSE → UI) ───────────────────
def post_event(event_type: str, text: str = ""):
    def _send():
        try:
            h = {"Content-Type": "application/json"}
            secret = os.environ.get("PC_AGENT_SECRET", "").strip()
            if secret:
                h["Authorization"] = f"Bearer {secret}"
            req_lib.post(
                f"{AGENT_URL}/voice/event",
                json={"type": event_type, "text": text},
                timeout=2,
                headers=h,
            )
        except Exception:
            pass
    threading.Thread(target=_send, daemon=True).start()


# ── Speech output ─────────────────────────────────────────────────────────────
_speak_lock = threading.Lock()
_speaking = threading.Event()
_POST_SPEAK_COOLDOWN = 1.5


def speak(text: str, *, on_done=None):
    """Speak text via sensei-speak.py subprocess."""
    log.info("-> speak: %s", text[:80])

    def _run():
        _speaking.set()
        try:
            with _speak_lock:
                try:
                    subprocess.run(
                        [sys.executable, str(SPEAK_SCRIPT), text],
                        capture_output=True,
                        timeout=90,
                        cwd=str(root),
                        creationflags=0x08000000 if os.name == 'nt' else 0,
                    )
                    log.info("speak OK")
                except subprocess.TimeoutExpired:
                    log.warning("speak timed out")
                except Exception as e:
                    log.warning("speak failed: %s", e)
                    _speak_fallback(text)
        finally:
            if on_done:
                try:
                    on_done()
                except Exception:
                    pass
            time.sleep(_POST_SPEAK_COOLDOWN)
            _speaking.clear()

    threading.Thread(target=_run, daemon=True).start()


def _speak_fallback(text: str):
    """Fallback logging if TTS fails."""
    log.warning("Speech output fallback: %s", text)


# ── PC-agent command ──────────────────────────────────────────────────────────
def send_command(text: str) -> str:
    """Send voice command to pc-agent and return the spoken reply."""
    try:
        h = {"Content-Type": "application/json"}
        secret = os.environ.get("PC_AGENT_SECRET", "").strip()
        if secret:
            h["Authorization"] = f"Bearer {secret}"
        r = req_lib.post(
            f"{AGENT_URL}/voice/command",
            json={"text": text, "userId": "sensei-mic-daemon", "source": "voice"},
            timeout=120,
            headers=h,
        )
        r.raise_for_status()
        j = r.json()
        return str(j.get("summary") or j.get("error") or "Done.")
    except req_lib.exceptions.ConnectionError:
        return "Cannot reach Sensei agent. Is pc-agent running on port 3847?"
    except Exception as e:
        return f"Request failed: {e}"


# ── Audio helpers ─────────────────────────────────────────────────────────────
def numpy_to_audio_data(audio_int16: np.ndarray) -> sr.AudioData:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio_int16.tobytes())
    raw = buf.getvalue()
    return sr.AudioData(raw[44:], SAMPLE_RATE, 2)


def record_phrase(mic_idx: int | None) -> np.ndarray | None:
    """Record until silence or phrase limit. Returns int16 numpy array or None."""
    BLOCK = int(SAMPLE_RATE * 0.1)
    THRESHOLD = ENERGY_THRESHOLD
    MAX_CHUNKS = int(PHRASE_LIMIT / 0.1)
    SILENCE_CHUNKS = max(1, int(SILENCE_SEC / 0.1))

    chunks = []
    silent = 0
    speaking_detected = False

    kwargs = {"device": mic_idx} if mic_idx is not None else {}

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS,
                        dtype="int16", blocksize=BLOCK, **kwargs) as stream:
        for _ in range(MAX_CHUNKS):
            block, _ = stream.read(BLOCK)
            block = block.flatten()

            if _speaking.is_set():
                chunks.clear()
                speaking_detected = False
                silent = 0
                continue

            rms = np.sqrt(np.mean(block.astype(np.float32) ** 2))

            if rms > THRESHOLD:
                speaking_detected = True
                silent = 0
                chunks.append(block)
            elif speaking_detected:
                chunks.append(block)
                silent += 1
                if silent >= SILENCE_CHUNKS:
                    break

    if not chunks:
        return None
    return np.concatenate(chunks)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("\n  ┌─────────────────────────────────────────────────────┐")
    print("  │   S E N S E I  —  Voice Daemon  —  Always Listening │")
    print(f"  │   Voice: {VOICE:<22} Agent: {AGENT_URL:<14} │")
    print("  └─────────────────────────────────────────────────────┘\n")

    import redis
    r_heart = None
    try:
        r_heart = redis.Redis(host='127.0.0.1', port=6379, db=0)
    except Exception:
        pass

    recognizer = sr.Recognizer()
    mic_idx = MIC_INDEX

    mode = f"wake-word '{WAKE_WORD}'" if WAKE_WORD else "always-on"
    log.info("Starting (%s) | lang=%s | phrase=%.1fs | silence=%.1fs",
             mode, LANGUAGE, PHRASE_LIMIT, SILENCE_SEC)

    devs = sd.query_devices()
    log.info("Available microphones:")
    for i, d in enumerate(devs):
        if d["max_input_channels"] > 0:
            log.info("  [%d] %s", i, d["name"])

    post_event("daemon_start", "Sensei voice daemon online.")
    speak(f"Sensei online, {USER_NAME}. Ready when you are.")
    post_event("listening", f"Listening, {USER_NAME}.")

    log.info("Listening — speak any time. Ctrl+C to stop.\n")

    mic_errors = 0
    while True:
        try:
            if r_heart:
                try:
                    r_heart.setex("sensei:heartbeat:mic", 30, "active")
                except Exception:
                    pass
            audio = record_phrase(mic_idx)
            mic_errors = 0
        except KeyboardInterrupt:
            break
        except Exception as e:
            mic_errors += 1
            wait = min(2 ** min(mic_errors, 5), 30)
            log.warning("Mic error (attempt %d, retry in %ds): %s", mic_errors, wait, e)
            if mic_errors == 3:
                mic_idx = None
            time.sleep(wait)
            continue

        if audio is None:
            continue

        try:
            audio_data = numpy_to_audio_data(audio)
            openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
            if openai_key:
                # Use Whisper REST API for flawless mixed language STT
                wav_data = audio_data.get_wav_data()
                files = {"file": ("audio.wav", wav_data, "audio/wav")}
                data = {"model": "whisper-1"}
                headers = {"Authorization": f"Bearer {openai_key}"}
                r = req_lib.post("https://api.openai.com/v1/audio/transcriptions", files=files, data=data, headers=headers, timeout=15)
                r.raise_for_status()
                text = r.json().get("text", "")
            else:
                text = recognizer.recognize_google(audio_data, language=LANGUAGE)
        except sr.UnknownValueError:
            continue
        except sr.RequestError as e:
            log.warning("STT error: %s", e)
            speak(f"Speech recognition error, {USER_NAME}. Check internet.")
            time.sleep(2)
            continue
        except Exception as e:
            log.warning("STT Exception: %s", e)
            continue

        text = text.strip()
        if not text:
            continue

        # Wake word filter
        if WAKE_WORD and not text.lower().startswith(WAKE_WORD):
            continue
        if WAKE_WORD:
            text = text[len(WAKE_WORD):].strip(" ,.")

        log.info("► %s", text)
        lower = text.lower().strip()
        post_event("heard", text)

        # Exit commands
        if lower in ("stop", "exit", "quit", "goodbye", "shut down"):
            speak(f"Signing off, {USER_NAME}. Keep pushing forward.")
            break

        # Status ping
        if lower in ("status", "are you there", "hello", "hey sensei", "sensei"):
            speak(f"Right here, {USER_NAME}. What can I help you with?")
            continue

        # Route to agent
        post_event("thinking", "Processing...")
        log.info("Sending to Sensei agent...")
        reply = send_command(text)
        log.info("◄ %s", reply[:120])

        spoken = reply if len(reply) <= 1000 else reply[:997] + "..."
        post_event("reply", spoken)
        speak(
            spoken,
            on_done=lambda: post_event("listening", f"Listening, {USER_NAME}."),
        )

    log.info("Voice daemon stopped.")


if __name__ == "__main__":
    if "--list-mics" in sys.argv:
        print("\nAvailable microphone input devices:\n")
        for i, d in enumerate(sd.query_devices()):
            if d["max_input_channels"] > 0:
                default = " (default)" if i == sd.default.device[0] else ""
                print(f"  [{i:2d}] {d['name']}{default}")
        print(f"\nSet LISTEN_DEVICE_INDEX=<number> in .env to choose one.\n")
        sys.exit(0)
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped.")
