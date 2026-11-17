// E1 Scene Hunt: a word appears; tap the thing in a drawn scene (step.scene: signs, family, body, town; see
// game/core/scenes.js). Signs = day | night under one sky; family = a tree around "me"; body = a standing figure.
import { h, ar, pic, dots, wait, wobble } from "../kit.js";
import { SCENES } from "../../core/scenes.js";

const graphemes = (s) => [...new Intl.Segmenter().segment(s)].length;

export function run(ctx, step) {
  return new Promise((done) => {
    const def = SCENES[step.scene ?? "signs"];
    const used = [...new Set(step.items.map((it) => it.spot))];
    const spots = new Map(used.map((id) => {
      const s = def.spots[id];
      const look = (s.art && ctx.words[s.art]?.pic) || s.pic;
      return [id, h("button", { class: `scene-spot${s.big ? " big" : ""}${graphemes(s.pic) > 1 && look === s.pic ? " multi" : ""}`, "aria-label": id, "data-tip": id, style: `left:${s.x}%;top:${s.y}%` }, pic(look))];
    }));
    const marks = Object.entries(def.marks ?? {}).map(([id, m]) =>
      h("span", { class: "scene-mark", "data-tip": id, style: `left:${m.x}%;top:${m.y}%` }, pic((m.art && ctx.words[m.art]?.pic) || m.pic)));
    const scene = h("div", { class: `sign-scene scene-${step.scene ?? "signs"}`, style: `aspect-ratio:${def.ratio}` },
      def.layers.map((l) => h("div", { class: `layer-${l}`, "aria-hidden": "true" })), marks, [...spots.values()]);
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    for (const [id, el] of spots) {
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
      ctx.target(spots.get(item.spot));
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, scene, progress);
    show();
  });
}
