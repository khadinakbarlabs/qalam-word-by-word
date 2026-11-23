// Phase B of docs/AUDIT_2026-11-23.md: fair grading and honest review. Every rule here is checked on the pure core,
// and the option rules are replayed over every room of the shipped pack (game/content).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { pickOptions, pickItems, looksSame, captionKey, shuffled, withFace } from "../game/core/options.js";
import { ayahChips, AYAH_CHIPS } from "../game/core/chips.js";
import { mainId, confusablesFor } from "../game/core/confusable.js";
import { startItem, NO_ITEM, withMiss, withHint, withHand, flagsOf, outcomeOf, gotHelp, hintStep, nudgeAway } from "../game/core/recall.js";
import { newCard, grade, dueCards, clampDue, isLeech, sessionSize, LEVEL_DAYS, HINTED_DAYS, LEECH_AT, LEECH_MAX_DAYS, RELIGHT_CAP } from "../game/core/srs.js";
import { startRelight, relightMode, relightMiss, relightRight, relightSkip, moreWaiting, lampsLeft, AFTER_MISS } from "../game/core/relight.js";
import { startSession, record, finishRoom } from "../game/core/room.js";
import { masteryWords } from "../game/core/taps.js";
import { startMastery, answer } from "../game/core/mastery.js";
import { defaultSave, parseSave, serializeSave, markHand, SAVE_VERSION } from "../game/core/save.js";

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../game/content/${name}`, import.meta.url), "utf8"));
const pack = read("pack.json");
const wings = Object.fromEntries([...new Set(pack.rooms.map((r) => r.wing))].map((n) => [n, read(`wing-${n}.json`)]));
const rooms = pack.rooms.map((r) => ({ ...r, steps: wings[r.wing][r.id] }));
const W = pack.words;
const everyWord = withFace(W, Object.keys(W));
const DAY = 500;

/** Every question of every room, with the options the game would show (the same calls as ui/steps/*.js). */
function* questions() {
  const met = new Set();
  for (const room of rooms) {
    const known = () => [...met, ...room.teaches];
    for (const step of room.steps) {
      if (step.type === "match") {
        const pool = withFace(W, [...step.words, ...known()]);
        for (const [i, id] of step.words.entries()) yield { game: "match", room: room.id, id, options: pickOptions(W, pool, id, 4, `match|${i}`, { extra: everyWord }) };
      }
      if (step.type === "grow") {
        const painted = (ids) => withFace(W, ids).filter((id) => W[id].pic && !W[id].medal);
        const pool = painted([...step.items.map((it) => it.w), ...known()]);
        for (const [i, it] of step.items.entries()) yield { game: "grow", room: room.id, id: it.w, options: pickOptions(W, pool, it.w, 4, `grow|${i}`, { extra: painted(Object.keys(W)) }) };
      }
    }
    const check = masteryWords(room, W);
    if (check.length >= 3) {
      const pool = withFace(W, [...check, ...room.reviews]);
      for (const id of check) for (let tries = 0; tries < 4; tries++) yield { game: "mastery", room: room.id, id, options: pickOptions(W, pool, id, 4, `check|${tries}`, { extra: withFace(W, known()) }) };
    }
    room.teaches.forEach((id) => met.add(id));
    // warm-up and Relight ask about any learnt word, with the learnt words as the pool
    const learnt = withFace(W, [...met]);
    for (const id of withFace(W, room.teaches)) {
      for (let seen = 0; seen < 3; seen++) yield { game: "relight", room: room.id, id, options: pickOptions(W, learnt, id, 4, `relight|${seen}`, { extra: everyWord }) };
      yield { game: "warmup", room: room.id, id, options: pickOptions(W, learnt, id, 4, "warm|0", { extra: everyWord }) };
    }
  }
}
const ALL = [...questions()];

/** Every graded ayah tile of every room with its chips, the tiles before it already lit (read right to left). */
function* ayahQuestions() {
  const met = new Set();
  for (const room of rooms) {
    for (const step of room.steps.filter((s) => s.type === "ayah")) {
      const lit = step.words.map((w) => Boolean(w.given));
      for (const [k, tile] of step.words.entries()) {
        if (tile.given) continue;
        const known = new Set([...met, ...room.teaches]);
        yield { room: room.id, ref: step.ref, k, tile, tiles: step.words, lit: [...lit], chips: ayahChips({ words: W, tiles: step.words, k, met: known, lit, seed: step.ref }) };
        lit[k] = true;
      }
    }
    room.teaches.forEach((id) => met.add(id));
  }
}
const AYAH = [...ayahQuestions()];

const alikePairs = (faces) => faces.flatMap((a, i) => faces.slice(i + 1).filter((b) => looksSame(a, b)).map((b) => [a, b]));

// ---- options -------------------------------------------------------------------------------------------------------

test("options: the shipped pack is replayed (a real check, not an empty loop)", () => {
  for (const game of ["match", "grow", "mastery", "relight", "warmup"]) assert.ok(ALL.some((q) => q.game === game), game);
  assert.ok(ALL.length > 3000 && AYAH.length > 1000, `${ALL.length} option sets, ${AYAH.length} ayah tiles`);
});

test("options: no question in any room shows two options that look the same (Arabic, picture, English or Urdu caption)", () => {
  for (const q of ALL) {
    assert.equal(new Set(q.options).size, q.options.length, `${q.game} ${q.room} ${q.id}: an id twice`);
    const pairs = alikePairs(q.options.map((id) => ({ id, ...W[id] })));
    assert.deepEqual(pairs.map(([a, b]) => `${a.id}~${b.id}`), [], `${q.game} ${q.room} ${q.id}`);
  }
});

test("options: always the answer and always four choices", () => {
  for (const q of ALL) {
    assert.ok(q.options.includes(q.id), `${q.game} ${q.room} ${q.id}: no answer`);
    assert.equal(q.options.length, 4, `${q.game} ${q.room} ${q.id}: ${q.options.length} options`);
  }
});

test("options: words with the same spelling or the same painting are never offered against each other", () => {
  const twins = (id, other) => ALL.filter((q) => q.id === id && q.options.includes(other));
  for (const [a, b] of [["w:wa_oath", "w:wa"], ["w:salih_prophet", "w:salih"], ["w:ha", "w:hiya"], ["w:antum", "w:kum"], ["w:huma", "w:huma_end"]]) {
    assert.ok(W[a] && W[b], `${a} / ${b} are in the pack`);
    assert.equal(twins(a, b).length + twins(b, a).length, 0, `${a} vs ${b}`);
  }
});

test("options: the same question always gets the same options (no Math.random)", () => {
  const ids = everyWord.slice(0, 40);
  for (const id of ids.slice(0, 10)) {
    assert.deepEqual(pickOptions(W, ids, id, 4, "match|2"), pickOptions(W, ids, id, 4, "match|2"));
    assert.deepEqual(pickOptions(W, [...ids], id, 4, 7, { extra: everyWord }), pickOptions(W, [...ids], id, 4, 7, { extra: everyWord }));
  }
  assert.deepEqual(shuffled([1, 2, 3, 4, 5, 6], "k"), shuffled([1, 2, 3, 4, 5, 6], "k"));
  assert.deepEqual([...shuffled([1, 2, 3, 4, 5, 6], "k")].sort(), [1, 2, 3, 4, 5, 6], "a shuffle keeps every item");
});

test("options: the answer's place is well spread, in every game and on the first question of a round", () => {
  for (const game of ["match", "mastery", "relight", "warmup"]) {
    const qs = ALL.filter((q) => q.game === game);
    const slots = [0, 0, 0, 0];
    for (const q of qs) slots[q.options.indexOf(q.id)] += 1;
    for (const [slot, n] of slots.entries()) {
      const share = n / qs.length;
      assert.ok(share > 0.18 && share < 0.32, `${game}: slot ${slot + 1} holds the answer in ${(share * 100).toFixed(1)}% of ${qs.length}`);
    }
  }
  // the audit's finding: the first question of all 113 match steps had the answer first
  const firsts = rooms.flatMap((r) => r.steps.filter((s) => s.type === "match").map((s) => {
    const pool = withFace(W, [...s.words, ...r.teaches]);
    return pickOptions(W, pool, s.words[0], 4, "match|0", { extra: everyWord }).indexOf(s.words[0]);
  }));
  for (let slot = 0; slot < 4; slot++) {
    const share = firsts.filter((x) => x === slot).length / firsts.length;
    assert.ok(share > 0.1 && share < 0.45, `first match question: slot ${slot + 1} in ${(share * 100).toFixed(0)}% of ${firsts.length} steps`);
  }
});

test("options: the set of choices changes from question to question, and from one asking to the next", () => {
  const byRoom = new Map();
  for (const q of ALL.filter((x) => x.game === "match")) byRoom.set(q.room, [...(byRoom.get(q.room) ?? []), [...q.options].sort().join(",")]);
  const stuck = [...byRoom.values()].filter((sets) => sets.length > 1 && new Set(sets).size === 1);
  assert.equal(stuck.length, 0, "no room's match questions all show one fixed set of four");
  // the same word asked again in the Last Check or in Relight gets other wrong answers at least sometimes
  for (const game of ["mastery", "relight"]) {
    const sets = new Map();
    for (const q of ALL.filter((x) => x.game === game)) sets.set(`${q.room}|${q.id}`, new Set([...(sets.get(`${q.room}|${q.id}`) ?? []), [...q.options].sort().join(",")]));
    const varied = [...sets.values()].filter((s) => s.size > 1).length;
    assert.ok(varied / sets.size > 0.6, `${game}: ${varied} of ${sets.size} words get different sets on different askings`);
  }
});

test("options: look-alikes come first, and the warm-up and Relight no longer lean on the game's first words", () => {
  const cousins = confusablesFor(W, "w:rahman", everyWord);
  assert.ok(cousins.includes("w:rahim"), "رحمن and رحيم are cousins");
  assert.ok(pickOptions(W, everyWord, "w:rahman", 4, 0).includes(cousins[0]), "the closest look-alike is offered");
  const starters = everyWord.slice(0, 3);
  const late = ALL.filter((q) => (q.game === "warmup" || q.game === "relight") && rooms.findIndex((r) => r.id === q.room) > 20);
  const leaning = late.filter((q) => q.options.some((id) => id !== q.id && starters.includes(id))).length;
  assert.ok(leaning / late.length < 0.1, `${leaning} of ${late.length} late review questions use one of the first three words`);
});

test("options: a short pool is topped up from the wider pool; a tiny pool gives what it fairly can", () => {
  const two = everyWord.slice(0, 2);
  assert.equal(pickOptions(W, two, two[0], 4, 1, { extra: everyWord }).length, 4);
  assert.deepEqual([...pickOptions(W, two, two[0], 4, 1)].sort(), [...two].sort());
  const words = { a: { ar: "وَ", g: { en: "and", ur: "اور" }, pic: "p1" }, b: { ar: "وَ", g: { en: "by", ur: "قسم" }, pic: "p2" }, c: { ar: "فِي", g: { en: "in", ur: "میں" }, pic: "p3" } };
  assert.deepEqual([...pickOptions(words, ["a", "b", "c"], "a", 4, 0)].sort(), ["a", "c"], "the twin spelling is left out, not shown as a wrong answer");
  for (let size = 3; size <= 8; size++) {
    const pool = everyWord.slice(40, 40 + size);
    for (let seed = 0; seed < 8; seed++) assert.equal(new Set(pickOptions(W, pool, pool[0], 4, seed, { extra: everyWord })).size, 4, `pool of ${size}, seed ${seed}`);
  }
});

test("options: captions are compared the way a player reads them", () => {
  assert.equal(captionKey("and You alone"), captionKey("You alone"));
  assert.equal(captionKey("This (is)"), captionKey("this"));
  assert.notEqual(captionKey("he"), captionKey("they"));
  assert.equal(looksSame({ ar: "هُمْ", pic: "a", g: { en: "they", ur: "وہ" } }, { ar: "هُوَ", pic: "b", g: { en: "he", ur: "وہ" } }), true, "the same Urdu caption");
  assert.equal(looksSame({ ar: "x", pic: "a", g: { en: "one", ur: "ایک" } }, { ar: "y", pic: "a", g: { en: "two", ur: "دو" } }), true, "the same picture");
  assert.equal(looksSame({ ar: "x", pic: "a", g: { en: "one", ur: "ایک" } }, { ar: "y", pic: "b", g: { en: "two", ur: "دو" } }), false);
  assert.equal(looksSame({ ar: "", pic: "", g: { en: "" } }, { ar: "", pic: "", g: { en: "" } }), false, "empty sides never match");
});

test("options: meaning cards that are not words (Same Verb, New Path) follow the same rules", () => {
  const items = ["walk", "travel", "strike", "give", "take", "travel"].map((en, i) => ({ g: { en, ur: `م${i}` }, pic: `p${i}` }));
  for (let i = 0; i < 5; i++) {
    const got = pickItems(items, i, 4, `path|${i}`);
    assert.ok(got.includes(items[i]));
    assert.equal(got.length, 4);
    assert.equal(alikePairs(got).length, 0, "the two 'travel' cards never meet");
    assert.deepEqual(got, pickItems(items, i, 4, `path|${i}`));
  }
});

// ---- ayah chips ----------------------------------------------------------------------------------------------------

test("ayah chips: four chips, the answer among them, no two alike, in every ayah of the pack", () => {
  for (const q of AYAH) {
    const at = `${q.room} ${q.ref} tile ${q.k}`;
    assert.equal(q.chips.length, AYAH_CHIPS, at);
    assert.equal(q.chips.filter((c) => c === q.tile).length, 1, at);
    assert.deepEqual(alikePairs(q.chips).map(([a, b]) => `${a.g.en}~${b.g.en}`), [], at);
  }
});

test("ayah chips: no chip is the same word again, one of its parts, or a meaning already printed on a lit tile", () => {
  for (const q of AYAH) {
    const at = `${q.room} ${q.ref} tile ${q.k}`;
    const main = mainId(W, q.tile.w);
    const onScreen = q.tiles.filter((_, j) => j !== q.k && q.lit[j]);
    for (const chip of q.chips.filter((c) => c !== q.tile)) {
      assert.notEqual(chip.ar, q.tile.ar, `${at}: the same Arabic word as a wrong chip`);
      assert.ok(!chip.id || !q.tile.w.includes(chip.id), `${at}: ${chip.id} is part of the word`);
      assert.ok(!main || !(chip.w ?? []).includes(main), `${at}: another tile of the same word`);
      assert.ok(!onScreen.some((o) => looksSame(o, chip)), `${at}: "${chip.g.en}" is already on a lit tile`);
    }
  }
});

test("ayah chips: the answer's place is well spread and does not follow the tile's place", () => {
  const slots = [0, 0, 0, 0];
  for (const q of AYAH) slots[q.chips.indexOf(q.tile)] += 1;
  for (const [slot, n] of slots.entries()) assert.ok(n / AYAH.length > 0.18 && n / AYAH.length < 0.32, `slot ${slot + 1}: ${n} of ${AYAH.length}`);
  const firstTiles = AYAH.filter((q) => q.k === 0);
  const firstSlot = firstTiles.filter((q) => q.chips[0] === q.tile).length / firstTiles.length;
  assert.ok(firstSlot < 0.4, `the first tile's answer is first in ${(firstSlot * 100).toFixed(0)}% of ayat`);
  const q = AYAH[10];
  assert.deepEqual(ayahChips({ words: W, tiles: q.tiles, k: q.k, met: new Set(everyWord), lit: q.lit, seed: q.ref }),
    ayahChips({ words: W, tiles: q.tiles, k: q.k, met: new Set(everyWord), lit: q.lit, seed: q.ref }), "deterministic");
});

