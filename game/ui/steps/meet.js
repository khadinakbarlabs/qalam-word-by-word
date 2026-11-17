// Meet: flip cards. Arabic on the front; tap to see the picture and meaning. First meeting is never graded.
import { play } from "../sound.js";
import { h, ar, pic, cap } from "../kit.js";
import { t } from "../../i18n.js";
import { tipText, explain } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"), onclick: () => done() }, "▶");
    const cards = step.words.map((id) => {
      const w = ctx.words[id];
      const b = h("button", { class: "meet-card", "aria-label": w.ar },
        h("span", { class: "front" }, ar(w.ar, "meet-ar")),
        h("span", { class: "back" }, pic(w.pic, w.medal), ar(w.ar, "meet-ar small"), cap(w.g), w.more ? cap(w.more, "cap more") : null, w.why ? cap({ en: w.why.en, ur: w.why.ur ?? w.why.en }, "cap why") : null));
      b.addEventListener("click", () => {
        if (b.classList.contains("open")) return;
        b.classList.add("open");
        play("flip");
        tipText(b, explain(w));
        ctx.meet([id]);
        const closed = cards.find((c) => !c.classList.contains("open"));
        if (closed) ctx.target(closed);
        else { next.hidden = false; ctx.target(next); }
      });
      return b;
    });
    ctx.stage.replaceChildren(h("div", { class: `meet-grid${cards.length === 1 ? " one" : ""}` }, cards), h("div", { class: "row-end" }, next));
    ctx.target(cards[0]);
    ctx.firstShow();
  });
}
