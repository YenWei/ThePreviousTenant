# The Previous Tenant

**The Previous Tenant** is a compact, replayable browser mystery built as an ElevenLabs voice demo. You arrive in a village that seems to have been expecting you, explore an unsettling rented house, and learn from failed cycles until you can uncover its hidden ending.

## The idea

The original concept was more technically ambitious: every NPC would run through an LLM during play, generate a response from the current game state, and send that response to the ElevenLabs API for voice acting. That would have made every conversation dynamically generated.

While planning the playable demo, that approach created constraints that did not suit this particular mystery:

- Every interaction would inherit two network calls and noticeable response latency.
- Repeated live speech generation would increase cost without making every line more meaningful.
- Open-ended responses could reveal clues too early, contradict established facts, or weaken the repeatable puzzle structure.
- Voice delivery and character personality would be harder to direct, compare, regenerate, and test consistently.
- Anyone cloning the repository would need to configure two paid services before hearing the intended performances.

The mystery also depends on controlled information: each character must reveal the right clue at the right time, retain a recognizable personality, and respond consistently across repeated cycles.

The implementation was therefore narrowed into a hybrid design. The chief and ghost were created with ElevenLabs Voice Design, their main dialogue was authored and pre-generated, and important performances were directed and regenerated line by line. The village girl uses a suitable existing Voice Library voice. This makes voice an intentional part of the writing rather than a last-minute text-to-speech layer, playback begins immediately, and the game remains predictable enough to test.

The original LLM + API idea is still implemented, but reserved for the moment where variation has narrative meaning: the hidden ending. Once the player understands the cycles and completes the bell-and-key ritual, the released exorcist comments on the specific game state. The backend asks an LLM for one short line, validates it, and passes it to ElevenLabs using an **Instant Voice Clone of the developer's own voice**. The exorcist is not a Voice Design voice.

This creates a deliberate contrast:

- **Authored, pre-generated speech** carries the mystery, character identity, pacing, and emotional continuity.
- **Runtime generation** rewards the player's discovery with a contextual line that could not be fully authored in advance.
- **A fixed fallback** ensures the climax still works when credentials, network access, or either provider is unavailable.

The design goal is not to maximize API calls. It is to demonstrate where generated voice improves the experience—and where a deterministic performance is the better product decision.

In practice:

- Authored dialogue and pre-generated ElevenLabs audio keep the main story reliable, responsive, and consistent.
- Repeat interactions rotate through alternate text instead of replaying one response forever.
- One bounded hidden-ending line is written from the current game state at runtime.
- That line is validated, limited to 15 words, and spoken through an ElevenLabs Instant Voice Clone.
- A committed fallback line and audio clip keep the ending playable when either API is unavailable.

## Quick start

No credentials or server process are required for the fallback version:

1. Clone or download the repository.
2. Open `index.html` in a modern browser.

The complete story, committed character audio, cinematics, and fixed hidden-ending fallback all work locally. The live generated exorcist line is the only feature that requires API credentials and `server.py`.

Some browsers apply stricter rules to pages opened through `file://`. If local audio or saved progress is restricted, serve the same static files with Python:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>. This remains fallback mode and does not use either API.

## Controls

- Choose actions under **What do you do?**
- Select an inventory item, then choose a highlighted `◇` target.
- Revisit people and clues across cycles; failed endings reveal new information.
- Use **Skip** during cinematics or wait for each voiced line to finish.
- **Reset progress** clears persistent cycle discoveries.

## Voice and narrative design

| Role | Approach |
| --- | --- |
| Village chief | Voice Design; youthful, polite, playful, and morally ambiguous |
| Ghost | Voice Design; adult, layered, intimate, and increasingly distressed |
| Village girl | Existing Voice Library performance; natural dialogue only |
| Exorcist | Instant Voice Clone of the developer's own voice; fixed reveal plus one runtime-generated line |

The girl and the possessing ghost always use separate voices. Most dialogue is pre-generated because the narrative benefits more from intentional delivery, predictable cost, and immediate playback than from unrestricted generation.

## Live hidden-ending pipeline

```text
Game state
  → local Python server
  → OpenAI Responses API (one line, maximum 15 words)
  → validation
  → ElevenLabs text-to-speech using the developer's own Instant Voice Clone
  → browser playback

Any failure
  → committed fallback line and audio
```

Generation begins when the player returns the bell to the cat, hiding most API latency before the final action is chosen. API keys never enter browser code.

## Enable live generation

Requirements: Python 3.9 or later, an OpenAI API key, an ElevenLabs API key, and an ElevenLabs voice ID.

1. Copy `.env.example` to `.env`.
2. Add:

```text
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
EXORCIST_VOICE_ID=
```

3. Start the local application server:

```bash
python3 server.py
```

4. Open <http://localhost:8080>.

`server.py` serves the static game and securely handles `/api/hidden-ending` in one process. API keys remain on the server and never enter browser JavaScript.

Never put credentials in `game.js`, `index.html`, screenshots, or committed files. `.env` and runtime-generated audio are excluded from Git.

## Project structure

- `index.html`, `styles.css`, `game.js` — browser game and cinematic player
- `server.py` — local server and bounded live-generation endpoint
- `dialogue.json` — approved dialogue, generation directions, and audio manifest
- `audio/` — committed fixed performances; runtime audio is ignored
- `assets/scenes/` — static scenes, supernatural keyframes, and cinematic GIFs
- `generate_audio.py` — opt-in fixed-line ElevenLabs generator; dry-run by default
- `make_cinematic_gifs.py` — reproducible cinematic GIF builder
- `game-design.md` — complete narrative and interaction design
- `PROJECT-POSITIONING.md` — scope and product reasoning

## Spoiler demo video

The recording reveals the hidden ending. Play the game first if you want to solve it yourself.

<details>
<summary><strong>Show the hidden-ending demo video (spoilers)</strong></summary>

<br>

[Watch the 63-second demo video](./the-previous-tenant-demo-v2.mp4)

The recording includes a freshly generated line based on game state, followed by live ElevenLabs synthesis using an Instant Voice Clone of the developer's own voice.

</details>

## Notes

- This is a local prototype, not a hosted service.
- Optional dialogue variations may remain text-only; all story-critical lines are voiced.
- The video renderer is included for reproducibility but uses optional local Python packages not required to play the game.
