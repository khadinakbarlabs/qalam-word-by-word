// Meaning chips for one word of an Ayah Light-Up (pure). The answer is the tile itself; the wrong chips are, in order:
// words the player knows that are easily mistaken for it (worked out for the real word of a compound tile, not its
// one-letter prefix), other words of this ayah that are not lit yet, other words the player has met, then any word.
// A chip is never offered when it would be unfair or a give-away:
//   - it looks the same as the answer or as another chip (same Arabic, picture or caption: core/options.js);
//   - it is one of the answer's own parts, or another tile of the same word;
//   - its meaning is already printed on a lit tile of this ayah (the player could just cross it off).
import { confusablesFor, mainId } from "./confusable.js";
import { chooseDistinct, looksSame, shuffled } from "./options.js";

export const AYAH_CHIPS = 4;
const MAX_COUSINS = 2;

const cardFace = (words, id) => ({ id, ar: words[id].ar, say: words[id].say, g: words[id].g, pic: words[id].pic, medal: words[id].medal });
const hasFace = (w) => Boolean(w?.ar && (w.pic || w.medal));

/**
 * tiles: the step's words; k: the tile asked about; met: ids the player knows (a Set or list); lit: per tile, true
 * when its meaning is on screen (given or already answered); seed: any text that names the question.
 * Returns the chips in the order to show them; the answer is `tiles[k]` itself (compare by identity).
 */
export function ayahChips({ words, tiles, k, met, lit = [], n = AYAH_CHIPS, seed = "" }) {
  const answer = tiles[k];
  const main = mainId(words, answer.w);
  const key = `${seed}|${k}|${main ?? ""}`;
  const parts = new Set(answer.w ?? []);
  const onScreen = tiles.filter((_, j) => j !== k && lit[j]);
  const known = [...met].filter((id) => hasFace(words[id]) && !parts.has(id));
  const fair = (c) => !looksSame(c, answer) && !(main && looksSame(c, words[main])) && !onScreen.some((o) => looksSame(o, c));

  const cousins = (main ? confusablesFor(words, main, known) : []).slice(0, MAX_COUSINS).map((id) => cardFace(words, id));
  const sameAyah = tiles.filter((o, j) => j !== k && !o.given && !lit[j] && !(main && (o.w ?? []).includes(main)));
  const others = known.filter((id) => !cousins.some((c) => c.id === id)).map((id) => cardFace(words, id));
  const far = Object.keys(words).filter((id) => hasFace(words[id]) && !parts.has(id) && !known.includes(id)).map((id) => cardFace(words, id));
  const candidates = [...cousins, ...shuffled([...sameAyah, ...others], key), ...shuffled(far, `${key}|far`)].filter(fair);
  return shuffled(chooseDistinct(answer, candidates, n), `${key}|place`);
}
