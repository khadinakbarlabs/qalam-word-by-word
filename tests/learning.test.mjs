// Phase D (docs/AUDIT_2026-11-23.md, "gentler start and real learning"): short rooms and the save migration that
// goes with them, practice before the Last Check, the gentle Last Check, the short first gap, meaning-not-shape
// questions, mix-ups that are kept, Quick practice, honest progress numbers, "how to say it", the saved language.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { withSteps } from "../game/core/content.js";
import { defaultSave, defaultSettings, parseSave, serializeSave, setSettings, setCards, SAVE_VERSION } from "../game/core/save.js";
import { ROOM_SPLITS, spreadFinished, wasSplit } from "../game/core/room-splits.js";
import { startSession, record, recordMix, finishRoom, leaveRoom, FIRST_GAP_DAYS, FRESH } from "../game/core/room.js";
import { newCard, grade, gradeFresh, isDue, isFresh, nagCards, recordMixup, settleMixup, trimMixups, drillPairs, MIXUP_KEEP, MIXUP_MAX } from "../game/core/srs.js";
import { startMastery, resumeMastery, answer, direction, isMastered, snapshot, checkWords, CHECK_CAP } from "../game/core/mastery.js";
import { warmUpWords, tellApartPairs, WARMUP_MAX, WARMUP_CAP } from "../game/core/warmup.js";
import { practiceWords, startPractice, practiceAnswer, practiceMode, PRACTICE_SIZE } from "../game/core/practice.js";
import { progressReport } from "../game/core/report.js";
import { isCalligraphy, meaningSide, questionSides } from "../game/core/face.js";
import { isFatihaRoom } from "../game/core/milestones.js";
import { masteryWords } from "../game/core/taps.js";
import { resolveLang } from "../game/i18n.js";
import { transliterate, needsSay, sayOf } from "../scripts/lib/translit.mjs";
import { startRelight, relightRight } from "../game/core/relight.js";
import { applySplits, partId, maxNewWords, WING1_MAX_NEW, LATER_MAX_NEW } from "../scripts/lib/split.mjs";
import { unpractised, withPractice, gradedBy, PRACTICE_ROUND } from "../scripts/lib/practice.mjs";
import { SPLITS } from "../authoring/splits.js";

const readJson = (name) => JSON.parse(readFileSync(new URL(`../game/content/${name}`, import.meta.url)));
const base = readJson("pack.json");
const wingFiles = Object.fromEntries([...new Set(base.rooms.map((r) => r.wing))].map((w) => [w, readJson(`wing-${w}.json`)]));
const pack = { ...base, rooms: base.rooms.map((r) => withSteps(r, wingFiles[r.wing])) };
const DAY = 500;
const card = (id, level, due = DAY, more = {}) => ({ ...newCard(id, DAY), level, due, seen: 2, ...more });

// ---- 1. short rooms ---------------------------------------------------------------------------------------------------

test("no Wing 1 room teaches more than 8 new words, no later room more than 20", () => {
  assert.equal(WING1_MAX_NEW, 8);
  assert.equal(LATER_MAX_NEW, 20);
  for (const r of pack.rooms) assert.ok(r.teaches.length <= maxNewWords(r.wing), `${r.id} (wing ${r.wing}): ${r.teaches.length} new words`);
  const taught = pack.rooms.flatMap((r) => r.teaches);
  assert.equal(new Set(taught).size, taught.length, "every word is taught by exactly one room");
});

test("Al-Fatiha is played in ayah order across its five rooms", () => {
  const surah = pack.rooms.filter((r) => isFatihaRoom(r.id));
  assert.equal(surah.length, 5);
  const refs = surah.flatMap((r) => r.steps.filter((s) => s.type === "ayah").map((s) => `${s.ref}${s.part ? `/${s.part[0]}` : ""}`));
  assert.deepEqual(refs, ["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7/1", "1:7/5"]);
  assert.ok(!isFatihaRoom("near-far") && isFatihaRoom("fatiha-2c"));
});

test("the split table, the save's old-id map and the built pack agree", () => {
  const ids = new Set(pack.rooms.map((r) => r.id));
  for (const [old, parts] of Object.entries(ROOM_SPLITS)) {
    assert.equal(parts[0], old, `${old}: the first part keeps the old id (its lamp stays where it was)`);
    for (const id of parts) assert.ok(ids.has(id), `${id} is a room of the pack`);
    const at = pack.rooms.findIndex((r) => r.id === old);
    assert.deepEqual(pack.rooms.slice(at, at + parts.length).map((r) => r.id), parts, `${old}: its parts follow each other`);
  }
  // every room the build cuts (authoring/splits.js) is in the save's map, with the same part ids
  for (const [id, how] of Object.entries(SPLITS)) {
    const n = Array.isArray(how) ? how.length : 2;
    assert.deepEqual(ROOM_SPLITS[id], Array.from({ length: n }, (_, k) => (Array.isArray(how) && how[k].id) || partId(id, k)), id);
  }
  const fromTable = Object.keys(SPLITS).sort();
  assert.deepEqual(Object.keys(ROOM_SPLITS).filter((id) => !/^fatiha/.test(id)).sort(), fromTable, "Al-Fatiha was re-written by hand; every other entry comes from the table");
});

