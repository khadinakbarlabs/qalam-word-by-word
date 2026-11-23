// Cloud save schema (pure). v1: finished rooms, word-lamp cards, intro seen, settings.
// v2 adds `at`: where the player is inside the room they have not finished yet, so leaving mid-room (or YouTube
// closing the game) resumes at the same step, and `seen`: one-time explainers already shown (e.g. "relight").
// v1 saves load with `at: null`, `seen: []`.
// Unknown future versions or unreadable data are reported as blocked: the game plays on but never overwrites them.

// v3: Al-Fatiha became two rooms ("fatiha" = verses 1–4, "fatiha-2" = verses 5–7). Before v3 the single "fatiha" room
// covered the whole surah, so an older save with it finished counts "fatiha-2" as finished too (its words have cards).
// v4: a checkpoint taken inside the Last Check carries `mastery` (which words are already lit, which are half way),
// so an interruption there loses a few answers, not the whole check. Older saves load with no `mastery`.
// v5 adds `hands`: the games (step types) whose tutorial hand the player has already been shown. The hand points at
// the answer, so it shows once per game for the whole save, not once per room. Older saves load with `hands: []`
// (each game shows its hand one more time; an answer given under the hand is graded as helped, never as known).
import { spreadFinished, wasSplit } from "./room-splits.js";
import { trimMixups } from "./srs.js";

// v6 (the "gentler start" work, docs/AUDIT_2026-11-23.md):
//   - long rooms were cut into shorter ones, so some room ids are new: a room finished in an older save counts every
//     room made from it as finished (core/room-splits.js); a checkpoint inside such a room is dropped (the player
//     starts that short room again; no finished room and no word card is lost);
//   - a card keeps its mix-ups as a sixth item [[otherWordId, count], …] (the few most frequent), so words the player
//     confuses come back as a "tell these apart" question. Older cards load with none;
//   - settings keep the language the player picked ("en" / "ur"; "auto" = follow YouTube) and `say` (show how to say
//     the Arabic in Latin letters, off unless turned on). Older saves load with "auto" and off.
export const SAVE_VERSION = 6;
const MAX_HANDS = 64;
// a checkpoint's recall results are stored as ranks: 0 easy, 1 hinted, 2 wrong (core/room.js RANK)
const OUTCOMES = ["easy", "hinted", "wrong"];
const MAX_STEPS = 200;
export const LANGS = ["auto", "en", "ur"];
const ID = /^[a-z0-9:._-]{1,64}$/;
const nat = (n, max = Number.MAX_SAFE_INTEGER) => (Number.isSafeInteger(n) && n >= 0 && n <= max ? n : null);

export function defaultSettings() {
  return { lang: "auto", captions: true, sound: true, say: false };
}

export function defaultSave() {
  return { v: SAVE_VERSION, rooms: {}, cards: {}, intro: false, settings: defaultSettings(), at: null, seen: [], hands: [] };
}

// Cards are stored compactly as [level, due, seen, lapses, last, mixups?] and expanded to srs.js card objects in memory.
// mixups: [[otherWordId, count], …], left out when there are none.
function cleanMixups(id, list) {
  if (!Array.isArray(list)) return {};
  const pairs = list.filter((m) => Array.isArray(m) && typeof m[0] === "string" && ID.test(m[0]) && m[0] !== id && nat(m[1]) !== null && m[1] > 0);
  return trimMixups(Object.fromEntries(pairs));
}

function cleanCard(id, c) {
  if (!Array.isArray(c) || c.length < 4) return null;
  const [level, due, seen, lapses, last, mixups] = c;
  if (nat(level, 6) === null || nat(due) === null || nat(seen) === null || nat(lapses) === null) return null;
  return { id, level, due, seen, lapses, last: typeof last === "string" && last.length <= 16 ? last : null, mixups: cleanMixups(id, mixups) };
}

function cleanSettings(s) {
  const base = defaultSettings();
  if (typeof s !== "object" || s === null) return base;
  return {
    lang: LANGS.includes(s.lang) ? s.lang : base.lang,
    captions: typeof s.captions === "boolean" ? s.captions : base.captions,
    sound: typeof s.sound === "boolean" ? s.sound : base.sound,
    say: typeof s.say === "boolean" ? s.say : base.say,
  };
}

const idList = (list, max) => (Array.isArray(list) ? [...new Set(list.filter((id) => typeof id === "string" && ID.test(id)))].slice(0, max) : []);

/** A mid-room checkpoint: { room, step, steps, results: { wordId: "easy"|"hinted"|"wrong" }, met: [wordId] }.
 *  `steps` is the room's step count when it was saved; a content update that changes it drops the checkpoint.
 *  Inside the Last Check (step === steps) it may also carry mastery: { done: [wordId], half: [wordId] }
 *  (core/mastery.js snapshot). */
