// First launch: the game's goal in one line, a language choice, three comic panels, then straight into Al-Fatiha.
import { h, pic } from "./kit.js";
import { sign } from "./signs.js";
import { t } from "../i18n.js";
import { keepFitted } from "./fit.js";

// each panel is a painting (ui:intro1-3); the emoji scene is only the fallback while a painting is missing
const PANELS = [
  { art: "ui:intro1", scene: "🏛️", props: ["🕯️", "🕯️", "🕯️"], dim: true, key: "intro1" },
  { art: "ui:intro2", scene: "✒️", props: ["👀", "✨"], key: "intro2" },
  { art: "ui:intro3", scene: "📜", props: ["👆", "🪔"], key: "intro3" },
];

/** onLang(code): the player picked English or Urdu (for this session; main.js applies it to every label). */
export function showIntro(root, { onLang = () => {}, current = "en" } = {}) {
  return new Promise((resolve) => {
    const start = h("button", { class: "next-btn big", "aria-label": t("start"), "data-t-aria": "start", onclick: () => resolve() }, "▶");
    const langs = [["en", "English"], ["ur", "اردو"]].map(([code, label]) => h("button", {
      class: "pill", lang: code, "aria-pressed": String(current === code),
      onclick: () => { langs.forEach((b) => b.setAttribute("aria-pressed", String(b === langBtn(code)))); onLang(code); },
    }, label));
    const langBtn = (code) => langs.find((b) => b.lang === code);
    const screen = h("section", { class: "intro" },
      h("header", { class: "intro-head" },
        h("span", { class: "intro-brand", "aria-hidden": "true" }, pic(sign("ui:qalam", "✒️"))),
        h("h1", { class: "intro-title", "data-t": "introTitle" }, t("introTitle")),
        h("p", { class: "intro-goal", "data-t": "introGoal" }, t("introGoal")),
        h("div", { class: "intro-langs", role: "group", "aria-label": t("pickLang"), "data-t-aria": "pickLang" }, langs)),
      h("div", { class: "panels" }, PANELS.map((p, i) => h("figure", { class: `panel${p.dim ? " dim" : ""}`, style: `--d:${i * 0.5}s` },
        h("div", { class: "panel-scene", "aria-hidden": "true" }, sign(p.art, "").startsWith("img:")
          ? h("span", { class: "scene-art" }, pic(sign(p.art, "")))
          : [h("span", { class: "scene-main" }, p.scene), h("span", { class: "scene-props" }, p.props.map((x) => h("span", {}, x)))]),
        h("figcaption", { class: "cap", "data-t": p.key }, t(p.key))))),
      start);
    root.replaceChildren(screen);
    keepFitted(screen);
    start.focus();
  });
}
