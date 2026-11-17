# Qalam: Word by Word: audit and polish plan

Audit date: 2026-11-05. Build audited: `game/` (63 rooms, 910 words, meter 85.5%, pack v1, 923 files).
Method: static Playables auditor, the Playables certification checklist (official pages re-checked 2026-11-05),
runtime checks in the browser (9:32, 32:9, 1:1 small, desktop), code reading, content statistics,
and an independent certification reviewer (findings merged in §3).

---

## 1. The guidelines this plan follows

Every item in §4 cites one of these. The IDs are the plugin's local labels for the official requirement pages
(`certification-requirements.md`); MUST = publishing requirement, SHOULD = recommendation.

### 1a. YouTube Playables requirements that apply to this game

| ID | Rule | Where the game stands |
|---|---|---|
| INT-01 | Load the SDK before all game code | Pass: `index.html` loads `game_api/v1` first |
| INT-02 | `firstFrameReady()` on a loading screen that says it is loading | **Gap:** the loading screen is a lone lamp with no text (`main.js:75`) |
| INT-03/04 | `gameReady()` only when interactable | Pass on success; **fail on error:** a failed boot shows ⚠️ only and never calls `gameReady()`, so YouTube's spinner stays forever (`main.js:89-92`) |
| INT-07/09 | Save after progress; `loadData()` must finish before any `saveData()` | Pass: bridge blocks saves until load settles |
| INT-10/11 | Read older saves without crashing; keep progress across versions | Pass: `parseSave` migrates and blocks unknown versions |
| INT-12/23 | Autosave at milestones; save when paused (exit flush ≤ 64 KiB) | **Gap:** saves only when a room ends; nothing saved mid-room or on pause |
| INT-13–17 | Respect YouTube and system audio | Pass by default: the game has no sound yet |
| INT-21 | After `onPause()` stop loop, timers, input, rendering until `onResume()` | **Fail:** only CSS animations pause; taps and timers keep working (shown in the browser) |
| INT-22 | No Page Visibility API | Pass |
| I18N-02 | Never use `navigator.language` | **Fail (static audit):** fallback in `playables-bridge.js` getLanguage |
| I18N-03 | Support English | Pass (English and Urdu) |
| SDK ref. | Don't keep the language choice in cloud save | **Gap:** `save.js:59` saves `settings.lang`, and Settings has no "match YouTube" option, so one tap overrides the YouTube language for good |
| DES-07/08 | No ignored or doubled input; no interaction errors | **Fail:** in Picture Match, Place & Point and Relight a second tap on the right answer during its 0.6 s glow skips the next word (Relight grades the card twice) (`ui/steps/match.js:17-21`, `ui/steps/point.js:28-34`, `ui/relight.js:73-92`) |
| DES-01/02/04 | Playable at 9:32 to 32:9, fills or letterboxes, keeps state on resize | Pass, with cramped small-height layouts (§3) |
| DES-05/06 | Every action by touch and by mouse | Pass: all actions are buttons; tooltips have long-press |
| DES-09/10 | Keyboard input; Esc closes dialogs | **Gap:** no key handling; Esc does nothing in Settings or the Picture Guide |
| DES-13 | Crisp text and pictures at every size | Pass (vector UI, paintings scaled down) |
| DES-16 | Say clearly when no content remains | **Fail:** after the last room the map shows only a lamp icon |
| DES-17–21 | No share prompts, links, extra agreements, quit button, icons that look like YouTube's | Mostly pass. **Review risk:** ⚙️ and 🗂️ sit in the top-right corner and ◀ back sits in the top-left corner of rooms, Relight and the Guide, where YouTube draws its own controls |
| PRV-02/06/07 | No external calls, personal data or login | Pass: the only outside request is the SDK |
| PERF-01/02 | Download before `gameReady()` < 30 MiB, aim < 15 MiB | Pass: ≈ 0.3 MiB compressed (823 KB raw) |
| PERF-06 | Each file < 512 KiB | **Gap:** `content/pack.json` is 651 KiB (156 KiB gzipped) |
| PERF-07/08 | Save < 3 MiB, aim < 500 KiB | Pass: 27.8 KB with every room done |
| PERF-09 | Interactive within 5 s | Pass: map at 0.74 s locally |
| PERF-11 | Heap ≤ 512 MB | Pass: 7 MB on the map |
| PERF-16–19 | Relative paths, ASCII filenames, ≤ 8000 files | Pass: 923 files, all ASCII |
| TRUST-02/03 | General 13+, not made for kids | Pass in design; check the listing wording |
| TRUST-06/08 | Every asset owned or licensed | **Open:** rights ledger not written (§4, Phase 4) |
| A11Y-01 | Best effort toward WCAG AA | Partial: focus, Esc and dialog focus missing |

