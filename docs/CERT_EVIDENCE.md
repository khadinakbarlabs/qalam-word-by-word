# YouTube Playables certification evidence

- Game: Qalam: Word by Word (placeholder title, PLAN §10.7)
- Build/version: content pack v1, 92 rooms in 5 wings, 934 words, meter 85.5%, save schema v6 (`game/`, no build step)
- Bundle fingerprint: SHA-256 over the sorted file hashes of `game/` = `7eb80b664a39894f…` (2026-11-23, working tree with audit Phases A–D and F; Phase E look-and-feel was still being edited, so this changes again)
- Evidence date: 2026-11-23
- Reviewer: Claude (audit Phase F). Static checks, the Node test suite and the headless autoplay were re-run today. **No browser measurements were taken today**: every row marked `STALE_RUNTIME` was last measured on the date in its Evidence column, on an older build, and must be measured again.
- Official requirements last checked: 2026-11-05 (`check_docs.py`: 29 pages). Not re-checked today.

## Decision

- Release status: **`NOT_READY`**
- Blocking: D8 scholar sign-off not done; rights review of art and glosses; device matrix and hosted Test Suite not run; runtime rows below need a fresh browser pass on this build.
- Accepted risks: none yet. DES-20 (map dock and room header icons) is left for the reviewer to judge.

## What was run on 2026-11-23

| Check | Command | Result |
|---|---|---|
| Static audit | `python3 -I ~/plugins/youtube-playables-builder-claude/scripts/audit_playable.py game` | `PASS_STATIC`: 972 files, 12.781 MiB raw, 0 failures, 16 warnings (all reviewed, below) |
| Unit and content tests | `node --test tests/*.test.mjs` | 214 tests, 214 pass |
| Headless autoplay, English | `python3 scripts/autoplay.py --rooms 4` | exit 0: phone 390×844, desktop 1280×800, short-wide 844×390 each finished 4 rooms (72 s), no console error, failed request or stuck screen, no fit warning |
| Headless autoplay, Urdu | `python3 scripts/autoplay.py --rooms 4 --lang ur-PK` | exit 0: the same 3 viewports finished 4 rooms. Fit warning (not an error): the ayah step runs 45–60 px past the screen in Urdu in 4 rooms (`how_ayah`); the same with the Urdu font loaded up front, so it is a layout matter for Phase E, not the lazy font |
| Boot page list | `node scripts/modulepreload.mjs --check` | up to date (72 modules) |

The 16 static warnings, all expected:

- 12 × `SRC_ABSOLUTE_URL`: text only, never fetched. The Tanzil notice (its terms require it in every file carrying the text: `TANZIL-NOTICE.txt`, `content/pack.json`, `content/wing-1…5.json`) and the two OFL font licence files.
- 3 × `SRC_NETWORK_API` (`core/content.js`, `core/net.js`, `main.js`): `fetch` of relative packaged files only (`content/*.json`).
- 1 × `SRC_LOCAL_PERSISTENCE` (`playables-bridge.js`): `localStorage` is used only when the SDK has no `loadData` (local preview). Inside Playables every save goes through `ytgame.game.saveData`.

## Requirement evidence

