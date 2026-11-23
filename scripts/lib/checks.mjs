// Content checks that fail the build (scripts/build-pack.mjs) and are run again over the shipped files by
// tests/content.test.mjs. They exist because a wrong tag is silent: an ayah word takes its picture or medallion, and
// its memory credit, from the word card it names, and nothing else compares the two (docs/AUDIT_2026-11-23.md).
// Pure: no files, no DOM. Each check returns a list of plain messages; an empty list means "nothing found".
//
// Authoring fields the checks read (authoring/ayat.js and authoring/words.js; none of them ships in the pack):
//   note     on an ayah word: why its meaning here differs from its card ("إِنَّمَا = only"). It is the reviewer's
//            sign-off for that one word; without it a meaning that shares no word with the card fails the build.
//   ofAllah  on an ayah word that shows a Name-of-Allah medallion but is not glossed with the Name's own wording, and
//            on every ayah word that sets a calligraphy `medal` of its own (ٱلْحَىُّ, أَحَدٌ).
//   twin     on a word card: the other card (or a list of cards) that looks or reads the same to the player: the same
//            Arabic, or the same caption in English or Urdu as the game compares captions (core/options.js
//            captionKey: brackets and a leading "and / the" do not count). Twins are never offered as a wrong answer
//            to each other.
import { captionKey, LEADING_UR } from "../../game/core/options.js";

// Names and attributes of Allah: calligraphy medallion only, never a picture (VISUAL_GAMES §1 respect rules).
export const MEDAL_ONLY = new Set([
  "L:اللَّه", "L:رَحْمٰن", "L:رَحِيم", "L:رَبّ", "L:مالِك", "L:عَلِيم", "L:حَكِيم", "L:سَمِيع", "L:بَصِير", "L:عَزِيز",
  "L:غَفُور", "L:قَدِير", "L:خَبِير", "L:حَلِيم", "L:حَمِيد", "L:تَوّاب", "L:وَكِيل", "L:قَهّار", "L:غَفّار", "L:وَهّاب", "L:لَطِيف",
  "L:خالِق", "L:رازِق", "L:قادِر", "L:راحِم", "L:جامِع", "L:رافِع", "L:غافِر", "L:واسِع", "L:وارِث", "L:هاد", "L:مُجِيب", "L:مُحِيط", "L:مُحْى", "L:صَمَد", "L:قَيُّوم",
].map((u) => u.normalize("NFC")));
// Words that are a Name of Allah in some ayat and an everyday word in others (كَرِيم: Allah the Most Generous, a noble
// Book). Their card says both meanings and shows the same medallion, so an ayah word that does not read as the Name
// must say in a `note` whom it describes.
export const SHARED_NAME = new Set(["L:كَرِيم", "L:عَلِيّ", "L:مَلِك", "L:نَصِير", "L:حَفِيظ", "L:شَكُور"].map((u) => u.normalize("NFC")));
// Ayat where a word that is elsewhere a Name of Allah names a creature: the king as Yusuf's fellow prisoner's "lord"
// (12:41, 12:42, 12:50), and Malik the keeper of the Fire (43:77). No Name medallion and no Name card there.
export const NOT_ALLAH = { "L:رَبّ": ["12:41", "12:42", "12:50"], "L:مالِك": ["43:77"] };

const unitIn = (card, set) => Boolean(card?.units?.some((u) => set.has(u.normalize("NFC"))));
/** Is this word card a Name or attribute of Allah (its medallion is reserved for Him)? */
export const isNameCard = (card) => unitIn(card, MEDAL_ONLY);
/** Is this card a word that is a Name of Allah in some ayat and an everyday word in others? */
export const isSharedNameCard = (card) => unitIn(card, SHARED_NAME);
const notAllahAt = (card, ref) => Boolean(ref && card?.units?.some((u) => NOT_ALLAH[u.normalize("NFC")]?.includes(ref)));
const isCalligraphy = (medal) => typeof medal === "string" && medal !== "" && !/^(scroll|plain):/.test(medal);
/** The medallion an ayah word ships with (scripts/lib/pack.mjs uses this same rule): its own, else its card's, and
 *  none from the card when the word brings a picture of its own. */
export const tileMedal = (t, card) => t.medal ?? (t.pic || t.art ? undefined : card?.medal);

