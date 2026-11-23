// E4 Root Garden: a word appears; tap the pot whose three letter-seeds it grows from. Each right answer adds a leaf
// (the word) to that pot's plant, so a whole root family (رَحْمٰن · رَحِيم · رَحْمَة) ends up growing together.
// Names of Allah are taught this way: calligraphy and their root family, never a picture.
import { icon } from "../icons.js";
import { h, ar, pic, dots, wait, wobble, arSay } from "../kit.js";
import { sign } from "../signs.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const leaves = new Map();
    const pots = new Map(step.seeds.map((s) => {
      const leafBox = h("span", { class: "leaves" });
      leaves.set(s.id, leafBox);
      const pot = h("button", { class: "pot", "aria-label": s.letters.join(" "), "data-tip": "pot" },
        leafBox,
        h("span", { class: "sprout", "aria-hidden": "true" }, pic(sign("ui:pot", "🌱"))),
        h("span", { class: "seeds", lang: "ar", dir: "rtl" }, s.letters.map((l) => h("span", { class: "seed" }, l))),
        h("span", { class: "pot-base", "aria-hidden": "true" }, icon("pot")));
      return [s.id, pot];
    }));
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    for (const [id, pot] of pots) {
      pot.addEventListener("click", async () => {
        const item = step.items[i];
        if (!item) return;
        if (id !== item.seed) { ctx.miss(); return wobble(pot); }
        ctx.hit(); pot.classList.add("right"); i++;
        leaves.get(id).append(ar(ctx.words[item.w].ar, "leaf"));
        await wait(700);
        pot.classList.remove("right");
        show();
      });
    }
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      prompt.replaceChildren(arSay(ctx.words[item.w], "word"));
      ctx.target(pots.get(item.seed));
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, h("div", { class: "garden", dir: "rtl" }, [...pots.values()]), progress);
    show();
  });
}