test("applySplits deals a room's steps out without changing them, and refuses a bad table", () => {
  const step = (n) => ({ type: "meet", n });
  const rooms = [{ id: "a", wing: 2, icon: "x", title: { en: "A", ur: "ا" }, steps: [0, 1, 2, 3].map(step) }, { id: "b", wing: 2, title: { en: "B", ur: "ب" }, steps: [step(9)] }];
  const two = applySplits(rooms, { a: { at: 2 } });
  assert.deepEqual(two.errors, []);
  assert.deepEqual(two.rooms.map((r) => [r.id, r.title.en, r.steps.map((s) => s.n)]), [["a", "A", [0, 1]], ["a-b", "A, part 2", [2, 3]], ["b", "B", [9]]]);
  assert.deepEqual(two.map, { a: ["a", "a-b"] });
  const three = applySplits(rooms, { a: [{ steps: [0, 3] }, { steps: [1], title: { en: "Own", ur: "اپنا" } }, { steps: [2] }] });
  assert.deepEqual(three.rooms.slice(0, 3).map((r) => [r.id, r.title.en, r.steps.map((s) => s.n)]), [["a", "A", [0, 3]], ["a-b", "Own", [1]], ["a-c", "A, part 3", [2]]]);
  assert.equal(rooms[0].steps.length, 4, "the written room is not changed");
  assert.ok(applySplits(rooms, { nope: { at: 1 } }).errors.length, "a room that does not exist");
  assert.ok(applySplits(rooms, { a: [{ steps: [0, 1] }, { steps: [1, 2] }] }).errors.length, "a step used twice or left out");
  assert.ok(applySplits(rooms, { a: { at: 0 } }).errors.length, "an empty part");
});

// ---- save v6 ----------------------------------------------------------------------------------------------------------

test("save v6: a finished old room keeps every lamp and card; every older version loads", () => {
  assert.equal(SAVE_VERSION, 6);
  const cards = { "w:allah": [3, 510, 4, 0, "toPic"], "w:kitab": [1, 500, 2, 1, "room"] };
  for (const v of [1, 2, 3, 4, 5]) {
    const raw = { v, rooms: { fatiha: 1, "fatiha-2": 1, "near-far": 1, "whos-who": 1, "word-chest": 1, "town-people": 1 }, cards, intro: true, seen: ["relight"], settings: { captions: false, sound: true } };
    const got = parseSave(JSON.stringify(raw));
    assert.equal(got.blocked, false, `v${v} loads`);
    assert.equal(got.save.v, 6);
    for (const id of ["fatiha", "fatiha-1b", "fatiha-2", "fatiha-2b", "fatiha-2c", "near-far", "whos-who", "whos-who-b", "word-chest", "word-chest-b", "word-chest-c", "town-people", "town-people-b"]) {
      assert.equal(got.save.rooms[id], 1, `v${v}: ${id} is finished`);
    }
    assert.equal(Object.keys(got.save.rooms).length, 13);
    assert.deepEqual(got.save.cards["w:allah"], { id: "w:allah", level: 3, due: 510, seen: 4, lapses: 0, last: "toPic", mixups: {} }, "cards are untouched");
    assert.equal(got.save.cards["w:kitab"].lapses, 1);
    assert.deepEqual(got.save.settings, { lang: "auto", captions: false, sound: true, say: false }, "new settings start at their defaults");
    assert.equal(parseSave(serializeSave(got.save)).save.v, 6);
  }
  assert.deepEqual(spreadFinished({ "lamp-box": 1 }), { "lamp-box": 1, "lamp-box-b": 1 });
  assert.deepEqual(spreadFinished({ "near-far": 1 }), { "near-far": 1 }, "a room that was not cut is left alone");
  // a v6 save is never spread again: a player half way through a cut room keeps exactly what they finished
  assert.deepEqual(parseSave(JSON.stringify({ v: 6, rooms: { "lamp-box": 1 } })).save.rooms, { "lamp-box": 1 });
  assert.equal(parseSave(JSON.stringify({ v: 7 })).blocked, true, "a newer save is left alone");
});

