// Room session (pure): collect how each word was recalled during a room, then turn that into word-lamp cards.
// A new word's first gap is always short, because the Last Check comes minutes after the word was first seen and so
// proves working memory, not learning (docs/MEMORY_SYSTEM.md §2, docs/AUDIT_2026-11-23.md):
//   answered right every time, alone  → 1 flame, back TOMORROW (a right answer then makes it 2 flames)
//   needed help, or was missed        → 1 flame, back TODAY (the next room's warm-up, or Relight; right there the
//                                       same day = still 1 flame, back tomorrow: srs.js gradeFresh)
//   only met, or not in the Last      → 1 flame, back TODAY (the Last Check asks at most 8 words; the rest are asked
//   Check of a long room                in the next room's warm-up, core/warmup.js)
// Words that already have a card (met in an earlier room, or this room played again) only move when they were due,
// so practising early or replaying a room can't skip a gap; a miss always counts.

import { newCard, grade, isDue, recordMixup, FIRST_GAP_DAYS, FRESH } from "./srs.js";

const RANK = { easy: 0, hinted: 1, wrong: 2 };
// FIRST_GAP_DAYS: a new word answered right every time comes back after this many days, still at one flame.
// FRESH: `last` of a new card that is due again on the day it was made: the map does not count it as a lamp to
// relight on that same day (srs.js isFresh), though the warm-up, Relight and Quick practice all serve it; answered
// right there the same day it gets the same first gap, not a second flame (srs.js gradeFresh).
export { FIRST_GAP_DAYS, FRESH };

export const startSession = () => ({ results: {}, mixups: {} });

/** Record one recall for each word id; the worst outcome in the room wins. */
export function record(session, wordIds, outcome) {
  if (!(outcome in RANK)) throw new Error(`unknown outcome: ${outcome}`);
  const results = { ...session.results };
  for (const id of wordIds) if (!(id in results) || RANK[outcome] > RANK[results[id]]) results[id] = outcome;
  return { ...session, results };
}

/** The player picked the word `pickedId` when the answer was `wordId`: noted on the word's card when the room ends. */
export function recordMix(session, wordId, pickedId) {
  if (!wordId || !pickedId || wordId === pickedId) return session;
  const mine = session.mixups?.[wordId] ?? [];
  return { ...session, mixups: { ...session.mixups, [wordId]: [...mine, pickedId] } };
}

const withMixups = (session, card) => (session.mixups?.[card.id] ?? []).reduce(recordMixup, card);

/** A new word's first card (see the table at the top). `checked`: was it asked in the Last Check (or had no check)? */
function firstCard(id, result, checked, day) {
  const met = grade(newCard(id, day), "easy", day, "meet"); // 1 flame, due today
  if (!result) return { ...met, last: FRESH };
  if (result === "easy" && checked) return { ...met, seen: met.seen + 1, last: "room", due: day + FIRST_GAP_DAYS };
  const graded = result === "easy" ? { ...met, seen: met.seen + 1 } : grade(met, result, day, "room");
  return { ...graded, last: FRESH };
}

/** Cards to store when the room is finished. `cards` = existing cards by word id. `checked`: ids the Last Check
 *  asked (a long room's check is capped, core/mastery.js checkWords); null = every new word was checked. */
export function finishRoom(session, room, cards, day, { checked = null } = {}) {
  const out = [];
  const inCheck = (id) => checked === null || checked.includes(id);
  for (const id of room.teaches) {
    const result = session.results[id];
    const old = cards[id];
    if (old) {
      // a room played again: its words already have cards, so they follow the review rule below (no replay farming)
      if (result && (result === "wrong" || isDue(old, day))) out.push(withMixups(session, grade(old, result, day, "room")));
      else out.push(withMixups(session, old));
      continue;
    }
    out.push(withMixups(session, firstCard(id, result, inCheck(id), day)));
  }
  out.push(...reviewed(session, room, cards, day));
  return out;
}

/** The room's review words (they already have cards) that were answered in this session, graded: a miss always
 *  counts, a right answer only when the word was due. */
function reviewed(session, room, cards, day) {
  const out = [];
  for (const id of room.reviews) {
    const card = cards[id];
    const result = session.results[id];
    if (!card || !result) continue;
    if (result === "wrong" || isDue(card, day)) out.push(withMixups(session, grade(card, result, day, "room")));
  }
  return out;
}

/** The player leaves a room before its end: the review words answered so far are graded now, so what was reviewed
 *  is kept (docs/AUDIT_2026-11-23.md). Returns { cards, results }: the graded cards, and the session results with
 *  those words taken out, so the checkpoint cannot grade them a second time when the room is finished later.
 *  New words are not touched: they get their cards when the room is finished. */
export function leaveRoom(session, room, cards, day) {
  const graded = reviewed(session, room, cards, day);
  const settled = new Set(room.reviews.filter((id) => cards[id] && session.results[id]));
  const results = Object.fromEntries(Object.entries(session.results).filter(([id]) => !settled.has(id)));
  return { cards: graded, results };
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

/** Words of finished rooms that have no card (lost to an older save bug, or added to the room by a content update):
 *  met-once cards (level 1, due today, like a word only met in a room), so Relight and the warm-up bring them back
 *  instead of the player never seeing them again. A level-0 card would never be due (srs.js isDue). */
export function missingCards(pack, rooms, cards, day) {
  return pack.rooms.filter((r) => rooms[r.id]).flatMap((r) => r.teaches).filter((id, i, all) => !cards[id] && all.indexOf(id) === i)
    .map((id) => grade(newCard(id, day), "easy", day, "meet"));
}
