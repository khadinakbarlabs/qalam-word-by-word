// Build + validate the game content pack from authoring/ (words, ayat, rooms) and the corpus.
// Pure: returns { pack, errors }. scripts/build-pack.mjs writes it; tests/pack.test.mjs checks it.

import { WORDS } from "../../authoring/words.js";
import { AYAT } from "../../authoring/ayat.js";
import { ROOMS, COMING } from "../../authoring/rooms.js";
import { unitStats } from "./corpus.mjs";
import { SCENES } from "../../game/core/scenes.js";
import { ART } from "../../authoring/art.js";
import { WHY_UR } from "../../authoring/why-ur.js";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const PACK_VERSION = 1;
// Tanzil's terms: their copyright block goes, unchanged, into every file that carries the Qur'an text. It is read from
// the source file (the "#" lines at its end), so it always matches the copy we use.
export function tanzilNotice() {
  const text = readFileSync(fileURLToPath(new URL("../../data/source/tanzil/quran-uthmani.txt", import.meta.url)), "utf8");
  return text.split("\n").filter((l) => l.startsWith("#")).join("\n");
}
// Full-ayah translations shown after an ayah is read (Khadin's choice 2026-11-05: well-known scholars, public domain):
// English Abdullah Yusuf Ali, Urdu Maulana Muhammad Junagarhi. Lines from data/source/translations/ (Tanzil "text with
// aya numbers": sura|aya|text), word for word; only the letter encoding is tidied (cleanText). See data/source/README.md.
const TRANSLATIONS = { en: "en.yusufali.txt", ur: "ur.junagarhi.txt" };
// Encoding only, never wording: Arabic presentation forms (the one-glyph "ﻻ") become ordinary letters, and in Urdu the
// Arabic heh "ه" becomes Urdu "ہ" (Tanzil's older Urdu files use the Arabic letter; Nastaliq fonts draw them differently).
const cleanText = (lang, text) => {
  const plain = text.replace(/[\uFB50-\uFDFF\uFE70-\uFEFF]/g, (c) => c.normalize("NFKC"));
  return lang === "ur" ? plain.replace(/\u0647/g, "\u06C1") : plain;
};
let trCache = null;
function translations() {
  if (trCache) return trCache;
  trCache = Object.fromEntries(Object.entries(TRANSLATIONS).map(([lang, file]) => {
    const text = readFileSync(fileURLToPath(new URL(`../../data/source/translations/${file}`, import.meta.url)), "utf8");
    return [lang, new Map(text.split("\n").filter((l) => /^\d+\|\d+\|/.test(l)).map((l) => {
      const [s, a, ...rest] = l.split("|");
      return [`${s}:${a}`, cleanText(lang, rest.join("|").trim())];
    }))];
  }));
  return trCache;
}
export const translationOf = (ref) => {
  const tr = translations();
  return tr.en.get(ref) && tr.ur.get(ref) ? { en: tr.en.get(ref), ur: tr.ur.get(ref) } : null;
};
const PERSONS = ["1s", "1p", "2ms", "2mp", "3ms", "3fs", "3mp", "2fs", "2d", "3d", "2fp", "3fp"];
const FIRST_RING = PERSONS.slice(0, 7);
const ZONES = ["above", "on", "inside", "below", "between", "behind", "front", "around", "from", "to"];
// Names and attributes of Allah: calligraphy medallion only, never a picture (VISUAL_GAMES §1 respect rules).
const MEDAL_ONLY = new Set([
  "L:اللَّه", "L:رَحْمٰن", "L:رَحِيم", "L:رَبّ", "L:مالِك", "L:عَلِيم", "L:حَكِيم", "L:سَمِيع", "L:بَصِير", "L:عَزِيز",
  "L:غَفُور", "L:قَدِير", "L:خَبِير", "L:حَلِيم", "L:حَمِيد", "L:تَوّاب", "L:وَكِيل", "L:قَهّار", "L:غَفّار", "L:وَهّاب", "L:لَطِيف",
  "L:خالِق", "L:رازِق", "L:قادِر", "L:راحِم", "L:جامِع", "L:رافِع", "L:غافِر", "L:واسِع", "L:وارِث", "L:هاد", "L:مُجِيب", "L:مُحِيط", "L:مُحْى", "L:صَمَد", "L:قَيُّوم",
]);
// Prophets, angels and revealed books: never a picture; their names are shown on a parchment scroll (VISUAL_GAMES §1 respect rules).
const SCROLL_ONLY = new Set([
  "L:رَسُول", "L:نَبِيّ", "L:آدَم", "L:نُوح", "L:إِبْراهِيم", "L:إِسْماعِيل", "L:إِسْحاق", "L:يَعْقُوب", "L:يُوسُف", "L:مُوسَى",
  "L:هارُون", "L:عِيسَى", "L:مَرْيَم", "L:داوُد", "L:سُلَيْمان", "L:لُوط", "L:إِسْرائِيل", "L:هُود", "L:شُعَيْب", "L:مَلَك",
  "L:قُرْءان", "L:تَوْراة", "L:إِنجِيل",
]);
const NO_PICTURE = new Set(["L:شَيْطان"]);
const RUNGS = ["base", "more"];
const PETAL_IDS = ["past", "present", "command", "doer", "done", "action"];
const MOULDS = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const ARABIC_LETTER = /[ء-يٱ-ۓ]/;

