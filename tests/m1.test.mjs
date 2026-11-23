import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCorpus, tanzilWords } from "../scripts/lib/corpus.mjs";
import { buildPack, displayWords } from "../scripts/lib/pack.mjs";
import { parseSave, serializeSave, defaultSave, markRoom, setCards } from "../game/core/save.js";
import { startSession, record, finishRoom, meter, roomStates, missingCards } from "../game/core/room.js";
import { newCard } from "../game/core/srs.js";
import { startMastery, answer, direction, isMastered } from "../game/core/mastery.js";
import { keys, resolveLang } from "../game/i18n.js";

import { ROOM_SPLITS } from "../game/core/room-splits.js";
const corpus = await loadCorpus();
const { pack, errors } = buildPack(corpus);

test("content pack builds with no validation errors", () => {
  assert.deepEqual(errors, []);
  // rooms are split so none teaches too many words at once (authoring/splits.js): Wing 1 at most 8, later wings 20
  assert.equal(pack.rooms.filter((r) => r.wing === 1).length, 24, "Wing 1 complete: Al-Fatiha in 5 rooms + 18 rooms + Reading Room 1");
  assert.equal(pack.rooms.filter((r) => r.wing === 2).length, 20, "Wing 2 complete: 17 rooms + 2 review halls (split) + Reading Room 2");
  const wing2End = pack.rooms.filter((r) => r.wing === 2).at(-1).coverageAfter;
  // Reading Room 2 (Al-Asr) pulls آمَنَ / عَمِلَ / صَبْر forward, so Wing 2 ends a little above the booklet's ≈ 60%
  assert.ok(wing2End > 55 && wing2End < 67, `Wing 2 ends at ${wing2End}% (booklet pp. 1–15 ≈ 60%)`);
  assert.deepEqual(pack.rooms.map((r) => r.wing), [...pack.rooms.map((r) => r.wing)].sort(), "wings run in order");
});

test("no key is written twice in the authoring files (a repeat would silently replace the first entry)", async () => {
  const fs = await import("node:fs");
  for (const file of ["words.js", "ayat.js", "art.js"]) {
    const keys = [...fs.readFileSync(new URL(`../authoring/${file}`, import.meta.url), "utf8").matchAll(/^ {2}"([^"]+)":/gm)].map((m) => m[1]);
    assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], file);
  }
});

test("every ayah shown is the Tanzil text, word for word, unchanged", () => {
  for (const room of pack.rooms) {
    for (const st of room.steps.filter((s) => s.type === "ayah")) {
      const [s, a] = st.ref.split(":").map(Number);
      const tanzil = tanzilWords(corpus.ayat.get(st.ref));
      const expected = a === 1 && s !== 1 && s !== 9 ? tanzil.slice(4) : tanzil;
      assert.deepEqual(st.words.map((w) => w.ar), st.part ? expected.slice(st.part[0] - 1, st.part[1]) : expected, st.ref);
    }
  }
});

test("pause marks stay attached to their word instead of being dropped", () => {
  const out = displayWords("ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى", false);
  assert.deepEqual(out.map((w) => [w.ar, w.mark]), [["ذَٰلِكَ", ""], ["ٱلْكِتَـٰبُ", ""], ["لَا", ""], ["رَيْبَ", "ۛ"], ["فِيهِ", "ۛ"], ["هُدًى", ""]]);
});

test("the meter only goes up, room by room, and names of Allah have no pictures", () => {
  const pcts = pack.rooms.map((r) => r.coverageAfter);
  assert.deepEqual([...pcts].sort((a, b) => a - b), pcts);
  const wing1End = pack.rooms.filter((r) => r.wing === 1).at(-1).coverageAfter;
  assert.ok(pcts[0] > 3 && pcts[2] > 5 && pcts[4] > 11 && wing1End > 40 && wing1End < 50, `Al-Fatiha reaches ${pcts[0]}%, ${pcts[2]}% then ${pcts[4]}%; Wing 1 ends at ${wing1End}%`);
  for (const id of ["w:allah", "w:rahman", "w:rahim", "w:rabb", "w:malik", "w:alim", "w:sami", "w:basir", "w:aziz", "w:hakim", "w:ghafur"]) {
    assert.ok(pack.words[id].medal && !pack.words[id].pic, id);
  }
});

