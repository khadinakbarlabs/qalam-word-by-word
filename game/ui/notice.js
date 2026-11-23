// Small notices ("Not saved yet…", "This room did not open…"). They sit under the header, never over the bottom
// controls, carry a visible ✕, and can time out on the game clock. One notice per id: showing it again replaces it.
import { icon } from "./icons.js";
import { h } from "./kit.js";
import { t } from "../i18n.js";
import { later } from "../core/clock.js";

const open = new Map();

export function hideNotice(id) {
  open.get(id)?.();
}

/** key: i18n key. timeoutMs: remove by itself after this long (0 = stays until ✕ or hideNotice). */
export function showNotice(id, key, { timeoutMs = 0, role = "status" } = {}) {
  hideNotice(id);
  let cancel = () => {};
  const el = h("div", { class: "notice", role },
    h("span", { class: "notice-text", "data-t": key }, t(key)),
    h("button", { class: "notice-x", "aria-label": t("close"), "data-t-aria": "close", onclick: () => remove() }, icon("close")));
  const remove = () => {
    cancel();
    el.remove();
    if (open.get(id) === remove) open.delete(id);
  };
  open.set(id, remove);
  // on <body>, not in #app: the next screen replaces #app's contents and would remove it
  document.body.append(el);
  if (timeoutMs > 0) cancel = later(remove, timeoutMs);
  return remove;
}