// Plain-letter key to prove an authored gloss sits on the right Tanzil word: no marks, one alef, no long vowels.
const hintKey = (s) =>
  s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "").replace(/[أإآٱء]/g, "ا").replace(/[ىئ]/g, "ي").replace(/ؤ/g, "و")
    .replace(/ة/g, "ه").replace(/[اوي]/g, "");

/** Split a Tanzil ayah into display words; pause/sajdah/hizb marks ride on the neighbouring word, unchanged. */
export function displayWords(text, dropBasmala) {
  const out = [];
  let lead = "";
  for (const t of text.split(/\s+/).filter(Boolean)) {
    if (ARABIC_LETTER.test(t)) { out.push({ ar: t, lead, mark: "" }); lead = ""; }
    else if (out.length) out[out.length - 1].mark += (out[out.length - 1].mark ? " " : "") + t;
    else lead += t;
  }
  return dropBasmala ? out.slice(4) : out;
}

/** Do the root letters appear, in order, in the word's letters? (Root Garden answers must really share the root.)
 *  Soft letters (و ي and hamza) may change shape or drop out (قَالَ يَقُولُ قُلْ from ق و ل), and a doubled root
 *  letter may be written once with a shadda (رَدَّ from ر د د). */
const SOFT = "[وياىئؤء]";
const growsFrom = (word, letters) => {
  const norm = (s) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[أإآٱ]/g, "ا");
  const seeds = letters.map(norm);
  const parts = seeds.map((c, i) => (/[ويىءا]/.test(c) ? `${SOFT}?` : i && c === seeds[i - 1] ? `${c}?` : c));
  return new RegExp(parts.join(".*")).test(norm(word));
};

const glossOk = (g) => g && typeof g.en === "string" && g.en.trim() && typeof g.ur === "string" && g.ur.trim();

/** Share of all Qur'an words whose every unit is in `known` (the strict meter, CURRICULUM §2). */
export function coverageOf(words, known) {
  let ok = 0;
  for (const w of words) if ([...w.units].every((u) => known.has(u))) ok++;
  return (100 * ok) / words.length;
}

const ART_DIR = fileURLToPath(new URL("../../game/art/", import.meta.url));
/** "img:art/<name>.webp" when the word (or the word it borrows from) has a finished painting, else null. */
export function artFor(id) {
  const entry = ART[id];
  const src = typeof entry === "object" && entry ? entry.same : entry ? id : null;
  if (!src) return null;
  const name = src.replace(/^w:/, "").replace(":", "-");
  return existsSync(`${ART_DIR}${name}.webp`) ? `img:art/${name}.webp` : null;
}
/** "What the picture shows", from its painting prompt: short and plain (no style words). Urdu comes from WHY_UR. */
export function whyFor(id) {
  const entry = ART[id];
  const src = typeof entry === "object" && entry ? entry.same : entry ? id : null;
  const text = src && typeof ART[src] === "string" ? ART[src] : null;
  if (!text || !artFor(id)) return null;
  const en = text
    .replace(/,? ?(no people|no figure|only the hands? visible)\b.*$/i, "")
    .replace(/\bfaceless\s+/gi, "")
    .replace(/\s+/g, " ").trim();
  return { en: en.charAt(0).toUpperCase() + en.slice(1), ur: WHY_UR[src] ?? null };
}