### 1b. Studio rules (CLAUDE.md, set by Khadin)

- 13+ general audience; never collect age or personal data.
- One player promise, one core loop: decode real ayat word by word (PLAN D1). No minigame anthology.
- Story with a named companion (Qalam the pen); hint ladder shows the answer only on the second request.
- About 5th-grade copy; untimed by default; free retries.
- "Addictive" means depth and fair mastery: no punishing streaks, fake urgency, loot boxes or paid retries.
- No off-platform purchases, links, QR codes, login, analytics or third-party calls.
- Portal uploads, certification and publishing only when Khadin asks.

### 1c. Respect rules for this game (PLAN §7 and the art rules)

- Qur'anic text is verbatim and read-only; never cut into a puzzle or animated destructively.
- No pictures of Allah, prophets, angels, Companions, jinn or Shaytan. Names of Allah are medallions; prophets, angels and books are name scrolls; Shaytan and jinn words are plain ink.
- Verbs usually done by Allah, and words for wrongdoers, are pictured only as objects or animals.
- People are faceless and modest; women wear a headscarf; men and women never touch. No church or European motifs, no Latin letters in pictures.
- No fail sound or "wrong" effect on an ayah; mistakes show only on the meaning chips.
- Every gloss, explanation and ayah choice needs a qualified reviewer's sign-off before release (D8).

### 1d. Design-quality rules (web rules in Khadin's setup)

- Clear hierarchy, intentional spacing, designed hover/focus/active states, semantic colour.
- Motion on transform and opacity only; honour reduced motion (already done).
- Test at 320, 375, 768, 1024, 1440; keyboard navigation; contrast.

---

## 2. Scores

| Area | Score | Why |
|---|---|---|
| Core loop and learning design | 5/5 | One decode loop, 9 picture games feeding it, spaced review, honest meter, booklet fully covered |
| Content completeness | 5/5 | 910 words, 299 ayah gloss sets, every booklet page, 5 Reading Rooms |
| Content accuracy | 2/5 | All meanings, pictures and translations are drafts until a scholar signs off (D8) |
| Visual polish | 4/5 | 882 consistent paintings, warm library theme; small-height layouts and the stale wing banner need work |
| Onboarding and flow | 4/5 | 3-panel intro, Qalam hints, door states; long rooms (up to 112 taps) and no mid-room save |
| Player experience over weeks | 3/5 | Relight capped at 12 per session, but the map shows the whole backlog (e.g. "242"); no ending; no badges or Notebook milestones yet |
| Audio | 1/5 | None. PLAN D7 promises soft SFX; recitation audio needs a licensed source |
| Accessibility | 3/5 | Buttons, aria labels, reduced motion; no Esc, no dialog focus, tooltip-only explanations on desktop |
| Platform compliance | 2/5 | Strong save and load-order wiring; MUST gaps in pause, language API, end-of-content, loading text and boot errors; corner-control review risk |
| Code and tests | 3/5 | Small modules, pure core, 45 tests incl. content validators; double-tap bug in 3 games; no automated browser playthrough |
| **Total** | **32/50** | |

---

