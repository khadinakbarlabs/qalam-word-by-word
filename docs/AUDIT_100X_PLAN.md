# Qalam: Word by Word — deep audit and "100x" plan

Audit date: 2026-11-17. Build audited: `game/` (64 rooms, 910 taught words, meter 85.5%, save v3, 884 paintings, 14 MB).
Earlier audit: [POLISH_PLAN.md](POLISH_PLAN.md) (2026-11-05). That one fixed certification and fit. This one asks a
different question: **is the game good enough that people finish it, remember the words, and tell others?**

Nothing was changed in the game for this audit. This is a plan only.

---

## 1. Short verdict

The game is well built and safe: clean code, 64 passing tests, static audit passes, every screen fits, the paintings are
consistent and respectful. As a product it is still a **picture flash-card course with a map**. Four things hold it back,
in this order:

1. **Nobody outside this project has played it.** No playtest, no recall check, no platform access. Every number below
   is about the build, none is about players.
2. **The promised core loop is mostly missing.** The brief promises decoding (split a word into root + mould + pieces,
   reason about why a wrong answer is wrong). The build is 77% flip a card / pick a picture / tap a word.
3. **Sessions are too long and the first win is too slow** for a YouTube Playables audience.
4. **It has no voice.** A game about words people hear in every prayer plays four quiet beeps and no recitation.

"100x" cannot be promised and there is no baseline to multiply. What can be said honestly: polish will not get there.
The big multipliers are **reach** (today: zero players), **the first minute**, **session length**, **sound**,
**real decoding**, **memory that works**, and **trust** (a named scholar). The plan in §5 is ordered by those.

---

## 2. What was checked, and what was not

| Checked | How |
|---|---|
| All game code (43 JS files, ~4,150 lines), CSS, save schema, SRS, tests | Read in full or in large part; 64 tests run: all pass |
| Content pack (words, rooms, 760 steps) | Counted with scripts against `game/content/*.json` |
| First session | Played from a fresh test save in the browser pane at 1024×768: intro → Al-Fatiha: Praise (all 7 parts) → map → Relight |
| Brief vs build | `GAME_BRIEF.md`, `MEMORY_SYSTEM.md`, `POLISH_PLAN.md` compared with the code |

**Not checked:** rooms 2–64 by eye in this audit (a full 3-viewport autoplay was started and was at room 10 of 64 with no
errors when this was written; see §7); real phones; Urdu mode by eye; any real player; anything on YouTube itself.

---

## 3. Scores

1 = missing or broken, 3 = works but basic, 5 = polished and complete.

| # | Area | Score | Why |
|---|---|---|---|
| 1 | Core loop depth | 3 | One loop, but the "decode" half is thin: 4 Snap steps out of 760 |
| 2 | Memory (does it stick?) | 3 | Good scheduler; only 2 review modes; mix-up drills are dead code; nearly half the words never meet an ayah |
| 3 | First session | 3 | Clear and calm, but the first lamp takes 66 taps; the brief's target was under 60 seconds |
| 4 | Session fit and pacing | 2 | Average room 118 taps, longest 225; average 14 new words a room, most 34 |
| 5 | Visual polish | 3 | Paintings are strong; layouts leave half the screen empty on tablet and desktop; emoji mixed with paintings |
| 6 | Audio | 1 | Four sine-wave beeps at low volume. No recitation, no ambience |
| 7 | Story and companion | 2 | Qalam is an icon beside an instruction line; three intro panels; no arc, no ending |
| 8 | Reasons to come back | 2 | Next room or Relight. Nothing short, nothing new each day, nothing to explore |
| 9 | Accuracy and trust | 2 | 910 meanings and all pictures are still drafts; no reviewer named; rights items open |
| 10 | Code and tests | 4 | Small pure modules, validators, autoplay. A few dead paths (§4.5) |
| 11 | Performance and platform rules | 4 | 0.3 MiB first load, heap 7 MB, static audit passes; devices and hosted suite not run |
| 12 | Mobile, fit, accessibility | 4 | Every screen fits at 3 sizes; keyboard, Esc, contrast done |
| 13 | Reach | 1 | No platform access, 2 languages, no listing, no players |
| | **Total** | **34 / 65** | |

