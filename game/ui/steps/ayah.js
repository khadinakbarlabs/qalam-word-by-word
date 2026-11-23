// E6 Ayah Light-Up: a real ayah, verbatim from Tanzil, one tile per word (right to left).
//   new word   (gold glow)  tap to meet it: its picture and meaning appear, with its pieces if it has them
//   known word (blue glow)  tap, then pick its meaning from four chips (graded). A calligraphy word's chip shows its
//                           meaning written out, never its Arabic again (core/face.js)
//   given word (grey)       not taught yet: already shown with its picture ("Qalam's help")
// When every word is lit the whole ayah glows, its word-by-word meaning appears, and then the translator's full
// meaning of the ayah (only under the last part of an ayah played in parts).
import { nextIcon } from "../icons.js";
import { h, ar, pic, cap, sayLine, meaningChoice, wait, wobble, sparkle, translationBlock, said } from "../kit.js";
import { t } from "../../i18n.js";
import { whyNot, mainId } from "../../core/confusable.js";
import { ayahChips } from "../../core/chips.js";
import { NO_HELP } from "../../core/recall.js";
import { tip, tipText, explain, TIPS } from "../tips.js";
import { whyOf } from "../why.js";

const arabicDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

export function run(ctx, step) {
  return new Promise((done) => {
    const words = step.words;
    const kind = words.map((w) => (w.given ? "given" : w.w.some((id) => !ctx.met.has(id)) ? "new" : "known"));
    const resolved = words.map((w, k) => kind[k] === "given");
    const opts = h("div", { class: "opts" });
    const line = h("div", { class: "line" });
    const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"), onclick: () => done() }, nextIcon());
    const ayahNo = Number(step.ref.split(":")[1]);

    const glossView = (w) => [h("span", { class: "gl-pic" }, pic(w.pic, w.medal)), cap(w.g)];
    const fill = (k) => {
      const w = words[k];
      const pieces = w.pieces ? [h("span", { class: "pieces", "data-tip": "pieces" }, w.pieces.map((p) => h("span", { class: "piece" }, ar(p.ar), cap(p.g, "cap tiny"))))] : [];
      tiles[k].querySelector(".gl").replaceChildren(...glossView(w), ...pieces);
      tiles[k].classList.remove("glow-new", "glow-known");
      tiles[k].classList.add(kind[k] === "given" ? "given" : "lit");
      // a given word is only shown: it takes no tap and no keyboard focus
      if (kind[k] === "given") { tiles[k].setAttribute("aria-disabled", "true"); tiles[k].tabIndex = -1; }
      delete tiles[k].dataset.tip;
      const x = explain({ ...w, why: w.why ?? w.w.map(whyOf).find(Boolean) });
      tipText(tiles[k], kind[k] === "given" ? { en: `${TIPS.tileGiven.en} — ${x.en}`, ur: `${TIPS.tileGiven.ur} — ${x.ur}` } : x);
    };

    const tiles = words.map((w, k) => {
      const tile = h("button", { class: `tile ${kind[k] === "given" ? "" : `glow-${kind[k]}`}`, "aria-label": said(w.g),
        "data-tip": kind[k] === "given" ? "tileGiven" : kind[k] === "new" ? "tileNew" : "tileKnown" },
        h("span", { class: "ar-line", lang: "ar", dir: "rtl" }, w.lead ? `${w.lead} ` : "", w.ar,
          w.mark ? h("span", { class: "mark" }, ` ${w.mark}`) : null,
          k === words.length - 1 && step.end !== false ? h("span", { class: "num" }, ` ﴿${arabicDigits(ayahNo)}﴾`) : null),
        sayLine(w.say),
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

    // Four meaning chips for word k (core/chips.js): the answer, look-alikes of the real word the player knows, then
    // other words. Never two chips that look the same, never a meaning already printed on a lit tile.
    const chipsFor = (k) => ayahChips({ words: ctx.words, tiles: words, k, met: ctx.met, lit: resolved, seed: `${step.ref}|${step.part?.[0] ?? ""}` });

    // What happened to each tile's question so far (a wrong pick, a hint). Tapping another tile and coming back, or
    // the same tile again, must not wipe it: the word is graded on everything that happened (core/recall.js).
    const flags = words.map(() => NO_HELP);
    let open = -1; // the tile whose chips are showing, or -1
    const putDown = () => {
      if (open === -1) return;
      if (!resolved[open]) flags[open] = ctx.flags();
      open = -1;
      ctx.item([]); // no question is open now: Show me has nothing to grade until a tile is tapped again
    };

    // A new word built from pieces is guessed first: "What could it mean?" Never graded and never a wrong sound; any tap
    // reveals the meaning, and a right guess earns a ✓ (the "generation" effect: guessing makes the answer stick).
    const guess = (k) => {
      const w = words[k];
      putDown();
      opts.replaceChildren(h("p", { class: "guess-ask", "data-t": "guessAsk" }, t("guessAsk")), ...chipsFor(k).map((o) => {
        const b = h("button", { class: "choice small", "aria-label": said(o.g) }, ...meaningChoice(o));
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
      if (open === k) return; // its chips are already showing: a second tap on the tile changes nothing
      putDown();
      open = k;
      ctx.item(w.w, flags[k]);
      const main = mainId(ctx.words, w.w);
      opts.replaceChildren(...chipsFor(k).map((o) => {
        const b = h("button", { class: "choice small", "aria-label": said(o.g) }, ...meaningChoice(o));
        b.addEventListener("click", () => {
          if (o !== w) {
            ctx.miss();
            // a chip can be a word card (id) or another tile of this ayah (its word ids): the reason is for the real word
            const other = o.id ?? (o.w ? mainId(ctx.words, o.w) : null);
            if (other && main && other !== main) ctx.mix?.(main, other);
            // the strip then says what the tapped chip really is (its Arabic and meaning)
            return wobble(b, other && main && other !== main ? whyNot(ctx.words, main, other) : undefined, o);
          }
          open = -1;
          ctx.hit({ stay: true, quiet: ctx.flags().revealed }); // the ayah's other tiles stay tappable
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
      // only once Al-Fatiha is behind the player (ui/room.js canGuess): a guess needs something to build on
      if (kind[k] === "new" && words[k].pieces && ctx.canGuess) return guess(k);
      if (kind[k] === "new") {
        putDown();
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
