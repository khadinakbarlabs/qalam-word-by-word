// YouTube pause and resume (Playables INT-21/INT-23). While paused nothing advances: every delay on the game clock
// freezes, the whole game screen stops taking taps and focus (inert), CSS animations stop (body.paused), the tooltip
// closes, and progress is saved because a pause can be the end of the session.
import { setPaused } from "../core/clock.js";
import { hideTips } from "./tips.js";
import { setSound } from "./sound.js";

let saveOnPause = () => {};

/** What to save when YouTube pauses the game (main.js passes its persist()). */
export const whenPausedSave = (fn) => { saveOnPause = fn; };

export function pauseGame() {
  setPaused(true);
  setSound({ paused: true });
  const app = document.getElementById("app");
  if (app) app.inert = true;
  document.body.classList.add("paused");
  hideTips();
  try { saveOnPause(); } catch { /* a failed save must not keep the game running */ }
}

export function resumeGame() {
  setPaused(false);
  setSound({ paused: false });
  const app = document.getElementById("app");
  if (app) app.inert = false;
  document.body.classList.remove("paused");
}
