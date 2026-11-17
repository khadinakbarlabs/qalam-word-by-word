# Visual layer and visual games — Qalam: Word by Word (DRAFT 2026-11-01)

Khadin's request (2026-11-01): **"make it more visualized 100% visualzied and add visual games so i can 85% of quranic arabic from the book don't miss anything from the book"**.

What that means for the design:
1. **100% visual.** Every task, rule and story beat must be understandable from pictures and motion alone. English/Urdu text is an optional caption under the picture, never the only way to understand. (Same principle as Typo Harbor's wordless layer.)
2. **Visual games.** Words and grammar are learned through picture games, not lists.
3. **Nothing from the booklet missed.** Every booklet entry and grammar point has a game home, checked by a script against a transcribed checklist ([BOOK_COVERAGE.md](BOOK_COVERAGE.md)).

**Studio rule check:** the studio forbids minigame anthologies. So these are not separate minigames in a hub. They are **6 game engines used inside one loop**: every Library room = *play the room's words in 1–3 visual rounds → light up a real ayah*. Same shape as Typo Harbor's 8 damage types inside one repair loop.

---

## 1. The picture language (one visual system for the whole game)

Every meaning and every grammar idea gets a consistent pictogram. Players learn the symbols once and reuse them for 700+ words.

| Idea | Pictogram | Example |
|---|---|---|
| Person: I / we | figure pointing to itself; two/three figures pointing to themselves | أَنَا، نَحْنُ |
| Person: you | figure facing the player | أَنْتَ، أَنْتُمْ |
| Person: he / she / they | figure turned to the side | هُوَ، هِيَ، هُمْ |
| Masculine / feminine | **▲ teal badge** / **● rose badge** (shape + colour, never colour alone) | هُوَ ▲ ، هِيَ ● |
| One / two / many | 1 dot / 2 dots / 3 dots on the badge | هُمَا ●● |
| Near / far | short pointing arm / long pointing arm with distance line | هٰذَا / ذٰلِكَ |
| Past / now-later / command | timeline with a NOW pin: shaded segment behind the pin = past; ahead = now/later; raised hand = command | فَعَلَ / يَفْعَلُ / اِفْعَلْ |
| "No" | stamp ✕ placed on the timeline segment it cancels | لَمْ (✕ past), لَنْ (✕ future), لَا (✕ now / don't) |
| Question | "?" bubble + what is asked: person, box, pin, clock, gear, dots, bulb | مَنْ، مَا، أَيْنَ، مَتَى، كَيْفَ، كَمْ، لِمَ |
| Place | a lamp and a box: lamp above / below / in front / behind / between / around / inside | فَوْقَ، تَحْتَ، أَمَامَ، خَلْفَ، بَيْنَ، حَوْلَ، فِي |
| Direction | arrow into / out of / towards / away | إِلَى، مِنْ، عَنْ |
| Front pieces | chip shapes that click onto the front of a word: link ⊕ (وَ), arrow → (فَ), hand ✋ (بِ), gift 🎁 (لِ), equal ≈ (كَ), spotlight (ال), small arrow ahead (سَ) | وَ + كِتَاب |
| Attached endings | the person figure shrinks into a chip that clicks onto the end of a word | كِتَاب + ـهُمْ → their book |
| -er / -est | size ladder (small → big → biggest step) | كَبِير → أَكْبَر |
| Root | 3 letter-seeds that grow a plant; every word of the root is a leaf | ع ل م |
| Mould (pattern) | a cookie-cutter stamp with holes for the 3 root letters; extra letters shown as **gold pegs** | فَاعِل → عَالِم |
| Six verb forms | six petals: ⟲ past, ▶ now/later, ☝ command, 🧑‍🔧 doer, 📦 done-to, ⚙ the action itself | عَلِمَ يَعْلَمُ اِعْلَمْ عَالِم مَعْلُوم عِلْم |
| Weak letters | "bendy" letters و / ي that stretch, hide or turn into ا (animated) | ق و ل → قَالَ، يَقُولُ، قُلْ |
| Passive ("was done") | the doer figure fades to a dotted outline; the arrow points back at the object | فَعَلَ → فُعِلَ |
| Verb + connector | the same verb with a different connector piece shows a different picture | تَابَ إِلَى / تَابَ عَلَى |

### Painted pictures (2026-11-03)
Every word card with a picture now has a painted illustration (`game/art/<id>.webp`), made from one prompt per word in `authoring/art.js` with a single shared style: storybook gouache, warm limited palette (cream, lamp gold, teal, rose, sky blue, leaf green, brown outline). People are simple faceless figures in modest dress. Attached pronouns reuse their separate pronoun's picture (`{ same: … }`). The emoji stays in the pack as the fallback and in the Picture Guide. Scene spots, sort bins, the Person Wheel, Six Petals and map doors show the same paintings, so one picture means one thing everywhere.

All 339 paintings were reviewed on contact sheets (2026-11-03). Every person is faceless. Four were redrawn: jinn and jahannam had gained a figure, and kafir and mujrim showed the game's own headscarf figure as the wrongdoer. Wrongdoer words now use object scenes (a cloth over a lamp, a broken lock with spilled coins), and any prompt that says "no people" gets an explicit no-figures line instead of the people rule.

### Every visual explained, no generic emoji, mastery (2026-11-04)
- **Picture lines.** Every painting has a short "Picture: …" line saying what it shows, made from its painting prompt at build time (`whyFor` in scripts/lib/pack.mjs; Urdu in authoring/why-ur.js). It appears on the flipped meet card, in My words, and in every word tooltip (meaning · extra meanings · picture), including ayah words and given words.
- **Painted game signs.** The game's own symbols are paintings (`ui:` entries, read through game/ui/signs.js): lamp / unlit lamp, Qalam's reed pen, Relight, lock, spark, root pot, time bins (past / now / future, done / soon / later), sent / refused, the three intro panels. He / she bins and the "me", right, left, here, there, eye marks reuse the matching word paintings. Emoji remain only as a fallback while a painting is missing, plus functional marks (the show-me hand, progress dots).
- **Given words** in ayat borrow a word painting (`art: "w:…"`) or their own (`g:` entries); the Ikhlas words about Allah (أَحَد، يَلِدْ، يُولَدْ) are calligraphy only.
- **Picture Guide** opens with "How to read the pictures": the rules every painting follows.
- **Mastery check** ends every room with 3+ new words (game/core/mastery.js): each new word, in mixed order, right twice in a row without a hint, alternating Arabic → picture and picture → Arabic; a miss resets it and brings it back two questions later, and counts against its lamp card. **Relight** sessions hold 12 words and a missed word must then be answered right twice before it leaves.

### Techniques borrowed from the FreeQuranEducation "85% of Qur'anic Words" series (2026-11-04)
Studied three of their videos (episodes 1–10, 11–30 compilation, nasheeds) from their descriptions, chapters and frame previews. Only techniques are borrowed; their scripts, lyrics and art are theirs and are not copied.
- **Stakes card** before every room: big numbers for the room's new words and how many Qur'an words use them (the pack computes `room.stakes` from the corpus), like their "13 words · 1,350 times" episode openers.
- **Story strip** (`story` step) as a room's closing scene: the room's own paintings tell a small wordless story, one tap per panel, like their story scenes that put the words to use. Our stories, our art: signs, town, deeds, Doing Words 2–5.
- **More meanings** for big words (`more` on a word card: رَبّ, دِين, آيَة, أَمْر, فِتْنَة, ذِكْر, نَفْس, حَقّ, سَبِيل, كِتَاب, فَضْل, يَوْم, كَلِمَة, رُوح), shown on the meet card, its tooltip and the dictionary, like their "Rabb: Sustainer, Provider, takes care, helps us grow".
- Already shared with the series: calligraphy medallions for names of Allah and name banners for prophets; scenes from nature for the signs.
- Not taken: faces on characters (Qalam stays faceless), music (a voice-only chant mode would need Khadin's decision).

### Respect rules for pictures (reviewer-owned list)
- **No images** of Allah, prophets, angels, companions, or jinn/Satan figures. Names and attributes of Allah are shown only as **calligraphy medallions** with light (no symbol that suggests a body: no eye for "All-Seeing", no ear for "All-Hearing"); their game uses the root-family visual (رَحْمٰن · رَحِيم · رَحْمَة light up the same ر ح م seeds), not pictures.
- Prophet names appear as name scrolls; whether symbolic objects (ark, staff) may accompany them is a reviewer decision.
- Hereafter words get calm, non-graphic icons (garden for جَنَّة, flame for نَار); nothing frightening.
- Abstract words (تَقْوَى، إِيمَان، كُفْر، صَبْر) use only reviewer-approved symbols; if none is approved, the card shows the Arabic + caption + its root family, which is still visual.
- People in pictures never touch across genders (no man–woman handshake); partners and helpers are drawn as same-gender pairs or sharing an object.
- A name of Allah (medallion card) never sits on a petal or bin whose picture is a working figure (the doer petal, Passive Flip's "someone did it" bin); verbs whose doer is Allah (create, raise up, gather) stay out of the doer bin. The pack build enforces the petal rule.
- Settings stay in the game's world: no Western court wigs or other foreign costume.
- Qur'anic text stays read-only (PLAN D4): pictures appear *under* or *above* intact words, never replacing letters.

### Wordless instructions
- First time each engine appears, a **show-me hand** performs one move, then the player repeats it.
- Feedback is visual: right = word glows and its picture "lands" in the Notebook; wrong = the chosen chip wobbles and shows its own picture (why it is wrong) — no buzzer, no red cross on Qur'anic text.
- Story beats are **comic panels** (Typo Harbor pattern): Qalam acts things out with props; captions optional.
- The coverage meter is a **lamp filling with light** plus the number; acts are wings of a drawn library map that brighten.

---

## 2. The six game engines

| # | Engine | What the player does | Grammar it carries |
|---|---|---|---|
| E1 | **Picture Match** | tap the picture for a word (or the word for a picture); memory-flip pairs; Scene Hunt (tap things in a drawn scene: sky, garden, family, town) | nouns, adjectives, plural pairs, -er/-est ladder |
| E2 | **Place & Point** | drag the lamp to where the word says; point near/far; drop the "No" stamp on the timeline; put events in order on the timeline | demonstratives, places, prepositions, time words, negation by time |
| E3 | **Snap Pieces** | click front pieces and end chips onto a word, watch the picture change (book → their book → and their book) | front pieces, attached endings, verb front markers (قَدْ، سَـ، سَوْفَ، لَـ), إِنَّ family, verb + connector |
| E4 | **Root Garden** | plant 3 root seeds, choose a mould stamp, grow the word; fill the six petals; watch bendy letters; stamp gold pegs for forms II–X | root + mould, six verb forms, weak/doubled/hamza roots, forms II–X, passive |
| E5 | **Person Wheel** | spin the wheel of people; attach the right ending for past / now-later / command / don't; ▲/● and 1/2/many | pronouns, full conjugation tables, dual & feminine forms |
| E7 | **Mould Press** (Wing 5) | a word you know goes into a pattern mould (فَعَّلَ, فَاعَلَ …; the added piece glows rose) and comes out grown; tap the picture of its new meaning, then see the shift (عَلِمَ know → عَلَّمَ teach) | forms II–X as meaning-changers |
| E8 | **Reading Room** (wing finales) | a whole famous passage on one page, every word already learnt; tap each line in order to light its words and show its plain meaning; ends with "You read the whole surah!" and the share of words known | a short surah or passage (Reading Room 1: Al-Ikhlas, end of Wing 1; Reading Room 2: Al-Asr, end of Wing 2; Reading Room 3: Al-Kafirun, end of Wing 3; Reading Room 4: Ayat al-Kursi, end of Wing 4, a long ayah read in phrases; Reading Room 5: Al-Baqarah 1–5, end of Wing 5) |
| E6 | **Ayah Light-Up** (finale of every room) | read a real ayah; tap glowing words, decode with the picture chips; the ayah lamp lights | everything, in real context |

Each room uses 1–3 of E1–E5 for its words, then E6. Rounds are short (5–8 taps), untimed by default, free retries, hints = show-me hand (1st) then the answer with its picture (2nd, explicit).

---

## 3. Every booklet page → its room and game

Booklet page numbers refer to the reference booklet (internal use). Rooms follow the booklet's section types — standard Arabic-grammar categories — in our own order and with our own words, glosses and art.

### Wing 1 — Entrance Hall: Little Words (booklet pp. 1–6; ~41% of words per the booklet)
| Booklet section | Room | Engines |
|---|---|---|
| p1 "This, that" (هٰذَا … الَّذِينَ) | Near & Far | E2 point near/far ▲/● + E1 |
| p1 "No" (لَا … أَلَّا) | The No Stamp | E2 timeline stamp |
| p2 "Whose?" / "Who?" (attached + separate pronouns, incl. dual & feminine) | Who's Who | E5 people line-up + E3 end chips |
| p3 "Where?" (فَوْقَ … هُنَا/هُنَالِكَ) | Lamp & Box | E2 drag the lamp |
| p3 "Questions" (مَا … لِمَنْ) | Question Cards | E1 question ↔ answer-type icons |
| p4 "Miscellaneous" (ذُو، أَهْل، سُبْحَان، نِعْمَ، بِئْسَ …) | Word Chest | E1 + E3 |
| p4 "When?" (قَبْلَ … أَلَّا) | Time Line | E2 order events |
| p5 "Prepositions" / "Prepositions + مَا" | Connectors | E2 arrows + E3 snap (بِ + مَا → بِمَا) |
| p6 "Prefix for verb" (قَدْ، سَـ، سَوْفَ، لَـ، لِـ) | Verb Front Markers | E3 + timeline |
| p6 "Inna…" (إِنَّ family, إِنْ، لَوْ، أَوْ، أَمْ …) | Strong Starters | E3 |
| p6 extra nouns (جِنّ، جُنُود، مَيِّت، إِنْس، بَعْض، كُلّ، الـ) | Word Chest | E1 |

### Wing 2 — Garden Courtyard: Names of Things (booklet pp. 7–15)
Built 2026-11-02: Names of Light (`roots` step), Size Ladder (`ladder` step), Signs in the Sky (`scene` step, spots in `game/core/scenes.js`), Name Scrolls / The Last Day / Faith Words (`sort` step = timeline without arrow), Deeds & Blessings (sort good 🌷 / bad 🍂), Family & Body (Scene Hunt `family` tree around 🙋 "me" + `body` figure; sort ▲ / ●), Town & People (Scene Hunt `town`), Word Chest 2, and two review halls: Names & Ladders (Root Garden for the remaining names of Allah, ladder for the rest of أَفْعَل) and Lost & Found (Scene Hunt `sides`: right / left / here / there; sent/refused and garden/fire sorts). Scenes are data in `game/core/scenes.js` (ratio, CSS layers, marks, spots); spot size scales with the scene (container units). Calligraphy has three frames: glowing medallion (names of Allah, abstract ideas), parchment scroll `scroll:` (prophets, angels, revealed books; enforced by SCROLL_ONLY in pack.mjs), plain ink `plain:` (Shaytan). Every visual is explained once in `game/ui/tips.js` (EN + UR); the same text drives tooltips (hover, long-press, keyboard focus; a long-press never answers) and the Picture Guide screen (🗂️ on the map: Signs & pictures + My words dictionary). Known gap: a medallion-only word's meaning check in Ayah Light-Up shows medallions, so the player picks by caption, not picture; Root Garden carries the visual load for names of Allah.
| Booklet section | Room | Engines |
|---|---|---|
| p7 attributes (رَبّ، رَحْمٰن، رَحِيم …) | Names of Light | E1 calligraphy medallions + E4 root seeds (no pictures) |
| p8 "Noun of superiority" + attributes | Size Ladder | E1 ladder (كَبِير → أَكْبَر) |
| p9 "Prophets" | Name Scrolls | E1 scrolls (respect rules) |
| p9 "Allah's signs" (sky, earth, sun, moon, night, day, sea, mountain, wind …) | Signs Scene | E1 Scene Hunt (sky/earth scene) |
| p10 "Last day" | The Last Day | E1 calm icons + E2 timeline (this world → that day) |
| p11 "Deen" / "Faith" | Faith Words | E1 approved symbols + root family |
| p12 "Deeds" / "Blessings" | Deeds & Blessings | E1 sort good/evil, gifts |
| p13 "Relatives" / "Self (body parts)" | Family & Body | E1 Scene Hunt (family tree, body) |
| p14 "World" / "People" | Town & People | E1 Scene Hunt (town) |
| p15 "Miscellaneous" | Word Chest | E1 |
| (notation) mg/fg, dual, broken plural "+" | built into every card | E1 plural pairs (shape-change animation), ▲/● badges |

### Wing 3 — Scribes' Room: Doing Words (booklet pp. 16–20 + tables pp. 39–42)
| Booklet section | Room | Engines |
|---|---|---|
| Six forms of a verb (booklet note 11) | Six Petals | E4 |
| pp. 39–42 conjugation tables (past, now/later, command, don't, doer, done-to, action; masc. & fem.) | Person Wheel; **Built (full tables):** Verb Tables 1–2 in Wing 5 | E5 (introduced here, reused in every verb room) + sorts: did / was done, do / don't, one / two / many, he / she |
| p16 فَتَحَ يَفْتَحُ group | a-a verbs | E4 + E5 |
| pp. 17–18 نَصَرَ يَنْصُرُ group | a-u verbs | E4 + E5 |
| p19 ضَرَبَ يَضْرِبُ group | a-i verbs | E4 + E5 |
| p20 سَمِعَ يَسْمَعُ group | i-a verbs | E4 + E5 |
| passive rows (majhool) on each group | Passive Flip | E4 dotted-doer animation |

### Wing 4 — Old Tower: Bent Roots (booklet pp. 21–25)
| Booklet section | Room | Engines |
|---|---|---|
| p21 مِثَال (first letter w/y) | Bendy First Letter | E4 bendy letters |
| p22 أَجْوَف (middle weak: قَالَ، كَانَ، جَاءَ، شَاءَ …) | Bendy Middle | E4 |
| p23 نَاقِص (last weak: رَأَى، دَعَا، هَدَى، أَتَى …) | Bendy End | E4 |
| p24 مُضَاعَف (doubled) | Twin Letters | E4 |
| p25 مَهْمُوز (hamza: سَأَلَ، أَمَرَ، أَخَذَ، أَكَلَ …) | Hamza Seats | E4 |

### Wing 5 — Lamp Room: Grown Forms (booklet pp. 26–38)
| Booklet section | Room | Engines |
|---|---|---|
| pp. 26–27 فَعَّلَ (II) | **Built:** Strong Middle 1–2 | E7 Mould Press + E4 Six Petals + E1 |
| p28 فَاعَلَ (III) | **Built:** Together Verbs | E7 + E4 + good/bad sort |
| pp. 29–33 أَفْعَلَ (IV, incl. weak-middle and weak-end) | **Built:** Make-It Verbs 1–4 | E7 Mould Press (أَ glows) + E4 + good/bad sort |
| p34 تَفَعَّلَ (V) | **Built:** Self Verbs 1–2 | E7 Mould Press (تَ glows) + E4 + good/bad sort |
| p35 تَفَاعَلَ، اِنْفَعَلَ، اِفْعَلَّ (VI, VII, IX) | **Built:** Each-Other Verbs + Burst & Colour Verbs | E7 Mould Press (تَ / اِنْ / doubled last letter glows) + E4 |
| p36 اِفْتَعَلَ (VIII) | **Built:** Take-For-Yourself Verbs 1–2 | E7 Mould Press (تَ after the first letter glows) + E4 + E5 |
| p37 اِسْتَفْعَلَ (X) | **Built:** Asking Verbs 1–2 (+ هُدًى) | E7 Mould Press (اِسْتَ glows) + E4 + E5 |
| p38 verb + connector (صِلَةُ الْفِعْل) | **Built:** Verb Partners 1–2 | E3 connector swap — new step `path` (verb + glowing partner word → tap the new meaning) |

### Booklet study notes → where they live
| Booklet note | Game home |
|---|---|
| 1 word count / 85% claim | the lamp meter (our own computed number) |
| 2–3 most common meaning; comma = similar, semicolon = different meanings | cards show one picture per meaning; "two meanings" = split card |
| 4 first six pages ≈ 41% | Wing 1 finale shows the jump on the meter |
| 5 count per page | room cards show "this room = N words of the Qur'an" |
| 6 numbers next to words = how often | every card has a small frequency bar |
| 7–8 topic order (nouns), type order (verbs) | Wings 2 and 3–5 above |
| 9 no final vowel = ending changes; ال removes tanween | reading-tip card in Wing 2 (G19) |
| 10 alphabetical order | Notebook can sort by root / alphabet |
| 11 six forms, rebuild the table | Six Petals + Person Wheel |
| 12 active vs passive | Passive Flip |
| 13 dual & feminine (add ان / ين) | E5 ▲/● 1/2/many badges |
| 14 starred verbs (full conjugation in a companion book) | starred verbs get a full Person Wheel round |
| 15 verb + preposition | Same Verb, New Path |
| abbreviations (mg, fg, br. pl, dl, sb, st, VEL) | the picture badges above |

---

## 4. Room shape (one loop, visual end to end)

```
Map (lamp-lit wing) → Room door (picture of the theme)
   → Round 1: engine E1–E5 with the room's words (show-me hand first time)
   → Round 2–3: same words, another engine or a harder stage (Starter → Builder → Inventor)
   → Ayah Light-Up: a real ayah using those words (untaught words given with their pictures)
   → Lamp fills, meter rises, Notebook gets picture cards
```

Starter = pick the picture; Builder = build the word (snap pieces, grow from the root); Inventor = predict a new word's meaning from root + mould before seeing it.

**Repetition:** every word met in a room becomes a lamp on the Notebook shelf and returns on a spaced schedule — in later rooms, in Relight warm-ups and in ayat — each time through a different engine. Design: [MEMORY_SYSTEM.md](MEMORY_SYSTEM.md); prototype: the 🔁 Relight tab.

---

## 5. Art and tech notes

- Art style: warm parchment, ink line, lamp-gold highlights; flat vector icons for the picture language; illustrated scenes for Scene Hunt (sky/earth, garden, town, family). Procedural SVG where possible (lamp & box, timeline, wheels, petals) — small download, crisp at every size.
- Emoji may stand in for concrete nouns in prototypes; release art must be consistent and respect-reviewed.
- All six engines share one input model (tap, drag, keyboard), work at 9:32 → 32:9, and support reduced motion (animations become fades).
- Picture cards are data: `authoring/pictures/*.js` maps lemma → icon id + caption keys; the validator refuses a card whose picture is on the "no image" list.
