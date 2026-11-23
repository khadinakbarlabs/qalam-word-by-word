// Polish Phase 2: mid-room checkpoints, room length and rest stops.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { splitPack, withSteps, wingLoader } from "../game/core/content.js";
import { defaultSave, parseSave, serializeSave, markRoom, setCheckpoint, checkpointFor, SAVE_VERSION } from "../game/core/save.js";
import { roomTaps, restStops, stretches, REST_EVERY } from "../game/core/taps.js";

// the shipped files, joined the way the game joins them (core/content.js)
const contentFile = (name) => new URL(`../game/content/${name}`, import.meta.url);
const readJson = (name) => JSON.parse(readFileSync(contentFile(name)));
const base = readJson("pack.json");
const wingFiles = Object.fromEntries([...new Set(base.rooms.map((r) => r.wing))].map((w) => [w, readJson(`wing-${w}.json`)]));
const pack = { ...base, rooms: base.rooms.map((r) => withSteps(r, wingFiles[r.wing])) };
const room = pack.rooms.find((r) => r.id === "grown-forms-7");
const at = { room: room.id, step: 9, steps: room.steps.length, results: { "w:a": "easy", "w:b": "wrong", "w:c": "hinted" }, met: ["w:a", "w:d"] };

test("a mid-room checkpoint round-trips and resumes at the same step", () => {
  const back = parseSave(serializeSave(setCheckpoint(defaultSave(), at))).save;
  assert.equal(back.v, SAVE_VERSION);
  assert.deepEqual(back.at, at);
  assert.deepEqual(checkpointFor(back, room), at);
  assert.equal(checkpointFor(back, pack.rooms[0]), null, "another room starts fresh");
});

test("finishing the room, or a content change to its steps, drops the checkpoint", () => {
  const saved = setCheckpoint(defaultSave(), at);
  assert.equal(markRoom(saved, room.id).at, null);
  assert.deepEqual(markRoom(saved, "fatiha").at, at, "finishing another room keeps it");
  assert.equal(checkpointFor(saved, { ...room, steps: room.steps.slice(1) }), null);
  const done = JSON.parse(serializeSave(saved));
  done.rooms = { [room.id]: 1 };
  assert.equal(parseSave(JSON.stringify(done)).save.at, null);
});

test("the first session is light: Al-Fatiha is five short rooms, none with more than 8 new words", () => {
  const surah = pack.rooms.slice(0, 5);
  assert.deepEqual(surah.map((r) => r.id), ["fatiha", "fatiha-1b", "fatiha-2", "fatiha-2b", "fatiha-2c"]);
  assert.ok(surah.every((r) => r.teaches.length <= 8), surah.map((r) => r.teaches.length).join(" + "));
  assert.equal(surah.reduce((n, r) => n + r.teaches.length, 0), 30, "the whole surah's 30 words are still taught");
  for (const r of surah) {
    assert.ok(roomTaps(r, pack.words) <= 60, `${r.id}: ${roomTaps(r, pack.words)} taps`);
    assert.deepEqual(restStops(r, pack.words), [], `${r.id} needs no rest stop`);
  }
  assert.ok(roomTaps(pack.rooms[5], pack.words) <= 80, "the room after the surah is no heavier");
});

test("every Point spot and the pointer are paintings, not emoji (POLISH_PLAN B2)", () => {
  const spots = pack.rooms.flatMap((r) => r.steps.filter((s) => s.type === "point").flatMap((s) => s.spots));
  assert.ok(spots.length >= 9, "near-far has 6 spots and who has 3");
  for (const s of spots) assert.match(pack.words[s.art]?.pic ?? "", /^img:art\/.+\.webp$/, `${s.id} → ${s.art}`);
  assert.match(pack.words["ui:qalam"].pic, /^img:art\//, "the pointer");
});

test("a save from before Al-Fatiha was split keeps its progress; a new one plays both rooms", () => {
  const old = (v, rooms) => parseSave(JSON.stringify({ v, rooms, cards: {}, intro: true })).save;
  assert.deepEqual(old(2, { fatiha: 1 }).rooms, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 });
  assert.deepEqual(old(2, { fatiha: 1, "near-far": 1 }).rooms, { ...{ fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 }, "near-far": 1 });
  assert.deepEqual(old(2, {}).rooms, {}, "nothing finished stays nothing");
  // v3 to v5: the surah was two rooms (1:1–1:4, then 1:5–1:7); each is now shorter rooms (core/room-splits.js)
  assert.deepEqual(old(3, { fatiha: 1 }).rooms, { fatiha: 1, "fatiha-1b": 1 }, "a v3 save with only the first room still has 1:5–1:7 to play");
  assert.deepEqual(old(5, { fatiha: 1, "fatiha-2": 1 }).rooms, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 });
  assert.equal(parseSave(serializeSave(old(2, { fatiha: 1 }))).save.v, SAVE_VERSION);
});

