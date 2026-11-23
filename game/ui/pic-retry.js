// A painted picture that does not load (audit Phase F): it is asked for once more, and if that fails too its place
// becomes a plain tile and the caption next to it is shown even when captions are switched off, so the question can
// still be answered. Styles: the inline block in index.html (.pic-missing).
import { later } from "../core/clock.js";

const RETRY_MS = 1200;
const RETRIED = "retried";

/** The address to ask for the second time: the same file, past a cached failure. */
export const retryUrl = (src) => `${src}${src.includes("?") ? "&" : "?"}retry=1`;

function onPictureError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains("pic-img")) return;
  if (img.dataset[RETRIED]) {
    img.closest(".pic")?.classList.add("pic-missing");
    return;
  }
  img.dataset[RETRIED] = "1";
  const src = img.getAttribute("src");
  later(() => { if (img.isConnected && src) img.src = retryUrl(src); }, RETRY_MS);
}

/** Watch every picture in the page. "error" does not bubble, so it is caught on the way down. */
export function installPicRetry(root = document) {
  root.addEventListener("error", onPictureError, true);
}
