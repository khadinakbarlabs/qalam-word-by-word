// Quick practice (pure): a short round of the player's weakest and oldest words, offered when no lamp is due. It is
// free practice: nothing here ever changes a card's flames, due day or lapse count, so it cannot lower progress and
// cannot be used to push words up early. Only a mix-up is noted (so a "tell these apart" question can come later).
// ui/relight.js draws it with the same cards as Relight.
import { isDue, requeue } from "./srs.js";

export const PRACTICE_SIZE = 8;
// Quick practice is offered once the player has at least this many word lamps (four choices need four words)
export const PRACTICE_MIN = 4;

/** Ids to practise: words due today first (today's new words that needed help), then the fewest flames, then the
 *  most often missed, then the ones seen longest ago (the earliest due day). Only words with Arabic and a face. */
export function practiceWords(cards, day, words, size = PRACTICE_SIZE) {
  return cards
    .filter((c) => c.level > 0 && words[c.id]?.ar && (words[c.id].pic || words[c.id].medal))
    .sort((a, b) => Number(isDue(b, day)) - Number(isDue(a, day)) || a.level - b.level || (b.lapses ?? 0) - (a.lapses ?? 0) || a.due - b.due || (a.id < b.id ? -1 : 1))
    .slice(0, size)
    .map((c) => c.id);
}

/** A practice session: { queue, again: ids already asked a second time, right, asked }. */
export const startPractice = (cards, day, words, size = PRACTICE_SIZE) => ({ queue: practiceWords(cards, day, words, size), again: [], right: 0, asked: 0 });

/** The right answer was tapped. `clean`: first try with no help. A word that was missed or helped comes back once. */
export function practiceAnswer(session, id, clean) {
  const asked = session.asked + 1;
  if (clean || session.again.includes(id)) {
    return { ...session, queue: session.queue.filter((x) => x !== id), right: session.right + (clean ? 1 : 0), asked };
  }
  return { ...session, queue: requeue(session.queue, id), again: [...session.again, id], asked };
}

/** Which side to ask from: it alternates with how often the word has been seen and with the question number. */
export const practiceMode = (card, n) => ((card.seen + n) % 2 === 0 ? "toPic" : "toWord");
