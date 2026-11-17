// Room screen: runs a room's steps in order and turns the player's recalls into word-lamp cards at the end.
// Every step module gets the same ctx:
//   item(ids)   a new question about these words starts      miss()  a wrong pick on the current question
//   hit()       answered: graded easy / hinted / wrong          meet(ids)  words seen for the first time
//   target(el)  where the show-me hand points                   firstShow()  show the hand once per step type
import { h, ar, cap, pic, showMe, wait, sparkle } from "./kit.js";
import { play } from "./sound.js";
import { keepFitted } from "./fit.js";
import { t } from "../i18n.js";
import { startSession, record, finishRoom } from "../core/room.js";
import { later } from "../core/clock.js";
import { masteryWords as masteryOf } from "../core/taps.js";
import { keepFocus } from "./keys.js";
import * as meet from "./steps/meet.js";
import * as match from "./steps/match.js";
import * as point from "./steps/point.js";
import * as wheel from "./steps/wheel.js";
import * as snap from "./steps/snap.js";
import * as path from "./steps/path.js";
import * as passage from "./steps/passage.js";
import * as place from "./steps/place.js";
import * as ayah from "./steps/ayah.js";
import * as timeline from "./steps/timeline.js";
import * as roots from "./steps/roots.js";
import * as ladder from "./steps/ladder.js";
import * as scene from "./steps/scene.js";
import * as petals from "./steps/petals.js";
import * as story from "./steps/story.js";
import * as grow from "./steps/grow.js";
import { sign } from "./signs.js";
import * as mastery from "./steps/mastery.js";
import * as warmup from "./steps/warmup.js";
import { warmUpWords } from "../core/warmup.js";
import { grade, recordMixup } from "../core/srs.js";

const STEPS = { meet, match, point, wheel, snap, place, ayah, timeline, sort: timeline, roots, ladder, scene, petals, story, grow, path, passage };

/** The stakes card before a room: how many new words, and how often they appear in the Qur'an. Tap ▶ to begin. */
function stakesCard(ctx, room) {
  return new Promise((done) => {
    const go = h("button", { class: "next-btn", "aria-label": t("start"), "data-t-aria": "start", onclick: () => done() }, "▶");
    ctx.stage.replaceChildren(h("div", { class: "stakes" },
      h("div", { class: "stakes-art", "aria-hidden": "true" }, room.art ? pic(ctx.words[room.art]?.pic, ctx.words[room.art]?.medal) : pic(room.icon)),
      h("div", { class: "stakes-row", "data-tip": "stakesWords" },
        h("strong", { class: "stakes-num" }, String(room.stakes.words)), h("span", { class: "cap", "data-t": "stakesWords" }, t("stakesWords"))),
      h("div", { class: "stakes-row", "data-tip": "stakesUses" },
        h("strong", { class: "stakes-num gold" }, room.stakes.uses.toLocaleString("en")), h("span", { class: "cap", "data-t": "stakesUses" }, t("stakesUses"))),
      go));
    ctx.target(go);
  });
}

/** A rest stop in a long room: the lamp is part lit, the place is saved; ▶ goes on, ◀ Map leaves and comes back here. */
function restCard(ctx, lit, gain) {
  return new Promise((done) => {
    const go = h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => done() }, "▶");
    ctx.stage.replaceChildren(h("div", { class: "room-done rest-card" },
      h("div", { class: "big-lamp half", style: `--lit:${Math.round(lit * 100)}%`, "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))),
      h("span", { class: "done-label", "data-t": "restTitle" }, t("restTitle")),
      // how much of this room's gain is already yours (the map moves when the room is finished)
      gain > 0 ? h("div", { class: "done-meter" }, h("strong", { class: "done-pct" }, `+${gain.toFixed(1)}%`), h("span", { class: "cap", "data-t": "restGain" }, t("restGain"))) : null,
      h("span", { class: "cap rest-say", "data-t": "restSay" }, t("restSay")),
      go));
    ctx.target(go);
  });
}

/** Resolves { finished: false } if the player leaves, or { finished: true, cards } when the room is done.
 *  resume: a checkpoint from save.js (start at its step with its results); rests: step indices that get a rest card
 *  first (core/taps.js); onCheckpoint(at, { persist }) is told the player's place after every step.
 *  reread: a finished Reading Room read again (POLISH_PLAN 5.3): its passage only, words in `faded` (due cards) shown
 *  dim, no Mastery Check or done card, nothing graded; resolves { finished: false } at the end. */
