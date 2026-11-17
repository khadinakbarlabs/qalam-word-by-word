// Cloud save schema (pure). v1: finished rooms, word-lamp cards, intro seen, settings.
// v2 adds `at`: where the player is inside the room they have not finished yet, so leaving mid-room (or YouTube
// closing the game) resumes at the same step, and `seen`: one-time explainers already shown (e.g. "relight").
// v1 saves load with `at: null`, `seen: []`.
// Unknown future versions or unreadable data are reported as blocked: the game plays on but never overwrites them.

// v3: Al-Fatiha became two rooms ("fatiha" = verses 1–4, "fatiha-2" = verses 5–7). Before v3 the single "fatiha" room
// covered the whole surah, so an older save with it finished counts "fatiha-2" as finished too (its words have cards).
export const SAVE_VERSION = 3;
// a checkpoint's recall results are stored as ranks: 0 easy, 1 hinted, 2 wrong (core/room.js RANK)
const OUTCOMES = ["easy", "hinted", "wrong"];
const MAX_STEPS = 200;
export const LANGS = ["auto", "en", "ur"];
const ID = /^[a-z0-9:._-]{1,64}$/;
const nat = (n, max = Number.MAX_SAFE_INTEGER) => (Number.isSafeInteger(n) && n >= 0 && n <= max ? n : null);

export function defaultSettings() {
  return { lang: "auto", captions: true, sound: true };
}

export function defaultSave() {
  return { v: SAVE_VERSION, rooms: {}, cards: {}, intro: false, settings: defaultSettings(), at: null, seen: [] };
}

// Cards are stored compactly as [level, due, seen, lapses, last] and expanded to srs.js card objects in memory.
function cleanCard(id, c) {
  if (!Array.isArray(c) || c.length < 4) return null;
  const [level, due, seen, lapses, last] = c;
  if (nat(level, 6) === null || nat(due) === null || nat(seen) === null || nat(lapses) === null) return null;
  return { id, level, due, seen, lapses, last: typeof last === "string" && last.length <= 16 ? last : null, mixups: {} };
}

function cleanSettings(s) {
  const base = defaultSettings();
  if (typeof s !== "object" || s === null) return base;
  return {
    lang: LANGS.includes(s.lang) ? s.lang : base.lang,
    captions: typeof s.captions === "boolean" ? s.captions : base.captions,
    sound: typeof s.sound === "boolean" ? s.sound : base.sound,
  };
}

/** A mid-room checkpoint: { room, step, steps, results: { wordId: "easy"|"hinted"|"wrong" }, met: [wordId] }.
 *  `steps` is the room's step count when it was saved; a content update that changes it drops the checkpoint. */
function cleanAt(a) {
  if (typeof a !== "object" || a === null || !ID.test(a.r ?? "")) return null;
  const steps = nat(a.n, MAX_STEPS);
  const step = nat(a.s, MAX_STEPS);
  if (steps === null || step === null || step > steps) return null;
  const results = {};
  for (const [id, rank] of Object.entries(a.res ?? {})) if (ID.test(id) && nat(rank, 2) !== null) results[id] = OUTCOMES[rank];
  const met = Array.isArray(a.met) ? [...new Set(a.met.filter((id) => typeof id === "string" && ID.test(id)))].slice(0, 400) : [];
  return { room: a.r, step, steps, results, met };
}

export function migrate(data) {
  if (data.v !== 1 && data.v !== 2 && data.v !== 3) return null;
  const finished = Object.fromEntries(Object.entries(data.rooms ?? {}).filter(([id, v]) => ID.test(id) && v === 1));
  const rooms = data.v < 3 && finished.fatiha ? { ...finished, "fatiha-2": 1 } : finished;
  const cards = {};
  for (const [id, c] of Object.entries(data.cards ?? {})) {
    const card = ID.test(id) ? cleanCard(id, c) : null;
    if (card) cards[id] = card;
  }
  const at = data.v >= 2 ? cleanAt(data.at) : null;
  const seen = Array.isArray(data.seen) ? [...new Set(data.seen.filter((id) => typeof id === "string" && ID.test(id)))].slice(0, 32) : [];
  return { v: SAVE_VERSION, rooms, cards, intro: data.intro === true, settings: cleanSettings(data.settings), at: at && !rooms[at.room] ? at : null, seen };
}

export function parseSave(raw) {
  if (!raw) return { save: defaultSave(), blocked: false };
  try {
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null || !Number.isInteger(data.v)) return { save: defaultSave(), blocked: true };
    const save = migrate(data);
    return save ? { save, blocked: false } : { save: defaultSave(), blocked: true };
  } catch {
    return { save: defaultSave(), blocked: true };
  }
}

// The language choice is never stored: each session follows YouTube's language again (Playables SDK guidance), so the
// saved setting is always "auto" and an English / Urdu pick lasts only for the session (main.js).
export function serializeSave(save) {
  const cards = Object.fromEntries(Object.values(save.cards).map((c) => [c.id, [c.level, c.due, c.seen, c.lapses, c.last]]));
  const a = save.at;
  const at = a ? { r: a.room, s: a.step, n: a.steps, res: Object.fromEntries(Object.entries(a.results).map(([id, o]) => [id, OUTCOMES.indexOf(o)])), met: a.met } : null;
  return JSON.stringify({ v: SAVE_VERSION, rooms: save.rooms, cards, intro: save.intro, settings: { ...save.settings, lang: "auto" }, at, seen: save.seen ?? [] });
}

// finishing a room clears its checkpoint
export const markRoom = (save, roomId) => ({ ...save, rooms: { ...save.rooms, [roomId]: 1 }, at: save.at?.room === roomId ? null : save.at });
export const setCheckpoint = (save, at) => ({ ...save, at });
export const markSeen = (save, id) => ((save.seen ?? []).includes(id) ? save : { ...save, seen: [...(save.seen ?? []), id] });
/** The checkpoint for this room, or null (none, another room's, or saved before the room's steps changed). */
export const checkpointFor = (save, room) => (save.at?.room === room.id && save.at.steps === room.steps.length && !save.rooms[room.id] ? save.at : null);
export const setCards = (save, cards) => ({ ...save, cards: { ...save.cards, ...Object.fromEntries(cards.map((c) => [c.id, c])) } });
export const setSettings = (save, patch) => ({ ...save, settings: cleanSettings({ ...save.settings, ...patch }) });
export const markIntro = (save) => ({ ...save, intro: true });
