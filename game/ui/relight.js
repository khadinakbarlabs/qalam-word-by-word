// Relight: the spaced-review room (docs/MEMORY_SYSTEM.md). Due word lamps are dim on the shelf; each is recalled
// through a different direction than last time (word → picture or picture → word). The session and what each answer
// does to its card live in core/relight.js: a miss is a real lapse (the flame drops, the word is asked again until
// right, then comes back tomorrow), help is graded as help, and the end card says honestly how many lamps still wait.
// A calligraphy word is asked by its MEANING written out, never Arabic against the same Arabic (core/face.js).
// After the lamps, a pair of words the player keeps mixing up is shown side by side ("tell these apart").
// practice: Quick practice (core/practice.js), offered when no lamp is due: the same cards, but nothing is graded.
// No lamp moves up or down; only a mix-up is noted.
import { icon, nextIcon, backIcon } from "./icons.js";
import { h, ar, arSay, pic, meaningChoice, meaningPrompt, pairLine, optionsFor, withFace, wait, wobble, sparkle, said } from "./kit.js";
import { t } from "../i18n.js";
import { sign } from "./signs.js";
import { keepFocus } from "./keys.js";
import { keepFitted } from "./fit.js";
import { askOops } from "./oops.js";
import { makeStrip } from "./strip.js";
import { giveHint, clearNudge } from "./hint.js";
import { whyNot } from "../core/confusable.js";
import { NO_HELP, withMiss, withHint, startItem } from "../core/recall.js";
import { lamp, MAX_LEVEL, RELIGHT_FAILS_BEFORE_LEAVING, recordMixup, settleMixup } from "../core/srs.js";
import { startPractice, practiceAnswer, practiceMode } from "../core/practice.js";
import { tellApartPairs } from "../core/warmup.js";
import { askTellApart } from "./steps/tellapart.js";
import { startRelight, relightMode, relightMiss, relightRight, relightSkip, moreWaiting } from "../core/relight.js";

const OPTIONS = 4;
const TELL_PAIRS = 2; // "tell these apart" questions per visit, at most
const PAIR_MS = 900; // the word and its meaning stay together this long after a right answer

/** Resolves with the updated cards (a list) when the player finishes or leaves. firstTime: show what Relight is first.
 *  onCard(card): a lamp was graded just now (the caller puts it in the save at once, so a pause or a closed game
 *  keeps it). onAllLit(): the last lamp of a session was relit, before the end card is drawn (the natural moment to
 *  close the game, so the caller saves now). */