test("save v6: a place saved inside a room that was cut is dropped (the room starts over), others are kept", () => {
  const at = (r) => ({ r, s: 2, n: 9, res: { "w:a": 0 }, met: ["w:a"] });
  assert.equal(wasSplit("whos-who") && !wasSplit("near-far"), true);
  assert.equal(parseSave(JSON.stringify({ v: 5, rooms: { fatiha: 1 }, at: at("whos-who") })).save.at, null);
  assert.equal(parseSave(JSON.stringify({ v: 5, rooms: { fatiha: 1 }, at: at("near-far") })).save.at.room, "near-far");
  assert.equal(parseSave(JSON.stringify({ v: 6, rooms: { fatiha: 1 }, at: at("whos-who") })).save.at.room, "whos-who", "a v6 place is in the new rooms already");
});

test("save v6: mix-ups, the chosen language and 'show how to say it' survive a round trip", () => {
  let save = setCards(defaultSave(), [{ ...card("w:a", 2), mixups: { "w:b": 3, "w:c": 1 } }, card("w:b", 1)]);
  save = setSettings(save, { lang: "ur", say: true });
  const back = parseSave(serializeSave(save)).save;
  assert.deepEqual(back.cards["w:a"].mixups, { "w:b": 3, "w:c": 1 });
  assert.deepEqual(back.cards["w:b"].mixups, {});
  assert.deepEqual(back.settings, { lang: "ur", captions: true, sound: true, say: true });
  assert.equal(JSON.parse(serializeSave(setCards(defaultSave(), [card("w:b", 1)]))).cards["w:b"].length, 5, "a card with no mix-ups stays five numbers long");
  // junk is cleaned, never fatal
  const junk = parseSave(JSON.stringify({ v: 6, settings: { lang: "xx", say: "yes" }, cards: { "w:a": [2, 500, 1, 0, null, [["w:b", 99], ["BAD ID", 2], ["w:c", -1], "x", ["w:d", 2], ["w:e", 2], ["w:f", 2]]] } })).save;
  assert.deepEqual(junk.settings, defaultSettings());
  assert.equal(junk.cards["w:a"].mixups["w:b"], MIXUP_MAX);
  assert.ok(Object.keys(junk.cards["w:a"].mixups).length <= MIXUP_KEEP);
  assert.ok(!("BAD ID" in junk.cards["w:a"].mixups) && !("w:c" in junk.cards["w:a"].mixups));
});

test("the player's language choice wins over YouTube's language; 'auto' follows it", () => {
  assert.equal(defaultSettings().lang, "auto");
  assert.equal(resolveLang(defaultSettings().lang, "ur-PK"), "ur");
  const picked = parseSave(serializeSave(setSettings(defaultSave(), { lang: "en" }))).save.settings.lang;
  assert.equal(resolveLang(picked, "ur-PK"), "en");
  assert.equal(resolveLang(parseSave(serializeSave(setSettings(defaultSave(), { lang: "ur" }))).save.settings.lang, "en-US"), "ur");
});

// ---- 2. practice before the Last Check ---------------------------------------------------------------------------------

test("every new word is practised with a graded question before the Last Check", () => {
  const met = new Set();
  for (const room of pack.rooms) {
    assert.deepEqual(unpractised(room.steps, met).filter((id) => masteryWords(room, pack.words).includes(id)), [], room.id);
    room.teaches.forEach((id) => met.add(id));
  }
});

test("the build adds a Picture Match for words that were only shown, and reports a word it cannot practise", () => {
  const meet = { type: "meet", words: ["w:a", "w:b", "w:c", "w:d", "w:e", "w:f", "w:g", "w:h"] };
  const bare = [meet, { type: "match", words: ["w:a"] }];
  assert.deepEqual(unpractised(bare, new Set()), ["w:b", "w:c", "w:d", "w:e", "w:f", "w:g", "w:h"]);
  const fixed = withPractice(bare, new Set());
  assert.deepEqual(unpractised(fixed, new Set()), []);
  const added = fixed.filter((s) => s.added);
  assert.ok(added.every((s) => s.type === "match" && s.words.length <= PRACTICE_ROUND));
  assert.deepEqual(added.flatMap((s) => s.words), ["w:b", "w:c", "w:d", "w:e", "w:f", "w:g", "w:h"]);
  assert.equal(fixed.indexOf(added[0]), 1, "right after the step that showed the words");
  assert.equal(bare.length, 2, "the written steps are not changed");
  // a word that cannot be asked in a Picture Match (no Arabic or no face) is left for the build to report
  assert.deepEqual(unpractised(withPractice([meet], new Set(), (id) => id !== "w:h"), new Set()), ["w:h"]);
  // a word already known before the step is graded by an ayah tile; a new one there is only met
  const ayah = { type: "ayah", words: [{ w: ["w:x"] }, { w: ["w:y"] }, { w: ["w:z"], given: true }] };
  assert.deepEqual(gradedBy(ayah, new Set(["w:x"])), ["w:x"]);
});

