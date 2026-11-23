// What happens to the save at each moment progress is made (pure). main.js applies these the instant the thing
// happens, never "when the player taps ▶", so a YouTube pause or a closed game always finds the latest state in the
// save object it writes.
import { markRoom, setCards } from "./save.js";
import { clampDue } from "./srs.js";
import { missingCards } from "./room.js";

/** The room is won (its Last Check is passed): lamp lit, its word cards stored, its checkpoint cleared. */
export const roomWon = (save, roomId, cards) => setCards(markRoom(save, roomId), cards);

/** One word was graded (a warm-up or Relight answer). */
export const cardGraded = (save, card) => setCards(save, [card]);

/** A freshly loaded save made sound for today: due days pulled back if a wrong device date pushed them far ahead,
 *  and finished rooms given back any word card they are missing. Returns the same object when nothing changed. */
export function repairSave(pack, save, day) {
  const clamped = Object.values(save.cards).map((c) => clampDue(c, day)).filter((c) => c !== save.cards[c.id]);
  const fixed = clamped.length ? setCards(save, clamped) : save;
  const restored = missingCards(pack, fixed.rooms, fixed.cards, day);
  return restored.length ? setCards(fixed, restored) : fixed;
}
