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
// Days until the next review after an answer that needed help (index = level): the level is kept, but the word
// comes back in about a quarter of the time, so help never buys a long gap.
export const HINTED_DAYS = [0, 0, 0, 1, 2, 4, 9];
// A word missed this often is a "leech": it keeps coming back within LEECH_MAX_DAYS until it has been recalled
// unaided often enough (each unaided recall takes one lapse off a leech).
export const LEECH_AT = 3;
export const LEECH_MAX_DAYS = 3;
// A word missed in Relight is asked again today, then comes back tomorrow at its lowered level.
export const LAPSE_DAYS = 1;
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
 * Grade one recall. result: "easy" (first try, no help) | "hinted" (needed a hint, or the tutorial hand pointed at
 * the answer) | "wrong" (wrong pick or answer revealed). Returns a new card.
 */
export function grade(card, result, day, engine = null) {
  const base = { ...card, seen: card.seen + 1, last: engine };
  const leech = isLeech(card);
  const gap = (days) => (leech ? Math.min(days, LEECH_MAX_DAYS) : days);
  if (result === "easy") {
    const level = Math.min(MAX_LEVEL, card.level + 1);
    return { ...base, level, due: day + gap(LEVEL_DAYS[level]), lapses: leech ? card.lapses - 1 : card.lapses };
  }
  if (result === "hinted") {
    const level = Math.min(MAX_LEVEL, Math.max(1, card.level));
    return { ...base, level, due: day + gap(HINTED_DAYS[level]) };
  }
  if (result === "wrong") {
    return { ...base, level: Math.max(1, card.level - 1), due: day, lapses: card.lapses + 1 };
  }
  throw new Error(`unknown grade result: ${result}`);
}

/** A word missed so often that it needs short gaps for a while. */
export const isLeech = (card) => (card.lapses ?? 0) >= LEECH_AT;

// A card keeps only its few most frequent mix-ups, and stops counting at MIXUP_MAX (the save stays small).
export const MIXUP_KEEP = 3;
export const MIXUP_MAX = 9;

/** A mix-up map cut down to what a card keeps: the MIXUP_KEEP most frequent, counts capped. Returns a new map. */
export function trimMixups(mixups) {
  return Object.fromEntries(Object.entries(mixups ?? {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, MIXUP_KEEP)
    .map(([id, n]) => [id, Math.min(MIXUP_MAX, n)]));
}

/** Record that the player picked `otherId` when the answer was this card. The newest mix-up is always kept; of the
 *  others the most frequent stay. */
export function recordMixup(card, otherId) {
  if (!otherId || otherId === card.id) return card;
  const { [otherId]: had = 0, ...rest } = card.mixups ?? {};
  const kept = Object.entries(trimMixups(rest)).slice(0, MIXUP_KEEP - 1);
  return { ...card, mixups: { ...Object.fromEntries(kept), [otherId]: Math.min(MIXUP_MAX, had + 1) } };
}

/** The player told the two apart (a tell-apart question answered right first time): that mix-up is settled. */
export function settleMixup(card, otherId) {
  if (!card.mixups || !(otherId in card.mixups)) return card;
  const { [otherId]: _settled, ...rest } = card.mixups;
  return { ...card, mixups: rest };
}

/** Pairs mixed up often enough to deserve a tell-apart drill: [[idA, idB], ...], each pair once. */
export function drillPairs(cards) {
  const seen = new Set();
  const pairs = [];
  for (const c of cards) {
    for (const [other, n] of Object.entries(c.mixups ?? {})) {
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

/** A new word made today that is due again today (it needed help in its room, or the room's Last Check did not reach
 *  it; core/room.js FRESH). The map does not show it as a "lamp to relight" on the very day it was learnt; the next
 *  room's warm-up, Relight and Quick practice still serve it, and from tomorrow it counts like any due lamp. */
export const isFresh = (card, day) => card.last === "new" && card.due === day;

// a new word answered right every time comes back after this many days, still at one flame (core/room.js firstCard)
export const FIRST_GAP_DAYS = 1;
// `last` of a new card that is due again on the day it was made (see isFresh)
export const FRESH = "new";

/** Grade a review answer (the warm-up, Relight). A fresh card is still in its first interval: answered right today it
 *  ends exactly where a word that passed the Last Check ends (one flame, back tomorrow), never a flame above it; with
 *  help or a miss it stays fresh and due today. Any other card is graded as usual (grade). Returns a new card. */
export function gradeFresh(card, result, day, engine = null) {
  if (!isFresh(card, day)) return grade(card, result, day, engine);
  if (result === "easy") return { ...card, seen: card.seen + 1, last: engine, due: day + FIRST_GAP_DAYS };
  return { ...grade(card, result, day, engine), last: FRESH };
}

/** Lamps the map asks the player to relight: every due card except today's fresh ones. */
export const nagCards = (cards, day) => cards.filter((c) => isDue(c, day) && !isFresh(c, day));

/** A card can never be due later than a fresh review today would put it. A session played with the device date set
 *  far ahead leaves due days months away; once the date is right again this pulls them back (same card otherwise). */
export function clampDue(card, day) {
  // never earlier than tomorrow: a word missed in Relight today is due tomorrow whatever its level (LAPSE_DAYS)
  const latest = day + Math.max(LAPSE_DAYS, LEVEL_DAYS[Math.min(MAX_LEVEL, Math.max(0, card.level))]);
  return card.due > latest ? { ...card, due: latest } : card;
}

/** Cards to review now: most overdue first, then weakest first, then the most often missed; at most `limit`. */
export function dueCards(cards, day, limit = Infinity) {
  return cards
    .filter((c) => isDue(c, day))
    .sort((a, b) => a.due - b.due || a.level - b.level || (b.lapses ?? 0) - (a.lapses ?? 0) || (a.id < b.id ? -1 : 1))
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

// Relight's safety net (ui/relight.js): after this many cards in a row that could not be drawn, back to the map
export const RELIGHT_FAILS_BEFORE_LEAVING = 2;

/** The first lamp of a Relight queue moved to the end (it could not be drawn: it stays due, the others come first).
 *  A queue of one stays as it is; it is never emptied, so a lamp that was not relit never counts as lit. */
export const toBack = (queue) => (queue.length > 1 ? [...queue.slice(1), queue[0]] : queue);
