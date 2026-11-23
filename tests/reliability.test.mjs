// Phase A of docs/AUDIT_2026-11-23.md: progress is never lost. The SDK bridge, boot decisions, the save queue,
// pause-saves and the failure paths, with a fake SDK and a clock the tests move by hand.
import { test } from "node:test";
import { bootOutcome, createScreens } from "../game/core/boot.js";
import { setPaused, later as gameLater, realLater } from "../game/core/clock.js";
import { toBack, RELIGHT_FAILS_BEFORE_LEAVING } from "../game/core/srs.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fakeClock } from "./helpers/fake-clock.mjs";
import { createPlayables, LoadError, LOAD_RETRY_MS, LOAD_TIMEOUT_MS, SAVE_TIMEOUT_MS, LANG_TIMEOUT_MS } from "../game/playables-bridge.js";
import { withTimeout, withRetry, TimeoutError } from "../game/core/async.js";
import { makeFetchJson, FETCH_TIMEOUT_MS, FETCH_RETRY_MS } from "../game/core/net.js";
import { createSaver, everyNth, onlyNew, SAVE_RETRY_MS, FAILS_BEFORE_NOTICE } from "../game/core/saver.js";
import { defaultSave, parseSave, serializeSave, setCheckpoint, checkpointFor, setCards, markSeen, SAVE_VERSION } from "../game/core/save.js";
import { roomWon, cardGraded, repairSave } from "../game/core/progress.js";
import { newCard, grade, isDue, dueCards, clampDue, LEVEL_DAYS } from "../game/core/srs.js";
import { missingCards, startSession, record, finishRoom } from "../game/core/room.js";
import { warmUpWords } from "../game/core/warmup.js";
import { startMastery, answer, snapshot, resumeMastery, isMastered, direction } from "../game/core/mastery.js";
import { splitPack, withSteps, wingLoader, buildId } from "../game/core/content.js";
import { isOwnError } from "../game/core/oops.js";
import { tipShowMs, TIP_MIN_MS, TIP_MAX_MS } from "../game/core/reading.js";
import { masteryWords } from "../game/core/taps.js";

const readJson = (name) => JSON.parse(readFileSync(new URL(`../game/content/${name}`, import.meta.url)));
const base = readJson("pack.json");
const wingFiles = Object.fromEntries([...new Set(base.rooms.map((r) => r.wing))].map((w) => [w, readJson(`wing-${w}.json`)]));
const pack = { ...base, rooms: base.rooms.map((r) => withSteps(r, wingFiles[r.wing], base.build)) };
const never = () => new Promise(() => {});

/** A stand-in for `ytgame`: scripted loadData / saveData / getLanguage answers, and a record of what was stored. */
function fakeSdk({ load = [], saves = [], lang = async () => "ur-PK", stored = "" } = {}) {
  const sdk = {
    IN_PLAYABLES_ENV: true,
    stored,
    calls: { load: 0, save: 0, warn: 0, error: 0 },
    game: {
      loadData() { sdk.calls.load += 1; const step = load.shift(); return step ? step() : Promise.resolve(sdk.stored); },
      saveData(value) {
        sdk.calls.save += 1;
        const step = saves.shift();
        if (step) return step(value);
        sdk.stored = value;
        return Promise.resolve();
      },
    },
    system: { getLanguage: lang, onPause: () => () => {}, onResume: () => () => {} },
    health: { logWarning() { sdk.calls.warn += 1; }, logError() { sdk.calls.error += 1; } },
  };
  return sdk;
}
const fail = () => Promise.reject(new Error("API_UNAVAILABLE"));
const bridge = (sdk, clock) => createPlayables({ sdk, wait: clock.wait, later: clock.later, saveLater: clock.later });
/** Run a promise to its end while moving the fake clock forward. */
async function settleWith(clock, promise, ms = 60_000) {
  let result;
  promise.then((value) => { result = { value }; }, (error) => { result = { error }; });
  await clock.advance(ms);
  assert.ok(result, "the promise settled");
  return result;
}

// ---- time limits and retries

test("withTimeout passes a result through, and ends a promise that never settles", async () => {
  const clock = fakeClock();
  assert.equal(await withTimeout(Promise.resolve(7), 100, clock.later), 7);
  assert.equal(clock.pending, 0, "the timer is dropped once the promise settled");
  await assert.rejects(withTimeout(Promise.reject(new Error("no")), 100, clock.later), /no/);
  const hung = await settleWith(clock, withTimeout(never(), 100, clock.later), 100);
  assert.ok(hung.error instanceof TimeoutError);
});

test("withRetry waits between tries and throws the last failure", async () => {
  const clock = fakeClock();
  let tries = 0;
  const flaky = () => { tries += 1; return tries < 3 ? Promise.reject(new Error(`try ${tries}`)) : Promise.resolve("ok"); };
  assert.deepEqual(await settleWith(clock, withRetry(flaky, [10, 20], { wait: clock.wait })), { value: "ok" });
  assert.equal(tries, 3);
  tries = -10;
  const out = await settleWith(clock, withRetry(flaky, [10, 20], { wait: clock.wait }));
  assert.match(out.error.message, /try -7/, "three tries, then the last error");
});

