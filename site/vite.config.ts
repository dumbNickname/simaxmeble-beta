import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { prerender } from "prerender-crawler/vite";
import { defineConfig } from "vite";
import products from "./src/data/products.json" with { type: "json" };

// "" in production (custom domain), "/simaxmeble-beta" on the beta GitHub Pages site.
const basePath = (process.env.BASE_PATH || "").replace(/\/+$/, "");
const routesDir = fileURLToPath(new URL("./src/routes", import.meta.url));

// Every page that gets a static HTML file: the static route modules in
// src/routes (categories are static modules too), one page per product, and
// the 404 page for GitHub Pages.
function staticRoutes(): string[] {
  return readdirSync(routesDir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".tsx") && !file.includes("["))
    .map((file) => "/" + file.replace(/\.tsx$/, "").replace(/(^|\/)index$/, ""))
    .map((route) => (route.length > 1 ? route.replace(/\/$/, "") : route));
}

const pageRoutes = [
  ...staticRoutes(),
  ...products.map((product) => `/produkty/${product.slug}`),
];

const pages = [
  ...pageRoutes.map((route) => ({
    path: basePath + route,
    filename: route === "/" ? "index.html" : `${route.slice(1)}/index.html`,
  })),
  { path: `${basePath}/404`, filename: "404.html" },
];

// The crawl still follows links, but only to check them: a link to anything
// that is not one of the pages above (or a file) fails the build.
const unknownLinks = new Set<string>();

export default defineConfig({
  base: `${basePath}/`,
  resolve: {
    alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    // `extensions` makes the plugin also compile the `?pick=` route modules
    // the fileRoutes plugin emits (their ids end in a query string).
    // `renderMode: "async"` waits for every <Loading> boundary, so each
    // prerendered page is one complete document (no streamed fallbacks).
    solid({
      start: { clientSetup: "./src/client-setup.ts", renderMode: "async" },
      ssr: true,
      extensions: [".jsx", ".tsx"],
    }),
    fileRoutes({ types: true }),
    prerender({
      mode: "static",
      pages,
      filter(path) {
        if (!/\.[a-z0-9]+$/i.test(path)) unknownLinks.add(path);
        return false;
      },
      integrations: [
        {
          name: "simax-unknown-links",
          teardown() {
            if (unknownLinks.size) {
              throw new Error(`Links to pages that are not prerendered:\n  ${[...unknownLinks].join("\n  ")}`);
            }
          },
        },
      ],
    }),
  ],
  server: { port: 3000 },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
    sourcemap: true,
  },
});
