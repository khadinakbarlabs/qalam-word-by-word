# M0 report — data spike (2026-11-01)

Goal of M0 ([PLAN §9](PLAN.md)): check licences, load the Qur'an text + morphology, compute the real coverage curve, prototype the ayah picker, and test fonts on a phone. **Done.** All numbers below come from the scripts in `scripts/` and can be re-run.

```bash
node scripts/build-corpus.mjs   # alignment check → data/build/corpus-check.json
node scripts/coverage.mjs       # coverage curve → data/build/coverage.json, coverage-curve.csv
node scripts/ayah-picker.mjs    # room-by-room ayah supply + Reading Rooms → data/build/ayah-picker.json
node scripts/font-test.mjs      # → prototypes/font-test.html (preview "quran-words", /prototypes/font-test.html)
node --test tests/*.test.mjs    # 10 tests
```

> **Update, same day:** Khadin asked for the game to be **100% visual**, to **add visual games**, and to **cover everything in the booklet**. That request resolves §4 below differently (see [VISUAL_GAMES.md](VISUAL_GAMES.md)): visual games carry the early learning, so the booklet's order works, and real-ayah reading becomes each room's finale.

---

## 1. Sources and licences

| Source | What | Licence / terms | How we use it |
|---|---|---|---|
| Tanzil Uthmani v1.1 (`data/source/tanzil/`) | Qur'an text, 6,236 ayat | CC BY 3.0; verbatim only ("changing it is not allowed"); credit Tanzil + link tanzil.net; keep notice | Shown to players exactly as is. The Basmala at the start of ayah 1 is shown as a header (no letters changed). |
| quran-morphology (`data/source/morphology/`) — fork of Quranic Arabic Corpus v0.4 with root/lemma fixes, Arabic script | lemma, root, POS, prefix/suffix segments, features for every word | GNU GPL (QAC); QAC FAQ also asks for research / non-commercial use | **Build-time only** (counts, coverage, ayah choice). Not shipped. Taken from the GitHub fork because the official QAC download asks for an email address. |