test("later rooms repeat earlier words (built-in review)", () => {
  // Al-Fatiha's rooms continue one surah, so only the rooms after it must bring earlier words back. A room written
  // as one and played in parts (core/room-splits.js) is counted as a whole: its first part may be all new words.
  const whole = new Map();
  for (const room of pack.rooms.filter((r) => !/^fatiha/.test(r.id))) {
    const base = Object.keys(ROOM_SPLITS).find((old) => ROOM_SPLITS[old].includes(room.id)) ?? room.id;
    whole.set(base, new Set([...(whole.get(base) ?? []), ...room.reviews]));
  }
  for (const [id, reviews] of whole) assert.ok(reviews.size >= 5, id);
});

test("save round-trips; corrupt or future saves are blocked, bad cards dropped", () => {
  let save = setCards(markRoom(defaultSave(), "fatiha"), [{ ...newCard("w:yawm", 100), level: 2, due: 101, seen: 3 }]);
  const back = parseSave(serializeSave(save)).save;
  assert.deepEqual(back.rooms, { fatiha: 1 });
  assert.equal(back.cards["w:yawm"].level, 2);
  assert.equal(parseSave("{bad").blocked, true);
  assert.equal(parseSave(JSON.stringify({ v: 99 })).blocked, true);
  const cleaned = parseSave(JSON.stringify({ v: 1, cards: { "w:ok": [1, 5, 1, 0, null], "w:bad": [9, -1] } })).save;
  assert.deepEqual(Object.keys(cleaned.cards), ["w:ok"]);
});

test("room results: worst outcome wins; new words land at level 1 or 2", () => {
  let s = startSession();
  s = record(s, ["a", "b"], "easy");
  s = record(s, ["b"], "wrong");
  s = record(s, ["b"], "easy");
  assert.deepEqual(s.results, { a: "easy", b: "wrong" });
  const room = { teaches: ["a", "b", "c"], reviews: [] };
  const out = Object.fromEntries(finishRoom(s, room, {}, 100).map((c) => [c.id, [c.level, c.due - 100]]));
  // right every time: one flame, back tomorrow; missed or only met: one flame, back today
  assert.deepEqual(out, { a: [1, 1], b: [1, 0], c: [1, 0] });
});

test("reviewed words move only when due; a miss always counts", () => {
  const notDue = { ...newCard("x", 0), level: 3, due: 105 };
  const s1 = record(startSession(), ["x"], "easy");
  assert.deepEqual(finishRoom(s1, { teaches: [], reviews: ["x"] }, { x: notDue }, 100), []);
  const s2 = record(startSession(), ["x"], "wrong");
  assert.equal(finishRoom(s2, { teaches: [], reviews: ["x"] }, { x: notDue }, 100)[0].level, 2);
});

test("map unlocks rooms in order and the meter follows finished rooms", () => {
  const locked = (n) => Array(n).fill("locked");
  assert.deepEqual(roomStates(pack, {}), ["next", ...locked(pack.rooms.length - 1)]);
  assert.deepEqual(roomStates(pack, { fatiha: 1 }), ["done", "next", ...locked(pack.rooms.length - 2)]);
  assert.equal(meter(pack, {}), 0);
  assert.equal(meter(pack, { fatiha: 1, "near-far": 1 }), pack.rooms[0].coverageAfter, "the meter stops at the first room not done");
  assert.equal(meter(pack, { fatiha: 1, "fatiha-1b": 1, "fatiha-2": 1, "near-far": 1 }), pack.rooms[2].coverageAfter);
});

test("English and Urdu interface strings match key for key; Urdu hosts get Urdu", () => {
  assert.deepEqual(keys("ur").sort(), keys("en").sort());
  assert.equal(resolveLang("auto", "ur-PK"), "ur");
  assert.equal(resolveLang("auto", "en-US"), "en");
  assert.equal(resolveLang("en", "ur-PK"), "en");
});

test("Wing 2 games: roots, ladder and scene rounds are well formed", () => {
  const steps = pack.rooms.flatMap((r) => r.steps);
  const of = (type) => steps.filter((s) => s.type === type);
  assert.ok(of("roots").length && of("ladder").length && of("scene").length);
  for (const st of of("roots")) for (const sd of st.seeds) assert.equal(sd.letters.length, 3, sd.id);
  for (const st of of("ladder")) {
    assert.ok(st.items.some((it) => it.rung === "base") && st.items.some((it) => it.rung === "more"));
    for (const it of st.items.filter((x) => x.rung === "more")) assert.match(pack.words[it.w].ar, /^أَ/, `${it.w} uses the أَفْعَل mould`);
  }
  for (const st of of("scene")) assert.equal(new Set(st.items.map((it) => it.spot)).size >= 4, true);
});

