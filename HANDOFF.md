# Project Handoff — The Previous Tenant

## Purpose of this document

This document allows a new Codex task on another computer to continue the project without access to the original conversation. Read this file and `game-design.md` completely before changing or implementing anything.

## Project status

Current phase: **Phase 1 complete — game concept and design specification**

Implementation has not started.

Currently completed:

- Core story loop
- Character roles and secrets
- Three-scene structure
- Ritual-key and bell puzzle rules
- Three endings
- Persistent loop behavior
- High-level dialogue inventory
- ElevenLabs usage and credit strategy
- Planned dynamic hidden-ending line

Currently not created:

- HTML, CSS, or JavaScript game
- Python backend
- ElevenLabs generation script
- Final dialogue
- Artwork
- Audio files
- API configuration
- Tests

The next approved phase is to build a **text-only playable prototype** using placeholders and no paid audio generation.

## User's larger goal

The user is preparing an application for an ElevenLabs Solutions Engineer position. They want a small, truthful, personally understood project that demonstrates practical exploration of ElevenLabs rather than an oversized portfolio piece built without their involvement.

The prototype should eventually demonstrate:

- ElevenLabs Voice Design
- Emotion and delivery control with Eleven v3 audio tags
- Pre-generated text-to-speech through the ElevenLabs API
- Event-driven NPC dialogue
- Separation of visual character identity from speaking voice identity
- Runtime generation of one short contextual line
- Instant Voice Cloning using the user's own voice
- API-key security and fallback behavior
- Awareness of latency, reliability, caching, and credit cost

Do not describe the project as completed in an application until the user has personally run, tested, and understood the relevant parts.

## Product exploration already completed

The user created a free ElevenLabs account with 10,000 credits and explored Voice Design.

They tested a character concept involving a young village chief who sounded unusually mature, ambiguous, and cunning. An early prompt specifying a 7–10-year-old voice combined with unsettling dialogue was blocked by ElevenLabs' Prohibited Use Policy. The project subsequently adopted the following safety principle:

- Do not attempt to bypass ElevenLabs safety filters.
- Do not generate threatening or frightening dialogue in a child voice.
- When the ghost controls or appears behind the kid, use a separate adult ghost voice.
- Ordinary kid dialogue can remain text-only or use an appropriate permitted voice.

The user learned that Eleven v3 supports line-level audio tags such as:

- `[mischievously]`
- `[hesitant]`
- `[quietly]`
- `[coldly]`
- `[laughs softly]`
- `[pause]`
- `[long pause]`

The official prompting guidance recommends defining language, gender/age, quality, persona, emotion, timbre, pacing, and delivery. The user also observed that natural dialogue is preferable to over-written, obviously AI-generated prose.

## Locked prototype concept

Working title: **The Previous Tenant**

Format:

- First-person browser mystery
- Point-and-click interaction
- Player character is silent
- Three main locations
- Four NPC/story entities
- Short first playthrough with looping failure state
- Three endings

Target duration:

- First cycle: 3–5 minutes
- Full discovery: approximately 10–15 minutes

Do not expand this into a 3D game, free-walking game, combat game, large inventory system, or open-ended conversational agent during the prototype phase.

## Characters

### Chief

- Polite, composed, faintly amused, and difficult to read.
- Knows the house is haunted.
- Maintains an old bargain that sacrifices outside tenants to protect the village.
- Knows the kid is the ghost's vessel.
- Knows the cat is a trapped exorcist.
- Knows the bell is hidden in the village wall.
- Wants the player to enter the house and rest.
- If confronted with the ritual key, takes it and releases the ghost through the kid, causing a bad ending.

The chief should remain morally ambiguous rather than acting like an exaggerated villain. His rationale is that sacrificing outsiders protects the entire village.

### Kid

- Always waits near the entrance of the player's rented house.
- Appears curious about each new tenant.
- Sometimes knows things they should not know.
- Acts as the ghost's current vessel.
- Does not fully understand the possession.
- The cat stares continuously at the kid.

The kid's normal dialogue should be simple and natural. When the ghost is exposed or takes control, switch to the adult ghost voice rather than generating sinister child-voice dialogue.

### Cat / exorcist

- Initially behaves like an ordinary cat.
- In the village centre, ignores the player and tries to retrieve something from a hole in the wall.
- At the house entrance, sits still and stares at the kid.
- Is actually an exorcist trapped in cat form.
- Its missing bell preserves or restores its identity.
- Returning the bell is necessary before the ritual key can release it.
- Speaks for the first time only during the hidden ending.
- The exorcist voice should eventually be created from the user's own Instant Voice Clone.

### Ghost

- Adult supernatural voice.
- Bound to the rented house.
- Consumes tenants and preserves traces of their identity.
- Uses the kid as a vessel.
- Was wronged by the village in the past.
- Exact historical details may remain ambiguous unless required by final dialogue.

### Player

