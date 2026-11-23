// A milestone card (core/milestones.js): a big picture, one line saying what the player has reached, ▶ to go on.
// Shown once, after the room-done card, before the map. Nothing is lost by skipping past it.
import { nextIcon } from "./icons.js";
import { h, pic, burst } from "./kit.js";
import { sign } from "./signs.js";
import { t, lang } from "../i18n.js";
import { meterEl, WING_NAMES, wingIcon } from "./map.js";
import { play } from "./sound.js";
import { keepFitted } from "./fit.js";

const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
// "Reading Room: Al-Asr" → "Al-Asr" (the passage the wing's last room reads)
const passageName = (title) => (title[lang()] ?? title.en).split(/:\s*/).at(-1);

function content(pack, id) {
  if (id === "fatiha") return { art: pic(sign("ui:lamp", "🪔")), title: t("ms_fatihaT"), line: t("ms_fatiha") };
  const [kind, n] = id.split("-");
  if (kind === "wing") {
    const last = pack.rooms.filter((r) => r.wing === Number(n)).at(-1);
    return {
      art: h("span", { class: "ms-icon" }, wingIcon(Number(n))),
      title: fill(t("ms_wingT"), { wing: t(WING_NAMES[n] ?? "hall") }),
      line: fill(t("ms_wing"), { passage: passageName(last.title) }),
    };
  }
  return { art: meterEl(Number(n)), title: fill(t("ms_covT"), { n }), line: fill(t(Number(n) >= 85 ? "ms_covGoal" : "ms_cov"), { n }) };
}

/** Show one milestone card in `root`; resolves when the player taps ▶. */
export function showMilestone(root, { pack, id }) {
  return new Promise((done) => {
    const c = content(pack, id);
    const go = h("button", { class: "next-btn", "aria-label": t("next"), onclick: () => done() }, nextIcon());
    const screen = h("section", { class: "milestone", "aria-labelledby": "ms-title" },
      h("span", { class: "ms-label", "data-t": "ms_label" }, t("ms_label")),
      h("div", { class: "big-lamp ms-art", "aria-hidden": "true" }, c.art),
      h("h2", { id: "ms-title", class: "ms-title" }, c.title),
      h("p", { class: "ms-line" }, c.line),
      go);
    // the win is shown, not only said: a ring of sparks bursts round the picture (CSS only; still under reduced motion)
    screen.querySelector(".ms-art").append(burst());
    root.replaceChildren(screen);
    keepFitted(screen);
    play("milestone");
    go.focus({ preventScroll: true });
  });
}