test("ayah chips: a compound word's look-alikes are worked out for the real word, not its prefix", () => {
  assert.equal(mainId(W, ["w:al", "w:rahman"]), "w:rahman");
  assert.equal(mainId(W, ["w:bi", "w:ism"]), "w:ism");
  assert.equal(mainId(W, ["w:allah"]), "w:allah");
  assert.equal(mainId(W, []), null);
  const tiles = [{ ar: "ٱلرَّحْمَـٰنِ", g: { en: "the Most Gracious", ur: "جو نہایت مہربان" }, w: ["w:al", "w:rahman"], given: false, medal: "رَحْمٰن" }];
  const chips = ayahChips({ words: W, tiles, k: 0, met: new Set(everyWord.slice(0, 60)), lit: [false], seed: "1:1" });
  assert.ok(chips.some((c) => c.id === "w:rahim"), "رحيم is offered beside ٱلرحمن");
  assert.ok(!chips.some((c) => c.id === "w:al"), "the prefix is not a wrong answer to its own word");
});

// ---- one question: help and grading ---------------------------------------------------------------------------------

test("grading: first try with no help is easy; a hint or the tutorial hand is hinted; a miss or a shown answer is wrong", () => {
  const q = startItem(["w:a"]);
  assert.equal(outcomeOf(q), "easy");
  assert.equal(outcomeOf(withHand(q)), "hinted", "an answer given while the hand points at it is never easy");
  assert.equal(outcomeOf(withHint(q, 1)), "hinted");
  assert.equal(outcomeOf(withHint(withHint(q, 1), 2)), "wrong", "the second Show me shows the answer");
  assert.equal(outcomeOf(withMiss(q)), "wrong");
  assert.equal(outcomeOf(withHand(withMiss(q))), "wrong", "the worst thing that happened wins");
  assert.equal(gotHelp(q), false);
  assert.equal(gotHelp(withHand(q)), true);
  assert.deepEqual(q, { ids: ["w:a"], missed: false, hinted: false, revealed: false }, "never mutated");
  assert.equal(NO_ITEM.ids.length, 0);
});

