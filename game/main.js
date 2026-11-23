// Boot + screen flow. Lifecycle: firstFrameReady() once the loading screen ("Loading…") is painted, gameReady() once
// the first interactive screen is up (or the error screen with Retry); loadData() before any saveData()
// (playables-bridge.js enforces it). YouTube pause/resume freezes everything (ui/pause.js).
import { icon } from "./ui/icons.js";
import { playables } from "./playables-bridge.js";
import { parseSave, serializeSave, setSettings, markIntro, setCheckpoint, checkpointFor, markSeen, markHand } from "./core/save.js";
import { today, dueCards, nagCards, isDue, sessionSize } from "./core/srs.js";
import { PRACTICE_MIN } from "./core/practice.js";
import { meter } from "./core/room.js";
import { roomWon, cardGraded, repairSave } from "./core/progress.js";
import { restStops } from "./core/taps.js";
import { wingLoader, whyLoader } from "./core/content.js";
import { roomPictures } from "./core/pictures.js";
import { makeFetchJson } from "./core/net.js";
import { createSaver, everyNth, onlyNew } from "./core/saver.js";
import { bootOutcome, createScreens } from "./core/boot.js";
import { isOwnError } from "./core/oops.js";
import { later, realLater } from "./core/clock.js";
import { applyLang, resolveLang, t, tFor } from "./i18n.js";
import { h } from "./ui/kit.js";
import { renderMap } from "./ui/map.js";
import { playRoom } from "./ui/room.js";
import { playRelight } from "./ui/relight.js";
import { showIntro } from "./ui/intro.js";
import { setSigns } from "./ui/signs.js";
import { setWhy } from "./ui/why.js";
import { openSettings } from "./ui/settings.js";
import { showGuide } from "./ui/guide.js";
import { installTips } from "./ui/tips.js";
import { pauseGame, resumeGame, whenPausedSave } from "./ui/pause.js";
import { installKeys, usingKeyboard } from "./ui/keys.js";
import { setSound } from "./ui/sound.js";
import { showMilestone } from "./ui/milestone.js";
import { newMilestones } from "./core/milestones.js";
import { showOops } from "./ui/oops.js";
import { showNotice, hideNotice } from "./ui/notice.js";
import { stopDetached } from "./ui/fit.js";
import { installPicRetry } from "./ui/pic-retry.js";

const app = document.getElementById("app");
// the game's own folder: an uncaught error from a file under it is the game's (core/oops.js)
const GAME_BASE = new URL(".", import.meta.url).href;
let pack;
// every file load has a time limit and a few tries (core/net.js)
const fetchJson = makeFetchJson({ fetch: (...args) => fetch(...args), later });
// room steps live in one file per wing (core/content.js), fetched the first time a room of that wing opens; made once
// the pack is loaded, because a wing file must carry the pack's build id
let loadRoom = null;
// "what the picture shows" lines live in their own file (core/content.js), fetched once the first screen is up
let loadWhy = null;
let whyReady = false;
let save;
let hostLang = null;
// The language follows YouTube (getLanguage) until the player picks English or Urdu; that choice is kept in the save
// (settings.lang) and wins on every later launch.
const playerLang = () => save?.settings.lang ?? "auto";

const ownCards = () => Object.values(save.cards).filter((c) => pack.words[c.id]);
const dueCount = () => dueCards(ownCards(), today()).length;
// lamps the map asks for: not the words learnt today that are due again today (srs.js isFresh)
const nagCount = () => nagCards(ownCards(), today()).length;
// The number on the map's Relight button: 0 while only today's new words are due (no nagging on the day they were
// learnt), else the lamps the Relight session will really serve (it serves today's new words too), so the button and
// Relight's own "left" counter agree.
const relightCount = () => (nagCount() ? Math.min(dueCount(), sessionSize(dueCount())) : 0);
const applyCaptions = () => document.body.classList.toggle("nocap", !save.settings.captions);
// "Show how to say it": the Latin spelling under Arabic words (hidden by CSS unless this class is on)
const applySay = () => document.body.classList.toggle("say-on", Boolean(save.settings.say));
const applySound = () => setSound({ wanted: save.settings.sound });
// The Urdu font file is only fetched once Urdu is the game's language (index.html: --urdu names it only under
// .urdu-font). It stays on after that, so switching back and forth never swaps fonts twice.
const URDU_FONT_CLASS = "urdu-font";
const applySessionLang = () => {
  const code = resolveLang(playerLang(), hostLang ?? "en");
  if (code === "ur") document.documentElement.classList.add(URDU_FONT_CLASS);
  applyLang(code);
};
// one frame painted (or 50 ms when the tab is in the background and frames are held back)
const nextPaint = () => new Promise((resolve) => { requestAnimationFrame(() => resolve()); later(resolve, 50); });

