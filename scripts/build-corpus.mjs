#!/usr/bin/env node
// M0: load Tanzil text + morphology, check they line up word-for-word, and write corpus stats.
// The game will show Tanzil text and attach morphology by word index, so every mismatch must be known.
// Usage: node scripts/build-corpus.mjs   → prints summary, writes data/build/corpus-check.json

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, tanzilWords, unitStats, alignAyah } from "./lib/corpus.mjs";

const { words, byAyah, ayat } = await loadCorpus();

const mismatches = [];
let joined = 0;
let basmalaAyat = 0;
for (const [ref, text] of ayat) {
  const [s, a] = ref.split(":").map(Number);
  const mw = byAyah.get(ref) ?? [];
  const al = alignAyah(s, a, text, mw);
  if (!al) {
    mismatches.push({ ref, tanzil: tanzilWords(text).length, morphology: mw.length });
    continue;
  }
  if (al.basmala) basmalaAyat++;
  joined += al.spans.filter(([x, y]) => y - x > 1).length;
}
const missingAyat = [...byAyah.keys()].filter((ref) => !ayat.has(ref));

const { count } = unitStats(words);
const kinds = { L: 0, A: 0, S: 0, K: 0 };
for (const u of count.keys()) kinds[u[0]]++;

const summary = {
  ayat: ayat.size,
  words: words.length,
  tanzilWords: [...ayat.values()].reduce((n, t) => n + tanzilWords(t).length, 0),
  units: { lemmas: kinds.L, frontPieces: kinds.A, personEndings: kinds.S, grammarKeys: kinds.K },
  alignment: {
    unalignedAyat: mismatches.length, morphologyAyatNotInTanzil: missingAyat.length,
    leadingBasmalaStripped: basmalaAyat, morphologyWordsSpanningTwoTanzilWords: joined, examples: mismatches.slice(0, 20),
  },
};

await mkdir(join(ROOT, "data/build"), { recursive: true });
await writeFile(join(ROOT, "data/build/corpus-check.json"), `${JSON.stringify({ ...summary, mismatches }, null, 1)}\n`);
console.log(JSON.stringify(summary, null, 1));