test("grading: a question put down and picked up again keeps its miss and its hint (ayah tile tapped again)", () => {
  const missed = flagsOf(withMiss(startItem(["w:a", "w:b"])));
  assert.equal(outcomeOf(startItem(["w:a", "w:b"], missed)), "wrong", "tapping the tile again does not wipe the miss");
  const hinted = flagsOf(withHint(startItem(["w:a"]), 1));
  assert.equal(outcomeOf(startItem(["w:a"], hinted)), "hinted", "nor the hint");
  assert.equal(outcomeOf(startItem(["w:a"], flagsOf(withHint(startItem(["w:a"]), 2)))), "wrong");
  // through the room session: the word ends the room as wrong, not easy
  const s = record(startSession(), ["w:a"], outcomeOf(startItem(["w:a"], missed)));
  assert.equal(s.results["w:a"], "wrong");
});

test("hint ladder: the first Show me is a nudge, the full answer comes only on the second request", () => {
  assert.equal(hintStep(1, true), "nudge");
  assert.equal(hintStep(2, true), "answer");
  assert.equal(hintStep(3, true), "answer");
  assert.equal(hintStep(1, false), "answer", "nothing is graded on a ▶ or a card to turn: the hand comes at once");
});

test("hinted answers shorten the gap in a way that matters; a hint never raises the level", () => {
  for (let level = 1; level <= 6; level++) {
    const c = { ...newCard("w:a", DAY), level, due: DAY };
    const helped = grade(c, "hinted", DAY);
    const alone = grade(c, "easy", DAY);
    assert.equal(helped.level, level);
    assert.ok(helped.due <= alone.due, `level ${level}`);
    if (level >= 3) assert.ok((helped.due - DAY) * 2 <= LEVEL_DAYS[level], `level ${level}: at most half the gap of the level it keeps`);
  }
  assert.equal(grade({ ...newCard("w:a", DAY), level: 5, due: DAY }, "hinted", DAY).due - DAY, HINTED_DAYS[5]);
});

