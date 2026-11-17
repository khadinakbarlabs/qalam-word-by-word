// The content pack ships in pieces so no file is over the 512 KiB Playables target (PERF-06):
//   content/pack.json    words, credits and every room's header (title, wing, stakes, teaches, reviews, meter),
//                        plus `stepTypes` (every game in the pack, for the Picture Guide)
//   content/wing-N.json  { _notice, roomId: steps } for the rooms of wing N, fetched the first time a room of that wing opens
// splitPack() runs at build time; withSteps() joins a header with its wing's steps again.

/** Split a full pack (rooms with steps) into the boot pack and one steps file per wing. */
export function splitPack(pack) {
  const wings = {};
  // Tanzil's terms ask for their notice in every file that carries the text: each wing file gets it as "_notice"
  const notice = pack.notice ? { _notice: pack.notice } : {};
  for (const r of pack.rooms) wings[r.wing] = { ...notice, ...wings[r.wing], [r.id]: r.steps };
  const stepTypes = [...new Set(pack.rooms.flatMap((r) => r.steps.map((s) => s.type)))];
  const rooms = pack.rooms.map(({ steps, ...header }) => header);
  return { base: { ...pack, rooms, stepTypes }, wings };
}

/** A room header with its steps from the wing file. Throws when the wing file has no entry for the room. */
export function withSteps(header, wingSteps) {
  const steps = wingSteps?.[header.id];
  if (!Array.isArray(steps)) throw new Error(`wing ${header.wing}: no steps for room ${header.id}`);
  return { ...header, steps };
}

/** Fetches each wing file once. `fetchJson(path)` resolves to the parsed file or rejects. */
export function wingLoader(fetchJson) {
  const cache = new Map();
  return async (header) => {
    if (!cache.has(header.wing)) {
      const loading = fetchJson(`content/wing-${header.wing}.json`);
      cache.set(header.wing, loading);
      // a failed fetch is not kept: the next try (Retry, or opening the door again) fetches again
      loading.catch(() => cache.delete(header.wing));
    }
    return withSteps(header, await cache.get(header.wing));
  };
}
