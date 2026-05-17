#!/usr/bin/env python3
"""
sensei-speak.py — TTS for Sensei AI Tutor.

Uses ElevenLabs for short responses (under ELEVENLABS_MAX_CHARS) for high-quality
expressive voice, falls back to Edge TTS for longer responses or when ElevenLabs
is unavailable (quota, network, API error).

Usage:
  python sensei-speak.py "Great progress today. Keep it up."
  python sensei-speak.py --output out.mp3 "Text"

Env vars:
  ELEVENLABS_API_KEY        ElevenLabs API key (required for premium voice)
  ELEVENLABS_VOICE_ID       ElevenLabs voice ID (default: pNInz6obpgDQGcFmaJgB - Adam)
  ELEVENLABS_MAX_CHARS      Max chars for ElevenLabs (default: 200, longer uses Edge TTS)
  ELEVENLABS_MODEL_ID       Model (default: eleven_multilingual_v2)
  SENSEI_TTS_VOICE          Edge TTS voice (default: en-US-AndrewMultilingualNeural)
  SENSEI_TTS_RATE           Edge TTS rate (default: +5%)
  SENSEI_TTS_DEVICE         Audio output device substring (default: system default)
"""

import asyncio
import hashlib
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import time
import warnings
from pathlib import Path

# ── Load .env ─────────────────────────────────────────────────────────────────
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _REPO_ROOT / ".env"
if _ENV_FILE.exists():
    for line in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#") or "=" not in t:
            continue
        k, _, rest = t.partition("=")
        k = k.strip()
        v = rest.split("#", 1)[0].strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v

# Windows asyncio fix for edge-tts
if platform.system() == "Windows":
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", DeprecationWarning)
        try:
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        except AttributeError:
            pass

# ── Config ────────────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "onwK4e9ZLuTAKqWW03F9")
ELEVENLABS_MAX_CHARS = int(os.environ.get("ELEVENLABS_MAX_CHARS", "200"))
ELEVENLABS_MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

EDGE_VOICE = os.environ.get("SENSEI_TTS_VOICE", "en-GB-RyanNeural")
EDGE_RATE = os.environ.get("SENSEI_TTS_RATE", "+5%")
DEVICE_HINT = os.environ.get("SENSEI_TTS_DEVICE", "").strip()

cache_env = os.environ.get("SENSEI_TTS_CACHE", "").strip()
if cache_env:
    CACHE_DIR = Path(cache_env)
else:
    CACHE_DIR = Path(tempfile.gettempdir()) / "sensei-tts-cache"

CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _cache_path(text: str, engine: str) -> Path:
    h = hashlib.sha256(f"{engine}:{text.strip().lower()}".encode()).hexdigest()[:16]
    return CACHE_DIR / f"{engine}_{h}.mp3"