const glossOk = (g) => Boolean(g && typeof g.en === "string" && g.en.trim() && typeof g.ur === "string" && g.ur.trim());
const MIN_NOTE = 8;
const hasNote = (t) => typeof t?.note === "string" && t.note.trim().length >= MIN_NOTE;

// ---- "Do these two meanings share a word?" ------------------------------------------------------------------------
// Small words that carry no meaning of their own in a gloss. Kept short on purpose: for a card like عَلَى "on, upon"
// the little word IS the meaning.
const FILLER = {
  en: new Set(["a", "an", "the", "of"]),
  ur: new Set(["کا", "کی", "کے", "کو", "ہے", "ہیں", "والا", "والے", "والی", "ایک"]),
};
// English forms a stem cannot join: "said" is "say".
const SAME_VERB = [
  ["be", "is", "are", "am", "was", "were", "been"], ["do", "did", "does", "done", "doing"], ["say", "said", "says", "saying"],
  ["come", "came", "comes"], ["give", "gave", "given", "gives"], ["see", "saw", "seen", "sees"], ["go", "went", "gone", "goes", "going"],
  ["take", "took", "taken"], ["make", "made"], ["know", "knew", "known"], ["bring", "brought"], ["send", "sent"],
  ["have", "has", "had"], ["find", "found"], ["hear", "heard"], ["run", "ran"], ["get", "got"],
  // one card, several English shapes: لَا is "no", "not" and "nor"; هُوَ is "he" and, after a joining word, "Him"
  ["no", "not", "nor"], ["he", "him", "his"], ["day", "today"],
];
const verbGroup = new Map(SAME_VERB.flatMap((forms, i) => forms.map((f) => [f, i])));
const SHORT = 3;   // a word this short only matches itself, or itself with a short ending ("day" / "days")
const STEM = 4;    // longer words match on their first letters ("believe" / "believed")
const STEM_UR = 3; // Urdu endings change sooner ("چہرہ" / "چہرے")

/** The words of a gloss, small letters, no marks or brackets signs; fillers dropped unless nothing else is left. */
export function glossWords(text, lang = "en") {
  if (typeof text !== "string") return [];
  const raw = lang === "en"
    ? text.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/[\s-]+/)
    : text.replace(/[^؀-ۿ\s]/g, " ").replace(/[ً-ٰٟ]/g, "").split(/\s+/);
  const words = raw.filter(Boolean);
  const kept = words.filter((w) => !FILLER[lang].has(w));
  return kept.length ? kept : words;
}

function sameWord(a, b, lang) {
  if (a === b) return true;
  if (lang === "en" && verbGroup.has(a) && verbGroup.get(a) === verbGroup.get(b)) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  const stem = lang === "en" ? STEM : STEM_UR;
  if (short.length < SHORT) return false;
  if (short.length < stem) return long.startsWith(short) && long.length - short.length <= 2;
  return long.slice(0, stem) === short.slice(0, stem);
}

/** True when two glosses have a word in common ("of Judgement" / "judgement; religion"). */
export function sharesWord(a, b, lang = "en") {
  const x = glossWords(a, lang);
  const y = glossWords(b, lang);
  return x.some((p) => y.some((q) => sameWord(p, q, lang)));
}

const cardText = (card, lang) => [card.g?.[lang], card.more?.[lang]].filter(Boolean).join(" ; ");
/** Does the meaning of an ayah word agree with a card, in English or in Urdu? */
export const agrees = (g, card) => sharesWord(g?.en, cardText(card, "en"), "en") || sharesWord(g?.ur, cardText(card, "ur"), "ur");

// ---- Words that have exactly one right card -----------------------------------------------------------------------
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const SHADDA = "ّ";
/** Letters of a Tanzil word with the hamza kept (أَنَا is not إِنَّا), no marks, one plain alef for the wasla. */
export const plainLetters = (ar) => ar.replace(MARKS, "").replace(/[ٱآ]/g, "ا").replace(/ى/g, "ي");

