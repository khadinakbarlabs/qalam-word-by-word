# Learning-game brief — Qalam: Word by Word (DRAFT 2026-11-01)

Studio template (`assets/learning-game-brief-template.md`), filled. Details live in [PLAN.md](PLAN.md) and [CURRICULUM.md](CURRICULUM.md). Working title is provisional (trademark screen not done).

## Single-game concept
- Studio domain: processing information (breaking a word into parts and reading meaning from them), applied to Qur'anic Arabic.
- Player promise: "Learn Qur'anic Arabic: read real ayat and know what each word means, by yourself — up to about 85% of the Qur'an's words."
- Core loop / thinking skill: see a real ayah → tap an unknown word → decode it (pick its meaning, or split it into root + mould + attached pieces) → the ayah's word-by-word meaning fills in → its lamp lights. Skill: recognising words and reading their shape.
- Real-world decision: "In salah or recitation, what does this word I just heard or read mean?"
- Visible consequence: a gloss appears under the word, the ayah lamp lights, the coverage meter ("you recognise about N% of the words in the Qur'an") moves up.
- After-win reflection: one line linking to daily life ("You will hear *rabb* in every rak'ah of salah"). No claims of fluency, scholarship or tafsir.
- Why fun: the "aha" of cracking a word from pieces you already own; the meter is a true, ever-growing number; whole ayat suddenly open up.
- Out of scope: tajweed, memorisation (hifz) testing, tafsir, fiqh, speaking or writing Arabic, other books, a separate minigame hub, multiplayer.
- **Visual (added 2026-11-01, Khadin):** 100% visual — pictures and motion carry every task; 6 visual game engines (Picture Match, Place & Point, Snap Pieces, Root Garden, Person Wheel, Ayah Light-Up) run inside each room; every booklet entry has a room and a game. Full design: [VISUAL_GAMES.md](VISUAL_GAMES.md).
- Direction status: **approved by Khadin 2026-11-01** ("keep the direction learn quranic arabic and 85% of quranic arabic").
- Retention: 5 acts / ~25 chapters, Library wings to relight, Notebook of words by root, word strength, badges, Reading Rooms.
- Events/FOMO protections: optional "Ayah of the Day" only; no streaks; coverage never goes down; nothing expires.

## Story and companion
- Narrative: the player becomes a new student at **Dar al-Fahm** (the House of Understanding), a fictional old library-garden. Its lamps hang above shelves of ayat; each lamp lights when a reader understands the words beneath it. Stakes are personal: "Understand what you already recite."
- Companion: **Qalam**, a talking reed pen (original character; not a religious figure). Patient, curious, a little proud of roots ("every word has a family"), writes your glosses into the Notebook in ink. Text-only voice. Visual: reed pen with two ink-drop eyes; writes, points, and draws root letters.
- Respect line: Qalam never jokes about ayat, never "fixes" or rearranges Qur'anic text, and never comments on rulings.
- First encounter: Qalam: "You already say these words every day. Tap the first one." The Basmala: tap بِسْمِ → it splits into بِ + اسْم → "in" + "name".
- Arc: Entrance Hall (little words) → Garden Courtyard (names of things) → Scribes' Room (doing words) → Old Tower (bent roots) → Lamp Room (grown forms). Ending: the player reads a full Reading Room passage with almost every word known; Qalam writes the player's name on the first page of their Notebook.
- Hints/failure: two-stage hint (see Interactive loop); wrong picks get a "why not" line; no fail state, no lives.
- Story is skippable and replayable from the map; no grammar is hidden only in story scenes; no guilt lines ("Qalam missed you" is banned).
- Post-story: Ayah of the Day, free review in any wing, "Open shelf" (any ayah whose words you now know). Content limit stated: about 85% of words, not every word.

## Audience and honest promise
- General 13+; teens and adults who can read Arabic script (most learned Nazra as children) but do not understand it. Urdu speakers and English speakers equally.
- Not child-directed: no nursery tone, no cartoon prophets, adult and teen reading level; listing reviewed against made-for-kids signals.
- Practises: recognising the most frequent Qur'anic words, attached pieces, and verb shapes; reading word-by-word meaning.
- Does NOT teach or prove: tajweed, correct recitation, memorisation, tafsir or rulings, full Arabic grammar, speaking. Glosses are short "most common meaning" aids, not a translation of the Qur'an.