---

## 4. Findings

### 4.1 The loop that was promised is not the loop that was built

Step counts in the shipped pack (760 steps):

| Step | Count | What the player does |
|---|---:|---|
| Ayah Light-Up | 303 | Tap a word. New word: the answer simply appears. Known word: pick 1 of 3 |
| Meet | 170 | Flip a card |
| Picture Match | 113 | Pick 1 of 3–4 pictures |
| Six Petals | 43 | Verb forms |
| Sort / Timeline | 34 | |
| Story | 29 | |
| Grow, Wheel, Roots, Scene, Path, Place, Point, Ladder | 59 | |
| **Snap Pieces (splitting a word)** | **4** | The brief's headline skill |
| Reading Room | 5 | |

- **New words need no thinking.** In `ui/steps/ayah.js` a gold word is tapped and filled in (`tap()` → `fill()`). There
  is no guess first. Guessing before seeing is the "generation" effect that `MEMORY_SYSTEM.md` §1 lists and the
  Inventor stage in the brief promises; neither exists.
- **Wrong answers teach nothing.** Every miss shows the same line, "Not quite. Try again…". The brief asks for a
  "why not" line per distractor ("the *ya-* in front means he does it now").
- **Distractors are picked by position, not by confusion.** `kit.options()` rotates through a list by index. The ayah
  step fills its 3 chips from other words in the same ayah, then from the start of the word list. Look-alikes
  (مَنْ / مِنْ, لَمْ / لَنْ, إِنَّ / أَنَّ) only meet by accident. Many questions can be answered by elimination.
- **Pieces data exists but is under-used.** 180 of 1,372 ayah word slots carry `pieces` (160 distinct words). They are
  shown as a small strip after the tap. They are not a task.
- **Captions carry the answer.** Choices show a picture with its English or Urdu caption, so most questions are
  "Arabic word → read the caption". That is fine for learning meaning; it means the pictures do less work than the
  design claims, and a caption-off mode is the only place where pictures are tested.

### 4.2 Memory: the scheduler is good, the practice around it is thin

- **Two review modes only.** Relight alternates word → picture and picture → word (`ui/relight.js`). The memory doc
  promises varied retrieval: build it, find it in an ayah, hear it, tell two apart.
- **Mix-up drills are dead code.** `srs.recordMixup()` runs in Relight, but `save.js` never stores `mixups`
  (`serializeSave` leaves it out; `cleanCard` resets it to `{}`), and `drillPairs()` is called from nowhere. Every
  recorded mix-up is lost when the session ends.
- **Backlog grows faster than it can clear.** Relight serves 12 words a session. A room adds 14 on average, up to 34.
  A finished save had 242 words due; at 12 a visit that is 20 visits with no new rooms. The "more than 40 due → suggest
  Relight first" guard in the memory doc is not built.
- **No free practice.** With nothing due and no time for a 120-tap room, there is nothing to do. "Lamp Review" (any
  wing, any root family) from the memory doc is not built.
- **Nearly half the words never appear in a real ayah in the game.** Counting word ids inside Ayah Light-Up steps:
  440 of 910 taught words appear in none, 241 in one, 229 in two or more (294 different ayat are used). For those 440
  the promise "read real ayat and know each word" is met only by cards. (Count is by word id in `step.words[].w`;
  a word that appears only as a "given" tile counts as zero.)
- **A new word gets about 3–5 recalls on day one, all in one sitting**, then nothing until the player opens Relight.
  Due words are not mixed into the next room's warm-up.

### 4.3 Session shape does not fit the platform

