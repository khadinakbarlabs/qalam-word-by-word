// The game's one clock. Every delay the game waits on (the pause after a right answer, the show-me hand, the first-room
// hint, tooltips, save retries) runs here, so a YouTube pause freezes them where they are and resume carries on with
// the time that was left (Playables INT-21: nothing advances between onPause and onResume). Pure: no DOM.

const timers = new Set();
let paused = false;
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function arm(t) {
  t.started = now();
  t.handle = setTimeout(() => {
    timers.delete(t);
    t.fn();
  }, t.left);
}

/** Run `fn` after `ms` of unpaused time. Returns a function that cancels it. */
export function later(fn, ms) {
  const t = { fn, left: Math.max(0, ms), started: 0, handle: null };
  timers.add(t);
  if (!paused) arm(t);
  return () => {
    clearTimeout(t.handle);
    timers.delete(t);
  };
}

/** Resolves after `ms` of unpaused time. */
export const wait = (ms) => new Promise((resolve) => later(resolve, ms));

/** Freeze (true) or thaw (false) every pending delay. */
export function setPaused(on) {
  if (on === paused) return;
  paused = on;
  for (const t of timers) {
    if (on) {
      clearTimeout(t.handle);
      t.handle = null;
      t.left = Math.max(0, t.left - (now() - t.started));
    } else {
      arm(t);
    }
  }
}

export const isPaused = () => paused;

/** Run `fn` after `ms` of real time, paused or not. Only for what must not wait for resume: a cloud save's time limit
 *  and its retry, because a pause is often the end of the session. Returns a function that cancels it. */
export function realLater(fn, ms) {
  const handle = setTimeout(fn, Math.max(0, ms));
  return () => clearTimeout(handle);
}