// ---- 3. the Last Check -------------------------------------------------------------------------------------------------

const play = (state, outcomes) => outcomes.reduce((s, o) => answer(s, o), state);

test("gentle Last Check (Wing 1): one right answer each way, and a miss never wipes a dot", () => {
  let s = startMastery(["a", "b", "c"], { gentle: true });
  assert.equal(direction(s, "a"), "toPic");
  s = answer(s, "right");
  assert.equal(s.streak.a, 1);
  assert.equal(direction(s, "a"), "toWord", "the second dot is the other direction");
  // a comes back; miss it: the dot stays, the direction stays, it is asked again
  while (s.queue[0] !== "a") s = answer(s, "right");
  s = answer(s, "wrong");
  assert.equal(s.streak.a, 1, "the earned dot is kept");
  assert.equal(direction(s, "a"), "toWord");
  assert.ok(s.queue.includes("a") && !s.done.includes("a"));
  // Show me neither earns nor loses
  while (s.queue[0] !== "a") s = answer(s, "right");
  s = answer(s, "hinted");
  assert.equal(s.streak.a, 1);
  while (!isMastered(s)) s = answer(s, "right");
  assert.deepEqual([...s.done].sort(), ["a", "b", "c"]);
  // all right first time: exactly two answers a word, not two in a row after a reset
  let clean = startMastery(["a", "b", "c", "d"], { gentle: true });
  let n = 0;
  while (!isMastered(clean)) { clean = answer(clean, "right"); n += 1; }
  assert.equal(n, 8);
});

test("strict Last Check (later wings): two in a row, a miss resets the word", () => {
  let s = startMastery(["a", "b", "c"]);
  s = answer(s, "right");
  while (s.queue[0] !== "a") s = answer(s, "right");
  s = answer(s, "wrong");
  assert.equal(s.streak.a, 0);
  assert.equal(s.gentle, false);
});

test("a gentle check picked up from a checkpoint keeps its dots and stays gentle", () => {
  let s = play(startMastery(["a", "b", "c"], { gentle: true }), ["right", "right"]);
  const back = resumeMastery(["a", "b", "c"], snapshot(s), { gentle: true });
  assert.equal(back.gentle, true);
  assert.deepEqual(back.streak, { a: 1, b: 1, c: 0 });
  assert.equal(direction(back, "a"), "toWord");
  assert.equal(resumeMastery(["a"], null, { gentle: true }).gentle, true);
});

test("the Last Check asks at most 8 words: the ones that most need it, in teaching order", () => {
  assert.equal(CHECK_CAP, 8);
  const ids = Array.from({ length: 12 }, (_, k) => `w${k}`);
  assert.deepEqual(checkWords(ids.slice(0, 8), {}), ids.slice(0, 8), "a short room is checked whole");
  const results = { w0: "easy", w1: "easy", w2: "wrong", w3: "easy", w4: "hinted", w5: "easy", w6: "easy", w7: "easy", w8: "easy", w9: "easy", w11: "wrong" };
  const picked = checkWords(ids, results);
  assert.equal(picked.length, 8);
  for (const id of ["w2", "w11", "w4", "w10"]) assert.ok(picked.includes(id), `${id} (missed, helped or never asked) is checked`);
  assert.deepEqual(picked, ids.filter((id) => picked.includes(id)), "teaching order");
  assert.deepEqual(checkWords(ids, results), picked, "the same answers give the same words");
  for (const room of pack.rooms) assert.ok(checkWords(masteryWords(room, pack.words), {}).length <= CHECK_CAP, room.id);
});

test("a new word's first gap is short: right and checked = tomorrow at one flame; anything less = today", () => {
  const room = { teaches: ["a", "b", "c", "d", "e"], reviews: [] };
  let s = record(startSession(), ["a", "b", "e"], "easy");
  s = record(s, ["c"], "hinted");
  const out = Object.fromEntries(finishRoom(s, room, {}, DAY, { checked: ["a", "b", "c", "d"] }).map((c) => [c.id, c]));
  assert.equal(FIRST_GAP_DAYS, 1);
  assert.deepEqual([out.a.level, out.a.due - DAY, out.a.last], [1, 1, "room"], "right every time and checked");
  assert.deepEqual([out.c.level, out.c.due - DAY, out.c.last], [1, 0, FRESH], "needed help");
  assert.deepEqual([out.d.level, out.d.due - DAY, out.d.last], [1, 0, FRESH], "only met");
  assert.deepEqual([out.e.level, out.e.due - DAY, out.e.last], [1, 0, FRESH], "right, but the capped check did not reach it");
  assert.ok(Object.values(out).every((c) => c.level === 1), "nobody gets two flames minutes after first seeing a word");
  // the next day a right answer in Relight makes two flames
  assert.equal(grade(out.a, "easy", DAY + 1, "toPic").level, 2);
});

