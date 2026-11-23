// Boot waterfall (audit Phase F): the game has no bundler, so the browser finds each module only after it has read
// the one that imports it. This writes one <link rel="modulepreload"> per module of main.js's static import graph
// into game/index.html, between the two marker comments, so they are all fetched at once.
//   node scripts/modulepreload.mjs           rewrite the list in game/index.html
//   node scripts/modulepreload.mjs --check   exit 1 when the list is out of date (tests/boot.test.mjs checks it too)
// Run it after adding, removing or renaming a module under game/.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const GAME_DIR = fileURLToPath(new URL("../game/", import.meta.url));
export const ENTRY = "main.js";
export const START = "<!-- modulepreload:start (written by scripts/modulepreload.mjs) -->";
export const END = "<!-- modulepreload:end -->";
const IMPORT = /(?:^|[\s;])(?:import|export)\s+(?:[^"';]*?\sfrom\s*)?["'](\.{1,2}\/[^"']+)["']/g;

/** Every module main.js imports, directly or through another module, as sorted paths relative to game/ (the entry
 *  itself is left out: the page's own script tag loads it). */
export function importGraph(dir = GAME_DIR, entry = ENTRY) {
  const seen = new Set();
  const visit = (rel) => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const code = readFileSync(path.join(dir, rel), "utf8");
    for (const [, spec] of code.matchAll(IMPORT)) visit(path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec)));
  };
  visit(entry);
  seen.delete(entry);
  return [...seen].sort();
}

export const linkTags = (modules) => modules.map((m) => `    <link rel="modulepreload" href="./${m}">`);

/** The modules listed between the markers of an index.html, in order; null when the markers are missing. */
export function listedModules(html) {
  const from = html.indexOf(START);
  const to = html.indexOf(END);
  if (from < 0 || to < from) return null;
  return [...html.slice(from, to).matchAll(/rel="modulepreload" href="\.\/([^"]+)"/g)].map((m) => m[1]);
}

/** index.html with the list between the markers replaced. */
export function withModules(html, modules) {
  const from = html.indexOf(START);
  const to = html.indexOf(END);
  if (from < 0 || to < from) throw new Error("game/index.html: modulepreload markers not found");
  return `${html.slice(0, from)}${[START, ...linkTags(modules)].join("\n")}\n    ${html.slice(to)}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = path.join(GAME_DIR, "index.html");
  const html = readFileSync(file, "utf8");
  const modules = importGraph();
  if (process.argv.includes("--check")) {
    const ok = JSON.stringify(listedModules(html)) === JSON.stringify(modules);
    console.log(ok ? `modulepreload list is up to date (${modules.length} modules)` : "modulepreload list is out of date: run node scripts/modulepreload.mjs");
    process.exit(ok ? 0 : 1);
  }
  const next = withModules(html, modules);
  if (next !== html) writeFileSync(file, next);
  console.log(`game/index.html: ${modules.length} modulepreload links`);
}