export function playRelight({ root, pack, cards, day, firstTime = false, practice = false, onCard = () => {}, onAllLit = () => {} }) {
  return new Promise((resolve) => {
    let alive = true;
    let deck = Object.values(cards).filter((c) => pack.words[c.id]);
    let session = practice ? startPractice(deck, day, pack.words) : startRelight(deck, day);
    const titleKey = practice ? "practice" : "relight";
    const howKey = practice ? "how_practice" : "how_relight";
    // pairs the player keeps mixing up: asked once per visit, after the lamps
    let pairs = tellApartPairs(deck, pack.words, TELL_PAIRS);
    const changed = new Map();
    const cardOf = (id) => deck.find((c) => c.id === id);
    const put = (c) => { deck = deck.map((x) => (x.id === c.id ? c : x)); changed.set(c.id, c); onCard(c); };
    const strip = makeStrip(() => alive);
    const finish = () => { alive = false; strip.stop(); resolve([...changed.values()]); };
    let saidAllLit = false;

    const stage = h("div", { class: "stage" });
    const shelf = h("div", { class: "shelf", "aria-hidden": "true" });
    // how many lamps of this session are still to relight (the shelf shows every lamp the player owns)
    const leftNum = h("strong", { class: "left-num" });
    const left = h("span", { class: "relight-left", hidden: true }, leftNum, " ", h("span", { class: "left-label", "data-t": "relightLeft" }, t("relightLeft")));
    const drawLeft = () => { leftNum.textContent = String(session.queue.length); left.hidden = session.queue.length === 0; };
    let target = null;
    let asking = NO_HELP; // what happened to the lamp on screen: a wrong pick, a hint, the answer shown (core/recall.js)
    let hintLevel = 0;
    let onQuestion = false;
    const hintBtn = h("button", { class: "icon-btn hint-btn labeled", "aria-label": t("hint"), "data-t-aria": "hint", "data-tip": "hint" },
      icon("hand"), h("span", { class: "btn-label", "data-t": "hint" }, t("hint")));
    // Show me (ui/hint.js): first a nudge, the answer only on the second request
    hintBtn.addEventListener("click", () => {
      hintLevel += 1;
      const line = giveHint(stage, target, hintLevel, onQuestion);
      if (onQuestion && line !== "hint_look") asking = withHint(asking, hintLevel);
      if (line) strip.flash(line, "note");
    });
    root.replaceChildren(h("section", { class: "room relight" },
      h("header", { class: "room-top" },
        h("button", { class: "icon-btn labeled", "aria-label": t("back"), "data-t-aria": "back", onclick: finish },
          backIcon(), h("span", { class: "btn-label", "data-t": "mapLabel" }, t("mapLabel"))),
        h("span", { class: "room-title" }, h("span", { class: "room-icon", "aria-hidden": "true" }, pic(sign("ui:relight", "🔁"))), h("span", { class: "cap title-cap", "data-t": titleKey }, t(titleKey))),
        left, hintBtn),
      strip.el,
      shelf, stage));
    strip.say(howKey);
    keepFitted(stage);
    // a wrong tap says why when the two words look alike or share a root, else "Not quite. Try again…"
    stage.addEventListener("qw-wrong", strip.missed);

    const drawShelf = (flash) => {
      shelf.replaceChildren(...deck.map((c) => {
        const l = lamp(c, day);
        const w = pack.words[c.id];
        return h("div", { class: `lampcard${l.dim ? " dim" : ""}${l.gold ? " gold" : ""}${c.id === flash ? " right" : ""}` },
          h("span", { class: "lampicon" }, pic(sign(l.dim ? "ui:lamp-off" : "ui:lamp", "🪔"))),
          h("span", { class: "flames" }, Array.from({ length: MAX_LEVEL }, (_, k) => h("i", { class: k < l.flames ? "on" : "" }))),
          ar(w.ar, "lw"),
          h("span", { class: "when" }, l.dim ? null : l.inDays === 0 ? icon("moon") : [icon("sun"), `×${l.inDays}`]));
      }));
    };

    // answer options: words the player has learnt (look-alikes of the answer first), the pack only as a top-up
    const learned = withFace(pack.words, deck.map((c) => c.id));
    const everyWord = withFace(pack.words, Object.keys(pack.words));
    // Safety net: a card that cannot be drawn shows "Something went wrong" instead of a dead screen. Try again moves
    // that lamp to the end of the queue (it stays due), Back to the map leaves with everything graded so far. A
    // second failure in a row (the shelf itself, or the only lamp left) goes back to the map: no endless Try again,
    // and never the "all lit" card for a lamp that was not relit.
    let failsInRow = 0;
    const show = (flash) => {
      try {
        draw(flash);
        failsInRow = 0;
      } catch {
        failsInRow += 1;
        if (failsInRow >= RELIGHT_FAILS_BEFORE_LEAVING) return finish();
        askOops(stage).then((choice) => {
          if (choice === "map") return finish();
          session = relightSkip(session);
          show();
        });
      }
    };

    // The session is over. If more lamps are due, say how many and offer to go on; "all lit" only when it is true.
    // "Tell these apart": one question per pair, never graded. Told apart first time and alone, the mix-up is settled.
    const tellNext = () => {
      const [pair, ...rest] = pairs;
      pairs = rest;
      shelf.hidden = true;
      strip.say("how_tell");
      askTellApart({
        stage, words: pack.words, pair, seed: day,
        begin: (id, el) => { asking = startItem([id]); hintLevel = 0; onQuestion = true; target = el; clearNudge(stage); keepFocus(stage); },
        flags: () => asking,
      }).then((told) => {
        if (!alive) return;
        onQuestion = false;
        if (told.clean) {
          for (const [id, other] of [[told.asked, told.other], [told.other, told.asked]]) {
            const card = cardOf(id);
            const settled = card ? settleMixup(card, other) : card;
            if (settled && settled !== card) put(settled);
          }
        }
        strip.say(howKey);
        show();
      });
    };

    // Quick practice is over: say so plainly. Nothing was graded, so there is nothing to count but right answers.
    const practiceEnd = () => {
      onQuestion = false;
      stage.replaceChildren(h("div", { class: "room-done" }, h("div", { class: "big-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))),
        h("span", { class: "done-label", "data-t": "practiceDone" }, t("practiceDone")),
        h("span", { class: "rest-say say-line", "data-t": "practiceSay" }, t("practiceSay")),
        h("button", { class: "next-btn", "aria-label": t("back"), "data-t-aria": "back", onclick: finish }, nextIcon())));
      strip.say("how_practiceDone");
      target = stage.querySelector(".next-btn");
      keepFocus(stage, target);
    };

    const endCard = () => {
      if (practice) return practiceEnd();
      onQuestion = false;
      if (!saidAllLit && changed.size) { saidAllLit = true; onAllLit(); }
      const more = moreWaiting(deck, day, session);
      const mapBtn = h("button", { class: "pill", onclick: finish }, backIcon(), h("span", { "data-t": "mapLabel" }, t("mapLabel")));
      const goOn = () => { saidAllLit = false; session = startRelight(deck, day, session.settled); strip.say(howKey); show(); };
      stage.replaceChildren(h("div", { class: "room-done" }, h("div", { class: "big-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))),
        more
          ? h("span", { class: "done-label" }, h("strong", { class: "more-num" }, String(more)), " ", h("span", { "data-t": "relightMore" }, t("relightMore")))
          : h("span", { class: "done-label", "data-t": "allLit" }, t("allLit")),
        more ? h("span", { class: "rest-say say-line", "data-t": "relightMoreSay" }, t("relightMoreSay")) : null,
        more
          ? h("div", { class: "done-choices" }, mapBtn, h("button", { class: "next-btn", "aria-label": t("relightGoOn"), "data-t-aria": "relightGoOn", onclick: goOn }, nextIcon()))
          : h("button", { class: "next-btn", "aria-label": t("back"), "data-t-aria": "back", onclick: finish }, nextIcon())));
      strip.say(more ? "how_relightMore" : "how_relightDone");
      target = stage.querySelector(".next-btn");
      keepFocus(stage, target);
    };

    const draw = (flash) => {
      shelf.hidden = false;
      drawShelf(flash);
      drawLeft();
      if (!session.queue.length) return pairs.length ? tellNext() : endCard();
      const c = cardOf(session.queue[0]);
      const w = pack.words[c.id];
      const mode = practice ? practiceMode(c, session.asked) : relightMode(c);
      let answered = false; // after the right answer, ignore taps until the next card shows (no double grading)
      asking = startItem([c.id]);
      hintLevel = 0;
      onQuestion = true;
      clearNudge(stage);
      const prompt = h("div", { class: "prompt" }, mode === "toPic" ? arSay(w, "word") : meaningPrompt(w));
      const grid = h("div", { class: "grid4" }, optionsFor(pack.words, learned, c.id, OPTIONS, `relight|${c.seen}`, everyWord).map((oid) => {
        const o = pack.words[oid];
        const face = mode === "toPic" ? meaningChoice(o) : [ar(o.ar, "opt-ar")];
        const b = h("button", { class: "choice", "aria-label": mode === "toPic" ? said(o.g) : o.ar }, ...face);
        b.addEventListener("click", async () => {
          if (answered) return;
          if (oid !== c.id) {
            wobble(b, whyNot(pack.words, c.id, oid), o); // the strip says what the tapped choice really is
            if (practice) {
              // free practice: no lapse, no flame lost; only the mix-up is noted (once per asking)
              if (!asking.missed) put(recordMixup(cardOf(c.id), oid));
              asking = withMiss(asking);
              return;
            }
            if (!asking.missed) {
              asking = withMiss(asking);
              const out = relightMiss(session, cardOf(c.id), oid, day, mode);
              session = out.session;
              put(out.card);
              drawShelf(c.id);
            }
            return;
          }
          answered = true;
          prompt.append(pairLine(w, "pair learned")); // the word and its meaning together, whichever side was asked
          if (practice) {
            const clean = !asking.missed && !asking.hinted && !asking.revealed;
            session = practiceAnswer(session, c.id, clean);
            if (asking.revealed) b.classList.add("helped");
            else { b.classList.add("right"); sparkle(b); }
            if (!clean) strip.flash("practiceAgain", "note");
            drawLeft();
            await wait(clean ? PAIR_MS : 1100);
            if (alive) show(c.id);
            return;
          }
          const out = relightRight(session, cardOf(c.id), asking, day, mode);
          session = out.session;
          if (out.result !== "missed") put(out.card);
          // an answer that was shown is not a win: no sparkle, and the strip says the lamp comes back
          if (asking.revealed) b.classList.add("helped");
          else { b.classList.add("right"); sparkle(b); }
          const line = { missed: "relightAgain", lapsed: "relightAgain", again: asking.hinted ? "relightAlone" : null, hinted: "relightHelped", back: "relightBack" }[out.result];
          if (line) strip.flash(line, "note");
          drawLeft();
          await wait(line ? 1100 : PAIR_MS);
          if (alive) show(c.id);
        });
        if (oid === c.id) target = b;
        return b;
      }));
      stage.replaceChildren(prompt, grid);
      keepFocus(stage);
    };
    if (window.__QW_QA) window.__qw = { get target() { return target; } };
    if (!firstTime || practice) return show();
    // the first visit explains what Relight is for, then the first card shows
    const go = h("button", { class: "next-btn", "aria-label": t("start"), "data-t-aria": "start", onclick: () => show() }, nextIcon());
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
