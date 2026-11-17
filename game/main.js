// Boot + screen flow. Lifecycle: firstFrameReady() once the loading screen ("Loading…") is painted, gameReady() once
// the first interactive screen is up (or the error screen with Retry); loadData() before any saveData()
// (playables-bridge.js enforces it). YouTube pause/resume freezes everything (ui/pause.js).
import { playables } from "./playables-bridge.js";
import { parseSave, serializeSave, markRoom, setCards, setSettings, markIntro, setCheckpoint, checkpointFor, markSeen } from "./core/save.js";
import { today, dueCards, isDue, RELIGHT_CAP } from "./core/srs.js";
import { meter, missingCards } from "./core/room.js";
import { restStops } from "./core/taps.js";
import { wingLoader } from "./core/content.js";
import { later } from "./core/clock.js";
import { applyLang, resolveLang, t, tFor } from "./i18n.js";
import { h } from "./ui/kit.js";
import { renderMap } from "./ui/map.js";
import { playRoom } from "./ui/room.js";
import { playRelight } from "./ui/relight.js";
import { showIntro } from "./ui/intro.js";
import { setSigns } from "./ui/signs.js";
import { openSettings } from "./ui/settings.js";
import { showGuide } from "./ui/guide.js";
import { installTips } from "./ui/tips.js";
import { pauseGame, resumeGame, whenPausedSave } from "./ui/pause.js";
import { installKeys, usingKeyboard } from "./ui/keys.js";
import { setSound } from "./ui/sound.js";
import { showMilestone } from "./ui/milestone.js";
import { newMilestones } from "./core/milestones.js";

const app = document.getElementById("app");
let pack;
// room steps live in one file per wing (core/content.js), fetched the first time a room of that wing opens
const fetchJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};
const loadRoom = wingLoader(fetchJson);
let save;
let hostLang = "en";
// This session's English / Urdu choice. Never saved: YouTube's language can change between sessions, so each launch
// starts from it again (Playables SDK guidance on getLanguage).
let sessionLang = "auto";

const dueCount = () => dueCards(Object.values(save.cards).filter((c) => pack.words[c.id]), today()).length;
const applyCaptions = () => document.body.classList.toggle("nocap", !save.settings.captions);
const applySound = () => setSound({ wanted: save.settings.sound });
const applySessionLang = () => applyLang(resolveLang(sessionLang, hostLang));
// one frame painted (or 50 ms when the tab is in the background and frames are held back)
const nextPaint = () => new Promise((resolve) => { requestAnimationFrame(() => resolve()); later(resolve, 50); });

async function persist() {
  if (playables.saveBlocked || !save) return;
  await playables.saveData(serializeSave(save));
}

/** focus: a selector for the control keyboard focus returns to (the dock button just used); default the next door. */
function showMap(focus) {
  const { target } = renderMap(app, {
    pack, save, meterPct: meter(pack, save.rooms), due: Math.min(dueCount(), RELIGHT_CAP),
    onRoom: (id) => enterRoom(pack.rooms.find((r) => r.id === id)),
    onRelight: enterRelight,
    onGuide: () => showGuide(app, { pack, cards: save.cards, day: today(), due: dueCount(), onBack: () => showMap(".dock-btn[data-t-aria=guide]") }),
    onSettings: () => openSettings(app, {
      settings: save.settings, credits: pack.credits,
      onChange: (patch) => {
        const { lang, ...rest } = patch;
        if (lang) sessionLang = lang;
        if (Object.keys(rest).length) {
          save = setSettings(save, rest);
          persist();
        }
        applySessionLang();
        applyCaptions();
        applySound();
        showMap(".dock-btn[data-t-aria=settings]");
      },
    }),
  });
  if (usingKeyboard()) (focus && app.querySelector(focus) || target)?.focus({ preventScroll: true });
}

/** The room with its steps, or null after telling the player it could not be opened (the map stays, the door works again). */
async function openRoom(header) {
  try {
    return await loadRoom(header);
  } catch {
    playables.logError();
    const note = h("p", { class: "toast", role: "alert", "data-t": "roomLoadError", onclick: (e) => e.currentTarget.remove() }, t("roomLoadError"));
    document.body.append(note);
    later(() => note.remove(), 5000);
    return null;
  }
}

