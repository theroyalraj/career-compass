import os, sys, json
from pathlib import Path
import urllib.request

# Load sensei/.env
env_path = Path(__file__).parent / "sensei" / ".env"
for line in env_path.read_text(encoding="utf-8").splitlines():
    t = line.strip()
    if not t or t.startswith("#") or "=" not in t:
        continue
    k, _, v = t.partition("=")
    k = k.strip()
    v = v.split("#")[0].strip().strip('"').strip("'")
    if k:
        os.environ[k] = v

agent_id = os.environ.get("ELEVENLABS_AGENT_ID", "")
el_key   = os.environ.get("ELEVENLABS_API_KEY", "")
ant_key  = os.environ.get("ANTHROPIC_API_KEY", "")
or_key   = os.environ.get("OPENROUTER_API_KEY", "")

results = {}

# 1. ElevenLabs ConvAI signed URL (the key permission we need)
try:
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}",
        headers={"xi-api-key": el_key}
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read())
        results["ElevenLabs ConvAI"] = "OK - signed URL received, convai_write confirmed"
except Exception as e:
    results["ElevenLabs ConvAI"] = f"FAIL - {str(e)[:120]}"

# 2. ElevenLabs account / plan
try:
    req2 = urllib.request.Request(
        "https://api.elevenlabs.io/v1/user",
        headers={"xi-api-key": el_key}
    )
    with urllib.request.urlopen(req2, timeout=8) as r:
        data2 = json.loads(r.read())
        plan = data2.get("subscription", {}).get("tier", "unknown")
        chars = data2.get("subscription", {}).get("character_count", "?")
        limit = data2.get("subscription", {}).get("character_limit", "?")
        results["ElevenLabs Account"] = f"OK - plan={plan}, chars={chars}/{limit}"
except Exception as e:
    results["ElevenLabs Account"] = f"FAIL - {str(e)[:120]}"

# 3. Anthropic key format
if ant_key and ant_key.startswith("sk-ant-") and len(ant_key) > 20:
    results["Anthropic Key"] = "OK - key present and valid format"
else:
    results["Anthropic Key"] = f"WARN - looks like placeholder: {ant_key[:25]}"

# 4. OpenRouter
try:
    req3 = urllib.request.Request(
        "https://openrouter.ai/api/v1/models",
        headers={"Authorization": f"Bearer {or_key}"}
    )
    with urllib.request.urlopen(req3, timeout=8) as r:
        results["OpenRouter"] = "OK - models endpoint reachable"
except Exception as e:
    results["OpenRouter"] = f"FAIL - {str(e)[:80]}"

# 5. Redis
try:
    import redis
    r = redis.Redis(host="127.0.0.1", port=6379, db=0, socket_timeout=3)
    r.ping()
    keys = r.keys("sensei:*")
    results["Redis :6379"] = f"OK - ping success, {len(keys)} sensei keys"
except Exception as e:
    results["Redis :6379"] = f"FAIL - {str(e)[:80]}"

# 6. pc-agent health
try:
    with urllib.request.urlopen("http://127.0.0.1:3847/health", timeout=3) as r:
        results["pc-agent :3847"] = f"OK - {r.read().decode()[:80]}"
except Exception as e:
    results["pc-agent :3847"] = f"FAIL - {str(e)[:80]}"

# 7. skill-gateway health
try:
    with urllib.request.urlopen("http://127.0.0.1:3848/health", timeout=3) as r:
        results["skill-gateway :3848"] = f"OK - {r.read().decode()[:80]}"
except Exception as e:
    results["skill-gateway :3848"] = f"FAIL - {str(e)[:80]}"

# Print results
print()
print("  SENSEI CREDENTIAL + SERVICE CHECK")
print("  " + "=" * 54)
for k, v in results.items():
    if v.startswith("OK"):
        status = "[OK]  "
    elif v.startswith("WARN"):
        status = "[WARN]"
    else:
        status = "[FAIL]"
    print(f"  {status} {k}")
    print(f"         {v}")
print()
