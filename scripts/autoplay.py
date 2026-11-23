#!/usr/bin/env python3
"""Autoplay (POLISH_PLAN 5.5): plays the whole game from a fresh save in headless Chromium at three screen sizes at
once, and fails on any console error, page error, failed request or stuck screen.

It serves the project with qa/serve.py, opens qa/harness.html?fresh=1&qa=1 (a stand-in for the YouTube SDK that keeps
its save in the test browser's own storage, never the player's), and each tick taps what a player would tap: the
answer the room's hint points at (window.__qw.target), else the visible ▶, else the glowing door on the map. Relight
is skipped. Each viewport runs in its own browser context, so the three saves never mix.

Usage (from quran-words/; needs Python Playwright and Google Chrome, or `playwright install chromium`):
  python3 scripts/autoplay.py                 every room, 3 viewports, English
  python3 scripts/autoplay.py --rooms 5       stop after 5 rooms
  python3 scripts/autoplay.py --lang ur-PK    play in Urdu
  python3 scripts/autoplay.py --headed        watch it
It also reports every screen that does not fit (room stage or page taller or wider than the screen).
Exit code 0 = every viewport finished its rooms with no errors. Screenshots of failures go to qa/autoplay-out/.
"""
import argparse
import asyncio
import os
import pathlib
import socket
import subprocess
import sys
import time

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "qa" / "autoplay-out"
VIEWPORTS = {"phone": (390, 844), "desktop": (1280, 800), "short-wide": (844, 390)}
TICK_S = 0.08
STUCK_S = 20  # no change on screen for this long = stuck
ROOM_LIMIT_S = 600

