// The Show me ladder, shared by rooms and Relight (studio rule: the full answer only on the second request).
//   first request   a nudge: about half of the wrong choices fade out and cannot be tapped, so the player still has
//                   to recall the answer. Where there is nothing to take away, only the helper line changes.
//   second request  the hand points at the answer and it glows.
// A screen with no graded question open (a ▶, a card to turn over) has nothing to give away: the hand comes at once.
import { showMe } from "./kit.js";
import { hintStep, nudgeAway } from "../core/recall.js";

const NUDGED = "nudged";

/** The wrong choices the answer sits among. The group is the nearest [data-choices] box (a step whose choices sit in
 *  several rows marks the whole scene), else the answer's own row. A button marked [data-want] is also right (a task
 *  that takes several pieces) and is never taken away. */
const rivals = (target) => {
  const group = target?.closest?.("[data-choices]");
  const all = group ? [...group.querySelectorAll("button")] : [...(target?.parentElement?.children ?? [])];
  return all.filter((el) => el !== target && el.tagName === "BUTTON" && !el.disabled && !el.hidden && !el.inert
    && !el.matches(".right, .lit, .open, [aria-disabled=true], [data-want]"));
};

/** Take away about half of the wrong choices (always leaving at least one beside the answer). True when some went. */
function nudge(target) {
  const wrong = rivals(target);
  const away = nudgeAway(wrong.length).map((k) => wrong[k]);
  const hadFocus = away.includes(document.activeElement);
  for (const el of away) { el.classList.add(NUDGED); el.inert = true; }
  // keyboard focus was on a choice that just went: it moves to the first one left (never straight to the answer)
  if (hadFocus) (wrong.find((el) => !away.includes(el)) ?? target)?.focus();
  return away.length > 0;
}

/** Give faded choices back (a new question, or the same buttons used for the next part of a task). */
export function clearNudge(stage) {
  for (const el of stage.querySelectorAll(`.${NUDGED}`)) { el.classList.remove(NUDGED); el.inert = false; }
}

/** One Show me request. level: how many times it was asked on this question (1, 2, …); graded: a graded question is
 *  open. Returns the i18n key of the line to say, or null when the hand needs no words. */
export function giveHint(stage, target, level, graded) {
  if (hintStep(level, graded) === "nudge") return nudge(target) ? "hint_nudge" : "hint_look";
  clearNudge(stage);
  showMe(stage, target);
  if (graded) target?.classList.add("reveal");
  return graded ? "hint_answer" : null;
}