export function playRoom({ root, pack, room, cards, day, meterBefore, meterAfter, resume = null, rests = [], onCheckpoint = () => {}, reread = false, faded = new Set() }) {
  return new Promise((resolve) => {
    let alive = true;
    let session = resume ? { ...startSession(), results: { ...resume.results } } : startSession();
    // words first met in this room (meet cards, answers): the new ones go in the checkpoint so a resumed room knows them
    const roomMet = new Set(resume?.met ?? []);
    let cur = { ids: [], missed: false, hinted: false };
    let target = null;
    let hintLevel = 0;
    let stepType = "";
    const shown = new Set();

    const stage = h("div", { class: "stage" });
    // every room with 3+ new words ends with the Mastery Check (each new word right twice in a row, no hints)
    const masteryWords = masteryOf(room, pack.words);
    const withMastery = !reread && masteryWords.length >= 3;
    const stepDots = h("ol", { class: "step-dots", "aria-hidden": "true" }, room.steps.map(() => h("li")), withMastery ? h("li", { class: "m" }) : null);
    // due words the warm-up asked before the room's own steps: graded as they are answered, kept even if the player leaves
    const warmCards = new Map();
    const warmList = () => [...warmCards.values()];
    const leave = () => { alive = false; resolve({ finished: false, warm: warmList() }); };
    // header controls carry a word, so they never read as YouTube's own corner icons (Playables DES-20)
    const hintBtn = h("button", { class: "icon-btn hint-btn labeled", "data-t-aria": "hint", "aria-label": t("hint"), "data-tip": "hint" },
      h("span", { "aria-hidden": "true" }, "👆"), h("span", { class: "btn-label", "data-t": "hint" }, t("hint")));
    // What to do now, in words (beginners): one line per step type, under the header; a miss swaps in a gentle
    // "try again" for a moment. The phone progress bar stands in for the step dots, which narrow screens hide.
    const howText = h("span", { class: "howto-text" });
    const howto = h("div", { class: "howto", role: "status" }, h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))), howText);
    let howKey = "";
    let cancelMiss = () => {};
    const say_how = (key) => {
      cancelMiss();
      howKey = key;
      howto.classList.remove("miss");
      howText.dataset.t = key;
      howText.textContent = t(key);
    };
    // every wrong tap (kit.wobble) swaps in "Not quite. Try again…" for 3 s, then the step's line comes back
    const sayMiss = (e) => {
      const back = howKey;
      cancelMiss();
      // a reason ("those two look alike") when the step knows one, else the plain "try again"
      const key = e?.detail?.why && e.detail.why !== "why_plain" ? e.detail.why : "how_miss";
      howText.textContent = t(key);
      howText.dataset.t = key;
      howto.classList.remove("miss");
      void howto.offsetWidth;
      howto.classList.add("miss");
      cancelMiss = later(() => { if (alive) say_how(back); }, 3000);
    };
    const progress = h("div", { class: "room-progress", "aria-hidden": "true" }, h("i"));
    const setProgress = (done) => progress.style.setProperty("--p", `${Math.round((done / (room.steps.length + (withMastery ? 1 : 0))) * 100)}%`);
    const screen = h("section", { class: "room" },
      h("header", { class: "room-top" },
        h("button", { class: "icon-btn labeled", "data-t-aria": "back", "aria-label": t("back"), onclick: leave },
          h("span", { "aria-hidden": "true" }, "◀"), h("span", { class: "btn-label", "data-t": "mapLabel" }, t("mapLabel"))),
        h("span", { class: "room-title" }, h("span", { class: "room-icon", "aria-hidden": "true" }, room.icon), cap(room.title, "cap title-cap")),
        stepDots, hintBtn),
      progress, howto,
      stage);
    root.replaceChildren(screen);
    keepFitted(stage);
    stage.addEventListener("qw-wrong", sayMiss);
    // a right answer sparkles on the piece just tapped, and the what-to-do strip glows green for a moment
    let lastTap = null;
    stage.addEventListener("click", (e) => { lastTap = e.target.closest?.("button") ?? lastTap; }, true);
    let cancelGood = () => {};
    const celebrate = () => {
      sparkle(lastTap);
      cancelGood();
      howto.classList.add("good");
      cancelGood = later(() => howto.classList.remove("good"), 700);
    };

    const ctx = {
      stage,
      words: pack.words,
      met: new Set([...Object.keys(cards), ...roomMet]),
      reread,
      faded,
      item(ids) { cur = { ids, missed: false, hinted: false }; hintLevel = 0; stage.inert = false; },
      miss() { cur.missed = true; },
      wasHinted() { return cur.hinted; },
      // Answered: the stage takes no taps until the next item starts, so a quick second tap cannot skip or regrade one
      // (DES-07/08). The ayah step passes { stay: true }: its other tiles must stay tappable after each word.
      hit(opts) {
        if (!opts?.stay) stage.inert = true;
        if (!cur.ids.length) return;
        celebrate();
        session = record(session, cur.ids, cur.missed ? "wrong" : cur.hinted ? "hinted" : "easy");
        cur.ids.forEach((id) => { ctx.met.add(id); roomMet.add(id); });
        cur = { ids: [], missed: false, hinted: false };
      },
      meet(ids) { ids.forEach((id) => { ctx.met.add(id); roomMet.add(id); }); },
      // a new target means the step is waiting for the next tap (a new item, or a ▶ after the last answer): unlock
      // keyboard players get focus on the new item once the step has drawn it (ui/keys.js)
      target(el) { target = el; hintLevel = 0; stage.inert = false; queueMicrotask(() => keepFocus(stage)); },
      firstShow() {
        if (shown.has(stepType)) return;
        shown.add(stepType);
        later(() => { if (alive) showMe(stage, target); }, 600);
      },
    };

    hintBtn.addEventListener("click", () => {
      hintLevel++;
      if (cur.ids.length) cur.hinted = true;
      if (hintLevel === 1) showMe(stage, target);
      else target?.classList.add("reveal");
    });

    if (window.__QW_QA) window.__qw = { get target() { return target; }, get session() { return session; }, ctx };

    const say = (key) => {
      const bubble = h("div", { class: "qalam-say", role: "status" }, h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
        h("span", { "data-t": key }, t(key)));
      screen.append(bubble);
      later(() => bubble.remove(), 4000);
    };
    const total = room.steps.length + (withMastery ? 1 : 0);
    const checkpoint = (step, persist) => onCheckpoint(
      { room: room.id, step, steps: room.steps.length, results: session.results, met: [...roomMet].filter((id) => !cards[id]) }, { persist });
    // before step i: a rest card if it is a rest stop (not the one the player is resuming at)
    const restBefore = async (i) => {
      if (!rests.includes(i) || i === start) return;
      checkpoint(i, true);
      say_how("how_rest");
      await restCard(ctx, i / total, Math.max(0, (meterAfter - meterBefore) * (i / total)));
    };
    const start = Math.min(resume?.step ?? 0, room.steps.length);
    for (let i = 0; i < start; i++) stepDots.children[i].className = "done";

    (async () => {
      if (resume) say("resumeSay");
      setProgress(start);
      if (room.stakes?.words && !resume && !reread) { say_how("how_stakes"); await stakesCard(ctx, room); if (!alive) return; }
      // Warm-up: a few fading words from earlier rooms come first, so review happens inside new play (MEMORY_SYSTEM §3)
      const warm = resume || reread ? [] : warmUpWords(cards, day, pack.words, [...room.teaches, ...room.reviews]);
      if (warm.length) {
        stepType = "warmup";
        say_how("how_warmup");
        await warmup.run(ctx, { ids: warm, onResult: (id, outcome, mixed) => warmCards.set(id, mixed.reduce(recordMixup, grade(warmCards.get(id) ?? cards[id], outcome, day, "warm"))) });
        if (!alive) return;
        session = startSession(); // warm answers are graded above, not by the room
      }
      for (let i = start; i < room.steps.length; i++) {
        if (!alive) return;
        await restBefore(i);
        if (!alive) return;
        stepDots.children[i].className = "now";
        stepType = room.steps[i].type;
        say_how(reread ? "how_reread" : `how_${stepType}`);
        stage.inert = false;
        await STEPS[stepType].run(ctx, room.steps[i]);
        if (!alive) return;
        stepDots.children[i].className = "done";
        setProgress(i + 1);
        // the place is kept after every step and sent to the cloud every 3 steps (and on pause, rest or leaving)
        checkpoint(i + 1, (i + 1 - start) % 3 === 0);
      }
      if (withMastery) {
        await restBefore(room.steps.length);
        if (!alive) return;
        const dot = stepDots.children[room.steps.length];
        dot.className = "now m";
        stepType = "mastery";
        say_how("how_mastery");
        stage.inert = false;
        await mastery.run(ctx, { words: masteryWords, distractors: room.reviews });
        if (!alive) return;
        dot.className = "done m";
      }
      setProgress(total);
      if (reread) { alive = false; return resolve({ finished: false }); }
      say_how("how_done");
      stage.inert = false;
      const out = [...finishRoom(session, room, cards, day), ...warmList()];
      const pct = h("strong", { class: "done-pct" }, `${meterBefore}%`);
      // the words just won (up to 12 pictures) and what comes next, so the win is something you can see
      const won = room.teaches.filter((id) => pack.words[id]?.ar);
      const nextRoom = pack.rooms[pack.rooms.findIndex((r) => r.id === room.id) + 1];
      stage.replaceChildren(h("div", { class: "room-done" },
        h("div", { class: "big-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))),
        h("span", { class: "done-label", "data-t": "roomLit" }, t("roomLit")),
        h("div", { class: "done-meter" }, pct, h("span", { class: "cap", "data-t": "meterTip" }, t("meterTip"))),
        won.length ? h("div", { class: "won", "aria-hidden": "true" },
          ...won.slice(0, 12).map((id) => h("span", { class: "won-card" }, pic(pack.words[id].pic, pack.words[id].medal), ar(pack.words[id].ar, "won-ar"))),
          won.length > 12 ? h("span", { class: "won-more" }, `+${won.length - 12}`) : null) : null,
        won.length ? h("span", { class: "cap won-say", "data-t": "wonSay" }, `${won.length} ${t("wonSay")}`) : null,
        nextRoom ? h("div", { class: "next-up" }, h("span", { "data-t": "nextUp" }, t("nextUp")), " ", cap(nextRoom.title, "cap title-cap")) : null,
        h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => resolve({ finished: true, cards: out }) }, "▶")));
      play("lamp");
      await wait(400);
      pct.textContent = `${meterAfter}%`;
      pct.classList.add("rise");
      target = stage.querySelector(".next-btn");
    })();
  });
}