test("Last Check: an answer after Show me does not count towards two in a row (and does not reset it)", () => {
  let st = startMastery(["a", "b", "c"]);
  st = answer(st, "hinted");
  assert.equal(st.streak.a, 0, "helped: not counted");
  assert.ok(st.queue.includes("a"), "the word comes back");
  st = { ...st, queue: ["a", ...st.queue.filter((x) => x !== "a")] };
  st = answer(st, "right");
  assert.equal(st.streak.a, 1);
});

// ---- leeches and lapses ---------------------------------------------------------------------------------------------

test("lapse counts are used: a word missed often comes back within a few days until it is recalled alone", () => {
  const leech = { ...newCard("w:a", DAY), level: 4, due: DAY, lapses: LEECH_AT };
  assert.equal(isLeech(leech), true);
  const once = grade(leech, "easy", DAY);
  assert.equal(once.level, 5);
  assert.ok(once.due - DAY <= LEECH_MAX_DAYS, "capped gap, not 16 days");
  assert.equal(once.lapses, LEECH_AT - 1, "each unaided recall takes one lapse off");
  assert.equal(isLeech(once), false);
  assert.equal(grade(once, "easy", DAY).due - DAY, LEVEL_DAYS[6], "healed: the full gap again");
  const helped = grade({ ...leech, level: 6 }, "hinted", DAY);
  assert.ok(helped.due - DAY <= LEECH_MAX_DAYS);
  assert.equal(helped.lapses, LEECH_AT, "help does not heal a leech");
  const fresh = { ...newCard("w:b", DAY), level: 4, due: DAY, lapses: LEECH_AT - 1 };
  assert.equal(grade(fresh, "easy", DAY).due - DAY, LEVEL_DAYS[5], "below the limit nothing changes");
});