## 3. Findings

### Must fix before any Playables submission

1. **Pause does not stop the game** (INT-21). `main.js:78` only adds `body.paused`; CSS animations stop, but taps, `setTimeout` hints (`ui/room.js:89, 107`), tooltip timers (`ui/tips.js:157–170`) and `wait()` pauses keep running. In the browser, a door opened while "paused".
2. **`navigator.language` in the bridge** (I18N-02, static audit FAIL). `playables-bridge.js:89` falls back to it outside the SDK. Return `"en"` instead.
3. **No end-of-content message** (DES-16). With every room done, the map bubble shows only a lamp. Needs a clear "every lamp in the Library is lit" state that points to Relight.
4. **Corner controls** (DES-20, review risk). ⚙️ Settings and 🗂️ Picture Guide sit in the top-right corner of the map header, and ◀ back sits in the top-left corner of rooms, Relight and the Guide (`ui/room.js:65`, `ui/relight.js:35`, `ui/guide.js:88`). YouTube draws its own controls in both corners.
5. **Double taps skip words** (DES-07/08). The right answer stays live for 0.6 s after it is chosen. A second tap in Picture Match or Place & Point skips the next item unrecorded; in Relight it grades the card twice and skips a due card. Fix with a busy flag on every step (Snap, Mould Press and Verb Partners already lock).
6. **Boot errors trap the player** (INT-04, DES-08, PERF-10). If the content or save fails to load, the screen shows ⚠️ with no words and no retry, and `gameReady()` is never called. `main.js:82` also does not check that the pack downloaded. Show a plain message with a Retry button, then call `gameReady()`.
7. **The loading screen doesn't say "loading"** (INT-02). It is a lone lamp hidden from screen readers. Add a short "Loading…" line (EN and UR) and call `firstFrameReady()` after it is painted.

### Should fix (player experience)

- **Language choice is saved for good** (SDK reference). Keep the EN/UR choice for the session only, or add "Match YouTube" as the default option.
- **The "saving is off" warning never shows.** `main.js:97` adds it, then the intro or map replaces the screen. Put it on `document.body`.
- **Tanzil notice.** Tanzil's terms ask for their copyright notice in files that contain the text. Ship it as a text file next to the fonts' licences.

8. **No save mid-room or on pause** (INT-12, INT-23). Leaving a 100-tap room at 90% restarts it. Save a room checkpoint (step index plus cards met) on pause and every few steps.
9. **Room length.** Average 60 interactions; the longest are grown-forms-7 (112), review-lost-found (99), doing-words-3 and grown-forms-3 (93). The plan targets about 5 minutes. Split rooms over about 80 interactions, or add a mid-room "lamp lit" checkpoint.
10. **Backlog anxiety.** The map shows the full due count (242 on a finished save) although Relight serves 12 at a time. Show "12 for today" and the total only in the Picture Guide.
11. **Wing banner is always "Entrance Hall"** (`ui/map.js`: the `hall-banner` is fixed text). Show the wing the player is scrolled into.
12. **Small-height layouts.** At 320×320 the Relight bar covers about 40% of the map; at 1280×360 the room stage overflows by 5 px. Collapse the Qalam bubble into the Relight button below about 420 px height.
13. **Keyboard and dialogs** (DES-09/10, A11Y-01). Esc should close Settings, the Picture Guide and tooltips; focus should move into a dialog and return after; number keys 1–4 could pick answer chips.
14. **`pack.json` over 512 KiB** (PERF-06). Split it by wing (Wing 1 loads at boot, the rest on demand), or drop data only the tests need.
15. **Credits incomplete** (PLAN §6). Credits list the Tanzil text and fonts, but not the morphology source (Quranic Arabic Corpus, used at build time), how the paintings were made, or the reviewer.

### Polish (depth and delight)