const FRONT = "[وفأ]{0,2}"; // وَ / فَ / أَ, alone or two together (أَفَأَنتَ, أَوَهُمْ)
const JOIN = "[كلب]?";
// [pattern over plainLetters, the one card such a word must name, "no" when a doubled letter means another word
//  (هَمَّ, أَنَّا), "must" when the word itself has one and its look-alike has none (هُنَّ "they", وَهْنٍ "weakness")]
const CLOSED = [
  [`^${FRONT}${JOIN}ذلك(م|ما|ن)?$`, "w:dhalika"],
  [`^${FRONT}${JOIN}تلك(م|ما)?$`, "w:tilka"],
  [`^${FRONT}${JOIN}أولئك(م)?$`, "w:ulaika"],
  [`^${FRONT}${JOIN}هذا$`, "w:hadha"],
  [`^${FRONT}${JOIN}هذه$`, "w:hadhihi"],
  [`^${FRONT}${JOIN}هؤلاء$`, "w:haulai"],
  [`^${FRONT}(${JOIN}ال|لل)ذين$`, "w:alladhina"],
  [`^${FRONT}(${JOIN}ال|لل)ذي$`, "w:alladhi"],
  [`^${FRONT}(${JOIN}ال|لل)تي$`, "w:allati"],
  [`^${FRONT}هو$`, "w:huwa"],
  [`^${FRONT}هي$`, "w:hiya"],
  [`^${FRONT}هم$`, "w:humu", "no"],
  [`^${FRONT}هما$`, "w:huma", "no"],
  [`^${FRONT}هن$`, "w:hunna", "must"],
  [`^${FRONT}أنا$`, "w:ana", "no"],
  [`^${FRONT}أنت$`, "w:anta"],
  [`^${FRONT}أنتم$`, "w:antum"],
  [`^${FRONT}أنتما$`, "w:antuma"],
  [`^${FRONT}نحن$`, "w:nahnu"],
  [`^${FRONT}ل?سوف$`, "w:sawfa"],
].map(([pattern, id, shadda]) => ({ re: new RegExp(pattern), id, shadda }));
// لَهُوَ "surely he": told from لَهْوٌ "play" by its vowels. لَهُمُ is left to the meaning check: with the same vowels
// it is "surely they" in 37:172 and "for them" in 10:64, so only the gloss can say which card it is.
const SURELY_HE = /^([وف]َ)?لَهُوَ$/;
const KASRA = "ِ";

/** The card a pointing word, a "who" word or a separate pronoun must name, read from the Qur'an text itself; null for
 *  every other word. (هُمْ "they" but not هَمَّ; أَنَا "I" but not أَنَّا "that we".) */
export function closedCard(ar) {
  const plain = plainLetters(ar);
  if (SURELY_HE.test(ar.replace(/[^ء-يً-ْ]/g, ""))) return "w:huwa";
  const doubled = ar.includes(SHADDA);
  const hit = CLOSED.find((c) => c.re.test(plain) && !(c.shadda === "no" && doubled) && !(c.shadda === "must" && !doubled));
  if (!hit) return null;
  // أَنتِ (to one woman) has no card of its own yet: it is not أَنتَ
  if (hit.id === "w:anta" && ar.trimEnd().replace(/[^ء-يً-ْ]/g, "").endsWith(KASRA)) return null;
  return hit.id;
}

// Pointing words: which side each card points to, and the Urdu word of each side (یہ here, وہ there).
const POINTS = { "w:dhalika": "far", "w:tilka": "far", "w:ulaika": "far", "w:hadha": "near", "w:hadhihi": "near", "w:haulai": "near" };
const NEAR_UR = / (یہ|یہی) /;
const FAR_UR = / (وہ|وہی) /;

// ---- One ayah word ------------------------------------------------------------------------------------------------
const isPrefixCard = (card) => Boolean(card?.units?.length) && card.units.every((u) => u.startsWith("A:"));
/** The card an ayah word takes its picture or medallion from: its first part that is not a one-letter prefix. */
export const pictureCard = (words, ids) => ids?.find((id) => words[id] && !isPrefixCard(words[id])) ?? ids?.[0] ?? null;

// Small words that may stand around a Name in a gloss ("and He is the All-Knowing", "of the Lord of").
const AROUND_NAME = new Set(["and", "so", "then", "but", "or", "is", "he", "who", "most", "all", "ever", "surely", "indeed", "truly", "in", "with", "by", "to", "for", "from", "o", "your", "my", "our", "their", "his", "her", "its", "you", "we", "they", "one", "ones", "best", "alone"]);
/**
 * Does an English gloss read as the Name itself? A capitalised word that is also in the Name card's meaning. The
 * first word of a gloss is capitalised anyway ("Knowing (a magician)"), so it only counts when the rest of the gloss
 * is the card's own wording or small words around it ("Forgiving", "Lord of", "Master of").
 */
