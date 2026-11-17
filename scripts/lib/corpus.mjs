// Corpus loading and the "learning units" model behind the coverage meter.
// A word (token) is understood when every unit it requires is learned:
//   L:<lemma>   each stem lemma (e.g. L:رَبّ)
//   A:<piece>   each front piece (e.g. A:ال/the, A:و/and, A:ل/for)
//   S:<person>  each attached person ending (e.g. S:3MP = -hum)
//   K:<key>     each inflection key needed to read this shape of a known word (e.g. K:present, K:plural)
// Derivation keys (verb forms II–X, doer/done-to words, action nouns) are NOT required: a player who learned
// آمَنَ as a word understands it without "form IV". They are tools for guessing new words, kept in `tools`.
// Build-time only; nothing here ships to players.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const MORPH_PATH = join(ROOT, "data/source/morphology/quran-morphology.txt");
export const TANZIL_PATH = join(ROOT, "data/source/tanzil/quran-uthmani.txt");

// Front pieces: same letter, different job → different unit (they are taught separately).
const PREFIX_UNIT = {
  "DET:ال": "A:ال/the",
  "CONJ:و": "A:و/and", "REM:و": "A:و/and", "CIRC:و": "A:و/and", "SUP:و": "A:و/and", "COM:و": "A:و/and",
  "P:و": "A:و/oath", "P:ت": "A:ت/oath",
  "REM:ف": "A:ف/so", "CONJ:ف": "A:ف/so", "RSLT:ف": "A:ف/so", "SUP:ف": "A:ف/so", "CAUS:ف": "A:ف/so",
  "P:ب": "A:ب/with", "P:ك": "A:ك/like",
  "P:ل": "A:ل/for", "PRP:ل": "A:ل/for", "EMPH:ل": "A:ل/surely", "IMPV:ل": "A:ل/let",
  "INTG:أ": "A:أ/question", "EQ:أ": "A:أ/question",
  "VOC:ي": "A:يا/O",
  "FUT:س": "A:س/will",
};
// Pieces that only build a demonstrative (هـ…ذا…لك); they belong to that word's lemma, not a separate unit.
const INNER_PIECES = new Set(["ATT", "DIST", "ADDR"]);

// Grammar-key unit ids. Numbers match docs/CURRICULUM.md §3.
export const KEYS = {
  dual: "K:dual", plural: "K:plural",
  past: "K:past", present: "K:present", command: "K:command", passive: "K:passive",
  doer: "K:doer", doneTo: "K:doneTo", masdar: "K:masdar", emphN: "K:emphatic-n",
  form: (n) => `K:form${n}`,
};

const features = (raw) => {
  const out = { tags: new Set(), kv: {} };
  for (const f of raw.split("|")) {
    const i = f.indexOf(":");
    if (i > 0) out.kv[f.slice(0, i)] = f.slice(i + 1);
    else if (f) out.tags.add(f);
  }
  return out;
};

const PERSON_RE = /^[123]([MF]?[SDP])$/;

/** Parse morphology text into words: [{ref, s, a, w, segments:[{form, pos, tags, kv}]}] in Qur'an order. */
export function parseMorphology(text) {
  const words = [];
  let cur = null;
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [loc, form, pos, feat] = line.split("\t");
    const [s, a, w] = loc.split(":").map(Number);
    const ref = `${s}:${a}:${w}`;
    if (!cur || cur.ref !== ref) {
      cur = { ref, s, a, w, segments: [] };
      words.push(cur);
    }
    const { tags, kv } = features(feat ?? "");
    cur.segments.push({ form, pos, tags, kv });
  }
  return words;
}

const letters = (root) => [...root];
const isWeakRoot = (root) => /[وي]/.test(root);
const isHamzaRoot = (root) => /[ءأإؤئ]/.test(root);
const isDoubledRoot = (root) => letters(root).length === 3 && letters(root)[1] === letters(root)[2];

