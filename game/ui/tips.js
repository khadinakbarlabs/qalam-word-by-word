// Explanations of every visual in the game (docs/VISUAL_GAMES.md §1), in English and Urdu. One source for both the
// tooltips (hover on a computer, long-press on a phone) and the Picture Guide screen.
//   tip(el, key)       explain a symbol: TIPS[key]
//   tipText(el, g)     explain a word picture with its meaning { en, ur }
//   explain(w)         a pack word's meaning + extra meanings + what its picture shows, for tipText
//   installTips()      once at boot: shows the bubble for whatever [data-tip] element is hovered or long-pressed
import { h } from "./kit.js";
import { lang } from "../i18n.js";
import { later } from "../core/clock.js";

const T = (en, ur) => ({ en, ur });

export const TIPS = {
  // word marks
  m: T("▲ he-word (masculine)", "▲ مذکر لفظ"),
  f: T("● she-word (feminine)", "● مؤنث لفظ"),
  one: T("One person or thing", "ایک شخص یا چیز"),
  two: T("Two people or things (the -ān / -ayn ending)", "دو لوگ یا چیزیں (ـَانِ / ـَيْنِ والا آخر)"),
  do: T("Bin: do it! — a command (اِفْعَلْ)", "خانہ: کرو! — حکم (اِفْعَلْ)"),
  dont: T("Bin: don't! — لَا in front of the present (لَا تَفْعَلْ)", "خانہ: نہ کرو! — حال سے پہلے لَا (لَا تَفْعَلْ)"),
  many: T("Many people or things (plural)", "بہت سے لوگ یا چیزیں (جمع)"),
  medal: T("Glowing medallion: a name of Allah or an idea with no picture. Learn it by its letters and root.", "روشن تمغہ: اللہ کا نام یا ایسا تصور جس کی تصویر نہیں۔ حروف اور مادے سے پہچانیں۔"),
  scroll: T("Name scroll: a prophet, an angel or a revealed book. Never shown as a picture.", "نام کا طومار: نبی، فرشتہ یا آسمانی کتاب۔ کبھی تصویر نہیں دکھائی جاتی۔"),
  plain: T("Plain ink: a word that gets no picture at all.", "سادہ روشنائی: ایسا لفظ جس کی کوئی تصویر نہیں۔"),
  // ayah tiles
  tileNew: T("Gold glow: a new word. Tap it to meet it.", "سنہری چمک: نیا لفظ۔ ملنے کے لیے ٹیپ کریں۔"),
  tileKnown: T("Blue glow: a word you know. Tap it and pick its meaning.", "نیلی چمک: جانا پہچانا لفظ۔ ٹیپ کریں اور معنی چنیں۔"),
  tileGiven: T("Grey: not learned yet, so its meaning is shown for you.", "سرمئی: ابھی نہیں سیکھا، اس لیے معنی دکھایا گیا ہے۔"),
  tileLit: T("Lit: you have read this word.", "روشن: یہ لفظ آپ نے پڑھ لیا۔"),
  pieces: T("Pieces: the small parts this word is built from.", "ٹکڑے: وہ چھوٹے حصے جن سے یہ لفظ بنا ہے۔"),
  // time and place
  past: T("⏪ Past: already happened", "⏪ ماضی: ہو چکا"),
  now: T("📍 Now", "📍 ابھی"),
  future: T("⏩ Later: still to come", "⏩ بعد میں: آنے والا"),
  done: T("✔️ Done for sure (قَدْ)", "✔️ یقیناً ہو چکا (قَدْ)"),
  soon: T("⏩ Soon (سَـ)", "⏩ جلد (سَـ)"),
  later: T("⏩⏩ Later on (سَوْفَ)", "⏩⏩ کچھ دیر بعد (سَوْفَ)"),
  stamp: T("✕ The No stamp cancels the time it lands on", "✕ نہیں کی مہر جس وقت پر لگے اسے رد کرتی ہے"),
  timeArrow: T("Time runs right to left, the way Arabic is read", "وقت دائیں سے بائیں چلتا ہے، جیسے عربی پڑھی جاتی ہے"),
  near: T("Big and close: near (this)", "بڑا اور قریب: پاس (یہ)"),
  far: T("Small and across the room: far (that)", "چھوٹا اور دور: دور (وہ)"),
  ghost: T("A place the lamp can go", "وہ جگہ جہاں چراغ جا سکتا ہے"),
  // game pieces
  pot: T("Root pot: three letter-seeds. Every word that grows from them shares their meaning.", "مادے کا گملا: تین حرفی بیج۔ ان سے اگنے والے سب لفظوں کا معنی ملتا جلتا ہے۔"),
  rungBase: T("Low rung: the plain describing word (big)", "نچلا ڈنڈا: سادہ صفت (بڑا)"),
  rungMore: T("High rung ⬆: the أَفْعَل mould (bigger, biggest)", "اوپر کا ڈنڈا ⬆: أَفْعَل کا سانچہ (زیادہ بڑا، سب سے بڑا)"),
  sent: T("📜 Sent by Allah with the message", "📜 اللہ کی طرف سے پیغام کے ساتھ بھیجے گئے"),
  refused: T("🚫 Refused the message", "🚫 پیغام کو رد کیا"),
  garden: T("🌳 The good end: the Garden", "🌳 اچھا انجام: جنت"),
  fire: T("🔥 The bad end: the Fire", "🔥 برا انجام: آگ"),
  light: T("🕯️ Light: truth, what is clear", "🕯️ روشنی: حق، جو واضح ہے"),
  dark: T("🌑 Dark: falsehood, what is hidden", "🌑 اندھیرا: باطل، جو چھپا ہے"),
  good: T("🌷 Good: deeds and people on the right path", "🌷 اچھا: صحیح راستے کے اعمال اور لوگ"),
  bad: T("🍂 Bad: deeds and people on the wrong path", "🍂 برا: غلط راستے کے اعمال اور لوگ"),
  frontPiece: T("Front piece: clicks onto the start of a word", "اگلا ٹکڑا: لفظ کے شروع میں لگتا ہے"),
  endPiece: T("End piece: clicks onto the end of a word (whose?)", "پچھلا ٹکڑا: لفظ کے آخر میں لگتا ہے (کس کا؟)"),
  person: T("Person wheel: who is meant (I, you, he, she, we, they)", "شخص کا پہیہ: کون مراد ہے (میں، تم، وہ، ہم)"),
  petal_past: T("Petal: did (past) — فَعَلَ", "پنکھڑی: کیا (ماضی) — فَعَلَ"),
  petal_present: T("Petal: does / will do (now or later) — يَفْعَلُ", "پنکھڑی: کرتا ہے / کرے گا — يَفْعَلُ"),
  petal_command: T("Petal: do it! (command) — اِفْعَلْ", "پنکھڑی: کرو! (حکم) — اِفْعَلْ"),
  petal_doer: T("Petal: the one who does it — فَاعِل", "پنکھڑی: کرنے والا — فَاعِل"),
  petal_done: T("Petal: the thing it is done to — مَفْعُول", "پنکھڑی: جس پر کیا گیا — مَفْعُول"),
  ruleWhy: T("Every painting has a short line saying what it shows — hold or hover a word to read it, or open My words", "ہر تصویر کے ساتھ ایک چھوٹی سطر ہے کہ اس میں کیا دکھایا گیا ہے — لفظ کو دبائے رکھیں یا ’میرے الفاظ‘ کھولیں"),
  ruleFaceless: T("People are drawn without faces, in modest clothes; women wear a headscarf", "لوگ بغیر چہرے کے، باحیا لباس میں بنائے گئے ہیں؛ عورتیں دوپٹہ اوڑھتی ہیں"),
  ruleObjects: T("When Allah is the one who does it (gives, creates, protects), the picture shows only things — never a figure", "جب کرنے والا اللہ ہو (عطا، پیدا، حفاظت) تو تصویر میں صرف چیزیں ہیں — کوئی شخص نہیں"),
  ruleCalm: T("Pictures of the Hereafter, death and fear are calm and gentle, never frightening", "آخرت، موت اور خوف کی تصویریں پرسکون ہیں، ڈراؤنی نہیں"),
  ruleModest: T("Men and women never touch in the pictures; friends and partners are drawn with their own kind", "تصویروں میں مرد اور عورت ایک دوسرے کو نہیں چھوتے؛ دوست اور ساتھی ہم جنس دکھائے گئے ہیں"),
  masteryLamp: T("Mastery lamp: two dots fill when you get the word right twice in a row; a miss empties it", "مہارت کا چراغ: لفظ لگاتار دو بار درست ہو تو دونوں نقطے بھرتے ہیں؛ غلطی پر خالی"),
  readLine: T("Reading Room: tap the next line to read it — its words and its meaning appear", "مطالعہ کا کمرہ: اگلی سطر پر ٹیپ کریں — اس کے الفاظ اور معنی سامنے آ جائیں گے"),
  partner: T("Same verb, new path: a verb you know joins a small partner word (فِي، عَلَى، عَنْ …) and its meaning changes", "وہی فعل، نیا راستہ: آپ کا جانا ہوا فعل ایک چھوٹے ساتھی لفظ (فِي، عَلَى، عَنْ …) سے مل کر نیا معنی دیتا ہے"),
  mould: T("Mould Press: a word you know goes into the pattern and comes out grown, with a new meaning from the same root", "سانچا: آپ کا جانا ہوا لفظ سانچے میں جا کر بڑھ جاتا ہے، اسی جڑ سے نیا معنی"),
  story: T("Story: tap each picture in turn — the room's words tell a little story", "کہانی: ہر تصویر کو باری باری چھوئیں — کمرے کے الفاظ ایک چھوٹی کہانی سناتے ہیں"),
  stakesWords: T("How many new words this room teaches", "یہ کمرہ کتنے نئے الفاظ سکھاتا ہے"),
  stakesUses: T("How many words of the Qur'an use them — learn these and you meet them that often", "قرآن کے کتنے الفاظ میں یہ آتے ہیں — انہیں سیکھیں تو اتنی بار پہچانیں گے"),
  doerDid: T("Bin: someone did it — the doer is said (خَلَقَ he created)", "خانہ: کسی نے کیا — کرنے والا بتایا گیا (خَلَقَ اس نے پیدا کیا)"),
  wasDone: T("Bin: it was done — the doer is not said; look for the ُ on the first letter (خُلِقَ was created)", "خانہ: کیا گیا — کرنے والا نہیں بتایا؛ پہلے حرف پر پیش ُ دیکھیں (خُلِقَ پیدا کیا گیا)"),
  petal_action: T("Petal: the action itself — فِعْل", "پنکھڑی: کام خود — فِعْل"),
  flower: T("The root's three letters sit in the middle; every petal grows from them", "مادے کے تین حروف بیچ میں؛ ہر پنکھڑی انہی سے اگتی ہے"),
  // scene spots
  sky: T("Sky", "آسمان"), sun: T("Sun", "سورج"), moon: T("Moon", "چاند"), day: T("Daytime", "دن"), night: T("Night", "رات"),
  wind: T("Wind", "ہوا"), mountain: T("Mountain", "پہاڑ"), cattle: T("Cattle", "مویشی"), sea: T("Sea", "سمندر"), earth: T("Earth, ground", "زمین"),
  me: T("🙋 You: the family tree is seen from here", "🙋 آپ: خاندان کو یہیں سے دیکھا جاتا ہے"),
  father: T("Your father", "آپ کے والد"), mother: T("Your mother", "آپ کی والدہ"), brother: T("Your brother", "آپ کا بھائی"),
  spouse: T("Your spouse (husband or wife)", "آپ کا شریکِ حیات (شوہر یا بیوی)"), son: T("Your son", "آپ کا بیٹا"),
  daughter: T("Your daughter", "آپ کی بیٹی"), offspring: T("Your children and their children", "آپ کی اولاد اور ان کی اولاد"),
  face: T("Face", "چہرہ"), eye: T("Eye", "آنکھ"), mouth: T("Mouth", "منہ"), tongue: T("Tongue", "زبان"), chest: T("Chest", "سینہ"),
  heart: T("Heart", "دل"), belly: T("Belly", "پیٹ"), hand: T("Hand", "ہاتھ"), foot: T("Foot", "پاؤں"),
  town: T("Town", "بستی"), mosque: T("Mosque", "مسجد"), house: T("House", "گھر"), tree: T("Trees", "درخت"),
  right: T("Your right side", "آپ کی دائیں طرف"), left: T("Your left side", "آپ کی بائیں طرف"),
  here: T("Here, where you are", "یہاں، جہاں آپ ہیں"), there: T("There, far off", "وہاں، دور"),
  people: T("People", "لوگ"), wealth: T("Wealth", "مال"), path: T("Way, path", "راستہ"), goods: T("Goods", "سامان"),
  // progress
  meter: T("Lamp meter: how much of the Qur'an's words you can now recognise", "چراغ میٹر: قرآن کے کتنے الفاظ آپ پہچانتے ہیں"),
  doorDone: T("🪔 Room finished", "🪔 کمرہ مکمل"),
  doorNext: T("✨ Your next room", "✨ آپ کا اگلا کمرہ"),
  doorLocked: T("🔒 Opens after the room before it", "🔒 پچھلے کمرے کے بعد کھلے گا"),
  doorSoon: T("Being built: coming soon", "زیرِ تعمیر: جلد آ رہا ہے"),
  relight: T("🔁 Relight: words whose lamps are fading. Review them to keep them lit.", "🔁 دہرائیں: وہ الفاظ جن کے چراغ مدھم ہو رہے ہیں۔ روشن رکھنے کے لیے دہرائیں۔"),
  hint: T("👆 Show me: first the hand shows where to tap; ask again to see the answer", "👆 دکھائیں: پہلے ہاتھ بتاتا ہے کہاں ٹیپ کریں؛ دوبارہ مانگیں تو جواب"),
  dots: T("Dots: how far you are in this round", "نقطے: اس مرحلے میں آپ کتنا آگے ہیں"),
  lampLevel: T("Lamp brightness: how well you remember this word (0–6)", "چراغ کی روشنی: یہ لفظ آپ کو کتنا یاد ہے (0–6)"),
  guide: T("Picture Guide: what every picture and sign means", "تصویری رہنما: ہر تصویر اور نشان کا مطلب"),
};