test("due list: among equally overdue, equally weak words the most often missed comes first", () => {
  const cards = [
    { ...newCard("a", 0), level: 2, due: DAY, lapses: 0 },
    { ...newCard("b", 0), level: 2, due: DAY, lapses: 4 },
    { ...newCard("c", 0), level: 2, due: DAY, lapses: 1 },
  ];
  assert.deepEqual(dueCards(cards, DAY).map((c) => c.id), ["b", "c", "a"]);
});

// ---- Relight --------------------------------------------------------------------------------------------------------

const card = (id, level, extra = {}) => ({ ...newCard(id, 0), level, due: DAY, seen: 2, last: "room", ...extra });
const CLEAN = { missed: false, hinted: false, revealed: false };

test("Relight: a clean answer raises the lamp and it leaves the session", () => {
  const cards = [card("w:a", 3), card("w:b", 2)];
  const s0 = startRelight(cards, DAY);
  assert.deepEqual(s0.queue, ["w:b", "w:a"], "weakest first");
  const out = relightRight(s0, cards[1], CLEAN, DAY, "toPic");
  assert.equal(out.result, "lit");
  assert.deepEqual([out.card.level, out.card.due - DAY], [3, LEVEL_DAYS[3]]);
  assert.deepEqual(out.session.queue, ["w:a"]);
  assert.deepEqual(out.session.settled, ["w:b"]);
  assert.deepEqual(s0.queue, ["w:b", "w:a"], "the session is not mutated");
});

