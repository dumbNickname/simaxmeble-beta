#!/usr/bin/env node
// Pre-build: writes public/sitemap.xml (with product images), robots.txt and llms.txt.
// URLs always use the production origin; the beta build is noindex anyway.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (name) => JSON.parse(readFileSync(resolve(root, "src/data", name), "utf8"));
const site = read("site.json");
const products = read("products.json");
const categories = read("categories.json").filter((c) => c.products.length);
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
  .filter((r) => r !== "/meble-u-was/" || customerPhotos.length);

const priority = (path) => (path === "/" ? "1.0" : categories.some((c) => `/${c.slug}/` === path) ? "0.9" : "0.6");

const entries = [
  ...staticPages.map((loc) => ({
    loc,
    priority: priority(loc),
    images: loc === "/tkaniny/" ? fabrics.map((f) => f.image).filter(Boolean) : [],
  })),
  ...products.map((p) => ({
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

> ${site.tagline}: fotele, sofy, łóżka i krzesła tapicerowane szyte na zamówienie w Polsce. Zamówienia telefoniczne, ceny brutto w PLN.

- Firma: ${site.legalName}
- Adres: ${site.address.street}, ${site.address.postalCode} ${site.address.city}, woj. ${site.address.region}
- Telefon: ${site.phone}
- E-mail: ${site.email}
- Mapa: ${site.maps.place}

## Kategorie

${categories.map((c) => `- [${c.name}](${url(`/${c.slug}/`)}): ${c.metaDescription}`).join("\n")}

## Produkty

${products.map((p) => `- [${p.name}](${url(`/produkty/${p.slug}/`)}): ${p.priceMin === p.priceMax ? price(p.priceMin) : `od ${price(p.priceMin)}`}, ${p.variants.length} wersji. ${esc(p.lead)}`).join("\n")}

## Informacje

- [Tkaniny obiciowe i ich parametry](${url("/tkaniny/")})
- [Dostawa, zwroty i reklamacje](${url("/dostawa-i-zwroty/")})
- [O nas](${url("/o-nas/")})
- [Kontakt i dojazd](${url("/kontakt/")})
`;
writeFileSync(resolve(root, "public/llms.txt"), llms);
console.log("llms.txt: generated");
