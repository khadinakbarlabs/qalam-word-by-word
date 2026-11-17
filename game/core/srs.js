// Spaced repetition for word lamps (docs/MEMORY_SYSTEM.md §2). Pure functions; cards are never mutated.
// A card: { id, level 0-6, due (day number), seen, lapses, last (engine id or null), mixups { otherId: count } }.
// Days are whole numbers (e.g. days since 1970 from the device date); "same session" reviews use due === today.

/** Relight serves at most this many lamps a session when little is waiting; the map shows no more than the session's
 *  size (the full count is in the Guide). */
export const RELIGHT_CAP = 12;
/** Above this many due lamps Qalam suggests a Relight before new rooms (a suggestion, never a lock). */
export const BACKLOG_AT = 40;

/** How many lamps one Relight serves: 12 normally, more when a backlog has built up, so it can actually shrink. */
export function sessionSize(dueTotal) {
  if (dueTotal > 60) return 20;
  if (dueTotal > BACKLOG_AT) return 16;
  return RELIGHT_CAP;
}

export const MAX_LEVEL = 6;
// Days until the next review after reaching each level (index = level). Level 1 = later in this session.
export const LEVEL_DAYS = [0, 0, 1, 3, 7, 16, 35];
// A missed card comes back after this many other cards in the same session.
export const REQUEUE_GAP = 3;
// Mix-ups recorded this many times trigger a tell-apart drill.
export const MIXUP_DRILL_AT = 2;

/** The player's day number. A day starts at 4 am local time (not UTC midnight), so "tomorrow" never begins at 5 am in
 *  Pakistan or 7 pm in New York; late-night play still counts for the same day. `offsetMin` is minutes behind UTC
 *  (Date.getTimezoneOffset), taken from the device unless given (tests). */
export const DAY_STARTS_AT_HOUR = 4;
export const today = (now = Date.now(), offsetMin = new Date(now).getTimezoneOffset()) =>
  Math.floor((now - offsetMin * 60_000 - DAY_STARTS_AT_HOUR * 3_600_000) / 86_400_000);

export function newCard(id, day) {
  return { id, level: 0, due: day, seen: 0, lapses: 0, last: null, mixups: {} };
}

/**
 * Grade one recall. result: "easy" (first try, no hint) | "hinted" (needed the show-me hand) | "wrong" (wrong pick or
 * answer revealed). Returns a new card.
 */
export function grade(card, result, day, engine = null) {
  const base = { ...card, seen: card.seen + 1, last: engine };
  if (result === "easy") {
    const level = Math.min(MAX_LEVEL, card.level + 1);
    return { ...base, level, due: day + LEVEL_DAYS[level] };
  }
  if (result === "hinted") {
    const level = Math.max(1, card.level);
    return { ...base, level, due: day + LEVEL_DAYS[Math.max(1, level - 1)] };
  }
  if (result === "wrong") {
    return { ...base, level: Math.max(1, card.level - 1), due: day, lapses: card.lapses + 1 };
  }
  throw new Error(`unknown grade result: ${result}`);
}

/** Record that the player picked `otherId` when the answer was this card. */
export function recordMixup(card, otherId) {
  return { ...card, mixups: { ...card.mixups, [otherId]: (card.mixups[otherId] ?? 0) + 1 } };
}

/** Pairs mixed up often enough to deserve a tell-apart drill: [[idA, idB], ...], each pair once. */
export function drillPairs(cards) {
  const seen = new Set();
  const pairs = [];
  for (const c of cards) {
    for (const [other, n] of Object.entries(c.mixups)) {
      const key = [c.id, other].sort().join("|");
      if (n >= MIXUP_DRILL_AT && !seen.has(key)) {
        seen.add(key);
        pairs.push([c.id, other]);
      }
    }
  }
  return pairs;
}

export const isDue = (card, day) => card.level > 0 && card.due <= day;

/** Cards to review now: most overdue first, then weakest first; at most `limit`. */
export function dueCards(cards, day, limit = Infinity) {
  return cards
    .filter((c) => isDue(c, day))
    .sort((a, b) => a.due - b.due || a.level - b.level || (a.id < b.id ? -1 : 1))
    .slice(0, limit);
}

/** Put a missed card back into the session queue REQUEUE_GAP places later (or at the end). */
export function requeue(queue, cardId, gap = REQUEUE_GAP) {
  const rest = queue.filter((id) => id !== cardId);
  const at = Math.min(gap, rest.length);
  return [...rest.slice(0, at), cardId, ...rest.slice(at)];
}

/** Lamp picture for a card: flames 0-6, gold at max, dim when due, and the next gap for the ☀️×N label. */
export function lamp(card, day) {
  return {
    flames: card.level,
    gold: card.level === MAX_LEVEL,
    dim: isDue(card, day),
    inDays: Math.max(0, card.due - day),
  };
}

/** Pick a different engine/direction than last time, so each repetition is a fresh retrieval. */
export function nextEngine(card, engines) {
  const options = engines.filter((e) => e !== card.last);
  const pool = options.length ? options : engines;
  return pool[(card.seen + card.id.length) % pool.length];
}
