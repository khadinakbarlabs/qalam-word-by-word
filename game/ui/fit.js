// Fit to screen (Khadin, 2026-11-05: "the things fit on the screen on mobile and on the desktop"). A screen whose
// content is taller or wider than its box is shrunk with CSS zoom until it fits, never below minZoom() (beyond that
// it scrolls inside the box). Zoom changes the layout width too, so smaller cards reflow more per row and the shrink stays
// mild. Within one step the zoom only goes down (cards lighting up or a translation appearing never make the screen
// jump bigger again); a new step (the box's first child changes) or a resize starts again from full size.
// The floors are mild on purpose: pictures and tap targets must stay usable, so past them the screen scrolls inside
// its own box. Text has its own floors that undo the zoom (feel.css --t-cap / --t-ur / --t-ar read --fz): captions
// never go under 14 px and Arabic never under 24 px, whatever the zoom.
const MIN_ZOOM = 0.85;
const MIN_ZOOM_SHORT = 0.75; // short screens (landscape phones): a little smaller is better than scrolling
const SHORT = 520; // the same line the stylesheets use for "short and wide"
const minZoom = () => (innerHeight < SHORT ? MIN_ZOOM_SHORT : MIN_ZOOM);
const SEARCH_STEPS = 6;

const overflows = (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;

/** The largest zoom in [low, high] at which `el` fits (binary search; each probe is one layout). */
const setZoom = (el, z) => {
  el.style.zoom = z === 1 ? "" : String(z);
  // rows with a max width (the stage, card rows) widen by 1 / zoom, so smaller cards spread out instead of stacking
  if (z === 1) el.style.removeProperty("--fz");
  else el.style.setProperty("--fz", String(z));
};

function bestZoom(el, low, high) {
  setZoom(el, high);
  if (!overflows(el)) return high;
  setZoom(el, low);
  if (overflows(el)) return low;
  let lo = low;
  let hi = high;
  for (let i = 0; i < SEARCH_STEPS; i++) {
    const mid = (lo + hi) / 2;
    setZoom(el, mid);
    if (overflows(el)) hi = mid;
    else lo = mid;
  }
  return Math.floor(lo * 100) / 100;
}

// Screens being watched. A screen that has been replaced is no longer in the page, but nothing tells its observers
// (they only run on a change inside it or a window resize), so they would hold the old screen and its pictures in
// memory. Every new keepFitted() call, and stopDetached() from the map, stops the ones whose screen is gone.
const watched = new Map();

/** Stop watching every screen that is no longer in the page. */
export function stopDetached() {
  for (const [el, stop] of [...watched]) if (!el.isConnected) stop();
}

/** Keep `el` fitted from now on. Returns a function that stops watching. */
export function keepFitted(el) {
  stopDetached();
  let first = null;
  let zoom = 1;
  let queued = false;
  let fullNext = true;
  const fit = () => {
    queued = false;
    if (!el.isConnected) { stop(); return; } // the screen was replaced: stop watching
    const fresh = fullNext || el.firstElementChild !== first;
    fullNext = false;
    first = el.firstElementChild;
    zoom = bestZoom(el, minZoom(), fresh ? 1 : zoom);
    setZoom(el, zoom);
  };
  const queue = (fromFull = false) => {
    if (fromFull) fullNext = true;
    if (queued) return;
    queued = true;
    requestAnimationFrame(fit);
  };
  const mutations = new MutationObserver(() => queue());
  mutations.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class"] });
  // a picture or font that finishes loading changes the height without changing the page: fit again
  const onLoad = () => queue();
  el.addEventListener("load", onLoad, true);
  document.fonts?.ready.then(onLoad);
  // a font that starts loading later (the Urdu font, fetched only once Urdu is picked) fits again when it is in
  document.fonts?.addEventListener?.("loadingdone", onLoad);
  // a resize (rotation, window size) starts from full size again
  let lastSize = "";
  const resize = new ResizeObserver(() => {
    const size = `${innerWidth}x${innerHeight}`;
    if (size !== lastSize) { lastSize = size; queue(true); }
  });
  resize.observe(document.documentElement);
  function stop() { mutations.disconnect(); resize.disconnect(); el.removeEventListener("load", onLoad, true); document.fonts?.removeEventListener?.("loadingdone", onLoad); watched.delete(el); }
  watched.get(el)?.(); // the same screen asked twice: one watcher is enough
  watched.set(el, stop);
  queue(true);
  return stop;
}
