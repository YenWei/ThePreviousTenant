# The Previous Tenant — Prototype Game Design

## 1. Prototype objective

Create a short first-person point-and-click browser mystery in which the player explores a village, experiments with two ritual items, and discovers that failed players become the "previous tenant" mentioned in the next cycle.

Target experience:

- First cycle: 3–5 minutes
- Full discovery: 10–15 minutes
- Three locations
- Four non-player characters: chief, kid, cat/exorcist, and ghost
- Three endings: bad loop, good containment, hidden exorcism
- Mostly pre-generated ElevenLabs dialogue
- One short runtime-generated line in the hidden ending

The player has no voice. Player choices appear as text actions.

### Product and engineering positioning

This project is intentionally a small, authored game with a bounded AI feature. It is not an attempt to turn every character into an open-ended conversational agent.

Most dialogue is pre-generated with ElevenLabs and committed as game assets. This is a deliberate production choice:

- The narrative and puzzle require specific information to appear at specific moments.
- Pre-generated audio gives predictable pacing, repeatable performances, instant playback, and reliable offline fallback.
- It avoids paying repeatedly for dialogue whose content does not change.
- It prevents an LLM from contradicting puzzle rules, revealing secrets early, or changing character intent.
- It makes the cloned repository playable without requiring visitors to supply credentials.

The hidden ending contains one bounded live path:

1. The browser sends a small allowlisted summary of player behavior to the local backend.
2. An LLM writes one contextual exorcist line of no more than 15 words.
3. The backend validates the response.
4. ElevenLabs generates the line with the developer's permitted Instant Voice Clone.
5. The game plays a pre-generated fallback if either service is unavailable.

This feature exists to demonstrate orchestration, validation, secret handling, latency awareness, cost control, caching, and graceful degradation. The value is not the quantity of API calls; it is choosing where generation materially changes the player experience.

The repository must not imply that anonymous users can access the developer's credentials. A local user may configure their own credentials to run live generation. The default cloned experience remains complete through committed audio and fallback behavior. A spoiler-marked README video may document the live hidden-ending path after it has been run successfully.

### Success standard

The demo is strong enough for the intended application when it truthfully demonstrates:

- A complete, understandable three-ending game
- Purposeful Voice Design and delivery control
- Secure local API usage with secrets excluded from Git
- A permitted Instant Voice Clone used for the exorcist
- One tested LLM-to-ElevenLabs runtime path
- Validation, timeout, caching, and fallback decisions that can be explained clearly
- Documentation that distinguishes implemented behavior from planned or optional work

Additional API calls, unrestricted NPC chat, extensive animation, and a hosted production service are not measures of success for this prototype.

## 2. Narrative truth

### The village

The village survives through an old bargain. A vengeful ghost is bound to the rented house, but the binding weakens unless the ghost periodically consumes a new identity. Outsiders are therefore invited to stay in the house.

### The chief

The chief knows the truth and maintains the cycle. He presents himself as polite, composed, and faintly amused. He does not enjoy unnecessary cruelty, but he has decided that sacrificing outsiders is preferable to risking the whole village.

What the chief knows:

- The house contains a ritual key.
- The key can activate or release magical bindings.
- The kid is acting as the ghost's current vessel.
- The cat is a trapped exorcist.
- The exorcist's bell was hidden in the village wall.

What the chief wants:

- The player to enter the house and rest.
- The player not to recover the bell.
- The player not to use the ritual key on the door symbol or cat.

If the player shows or uses the key on him, he takes control of the situation and releases the ghost through the kid, producing a bad ending.

### The kid

The kid remains near the entrance of the rented house. They appear curious about each new tenant and occasionally know things they should not know. The ghost can observe and speak through them, but the kid does not fully understand what is happening.

Design constraint:

- Avoid relying on generated frightening dialogue in a child's voice.
- The kid's ordinary dialogue can remain text-only or use a suitable permitted voice.
- When the ghost is exposed or takes control, use the separate adult ghost voice.

### The ghost

The ghost was wronged by the village in the past and is now bound to the house. It consumes tenants and preserves traces of their identities inside the haunting. The exact historical grievance can remain partially unexplained in the prototype; the player only needs to understand the present cycle.

