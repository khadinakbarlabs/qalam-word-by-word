// What a word question shows (pure). The rule (docs/AUDIT_2026-11-23.md): a question must test MEANING. A word shown
// as calligraphy (a Name of Allah's medallion, a prophet's name scroll, plain ink) has no picture, and its medallion
// IS its Arabic, so it can never stand on the meaning side of a question: there the meaning is written out instead.
//   toPic   the Arabic is the prompt; each choice shows a meaning (a picture with its caption, or written meaning)
//   toWord  the meaning is the prompt; each choice shows Arabic
// So no question shows the answer's Arabic on both sides.

/** Does this word (or ayah tile) have calligraphy and no picture? */
export const isCalligraphy = (face) => Boolean(face?.medal);

/** How the MEANING side of a question shows this word: "written" (the meaning as text) or "picture". */
export const meaningSide = (face) => (isCalligraphy(face) ? "written" : "picture");

/** What the two sides of a question show: { prompt, choice }, each "arabic" | "written" | "picture". */
export const questionSides = (face, mode) => (mode === "toPic"
  ? { prompt: "arabic", choice: meaningSide(face) }
  : { prompt: meaningSide(face), choice: "arabic" });
