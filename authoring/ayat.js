// Word-by-word glosses for the ayat used in Wings 1–2. DRAFT — every gloss needs the reviewer's sign-off (PLAN D8).
// The Qur'anic text itself is NOT stored here: build-pack takes it verbatim from Tanzil. Each entry lines up with
// one Tanzil word (leading Basmala removed); `ar` is a plain-letter hint the validator uses to prove the line-up.
//   w      word cards this word practises (authoring/words.js); the player decodes it and it is graded
//   given  not taught yet: shown already glossed, with its picture ("Qalam's help")
//   g      { en, ur } meaning of this word here, in context
//   pic / medal   override the picture; otherwise the first card's picture is used
//   pieces optional Root Lens split shown after decoding: [{ ar, g }]
//   say    optional: how to say this word in Latin letters, when the rule-based spelling cannot work (الٓمٓ) or reads
//          wrong (scripts/lib/translit.mjs). Shown only with "Show how to say it" on.
//   note   why this word's meaning here differs from its card ("إِنَّمَا = only"). The build fails when a word's meaning
//          shares nothing with the card it takes its picture from, unless a note says why (scripts/lib/checks.mjs).
//          A note is a sign-off for that one word: write it only after checking the ayah. Not shipped in the pack.
//   ofAllah  true on a word that shows a Name-of-Allah medallion but is not glossed with the Name's own wording.
//          Names of Allah are written with a capital letter in English ("the All-Knowing"); a word about anyone
//          else must not name a Name card (make it a given word, or name another card).

const p = (ar, en, ur) => ({ ar, g: { en, ur } });

