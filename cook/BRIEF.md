# Brief: SIMAX meble, static catalogue site (PoC)

Target: a static, SEO-first catalogue site for SIMAX (upholstered furniture maker, Łęka Mroczeńska) built from a crawl of simaxmeble.pl, free of every issue from the technical audit. The shop itself is ignored: prices are shown, ordering goes by phone, a direct link to the old shop product page, and an optional per-product Allegro link (hidden when not configured).
Stack: same as m-tynki: Solid 2 + Vite 8 SSG (prerender-crawler, filesystem-routing), CSS Modules, system fonts only, JSON data, GitHub Pages (beta repo dumbNickname/simaxmeble-beta).
Pages: home (hand-managed bestsellers), catalogue with search + gallery, product detail, fabrics (materials with specs, t.b.d. placeholders), customer photos ("meble u Was", static JSON), about, contact, 404.
References: no external references. R00 = current simaxmeble.pl (baseline). Bar is "clearly better than R00", modern and playful.
Two proposals (A and B) in one build, same DOM and SEO, switched by `data-design` on <html>. Up to 3 iterations each.
Bar (UI mapping, 1-10, critic median): layout and spacing 8, typography 8, color 8, imagery 8, motion and interaction 8, trust and clarity 8.
Rules: Cook slop ban list (no eyebrow labels, no monospace uppercase, no 01/02/03 counters, no glowing orbs, no decorative particles, no purple gradients, no beige, no em dashes in copy). Code-made motion only (CSS + small inline JS), honour prefers-reduced-motion, content fully visible without JS. No web fonts. No third-party scripts.
Must keep: SEO first (SSR HTML, one H1 per page, unique titles/descriptions, canonical, ProductGroup/Product JSON-LD, sitemap, robots, llms.txt, legacy URL redirect stubs), Lighthouse-grade performance (AVIF + JPEG responsive images).
Time: PoC, hard cap, about 3 rounds per proposal. Started: 2026-11-23 13:30.
Permissions: crawl simaxmeble.pl yes, push to beta yes, origin later (not configured yet).
User's words: "chce statyczna strone ale wolna od wszystkich zaraportowanych przez Ciebie problemow" "Oczekuje czegos nowoczesnego i zabawnego. wystarcza 2 propozycje i do 3 iteracji na kazdej. Nie buduj calego brandingu a jedynie strone. zadbaj zeby byl jakis motion control na stronie itp. ale focus na SEO!" "scalic w 1 produkt, ale wazne zeby utrzymac roznorodnosc materialow i zeby tez bylo seo friendly. W przyszlosci kazdy material tez powinien miec specke typu scieralnosc, gramatura itp." "moze zaplanuj tez osobna sekcje na zdjecia od uzytkownikow (tez zarzadzana statycznie)"
