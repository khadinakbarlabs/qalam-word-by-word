// Picture Guide. Tab 1, How to play: the rules in seven short cards and one line per game (the same lines as the
// room's what-to-do strip). Tab 2 explains every sign the game uses (same text as the tooltips, game/ui/tips.js);
// tab 3 is the player's own picture dictionary, room by room, with each word's lamp. Tab 4, My progress: honest
// numbers (core/report.js): words met, words remembered now, lamps by flames, and what the map's % means.
import { icon, backIcon } from "./icons.js";
import { h, ar, pic, cap, sayLine } from "./kit.js";
import { progressReport } from "../core/report.js";
import { MAX_LEVEL } from "../core/srs.js";
import { t } from "../i18n.js";
import { lamp } from "../core/srs.js";
import { TIPS, explain } from "./tips.js";
import { whyLine } from "./why-line.js";
import { sign } from "./signs.js";
import { SCENES } from "../core/scenes.js";
import { PETALS } from "./steps/petals.js";
import { onEscape, usingKeyboard } from "./keys.js";

const seeds = (letters) => h("span", { class: "seeds", lang: "ar", dir: "rtl" }, letters.map((l) => h("span", { class: "seed" }, l)));
const tile = (cls, word) => h("span", { class: `tile demo ${cls}` }, h("span", { class: "ar-line", lang: "ar", dir: "rtl" }, word));
const chip = (cls, word) => h("span", { class: `chip demo ${cls}` }, ar(word, "chip-ar"));

// [group title key, [[tip key, visual]]]
// How to read the pictures: the rules every painting follows (VISUAL_GAMES.md §1), shown first in the guide.
const RULES = () => ["gRules", [
  ["ruleWhy", h("span", { class: "why-demo" }, pic(sign("w:qala", "💬")), h("em", {}, "“…”"))],
  ["ruleFaceless", pic(sign("w:nahnu", "🙋🙋"))],
  ["medal", pic(null, "رَحْمٰن")],
  ["scroll", pic(null, "scroll:مُوسَى")],
  ["plain", pic(null, "plain:شَيْطَان")],
  ["ruleObjects", pic(sign("w:wahaba", "🎁"))],
  ["ruleCalm", pic(sign("w:jannah", "🌳"))],
  ["ruleModest", pic(sign("w:wudd", "👭"))],
  ["masteryLamp", h("span", { class: "m-lamp lit" }, h("i", { class: "on" }), h("i", { class: "on" }))],
]];

const SIGNS = (pack) => [
  RULES(),
  ["gWord", [["m", pic(sign("w:huwa", "👤", "▲"))], ["f", pic(sign("w:hiya", "👤", "●"))], ["many", pic(sign("w:humu", "👥"))], ["medal", pic(null, "رَحْمٰن")], ["scroll", pic(null, "scroll:مُوسَى")], ["plain", pic(null, "plain:شَيْطَان")]]],
  ["gAyah", [["tileNew", tile("glow-new", "كِتَابُ")], ["tileKnown", tile("glow-known", "رَبِّ")], ["tileGiven", tile("given", "يَعْلَمُ")], ["tileLit", tile("lit", "ٱلْحَمْدُ")],
    ["pieces", h("span", { class: "pieces" }, h("span", { class: "piece" }, ar("الْ")), h("span", { class: "piece" }, ar("حَمْد")))]]],
  ["gTime", [["past", pic(sign("ui:past", "⏪"))], ["now", pic(sign("ui:present", "📍"))], ["future", pic(sign("ui:future", "⏩"))], ["done", pic(sign("ui:done", "✔️"))], ["soon", pic(sign("ui:soon", "⏩"))], ["later", pic(sign("ui:later", "⏩⏩"))],
    ["stamp", h("span", { class: "stamp-demo" }, "✕")], ["timeArrow", h("span", { class: "arrow-demo" }, "⟵")],
    ["near", h("span", { class: "big-demo" }, pic(sign("w:kitab", "📖")))], ["far", h("span", { class: "small-demo" }, pic(sign("w:kitab", "📖")))], ["ghost", h("span", { class: "ghost-demo" }, pic(sign("ui:lamp", "🪔")))]]],
  ["gGame", [["pot", h("span", { class: "pot-demo" }, pic(sign("ui:pot", "🌱")), seeds(["ر", "ح", "م"]))], ["rungBase", h("span", { class: "small-demo" }, pic(sign("w:kabir", "🐘")))],
    ["rungMore", h("span", {}, h("span", { class: "big-demo" }, pic(sign("w:akbar", "🐘"))), icon("up"))], ["sent", pic(sign("ui:sent", "📜"))], ["refused", pic(sign("ui:refused", "🚫"))], ["garden", pic(sign("w:jannah", "🌳"))],
    ["fire", pic(sign("w:nar", "🔥"))], ["light", pic(sign("w:nur", "🕯️"))], ["dark", pic(sign("w:zulumat", "🌑"))], ["good", pic(sign("w:hasana", "🌷"))], ["bad", pic(sign("w:sayyia", "🍂"))], ["doerDid", pic(pack?.words["ui:doer"]?.pic ?? "🧑‍🔧")], ["wasDone", pic(pack?.words["ui:done"]?.pic ?? "📦")], ["masteryLamp", h("span", { class: "m-lamp lit" }, h("i", { class: "on" }), h("i", { class: "on" }))], ["story", h("span", { class: "story-demo" }, pic(sign("w:kharaja", "🌅")), "⟶", pic(sign("w:rizq", "🧺")), "⟶", pic(sign("w:shakara", "🙏")))], ["stakesUses", h("strong", { class: "stakes-num gold" }, "1,350")], ["frontPiece", chip("front", "وَ")], ["endPiece", chip("end", "ـهُ")], ["person", h("span", { class: "story-demo" }, pic(sign("w:ana", "🙋")), pic(sign("w:anta", "🫵")), pic(sign("w:huwa", "👤")))]]],
  ["gPetals", [["flower", h("span", { class: "pot-demo" }, pic(sign("ui:action", "🌼")), seeds(["ف", "ع", "ل"]))],
    ...Object.entries(PETALS).map(([id, emoji]) => [`petal_${id}`, pic(pack?.words[`ui:${id}`]?.pic ?? emoji)])]],
  ...Object.entries(SCENES).map(([name, sc]) => [`gScene_${name}`,
    [...Object.entries(sc.marks ?? {}), ...Object.entries(sc.spots)].map(([k, s]) => [k, pic((s.art && pack?.words[s.art]?.pic) || s.pic)])]),
  ["gProgress", [["meter", pic(sign("ui:lamp", "🪔"))], ["doorDone", pic(sign("ui:lamp", "🪔"))], ["doorNext", pic(sign("ui:spark", "✨"))], ["doorLocked", pic(sign("ui:lock", "🔒"))], ["doorSoon", pic(sign("ui:lock", "🚧"))], ["relight", pic(sign("ui:relight", "🔁"))],
    ["hint", icon("hand")], ["dots", h("span", { class: "dots" }, h("i", { class: "on" }), h("i", { class: "on" }), h("i"))], ["lampLevel", h("span", { class: "flames" }, icon("flame"), icon("flame"), icon("flame"))]]],
];

