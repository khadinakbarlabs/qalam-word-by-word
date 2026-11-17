#!/usr/bin/env node
// M0: write prototypes/font-test.html — Al-Fatiha (verbatim Tanzil text) in candidate Qur'an fonts, Basmala word
// tiles with sample English/Urdu glosses, and the Root Lens split shown as an overlay above the intact word (PLAN D4).
// Fonts load from Google Fonts for this dev test only; a release build self-hosts them.
// Usage: node scripts/font-test.mjs   then open the quran-words preview at /prototypes/font-test.html

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, loadCorpus, tanzilWords } from "./lib/corpus.mjs";

const { ayat } = await loadCorpus();
const fatiha = [1, 2, 3, 4, 5, 6, 7].map((a) => ({ a, text: tanzilWords(ayat.get(`1:${a}`)).join(" ") }));
const basmala = tanzilWords(ayat.get("1:1"));
const arabicDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

// Sample glosses for the font test only — NOT reviewed, not game content.
const GLOSS = [
  { en: "In the name", ur: "نام سے", split: [["بِ", "in, with", "سے، میں"], ["اسْمِ", "name", "نام"]] },
  { en: "of Allah", ur: "اللہ کے" },
  { en: "the Most Gracious", ur: "نہایت مہربان" },
  { en: "the Most Merciful", ur: "رحم کرنے والا" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tiles = basmala
  .map((w, i) => {
    const g = GLOSS[i];
    const split = g.split
      ? `<div class="lens" aria-label="Root Lens">${g.split.map(([ar, en, ur]) => `<span class="piece"><b lang="ar">${ar}</b><i data-en="${en}" data-ur="${ur}">${en}</i></span>`).join("<span class=plus>+</span>")}</div>`
      : "";
    return `<button class="tile${i === 0 ? " open" : ""}">${split}<span class="ar" lang="ar">${esc(w)}</span><span class="gloss" data-en="${g.en}" data-ur="${g.ur}">${g.en}</span></button>`;
  })
  .join("\n      ");
const fatihaHtml = fatiha.map(({ a, text }) => `<span lang="ar">${esc(text)}</span> <span class="num">﴿${arabicDigits(a)}﴾</span>`).join(" ");

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Font Test</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Noto+Naskh+Arabic:wght@400;600&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --paper: #f6efe1; --ink: #2b2118; --ink-soft: #6b5a48; --lamp: #c8902e; --lamp-glow: #f3d48c; --line: #e2d5bd;
    --quran-font: "Amiri Quran", serif; --urdu-font: "Noto Nastaliq Urdu", serif; --ui-font: system-ui, sans-serif;
    --quran-size: clamp(1.9rem, 1.4rem + 2.4vw, 2.8rem);
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--ui-font); }
  [dir="rtl"] body, [lang="ur"] .ui { font-family: var(--urdu-font); }
  main { max-width: 760px; margin: 0 auto; padding: 16px; }
  h1 { font-size: 1.1rem; margin: 0 0 4px; }
  p.note { color: var(--ink-soft); font-size: .85rem; margin: 0 0 12px; line-height: 1.9; }
  .bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 16px; }
  .bar button { font: inherit; font-size: .85rem; padding: 8px 12px; border-radius: 999px; border: 1px solid var(--line); background: #fff8ec; color: var(--ink); min-height: 44px; }
  .bar button[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
  section { background: #fffaf0; border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
  h2 { font-size: .8rem; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 12px; }
  [lang="ar"] { font-family: var(--quran-font); }
  .row { display: flex; flex-wrap: wrap; flex-direction: row; direction: rtl; gap: 10px; justify-content: flex-start; align-items: flex-end; }
  .tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 10px 10px; min-width: 64px;
    border: 1px solid var(--line); border-radius: 12px; background: #fff; font: inherit; color: inherit; cursor: pointer; }
  /* Uthmani marks sit far above and below the letters; give the word its own tall line so marks never touch the gloss. */
  .tile .ar { font-size: var(--quran-size); line-height: 2.5; margin-bottom: -0.2em; }
  .tile .gloss { font-size: .8rem; color: var(--ink-soft); direction: ltr; }
  [lang="ur"] .tile .gloss { font-family: var(--urdu-font); font-size: .85rem; line-height: 2.2; direction: rtl; }
  .tile.open { border-color: var(--lamp); box-shadow: 0 0 0 3px var(--lamp-glow); }
  .lens { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 10px; background: var(--ink); color: var(--paper); direction: rtl; }
  .lens .piece { display: flex; flex-direction: column; align-items: center; }
  .lens b { font-weight: 400; font-size: 1.3rem; line-height: 2.4; }
  .lens i { font-style: normal; font-size: .7rem; }
  [lang="ur"] .lens i { font-family: var(--urdu-font); line-height: 2; }
  .lens .plus { opacity: .6; }
  .surah { direction: rtl; text-align: justify; font-size: var(--quran-size); line-height: 2.3; }
  .num { font-family: var(--quran-font); color: var(--lamp); }
  .urdu-sample { font-family: var(--urdu-font); direction: rtl; line-height: 2.4; font-size: 1.05rem; margin: 0; }
  footer { font-size: .75rem; color: var(--ink-soft); padding: 0 4px 24px; line-height: 1.8; }
</style>
</head>
<body>
<main>
  <h1>M0 font test</h1>
  <p class="note">Qur'an text is verbatim from Tanzil. The glosses are unreviewed samples used only to check how the fonts render.</p>
  <div class="bar" role="group" aria-label="Qur'an font">
    <button data-font='"Amiri Quran", serif' aria-pressed="true">Amiri Quran</button>
    <button data-font='"Noto Naskh Arabic", serif' aria-pressed="false">Noto Naskh Arabic</button>
    <button data-font='serif' aria-pressed="false">System</button>
  </div>
  <div class="bar" role="group" aria-label="Language">
    <button data-lang="en" aria-pressed="true">English</button>
    <button data-lang="ur" aria-pressed="false">اردو</button>
  </div>
  <section>
    <h2 class="ui" data-en="Word tiles + Root Lens" data-ur="الفاظ اور جڑ کا شیشہ">Word tiles + Root Lens</h2>
    <div class="row">
      ${tiles}
    </div>
  </section>
  <section>
    <h2 class="ui" data-en="Al-Fatiha 1:1–7" data-ur="سورۃ الفاتحہ ۱–۷">Al-Fatiha 1:1–7</h2>
    <div class="surah">${fatihaHtml}</div>
  </section>
  <section>
    <h2 class="ui" data-en="Urdu interface sample" data-ur="اردو انٹرفیس کا نمونہ">Urdu interface sample</h2>
    <p class="urdu-sample">پہلے لفظ پر ٹیپ کریں۔ آپ قرآن کے تقریباً ۳۲٪ الفاظ پہچانتے ہیں۔</p>
  </section>
</main>
<footer>Qur'an text: Tanzil Project (tanzil.net), Uthmani v1.1, Creative Commons Attribution 3.0, used verbatim. Fonts: Amiri Quran, Noto Naskh Arabic and Noto Nastaliq Urdu (SIL Open Font License).</footer>
<script>
  const root = document.documentElement;
  document.querySelectorAll("[data-font]").forEach((b) => b.addEventListener("click", () => {
    root.style.setProperty("--quran-font", b.dataset.font);
    document.querySelectorAll("[data-font]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    const lang = b.dataset.lang;
    root.lang = lang;
    root.dir = lang === "ur" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en]").forEach((el) => { el.textContent = el.dataset[lang]; });
    document.querySelectorAll("[data-lang]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
</script>
</body>
</html>
`;

await mkdir(join(ROOT, "prototypes"), { recursive: true });
await writeFile(join(ROOT, "prototypes/font-test.html"), html);
console.log("wrote prototypes/font-test.html");
