// Rooms: the Al-Fatiha prologue, Wing 1 (little words) and the start of Wing 2 (names of things), docs/VISUAL_GAMES.md §3–4.
// A room is a list of steps run in order; the player sees only pictures + Arabic (captions optional).
// Step types (game/ui/steps.js):
//   meet   flip cards: Arabic → picture + meaning (first meeting of new words)
//   match  E1 Picture Match: word → pick its picture
//   point  E2 near/far + who: tap the spot the word points at
//   wheel  E5 Person Wheel: tap the person the pronoun means
//   snap   E3 Snap Pieces: click the piece that turns the base into the pictured meaning
//   place  E2 Lamp & Box: tap where the lamp goes
//   ayah   E6 Ayah Light-Up: real ayah, verbatim; new words are met by tapping, known ones decoded
//   timeline  E2 Time Line: tap the word's place on the time arrow (optionally dropping the No stamp)
//   sort   the same game without the arrow: two bins (sent 📜 / refused 🚫, garden 🌳 / fire 🔥, light 🕯️ / dark 🌑,
//          good 🌷 / bad 🍂, he-word ▲ / she-word ●)
//   roots  E4 Root Garden: tap the pot of three letter-seeds the word grows from
//   ladder E1 Size Ladder: plain describing word on the low rung, the أَفْعَل "-er / -est" word on the high rung
//   scene  E1 Scene Hunt: tap the thing in a drawn scene; `scene` picks signs / family / body / town (game/core/scenes.js)
// Words already met in earlier rooms come back here on purpose: repetition is built into the room order.

// Point spots: `pic` is the emoji fallback; `art` names the painting that replaces it (ui:spot-book / ui:spot-tree are
// made for this step, the people reuse the he / she / they paintings; the build fails if a painting is missing).
const BOOK_SPOT = { pic: "📖", art: "ui:spot-book", badge: "m" };
const TREE_SPOT = { pic: "🌳", art: "ui:spot-tree", badge: "f" };
const PEOPLE_SPOT = { pic: "👥", art: "w:humu" };
const NEAR_FAR_SPOTS = [
  { id: "near-m", ...BOOK_SPOT, dist: "near" }, { id: "near-f", ...TREE_SPOT, dist: "near" }, { id: "near-pl", ...PEOPLE_SPOT, dist: "near" },
  { id: "far-m", ...BOOK_SPOT, dist: "far" }, { id: "far-f", ...TREE_SPOT, dist: "far" }, { id: "far-pl", ...PEOPLE_SPOT, dist: "far" },
];
const WHO_SPOTS = [
  { id: "one-m", pic: "👤", art: "w:huwa", badge: "m" }, { id: "one-f", pic: "👤", art: "w:hiya", badge: "f" }, { id: "many", ...PEOPLE_SPOT },
];
const BOOK = { ar: "كِتَاب", pic: "📖" };
const WHAT = { ar: "مَا", pic: "📦" };
// Time arrows for the timeline step (read right to left: past on the right).
const TIME = [{ id: "past", pic: "⏪", art: "ui:past" }, { id: "now", pic: "📍", art: "ui:present" }, { id: "future", pic: "⏩", art: "ui:future" }];
// Root Garden seeds: three letters each, written apart so the player sees the root, not a word.
const root = (id, letters) => ({ id, letters: letters.split(" ") });
const RHM = root("rhm", "ر ح م");
const ILM = root("ilm", "ع ل م");
const HMD = root("hmd", "ح م د");
const HKM = root("hkm", "ح ك م");
// Sort bins (the timeline game without its arrow).
const SENT_REFUSED = [{ id: "sent", pic: "📜", art: "ui:sent" }, { id: "refused", pic: "🚫", art: "ui:refused" }];
const GARDEN_FIRE = [{ id: "garden", pic: "🌳", art: "w:jannah" }, { id: "fire", pic: "🔥", art: "w:nar" }];
const LIGHT_DARK = [{ id: "light", pic: "🕯️", art: "w:nur" }, { id: "dark", pic: "🌑", art: "w:zulumat" }];
const GOOD_BAD = [{ id: "good", pic: "🌷", art: "w:hasana" }, { id: "bad", pic: "🍂", art: "w:sayyia" }];
const MALE_FEMALE = [{ id: "m", pic: "👤▲", art: "w:huwa" }, { id: "f", pic: "👤●", art: "w:hiya" }];
// Passive Flip bins: the doer did it (خَلَقَ) / it was done, doer unsaid (خُلِقَ); painted with the Six Petals doer / done pictures.
// Verb Tables (pp. 39–42): how many, and command vs. don't
const NUMBER = [{ id: "one", pic: "👤", art: "w:huwa" }, { id: "two", pic: "👤👤", art: "w:huma" }, { id: "many", pic: "👥", art: "w:humu" }];
const DO_DONT = [{ id: "do", pic: "✅", art: "ui:command" }, { id: "dont", pic: "🚫", art: "w:la" }];
const DOER_DONE = [{ id: "doerDid", pic: "🧑‍🔧", art: "ui:doer" }, { id: "wasDone", pic: "📦", art: "ui:done" }];
const DONE_SOON_LATER = [{ id: "done", pic: "✔️", art: "ui:done" }, { id: "soon", pic: "⏩", art: "ui:soon" }, { id: "later", pic: "⏩⏩", art: "ui:later" }];

