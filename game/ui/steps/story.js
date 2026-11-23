// Story Strip: the room's words tell a little wordless story, one painted panel after another. Tap the glowing
// panel to light it and see its word; the next panel then glows. Never graded: it is the room's closing scene.
import { nextIcon } from "../icons.js";
import { h, ar, pic, cap } from "../kit.js";
import { t, lang } from "../../i18n.js";
import { tipText, explain } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"), onclick: () => done() }, nextIcon());
    const panels = step.panels.map((p, k) => {
      const w = ctx.words[p.w];
      const b = h("button", { class: "story-panel", "aria-label": p.ar ?? w.ar, "data-tip": "story" },
        h("span", { class: "story-num", "aria-hidden": "true" }, String(k + 1)),
        pic(w.pic, w.medal), ar(p.ar ?? w.ar, "story-ar"), cap(w.g, "cap story-cap"));
      b.addEventListener("click", () => {
        if (!b.classList.contains("now")) return;
        b.classList.replace("now", "lit");
        delete b.dataset.tip;
        tipText(b, explain(w));
        const following = panels[k + 1];
        if (following) { following.classList.add("now"); ctx.target(following); }
        else { next.hidden = false; ctx.target(next); }
      });
      return b;
    });
    panels[0].classList.add("now");
    const arrow = () => h("span", { class: "story-arrow", "aria-hidden": "true" }, lang() === "ur" ? "⟵" : "⟶");
    ctx.stage.replaceChildren(
      h("div", { class: "story-strip", dir: lang() === "ur" ? "rtl" : "ltr" }, panels.flatMap((b, k) => (k ? [arrow(), b] : [b]))),
      h("div", { class: "row-end" }, next));
    ctx.target(panels[0]);
    ctx.firstShow();
  });
}