| ID | Requirement | Status | Reproduction | Evidence |
|---|---|---|---|---|
| INT-01 | SDK before game code | PASS_STATIC | SDK script is the first script and the first fetch of the page; a test fails if anything moves in front of it | `game/index.html:8`, `tests/boot.test.mjs` |
| INT-02 | firstFrameReady on a loading screen that says so | PASS_STATIC + autoplay | loading screen (lamp + "Loading…" in EN and UR), `firstFrameReady()` after the next paint | `game/main.js` `loadingScreen()`, `boot()` |
| INT-03/04 | gameReady only when interactable | PASS_STATIC, STALE_RUNTIME | `gameReady()` is sent from the map, the intro, or a boot-error screen with a focused Try again; last browser check 2026-11-05 | `game/main.js` `begin()`, `bootScreen()` |
| DES-07/08 | no doubled or ignored input | STALE_RUNTIME | stage is `inert` after a right answer; door lock while a room loads (Phase A) | `ui/room.js`, `core/boot.js` `createScreens`, `tests/reliability.test.mjs` |
| INT-07/09 | save after progress; load before save | PASS_STATIC | the bridge refuses `saveData` until `loadData` succeeded; a failed or unreadable load blocks saves | `game/playables-bridge.js`, `tests/reliability.test.mjs` |
| INT-10 | older saves parse | PASS_STATIC | `parseSave` migrates v1–v5 to v6; a newer save is never overwritten | `game/core/save.js`, `tests/m1.test.mjs`, `tests/reliability.test.mjs` |
| INT-12/23 | autosave at milestones; save on pause | PASS_STATIC, STALE_RUNTIME | one save queue (`core/saver.js`): room won, checkpoints, every 4 answers, on pause and on leaving a screen; failed writes retried | `game/main.js` `persist()`, `tests/reliability.test.mjs` |
| INT-13–17 | audio rules | STALE_RUNTIME | Web Audio effects only, no files; silent while YouTube audio is off or the game is paused; last browser check 2026-11-05 | `ui/sound.js`, `main.js` `boot()` |
| INT-21 | pause stops everything | PASS_STATIC, STALE_RUNTIME | game clock freezes timers and input; idle picture preloading also runs on the game clock where `requestIdleCallback` is missing | `core/clock.js`, `ui/pause.js`, `tests/clock.test.mjs` |
| INT-22 | no Page Visibility API | PASS_STATIC | static audit: none | — |
| I18N-02 | no `navigator.language` | PASS_STATIC | language comes from `getLanguage()` (2 s limit, English on no answer) or the player's saved choice | `game/playables-bridge.js`, `main.js` `playerLang` |
| I18N-03 | English supported | PASS (autoplay) | default language; Urdu also autoplayed | autoplay runs above |
| DES-01/04 | 9:32–32:9, state kept on resize | STALE_RUNTIME | autoplay today covers 390×844, 1280×800, 844×390 for the first 4 rooms; extreme ratios last checked 2026-11-05 | `ui/fit.js`, autoplay |
| DES-05/06 | touch and mouse | PASS_STATIC | all actions are `<button>`; long-press tips. Game surface now has no text selection, no long-press callout, `touch-action: manipulation` (no double-tap zoom) and `overscroll-behavior: none`; scrolling lists keep scrolling | `game/index.html` inline style, `tests/boot.test.mjs` |
| DES-09/10 | keyboard; Esc closes dialogs | STALE_RUNTIME | last real-key check 2026-11-05 | `game/ui/keys.js` |
| DES-16 | end of content communicated | STALE_RUNTIME | end plaque on the map; last check 2026-11-05 at 64 rooms | `game/ui/map.js` |
| DES-17–19, 21 | no share, links, agreements, quit | PASS_STATIC | static audit + grep | — |
| DES-20 | no icons confusable with YouTube's | MANUAL_REVIEW | icons are being repainted in Phase E; judge after it lands | `ui/icons.js` |
| PRV-02 | no external calls | PASS_STATIC | the only non-relative URL the page loads is `youtube.com/game_api/v1`; a test checks every `href`/`src` of `index.html`. Runtime resource list last checked 2026-11-05 | `tests/boot.test.mjs` |
| PRV-04–07 | no QR, clipboard, personal data, login | PASS_STATIC | static audit + grep | — |
| PERF-01/02 | transfer before gameReady | PASS_STATIC (estimate) | see the table below; not measured on a hosted build | file sizes |
| PERF-06 | files < 512 KiB | PASS_STATIC | largest file 233 KB (Urdu font), largest content file 194 KB (`content/wing-5.json`) | static audit, `tests/session.test.mjs` |
| PERF-07/08 | save size | STALE_RUNTIME | 27.8 KB for a finished save at 64 rooms (2026-06); expect about 40 KB at 92 rooms, far under 3 MiB; re-measure | — |
| PERF-09 | interactive < 5 s | STALE_RUNTIME | 0.74 s local (2026-06); re-measure with the modulepreload list | — |
| PERF-11 | heap ≤ 512 MB | STALE_RUNTIME | 7 MB on the map (2026-06) | — |
| PERF-14/15 | browsers and YouTube apps | UNVERIFIED | needs real devices | — |
| PERF-16–19 | relative paths, ASCII names, ≤ 8000 files | PASS_STATIC | 972 files | static audit |
| TRUST-02/03 | general 13+ | MANUAL_REVIEW | design is 13+; listing not written | — |
| TRUST-06/08 | rights cleared | UNVERIFIED | see `docs/RIGHTS.md` | — |
| A11Y-01 | WCAG AA best effort | MANUAL_REVIEW | contrast and sizes are being reworked in Phase E; scan again after it lands | — |

## Bundle and performance

