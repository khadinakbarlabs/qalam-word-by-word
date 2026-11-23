// Warm-up: a few fading words from earlier rooms, Arabic → meaning, before the room's own steps.
// Same feel as Picture Match. Each answer is reported through onResult(id, outcome, mixedWith) for the room to grade.
// step.pairs: words the player keeps mixing up; each gets one "tell these apart" question after the words
// (ui/steps/tellapart.js), reported through onTold(asked, other, clean). It is never graded.
import { h, arSay, meaningChoice, pairLine, optionsFor, withFace, dots, wait, wobble, said } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { tipText, explain } from "../tips.js";
import { askTellApart } from "./tellapart.js";
import { PAIR_MS } from "./match.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = step.ids.filter((id) => ctx.words[id]);
    const pairs = (step.pairs ?? []).filter(([a, b]) => ctx.words[a] && ctx.words[b]);
    // wrong options are words the player has met, look-alikes of the answer first (core/options.js): never the game's
    // first words again and again
    const pool = withFace(ctx.words, [...ids, ...ctx.met]);
    const extra = withFace(ctx.words, Object.keys(ctx.words));
    let i = 0;
    const tell = async () => {
      for (const [n, pair] of pairs.entries()) {
        const told = await askTellApart({
          stage: ctx.stage, words: ctx.words, pair, seed: n,
          begin: (id, el) => { ctx.item([id]); ctx.target(el); },
          flags: () => ctx.flags(),
        });
        ctx.item([]); // never graded: the question is closed without a result
        step.onTold?.(told.asked, told.other, told.clean);
      }
      done();
    };
    const show = () => {
      if (i >= ids.length) return tell();
      const id = ids[i];
      const w = ctx.words[id];
      ctx.item([id]);
      const mixed = [];
      let missed = false;
      const prompt = h("div", { class: "prompt" }, arSay(w, "word"));
      const grid = h("div", { class: "grid4" }, optionsFor(ctx.words, pool, id, 4, `warm|${i}`, extra).map((oid) => {
        const o = ctx.words[oid];
        const b = tipText(h("button", { class: "choice", "aria-label": said(o.g) }, ...meaningChoice(o)), explain(o));
        b.addEventListener("click", async () => {
          if (oid !== id) { missed = true; mixed.push(oid); ctx.miss(); return wobble(b, whyNot(ctx.words, id, oid), o); }
          const { hinted, revealed } = ctx.flags();
          ctx.hit({ stay: true, quiet: revealed });
          ctx.stage.inert = true;
          b.classList.add("right");
          prompt.append(pairLine(w, "pair learned"));
          step.onResult(id, missed || revealed ? "wrong" : hinted ? "hinted" : "easy", mixed);
          i++;
          await wait(PAIR_MS);
          show();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.stage.replaceChildren(prompt, grid, dots(i, ids.length));
      ctx.firstShow();
    };
    show();
  });
}
