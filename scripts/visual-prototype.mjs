#!/usr/bin/env node
// Write prototypes/visual-games.html — a playable look at the six visual game engines (docs/VISUAL_GAMES.md §2)
// with small sample word sets. The ayah in the finale (1:2) is taken verbatim from Tanzil; every gloss here is an
// unreviewed sample for the prototype only. Emoji stand in for the release art.
// Usage: node scripts/visual-prototype.mjs   then open the quran-words preview at /prototypes/visual-games.html

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, tanzilWords } from "./lib/corpus.mjs";

const { ayat } = await loadCorpus();
const AYAH = { ref: "1:2", words: tanzilWords(ayat.get("1:2")) };
// The Relight tab runs the real scheduler (docs/MEMORY_SYSTEM.md), inlined so the page stays a single file.
const SRS = (await readFile(join(ROOT, "game/core/srs.js"), "utf8")).replace(/^export /gm, "");

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Visual Games Prototype</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --paper: #f4ecdc; --card: #fffaf0; --ink: #2b2118; --ink-soft: #6f5e4b; --line: #e3d5bb;
    --lamp: #c8902e; --lamp-glow: #f6d98f; --teal: #1f7a74; --rose: #b4466a; --ok: #2f7d4f;
    --quran-font: "Amiri Quran", serif; --urdu-font: "Noto Nastaliq Urdu", serif; --ui-font: system-ui, sans-serif;
    --word: clamp(2.2rem, 1.6rem + 3vw, 3.4rem);
    --ease: cubic-bezier(.2, .8, .2, 1);
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 50% -10%, #fff6dd 0, var(--paper) 55%); color: var(--ink); font-family: var(--ui-font); }
  [dir="rtl"] body { font-family: var(--urdu-font); }
  [lang="ar"] { font-family: var(--quran-font); }
  button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .top { position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter: blur(6px); border-bottom: 1px solid var(--line); padding: 8px 16px 6px; }
  .bar { max-width: 760px; margin: 0 auto; display: flex; align-items: center; gap: 10px; }
  .meter { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: .95rem; }
  .meter svg { width: 30px; height: 40px; }
  .tools { margin-inline-start: auto; display: flex; gap: 6px; }
  .tools button { min-width: 44px; min-height: 44px; border-radius: 12px; border: 1px solid var(--line); background: var(--card); font-size: 1rem; }
  .tools button[aria-pressed="false"] { opacity: .45; }
  nav.engines { max-width: 760px; margin: 6px auto 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
  nav.engines button { border: 1px solid var(--line); background: var(--card); border-radius: 12px; padding: 6px 2px; min-height: 52px; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 1.3rem; }
  nav.engines button small { font-size: .62rem; color: var(--ink-soft); line-height: 1.6; }
  nav.engines button[aria-selected="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  nav.engines button[aria-selected="true"] small { color: var(--lamp-glow); }
  nav.engines button.lit::after { content: "🪔"; font-size: .7rem; }
  main { max-width: 760px; margin: 0 auto; padding: 16px; }
  .stage { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px; min-height: 480px; box-shadow: 0 10px 30px -18px #6b4b1a; overflow: hidden; }
  .note { font-size: .72rem; color: var(--ink-soft); text-align: center; margin: 10px 0 0; line-height: 1.8; }
  .cap { display: block; font-size: .78rem; color: var(--ink-soft); line-height: 1.9; }
  [dir="rtl"] .cap { font-size: .82rem; line-height: 2.3; }
  body.nocap .cap { visibility: hidden; }
  .prompt { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 4px 0 14px; min-height: 110px; }
  .word { font-size: var(--word); line-height: 2.4; padding: 0 18px; border-radius: 16px; background: #fff; border: 2px solid var(--lamp); box-shadow: 0 0 0 6px var(--lamp-glow); }
  .grid4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .pic { border: 2px solid var(--line); background: #fff; border-radius: 16px; padding: 10px 6px; min-height: 104px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .emoji { font-size: 2.6rem; line-height: 1.2; }
  .dots { display: flex; gap: 6px; justify-content: center; margin-top: 14px; }
  .dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
  .dots i.on { background: var(--lamp); }
  /* feedback */
  .right { border-color: var(--ok) !important; box-shadow: 0 0 0 5px #cfe9d8; animation: pop .45s var(--ease); }
  .wrong { animation: wobble .45s; }
  .wrong .cap { visibility: visible !important; }
  .reveal { box-shadow: 0 0 0 6px var(--lamp-glow) !important; border-color: var(--lamp) !important; }
  .reveal .cap { visibility: visible !important; }
  @keyframes pop { 50% { transform: scale(1.06); } }
  @keyframes wobble { 20% { transform: translateX(-6px) rotate(-2deg); } 40% { transform: translateX(6px) rotate(2deg); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
  @keyframes pulse { 50% { box-shadow: 0 0 0 8px var(--lamp-glow); } }
  /* show-me hand */
  .hand { position: absolute; left: 0; top: 0; z-index: 4; font-size: 2.2rem; pointer-events: none; opacity: 0; transition: transform .9s var(--ease), opacity .3s; filter: drop-shadow(0 4px 6px #0004); }
  .hand.tap { animation: tap .5s 2; }
  @keyframes tap { 50% { transform: var(--at) scale(.8); } }
  /* E2 place */
  .scene { position: relative; width: 100%; aspect-ratio: 4 / 3; max-width: 460px; margin: 0 auto; background: linear-gradient(#fdf5e4, #f3e5c8); border-radius: 14px; border: 1px solid var(--line); }
  .box { position: absolute; border: 3px solid #8a6236; border-radius: 6px; background: repeating-linear-gradient(90deg, #d9a96a 0 10px, #cf9d5e 10px 20px); }
  .box.open { background: #3b2a1a22; }
  .table { position: absolute; left: 54%; width: 42%; top: 70%; height: 4%; background: #8a6236; border-radius: 3px; }
  .leg { position: absolute; top: 74%; width: 3%; height: 24%; background: #8a6236; }
  .zone { position: absolute; border: 2px dashed transparent; border-radius: 12px; background: transparent; }
  .zone:hover, .zone:focus-visible { border-color: var(--lamp); background: #f6d98f33; outline: none; }
  .lampobj { position: absolute; font-size: 2.4rem; transition: left .6s var(--ease), top .6s var(--ease); transform: translate(-50%, -50%); filter: drop-shadow(0 0 10px var(--lamp-glow)); pointer-events: none; }
  .timeline { display: flex; gap: 6px; margin: 8px auto 0; max-width: 460px; }
  .seg { flex: 1; border: 2px solid var(--line); border-radius: 12px; background: #fff; min-height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; font-size: 1.8rem; }
  .seg.past { background: repeating-linear-gradient(135deg, #efe3cc 0 8px, #fff 8px 16px); }
  .seg .stamp { position: absolute; inset: 0; display: grid; place-items: center; font-size: 3.2rem; color: #a3302f; }
  /* E3 snap */
  .target { display: flex; justify-content: center; gap: 4px; font-size: 2.4rem; padding: 6px 16px; border-radius: 16px; background: #fff; border: 2px dashed var(--lamp); }
  .build { display: flex; justify-content: center; align-items: center; gap: 6px; direction: rtl; margin: 16px 0; min-height: 100px; }
  .slot { min-width: 54px; min-height: 76px; border: 2px dashed var(--line); border-radius: 12px; display: grid; place-items: center; font-family: var(--quran-font); font-size: 1.8rem; line-height: 2.4; }
  .slot.filled { border-style: solid; border-color: var(--lamp); background: #fff8e6; }
  .base { padding: 0 14px; border-radius: 14px; background: #fff; border: 2px solid var(--ink); display: flex; flex-direction: column; align-items: center; }
  .base span[lang] { font-size: 2rem; line-height: 2.3; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; direction: rtl; }
  .chip { border: 2px solid var(--line); background: #fff; border-radius: 14px; padding: 4px 12px; min-width: 70px; min-height: 64px; display: flex; flex-direction: column; align-items: center; }
  .chip b { font-family: var(--quran-font); font-weight: 400; font-size: 1.6rem; line-height: 2.2; }
  .chip .ico { font-size: 1.2rem; }
  .chip.front { border-top: 4px solid var(--teal); }
  .chip.end { border-top: 4px solid var(--rose); }
  .result { text-align: center; font-family: var(--quran-font); font-size: var(--word); line-height: 2.2; min-height: 1.2em; border-radius: 16px; }
  /* E4 / E5 circles */
  .circle { position: relative; width: min(330px, 86vw); aspect-ratio: 1; margin: 6px auto 4px; }
  .circle .center { position: absolute; inset: 31%; border-radius: 50%; background: #fff; border: 3px solid var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .seeds { direction: rtl; display: flex; gap: 6px; }
  .seeds b { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #5b7f3a; color: #fff; font-family: var(--quran-font); font-weight: 400; font-size: 1.1rem; line-height: 1; }
  .petal { position: absolute; width: 84px; height: 84px; margin: -42px; border-radius: 46%; border: 2px solid var(--line); background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1.5rem; transition: background .4s, border-color .4s; }
  .petal .ar { font-family: var(--quran-font); font-size: 1.15rem; line-height: 2; }
  .petal.now { animation: pulse 1.2s infinite; border-color: var(--lamp); }
  .petal.filled { background: #fff3cf; border-color: var(--lamp); }
  .bloom .petal { background: var(--lamp-glow); }
  .badge { font-size: .8rem; font-weight: 700; }
  .badge.m { color: var(--teal); } .badge.f { color: var(--rose); }
  .opts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 10px; }
  .opt { border: 2px solid var(--line); background: #fff; border-radius: 14px; padding: 0 16px; min-height: 64px; font-family: var(--quran-font); font-size: 1.9rem; line-height: 2.3; }
  .opt .endpart { color: var(--lamp); }
  /* E6 ayah */
  .ayah { display: flex; flex-wrap: wrap; direction: rtl; justify-content: center; gap: 8px; margin: 10px 0 6px; }
  .tile { border: 2px solid var(--line); background: #fff; border-radius: 14px; padding: 0 10px 6px; min-width: 70px; display: flex; flex-direction: column; align-items: center; }
  .tile .ar { font-family: var(--quran-font); font-size: var(--word); line-height: 2.5; margin-bottom: -.2em; }
  .tile .gl { min-height: 2.2rem; display: flex; flex-direction: column; align-items: center; font-size: 1.3rem; }
  .tile.glow { border-color: var(--lamp); animation: pulse 1.2s infinite; }
  .tile.done { border-color: var(--ok); }
  .ayah.lit .tile { background: #fff3cf; border-color: var(--lamp); box-shadow: 0 0 22px var(--lamp-glow); }
  .medal { display: inline-grid; place-items: center; min-width: 46px; height: 46px; padding: 0 6px; border-radius: 50%; border: 2px solid var(--lamp); background: radial-gradient(circle, #fffbea, #f6e2a8); font-family: var(--quran-font); font-size: 1.1rem; line-height: 1; }
  .trans { text-align: center; color: var(--ink-soft); font-size: .9rem; line-height: 2.2; min-height: 2em; }
  /* round done */
  .done-card { position: absolute; inset: 0; display: grid; place-items: center; background: #fffaf0ee; z-index: 3; animation: fade .5s; }
  .done-card div { text-align: center; }
  .done-card .big { font-size: 4rem; filter: drop-shadow(0 0 18px var(--lamp-glow)); }
  .done-card button { margin: 10px 6px 0; min-width: 64px; min-height: 52px; border-radius: 14px; border: 1px solid var(--line); background: #fff; font-size: 1.4rem; }
  @keyframes fade { from { opacity: 0; } }
  /* Relight: spaced repetition */
  .daybar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; font-weight: 700; }
  .nextday { min-height: 44px; padding: 0 14px; border-radius: 12px; border: 2px solid var(--lamp); background: #fff8e6; font-size: 1.1rem; }
  .shelf { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; padding: 8px; border-radius: 14px; background: linear-gradient(#f8eedb, #efe0c3); border-bottom: 6px solid #8a6236; }
  .lampcard { border: 2px solid transparent; border-radius: 12px; padding: 2px 2px 4px; display: flex; flex-direction: column; align-items: center; background: #fffaf0aa; }
  .lampcard .lampicon { font-size: 1.5rem; transition: filter .4s, opacity .4s; }
  .lampcard.dim .lampicon { filter: grayscale(.9); opacity: .35; }
  .lampcard.gold { border-color: var(--lamp); background: #fff3cf; box-shadow: 0 0 10px var(--lamp-glow); }
  .lampcard .lw { font-family: var(--quran-font); font-size: .95rem; line-height: 1.9; }
  .flames { display: flex; gap: 2px; }
  .flames i { width: 6px; height: 9px; border-radius: 50% 50% 40% 40%; background: var(--line); }
  .flames i.on { background: #f2b84b; }
  .when { font-size: .68rem; color: var(--ink-soft); min-height: 1.1em; }
  .relight-area { margin-top: 12px; }
  .big-emoji { font-size: 4rem; line-height: 1.2; }
  .optar { font-family: var(--quran-font); font-size: 1.9rem; line-height: 2.3; }
  .alllit { text-align: center; padding: 18px 0; }
  .alllit .big { font-size: 3rem; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
<header class="top">
  <div class="bar">
    <div class="meter" title="coverage (sample)">
      <svg viewBox="0 0 30 40" aria-hidden="true">
        <defs><clipPath id="lampClip"><path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z"/></clipPath></defs>
        <path d="M11 4 h8 l-2 6 h-4 z" fill="#8a6236"/>
        <path d="M8 10 h14 v22 a7 4 0 0 1 -14 0 z" fill="#fff" stroke="#8a6236" stroke-width="2"/>
        <rect id="lampFill" x="6" y="36" width="18" height="0" fill="#f2b84b" clip-path="url(#lampClip)"/>
      </svg>
      <span id="meterNum">12%</span>
    </div>
    <div class="tools">
      <button id="hintBtn" aria-label="Show me">👆</button>
      <button id="capBtn" aria-pressed="true" aria-label="Captions">Aa</button>
      <button id="langBtn" aria-label="Language">اردو</button>
    </div>
  </div>
  <nav class="engines" role="tablist" id="tabs"></nav>
</header>
<main>
  <section class="stage" id="stage" aria-live="polite"></section>
  <p class="note">Prototype. Qur'an text (1:2) is verbatim from Tanzil (tanzil.net, CC BY 3.0). All meanings and pictures are unreviewed samples; emoji stand in for final art.</p>
</main>
<script>
${SRS}
const AYAH = ${JSON.stringify(AYAH)};

// ---------- sample content (unreviewed) ----------
const MATCH = [
  { ar: "شَمْس", pic: "☀️", cap: { en: "sun", ur: "سورج" } },
  { ar: "قَمَر", pic: "🌙", cap: { en: "moon", ur: "چاند" } },
  { ar: "جَبَل", pic: "⛰️", cap: { en: "mountain", ur: "پہاڑ" } },
  { ar: "بَحْر", pic: "🌊", cap: { en: "sea", ur: "سمندر" } },
  { ar: "شَجَرَة", pic: "🌳", cap: { en: "tree", ur: "درخت" } },
  { ar: "مَاء", pic: "💧", cap: { en: "water", ur: "پانی" } },
];
const PLACE = [
  { ar: "فَوْقَ", zone: "above", cap: { en: "above", ur: "اوپر" } },
  { ar: "تَحْتَ", zone: "below", cap: { en: "under", ur: "نیچے" } },
  { ar: "فِي", zone: "inside", cap: { en: "in", ur: "میں" } },
  { ar: "عَلَى", zone: "on", cap: { en: "on", ur: "پر" } },
  { ar: "بَيْنَ", zone: "between", cap: { en: "between", ur: "درمیان" } },
];
const ZONES = {
  above: { l: 57, t: 4, w: 37, h: 22 }, on: { l: 57, t: 27, w: 37, h: 12 }, inside: { l: 60, t: 43, w: 31, h: 22 },
  below: { l: 57, t: 76, w: 37, h: 22 }, between: { l: 37, t: 40, w: 19, h: 30 },
};
const ZONE_CAP = Object.fromEntries(PLACE.map((p) => [p.zone, p.cap]));
const NO = [
  { ar: "لَمْ", zone: "past", cap: { en: "did not", ur: "نہیں کیا" } },
  { ar: "لَنْ", zone: "future", cap: { en: "will never", ur: "ہرگز نہیں کرے گا" } },
  { ar: "لَا", zone: "now", cap: { en: "does not / don't", ur: "نہیں / مت" } },
];
const SEGS = [
  { zone: "past", icon: "⏪", cap: { en: "past", ur: "گزرا ہوا" } },
  { zone: "now", icon: "📍", cap: { en: "now", ur: "ابھی" } },
  { zone: "future", icon: "⏩", cap: { en: "later", ur: "بعد میں" } },
];
const CHIPS = [
  { id: "wa", ar: "وَ", side: "front", ico: "⊕", cap: { en: "and", ur: "اور" } },
  { id: "bi", ar: "بِ", side: "front", ico: "✋", cap: { en: "with", ur: "سے" } },
  { id: "al", ar: "الْ", side: "front", ico: "🔦", cap: { en: "the", ur: "وہی" } },
  { id: "hum", ar: "هُمْ", side: "end", ico: "👥", cap: { en: "their", ur: "ان کا" } },
  { id: "na", ar: "نَا", side: "end", ico: "🙋🙋", cap: { en: "our", ur: "ہمارا" } },
  { id: "ka", ar: "كَ", side: "end", ico: "🫵", cap: { en: "your", ur: "تمہارا" } },
];
const SNAP = [
  { want: ["hum"], pic: ["📖", "👥"], result: "كِتَابُهُمْ" },
  { want: ["na"], pic: ["📖", "🙋🙋"], result: "كِتَابُنَا" },
  { want: ["ka"], pic: ["📖", "🫵"], result: "كِتَابُكَ" },
  { want: ["bi", "al"], pic: ["✋", "🔦", "📖"], result: "بِالْكِتَابِ" },
];
const ROOT = {
  seeds: ["ع", "ل", "م"], cap: { en: "knowing", ur: "جاننا" },
  petals: [
    { icon: "⏪", ar: "عَلِمَ", cap: { en: "he knew", ur: "اس نے جانا" } },
    { icon: "▶️", ar: "يَعْلَمُ", cap: { en: "he knows", ur: "وہ جانتا ہے" } },
    { icon: "☝️", ar: "اِعْلَمْ", cap: { en: "know!", ur: "جان لو" } },
    { icon: "🧍", ar: "عَالِم", cap: { en: "one who knows", ur: "جاننے والا" } },
    { icon: "📦", ar: "مَعْلُوم", cap: { en: "known", ur: "جانا ہوا" } },
    { icon: "⚙️", ar: "عِلْم", cap: { en: "knowledge", ur: "علم" } },
  ],
};
const WHEEL = [
  { who: "👤", g: "m", ar: "كَتَبَ", end: "", cap: { en: "he wrote", ur: "اس نے لکھا" } },
  { who: "👤", g: "f", ar: "كَتَبَتْ", end: "تْ", cap: { en: "she wrote", ur: "اس نے لکھا" } },
  { who: "👥", g: "m", ar: "كَتَبُوا", end: "وا", cap: { en: "they wrote", ur: "انہوں نے لکھا" } },
  { who: "🫵", g: "m", ar: "كَتَبْتَ", end: "تَ", cap: { en: "you wrote", ur: "تم نے لکھا" } },
  { who: "🙋", g: "", ar: "كَتَبْتُ", end: "تُ", cap: { en: "I wrote", ur: "میں نے لکھا" } },
  { who: "🙋🙋", g: "", ar: "كَتَبْنَا", end: "نَا", cap: { en: "we wrote", ur: "ہم نے لکھا" } },
];
const GLOSS = [
  { pic: "✦", cap: { en: "all praise", ur: "سب تعریف" } },
  { pic: "🎁", medal: "اللّٰه", cap: { en: "for Allah", ur: "اللہ کے لیے" } },
  { medal: "رَبّ", cap: { en: "Lord", ur: "رب" } },
  { pic: "🌍", cap: { en: "of the worlds", ur: "تمام جہانوں کا" } },
];
const DISTRACT = [{ pic: "☀️", cap: { en: "sun", ur: "سورج" } }, { pic: "📖", cap: { en: "book", ur: "کتاب" } }, { pic: "👥", cap: { en: "they", ur: "وہ سب" } }];
const TRANS = { en: "All praise is for Allah, Lord of the worlds. (sample)", ur: "سب تعریف اللہ کے لیے ہے جو تمام جہانوں کا رب ہے۔ (نمونہ)" };

// ---------- tiny helpers ----------
const state = { lang: "en", caps: true, meter: 12, engine: 0, target: null, hintLevel: 0, seen: new Set(), lit: new Set() };
const stage = document.getElementById("stage");
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}
const cap = (o) => h("span", { class: "cap", "data-en": o.en, "data-ur": o.ur }, o[state.lang]);
const ar = (text, cls = "") => h("span", { lang: "ar", class: cls }, text);
const rotate = (a, k) => a.slice(k).concat(a.slice(0, k));
function options(list, i, n) {
  const others = list.filter((_, j) => j !== i);
  const picked = [list[i], ...Array.from({ length: n - 1 }, (_, k) => others[(i + k) % others.length])];
  return rotate(picked, i % n);
}
const dots = (i, n) => h("div", { class: "dots" }, Array.from({ length: n }, (_, k) => h("i", { class: k < i ? "on" : "" })));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function setMeter(v) {
  state.meter = Math.min(85, v);
  document.getElementById("meterNum").textContent = state.meter + "%";
  const hgt = (26 * state.meter) / 100;
  const fill = document.getElementById("lampFill");
  fill.setAttribute("y", String(36 - hgt));
  fill.setAttribute("height", String(hgt));
}
const api = {
  target(el) { state.target = el; state.hintLevel = 0; },
  right(el) { el.classList.add("right"); setMeter(state.meter + 1); },
  wrong(el) { el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong"); },
  done() {
    state.lit.add(state.engine);
    renderTabs();
    const next = (state.engine + 1) % ENGINES.length;
    stage.append(h("div", { class: "done-card" }, h("div", {},
      h("div", { class: "big" }, "🪔"),
      cap({ en: "Room lamp lit", ur: "کمرے کا چراغ روشن" }),
      h("button", { "aria-label": "Play again", onclick: () => show(state.engine) }, "↻"),
      h("button", { "aria-label": "Next game", onclick: () => show(next) }, ENGINES[next].icon))));
  },
};

// ---------- show-me hand (hint 1) and reveal (hint 2) ----------
const hand = h("div", { class: "hand", "aria-hidden": "true" }, "👆");
async function showMe() {
  const t = state.target;
  if (!t || !t.isConnected) return;
  const s = stage.getBoundingClientRect();
  const r = t.getBoundingClientRect();
  stage.append(hand);
  hand.style.transition = "none";
  hand.style.transform = "translate(" + (s.width / 2) + "px," + (s.height - 40) + "px)";
  hand.style.opacity = "1";
  await wait(30);
  const at = "translate(" + (r.left - s.left + r.width / 2 - 14) + "px," + (r.top - s.top + r.height / 2 - 6) + "px)";
  hand.style.transition = "";
  hand.style.setProperty("--at", at);
  hand.style.transform = at;
  await wait(950);
  hand.classList.add("tap");
  await wait(1100);
  hand.classList.remove("tap");
  hand.style.opacity = "0";
}
function hint() {
  state.hintLevel++;
  if (state.hintLevel === 1) showMe();
  else if (state.target) state.target.classList.add("reveal");
}

// ---------- E1 Picture Match ----------
function matchEngine() {
  let i = 0;
  const step = () => {
    if (i >= 5) return api.done();
    const item = MATCH[i];
    const grid = h("div", { class: "grid4" }, options(MATCH, i, 4).map((o) => {
      const b = h("button", { class: "pic", "aria-label": o.cap.en, onclick: async () => {
        if (o !== item) return api.wrong(b);
        api.right(b); i++; await wait(650); step();
      } }, h("span", { class: "emoji" }, o.pic), cap(o.cap));
      if (o === item) api.target(b);
      return b;
    }));
    stage.replaceChildren(h("div", { class: "prompt" }, ar(item.ar, "word")), grid, dots(i, 5));
  };
  step();
}

// ---------- E2 Place & Point (lamp + box, then the No stamp) ----------
function placeEngine() {
  let i = 0;
  const total = PLACE.length + NO.length;
  const lamp = h("div", { class: "lampobj" }, "🪔");
  const home = () => { lamp.style.left = "12%"; lamp.style.top = "14%"; };
  const scene = h("div", { class: "scene" },
    h("div", { class: "box", style: "left:8%;top:42%;width:28%;height:28%" }),
    h("div", { class: "box open", style: "left:60%;top:42%;width:31%;height:28%" }),
    h("div", { class: "table" }), h("div", { class: "leg", style: "left:57%" }), h("div", { class: "leg", style: "left:91%" }),
    lamp);
  const zoneBtns = {};
  const prompt = h("div", { class: "prompt" });
  let progress = dots(0, total);
  for (const [z, r] of Object.entries(ZONES)) {
    const b = h("button", { class: "zone", "aria-label": ZONE_CAP[z].en, style: "left:" + r.l + "%;top:" + r.t + "%;width:" + r.w + "%;height:" + r.h + "%" });
    b.addEventListener("click", () => tryZone(z, b, r));
    zoneBtns[z] = b;
    scene.append(b);
  }
  async function tryZone(z, b, r) {
    const item = PLACE[i];
    lamp.style.left = r.l + r.w / 2 + "%";
    lamp.style.top = r.t + r.h / 2 + "%";
    if (z !== item.zone) {
      const c = h("div", { class: "cap", style: "text-align:center;visibility:visible" }, ZONE_CAP[z][state.lang]);
      prompt.append(c); api.wrong(lamp); await wait(900); c.remove(); return home();
    }
    api.right(b); i++; await wait(800); b.classList.remove("right"); home(); step();
  }
  function step() {
    if (i >= PLACE.length) return noStamp();
    prompt.replaceChildren(ar(PLACE[i].ar, "word"));
    api.target(zoneBtns[PLACE[i].zone]);
    const d = dots(i, total); progress.replaceWith(d); progress = d;
  }
  stage.replaceChildren(prompt, scene, progress);
  home(); step();

  function noStamp() {
    let k = 0;
    const p2 = h("div", { class: "prompt" });
    let d2 = dots(PLACE.length, total);
    const segs = SEGS.map((s) => {
      const b = h("button", { class: "seg " + s.zone, "aria-label": s.cap.en }, s.icon, cap(s.cap));
      b.addEventListener("click", async () => {
        const st = h("span", { class: "stamp" }, "✕");
        b.append(st);
        if (s.zone !== NO[k].zone) { api.wrong(b); await wait(700); st.remove(); return; }
        api.right(b); k++; await wait(800); st.remove(); b.classList.remove("right"); next();
      });
      return b;
    });
    stage.replaceChildren(p2, h("div", { class: "timeline" }, segs), d2);
    function next() {
      if (k >= NO.length) return api.done();
      p2.replaceChildren(ar(NO[k].ar, "word"));
      api.target(segs[SEGS.findIndex((s) => s.zone === NO[k].zone)]);
      const nd = dots(PLACE.length + k, total); d2.replaceWith(nd); d2 = nd;
    }
    next(); showMe();
  }
}

// ---------- E3 Snap Pieces ----------
function snapEngine() {
  let t = 0;
  const step = () => {
    if (t >= SNAP.length) return api.done();
    const task = SNAP[t];
    const placed = new Set();
    const build = h("div", { class: "build" });
    const result = h("div", { class: "result" });
    const slot = (c) => h("div", { class: "slot" + (c ? " filled" : "") }, c ? c.ar : "");
    const render = () => {
      const fronts = CHIPS.filter((c) => c.side === "front" && placed.has(c.id));
      const ends = CHIPS.filter((c) => c.side === "end" && placed.has(c.id));
      build.replaceChildren(...(fronts.length ? fronts : [null]).map(slot),
        h("div", { class: "base" }, ar("كِتَاب"), h("span", {}, "📖")),
        ...(ends.length ? ends : [null]).map(slot));
    };
    const chips = CHIPS.map((c) => {
      const b = h("button", { class: "chip " + c.side, "aria-label": c.cap.en }, h("b", {}, c.ar), h("span", { class: "ico" }, c.ico), cap(c.cap));
      b.addEventListener("click", async () => {
        if (!task.want.includes(c.id) || placed.has(c.id)) return api.wrong(b);
        placed.add(c.id); b.disabled = true; b.style.opacity = ".35"; render();
        const left = task.want.filter((id) => !placed.has(id));
        if (left.length) return api.target(chips[CHIPS.findIndex((x) => x.id === left[0])]);
        result.textContent = task.result; result.classList.add("right"); setMeter(state.meter + 1);
        t++; await wait(1100); step();
      });
      return b;
    });
    render();
    api.target(chips[CHIPS.findIndex((x) => x.id === task.want[0])]);
    stage.replaceChildren(h("div", { class: "prompt" }, h("div", { class: "target" }, task.pic.map((p) => h("span", {}, p)))),
      build, result, h("div", { class: "chips" }, chips), dots(t, SNAP.length));
  };
  step();
}

// ---------- circle layout for E4 / E5 ----------
function around(items, radiusPct, cls) {
  return items.map((el, k) => {
    const a = (k / items.length) * 2 * Math.PI - Math.PI / 2;
    el.style.left = 50 + radiusPct * Math.cos(a) + "%";
    el.style.top = 50 + radiusPct * Math.sin(a) + "%";
    el.classList.add(cls);
    return el;
  });
}

// ---------- E4 Root Garden: six petals ----------
function rootEngine() {
  let i = 0;
  const petals = around(ROOT.petals.map((p) => h("div", { "aria-label": p.cap.en }, p.icon)), 38, "petal");
  const circle = h("div", { class: "circle" },
    h("div", { class: "center" }, h("div", { class: "seeds" }, ROOT.seeds.map((s) => h("b", {}, s))), h("span", { style: "font-size:1.6rem" }, "🌱"), cap(ROOT.cap)),
    petals);
  const opts = h("div", { class: "opts" });
  const step = () => {
    petals.forEach((p, k) => p.classList.toggle("now", k === i));
    if (i >= ROOT.petals.length) { circle.classList.add("bloom"); return setTimeout(api.done, 900); }
    opts.replaceChildren(...options(ROOT.petals, i, 3).map((o) => {
      const b = h("button", { class: "opt", "aria-label": o.cap.en }, o.ar);
      b.addEventListener("click", async () => {
        if (o !== ROOT.petals[i]) return api.wrong(b);
        api.right(b);
        petals[i].replaceChildren(o.icon, h("span", { class: "ar" }, o.ar));
        petals[i].classList.add("filled");
        i++; await wait(500); step();
      });
      if (o === ROOT.petals[i]) api.target(b);
      return b;
    }));
  };
  stage.replaceChildren(circle, opts);
  step();
}

// ---------- E5 Person Wheel: past endings ----------
function wheelEngine() {
  let i = 0;
  const people = around(WHEEL.map((w) => h("div", { "aria-label": w.cap.en }, w.who,
    w.g ? h("span", { class: "badge " + w.g }, w.g === "m" ? "▲" : "●") : null)), 38, "petal");
  const circle = h("div", { class: "circle" },
    h("div", { class: "center" }, h("span", { style: "font-size:1.6rem" }, "⏪"), h("div", { class: "seeds" }, ["ك", "ت", "ب"].map((s) => h("b", {}, s))), cap({ en: "wrote", ur: "لکھا" })),
    people);
  const opts = h("div", { class: "opts" });
  const word = (w) => [w.ar.slice(0, w.ar.length - w.end.length), h("span", { class: "endpart" }, w.end)];
  const step = () => {
    people.forEach((p, k) => p.classList.toggle("now", k === i));
    if (i >= WHEEL.length) return setTimeout(api.done, 600);
    opts.replaceChildren(...options(WHEEL, i, 3).map((o) => {
      const b = h("button", { class: "opt", "aria-label": o.cap.en }, ...word(o));
      b.addEventListener("click", async () => {
        if (o !== WHEEL[i]) return api.wrong(b);
        api.right(b);
        people[i].append(h("span", { class: "ar" }, o.ar));
        people[i].classList.add("filled");
        i++; await wait(500); step();
      });
      if (o === WHEEL[i]) api.target(b);
      return b;
    }));
  };
  stage.replaceChildren(circle, opts);
  step();
}

// ---------- E6 Ayah Light-Up ----------
function ayahEngine() {
  const done = new Set();
  const row = h("div", { class: "ayah" });
  const opts = h("div", { class: "opts" });
  const trans = h("div", { class: "trans" });
  const glossView = (g) => h("span", { style: "display:flex;gap:4px;align-items:center" }, g.pic ? h("span", {}, g.pic) : null, g.medal ? h("span", { class: "medal" }, g.medal) : null);
  const tiles = AYAH.words.map((w, k) => {
    const t = h("button", { class: "tile glow", "aria-label": "word " + (k + 1) }, h("span", { class: "ar" }, w), h("span", { class: "gl" }));
    t.addEventListener("click", () => choose(k));
    return t;
  });
  row.append(...tiles);
  function choose(k) {
    if (done.has(k)) return;
    const pool = [...GLOSS.filter((_, j) => j !== k), ...DISTRACT];
    const picked = rotate([GLOSS[k], pool[k % pool.length], pool[(k + 2) % pool.length]], k % 3);
    opts.replaceChildren(...picked.map((g) => {
      const b = h("button", { class: "pic", style: "min-width:96px", "aria-label": g.cap.en }, glossView(g), cap(g.cap));
      b.addEventListener("click", async () => {
        if (g !== GLOSS[k]) return api.wrong(b);
        api.right(b);
        tiles[k].classList.remove("glow"); tiles[k].classList.add("done");
        tiles[k].querySelector(".gl").replaceChildren(glossView(g), cap(g.cap));
        done.add(k); opts.replaceChildren();
        const next = AYAH.words.findIndex((_, j) => !done.has(j));
        if (next === -1) {
          row.classList.add("lit");
          trans.replaceChildren(h("span", { class: "cap", "data-en": TRANS.en, "data-ur": TRANS.ur, style: "visibility:visible" }, TRANS[state.lang]));
          await wait(1600); return api.done();
        }
        api.target(tiles[next]);
      });
      if (g === GLOSS[k]) api.target(b);
      return b;
    }));
  }
  api.target(tiles[0]);
  stage.replaceChildren(h("div", { class: "cap", style: "text-align:center" }, "1:2"), row, opts, trans);
}

// ---------- Relight: spaced repetition with word lamps (docs/MEMORY_SYSTEM.md) ----------
const DECK = [
  ...MATCH.map((m, k) => ({ ...m, id: ["shams", "qamar", "jabal", "bahr", "shajara", "maa"][k] })),
  { id: "kitab", ar: "كِتَاب", pic: "📖", cap: { en: "book", ur: "کتاب" } },
  { id: "ard", ar: "أَرْض", pic: "🌍", cap: { en: "earth", ur: "زمین" } },
  { id: "layl", ar: "لَيْل", pic: "🌃", cap: { en: "night", ur: "رات" } },
  { id: "nar", ar: "نَار", pic: "🔥", cap: { en: "fire", ur: "آگ" } },
  { id: "bayt", ar: "بَيْت", pic: "🏠", cap: { en: "house", ur: "گھر" } },
];
// Simulated history so the shelf starts with a mix: [level, due day]. Day 0 is "today".
const START = { shams: [3, 0], qamar: [2, 0], jabal: [1, 0], bahr: [4, 2], shajara: [2, 0], maa: [5, 9], kitab: [1, 0], ard: [3, 1], layl: [2, 0], nar: [6, 30], bayt: [1, 0] };
const memory = { day: 0, cards: DECK.map((w) => ({ ...newCard(w.id, 0), level: START[w.id][0], due: START[w.id][1] })) };

function relightEngine() {
  const byId = Object.fromEntries(DECK.map((w) => [w.id, w]));
  let queue = dueCards(memory.cards, memory.day, 8).map((c) => c.id);
  const cardOf = (id) => memory.cards.find((c) => c.id === id);
  const put = (c) => { memory.cards = memory.cards.map((x) => (x.id === c.id ? c : x)); };
  const shelf = h("div", { class: "shelf", "aria-label": "word lamps" });
  const area = h("div", { class: "relight-area" });
  const nextDay = h("button", { class: "nextday", "aria-label": "Next day", onclick: () => { memory.day++; relightEngine(); } }, "⏭ ☀️");
  const dayBar = h("div", { class: "daybar" }, h("span", {}, "📅 ", String(memory.day + 1)), nextDay);

  function drawShelf(flashId) {
    shelf.replaceChildren(...memory.cards.map((c) => {
      const l = lamp(c, memory.day);
      const when = l.dim ? "" : c.level === 0 ? "—" : l.inDays === 0 ? "🌙" : "☀️×" + l.inDays;
      const tile = h("div", { class: "lampcard" + (l.dim ? " dim" : "") + (l.gold ? " gold" : "") + (c.id === flashId ? " right" : "") },
        h("span", { class: "lampicon" }, "🪔"),
        h("span", { class: "flames" }, Array.from({ length: MAX_LEVEL }, (_, k) => h("i", { class: k < l.flames ? "on" : "" }))),
        h("span", { class: "lw" }, byId[c.id].ar),
        h("span", { class: "when" }, when));
      return tile;
    }));
  }

  function next(flashId) {
    drawShelf(flashId);
    if (!queue.length) {
      state.lit.add(state.engine);
      renderTabs();
      area.replaceChildren(h("div", { class: "alllit" }, h("div", { class: "big" }, "🪔✨"),
        cap({ en: "All due lamps relit. Tap ⏭ to see tomorrow.", ur: "سب چراغ روشن۔ کل دیکھنے کے لیے ⏭ دبائیں۔" })));
      api.target(nextDay);
      return;
    }
    const c = cardOf(queue[0]);
    const w = byId[c.id];
    const mode = nextEngine(c, ["toPic", "toWord"]);
    let missed = false;
    const prompt = mode === "toPic" ? ar(w.ar, "word") : h("span", { class: "big-emoji" }, w.pic);
    const grid = h("div", { class: "grid4" }, options(DECK, DECK.indexOf(w), 4).map((o) => {
      const face = mode === "toPic" ? h("span", { class: "emoji" }, o.pic) : h("span", { class: "optar" }, o.ar);
      const b = h("button", { class: "pic", "aria-label": o.cap.en }, face, cap(o.cap));
      b.addEventListener("click", async () => {
        if (o !== w) {
          api.wrong(b);
          if (!missed) {
            missed = true;
            put(grade(recordMixup(cardOf(c.id), o.id), "wrong", memory.day, mode));
            queue = requeue(queue, c.id);
            drawShelf(c.id);
          }
          return;
        }
        api.right(b);
        if (!missed) {
          put(grade(cardOf(c.id), state.hintLevel > 0 ? "hinted" : "easy", memory.day, mode));
          queue = queue.slice(1);
        }
        await wait(600);
        next(c.id);
      });
      if (o === w) api.target(b);
      return b;
    }));
    area.replaceChildren(h("div", { class: "prompt" }, prompt), grid);
  }

  stage.replaceChildren(dayBar, shelf, area);
  next();
}

// ---------- engines, tabs, toolbar ----------
const ENGINES = [
  { icon: "🖼️", name: { en: "Pictures", ur: "تصویریں" }, run: matchEngine },
  { icon: "🪔", name: { en: "Place", ur: "جگہ" }, run: placeEngine },
  { icon: "🧩", name: { en: "Snap", ur: "جوڑیں" }, run: snapEngine },
  { icon: "🌱", name: { en: "Root", ur: "جڑ" }, run: rootEngine },
  { icon: "🎡", name: { en: "People", ur: "لوگ" }, run: wheelEngine },
  { icon: "📜", name: { en: "Ayah", ur: "آیت" }, run: ayahEngine },
  { icon: "🔁", name: { en: "Relight", ur: "دہرائیں" }, run: relightEngine },
];
function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.replaceChildren(...ENGINES.map((e, k) => h("button", {
    role: "tab", "aria-selected": String(k === state.engine), class: state.lit.has(k) ? "lit" : "",
    onclick: () => show(k),
  }, e.icon, h("small", { class: "cap", "data-en": e.name.en, "data-ur": e.name.ur, style: "visibility:visible" }, e.name[state.lang]))));
}
function show(k) {
  state.engine = k;
  state.target = null;
  renderTabs();
  ENGINES[k].run();
  if (!state.seen.has(k)) { state.seen.add(k); setTimeout(showMe, 450); }
}
document.getElementById("hintBtn").addEventListener("click", hint);
document.getElementById("capBtn").addEventListener("click", (e) => {
  state.caps = !state.caps;
  document.body.classList.toggle("nocap", !state.caps);
  e.currentTarget.setAttribute("aria-pressed", String(state.caps));
});
document.getElementById("langBtn").addEventListener("click", (e) => {
  state.lang = state.lang === "en" ? "ur" : "en";
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ur" ? "rtl" : "ltr";
  e.currentTarget.textContent = state.lang === "en" ? "اردو" : "EN";
  document.querySelectorAll("[data-en]").forEach((el) => { el.textContent = el.dataset[state.lang]; });
});
setMeter(state.meter);
show(0);
</script>
</body>
</html>
`;

await mkdir(join(ROOT, "prototypes"), { recursive: true });
await writeFile(join(ROOT, "prototypes/visual-games.html"), html);
console.log("wrote prototypes/visual-games.html");