export const readsAsName = (g, card) => {
  const own = glossWords(cardText(card, "en"), "en");
  const inCard = (w) => own.some((o) => sameWord(w, o, "en"));
  const text = g?.en ?? "";
  const all = text.match(/[A-Za-z]+/g) ?? [];
  if (all.slice(1).some((w) => /^[A-Z]/.test(w) && inCard(w.toLowerCase()))) return true;
  if (!all.length || !/^[A-Z]/.test(all[0]) || !inCard(all[0].toLowerCase())) return false;
  return glossWords(text, "en").every((w) => inCard(w) || AROUND_NAME.has(w));
};

/**
 * Problems with one ayah word. t: the authored entry ({ ar, w, given, g, pic, art, medal, note, ofAllah });
 * ar: the word as Tanzil writes it; words: the word cards (authoring/words.js); where: "2:2 word 1".
 */
export function tileProblems({ t, ar, words, where, ref }) {
  const out = [];
  if (!glossOk(t.g)) out.push(`${where}: needs an English and an Urdu meaning`);
  const ids = t.w ?? [];
  const known = ids.filter((id) => words[id]);
  const picId = pictureCard(words, known);
  const card = picId ? words[picId] : null;
  const shownMedal = tileMedal(t, card); // what the pack ships (scripts/lib/pack.mjs)
  const asName = Boolean(t.ofAllah) || Boolean(card && glossOk(t.g) && readsAsName(t.g, card));

  // 1. A Name-of-Allah medallion, and the memory credit of a Name card, only on a word that is about Allah
  const medalOf = (test) => Object.values(words).find((w) => test(w) && w.medal && w.medal === shownMedal);
  const strict = medalOf(isNameCard) ?? (!t.given && card && isNameCard(card) ? card : null);
  const creature = Object.values(words).find((w) => notAllahAt(w, ref) && ((w.medal && w.medal === shownMedal) || known.some((id) => words[id] === w)));
  if (creature) {
    out.push(`${where}: in ${ref} "${t.ar}" is about a creature, not Allah: it cannot show the medallion or use the card of ${creature.ar}. Make it a given word with a picture of its own`);
  } else if (strict && !(asName && card && isNameCard(card)) && !(t.ofAllah && t.given)) {
    const what = strict.medal === shownMedal ? `shows the Name-of-Allah medallion ${shownMedal}` : `is counted on the Name-of-Allah card ${strict.ar}`;
    out.push(`${where}: "${t.ar}" ${what} but its meaning "${t.g?.en}" does not read as the Name. If the word is about someone else, name another card or make it a given word; if it is about Allah, write the Name with a capital letter or add ofAllah: true`);
  } else if (!strict && medalOf(isSharedNameCard) && !asName && !hasNote(t)) {
    out.push(`${where}: "${t.ar}" shows the medallion ${shownMedal}, which is also a Name of Allah, but its meaning "${t.g?.en}" does not read as the Name. Add a note saying whom the word describes here, or add ofAllah: true if it is about Allah`);
  } else if (!strict && !medalOf(isSharedNameCard) && isCalligraphy(t.medal) && !t.ofAllah && !hasNote(t)) {
    out.push(`${where}: "${t.ar}" sets its own medallion ${t.medal}. Add ofAllah: true if the word is about Allah, or a note saying why this word is shown as calligraphy`);
  }
  if (t.given) return out;

  // 2. Pointing words, "who" words and separate pronouns have one right card
  const must = closedCard(ar);
  if (must && words[must] && !ids.includes(must) && !hasNote(t)) {
    out.push(`${where}: "${ar}" must name the card ${must} (${words[must].ar}), not ${ids.join(", ") || "nothing"}; add a note if this really is another word`);
  }

  // 3. The picture (or medallion) card must agree with the meaning shown under it
  //    (also when the word brings a picture of its own: the answer still counts for that card)
  if (card && glossOk(t.g) && !agrees(t.g, card) && !hasNote(t)) {
    out.push(`${where}: "${t.ar}" ${t.pic || t.art || t.medal !== undefined ? "is counted on the card" : "shows the picture of"} ${picId} ("${card.g.en}" / "${card.g.ur}") but is glossed "${t.g.en}" / "${t.g.ur}"; name the right card, or add a note saying why the meaning differs here`);
  }
  // 4. A far word (ذٰلِكَ) under a near Urdu word (یہ), or the other way round, is a choice someone must have made
  const side = POINTS[must];
  if (side && ids.includes(must) && glossOk(t.g) && !hasNote(t)) {
    const ur = ` ${glossWords(t.g.ur, "ur").join(" ")} `;
    const [mine, other] = side === "far" ? [FAR_UR, NEAR_UR] : [NEAR_UR, FAR_UR];
    if (other.test(ur) && !mine.test(ur)) out.push(`${where}: "${ar}" is the ${side} word but its Urdu "${t.g.ur}" is the ${side === "far" ? "near" : "far"} one; change the Urdu, or add a note saying the choice is on purpose`);
  }
  if (t.note !== undefined && !hasNote(t)) out.push(`${where}: a note needs a real reason (at least ${MIN_NOTE} letters)`);
  return out;
}