async function enterRoom(header) {
  const room = await openRoom(header);
  if (!room) return showMap();
  if (save.rooms[room.id] && room.steps.some((s) => s.type === "passage")) return rereadRoom(room);
  const before = meter(pack, save.rooms);
  const replay = Boolean(save.rooms[room.id]);
  const after = replay ? before : room.coverageAfter;
  // only the room ahead keeps a checkpoint: replaying a finished room never overwrites the player's place
  const onCheckpoint = (at, { persist: now }) => {
    if (replay) return;
    save = setCheckpoint(save, at);
    if (now) persist();
  };
  const result = await playRoom({
    root: app, pack, room, cards: save.cards, day: today(),
    meterBefore: before, meterAfter: Math.max(before, after),
    resume: replay ? null : checkpointFor(save, room), rests: restStops(room, pack.words), onCheckpoint,
  });
  if (result.finished) {
    const roomsBefore = save.rooms;
    save = setCards(markRoom(save, room.id), result.cards);
    await persist(); // the room is saved before any card, in case the player leaves on it
    // one-time milestone cards this room reached (core/milestones.js), then the map
    for (const id of newMilestones(pack, roomsBefore, save.rooms, save.seen)) {
      await showMilestone(app, { pack, id });
      save = markSeen(save, `m:${id}`);
    }
  }
  else if (result.warm?.length) save = setCards(save, result.warm); // warm-up answers count even if the player left
  if (result.finished || result.warm?.length || (!replay && save.at)) await persist();
  showMap();
}

/** A finished Reading Room opens straight on its passage, with fading words dim (ui/room.js `reread`). Nothing saved. */
async function rereadRoom(room) {
  const day = today();
  const faded = new Set(Object.values(save.cards).filter((c) => isDue(c, day)).map((c) => c.id));
  const pct = meter(pack, save.rooms);
  await playRoom({
    root: app, pack, room: { ...room, steps: room.steps.filter((s) => s.type === "passage") }, cards: save.cards, day,
    meterBefore: pct, meterAfter: pct, reread: true, faded,
  });
  showMap();
}

async function enterRelight() {
  const firstTime = !save.seen.includes("relight");
  const changed = await playRelight({ root: app, pack, cards: save.cards, day: today(), firstTime });
  if (firstTime) save = markSeen(save, "relight");
  if (changed.length) save = setCards(save, changed);
  if (changed.length || firstTime) await persist();
  showMap();
}

// The player's language is not known yet on these two screens, so they say it in English and Urdu.
const bothLangs = (key, tag = "span") => [
  h(tag, { class: "loading-text", lang: "en", dir: "ltr" }, tFor("en", key)),
  h(tag, { class: "loading-text", lang: "ur", dir: "rtl" }, tFor("ur", key)),
];

function loadingScreen() {
  app.replaceChildren(h("div", { class: "loading", role: "status" },
    h("span", { class: "loading-lamp", "aria-hidden": "true" }, "🪔"), ...bothLangs("loading")));
}

// Content or save could not be loaded: say so plainly, offer Retry, and let YouTube drop its spinner (INT-04).
function bootError() {
  const retry = h("button", { class: "pill retry-btn", onclick: async () => { loadingScreen(); await start(); } },
    `${tFor("en", "retry")} · ${tFor("ur", "retry")}`);
  app.replaceChildren(h("div", { class: "loading boot-error", role: "alert" },
    h("span", { class: "loading-lamp still", "aria-hidden": "true" }, "🪔"), ...bothLangs("bootError", "p"), retry));
  playables.gameReady();
  retry.focus();
}

async function load() {
  const [packJson, raw, host] = await Promise.all([fetchJson("content/pack.json"), playables.loadData(), playables.getLanguage()]);
  pack = packJson;
  hostLang = host;
  const parsed = parseSave(raw);
  save = parsed.save;
  if (parsed.blocked) playables.blockSaves();
  const restored = missingCards(pack, save.rooms, save.cards, today());
  if (restored.length) save = setCards(save, restored);
}

async function start() {
  try {
    await load();
  } catch {
    playables.logError();
    bootError();
    return;
  }
  setSigns(pack.words);
  applySessionLang();
  applyCaptions();
  applySound();
  // on <body>, not in #app: the next screen replaces #app's contents and would remove it
  if (playables.saveBlocked) {
    document.body.append(h("p", { class: "toast", role: "status", "data-t": "savedOff", onclick: (e) => e.currentTarget.remove() }, t("savedOff")));
  }

  if (!save.intro) {
    const intro = showIntro(app, {
      current: resolveLang(sessionLang, hostLang),
      onLang: (code) => { sessionLang = code; applySessionLang(); },
    });
    playables.gameReady();
    await intro;
    save = markIntro(save);
    await persist();
    return enterRoom(pack.rooms[0]);
  }
  showMap();
  playables.gameReady();
  // fetch the next room's wing now, so its door opens without a wait (a failure here is retried when the door is tapped)
  const next = pack.rooms.find((r) => !save.rooms[r.id]);
  if (next) loadRoom(next).catch(() => {});
}

async function boot() {
  loadingScreen();
  await nextPaint();
  playables.firstFrameReady();
  installTips();
  installKeys();
  whenPausedSave(() => persist());
  playables.onPause(pauseGame);
  playables.onResume(resumeGame);
  // YouTube can turn game audio off at any time; sound.js stays silent until it is back on
  setSound({ host: playables.isAudioEnabled() });
  playables.onAudioEnabledChange((on) => setSound({ host: on }));
  await start();
}

boot();
