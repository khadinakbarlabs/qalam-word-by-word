# Plan — Qalam: Word by Word (DRAFT 2026-11-01)

**Goal (approved by Khadin 2026-11-01): learn Qur'anic Arabic and reach about 85% of the Qur'an's words**, with the grammar to read their shapes. A player who can read Arabic script ends able to follow most of what they recite. English and Urdu.
Status: **direction approved 2026-11-01; plan only, nothing built.** Remaining open decisions in §10. Companion docs: [GAME_BRIEF.md](GAME_BRIEF.md) (studio checklist), [CURRICULUM.md](CURRICULUM.md) (book analysis, grammar keys, acts).

---

## 1. Decisions in this draft (change any of them)

| # | Decision | Why |
|---|---|---|
| D1 | One loop: **decode real ayat word by word.** Grammar arrives as tools inside that loop, not as separate lessons or minigames. | Studio rule (one promise, one loop); reading real ayat is the actual goal. |
| D2 | Frequency-first order, same shape as the reference book: little words → nouns → sound verbs → weak verbs → augmented verbs. | The book's order is proven: 41% of words come from ~6 pages of particles and pronouns. |
| D3 | Our own word list, counts and glosses, computed from open corpus data. Book is reference only. | Book is "all rights reserved". |
| D4 | **Qur'anic text is read-only.** Verbatim Uthmani text; never scrambled, misspelled, cut into a puzzle, or animated destructively. Splitting is shown as an overlay *on top of* the intact word. | Respect; Tanzil text licence also forbids changes. |
| D5 | Honest meter: "You recognise about N% of the words", using the strict definition in CURRICULUM §2. | Real, motivating, not inflated. |
| D6 | English and Urdu at launch, both full (UI, glosses, grammar notes, story). Arabic grammar terms shown second, in Arabic. | User request. |
| D7 | No ads, no currency, no background music by default (soft ambience + SFX, toggle). | Respect and audience expectations. |
| D8 | Mandatory qualified reviewer sign-off on every gloss, explanation and ayah selection before release. | Accuracy on sacred text is non-negotiable. |
| D9 | Platform-agnostic web build; Playgama first (already live there with Typo Harbor), YouTube Playables if accepted (see §7 risk). | Unverified whether Playables moderation accepts religious-learning titles. |
| D10 | Reuse the Typo Harbor architecture and pipeline (authoring → build-pack → validator → blind-solver gate → tests). | Proven in this repo. |
| D11 | **100% visual** (Khadin, 2026-11-01): every task, rule and story beat understandable from pictures and motion; EN/UR text is an optional caption. One picture language for meanings and grammar. See [VISUAL_GAMES.md](VISUAL_GAMES.md). | "make it more visualized 100% visualzied". |
| D12 | **Visual games** = 6 engines (Picture Match, Place & Point, Snap Pieces, Root Garden, Person Wheel, Ayah Light-Up) used *inside* each Library room, not a minigame hub. | "add visual games"; keeps the studio's one-loop rule. |
| D14 | **Remembering through repetition** (Khadin, 2026-11-01): every word is a lamp with 0–6 flames on a spaced schedule (same session → 1 → 3 → 7 → 16 → 35 days); reviews are recalls through a different engine each time, mixed into new rooms and a 1-minute Relight warm-up; mix-ups trigger tell-apart drills; no streaks, nothing lost. See [MEMORY_SYSTEM.md](MEMORY_SYSTEM.md), scheduler `game/core/srs.js`. | "make the remembrance easy … with repetition users can remember". |
| D13 | **Nothing from the booklet missed**: every booklet entry and grammar point is transcribed into an internal checklist and machine-matched to the curriculum ([BOOK_COVERAGE.md](BOOK_COVERAGE.md)). Rooms follow the booklet's section types; words, glosses, art and arrangement inside rooms are ours. | "don't miss anything from the book"; the booklet stays all-rights-reserved. |

---

## 2. Player journey (one session)

1. Map → pick the next lit-up room (or "Continue").
2. Room = 8–15 ayat in the Meet → Decode → Mix order (CURRICULUM §4).
3. Each ayah: tap glowing words, decode, lamp lights, reviewed translation appears in the chosen language.
4. Room end: lamp, meter, Notebook entries, one Qalam line. Natural stop.
5. Act end: Reading Room — a fixed famous passage read with almost every word known.

---

## 3. Languages, script and fonts

