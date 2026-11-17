// Room session (pure): collect how each word was recalled during a room, then turn that into word-lamp cards.
// Rule of three (docs/MEMORY_SYSTEM.md §3): a new word is met, recalled in rounds, and seen in an ayah. At the end:
//   met only                → level 1, due again today (shows up in the next Relight)
//   recalled first try     → level 2, due tomorrow
//   needed a hint / missed → level 1, due today
// Words met in earlier rooms only move when they were due, so practising early can't skip a gap; a miss always counts.

import { newCard, grade, isDue } from "./srs.js";

const RANK = { easy: 0, hinted: 1, wrong: 2 };

export const startSession = () => ({ results: {} });

/** Record one recall for each word id; the worst outcome in the room wins. */
export function record(session, wordIds, outcome) {
  if (!(outcome in RANK)) throw new Error(`unknown outcome: ${outcome}`);
  const results = { ...session.results };
  for (const id of wordIds) if (!(id in results) || RANK[outcome] > RANK[results[id]]) results[id] = outcome;
  return { ...session, results };
}

/** Cards to store when the room is finished. `cards` = existing cards by word id. */
export function finishRoom(session, room, cards, day) {
  const out = [];
  for (const id of room.teaches) {
    const met = cards[id] ?? grade(newCard(id, day), "easy", day, "meet");
    const result = session.results[id];
    out.push(result ? grade(met, result, day, "room") : met);
  }
  for (const id of room.reviews) {
    const card = cards[id];
    const result = session.results[id];
    if (!card || !result) continue;
    if (result === "wrong" || isDue(card, day)) out.push(grade(card, result, day, "room"));
  }
  return out;
}

/** The meter: coverage after the last finished room, rooms being unlocked in order. */
export function meter(pack, doneRooms) {
  let pct = 0;
  for (const r of pack.rooms) {
    if (!doneRooms[r.id]) break;
    pct = r.coverageAfter;
  }
  return pct;
}

/** Room state on the map: done, next (the first not done), or locked. */
export function roomStates(pack, doneRooms) {
  let nextFound = false;
  return pack.rooms.map((r) => {
    if (doneRooms[r.id]) return "done";
    if (!nextFound) { nextFound = true; return "next"; }
    return "locked";
  });
}

/** Words of finished rooms that have no card (e.g. lost to an older save bug): new cards, due today, so Relight brings
 *  them back instead of the player never seeing them again. */
export function missingCards(pack, rooms, cards, day) {
  return pack.rooms.filter((r) => rooms[r.id]).flatMap((r) => r.teaches).filter((id, i, all) => !cards[id] && all.indexOf(id) === i)
    .map((id) => newCard(id, day));
}
