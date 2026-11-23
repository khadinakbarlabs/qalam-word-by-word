import test from "node:test";
import assert from "node:assert/strict";
import { whyNot } from "../game/core/confusable.js";
import { pickOptions } from "../game/core/options.js";
import { warmUpWords } from "../game/core/warmup.js";
import { today, sessionSize } from "../game/core/srs.js";

const words = {
  a: { ar: "كَتَبَ", g: { en: "wrote" }, pic: "x" },
  b: { ar: "كُتِبَ", g: { en: "was written" }, pic: "x" },
  c: { ar: "ماء", g: { en: "water" }, pic: "x" },
  d: { ar: "نور", g: { en: "light" }, pic: "x" },
};

test("pickOptions includes the answer and is deterministic", () => {
  const ids = Object.keys(words);
  const one = pickOptions(words, ids, "a", 4, 1);
  assert.ok(one.includes("a"));
  assert.deepEqual(one, pickOptions(words, ids, "a", 4, 1));
  assert.equal(new Set(one).size, one.length);
});

test("whyNot returns a known key", () => {
  assert.ok(["why_look", "why_root", "why_plain"].includes(whyNot(words, "a", "b")));
  assert.equal(whyNot(words, "a", "d"), "why_plain");
});

test("warmUpWords takes due words only, skips the room's own, caps at 3", () => {
  const cards = Object.fromEntries(["a", "b", "c", "d"].map((id) => [id, { id, level: 1, due: 0, seen: 1, lapses: 0, last: null, mixups: {} }]));
  const got = warmUpWords(cards, 5, words, ["a"]);
  assert.ok(!got.includes("a"));
  assert.ok(got.length <= 3 && got.length >= 1);
  assert.deepEqual(warmUpWords(cards, -1, words, []), []);
});

test("local day starts at 4am and session size grows with backlog", () => {
  const noon = Date.UTC(2026, 10, 17, 12);
  const threeAm = Date.UTC(2026, 10, 17, 3);
  assert.equal(today(noon, 0) - today(threeAm, 0), 1);
  assert.equal(sessionSize(5), 12);
  assert.equal(sessionSize(50), 16);
  assert.equal(sessionSize(80), 20);
});
