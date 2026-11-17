// Game signs: the painted pictures for the game's own symbols (lamp, Qalam's pen, the bins, the intro…), loaded once
// from the pack's "ui:" entries. Each call names its emoji fallback, shown only while that painting is missing.
let words = {};
export const setSigns = (packWords) => { words = packWords ?? {}; };
export const sign = (key, emoji, badge = "") => {
  const p = words[key]?.pic;
  return (typeof p === "string" && p.startsWith("img:") ? p : emoji) + badge;
};