// ---- the SDK bridge

test("no save is written before the cloud save has loaded", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ stored: "OLD" });
  const p = bridge(sdk, clock);
  assert.equal(p.canSave, false);
  assert.equal(await p.saveData("NEW"), false);
  assert.equal(sdk.stored, "OLD");
  assert.equal(sdk.calls.save, 0);
  assert.equal(await p.loadData(), "OLD");
  assert.equal(p.canSave, true);
  assert.equal(await p.saveData("NEW"), true);
  assert.equal(sdk.stored, "NEW");
});

test("loadData is tried again after one or two failures, with a wait between tries", async () => {
  for (const failures of [1, 2]) {
    const clock = fakeClock();
    const sdk = fakeSdk({ load: Array.from({ length: failures }, () => fail), stored: "SAVE" });
    const p = bridge(sdk, clock);
    const out = await settleWith(clock, p.loadData());
    assert.equal(out.value, "SAVE", `${failures} failures`);
    assert.equal(sdk.calls.load, failures + 1);
    assert.equal(sdk.calls.warn, failures);
    assert.equal(p.canSave, true);
  }
});

test("a load that fails every time rejects (never an empty save) and keeps saving off until a later load works", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ load: [fail, fail, fail], stored: "REAL PROGRESS" });
  const p = bridge(sdk, clock);
  const out = await settleWith(clock, p.loadData());
  assert.ok(out.error instanceof LoadError, "the caller can tell a failed load from an empty save");
  assert.equal(sdk.calls.load, LOAD_RETRY_MS.length + 1);
  assert.equal(p.canSave, false);
  assert.equal(await p.saveData("EMPTY GAME"), false);
  assert.equal(sdk.stored, "REAL PROGRESS", "defaults never overwrite the player's save");
  // Try again: the next load works, and saving is on again
  assert.equal((await settleWith(clock, p.loadData())).value, "REAL PROGRESS");
  assert.equal(p.canSave, true);
});

test("a loadData that never answers runs out of time instead of freezing the loading screen", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ load: [never, never, never] });
  const p = bridge(sdk, clock);
  let settled = false;
  const loading = p.loadData().catch((e) => { settled = true; return e; });
  await clock.advance(LOAD_TIMEOUT_MS - 1);
  assert.equal(sdk.calls.load, 1);
  await clock.advance((LOAD_TIMEOUT_MS + 2000) * 3);
  assert.equal(settled, true);
  assert.ok((await loading) instanceof LoadError);
  assert.equal(sdk.calls.load, 3);
  assert.equal(p.canSave, false);
});

test("a hung first try followed by an answer still loads", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ load: [never], stored: "SAVE" });
  assert.equal((await settleWith(clock, bridge(sdk, clock).loadData())).value, "SAVE");
});

test("saveData reports failure for a rejection or no answer, and success after", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ saves: [fail, never] });
  const p = bridge(sdk, clock);
  await p.loadData();
  assert.equal(await p.saveData("A"), false);
  assert.equal(sdk.calls.error, 1);
  const hung = await settleWith(clock, p.saveData("B"), SAVE_TIMEOUT_MS);
  assert.equal(hung.value, false, "no answer in time counts as not saved");
  assert.equal(await p.saveData("C"), true);
  assert.equal(sdk.stored, "C");
});

test("an unreadable save blocks writing; the stored data is left as it is", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ stored: "{not json" });
  const p = bridge(sdk, clock);
  const parsed = parseSave(await p.loadData());
  assert.equal(parsed.blocked, true);
  p.blockSaves();
  assert.equal(p.canSave, false);
  assert.equal(await p.saveData(serializeSave(parsed.save)), false);
  assert.equal(sdk.stored, "{not json");
});

test("getLanguage: YouTube's answer, or English when it fails, hangs or is not a string", async () => {
  const clock = fakeClock();
  assert.equal(await bridge(fakeSdk(), clock).getLanguage(), "ur-PK");
  assert.equal(await bridge(fakeSdk({ lang: fail }), clock).getLanguage(), "en");
  assert.equal(await bridge(fakeSdk({ lang: async () => null }), clock).getLanguage(), "en");
  const hung = await settleWith(clock, bridge(fakeSdk({ lang: never }), clock).getLanguage(), LANG_TIMEOUT_MS);
  assert.equal(hung.value, "en");
});

test("outside Playables the save lives in local storage, and blocked storage is a failed save, not a crash", async () => {
  const kept = new Map();
  const storage = { getItem: (k) => kept.get(k) ?? null, setItem: (k, v) => { kept.set(k, v); } };
  const p = createPlayables({ storage: () => storage });
  assert.equal(await p.loadData(), "");
  assert.equal(await p.saveData("X"), true);
  assert.equal(await p.loadData(), "X");
  const locked = createPlayables({ storage: () => { throw new Error("SecurityError"); } });
  assert.equal(await locked.loadData(), "");
  assert.equal(await locked.saveData("X"), false);
  assert.equal(await locked.getLanguage(), "en");
});

