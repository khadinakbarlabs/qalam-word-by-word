// The Library map: a lamp-lit path of room doors, wing after wing (Entrance Hall, then the Garden Courtyard…). Done
// rooms glow, the next door pulses, later doors are locked. With 92 rooms the whole path would scroll for ever, so:
//   - a strip under the header shows every wing as a chip with its lit / total count, and a button that jumps to
//     the player's next room;
//   - each wing starts with a heading (name, count, a small bar); only the wing the player is in is open, the others
//     are folded to their heading and open with one tap.
// A tap on a locked door answers: the door shakes and Qalam says which room to finish first.
import { sign } from "./signs.js";
import { h, cap, pic, said } from "./kit.js";
import { icon, nextIcon, WING_ICON } from "./icons.js";
import { later } from "../core/clock.js";
import { t } from "../i18n.js";
import { roomStates } from "../core/room.js";
import { wingGroups, openWings } from "../core/wings.js";

const NODE_GAP = 140; // px between doors along the path
const HEAD_GAP = 112; // px from a wing heading to what follows it, and from a wing's last door to the next heading
const TOP = 64; // the first heading's place
const LOCKED_SAY_MS = 3200; // how long Qalam answers a tap on a locked door
// Wing names (i18n keys); the icons are drawn in ui/icons.js (WING_ICON).
// Scrolls shorter than this would slice the first wing heading under the wing strip.
const HEAD_CUT_PX = 120;

export const WING_NAMES = { 1: "hall", 2: "garden", 3: "scribes", 4: "tower", 5: "dome" };
export const wingIcon = (wing) => icon(WING_ICON[wing] ?? "hall");
// wings the player opened or folded by hand, kept while the game is open (wing -> true / false)
const wingChoice = new Map();

/** The lamp meter: a lantern that fills with light as coverage grows (docs/VISUAL_GAMES.md §1). */
export function meterEl(pct) {
  const fill = (26 * pct) / 100;
  const svg = `<svg viewBox="0 0 30 40" aria-hidden="true"><defs><clipPath id="lampClip"><path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z"/></clipPath></defs>
    <path d="M11 4 h8 l-2 6 h-4 z" fill="#8a6236"/><path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z" fill="#fffaf0" stroke="#8a6236" stroke-width="2"/>
    <rect x="6" y="${36 - fill}" width="18" height="${fill}" fill="#f2b84b" clip-path="url(#lampClip)"/></svg>`;
  // the number says what it is: the share of the Qur'an's words the player has MET (not "knows for good")
  const el = h("div", { class: "meter", "data-tip": "meter", "aria-label": `${pct}% ${t("meterTip")}` },
    h("span", { class: "meter-text" }, h("strong", {}, `${pct}%`), h("span", { class: "meter-label", "data-t": "meterLabel" }, t("meterLabel"))));
  el.insertAdjacentHTML("afterbegin", svg);
  return el;
}

const DOOR_TIP = { done: "doorDone", next: "doorNext", locked: "doorLocked", soon: "doorSoon" };

