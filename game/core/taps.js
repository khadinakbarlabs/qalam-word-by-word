// Room length (pure). taps: how many taps a room needs when every answer is right first time (no hints, no misses);
// the counts follow the step modules in game/ui/steps/ and match autoplay tap counts. Long rooms get rest stops at
// step boundaries, so no stretch between two saves runs much past REST_EVERY taps (docs/POLISH_PLAN.md finding 9).
export const REST_EVERY = 120;

const ITEMS = (s) => s.items?.length ?? 0;
const PER_STEP = {
  meet: (s) => s.words.length + 1, // open each card, then ▶
  match: (s) => s.words.length,
  ayah: (s) => s.words.filter((w) => !w.given).length * 2 + 1, // tap the tile, pick its meaning; ▶
  snap: (s) => s.tasks.reduce((n, t) => n + t.want.length, 0),
  passage: (s) => s.ayat.length + 1, // light each line, then ▶
  story: (s) => s.panels.length + 1,
};

export const stepTaps = (step) => (PER_STEP[step.type] ?? ITEMS)(step);

/** The new words the Mastery Check tests (pictured or medal words); the check runs when there are 3 or more. */
export const masteryWords = (room, words) => room.teaches.filter((id) => words[id]?.pic || words[id]?.medal);

/** Taps per part: [stakes ▶ + step 1, step 2, …, step n, Mastery Check + done ▶]. Index i = taps of part i, where
 *  part n is the Mastery Check (0 when the room has none) and the last ▶. */
export function partTaps(room, words) {
  const m = masteryWords(room, words);
  const parts = room.steps.map(stepTaps);
  parts[0] += room.stakes?.words ? 1 : 0;
  parts.push((m.length >= 3 ? m.length * 2 + 1 : 0) + 1);
  return parts;
}

export const roomTaps = (room, words) => partTaps(room, words).reduce((a, b) => a + b, 0);

/** Step indices that start after a rest stop (a rest card shows before them). Index steps.length = before the
 *  Mastery Check. Rooms up to REST_EVERY taps have none; longer rooms are cut into equal-ish stretches. */
export function restStops(room, words) {
  const parts = partTaps(room, words);
  const total = parts.reduce((a, b) => a + b, 0);
  const k = Math.ceil(total / REST_EVERY);
  if (k <= 1) return [];
  const before = parts.map((_, i) => parts.slice(0, i).reduce((a, b) => a + b, 0)); // taps before part i
  const lastBoundary = room.steps.length - (masteryWords(room, words).length >= 3 ? 0 : 1);
  const stops = [];
  for (let j = 1; j < k; j++) {
    const goal = (j * total) / k;
    let best = null;
    for (let b = (stops.at(-1) ?? 0) + 1; b <= lastBoundary; b++) {
      if (best === null || Math.abs(before[b] - goal) < Math.abs(before[best] - goal)) best = b;
    }
    if (best !== null && !stops.includes(best)) stops.push(best);
  }
  return stops;
}

/** Taps in each stretch between rest stops (for tests and tuning). */
export function stretches(room, words) {
  const parts = partTaps(room, words);
  const cuts = [0, ...restStops(room, words), parts.length];
  return cuts.slice(1).map((end, i) => parts.slice(cuts[i], end).reduce((a, b) => a + b, 0));
}
