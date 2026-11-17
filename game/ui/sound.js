// Soft, optional sound effects (POLISH_PLAN 5.1), made in code with Web Audio: no audio files to load or license.
// Rules: silent when YouTube turns game audio off (isAudioEnabled / onAudioEnabledChange), when the player turns sound
// off in Settings, and while the game is paused. Never a sound for a wrong answer, and nothing plays over recitation
// (the game has none yet).
//   right      two soft bell notes      a right answer (kit.sparkle)
//   flip       one low, short note      a Meet card turns over
//   lamp       three rising notes       a room is finished
//   milestone  four rising notes        a milestone card
const SOUNDS = {
  right: [[1319, 0, 0.16], [1976, 0.07, 0.22]],
  flip: [[523, 0, 0.09]],
  lamp: [[523, 0, 0.3], [659, 0.12, 0.3], [784, 0.24, 0.45]],
  milestone: [[523, 0, 0.3], [659, 0.11, 0.3], [784, 0.22, 0.3], [1047, 0.33, 0.6]],
};
const VOLUME = 0.07;

const state = { host: true, wanted: true, paused: false };
let ctx = null;

const audible = () => state.host && state.wanted && !state.paused;

/** Keep the audio context running only while sound may play: a suspended context makes no sound at all. */
function sync() {
  if (!ctx) return;
  (audible() ? ctx.resume() : ctx.suspend()).catch(() => {});
}

/** Update any of { host, wanted, paused }. */
export function setSound(patch) {
  Object.assign(state, patch);
  sync();
}

export const soundOn = () => audible();

/** Play one of SOUNDS. Called from a tap, so the browser lets the first call create the audio context. */
export function play(name) {
  const notes = SOUNDS[name];
  if (!notes || !audible()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    for (const [freq, at, length] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      // soft attack, smooth fade: no clicks
      gain.gain.setValueAtTime(0, now + at);
      gain.gain.linearRampToValueAtTime(VOLUME, now + at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + length + 0.02);
    }
  } catch {
    // no Web Audio here: the game is complete without sound
  }
}
