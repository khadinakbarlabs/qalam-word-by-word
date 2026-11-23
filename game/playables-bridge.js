// YouTube Playables SDK wrapper (adapted from english-fixup). No ads in this game (PLAN D7).
// Saves are allowed only after a successful loadData(); a failed load blocks saves so defaults never overwrite
// the player's real progress. Outside Playables (local preview, other web hosts) progress lives in localStorage.
// The SDK script also loads outside YouTube, where its calls fail, so it only counts inside the Playables host.
// Every SDK promise has a time limit: a call that never answers ends like a failed one (retry, or a clear screen)
// instead of freezing the game. createPlayables() takes the SDK and storage as arguments so tests can pass fakes.
// load retries freeze while YouTube has the game paused; a save's time limit runs in real time (a pause is when it matters most)
import { wait as clockWait, later as clockLater, realLater } from "./core/clock.js";
import { withTimeout, withRetry } from "./core/async.js";

const LOCAL_KEY = "qw-save";
// worst case before the "Try again" screen: 3 tries x 4 s + 0.5 s + 1.5 s = 14 s
export const LOAD_RETRY_MS = [500, 1500];
export const LOAD_TIMEOUT_MS = 4000;
export const SAVE_TIMEOUT_MS = 8000;
export const LANG_TIMEOUT_MS = 2000;

/** loadData() gave up: the player's save is unknown, so nothing may be written over it. */
export class LoadError extends Error {
  constructor() {
    super("the saved game could not be loaded");
    this.name = "LoadError";
  }
}

/** sdk: `ytgame` inside the Playables host, else null. storage(): the browser's localStorage (may throw).
 *  wait / later: the game clock (frozen by a pause). saveLater: the timer for a save's time limit (real time). */
export function createPlayables({ sdk = null, storage = () => null, wait = clockWait, later = clockLater, saveLater = realLater } = {}) {
  let loadSettled = false;
  let saveBlocked = false;
  let firstFrameSent = false;
  let readySent = false;
  const local = {
    get() { try { return storage()?.getItem(LOCAL_KEY) ?? ""; } catch { return ""; } },
    set(v) { try { storage().setItem(LOCAL_KEY, v); return true; } catch { return false; } },
  };

  return {
    inEnvironment: Boolean(sdk?.IN_PLAYABLES_ENV),

    get saveBlocked() {
      return saveBlocked;
    },

    /** True once the save has been loaded and nothing blocks writing: only then may the game save. */
    get canSave() {
      return loadSettled && !saveBlocked;
    },

    // Call when loaded data exists but cannot be read (corrupt or from a newer version).
    blockSaves() {
      saveBlocked = true;
    },

    firstFrameReady() {
      if (firstFrameSent) return;
      firstFrameSent = true;
      sdk?.game?.firstFrameReady?.();
    },

    gameReady() {
      if (readySent) return;
      readySent = true;
      sdk?.game?.gameReady?.();
    },

    /** Resolves to the saved string ("" = nothing saved yet). Rejects with LoadError when every try failed or ran out
     *  of time; saves then stay off until a later loadData() succeeds. */
    async loadData() {
      if (!sdk?.game?.loadData) {
        loadSettled = true;
        saveBlocked = false;
        return local.get();
      }
      try {
        const data = await withRetry(() => withTimeout(sdk.game.loadData(), LOAD_TIMEOUT_MS, later), LOAD_RETRY_MS,
          { wait, onFail: () => sdk?.health?.logWarning?.() });
        loadSettled = true;
        saveBlocked = false;
        return typeof data === "string" ? data : "";
      } catch {
        loadSettled = false;
        throw new LoadError();
      }
    },

    logError() {
      sdk?.health?.logError?.();
    },

    // Resolves true only when the save succeeded (false: not loaded yet, blocked, refused, or no answer in time).
    async saveData(value) {
      if (!loadSettled || saveBlocked) return false;
      if (!sdk?.game?.saveData) return local.set(value);
      try {
        await withTimeout(sdk.game.saveData(value), SAVE_TIMEOUT_MS, saveLater);
        return true;
      } catch {
        sdk?.health?.logError?.();
        return false;
      }
    },

    onPause(callback) {
      return sdk?.system?.onPause?.(callback) ?? (() => {});
    },

    onResume(callback) {
      return sdk?.system?.onResume?.(callback) ?? (() => {});
    },

    // Game audio on/off from YouTube: ui/sound.js plays nothing while it is off.
    isAudioEnabled() {
      return sdk?.system?.isAudioEnabled?.() ?? true;
    },

    onAudioEnabledChange(callback) {
      return sdk?.system?.onAudioEnabledChange?.(callback) ?? (() => {});
    },

    // The YouTube language only (I18N-02 forbids browser language APIs); outside Playables the game starts in English.
    // No answer in time, or a failure, also means English: the player can still pick Urdu on the first screen.
    async getLanguage() {
      if (!sdk?.system?.getLanguage) return "en";
      try {
        const code = await withTimeout(sdk.system.getLanguage(), LANG_TIMEOUT_MS, later);
        return typeof code === "string" && code ? code : "en";
      } catch {
        return "en";
      }
    },
  };
}

const hostSdk = typeof ytgame !== "undefined" && ytgame.IN_PLAYABLES_ENV ? ytgame : null;
export const playables = createPlayables({ sdk: hostSdk, storage: () => localStorage });
