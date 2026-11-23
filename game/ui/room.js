// Room screen: runs a room's steps in order and turns the player's recalls into word-lamp cards at the end.
// Every step module gets the same ctx:
//   item(ids)   a new question about these words starts      miss()  a wrong pick on the current question
//   hit()       answered: graded easy / hinted / wrong          meet(ids)  words seen for the first time
//   target(el)  where the show-me hand points                   firstShow()  the tutorial hand, once per game ever
//   flags()     what happened to the open question so far       item(ids, flags)  pick a question up again
//   note(key)   say a short line in the helper strip          mix(id, picked)  a wrong pick: these two got mixed up
//   canGuess    may a new built word be guessed first (not in Al-Fatiha: a guess needs words to build on)
// Grading (core/recall.js): right first try with no help = easy; after a hint, or while the tutorial hand pointed at
// the answer = hinted; after a wrong pick or after the answer was shown (second Show me) = wrong.
import { icon, nextIcon, backIcon, WING_ICON } from "./icons.js";
import { h, ar, cap, pic, sayLine, showMe, wait, sparkle, burst } from "./kit.js";
import { countUp } from "./count-up.js";
import { makeStrip } from "./strip.js";
import { giveHint, clearNudge } from "./hint.js";
import { startItem, NO_ITEM, withMiss, withHint, withHand, flagsOf, gotHelp, outcomeOf } from "../core/recall.js";
import { play } from "./sound.js";
import { keepFitted } from "./fit.js";
import { t } from "../i18n.js";
import { startSession, record, recordMix, finishRoom, leaveRoom } from "../core/room.js";
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
import { warmUpWords, tellApartPairs } from "../core/warmup.js";
import { gradeFresh, recordMixup, settleMixup } from "../core/srs.js";
import { checkWords, CHECK_CAP } from "../core/mastery.js";
import { isFatihaRoom } from "../core/milestones.js";
import { progressReport } from "../core/report.js";
import { askOops } from "./oops.js";

// the tutorial hand comes this long after a game's first question is drawn (a player who answers sooner never sees it)
const HAND_AFTER_MS = 600;
// games that never get the tutorial hand: both exist to test recall, and the hand would answer for the player
const NO_HAND = new Set(["warmup", "mastery"]);

// the Last Check tells the save its place after every answer; the cloud gets it on every 5th (and on pause or leaving)
const MASTERY_SAVE_EVERY = 5;

const STEPS = { meet, match, point, wheel, snap, place, ayah, timeline, sort: timeline, roots, ladder, scene, petals, story, grow, path, passage };