function cleanAt(a) {
  if (typeof a !== "object" || a === null || !ID.test(a.r ?? "")) return null;
  const steps = nat(a.n, MAX_STEPS);
  const step = nat(a.s, MAX_STEPS);
  if (steps === null || step === null || step > steps) return null;
  const results = {};
  for (const [id, rank] of Object.entries(a.res ?? {})) if (ID.test(id) && nat(rank, 2) !== null) results[id] = OUTCOMES[rank];
  const met = idList(a.met, 400);
  const at = { room: a.r, step, steps, results, met };
  if (typeof a.m !== "object" || a.m === null || step !== steps) return at;
  const done = idList(a.m.d, 400);
  return { ...at, mastery: { done, half: idList(a.m.h, 400).filter((id) => !done.includes(id)) } };
}

export function migrate(data) {
  if (!Number.isInteger(data.v) || data.v < 1 || data.v > SAVE_VERSION) return null;
  const finished = Object.fromEntries(Object.entries(data.rooms ?? {}).filter(([id, v]) => ID.test(id) && v === 1));
  const whole = data.v < 3 && finished.fatiha ? { ...finished, "fatiha-2": 1 } : finished;
  const rooms = data.v < 6 ? spreadFinished(whole) : whole;
  const cards = {};
  for (const [id, c] of Object.entries(data.cards ?? {})) {
    const card = ID.test(id) ? cleanCard(id, c) : null;
    if (card) cards[id] = card;
  }
  const place = data.v >= 2 ? cleanAt(data.at) : null;
  // a place saved inside a room that has since been cut into shorter rooms points at steps that moved
  const at = place && data.v < 6 && wasSplit(place.room) ? null : place;
  const seen = idList(data.seen, 32);
  const hands = data.v >= 5 ? idList(data.hands, MAX_HANDS) : [];
  return { v: SAVE_VERSION, rooms, cards, intro: data.intro === true, settings: cleanSettings(data.settings), at: at && !rooms[at.room] ? at : null, seen, hands };
}

/** { save, blocked, reason }. blocked: the stored data cannot be used and must not be written over; reason says why:
 *  "newer" (saved by a later version of the game) or "corrupt" (not readable at all). The raw string is never changed
 *  here; main.js tells the player and keeps saving off. */
export function parseSave(raw) {
  const blocked = (reason) => ({ save: defaultSave(), blocked: true, reason });
  if (!raw) return { save: defaultSave(), blocked: false, reason: null };
  try {
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null || !Number.isInteger(data.v)) return blocked("corrupt");
    if (data.v > SAVE_VERSION) return blocked("newer");
    const save = migrate(data);
    return save ? { save, blocked: false, reason: null } : blocked("corrupt");
  } catch {
    return blocked("corrupt");
  }
}

// The language: "auto" follows YouTube's language (Playables getLanguage) until the player picks English or Urdu in
// the game; from then on their pick is kept and wins on every later visit (i18n.js resolveLang).
export function serializeSave(save) {
  const cards = Object.fromEntries(Object.values(save.cards).map((c) => {
    const mixups = Object.entries(trimMixups(c.mixups ?? {}));
    return [c.id, mixups.length ? [c.level, c.due, c.seen, c.lapses, c.last, mixups] : [c.level, c.due, c.seen, c.lapses, c.last]];
  }));
  const a = save.at;
  const at = a ? {
    r: a.room, s: a.step, n: a.steps, res: Object.fromEntries(Object.entries(a.results).map(([id, o]) => [id, OUTCOMES.indexOf(o)])), met: a.met,
    ...(a.mastery ? { m: { d: a.mastery.done, h: a.mastery.half } } : {}),
  } : null;
  return JSON.stringify({ v: SAVE_VERSION, rooms: save.rooms, cards, intro: save.intro, settings: cleanSettings(save.settings), at, seen: save.seen ?? [], hands: save.hands ?? [] });
}

// finishing a room clears its checkpoint
export const markRoom = (save, roomId) => ({ ...save, rooms: { ...save.rooms, [roomId]: 1 }, at: save.at?.room === roomId ? null : save.at });
export const setCheckpoint = (save, at) => ({ ...save, at });
export const markSeen = (save, id) => ((save.seen ?? []).includes(id) ? save : { ...save, seen: [...(save.seen ?? []), id] });
/** The tutorial hand of this game (step type) has been shown. */
export const markHand = (save, type) => ((save.hands ?? []).includes(type) ? save : { ...save, hands: [...(save.hands ?? []), type].slice(-MAX_HANDS) });
/** The checkpoint for this room, or null (none, another room's, or saved before the room's steps changed). */
export const checkpointFor = (save, room) => (save.at?.room === room.id && save.at.steps === room.steps.length && !save.rooms[room.id] ? save.at : null);
export const setCards = (save, cards) => ({ ...save, cards: { ...save.cards, ...Object.fromEntries(cards.map((c) => [c.id, c])) } });
export const setSettings = (save, patch) => ({ ...save, settings: cleanSettings({ ...save.settings, ...patch }) });
export const markIntro = (save) => ({ ...save, intro: true });