The ghost wants:

- The player to sleep in the house.
- The ritual key to be used on its vessel.
- The bell and exorcist to remain separated.

### The cat / exorcist

The cat is an exorcist trapped in animal form. Its bell preserves its identity and authority; without it, the ritual key cannot release the exorcist.

The cat cannot explain the puzzle directly. It communicates through behavior:

- Digging at the wall containing the bell
- Following the player to the rented house
- Staring continuously at the kid
- Reacting to the ritual key
- Presenting the empty loop on its collar

Returning the bell and using the ritual key on the cat releases the exorcist. The exorcist is voiced using the developer's Instant Voice Clone.

## 3. Puzzle grammar

The two ritual items have consistent functions:

- Bell: reveals or restores identity
- Ritual key: activates or releases bindings

### Item-target outcomes

| Item | Target | Outcome |
|---|---|---|
| Ritual key | Kid | Releases the ghost through its vessel; bad ending |
| Ritual key | Chief | Exposes the chief; he takes the key and releases the ghost; bad ending |
| Ritual key | Door symbol | Activates the house seal; good ending |
| Ritual key | Cat without bell | No activation; cat points attention toward its empty collar loop |
| Ritual key | Cat after bell | Releases the exorcist; hidden ending |
| Bell | Kid | Briefly exposes the adult ghost shadow and voice behind the kid |
| Bell | Chief | Makes him visibly nervous and produces a warning |
| Bell | Door symbol | Resonates, indicating that the objects belong to the same ritual system |
| Bell | Cat | Restores the bell to the cat's collar |

Using an item on an irrelevant environmental target produces a short reaction and does not consume the item.

## 4. Scene-by-scene interaction map

### Scene A — Village centre

Visible elements:

- Chief
- Cat
- Hole in the old stone wall
- Path to rented house

Initial presentation:

- The chief notices and welcomes the player.
- The cat ignores the player and tries to reach into the wall hole.
- A metallic glint is barely visible behind the cat.

Available interactions:

| Target | Action | First result | Repeat result |
|---|---|---|---|
| Chief | Greet | Introduces village and rented house | Short atmospheric line |
| Chief | Ask about previous tenant | Gives evasive account | Becomes mildly impatient |
| Chief | Ask about cat | Dismisses it as a stray | Refuses further interest |
| Cat | Approach | Continues digging and ignores player | Same, shorter response |
| Cat | Pet | Pulls away and returns to hole | Annoyed reaction |
| Wall hole | Inspect while cat present | Cat blocks access; metallic glint visible | Same abbreviated result |
| Path | Go to house | Moves player to house entrance; cat follows | Normal navigation |

After the cat has moved to the house:

| Target | Action | Result |
|---|---|---|
| Wall hole | Inspect | Reveals loose stone and hidden bell |
| Bell | Take | Adds bell to inventory |

If the player later possesses the ritual key or bell, the chief becomes a valid item target.

### Scene B — House entrance

Visible elements:

- Kid beside the door
- Cat sitting at a distance and staring at kid
- Unknown symbol carved into door frame
- Door into house
- Path back to village centre

Available interactions:

| Target | Action | Result |
|---|---|---|
| Kid | Greet | Establishes that they know the player is the new tenant |
| Kid | Ask about house | Gives a small warning without explaining why |
| Kid | Ask about cat | Says the cat often watches them |
| Cat | Observe | Cat does not look away from kid |
| Cat | Pet | Cat tolerates or ignores player but continues staring |
| Door symbol | Inspect | Notes a match to the ritual key once key has been found |
| Door | Enter | Moves player to room |
| Path | Return to centre | Allows bell retrieval after cat has moved |

Inventory actions here:

- Bell on kid: expose ghost; remain in playable state
- Bell on cat: restore bell
- Bell on door symbol: resonance clue
- Ritual key on kid: bad ending
- Ritual key on cat without bell: collar hint
- Ritual key on cat after bell: hidden ending
- Ritual key on door symbol: good ending

### Scene C — Player's room

Visible elements:

