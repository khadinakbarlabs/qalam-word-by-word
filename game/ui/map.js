// The Library map: a lamp-lit path of room doors, wing after wing (Entrance Hall, then a gate into the Garden Courtyard). Done rooms glow, the next door pulses, later doors
// are locked; rooms still being built show as locked previews so the road ahead is visible.
import { sign } from "./signs.js";
import { h, cap, pic } from "./kit.js";
import { t } from "../i18n.js";
import { roomStates } from "../core/room.js";

const NODE_GAP = 132; // px between doors along the path
const GATE_GAP = 84; // extra room where one wing ends and the next begins
// Wing gates: i18n key and icon; Wing 1 is the hall banner itself.
export const WING_NAMES = { 1: "hall", 2: "garden", 3: "scribes", 4: "tower", 5: "dome" };
export const WING_ICONS = { 1: "🏛️", 2: "🌿", 3: "✒️", 4: "🏮", 5: "🕌" };

/** The lamp meter: a lantern that fills with light as coverage grows (docs/VISUAL_GAMES.md §1). */
export function meterEl(pct) {
  const fill = (26 * pct) / 100;
  const svg = `<svg viewBox="0 0 30 40" aria-hidden="true"><defs><clipPath id="lampClip"><path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z"/></clipPath></defs>
    <path d="M11 4 h8 l-2 6 h-4 z" fill="#8a6236"/><path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z" fill="#fffaf0" stroke="#8a6236" stroke-width="2"/>
    <rect x="6" y="${36 - fill}" width="18" height="${fill}" fill="#f2b84b" clip-path="url(#lampClip)"/></svg>`;
  const el = h("div", { class: "meter", "data-tip": "meter", "data-t-aria": "meterTip", "aria-label": `${pct}% ${t("meterTip")}` }, h("strong", {}, `${pct}%`));
  el.insertAdjacentHTML("afterbegin", svg);
  return el;
}

const DOOR_TIP = { done: "doorDone", next: "doorNext", locked: "doorLocked", soon: "doorSoon" };

