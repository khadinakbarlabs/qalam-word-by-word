#!/usr/bin/env node
// Build game/content/pack.json (+ one wing-N.json of room steps per wing and why.json, the picture lines:
// game/core/content.js) from authoring/ + the corpus. Refuses to write if anything fails validation: the pack's own
// rules (scripts/lib/pack.mjs) and the content-accuracy checks (scripts/lib/checks.mjs: each ayah word against the
// card it takes its picture from, Names of Allah, words with one right card, look-alike cards, missing ids).
// Usage: node scripts/build-pack.mjs

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus } from "./lib/corpus.mjs";
import { buildPack } from "./lib/pack.mjs";
import { splitPack } from "../game/core/content.js";

const { pack, errors } = buildPack(await loadCorpus());
if (errors.length) {
  process.stderr.write(`Pack NOT written:\n${errors.map((e) => `  ${e}`).join("\n")}\n`);
  process.exit(1);
}
const dir = join(ROOT, "game/content");
await mkdir(dir, { recursive: true });
const { base, wings, why } = splitPack(pack);
// drop wing files from an older build (a wing that no longer exists must not ship)
for (const f of await readdir(dir)) if (/^wing-\d+\.json$/.test(f)) await rm(join(dir, f));
const files = [["pack.json", base], ...Object.entries(wings).map(([w, steps]) => [`wing-${w}.json`, steps]), ["why.json", why]];
for (const [name, data] of files) {
  const json = JSON.stringify(data);
  await writeFile(join(dir, name), `${json}\n`);
  console.log(`wrote game/content/${name} (${(json.length / 1024).toFixed(1)} KB)`);
}
for (const r of pack.rooms) console.log(`${r.id.padEnd(10)} teaches ${String(r.teaches.length).padStart(2)} words, reviews ${String(r.reviews.length).padStart(2)} → meter ${r.coverageAfter}%`);
