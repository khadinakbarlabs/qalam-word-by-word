#!/usr/bin/env node
// M0: how many learning units does it take to reach 40/50/60/70/80/85% of the Qur'an's words?
//   strict      our meter (CURRICULUM §2): a word counts only when lemma + front pieces + endings + grammar keys are known;
//               units learned most-needed first
//   lemma-only  a word counts when its stem lemma(s) are known (closest to a word-list count like the reference booklet)
// Then the "85% set" (strict units up to 85%) is split into the 5 acts and replayed in act order, to show what each
// act must teach and the coverage after it — once with one/two/many (G14) in Act 2 as planned, once in Act 1.
// Usage: node scripts/coverage.mjs   → prints summary, writes data/build/coverage.json + coverage-curve.csv

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, unitStats, byFrequency, actOrder, coverageCurve } from "./lib/corpus.mjs";

const TARGETS = [40, 50, 60, 70, 80, 85, 90];
const GOAL = 85;

const { words } = await loadCorpus();
const stats = unitStats(words);
const order = byFrequency(stats);

const isLemma = (u) => u.startsWith("L:");
// Lemma-only: a word needs just its stem lemma(s); words with no lemma (لَهُمْ = piece + ending) need their pieces.
const lemmaWords = words.map((w) => {
  const lemmas = [...w.units].filter(isLemma);
  return { units: new Set(lemmas.length ? lemmas : w.units) };
});
const curves = {
  strict: coverageCurve(words, order),
  "lemma-only": coverageCurve(lemmaWords, order),
};
const milestones = (curve) =>
  Object.fromEntries(
    TARGETS.map((t) => {
      const hit = curve.find((p) => p.pct >= t);
      if (!hit) return [`${t}%`, null];
      const lemmas = curve.slice(0, hit.n).filter((p) => isLemma(p.unit)).length;
      return [`${t}%`, { units: hit.n, lemmas, otherUnits: hit.n - lemmas }];
    }),
  );

const goalSet = order.slice(0, curves.strict.find((p) => p.pct >= GOAL).n);

/** Replay the goal set in act order; report what each act teaches and the coverage after it. */
function actPlan(numberKeysAct) {
  const s = numberKeysAct === 2 ? stats : unitStats(words, { numberKeysAct });
  const seq = actOrder(goalSet, s);
  const curve = coverageCurve(words, seq);
  let at = 0;
  return [1, 2, 3, 4, 5].map((act) => {
    const units = seq.filter((u) => s.act.get(u) === act);
    at += units.length;
    return {
      act,
      lemmas: units.filter(isLemma).length,
      otherUnits: units.filter((u) => !isLemma(u)),
      coverageAfterAct: at ? +curve[at - 1].pct.toFixed(1) : null,
      top12: units.filter(isLemma).slice(0, 12).map((u) => `${u.slice(2)} (${s.count.get(u)})`),
    };
  });
}

const summary = {
  words: words.length,
  distinctUnits: order.length,
  milestones: Object.fromEntries(Object.entries(curves).map(([k, c]) => [k, milestones(c)])),
  goal: { pct: GOAL, units: goalSet.length, lemmas: goalSet.filter(isLemma).length },
  actPlan: actPlan(2),
  actPlanNumberKeysInAct1: actPlan(1).map(({ act, coverageAfterAct }) => ({ act, coverageAfterAct })),
};

await mkdir(join(ROOT, "data/build"), { recursive: true });
await writeFile(
  join(ROOT, "data/build/coverage.json"),
  `${JSON.stringify({ ...summary, units: order.map((u, i) => ({ rank: i + 1, unit: u, words: stats.count.get(u), act: stats.act.get(u) })) }, null, 1)}\n`,
);
const csv = ["n,strict_pct,lemma_only_pct"];
for (let i = 0; i < order.length; i++) {
  const f = (c) => (c[i] ? c[i].pct.toFixed(2) : "");
  csv.push(`${i + 1},${f(curves.strict)},${f(curves["lemma-only"])}`);
}
await writeFile(join(ROOT, "data/build/coverage-curve.csv"), `${csv.join("\n")}\n`);
console.log(JSON.stringify(summary, null, 1));