# One tick in the page: tap the next thing a player would tap. Returns what it did, plus a fingerprint of the screen
# so the runner can tell progress from a stuck screen.
TICK_JS = """
async () => {
  // measure after the game's own fit-to-screen pass (ui/fit.js runs on the next frame)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const usable = (el) => el && el.isConnected && !el.closest('[inert]') && !el.hidden && el.getClientRects().length > 0
    && !el.closest('[hidden]') && el.getAttribute('aria-disabled') !== 'true';
  const save = JSON.parse(localStorage.getItem('qa-save') || '{}');
  const doneRooms = Object.keys(save.rooms || {}).length;
  const shot = () => (document.querySelector('#app')?.innerText || '').length + ':' + document.querySelectorAll('.lit,.open,.right,.done').length;
  // fit check: how far the room stage (or the whole page) runs past the screen, and on which step
  const st = document.querySelector('.room .stage');
  const over = Math.max(st ? st.scrollHeight - st.clientHeight : 0, document.documentElement.scrollHeight - innerHeight,
    document.documentElement.scrollWidth - innerWidth);
  const step = (document.querySelector('.howto-text')?.dataset.t || (document.querySelector('.hall') ? 'map' : 'other'))
    + ' @ ' + (document.querySelector('.room-title')?.innerText || '').trim();
  const fit = { over, step };
  const tap = (el, what) => { el.click(); return { did: what, doneRooms, shot: shot(), fit }; };
  if (document.querySelector('.boot-error')) return { did: 'boot-error', doneRooms, shot: shot(), fit };
  const target = window.__qw?.target;
  if (document.querySelector('.room') && usable(target)) return tap(target, 'answer');
  const next = [...document.querySelectorAll('.next-btn')].find(usable);
  const ms = document.querySelector('.milestone .ms-title')?.textContent;
  if (next) return { ...tap(next, ms ? 'milestone' : 'next'), title: ms || '' };
  const door = document.querySelector('.hall .door.next');
  if (usable(door)) return tap(door, 'door');
  if (document.querySelector('.hall') && !door) return { did: 'all-done', doneRooms, shot: shot(), fit };
  return { did: 'wait', doneRooms, shot: shot(), fit };
}
"""


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def start_server(port):
    proc = subprocess.Popen([sys.executable, str(ROOT / "qa" / "serve.py"), str(port)], cwd=ROOT.parent,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                return proc
        except OSError:
            time.sleep(0.1)
    proc.kill()
    raise RuntimeError(f"qa/serve.py did not start on port {port}")


async def play_viewport(browser, base, name, size, args):
    page = await (await browser.new_context(viewport={"width": size[0], "height": size[1]})).new_page()
    errors, milestones, overflow, prev_over = [], [], {}, {}
    # a failed load is reported by URL (below); the browser's own favicon request is not the game's
    page.on("console", lambda m: m.type == "error" and not m.text.startswith("Failed to load resource") and errors.append(f"console: {m.text}"))
    page.on("response", lambda r: r.status >= 400 and not r.url.endswith("/favicon.ico") and errors.append(f"HTTP {r.status}: {r.url}"))
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("requestfailed", lambda r: errors.append(f"request failed: {r.url}"))
    await page.goto(f"{base}/qa/harness.html?fresh=1&qa=1&lang={args.lang}")

    started = time.monotonic()
    room_started = started
    last_shot, last_change, done_rooms = None, time.monotonic(), 0
    result = "ok"
    while True:
        await asyncio.sleep(TICK_S)
        state = await page.evaluate(TICK_JS)
        now = time.monotonic()
        fit = state.get("fit") or {}
        # a screen counts as not fitting only when it overflows on two ticks in a row (one frame mid-redraw is not a
        # layout problem)
        over_now = fit.get("over", 0) > 2
        steady = over_now and prev_over.get("step") == fit.get("step")
        prev_over = {"step": fit.get("step")} if over_now else {}
        if steady:
            worst = overflow.get(fit["step"], 0)
            overflow[fit["step"]] = max(worst, fit["over"])
            if args.fit_shots and fit["over"] > worst + 20:
                (OUT / "fit").mkdir(parents=True, exist_ok=True)
                safe = "".join(ch if ch.isalnum() else "-" for ch in fit["step"])[:60]
                await page.screenshot(path=str(OUT / "fit" / f"{name}-{safe}.png"), full_page=True)
        if state["did"] == "milestone":
            milestones.append(state["title"])
        if state["doneRooms"] != done_rooms:
            done_rooms, room_started = state["doneRooms"], now
            print(f"  [{name}] rooms done: {done_rooms}", flush=True)
        if state["shot"] != last_shot or state["did"] not in ("wait", "all-done"):
            last_shot, last_change = state["shot"], now
        if errors:
            result = "errors"
        elif state["did"] == "boot-error":
            result = "boot error screen"
        elif state["did"] == "all-done" or (args.rooms and done_rooms >= args.rooms and state["did"] == "door"):
            break
        elif now - last_change > STUCK_S:
            result = f"stuck for {STUCK_S} s"
        elif now - room_started > ROOM_LIMIT_S:
            result = f"one room took over {ROOM_LIMIT_S} s"
        if result != "ok":
            OUT.mkdir(parents=True, exist_ok=True)
            shot = OUT / f"{name}-{done_rooms}.png"
            await page.screenshot(path=str(shot))
            result += f" (rooms done {done_rooms}; screenshot {shot.relative_to(ROOT)})"
            break
    await page.context.close()
    return {"name": name, "size": size, "result": result, "rooms": done_rooms, "errors": errors[:10],
            "milestones": milestones, "overflow": overflow, "seconds": round(time.monotonic() - started)}


async def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--rooms", type=int, default=0, help="stop after this many rooms (0 = all)")
    ap.add_argument("--lang", default="en-US", help="YouTube language the stand-in SDK reports (e.g. ur-PK)")
    ap.add_argument("--headed", action="store_true")
    ap.add_argument("--fit-shots", action="store_true", help="save a screenshot of the worst overflow of each screen")
    ap.add_argument("--only", choices=list(VIEWPORTS), help="one viewport only")
    args = ap.parse_args()

    port = free_port()
    server = start_server(port)
    try:
        async with async_playwright() as pw:
            # the installed Google Chrome first (no download), else Playwright's own Chromium
            # QA_BROWSER=bundled skips Google Chrome, so a run never starts a second Chrome beside the user's own
            try:
                if os.environ.get("QA_BROWSER") == "bundled":
                    raise RuntimeError("bundled Chromium asked for")
                browser = await pw.chromium.launch(channel="chrome", headless=not args.headed)
            except Exception:
                # QA_BROWSER_PATH: a Chromium binary to use when Playwright's own download is missing
                path = os.environ.get("QA_BROWSER_PATH") or None
                browser = await pw.chromium.launch(headless=not args.headed, executable_path=path)
            sizes = {k: v for k, v in VIEWPORTS.items() if not args.only or k == args.only}
            results = await asyncio.gather(*(play_viewport(browser, f"http://127.0.0.1:{port}", n, s, args) for n, s in sizes.items()))
            await browser.close()
    finally:
        server.kill()

    ok = True
    for r in results:
        ok &= r["result"] == "ok"
        print(f"{r['name']:<10} {r['size'][0]}x{r['size'][1]}  {r['result']:<6} rooms {r['rooms']}  {r['seconds']} s")
        if r["milestones"]:
            print(f"           milestones: {' | '.join(r['milestones'])}")
        worst = sorted(r["overflow"].items(), key=lambda kv: -kv[1])
        if worst:
            print(f"           does not fit ({len(worst)} screens; px past the screen): " + "; ".join(f"{k} +{v}" for k, v in worst[:25]))
        for e in r["errors"]:
            print(f"           {e}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    asyncio.run(main())
