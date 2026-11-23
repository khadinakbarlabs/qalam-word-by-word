// "Tell these apart": two words the player keeps mixing up (core/srs.js drillPairs) are shown side by side. One
// meaning is asked; the two Arabic words are the only choices. After the answer both pairings are shown for a moment.
// It is practice, not a test: nothing is graded. Answered right first time with no help, the mix-up is settled
// (core/srs.js settleMixup) and the question does not come back; otherwise it will be asked again another day.
import { h, ar, sayLine, meaningPrompt, pairLine, wait, wobble } from "../kit.js";
import { t } from "../../i18n.js";
import { hashText } from "../../core/options.js";

const AFTER_MS = 1700;

/** One question about `pair` ([idA, idB]). begin(id, answerEl): a question about word `id` is open and `answerEl` is
 *  its right choice (the caller points Show me at it); flags(): what happened to it so far ({ missed, hinted,
 *  revealed }). Resolves { asked, other, clean }. */
export function askTellApart({ stage, words, pair, seed = 0, begin = () => {}, flags = () => ({}) }) {
  return new Promise((done) => {
    const key = hashText(`${pair.join("|")}|${seed}`);
    const [asked, other] = key % 2 === 0 ? pair : [pair[1], pair[0]];
    const order = (key >> 1) % 2 === 0 ? [asked, other] : [other, asked];
    let answered = false;
    let missed = false;
    const after = h("div", { class: "tell-after" });
    let answerEl = null;
    const choices = order.map((id) => {
      const w = words[id];
      const b = h("button", { class: "choice", "aria-label": w.ar }, ar(w.ar, "opt-ar"), sayLine(w.say));
      b.addEventListener("click", async () => {
        if (answered) return;
        if (id !== asked) { missed = true; return wobble(b, "why_tell", w); }
        answered = true;
        const how = flags();
        b.classList.add("right");
        after.replaceChildren(pairLine(words[asked], "pair learned"), pairLine(words[other], "pair"));
        await wait(AFTER_MS);
        done({ asked, other, clean: !missed && !how.missed && !how.hinted && !how.revealed });
      });
      if (id === asked) answerEl = b;
      return b;
    });
    stage.replaceChildren(h("div", { class: "tell" },
      h("span", { class: "tell-title", "data-t": "tellApart" }, t("tellApart")),
      h("div", { class: "prompt" }, meaningPrompt(words[asked])),
      h("div", { class: "tell-pair" }, choices),
      after));
    begin(asked, answerEl);
  });
}
