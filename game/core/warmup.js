// Warm-up picks: a few fading words from earlier rooms, asked before a new room's own steps, so review happens
// inside new play. Pure and deterministic (no Math.random).
import { dueCards } from "./srs.js";

export const WARMUP_MAX = 3;

/** Ids of up to WARMUP_MAX due words (weakest, most overdue first) that have a picture and Arabic and are not
 *  taught or reviewed by the room itself. `cards` is the save's card map. */
export function warmUpWords(cards, day, words, exclude = [], max = WARMUP_MAX) {
  const skip = new Set(exclude);
  return dueCards(Object.values(cards), day)
    .filter((c) => !skip.has(c.id) && words[c.id]?.ar && (words[c.id].pic || words[c.id].medal))
    .slice(0, max)
    .map((c) => c.id);
}
