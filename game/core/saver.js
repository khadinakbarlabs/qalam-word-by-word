// The save queue (pure). Every cloud write goes through here:
//   one write at a time, in order  → an older state can never land after a newer one
//   the newest state always wins   → states that arrive while a write is running replace each other; only the last is sent
//   a failed write is tried again  → after a growing wait (real time: main.js passes clock.js realLater, so it also runs while YouTube has the game paused), and at once on flush() (pause, leaving)
//   onFailing(true)                → after `noticeAfter` failures in a row (main.js shows a small notice);
//   onFailing(false)               → as soon as a write succeeds again
// `write(value)` resolves true when the save was stored; false or a rejection counts as a failure.

export const SAVE_RETRY_MS = [1000, 3000, 8000, 20000];
export const FAILS_BEFORE_NOTICE = 3;

export function createSaver({ write, later, retryMs = SAVE_RETRY_MS, noticeAfter = FAILS_BEFORE_NOTICE, onFailing = () => {} }) {
  let latest = null;
  let dirty = false; // `latest` has not been stored yet
  let inFlight = false;
  let fails = 0;
  let failing = false;
  let cancelRetry = null;
  let waiting = [];

  const setFailing = (on) => {
    if (on === failing) return;
    failing = on;
    onFailing(on);
  };
  const dropRetry = () => { cancelRetry?.(); cancelRetry = null; };
  const settle = () => {
    if (inFlight || dirty) return;
    const done = waiting;
    waiting = [];
    done.forEach((resolve) => resolve());
  };

  async function pump() {
    if (inFlight || !dirty) return;
    dropRetry();
    const value = latest;
    inFlight = true;
    let ok = false;
    try { ok = (await write(value)) === true; } catch { ok = false; }
    inFlight = false;
    if (ok) {
      fails = 0;
      setFailing(false);
      if (latest === value) dirty = false;
      if (dirty) pump(); // a newer state arrived while this one was on its way
      else settle();
      return;
    }
    fails += 1;
    if (fails >= noticeAfter) setFailing(true);
    cancelRetry = later(() => { cancelRetry = null; pump(); }, retryMs[Math.min(fails - 1, retryMs.length - 1)]);
  }

  return {
    /** Store this state (a string). Returns at once; the write happens in the background. */
    request(value) {
      latest = value;
      dirty = true;
      pump();
    },
    /** Try now whatever is still unsaved (YouTube pause, leaving a screen): do not wait for the retry delay. */
    flush() { pump(); },
    /** Resolves once everything asked for has been stored. */
    idle() { return new Promise((resolve) => { waiting.push(resolve); settle(); }); },
    get failing() { return failing; },
    get unsaved() { return dirty; },
  };
}

/** Counts answers; `tick()` is true on every nth one (then starts again), `reset()` starts again early. Used to send
 *  the save every few answers instead of after each one. */
export function everyNth(n) {
  let count = 0;
  return {
    tick() {
      count += 1;
      if (count < n) return false;
      count = 0;
      return true;
    },
    reset() { count = 0; },
  };
}

/** `isNew(value)` is true the first time it is asked about a value and false while it is asked about the same one
 *  again. The save is never mutated, so "the same object" means "nothing new to send": a finished room is one cloud
 *  write, not two. */
export function onlyNew() {
  let last = null;
  return (value) => {
    if (value === last) return false;
    last = value;
    return true;
  };
}
