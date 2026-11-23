// Rooms that were cut into shorter rooms in save v6 (docs/AUDIT_2026-11-23.md, "gentler start"): old room id → the
// rooms that now hold its steps, in playing order. A save made before v6 that has the old room finished counts every
// one of them as finished (core/save.js migrate), so no lamp and no word card is lost. Pure data, written by hand on
// purpose: a content rebuild can never change what an old save means. tests/learning.test.mjs checks it against
// authoring/splits.js and the built pack.
//
// Al-Fatiha: before v3 one room; v3–v5 two rooms ("fatiha" = 1:1–1:4, "fatiha-2" = 1:5–1:7); from v6 five rooms.
export const ROOM_SPLITS = Object.freeze({
  "fatiha": ["fatiha", "fatiha-1b"],
  "fatiha-2": ["fatiha-2", "fatiha-2b", "fatiha-2c"],
  "whos-who": ["whos-who", "whos-who-b"],
  "lamp-box": ["lamp-box", "lamp-box-b"],
  "no-stamp": ["no-stamp", "no-stamp-b"],
  "questions": ["questions", "questions-b"],
  "time-line": ["time-line", "time-line-b"],
  "strong-starters": ["strong-starters", "strong-starters-b"],
  "word-chest": ["word-chest", "word-chest-b", "word-chest-c"],
  "name-scrolls": ["name-scrolls", "name-scrolls-b"],
  "deeds-blessings": ["deeds-blessings", "deeds-blessings-b"],
  "family-body": ["family-body", "family-body-b"],
  "town-people": ["town-people", "town-people-b"],
  "word-chest-2": ["word-chest-2", "word-chest-2-b"],
  "review-names-ladders": ["review-names-ladders", "review-names-ladders-b"],
  "review-lost-found": ["review-lost-found", "review-lost-found-b"],
  "doing-words-2": ["doing-words-2", "doing-words-2-b"],
  "doing-words-3": ["doing-words-3", "doing-words-3-b"],
  "doing-words-4": ["doing-words-4", "doing-words-4-b"],
  "doing-words-5": ["doing-words-5", "doing-words-5-b"],
  "review-family-garden": ["review-family-garden", "review-family-garden-b"],
  "review-family-orchard": ["review-family-orchard", "review-family-orchard-b"],
  "soft-letters-4": ["soft-letters-4", "soft-letters-4-b"],
  "soft-letters-5": ["soft-letters-5", "soft-letters-5-b"],
  "grown-forms-4": ["grown-forms-4", "grown-forms-4-b"],
  "grown-forms-7": ["grown-forms-7", "grown-forms-7-b"],
});

/** Finished rooms of a pre-v6 save, with every part of a split room finished too. Returns a new object. */
export function spreadFinished(rooms) {
  const out = { ...rooms };
  for (const [old, parts] of Object.entries(ROOM_SPLITS)) if (rooms[old]) for (const id of parts) out[id] = 1;
  return out;
}

/** True when a pre-v6 checkpoint sits in a room whose steps were dealt out again: its step number means nothing now. */
export const wasSplit = (roomId) => Object.hasOwn(ROOM_SPLITS, roomId);
