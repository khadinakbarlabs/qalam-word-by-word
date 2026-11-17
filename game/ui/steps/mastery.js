// Mastery Check: the room's last trial. Every new word, in mixed order, must be answered right twice in a row with
// no hint — once Arabic → picture, once picture → Arabic. A miss resets it and it comes back soon. A lamp per word
// fills as it is mastered. Every miss also counts on the word's lamp card, so Relight brings it back sooner.
import { h, ar, pic, cap, optionsFor, wait, wobble } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { t } from "../../i18n.js";
import { tip, tipText, explain } from "../tips.js";
import { startMastery, answer, direction, isMastered } from "../../core/mastery.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = step.words.filter((id) => ctx.words[id]);
    const pool = [...new Set([...ids, ...(step.distractors ?? [])])].filter((id) => ctx.words[id]);
    let state = startMastery(ids);
    const lamps = new Map(ids.map((id) => [id, tip(h("span", { class: "m-lamp" }, h("i"), h("i")), "masteryLamp")]));
    const shelf = h("div", { class: "m-shelf" }, [...lamps.values()]);
    const head = h("div", { class: "m-head" }, h("span", { class: "m-badge", "aria-hidden": "true" }, "✓✓"), h("span", { class: "cap", "data-t": "masteryTitle" }, t("masteryTitle")));
    const prompt = h("div", { class: "prompt" });
    const grid = h("div", { class: "grid4" });
    ctx.stage.replaceChildren(head, shelf, prompt, grid);

    const drawLamp = (id) => {
      const el = lamps.get(id);
      [...el.children].forEach((dot, k) => dot.classList.toggle("on", k < state.streak[id]));
      el.classList.toggle("lit", state.done.includes(id));
    };

    const ask = () => {
      if (isMastered(state)) return finish();
      const id = state.queue[0];
      const w = ctx.words[id];
      const mode = direction(state, id);
      ctx.item([id]);
      let missed = false;
      let answered = false; // backstop to the stage lock: one right answer per item, so ask() never runs twice
      prompt.replaceChildren(mode === "toPic" ? ar(w.ar, "word") : tipText(h("span", { class: "big-pic" }, pic(w.pic, w.medal)), explain(w)));
      const opts = optionsFor(ctx.words, pool, id, Math.min(4, pool.length), state.tries[id] + ids.indexOf(id));
      grid.replaceChildren(...opts.map((oid) => {
        const o = ctx.words[oid];
        const b = h("button", { class: "choice", "aria-label": mode === "toPic" ? o.g.en : o.ar },
          ...(mode === "toPic" ? [pic(o.pic, o.medal), cap(o.g)] : [ar(o.ar, "opt-ar")]));
        b.addEventListener("click", async () => {
          if (answered) return;
          if (oid !== id) {
            wobble(b, whyNot(ctx.words, id, oid));
            if (!missed) { missed = true; ctx.miss(); }
            return;
          }
          answered = true;
          const hinted = ctx.wasHinted();
          ctx.hit();
          b.classList.add("right");
          state = answer(state, missed ? "wrong" : hinted ? "hinted" : "right");
          drawLamp(id);
          await wait(550);
          ask();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.firstShow();
    };

    const finish = () => {
      prompt.replaceChildren(h("span", { class: "m-done" }, "✓✓ ", h("span", { "data-t": "masteryDone" }, t("masteryDone"))));
      const next = h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => done() }, "▶");
      grid.replaceWith(h("div", { class: "row-end" }, next));
      ctx.target(next);
    };

    ids.forEach(drawLamp);
    ask();
  });
}
