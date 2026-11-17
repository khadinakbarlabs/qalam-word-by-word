# Source data (build-time only)

Downloaded 2026-11-01 for M0. Nothing in this folder is shipped to players as-is. Licences, credits and open rights questions: `docs/RIGHTS.md`.

| Folder | Source | Licence | Notes |
|---|---|---|---|
| `tanzil/quran-uthmani.txt` | https://tanzil.net/download/ — Uthmani v1.1, pause marks, sajdah, rub-el-hizb, tatweel, format "text with aya numbers" | Creative Commons Attribution 3.0. Verbatim copies only; credit Tanzil Project and link tanzil.net; keep the notice at the end of the file | The game shows this text unchanged. |
| `morphology/quran-morphology.txt` | https://github.com/mustafa0x/quran-morphology (fork of Quranic Arabic Corpus v0.4, http://corpus.quran.com) | GNU GPL (QAC). QAC FAQ also asks for research / non-commercial use — see docs/PLAN.md §5 | Used only to compute counts, coverage and ayah choice. `README.upstream.md` documents the fork's changes. |
| `translations/en.yusufali.txt` | https://tanzil.net/trans/ — Abdullah Yusuf Ali, *The Holy Qur'an: Text, Translation and Commentary* (1934–37), format "text with aya numbers" (downloaded 2026-11-05) | Public domain: translator died 1953, so out of copyright in life + 50 and life + 70 countries. Tanzil asks its translation files be used non-commercially or with permission: no rights holder is left, but re-check before a paid release | **In use** (EN) since 2026-11-05, Khadin's choice of a well-known scholar. Shown word for word; only encoding tidied (see `cleanText` in `scripts/lib/pack.mjs`). |
| `translations/ur.junagarhi.txt` | https://tanzil.net/trans/ — Maulana Muhammad Junagarhi (downloaded 2026-11-05); the Urdu translation printed by the King Fahd Complex | Public domain: translator died 1941 (life + 70 ended 2011). Tanzil's request as above | **In use** (UR) since 2026-11-05. The translator's own bracketed fill-ins, e.g. (یعنی قیامت), are kept; "ﻻ" → "لا" and Arabic "ه" → Urdu "ہ" (encoding only). |
| `translations/en.pickthall.txt` (not used since 2026-11-05) | https://tanzil.net/trans/ — Marmaduke Pickthall, *The Meaning of the Glorious Koran* (1930), format "text with aya numbers" (downloaded 2026-11-05) | Translation in the public domain (Pickthall d. 1936; published 1930). Tanzil's page asks that its translation files be used non-commercially or with the translator's/publisher's permission: for a public-domain translation there is no rights holder left, but keep the Tanzil credit and re-check before any paid release | Full-ayah meaning shown after an ayah is read and in Reading Rooms (EN). Khadin's choice 2026-11-05 until a licensed scholar translation (e.g. Mufti Taqi Usmani) is agreed. |
| `translations/ur.jalandhry.txt` (not used since 2026-11-05) | https://tanzil.net/trans/ — Maulana Fateh Muhammad Jalandhry (downloaded 2026-11-05) | Public domain in Pakistan (author d. 1964; life + 50). Other countries with life + 70 terms: in copyright until 2035, so check before release outside Pakistan | Full-ayah meaning (UR), same use as above. |

Re-download (same files):

```bash
curl -sSL -o tanzil/quran-uthmani.txt "https://tanzil.net/pub/download/index.php?marks=true&sajdah=true&rub=true&tatweel=true&quranType=uthmani&outType=txt-2&agree=true"
curl -sSL -o morphology/quran-morphology.txt "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt"
curl -sSL -o translations/en.pickthall.txt "https://tanzil.net/trans/?transID=en.pickthall&type=txt-2"
curl -sSL -o translations/ur.jalandhry.txt "https://tanzil.net/trans/?transID=ur.jalandhry&type=txt-2"
curl -sSL -o translations/en.yusufali.txt "https://tanzil.net/trans/?transID=en.yusufali&type=txt-2"
curl -sSL -o translations/ur.junagarhi.txt "https://tanzil.net/trans/?transID=ur.junagarhi&type=txt-2"
```