/** Units a word needs. Returns {units:Set, tools:Set, stems:[{lemma, root, pos, vf, tags}]}. */
export function wordUnits(word) {
  const units = new Set();
  const tools = new Set();
  const stems = [];
  for (const seg of word.segments) {
    const { tags, kv } = seg;
    if (tags.has("PREF")) {
      const job = [...tags].find((t) => t !== "PREF") ?? "P";
      if (INNER_PIECES.has(job)) continue;
      units.add(PREFIX_UNIT[`${job}:${kv.LEM}`] ?? `A:${kv.LEM}/${job}`);
      continue;
    }
    if (tags.has("SUFF")) {
      if (tags.has("PRON")) units.add(`S:${[...tags].find((t) => PERSON_RE.test(t))}`);
      else if (tags.has("EMPH")) units.add(KEYS.emphN);
      // ATT/DIST/ADDR/VOC endings are part of the word's own lemma (ذٰلِكَ, ٱللَّهُمَّ).
      continue;
    }
    if (!kv.LEM && tags.has("PRON")) {
      // Pronoun stems carry no lemma: after a front piece (لَهُمْ، بِهِ) it reads like a person ending;
      // on its own (هُوَ، هُمْ) it is one of the "Who?" words.
      const person = [...tags].find((t) => PERSON_RE.test(t));
      if (word.segments.some((g) => g.tags.has("PREF"))) units.add(`S:${person}`);
      else {
        const lemma = `ضمير:${person}`;
        units.add(`L:${lemma}`);
        stems.push({ lemma, root: "", pos: seg.pos, vf: 0, tags: [...tags] });
      }
      continue;
    }
    if (!kv.LEM) continue;
    const vf = kv.VF ? Number(kv.VF) : 0;
    units.add(`L:${kv.LEM}`);
    stems.push({ lemma: kv.LEM, root: kv.ROOT ?? "", pos: seg.pos, vf, tags: [...tags] });
    if (seg.pos === "V") {
      if (tags.has("PERF")) units.add(KEYS.past);
      if (tags.has("IMPF")) units.add(KEYS.present);
      if (tags.has("IMPV")) units.add(KEYS.command);
    }
    if (tags.has("PASS")) units.add(KEYS.passive);
    if (seg.pos === "N" && [...tags].some((t) => /^[MF]?D$/.test(t))) units.add(KEYS.dual);
    if (seg.pos === "N" && [...tags].some((t) => /^[MF]P$/.test(t))) units.add(KEYS.plural);
    if (tags.has("ACT_PCPL")) tools.add(KEYS.doer);
    if (tags.has("PASS_PCPL")) tools.add(KEYS.doneTo);
    if (tags.has("VN")) tools.add(KEYS.masdar);
    if (vf >= 2) tools.add(KEYS.form(vf));
  }
  return { units, tools, stems };
}

/** Which act a stem analysis belongs to (docs/CURRICULUM.md §4). */
export function lemmaAct(stem) {
  const { pos, root, vf } = stem;
  const t = new Set(stem.tags);
  if (pos === "P" || t.has("PRON") || t.has("DEM") || t.has("REL") || t.has("T") || t.has("LOC")) return 1;
  if (stem.lemma === "اللَّه") return 1;
  const verbal = pos === "V" || t.has("ACT_PCPL") || t.has("PASS_PCPL") || t.has("VN");
  if (!verbal) return 2;
  if (vf >= 2) return 5;
  if (isWeakRoot(root) || isHamzaRoot(root) || isDoubledRoot(root)) return 4;
  return 3;
}

/**
 * Act for a non-lemma unit. Front pieces and person endings are Act 1; grammar keys follow CURRICULUM §3.
 * `numberKeysAct` lets the report test teaching one/two/many (G14) in Act 1 instead of Act 2.
 */
export function unitAct(unit, numberKeysAct = 2) {
  if (unit.startsWith("A:") || unit.startsWith("S:")) return 1;
  if (unit === KEYS.dual || unit === KEYS.plural) return numberKeysAct;
  if (/^K:form\d+$/.test(unit)) return 5;
  if (unit.startsWith("K:")) return 3;
  return null;
}

/** Parse Tanzil "s|a|text" lines (comment lines start with #) into Map("s:a" → text). */
export function parseTanzil(text) {
  const ayat = new Map();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [s, a, ...rest] = line.split("|");
    ayat.set(`${Number(s)}:${Number(a)}`, rest.join("|"));
  }
  return ayat;
}

// Tanzil places pause/sajdah/hizb marks as separate space-delimited tokens; they are not words.
const ARABIC_LETTER = /[ء-يٱ-ۓ]/;
export const tanzilWords = (ayahText) => ayahText.split(/\s+/).filter((t) => ARABIC_LETTER.test(t));

// Tanzil v1.1 opens ayah 1 of every surah except 1 and 9 with the Basmala; the morphology does not.
const BASMALA_WORDS = 4;
export const hasLeadingBasmala = (s, a, words) => a === 1 && s !== 1 && s !== 9 && letterKey(words[0] ?? "") === "بسم";

/**
 * Letters only: drop vowel marks, Qur'anic signs and tatweel; alef wasla → alef. Used to match the two sources.
 * Spelling conventions that differ between them: Tanzil writes hamza as a mark on tatweel (ـٔ) where the
 * morphology has ء, and a medial dagger alef on tatweel (ـٰ) where the morphology has ىٰ.
 */