export function tip(el, key) {
  if (TIPS[key]) el.dataset.tip = key;
  return el;
}

/** A word's full explanation for its tooltip: meaning, extra meanings, and what its picture shows. */
export function explain(w) {
  const en = [w.g.en, w.more?.en, w.why ? `Picture: ${w.why.en}` : null].filter(Boolean).join(" · ");
  const ur = [w.g.ur, w.more?.ur, w.why ? `تصویر: ${w.why.ur ?? w.why.en}` : null].filter(Boolean).join(" · ");
  return { en, ur };
}

export function tipText(el, g) {
  if (g?.en) { el.dataset.tipEn = g.en; el.dataset.tipUr = g.ur ?? g.en; }
  return el;
}

const textOf = (el) => {
  const l = lang();
  if (el.dataset.tip) return TIPS[el.dataset.tip][l] ?? TIPS[el.dataset.tip].en;
  return l === "ur" ? el.dataset.tipUr : el.dataset.tipEn;
};

const LONG_PRESS_MS = 450;
const HOVER_MS = 350;
const SHOW_MS = 2200;

let hideAll = () => {};
/** Hide the bubble and drop any pending show (YouTube pause, Esc). True when a bubble was showing. */
export const hideTips = () => hideAll();

/** One bubble for the whole game; follows hover (mouse/pen), long-press (touch) and keyboard focus.
 *  Its delays run on the game clock, so they freeze with everything else during a YouTube pause. */
