// "Every new word is practised before it is tested" (docs/AUDIT_2026-11-23.md): a pure walk through a room's steps,
// the way the game plays them, that says which of its new words get at least one GRADED question before the Last
// Check. A word that is only shown (a Meet card, a new word's tile in an ayah, a story panel) is not practised.
//
// What grades a word (game/ui/steps/*.js, every `ctx.item(...)`):
//   match, point, wheel, place, timeline, sort, roots, ladder, scene, petals   the word of each item
//   snap    the pieces a task wants          grow   the grown word          path   the verb and its partner
//   ayah    a tile whose word cards were ALL met before the ayah step began (it is a "known" tile: pick its meaning);
//           a tile with any unmet card is "new": tapping it only shows the meaning
//   meet, story, passage   nothing is graded
// scripts/lib/pack.mjs adds a Picture Match right after the step that introduced any word left out, and then fails
// the build if a taught word still has no graded question (unpractised() must be empty for every room).

const itemWords = (st) => (st.items ?? []).map((it) => it.w);

/** Word ids a step grades, given the ids met before the step starts. */
export function gradedBy(step, met) {
  switch (step.type) {
    case "meet": case "story": case "passage": return [];
    case "match": return step.words;
    case "snap": return step.tasks.flatMap((t) => t.want);
    case "grow": return step.items.map((it) => it.w);
    case "path": return step.items.flatMap((it) => [it.verb, it.with]);
    case "ayah": return step.words.filter((w) => !w.given && w.w.length && w.w.every((id) => met.has(id))).flatMap((w) => w.w);
    default: return itemWords(step);
  }
}

/** Word ids a step lets the player meet (they count as met for the steps after it). */
export function metBy(step) {
  switch (step.type) {
    case "meet": case "match": return step.words;
    case "ayah": return step.words.flatMap((w) => w.w);
    case "snap": return step.tasks.flatMap((t) => t.want);
    case "story": return step.panels.map((p) => p.w);
    case "grow": return step.items.flatMap((it) => [it.base, it.w]);
    case "path": return step.items.flatMap((it) => [it.verb, it.with]);
    case "passage": return step.ayat.flatMap((a) => a.words.flatMap((w) => w.w));
    default: return itemWords(step);
  }
}

/** For each step: { introduced: ids first met in it, graded: ids it grades }. `before`: ids met in earlier rooms. */
export function walk(steps, before) {
  const met = new Set(before);
  return steps.map((step) => {
    const graded = [...new Set(gradedBy(step, met))];
    const introduced = [...new Set(metBy(step))].filter((id) => !met.has(id));
    introduced.forEach((id) => met.add(id));
    return { introduced, graded };
  });
}

/** The room's new words that reach the Last Check with no graded question. */
export function unpractised(steps, before) {
  const seen = walk(steps, before);
  const graded = new Set(seen.flatMap((s) => s.graded));
  return [...new Set(seen.flatMap((s) => s.introduced))].filter((id) => !graded.has(id));
}

export const PRACTICE_ROUND = 6; // words in one added Picture Match

/** The steps with a Picture Match added right after each step whose new words would otherwise go unpractised
 *  (long lists in rounds of PRACTICE_ROUND). `canMatch(id)`: the word has Arabic and a face to show. Steps that
 *  need nothing are returned as they are; the added steps carry `added: true`. */
export function withPractice(steps, before, canMatch = () => true) {
  const left = new Set(unpractised(steps, before).filter(canMatch));
  if (!left.size) return steps;
  const seen = walk(steps, before);
  return steps.flatMap((step, i) => {
    const mine = seen[i].introduced.filter((id) => left.has(id));
    if (!mine.length) return [step];
    const rounds = [];
    for (let k = 0; k < mine.length; k += PRACTICE_ROUND) rounds.push({ type: "match", words: mine.slice(k, k + PRACTICE_ROUND), added: true });
    return [step, ...rounds];
  });
}
