// Confusable words (pure). Answer chips used to be picked by list position, so a wrong chip was rarely a real mix-up.
// Now the chips for a word include the words most easily mistaken for it: the same letters with other marks, one letter
// apart, or the same root family. A wrong pick then gets a reason ("those two look alike") instead of a bare "no".
// No Math.random: the choice depends only on the word, the pool and a seed, so QA stays repeatable.

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const SOFT = /[وياىئؤءةه]/g;

/** Letters only: no marks, one alef, no leading "al-" (so ٱلرَّحْمَـٰن and رَحْمَـٰن are the same skeleton). */
export const skeleton = (ar) => {
  const s = ar.replace(MARKS, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي");
  return s.length > 3 && s.startsWith("ال") ? s.slice(2) : s;
};

const core = (ar) => skeleton(ar).replace(SOFT, "");

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

function lcs(a, b) {
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(row[j], row[j - 1]);
      prev = keep;
    }
  }
  return row[b.length];
}

/** Why two different words get mixed up: "look" (same letters or one letter apart), "root" (the same root letters), or
 *  null. Words with an empty Arabic side (game pieces) are never confusable. */
export function reason(a, b) {
  if (!a?.ar || !b?.ar || a.ar === b.ar) return null;
  const x = skeleton(a.ar);
  const y = skeleton(b.ar);
  if (!x || !y) return null;
  const d = distance(x, y);
  if (d === 0 || (d === 1 && Math.min(x.length, y.length) >= 2)) return "look";
  const cx = core(a.ar);
  const cy = core(b.ar);
  if (cx.length >= 3 && cy.length >= 3 && lcs(cx, cy) >= 3) return "root";
  if (d === 2 && Math.min(x.length, y.length) >= 4) return "look";
  return null;
}

const SCORE = { look: 2, root: 1 };

/** Ids from `pool` that are most easily taken for `id`, best first (look-alikes before root family). */
export function confusablesFor(words, id, pool) {
  const me = words[id];
  return pool
    .map((other, i) => ({ other, i, r: other === id || !words[other] ? null : reason(me, words[other]) }))
    .filter((c) => c.r)
    .sort((p, q) => SCORE[q.r] - SCORE[p.r] || p.i - q.i)
    .map((c) => c.other);
}

/** The reason key for a wrong pick, or "plain" when the two words have nothing in common. */
export const whyNot = (words, answerId, pickedId) => `why_${reason(words[answerId], words[pickedId]) ?? "plain"}`;

/** n answer ids for `answerId`: the answer, up to two look-alikes / root cousins, then others from the pool in a stable
 *  order shifted by `seed`; the whole list is rotated by the seed so the answer does not always sit in one place. */
export function pickOptions(words, pool, answerId, n, seed = 0) {
  const others = pool.filter((id) => id !== answerId);
  const cousins = confusablesFor(words, answerId, others).slice(0, Math.min(2, n - 1));
  const rest = others.filter((id) => !cousins.includes(id));
  const fill = Array.from({ length: Math.max(0, Math.min(n - 1 - cousins.length, rest.length)) }, (_, k) => rest[(seed + k * 2) % rest.length]);
  const picked = [...new Set([answerId, ...cousins, ...fill])];
  const turn = seed % picked.length;
  return picked.slice(turn).concat(picked.slice(0, turn));
}
