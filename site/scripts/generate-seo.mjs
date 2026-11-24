#!/usr/bin/env node
// Pre-build: writes public/sitemap.xml (with product images), robots.txt and llms.txt.
// URLs always use the production origin; the beta build is noindex anyway.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (name) => JSON.parse(readFileSync(resolve(root, "src/data", name), "utf8"));
const site = read("site.json");
const products = read("products.json");
const categoryCopy = read("category-copy.json");
const categories = read("categories.json")
  .filter((c) => c.products.length)
  .map((c) => ({ ...c, ...categoryCopy[c.slug] }));
const projects = read("projects.json").projects ?? [];
const fabrics = read("fabrics.json");
const sizes = read("image-sizes.json");
const customerPhotos = read("customer-photos.json").photos ?? [];
const SITE = site.url.replace(/\/$/, "");
const TODAY = new Date().toISOString().slice(0, 10);

const url = (path) => `${SITE}${path}`;
const img = (key) => {
  const info = sizes[key];
  return info ? url(`/img/${key}-${info.widths.at(-1)}.jpg`) : null;
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const staticPages = readdirSync(resolve(root, "src/routes"), { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".tsx") && !f.includes("["))
  .map((f) => "/" + f.replace(/\.tsx$/, "").replace(/(^|\/)index$/, ""))
  .map((r) => (r === "/" ? r : r.replace(/\/$/, "") + "/"))
  // Not indexable until customers send photos.
  .filter((r) => r !== "/meble-u-was/" || customerPhotos.length)
  .filter((r) => r !== "/realizacje/" || projects.length);

const KEY_PAGES = ["/na-zamowienie/", "/dla-firm/"];
const priority = (path) =>
  path === "/" ? "1.0" : KEY_PAGES.includes(path) || categories.some((c) => `/${c.slug}/` === path) ? "0.9" : "0.6";

const entries = [
  ...staticPages.map((loc) => ({
    loc,
    priority: priority(loc),
    images: loc === "/tkaniny/" ? fabrics.map((f) => f.image).filter(Boolean) : [],
  })),
  // Product pages canonicalise to the shop until the collection moves here.
  ...(site.indexCollection ? products : []).map((p) => ({
    loc: `/produkty/${p.slug}/`,
    priority: "0.8",
    lastmod: p.dateModified?.slice(0, 10),
    images: [...new Set(p.variants.flatMap((v) => v.images))],
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${url(e.loc)}</loc>
    <lastmod>${e.lastmod || TODAY}</lastmod>
    <priority>${e.priority}</priority>
${e.images
  .map(img)
  .filter(Boolean)
  .map((u) => `    <image:image><image:loc>${u}</image:loc></image:image>`)
  .join("\n")}
  </url>`.replace(/\n\n/g, "\n"),
  )
  .join("\n")}
</urlset>
`;
writeFileSync(resolve(root, "public/sitemap.xml"), sitemap);
console.log(`sitemap.xml: ${entries.length} URLs`);

const robots = `User-agent: *
Disallow:

# AI / LLM crawlers: explicitly allowed (visibility in AI search)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(resolve(root, "public/robots.txt"), robots);
console.log("robots.txt: generated");

const price = (n) => `${n.toLocaleString("pl-PL")} zł`;
const llms = `# ${site.name}

> ${site.tagline}: pracownia tapicerska, która szyje fotele, sofy, łóżka i siedziska według pomysłu klienta, od szkicu przez wspólny projekt z wymiarami do gotowego mebla. Dla domów i dla firm (restauracje, hotele, biura). Gotowe modele z kolekcji są w sklepie SIMAX: ${site.shop}

- Firma: ${site.legalName}
- Adres: ${site.address.street}, ${site.address.postalCode} ${site.address.city}, woj. ${site.address.region}
- Telefon: ${site.phone}
- E-mail: ${site.email}
- Mapa: ${site.maps.place}

## Na zamówienie

- [Meble na zamówienie: jak to działa, co można zmienić, wycena](${url("/na-zamowienie/")})
- [Meble tapicerowane dla firm: restauracje, hotele, biura](${url("/dla-firm/")})
${projects.length ? `- [Realizacje: od pomysłu do gotowego mebla](${url("/realizacje/")})\n` : ""}
## Kategorie

${categories.map((c) => `- [${c.name}](${url(`/${c.slug}/`)}): ${c.metaDescription}`).join("\n")}

## Gotowe projekty z kolekcji (do kupienia w sklepie SIMAX)

${products.map((p) => `- [${p.name}](${site.indexCollection ? url(`/produkty/${p.slug}/`) : site.shop.replace(/\/$/, "") + new URL(p.oldUrl ?? p.variants[0].oldUrl).pathname}): ${p.priceMin === p.priceMax ? price(p.priceMin) : `od ${price(p.priceMin)}`}, ${p.variants.length} wersji. ${esc(p.lead)}`).join("\n")}

## Informacje

- [Tkaniny obiciowe i ich parametry](${url("/tkaniny/")})
- [Dostawa, zwroty i reklamacje](${url("/dostawa-i-zwroty/")})
- [O nas](${url("/o-nas/")})
- [Kontakt i dojazd](${url("/kontakt/")})
`;
writeFileSync(resolve(root, "public/llms.txt"), llms);
console.log("llms.txt: generated");
