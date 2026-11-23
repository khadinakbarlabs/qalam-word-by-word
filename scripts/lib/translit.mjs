// "How to say it": a simple Latin spelling of a vowelled Arabic word, made at build time (scripts/lib/pack.mjs) for
// the optional "Show how to say it" setting. Pure and rule-based: the same word always gives the same spelling.
// It reads the marks that are written, so it works on the word cards (authoring/words.js) and on the Qur'an text as
// Tanzil writes it (alif wasla ٱ, dagger alif ٰ, the small silent-letter circle, the small waw and ya after هُ / هِ).
//
// What it does:   short vowels a i u · long vowels ā ī ū · tanwin an in un · a doubled letter for a shadda
//                 the article: al-ḥamdu, and with a sun letter ar-raḥmāni · a silent wasla after a prefix: bil-ḥaqqi
// What it cannot: the letter names that open some surahs (الٓمٓ). Those take a hand-written `say` in authoring, and
//                 the build fails on such a word with no `say`.
// The result is a reading aid, not a tajwid guide: stops, nasal sounds and merged letters between words are not shown.
// The owner should read the generated list once: node scripts/say-list.mjs prints every word with its spelling.

const FATHA = "َ", DAMMA = "ُ", KASRA = "ِ", FATHATAN = "ً", DAMMATAN = "ٌ", KASRATAN = "ٍ";
const SHADDA = "ّ", SUKUN = "ْ", MADDA = "ٓ", HAMZA_ABOVE = "ٔ", DAGGER = "ٰ";
const SILENT = "۟", SILENT_ON = "۠", SMALL_WAW = "ۥ", SMALL_YA = "ۦ";
const TATWEEL = "ـ", WASLA = "ٱ", ALIF = "ا";
const MARK = /[ً-ٰٕۖ-ۭ]/;

const CONSONANT = {
  "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "ḥ", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
  "ص": "ṣ", "ض": "ḍ", "ط": "ṭ", "ظ": "ẓ", "ع": "ʿ", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y", "ى": "y",
};
const HAMZA = new Set(["ء", "أ", "إ", "ؤ", "ئ"]);
const VOWEL = { [FATHA]: "a", [DAMMA]: "u", [KASRA]: "i", [FATHATAN]: "an", [DAMMATAN]: "un", [KASRATAN]: "in" };
const LONG = { a: "ā", i: "ī", u: "ū" };

/** The word as letters, each with the marks written on it. */
function letters(word) {
  const out = [];
  for (const ch of word.normalize("NFC")) {
    if (MARK.test(ch)) { if (out.length) out.at(-1).marks += ch; continue; }
    if (/\s/.test(ch)) continue;
    out.push({ base: ch, marks: "" });
  }
  return out;
}

const has = (l, mark) => Boolean(l) && l.marks.includes(mark);
const vowelOf = (l) => [...(l?.marks ?? "")].map((m) => VOWEL[m]).find(Boolean) ?? "";
const bare = (l) => !vowelOf(l) && !has(l, SHADDA) && !has(l, SUKUN);
const silent = (l) => has(l, SILENT) || has(l, SILENT_ON);

// nouns that begin with a joining alif (they take i whatever their case ending), bare letters after the alif,
// alone or with an attached pronoun
const WASLA_NOUNS = ["سم", "بن", "بنة", "بنت", "مرؤ", "مرأ", "مرئ", "مرأة", "ثنان", "ثنين", "ثنتان", "ثنتين"];
const PRONOUN_ENDS = ["", "ه", "ها", "هم", "هما", "هن", "ك", "كم", "كما", "كن", "ي", "نا"];
const WASLA_NOUN_SET = new Set(WASLA_NOUNS.flatMap((n) => PRONOUN_ENDS.map((p) => n + p)));

/** Does a word that starts with a joining alif (at index i) start with u? Only a verb whose stem vowel is u. */
function helpingU(ls, i) {
  if (!vowelOf(ls[i + 2]).startsWith("u")) return false;
  const rest = ls.slice(i + 1).filter((l) => !silent(l) && l.base !== TATWEEL);
  if (rest.length <= 2) return false; // the third letter is the last one: its vowel is a case ending
  return !WASLA_NOUN_SET.has(rest.map((l) => l.base).join(""));
}