test("Relight: a miss is a real lapse: the level drops, it is asked again until right, and it is due tomorrow", () => {
  for (const level of [1, 2, 4, 5, 6]) {
    const start = card("w:a", level);
    const others = ["w:b", "w:c", "w:d", "w:e"].map((id) => card(id, 3));
    let session = startRelight([start, ...others], DAY);
    session = { ...session, queue: ["w:a", ...session.queue.filter((id) => id !== "w:a")] };
    const mode = relightMode(start);
    let out = relightMiss(session, start, "w:b", DAY, mode);
    assert.equal(out.card.level, Math.max(1, level - 1), `level ${level} drops`);
    assert.equal(out.card.lapses, 1);
    assert.equal(out.card.mixups["w:b"], 1);
    assert.equal(out.session.owed["w:a"], AFTER_MISS);
    assert.equal(out.session.queue.indexOf("w:a"), 3, "it comes back three lamps later");
    // the right tap that ends this asking changes nothing more
    const same = relightRight(out.session, out.card, { ...CLEAN, missed: true }, DAY, mode);
    assert.equal(same.result, "missed");
    assert.equal(same.card, out.card);
    // first make-up answer: asked from the other side, still owed one
    const second = relightMode(out.card);
    assert.notEqual(second, mode, "after a miss the second ask uses the other direction");
    out = relightRight(same.session, same.card, CLEAN, DAY, second);
    assert.equal(out.result, "again");
    assert.ok(out.session.queue.includes("w:a"), "still in the session");
    assert.equal(out.card.level, Math.max(1, level - 1), "a make-up answer never raises the lamp");
    // second make-up answer: the first direction again, then it leaves
    const third = relightMode(out.card);
    assert.equal(third, mode, "both directions are asked");
    out = relightRight(out.session, out.card, CLEAN, DAY, third);
    assert.equal(out.result, "back");
    assert.ok(!out.session.queue.includes("w:a"));
    assert.ok(out.card.level < level || level === 1, `level ${level}: ends lower than it started`);
    assert.equal(out.card.level, Math.max(1, level - 1));
    assert.ok(out.card.due <= DAY + 1 && out.card.due > DAY, "due tomorrow, not in 16 or 35 days");
    assert.equal(out.card.lapses, 1, "one lapse, counted once");
    assert.equal(clampDue(out.card, DAY), out.card, "a reload the same day does not pull it back to today");
  }
});

test("Relight: a hinted answer is graded hinted, never easy; help on a make-up answer does not count", () => {
  const c = card("w:a", 5);
  const s0 = startRelight([c, card("w:b", 5)], DAY);
  const out = relightRight(s0, c, { ...CLEAN, hinted: true }, DAY, "toPic");
  assert.equal(out.result, "hinted");
  assert.equal(out.card.level, 5, "the level is kept, not raised");
  assert.equal(out.card.due - DAY, HINTED_DAYS[5]);
  assert.ok(!out.session.queue.includes("w:a"), "graded once and it moves on");
  // a one-lamp session: the old bug re-asked at once and then graded "easy"
  const solo = startRelight([c], DAY);
  const one = relightRight(solo, c, { ...CLEAN, hinted: true }, DAY, "toPic");
  assert.deepEqual([one.session.queue.length, one.card.level, one.result], [0, 5, "hinted"]);
  // after a miss, a helped make-up answer leaves the debt as it was
  const missed = relightMiss(s0, c, "w:b", DAY, "toPic");
  const helped = relightRight(missed.session, missed.card, { ...CLEAN, hinted: true }, DAY, "toWord");
  assert.equal(helped.result, "again");
  assert.equal(helped.session.owed["w:a"], AFTER_MISS);
  assert.equal(helped.card.level, 4);
});

test("Relight: an answer that was shown (second Show me) is a lapse, like a miss", () => {
  const c = card("w:a", 4);
  const s0 = startRelight([c, card("w:b", 4)], DAY);
  const out = relightRight(s0, c, { ...CLEAN, hinted: true, revealed: true }, DAY, "toWord");
  assert.equal(out.result, "lapsed");
  assert.deepEqual([out.card.level, out.card.lapses, out.card.due], [3, 1, DAY]);
  assert.ok(out.session.queue.includes("w:a"), "it is asked again in this session");
  assert.equal(out.session.owed["w:a"], AFTER_MISS);
});

