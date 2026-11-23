// The what-to-do strip under the header of a room and of Relight: one line that says what to do now. A wrong tap, a
// hint or a helped answer swaps in a short line for a moment, then the step's own line comes back.
import { h, pic, pairLine } from "./kit.js";
import { sign } from "./signs.js";
import { t } from "../i18n.js";
import { later } from "../core/clock.js";

const FLASH_MS = 3000;
const LONG_FLASH_MS = 5000;
const PICKED_MS = 4500;

/** { el, say(key), flash(key, tone), missed(event), good(), stop() }. `alive()` is false once the screen is gone. */
export function makeStrip(alive = () => true) {
  const text = h("span", { class: "howto-text" });
  // after a wrong tap: what the tapped choice really is ("You tapped: كِتَاب = book")
  const picked = h("span", { class: "howto-picked", hidden: true });
  const el = h("div", { class: "howto", role: "status" }, h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))), h("span", { class: "howto-lines" }, text, picked));
  const showPicked = (face) => {
    picked.hidden = !face;
    picked.replaceChildren(...(face ? [h("span", { class: "howto-picked-label", "data-t": "youTapped" }, t("youTapped")), " ", pairLine(face)] : []));
  };
  let key = "";
  let cancel = () => {};
  let cancelGood = () => {};
  const show = (k) => { text.dataset.t = k; text.textContent = t(k); };
  const say = (k) => {
    cancel();
    key = k;
    el.classList.remove("miss", "note");
    showPicked(null);
    show(k);
  };
  // tone "miss": a wrong tap (rose); "note": a hint or a helped answer (calm). The step's line comes back after.
  const flash = (k, tone = "note", ms = tone === "miss" ? FLASH_MS : LONG_FLASH_MS, face = null) => {
    const back = key;
    cancel();
    show(k);
    showPicked(face);
    el.classList.remove("miss", "note");
    void el.offsetWidth;
    el.classList.add(tone);
    cancel = later(() => { if (alive()) say(back); }, ms);
  };
  return {
    el,
    say,
    flash,
    // every wrong tap (kit.wobble): a reason ("those two look alike") when the step knows one, else "try again"
    // and what the tapped choice really is, which stays a little longer so it can be read
    missed: (e) => flash(e?.detail?.why && e.detail.why !== "why_plain" ? e.detail.why : "how_miss", "miss", e?.detail?.picked ? PICKED_MS : FLASH_MS, e?.detail?.picked ?? null),
    good: () => {
      cancelGood();
      el.classList.add("good");
      cancelGood = later(() => el.classList.remove("good"), 700);
    },
    stop: () => { cancel(); cancelGood(); },
  };
}
