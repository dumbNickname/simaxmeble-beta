#!/usr/bin/env python3
"""Resize + re-encode every image in out/image-manifest.json.

Output: site/public/img/<key>-<w>.avif and .jpg at 480/800/1200 px wide
(never upscaled) + site/src/data/image-sizes.json with intrinsic size and
an average colour used as the placeholder background.
Skips files that already exist. Run with scraper/.venv/bin/python.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "cache" / "img"
OUT = ROOT.parent / "site" / "public" / "img"
SIZES = ROOT.parent / "site" / "src" / "data" / "image-sizes.json"
WIDTHS = [480, 800, 1200]
# Supplier renders with a "Quelle 0X" caption in the bottom-right corner: crop it off.
CROP_BOTTOM = {"kanapa-simple-boucle-445": 0.07, "lozko-como-160x200-379": 0.07, "lozko-dia-160x200-412": 0.07}


def flatten(im: Image.Image) -> Image.Image:
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def main():
    manifest = json.loads((ROOT / "out" / "image-manifest.json").read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = json.loads(SIZES.read_text()) if SIZES.exists() else {}
    for n, (key, rel) in enumerate(sorted(manifest.items())):
        src = SRC / rel
        if not src.exists():
            print("missing", rel)
            continue
        im = flatten(Image.open(src))
        if key in CROP_BOTTOM:
            im = im.crop((0, 0, im.width, round(im.height * (1 - CROP_BOTTOM[key]))))
        w, h = im.size
        widths = [x for x in WIDTHS if x < w] + ([min(w, WIDTHS[-1])] if w <= WIDTHS[-1] else [])
        widths = sorted(set(widths)) or [w]
        for tw in widths:
            a, j = OUT / f"{key}-{tw}.avif", OUT / f"{key}-{tw}.jpg"
            if a.exists() and j.exists():
                continue
            r = im.resize((tw, round(h * tw / w)), Image.LANCZOS) if tw != w else im
            r.save(j, "JPEG", quality=78, optimize=True, progressive=True)
            r.save(a, "AVIF", quality=52, speed=6)
        avg = im.resize((1, 1), Image.BOX).getpixel((0, 0))
        sizes[key] = {"w": w, "h": h, "widths": widths, "color": "#%02x%02x%02x" % avg}
        print(n, key, w, h, widths, flush=True)
    SIZES.write_text(json.dumps(dict(sorted(sizes.items())), indent=1) + "\n")


if __name__ == "__main__":
    main()
