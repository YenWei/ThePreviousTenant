"use strict";

const STORAGE_KEY = "previousTenantProgressV1";

// Browser-ready mirror of the approved lines in dialogue.json. Audio playback will
// use the same IDs once the files have been generated.
const dialogue = {
  chief: {
    arrival1: "Ah—you must be the new tenant. Your room is ready. The house is just up the path.",
    arrivalLoop: "Ah… another tenant. The house has been prepared again. You may go up whenever you're ready.",
    greeting: [
      "I trust you found everything you need.",
      "The house is waiting. You should settle in before dark."
    ],
    previousTenant: [
      "Travellers rarely stay long. I've learned not to ask where the road takes them next.",
      "They left before dawn. That is all I can tell you.",
      "You should concern yourself with your own stay."
    ],
    house: [
      "Old houses make old sounds. You'll find it comfortable once you stop listening to every creak.",
      "A little wind gets beneath the doors. Nothing more.",
      "You'll understand once you've spent a night there."
    ],
    cat: [
      "That creature? A stray—with an unfortunate interest in that wall.",
      "It has been digging there for days. It never finds anything.",
      "Leave it alone. It will move when it tires."
    ],
    bell: "Put that away. Some things are buried because they should remain forgotten.",
    key: "Ah… I had hoped you would simply go to sleep. Give me the key.",
    goodEnding: "What have you done? You have saved yourself. Do not mistake that for saving anyone else."
  },
  kid: {
    greeting: [
      "You're the new tenant. I wondered when you'd arrive.",
      "You haven't gone inside yet?",
      "Are you waiting for something?"
    ],
    house: [
      "If you hear walking after dark, don't answer the door.",
      "I used to go inside. I don't anymore.",
      "You should ask the chief. He knows more about it."
    ],
    cat: [
      "It watches me every day. I don't think it likes what it sees.",
      "It was digging at the wall again, wasn't it?",
      "Maybe it's waiting for me to understand."
    ],
    freed: "It's quiet. I don't think I've ever heard it this quiet."
  },
  ghost: {
    bell: "So the bell still remembers me.",
    restApproach: "You should have listened when the footsteps stopped.",
    consumption: "Don't be afraid. The house keeps what the village gives it.",
    keyReleased: "At last… you opened the wrong cage.",
    chiefRelease: "Another name for the house. Our bargain holds.",
    confrontation: "You… you again. Even death could not teach you to leave me buried.",
    sealed: "No—no, NO! You cannot bind me to their silence again!"
  },
  exorcist: {
    reveal: "At last. I was beginning to think no one would notice the bell.",
    fallback: "You saw the pattern. That will have to be enough."
  }
};

const audioByText = new Map([
  ...[
    [dialogue.chief.arrival1, "audio/chief/arrival-1.mp3"],
    [dialogue.chief.arrivalLoop, "audio/chief/arrival-loop.mp3"],
    ...dialogue.chief.greeting.map((text, index) => [text, `audio/chief/greeting-${index === 0 ? "2" : "repeat"}.mp3`]),
    ...dialogue.chief.previousTenant.map((text, index) => [text, `audio/chief/previous-tenant-${index < 2 ? index + 1 : "repeat"}.mp3`]),
    ...dialogue.chief.house.map((text, index) => [text, `audio/chief/house-${index < 2 ? index + 1 : "repeat"}.mp3`]),
    ...dialogue.chief.cat.map((text, index) => [text, `audio/chief/cat-${index < 2 ? index + 1 : "repeat"}.mp3`]),
    [dialogue.chief.bell, "audio/chief/bell-reaction.mp3"],
    [dialogue.chief.key, "audio/chief/key-reaction.mp3"],
    [dialogue.chief.goodEnding, "audio/chief/good-ending.mp3"],
    [dialogue.kid.greeting[0], "audio/kid/greeting-1.mp3"],
    [dialogue.kid.house[0], "audio/kid/house-1.mp3"],
    [dialogue.kid.cat[0], "audio/kid/cat-1.mp3"],
    [dialogue.kid.freed, "audio/kid/hidden-ending.mp3"],
    [dialogue.ghost.bell, "audio/ghost/bell-exposed.mp3"],
    [dialogue.ghost.restApproach, "audio/ghost/rest-approach.mp3"],
    [dialogue.ghost.consumption, "audio/ghost/consumption.mp3"],
    [dialogue.ghost.keyReleased, "audio/ghost/key-released.mp3"],
    [dialogue.ghost.chiefRelease, "audio/ghost/chief-release.mp3"],
    [dialogue.ghost.confrontation, "audio/ghost/hidden-confrontation.mp3"],
    [dialogue.ghost.sealed, "audio/ghost/hidden-sealed.mp3"],
    [dialogue.exorcist.reveal, "audio/exorcist/reveal.mp3"],
    [dialogue.exorcist.fallback, "audio/exorcist/fallback.mp3"]
  ]
]);

