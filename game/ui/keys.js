// Keyboard play (Playables DES-09/10). Every control is a <button>, so Tab + Enter/Space already reach everything;
// this adds the shortcuts and keeps focus where the player is:
//   Esc      hides a tooltip, else closes the top dialog (Settings, Picture Guide). Never preventDefault: YouTube may
//            also need Esc (for example to leave full screen).
//   1–9      picks the answer button with that number (numbers show on .choice buttons once the keyboard is used)
//   Enter    with nothing focused, presses the visible ▶
// body.kbd marks keyboard use (any of these keys, Tab or arrows); a pointer press clears it.
import { hideTips } from "./tips.js";

const escapes = [];

/** Register what Esc does while a dialog is open. Returns the function that removes it again. */
export function onEscape(fn) {
  escapes.push(fn);
  return () => { const i = escapes.lastIndexOf(fn); if (i >= 0) escapes.splice(i, 1); };
}

export const usingKeyboard = () => document.body.classList.contains("kbd");

const visible = (el) => !el.hidden && !el.disabled && el.getClientRects().length > 0;
/** The stage that takes input now: present, and not locked (answer lock, pause, or a dialog over it). */
const liveStage = () => {
  const stage = document.querySelector(".stage");
  return stage && !stage.closest("[inert]") ? stage : null;
};
const nothingFocused = () => !document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected;

/** After the stage redraws (a new item), put keyboard focus on its first control so play goes on without a mouse. */
export function keepFocus(stage) {
  if (!usingKeyboard()) return;
  if (!nothingFocused() && stage.contains(document.activeElement)) return;
  // the first control still waiting for an answer (lit tiles and right answers are done)
  [...stage.querySelectorAll("button")].find((b) => visible(b) && !b.matches(".lit, .right, [aria-disabled=true]"))?.focus();
}

export function installKeys() {
  const KEYBOARD = /^(Tab|Enter|Escape|Arrow\w+|[1-9])$/;
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (KEYBOARD.test(e.key)) document.body.classList.add("kbd");
    if (e.key === "Escape") {
      if (!hideTips()) escapes.at(-1)?.();
      return;
    }
    const stage = liveStage();
    if (!stage) return;
    if (/^[1-9]$/.test(e.key)) {
      const choice = [...stage.querySelectorAll(".choice")].filter(visible)[Number(e.key) - 1];
      if (choice) { choice.focus(); choice.click(); }
      return;
    }
    if (e.key === "Enter" && nothingFocused()) {
      const next = [...stage.querySelectorAll(".next-btn")].find(visible);
      if (next) { e.preventDefault(); next.click(); }
    }
  });
  addEventListener("pointerdown", () => document.body.classList.remove("kbd"), true);
}
