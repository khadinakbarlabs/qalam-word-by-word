// E8 Reading Room: a whole famous passage (a short surah), every word one the player has learnt.
// Tap each ayah line in order: its words show their meanings and, at the end of each ayah, the translator's full
// meaning appears under it (a long ayah read in phrases shows it once, under its last phrase).
// The passage is split into pages that fit the screen (Khadin: everything fits, phone and desktop): page breaks are
// measured with every line already lit (meanings and translations showing), so a page never grows past the screen;
// "Next page ▶" turns the page. When every line is lit, the room says so with the share of the passage's words known.
import { nextIcon } from "../icons.js";
import { h, ar, cap, wait, translationBlock } from "../kit.js";
import { t } from "../../i18n.js";
import { tipText, explain } from "../tips.js";
import { whyOf } from "../why.js";

const arabicDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

export function run(ctx, step) {
  return new Promise((done) => {
    const all = step.ayat.flatMap((a) => a.words);
    // a famous single ayah (Ayat al-Kursi) says "the whole ayah", a surah "the whole surah"
    const doneKey = { ayah: "readDoneAyah", passage: "readDonePassage" }[step.whole] ?? "readDone";
    const knownCount = all.filter((w) => !w.given && w.w.every((id) => ctx.met.has(id))).length;
    // a re-read (finished Reading Room) marks the words whose lamps have gone dim: due for Relight
    const isFaded = (w) => Boolean(ctx.reread) && w.w.some((id) => ctx.faded?.has(id));
    const fadedCount = all.filter(isFaded).length;
    const next = h("button", { class: "next-btn", hidden: true, "aria-label": t("next"), onclick: () => done() }, nextIcon());
    const fadedKey = fadedCount ? "readFaded" : "readBright";
    const finale = h("div", { class: "read-finale", hidden: true },
      h("strong", { "data-t": doneKey }, t(doneKey)),
      ctx.reread
        ? h("span", { class: "read-count" }, fadedCount ? `${fadedCount} ` : "", h("span", { "data-t": fadedKey }, t(fadedKey)))
        : h("span", { class: "read-count" }, `${knownCount} / ${all.length} `, h("span", { "data-t": "readKnown" }, t("readKnown"))));
    let lit = 0;
    const pageBtn = h("button", { class: "next-btn", "aria-label": t("readNextPage"), "data-t-aria": "readNextPage" }, nextIcon());

    const lines = step.ayat.map((a, k) => {
      const ayahNo = Number(a.ref.split(":")[1]);
      const tiles = a.words.map((w, j) => tipText(h("span", { class: `tile read-tile${isFaded(w) ? " faded" : ""}` },
        h("span", { class: "ar-line", lang: "ar", dir: "rtl" }, w.lead ? `${w.lead} ` : "", w.ar,
          w.mark ? h("span", { class: "mark" }, ` ${w.mark}`) : null,
          j === a.words.length - 1 && a.end !== false ? h("span", { class: "num" }, ` ﴿${arabicDigits(ayahNo)}﴾`) : null),
        h("span", { class: "gl" })), explain({ ...w, why: w.why ?? w.w.map(whyOf).find(Boolean) })));
      const say = h("div", { class: "read-say", hidden: true }, translationBlock(a.tr, "read-tr"));
      const label = a.tr?.en ?? a.words.map((w) => w.g.en).join(" ");
      const line = h("button", { class: "read-line", "aria-label": label, "data-tip": "readLine" }, h("span", { class: "ayah" }, tiles));
      line.addEventListener("click", async () => {
        if (k !== lit) return;  // read in order, top to bottom
        a.words.forEach((w, j) => tiles[j].querySelector(".gl").replaceChildren(cap(w.g)));
        line.classList.add("lit");
        say.hidden = !a.tr;
        lit++;
        if (lit < lines.length) return ctx.target(lines[lit].line);
        await wait(500);
        finale.hidden = false;
        next.hidden = false;
        ctx.target(next);
      });
      // how the line looks once read (for measuring page breaks), and back
      const preview = (on) => {
        a.words.forEach((w, j) => tiles[j].querySelector(".gl").replaceChildren(...(on ? [cap(w.g)] : [])));
        say.hidden = !(on && a.tr);
      };
      return { line, say, preview };
    });

    const pageNo = h("span", { class: "read-pageno" });
    const head = h("div", { class: "read-head" }, h("span", { class: "read-label", "data-t": "readingRoom" }, t("readingRoom")),
      ar(step.title.ar, "read-title"), cap(step.title), pageNo);
    const page = h("div", { class: "read-page" });
    const foot = h("div", { class: "row-end" }, next, pageBtn);
    const pages = paginate(ctx.stage, [head, page, finale, foot], page, lines);

    const showPage = (n) => {
      const [from, to] = pages[n];
      pageNo.textContent = pages.length > 1 ? `${t("readPage")} ${n + 1} / ${pages.length}` : "";
      page.replaceChildren(...lines.slice(from, to).flatMap(({ line, say }) => [line, say]));
      pageBtn.hidden = true;
      ctx.stage.scrollTop = 0;
    };
    // the last line of a page is read: offer the next page (the last page goes on to the finale instead)
    const pageEnds = new Set(pages.slice(0, -1).map(([, to]) => to));
    let current = 0;
    pageBtn.addEventListener("click", () => {
      current++;
      showPage(current);
      ctx.target(lines[lit].line);
    });
    lines.forEach(({ line }) => line.addEventListener("click", () => {
      if (!pageEnds.has(lit) || pages[current][1] !== lit) return;
      pageBtn.hidden = false;
      ctx.target(pageBtn);
    }));

    showPage(0);
    ctx.target(lines[0].line);
    ctx.firstShow();
  });
}

/** Page breaks [from, to) so each page fits the stage with all its lines read. At least one line per page; a line
 *  taller than the screen gets a page of its own (ui/fit.js then shrinks it). */
function paginate(stage, parts, page, lines) {
  const fits = () => stage.scrollHeight <= stage.clientHeight + 1;
  stage.style.zoom = "";
  stage.style.removeProperty("--fz");
  stage.replaceChildren(...parts);
  lines.forEach((l) => l.preview(true));
  const pages = [];
  let from = 0;
  while (from < lines.length) {
    let to = from + 1;
    page.replaceChildren(lines[from].line, lines[from].say);
    while (to < lines.length) {
      page.append(lines[to].line, lines[to].say);
      if (!fits()) break;
      to++;
    }
    pages.push([from, to]);
    from = to;
  }
  lines.forEach((l) => l.preview(false));
  return pages;
}
