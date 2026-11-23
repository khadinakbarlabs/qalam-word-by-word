// A number that counts up to its new value (the room-done percentage). It runs on the game clock, so a YouTube pause
// holds it; with reduced motion asked for, the new value is simply shown.
import { later } from "../core/clock.js";

const STEPS = 14;
const STEP_MS = 60;

/** The values shown on the way from `from` to `to` (the last is exactly `to`), easing out. Pure: tested in Node. */
export function countSteps(from, to, steps = STEPS) {
  const decimals = Number.isInteger(from) && Number.isInteger(to) ? 0 : 1;
  if (!(to > from)) return [String(to)];
  return Array.from({ length: steps }, (_, k) => {
    const p = 1 - (1 - (k + 1) / steps) ** 2;
    return k === steps - 1 ? String(to) : (from + (to - from) * p).toFixed(decimals);
  });
}

const calm = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Count `el` up from `from`% to `to`%, then call done(). */
export function countUp(el, from, to, done = () => {}) {
  const values = calm() ? [countSteps(from, to).at(-1)] : countSteps(from, to);
  values.forEach((v, k) => later(() => {
    el.textContent = `${v}%`;
    if (k === values.length - 1) done();
  }, k * STEP_MS));
}
