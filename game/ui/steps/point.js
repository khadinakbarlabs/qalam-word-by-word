// E2 Place & Point (near/far, who): tap the thing the word points at. Near things are big and close to Qalam;
// far things are small, across the courtyard. ▲ he-word / ● she-word badges sit on every spot.
import { h, ar, pic, dots, wait, wobble } from "../kit.js";
import { tip } from "../tips.js";

const BADGE = { m: "▲", f: "●" };

export function run(ctx, step) {
  return new Promise((done) => {
    const spotEls = new Map();
    const mk = (s) => {
      const painted = (s.art && ctx.words[s.art]?.pic) || s.pic; // the painting when the pack has it, else the emoji
      const b = tip(h("button", { class: `spot ${s.dist ?? "mid"}`, "aria-label": s.id }, pic(`${painted}${BADGE[s.badge] ?? ""}`)), s.dist ?? (s.id === "many" ? "many" : ""));
      spotEls.set(s.id, b);
      return b;
    };
    const far = step.spots.filter((s) => s.dist === "far");
    const near = step.spots.filter((s) => s.dist === "near");
    const mid = step.spots.filter((s) => !s.dist);
    const scene = h("div", { class: `point-scene${far.length ? " depth" : ""}` },
      far.length ? h("div", { class: "spot-row far" }, far.map(mk)) : null,
      mid.length ? h("div", { class: "spot-row mid" }, mid.map(mk)) : null,
      near.length ? h("div", { class: "spot-row near" }, near.map(mk)) : null,
      h("div", { class: "pointer", "aria-hidden": "true" }, pic(ctx.words["ui:qalam"]?.pic ?? "✒️")));
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    for (const [id, el] of spotEls) {
      el.addEventListener("click", async () => {
        const item = step.items[i];
        if (!item) return;
        if (id !== item.spot) { ctx.miss(); return wobble(el); }
        ctx.hit(); el.classList.add("right"); i++;
        await wait(650);
        el.classList.remove("right");
        show();
      });
    }
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      prompt.replaceChildren(ar(ctx.words[item.w].ar, "word"));
      ctx.target(spotEls.get(item.spot));
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, scene, progress);
    show();
  });
}
