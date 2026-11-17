# YouTube Playables certification evidence

- Game: Qalam: Word by Word (placeholder title, PLAN §10.7)
- Build/version: content pack v1, 64 rooms (Al-Fatiha split in two 2026-11-06; save v3), 910 words, meter 85.5% (`game/`, no build step)
- Bundle fingerprint: SHA-256 over the sorted file hashes of `game/` = `b0c633114e10e8ad…` (2026-11-05)
- Evidence date: 2026-11-05
- Reviewer: Claude (audit) + an independent certification-review agent (read-only)
- Official requirements last checked: 2026-11-05 (`check_docs.py`: 29 pages; integration, monetization, privacy, stability, trust and safety and revision-history pages marked changed on 2026-10-26; the plugin checklist reflects the 2026-10-16 monetization rewrite)

## Decision

- Release status: **`NOT_READY`**
- Blocking failures: D8 scholar sign-off not done; rights review of art and glosses; device matrix and hosted Test Suite not run. (INT-21, I18N-02, DES-16, DES-07/08 and INT-02/04 fixed in Polish Phase 1, 2026-11-05.)
- Accepted risks: none yet. DES-20: map icons moved to a labelled bottom dock; room back button stays top-left but now reads "◀ Map" (text label), left for the reviewer to judge.

## Requirement evidence

| ID | Requirement | Status | Device/viewport | Reproduction | Evidence | Source date |
|---|---|---|---|---|---|---|
| INT-01 | SDK before game code | PASS_STATIC | — | `index.html` script order | `game/index.html:8` | 2026-06-16 |
| INT-02 | firstFrameReady on a loading screen that says so | PASS_RUNTIME | desktop | loading screen shows lamp + "Loading…" in EN and UR; `firstFrameReady()` after the next paint | `game/main.js` `loadingScreen()`, `boot()` | 2026-06-16 |
| INT-03/04 | gameReady only when interactable | PASS_RUNTIME | desktop | pack.json blocked: error text in EN and UR + focused Retry, `gameReady()` called; Retry recovers to the map | `game/main.js` `bootError()`, `start()` | 2026-06-16 |
| DES-07/08 | no doubled or ignored input | PASS_RUNTIME | desktop | real double-click in Picture Match advances exactly one item; stage is `inert` after each right answer until the next item | `ui/room.js` ctx `hit()/item()/target()`, `ui/relight.js` `answered` | 2026-03-04 |
| INT-07/09 | save after progress; load before save | PASS_STATIC | — | bridge gates saves on `loadSettled` | `game/playables-bridge.js:43-65` | 2026-06-16 |
| INT-10 | older saves parse | PASS_STATIC | — | `parseSave` + tests | `game/core/save.js`, `tests/m1.test.mjs` | 2026-06-16 |
| INT-12/23 | autosave at milestones; save on pause | PASS_RUNTIME | desktop, 1280×360 | place saved every 3 steps, at rest stops, on pause and on leaving; leave at step 9, reload, room resumes at step 10 | `game/core/save.js` `at`, `ui/room.js` checkpoint, `main.js` `enterRoom` | 2026-06-16 |
| INT-13–17 | audio rules | PASS_RUNTIME | desktop | Optional sound effects (Web Audio, no files). Browser check with a counting AudioContext: notes play on right answers; `onAudioEnabledChange(false)` suspends the context and no notes play; YouTube pause suspends it; Settings → Sound off silences it | `ui/sound.js`, `main.js` boot, `ui/pause.js` | 2026-11-05 |
| INT-21 | pause stops everything | PASS_RUNTIME | desktop | while paused a real click is ignored and a pending wait stays frozen through 2 s, then finishes after resume; tests cover the clock | `core/clock.js`, `ui/pause.js`, `tests/clock.test.mjs` | 2026-06-16 |
| INT-22 | no Page Visibility API | PASS_STATIC | — | grep: none | — | 2026-06-16 |
| I18N-02 | no `navigator.language` | PASS_STATIC | — | static audit 0 FAIL; no-SDK fallback is `"en"` | `game/playables-bridge.js` `getLanguage()` | 2026-06-16 |
| I18N-03 | English supported | PASS_RUNTIME | desktop | default language | — | 2026-06-16 |
| DES-01/04 | 9:32–32:9, state kept on resize | PASS_RUNTIME | 360×1280, 1280×360, 320×320 | map + ayah step screenshots | browser check 2026-11-05 | 2026-03-04 |
| DES-05/06 | touch and mouse | PASS_STATIC | — | all actions are `<button>`; tooltips long-press | `game/ui/tips.js` | 2026-03-04 |
| DES-09/10 | keyboard; Esc closes dialogs | PASS_RUNTIME | desktop | real keys: Tab to doors, Enter opens Settings (focus inside, map inert), Esc closes and returns focus; Enter/1–4 answer an ayah word | `game/ui/keys.js`, `ui/settings.js`, `ui/guide.js` | 2026-03-04 |
| DES-16 | end of content communicated | PASS_RUNTIME | desktop, 320×320, 375×812 | all-done save: end plaque on the path + "Every room is lit." bubble, EN and UR | `game/ui/map.js` `allDone` | 2026-03-04 |
| DES-17–19, 21 | no share, links, agreements, quit | PASS_STATIC | — | grep + screens | — | 2026-03-04 |
| DES-20 | no icons confusable with YouTube's | MANUAL_REVIEW | desktop, 375×812 | map: Guide and Settings in a labelled bottom dock; rooms: "◀ Map" and "👆 Show me" are labelled | `ui/map.js` dock, `ui/room.js` header | 2026-03-04 |
| PRV-02 | no external calls | PASS_RUNTIME | desktop | resource list: only `youtube.com/game_api/v1` | browser check 2026-11-05 | 2026-06-15 |
| PRV-04–07 | no QR, clipboard, personal data, login | PASS_STATIC | — | grep + screens | — | 2026-06-15 |
| PERF-01/02 | transfer before gameReady | PASS_RUNTIME | desktop | 823 KB raw (≈ 0.3 MiB gzipped) | resource timing | 2026-06-16 |
| PERF-06 | files < 512 KiB | PASS_STATIC | — | pack split by wing (`core/content.js`): largest file `content/pack.json` 251 KB; wing files 37–149 KB; test fails any content file ≥ 512 KiB. Wing fetched on first room of that wing; blocked fetch shows a message and the next tap retries (browser-checked) | static audit, `tests/session.test.mjs` | 2026-11-05 |
| PERF-07/08 | save size | PASS_RUNTIME | — | finished save 27.8 KB | browser check | 2026-06-16 |
| PERF-09 | interactive < 5 s | PASS_RUNTIME | desktop, local | map at 0.74 s | browser check | 2026-06-16 |
| PERF-11 | heap ≤ 512 MB | PASS_RUNTIME | desktop | 7 MB | `performance.memory` | 2026-06-16 |
| PERF-14/15 | browsers and YouTube apps | UNVERIFIED | — | — | — | 2026-06-16 |
| PERF-16–19 | relative paths, ASCII names, ≤ 8000 files | PASS_STATIC | — | 923 files | static audit | 2026-06-16 |
| TRUST-02/03 | general 13+ | MANUAL_REVIEW | — | design is 13+; listing not written | — | 2026-08-26 |
| TRUST-06/08 | rights cleared | UNVERIFIED | — | rights ledger missing | POLISH_PLAN 4.2 | 2026-08-26 |
| A11Y-01 | WCAG AA best effort | MANUAL_REVIEW | desktop, 390×844 | Esc, dialog focus, keyboard play and AA contrast done (Phase 3); not every step type contrast-scanned | `ui/keys.js`, `styles.css` | 2026-08-26 |