export function installTips(root = document) {
  const bubble = h("div", { class: "tip-bubble", role: "tooltip", hidden: true });
  document.body.append(bubble);
  let cancelShow = () => {};
  let cancelHide = () => {};
  let swallowClick = false;
  const find = (e) => e.target.closest?.("[data-tip], [data-tip-en]");
  const hide = () => { cancelShow(); bubble.hidden = true; };
  hideAll = () => { const was = !bubble.hidden; cancelHide(); hide(); return was; };
  const show = (el) => {
    const text = el?.isConnected && textOf(el);
    if (!text) return;
    bubble.textContent = text;
    bubble.lang = lang() === "ur" ? "ur" : "en";
    bubble.hidden = false;
    const r = el.getBoundingClientRect();
    const b = bubble.getBoundingClientRect();
    const top = r.top - b.height - 8 >= 4 ? r.top - b.height - 8 : r.bottom + 8;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), innerWidth - b.width - 8);
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  };
  root.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const el = find(e);
    cancelShow();
    if (el) cancelShow = later(() => show(el), HOVER_MS);
    else hide();
  });
  root.addEventListener("pointerout", (e) => { if (e.pointerType !== "touch" && find(e)) hide(); });
  root.addEventListener("pointerdown", (e) => {
    hide();
    if (e.pointerType !== "touch") return;
    const el = find(e);
    if (!el) return;
    cancelShow = later(() => {
      show(el);
      swallowClick = true; // a long-press explains; it must not also answer
      cancelHide();
      cancelHide = later(hide, SHOW_MS);
    }, LONG_PRESS_MS);
  });
  for (const ev of ["pointerup", "pointercancel"]) root.addEventListener(ev, () => cancelShow());
  root.addEventListener("click", (e) => {
    if (!swallowClick) return;
    swallowClick = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);
  root.addEventListener("contextmenu", (e) => { if (find(e)) e.preventDefault(); });
  root.addEventListener("focusin", (e) => { const el = find(e); if (el && e.target.matches(":focus-visible")) show(el); else hide(); });
  root.addEventListener("focusout", hide);
  addEventListener("scroll", hide, true);
}
