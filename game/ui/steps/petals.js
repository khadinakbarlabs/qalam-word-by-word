// E4 Six Petals: a verb's root sits in the middle of a flower; each petal is one of its six forms (past, now/later,
// command, doer, done-to, the action itself). A form appears (يَفْتَحُ, فَاتِح …); tap the petal it belongs to.
import { h, ar, pic, dots, wait, wobble } from "../kit.js";

export const PETALS = { past: "⏪", present: "✍️", command: "☝️", doer: "🧑‍🔧", done: "📦", action: "⚙️" };

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = Object.keys(PETALS);
    const petals = ids.map((id, k) => {
      const a = (k / ids.length) * 2 * Math.PI - Math.PI / 2;
      const art = ctx.words[`ui:${id}`]?.pic;
      return h("button", { class: `petal petal-${id}`, "aria-label": id, "data-tip": `petal_${id}`, style: `left:${50 + 37 * Math.cos(a)}%;top:${50 + 37 * Math.sin(a)}%` },
        pic(art ?? PETALS[id]));
    });
    const heart = h("div", { class: "flower-heart" }, h("span", { class: "seeds", lang: "ar", dir: "rtl" }, step.root.map((l) => h("span", { class: "seed" }, l))));
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    petals.forEach((b, k) => b.addEventListener("click", async () => {
      const item = step.items[i];
      if (!item) return;
      if (ids[k] !== item.petal) { ctx.miss(); return wobble(b); }
      ctx.hit(); b.classList.add("right"); i++;
      await wait(700);
      b.classList.remove("right");
      show();
    }));
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      prompt.replaceChildren(ar(item.ar, "word"));
      ctx.target(petals[ids.indexOf(item.petal)]);
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, h("div", { class: "flower" }, h("div", { class: "stem", "aria-hidden": "true" }), heart, petals), progress);
    show();
  });
}