- Bed
- Bedside table with ritual key
- Previous tenant's belongings
- Damaged wall or floor details
- Door back outside

Available interactions:

| Target | Action | Result |
|---|---|---|
| Ritual key | Inspect | Notes that it has no teeth and matches the door symbol |
| Ritual key | Take | Adds key to inventory |
| Belongings | Search on Cycle 1 | Subtle, incomplete evidence of previous tenant |
| Belongings | Search on Cycle 2+ | Reveals additional loop hints |
| Room | Listen | Hears faint movement or voices |
| Door | Return outside | Returns to house entrance |
| Bed | Rest | Explicit confirmation, then default bad ending |

Rest confirmation:

> The light outside is fading. Rest for the night?

The player must deliberately confirm the action.

## 5. Cycle structure

### Cycle 1

The complete solution is available, but hints are primarily environmental:

- Cat digging at wall
- Metallic glint in hole
- Cat following player
- Cat staring at kid
- Empty loop on cat's collar
- Matching symbols on key and door

An observant player can reach any ending during the first cycle.

### Cycle 2 and later

Following a bad ending:

- Cycle counter increases.
- Physical inventory resets.
- Chief receives an altered introduction.
- Previous tenant belongings gain one or two new notes.
- The failed player's trace becomes part of the house.

Persistent hint 1:

> The cat wasn't digging for food. Something was hidden in the wall.

Persistent hint 2:

> I heard a bell near the child. For a moment, another shadow appeared behind them.

Possible failure-specific hints:

| Previous failure | New warning |
|---|---|
| Rested in house | Do not sleep. The footsteps stop when you wake, but it does not. |
| Used key on kid | The child is not the prisoner. |
| Used key on chief | Do not show him the key. |

Only one or two notes should appear per cycle to keep the room readable.

## 6. Ending specifications

### Bad ending A — Consumed while resting

Trigger:

- Player confirms Rest before activating another ending.

Sequence:

1. Room darkens.
2. Footsteps approach.
3. Door opens without player input.
4. Adult ghost voice addresses player.
5. Screen distorts and fades.
6. A short line establishes that the player's identity remains in the house.
7. Next cycle begins with a new tenant.

### Bad ending B — Ghost released

Trigger:

- Ritual key used on kid, or
- Ritual key used on chief.

Sequence:

1. Binding symbol reacts.
2. Ghost appears behind or through kid.
3. Chief either retreats or completes the release.
4. Player is consumed.
5. Next cycle begins.

### Good ending — Containment

Trigger:

- Ritual key used on house-door symbol.

Sequence:

1. Symbol activates across door and house.
2. Ghost is pulled back into confinement.
3. Player gains an opportunity to leave.
4. Kid remains connected to curse.
5. Chief remains in control of village.
6. Player escapes, but cycle is not permanently resolved.

### Hidden ending — Exorcism

Trigger:

- Bell returned to cat, then ritual key used on cat.

Sequence:

1. Bell rings on restored collar.
2. Ritual key releases exorcist identity.
3. Cat speaks for first time using cloned voice.
4. Backend sends permitted game-state summary to LLM.
5. LLM produces one short exorcist line, maximum 15 words.
6. ElevenLabs generates that line using cloned voice ID.
7. Exorcist seals or expels ghost.
8. Trapped previous tenants are released.
9. Kid is freed.
10. Chief is left to face consequences.
11. Persistent state marks the cycle as broken.

If either live service fails, use a pre-generated exorcist fallback line and complete the ending normally.

## 7. State model

Persistent state:

```javascript
{
  cycleCount: 1,
  previousFailure: null,
  previousTenantWarningUnlocked: false,
  hiddenEndingCompleted: false
}
```

Per-cycle state:

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

Ending priority:

1. Bell returned plus key used on cat: hidden ending
2. Key used on door symbol: good ending
3. Key used on kid or chief: bad release ending
4. Rest confirmed: bad consumption ending

## 8. Dialogue inventory

This is an inventory of required performances, not final dialogue.

### Chief

