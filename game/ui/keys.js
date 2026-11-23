// Keyboard play (Playables DES-09/10). Every control is a <button>, so Tab + Enter/Space already reach everything;
// this adds the shortcuts and keeps focus where the player is:
//   Esc      hides a tooltip, else closes the top dialog (Settings, Picture Guide). Never preventDefault: YouTube may
//            also need Esc (for example to leave full screen).
//   1–9      picks the answer button with that number (numbers show on .choice buttons once the keyboard is used)
//   Enter    with nothing focused, presses the visible ▶
// body.kbd marks keyboard use (any of these keys, Tab or arrows); a pointer press clears it.
import { hideTips } from "./tips.js";
import { isPaused } from "../core/clock.js";

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

const waiting = (b) => visible(b) && !b.inert && !b.matches(".lit, .right, .given, [aria-disabled=true]");

/** After the stage redraws (a new item), put keyboard focus where play goes on, so no mouse is needed.
 *  prefer: the control the step is waiting for when nothing is being graded (the next word, the ▶).
 *  scope: while a question is open, the group its choices sit in: focus goes to the first of them (never straight
 *  to the answer). Otherwise the first control still waiting for an answer (lit tiles, given words and right
 *  answers are done). */
export function keepFocus(stage, prefer = null, scope = null) {
  if (!usingKeyboard()) return;
  if (!nothingFocused() && stage.contains(document.activeElement)) return;
  if (prefer?.isConnected && waiting(prefer)) return prefer.focus();
  const first = (root) => (root?.isConnected ? [...root.querySelectorAll("button")].find(waiting) : null);
  (first(scope) ?? first(stage))?.focus();
}

export function installKeys() {
  const KEYBOARD = /^(Tab|Enter|Escape|Arrow\w+|[1-9])$/;
  addEventListener("keydown", (e) => {
    // nothing moves while YouTube has the game paused (INT-21): no sheet closes, no answer is picked
    if (isPaused()) return;
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
      // a choice the nudge took away keeps its number but takes no key: no wobble, no miss
      if (choice && !choice.inert && !choice.classList.contains("nudged")) { choice.focus(); choice.click(); }
      return;
    }
    if (e.key === "Enter" && nothingFocused()) {
      const next = [...stage.querySelectorAll(".next-btn")].find(visible);
      if (next) { e.preventDefault(); next.click(); }
    }
  });
  addEventListener("pointerdown", () => document.body.classList.remove("kbd"), true);
}
