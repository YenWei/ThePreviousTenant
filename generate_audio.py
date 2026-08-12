#!/usr/bin/env python3
"""Plan or generate approved fixed dialogue through ElevenLabs.

Dry-run is the default. Network calls occur only with --generate.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_local_env(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--generate", action="store_true", help="Call ElevenLabs and write audio. Default: dry-run.")
    parser.add_argument("--character", choices=("chief", "ghost", "kid", "exorcist"))
    parser.add_argument("--line", help="Generate or inspect one dialogue ID.")
    parser.add_argument("--required-only", action="store_true", help="Exclude optional variation lines.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing audio files.")
    parser.add_argument("--yes", action="store_true", help="Confirm generation without an interactive prompt.")
    return parser.parse_args()


def selected_lines(dialogue: dict, args: argparse.Namespace) -> list[dict]:
    result = []
    for character, character_data in dialogue["characters"].items():
        if character_data.get("generationEnabled") is False:
            continue
        if args.character and character != args.character:
            continue
        for line in character_data.get("lines", []):
            if line.get("generation") == "runtime" or not line.get("text") or not line.get("filename"):
                continue
            if args.line and line["id"] != args.line:
                continue
            if args.required_only and not line.get("required"):
                continue
            result.append({"character": character, **line})
    return result


def generation_text(line: dict) -> str:
    if line.get("generationText"):
        return line["generationText"]
    tag = line.get("deliveryTag", "").strip()
    return f"{tag} {line['text']}".strip()


def generate(line: dict, config: dict, api_key: str) -> bytes:
    character_config = config["characters"][line["character"]]
    voice_env = character_config["voiceIdEnv"]
    voice_id = os.environ.get(voice_env)
    if not voice_id:
        raise RuntimeError(f"Missing {voice_env} for {line['character']}.")
    output_format = config.get("outputFormat", "mp3_44100_128")
    url = "https://api.elevenlabs.io/v1/text-to-speech/{}?{}".format(
        urllib.parse.quote(voice_id), urllib.parse.urlencode({"output_format": output_format})
    )
    payload = json.dumps({"text": generation_text(line), "model_id": config.get("modelId", "eleven_v3")}).encode()
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json", "xi-api-key": api_key},
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs returned HTTP {error.code}: {detail}") from error


def main() -> int:
    args = arguments()
    load_local_env(ROOT / ".env")
    dialogue = json.loads((ROOT / "dialogue.json").read_text(encoding="utf-8"))
    config_path = ROOT / "voices.json"
    if not config_path.exists():
        config_path = ROOT / "voices.example.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    lines = selected_lines(dialogue, args)
    if args.line and not lines:
        print(f"No fixed dialogue line matched {args.line!r}.", file=sys.stderr)
        return 2
    total_chars = sum(len(generation_text(line)) for line in lines)
    required_chars = sum(len(generation_text(line)) for line in lines if line.get("required"))
    print(f"Mode: {'GENERATE' if args.generate else 'DRY RUN'}")
    print(f"Selected: {len(lines)} fixed lines ({required_chars} required characters; {total_chars} total characters)")
    for line in lines:
        output = ROOT / line["filename"]
        status = "overwrite" if output.exists() and args.overwrite else "skip-existing" if output.exists() else "generate"
        print(f"- {line['id']}: {len(generation_text(line))} chars -> {line['filename']} [{status}]")
    if not args.generate:
        print("Dry run only: no API call was made and no credits were used.")
        return 0
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("Missing ELEVENLABS_API_KEY. Copy .env.example to .env and configure it locally.", file=sys.stderr)
        return 2
    pending = [line for line in lines if args.overwrite or not (ROOT / line["filename"]).exists()]
    if not pending:
        print("Nothing to generate; all selected files already exist.")
        return 0
    if not args.yes:
        answer = input(f"Generate {len(pending)} files through ElevenLabs? Type 'generate' to continue: ")
        if answer.strip().lower() != "generate":
            print("Cancelled.")
            return 1
    for line in pending:
        output = ROOT / line["filename"]
        output.parent.mkdir(parents=True, exist_ok=True)
        print(f"Generating {line['id']}...")
        audio = generate(line, config, api_key)
        output.write_bytes(audio)
        print(f"Saved {output.relative_to(ROOT)} ({len(audio)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
