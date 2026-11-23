# Qalam: Word by Word (working title)

Game plan: learn Qur'anic Arabic and reach about 85% of the Qur'an's words, with core grammar. English and Urdu. **Direction approved 2026-11-01; plan only, nothing is built yet.**

- [docs/PLAN.md](docs/PLAN.md): decisions, languages, data pipeline, rights, respect rules, architecture, roadmap, open questions
- [docs/GAME_BRIEF.md](docs/GAME_BRIEF.md): studio learning-game brief (story, companion Qalam, loop, progression)
- [docs/CURRICULUM.md](docs/CURRICULUM.md): analysis of the reference booklet, coverage definition, 40 grammar keys, 5 acts
- [docs/VISUAL_GAMES.md](docs/VISUAL_GAMES.md): 100% visual design: picture language, 6 game engines, every booklet page → room + game
- [docs/MEMORY_SYSTEM.md](docs/MEMORY_SYSTEM.md): remembering through repetition: word lamps, spaced schedule, Relight, memory hooks
- [docs/M0_REPORT.md](docs/M0_REPORT.md): data spike results (coverage curve, ayah supply, Reading Rooms, fonts)
- [docs/BOOK_COVERAGE.md](docs/BOOK_COVERAGE.md): booklet checklist matched to the curriculum, so nothing is missed
- **Game (Wings 1–4 complete + Wings 1–5 complete (booklet pp. 1–42) + Reading Rooms 1–5 (Al-Ikhlas, Al-Asr, Al-Kafirun, Ayat al-Kursi, Al-Baqarah 1–5), 92 short rooms (Al-Fatiha is five; no Wing 1 room teaches more than 8 new words; save v6), 910 words, meter → 85.5%; every room ends with a Mastery Check; every painting explained; painted art, Picture Guide 🗂️, tooltips)**: `game/` — preview "quran-words", open `/qa/harness.html?fresh=1` (fake YouTube SDK; `?lang=ur-PK` for Urdu, `?qa=1` exposes the hint target for automated runs). Content: `authoring/{words,ayat,rooms}.js` → `node scripts/build-pack.mjs` → `game/content/pack.json`. All meanings are drafts awaiting scholar review.
- Prototypes (preview "quran-words"): `/prototypes/visual-games.html`, `/prototypes/font-test.html`

```bash
node scripts/build-corpus.mjs && node scripts/coverage.mjs && node scripts/ayah-picker.mjs && node scripts/book-check.mjs
node scripts/visual-prototype.mjs && node scripts/font-test.mjs
node --test tests/*.test.mjs
```

Reference: *85% of Qur'anic Words* (Dr. Abdulazeez Abdulraheem, Understand Al-Qur'an Academy, 2018). It is all-rights-reserved, so we use it only as a reference for method and order and copy none of its content.
- **Autoplay**: `python3 scripts/autoplay.py` plays every room from a fresh save at three screen sizes and fails on errors or stuck screens; it also lists screens that do not fit (`--rooms 5`, `--lang ur-PK`, `--fit-shots`). Needs Python Playwright and Google Chrome.
- **Art**: prompts in `authoring/art.js` → `node scripts/art.mjs next 4` (prompts to generate) → `node scripts/art.mjs ingest '[{"index":0,"url":"…"}]'` (download, cut background, 256 px WebP into `game/art/`) → `node scripts/build-pack.mjs`. `node scripts/art.mjs status` shows progress.
