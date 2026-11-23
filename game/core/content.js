// The content pack ships in pieces so no file is over the 512 KiB Playables target (PERF-06):
//   content/pack.json    words, credits and every room's header (title, wing, stakes, teaches, reviews, meter),
//                        plus `stepTypes` (every game in the pack, for the Picture Guide)
//   content/wing-N.json  { _notice, _build, roomId: steps } for the rooms of wing N, fetched the first time a room of that wing opens
//   content/why.json     { _build, words: { wordId: { en, ur } } }: what each word's picture shows. Only read on a
//                        long-press, a flipped card and the Words tab, so it is fetched after the first screen is up
// splitPack() runs at build time; withSteps() joins a header with its wing's steps again.
// Every file of one build carries the same `build` id (a hash of the rooms), so a wing file left over from an older
// build is never joined to a newer pack.json: withSteps() refuses it and the door says "did not open".

// FNV-1a, 32 bit: small, deterministic, no dependencies (this is a version stamp, not security)
function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** The build id of a full pack's rooms: the same for a pack that is split and joined again, different as soon as any
 *  room header or step changes. */
export const buildId = (rooms) => hash(JSON.stringify(rooms.map(({ steps, ...header }) => [header, steps])));

/** Split a full pack (rooms with steps) into the boot pack and one steps file per wing. */
export function splitPack(pack) {
  const wings = {};
  // Tanzil's terms ask for their notice in every file that carries the text: each wing file gets it as "_notice"
  const notice = pack.notice ? { _notice: pack.notice } : {};
  const build = buildId(pack.rooms);
  for (const r of pack.rooms) wings[r.wing] = { ...notice, _build: build, ...wings[r.wing], [r.id]: r.steps };
  const stepTypes = [...new Set(pack.rooms.flatMap((r) => r.steps.map((s) => s.type)))];
  const rooms = pack.rooms.map(({ steps, ...header }) => header);
  const { why, ...rest } = pack;
  return { base: { ...rest, rooms, stepTypes, build }, wings, why: { _build: build, words: why ?? {} } };
}

export const WHY_PATH = "content/why.json";

/** The picture lines of a why file, or null when the file is not one or was built for another pack (a stale copy
 *  could describe a painting that has changed). */
export function whyWords(file, build) {
  if (!file || typeof file.words !== "object" || file.words === null) return null;
  if (build !== undefined && file._build !== build) return null;
  return file.words;
}

/** Fetches the picture lines once: `load()` resolves to them, or to null when they could not be had (the game plays
 *  on without them; the next call tries again). A stale cached copy is asked for once more past the cache. */
export function whyLoader(fetchJson, build) {
  let loading = null;
  const fetchWhy = async () => {
    const first = whyWords(await fetchJson(WHY_PATH), build);
    if (first || build === undefined) return first;
    return whyWords(await fetchJson(`${WHY_PATH}?v=${build}`), build);
  };
  return () => {
    loading ??= fetchWhy().catch(() => null).then((words) => {
      if (!words) loading = null; // not kept: tried again next time
      return words;
    });
    return loading;
  };
}

/** A room header with its steps from the wing file. Throws when the wing file has no entry for the room, or (when
 *  the pack's `build` id is given) when the wing file was built for another pack. */
export function withSteps(header, wingSteps, build) {
  if (build !== undefined && wingSteps?._build !== build) throw new Error(`wing ${header.wing}: built for another pack (${wingSteps?._build ?? "no build id"}, pack ${build})`);
  const steps = wingSteps?.[header.id];
  if (!Array.isArray(steps)) throw new Error(`wing ${header.wing}: no steps for room ${header.id}`);
  return { ...header, steps };
}

/** Fetches each wing file once. `fetchJson(path)` resolves to the parsed file or rejects. `build`: the pack's build
 *  id; a wing file with another id (a stale cached copy) is asked for once more past the cache (`?v=<build>`), and
 *  refused by withSteps() if it still does not match. */
export function wingLoader(fetchJson, build) {
  const cache = new Map();
  const fetchWing = async (wing) => {
    const path = `content/wing-${wing}.json`;
    const file = await fetchJson(path);
    if (build === undefined || file?._build === build) return file;
    return fetchJson(`${path}?v=${build}`);
  };
  return async (header) => {
    if (!cache.has(header.wing)) {
      const loading = fetchWing(header.wing);
      cache.set(header.wing, loading);
      // a failed fetch is not kept: the next try (Retry, or opening the door again) fetches again
      loading.catch(() => cache.delete(header.wing));
    }
    const file = await cache.get(header.wing);
    try {
      return withSteps(header, file, build);
    } catch (error) {
      cache.delete(header.wing); // a wrong file is not kept either
      throw error;
    }
  };
}