- **UI languages:** `en`, `ur`. Chosen from `getLanguage()` on Playables (fallback: browser language, then English), overridable in settings. Urdu mode mirrors the whole layout (RTL).
- **Explanation language** setting (Typo Harbor pattern): Urdu, Urdu + English under it, or English only.
- **Fonts (all must allow web embedding):** Qur'anic text in a Uthmani-capable font — candidates *Amiri Quran* (SIL OFL) or KFGQPC Uthmanic Hafs (licence to check). Urdu in Nastaliq — *Noto Nastaliq Urdu* (OFL). Visibly different style for Qur'anic Arabic vs Urdu, since both use Arabic script.
- **Transliteration toggle** per word (for players still weak at reading), off by default.
- **Translation shown after an ayah is decoded:** must be a licensed or public-domain translation, reviewed. *Now: Pickthall (EN) + Jalandhry (UR), see §10.4.* Candidates to evaluate: English — Saheeh International (licence needed), Pickthall 1930 (likely public domain, archaic); Urdu — Fateh Muhammad Jalandhari (licence/status to check), Shah Rafi-ud-Din word-literal (public domain, very literal). Decision open (§10).
- **Urdu cognate marker:** lemma flag `ur_cognate`; Urdu UI only.
- i18n plumbing copies Typo Harbor: `game/i18n.js`, `i18n/en.js`, `i18n/ur.js`, parity test, `_en` hashes for stale detection.

---

## 4. Audio (optional, later)

- No text-to-speech for Qur'anic text, ever (accuracy and respect).
- Word and ayah audio only from a licensed recitation source (permission from a reciter or a clearly licensed dataset). Until then: silent text + SFX. YouTube often runs muted anyway.
- Respect `isAudioEnabled()` / `onAudioEnabledChange`.

---

## 5. Data pipeline (build-time only; nothing scraped at runtime)

```
Tanzil Uthmani text (verbatim, CC BY 3.0, attribution)
   + morphology (lemma, root, pattern, prefix/suffix segments, features)
   → scripts/build-corpus.mjs      token table: surah, ayah, word#, text, lemma, root, segments, features
   → scripts/coverage.mjs          per-lemma counts, per-feature counts, cumulative coverage curve
   → authoring/lemmas/*.js         our ~650 lemma records (CURRICULUM §5), act/chapter assignment
   → scripts/ayah-picker.mjs       for each room, candidate ayat meeting the ≥80% known rule
   → authoring/rooms/*.js          chosen ayat + distractor chips + hint text (human/agent authored)
   → scripts/build-pack.mjs        validated content pack per act (never hand-edit pack JSON)
   → validator + blind-solver gate + reviewer sign-off
```

Validator rules (planned): Qur'anic text in every item byte-matches the Tanzil source; every token in a room is either known by then or introduced in that room; ≤3 new lemmas per ayah; each distractor has a `why_not` line in both languages; every gloss has reviewer + date; no ayah repeated within a room.

**Morphology source — open decision.** The Quranic Arabic Corpus (Leeds) is the standard source and is labelled GNU GPL, but its FAQ also asks for research/non-commercial use. Options: (a) ask the project for written permission; (b) use it only to *compute* counts and draft data, then ship our own hand-checked annotations for the ~1–2k ayat the game uses; (c) find a morphology dataset with a clear permissive licence. Recommended: (b) + (a) together, with a legal check before release.

---

## 6. Rights and the reference book

- *85% of Qur'anic Words* (Understand Al-Qur'an Academy / Edusuite Solutions) is all-rights-reserved. Allowed: learning from its method and order. Not allowed: copying its word lists, groupings, glosses, layout or presentation.
- Word frequencies and grammar rules are facts and standard knowledge; we compute and write our own.
- Optional opportunity: the Academy says the booklet has been translated into ~15 languages and used for apps. Contacting them for endorsement or a licence could add credibility. **Not done; needs Khadin's decision — nothing will be sent without approval.**
- Credits screen: Tanzil attribution + link, morphology source, fonts, translation source, reviewers.

---

## 7. Respect and safety rules (content policy for this game)