let currentAudio = null;

function playDialogueAudio(text) {
  const source = audioByText.get(text);
  if (!source) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  const audio = new Audio(source);
  currentAudio = audio;
  audio.addEventListener("ended", () => { if (currentAudio === audio) currentAudio = null; }, { once: true });
  audio.play().catch(() => { if (currentAudio === audio) currentAudio = null; });
}

function playAudioSource(source) {
  return new Promise((resolve) => {
    if (!source) { window.setTimeout(resolve, 1500); return; }
    if (currentAudio) currentAudio.pause();
    const audio = new Audio(source);
    currentAudio = audio;
    const finish = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.play().catch(finish);
  });
}

const defaultPersistent = () => ({ cycleCount: 1, previousFailure: null, hiddenEndingCompleted: false });
const defaultCycle = () => ({
  scene: "village",
  catMoved: false,
  hasBell: false,
  hasKey: false,
  ghostExposed: false,
  bellReturned: false,
  selectedItem: null,
  interactions: {},
  seen: {}
});

let persistent = loadProgress();
let state = defaultCycle();
let endingAction = null;
let endingSequence = null;
let endingSequenceToken = 0;
let hiddenEndingGeneration = null;

const $ = (selector) => document.querySelector(selector);
const elements = {
  cycle: $("#cycle-count"), kicker: $("#scene-kicker"), title: $("#scene-title"),
  description: $("#scene-description"), image: $("#scene-image"), actions: $("#actions"), inventory: $("#inventory"),
  inventoryHelp: $("#inventory-help"), log: $("#story-log"), reset: $("#reset-button"),
  clearLog: $("#clear-log-button"), confirm: $("#confirm-dialog"), ending: $("#ending-dialog"),
  endingKicker: $("#ending-kicker"), endingTitle: $("#ending-title"), endingText: $("#ending-text"),
  endingButton: $("#ending-button"), cinematic: $("#cinematic-dialog"), cinematicImage: $("#cinematic-image"),
  cinematicSpeaker: $("#cinematic-speaker"), cinematicText: $("#cinematic-text"), cinematicButton: $("#cinematic-button")
};

let cinematicResolve = null;

function showCinematic(image, lines) {
  const entries = Array.isArray(lines) ? lines : [lines];
  let index = 0;
  let token = 0;
  let activeImage = image;
  elements.cinematicImage.src = `${activeImage}?play=${Date.now()}`;
  elements.cinematic.showModal();
  return new Promise((resolve) => {
    cinematicResolve = resolve;
    const advance = async () => {
      token += 1;
      const ownToken = token;
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      if (index >= entries.length) {
        elements.cinematic.close();
        cinematicResolve = null;
        resolve();
        return;
      }
      const entry = entries[index++];
      if (entry.image && entry.image !== activeImage) {
        activeImage = entry.image;
        elements.cinematicImage.src = `${activeImage}?play=${Date.now()}`;
      }
      elements.cinematicSpeaker.textContent = entry.speaker === "Narration" ? "" : entry.speaker || "";
      elements.cinematicText.textContent = entry.text;
      elements.cinematicButton.textContent = "Skip";
      await playAudioSource(entry.audio || audioByText.get(entry.text));
      if (ownToken === token && index < entries.length) advance();
      else if (ownToken === token) elements.cinematicButton.textContent = "Finish scene";
    };
    elements.cinematicButton.onclick = advance;
    advance();
  });
}

function loadProgress() {
  try { return { ...defaultPersistent(), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return defaultPersistent(); }
}

function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent)); }

function log(text, speaker = "") {
  const p = document.createElement("p");
  p.className = `log-entry${speaker === "Narration" ? " system" : ""}`;
  if (speaker) {
    const strong = document.createElement("strong");
    strong.className = "speaker";
    strong.textContent = `${speaker}: `;
    p.append(strong);
  }
  p.append(document.createTextNode(text));
  elements.log.append(p);
  elements.log.scrollTop = elements.log.scrollHeight;
  if (speaker && speaker !== "Narration") playDialogueAudio(text);
}

