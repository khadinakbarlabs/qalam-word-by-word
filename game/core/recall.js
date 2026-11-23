// One question being answered (pure): what happened before the right answer came, and the grade that follows.
//   missed    a wrong pick
//   hinted    help was given: the first Show me (a nudge), or the tutorial hand pointing at the answer
//   revealed  the full answer was shown (the second Show me)
// docs/MEMORY_SYSTEM.md §2: first try with no help = "easy"; with help = "hinted"; wrong or revealed = "wrong".
// The state is never mutated; a question that is put down and picked up again (an ayah tile) keeps what happened.

export const NO_HELP = Object.freeze({ missed: false, hinted: false, revealed: false });

/** A question about these word ids starts (or is picked up again with what already happened to it). */
export const startItem = (ids, prior = NO_HELP) => ({ ids: [...ids], missed: Boolean(prior?.missed), hinted: Boolean(prior?.hinted), revealed: Boolean(prior?.revealed) });

export const NO_ITEM = Object.freeze({ ids: Object.freeze([]), ...NO_HELP });

export const withMiss = (item) => ({ ...item, missed: true });

/** Show me was asked for the `level`-th time on this question (1 = a nudge, 2 or more = the answer itself). */
export const withHint = (item, level) => ({ ...item, hinted: true, revealed: item.revealed || level >= 2 });

/** The tutorial hand pointed at the answer while this question was open. */
export const withHand = (item) => ({ ...item, hinted: true });

/** What a question keeps when it is put down unanswered. */
export const flagsOf = (item) => ({ missed: item.missed, hinted: item.hinted, revealed: item.revealed });

export const gotHelp = (item) => item.hinted || item.revealed;

/** The grade for the right answer that ends the question: "easy" | "hinted" | "wrong". */
export function outcomeOf(item) {
  if (item.missed || item.revealed) return "wrong";
  return item.hinted ? "hinted" : "easy";
}

/** The nudge (first Show me): which of `count` wrong choices fade out, as indexes. About half of them, and always
 *  at least one stays beside the answer, so a nudge never gives the answer away (one wrong choice: none goes). */
export const nudgeAway = (count) => Array.from({ length: Math.max(0, count) }, (_, k) => k).filter((k) => k % 2 === 0).slice(0, Math.max(0, count - 1));

/** Which step of the hint ladder a Show me request is: "nudge" first, "answer" from the second request on. A screen
 *  with no graded question open (a ▶, a card to turn) has nothing to give away: it gets the hand at once. */
export const hintStep = (level, graded) => (!graded || level >= 2 ? "answer" : "nudge");
