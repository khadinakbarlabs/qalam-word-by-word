// E7 Mould Press: a word the player knows (عَلِمَ know) goes into a pattern mould (فَعَّلَ, the doubled middle) and
// comes out grown (عَلَّمَ). Tap the picture of what the grown word means; then the change of meaning is shown
// (know → teach: make someone know). The mould's added piece is highlighted, so the pattern itself is learnt.
import { h, ar, pic, cap, options, dots, wait, wobble } from "../kit.js";
import { t, lang } from "../../i18n.js";
import { tipText, explain } from "../tips.js";
import { sign } from "../signs.js";

// Each mould: the pattern split around the piece it adds, and its caption key.
export const MOULDS = {
  II: { parts: ["فَ", "عَّ", "لَ"], key: "mouldII" },
  III: { parts: ["فَ", "ا", "عَلَ"], key: "mouldIII" },
  IV: { parts: ["", "أَ", "فْعَلَ"], key: "mouldIV" },
  V: { parts: ["", "تَ", "فَعَّلَ"], key: "mouldV" },
  VI: { parts: ["", "تَ", "فَاعَلَ"], key: "mouldVI" },
  VII: { parts: ["", "اِنْ", "فَعَلَ"], key: "mouldVII" },
  VIII: { parts: ["اِفْ", "تَ", "عَلَ"], key: "mouldVIII" },
  IX: { parts: ["اِفْعَ", "لَّ", ""], key: "mouldIX" },
  X: { parts: ["", "اِسْتَ", "فْعَلَ"], key: "mouldX" },
};

export function run(ctx, step) {
  return new Promise((done) => {
    const mould = MOULDS[step.mould];
    const grown = step.items.map((it) => it.w);
    const pool = [...grown, ...Object.keys(ctx.words).filter((id) => !grown.includes(id) && ctx.words[id].pic && !ctx.words[id].medal)].slice(0, Math.max(4, grown.length));
    const pattern = h("span", { class: "m-pattern", lang: "ar", dir: "rtl" },
      mould.parts.map((p, k) => h("span", { class: k === 1 ? "m-add" : "" }, p)));
    const press = h("div", { class: "press-mould", "data-tip": "mould" }, pic(sign("ui:mould", "🧱")), pattern, h("span", { class: "cap", "data-t": mould.key }, t(mould.key)));
    let i = 0;
    const show = () => {
      if (i >= step.items.length) return done();
      const it = step.items[i];
      const [base, w] = [ctx.words[it.base], ctx.words[it.w]];
      ctx.item([it.w]);
      const card = tipText(h("div", { class: "press-base" }, pic(base.pic, base.medal), ar(base.ar, "opt-ar"), cap(base.g)), explain(base));
      const out = h("div", { class: "press-out" }, ar(w.ar, "word"), h("span", { class: "press-q", "aria-hidden": "true" }, "?"));
      const arrow = () => h("span", { class: "press-arrow", "aria-hidden": "true" }, lang() === "ur" ? "⟵" : "⟶");
      const row = h("div", { class: "press-row", dir: lang() === "ur" ? "rtl" : "ltr" }, card, arrow(), press, arrow(), out);
      const grid = h("div", { class: "grid4" }, options(pool, pool.indexOf(it.w), 4, i).map((oid) => {
        const o = ctx.words[oid];
        const b = tipText(h("button", { class: "choice", "aria-label": o.g.en }, pic(o.pic, o.medal), cap(o.g)), explain(o));
        b.addEventListener("click", async () => {
          if (oid !== it.w) { ctx.miss(); return wobble(b); }
          ctx.hit(); b.classList.add("right"); i++;
          // the change of meaning: base meaning → grown meaning, with the grown word's picture in place of "?"
          out.replaceChildren(ar(w.ar, "word"), pic(w.pic, w.medal));
          out.classList.add("grown");
          const side = (x) => h("span", { class: "shift-side" }, pic(x.pic, x.medal), ar(x.ar, "opt-ar"), cap(x.g));
          grid.replaceWith(h("div", { class: "press-shift", dir: lang() === "ur" ? "rtl" : "ltr" }, side(base), arrow(), side(w)));
          await wait(1500);
          show();
        });
        if (oid === it.w) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(row, grid, dots(i, step.items.length));
      ctx.firstShow();
    };
    show();
  });
}
