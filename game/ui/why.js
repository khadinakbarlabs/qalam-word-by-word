// "What the picture shows": one plain line per word picture, shown on a long-press, on the back of a Meet card and in
// the Words tab. The lines ship in their own file (content/why.json, core/content.js) so the boot pack stays small;
// main.js hands them over when they arrive. Until then (or if they never arrive) a word simply has no picture line.
let lines = {};
let byWord = new WeakMap(); // pack word object -> its line, for callers that hold the word and not its id
let arrived = false;
let waiting = []; // cards drawn before the lines arrived: each is filled in once, when they do

/** packWords: pack.words; words: { wordId: { en, ur } } from content/why.json. */
export function setWhy(packWords, words) {
  lines = words ?? {};
  byWord = new WeakMap(Object.entries(lines).filter(([id]) => packWords?.[id]).map(([id, line]) => [packWords[id], line]));
  arrived = Boolean(words);
  if (!arrived) return;
  const run = waiting;
  waiting = [];
  run.forEach((fill) => fill());
}

/** Run `fill` once the picture lines are here: now if they are, else when they arrive (a card drawn early is not
 *  left without its line). If they never arrive, `fill` never runs. */
export function whenWhy(fill) {
  if (arrived) fill();
  else waiting = [...waiting, fill];
}

/** The picture line of a word, by its id or by the pack's own word object; null when there is none (yet). */
export const whyOf = (word) => (typeof word === "string" ? lines[word] : word && byWord.get(word)) ?? null;

/** The picture line as a caption in both languages (Urdu falls back to English), or null. */
export const whyCaption = (word) => {
  const why = whyOf(word);
  return why ? { en: why.en, ur: why.ur ?? why.en } : null;
};
