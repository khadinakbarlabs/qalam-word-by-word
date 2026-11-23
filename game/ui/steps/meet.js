// Meet: flip cards. Arabic on the front; tap to see the picture and meaning. First meeting is never graded.
// Cards are dealt a page at a time, sized to the screen, so a room with many new words never runs off the screen:
// when every card on a page is open, ▶ deals the next page (or ends the step on the last one).
import { nextIcon } from "../icons.js";
import { play } from "../sound.js";
import { h, ar, arSay, sayLine, pic, cap, dots } from "../kit.js";
import { t } from "../../i18n.js";
import { tipText, explain } from "../tips.js";
import { whyLine } from "../why-line.js";
import { pageSize, pagesOf } from "../../core/meet-pages.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const pages = pagesOf(step.words.filter((id) => ctx.words[id]), pageSize());
    let at = 0;
    const card = (id, next, cards) => {
      const w = ctx.words[id];
      const b = h("button", { class: "meet-card", "aria-label": w.ar },
        h("span", { class: "front" }, arSay(w, "meet-ar")),
        h("span", { class: "back" }, pic(w.pic, w.medal), ar(w.ar, "meet-ar small"), sayLine(w.say), cap(w.g), w.more ? cap(w.more, "cap more") : null, whyLine(id)));
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
    };
    const show = () => {
      const last = at === pages.length - 1;
      const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"),
        onclick: () => { if (last) return done(); at++; show(); } }, nextIcon());
      const cards = [];
      pages[at].forEach((id) => cards.push(card(id, next, cards)));
      ctx.stage.replaceChildren(
        h("div", { class: `meet-grid${cards.length === 1 ? " one" : ""}` }, cards),
        h("div", { class: "row-end" }, pages.length > 1 ? dots(at, pages.length) : null, next));
      ctx.target(cards[0]);
      ctx.firstShow();
    };
    show();
  });
}
