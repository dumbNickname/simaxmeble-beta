# AGENTS.md: SIMAX meble static catalogue (PoC)

Static, SEO-first catalogue site for SIMAX (upholstered furniture, Łęka Mroczeńska), rebuilt from a crawl of the old PrestaShop shop simaxmeble.pl. No ordering: prices shown, order by phone, link to the old shop product, optional Allegro link. All copy is Polish (pl-PL). Same stack as `~/own/m-tynki` (its `AGENTS.md` has deeper notes on the shared Solid 2 / prerender setup).

`cook/BRIEF.md` is the project brief (requirements, design rules, the user's own words). Read it before design or content work.

## Layout

- `site/`: the only pnpm workspace package. Solid 2 + plain Vite 8 SSG (`@solidjs/vite-plugin` start mode, `filesystem-routing`, `prerender-crawler`). No SolidStart. Don't add `src/entry-*.tsx`, because they override the generated entries. `file-routes.d.ts` is generated and committed.
- `scraper/`: Python pipeline that produces the site data and images. Run it in this order:
  1. `python3 scraper/crawl.py`: stdlib only. Caches HTML and images in `scraper/cache/` (gitignored) and writes `scraper/out/raw.json`.
  2. `python3 scraper/normalize.py`: merges the per-colour shop URLs into one product per model with variants. The model map is the `PRODUCTS` list in this script.
  3. `scraper/.venv/bin/python scraper/images.py`: needs Pillow. Writes `site/public/img/<key>-{480,800,1200}.{avif,jpg}` and `site/src/data/image-sizes.json`. Skips files that already exist.
  4. `scraper/.venv/bin/python scraper/cutouts.py`: sets the `cutout` flag in `image-sizes.json`. Packshots on white get `contain`, room photos get `cover`.
- **`normalize.py` overwrites** `products.json`, `categories.json`, `fabrics.json`, `redirects.json` and `cms.json`. To change those permanently, edit `normalize.py`, not the JSON. It creates the hand-managed files (`bestsellers.json`, `customer-photos.json`, `site.json`) only once and never overwrites them, so editing those directly is fine.
- `cook/`: design iteration tooling. `cook/run.sh <label> [pages...]` builds the beta and saves Playwright screenshots of every design to `cook/stills/<label>/` (gitignored). It expects a preview server on :4173 (`pnpm preview` with `BASE_PATH=/simaxmeble-beta`) and pulls Playwright from a hardcoded npx cache path. `DESIGNS=a,b` env picks the designs.

## Commands (run in `site/`)

- `pnpm dev` (port 3000), `pnpm typecheck`, `pnpm build`, `pnpm preview`. No lint or test setup exists.
- `pnpm build` = `check-internal-links` (fails on a raw `<a href="/...">`, so use `NavLink`) → `generate-seo` (writes `public/sitemap.xml`, `robots.txt`, `llms.txt`) → `vite build` → `inline-css` → `generate-redirects`. Output goes to `dist/client/`.
- The build fails on any link to a page that isn't prerendered. The page list in `vite.config.ts` is: every non-`[param]` route file, plus `/produkty/<slug>` per product, plus `404.html`.
- This is a small VM, so cap memory as `cook/run.sh` does: `NODE_OPTIONS=--max-old-space-size=1536 BASE_PATH=/simaxmeble-beta pnpm build`.

## Gotchas

- **Designs**: one DOM, several proposals (A to E). `Document.tsx` sets `data-design` on `<html>` from `?v=a..e`, saved in `localStorage("simax_design")`. Without JS, the default is A. All design styling lives in `[data-design="x"]` selectors spread across the CSS modules and `global.css`. If you add or remove a design, update `Document.tsx` (`designInit`), `DesignSwitch.tsx` and `cook/stills.mjs`. The switch shows only on beta (`basePath` non-empty).
- **Categories are static route files** (`fotele.tsx`, `sofy.tsx`, … each renders `<CategoryPage slug>`). A new category in `categories.json` also needs its own route file.
- **Full-reload navigation is intentional**: `src/client-setup.ts` intercepts internal clicks and sets `location.href`, and reloads on popstate. It also handles `#hash` links (bare `#id` would resolve to the homepage because of `<base href>`), `?wariant=ID` variant switching on product pages, and gallery slide anchors. Don't switch to router links.
- **Base path**: `BASE_PATH` is `""` in production and `/simaxmeble-beta` on beta. It feeds Vite `base`, the `<base href>`, `NavLink` and the redirect stubs. On beta, `SeoHead` emits `noindex, nofollow`. Keep the robots meta in `SeoHead`, because Meta 2 dedupes by name and last one wins.
- `t.b.d.`: unknown data (fabric specs, shipping cost) is `null` and renders as `TBD` from `utils/catalog.ts`. Don't invent values. A `null` shipping cost is left out of the schema. Unconfirmed business terms in copy use `XX` placeholders (e.g. "od XX sztuk"). Every open question for the owner goes into `cook/OWNER-QUESTIONS.md` (Polish), not into the copy.
- `/meble-u-was/` stays out of the sitemap until `customer-photos.json` has photos (author consent required).
- Redirect stubs for old shop URLs come from `src/data/redirects.json`. Old paths ending in `.html` get a file with that exact name.
- Design rules from the brief: no web fonts, no third-party scripts, motion only in CSS or small inline JS, respect `prefers-reduced-motion`, content fully visible without JS, no em dashes in copy. Also no eyebrow labels, no 01/02/03 counters, no purple gradients, no beige.
- Solid 2: ARIA booleans need string values (`"true"`/`"false"`), because `false` removes the attribute. JSX must be created inside a component, so module-level data should use `() => <jsx/>`. Use `onSettled` instead of `onMount`. Production SSR errors are sanitized, so use `pnpm dev` to see the real message.

## Git / deploy

- Only the `beta` remote exists (`dumbNickname/simaxmeble-beta`, `master` tracks `beta/master`). `git push` deploys the GitHub Pages preview. No production remote is configured yet, so don't add one without asking.
- CI (`.github/workflows/deploy.yml`) builds on `master` and `experiment/*`. In the beta repo, experiment branches deploy too. Production deploys only from `master`.
- Commit messages are in English. For design work, prefix with the design letter (`D: ...`).
