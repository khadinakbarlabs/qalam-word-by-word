// Which painted pictures a room will show, so they can be fetched before its door is opened (audit Phase F).
// Pure: no DOM, no network. main.js does the fetching in idle time.

const PICTURE = /^img:(.+?)[▲●]?$/; // "img:art/x.webp", with an optional he-word / she-word badge at the end
const WORD_ID = /^w:/;

/** The picture files a room shows, in the order its steps name them, each once, at most `limit`.
 *  words: pack.words. room: a room with its steps (core/content.js withSteps). */
export function roomPictures(words, room, limit = Infinity) {
  const found = new Set();
  const addPicture = (text) => {
    const file = typeof text === "string" ? text.match(PICTURE)?.[1] : null;
    if (file) found.add(file);
  };
  const visit = (value) => {
    if (typeof value === "string") {
      addPicture(value);
      if (WORD_ID.test(value)) addPicture(words?.[value]?.pic);
    } else if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  };
  visit([room?.art, room?.teaches, room?.steps]);
  return [...found].slice(0, Math.max(0, limit));
}
