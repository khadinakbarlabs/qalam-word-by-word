// YouTube Playables SDK wrapper (adapted from english-fixup). No ads in this game (PLAN D7).
// Saves are allowed only after a successful loadData(); a failed load blocks saves so defaults never overwrite
// the player's real progress. Outside Playables (local preview, other web hosts) progress lives in localStorage.
// The SDK script also loads outside YouTube, where its calls fail, so it only counts inside the Playables host.
import { wait } from "./core/clock.js";  // retries also freeze while YouTube has the game paused

const sdk = typeof ytgame !== "undefined" && ytgame.IN_PLAYABLES_ENV ? ytgame : null;
const LOCAL_KEY = "qw-save";

let loadSettled = false;
let saveBlocked = false;
let firstFrameSent = false;
let readySent = false;
const LOAD_RETRY_MS = [600, 1800];
const local = {
  get() { try { return localStorage.getItem(LOCAL_KEY) ?? ""; } catch { return ""; } },
  set(v) { try { localStorage.setItem(LOCAL_KEY, v); return true; } catch { return false; } },
};

export const playables = {
  inEnvironment: Boolean(sdk?.IN_PLAYABLES_ENV),

  get saveBlocked() {
    return saveBlocked;
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

  async loadData() {
    if (!sdk?.game?.loadData) { loadSettled = true; return local.get(); }
    for (let attempt = 0; ; attempt++) {
      try {
        const data = await sdk.game.loadData();
        loadSettled = true;
        saveBlocked = false;
        return data;
      } catch {
        sdk?.health?.logWarning?.();
        if (attempt >= LOAD_RETRY_MS.length) { saveBlocked = true; return ""; }
        await wait(LOAD_RETRY_MS[attempt]);
      }
    }
  },

  logError() {
    sdk?.health?.logError?.();
  },

  // Resolves true only when the save succeeded.
  async saveData(value) {
    if (!loadSettled || saveBlocked) return false;
    if (!sdk?.game?.saveData) return local.set(value);
    try { await sdk.game.saveData(value); return true; }
    catch { sdk?.health?.logError?.(); return false; }
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
  async getLanguage() {
    if (!sdk?.system?.getLanguage) return "en";
    try { return await sdk.system.getLanguage(); }
    catch { return "en"; }
  },
};
