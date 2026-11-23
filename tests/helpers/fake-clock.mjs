// A clock the tests move by hand: later(fn, ms) / wait(ms) like core/clock.js, advance(ms) runs what is due in order.
export function fakeClock() {
  let now = 0;
  let timers = [];
  const settle = () => new Promise((resolve) => setImmediate(resolve)); // let pending promise chains run
  const later = (fn, ms) => {
    const timer = { at: now + Math.max(0, ms), fn };
    timers.push(timer);
    return () => { timers = timers.filter((x) => x !== timer); };
  };
  return {
    later,
    wait: (ms) => new Promise((resolve) => later(resolve, ms)),
    get pending() { return timers.length; },
    async advance(ms) {
      const end = now + ms;
      await settle();
      for (;;) {
        const next = timers.filter((x) => x.at <= end).sort((a, b) => a.at - b.at)[0];
        if (!next) break;
        timers = timers.filter((x) => x !== next);
        now = next.at;
        next.fn();
        await settle();
      }
      now = end;
      await settle();
    },
  };
}