Open (PLAN §10 #5): QAC's FAQ "non-commercial" wording vs GPL. Route (b) is now in effect: morphology stays on the build machine, and whatever the game ships (per-word glosses, splits for the ayat used) will be our own hand-checked data. A written OK from the QAC team is still advisable before release.

## 2. Alignment (can we attach morphology to Tanzil words?)

- Morphology: 77,429 words. Tanzil: 77,881 words. Difference = 112 Basmalas × 4 words (Tanzil v1.1 puts the Basmala in ayah 1 of every surah except 1 and 9) + 4 places where the morphology joins two Tanzil words (e.g. بَعْدَ مَا).
- Letter-level matching needs two spelling normalisations (Tanzil writes hamza and a medial dagger alef on a tatweel; the morphology writes ء and ىٰ).
- **Result: 6,236 / 6,236 ayat align word for word.** (`scripts/lib/corpus.mjs` `alignAyah`, tested.)

## 3. Coverage curve (the meter)

Strict meter (CURRICULUM §2): a word counts only when its lemma, every front piece (و ف ب ل ك ال س أ يا), every person ending (-hum, -kum…) and its **inflection keys** (past, present, command, passive, plural, dual, emphatic -n) are learned.

| Target | Lemmas | + pieces/keys | Total units |
|---|---|---|---|
| 40% | 28 | 20 | 48 |
| 50% | 55 | 24 | 79 |
| 60% | 109 | 27 | 136 |
| 70% | 221 | 29 | 250 |
| 80% | 442 | 32 | 474 |
| **85%** | **661** | **32** | **693** |
| 90% | 1,061 | 34 | 1,095 |

- A plain "know the word" count gives almost the same numbers (85% at 660 lemmas), because the pieces and keys are all learned early anyway.
- The 661 lemmas come from **366 roots** — on average almost 2 words per root, which is what makes the Root Lens worth teaching.
- Matches the plan estimate (600–700 lemmas) and the booklet's scale.

**Design change found:** *derivation* grammar (verb forms II–X, doer/done-to words, action nouns) should **not** be required to count a word. A player who learned آمَنَ as "believed" understands it without knowing "form IV". These keys become **tools** for guessing new words (Inventor stage). How many 85%-set lemmas each tool explains: form IV 68, doer word 41, form II 29, form VIII 15, form III 9, action noun 8 (under-tagged in the data), form X 7, form V 6, done-to word 4.

## 4. Ayah supply — which curriculum shape works for *reading*?

Rooms of 20 units; an ayah is a candidate when it practises the room and ≥ 80% of its words are understood (≥ 50% in Act 1, where untaught words are given pre-glossed).

| Shape | Act 1 | Act 2 | Act 3 | Act 4 | Act 5 | Empty rooms | Fewest candidates in a room |
|---|---|---|---|---|---|---|---|
| Word-type acts (booklet order: little words → nouns → sound verbs → weak → grown forms) | 57 L | 310 L | 87 L | 72 L | 135 L | **1** | **0** |
| Frequency bands (acts end at 40 / 55 / 70 / 80 / 85%) | 28 L | 50 L | 143 L | 221 L | 219 L | **0** | **50** |

Why the booklet order struggles *if every room must end on a real ayah*: little words alone cover ~33%, but nearly every ayah also contains a noun or verb, so a little-words-only room has nothing real to read.

**Resolution (after Khadin's request):** keep the booklet's order. Visual games teach each room's words without needing a full ayah; the ayah finale uses the "given words" rule (untaught words shown pre-glossed) in early rooms, so even little-words rooms end on real ayat. Inflection keys still arrive when first needed.

## 5. Reading Rooms

Readiness of the planned finales after each frequency band (share of words understood):

| Passage | Words | Acts 1→5 | Extra "passage words" still needed after 85% |
|---|---|---|---|
| Al-Fatiha | 29 | .28 .34 .59 .83 .90 | 3: مالِك اسْتَعِينُ مَغْضُوب |
| Al-Ikhlas | 15 | .33 .60 .73 .73 .73 | 3 |
| Al-Asr | 14 | .36 .50 .64 .64 .71 | 3 |
| An-Nas | 20 | .30 .60 .60 .70 .75 | 5 |
| Al-Falaq | 23 | .43 .48 .48 .65 .65 | 8 |
| Al-Kawthar | 10 | .30 .40 .40 .40 .40 | 6 |
| Al-Ma'un | 25 | .32 .48 .56 .64 .72 | 7 |
| Al-Kafirun | 26 | .42 .50 .85 .88 .88 | 1 |
| Al-Qadr | 30 | .30 .40 .47 .57 .70 | 5 |
| Ayat al-Kursi | 50 | .50 .66 .74 .78 .82 | 9 |
| Al-Mulk 1–5 | 60 | .25 .43 .63 .77 .85 | 9 |
| Al-Baqarah 1–5 | 36 | .50 .69 .86 .92 .94 | 2 |
| Al-Hashr 22–24 | 49 | .35 .55 .67 .80 .86 | 7 |

Finding: the short surahs everyone recites are full of **rare** words; the 85% set alone never makes Al-Kawthar or Al-Falaq readable. **Recommendation:** each Reading Room opens with a short "Prepare" step that teaches its own passage words (1–9 each, **67 distinct** across all 13). Al-Fatiha becomes the **prologue**: all its words taught on day one (it is recited in every prayer, so this is the strongest first win).

## 6. Fonts (phone viewport 375 × 812, screenshots checked)

- **Amiri Quran** renders the Tanzil Uthmani text correctly (dagger alefs on tatweel, small high signs, ayah-end ornaments). Chosen for M1. Noto Naskh Arabic kept as fallback.
- **Noto Nastaliq Urdu** renders Urdu glosses and UI well; Urdu mode mirrors the layout cleanly.
- Rules for M1: Qur'anic word line-height ≥ 2.5 (Uthmani marks reach far above/below); Root Lens pieces line-height ≥ 2.4; Urdu text uses Urdu digits (۰–۹, not ٠–٩); keep the ayah-end number joined to its last word so it never wraps alone; self-host the font files in release builds (sizes to measure in M1).

## 7. Follow-ups

1. Book checklist: every booklet entry transcribed (internal reference only) and matched to the corpus so the curriculum provably misses nothing — see [BOOK_COVERAGE.md](BOOK_COVERAGE.md).
2. Visual layer and visual games — see [VISUAL_GAMES.md](VISUAL_GAMES.md).
3. CURRICULUM §2/§3: inflection keys required, derivation keys are tools.
4. Reading Rooms get a Prepare step with passage words; Al-Fatiha is the prologue.