- First-person and unseen.
- No voice, saving credits and allowing player projection.
- Choices are displayed as text actions.
- A failed player becomes the previous tenant mentioned in the next cycle.

## Core story loop

1. A new tenant arrives in the village.
2. The chief welcomes them and mentions the previous tenant.
3. The cat is seen digging at a hole in the village wall.
4. The player travels to the rented house.
5. The kid is waiting beside the entrance.
6. The cat follows and stares at the kid.
7. Inside the house, the player easily discovers a ritual key.
8. The player may return to the village wall after the cat moves and recover a hidden bell.
9. The player experiments with the items or chooses to rest.
10. Resting without resolving the haunting causes the ghost to consume the player.
11. The failed player becomes the previous tenant for the next cycle.
12. The next tenant begins with slightly altered dialogue and additional notes.

The full solution must be available during Cycle 1, but later cycles provide clearer hints.

## Locations

### Village centre

Contains:

- Chief
- Cat
- Hole in stone wall
- Path to rented house

Important behavior:

- Cat ignores player and digs at wall hole.
- A metallic glint is visible behind it.
- Player cannot access hole while cat is present.
- Cat follows when player goes to house.
- Player can then return and retrieve bell.

### House entrance

Contains:

- Kid
- Cat after it follows player
- Unknown ritual symbol on door frame
- Entrance to house
- Path back to village centre

Important behavior:

- Kid is always present.
- Cat stares at kid, not player.
- Bell can expose ghost behind kid.
- Key on door symbol produces good ending.
- Bell then key on cat produces hidden ending.

### Player's room

Contains:

- Bed
- Ritual key on bedside table or similarly obvious location
- Previous tenant's belongings
- Door back outside

Important behavior:

- Ritual key has no normal teeth.
- Its symbol matches the door symbol.
- Player can leave room after finding key.
- Rest is an explicit action with confirmation.
- Cycle 2+ adds previous-tenant notes.

Suggested confirmation:

> The light outside is fading. Rest for the night?

## Puzzle grammar

The ritual objects must behave consistently:

- **Bell:** reveals or restores identity.
- **Ritual key:** activates or releases magical bindings.

### Item-target results

| Item | Target | Result |
|---|---|---|
| Ritual key | Kid | Releases ghost through vessel; bad ending |
| Ritual key | Chief | Chief takes key and releases ghost; bad ending |
| Ritual key | Door symbol | Activates house seal; good ending |
| Ritual key | Cat without bell | Nothing activates; cat indicates empty collar loop |
| Ritual key | Cat after bell | Releases exorcist; hidden ending |
| Bell | Kid | Temporarily exposes adult ghost shadow and voice |
| Bell | Chief | Makes chief nervous and produces warning |
| Bell | Door symbol | Resonates, showing shared ritual system |
| Bell | Cat | Restores bell to collar |

Items should not disappear when used on a non-ending target. The player should be able to continue experimenting.

## Endings

### Default bad ending — Previous tenant

Trigger:

- Player chooses to rest without activating another ending.

Result:

- Ghost approaches and consumes the player's identity.
- Player becomes the newest previous tenant.
- Cycle counter increases.
- Next cycle begins with altered chief dialogue and new hints.

Avoid graphic violence. Possession, identity loss, shadows, distortion, and sound are preferred.

### Alternate bad ending — Ghost released

Trigger:

- Key used on kid, or
- Key used on chief.

Result:

- Ghost is released through kid.
- Player is consumed.
- Next cycle begins.

### Good ending — Containment

Trigger:

- Key used on house-door symbol.

Result:

- House seal activates.
- Player escapes.
- Ghost remains contained.
- Kid remains connected to curse.
- Chief remains in control.
- Player survives but does not solve the village's deeper problem.

### Hidden ending — Exorcism

Trigger:

1. Player finds bell.
2. Player returns bell to cat.
3. Player uses ritual key on cat.

Result:

- Exorcist identity is released.
- Cat speaks in user's cloned voice.
- Exorcist confronts and seals ghost.
- Previous tenants are released.
- Kid is freed.
- Chief faces consequences.
- Persistent state marks cycle as permanently broken.

## Loop persistence

Physical inventory resets after a bad ending. Knowledge and traces persist.

Suggested persistent state:

```javascript
{
  cycleCount: 1,
  previousFailure: null,
  previousTenantWarningUnlocked: false,
  hiddenEndingCompleted: false
}
```

Suggested per-cycle state:

```javascript
{
  currentScene: "village-centre",
  catMovedToHouse: false,
  hasBell: false,
  hasRitualKey: false,
  ghostExposed: false,
  bellReturnedToCat: false,
  interactionsSeen: []
}
```

Failure-specific hints may appear in Cycle 2+:

- After resting: warn future tenant not to sleep.
- After key on kid: "The child is not the prisoner."
- After key on chief: "Do not show him the key."

General notes:

> The cat wasn't digging for food. Something was hidden in the wall.