test("the map does not nag about words learnt today; the warm-up still asks them, and tomorrow they count", () => {
  const fresh = { ...card("w:new", 1), last: FRESH };
  const old = card("w:old", 2, DAY - 1);
  assert.equal(isFresh(fresh, DAY), true);
  assert.equal(isDue(fresh, DAY), true);
  assert.deepEqual(nagCards([fresh, old], DAY).map((c) => c.id), ["w:old"]);
  assert.deepEqual(nagCards([fresh, old], DAY + 1).map((c) => c.id).sort(), ["w:new", "w:old"], "from tomorrow it is a lamp to relight");
  assert.equal(isFresh({ ...fresh, last: "warm" }, DAY), false, "once reviewed it is an ordinary card");
});

test("the warm-up asks every one-flame word that waits (up to 8): the words a capped check did not reach", () => {
  const words = Object.fromEntries(Array.from({ length: 14 }, (_, k) => [`w:${k}`, { ar: "ك", pic: "x" }]));
  const young = Array.from({ length: 10 }, (_, k) => card(`w:${k}`, 1));
  const older = [card("w:10", 3, DAY - 5), card("w:11", 4, DAY - 9)];
  const cards = Object.fromEntries([...young, ...older].map((c) => [c.id, c]));
  const picked = warmUpWords(cards, DAY, words);
  assert.equal(picked.length, WARMUP_CAP);
  assert.ok(picked.every((id) => cards[id].level === 1), "one-flame words first");
  assert.equal(warmUpWords({ "w:10": older[0], "w:11": older[1], "w:0": young[0] }, DAY, words).length, WARMUP_MAX, "normally three");
  assert.deepEqual(warmUpWords({ "w:10": older[0], "w:0": young[0] }, DAY, words)[0], "w:0");
  assert.deepEqual(warmUpWords(cards, DAY, words, young.map((c) => c.id)).sort(), ["w:10", "w:11"], "the room's own words are left out");
});

// ---- 4. meaning, not shape ---------------------------------------------------------------------------------------------

