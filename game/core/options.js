// Fair answer options (pure, no Math.random). One rule for every game that offers choices:
//   - no two options may look the same to the player: the same Arabic, the same picture, or the same caption in
//     English or in Urdu (captions can be switched off, and the player may read either language);
//   - the answer plus up to two look-alikes / root cousins, then other words in an order that changes from question
//     to question, so the same set is not shown again and again;
//   - as many options as asked for whenever the pool allows (a wider `extra` pool tops a short one up);
//   - the place of the answer comes from a seeded shuffle (word id + question number), never a fixed cycle.
import { confusablesFor } from "./confusable.js";

// FNV-1a, 32 bit: a seed from text (deterministic, no dependencies)
export function hashText(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: a small seeded generator, the same numbers for the same seed on every device
function generator(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** A copy of `list` in an order fixed by `key` (any text or number). */
export function shuffled(list, key) {
  const out = [...list];
  const next = generator(hashText(String(key)));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const LEADING_EN = /^(and|so|then|but|or|the|a|an|is|are|of|to)\s+/;
export const LEADING_UR =/^(اور|پس|پھر|تو)\s+/;

/** A caption as the player takes it in: small letters, no brackets, no leading "and / the", no marks. Two captions
 *  with the same key read as the same answer ("You alone" / "and You alone"). */
export function captionKey(text, leading = LEADING_EN) {
  if (typeof text !== "string") return "";
  const raw = text.toLowerCase().trim();
  let s = raw.replace(/\([^)]*\)/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  for (let before = ""; before !== s;) { before = s; s = s.replace(leading, ""); }
  return s || raw;
}

/** The picture the player sees for a word or an ayah tile: its calligraphy medal, else its painting or emoji. */
export const pictureKey = (face) => face?.medal || face?.pic || "";

const same = (a, b) => a !== "" && a === b;

/** True when two faces (words or ayah tiles: { ar, pic, medal, g }) could be taken for each other on screen: the same
 *  Arabic, the same picture, or the same caption in either language. */
export function looksSame(a, b) {
  if (!a || !b) return false;
  return same(a.ar ?? "", b.ar ?? "")
    || same(pictureKey(a), pictureKey(b))
    || same(captionKey(a.g?.en), captionKey(b.g?.en))
    || same(captionKey(a.g?.ur, LEADING_UR), captionKey(b.g?.ur, LEADING_UR));
}

/** `answer` first, then candidates in the order given, skipping any that looks the same as one already taken, until
 *  there are n. `face(item)` gives the { ar, pic, medal, g } of an item. */
export function chooseDistinct(answer, candidates, n, face = (x) => x) {
  const taken = [answer];
  for (const c of candidates) {
    if (taken.length >= n) break;
    if (taken.includes(c) || taken.some((t) => looksSame(face(t), face(c)))) continue;
    taken.push(c);
  }
  return taken;
}

/** Ids of words that can be an answer option: they have Arabic and a picture or a medal. Each id once. */
export const withFace = (words, ids) => [...new Set(ids)].filter((id) => words[id]?.ar && (words[id].pic || words[id].medal));

const MAX_COUSINS = 2;

/**
 * n option ids for the question about `answerId`, in a seeded order.
 * pool: ids to draw from first (the round's words, words the player has met); extra: a wider pool used only when
 * `pool` cannot fill n fair options. seed: the question number (or any text): with the answer id it fixes both which
 * words are offered and where the answer sits.
 */
export function pickOptions(words, pool, answerId, n, seed = 0, { extra = [] } = {}) {
  const key = `${answerId}|${seed}`;
  const usable = (ids) => [...new Set(ids)].filter((id) => id !== answerId && words[id]);
  const near = usable(pool);
  const far = usable(extra).filter((id) => !near.includes(id));
  const cousins = chooseDistinct(answerId, confusablesFor(words, answerId, near), 1 + Math.min(MAX_COUSINS, n - 1), (id) => words[id]).slice(1);
  const rest = [...shuffled(near.filter((id) => !cousins.includes(id)), key), ...shuffled(far, `${key}|far`)];
  return shuffled(chooseDistinct(answerId, [...cousins, ...rest], n, (id) => words[id]), `${key}|place`);
}

/** Options that are not word ids (meaning cards with their own picture): `items[index]` is the answer. */
export function pickItems(items, index, n, seed = 0) {
  const key = `${index}|${seed}`;
  const others = shuffled(items.filter((_, j) => j !== index), key);
  return shuffled(chooseDistinct(items[index], others, n), `${key}|place`);
}
