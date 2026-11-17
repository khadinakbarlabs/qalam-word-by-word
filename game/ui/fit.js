// Fit to screen (Khadin, 2026-11-05: "the things fit on the screen on mobile and on the desktop"). A screen whose
// content is taller or wider than its box is shrunk with CSS zoom until it fits, never below minZoom() (beyond that
// it scrolls, as before). Zoom changes the layout width too, so smaller cards reflow more per row and the shrink stays
// mild. Within one step the zoom only goes down (cards lighting up or a translation appearing never make the screen
// jump bigger again); a new step (the box's first child changes) or a resize starts again from full size.
const MIN_ZOOM = 0.7;
const MIN_ZOOM_SHORT = 0.6; // landscape phones (under 480 px tall): a little smaller is better than scrolling
const SHORT = 480;
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

/** Keep `el` fitted from now on. Returns a function that stops watching. */
export function keepFitted(el) {
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
  // a resize (rotation, window size) starts from full size again
  let lastSize = "";
  const resize = new ResizeObserver(() => {
    const size = `${innerWidth}x${innerHeight}`;
    if (size !== lastSize) { lastSize = size; queue(true); }
  });
  resize.observe(document.documentElement);
  function stop() { mutations.disconnect(); resize.disconnect(); el.removeEventListener("load", onLoad, true); }
  queue(true);
  return stop;
}