test("a calligraphy word is never asked Arabic against the same Arabic", () => {
  const name = { ar: "ٱلرَّحْمَٰن", medal: "رَحْمٰن", g: { en: "the Most Merciful" } };
  const book = { ar: "كِتَاب", pic: "📖", g: { en: "book" } };
  assert.equal(isCalligraphy(name) && !isCalligraphy(book), true);
  assert.equal(meaningSide(name), "written");
  assert.equal(meaningSide(book), "picture");
  for (const face of [name, book, { ar: "مُوسَى", medal: "scroll:مُوسَى", g: { en: "Musa" } }]) {
    for (const mode of ["toPic", "toWord"]) {
      const sides = questionSides(face, mode);
      assert.notEqual(sides.prompt, sides.choice, "the two sides never show the same thing");
      assert.ok([sides.prompt, sides.choice].includes("arabic"));
      if (isCalligraphy(face)) assert.ok(![sides.prompt, sides.choice].includes("picture"), "no medallion on the meaning side");
    }
  }
  // the screens that ask word questions draw the meaning side through the shared helpers (ui/kit.js)
  const read = (f) => readFileSync(new URL(`../game/ui/${f}`, import.meta.url), "utf8");
  for (const f of ["steps/match.js", "steps/warmup.js", "steps/mastery.js", "steps/ayah.js", "relight.js"]) assert.match(read(f), /meaningChoice\(/, f);
  for (const f of ["steps/mastery.js", "relight.js", "steps/tellapart.js"]) assert.match(read(f), /meaningPrompt\(/, f);
  assert.match(read("kit.js"), /isCalligraphy\(face\)/);
});

// ---- 6. mix-ups ----------------------------------------------------------------------------------------------------------

test("mix-ups are kept small, the newest always stays, and a pair told apart is settled", () => {
  let c = card("w:a", 2);
  for (const other of ["w:b", "w:b", "w:c", "w:d", "w:d", "w:d", "w:e"]) c = recordMixup(c, other);
  assert.ok(Object.keys(c.mixups).length <= MIXUP_KEEP);
  assert.equal(c.mixups["w:e"], 1, "the newest mix-up is kept");
  assert.equal(c.mixups["w:d"], 3);
  assert.equal(recordMixup(c, "w:a"), c, "a word is never mixed up with itself");
  let many = card("w:m", 2);
  for (let k = 0; k < 30; k++) many = recordMixup(many, "w:b");
  assert.equal(many.mixups["w:b"], MIXUP_MAX);
  assert.deepEqual(trimMixups({ a: 1, b: 5, c: 0, d: 2, e: 3 }), { b: 5, e: 3, d: 2 });
  const settled = settleMixup(c, "w:d");
  assert.ok(!("w:d" in settled.mixups) && "w:d" in c.mixups, "a new card; the old one is untouched");
  assert.equal(settleMixup(c, "w:zzz"), c);
  assert.deepEqual(drillPairs([settled]).flat().includes("w:d"), false);
});

test("a room's wrong picks go on the word's card, and 'tell these apart' picks pairs the player owns", () => {
  let s = recordMix(recordMix(startSession(), "a", "b"), "a", "b");
  s = record(s, ["a"], "wrong");
  assert.equal(recordMix(s, "a", "a"), s);
  const out = finishRoom(s, { teaches: ["a"], reviews: [] }, {}, DAY);
  assert.deepEqual(out[0].mixups, { b: 2 });
  const words = { a: { ar: "كتب", pic: "x" }, b: { ar: "كتاب", pic: "y" }, c: { ar: "كتب", pic: "z" }, d: { ar: "قلم" } };
  const cards = [{ ...card("a", 1), mixups: { b: 2, c: 2, d: 2, zz: 4 } }, card("b", 1), card("c", 1), card("d", 1)];
  assert.deepEqual(tellApartPairs(cards, words, 5), [["a", "b"]], "not a word with no card, no face, or written the same");
  assert.deepEqual(tellApartPairs(cards, words, 0), []);
  assert.deepEqual(tellApartPairs([{ ...card("a", 1), mixups: { b: 1 } }, card("b", 1)], words), [], "one slip is not a habit");
});

// ---- 7. Quick practice and leaving a room -------------------------------------------------------------------------------

test("Quick practice picks the weakest and oldest words and never changes a card", () => {
  const words = Object.fromEntries(Array.from({ length: 12 }, (_, k) => [`w:${k}`, { ar: "ك", pic: "x" }]));
  words["w:noface"] = { ar: "ك" };
  const cards = [card("w:0", 5, DAY + 30), card("w:1", 1, DAY + 1), card("w:2", 2, DAY + 2, { lapses: 3 }), card("w:3", 2, DAY + 2), card("w:4", 3, DAY + 1), card("w:5", 3, DAY + 3),
    card("w:6", 4, DAY + 9), card("w:7", 6, DAY + 30), card("w:8", 1, DAY), card("w:9", 2, DAY + 1), card("w:10", 0, DAY), card("w:noface", 1, DAY)];
  const frozen = JSON.stringify(cards);
  const picked = practiceWords(cards, DAY, words);
  assert.equal(picked.length, PRACTICE_SIZE);
  assert.deepEqual(picked.slice(0, 4), ["w:8", "w:1", "w:2", "w:9"], "due today first, then fewest flames, most missed, earliest due");
  assert.ok(!picked.includes("w:10") && !picked.includes("w:noface") && !picked.includes("w:7"));
  let s = startPractice(cards, DAY, words);
  s = practiceAnswer(s, "w:8", false);
  assert.ok(s.queue.includes("w:8") && s.again.includes("w:8"), "a missed word comes back once");
  s = practiceAnswer(s, "w:1", true);
  assert.ok(!s.queue.includes("w:1"));
  while (s.queue.length) s = practiceAnswer(s, s.queue[0], false);
  assert.equal(s.right, 1);
  assert.ok(s.asked <= PRACTICE_SIZE * 2, "it always ends");
  assert.equal(JSON.stringify(cards), frozen, "no card was changed: practice cannot lower progress or push a word up");
  assert.notEqual(practiceMode(cards[1], 0), practiceMode(cards[1], 1), "the side asked alternates");
  // the screen that draws it only ever writes a mix-up to a card
  const relight = readFileSync(new URL("../game/ui/relight.js", import.meta.url), "utf8");
  assert.match(relight, /if \(practice\) \{[^}]*put\(recordMixup\(/s);
});

test("leaving a room mid-way keeps what was reviewed, once", () => {
  const room = { teaches: ["n"], reviews: ["due", "notdue", "missed"] };
  const cards = { due: card("due", 2, DAY - 1), notdue: card("notdue", 3, DAY + 4), missed: card("missed", 3, DAY + 4) };
  let s = record(startSession(), ["due", "notdue", "n"], "easy");
  s = record(s, ["missed"], "wrong");
  const out = leaveRoom(s, room, cards, DAY);
  const got = Object.fromEntries(out.cards.map((c) => [c.id, c]));
  assert.equal(got.due.level, 3, "a due word answered right moves up");
  assert.equal(got.missed.level, 2, "a miss always counts");
  assert.ok(!("notdue" in got) && !("n" in got), "a word that was not due does not move; new words wait for the end of the room");
  assert.deepEqual(out.results, { n: "easy" }, "the reviewed words leave the session, so finishing later cannot grade them twice");
  const after = { ...cards, ...got };
  const end = finishRoom({ ...s, results: out.results }, room, after, DAY);
  assert.deepEqual(end.map((c) => c.id), ["n"]);
  assert.deepEqual(leaveRoom(startSession(), room, cards, DAY), { cards: [], results: {} });
});

// ---- 8. honest progress -------------------------------------------------------------------------------------------------

test("My progress: words met, words remembered now, and lamps by flames", () => {
  const small = { rooms: [{ teaches: ["a", "b", "c"] }, { teaches: ["d", "e"] }] };
  const cards = { a: card("a", 2, DAY + 1), b: card("b", 1, DAY), c: card("c", 4, DAY - 3), zz: card("zz", 6, DAY + 9) };
  assert.deepEqual(progressReport(small, cards, DAY), { total: 5, met: 3, remembered: 1, fading: 2, byFlames: [0, 1, 1, 0, 1, 0, 0] });
  assert.deepEqual(progressReport(small, {}, DAY), { total: 5, met: 0, remembered: 0, fading: 0, byFlames: [0, 0, 0, 0, 0, 0, 0] });
  assert.equal(progressReport(small, cards, DAY + 1).remembered, 0, "it goes down when lamps fade");
  const whole = progressReport(pack, {}, DAY);
  assert.equal(whole.total, new Set(pack.rooms.flatMap((r) => r.teaches)).size);
});

test("a word learnt today and answered in the next warm-up or Relight stays in its first gap: never above a checked word", () => {
  const room = { teaches: ["a", "b", "c"], reviews: [] };
  let s = record(startSession(), ["a"], "easy");
  s = record(s, ["b"], "wrong");
  const out = Object.fromEntries(finishRoom(s, room, {}, DAY, { checked: ["a", "b"] }).map((c) => [c.id, c]));
  // the next room's warm-up, minutes later: the missed word and the unchecked word are answered right
  for (const id of ["b", "c"]) {
    const warm = gradeFresh(out[id], "easy", DAY, "warm");
    assert.deepEqual([warm.level, warm.due - DAY, warm.last, warm.seen], [1, FIRST_GAP_DAYS, "warm", out[id].seen + 1], id);
    assert.ok(warm.level <= out.a.level && warm.due <= out.a.due, "never ahead of the word that passed the check");
    assert.equal(isFresh(warm, DAY), false);
    assert.equal(isDue(warm, DAY), false, "settled for today");
  }
  // with help or a miss it stays today's fresh word: due today, no nag on the map, one flame
  for (const result of ["hinted", "wrong"]) {
    const again = gradeFresh(out.b, result, DAY, "warm");
    assert.deepEqual([again.level, again.due - DAY, isFresh(again, DAY)], [1, 0, true], result);
    assert.equal(nagCards([again], DAY).length, 0);
  }
  assert.equal(gradeFresh(out.b, "wrong", DAY, "warm").lapses, out.b.lapses + 1, "a miss is still counted");
  // Relight the same day: right first time = one flame, back tomorrow, and the lamp leaves the session
  const lit = relightRight(startRelight([out.c], DAY), out.c, { missed: false, hinted: false, revealed: false }, DAY, "toPic");
  assert.deepEqual([lit.result, lit.card.level, lit.card.due - DAY, lit.session.queue.length], ["lit", 1, 1, 0]);
  // from tomorrow, and for every card that is not fresh, the usual rule holds
  assert.deepEqual(gradeFresh(out.c, "easy", DAY + 1, "warm"), grade(out.c, "easy", DAY + 1, "warm"));
  assert.equal(gradeFresh(out.c, "easy", DAY + 1, "warm").level, 2);
  assert.deepEqual(gradeFresh(out.a, "easy", DAY + 1, "toPic"), grade(out.a, "easy", DAY + 1, "toPic"));
});

// ---- 9. how to say it ---------------------------------------------------------------------------------------------------

test("transliteration: the rules spell known words the expected way", () => {
  const known = {
    "بِسْمِ": "bismi", "ٱللَّهِ": "allāhi", "ٱلرَّحْمَٰنِ": "ar-raḥmāni", "ٱلرَّحِيمِ": "ar-raḥīmi", "ٱلْحَمْدُ": "al-ḥamdu", "لِلَّهِ": "lillāhi",
    "رَبِّ": "rabbi", "ٱلْعَـٰلَمِينَ": "al-ʿālamīna", "مَـٰلِكِ": "māliki", "يَوْمِ": "yawmi", "ٱلدِّينِ": "ad-dīni", "إِيَّاكَ": "iyyāka",
    "نَعْبُدُ": "naʿbudu", "نَسْتَعِينُ": "nastaʿīnu", "ٱهْدِنَا": "ihdinā", "ٱلصِّرَٰطَ": "aṣ-ṣirāṭa", "ٱلْمُسْتَقِيمَ": "al-mustaqīma", "ٱلَّذِينَ": "alladhīna",
    "أَنْعَمْتَ": "anʿamta", "عَلَيْهِمْ": "ʿalayhim", "غَيْرِ": "ghayri", "ٱلْمَغْضُوبِ": "al-maghḍūbi", "وَلَا": "walā", "ٱلضَّآلِّينَ": "aḍ-ḍāllīna",
    "كِتَابٌ": "kitābun", "هُدًى": "hudan", "قَالُوا۟": "qālū", "مُوسَىٰ": "mūsā", "رَحْمَة": "raḥmah", "بِٱلْحَقِّ": "bil-ḥaqqi", "وَٱلشَّمْسِ": "wash-shamsi",
    "ـنَا": "-nā", "لَّهُۥ": "lahū", "أَبَدًا": "abadan",
  };
  assert.ok(Object.keys(known).length >= 30);
  for (const [word, say] of Object.entries(known)) assert.equal(transliterate(word), say, word);
  assert.equal(transliterate("كِتَابٌ"), transliterate("كِتَابٌ"), "the same word always gives the same spelling");
  // a joining alif at the start: u only for a verb whose stem vowel is u; a case ending or a noun gives i
  const wasla = { "ٱسْمُ": "ismu", "ٱبْنُ": "ibnu", "ٱسْمُهُ": "ismuhu", "ٱبْنَ": "ibna", "ٱدْخُلُوا۟": "udkhulū", "ٱعْبُدُوا۟": "uʿbudū", "ٱذْكُرْ": "udhkur", "ٱهْدِنَا": "ihdinā" };
  for (const [word, say] of Object.entries(wasla)) assert.equal(transliterate(word), say, word);
  assert.equal(transliterate(""), "");
  assert.equal(transliterate("abc"), "");
});

test("transliteration: letter names need a hand-written spelling, and an override always wins", () => {
  assert.equal(needsSay("الٓمٓ"), true);
  assert.equal(needsSay("كِتَاب"), false);
  assert.equal(needsSay("—"), false, "nothing to say");
  assert.equal(sayOf("الٓمٓ", "alif lām mīm"), "alif lām mīm");
  assert.equal(sayOf("كِتَاب", "  "), "kitāb", "an empty override falls back to the rules");
  assert.equal(pack.words["w:alm"].say, "alif lām mīm");
});

test("every word card and every ayah tile ships with a spelling; the setting is off by default", () => {
  const cardsWithArabic = Object.entries(pack.words).filter(([, w]) => w.ar && /[ء-يٱ]/.test(w.ar));
  assert.ok(cardsWithArabic.length > 800);
  for (const [id, w] of cardsWithArabic) assert.match(w.say ?? "", /[aiuāīū]/, id);
  const tiles = pack.rooms.flatMap((r) => r.steps.filter((s) => s.type === "ayah").flatMap((s) => s.words));
  for (const tile of tiles) assert.match(tile.say ?? "", /[aiuāīū]/, tile.ar);
  // step items that carry their own Arabic (another shape of a word, a verb with its partner) have their own line
  const own = pack.rooms.flatMap((r) => r.steps.filter((s) => ["timeline", "sort", "petals", "path"].includes(s.type)).flatMap((s) => s.items)).filter((it) => it.ar);
  assert.ok(own.length > 80);
  for (const it of own) { assert.match(it.say ?? "", /[aiuāīū]/, it.ar); assert.doesNotMatch(it.say, /[؀-ۿ]/, it.ar); }
  const path = pack.rooms.flatMap((r) => r.steps.filter((s) => s.type === "path").flatMap((s) => s.items));
  assert.ok(path.length && path.every((it) => it.say.includes(" ")), "a verb with its partner is spelled as two words");
  assert.ok(Object.values(pack.words).every((w) => !w.say || !/[؀-ۿ]/.test(w.say)), "Latin letters only");
  assert.equal(defaultSettings().say, false);
  assert.equal(defaultSave().settings.say, false);
});
