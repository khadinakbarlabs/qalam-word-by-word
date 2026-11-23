// Warm-up picks: a few fading words from earlier rooms, asked before a new room's own steps, so review happens
// inside new play. Pure and deterministic (no Math.random).
import { dueCards, drillPairs } from "./srs.js";

export const WARMUP_MAX = 3;
// One-flame words that are due (a long room's words its Last Check did not reach, words that needed help) are all
// asked, up to this many: the next room's warm-up is where they are checked (core/mastery.js CHECK_CAP).
export const WARMUP_CAP = 8;

const hasFace = (words, id) => Boolean(words[id]?.ar && (words[id].pic || words[id].medal));

/** Ids of due words (one-flame words first, then weakest and most overdue) that have Arabic and a face and are not
 *  taught or reviewed by the room itself. Normally up to WARMUP_MAX; more (up to WARMUP_CAP) when that many one-flame
 *  words wait. `cards` is the save's card map. */
export function warmUpWords(cards, day, words, exclude = [], max = WARMUP_MAX) {
  const skip = new Set(exclude);
  const due = dueCards(Object.values(cards), day).filter((c) => !skip.has(c.id) && hasFace(words, c.id));
  const young = due.filter((c) => c.level <= 1);
  const size = Math.max(max, Math.min(WARMUP_CAP, young.length));
  return [...young, ...due.filter((c) => c.level > 1)].slice(0, size).map((c) => c.id);
}

/** Pairs of words the player keeps mixing up, for a "tell these apart" question: [[idA, idB], …], at most `max`.
 *  Both words must have a card, Arabic and a face, and must not be written the same. */
export function tellApartPairs(cards, words, max = 1) {
  const list = Array.isArray(cards) ? cards : Object.values(cards);
  const owned = new Set(list.map((c) => c.id));
  return drillPairs(list)
    .filter(([a, b]) => owned.has(a) && owned.has(b) && hasFace(words, a) && hasFace(words, b) && words[a].ar !== words[b].ar)
    .slice(0, max);
}
