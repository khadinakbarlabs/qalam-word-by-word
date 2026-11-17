// Settings sheet: language (English / Urdu), captions on/off, sound on/off, credits and the draft-content notice.
import { h } from "./kit.js";
import { t, lang } from "../i18n.js";
import { onEscape } from "./keys.js";

/** Modal sheet: the screen behind it takes no input or focus while it is open; Esc or ✕ closes it and focus goes
 *  back to where it was (DES-10). */
export function openSettings(root, { settings, credits, onChange }) {
  const opener = document.activeElement;
  const behind = [...root.children];
  const close = () => {
    sheet.remove();
    behind.forEach((el) => { el.inert = false; });
    dropEscape();
    if (opener?.isConnected) opener.focus();
  };
  const dropEscape = onEscape(close);
  const langBtn = (code, label) => h("button", {
    class: "pill", "aria-pressed": String(lang() === code), lang: code,
    onclick: () => { onChange({ lang: code }); close(); },
  }, label);
  const sheet = h("div", { class: "sheet-wrap", role: "dialog", "aria-modal": "true", "aria-label": t("settings") },
    h("div", { class: "sheet" },
      h("h2", { "data-t": "settings" }, t("settings")),
      h("div", { class: "set-row" }, h("span", { "data-t": "language" }, t("language")), langBtn("en", "English"), langBtn("ur", "اردو")),
      h("div", { class: "set-row" }, h("span", { "data-t": "captions" }, t("captions")),
        h("button", { class: "pill", "aria-pressed": String(settings.captions), onclick: () => { onChange({ captions: !settings.captions }); close(); } }, settings.captions ? "Aa ✓" : "Aa")),
      h("div", { class: "set-row" }, h("span", { "data-t": "sound" }, t("sound")),
        h("button", { class: "pill", "aria-pressed": String(settings.sound), "aria-label": t("sound"), onclick: () => { onChange({ sound: !settings.sound }); close(); } }, settings.sound ? "🔊 ✓" : "🔇")),
      h("h3", { "data-t": "credits" }, t("credits")),
      h("ul", { class: "credits", lang: "en", dir: "ltr" },
        ["quran", "translation", "words", "art", "fonts"].filter((k) => credits[k]).map((k) => h("li", {}, credits[k]))),
      h("p", { class: "draft", "data-t": "draft" }, t("draft")),
      h("button", { class: "next-btn", "aria-label": t("close"), onclick: close }, "✕")));
  sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
  behind.forEach((el) => { el.inert = true; });
  root.append(sheet);
  sheet.querySelector("button")?.focus();
}
