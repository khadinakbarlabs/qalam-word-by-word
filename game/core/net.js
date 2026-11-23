// Loading a JSON file with a time limit and a few tries, so a stalled connection ends in "try again" and not in a
// lamp that breathes forever. No DOM: `fetch` is passed in (main.js gives the browser's, tests give a fake).
import { withTimeout, withRetry } from "./async.js";

// worst case for a file that never answers: 3 tries x 6 s + 0.5 s + 1.5 s = 20 s
export const FETCH_TIMEOUT_MS = 6000;
export const FETCH_RETRY_MS = [500, 1500];

export function makeFetchJson({ fetch, later, wait, timeoutMs = FETCH_TIMEOUT_MS, retryMs = FETCH_RETRY_MS }) {
  const once = async (path) => {
    const stop = typeof AbortController === "undefined" ? null : new AbortController();
    try {
      const res = await withTimeout(fetch(path, stop ? { signal: stop.signal } : undefined), timeoutMs, later);
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
      return await withTimeout(res.json(), timeoutMs, later);
    } catch (error) {
      stop?.abort(); // a request that ran out of time must not finish later behind the retry
      throw error;
    }
  };
  /** Resolves to the parsed file; rejects after the last try failed. */
  return (path) => withRetry(() => once(path), retryMs, { wait });
}