16. **Sound.** Soft, optional SFX (lamp lit, chip right, page turn) gated by `isAudioEnabled()`; never on a wrong answer over an ayah. Recitation audio only from a licensed source (PLAN §4).
17. **Milestones.** The brief promises badges ("Al-Fatiha understood", "50% coverage", "Ayat al-Kursi Reading Room") and a Notebook. Add one-time, non-punishing milestone cards at wing ends and Reading Rooms.
18. **Reading Room re-reads** (MEMORY_SYSTEM §4). Let finished Reading Rooms be re-read from the map, showing which words have faded.
19. **One-word ayah duplicate.** In 103:1 the word gloss and the sentence line say the same thing ("By the time!"); hide the sentence line when it repeats the gloss.
20. **Automated browser playthrough.** The playthroughs done by hand this week should become a script (`scripts/autoplay.mjs`) that plays every room at 3 viewports and fails on console errors.

---

## 4. Plan

Each phase ends with: tests green, an autoplay of the touched rooms on `127.0.0.1` (never the localhost save), screenshots at 9:32, 1:1 and 32:9, and a docs/memory update.

### Phase 1: Certification blockers (about 1 session) — DONE 2026-11-05

Built: `core/clock.js` (one pausable clock for every delay: `later()`, `wait()`, `setPaused()`), `ui/pause.js` (pause sets `#app.inert`, hides tips, saves; resume undoes it), an `inert` answer lock in `ui/room.js` (`ctx.hit()` locks the stage until the next item or target is drawn; `{ stay: true }` for steps that keep going), a lock flag in Relight, a labelled bottom dock on the map (Guide, Settings; Relight floats above it), labelled ◀ Map and 👆 Show me buttons, an end plaque plus "Every room is lit." bubble, loading and boot-error screens in both languages with Retry, and a session-only language choice (saves always write `"auto"`). Checks: 48 tests, static audit 0 FAIL, browser checks for every row below, and a 9-room autoplay covering every step type (all done, no console errors).


| # | Change | Files | Done when |
|---|---|---|---|
| 1.1 | Pause gate: a `paused` flag in the bridge; a full-screen, input-blocking pause layer; `wait()` and hint timers hold until resume | `playables-bridge.js`, `main.js`, `ui/kit.js`, `ui/room.js`, `ui/tips.js`, `styles.css` | A tap during pause does nothing; a hint never fires during pause; a test simulates pause/resume |
| 1.2 | Language fallback returns `"en"` | `playables-bridge.js` | Static audit shows no FAIL |
| 1.3 | End-of-content state on the map and after the last Reading Room | `ui/map.js`, `i18n.js` | All-done save shows the message in EN and UR |
| 1.4 | Move ⚙️, 🗂️ and ◀ out of the screen corners (a labelled bottom bar on the map; back as a labelled button below the room header) | `ui/map.js`, `ui/room.js`, `ui/relight.js`, `ui/guide.js`, `styles.css` | No icon-only control in either top corner |
| 1.5 | Busy lock on every answer step: ignore taps until the next item is drawn | `ui/steps/match.js`, `ui/steps/point.js`, `ui/relight.js` + a sweep of the other steps | A test double-taps each step and no item is skipped or graded twice |
| 1.6 | Boot error screen with text and Retry; check `packRes.ok`; call `gameReady()` on the error screen | `main.js`, `i18n.js` | Block `pack.json` in the browser: message + Retry shows, Retry recovers |
| 1.7 | "Loading…" text on the loading screen; `firstFrameReady()` after paint | `main.js`, `i18n.js` | Loading text visible in EN and UR |
| 1.8 | Language: keep the choice for the session (or default "Match YouTube"); show the "saving is off" warning on `body` | `core/save.js`, `ui/settings.js`, `main.js` | YouTube language change is followed after reload |

### Phase 2: Session flow (about 2 sessions) — DONE 2026-11-05