| Metric | Required | Recommended | Measured 2026-11-23 | Method | Status |
|---|---:|---:|---:|---|---|
| Initial transfer through `gameReady()` (English) | <30 MiB | <15 MiB | about 671 KB raw, about 266 KB gzipped, plus the first screen's pictures (3 intro paintings, or the map's door pictures; about 10–20 KB each) | sum of file sizes: `index.html`, 2 stylesheets, 73 modules (341 KB raw), `content/pack.json` (168 KB), Qur'an font (61 KB) | PASS_STATIC (estimate) |
| The same in Urdu | <30 MiB | <15 MiB | the above + 233 KB (Urdu font, now fetched only when Urdu is the language) | file size | PASS_STATIC (estimate) |
| Total hosted bundle | <250 MiB | minimal | 12.781 MiB (884 pictures = 11.33 MiB) | static audit | PASS_STATIC |
| File count | ≤8000 | — | 972 | static audit | PASS_STATIC |
| Largest individual file | <30 MiB | <512 KiB | 233 KB `fonts/NotoNastaliqUrdu.woff2`; then `content/wing-5.json` 194 KB, `content/pack.json` 168 KB, `content/why.json` 151 KB | file sizes | PASS_STATIC |
| Serialized save | <3 MiB | <500 KiB | not re-measured (27.8 KB at 64 rooms) | — | STALE_RUNTIME |
| Peak JS heap | ≤512 MB | lower | not re-measured (7 MB) | — | STALE_RUNTIME |
| Interactable time | — | <5 s | not re-measured (0.74 s local) | — | STALE_RUNTIME |

Speed changes in Phase F (2026-11-23):

- `index.html` lists every module of `main.js`'s import graph as `<link rel="modulepreload">` (72 links, written by `scripts/modulepreload.mjs`, checked by a test), so the modules load together and not one import level at a time.
- The Qur'an font is preloaded; the Urdu font is fetched only once Urdu is the game's language (from YouTube or the player's choice). The fit pass runs again when a late font arrives.
- After a room's file is in, its pictures are fetched in idle time (at most 40, 4 at a time) while the player is still on the intro or the map.
- A picture that fails to load is asked for once more; after a second failure its place is a plain tile and the caption beside it shows even with captions off.
- `content/why.json` (151 KB) and the wing files stay out of the boot path (fetched after the first screen, and per wing).

## Platform matrix

| Surface | Version/device | Result |
|---|---|---|
| Desktop Chromium, headless (autoplay) | 2026-11-23, first 4 rooms, 3 viewports, EN and UR | PASS (headless), with the Urdu ayah-step fit warning above |
| Desktop web, full play-through of all 92 rooms | — | not run on this build (owner's final sweep) |
| Mobile web (Android Chrome, iOS Safari) | — | UNVERIFIED: needs a real device. Check there: no text selection or callout on long-press, no double-tap zoom, no pull-to-refresh, lists still scroll |
| Firefox, Safari desktop | — | UNVERIFIED |
| YouTube Android | — | PORTAL_REQUIRED |
| YouTube iOS | — | PORTAL_REQUIRED |

## Manual review

- Rights ledger complete: no (`docs/RIGHTS.md`; English translation choice and two emails still open)
- Originality/duplicate comparison: not done
- General 13+ audience confirmed: by design; listing pending
- Metadata and thumbnails match build: not written
- Accessibility tags accurate: not chosen
- No personal data, login, analytics, external services, QR or links: yes (static)
- No extra agreements, share prompts, duplicate YouTube controls or quit button: yes, with DES-20 left to the reviewer
- Completion, tutorial, pause and error states: implemented (Phases A and D); need one fresh browser pass on this build

## Hosted Test Suite

PORTAL_REQUIRED. Not run. A Test Suite pass is not certification.

## Remaining unverified items

- Everything marked `STALE_RUNTIME`: one browser pass on the final build (SDK call order and timing, pause, audio, keyboard, extreme aspect ratios, save size at 92 rooms, heap, time to interactive).
- Real devices (Android, iOS, Safari, Firefox), the hosted Test Suite, the ingested build's transfer size.
- Whether the idle picture preload is a cache hit on YouTube's hosting (it depends on the host's cache headers; with `no-store`, as on the local QA server, pictures are simply fetched twice).
- Scholar sign-off on all meanings, pictures and translations (PLAN D8); rights items in `docs/RIGHTS.md`.
- Phase F items not done here (they live in files Phase E was editing): the Guide "Words" tab still builds every card at once, and the always-running `box-shadow` pulse and the `drop-shadow` filter on every picture are still in `styles.css`.
