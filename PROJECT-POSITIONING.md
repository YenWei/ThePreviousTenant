# The Previous Tenant — Current Focus and Positioning

## One-sentence description

**The Previous Tenant** is a short browser mystery that uses ElevenLabs for authored character performances and one tightly controlled, contextual hidden-ending line.

## Current focus

The current goal is not to expand the game. It is to turn the working visual prototype into a small, credible voice-system demo that the developer has personally run, tested, and can explain.

The project already has:

- Three playable locations
- A complete inventory puzzle
- Persistent failure cycles and additional hints
- Three ending categories
- Three illustrated scene backgrounds
- Two visual states for the village wall puzzle
- Draft dialogue and an agreed exorcist hidden-ending sequence

The immediate focus is:

1. Lock required dialogue.
2. Create and test the character voices.
3. Generate and integrate required fixed audio.
4. Create the developer's permitted Instant Voice Clone.
5. Implement the bounded live hidden-ending pipeline.
6. Test failure handling and the complete game.
7. Document setup, architecture, costs, limitations, and results.

## Why the project does not use an LLM everywhere

The game is authored because its mystery depends on controlled information, timing, and repeatable character intent. Open-ended generation would add failure modes without improving most interactions.

Fixed lines are pre-generated because they provide:

- Predictable narrative behavior
- Consistent performances
- Low playback latency
- No repeated generation cost
- A playable default after cloning
- Straightforward caching and testing

The LLM is reserved for one moment where context provides visible value: the released exorcist comments briefly on how the player solved the puzzle.

This is a product decision, not a technical limitation. A good integration uses generation where variability is meaningful and deterministic assets where reliability matters more.

## ElevenLabs' role

ElevenLabs is central to the demonstration, but it is used in several deliberate ways rather than through a large volume of calls.

### Voice Design

Voice Design establishes distinct identities for the chief and adult ghost. The goal is to demonstrate persona definition, timbre, pacing, emotional direction, and iteration—not merely select stock voices.

### Eleven v3 delivery control

Short delivery tags guide line-level performance. Important lines can be regenerated independently without rebuilding the full dialogue set.

### Pre-generated text to speech

Required dialogue is generated before gameplay and saved with predictable filenames. This demonstrates repeatable generation, caching, cost awareness, and reliable playback.

### Instant Voice Cloning

The exorcist uses the developer's own permitted voice clone. This creates a meaningful reveal and demonstrates consent-aware use of voice cloning.

### Runtime speech generation

At the hidden ending, a local backend sends one validated contextual line to ElevenLabs. This demonstrates live orchestration without exposing an API key in browser code.

### Fallback behavior

A fixed exorcist fallback line completes the hidden ending when credentials are absent or a service fails. Generation enhances the experience but is not allowed to break it.

## Runtime hidden-ending boundary

The browser does not accept an arbitrary prompt. It sends a small set of allowlisted facts, such as:

- Current cycle count
- Whether the ghost was exposed with the bell
- Which failed ending occurred previously
- Selected relevant interactions

The backend instructs the LLM to produce one spoken line with these constraints:

- Maximum 15 words
- Single line
- No action narration
- No quotation marks
- No facts beyond supplied game state
- Calm, authoritative, dry exorcist persona

The output is validated before it reaches ElevenLabs. The request has a timeout and falls back to committed audio on failure. Repeated state combinations may be cached to avoid unnecessary generation.

## Credential and repository model

The developer runs the full pipeline locally with credentials stored in `.env`. That file must be ignored by Git and must never be placed in browser JavaScript.

The public repository should contain:

- `.env.example` with empty placeholders
- `.gitignore` excluding `.env`
- A local backend and generation scripts
- Committed fixed and fallback audio
- Setup instructions for users who choose to provide their own credentials

Someone who clones the repository without credentials can still complete the game through the fallback. The repository does not provide access to the developer's keys.

## README evidence

After the complete live path works, record a short video and place it at the end of the README inside a collapsed spoiler section. The video should demonstrate the hidden ending and live generated line. It must be labeled as a spoiler so reviewers who want to play first can avoid it.

The README must state clearly which behavior works without credentials and which behavior requires local configuration.

## Monday-ready scope

Required:

- Complete playable game
- Required fixed dialogue audio
- Subtitles synchronized closely enough for review
- Exorcist Instant Voice Clone
- One working contextual hidden-ending line
- Pre-generated fallback
- API keys excluded from Git and browser code
- README with setup, architecture, tradeoffs, and limitations
- Spoiler-marked evidence video if recording time permits

Optional after the required path works:

- Additional repeat-dialogue variations
- Character close-ups
- Ending illustrations
- More animation
- Additional contextual-line cases
- Public hosting

## Honest positioning for the application

Describe this as a small working prototype built to explore voice-system design and integration decisions. Do not describe it as a production game, a deployed service, or an unrestricted conversational system.

The strongest story is:

> I first made the narrative and puzzle playable without APIs. I then used ElevenLabs where voice meaningfully improved character identity and the hidden-ending payoff. Most lines are pre-generated for reliability and cost, while one bounded runtime path demonstrates LLM orchestration, validation, secure key handling, and graceful fallback.

This positioning is credible only after the developer has personally generated the voices, run the live ending, tested the fallback, and can explain the implementation choices.