Built: save schema v2 (`at`: room, step, step count, results, newly met words; v1 saves load with none; a checkpoint whose room changed its step count, or a finished room, is dropped). The room ahead keeps its place after every step and sends it to the cloud every 3 steps, at rest stops, on pause and on leaving; a replayed room never overwrites it. Resuming skips the stakes card and Qalam says "Welcome back!". `core/taps.js` counts taps per step (matches autoplay counts exactly: average room 120 taps, longest 225).
2.2 decision: instead of splitting rooms (which would move room ids, the meter and many tests), long rooms get automatic **rest stops** at step boundaries: a part-lit lamp card with ▶, place saved. 29 rooms get one; no stretch passes 118 taps (test caps it at REST_EVERY + 10). Map Relight shows at most 12 (`RELIGHT_CAP`); the Picture Guide shows the full count. The wing banner follows scroll. Under 420 px tall the map folds Qalam's line and puts Relight in the dock row; short wide screens lay the stakes, rest and done cards across. Mastery also got a one-answer guard. Checks: 53 tests, audit 0 FAIL, browser: rest stop → leave at step 9 → reload → resume at step 10 → finish clears the checkpoint; 7-room autoplay at 375×812 clean; 320×320 and 1280×360 checked.


| # | Change | Files | Done when |
|---|---|---|---|
| 2.1 | Room checkpoint saved on pause and every 3 steps; resume where the player left | `core/save.js` (schema v+1 with migration), `ui/room.js`, `main.js` | Leaving at step 9 of 14 resumes at step 9; old saves load |
| 2.2 | Split the 6 longest rooms (or add a mid-room lamp) so no room passes about 80 interactions | `authoring/rooms.js`, tests | Content test caps interactions per room |
| 2.3 | "12 for today" on the map; full backlog only in the Guide | `ui/map.js`, `i18n.js` | Finished save shows 12, not 242 |
| 2.4 | Wing banner follows scroll | `ui/map.js` | Scrolled into Wing 5 shows "Great Dome" |
| 2.5 | Short-screen layout | `styles.css` | 320×320 and 1280×360 show the next door and Relight without overlap |

### Phase 3: Accessibility and keyboard (about 1 session) — DONE 2026-11-05