export const ROOMS = [
  {
    // Al-Fatiha is five short rooms (docs/AUDIT_2026-11-23.md, "gentler start"): no room teaches more than 8 new words,
    // the ayat stay in order, and every new word is asked once in a Picture Match before the room's Last Check.
    // 1:1 · 1:2–1:4 · 1:5 · 1:6 · 1:7. The "Al-Fatiha understood" milestone (core/milestones.js) needs all five.
    // Before save v6 the surah was two rooms ("fatiha" 1:1–1:4, "fatiha-2" 1:5–1:7): game/core/room-splits.js.
    id: "fatiha", wing: 1, icon: "📜", art: "w:ism", ref: "prologue",
    title: { en: "Al-Fatiha: Bismillah", ur: "سورۃ الفاتحہ: بسم اللہ" },
    steps: [
      { type: "ayah", ref: "1:1" },
      { type: "match", words: ["w:ism", "w:allah", "w:rahman", "w:bi", "w:rahim", "w:al"] },
      {
        type: "snap", chips: ["w:bi", "w:al"],
        tasks: [{ base: { ar: "اسْم", pic: "🏷️" }, want: ["w:bi"], result: "بِسْمِ", show: ["✋", "🏷️"] }],
      },
    ],
  },
  {
    id: "fatiha-1b", wing: 1, icon: "✨", art: "w:hamd", ref: "prologue",
    title: { en: "Al-Fatiha: Praise", ur: "سورۃ الفاتحہ: حمد" },
    steps: [
      { type: "ayah", ref: "1:2" },
      { type: "match", words: ["w:hamd", "w:rabb", "w:li", "w:alam"] },
      { type: "ayah", ref: "1:3" },
      { type: "ayah", ref: "1:4" },
      { type: "match", words: ["w:yawm", "w:malik", "w:din"] },
      {
        type: "snap", chips: ["w:bi", "w:li", "w:al"],
        tasks: [{ base: { ar: "اللّٰه", medal: "اللّٰه" }, want: ["w:li"], result: "لِلّٰهِ", show: ["🎁", "medal:اللّٰه"] }],
      },
    ],
  },
  {
    id: "fatiha-2", wing: 1, icon: "🤲", art: "w:nabudu", ref: "prologue",
    title: { en: "Al-Fatiha: You Alone", ur: "سورۃ الفاتحہ: تیری ہی عبادت" },
    steps: [
      { type: "ayah", ref: "1:5" },
      { type: "match", words: ["w:nabudu", "w:iyya", "w:nastain", "w:wa", "w:ka"] },
    ],
  },
  {
    id: "fatiha-2b", wing: 1, icon: "🧭", art: "w:sirat", ref: "prologue",
    title: { en: "Al-Fatiha: Guide Us", ur: "سورۃ الفاتحہ: ہدایت" },
    steps: [
      { type: "ayah", ref: "1:6" },
      { type: "match", words: ["w:sirat", "w:ihdi", "w:mustaqim", "w:na"] },
      {
        type: "snap", chips: ["w:bi", "w:li", "w:na", "w:ka"],
        tasks: [{ base: { ar: "اهْدِ", pic: "🧭" }, want: ["w:na"], result: "اهْدِنَا", show: ["🧭", "🙋🙋"] }],
      },
    ],
  },
  {
    // the long last ayah is read in two halves, each followed by its own Picture Match
    id: "fatiha-2c", wing: 1, icon: "🛤️", art: "w:anamta", ref: "prologue",
    title: { en: "Al-Fatiha: The Path", ur: "سورۃ الفاتحہ: راستہ" },
    steps: [
      { type: "ayah", ref: "1:7", part: [1, 4] },
      { type: "match", words: ["w:anamta", "w:alladhina", "w:ala", "w:hum"] },
      { type: "ayah", ref: "1:7", part: [5, 9] },
      { type: "match", words: ["w:ghayr", "w:dallin", "w:la", "w:maghdub"] },
      {
        type: "snap", chips: ["w:na", "w:hum", "w:ka", "w:wa"],
        tasks: [{ base: { ar: "عَلَى", pic: "⏬" }, want: ["w:hum"], result: "عَلَيْهِمْ", show: ["⏬", "👥"] }],
      },
    ],
  },
  {
    id: "near-far", wing: 1, icon: "👉", art: "w:dhalika", ref: "en85 p1 This, that",
    title: { en: "Near & Far", ur: "پاس اور دور" },
    steps: [
      { type: "meet", words: ["w:hadha", "w:dhalika", "w:hadhihi", "w:tilka", "w:haulai", "w:ulaika"] },
      {
        type: "point", spots: NEAR_FAR_SPOTS,
        items: [
          { w: "w:hadha", spot: "near-m" }, { w: "w:dhalika", spot: "far-m" }, { w: "w:hadhihi", spot: "near-f" },
          { w: "w:tilka", spot: "far-f" }, { w: "w:haulai", spot: "near-pl" }, { w: "w:ulaika", spot: "far-pl" },
        ],
      },
      { type: "meet", words: ["w:alladhi", "w:allati"] },
      { type: "point", spots: WHO_SPOTS, items: [{ w: "w:alladhi", spot: "one-m" }, { w: "w:allati", spot: "one-f" }, { w: "w:alladhina", spot: "many" }] },
      { type: "ayah", ref: "56:56" },
      { type: "ayah", ref: "56:11" },
      { type: "ayah", ref: "14:20" },
    ],
  },
  {
    id: "whos-who", wing: 1, icon: "👥", art: "w:nahnu", ref: "en85 p2 Whose? / Who?",
    title: { en: "Who's Who", ur: "کون کون" },
    steps: [
      { type: "meet", words: ["w:ana", "w:nahnu", "w:anta", "w:antum", "w:huwa", "w:hiya", "w:humu"] },
      {
        type: "wheel",
        items: [
          { w: "w:ana", person: "1s" }, { w: "w:huwa", person: "3ms" }, { w: "w:antum", person: "2mp" }, { w: "w:hiya", person: "3fs" },
          { w: "w:nahnu", person: "1p" }, { w: "w:anta", person: "2ms" }, { w: "w:humu", person: "3mp" },
        ],
      },
      { type: "meet", words: ["w:i", "w:ka", "w:kum", "w:hu", "w:ha"] },
      {
        type: "snap", chips: ["w:i", "w:na", "w:ka", "w:kum", "w:hu", "w:ha", "w:hum"],
        tasks: [
          { base: BOOK, want: ["w:i"], result: "كِتَابِي", show: ["📖", "🙋"] },
          { base: BOOK, want: ["w:hu"], result: "كِتَابُهُ", show: ["📖", "👤▲"] },
          { base: BOOK, want: ["w:kum"], result: "كِتَابُكُمْ", show: ["📖", "🫵🫵"] },
          { base: BOOK, want: ["w:ha"], result: "كِتَابُهَا", show: ["📖", "👤●"] },
          { base: BOOK, want: ["w:na"], result: "كِتَابُنَا", show: ["📖", "🙋🙋"] },
          { base: BOOK, want: ["w:ka"], result: "كِتَابُكَ", show: ["📖", "🫵"] },
          { base: BOOK, want: ["w:hum"], result: "كِتَابُهُمْ", show: ["📖", "👥"] },
        ],
      },
      { type: "ayah", ref: "109:6" },
      { type: "ayah", ref: "23:59" },
      { type: "ayah", ref: "112:1" },
    ],
  },
  {
    id: "lamp-box", wing: 1, icon: "🪔", art: "w:fawqa", ref: "en85 p3 Where? + p5 Prepositions",
    title: { en: "Lamp & Box", ur: "چراغ اور صندوق" },
    steps: [
      { type: "meet", words: ["w:fawqa", "w:tahta", "w:fi", "w:bayna"] },
      { type: "place", items: [{ w: "w:fawqa", zone: "above" }, { w: "w:fi", zone: "inside" }, { w: "w:tahta", zone: "below" }, { w: "w:ala", zone: "on" }, { w: "w:bayna", zone: "between" }] },
      { type: "meet", words: ["w:khalfa", "w:waraa", "w:amama", "w:hawla"] },
      { type: "place", items: [{ w: "w:khalfa", zone: "behind" }, { w: "w:amama", zone: "front" }, { w: "w:hawla", zone: "around" }, { w: "w:waraa", zone: "behind" }, { w: "w:fawqa", zone: "above" }] },
      { type: "meet", words: ["w:min", "w:ila"] },
      { type: "place", items: [{ w: "w:min", zone: "from" }, { w: "w:ila", zone: "to" }, { w: "w:tahta", zone: "below" }, { w: "w:fi", zone: "inside" }] },
      { type: "ayah", ref: "36:4" },
      { type: "ayah", ref: "85:20" },
      { type: "ayah", ref: "75:23" },
    ],
  },
  {
    id: "no-stamp", wing: 1, icon: "🚫", art: "w:la", ref: "en85 p1 No",
    title: { en: "The No Stamp", ur: "نہیں کی مہر" },
    steps: [
      { type: "meet", words: ["w:lam", "w:lan"] },
      { type: "timeline", stamp: "✕", segments: TIME, items: [{ w: "w:la", seg: "now" }, { w: "w:lam", seg: "past" }, { w: "w:lan", seg: "future" }, { w: "w:lam", seg: "past" }, { w: "w:lan", seg: "future" }] },
      { type: "meet", words: ["w:ma", "w:laysa", "w:kalla", "w:bala", "w:naam"] },
      { type: "match", words: ["w:laysa", "w:naam", "w:kalla", "w:ma", "w:bala"] },
      { type: "meet", words: ["w:duna", "w:illa"] },
      { type: "match", words: ["w:illa", "w:ghayr", "w:duna", "w:la"] },
      { type: "ayah", ref: "112:3" },
      { type: "ayah", ref: "109:2" },
      { type: "ayah", ref: "53:58" },
    ],
  },
  {
    id: "questions", wing: 1, icon: "❓", art: "w:man", ref: "en85 p3 Questions",
    title: { en: "Question Cards", ur: "سوال کارڈ" },
    steps: [
      { type: "meet", words: ["w:man", "w:madha", "w:mata", "w:ayna", "w:kayfa", "w:kam"] },
      { type: "match", words: ["w:ayna", "w:man", "w:kam", "w:mata", "w:kayfa", "w:madha"] },
      { type: "meet", words: ["w:ayyu", "w:anna", "w:hal", "w:a", "w:lawla"] },
      { type: "match", words: ["w:hal", "w:ayyu", "w:lawla", "w:anna", "w:a"] },
      { type: "ayah", ref: "37:154" },
      { type: "ayah", ref: "77:12" },
      { type: "ayah", ref: "37:163" },
    ],
  },
  {
    id: "time-line", wing: 1, icon: "⏳", art: "w:saa", ref: "en85 p4 When?",
    title: { en: "Time Line", ur: "وقت کی لکیر" },
    steps: [
      { type: "meet", words: ["w:qabla", "w:bada", "w:idh", "w:idha", "w:hina"] },
      { type: "timeline", segments: TIME, items: [{ w: "w:qabla", seg: "past" }, { w: "w:bada", seg: "future" }, { w: "w:hina", seg: "now" }, { w: "w:idh", seg: "past" }, { w: "w:idha", seg: "future" }] },
      { type: "meet", words: ["w:thumma", "w:fa", "w:bal", "w:inda", "w:lammaa"] },
      { type: "match", words: ["w:inda", "w:thumma", "w:lammaa", "w:bal", "w:fa"] },
      { type: "ayah", ref: "82:18" },
      { type: "ayah", ref: "26:78" },
      { type: "ayah", ref: "37:26" },
    ],
  },
  {
    id: "connectors", wing: 1, icon: "🔗", art: "w:wa", ref: "en85 p5 Prepositions (+ مَا)",
    title: { en: "Connectors", ur: "جوڑنے والے" },
    steps: [
      { type: "meet", words: ["w:an", "w:ka_like", "w:hatta", "w:maa"] },
      { type: "match", words: ["w:maa", "w:an", "w:hatta", "w:ka_like", "w:min"] },
      {
        type: "snap", chips: ["w:bi", "w:an", "w:fi", "w:ka_like", "w:li", "w:min"],
        tasks: [
          { base: WHAT, want: ["w:bi"], result: "بِمَا", show: ["✋", "📦"] },
          { base: WHAT, want: ["w:an"], result: "عَمَّا", show: ["⤴️", "📦"] },
          { base: WHAT, want: ["w:fi"], result: "فِيمَا", show: ["📥", "📦"] },
          { base: WHAT, want: ["w:ka_like"], result: "كَمَا", show: ["🟰", "📦"] },
          { base: WHAT, want: ["w:min"], result: "مِمَّا", show: ["📤", "📦"] },
          { base: WHAT, want: ["w:li"], result: "لِمَا", show: ["🎁", "📦"] },
        ],
      },
      { type: "ayah", ref: "82:16" },
      { type: "ayah", ref: "38:68" },
    ],
  },
  {
    id: "verb-markers", wing: 1, icon: "🏁", art: "w:qad", ref: "en85 p6 Prefix for verb",
    title: { en: "Verb Front Markers", ur: "فعل کے نشان" },
    steps: [
      { type: "meet", words: ["w:qad", "w:sa", "w:sawfa"] },
      { type: "timeline", segments: DONE_SOON_LATER, items: [{ w: "w:qad", seg: "done" }, { w: "w:sa", seg: "soon" }, { w: "w:sawfa", seg: "later" }, { w: "w:sa", seg: "soon" }, { w: "w:qad", seg: "done" }] },
      { type: "meet", words: ["w:la_surely", "w:li_let"] },
      { type: "match", words: ["w:li_let", "w:qad", "w:la_surely", "w:sawfa"] },
      { type: "ayah", ref: "102:3" },
      { type: "ayah", ref: "106:3" },
      { type: "ayah", ref: "4:68" },
    ],
  },
  {
    id: "strong-starters", wing: 1, icon: "💪", art: "w:inna", ref: "en85 p6 Inna…",
    title: { en: "Strong Starters", ur: "زور دار آغاز" },
    steps: [
      { type: "meet", words: ["w:inna", "w:anna_that", "w:kaanna", "w:lakinna", "w:laalla", "w:an_to"] },
      { type: "match", words: ["w:kaanna", "w:inna", "w:laalla", "w:anna_that", "w:lakinna", "w:an_to"] },
      { type: "meet", words: ["w:in_if", "w:law", "w:aw", "w:am", "w:asa"] },
      { type: "match", words: ["w:aw", "w:in_if", "w:asa", "w:law", "w:am"] },
      { type: "ayah", ref: "37:161" },
      { type: "ayah", ref: "26:62" },
    ],
  },
  {
    id: "word-chest", wing: 1, icon: "🧰", art: "w:kull", ref: "en85 p4 Miscellaneous + p6",
    title: { en: "Word Chest", ur: "لفظوں کا صندوق" },
    steps: [
      { type: "meet", words: ["w:dhu", "w:ahl", "w:aal", "w:subhan", "w:nima", "w:bisa", "w:rayb"] },
      { type: "match", words: ["w:nima", "w:ahl", "w:rayb", "w:dhu", "w:bisa", "w:subhan", "w:aal"] },
      { type: "meet", words: ["w:su", "w:mithl", "w:mathal", "w:kull", "w:bad"] },
      { type: "match", words: ["w:kull", "w:mathal", "w:bad", "w:su", "w:mithl"] },
      { type: "meet", words: ["w:jinn", "w:ins", "w:jund", "w:mayyit"] },
      { type: "match", words: ["w:ins", "w:mayyit", "w:jinn", "w:jund"] },
      { type: "ayah", ref: "51:56" },
      { type: "ayah", ref: "55:26" },
      { type: "ayah", ref: "37:159" },
    ],
  },
  {
    id: "reading-room-1", wing: 1, icon: "📖", art: "w:qala", ref: "Reading Room 1 (Wing 1 finale): Surah Al-Ikhlas 112:1–4, with a Prepare step for its passage words",
    title: { en: "Reading Room: Al-Ikhlas", ur: "مطالعہ کا کمرہ: سورۃ الاخلاص" },
    steps: [
      { type: "meet", words: ["w:qala", "w:ahad", "w:samad", "w:walada", "w:kana", "w:kufuw"] },
      { type: "ayah", ref: "112:1", key: "112:1/read" },
      { type: "ayah", ref: "112:2" },
      { type: "ayah", ref: "112:3", key: "112:3/read" },
      { type: "ayah", ref: "112:4" },
      { type: "match", words: ["w:ahad", "w:samad", "w:walada", "w:kufuw"] },
      {
        type: "passage", title: { ar: "سُورَةُ الْإِخْلَاص", en: "Surah Al-Ikhlas (Sincerity)", ur: "سورۃ الاخلاص" },
        refs: [
          { ref: "112:1", key: "112:1/read" },
          { ref: "112:2" },
          { ref: "112:3", key: "112:3/read" },
          { ref: "112:4" },
        ],
      },
    ],
  },
  {
    id: "names-of-light", wing: 2, icon: "✨", ref: "en85 p7 Some attributes (of Allah)",
    title: { en: "Names of Light", ur: "نور کے نام" },
    steps: [
      { type: "meet", words: ["w:rahma", "w:ilm", "w:alim", "w:hamid"] },
      {
        type: "roots", seeds: [RHM, ILM, HMD],
        items: [
          { w: "w:rahma", seed: "rhm" }, { w: "w:alim", seed: "ilm" }, { w: "w:hamid", seed: "hmd" }, { w: "w:rahim", seed: "rhm" },
          { w: "w:ilm", seed: "ilm" }, { w: "w:hamd", seed: "hmd" }, { w: "w:alam", seed: "ilm" }, { w: "w:rahman", seed: "rhm" },
        ],
      },
      { type: "meet", words: ["w:sami", "w:basir", "w:ghafur"] },
      { type: "roots", seeds: [root("smh", "س م ع"), root("bsr", "ب ص ر"), root("ghfr", "غ ف ر")], items: [{ w: "w:sami", seed: "smh" }, { w: "w:ghafur", seed: "ghfr" }, { w: "w:basir", seed: "bsr" }] },
      { type: "meet", words: ["w:aziz", "w:hakim", "w:qadir", "w:khabir"] },
      {
        type: "roots", seeds: [root("azz", "ع ز ز"), root("hkm", "ح ك م"), root("qdr", "ق د ر"), root("khbr", "خ ب ر")],
        items: [{ w: "w:hakim", seed: "hkm" }, { w: "w:khabir", seed: "khbr" }, { w: "w:aziz", seed: "azz" }, { w: "w:qadir", seed: "qdr" }],
      },
      { type: "ayah", ref: "26:220" },
      { type: "ayah", ref: "26:9" },
      { type: "ayah", ref: "44:6" },
      { type: "ayah", ref: "100:11" },
    ],
  },
  {
    id: "size-ladder", wing: 2, icon: "🪜", art: "w:akbar", ref: "en85 p8 Noun of superiority + attributes",
    title: { en: "Size Ladder", ur: "بڑائی کی سیڑھی" },
    steps: [
      { type: "meet", words: ["w:kabir", "w:kathir", "w:qarib", "w:shadid", "w:azim"] },
      { type: "match", words: ["w:kabir", "w:shadid", "w:qarib", "w:kathir", "w:azim"] },
      { type: "meet", words: ["w:akbar", "w:akthar", "w:aqrab", "w:ashadd", "w:alam_more"] },
      {
        type: "ladder",
        items: [
          { w: "w:akbar", base: "w:kabir", rung: "more" }, { w: "w:kabir", base: "w:kabir", rung: "base" },
          { w: "w:aqrab", base: "w:qarib", rung: "more" }, { w: "w:qarib", base: "w:qarib", rung: "base" },
          { w: "w:akthar", base: "w:kathir", rung: "more" }, { w: "w:shadid", base: "w:shadid", rung: "base" },
          { w: "w:ashadd", base: "w:shadid", rung: "more" }, { w: "w:alam_more", base: "w:alim", rung: "more" },
          { w: "w:kathir", base: "w:kathir", rung: "base" },
        ],
      },
      { type: "meet", words: ["w:qalil", "w:baid", "w:awwal", "w:akhir", "w:akhar"] },
      { type: "match", words: ["w:baid", "w:akhir", "w:qalil", "w:akhar", "w:awwal"] },
      { type: "ayah", ref: "70:6" },
      { type: "ayah", ref: "70:7" },
      { type: "ayah", ref: "92:13" },
      { type: "ayah", ref: "85:12" },
      { type: "ayah", ref: "56:14" },
    ],
  },
  {
    id: "signs-scene", wing: 2, icon: "🌙", art: "w:qamar", ref: "en85 p9 Allah's signs",
    title: { en: "Signs in the Sky", ur: "آسمان کی نشانیاں" },
    steps: [
      { type: "meet", words: ["w:sama", "w:ard", "w:shams", "w:qamar", "w:layl", "w:nahar"] },
      {
        type: "scene",
        items: [
          { w: "w:sama", spot: "sky" }, { w: "w:shams", spot: "sun" }, { w: "w:ard", spot: "earth" },
          { w: "w:layl", spot: "night" }, { w: "w:qamar", spot: "moon" }, { w: "w:nahar", spot: "day" },
        ],
      },
      { type: "meet", words: ["w:jabal", "w:bahr", "w:rih", "w:anam"] },
      {
        type: "scene",
        items: [
          { w: "w:jabal", spot: "mountain" }, { w: "w:rih", spot: "wind" }, { w: "w:bahr", spot: "sea" },
          { w: "w:anam", spot: "cattle" }, { w: "w:qamar", spot: "moon" }, { w: "w:ard", spot: "earth" },
        ],
      },
      { type: "meet", words: ["w:aya", "w:bayyina", "w:sab", "w:wa_oath"] },
      { type: "match", words: ["w:aya", "w:wa_oath", "w:sab", "w:bayyina"] },
      { type: "ayah", ref: "91:1" },
      { type: "ayah", ref: "91:2" },
      { type: "ayah", ref: "91:3" },
      { type: "ayah", ref: "91:4" },
      { type: "ayah", ref: "91:5" },
      { type: "ayah", ref: "91:6" },
      { type: "ayah", ref: "45:36" },
      { type: "story", panels: [{ w: "w:shams" }, { w: "w:nahar" }, { w: "w:rih" }, { w: "w:bahr" }, { w: "w:qamar" }, { w: "w:layl" }] },
    ],
  },
  {
    id: "name-scrolls", wing: 2, icon: "🧾", art: "w:salam", ref: "en85 p9 Prophets and …",
    title: { en: "Name Scrolls", ur: "ناموں کے طومار" },
    steps: [
      { type: "meet", words: ["w:rasul", "w:nabi", "w:salam"] },
      { type: "meet", words: ["w:adam", "w:nuh", "w:ibrahim", "w:ismail", "w:ishaq", "w:yaqub"] },
      { type: "ayah", ref: "37:79" },
      { type: "ayah", ref: "37:109" },
      { type: "meet", words: ["w:yusuf", "w:musa", "w:harun", "w:isa", "w:maryam"] },
      { type: "ayah", ref: "37:120" },
      { type: "meet", words: ["w:dawud", "w:sulayman", "w:lut", "w:israil"] },
      { type: "meet", words: ["w:firawn", "w:ad", "w:thamud", "w:shaytan"] },
      {
        type: "sort", segments: SENT_REFUSED,
        items: [
          { w: "w:musa", seg: "sent" }, { w: "w:firawn", seg: "refused" }, { w: "w:nuh", seg: "sent" }, { w: "w:ad", seg: "refused" },
          { w: "w:ibrahim", seg: "sent" }, { w: "w:shaytan", seg: "refused" }, { w: "w:isa", seg: "sent" }, { w: "w:thamud", seg: "refused" },
          { w: "w:lut", seg: "sent" },
        ],
      },
      { type: "ayah", ref: "85:18" },
      { type: "ayah", ref: "27:30" },
    ],
  },
  {
    id: "last-day", wing: 2, icon: "🌅", art: "w:jannah", ref: "en85 p10 Last day, …",
    title: { en: "The Last Day", ur: "آخری دن" },
    steps: [
      { type: "meet", words: ["w:jannah", "w:nar", "w:naim", "w:azab", "w:nahr", "w:jahim"] },
      {
        type: "sort", segments: GARDEN_FIRE,
        items: [
          { w: "w:jannah", seg: "garden" }, { w: "w:nar", seg: "fire" }, { w: "w:naim", seg: "garden" },
          { w: "w:azab", seg: "fire" }, { w: "w:nahr", seg: "garden" }, { w: "w:jahim", seg: "fire" },
        ],
      },
      { type: "ayah", ref: "37:43" },
      { type: "meet", words: ["w:jahannam", "w:alim_pain", "w:ajr", "w:jaza", "w:mawa", "w:ashab"] },
      { type: "sort", segments: GARDEN_FIRE, items: [{ w: "w:ajr", seg: "garden" }, { w: "w:jahannam", seg: "fire" }, { w: "w:alim_pain", seg: "fire" }, { w: "w:naim", seg: "garden" }] },
      { type: "match", words: ["w:mawa", "w:jaza", "w:ashab", "w:ajr"] },
      { type: "ayah", ref: "53:15" },
      { type: "ayah", ref: "15:50" },
      { type: "meet", words: ["w:qiyama", "w:saa", "w:ajal", "w:abadan", "w:wayl", "w:aqiba"] },
      { type: "match", words: ["w:saa", "w:abadan", "w:wayl", "w:ajal", "w:qiyama", "w:aqiba"] },
      { type: "ayah", ref: "75:1" },
      { type: "ayah", ref: "77:15" },
    ],
  },
  {
    id: "faith-words", wing: 2, icon: "🤲", art: "w:nur", ref: "en85 p11 Deen, … / Faith, …",
    title: { en: "Faith Words", ur: "ایمان کے الفاظ" },
    steps: [
      { type: "meet", words: ["w:nur", "w:zulumat", "w:haqq", "w:batil", "w:mubin"] },
      {
        type: "sort", segments: LIGHT_DARK,
        items: [{ w: "w:nur", seg: "light" }, { w: "w:zulumat", seg: "dark" }, { w: "w:haqq", seg: "light" }, { w: "w:batil", seg: "dark" }, { w: "w:mubin", seg: "light" }],
      },
      { type: "ayah", ref: "35:20" },
      { type: "ayah", ref: "56:95" },
      { type: "meet", words: ["w:kitab", "w:quran", "w:kalima", "w:salah", "w:zakah"] },
      { type: "match", words: ["w:kitab", "w:salah", "w:kalima", "w:zakah"] },
      { type: "ayah", ref: "26:2" },
      { type: "ayah", ref: "44:2" },
      { type: "meet", words: ["w:ilah", "w:wahid", "w:ahad", "w:sharik", "w:malak"] },
      { type: "meet", words: ["w:ghayb", "w:shahid", "w:shahada"] },
      { type: "match", words: ["w:sharik", "w:ghayb", "w:ahad", "w:shahid", "w:wahid"] },
      {
        type: "roots", seeds: [root("shd", "ش ه د"), root("ktb", "ك ت ب"), root("whd", "و ح د")],
        items: [{ w: "w:shahid", seed: "shd" }, { w: "w:kitab", seed: "ktb" }, { w: "w:wahid", seed: "whd" }, { w: "w:shahada", seed: "shd" }],
      },
      { type: "ayah", ref: "37:4" },
    ],
  },
  {
    id: "deeds-blessings", wing: 2, icon: "🌾", art: "w:hasana", ref: "en85 p12 Deeds, … / Blessings, …",
    title: { en: "Deeds & Blessings", ur: "اعمال اور نعمتیں" },
    steps: [
      { type: "meet", words: ["w:amal", "w:hasana", "w:sayyia", "w:khayr", "w:sharr", "w:ithm", "w:dhanb"] },
      {
        type: "sort", segments: GOOD_BAD,
        items: [
          { w: "w:hasana", seg: "good" }, { w: "w:sayyia", seg: "bad" }, { w: "w:khayr", seg: "good" }, { w: "w:sharr", seg: "bad" },
          { w: "w:ithm", seg: "bad" }, { w: "w:dhanb", seg: "bad" }, { w: "w:ajr", seg: "good" },
        ],
      },
      { type: "meet", words: ["w:junah", "w:haram", "w:hadith", "w:bas", "w:nasib", "w:idhn"] },
      { type: "match", words: ["w:hadith", "w:nasib", "w:haram", "w:idhn", "w:bas", "w:junah", "w:amal"] },
      { type: "meet", words: ["w:fadl", "w:nima_gift", "w:alaa", "w:tayyib", "w:water", "w:fawz"] },
      { type: "match", words: ["w:water", "w:fawz", "w:tayyib", "w:fadl", "w:alaa", "w:nima_gift"] },
      { type: "ayah", ref: "37:60" },
      { type: "ayah", ref: "44:57" },
      { type: "ayah", ref: "49:8" },
      { type: "meet", words: ["w:mulk", "w:sultan", "w:fariq", "w:jami", "w:ajma", "w:sawa"] },
      { type: "match", words: ["w:sawa", "w:mulk", "w:ajma", "w:fariq", "w:sultan", "w:jami"] },
      { type: "ayah", ref: "93:4" },
      { type: "ayah", ref: "37:156" },
      { type: "story", panels: [{ w: "w:amal" }, { w: "w:hasana" }, { w: "w:fadl" }, { w: "w:fawz" }] },
    ],
  },
  {
    id: "family-body", wing: 2, icon: "👪", art: "w:ahl", ref: "en85 p13 Relatives, … / Self (body parts)",
    title: { en: "Family & Body", ur: "خاندان اور جسم" },
    steps: [
      { type: "meet", words: ["w:ab", "w:umm", "w:akh", "w:zawj", "w:ibn", "w:bint", "w:dhurriyya"] },
      {
        type: "scene", scene: "family",
        items: [
          { w: "w:ab", spot: "father" }, { w: "w:umm", spot: "mother" }, { w: "w:akh", spot: "brother" }, { w: "w:zawj", spot: "spouse" },
          { w: "w:ibn", spot: "son" }, { w: "w:bint", spot: "daughter" }, { w: "w:dhurriyya", spot: "offspring" },
        ],
      },
      { type: "meet", words: ["w:rajul", "w:imraa", "w:nisa", "w:dhakar", "w:untha", "w:walad", "w:walid", "w:mawla"] },
      {
        type: "sort", segments: MALE_FEMALE,
        items: [
          { w: "w:rajul", seg: "m" }, { w: "w:imraa", seg: "f" }, { w: "w:ab", seg: "m" }, { w: "w:umm", seg: "f" },
          { w: "w:dhakar", seg: "m" }, { w: "w:untha", seg: "f" }, { w: "w:nisa", seg: "f" }, { w: "w:bint", seg: "f" }, { w: "w:akh", seg: "m" },
        ],
      },
      { type: "match", words: ["w:walad", "w:mawla", "w:walid", "w:nisa"] },
      { type: "ayah", ref: "20:30" },
      { type: "ayah", ref: "80:35" },
      { type: "ayah", ref: "53:21" },
      { type: "meet", words: ["w:wajh", "w:ayn", "w:afwah", "w:lisan", "w:qalb", "w:sadr", "w:batn", "w:yad", "w:rijl"] },
      {
        type: "scene", scene: "body",
        items: [
          { w: "w:wajh", spot: "face" }, { w: "w:ayn", spot: "eye" }, { w: "w:qalb", spot: "heart" }, { w: "w:yad", spot: "hand" },
          { w: "w:afwah", spot: "mouth" }, { w: "w:rijl", spot: "foot" }, { w: "w:lisan", spot: "tongue" }, { w: "w:sadr", spot: "chest" }, { w: "w:batn", spot: "belly" },
        ],
      },
      { type: "meet", words: ["w:basar", "w:nafs", "w:ruh", "w:quwwa"] },
      { type: "match", words: ["w:basar", "w:quwwa", "w:nafs", "w:qalb"] },
      { type: "ayah", ref: "75:22" },
      { type: "ayah", ref: "44:52" },
    ],
  },
  {
    id: "town-people", wing: 2, icon: "🏘️", art: "w:qarya", ref: "en85 p14 World, … / People, …",
    title: { en: "Town & People", ur: "بستی اور لوگ" },
    steps: [
      { type: "meet", words: ["w:bayt", "w:masjid", "w:qarya", "w:sabil", "w:shajar", "w:mal", "w:mataa"] },
      {
        type: "scene", scene: "town",
        items: [
          { w: "w:bayt", spot: "house" }, { w: "w:masjid", spot: "mosque" }, { w: "w:qarya", spot: "town" }, { w: "w:sabil", spot: "path" },
          { w: "w:shajar", spot: "tree" }, { w: "w:mal", spot: "wealth" }, { w: "w:mataa", spot: "goods" },
        ],
      },
      { type: "meet", words: ["w:dar", "w:dunya", "w:fitna", "w:makan"] },
      { type: "match", words: ["w:dunya", "w:makan", "w:fitna", "w:dar"] },
      { type: "meet", words: ["w:qawm", "w:nas", "w:insan", "w:bashar", "w:umma", "w:mala"] },
      {
        type: "scene", scene: "town",
        items: [{ w: "w:qawm", spot: "people" }, { w: "w:qarya", spot: "town" }, { w: "w:nas", spot: "people" }, { w: "w:masjid", spot: "mosque" }, { w: "w:bayt", spot: "house" }],
      },
      { type: "match", words: ["w:insan", "w:umma", "w:bashar", "w:mala"] },
      { type: "ayah", ref: "22:43" },
      { type: "ayah", ref: "16:117" },
      { type: "ayah", ref: "36:44" },
      { type: "meet", words: ["w:abd", "w:wali", "w:aduw", "w:kafir", "w:mujrim"] },
      {
        type: "sort", segments: GOOD_BAD,
        items: [{ w: "w:wali", seg: "good" }, { w: "w:aduw", seg: "bad" }, { w: "w:abd", seg: "good" }, { w: "w:mujrim", seg: "bad" }, { w: "w:kafir", seg: "bad" }],
      },
      { type: "ayah", ref: "26:77" },
      { type: "ayah", ref: "64:15" },
      { type: "story", panels: [{ w: "w:bayt" }, { w: "w:sabil" }, { w: "w:masjid" }, { w: "w:nas" }, { w: "w:dar" }] },
    ],
  },
  {
    id: "word-chest-2", wing: 2, icon: "🗃️", art: "w:bab", ref: "en85 p15 Miscellaneous",
    title: { en: "Word Chest 2", ur: "لفظوں کا صندوق ۲" },
    steps: [
      { type: "meet", words: ["w:dabba", "w:madina", "w:bab", "w:turab", "w:thamara", "w:thalatha"] },
      { type: "match", words: ["w:bab", "w:thalatha", "w:dabba", "w:turab", "w:madina", "w:thamara"] },
      { type: "meet", words: ["w:naba", "w:bushra", "w:balagh", "w:tawil", "w:layta", "w:shafaa"] },
      { type: "match", words: ["w:bushra", "w:layta", "w:naba", "w:shafaa", "w:balagh", "w:tawil"] },
      { type: "ayah", ref: "78:2" },
      { type: "ayah", ref: "36:17" },
      { type: "meet", words: ["w:marad", "w:ama", "w:albab", "w:barr", "w:lana", "w:adl"] },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:barr", seg: "good" }, { w: "w:lana", seg: "bad" }, { w: "w:adl", seg: "good" }, { w: "w:marad", seg: "bad" }] },
      { type: "match", words: ["w:ama", "w:albab", "w:marad", "w:barr"] },
      { type: "ayah", ref: "82:13" },
      { type: "ayah", ref: "15:35" },
      { type: "meet", words: ["w:daraja", "w:maqam", "w:sunna", "w:milla", "w:hudud", "w:husna", "w:malik_king"] },
      { type: "match", words: ["w:daraja", "w:hudud", "w:sunna", "w:maqam", "w:husna", "w:milla"] },
      { type: "ayah", ref: "20:8" },
      { type: "ayah", ref: "114:2" },
    ],
  },
  {
    id: "review-names-ladders", wing: 2, icon: "🏮", art: "w:ahsan", ref: "en85 pp. 7–8 (rest): attributes + noun of superiority",
    title: { en: "Review Hall 1: Names & Ladders", ur: "دہرائی ہال ۱: نام اور سیڑھیاں" },
    steps: [
      { type: "meet", words: ["w:ghaffar", "w:nasir", "w:wakil", "w:hafiz", "w:shakur", "w:amin"] },
      {
        type: "roots", seeds: [root("gfr", "غ ف ر"), root("nsr", "ن ص ر"), root("wkl", "و ك ل")],
        items: [{ w: "w:ghaffar", seed: "gfr" }, { w: "w:nasir", seed: "nsr" }, { w: "w:ghafur", seed: "gfr" }, { w: "w:wakil", seed: "wkl" }],
      },
      { type: "roots", seeds: [root("hfz", "ح ف ظ"), root("shkr", "ش ك ر"), root("amn", "أ م ن")], items: [{ w: "w:shakur", seed: "shkr" }, { w: "w:amin", seed: "amn" }, { w: "w:hafiz", seed: "hfz" }] },
      { type: "meet", words: ["w:tawwab", "w:qahhar", "w:wahhab", "w:latif", "w:halim", "w:karim", "w:ali"] },
      {
        type: "roots", seeds: [root("twb", "ت و ب"), root("qhr", "ق ه ر"), root("whb", "و ه ب"), root("ltf", "ل ط ف")],
        items: [{ w: "w:qahhar", seed: "qhr" }, { w: "w:tawwab", seed: "twb" }, { w: "w:latif", seed: "ltf" }, { w: "w:wahhab", seed: "whb" }],
      },
      { type: "roots", seeds: [root("hlm", "ح ل م"), root("krm", "ك ر م"), HKM], items: [{ w: "w:karim", seed: "krm" }, { w: "w:hakim", seed: "hkm" }, { w: "w:halim", seed: "hlm" }] },
      { type: "ayah", ref: "56:77" },
      { type: "ayah", ref: "26:107" },
      { type: "meet", words: ["w:nadhir", "w:hamim", "w:sari"] },
      { type: "match", words: ["w:sari", "w:nadhir", "w:hamim", "w:kabir"] },
      { type: "ayah", ref: "26:115" },
      { type: "meet", words: ["w:ala_more", "w:ahsan", "w:ahaqq", "w:adna", "w:azlam", "w:ahda", "w:ahabb", "w:awla"] },
      {
        type: "ladder",
        items: [
          { w: "w:ahsan", base: "w:hasana", rung: "more" }, { w: "w:ali", base: "w:ali", rung: "base" }, { w: "w:ala_more", base: "w:ali", rung: "more" },
          { w: "w:ahaqq", base: "w:haqq", rung: "more" }, { w: "w:qarib", base: "w:qarib", rung: "base" }, { w: "w:adna", base: "w:adna", rung: "more" },
          { w: "w:azlam", base: "w:azlam", rung: "more" }, { w: "w:ahda", base: "w:ihdi", rung: "more" }, { w: "w:ahabb", base: "w:ahabb", rung: "more" },
          { w: "w:wali", base: "w:wali", rung: "base" }, { w: "w:awla", base: "w:wali", rung: "more" },
        ],
      },
      { type: "ayah", ref: "75:34" },
    ],
  },
  {
    id: "review-lost-found", wing: 2, icon: "🧳", art: "w:hayth", ref: "en85 pp. 1–5, 9–11 (rest) + ur80 extras",
    title: { en: "Review Hall 2: Lost & Found", ur: "دہرائی ہال ۲: بھولے بسرے الفاظ" },
    steps: [
      { type: "meet", words: ["w:yamin", "w:shimal", "w:huna", "w:hunalika", "w:hayth"] },
      { type: "scene", scene: "sides", items: [{ w: "w:yamin", spot: "right" }, { w: "w:huna", spot: "here" }, { w: "w:shimal", spot: "left" }, { w: "w:hunalika", spot: "there" }, { w: "w:yamin", spot: "right" }] },
      { type: "ayah", ref: "56:27" },
      { type: "ayah", ref: "56:41" },
      { type: "meet", words: ["w:ala_attn", "w:lada", "w:ladun", "w:amma", "w:imma"] },
      { type: "match", words: ["w:lada", "w:amma", "w:imma", "w:ala_attn", "w:ladun", "w:hayth"] },
      { type: "ayah", ref: "43:4" },
      { type: "ayah", ref: "69:35" },
      { type: "meet", words: ["w:hud", "w:shuayb", "w:salih_prophet", "w:salih", "w:haman", "w:qarun"] },
      {
        type: "sort", segments: SENT_REFUSED,
        items: [{ w: "w:hud", seg: "sent" }, { w: "w:haman", seg: "refused" }, { w: "w:shuayb", seg: "sent" }, { w: "w:qarun", seg: "refused" }, { w: "w:salih_prophet", seg: "sent" }, { w: "w:firawn", seg: "refused" }],
      },
      { type: "meet", words: ["w:thawab", "w:sair", "w:iqab", "w:hisab", "w:liqa", "w:masir", "w:musamma"] },
      { type: "sort", segments: GARDEN_FIRE, items: [{ w: "w:thawab", seg: "garden" }, { w: "w:sair", seg: "fire" }, { w: "w:iqab", seg: "fire" }, { w: "w:ajr", seg: "garden" }, { w: "w:salih", seg: "garden" }] },
      { type: "match", words: ["w:hisab", "w:liqa", "w:masir", "w:musamma", "w:thawab"] },
      { type: "ayah", ref: "24:42" },
      { type: "meet", words: ["w:hikma", "w:ahd", "w:mithaq", "w:amr", "w:taqwa", "w:arsh", "w:tawrah", "w:injil"] },
      { type: "match", words: ["w:mithaq", "w:hikma", "w:amr", "w:ahd"] },
      { type: "ayah", ref: "27:26" },
    ],
  },
  {
    id: "reading-room-2", wing: 2, icon: "📖", art: "w:asr", ref: "Reading Room 2 (Wing 2 finale): Surah Al-Asr 103:1–3, with a Prepare step for its passage words",
    title: { en: "Reading Room: Al-Asr", ur: "مطالعہ کا کمرہ: سورۃ العصر" },
    steps: [
      { type: "meet", words: ["w:asr", "w:khusr", "w:amana", "w:amila", "w:salihat", "w:tawasaw", "w:sabr"] },
      { type: "ayah", ref: "103:1" },
      { type: "ayah", ref: "103:2" },
      { type: "ayah", ref: "103:3" },
      { type: "match", words: ["w:asr", "w:khusr", "w:salihat", "w:tawasaw"] },
      {
        type: "passage", title: { ar: "سُورَةُ الْعَصْر", en: "Surah Al-Asr (Time)", ur: "سورۃ العصر" },
        refs: [
          { ref: "103:1" },
          { ref: "103:2" },
          { ref: "103:3" },
        ],
      },
    ],
  },
  {
    id: "six-petals", wing: 3, icon: "🌼", art: "w:fataha", ref: "en85 note 11: six forms of a verb + p16 فَتَحَ",
    title: { en: "Six Petals", ur: "چھ پنکھڑیاں" },
    steps: [
      { type: "meet", words: ["w:faala", "w:fail", "w:mafool"] },
      {
        type: "petals", root: ["ف", "ع", "ل"],
        items: [
          { ar: "فَعَلَ", w: "w:faala", petal: "past" }, { ar: "يَفْعَلُ", w: "w:faala", petal: "present" }, { ar: "اِفْعَلْ", w: "w:faala", petal: "command" },
          { ar: "فَاعِل", w: "w:fail", petal: "doer" }, { ar: "مَفْعُول", w: "w:mafool", petal: "done" }, { ar: "فِعْل", w: "w:faala", petal: "action" },
        ],
      },
      { type: "meet", words: ["w:fataha", "w:fath", "w:fatih"] },
      {
        type: "petals", root: ["ف", "ت", "ح"],
        items: [
          { ar: "يَفْتَحُ", w: "w:fataha", petal: "present" }, { ar: "فَتْح", w: "w:fath", petal: "action" }, { ar: "فَتَحَ", w: "w:fataha", petal: "past" },
          { ar: "فَاتِح", w: "w:fatih", petal: "doer" }, { ar: "اِفْتَحْ", w: "w:fataha", petal: "command" }, { ar: "مَفْتُوح", w: "w:fataha", petal: "done" },
        ],
      },
      { type: "ayah", ref: "48:1" },
      { type: "ayah", ref: "77:18" },
      { type: "ayah", ref: "23:4" },
    ],
  },
  {
    id: "doing-words-1", wing: 3, icon: "✍️", art: "w:jaala", ref: "en85 p16 فَتَحَ يَفْتَحُ group",
    title: { en: "Doing Words 1", ur: "کام کے الفاظ ۱" },
    steps: [
      { type: "meet", words: ["w:jaala", "w:jail", "w:dhahaba", "w:rafaa", "w:jamaa", "w:nafaa", "w:manaa"] },
      { type: "match", words: ["w:rafaa", "w:jamaa", "w:dhahaba", "w:manaa", "w:jaala", "w:nafaa"] },
      {
        type: "petals", root: ["ج", "ع", "ل"],
        items: [{ ar: "جَعَلَ", w: "w:jaala", petal: "past" }, { ar: "جَاعِل", w: "w:jail", petal: "doer" }, { ar: "يَجْعَلُ", w: "w:jaala", petal: "present" }, { ar: "اِجْعَلْ", w: "w:jaala", petal: "command" }],
      },
      { type: "ayah", ref: "78:10" },
      { type: "ayah", ref: "78:11" },
      { type: "ayah", ref: "19:57" },
      { type: "meet", words: ["w:baatha", "w:mabuth", "w:jam", "w:naf", "w:dhahab", "w:laana"] },
      {
        type: "petals", root: ["ب", "ع", "ث"],
        items: [{ ar: "بَعَثَ", w: "w:baatha", petal: "past" }, { ar: "مَبْعُوث", w: "w:mabuth", petal: "done" }, { ar: "يَبْعَثُ", w: "w:baatha", petal: "present" }, { ar: "بَعْث", w: "w:baatha", petal: "action" }],
      },
      { type: "match", words: ["w:dhahab", "w:jam", "w:naf", "w:mabuth", "w:laana"] },
      { type: "ayah", ref: "26:88" },
      { type: "ayah", ref: "75:17" },
      { type: "meet", words: ["w:sihr", "w:sahir", "w:mashur"] },
      {
        type: "petals", root: ["س", "ح", "ر"],
        items: [{ ar: "سَاحِر", w: "w:sahir", petal: "doer" }, { ar: "سِحْر", w: "w:sihr", petal: "action" }, { ar: "مَسْحُور", w: "w:mashur", petal: "done" }],
      },
    ],
  },
  {
    id: "person-wheel", wing: 3, icon: "🎡", art: "w:nahnu", ref: "en85 pp. 39–42 conjugation tables",
    title: { en: "Person Wheel", ur: "شخص کا پہیہ" },
    steps: [
      {
        type: "wheel",
        items: [
          { ar: "فَعَلَ", w: "w:faala", person: "3ms" }, { ar: "فَعَلَتْ", w: "w:faala", person: "3fs" }, { ar: "فَعَلُوا", w: "w:faala", person: "3mp" },
          { ar: "فَعَلْتَ", w: "w:faala", person: "2ms" }, { ar: "فَعَلْتُمْ", w: "w:faala", person: "2mp" }, { ar: "فَعَلْتُ", w: "w:faala", person: "1s" },
          { ar: "فَعَلْنَا", w: "w:faala", person: "1p" },
        ],
      },
      {
        type: "wheel",
        items: [
          { ar: "يَفْعَلُ", w: "w:faala", person: "3ms" }, { ar: "يَفْعَلُونَ", w: "w:faala", person: "3mp" }, { ar: "تَفْعَلُونَ", w: "w:faala", person: "2mp" },
          { ar: "أَفْعَلُ", w: "w:faala", person: "1s" }, { ar: "نَفْعَلُ", w: "w:faala", person: "1p" },
        ],
      },
      {
        type: "wheel",
        items: [
          { ar: "جَعَلْنَا", w: "w:jaala", person: "1p" }, { ar: "ذَهَبُوا", w: "w:dhahaba", person: "3mp" }, { ar: "تَذْهَبُونَ", w: "w:dhahaba", person: "2mp" },
          { ar: "رَفَعَتْ", w: "w:rafaa", person: "3fs" }, { ar: "يَنْفَعُ", w: "w:nafaa", person: "3ms" }, { ar: "فَتَحْتُ", w: "w:fataha", person: "1s" },
          { ar: "جَمَعْتَ", w: "w:jamaa", person: "2ms" },
        ],
      },
      { type: "ayah", ref: "81:26" },
      { type: "ayah", ref: "94:4" },
      { type: "ayah", ref: "37:34" },
    ],
  },
  {
    id: "doing-words-2", wing: 3, icon: "🌿", art: "w:khalaqa", ref: "en85 p17 نَصَرَ يَنْصُرُ group",
    title: { en: "Doing Words 2", ur: "کام کے الفاظ ۲" },
    steps: [
      { type: "meet", words: ["w:khalaqa", "w:khalq", "w:khaliq", "w:razaqa", "w:rizq", "w:raziq"] },
      {
        type: "petals", root: ["خ", "ل", "ق"],
        // خَالِق (the Creator) stays a medallion card and is never put on the doer petal's picture
        items: [{ ar: "خَلَقَ", w: "w:khalaqa", petal: "past" }, { ar: "يَخْلُقُ", w: "w:khalaqa", petal: "present" }, { ar: "خَلْق", w: "w:khalq", petal: "action" }],
      },
      { type: "ayah", ref: "55:3" },
      { type: "ayah", ref: "96:2" },
      { type: "meet", words: ["w:nasara", "w:nasir_helper", "w:nasr", "w:dhakara", "w:dhikr"] },
      { type: "match", words: ["w:khalq", "w:rizq", "w:nasr", "w:dhikr", "w:nasir_helper"] },
      { type: "ayah", ref: "110:1" },
      { type: "ayah", ref: "20:34" },
      { type: "meet", words: ["w:sajada", "w:sajid", "w:sujud", "w:dakhala", "w:kharaja", "w:khuruj"] },
      {
        type: "petals", root: ["س", "ج", "د"],
        items: [{ ar: "يَسْجُدُ", w: "w:sajada", petal: "present" }, { ar: "سَجَدَ", w: "w:sajada", petal: "past" }, { ar: "سُجُود", w: "w:sujud", petal: "action" }, { ar: "اُسْجُدْ", w: "w:sajada", petal: "command" }, { ar: "سَاجِد", w: "w:sajid", petal: "doer" }],
      },
      { type: "ayah", ref: "15:30" },
      { type: "meet", words: ["w:taraka", "w:balagha", "w:baligh", "w:ablagha", "w:basata", "w:basit"] },
      { type: "match", words: ["w:taraka", "w:dakhala", "w:kharaja", "w:balagha", "w:basata", "w:sajada"] },
      { type: "ayah", ref: "37:78" },
      { type: "meet", words: ["w:hakama", "w:hakim_judge", "w:hukm", "w:hashara", "w:khalid", "w:khuld"] },
      {
        type: "petals", root: ["ح", "ك", "م"],
        items: [{ ar: "حَكَمَ", w: "w:hakama", petal: "past" }, { ar: "حُكْم", w: "w:hukm", petal: "action" }, { ar: "يَحْكُمُ", w: "w:hakama", petal: "present" }, { ar: "حَاكِم", w: "w:hakim_judge", petal: "doer" }],
      },
      { type: "match", words: ["w:hukm", "w:khalid", "w:hashara", "w:baligh", "w:khuld", "w:basit"] },
      { type: "story", panels: [{ w: "w:kharaja" }, { w: "w:dakhala" }, { w: "w:razaqa" }, { w: "w:rizq" }, { w: "w:sajada" }, { w: "w:dhakara" }] },
    ],
  },
  {
    id: "doing-words-3", wing: 3, icon: "🌾", art: "w:kataba", ref: "en85 p18 (same group, continued)",
    title: { en: "Doing Words 3", ur: "کام کے الفاظ ۳" },
    steps: [
      { type: "meet", words: ["w:shakara", "w:shakir", "w:kafara", "w:kufr"] },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:shakir", seg: "good" }, { w: "w:kufr", seg: "bad" }, { w: "w:shakara", seg: "good" }, { w: "w:kafara", seg: "bad" }, { w: "w:dhikr", seg: "good" }] },
      { type: "ayah", ref: "2:152" },
      { type: "ayah", ref: "76:3" },
      { type: "meet", words: ["w:sadaqa", "w:saddaqa", "w:sadiq", "w:sidq", "w:kataba", "w:katib", "w:katama"] },
      {
        type: "petals", root: ["ص", "د", "ق"],
        items: [{ ar: "صَدَقَ", w: "w:sadaqa", petal: "past" }, { ar: "صَادِق", w: "w:sadiq", petal: "doer" }, { ar: "يَصْدُقُ", w: "w:sadaqa", petal: "present" }, { ar: "صِدْق", w: "w:sidq", petal: "action" }],
      },
      { type: "ayah", ref: "75:31" },
      {
        type: "petals", root: ["ك", "ت", "ب"],
        items: [{ ar: "يَكْتُبُ", w: "w:kataba", petal: "present" }, { ar: "كَاتِب", w: "w:katib", petal: "doer" }, { ar: "كَتَبَ", w: "w:kataba", petal: "past" }, { ar: "مَكْتُوب", w: "w:kataba", petal: "done" }, { ar: "اُكْتُبْ", w: "w:kataba", petal: "command" }, { ar: "كِتَاب", w: "w:kitab", petal: "action" }],
      },
      { type: "meet", words: ["w:nazara", "w:nazir", "w:yashuru", "w:shair", "w:nafakha"] },
      { type: "match", words: ["w:kataba", "w:katama", "w:nazara", "w:nafakha", "w:sadiq", "w:shair"] },
      { type: "meet", words: ["w:qaada", "w:qaid", "w:quud", "w:qatala", "w:qaatala", "w:qatl"] },
      {
        type: "petals", root: ["ق", "ع", "د"],
        items: [{ ar: "قَعَدَ", w: "w:qaada", petal: "past" }, { ar: "قُعُود", w: "w:quud", petal: "action" }, { ar: "يَقْعُدُ", w: "w:qaada", petal: "present" }, { ar: "اُقْعُدْ", w: "w:qaada", petal: "command" }, { ar: "قَاعِد", w: "w:qaid", petal: "doer" }],
      },
      { type: "meet", words: ["w:abid", "w:ibada", "w:fasaqa", "w:fasiq", "w:fusuq", "w:makara", "w:makr"] },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:ibada", seg: "good" }, { w: "w:fusuq", seg: "bad" }, { w: "w:sidq", seg: "good" }, { w: "w:fasiq", seg: "bad" }, { w: "w:abid", seg: "good" }] },
      { type: "match", words: ["w:abid", "w:makr", "w:qatl", "w:ibada", "w:katib", "w:qaatala"] },
      { type: "ayah", ref: "3:54" },
      { type: "story", panels: [{ w: "w:kataba" }, { w: "w:katama" }, { w: "w:nazara" }, { w: "w:shakara" }] },
    ],
  },
  {
    id: "passive-flip", wing: 3, icon: "🔄", art: "w:khuliqa", ref: "en85 passive (فُعِلَ / يُفْعَلُ)",
    title: { en: "Passive Flip", ur: "مجہول پلٹ" },
    steps: [
      { type: "meet", words: ["w:khuliqa", "w:kutiba", "w:nufikha", "w:qutila"] },
      {
        type: "sort", segments: DOER_DONE,
        items: [
          // the doer bin shows a working figure, so its items are things people do (never a verb whose doer is Allah)
          { w: "w:kataba", seg: "doerDid" }, { w: "w:khuliqa", seg: "wasDone" }, { w: "w:kutiba", seg: "wasDone" }, { ar: "فَتَحَ", w: "w:fataha", seg: "doerDid" },
          { w: "w:nufikha", seg: "wasDone" }, { w: "w:qatala", seg: "doerDid" }, { w: "w:qutila", seg: "wasDone" }, { ar: "نَصَرَ", w: "w:nasara", seg: "doerDid" },
        ],
      },
      { type: "ayah", ref: "88:17" },
      { type: "ayah", ref: "88:18" },
      { type: "ayah", ref: "81:9" },
      { type: "meet", words: ["w:yunsarun", "w:tuhsharun", "w:yubathun", "w:rufia"] },
      {
        type: "sort", segments: DOER_DONE,
        items: [
          { ar: "يَنْصُرُ", w: "w:nasara", seg: "doerDid" }, { w: "w:yunsarun", seg: "wasDone" }, { w: "w:tuhsharun", seg: "wasDone" }, { ar: "يَذْكُرُ", w: "w:dhakara", seg: "doerDid" },
          { w: "w:yubathun", seg: "wasDone" }, { ar: "يَنْظُرُ", w: "w:nazara", seg: "doerDid" }, { ar: "جَمَعَ", w: "w:jamaa", seg: "doerDid" }, { w: "w:rufia", seg: "wasDone" },
          { ar: "فُتِحَتْ", w: "w:fataha", seg: "wasDone" }, { ar: "جُمِعَ", w: "w:jamaa", seg: "wasDone" },
        ],
      },
      { type: "ayah", ref: "23:79" },
      { type: "match", words: ["w:khuliqa", "w:rufia", "w:kutiba", "w:nufikha", "w:yunsarun", "w:tuhsharun"] },
    ],
  },
  {
    id: "doing-words-4", wing: 3, icon: "🍃", art: "w:sabara", ref: "en85 p19 ضَرَبَ يَضْرِبُ group",
    title: { en: "Doing Words 4", ur: "کام کے الفاظ ۴" },
    steps: [
      { type: "meet", words: ["w:sabara", "w:sabir", "w:sabr", "w:sabaqa", "w:sabiq"] },
      {
        type: "petals", root: ["ص", "ب", "ر"],
        items: [{ ar: "صَبَرَ", w: "w:sabara", petal: "past" }, { ar: "صَبْر", w: "w:sabr", petal: "action" }, { ar: "يَصْبِرُ", w: "w:sabara", petal: "present" }, { ar: "اِصْبِرْ", w: "w:sabara", petal: "command" }, { ar: "صَابِر", w: "w:sabir", petal: "doer" }],
      },
      { type: "ayah", ref: "74:7" },
      { type: "ayah", ref: "56:10" },
      { type: "meet", words: ["w:zalama", "w:zalim", "w:zulm", "w:kadhaba", "w:kadhib", "w:kidhb"] },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:sabr", seg: "good" }, { w: "w:zulm", seg: "bad" }, { w: "w:kidhb", seg: "bad" }, { w: "w:sabiq", seg: "good" }, { w: "w:zalim", seg: "bad" }] },
      { type: "ayah", ref: "37:63" },
      { type: "ayah", ref: "56:2" },
      { type: "meet", words: ["w:arafa", "w:maruf", "w:aqala", "w:ghafara", "w:maghfira"] },
      { type: "match", words: ["w:arafa", "w:aqala", "w:ghafara", "w:maghfira", "w:maruf"] },
      { type: "ayah", ref: "37:138" },
      { type: "meet", words: ["w:daraba", "w:hamala", "w:haml", "w:rajaa", "w:raji", "w:kasaba"] },
      {
        type: "petals", root: ["ر", "ج", "ع"],
        items: [{ ar: "يَرْجِعُ", w: "w:rajaa", petal: "present" }, { ar: "رَجَعَ", w: "w:rajaa", petal: "past" }, { ar: "رَاجِع", w: "w:raji", petal: "doer" }, { ar: "اِرْجِعْ", w: "w:rajaa", petal: "command" }],
      },
      { type: "meet", words: ["w:qadara", "w:qaadir", "w:qadr", "w:malakat"] },
      { type: "match", words: ["w:daraba", "w:hamala", "w:kasaba", "w:qadr", "w:malakat", "w:haml"] },
      { type: "story", panels: [{ w: "w:hamala" }, { w: "w:kasaba" }, { w: "w:rajaa" }, { w: "w:sabara" }] },
    ],
  },
  {
    id: "doing-words-5", wing: 3, icon: "🌻", art: "w:samia", ref: "en85 p20 سَمِعَ يَسْمَعُ group",
    title: { en: "Doing Words 5", ur: "کام کے الفاظ ۵" },
    steps: [
      { type: "meet", words: ["w:alima", "w:malum", "w:amila", "w:amil", "w:samia"] },
      {
        type: "petals", root: ["ع", "م", "ل"],
        items: [{ ar: "عَمِلَ", w: "w:amila", petal: "past" }, { ar: "عَامِل", w: "w:amil", petal: "doer" }, { ar: "يَعْمَلُ", w: "w:amila", petal: "present" }, { ar: "عَمَل", w: "w:amal", petal: "action" }, { ar: "اِعْمَلْ", w: "w:amila", petal: "command" }],
      },
      { type: "ayah", ref: "37:41" },
      { type: "ayah", ref: "37:61" },
      {
        type: "petals", root: ["ع", "ل", "م"],
        items: [{ ar: "يَعْلَمُ", w: "w:alima", petal: "present" }, { ar: "عِلْم", w: "w:ilm", petal: "action" }, { ar: "عَلِمَ", w: "w:alima", petal: "past" }, { ar: "مَعْلُوم", w: "w:malum", petal: "done" }, { ar: "اِعْلَمْ", w: "w:alima", petal: "command" }],
      },
      { type: "meet", words: ["w:hafiza", "w:haafiz", "w:shahida", "w:shaahid", "w:rahima", "w:raahim"] },
      { type: "ayah", ref: "82:10" },
      { type: "match", words: ["w:samia", "w:hafiza", "w:shahida", "w:rahima", "w:haafiz", "w:shaahid"] },
      { type: "meet", words: ["w:khasira", "w:khasir", "w:akhsar", "w:khusr", "w:labitha"] },
      { type: "ayah", ref: "103:2" },
      { type: "ayah", ref: "37:144" },
      { type: "meet", words: ["w:fariha", "w:yahzun", "w:kariha", "w:karih", "w:ukriha", "w:hasiba", "w:hasb", "w:yafqahu"] },
      { type: "match", words: ["w:fariha", "w:yahzun", "w:kariha", "w:hasiba", "w:hasb", "w:yafqahu"] },
      { type: "ayah", ref: "88:11" },
      { type: "match", words: ["w:khasir", "w:akhsar", "w:karih", "w:ukriha", "w:labitha", "w:khusr"] },
      { type: "story", panels: [{ w: "w:amila" }, { w: "w:labitha" }, { w: "w:samia" }, { w: "w:fariha" }] },
    ],
  },
  {
    id: "review-family-garden", wing: 3, icon: "🏡", art: "w:salaha", ref: "en85 pp. 16–17 rarer family forms + شَيْء, يَا",
    title: { en: "Review Hall 3: Family Garden", ur: "دہرائی ہال ۳: خاندانی باغ" },
    steps: [
      { type: "meet", words: ["w:ya", "w:shay", "w:fil", "w:salaha", "w:aslaha"] },
      { type: "ayah", ref: "20:17" },
      { type: "ayah", ref: "80:18" },
      { type: "meet", words: ["w:mansur", "w:bath", "w:majmu", "w:marfu", "w:madhkur"] },
      {
        type: "petals", root: ["ن", "ص", "ر"],
        items: [{ ar: "نَصَرَ", w: "w:nasara", petal: "past" }, { ar: "مَنصُور", w: "w:mansur", petal: "done" }, { ar: "يَنْصُرُ", w: "w:nasara", petal: "present" }, { ar: "نَاصِر", w: "w:nasir_helper", petal: "doer" }, { ar: "نَصْر", w: "w:nasr", petal: "action" }],
      },
      { type: "ayah", ref: "37:172" },
      { type: "meet", words: ["w:dhahib", "w:dhahab_going", "w:tarik", "w:kharij", "w:dakhil", "w:dhakir", "w:hashir"] },
      {
        type: "petals", root: ["ذ", "ه", "ب"],
        items: [{ ar: "ذَاهِب", w: "w:dhahib", petal: "doer" }, { ar: "ذَهَبَ", w: "w:dhahaba", petal: "past" }, { ar: "ذَهَاب", w: "w:dhahab_going", petal: "action" }, { ar: "يَذْهَبُ", w: "w:dhahaba", petal: "present" }],
      },
      { type: "match", words: ["w:tarik", "w:kharij", "w:dakhil", "w:dhakir", "w:hashir", "w:dhahib"] },
      { type: "meet", words: ["w:hashr", "w:bast", "w:khulud", "w:yakhlud", "w:akhlada", "w:jaami", "w:rafi"] },
      { type: "ayah", ref: "50:34" },
      { type: "ayah", ref: "104:3" },
      { type: "meet", words: ["w:lain", "w:malun", "w:lan_curse"] },
      {
        type: "petals", root: ["ل", "ع", "ن"],
        items: [{ ar: "لَعَنَ", w: "w:laana", petal: "past" }, { ar: "مَلْعُون", w: "w:malun", petal: "done" }, { ar: "لَاعِن", w: "w:lain", petal: "doer" }, { ar: "لَعْن", w: "w:lan_curse", petal: "action" }],
      },
      { type: "match", words: ["w:hashr", "w:bast", "w:khulud", "w:majmu", "w:marfu", "w:madhkur"] },
      { type: "match", words: ["w:fil", "w:bath", "w:aslaha", "w:salaha", "w:shay", "w:ya"] },
    ],
  },
  {
    id: "review-family-orchard", wing: 3, icon: "🌳", art: "w:hifz", ref: "en85 pp. 18–20 rarer family forms + أَبْصَرَ",
    title: { en: "Review Hall 4: Family Orchard", ur: "دہرائی ہال ۴: خاندانی باغیچہ" },
    steps: [
      { type: "meet", words: ["w:shir", "w:shukr", "w:mashkur", "w:asdaq", "w:fisq", "w:maktub", "w:makir"] },
      {
        type: "petals", root: ["ش", "ك", "ر"],
        items: [{ ar: "شَكَرَ", w: "w:shakara", petal: "past" }, { ar: "شُكْر", w: "w:shukr", petal: "action" }, { ar: "يَشْكُرُ", w: "w:shakara", petal: "present" }, { ar: "مَشْكُور", w: "w:mashkur", petal: "done" }, { ar: "شَاكِر", w: "w:shakir", petal: "doer" }],
      },
      { type: "meet", words: ["w:nazar", "w:darb", "w:hamil", "w:masbuq", "w:sabq", "w:raj", "w:mazlum"] },
      { type: "ayah", ref: "86:11" },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:shukr", seg: "good" }, { w: "w:fisq", seg: "bad" }, { w: "w:mashkur", seg: "good" }, { w: "w:zulm", seg: "bad" }, { w: "w:sabq", seg: "good" }] },
      {
        type: "petals", root: ["ظ", "ل", "م"],
        items: [{ ar: "ظَالِم", w: "w:zalim", petal: "doer" }, { ar: "ظَلَمَ", w: "w:zalama", petal: "past" }, { ar: "ظُلْم", w: "w:zulm", petal: "action" }, { ar: "مَظْلُوم", w: "w:mazlum", petal: "done" }],
      },
      { type: "meet", words: ["w:maqdur", "w:makdhub", "w:mamluk", "w:basurat", "w:absara", "w:ghafir"] },
      { type: "ayah", ref: "51:21" },
      { type: "ayah", ref: "69:39" },
      { type: "meet", words: ["w:hazan", "w:huzn", "w:hasaba", "w:mahfuz", "w:hifz"] },
      {
        type: "petals", root: ["ح", "ف", "ظ"],
        items: [{ ar: "حَفِظَ", w: "w:hafiza", petal: "past" }, { ar: "حِفْظ", w: "w:hifz", petal: "action" }, { ar: "مَحْفُوظ", w: "w:mahfuz", petal: "done" }, { ar: "حَافِظ", w: "w:haafiz", petal: "doer" }, { ar: "يَحْفَظُ", w: "w:hafiza", petal: "present" }],
      },
      { type: "meet", words: ["w:mashhud", "w:makruh", "w:kurh", "w:labith"] },
      { type: "ayah", ref: "85:3" },
      { type: "match", words: ["w:nazar", "w:darb", "w:hamil", "w:masbuq", "w:raj", "w:maqdur"] },
      { type: "match", words: ["w:makdhub", "w:mamluk", "w:hazan", "w:huzn", "w:makruh", "w:kurh"] },
      { type: "match", words: ["w:labith", "w:mashhud", "w:hasaba", "w:basurat", "w:shir", "w:maktub"] },
    ],
  },
  {
    id: "person-wheel-2", wing: 3, icon: "🎠", art: "w:huma", ref: "en85 p2 pronouns (two people, many women) + verb tables",
    title: { en: "Person Wheel 2", ur: "شخص کا پہیہ ۲" },
    steps: [
      { type: "meet", words: ["w:huma", "w:huma_end", "w:antuma", "w:kuma", "w:faala_two", "w:faalata_two"] },
      {
        type: "wheel", persons: ["3ms", "3d", "3mp", "2ms", "2d", "2mp"],
        items: [
          { w: "w:huma", person: "3d" }, { w: "w:huwa", person: "3ms" }, { w: "w:antuma", person: "2d" }, { w: "w:humu", person: "3mp" },
          { w: "w:kuma", person: "2d" }, { w: "w:anta", person: "2ms" }, { w: "w:huma_end", person: "3d" }, { w: "w:antum", person: "2mp" },
        ],
      },
      { type: "ayah", ref: "37:118" },
      { type: "ayah", ref: "37:119" },
      { type: "meet", words: ["w:kadhdhaba"] },
      { type: "ayah", ref: "55:13" },
      { type: "meet", words: ["w:hunna", "w:hunna_end", "w:kunna", "w:ki"] },
      {
        type: "wheel", persons: ["3fs", "3fp", "3mp", "2fs", "2fp", "2mp"],
        items: [
          { w: "w:hunna", person: "3fp" }, { w: "w:hiya", person: "3fs" }, { w: "w:ki", person: "2fs" }, { w: "w:kunna", person: "2fp" },
          { w: "w:humu", person: "3mp" }, { w: "w:hunna_end", person: "3fp" }, { w: "w:kum", person: "2mp" },
        ],
      },
      { type: "ayah", ref: "71:16" },
      { type: "ayah", ref: "89:29" },
      { type: "ayah", ref: "89:30" },
      {
        type: "wheel", persons: ["3ms", "3fs", "3d", "3mp", "3fp", "2d", "2fs"],
        items: [
          { ar: "فَعَلَا", w: "w:faala_two", person: "3d" }, { ar: "فَعَلْنَ", w: "w:faala", person: "3fp" }, { ar: "فَعَلْتِ", w: "w:faala", person: "2fs" },
          { ar: "فَعَلَتَا", w: "w:faalata_two", person: "3d" }, { ar: "فَعَلْتُمَا", w: "w:faala", person: "2d" }, { ar: "فَعَلُوا", w: "w:faala", person: "3mp" },
          { ar: "فَعَلَتْ", w: "w:faala", person: "3fs" },
        ],
      },
      { type: "match", words: ["w:huma", "w:antuma", "w:hunna", "w:kunna", "w:ki", "w:kadhdhaba"] },
    ],
  },
  {
    id: "reading-room-3", wing: 3, icon: "📖", art: "w:abid", ref: "Reading Room 3 (Wing 3 finale): Surah Al-Kafirun 109:1–6 — every word already learnt, so no Prepare step",
    title: { en: "Reading Room: Al-Kafirun", ur: "مطالعہ کا کمرہ: سورۃ الکافرون" },
    steps: [
      { type: "ayah", ref: "109:1" },
      { type: "ayah", ref: "109:2" },
      { type: "ayah", ref: "109:3" },
      {
        // who is speaking: "I" or "you all" — the surah turns on it
        type: "wheel",
        items: [
          { ar: "أَعْبُدُ", w: "w:nabudu", person: "1s" }, { ar: "تَعْبُدُونَ", w: "w:nabudu", person: "2mp" },
          { ar: "عَبَدْتُمْ", w: "w:nabudu", person: "2mp" }, { ar: "أَنَا", w: "w:ana", person: "1s" }, { ar: "أَنْتُمْ", w: "w:antum", person: "2mp" },
        ],
      },
      { type: "ayah", ref: "109:4" },
      { type: "ayah", ref: "109:5" },
      { type: "ayah", ref: "109:6" },
      {
        // when: the surah repeats itself in the present and the past
        type: "timeline", segments: TIME,
        items: [{ ar: "أَعْبُدُ", w: "w:nabudu", seg: "now" }, { ar: "عَبَدْتُمْ", w: "w:nabudu", seg: "past" }, { ar: "تَعْبُدُونَ", w: "w:nabudu", seg: "now" }],
      },
      { type: "match", words: ["w:kafir", "w:abid", "w:nabudu", "w:din"] },
      {
        type: "passage", title: { ar: "سُورَةُ الْكَافِرُون", en: "Surah Al-Kafirun (The Rejecters of Faith)", ur: "سورۃ الکافرون" },
        refs: [
          { ref: "109:1" },
          { ref: "109:2" },
          { ref: "109:3" },
          { ref: "109:4" },
          { ref: "109:5" },
          { ref: "109:6" },
        ],
      },
    ],
  },
  {
    id: "soft-letters-1", wing: 4, icon: "🏮", art: "w:wajada", ref: "en85 p21 verbs that start with و",
    title: { en: "Soft Letters 1", ur: "نرم حروف ۱" },
    steps: [
      { type: "meet", words: ["w:wajada", "w:waada", "w:wad", "w:waada3", "w:wahaba"] },
      {
        type: "petals", root: ["و", "ع", "د"],
        items: [{ ar: "وَعَدَ", w: "w:waada", petal: "past" }, { ar: "يَعِدُ", w: "w:waada", petal: "present" }, { ar: "وَعْد", w: "w:wad", petal: "action" }, { ar: "مَوْعُود", w: "w:waada", petal: "done" }],
      },
      { type: "ayah", ref: "51:5" },
      { type: "ayah", ref: "37:100" },
      { type: "meet", words: ["w:waqaa", "w:waqi", "w:wadaa", "w:yadharu", "w:yaziru", "w:wizr"] },
      { type: "match", words: ["w:wajada", "w:waada", "w:wahaba", "w:waqaa", "w:wadaa", "w:yadharu"] },
      { type: "ayah", ref: "51:6" },
      { type: "ayah", ref: "52:7" },
      { type: "meet", words: ["w:yasifu", "w:yasilu", "w:waaza", "w:waqa", "w:wasia", "w:wasi", "w:saa_plenty"] },
      {
        // the soft letters fall away one by one: وَقَى → يَقِي → قِ ("protect!", as in قِنَا عَذَابَ النَّارِ)
        type: "petals", root: ["و", "ق", "ي"],
        items: [{ ar: "وَقَى", w: "w:waqa", petal: "past" }, { ar: "يَقِي", w: "w:waqa", petal: "present" }, { ar: "قِ", w: "w:waqa", petal: "command" }],
      },
      { type: "meet", words: ["w:waritha", "w:warith"] },
      { type: "match", words: ["w:yasifu", "w:yasilu", "w:waaza", "w:waqa", "w:saa_plenty", "w:wizr"] },
      { type: "story", panels: [{ w: "w:wadaa" }, { w: "w:yadharu" }, { w: "w:wajada" }, { w: "w:wahaba" }] },
    ],
  },
  {
    id: "soft-letters-2", wing: 4, icon: "🗣️", art: "w:qala", ref: "en85 p22 hollow verbs (the middle letter changes)",
    title: { en: "Soft Letters 2", ur: "نرم حروف ۲" },
    steps: [
      { type: "meet", words: ["w:qala", "w:qawl", "w:qail", "w:kana"] },
      {
        type: "petals", root: ["ق", "و", "ل"],
        items: [{ ar: "قَالَ", w: "w:qala", petal: "past" }, { ar: "يَقُولُ", w: "w:qala", petal: "present" }, { ar: "قُلْ", w: "w:qala", petal: "command" }, { ar: "قَائِل", w: "w:qail", petal: "doer" }, { ar: "قَوْل", w: "w:qawl", petal: "action" }],
      },
      { type: "ayah", ref: "15:93" },
      { type: "ayah", ref: "20:35" },
      { type: "meet", words: ["w:jaa", "w:shaa", "w:zada", "w:kada", "w:saaa"] },
      { type: "match", words: ["w:qala", "w:kana", "w:jaa", "w:shaa", "w:zada", "w:kada"] },
      { type: "ayah", ref: "54:16" },
      { type: "meet", words: ["w:qama", "w:qaim", "w:taba", "w:tawba", "w:dhaqa"] },
      {
        type: "petals", root: ["ق", "و", "م"],
        items: [{ ar: "يَقُومُ", w: "w:qama", petal: "present" }, { ar: "قَامَ", w: "w:qama", petal: "past" }, { ar: "قَائِم", w: "w:qaim", petal: "doer" }, { ar: "قُمْ", w: "w:qama", petal: "command" }],
      },
      { type: "ayah", ref: "70:33" },
      { type: "meet", words: ["w:maata", "w:mawt", "w:khafa", "w:khawf"] },
      { type: "match", words: ["w:taba", "w:tawba", "w:dhaqa", "w:maata", "w:mawt", "w:khawf"] },
      { type: "story", panels: [{ w: "w:jaa" }, { w: "w:qala" }, { w: "w:qama" }, { w: "w:dhaqa" }, { w: "w:zada" }] },
    ],
  },
  {
    id: "soft-letters-3", wing: 4, icon: "🤲", art: "w:daa", ref: "en85 p23 verbs that end in a soft letter",
    title: { en: "Soft Letters 3", ur: "نرم حروف ۳" },
    steps: [
      { type: "meet", words: ["w:raa", "w:ata", "w:ata_give", "w:daa", "w:dua"] },
      {
        type: "petals", root: ["د", "ع", "و"],
        items: [{ ar: "دَعَا", w: "w:daa", petal: "past" }, { ar: "يَدْعُو", w: "w:daa", petal: "present" }, { ar: "اُدْعُ", w: "w:daa", petal: "command" }, { ar: "دُعَاء", w: "w:dua", petal: "action" }],
      },
      { type: "ayah", ref: "20:9" },
      { type: "ayah", ref: "23:73" },
      { type: "ayah", ref: "26:218" },
      { type: "meet", words: ["w:tala", "w:jara", "w:qada", "w:jazaa_v", "w:saa_strive", "w:say", "w:aba"] },
      { type: "match", words: ["w:raa", "w:ata", "w:daa", "w:tala", "w:jara", "w:qada"] },
      { type: "ayah", ref: "26:69" },
      { type: "ayah", ref: "15:64" },
      { type: "meet", words: ["w:radiya", "w:ridwan", "w:khashiya", "w:khashya", "w:nasiya", "w:ansa", "w:hady", "w:hadi"] },
      { type: "match", words: ["w:radiya", "w:ridwan", "w:khashiya", "w:nasiya", "w:jazaa_v", "w:saa_strive"] },
      { type: "story", panels: [{ w: "w:saa_strive" }, { w: "w:raa" }, { w: "w:daa" }, { w: "w:ata_give" }, { w: "w:radiya" }] },
    ],
  },
  {
    id: "soft-letters-4", wing: 4, icon: "🔁", art: "w:zill", ref: "en85 p24 doubled verbs",
    title: { en: "Doubled Letters", ur: "دوہرے حروف" },
    steps: [
      { type: "meet", words: ["w:dalla", "w:adalla", "w:dalala", "w:dalal", "w:radda", "w:raadd", "w:mardud", "w:radd"] },
      {
        // the doubled letter is written once with a shadda (رَدَّ) or twice when a vowel splits it (مَرْدُود)
        type: "petals", root: ["ر", "د", "د"],
        items: [{ ar: "رَدَّ", w: "w:radda", petal: "past" }, { ar: "يَرُدُّ", w: "w:radda", petal: "present" }, { ar: "رَادّ", w: "w:raadd", petal: "doer" }, { ar: "مَرْدُود", w: "w:mardud", petal: "done" }, { ar: "رَدّ", w: "w:radd", petal: "action" }],
      },
      { type: "ayah", ref: "26:99" },
      { type: "meet", words: ["w:madda", "w:mamdud", "w:madd", "w:zill", "w:hayy", "w:ahya", "w:hayat"] },
      { type: "ayah", ref: "56:30" },
      { type: "ayah", ref: "84:3" },
      { type: "ayah", ref: "74:12" },
      { type: "match", words: ["w:dalla", "w:radda", "w:madda", "w:zill", "w:hayy", "w:hayat"] },
      { type: "meet", words: ["w:zanna", "w:zann", "w:zaann", "w:sadda", "w:sadd", "w:gharra", "w:ghurur"] },
      { type: "ayah", ref: "82:6" },
      { type: "meet", words: ["w:durr", "w:yadurru", "w:daarr", "w:darr", "w:massa", "w:mass"] },
      { type: "meet", words: ["w:wadda", "w:wudd", "w:farrat", "w:firar", "w:yuhiqqu", "w:haqiq"] },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:wudd", seg: "good" }, { w: "w:durr", seg: "bad" }, { w: "w:hayat", seg: "good" }, { w: "w:dalal", seg: "bad" }, { w: "w:zill", seg: "good" }, { w: "w:ghurur", seg: "bad" }] },
      { type: "match", words: ["w:zanna", "w:sadda", "w:gharra", "w:massa", "w:wadda", "w:firar"] },
      { type: "match", words: ["w:adalla", "w:mardud", "w:mamdud", "w:ahya", "w:yadurru", "w:haqiq"] },
      { type: "story", panels: [{ w: "w:dalla" }, { w: "w:zill" }, { w: "w:radda" }, { w: "w:hayat" }] },
    ],
  },
  {
    id: "soft-letters-5", wing: 4, icon: "✴️", art: "w:amana", ref: "en85 p25 verbs with a hamza (ء)",
    title: { en: "Hamza Verbs", ur: "ہمزہ والے افعال" },
    steps: [
      { type: "meet", words: ["w:amana", "w:iman", "w:mumin", "w:mumina", "w:amina", "w:amn", "w:amin_safe", "w:mamun"] },
      {
        type: "petals", root: ["ء", "م", "ن"],
        items: [{ ar: "آمَنَ", w: "w:amana", petal: "past" }, { ar: "يُؤْمِنُ", w: "w:amana", petal: "present" }, { ar: "مُؤْمِن", w: "w:mumin", petal: "doer" }, { ar: "إِيمَان", w: "w:iman", petal: "action" }],
      },
      { type: "ayah", ref: "36:25" },
      { type: "ayah", ref: "37:111" },
      { type: "ayah", ref: "15:46" },
      { type: "meet", words: ["w:saala", "w:sail", "w:masul", "w:sual", "w:amara", "w:akhadha", "w:akhdh"] },
      {
        type: "petals", root: ["س", "ء", "ل"],
        items: [{ ar: "يَسْأَلُ", w: "w:saala", petal: "present" }, { ar: "سَأَلَ", w: "w:saala", petal: "past" }, { ar: "سَائِل", w: "w:sail", petal: "doer" }, { ar: "مَسْئُول", w: "w:masul", petal: "done" }, { ar: "سُؤَال", w: "w:sual", petal: "action" }],
      },
      { type: "ayah", ref: "21:23" },
      { type: "match", words: ["w:amana", "w:mumin", "w:amn", "w:saala", "w:amara", "w:akhadha"] },
      { type: "meet", words: ["w:akala", "w:makul", "w:akl", "w:qaraa", "w:badaa", "w:adhina", "w:adhan"] },
      { type: "meet", words: ["w:ufika", "w:dharaa", "w:yadrau", "w:yajaru", "w:yasamu"] },
      { type: "match", words: ["w:akala", "w:akl", "w:qaraa", "w:badaa", "w:adhina", "w:iman"] },
      { type: "match", words: ["w:ufika", "w:dharaa", "w:yadrau", "w:yajaru", "w:yasamu", "w:makul"] },
      { type: "story", panels: [{ w: "w:badaa" }, { w: "w:qaraa" }, { w: "w:amana" }, { w: "w:amn" }] },
    ],
  },
  {
    id: "reading-room-4", wing: 4, icon: "📖", art: "w:wasia", ref: "Reading Room 4 (Wing 4 finale): Ayat al-Kursi 2:255, played in four parts and read in nine phrases (its pause marks)",
    title: { en: "Reading Room: Ayat al-Kursi", ur: "مطالعہ کا کمرہ: آیت الکرسی" },
    steps: [
      { type: "meet", words: ["w:qayyum", "w:sina", "w:nawm", "w:yashfau", "w:ahata", "w:kursi", "w:yaudu"] },
      { type: "ayah", ref: "2:255", part: [1, 12] },
      { type: "ayah", ref: "2:255", part: [13, 26] },
      { type: "match", words: ["w:sina", "w:nawm", "w:yashfau", "w:yaudu"] },
      { type: "ayah", ref: "2:255", part: [27, 40] },
      { type: "ayah", ref: "2:255", part: [41, 50] },
      {
        type: "passage", whole: "ayah", title: { ar: "آيَةُ الْكُرْسِيّ", en: "Ayat al-Kursi (the Verse of the Kursi, 2:255)", ur: "آیت الکرسی" },
        refs: [
          { ref: "2:255", part: [1, 7] },
          { ref: "2:255", part: [8, 12] },
          { ref: "2:255", part: [13, 19] },
          { ref: "2:255", part: [20, 26] },
          { ref: "2:255", part: [27, 32] },
          { ref: "2:255", part: [33, 40] },
          { ref: "2:255", part: [41, 44] },
          { ref: "2:255", part: [45, 47] },
          { ref: "2:255", part: [48, 50] },
        ],
      },
    ],
  },
  {
    // Wing 5 opens the grown forms: a pattern mould takes a root the player knows and grows a new meaning from it
    id: "grown-forms-1", wing: 5, icon: "✒️", art: "w:allama", ref: "en85 p26 the mould فَعَّلَ",
    title: { en: "Strong Middle 1", ur: "مضبوط درمیان ۱" },
    steps: [
      { type: "meet", words: ["w:allama", "w:dhakkara", "w:mudhakkir", "w:sabbaha", "w:musabbih", "w:bashshara"] },
      {
        type: "grow", mould: "II",
        items: [
          { base: "w:alima", w: "w:allama", root: ["ع", "ل", "م"] },
          { base: "w:dhakara", w: "w:dhakkara", root: ["ذ", "ك", "ر"] },
          { base: "w:bushra", w: "w:bashshara", root: ["ب", "ش", "ر"] },
          { base: "w:kadhaba", w: "w:kadhdhaba", root: ["ك", "ذ", "ب"] },
        ],
      },
      { type: "ayah", ref: "96:4" },
      { type: "ayah", ref: "55:2" },
      { type: "ayah", ref: "88:21" },
      { type: "ayah", ref: "87:1" },
      { type: "meet", words: ["w:bayyana", "w:baddala", "w:tabdil", "w:harrama", "w:zayyana", "w:tahhara", "w:dhukkira", "w:adhdhaba"] },
      { type: "ayah", ref: "37:13" },
      { type: "ayah", ref: "74:4" },
      {
        type: "grow", mould: "II",
        items: [
          { base: "w:haram", w: "w:harrama", root: ["ح", "ر", "م"] },
          { base: "w:azab", w: "w:adhdhaba", root: ["ع", "ذ", "ب"] },
          { base: "w:bayyina", w: "w:bayyana", root: ["ب", "ي", "ن"] },
          { base: "w:sadaqa", w: "w:saddaqa", root: ["ص", "د", "ق"] },
        ],
      },
      { type: "match", words: ["w:allama", "w:dhakkara", "w:sabbaha", "w:bashshara", "w:bayyana", "w:harrama"] },
      { type: "meet", words: ["w:sakhkhara", "w:sakhira", "w:musaddiq", "w:mubashshir"] },
      { type: "ayah", ref: "84:24" },
      {
        type: "petals", root: ["ذ", "ك", "ر"],
        items: [{ ar: "ذَكَّرَ", w: "w:dhakkara", petal: "past" }, { ar: "يُذَكِّرُ", w: "w:dhakkara", petal: "present" }, { ar: "ذَكِّرْ", w: "w:dhakkara", petal: "command" }, { ar: "مُذَكِّر", w: "w:mudhakkir", petal: "doer" }, { ar: "تَذْكِير", w: "w:dhakkara", petal: "action" }],
      },
      { type: "match", words: ["w:baddala", "w:zayyana", "w:tahhara", "w:sakhkhara", "w:sakhira", "w:musaddiq"] },
      { type: "match", words: ["w:tabdil", "w:mudhakkir", "w:musabbih", "w:adhdhaba", "w:mubashshir", "w:dhukkira"] },
      { type: "story", panels: [{ w: "w:allama" }, { w: "w:dhakkara" }, { w: "w:tahhara" }, { w: "w:sabbaha" }, { w: "w:bashshara" }] },
    ],
  },
  {
    id: "grown-forms-2", wing: 5, icon: "🌧️", art: "w:nazzala", ref: "en85 p27 more فَعَّلَ verbs",
    title: { en: "Strong Middle 2", ur: "مضبوط درمیان ۲" },
    steps: [
      { type: "meet", words: ["w:nazzala", "w:tanzil", "w:qaddara", "w:taqdir", "w:qaddama", "w:mukadhdhib"] },
      { type: "ayah", ref: "15:9" },
      { type: "ayah", ref: "26:192" },
      { type: "ayah", ref: "87:3" },
      { type: "ayah", ref: "89:24" },
      { type: "ayah", ref: "83:10" },
      { type: "meet", words: ["w:kaffara", "w:kallama", "w:mattaa", "w:nabbaa", "w:najja"] },
      {
        type: "grow", mould: "II",
        items: [
          { base: "w:qadara", w: "w:qaddara", root: ["ق", "د", "ر"] },
          { base: "w:kafara", w: "w:kaffara", root: ["ك", "ف", "ر"] },
          { base: "w:naba", w: "w:nabbaa", root: ["ن", "ب", "ء"] },
          { base: "w:kalima", w: "w:kallama", root: ["ك", "ل", "م"] },
          { base: "w:mataa", w: "w:mattaa", root: ["م", "ت", "ع"] },
        ],
      },
      { type: "ayah", ref: "37:148" },
      { type: "ayah", ref: "26:170" },
      { type: "meet", words: ["w:waffa", "w:walla", "w:fassala", "w:tafsil"] },
      {
        type: "petals", root: ["ن", "ز", "ل"],
        items: [{ ar: "نَزَّلَ", w: "w:nazzala", petal: "past" }, { ar: "يُنَزِّلُ", w: "w:nazzala", petal: "present" }, { ar: "تَنْزِيل", w: "w:tanzil", petal: "action" }],
      },
      { type: "match", words: ["w:nazzala", "w:qaddara", "w:qaddama", "w:kaffara", "w:kallama", "w:najja"] },
      { type: "match", words: ["w:mattaa", "w:nabbaa", "w:waffa", "w:walla", "w:fassala", "w:mukadhdhib"] },
      { type: "match", words: ["w:tanzil", "w:taqdir", "w:tafsil", "w:allama", "w:baddala", "w:zayyana"] },
      { type: "story", panels: [{ w: "w:nazzala" }, { w: "w:najja" }, { w: "w:mattaa" }, { w: "w:qaddama" }] },
    ],
  },
  {
    id: "grown-forms-3", wing: 5, icon: "🐪", art: "w:haajara", ref: "en85 p28 the mould فَاعَلَ",
    title: { en: "Together Verbs", ur: "ساتھ والے افعال" },
    steps: [
      { type: "meet", words: ["w:qital", "w:jaahada", "w:jihad", "w:mujahid", "w:jaadala", "w:mulaqi"] },
      {
        type: "grow", mould: "III",
        items: [
          { base: "w:qatala", w: "w:qaatala", root: ["ق", "ت", "ل"] },
          { base: "w:hisab", w: "w:hasaba", root: ["ح", "س", "ب"] },
          { base: "w:liqa", w: "w:mulaqi", root: ["ل", "ق", "ي"] },
        ],
      },
      { type: "ayah", ref: "29:6" },
      { type: "ayah", ref: "22:68" },
      { type: "ayah", ref: "69:20" },
      { type: "meet", words: ["w:naada", "w:nida", "w:nudiya", "w:haajara", "w:muhajir"] },
      { type: "ayah", ref: "79:23" },
      { type: "ayah", ref: "19:3" },
      { type: "ayah", ref: "20:11" },
      {
        type: "petals", root: ["ج", "ه", "د"],
        items: [{ ar: "جَاهَدَ", w: "w:jaahada", petal: "past" }, { ar: "يُجَاهِدُ", w: "w:jaahada", petal: "present" }, { ar: "جَاهِدْ", w: "w:jaahada", petal: "command" }, { ar: "مُجَاهِد", w: "w:mujahid", petal: "doer" }, { ar: "جِهَاد", w: "w:jihad", petal: "action" }],
      },
      { type: "match", words: ["w:jaahada", "w:jaadala", "w:naada", "w:haajara", "w:qital", "w:nida"] },
      { type: "meet", words: ["w:baaraka", "w:mubarak", "w:yudaifu", "w:shaaqqa", "w:shiqaq", "w:munafiq", "w:munafiqa"] },
      { type: "ayah", ref: "4:138" },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:mubarak", seg: "good" }, { w: "w:munafiq", seg: "bad" }, { w: "w:muhajir", seg: "good" }, { w: "w:shiqaq", seg: "bad" }, { w: "w:mujahid", seg: "good" }, { w: "w:munafiqa", seg: "bad" }] },
      { type: "match", words: ["w:baaraka", "w:mubarak", "w:yudaifu", "w:shaaqqa", "w:shiqaq", "w:nudiya"] },
      { type: "match", words: ["w:jihad", "w:mujahid", "w:muhajir", "w:mulaqi", "w:munafiq", "w:munafiqa"] },
      { type: "story", panels: [{ w: "w:haajara" }, { w: "w:jaahada" }, { w: "w:naada" }, { w: "w:mulaqi" }] },
    ],
  },
  {
    // The mould أَفْعَلَ puts أَ in front of the root: make something happen (خَرَجَ go out → أَخْرَجَ bring out)
    id: "grown-forms-4", wing: 5, icon: "📤", art: "w:akhraja", ref: "en85 p29 the mould أَفْعَلَ",
    title: { en: "Make-It Verbs 1", ur: "کروانے والے افعال ۱" },
    steps: [
      { type: "meet", words: ["w:arsala", "w:mursal", "w:akhraja", "w:mukhraj", "w:adkhala", "w:asmaa"] },
      {
        type: "grow", mould: "IV",
        items: [
          { base: "w:kharaja", w: "w:akhraja", root: ["خ", "ر", "ج"] },
          { base: "w:dakhala", w: "w:adkhala", root: ["د", "خ", "ل"] },
          { base: "w:samia", w: "w:asmaa", root: ["س", "م", "ع"] },
          { base: "w:rasul", w: "w:arsala", root: ["ر", "س", "ل"] },
        ],
      },
      { type: "ayah", ref: "21:107" },
      { type: "ayah", ref: "26:57" },
      { type: "ayah", ref: "21:75" },
      { type: "meet", words: ["w:aslama", "w:islam", "w:muslim", "w:ashraka", "w:mushrik", "w:mukhlis", "w:mukhlas"] },
      { type: "ayah", ref: "68:35" },
      { type: "ayah", ref: "20:32" },
      { type: "ayah", ref: "15:40" },
      { type: "meet", words: ["w:ahsana", "w:muhsin", "w:ihsan", "w:asrafa", "w:musrif", "w:asbaha", "w:muslih", "w:islah", "w:mubsir"] },
      {
        type: "grow", mould: "IV",
        items: [
          { base: "w:sharik", w: "w:ashraka", root: ["ش", "ر", "ك"] },
          { base: "w:salam", w: "w:aslama", root: ["س", "ل", "م"] },
          { base: "w:hasana", w: "w:ahsana", root: ["ح", "س", "ن"] },
        ],
      },
      { type: "ayah", ref: "37:110" },
      {
        type: "petals", root: ["س", "ل", "م"],
        items: [{ ar: "أَسْلَمَ", w: "w:aslama", petal: "past" }, { ar: "يُسْلِمُ", w: "w:aslama", petal: "present" }, { ar: "أَسْلِمْ", w: "w:aslama", petal: "command" }, { ar: "مُسْلِم", w: "w:muslim", petal: "doer" }, { ar: "إِسْلَام", w: "w:islam", petal: "action" }],
      },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:muhsin", seg: "good" }, { w: "w:mushrik", seg: "bad" }, { w: "w:muslih", seg: "good" }, { w: "w:musrif", seg: "bad" }, { w: "w:mukhlis", seg: "good" }, { w: "w:ihsan", seg: "good" }] },
      { type: "match", words: ["w:arsala", "w:akhraja", "w:adkhala", "w:asmaa", "w:aslama", "w:ashraka"] },
      { type: "match", words: ["w:ahsana", "w:asrafa", "w:asbaha", "w:muslim", "w:mukhlis", "w:mubsir"] },
      { type: "match", words: ["w:mukhraj", "w:mukhlas", "w:musrif", "w:muslih", "w:islah", "w:ihsan"] },
      { type: "story", panels: [{ w: "w:asbaha" }, { w: "w:akhraja" }, { w: "w:ahsana" }, { w: "w:aslama" }] },
    ],
  },
  {
    id: "grown-forms-5", wing: 5, icon: "🗼", art: "w:andhara", ref: "en85 p30 more أَفْعَلَ verbs",
    title: { en: "Make-It Verbs 2", ur: "کروانے والے افعال ۲" },
    steps: [
      { type: "meet", words: ["w:nazala", "w:anzala", "w:andhara", "w:mundhir", "w:mundhar", "w:aflaha", "w:muflih"] },
      {
        type: "grow", mould: "IV",
        items: [
          { base: "w:nazala", w: "w:anzala", root: ["ن", "ز", "ل"] },
          { base: "w:nadhir", w: "w:andhara", root: ["ن", "ذ", "ر"] },
        ],
      },
      { type: "ayah", ref: "12:2" },
      { type: "ayah", ref: "23:1" },
      { type: "ayah", ref: "37:72" },
      { type: "ayah", ref: "37:73" },
      { type: "meet", words: ["w:aarada", "w:murid", "w:aghraqa", "w:afsada", "w:mufsid", "w:ahlaka", "w:munkar"] },
      { type: "ayah", ref: "2:12" },
      { type: "ayah", ref: "26:66" },
      { type: "ayah", ref: "15:81" },
      { type: "ayah", ref: "15:62" },
      { type: "meet", words: ["w:aqsama", "w:amsaka", "w:anbata", "w:anshaa", "w:anfaqa"] },
      {
        type: "petals", root: ["ن", "ف", "ق"],
        items: [{ ar: "أَنْفَقَ", w: "w:anfaqa", petal: "past" }, { ar: "يُنْفِقُ", w: "w:anfaqa", petal: "present" }, { ar: "أَنْفِقْ", w: "w:anfaqa", petal: "command" }, { ar: "مُنْفِق", w: "w:anfaqa", petal: "doer" }, { ar: "إِنْفَاق", w: "w:anfaqa", petal: "action" }],
      },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:muflih", seg: "good" }, { w: "w:mufsid", seg: "bad" }, { w: "w:anfaqa", seg: "good" }, { w: "w:munkar", seg: "bad" }, { w: "w:aflaha", seg: "good" }, { w: "w:murid", seg: "bad" }] },
      { type: "match", words: ["w:anzala", "w:andhara", "w:aflaha", "w:aarada", "w:aghraqa", "w:afsada"] },
      { type: "match", words: ["w:ahlaka", "w:aqsama", "w:amsaka", "w:anbata", "w:anshaa", "w:anfaqa"] },
      { type: "match", words: ["w:nazala", "w:mundhir", "w:mundhar", "w:murid", "w:mufsid", "w:munkar"] },
      { type: "story", panels: [{ w: "w:anzala" }, { w: "w:anbata" }, { w: "w:anfaqa" }, { w: "w:aflaha" }] },
    ],
  },
  {
    id: "grown-forms-6", wing: 5, icon: "🕌", art: "w:aqama", ref: "en85 p31 hollow roots in the أَفْعَلَ mould",
    title: { en: "Make-It Verbs 3", ur: "کروانے والے افعال ۳" },
    steps: [
      { type: "meet", words: ["w:aqama", "w:muqim", "w:adhaqa", "w:aada", "w:amata", "w:mamat"] },
      {
        // a hollow root keeps its soft middle hidden: قَامَ → أَقَامَ يُقِيمُ
        type: "grow", mould: "IV",
        items: [
          { base: "w:qama", w: "w:aqama", root: ["ق", "و", "م"] },
          { base: "w:dhaqa", w: "w:adhaqa", root: ["ذ", "و", "ق"] },
          { base: "w:maata", w: "w:amata", root: ["م", "و", "ت"] },
          { base: "w:hayy", w: "w:ahya", root: ["ح", "ي", "ي"] },
        ],
      },
      { type: "ayah", ref: "53:44" },
      { type: "ayah", ref: "15:76" },
      { type: "meet", words: ["w:athara", "w:ajaba", "w:mujib", "w:yujiru", "w:ahata", "w:muhit"] },
      { type: "ayah", ref: "37:75" },
      { type: "meet", words: ["w:arada", "w:asaba", "w:ataa", "w:anaba", "w:munib", "w:muhin"] },
      { type: "ayah", ref: "3:132" },
      { type: "ayah", ref: "44:30" },
      { type: "ayah", ref: "8:3" },
      {
        type: "petals", root: ["ق", "و", "م"],
        items: [{ ar: "أَقَامَ", w: "w:aqama", petal: "past" }, { ar: "يُقِيمُ", w: "w:aqama", petal: "present" }, { ar: "أَقِمْ", w: "w:aqama", petal: "command" }, { ar: "مُقِيم", w: "w:muqim", petal: "doer" }],
      },
      { type: "match", words: ["w:aqama", "w:adhaqa", "w:aada", "w:amata", "w:athara", "w:ajaba"] },
      { type: "match", words: ["w:yujiru", "w:ahata", "w:arada", "w:asaba", "w:ataa", "w:anaba"] },
      { type: "match", words: ["w:muqim", "w:mamat", "w:munib", "w:muhin", "w:mujib", "w:muhit"] },
      { type: "story", panels: [{ w: "w:anaba" }, { w: "w:aqama" }, { w: "w:ataa" }, { w: "w:munib" }] },
    ],
  },
  {
    id: "grown-forms-7", wing: 5, icon: "🌕", art: "w:atamma", ref: "en85 pp32–33 weak-end and doubled roots in the أَفْعَلَ mould",
    title: { en: "Make-It Verbs 4", ur: "کروانے والے افعال ۴" },
    steps: [
      { type: "meet", words: ["w:alqa", "w:akhfa", "w:anja", "w:adha", "w:adra", "w:aghna", "w:awha", "w:ara"] },
      { type: "ayah", ref: "20:19" },
      { type: "ayah", ref: "26:65" },
      { type: "ayah", ref: "99:5" },
      { type: "ayah", ref: "20:56" },
      { type: "meet", words: ["w:awfa", "w:yuqinu", "w:muqin", "w:itaa", "w:mudill", "w:atamma", "w:ahabba"] },
      {
        type: "petals", root: ["ل", "ق", "ي"],
        items: [{ ar: "أَلْقَى", w: "w:alqa", petal: "past" }, { ar: "يُلْقِي", w: "w:alqa", petal: "present" }, { ar: "أَلْقِ", w: "w:alqa", petal: "command" }, { ar: "مُلْقِي", w: "w:alqa", petal: "doer" }],
      },
      { type: "meet", words: ["w:ahalla", "w:halla", "w:asarra", "w:aadda", "w:atbaa", "w:adhhaba", "w:atama", "w:munzar", "w:hadara", "w:muhdar", "w:mahya", "w:muhyi"] },
      {
        type: "grow", mould: "IV",
        items: [
          { base: "w:raa", w: "w:ara", root: ["ر", "ء", "ي"] },
          { base: "w:dalla", w: "w:adalla", root: ["ض", "ل", "ل"] },
          { base: "w:dhahaba", w: "w:adhhaba", root: ["ذ", "ه", "ب"] },
          { base: "w:hadara", w: "w:muhdar", root: ["ح", "ض", "ر"] },
          { base: "w:ata", w: "w:ata_give", root: ["ء", "ت", "ي"] },
        ],
      },
      { type: "ayah", ref: "33:64" },
      { type: "ayah", ref: "37:57" },
      { type: "ayah", ref: "26:203" },
      { type: "ayah", ref: "51:57" },
      { type: "match", words: ["w:alqa", "w:akhfa", "w:anja", "w:adha", "w:adra", "w:aghna"] },
      { type: "match", words: ["w:awha", "w:ara", "w:awfa", "w:yuqinu", "w:muqin", "w:itaa"] },
      { type: "match", words: ["w:mudill", "w:atamma", "w:ahabba", "w:ahalla", "w:halla", "w:asarra"] },
      { type: "match", words: ["w:aadda", "w:atbaa", "w:adhhaba", "w:atama", "w:munzar", "w:hadara"] },
      { type: "match", words: ["w:muhdar", "w:mahya", "w:muhyi", "w:anja"] },
      { type: "story", panels: [{ w: "w:hadara" }, { w: "w:atama" }, { w: "w:ahabba" }, { w: "w:atamma" }] },
    ],
  },
  {
    id: "grown-forms-8", wing: 5, icon: "🪞", art: "w:tadhakkara", ref: "en85 p34 the تَفَعَّلَ mould: do it to yourself, become",
    title: { en: "Self Verbs 1", ur: "اپنے آپ والے افعال ۱" },
    steps: [
      { type: "meet", words: ["w:tadhakkara", "w:tabayyana", "w:tafakkara", "w:tarabbasa", "w:tafarraqa"] },
      {
        type: "grow", mould: "V",
        items: [
          { base: "w:dhakkara", w: "w:tadhakkara", root: ["ذ", "ك", "ر"] },
          { base: "w:bayyana", w: "w:tabayyana", root: ["ب", "ي", "ن"] },
          { base: "w:fariq", w: "w:tafarraqa", root: ["ف", "ر", "ق"] },
        ],
      },
      { type: "ayah", ref: "87:10" },
      { type: "ayah", ref: "79:35" },
      { type: "ayah", ref: "52:31" },
      { type: "meet", words: ["w:tasaddaqa", "w:taqabbala", "w:kabbara"] },
      { type: "ayah", ref: "30:14" },
      { type: "ayah", ref: "74:3" },
      { type: "ayah", ref: "14:40" },
      {
        type: "petals", root: ["ذ", "ك", "ر"],
        items: [{ ar: "تَذَكَّرَ", w: "w:tadhakkara", petal: "past" }, { ar: "يَتَذَكَّرُ", w: "w:tadhakkara", petal: "present" }, { ar: "تَذَكَّرْ", w: "w:tadhakkara", petal: "command" }],
      },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:tasaddaqa", seg: "good" }, { w: "w:tafarraqa", seg: "bad" }, { w: "w:tadhakkara", seg: "good" }, { w: "w:tafakkara", seg: "good" }] },
      { type: "match", words: ["w:tadhakkara", "w:tabayyana", "w:tafakkara", "w:tarabbasa"] },
      { type: "match", words: ["w:tafarraqa", "w:tasaddaqa", "w:taqabbala", "w:kabbara"] },
      { type: "story", panels: [{ w: "w:tafakkara" }, { w: "w:tabayyana" }, { w: "w:tadhakkara" }, { w: "w:tasaddaqa" }] },
    ],
  },
  {
    id: "grown-forms-9", wing: 5, icon: "🐪", art: "w:tawakkala", ref: "en85 p34 the تَفَعَّلَ mould with weak roots",
    title: { en: "Self Verbs 2", ur: "اپنے آپ والے افعال ۲" },
    steps: [
      { type: "meet", words: ["w:takabbara", "w:mutakabbir", "w:tamattaa", "w:tawakkala"] },
      { type: "meet", words: ["w:mutawakkil", "w:tawalla", "w:tawaffa"] },
      {
        type: "grow", mould: "V",
        items: [
          { base: "w:kabbara", w: "w:takabbara", root: ["ك", "ب", "ر"] },
          { base: "w:mattaa", w: "w:tamattaa", root: ["م", "ت", "ع"] },
          { base: "w:walla", w: "w:tawalla", root: ["و", "ل", "ي"] },
          { base: "w:waffa", w: "w:tawaffa", root: ["و", "ف", "ي"] },
        ],
      },
      { type: "ayah", ref: "26:217" },
      { type: "ayah", ref: "16:42" },
      { type: "ayah", ref: "77:46" },
      { type: "ayah", ref: "16:55" },
      { type: "ayah", ref: "3:82" },
      { type: "ayah", ref: "92:16" },
      { type: "ayah", ref: "16:32" },
      {
        type: "petals", root: ["و", "ك", "ل"],
        items: [{ ar: "تَوَكَّلَ", w: "w:tawakkala", petal: "past" }, { ar: "يَتَوَكَّلُ", w: "w:tawakkala", petal: "present" }, { ar: "تَوَكَّلْ", w: "w:tawakkala", petal: "command" }, { ar: "مُتَوَكِّل", w: "w:mutawakkil", petal: "doer" }],
      },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:tawakkala", seg: "good" }, { w: "w:takabbara", seg: "bad" }, { w: "w:mutawakkil", seg: "good" }, { w: "w:mutakabbir", seg: "bad" }, { w: "w:tasaddaqa", seg: "good" }] },
      { type: "match", words: ["w:takabbara", "w:mutakabbir", "w:tamattaa", "w:tawakkala"] },
      { type: "match", words: ["w:mutawakkil", "w:tawalla", "w:tawaffa", "w:tarabbasa"] },
      { type: "story", panels: [{ w: "w:tamattaa" }, { w: "w:tawalla" }, { w: "w:tadhakkara" }, { w: "w:tawakkala" }] },
    ],
  },
  {
    id: "grown-forms-10", wing: 5, icon: "🤝", art: "w:tasaala", ref: "en85 p35 the تَفَاعَلَ mould: do it to each other",
    title: { en: "Each-Other Verbs", ur: "آپس والے افعال" },
    steps: [
      { type: "meet", words: ["w:tasaala", "w:tanazaa", "w:tashabaha", "w:mutashabih"] },
      { type: "meet", words: ["w:tabaraka", "w:taala", "w:taal"] },
      {
        type: "grow", mould: "VI",
        items: [
          { base: "w:saala", w: "w:tasaala", root: ["س", "ء", "ل"] },
          { base: "w:baaraka", w: "w:tabaraka", root: ["ب", "ر", "ك"] },
          { base: "w:ali", w: "w:taala", root: ["ع", "ل", "و"] },
        ],
      },
      { type: "ayah", ref: "78:1" },
      { type: "ayah", ref: "74:40" },
      { type: "ayah", ref: "20:62" },
      { type: "ayah", ref: "67:1" },
      { type: "ayah", ref: "16:3" },
      {
        type: "petals", root: ["س", "ء", "ل"],
        items: [{ ar: "تَسَاءَلَ", w: "w:tasaala", petal: "past" }, { ar: "يَتَسَاءَلُ", w: "w:tasaala", petal: "present" }],
      },
      { type: "match", words: ["w:tasaala", "w:tanazaa", "w:tashabaha", "w:mutashabih"] },
      { type: "match", words: ["w:tabaraka", "w:taala", "w:taal", "w:tanazaa"] },
      { type: "story", panels: [{ w: "w:tasaala" }, { w: "w:tanazaa" }, { w: "w:taal" }, { w: "w:tabaraka" }] },
    ],
  },
  {
    id: "grown-forms-11", wing: 5, icon: "🌗", art: "w:inshaqqa", ref: "en85 p35 the moulds اِنْفَعَلَ (it happens to itself) and اِفْعَلَّ (colours)",
    title: { en: "Burst & Colour Verbs", ur: "پھٹنے اور رنگ والے افعال" },
    steps: [
      { type: "meet", words: ["w:inshaqqa", "w:intalaqa", "w:inqalaba"] },
      {
        type: "grow", mould: "VII",
        items: [
          { base: "w:shiqaq", w: "w:inshaqqa", root: ["ش", "ق", "ق"] },
          { base: "w:qalb", w: "w:inqalaba", root: ["ق", "ل", "ب"] },
        ],
      },
      { type: "ayah", ref: "84:1" },
      { type: "ayah", ref: "68:23" },
      { type: "ayah", ref: "43:14" },
      { type: "ayah", ref: "84:9" },
      { type: "meet", words: ["w:abyad", "w:ibyadda", "w:aswad", "w:iswadda"] },
      {
        type: "grow", mould: "IX",
        items: [
          { base: "w:abyad", w: "w:ibyadda", root: ["ب", "ي", "ض"] },
          { base: "w:aswad", w: "w:iswadda", root: ["س", "و", "د"] },
        ],
      },
      { type: "ayah", ref: "3:107" },
      {
        type: "petals", root: ["ق", "ل", "ب"],
        items: [{ ar: "اِنْقَلَبَ", w: "w:inqalaba", petal: "past" }, { ar: "يَنْقَلِبُ", w: "w:inqalaba", petal: "present" }, { ar: "مُنْقَلِب", w: "w:inqalaba", petal: "doer" }],
      },
      { type: "match", words: ["w:inshaqqa", "w:intalaqa", "w:inqalaba", "w:abyad"] },
      { type: "match", words: ["w:ibyadda", "w:aswad", "w:iswadda", "w:tabaraka"] },
      { type: "story", panels: [{ w: "w:intalaqa" }, { w: "w:iswadda" }, { w: "w:inqalaba" }, { w: "w:ibyadda" }] },
    ],
  },
  {
    id: "grown-forms-12", wing: 5, icon: "🧲", art: "w:ittakhadha", ref: "en85 p36 the اِفْتَعَلَ mould: do it for yourself, take it on",
    title: { en: "Take-For-Yourself Verbs 1", ur: "اپنے لیے لینے والے افعال ۱" },
    steps: [
      { type: "meet", words: ["w:istamaa", "w:ittakhadha", "w:ittaqa", "w:muttaqi"] },
      {
        type: "grow", mould: "VIII",
        items: [
          { base: "w:samia", w: "w:istamaa", root: ["س", "م", "ع"] },
          { base: "w:akhadha", w: "w:ittakhadha", root: ["أ", "خ", "ذ"] },
          { base: "w:waqa", w: "w:ittaqa", root: ["و", "ق", "ي"] },
        ],
      },
      { type: "ayah", ref: "26:108" },
      { type: "ayah", ref: "51:15" },
      { type: "ayah", ref: "26:25" },
      { type: "ayah", ref: "73:19" },
      { type: "meet", words: ["w:ittabaa", "w:ikhtalafa", "w:mukhtalif"] },
      {
        type: "grow", mould: "VIII",
        items: [{ base: "w:khalfa", w: "w:ikhtalafa", root: ["خ", "ل", "ف"] }],
      },
      { type: "ayah", ref: "75:18" },
      { type: "ayah", ref: "78:3" },
      { type: "ayah", ref: "22:69" },
      {
        type: "petals", root: ["و", "ق", "ي"],
        items: [{ ar: "اِتَّقَى", w: "w:ittaqa", petal: "past" }, { ar: "يَتَّقِي", w: "w:ittaqa", petal: "present" }, { ar: "اِتَّقُوا", w: "w:ittaqa", petal: "command" }, { ar: "مُتَّقِي", w: "w:muttaqi", petal: "doer" }],
      },
      { type: "match", words: ["w:ittaqa", "w:istamaa", "w:ittakhadha", "w:mukhtalif"] },
      { type: "match", words: ["w:muttaqi", "w:ittabaa", "w:ikhtalafa", "w:samia"] },
      { type: "story", panels: [{ w: "w:ittabaa" }, { w: "w:istamaa" }, { w: "w:ittaqa" }, { w: "w:muttaqi" }] },
    ],
  },
  {
    id: "grown-forms-13", wing: 5, icon: "🧭", art: "w:ihtada", ref: "en85 p36 the اِفْتَعَلَ mould with weak roots",
    title: { en: "Take-For-Yourself Verbs 2", ur: "اپنے لیے لینے والے افعال ۲" },
    steps: [
      { type: "meet", words: ["w:ihtada", "w:muhtadi", "w:istawa", "w:itada"] },
      {
        type: "grow", mould: "VIII",
        items: [
          { base: "w:ihdi", w: "w:ihtada", root: ["ه", "د", "ي"] },
          { base: "w:sawa", w: "w:istawa", root: ["س", "و", "ي"] },
          { base: "w:aduw", w: "w:itada", root: ["ع", "د", "و"] },
        ],
      },
      { type: "ayah", ref: "20:82" },
      { type: "ayah", ref: "36:21" },
      { type: "ayah", ref: "35:19" },
      { type: "meet", words: ["w:ishtara", "w:iftara", "w:intaha", "w:ibtagha"] },
      { type: "ayah", ref: "3:177" },
      { type: "ayah", ref: "10:69" },
      { type: "ayah", ref: "2:192" },
      { type: "ayah", ref: "92:20" },
      {
        type: "petals", root: ["ه", "د", "ي"],
        items: [{ ar: "اِهْتَدَى", w: "w:ihtada", petal: "past" }, { ar: "يَهْتَدِي", w: "w:ihtada", petal: "present" }, { ar: "مُهْتَدِي", w: "w:muhtadi", petal: "doer" }],
      },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:ihtada", seg: "good" }, { w: "w:iftara", seg: "bad" }, { w: "w:muhtadi", seg: "good" }, { w: "w:itada", seg: "bad" }] },
      { type: "match", words: ["w:ihtada", "w:muhtadi", "w:istawa", "w:itada"] },
      { type: "match", words: ["w:ishtara", "w:iftara", "w:intaha", "w:ibtagha"] },
      { type: "story", panels: [{ w: "w:ibtagha" }, { w: "w:ihtada" }, { w: "w:ishtara" }, { w: "w:intaha" }] },
    ],
  },
  {
    id: "grown-forms-14", wing: 5, icon: "🙏", art: "w:istaghfara", ref: "en85 p37 the اِسْتَفْعَلَ mould: ask for it, find it so",
    title: { en: "Asking Verbs 1", ur: "مانگنے والے افعال ۱" },
    steps: [
      { type: "meet", words: ["w:istaghfara", "w:istajaba", "w:istaqama", "w:istataa"] },
      {
        type: "grow", mould: "X",
        items: [
          { base: "w:ghafara", w: "w:istaghfara", root: ["غ", "ف", "ر"] },
          { base: "w:ajaba", w: "w:istajaba", root: ["ج", "و", "ب"] },
          { base: "w:qama", w: "w:istaqama", root: ["ق", "و", "م"] },
          { base: "w:ataa", w: "w:istataa", root: ["ط", "و", "ع"] },
        ],
      },
      { type: "ayah", ref: "71:10" },
      { type: "ayah", ref: "6:36" },
      { type: "ayah", ref: "81:28" },
      { type: "ayah", ref: "18:67" },
      { type: "meet", words: ["w:istadhana", "w:istajala"] },
      {
        type: "grow", mould: "X",
        items: [{ base: "w:idhn", w: "w:istadhana", root: ["أ", "ذ", "ن"] }],
      },
      { type: "ayah", ref: "26:204" },
      {
        type: "petals", root: ["غ", "ف", "ر"],
        items: [{ ar: "اِسْتَغْفَرَ", w: "w:istaghfara", petal: "past" }, { ar: "يَسْتَغْفِرُ", w: "w:istaghfara", petal: "present" }, { ar: "اِسْتَغْفِرْ", w: "w:istaghfara", petal: "command" }, { ar: "مُسْتَغْفِر", w: "w:istaghfara", petal: "doer" }],
      },
      { type: "match", words: ["w:istaghfara", "w:istajaba", "w:istaqama", "w:ghafara"] },
      { type: "match", words: ["w:istataa", "w:istadhana", "w:istajala", "w:idhn"] },
      { type: "story", panels: [{ w: "w:istadhana" }, { w: "w:istataa" }, { w: "w:istaqama" }, { w: "w:istaghfara" }] },
    ],
  },
  {
    id: "grown-forms-15", wing: 5, icon: "🪺", art: "w:istaqarra", ref: "en85 p37 the اِسْتَفْعَلَ mould: count it so (big, weak); plus هُدًى",
    title: { en: "Asking Verbs 2", ur: "مانگنے والے افعال ۲" },
    steps: [
      { type: "meet", words: ["w:istakbara", "w:istadafa", "w:istahzaa"] },
      {
        type: "grow", mould: "X",
        items: [{ base: "w:akbar", w: "w:istakbara", root: ["ك", "ب", "ر"] }],
      },
      { type: "ayah", ref: "7:76" },
      { type: "ayah", ref: "15:11" },
      { type: "meet", words: ["w:istahya", "w:istaqarra", "w:huda"] },
      { type: "ayah", ref: "36:38" },
      { type: "ayah", ref: "2:2" },
      { type: "sort", segments: GOOD_BAD, items: [{ w: "w:istaghfara", seg: "good" }, { w: "w:istakbara", seg: "bad" }, { w: "w:istaqama", seg: "good" }, { w: "w:istahzaa", seg: "bad" }] },
      { type: "match", words: ["w:istakbara", "w:istadafa", "w:istahzaa", "w:akbar"] },
      { type: "match", words: ["w:istahya", "w:istaqarra", "w:huda", "w:istajaba"] },
      { type: "story", panels: [{ w: "w:huda" }, { w: "w:istaqarra" }, { w: "w:istahya" }, { w: "w:istadafa" }] },
    ],
  },
  {
    id: "verb-partners-1", wing: 5, icon: "🔗", art: "w:afa", ref: "en85 p38 verb + partner word (صِلَةُ الْفِعْل): ضَرَبَ، عَفَا، قَضَى، وَضَعَ، وَلَّى",
    title: { en: "Verb Partners 1", ur: "فعل کے ساتھی ۱" },
    steps: [
      { type: "meet", words: ["w:afa"] },
      {
        type: "path",
        items: [
          { verb: "w:daraba", with: "w:fi", ar: "ضَرَبَ فِي", art: "g:travel", pic: "🥾", g: { en: "travel (through the land)", ur: "(زمین میں) سفر کیا" } },
          { verb: "w:daraba", with: "w:li", ar: "ضَرَبَ لِ", art: "g:makefor", pic: "🪨", g: { en: "set out (a way) for someone", ur: "کسی کے لیے (راستہ) بنایا" } },
          { verb: "w:daraba", with: "w:ala", ar: "ضَرَبَ عَلَى", art: "g:coverover", pic: "⛺", g: { en: "cover over, lay upon", ur: "اوپر ڈال دیا، ڈھانپ دیا" } },
          { verb: "w:daraba", with: "w:mathal", ar: "ضَرَبَ مَثَلًا", art: "g:example", pic: "🌱🌳", g: { en: "give an example", ur: "مثال بیان کی" } },
        ],
      },
      { type: "ayah", ref: "36:13" },
      {
        type: "path",
        items: [
          { verb: "w:afa", with: "w:an", ar: "عَفَا عَنْ", art: "w:afa", pic: "👣", g: { en: "pardon someone", ur: "کسی کو معاف کیا" } },
          { verb: "w:qada", with: "w:bayna", ar: "قَضَى بَيْنَ", art: "g:judge", pic: "⚖️", g: { en: "judge between", ur: "کے درمیان فیصلہ کیا" } },
          { verb: "w:qada", with: "w:ala", ar: "قَضَى عَلَى", art: "g:finishoff", pic: "🕯️", g: { en: "finish off, put an end to", ur: "کام تمام کر دیا" } },
          { verb: "w:wadaa", with: "w:an", ar: "وَضَعَ عَنْ", art: "g:liftoff", pic: "🫏", g: { en: "lift (a load) off someone", ur: "کسی سے (بوجھ) اتار دیا" } },
          { verb: "w:walla", with: "w:ila", ar: "وَلَّى إِلَى", art: "g:turnto", pic: "🪧", g: { en: "turn toward", ur: "کی طرف رخ کیا" } },
          { verb: "w:walla", with: "w:an", ar: "وَلَّى عَنْ", art: "g:turnfrom", pic: "🐪", g: { en: "turn away from", ur: "سے منہ پھیرا" } },
        ],
      },
      { type: "ayah", ref: "2:52" },
      { type: "ayah", ref: "27:78" },
      { type: "ayah", ref: "94:2" },
      { type: "match", words: ["w:afa", "w:daraba", "w:qada", "w:walla"] },
      { type: "story", panels: [{ w: "w:daraba" }, { w: "w:wadaa" }, { w: "w:afa" }, { w: "w:walla" }] },
    ],
  },
  {
    id: "verb-partners-2", wing: 5, icon: "🧺", art: "w:bagha", ref: "en85 p38 verb + partner word: أَتَى، جَاءَ، بَغَى، تَابَ، ذَهَبَ، رَضِيَ",
    title: { en: "Verb Partners 2", ur: "فعل کے ساتھی ۲" },
    steps: [
      { type: "meet", words: ["w:bagha"] },
      {
        type: "path",
        items: [
          { verb: "w:ata", with: "w:bi", ar: "أَتَى بِ", art: "g:bring", pic: "🧺", g: { en: "bring", ur: "لے آیا" } },
          { verb: "w:bagha", with: "w:ala", ar: "بَغَى عَلَى", art: "w:bagha", pic: "🐐", g: { en: "wrong someone, oppress", ur: "کسی پر زیادتی کی" } },
          { verb: "w:dhahaba", with: "w:bi", ar: "ذَهَبَ بِ", art: "g:takeaway", pic: "🌬️", g: { en: "take away, go off with", ur: "لے گیا" } },
          { verb: "w:dhahaba", with: "w:an", ar: "ذَهَبَ عَنْ", art: "g:leaveaway", pic: "☁️", g: { en: "leave, go away from", ur: "سے دور ہو گیا" } },
        ],
      },
      { type: "ayah", ref: "7:112" },
      { type: "ayah", ref: "55:20" },
      { type: "ayah", ref: "26:15" },
      {
        type: "path",
        items: [
          { verb: "w:jaa", with: "w:bi", ar: "جَاءَ بِ", art: "g:bring", pic: "🧺", g: { en: "bring", ur: "لے آیا" } },
          { verb: "w:taba", with: "w:ila", ar: "تَابَ إِلَى", art: "g:returnto", pic: "🐑", g: { en: "turn back to (in repentance)", ur: "کی طرف توبہ کر کے لوٹا" } },
          { verb: "w:taba", with: "w:ala", ar: "تَابَ عَلَى", art: "g:acceptback", pic: "🚪", g: { en: "turn to someone in mercy, accept their repentance", ur: "رحمت سے متوجہ ہوا، توبہ قبول کی" } },
          { verb: "w:radiya", with: "w:an", ar: "رَضِيَ عَنْ", art: "g:pleasedwith", pic: "☀️🌸", g: { en: "be pleased with someone", ur: "کسی سے راضی ہوا" } },
        ],
      },
      { type: "ayah", ref: "26:30" },
      { type: "ayah", ref: "5:74" },
      { type: "ayah", ref: "2:160" },
      { type: "match", words: ["w:bagha", "w:ata", "w:taba", "w:radiya"] },
      { type: "story", panels: [{ w: "w:ata" }, { w: "w:dhahaba" }, { w: "w:taba" }, { w: "w:radiya" }] },
    ],
  },
  {
    id: "verb-tables-1", wing: 5, icon: "📋", art: "w:faala", ref: "en85 pp. 39 + 41 verb tables: past, present and passive for every person",
    title: { en: "Verb Tables 1", ur: "فعل کے نقشے ۱" },
    steps: [
      {
        type: "wheel", persons: ["3ms", "3fs", "3d", "3mp", "3fp"],
        items: [
          { ar: "يَفْعَلُ", w: "w:faala", person: "3ms" }, { ar: "تَفْعَلُ", w: "w:faala", person: "3fs" }, { ar: "يَفْعَلَانِ", w: "w:faala", person: "3d" },
          { ar: "يَفْعَلُونَ", w: "w:faala", person: "3mp" }, { ar: "يَفْعَلْنَ", w: "w:faala", person: "3fp" },
        ],
      },
      { type: "ayah", ref: "56:35" },
      {
        type: "wheel", persons: ["2ms", "2fs", "2d", "2mp", "2fp", "1s", "1p"],
        items: [
          { ar: "تَفْعَلُ", w: "w:faala", person: "2ms" }, { ar: "تَفْعَلِينَ", w: "w:faala", person: "2fs" }, { ar: "تَفْعَلَانِ", w: "w:faala", person: "2d" },
          { ar: "تَفْعَلُونَ", w: "w:faala", person: "2mp" }, { ar: "تَفْعَلْنَ", w: "w:faala", person: "2fp" }, { ar: "أَفْعَلُ", w: "w:faala", person: "1s" },
          { ar: "نَفْعَلُ", w: "w:faala", person: "1p" },
        ],
      },
      {
        type: "wheel", persons: ["2ms", "2fs", "2d", "2mp", "2fp"],
        items: [
          { ar: "فَعَلْتَ", w: "w:faala", person: "2ms" }, { ar: "فَعَلْتِ", w: "w:faala", person: "2fs" }, { ar: "فَعَلْتُمَا", w: "w:faala", person: "2d" },
          { ar: "فَعَلْتُمْ", w: "w:faala", person: "2mp" }, { ar: "فَعَلْتُنَّ", w: "w:faala", person: "2fp" },
        ],
      },
      { type: "ayah", ref: "51:30" },
      { type: "ayah", ref: "20:49" },
      {
        type: "sort", segments: DOER_DONE,
        items: [
          { ar: "فَعَلَ", w: "w:faala", seg: "doerDid" }, { ar: "فُعِلَ", w: "w:faala", seg: "wasDone" }, { ar: "يُفْعَلُ", w: "w:faala", seg: "wasDone" }, { ar: "يَفْعَلُ", w: "w:faala", seg: "doerDid" },
          { ar: "فُعِلَتْ", w: "w:faala", seg: "wasDone" }, { ar: "فَعَلَتْ", w: "w:faala", seg: "doerDid" }, { ar: "تَفْعَلُ", w: "w:faala", seg: "doerDid" }, { ar: "تُفْعَلُ", w: "w:faala", seg: "wasDone" },
        ],
      },
    ],
  },
  {
    id: "verb-tables-2", wing: 5, icon: "🚦", art: "w:fail", ref: "en85 pp. 40 + 42 verb tables: command, don't, doer and done-to for every person",
    title: { en: "Verb Tables 2", ur: "فعل کے نقشے ۲" },
    steps: [
      {
        type: "wheel", persons: ["2ms", "2fs", "2d", "2mp", "2fp"],
        items: [
          { ar: "اِفْعَلْ", w: "w:faala", person: "2ms" }, { ar: "اِفْعَلِي", w: "w:faala", person: "2fs" }, { ar: "اِفْعَلَا", w: "w:faala", person: "2d" },
          { ar: "اِفْعَلُوا", w: "w:faala", person: "2mp" }, { ar: "اِفْعَلْنَ", w: "w:faala", person: "2fp" },
        ],
      },
      { type: "ayah", ref: "26:16" },
      {
        type: "wheel", persons: ["2ms", "2fs", "2d", "2mp", "2fp"],
        items: [
          { ar: "لَا تَفْعَلْ", w: "w:faala", person: "2ms" }, { ar: "لَا تَفْعَلِي", w: "w:faala", person: "2fs" }, { ar: "لَا تَفْعَلَا", w: "w:faala", person: "2d" },
          { ar: "لَا تَفْعَلُوا", w: "w:faala", person: "2mp" }, { ar: "لَا تَفْعَلْنَ", w: "w:faala", person: "2fp" },
        ],
      },
      {
        type: "sort", segments: DO_DONT,
        items: [
          { ar: "اِفْعَلُوا", w: "w:faala", seg: "do" }, { ar: "لَا تَفْعَلُوا", w: "w:faala", seg: "dont" }, { ar: "لَا تَفْعَلِي", w: "w:faala", seg: "dont" }, { ar: "اِفْعَلِي", w: "w:faala", seg: "do" },
          { ar: "اِفْعَلَا", w: "w:faala", seg: "do" }, { ar: "لَا تَفْعَلَا", w: "w:faala", seg: "dont" }, { ar: "لَا تَخَفْ", w: "w:khafa", seg: "dont" }, { ar: "اُدْخُلُوا", w: "w:dakhala", seg: "do" },
        ],
      },
      { type: "ayah", ref: "20:46" },
      {
        type: "sort", segments: NUMBER,
        items: [
          { ar: "فَاعِل", w: "w:fail", seg: "one" }, { ar: "فَاعِلَانِ", w: "w:fail", seg: "two" }, { ar: "فَاعِلُونَ", w: "w:fail", seg: "many" }, { ar: "فَاعِلَيْنِ", w: "w:fail", seg: "two" },
          { ar: "فَاعِلِينَ", w: "w:fail", seg: "many" }, { ar: "مَفْعُول", w: "w:mafool", seg: "one" }, { ar: "مَفْعُولُونَ", w: "w:mafool", seg: "many" }, { ar: "مَفْعُولَانِ", w: "w:mafool", seg: "two" },
          { ar: "مَفْعُولَيْنِ", w: "w:mafool", seg: "two" }, { ar: "مَفْعُولِينَ", w: "w:mafool", seg: "many" },
        ],
      },
      {
        type: "sort", segments: MALE_FEMALE,
        items: [
          { ar: "فَاعِل", w: "w:fail", seg: "m" }, { ar: "فَاعِلَة", w: "w:fail", seg: "f" }, { ar: "فَاعِلَات", w: "w:fail", seg: "f" }, { ar: "فَاعِلُونَ", w: "w:fail", seg: "m" },
          { ar: "فَاعِلَتَانِ", w: "w:fail", seg: "f" }, { ar: "مَفْعُولَة", w: "w:mafool", seg: "f" }, { ar: "مَفْعُول", w: "w:mafool", seg: "m" }, { ar: "مَفْعُولَات", w: "w:mafool", seg: "f" },
          { ar: "مَفْعُولَتَيْنِ", w: "w:mafool", seg: "f" }, { ar: "فَاعِلَتَيْنِ", w: "w:fail", seg: "f" }, { ar: "مَفْعُولَتَانِ", w: "w:mafool", seg: "f" },
        ],
      },
      {
        type: "sort", segments: DOER_DONE,
        items: [
          { ar: "فَاعِلَة", w: "w:fail", seg: "doerDid" }, { ar: "مَفْعُولَة", w: "w:mafool", seg: "wasDone" }, { ar: "فَاعِلُونَ", w: "w:fail", seg: "doerDid" }, { ar: "مَفْعُولُونَ", w: "w:mafool", seg: "wasDone" },
          { ar: "مَفْعُولَات", w: "w:mafool", seg: "wasDone" }, { ar: "فَاعِلَات", w: "w:fail", seg: "doerDid" },
        ],
      },
    ],
  },
  {
    id: "reading-room-5", wing: 5, icon: "📖", art: "w:anzala", ref: "Reading Room 5 (Wing 5 finale): Al-Baqarah 2:1–5, the Qur'an's first page after Al-Fatiha — every word already learnt",
    title: { en: "Reading Room: Al-Baqarah 1–5", ur: "مطالعہ کا کمرہ: سورۃ البقرہ ۱–۵" },
    steps: [
      { type: "meet", words: ["w:alm"] },
      { type: "ayah", ref: "2:1" },
      { type: "ayah", ref: "2:2" },
      { type: "ayah", ref: "2:3" },
      { type: "match", words: ["w:amana", "w:aqama", "w:anfaqa", "w:ghayb"] },
      { type: "ayah", ref: "2:4" },
      { type: "ayah", ref: "2:5" },
      {
        // the passage's grown verbs: who does it, and what was done (sent down)
        type: "sort", segments: DOER_DONE,
        items: [
          { ar: "يُؤْمِنُونَ", w: "w:amana", seg: "doerDid" }, { ar: "أُنْزِلَ", w: "w:anzala", seg: "wasDone" },
          { ar: "يُقِيمُونَ", w: "w:aqama", seg: "doerDid" }, { ar: "يُنْفِقُونَ", w: "w:anfaqa", seg: "doerDid" },
        ],
      },
      {
        type: "passage", whole: "passage", title: { ar: "سُورَةُ الْبَقَرَة ١–٥", en: "Al-Baqarah 1–5 (The Cow)", ur: "سورۃ البقرہ، آیات ۱–۵" },
        refs: [
          { ref: "2:1" },
          { ref: "2:2" },
          { ref: "2:3" },
          { ref: "2:4" },
          { ref: "2:5" },
        ],
      },
    ],
  },
];

// The booklet (en85) is complete through p42. Nothing is shown locked on the map.
export const COMING = [];
