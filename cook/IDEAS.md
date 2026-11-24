# Ideas backlog (not implemented yet)

Ideas collected during the made-to-order repositioning, plus takeaways from the owner's reference fotelownia.com.pl. Nothing here is on the site yet. Each item has a status:

- **ready**: can be built now with the data we have.
- **owner**: needs an answer or material from the owner first (the question is in `cook/OWNER-QUESTIONS.md`).
- **later**: depends on a launch decision (domain, shop migration).

Rule for everything below: never copy fotelownia's text or numbers. Use them as patterns only, and fill them with SIMAX's confirmed facts.

## A. From fotelownia.com.pl (reviewed 2026-11-24)

Pages reviewed: `/zamowienia-indywidualne/`, `/wzornik/`, `/produkt/renowacje/`, `/platnosci-i-dostawa/`, `/o-nas/`, and the product page `/produkt/fotel-uszak-u01/`.

What they do well, mapped to SIMAX:

| # | Their pattern | What it would mean for SIMAX | Status |
| --- | --- | --- | --- |
| A1 | **Money and time in the process.** Deposit of about 40%, lead time counted from the deposit, the rest paid when the piece is ready, then shipping. | Our 4 stages say nothing about payment. SIMAX's own regulamin (`cms.json`) already mentions a deposit ("zaliczka", non-refundable after 24 h, extra deposit for construction changes). Add a "Płatność i termin" step or FAQ once the owner confirms the % and rules. | owner |
| A2 | **A concrete lead time range** ("6–10 tyg.", per model on product pages). | We say "termin podajemy z wyceną". A typical range ("zwykle X–Y tygodni") converts better and answers a top FAQ. | owner |
| A3 | **Free samples to a home address** and a **PDF swatch book by email**. | We send samples to a parcel locker, but we don't say whether that's free. A PDF swatch book could be generated at build time from `fabrics.json` plus the images (no third party). Link it from `/tkaniny/` and the brief form. | owner (free?), ready (PDF) |
| A4 | **Customer's own fabric** ("pracujemy na tkaninie powierzonej"). | A strong option for interior designers and B2B (fabric to match a venue). Add it to "Co możesz zmienić" if SIMAX accepts it. | owner |
| A5 | **Wood stain palette** shown as photos. | We promise "nogi drewniane w kolorze do wyboru" without showing the colours. Add a stain section to `/tkaniny/` (or `/wykonczenia/`) with photos of real samples. | owner (photos) |
| A6 | **Renovation service** ("twój mebel, nasze wykonanie"): a preliminary quote from a photo, a delivery note, and old pieces from the 1950s–70s. | A new service page, `/renowacja-mebli/` or `/tapicerowanie/`, would add high-intent local search phrases ("renowacja fotela", "nowe obicie sofy Kępno"). It fits the "your idea → finished piece" story, and before/after photos make the best realizacje. Do it only if SIMAX actually does re-upholstery. | owner |
| A7 | **Honest caveats**: screen colours differ from the fabric; on patterned fabrics, motifs get cut at seams; no returns on custom orders. | We already state the no-return rule. Add the screen-colour note (it's also in SIMAX's regulamin, section V). Turn the pattern point into a positive dialogue step: "ustalamy razem, jak ułożyć wzór tkaniny". | ready (colour), owner (pattern wording) |
| A8 | **Per-model customisation notes** on product pages (piping and button colour, which legs are possible, matching footstool). | Add an optional `customNotes` field per product and render it as "W tym modelu możesz zmienić…". Hand-managed file, because `normalize.py` overwrites `products.json`. | owner (per-model data) |
| A9 | **Scale reference**: "osoba na zdjęciu ma 170 cm". | Cheap trust for armchairs. Only where we know the person's height on a photo. | owner |
| A10 | **Full dimension table** incl. seat width/depth and armrest height. | We already render `dimensions` from the shop. Some products are missing seat width or armrest height. A small "brakujące wymiary" list for the owner. | ready (audit) |
| A11 | **Transparent shipping**: price per product class, legs unscrew for a courier, private carrier for big pieces, "kierowca nie wnosi", free pickup at the workshop. | `shipping.costPLN` is `null`. Ask for a price table per category and whether the driver carries the piece inside. Free pickup in Łęka Mroczeńska can go in now, if confirmed. | owner |
| A12 | **Shipping abroad** (DE, FR, ES, IT, IE) with an example price. | If SIMAX ships to DE, a short German landing page is a later SEO option. | owner, later |
| A13 | **Order form with model, fabric and leg colour fields.** | Our `BriefForm` has a model but no fabric. Add an optional "Tkanina" select from `fabrics.json`, a "Kolor nóg" field, and support for `?tkanina=` prefill from fabric pages. No backend needed. | ready |
| A14 | **"Na zamówienie" vs "Na stanie"** badges; the stock items are sold off at a discount. | If the owner has ready pieces or showroom models, a small static "Od ręki" list (hand-managed JSON) helps people in a hurry. | owner |
| A15 | **Support hours** in the trust strip ("pon–pt 8–16"). | Add the phone hours next to the number in the header/contact, and `openingHours` in the LocalBusiness schema. | owner |
| A16 | **Instagram as proof** ("Instagram jest najlepszym dowodem"). | Done: linked in the footer, contact and realizacje. Next: a static grid of 6–9 photos from the owner's export (no embed, no third-party script). | owner (photos) |

