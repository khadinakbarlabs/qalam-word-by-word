import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newCard, grade, isDue, dueCards, requeue, lamp, recordMixup, drillPairs, nextEngine, LEVEL_DAYS, HINTED_DAYS, MAX_LEVEL,
} from "../game/core/srs.js";

const DAY = 100;

test("a new card is not due until a room introduces it", () => {
  const c = newCard("w:rabb", DAY);
  assert.equal(c.level, 0);
  assert.equal(isDue(c, DAY), false);
});

test("easy recalls climb one flame at a time with growing gaps", () => {
  let c = newCard("w:rabb", DAY);
  const gaps = [];
  for (let i = 0; i < 7; i++) {
    c = grade(c, "easy", DAY);
    gaps.push(c.due - DAY);
  }
  assert.equal(c.level, MAX_LEVEL);
  assert.deepEqual(gaps, [0, 1, 3, 7, 16, 35, 35]);
});

test("grading never mutates the card", () => {
  const c = newCard("w:rabb", DAY);
  const frozen = JSON.stringify(c);
  grade(c, "easy", DAY);
  grade(recordMixup(c, "w:x"), "wrong", DAY);
  assert.equal(JSON.stringify(c), frozen);
});

test("a hint keeps the level but brings the word back much sooner", () => {
  const c = { ...newCard("w:ilm", DAY), level: 4, due: DAY };
  const g = grade(c, "hinted", DAY);
  assert.equal(g.level, 4);
  assert.equal(g.due - DAY, HINTED_DAYS[4]);
  for (let level = 3; level <= 6; level++) {
    assert.ok(HINTED_DAYS[level] * 2 <= LEVEL_DAYS[level], `level ${level}: a helped answer earns less than half the gap`);
    assert.ok(HINTED_DAYS[level] <= LEVEL_DAYS[level - 1], `level ${level}: and never more than the level below`);
  }
});

test("a wrong answer drops one flame (never below 1), counts a lapse, and is due again today", () => {
  const c = { ...newCard("w:ilm", DAY), level: 3, due: DAY };
  const g = grade(c, "wrong", DAY);
  assert.deepEqual([g.level, g.lapses, g.due], [2, 1, DAY]);
  assert.equal(grade({ ...c, level: 1 }, "wrong", DAY).level, 1);
});

test("due list: most overdue first, then weakest, limited", () => {
  const cards = [
    { ...newCard("a", 0), level: 3, due: DAY - 1 },
    { ...newCard("b", 0), level: 2, due: DAY - 5 },
    { ...newCard("c", 0), level: 1, due: DAY - 1 },
    { ...newCard("d", 0), level: 4, due: DAY + 2 },
  ];
  assert.deepEqual(dueCards(cards, DAY).map((c) => c.id), ["b", "c", "a"]);
  assert.deepEqual(dueCards(cards, DAY, 2).map((c) => c.id), ["b", "c"]);
});

test("a missed card returns three cards later in the session", () => {
  assert.deepEqual(requeue(["x", "a", "b", "c", "d"], "x"), ["a", "b", "c", "x", "d"]);
  assert.deepEqual(requeue(["x", "a"], "x"), ["a", "x"]);
});

test("lamp shows flames, gold, dimness when due, and days to next review", () => {
  const c = { ...newCard("w", 0), level: 6, due: DAY + 35 };
  assert.deepEqual(lamp(c, DAY), { flames: 6, gold: true, dim: false, inDays: 35 });
  assert.equal(lamp({ ...c, due: DAY - 1 }, DAY).dim, true);
});

test("repeated mix-ups produce one tell-apart drill pair", () => {
  let man = newCard("w:man", DAY);
  man = recordMixup(recordMixup(man, "w:min"), "w:min");
  const min = recordMixup(newCard("w:min", DAY), "w:man");
  assert.deepEqual(drillPairs([man, min]), [["w:man", "w:min"]]);
});

test("next repetition avoids the engine used last time", () => {
  const engines = ["match", "snap", "ayah"];
  for (let seen = 0; seen < 6; seen++) {
    const c = { ...newCard("w:ilm", DAY), last: "match", seen };
    assert.notEqual(nextEngine(c, engines), "match");
  }
});
