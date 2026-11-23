// Phase E (look and feel): the small pieces of logic behind it, and lints that keep the styles and the Urdu in order.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { wingGroups, openWings } from "../game/core/wings.js";
import { countSteps } from "../game/ui/count-up.js";
import { ICON_NAMES, WING_ICON, iconSvg } from "../game/ui/icons.js";
import { keys, tFor, plainDigits } from "../game/i18n.js";

const read = (path) => readFileSync(new URL(`../game/${path}`, import.meta.url), "utf8");
const room = (wing, state) => ({ wing, state });

test("wingGroups counts lit rooms in each wing, in map order", () => {
  const groups = wingGroups([room(1, "done"), room(1, "next"), room(2, "locked"), room(2, "locked")]);
  assert.deepEqual(groups.map((g) => [g.wing, g.done, g.total]), [[1, 1, 2], [2, 0, 2]]);
});

test("openWings opens only the wing with the next room, unless the player chose otherwise", () => {
  const groups = wingGroups([room(1, "done"), room(2, "next"), room(3, "locked")]);
  assert.deepEqual([...openWings(groups)], [2]);
  assert.deepEqual([...openWings(groups, new Map([[2, false], [3, true]]))], [3]);
});

test("countSteps ends exactly on the new value and never runs backwards", () => {
  const steps = countSteps(3.2, 4.1);
  assert.equal(steps.at(-1), "4.1");
  const nums = steps.map(Number);
  assert.ok(nums.every((n, i) => i === 0 || n >= nums[i - 1]));
  assert.deepEqual(countSteps(5, 5), ["5"]);
});

test("plainDigits turns Urdu digits into the one digit system the screens use", () => {
  assert.equal(plainDigits("۱۲ الفاظ ۳۴٪"), "12 الفاظ 34٪");
  assert.equal(plainDigits("7 words"), "7 words");
});

test("every icon is a drawn shape: no letters, no emoji, and each wing has one", () => {
  for (const name of ICON_NAMES) {
    const svg = iconSvg(name);
    assert.ok(svg.startsWith("<svg"), name);
    assert.ok(!/<text|<image|href=/.test(svg), `${name} must be shapes only`);
    assert.ok(!/\p{Extended_Pictographic}/u.test(svg), `${name} has an emoji`);
  }
  for (const name of Object.values(WING_ICON)) assert.ok(ICON_NAMES.includes(name), name);
});

test("English and Urdu have the same string keys, and none is empty", () => {
  assert.deepEqual(keys("ur").slice().sort(), keys("en").slice().sort());
  for (const code of ["en", "ur"]) for (const key of keys(code)) assert.ok(String(tFor(code, key)).trim(), `${code}.${key}`);
});

test("Urdu uses one word for tap, and names buttons in «quotes»", () => {
  const texts = [...keys("ur").map((key) => tFor("ur", key)), read("ui/tips.js")];
  for (const text of texts) assert.ok(!/ٹیپ|چھوئیں|چھوئیے/.test(String(text)), `mixed word for tap: ${String(text).slice(0, 60)}`);
  assert.match(tFor("ur", "how_miss"), /«.+»/);
});

test("UI strings carry no emoji (icons are drawn in ui/icons.js)", () => {
  for (const code of ["en", "ur"]) for (const key of keys(code)) {
    assert.ok(!/\p{Extended_Pictographic}/u.test(String(tFor(code, key))), `${code}.${key}`);
  }
});

test("every CSS variable the stylesheets use is defined somewhere", () => {
  const css = read("styles.css") + read("feel.css");
  const js = ["ui/room.js", "ui/map.js", "ui/fit.js", "ui/kit.js", "ui/steps/place.js", "ui/intro.js", "ui/guide.js"].map(read).join("\n");
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g), ...js.matchAll(/(--[\w-]+)\s*[:"',]/g)].map((m) => m[1]));
  const loose = [...css.matchAll(/var\((--[\w-]+)\s*\)/g)].map((m) => m[1]).filter((name) => !defined.has(name));
  assert.deepEqual([...new Set(loose)], []);
});

test("motion stays on transform and opacity, and reduced motion is honoured", () => {
  const css = read("feel.css");
  for (const [, body] of css.matchAll(/@keyframes [\w-]+\s*\{((?:[^{}]*\{[^{}]*\})*)/g)) {
    assert.ok(!/\b(width|height|top|left|right|bottom|margin|padding|box-shadow|font-size)\s*:/.test(body), body.trim().slice(0, 80));
  }
  assert.match(read("styles.css") + css, /prefers-reduced-motion/);
});