/** Two words of one ayah that are written the same must be the same word (name the same cards), unless noted. */
export function repeatProblems(tiles, where) {
  const out = [];
  const seen = new Map();
  for (const { t, ar } of tiles) {
    if (t.given) continue;
    const first = seen.get(ar);
    if (!first) { seen.set(ar, t); continue; }
    if (JSON.stringify(first.w ?? []) !== JSON.stringify(t.w ?? []) && !hasNote(t) && !hasNote(first)) {
      out.push(`${where}: "${ar}" comes twice with different cards (${(first.w ?? []).join(", ")} / ${(t.w ?? []).join(", ")}); the player would be asked to tell a word from itself`);
    }
  }
  return out;
}

// ---- Word cards ---------------------------------------------------------------------------------------------------
/** The cards a card names as its twins (`twin`: one id or a list). */
export const twinsOf = (card) => (card?.twin === undefined ? [] : [card.twin].flat());
// What the player sees of a card, compared the way the game compares options (core/options.js looksSame): a caption
// that differs only inside brackets, or by a leading "and / the", is the same caption.
const FACES = { Arabic: (w) => w.ar, English: (w) => captionKey(w.g.en), Urdu: (w) => captionKey(w.g.ur, LEADING_UR) };

const shown = (text) => text.trim().toLowerCase().replace(/\s+/g, " ");
/** Do two cards show the very same Arabic or the very same caption text (brackets and all)? Such a pair cannot share
 *  a round: side by side nothing on screen tells them apart. Twins that differ in a bracket ("this" / "this
 *  (she-word)") can, because the round shows the whole caption. */
export const sameOnScreen = (a, b) => a.ar === b.ar || shown(a.g.en) === shown(b.g.en) || shown(a.g.ur) === shown(b.g.ur);

/**
 * Problems among the word cards the game teaches (ids): two cards that show the same Arabic, or the same English or
 * Urdu caption as the game reads captions, must name each other as `twin`; a twin mark must be mutual and still true.
 */
export function cardProblems(words, ids) {
  const out = [];
  const taught = ids.filter((id) => words[id]?.ar);
  const alike = (a, b) => Object.values(FACES).some((face) => face(words[a]) === face(words[b]));
  const twins = (a, b) => twinsOf(words[a]).includes(b) && twinsOf(words[b]).includes(a);
  for (const [name, face] of Object.entries(FACES)) {
    const groups = new Map();
    for (const id of taught) {
      const key = face(words[id]);
      groups.set(key, [...(groups.get(key) ?? []), id]);
    }
    for (const [key, group] of groups) {
      for (const a of group) for (const b of group) {
        if (a < b && !twins(a, b)) {
          out.push(`${a} and ${b}: the same ${name} "${key}" on two cards (brackets do not count). Give them different wording, or mark both with twin if they really read the same`);
        }
      }
    }
  }
  for (const id of taught) {
    for (const twin of twinsOf(words[id])) {
      if (!words[twin]) out.push(`${id}: twin ${twin} is not a word card`);
      else if (!twinsOf(words[twin]).includes(id)) out.push(`${id}: twin ${twin} does not name ${id} back`);
      else if (!alike(id, twin)) out.push(`${id}: twin ${twin} no longer looks or reads the same; remove the mark`);
    }
  }
  return out;
}

// ---- The whole pack -----------------------------------------------------------------------------------------------
const ayahSteps = (step) => (step.type === "ayah" ? [step] : step.type === "passage" ? step.ayat : []);