// [title key, text key, picture]
const RULES_PLAY = () => [
  ["play1T", "play1", pic(sign("ui:lamp", "🪔"))],
  ["play2T", "play2", pic(sign("ui:qalam", "✒️"))],
  ["play3T", "play3", h("span", { class: "big-demo" }, icon("hand"))],
  ["play4T", "play4", h("span", { class: "big-demo" }, icon("hold"))],
  ["play5T", "play5", h("span", { class: "m-lamp lit" }, h("i", { class: "on" }), h("i", { class: "on" }))],
  ["play6T", "play6", pic(sign("ui:relight", "🔁"))],
  ["play7T", "play7", h("span", { class: "big-demo" }, backIcon())],
];

// the Last Check's rule is said once, in rule 5 above (it differs by hall): the game list only points there
const howKey = (type) => (type === "mastery" ? "guide_mastery" : `how_${type}`);

function playView(pack) {
  const types = pack.stepTypes ?? [];
  return [
    h("section", { class: "guide-group" }, h("div", { class: "play-list" }, RULES_PLAY().map(([title, text, visual]) => h("article", { class: "play-card" },
      h("div", { class: "play-pic", "aria-hidden": "true" }, visual),
      h("div", {}, h("h3", { "data-t": title }, t(title)), h("p", { "data-t": text }, t(text))))))),
    h("section", { class: "guide-group" }, h("h3", { "data-t": "gamesT" }, t("gamesT")),
      h("ul", { class: "game-list" }, [...types, "mastery"].map((type) => h("li", {},
        h("span", { class: "game-icon", "aria-hidden": "true" }, icon(type === "mastery" ? "checks" : "spark")),
        h("span", {}, h("strong", { class: "game-name", "data-t": `game_${type}` }, t(`game_${type}`)), h("span", { "data-t": howKey(type) }, t(howKey(type)))))))),
  ];
}

function signsView(pack) {
  return SIGNS(pack).map(([title, items]) => h("section", { class: "guide-group" },
    h("h3", { "data-t": title }, t(title)),
    h("div", { class: "sign-grid" }, items.map(([key, visual]) => h("div", { class: "sign" },
      h("div", { class: "sign-pic", "aria-hidden": "true" }, visual),
      cap(TIPS[key], "cap sign-text"))))));
}

