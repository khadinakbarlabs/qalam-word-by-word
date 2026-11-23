// What the game does once the pack, the language and the cloud save have been asked for (pure). main.js draws the
// screen this names; the rule it keeps is that a returning player is never started on an empty game without being
// told, and that a save which was not loaded and understood is never written over.
import { parseSave } from "./save.js";

/** hasPack: content/pack.json arrived. loaded: the settled loadData() ({ status, value } or { status, reason }).
 *  Returns { screen, save, canPlayUnsaved, blockSaves }:
 *    screen "play"            the save was read (save = the parsed save; "" means a new player)
 *    screen "bootError"       the game's own files did not load (nothing to play), or the load failed in an unknown way
 *    screen "saveLoadError"   the cloud save did not answer after every try
 *    screen "saveUnreadable"  the stored data cannot be read      } blockSaves: the stored data stays as it is
 *    screen "saveNewer"       it was written by a newer version   }
 *  canPlayUnsaved: the game itself is ready, so the screen may also offer "Play without saving". */
export function bootOutcome({ hasPack, loaded }) {
  const stop = (screen, canPlayUnsaved, blockSaves = false) => ({ screen, save: null, canPlayUnsaved, blockSaves });
  if (!hasPack) return stop("bootError", false);
  if (loaded?.status !== "fulfilled") return stop(loaded?.reason?.name === "LoadError" ? "saveLoadError" : "bootError", true);
  const parsed = parseSave(loaded.value);
  if (parsed.blocked) return stop(parsed.reason === "newer" ? "saveNewer" : "saveUnreadable", true, true);
  return { screen: "play", save: parsed.save, canPlayUnsaved: false, blockSaves: false };
}

/** Who owns the screen (pure). One screen owns the game at a time: take() hands it to a new one and returns its
 *  token; a screen that was replaced sees owns(token) === false when its promise ends later, and stops.
 *  lock() is the door lock: true for the first tap, false for every tap after it until unlock() or the next take(),
 *  so a double tap cannot start a room twice and a room still loading cannot replace the screen that came after. */
export function createScreens() {
  let current = 0;
  let locked = false;
  return {
    take() { locked = false; current += 1; return current; },
    owns: (token) => token === current,
    lock() { if (locked) return false; locked = true; return true; },
    unlock() { locked = false; },
    get current() { return current; },
    get locked() { return locked; },
  };
}