test("v1 saves load with no checkpoint; a bad checkpoint is dropped, not the save", () => {
  const v1 = parseSave(JSON.stringify({ v: 1, rooms: { fatiha: 1 }, cards: {}, intro: true })).save;
  assert.equal(v1.at, null);
  assert.deepEqual(v1.rooms, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 }, "the whole surah was one room before v3");
  for (const bad of [{ r: "x", s: 5, n: 3 }, { r: "BAD ID", s: 0, n: 3 }, { s: 1, n: 2 }, "nope"]) {
    const p = parseSave(JSON.stringify({ v: 2, rooms: { fatiha: 1 }, cards: {}, intro: true, at: bad }));
    assert.equal(p.blocked, false);
    assert.equal(p.save.at, null, JSON.stringify(bad));
    assert.deepEqual(p.save.rooms, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 });
  }
  const odd = parseSave(JSON.stringify({ v: 2, at: { r: "x", s: 1, n: 2, res: { "w:a": 7, "w:b": 1 }, met: ["w:a", 3] } })).save.at;
  assert.deepEqual(odd.results, { "w:b": "hinted" });
  assert.deepEqual(odd.met, ["w:a"]);
});

test("tap counts match autoplay runs", () => {
  const taps = Object.fromEntries(pack.rooms.map((r) => [r.title.en, roomTaps(r, pack.words)]));
  // measured 2026-11-05 by playing each room in the browser with every answer right first time
  // 2026-11-23: long rooms are played in parts and the Last Check asks at most 8 words, so the counts are lower
  assert.deepEqual([taps["Together Verbs"], taps["Town & People"], taps["Town & People, part 2"], taps["Faith Words"], taps["Lamp & Box"], taps["Near & Far"]], [158, 43, 115, 100, 28, 55]);
});

test("no stretch of a room between rest stops runs past about REST_EVERY taps", () => {
  for (const r of pack.rooms) {
    const parts = stretches(r, pack.words);
    assert.ok(Math.max(...parts) <= REST_EVERY + 10, `${r.id}: ${parts}`);
    const stops = restStops(r, pack.words);
    assert.deepEqual([...stops].sort((a, b) => a - b), stops, r.id);
    assert.ok(stops.every((s) => s >= 1 && s <= r.steps.length), r.id);
  }
  assert.deepEqual(restStops(pack.rooms.find((r) => r.id === "near-far"), pack.words), [], "short rooms have no rest");
});

test("every step type in the pack has a what-to-do line in English and Urdu", async () => {
  const { keys } = await import("../game/i18n.js");
  const en = new Set(keys("en"));
  const ur = new Set(keys("ur"));
  const types = new Set(pack.rooms.flatMap((r) => r.steps.map((s) => s.type)));
  for (const k of [...types].flatMap((t) => [`how_${t}`, `game_${t}`]).concat(["game_mastery"], ["how_stakes", "how_mastery", "how_rest", "how_done", "how_relight", "how_miss"])) {
    assert.ok(en.has(k) && ur.has(k), k);
  }
});

test("one-time explainers are remembered; junk in `seen` is dropped", async () => {
  const { markSeen } = await import("../game/core/save.js");
  const s = markSeen(markSeen(defaultSave(), "relight"), "relight");
  assert.deepEqual(s.seen, ["relight"]);
  assert.deepEqual(parseSave(serializeSave(s)).save.seen, ["relight"]);
  assert.deepEqual(parseSave(JSON.stringify({ v: 2, seen: ["ok", 5, "BAD ID", "ok"] })).save.seen, ["ok"]);
  assert.deepEqual(parseSave(JSON.stringify({ v: 1 })).save.seen, []);
});

