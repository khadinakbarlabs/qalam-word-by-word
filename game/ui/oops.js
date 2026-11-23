// The safety net's face: a friendly "Something went wrong" card with Try again / Back to the map, shown instead of a
// dead screen when a step, Relight or a whole screen throws. Nothing is sent anywhere; the player just gets a way on.
import { h, pic } from "./kit.js";
import { sign } from "./signs.js";
import { t } from "../i18n.js";

const button = (key, onclick) => h("button", { class: "pill oops-btn", "data-t": key, onclick }, t(key));

/** The card itself. choices: [[i18n key, onclick], ...]; the first is the main one. */
function card(choices) {
  return h("div", { class: "room-done oops", role: "alert" },
    h("div", { class: "big-lamp oops-lamp", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
    h("h2", { class: "done-label", "data-t": "oopsTitle" }, t("oopsTitle")),
    h("p", { class: "rest-say", "data-t": "oopsSay" }, t("oopsSay")),
    h("div", { class: "oops-row" }, choices.map(([key, onclick]) => button(key, onclick))));
}

/** Inside a room or Relight stage: resolves "retry", "skip" (offered once trying again has already failed) or "map". */
export function askOops(stage, { canSkip = false } = {}) {
  return new Promise((resolve) => {
    const choices = [[canSkip ? "oopsSkip" : "retry", () => resolve(canSkip ? "skip" : "retry")], ["oopsMap", () => resolve("map")]];
    stage.inert = false;
    stage.replaceChildren(card(choices));
    stage.querySelector("button")?.focus({ preventScroll: true });
  });
}

/** A whole screen failed: the card takes the screen. onMap may be missing (then only Try again is offered). */
export function showOops(root, { onRetry, onMap }) {
  const choices = [["retry", onRetry], ...(onMap ? [["oopsMap", onMap]] : [])];
  root.replaceChildren(h("section", { class: "oops-screen" }, card(choices)));
  root.querySelector("button")?.focus({ preventScroll: true });
}
