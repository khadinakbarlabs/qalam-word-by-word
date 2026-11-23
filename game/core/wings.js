// The map's wings as plain data: which rooms sit in which wing, how many are lit, which wings start open.
// Pure (no DOM), so it is tested in Node.
export function wingGroups(nodes) {
  const groups = [];
  for (const n of nodes) {
    const last = groups.at(-1);
    if (last && last.wing === n.wing) last.rooms.push(n);
    else groups.push({ wing: n.wing, rooms: [n] });
  }
  return groups.map((g) => ({ ...g, total: g.rooms.length, done: g.rooms.filter((n) => n.state === "done").length }));
}

/** Which wings are open: the one holding the next room (or, with every room lit, none), unless the player chose. */
export const openWings = (groups, choice = new Map()) => new Set(groups
  .filter((g) => choice.get(g.wing) ?? g.rooms.some((n) => n.state === "next"))
  .map((g) => g.wing));