## Interactive loop
- Sees: one real ayah (verbatim Uthmani text, never altered) as a row of word tiles, right to left; known words show a faint gloss underneath; new words glow.
- Manipulates: tap a glowing word → (a) pick its meaning from 3 chips, or (b) Root Lens: drag pieces into slots — front piece / root / mould / end piece — then pick the meaning they add up to.
- Tests: tile snaps, gloss writes in; when every word is glossed the ayah lamp lights and the reviewed full translation (EN/UR) is shown.
- Why reasoning is needed: distractor chips are each wrong for one teachable reason (same root but wrong person; right meaning but past vs present; look-alike word).
- Worked first level: Basmala (4 words) then Al-Fatiha 1:2; first success < 30 s (target, untested).
- Misconception feedback: picking "he wrote" for يَكْتُبُ → "The *ya-* in front means he does it now or later. Done-words have no *ya-*."
- Success state: gloss + lamp + one "why" line + meter move.
- Next level varies the same decision: new word, new piece, new mould; later stages hide which words are new (Mix stage).
- Companion lines: every line names the word, the piece, or the rule — no generic praise.
- Hints: Hint 1 = clue (root letters or "look at the end piece"); Hint 2 (second explicit tap) = shows meaning and why; hinted words count as learned but marked "with help", disclosed up front.

## Progression and rewards
- Starter → Builder → Inventor: Starter picks meanings shown in context; Builder splits words with the Root Lens; Inventor predicts a new word's meaning from root + mould before seeing chips ("You know *'alima*. What could *mu'allim* mean?").
- Map: Library floor plan, 5 wings × ~5 rooms; room states locked / next / lit / reviewed; narrow screens scroll the plan with snap points.
- Badges (exact, one-time, saved): "Basmala understood", "Al-Fatiha understood", "Little Words wing lit", "First root built", "All 6 forms of one verb", "50% coverage", "Ayat al-Kursi Reading Room", "85% coverage".
- Generated content: none at runtime. All ayah items are picked and validated at build time (CURRICULUM §4).
- Untimed default; optional "Quick Recall" timed review of learned words only; free retries; hints always available.
- Stars: none on Qur'anic text. Word strength (New → Practising → Strong) instead; no replay farming possible.
- Stopping points: end of every ayah and every room; manual Next.

## Voluntary return and discovery
- First 10 s: candle-lit library, Basmala on a shelf, Qalam: "Tap the first word."
- First 60 s: Basmala decoded (4 words), first lamp lights, meter moves for the first time with a real number.
- Competence: coverage meter and Notebook roots grow; the player can open ayat they could not read before.
- Autonomy: choose next room in a wing, choose review wing, choose "Open shelf" ayat, transliteration on/off, explanation language.
- Relatedness: Qalam; optional context outside the game (family study circles, teachers using it in class).
- Shareworthy (no in-game share prompt): "I now recognise 41% of the words in the Qur'an" card; "Al-Fatiha: every word understood".
- Creator angle: "Do you know what you say in salah? Watch me decode Al-Fatiha in 2 minutes."
- Return reason: next room, the meter, words due for review — nothing lost by leaving.
- Experiment (post-launch): hypothesis "showing the Urdu cognate marker raises chapter-1 completion for Urdu players"; one variable; local-only aggregate if platform allows, else none.

## Economy
- None in v1. No ads in v1 (ads near Qur'anic text are a respect risk; see PLAN §7). No currency.

## Visuals and access
- First instruction exactly as shown: "Tap the first word." Every grammar term gets a plain name first.
- Dominant board: the ayah row (large Uthmani text); primary action: tap a word; secondary: map, Notebook, settings.
- Calm palette: parchment, ink, lamp gold; no flashing; reduced motion supported.
- Arabic always right-to-left; UI mirrors in Urdu mode; English mode keeps LTR UI with RTL Arabic blocks.
- Colour-independent states (icon + label), 44 px touch targets, keyboard focus, transliteration toggle, adjustable Arabic size.
- Small-phone: ayah wraps to 2–3 rows, Root Lens becomes a bottom sheet; wide-short: Notebook side panel.

## Evidence (all still to do)
- Coverage curve and ayah-picker output from M0 data spike.
- Scholar review log for every gloss and grammar explanation (Arabic + Urdu).
- Blind-solver gate: a fresh agent/person solves items using only what the game has taught.
- Host lifecycle + save validation; Playables requirements verified separately; representative-user test with Urdu and English speakers.