function once(id, first, repeat, speaker = "Narration") {
  if (state.seen[id]) log(repeat || first, speaker);
  else { state.seen[id] = true; log(first, speaker); }
}

function talk(id, lines, speaker, repeatPoolStart = 1) {
  const count = state.interactions[id] || 0;
  const hasReachedRepeatPool = count >= lines.length;
  const poolSize = lines.length - repeatPoolStart;
  const index = hasReachedRepeatPool && poolSize > 0
    ? repeatPoolStart + Math.floor(Math.random() * poolSize)
    : Math.min(count, lines.length - 1);
  state.interactions[id] = count + 1;
  log(lines[index], speaker);
}

function greetChief() {
  const count = state.interactions.chiefGreeting || 0;
  if (count === 0) {
    state.interactions.chiefGreeting = 1;
    log(persistent.cycleCount === 1 ? dialogue.chief.arrival1 : dialogue.chief.arrivalLoop, "Chief");
    return;
  }
  talk("chiefGreetingFollowup", dialogue.chief.greeting, "Chief", 0);
}

const scenes = {
  village: {
    kicker: "Village centre",
    title: "A welcome with no warmth",
    image: () => state.catMoved ? "assets/scenes/village-cat-departed.png" : "assets/scenes/village-cat-blocking.png",
    alt: () => state.catMoved
      ? "A younger village chief stands beside a half-length wall where a tiny spark shows inside a newly revealed crack."
      : "A younger village chief stands beside a half-length wall where a grey cat completely blocks a damaged spot.",
    description: () => state.catMoved
      ? "The square is quieter without the cat. At the base of the old wall, a tiny spark glints inside a newly exposed crack."
      : "A patient chief waits beside an old stone wall. At its far edge, a grey cat digs furiously with its body pressed against the masonry. The rented house lies up the path.",
    actions: () => [
      ["Greet the chief", greetChief],
      ["Ask about the previous tenant", () => talk("chiefPreviousTenant", dialogue.chief.previousTenant, "Chief")],
      ["Ask about the house", () => talk("chiefHouse", dialogue.chief.house, "Chief")],
      ["Ask about the cat", () => talk("chiefCat", dialogue.chief.cat, "Chief")],
      ["Approach the cat", () => once("cat-approach", "The cat ignores you and presses closer to the wall, completely hiding whatever has its attention.", "The cat keeps its body firmly between you and the masonry.")],
      [state.catMoved ? "Inspect the cracked cavity" : "Inspect where the cat is digging", inspectHole],
      ["Follow the path to the house", () => { state.catMoved = true; state.scene = "entrance"; log("You take the uphill path. Soft paws follow several steps behind."); render(); }]
    ]
  },
  entrance: {
    kicker: "House entrance",
    title: "Someone is already waiting",
    image: "assets/scenes/house-entrance.png",
    alt: "The entrance to an old rural house, with a child at the door and a grey cat watching from the path.",
    description: () => "A child stands beside the rented house. The cat sits beyond arm's reach, staring at them without blinking. A hooked symbol is carved into the door frame.",
    actions: () => [
      ["Greet the kid", () => talk("kidGreeting", dialogue.kid.greeting, "Kid")],
      ["Ask about the house", () => talk("kidHouse", dialogue.kid.house, "Kid")],
      ["Ask about the cat", () => talk("kidCat", dialogue.kid.cat, "Kid")],
      ["Observe the cat", () => once("cat-watch", "The cat never looks away from the kid. An empty loop hangs from its collar.", "Its attention remains fixed on the kid.")],
      ["Inspect the door symbol", () => log(state.hasKey ? "The key's hooked shape matches the carving exactly." : "The carving looks less like a warning than a lock.")],
      ["Enter the house", () => { state.scene = "room"; log("The door yields. The room beyond smells of rain and old paper."); render(); }],
      ["Return to the village centre", () => { state.scene = "village"; log("You leave the cat watching the kid and return downhill."); render(); }]
    ]
  },
  room: {
    kicker: "The rented room",
    title: "The bed has been made",
    image: "assets/scenes/rented-room.png",
    alt: "A dim rented bedroom containing a narrow bed, a ritual key, and an open drawer of abandoned belongings.",
    description: () => "A narrow bed faces a bedside table. Previous tenants' belongings fill a shallow drawer. The room is clean in the way an abandoned place can be clean.",
    actions: () => [
      [state.hasKey ? "Inspect the ritual key" : "Inspect the object on the table", () => log("The key has no teeth. Its hooked end resembles the symbol carved beside the front door.")],
      ...(!state.hasKey ? [["Take the ritual key", () => { state.hasKey = true; log("You take the ritual key. It is warmer than the room."); render(); }]] : []),
      ["Search the previous tenant's belongings", showNotes],
      ["Listen to the room", () => once("listen", "A floorboard creaks outside. Then another, closer, though nobody entered.", "The sound stops whenever you hold your breath.")],
      ["Return outside", () => { state.scene = "entrance"; log("You step back into the fading light."); render(); }],
      ["Rest for the night", () => elements.confirm.showModal()]
    ]
  }
};

