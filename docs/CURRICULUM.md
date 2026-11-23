# Curriculum — Qalam: Word by Word (DRAFT 2026-11-01)

How the game reaches "you recognise ~85% of the words in the Qur'an" with the grammar needed to read them.
Status: **plan only**. Nothing is built. All counts below marked *(book)* come from the reference booklet and are for planning only; the game will ship its own numbers, computed from corpus data (see [PLAN.md §5](PLAN.md)).

---

## 1. Reference book analysis

**Book:** *85% of Qur'anic Words — classified word lists for ease of memorization*, compiled by Dr. Abdulazeez Abdulraheem, Understand Al-Qur'an Academy, Oct 2018 (revised version of *80% of Qur'anic Words*). 53-page pocket booklet, scanned images (no text layer).
**Copyright:** "All rights reserved with Edusuite Solutions Private Limited", no reproduction in any form. → We use it as a **scope and sequence reference only**. We do not copy its lists, groupings, glosses, page layout, or counts into the game. See [PLAN.md §6](PLAN.md).

### What the book does (method)
1. **Frequency first.** Words are chosen by how often they occur. Total claimed: 65,912 of ~77,430 words = 85.1% *(book)*.
2. **Little words first.** Pages 1–6 (pronouns, demonstratives, relatives, question words, prepositions, negation, *inna*-type particles, verb prefixes) alone = 41.1% of all words *(book)*. Biggest payoff, smallest list.
3. **Nouns by topic** (pp. 7–15): attributes of Allah, superlatives, prophets & signs, the Last Day, deen & faith, deeds & blessings, relatives & body, world & people, misc. Coverage rises to ~60% *(book)*.
4. **Verbs by pattern, not by topic** (pp. 16–37). For every verb it gives 6 forms in one row: past · present · imperative · active participle · passive participle · verbal noun. Grouped by:
   - Sound trilateral, by vowel group: *fataha/yaftahu*, *nasara/yansuru*, *daraba/yadribu*, *sami'a/yasma'u* → ~67%
   - Weak roots: *mithal* (first letter w/y), *ajwaf* (middle weak), *naqis* (last weak), *muda'af* (doubled), *mahmuz* (hamza) → ~77%
   - Augmented forms (*mazeed*): II *fa''ala*, III *faa'ala*, IV *af'ala*, V *tafa''ala*, VI *tafaa'ala*, VII *infa'ala*, VIII *ifta'ala*, IX *if'alla*, X *istaf'ala* → 85.1%
   - Each group ends with its passive (*majhool*) sample.
5. **Verb + preposition** meaning shifts (p. 38): *daraba fi / daraba li / daraba 'ala / daraba mathalan*, *taba ila / taba 'ala*, *qada / qada bayna / qada 'ala*, etc.
6. **Conjugation tables** (pp. 39–42): masc. and fem. past, present, imperative, prohibition, active/passive participle (sg/dual/pl), verbal noun.
7. **Notation:** gender (mg/fg), broken plural (+), dual (dl); a word without a final vowel mark is a noun whose ending changes with context; comma = similar meanings, semicolon = different meanings.

### What the book assumes (and the game must not)
- Reader can already read Arabic script. → Game: same assumption for v1, plus a per-word transliteration toggle (see PLAN §3).
- Reader will memorise lists and rebuild verb tables alone. → Game: never shows a bare list. Every word is met inside a real ayah, then reviewed with spacing.
- Reader understands grammar terms (*mudari'*, *ism fa'il*). → Game: plain names first ("doer word", "now/later word"), Arabic term shown second.

### What the game adds
- **Real reading every session.** Each chapter ends on real ayat chosen so almost every word is already known (see PLAN §5 "ayah picker").
- **Root + pattern as a tool**, not a table: tap a word → see its 3 root letters, its mould, and its attachments.
- **Honest live coverage meter** computed from our own data.
- **Urdu head start:** many Qur'anic words are everyday Urdu (*'ilm, kitab, rahmat, dunya, qalb, sabr*). Urdu-mode players see a "you already know this" marker on cognates — a fast, real early win.

---

## 2. Coverage definition (what "85%" means in this game)

- **Token** = one written word in the standard Uthmani text (whitespace-separated, ~77k).
- A token counts as **understood** when the player has learned (a) its main lemma, and (b) every attached piece on it (prefix like *wa-, fa-, bi-, li-, al-*; pronoun suffix like *-hum, -kum, -na*) and (c) the verb-form grammar needed to read it (e.g. present-tense *ya-…-una*).
- **Coverage %** = understood tokens ÷ all tokens, computed at build time per lemma/feature and summed live from the player's learned set.
- This is **stricter than a pure word-list count**, so our curve will reach 85% later in the curriculum than the book's. The final lemma count is whatever our curve needs; planning estimate **600–700 lemmas + ~40 grammar keys**.
- Player-facing wording: "You recognise about **N%** of the words in the Qur'an." Never "you understand N% of the Qur'an".