test("every whole ayah in the game carries the credited translation, verbatim from the source files", async () => {
  const { translationOf } = await import("../scripts/lib/pack.mjs");
  for (const r of pack.rooms) for (const s of r.steps) {
    for (const a of s.type === "ayah" ? [s] : s.type === "passage" ? s.ayat : []) {
      if (a.end === false) { assert.equal(a.tr, undefined, `${r.id} ${a.ref} part`); continue; }
      assert.deepEqual(a.tr, translationOf(a.ref), `${r.id} ${a.ref}`);
    }
  }
  assert.match(pack.credits.translation, /Yusuf Ali/);
  assert.match(pack.credits.translation, /Junagarhi/);
  assert.ok(pack.rooms.every((r) => r.steps.every((s) => !/[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(JSON.stringify(s.tr ?? s.ayat?.map((a) => a.tr) ?? "")))),
    "no one-glyph presentation forms (ﻻ) in the shown translations");
});

test("the pack ships split by wing: every file under 512 KiB, nothing lost, Guide types listed", () => {
  for (const f of readdirSync(new URL("../game/content/", import.meta.url))) {
    assert.ok(statSync(contentFile(f)).size < 512 * 1024, `${f} is over 512 KiB`);
  }
  assert.ok(base.rooms.every((r) => !("steps" in r)), "the boot pack has no steps");
  const again = splitPack(pack);
  assert.deepEqual(again.base, base, "splitting the joined pack gives the shipped boot pack");
  assert.deepEqual(Object.keys(again.wings).map(Number), Object.keys(wingFiles).map(Number));
  assert.deepEqual(new Set(base.stepTypes), new Set(pack.rooms.flatMap((r) => r.steps.map((s) => s.type))));
  assert.throws(() => withSteps({ id: "nope", wing: 1 }, wingFiles[1]), /no steps for room nope/);
});

test("each wing file is fetched once; a failed fetch is tried again next time", async () => {
  const calls = [];
  let fail = true;
  const load = wingLoader(async (path) => {
    calls.push(path);
    if (fail) { fail = false; throw new Error("offline"); }
    return wingFiles[1];
  });
  const header = base.rooms[0];
  await assert.rejects(load(header), /offline/);
  const a = await load(header);
  const b = await load(base.rooms[1]);
  assert.equal(a.steps.length, pack.rooms[0].steps.length);
  assert.equal(b.id, base.rooms[1].id);
  assert.deepEqual(calls, ["content/wing-1.json", "content/wing-1.json"]);
});

test("Tanzil's notice ships unchanged with every file that carries the Qur'an text, and the credits name every source", async () => {
  const { tanzilNotice } = await import("../scripts/lib/pack.mjs");
  const notice = tanzilNotice();
  assert.match(notice, /CHANGING IT IS NOT ALLOWED/);
  assert.equal(base.notice, notice);
  for (const w of Object.keys(wingFiles)) assert.equal(wingFiles[w]._notice, notice, `wing-${w}.json`);
  assert.ok(readFileSync(new URL("../game/TANZIL-NOTICE.txt", import.meta.url), "utf8").includes(notice));
  for (const k of ["quran", "translation", "words", "art", "fonts"]) assert.ok(base.credits[k], k);
  assert.match(base.credits.words, /Quranic Arabic Corpus/);
});

test("milestones: only what this room's finish reached, each once", async () => {
  const { reached, newMilestones } = await import("../game/core/milestones.js");
  const upTo = (id) => Object.fromEntries(pack.rooms.slice(0, pack.rooms.findIndex((r) => r.id === id) + 1).map((r) => [r.id, 1]));
  assert.deepEqual(newMilestones(pack, {}, { fatiha: 1 }), [], "half the surah is not the milestone");
  const four = { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1 };
  assert.deepEqual(newMilestones(pack, { fatiha: 1 }, four), [], "four of the five rooms is not the milestone");
  assert.deepEqual(newMilestones(pack, four, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 }), ["fatiha"]);
  assert.deepEqual(newMilestones(pack, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 }, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "fatiha-2b": 1, "fatiha-2c": 1 }), [], "a replay reaches nothing new");
  const wing1Last = pack.rooms.filter((r) => r.wing === 1).at(-1).id;
  const beforeLast = upTo(pack.rooms[pack.rooms.findIndex((r) => r.id === wing1Last) - 1].id);
  assert.deepEqual(newMilestones(pack, beforeLast, upTo(wing1Last)), ["wing-1"]);
  assert.deepEqual(newMilestones(pack, beforeLast, upTo(wing1Last), ["m:wing-1"]), [], "seen cards never come back");
  const all = Object.fromEntries(pack.rooms.map((r) => [r.id, 1]));
  assert.deepEqual(reached(pack, all), ["fatiha", "wing-1", "wing-2", "wing-3", "wing-4", "wing-5", "cov-50", "cov-75", "cov-85"]);
  const ids = reached(pack, all).map((id) => `m:${id}`);
  const s = { ...defaultSave(), seen: ["relight", ...ids] };
  assert.deepEqual(parseSave(serializeSave(s)).save.seen, ["relight", ...ids], "milestone ids survive the save");
});

test("milestone and sound text exists in English and Urdu", async () => {
  const { keys } = await import("../game/i18n.js");
  for (const code of ["en", "ur"]) {
    const have = new Set(keys(code));
    for (const k of ["sound", "readPage", "readNextPage", "how_reread", "readFaded", "readBright", "ms_label", "ms_fatihaT", "ms_fatiha", "ms_wingT", "ms_wing", "ms_covT", "ms_cov", "ms_covGoal"]) assert.ok(have.has(k), `${code} ${k}`);
  }
  assert.equal(defaultSave().settings.sound, true);
  assert.equal(parseSave(serializeSave({ ...defaultSave(), settings: { ...defaultSave().settings, sound: false } })).save.settings.sound, false);
});