- Room length: min 39, **average 118**, max 225 taps; 28 of 64 rooms pass 120 taps. At 2–4 seconds a tap that is
  roughly 5–15 minutes for one lamp. The rest stops help, but a rest stop gives no lamp and no meter tick.
- New words per room: average 14.2; 17 rooms teach more than 20; `soft-letters-4` teaches 34. The memory doc's own
  pace is 15–20 new words a **day**.
- First win: Al-Fatiha: Praise is 66 taps and 13 new words before the first lamp. The brief says: Basmala decoded,
  first lamp, meter moves, all inside 60 seconds.
- The map offers one thing: the next door. Rooms unlock strictly in order. There is no 2-minute choice.
- The meter moves only at the end of a room. Inside a 15-minute room the player sees no gain.

### 4.4 Feel, sound and story

- **Sound:** `ui/sound.js` makes four tones at volume 0.07. No recitation of a word or an ayah, no room tone. The
  real-life decision in the brief is "what does this word I just **heard** mean?" and the game never plays a word.
- **Empty screens.** At 1024×768 the ayah row, the 2×2 answer grid and the done card all sit in the top 55% of the
  screen; the rest is blank parchment. Cards are flat white boxes with a thin border.
- **The done screen is a lamp and a number.** No list of the words just won, no "you will say this in your next
  prayer" line (brief: after-win reflection), no look at the next room.
- **Qalam has no character.** One painting, used as a 20-pixel icon beside instructions. No lines that name the word
  or the piece (brief: "every line names the word, the piece, or the rule"), no beats between wings, no ending.
- **Mixed visual language.** Painted cards sit next to emoji: 🗂️ ⚙️ in the dock, 📜 room icons, 👆 hand, ✓✓, 🔥
  flames, 🌙 ☀️ in Relight, 🪔 on the loading screen.
- **The "why" lines read like painting instructions.** They are shown to the player on Meet cards and in the Guide:
  "A man figure (short beard, teal tunic) facing the viewer, pointing straight at the viewer". They describe the
  picture; they do not help remember the word.
- **Type:** UI text uses the system font. Arabic (Amiri Quran) and Urdu (Nastaliq) are chosen with care; the Latin UI
  is not.

### 4.5 Code (small, not urgent)

- Dead paths: `mixups`, `drillPairs`, `MIXUP_DRILL_AT`; the `emoji` field ships for every word and is only a fallback.
- `kit.options()` is deterministic by design (repeatable QA), so a word shows the same distractors in the same places
  each time inside rooms. Players learn positions.
- Pictures load lazily with no preload of the next step: pop-in on slow links.
- `today()` uses the UTC day, so "tomorrow" starts at 5 am in Pakistan and 7 pm in New York.
- No measure of learning anywhere, even a local one. The game cannot tell Khadin or the player whether words stick.

### 4.6 What is already strong (keep it)

- One calm promise, an honest meter, no streaks, nothing expires, no ads.
- 884 consistent, respectful paintings and clear respect rules.
- Verbatim Qur'an text with translator-credited full meanings.
- Pure, tested core (`srs`, `save`, `room`, `mastery`, `clock`), safe save migration, autoplay at three sizes.
- Mastery Check (each new word right twice, both directions) is the best mechanic in the game.

---

## 5. The plan

Order is by effect on players, not by ease. Each phase ends with: tests green, autoplay of touched rooms on
`127.0.0.1`, screenshots at phone, desktop and landscape, docs and memory updated. "Session" = one working session
with Claude. Items marked **K** need Khadin (a decision, a person, money or rights).

### Phase A — Find out the truth (first; about 1 session + 1 week of waiting) **K**

No change below is worth more than this.

