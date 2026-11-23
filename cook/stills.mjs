// Usage: node cook/stills.mjs <round-label> [pages...]  -> cook/stills/<label>/<design>-<page>-<vp>.png
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("/home/jovyan/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");

const [label = "r0", ...only] = process.argv.slice(2);
const BASE = "http://localhost:4173/simaxmeble-beta";
const pages = only.length ? only : ["/", "/produkty/fotel-grande/", "/fotele/", "/produkty/", "/tkaniny/", "/kontakt/"];
const out = new URL(`./stills/${label}/`, import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
for (const [vp, size] of [["desk", { width: 1440, height: 900 }], ["mob", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const design of ["a", "b"]) {
    for (const path of pages) {
      await page.goto(`${BASE}${path}?v=${design}`, { waitUntil: "networkidle" });
      const name = path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "_");
      await page.screenshot({ path: `${out}${design}-${name}-${vp}.png`, fullPage: vp === "desk" ? false : false });
      // Walk the page so lazy images load before the full-page shot.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${out}${design}-${name}-${vp}-full.png`, fullPage: true });
    }
  }
  await ctx.close();
}
await browser.close();
console.log("stills ->", out);