What to skip or do better:

- **Newsletter popup with a gift**: needs a mailing backend or a third-party script and annoys visitors. Skip.
- **Cart, quick view, Facebook widgets**: not our model. Skip.
- **No real case studies**: they rely on Instagram alone. Our structured Realizacje (idea → project → result) is already a differentiator. Keep it.
- **Prices without context**: they show one price per model with "final price depends on the fabric". We already show "od X zł" plus fabric groups. Keep it.
- **Lazy-loading placeholders as GIFs and the WordPress bloat**: our static AVIF setup is already faster.

## B. Earlier ideas from this project, not built yet

### Content waiting for the owner

- **B1 Realizacje cards and pages.** `projects.json` is empty. When it gets entries: homepage cards (the section already switches its copy), a page per project (`/realizacje/<slug>/`) with `CreativeWork` / `ImageObject` schema, a link from the related collection model ("Ten model powstał najpierw na zamówienie"), then index the section and add it to the sitemap. Needs a route with `[slug]` + prerender list in `vite.config.ts`.
- **B2 Before / after story type** for renovation (see A6), using the same `projects.json` format with a `type` field.
- **B3 Process deliverable wording.** Once the owner says whether the client gets a drawing, a 3D render or a written list, update `custom.json` stages and FAQ, and the IdeaStage "Projekt" label.
- **B4 B2B terms.** Replace the `XX` placeholders on `/dla-firm/` (minimum series, installation, fire-safety certificates).
- **B5 Fabric specs.** Fill in the missing abrasion, composition and weight values (brief: "każdy materiał powinien mieć speckę"). Then add a fabric comparison/filter (e.g. "do intensywnego użytku" for HoReCa, by Martindale).
- **B6 Meble u Was.** Customer photos with consent. The page stays out of the sitemap until there is at least one.
- **B7 Instagram originals** from the data export, processed through `scraper/images.py` into AVIF/JPEG.

### Launch and SEO

- **B8 Domain.** Pick one (proposals: `simaxnawymiar.pl`, `pracowniasimax.pl`, `simax-nazamowienie.pl`), set `site.json` → `url`, add a `CNAME`, and configure a production remote (only after the user agrees).
- **B9 Search Console + Bing Webmaster Tools** from day one, submit the sitemap, and record a baseline. Treat the first 3–6 months as a confounded test (new domain, new positioning, and seasonality all at once).
- **B10 Link from simaxmeble.pl** to the new site ("Meble na zamówienie" in the shop menu or a banner). It's the main source of early authority.
- **B11 Google Business Profile.** Add "meble na zamówienie" / "tapicer" categories and services, and link the new domain as the website (or as an extra link).
- **B12 Shop migration switches.** When the shop moves here: `indexCollection: true` (product pages self-canonical and in the sitemap) and `legacyRedirects: true` (PrestaShop URL stubs).
- **B13 Local landing copy.** One honest section on serving the area (Kępno, Ostrzeszów, Wrocław, Poznań, Kalisz) with delivery info, instead of thin city pages.
- **B14 Allegro links per product.** The brief allows them. `allegroUrl` exists but is empty, and `site.allegro` points to the Allegro homepage. Needs the owner's listing URLs.

### Product and UX

- **B15 "Przerób model z kolekcji" shortcut** on every collection product page: a prefilled brief (`?model=` already works) plus model-specific options (A8).
- **B16 Brief form attachments hint.** The mailto flow can't attach files. Add a visible line: "Zdjęcia i szkice dołączysz w mailu, który się otworzy" next to the button (the hint is currently only inside the email body).
- **B17 Pick a final design** (A–E) and remove the rest before production, including the design switch and the `?v=` handling.

## Next step suggestion

Build the **ready** items first (A7 colour note, A10 dimension audit, A13 fabric field in the brief form, B16 hint). They're small and need no owner input. Send the owner `cook/OWNER-QUESTIONS.md`: its new section 8 covers the fotelownia-inspired questions (deposit, lead time, free samples, own fabric, wood stains, renovation, shipping, hours).
