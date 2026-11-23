// Builds the scholar's review data from the built content pack: every word card (meaning, picture and what the
// picture shows), every ayah's word-by-word glosses, the verb-partner meanings, the Reading Room sentence
// translations, and a short list of items flagged during authoring. Writes review/review-data.json.
// Usage: node scripts/build-pack.mjs && node scripts/review-pack.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { WORDS } from "../authoring/words.js";

const root = new URL("../", import.meta.url);
const pack = JSON.parse(readFileSync(new URL("game/content/pack.json", root), "utf8"));
// what each picture shows ships in its own file (game/core/content.js)
const why = JSON.parse(readFileSync(new URL("game/content/why.json", root), "utf8")).words;

const g = (x) => ({ en: x?.en ?? "", ur: x?.ur ?? "" });
// "img:art/x.webp", sometimes followed by a ▲ he-word / ● she-word badge
const artName = (pic) => (typeof pic === "string" ? pic.match(/^img:art\/(.+?)\.webp/)?.[1] ?? null : null);
const badge = (pic) => (typeof pic === "string" ? pic.match(/[▲●]$/)?.[0] : undefined);
const look = (pic, medal) => {
  if (medal) {
    const [kind, text] = medal.includes(":") ? medal.split(/:(.*)/s) : ["medal", medal];
    return { kind, text };  // medal: name of Allah or abstract word; scroll: prophet, angel, book; plain: no picture allowed
  }
  return artName(pic) ? { kind: "art", art: artName(pic), badge: badge(pic) } : { kind: "emoji", text: pic ?? "" };
};
const roomTitle = (r) => ({ id: r.id, wing: r.wing, title: g(r.title) });

// ---- word cards, in the order the game teaches them ----
const firstRoom = new Map();
for (const r of pack.rooms) for (const id of r.teaches) if (!firstRoom.has(id)) firstRoom.set(id, r.id);
const order = (roomId) => { const k = pack.rooms.findIndex((r) => r.id === roomId); return k < 0 ? 1e9 : k; };
const words = Object.entries(pack.words)
  .filter(([id]) => id.startsWith("w:"))
  .map(([id, w]) => ({
    id, ar: w.ar, g: g(w.g), more: w.more ? g(w.more) : undefined, why: why[id] ? g(why[id]) : undefined,
    look: look(w.pic, w.medal), units: (WORDS[id]?.units ?? []).filter((u) => !u.startsWith("K:")).map((u) => u.replace(/^[LAS]:/, "")),
    room: firstRoom.get(id) ?? null,
  }))
  .sort((a, b) => order(a.room) - order(b.room));

// ---- ayat: one review item per gloss set (an ayah, a Reading Room's own gloss set, or a part of a long ayah) ----
const ayat = new Map();
for (const r of pack.rooms) {
  for (const st of r.steps) {
    if (st.type !== "ayah") continue;
    const own = r.id.startsWith("reading-room-") && st.words.every((w) => !w.given);
    const id = `a:${st.ref}${st.part ? `:${st.part[0]}-${st.part[1]}` : ""}`;
    // the same ayah with a different gloss set (e.g. 112:1 in Wing 1 vs the Reading Room) is its own item
    const key = ayat.has(id) && JSON.stringify(ayat.get(id).words.map((w) => [w.g, Boolean(w.given)])) !== JSON.stringify(st.words.map((w) => [w.g, Boolean(w.given)])) ? `${id}:read` : id;
    if (ayat.has(key)) { ayat.get(key).rooms.push(r.id); continue; }
    ayat.set(key, {
      id: key, ref: st.ref, part: st.part ?? null, rooms: [r.id], reading: own || undefined,
      words: st.words.map((w) => ({ ar: w.ar, mark: w.mark || undefined, g: g(w.g), given: w.given || undefined, cards: w.w,
        pieces: (w.pieces ?? []).map((p) => ({ ar: p.ar, g: g(p.g) })) })),
    });
  }
}

// ---- verb partners (E3) and Reading Room lines (E8) ----
const partners = [];
const reading = [];
for (const r of pack.rooms) {
  for (const st of r.steps) {
    if (st.type === "path") for (const it of st.items) partners.push({
      id: `p:${it.verb}+${it.with}`, room: r.id, ar: it.ar, g: g(it.g), why: it.why ? g(it.why) : undefined, look: look(it.pic),
      verb: { ar: pack.words[it.verb].ar, g: g(pack.words[it.verb].g) },
    });
    if (st.type === "passage") st.ayat.forEach((a, k) => reading.push({
      id: `r:${r.id}:${k + 1}`, room: r.id, title: g(st.title), titleAr: st.title.ar, ref: a.ref, part: a.part ?? null,
      ar: a.words.map((w) => w.ar + (w.mark ? ` ${w.mark}` : "")).join(" "), say: g(a.say),
    }));
  }
}