---

## 3. Grammar keys (unlock as tools inside the one loop)

Each key is a small, named rule the Root Lens can show. Plain name first, Arabic term second.

| # | Key (player name) | Arabic term | Act |
|---|---|---|---|
| G1 | "the" | ال | 1 |
| G2 | and / so / then | وَ فَ ثُمَّ | 1 |
| G3 | in/with, for, like (front pieces) | بِ لِ كَ | 1 |
| G4 | separate person words (he, they, you…) | ضمائر منفصلة | 1 |
| G5 | attached person endings (-his, -their, -your…) | ضمائر متصلة | 1 |
| G6 | this / that / these | أسماء الإشارة | 1 |
| G7 | who / which (*alladhi*) | الأسماء الموصولة | 1 |
| G8 | question words | أدوات الاستفهام | 1 |
| G9 | place & time words (above, before, after) | ظروف | 1 |
| G10 | No by time: *la, lam, lan, ma, laysa* | أدوات النفي | 1 |
| G11 | *inna* and its family (indeed, but, perhaps, as if) | إنّ وأخواتها | 1 |
| G12 | front markers for verbs: *qad, sa-, sawfa, la-* | — | 1 |
| G13 | he-word / she-word (ـة) | مذكر / مؤنث | 2 |
| G14 | one / two / many (-una/-ina, -at) | مفرد / مثنى / جمع سالم | 2 |
| G15 | inside-change plurals (*kitab → kutub*) | جمع التكسير | 2 |
| G16 | "X of Y" chains (*rabb al-'alamin*) | إضافة | 2 |
| G17 | describing words agree | صفة وموصوف | 2 |
| G18 | "-er / -est" mould (*akbar*) | اسم التفضيل | 2 |
| G19 | endings -u/-a/-i rarely change meaning (reading tip) | إعراب (awareness) | 2 |
| G20 | **root = 3 letters, mould = shape** | جذر و وزن | 3 |
| G21 | done-words (past) table | الماضي | 3 |
| G22 | doing/will-do words (present) table | المضارع | 3 |
| G23 | Do! / Don't! | الأمر / النهي | 3 |
| G24 | doer word (*fa'il*) | اسم الفاعل | 3 |
| G25 | done-to word (*maf'ul*) | اسم المفعول | 3 |
| G26 | action name (*masdar*) | المصدر | 3 |
| G27 | "was done" (passive) | المجهول | 3 |
| G28 | lam/lan/la change the verb ending (reading tip) | جزم / نصب (awareness) | 3 |
| G29 | first letter w/y drops | المثال | 4 |
| G30 | middle letter turns into a / u / i | الأجوف | 4 |
| G31 | last letter turns into a / i / y | الناقص | 4 |
| G32 | doubled letters | المضاعف | 4 |
| G33 | hamza roots | المهموز | 4 |
| G34 | mould II: doubled middle (do strongly / make do) | فعّل | 5 |
| G35 | mould III: with someone (*qatala → qaatala*) | فاعل | 5 |
| G36 | mould IV: make it happen (*a-*) | أفعل | 5 |
| G37 | moulds V & VI: to oneself / each other | تفعّل، تفاعل | 5 |
| G38 | moulds VII & VIII: let it happen / for oneself | انفعل، افتعل | 5 |
| G39 | mould X: seek / ask for (*istaghfara*) | استفعل | 5 |
| G40 | verb + preposition changes meaning | صلة الفعل | 5 |

Out of scope (named on the honest-promise screen): tajweed rules, i'rab parsing as a skill, balagha, tafsir, fiqh, Arabic speaking/writing.

---

## 4. Acts and chapters (provisional)

> **Updated 2026-11-01:** Khadin asked that nothing from the booklet be missed. The acts below are now the five *wings* of [VISUAL_GAMES.md §3](VISUAL_GAMES.md), with one room per booklet section, and visual games carry the learning before each ayah finale. The booklet word set is topped up with the high-frequency words it lacks (verified in [BOOK_COVERAGE.md](BOOK_COVERAGE.md): all 1,010 lemmas from the English, Urdu and 80% editions + 70 frequent extras = 1,079 lemmas, 87.6% on the strict meter). From M0: inflection keys are required, derivation keys are tools ([M0_REPORT.md §3](M0_REPORT.md)); Al-Fatiha is the prologue; Reading Rooms get a Prepare step with passage words.

Five acts mirror the book's proven order (little words → nouns → sound verbs → weak verbs → augmented verbs), but the **chapter contents are ours**, chosen by our frequency data and by which real ayat become readable. Coverage targets are planning guesses until the M0 data spike computes the curve.

| Act | Story chapter (Library wing) | Learns | Grammar keys | Reading Room finale (candidate, to confirm with picker + reviewer) | Target coverage |
|---|---|---|---|---|---|
| 1 Little Words | The Entrance Hall | ~110 particles, pronouns, demonstratives, relatives, question & place words, Allah, rabb, the most common names | G1–G12 | Al-Fatiha, Al-Ikhlas, opening salah phrases | ~35–40% |
| 2 Names of Things | The Garden Courtyard | ~220 nouns & adjectives (attributes, people, signs of nature, the Hereafter, faith, deeds, family, body) | G13–G19 | Al-Asr, An-Nas, Al-Falaq, Al-Kawthar | ~55–60% |
| 3 Doing Words | The Scribes' Room | ~120 sound trilateral verbs + their 6 forms | G20–G28 | Al-Ma'un, Al-Kafirun, Al-Qadr | ~65–70% |
| 4 Bent Roots | The Old Tower | ~90 weak/doubled/hamza verbs (*qala, kana, ja'a, ra'a, ata, da'a, hada*…) | G29–G33 | Ayat al-Kursi (2:255), Al-Mulk 1–5 | ~75–78% |
| 5 Grown Forms | The Lamp Room | ~90 augmented-form verbs (*amana, anzala, kadhdhaba, ittaqa, istaghfara*…) + verb+preposition pairs | G34–G40 | Al-Baqarah 1–5, Al-Hashr 22–24, a final player-chosen passage | ~85% |

Each act ≈ 5 chapters → ~25 chapters. Each chapter ≈ 20–30 new lemmas, 8–15 real ayat, ~5-minute sessions, one Reading Room at the act end.

### Rooms as built (updated 2026-11-23, save v6)

Rooms are kept short so a first-time player is never given a wall of new words. The content of each room is as written in `authoring/rooms.js`; long rooms are dealt out into shorter ones by `authoring/splits.js` at build time, and the build fails if a room goes over the budget.

| Wing | Rooms | New words | Most new words in one room | Budget | Meter at the end |
|---|---|---|---|---|---|
| 1 Entrance Hall | 24 (Al-Fatiha is 5 of them, in ayah order: 1:1 · 1:2–1:4 · 1:5 · 1:6 · 1:7) | 131 | 8 | 8 | 47.1% |
| 2 Garden Courtyard | 20 | 259 | 18 | 20 | 65.6% |
| 3 Scribes' Room | 18 | 202 | 17 | 20 | 73.3% |
| 4 Old Tower | 8 | 123 | 20 | 20 | 79.1% |
| 5 Lamp Room | 22 | 195 | 19 | 20 | 85.5% |
| **All** | **92** | **910** | | | **85.5%** |

- Every new word gets at least one graded practice question before the room's Last Check. Where the written room only showed a word, the build adds a short Picture Match after the step that introduced it (`scripts/lib/practice.mjs`); the build fails on a word it cannot practise.
- Room ids are part of the save. A room that is cut keeps its id for the first part; old id → new ids is recorded by hand in `game/core/room-splits.js`, and a save from before v6 with the old room finished has every part finished.
- The meter is the share of the Qur'an's words the player has **met** (finished rooms). It is labelled that way on the map, the done screen and in the Guide's "My progress", next to the count of words remembered now.

### Chapter recipe (same every time — one loop)
1. **Meet** — 1 short ayah where only the chapter's new piece is unknown; Qalam points at it.
2. **Decode** — 4–8 ayat; player decodes each new word (meaning chips or Root Lens).
3. **Mix** — older words return inside new ayat (spaced review is built into ayah choice, not a separate mode).
4. **Lamp** — chapter lamp lights; coverage meter moves; Notebook updates.

### Ayah selection rules (build-time ayah picker)
- ≥ 80% of tokens already understood at that point (target 90% for Reading Rooms).
- ≤ 3 new lemmas per ayah, ≤ 1 new grammar key per ayah.
- Prefer short, well-known ayat early (Juz 'Amma, salah phrases); avoid ayat whose plain gloss could mislead without tafsir context (flag list owned by the scholar reviewer).
- Never the same ayah twice inside one chapter; Reading Rooms are fixed, not random.

---

## 5. Word record (what each lemma carries)

```
id, lemma_ar (Uthmani), root (3–4 letters), pos, pattern (mould),
forms[] (the forms the game teaches, each with features),
count (from corpus), coverage_gain (computed),
gloss.en, gloss.ur (our own, short, most common sense; comma = similar, semicolon = different),
ur_cognate (true/false + the Urdu word if it is everyday Urdu),
act, chapter, intro_ayah (surah:ayah),
review: { arabic: reviewer + date (YYYY-MM-DD), urdu: reviewer + date, status }
```

Glosses are written fresh by us from standard dictionaries and reviewed; they must not be copied from the booklet or from any copyrighted translation.
