// Small DOM kit shared by every screen: element builder, Arabic spans, the picture language, captions, hints.
import { icon } from "./icons.js";
import { play } from "./sound.js";
import { lang, t, plainDigits } from "../i18n.js";
import { wait, later } from "../core/clock.js";
import { pickOptions, withFace } from "../core/options.js";
import { isCalligraphy } from "../core/face.js";

// every step pauses through the game clock, so a YouTube pause freezes them (core/clock.js)
export { wait };

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

export const ar = (text, cls = "") => h("span", { lang: "ar", dir: "rtl", class: cls }, text);

/** A meaning or title said in the player's language (screen-reader labels: never English for an Urdu player). */
export const said = (g) => plainDigits(g?.[lang()] ?? g?.en ?? "");

/** Caption under a picture: optional text in the player's language (hidden when captions are off). */
export function cap(g, cls = "cap") {
  return h("span", { class: cls, "data-en": g.en, "data-ur": g.ur, lang: lang() === "ur" ? "ur" : "en" }, plainDigits(g[lang()] ?? g.en));
}

/** The picture language: a painted picture ("img:art/x.webp") or emoji, with ▲ he-word / ● she-word badges, or
 *  calligraphy, never both. Calligraphy is a
 *  glowing medallion for names of Allah and abstract words, or a parchment scroll ("scroll:…") for names of prophets, angels and revealed books, or plain ink
 *  ("plain:…") where no picture is allowed and no honour is meant (Shaytan). */
export function pic(p, medal) {
  const frame = typeof medal === "string" && medal.match(/^(scroll|plain):/)?.[1];
  if (frame) return h("span", { class: `medal ${frame}`, lang: "ar", dir: "rtl", "data-tip": frame }, medal.slice(frame.length + 1));
  if (medal || (typeof p === "string" && p.startsWith("medal:"))) {
    return h("span", { class: "medal", lang: "ar", dir: "rtl", "data-tip": "medal" }, medal ?? p.slice(6));
  }
  const text = p ?? "";
  const badge = text.match(/[▲●]$/)?.[0];
  const body = text.replace(/[▲●]$/, "");
  const art = body.startsWith("img:")
    ? h("img", { class: "pic-img", src: body.slice(4), alt: "", draggable: "false", decoding: "async", loading: "lazy" })
    : body;
  return h("span", { class: `pic${art === body ? "" : " has-img"}`, "aria-hidden": "true" }, art,
    badge ? h("span", { class: `badge ${badge === "▲" ? "m" : "f"}`, "data-tip": badge === "▲" ? "m" : "f" }, badge) : null);
}

// ---- meaning, not shape (core/face.js) ----
/** A meaning written out as text, in the player's language. Unlike a caption it is never hidden: for a calligraphy
 *  word it is the only thing that says what the word means. */
export const means = (g, cls = "means") => h("span", { class: cls, "data-en": g.en, "data-ur": g.ur, lang: lang() === "ur" ? "ur" : "en" }, g[lang()] ?? g.en);

/** The MEANING side of a word as an answer choice: its picture and caption, or, for a calligraphy word (a Name of
 *  Allah, a prophet's name, a word with no picture), a plain medallion with the meaning written in it and no Arabic,
 *  so the choice cannot be matched to the Arabic by its shape. Returns a list of nodes. */
export function meaningChoice(face) {
  if (!isCalligraphy(face)) return [pic(face.pic, face.medal), cap(face.g)];
  const frame = typeof face.medal === "string" && face.medal.match(/^(scroll|plain):/)?.[1];
  return [h("span", { class: `medal means-medal${frame ? ` ${frame}` : ""}`, "data-tip": frame || "medal" }, means(face.g))];
}

/** The MEANING side of a word as a prompt: a large picture with its caption, or the written meaning. */
export function meaningPrompt(face) {
  if (!isCalligraphy(face)) return h("span", { class: "big-pic" }, pic(face.pic, face.medal), cap(face.g));
  return h("span", { class: "big-means" }, means(face.g));
}

/** "How to say it" under an Arabic word: shown only when the player turned it on in Settings (body.say-on). */
export const sayLine = (text) => (text ? h("span", { class: "say", lang: "en", dir: "ltr" }, text) : null);

/** An Arabic word with its "how to say it" line under it (the line stays hidden until the setting is on). */
export const arSay = (face, cls = "") => h("span", { class: "ar-say" }, ar(face.ar, cls), sayLine(face.say));

/** A word and its meaning side by side: كِتَاب = book. Shown for a beat after a right answer, and in the helper strip
 *  for the choice the player tapped by mistake, so every answer teaches a pairing. */
export const pairLine = (face, cls = "pair") => h("span", { class: cls }, ar(face.ar, "pair-ar"), sayLine(face.say), h("span", { class: "pair-eq", "aria-hidden": "true" }, "="), means(face.g, "pair-g"));