// ---- Pictures ahead of time. Once a room's file is in, its paintings are fetched while the player is still on the
// screen before it (the intro, the map), so the room opens with its pictures already there. Idle time only, a few at
// a time; a failure here costs nothing (the room asks again itself, ui/pic-retry.js).
const WARM_LIMIT = 40; // pictures per room: more than any room shows on its first steps
const WARM_AT_ONCE = 4;
const WARM_IDLE_MS = 300;
const warmed = new Set();
const whenIdle = (fn) => (typeof requestIdleCallback === "function" ? requestIdleCallback(fn, { timeout: 2000 }) : later(fn, WARM_IDLE_MS));

function warmPictures(room) {
  const queue = roomPictures(pack.words, room, WARM_LIMIT).filter((file) => !warmed.has(file));
  queue.forEach((file) => warmed.add(file));
  const next = () => {
    const file = queue.shift();
    if (!file) return;
    const img = new Image();
    img.decoding = "async";
    img.onload = img.onerror = () => whenIdle(next);
    img.src = file;
  };
  whenIdle(() => { for (let i = 0; i < WARM_AT_ONCE; i++) next(); });
}

/** Fetch a room's file and then its pictures, behind the current screen. Never throws: the door tries again itself. */
const warmRoom = (header) => { loadRoom(header).then(warmPictures).catch(() => {}); };

// ---- Saving. Every write goes through one queue (core/saver.js): one at a time, the newest state last, a failed
// write tried again. Nothing in the game waits for a save: the screen moves on and the write finishes behind it.
const SAVE_EVERY_ANSWERS = 4; // warm-up and Relight answers reach the cloud every few answers, and on pause or leaving
const SAVE_NOTICE = "save";
const answers = everyNth(SAVE_EVERY_ANSWERS);
const saver = createSaver({
  write: (value) => playables.saveData(value),
  // real time, not the game clock: a pause is often the end of the session, so a save that failed while YouTube has
  // the game paused is tried again then, not after resume
  later: realLater,
  // told only after several failures in a row; gone again with the first write that works
  onFailing: (failing) => (failing ? showNotice(SAVE_NOTICE, "saveRetry") : hideNotice(SAVE_NOTICE)),
});
const unsent = onlyNew();

/** Send the save if it changed since the last send. `save` is never mutated, so "same object" means "nothing new":
 *  a finished room is one write, not two. */
function persist() {
  if (!save || !playables.canSave || !unsent(save)) return;
  answers.reset();
  saver.request(serializeSave(save));
}

/** YouTube paused the game, or the player left a screen: send what is new, and retry at once a write that failed. */
function persistNow() {
  persist();
  if (playables.canSave) saver.flush();
}

/** A warm-up or Relight answer was graded: it is in `save` at once (a pause-save includes it) and goes to the cloud
 *  with every few answers. */
function cardAnswered(card) {
  save = cardGraded(save, card);
  if (answers.tick()) persist();
}

// ---- Screens. One screen owns #app at a time. Its token changes whenever a new one takes over, so a screen that was
// replaced (by the "Something went wrong" card, say) cannot carry on when its promise ends later.
// The door lock (a door was tapped and its room is loading: every other tap on the map waits) lives there too
// (core/boot.js createScreens).
const screens = createScreens();
let mapCtl = null; // the map on screen (ui/map.js), or null
let oopsOpen = false;
let retryScreen = () => showMap();
const take = () => { mapCtl = null; return screens.take(); };

/** Run a screen function; whatever it throws, now or later, ends on the "Something went wrong" card. */
function run(fn) {
  try {
    Promise.resolve(fn()).catch(oops);
  } catch {
    oops();
  }
}

