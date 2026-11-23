// Time limits and retries for anything that waits on the outside world (the YouTube SDK, the network). Pure: the
// delays run on the game clock (core/clock.js) unless a test passes its own, so a YouTube pause freezes them too.
import { later as clockLater, wait as clockWait } from "./clock.js";

export class TimeoutError extends Error {
  constructor(ms) {
    super(`no answer after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

/** `promise`, or a TimeoutError when it has not settled after `ms`. A late answer is then ignored. */
export function withTimeout(promise, ms, later = clockLater) {
  return new Promise((resolve, reject) => {
    const cancel = later(() => reject(new TimeoutError(ms)), ms);
    Promise.resolve(promise).then(
      (value) => { cancel(); resolve(value); },
      (error) => { cancel(); reject(error); },
    );
  });
}

/** Run `run(attempt)`; after a failure wait delays[0], try again, wait delays[1], ... The last failure is thrown.
 *  onFail(error, attempt) is told about every failure. */
export async function withRetry(run, delays, { wait = clockWait, onFail = () => {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run(attempt);
    } catch (error) {
      onFail(error, attempt);
      if (attempt >= delays.length) throw error;
      await wait(delays[attempt]);
    }
  }
}
