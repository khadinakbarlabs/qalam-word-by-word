"""QA-only static server for quran-words: like `python3 -m http.server`, but tells the browser never to cache,
so every reload tests the files on disk. Not shipped.
Usage (from the project root): python3 quran-words/qa/serve.py [port]
"""
import functools
import http.server
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


class NoStoreHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class QAServer(http.server.ThreadingHTTPServer):
    # The default listen backlog (5) resets connections when a browser fetches many ES modules at once.
    request_queue_size = 128
    daemon_threads = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4200
    handler = functools.partial(NoStoreHandler, directory=str(ROOT))
    with QAServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving {ROOT} at http://127.0.0.1:{port}/ (no-store)")
        httpd.serve_forever()
