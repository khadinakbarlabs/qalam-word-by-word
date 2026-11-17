// E6 Ayah Light-Up: a real ayah, verbatim from Tanzil, one tile per word (right to left).
//   new word   (gold glow)  tap to meet it: its picture and meaning appear, with its pieces if it has them
//   known word (blue glow)  tap, then pick its meaning from three picture chips (graded)
//   given word (grey)       not taught yet: already shown with its picture ("Qalam's help")
// When every word is lit the whole ayah glows, its word-by-word meaning appears, and then the translator's full
// meaning of the ayah (only under the last part of an ayah played in parts).
import { h, ar, pic, cap, wait, wobble, sparkle, translationBlock } from "../kit.js";
import { t } from "../../i18n.js";
import { confusablesFor, whyNot } from "../../core/confusable.js";
import { tip, tipText, explain, TIPS } from "../tips.js";

const GUESS_AFTER = 8;
const arabicDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

export function run(ctx, step) {
  return new Promise((done) => {
    const words = step.words;
    const kind = words.map((w) => (w.given ? "given" : w.w.some((id) => !ctx.met.has(id)) ? "new" : "known"));
    const resolved = words.map((w, k) => kind[k] === "given");
    const opts = h("div", { class: "opts" });
    const line = h("div", { class: "line" });
    const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"), onclick: () => done() }, "▶");
    const ayahNo = Number(step.ref.split(":")[1]);

    const glossView = (w) => [h("span", { class: "gl-pic" }, pic(w.pic, w.medal)), cap(w.g)];
    const fill = (k) => {
      const w = words[k];
      const pieces = w.pieces ? [h("span", { class: "pieces", "data-tip": "pieces" }, w.pieces.map((p) => h("span", { class: "piece" }, ar(p.ar), cap(p.g, "cap tiny"))))] : [];
      tiles[k].querySelector(".gl").replaceChildren(...glossView(w), ...pieces);
      tiles[k].classList.remove("glow-new", "glow-known");
      tiles[k].classList.add(kind[k] === "given" ? "given" : "lit");
      delete tiles[k].dataset.tip;
      const x = explain({ ...w, why: w.why ?? w.w.map((id) => ctx.words[id]?.why).find(Boolean) });
      tipText(tiles[k], kind[k] === "given" ? { en: `${TIPS.tileGiven.en} — ${x.en}`, ur: `${TIPS.tileGiven.ur} — ${x.ur}` } : x);
    };

    const tiles = words.map((w, k) => {
      const tile = h("button", { class: `tile ${kind[k] === "given" ? "" : `glow-${kind[k]}`}`, "aria-label": w.g.en,
        "data-tip": kind[k] === "given" ? "tileGiven" : kind[k] === "new" ? "tileNew" : "tileKnown" },
        h("span", { class: "ar-line", lang: "ar", dir: "rtl" }, w.lead ? `${w.lead} ` : "", w.ar,
          w.mark ? h("span", { class: "mark" }, ` ${w.mark}`) : null,
          k === words.length - 1 && step.end !== false ? h("span", { class: "num" }, ` ﴿${arabicDigits(ayahNo)}﴾`) : null),
        h("span", { class: "gl" }));
      tile.addEventListener("click", () => tap(k));
      return tile;
    });
    const row = h("div", { class: "ayah" }, tiles);

    const advance = async () => {
      opts.replaceChildren();
      const k = resolved.indexOf(false);
      if (k !== -1) return ctx.target(tiles[k]);
      row.classList.add("lit");
      line.replaceChildren(h("span", { class: "line-label", "data-t": "wordByWord" }, t("wordByWord")),
        h("span", { class: "line-text" }, words.map((w) => cap(w.g, "cap line-word"))), translationBlock(step.tr));
      await wait(500);
      next.hidden = false;
      ctx.target(next);
    };

    // Three meaning chips for word k: the answer, words the player already knows that are easily mistaken for it
    // (look-alikes, same root: core/confusable.js), then other words of the ayah and the pack.
    const chipsFor = (k) => {
      const w = words[k];
      const first = w.w[0];
      const known = Object.keys(ctx.words).filter((id) => ctx.words[id].ar && (ctx.met.has(id) || id === first));
      const cousins = (first ? confusablesFor(ctx.words, first, known) : []).map((id) => ({ id, g: ctx.words[id].g, pic: ctx.words[id].pic, medal: ctx.words[id].medal }));
      const others = [...cousins, ...words.filter((o, j) => j !== k && !o.given && o.g.en !== w.g.en)];
      for (const id of Object.keys(ctx.words)) {
        if (others.length >= 6) break;
        const card = ctx.words[id];
        if (card.ar) others.push({ id, g: card.g, pic: card.pic, medal: card.medal });
      }
      const picked = [];
      for (const o of others) {
        if (picked.length >= 2) break;
        if (o.g.en !== w.g.en && !picked.some((p) => p.g.en === o.g.en)) picked.push(o);
      }
      const set = [w, ...picked];
      return set.slice(k % set.length).concat(set.slice(0, k % set.length));
    };

    // A new word built from pieces is guessed first: "What could it mean?" Never graded and never a wrong sound; any tap
    // reveals the meaning, and a right guess earns a ✓ (the "generation" effect: guessing makes the answer stick).
    const guess = (k) => {
      const w = words[k];
      opts.replaceChildren(h("p", { class: "guess-ask", "data-t": "guessAsk" }, t("guessAsk")), ...chipsFor(k).map((o) => {
        const b = h("button", { class: "choice small", "aria-label": o.g.en }, ...glossView(o));
        b.addEventListener("click", () => {
          opts.querySelectorAll("button").forEach((x) => { x.disabled = true; });
          if (o === w) { b.classList.add("right"); sparkle(b); }
          ctx.meet(w.w);
          resolved[k] = true;
          fill(k);
          advance();
        });
        if (o === w) ctx.target(b);
        return b;
      }));
      ctx.firstShow();
    };

    const choose = (k) => {
      const w = words[k];
      ctx.item(w.w);
      opts.replaceChildren(...chipsFor(k).map((o) => {
        const b = h("button", { class: "choice small", "aria-label": o.g.en }, ...glossView(o));
        b.addEventListener("click", () => {
          if (o !== w) { ctx.miss(); return wobble(b, o.id && w.w[0] ? whyNot(ctx.words, w.w[0], o.id) : undefined); }
          ctx.hit({ stay: true }); // the ayah's other tiles stay tappable
          opts.replaceChildren(); // ...but these chips go at once, so a second tap cannot answer twice
          resolved[k] = true;
          fill(k);
          advance();
        });
        if (o === w) ctx.target(b);
        return b;
      }));
      ctx.firstShow();
    };

    const tap = (k) => {
      if (resolved[k]) return;
      // not in the first room or two: a guess needs something to build on (8 words already known)
      if (kind[k] === "new" && words[k].pieces && ctx.met.size >= GUESS_AFTER) return guess(k);
      if (kind[k] === "new") {
        ctx.meet(words[k].w);
        resolved[k] = true;
        fill(k);
        return advance();
      }
      choose(k);
    };

    words.forEach((w, k) => { if (kind[k] === "given") fill(k); });
    ctx.stage.replaceChildren(h("div", { class: "ayah-ref" }, step.part ? `${step.ref} · ${step.part[0]}–${step.part[1]}` : step.ref), row, opts, line, h("div", { class: "row-end" }, next));
    advance();
    ctx.firstShow();
  });
}
