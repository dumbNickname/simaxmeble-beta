#!/usr/bin/env node
// Post-build: static redirect stubs for the old PrestaShop URLs (GitHub Pages
// cannot send 301s). Map: src/data/redirects.json, old path -> new path.
// Old paths ending in .html get a file of that exact name; others get a
// directory with index.html. Honors BASE_PATH.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "dist/client");
const base = (process.env.BASE_PATH || "").replace(/\/$/, "");
const site = JSON.parse(readFileSync(resolve(root, "src/data/site.json"), "utf8"));
const redirects = JSON.parse(readFileSync(resolve(root, "src/data/redirects.json"), "utf8"));

if (!existsSync(out)) {
  console.warn("generate-redirects: dist/client missing, run after the build");
  process.exit(0);
}

const stub = (target) => {
  const href = `${base}${target}`;
  return `<!DOCTYPE html>
<html lang="pl-PL">
<head>
<meta charset="utf-8">
<title>Przekierowanie</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${site.url}${target.replace(/#.*$/, "")}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${JSON.stringify(href)})</script>
</head>
<body>
<p>Ta strona została przeniesiona. <a href="${href}">Przejdź do nowego adresu</a>.</p>
</body>
</html>
`;
};

let count = 0;
for (const [from, to] of Object.entries(redirects)) {
  const clean = decodeURIComponent(from).replace(/^\//, "").replace(/\/$/, "");
  if (!clean) continue;
  const file = clean.endsWith(".html") ? resolve(out, clean) : resolve(out, clean, "index.html");
  if (existsSync(file)) {
    console.warn(`generate-redirects: skipping ${from}, a real page exists`);
    continue;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, stub(to));
  count++;
}
console.log(`generate-redirects: ${count} stub(s)`);
