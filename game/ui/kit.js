// Small DOM kit shared by every screen: element builder, Arabic spans, the picture language, captions, hints.
import { play } from "./sound.js";
import { lang, t } from "../i18n.js";
import { wait, later } from "../core/clock.js";
import { pickOptions } from "../core/confusable.js";

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
export const rotate = (a, k) => a.slice(k % a.length).concat(a.slice(0, k % a.length));

/** Caption under a picture: optional text in the player's language (hidden when captions are off). */
export function cap(g, cls = "cap") {
  return h("span", { class: cls, "data-en": g.en, "data-ur": g.ur, lang: lang() === "ur" ? "ur" : "en" }, g[lang()] ?? g.en);
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

/** Pick n options: the answer plus n-1 others, in a stable but varied order (no Math.random: reproducible QA). */
export function options(list, index, n, seed = 0) {
  const others = list.filter((_, j) => j !== index);
  const picked = [list[index], ...Array.from({ length: Math.min(n - 1, others.length) }, (_, k) => others[(index + seed + k * 2) % others.length])];
  return rotate([...new Set(picked)], index + seed);
}

/** Answer chips for a word: the answer, its most easily mistaken words, then others (core/confusable.js). Replaces
 *  index-based picking where a wrong chip should be a real mix-up. `ids` is the pool of word ids. */
export const optionsFor = (words, ids, answerId, n, seed = 0) => pickOptions(words, ids, answerId, n, seed);

/** Progress dots for the items of a round. */
export const dots = (done, total) => h("div", { class: "dots", "aria-hidden": "true", "data-tip": "dots" }, Array.from({ length: total }, (_, k) => h("i", { class: k < done ? "on" : "" })));

// ---- show-me hand (hint 1) and reveal (hint 2) ----
const hand = h("div", { class: "hand", "aria-hidden": "true" }, "👆");
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

export function sparkle(el) {
  play("right");
  if (!el?.isConnected) return;
  const r = el.getBoundingClientRect();
  const fx = h("span", { class: "sparkle", "aria-hidden": "true", style: `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px` },
    "✓", ...Array.from({ length: 6 }, (_, k) => h("i", { style: `--a:${k * 60}deg` })));
  document.body.append(fx);
  later(() => fx.remove(), 700);
}

/** A wrong tap: the piece shakes, and a "qw-wrong" event bubbles up so the room can say "try again" (ui/room.js). */
export function wobble(el, why) {
  el.classList.remove("wrong");
  void el.offsetWidth;
  el.classList.add("wrong");
  // why: an i18n key from core/confusable.js whyNot() ("why_look", "why_root"); the room swaps it into its strip
  el.dispatchEvent(new CustomEvent("qw-wrong", { bubbles: true, detail: { why } }));
}
