// Milestones (POLISH_PLAN 5.2, GAME_BRIEF badges): one-time cards when a finished room reaches one. Pure.
//   fatiha     every Al-Fatiha room is finished (five short rooms: "fatiha", "fatiha-1b", "fatiha-2", "fatiha-2b", …)
//   wing-N     every room of wing N is finished (each wing ends with its Reading Room)
//   cov-N      the meter reaches N% of the words of the Qur'an (50, 75, and 85: the goal of the whole game)
// A card shows once: its id goes into save.seen as "m:<id>". Only milestones the room just finished caused are shown,
// so an old save does not get every past card at once.
import { meter } from "./room.js";

export const COVERAGE_STEPS = [50, 75, 85];

/** The rooms that teach Al-Fatiha: "fatiha", "fatiha-1b", "fatiha-2", "fatiha-2b", "fatiha-2c". */
export const isFatihaRoom = (id) => /^fatiha(-|$)/.test(id);

/** Every milestone reached with these rooms done. */
export function reached(pack, doneRooms) {
  const out = [];
  const fatiha = pack.rooms.filter((r) => isFatihaRoom(r.id));
  if (fatiha.length && fatiha.every((r) => doneRooms[r.id])) out.push("fatiha");
  for (const wing of [...new Set(pack.rooms.map((r) => r.wing))]) {
    const rooms = pack.rooms.filter((r) => r.wing === wing);
    if (rooms.every((r) => doneRooms[r.id])) out.push(`wing-${wing}`);
  }
  const pct = meter(pack, doneRooms);
  for (const step of COVERAGE_STEPS) if (pct >= step) out.push(`cov-${step}`);
  return out;
}

/** Milestones this room's finish caused and the player has not seen yet, in the order to show them. */
export function newMilestones(pack, roomsBefore, roomsAfter, seen = []) {
  const before = new Set(reached(pack, roomsBefore));
  return reached(pack, roomsAfter).filter((id) => !before.has(id) && !seen.includes(`m:${id}`));
}