# ── ElevenLabs TTS ────────────────────────────────────────────────────────────
def speak_elevenlabs(text: str, output_path: Path) -> bool:
    """Generate speech with ElevenLabs. Returns True on success."""
    if not ELEVENLABS_API_KEY:
        return False
    try:
        import requests
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
        }
        data = {
            "text": text,
            "model_id": ELEVENLABS_MODEL_ID,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.3,
            },
        }
        r = requests.post(url, json=data, headers=headers, timeout=30)
        if r.status_code == 200:
            output_path.write_bytes(r.content)
            return True
        else:
            print(f"ElevenLabs error {r.status_code}: {r.text[:100]}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"ElevenLabs failed: {e}", file=sys.stderr)
        return False


# ── Edge TTS ──────────────────────────────────────────────────────────────────
def speak_edge_tts(text: str, output_path: Path) -> bool:
    """Generate speech with Edge TTS. Returns True on success."""
    try:
        import edge_tts

        async def _generate():
            communicate = edge_tts.Communicate(text, EDGE_VOICE, rate=EDGE_RATE)
            await communicate.save(str(output_path))

        asyncio.run(_generate())
        return output_path.exists() and output_path.stat().st_size > 0
    except Exception as e:
        print(f"Edge TTS failed: {e}", file=sys.stderr)
        return False


# ── Playback ──────────────────────────────────────────────────────────────────
def _find_ffplay() -> str | None:
    return shutil.which("ffplay") or shutil.which("ffplay.exe")


def play_audio(mp3_path: Path):
    """Play MP3 file using ffplay or Windows media player."""
    ffplay = _find_ffplay()
    creation_flags = 0x08000000 if platform.system() == "Windows" else 0

    if ffplay:
        cmd = [ffplay, "-nodisp", "-autoexit", "-loglevel", "error", str(mp3_path)]
        subprocess.run(cmd, capture_output=True, timeout=120, creationflags=creation_flags)
        return

    if platform.system() == "Windows":
        # System.Media.SoundPlayer only supports WAV. We use System.Windows.Media.MediaPlayer for native MP3 support.
        cmd = [
            "powershell", "-NoProfile", "-Command",
            "Add-Type -AssemblyName PresentationCore; "
            f"$player = New-Object System.Windows.Media.MediaPlayer; "
            f"$player.Open('{mp3_path}'); "
            f"$player.Play(); "
            "Start-Sleep -Seconds 12"
        ]
        subprocess.run(cmd, capture_output=True, timeout=120, creationflags=creation_flags)
        return

    if platform.system() == "Darwin":
        subprocess.run(["afplay", str(mp3_path)], capture_output=True, timeout=120)
        return

    print("No audio player found. Install ffmpeg for playback.", file=sys.stderr)


# ── Main logic ────────────────────────────────────────────────────────────────
def speak_raw(text: str, output_path: str | None = None):
    """Speak text using ElevenLabs (short) or Edge TTS (long), with caching."""
    text = text.strip()
    if not text:
        return

    use_elevenlabs = (
        ELEVENLABS_API_KEY
        and len(text) <= ELEVENLABS_MAX_CHARS
    )
    engine = "elevenlabs" if use_elevenlabs else "edge"

    # Check cache
    cached = _cache_path(text, engine)
    if cached.exists() and cached.stat().st_size > 0:
        if output_path:
            shutil.copy2(cached, output_path)
        else:
            play_audio(cached)
        return

    # Generate
    tmp = Path(tempfile.gettempdir()) / f"sensei-tts-{int(time.time() * 1000)}.mp3"
    success = False

    if use_elevenlabs:
        success = speak_elevenlabs(text, tmp)
        if not success:
            # Fallback to Edge TTS
            engine = "edge"
            success = speak_edge_tts(text, tmp)
    else:
        success = speak_edge_tts(text, tmp)

    if not success:
        print("TTS Generation failed completely.", file=sys.stderr)
        return

    # Cache the result
    if CACHE_DIR and tmp.exists():
        try:
            shutil.copy2(tmp, _cache_path(text, engine))
        except OSError:
            pass

    # Output or play
    if output_path:
        shutil.move(str(tmp), output_path)
    else:
        play_audio(tmp)
        tmp.unlink(missing_ok=True)


def speak(text: str, output_path: str | None = None):
    """Speak text with a Redis distributed lock to serialize playback across processes."""
    import redis
    import uuid

    try:
        r = redis.Redis(host='127.0.0.1', port=6379, db=0, socket_timeout=5)
        lock_key = "sensei:voice_lock"
        lock_value = str(uuid.uuid4())
        lock_ttl_sec = 600  # 10-minute lock TTL

        acquired = False
        start_time = time.time()
        timeout_sec = 600  # 10 minutes wait queue window

        while not acquired:
            try:
                acquired = r.set(lock_key, lock_value, ex=lock_ttl_sec, nx=True)
            except redis.exceptions.ConnectionError:
                # If Redis connection fails/times out, bubble it up to trigger direct speak fallback
                raise

            if acquired:
                break

            if time.time() - start_time > timeout_sec:
                print("Error: Could not acquire voice lock within 10 minutes.", file=sys.stderr)
                return

            time.sleep(0.1)

        try:
            speak_raw(text, output_path)
        finally:
            release_lua = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """
            try:
                r.eval(release_lua, 1, lock_key, lock_value)
            except Exception:
                pass

    except Exception as e:
        # Fallback if Redis is completely unreachable/not installed (graceful degradation)
        print(f"[sensei-speak] Redis lock offline ({e}). Speaking directly...", file=sys.stderr)
        speak_raw(text, output_path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Sensei TTS")
    parser.add_argument("text", nargs="?", help="Text to speak")
    parser.add_argument("--output", "-o", help="Save MP3 to path instead of playing")
    parser.add_argument("--stdout", action="store_true", help="Pipe MP3 to stdout")
    args = parser.parse_args()

    if not args.text:
        if not sys.stdin.isatty():
            args.text = sys.stdin.read().strip()
        else:
            parser.error("No text provided")

    if args.stdout:
        tmp = Path(tempfile.gettempdir()) / "sensei-stdout.mp3"
        speak(args.text, output_path=str(tmp))
        if tmp.exists():
            sys.stdout.buffer.write(tmp.read_bytes())
            tmp.unlink(missing_ok=True)
    else:
        speak(args.text, output_path=args.output)