const withArt = (id, pic) => {
  const art = pic && artFor(id);
  return art ? art + (pic.match(/[▲●]$/)?.[0] ?? "") : pic;
};

export function buildPack({ words, ayat }) {
  const errors = [];
  const err = (m) => errors.push(m);
  const { count } = unitStats(words);
  // Authored units may order stacked marks differently (shadda + fatha); compare in NFC and map back to corpus ids.
  const canon = new Map([...count.keys()].map((u) => [u.normalize("NFC"), u]));
  const corpusUnit = (u) => canon.get(u.normalize("NFC"));
  const medalOnly = new Set([...MEDAL_ONLY].map((u) => u.normalize("NFC")));
  const scrollOnly = new Set([...SCROLL_ONLY].map((u) => u.normalize("NFC")));
  const noPicture = new Set([...NO_PICTURE].map((u) => u.normalize("NFC")));

  for (const [id, w] of Object.entries(WORDS)) {
    if (!glossOk(w.g)) err(`${id}: needs an English and an Urdu meaning`);
    if (w.more !== undefined && !glossOk(w.more)) err(`${id}: "more" meanings need English and Urdu`);
    if (!w.pic && !w.medal) err(`${id}: needs a picture or a medallion`);
    for (const u of w.units) if (!corpusUnit(u)) err(`${id}: unit ${u} is not in the corpus`);
    if (w.units.some((u) => medalOnly.has(u.normalize("NFC"))) && (w.pic || !w.medal)) err(`${id}: names of Allah use a calligraphy medallion only, no picture`);
    if (w.units.some((u) => scrollOnly.has(u.normalize("NFC"))) && (w.pic || !w.medal?.startsWith("scroll:"))) err(`${id}: prophets and angels use a name scroll only, no picture`);
    if (w.units.some((u) => noPicture.has(u.normalize("NFC"))) && w.pic) err(`${id}: no picture allowed`);
  }
  const word = (id, where) => (WORDS[id] ? id : (err(`${where}: unknown word ${id}`), id));

  // `key`: a second gloss set for the same ayah (e.g. "112:1/read" in a Reading Room, where every word is taught)
  const buildAyah = (ref, where, key = ref) => {
    const tokens = AYAT[key];
    const text = ayat.get(ref);
    if (!tokens || !text) { err(`${where}: no glosses or no Tanzil text for ${ref}`); return null; }
    const [s, a] = ref.split(":").map(Number);
    const shown = displayWords(text, a === 1 && s !== 1 && s !== 9);
    if (shown.length !== tokens.length) { err(`${ref}: ${tokens.length} glosses for ${shown.length} words`); return null; }
    const tr = translationOf(ref);
    if (!tr) err(`${where}: no English or Urdu translation for ${ref}`);
    return {
      type: "ayah", ref, tr: tr ?? undefined,
      words: shown.map((d, i) => {
        const t = tokens[i];
        if (hintKey(d.ar) !== hintKey(t.ar)) err(`${ref} word ${i + 1}: gloss is for "${t.ar}" but the ayah has "${d.ar}"`);
        if (!glossOk(t.g)) err(`${ref} word ${i + 1}: needs an English and an Urdu meaning`);
        if (t.given && t.w) err(`${ref} word ${i + 1}: a given word cannot also be taught`);
        if (!t.given && !(t.w ?? []).length) err(`${ref} word ${i + 1}: taught words must name their word cards`);
        if (t.given && !t.pic) err(`${ref} word ${i + 1}: given words need a picture`);
        if (t.art && !ART[t.art]) err(`${ref} word ${i + 1}: no painting prompt ${t.art}`);
        (t.w ?? []).forEach((id) => word(id, `${ref} word ${i + 1}`));
        for (const pc of t.pieces ?? []) if (!glossOk(pc.g)) err(`${ref} word ${i + 1}: every piece needs both meanings`);
        const first = t.w?.find((id) => WORDS[id] && !WORDS[id].units.every((u) => u.startsWith("A:"))) ?? t.w?.[0];
        return {
          ar: d.ar, lead: d.lead || undefined, mark: d.mark || undefined, g: t.g, w: t.w ?? [], given: Boolean(t.given),
          // a given word may borrow a painting (`art`: a word's or a "g:" given-word painting); emoji is only the fallback
          pic: (t.art && artFor(t.art)) || t.pic || withArt(first, WORDS[first]?.pic), medal: t.medal ?? WORDS[first]?.medal, pieces: t.pieces,
          why: t.art ? whyFor(t.art) ?? undefined : undefined,  // taught words: the game reads the card's own picture line
        };
      }),
    };
  };

  // `part`: [first, last] word numbers (1-based) of a long ayah, played or read as one phrase; the ayah number shows on the last part only
  const partOf = (a, part, where) => {
    if (!a || !part) return a;
    const [from, to] = part;
    if (!(from >= 1 && to >= from && to <= a.words.length)) { err(`${where}: part ${from}–${to} is outside ${a.ref} (${a.words.length} words)`); return a; }
    // the translation belongs to the whole ayah: it shows once, with the last part
    return { ...a, part, words: a.words.slice(from - 1, to), end: to === a.words.length, tr: to === a.words.length ? a.tr : undefined };
  };

  const checkStep = (st, where) => {
    switch (st.type) {
      case "ayah": return partOf(buildAyah(st.ref, where, st.key ?? st.ref), st.part, where);
      case "passage": {
        // E8 Reading Room: a whole passage, every word one the player has learnt (no given words), each line with its meaning
        if (!st.title?.ar || !glossOk(st.title)) err(`${where}: a passage needs an Arabic, English and Urdu title`);
        const ayat = st.refs.map((r) => {
          const a = partOf(buildAyah(r.ref, where, r.key ?? r.ref), r.part, where);
          for (const w of a?.words ?? []) if (w.given) err(`${where} ${r.ref}: "${w.ar}" is a given word; a Reading Room passage uses only learnt words`);
          return a;
        }).filter(Boolean);
        if (!["surah", "ayah", "passage", undefined].includes(st.whole)) err(`${where}: whole must be "surah", "ayah" or "passage"`);
        return { type: "passage", whole: st.whole ?? "surah", title: st.title, ayat };
      }
      case "meet": case "match": st.words.forEach((id) => word(id, where)); return st;
      case "story": if (!(st.panels?.length >= 3)) err(`${where}: a story needs at least 3 panels`); st.panels.forEach((p) => word(p.w, where)); return st;
      case "point": {
        const spots = new Set(st.spots.map((x) => x.id));
        for (const it of st.items) { word(it.w, where); if (!spots.has(it.spot)) err(`${where}: unknown spot ${it.spot}`); }
        // a spot that names a painting must have it finished, so a missing file fails the build instead of showing an emoji
        for (const s of st.spots) if (s.art && !artFor(s.art)) err(`${where}: spot ${s.id} needs the painting ${s.art}`);
        return st;
      }
      case "wheel": {
        const ring = st.persons ?? FIRST_RING;
        for (const p of ring) if (!PERSONS.includes(p)) err(`${where}: unknown person ${p}`);
        for (const it of st.items) { word(it.w, where); if (!ring.includes(it.person)) err(`${where}: person ${it.person} is not on this wheel`); }
        return st;
      }
      case "place": for (const it of st.items) { word(it.w, where); if (!ZONES.includes(it.zone)) err(`${where}: unknown zone ${it.zone}`); } return st;
      case "timeline": case "sort": {
        const segs = new Set(st.segments.map((x) => x.id));
        for (const it of st.items) {
          word(it.w, where);
          if (!segs.has(it.seg)) err(`${where}: unknown segment ${it.seg}`);
          if (it.ar !== undefined && !ARABIC_LETTER.test(it.ar)) err(`${where}: ${it.ar} is not Arabic`);
        }
        return st;
      }
      case "roots": {
        for (const sd of st.seeds) if (sd.letters.length !== 3) err(`${where}: root ${sd.id} needs three letters`);
        for (const it of st.items) {
          word(it.w, where);
          const sd = st.seeds.find((x) => x.id === it.seed);
          if (!sd) err(`${where}: unknown root ${it.seed}`);
          else if (WORDS[it.w] && !growsFrom(WORDS[it.w].ar, sd.letters)) err(`${where}: ${it.w} does not grow from ${sd.letters.join(" ")}`);
        }
        return st;
      }
      case "ladder":
        for (const it of st.items) { word(it.w, where); word(it.base, where); if (!RUNGS.includes(it.rung)) err(`${where}: unknown rung ${it.rung}`); }
        return st;
      case "petals": {
        if (st.root.length !== 3) err(`${where}: a root needs three letters`);
        for (const it of st.items) {
          word(it.w, where);
          if (!PETAL_IDS.includes(it.petal)) err(`${where}: unknown petal ${it.petal}`);
          if (!growsFrom(it.ar, st.root)) err(`${where}: ${it.ar} does not grow from ${st.root.join(" ")}`);
          // the doer petal's picture is a working figure: a name of Allah never goes on it
          if (it.petal === "doer" && WORDS[it.w]?.units.some((u) => medalOnly.has(u.normalize("NFC")))) err(`${where}: ${it.w} is a name of Allah and cannot sit on the doer petal`);
        }
        return st;
      }
      case "scene": {
        const def = SCENES[st.scene ?? "signs"];
        if (!def) { err(`${where}: unknown scene ${st.scene}`); return st; }
        for (const it of st.items) { word(it.w, where); if (!def.spots[it.spot]) err(`${where}: no spot ${it.spot} in the ${st.scene ?? "signs"} scene`); }
        return st;
      }
      case "grow": {
        // Mould Press: a known word + a pattern mould → the grown verb; both must grow from the item's root
        if (!MOULDS.includes(st.mould)) err(`${where}: unknown mould ${st.mould}`);
        for (const it of st.items) {
          word(it.w, where); word(it.base, where);
          if (it.root?.length !== 3) err(`${where}: ${it.w} needs a three-letter root`);
          else for (const id of [it.base, it.w]) if (WORDS[id] && !growsFrom(WORDS[id].ar, it.root)) err(`${where}: ${id} does not grow from ${it.root.join(" ")}`);
        }
        return st;
      }
      case "path": {
        // E3 Same Verb, New Path: a known verb + a partner word → a new meaning, shown by its own picture
        return { ...st, items: st.items.map((it, k) => {
          word(it.verb, where); word(it.with, where);
          if (!it.ar || !glossOk(it.g)) err(`${where} item ${k + 1}: needs the Arabic pair and English + Urdu meanings`);
          if (!ART[it.art]) err(`${where} item ${k + 1}: no painting prompt ${it.art}`);
          return { ...it, pic: artFor(it.art) || it.pic, why: whyFor(it.art) ?? undefined };
        }) };
      }
      case "snap":
        st.chips.forEach((id) => word(id, where));
        for (const t of st.tasks) for (const id of t.want) if (!st.chips.includes(id)) err(`${where}: wanted piece ${id} is not among the chips`);
        return st;
      default: err(`${where}: unknown step type ${st.type}`); return st;
    }
  };

  // Words a step makes the player see (first sight = taught in that room).
  const stepWords = (st) => {
    if (st.type === "ayah") return st.words.flatMap((t) => t.w);
    if (st.type === "meet" || st.type === "match") return st.words;
    if (st.type === "snap") return st.tasks.flatMap((t) => t.want);
    if (st.type === "story") return st.panels.map((p) => p.w);
    if (st.type === "grow") return st.items.flatMap((it) => [it.base, it.w]);
    if (st.type === "path") return st.items.flatMap((it) => [it.verb, it.with]);
    if (st.type === "passage") return st.ayat.flatMap((a) => a.words.flatMap((w) => w.w));
    return st.items.map((it) => it.w);
  };

  const taughtBefore = new Set();
  const known = new Set();
  const rooms = ROOMS.map((room) => {
    const steps = room.steps.map((st, i) => checkStep(st, `${room.id} step ${i + 1}`)).filter(Boolean);
    if (!glossOk(room.title)) err(`${room.id}: needs English and Urdu titles`);
    const seen = [...new Set(steps.flatMap(stepWords))];
    // Every word a point/wheel/place/match/snap round asks about must be met first (meet step, ayah, or an earlier room).
    const met = new Set(taughtBefore);
    for (const st of steps) {
      if (st.type === "meet") st.words.forEach((id) => met.add(id));
      else if (st.type === "ayah") st.words.forEach((t) => t.w.forEach((id) => met.add(id)));
      else for (const id of stepWords(st)) if (!met.has(id)) err(`${room.id}: ${id} is asked in a ${st.type} round before the player meets it`);
    }
    const teaches = seen.filter((id) => !taughtBefore.has(id));
    const reviews = seen.filter((id) => taughtBefore.has(id));
    teaches.forEach((id) => taughtBefore.add(id));
    // The room's stakes card: how many Qur'an words use something this room teaches for the first time.
    const fresh = new Set(teaches.flatMap((id) => (WORDS[id]?.units ?? []).map(corpusUnit)).filter((u) => u && !known.has(u)));
    const uses = fresh.size ? words.filter((w) => [...w.units].some((u) => fresh.has(u))).length : 0;
    fresh.forEach((u) => known.add(u));
    if (room.art) word(room.art, `${room.id} door`);
    return { id: room.id, wing: room.wing, icon: room.icon, art: room.art, title: room.title, steps, teaches, reviews, stakes: { words: teaches.length, uses }, coverageAfter: +coverageOf(words, known).toFixed(1) };
  });

  const usedWords = new Set(rooms.flatMap((r) => [...r.teaches, ...r.reviews]));
  const pack = {
    v: PACK_VERSION,
    totalQuranWords: words.length,
    words: Object.fromEntries(Object.entries(WORDS).filter(([id]) => usedWords.has(id))
      .map(([id, w]) => [id, { ar: w.ar, g: w.g, more: w.more, why: w.pic ? whyFor(id) : null, pic: withArt(id, w.pic), emoji: w.pic, medal: w.medal }])
      // game-piece paintings ("ui:past" …) ride along as picture-only entries once they exist
      .concat(Object.keys(ART).filter((k) => k.startsWith("ui:") && artFor(k)).map((k) => [k, { ar: "", g: { en: k, ur: k }, pic: artFor(k) }]))),
    rooms,
    coming: COMING,
    // shown in Settings in this order (docs/RIGHTS.md keeps the details)
    credits: {
      quran: "Qur'an text: Tanzil Project (tanzil.net), Uthmani v1.1, Creative Commons Attribution 3.0. Used verbatim; updates at tanzil.net/updates. Full notice in TANZIL-NOTICE.txt.",
      translation: "Translations of the meanings: Abdullah Yusuf Ali, The Holy Qur'an: Text, Translation and Commentary (1934–37), English; Maulana Muhammad Junagarhi, Urdu. Shown unchanged; text via Tanzil Project (tanzil.net/trans).",
      words: "Word counts and roots worked out with the Quranic Arabic Corpus (corpus.quran.com, Kais Dukes, University of Leeds) at build time. Word meanings and groupings written for this game.",
      art: "Word pictures made for this game with an image model (GPT Image 2.5) from our own descriptions, then checked by hand.",
      fonts: "Amiri Quran and Noto Nastaliq Urdu, SIL Open Font License 1.1.",
      status: "Draft meanings and pictures — pending scholar review.",
    },
    notice: tanzilNotice(),
  };
  return { pack, errors };
}
