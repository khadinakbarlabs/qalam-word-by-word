// Mastery check (pure): every new word of a room must be answered right twice in a row, without a hint, before the
// room is done. Each try flips direction (Arabic → picture, then picture → Arabic). A miss resets the word and brings
// it back two questions later; a right answer that still needs another brings it back three questions later.

export const MASTERY_STREAK = 2;
const GAP_AFTER_MISS = 2;
const GAP_AFTER_HIT = 3;

/** state: { queue: [ids in asking order], streak: { id: n }, tries: { id: n }, done: [ids] } */
export function startMastery(ids) {
  return { queue: [...ids], streak: Object.fromEntries(ids.map((id) => [id, 0])), tries: Object.fromEntries(ids.map((id) => [id, 0])), done: [] };
}

/** Which way to ask the next question about this word: alternate, starting Arabic → picture. */
export const direction = (state, id) => (state.tries[id] % 2 === 0 ? "toPic" : "toWord");

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
  if (outcome === "wrong") streak[id] = 0;
  else if (outcome === "right") streak[id] += 1;
  // "hinted": the streak neither grows nor resets — the word must still be shown twice unaided
  if (streak[id] >= MASTERY_STREAK) return { queue: state.queue.slice(1), streak, tries, done: [...state.done, id] };
  return { queue: putBack(state.queue, id, outcome === "right" ? GAP_AFTER_HIT : GAP_AFTER_MISS), streak, tries, done: state.done };
}

export const isMastered = (state) => state.queue.length === 0;