export const letterKey = (text) =>
  text
    .replace(/ٔ/g, "ء")
    .replace(/ىٰ(?=[ً-ٰٟ]*[ء-يٱ])/g, "")
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ\s]/g, "")
    .replace(/ٱ/g, "ا");

/**
 * Map each morphology word of an ayah to the Tanzil words it covers ([start, end) indexes into tanzilWords()).
 * The morphology joins a few word pairs that Tanzil v1.1 writes apart (e.g. بَعْدَ مَا), so match by letters.
 * Returns {spans, basmala} or null if the letters do not line up.
 */
export function alignAyah(s, a, ayahText, morphWords) {
  const tw = tanzilWords(ayahText);
  const basmala = hasLeadingBasmala(s, a, tw);
  let i = basmala ? BASMALA_WORDS : 0;
  const spans = [];
  for (const mw of morphWords) {
    const want = letterKey(mw.segments.map((g) => g.form).join(""));
    const start = i;
    let got = "";
    while (i < tw.length && got.length < want.length) got += letterKey(tw[i++]);
    if (got !== want) return null;
    spans.push([start, i]);
  }
  return i === tw.length ? { spans, basmala } : null;
}

/** Load and index everything once. */
export async function loadCorpus() {
  const [morph, tanzil] = await Promise.all([readFile(MORPH_PATH, "utf8"), readFile(TANZIL_PATH, "utf8")]);
  const words = parseMorphology(morph).map((w) => ({ ...w, ...wordUnits(w) }));
  const byAyah = new Map();
  for (const w of words) {
    const k = `${w.s}:${w.a}`;
    if (!byAyah.has(k)) byAyah.set(k, []);
    byAyah.get(k).push(w);
  }
  return { words, byAyah, ayat: parseTanzil(tanzil) };
}

/** Count how many words need each unit, and give each unit an act (lemmas: their most frequent analysis). */
export function unitStats(words, { numberKeysAct = 2 } = {}) {
  const count = new Map();
  const lemmaVotes = new Map(); // lemma → Map(act → n)
  for (const w of words) {
    for (const u of w.units) count.set(u, (count.get(u) ?? 0) + 1);
    for (const st of w.stems) {
      const votes = lemmaVotes.get(st.lemma) ?? new Map();
      const act = lemmaAct(st);
      votes.set(act, (votes.get(act) ?? 0) + 1);
      lemmaVotes.set(st.lemma, votes);
    }
  }
  const act = new Map();
  for (const u of count.keys()) {
    if (!u.startsWith("L:")) { act.set(u, unitAct(u, numberKeysAct)); continue; }
    const votes = [...lemmaVotes.get(u.slice(2))].sort((x, y) => y[1] - x[1] || x[0] - y[0]);
    act.set(u, votes[0][0]);
  }
  return { count, act };
}

/** All units, most-needed first (ties broken by id so output is deterministic). */
export function byFrequency({ count }) {
  return [...count.keys()].sort((x, y) => count.get(y) - count.get(x) || (x < y ? -1 : 1));
}

/** The curriculum order for a chosen unit set: Act 1 → 5, most-needed first inside each act. */
export function actOrder(units, { act }) {
  return [...units].sort((x, y) => act.get(x) - act.get(y));
}

/**
 * Coverage curve for a learning order. Returns [{n, unit, covered, pct}] after each unit.
 * A word is covered the moment its last missing unit is learned; words needing units outside the order never count.
 */
export function coverageCurve(words, order) {
  const pos = new Map(order.map((u, i) => [u, i]));
  const coveredAt = new Array(order.length).fill(0);
  for (const w of words) {
    let last = -1;
    for (const u of w.units) {
      const p = pos.get(u);
      if (p === undefined) { last = Infinity; break; }
      if (p > last) last = p;
    }
    if (Number.isFinite(last) && last >= 0) coveredAt[last]++;
  }
  let covered = 0;
  return order.map((unit, i) => {
    covered += coveredAt[i];
    return { n: i + 1, unit, covered, pct: (100 * covered) / words.length };
  });
}

/** Share of an ayah's words understood with a known-unit set, plus the units still missing. */
export function ayahReadiness(ayahWords, known) {
  const missing = new Set();
  let ok = 0;
  for (const w of ayahWords) {
    let wordOk = true;
    for (const u of w.units) if (!known.has(u)) { missing.add(u); wordOk = false; }
    if (wordOk) ok++;
  }
  return { pct: ayahWords.length ? ok / ayahWords.length : 0, missing };
}
