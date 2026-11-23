// How long a tooltip stays up (pure): long enough to read it. A short label keeps the old 2.2 s; longer text gets
// time per character at a beginner's reading speed, up to a limit so a bubble never sits there for good.
export const TIP_MIN_MS = 2200;
export const TIP_MAX_MS = 12000;
const TIP_BASE_MS = 1200;
const MS_PER_CHAR = 70;

export const tipShowMs = (text) => Math.min(TIP_MAX_MS, Math.max(TIP_MIN_MS, TIP_BASE_MS + MS_PER_CHAR * [...String(text ?? "")].length));