/** A Latin spelling of one vowelled Arabic word ("" when the word has no Arabic letters). */
export function transliterate(word) {
  const ls = letters(String(word ?? ""));
  let out = "";
  // the last short vowel becomes long (a → ā); with no vowel written before a dagger alif, the long ā is added
  const lengthen = (to) => {
    const last = out.at(-1);
    if (Object.values(LONG).includes(last)) return;
    if (LONG[last] && (!to || LONG[last] === to)) out = out.slice(0, -1) + LONG[last];
    else if (!to || to === "ā") out += "ā";
  };
  const atStart = () => out === "" || out.endsWith("-");
  // the marks that stretch the vowel just written: dagger alif (ā), small waw (ū), small ya (ī)
  const stretch = (l) => {
    if (has(l, DAGGER)) lengthen("ā");
    if (has(l, SMALL_WAW)) lengthen("ū");
    if (has(l, SMALL_YA)) lengthen("ī");
  };
  let merge = false; // the next letter swallowed the article's lam (a sun letter): ar-r…

  // the article after a wasla or a first alif: returns how many letters it used up (0 = this is not the article)
  const article = (i, lead) => {
    const lam = ls[i + 1];
    if (lam?.base !== "ل") return 0;
    if (has(lam, SHADDA)) { out += lead; return 1; } // ٱلَّذِى: the lam itself is doubled
    if (vowelOf(lam)) return 0;
    const next = ls[i + 2];
    if (has(next, SHADDA)) { out += lead; merge = true; return 2; } // sun letter: the lam is not said
    out += `${lead}l${next ? "-" : lead ? "-" : ""}`;
    return 2;
  };

  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    const prev = ls[i - 1];
    if (silent(l)) continue;
    if (l.base === TATWEEL) {
      if (has(l, HAMZA_ABOVE)) { out += `${atStart() ? "" : "ʾ"}${vowelOf(l)}`; stretch(l); }
      else if (has(l, DAGGER)) lengthen("ā");
      else if (i === 0) out += `-${vowelOf(l)}`; // a piece that joins the end of a word: ـنَا, ـِي
      continue;
    }
    if (l.base === WASLA || (l.base === ALIF && i === 0)) {
      const first = i === 0;
      const used = article(i, first ? "a" : "");
      if (used) { i += used - 1; continue; }
      if (!first) continue; // a wasla after a prefix is not said
      // a helping vowel to start the word: u when the verb's stem vowel is u (ٱعْبُدُوا), else i (ٱهْدِنَا). The third
      // letter's vowel is a stem vowel only when letters follow it: on the last letter it is a case ending (ٱسْمُ = ismu),
      // and the few nouns that begin this way always take i (ٱسْمُهُ = ismuhū, ٱبْنُ = ibnu)
      out += vowelOf(l) || (helpingU(ls, i) ? "u" : "i");
      continue;
    }
    if (l.base === ALIF) {
      if (vowelOf(l)) { out += vowelOf(l); continue; }
      if (out.endsWith("a") || has(l, DAGGER)) lengthen("ā"); // else: a seat (after tanwin) or the plural's silent alif
      continue;
    }
    // آ: a long ā after a fatha (ٱلضَّآلِّينَ: alif with the long-vowel sign), else a hamza with a long ā (آمَنَ)
    if (l.base === "آ") {
      if (out.endsWith("a")) lengthen("ā");
      else out += `${atStart() ? "" : "ʾ"}ā`;
      continue;
    }
    if (HAMZA.has(l.base)) {
      out += `${atStart() ? "" : "ʾ"}${vowelOf(l)}`;
      stretch(l);
      continue;
    }
    if (l.base === "ة") { out += vowelOf(l) ? `t${vowelOf(l)}` : "h"; continue; }
    // the long vowels: a waw after u, a ya after i, an alif-shaped ya after a
    if ((l.base === "و" || l.base === "ي" || l.base === "ى") && bare(l)) {
      if (has(l, DAGGER)) { lengthen("ā"); continue; } // صَلَوٰة, عَلَىٰ
      if (l.base === "و" && out.endsWith("u")) { lengthen("ū"); continue; }
      if (l.base !== "و" && out.endsWith("i")) { lengthen("ī"); continue; }
      if (l.base === "ى") { if (out.endsWith("a")) lengthen("ā"); continue; } // هُدًى: only a seat
      if (out.endsWith("ū") || out.endsWith("ī")) continue;
    }
    const c = CONSONANT[l.base];
    if (!c) continue;
    if (merge) { out += c === "l" ? "ll" : `${c}-${c}`; merge = false; }
    else out += has(l, SHADDA) && i > 0 ? c + c : c;
    out += vowelOf(l);
    stretch(l);
    // the name Allah is written with no long-vowel mark in the Qur'an text (ٱللَّهِ, لِلَّهِ) but is said allāh
    if (l.base === "ل" && has(l, SHADDA) && vowelOf(l) === "a" && prev?.base === "ل" && ls[i + 1]?.base === "ه") lengthen("ā");
  }
  return out;
}

/** A word the rules cannot spell: the letter names that open a surah (الٓمٓ, طه). They carry the long-vowel sign on
 *  a consonant, or come out with no vowel at all. Such a word needs a hand-written `say` in authoring. */
export function needsSay(ar) {
  const text = String(ar ?? "");
  if (!/[\u0621-\u064A\u0671]/.test(text)) return false; // no Arabic letters: nothing to say
  // a consonant whose only mark is the long-vowel sign is a letter NAME (لٓ = "lām"), not a letter of a word
  if (letters(text).some((l) => l.marks === MADDA && CONSONANT[l.base] && !"ويى".includes(l.base))) return true;
  return !/[aiuāīū]/.test(transliterate(text));
}

/** The spelling a word ships with: its hand-written `say` when authoring gives one, else the rule-based one. */
export const sayOf = (ar, override) => (typeof override === "string" && override.trim() ? override.trim() : transliterate(ar));
