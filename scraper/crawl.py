#!/usr/bin/env python3
"""Crawl simaxmeble.pl (PrestaShop) and dump products, categories and CMS pages.

Stdlib only. Raw HTML is cached in scraper/cache/html/ so re-runs are cheap
(delete the cache to refetch). Original product photos go to scraper/cache/img/.
Output: scraper/out/raw.json

Usage: python3 scraper/crawl.py [--max-id 250] [--workers 3] [--no-images]
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://simaxmeble.pl"
ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "cache"
HTML_CACHE = CACHE / "html"
IMG_CACHE = CACHE / "img"
OUT = ROOT / "out" / "raw.json"
UA = "Mozilla/5.0 (compatible; simax-static-export/1.0)"


def fetch(url: str, binary: bool = False, retries: int = 2) -> tuple[int, bytes | str]:
    key = hashlib.sha1(url.encode()).hexdigest()
    cached = HTML_CACHE / f"{key}.html"
    if not binary and cached.exists():
        status, _, body = cached.read_text(encoding="utf-8").partition("\n")
        return int(status), body
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                status = r.status
            break
        except urllib.error.HTTPError as e:
            status, data = e.code, e.read() if not binary else b""
            break
        except Exception as e:  # network hiccup, slow category pages
            if attempt == retries:
                print(f"  ! {url}: {e}", file=sys.stderr)
                return 0, b"" if binary else ""
            time.sleep(2 * (attempt + 1))
    if binary:
        return status, data
    text = data.decode("utf-8", "replace")
    if status in (200, 404):
        cached.write_text(f"{status}\n{text}", encoding="utf-8")
    return status, text


def strip_tags(s: str) -> str:
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return re.sub(r"[ \t\xa0]+", " ", s).strip()


def meta(h: str, name: str) -> str:
    m = re.search(rf'<meta\s+(?:name|property)="{re.escape(name)}"\s+content="([^"]*)"', h)
    return html.unescape(m.group(1)).strip() if m else ""


def title(h: str) -> str:
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    return html.unescape(m.group(1)).strip() if m else ""


def main_block(h: str) -> str:
    """The page body between #main and the footer (drops header/menu noise)."""
    i = h.find('id="main"')
    j = h.find("<footer", i)
    return h[i:j] if i >= 0 else h


# ---------------------------------------------------------------- categories

CAT_RE = re.compile(r'href="(https://simaxmeble\.pl/(\d+)-([a-z0-9-]+))"')
PROD_RE = re.compile(r'href="(https://simaxmeble\.pl/[a-z0-9-]+/(\d+)-[^"]+?\.html)"')


def crawl_categories() -> dict:
    _, sitemap = fetch(f"{BASE}/mapa-strony")
    cats = {}
    for url, cid, slug in CAT_RE.findall(main_block(sitemap)):
        cats.setdefault(int(cid), {"id": int(cid), "slug": slug, "url": url})
    for cat in cats.values():
        products: list[int] = []
        page = 1
        while True:
            url = cat["url"] + (f"?page={page}" if page > 1 else "")
            print(f"  category {cat['slug']} page {page}")
            status, h = fetch(url)
            if status != 200:
                break
            if page == 1:
                body = main_block(h)
                desc = re.search(r'id="category-description"[^>]*>(.*?)</div>\s*</div>', body, re.S)
                cat.update(
                    title=title(h),
                    metaDescription=meta(h, "description"),
                    descriptionHtml=desc.group(1).strip() if desc else "",
                )
                crumbs = re.findall(r'itemprop="name">([^<]+)</span>', h)
                cat["name"] = html.unescape(crumbs[-1]).strip() if crumbs else cat["slug"]
            found = [int(pid) for _, pid in PROD_RE.findall(main_block(h))]
            new = [p for p in dict.fromkeys(found) if p not in products]
            products += new
            if not new or f"?page={page + 1}" not in h:
                break
            page += 1
        cat["productIds"] = products
    return cats


# ------------------------------------------------------------------ products