/** The safety net: Try again (the screen the player was on, from its last checkpoint) or Back to the map. */
function oops() {
  if (oopsOpen) return;
  if (!pack || !save) { bootScreen("bootError"); return; } // nothing to go back to yet
  oopsOpen = true;
  take();
  persistNow();
  const go = (fn) => () => { oopsOpen = false; run(fn); };
  try {
    showOops(app, { onRetry: go(retryScreen), onMap: go(showMap) });
  } catch {
    oopsOpen = false;
    bootScreen("bootError");
  }
}

/** focus: a selector for the control keyboard focus returns to (the dock button just used); default the next door. */
function showMap(focus) {
  take();
  retryScreen = () => showMap();
  const backToMap = (selector) => () => run(() => showMap(selector));
  mapCtl = renderMap(app, {
    pack, save, meterPct: meter(pack, save.rooms), due: relightCount(),
    // nothing due: the same button offers Quick practice instead (never graded), once there are words to practise
    canPractice: ownCards().length >= PRACTICE_MIN,
    onRoom: (id) => run(() => enterRoom(pack.rooms.find((r) => r.id === id))),
    onRelight: () => run(() => enterRelight()),
    onPractice: () => run(() => enterRelight({ practice: true })),
    onGuide: () => {
      if (screens.locked) return;
      take();
      run(() => showGuide(app, { pack, cards: save.cards, day: today(), due: nagCount(), meterPct: meter(pack, save.rooms), onBack: backToMap(".dock-btn[data-t-aria=guide]") }));
    },
    onSettings: () => {
      if (screens.locked) return;
      run(() => openSettings(app, {
        settings: save.settings, credits: pack.credits,
        onChange: (patch) => {
          // every choice is kept, the language too (it then wins over YouTube's language on later launches)
          save = setSettings(save, patch);
          persist();
          applySessionLang();
          applyCaptions();
          applySay();
          applySound();
          showMap(".dock-btn[data-t-aria=settings]");
        },
      }));
    },
  });
  stopDetached(); // the screen the map replaced is gone: stop its fit-to-screen watchers (ui/fit.js)
  fetchWhy(); // a no-op once the picture lines are in
  if (usingKeyboard()) (focus && app.querySelector(focus) || mapCtl.target)?.focus({ preventScroll: true });
  // fetch the next room's wing now, so its door opens without a wait (a failure here is tried again when the door is tapped)
  const next = pack.rooms.find((r) => !save.rooms[r.id]);
  if (next) warmRoom(next);
}

/** The room with its steps, or null after telling the player it could not be opened (the map stays, the door works again). */
async function openRoom(header) {
  try {
    return await loadRoom(header);
  } catch {
    playables.logError();
    showNotice("room", "roomLoadError", { timeoutMs: 8000, role: "alert" });
    return null;
  }
}

/** first: the very first room, entered from the intro's Start (it opens on its first step: one Start press). */
async function enterRoom(header, { first = false } = {}) {
  if (!screens.lock()) return; // a second tap while the room loads must not start it twice
  const from = screens.current;
  mapCtl?.setOpening(header.id);
  const room = await openRoom(header);
  if (!screens.owns(from)) return; // another screen took over while the wing loaded
  screens.unlock();
  if (!room) return showMap();
  retryScreen = () => enterRoom(header, { first });
  if (save.rooms[room.id] && room.steps.some((s) => s.type === "passage")) return rereadRoom(room);
  const mine = take();
  const before = meter(pack, save.rooms);
  const replay = Boolean(save.rooms[room.id]);
  const after = replay ? before : room.coverageAfter;
  let roomsBefore = save.rooms;
  // only the room ahead keeps a checkpoint: replaying a finished room never overwrites the player's place
  const onCheckpoint = (at, { persist: now }) => {
    if (replay) return;
    save = setCheckpoint(save, at);
    if (now) persist();
  };
  // The room is saved the moment it is won, before the "Room lamp lit" card is drawn: closing the game or tapping
  // Map on that card keeps the lamp and the cards. The card's ▶ only moves on.
  const onFinished = (cards) => {
    roomsBefore = save.rooms;
    save = roomWon(save, room.id, cards);
    persist();
  };
  const result = await playRoom({
    root: app, pack, room, cards: save.cards, day: today(),
    meterBefore: before, meterAfter: Math.max(before, after),
    resume: replay ? null : checkpointFor(save, room), rests: restStops(room, pack.words),
    onCheckpoint, onCard: cardAnswered, onFinished,
    // the tutorial hand shows once per game for the whole save (it goes to the cloud with the next save)
    hands: save.hands ?? [], onHand: (type) => { save = markHand(save, type); },
    skipStakes: first,
  });
  if (!screens.owns(mine)) return;
  if (result.failed) { persistNow(); return oops(); }
  if (result.finished) {
    // one-time milestone cards this room reached (core/milestones.js), then the map
    for (const id of newMilestones(pack, roomsBefore, save.rooms, save.seen)) {
      await showMilestone(app, { pack, id });
      if (!screens.owns(mine)) return;
      save = markSeen(save, `m:${id}`);
    }
  }
  persistNow(); // the place in an unfinished room, warm-up answers, milestone cards seen: whatever is new
  showMap();
}

