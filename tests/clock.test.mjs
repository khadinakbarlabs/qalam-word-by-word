import { test } from "node:test";
import assert from "node:assert/strict";
import { later, wait, setPaused, isPaused } from "../game/core/clock.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("a delay fires after its time when nothing pauses", async () => {
  let fired = false;
  later(() => { fired = true; }, 20);
  await sleep(40);
  assert.equal(fired, true);
});

test("pause freezes every delay and resume carries on with the time that was left", async () => {
  let fired = false;
  const done = wait(60).then(() => { fired = true; });
  await sleep(20);
  setPaused(true);
  assert.equal(isPaused(), true);
  await sleep(90); // well past the original 60 ms: still frozen
  assert.equal(fired, false, "nothing advances while paused");
  setPaused(false);
  await sleep(10);
  assert.equal(fired, false, "about 40 ms were still owed after resume");
  await done;
  assert.equal(fired, true);
});

test("a delay started during a pause waits for resume, and a cancelled delay never fires", async () => {
  setPaused(true);
  let late = false;
  later(() => { late = true; }, 5);
  await sleep(30);
  assert.equal(late, false);
  setPaused(false);
  await sleep(30);
  assert.equal(late, true);

  let cancelled = false;
  const cancel = later(() => { cancelled = true; }, 15);
  cancel();
  await sleep(35);
  assert.equal(cancelled, false);
});