function inspectHole() {
  if (!state.catMoved) return once("blocked-hole", "The cat plants itself across the damaged section. You cannot see what lies behind it.", "The cat will not let you inspect the wall.");
  if (state.hasBell || state.bellReturned) return log("The loose stone now hides only an empty hollow.");
  state.hasBell = true;
  log("Behind the loose stone you find a tarnished brass bell. Its mounting fits the empty loop on the cat's collar.");
  render();
}

function showNotes() {
  if (persistent.cycleCount === 1) return once("notes", "A damp receipt, a broken pencil, and a page ending mid-sentence. Nothing explains why they left.", "The unfinished page offers no clearer answer.");
  const clues = {
    rest: "A fresh line scratches through the page: DO NOT SLEEP. The footsteps stop when you wake, but it does not.",
    kid: "A fresh line scratches through the page: The child is not the prisoner.",
    chief: "A fresh line scratches through the page: Do not show him the key."
  };
  log(clues[persistent.previousFailure] || "A note reads: The cat wasn't digging for food. Something was hidden in the wall.");
  log("Beneath it: I heard a bell near the child. Another shadow appeared behind them.");
}

function itemTargets() {
  if (state.scene === "village") return [["Use it on the chief", "chief"], ["Use it on the wall hole", "hole"]];
  if (state.scene === "entrance") return [["Use it on the kid", "kid"], ["Use it on the cat", "cat"], ["Use it on the door symbol", "symbol"]];
  return [["Use it on the bed", "bed"]];
}

function useItem(target) {
  const item = state.selectedItem;
  state.selectedItem = null;
  if (item === "key") {
    if (target === "kid") return endBadKid();
    if (target === "chief") return endBadChief();
    if (target === "symbol") return endGood();
    if (target === "cat") {
      if (state.bellReturned) return endHidden();
      log("Nothing happens. The cat hooks one claw beneath the empty loop on its collar.");
    } else log("The key warms, but no binding answers it.");
  } else {
    if (target === "kid") {
      state.ghostExposed = true;
      log("The kid recoils as the bell rings. A tall adult shadow rises behind them.", "Narration");
      showCinematic("assets/scenes/cinematic-bell-reveal.gif", [{ speaker: "Ghost", text: dialogue.ghost.bell }]);
    }
    else if (target === "chief") log(dialogue.chief.bell, "Chief");
    else if (target === "symbol") log("The bell resonates with the carving. For a moment, thin lines spread across the whole house.");
    else if (target === "cat") {
      state.hasBell = false;
      state.bellReturned = true;
      log("The bell locks into the cat's collar. It looks at you for the first time.");
      prepareHiddenEndingLine();
    }
    else log("The bell gives a dull note. Nothing reveals itself.");
  }
  render();
}

function beginBadCycle(reason, ending) {
  persistent.previousFailure = reason;
  persistent.cycleCount += 1;
  saveProgress();
  showEnding("The cycle continues", "A new previous tenant", ending, "Begin the next cycle", () => {
    state = defaultCycle();
    elements.log.textContent = "";
    log("The village waits as though nothing happened.");
    render();
  });
}

async function endBadKid() {
  await showCinematic("assets/scenes/cinematic-key-girl.gif", [
    { speaker: "Narration", text: "The key turns in empty air. The child's shadow rises behind them—adult, vast, and suddenly free." },
    { speaker: "Ghost", text: dialogue.ghost.keyReleased }
  ]);
  beginBadCycle("kid", [
    { speaker: "Narration", text: "The room keeps your name. Somewhere beyond the dark, another traveller enters the village." }
  ]);
}