export function renderMap(root, { pack, save, meterPct, due, onRoom, onRelight, onSettings, onGuide }) {
  const states = roomStates(pack, save.rooms);
  const nodes = [
    ...pack.rooms.map((r, i) => ({ id: r.id, icon: r.icon, art: r.art && pack.words[r.art]?.pic, title: r.title, wing: r.wing, state: states[i] })),
    ...pack.coming.map((r) => ({ ...r, wing: r.wing ?? pack.rooms.at(-1).wing, state: "soon" })),
  ];
  const xs = nodes.map((_, i) => (i % 2 === 0 ? 30 : 70) + (i % 4 === 1 ? 4 : i % 4 === 3 ? -4 : 0));
  const gateAt = nodes.map((n, i) => i > 0 && n.wing !== nodes[i - 1].wing);
  const ys = [];
  nodes.forEach((_, i) => ys.push(i ? ys[i - 1] + NODE_GAP + (gateAt[i] ? GATE_GAP : 0) : 70));
  // every room done and nothing on the way: the path ends in a plaque that says so (Playables DES-16)
  const allDone = states.length > 0 && states.every((s) => s === "done") && !pack.coming.length;
  const endY = ys.at(-1) + 128;
  const height = allDone ? endY + 90 : ys.at(-1) + 50;
  const gateY = (i) => ys[i] - NODE_GAP / 2 - GATE_GAP / 2;
  const gates = nodes.flatMap((n, i) => (gateAt[i] && n.wing !== 1 && WING_NAMES[n.wing]
    ? [h("div", { class: "wing-gate", style: `top:${gateY(i)}px` },
      h("span", { "aria-hidden": "true" }, WING_ICONS[n.wing]), h("span", { "data-t": WING_NAMES[n.wing] }, t(WING_NAMES[n.wing])))]
    : []));
  const path = nodes.map((_, i) => `${i ? "L" : "M"}${xs[i]} ${ys[i]}`).join(" ");
  const lit = Math.max(0, states.lastIndexOf("done"));
  const litPath = nodes.slice(0, lit + 1).map((_, i) => `${i ? "L" : "M"}${xs[i]} ${ys[i]}`).join(" ");

  const doors = nodes.map((n, i) => {
    const clickable = n.state === "done" || n.state === "next";
    const door = h("button", {
      class: `door ${n.state}`, style: `left:${xs[i]}%;top:${ys[i]}px`, "aria-disabled": clickable ? undefined : "true", "data-tip": DOOR_TIP[n.state],
      "aria-label": `${n.title.en}${n.state === "soon" ? ` (${t("soon")})` : ""}`,
      onclick: clickable ? () => onRoom(n.id) : undefined,
    },
      h("span", { class: "arch" }, n.art?.startsWith("img:") ? pic(n.art) : h("span", { class: "door-icon", "aria-hidden": "true" }, n.icon)),
      h("span", { class: "door-lamp", "aria-hidden": "true" }, pic(n.state === "done" ? sign("ui:lamp", "🪔") : n.state === "next" ? sign("ui:spark", "✨") : sign("ui:lock", "🔒"))),
      cap(n.title, "cap door-cap"));
    return door;
  });

  const nextIdx = states.indexOf("next");
  // Relight shows only while words wait: a greyed-out "0" button puzzled new players (POLISH_PLAN B5)
  const relight = h("button", { class: "relight-btn due", hidden: !due, "aria-label": `${t("relight")} ${due}`, onclick: onRelight, "data-tip": "relight" },
    pic(sign("ui:relight", "🔁")), h("span", { class: "due-count" }, String(due)), h("span", { class: "cap", "data-t": "relight" }, t("relight")));
  const bubble = h("div", { class: "qalam-say map-say", role: "status" },
    h("span", { class: "qalam-mini", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
    allDone ? h("span", { class: "all-done-say", "data-t": "allDoneShort" }, t("allDoneShort"))
      : due ? h("span", {}, pic(sign("ui:relight", "🔁")), h("span", { class: "cap", "data-t": "relightDue" }, ` ${due} ${t("relightDue")}`))
        // the next room by name, and what to do: beginners read the map from this line
        : nextIdx >= 0 ? h("span", { class: "map-next" },
          h("span", { class: "map-next-name" }, h("span", { "data-t": "mapNext" }, t("mapNext")), " ", cap(nodes[nextIdx].title, "cap title-cap")),
          h("span", { class: "map-next-do", "data-t": "mapTapDoor" }, t("mapTapDoor")))
          : h("span", {}, pic(sign("ui:lamp", "🪔"))));
  const endPlaque = allDone
    ? h("div", { class: "hall-end", style: `top:${endY}px` },
      h("span", { class: "hall-end-lamp", "aria-hidden": "true" }, pic(sign("ui:lamp", "🪔"))), h("span", { "data-t": "allDone" }, t("allDone")))
    : null;
  // Guide and Settings sit in the bottom dock with labels, away from the top corners where YouTube draws its own
  // controls (Playables DES-20).
  const dockBtn = (icon, labelKey, ariaKey, tipKey, onclick) => h("button", {
    class: "dock-btn", "data-t-aria": ariaKey, "aria-label": t(ariaKey), "data-tip": tipKey, onclick,
  }, h("span", { class: "dock-icon", "aria-hidden": "true" }, icon), h("span", { class: "dock-label", "data-t": labelKey }, t(labelKey)));

  // The sticky banner names the wing being scrolled through: a wing starts once its gate passes under the banner.
  const wingStarts = [{ wing: nodes[0]?.wing ?? 1, y: -Infinity }, ...nodes.flatMap((n, i) => (gateAt[i] ? [{ wing: n.wing, y: gateY(i) }] : []))];
  const bannerIcon = h("span", { "aria-hidden": "true" });
  const bannerName = h("span", { "aria-live": "polite" });
  const banner = h("div", { class: "hall-banner" }, bannerIcon, bannerName);
  let shownWing = null;
  const setWing = (wing) => {
    if (wing === shownWing || !WING_NAMES[wing]) return;
    shownWing = wing;
    bannerIcon.textContent = WING_ICONS[wing];
    bannerName.dataset.t = WING_NAMES[wing];
    bannerName.textContent = t(WING_NAMES[wing]);
  };
  setWing(wingStarts[0].wing);
  const scroll = h("div", { class: "hall-scroll" },
    h("div", { class: "hall-map", style: `height:${height}px` },
      banner,
      htmlSvg(path, litPath, height),
      gates, doors, endPlaque));
  root.replaceChildren(h("section", { class: "hall" },
    h("header", { class: "hall-top" },
      h("span", { class: "brand", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
      h("span", { class: "game-title", "data-t": "title" }, t("title")),
      meterEl(meterPct)),
    scroll,
    // Relight floats just above the dock whatever the dock's height, so it never covers Guide or Settings
    h("div", { class: "map-foot" }, relight,
      h("div", { class: "map-dock" }, bubble,
        dockBtn("🗂️", "guideShort", "guide", "guide", onGuide),
        dockBtn("⚙️", "settings", "settings", undefined, onSettings)))));
  const focus = doors[nextIdx >= 0 ? nextIdx : lit];
  let ticking = false;
  const follow = () => {
    ticking = false;
    const line = scroll.scrollTop + banner.offsetHeight;
    setWing(wingStarts.filter((w) => w.y <= line).at(-1).wing);
  };
  scroll.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(follow); } }, { passive: true });
  requestAnimationFrame(() => { scroll.scrollTop = Math.max(0, (ys[nextIdx >= 0 ? nextIdx : lit] ?? 0) - scroll.clientHeight / 2); follow(); });
  return { target: focus };
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
