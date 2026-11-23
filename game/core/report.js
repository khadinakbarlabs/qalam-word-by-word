// "My progress" (pure): honest numbers worked out from the save, nothing leaves the device.
//   met          words the player has a lamp for (they finished the room that teaches them)
//   remembered   of those, the lamps that are bright right now (not due today): "words you remember now"
//   fading       the lamps that are due (Relight brings them back)
//   byFlames     how many lamps have 1, 2 … 6 flames (index 0 is unused)
// The map's percentage is a different thing and is labelled as such: the share of the Qur'an's words the player has
// MET (core/room.js meter). It never drops; `remembered` goes up and down with real review.
import { isDue, MAX_LEVEL } from "./srs.js";

export function progressReport(pack, cards, day) {
  const taught = [...new Set(pack.rooms.flatMap((r) => r.teaches))];
  const mine = taught.map((id) => cards[id]).filter((c) => c && c.level > 0);
  const fading = mine.filter((c) => isDue(c, day)).length;
  const byFlames = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => (level ? mine.filter((c) => c.level === level).length : 0));
  return { total: taught.length, met: mine.length, remembered: mine.length - fading, fading, byFlames };
}
