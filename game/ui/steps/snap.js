// E3 Snap Pieces: the pictures show the meaning wanted (book + their → "their book"); click the piece that makes it.
// Front pieces snap onto the right of the word (Arabic reads right to left), end pieces onto the left.
import { h, ar, pic, cap, dots, wait, wobble } from "../kit.js";

export function run(ctx, step) {
  return new Promise((done) => {
    const isEnd = (id) => ctx.words[id].ar.startsWith("ـ");
    let t = 0;
    const show = () => {
      if (t >= step.tasks.length) return done();
      const task = step.tasks[t];
      ctx.item(task.want);
      const placed = new Set();
      const build = h("div", { class: "build" });
      const result = h("div", { class: "result", lang: "ar", dir: "rtl" });
      const slot = (ids) => h("div", { class: `slot${ids.length ? " filled" : ""}` }, ids.map((id) => ar(ctx.words[id].ar.replace(/^ـ/, ""))));
      const render = () => {
        const fronts = [...placed].filter((id) => !isEnd(id));
        const ends = [...placed].filter(isEnd);
        build.replaceChildren(slot(fronts), h("div", { class: "base" }, ar(task.base.ar, "base-ar"), pic(task.base.pic, task.base.medal)), slot(ends));
      };
      const chips = step.chips.map((id) => {
        const w = ctx.words[id];
        const b = h("button", { class: `chip ${isEnd(id) ? "end" : "front"}`, "aria-label": w.ar, "data-tip": isEnd(id) ? "endPiece" : "frontPiece" }, ar(w.ar, "chip-ar"), pic(w.pic, w.medal), cap(w.g));
        b.addEventListener("click", async () => {
          if (!task.want.includes(id) || placed.has(id)) { ctx.miss(); return wobble(b); }
          placed.add(id);
          b.disabled = true;
          render();
          const left = task.want.filter((x) => !placed.has(x));
          if (left.length) return ctx.target(chips[step.chips.indexOf(left[0])]);
          result.textContent = task.result;
          result.classList.add("right");
          ctx.hit();
          t++;
          await wait(1100);
          show();
        });
        return b;
      });
      render();
      ctx.target(chips[step.chips.indexOf(task.want[0])]);
      ctx.stage.replaceChildren(h("div", { class: "prompt" }, h("div", { class: "target" }, task.show.map((s) => pic(s)))),
        build, result, h("div", { class: "chips" }, chips), dots(t, step.tasks.length));
      ctx.firstShow();
    };
    show();
  });
}
