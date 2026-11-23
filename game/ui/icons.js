// The game's own icons, drawn here as inline SVG so they look the same on every phone (system emoji differ from
// device to device, and some are missing on older Android). One style: a 24 px grid, round 2 px ink strokes
// (currentColor), with soft fills from the CSS colour tokens. No letters, no faces. The painted word pictures stay as
// they are; these are only for controls and small signs.
const GOLD = "var(--gold)";
const GLOW = "var(--lamp-glow)";
const CARD = "var(--card)";
const LINE = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const stroke = (d, width = 2) => `<path d="${d}" fill="none" ${LINE.replace('"2"', `"${width}"`)}/>`;
const solid = (d) => `<path d="${d}" fill="currentColor"/>`;
const soft = (d, color = GOLD) => `<path d="${d}" fill="${color}" ${LINE}/>`;
const dot = (cx, cy, r, color = GOLD) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" ${LINE}/>`;

// one finger up, the others folded (used by the pointing hand and the press-and-hold hand)
const FINGER = "M9.5 12V5.2a1.7 1.7 0 0 1 3.4 0V10l4.3.7a2.3 2.3 0 0 1 2 2.6l-.6 4.2a4 4 0 0 1-4 3.5H12a4 4 0 0 1-3.3-1.7l-3.2-4.6a1.6 1.6 0 0 1 2.5-2z";

const SHAPES = {
  // forward points right, back points left; the .ico-dir class mirrors both on right-to-left pages
  next: solid("M8 4.6v14.8a1 1 0 0 0 1.5.8l11-7.4a1 1 0 0 0 0-1.6l-11-7.4A1 1 0 0 0 8 4.6z"),
  back: solid("M16 4.6v14.8a1 1 0 0 1-1.5.8l-11-7.4a1 1 0 0 1 0-1.6l11-7.4a1 1 0 0 1 1.5.8z"),
  close: stroke("M6 6l12 12M18 6L6 18", 2.6),
  check: stroke("M4.5 12.5l5 5 10-11", 2.8),
  checks: stroke("M2 12.5l4.5 4.5 8-9M11 16l1.5 1.5 9-10", 2.4),
  up: stroke("M12 20V5M5.5 11.5L12 5l6.5 6.5", 2.6),
  hand: soft(FINGER, CARD),
  // press and hold: the same hand with a ring of light under the fingertip
  hold: `<circle cx="11.2" cy="5.4" r="4.4" fill="${GLOW}"/>` + soft(FINGER, CARD),
  // the Picture Guide: an open book
  guide: soft("M3 6.5c3-1.5 6-1.5 9 .5v13c-3-2-6-2-9-.5z", GLOW) + soft("M21 6.5c-3-1.5-6-1.5-9 .5v13c3-2 6-2 9-.5z", CARD),
  // Settings: a cog
  gear: stroke("M12 2.8l1.4 2.5 2.8-.7.7 2.8 2.5 1.4-1.4 2.5 1.4 2.5-2.5 1.4-.7 2.8-2.8-.7L12 21.2l-1.4-2.5-2.8.7-.7-2.8-2.5-1.4 1.4-2.5-1.4-2.5 2.5-1.4.7-2.8 2.8.7z") + dot(12, 12, 3),
  // an oil lamp with its flame (loading screen, the lamp in Lamp & Box)
  lamp: `<path d="M12 1.5c1.600 1.900 2.500 3.200 2.500 4.600a2.500 2.500 0 0 1-5 0c0-1.400.900-2.700 2.500-4.600z" fill="${GOLD}" ${LINE}/>`
    + soft("M3.5 11.5H18c0 3.600-2.600 6-6.500 6H10c-3.700 0-6.500-2.400-6.500-6z", GOLD)
    + stroke("M18 12.5c1.800-.2 3 .6 3 1.900s-1.300 2.100-3.200 2M8 21h8M12 17.500V21M10.750 8.600v2.900"),
  lock: soft("M5.500 10.500h13V20h-13z", GLOW) + stroke("M8 10.500V7.500a4 4 0 0 1 8 0v3M12 14.500v2"),
  flame: soft("M12 2.5c2.600 3 4 5 4 7.200a4 4 0 0 1-8 0c0-1.200.5-2.200 1.300-3.200.4 1 .9 1.600 1.600 1.900-.2-2 .2-3.900 1.100-5.900z", GOLD),
  sun: dot(12, 12, 4) + stroke("M12 2.500V5M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300L7 7M17 17l1.700 1.700M18.700 5.300L17 7M7 17l-1.700 1.700"),
  moon: soft("M19.500 14.500A8 8 0 0 1 9.500 4.500a8 8 0 1 0 10 10z", GLOW),
  // a plant pot (Root Garden)
  pot: soft("M6 11h12l-1.500 9h-9z", "var(--wood-soft)") + stroke("M4.500 11h15"),
  // a small four-point star: one game in the list of games
  spark: soft("M12 3l2.200 6.800L21 12l-6.800 2.200L12 21l-2.200-6.800L3 12l6.800-2.200z", GOLD),
  // the five wings of the Library: an arched door, a leaf, a reed pen, a lantern, a dome
  hall: soft("M5 21V10a7 7 0 0 1 14 0v11z", GLOW) + stroke("M3 21h18M9.500 21v-7.500a2.500 2.500 0 0 1 5 0V21"),
  garden: soft("M12 21c-5-2-7.500-6-7-12 5 .5 8 3.500 7 12z", "#cfe6c8") + soft("M12 21c.5-6 3-10 8-12 .5 6-2.500 10-8 12z", "#dcefd8"),
  scribes: soft("M16.500 3.500l4 4L9 19l-5.500 1.500L5 15z", GLOW) + stroke("M14 6l4 4M3 21.500h9"),
  tower: soft("M8 9h8l1.500 9h-11z", GOLD) + stroke("M9.500 9l1-3.500h3l1 3.500M12 2.500v3M7 21h10M9 18v3M15 18v3"),
  dome: soft("M5 14a7 7 0 0 1 14 0z", GOLD) + stroke("M12 4v3M4 14h16M6 14v7M18 14v7M3 21h18M10.500 21v-3.500a1.500 1.500 0 0 1 3 0V21"),
};

export const ICON_NAMES = Object.keys(SHAPES);
export const WING_ICON = { 1: "hall", 2: "garden", 3: "scribes", 4: "tower", 5: "dome" };

/** The SVG markup of one icon (a fixed string from this file, never player or pack text). */
export const iconSvg = (name) => `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">${SHAPES[name] ?? SHAPES.spark}</svg>`;

/** An icon element. cls: extra classes ("ico-dir" mirrors it on right-to-left pages: forward and back arrows). */
export function icon(name, cls = "") {
  const el = document.createElement("span");
  el.className = `ico ico-${name}${cls ? ` ${cls}` : ""}`;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = iconSvg(name);
  return el;
}

/** Forward and back arrows: they point the reading way (mirrored in Urdu). */
export const nextIcon = () => icon("next", "ico-dir");
export const backIcon = () => icon("back", "ico-dir");
