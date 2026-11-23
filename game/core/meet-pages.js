// Meet pages: how many flip cards one screen holds, and how a room's new words are dealt into pages.
// Pure (no DOM): the screen test is passed in, defaulting to matchMedia when there is one.

// Cards per page: short screens (landscape phones) fit one row of 3, narrow phones a 2×2 grid, larger screens 6.
const PAGE_SHORT = 3;
const PAGE_NARROW = 4;
const PAGE_WIDE = 6;
const SHORT_QUERY = "(max-height: 520px)";
const NARROW_QUERY = "(max-width: 480px)";

/** How many meet cards fit on one page of this screen. */
export function pageSize(matches = (q) => globalThis.matchMedia?.(q).matches ?? false) {
  if (matches(SHORT_QUERY)) return PAGE_SHORT;
  if (matches(NARROW_QUERY)) return PAGE_NARROW;
  return PAGE_WIDE;
}

/** Splits ids into pages of at most `size`, keeping pages even (7 cards at 6 a page → 4 + 3, not 6 + 1). */
export function pagesOf(ids, size) {
  const count = Math.max(1, Math.ceil(ids.length / size));
  const per = Math.ceil(ids.length / count);
  return Array.from({ length: count }, (_, i) => ids.slice(i * per, (i + 1) * per)).filter((p) => p.length);
}
