// Warm-up: a few fading words from earlier rooms, Arabic → picture, before the room's own steps.
// Same feel as Picture Match. Each answer is reported through onResult(id, outcome, mixedWith) for the room to grade.
import { h, ar, pic, cap, optionsFor, dots, wait, wobble } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { tipText, explain } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = step.ids.filter((id) => ctx.words[id]);
    const pool = [...ids, ...Object.keys(ctx.words).filter((id) => !ids.includes(id) && ctx.words[id].pic)].slice(0, Math.max(4, ids.length));
    let i = 0;
    const show = () => {
      if (i >= ids.length) return done();
      const id = ids[i];
      ctx.item([id]);
      const mixed = [];
      let missed = false;
      const grid = h("div", { class: "grid4" }, optionsFor(ctx.words, pool, id, 4, i + 7).map((oid) => {
        const o = ctx.words[oid];
        const b = tipText(h("button", { class: "choice", "aria-label": o.g.en }, pic(o.pic, o.medal), cap(o.g)), explain(o));
        b.addEventListener("click", async () => {
          if (oid !== id) { missed = true; mixed.push(oid); ctx.miss(); return wobble(b, whyNot(ctx.words, id, oid)); }
          const hinted = ctx.wasHinted();
          ctx.hit({ stay: true });
          ctx.stage.inert = true;
          b.classList.add("right");
          step.onResult(id, missed ? "wrong" : hinted ? "hinted" : "easy", mixed);
          i++;
          await wait(650);
          show();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(h("div", { class: "prompt" }, ar(ctx.words[id].ar, "word")), grid, dots(i, ids.length));
      ctx.firstShow();
    };
    show();
  });
}