/** A finished Reading Room opens straight on its passage, with fading words dim (ui/room.js `reread`). Nothing saved. */
async function rereadRoom(room) {
  const mine = take();
  const day = today();
  const faded = new Set(Object.values(save.cards).filter((c) => isDue(c, day)).map((c) => c.id));
  const pct = meter(pack, save.rooms);
  const result = await playRoom({
    root: app, pack, room: { ...room, steps: room.steps.filter((s) => s.type === "passage") }, cards: save.cards, day,
    meterBefore: pct, meterAfter: pct, reread: true, faded,
    hands: save.hands ?? [], onHand: (type) => { save = markHand(save, type); },
  });
  if (!screens.owns(mine)) return;
  if (result.failed) return oops();
  showMap();
}

/** practice: Quick practice (nothing is graded; only mix-ups are noted), offered when no lamp is due. */
async function enterRelight({ practice = false } = {}) {
  if (screens.locked) return;
  const mine = take();
  retryScreen = () => enterRelight({ practice });
  const firstTime = !practice && !save.seen.includes("relight");
  // every lamp is in the save as soon as it is graded, and in the cloud every few lamps and when the last one is lit
  await playRelight({ root: app, pack, cards: save.cards, day: today(), firstTime, practice, onCard: cardAnswered, onAllLit: persist });
  if (!screens.owns(mine)) return;
  if (firstTime) save = markSeen(save, "relight");
  persistNow();
  showMap();
}

// The player's language is not known yet on these two screens, so they say it in English and Urdu.
const bothLangs = (key, tag = "span") => [
  h(tag, { class: "loading-text", lang: "en", dir: "ltr" }, tFor("en", key)),
  h(tag, { class: "loading-text", lang: "ur", dir: "rtl" }, tFor("ur", key)),
];

function loadingScreen() {
  take();
  app.replaceChildren(h("div", { class: "loading", role: "status" },
    h("span", { class: "loading-lamp", "aria-hidden": "true" }, icon("lamp")), ...bothLangs("loading")));
}

/** A boot screen that says plainly what is wrong and offers Try again, and lets YouTube drop its spinner (INT-04).
 *  key: the message. onUnsaved: also offer "Play without saving" (the save could not be loaded or read; the game
 *  itself is ready). Nothing is ever written over a save that was not loaded and understood. */
function bootScreen(key, onUnsaved = null) {
  take();
  const both = (k) => `${tFor("en", k)} · ${tFor("ur", k)}`;
  const retry = h("button", { class: "pill retry-btn", onclick: () => { loadingScreen(); start(); } }, both("retry"));
  const unsaved = onUnsaved ? h("button", { class: "pill retry-btn", onclick: onUnsaved }, both("playUnsaved")) : null;
  app.replaceChildren(h("div", { class: "loading boot-error", role: "alert" },
    h("span", { class: "loading-lamp still", "aria-hidden": "true" }, icon("lamp")), ...bothLangs(key, "p"),
    h("div", { class: "boot-choices" }, retry, unsaved)));
  playables.gameReady();
  retry.focus();
}

// Each piece is kept once it has arrived, so Try again only asks again for what failed.
async function loadPack() {
  if (pack) return;
  const json = await fetchJson("content/pack.json");
  if (!Array.isArray(json?.rooms) || !json.rooms.length || typeof json.words !== "object" || json.words === null) throw new Error("content/pack.json: not a pack");
  pack = json;
  loadRoom = wingLoader(fetchJson, pack.build);
  loadWhy = whyLoader(fetchJson, pack.build);
}