/** The stakes card before a room: how many new words, and how often they appear in the Qur'an. Tap ▶ to begin. */
function stakesCard(ctx, room) {
  return new Promise((done) => {
    const go = h("button", { class: "next-btn", "aria-label": t("start"), "data-t-aria": "start", onclick: () => done() }, nextIcon());
    ctx.stage.replaceChildren(h("div", { class: "stakes" },
      h("div", { class: "stakes-art", "aria-hidden": "true" }, room.art ? pic(ctx.words[room.art]?.pic, ctx.words[room.art]?.medal) : icon(WING_ICON[room.wing] ?? "hall")),
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
    const go = h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => done() }, nextIcon());
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
 *  The room is WON the moment its last part is passed: onFinished(cards) is called then, before the "Room lamp lit"
 *  card is drawn, so the caller saves the win at once; ▶ and ◀ Map on that card only move on (both resolve finished).
 *  onCard(card): a warm-up word was graded (saved as it happens, not at the end).
 *  resume: a checkpoint from save.js (start at its step with its results); rests: step indices that get a rest card
 *  first (core/taps.js); onCheckpoint(at, { persist }) is told the player's place after every step, and inside the
 *  Last Check after every answer.
 *  A step that throws shows the "Something went wrong" card (ui/oops.js) instead of a dead screen.
 *  hands: games (step types) whose tutorial hand this player has already seen (save.js `hands`); onHand(type) is
 *  told when the hand is shown for a new one.
 *  reread: a finished Reading Room read again (POLISH_PLAN 5.3): its passage only, words in `faded` (due cards) shown
 *  dim, no Mastery Check or done card, nothing graded; resolves { finished: false } at the end.
 *  skipStakes: the room opens straight on its first step (the very first room, entered from the intro's Start: one
 *  Start press, not two).
 *  Leaving before the end keeps what was reviewed: the review words answered so far are graded on the way out
 *  (core/room.js leaveRoom, through onCard) and taken out of the checkpoint so they are not graded twice. */
export function playRoom({ root, pack, room, cards, day, meterBefore, meterAfter, resume = null, rests = [], onCheckpoint = () => {}, onCard = () => {}, onFinished = () => {}, hands = [], onHand = () => {}, reread = false, faded = new Set(), skipStakes = false }) {
  return new Promise((resolve) => {
    let alive = true;
    // set when the room is won: from then on leaving by any button is a finished room
    let wonCards = null;
    let session = resume ? { ...startSession(), results: { ...resume.results } } : startSession();
    // words first met in this room (meet cards, answers): the new ones go in the checkpoint so a resumed room knows them
    const roomMet = new Set(resume?.met ?? []);
    let cur = NO_ITEM;
    let asking = 0; // goes up whenever the open question changes, so a late tutorial hand never lands on the next one
    let target = null;
    let hintLevel = 0;
    let stepType = "";
    const shown = new Set(hands);

    const stage = h("div", { class: "stage" });
    // every room with 3+ new words ends with the Mastery Check (each new word right twice in a row, no hints)
    const masteryWords = masteryOf(room, pack.words);
    const withMastery = !reread && masteryWords.length >= 3;
    // Wing 1 is gentle: one right answer each way, and a miss keeps the dots already earned (core/mastery.js)
    const gentle = room.wing === 1;
    // the words the check asks: at most CHECK_CAP (the ones that most need it); set when the check starts
    let checked = masteryWords;
    const stepDots = h("ol", { class: "step-dots", "aria-hidden": "true" }, room.steps.map(() => h("li")), withMastery ? h("li", { class: "m" }) : null);
    // due words the warm-up asked before the room's own steps: graded as they are answered, kept even if the player leaves
    const warmCards = new Map();
    const warmList = () => [...warmCards.values()];
    let lastAt = resume; // the newest checkpoint (the caller has it too)
    // On the way out of an unfinished room: grade the review words answered so far, and drop them from the checkpoint.
    const keepReviewed = () => {
      if (wonCards || reread) return;
      const out = leaveRoom(session, room, cards, day);
      if (!out.cards.length) return;
      out.cards.forEach(onCard);
      const settled = new Set(out.cards.map((c) => c.id));
      session = { ...session, results: out.results };
      if (lastAt) onCheckpoint({ ...lastAt, results: Object.fromEntries(Object.entries(lastAt.results ?? {}).filter(([id]) => !settled.has(id))) }, { persist: true });
    };
    const leave = () => {
      if (!alive) return;
      keepReviewed();
      alive = false;
      strip.stop();
      resolve(wonCards ? { finished: true, cards: wonCards } : { finished: false, warm: warmList() });
    };
    // header controls carry a word, so they never read as YouTube's own corner icons (Playables DES-20)
    const hintBtn = h("button", { class: "icon-btn hint-btn labeled", "data-t-aria": "hint", "aria-label": t("hint"), "data-tip": "hint" },
      icon("hand"), h("span", { class: "btn-label", "data-t": "hint" }, t("hint")));
    // What to do now, in words (beginners): one line per step type, under the header (ui/strip.js); a miss, a hint
    // or a helped answer swaps in a short line for a moment. The phone progress bar stands in for the step dots.
    const strip = makeStrip(() => alive);
    const howto = strip.el;
    const say_how = strip.say;
    const progress = h("div", { class: "room-progress", "aria-hidden": "true" }, h("i"));
    const setProgress = (done) => progress.style.setProperty("--pn", String(Math.round((done / (room.steps.length + (withMastery ? 1 : 0))) * 100) / 100));
    const screen = h("section", { class: "room" },
      h("header", { class: "room-top" },
        h("button", { class: "icon-btn labeled", "data-t-aria": "back", "aria-label": t("back"), onclick: leave },
          backIcon(), h("span", { class: "btn-label", "data-t": "mapLabel" }, t("mapLabel"))),
        h("span", { class: "room-title" }, h("span", { class: "room-icon", "aria-hidden": "true" }, room.art && pack.words[room.art]?.pic?.startsWith("img:") ? pic(pack.words[room.art].pic) : icon(WING_ICON[room.wing] ?? "hall")), cap(room.title, "cap title-cap")),
        stepDots, hintBtn),
      progress, howto,
      stage);
    root.replaceChildren(screen);
    keepFitted(stage);
    stage.addEventListener("qw-wrong", strip.missed);
    // a right answer sparkles on the piece just tapped, and the what-to-do strip glows green for a moment
    let lastTap = null;
    stage.addEventListener("click", (e) => { lastTap = e.target.closest?.("button") ?? lastTap; }, true);
    const celebrate = () => {
      sparkle(lastTap);
      strip.good();
    };

    const ctx = {
      stage,
      words: pack.words,
      met: new Set([...Object.keys(cards), ...roomMet]),
      reread,
      faded,
      // prior: what already happened to this question when it is picked up again (an ayah tile left and reopened)
      item(ids, prior) { cur = startItem(ids, prior); asking += 1; hintLevel = 0; clearNudge(stage); stage.inert = false; },
      miss() { cur = withMiss(cur); },
      flags() { return flagsOf(cur); },
      wasHinted() { return gotHelp(cur); },
      note(key) { strip.flash(key, "note"); },
      // a wrong pick: the answer and the picked word go on the answer's card as a mix-up when the room is finished
      mix(id, picked) { session = recordMix(session, id, picked); },
      canGuess: !isFatihaRoom(room.id),
      // Answered: the stage takes no taps until the next item starts, so a quick second tap cannot skip or regrade one
      // (DES-07/08). The ayah step passes { stay: true }: its other tiles must stay tappable after each word.
      // { quiet: true }: no sparkle and no "right" sound (an answer that was given away is not a win).
      hit(opts) {
        if (!opts?.stay) stage.inert = true;
        if (!cur.ids.length) return;
        if (!opts?.quiet) celebrate();
        session = record(session, cur.ids, outcomeOf(cur));
        cur.ids.forEach((id) => { ctx.met.add(id); roomMet.add(id); });
        cur = NO_ITEM;
        asking += 1;
      },
      meet(ids) { ids.forEach((id) => { ctx.met.add(id); roomMet.add(id); }); },
      // a new target means the step is waiting for the next tap (a new item, or a ▶ after the last answer): unlock.
      // Keyboard players get focus once the step has drawn it (ui/keys.js): on the target itself when nothing is
      // being graded (the next word, the ▶), else on the first of the choices, never on the answer.
      target(el) {
        target = el;
        hintLevel = 0;
        clearNudge(stage);
        stage.inert = false;
        queueMicrotask(() => keepFocus(stage, cur.ids.length ? null : target, cur.ids.length ? target?.parentElement : null));
      },
      // The tutorial hand: the first time the player ever meets a game it shows where to tap. It points at the
      // answer, so a question answered under it is graded "hinted", never "easy". Never in the warm-up or the Last
      // Check. A player who answers before it comes has no need of it: it waits for the next question.
      firstShow() {
        if (NO_HAND.has(stepType) || shown.has(stepType)) return;
        const type = stepType;
        const [question, at] = [asking, target];
        later(() => {
          if (!alive || shown.has(type) || stepType !== type || asking !== question || target !== at || !at?.isConnected) return;
          shown.add(type);
          onHand(type);
          if (cur.ids.length) cur = withHand(cur);
          showMe(stage, at);
        }, HAND_AFTER_MS);
      },
    };

    // Show me (ui/hint.js): first a nudge, the answer only on the second request. Any help is graded (core/recall.js).
    hintBtn.addEventListener("click", () => {
      hintLevel++;
      const graded = cur.ids.length > 0;
      const line = giveHint(stage, target, hintLevel, graded);
      if (graded && line !== "hint_look") cur = withHint(cur, hintLevel);
      if (line) strip.flash(line, "note");
    });

    if (window.__QW_QA) window.__qw = { get target() { return target; }, get session() { return session; }, ctx };

    const say = (key) => {
      const bubble = h("div", { class: "qalam-say", role: "status" }, h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
        h("span", { "data-t": key }, t(key)));
      screen.append(bubble);
      later(() => bubble.remove(), 4000);
    };
    const total = room.steps.length + (withMastery ? 1 : 0);
    const checkpoint = (step, persist, masteryAt = null) => {
      lastAt = {
        room: room.id, step, steps: room.steps.length, results: session.results, met: [...roomMet].filter((id) => !cards[id]),
        ...(masteryAt ? { mastery: masteryAt } : {}),
      };
      onCheckpoint(lastAt, { persist });
    };
    // One part of the room (a step, the warm-up, the Last Check), with a safety net: if it throws, the player gets
    // "Something went wrong" with Try again (the part starts over) and Back to the map; when trying again fails too,
    // Skip this part, so one broken step can never lock the room and every room after it. The Last Check is never
    // skipped (canSkip false): skipping it would win the room without the check, and its checkpoint keeps the place.
    const attempt = async (run, { canSkip = true } = {}) => {
      for (let fails = 0; alive;) {
        try {
          await run();
          return;
        } catch {
          if (!alive) return;
          fails += 1;
          cur = NO_ITEM;
          asking += 1;
          target = null;
          const choice = await askOops(stage, { canSkip: canSkip && fails >= 2 });
          if (!alive) return;
          if (choice === "map") { leave(); return; }
          if (choice === "skip") return;
        }
      }
    };
    // before step i: a rest card if it is a rest stop (not the one the player is resuming at)
    const restBefore = async (i) => {
      if (!rests.includes(i) || i === start) return;
      checkpoint(i, true);
      say_how("how_rest");
      await restCard(ctx, i / total, Math.max(0, (meterAfter - meterBefore) * (i / total)));
    };
    const start = Math.min(resume?.step ?? 0, room.steps.length);
    for (let i = 0; i < start; i++) stepDots.children[i].className = "done";

    const runRoom = async () => {
      if (resume) say("resumeSay");
      setProgress(start);
      if (room.stakes?.words && !resume && !reread && !skipStakes) { say_how("how_stakes"); await stakesCard(ctx, room); if (!alive) return; }
      // Warm-up: a few fading words from earlier rooms come first, so review happens inside new play (MEMORY_SYSTEM §3)
      const warm = resume || reread ? [] : warmUpWords(cards, day, pack.words, [...room.teaches, ...room.reviews]);
      // ...and at most one pair of words the player keeps mixing up, side by side ("tell these apart")
      const own = new Set([...room.teaches, ...room.reviews]);
      const pairs = resume || reread ? [] : tellApartPairs(Object.values(cards).filter((c) => !own.has(c.id)), pack.words, 1);
      if (warm.length || pairs.length) {
        stepType = "warmup";
        say_how("how_warmup");
        // told apart first time, alone: the mix-up is settled on both cards (it is not asked again)
        const onTold = (a, b, clean) => {
          if (!clean) return;
          for (const [id, other] of [[a, b], [b, a]]) {
            const card = warmCards.get(id) ?? cards[id];
            const settled = card ? settleMixup(card, other) : card;
            if (settled && settled !== card) { warmCards.set(id, settled); onCard(settled); }
          }
        };
        const onResult = (id, outcome, mixed) => {
          const card = mixed.reduce(recordMixup, gradeFresh(warmCards.get(id) ?? cards[id], outcome, day, "warm"));
          warmCards.set(id, card);
          onCard(card); // into the save now: a pause or a closed game keeps the review
        };
        await attempt(() => warmup.run(ctx, { ids: warm, pairs, onResult, onTold }));
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
        const step = room.steps[i];
        await attempt(() => {
          stage.inert = false;
          return STEPS[stepType].run(ctx, step);
        });
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
        say_how(gentle ? "how_masteryGentle" : "how_mastery");
        stage.inert = false;
        // the check keeps its place: every answer goes into the checkpoint, so an interruption costs a few answers
        let masteryAt = resume?.step === room.steps.length ? resume.mastery ?? null : null;
        // a check picked up again keeps the words it had already begun with
        const begun = masteryAt ? masteryWords.filter((id) => [...(masteryAt.done ?? []), ...(masteryAt.half ?? [])].includes(id)) : [];
        const wanted = [...begun, ...checkWords(masteryWords, session.results).filter((id) => !begun.includes(id))].slice(0, Math.max(CHECK_CAP, begun.length));
        checked = masteryWords.filter((id) => wanted.includes(id));
        const onProgress = (snap, answers) => {
          masteryAt = snap;
          checkpoint(room.steps.length, answers % MASTERY_SAVE_EVERY === 0, snap);
        };
        await attempt(() => {
          stage.inert = false;
          return mastery.run(ctx, { words: checked, pool: masteryWords, distractors: room.reviews, resume: masteryAt, onProgress, gentle });
        }, { canSkip: false });
        if (!alive) return;
        dot.className = "done m";
      }
      setProgress(total);
      if (reread) { alive = false; return resolve({ finished: false }); }
      say_how("how_done");
      stage.inert = false;
      const out = [...finishRoom(session, room, cards, day, { checked: withMastery ? checked : null }), ...warmList()];
      // the room is won here, not when ▶ is tapped: the caller saves it before the card below is even drawn
      wonCards = out;
      onFinished(out);
      const pct = h("strong", { class: "done-pct" }, `${meterBefore}%`);
      const gained = Math.max(0, meterAfter - meterBefore);
      const report = progressReport(pack, { ...cards, ...Object.fromEntries(out.map((c) => [c.id, c])) }, day);
      // the words just won (up to 12 pictures) and what comes next, so the win is something you can see
      const won = room.teaches.filter((id) => pack.words[id]?.ar);
      const nextRoom = pack.rooms[pack.rooms.findIndex((r) => r.id === room.id) + 1];
      stage.replaceChildren(h("div", { class: "room-done" },
        // the win is shown, not only said: the lamp lights up inside a ring of sparks, the number counts up to its
        // new value and the words just won are dealt in one by one (CSS + ui/count-up.js; still under reduced motion)
        h("div", { class: "big-lamp lighting", "aria-hidden": "true" }, burst(), pic(sign("ui:lamp", "🪔"))),
        h("span", { class: "done-label", "data-t": "roomLit" }, t("roomLit")),
        // two honest numbers first (words met, words remembered now), then the share of the Qur'an, said for what it is
        h("div", { class: "done-counts" },
          h("div", { class: "done-count" }, h("strong", {}, String(report.met)), h("span", { "data-t": "wordsMet" }, t("wordsMet"))),
          h("div", { class: "done-count" }, h("strong", {}, String(report.remembered)), h("span", { "data-t": "rememberNow" }, t("rememberNow")))),
        h("div", { class: "done-meter" }, h("span", { class: "done-pct-row" }, pct, gained > 0 ? h("span", { class: "done-gain" }, `+${gained.toFixed(1)}%`) : null),
          h("span", { class: "done-meter-label", "data-t": "meterTip" }, t("meterTip"))),
        won.length ? h("div", { class: "won", "aria-hidden": "true" },
          ...won.slice(0, 12).map((id, n) => h("span", { class: "won-card", style: `--i:${n}` }, pic(pack.words[id].pic, pack.words[id].medal), ar(pack.words[id].ar, "won-ar"), sayLine(pack.words[id].say))),
          won.length > 12 ? h("span", { class: "won-more" }, `+${won.length - 12}`) : null) : null,
        won.length ? h("span", { class: "won-say" }, h("strong", {}, String(won.length)), " ", h("span", { "data-t": "wonSay" }, t("wonSay"))) : null,
        nextRoom ? h("div", { class: "next-up" }, h("span", { "data-t": "nextUp" }, t("nextUp")), " ", cap(nextRoom.title, "cap title-cap")) : null,
        h("button", { class: "next-btn", "aria-label": t("next"), onclick: leave }, nextIcon())));
      play("lamp");
      target = stage.querySelector(".next-btn");
      await wait(400);
      countUp(pct, meterBefore, meterAfter, () => pct.classList.add("rise"));
    };
    // anything outside a step that still throws (drawing a card, the room's own bookkeeping) ends the room with
    // `failed`, and main.js shows the same card full screen
    runRoom().catch(() => {
      if (!alive) return;
      alive = false;
      strip.stop();
      resolve(wonCards ? { finished: true, cards: wonCards } : { finished: false, failed: true, warm: warmList() });
    });
  });
}
