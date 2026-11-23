// Which uncaught errors are the game's own (pure). The window-level safety net (main.js) shows the "Something went
// wrong" card only for these: an error thrown by a file under the game's own folder. Anything else (the YouTube SDK
// script, a browser extension, the harmless "ResizeObserver loop" notice, a cancelled request) is left alone, so a
// stray outside error never interrupts a working game.

const HARMLESS = /ResizeObserver loop|Script error\.?$/i;
const HARMLESS_NAMES = new Set(["AbortError", "NotAllowedError", "TimeoutError"]);

/** info: { filename, stack, name, message } from an ErrorEvent or a rejection reason; base: the game folder's URL. */
export function isOwnError(info, base) {
  if (!info || !base) return false;
  if (HARMLESS_NAMES.has(info.name ?? "")) return false;
  if (HARMLESS.test(info.message ?? "")) return false;
  if (typeof info.filename === "string" && info.filename) return info.filename.startsWith(base);
  return typeof info.stack === "string" && info.stack.includes(base);
}
