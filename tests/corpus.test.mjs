import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import {
  parseMorphology, wordUnits, letterKey, alignAyah, coverageCurve, ayahReadiness, unitStats, byFrequency,
  loadCorpus, MORPH_PATH, TANZIL_PATH,
} from "../scripts/lib/corpus.mjs";

// Synthetic morphology lines in the source format: location \t form \t POS \t features.
const MORPH = [
  "1:1:1:1\tلَ\tP\tP|PREF|LEM:ل",
  "1:1:1:2\tهُمْ\tN\tPRON|3MP",
  "1:1:2:1\tهُمْ\tN\tPRON|3MP",
  "1:1:3:1\tيَعْلَمُ\tV\tIMPF|VF:1|ROOT:علم|LEM:عَلِمَ|3MP|IND",
  "1:1:3:2\tونَ\tV\tSUFF|3MP",
  "1:1:4:1\tءَامَنُ\tV\tPERF|VF:4|ROOT:أمن|LEM:آمَنَ|3MP",
  "1:1:5:1\tٱل\tP\tDET|PREF|LEM:ال",
  "1:1:5:2\tمُؤْمِنُونَ\tN\tACT_PCPL|VF:4|ROOT:أمن|LEM:مُؤْمِن|MP|NOM",
  "1:1:6:1\tذَٰ\tN\tDEM|LEM:ذا|MS",
  "1:1:6:2\tلِ\tN\tDIST|SUFF|LEM:ل",
  "1:1:6:3\tكَ\tN\tADDR|SUFF|MS",
].join("\n");

const words = () => parseMorphology(MORPH).map((w) => ({ ...w, ...wordUnits(w) }));
const unitsOf = (i) => [...words()[i].units].sort();

test("segments group into words in order", () => {
  const w = parseMorphology(MORPH);
  assert.equal(w.length, 6);
  assert.deepEqual(w.map((x) => x.ref), ["1:1:1", "1:1:2", "1:1:3", "1:1:4", "1:1:5", "1:1:6"]);
  assert.equal(w[0].segments.length, 2);
});

test("pronoun after a front piece reads as a person ending; on its own it is a word", () => {
  assert.deepEqual(unitsOf(0), ["A:ل/for", "S:3MP"]);
  assert.deepEqual(unitsOf(1), ["L:ضمير:3MP"]);
});

test("verbs need their lemma and tense key; verb forms are tools, not requirements", () => {
  assert.deepEqual(unitsOf(2), ["K:present", "L:عَلِمَ"]);
  const amana = words()[3];
  assert.deepEqual([...amana.units].sort(), ["K:past", "L:آمَنَ"]);
  assert.ok(amana.tools.has("K:form4"));
});

test("plural nouns need the plural key; doer-word is a tool", () => {
  const w = words()[4];
  assert.deepEqual([...w.units].sort(), ["A:ال/the", "K:plural", "L:مُؤْمِن"]);
  assert.ok(w.tools.has("K:doer") && w.tools.has("K:form4"));
});

test("demonstrative pieces belong to the demonstrative itself", () => {
  assert.deepEqual(unitsOf(5), ["L:ذا"]);
});

test("letterKey matches Tanzil and morphology spellings", () => {
  // Tanzil: hamza as a mark on tatweel; morphology: standalone hamza.
  assert.equal(letterKey("ٱلْـَٔاخِرَةِ"), letterKey("ٱلْءَاخِرَةِ"));
  // Tanzil: medial dagger alef on tatweel; morphology: ىٰ.
  assert.equal(letterKey("يَـٰصَـٰحِبَىِ"), letterKey("يَٰصَىٰحِبَىِ"));
  // Word-final ىٰ is a real letter and stays.
  assert.equal(letterKey("عَلَىٰ"), "على");
});

test("alignAyah strips the leading Basmala and handles words the morphology joins", () => {
  const mw = parseMorphology(["2:1:1:1\tالٓمٓ\tP\tINL|LEM:الم"].join("\n"));
  const al = alignAyah(2, 1, "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ الٓمٓ", mw);
  assert.deepEqual(al, { spans: [[4, 5]], basmala: true });
  const joined = parseMorphology(["9:9:1:1\tبَعْدَ\tN\tLEM:بَعْد", "9:9:1:2\tمَا\tP\tLEM:ما"].join("\n"));
  assert.deepEqual(alignAyah(9, 9, "بَعْدَ مَا", joined).spans, [[0, 2]]);
  assert.equal(alignAyah(9, 9, "قَبْلَ مَا", joined), null);
});

test("coverage counts a word when its last missing unit is learned", () => {
  const ws = [{ units: new Set(["a", "b"]) }, { units: new Set(["a"]) }, { units: new Set(["c"]) }, { units: new Set(["z"]) }];
  const curve = coverageCurve(ws, ["a", "b", "c"]);
  assert.deepEqual(curve.map((p) => p.covered), [1, 2, 3]);
  assert.equal(curve[2].pct, 75);
});

test("ayah readiness reports share understood and what is missing", () => {
  const ws = [{ units: new Set(["a"]) }, { units: new Set(["a", "b"]) }];
  const r = ayahReadiness(ws, new Set(["a"]));
  assert.equal(r.pct, 0.5);
  assert.deepEqual([...r.missing], ["b"]);
});

const haveData = await Promise.all([access(MORPH_PATH), access(TANZIL_PATH)]).then(() => true, () => false);

test("real data: every ayah lines up and 85% needs roughly 650-700 lemmas", { skip: !haveData && "source data not downloaded" }, async () => {
  const { words: all, byAyah, ayat } = await loadCorpus();
  assert.equal(ayat.size, 6236);
  assert.equal(all.length, 77429);
  for (const [ref, text] of ayat) {
    const [s, a] = ref.split(":").map(Number);
    assert.ok(alignAyah(s, a, text, byAyah.get(ref)), `ayah ${ref} does not align`);
  }
  const order = byFrequency(unitStats(all));
  const hit = coverageCurve(all, order).find((p) => p.pct >= 85);
  const lemmas = order.slice(0, hit.n).filter((u) => u.startsWith("L:")).length;
  assert.ok(lemmas >= 600 && lemmas <= 750, `85% needs ${lemmas} lemmas`);
});