## Bundle and performance

| Metric | Required | Recommended | Measured | Method | Status |
|---|---:|---:|---:|---|---|
| Initial transfer through `gameReady()` | <30 MiB | <15 MiB | 823 KB raw, ≈ 0.3 MiB gzipped | resource timing, local server | PASS_RUNTIME |
| Total hosted bundle | <250 MiB | minimal | 12.4 MiB | static audit | PASS_STATIC |
| Largest individual file | <30 MiB | <512 KiB | 251 KB (`content/pack.json`) | static audit | PASS_STATIC |
| Serialized save | <3 MiB | <500 KiB | 27.8 KB (all rooms) | localStorage size | PASS_RUNTIME |
| Peak JS heap | ≤512 MB | lower | 7 MB on map | `performance.memory` | PASS_RUNTIME |
| Interactable time | — | <5 s | 0.74 s local | `performance.now()` at map | PASS_RUNTIME |

## Platform matrix

| Surface | Version/device | Result |
|---|---|---|
| Desktop web (Chromium, app browser) | 2026-11-05 | PASS_RUNTIME (all 63 rooms autoplayed this week) |
| Mobile web | — | UNVERIFIED |
| YouTube Android | — | PORTAL_REQUIRED |
| YouTube iOS | — | PORTAL_REQUIRED |

## Manual review

- Rights ledger complete: no (POLISH_PLAN 4.2)
- Originality/duplicate comparison: not done
- General 13+ audience confirmed: by design; listing pending
- Metadata and thumbnails match build: not written
- Accessibility tags accurate: not chosen
- No personal data, login, analytics, external services, QR or links: yes
- No extra agreements, share prompts, duplicate YouTube controls or quit button: yes, except the DES-20 corner-icon risk
- Completion, tutorial, pause and error states: completion and pause fail (above)

## Hosted Test Suite

PORTAL_REQUIRED. Not run.

## Remaining unverified items

- Real devices (Android, iOS, Safari, Firefox), the Hosted Test Suite, ingested-build transfer size.
- Scholar sign-off on all meanings, pictures and translations (PLAN D8). Full-ayah translations are now Abdullah Yusuf Ali (EN) and Maulana Muhammad Junagarhi (UR), credited in Settings; US copyright status of Yusuf Ali and the editions of both Tanzil files are still open (docs/RIGHTS.md).