test("Relight: the session size follows the backlog, and the end card can say honestly how many still wait", () => {
  const many = (n) => Array.from({ length: n }, (_, i) => card(`w:x${String(i).padStart(3, "0")}`, 2));
  assert.equal(startRelight(many(5), DAY).queue.length, 5);
  assert.equal(startRelight(many(30), DAY).queue.length, RELIGHT_CAP);
  assert.equal(startRelight(many(50), DAY).queue.length, sessionSize(50));
  assert.equal(startRelight(many(90), DAY).queue.length, sessionSize(90));
  assert.ok(sessionSize(90) > sessionSize(50) && sessionSize(50) > RELIGHT_CAP);

  let deck = many(30);
  let session = startRelight(deck, DAY);
  assert.equal(lampsLeft(session), RELIGHT_CAP);
  assert.equal(moreWaiting(deck, DAY, session), 30 - RELIGHT_CAP, "the rest is waiting, not 'all lit'");
  while (session.queue.length) {
    const c = deck.find((x) => x.id === session.queue[0]);
    const out = relightRight(session, c, CLEAN, DAY, relightMode(c));
    session = out.session;
    deck = deck.map((x) => (x.id === c.id ? out.card : x));
  }
  assert.equal(moreWaiting(deck, DAY, session), 18);
  const next = startRelight(deck, DAY, session.settled);
  assert.equal(next.queue.length, RELIGHT_CAP);
  assert.ok(next.queue.every((id) => !session.settled.includes(id)), "a lamp done in this visit is not asked again");
  // a level-1 word answered with help stays due today, but is not counted as "waiting" in this visit
  const weak = card("w:weak", 1);
  const helped = relightRight(startRelight([weak], DAY), weak, { ...CLEAN, hinted: true }, DAY, "toPic");
  assert.equal(moreWaiting([helped.card], DAY, helped.session), 0);
  assert.deepEqual(relightSkip({ queue: ["a", "b", "c"], owed: {}, settled: [] }).queue, ["b", "c", "a"]);
  assert.deepEqual(relightSkip({ queue: ["a"], owed: {}, settled: [] }).queue, ["a"]);
});

// ---- replaying a room -----------------------------------------------------------------------------------------------

test("replaying a finished room does not level up words that are not due (no replay farming)", () => {
  const room = { teaches: ["a", "b", "c"], reviews: [] };
  const allEasy = record(startSession(), ["a", "b", "c"], "easy");
  const first = Object.fromEntries(finishRoom(allEasy, room, {}, DAY).map((c) => [c.id, c]));
  // a new word answered right every time: one flame, back tomorrow (never a confident two flames on day one)
  assert.deepEqual(Object.values(first).map((c) => [c.level, c.due - DAY]), [[1, 1], [1, 1], [1, 1]]);
  let cards = first;
  for (let replay = 0; replay < 4; replay++) cards = Object.fromEntries(finishRoom(allEasy, room, cards, DAY).map((c) => [c.id, c]));
  assert.deepEqual(cards, first, "four replays on the same day change nothing");
  // a word that IS due moves; a miss always counts; a hint on a word that is not due changes nothing
  const later = Object.fromEntries(finishRoom(allEasy, room, first, DAY + 1).map((c) => [c.id, c.level]));
  assert.deepEqual(later, { a: 2, b: 2, c: 2 });
  const missed = finishRoom(record(startSession(), ["a"], "wrong"), room, first, DAY).find((c) => c.id === "a");
  assert.deepEqual([missed.level, missed.lapses], [1, 1]);
  const hinted = finishRoom(record(startSession(), ["a"], "hinted"), room, first, DAY).find((c) => c.id === "a");
  assert.equal(hinted, first.a);
  // every word of the room is still returned, so the win stores them all
  assert.equal(finishRoom(startSession(), room, first, DAY).length, 3);
});

// ---- save v5: the tutorial hand is remembered -----------------------------------------------------------------------

test("save v5: games whose tutorial hand was shown are remembered; every older version still loads", () => {
  assert.ok(SAVE_VERSION >= 5);
  assert.deepEqual(defaultSave().hands, []);
  const s0 = defaultSave();
  const s1 = markHand(markHand(markHand(s0, "match"), "ayah"), "match");
  assert.deepEqual(s1.hands, ["match", "ayah"]);
  assert.deepEqual(s0.hands, [], "never mutated");
  assert.equal(markHand(s1, "ayah"), s1, "nothing new: the same object, so no extra cloud write");
  assert.deepEqual(parseSave(serializeSave(s1)).save.hands, ["match", "ayah"]);
  for (const v of [1, 2, 3, 4]) {
    const old = parseSave(JSON.stringify({ v, rooms: { "near-far": 1 }, cards: { "w:ok": [2, 7, 3, 1, "room"] }, intro: true, seen: ["relight"], hands: ["match"] }));
    assert.equal(old.blocked, false, `v${v} loads`);
    assert.equal(old.save.v, SAVE_VERSION);
    assert.deepEqual(old.save.hands, [], `v${v}: no hands yet (the field did not exist)`);
    assert.deepEqual(old.save.rooms, { "near-far": 1 });
    assert.deepEqual(old.save.cards["w:ok"], { id: "w:ok", level: 2, due: 7, seen: 3, lapses: 1, last: "room", mixups: {} });
    assert.deepEqual(old.save.seen, ["relight"]);
    assert.equal(parseSave(serializeSave(old.save)).save.v, SAVE_VERSION);
  }
  const junk = parseSave(JSON.stringify({ v: 5, hands: ["ok", 5, "BAD ID", "ok", null] }));
  assert.deepEqual(junk.save.hands, ["ok"]);
  assert.deepEqual(parseSave(JSON.stringify({ v: 5, hands: "match" })).save.hands, []);
  assert.equal(parseSave(JSON.stringify({ v: SAVE_VERSION + 1 })).blocked, true, "a newer save is still left alone");
});

