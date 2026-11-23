// The "what the picture shows" line on a card (the back of a Meet card, a Words-tab card). The lines come in their own
// file after the first screen (ui/why.js), so a card drawn before they arrive gets an empty place that is filled in
// when they do.
import { h, cap } from "./kit.js";
import { whenWhy, whyCaption } from "./why.js";

/** A place for the picture line of word `id`; `onLine` (optional) runs once the line is known to be there. */
export function whyLine(id, onLine) {
  const slot = h("span", { class: "why-slot" });
  whenWhy(() => {
    const line = whyCaption(id);
    if (!line) return;
    slot.replaceChildren(cap(line, "cap why"));
    onLine?.();
  });
  return slot;
}
