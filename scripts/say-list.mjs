#!/usr/bin/env node
// Print every word with its "how to say it" spelling, for the owner's read-through (docs/AUDIT_2026-11-23.md, Phase D).
// The spellings are made by rule (scripts/lib/translit.mjs); a word that reads wrong gets a `say` in authoring.
// Usage: node scripts/say-list.mjs            word cards
//        node scripts/say-list.mjs --ayat     every ayah word in the built pack as well
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./lib/corpus.mjs";

const dir = join(ROOT, "game/content");
const pack = JSON.parse(await readFile(join(dir, "pack.json"), "utf8"));
for (const [id, w] of Object.entries(pack.words)) if (w.ar) console.log(`${id}\t${w.ar}\t${w.say}`);
if (process.argv.includes("--ayat")) {
  const seen = new Set();
  for (const file of (await readdir(dir)).filter((f) => /^wing-\d+\.json$/.test(f)).sort()) {
    const wing = JSON.parse(await readFile(join(dir, file), "utf8"));
    for (const steps of Object.values(wing).filter(Array.isArray)) {
      for (const step of steps) {
        const ayat = step.type === "ayah" ? [step] : step.type === "passage" ? step.ayat : [];
        for (const a of ayat) for (const t of a.words) {
          if (seen.has(t.ar)) continue;
          seen.add(t.ar);
          console.log(`${a.ref}\t${t.ar}\t${t.say}`);
        }
      }
    }
  }
}
