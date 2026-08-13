# The Previous Tenant

**The Previous Tenant** is a browser-based mystery game exploring practical voice AI integration patterns using ElevenLabs.

You arrive in a village that seems to have been expecting you, explore an unsettling rented house, and learn from failed cycles until you can uncover its hidden ending.

## Demo

The recording reveals the hidden ending. Play the game first if you want to solve it yourself.

<details>
<summary><strong>Watch the hidden-ending demo video (spoilers)</strong></summary>

<br>

[Watch the 63-second demo video](./the-previous-tenant-demo-v2.mp4)

</details>

## Try it yourself

No credentials or server process are required for the playable fallback version.

1. Clone or download the repository.
2. Open `index.html` in a modern browser.

The complete story, committed character audio, cinematics, and fixed hidden-ending fallback all work locally.

Some browsers apply stricter rules to pages opened through `file://`. If local audio or saved progress is restricted, run `python3 -m http.server 8080` and open <http://localhost:8080>.

## Controls

- Choose actions under **What do you do?**
- Select an inventory item, then choose a highlighted `◇` target.
- Revisit people and clues across cycles; failed endings reveal new information.
- Use **Skip** during cinematics or wait for each voiced line to finish.
- **Reset progress** clears persistent cycle discoveries.

## Why this architecture?

The initial exploration considered a fully dynamic approach where every NPC dialogue would be generated at runtime through an LLM and ElevenLabs.

After evaluating the trade-offs, the project adopted a hybrid voice architecture:

- Pre-generated ElevenLabs audio for story-critical dialogue, character identity, and consistent pacing.
- Runtime-generated voice for the hidden ending, where variation adds meaningful value.
- Fallback content to keep the experience playable when external services are unavailable.

This approach balances creative flexibility with reliability, latency, cost, and narrative control.

The goal is not to maximize API calls. It is to demonstrate where generated voice improves the experience—and where a deterministic performance creates a better product.

## Voice and narrative design

| Role | Approach |
| --- | --- |
| Village chief | Voice Design; youthful, polite, playful, and morally ambiguous |
| Ghost | Voice Design; adult, layered, intimate, and increasingly distressed |
| Village girl | Existing Voice Library performance; natural dialogue only |
| Exorcist | Instant Voice Clone of the developer's own voice; fixed reveal plus one runtime-generated line |

## Live hidden-ending pipeline

```text
Game state
  → local Python server
  → OpenAI Responses API
  → validation
  → ElevenLabs text-to-speech
  → browser playback

Any failure
  → committed fallback line and audio
```

## Enable live generation

Requirements: Python 3.9 or later, an OpenAI API key, an ElevenLabs API key, and an ElevenLabs voice ID.

1. Copy `.env.example` to `.env`.
2. Add:

```text
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
EXORCIST_VOICE_ID=
```

3. Run `python3 server.py`.
4. Open <http://localhost:8080>.

API keys remain on the server and never enter browser JavaScript.

## Project structure

- `index.html`, `styles.css`, `game.js` — browser game and cinematic player
- `server.py` — local server and bounded live-generation endpoint
- `dialogue.json` — approved dialogue and audio manifest
- `audio/` — committed fixed performances
- `game-design.md` — narrative and interaction design
- `PROJECT-POSITIONING.md` — scope and product reasoning
