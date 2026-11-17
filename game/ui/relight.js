// Relight: the spaced-review room (docs/MEMORY_SYSTEM.md). Due word lamps are dim on the shelf; each is recalled
// through a different direction than last time (word → picture or picture → word). A miss comes back 3 cards later.
import { h, ar, pic, cap, options, wait, wobble, showMe, sparkle } from "./kit.js";
import { t } from "../i18n.js";
import { sign } from "./signs.js";
import { keepFocus } from "./keys.js";
import { keepFitted } from "./fit.js";
import { dueCards, grade, requeue, recordMixup, nextEngine, lamp, MAX_LEVEL, RELIGHT_CAP } from "../core/srs.js";

// a word missed in this session must then be answered right twice (both directions) before it leaves the queue
const AFTER_MISS = 2;

/** Resolves with the updated cards (a list) when the player finishes or leaves. firstTime: show what Relight is first. */
export function playRelight({ root, pack, cards, day, firstTime = false }) {
  return new Promise((resolve) => {
    let deck = Object.values(cards).filter((c) => pack.words[c.id]);
    let queue = dueCards(deck, day, RELIGHT_CAP).map((c) => c.id);
    const owed = new Map();
    const changed = new Map();
    const cardOf = (id) => deck.find((c) => c.id === id);
    const put = (c) => { deck = deck.map((x) => (x.id === c.id ? c : x)); changed.set(c.id, c); };
    const finish = () => resolve([...changed.values()]);

    const stage = h("div", { class: "stage" });
    const shelf = h("div", { class: "shelf", "aria-hidden": "true" });
    let target = null;
    let hinted = false;
    const hintBtn = h("button", { class: "icon-btn hint-btn labeled", "aria-label": t("hint"), "data-t-aria": "hint", "data-tip": "hint" },
      h("span", { "aria-hidden": "true" }, "👆"), h("span", { class: "btn-label", "data-t": "hint" }, t("hint")));
    hintBtn.addEventListener("click", () => {
      if (hinted) target?.classList.add("reveal");
      else showMe(stage, target);
      hinted = true;
    });
    root.replaceChildren(h("section", { class: "room relight" },
      h("header", { class: "room-top" },
        h("button", { class: "icon-btn labeled", "aria-label": t("back"), "data-t-aria": "back", onclick: finish },
          h("span", { "aria-hidden": "true" }, "◀"), h("span", { class: "btn-label", "data-t": "mapLabel" }, t("mapLabel"))),
        h("span", { class: "room-title" }, h("span", { class: "room-icon", "aria-hidden": "true" }, pic(sign("ui:relight", "🔁"))), h("span", { class: "cap title-cap", "data-t": "relight" }, t("relight"))),
        hintBtn),
      h("div", { class: "howto", role: "status" }, h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
        h("span", { class: "howto-text", "data-t": "how_relight" }, t("how_relight"))),
      shelf, stage));
    keepFitted(stage);

    const drawShelf = (flash) => {
      shelf.replaceChildren(...deck.map((c) => {
        const l = lamp(c, day);
        const w = pack.words[c.id];
        return h("div", { class: `lampcard${l.dim ? " dim" : ""}${l.gold ? " gold" : ""}${c.id === flash ? " right" : ""}` },
          h("span", { class: "lampicon" }, pic(sign(l.dim ? "ui:lamp-off" : "ui:lamp", "🪔"))),
          h("span", { class: "flames" }, Array.from({ length: MAX_LEVEL }, (_, k) => h("i", { class: k < l.flames ? "on" : "" }))),
          ar(w.ar, "lw"),
          h("span", { class: "when" }, l.dim ? "" : l.inDays === 0 ? "🌙" : `☀️×${l.inDays}`));
      }));
    };

    const learned = deck.map((c) => c.id);
    const show = (flash) => {
      shelf.hidden = false;
      drawShelf(flash);
      if (!queue.length) {
        stage.replaceChildren(h("div", { class: "room-done" }, h("div", { class: "big-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))),
          h("span", { class: "done-label", "data-t": "allLit" }, t("allLit")),
          h("button", { class: "next-btn", "aria-label": t("back"), onclick: finish }, "▶")));
        target = stage.querySelector(".next-btn");
        return;
      }
      const c = cardOf(queue[0]);
      const w = pack.words[c.id];
      const mode = nextEngine(c, ["toPic", "toWord"]);
      const pool = learned.length >= 4 ? learned : Object.keys(pack.words);
      let missed = false;
      let answered = false; // after the right answer, ignore taps until the next card shows (no double grading)
      hinted = false;
      const prompt = mode === "toPic" ? ar(w.ar, "word") : h("span", { class: "big-pic" }, pic(w.pic, w.medal), cap(w.g));
      const grid = h("div", { class: "grid4" }, options(pool, pool.indexOf(c.id), 4, c.seen).map((oid) => {
        const o = pack.words[oid];
        const face = mode === "toPic" ? [pic(o.pic, o.medal), cap(o.g)] : [ar(o.ar, "opt-ar")];
        const b = h("button", { class: "choice", "aria-label": mode === "toPic" ? o.g.en : o.ar }, ...face);
        b.addEventListener("click", async () => {
          if (answered) return;
          if (oid !== c.id) {
            wobble(b);
            if (!missed) {
              missed = true;
              put(grade(recordMixup(cardOf(c.id), oid), "wrong", day, mode));
              queue = requeue(queue, c.id);
              owed.set(c.id, AFTER_MISS);
              drawShelf(c.id);
            }
            return;
          }
          answered = true;
          b.classList.add("right");
          sparkle(b);
          if (!missed) {
            const left = (owed.get(c.id) ?? 1) - (hinted ? 0 : 1);
            if (left > 0) { owed.set(c.id, left); queue = requeue(queue, c.id); put({ ...cardOf(c.id), seen: (cardOf(c.id).seen ?? 0) + 1 }); }
            else { owed.delete(c.id); put(grade(cardOf(c.id), hinted ? "hinted" : "easy", day, mode)); queue = queue.slice(1); }
          }
          await wait(600);
          show(c.id);
        });
        if (oid === c.id) target = b;
        return b;
      }));
      stage.replaceChildren(h("div", { class: "prompt" }, prompt), grid);
      keepFocus(stage);
    };
    if (window.__QW_QA) window.__qw = { get target() { return target; } };
    if (!firstTime) return show();
    // the first visit explains what Relight is for, then the first card shows
    const go = h("button", { class: "next-btn", "aria-label": t("start"), "data-t-aria": "start", onclick: () => show() }, "▶");
    stage.replaceChildren(h("div", { class: "room-done relight-intro" },
      h("div", { class: "big-lamp", "aria-hidden": "true" }, pic(sign("ui:relight", "🔁"))),
      h("h2", { class: "done-label", "data-t": "relightIntroT" }, t("relightIntroT")),
      h("p", { class: "rest-say", "data-t": "relightIntro" }, t("relightIntro")),
      go));
    target = go;
    shelf.hidden = true; // the shelf comes in with the first card, so Start stays on screen
    keepFocus(stage);
  });
}