export const AYAT = {
  "1:1": [
    { ar: "بسم", w: ["w:bi", "w:ism"], g: { en: "In the name", ur: "نام سے" }, pieces: [p("بِ", "in, with", "سے"), p("اسْمِ", "name", "نام")] },
    { ar: "الله", w: ["w:allah"], g: { en: "of Allah", ur: "اللہ کے" } },
    { ar: "الرحمن", w: ["w:al", "w:rahman"], g: { en: "the Most Gracious", ur: "جو نہایت مہربان" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Most Merciful", ur: "رحم کرنے والا ہے" } },
  ],
  "1:2": [
    { ar: "الحمد", w: ["w:al", "w:hamd"], g: { en: "All praise", ur: "سب تعریف" }, pieces: [p("الْ", "the", "وہی"), p("حَمْدُ", "praise", "تعریف")] },
    { ar: "لله", w: ["w:li", "w:allah"], g: { en: "is for Allah", ur: "اللہ کے لیے ہے" }, pieces: [p("لِ", "for", "کے لیے"), p("لّٰهِ", "Allah", "اللہ")] },
    { ar: "رب", w: ["w:rabb"], g: { en: "Lord", ur: "جو رب ہے" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "of the worlds", ur: "تمام جہانوں کا" }, pieces: [p("الْ", "the", "وہی"), p("عَالَم", "world", "جہان"), p("ـِين", "many", "بہت سے")] },
  ],
  "1:3": [
    { ar: "الرحمن", w: ["w:al", "w:rahman"], g: { en: "the Most Gracious", ur: "نہایت مہربان" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Most Merciful", ur: "رحم کرنے والا" } },
  ],
  "1:4": [
    { ar: "ملك", w: ["w:malik"], g: { en: "Master", ur: "مالک" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "of the Day", ur: "دن کا" } },
    { ar: "الدين", w: ["w:al", "w:din"], g: { en: "of Judgement", ur: "بدلے کے" } },
  ],
  "1:5": [
    { ar: "اياك", w: ["w:iyya", "w:ka"], g: { en: "You alone", ur: "صرف تیری" }, pieces: [p("إِيَّا", "alone", "صرف"), p("كَ", "you", "تو")] },
    { ar: "نعبد", w: ["w:nabudu"], g: { en: "we worship", ur: "ہم عبادت کرتے ہیں" }, pieces: [p("نَ", "we", "ہم"), p("عْبُدُ", "worship", "عبادت")] },
    { ar: "واياك", w: ["w:wa", "w:iyya", "w:ka"], g: { en: "and You alone", ur: "اور صرف تجھ سے" } },
    { ar: "نستعين", w: ["w:nastain"], g: { en: "we ask for help", ur: "ہم مدد مانگتے ہیں" } },
  ],
  "1:6": [
    { ar: "اهدنا", w: ["w:ihdi", "w:na"], g: { en: "Guide us", ur: "ہمیں ہدایت دے" }, pieces: [p("اهْدِ", "guide!", "ہدایت دے"), p("نَا", "us", "ہمیں")] },
    { ar: "الصرط", w: ["w:al", "w:sirat"], g: { en: "the path", ur: "راستہ" } },
    { ar: "المستقيم", w: ["w:al", "w:mustaqim"], g: { en: "the straight", ur: "سیدھا" } },
  ],
  "1:7": [
    { ar: "صرط", w: ["w:sirat"], g: { en: "the path", ur: "راستہ" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "of those (who)", ur: "ان لوگوں کا جن" } },
    { ar: "انعمت", w: ["w:anamta"], g: { en: "You blessed", ur: "تو نے انعام کیا" } },
    { ar: "عليهم", w: ["w:ala", "w:hum"], g: { en: "upon them", ur: "ان پر" }, pieces: [p("عَلَيْ", "upon", "پر"), p("هِمْ", "them", "ان")] },
    { ar: "غير", w: ["w:ghayr"], g: { en: "not", ur: "نہ کہ" } },
    { ar: "المغضوب", w: ["w:al", "w:maghdub"], g: { en: "of those who earned anger", ur: "جن پر غضب ہوا" } },
    { ar: "عليهم", w: ["w:ala", "w:hum"], g: { en: "upon them", ur: "ان پر" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "and not", ur: "اور نہ" } },
    { ar: "الضالين", w: ["w:al", "w:dallin"], g: { en: "of those astray", ur: "گمراہوں کا" } },
  ],

  // Near & Far
  "56:56": [
    { ar: "هذا", w: ["w:hadha"], g: { en: "This (is)", ur: "یہ" } },
    { ar: "نزلهم", given: true, pic: "🍽️", art: "g:welcome", g: { en: "their welcome", ur: "ان کی مہمانی" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "on the Day", ur: "دن" } },
    { ar: "الدين", w: ["w:al", "w:din"], g: { en: "of Judgement", ur: "بدلے کے" } },
  ],
  "56:11": [
    { ar: "اولئك", w: ["w:ulaika"], g: { en: "Those", ur: "وہی لوگ" } },
    { ar: "المقربون", given: true, pic: "🔆", art: "g:near", g: { en: "are the ones brought near", ur: "قریب کیے گئے ہیں" } },
  ],
  "14:20": [
    { ar: "وما", given: true, pic: "✕", art: "w:la", g: { en: "And it is not", ur: "اور نہیں ہے" } },
    { ar: "ذلك", w: ["w:dhalika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "that", ur: "یہ (بات)" } },
    { ar: "على", w: ["w:ala"], g: { en: "upon", ur: "پر" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "بعزيز", given: true, pic: "🪨", art: "g:boulder", g: { en: "difficult", ur: "مشکل" } },
  ],

  // Who's Who
  "109:6": [
    { ar: "لكم", w: ["w:li", "w:kum"], g: { en: "For you", ur: "تمہارے لیے" }, pieces: [p("لَ", "for", "کے لیے"), p("كُمْ", "you all", "تم سب")] },
    { ar: "دينكم", w: ["w:din", "w:kum"], g: { en: "your religion", ur: "تمہارا دین" }, pieces: [p("دِينُ", "religion", "دین"), p("كُمْ", "your", "تمہارا")] },
    { ar: "ولي", w: ["w:wa", "w:li", "w:i"], g: { en: "and for me", ur: "اور میرے لیے" } },
    { ar: "دين", w: ["w:din", "w:i"], g: { en: "my religion", ur: "میرا دین" } },
  ],
  "23:59": [
    { ar: "والذين", w: ["w:wa", "w:alladhina"], g: { en: "And those who", ur: "اور وہ لوگ جو" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "بربهم", w: ["w:bi", "w:rabb", "w:hum"], g: { en: "with their Lord", ur: "اپنے رب کے ساتھ" }, pieces: [p("بِ", "with", "ساتھ"), p("رَبِّ", "Lord", "رب"), p("هِمْ", "their", "ان کا")] },
    { ar: "لا", w: ["w:la"], g: { en: "do not", ur: "نہیں" } },
    { ar: "يشركون", given: true, pic: "🚫", art: "w:la", g: { en: "associate partners", ur: "شریک ٹھہراتے" } },
  ],
  "112:1": [
    { ar: "قل", given: true, pic: "🗣️", art: "w:qala", g: { en: "Say", ur: "کہہ دو" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "He", ur: "وہ" } },
    { ar: "الله", w: ["w:allah"], g: { en: "(is) Allah", ur: "اللہ ہے" } },
    { ar: "احد", given: true, pic: "☝️", medal: "أَحَد", ofAllah: true, g: { en: "the One", ur: "ایک" } },
  ],

  // Lamp & Box
  "36:4": [
    { ar: "على", w: ["w:ala"], g: { en: "on", ur: "پر" } },
    { ar: "صرط", w: ["w:sirat"], g: { en: "a path", ur: "راستے" } },
    { ar: "مستقيم", w: ["w:mustaqim"], g: { en: "straight", ur: "سیدھے" } },
  ],
  "85:20": [
    { ar: "والله", w: ["w:wa", "w:allah"], g: { en: "And Allah", ur: "اور اللہ" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "ورائهم", w: ["w:waraa", "w:hum"], g: { en: "behind them", ur: "ان کے پیچھے" }, pieces: [p("وَرَاءِ", "behind", "پیچھے"), p("هِمْ", "them", "ان")] },
    { ar: "محيط", given: true, pic: "🔄", art: "w:wasia", g: { en: "encompasses", ur: "گھیرے ہوئے ہے" } },
  ],
  "75:23": [
    { ar: "الى", w: ["w:ila"], g: { en: "towards", ur: "کی طرف" } },
    { ar: "ربها", w: ["w:rabb", "w:ha"], g: { en: "its Lord", ur: "اپنے رب" }, pieces: [p("رَبِّ", "Lord", "رب"), p("هَا", "its", "اس کا")] },
    { ar: "ناظرة", given: true, pic: "👀", art: "w:nazara", g: { en: "looking", ur: "دیکھ رہے ہوں گے" } },
  ],

  // The No Stamp
  "112:3": [
    { ar: "لم", w: ["w:lam"], g: { en: "He did not", ur: "نہ اس نے" } },
    { ar: "يلد", given: true, pic: "👶", medal: "plain:يَلِدْ", g: { en: "beget", ur: "کسی کو جنا" } },
    { ar: "ولم", w: ["w:wa", "w:lam"], g: { en: "and was not", ur: "اور نہ وہ" } },
    { ar: "يولد", given: true, pic: "🍼", medal: "plain:يُولَدْ", g: { en: "born", ur: "جنا گیا" } },
  ],
  "109:2": [
    { ar: "لا", w: ["w:la"], g: { en: "I do not", ur: "میں نہیں" } },
    { ar: "اعبد", w: ["w:nabudu"], g: { en: "worship", ur: "عبادت کرتا" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "جن کی" } },
    { ar: "تعبدون", w: ["w:nabudu"], g: { en: "you worship", ur: "تم عبادت کرتے ہو" } },
  ],
  "53:58": [
    { ar: "ليس", w: ["w:laysa"], g: { en: "There is not", ur: "نہیں ہے" } },
    { ar: "لها", w: ["w:li", "w:ha"], g: { en: "for it", ur: "اس کے لیے" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "دون", w: ["w:duna"], g: { en: "besides", ur: "سوا" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ کے" } },
    { ar: "كاشفة", given: true, pic: "🧹", art: "g:curtain", g: { en: "anyone to remove it", ur: "کوئی ہٹانے والا" } },
  ],

  // Question Cards
  "37:154": [
    { ar: "ما", w: ["w:ma"], g: { en: "What (is wrong)", ur: "کیا ہوا" } },
    { ar: "لكم", w: ["w:li", "w:kum"], g: { en: "with you", ur: "تمہیں" } },
    { ar: "كيف", w: ["w:kayfa"], g: { en: "how", ur: "کیسے" } },
    { ar: "تحكمون", given: true, pic: "⚖️", art: "w:hakama", g: { en: "do you judge?", ur: "فیصلہ کرتے ہو؟" } },
  ],
  "77:12": [
    { ar: "لاي", w: ["w:li", "w:ayyu"], g: { en: "For which", ur: "کس" }, pieces: [p("لِ", "for", "کے لیے"), p("أَيِّ", "which", "کون سا")] },
    { ar: "يوم", w: ["w:yawm"], g: { en: "day", ur: "دن کے لیے" } },
    { ar: "اجلت", given: true, pic: "⏳", art: "w:ajal", g: { en: "was it postponed?", ur: "مؤخر کیا گیا؟" } },
  ],
  "37:163": [
    { ar: "الا", w: ["w:illa"], g: { en: "Except", ur: "سوائے" } },
    { ar: "من", w: ["w:man"], g: { en: "the one who", ur: "اس کے جو" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "he (is)", ur: "وہ" } },
    { ar: "صال", given: true, pic: "🔥", art: "w:jahim", g: { en: "going to burn", ur: "جلنے والا ہے" } },
    { ar: "الجحيم", given: true, pic: "🔥", art: "w:jahim", g: { en: "in the Blaze", ur: "دوزخ میں" } },
  ],

  // Time Line
  "82:18": [
    { ar: "ثم", w: ["w:thumma"], g: { en: "Then", ur: "پھر" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "کیا" } },
    { ar: "ادرىك", given: true, pic: "💡", art: "w:alima", g: { en: "will make you know", ur: "تمہیں بتائے" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what (is)", ur: "کیا ہے" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "the Day", ur: "دن" } },
    { ar: "الدين", w: ["w:al", "w:din"], g: { en: "of Judgement", ur: "بدلے کا" } },
  ],
  "26:78": [
    { ar: "الذي", w: ["w:alladhi"], g: { en: "The One who", ur: "وہ جس نے" } },
    { ar: "خلقني", given: true, pic: "🌱", art: "w:khalaqa", g: { en: "created me", ur: "مجھے پیدا کیا" } },
    { ar: "فهو", w: ["w:fa", "w:huwa"], g: { en: "so He", ur: "پھر وہی" }, pieces: [p("فَ", "so", "پس"), p("هُوَ", "he", "وہ")] },
    { ar: "يهدين", w: ["w:ihdi", "w:i"], g: { en: "guides me", ur: "مجھے راہ دکھاتا ہے" } },
  ],
  "37:26": [
    { ar: "بل", w: ["w:bal"], g: { en: "Rather,", ur: "بلکہ" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "اليوم", w: ["w:al", "w:yawm"], g: { en: "today", ur: "آج" } },
    { ar: "مستسلمون", given: true, pic: "🏳️", art: "g:flag", g: { en: "surrender", ur: "سر جھکائے ہوئے ہیں" } },
  ],

  // Connectors
  "82:16": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "عنها", w: ["w:an", "w:ha"], g: { en: "from it", ur: "اس سے" }, pieces: [p("عَنْ", "away from", "سے"), p("هَا", "it", "اس")] },
    { ar: "بغائبين", given: true, pic: "🚶", art: "g:absent", g: { en: "(will be) absent", ur: "غائب ہونے والے" } },
  ],
  "38:68": [
    { ar: "انتم", w: ["w:antum"], g: { en: "You all", ur: "تم" } },
    { ar: "عنه", w: ["w:an", "w:hu"], g: { en: "from it", ur: "اس سے" } },
    { ar: "معرضون", given: true, pic: "🙅", art: "w:aba", g: { en: "turn away", ur: "منہ پھیرنے والے ہو" } },
  ],

  // Verb Front Markers
  "102:3": [
    { ar: "كلا", w: ["w:kalla"], g: { en: "No indeed!", ur: "ہرگز نہیں" } },
    { ar: "سوف", w: ["w:sawfa"], g: { en: "(you) will, later on", ur: "آگے چل کر" } },
    { ar: "تعلمون", given: true, pic: "💡", art: "w:alima", g: { en: "come to know", ur: "جان لو گے" } },
  ],
  "106:3": [
    { ar: "فليعبدوا", w: ["w:fa", "w:li_let", "w:nabudu"], g: { en: "So let them worship", ur: "تو انہیں چاہیے کہ عبادت کریں" }, pieces: [p("فَ", "so", "تو"), p("لْ", "let", "چاہیے"), p("يَعْبُدُوا", "they worship", "عبادت کریں")] },
    { ar: "رب", w: ["w:rabb"], g: { en: "the Lord", ur: "رب کی" } },
    { ar: "هذا", w: ["w:hadha"], g: { en: "of this", ur: "اس" } },
    { ar: "البيت", given: true, pic: "🕋", art: "g:kabah", g: { en: "House", ur: "گھر کے" } },
  ],
  "4:68": [
    { ar: "ولهدينهم", w: ["w:wa", "w:la_surely", "w:ihdi", "w:na", "w:hum"], g: { en: "and We would surely have guided them", ur: "اور ہم ضرور انہیں دکھاتے" }, pieces: [p("وَ", "and", "اور"), p("لَ", "surely", "ضرور"), p("هَدَيْ", "guided", "دکھایا"), p("نَا", "we", "ہم"), p("هُمْ", "them", "انہیں")] },
    { ar: "صرطا", w: ["w:sirat"], g: { en: "a path", ur: "راستہ" } },
    { ar: "مستقيما", w: ["w:mustaqim"], g: { en: "straight", ur: "سیدھا" } },
  ],

  // Strong Starters
  "37:161": [
    { ar: "فانكم", w: ["w:fa", "w:inna", "w:kum"], g: { en: "So indeed you", ur: "پس بے شک تم" }, pieces: [p("فَ", "so", "پس"), p("إِنَّ", "indeed", "بے شک"), p("كُمْ", "you all", "تم")] },
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and what", ur: "اور جن کی" } },
    { ar: "تعبدون", w: ["w:nabudu"], g: { en: "you worship", ur: "تم عبادت کرتے ہو" } },
  ],
  "26:62": [
    { ar: "قال", given: true, pic: "🗣️", art: "w:qala", g: { en: "He said", ur: "اس نے کہا" } },
    { ar: "كلا", w: ["w:kalla"], g: { en: "No indeed!", ur: "ہرگز نہیں" } },
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "معي", w: ["w:maa", "w:i"], g: { en: "with me", ur: "میرے ساتھ" } },
    { ar: "ربي", w: ["w:rabb", "w:i"], g: { en: "(is) my Lord", ur: "میرا رب ہے" } },
    { ar: "سيهدين", w: ["w:sa", "w:ihdi", "w:i"], g: { en: "He will guide me", ur: "وہ مجھے راہ دکھائے گا" }, pieces: [p("سَـ", "will", "گا"), p("يَهْدِ", "guides", "دکھاتا"), p("ـنِ", "me", "مجھے")] },
  ],

  // Word Chest
  "51:56": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "خلقت", given: true, pic: "🌱", art: "w:khalaqa", g: { en: "did I create", ur: "میں نے پیدا کیا" } },
    { ar: "الجن", w: ["w:al", "w:jinn"], g: { en: "the jinn", ur: "جنوں" } },
    { ar: "والانس", w: ["w:wa", "w:al", "w:ins"], g: { en: "and mankind", ur: "اور انسانوں کو" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "ليعبدون", w: ["w:li", "w:nabudu", "w:i"], g: { en: "to worship Me", ur: "اس لیے کہ میری عبادت کریں" } },
  ],
  "55:26": [
    { ar: "كل", w: ["w:kull"], g: { en: "Everyone", ur: "ہر" } },
    { ar: "من", w: ["w:man"], g: { en: "who", ur: "جو" } },
    { ar: "عليها", w: ["w:ala", "w:ha"], g: { en: "is on it (the earth)", ur: "اس (زمین) پر ہے" } },
    { ar: "فان", given: true, pic: "🍂", art: "w:maata", g: { en: "will pass away", ur: "فنا ہونے والا ہے" } },
  ],
  "37:159": [
    { ar: "سبحن", w: ["w:subhan"], g: { en: "Glory be to", ur: "پاک ہے" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "عما", w: ["w:an", "w:ma"], note: "عَنْ after سُبْحَانَ: far above (what they say)", g: { en: "above what", ur: "ان باتوں سے جو" }, pieces: [p("عَنْ", "away from", "سے"), p("مَا", "what", "جو")] },
    { ar: "يصفون", given: true, pic: "🗣️", art: "w:yasifu", g: { en: "they describe", ur: "یہ بیان کرتے ہیں" } },
  ],

  // ---- Wing 2 · Names of Light ----
  "26:220": [
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed He", ur: "بے شک وہ" }, pieces: [p("إِنَّ", "indeed", "بے شک"), p("ـهُ", "him", "وہ")] },
    { ar: "هو", w: ["w:huwa"], g: { en: "He", ur: "وہی" } },
    { ar: "السميع", w: ["w:al", "w:sami"], g: { en: "is the All-Hearing", ur: "سب کچھ سننے والا" } },
    { ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب کچھ جاننے والا ہے" } },
  ],
  "26:9": [
    { ar: "وان", w: ["w:wa", "w:inna"], g: { en: "And indeed", ur: "اور بے شک" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تمہارا رب" }, pieces: [p("رَبّ", "Lord", "رب"), p("ـكَ", "your", "تمہارا")] },
    { ar: "لهو", w: ["w:la_surely", "w:huwa"], g: { en: "surely He", ur: "یقیناً وہی" } },
    { ar: "العزيز", w: ["w:al", "w:aziz"], g: { en: "is the Almighty", ur: "زبردست" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Most Merciful", ur: "رحم کرنے والا ہے" } },
  ],
  "44:6": [
    { ar: "رحمة", w: ["w:rahma"], g: { en: "As a mercy", ur: "رحمت کے طور پر" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "کی طرف سے" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تمہارے رب" } },
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed He", ur: "بے شک وہ" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "He", ur: "وہی" } },
    { ar: "السميع", w: ["w:al", "w:sami"], g: { en: "is the All-Hearing", ur: "سب کچھ سننے والا" } },
    { ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب کچھ جاننے والا ہے" } },
  ],
  "100:11": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "ربهم", w: ["w:rabb", "w:hum"], g: { en: "their Lord", ur: "ان کا رب" }, pieces: [p("رَبّ", "Lord", "رب"), p("ـهُمْ", "their", "ان کا")] },
    { ar: "بهم", w: ["w:bi", "w:hum"], g: { en: "about them", ur: "ان سے" } },
    { ar: "يومئذ", w: ["w:yawm", "w:idh"], g: { en: "on that day", ur: "اس دن" }, pieces: [p("يَوْمَ", "day", "دن"), p("إِذٍ", "then", "اس وقت")] },
    { ar: "لخبير", w: ["w:la_surely", "w:khabir"], g: { en: "is surely All-Aware", ur: "یقیناً پوری خبر رکھنے والا ہے" } },
  ],

  // ---- Wing 2 · Size Ladder ----
  "70:6": [
    { ar: "انهم", w: ["w:inna", "w:hum"], g: { en: "Indeed they", ur: "بے شک وہ" } },
    { ar: "يرونه", given: true, pic: "👀", art: "w:raa", g: { en: "see it", ur: "اسے دیکھتے ہیں" } },
    { ar: "بعيدا", w: ["w:baid"], g: { en: "(as) far off", ur: "دور" } },
  ],
  "70:7": [
    { ar: "ونرىه", given: true, pic: "👀", art: "w:raa", g: { en: "but We see it", ur: "اور ہم اسے دیکھتے ہیں" } },
    { ar: "قريبا", w: ["w:qarib"], g: { en: "(as) near", ur: "قریب" } },
  ],
  "92:13": [
    { ar: "وان", w: ["w:wa", "w:inna"], g: { en: "And indeed", ur: "اور بے شک" } },
    { ar: "لنا", w: ["w:li", "w:na"], g: { en: "to Us belong", ur: "ہمارے ہی لیے ہے" } },
    { ar: "للاخرة", w: ["w:la_surely", "w:al", "w:akhir"], g: { en: "the Hereafter", ur: "آخرت" }, pieces: [p("لَـ", "surely", "یقیناً"), p("الْ", "the", "وہی"), p("آخِرَة", "last (life)", "آخری (زندگی)")] },
    { ar: "والاولى", w: ["w:wa", "w:al", "w:awwal"], g: { en: "and the first (life)", ur: "اور دنیا (پہلی زندگی)" } },
  ],
  "85:12": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "بطش", given: true, pic: "✊", art: "w:akhdh", g: { en: "the grip", ur: "پکڑ" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "of your Lord", ur: "تمہارے رب کی" } },
    { ar: "لشديد", w: ["w:la_surely", "w:shadid"], g: { en: "is surely severe", ur: "یقیناً بہت سخت ہے" } },
  ],
  "56:14": [
    { ar: "وقليل", w: ["w:wa", "w:qalil"], g: { en: "and a few", ur: "اور تھوڑے" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "میں سے" } },
    { ar: "الاخرين", w: ["w:al", "w:akhir"], note: "آخِر in the plural: the later people", g: { en: "the later ones", ur: "بعد والوں" } },
  ],

  // ---- Wing 2 · Signs in the Sky (Ash-Shams 1–6, then 45:36) ----
  "91:1": [
    { ar: "والشمس", w: ["w:wa_oath", "w:al", "w:shams"], g: { en: "By the sun", ur: "قسم ہے سورج کی" }, pieces: [p("وَ", "by (oath)", "قسم"), p("الْ", "the", "وہی"), p("شَمْس", "sun", "سورج")] },
    { ar: "وضحىها", given: true, pic: "🌄", art: "g:morning", g: { en: "and its morning brightness", ur: "اور اس کی دھوپ کی" } },
  ],
  "91:2": [
    { ar: "والقمر", w: ["w:wa", "w:al", "w:qamar"], g: { en: "and (by) the moon", ur: "اور چاند کی" } },
    { ar: "اذا", w: ["w:idha"], g: { en: "when", ur: "جب" } },
    { ar: "تلىها", given: true, pic: "👣", art: "g:follows", g: { en: "it follows it", ur: "وہ اس کے پیچھے آئے" } },
  ],
  "91:3": [
    { ar: "والنهار", w: ["w:wa", "w:al", "w:nahar"], g: { en: "and (by) the day", ur: "اور دن کی" } },
    { ar: "اذا", w: ["w:idha"], g: { en: "when", ur: "جب" } },
    { ar: "جلىها", given: true, pic: "💡", art: "g:daylight", g: { en: "it shows it in full", ur: "وہ اسے روشن کر دے" } },
  ],
  "91:4": [
    { ar: "واليل", w: ["w:wa", "w:al", "w:layl"], g: { en: "and (by) the night", ur: "اور رات کی" } },
    { ar: "اذا", w: ["w:idha"], g: { en: "when", ur: "جب" } },
    { ar: "يغشىها", given: true, pic: "🫥", art: "w:layl", g: { en: "it covers it", ur: "وہ اسے ڈھانپ لے" } },
  ],
  "91:5": [
    { ar: "والسماء", w: ["w:wa", "w:al", "w:sama"], g: { en: "and (by) the sky", ur: "اور آسمان کی" } },
    { ar: "وما", w: ["w:wa", "w:ma"], note: "مَا in an oath: 'the One who' (also read 'and its building')", g: { en: "and (by) the One who", ur: "اور اس کی جس نے" } },
    { ar: "بنىها", given: true, pic: "🏗️", art: "g:skybuilt", g: { en: "built it", ur: "اسے بنایا" } },
  ],
  "91:6": [
    { ar: "والارض", w: ["w:wa", "w:al", "w:ard"], g: { en: "and (by) the earth", ur: "اور زمین کی" } },
    { ar: "وما", w: ["w:wa", "w:ma"], note: "مَا in an oath: 'the One who' (also read 'and its spreading')", g: { en: "and (by) the One who", ur: "اور اس کی جس نے" } },
    { ar: "طحىها", given: true, pic: "↔️", art: "g:plain", g: { en: "spread it out", ur: "اسے بچھایا" } },
  ],
  "45:36": [
    { ar: "فلله", w: ["w:fa", "w:li", "w:allah"], g: { en: "So for Allah is", ur: "پس اللہ ہی کے لیے ہے" }, pieces: [p("فَـ", "so", "پس"), p("لِ", "for", "کے لیے"), p("لّٰهِ", "Allah", "اللہ")] },
    { ar: "الحمد", w: ["w:al", "w:hamd"], g: { en: "all praise", ur: "سب تعریف" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "Lord of", ur: "جو رب ہے" } },
    { ar: "السموت", w: ["w:al", "w:sama"], g: { en: "the heavens", ur: "آسمانوں کا" }, pieces: [p("الْ", "the", "وہی"), p("سَمَاوَات", "skies (many)", "آسمان (بہت سے)")] },
    { ar: "ورب", w: ["w:wa", "w:rabb"], g: { en: "and Lord of", ur: "اور رب" } },
    { ar: "الارض", w: ["w:al", "w:ard"], g: { en: "the earth", ur: "زمین کا" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "Lord of", ur: "رب" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "the worlds", ur: "تمام جہانوں کا" } },
  ],

  // ---- Wing 2 · Name Scrolls ----
  "37:79": [
    { ar: "سلم", w: ["w:salam"], g: { en: "Peace", ur: "سلام ہو" } },
    { ar: "على", w: ["w:ala"], g: { en: "upon", ur: "پر" } },
    { ar: "نوح", w: ["w:nuh"], g: { en: "Nuh", ur: "نوح" } },
    { ar: "في", w: ["w:fi"], g: { en: "among", ur: "میں" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "the worlds", ur: "تمام جہانوں" } },
  ],
  "37:109": [
    { ar: "سلم", w: ["w:salam"], g: { en: "Peace", ur: "سلام ہو" } },
    { ar: "على", w: ["w:ala"], g: { en: "upon", ur: "پر" } },
    { ar: "ابرهيم", w: ["w:ibrahim"], g: { en: "Ibrahim", ur: "ابراہیم" } },
  ],
  "37:120": [
    { ar: "سلم", w: ["w:salam"], g: { en: "Peace", ur: "سلام ہو" } },
    { ar: "على", w: ["w:ala"], g: { en: "upon", ur: "پر" } },
    { ar: "موسى", w: ["w:musa"], g: { en: "Musa", ur: "موسیٰ" } },
    { ar: "وهرون", w: ["w:wa", "w:harun"], g: { en: "and Harun", ur: "اور ہارون" } },
  ],
  "85:18": [
    { ar: "فرعون", w: ["w:firawn"], g: { en: "(of) Pharaoh", ur: "فرعون" } },
    { ar: "وثمود", w: ["w:wa", "w:thamud"], g: { en: "and Thamud", ur: "اور ثمود" } },
  ],
  "27:30": [
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed it (the letter) is", ur: "بے شک یہ (خط)" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "کی طرف سے ہے" } },
    { ar: "سليمن", w: ["w:sulayman"], g: { en: "Sulayman", ur: "سلیمان" } },
    { ar: "وانه", w: ["w:wa", "w:inna", "w:hu"], g: { en: "and indeed it is", ur: "اور بے شک وہ" } },
    { ar: "بسم", w: ["w:bi", "w:ism"], g: { en: "In the name", ur: "نام سے" } },
    { ar: "الله", w: ["w:allah"], g: { en: "of Allah", ur: "اللہ کے" } },
    { ar: "الرحمن", w: ["w:al", "w:rahman"], g: { en: "the Most Gracious", ur: "جو نہایت مہربان" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Most Merciful", ur: "رحم کرنے والا ہے" } },
  ],

  // ---- Wing 2 · The Last Day ----
  "37:43": [
    { ar: "في", w: ["w:fi"], g: { en: "In", ur: "میں" } },
    { ar: "جنت", w: ["w:jannah"], g: { en: "gardens", ur: "باغوں" }, pieces: [p("جَنَّة", "garden", "باغ"), p("ـَات", "many", "بہت سے")] },
    { ar: "النعيم", w: ["w:al", "w:naim"], g: { en: "of bliss", ur: "نعمت کے" } },
  ],
  "53:15": [
    { ar: "عندها", w: ["w:inda", "w:ha"], g: { en: "Near it is", ur: "اس کے پاس" } },
    { ar: "جنة", w: ["w:jannah"], g: { en: "the Garden", ur: "جنت" } },
    { ar: "الماوى", w: ["w:al", "w:mawa"], g: { en: "of Refuge", ur: "ٹھکانے والی ہے" } },
  ],
  "15:50": [
    { ar: "وان", w: ["w:wa", "w:anna_that"], g: { en: "And that", ur: "اور یہ کہ" } },
    { ar: "عذابي", w: ["w:azab", "w:i"], g: { en: "My punishment", ur: "میرا عذاب" }, pieces: [p("عَذَاب", "punishment", "عذاب"), p("ـِي", "my", "میرا")] },
    { ar: "هو", w: ["w:huwa"], note: "هُوَ points back to 'My punishment': it", g: { en: "it", ur: "وہی" } },
    { ar: "العذاب", w: ["w:al", "w:azab"], g: { en: "is the punishment", ur: "عذاب ہے" } },
    { ar: "الاليم", w: ["w:al", "w:alim_pain"], g: { en: "the painful", ur: "دردناک" } },
  ],
  "75:1": [
    { ar: "لا", w: ["w:la"], g: { en: "Nay!", ur: "نہیں!" } },
    { ar: "اقسم", given: true, pic: "🤚", art: "w:wa_oath", g: { en: "I swear", ur: "میں قسم کھاتا ہوں" } },
    { ar: "بيوم", w: ["w:bi", "w:yawm"], g: { en: "by the Day", ur: "دن کی" } },
    { ar: "القيمة", w: ["w:al", "w:qiyama"], g: { en: "of Rising", ur: "قیامت کے" } },
  ],
  "77:15": [
    { ar: "ويل", w: ["w:wayl"], g: { en: "Woe", ur: "تباہی ہے" } },
    { ar: "يومئذ", w: ["w:yawm", "w:idh"], g: { en: "on that day", ur: "اس دن" } },
    { ar: "للمكذبين", given: true, pic: "🙅", art: "w:kadhdhaba", g: { en: "to the deniers", ur: "جھٹلانے والوں کے لیے" } },
  ],

  // ---- Wing 2 · Faith Words ----
  "35:20": [
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "nor (are alike)", ur: "اور نہ" } },
    { ar: "الظلمت", w: ["w:al", "w:zulumat"], g: { en: "the darkness", ur: "اندھیرے" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "nor", ur: "اور نہ" } },
    { ar: "النور", w: ["w:al", "w:nur"], g: { en: "the light", ur: "روشنی" } },
  ],
  "56:95": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "هذا", w: ["w:hadha"], g: { en: "this", ur: "یہ" } },
    { ar: "لهو", w: ["w:la_surely", "w:huwa"], note: "لَ surely + هُوَ pointing back to 'this': it is", g: { en: "surely it is", ur: "یقیناً یہی" } },
    { ar: "حق", w: ["w:haqq"], g: { en: "the truth", ur: "حق ہے" } },
    { ar: "اليقين", given: true, pic: "✔️", art: "g:certain", g: { en: "of certainty", ur: "یقینی" } },
  ],
  "26:2": [
    { ar: "تلك", w: ["w:tilka"], note: "the far word تِلْكَ is said as 'these' in English and Urdu", g: { en: "These", ur: "یہ" } },
    { ar: "ءايت", w: ["w:aya"], g: { en: "are verses", ur: "آیتیں ہیں" }, pieces: [p("آيَة", "verse", "آیت"), p("ـَات", "many", "بہت سی")] },
    { ar: "الكتب", w: ["w:al", "w:kitab"], g: { en: "of the Book", ur: "کتاب کی" } },
    { ar: "المبين", w: ["w:al", "w:mubin"], g: { en: "the clear", ur: "واضح" } },
  ],
  "44:2": [
    { ar: "والكتب", w: ["w:wa_oath", "w:al", "w:kitab"], g: { en: "By the Book", ur: "قسم ہے کتاب کی" } },
    { ar: "المبين", w: ["w:al", "w:mubin"], g: { en: "the clear", ur: "واضح" } },
  ],
  "37:4": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الهكم", w: ["w:ilah", "w:kum"], g: { en: "your God", ur: "تمہارا معبود" }, pieces: [p("إِلٰه", "god", "معبود"), p("ـكُمْ", "your", "تمہارا")] },
    { ar: "لوحد", w: ["w:la_surely", "w:wahid"], g: { en: "is surely One", ur: "یقیناً ایک ہی ہے" } },
  ],

  // ---- Wing 2 · Deeds & Blessings ----
  "37:60": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "هذا", w: ["w:hadha"], g: { en: "this", ur: "یہ" } },
    { ar: "لهو", w: ["w:la_surely", "w:huwa"], note: "لَ surely + هُوَ pointing back to 'this': it is", g: { en: "surely it is", ur: "یقیناً یہی" } },
    { ar: "الفوز", w: ["w:al", "w:fawz"], g: { en: "the triumph", ur: "کامیابی ہے" } },
    { ar: "العظيم", w: ["w:al", "w:azim"], g: { en: "the great", ur: "بڑی" } },
  ],
  "44:57": [
    { ar: "فضلا", w: ["w:fadl"], g: { en: "As a bounty", ur: "فضل کے طور پر" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "کی طرف سے" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تمہارے رب" } },
    { ar: "ذلك", w: ["w:dhalika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "That", ur: "یہی" } },
    { ar: "هو", w: ["w:huwa"], note: "هُوَ between two parts of a sentence: 'that is'", g: { en: "is", ur: "ہے" } },
    { ar: "الفوز", w: ["w:al", "w:fawz"], g: { en: "the triumph", ur: "کامیابی" } },
    { ar: "العظيم", w: ["w:al", "w:azim"], g: { en: "the great", ur: "بڑی" } },
  ],
  "49:8": [
    { ar: "فضلا", w: ["w:fadl"], g: { en: "As a bounty", ur: "فضل" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "کی طرف سے" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "ونعمة", w: ["w:wa", "w:nima_gift"], g: { en: "and a blessing", ur: "اور نعمت" } },
    { ar: "والله", w: ["w:wa", "w:allah"], g: { en: "And Allah is", ur: "اور اللہ" } },
    { ar: "عليم", w: ["w:alim"], g: { en: "All-Knowing", ur: "سب کچھ جاننے والا" } },
    { ar: "حكيم", w: ["w:hakim"], g: { en: "All-Wise", ur: "حکمت والا ہے" } },
  ],
  "93:4": [
    { ar: "وللاخرة", w: ["w:wa", "w:la_surely", "w:al", "w:akhir"], g: { en: "And the Hereafter is surely", ur: "اور یقیناً آخرت" } },
    { ar: "خير", w: ["w:khayr"], g: { en: "better", ur: "بہتر ہے" } },
    { ar: "لك", w: ["w:li", "w:ka"], g: { en: "for you", ur: "تمہارے لیے" } },
    { ar: "من", w: ["w:min"], g: { en: "than", ur: "سے" } },
    { ar: "الاولى", w: ["w:al", "w:awwal"], g: { en: "the first (life)", ur: "پہلی (زندگی)" } },
  ],
  "37:156": [
    { ar: "ام", w: ["w:am"], g: { en: "Or", ur: "یا" } },
    { ar: "لكم", w: ["w:li", "w:kum"], g: { en: "do you have", ur: "تمہارے پاس ہے" } },
    { ar: "سلطن", w: ["w:sultan"], g: { en: "an authority (proof)", ur: "کوئی دلیل" } },
    { ar: "مبين", w: ["w:mubin"], g: { en: "clear?", ur: "واضح؟" } },
  ],

  // ---- Wing 2 · Family & Body ----
  "20:30": [
    { ar: "هرون", w: ["w:harun"], g: { en: "Harun", ur: "ہارون" } },
    { ar: "اخي", w: ["w:akh", "w:i"], g: { en: "my brother", ur: "میرا بھائی" }, pieces: [p("أَخ", "brother", "بھائی"), p("ـِي", "my", "میرا")] },
  ],
  "80:35": [
    { ar: "وامه", w: ["w:wa", "w:umm", "w:hu"], g: { en: "and his mother", ur: "اور اپنی ماں" }, pieces: [p("وَ", "and", "اور"), p("أُمّ", "mother", "ماں"), p("ـهِ", "his", "اس کی")] },
    { ar: "وابيه", w: ["w:wa", "w:ab", "w:hu"], g: { en: "and his father", ur: "اور اپنے باپ" } },
  ],
  "53:21": [
    { ar: "الكم", w: ["w:a", "w:li", "w:kum"], g: { en: "Is it for you", ur: "کیا تمہارے لیے" }, pieces: [p("أَ", "is it?", "کیا"), p("لَـ", "for", "کے لیے"), p("ـكُمْ", "you", "تم")] },
    { ar: "الذكر", w: ["w:al", "w:dhakar"], g: { en: "the male", ur: "بیٹے" } },
    { ar: "وله", w: ["w:wa", "w:li", "w:hu"], g: { en: "and for Him", ur: "اور اس کے لیے" } },
    { ar: "الانثى", w: ["w:al", "w:untha"], g: { en: "the female?", ur: "بیٹیاں؟" } },
  ],
  "75:22": [
    { ar: "وجوه", w: ["w:wajh"], g: { en: "Faces", ur: "کچھ چہرے" }, pieces: [p("وُجُوه", "faces (inside-change plural of وَجْه)", "چہرے (وَجْه کی جمع)")] },
    { ar: "يومئذ", w: ["w:yawm", "w:idh"], g: { en: "on that day", ur: "اس دن" } },
    { ar: "ناضرة", given: true, pic: "✨", art: "g:radiant", g: { en: "will be radiant", ur: "تر و تازہ ہوں گے" } },
  ],
  "44:52": [
    { ar: "في", w: ["w:fi"], g: { en: "Among", ur: "میں" } },
    { ar: "جنت", w: ["w:jannah"], g: { en: "gardens", ur: "باغوں" } },
    { ar: "وعيون", w: ["w:wa", "w:ayn"], g: { en: "and springs", ur: "اور چشموں" }, pieces: [p("وَ", "and", "اور"), p("عُيُون", "springs (plural of عَيْن)", "چشمے (عَيْن کی جمع)")] },
  ],

  // ---- Wing 2 · Town & People ----
  "22:43": [
    { ar: "وقوم", w: ["w:wa", "w:qawm"], g: { en: "and the people", ur: "اور قوم" } },
    { ar: "ابرهيم", w: ["w:ibrahim"], g: { en: "of Ibrahim", ur: "ابراہیم کی" } },
    { ar: "وقوم", w: ["w:wa", "w:qawm"], g: { en: "and the people", ur: "اور قوم" } },
    { ar: "لوط", w: ["w:lut"], g: { en: "of Lut", ur: "لوط کی" } },
  ],
  "26:77": [
    { ar: "فانهم", w: ["w:fa", "w:inna", "w:hum"], g: { en: "So indeed they are", ur: "پس بے شک وہ" } },
    { ar: "عدو", w: ["w:aduw"], g: { en: "enemies", ur: "دشمن ہیں" } },
    { ar: "لي", w: ["w:li", "w:i"], g: { en: "to me", ur: "میرے" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "سوائے" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "the Lord", ur: "رب کے" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "of the worlds", ur: "تمام جہانوں کے" } },
  ],
  "16:117": [
    { ar: "متع", w: ["w:mataa"], g: { en: "An enjoyment", ur: "فائدہ" } },
    { ar: "قليل", w: ["w:qalil"], g: { en: "small", ur: "تھوڑا سا ہے" } },
    { ar: "ولهم", w: ["w:wa", "w:li", "w:hum"], g: { en: "and for them is", ur: "اور ان کے لیے" } },
    { ar: "عذاب", w: ["w:azab"], g: { en: "a punishment", ur: "عذاب ہے" } },
    { ar: "اليم", w: ["w:alim_pain"], g: { en: "painful", ur: "دردناک" } },
  ],
  "64:15": [
    { ar: "انما", w: ["w:inna", "w:ma"], note: "إِنَّمَا (إِنَّ + مَا) means 'only'", g: { en: "Only", ur: "صرف" }, pieces: [p("إِنَّ", "indeed", "بے شک"), p("مَا", "(only)", "(صرف)")] },
    { ar: "امولكم", w: ["w:mal", "w:kum"], g: { en: "your wealth", ur: "تمہارے مال" }, pieces: [p("أَمْوَال", "wealth (plural of مَال)", "مال (جمع)"), p("ـكُمْ", "your", "تمہارے")] },
    { ar: "واولدكم", w: ["w:wa", "w:walad", "w:kum"], g: { en: "and your children", ur: "اور تمہاری اولاد" } },
    { ar: "فتنة", w: ["w:fitna"], g: { en: "are a test", ur: "آزمائش ہیں" } },
    { ar: "والله", w: ["w:wa", "w:allah"], g: { en: "and Allah", ur: "اور اللہ" } },
    { ar: "عنده", w: ["w:inda", "w:hu"], g: { en: "with Him is", ur: "اس کے پاس" } },
    { ar: "اجر", w: ["w:ajr"], g: { en: "a reward", ur: "اجر ہے" } },
    { ar: "عظيم", w: ["w:azim"], g: { en: "great", ur: "بڑا" } },
  ],
  "36:44": [
    { ar: "الا", w: ["w:illa"], g: { en: "Except", ur: "مگر" } },
    { ar: "رحمة", w: ["w:rahma"], g: { en: "as a mercy", ur: "رحمت سے" } },
    { ar: "منا", w: ["w:min", "w:na"], g: { en: "from Us", ur: "ہماری طرف سے" } },
    { ar: "ومتعا", w: ["w:wa", "w:mataa"], g: { en: "and enjoyment", ur: "اور فائدہ" } },
    { ar: "الى", w: ["w:ila"], note: "إِلَى with a time: until, for (a while)", g: { en: "for", ur: "تک" } },
    { ar: "حين", w: ["w:hina"], g: { en: "a while", ur: "ایک وقت" } },
  ],

  // ---- Wing 2 · Word Chest 2 ----
  "78:2": [
    { ar: "عن", w: ["w:an"], g: { en: "About", ur: "کے بارے میں" } },
    { ar: "النبا", w: ["w:al", "w:naba"], g: { en: "the news", ur: "خبر" } },
    { ar: "العظيم", w: ["w:al", "w:azim"], g: { en: "the great", ur: "بڑی" } },
  ],
  "82:13": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الابرار", w: ["w:al", "w:barr"], g: { en: "the righteous", ur: "نیک لوگ" }, pieces: [p("الْ", "the", "وہی"), p("أَبْرَار", "righteous ones (plural of بَرّ)", "نیک لوگ (جمع)")] },
    { ar: "لفي", w: ["w:la_surely", "w:fi"], g: { en: "will surely be in", ur: "یقیناً میں ہوں گے" } },
    { ar: "نعيم", w: ["w:naim"], g: { en: "bliss", ur: "نعمتوں" } },
  ],
  "15:35": [
    { ar: "وان", w: ["w:wa", "w:inna"], g: { en: "And indeed", ur: "اور بے شک" } },
    { ar: "عليك", w: ["w:ala", "w:ka"], g: { en: "upon you is", ur: "تجھ پر" } },
    { ar: "اللعنة", w: ["w:al", "w:lana"], g: { en: "the curse", ur: "لعنت ہے" } },
    { ar: "الى", w: ["w:ila"], note: "إِلَى with a time: until", g: { en: "until", ur: "تک" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "the Day", ur: "دن" } },
    { ar: "الدين", w: ["w:al", "w:din"], g: { en: "of Judgement", ur: "بدلے کے" } },
  ],
  "36:17": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "علينا", w: ["w:ala", "w:na"], g: { en: "on us (is anything)", ur: "ہم پر" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "البلغ", w: ["w:al", "w:balagh"], g: { en: "the conveying", ur: "پہنچا دینا" } },
    { ar: "المبين", w: ["w:al", "w:mubin"], g: { en: "clear", ur: "صاف صاف" } },
  ],
  "20:8": [
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "لا", w: ["w:la"], g: { en: "there is no", ur: "نہیں" } },
    { ar: "اله", w: ["w:ilah"], g: { en: "god", ur: "کوئی معبود" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "سوائے" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "Him", ur: "اس کے" } },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "To Him belong", ur: "اسی کے ہیں" } },
    { ar: "الاسماء", w: ["w:al", "w:ism"], g: { en: "the names", ur: "نام" }, pieces: [p("الْ", "the", "وہی"), p("أَسْمَاء", "names (plural of اسْم)", "نام (جمع)")] },
    { ar: "الحسنى", w: ["w:al", "w:husna"], g: { en: "most beautiful", ur: "سب سے اچھے" } },
  ],
  "114:2": [
    { ar: "ملك", w: ["w:malik_king"], g: { en: "The King", ur: "بادشاہ" } },
    { ar: "الناس", w: ["w:al", "w:nas"], g: { en: "of mankind", ur: "لوگوں کا" } },
  ],

  // ---- Wing 2 · Review Hall 1 ----
  "56:77": [
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed it is", ur: "بے شک یہ" } },
    { ar: "لقرءان", w: ["w:la_surely", "w:quran"], g: { en: "surely a Qur'an", ur: "یقیناً قرآن ہے" } },
    { ar: "كريم", w: ["w:karim"], note: "كَرِيم here describes the Qur'an (a noble Book), the card's everyday meaning; owner sign-off pending", g: { en: "noble", ur: "عزت والا" } },
  ],
  "26:107": [
    { ar: "اني", w: ["w:inna", "w:i"], g: { en: "Indeed I am", ur: "بے شک میں" } },
    { ar: "لكم", w: ["w:li", "w:kum"], g: { en: "to you", ur: "تمہارے لیے" } },
    { ar: "رسول", w: ["w:rasul"], g: { en: "a messenger", ur: "رسول ہوں" } },
    { ar: "امين", w: ["w:amin"], g: { en: "trustworthy", ur: "امانت دار" } },
  ],
  "26:115": [
    { ar: "ان", given: true, pic: "✕", art: "w:la", g: { en: "Not (here إِنْ means not)", ur: "نہیں (یہاں إِنْ کا مطلب نہیں)" } },
    { ar: "انا", w: ["w:ana"], g: { en: "am I", ur: "ہوں میں" } },
    { ar: "الا", w: ["w:illa"], g: { en: "but", ur: "مگر" } },
    { ar: "نذير", w: ["w:nadhir"], g: { en: "a warner", ur: "ڈرانے والا" } },
    { ar: "مبين", w: ["w:mubin"], g: { en: "clear", ur: "صاف صاف" } },
  ],
  "75:34": [
    { ar: "اولى", w: ["w:awla"], g: { en: "More fitting (is doom)", ur: "زیادہ لائق ہے (تباہی)" } },
    { ar: "لك", w: ["w:li", "w:ka"], g: { en: "for you", ur: "تیرے لیے" } },
    { ar: "فاولى", w: ["w:fa", "w:awla"], g: { en: "and more fitting", ur: "پھر زیادہ لائق" } },
  ],

  // ---- Wing 2 · Review Hall 2 ----
  "56:27": [
    { ar: "واصحب", w: ["w:wa", "w:ashab"], g: { en: "And the companions", ur: "اور والے" } },
    { ar: "اليمين", w: ["w:al", "w:yamin"], g: { en: "of the right", ur: "دائیں ہاتھ" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what (are)", ur: "کیا (ہی اچھے)" } },
    { ar: "اصحب", w: ["w:ashab"], g: { en: "the companions", ur: "والے" } },
    { ar: "اليمين", w: ["w:al", "w:yamin"], g: { en: "of the right!", ur: "دائیں ہاتھ!" } },
  ],
  "56:41": [
    { ar: "واصحب", w: ["w:wa", "w:ashab"], g: { en: "And the companions", ur: "اور والے" } },
    { ar: "الشمال", w: ["w:al", "w:shimal"], g: { en: "of the left", ur: "بائیں ہاتھ" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what (are)", ur: "کیا (ہی برے)" } },
    { ar: "اصحب", w: ["w:ashab"], g: { en: "the companions", ur: "والے" } },
    { ar: "الشمال", w: ["w:al", "w:shimal"], g: { en: "of the left!", ur: "بائیں ہاتھ!" } },
  ],
  "43:4": [
    { ar: "وانه", w: ["w:wa", "w:inna", "w:hu"], g: { en: "And indeed it is", ur: "اور بے شک یہ" } },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "ام", w: ["w:umm"], g: { en: "the Mother", ur: "اصل" } },
    { ar: "الكتب", w: ["w:al", "w:kitab"], g: { en: "of the Book", ur: "کتاب کی" } },
    { ar: "لدينا", w: ["w:lada", "w:na"], g: { en: "with Us", ur: "ہمارے پاس" }, pieces: [p("لَدَى", "with", "پاس"), p("ـنَا", "us", "ہمارے")] },
    { ar: "لعلي", w: ["w:la_surely", "w:ali"], note: "عَلِيّ here describes the Book (exalted), the card's everyday meaning; owner sign-off pending", g: { en: "surely exalted", ur: "یقیناً بلند" } },
    { ar: "حكيم", given: true, pic: "🦉", art: "w:hikma", g: { en: "full of wisdom", ur: "حکمت والا ہے" } },
  ],
  "69:35": [
    { ar: "فليس", w: ["w:fa", "w:laysa"], g: { en: "So there is not", ur: "پس نہیں" } },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "for him", ur: "اس کے لیے" } },
    { ar: "اليوم", w: ["w:al", "w:yawm"], g: { en: "today", ur: "آج" } },
    { ar: "ههنا", w: ["w:huna"], g: { en: "here", ur: "یہاں" } },
    { ar: "حميم", w: ["w:hamim"], g: { en: "any close friend", ur: "کوئی گہرا دوست" } },
  ],
  "24:42": [
    { ar: "ولله", w: ["w:wa", "w:li", "w:allah"], g: { en: "And to Allah belongs", ur: "اور اللہ ہی کی ہے" } },
    { ar: "ملك", w: ["w:mulk"], g: { en: "the dominion", ur: "بادشاہی" } },
    { ar: "السموت", w: ["w:al", "w:sama"], g: { en: "of the heavens", ur: "آسمانوں" } },
    { ar: "والارض", w: ["w:wa", "w:al", "w:ard"], g: { en: "and the earth", ur: "اور زمین کی" } },
    { ar: "والى", w: ["w:wa", "w:ila"], g: { en: "and to", ur: "اور طرف" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ ہی کی" } },
    { ar: "المصير", w: ["w:al", "w:masir"], g: { en: "is the final return", ur: "لوٹنا ہے" } },
  ],
  "27:26": [
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "لا", w: ["w:la"], g: { en: "there is no", ur: "نہیں" } },
    { ar: "اله", w: ["w:ilah"], g: { en: "god", ur: "کوئی معبود" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "سوائے" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "Him", ur: "اس کے" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "Lord of", ur: "جو رب ہے" } },
    { ar: "العرش", w: ["w:al", "w:arsh"], g: { en: "the Throne", ur: "عرش کا" } },
    { ar: "العظيم", w: ["w:al", "w:azim"], g: { en: "the Great", ur: "عظیم" } },
  ],

  // ---- Wing 3 · Six Petals ----
  "48:1": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم نے" } },
    { ar: "فتحنا", w: ["w:fataha", "w:na"], g: { en: "opened", ur: "کھول دی" }, pieces: [p("فَتَحْ", "open (did)", "کھولا"), p("ـنَا", "we", "ہم نے")] },
    { ar: "لك", w: ["w:li", "w:ka"], g: { en: "for you", ur: "آپ کے لیے" } },
    { ar: "فتحا", w: ["w:fath"], g: { en: "an opening (a victory)", ur: "فتح" } },
    { ar: "مبينا", w: ["w:mubin"], g: { en: "clear", ur: "کھلی" } },
  ],
  "77:18": [
    { ar: "كذلك", w: ["w:ka_like", "w:dhalika"], g: { en: "Like that", ur: "اسی طرح" }, pieces: [p("كَ", "like", "جیسے"), p("ذٰلِكَ", "that", "وہ")] },
    { ar: "نفعل", w: ["w:faala"], g: { en: "We do", ur: "ہم کرتے ہیں" }, pieces: [p("نَـ", "we (now / later)", "ہم"), p("فْعَلُ", "do", "کرنا")] },
    { ar: "بالمجرمين", w: ["w:bi", "w:al", "w:mujrim"], g: { en: "with the wrongdoers", ur: "مجرموں کے ساتھ" } },
  ],
  "23:4": [
    { ar: "والذين", w: ["w:wa", "w:alladhina"], g: { en: "And those who", ur: "اور وہ جو" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "للزكوة", w: ["w:li", "w:al", "w:zakah"], g: { en: "zakah", ur: "زکوٰۃ" } },
    { ar: "فعلون", w: ["w:fail"], g: { en: "are doers of", ur: "ادا کرنے والے ہیں" }, pieces: [p("فَاعِل", "doer", "کرنے والا"), p("ـُونَ", "many", "بہت سے")] },
  ],

  // ---- Wing 3 · Doing Words 1 ----
  "19:57": [
    { ar: "ورفعنه", w: ["w:wa", "w:rafaa", "w:na", "w:hu"], g: { en: "And We raised him", ur: "اور ہم نے اسے اٹھایا" }, pieces: [p("وَ", "and", "اور"), p("رَفَعْ", "raise (did)", "اٹھایا"), p("ـنَا", "we", "ہم نے"), p("ـهُ", "him", "اسے")] },
    { ar: "مكانا", w: ["w:makan"], g: { en: "to a place", ur: "ایک مقام پر" } },
    { ar: "عليا", w: ["w:ali"], note: "عَلِيّ here describes a place (high), the card's everyday meaning; owner sign-off pending", g: { en: "high", ur: "بلند" } },
  ],
  "26:88": [
    { ar: "يوم", w: ["w:yawm"], g: { en: "The Day", ur: "جس دن" } },
    { ar: "لا", w: ["w:la"], g: { en: "will not", ur: "نہ" } },
    { ar: "ينفع", w: ["w:nafaa"], g: { en: "benefit", ur: "فائدہ دے گا" }, pieces: [p("يَـ", "he / it (now / later)", "وہ"), p("نْفَعُ", "benefit", "فائدہ")] },
    { ar: "مال", w: ["w:mal"], g: { en: "wealth", ur: "مال" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "nor", ur: "اور نہ" } },
    { ar: "بنون", w: ["w:ibn"], g: { en: "sons", ur: "بیٹے" } },
  ],
  "75:17": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "علينا", w: ["w:ala", "w:na"], g: { en: "upon Us is", ur: "ہمارے ذمے ہے" } },
    { ar: "جمعه", w: ["w:jam", "w:hu"], g: { en: "its gathering", ur: "اس کا جمع کرنا" } },
    { ar: "وقرءانه", w: ["w:wa", "w:quran", "w:hu"], g: { en: "and its recitation", ur: "اور اس کا پڑھانا" } },
  ],
  "78:10": [
    { ar: "وجعلنا", w: ["w:wa", "w:jaala", "w:na"], g: { en: "And We made", ur: "اور ہم نے بنایا" }, pieces: [p("وَ", "and", "اور"), p("جَعَلْ", "make (did)", "بنایا"), p("ـنَا", "we", "ہم نے")] },
    { ar: "اليل", w: ["w:al", "w:layl"], g: { en: "the night", ur: "رات کو" } },
    { ar: "لباسا", given: true, pic: "🧥", art: "g:covering", g: { en: "a covering", ur: "پردہ" } },
  ],
  "78:11": [
    { ar: "وجعلنا", w: ["w:wa", "w:jaala", "w:na"], g: { en: "And We made", ur: "اور ہم نے بنایا" } },
    { ar: "النهار", w: ["w:al", "w:nahar"], g: { en: "the day", ur: "دن کو" } },
    { ar: "معاشا", given: true, pic: "🧺", art: "w:kasaba", g: { en: "for earning a living", ur: "روزی کا وقت" } },
  ],

  // ---- Wing 3 · Person Wheel ----
  "81:26": [
    { ar: "فاين", w: ["w:fa", "w:ayna"], g: { en: "So where", ur: "پھر کہاں" } },
    { ar: "تذهبون", w: ["w:dhahaba"], g: { en: "are you all going?", ur: "تم جا رہے ہو؟" }, pieces: [p("تَـ", "you (now / later)", "تم"), p("ذْهَبُ", "go", "جانا"), p("ـُونَ", "all of you", "تم سب")] },
  ],
  "94:4": [
    { ar: "ورفعنا", w: ["w:wa", "w:rafaa", "w:na"], g: { en: "And We raised", ur: "اور ہم نے بلند کیا" } },
    { ar: "لك", w: ["w:li", "w:ka"], g: { en: "for you", ur: "آپ کے لیے" } },
    { ar: "ذكرك", given: true, pic: "📣", art: "w:dhikr", g: { en: "your mention", ur: "آپ کا ذکر" } },
  ],
  "37:34": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم" } },
    { ar: "كذلك", w: ["w:ka_like", "w:dhalika"], g: { en: "like that", ur: "اسی طرح" } },
    { ar: "نفعل", w: ["w:faala"], g: { en: "do", ur: "کرتے ہیں" } },
    { ar: "بالمجرمين", w: ["w:bi", "w:al", "w:mujrim"], g: { en: "with the wrongdoers", ur: "مجرموں کے ساتھ" } },
  ],

  // ---- Wing 3 · Doing Words 2 ----
  "55:3": [
    { ar: "خلق", w: ["w:khalaqa"], g: { en: "He created", ur: "اس نے پیدا کیا" } },
    { ar: "الانسن", w: ["w:al", "w:insan"], g: { en: "the human being", ur: "انسان کو" } },
  ],
  "96:2": [
    { ar: "خلق", w: ["w:khalaqa"], g: { en: "He created", ur: "اس نے پیدا کیا" } },
    { ar: "الانسن", w: ["w:al", "w:insan"], g: { en: "the human being", ur: "انسان کو" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "علق", given: true, pic: "🩸", art: "g:clot", g: { en: "a clinging clot", ur: "جمے ہوئے خون" } },
  ],
  "15:30": [
    { ar: "فسجد", w: ["w:fa", "w:sajada"], g: { en: "So … bowed down", ur: "تو سجدہ کیا" } },
    { ar: "الملئكة", w: ["w:al", "w:malak"], g: { en: "the angels", ur: "فرشتوں نے" } },
    { ar: "كلهم", w: ["w:kull", "w:hum"], g: { en: "all of them", ur: "سب نے" } },
    { ar: "اجمعون", w: ["w:ajma"], note: "أَجْمَعُونَ: all of them, together", g: { en: "together", ur: "اکٹھے" } },
  ],
  "37:78": [
    { ar: "وتركنا", w: ["w:wa", "w:taraka", "w:na"], g: { en: "And We left", ur: "اور ہم نے چھوڑا" }, pieces: [p("وَ", "and", "اور"), p("تَرَكْ", "leave (did)", "چھوڑا"), p("ـنَا", "we", "ہم نے")] },
    { ar: "عليه", w: ["w:ala", "w:hu"], note: "عَلَى with تَرَكْنَا: (We left) for him", g: { en: "for him", ur: "اس کے لیے" } },
    { ar: "في", w: ["w:fi"], g: { en: "among", ur: "میں" } },
    { ar: "الاخرين", w: ["w:al", "w:akhir"], note: "آخِر in the plural: the later people", g: { en: "the later people", ur: "بعد والوں" } },
  ],
  "20:34": [
    { ar: "ونذكرك", w: ["w:wa", "w:dhakara", "w:ka"], g: { en: "and remember You", ur: "اور تجھے یاد کریں" }, pieces: [p("وَ", "and", "اور"), p("نَذْكُرَ", "we remember", "ہم یاد کریں"), p("ـكَ", "you", "تجھے")] },
    { ar: "كثيرا", w: ["w:kathir"], g: { en: "much", ur: "بہت" } },
  ],
  "110:1": [
    { ar: "اذا", w: ["w:idha"], g: { en: "When", ur: "جب" } },
    { ar: "جاء", given: true, pic: "🚶", art: "w:jaa", g: { en: "comes", ur: "آ جائے" } },
    { ar: "نصر", w: ["w:nasr"], g: { en: "the help", ur: "مدد" } },
    { ar: "الله", w: ["w:allah"], g: { en: "of Allah", ur: "اللہ کی" } },
    { ar: "والفتح", w: ["w:wa", "w:al", "w:fath"], g: { en: "and the victory", ur: "اور فتح" } },
  ],

  // ---- Wing 3 · Doing Words 3 ----
  "2:152": [
    { ar: "فاذكروني", w: ["w:fa", "w:dhakara", "w:i"], g: { en: "So remember Me", ur: "تو مجھے یاد کرو" }, pieces: [p("فَ", "so", "تو"), p("اذْكُرُو", "remember! (all of you)", "یاد کرو"), p("ـنِي", "me", "مجھے")] },
    { ar: "اذكركم", w: ["w:dhakara", "w:kum"], g: { en: "I will remember you", ur: "میں تمہیں یاد کروں گا" }, pieces: [p("أَذْكُرْ", "I remember", "میں یاد کروں"), p("ـكُمْ", "you all", "تمہیں")] },
    { ar: "واشكروا", w: ["w:wa", "w:shakara"], g: { en: "and be grateful", ur: "اور شکر کرو" } },
    { ar: "لي", w: ["w:li", "w:i"], g: { en: "to Me", ur: "میرا" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "and do not", ur: "اور نہ" } },
    { ar: "تكفرون", w: ["w:kafara", "w:i"], g: { en: "deny Me", ur: "میری ناشکری کرو" }, pieces: [p("تَكْفُرُو", "you deny", "تم انکار کرو"), p("ـنِ", "me", "میرا")] },
  ],
  "76:3": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم نے" } },
    { ar: "هدينه", w: ["w:ihdi", "w:na", "w:hu"], note: "هَدَى guide: 'We showed him (the way)'", g: { en: "showed him", ur: "اسے دکھایا" }, pieces: [p("هَدَيْ", "guide (did)", "راہ دکھائی"), p("ـنَا", "we", "ہم نے"), p("ـهُ", "him", "اسے")] },
    { ar: "السبيل", w: ["w:al", "w:sabil"], g: { en: "the way", ur: "راستہ" } },
    { ar: "اما", w: ["w:imma"], g: { en: "either", ur: "یا تو" } },
    { ar: "شاكرا", w: ["w:shakir"], g: { en: "grateful", ur: "شکر گزار" } },
    { ar: "واما", w: ["w:wa", "w:imma"], g: { en: "or", ur: "اور یا" } },
    { ar: "كفورا", given: true, pic: "🚫🙏", art: "w:kafara", g: { en: "ungrateful", ur: "ناشکرا" } },
  ],
  "75:31": [
    { ar: "فلا", w: ["w:fa", "w:la"], g: { en: "But he did not", ur: "پس نہ" } },
    { ar: "صدق", w: ["w:saddaqa"], g: { en: "believe", ur: "اس نے تصدیق کی" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "and did not", ur: "اور نہ" } },
    { ar: "صلى", given: true, pic: "🧎", art: "w:salah", g: { en: "pray", ur: "نماز پڑھی" } },
  ],
  "3:54": [
    { ar: "ومكروا", w: ["w:wa", "w:makara"], g: { en: "And they plotted", ur: "اور انہوں نے چال چلی" } },
    { ar: "ومكر", w: ["w:wa", "w:makara"], g: { en: "and … planned", ur: "اور تدبیر کی" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ نے" } },
    { ar: "والله", w: ["w:wa", "w:allah"], g: { en: "And Allah is", ur: "اور اللہ" } },
    { ar: "خير", w: ["w:khayr"], g: { en: "the best", ur: "سب سے بہتر ہے" } },
    { ar: "المكرين", given: true, pic: "🧩", art: "w:makir", g: { en: "of planners", ur: "تدبیر کرنے والوں میں" } },
  ],

  // ---- Wing 3 · Passive Flip ----
  "88:17": [
    { ar: "افلا", w: ["w:a", "w:fa", "w:la"], g: { en: "Do they not then", ur: "کیا پھر وہ نہیں" } },
    { ar: "ينظرون", w: ["w:nazara"], g: { en: "look", ur: "دیکھتے" } },
    { ar: "الى", w: ["w:ila"], g: { en: "at", ur: "کی طرف" } },
    { ar: "الابل", given: true, pic: "🐪", art: "g:camels", g: { en: "the camels", ur: "اونٹوں" } },
    { ar: "كيف", w: ["w:kayfa"], g: { en: "how", ur: "کیسے" } },
    { ar: "خلقت", w: ["w:khuliqa"], g: { en: "they were created", ur: "پیدا کیے گئے" }, pieces: [p("خُلِقَ", "was created", "پیدا کیا گیا"), p("ـتْ", "she / they (things)", "وہ")] },
  ],
  "88:18": [
    { ar: "والى", w: ["w:wa", "w:ila"], g: { en: "and at", ur: "اور کی طرف" } },
    { ar: "السماء", w: ["w:al", "w:sama"], g: { en: "the sky", ur: "آسمان" } },
    { ar: "كيف", w: ["w:kayfa"], g: { en: "how", ur: "کیسے" } },
    { ar: "رفعت", w: ["w:rufia"], g: { en: "it was raised", ur: "بلند کیا گیا" } },
  ],
  "81:9": [
    { ar: "باي", w: ["w:bi", "w:ayyu"], g: { en: "For which", ur: "کس" } },
    { ar: "ذنب", w: ["w:dhanb"], g: { en: "sin", ur: "گناہ پر" } },
    { ar: "قتلت", w: ["w:qutila"], g: { en: "was she killed?", ur: "وہ ماری گئی؟" } },
  ],
  "23:79": [
    { ar: "وهو", w: ["w:wa", "w:huwa"], g: { en: "And He", ur: "اور وہی" } },
    { ar: "الذي", w: ["w:alladhi"], g: { en: "is the One who", ur: "ہے جس نے" } },
    { ar: "ذراكم", given: true, pic: "🌍", art: "w:dharaa", g: { en: "spread you out", ur: "تمہیں پھیلایا" } },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "الارض", w: ["w:al", "w:ard"], g: { en: "the earth", ur: "زمین" } },
    { ar: "واليه", w: ["w:wa", "w:ila", "w:hu"], g: { en: "and to Him", ur: "اور اسی کی طرف" } },
    { ar: "تحشرون", w: ["w:tuhsharun"], g: { en: "you will be gathered", ur: "تم اکٹھے کیے جاؤ گے" } },
  ],

  // ---- Wing 3 · Doing Words 4 ----
  "56:10": [
    { ar: "والسبقون", w: ["w:wa", "w:al", "w:sabiq"], g: { en: "And the foremost", ur: "اور آگے بڑھنے والے" }, pieces: [p("وَ", "and", "اور"), p("الْ", "the", "وہی"), p("سَابِق", "one who is first", "آگے والا"), p("ـُونَ", "many", "بہت سے")] },
    { ar: "السبقون", w: ["w:al", "w:sabiq"], g: { en: "are the foremost", ur: "آگے ہی ہیں" } },
  ],
  "74:7": [
    { ar: "ولربك", w: ["w:wa", "w:li", "w:rabb", "w:ka"], g: { en: "And for your Lord", ur: "اور اپنے رب کے لیے" } },
    { ar: "فاصبر", w: ["w:fa", "w:sabara"], g: { en: "be patient", ur: "صبر کرو" }, pieces: [p("فَ", "so", "تو"), p("اصْبِرْ", "be patient!", "صبر کرو")] },
  ],
  "37:138": [
    { ar: "وباليل", w: ["w:wa", "w:bi", "w:al", "w:layl"], g: { en: "and by night", ur: "اور رات کو" } },
    { ar: "افلا", w: ["w:a", "w:fa", "w:la"], g: { en: "Will you not then", ur: "کیا پھر تم نہیں" } },
    { ar: "تعقلون", w: ["w:aqala"], g: { en: "use your reason?", ur: "عقل سے کام لیتے؟" }, pieces: [p("تَـ", "you (now)", "تم"), p("عْقِلُ", "use reason", "سمجھنا"), p("ـُونَ", "all of you", "تم سب")] },
  ],
  "37:63": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم نے" } },
    { ar: "جعلنها", w: ["w:jaala", "w:na", "w:ha"], g: { en: "made it", ur: "اسے بنایا" } },
    { ar: "فتنة", w: ["w:fitna"], g: { en: "a trial", ur: "آزمائش" } },
    { ar: "للظلمين", w: ["w:li", "w:al", "w:zalim"], g: { en: "for the wrongdoers", ur: "ظالموں کے لیے" } },
  ],
  "56:2": [
    { ar: "ليس", w: ["w:laysa"], g: { en: "There is not", ur: "نہیں ہے" } },
    { ar: "لوقعتها", given: true, pic: "💥", art: "w:waqi", g: { en: "about its happening", ur: "اس کے واقع ہونے کو" } },
    { ar: "كاذبة", w: ["w:kadhib"], note: "كَاذِبَة: no one (no soul) calling it a lie", g: { en: "any denying (it is a lie)", ur: "کوئی جھٹلانے والا" } },
  ],

  // ---- Wing 3 · Doing Words 5 ----
  "37:41": [
    { ar: "اولئك", w: ["w:ulaika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "Those", ur: "یہی لوگ" } },
    { ar: "لهم", w: ["w:li", "w:hum"], g: { en: "will have", ur: "ان کے لیے" } },
    { ar: "رزق", w: ["w:rizq"], g: { en: "a provision", ur: "رزق ہے" } },
    { ar: "معلوم", w: ["w:malum"], g: { en: "well-known", ur: "معلوم" } },
  ],
  "37:61": [
    { ar: "لمثل", w: ["w:li", "w:mithl"], g: { en: "For the like of", ur: "ایسی ہی" } },
    { ar: "هذا", w: ["w:hadha"], g: { en: "this", ur: "اس" } },
    { ar: "فليعمل", w: ["w:fa", "w:li_let", "w:amila"], g: { en: "so let … work", ur: "تو چاہیے کہ عمل کریں" }, pieces: [p("فَ", "so", "تو"), p("لْ", "let", "چاہیے"), p("يَعْمَلِ", "work", "عمل کرے")] },
    { ar: "العملون", w: ["w:al", "w:amil"], g: { en: "the workers", ur: "عمل کرنے والے" } },
  ],
  "82:10": [
    { ar: "وان", w: ["w:wa", "w:inna"], g: { en: "And indeed", ur: "اور بے شک" } },
    { ar: "عليكم", w: ["w:ala", "w:kum"], g: { en: "over you", ur: "تم پر" } },
    { ar: "لحفظين", w: ["w:la_surely", "w:haafiz"], g: { en: "are guardians", ur: "نگہبان ہیں" } },
  ],
  "37:144": [
    { ar: "للبث", w: ["w:la_surely", "w:labitha"], g: { en: "he would have stayed", ur: "تو وہ ضرور رہتا" } },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "بطنه", w: ["w:batn", "w:hu"], g: { en: "its belly", ur: "اس کے پیٹ" } },
    { ar: "الى", w: ["w:ila"], note: "إِلَى with a time: until", g: { en: "until", ur: "تک" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "the Day", ur: "اس دن" } },
    { ar: "يبعثون", w: ["w:yubathun"], g: { en: "they are raised up", ur: "جب وہ اٹھائے جائیں گے" } },
  ],
  "103:2": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الانسن", w: ["w:al", "w:insan"], g: { en: "the human being", ur: "انسان" } },
    { ar: "لفي", w: ["w:la_surely", "w:fi"], g: { en: "is surely in", ur: "ضرور میں ہے" } },
    { ar: "خسر", w: ["w:khusr"], g: { en: "loss", ur: "خسارے" } },
  ],
  "88:11": [
    { ar: "لا", w: ["w:la"], g: { en: "Not", ur: "نہیں" } },
    { ar: "تسمع", w: ["w:samia"], g: { en: "will you hear", ur: "تو سنے گا" } },
    { ar: "فيها", w: ["w:fi", "w:ha"], g: { en: "in it", ur: "اس میں" } },
    { ar: "لغية", given: true, pic: "🔇", art: "g:idletalk", g: { en: "any idle talk", ur: "کوئی بے ہودہ بات" } },
  ],

  // ---- Wing 3 · Review Hall 3: Family Garden ----
  "20:17": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And what is", ur: "اور کیا ہے" } },
    { ar: "تلك", w: ["w:tilka"], g: { en: "that", ur: "وہ" } },
    { ar: "بيمينك", w: ["w:bi", "w:yamin", "w:ka"], g: { en: "in your right hand", ur: "تمہارے دائیں ہاتھ میں" }, pieces: [p("بِ", "in, with", "میں"), p("يَمِين", "right hand", "دایاں ہاتھ"), p("ـكَ", "your", "تمہارے")] },
    { ar: "يموسى", w: ["w:ya", "w:musa"], g: { en: "O Musa?", ur: "اے موسیٰ؟" }, pieces: [p("يَا", "O!", "اے"), p("مُوسَى", "Musa", "موسیٰ")] },
  ],
  "37:172": [
    { ar: "انهم", w: ["w:inna", "w:hum"], g: { en: "Indeed they", ur: "بے شک وہی" } },
    { ar: "لهم", w: ["w:la_surely", "w:humu"], g: { en: "surely they", ur: "یقیناً وہ" }, pieces: [p("لَ", "surely", "یقیناً"), p("هُمُ", "they", "وہ (سب)")] },
    { ar: "المنصورون", w: ["w:al", "w:mansur"], g: { en: "are the ones helped", ur: "مدد کیے جانے والے ہیں" } },
  ],
  "50:34": [
    { ar: "ادخلوها", w: ["w:dakhala", "w:ha"], g: { en: "Enter it", ur: "اس میں داخل ہو جاؤ" }, pieces: [p("ادْخُلُو", "go in! (all of you)", "داخل ہو جاؤ"), p("ـهَا", "it", "اس میں")] },
    { ar: "بسلم", w: ["w:bi", "w:salam"], g: { en: "in peace", ur: "سلامتی کے ساتھ" } },
    { ar: "ذلك", w: ["w:dhalika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "That is", ur: "یہ ہے" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "the Day", ur: "دن" } },
    { ar: "الخلود", w: ["w:al", "w:khulud"], g: { en: "of lasting forever", ur: "ہمیشگی کا" } },
  ],
  "80:18": [
    { ar: "من", w: ["w:min"], g: { en: "From", ur: "سے" } },
    { ar: "اي", w: ["w:ayyu"], note: "أَيّ before a noun: which / what (thing)", g: { en: "what", ur: "کس" } },
    { ar: "شيء", w: ["w:shay"], g: { en: "thing", ur: "چیز" } },
    { ar: "خلقه", w: ["w:khalaqa", "w:hu"], g: { en: "did He create him?", ur: "اسے پیدا کیا؟" } },
  ],
  "104:3": [
    { ar: "يحسب", w: ["w:hasiba"], g: { en: "He thinks", ur: "وہ سمجھتا ہے" } },
    { ar: "ان", w: ["w:anna_that"], g: { en: "that", ur: "کہ" } },
    { ar: "ماله", w: ["w:mal", "w:hu"], g: { en: "his wealth", ur: "اس کا مال" } },
    { ar: "اخلده", w: ["w:akhlada", "w:hu"], g: { en: "will make him last forever", ur: "اسے ہمیشہ رکھے گا" } },
  ],

  // ---- Wing 3 · Review Hall 4: Family Orchard ----
  "51:21": [
    { ar: "وفي", w: ["w:wa", "w:fi"], g: { en: "And in", ur: "اور میں" } },
    { ar: "انفسكم", w: ["w:nafs", "w:kum"], g: { en: "your own selves", ur: "تمہاری اپنی جانوں" } },
    { ar: "افلا", w: ["w:a", "w:fa", "w:la"], g: { en: "Will you not then", ur: "کیا پھر تم نہیں" } },
    { ar: "تبصرون", w: ["w:absara"], g: { en: "see?", ur: "دیکھتے؟" } },
  ],
  "85:3": [
    { ar: "وشاهد", w: ["w:wa", "w:shaahid"], g: { en: "And by the witness", ur: "اور گواہی دینے والے کی" } },
    { ar: "ومشهود", w: ["w:wa", "w:mashhud"], g: { en: "and what is witnessed", ur: "اور جس کی گواہی دی گئی" } },
  ],
  "86:11": [
    { ar: "والسماء", w: ["w:wa_oath", "w:al", "w:sama"], g: { en: "By the sky", ur: "قسم ہے آسمان کی" } },
    { ar: "ذات", w: ["w:dhu"], g: { en: "with", ur: "والے" } },
    { ar: "الرجع", w: ["w:al", "w:raj"], g: { en: "the returning (rain)", ur: "بار بار برسنے" } },
  ],
  "69:39": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and what", ur: "اور جو" } },
    { ar: "لا", w: ["w:la"], g: { en: "not", ur: "نہیں" } },
    { ar: "تبصرون", w: ["w:absara"], g: { en: "you see", ur: "تم دیکھتے" } },
  ],

  // ---- Wing 3 · Person Wheel 2 ----
  "37:118": [
    { ar: "وهدينهما", w: ["w:wa", "w:ihdi", "w:na", "w:huma_end"], g: { en: "And We guided them both", ur: "اور ہم نے ان دونوں کو دکھایا" }, pieces: [p("وَ", "and", "اور"), p("هَدَيْ", "guide (did)", "راہ دکھائی"), p("ـنَا", "we", "ہم نے"), p("ـهُمَا", "them two", "ان دونوں کو")] },
    { ar: "الصرط", w: ["w:al", "w:sirat"], g: { en: "to the path", ur: "راستہ" } },
    { ar: "المستقيم", w: ["w:al", "w:mustaqim"], g: { en: "the straight", ur: "سیدھا" } },
  ],
  "37:119": [
    { ar: "وتركنا", w: ["w:wa", "w:taraka", "w:na"], g: { en: "And We left", ur: "اور ہم نے چھوڑا" } },
    { ar: "عليهما", w: ["w:ala", "w:huma_end"], note: "عَلَى with تَرَكْنَا: (We left) for them both", g: { en: "for them both", ur: "ان دونوں کے لیے" } },
    { ar: "في", w: ["w:fi"], g: { en: "among", ur: "میں" } },
    { ar: "الاخرين", w: ["w:al", "w:akhir"], note: "آخِر in the plural: the later people", g: { en: "the later people", ur: "بعد والوں" } },
  ],
  "55:13": [
    { ar: "فباي", w: ["w:fa", "w:bi", "w:ayyu"], g: { en: "So which", ur: "تو کون کون سی" } },
    { ar: "الاء", w: ["w:alaa"], g: { en: "of the favours", ur: "نعمتوں کو" } },
    { ar: "ربكما", w: ["w:rabb", "w:kuma"], g: { en: "of your Lord (you two)", ur: "تم دونوں کے رب کی" }, pieces: [p("رَبِّ", "Lord", "رب"), p("ـكُمَا", "your (two)", "تم دونوں کا")] },
    { ar: "تكذبان", w: ["w:kadhdhaba", "w:kuma"], g: { en: "will you two deny?", ur: "تم دونوں جھٹلاؤ گے؟" }, pieces: [p("تُـ", "you (now / later)", "تم"), p("كَذِّبُ", "deny", "جھٹلانا"), p("ـَانِ", "you two", "تم دونوں")] },
  ],
  "71:16": [
    { ar: "وجعل", w: ["w:wa", "w:jaala"], g: { en: "And He made", ur: "اور بنایا" } },
    { ar: "القمر", w: ["w:al", "w:qamar"], g: { en: "the moon", ur: "چاند کو" } },
    { ar: "فيهن", w: ["w:fi", "w:hunna_end"], g: { en: "within them", ur: "ان میں" }, pieces: [p("فِي", "in", "میں"), p("ـهِنَّ", "them (many, feminine)", "ان (سب)")] },
    { ar: "نورا", w: ["w:nur"], g: { en: "a light", ur: "روشنی" } },
    { ar: "وجعل", w: ["w:wa", "w:jaala"], g: { en: "and He made", ur: "اور بنایا" } },
    { ar: "الشمس", w: ["w:al", "w:shams"], g: { en: "the sun", ur: "سورج کو" } },
    { ar: "سراجا", given: true, pic: "🪔", art: "g:siraj", g: { en: "a lamp", ur: "چراغ" } },
  ],
  "89:29": [
    { ar: "فادخلي", w: ["w:fa", "w:dakhala", "w:ki"], g: { en: "So enter", ur: "تو داخل ہو جا" }, pieces: [p("فَ", "so", "تو"), p("ادْخُلِ", "go in!", "داخل ہو"), p("ـِي", "you (one, feminine)", "تو")] },
    { ar: "في", w: ["w:fi"], g: { en: "among", ur: "میں" } },
    { ar: "عبدي", w: ["w:abd", "w:i"], g: { en: "My servants", ur: "میرے بندوں" } },
  ],
  "89:30": [
    { ar: "وادخلي", w: ["w:wa", "w:dakhala", "w:ki"], g: { en: "and enter", ur: "اور داخل ہو جا" } },
    { ar: "جنتي", w: ["w:jannah", "w:i"], g: { en: "My Paradise", ur: "میری جنت میں" } },
  ],

  // ---- Wing 4 · Soft Letters 1 ----
  "37:100": [
    { ar: "رب", w: ["w:rabb", "w:i"], g: { en: "My Lord", ur: "اے میرے رب" } },
    { ar: "هب", w: ["w:wahaba"], g: { en: "give (as a gift)", ur: "عطا فرما" }, pieces: [p("هَبْ", "give! (the و has dropped out of وَهَبَ)", "عطا کر (وَهَبَ کا و گر گیا)")] },
    { ar: "لي", w: ["w:li", "w:i"], g: { en: "me", ur: "مجھے" } },
    { ar: "من", w: ["w:min"], g: { en: "one of", ur: "میں سے" } },
    { ar: "الصلحين", w: ["w:al", "w:salih"], g: { en: "the righteous", ur: "نیک لوگوں" } },
  ],
  "51:5": [
    { ar: "انما", w: ["w:inna", "w:ma"], g: { en: "Indeed what", ur: "بے شک جس کا" } },
    { ar: "توعدون", w: ["w:waada"], g: { en: "you are promised", ur: "تم سے وعدہ کیا جاتا ہے" }, pieces: [p("تُو", "you … are (passive)", "تم سے … کیا جاتا ہے"), p("عَدُ", "promise", "وعدہ"), p("ـُونَ", "all of you", "تم سب")] },
    { ar: "لصادق", w: ["w:la_surely", "w:sadiq"], note: "صَادِق said of a promise: true", g: { en: "is surely true", ur: "ضرور سچ ہے" } },
  ],
  "51:6": [
    { ar: "وان", w: ["w:wa", "w:inna"], g: { en: "And indeed", ur: "اور بے شک" } },
    { ar: "الدين", w: ["w:al", "w:din"], g: { en: "the Judgement", ur: "انصاف (کا دن)" } },
    { ar: "لوقع", w: ["w:la_surely", "w:waqi"], g: { en: "will surely happen", ur: "ضرور واقع ہونے والا ہے" } },
  ],
  "52:7": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "عذاب", w: ["w:azab"], g: { en: "the punishment", ur: "عذاب" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "of your Lord", ur: "تمہارے رب کا" } },
    { ar: "لوقع", w: ["w:la_surely", "w:waqi"], g: { en: "will surely happen", ur: "ضرور واقع ہونے والا ہے" } },
  ],

  // ---- Wing 4 · Soft Letters 2 ----
  "15:93": [
    { ar: "عما", w: ["w:an", "w:ma"], g: { en: "about what", ur: "اس کے بارے میں جو" } },
    { ar: "كانوا", w: ["w:kana"], g: { en: "they used to", ur: "وہ کیا کرتے تھے" }, pieces: [p("كَانُ", "was (to be)", "تھا"), p("ـوا", "they all", "وہ سب")] },
    { ar: "يعملون", w: ["w:amila"], g: { en: "do", ur: "عمل" } },
  ],
  "20:35": [
    { ar: "انك", w: ["w:inna", "w:ka"], g: { en: "Indeed You", ur: "بے شک تو" } },
    { ar: "كنت", w: ["w:kana"], g: { en: "have always been", ur: "ہمیشہ سے ہے" }, pieces: [p("كُنْ", "was (the middle ا has dropped)", "تھا (درمیانی ا گر گیا)"), p("ـتَ", "you", "تو")] },
    { ar: "بنا", w: ["w:bi", "w:na"], g: { en: "of us", ur: "ہمیں" } },
    { ar: "بصيرا", w: ["w:basir"], g: { en: "All-Seeing", ur: "خوب دیکھنے والا" } },
  ],
  "54:16": [
    { ar: "فكيف", w: ["w:fa", "w:kayfa"], g: { en: "So how", ur: "تو کیسا" } },
    { ar: "كان", w: ["w:kana"], g: { en: "was", ur: "تھا" } },
    { ar: "عذابي", w: ["w:azab", "w:i"], g: { en: "My punishment", ur: "میرا عذاب" } },
    { ar: "ونذر", w: ["w:wa", "w:nadhir"], g: { en: "and My warnings?", ur: "اور میرا ڈرانا؟" } },
  ],
  "70:33": [
    { ar: "والذين", w: ["w:wa", "w:alladhina"], g: { en: "And those who", ur: "اور وہ جو" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "بشهدتهم", w: ["w:bi", "w:shahada", "w:hum"], g: { en: "in their testimonies", ur: "اپنی گواہیوں پر" } },
    { ar: "قائمون", w: ["w:qaim"], g: { en: "stand firm", ur: "قائم رہتے ہیں" } },
  ],

  // ---- Wing 4 · Soft Letters 3 ----
  "20:9": [
    { ar: "وهل", w: ["w:wa", "w:hal"], g: { en: "And has", ur: "اور کیا" } },
    { ar: "اتىك", w: ["w:ata", "w:ka"], g: { en: "come to you", ur: "تمہارے پاس آئی" }, pieces: [p("أَتَى", "come (did)", "آیا"), p("ـكَ", "you", "تمہارے")] },
    { ar: "حديث", w: ["w:hadith"], g: { en: "the story", ur: "خبر" } },
    { ar: "موسى", w: ["w:musa"], g: { en: "of Musa?", ur: "موسیٰ کی؟" } },
  ],
  "26:69": [
    { ar: "واتل", w: ["w:wa", "w:tala"], g: { en: "And recite", ur: "اور سناؤ" }, pieces: [p("وَ", "and", "اور"), p("اتْلُ", "recite! (the last letter has dropped)", "تلاوت کرو (آخری حرف گر گیا)")] },
    { ar: "عليهم", w: ["w:ala", "w:hum"], note: "عَلَى with اُتْلُ: (recite) to them", g: { en: "to them", ur: "انہیں" } },
    { ar: "نبا", w: ["w:naba"], g: { en: "the news", ur: "خبر" } },
    { ar: "ابرهيم", w: ["w:ibrahim"], g: { en: "of Ibrahim", ur: "ابراہیم کی" } },
  ],
  "23:73": [
    { ar: "وانك", w: ["w:wa", "w:inna", "w:ka"], g: { en: "And indeed you", ur: "اور بے شک تم" } },
    { ar: "لتدعوهم", w: ["w:la_surely", "w:daa", "w:hum"], g: { en: "surely call them", ur: "ضرور انہیں بلاتے ہو" }, pieces: [p("لَ", "surely", "ضرور"), p("تَدْعُو", "you call", "تم بلاتے ہو"), p("ـهُمْ", "them", "انہیں")] },
    { ar: "الى", w: ["w:ila"], g: { en: "to", ur: "کی طرف" } },
    { ar: "صرط", w: ["w:sirat"], g: { en: "a path", ur: "راستے" } },
    { ar: "مستقيم", w: ["w:mustaqim"], g: { en: "straight", ur: "سیدھے" } },
  ],
  "15:64": [
    { ar: "واتينك", w: ["w:wa", "w:ata", "w:na", "w:ka"], g: { en: "And we have come to you", ur: "اور ہم تمہارے پاس آئے ہیں" } },
    { ar: "بالحق", w: ["w:bi", "w:al", "w:haqq"], g: { en: "with the truth", ur: "حق کے ساتھ" } },
    { ar: "وانا", w: ["w:wa", "w:inna", "w:na"], g: { en: "and indeed we", ur: "اور بے شک ہم" } },
    { ar: "لصدقون", w: ["w:la_surely", "w:sadiq"], g: { en: "are truthful", ur: "سچے ہیں" } },
  ],
  "26:218": [
    { ar: "الذي", w: ["w:alladhi"], g: { en: "The One who", ur: "جو" } },
    { ar: "يرىك", w: ["w:raa", "w:ka"], g: { en: "sees you", ur: "تمہیں دیکھتا ہے" }, pieces: [p("يَرَى", "sees (the ء of رَأَى has dropped)", "دیکھتا ہے (رَأَى کا ء گر گیا)"), p("ـكَ", "you", "تمہیں")] },
    { ar: "حين", w: ["w:hina"], g: { en: "when", ur: "جب" } },
    { ar: "تقوم", w: ["w:qama"], g: { en: "you stand", ur: "تم کھڑے ہوتے ہو" } },
  ],

  // ---- Wing 4 · Doubled Letters ----
  "56:30": [
    { ar: "وظل", w: ["w:wa", "w:zill"], g: { en: "And shade", ur: "اور سایہ" } },
    { ar: "ممدود", w: ["w:mamdud"], g: { en: "spread wide", ur: "پھیلا ہوا" } },
  ],
  "82:6": [
    { ar: "يايها", w: ["w:ya", "w:ayyu"], art: "w:ya", note: "يَا أَيُّهَا is one call, 'O'; أَيّ is not a question here", g: { en: "O", ur: "اے" } },
    { ar: "الانسن", w: ["w:al", "w:insan"], g: { en: "human being", ur: "انسان" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "کس چیز نے" } },
    { ar: "غرك", w: ["w:gharra", "w:ka"], g: { en: "has deceived you", ur: "تجھے دھوکے میں ڈالا" }, pieces: [p("غَرَّ", "deceive (did) — رّ is the doubled letter", "دھوکا دیا — رّ دوہرا حرف"), p("ـكَ", "you", "تجھے")] },
    { ar: "بربك", w: ["w:bi", "w:rabb", "w:ka"], g: { en: "about your Lord", ur: "اپنے رب کے بارے میں" } },
    { ar: "الكريم", w: ["w:al", "w:karim"], g: { en: "the Most Generous", ur: "جو کریم ہے" } },
  ],
  "84:3": [
    { ar: "واذا", w: ["w:wa", "w:idha"], g: { en: "And when", ur: "اور جب" } },
    { ar: "الارض", w: ["w:al", "w:ard"], g: { en: "the earth", ur: "زمین" } },
    { ar: "مدت", w: ["w:madda"], g: { en: "is stretched out", ur: "پھیلا دی جائے گی" }, pieces: [p("مُدَّ", "was stretched (passive)", "پھیلائی گئی"), p("ـتْ", "she (the earth)", "وہ")] },
  ],
  "74:12": [
    { ar: "وجعلت", w: ["w:wa", "w:jaala", "w:i"], note: "جَعَلَ لَهُ: made for him, gave him", g: { en: "And I gave", ur: "اور میں نے دیا" } },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "him", ur: "اسے" } },
    { ar: "مالا", w: ["w:mal"], g: { en: "wealth", ur: "مال" } },
    { ar: "ممدودا", w: ["w:mamdud"], g: { en: "spread wide", ur: "بہت سا" } },
  ],
  "26:99": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And no one", ur: "اور نہیں" } },
    { ar: "اضلنا", w: ["w:adalla", "w:na"], g: { en: "led us astray", ur: "ہمیں گمراہ کیا" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "المجرمون", w: ["w:al", "w:mujrim"], g: { en: "the criminals", ur: "مجرموں نے" } },
  ],

  // ---- Wing 4 · Hamza Verbs ----
  "15:46": [
    { ar: "ادخلوها", w: ["w:dakhala", "w:ha"], g: { en: "Enter it", ur: "اس میں داخل ہو جاؤ" } },
    { ar: "بسلم", w: ["w:bi", "w:salam"], g: { en: "in peace", ur: "سلامتی کے ساتھ" } },
    { ar: "امنين", w: ["w:amin_safe"], g: { en: "safe", ur: "امن والے بن کر" } },
  ],
  "36:25": [
    { ar: "اني", w: ["w:inna", "w:i"], g: { en: "Indeed I", ur: "بے شک میں" } },
    { ar: "امنت", w: ["w:amana", "w:i"], g: { en: "have believed", ur: "ایمان لایا" }, pieces: [p("آمَنْ", "believe (did) — آ is two hamzas joined", "ایمان لایا — آ میں دو ہمزے"), p("ـتُ", "I", "میں")] },
    { ar: "بربكم", w: ["w:bi", "w:rabb", "w:kum"], g: { en: "in your Lord", ur: "تمہارے رب پر" } },
    { ar: "فاسمعون", w: ["w:fa", "w:samia", "w:i"], note: "سَمِعَ as a command: listen (to me)", g: { en: "so listen to me", ur: "تو میری سنو" } },
  ],
  "37:111": [
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed he", ur: "بے شک وہ" } },
    { ar: "من", w: ["w:min"], g: { en: "was one of", ur: "میں سے تھا" } },
    { ar: "عبادنا", w: ["w:abd", "w:na"], g: { en: "Our servants", ur: "ہمارے بندوں" } },
    { ar: "المؤمنين", w: ["w:al", "w:mumin"], g: { en: "the believing", ur: "ایمان والے" } },
  ],
  "21:23": [
    { ar: "لا", w: ["w:la"], g: { en: "Not", ur: "نہیں" } },
    { ar: "يسل", w: ["w:saala"], g: { en: "is He asked", ur: "اس سے پوچھا جاتا" }, pieces: [p("يُسْأَلُ", "is asked (passive)", "پوچھا جاتا ہے")] },
    { ar: "عما", w: ["w:an", "w:ma"], g: { en: "about what", ur: "اس کے بارے میں جو" } },
    { ar: "يفعل", w: ["w:faala"], g: { en: "He does", ur: "وہ کرتا ہے" } },
    { ar: "وهم", w: ["w:wa", "w:humu"], g: { en: "but they", ur: "اور ان سے" } },
    { ar: "يسلون", w: ["w:saala"], g: { en: "will be asked", ur: "پوچھا جائے گا" } },
  ],
  // ---- Wing 5 · Strong Middle 1 ----
  "96:4": [
    { ar: "الذي", w: ["w:alladhi"], g: { en: "The One who", ur: "جس نے" } },
    { ar: "علم", w: ["w:allama"], g: { en: "taught", ur: "سکھایا" }, pieces: [p("عَلَّمَ", "teach (did) — عَلِمَ know + the doubled لّ: make someone know", "سکھایا — عَلِمَ جانا + دوہرا لّ: کسی کو جاننے والا بنانا")] },
    { ar: "بالقلم", given: true, pic: "✒️", art: "ui:qalam", g: { en: "by the pen", ur: "قلم کے ذریعے" } },
  ],
  "55:2": [
    { ar: "علم", w: ["w:allama"], g: { en: "He taught", ur: "اس نے سکھایا" } },
    { ar: "القران", w: ["w:al", "w:quran"], g: { en: "the Qur'an", ur: "قرآن" } },
  ],
  "88:21": [
    { ar: "فذكر", w: ["w:fa", "w:dhakkara"], g: { en: "So remind!", ur: "تو نصیحت کیجیے" }, pieces: [p("فَ", "so", "تو"), p("ذَكِّرْ", "remind! — ذَكَرَ remember + the doubled كّ", "یاد دلاؤ — ذَكَرَ یاد کرنا + دوہرا كّ")] },
    { ar: "انما", w: ["w:inna", "w:ma"], note: "إِنَّمَا (إِنَّ + مَا) means 'only'", g: { en: "you are only", ur: "بس" } },
    { ar: "انت", w: ["w:anta"], g: { en: "you", ur: "آپ" } },
    { ar: "مذكر", w: ["w:mudhakkir"], g: { en: "one who reminds", ur: "نصیحت کرنے والے ہیں" } },
  ],
  "37:13": [
    { ar: "واذا", w: ["w:wa", "w:idha"], g: { en: "And when", ur: "اور جب" } },
    { ar: "ذكروا", w: ["w:dhukkira", "w:hum"], g: { en: "they are reminded", ur: "انہیں یاد دلایا جائے" }, pieces: [p("ذُكِّرُ", "was reminded — the u-i sound flips it (passive)", "یاد دلایا گیا — اُ اِ کی آواز (مجہول)"), p("ـوا", "they", "وہ")] },
    { ar: "لا", w: ["w:la"], g: { en: "not", ur: "نہیں" } },
    { ar: "يذكرون", w: ["w:dhakara", "w:hum"], g: { en: "do they remember", ur: "وہ یاد کرتے" } },
  ],
  "87:1": [
    { ar: "سبح", w: ["w:sabbaha"], g: { en: "Glorify", ur: "تسبیح کیجیے" } },
    { ar: "اسم", w: ["w:ism"], g: { en: "the name", ur: "نام کی" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "of your Lord", ur: "اپنے رب کے" } },
    { ar: "الاعلى", w: ["w:al", "w:ala_more"], g: { en: "the Most High", ur: "جو سب سے بلند ہے" } },
  ],
  "74:4": [
    { ar: "وثيابك", given: true, pic: "👕", art: "g:clothes", g: { en: "And your clothes", ur: "اور اپنے کپڑے" } },
    { ar: "فطهر", w: ["w:fa", "w:tahhara"], g: { en: "make clean!", ur: "پاک رکھیے" } },
  ],
  "84:24": [
    { ar: "فبشرهم", w: ["w:fa", "w:bashshara", "w:hum"], g: { en: "So give them news", ur: "تو انہیں خبر دے دیجیے" } },
    { ar: "بعذاب", w: ["w:bi", "w:azab"], g: { en: "of a punishment", ur: "عذاب کی" } },
    { ar: "اليم", w: ["w:alim_pain"], g: { en: "painful", ur: "دردناک" } },
  ],

  // ---- Wing 5 · Strong Middle 2 ----
  "87:3": [
    { ar: "والذي", w: ["w:wa", "w:alladhi"], g: { en: "And the One who", ur: "اور جس نے" } },
    { ar: "قدر", w: ["w:qaddara"], g: { en: "set the measure", ur: "اندازہ مقرر کیا" } },
    { ar: "فهدى", w: ["w:fa", "w:ihdi"], g: { en: "then guided", ur: "پھر راہ دکھائی" } },
  ],
  "89:24": [
    { ar: "يقول", w: ["w:qala"], g: { en: "He will say", ur: "وہ کہے گا" } },
    { ar: "يليتني", w: ["w:ya", "w:layta", "w:i"], g: { en: "Oh, if only I", ur: "اے کاش میں نے" } },
    { ar: "قدمت", w: ["w:qaddama", "w:i"], g: { en: "had sent ahead", ur: "آگے بھیجا ہوتا" } },
    { ar: "لحياتي", w: ["w:li", "w:hayat", "w:i"], g: { en: "for my life", ur: "اپنی زندگی کے لیے" } },
  ],
  "83:10": [
    { ar: "ويل", w: ["w:wayl"], g: { en: "Woe", ur: "تباہی ہے" } },
    { ar: "يومئذ", w: ["w:yawm", "w:idh"], g: { en: "on that Day", ur: "اس دن" } },
    { ar: "للمكذبين", w: ["w:li", "w:al", "w:mukadhdhib"], g: { en: "to the deniers", ur: "جھٹلانے والوں کے لیے" } },
  ],
  "15:9": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم" } },
    { ar: "نحن", w: ["w:nahnu"], g: { en: "it is We who", ur: "ہم ہی نے" } },
    { ar: "نزلنا", w: ["w:nazzala", "w:na"], g: { en: "sent down", ur: "اتارا" } },
    { ar: "الذكر", w: ["w:al", "w:dhikr"], g: { en: "the Reminder", ur: "یہ نصیحت (قرآن)" } },
    { ar: "وانا", w: ["w:wa", "w:inna", "w:na"], g: { en: "and indeed We", ur: "اور بے شک ہم" } },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "over it", ur: "اس کے" } },
    { ar: "لحفظون", w: ["w:la_surely", "w:haafiz"], g: { en: "are surely guardians", ur: "ضرور نگہبان ہیں" } },
  ],
  "26:192": [
    { ar: "وانه", w: ["w:wa", "w:inna", "w:hu"], g: { en: "And indeed it", ur: "اور بے شک یہ" } },
    { ar: "لتنزيل", w: ["w:la_surely", "w:tanzil"], g: { en: "is surely sent down", ur: "ضرور اتارا ہوا ہے" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "by the Lord", ur: "رب کا" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "of the worlds", ur: "تمام جہانوں کے" } },
  ],
  "37:148": [
    { ar: "فامنوا", w: ["w:fa", "w:amana", "w:hum"], g: { en: "Then they believed", ur: "پھر وہ ایمان لائے" } },
    { ar: "فمتعنهم", w: ["w:fa", "w:mattaa", "w:na", "w:hum"], g: { en: "so We let them enjoy (life)", ur: "تو ہم نے انہیں فائدہ اٹھانے دیا" } },
    { ar: "الى", w: ["w:ila"], note: "إِلَى with a time: until", g: { en: "until", ur: "تک" } },
    { ar: "حين", w: ["w:hina"], g: { en: "a time", ur: "ایک مدت" } },
  ],
  "26:170": [
    { ar: "فنجينه", w: ["w:fa", "w:najja", "w:na", "w:hu"], g: { en: "So We saved him", ur: "تو ہم نے اسے بچا لیا" } },
    { ar: "واهله", w: ["w:wa", "w:ahl", "w:hu"], g: { en: "and his family", ur: "اور اس کے گھر والوں کو" } },
    { ar: "اجمعين", w: ["w:ajma"], g: { en: "all of them", ur: "سب کو" } },
  ],

  // ---- Wing 5 · Together Verbs ----
  "79:23": [
    { ar: "فحشر", w: ["w:fa", "w:hashara"], g: { en: "Then he gathered (his people)", ur: "پھر اس نے (لوگ) جمع کیے" } },
    { ar: "فنادى", w: ["w:fa", "w:naada"], g: { en: "and called out", ur: "اور پکارا" } },
  ],
  "19:3": [
    { ar: "اذ", w: ["w:idh"], g: { en: "When", ur: "جب" } },
    { ar: "نادى", w: ["w:naada"], g: { en: "he called out", ur: "اس نے پکارا" } },
    { ar: "ربه", w: ["w:rabb", "w:hu"], g: { en: "to his Lord", ur: "اپنے رب کو" } },
    { ar: "نداء", w: ["w:nida"], g: { en: "a call", ur: "پکارنا" } },
    { ar: "خفيا", given: true, pic: "🤫", art: "g:quiet", g: { en: "quiet, hidden", ur: "چپکے سے" } },
  ],
  "20:11": [
    { ar: "فلما", w: ["w:fa", "w:lammaa"], g: { en: "Then when", ur: "پھر جب" } },
    { ar: "اتىها", w: ["w:ata", "w:ha"], g: { en: "he came to it", ur: "وہ اس کے پاس آئے" } },
    { ar: "نودي", w: ["w:nudiya"], g: { en: "he was called", ur: "پکارا گیا" }, pieces: [p("نُودِيَ", "was called — نَادَى call + the u-i sound (passive)", "پکارا گیا — نَادَى پکارنا + اُ اِ کی آواز (مجہول)")] },
    { ar: "يموسى", w: ["w:ya", "w:musa"], g: { en: "O Musa", ur: "اے موسیٰ" } },
  ],
  "69:20": [
    { ar: "اني", w: ["w:inna", "w:i"], g: { en: "Indeed I", ur: "بے شک میں" } },
    { ar: "ظننت", w: ["w:zanna", "w:i"], note: "ظَنَّ can mean being sure: I was sure", g: { en: "was sure", ur: "یقین رکھتا تھا" } },
    { ar: "اني", w: ["w:anna_that", "w:i"], g: { en: "that I", ur: "کہ میں" } },
    { ar: "ملق", w: ["w:mulaqi"], g: { en: "would meet", ur: "ملنے والا ہوں" } },
    { ar: "حسابيه", w: ["w:hisab", "w:i"], g: { en: "my account", ur: "اپنے حساب سے" } },
  ],
  "22:68": [
    { ar: "وان", w: ["w:wa", "w:in_if"], g: { en: "And if", ur: "اور اگر" } },
    { ar: "جدلوك", w: ["w:jaadala", "w:hum", "w:ka"], g: { en: "they argue with you", ur: "وہ آپ سے جھگڑیں" }, pieces: [p("جَادَلُ", "argue (did) — the long ā: with someone", "جھگڑا کیا — لمبا آ: کسی کے ساتھ"), p("ـو", "they", "وہ"), p("ـكَ", "you", "آپ")] },
    { ar: "فقل", w: ["w:fa", "w:qala"], g: { en: "then say", ur: "تو کہہ دیجیے" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "اعلم", w: ["w:alam_more"], g: { en: "knows best", ur: "خوب جانتا ہے" } },
    { ar: "بما", w: ["w:bi", "w:ma"], g: { en: "what", ur: "جو کچھ" } },
    { ar: "تعملون", w: ["w:amila", "w:kum"], g: { en: "you do", ur: "تم کرتے ہو" } },
  ],
  "4:138": [
    { ar: "بشر", w: ["w:bashshara"], g: { en: "Give news", ur: "خبر دے دیجیے" } },
    { ar: "المنفقين", w: ["w:al", "w:munafiq"], g: { en: "to the hypocrites", ur: "منافقوں کو" } },
    { ar: "بان", w: ["w:bi", "w:anna_that"], g: { en: "that", ur: "کہ" } },
    { ar: "لهم", w: ["w:li", "w:hum"], g: { en: "for them", ur: "ان کے لیے" } },
    { ar: "عذابا", w: ["w:azab"], g: { en: "is a punishment", ur: "عذاب ہے" } },
    { ar: "اليما", w: ["w:alim_pain"], g: { en: "painful", ur: "دردناک" } },
  ],
  "29:6": [
    { ar: "ومن", w: ["w:wa", "w:man"], g: { en: "And whoever", ur: "اور جو" } },
    { ar: "جهد", w: ["w:jaahada"], g: { en: "strives", ur: "جدوجہد کرتا ہے" } },
    { ar: "فانما", w: ["w:fa", "w:inna", "w:ma"], note: "إِنَّمَا (إِنَّ + مَا) means 'only'", g: { en: "only", ur: "تو بس" } },
    { ar: "يجهد", w: ["w:jaahada"], g: { en: "strives", ur: "جدوجہد کرتا ہے" } },
    { ar: "لنفسه", w: ["w:li", "w:nafs", "w:hu"], g: { en: "for himself", ur: "اپنے ہی لیے" } },
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "لغني", given: true, pic: "💎", medal: "غَنِيّ", ofAllah: true, g: { en: "surely needs nothing", ur: "ضرور بے نیاز ہے" } },
    { ar: "عن", w: ["w:an"], g: { en: "from", ur: "سے" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "the worlds", ur: "تمام جہانوں" } },
  ],
  // ---- Wing 5 · Make-It Verbs 1 ----
  "21:107": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "ارسلنك", w: ["w:arsala", "w:na", "w:ka"], g: { en: "did We send you", ur: "ہم نے آپ کو بھیجا" }, pieces: [p("أَرْسَلْ", "send (did) — the أَ in front: make it go", "بھیجا — آگے کا أَ: روانہ کرنا"), p("ـنَا", "We", "ہم نے"), p("ـكَ", "you", "آپ کو")] },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "رحمة", w: ["w:rahma"], g: { en: "as a mercy", ur: "رحمت بنا کر" } },
    { ar: "للعلمين", w: ["w:li", "w:al", "w:alam"], g: { en: "for the worlds", ur: "تمام جہانوں کے لیے" } },
  ],
  "26:57": [
    { ar: "فاخرجنهم", w: ["w:fa", "w:akhraja", "w:na", "w:hum"], g: { en: "So We brought them out", ur: "تو ہم نے انہیں نکالا" }, pieces: [p("فَ", "so", "تو"), p("أَخْرَجْ", "bring out (did) — خَرَجَ go out + أَ: make go out", "نکالا — خَرَجَ نکلنا + أَ: نکلوانا"), p("ـنَا", "We", "ہم نے"), p("ـهُمْ", "them", "انہیں")] },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "جنت", w: ["w:jannah"], g: { en: "gardens", ur: "باغوں" } },
    { ar: "وعيون", w: ["w:wa", "w:ayn"], g: { en: "and springs", ur: "اور چشموں" } },
  ],
  "15:40": [
    { ar: "الا", w: ["w:illa"], g: { en: "Except", ur: "سوائے" } },
    { ar: "عبادك", w: ["w:abd", "w:ka"], g: { en: "Your servants", ur: "تیرے بندوں کے" } },
    { ar: "منهم", w: ["w:min", "w:hum"], g: { en: "among them", ur: "ان میں سے" } },
    { ar: "المخلصين", w: ["w:al", "w:mukhlas"], g: { en: "the chosen, purified ones", ur: "جو چنے ہوئے ہیں" } },
  ],
  "21:75": [
    { ar: "وادخلنه", w: ["w:wa", "w:adkhala", "w:na", "w:hu"], g: { en: "And We admitted him", ur: "اور ہم نے اسے داخل کیا" } },
    { ar: "في", w: ["w:fi"], g: { en: "into", ur: "میں" } },
    { ar: "رحمتنا", w: ["w:rahma", "w:na"], g: { en: "Our mercy", ur: "اپنی رحمت" } },
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed he", ur: "بے شک وہ" } },
    { ar: "من", w: ["w:min"], g: { en: "was among", ur: "میں سے تھا" } },
    { ar: "الصلحين", w: ["w:al", "w:salih"], g: { en: "the righteous", ur: "نیک لوگوں" } },
  ],
  "20:32": [
    { ar: "واشركه", w: ["w:wa", "w:ashraka", "w:hu"], note: "أَشْرَكَ: give a share; here Musa asks that Harun share his task", g: { en: "and make him share", ur: "اور اسے شریک کر دے" }, pieces: [p("وَ", "and", "اور"), p("أَشْرِكْ", "make share! — شَرِيك partner + أَ: make a partner", "شریک کر — شَرِيك ساتھی + أَ: ساتھی بنانا"), p("ـهُ", "him", "اسے")] },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "امري", w: ["w:amr", "w:i"], g: { en: "my task", ur: "میرے کام" } },
  ],
  "37:110": [
    { ar: "كذلك", w: ["w:ka_like", "w:dhalika"], g: { en: "Like that", ur: "اسی طرح" } },
    { ar: "نجزي", w: ["w:jazaa_v"], g: { en: "We reward", ur: "ہم بدلہ دیتے ہیں" } },
    { ar: "المحسنين", w: ["w:al", "w:muhsin"], g: { en: "those who do good", ur: "نیکی کرنے والوں کو" } },
  ],
  "68:35": [
    { ar: "افنجعل", w: ["w:a", "w:fa", "w:jaala"], g: { en: "Shall We then treat", ur: "کیا ہم کر دیں" } },
    { ar: "المسلمين", w: ["w:al", "w:muslim"], g: { en: "those who submit", ur: "فرمانبرداروں کو" } },
    { ar: "كالمجرمين", w: ["w:ka_like", "w:al", "w:mujrim"], g: { en: "like the criminals?", ur: "مجرموں جیسا؟" } },
  ],

  // ---- Wing 5 · Make-It Verbs 2 ----
  "23:1": [
    { ar: "قد", w: ["w:qad"], note: "قَدْ before a past verb: certainly, already", g: { en: "Certainly", ur: "یقیناً" } },
    { ar: "افلح", w: ["w:aflaha"], g: { en: "have succeeded", ur: "کامیاب ہو گئے" } },
    { ar: "المؤمنون", w: ["w:al", "w:mumin"], g: { en: "the believers", ur: "ایمان والے" } },
  ],
  "2:12": [
    { ar: "الا", w: ["w:ala_attn"], g: { en: "Listen!", ur: "سن لو!" } },
    { ar: "انهم", w: ["w:inna", "w:hum"], g: { en: "Indeed they", ur: "بے شک وہ" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they are", ur: "وہی" } },
    { ar: "المفسدون", w: ["w:al", "w:mufsid"], g: { en: "the ones spreading ruin", ur: "فساد کرنے والے ہیں" } },
    { ar: "ولكن", w: ["w:wa", "w:lakinna"], g: { en: "but", ur: "لیکن" } },
    { ar: "لا", w: ["w:la"], g: { en: "not", ur: "نہیں" } },
    { ar: "يشعرون", w: ["w:yashuru", "w:hum"], g: { en: "do they realise", ur: "وہ سمجھتے" } },
  ],
  "12:2": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم نے" } },
    { ar: "انزلنه", w: ["w:anzala", "w:na", "w:hu"], g: { en: "sent it down", ur: "اسے اتارا" }, pieces: [p("أَنْزَلْ", "send down (did) — نَزَلَ come down + أَ: make come down", "اتارا — نَزَلَ اترنا + أَ: اتروانا"), p("ـنَا", "We", "ہم نے"), p("ـهُ", "it", "اسے")] },
    { ar: "قرءنا", w: ["w:quran"], g: { en: "as a Qur'an", ur: "قرآن بنا کر" } },
    { ar: "عربيا", given: true, pic: "👅", art: "w:lisan", g: { en: "in Arabic", ur: "عربی میں" } },
    { ar: "لعلكم", w: ["w:laalla", "w:kum"], g: { en: "so that you may", ur: "تاکہ تم" } },
    { ar: "تعقلون", w: ["w:aqala", "w:kum"], g: { en: "understand", ur: "سمجھو" } },
  ],
  "26:66": [
    { ar: "ثم", w: ["w:thumma"], g: { en: "Then", ur: "پھر" } },
    { ar: "اغرقنا", w: ["w:aghraqa", "w:na"], g: { en: "We drowned", ur: "ہم نے غرق کر دیا" } },
    { ar: "الاخرين", w: ["w:al", "w:akhar"], g: { en: "the others", ur: "دوسروں کو" } },
  ],
  "37:72": [
    { ar: "ولقد", w: ["w:wa", "w:la_surely", "w:qad"], note: "لَقَدْ: certainly (لَ surely + قَدْ)", g: { en: "And certainly", ur: "اور یقیناً" } },
    { ar: "ارسلنا", w: ["w:arsala", "w:na"], g: { en: "We sent", ur: "ہم نے بھیجے" } },
    { ar: "فيهم", w: ["w:fi", "w:hum"], g: { en: "among them", ur: "ان میں" } },
    { ar: "منذرين", w: ["w:mundhir"], g: { en: "warners", ur: "ڈرانے والے" } },
  ],
  "37:73": [
    { ar: "فانظر", w: ["w:fa", "w:nazara"], g: { en: "So look", ur: "تو دیکھو" } },
    { ar: "كيف", w: ["w:kayfa"], g: { en: "how", ur: "کیسا" } },
    { ar: "كان", w: ["w:kana"], g: { en: "was", ur: "ہوا" } },
    { ar: "عقبة", w: ["w:aqiba"], g: { en: "the end", ur: "انجام" } },
    { ar: "المنذرين", w: ["w:al", "w:mundhar"], g: { en: "of those who were warned", ur: "ڈرائے گئے لوگوں کا" }, pieces: [p("مُنْذِر", "warner — the i-sound: the one who does it", "ڈرانے والا — اِ کی آواز: کرنے والا"), p("مُنْذَر", "warned — the a-sound: the one it is done to", "ڈرایا ہوا — اَ کی آواز: جس پر کیا گیا")] },
  ],
  "15:62": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "اس نے کہا" } },
    { ar: "انكم", w: ["w:inna", "w:kum"], g: { en: "Indeed you are", ur: "بے شک تم" } },
    { ar: "قوم", w: ["w:qawm"], g: { en: "people", ur: "لوگ ہو" } },
    { ar: "منكرون", w: ["w:munkar"], g: { en: "unknown (to me)", ur: "اجنبی" } },
  ],
  "15:81": [
    { ar: "واتينهم", w: ["w:wa", "w:ata_give", "w:na", "w:hum"], g: { en: "And We gave them", ur: "اور ہم نے انہیں دیں" } },
    { ar: "ايتنا", w: ["w:aya", "w:na"], g: { en: "Our signs", ur: "اپنی نشانیاں" } },
    { ar: "فكانوا", w: ["w:fa", "w:kana", "w:hum"], g: { en: "but they were", ur: "تو وہ تھے" } },
    { ar: "عنها", w: ["w:an", "w:ha"], g: { en: "from them", ur: "ان سے" } },
    { ar: "معرضين", w: ["w:murid"], g: { en: "turning away", ur: "منہ پھیرنے والے" } },
  ],

  // ---- Wing 5 · Make-It Verbs 3 ----
  "53:44": [
    { ar: "وانه", w: ["w:wa", "w:anna_that", "w:hu"], g: { en: "And that it is He", ur: "اور یہ کہ وہی" } },
    { ar: "هو", w: ["w:huwa"], note: "هُوَ for stress: 'it is He who'", g: { en: "who", ur: "ہے جس نے" } },
    { ar: "امات", w: ["w:amata"], g: { en: "causes death", ur: "موت دی" }, pieces: [p("أَمَاتَ", "cause to die — مَاتَ die + أَ in front", "موت دی — مَاتَ مرنا + آگے أَ")] },
    { ar: "واحيا", w: ["w:wa", "w:ahya"], g: { en: "and gives life", ur: "اور زندگی دی" } },
  ],
  "15:76": [
    { ar: "وانها", w: ["w:wa", "w:inna", "w:ha"], g: { en: "And indeed it (the town)", ur: "اور بے شک وہ (بستی)" } },
    { ar: "لبسبيل", w: ["w:la_surely", "w:bi", "w:sabil"], g: { en: "is on a road", ur: "ایک راستے پر ہے" } },
    { ar: "مقيم", w: ["w:muqim"], g: { en: "still in use", ur: "جو اب بھی قائم ہے" } },
  ],
  "3:132": [
    { ar: "واطيعوا", w: ["w:wa", "w:ataa", "w:kum"], g: { en: "And obey", ur: "اور اطاعت کرو" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ کی" } },
    { ar: "والرسول", w: ["w:wa", "w:al", "w:rasul"], g: { en: "and the Messenger", ur: "اور رسول کی" } },
    { ar: "لعلكم", w: ["w:laalla", "w:kum"], g: { en: "so that you may", ur: "تاکہ تم پر" } },
    { ar: "ترحمون", w: ["w:rahima", "w:kum"], g: { en: "receive mercy", ur: "رحم کیا جائے" } },
  ],
  "44:30": [
    { ar: "ولقد", w: ["w:wa", "w:la_surely", "w:qad"], note: "لَقَدْ: certainly (لَ surely + قَدْ)", g: { en: "And certainly", ur: "اور یقیناً" } },
    { ar: "نجينا", w: ["w:najja", "w:na"], g: { en: "We saved", ur: "ہم نے بچا لیا" } },
    { ar: "بني", w: ["w:ibn"], note: "بَنِي: sons of = the Children (of Israil)", g: { en: "the Children", ur: "بنی" } },
    { ar: "اسرءيل", w: ["w:israil"], g: { en: "of Israel", ur: "اسرائیل کو" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "العذاب", w: ["w:al", "w:azab"], g: { en: "the punishment", ur: "عذاب" } },
    { ar: "المهين", w: ["w:al", "w:muhin"], g: { en: "that humiliated", ur: "ذلت والے" } },
  ],
  "37:75": [
    { ar: "ولقد", w: ["w:wa", "w:la_surely", "w:qad"], note: "لَقَدْ: certainly (لَ surely + قَدْ)", g: { en: "And certainly", ur: "اور یقیناً" } },
    { ar: "نادىنا", w: ["w:naada", "w:na"], g: { en: "called on Us", ur: "ہمیں پکارا" } },
    { ar: "نوح", w: ["w:nuh"], g: { en: "Nuh", ur: "نوح نے" } },
    { ar: "فلنعم", w: ["w:fa", "w:la_surely", "w:nima"], g: { en: "and how excellent", ur: "تو کیا ہی خوب" } },
    { ar: "المجيبون", w: ["w:al", "w:mujib"], ofAllah: true, g: { en: "We are in answering", ur: "قبول کرنے والے ہیں ہم" } },
  ],
  "8:3": [
    { ar: "الذين", w: ["w:alladhina"], g: { en: "Those who", ur: "وہ جو" } },
    { ar: "يقيمون", w: ["w:aqama", "w:hum"], g: { en: "keep up", ur: "قائم رکھتے ہیں" }, pieces: [p("يُقِيمُ", "keep up (now) — قَامَ stand + the أَ mould: make it stand", "قائم رکھتا ہے — قَامَ کھڑا ہونا + أَ کا سانچا: کھڑا کرنا"), p("ـونَ", "they", "وہ")] },
    { ar: "الصلوة", w: ["w:al", "w:salah"], g: { en: "the prayer", ur: "نماز" } },
    { ar: "ومما", w: ["w:wa", "w:min", "w:ma"], g: { en: "and from what", ur: "اور جو کچھ" } },
    { ar: "رزقنهم", w: ["w:razaqa", "w:na", "w:hum"], g: { en: "We have given them", ur: "ہم نے انہیں دیا" } },
    { ar: "ينفقون", w: ["w:anfaqa", "w:hum"], g: { en: "they spend", ur: "اس میں سے خرچ کرتے ہیں" } },
  ],

  // ---- Wing 5 · Make-It Verbs 4 ----
  "20:19": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "فرمایا" } },
    { ar: "القها", w: ["w:alqa", "w:ha"], g: { en: "Throw it down", ur: "اسے ڈال دو" } },
    { ar: "يموسى", w: ["w:ya", "w:musa"], g: { en: "O Musa", ur: "اے موسیٰ" } },
  ],
  "26:65": [
    { ar: "وانجينا", w: ["w:wa", "w:anja", "w:na"], g: { en: "And We saved", ur: "اور ہم نے بچا لیا" } },
    { ar: "موسى", w: ["w:musa"], g: { en: "Musa", ur: "موسیٰ کو" } },
    { ar: "ومن", w: ["w:wa", "w:man"], g: { en: "and whoever", ur: "اور جو" } },
    { ar: "معه", w: ["w:maa", "w:hu"], g: { en: "was with him", ur: "ان کے ساتھ تھے" } },
    { ar: "اجمعين", w: ["w:ajma"], g: { en: "all of them", ur: "سب کو" } },
  ],
  "99:5": [
    { ar: "بان", w: ["w:bi", "w:anna_that"], g: { en: "because", ur: "اس لیے کہ" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تیرے رب نے" } },
    { ar: "اوحى", w: ["w:awha"], g: { en: "inspired", ur: "حکم بھیجا" } },
    { ar: "لها", w: ["w:li", "w:ha"], g: { en: "her (the earth)", ur: "اسے (زمین کو)" } },
  ],
  "20:56": [
    { ar: "ولقد", w: ["w:wa", "w:la_surely", "w:qad"], note: "لَقَدْ: certainly (لَ surely + قَدْ)", g: { en: "And certainly", ur: "اور یقیناً" } },
    { ar: "اريناه", w: ["w:ara", "w:na", "w:hu"], g: { en: "We showed him", ur: "ہم نے اسے دکھائیں" }, pieces: [p("أَرَيْ", "show (did) — رَأَى see + أَ: make see", "دکھایا — رَأَى دیکھنا + أَ: دکھانا"), p("ـنَا", "We", "ہم نے"), p("ـهُ", "him", "اسے")] },
    { ar: "ايتنا", w: ["w:aya", "w:na"], g: { en: "Our signs", ur: "اپنی نشانیاں" } },
    { ar: "كلها", w: ["w:kull", "w:ha"], g: { en: "all of them", ur: "سب کی سب" } },
    { ar: "فكذب", w: ["w:fa", "w:kadhdhaba"], g: { en: "but he denied", ur: "تو اس نے جھٹلایا" } },
    { ar: "وابى", w: ["w:wa", "w:aba"], g: { en: "and refused", ur: "اور انکار کیا" } },
  ],
  "33:64": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ نے" } },
    { ar: "لعن", w: ["w:laana"], g: { en: "has cursed", ur: "لعنت کی" } },
    { ar: "الكفرين", w: ["w:al", "w:kafir"], g: { en: "the disbelievers", ur: "کافروں پر" } },
    { ar: "واعد", w: ["w:wa", "w:aadda"], g: { en: "and prepared", ur: "اور تیار کر رکھی ہے" } },
    { ar: "لهم", w: ["w:li", "w:hum"], g: { en: "for them", ur: "ان کے لیے" } },
    { ar: "سعيرا", w: ["w:sair"], g: { en: "a blazing fire", ur: "دہکتی آگ" } },
  ],
  "37:57": [
    { ar: "ولولا", w: ["w:wa", "w:lawla"], g: { en: "And if not for", ur: "اور اگر نہ ہوتی" } },
    { ar: "نعمة", w: ["w:nima_gift"], g: { en: "the favour", ur: "نعمت" } },
    { ar: "ربي", w: ["w:rabb", "w:i"], g: { en: "of my Lord", ur: "میرے رب کی" } },
    { ar: "لكنت", w: ["w:la_surely", "w:kana", "w:i"], g: { en: "I would surely have been", ur: "تو میں بھی ہوتا" } },
    { ar: "من", w: ["w:min"], g: { en: "among", ur: "میں سے" } },
    { ar: "المحضرين", w: ["w:al", "w:muhdar"], g: { en: "those brought (to punishment)", ur: "(عذاب میں) حاضر کیے گئے لوگوں" } },
  ],
  "26:203": [
    { ar: "فيقولوا", w: ["w:fa", "w:qala", "w:hum"], g: { en: "Then they will say", ur: "پھر وہ کہیں گے" } },
    { ar: "هل", w: ["w:hal"], g: { en: "Will", ur: "کیا" } },
    { ar: "نحن", w: ["w:nahnu"], g: { en: "we", ur: "ہمیں" } },
    { ar: "منظرون", w: ["w:munzar"], g: { en: "be given more time?", ur: "مہلت دی جائے گی؟" } },
  ],
  "51:57": [
    { ar: "ما", w: ["w:ma"], g: { en: "Not", ur: "نہیں" } },
    { ar: "اريد", w: ["w:arada"], g: { en: "do I want", ur: "میں چاہتا" } },
    { ar: "منهم", w: ["w:min", "w:hum"], g: { en: "from them", ur: "ان سے" } },
    { ar: "من", w: ["w:min"], note: "مِنْ after 'not': any (at all)", g: { en: "any", ur: "کوئی" } },
    { ar: "رزق", w: ["w:rizq"], g: { en: "provision", ur: "رزق" } },
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and not", ur: "اور نہ" } },
    { ar: "اريد", w: ["w:arada"], g: { en: "do I want", ur: "میں چاہتا ہوں" } },
    { ar: "ان", w: ["w:an_to"], g: { en: "that", ur: "کہ" } },
    { ar: "يطعمون", w: ["w:atama", "w:hum", "w:i"], g: { en: "they feed Me", ur: "وہ مجھے کھلائیں" } },
  ],

  // ---- Wing 5 · Self Verbs 1 ----
  "87:10": [
    { ar: "سيذكر", w: ["w:sa", "w:tadhakkara"], g: { en: "Will take heed", ur: "نصیحت پکڑے گا" }, pieces: [p("سَ", "will", "گا"), p("يَذَّكَّرُ", "take heed — تَذَكَّرَ, the تَ melts into the ذ: remind yourself", "نصیحت پکڑتا ہے — تَذَكَّرَ، تَ ذ میں مل گیا: اپنے آپ کو یاد دلانا")] },
    { ar: "من", w: ["w:man"], g: { en: "whoever", ur: "جو" } },
    { ar: "يخشى", w: ["w:khashiya"], g: { en: "fears (Allah)", ur: "(اللہ سے) ڈرتا ہے" } },
  ],
  "79:35": [
    { ar: "يوم", w: ["w:yawm"], g: { en: "The Day", ur: "جس دن" } },
    { ar: "يتذكر", w: ["w:tadhakkara"], g: { en: "will remember", ur: "یاد کرے گا" }, pieces: [p("يَ", "he (now / will)", "وہ"), p("تَذَكَّرُ", "remember — ذَكَّرَ remind + تَ: remind yourself", "یاد کرتا ہے — ذَكَّرَ یاد دلانا + تَ: خود کو یاد دلانا")] },
    { ar: "الانسن", w: ["w:al", "w:insan"], g: { en: "man", ur: "انسان" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "جو" } },
    { ar: "سعى", w: ["w:saa_strive"], g: { en: "he strove for", ur: "اس نے کوشش کی" } },
  ],
  "52:31": [
    { ar: "قل", w: ["w:qala"], g: { en: "Say", ur: "کہہ دیجیے" } },
    { ar: "تربصوا", w: ["w:tarabbasa", "w:kum"], g: { en: "wait and watch", ur: "انتظار کرو" }, pieces: [p("تَرَبَّصُ", "wait and watch (do it!) — the تَفَعَّلَ mould", "انتظار کرو — تَفَعَّلَ کا سانچا"), p("ـوا", "you all", "تم سب")] },
    { ar: "فاني", w: ["w:fa", "w:inna", "w:i"], g: { en: "for indeed I am", ur: "کیونکہ میں بھی" } },
    { ar: "معكم", w: ["w:maa", "w:kum"], g: { en: "with you", ur: "تمہارے ساتھ" } },
    { ar: "من", w: ["w:min"], g: { en: "among", ur: "میں سے ہوں" } },
    { ar: "المتربصين", w: ["w:al", "w:tarabbasa"], g: { en: "those who wait", ur: "انتظار کرنے والوں" }, pieces: [p("الْ", "the", "—"), p("مُتَرَبِّص", "one who waits — مُ in front: the doer", "انتظار کرنے والا — آگے مُ: کرنے والا"), p("ـِينَ", "many", "کئی")] },
  ],
  "30:14": [
    { ar: "ويوم", w: ["w:wa", "w:yawm"], g: { en: "And on the Day", ur: "اور جس دن" } },
    { ar: "تقوم", w: ["w:qama"], note: "قَامَ said of the Hour: is established, comes", g: { en: "will be established", ur: "قائم ہو گی" } },
    { ar: "الساعة", w: ["w:al", "w:saa"], g: { en: "the Hour", ur: "قیامت" } },
    { ar: "يومىذ", w: ["w:yawm", "w:idh"], g: { en: "that Day", ur: "اس دن" } },
    { ar: "يتفرقون", w: ["w:tafarraqa", "w:hum"], g: { en: "they will be split apart", ur: "وہ الگ الگ ہو جائیں گے" }, pieces: [p("يَتَفَرَّقُ", "split up — فَرِيق group, تَفَعَّلَ: become groups", "الگ ہوتے ہیں — فَرِيق گروہ، تَفَعَّلَ: گروہ گروہ ہو جانا"), p("ـونَ", "they", "وہ")] },
  ],
  "74:3": [
    { ar: "وربك", w: ["w:wa", "w:rabb", "w:ka"], g: { en: "And your Lord", ur: "اور اپنے رب کی" } },
    { ar: "فكبر", w: ["w:fa", "w:kabbara"], g: { en: "declare His greatness", ur: "بڑائی بیان کیجیے" }, pieces: [p("فَ", "so", "پس"), p("كَبِّرْ", "declare great (do it!) — كَبِير great, doubled middle: call it great", "بڑائی بیان کرو — كَبِير بڑا، درمیان دوہرا: بڑا کہنا")] },
  ],
  "14:40": [
    { ar: "رب", w: ["w:rabb", "w:i"], g: { en: "My Lord", ur: "اے میرے رب" } },
    { ar: "اجعلني", w: ["w:jaala", "w:i"], g: { en: "make me", ur: "مجھے بنا" } },
    { ar: "مقيم", w: ["w:muqim"], g: { en: "one who keeps up", ur: "قائم کرنے والا" } },
    { ar: "الصلوة", w: ["w:al", "w:salah"], g: { en: "the prayer", ur: "نماز" } },
    { ar: "ومن", w: ["w:wa", "w:min"], g: { en: "and from", ur: "اور میں سے بھی" } },
    { ar: "ذريتي", w: ["w:dhurriyya", "w:i"], g: { en: "my children", ur: "میری اولاد" } },
    { ar: "ربنا", w: ["w:rabb", "w:na"], g: { en: "Our Lord", ur: "اے ہمارے رب" } },
    { ar: "وتقبل", w: ["w:wa", "w:taqabbala"], g: { en: "and accept", ur: "اور قبول فرما" }, pieces: [p("وَ", "and", "اور"), p("تَقَبَّلْ", "accept (please!) — قَبِلَ accept + تَفَعَّلَ: take it in fully", "قبول کر — قَبِلَ قبول کرنا + تَفَعَّلَ: پوری طرح لے لینا")] },
    { ar: "دعاء", w: ["w:dua", "w:i"], g: { en: "my prayer", ur: "میری دعا" } },
  ],

  // ---- Wing 5 · Self Verbs 2 ----
  "26:217": [
    { ar: "وتوكل", w: ["w:wa", "w:tawakkala"], g: { en: "And rely", ur: "اور بھروسہ کیجیے" }, pieces: [p("وَ", "and", "اور"), p("تَوَكَّلْ", "rely (do it!) — وَكِيل trustee, تَفَعَّلَ: make Him your trustee", "بھروسہ کرو — وَكِيل کارساز، تَفَعَّلَ: اسے اپنا کارساز بنانا")] },
    { ar: "على", w: ["w:ala"], g: { en: "on", ur: "پر" } },
    { ar: "العزيز", w: ["w:al", "w:aziz"], g: { en: "the Almighty", ur: "زبردست" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Most Merciful", ur: "نہایت رحم والے" } },
  ],
  "16:42": [
    { ar: "الذين", w: ["w:alladhina"], g: { en: "Those who", ur: "جنہوں نے" } },
    { ar: "صبروا", w: ["w:sabara", "w:hum"], g: { en: "were patient", ur: "صبر کیا" } },
    { ar: "وعلى", w: ["w:wa", "w:ala"], g: { en: "and upon", ur: "اور پر" } },
    { ar: "ربهم", w: ["w:rabb", "w:hum"], g: { en: "their Lord", ur: "اپنے رب" } },
    { ar: "يتوكلون", w: ["w:tawakkala", "w:hum"], g: { en: "they rely", ur: "بھروسہ رکھتے ہیں" }, pieces: [p("يَتَوَكَّلُ", "rely — تَوَكَّلَ, now", "بھروسہ کرتے ہیں — تَوَكَّلَ، ابھی"), p("ـونَ", "they", "وہ")] },
  ],
  "77:46": [
    { ar: "كلوا", w: ["w:akala", "w:kum"], g: { en: "Eat", ur: "کھا لو" } },
    { ar: "وتمتعوا", w: ["w:wa", "w:tamattaa", "w:kum"], g: { en: "and enjoy yourselves", ur: "اور مزے کر لو" }, pieces: [p("وَ", "and", "اور"), p("تَمَتَّعُ", "enjoy (do it!) — مَتَّعَ let enjoy + تَ: let yourself enjoy", "مزے کرو — مَتَّعَ فائدہ دینا + تَ: خود فائدہ اٹھانا"), p("ـوا", "you all", "تم سب")] },
    { ar: "قليلا", w: ["w:qalil"], g: { en: "a little", ur: "تھوڑا سا" } },
    { ar: "انكم", w: ["w:inna", "w:kum"], g: { en: "indeed you are", ur: "بے شک تم" } },
    { ar: "مجرمون", w: ["w:mujrim"], g: { en: "criminals", ur: "مجرم ہو" } },
  ],
  "16:55": [
    { ar: "ليكفروا", w: ["w:li", "w:kafara", "w:hum"], g: { en: "So they deny", ur: "تاکہ وہ ناشکری کریں" } },
    { ar: "بما", w: ["w:bi", "w:ma"], g: { en: "what", ur: "اس کی جو" } },
    { ar: "اتينهم", w: ["w:ata_give", "w:na", "w:hum"], g: { en: "We gave them", ur: "ہم نے انہیں دیا" } },
    { ar: "فتمتعوا", w: ["w:fa", "w:tamattaa", "w:kum"], g: { en: "So enjoy yourselves", ur: "تو مزے کر لو" } },
    { ar: "فسوف", w: ["w:fa", "w:sawfa"], g: { en: "for later on", ur: "پھر آگے چل کر" } },
    { ar: "تعلمون", w: ["w:alima", "w:kum"], g: { en: "you will know", ur: "تم جان لو گے" } },
  ],
  "3:82": [
    { ar: "فمن", w: ["w:fa", "w:man"], g: { en: "So whoever", ur: "تو جو کوئی" } },
    { ar: "تولى", w: ["w:tawalla"], g: { en: "turns away", ur: "منہ موڑے" }, pieces: [p("تَوَلَّى", "turned away — وَلَّى turn + تَ: turn yourself away", "منہ موڑا — وَلَّى پھیرنا + تَ: خود کو پھیر لینا")] },
    { ar: "بعد", w: ["w:bada"], g: { en: "after", ur: "بعد" } },
    { ar: "ذلك", w: ["w:dhalika"], g: { en: "that", ur: "اس کے" } },
    { ar: "فاولىك", w: ["w:fa", "w:ulaika"], g: { en: "then those", ur: "تو وہی لوگ" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they are", ur: "وہ (سب)" } },
    { ar: "الفسقون", w: ["w:al", "w:fasiq"], g: { en: "the disobedient", ur: "نافرمان ہیں" } },
  ],
  "92:16": [
    { ar: "الذي", w: ["w:alladhi"], g: { en: "The one who", ur: "جس نے" } },
    { ar: "كذب", w: ["w:kadhdhaba"], g: { en: "denied", ur: "جھٹلایا" } },
    { ar: "وتولى", w: ["w:wa", "w:tawalla"], g: { en: "and turned away", ur: "اور منہ موڑا" } },
  ],
  "16:32": [
    { ar: "الذين", w: ["w:alladhina"], g: { en: "Those whom", ur: "جن کی" } },
    { ar: "تتوفىهم", w: ["w:tawaffa", "w:hum"], g: { en: "take in death", ur: "روح قبض کرتے ہیں" }, pieces: [p("تَتَوَفَّى", "take in full — وَفَّى pay in full + تَ: take it in full", "پوری لے لیتے ہیں — وَفَّى پورا دینا + تَ: پورا لے لینا"), p("ـهُمُ", "them", "ان کی")] },
    { ar: "الملىكة", w: ["w:al", "w:malak"], g: { en: "the angels", ur: "فرشتے" } },
    { ar: "طيبين", given: true, pic: "🤍", art: "g:pure", g: { en: "while they are good and pure", ur: "پاکیزہ حالت میں" } },
    { ar: "يقولون", w: ["w:qala", "w:hum"], g: { en: "saying", ur: "کہتے ہیں" } },
    { ar: "سلم", w: ["w:salam"], g: { en: "Peace", ur: "سلام" } },
    { ar: "عليكم", w: ["w:ala", "w:kum"], g: { en: "be upon you", ur: "تم پر" } },
    { ar: "ادخلوا", w: ["w:dakhala", "w:kum"], g: { en: "enter", ur: "داخل ہو جاؤ" } },
    { ar: "الجنة", w: ["w:al", "w:jannah"], g: { en: "Paradise", ur: "جنت میں" } },
    { ar: "بما", w: ["w:bi", "w:ma"], g: { en: "for what", ur: "ان کے بدلے جو" } },
    { ar: "كنتم", w: ["w:kana", "w:kum"], g: { en: "you used to", ur: "تم" } },
    { ar: "تعملون", w: ["w:amila", "w:kum"], g: { en: "do", ur: "کرتے تھے" } },
  ],

  // ---- Wing 5 · Each-Other Verbs ----
  "67:1": [
    { ar: "تبرك", w: ["w:tabaraka"], g: { en: "Blessed is He", ur: "بڑی برکت والا ہے وہ" }, pieces: [p("تَبَارَكَ", "full of blessing — بَارَكَ bless + تَ: blessing in Himself", "بڑی برکت والا — بَارَكَ برکت دینا + تَ: خود برکت والا")] },
    { ar: "الذي", w: ["w:alladhi"], g: { en: "who", ur: "جس کے" } },
    { ar: "بيده", w: ["w:bi", "w:yad", "w:hu"], g: { en: "in whose hand is", ur: "ہاتھ میں ہے" } },
    { ar: "الملك", w: ["w:al", "w:mulk"], g: { en: "the dominion", ur: "بادشاہی" } },
    { ar: "وهو", w: ["w:wa", "w:huwa"], g: { en: "and He is", ur: "اور وہ" } },
    { ar: "على", w: ["w:ala"], g: { en: "over", ur: "پر" } },
    { ar: "كل", w: ["w:kull"], g: { en: "every", ur: "ہر" } },
    { ar: "شيء", w: ["w:shay"], g: { en: "thing", ur: "چیز" } },
    { ar: "قدير", w: ["w:qadir"], g: { en: "All-Powerful", ur: "پوری قدرت والا ہے" } },
  ],
  "78:1": [
    { ar: "عم", w: ["w:an", "w:ma"], g: { en: "About what", ur: "کس چیز کے بارے میں" }, pieces: [p("عَنْ", "about", "بارے میں"), p("مَا", "what", "کیا")] },
    { ar: "يتساءلون", w: ["w:tasaala", "w:hum"], g: { en: "are they asking one another?", ur: "وہ آپس میں پوچھ رہے ہیں؟" }, pieces: [p("يَتَسَاءَلُ", "ask one another — سَأَلَ ask + تَ and long ā: ask each other", "آپس میں پوچھتے ہیں — سَأَلَ پوچھنا + تَ اور لمبا ā: ایک دوسرے سے پوچھنا"), p("ـونَ", "they", "وہ")] },
  ],
  "74:40": [
    { ar: "في", w: ["w:fi"], g: { en: "In", ur: "میں" } },
    { ar: "جنت", w: ["w:jannah"], g: { en: "gardens", ur: "باغوں" } },
    { ar: "يتساءلون", w: ["w:tasaala", "w:hum"], g: { en: "they ask one another", ur: "وہ آپس میں پوچھیں گے" } },
  ],
  "16:3": [
    { ar: "خلق", w: ["w:khalaqa"], g: { en: "He created", ur: "اس نے پیدا کیا" } },
    { ar: "السموت", w: ["w:al", "w:sama"], g: { en: "the heavens", ur: "آسمانوں" } },
    { ar: "والارض", w: ["w:wa", "w:al", "w:ard"], g: { en: "and the earth", ur: "اور زمین کو" } },
    { ar: "بالحق", w: ["w:bi", "w:al", "w:haqq"], g: { en: "in truth", ur: "حق کے ساتھ" } },
    { ar: "تعلى", w: ["w:taala"], g: { en: "Exalted is He", ur: "وہ بلند و برتر ہے" }, pieces: [p("تَعَالَى", "exalted, high above — عَلِيّ high + تَ and long ā", "بلند و برتر — عَلِيّ بلند + تَ اور لمبا ā")] },
    { ar: "عما", w: ["w:an", "w:ma"], note: "عَنْ after تَعَالَى: far above (what they join with Him)", g: { en: "above what", ur: "اس سے جو" } },
    { ar: "يشركون", w: ["w:ashraka", "w:hum"], g: { en: "they associate (with Him)", ur: "وہ شریک ٹھہراتے ہیں" } },
  ],
  "20:62": [
    { ar: "فتنزعوا", w: ["w:fa", "w:tanazaa", "w:hum"], g: { en: "So they disputed", ur: "تو وہ آپس میں جھگڑے" }, pieces: [p("فَ", "so", "تو"), p("تَنَازَعُ", "disputed with one another — the تَفَاعَلَ mould: to each other", "آپس میں جھگڑے — تَفَاعَلَ کا سانچا: ایک دوسرے سے"), p("ـوا", "they", "وہ")] },
    { ar: "امرهم", w: ["w:amr", "w:hum"], g: { en: "over their matter", ur: "اپنے معاملے میں" } },
    { ar: "بينهم", w: ["w:bayna", "w:hum"], note: "بَيْنَهُمْ: between them = among themselves", g: { en: "among themselves", ur: "آپس میں" } },
    { ar: "واسروا", w: ["w:wa", "w:asarra", "w:hum"], g: { en: "and kept secret", ur: "اور چھپا کر کی" } },
    { ar: "النجوى", given: true, pic: "🤫", art: "g:quiet", g: { en: "their private talk", ur: "سرگوشی" } },
  ],

  // ---- Wing 5 · Burst & Colour Verbs ----
  "84:1": [
    { ar: "اذا", w: ["w:idha"], g: { en: "When", ur: "جب" } },
    { ar: "السماء", w: ["w:al", "w:sama"], g: { en: "the sky", ur: "آسمان" } },
    { ar: "انشقت", w: ["w:inshaqqa"], g: { en: "splits open", ur: "پھٹ جائے گا" }, pieces: [p("اِنْشَقَّ", "split open — اِنْ in front: it splits by itself", "پھٹ گیا — آگے اِنْ: خود بخود پھٹ جانا"), p("ـتْ", "she (the sky)", "وہ (آسمان)")] },
  ],
  "68:23": [
    { ar: "فانطلقوا", w: ["w:fa", "w:intalaqa", "w:hum"], g: { en: "So they set off", ur: "تو وہ چل پڑے" }, pieces: [p("فَ", "so", "تو"), p("اِنْطَلَقُ", "set off — the اِنْفَعَلَ mould", "چل پڑے — اِنْفَعَلَ کا سانچا"), p("ـوا", "they", "وہ")] },
    { ar: "وهم", w: ["w:wa", "w:humu"], g: { en: "while they", ur: "اور وہ (سب)" } },
    { ar: "يتخفتون", given: true, pic: "🤫", art: "g:quiet", g: { en: "were whispering to one another", ur: "چپکے چپکے باتیں کر رہے تھے" } },
  ],
  "43:14": [
    { ar: "وانا", w: ["w:wa", "w:inna", "w:na"], g: { en: "And indeed we", ur: "اور بے شک ہم" } },
    { ar: "الى", w: ["w:ila"], g: { en: "to", ur: "طرف" } },
    { ar: "ربنا", w: ["w:rabb", "w:na"], g: { en: "our Lord", ur: "اپنے رب کی" } },
    { ar: "لمنقلبون", w: ["w:la_surely", "w:inqalaba"], g: { en: "will surely return", ur: "ضرور لوٹنے والے ہیں" }, pieces: [p("لَ", "surely", "ضرور"), p("مُنْقَلِب", "one who returns — مُ in front of اِنْقَلَبَ", "لوٹنے والا — اِنْقَلَبَ کے آگے مُ"), p("ـُونَ", "many", "کئی")] },
  ],
  "84:9": [
    { ar: "وينقلب", w: ["w:wa", "w:inqalaba"], g: { en: "And he will return", ur: "اور وہ لوٹے گا" }, pieces: [p("وَ", "and", "اور"), p("يَنْقَلِبُ", "turns back — قَلْب heart, a turning thing + اِنْ: turn yourself back", "پلٹتا ہے — قَلْب دل، پلٹنے والی چیز + اِنْ: خود پلٹ جانا")] },
    { ar: "الى", w: ["w:ila"], g: { en: "to", ur: "طرف" } },
    { ar: "اهله", w: ["w:ahl", "w:hu"], g: { en: "his family", ur: "اپنے گھر والوں کی" } },
    { ar: "مسرورا", given: true, pic: "😊", art: "g:joy", g: { en: "happy", ur: "خوش خوش" } },
  ],
  "3:107": [
    { ar: "واما", w: ["w:wa", "w:amma"], g: { en: "And as for", ur: "اور رہے" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those whose", ur: "وہ لوگ جن کے" } },
    { ar: "ابيضت", w: ["w:ibyadda"], g: { en: "will shine bright", ur: "روشن ہوں گے" }, pieces: [p("اِبْيَضَّ", "turned white — أَبْيَض white, last letter doubled: become white", "سفید ہو گیا — أَبْيَض سفید، آخری حرف دوہرا: سفید ہو جانا"), p("ـتْ", "they (the faces)", "وہ (چہرے)")] },
    { ar: "وجوههم", w: ["w:wajh", "w:hum"], g: { en: "faces", ur: "چہرے" } },
    { ar: "ففي", w: ["w:fa", "w:fi"], g: { en: "they are in", ur: "تو وہ میں ہوں گے" } },
    { ar: "رحمة", w: ["w:rahma"], g: { en: "the mercy", ur: "رحمت" } },
    { ar: "الله", w: ["w:allah"], g: { en: "of Allah", ur: "اللہ کی" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "فيها", w: ["w:fi", "w:ha"], g: { en: "in it", ur: "اس میں" } },
    { ar: "خلدون", w: ["w:khalid"], g: { en: "will abide forever", ur: "ہمیشہ رہیں گے" } },
  ],

  // ---- Wing 5 · Take-For-Yourself Verbs 1 ----
  "26:108": [
    { ar: "فاتقوا", w: ["w:fa", "w:ittaqa", "w:kum"], g: { en: "So be mindful of", ur: "تو ڈرو" }, pieces: [p("فَ", "so", "تو"), p("اِتَّقُ", "guard yourselves — وَقَى protect + the تَ of اِفْتَعَلَ (و and تَ melt into تّ)", "بچو — وَقَى بچانا + اِفْتَعَلَ کا تَ (و اور تَ مل کر تّ)"), p("ـوا", "you all (command)", "تم سب (حکم)")] },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ سے" } },
    { ar: "واطيعون", w: ["w:wa", "w:ataa", "w:kum", "w:i"], g: { en: "and obey me", ur: "اور میری اطاعت کرو" } },
  ],
  "51:15": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "المتقين", w: ["w:al", "w:muttaqi"], g: { en: "the mindful ones", ur: "پرہیزگار" }, pieces: [p("الْ", "the", "وہ"), p("مُتَّقِي", "one who guards himself — مُ in front of اِتَّقَى", "بچ کر چلنے والا — اِتَّقَى کے آگے مُ"), p("ـِينَ", "many", "کئی")] },
    { ar: "في", w: ["w:fi"], g: { en: "are in", ur: "میں ہوں گے" } },
    { ar: "جنت", w: ["w:jannah"], g: { en: "gardens", ur: "باغوں" } },
    { ar: "وعيون", w: ["w:wa", "w:ayn"], g: { en: "and springs", ur: "اور چشموں" } },
  ],
  "75:18": [
    { ar: "فاذا", w: ["w:fa", "w:idha"], g: { en: "So when", ur: "تو جب" } },
    { ar: "قرانه", w: ["w:qaraa", "w:na", "w:hu"], g: { en: "We have recited it", ur: "ہم اسے پڑھ چکیں" } },
    { ar: "فاتبع", w: ["w:fa", "w:ittabaa"], g: { en: "then follow", ur: "تو پیروی کرو" }, pieces: [p("فَ", "then", "تو"), p("اِتَّبِعْ", "follow! — تَبِعَ go after + the تَ of اِفْتَعَلَ (تْ and تَ join as تّ)", "پیروی کرو — تَبِعَ پیچھے جانا + اِفْتَعَلَ کا تَ (دونوں ت مل کر تّ)")] },
    { ar: "قرانه", w: ["w:quran", "w:hu"], g: { en: "its recitation", ur: "اس کے پڑھنے کی" } },
  ],
  "73:19": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "هذه", w: ["w:hadhihi"], g: { en: "this", ur: "یہ" } },
    { ar: "تذكرة", given: true, pic: "🧵", art: "w:dhakkara", g: { en: "is a reminder", ur: "ایک نصیحت ہے" } },
    { ar: "فمن", w: ["w:fa", "w:man"], g: { en: "so whoever", ur: "تو جو" } },
    { ar: "شاء", w: ["w:shaa"], g: { en: "wishes", ur: "چاہے" } },
    { ar: "اتخذ", w: ["w:ittakhadha"], g: { en: "takes", ur: "اختیار کر لے" }, pieces: [p("اِتَّخَذَ", "took for himself — أَخَذَ take + the تَ of اِفْتَعَلَ (أ and تَ join as تّ)", "اپنے لیے لے لیا — أَخَذَ لینا + اِفْتَعَلَ کا تَ (أ اور تَ مل کر تّ)")] },
    { ar: "الى", w: ["w:ila"], g: { en: "to", ur: "طرف" } },
    { ar: "ربه", w: ["w:rabb", "w:hu"], g: { en: "his Lord", ur: "اپنے رب کی" } },
    { ar: "سبيلا", w: ["w:sabil"], g: { en: "a way", ur: "راستہ" } },
  ],
  "78:3": [
    { ar: "الذي", w: ["w:alladhi"], note: "الَّذِي pointing back to a thing: (the news) about which", g: { en: "about which", ur: "جس میں" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "فيه", w: ["w:fi", "w:hu"], g: { en: "in it", ur: "اس میں" } },
    { ar: "مختلفون", w: ["w:mukhtalif"], g: { en: "differ", ur: "اختلاف کر رہے ہیں" }, pieces: [p("مُخْتَلِف", "differing — مُ in front of اِخْتَلَفَ", "اختلاف کرنے والا — اِخْتَلَفَ کے آگے مُ"), p("ـُونَ", "many", "کئی")] },
  ],
  "22:69": [
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "يحكم", w: ["w:hakama"], g: { en: "will judge", ur: "فیصلہ کرے گا" } },
    { ar: "بينكم", w: ["w:bayna", "w:kum"], g: { en: "between you", ur: "تمہارے درمیان" } },
    { ar: "يوم", w: ["w:yawm"], g: { en: "on the Day", ur: "دن" } },
    { ar: "القيمة", w: ["w:al", "w:qiyama"], g: { en: "of Rising", ur: "قیامت کے" } },
    { ar: "فيما", w: ["w:fi", "w:ma"], g: { en: "about what", ur: "اس بارے میں جس میں" } },
    { ar: "كنتم", w: ["w:kana", "w:kum"], g: { en: "you used to", ur: "تم" } },
    { ar: "فيه", w: ["w:fi", "w:hu"], g: { en: "in it", ur: "اس میں" } },
    { ar: "تختلفون", w: ["w:ikhtalafa", "w:kum"], g: { en: "differ", ur: "اختلاف کرتے تھے" }, pieces: [p("تَخْتَلِفُ", "you differ — خَلْف behind + the تَ of اِفْتَعَلَ: go different ways", "تم اختلاف کرتے ہو — خَلْف پیچھے + اِفْتَعَلَ کا تَ: الگ الگ راہ لینا"), p("ـُونَ", "you all", "تم سب")] },
  ],
  "26:25": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "اس نے کہا" } },
    { ar: "لمن", w: ["w:li", "w:man"], g: { en: "to those", ur: "ان سے جو" } },
    { ar: "حوله", w: ["w:hawla", "w:hu"], g: { en: "around him", ur: "اس کے ارد گرد تھے" } },
    { ar: "الا", w: ["w:a", "w:la"], g: { en: "Do you not", ur: "کیا تم نہیں" } },
    { ar: "تستمعون", w: ["w:istamaa", "w:kum"], g: { en: "listen?", ur: "سنتے؟" }, pieces: [p("تَسْتَمِعُ", "you listen — سَمِعَ hear + the تَ of اِفْتَعَلَ: hear on purpose, listen", "تم کان لگا کر سنتے ہو — سَمِعَ سننا + اِفْتَعَلَ کا تَ: ارادے سے سننا"), p("ـُونَ", "you all", "تم سب")] },
  ],

  // ---- Wing 5 · Take-For-Yourself Verbs 2 ----
  "20:82": [
    { ar: "واني", w: ["w:wa", "w:inna", "w:i"], g: { en: "And indeed I am", ur: "اور بے شک میں" } },
    { ar: "لغفار", w: ["w:la_surely", "w:ghaffar"], g: { en: "surely Most Forgiving", ur: "ضرور بہت بخشنے والا ہوں" } },
    { ar: "لمن", w: ["w:li", "w:man"], g: { en: "to whoever", ur: "اس کے لیے جو" } },
    { ar: "تاب", w: ["w:taba"], g: { en: "turns back", ur: "توبہ کرے" } },
    { ar: "وامن", w: ["w:wa", "w:amana"], g: { en: "and believes", ur: "اور ایمان لائے" } },
    { ar: "وعمل", w: ["w:wa", "w:amila"], g: { en: "and does", ur: "اور کرے" } },
    { ar: "صلحا", w: ["w:salih"], g: { en: "good", ur: "نیک عمل" } },
    { ar: "ثم", w: ["w:thumma"], g: { en: "then", ur: "پھر" } },
    { ar: "اهتدى", w: ["w:ihtada"], g: { en: "stays on the right way", ur: "سیدھی راہ پر رہے" }, pieces: [p("اِهْتَدَى", "found the way — هَدَى guide + the تَ of اِفْتَعَلَ: take the guidance for yourself", "راہ پا لی — هَدَى راہ دکھانا + اِفْتَعَلَ کا تَ: ہدایت خود اپنا لینا")] },
  ],
  "36:21": [
    { ar: "اتبعوا", w: ["w:ittabaa", "w:kum"], g: { en: "Follow", ur: "پیروی کرو" }, pieces: [p("اِتَّبِعُ", "follow — the اِفْتَعَلَ mould", "پیروی کرو — اِفْتَعَلَ کا سانچا"), p("ـوا", "you all (command)", "تم سب (حکم)")] },
    { ar: "من", w: ["w:man"], g: { en: "those who", ur: "ان کی جو" } },
    { ar: "لا", w: ["w:la"], g: { en: "do not", ur: "نہیں" } },
    { ar: "يسلكم", w: ["w:saala", "w:kum"], g: { en: "ask you", ur: "تم سے مانگتے" } },
    { ar: "اجرا", w: ["w:ajr"], g: { en: "for any reward", ur: "کوئی اجر" } },
    { ar: "وهم", w: ["w:wa", "w:humu"], g: { en: "and they", ur: "اور وہ (سب)" } },
    { ar: "مهتدون", w: ["w:muhtadi"], g: { en: "are rightly guided", ur: "ہدایت یافتہ ہیں" }, pieces: [p("مُهْتَدِي", "one who found the way — مُ in front of اِهْتَدَى", "راہ پانے والا — اِهْتَدَى کے آگے مُ"), p("ـُونَ", "many", "کئی")] },
  ],
  "35:19": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "يستوي", w: ["w:istawa"], g: { en: "equal are", ur: "برابر ہوتے" }, pieces: [p("يَسْتَوِي", "is equal — سَوَاء equal + the تَ of اِفْتَعَلَ: become level, be equal", "برابر ہوتا ہے — سَوَاء برابر + اِفْتَعَلَ کا تَ: برابر ہو جانا")] },
    { ar: "الاعمى", w: ["w:al", "w:ama"], g: { en: "the blind", ur: "اندھا" } },
    { ar: "والبصير", given: true, pic: "🧿", art: "w:basar", g: { en: "and the seeing", ur: "اور دیکھنے والا" } },
  ],
  "3:177": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "جن لوگوں نے" } },
    { ar: "اشتروا", w: ["w:ishtara", "w:hum"], g: { en: "bought", ur: "خریدا" }, pieces: [p("اِشْتَرَ", "bought — trade one thing for another, the اِفْتَعَلَ mould", "خریدا — ایک چیز دے کر دوسری لینا، اِفْتَعَلَ کا سانچا"), p("ـوا", "they", "انہوں نے")] },
    { ar: "الكفر", w: ["w:al", "w:kufr"], g: { en: "disbelief", ur: "کفر" } },
    { ar: "بالايمن", w: ["w:bi", "w:al", "w:iman"], g: { en: "for faith", ur: "ایمان کے بدلے" } },
    { ar: "لن", w: ["w:lan"], g: { en: "will never", ur: "ہرگز نہیں" } },
    { ar: "يضروا", w: ["w:yadurru", "w:hum"], g: { en: "harm", ur: "نقصان پہنچا سکیں گے" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ کو" } },
    { ar: "شيا", w: ["w:shay"], note: "شَيْئًا after 'not': (not) a thing = at all", g: { en: "at all", ur: "کچھ بھی" } },
    { ar: "ولهم", w: ["w:wa", "w:li", "w:hum"], g: { en: "and for them is", ur: "اور ان کے لیے ہے" } },
    { ar: "عذاب", w: ["w:azab"], g: { en: "a punishment", ur: "عذاب" } },
    { ar: "اليم", w: ["w:alim_pain"], g: { en: "painful", ur: "دردناک" } },
  ],
  "10:69": [
    { ar: "قل", w: ["w:qala"], g: { en: "Say", ur: "کہہ دو" } },
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "جو لوگ" } },
    { ar: "يفترون", w: ["w:iftara", "w:hum"], g: { en: "make up", ur: "گھڑتے ہیں" }, pieces: [p("يَفْتَرِ", "make up — the اِفْتَعَلَ mould: cut out a story yourself", "گھڑتے ہیں — اِفْتَعَلَ کا سانچا: اپنی طرف سے بات بنانا"), p("ـُونَ", "they", "وہ")] },
    { ar: "على", w: ["w:ala"], g: { en: "about", ur: "پر" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "الكذب", w: ["w:al", "w:kidhb"], g: { en: "lies", ur: "جھوٹ" } },
    { ar: "لا", w: ["w:la"], g: { en: "will not", ur: "نہیں" } },
    { ar: "يفلحون", w: ["w:aflaha", "w:hum"], g: { en: "succeed", ur: "کامیاب ہوں گے" } },
  ],
  "2:192": [
    { ar: "فان", w: ["w:fa", "w:in_if"], g: { en: "But if", ur: "پھر اگر" } },
    { ar: "انتهوا", w: ["w:intaha", "w:hum"], g: { en: "they stop", ur: "وہ باز آ جائیں" }, pieces: [p("اِنْتَهَ", "stopped — the تَ of اِفْتَعَلَ sits after the first letter ن", "رک گئے — اِفْتَعَلَ کا تَ پہلے حرف ن کے بعد"), p("ـوْا", "they", "وہ")] },
    { ar: "فان", w: ["w:fa", "w:inna"], g: { en: "then indeed", ur: "تو بے شک" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah is", ur: "اللہ" } },
    { ar: "غفور", w: ["w:ghafur"], g: { en: "Forgiving", ur: "بخشنے والا" } },
    { ar: "رحيم", w: ["w:rahim"], g: { en: "Merciful", ur: "رحم کرنے والا ہے" } },
  ],
  "92:20": [
    { ar: "الا", w: ["w:illa"], g: { en: "but only", ur: "مگر صرف" } },
    { ar: "ابتغاء", w: ["w:ibtagha"], g: { en: "seeking", ur: "چاہنے کے لیے" }, pieces: [p("اِبْتِغَاء", "seeking — the doing-word of اِبْتَغَى", "چاہنا، تلاش — اِبْتَغَى کا مصدر")] },
    { ar: "وجه", w: ["w:wajh"], g: { en: "the Face", ur: "چہرہ (رضا)" } },
    { ar: "ربه", w: ["w:rabb", "w:hu"], g: { en: "of his Lord", ur: "اپنے رب کی" } },
    { ar: "الاعلى", w: ["w:al", "w:ala_more"], g: { en: "the Most High", ur: "جو سب سے بلند ہے" } },
  ],

  // ---- Wing 5 · Asking Verbs 1 ----
  "71:10": [
    { ar: "فقلت", w: ["w:fa", "w:qala", "w:i"], g: { en: "And I said", ur: "تو میں نے کہا" } },
    { ar: "استغفروا", w: ["w:istaghfara", "w:kum"], g: { en: "Ask forgiveness of", ur: "بخشش مانگو" }, pieces: [p("اِسْتَغْفِرُ", "ask forgiveness — غَفَرَ forgive + اِسْتَ in front: ask for it", "بخشش مانگو — غَفَرَ بخشنا + آگے اِسْتَ: مانگنا"), p("ـوا", "you all (command)", "تم سب (حکم)")] },
    { ar: "ربكم", w: ["w:rabb", "w:kum"], g: { en: "your Lord", ur: "اپنے رب سے" } },
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "indeed He", ur: "بے شک وہ" } },
    { ar: "كان", w: ["w:kana"], g: { en: "is ever", ur: "ہے" } },
    { ar: "غفارا", w: ["w:ghaffar"], g: { en: "Most Forgiving", ur: "بہت بخشنے والا" } },
  ],
  "6:36": [
    { ar: "انما", w: ["w:inna", "w:ma"], note: "إِنَّمَا (إِنَّ + مَا) means 'only'", g: { en: "Only", ur: "صرف" } },
    { ar: "يستجيب", w: ["w:istajaba"], g: { en: "respond", ur: "جواب دیتے (مانتے) ہیں" }, pieces: [p("يَسْتَجِيبُ", "responds — أَجَابَ answer + اِسْتَ: answer the call", "جواب دیتا ہے — أَجَابَ جواب دینا + اِسْتَ: پکار پر لبیک کہنا")] },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "وہ جو" } },
    { ar: "يسمعون", w: ["w:samia", "w:hum"], note: "سَمِعَ hear: here, those who listen", g: { en: "listen", ur: "سنتے ہیں" } },
    { ar: "والموتى", w: ["w:wa", "w:al", "w:mayyit"], g: { en: "And the dead", ur: "اور مردوں کو" } },
    { ar: "يبعثهم", w: ["w:baatha", "w:hum"], g: { en: "will raise them", ur: "اٹھائے گا" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "ثم", w: ["w:thumma"], g: { en: "then", ur: "پھر" } },
    { ar: "اليه", w: ["w:ila", "w:hu"], g: { en: "to Him", ur: "اسی کی طرف" } },
    { ar: "يرجعون", w: ["w:rajaa", "w:hum"], g: { en: "they will be returned", ur: "وہ لوٹائے جائیں گے" } },
  ],
  "18:67": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "اس نے کہا" } },
    { ar: "انك", w: ["w:inna", "w:ka"], g: { en: "Indeed you", ur: "بے شک تم" } },
    { ar: "لن", w: ["w:lan"], g: { en: "will never", ur: "ہرگز نہیں" } },
    { ar: "تستطيع", w: ["w:istataa"], g: { en: "be able (to have)", ur: "کر سکو گے" }, pieces: [p("تَسْتَطِيعُ", "you are able — the اِسْتَفْعَلَ mould: find the strength in you", "تم کر سکتے ہو — اِسْتَفْعَلَ کا سانچا: اپنے اندر طاقت پانا")] },
    { ar: "معي", w: ["w:maa", "w:i"], g: { en: "with me", ur: "میرے ساتھ" } },
    { ar: "صبرا", w: ["w:sabr"], g: { en: "patience", ur: "صبر" } },
  ],
  "81:28": [
    { ar: "لمن", w: ["w:li", "w:man"], g: { en: "For whoever", ur: "اس کے لیے جو" } },
    { ar: "شاء", w: ["w:shaa"], g: { en: "wishes", ur: "چاہے" } },
    { ar: "منكم", w: ["w:min", "w:kum"], g: { en: "among you", ur: "تم میں سے" } },
    { ar: "ان", w: ["w:an_to"], g: { en: "to", ur: "کہ" } },
    { ar: "يستقيم", w: ["w:istaqama"], g: { en: "go straight", ur: "سیدھا چلے" }, pieces: [p("يَسْتَقِيمُ", "stands straight — قَامَ stand + اِسْتَ: stand up straight and stay so", "سیدھا رہتا ہے — قَامَ کھڑا ہونا + اِسْتَ: سیدھا کھڑا رہنا")] },
  ],
  "26:204": [
    { ar: "افبعذابنا", w: ["w:a", "w:fa", "w:bi", "w:azab", "w:na"], g: { en: "Is it for Our punishment", ur: "تو کیا ہمارے عذاب کی" } },
    { ar: "يستعجلون", w: ["w:istajala", "w:hum"], g: { en: "they ask to hurry?", ur: "وہ جلدی مچاتے ہیں؟" }, pieces: [p("يَسْتَعْجِلُ", "ask to hurry — اِسْتَ in front: ask for it fast", "جلدی مانگتے ہیں — آگے اِسْتَ: جلدی طلب کرنا"), p("ـُونَ", "they", "وہ")] },
  ],

  // ---- Wing 5 · Asking Verbs 2 ----
  "7:76": [
    { ar: "قال", w: ["w:qala"], g: { en: "Said", ur: "کہا" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "ان لوگوں نے جو" } },
    { ar: "استكبروا", w: ["w:istakbara", "w:hum"], g: { en: "were arrogant", ur: "بڑے بنے" }, pieces: [p("اِسْتَكْبَرُ", "thought themselves big — أَكْبَر bigger + اِسْتَ: count yourself big", "اپنے آپ کو بڑا سمجھا — أَكْبَر بڑا + اِسْتَ: خود کو بڑا گننا"), p("ـوا", "they", "انہوں نے")] },
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed we", ur: "بے شک ہم" } },
    { ar: "بالذي", w: ["w:bi", "w:alladhi"], note: "بِ + الَّذِي pointing back to a thing: in what", g: { en: "in what", ur: "اس کا جس پر" } },
    { ar: "امنتم", w: ["w:amana", "w:kum"], g: { en: "you believe", ur: "تم ایمان لائے" } },
    { ar: "به", w: ["w:bi", "w:hu"], g: { en: "in it", ur: "اس پر" } },
    { ar: "كفرون", w: ["w:kafir"], g: { en: "are disbelievers", ur: "انکار کرنے والے ہیں" } },
  ],
  "15:11": [
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "ياتيهم", w: ["w:ata", "w:hum"], g: { en: "came to them", ur: "آیا ان کے پاس" } },
    { ar: "من", w: ["w:min"], note: "مِنْ after 'not': any (at all)", g: { en: "any", ur: "کوئی" } },
    { ar: "رسول", w: ["w:rasul"], g: { en: "messenger", ur: "رسول" } },
    { ar: "الا", w: ["w:illa"], g: { en: "but", ur: "مگر" } },
    { ar: "كانوا", w: ["w:kana", "w:hum"], g: { en: "they used to", ur: "وہ" } },
    { ar: "به", w: ["w:bi", "w:hu"], g: { en: "him", ur: "اس کا" } },
    { ar: "يستهزءون", w: ["w:istahzaa", "w:hum"], g: { en: "mock", ur: "مذاق اڑاتے تھے" }, pieces: [p("يَسْتَهْزِءُ", "mock — the اِسْتَفْعَلَ mould", "مذاق اڑاتے ہیں — اِسْتَفْعَلَ کا سانچا"), p("ـُونَ", "they", "وہ")] },
  ],
  "36:38": [
    { ar: "والشمس", w: ["w:wa", "w:al", "w:shams"], g: { en: "And the sun", ur: "اور سورج" } },
    { ar: "تجري", w: ["w:jara"], g: { en: "runs", ur: "چل رہا ہے" } },
    { ar: "لمستقر", w: ["w:li", "w:istaqarra"], g: { en: "toward a resting place", ur: "ٹھکانے کی طرف" }, pieces: [p("لِ", "toward", "طرف"), p("مُسْتَقَرّ", "resting place — مُ in front of اِسْتَقَرَّ settle", "ٹھہرنے کی جگہ — اِسْتَقَرَّ کے آگے مُ")] },
    { ar: "لها", w: ["w:li", "w:ha"], g: { en: "of its own", ur: "اپنے" } },
    { ar: "ذلك", w: ["w:dhalika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "That is", ur: "یہ" } },
    { ar: "تقدير", w: ["w:taqdir"], g: { en: "the measuring", ur: "اندازہ" } },
    { ar: "العزيز", w: ["w:al", "w:aziz"], g: { en: "of the Almighty", ur: "زبردست" } },
    { ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب جاننے والے کا" } },
  ],
  "2:2": [
    { ar: "ذلك", w: ["w:dhalika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "That is", ur: "یہ" } },
    { ar: "الكتب", w: ["w:al", "w:kitab"], g: { en: "the Book", ur: "کتاب" } },
    { ar: "لا", w: ["w:la"], g: { en: "no", ur: "کوئی نہیں" } },
    { ar: "ريب", w: ["w:rayb"], g: { en: "doubt", ur: "شک" } },
    { ar: "فيه", w: ["w:fi", "w:hu"], g: { en: "in it", ur: "اس میں" } },
    { ar: "هدى", w: ["w:huda"], g: { en: "a guidance", ur: "ہدایت ہے" }, pieces: [p("هُدًى", "guidance — from هَدَى guide (اهْدِ, اِهْتَدَى)", "ہدایت — هَدَى سے (اهْدِ، اِهْتَدَى)")] },
    { ar: "للمتقين", w: ["w:li", "w:al", "w:muttaqi"], g: { en: "for the mindful", ur: "پرہیزگاروں کے لیے" } },
  ],

  // ---- Wing 5 · Verb Partners 1 ----
  "36:13": [
    { ar: "واضرب", w: ["w:wa", "w:daraba"], g: { en: "And set forth", ur: "اور بیان کرو" }, pieces: [p("وَ", "and", "اور"), p("اِضْرِبْ", "strike! — with لِ and مَثَلًا: set forth an example", "مارو — لِ اور مَثَلًا کے ساتھ: مثال بیان کرو")] },
    { ar: "لهم", w: ["w:li", "w:hum"], g: { en: "for them", ur: "ان کے لیے" } },
    { ar: "مثلا", w: ["w:mathal"], g: { en: "an example:", ur: "ایک مثال" } },
    { ar: "اصحب", w: ["w:ashab"], g: { en: "the people", ur: "والوں کی" } },
    { ar: "القرية", w: ["w:al", "w:qarya"], g: { en: "of the town", ur: "بستی" } },
    { ar: "اذ", w: ["w:idh"], g: { en: "when", ur: "جب" } },
    { ar: "جاءها", w: ["w:jaa", "w:ha"], g: { en: "came to it", ur: "اس میں آئے" } },
    { ar: "المرسلون", w: ["w:al", "w:mursal"], g: { en: "the messengers", ur: "رسول" } },
  ],
  "2:52": [
    { ar: "ثم", w: ["w:thumma"], g: { en: "Then", ur: "پھر" } },
    { ar: "عفونا", w: ["w:afa", "w:na"], g: { en: "We pardoned", ur: "ہم نے معاف کر دیا" }, pieces: [p("عَفَوْ", "pardoned — عَفَا + عَنْ: let go of someone's wrong", "معاف کیا — عَفَا + عَنْ: کسی کی غلطی سے درگزر"), p("ـنَا", "We", "ہم نے")] },
    { ar: "عنكم", w: ["w:an", "w:kum"], note: "عَنْ with عَفَا: pardon (from) you; English says only 'you'", g: { en: "you", ur: "تمہیں" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "بعد", w: ["w:bada"], g: { en: "after", ur: "بعد" } },
    { ar: "ذلك", w: ["w:dhalika"], g: { en: "that", ur: "اس کے" } },
    { ar: "لعلكم", w: ["w:laalla", "w:kum"], g: { en: "so that you might", ur: "تاکہ تم" } },
    { ar: "تشكرون", w: ["w:shakara", "w:kum"], g: { en: "be thankful", ur: "شکر کرو" } },
  ],
  "27:78": [
    { ar: "ان", w: ["w:inna"], g: { en: "Indeed", ur: "بے شک" } },
    { ar: "ربك", w: ["w:rabb", "w:ka"], g: { en: "your Lord", ur: "تمہارا رب" } },
    { ar: "يقضي", w: ["w:qada"], g: { en: "will judge", ur: "فیصلہ کرے گا" }, pieces: [p("يَقْضِي", "decides — قَضَى + بَيْنَ: judge between", "فیصلہ کرتا ہے — قَضَى + بَيْنَ: کے درمیان فیصلہ کرنا")] },
    { ar: "بينهم", w: ["w:bayna", "w:hum"], g: { en: "between them", ur: "ان کے درمیان" } },
    { ar: "بحكمه", w: ["w:bi", "w:hukm", "w:hu"], g: { en: "by His judgement", ur: "اپنے حکم سے" } },
    { ar: "وهو", w: ["w:wa", "w:huwa"], g: { en: "and He is", ur: "اور وہ" } },
    { ar: "العزيز", w: ["w:al", "w:aziz"], g: { en: "the Almighty", ur: "زبردست" } },
    { ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب جاننے والا ہے" } },
  ],
  "94:2": [
    { ar: "ووضعنا", w: ["w:wa", "w:wadaa", "w:na"], note: "وَضَعَ عَنْ: put down from = lifted off", g: { en: "And We lifted", ur: "اور ہم نے اتار دیا" }, pieces: [p("وَ", "and", "اور"), p("وَضَعْ", "put down — وَضَعَ + عَنْ: lift a load off someone", "رکھا — وَضَعَ + عَنْ: کسی سے بوجھ اتار دینا"), p("ـنَا", "We", "ہم نے")] },
    { ar: "عنك", w: ["w:an", "w:ka"], g: { en: "from you", ur: "تم سے" } },
    { ar: "وزرك", w: ["w:wizr", "w:ka"], g: { en: "your burden", ur: "تمہارا بوجھ" } },
  ],

  // ---- Wing 5 · Verb Partners 2 ----
  "7:112": [
    { ar: "ياتوك", w: ["w:ata", "w:hum", "w:ka"], note: "أَتَى + بِ: come with = bring", g: { en: "they will bring you", ur: "وہ تمہارے پاس لے آئیں" }, pieces: [p("يَأْتُو", "they come — أَتَى + بِ: bring", "وہ آئیں — أَتَى + بِ: لے آنا"), p("ـكَ", "to you", "تمہارے پاس")] },
    { ar: "بكل", w: ["w:bi", "w:kull"], g: { en: "every", ur: "ہر" } },
    { ar: "سحر", w: ["w:sahir"], g: { en: "magician", ur: "جادوگر" } },
    { ar: "عليم", given: true, pic: "💡📘", art: "w:alima", g: { en: "skilled", ur: "ماہر" } },
  ],
  "55:20": [
    { ar: "بينهما", w: ["w:bayna", "w:huma_end"], g: { en: "Between them", ur: "ان دونوں کے درمیان" } },
    { ar: "برزخ", given: true, pic: "🌊", art: "g:barrier", g: { en: "is a barrier", ur: "ایک آڑ ہے" } },
    { ar: "لا", w: ["w:la"], g: { en: "not", ur: "نہیں" } },
    { ar: "يبغيان", w: ["w:bagha", "w:huma_end"], note: "بَغَى go too far: the two seas do not overstep", g: { en: "they overstep", ur: "وہ دونوں حد سے بڑھتے" }, pieces: [p("يَبْغِي", "goes too far — بَغَى", "حد سے بڑھتا ہے — بَغَى"), p("ـَانِ", "the two of them", "وہ دونوں")] },
  ],
  "26:15": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "فرمایا" } },
    { ar: "كلا", w: ["w:kalla"], g: { en: "No!", ur: "ہرگز نہیں" } },
    { ar: "فاذهبا", w: ["w:fa", "w:dhahaba", "w:kuma"], g: { en: "So go, both of you,", ur: "تو تم دونوں جاؤ" }, pieces: [p("فَ", "so", "تو"), p("اِذْهَبَا", "go, you two — ذَهَبَ + بِ: go with, take along", "تم دونوں جاؤ — ذَهَبَ + بِ: ساتھ لے کر جانا")] },
    { ar: "بايتنا", w: ["w:bi", "w:aya", "w:na"], g: { en: "with Our signs", ur: "ہماری نشانیاں لے کر" } },
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم" } },
    { ar: "معكم", w: ["w:maa", "w:kum"], g: { en: "are with you,", ur: "تمہارے ساتھ" } },
    { ar: "مستمعون", w: ["w:istamaa"], g: { en: "listening", ur: "سن رہے ہیں" } },
  ],
  "26:30": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "کہا" } },
    { ar: "اولو", w: ["w:a", "w:wa", "w:law"], g: { en: "Even if", ur: "کیا اگرچہ" } },
    { ar: "جئتك", w: ["w:jaa", "w:i", "w:ka"], note: "جَاءَ + بِ: come with = bring", g: { en: "I bring you", ur: "میں تمہارے پاس لے آؤں" }, pieces: [p("جِئْتُ", "I came — جَاءَ + بِ: bring", "میں آیا — جَاءَ + بِ: لے آنا"), p("ـكَ", "to you", "تمہارے پاس")] },
    { ar: "بشيء", w: ["w:bi", "w:shay"], g: { en: "something", ur: "کوئی چیز" } },
    { ar: "مبين", w: ["w:mubin"], g: { en: "clear?", ur: "واضح؟" } },
  ],
  "5:74": [
    { ar: "افلا", w: ["w:a", "w:fa", "w:la"], g: { en: "So will they not", ur: "تو کیا وہ نہیں" } },
    { ar: "يتوبون", w: ["w:taba", "w:hum"], g: { en: "turn back", ur: "توبہ کرتے" }, pieces: [p("يَتُوبُ", "turns back — تَابَ + إِلَى: turn back to Allah in repentance", "لوٹتا ہے — تَابَ + إِلَى: اللہ کی طرف توبہ کر کے لوٹنا"), p("ـُونَ", "they", "وہ")] },
    { ar: "الى", w: ["w:ila"], g: { en: "to", ur: "کی طرف" } },
    { ar: "الله", w: ["w:allah"], g: { en: "Allah", ur: "اللہ" } },
    { ar: "ويستغفرونه", w: ["w:wa", "w:istaghfara", "w:hum", "w:hu"], g: { en: "and ask His forgiveness?", ur: "اور اس سے بخشش مانگتے؟" } },
    { ar: "والله", w: ["w:wa", "w:allah"], g: { en: "And Allah is", ur: "اور اللہ" } },
    { ar: "غفور", w: ["w:ghafur"], g: { en: "Forgiving", ur: "بخشنے والا" } },
    { ar: "رحيم", w: ["w:rahim"], g: { en: "Merciful", ur: "رحم کرنے والا ہے" } },
  ],
  "2:160": [
    { ar: "الا", w: ["w:illa"], g: { en: "Except", ur: "سوائے" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "ان کے جنہوں نے" } },
    { ar: "تابوا", w: ["w:taba", "w:hum"], g: { en: "turned back", ur: "توبہ کی" } },
    { ar: "واصلحوا", w: ["w:wa", "w:aslaha", "w:hum"], g: { en: "and put things right", ur: "اور اصلاح کی" } },
    { ar: "وبينوا", w: ["w:wa", "w:bayyana", "w:hum"], g: { en: "and made clear", ur: "اور کھول کر بیان کیا" } },
    { ar: "فاولئك", w: ["w:fa", "w:ulaika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "those", ur: "تو یہی لوگ ہیں" } },
    { ar: "اتوب", w: ["w:taba"], g: { en: "I turn in mercy", ur: "میں توبہ قبول کرتا ہوں" }, pieces: [p("أَتُوبُ", "I turn — تَابَ + عَلَى: turn to someone in mercy, accept their repentance", "میں رجوع کرتا ہوں — تَابَ + عَلَى: رحمت سے متوجہ ہونا، توبہ قبول کرنا")] },
    { ar: "عليهم", w: ["w:ala", "w:hum"], note: "عَلَى with تَابَ: (turn in mercy) to them", g: { en: "to them", ur: "جن کی" } },
    { ar: "وانا", w: ["w:wa", "w:ana"], g: { en: "and I am", ur: "اور میں" } },
    { ar: "التواب", w: ["w:al", "w:tawwab"], g: { en: "the Accepter of repentance", ur: "بہت توبہ قبول کرنے والا" } },
    { ar: "الرحيم", w: ["w:al", "w:rahim"], g: { en: "the Merciful", ur: "رحم کرنے والا ہوں" } },
  ],

  // ---- Wing 5 · Verb Tables (booklet pp. 39–42) ----
  "56:35": [
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "Indeed We", ur: "بے شک ہم نے" } },
    { ar: "انشانهن", w: ["w:anshaa", "w:na", "w:hunna_end"], g: { en: "produced them (women)", ur: "انہیں (عورتوں کو) پیدا کیا" }, pieces: [p("أَنْشَأْ", "produced", "پیدا کیا"), p("ـنَا", "We", "ہم نے"), p("ـهُنَّ", "them — many women (the هُنَّ row of the table)", "انہیں — کئی عورتیں (نقشے کی هُنَّ والی صف)")] },
    { ar: "انشاء", w: ["w:anshaa"], note: "إِنْشَاء is the action noun of أَنْشَأَ: a (new) creation", g: { en: "in a new creation", ur: "نئے سرے سے" } },
  ],
  "51:30": [
    { ar: "قالوا", w: ["w:qala", "w:hum"], g: { en: "They said", ur: "انہوں نے کہا" } },
    { ar: "كذلك", w: ["w:ka_like", "w:dhalika"], g: { en: "Like that", ur: "اسی طرح" } },
    { ar: "قال", w: ["w:qala"], g: { en: "has said", ur: "فرمایا ہے" } },
    { ar: "ربك", w: ["w:rabb", "w:ki"], g: { en: "your Lord (to a woman)", ur: "تمہارے رب نے (ایک عورت سے)" }, pieces: [p("رَبُّ", "Lord", "رب"), p("ـكِ", "your — one woman (كِ, not كَ)", "تمہارا — ایک عورت (كِ، كَ نہیں)")] },
    { ar: "انه", w: ["w:inna", "w:hu"], g: { en: "Indeed He", ur: "بے شک وہ" } },
    { ar: "هو", w: ["w:huwa"], note: "هُوَ between two parts of a sentence: 'He is'", g: { en: "is", ur: "ہی" } },
    { ar: "الحكيم", w: ["w:al", "w:hakim"], g: { en: "the All-Wise", ur: "حکمت والا" } },
    { ar: "العليم", w: ["w:al", "w:alim"], g: { en: "the All-Knowing", ur: "سب جاننے والا ہے" } },
  ],
  "20:49": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "اس نے کہا" } },
    { ar: "فمن", w: ["w:fa", "w:man"], g: { en: "So who is", ur: "تو کون ہے" } },
    { ar: "ربكما", w: ["w:rabb", "w:kuma"], g: { en: "the Lord of you two", ur: "تم دونوں کا رب" }, pieces: [p("رَبُّ", "Lord", "رب"), p("ـكُمَا", "of you two (the two-people row)", "تم دونوں کا (دو والی صف)")] },
    { ar: "يموسى", w: ["w:ya", "w:musa"], g: { en: "O Musa?", ur: "اے موسیٰ؟" } },
  ],
  "26:16": [
    { ar: "فاتيا", w: ["w:fa", "w:ata", "w:kuma"], note: "أَتَى with a person: come to = go to", g: { en: "So go, you two, to", ur: "تو تم دونوں جاؤ" }, pieces: [p("فَ", "so", "تو"), p("أْتِيَا", "come, you two! — the command for two (اِفْعَلَا)", "تم دونوں آؤ — دو کے لیے حکم (اِفْعَلَا)")] },
    { ar: "فرعون", w: ["w:firawn"], g: { en: "Pharaoh", ur: "فرعون کے پاس" } },
    { ar: "فقولا", w: ["w:fa", "w:qala", "w:kuma"], g: { en: "and say, you two:", ur: "اور تم دونوں کہو" }, pieces: [p("فَ", "and", "اور"), p("قُولَا", "say, you two! (اِفْعَلَا)", "تم دونوں کہو (اِفْعَلَا)")] },
    { ar: "انا", w: ["w:inna", "w:na"], g: { en: "We are", ur: "بے شک ہم" } },
    { ar: "رسول", w: ["w:rasul"], g: { en: "the messenger", ur: "رسول ہیں" } },
    { ar: "رب", w: ["w:rabb"], g: { en: "of the Lord", ur: "رب کے" } },
    { ar: "العلمين", w: ["w:al", "w:alam"], g: { en: "of the worlds", ur: "تمام جہانوں کے" } },
  ],
  "20:46": [
    { ar: "قال", w: ["w:qala"], g: { en: "He said", ur: "فرمایا" } },
    { ar: "لا", w: ["w:la"], g: { en: "Do not", ur: "نہ" } },
    { ar: "تخافا", w: ["w:khafa", "w:kuma"], g: { en: "fear, you two", ur: "ڈرو تم دونوں" }, pieces: [p("تَخَافَا", "you two fear — with لَا in front: don't, you two (لَا تَفْعَلَا)", "تم دونوں ڈرو — آگے لَا: تم دونوں نہ کرو (لَا تَفْعَلَا)")] },
    { ar: "انني", w: ["w:inna", "w:i"], g: { en: "Indeed I am", ur: "بے شک میں" } },
    { ar: "معكما", w: ["w:maa", "w:kuma"], g: { en: "with you two,", ur: "تم دونوں کے ساتھ ہوں" } },
    { ar: "اسمع", w: ["w:samia"], g: { en: "I hear", ur: "سنتا ہوں" } },
    { ar: "وارى", w: ["w:wa", "w:raa"], g: { en: "and I see", ur: "اور دیکھتا ہوں" } },
  ],

  // ---- Reading Room 1 · Surah Al-Ikhlas: every word taught (the Wing 1 rooms keep their "given" helper words) ----
  "112:1/read": [
    { ar: "قل", w: ["w:qala"], g: { en: "Say", ur: "کہہ دو" }, pieces: [p("قُلْ", "say! — the command of قَالَ", "کہو — قَالَ کا حکم")] },
    { ar: "هو", w: ["w:huwa"], g: { en: "He", ur: "وہ" } },
    { ar: "الله", w: ["w:allah"], g: { en: "is Allah,", ur: "اللہ ہے" } },
    { ar: "احد", w: ["w:ahad"], medal: "أَحَد", ofAllah: true, g: { en: "the One", ur: "ایک" } },
  ],
  "112:2": [
    { ar: "الله", w: ["w:allah"], g: { en: "Allah,", ur: "اللہ" } },
    { ar: "الصمد", w: ["w:al", "w:samad"], g: { en: "the Eternal Refuge", ur: "بے نیاز ہے" } },
  ],
  "112:3/read": [
    { ar: "لم", w: ["w:lam"], g: { en: "He did not", ur: "نہ اس نے" } },
    { ar: "يلد", w: ["w:walada"], g: { en: "beget", ur: "کسی کو جنا" }, pieces: [p("يَلِدْ", "begets — وَلَدَ; after لَمْ: did not", "جنتا ہے — وَلَدَ؛ لَمْ کے بعد: نہیں جنا")] },
    { ar: "ولم", w: ["w:wa", "w:lam"], g: { en: "and was not", ur: "اور نہ وہ" } },
    { ar: "يولد", w: ["w:walada"], g: { en: "born", ur: "جنا گیا" }, pieces: [p("يُولَدْ", "is born — ُ on the first letter: it is done to him (passive)", "جنا جاتا ہے — پہلے حرف پر پیش: مجہول")] },
  ],
  "112:4": [
    { ar: "ولم", w: ["w:wa", "w:lam"], g: { en: "And there is not", ur: "اور نہیں ہے" } },
    { ar: "يكن", w: ["w:kana"], g: { en: "(is)", ur: "ہے" }, pieces: [p("يَكُنْ", "is — كَانَ; after لَمْ: there is not", "ہے — كَانَ؛ لَمْ کے بعد: نہیں ہے")] },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "to Him", ur: "اس کا" } },
    { ar: "كفوا", w: ["w:kufuw"], g: { en: "equal", ur: "ہمسر" } },
    { ar: "احد", w: ["w:ahad"], g: { en: "anyone", ur: "کوئی" } },
  ],

  // ---- Reading Room 2 · Surah Al-Asr ----
  "103:1": [
    { ar: "والعصر", w: ["w:wa_oath", "w:al", "w:asr"], g: { en: "By the time!", ur: "زمانے کی قسم!" }, pieces: [p("وَ", "by (an oath)", "قسم"), p("الْ", "the", "وہ"), p("عَصْر", "time; the late afternoon", "زمانہ؛ عصر")] },
  ],
  "103:3": [
    { ar: "الا", w: ["w:illa"], g: { en: "Except", ur: "سوائے" } },
    { ar: "الذين", w: ["w:alladhina"], g: { en: "those who", ur: "ان کے جو" } },
    { ar: "امنوا", w: ["w:amana", "w:hum"], g: { en: "believed", ur: "ایمان لائے" } },
    { ar: "وعملوا", w: ["w:wa", "w:amila", "w:hum"], g: { en: "and did", ur: "اور کیے" } },
    { ar: "الصلحت", w: ["w:al", "w:salihat"], g: { en: "good deeds", ur: "نیک اعمال" }, pieces: [p("الْ", "the", "وہ"), p("صَالِح", "good", "نیک"), p("ـَات", "many (feminine plural)", "کئی (مؤنث جمع)")] },
    { ar: "وتواصوا", w: ["w:wa", "w:tawasaw", "w:hum"], g: { en: "and urged one another", ur: "اور ایک دوسرے کو تلقین کی" }, pieces: [p("وَ", "and", "اور"), p("تَوَاصَوْ", "urged one another — the تَفَاعَلَ mould: to each other", "ایک دوسرے کو تلقین کی — تَفَاعَلَ کا سانچا: آپس میں"), p("ـا", "they", "انہوں نے")] },
    { ar: "بالحق", w: ["w:bi", "w:al", "w:haqq"], g: { en: "to the truth", ur: "حق کی" } },
    { ar: "وتواصوا", w: ["w:wa", "w:tawasaw", "w:hum"], g: { en: "and urged one another", ur: "اور ایک دوسرے کو تلقین کی" } },
    { ar: "بالصبر", w: ["w:bi", "w:al", "w:sabr"], g: { en: "to patience", ur: "صبر کی" } },
  ],

  // ---- Reading Room 3 · Surah Al-Kafirun (109:2 and 109:6 are shared with earlier rooms) ----
  "109:1": [
    { ar: "قل", w: ["w:qala"], g: { en: "Say:", ur: "کہہ دو" }, pieces: [p("قُلْ", "say! — the command of قَالَ", "کہو — قَالَ کا حکم")] },
    { ar: "يايها", w: ["w:ya", "w:ayyu"], art: "w:ya", note: "يَا أَيُّهَا is one call, 'O'; أَيّ is not a question here", g: { en: "O", ur: "اے" }, pieces: [p("يَا", "O", "اے"), p("أَيُّهَا", "you (who are)", "وہ جو")] },
    { ar: "الكفرون", w: ["w:al", "w:kafir"], g: { en: "rejecters of faith!", ur: "کافرو!" }, pieces: [p("الْ", "the", "وہ"), p("كَافِر", "rejecter of faith", "انکار کرنے والا"), p("ـُونَ", "many", "کئی")] },
  ],
  "109:3": [
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "And not", ur: "اور نہ" } },
    { ar: "انتم", w: ["w:antum"], g: { en: "you", ur: "تم" } },
    { ar: "عبدون", w: ["w:abid"], g: { en: "are worshippers of", ur: "عبادت کرنے والے ہو" }, pieces: [p("عَابِد", "worshipper — the doer of عَبَدَ", "عبادت کرنے والا — عَبَدَ کا فاعل"), p("ـُونَ", "many", "کئی")] },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "اس کی جس کی" } },
    { ar: "اعبد", w: ["w:nabudu"], g: { en: "I worship", ur: "میں عبادت کرتا ہوں" }, pieces: [p("أَعْبُدُ", "I worship — أَ in front: I (now)", "میں عبادت کرتا ہوں — آگے أَ: میں (اب)")] },
  ],
  "109:4": [
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "And not", ur: "اور نہ" } },
    { ar: "انا", w: ["w:ana"], g: { en: "I", ur: "میں" } },
    { ar: "عابد", w: ["w:abid"], g: { en: "am a worshipper of", ur: "عبادت کرنے والا ہوں" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "اس کی جس کی" } },
    { ar: "عبدتم", w: ["w:nabudu", "w:kum"], g: { en: "you worshipped", ur: "تم نے عبادت کی" }, pieces: [p("عَبَدْ", "worshipped — the past", "عبادت کی — ماضی"), p("ـتُّمْ", "you all", "تم سب نے")] },
  ],
  "109:5": [
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "And not", ur: "اور نہ" } },
    { ar: "انتم", w: ["w:antum"], g: { en: "you", ur: "تم" } },
    { ar: "عبدون", w: ["w:abid"], g: { en: "are worshippers of", ur: "عبادت کرنے والے ہو" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what", ur: "اس کی جس کی" } },
    { ar: "اعبد", w: ["w:nabudu"], g: { en: "I worship", ur: "میں عبادت کرتا ہوں" } },
  ],

  // ---- Reading Room 4 · Ayat al-Kursi (played and read in parts, cut at its pause marks) ----
  "2:255": [
    { ar: "الله", w: ["w:allah"], g: { en: "Allah —", ur: "اللہ" } },
    { ar: "لا", w: ["w:la"], g: { en: "there is no", ur: "نہیں" } },
    { ar: "اله", w: ["w:ilah"], g: { en: "god", ur: "کوئی معبود" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "سوائے" } },
    { ar: "هو", w: ["w:huwa"], g: { en: "Him,", ur: "اس کے" } },
    { ar: "الحي", w: ["w:al", "w:hayy"], medal: "الْحَيّ", ofAllah: true, g: { en: "the Ever-Living,", ur: "ہمیشہ زندہ" } },
    { ar: "القيوم", w: ["w:al", "w:qayyum"], g: { en: "the Self-Sustaining.", ur: "سب کو قائم رکھنے والا" } },
    { ar: "لا", w: ["w:la"], g: { en: "Does not", ur: "نہ" } },
    { ar: "تاخذه", w: ["w:akhadha", "w:hu"], note: "أَخَذَ take, seize: sleep does not overtake Him", g: { en: "overtake Him", ur: "اسے آتی ہے" }, pieces: [p("تَأْخُذُ", "takes, seizes", "پکڑتی ہے"), p("ـهُ", "Him", "اسے")] },
    { ar: "سنة", w: ["w:sina"], g: { en: "drowsiness", ur: "اونگھ" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "nor", ur: "اور نہ" } },
    { ar: "نوم", w: ["w:nawm"], g: { en: "sleep.", ur: "نیند" } },
    { ar: "له", w: ["w:li", "w:hu"], g: { en: "To Him belongs", ur: "اسی کا ہے" } },
    { ar: "ما", w: ["w:ma"], g: { en: "whatever is", ur: "جو کچھ" } },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "السموت", w: ["w:al", "w:sama"], g: { en: "the heavens", ur: "آسمانوں" } },
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and whatever is", ur: "اور جو کچھ" } },
    { ar: "في", w: ["w:fi"], g: { en: "in", ur: "میں" } },
    { ar: "الارض", w: ["w:al", "w:ard"], g: { en: "the earth.", ur: "زمین" } },
    { ar: "من", w: ["w:man"], g: { en: "Who", ur: "کون" } },
    { ar: "ذا", w: ["w:hadha"], note: "ذَا is the bare pointing word (this): مَنْ ذَا 'who is it'", g: { en: "is it", ur: "ہے" } },
    { ar: "الذي", w: ["w:alladhi"], g: { en: "that", ur: "جو" } },
    { ar: "يشفع", w: ["w:yashfau"], g: { en: "can intercede", ur: "سفارش کرے" } },
    { ar: "عنده", w: ["w:inda", "w:hu"], g: { en: "with Him", ur: "اس کے پاس" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "باذنه", w: ["w:bi", "w:idhn", "w:hu"], g: { en: "by His permission?", ur: "اس کی اجازت سے" } },
    { ar: "يعلم", w: ["w:alima"], g: { en: "He knows", ur: "وہ جانتا ہے" } },
    { ar: "ما", w: ["w:ma"], g: { en: "what is", ur: "جو" } },
    { ar: "بين", w: ["w:bayna"], note: "بَيْنَ أَيْدِيهِمْ: between their hands = before them", g: { en: "before", ur: "سامنے" } },
    { ar: "ايديهم", w: ["w:yad", "w:hum"], note: "بَيْنَ أَيْدِيهِمْ: between their hands = before them", g: { en: "them", ur: "ان کے" }, pieces: [p("بَيْنَ أَيْدِي", "between the hands of: in front of", "ہاتھوں کے درمیان: سامنے"), p("ـهِمْ", "them", "ان کے")] },
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and what is", ur: "اور جو" } },
    { ar: "خلفهم", w: ["w:khalfa", "w:hum"], g: { en: "behind them.", ur: "ان کے پیچھے ہے" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "And not", ur: "اور نہیں" } },
    { ar: "يحيطون", w: ["w:ahata", "w:hum"], g: { en: "do they encompass", ur: "وہ احاطہ کر سکتے" } },
    { ar: "بشيء", w: ["w:bi", "w:shay"], g: { en: "anything", ur: "کسی چیز کا" } },
    { ar: "من", w: ["w:min"], g: { en: "of", ur: "میں سے" } },
    { ar: "علمه", w: ["w:ilm", "w:hu"], g: { en: "His knowledge", ur: "اس کے علم" } },
    { ar: "الا", w: ["w:illa"], g: { en: "except", ur: "مگر" } },
    { ar: "بما", w: ["w:bi", "w:ma"], g: { en: "what", ur: "جتنا" } },
    { ar: "شاء", w: ["w:shaa"], g: { en: "He wills.", ur: "وہ چاہے" } },
    { ar: "وسع", w: ["w:wasia"], g: { en: "Extends over", ur: "سمائے ہوئے ہے" } },
    { ar: "كرسيه", w: ["w:kursi", "w:hu"], g: { en: "His Kursi", ur: "اس کی کرسی" } },
    { ar: "السموت", w: ["w:al", "w:sama"], g: { en: "the heavens", ur: "آسمانوں" } },
    { ar: "والارض", w: ["w:wa", "w:al", "w:ard"], g: { en: "and the earth,", ur: "اور زمین کو" } },
    { ar: "ولا", w: ["w:wa", "w:la"], g: { en: "and does not", ur: "اور نہیں" } },
    { ar: "يئوده", w: ["w:yaudu", "w:hu"], g: { en: "tire Him", ur: "اسے تھکاتی" }, pieces: [p("يَئُودُ", "weighs down, tires", "تھکاتا ہے"), p("ـهُ", "Him", "اسے")] },
    { ar: "حفظهما", w: ["w:hifz", "w:huma_end"], g: { en: "guarding them both.", ur: "ان دونوں کی حفاظت" } },
    { ar: "وهو", w: ["w:wa", "w:huwa"], g: { en: "And He is", ur: "اور وہ" } },
    { ar: "العلي", w: ["w:al", "w:ali"], g: { en: "the Most High,", ur: "سب سے بلند" } },
    { ar: "العظيم", w: ["w:al", "w:azim"], medal: "الْعَظِيم", ofAllah: true, g: { en: "the Most Great.", ur: "بہت عظمت والا ہے" } },
  ],

  // ---- Reading Room 5 · Al-Baqarah 1–5 (2:2 is shared with Asking Verbs 2) ----
  "2:1": [
    { ar: "الم", say: "alif lām mīm", w: ["w:alm"], g: { en: "Alif Lam Mim", ur: "الف لام میم" } },
  ],
  "2:3": [
    { ar: "الذين", w: ["w:alladhina"], g: { en: "who", ur: "جو" } },
    { ar: "يؤمنون", w: ["w:amana", "w:hum"], g: { en: "believe", ur: "ایمان لاتے ہیں" }, pieces: [p("يُؤْمِنُ", "believes — آمَنَ, the أَفْعَلَ mould (أ in front), now", "ایمان لاتا ہے — آمَنَ، أَفْعَلَ کا سانچا، حال"), p("ـُونَ", "they", "وہ")] },
    { ar: "بالغيب", w: ["w:bi", "w:al", "w:ghayb"], g: { en: "in the unseen", ur: "غیب پر" } },
    { ar: "ويقيمون", w: ["w:wa", "w:aqama", "w:hum"], g: { en: "and keep up", ur: "اور قائم کرتے ہیں" }, pieces: [p("وَ", "and", "اور"), p("يُقِيمُ", "keeps up — أَقَامَ, from قَامَ stand: make it stand", "قائم کرتا ہے — أَقَامَ، قَامَ کھڑا ہونا سے: کھڑا کرنا"), p("ـُونَ", "they", "وہ")] },
    { ar: "الصلوة", w: ["w:al", "w:salah"], g: { en: "the prayer", ur: "نماز" } },
    { ar: "ومما", w: ["w:wa", "w:min", "w:ma"], g: { en: "and from what", ur: "اور اس میں سے جو" } },
    { ar: "رزقنهم", w: ["w:razaqa", "w:na", "w:hum"], g: { en: "We have provided them", ur: "ہم نے انہیں دیا" } },
    { ar: "ينفقون", w: ["w:anfaqa", "w:hum"], g: { en: "they spend", ur: "وہ خرچ کرتے ہیں" } },
  ],
  "2:4": [
    { ar: "والذين", w: ["w:wa", "w:alladhina"], g: { en: "And who", ur: "اور جو" } },
    { ar: "يؤمنون", w: ["w:amana", "w:hum"], g: { en: "believe", ur: "ایمان لاتے ہیں" } },
    { ar: "بما", w: ["w:bi", "w:ma"], g: { en: "in what", ur: "اس پر جو" } },
    { ar: "انزل", w: ["w:anzala"], g: { en: "was sent down", ur: "اتارا گیا" }, pieces: [p("أُنْزِلَ", "was sent down — ُ on the first letter: done to it (passive)", "اتارا گیا — پہلے حرف پر پیش: مجہول")] },
    { ar: "اليك", w: ["w:ila", "w:ka"], g: { en: "to you", ur: "تم پر" } },
    { ar: "وما", w: ["w:wa", "w:ma"], g: { en: "and what", ur: "اور جو" } },
    { ar: "انزل", w: ["w:anzala"], g: { en: "was sent down", ur: "اتارا گیا" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "سے" } },
    { ar: "قبلك", w: ["w:qabla", "w:ka"], g: { en: "before you", ur: "تم سے پہلے" } },
    { ar: "وبالاخرة", w: ["w:wa", "w:bi", "w:al", "w:akhir"], g: { en: "and in the Hereafter", ur: "اور آخرت پر" } },
    { ar: "هم", w: ["w:humu"], g: { en: "they", ur: "وہ (سب)" } },
    { ar: "يوقنون", w: ["w:yuqinu", "w:hum"], g: { en: "are certain", ur: "یقین رکھتے ہیں" } },
  ],
  "2:5": [
    { ar: "اولئك", w: ["w:ulaika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "Those", ur: "یہی لوگ" } },
    { ar: "على", w: ["w:ala"], g: { en: "are on", ur: "پر ہیں" } },
    { ar: "هدى", w: ["w:huda"], g: { en: "guidance", ur: "ہدایت" } },
    { ar: "من", w: ["w:min"], g: { en: "from", ur: "کی طرف سے" } },
    { ar: "ربهم", w: ["w:rabb", "w:hum"], g: { en: "their Lord,", ur: "اپنے رب" } },
    { ar: "واولئك", w: ["w:wa", "w:ulaika"], note: "the far word is said with the near word (یہ) in Urdu, as the Urdu translation does", g: { en: "and those", ur: "اور یہی لوگ" } },
    { ar: "هم", w: ["w:humu"], note: "هُمْ between two parts of a sentence: 'they are'", g: { en: "are", ur: "ہی" } },
    { ar: "المفلحون", w: ["w:al", "w:muflih"], g: { en: "the successful.", ur: "کامیاب ہیں" }, pieces: [p("الْ", "the", "وہ"), p("مُفْلِح", "successful one — مُ in front of أَفْلَحَ", "کامیاب — أَفْلَحَ کے آگے مُ"), p("ـُونَ", "many", "کئی")] },
  ],
};