test("firstFrameReady and gameReady reach YouTube once each", () => {
  const sent = [];
  const sdk = { IN_PLAYABLES_ENV: true, game: { firstFrameReady: () => sent.push("first"), gameReady: () => sent.push("ready") } };
  const p = createPlayables({ sdk });
  p.firstFrameReady(); p.firstFrameReady(); p.gameReady(); p.gameReady();
  assert.deepEqual(sent, ["first", "ready"]);
});

// ---- the save queue

/** A scripted cloud: each write waits until the test lets it through or fails it. */
function fakeCloud() {
  const cloud = { stored: null, order: [], open: [] };
  cloud.write = (value) => new Promise((resolve) => { cloud.open.push({ value, ok: () => { cloud.stored = value; cloud.order.push(value); resolve(true); }, fail: () => resolve(false) }); });
  return cloud;
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test("writes go one at a time and the newest state always lands last", async () => {
  const clock = fakeClock();
  const cloud = fakeCloud();
  const saver = createSaver({ write: cloud.write, later: clock.later });
  saver.request("s1");
  saver.request("s2");
  saver.request("s3");
  assert.equal(cloud.open.length, 1, "only one write in flight");
  cloud.open.shift().ok();
  await tick();
  assert.equal(cloud.open.length, 1);
  assert.equal(cloud.open[0].value, "s3", "s2 was replaced by s3 before it was ever sent");
  cloud.open.shift().ok();
  await saver.idle();
  assert.deepEqual(cloud.order, ["s1", "s3"]);
  assert.equal(saver.unsaved, false);
});

test("a failed write is tried again with growing waits; the notice comes only after repeated failure and goes on success", async () => {
  const clock = fakeClock();
  const cloud = fakeCloud();
  const notices = [];
  const saver = createSaver({ write: cloud.write, later: clock.later, onFailing: (on) => notices.push(on) });
  saver.request("room won");
  for (let n = 1; n <= FAILS_BEFORE_NOTICE; n++) {
    cloud.open.shift().fail();
    await tick();
    assert.deepEqual(notices, n < FAILS_BEFORE_NOTICE ? [] : [true], `after failure ${n}`);
    assert.equal(cloud.open.length, 0, "the retry waits");
    await clock.advance(SAVE_RETRY_MS[n - 1] - 1);
    assert.equal(cloud.open.length, 0);
    await clock.advance(1);
    assert.equal(cloud.open.length, 1, `retry ${n} is sent`);
  }
  assert.equal(saver.failing, true);
  cloud.open.shift().ok();
  await saver.idle();
  assert.deepEqual(notices, [true, false]);
  assert.equal(cloud.stored, "room won");
});

test("a retry sends the newest state, and a pause flushes without waiting for the retry delay", async () => {
  const clock = fakeClock();
  const cloud = fakeCloud();
  const saver = createSaver({ write: cloud.write, later: clock.later });
  saver.request("old");
  cloud.open.shift().fail();
  await tick();
  assert.equal(cloud.open.length, 0);
  saver.flush(); // YouTube pauses the game
  await tick();
  assert.equal(cloud.open.length, 1, "the pause tries at once");
  cloud.open.shift().fail();
  await tick();
  saver.request("new");
  await tick();
  assert.equal(cloud.open.at(-1).value, "new");
  cloud.open.shift().ok();
  await saver.idle();
  assert.equal(cloud.stored, "new");
  assert.equal(clock.pending, 0, "no retry is left waiting");
});

test("a pause while a write is on its way sends the latest state right after it", async () => {
  const clock = fakeClock();
  const cloud = fakeCloud();
  const saver = createSaver({ write: cloud.write, later: clock.later });
  saver.request("answer 4");
  saver.request("answer 5"); // arrives while the first write is in flight
  saver.flush(); // pause
  assert.equal(cloud.open.length, 1, "still one write at a time");
  cloud.open.shift().ok();
  await tick();
  cloud.open.shift().ok();
  await saver.idle();
  assert.deepEqual(cloud.order, ["answer 4", "answer 5"]);
});

test("a write that throws counts as a failure", async () => {
  const clock = fakeClock();
  let calls = 0;
  const saver = createSaver({ write: async () => { calls += 1; if (calls === 1) throw new Error("boom"); return true; }, later: clock.later });
  saver.request("x");
  await tick();
  assert.equal(saver.unsaved, true);
  await clock.advance(SAVE_RETRY_MS[0]);
  await saver.idle();
  assert.equal(calls, 2);
});

test("everyNth: the cloud gets the save every few answers, not after each one", () => {
  const few = everyNth(4);
  assert.deepEqual(Array.from({ length: 9 }, () => few.tick()), [false, false, false, true, false, false, false, true, false]);
  few.reset();
  assert.deepEqual([few.tick(), few.tick(), few.tick(), few.tick()], [false, false, false, true]);
});

// ---- the bridge and the queue together (what main.js wires up)

test("pause-save through the bridge: a save that fails during play is stored when the game is paused", async () => {
  const clock = fakeClock();
  const sdk = fakeSdk({ saves: [fail] });
  const p = bridge(sdk, clock);
  await p.loadData();
  const saver = createSaver({ write: (v) => p.saveData(v), later: clock.later });
  saver.request("lamp lit");
  await tick();
  assert.equal(sdk.stored, "", "the first write failed");
  saver.flush(); // onPause
  await saver.idle();
  assert.equal(sdk.stored, "lamp lit");
});

// ---- winning a room, Relight and warm-up answers reach the save as they happen

test("a room is saved the moment it is won: closing the game on the 'Room lamp lit' card keeps the lamp and the cards", () => {
  const room = pack.rooms[0];
  const at = { room: room.id, step: room.steps.length, steps: room.steps.length, results: {}, met: [] };
  let save = setCheckpoint(defaultSave(), at);
  let session = startSession();
  for (const id of room.teaches) session = record(session, [id], "easy");
  // onFinished runs before the done card is drawn; the player never taps ▶
  save = roomWon(save, room.id, finishRoom(session, room, save.cards, 100));
  const back = parseSave(serializeSave(save)).save; // the pause-save, loaded next time
  assert.equal(back.rooms[room.id], 1, "the room is done");
  assert.equal(back.at, null, "its checkpoint is gone");
  assert.deepEqual(Object.keys(back.cards).sort(), [...room.teaches].sort(), "every word card is stored");
  assert.equal(checkpointFor(back, room), null);
});

test("Relight and warm-up answers are in the save as they are graded, so a pause mid-session keeps them", () => {
  const ids = pack.rooms[0].teaches.slice(0, 3);
  let save = setCards(defaultSave(), ids.map((id) => grade(newCard(id, 10), "easy", 10, "meet")));
  assert.equal(dueCards(Object.values(save.cards), 10).length, 3);
  save = cardGraded(save, grade(save.cards[ids[0]], "easy", 10, "toPic"));
  save = cardGraded(save, grade(save.cards[ids[1]], "wrong", 10, "toWord"));
  // the game is paused and closed here: no end button was pressed
  const back = parseSave(serializeSave(save)).save;
  assert.equal(back.cards[ids[0]].level, 2);
  assert.equal(back.cards[ids[1]].lapses, 1);
  assert.deepEqual(dueCards(Object.values(back.cards), 10).map((c) => c.id).sort(), [ids[1], ids[2]].sort(), "the relit lamp is not asked again");
  assert.deepEqual(warmUpWords(back.cards, 10, pack.words).includes(ids[0]), false);
});

// ---- the Last Check keeps its place

test("a Last Check checkpoint round-trips, and the check resumes with lit words lit and half-way words half way", () => {
  const room = pack.rooms.find((r) => masteryWords(r, pack.words).length >= 6);
  const ids = masteryWords(room, pack.words);
  let state = startMastery(ids);
  // first word right twice (done), second right once (half way), third missed
  const play = (id, outcome) => { state = answer({ ...state, queue: [id, ...state.queue.filter((x) => x !== id)] }, outcome); };
  play(ids[0], "right"); play(ids[0], "right"); play(ids[1], "right"); play(ids[2], "wrong");
  const snap = snapshot(state);
  assert.deepEqual(snap, { done: [ids[0]], half: [ids[1]] });
  const at = { room: room.id, step: room.steps.length, steps: room.steps.length, results: { [ids[2]]: "wrong" }, met: [], mastery: snap };
  const back = parseSave(serializeSave(setCheckpoint(defaultSave(), at))).save;
  assert.equal(back.v, SAVE_VERSION);
  assert.deepEqual(checkpointFor(back, room), at);
  const resumed = resumeMastery(ids, back.at.mastery);
  assert.deepEqual(resumed.done, [ids[0]]);
  assert.equal(resumed.queue.includes(ids[0]), false, "a lit word is not asked again");
  assert.equal(resumed.streak[ids[1]], 1);
  assert.equal(direction(resumed, ids[1]), "toWord", "the half-way word is asked the other way round");
  assert.equal(resumed.streak[ids[2]], 0);
  let rest = resumed;
  let answersLeft = 0;
  while (!isMastered(rest)) { rest = answer(rest, "right"); answersLeft += 1; }
  assert.equal(answersLeft, ids.length * 2 - 3, "only what was still owed");
  assert.deepEqual([...rest.done].sort(), [...ids].sort());
});

test("resumeMastery: no snapshot is a fresh check; ids the room no longer has are ignored; all lit is finished", () => {
  assert.deepEqual(resumeMastery(["a", "b"], null), startMastery(["a", "b"]));
  const odd = resumeMastery(["a", "b"], { done: ["gone", "a"], half: ["a", "zzz"] });
  assert.deepEqual(odd.done, ["a"]);
  assert.deepEqual(odd.queue, ["b"]);
  assert.equal(isMastered(resumeMastery(["a", "b"], { done: ["a", "b"], half: [] })), true);
});

test("save v4: older saves migrate with no Last Check state; junk in it is dropped; it only counts at the check", () => {
  for (const v of [1, 2, 3]) {
    const p = parseSave(JSON.stringify({ v, rooms: { "near-far": 1 }, cards: { "w:ok": [1, 5, 1, 0, null] }, intro: true, at: { r: "x", s: 2, n: 2, m: { d: ["w:a"] } } }));
    assert.equal(p.blocked, false, `v${v}`);
    assert.equal(p.reason, null);
    assert.equal(p.save.v, SAVE_VERSION);
    assert.deepEqual(p.save.rooms, { "near-far": 1 });
    assert.equal(p.save.cards["w:ok"].level, 1);
    assert.equal(parseSave(serializeSave(p.save)).save.v, SAVE_VERSION);
  }
  assert.equal(parseSave(JSON.stringify({ v: 1, at: { r: "x", s: 2, n: 2 } })).save.at, null, "v1 never had checkpoints");
  assert.equal("mastery" in parseSave(JSON.stringify({ v: 3, at: { r: "x", s: 2, n: 2 } })).save.at, false);
  const at = (a) => parseSave(JSON.stringify({ v: 4, at: a })).save.at;
  assert.deepEqual(at({ r: "x", s: 2, n: 2, m: { d: ["w:a", "w:a", 5, "BAD ID"], h: ["w:a", "w:b"] } }).mastery, { done: ["w:a"], half: ["w:b"] });
  assert.deepEqual(at({ r: "x", s: 2, n: 2, m: {} }).mastery, { done: [], half: [] });
  assert.equal("mastery" in at({ r: "x", s: 1, n: 2, m: { d: ["w:a"] } }), false, "not at the check yet");
  assert.equal("mastery" in at({ r: "x", s: 2, n: 2, m: "nope" }), false);
});

test("a save from a newer version, or one that cannot be read, is blocked with the reason and never replaced", () => {
  const newer = parseSave(JSON.stringify({ v: SAVE_VERSION + 1, rooms: { fatiha: 1 } }));
  assert.deepEqual([newer.blocked, newer.reason], [true, "newer"]);
  for (const raw of ["{bad", "[]", "null", "7", JSON.stringify({ v: "4" }), JSON.stringify({ v: 0 }), JSON.stringify({ rooms: {} })]) {
    const p = parseSave(raw);
    assert.deepEqual([p.blocked, p.reason], [true, "corrupt"], raw);
    assert.deepEqual(p.save, defaultSave());
  }
  assert.deepEqual([parseSave("").blocked, parseSave("").reason], [false, null], "nothing saved yet is a new player");
});

// ---- repairs on load

test("a card restored for a finished room is really due, so Relight and the warm-up bring it back", () => {
  const room = pack.rooms[1];
  const cards = Object.fromEntries(room.teaches.slice(1).map((id) => [id, grade(newCard(id, 1), "easy", 1, "meet")]));
  const [restored] = missingCards(pack, { [room.id]: 1 }, cards, 50);
  assert.equal(restored.id, room.teaches[0]);
  assert.equal(restored.level, 1);
  assert.equal(isDue(restored, 50), true);
  assert.equal(dueCards([restored], 50).length, 1);
});

test("a wrong device date cannot push reviews far away: due days are pulled back on load", () => {
  const far = { ...newCard("w:a", 400), level: 3, due: 400 + 365 };
  assert.equal(clampDue(far, 400).due, 400 + LEVEL_DAYS[3]);
  const fine = { ...newCard("w:b", 400), level: 3, due: 401 };
  assert.equal(clampDue(fine, 400), fine, "a normal card is not touched");
  const overdue = { ...newCard("w:c", 400), level: 2, due: 3 };
  assert.equal(clampDue(overdue, 400), overdue);
  const room = pack.rooms[0];
  const cards = room.teaches.map((id, i) => ({ ...grade(newCard(id, 400), "easy", 400, "meet"), level: 2, due: i === 0 ? 9000 : 401 }));
  const save = setCards({ ...defaultSave(), rooms: { [room.id]: 1 } }, cards);
  const fixed = repairSave(pack, save, 400);
  assert.equal(fixed.cards[room.teaches[0]].due, 401);
  assert.equal(fixed.cards[room.teaches[1]], save.cards[room.teaches[1]]);
  assert.equal(repairSave(pack, fixed, 400), fixed, "a sound save comes back as the same object (no needless write)");
  const { [room.teaches[0]]: dropped, ...others } = fixed.cards;
  assert.ok(dropped);
  assert.equal(isDue(repairSave(pack, { ...fixed, cards: others }, 400).cards[room.teaches[0]], 400), true, "a missing card comes back due");
});

// ---- content files

test("every wing file carries the pack's build id; a wing file from another build is refused", () => {
  assert.match(base.build, /^[0-9a-z]+$/);
  assert.equal(base.build, buildId(pack.rooms), "the id is the hash of the rooms");
  for (const [w, file] of Object.entries(wingFiles)) assert.equal(file._build, base.build, `wing-${w}.json`);
  const header = base.rooms[0];
  assert.equal(withSteps(header, wingFiles[header.wing], base.build).steps.length, pack.rooms[0].steps.length);
  assert.throws(() => withSteps(header, { ...wingFiles[header.wing], _build: "old" }, base.build), /built for another pack/);
  assert.throws(() => withSteps(header, { [header.id]: [] }, base.build), /built for another pack/, "a wing file with no id at all");
  const changed = pack.rooms.map((r, i) => (i ? r : { ...r, steps: r.steps.slice(1) }));
  assert.notEqual(buildId(changed), base.build, "any step change gives a new id");
  assert.equal(splitPack(pack).base.build, base.build, "splitting again gives the same id");
});

test("a stale wing file is asked for once more past the cache, then refused; the door can be tried again", async () => {
  const header = base.rooms[0];
  const stale = { ...wingFiles[header.wing], _build: "old" };
  const calls = [];
  let healed = false;
  const load = wingLoader(async (path) => {
    calls.push(path);
    return path.includes("?v=") || healed ? wingFiles[header.wing] : stale;
  }, base.build);
  assert.equal((await load(header)).id, header.id, "the second copy is the right one");
  assert.deepEqual(calls, ["content/wing-1.json", `content/wing-1.json?v=${base.build}`]);
  const alwaysStale = wingLoader(async (path) => { calls.push(path); return healed ? wingFiles[header.wing] : stale; }, base.build);
  await assert.rejects(alwaysStale(header), /built for another pack/);
  healed = true;
  assert.equal((await alwaysStale(header)).id, header.id, "a wrong file is not kept: the next tap fetches again");
});

test("a file load that hangs or fails is tried again, then rejects so the screen can say 'try again'", async () => {
  const clock = fakeClock();
  const json = (data) => ({ ok: true, json: async () => data });
  let script = [never, () => Promise.reject(new Error("offline")), () => Promise.resolve(json({ fine: true }))];
  const calls = [];
  const fetchJson = makeFetchJson({ fetch: (path, opts) => { calls.push(opts?.signal); return script.shift()(); }, later: clock.later, wait: clock.wait });
  const ok = await settleWith(clock, fetchJson("content/pack.json"));
  assert.deepEqual(ok.value, { fine: true });
  assert.equal(calls.length, 3);
  assert.equal(calls[0].aborted, true, "the request that ran out of time was cancelled");
  script = [never, never, never];
  const dead = await settleWith(clock, fetchJson("content/wing-2.json"), (FETCH_TIMEOUT_MS + 2000) * (FETCH_RETRY_MS.length + 1));
  assert.ok(dead.error instanceof TimeoutError);
  script = Array.from({ length: 3 }, () => () => Promise.resolve({ ok: false, status: 404 }));
  assert.match((await settleWith(clock, fetchJson("content/wing-9.json"))).error.message, /HTTP 404/);
});

test("a wing fetch that never answers ends, and the next door tap fetches again (the door is not dead)", async () => {
  const clock = fakeClock();
  const json = (data) => ({ ok: true, json: async () => data });
  let online = false;
  let fetches = 0;
  const fetchJson = makeFetchJson({ fetch: () => { fetches += 1; return online ? Promise.resolve(json(wingFiles[1])) : never(); }, later: clock.later, wait: clock.wait });
  const load = wingLoader(fetchJson, base.build);
  const header = base.rooms[0];
  const first = load(header);
  const second = load(header); // a double tap shares the one fetch
  const out = await settleWith(clock, Promise.allSettled([first, second]));
  assert.deepEqual(out.value.map((r) => r.status), ["rejected", "rejected"]);
  assert.equal(fetches, FETCH_RETRY_MS.length + 1, "one set of tries for both taps");
  online = true;
  assert.equal((await settleWith(clock, load(header))).value.id, header.id);
});

// ---- small guards

test("only the game's own uncaught errors bring up the 'Something went wrong' card", () => {
  const baseUrl = "https://example.test/game/";
  assert.equal(isOwnError({ filename: `${baseUrl}ui/steps/scene.js`, message: "x is undefined" }, baseUrl), true);
  assert.equal(isOwnError({ stack: `TypeError: x\n    at run (${baseUrl}ui/room.js:10:5)`, name: "TypeError" }, baseUrl), true);
  assert.equal(isOwnError({ filename: "https://www.youtube.com/game_api/v1", message: "boom" }, baseUrl), false);
  assert.equal(isOwnError({ filename: "", message: "Script error." }, baseUrl), false);
  assert.equal(isOwnError({ filename: `${baseUrl}ui/fit.js`, message: "ResizeObserver loop completed with undelivered notifications." }, baseUrl), false);
  assert.equal(isOwnError({ stack: `AbortError\n at ${baseUrl}core/net.js`, name: "AbortError" }, baseUrl), false);
  assert.equal(isOwnError({ stack: "Error: x\n at chrome-extension://abc/content.js", name: "Error" }, baseUrl), false);
  assert.equal(isOwnError({}, baseUrl), false);
  assert.equal(isOwnError(null, baseUrl), false);
});

test("a tooltip stays up long enough to read: short labels 2.2 s, longer text longer, never for good", () => {
  assert.equal(tipShowMs("Sky"), TIP_MIN_MS);
  assert.equal(tipShowMs(""), TIP_MIN_MS);
  const long = "Mastery lamp: two dots fill when you get the word right twice in a row; a miss empties it";
  assert.ok(tipShowMs(long) > 6000 && tipShowMs(long) < TIP_MAX_MS, String(tipShowMs(long)));
  assert.ok(tipShowMs(long) > tipShowMs(long.slice(0, 40)));
  assert.equal(tipShowMs("x".repeat(2000)), TIP_MAX_MS);
});

test("every new player-facing line of this phase exists in English and Urdu, and the screens use no bare text", async () => {
  const { keys } = await import("../game/i18n.js");
  const added = ["saveLoadError", "saveUnreadable", "saveNewer", "playUnsaved", "saveRetry", "doorOpening", "oopsTitle", "oopsSay", "oopsMap", "oopsSkip", "savedOff", "roomLoadError", "retry", "close"];
  for (const code of ["en", "ur"]) for (const k of added) assert.ok(keys(code).includes(k), `${code} ${k}`);
  for (const f of ["ui/oops.js", "ui/notice.js"]) {
    const code = readFileSync(new URL(`../game/${f}`, import.meta.url), "utf8");
    for (const m of code.matchAll(/t\("(\w+)"\)|\["(\w+)", \(\) =>/g)) assert.ok(keys("en").includes(m[1] ?? m[2]), `${f}: ${m[1] ?? m[2]}`);
  }
});

test("the game code keeps its promises: no silent first-run on a failed load, win saved before the done card", () => {
  const read = (f) => readFileSync(new URL(`../game/${f}`, import.meta.url), "utf8");
  const main = read("main.js");
  assert.ok(!/await persist\(/.test(main), "no screen waits for a cloud write");
  assert.match(main, /onFinished/, "the room is saved when it is won");
  assert.match(main, /unhandledrejection/);
  const room = read("ui/room.js");
  assert.ok(room.indexOf("onFinished(out)") > 0 && room.indexOf("onFinished(out)") < room.indexOf('"data-t": "roomLit"'), "onFinished runs before the done card is drawn");
  assert.match(read("ui/keys.js"), /if \(isPaused\(\)\) return;/, "keys do nothing while paused");
  assert.ok(!/localStorage/.test(main), "main.js never touches localStorage");
});

// ---- saving while YouTube has the game paused (a pause is often the end of the session)

test("a save that fails after the pause is still tried again while the game clock is frozen", async () => {
  const paused = fakeClock(); // the game clock: never moved in this test, as between onPause and onResume
  const real = fakeClock();
  const cloud = fakeCloud();
  const saver = createSaver({ write: cloud.write, later: real.later });
  saver.request("room won");
  saver.flush(); // the pause-save
  cloud.open.shift().fail();
  await real.advance(SAVE_RETRY_MS[0]);
  assert.equal(cloud.open.length, 1, "the retry went out without a resume");
  cloud.open.shift().ok();
  await saver.idle();
  assert.equal(cloud.stored, "room won");
  assert.equal(paused.pending, 0, "nothing of the save waits on the game clock");
});

test("realLater runs while the game clock is paused; the game clock's own delays wait for resume", async () => {
  setPaused(true);
  try {
    let frozen = false;
    const cancel = gameLater(() => { frozen = true; }, 1);
    const cloud = fakeCloud();
    const saver = createSaver({ write: cloud.write, later: realLater, retryMs: [5] });
    saver.request("answer 7");
    cloud.open.shift().fail();
    await new Promise((resolve) => realLater(resolve, 40));
    assert.equal(cloud.open.length, 1, "the retry was sent during the pause");
    assert.equal(frozen, false, "a game delay did not run during the pause");
    cloud.open.shift().ok();
    await saver.idle();
    assert.equal(cloud.stored, "answer 7");
    cancel();
  } finally {
    setPaused(false);
  }
});

test("a save that never answers during a pause times out in real time and the retry stores it", async () => {
  const paused = fakeClock(); // frozen game clock
  const real = fakeClock();
  const sdk = fakeSdk({ saves: [never] });
  const p = createPlayables({ sdk, wait: paused.wait, later: paused.later, saveLater: real.later });
  await p.loadData();
  const saver = createSaver({ write: (value) => p.saveData(value), later: real.later });
  saver.request("paused save");
  saver.flush();
  await real.advance(SAVE_TIMEOUT_MS + SAVE_RETRY_MS[0]);
  await saver.idle();
  assert.equal(sdk.stored, "paused save");
  assert.equal(sdk.calls.save, 2);
  assert.equal(paused.pending, 0);
});

// ---- boot: which screen, and never a blank start over a save that was not read

const settled = async (promise) => (await Promise.allSettled([promise]))[0];

test("boot plays a readable save and a new player's empty one", async () => {
  const clock = fakeClock();
  const fresh = bootOutcome({ hasPack: true, loaded: await settled(bridge(fakeSdk(), clock).loadData()) });
  assert.equal(fresh.screen, "play");
  assert.deepEqual(fresh.save, defaultSave());
  const stored = serializeSave(roomWon(defaultSave(), "r1", []));
  const back = bootOutcome({ hasPack: true, loaded: await settled(bridge(fakeSdk({ stored }), clock).loadData()) });
  assert.equal(back.screen, "play");
  assert.ok(back.save.rooms.r1, "the returning player's room is there");
  assert.equal(back.blockSaves, false);
});

test("boot never starts blank when the cloud save did not load: it says so and offers the choice", async () => {
  const clock = fakeClock();
  const p = bridge(fakeSdk({ load: [fail, fail, fail] }), clock);
  const loaded = (await settleWith(clock, settled(p.loadData()))).value;
  const out = bootOutcome({ hasPack: true, loaded });
  assert.equal(out.screen, "saveLoadError");
  assert.equal(out.save, null, "no empty save is handed to the game");
  assert.equal(out.canPlayUnsaved, true);
  assert.equal(p.canSave, false, "and nothing can be written over the unknown save");
  // a failure that is not the bridge's LoadError is still not a blank start
  assert.equal(bootOutcome({ hasPack: true, loaded: { status: "rejected", reason: new Error("x") } }).screen, "bootError");
});

test("boot keeps an unreadable or newer save untouched", () => {
  const corrupt = bootOutcome({ hasPack: true, loaded: { status: "fulfilled", value: "{not json" } });
  assert.deepEqual([corrupt.screen, corrupt.blockSaves, corrupt.save, corrupt.canPlayUnsaved], ["saveUnreadable", true, null, true]);
  const newer = bootOutcome({ hasPack: true, loaded: { status: "fulfilled", value: JSON.stringify({ ...JSON.parse(serializeSave(defaultSave())), v: 999 }) } });
  assert.deepEqual([newer.screen, newer.blockSaves, newer.save], ["saveNewer", true, null]);
});

test("boot without the game's own files is a plain load error with nothing to play", () => {
  const out = bootOutcome({ hasPack: false, loaded: { status: "fulfilled", value: "" } });
  assert.deepEqual([out.screen, out.canPlayUnsaved, out.blockSaves], ["bootError", false, false]);
});

test("the door lock lets one tap through and a new screen releases it", () => {
  const screens = createScreens();
  assert.equal(screens.lock(), true, "the first tap opens the door");
  assert.equal(screens.lock(), false, "the double tap does nothing");
  assert.equal(screens.locked, true);
  screens.unlock();
  assert.equal(screens.lock(), true);
  screens.take();
  assert.equal(screens.locked, false, "the next screen starts unlocked");
});

test("a room that finishes loading after another screen took over does not replace it", () => {
  const screens = createScreens();
  const map = screens.take();
  screens.lock();
  const loading = screens.current; // the door was tapped; its wing is on the way
  assert.ok(screens.owns(loading));
  const relight = screens.take(); // something else took the screen meanwhile
  assert.equal(screens.owns(loading), false, "the late room must stop");
  assert.equal(screens.owns(map), false);
  assert.ok(screens.owns(relight));
});

test("the same save is sent once; a changed one is sent again", () => {
  const unsent = onlyNew();
  const won = roomWon(defaultSave(), "r1", []);
  assert.equal(unsent(won), true);
  assert.equal(unsent(won), false, "leaving the done card does not write the room a second time");
  assert.equal(unsent(markSeen(won, "relight")), true);
});

test("a Relight lamp that cannot be drawn goes to the back and the queue is never emptied", () => {
  assert.deepEqual(toBack(["a", "b", "c"]), ["b", "c", "a"]);
  assert.deepEqual(toBack(["a"]), ["a"], "the only lamp stays due: no 'all lit' card for it");
  assert.deepEqual(toBack([]), []);
  assert.equal(RELIGHT_FAILS_BEFORE_LEAVING, 2);
});

test("the first screen runs under the safety net and the Last Check cannot be skipped", () => {
  const read = (f) => readFileSync(new URL(`../game/${f}`, import.meta.url), "utf8");
  const main = read("main.js");
  assert.ok(!/await begin\(/.test(main), "boot does not hold the first room inside its own try");
  assert.match(main, /if \(pack && save\) return run\(begin\);/, "Try again after boot keeps the save in memory");
  assert.match(main, /later: realLater/, "save retries run in real time");
  assert.match(read("ui/room.js"), /resume: masteryAt, onProgress, gentle \}\);\s*\}, \{ canSkip: false \}\);/);
});