1. Qur'anic text is read-only and verbatim (D4). Distractor and practice items that need altered Arabic use the Arabic *word* in isolation, never an edited ayah.
2. No depictions of prophets, companions, angels or Allah; no faces on sacred objects. Library, lamps, garden, books, a pen companion.
3. No ads anywhere in v1; if ever added later, never on a screen showing Qur'anic text.
4. No fail sounds or "wrong" effects on ayat; mistakes are shown on the meaning chips only.
5. Glosses give the most common sense; sensitive or theologically contested words get a reviewer-approved note or are deferred to "ask a teacher".
6. Neutral across schools of thought; no rulings, no sectarian translation choices without review.
7. Story never says the Qur'an is broken, lost or damaged — only that the *reader's* lamp is unlit.
8. Studio rules still apply: 13+ general audience, no personal data, no links, no login, cloud save only.

**Platform risk:** YouTube Playables requires general-audience 13+ content following Community Guidelines; a third-party guide claims "sensitive religious themes" fail moderation (unverified against Google's own pages). Treat Playables acceptance as unknown; plan Playgama + own web build as the base.

---

## 8. Architecture (mirrors english-fixup)

```
quran-words/
  docs/                 PLAN, GAME_BRIEF, CURRICULUM, later ROADMAP, PROGRESS, STYLE_GUIDE, REVIEW_LOG
  data/source/          Tanzil text + morphology (licence files kept beside them)
  authoring/            lemmas/, rooms/, story/, i18n/{ur,en}/
  scripts/              build-corpus, coverage, ayah-picker, build-pack, i18n, build-playgama
  game/
    core/               rules.js (decode check), coverage.js, srs.js, save.js (schema v2: v1 + mid-room checkpoint), taps.js (room length, rest stops)
    ui/                 ayah row, word tile, Root Lens, meaning chips, map, Notebook, Qalam
    i18n.js, sdk.js     Playables lifecycle (firstFrameReady → gameReady, pause/resume, audio, language)
  content/              built packs (generated)
  tests/
```

Save (cloud, well under 3 MiB): `{ v:1, learned:{lemmaId: {s:strength, h:hinted, t:lastSeenDay}}, keys:[grammarKeyIds], rooms:{roomId: state}, settings:{lang, explainLang, translit, arabicSize} }`.
Coverage at runtime = sum of precomputed token counts over the learned set + keys (no corpus shipped to the client beyond the ayat in use).

---

## 9. Roadmap (milestones; each ends with tests + review)

| M | Goal | Done when |
|---|---|---|
| M0 Data spike — **DONE 2026-11-01** | Licences checked; corpus + morphology loaded; real coverage curve; ayah picker prototype; fonts render Uthmani + Nastaliq on phone | [M0_REPORT.md](M0_REPORT.md): 85% = 661 lemmas + 32 pieces/keys; 6,236/6,236 ayat align; Amiri Quran + Noto Nastaliq Urdu chosen |
| M0.5 Visual + book check + memory — **DONE 2026-11-01** | Picture language, 6 engines + Relight prototype (`prototypes/visual-games.html`), spaced-repetition scheduler, 3 booklet editions transcribed + matched | [BOOK_COVERAGE.md](BOOK_COVERAGE.md): 0 of 1,555 rows unmatched; English booklet = 85.2% (confirms its claim); curriculum = 1,010 booklet lemmas + 70 frequent extras = 1,079 lemmas (87.6%); all engines play end to end on a phone; 20 tests |
| M1 Greybox slice — **playable 2026-11-01** | Prologue (Basmala + Al-Fatiha) + Wing 1 rooms "Near & Far", "Who's Who", "Lamp & Box" in EN + UR with engines E1/E2/E3/E5/E6, Relight review, save, SDK lifecycle | Done: full automated playthrough (4 rooms, meter 11.8 → 13 → 17 → 24.5%, 59 word lamps saved), Relight verified, Urdu RTL, 9:32 → 32:9 + 320 px with no overflow, 30 tests, bundle 448 KB. Still open: blind-solver gate, real-device check, reviewer pass on all draft meanings |
| M2 Act 1 — **Wing 1 playable 2026-11-01** | Little Words wing complete (11 rooms incl. new Time Line engine), Reading Room 1, reviewer pass on all glosses | Done: 7 new rooms (No Stamp, Question Cards, Time Line, Connectors, Verb Front Markers, Strong Starters, Word Chest), 19 new ayat, full automated playthrough of all 11 rooms, meter ends at 43.2% (booklet pp. 1–6 ≈ 41%), 30 tests, pack 37.2 KB, bundle 472 KB, no overflow 320 px / 32:9. **Reading Room 1 built 2026-11-05:** Surah Al-Ikhlas after Word Chest — Prepare (قَالَ أَحَد صَمَد وَلَدَ كَانَ كُفُو), the 4 ayat, then E8 Reading Room (whole surah, line by line, "15 / 15 words learnt"); Wing 1 meter 43.3% → 47.1%. Still open: reviewer sign-off, Playgama sandbox build |
| M3 Act 2 — **Wing 2 complete 2026-11-02** | Nouns wing (10 rooms, booklet pp. 7–15) | Done: all 10 rooms + 2 review halls (Names & Ladders, Lost & Found) — every booklet noun and little word on pp. 1–15 is now taught (test enforces it); 378 words, 23 rooms; Scene Hunt has 5 scenes (sky, family tree, body, town, sides); Picture Guide + tooltips; meter 43.2 → 60.7% (booklet pp. 1–15 ≈ 60%); 37 tests. Left for later on purpose: verbs and their families (Wing 3: فَعَلَ آمَنَ جَعَلَ بَعَثَ سِحْر/سَاحِر نَفْع…), dual and feminine-plural pronouns (Person Wheel) |
| M4 Act 3 — **Wing 3 complete 2026-11-04** | Sound verbs + 6 forms + conjugation tools | Done so far: Six Petals (new engine), Doing Words 1–5 (booklet pp. 16–20, every verb head; derived forms with ≥4 uses as cards, rarer ones shown on petals), Person Wheel, Passive Flip (`K:passive`, doer/done sort with painted bins). Review Hall 3 "Family Garden" (pp. 16–17 rare forms + شَيْء, يَا, أَصْلَحَ) and Review Hall 4 "Family Orchard" (pp. 18–20 rare forms + أَبْصَرَ): every word the booklet lists on pp. 1–20 is now taught (test enforces it), except the two-person / many-women endings (Person Wheel 2, next) and weak, augmented and doubled verbs (Wing 4+). Person Wheel 2 (two people, many women, one woman addressed: ـهُمَا ـكُمَا ـهُنَّ ـكُنَّ ـكِ + dual verbs; wheel steps choose their own ring of persons) + كَذَّبَ for 55:13. 11 rooms, 583 words, meter 68.7% — Act 3 target (68.5%) reached. Rule: names of Allah (خَالِق، رَازِق، قَادِر، رَاحِم، جَامِع، رَافِع، غَافِر) are medallions and never sit on the doer petal or a human doer picture (pack check). Next: Wing 4 "Lantern Tower" (weak and doubled roots, booklet pp. 21+). |
| M5 Act 4 — **Wing 4 "Lantern Tower" complete 2026-11-04** | Weak roots | Done so far: Soft Letters 1 (p21 verbs starting with و: وَجَدَ وَعَدَ وَهَبَ وَقَى …), Soft Letters 2 (p22 hollow: قَالَ كَانَ جَاءَ شَاءَ قَامَ …), Soft Letters 3 (p23 ending in a soft letter: رَأَى أَتَى آتَى دَعَا تَلَا …). The root check now lets soft letters change shape or drop out and a doubled letter be written once, so Six Petals shows وَقَى → يَقِي → قِ and قَالَ → يَقُولُ → قُلْ. Names of Allah وَاسِع وَارِث هَاد are medallions; verbs whose doer is usually Allah are painted through objects. Then Doubled Letters (p24: ضَلَّ رَدَّ مَدَّ حَيّ …) and Hamza Verbs (p25: آمَنَ مُؤْمِن سَأَلَ أَخَذَ أَكَلَ …). Every room now ends with a Mastery Check. 39 rooms, 702 words, meter 78.9%. |
| M6 Act 5 — **Wing 5 "Great Dome" started 2026-11-04** | Grown forms II–X | Done so far: Strong Middle 1–2 (pp. 26–27, فَعَّلَ: عَلَّمَ ذَكَّرَ سَبَّحَ بَشَّرَ نَزَّلَ قَدَّرَ نَجَّى …, with the passive ذُكِّرَ) and Together Verbs (p28, فَاعَلَ: جَاهَدَ جَادَلَ نَادَى هَاجَرَ مُنَافِق …, with the passive نُودِيَ). New engine E7 **Mould Press**: a known word goes into the pattern mould (added piece highlighted) and comes out grown; the player picks its meaning and sees the shift (know → teach). Then Make-It Verbs 1–4 (pp. 29–33, أَفْعَلَ: أَرْسَلَ أَخْرَجَ أَسْلَمَ أَنْزَلَ أَنْفَقَ أَقَامَ أَرَادَ أَطَاعَ أَلْقَى أَوْحَى أَحَبَّ …; hollow أَقَامَ يُقِيمُ, weak-end أَلْقَى, doubled أَتَمَّ). New medallions مُجِيب مُحِيط مُحْيِي; messengers مُرْسَل as a scroll. Then Self Verbs 1–2 (p34, تَفَعَّلَ: تَذَكَّرَ تَبَيَّنَ تَفَكَّرَ تَصَدَّقَ تَقَبَّلَ تَوَكَّلَ تَوَلَّى تَوَفَّى تَكَبَّرَ مُتَكَبِّر …; the تَ glows in the Mould Press). Then Each-Other Verbs (p35, تَفَاعَلَ: تَسَاءَلَ تَنَازَعَ تَشَابَهَ تَبَارَكَ تَعَالَى تَعَالَ) and Burst & Colour Verbs (p35, اِنْفَعَلَ: اِنْشَقَّ اِنْطَلَقَ اِنْقَلَبَ; اِفْعَلَّ: أَبْيَض → اِبْيَضَّ, أَسْوَد → اِسْوَدَّ). Take-For-Yourself Verbs 1–2 (p36, اِفْتَعَلَ: اِتَّقَى مُتَّقِي اِتَّبَعَ اِتَّخَذَ اِخْتَلَفَ مُخْتَلِف اِسْتَمَعَ; اِهْتَدَى مُهْتَدِي اِسْتَوَى اِشْتَرَى اِعْتَدَى اِفْتَرَى اِنْتَهَى اِبْتَغَى). Asking Verbs 1–2 (p37, اِسْتَفْعَلَ: اِسْتَغْفَرَ اِسْتَجَابَ اِسْتَقَامَ اِسْتَطَاعَ اِسْتَأْذَنَ اِسْتَعْجَلَ; اِسْتَكْبَرَ اِسْتَهْزَأَ اِسْتَضْعَفَ اِسْتَحْيَا اِسْتَقَرَّ) + هُدًى (85 uses, not on booklet rows). Mould Press now has 9 moulds (II–X). Every booklet unit on pp. 26–37 is taught (test). Verb Partners 1–2 (p38): new game E3 "Same Verb, New Path" (`game/ui/steps/path.js`, step type `path`) — a known verb + its partner word glows, tap the new meaning (ضَرَبَ فِي travel, ضَرَبَ مَثَلًا give an example, قَضَى بَيْنَ judge between, تَابَ إِلَى / عَلَى, ذَهَبَ بِ / عَنْ …); every p38 pair is played (test); new cards عَفَا, بَغَى (+ بَغْي). Verb Tables 1–2 (pp. 39–42, review rooms, no new words): person wheels for every present / past-you / command / don't cell, and sorts for passive (did / was done), do / don't, one / two / many and he / she of فَاعِل and مَفْعُول; a test checks every table cell is played. 58 rooms, 897 words, meter 85.4%. **The en85 booklet is now covered page by page (pp. 1–42).** **Reading Room 2 built 2026-11-05:** Surah Al-Asr after Lost & Found — Prepare (عَصْر خُسْر آمَنَ عَمِلَ صَالِحَات تَوَاصَوْا صَبْر), 103:1–3, E8 passage (14 / 14). Wing 2 now ends 65.6%; final meter 85.5%. **Reading Room 3 built 2026-11-05:** Surah Al-Kafirun after Person Wheel 2 — every word already learnt at that point (no Prepare step); a who-speaks wheel (I / you all) and a past / now timeline from the surah, the 6 ayat, then E8 passage (26 / 26). **Reading Room 4 built 2026-11-05:** Ayat al-Kursi (2:255) after Soft Letters 5 — Prepare (قَيُّوم سِنَة نَوْم يَشْفَعُ أَحَاطَ كُرْسِيّ يَئُودُ), the ayah played in 4 parts and read in 9 phrases cut at its pause marks (new `part: [from, to]` for ayah and passage steps), names of Allah shown as medallions (الْحَيّ الْقَيُّوم الْعَلِيّ الْعَظِيم), finale 50 / 50. **Reading Room 5 built 2026-11-05:** Al-Baqarah 2:1–5 after Verb Tables 2 — every word already learnt (only الٓمٓ added, as a plain-ink card for the separate letters); match + did-it / was-done sort of its grown verbs, the 5 ayat, E8 passage (36 / 36, `whole: "passage"`). **All five wings now end with a Reading Room; the game can be played start to finish.** Next: scholar review, real-device test, PLAN §10 decisions; optional extra Reading Rooms (Al-Hashr 22–24, Al-Mulk 1–5, An-Nas).

**Audit 2026-11-05:** [POLISH_PLAN.md](POLISH_PLAN.md) (guidelines, scores 32/50, 20 findings, 6 phases) and [CERT_EVIDENCE.md](CERT_EVIDENCE.md) (verdict NOT_READY: pause, navigator.language, end-of-content, double taps, loading text/boot error, corner controls).

**Scholar review pack (2026-11-05):** https://claude.ai/artifact/6ystwo4xWZoEGkD729SsjM (private until shared). 1,261 items: 910 word cards (meaning EN/UR, picture + what it shows), 299 ayah gloss sets, 18 verb partners, 27 Reading Room lines, 7 picture rules, plus 19 priority checks first. Each item: ✓ Looks right / ✎ Needs a fix + note, saved in the artifact's shared store (`marks/<item id>` = {status, note, by, at}). Rebuild after content changes: `node scripts/build-pack.mjs && node scripts/review-pack.mjs`, thumbnails (Python, review/art-list.txt → review/thumbs.json), `node scripts/review-page.mjs`, then republish review/review-pack.html to the same URL (marks keep by item id). |
| M7 release | Verb+preposition, final Reading Rooms, credits, cert audit, verb+preposition, final Reading Rooms, credits, cert audit | 85% meter reachable; full reviewer log; release zips |

---

## 10. Open decisions for Khadin

1. ~~Approve the direction~~ — **APPROVED 2026-11-01**: "keep the direction learn quranic arabic and 85% of quranic arabic". One decode loop, library + Qalam story, 5 acts, 85% word target stand.
2. **Platform:** Playgama-first with Playables as a hoped-for second, or wait for Playables confirmation?
3. **Reviewer:** who signs off Arabic glosses and Urdu text (an 'alim / Arabic teacher you trust)?
4. **Translation source** for the full-ayah reveal (EN + UR) — licence or public-domain choice. *2026-11-05: Khadin wants the full translations from recognised scholars (e.g. Mufti Taqi Usmani, Maulana Maududi).* Facts checked: Taqi Usmani (Urdu *Asan Tarjuma*, English *Meanings of the Noble Qur'an*) is not on Tanzil and is in copyright (living author, Maktaba Ma'ariful Qur'an); Maududi (Urdu *Tafhim*, English *Towards Understanding the Qur'an*) is on Tanzil for non-commercial use only and in copyright (d. 1979; publishers Idara Tarjuman-ul-Qur'an / Islamic Foundation UK). Public domain now: Fateh Muhammad Jalandhry (Urdu, d. 1964), Pickthall (English, 1930). **Changed later 2026-11-05 (Khadin: "use the translations of much credible scholars"): English Abdullah Yusuf Ali, Urdu Maulana Muhammad Junagarhi**, both public domain, from Tanzil, shown word for word (encoding tidied only). Earlier the same day: **Decided 2026-11-05: public domain now** — English Pickthall (1930), Urdu Maulana Fateh Muhammad Jalandhry, verbatim from `data/source/translations/`, shown after every ayah step and under each Reading Room ayah (replacing our 27 draft lines), credited by name and in Settings. Swap to Mufti Taqi Usmani (or Maududi) only with the publisher's written permission: the two files and `TRANSLATIONS` in `scripts/lib/pack.mjs` are the only places to change. Word glosses stay our own (these scholars publish no word-by-word). Open: Jalandhry is public domain in Pakistan (life + 50) but in copyright until 2035 in life + 70 countries — check before release outside Pakistan; Pickthall's wording is old-fashioned (thee/thou); some word glosses differ from the translator's wording (e.g. the Most Gracious vs the Beneficent) — for scholar review.
5. **Morphology data route** (§5 a/b/c).
6. **Contact Understand Al-Qur'an Academy** for endorsement/licence — yes / no / later. *More relevant now:* the game follows the booklet's scope closely (D13). Our own words, glosses and art keep us independent, but a licence would also allow naming the booklet and using its exact order.
7. **Title:** "Qalam: Word by Word" is a placeholder; trademark screen pending.
8. **Audience floor:** assume players read Arabic script (current plan) or add an alphabet starter (bigger scope).