/** Answer options for a word: the answer, its most easily mistaken words, then others; never two that look the same,
 *  and the answer's place comes from a seeded shuffle (core/options.js). `ids` is the pool of word ids; `extra` a
 *  wider pool used only when `ids` cannot fill n fair options. */
export const optionsFor = (words, ids, answerId, n, seed = 0, extra = []) => pickOptions(words, ids, answerId, n, seed, { extra });

export { withFace };

/** Progress dots for the items of a round. */
export const dots = (done, total) => h("div", { class: "dots", "aria-hidden": "true", "data-tip": "dots" }, Array.from({ length: total }, (_, k) => h("i", { class: k < done ? "on" : "" })));

// ---- show-me hand (hint 1) and reveal (hint 2) ----
const hand = h("div", { class: "hand", "aria-hidden": "true" }, icon("hand"));
export async function showMe(stage, target) {
  if (!target?.isConnected) return;
  // the hand lives on the screen layer (fixed, screen pixels): the stage may be zoomed to fit (ui/fit.js)
  const s = stage.getBoundingClientRect();
  const r = target.getBoundingClientRect();
  document.body.append(hand);
  hand.classList.remove("tap");
  hand.style.transition = "none";
  hand.style.transform = `translate(${s.left + s.width / 2}px, ${s.bottom - 40}px)`;
  hand.style.opacity = "1";
  await wait(30);
  const at = `translate(${r.left + r.width / 2 - 14}px, ${r.top + r.height / 2 - 6}px)`;
  hand.style.transition = "";
  hand.style.setProperty("--at", at);
  hand.style.transform = at;
  await wait(950);
  hand.classList.add("tap");
  await wait(1100);
  hand.classList.remove("tap");
  hand.style.opacity = "0";
}

/** A right answer: a small ✓ with a ring of gold sparks pops over the piece that was tapped, then fades (0.7 s).
 *  Fixed to the screen, so it never shifts the layout; aria-hidden (the "right" state is on the button itself). */
/** The full meaning of an ayah from the credited translator (pack `tr`, docs: data/source/README.md): the text in the
 *  player's language, then the translator's name. Shown even with captions off — it is content, not a caption. */
export function translationBlock(tr, cls = "ayah-tr") {
  if (!tr) return null;
  return h("div", { class: cls },
    h("span", { class: "tr-label", "data-t": "translation" }, t("translation")),
    cap(tr, "cap tr-text"),
    h("span", { class: "tr-by", "data-t": "trBy" }, t("trBy")));
}

/** A ring of gold sparks behind a lamp (room won, milestone): pure decoration, transform and opacity only. */
export const burst = (n = 12) => h("span", { class: "burst", "aria-hidden": "true" }, Array.from({ length: n }, (_, k) => h("i", { style: `--a:${(360 / n) * k}deg;--i:${k}` })));

const MISS_MS = 1300;
/** A wrong tap is answered where the player is looking: a small "✕ Not this one" tag sits on the tapped piece for a
 *  moment (the helper strip at the top says why). Fixed to the screen, so it never shifts the layout. */
function missTag(el) {
  if (!el?.isConnected) return;
  const r = el.getBoundingClientRect();
  const tag = h("span", { class: "miss-tag", "aria-hidden": "true", lang: lang(), style: `left:${r.left + r.width / 2}px;top:${Math.max(28, r.top)}px` }, icon("close"), t("missShort"));
  document.body.append(tag);
  later(() => tag.remove(), MISS_MS);
}

export function sparkle(el) {
  play("right");
  if (!el?.isConnected) return;
  const r = el.getBoundingClientRect();
  const fx = h("span", { class: "sparkle", "aria-hidden": "true", style: `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px` },
    icon("check"), ...Array.from({ length: 6 }, (_, k) => h("i", { style: `--a:${k * 60}deg` })));
  document.body.append(fx);
  later(() => fx.remove(), 700);
}

/** A wrong tap: the piece shakes, and a "qw-wrong" event bubbles up so the room can say "try again" (ui/room.js).
 *  why: an i18n key from core/confusable.js whyNot() ("why_look", "why_root"); the room swaps it into its strip.
 *  picked: the word (or ayah tile) the player tapped, { ar, g, say }: the strip shows what it really is
 *  ("كِتَاب = book"), so a wrong tap teaches that pairing instead of only saying "no". */
export function wobble(el, why, picked) {
  el.classList.remove("wrong");
  void el.offsetWidth;
  el.classList.add("wrong");
  missTag(el);
  el.dispatchEvent(new CustomEvent("qw-wrong", { bubbles: true, detail: { why, picked: picked?.ar && picked?.g ? picked : null } }));
}
