// A Relight session (pure): which lamps are asked, and what each answer does to its card. ui/relight.js draws it.
// Rules (docs/MEMORY_SYSTEM.md §2):
//   right, first try, no help   up one flame, next review further away; the lamp leaves the session
//   right after a hint (nudge)  the flame stays, the word comes back much sooner (srs.js HINTED_DAYS); it leaves
//   wrong pick, or the answer   a real lapse: down one flame, a lapse counted. The lamp is asked again in this
//   shown (second Show me)      session until it has been answered right AFTER_MISS times without help, each time
//                               from the other side (word → picture, picture → word); then it is due tomorrow at
//                               its lowered level. The make-up answers never raise it again, and a second miss
//                               on a make-up asking never lowers it again: one flame and one lapse per lamp per
//                               session (only the debt starts over).
// A lamp that leaves the session is never still due today, so "All lamps are lit" is true when it is said.
// Nothing here is mutated: every function returns a new session and a new card.
import { dueCards, grade, gradeFresh, requeue, recordMixup, sessionSize, LAPSE_DAYS } from "./srs.js";

export const AFTER_MISS = 2;
export const RELIGHT_MODES = ["toPic", "toWord"];

/** A session over the due cards (a list), most overdue first. `settled`: ids already finished in this visit (they are
 *  not asked again even if still due today). The size follows the backlog (srs.js sessionSize). */
export function startRelight(cards, day, settled = []) {
  const waiting = dueCards(cards.filter((c) => !settled.includes(c.id)), day);
  return { queue: waiting.slice(0, sessionSize(waiting.length)).map((c) => c.id), owed: {}, settled: [...settled] };
}

/** How many due lamps are still waiting beyond this session (for the honest "N more waiting" card). */
export const moreWaiting = (cards, day, session) => dueCards(cards.filter((c) => !session.settled.includes(c.id) && !session.queue.includes(c.id)), day).length;

/** Lamps still to relight in this session. */
export const lampsLeft = (session) => session.queue.length;

/** Which side to ask from: the other one than last time. A card last asked in a room starts from its `seen` count. */
export function relightMode(card) {
  if (card.last === RELIGHT_MODES[0]) return RELIGHT_MODES[1];
  if (card.last === RELIGHT_MODES[1]) return RELIGHT_MODES[0];
  return RELIGHT_MODES[(card.seen + card.id.length) % RELIGHT_MODES.length];
}

const lapse = (session, card, day, mode) => ({
  session: { ...session, owed: { ...session.owed, [card.id]: AFTER_MISS }, queue: requeue(session.queue, card.id) },
  // already lapsed in this session (a make-up asking): the flame and the lapse count stay as they are
  card: (session.owed[card.id] ?? 0) > 0 ? { ...card, seen: card.seen + 1, last: mode } : grade(card, "wrong", day, mode),
});

/** The first wrong pick on the lamp being asked: a lapse, the mix-up noted, the lamp put back a few places later.
 *  Call it once per asking (later wrong picks on the same asking change nothing). */
export const relightMiss = (session, card, pickedId, day, mode) => lapse(session, pickedId ? recordMixup(card, pickedId) : card, day, mode);

/** The right answer was tapped. how: { missed, hinted, revealed } for this asking (core/recall.js).
 *  Returns { session, card, result } with result: "missed" (already handled by relightMiss) | "lapsed" (the answer
 *  had been shown) | "again" (a make-up answer; more are owed, or it was helped) | "back" (made up: due tomorrow)
 *  | "hinted" | "lit". */
export function relightRight(session, card, how, day, mode) {
  if (how.missed) return { session, card, result: "missed" };
  if (how.revealed) return { ...lapse(session, card, day, mode), result: "lapsed" };
  const owed = session.owed[card.id] ?? 0;
  const asked = { ...card, seen: card.seen + 1, last: mode };
  if (owed > 0) {
    const left = how.hinted ? owed : owed - 1;
    if (left > 0) return { session: { ...session, owed: { ...session.owed, [card.id]: left }, queue: requeue(session.queue, card.id) }, card: asked, result: "again" };
    const { [card.id]: _paid, ...rest } = session.owed;
    return { session: leave({ ...session, owed: rest }, card.id), card: { ...asked, due: day + LAPSE_DAYS }, result: "back" };
  }
  // a word learnt today is still in its first interval: right here it stays at one flame, back tomorrow (gradeFresh)
  const graded = gradeFresh(card, how.hinted ? "hinted" : "easy", day, mode);
  // a helped low lamp would be due again today (srs.js HINTED_DAYS): it comes back tomorrow instead
  return { session: leave(session, card.id), card: { ...graded, due: Math.max(graded.due, day + LAPSE_DAYS) }, result: how.hinted ? "hinted" : "lit" };
}

function leave(session, id) {
  return { ...session, queue: session.queue.filter((x) => x !== id), settled: [...session.settled, id] };
}

/** The first lamp could not be drawn: it goes to the end (it stays due). A queue of one stays as it is. */
export const relightSkip = (session) => (session.queue.length > 1 ? { ...session, queue: [...session.queue.slice(1), session.queue[0]] } : session);