/** The authored entry behind a built ayah word: the same place in the ayah, the same meaning. */
function authoredTile(AYAT, ayah, i) {
  const at = (ayah.part?.[0] ?? 1) - 1 + i;
  const tile = ayah.words[i];
  const keys = Object.keys(AYAT).filter((k) => k === ayah.ref || k.startsWith(`${ayah.ref}/`));
  for (const k of keys) {
    const t = AYAT[k][at];
    if (t && t.g?.en === tile.g?.en && t.g?.ur === tile.g?.ur && JSON.stringify(t.w ?? []) === JSON.stringify(tile.w ?? [])) return t;
  }
  return null;
}

/** Every word id a step names, with what it is used for. */
function stepIds(step) {
  switch (step.type) {
    case "meet": case "match": return step.words;
    case "story": return step.panels.map((p) => p.w);
    case "snap": return [...step.chips, ...step.tasks.flatMap((t) => t.want)];
    case "ladder": case "grow": return step.items.flatMap((it) => [it.w, it.base]);
    case "path": return step.items.flatMap((it) => [it.verb, it.with]);
    case "ayah": case "passage": return ayahSteps(step).flatMap((a) => a.words.flatMap((w) => w.w ?? []));
    default: return (step.items ?? []).map((it) => it.w);
  }
}

/**
 * Every check, over a full pack (rooms with their steps). pack: as built by scripts/lib/pack.mjs or joined again from
 * the shipped files; WORDS / AYAT: the authoring files (for note, ofAllah, twin, units).
 */
export function packProblems({ pack, WORDS, AYAT }) {
  const out = [];
  const has = (id) => Boolean(pack.words[id]);

  // every card the game shows has both languages
  for (const [id, w] of Object.entries(pack.words)) {
    if (!glossOk(w.g)) out.push(`${id}: needs an English and an Urdu meaning`);
    if (w.more !== undefined && w.more !== null && !glossOk(w.more)) out.push(`${id}: "more" needs English and Urdu`);
  }
  out.push(...cardProblems(WORDS, Object.keys(pack.words).filter((id) => WORDS[id])));

  const roomIds = new Set();
  for (const room of pack.rooms) {
    if (roomIds.has(room.id)) out.push(`${room.id}: two rooms share this id`);
    roomIds.add(room.id);
    if (!glossOk(room.title)) out.push(`${room.id}: needs English and Urdu titles`);
    if (room.art && !has(room.art)) out.push(`${room.id}: door picture ${room.art} is not in the pack`);
    for (const id of [...room.teaches, ...room.reviews]) if (!has(id)) out.push(`${room.id}: word ${id} is not in the pack`);

    room.steps.forEach((step, n) => {
      const where = `${room.id} step ${n + 1}`;
      for (const id of stepIds(step)) if (!has(id)) out.push(`${where}: word ${id} is not in the pack`);
      // one round never lists two twins that show the very same word or caption: it could not ask about either fairly
      if (step.type === "match" || step.type === "snap") {
        const listed = step.type === "match" ? step.words : step.chips;
        for (const id of listed) for (const twin of twinsOf(WORDS[id])) if (id < twin && listed.includes(twin) && WORDS[twin] && sameOnScreen(WORDS[id], WORDS[twin])) out.push(`${where}: ${id} and its twin ${twin} are in one round`);
      }
      if (step.type === "path") step.items.forEach((it, k) => { if (!glossOk(it.g)) out.push(`${where} item ${k + 1}: needs English and Urdu meanings`); });
      for (const ayah of ayahSteps(step)) {
        const tiles = ayah.words.map((tile, i) => ({ tile, i, ar: tile.ar, t: authoredTile(AYAT, ayah, i) }));
        for (const { tile, i, t } of tiles) {
          const at = `${ayah.ref} word ${(ayah.part?.[0] ?? 1) + i} (${room.id})`;
          if (!t) { out.push(`${at}: the pack does not match authoring/ayat.js; rebuild it (node scripts/build-pack.mjs)`); continue; }
          out.push(...tileProblems({ t, ar: tile.ar, words: WORDS, where: at, ref: ayah.ref }));
          if (tile.medal !== tileMedal(t, WORDS[pictureCard(WORDS, (t.w ?? []).filter((id) => WORDS[id]))])) out.push(`${at}: the pack ships another medallion than the check reads; rebuild it (node scripts/build-pack.mjs)`);
          for (const pc of tile.pieces ?? []) if (!glossOk(pc.g)) out.push(`${at}: every piece needs both meanings`);
        }
        out.push(...repeatProblems(tiles.filter((x) => x.t), `${ayah.ref} (${room.id})`));
      }
    });
  }
  return [...new Set(out)];
}
