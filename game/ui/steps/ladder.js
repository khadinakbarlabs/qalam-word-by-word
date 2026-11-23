// E1 Size Ladder: a describing word appears; tap its rung. The low rung is the plain word (كَبِير big), the high rung
// is the "-er / -est" mould أَفْعَل (أَكْبَر bigger, biggest). Both rungs show the same picture, the high one larger.
import { tipSaid } from "../tips.js";
import { icon } from "../icons.js";
import { h, ar, pic, dots, wait, wobble, arSay } from "../kit.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const rung = (id) => h("button", { class: `rung rung-${id}`, "aria-label": tipSaid(id === "more" ? "rungMore" : "rungBase"), "data-tip": id === "more" ? "rungMore" : "rungBase" });
    const rungs = { more: rung("more"), base: rung("base") };
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    for (const [id, el] of Object.entries(rungs)) {
      el.addEventListener("click", async () => {
        const item = step.items[i];
        if (!item) return;
        if (id !== item.rung) { ctx.miss(); return wobble(el); }
        ctx.hit(); el.classList.add("right"); i++;
        await wait(700);
        el.classList.remove("right");
        show();
      });
    }
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      const base = ctx.words[item.base];
      ctx.item([item.w]);
      prompt.replaceChildren(arSay(ctx.words[item.w], "word"));
      rungs.base.replaceChildren(pic(base.pic, base.medal));
      rungs.more.replaceChildren(pic(base.pic, base.medal), h("span", { class: "up", "aria-hidden": "true" }, icon("up")));
      ctx.target(rungs[item.rung]);
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, h("div", { class: "ladder" }, h("span", { class: "rails", "aria-hidden": "true" }), rungs.more, rungs.base), progress);
    show();
  });
}
