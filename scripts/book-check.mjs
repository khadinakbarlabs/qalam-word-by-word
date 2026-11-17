#!/usr/bin/env node
// Book checklist → corpus units: proves the curriculum misses nothing from the reference booklets.
// Reads the internal transcriptions (Arabic forms, sections, counts; no glosses) of every edition in SOURCES,
// matches every entry to morphology units, and reports:
//   - entries that could not be matched, and rows whose printed count disagrees with the corpus (for review),
//   - coverage each edition's word set reaches on our strict meter, and what each adds beyond the English edition,
//   - booklet words outside our 85% goal set, and goal-set words no booklet has.
// Usage: node scripts/book-check.mjs   → prints summary, writes data/build/book-coverage.json

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, unitStats, byFrequency, coverageCurve } from "./lib/corpus.mjs";

// The English 85% booklet (2018), the Urdu 85% edition (verb pages differ; its noun pages match the English ones),
// and the older Arabic-Urdu 80% list (2011). A missing folder simply contributes nothing yet.
const SOURCES = [
  { id: "en85", dir: "data/reference/book" },
  { id: "ur85", dir: "data/reference/book-ur" },
  { id: "ur80", dir: "data/reference/book80" },
];
const GOAL = 85;

// Spelling keys, strictest first, so book forms, lemmas and Qur'anic surface forms can be compared.
// A dagger alef (ٰ) is either a long a (رَحْمٰن) or just decoration before ى (إِلٰى) or in اللّٰه, so every key is
// computed for both readings.
const daggerVariants = (s) => {
  const t = s.replace(/ٰ(?=[ً-ٟ]*ى)/g, "").replace(/ىٰ/g, "ى");
  return [...new Set([t.replace(/ٰ/g, "ا"), t.replace(/ٰ/g, "")])];
};
// The booklet sometimes seats hamza on a dotless ya with a hamza mark (لَىِٕنْ); treat that as ئ.
const base = (s) => s.replace(/[ؐ-ؚۖ-ۭـ\s]/g, "").replace(/[ىي]([ً-ْ]*)[ٕٔ]/g, "ئ$1").replace(/ٱ/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
// fine: keeps short vowels, shadda and hamza seats (tells مَن from مِن, أَتَى from آتَى); drops sukun and tanween.
const fine = (s) => daggerVariants(s).map((v) => base(v).replace(/[ً-ٍْ-ٟ]/g, ""));
// medium: drops vowels, keeps shadda and hamza seats (tells إِنَّ from إِنْ and أَنْ).
const medium = (s) => daggerVariants(s).map((v) => base(v).replace(/[ً-ِْ-ٟ]/g, ""));
// loose: letters only, all alef/hamza forms unified.
const norm = (s) => daggerVariants(s).map((v) => base(v).replace(/[ً-ٟ]/g, "").replace(/[أإآٲ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ء/g, "").replace(/ا+/g, "ا"));
// skeleton: also drops long vowels, for Uthmani spellings like صَلَوٰة vs صَلٰوة.
const skeleton = (s) => norm(s).map((k) => k.replace(/[اوي]/g, "").replace(/ه$/, ""));
const LEVELS = [["fine", fine], ["medium", medium], ["loose", norm]];

// Booklet notation for pieces and pronouns → our unit ids (corpus.mjs). Keys are loose (norm) spellings.
const PIECES = {
  "ب": ["A:ب/with"], "ل": ["A:ل/for"], "ك": ["A:ك/like"], "و": ["A:و/and"], "ف": ["A:ف/so"], "س": ["A:س/will"],
  "ال": ["A:ال/the"], "ت": ["A:ت/oath"], "يا": ["A:يا/O"], "ا": ["A:أ/question"], "يايها": ["A:يا/O", "L:أَيّ"],
};
const ENDINGS = {
  "ه": "S:3MS", "هم": "S:3MP", "ك": "S:2MS", "كم": "S:2MP", "ي": "S:1S", "ني": "S:1S", "نا": "S:1P", "ها": "S:3FS",
  "هن": "S:3FP", "كن": "S:2FP", "هما": "S:3D", "كما": "S:2D", "كي": "S:2FS",
};
// Particles the booklet prints joined (assimilated or fused) → their parts. Keys are medium spellings (shadda kept),
// so لِمَا (لِ + مَا) is not confused with لَمَّا.
const COMPOUNDS = {
  "ممّا": ["L:مِن", "L:ما"], "ممّن": ["L:مِن", "L:مَن"], "عمّا": ["L:عَن", "L:ما"], "عمّن": ["L:عَن", "L:مَن"],
  "لما": ["A:ل/for", "L:ما"], "بما": ["A:ب/with", "L:ما"], "فيما": ["L:فِي", "L:ما"], "لمن": ["A:ل/for", "L:مَن"],
  "إنّما": ["L:إِنّ", "L:ما"], "أنّما": ["L:أَنّ", "L:ما"], "كأنّما": ["L:كَأَنّ", "L:ما"], "كلّما": ["L:كُلّ", "L:ما"],
  "لئن": ["A:ل/surely", "L:إِن"], "لقد": ["A:ل/surely", "L:قَد"], "يومئذ": ["L:يَوْم", "L:إِذ"], "ألّا": ["L:أَن", "L:لا"],
};
// Separate pronouns have no lemma in the morphology; corpus.mjs files them as ضمير:<person>.
const PRONOUNS = {
  "هو": "3MS", "هي": "3FS", "هم": "3MP", "هن": "3FP", "هما": "3D", "انت": "2MS", "انتم": "2MP", "انتن": "2FP",
  "انتما": "2D", "انا": "1S", "نحن": "1P",
};

const entries = [];
for (const { id, dir } of SOURCES) {
  const files = await readdir(join(ROOT, dir)).catch(() => []);
  for (const f of files.filter((n) => n.endsWith(".jsonl")).sort()) {
    for (const line of (await readFile(join(ROOT, dir, f), "utf8")).split("\n")) {
      if (!line.trim()) continue;
      const e = JSON.parse(line);
      if (e.kind !== "footer") entries.push({ ...e, src: id });
    }
  }
}

const { words } = await loadCorpus();
const stats = unitStats(words);
const order = byFrequency(stats);
const goalSet = new Set(order.slice(0, coverageCurve(words, order).find((p) => p.pct >= GOAL).n));

// Indexes per spelling level: lemma key → lemma units; surface key (stem incl. demonstrative pieces) → lemma units.
const index = { lemma: {}, surface: {}, skeleton: new Map() };
const add = (map, k, u, n = 1) => {
  if (!map.has(k)) map.set(k, new Map());
  map.get(k).set(u, (map.get(k).get(u) ?? 0) + n);
};
for (const [level] of LEVELS) { index.lemma[level] = new Map(); index.surface[level] = new Map(); }
for (const [u, n] of stats.count) {
  if (!u.startsWith("L:")) continue;
  for (const [level, key] of LEVELS) for (const k of key(u.slice(2))) add(index.lemma[level], k, u, n);
  for (const k of skeleton(u.slice(2))) add(index.skeleton, k, u, n);
}
// Root of each lemma (most frequent analysis), so a verb row's other forms can be checked against the verb's root.
const rootVotes = new Map();
for (const w of words) for (const st of w.stems) if (st.root) add(rootVotes, `L:${st.lemma}`, st.root);
const rootOf = (u) => best(rootVotes.get(u));
const isAffix = (g) => (g.tags.has("PREF") && !g.tags.has("ATT")) || (g.tags.has("SUFF") && (g.tags.has("PRON") || g.tags.has("EMPH")));
for (const w of words) {
  const lemmas = [...w.units].filter((u) => u.startsWith("L:"));
  if (lemmas.length !== 1) continue;
  const surface = w.segments.filter((g) => !isAffix(g)).map((g) => g.form).join("");
  for (const [level, key] of LEVELS) for (const k of key(surface)) add(index.surface[level], k, lemmas[0]);
}
const best = (m) => (m ? [...m].sort((x, y) => y[1] - x[1])[0][0] : null);
const lookup = (map, keys) => {
  for (const k of keys) {
    const u = best(map.get(k)) ?? (k.startsWith("ال") ? best(map.get(k.slice(2))) : null);
    if (u) return u;
  }
  return null;
};

/** Match one Arabic word from the booklet (no spaces) to units, strictest spelling level first. */
function matchSingle(s) {
  const loose = norm(s);
  if (s.startsWith("ـ")) { const e = loose.map((k) => ENDINGS[k]).find(Boolean); if (e) return { units: [e], how: "ending" }; }
  const piece = loose.map((k) => PIECES[k]).find(Boolean);
  if (piece) return { units: piece, how: "piece" };
  const pron = loose.map((k) => PRONOUNS[k]).find(Boolean);
  if (pron) return { units: [`L:ضمير:${pron}`], how: "pronoun" };
  const fused = medium(s).map((k) => COMPOUNDS[k]).find(Boolean);
  if (fused) return { units: fused, how: "compound" };
  for (const [level, key] of LEVELS) {
    const keys = key(s);
    const u = lookup(index.lemma[level], keys) ?? lookup(index.surface[level], keys);
    if (u) return { units: [u], how: level };
  }
  const end = loose.map((k) => ENDINGS[k]).find(Boolean);
  if (end) return { units: [end], how: "ending" };
  // Compounds the booklet prints as one word: front piece + word (لِمَنْ، لَقَدْ، بِمَا), word + مَا (كَأَنَّمَا).
  const letters = [...s];
  const firstMark = letters.findIndex((c, i) => i > 0 && /[ء-يٱ]/.test(c));
  if (firstMark > 0 && PIECES[norm(letters.slice(0, firstMark).join(""))[0]]) {
    const rest = matchSingle(letters.slice(firstMark).join(""));
    if (rest) return { units: [...PIECES[norm(letters.slice(0, firstMark).join(""))[0]], ...rest.units], how: "compound" };
  }
  if (loose[0].endsWith("ما") && loose[0].length > 3) {
    const cut = s.replace(/مَ?ا$/, "");
    const head = cut !== s ? matchSingle(cut) : null;
    if (head) return { units: [...head.units, "L:ما"], how: "compound" };
  }
  const u = lookup(index.skeleton, skeleton(s).filter((k) => k.length >= 2));
  return u ? { units: [u], how: "skeleton" } : null;
}

/** Match one Arabic word or phrase from the booklet to units. Returns {units, how} or null. */
function matchWord(raw) {
  const s = raw.replace(/[()\[\]+.…،,/]/g, " ").trim();
  if (!s) return null;
  const parts = s.split(/\s+/).filter((p) => norm(p)[0]);
  if (parts.length === 1) return matchSingle(parts[0]);
  const subs = parts.map(matchSingle);
  if (subs.some((x) => !x)) return null;
  return { units: subs.flatMap((x) => x.units), how: "phrase" };
}

const TABLE_UNITS = { past: ["K:past"], imperfect: ["K:present"], imperative: ["K:command"], negative: ["K:present"], passive: ["K:passive"] };
const results = [];
for (const e of entries) {
  if (e.pattern_row) continue;
  if (e.kind === "table") {
    results.push({ e, units: TABLE_UNITS[e.table] ?? [], how: "table", head: e.ar });
    continue;
  }
  // The 80% list prints its conjugation tables as "paradigm" rows; like the 85% tables they teach grammar, not words.
  if (e.kind === "paradigm") {
    const slot = e.slot ?? "";
    const units = /Past|ماضي/.test(slot) ? ["K:past"] : /Imperfect|مضارع|Negative|نهي/.test(slot) ? ["K:present"]
      : /Imperative|أمر|امر/.test(slot) ? ["K:command"] : /Passive Voice|مجهول/.test(slot) ? ["K:passive"] : [];
    results.push({ e, units, how: "table", head: e.ar });
    continue;
  }
  const head = e.past ?? e.ar;
  const m = matchWord(head);
  if (!e.past) {
    const forms = (e.forms ?? []).map(matchWord).filter(Boolean);
    results.push({ e, units: [...new Set([...(m?.units ?? []), ...forms.flatMap((f) => f.units)])], how: m?.how ?? null, head });
    continue;
  }
  // Verb rows teach six forms; doer words, done-to words and action nouns are lemmas of their own (كافِر، رَحْمَة).
  // The morphology files some verbs under a present-tense lemma (يَذَرَ، يُوقِنُ), so every form votes for the row's
  // root (the past tense counts double) and only lemmas with that root are kept — loose matches can't pull in strangers.
  const forms = [head, head, e.present, e.imperative, e.active, e.passive, ...(e.masdar ?? "").split(/[،,/]/)]
    .filter((f) => f && f.trim() !== "-")
    .map(matchWord)
    .filter((f) => f && !["compound", "skeleton", "phrase"].includes(f.how))
    .flatMap((f) => f.units.filter((u) => u.startsWith("L:") && rootOf(u)));
  const votes = new Map();
  for (const u of forms) add(votes, rootOf(u), u);
  const root = [...votes].sort((x, y) => [...y[1].values()].reduce((a, b) => a + b) - [...x[1].values()].reduce((a, b) => a + b))[0]?.[0];
  const units = root ? [...new Set(forms.filter((u) => rootOf(u) === root))] : m?.units ?? [];
  const how = !units.length ? null : m && units.includes(m.units[0]) ? m.how : "via-forms";
  results.push({ e, units, how, head, root });
}

const unmatched = results.filter((r) => r.how === null);
// Sanity check: the booklet prints how often each row occurs; compare with the corpus count of what we matched.
// A large gap means the match is probably wrong (or the row needs a reviewer's eye).
const corpusWords = (units) => units.filter((u) => u.startsWith("L:")).reduce((n, u) => n + (stats.count.get(u) ?? 0), 0);
const review = results
  .filter((r) => r.how && r.e.count >= 5)
  .map((r) => ({ src: r.e.src, page: r.e.page, head: r.head, how: r.how, book: r.e.count, corpus: corpusWords(r.units), units: r.units }))
  .filter((x) => x.corpus < x.book * 0.5 || x.corpus > x.book * 2.5);
// "The book" = every edition together, so nothing any edition teaches is missed.
const bookUnits = new Set(results.flatMap((r) => r.units));
const bookLemmas = [...bookUnits].filter((u) => u.startsWith("L:"));
// The booklets teach all pieces, endings and inflection keys (pp. 1-6, 39-42), so give their reader all of them.
const grammar = order.filter((u) => !u.startsWith("L:"));
const coverageOf = (units) => coverageCurve(words, [...grammar, ...order.filter((u) => u.startsWith("L:") && units.has(u))]).at(-1).pct;
const bookOrder = [...grammar, ...order.filter((u) => u.startsWith("L:") && bookUnits.has(u))];
const bookPct = coverageOf(bookUnits);
const unitsBySource = Object.fromEntries(SOURCES.map(({ id }) => [id, new Set(results.filter((r) => r.e.src === id).flatMap((r) => r.units))]));
const perSource = Object.fromEntries(SOURCES.map(({ id }) => {
  const own = unitsBySource[id];
  const extra = [...own].filter((u) => u.startsWith("L:") && !unitsBySource.en85.has(u));
  return [id, {
    rows: results.filter((r) => r.e.src === id).length,
    lemmas: [...own].filter((u) => u.startsWith("L:")).length,
    coverageStrictPct: own.size ? +coverageOf(own).toFixed(1) : null,
    lemmasNotInEnglishEdition: id === "en85" ? 0 : extra.length,
    topExtras: id === "en85" ? [] : extra.sort((x, y) => stats.count.get(y) - stats.count.get(x)).slice(0, 15).map((u) => `${u.slice(2)}(${stats.count.get(u)})`),
  }];
}));
const notInGoal = bookLemmas.filter((u) => !goalSet.has(u));
const goalNotInBook = [...goalSet].filter((u) => u.startsWith("L:") && !bookUnits.has(u));
const unionOrder = [...new Set([...bookOrder, ...order.filter((u) => goalSet.has(u))])];
const unionPct = coverageCurve(words, unionOrder).at(-1).pct;

const summary = {
  perSource,
  bookRows: entries.length,
  wordRows: results.filter((r) => r.e.kind !== "table").length,
  tableCells: results.filter((r) => r.e.kind === "table").length,
  matchedBy: results.reduce((acc, r) => ({ ...acc, [r.how ?? "UNMATCHED"]: (acc[r.how ?? "UNMATCHED"] ?? 0) + 1 }), {}),
  countMismatchesToReview: review.length,
  bookLemmas: bookLemmas.length,
  bookCoverageStrictPct: +bookPct.toFixed(1),
  goalLemmas: [...goalSet].filter((u) => u.startsWith("L:")).length,
  bookLemmasOutsideGoal: notInGoal.length,
  goalLemmasMissingFromBook: goalNotInBook.length,
  bookPlusGoalCoveragePct: +unionPct.toFixed(1),
  bookPlusGoalLemmas: unionOrder.filter((u) => u.startsWith("L:")).length,
};

await mkdir(join(ROOT, "data/build"), { recursive: true });
await writeFile(join(ROOT, "data/build/book-coverage.json"), `${JSON.stringify({
  summary,
  unmatched: unmatched.map((r) => ({ src: r.e.src, page: r.e.page, section: r.e.section ?? r.e.group, head: r.head })),
  review,
  goalMissingFromBook: goalNotInBook.map((u) => ({ unit: u, words: stats.count.get(u) })),
  bookOutsideGoal: notInGoal.map((u) => ({ unit: u, words: stats.count.get(u) })),
  rows: results.map((r) => ({ src: r.e.src, page: r.e.page, head: r.head, how: r.how, units: r.units })),
}, null, 1)}\n`);
console.log(JSON.stringify(summary, null, 1));
console.log("unmatched:", unmatched.map((r) => `${r.e.src} p${r.e.page} ${r.head}`).join(" | ") || "none");
console.log("top goal words missing from book:", goalNotInBook.slice(0, 30).map((u) => `${u.slice(2)}(${stats.count.get(u)})`).join(" "));
