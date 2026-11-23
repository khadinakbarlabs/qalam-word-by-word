// E3 "Same Verb, New Path" (connector swap): a verb the player knows meets a partner word (ضَرَبَ + فِي) and the
// pair takes a new meaning (travel). The partner word glows; tap the picture of the new meaning. Then the change is
// shown: the verb alone → the verb with its partner. Items carry their own meaning picture (`pic`, from `art`).
import { h, ar, arSay, pic, cap, dots, wait, wobble, said } from "../kit.js";
import { pickItems } from "../../core/options.js";
import { t, lang } from "../../i18n.js";
import { tipText, explain } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const meanings = step.items.map((it) => ({ g: it.g, pic: it.pic, why: it.why }));
    let i = 0;
    const show = () => {
      if (i >= step.items.length) return done();
      const it = step.items[i];
      const verb = ctx.words[it.verb];
      const partner = ctx.words[it.with];
      ctx.item([it.verb, it.with]);
      const arrow = () => h("span", { class: "press-arrow", "aria-hidden": "true" }, lang() === "ur" ? "⟵" : "⟶");
      const card = tipText(h("div", { class: "press-base" }, pic(verb.pic, verb.medal), ar(verb.ar, "opt-ar"), cap(verb.g)), explain(verb));
      const join = h("div", { class: "press-mould", "data-tip": "partner" },
        h("span", { class: "m-pattern", lang: "ar", dir: "rtl" }, h("span", { class: "m-add" }, partner.ar)),
        h("span", { class: "cap", "data-t": "partnerCap" }, t("partnerCap")));
      const out = h("div", { class: "press-out" }, arSay(it, "word"), h("span", { class: "press-q", "aria-hidden": "true" }, "?"));
      const row = h("div", { class: "press-row", dir: lang() === "ur" ? "rtl" : "ltr" }, card, arrow(), join, arrow(), out);
      const grid = h("div", { class: "grid4" }, pickItems(meanings, i, 4, `path|${i}`).map((m) => {
        const k = meanings.indexOf(m);
        const b = tipText(h("button", { class: "choice", "aria-label": said(m.g) }, pic(m.pic), cap(m.g)), explain(m));
        b.addEventListener("click", async () => {
          if (k !== i) { ctx.miss(); return wobble(b); }
          ctx.hit(); b.classList.add("right"); i++;
          out.replaceChildren(arSay(it, "word"), pic(it.pic));
          out.classList.add("grown");
          const side = (p, a, g) => h("span", { class: "shift-side" }, pic(p), ar(a, "opt-ar"), cap(g));
          grid.replaceWith(h("div", { class: "press-shift", dir: lang() === "ur" ? "rtl" : "ltr" },
            side(verb.pic, verb.ar, verb.g), arrow(), side(it.pic, it.ar, it.g)));
          await wait(1500);
          show();
        });
        if (k === i) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(row, grid, dots(i, step.items.length));
      ctx.firstShow();
    };
    show();
  });
}
