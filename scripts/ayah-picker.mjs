#!/usr/bin/env node
// M0 prototype: are there enough real ayat to practise each step of the curriculum?
// The 85% goal set (see coverage.mjs) is taught in rooms of ROOM_SIZE units under two curriculum shapes:
//   word-type acts   the reference booklet's shape: little words → nouns → sound verbs → weak verbs → grown forms
//   frequency bands  most-needed first; acts end at 40/55/70/80/85% coverage; grammar keys arrive when first needed
// An ayah is a candidate for a room when, right after that room, it uses a unit from the room and enough of its
// words are understood: MIN_READY (80%), or MIN_READY_EARLY (50%) in the first act, where untaught words are given
// pre-glossed ("Qalam's help") so the player decodes only what has been taught.
// Also reports Reading Room passages: readiness after each act and how many extra "passage words" they need.
// Usage: node scripts/ayah-picker.mjs   → prints summary, writes data/build/ayah-picker.json

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, unitStats, byFrequency, actOrder, coverageCurve, ayahReadiness, alignAyah, tanzilWords } from "./lib/corpus.mjs";

const GOAL = 85;
const ROOM_SIZE = 20;
const MIN_READY = 0.8;
const MIN_READY_EARLY = 0.5;
const READING_ROOM_READY = 0.9;
const BAND_ENDS = [40, 55, 70, 80, 85];

// Candidate Reading Room passages from docs/CURRICULUM.md §4: [label, surah, firstAyah, lastAyah].
const PASSAGES = [
  ["Al-Fatiha", 1, 1, 7], ["Al-Ikhlas", 112, 1, 4], ["Al-Asr", 103, 1, 3], ["An-Nas", 114, 1, 6],
  ["Al-Falaq", 113, 1, 5], ["Al-Kawthar", 108, 1, 3], ["Al-Ma'un", 107, 1, 7], ["Al-Kafirun", 109, 1, 6],
  ["Al-Qadr", 97, 1, 5], ["Ayat al-Kursi", 2, 255, 255], ["Al-Mulk 1-5", 67, 1, 5], ["Al-Baqarah 1-5", 2, 1, 5],
  ["Al-Hashr 22-24", 59, 22, 24],
];

const { words, byAyah, ayat } = await loadCorpus();
const stats = unitStats(words);
const order = byFrequency(stats);
const curve = coverageCurve(words, order);
const goalSet = order.slice(0, curve.find((p) => p.pct >= GOAL).n);

/** Tanzil words for an ayah without the leading Basmala (shown as a header, not as part of ayah 1). */
const displayText = (ref) => {
  const [s, a] = ref.split(":").map(Number);
  const al = alignAyah(s, a, ayat.get(ref), byAyah.get(ref));
  const tw = tanzilWords(ayat.get(ref));
  return (al?.basmala ? tw.slice(4) : tw).join(" ");
};

function candidates(known, roomUnits, minReady) {
  const out = [];
  for (const [ref, aw] of byAyah) {
    if (!aw.some((w) => [...w.units].some((u) => roomUnits.has(u)))) continue;
    const r = ayahReadiness(aw, known);
    if (r.pct >= minReady) out.push({ ref, words: aw.length, ready: +r.pct.toFixed(2), missing: [...r.missing] });
  }
  return out.sort((x, y) => x.words - y.words || y.ready - x.ready);
}

/** Walk a curriculum (list of acts, each a unit list) room by room. */
function walk(acts) {
  const known = new Set();
  const report = [];
  const knownAfterAct = [];
  acts.forEach((units, i) => {
    const rooms = [];
    for (let r = 0; r < units.length; r += ROOM_SIZE) {
      const room = units.slice(r, r + ROOM_SIZE);
      room.forEach((u) => known.add(u));
      const c = candidates(known, new Set(room), i === 0 ? MIN_READY_EARLY : MIN_READY);
      rooms.push({ units: room.length, candidates: c.length, short: c.filter((x) => x.words <= 8).length, example: c[0] && { ...c[0], text: displayText(c[0].ref) } });
    }
    knownAfterAct.push(new Set(known));
    const counts = rooms.map((r) => r.candidates);
    report.push({
      act: i + 1, units: units.length, lemmas: units.filter((u) => u.startsWith("L:")).length,
      keys: units.filter((u) => u.startsWith("K:")),
      rooms: rooms.length, emptyRooms: counts.filter((n) => n === 0).length, minCandidates: Math.min(...counts),
      roomsUnder10: counts.filter((n) => n < 10).length, firstRoomExample: rooms[0].example ?? null,
    });
  });
  return { report, knownAfterAct };
}

// Shape A: the booklet's word-type acts.
const typeSeq = actOrder(goalSet, stats);
const typeActs = [1, 2, 3, 4, 5].map((a) => typeSeq.filter((u) => stats.act.get(u) === a));
// Shape B: frequency bands cut where coverage passes each band end.
const freqActs = [];
let from = 0;
for (const end of BAND_ENDS) {
  const to = curve.find((p) => p.pct >= end).n;
  freqActs.push(order.slice(from, to));
  from = to;
}

const shapes = { "word-type acts": walk(typeActs), "frequency bands": walk(freqActs) };

const passageWords = (s, a1, a2) => {
  const aw = [];
  for (let a = a1; a <= a2; a++) aw.push(...byAyah.get(`${s}:${a}`));
  return aw;
};
const passages = PASSAGES.map(([label, s, a1, a2]) => {
  const aw = passageWords(s, a1, a2);
  const out = { label, words: aw.length };
  for (const [name, { knownAfterAct }] of Object.entries(shapes)) {
    const byAct = knownAfterAct.map((k) => +ayahReadiness(aw, k).pct.toFixed(2));
    out[name] = { readyAfterAct: byAct, firstActAt90: byAct.findIndex((p) => p >= READING_ROOM_READY) + 1 || null };
  }
  const extra = [...ayahReadiness(aw, shapes["frequency bands"].knownAfterAct[4]).missing];
  out.extraPassageUnits = extra.length;
  out.extra = extra;
  return out;
});

const result = { roomSize: ROOM_SIZE, minReady: MIN_READY, minReadyEarly: MIN_READY_EARLY, shapes: Object.fromEntries(Object.entries(shapes).map(([k, v]) => [k, v.report])), passages };
await mkdir(join(ROOT, "data/build"), { recursive: true });
await writeFile(join(ROOT, "data/build/ayah-picker.json"), `${JSON.stringify(result, null, 1)}\n`);

for (const [name, { report }] of Object.entries(shapes)) {
  console.log(`\n${name}:`);
  for (const a of report) {
    console.log(`  Act ${a.act}: ${a.lemmas} lemmas + ${a.units - a.lemmas} pieces/keys, ${a.rooms} rooms, empty rooms ${a.emptyRooms}, rooms <10 ayat ${a.roomsUnder10}, min ${a.minCandidates}${a.keys.length ? `  keys: ${a.keys.join(",")}` : ""}`);
    if (a.firstRoomExample) console.log(`     first room e.g. ${a.firstRoomExample.ref} (ready ${a.firstRoomExample.ready}) ${a.firstRoomExample.text}`);
  }
}
console.log("\nReading Rooms (readiness after acts 1..5, frequency bands) + extra passage words needed after 85%:");
for (const p of passages) console.log(`  ${p.label.padEnd(16)} ${String(p.words).padStart(3)}w  ${p["frequency bands"].readyAfterAct.join(" ")}  extra ${p.extraPassageUnits}: ${p.extra.map((u) => u.slice(2)).join(" ")}`);