async function endBadChief() {
  await showCinematic("assets/scenes/cinematic-chief-bargain.gif", [
    { speaker: "Chief", text: dialogue.chief.key },
    { speaker: "Narration", text: "He takes the key, speaks an old word, and the child's distant shadow unfolds." },
    { speaker: "Ghost", text: dialogue.ghost.chiefRelease }
  ]);
  beginBadCycle("chief", [
    { speaker: "Narration", text: "The room keeps your name. Somewhere beyond the dark, another traveller enters the village." }
  ]);
}

async function restEnding() {
  persistent.previousFailure = "rest";
  persistent.cycleCount += 1;
  saveProgress();
  await showCinematic("assets/scenes/cinematic-rest-night.gif", [
    { speaker: "Narration", text: "Footsteps cross the room after midnight. The door opens by itself." },
    { speaker: "Ghost", text: dialogue.ghost.restApproach },
    { speaker: "Ghost", text: dialogue.ghost.consumption }
  ]);
  showEnding("Bad ending", "The previous tenant", [
    { speaker: "Narration", text: "By morning, the house remembers your voice, but the village does not remember you." }
  ], "Begin the next cycle", () => { state = defaultCycle(); elements.log.textContent = ""; log("Another tenant arrives beneath the same colourless sky."); render(); });
}

async function endGood() {
  await showCinematic("assets/scenes/cinematic-door-sealed.gif", [
    { speaker: "Narration", text: "The key enters the carved symbol. Pale lines race across the walls and pull the waiting shadow back inside." },
    { speaker: "Chief", text: dialogue.chief.goodEnding }
  ]);
  showEnding("Good ending", "The house is sealed", [
    { speaker: "Narration", text: "You escape—but the kid, the chief, and the village remain bound to their bargain." }
  ], "Return to the title scene", () => { state = defaultCycle(); render(); });
}

async function endHidden() {
  persistent.hiddenEndingCompleted = true;
  saveProgress();
  const pending = prepareHiddenEndingLine();
  let waitingTimer = null;
  if (!hiddenEndingGeneration.ready) {
    waitingTimer = window.setTimeout(() => {
      log("The bell begins to hum. Something old is waking…", "Narration");
    }, 250);
  }
  const generated = await pending;
  if (waitingTimer) window.clearTimeout(waitingTimer);
  await showCinematic("assets/scenes/cinematic-hidden-ritual.gif", [
    { speaker: "Narration", text: "The key touches the restored bell. The cat stands, and an exorcist's shadow stands with it." },
    { speaker: "Exorcist", text: dialogue.exorcist.reveal },
    { speaker: "Exorcist", text: generated.text, audio: generated.audio },
    { speaker: "Ghost", text: dialogue.ghost.confrontation, image: "assets/scenes/cinematic-hidden-confrontation.gif" },
    { speaker: "Ghost", text: dialogue.ghost.sealed, image: "assets/scenes/cinematic-hidden-binding.gif" },
    { speaker: "Narration", text: "The binding takes hold. Old voices lift from the house like breath from cold glass.", image: "assets/scenes/cinematic-hidden-release.gif" },
    { speaker: "Kid", text: dialogue.kid.freed }
  ]);
  showEnding("Hidden ending", "The previous tenants are released", [
    { speaker: "Narration", text: "The ghost is sealed and the traces of previous tenants lift from the house." },
    { speaker: "Narration", text: "The chief is left to face what remains." }
  ], "Walk away", () => { state = defaultCycle(); elements.log.textContent = ""; log("The bell is silent. This time, the silence is peaceful."); render(); });
}

function prepareHiddenEndingLine() {
  const signature = JSON.stringify({
    cycleCount: persistent.cycleCount,
    previousFailure: persistent.previousFailure || "none",
    bellReturned: state.bellReturned,
    ghostExposed: state.ghostExposed
  });
  if (!hiddenEndingGeneration || hiddenEndingGeneration.signature !== signature) {
    const request = requestHiddenEndingLine();
    const generation = { signature, ready: false, promise: request };
    hiddenEndingGeneration = generation;
    request.finally(() => { generation.ready = true; });
  }
  return hiddenEndingGeneration.promise;
}

