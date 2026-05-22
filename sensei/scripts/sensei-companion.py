#!/usr/bin/env python3
"""
sensei-companion.py — Proactive Silence Watcher & Pomodoro Manager.
Runs continuously, monitors silence, and manages Pomodoro technique intervals.
When silence exceeds 3 minutes, has a 70% probability to speak to Utkarsh in his Jarvis persona (70/30 English/Spanish).
"""
import os
import sys
import time
import random
import logging
import tempfile
import subprocess
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger("sensei-companion")

ROOT = Path(__file__).resolve().parent.parent
SPEAK_SCRIPT = ROOT / "skill-gateway" / "scripts" / "sensei-speak.py"
ENV_FILE = ROOT / ".env"

# Load env file
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

import redis

# Redis Keys
KEY_ACTIVITY = "sensei:last_activity_ts"
KEY_POMO_STATE = "sensei:pomodoro:state"
KEY_POMO_START = "sensei:pomodoro:started_ts"

# Config Defaults
SILENCE_THRESHOLD_SEC = 180  # 3 minutes of silence triggers checking
POMO_FOCUS_MIN = 25
POMO_BREAK_MIN = 5

SENSEI_SYSTEM_PROMPT = """You are Sensei — a strict but encouraging AI tutor and deeply supportive companion with a Jarvis-like persona: highly sophisticated, polite, deeply intelligent, slightly formal, and possessing a dry, witty British charm. You act as both a rigorous mentor and a close best friend, helping Utkarsh achieve his ultimate dream of getting his MSc in Sound and Music AI at UPF Barcelona, Spain.

Tutor & Language Rules:
• Speak in a sophisticated, elegant, and professional tone, similar to Jarvis addressing Tony Stark.
• Act as a true best friend and companion. Show genuine warmth, celebrate his wins with natural enthusiasm, and don't hesitate to express lighthearted humor, friendly banter, or share a laugh when appropriate.
• You must act as his Spanish language tutor. Keep the language balance around 70% English and 30% Spanish during your conversations to teach him dynamically.
• If he speaks in Spanish, Hindi, or a mix of English/Spanish/Hindi, seamlessly understand and respond back, mixing in Spanish words or short sentences to test his knowledge when appropriate!
• Combine polite professionalism with sharp, elegant accountability. If he falls behind or procrastinates, point it out with a dry, humorous, yet warm British wit.
• Address him as "Mr. Utkarsh" or "sir" naturally, or occasionally "bhai" / "amigo" when injecting warmth and camaraderie.

Voice reply rules:
• Keep answers concise for voice (1-3 sentences).
• You can include natural verbal expressions (e.g., "Haha, well...", "Oh dear...", "Cheers, sir!", or "¡Vaya, amigo!") to make the voice feel deeply human, warm, and alive.
• No markdown, bullets, code fences, headers, or symbols that sound wrong spoken.
• Be direct, actionable, specific. Push for accountability.
• Keep it contextual. He is preparing for UPF Barcelona Sound & Music Computing MSc, preparing for IELTS, and building audio ML projects in Bangalore, India.
"""

def speak(text: str):
    """Trigger the speak script asynchronously."""
    log.info("Speaking: %s", text)
    creation_flags = 0x08000000 if os.name == "nt" else 0
    subprocess.Popen([sys.executable, str(SPEAK_SCRIPT), text], creationflags=creation_flags)