test("prophets and angels appear only as name scrolls; Shaytan has no picture", () => {
  for (const id of ["w:musa", "w:ibrahim", "w:isa", "w:nuh", "w:rasul", "w:nabi", "w:malak"]) {
    assert.ok(pack.words[id].medal?.startsWith("scroll:") && !pack.words[id].pic, id);
  }
  assert.ok(!pack.words["w:shaytan"].pic, "w:shaytan");
  const sorts = pack.rooms.flatMap((r) => r.steps).filter((s) => s.type === "sort");
  // sort bins: two (good / bad) or three (one / two / many, from the verb tables)
  assert.ok(sorts.length >= 3 && sorts.every((s) => s.segments.length >= 2 && s.segments.length <= 3));
});

test("every visual explanation (tooltip + Picture Guide) has English and Urdu", async () => {
  const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../game/ui/tips.js", import.meta.url), "utf8"));
  const entries = [...src.matchAll(/(\w+): T\("([^"]+)", "([^"]+)"\)/g)];
  assert.ok(entries.length > 40, `found ${entries.length} explanations`);
  for (const [, key, en, ur] of entries) assert.ok(en.trim() && ur.trim() && en !== ur, key);
  // every data-tip key used in the game code must exist
  const fs = await import("node:fs");
  const keys = new Set(entries.map((e) => e[1]));
  const files = ["kit.js", "map.js", "room.js", "relight.js", "guide.js", ...fs.readdirSync(new URL("../game/ui/steps/", import.meta.url)).map((f) => `steps/${f}`)];
  for (const f of files) {
    const code = fs.readFileSync(new URL(`../game/ui/${f}`, import.meta.url), "utf8");
    for (const m of code.matchAll(/"data-tip": "(\w+)"/g)) assert.ok(keys.has(m[1]), `${f}: ${m[1]}`);
  }
});

test("every word id in the pack survives a save round-trip (ids with _ included)", () => {
  const ids = Object.keys(pack.words);
  const save = setCards(defaultSave(), ids.map((id) => newCard(id, 100)));
  const back = parseSave(serializeSave(save)).save;
  assert.deepEqual(Object.keys(back.cards).sort(), [...ids].sort());
});

test("finished rooms get back any word card the save is missing, due today", () => {
  const room = pack.rooms[1];
  const cards = Object.fromEntries(room.teaches.slice(1).map((id) => [id, newCard(id, 1)]));
  const out = missingCards(pack, { [room.id]: 1 }, cards, 50);
  assert.deepEqual(out.map((c) => [c.id, c.due, c.level]), [[room.teaches[0], 50, 1]], "level 1: a level-0 card is never due");
  assert.deepEqual(missingCards(pack, {}, {}, 50), []);
});

test("every Scene Hunt spot sits inside its scene and no two spots overlap", async () => {
  const { SCENES } = await import("../game/core/scenes.js");
  for (const [name, sc] of Object.entries(SCENES)) {
    const [w, h] = sc.ratio.split("/").map(Number);
    const pts = [...Object.values(sc.marks ?? {}), ...Object.values(sc.spots)];
    // compare in a 300-unit-wide scene with 58-unit spots (68 for big ones), as drawn on a phone
    const px = (p) => [(p.x / 100) * 300, (p.y / 100) * (300 * h) / w, p.big ? 34 : 29];
    for (const p of pts.map(px)) assert.ok(p[0] - p[2] >= -4 && p[1] - p[2] >= -4 && p[1] + p[2] <= (300 * h) / w + 4, `${name}: spot leaves the scene`);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const [a, b] = [px(pts[i]), px(pts[j])];
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) >= a[2] + b[2] - 6, `${name}: spots ${i} and ${j} overlap`);
    }
  }
});

