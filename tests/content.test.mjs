// Phase C of docs/AUDIT_2026-11-23.md: content accuracy. The build checks (scripts/lib/checks.mjs) are run again over
// the shipped files, each check is shown to catch the mistake it exists for, and the entries the audit found wrong are
// pinned so they cannot drift back.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCorpus } from "../scripts/lib/corpus.mjs";
import { buildPack, sameFamily } from "../scripts/lib/pack.mjs";
import {
  packProblems, tileProblems, cardProblems, repeatProblems, closedCard, sharesWord, agrees, readsAsName, isNameCard, isSharedNameCard, pictureCard,
  tileMedal, twinsOf, sameOnScreen,
} from "../scripts/lib/checks.mjs";
import { WORDS } from "../authoring/words.js";
import { AYAT } from "../authoring/ayat.js";
import { splitPack, withSteps, whyWords, whyLoader, WHY_PATH } from "../game/core/content.js";
import { looksSame, pickOptions, withFace, captionKey, LEADING_UR } from "../game/core/options.js";
import { setWhy, whyOf, whyCaption, whenWhy } from "../game/ui/why.js";

const readJson = (name) => JSON.parse(readFileSync(new URL(`../game/content/${name}`, import.meta.url), "utf8"));
const base = readJson("pack.json");
const wingFiles = Object.fromEntries([...new Set(base.rooms.map((r) => r.wing))].map((w) => [w, readJson(`wing-${w}.json`)]));
const whyFile = readJson("why.json");
// the shipped files, joined the way the game joins them
const shipped = { ...base, rooms: base.rooms.map((r) => withSteps(r, wingFiles[r.wing], base.build)) };
const W = shipped.words;

/** The built ayah word at `ref`, word number `n` (1-based), wherever the game plays it. */
function tilesAt(ref, n) {
  const out = [];
  for (const room of shipped.rooms) {
    for (const step of room.steps) {
      const ayat = step.type === "ayah" ? [step] : step.type === "passage" ? step.ayat : [];
      for (const a of ayat) {
        if (a.ref !== ref) continue;
        const i = n - (a.part?.[0] ?? 1);
        if (a.words[i]) out.push({ ...a.words[i], room: room.id });
      }
    }
  }
  assert.ok(out.length, `${ref} word ${n} is played somewhere`);
  return out;
}
const eachTile = (ref, n, check) => tilesAt(ref, n).forEach(check);

// ---- the checks, over what ships ---------------------------------------------------------------------------------

test("content checks: the shipped pack passes every check", () => {
  assert.deepEqual(packProblems({ pack: shipped, WORDS, AYAT }), []);
});

test("content checks: the shipped files are the build of today's authoring files (nothing hand-edited, nothing stale)", async () => {
  const { pack, errors } = buildPack(await loadCorpus());
  assert.deepEqual(errors, []);
  const fresh = JSON.parse(JSON.stringify(splitPack(pack)));
  assert.deepEqual(fresh.base, base, "pack.json: run node scripts/build-pack.mjs");
  assert.deepEqual(fresh.wings, JSON.parse(JSON.stringify(wingFiles)), "wing files: run node scripts/build-pack.mjs");
  assert.deepEqual(fresh.why, whyFile, "why.json: run node scripts/build-pack.mjs");
});

test("content checks: a room that names a missing word, or a pack that no longer matches the authoring file, is reported", () => {
  const room = shipped.rooms[0];
  const broken = { ...shipped, rooms: [{ ...room, teaches: [...room.teaches, "w:not_a_word"], steps: [...room.steps, { type: "match", words: ["w:nowhere"] }] }, ...shipped.rooms.slice(1)] };
  const found = packProblems({ pack: broken, WORDS, AYAT });
  assert.ok(found.some((m) => m.includes("w:not_a_word") && m.includes("not in the pack")));
  assert.ok(found.some((m) => m.includes("w:nowhere") && m.includes("not in the pack")));

  const at = shipped.rooms.findIndex((r) => r.steps.some((s) => s.type === "ayah"));
  const r = shipped.rooms[at];
  const steps = r.steps.map((s) => (s.type === "ayah" ? { ...s, words: s.words.map((w, i) => (i ? w : { ...w, g: { en: "something else", ur: w.g.ur } })) } : s));
  const stale = packProblems({ pack: { ...shipped, rooms: shipped.rooms.map((x, i) => (i === at ? { ...r, steps } : x)) }, WORDS, AYAT });
  assert.ok(stale.some((m) => m.includes("does not match authoring/ayat.js")));

  const twice = packProblems({ pack: { ...shipped, rooms: [room, ...shipped.rooms] }, WORDS, AYAT });
  assert.ok(twice.some((m) => m.includes("two rooms share this id")));
  const noUrdu = packProblems({ pack: { ...shipped, words: { ...W, "w:ism": { ...W["w:ism"], g: { en: "name", ur: " " } } } }, WORDS, AYAT });
  assert.ok(noUrdu.some((m) => m.startsWith("w:ism") && m.includes("English and an Urdu")));
});

// ---- one ayah word against its card ------------------------------------------------------------------------------

const tile = (t, ar, ref) => tileProblems({ t, ar: ar ?? t.ar, words: WORDS, where: "test", ref });