// ---- priority checks: decisions made while authoring that a scholar should confirm first ----
const FLAGS = [
  { item: "w:mutakabbir", why: "Glossed and painted as the arrogant one (a tall tower). Its use as a name of Allah, al-Mutakabbir (59:23), is not shown anywhere. Is the gloss right, and should the name sense be added?" },
  { item: "w:tabaraka", why: "Usually said of Allah. Painted only as an object (a spring that makes a valley bloom). Are the gloss and the picture suitable?" },
  { item: "w:taala", why: "Usually said of Allah. Painted only as an object (a mountain peak above the clouds). Is this suitable?" },
  { item: "w:istawa", why: "Glossed \"be equal; stand firm, rise (over)\" and painted as a wheat stem. The sense in \"istawa 'ala al-'arsh\" is not pictured. Please check the gloss wording." },
  { item: "w:kursi", why: "Shown only as calligraphy. Glossed \"the Kursi (footstool; seat of authority)\". Please check the wording." },
  { item: "w:samad", why: "A name of Allah, calligraphy only. Glossed \"the Eternal Refuge (whom all need)\"." },
  { item: "w:qayyum", why: "A name of Allah, calligraphy only. Glossed \"the Self-Sustaining (who keeps all things in being)\"." },
  { item: "w:yashfau", why: "Intercession painted as one man speaking up for another to an elder. Is a human scene suitable for this word?" },
  { item: "w:istajaba", why: "Often Allah answers. Painted only as a flower turning to the rising sun." },
  { item: "w:walada", why: "Painted as a mother camel and calf. In 112:3 it appears negated about Allah. Is the picture suitable there?" },
  { item: "w:yaudu", why: "In 2:255 it is negated about Allah (guarding them does not tire Him). Painted as a shelf bending under sacks." },
  { item: "w:alm", why: "The separate letters are explained as \"their meaning Allah knows\". Is this wording acceptable?" },
  { item: "w:ahad", why: "In 112:1 shown as calligraphy (the One); elsewhere a picture for \"anyone\". Please confirm both glosses." },
  { item: "p:w:afa+w:an", why: "Pardon, often by Allah. Painted as footprints wiped away by the wind." },
  { item: "p:w:taba+w:ala", why: "Turning in mercy and accepting repentance (said of Allah). Painted as a sheep-fold gate opening for a lamb." },
  { item: "p:w:radiya+w:an", why: "Being pleased with someone (often Allah). Painted as sunlight on a garden." },
  { item: "w:iftara", why: "A wrongdoers' word, painted only as an object (a bubble shaped like a house, about to pop). The same rule is used for اِعْتَدَى، اِسْتَكْبَرَ، اِسْتَهْزَأَ، اِسْتَضْعَفَ and بَغَى." },
  { item: "a:92:20", why: "وَجْه is glossed \"the Face\" (Urdu چہرہ (رضا)) in \"seeking the Face of his Lord\". Please confirm the wording." },
  { item: "reading", why: "The sentence translations in all five Reading Rooms are our own plain drafts (Al-Ikhlas, Al-Asr, Al-Kafirun, Ayat al-Kursi, Al-Baqarah 1–5). Please read each line." },
];
const known = new Set([...words.map((w) => w.id), ...ayat.keys(), ...partners.map((p) => p.id), "reading"]);
for (const f of FLAGS) if (!known.has(f.item)) throw new Error(`flag points at an unknown item: ${f.item}`);

const RULES = [
  "No pictures of Allah, prophets, angels, the Companions, jinn or Shaytan.",
  "Names of Allah are calligraphy medallions; prophets, angels and revealed books are name scrolls; Shaytan and jinn words are plain ink.",
  "Verbs usually done by Allah, and words for wrongdoers, are painted as objects or animals only.",
  "People are faceless and modestly dressed; women wear a headscarf; men and women never touch.",
  "Pictures of death, the Hereafter and fear stay calm.",
  "No church or European motifs and no Latin letters in pictures.",
  "Glosses give the most common sense; contested words should get a reviewed note or \"ask a teacher\".",
];

const data = {
  built: new Date().toISOString().slice(0, 10),
  rooms: pack.rooms.map(roomTitle), rules: RULES, flags: FLAGS,
  words, ayat: [...ayat.values()], partners, reading,
};
mkdirSync(new URL("review/", root), { recursive: true });
writeFileSync(new URL("review/review-data.json", root), JSON.stringify(data));
const arts = new Set([...words.map((w) => w.look.art), ...partners.map((p) => p.look.art)].filter(Boolean));
writeFileSync(new URL("review/art-list.txt", root), [...arts].join("\n") + "\n");
console.log(`review data: ${words.length} words, ${ayat.size} ayah glosses, ${partners.length} verb partners, ${reading.length} reading lines, ${FLAGS.length} flags, ${arts.size} pictures`);
