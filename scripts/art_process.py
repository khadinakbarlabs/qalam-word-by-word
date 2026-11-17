"""Turn raw generated pictures (data/art-raw/*.png) into small game art (game/art/*.webp).

For each picture: cut away the flat cream background that touches the edges (flood fill from the border, so cream
inside the drawing stays), soften the cut edge, trim to the drawing with a small margin, make it square, shrink to
256 px and save as WebP with transparency. Run: python3 -I scripts/art_process.py [name ...]  (no names = all).
"""
import site
import sys
from pathlib import Path

# Run with -I (isolated) so nothing in the data folders can shadow a module; add back only the user's own packages.
sys.path.append(site.getusersitepackages())

import numpy as np  # noqa: E402
from PIL import Image, ImageFilter  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "art-raw"
OUT = ROOT / "game" / "art"
SIZE = 256
WORK = 512          # flood fill runs at this size (fast enough, edges still clean)
TOLERANCE = 26      # colour distance that still counts as background
MARGIN = 0.06       # space kept around the drawing


def background_mask(rgb):
    """True where a pixel is background connected to the border (flood fill over similar colours)."""
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    near = np.sqrt(((rgb.astype(np.int32) - bg) ** 2).sum(axis=2)) < TOLERANCE
    mask = np.zeros((h, w), bool)
    stack = [(y, x) for x in range(w) for y in (0, h - 1)] + [(y, x) for y in range(h) for x in (0, w - 1)]
    while stack:
        y, x = stack.pop()
        if mask[y, x] or not near[y, x]:
            continue
        mask[y, x] = True
        if y > 0: stack.append((y - 1, x))
        if y < h - 1: stack.append((y + 1, x))
        if x > 0: stack.append((y, x - 1))
        if x < w - 1: stack.append((y, x + 1))
    return mask


def process(src: Path, dst: Path):
    im = Image.open(src).convert("RGB").resize((WORK, WORK), Image.LANCZOS)
    rgb = np.asarray(im)
    alpha = np.where(background_mask(rgb), 0, 255).astype(np.uint8)
    rgba = im.copy()
    rgba.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.2)))
    x0, y0, x1, y1 = Image.fromarray(alpha).getbbox() or (0, 0, WORK, WORK)
    side = int(max(x1 - x0, y1 - y0) * (1 + 2 * MARGIN))
    left, top = (x0 + x1) // 2 - side // 2, (y0 + y1) // 2 - side // 2
    rgba.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS).save(dst, "WEBP", quality=80, method=6)


def main(names):
    OUT.mkdir(parents=True, exist_ok=True)
    files = [RAW / f"{n}.png" for n in names] if names else sorted(RAW.glob("*.png"))
    for f in files:
        if not f.exists():
            print(f"missing {f.name}", file=sys.stderr)
            continue
        process(f, OUT / f"{f.stem}.webp")
        print(f"ok {f.stem}")


if __name__ == "__main__":
    main(sys.argv[1:])