test("every word the booklet lists on pp. 1–20 is taught by the end of Wing 3's review halls", async () => {
  const fs = await import("node:fs");
  const { WORDS } = await import("../authoring/words.js");
  const book = JSON.parse(fs.readFileSync(new URL("../data/build/book-coverage.json", import.meta.url), "utf8"));
  const taught = new Set(Object.values(WORDS).flatMap((w) => w.units).map((u) => u.normalize("NFC")));
  // Left for later on purpose: أَنْتُنَّ (never used in the Qur'an, so no card can carry it), the oath تَ;
  //   weak and augmented verbs (Wing 4+): آمَنَ ساءَ نَأَى اسْتَوَى تُصاحِبْ, and the doubled verbs the Urdu edition lists on p20.
  const laterUnit = /^(L:ضمير:2FP|A:ت\/oath|L:(آمَنَ|ساءَ|نَأَى|اسْتَوَى|تُصاحِبْ|ذَنُوب)$)/;
  const doubled = new Set(["حَيَّ", "رَدَّ", "صَدَّ", "ضَرَّ", "ضَلَّ", "ظَنَّ", "عَدَّ", "غَرَّ", "مَدَّ", "مَسَّ", "وَدَّ"].map((h) => h.normalize("NFC")));
  const missing = book.rows.filter((r) => r.page <= 20 && !doubled.has(r.head.normalize("NFC"))).flatMap((r) => r.units ?? [])
    .filter((u) => !laterUnit.test(u.normalize("NFC")) && !taught.has(u.normalize("NFC")));
  assert.deepEqual([...new Set(missing)], []);
});

test("Wing 5: every word the booklet lists on pp. 26–38 (the moulds II–X, verb partners) is taught", async () => {
  const fs = await import("node:fs");
  const { WORDS } = await import("../authoring/words.js");
  const book = JSON.parse(fs.readFileSync(new URL("../data/build/book-coverage.json", import.meta.url), "utf8"));
  const taught = new Set(Object.values(WORDS).flatMap((w) => w.units).map((u) => u.normalize("NFC")));
  const missing = book.rows.filter((r) => r.src === "en85" && r.page >= 26 && r.page <= 38).flatMap((r) => r.units ?? [])
    .filter((u) => !taught.has(u.normalize("NFC")));
  assert.deepEqual([...new Set(missing)], []);
  const grow = pack.rooms.flatMap((r) => r.steps).filter((s) => s.type === "grow");
  assert.ok(grow.length >= 4, "the grown-form rooms use the Mould Press");
});

test("Wing 5: every verb + partner word pair on booklet p38 is played in a Same Verb, New Path round", async () => {
  const fs = await import("node:fs");
  const { WORDS } = await import("../authoring/words.js");
  const book = JSON.parse(fs.readFileSync(new URL("../data/build/book-coverage.json", import.meta.url), "utf8"));
  const cardOf = (u) => Object.keys(WORDS).filter((id) => WORDS[id].units.some((x) => x.normalize("NFC") === u.normalize("NFC")));
  const played = pack.rooms.flatMap((r) => r.steps).filter((s) => s.type === "path").flatMap((s) => s.items);
  assert.ok(played.every((it) => it.pic && it.g.en && it.g.ur), "every pair has a meaning picture and both glosses");
  const pairs = book.rows.filter((r) => r.src === "en85" && r.page === 38 && (r.units ?? []).length === 2);
  const missing = pairs.filter((r) => !played.some((it) => cardOf(r.units[0]).includes(it.verb) && cardOf(r.units[1]).includes(it.with))).map((r) => r.head);
  assert.deepEqual(missing, []);
});

test("Wing 5: every cell of the verb tables (booklet pp. 39–42) is played in a game round", async () => {
  const fs = await import("node:fs");
  const book = JSON.parse(fs.readFileSync(new URL("../data/build/book-coverage.json", import.meta.url), "utf8"));
  // compare without sukun (the booklet writes فَعَلُوْا, the game فَعَلُوا) and with one alif spelling
  const norm = (s) => s.normalize("NFC").replace(/\u0652/g, "").replace(/^اَ/, "أَ").replace(/ى/g, "ي").trim().replace(/[\u064B-\u0650]$/, "");  // and the booklet's pause form: no last vowel
  const asked = new Set(pack.rooms.flatMap((r) => r.steps).flatMap((s) => s.items ?? []).filter((it) => it.ar).map((it) => norm(it.ar)));
  const cells = book.rows.filter((r) => r.src === "en85" && r.page >= 39 && r.page <= 42).flatMap((r) => r.head.split(/[،,]/).map(norm).filter(Boolean));
  assert.deepEqual([...new Set(cells.filter((c) => !asked.has(c)))], []);
});

