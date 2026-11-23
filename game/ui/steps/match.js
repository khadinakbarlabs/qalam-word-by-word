// E1 Picture Match: an Arabic word appears; tap its meaning (its picture, or for a calligraphy word the meaning
// written out: a medallion would only repeat the Arabic, core/face.js).
import { h, arSay, meaningChoice, pairLine, optionsFor, withFace, dots, wait, wobble, said } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { tipText, explain } from "../tips.js";

// the word and its meaning stay side by side this long after a right answer, so the pairing is seen, not just tapped
export const PAIR_MS = 950;

export function run(ctx, step) {
  return new Promise((done) => {
    // Options come from this round's words and the words the player has met (look-alikes first), topped up from the
    // whole pack only when those cannot fill four fair options. The set changes with every question (core/options.js).
    const pool = withFace(ctx.words, [...step.words, ...ctx.met]);
    const extra = withFace(ctx.words, Object.keys(ctx.words));
    let i = 0;
    const show = () => {
      if (i >= step.words.length) return done();
      const id = step.words[i];
      const w = ctx.words[id];
      ctx.item([id]);
      const prompt = h("div", { class: "prompt" }, arSay(w, "word"));
      const grid = h("div", { class: "grid4" }, optionsFor(ctx.words, pool, id, 4, `match|${i}`, extra).map((oid) => {
        const o = ctx.words[oid];
        const b = tipText(h("button", { class: "choice", "aria-label": said(o.g) }, ...meaningChoice(o)), explain(o));
        b.addEventListener("click", async () => {
          if (oid !== id) { ctx.miss(); ctx.mix?.(id, oid); return wobble(b, whyNot(ctx.words, id, oid), o); }
          ctx.hit(); b.classList.add("right"); i++;
          prompt.append(pairLine(w, "pair learned"));
          await wait(PAIR_MS);
          show();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(prompt, grid, dots(i, step.words.length));
      ctx.firstShow();
    };
    show();
  });
}
