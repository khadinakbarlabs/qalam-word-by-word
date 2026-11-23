// Settings sheet: language (English / Urdu), captions on/off, "show how to say it" on/off, sound on/off, then the
// credits (folded away until asked for) and the draft-content notice. Every choice is saved (core/save.js settings).
// A choice takes effect at once and the sheet stays open: each switch says On or Off and what it does.
import { h } from "./kit.js";
import { icon } from "./icons.js";
import { t, lang } from "../i18n.js";
import { onEscape } from "./keys.js";

const OPENER = ".dock-btn[data-t-aria=settings]";

/** Modal sheet: the screen behind it takes no input or focus while it is open; Esc, the ✕ at the top or a tap
 *  outside closes it and focus goes back to the Settings button (DES-10). It lives on <body>, because a changed
 *  setting redraws the map under it. */
export function openSettings(root, { settings, credits, onChange }) {
  let now = { ...settings };
  const hold = () => [...root.children].forEach((el) => { el.inert = true; });
  const close = () => {
    sheet.remove();
    [...root.children].forEach((el) => { el.inert = false; });
    dropEscape();
    root.querySelector(OPENER)?.focus();
  };
  const dropEscape = onEscape(close);
  /** Apply one choice: the game redraws what is behind the sheet, which then goes quiet again. */
  const change = (patch, from) => {
    now = { ...now, ...patch };
    onChange(patch);
    hold();
    draw();
    from?.focus({ preventScroll: true });
  };
  const langBtns = [["en", "English"], ["ur", "اردو"]].map(([code, label]) => {
    const b = h("button", { class: "pill", lang: code, onclick: () => change({ lang: code }, b) }, label);
    return b;
  });
  // an on/off switch: the pill says On or Off in words, the row says what the setting does
  const toggle = (key, labelKey, noteKey) => {
    const word = h("span", {});
    const b = h("button", { class: "pill switch", role: "switch", "data-t-aria": labelKey, "aria-label": t(labelKey), onclick: () => change({ [key]: !now[key] }, b) },
      h("span", { class: "switch-dot", "aria-hidden": "true" }), word);
    const row = h("div", { class: "set-row" }, h("span", { "data-t": labelKey }, t(labelKey)), b,
      h("span", { class: "set-note", "data-t": noteKey }, t(noteKey)));
    const paint = () => {
      const on = Boolean(now[key]);
      b.setAttribute("aria-checked", String(on));
      word.dataset.t = on ? "on" : "off";
      word.textContent = t(word.dataset.t);
    };
    return { row, paint };
  };
  const toggles = [toggle("captions", "captions", "captionsNote"), toggle("say", "sayToggle", "sayNote"), toggle("sound", "sound", "soundNote")];
  const draw = () => {
    langBtns.forEach((b) => b.setAttribute("aria-pressed", String(lang() === b.lang)));
    toggles.forEach((x) => x.paint());
    sheet.setAttribute("aria-label", t("settings"));
  };
  const closeBtn = h("button", { class: "icon-btn sheet-close", "aria-label": t("close"), "data-t-aria": "close", onclick: close }, icon("close"));
  const sheet = h("div", { class: "sheet-wrap", role: "dialog", "aria-modal": "true" },
    h("div", { class: "sheet" },
      h("div", { class: "sheet-head" }, h("h2", { "data-t": "settings" }, t("settings")), closeBtn),
      h("div", { class: "set-row" }, h("span", { "data-t": "language" }, t("language")), langBtns),
      toggles.map((x) => x.row),
      // names of the sources are kept as written (English); the heading and the notice follow the language
      h("details", { class: "credits-fold" },
        h("summary", { "data-t": "credits" }, t("credits")),
        h("ul", { class: "credits", lang: "en", dir: "ltr" },
          ["quran", "translation", "words", "art", "fonts"].filter((k) => credits[k]).map((k) => h("li", {}, credits[k])))),
      h("p", { class: "draft", "data-t": "draft" }, t("draft"))));
  sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
  hold();
  draw();
  document.body.append(sheet);
  closeBtn.focus();
}
