// E1 Picture Match: an Arabic word appears; tap its picture.
import { h, ar, pic, cap, optionsFor, dots, wait, wobble } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { tipText, explain } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    // Options come from this round's words, topped up with other picture words so there are always four.
    const pool = [...step.words, ...Object.keys(ctx.words).filter((id) => !step.words.includes(id) && ctx.words[id].pic)].slice(0, Math.max(4, step.words.length));
    let i = 0;
    const show = () => {
      if (i >= step.words.length) return done();
      const id = step.words[i];
      ctx.item([id]);
      const grid = h("div", { class: "grid4" }, optionsFor(ctx.words, pool, id, 4, i).map((oid) => {
        const o = ctx.words[oid];
        const b = tipText(h("button", { class: "choice", "aria-label": o.g.en }, pic(o.pic, o.medal), cap(o.g)), explain(o));
        b.addEventListener("click", async () => {
          if (oid !== id) { ctx.miss(); return wobble(b, whyNot(ctx.words, id, oid)); }
          ctx.hit(); b.classList.add("right"); i++;
          await wait(650);
          show();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(h("div", { class: "prompt" }, ar(ctx.words[id].ar, "word")), grid, dots(i, step.words.length));
      ctx.firstShow();
    };
    show();
  });
}
