// E2 Lamp & Box: a place word appears; tap where the lamp goes. Ghost circles mark the places; depth is shown by
// overlap (behind = partly hidden by the crate, in front = over it, inside = sunk below the rim).
import { h, ar, dots, wait, wobble } from "../kit.js";

// x/y = lamp centre in % of the scene; gy = ghost circle height if it differs (kept apart so tap targets don't
// overlap); z = drawn behind/in front of the crate; s = scale for depth.
const ZONES = {
  above: { x: 66, y: 11 },
  on: { x: 66, y: 30 },
  inside: { x: 66, y: 44, gy: 55, z: "back", s: 0.9 },
  below: { x: 66, y: 85 },
  between: { x: 43, y: 52 },
  behind: { x: 80, y: 37, z: "back", s: 0.75 },
  front: { x: 57, y: 63, z: "front", s: 1.15 },
  around: { x: 47, y: 30, orbit: true },
  from: { x: 92, y: 18, arrow: "out" },
  to: { x: 92, y: 74, arrow: "in" },
};

export function run(ctx, step) {
  return new Promise((done) => {
    const used = [...new Set(step.items.map((it) => it.zone))];
    const lamp = h("div", { class: "lamp-obj", "aria-hidden": "true" }, "🪔");
    const home = () => { lamp.className = "lamp-obj"; lamp.style.left = "9%"; lamp.style.top = "12%"; lamp.style.setProperty("--s", "1"); };
    const ghosts = new Map(used.map((z) => [z, h("button", { class: "ghost", "aria-label": z, "data-tip": "ghost", style: `left:${ZONES[z].x}%;top:${ZONES[z].gy ?? ZONES[z].y}%` })]));
    const scene = h("div", { class: "place-scene" },
      h("div", { class: "crate small", style: "left:12%;top:40%;width:20%;height:26%" }),
      h("div", { class: "table" }), h("div", { class: "leg", style: "left:52%" }), h("div", { class: "leg", style: "left:79%" }),
      used.includes("around") ? h("div", { class: "orbit", "aria-hidden": "true" }) : null,
      used.includes("from") ? h("div", { class: "arrow out", "aria-hidden": "true" }) : null,
      used.includes("to") ? h("div", { class: "arrow in", "aria-hidden": "true" }) : null,
      lamp,
      h("div", { class: "crate main", style: "left:52%;top:40%;width:29%;height:26%" }),
      [...ghosts.values()]);
    const prompt = h("div", { class: "prompt" });
    let progress = dots(0, step.items.length);
    let i = 0;
    const flyTo = (z) => {
      const zone = ZONES[z];
      lamp.className = `lamp-obj ${zone.z ?? ""} ${zone.orbit ? "orbiting" : ""}`;
      lamp.style.left = `${zone.x}%`;
      lamp.style.top = `${zone.y}%`;
      lamp.style.setProperty("--s", String(zone.s ?? 1));
    };
    for (const [z, g] of ghosts) {
      g.addEventListener("click", async () => {
        const item = step.items[i];
        if (!item) return;
        flyTo(z);
        if (z !== item.zone) { ctx.miss(); wobble(g); await wait(700); return home(); }
        ctx.hit(); g.classList.add("right"); i++;
        await wait(900);
        g.classList.remove("right");
        home();
        show();
      });
    }
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      prompt.replaceChildren(ar(ctx.words[item.w].ar, "word"));
      ctx.target(ghosts.get(item.zone));
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(prompt, scene, progress);
    home();
    show();
  });
}