def parse_product(h: str, url: str) -> dict | None:
    m = re.search(r'data-product="([^"]+)"', h)
    if not m:
        return None
    d = json.loads(html.unescape(m.group(1)))
    crumbs = [html.unescape(c).strip() for c in re.findall(r'itemprop="name">([^<]+)</span>', h)]
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', h)
    images = [
        {
            "id": int(i["id_image"]),
            "legend": (i.get("legend") or "").strip(),
            "cover": i.get("cover") == "1",
            "original": image_original_url(int(i["id_image"])),
        }
        for i in d.get("images") or []
    ]
    # Combination groups (colour / fabric pickers), when the shop defines them.
    groups = []
    for gm in re.finditer(r'<div class="clearfix product-variants-item">(.*?)</div>\s*(?=<div class="clearfix product-variants-item">|</div>)', h, re.S):
        block = gm.group(1)
        label = re.search(r'<span class="control-label">([^<]+)</span>', block)
        opts = [strip_tags(o) for o in re.findall(r"<option[^>]*>(.*?)</option>", block, re.S)]
        opts += [html.unescape(o) for o in re.findall(r'title="([^"]+)"', block)]
        groups.append({"label": strip_tags(label.group(1)) if label else "", "options": list(dict.fromkeys(opts))})
    return {
        "id": int(d["id_product"]),
        "url": canonical.group(1) if canonical else url,
        "name": html.unescape(d.get("name") or "").strip(),
        "linkRewrite": d.get("link_rewrite"),
        "category": d.get("category"),
        "categoryName": d.get("category_name"),
        "idCategoryDefault": int(d.get("id_category_default") or 0),
        "breadcrumbs": crumbs,
        "price": d.get("price_amount"),
        "priceWithoutReduction": d.get("price_without_reduction"),
        "hasDiscount": bool(d.get("has_discount")),
        "reference": d.get("reference") or "",
        "manufacturer": d.get("manufacturer_name") or "",
        "descriptionShortHtml": d.get("description_short") or "",
        "descriptionHtml": d.get("description") or "",
        "metaTitle": d.get("meta_title") or "",
        "metaDescription": d.get("meta_description") or meta(h, "description"),
        "pageTitle": title(h),
        "features": [{"name": f["name"], "value": f["value"]} for f in d.get("features") or []],
        "availability": d.get("availability"),
        "quantity": d.get("quantity"),
        "condition": d.get("condition"),
        "dateAdd": d.get("date_add"),
        "dateUpd": d.get("date_upd"),
        "active": d.get("active"),
        "images": images,
        "variantGroups": groups,
    }


def image_original_url(image_id: int) -> str:
    return f"{BASE}/img/p/{'/'.join(str(image_id))}/{image_id}.jpg"


def crawl_products(ids: set[int], max_id: int, workers: int) -> dict[int, dict]:
    candidates = sorted(ids | set(range(1, max_id + 1)))
    products: dict[int, dict] = {}

    def one(pid: int):
        url = f"{BASE}/index.php?controller=product&id_product={pid}"
        status, h = fetch(url)
        if status != 200:
            return pid, None
        return pid, parse_product(h, url)

    with cf.ThreadPoolExecutor(workers) as ex:
        for pid, p in ex.map(one, candidates):
            if p:
                products[pid] = p
                print(f"  product {pid}: {p['name']}")
    return products


# ---------------------------------------------------------------- CMS pages


def crawl_cms() -> list[dict]:
    _, sitemap = fetch(f"{BASE}/mapa-strony")
    urls = sorted(set(re.findall(r'href="(https://simaxmeble\.pl/content/\d+-[a-z0-9-]+)"', sitemap)))
    pages = []
    for url in urls:
        status, h = fetch(url)
        if status != 200:
            continue
        body = main_block(h)
        content = re.search(r'<(?:section|div) id="content" class="page-content page-cms[^"]*">(.*)', body, re.S)
        heading = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
        pages.append({
            "url": url,
            "slug": url.rsplit("/", 1)[1],
            "title": title(h),
            "heading": strip_tags(heading.group(1)) if heading else "",
            "metaDescription": meta(h, "description"),
            "contentHtml": content.group(1).strip() if content else "",
            "text": strip_tags(content.group(1)) if content else "",
        })
        print(f"  cms {url}")
    return pages


def crawl_contact() -> dict:
    _, h = fetch(f"{BASE}/kontakt")
    text = strip_tags(h[h.find("location_on"):])
    m = re.search(r"location_on\s+(.*?)\s+email\s+(\S+)\s+call\s+([\d ]+)", text, re.S)
    return {"address": m.group(1) if m else "", "email": m.group(2) if m else "", "phone": m.group(3).strip() if m else ""}


def download_images(products: dict[int, dict], workers: int):
    IMG_CACHE.mkdir(parents=True, exist_ok=True)
    jobs = [img for p in products.values() for img in p["images"]]

    def one(img):
        dest = IMG_CACHE / f"{img['id']}.jpg"
        if dest.exists() and dest.stat().st_size > 0:
            return
        status, data = fetch(img["original"], binary=True)
        if status == 200 and data:
            dest.write_bytes(data)
        else:
            print(f"  ! image {img['id']}: {status}", file=sys.stderr)

    with cf.ThreadPoolExecutor(workers) as ex:
        list(ex.map(one, jobs))
    print(f"  images: {len(jobs)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-id", type=int, default=250)
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--no-images", action="store_true")
    args = ap.parse_args()
    HTML_CACHE.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    print("categories…")
    cats = crawl_categories()
    listed = {pid for c in cats.values() for pid in c["productIds"]}
    print("products…")
    products = crawl_products(listed, args.max_id, args.workers)
    print("cms…")
    cms = crawl_cms()
    contact = crawl_contact()
    if not args.no_images:
        print("images…")
        download_images(products, args.workers)

    OUT.write_text(json.dumps({
        "crawledAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source": BASE,
        "contact": contact,
        "categories": sorted(cats.values(), key=lambda c: c["id"]),
        "products": [products[k] for k in sorted(products)],
        "cms": cms,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"done: {len(products)} products, {len(cats)} categories, {len(cms)} cms pages → {OUT}")


if __name__ == "__main__":
    main()
