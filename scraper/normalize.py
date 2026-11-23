#!/usr/bin/env python3
"""Turn scraper/out/raw.json into the site's data files.

Old shop exposed one URL per colour (15+ products sharing the `fotel-grande`
slug). Here they are merged per model into one product with variants
(ProductGroup in JSON-LD), keeping each fabric/colour as a variant with its
own photos, price, old-shop link and Allegro slot.

Writes site/src/data/{products,categories,fabrics,redirects}.json and
scraper/out/image-manifest.json (source file -> output basename) for images.py.
Hand-edited files (bestsellers.json, customer-photos.json, site.json) are
created once and never overwritten.

Usage: python3 scraper/normalize.py
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "out" / "raw.json"
CMS_IMG = ROOT / "cache" / "img" / "cms"
DATA = ROOT.parent / "site" / "src" / "data"
MANIFEST = ROOT / "out" / "image-manifest.json"
TBD = None  # rendered as "t.b.d." by the site

# --------------------------------------------------------------- the model map
# slug -> product definition. Variant tuples: (old id, label, colour, pattern, base, fabric)
PRODUCTS = [
    {
        "slug": "fotel-grande",
        "category": "fotele",
        "name": "Fotel GRANDE",
        "title": "Fotel GRANDE skandynawski, tkaniny i kolory na zamówienie",
        "description": "Skandynawski fotel GRANDE z bukowymi nogami lub na płozach. 13 wersji tkanin: wzory Malawi, Jungle, Peru, kwiaty, Touch Me, Lawa. Od 1029 zł, polska produkcja.",
        "descriptionFrom": 28,
        "variants": [
            (12, "Musztardowy, wzór Malawi", "musztardowy", "Malawi", "nogi bukowe", None),
            (14, "Turkusowy, wzór Malawi", "turkusowy", "Malawi", "nogi bukowe", None),
            (19, "Czerwony, wzór Malawi", "czerwony", "Malawi", "nogi bukowe", None),
            (13, "Turkusowy, wzór Jungle", "turkusowy", "Jungle", "nogi bukowe", None),
            (15, "Czarny, wzór Jungle", "czarny", "Jungle", "nogi bukowe", None),
            (16, "Zielony, wzór Jungle", "zielony", "Jungle", "nogi bukowe", None),
            (17, "Musztardowy, wzór Peru", "musztardowy", "Peru", "nogi bukowe", None),
            (18, "Pudrowy róż w kwiaty", "pudrowy róż", "kwiaty", "nogi bukowe", None),
            (29, "Granatowy uszak", "granatowy", None, "nogi bukowe", None),
            (58, "Morski uszak", "morski", None, "nogi bukowe", None),
            (28, "Tkanina premium Touch Me", None, None, "nogi bukowe", "touch-me"),
            (42, "Tkanina Lawa", None, None, "nogi bukowe", "Lawa"),
            (20, "Bujany na płozach, we wzory", None, "wzory", "płozy bujane", None),
        ],
    },
    {
        "slug": "fotel-carmo",
        "category": "fotele",
        "name": "Fotel uszak CARMO",
        "title": "Fotel uszak CARMO, skandynawski fotel z wysokim oparciem",
        "description": "Skandynawski fotel uszak CARMO z wysokim oparciem 103 cm i bukowymi nogami. Granat, musztarda, butelkowa zieleń, oliwka w welurze hydrofobowym. 1159 zł.",
        "descriptionFrom": 27,
        "variants": [
            (21, "Granatowy", "granatowy", None, "nogi bukowe", None),
            (22, "Musztardowy", "musztardowy", None, "nogi bukowe", None),
            (23, "Butelkowa zieleń", "butelkowa zieleń", None, "nogi bukowe", None),
            (59, "Oliwkowy, welur hydrofobowy", "oliwkowy", None, "nogi bukowe", "welur hydrofobowy"),
            (27, "Wersja klasyczna", None, None, "nogi bukowe", None),
        ],
    },
    {
        "slug": "fotel-carmo-glamour",
        "category": "fotele",
        "name": "Fotel CARMO GLAMOUR",
        "title": "Fotel CARMO GLAMOUR, uszak na nogach zdobionych złotem",
        "description": "Fotel uszak CARMO GLAMOUR na smukłych nogach ze złotym zdobieniem. Kolor morski, musztardowy i dwa wzory, w tym Malawi. 1239 zł, szyty w Polsce.",
        "descriptionFrom": 33,
        "variants": [
            (30, "Morski", "morski", None, "nogi ze złotym zdobieniem", None),
            (31, "Musztardowy", "musztardowy", None, "nogi ze złotym zdobieniem", None),
            (32, "Musztardowy, wzór Malawi", "musztardowy", "Malawi", "nogi ze złotym zdobieniem", None),
            (33, "Musztardowy we wzory", "musztardowy", "wzory", "nogi ze złotym zdobieniem", None),
        ],
    },
    {
        "slug": "fotel-figaro",
        "category": "fotele",
        "name": "Fotel uszak FIGARO",
        "title": "Fotel uszak FIGARO duży, granat, zieleń, musztarda, wełna",
        "description": "Duży fotel uszak FIGARO w stylu skandynawskim: granatowy, butelkowa zieleń, musztardowy albo zielona wełna. Od 1159 zł, tkanina i kolor nóg do wyboru.",
        "descriptionFrom": 50,
        "variants": [
            (24, "Granatowy", "granatowy", None, "nogi bukowe", None),
            (25, "Butelkowa zieleń", "butelkowa zieleń", None, "nogi bukowe", None),
            (26, "Musztardowy", "musztardowy", None, "nogi bukowe", None),
            (50, "Zielony z wełny", "zielony", None, "nogi bukowe", "wełna"),
        ],
    },
    {
        "slug": "fotel-eterno",
        "category": "fotele",
        "name": "Fotel ETERNO",
        "title": "Fotel ETERNO pikowany: płozy, noga obrotowa lub drewniana",
        "description": "Pikowany fotel ETERNO na pięciu podstawach: drewniane nogi, płozy bujane, metalowa noga, noga obrotowa, podstawa krzyżowa. Od 1049 zł, kolory na zamówienie.",
        "descriptionFrom": 60,
        "variants": [
            (60, "Kość słoniowa, drewniane nogi", "kość słoniowa", None, "drewniane nogi", None),
            (39, "Pudrowy róż, płozy bujane", "pudrowy róż", None, "płozy bujane", None),
            (51, "Czarny, metalowa noga", "czarny", None, "metalowa noga", None),
            (55, "Morski, noga obrotowa", "morski", None, "noga obrotowa", None),
            (61, "Musztardowy, wzór Peru, podstawa krzyżowa", "musztardowy", "Peru", "podstawa krzyżowa drewniana", None),
        ],
    },
    {
        "slug": "fotel-allure",
        "category": "fotele",
        "name": "Fotel ALLURE",
        "title": "Fotel ALLURE designerski uszak na metalowych nogach spider",
        "description": "Designerski fotel ALLURE z rozłożystym wezgłowiem na metalowych nogach typu spider. Welur na siedzisku i oparciu, wysokość 100 cm. 2499 zł.",
        "descriptionFrom": 46,
        "variants": [
            (46, "Wersja 1", None, None, "nogi spider", None),
            (52, "Wersja 2", None, None, "nogi spider", None),
        ],
    },
    {
        "slug": "fotel-boston",
        "category": "fotele",
        "name": "Fotel BOSTON",
        "title": "Fotel BOSTON duży, nowoczesny fotel w stylu hampton",
        "description": "Duży, nowoczesny fotel BOSTON w stylu hampton: szerokość 100 cm, oparcie 74 cm. Szyty ręcznie w Polsce, tkanina do wyboru. 2499 zł.",
        "descriptionFrom": 41,
        "variants": [(41, "Hampton", None, None, None, None)],
    },
    {
        "slug": "fotel-liteno",
        "category": "fotele",
        "name": "Fotel LITENO",
        "title": "Fotel LITENO minimalistyczny, tapicerka i bukowe drewno",
        "description": "Minimalistyczny fotel LITENO: prosta tapicerka połączona z bukowym drewnem, szerokość 74 cm, wysokość 78 cm. 859 zł, polska produkcja na zamówienie.",
        "descriptionFrom": 7,
        "variants": [(7, "Standard", None, None, "drewno bukowe", None)],
    },
    {
        "slug": "fotel-baltic-boucle",
        "category": "fotele",
        "name": "Fotel kubełkowy BALTIC boucle",
        "title": "Fotel kubełkowy BALTIC boucle z poliestru z recyklingu",
        "description": "Fotel kubełkowy BALTIC o organicznej, zaokrąglonej formie, obity boucle z poliestru z recyklingu. Szerokość 95 cm. 2499 zł, szyty w Polsce.",
        "descriptionFrom": 54,
        "variants": [(54, "Boucle", None, None, None, "boucle")],
    },
    {
        "slug": "fotel-retro-prl",
        "category": "fotele",
        "name": "Fotel retro PRL",
        "title": "Fotel retro PRL oliwkowy, klasyka w nowym wydaniu",
        "description": "Fotel retro w stylu PRL w kolorze oliwkowym. Klasyczna sylwetka z lat 60., nowa tapicerka i solidny stelaż. 769 zł, produkcja SIMAX.",
        "descriptionFrom": 62,
        "variants": [(62, "Oliwkowy", "oliwkowy", None, None, None)],
    },
    {
        "slug": "krzeslo-confortavel",
        "category": "krzesla",
        "name": "Krzesło CONFORTAVEL",
        "title": "Krzesło CONFORTAVEL ze sklejki bukowej, do jadalni i kawiarni",
        "description": "Krzesło CONFORTAVEL ze sklejki bukowej z ergonomicznym oparciem, do jadalni, kuchni, kawiarni i sali konferencyjnej. Dwa rozmiary, od 520 zł.",
        "descriptionFrom": 43,
        "variants": [
            (43, "Szerokie, 60 cm", None, None, None, None),
            (44, "Wąskie, 54 cm", None, None, None, None),
        ],
    },
    {
        "slug": "podnozek-grande",
        "category": "dodatki",
        "name": "Podnóżek GRANDE",
        "title": "Podnóżek GRANDE skandynawski do fotela GRANDE",
        "description": "Skandynawski podnóżek GRANDE do kompletu z fotelem GRANDE, w tej samej tkaninie i na bukowych nogach. 329 zł, wykonanie na zamówienie.",
        "descriptionFrom": 47,
        "variants": [(47, "Standard", None, None, "nogi bukowe", None)],
    },
    {
        "slug": "kanapa-nuvem-boucle",
        "category": "sofy",
        "name": "Kanapa NUVEM boucle z funkcją spania",
        "title": "Kanapa NUVEM boucle rozkładana z funkcją spania",
        "description": "Rozkładana kanapa NUVEM w tkaninie boucle z funkcją spania, szerokość 211 cm. Miękka, zaokrąglona forma do salonu. 2199 zł, polska produkcja.",
        "descriptionFrom": 63,
        "variants": [(63, "Boucle", None, None, None, "boucle")],
    },
    {
        "slug": "kanapa-simple-boucle",
        "category": "sofy",
        "name": "Kanapa SIMPLE boucle z funkcją spania",
        "title": "Kanapa SIMPLE boucle rozkładana, prosta forma 211 cm",
        "description": "Kanapa SIMPLE w tkaninie boucle, rozkładana z funkcją spania, szerokość 211 cm. Prosta, geometryczna forma do salonu i pokoju gościnnego. 2199 zł.",
        "descriptionFrom": 67,
        "variants": [(67, "Boucle", None, None, None, "boucle")],
    },
    {
        "slug": "lozko-como-160x200",
        "category": "lozka",
        "name": "Łóżko tapicerowane COMO 160x200",
        "title": "Łóżko tapicerowane COMO 160x200 z pojemnikiem na pościel",
        "description": "Łóżko tapicerowane COMO 160x200 z pojemnikiem na pościel i metalowym stelażem. Tkanina i kolor do wyboru. 2398 zł, produkcja SIMAX.",
        "descriptionFrom": 64,
        "variants": [(64, "160x200", None, None, None, None)],
    },
    {
        "slug": "lozko-dia-160x200",
        "category": "lozka",
        "name": "Łóżko tapicerowane DIA 160x200",
        "title": "Łóżko tapicerowane DIA 160x200 z pojemnikiem i stelażem",
        "description": "Łóżko tapicerowane DIA 160x200 z pojemnikiem i metalowym stelażem, z miękkim wezgłowiem. Tkanina do wyboru. 2359 zł, szyte w Polsce.",
        "descriptionFrom": 66,
        "variants": [(66, "160x200", None, None, None, None)],
    },
]

CATEGORIES = [
    ("fotele", 62, "Fotele", "Fotele tapicerowane skandynawskie, uszaki i fotele bujane",
     "Fotele tapicerowane SIMAX: skandynawskie uszaki GRANDE, CARMO, FIGARO, ETERNO, fotele bujane i obrotowe. Szyte w Polsce, tkanina i kolor nóg do wyboru."),
    ("sofy", 59, "Sofy i kanapy", "Sofy i kanapy rozkładane z funkcją spania",
     "Kanapy rozkładane SIMAX z funkcją spania w tkaninie boucle: NUVEM i SIMPLE. Produkcja na zamówienie w Polsce, szerokość 211 cm."),
    ("lozka", 66, "Łóżka tapicerowane", "Łóżka tapicerowane 160x200 z pojemnikiem",
     "Łóżka tapicerowane SIMAX 160x200 z pojemnikiem na pościel i metalowym stelażem: COMO i DIA. Tkanina do wyboru, polska produkcja."),
    ("krzesla", 64, "Krzesła", "Krzesła tapicerowane i ze sklejki do jadalni",
     "Krzesła SIMAX ze sklejki bukowej do jadalni, kuchni i kawiarni. Model CONFORTAVEL w dwóch rozmiarach, produkcja w Polsce."),
    ("dodatki", 63, "Dodatki", "Podnóżki i dodatki do foteli",
     "Dodatki SIMAX do foteli tapicerowanych: podnóżek GRANDE w tej samej tkaninie co fotel, na bukowych nogach."),
]

# (id, name, group, cms image, known spec fields)
FABRICS = [
    ("bluvel", "Bluvel", "podstawowe", "BLUVEL", {"type": "velvet", "martindale": 40000, "composition": "100% PES"}),
    ("french-velvet", "French Velvet", "podstawowe", "french velvet", {"type": "velvet", "martindale": 115000, "composition": "100% PES", "certificates": ["antybakteryjna"]}),
    ("element", "Element", "podstawowe", "ELEMENT", {"type": "welur", "martindale": 50000, "certificates": ["bezpieczna dla dzieci", "trudnozapalna", "Water Blocked"]}),
    ("austin", "Austin", "podstawowe", "AUSTIN", {"type": "plecionka", "martindale": 115000, "certificates": ["Oeko-Tex", "REACH"]}),
    ("salvador", "Salvador", "podstawowe", "SALVADOR", {"type": "velvet", "martindale": 100000, "composition": "100% PES", "certificates": ["Pet Friendly", "trudnopalna", "antybakteryjna"]}),
    ("urban", "Urban", "podstawowe", "URBAN", {"type": "tkanina strukturalna", "martindale": 83000, "weight": 450, "composition": "100% PES", "certificates": ["Water Proof"]}),
    ("massimo", "Massimo", "podstawowe", "MASSIMO", {"type": "szenil", "martindale": 40000, "composition": "100% PES"}),
    ("touch-me", "Touch Me", "premium", "Touch Me", {"type": "welur", "martindale": 100000, "weight": 440, "width": 140, "composition": "100% PES", "certificates": ["bezpieczna dla niemowląt"]}),
    ("chill-me", "Chill Me", "premium", "Chill Me", {"type": "melanż", "martindale": 100000, "composition": "100% PES", "certificates": ["Water Blocked", "Good for babies", "Good for pets"]}),
    ("catch-me", "Catch Me", "premium", "catch_me", {"type": "szenil typu baranek", "martindale": 100000, "weight": 550, "composition": "100% PES"}),
    ("feel-me", "Feel Me", "premium", "feelMe", {"type": "boucle", "martindale": 100000, "composition": "100% PES", "certificates": ["REACH", "trudnopalna"]}),
    ("dama", "Dama", "premium", "DAMA", {"type": "wełna", "martindale": 100000, "composition": "100% wełna z recyklingu", "certificates": ["trudnopalna (BS 5852)"]}),
    ("zakard", "Żakard", "żakardowe", "zakardy", {"type": "żakard"}),
]
SPEC_KEYS = ["type", "composition", "martindale", "weight", "width", "pilling", "lightfastness", "flammability", "cleaning", "certificates"]


# ------------------------------------------------------------- html cleaning

KEEP = {"p", "ul", "ol", "li", "strong", "em", "br", "h3"}
RENAME = {"b": "strong", "i": "em", "h1": "h3", "h2": "h3", "h4": "h3", "h5": "h3", "h6": "h3"}
DROP_TEXT = re.compile(r"uwagach|koszyk|zamówieni[ae] w sklepie|Dodaj do|Głębokość całkowita|^Wymiary:?$", re.I)


class Cleaner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.stack: list[str] = []

    def handle_starttag(self, tag, attrs):
        tag = RENAME.get(tag, tag)
        if tag not in KEEP:
            return
        if tag == "br":
            self.out.append("<br>")
            return
        # block tags close any open inline/blocks of the same kind (bad nesting in source)
        self.out.append(f"<{tag}>")
        self.stack.append(tag)

    def handle_endtag(self, tag):
        tag = RENAME.get(tag, tag)
        if tag in KEEP and tag != "br" and tag in self.stack:
            while self.stack:
                t = self.stack.pop()
                self.out.append(f"</{t}>")
                if t == tag:
                    break

    def handle_data(self, data):
        self.out.append(html.escape(re.sub(r"\s+", " ", data), quote=False))

    def result(self) -> str:
        while self.stack:
            self.out.append(f"</{self.stack.pop()}>")
        return "".join(self.out)


def undash(s: str) -> str:
    """Spaced hyphens used as dashes: number ranges get an en dash, the rest a colon."""
    s = re.sub(r"(\d) [-\u2013\u2014] (\d)", "\\1\u2013\\2", s)
    return re.sub(r"\s+[-\u2013\u2014]\s+", ": ", s)


def clean_html(src: str) -> str:
    c = Cleaner()
    c.feed(src)
    s = c.result()
    s = re.sub(r"(<br>\s*)+(</(p|li|h3)>)", r"\2", s)
    s = re.sub(r"<(p|li|h3)>(\s*<br>)+", r"<\1>", s)
    # drop shop-only / duplicated blocks and empties
    def keep_block(m):
        inner = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        if not inner or DROP_TEXT.search(inner):
            return ""
        return m.group(0)
    s = re.sub(r"<(p|h3|li)>(.*?)</\1>", keep_block, s, flags=re.S)
    s = re.sub(r"<(ul|ol)>\s*</\1>", "", s)
    s = re.sub(r"<strong>\s*</strong>", "", s)
    # Decorative check marks from the shop copy; the site styles list bullets itself.
    s = re.sub(r"[\u2705\u2714\u2713\u2611]\ufe0f?\s*", "", s)
    s = undash(re.sub(r"\s+", " ", s).replace("> <", "><").strip())
    return s.replace("\u2014", ", ")


def text(src: str) -> str:
    return undash(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", src))).strip())


def num(v: str) -> str:
    v = v.strip()
    return v if re.search(r"[a-zA-Z]", v) else f"{v} cm"


# ----------------------------------------------------------------- products

def load_raw():
    if not RAW.exists():
        sys.exit("run scraper/crawl.py first")
    return json.loads(RAW.read_text(encoding="utf-8"))


def build(raw):
    P = {p["id"]: p for p in raw["products"]}
    manifest: dict[str, str] = {}
    products, redirects = [], {}
    used = set()
    for spec in PRODUCTS:
        slug = spec["slug"]
        src = P[spec["descriptionFrom"]]
        variants, images = [], []
        for vid, label, colour, pattern, base, fabric in spec["variants"]:
            p = P[vid]
            used.add(vid)
            vimgs = []
            for n, img in enumerate(sorted(p["images"], key=lambda i: not i["cover"])):
                key = f"{slug}-{img['id']}"
                manifest[key] = f"{img['id']}.jpg"
                vimgs.append(key)
                images.append({"key": key, "variant": vid})
            dims = [{"name": f["name"], "value": num(f["value"])} for f in p["features"]
                    if f["name"] not in ("Kolor Tkaniny", "Rodzaj podstawy")]
            fabric_id = fabric if fabric in {f[0] for f in FABRICS} else None
            variants.append({
                "id": vid,
                "sku": f"SIMAX-{vid}",
                "label": label,
                "fullName": text(p["name"]).replace("  ", " "),
                "colour": colour,
                "pattern": pattern,
                "base": base,
                "fabricId": fabric_id,
                "fabricName": None if fabric_id else fabric,
                "price": round(float(p["price"]), 2),
                "images": vimgs,
                "dimensions": dims,
                "oldUrl": p["url"],
                "allegroUrl": None,
            })
            path = urllib.parse.urlparse(p["url"]).path
            redirects[path] = f"/produkty/{slug}/" + (f"#wariant-{vid}" if len(spec["variants"]) > 1 else "")
        prices = [v["price"] for v in variants]
        first_dims = variants[0]["dimensions"]
        same_dims = all(v["dimensions"] == first_dims for v in variants)
        products.append({
            "slug": slug,
            "category": spec["category"],
            "name": spec["name"],
            "title": spec["title"],
            "metaDescription": spec["description"],
            "lead": text(src["descriptionShortHtml"]) or text(src["descriptionHtml"])[:220],
            "descriptionHtml": clean_html(src["descriptionHtml"]),
            "dimensions": next(v["dimensions"] for v in variants if v["id"] == spec["descriptionFrom"]),
            "dimensionsVary": not same_dims,
            "priceMin": min(prices),
            "priceMax": max(prices),
            "variants": variants,
            "cover": variants[0]["images"][0] if variants[0]["images"] else None,
            # Placeholder until real listings exist; null hides the button.
            "allegroUrl": "https://allegro.pl",
            "oldUrl": variants[0]["oldUrl"],
            "madeToOrder": True,
            "dateModified": max(P[v[0]]["dateUpd"] or "" for v in spec["variants"])[:10],
        })
    missing = sorted(set(P) - used)
    if missing:
        print("! products not mapped:", missing, file=sys.stderr)
    return products, redirects, manifest


def build_categories(raw, products):
    C = {c["id"]: c for c in raw["categories"]}
    out = []
    for slug, old_id, name, h1, desc in CATEGORIES:
        old = C.get(old_id, {})
        out.append({
            "slug": slug,
            "name": name,
            "heading": h1,
            "title": f"{h1} | SIMAX producent mebli",
            "metaDescription": desc,
            "introHtml": clean_html(old.get("descriptionHtml", "")),
            "products": [p["slug"] for p in products if p["category"] == slug],
        })
    return out


# ------------------------------------------------------------------ fabrics

def fetch_bytes(url: str) -> bytes | None:
    url = urllib.parse.quote(url, safe=":/?=&%")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (simax-static-export)"})
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read()
    except Exception as e:
        print(f"  ! {url}: {e}", file=sys.stderr)
        return None


def cms_image(url: str, manifest: dict, key: str) -> str | None:
    CMS_IMG.mkdir(parents=True, exist_ok=True)
    ext = url.rsplit(".", 1)[-1].lower()
    name = hashlib.sha1(url.encode()).hexdigest()[:12] + "." + ext
    dest = CMS_IMG / name
    if not dest.exists():
        data = fetch_bytes(url)
        if not data:
            return None
        dest.write_bytes(data)
    manifest[key] = f"cms/{name}"
    return key


def build_fabrics(raw, manifest):
    cms = {c["slug"]: c for c in raw["cms"]}
    page = cms["10-tkaniny-obiciowe"]["contentHtml"]
    imgs = re.findall(r'<img[^>]+src="([^"]+)"', page)
    blocks = re.split(r"KOLEKCJA |TKANINY ŻAKARDOWE", text(page))
    out = []
    for fid, name, group, img_hint, known in FABRICS:
        url = next((u for u in imgs if img_hint.lower() in u.lower()), None)
        key = cms_image(url, manifest, f"tkanina-{fid}") if url else None
        body = next((b for b in blocks if b.upper().startswith(name.upper())), "") if fid != "zakard" else blocks[-1]
        body = body[len(name):] if fid != "zakard" else body
        body = re.split(r"Ścieralność|Scieralność|Czyszczenie tylko|Rodzaj tkaniny|Sposób czyszczenia|TKANINY PREMIUM|Wynik 100", body)[0]
        cleaning = "Tylko łagodne środki do tapicerki. Nie bielić, nie prasować, nie suszyć mechanicznie, nie czyścić chemicznie." \
            if fid in ("urban", "touch-me", "catch-me", "feel-me") else TBD
        specs = {k: known.get(k, TBD) for k in SPEC_KEYS}
        specs["cleaning"] = cleaning
        out.append({"id": fid, "name": name, "group": group, "image": key,
                    "description": body.strip().rstrip("."), "specs": specs})
    return out


# --------------------------------------------------------------------- main

def write(name, data, keep=False):
    path = DATA / name
    if keep and path.exists():
        return
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT.parent)}")


def main():
    raw = load_raw()
    DATA.mkdir(parents=True, exist_ok=True)
    products, redirects, manifest = build(raw)
    categories = build_categories(raw, products)
    fabrics = build_fabrics(raw, manifest)

    cms = {c["slug"]: c for c in raw["cms"]}
    for slug, key in [("4-o-nas", "o-nas"), ("12-wybarwienia-drewna", "wybarwienia"), ("11-b2b", "b2b")]:
        for n, url in enumerate(re.findall(r'<img[^>]+src="([^"]+)"', cms[slug]["contentHtml"])):
            cms_image(url, manifest, f"{key}-{n + 1}")

    redirects.update({
        "/content/4-o-nas": "/o-nas/", "/content/10-tkaniny-obiciowe": "/tkaniny/",
        "/content/12-wybarwienia-drewna": "/tkaniny/#wybarwienia-drewna", "/content/1-dostawa-i-platnosc": "/dostawa-i-zwroty/",
        "/content/2-reklamacje-i-zwroty": "/dostawa-i-zwroty/", "/content/5-faq": "/dostawa-i-zwroty/",
        "/content/11-b2b": "/o-nas/", "/content/3-regulamin": "/dostawa-i-zwroty/", "/content/13-polityka-prywatnosci": "/kontakt/",
        "/62-fotele": "/fotele/", "/2-glowna": "/", "/59-sofy": "/sofy/", "/61-zestawy": "/dodatki/", "/63-dodatki": "/dodatki/",
        "/64-krzesla": "/krzesla/", "/66-lozka-sypialniane": "/lozka/", "/67-lozka-kontynentalne": "/lozka/",
        "/nowe-produkty": "/produkty/", "/bestsellery": "/", "/promocje": "/produkty/", "/mapa-strony": "/produkty/",
    })

    write("products.json", products)
    write("categories.json", categories)
    write("fabrics.json", fabrics)
    write("redirects.json", dict(sorted(redirects.items())))
    write("cms.json", {k: {"title": v["heading"] or v["title"], "html": clean_html(v["contentHtml"])} for k, v in cms.items()
                       if k in ("1-dostawa-i-platnosc", "2-reklamacje-i-zwroty", "4-o-nas", "5-faq", "12-wybarwienia-drewna")})
    write("bestsellers.json", {"_help": "Kolejność = kolejność na stronie głównej. Wpisz slug z products.json.",
                               "products": ["fotel-grande", "fotel-eterno", "kanapa-nuvem-boucle", "fotel-carmo", "fotel-allure", "lozko-como-160x200"]}, keep=True)
    write("customer-photos.json", {"_help": "Zdjęcia od klientów. Plik do site/public/img/klienci/, potem wpis: {\"file\": \"nazwa.jpg\", \"product\": \"fotel-grande\", \"author\": \"Anna z Poznania\", \"caption\": \"...\", \"date\": \"2026-11-01\"}. Zgoda autora wymagana.",
                                   "photos": []}, keep=True)
    contact = raw["contact"]
    write("site.json", {
        "name": "SIMAX meble", "legalName": "SIMAX Henryk Maksim", "tagline": "Producent mebli tapicerowanych",
        "url": "https://simaxmeble.pl", "phone": "+48 880 503 442", "phoneHref": "+48880503442", "email": contact["email"] or "sklep@simaxmeble.pl",
        "address": {"street": "Łęka Mroczeńska 12", "postalCode": "63-604", "city": "Baranów", "region": "wielkopolskie", "country": "PL"},
        "shop": "https://simaxmeble.pl", "allegro": "https://allegro.pl",
        "shipping": {"_help": "costPLN: null = nie publikuj stawki w schema (t.b.d.)", "costPLN": None, "handlingDays": None, "transitDays": [1, 5]},
        "returnPolicy": {"_help": "Meble na zamówienie (art. 38 pkt 3 ustawy o prawach konsumenta): brak prawa odstąpienia. Do potwierdzenia przez właściciela.", "type": "notPermitted", "days": 0},
    }, keep=True)
    MANIFEST.write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"done: {len(products)} products, {sum(len(p['variants']) for p in products)} variants, {len(fabrics)} fabrics, {len(manifest)} images")


if __name__ == "__main__":
    main()