| # | Change | Done when |
|---|---|---|
| A1 | **Watch 5–8 people play** the first 15 minutes (half Urdu, half English; phone). Write down where they stop, what they misread, what they say | Notes for each person in `docs/PLAYTEST_1.md` |
| A2 | **7-day recall check:** the same people, 30 words, one week later, no warm-up | A recall % per person |
| A3 | **Local learning report** in the Guide (no analytics, nothing leaves the device): first-try rate, words by lamp level, lapses, most-missed words | New tab; numbers come from the save only |
| A4 | Keep the three numbers as the baseline every later phase is judged against: first-room finish rate, minutes to first lamp, 7-day recall | Baseline table in this file |

### Phase B — First minute and session shape (about 3 sessions)

| # | Change | Files | Done when |
|---|---|---|---|
| B1 | **Basmala opener:** a first room of 4 words, about 15 taps, lamp and meter inside 60 seconds. Al-Fatiha: Praise then starts at 1:2 | `authoring/rooms.js`, `core/save.js` (v4 migration), tests | Fresh save: first lamp in under 60 s by autoplay clock |
| B2 | **Lamps inside rooms:** every stretch of about 40–50 taps and at most 7 new words ends with its own small lamp, meter tick and save. Uses today's rest-stop boundaries; room ids do not change | `core/taps.js`, `core/room.js`, `ui/room.js`, `core/save.js` | No stretch over 50 taps or 7 new words (test) |
| B3 | **Live meter:** the count of words known ticks up as each new word is lit, with a plain reading ("about 1 word in every 9") | `ui/room.js`, `ui/map.js`, `i18n.js` | Visible on every ayah step |
| B4 | **A real done screen:** the words just won as cards, one line tying a word to daily life, the next room's picture and word count | `ui/room.js`, `authoring/rooms.js` (hook line per room, reviewed) | Screenshot at 3 sizes |
| B5 | **Short choices on the map:** Relight, Quick Practice (8 weakest words, about 1 minute), Ayah of the Day (Phase F). The next door stays the main action | `ui/map.js`, new `ui/practice.js` | A 2-minute visit always has something to do |
| B6 | **Day starts at local 4 am**, not UTC midnight | `core/srs.js` `today()`, tests | Test with fixed time zones |

### Phase C — Real decoding: the loop the brief promised (about 4 sessions)

| # | Change | Files | Done when |
|---|---|---|---|
| C1 | **Guess first.** When a new word is built from pieces or a root the player already owns, ask "What could it mean?" before showing it. Never graded, never a wrong sound | `ui/steps/ayah.js`, `scripts/lib/pack.mjs` (mark guessable words) | Every guessable new word asks first |
| C2 | **Teachable distractors.** Each word gets a build-time list of confusable words with a reason: look-alike, same root, same group, opposite. Wrong picks show a one-line "why not" | `authoring/` (new `confusables.js`), `scripts/lib/pack.mjs`, `ui/kit.js`, all choice steps, `i18n.js` | Build fails if a taught word has fewer than 2 reasoned distractors |
| C3 | **Split it yourself.** Every word that carries `pieces` (160 today) becomes a Snap task the first time it is met: drag or tap the front piece, the core, the end piece. Snap goes from 4 steps to 160+ | `ui/steps/snap.js`, `scripts/lib/pack.mjs` (generate from `pieces`) | Snap tasks generated, not hand-written |
| C4 | **Builder and Inventor stages** from Wing 3: predict a new word from root + mould ("You know *'alima*. What could *mu'allim* mean?") | New `ui/steps/predict.js`, `authoring/rooms.js` | At least one per room in Wings 3–5 |
| C5 | **Varied order.** Options shuffle per showing (seeded from the save, so QA stays repeatable) | `ui/kit.js` | Same word, two showings, different layout |
| C6 | **Pictures-only challenge** (optional, per room): captions off for the Mastery Check, for a gold edge on the lamp | `ui/steps/mastery.js`, `core/save.js` | Off by default; nothing lost by skipping |

### Phase D — Give it a voice (about 2 sessions of build; rights first) **K**