Built `ui/keys.js`: Esc hides a tooltip, else closes Settings or the Picture Guide (never `preventDefault`); keys 1–9 pick the numbered answer buttons (number badges appear on `.choice` buttons once the keyboard is used); Enter with nothing focused presses ▶; after each answer keyboard focus moves to the next control still waiting (`keepFocus`, also in Relight). Settings is a real modal: the screen behind is `inert`, focus goes in and comes back. Map focus returns to the next door or the dock button just used. Contrast: new `--lamp-ink` (#8a5f12) for gold text (ayah numbers, stakes, counts); faded word cards dim only their picture. Browser checks with real key presses (Tab, Enter, Esc, 1); a contrast scan found no AA misses on map, Guide (both tabs), Settings, Relight and an ayah step in EN and UR (not every step type scanned).


| # | Change | Files | Done when |
|---|---|---|---|
| 3.1 | Esc closes Settings, Guide and tooltips (never `preventDefault` on Esc) | `ui/settings.js`, `ui/guide.js`, `ui/tips.js` | Esc test passes |
| 3.2 | Dialog focus in and back; visible focus ring on doors and chips | same + `styles.css` | Tab order walks the map; focus never lost |
| 3.3 | Keys 1–4 pick answer chips; Enter on ▶ | `ui/kit.js` | Whole room playable by keyboard |
| 3.4 | Contrast check of captions, Urdu text and disabled states | `styles.css` | AA on all text |

### Phase B: Beginner friendliness (Khadin's request, 2026-11-05)

A first-time playthrough at 390×844 found that every screen was picture-only, so a beginner never learnt what to do: the intro had no goal, the "Tap the first word" bubble vanished before the first word appeared, a Snap or Point step gave no clue, phones showed no room progress, and the map line was icons only (✒️👉👆).

Done 2026-11-05:
- What-to-do line under every room header (`.howto`), one per step type plus stakes, rest, Mastery, done and Relight, in EN and UR (~5th-grade wording); a test makes sure every step type in the pack has one.
- Every wrong tap swaps in "Not quite. Try again, or tap Show me for help." for 3 s (`kit.wobble` fires `qw-wrong`).
- Intro: Qalam, a title ("Learn the words of the Qur'an, one picture at a time"), the goal in one line, and an English / اردو choice before the comic.
- ▶ buttons read "▶ Start" / "▶ Next" (label from `aria-label`); the stakes card says Start.
- Map line: "Next room: Near & Far · Tap the glowing door to go in."
- Phone progress bar under the room header (step dots are hidden under 420 px).
- Urdu: back arrow points the reading way; Nastaliq line heights; `[hidden]` always wins over a class display.
- Tried and reverted: centring steps vertically (flex) shrank answer grids.

Next ideas (not done):
| # | Idea | Why |
|---|---|---|
| B1 | ~~Lighter first room~~ **done 2026-11-06**: Al-Fatiha is two rooms, "Al-Fatiha: Praise" (verses 1–4, 13 words, 66 taps) and "Al-Fatiha: Guidance" (verses 5–7, 17 words, 74 taps), where it was one room of 30 words and 137 taps. Neither needs a rest stop. The "Al-Fatiha understood" card now shows after the second. Save v3: an older save with Al-Fatiha finished counts both rooms as finished. 64 rooms; meter 4.1% after the first, 11.8% after the second (the same as before) | heavy first session |
| B2 | ~~Replace emoji spots in Point~~ **done 2026-11-06**: two new paintings (`ui:spot-book`, `ui:spot-tree`, GPT Image 2.5, same style prompt); the group, man and woman reuse the `w:humu` / `w:huwa` / `w:hiya` paintings; the pointer is the `ui:qalam` painting. Spots name their painting (`art`), and the build fails if one is missing. 884 paintings in all | mixed visual style next to painted cards |
| B3 | ~~"How to play" page~~ **done 2026-11-05**: Picture Guide opens on a How to play tab: 7 rule cards and every game by name with its what-to-do line (test checks every step type has both) | one place to re-read the rules |
| B4 | ~~Celebration + first-Relight explainer~~ **done 2026-11-05**: ✓ with six gold sparks over the right answer (`kit.sparkle`), the strip glows green; Relight's first visit explains itself (save `seen: ["relight"]`) | feedback and the review habit |
| B5 | ~~Hide Relight (0)~~ **done 2026-11-05**: the Relight button shows only while words are due | a disabled button with 0 confuses new players |

### Phase 4: Content and rights (runs alongside, needs Khadin and the reviewer)

| # | Change | Who | Done when |
|---|---|---|---|
| 4.1 | Scholar review through the review pack; apply every ✎ mark | Reviewer, then Claude | All 1,261 items marked; fixes rebuilt and republished |
| 4.2 | **Done 2026-11-05 (Claude side; Khadin to confirm)** Rights ledger: Tanzil (their terms: verbatim text, source named, copyright notice shipped), Quranic Arabic Corpus (licence check, used at build time), fonts (OFL), paintings (image-tool terms) | Claude drafts, Khadin confirms | `docs/RIGHTS.md` complete; Tanzil notice file in the bundle; credits updated |
| 4.3 | Decide PLAN §10: platform (Playgama first?), reviewer, translation source, title/trademark | Khadin | Decisions written into PLAN §10 |
| 4.4 | **Done 2026-11-05** Trim `pack.json` under 512 KiB: `core/content.js` splits it into `pack.json` (words + room headers, 251 KB) and `wing-1…5.json` (room steps, 37–149 KB), fetched when a room of that wing first opens (next room's wing prefetched at boot; a failed fetch says so and retries on the next tap) | Claude | Static audit has no size warning ✓ |

### Phase 5: Depth and delight (after Phases 1–3)

| # | Change | Files |
|---|---|---|
| 5.1 | **Done 2026-11-05** Soft optional sounds made in code (Web Audio, no files): right answer, card flip, room lit, milestone; never on a wrong answer. Silent when YouTube turns audio off, while paused, or with Settings → Sound off (saved) | `ui/sound.js`, `ui/settings.js`, `ui/pause.js` |
| 5.2 | **Done 2026-11-05** One-time milestone cards: Al-Fatiha understood, each wing complete (names its Reading Room passage), 50% / 75% / 85% of the Qur'an's words. Only what the finished room reached; saved as `seen` `m:<id>`; the room is saved before the card shows | `core/milestones.js`, `ui/milestone.js`, `main.js` |
| 5.3 | **Done 2026-11-05** A finished Reading Room's door opens straight on its passage: words due for Relight have a grey dashed edge and faint letters; the end line counts them ("3 words are fading. Relight brings them back."). No Mastery Check, nothing graded or saved | `ui/room.js` `reread`, `ui/steps/passage.js`, `main.js` |
| 5.4 | **Done 2026-11-05** Lone Meet card centred (`.meet-grid.one`). The 103:1 repeat went away with the scholars' translations (the line is now the translator's, not our gloss) | `ui/steps/passage.js`, `styles.css` |
| 5.5 | **Done 2026-11-05** `scripts/autoplay.py` (Python Playwright + installed Chrome): fresh save, every room, phone 390×844 / desktop 1280×800 / short-wide 844×390 at once; fails on console or page errors, HTTP errors, stuck screens; lists milestones met and every screen that does not fit (`--fit-shots` saves pictures) | `scripts/autoplay.py` |

### Phase F: Fit to screen (Khadin's request, 2026-11-05: "the things fit on the screen on mobile and on the desktop")

- `ui/fit.js` `keepFitted(el)`: when a screen's content is taller or wider than its box, CSS zoom shrinks it (binary search) until it fits; floor 70% (60% under 480 px tall), below that it scrolls. Within one step it only shrinks; a new step, a resize, a picture or a font finishing loading fits again. Used on the room stage, Relight, the intro and milestone cards.
- Reading Rooms are split into pages that fit, measured with every line read (meanings and translation showing); "Next page ▶" turns the page; page number under the title.
- Small screens (≤520 px wide or tall): the "word by word" recap under an ayah is hidden when captions are on (each card already shows its meaning; the translation stays); smaller card pictures and tighter Arabic lines; thinner room header under 420 px tall.
- The Show me hand moved to the screen layer (it used to stretch the stage by ~54 px and would miss on a zoomed stage).
- Zoomed screens also widen their capped rows (`--fz` set by fit.js: `max-width: calc(760px / var(--fz, 1))`), so smaller cards spread out instead of stacking.
- Measured by `scripts/autoplay.py` (fit report; a screen counts only if it overflows on two ticks in a row). Result 2026-11-06, all 63 rooms, no errors: **phone 390×844 and desktop 1280×800: every screen fits.** Landscape phone 844×390: still over in the Ayat al-Kursi and Al-Asr Reading Rooms (128–155 px at the 60% floor) and Six Petals (8 px). Fixed the same day (below).
- Landscape phones (≤520 px tall, 3:2 or wider): Reading Room title in a left column, finale line and ▶ share a row; on ayah steps ▶ sits beside the translation; translation box label and translator share one row, tighter spacing; Six Petals flower `min(280px, 62vh)`. The translation box widens with the zoom on every screen (`max-width: calc(640px / var(--fz, 1))`). Re-run 2026-11-06, landscape 844×390, all 63 rooms: **every screen fits**, no errors, all 9 milestones.

### Phase 6: Release candidate (only on Khadin's request)

Device matrix (Chrome, Firefox, Safari, Android, iOS), release ZIP, listing text and thumbnails (no branding),
Accessible Games Initiative tags, Hosted Test Suite, then portal submission. Evidence goes in `docs/CERT_EVIDENCE.md`.