> I heard a bell near the child. For a moment, another shadow appeared behind them.

Only one or two notes should be visible in a cycle.

## ElevenLabs production plan

### Pre-generated audio

Pre-generate and cache all ordinary character dialogue:

- Chief
- Permitted kid dialogue, if voiced
- Adult ghost
- Cat sounds
- Fixed exorcist lines
- Hidden-ending fallback line

Use a Python generation script that:

1. Reads structured dialogue data.
2. Maps speaker to ElevenLabs voice ID.
3. Calls the ElevenLabs Text-to-Speech API.
4. Saves predictable MP3 filenames.
5. Skips existing files by default.
6. Requires explicit overwrite or regeneration.
7. Reports estimated character usage.

Do not expose the ElevenLabs API key in browser JavaScript.

### Dynamic hidden-ending line

Only the hidden ending should use live generation.

Flow:

1. Browser sends a small permitted summary of player behavior to Python backend.
2. Backend asks an LLM for one line of no more than 15 words.
3. Backend validates that output is non-empty, single-line, and within length limit.
4. Backend sends it to ElevenLabs using user's cloned exorcist voice ID.
5. Generated audio returns to browser.
6. If either API fails, game uses a pre-generated fallback and still completes.

Example LLM instruction:

```text
You write one line for a cat secretly revealed as an exorcist.
Personality: calm, authoritative, dry, and concise.
Use only the supplied game state.
Write one spoken line addressing the player.
Maximum 15 words.
Do not narrate actions.
Do not use quotation marks.
```

### User's cloned voice

The user intends to use ElevenLabs Instant Voice Cloning for the cat/exorcist reveal.

Do not ask the user to upgrade immediately. Upgrade to Starter only after:

- Text-only game works
- Story and dialogue are finalized
- Hidden ending is functional with placeholder audio
- Exact exorcist lines are known

Record approximately 1–2 minutes of clean, varied speech for the clone. Use only the user's own voice and comply with ElevenLabs consent requirements.

## Credit strategy

The user currently has approximately 7,000+ free ElevenLabs credits remaining.

Target budget:

- Fixed approved dialogue: 1,850–2,850 characters
- Voice experimentation: 700–1,000 credits
- Regenerations: approximately 1,500 credits
- Cloned-voice testing: 500–800 credits
- Runtime tests and reserve: 1,000+ credits

Do not generate final audio until the text-only game is playable and every line has a confirmed use.

## Implementation architecture

Planned structure:

```text
the-previous-tenant/
├── README.md
├── game-design.md
├── HANDOFF.md
├── dialogue.json
├── voices.example.json
├── generate_audio.py
├── requirements.txt
├── .env.example
├── audio/
│   ├── chief/
│   ├── kid/
│   ├── ghost/
│   └── exorcist/
├── server/
│   └── app.py
└── game/
    ├── index.html
    ├── style.css
    ├── game.js
    └── assets/
```

This structure is provisional. Do not create the backend or audio pipeline during the text-only phase unless required for a placeholder abstraction.

## Next task — Phase 2

Build the text-only playable prototype.

Required scope:

- Three scenes: village centre, house entrance, player's room
- Navigation between scenes
- Chief, kid, and cat interaction targets
- Inventory containing bell and ritual key
- Select item, then select target interaction
- Cat movement from wall to house
- Bell retrieval after cat moves
- Ritual key discovery in room
- Explicit Rest confirmation
- Default bad ending and loop restart
- Alternate bad ending for key on kid/chief
- Good ending for key on door symbol
- Hidden ending for bell then key on cat
- Browser-local persistent cycle count
- Cycle 2+ notes and altered chief introduction
- Text subtitles and placeholder sound hooks
- Reset-progress control for testing

Not in Phase 2:

- Final artwork
- ElevenLabs calls
- OpenAI/LLM calls
- API keys
- Voice cloning
- Final audio
- Complex animation
- Full final dialogue polish

Phase 2 acceptance criteria:

1. Every ending can be reached deliberately.
2. Bad endings restart as a new tenant.
3. Cycle count and prior failure survive browser refresh.
4. Physical inventory resets after bad ending.
5. Additional hints appear after failure.
6. The full solution remains possible in Cycle 1.
7. Item-target combinations do not accidentally consume items.
8. The game is usable with mouse and keyboard.
9. No external API or secret is required.

## Instructions for the next Codex task

Use this prompt on the other computer:

> Read `game-design.md` and `HANDOFF.md` completely before acting. Continue with Phase 2: build the text-only playable browser prototype. Preserve the agreed loop, scene layout, puzzle grammar, character roles, and three endings. Use placeholder presentation only. Do not generate artwork, create ElevenLabs audio, add API keys, or implement the live LLM ending yet. Test every ending and the persistent loop before reporting completion.

If any implementation detail conflicts with the design, preserve the core rules and document the smallest necessary adjustment. Do not silently redesign the story or expand the scope.