async function requestHiddenEndingLine() {
  try {
    const response = await fetch("/api/hidden-ending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cycleCount: persistent.cycleCount,
        previousFailure: persistent.previousFailure || "none",
        bellReturned: state.bellReturned,
        ghostExposed: state.ghostExposed
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result.text || !result.audio) throw new Error("Incomplete response");
    return result;
  } catch (error) {
    console.info("Live hidden-ending generation unavailable; using the fixed fallback.", error);
    return { text: dialogue.exorcist.fallback, audio: audioByText.get(dialogue.exorcist.fallback) };
  }
}

function showEnding(kicker, title, lines, button, action) {
  elements.endingKicker.textContent = kicker;
  elements.endingTitle.textContent = title;
  endingSequenceToken += 1;
  endingSequence = { entries: Array.isArray(lines) ? lines : [{ text: lines }], index: 0, finalButton: button, token: endingSequenceToken };
  endingAction = action;
  elements.ending.showModal();
  showNextEndingLine(endingSequence.token);
}

async function showNextEndingLine(token) {
  if (!endingSequence || endingSequence.token !== token) return;
  if (endingSequence.index >= endingSequence.entries.length) {
    elements.endingButton.textContent = endingSequence.finalButton;
    elements.endingButton.dataset.action = "finish";
    return;
  }
  const { speaker, text, audio } = endingSequence.entries[endingSequence.index++];
  elements.endingText.textContent = "";
  const p = document.createElement("p");
  if (speaker && speaker !== "Narration") {
    const strong = document.createElement("strong");
    strong.className = "speaker";
    strong.textContent = `${speaker}: `;
    p.append(strong);
  }
  if (speaker === "Narration") p.className = "system";
  p.append(document.createTextNode(text));
  elements.endingText.append(p);
  elements.endingButton.textContent = "Continue";
  elements.endingButton.dataset.action = "continue";
  await playAudioSource(audio || audioByText.get(text));
  if (endingSequence && endingSequence.token === token) showNextEndingLine(token);
}

function render() {
  const scene = scenes[state.scene];
  elements.cycle.textContent = persistent.cycleCount;
  elements.kicker.textContent = scene.kicker;
  elements.title.textContent = scene.title;
  elements.description.textContent = scene.description();
  elements.image.src = typeof scene.image === "function" ? scene.image() : scene.image;
  elements.image.alt = typeof scene.alt === "function" ? scene.alt() : scene.alt;
  elements.actions.textContent = "";

  scene.actions().forEach(([label, action]) => addAction(label, action));
  if (state.selectedItem) itemTargets().forEach(([label, target]) => addAction(label, () => useItem(target), true));

  elements.inventory.textContent = "";
  const items = [];
  if (state.hasBell) items.push(["bell", "Brass bell"]);
  if (state.hasKey) items.push(["key", "Ritual key"]);
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "inventory-empty";
    empty.textContent = state.bellReturned ? "Bell returned to cat" : "Empty";
    elements.inventory.append(empty);
  }
  items.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `inventory-button${state.selectedItem === id ? " selected" : ""}`;
    button.setAttribute("aria-pressed", state.selectedItem === id);
    button.textContent = label;
    button.addEventListener("click", () => { state.selectedItem = state.selectedItem === id ? null : id; render(); });
    elements.inventory.append(button);
  });
  elements.inventoryHelp.textContent = state.selectedItem ? "Now choose a ◇ target under What do you do?" : "Select an item, then choose a highlighted target.";
}

function addAction(label, action, itemTarget = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `action-button${itemTarget ? " item-target" : ""}`;
  button.textContent = label;
  button.addEventListener("click", action);
  elements.actions.append(button);
}

elements.confirm.addEventListener("close", () => { if (elements.confirm.returnValue === "confirm") restEnding(); });
elements.endingButton.addEventListener("click", () => {
  if (elements.endingButton.dataset.action === "continue") {
    endingSequenceToken += 1;
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (endingSequence) { endingSequence.token = endingSequenceToken; showNextEndingLine(endingSequence.token); }
    return;
  }
  endingSequence = null;
  elements.ending.close();
  if (endingAction) endingAction();
});
elements.clearLog.addEventListener("click", () => { elements.log.textContent = ""; });
elements.reset.addEventListener("click", () => {
  if (!window.confirm("Reset all cycles and discovered progress?")) return;
  localStorage.removeItem(STORAGE_KEY);
  persistent = defaultPersistent();
  state = defaultCycle();
  elements.log.textContent = "";
  log("Progress reset. A new tenant arrives.");
  render();
});

log("The road ends at a village that seems to have been expecting you.");
render();
