# Memory system — remembering 700+ words through repetition (DRAFT 2026-11-01)

Khadin's request: **"make the remembrance easy the game in a way so with repetition users can remember"**.

Goal: a player who finishes the game still knows the words months later. Repetition is planned, spaced, varied and visual, and it never feels like a chore or a punishment.

Scheduler: `game/core/srs.js` (pure functions, tested in `tests/srs.test.mjs`). Prototype: the **Relight** tab in `prototypes/visual-games.html`.

---

## 1. Principles (well-established learning research)

| Principle | What it means here |
|---|---|
| **Retrieval practice** (testing effect; Roediger & Karpicke 2006) | Every repetition makes the player *recall* (pick, build, find), never just re-read a list. |
| **Spaced repetition** (forgetting curve, Ebbinghaus 1885; distributed-practice review, Cepeda et al. 2006) | A word returns just before it would be forgotten, at growing gaps: same session → 1 day → 3 → 7 → 16 → 35 days. |
| **Dual coding** (Paivio) | Word + picture (+ later, licensed recitation audio) are learned together; the picture language makes every recall two-channel. |
| **Varied retrieval / interleaving** | Each time a word returns it comes through a different engine or direction (picture→word, word→picture, build it, find it in an ayah), mixed with other words. |
| **Elaboration** | New words hang on what is already known: root family, Urdu cognate, salah phrase, opposite pair. |
| **Generation** | Inventor stage: guess a new word's meaning from root + mould *before* seeing it; guessing makes the answer stick even when the guess is wrong. |

---

## 2. Word lamps — repetition you can see

Every word in the Notebook is a small lamp with **0–6 flames** (its level). The player sees the shelf fill and brighten.

| Level | Picture | Next review |
|---|---|---|
| 0 New | unlit lamp | introduced by a room |
| 1 Met | 1 flame | later in the same session |
| 2 | 2 flames | next day |
| 3 | 3 flames | in 3 days |
| 4 | 4 flames | in 7 days |
| 5 | 5 flames | in 16 days |
| 6 Gold | golden lamp | in 35 days (keeps coming back, rarely) |