/** Fetch the picture lines behind the first screen. Nothing waits for them: until they arrive a long-press shows a
 *  word's meaning without its picture line. A failed fetch is tried again the next time the map is shown. */
function fetchWhy() {
  if (whyReady || !loadWhy) return;
  loadWhy().then((words) => {
    if (!words || whyReady) return;
    whyReady = true;
    setWhy(pack.words, words);
  });
}
async function loadLang() {
  hostLang ??= await playables.getLanguage(); // never rejects: English when YouTube does not answer in time
}

/** The player picked "Play without saving": this session starts from an empty game and writes nothing. */
function playUnsaved() {
  playables.blockSaves();
  save = parseSave("").save;
  run(begin);
  showNotice("unsaved", "savedOff", { timeoutMs: 8000 });
}

async function start() {
  // Already loaded (Try again on a screen shown after boot): keep the save in memory, which may be newer than the
  // cloud's, and go straight to the first screen.
  if (pack && save) return run(begin);
  try {
    // the pack and the language first, so a save that cannot be loaded still leaves a game that can be played
    const [loaded] = await Promise.allSettled([playables.loadData(), loadPack(), loadLang()]);
    // Which screen (core/boot.js): a cloud save that did not load, cannot be read or is from a newer version is said
    // plainly, with Try again; the player only starts unsaved by choosing to. Stored data that was not understood
    // stays exactly as it is (saving is off).
    const outcome = bootOutcome({ hasPack: Boolean(pack), loaded });
    if (outcome.blockSaves) playables.blockSaves();
    if (outcome.screen !== "play") {
      if (!pack) playables.logError();
      bootScreen(outcome.screen, outcome.canPlayUnsaved ? playUnsaved : null);
      return;
    }
    save = repairSave(pack, outcome.save, today());
  } catch {
    playables.logError();
    bootScreen("bootError");
    return;
  }
  // Boot ends here. The first screen (for a new player: the intro and the whole first room) runs under the safety
  // net, so an error in it shows "Something went wrong" and keeps the save in memory, not "The game could not load".
  run(begin);
}

/** The pack and a save are ready: the first screen. */
async function begin() {
  setSigns(pack.words);
  applySessionLang();
  applyCaptions();
  applySay();
  applySound();
  if (save.intro) {
    showMap();
    playables.gameReady();
    return;
  }
  take();
  retryScreen = () => begin();
  const intro = showIntro(app, {
    current: resolveLang(playerLang(), hostLang ?? "en"),
    // kept in the save; it goes to the cloud with the first write (when ▶ is pressed)
    onLang: (code) => { save = setSettings(save, { lang: code }); applySessionLang(); },
  });
  playables.gameReady();
  // the first room's file loads while the player reads the intro, so ▶ opens it without a wait
  warmRoom(pack.rooms[0]);
  fetchWhy();
  const mine = screens.current;
  await intro;
  if (!screens.owns(mine)) return;
  save = markIntro(save);
  persist();
  loadingScreen(); // seen only if the room's file is still on its way
  return enterRoom(pack.rooms[0], { first: true });
}

async function boot() {
  loadingScreen();
  await nextPaint();
  playables.firstFrameReady();
  installTips();
  installKeys();
  installPicRetry();
  whenPausedSave(persistNow);
  playables.onPause(pauseGame);
  playables.onResume(resumeGame);
  // YouTube can turn game audio off at any time; sound.js stays silent until it is back on
  setSound({ host: playables.isAudioEnabled() });
  playables.onAudioEnabledChange((on) => setSound({ host: on }));
  // The last safety net: an error of the game's own that nothing caught (a tap handler, a timer) would leave a dead
  // screen. Show the "Something went wrong" card instead. Nothing is logged or sent anywhere.
  addEventListener("error", (e) => {
    if (isOwnError({ filename: e.filename, stack: e.error?.stack, name: e.error?.name, message: e.message }, GAME_BASE)) oops();
  });
  addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    if (isOwnError({ stack: reason?.stack, name: reason?.name, message: reason?.message }, GAME_BASE)) oops();
  });
  await start();
}

boot().catch(() => bootScreen("bootError"));
