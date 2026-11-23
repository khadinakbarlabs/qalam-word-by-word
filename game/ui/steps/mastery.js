// Last Check: the room's last trial. Its new words (at most 8, core/mastery.js) are asked in mixed order, each from
// both sides: Arabic → meaning, then meaning → Arabic. Every word has a small two-dot lamp in one compact row.
//   Wing 1 (gentle)  one right answer each way; a miss keeps the dots already earned and the word comes back
//   later wings      two right answers in a row; a miss resets the word
// The rule is said once, in the helper strip (ui/room.js): no second wording on the stage.
// A calligraphy word is asked by its MEANING, written out: its medallion would only repeat the Arabic (core/face.js).
// Every miss also counts on the word's lamp card, so Relight brings it back sooner.
import { icon, nextIcon } from "../icons.js";
import { h, ar, arSay, meaningChoice, meaningPrompt, pairLine, optionsFor, withFace, wait, wobble, said } from "../kit.js";
import { whyNot } from "../../core/confusable.js";
import { t } from "../../i18n.js";
import { tip, tipText, explain } from "../tips.js";
import { resumeMastery, answer, direction, isMastered, snapshot } from "../../core/mastery.js";

const AFTER_MS = 800;

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = step.words.filter((id) => ctx.words[id]);
    // options: the room's new and review words first, other words the player has met when those cannot fill four
    // fair options. Two options never look the same, and no option shares the answer's Arabic, picture or caption
    // (core/options.js), so there is always exactly one right answer on screen.
    const pool = withFace(ctx.words, [...ids, ...(step.pool ?? []), ...(step.distractors ?? [])]);
    const extra = withFace(ctx.words, [...ctx.met]);
    // step.resume: a snapshot from the checkpoint (the check was interrupted); step.onProgress(snapshot, answers):
    // told after every answer so the room can keep the place
    let state = resumeMastery(ids, step.resume, { gentle: Boolean(step.gentle) });
    let answers = 0;
    const lamps = new Map(ids.map((id) => [id, tip(h("span", { class: "m-lamp" }, h("i"), h("i")), "masteryLamp")]));
    const shelf = h("div", { class: "m-shelf" }, h("span", { class: "m-badge", "aria-hidden": "true" }, icon("checks")), [...lamps.values()]);
    const prompt = h("div", { class: "prompt" });
    const grid = h("div", { class: "grid4" });
    ctx.stage.replaceChildren(shelf, prompt, grid);

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
      prompt.replaceChildren(mode === "toPic" ? arSay(w, "word") : tipText(meaningPrompt(w), explain(w)));
      const opts = optionsFor(ctx.words, pool, id, 4, `check|${state.tries[id]}`, extra);
      grid.replaceChildren(...opts.map((oid) => {
        const o = ctx.words[oid];
        const b = h("button", { class: "choice", "aria-label": mode === "toPic" ? said(o.g) : o.ar },
          ...(mode === "toPic" ? meaningChoice(o) : [ar(o.ar, "opt-ar")]));
        b.addEventListener("click", async () => {
          if (answered) return;
          if (oid !== id) {
            wobble(b, whyNot(ctx.words, id, oid), o);
            if (!missed) { missed = true; ctx.miss(); ctx.mix?.(id, oid); }
            return;
          }
          answered = true;
          // An answer given after Show me does not count towards the two in a row, and the screen says so: no
          // sparkle, no green tick, a plain line in the helper strip, and the word's lamp blinks (it comes back).
          const helped = !missed && ctx.wasHinted();
          ctx.hit({ quiet: helped });
          b.classList.add(helped ? "helped" : "right");
          state = answer(state, missed ? "wrong" : helped ? "hinted" : "right");
          drawLamp(id);
          // the word and its meaning together for a beat, whichever side was asked
          prompt.append(pairLine(w, "pair learned"));
          if (helped || (missed && step.gentle)) {
            ctx.note(helped ? "masteryHelped" : "masteryAgain");
            const lampEl = lamps.get(id);
            lampEl.classList.remove("again");
            void lampEl.offsetWidth;
            lampEl.classList.add("again");
          }
          answers += 1;
          step.onProgress?.(snapshot(state), answers);
          await wait(AFTER_MS);
          ask();
        });
        if (oid === id) ctx.target(b);
        return b;
      }));
      ctx.firstShow();
    };

    const finish = () => {
      prompt.replaceChildren(h("span", { class: "m-done" }, icon("checks"), " ", h("span", { "data-t": "masteryDone" }, t("masteryDone"))));
      const next = h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => done() }, nextIcon());
      grid.replaceWith(h("div", { class: "row-end" }, next));
      ctx.target(next);
    };

    ids.forEach(drawLamp);
    ask();
  });
}
