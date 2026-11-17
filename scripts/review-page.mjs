// Fills the scholar review page template with the review data and picture thumbnails.
// Usage (after scripts/review-pack.mjs and the thumbnail step): node scripts/review-page.mjs
// Writes review/review-pack.html, the page published for the reviewer.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
// JSON inside <script type="application/json">: never let "</script" (or "<!--") close it early
const inline = (json) => json.replace(/</g, "\\u003c");

const template = read("review/review-pack.template.html");
const data = read("review/review-data.json");
const thumbs = read("review/thumbs.json");
for (const mark of ["/*__DATA__*/", "/*__THUMBS__*/"]) if (!template.includes(mark)) throw new Error(`template is missing ${mark}`);

const html = template.replace("/*__DATA__*/", () => inline(data)).replace("/*__THUMBS__*/", () => inline(thumbs));
writeFileSync(new URL("review/review-pack.html", root), html);
console.log(`review/review-pack.html: ${(html.length / 1024 / 1024).toFixed(2)} MB`);