- **A new word's first gap is short (2026-11-23).** The Last Check comes minutes after a word is first seen, so passing it shows working memory, not learning. A new word answered right every time and asked in the Last Check ends its room at **1 flame, back tomorrow**; a right answer then makes 2 flames. A new word that needed help, was missed, was only met, or was not reached by the Last Check ends at 1 flame and is **due the same day**: the next room's warm-up asks it (up to 8 such words), and so do Relight and Quick practice. The map does not count these same-day words as "lamps to relight" on the day they were learnt.
- **Last Check.** At most 8 words (the ones missed, helped or never asked come first). Wing 1: one right answer in each direction (Arabic → meaning, meaning → Arabic), and a miss keeps the dots already earned. Later wings: two right answers in a row, a miss resets the word. An answer after Show me never counts.
- **Meaning, not shape.** A calligraphy word (a Name of Allah, a prophet's name, a word with no picture) is asked by its meaning written out, never by its medallion: the medallion is the Arabic itself.
- **Every answer shows a pairing.** After a right answer the Arabic and its meaning stay together for a moment; after a wrong tap the helper line says what the tapped choice really is.
- **Recalled first try, no hint** → up one flame.
- **Recalled with help** (the first Show me, which only takes away some wrong choices; or the tutorial hand pointing at the answer the first time a game is met) → the flame stays and the word comes back in about a quarter of the time (levels 3–6: 1, 2, 4, 9 days).
- **Wrong, or answer revealed (the second Show me)** → down one flame (never below 1) and returns again 3 cards later in the same session. In Relight it is then asked until it has been answered right twice without help, once from each side (word → picture, picture → word); those make-up answers never raise it again, and it is due the next day.
- **Words that keep being missed** (3 or more lapses) come back within 3 days however high the lamp, until they have been recalled unaided often enough (each unaided recall takes one lapse off).
- **A word that is not due does not move** when its room is played again (or when a later room reviews it early); a miss always counts.
- **Relight sessions** serve 12 lamps, 16 when more than 40 wait and 20 when more than 60 wait. When a session ends with lamps still due, the end card says how many and offers to keep going; "All lamps are lit" shows only when it is true.
- A lamp that is **due** glows dimmer — a gentle "relight me" signal. It **never goes out**, nothing is lost, the coverage meter never drops, and there are no streaks or "you missed a day" messages.

The next-review gap is shown as a picture (🌙 = later today, ☀️ ×N = in N days), so the schedule itself is visual.

---

## 3. Where repetition happens

1. **Rule of three on day one.** A new word is retrieved three times in its first room: Round 1 (one engine), Round 2 (a different engine/direction), then inside the real ayah. That takes it straight to level 1–2.
2. **Relight (session warm-up).** Each session opens with up to 8 due words in about a minute: dim lamps on a shelf, quick picture recalls, lamps relight. Skippable.
3. **Mixed into new rooms.** About a third of every room's rounds are older due words, and the ayah picker prefers ayat that contain due words, so review happens *inside* new play.
4. **Reading Rooms revisited.** A finished passage can be re-read later; the share of words still glowing shows real retention.
5. **Lamp Review (any time).** From the Notebook: review a wing, a root family, or "words I mix up".
6. **Quick practice (built 2026-11-23).** When no lamp is due, the map's Relight button becomes Quick practice: 8 of the weakest and oldest words. It is never graded: no flame goes up or down and no due day moves, so it cannot lower progress and cannot be used to push words up early. Only mix-ups are noted.
7. **Tell these apart (built 2026-11-23).** A wrong pick is kept on the word's card (the 3 most frequent, in the save). A pair mixed up twice comes back side by side, one meaning and the two Arabic words, in a room's warm-up and after a Relight or Quick practice round. Told apart first time with no help, the mix-up is settled.
8. **Leaving a room.** Review words answered before the player leaves are graded on the way out (once), so the review is kept.

Pace guard: if more than ~40 words are due, Qalam suggests a Relight room before new words (a suggestion, never a lock). A soft daily pace of ~15–20 new words keeps reviews light.

---

## 4. Memory hooks (make each word easier to hold)

| Hook | Example | Shown when |
|---|---|---|
| Picture | ☀️ for شَمْس | always (picture language) |
| Root family | عَلِمَ · عَالِم · عِلْم · مَعْلُوم light up the same ع ل م seeds | first meeting + Notebook |
| Urdu bridge | عِلْم = علم, كِتَاب = کتاب, صَبْر = صبر ("you already know this") | Urdu mode |
| Salah anchor | رَبّ, عَظِيم in سُبْحَانَ رَبِّيَ الْعَظِيمِ; the words of Al-Fatiha | "Salah Words" shelf; hook card says "you will say this in your next prayer" |
| Opposite pair | نُور ↔ ظُلُمَات, جَنَّة ↔ نَار, قَبْلَ ↔ بَعْدَ | pairs reviewed together |
| Tell-apart drill | مَنْ / مِنْ, لَمْ / لَنْ, إِنَّ / أَنَّ / إِنْ / أَنْ | when the scheduler records the same mix-up twice |

Salah phrases outside the Qur'an (e.g. the ruku/sujud tasbih) are used only as memory anchors for Qur'anic words, and only with reviewer approval.

---

## 5. Data (cloud save, small)

Per word: `{ level 0-6, due (day number), seen, lapses, last engine, mix-ups { otherWordId: count } }` → about 40 bytes × ~730 words ≈ 30 KB, far under the 3 MiB save limit. Days are counted from the device date; changing the clock only changes when reviews appear, never removes progress.

---

## 6. How we will know it works (honest measures)

- Day-7 and day-30 recall rate of words at level ≥ 3 (local, privacy-safe; no analytics on Playables unless the platform provides it).
- Reading Room re-read accuracy after 2+ weeks.
- Representative-user test: 5–10 Urdu and English speakers, a 1-week and a 4-week recall check on 30 words.

Claims in the listing stay modest ("built-in spaced review"); no "remember everything forever" promises.