function wordsView(pack, cards, day, due) {
  const total = new Set(pack.rooms.flatMap((r) => r.teaches)).size;
  const met = pack.rooms.flatMap((r) => r.teaches).filter((id) => cards[id]).length;
  const card = (id) => {
    const w = pack.words[id];
    const c = cards[id];
    if (!c) return h("div", { class: "dict-card locked", "aria-hidden": "true" }, icon("lock"));
    const l = lamp(c, day);
    const x = explain(w);
    const el = h("div", { class: `dict-card${l.dim ? " dim" : ""}`, "data-tip-en": x.en, "data-tip-ur": x.ur });
    // the long-press text names the picture too, so it is written again when the picture line arrives late
    const retip = () => { const y = explain(w); el.setAttribute("data-tip-en", y.en); el.setAttribute("data-tip-ur", y.ur); };
    el.append(...[pic(w.pic, w.medal), ar(w.ar, "dict-ar"), sayLine(w.say), cap(w.g, "cap sign-text"), w.more ? cap(w.more, "cap more") : null, whyLine(id, retip),
      h("span", { class: `flames${l.gold ? " gold" : ""}`, "data-tip": "lampLevel" }, l.flames ? Array.from({ length: l.flames }, () => icon("flame")) : "·")].filter(Boolean));
    return el;
  };
  return [
    h("p", { class: "dict-count" }, h("strong", {}, String(met)), ` / ${total} `, h("span", { "data-t": "wordsMet" }, t("wordsMet"))),
    // the whole Relight backlog lives here; the map shows only one session's worth (srs.js sessionSize)
    due ? h("p", { class: "dict-count due-all" }, pic(sign("ui:relight", "🔁")), h("strong", {}, ` ${due} `), h("span", { "data-t": "relightAll" }, t("relightAll"))) : null,
    ...pack.rooms.map((r) => h("section", { class: "guide-group" },
      h("h3", {}, r.art && pack.words[r.art]?.pic?.startsWith("img:") ? pic(pack.words[r.art].pic) : null, cap(r.title, "room-name")),
      h("div", { class: "dict-grid" }, r.teaches.map(card)))),
  ];
}

/** My progress: what the numbers mean, said plainly. Nothing here is sent anywhere. */
function progressView(pack, cards, day, meterPct) {
  const r = progressReport(pack, cards, day);
  const row = (num, of, titleKey, noteKey) => h("div", { class: "report-row" },
    h("strong", {}, String(num)), of ? h("span", { class: "of" }, of) : null,
    h("p", {}, h("span", { "data-t": titleKey }, t(titleKey)), h("small", { "data-t": noteKey }, t(noteKey))));
  const most = Math.max(1, ...r.byFlames);
  return [h("section", { class: "report" },
    row(r.met, `/ ${r.total}`, "wordsMet", "wordsMetNote"),
    row(r.remembered, `/ ${r.met}`, "rememberNow", "rememberNote"),
    row(r.fading, "", "fadingNow", "fadingNote"),
    row(`${meterPct}%`, "", "meterTip", "meterNote"),
    h("div", { class: "report-bars" }, h("strong", { "data-t": "flamesT" }, t("flamesT")),
      Array.from({ length: MAX_LEVEL }, (_, k) => k + 1).map((level) => h("div", { class: "report-bar" },
        h("span", { "aria-hidden": "true" }, Array.from({ length: level }, () => icon("flame"))), h("i", { style: `--w:${Math.round((r.byFlames[level] / most) * 100)}` }), h("span", {}, String(r.byFlames[level]))))),
    h("p", { class: "cap rest-say", "data-t": "flamesNote" }, t("flamesNote")))];
}

export function showGuide(root, { pack, cards, day, due = 0, meterPct = 0, onBack }) {
  // Esc goes back to the map, like ◀ Map
  const back = () => { dropEscape(); onBack(); };
  const dropEscape = onEscape(back);
  const body = h("div", { class: "guide-body" });
  const TABS = [["play", "guidePlay"], ["signs", "guideSigns"], ["words", "guideWords"], ["progress", "guideProgress"]];
  const tabs = TABS.map(([id, key]) =>
    h("button", { class: "pill", role: "tab", "data-t": key, onclick: () => open(id) }, t(key)));
  const open = (id) => {
    tabs.forEach((b, k) => b.setAttribute("aria-selected", String(TABS[k][0] === id)));
    const VIEWS = { play: () => playView(pack), signs: () => signsView(pack), words: () => wordsView(pack, cards, day, due), progress: () => progressView(pack, cards, day, meterPct) };
    body.replaceChildren(...VIEWS[id]());
    body.scrollTop = 0;
  };
  root.replaceChildren(h("section", { class: "guide" },
    h("header", { class: "room-top" },
      h("button", { class: "icon-btn labeled", "aria-label": t("back"), "data-t-aria": "back", onclick: back },
        backIcon(), h("span", { class: "btn-label", "data-t": "mapLabel" }, t("mapLabel"))),
      h("span", { class: "room-title" }, icon("guide"), h("span", { "data-t": "guide" }, t("guide")))),
    h("div", { class: "guide-tabs", role: "tablist" }, tabs),
    body));
  open("play");
  if (usingKeyboard()) tabs[0].focus();
}