/** The wings of the map, in order: { wing, rooms: [node], done, total }. */
export { wingGroups, openWings } from "../core/wings.js";
export function renderMap(root, { pack, save, meterPct, due, canPractice = false, onRoom, onRelight, onPractice = () => {}, onSettings, onGuide }) {
  const states = roomStates(pack, save.rooms);
  const nodes = [
    ...pack.rooms.map((r, i) => ({ id: r.id, art: r.art && pack.words[r.art]?.pic, title: r.title, wing: r.wing, state: states[i] })),
    ...pack.coming.map((r) => ({ ...r, wing: r.wing ?? pack.rooms.at(-1).wing, state: "soon" })),
  ];
  const groups = wingGroups(nodes);
  // every room done and nothing on the way: the path ends in a plaque that says so (Playables DES-16)
  const allDone = states.length > 0 && states.every((s) => s === "done") && !pack.coming.length;
  const nextNode = nodes.find((n) => n.state === "next") ?? null;

  const scroll = h("div", { class: "hall-scroll" });
  const bannerIcon = h("span", { class: "banner-icon", "aria-hidden": "true" });
  const bannerName = h("span", { "aria-live": "polite" });
  const bannerCount = h("span", { class: "banner-count" });
  const banner = h("div", { class: "hall-banner" }, bannerIcon, bannerName, bannerCount);
  // door buttons by room id, so main.js can show one as "opening" while its wing file loads
  const doorOf = new Map();
  const headOf = new Map();
  let heads = []; // { wing, y } of every heading, for the sticky banner

  const bubble = h("div", { class: "qalam-say map-say", role: "status" });
  const qalam = () => h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️")));
  const sayNext = () => bubble.replaceChildren(qalam(),
    allDone ? h("span", { class: "all-done-say", "data-t": "allDoneShort" }, t("allDoneShort"))
      // the next room by name, and what to do: beginners read the map from this line
      : nextNode ? h("span", { class: "map-next" },
        h("span", { class: "map-next-name" }, h("span", { "data-t": "mapNext" }, t("mapNext")), " ", cap(nextNode.title, "cap title-cap")),
        h("span", { class: "map-next-do", "data-t": "mapTapDoor" }, t("mapTapDoor")))
        : h("span", {}, pic(sign("ui:lamp", ""))));
  // a tap on a locked door: it shakes, and Qalam says which room comes first (then his usual line comes back)
  let dropSay = () => {};
  const lockedTap = (door) => {
    door.classList.remove("nope");
    void door.offsetWidth;
    door.classList.add("nope");
    if (!nextNode) return;
    dropSay();
    bubble.replaceChildren(qalam(), h("span", { class: "map-next" },
      h("span", { class: "map-next-do", "data-t": "doorLockedSay" }, t("doorLockedSay")),
      h("span", { class: "map-next-name" }, cap(nextNode.title, "cap title-cap"))));
    bubble.classList.add("answer");
    dropSay = later(() => { bubble.classList.remove("answer"); if (bubble.isConnected) sayNext(); }, LOCKED_SAY_MS);
  };

  const countText = (g) => `${g.done} / ${g.total}`;
  const wingLabel = (g) => `${t(WING_NAMES[g.wing] ?? "hall")}: ${g.done} / ${g.total} ${t("mapRooms")}`;
  const setBanner = (wing) => {
    const g = groups.find((x) => x.wing === wing);
    if (!g || banner.dataset.wing === String(wing)) return;
    banner.dataset.wing = String(wing);
    bannerIcon.replaceChildren(wingIcon(wing));
    bannerName.dataset.t = WING_NAMES[wing] ?? "hall";
    bannerName.textContent = t(bannerName.dataset.t);
    bannerCount.textContent = countText(g);
  };

  const door = (n, x, y) => {
    const clickable = n.state === "done" || n.state === "next";
    const el = h("button", {
      class: `door ${n.state}`, style: `left:${x}%;top:${y}px`, "aria-disabled": clickable ? undefined : "true", "data-tip": DOOR_TIP[n.state],
      "aria-label": `${said(n.title)}${n.state === "soon" ? ` (${t("soon")})` : ""}`,
      onclick: clickable ? () => onRoom(n.id) : () => lockedTap(el),
    },
      h("span", { class: "arch" }, n.art?.startsWith("img:") ? pic(n.art) : h("span", { class: "door-icon", "aria-hidden": "true" }, wingIcon(n.wing))),
      h("span", { class: "door-lamp", "aria-hidden": "true" }, n.state === "done" ? pic(sign("ui:lamp", "")) : n.state === "next" ? pic(sign("ui:spark", "")) : icon("lock")),
      cap(n.title, "cap door-cap"));
    doorOf.set(n.id, el);
    return el;
  };

  /** Draw the path: every wing's heading, and the doors of the wings that are open. */
  const draw = () => {
    const open = openWings(groups, wingChoice);
    const items = [];
    let y = TOP;
    let k = 0; // doors drawn so far (they zig-zag left and right)
    for (const g of groups) {
      const isOpen = open.has(g.wing);
      if (items.length) y += HEAD_GAP;
      items.push({ kind: "head", g, isOpen, x: 50, y, lit: g.done > 0 });
      if (!isOpen) continue;
      g.rooms.forEach((n, i) => {
        y += i ? NODE_GAP : HEAD_GAP;
        const x = (k % 2 === 0 ? 30 : 70) + (k % 4 === 1 ? 4 : k % 4 === 3 ? -4 : 0);
        k += 1;
        items.push({ kind: "door", n, x, y, lit: n.state === "done" });
      });
    }
    const last = items.at(-1);
    const endY = last.y + 128;
    const height = allDone ? endY + 90 : last.y + (last.kind === "door" ? 96 : 60);
    const d = (list) => list.map((it, i) => `${i ? "L" : "M"}${it.x} ${it.y}`).join(" ");
    const litTo = items.findLastIndex((it) => it.lit);
    doorOf.clear();
    headOf.clear();
    heads = items.filter((it) => it.kind === "head").map((it) => ({ wing: it.g.wing, y: it.y }));
    const els = items.map((it) => {
      if (it.kind === "door") return door(it.n, it.x, it.y);
      const { g } = it;
      const whole = g.done === g.total;
      const head = h("button", {
        class: `wing-head${it.isOpen ? " open" : ""}${whole ? " whole" : ""}${g.done ? "" : " ahead"}`, style: `top:${it.y}px`, "aria-expanded": String(it.isOpen),
        "aria-label": `${wingLabel(g)}. ${t(it.isOpen ? "mapHideRooms" : "mapShowRooms")}`,
        onclick: () => { wingChoice.set(g.wing, !it.isOpen); draw(); showWing(g.wing); headOf.get(g.wing)?.focus({ preventScroll: true }); },
      },
        h("span", { class: "wing-head-icon", "aria-hidden": "true" }, wingIcon(g.wing)),
        h("span", { class: "wing-head-text" },
          h("span", { class: "wing-head-name", "data-t": WING_NAMES[g.wing] ?? "hall" }, t(WING_NAMES[g.wing] ?? "hall")),
          h("span", { class: "wing-head-count" }, h("strong", {}, countText(g)), " ", h("span", { "data-t": whole ? "wingAllLit" : "mapRooms" }, t(whole ? "wingAllLit" : "mapRooms"))),
          h("span", { class: "wing-bar", "aria-hidden": "true" }, h("i", { style: `--p:${g.total ? g.done / g.total : 0}` }))),
        h("span", { class: "wing-head-toggle" }, h("span", { "data-t": it.isOpen ? "mapHideRooms" : "mapShowRooms" }, t(it.isOpen ? "mapHideRooms" : "mapShowRooms")), icon("next", "wing-chevron")));
      headOf.set(g.wing, head);
      return head;
    });
    const endPlaque = allDone
      ? h("div", { class: "hall-end", style: `top:${endY}px` },
        h("span", { class: "hall-end-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", ""))), h("span", { "data-t": "allDone" }, t("allDone")))
      : null;
    scroll.replaceChildren(h("div", { class: "hall-map", style: `height:${height}px` },
      banner, htmlSvg(d(items), litTo > 0 ? d(items.slice(0, litTo + 1)) : "", height), els, endPlaque));
    delete banner.dataset.wing;
    follow();
  };

  const follow = () => {
    const line = scroll.scrollTop + banner.offsetHeight + 40;
    const head = heads.filter((w) => w.y <= line).at(-1) ?? heads[0];
    setBanner(head?.wing);
    // the banner names the wing only once that wing's own heading has scrolled out of sight
    banner.classList.toggle("shown", Boolean(head) && head.y + 30 < scroll.scrollTop);
  };
  // scroll inside the map only (never the page): a door goes to the middle, a heading just under the sticky banner
  const scrollTo = (el, block = "center") => {
    if (!el) return;
    const y = parseFloat(el.style.top) || 0;
    const top = Math.max(0, block === "center" ? y - scroll.clientHeight / 2 : y - banner.offsetHeight - 44);
    // a small scroll would only cut the first wing heading in half under the strip: stay at the very top instead
    scroll.scrollTop = top < HEAD_CUT_PX ? 0 : top;
  };
  const showWing = (wing) => scrollTo(headOf.get(wing), "start");
  /** Jump to the player's next room (its wing opens if it was folded). */
  const jump = () => {
    if (!nextNode) return scrollTo(scroll.querySelector(".hall-end") ?? headOf.get(groups.at(-1).wing));
    if (!doorOf.has(nextNode.id)) { wingChoice.set(nextNode.wing, true); draw(); }
    scrollTo(doorOf.get(nextNode.id));
    doorOf.get(nextNode.id)?.focus({ preventScroll: true });
  };

  // The overview: one chip per wing with its count; a tap goes to that wing. Then "go to my next room".
  const strip = h("nav", { class: "wing-strip", "aria-label": t("mapWings"), "data-t-aria": "mapWings" },
    groups.map((g) => h("button", {
      class: `wing-chip${g.done === g.total ? " whole" : ""}${g.rooms.some((n) => n.state === "next") ? " here" : ""}`, "aria-label": wingLabel(g), "data-tip": undefined,
      onclick: () => showWing(g.wing),
    }, wingIcon(g.wing), h("span", { class: "wing-chip-count" }, countText(g)))),
    nextNode ? h("button", { class: "wing-chip jump", "aria-label": t("mapJump"), "data-t-aria": "mapJump", onclick: jump }, nextIcon()) : null);

  // Relight shows only while words wait: a greyed-out "0" button puzzled new players (POLISH_PLAN B5)
  // The lamps to relight are said in ONE place: this button (its number). With nothing due it offers Quick practice
  // instead, a short round that is never graded (core/practice.js).
  const relight = due
    ? h("button", { class: "relight-btn due", "aria-label": `${t("relight")} ${due}`, onclick: onRelight, "data-tip": "relight" },
      pic(sign("ui:relight", "")), h("span", { class: "due-count" }, String(due)), h("span", { class: "cap", "data-t": "relight" }, t("relight")))
    : h("button", { class: "relight-btn practice", hidden: !canPractice, "aria-label": t("practice"), "data-t-aria": "practice", onclick: onPractice, "data-tip": "practice" },
      pic(sign("ui:relight", "")), h("span", { class: "cap", "data-t": "practice" }, t("practice")));
  // Guide and Settings sit in the bottom dock with labels, away from the top corners where YouTube draws its own
  // controls (Playables DES-20).
  const dockBtn = (name, labelKey, ariaKey, tipKey, onclick) => h("button", {
    class: "dock-btn", "data-t-aria": ariaKey, "aria-label": t(ariaKey), "data-tip": tipKey, onclick,
  }, h("span", { class: "dock-icon", "aria-hidden": "true" }, icon(name)), h("span", { class: "dock-label", "data-t": labelKey }, t(labelKey)));

  const hall = h("section", { class: "hall" },
    h("header", { class: "hall-top" },
      h("span", { class: "brand", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
      h("span", { class: "game-title", "data-t": "title" }, t("title")),
      meterEl(meterPct)),
    strip,
    scroll,
    // Relight floats just above the dock whatever the dock's height, so it never covers Guide or Settings
    h("div", { class: "map-foot" }, relight,
      h("div", { class: "map-dock" }, bubble,
        dockBtn("guide", "guideShort", "guide", "guide", onGuide),
        dockBtn("gear", "settings", "settings", undefined, onSettings))));
  sayNext();
  root.replaceChildren(hall);
  draw();
  /** A door was tapped and its room is loading: that door breathes, Qalam says "Opening…", and the whole map takes
   *  no other tap until main.js draws the next screen (the room, or the map again after a failed load). */
  const setOpening = (id) => {
    const el = doorOf.get(id);
    el?.classList.add("opening");
    el?.setAttribute("aria-busy", "true");
    dropSay();
    bubble.replaceChildren(qalam(), h("span", { class: "map-opening", "data-t": "doorOpening" }, t("doorOpening")));
    hall.inert = true;
  };
  let ticking = false;
  scroll.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; follow(); }); } }, { passive: true });
  const first = nextNode ? doorOf.get(nextNode.id) : headOf.get(groups.at(-1)?.wing);
  requestAnimationFrame(() => { scrollTo(nextNode ? first : scroll.querySelector(".hall-end") ?? first); follow(); });
  return { target: first, setOpening };
}

function htmlSvg(path, litPath, height) {
  const wrap = h("div", { class: "hall-path", "aria-hidden": "true" });
  wrap.innerHTML = `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" width="100%" height="${height}">
    <path d="${path}" fill="none" stroke="#d9c49c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <path d="${path}" fill="none" stroke="#efe2c4" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${litPath.includes("L") ? `<path d="${litPath}" fill="none" stroke="#f2b84b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` : ""}
  </svg>`;
  return wrap;
}
