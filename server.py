#!/usr/bin/env python3
"""Serve the demo locally and generate the bounded hidden-ending voice line."""

import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RUNTIME = ROOT / "audio" / "runtime"
FALLBACK_TEXT = "You saw the pattern. That will have to be enough."


def load_env():
    path = ROOT / ".env"
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def post_json(url, payload, headers, timeout=45):
    request = urllib.request.Request(url, json.dumps(payload).encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read(), response.headers.get("Content-Type", "")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Upstream HTTP {error.code}: {detail[:500]}") from error


def extract_output_text(response):
    if isinstance(response.get("output_text"), str):
        return response["output_text"]
    for item in response.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                return content.get("text", "")
    raise RuntimeError("OpenAI returned no text output.")


def validate_line(raw):
    line = re.sub(r"\s+", " ", raw).strip().strip('"“”')
    if not line or "\n" in raw or len(line.split()) > 15 or len(line) > 140:
        raise RuntimeError("Generated line failed length validation.")
    if any(mark in line for mark in ("[", "]", "{", "}", "<", ">")):
        raise RuntimeError("Generated line contains disallowed formatting.")
    return line


def generate_line(state):
    prompt = (
        "Write exactly one line spoken by a calm, dry exorcist directly to a hostile ghost. "
        "The player has solved the bell-and-key ritual, and the exorcist is about to seal the ghost. "
        "Maximum 15 words. No quotation marks, stage directions, narration, names, questions, or new lore. "
        "Do not mention the chief, claim anyone owns the bell, address the player, or use first-person pronouns. "
        "Sound quietly triumphant and decisive. "
        f"Game state: cycle={state['cycleCount']}; previous failure={state['previousFailure']}; "
        f"bell returned={state['bellReturned']}; ghost previously exposed={state['ghostExposed']}."
    )
    body, _ = post_json(
        "https://api.openai.com/v1/responses",
        {
            "model": os.environ.get("OPENAI_MODEL", "gpt-5.6-luna"),
            "input": prompt,
            "reasoning": {"effort": "none"},
            "max_output_tokens": 40,
        },
        {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"},
    )
    return validate_line(extract_output_text(json.loads(body)))


def generate_voice(line):
    voice_id = os.environ["EXORCIST_VOICE_ID"]
    url = "https://api.elevenlabs.io/v1/text-to-speech/{}?{}".format(
        urllib.parse.quote(voice_id), urllib.parse.urlencode({"output_format": "mp3_44100_128"})
    )
    body, content_type = post_json(
        url,
        {"text": f"[calm, confidently decisive] {line}", "model_id": "eleven_v3"},
        {"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
        timeout=90,
    )
    if "audio" not in content_type and not body.startswith(b"ID3"):
        raise RuntimeError("ElevenLabs returned an unexpected response.")
    return body


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != "/api/hidden-ending":
            self.send_error(404)
            return
        try:
            length = min(int(self.headers.get("Content-Length", "0")), 4096)
            supplied = json.loads(self.rfile.read(length) or b"{}")
            state = {
                "cycleCount": max(1, min(int(supplied.get("cycleCount", 1)), 99)),
                "previousFailure": supplied.get("previousFailure") if supplied.get("previousFailure") in {"none", "rest", "kid", "chief"} else "none",
                "bellReturned": bool(supplied.get("bellReturned")),
                "ghostExposed": bool(supplied.get("ghostExposed")),
            }
            for required in ("OPENAI_API_KEY", "ELEVENLABS_API_KEY", "EXORCIST_VOICE_ID"):
                if not os.environ.get(required):
                    raise RuntimeError(f"Missing {required} in .env")
            line = generate_line(state)
            audio = generate_voice(line)
            RUNTIME.mkdir(parents=True, exist_ok=True)
            filename = f"hidden-ending-{int(time.time() * 1000)}.mp3"
            (RUNTIME / filename).write_bytes(audio)
            self.send_json(200, {"text": line, "audio": f"audio/runtime/{filename}"})
        except Exception as error:
            print(f"Hidden-ending fallback: {error}")
            self.send_json(503, {"error": "Live generation unavailable", "fallback": FALLBACK_TEXT})

    def send_json(self, status, payload):
        encoded = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


if __name__ == "__main__":
    load_env()
    port = int(os.environ.get("PORT", "8080"))
    print(f"The Previous Tenant: http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