| # | Change | Notes |
|---|---|---|
| D1 | **Decide the audio source.** Options: (a) record one qari reading the 910 words and the 294 ayat for this game (cleanest rights, costs money and a studio day); (b) license an existing word-by-word recitation set; (c) ayah-level recitation only from a source whose terms allow it. No synthetic voice for Qur'anic text | Rights check written into `RIGHTS.md` before any file ships |
| D2 | Speaker on every word card and ayah; plays on first meeting; honours YouTube audio state, pause and the Sound setting (the wiring exists in `ui/sound.js`) | Files per wing, lazy-loaded, each under 512 KiB |
| D3 | **Hear → pick** as a new question type in rooms, Mastery and Relight | Third recall direction |
| D4 | Recorded soft sounds in place of the sine beeps (page, pen, lamp), and a very quiet room tone that stops during recitation. Still no sound on a wrong answer | Needs licensed or CC0 files; adds a Sound / Recitation split in Settings |

### Phase E — Memory that works (about 3 sessions)

| # | Change | Files | Done when |
|---|---|---|---|
| E1 | **Save mix-ups** (compact, capped) and run tell-apart drills when a pair is confused twice | `core/save.js` (v4), `core/srs.js`, new `ui/steps/tellapart.js` | A confused pair comes back as a drill next session |
| E2 | **Relight: 2 modes → 6:** word→picture, picture→word, find it in an ayah, build from pieces, opposite pair, hear→pick (after D) | `ui/relight.js`, `core/srs.js` | `nextEngine` rotates through all that fit the word |
| E3 | **Warm-up in every room:** 3 due words before new ones; due words used as distractors | `ui/room.js`, `core/room.js` | Due count falls by playing rooms alone |
| E4 | **Backlog control:** above 40 due, Qalam suggests Relight first (never a lock); the session size adapts (8–20); words missed 4+ times get an extra hook card | `core/srs.js`, `ui/map.js` | Simulated 30-day play keeps due under 60 (test) |
| E5 | **Lamp Review:** practise any wing or root family at any time; only misses change a card | `ui/guide.js`, `ui/practice.js` | Reachable from the Guide's word list |
| E6 | **Every taught word in at least 2 real ayat.** A build check lists the 440 words with none; the ayah picker proposes short ayat or phrases; reviewed before shipping | `scripts/ayah-picker.mjs`, `authoring/ayat.js`, tests | Build check passes; reviewer has seen every added ayah |

### Phase F — Open the Qur'an: the feature people will show others (about 3 sessions; rights first) **K**

| # | Change | Notes |
|---|---|---|
| F1 | **Open Shelf:** any ayah where the player knows 80% or more of the words, read word by word. Grows as the meter grows | Needs glosses for word forms beyond today's 299 ayah sets → the Corpus rights question in `RIGHTS.md` must be answered first, or the set stays hand-built |
| F2 | **Page view:** a surah page with the words you know lit in gold. Start with Al-Fatiha, the last ten surahs and Ayat al-Kursi | Text verbatim from Tanzil, never rearranged; files split under 512 KiB |
| F3 | **Ayah of the Day:** one ayah picked by date from those the player can mostly read. No streak, no count of missed days | Same for every player on a day; nothing saved but "seen today" |
| F4 | **Salah shelf:** the words said in prayer, grouped, with "you say this in every rak'ah" | Phrases outside the Qur'an only with reviewer approval (memory doc §4) |

### Phase G — Story, feel and art direction (about 3 sessions; image credits) **K for credits**