test("an ayah word's picture card must agree with its meaning, unless a note says why", () => {
  // the audit's case: صَالِحًا "good deed" tagged to the Prophet Salih's name scroll
  const wrong = tile({ ar: "صلحا", w: ["w:salih_prophet"], g: { en: "good", ur: "نیک عمل" } }, "صَـٰلِحًا");
  assert.equal(wrong.length, 1);
  assert.match(wrong[0], /shows the picture of w:salih_prophet/);
  assert.deepEqual(tile({ ar: "صلحا", w: ["w:salih"], g: { en: "good", ur: "نیک عمل" } }, "صَـٰلِحًا"), []);
  // إِنْ "not" on the "if" card
  assert.equal(tile({ ar: "ان", w: ["w:in_if"], g: { en: "Not", ur: "نہیں" } }, "إِنْ").length, 1);
  // a real difference of sense is allowed once it is written down
  assert.deepEqual(tile({ ar: "انما", w: ["w:inna", "w:ma"], note: "إِنَّمَا (إِنَّ + مَا) means only", g: { en: "Only", ur: "صرف" } }, "إِنَّمَا"), []);
  assert.match(tile({ ar: "انما", w: ["w:inna", "w:ma"], note: "ok", g: { en: "Only", ur: "صرف" } }, "إِنَّمَا").join("\n"), /a note needs a real reason/);
  // the picture comes from the real word, not from a one-letter prefix
  assert.equal(pictureCard(WORDS, ["w:wa", "w:al", "w:nur"]), "w:nur");
  assert.deepEqual(tile({ ar: "النور", w: ["w:al", "w:nur"], g: { en: "the light", ur: "روشنی" } }, "ٱلنُّورُ"), []);
  // a word that brings its own picture still counts for its card, so the meaning is compared all the same
  const ya = { ar: "يايها", w: ["w:ya", "w:ayyu"], art: "w:ya", g: { en: "O", ur: "اے" } };
  assert.match(tile(ya, "يَـٰٓأَيُّهَا").join("\n"), /is counted on the card w:ayyu/);
  assert.deepEqual(tile({ ...ya, note: "يَا أَيُّهَا is one call" }, "يَـٰٓأَيُّهَا"), []);
  assert.equal(tile({ ar: "x", w: ["w:ism"], g: { en: "name", ur: "" } }, "ٱسْم").some((m) => m.includes("English and an Urdu")), true);
});

test("meanings are compared the way a reader would: same word, another shape", () => {
  assert.ok(sharesWord("of Judgement", "judgement; religion"));
  assert.ok(sharesWord("He said", "say"));
  assert.ok(sharesWord("believed", "believe"));
  assert.ok(sharesWord("nor", "no, not"));
  assert.ok(sharesWord("Him,", "he"));
  assert.ok(sharesWord("days", "day"));
  assert.ok(!sharesWord("for", "Most Forgiving"), "a short word does not match the start of a long one");
  assert.ok(!sharesWord("they", "them, their"), "they (هُمْ) and them (ـهُمْ) are different cards");
  assert.ok(!sharesWord("skilled", "All-Knowing"));
  assert.ok(sharesWord("چہرے", "چہرہ", "ur"));
  assert.ok(!sharesWord("ماہر", "سب کچھ جاننے والا", "ur"));
  assert.ok(agrees({ en: "to a place", ur: "ایک مقام پر" }, WORDS["w:makan"]));
});

