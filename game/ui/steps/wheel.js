// E5 Person Wheel: a pronoun (or a verb form, `ar`, such as فَعَلْنَا "we did") appears in the middle; tap the person
// it means. People show their painting when the pronoun card has one, with ▲ / ● badges kept.
import { tipSaid } from "../tips.js";
import { h, ar, pic, dots, wait, wobble } from "../kit.js";

export const PERSONS = {
  "1s": "🙋", "1p": "🙋🙋", "2ms": "🫵▲", "2mp": "🫵🫵", "3ms": "👤▲", "3fs": "👤●", "3mp": "👥",
  // Person Wheel 2: one woman addressed, two people, many women
  "2fs": "🫵●", "2d": "🫵✌️", "3d": "👤✌️", "2fp": "🫵👭", "3fp": "👭",
};
const PERSON_ART = {
  "1s": "w:ana", "1p": "w:nahnu", "2ms": "w:anta", "2mp": "w:antum", "3ms": "w:huwa", "3fs": "w:hiya", "3mp": "w:humu",
  "2fs": "w:ki", "2d": "w:antuma", "3d": "w:huma", "2fp": "w:kunna", "3fp": "w:hunna",
};
// The first wheel's seven people; a step may name its own ring with `persons`.
const FIRST_RING = ["1s", "1p", "2ms", "2mp", "3ms", "3fs", "3mp"];
const look = (ctx, p) => {
  const art = ctx.words[PERSON_ART[p]]?.pic;
  return art?.startsWith("img:") ? art.replace(/[▲●]$/, "") + (PERSONS[p].match(/[▲●]$/)?.[0] ?? "") : PERSONS[p];
};

export function run(ctx, step) {
  return new Promise((done) => {
    const ids = step.persons ?? FIRST_RING;
    const people = ids.map((p, k) => {
      const a = (k / ids.length) * 2 * Math.PI - Math.PI / 2;
      return h("button", { class: "person", "aria-label": tipSaid("person"), "data-tip": "person", style: `left:${50 + 39 * Math.cos(a)}%;top:${50 + 39 * Math.sin(a)}%` }, pic(look(ctx, p)));
    });
    const center = h("div", { class: "wheel-center" });
    const circle = h("div", { class: "circle" }, center, people);
    let progress = dots(0, step.items.length);
    let i = 0;
    people.forEach((b, k) => b.addEventListener("click", async () => {
      const item = step.items[i];
      if (!item) return;
      if (ids[k] !== item.person) { ctx.miss(); return wobble(b); }
      ctx.hit(); b.classList.add("right"); i++;
      await wait(650);
      b.classList.remove("right");
      show();
    }));
    const show = () => {
      if (i >= step.items.length) return done();
      const item = step.items[i];
      ctx.item([item.w]);
      center.replaceChildren(ar(item.ar ?? ctx.words[item.w].ar, "word-mid"));
      ctx.target(people[ids.indexOf(item.person)]);
      const d = dots(i, step.items.length);
      progress.replaceWith(d);
      progress = d;
      ctx.firstShow();
    };
    ctx.stage.replaceChildren(circle, progress);
    show();
  });
}