| ID | State | Purpose |
|---|---|---|
| chief-arrival-1 | Cycle 1 arrival | Welcome player and identify rented house |
| chief-arrival-loop | Cycle 2+ arrival | Refer to most recent previous tenant |
| chief-previous-tenant | Asked about tenant | Evade details |
| chief-house-warning | Asked about house | Downplay rumours |
| chief-cat | Asked about cat | Dismiss cat as irrelevant |
| chief-bell-reaction | Bell used on chief | Reveal fear without explanation |
| chief-key-reaction | Key used on chief | Expose complicity and begin bad ending |
| chief-good-ending | Door sealed | React to player disrupting bargain |

Estimated chief lines: 8–10.

### Kid

| ID | State | Purpose |
|---|---|---|
| kid-greeting | First meeting | Identify player as new tenant |
| kid-house-question | Asked about house | Give mild warning |
| kid-cat-question | Asked about cat | Say cat often watches them |
| kid-repeat | Repeated interaction | Small unsettling observation |
| kid-bell-reaction | Bell used on kid | Physical reaction before ghost reveal |
| kid-hidden-ending | After exorcism | Confirm kid is free |

Estimated kid lines: 5–7, with ghost-controlled speech assigned to ghost voice.

### Ghost

| ID | State | Purpose |
|---|---|---|
| ghost-bell-exposed | Bell used on kid | Brief acknowledgement that player can see it |
| ghost-rest-approach | Default bad ending | Approach sleeping player |
| ghost-consumption | Default bad ending | Establish identity consumption |
| ghost-key-released | Key used on kid | React to being released |
| ghost-chief-release | Chief uses key | Confirm chief's bargain |
| ghost-hidden-confrontation | Exorcist released | Challenge or recognize exorcist |

Estimated ghost lines: 5–6.

### Cat / exorcist

| ID | State | Purpose |
|---|---|---|
| cat-digging | Village centre | Nonverbal effort or annoyed sound |
| cat-staring | House entrance | Quiet nonverbal reaction |
| cat-key-without-bell | Key used too early | Direct attention to empty collar |
| cat-bell-returned | Bell restored | Recognition or transformation cue |
| exorcist-reveal | Hidden ending | First fixed spoken line in cloned voice |
| exorcist-dynamic | Hidden ending | Runtime line based on player behavior |
| exorcist-fallback | API failure | Pre-generated replacement for dynamic line |
| exorcist-seal | Hidden ending | Fixed sealing command |

Estimated spoken exorcist lines: 2–3 fixed plus one dynamic line.

### Previous tenant / narrator text

| ID | State | Purpose |
|---|---|---|
| note-wall | Cycle 2+ | Point toward cat's wall hole |
| note-shadow | Cycle 2+ | Hint that bell exposes ghost |
| note-rest-failure | After rest ending | Warn future tenant not to sleep |
| note-kid-failure | After key-on-kid ending | Correct misunderstanding of kid's role |
| note-chief-failure | After key-on-chief ending | Warn future tenant about chief |

These can remain unvoiced to save credits.

## 9. Estimated audio budget

Target final spoken content:

- Chief: 800–1,100 characters
- Kid: 350–600 characters
- Ghost: 450–700 characters
- Exorcist: 250–450 fixed characters
- Runtime exorcist line: fewer than 100 characters per hidden-ending generation

Target fixed total: approximately 1,850–2,850 characters before retries.

Do not generate final audio until the text-only game is playable and every dialogue entry has a confirmed use.

## 10. Phase 1 acceptance checklist

- [x] Core mystery and loop defined
- [x] Character roles and secrets defined
- [x] Three locations defined
- [x] Ritual-item rules defined
- [x] Three endings defined
- [x] Cycle persistence defined
- [x] Required dialogue inventory defined
- [x] Text-only prototype implemented
- [x] Three scene backgrounds integrated
- [x] Cat-present and cat-departed village states implemented
- [ ] Exact ghost origin finalized, if needed for dialogue
- [ ] Exact visual transformation of cat decided
- [ ] Final dialogue written
- [ ] Required ElevenLabs audio generated and integrated
- [ ] Live hidden-ending pipeline implemented and tested
- [ ] Repository security, fallback behavior, and README verified

The unresolved ghost history and cat transformation can remain deliberately ambiguous until they affect a required line or visual asset.