test("a Name-of-Allah medallion is only allowed on a word about Allah", () => {
  assert.ok(isNameCard(WORDS["w:alim"]) && isNameCard(WORDS["w:rabb"]) && !isNameCard(WORDS["w:ali"]) && !isNameCard(WORDS["w:ism"]));
  assert.ok(isSharedNameCard(WORDS["w:ali"]) && isSharedNameCard(WORDS["w:karim"]) && isSharedNameCard(WORDS["w:malik_king"]) && !isSharedNameCard(WORDS["w:alim"]));
  // 7:112: a magician is "skilled"; 35:19: a seeing person; 43:4: the Book is "full of wisdom"
  for (const t of [
    { ar: "عليم", w: ["w:alim"], g: { en: "skilled", ur: "ماہر" } },
    { ar: "والبصير", w: ["w:wa", "w:al", "w:basir"], g: { en: "and the seeing", ur: "اور دیکھنے والا" } },
    { ar: "حكيم", w: ["w:hakim"], g: { en: "full of wisdom", ur: "حکمت والا ہے" } },
  ]) assert.ok(tile(t).some((m) => m.includes("Name-of-Allah medallion")), t.g.en);
  assert.deepEqual(tile({ ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب کچھ جاننے والا ہے" } }), []);
  assert.deepEqual(tile({ ar: "غفور", w: ["w:ghafur"], g: { en: "Forgiving", ur: "بخشنے والا" } }), []);
  assert.deepEqual(tile({ ar: "بربهم", w: ["w:bi", "w:rabb", "w:hum"], g: { en: "with their Lord", ur: "اپنے رب کے ساتھ" } }), []);
  assert.ok(readsAsName({ en: "is surely All-Aware" }, WORDS["w:khabir"]) && !readsAsName({ en: "all-aware" }, WORDS["w:khabir"]));
  // not the Name's own wording, but checked by hand
  const mujib = { ar: "المجيبون", w: ["w:al", "w:mujib"], g: { en: "We are in answering", ur: "قبول کرنے والے ہیں ہم" } };
  assert.ok(tile(mujib).some((m) => m.includes("Name-of-Allah medallion")));
  assert.deepEqual(tile({ ...mujib, ofAllah: true }), []);
  // a given word cannot borrow the medallion either
  assert.ok(tile({ ar: "عليم", given: true, pic: "💡", medal: WORDS["w:alim"].medal, g: { en: "skilled", ur: "ماہر" } }).some((m) => m.includes("Name-of-Allah medallion")));
  assert.deepEqual(tile({ ar: "عليم", given: true, pic: "💡", art: "w:alima", g: { en: "skilled", ur: "ماہر" } }), []);
});

test("pointing words, 'who' words and separate pronouns have one right card, read from the Qur'an text", () => {
  const want = {
    "ذَٰلِكَ": "w:dhalika", "كَذَٰلِكَ": "w:dhalika", "كَذَٰلِكِ": "w:dhalika", "ذَٰلِكُمْ": "w:dhalika", "أُو۟لَـٰٓئِكَ": "w:ulaika", "فَأُو۟لَـٰٓئِكَ": "w:ulaika",
    "وَأُو۟لَـٰٓئِكَ": "w:ulaika", "هَـٰذِهِۦ": "w:hadhihi", "هَـٰذَا": "w:hadha", "تِلْكَ": "w:tilka", "هَـٰٓؤُلَآءِ": "w:haulai",
    "ٱلَّذِينَ": "w:alladhina", "وَٱلَّذِينَ": "w:alladhina", "لِلَّذِينَ": "w:alladhina", "ٱلَّذِى": "w:alladhi", "بِٱلَّذِىٓ": "w:alladhi", "ٱلَّتِى": "w:allati",
    "هُوَ": "w:huwa", "وَهُوَ": "w:huwa", "فَهُوَ": "w:huwa", "هِىَ": "w:hiya", "هُمْ": "w:humu", "هُمُ": "w:humu", "وَهُمْ": "w:humu",
    "أَنَا۠": "w:ana", "وَأَنَا۠": "w:ana", "أَنتَ": "w:anta", "أَنتُمْ": "w:antum", "نَحْنُ": "w:nahnu", "سَوْفَ": "w:sawfa", "فَسَوْفَ": "w:sawfa", "وَلَسَوْفَ": "w:sawfa",
  };
  for (const [ar, id] of Object.entries(want)) assert.equal(closedCard(ar), id, ar);
  // look-alikes that are other words
  for (const ar of ["إِنَّا", "أَنَّا", "وَهَمَّ", "لَهُمْ", "إِنْ", "مِنْهُمْ", "ٱلدِّينِ", "ذَا", "هَدَىٰ"]) assert.equal(closedCard(ar), null, ar);
  // two people, many women, two front letters, لَ of stress
  const more = { "هُمَا": "w:huma", "هُنَّ": "w:hunna", "وَهُنَّ": "w:hunna", "أَنتُمَا": "w:antuma", "أَفَأَنتَ": "w:anta", "أَفَهُمُ": "w:humu", "لَهُوَ": "w:huwa", "وَلَهُوَ": "w:huwa", "فَذَٰلِكَ": "w:dhalika" };
  for (const [ar, id] of Object.entries(more)) { assert.equal(closedCard(ar), id, ar); assert.ok(WORDS[id], id); }
  // وَهْنٍ "weakness", وَهَنَ "grew weak", لَهْوٌ "play", أَنتِ (no card yet); لَهُمُ is left to the meaning check
  for (const ar of ["وَهْنٍ", "وَهَنَ", "لَهْوٌ", "لَهْوَ", "أَنتِ", "لَهُمُ", "أَوَلَوْ"]) assert.equal(closedCard(ar), null, ar);
  // every such card is a real card
  for (const id of new Set(Object.values(want))) assert.ok(WORDS[id], id);

  const far = tile({ ar: "ذلك", w: ["w:hadha"], g: { en: "That is", ur: "یہ" } }, "ذَٰلِكَ");
  assert.ok(far.some((m) => m.includes("must name the card w:dhalika")));
  assert.ok(tile({ ar: "وهو", w: ["w:wa", "w:hu"], g: { en: "And He is", ur: "اور وہ" } }, "وَهُوَ").some((m) => m.includes("must name the card w:huwa")));
  assert.ok(tile({ ar: "الذين", w: ["w:alladhi"], g: { en: "those who", ur: "وہ جو" } }, "ٱلَّذِينَ").some((m) => m.includes("w:alladhina")));
  assert.deepEqual(tile({ ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "وہ جو" } }, "ٱلَّذِينَ"), []);
  // a given word is not taught, so it names no card
  assert.deepEqual(tile({ ar: "ذلك", given: true, pic: "👉", g: { en: "that", ur: "وہ" } }, "ذَٰلِكَ"), []);
});

test("the same word twice in one ayah names the same cards", () => {
  const la = (en) => ({ t: { ar: "ولا", w: ["w:wa", "w:la"], g: { en, ur: "اور نہ" } }, ar: "وَلَا" });
  assert.deepEqual(repeatProblems([la("nor (are alike)"), la("nor")], "35:20"), []);
  const mixed = repeatProblems([la("nor"), { t: { ar: "ولا", w: ["w:wa", "w:lam"], g: { en: "nor", ur: "اور نہ" } }, ar: "وَلَا" }], "x");
  assert.equal(mixed.length, 1);
  assert.match(mixed[0], /comes twice with different cards/);
});

test("a picture of its own does not let a word slip past the Name check", () => {
  // the pack and the check read the medallion with one rule: a word's own picture replaces its card's medallion
  assert.equal(tileMedal({ w: ["w:alim"] }, WORDS["w:alim"]), WORDS["w:alim"].medal);
  assert.equal(tileMedal({ w: ["w:alim"], art: "w:alima" }, WORDS["w:alim"]), undefined);
  assert.equal(tileMedal({ w: ["w:alim"], pic: "💡" }, WORDS["w:alim"]), undefined);
  assert.equal(tileMedal({ pic: "☝️", medal: "أَحَد" }, undefined), "أَحَد");
  // a graded word on a Name card with a non-Name meaning is reported, with or without its own picture
  for (const own of [{ art: "w:alima" }, { pic: "💡" }]) {
    const found = tile({ ar: "عليم", w: ["w:alim"], ...own, g: { en: "skilled", ur: "ماہر" } });
    assert.ok(found.some((m) => m.includes("is counted on the Name-of-Allah card")), JSON.stringify(own));
    assert.ok(found.some((m) => m.includes("is counted on the card w:alim")), "the meaning is compared too");
  }
  // every ayah word in the game ships the medallion the check read
  for (const room of shipped.rooms) for (const step of room.steps) for (const a of step.type === "ayah" ? [step] : step.ayat ?? []) for (const t of a.words) {
    if (t.pic?.startsWith("img:") && t.w.length && W[pictureCard(W, t.w)]?.medal && t.medal) assert.equal(t.medal, W[pictureCard(W, t.w)].medal);
  }
});

test("a capital letter alone does not make a meaning a Name of Allah", () => {
  // the first word of a meaning always has a capital
  assert.ok(!readsAsName({ en: "Knowing (a magician)" }, WORDS["w:alim"]));
  assert.ok(tile({ ar: "عليم", w: ["w:alim"], g: { en: "Knowing (a magician)", ur: "جاننے والا" } }).some((m) => m.includes("Name-of-Allah medallion")));
  for (const [en, id] of [["Forgiving", "w:ghafur"], ["Lord of", "w:rabb"], ["Master", "w:malik"], ["And He is the All-Knowing", "w:alim"], ["Allah", "w:allah"], ["with their Lord", "w:rabb"]]) assert.ok(readsAsName({ en }, WORDS[id]), en);
  // the king as a prisoner's "lord" (12:42) and Malik, keeper of the Fire (43:77): never the Name, whatever is written
  const lord = { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord (the king)", ur: "اپنے آقا" } };
  assert.ok(tile(lord, "رَبِّكَ", "12:42").some((m) => m.includes("is about a creature")));
  assert.ok(tile({ ...lord, ofAllah: true }, "رَبِّكَ", "12:42").some((m) => m.includes("is about a creature")));
  assert.ok(tile({ ar: "يملك", w: ["w:ya", "w:malik"], g: { en: "O Malik", ur: "اے مالک" } }, "يَـٰمَـٰلِكُ", "43:77").some((m) => m.includes("is about a creature")));
  assert.deepEqual(tile({ ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تمہارا رب" } }, "رَبِّكَ", "96:1"), []);
  assert.deepEqual(tile({ ar: "ربك", given: true, pic: "👑", g: { en: "your lord (the king)", ur: "اپنے آقا" } }, "رَبِّكَ", "12:42"), []);
});

test("words that are a Name in one ayah and an everyday word in another need a note when they are not the Name", () => {
  const noble = { ar: "كريم", w: ["w:karim"], g: { en: "noble", ur: "عزت والا" } };
  assert.ok(tile(noble).some((m) => m.includes("which is also a Name of Allah")));
  assert.deepEqual(tile({ ...noble, note: "describes the Qur'an" }), []);
  assert.deepEqual(tile({ ar: "الكريم", w: ["w:al", "w:karim"], g: { en: "the Most Generous", ur: "بڑے کرم والا" } }), []);
  assert.ok(tile({ ar: "عليا", w: ["w:ali"], g: { en: "high", ur: "بلند" } }).some((m) => m.includes("which is also a Name of Allah")));
  assert.ok(tile({ ar: "ملك", w: ["w:malik_king"], g: { en: "a king", ur: "ایک بادشاہ" } }).some((m) => m.includes("which is also a Name of Allah")));
  assert.deepEqual(tile({ ar: "ملك", w: ["w:malik_king"], g: { en: "The King", ur: "بادشاہ" } }), []);
  // a medallion written on the word itself (ٱلْحَىُّ, أَحَدٌ) is signed off with ofAllah
  const living = { ar: "الحي", w: ["w:al", "w:hayy"], medal: "الْحَيّ", g: { en: "the Ever-Living,", ur: "ہمیشہ زندہ" } };
  assert.ok(tile(living).some((m) => m.includes("sets its own medallion")));
  assert.deepEqual(tile({ ...living, ofAllah: true }), []);
  assert.deepEqual(tile({ ar: "يلد", given: true, pic: "👶", medal: "plain:يَلِدْ", g: { en: "beget", ur: "کسی کو جنا" } }), [], "plain ink is not a medallion");
  // in the shipped game: the three everyday uses carry their note, and every own medallion is about Allah
  for (const [key, n] of [["56:77", 3], ["43:4", 6], ["19:57", 3]]) assert.ok(AYAT[key][n - 1].note, key);
  for (const toks of Object.values(AYAT)) for (const t of toks) if (t.medal && !/^(scroll|plain):/.test(t.medal)) assert.equal(t.ofAllah, true, t.ar);
});

test("a far word under a near Urdu word is a choice someone signed", () => {
  const far = { ar: "ذلك", w: ["w:dhalika"], g: { en: "That is", ur: "یہ" } };
  assert.ok(tile(far, "ذَٰلِكَ").some((m) => m.includes("is the far word but its Urdu")));
  assert.deepEqual(tile({ ...far, note: "Urdu says it with the near word" }, "ذَٰلِكَ"), []);
  assert.deepEqual(tile({ ...far, g: { en: "That is", ur: "وہ" } }, "ذَٰلِكَ"), []);
  assert.deepEqual(tile({ ...far, g: { en: "that", ur: "اس کے" } }, "ذَٰلِكَ"), [], "اس is neither side");
  assert.ok(tile({ ar: "اولئك", w: ["w:ulaika"], g: { en: "Those", ur: "یہی لوگ" } }, "أُو۟لَـٰٓئِكَ").some((m) => m.includes("is the far word")));
  assert.ok(tile({ ar: "هذا", w: ["w:hadha"], g: { en: "this", ur: "وہ" } }, "هَـٰذَا").some((m) => m.includes("is the near word")));
  for (const [key, n] of [["2:2", 1], ["2:5", 1], ["2:5", 6], ["2:160", 6], ["36:38", 5]]) assert.ok(AYAT[key][n - 1].note, `${key} word ${n}`);
});

// ---- word cards: what the player sees must tell two cards apart --------------------------------------------------

test("no two word cards show the same Arabic or the same caption, in English or Urdu, unless they are marked as twins", () => {
  const cards = {
    "w:a": { ar: "أَ", g: { en: "one", ur: "ایک" } },
    "w:b": { ar: "بَ", g: { en: "two", ur: "ایک" } },
    "w:c": { ar: "جَ", g: { en: "Two", ur: "تین" } },
    "w:d": { ar: "أَ", g: { en: "four", ur: "چار" } },
  };
  const found = cardProblems(cards, Object.keys(cards));
  assert.equal(found.length, 3);
  assert.ok(found.some((m) => m.startsWith("w:a and w:b: the same Urdu")));
  assert.ok(found.some((m) => m.startsWith("w:b and w:c: the same English")), "captions are compared without capitals");
  assert.ok(found.some((m) => m.startsWith("w:a and w:d: the same Arabic")));

  const twins = { "w:a": { ...cards["w:a"], twin: "w:b" }, "w:b": { ...cards["w:b"], twin: "w:a" } };
  assert.deepEqual(cardProblems(twins, Object.keys(twins)), []);
  const oneSided = { "w:a": { ...cards["w:a"], twin: "w:b" }, "w:b": cards["w:b"] };
  assert.ok(cardProblems(oneSided, Object.keys(oneSided)).some((m) => m.includes("does not name w:a back")));
  const stale = { "w:a": { ...cards["w:a"], twin: "w:c" }, "w:c": { ...cards["w:c"], twin: "w:a" } };
  assert.ok(cardProblems(stale, Object.keys(stale)).some((m) => m.includes("no longer looks or reads the same")));
  assert.ok(cardProblems({ "w:a": { ...cards["w:a"], twin: "w:zz" } }, ["w:a"]).some((m) => m.includes("is not a word card")));

  // captions are compared the way the game compares them: a bracket or a leading "the" does not tell two cards apart
  const bracket = {
    "w:a": { ar: "أَ", g: { en: "this", ur: "یہ" } },
    "w:b": { ar: "بَ", g: { en: "this (she-word)", ur: "یہ (مؤنث)" } },
    "w:c": { ar: "جَ", g: { en: "the this", ur: "اور یہ" } },
  };
  const same = cardProblems(bracket, Object.keys(bracket));
  assert.equal(same.length, 6, "three pairs, in English and in Urdu");
  assert.ok(same.every((m) => m.includes("brackets do not count")));
  const marked = Object.fromEntries(Object.entries(bracket).map(([id, w]) => [id, { ...w, twin: Object.keys(bracket).filter((o) => o !== id) }]));
  assert.deepEqual(cardProblems(marked, Object.keys(marked)), [], "a card may name several twins");
  assert.deepEqual(twinsOf({ twin: "w:a" }), ["w:a"]);
  assert.deepEqual(twinsOf({}), []);
  assert.ok(!sameOnScreen(bracket["w:a"], bracket["w:b"]) && sameOnScreen(bracket["w:a"], { ar: "دَ", g: { en: "This", ur: "x" } }));
});

test("shipped word cards: no two read the same to the game unless they are twins on purpose", () => {
  const ids = Object.keys(W).filter((id) => WORDS[id]);
  for (const [lang, lead] of [["en", undefined], ["ur", LEADING_UR]]) {
    const groups = new Map();
    for (const id of ids) { const k = captionKey(W[id].g[lang], lead); groups.set(k, [...(groups.get(k) ?? []), id]); }
    for (const [k, group] of groups) for (const a of group) for (const b of group) if (a < b) assert.ok(twinsOf(WORDS[a]).includes(b) && twinsOf(WORDS[b]).includes(a), `${lang} "${k}": ${a} / ${b}`);
  }
  // reworded, so they can be asked against each other again
  for (const [a, b] of [["w:sa", "w:sawfa"], ["w:in_if", "w:law"], ["w:thumma", "w:fa"], ["w:min", "w:ladun"], ["w:jaa", "w:taal"], ["w:ana", "w:fi"], ["w:la", "w:lam"], ["w:yawm", "w:nahar"], ["w:khafa", "w:khashiya"], ["w:alladhi", "w:man"]]) {
    assert.ok(!looksSame({ g: W[a].g }, { g: W[b].g }), `${a} / ${b}`);
  }
});

test("twins are never offered against each other, in any game that offers choices", () => {
  const pairs = Object.entries(WORDS).flatMap(([id, w]) => twinsOf(w).filter((twin) => id < twin && W[id] && W[twin]).map((twin) => [id, twin]));
  assert.ok(pairs.length >= 10, "the pack has marked twins");
  const all = withFace(W, Object.keys(W));
  for (const [a, b] of pairs) {
    assert.ok(looksSame(W[a], W[b]), `${a} / ${b}: the options rule sees them as the same`);
    for (const seed of [0, 1, 2, 3]) {
      assert.ok(!pickOptions(W, [a, b, ...all.slice(0, 12)], a, 4, seed, { extra: all }).includes(b), `${b} offered against ${a}`);
      assert.ok(!pickOptions(W, [a, b, ...all.slice(0, 12)], b, 4, seed, { extra: all }).includes(a), `${a} offered against ${b}`);
    }
  }
  // a round that lists both would have no fair question
  const room = shipped.rooms[0];
  const withRound = (words) => ({ ...shipped, rooms: [{ ...room, steps: [...room.steps, { type: "match", words }] }, ...shipped.rooms.slice(1)] });
  assert.ok(packProblems({ pack: withRound(["w:jaa", "w:ata"]), WORDS, AYAT }).some((m) => m.includes("its twin") && m.includes("in one round")));
  // twins whose captions differ in a bracket can share a round: the round shows the whole caption
  assert.ok(!packProblems({ pack: withRound(["w:hadha", "w:hadhihi"]), WORDS, AYAT }).some((m) => m.includes("in one round")));
});

test("Urdu: every card whose English differs has its own Urdu caption (the audit's 25 groups)", () => {
  const ur = (id) => W[id].g.ur;
  for (const [a, b] of [
    ["w:rahim", "w:raahim"], ["w:sirat", "w:sabil"], ["w:dhalika", "w:huwa"], ["w:tilka", "w:hiya"], ["w:ulaika", "w:humu"], ["w:ana", "w:fi"],
    ["w:anna_that", "w:an_to"], ["w:su", "w:sayyia"], ["w:ins", "w:insan"], ["w:shahid", "w:shaahid"], ["w:barr", "w:salih"], ["w:manaa", "w:sadda"],
    ["w:basata", "w:madda"], ["w:basata", "w:dharaa"], ["w:khuld", "w:khulud"], ["w:fusuq", "w:fisq"], ["w:katama", "w:akhfa"], ["w:kafara", "w:aba"],
    ["w:nazara", "w:raa"], ["w:haml", "w:wizr"], ["w:mahfuz", "w:mamun"], ["w:shaa", "w:wadda"], ["w:radda", "w:aada"], ["w:dalala", "w:dalal"], ["w:awfa", "w:atamma"],
  ]) assert.notEqual(ur(a), ur(b), `${a} / ${b}`);
  // سَـ is "soon", سَوْفَ is "later": the cards, the ayah words and the Timeline bins all say so
  assert.equal(ur("w:sa"), "عنقریب");
  assert.ok(!ur("w:sawfa").includes("جلد") && !ur("w:sawfa").includes("عنقریب"));
  // the Timeline bin for سَوْفَ (ui/tips.js needs a browser, so its text is read as text)
  const tips = readFileSync(new URL("../game/ui/tips.js", import.meta.url), "utf8");
  assert.match(tips, /later: T\("[^"]*Later[^"]*", "[^"]*بعد[^"]*"\)/);
  eachTile("102:3", 2, (t) => assert.ok(!/عنقریب|جلد/.test(t.g.ur), t.g.ur));
  eachTile("16:55", 6, (t) => { assert.ok(!/soon/.test(t.g.en)); assert.ok(!/عنقریب|جلد/.test(t.g.ur)); });
  // the attached endings say both of their meanings, like ـنَا
  for (const id of ["w:hu", "w:ha", "w:ka", "w:kum", "w:i"]) assert.ok(/[،,]/.test(ur(id)), `${id}: ${ur(id)}`);
  // "مدد کیا ہوا" and its kind are not Urdu
  for (const id of ["w:mansur", "w:mashkur", "w:munzar"]) assert.ok(!/(کیا|دیا) ہوا/.test(ur(id)), `${id}: ${ur(id)}`);
});

// ---- the entries the audit found wrong -----------------------------------------------------------------------------

test("audit: mis-tagged ayah words now name their own card and show its picture", () => {
  const names = (ref, n, ids) => eachTile(ref, n, (t) => assert.deepEqual(t.w, ids, `${ref} word ${n} in ${t.room}`));
  // 20:82 صَالِحًا is "good", not the Prophet Salih: no name scroll
  names("20:82", 7, ["w:salih"]);
  eachTile("20:82", 7, (t) => { assert.equal(t.medal, undefined); assert.equal(t.pic, W["w:salih"].pic); });
  // far words, the plural "those" and the she-word "this"
  names("2:2", 1, ["w:dhalika"]);
  eachTile("2:2", 1, (t) => assert.equal(t.pic, W["w:dhalika"].pic));
  names("2:5", 1, ["w:ulaika"]);
  names("2:5", 6, ["w:wa", "w:ulaika"]);
  eachTile("2:5", 1, (t) => assert.equal(t.pic, W["w:ulaika"].pic));
  names("3:82", 4, ["w:dhalika"]);
  names("3:82", 5, ["w:fa", "w:ulaika"]);
  names("36:38", 5, ["w:dhalika"]);
  names("2:52", 6, ["w:dhalika"]);
  names("2:160", 6, ["w:fa", "w:ulaika"]);
  names("37:110", 1, ["w:ka_like", "w:dhalika"]);
  names("51:30", 2, ["w:ka_like", "w:dhalika"]);
  names("73:19", 2, ["w:hadhihi"]);
  // الَّذِينَ is "those who" (many), not الَّذِي
  for (const [ref, n] of [["103:3", 2], ["2:3", 1], ["8:3", 1], ["16:42", 1], ["16:32", 1], ["3:107", 2], ["3:177", 2], ["10:69", 3], ["6:36", 3], ["7:76", 2], ["2:160", 2]]) names(ref, n, ["w:alladhina"]);
  names("2:4", 1, ["w:wa", "w:alladhina"]);
  // separate pronouns, not the attached endings
  for (const ref of [["67:1", 5], ["27:78", 6], ["2:255", 48]]) names(ref[0], ref[1], ["w:wa", "w:huwa"]);
  names("68:23", 2, ["w:wa", "w:humu"]);
  names("36:21", 6, ["w:wa", "w:humu"]);
  names("2:160", 9, ["w:wa", "w:ana"]);
  // 37:172 لَهُمُ is "surely they" (لَ of stress + هُمْ), not "for them"
  names("37:172", 2, ["w:la_surely", "w:humu"]);
  eachTile("37:172", 2, (t) => assert.equal(t.pieces.length, 2));
  // يَا أَيُّهَا: the هَا is not "her, its", and the picture is the call, not "which?"
  names("109:1", 2, ["w:ya", "w:ayyu"]);
  eachTile("109:1", 2, (t) => assert.equal(t.pic, W["w:ya"].pic));
});

test("audit: إِنْ 'not' and words about creatures no longer use the 'if' card or a Name of Allah", () => {
  // 26:115 إِنْ أَنَا إِلَّا نَذِيرٌ: "not", shown as Qalam's help with the "no" picture
  eachTile("26:115", 1, (t) => { assert.equal(t.given, true); assert.deepEqual(t.w, []); assert.equal(t.pic, W["w:la"].pic); });
  const nameMedals = new Set(Object.entries(WORDS).filter(([, w]) => isNameCard(w)).map(([, w]) => w.medal));
  for (const [ref, n] of [["7:112", 4], ["35:19", 4], ["43:4", 7]]) {
    eachTile(ref, n, (t) => {
      assert.equal(t.given, true, `${ref} is not graded on a Name card`);
      assert.ok(!nameMedals.has(t.medal), `${ref} shows no Name medallion`);
      assert.match(t.pic, /^img:art\//, "it has its own painting");
    });
  }
  // every word that does show a Name medallion in the game is about Allah (the build check, counted here)
  let shown = 0;
  for (const room of shipped.rooms) for (const step of room.steps) for (const a of step.type === "ayah" ? [step] : step.ayat ?? []) for (const t of a.words) if (nameMedals.has(t.medal)) shown++;
  assert.ok(shown > 100, `${shown} ayah words show a Name medallion, all checked by the build`);
});

test("audit: gloss slips in ayah word lines", () => {
  // 35:20: both وَلَا are "nor"
  eachTile("35:20", 3, (t) => assert.equal(t.g.en, "nor"));
  // 80:18 مِنْ أَيِّ شَيْءٍ: "سے" belongs to مِنْ
  eachTile("80:18", 1, (t) => assert.equal(t.g.ur, "سے"));
  eachTile("80:18", 2, (t) => assert.equal(t.g.ur, "کس"));
  eachTile("80:18", 3, (t) => assert.equal(t.g.ur, "چیز"));
  // 88:11: English and Urdu name the same subject
  eachTile("88:11", 2, (t) => { assert.match(t.g.en, /you/); assert.match(t.g.ur, /^تو /); });
  // 71:16: the two وَجَعَلَ read the same
  assert.equal(tilesAt("71:16", 1)[0].g.en.toLowerCase(), tilesAt("71:16", 5)[0].g.en.toLowerCase());
  // a separate هُمْ shows that it is many, so it is not the same caption as هُوَ "وہ"
  eachTile("23:59", 2, (t) => assert.notEqual(t.g.ur, W["w:huwa"].g.ur));
});

test("Size Ladder: both rungs show one picture, so the base is the same word family or the word itself", () => {
  assert.ok(sameFamily("كَبِير", "أَكْبَر") && sameFamily("عَلِيّ", "أَعْلَى") && sameFamily("شَدِيد", "أَشَدّ") && sameFamily("حَقّ", "أَحَقّ"));
  assert.ok(!sameFamily("شَرّ", "أَظْلَم") && !sameFamily("قَلْب", "أَحَبّ") && !sameFamily("قَرِيب", "أَدْنَى"));
  const ladders = shipped.rooms.flatMap((r) => r.steps).filter((s) => s.type === "ladder");
  assert.ok(ladders.length >= 2);
  for (const st of ladders) for (const it of st.items) assert.ok(it.base === it.w || sameFamily(W[it.base].ar, W[it.w].ar), `${it.w} on ${it.base}`);
});

// ---- the boot pack carries only what the first screen needs ------------------------------------------------------

test("picture lines ship in their own file, and the unused emoji field is gone", () => {
  for (const [id, w] of Object.entries(W)) {
    assert.ok(!("why" in w), `${id}: no picture line in pack.json`);
    assert.ok(!("emoji" in w), `${id}: no emoji field`);
  }
  assert.ok(!("why" in base));
  assert.equal(whyFile._build, base.build, "why.json belongs to this pack");
  const lines = whyFile.words;
  assert.ok(Object.keys(lines).length > 700);
  for (const [id, line] of Object.entries(lines)) {
    assert.ok(W[id]?.pic?.startsWith("img:"), `${id}: a line only for a painted word`);
    assert.ok(typeof line.en === "string" && line.en.trim(), `${id}: English picture line`);
  }
  // every painted word card still has its line (nothing was lost in the move)
  for (const [id, w] of Object.entries(W)) if (id.startsWith("w:") && typeof w.pic === "string" && w.pic.startsWith("img:")) assert.ok(lines[id], `${id} has a picture line`);
  // splitting a pack that has no picture lines still gives a well-formed file
  assert.deepEqual(splitPack(shipped).why, { _build: base.build, words: {} });
});

test("why file: refused when it is not one or was built for another pack; fetched once, tried again after a failure", async () => {
  assert.equal(whyWords(whyFile, base.build), whyFile.words);
  assert.equal(whyWords(whyFile, "other"), null);
  assert.equal(whyWords({ _build: base.build }, base.build), null);
  assert.equal(whyWords(null, base.build), null);

  const calls = [];
  const load = whyLoader(async (path) => { calls.push(path); return whyFile; }, base.build);
  assert.equal(await load(), whyFile.words);
  assert.equal(await load(), whyFile.words);
  assert.deepEqual(calls, [WHY_PATH], "one fetch for the whole session");

  // a stale cached copy: asked for once more past the cache
  const seen = [];
  const healed = whyLoader(async (path) => { seen.push(path); return path.includes("?v=") ? whyFile : { ...whyFile, _build: "old" }; }, base.build);
  assert.equal(await healed(), whyFile.words);
  assert.deepEqual(seen, [WHY_PATH, `${WHY_PATH}?v=${base.build}`]);

  // a failed fetch: the game plays on without the lines, and the next call tries again
  let fail = true;
  let tries = 0;
  const flaky = whyLoader(async () => { tries++; if (fail) throw new Error("offline"); return whyFile; }, base.build);
  assert.equal(await flaky(), null);
  fail = false;
  assert.equal(await flaky(), whyFile.words);
  assert.equal(tries, 2);
});

test("picture lines are found by word id or by the pack's own word object, and are simply absent until they arrive", () => {
  setWhy(W, {});
  assert.equal(whyOf("w:ism"), null);
  assert.equal(whyCaption(W["w:ism"]), null);
  setWhy(W, whyFile.words);
  assert.deepEqual(whyOf("w:ism"), whyFile.words["w:ism"]);
  assert.deepEqual(whyOf(W["w:ism"]), whyFile.words["w:ism"]);
  assert.equal(whyOf({ ...W["w:ism"] }), null, "a copy of a word is not the word (ayah tiles carry their own line)");
  assert.equal(whyOf("w:allah"), null, "a calligraphy word has no picture line");
  assert.equal(whyOf(undefined), null);
  const cap = whyCaption("w:ism");
  assert.ok(cap.en && cap.ur);
  setWhy(W, null);
  assert.equal(whyOf("w:ism"), null);
});

test("a card drawn before the picture lines arrive is filled in when they do, once", () => {
  setWhy(W, null);
  const seen = [];
  whenWhy(() => seen.push(whyCaption("w:ism")?.en ?? null));
  assert.deepEqual(seen, [], "nothing to show yet");
  setWhy(W, whyFile.words);
  assert.deepEqual(seen, [whyFile.words["w:ism"].en]);
  setWhy(W, whyFile.words);
  assert.equal(seen.length, 1, "not filled twice");
  whenWhy(() => seen.push("now"));
  assert.equal(seen[1], "now", "lines already here: at once");
  setWhy(W, null);
});
