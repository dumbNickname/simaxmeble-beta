"""Marks packshots on a white background ("cutout": true) in image-sizes.json.

Cutouts are shown whole (object-fit: contain, multiply blend) on a tinted card;
room photos fill the card (object-fit: cover). Run after images.py.
"""
import json
from pathlib import Path
from PIL import Image

SITE = Path(__file__).resolve().parent.parent / "site"
path = SITE / "src/data/image-sizes.json"
sizes = json.loads(path.read_text())

for key, info in sizes.items():
    im = Image.open(SITE / f"public/img/{key}-480.jpg").convert("L")
    w, h = im.size
    # Corners and the middle of each edge, a few px in from the border.
    pts = [(4, 4), (w - 5, 4), (4, h - 5), (w - 5, h - 5), (w // 2, 4), (4, h // 2), (w - 5, h // 2)]
    info["cutout"] = sum(im.getpixel(p) >= 249 for p in pts) >= 6

path.write_text(json.dumps(sizes, ensure_ascii=False, indent=1))
print(sum(i["cutout"] for i in sizes.values()), "cutouts of", len(sizes))