test("Reading Room 1 ends Wing 1: all of Surah Al-Ikhlas, every word learnt, each line with its meaning", () => {
  const w1 = pack.rooms.filter((r) => r.wing === 1);
  assert.equal(w1.at(-1).id, "reading-room-1");
  const passage = w1.at(-1).steps.find((s) => s.type === "passage");
  assert.deepEqual(passage.ayat.map((a) => a.ref), ["112:1", "112:2", "112:3", "112:4"]);
  // each ayah ends with the credited translator's full meaning (Yusuf Ali / Junagarhi), phrases of a long ayah only on the last
  assert.ok(passage.ayat.every((a) => (a.end === false ? !a.tr : a.tr?.en && a.tr?.ur) && a.words.every((w) => !w.given && w.w.length)));
  // the Wing 1 rooms keep Qalam's helper words in 112:1 and 112:3; only the Reading Room teaches them
  const early = pack.rooms.flatMap((r) => r.steps).filter((s) => s.type === "ayah" && s.ref === "112:1");
  assert.ok(early.some((s) => s.words.some((w) => w.given)) && early.some((s) => s.words.every((w) => !w.given)));
  assert.ok(pack.words["w:samad"].medal && !pack.words["w:samad"].pic, "As-Samad is a name of Allah: medallion only");
});

test("every Reading Room closes its wing and reads a whole surah with only learnt words", () => {
  const reading = pack.rooms.filter((r) => r.id.startsWith("reading-room-"));
  assert.ok(reading.length >= 3);
  for (const room of reading) {
    const wing = pack.rooms.filter((r) => r.wing === room.wing);
    assert.equal(wing.at(-1).id, room.id, `${room.id} is the last room of Wing ${room.wing}`);
    const passage = room.steps.at(-1);
    assert.equal(passage.type, "passage", `${room.id} ends with the whole passage`);
    const refs = [...new Set(passage.ayat.map((a) => a.ref))];
    if (passage.whole === "surah") {
      const sura = refs[0].split(":")[0];
      assert.deepEqual(refs, [...corpus.byAyah.keys()].filter((r) => r.split(":")[0] === sura), `${room.id} reads all of surah ${sura}`);
    } else if (passage.whole === "ayah") assert.equal(refs.length, 1, `${room.id} reads one whole ayah`);
    else {
      // a passage: consecutive ayat of one surah, none skipped
      const [s0, a0] = refs[0].split(":").map(Number);
      assert.deepEqual(refs, refs.map((_, k) => `${s0}:${a0 + k}`), `${room.id} reads consecutive ayat`);
    }
    // every ayah read in parts is read word for word, nothing skipped or repeated
    for (const ref of refs) {
      const parts = passage.ayat.filter((a) => a.ref === ref);
      if (parts[0].part) assert.deepEqual(parts.flatMap((a) => [a.part[0], a.part[1]]).join(","), parts.map((a, k) => [k ? parts[k - 1].part[1] + 1 : 1, a.part[1]]).flat().join(","), `${ref} parts are contiguous`);
      if (parts[0].part) assert.ok(parts.at(-1).end, `${ref} parts reach the end of the ayah`);
    }
    assert.ok(passage.ayat.every((a) => (a.end === false ? !a.tr : a.tr?.en && a.tr?.ur) && a.words.every((w) => !w.given)));
  }
});

test("Wing 3: every Six Petals form grows from its root and every verb card has a picture prompt", async () => {
  const { ART } = await import("../authoring/art.js");
  const { WORDS } = await import("../authoring/words.js");
  const petals = pack.rooms.flatMap((r) => r.steps).filter((s) => s.type === "petals");
  assert.ok(petals.length >= 4);
  for (const st of petals) assert.equal(new Set(st.items.map((it) => it.petal)).size, st.items.length, "each petal asked once per round");
  for (const id of Object.keys(pack.words).filter((k) => k.startsWith("w:"))) {
    if (WORDS[id].pic) assert.ok(ART[id], `${id} has a picture prompt`);
  }
});

test("mastery check: every word right twice in a row, misses and hints never count, direction alternates", () => {
  let st = startMastery(["w:a", "w:b", "w:c"]);
  assert.equal(direction(st, "w:a"), "toPic");
  st = answer(st, "right");                                // a: 1
  assert.equal(direction(st, "w:a"), "toWord");
  assert.deepEqual(st.queue, ["w:b", "w:c", "w:a"]);
  st = answer(st, "wrong");                                // b: reset, back 2 later
  assert.deepEqual(st.queue, ["w:c", "w:a", "w:b"]);
  st = answer(st, "hinted");                               // c: hint neither counts nor resets
  assert.equal(st.streak["w:c"], 0);
  st = answer(st, "right");                                // a: 2 → mastered
  assert.deepEqual(st.done, ["w:a"]);
  for (let k = 0; k < 20 && !isMastered(st); k++) st = answer(st, "right");
  assert.ok(isMastered(st));
  assert.ok(st.tries["w:b"] >= 3 && st.tries["w:c"] >= 3, "a missed or hinted word needs two more clean answers");
});
