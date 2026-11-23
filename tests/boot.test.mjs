// Audit Phase F (speed and certification): the boot page and the pictures fetched ahead of time.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { importGraph, listedModules, withModules, START, END } from "../scripts/modulepreload.mjs";
import { roomPictures } from "../game/core/pictures.js";
import { withSteps } from "../game/core/content.js";

const read = (path) => readFileSync(new URL(`../game/${path}`, import.meta.url), "utf8");
const readJson = (path) => JSON.parse(read(path));
const html = read("index.html");

test("the YouTube SDK is the first script of the page, and the only one from another host", () => {
  const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(scripts[0], '<script src="https://www.youtube.com/game_api/v1">');
  assert.deepEqual(scripts.slice(1), ['<script type="module" src="./main.js">']);
  const urls = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const url of urls.slice(1)) assert.match(url, /^(\.\/|data:,$)/, url);
  assert.ok(html.indexOf(scripts[0]) < html.indexOf("<link"), "nothing is fetched before the SDK script");
});

test("index.html preloads exactly the modules main.js imports (run node scripts/modulepreload.mjs after adding one)", () => {
  const modules = importGraph();
  assert.ok(modules.length > 20);
  assert.deepEqual(listedModules(html), modules);
  for (const m of modules) assert.ok(existsSync(new URL(`../game/${m}`, import.meta.url)), m);
  assert.ok(!modules.includes("main.js"));
  // the writer is stable: writing the same list again changes nothing
  assert.equal(withModules(html, modules), html);
  assert.ok(html.indexOf(START) < html.indexOf(END) && html.indexOf(END) < html.indexOf('src="./main.js"'));
});

test("the Urdu font is only fetched once Urdu is the language; the Qur'an font is preloaded", () => {
  assert.match(html, /<link rel="preload" href="\.\/fonts\/AmiriQuran\.woff2" as="font" type="font\/woff2" crossorigin>/);
  assert.ok(!/rel="preload"[^>]*NotoNastaliqUrdu/.test(html));
  // without .urdu-font on <html>, --urdu names no packaged font, so the browser has no reason to fetch the file
  const gate = html.match(/:root:not\(\.urdu-font\)\s*\{\s*--urdu:([^;]+);/);
  assert.ok(gate, "index.html gates --urdu");
  assert.ok(!gate[1].includes("Noto Nastaliq Urdu"));
  const main = read("main.js");
  assert.match(main, /URDU_FONT_CLASS = "urdu-font"/);
  assert.match(main, /if \(code === "ur"\) document\.documentElement\.classList\.add\(URDU_FONT_CLASS\)/);
  // the only place the font file is named is its @font-face rule
  const css = read("styles.css") + read("feel.css");
  assert.equal([...css.matchAll(/NotoNastaliqUrdu\.woff2/g)].length, 1);
  // a font that arrives late fits the screen again
  assert.match(read("ui/fit.js"), /addEventListener\?\.\("loadingdone"/);
});

test("the game surface switches off text selection, the long-press menu, double-tap zoom and scroll chaining", () => {
  assert.match(html, /html\s*\{[^}]*user-select: none;[^}]*-webkit-touch-callout: none;/);
  assert.match(html, /html, body\s*\{[^}]*overscroll-behavior: none;[^}]*touch-action: manipulation;/);
  assert.match(html, /<link rel="icon" href="data:,">/);
});

test("roomPictures lists a room's paintings once each, in step order", () => {
  const words = { "w:a": { pic: "img:art/a.webp▲" }, "w:b": { pic: "🕯️" }, "w:c": { pic: "img:art/c.webp" }, "w:m": { pic: "medal:x" } };
  const room = {
    art: "w:c", teaches: ["w:a", "w:b"],
    steps: [{ type: "ayah", words: [{ w: ["w:a", "w:m"], pic: "img:art/z.webp●" }] }, { type: "match", pairs: [["w:c", "w:a"]], spot: { art: "img:art/a.webp" } }],
  };
  assert.deepEqual(roomPictures(words, room), ["art/c.webp", "art/a.webp", "art/z.webp"]);
  assert.deepEqual(roomPictures(words, room, 2), ["art/c.webp", "art/a.webp"]);
  assert.deepEqual(roomPictures(words, null), []);
  assert.deepEqual(roomPictures(undefined, { steps: [{ w: "w:a" }] }), []);
});

test("every picture roomPictures finds for the first rooms is a file in the bundle", () => {
  const pack = readJson("content/pack.json");
  const wing = readJson("content/wing-1.json");
  const rooms = pack.rooms.filter((r) => r.wing === 1).slice(0, 4);
  for (const header of rooms) {
    const files = roomPictures(pack.words, withSteps(header, wing, pack.build));
    assert.ok(files.length > 0, header.id);
    for (const f of files) assert.ok(existsSync(new URL(`../game/${f}`, import.meta.url)), `${header.id}: ${f}`);
  }
});
