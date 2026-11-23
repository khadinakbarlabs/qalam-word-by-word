// Room splits: long rooms cut into shorter ones WITHOUT rewriting their content (docs/AUDIT_2026-11-23.md, "gentler
// start"). authoring/rooms.js keeps each room as it was written; this table says how its steps are dealt out.
// scripts/lib/split.mjs applies it at build time and the build fails when a room is still over the budget:
//   Wing 1        at most 8 new words in a room
//   later wings   at most 20 (docs/MEMORY_SYSTEM.md §3: about 15–20 new words in a day)
//
//   { at: k }                     two rooms: steps before step k (0-based), and step k onward
//   [{ steps: [...] }, { ... }]   any number of rooms, each a list of the original step numbers in playing order
//                                 (used in Wing 1, where each part keeps a meet → game → ayah shape)
// The first part keeps the room's id and title. Part n gets the id "<id>-b", "<id>-c" … and the title
// "<title>, part n" unless it gives its own `id`, `title`, `icon` or `art`.
//
// CHANGING THIS TABLE CHANGES ROOM IDS. A player's save names the rooms they finished, so every split must also be in
// game/core/room-splits.js (old id → new ids) with a save-version bump; tests/learning.test.mjs fails if the two differ.

export const SPLITS = {
  // ---- Wing 1 (at most 8 new words) ----
  "whos-who": [{ steps: [0, 1, 6] }, { steps: [2, 3, 4, 5] }],
  "lamp-box": [{ steps: [0, 1, 6] }, { steps: [2, 3, 4, 5, 7, 8] }],
  "no-stamp": [{ steps: [0, 1, 4, 5, 6] }, { steps: [2, 3, 7, 8] }],
  "questions": [{ steps: [0, 1, 4] }, { steps: [2, 3, 5, 6] }],
  "time-line": [{ steps: [0, 1] }, { steps: [2, 3, 4, 5, 6] }],
  "strong-starters": [{ steps: [0, 1, 4] }, { steps: [2, 3, 5] }],
  "word-chest": [
    { steps: [0, 1, 8] },
    { steps: [2, 3, 7], title: { en: "Word Chest: Like & All", ur: "لفظوں کا صندوق: مثال اور سب" } },
    { steps: [4, 5, 6], title: { en: "Word Chest: Jinn & People", ur: "لفظوں کا صندوق: جن اور انسان" } },
  ],
  // ---- later wings (at most 20 new words): cut before the meet step that best halves the new words ----
  "name-scrolls": { at: 4 },
  "deeds-blessings": { at: 4 },
  "family-body": { at: 8 },
  "town-people": { at: 4 },
  "word-chest-2": { at: 6 },
  "review-names-ladders": { at: 8 },
  "review-lost-found": { at: 10 },
  "doing-words-2": { at: 11 },
  "doing-words-3": { at: 10 },
  "doing-words-4": { at: 8 },
  "doing-words-5": { at: 8 },
  "review-family-garden": { at: 6 },
  "review-family-orchard": { at: 6 },
  "soft-letters-4": { at: 8 },
  "soft-letters-5": { at: 9 },
  "grown-forms-4": { at: 9 },
  "grown-forms-7": { at: 7 },
};