| # | Change | Notes |
|---|---|---|
| G1 | **Qalam as a character:** about 12 pose paintings (pointing, writing, thinking, proud); lines that name the word, piece or rule; no generic praise, no guilt lines | Same model and style prompt as the 884 paintings |
| G2 | **Five wing scenes and an ending:** a short comic when a wing is lit; the last Reading Room ends the story | Skippable, replayable from the map |
| G3 | **A library that lights up:** one background painting per wing, dark until its rooms are lit; doors differ by room type | Map stays one scroll |
| G4 | **Layouts that use the screen:** on tablet and desktop the ayah sits on one side and the working area on the other; cards get depth and a designed pressed state | Phone layout unchanged; autoplay fit report stays clean |
| G5 | **Motion with meaning:** the meaning is written in ink under a word, the lamp flame grows, pages turn between steps. Transform and opacity only; reduced motion honoured | |
| G6 | **One visual language:** painted icons replace the remaining emoji (dock, room icons, hand, flames, loading lamp) | About 25–30 paintings |
| G7 | **A real Latin type pairing**, self-hosted, OFL, subset; two families at most | Keeps the first load under budget |
| G8 | **Rewrite the 831 "why" lines** as memory hooks ("*Rabb*: the One who raises and looks after, like the word *murabbi*") | Content work; goes through scholar review |

### Phase H — Trust (runs alongside everything) **K**

| # | Change |
|---|---|
| H1 | Scholar review of 910 meanings, 299 ayah sets, pictures, Urdu text; reviewer named in the credits |
| H2 | Close the open rights items: Tanzil link question, Yusuf Ali US status and edition, Junagarhi edition, Corpus confirmation |
| H3 | Remove the "draft" notice only when H1 is signed |

### Phase I — Reach (a decision more than a build) **K**

| # | Change | Notes |
|---|---|---|
| I1 | **Where can people play it?** Playables is invite-only and there is no invite. Options: keep waiting; or also ship a standalone web build on your own domain (the host layer is already separate in `playables-bridge.js`). A web build could carry real links, which would also satisfy the Tanzil and Corpus link requests | The Playables build keeps its no-links rule. Publishing anywhere only on your explicit request |
| I2 | **More languages:** Indonesian, Bengali, Turkish, Malay, French, Hindi / Roman Urdu. Each is 910 meanings + UI + hook lines, and each needs its own reviewer | Pipeline is already keyed by language |
| I3 | **Listing:** title and trademark screen, thumbnails, a 30-second clip ("Do you know what you say in salah?") | No fluency or scholarship claims |

### Phase J — Release gate (only on your request)

Unchanged from POLISH_PLAN Phase 6: device matrix, hosted Test Suite, release ZIP, submission.

---

## 6. Suggested order, and what each step should move

| Order | Phase | Should move | Needs Khadin |
|---|---|---|---|
| 1 | A (playtest + baseline) | Tells us which of the rest matters | Yes: 5–8 people |
| 2 | B (first minute, short lamps) | First-room finish rate, minutes to first lamp | No |
| 3 | E1–E5 (memory) + C1, C2, C5 | 7-day recall | No |
| 4 | C3, C4 (decoding) | Depth; players who reach Wing 3 | No |
| 5 | G4–G6, G8 (feel) | First impression; share-worthiness | Credits for about 40 paintings |
| 6 | D (voice) | Recall, and the "this is my prayer" moment | Yes: audio source and rights |
| 7 | F (Open the Qur'an) | Reasons to return after the last room | Yes: rights answer |
| 8 | G1–G3 (story) | Attachment | Credits |
| 9 | H, I | Whether anyone can play and trust it | Yes |

Rough size: Phases B, C, E and G4–G8 are about 13 working sessions with no outside dependency. D, F, H and I wait on
decisions, people or rights.

## 7. Honest limits of this audit

- No player data exists. Scores in §3 are a reviewer's judgement of the build.
- "100x" is a direction, not a forecast. The baseline in A4 is what makes any later claim checkable.
- The full autoplay started on 2026-11-17 had passed room 10 of 64 at three screen sizes with no errors when this file
  was written; its final result is not in this file.
- The "440 words never in an ayah" count is by word id inside Ayah Light-Up steps; Reading Room passages and "given"
  tiles are not counted.
- Phases D and F touch Qur'an recitation and more Qur'an text: both need the rights answers and the reviewer first.
