// E2 Time Line: a word appears; tap its place on the time arrow (past / now / later, or done / soon / later).
// With `stamp`, the tap drops that stamp on the segment: the "No Stamp" (لَمْ ✕ past, لَنْ ✕ future, لَا ✕ now).
// As a `sort` step the same game has no arrow: the segments are bins (garden 🌳 / fire 🔥, light 🕯️ / dark 🌑).
import { h, ar, pic, dots, wait, wobble } from "../kit.js";
import { tip } from "../tips.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const segs = step.segments.map((s) => tip(h("button", { class: `seg seg-${s.id}`, "aria-label": s.id }, pic(s.art && ctx.words[s.art]?.pic ? ctx.words[s.art].pic + (s.pic.match(/[▲●]$/)?.[0] ?? "") : s.pic)), s.id));
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    segs.forEach((b, k) => b.addEventListener("click", async () => {
      const item = step.items[i];
      if (!item) return;
      const stamp = step.stamp ? h("span", { class: "stamp", "aria-hidden": "true" }, step.stamp) : null;
      if (stamp) b.append(stamp);
      if (step.segments[k].id !== item.seg) {
        ctx.miss(); wobble(b);
        await wait(600);
        stamp?.remove();
        return;
      }
      ctx.hit(); b.classList.add("right"); i++;
      await wait(750);
      stamp?.remove();
      b.classList.remove("right");
      show();
    }));
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      prompt.replaceChildren(ar(item.ar ?? ctx.words[item.w].ar, "word"));  // `ar`: another shape of the same word (خُلِقَ for خَلَقَ)
      ctx.target(segs[step.segments.findIndex((s) => s.id === item.seg)]);
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    // The arrow runs right to left in Arabic reading order: past on the right, later on the left.
    const bins = step.type === "sort";
    ctx.stage.replaceChildren(prompt, h("div", { class: bins ? "timeline bins" : "timeline", dir: bins ? undefined : "rtl" },
      segs, bins ? null : h("div", { class: "time-arrow", "aria-hidden": "true", "data-tip": "timeArrow" })), progress);
    show();
  });
}
