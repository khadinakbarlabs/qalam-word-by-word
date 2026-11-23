// Last Check (pure): the room's new words are asked once more before the room is done. Each word has two dots, one
// per direction (Arabic → meaning, then meaning → Arabic).
//   gentle (Wing 1)   one right answer in each direction. A miss does NOT wipe a dot already earned: the word just
//                     comes back two questions later, asked the same way, until it is answered right.
//   strict (later)    two right answers in a row, the direction flipping each try. A miss resets the word.
// In both, an answer given after Show me neither earns a dot nor loses one: the word comes back to be tried alone.
// The check is short: at most CHECK_CAP words (checkWords picks the ones that most need it); the rest of a long room's
// new words are asked in the next room's warm-up (core/warmup.js).

export const MASTERY_STREAK = 2;
export const CHECK_CAP = 8;
const GAP_AFTER_MISS = 2;
const GAP_AFTER_HIT = 3;
const NEED = { wrong: 0, hinted: 1, none: 2, easy: 3 };

/** Which of a room's new words the Last Check asks: all of them up to `cap`; beyond that the ones that most need it
 *  (missed in the room, then helped, then not yet asked, then answered first try), each group in teaching order.
 *  `results`: the room session's { wordId: "easy" | "hinted" | "wrong" }. */
export function checkWords(ids, results = {}, cap = CHECK_CAP) {
  if (ids.length <= cap) return [...ids];
  const picked = new Set(ids.map((id, i) => ({ id, i, need: NEED[results[id] ?? "none"] }))
    .sort((a, b) => a.need - b.need || a.i - b.i)
    .slice(0, cap)
    .map((x) => x.id));
  return ids.filter((id) => picked.has(id)); // asked in teaching order
}

/** state: { queue: [ids in asking order], streak: { id: dots earned }, tries: { id: n }, done: [ids], gentle } */
export function startMastery(ids, { gentle = false } = {}) {
  return { queue: [...ids], streak: Object.fromEntries(ids.map((id) => [id, 0])), tries: Object.fromEntries(ids.map((id) => [id, 0])), done: [], gentle };
}

/** Which way to ask the next question about this word. Gentle: the direction not earned yet (Arabic → meaning first).
 *  Strict: alternate with every try, starting Arabic → meaning. */
export const direction = (state, id) => ((state.gentle ? state.streak[id] : state.tries[id]) % 2 === 0 ? "toPic" : "toWord");

const putBack = (queue, id, gap) => {
  const rest = queue.filter((x) => x !== id);
  const at = Math.min(gap, rest.length);
  return [...rest.slice(0, at), id, ...rest.slice(at)];
};

/** Record the answer to the question about queue[0]. outcome: "right" | "hinted" | "wrong". Returns a new state. */
export function answer(state, outcome) {
  const id = state.queue[0];
  if (!id) return state;
  const tries = { ...state.tries, [id]: state.tries[id] + 1 };
  const streak = { ...state.streak };
  if (outcome === "wrong" && !state.gentle) streak[id] = 0; // gentle: an earned dot is kept, the word is asked again
  else if (outcome === "right") streak[id] += 1;
  // "hinted": no dot earned and none lost: the word must still be answered unaided
  if (streak[id] >= MASTERY_STREAK) return { ...state, queue: state.queue.slice(1), streak, tries, done: [...state.done, id] };
  return { ...state, queue: putBack(state.queue, id, outcome === "right" ? GAP_AFTER_HIT : GAP_AFTER_MISS), streak, tries };
}

export const isMastered = (state) => state.queue.length === 0;

/** What a checkpoint keeps of a check in progress: the words already lit and the ones half way (one right answer). */
export const snapshot = (state) => ({
  done: [...state.done],
  half: Object.keys(state.streak).filter((id) => state.streak[id] > 0 && !state.done.includes(id)),
});

/** A check picked up again from a snapshot (save.js `at.mastery`): lit words stay lit, half-way words need one more
 *  right answer, the rest start fresh. Ids the room no longer has are ignored; no snapshot = a fresh check. */
export function resumeMastery(ids, snap, { gentle = false } = {}) {
  const fresh = startMastery(ids, { gentle });
  if (!snap) return fresh;
  const done = (snap.done ?? []).filter((id) => ids.includes(id));
  const half = (snap.half ?? []).filter((id) => ids.includes(id) && !done.includes(id));
  const count = (id) => (done.includes(id) ? MASTERY_STREAK : half.includes(id) ? 1 : 0);
  return {
    ...fresh,
    queue: ids.filter((id) => !done.includes(id)),
    streak: Object.fromEntries(ids.map((id) => [id, count(id)])),
    tries: Object.fromEntries(ids.map((id) => [id, count(id)])),
    done,
  };
}