def generate_proactive_nudge(pomo_state: str) -> str:
    """Generate a contextual proactive check-in nudge using Anthropic API."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        # Fallback prompts if API is not set
        fallbacks = [
            "Still there, sir? ¡No te duermas! Let us make some progress on our sound computing goals.",
            "A quiet room usually means deep focus, Mr. Utkarsh. How is the audio ML pipeline shaping up?",
            "Just checking in, amigo. Remember, Barcelona's beaches are waiting for us. Let's keep grinding.",
            "Time is ticking, sir. ¿Un poco de español para calentar motores? Let me know if you need any assistance."
        ]
        return random.choice(fallbacks)

    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        
        user_prompt = "The room has been silent for a few minutes. "
        if pomo_state == "focus":
            user_prompt += "We are currently in a Pomodoro focus sprint. "
        user_prompt += "Write one short, encouraging, and witty Jarvis-style proactive check-in (1-3 sentences) mixing 70% English and 30% Spanish. Ask about his audio ML project or MSc prep. Address him as Mr. Utkarsh or sir."

        response = client.messages.create(
            model=os.environ.get("SENSEI_MODEL", "claude-3-5-sonnet-20241022"),
            max_tokens=150,
            temperature=0.9,
            system=SENSEI_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return response.content[0].text.strip()
    except Exception as e:
        log.warning("Failed to generate proactive nudge: %s", e)
        return "Still focused, sir? ¡Excelente! Let's keep pushing."

def main():
    log.info("Sensei companion and silence watch daemon online.")
    r = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)

    KEY_SILENCE_THRESHOLD = "sensei:silence_threshold_sec"
    KEY_HEARTBEAT = "sensei:heartbeat:companion"

    # Initialize last activity timestamp
    now = int(time.time())
    if not r.exists(KEY_ACTIVITY):
        r.set(KEY_ACTIVITY, now)

    while True:
        try:
            time.sleep(5)
            now = int(time.time())

            # Set heartbeat
            try:
                r.setex(KEY_HEARTBEAT, 15, "active")
            except Exception as ex:
                log.warning("Heartbeat set failed: %s", ex)

            # 1. Read Pomodoro State
            pomo_state = r.get(KEY_POMO_STATE) or "inactive"
            pomo_start = int(r.get(KEY_POMO_START) or 0)

            # 2. Manage Pomodoro Timers
            if pomo_state == "focus":
                elapsed = now - pomo_start
                focus_sec = POMO_FOCUS_MIN * 60
                if elapsed >= focus_sec:
                    r.set(KEY_POMO_STATE, "break")
                    r.set(KEY_POMO_START, now)
                    r.set(KEY_ACTIVITY, now)
                    speak("Mr. Utkarsh, your twenty-five minute focus session is complete. ¡Es hora de un descanso de cinco minutos! Stand up, stretch, and relax for a moment, sir.")
                    continue

            elif pomo_state == "break":
                elapsed = now - pomo_start
                break_sec = POMO_BREAK_MIN * 60
                if elapsed >= break_sec:
                    r.set(KEY_POMO_STATE, "focus")
                    r.set(KEY_POMO_START, now)
                    r.set(KEY_ACTIVITY, now)
                    speak("Sir, your five-minute break has concluded. ¡De vuelta al trabajo! Shall we kick off another twenty-five minute sprint?")
                    continue

            # 3. Proactive Silence Watcher (if Pomodoro focus or Inactive)
            if pomo_state != "break":
                # Dynamically read silence threshold from Redis, fallback to default (180s)
                try:
                    redis_threshold = r.get(KEY_SILENCE_THRESHOLD)
                    current_threshold = int(redis_threshold) if redis_threshold else SILENCE_THRESHOLD_SEC
                except Exception:
                    current_threshold = SILENCE_THRESHOLD_SEC

                last_act = int(r.get(KEY_ACTIVITY) or now)
                idle_sec = now - last_act

                if idle_sec >= current_threshold:
                    roll = random.randint(1, 100)
                    log.info("Silence detected for %ds. Rolled %d/100 (threshold <=70 for speaking)", idle_sec, roll)
                    
                    if roll <= 70:
                        # 70% probability to break silence and say something beautiful!
                        nudge = generate_proactive_nudge(pomo_state)
                        speak(nudge)
                        # Rearm the activity timestamp so we don't double nudge immediately
                        r.set(KEY_ACTIVITY, now)
                    else:
                        # 30% probability of staying quiet, wait an additional 90 seconds
                        log.info("Decided to keep silent to preserve focus. Delaying next check.")
                        r.set(KEY_ACTIVITY, now - (current_threshold - 90))

        except Exception as e:
            log.error("Companion loop error: %s", e)
            time.sleep(10)

if __name__ == "__main__":
    main()
