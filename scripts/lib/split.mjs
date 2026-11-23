// Apply authoring/splits.js to authoring/rooms.js (pure): a long room becomes two or more shorter rooms made of the
// same steps. Returns { rooms, errors, map } where map is { oldRoomId: [new room ids in order] } for every split room
// (game/core/room-splits.js must list the same, so old saves keep their finished rooms).

const SUFFIX = "bcdefgh";
export const partId = (id, n) => (n === 0 ? id : `${id}-${SUFFIX[n - 1]}`);
export const partTitle = (title, n) => (n === 0 ? title : { en: `${title.en}, part ${n + 1}`, ur: `${title.ur}، حصہ ${n + 1}` });

/** The parts of one split, each as { steps: [original step numbers], ...overrides }. */
function partsOf(room, split) {
  if (Array.isArray(split)) return split;
  const at = split?.at;
  const all = room.steps.map((_, i) => i);
  if (!Number.isInteger(at) || at < 1 || at >= all.length) return null;
  return [{ steps: all.slice(0, at) }, { steps: all.slice(at) }];
}

export function applySplits(rooms, splits) {
  const errors = [];
  const map = {};
  const known = new Set(rooms.map((r) => r.id));
  for (const id of Object.keys(splits)) if (!known.has(id)) errors.push(`splits: no room ${id}`);
  const out = rooms.flatMap((room) => {
    const split = splits[room.id];
    if (!split) return [room];
    const parts = partsOf(room, split);
    if (!parts || parts.length < 2 || parts.length > SUFFIX.length + 1) { errors.push(`splits: ${room.id} has a bad split`); return [room]; }
    const used = parts.flatMap((p) => p.steps ?? []);
    const wanted = room.steps.map((_, i) => i);
    if (used.length !== wanted.length || [...used].sort((a, b) => a - b).some((s, i) => s !== wanted[i])) {
      errors.push(`splits: ${room.id}: every step must go into exactly one part (has ${wanted.length} steps, parts name ${used.join(", ")})`);
      return [room];
    }
    const made = parts.map((p, n) => ({
      ...room,
      id: p.id ?? partId(room.id, n),
      title: p.title ?? partTitle(room.title, n),
      icon: p.icon ?? room.icon,
      art: p.art ?? room.art,
      steps: p.steps.map((i) => room.steps[i]),
    }));
    map[room.id] = made.map((r) => r.id);
    return made;
  });
  const ids = out.map((r) => r.id);
  for (const id of ids) if (ids.indexOf(id) !== ids.lastIndexOf(id)) errors.push(`splits: two rooms are called ${id}`);
  return { rooms: out, errors: [...new Set(errors)], map };
}

/** New words a room of this wing may teach (authoring/splits.js). */
export const WING1_MAX_NEW = 8;
export const LATER_MAX_NEW = 20;
export const maxNewWords = (wing) => (wing === 1 ? WING1_MAX_NEW : LATER_MAX_NEW);
