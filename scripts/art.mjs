#!/usr/bin/env node
// Word-picture pipeline (authoring/art.js → data/art-raw/*.png → game/art/*.webp).
//   node scripts/art.mjs next [n]                 the next n pictures still to generate: [{ index, id, prompt }]
//   node scripts/art.mjs ingest '<json>'          [{ index, url }] from the image tool: download + process
//   node scripts/art.mjs status                   how many pictures exist, which word cards still use emoji
// Indexes are positions in the ordered list of ART entries (aliases excluded), so they stay stable between runs.

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib/corpus.mjs";
import { ART, STYLE, PEOPLE } from "../authoring/art.js";
import { WORDS } from "../authoring/words.js";

const RAW = join(ROOT, "data/art-raw");
const OUT = join(ROOT, "game/art");
const fileName = (id) => id.replace(/^w:/, "").replace(":", "-");

const queue = Object.entries(ART).filter(([, v]) => typeof v === "string");
// A scene that must stay empty gets an explicit "nobody" line instead of the people rule, which otherwise invites a figure in.
const NOBODY = "There are no people, human figures or faces anywhere in the picture (animals are fine when asked for).";
const promptOf = (subject) => `${subject}. ${STYLE} ${/no (people|figure)/.test(subject) ? NOBODY : PEOPLE}`;

const [cmd, arg] = process.argv.slice(2);
if (cmd === "next") {
  const n = Number(arg ?? 4);
  const todo = queue.map(([id, subject], index) => ({ index, id, prompt: promptOf(subject) }))
    .filter((x) => !existsSync(join(RAW, `${fileName(x.id)}.png`)));
  console.log(JSON.stringify(todo.slice(0, n)));
  console.error(`${todo.length} left`);
} else if (cmd === "ingest") {
  mkdirSync(RAW, { recursive: true });
  const names = [];
  for (const { index, url } of JSON.parse(arg)) {
    const [id] = queue[index];
    const name = fileName(id);
    // curl writes the file itself: pictures are often over 1 MiB, past execFileSync's output buffer.
    execFileSync("curl", ["-sfL", "--retry", "2", "--max-time", "60", "-o", join(RAW, `${name}.png`), url]);
    names.push(name);
  }
  console.log(execFileSync("python3", ["-I", join(ROOT, "scripts/art_process.py"), ...names], { encoding: "utf8" }).trim());
} else if (cmd === "status") {
  const have = queue.filter(([id]) => existsSync(join(OUT, `${fileName(id)}.webp`))).length;
  const emojiOnly = Object.entries(WORDS).filter(([id, w]) => w.pic && !ART[id]).map(([id]) => id);
  console.log(`${have}/${queue.length} pictures made; word cards with no prompt yet: ${emojiOnly.join(" ") || "none"}`);
} else {
  console.log("usage: node scripts/art.mjs next [n] | ingest '<json>' | status");
}