// ---- review fixes ---------------------------------------------------------------------------------------------------

test("Relight: a lamp lapses once per session: more misses or a shown answer on make-up askings only restart the debt", () => {
  const start = card("w:a", 5);
  const others = ["w:b", "w:c", "w:d", "w:e"].map((id) => card(id, 3));
  const s0 = startRelight([start, ...others], DAY);
  // miss
  let out = relightMiss(s0, start, "w:b", DAY, "toPic");
  assert.deepEqual([out.card.level, out.card.lapses], [4, 1]);
  // one make-up answer right, then a miss on the next make-up asking
  out = relightRight(out.session, out.card, CLEAN, DAY, "toWord");
  assert.equal(out.session.owed["w:a"], AFTER_MISS - 1);
  const seenBefore = out.card.seen;
  out = relightMiss(out.session, out.card, "w:c", DAY, "toPic");
  assert.deepEqual([out.card.level, out.card.lapses], [4, 1], "the second miss does not drop it again");
  assert.equal(out.card.mixups["w:c"], 1, "the mix-up is still noted");
  assert.equal(out.card.seen, seenBefore + 1);
  assert.equal(out.session.owed["w:a"], AFTER_MISS, "the debt starts over");
  assert.ok(out.session.queue.includes("w:a"));
  // the answer shown (second Show me) on the next make-up asking
  out = relightRight(out.session, out.card, { ...CLEAN, hinted: true, revealed: true }, DAY, "toWord");
  assert.equal(out.result, "lapsed");
  assert.deepEqual([out.card.level, out.card.lapses], [4, 1], "a shown answer on a make-up asking does not drop it again");
  assert.ok(!isLeech(out.card), "one bad session does not make a leech");
  // paid off: due tomorrow at the level it dropped to once
  for (let k = 0; k < AFTER_MISS; k++) out = relightRight(out.session, out.card, CLEAN, DAY, relightMode(out.card));
  assert.equal(out.result, "back");
  assert.deepEqual([out.card.level, out.card.lapses, out.card.due], [4, 1, DAY + 1]);
});

test("Relight: a helped low lamp is not due again today, so the end of the session is honest", () => {
  for (const level of [1, 2]) {
    let deck = [card("w:a", level), card("w:b", level)];
    let session = startRelight(deck, DAY);
    for (const c of [...deck]) {
      const out = relightRight(session, c, { ...CLEAN, hinted: true }, DAY, "toPic");
      assert.equal(out.result, "hinted");
      assert.equal(out.card.level, level);
      assert.equal(out.card.due, DAY + 1, "back tomorrow, not later today");
      session = out.session;
      deck = deck.map((x) => (x.id === out.card.id ? out.card : x));
    }
    assert.equal(lampsLeft(session), 0);
    assert.equal(moreWaiting(deck, DAY, session), 0);
    assert.equal(dueCards(deck, DAY).length, 0, "the map shows no Relight badge after 'All lamps are lit'");
    assert.equal(startRelight(deck, DAY).queue.length, 0, "a new visit the same day has nothing to ask");
  }
});

test("Show me nudge: about half of the wrong choices go, never all of them", () => {
  assert.deepEqual(nudgeAway(0), []);
  assert.deepEqual(nudgeAway(1), [], "one wrong choice stays: taking it away would be the answer");
  assert.deepEqual(nudgeAway(2), [0]);
  assert.deepEqual(nudgeAway(3), [0, 2]);
  assert.deepEqual(nudgeAway(4), [0, 2]);
  for (let n = 2; n <= 12; n++) {
    const away = nudgeAway(n);
    assert.ok(away.length >= 1 && away.length < n, `${n} wrong choices: some go, one or more stay`);
    assert.deepEqual(away, nudgeAway(n), "deterministic");
  }
});
