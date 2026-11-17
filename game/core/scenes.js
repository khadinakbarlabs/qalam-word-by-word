// Scene Hunt scenes (game/ui/steps/scene.js), kept free of DOM code so the pack builder can validate against them.
// Each scene: ratio (width / height), layers = backdrop shapes drawn by CSS (.layer-<name>), marks = fixed pictures
// that are not answers (the "me" in the family tree), spots = the tappable things.
// x/y = centre of a spot in % of the scene; big = a whole area (sky, earth, day, night) rather than one thing;
// art = the word whose painting stands on the spot (the emoji pic is the fallback until it exists).
// Spot ids are unique across scenes: each one has its explanation in game/ui/tips.js.
export const SCENES = {
  signs: {
    ratio: "4 / 3",
    layers: ["sky-day", "sky-night", "ground", "water"],
    spots: {
      sky: { x: 50, y: 12, pic: "☁️", art: "w:sama" },
      sun: { x: 13, y: 22, pic: "🌞", art: "w:shams" },
      moon: { x: 87, y: 22, pic: "🌙", art: "w:qamar" },
      day: { x: 26, y: 50, pic: "🔆", art: "w:nahar", big: true },
      night: { x: 74, y: 50, pic: "✨", art: "w:layl", big: true },
      wind: { x: 50, y: 38, pic: "🌬️", art: "w:rih" },
      mountain: { x: 13, y: 70, pic: "⛰️", art: "w:jabal" },
      cattle: { x: 57, y: 76, pic: "🐄", art: "w:anam" },
      sea: { x: 86, y: 80, pic: "🌊", art: "w:bahr" },
      earth: { x: 34, y: 86, pic: "🟫", art: "w:ard", big: true },
    },
  },
  // A family tree seen from "me" in the middle: parents above, brother and spouse beside, children below.
  family: {
    ratio: "4 / 3",
    layers: ["tree-v", "tree-top", "tree-mid", "tree-low"],
    marks: { me: { x: 50, y: 50, pic: "🙋", art: "w:ana" } },
    spots: {
      father: { x: 28, y: 15, pic: "👨", art: "w:ab" },
      mother: { x: 72, y: 15, pic: "👩", art: "w:umm" },
      brother: { x: 13, y: 50, pic: "👨‍🦱", art: "w:akh" },
      spouse: { x: 87, y: 50, pic: "💍", art: "w:zawj" },
      son: { x: 28, y: 85, pic: "👦", art: "w:ibn" },
      daughter: { x: 56, y: 85, pic: "👧", art: "w:bint" },
      offspring: { x: 86, y: 85, pic: "👶👶", art: "w:dhurriyya" },
    },
  },
  // A standing figure; the spots sit on (or point at) the body part.
  body: {
    ratio: "3 / 4",
    layers: ["b-head", "b-torso", "b-arm-l", "b-arm-r", "b-leg-l", "b-leg-r"],
    spots: {
      face: { x: 50, y: 12, pic: "🙂", art: "w:wajh" },
      eye: { x: 20, y: 7, pic: "👁️", art: "w:basar" },
      mouth: { x: 80, y: 7, pic: "👄", art: "w:afwah" },
      tongue: { x: 82, y: 22, pic: "👅", art: "w:lisan" },
      chest: { x: 36, y: 31, pic: "🫁", art: "w:sadr" },
      heart: { x: 64, y: 35, pic: "❤️", art: "w:qalb" },
      belly: { x: 50, y: 50, pic: "🤰", art: "w:batn" },
      hand: { x: 15, y: 58, pic: "🖐️", art: "w:yad" },
      foot: { x: 40, y: 91, pic: "🦶", art: "w:rijl" },
    },
  },
  // Sides around "you": right and left hands, here at your feet, there far off.
  sides: {
    ratio: "4 / 3",
    layers: ["sides-floor", "sides-far"],
    marks: { me: { x: 50, y: 50, pic: "🙋", art: "w:ana" } },
    spots: {
      right: { x: 85, y: 50, pic: "🫱", art: "w:yamin" },
      left: { x: 15, y: 50, pic: "🫲", art: "w:shimal" },
      here: { x: 50, y: 84, pic: "⬇️", art: "w:huna" },
      there: { x: 82, y: 14, pic: "🚩", art: "w:hunalika" },
    },
  },
  town: {
    ratio: "4 / 3",
    layers: ["town-sky", "town-hills", "town-ground", "town-road"],
    spots: {
      town: { x: 78, y: 22, pic: "🏘️", art: "w:qarya" },
      mosque: { x: 44, y: 38, pic: "🕌", art: "w:masjid" },
      house: { x: 15, y: 50, pic: "🏠", art: "w:bayt" },
      tree: { x: 89, y: 56, pic: "🌲", art: "w:shajar" },
      people: { x: 52, y: 62, pic: "👥", art: "w:nas" },
      wealth: { x: 18, y: 82, pic: "💰", art: "w:mal" },
      path: { x: 50, y: 87, pic: "🛣️", art: "w:sabil" },
      goods: { x: 80, y: 84, pic: "🧺", art: "w:mataa" },
    },
  },
};
