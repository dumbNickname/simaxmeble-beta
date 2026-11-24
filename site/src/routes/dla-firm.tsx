import { For } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import BriefForm from "~/components/BriefForm";
import custom from "~/data/custom.json";
import site from "~/data/site.json";
import { allFabrics, TBD } from "~/utils/catalog";
import styles from "./custom.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Meble dla firm" }];
const b2b = custom.b2b;

// Fabrics that suit venues: high abrasion resistance or a fire-retardant finish.
const contractFabrics = allFabrics.filter(
  (f) => (f.specs.martindale ?? 0) >= 50000 || (f.specs.certificates ?? []).some((c) => /trudno/i.test(c)),
);

const minRubs = Math.min(...contractFabrics.map((f) => f.specs.martindale ?? Infinity));

// Terms the owner has not confirmed yet render as t.b.d. instead of a guess.
const terms: [string, string | null][] = [
  ["Ceny dla firm", "indywidualnie, zależnie od serii"],
  ["Minimalna seria", null],
  ["Termin realizacji serii", "podajemy razem z wyceną"],
  ["Montaż na miejscu", null],
  ["Atesty trudnopalności dla obiektu", null],
  ["Faktura", "faktura VAT"],
];

export default function ForBusiness() {
  return (
    <Layout>
      <SeoHead
        title="Meble tapicerowane dla firm: restauracje, hotele, biura (HoReCa) | SIMAX"
        description="Meble tapicerowane na zamówienie dla restauracji, kawiarni, hoteli i biur: ławy, siedziska pod ścianę, krzesła, fotele, wezgłowia. Serie według Twojego projektu, z pracowni SIMAX."
        canonical="/dla-firm/"
        image="o-nas-2"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "Service",
            "@id": `${absolute("/dla-firm/")}#usluga`,
            name: "Meble tapicerowane dla firm i HoReCa",
            serviceType: "Produkcja seryjna mebli tapicerowanych na zamówienie",
            provider: { "@id": `${site.url}/#organization` },
            audience: { "@type": "BusinessAudience", audienceType: "Restauracje, kawiarnie, hotele, biura" },
            areaServed: { "@type": "Country", name: "Polska" },
          },
        ]}
      />

      <div class="container">
        <header class={`${styles.head} ${styles.headSplit}`}>
          <div>
            <Breadcrumbs items={crumbs} />
            <h1>Meble tapicerowane dla restauracji, hoteli i biur</h1>
            <p class="lead">
              Ława pod ścianę w kawiarni, trzydzieści krzeseł do sali, fotele do pokoi hotelowych. Szyjemy serie mebli według Twojego projektu albo na bazie modeli z naszej kolekcji.
            </p>
            <div class={styles.ctas}>
              <NavLink href="/dla-firm/#brief" class="btn btn-primary">Wyślij zapytanie</NavLink>
              <a class="btn btn-ghost" href={`tel:${site.phoneHref}`}>Zadzwoń: {site.phone.replace("+48 ", "")}</a>
            </div>
          </div>
          <div class={styles.headPhoto}>
            <Picture image="o-nas-2" alt="Turkusowe fotele i sofa tapicerowana w kawiarni" sizes="(min-width: 960px) 520px, 92vw" priority />
          </div>
        </header>
      </div>

      <section class="section" aria-labelledby="dla-kogo">
        <div class="container">
          <div class="section-head">
            <h2 id="dla-kogo">Dla kogo szyjemy</h2>
            <p>Każdy lokal ma inne meble, ale te same potrzeby: wygoda gościa i tkanina, która wytrzyma.</p>
          </div>
          <ul class={styles.sectors}>
            <For each={b2b.sectors}>
              {(s) => (
                <li class="reveal">
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>

      <section class={`section ${styles.band}`} aria-labelledby="tkaniny-obiekty">
        <div class="container">
          <div class="section-head">
            <h2 id="tkaniny-obiekty">Tkaniny do intensywnego użytku</h2>
            <p>W lokalu krzesło dostaje więcej przez miesiąc niż w domu przez rok. Te tkaniny z naszej oferty mają wysoką ścieralność albo wykończenie trudnopalne.</p>
          </div>
          <div class={styles.tableWrap}>
            <table class={styles.fabricTable}>
              <thead>
                <tr><th scope="col">Tkanina</th><th scope="col">Rodzaj</th><th scope="col">Ścieralność (Martindale)</th><th scope="col">Atesty i cechy</th></tr>
              </thead>
              <tbody>
                <For each={contractFabrics}>
                  {(f) => (
                    <tr>
                      <th scope="row"><NavLink href={`/tkaniny/#${f.id}`}>{f.name}</NavLink></th>
                      <td>{f.specs.type ?? <span class="tbd">{TBD}</span>}</td>
                      <td>{f.specs.martindale ? `${f.specs.martindale.toLocaleString("pl-PL")} cykli` : <span class="tbd">{TBD}</span>}</td>
                      <td>{f.specs.certificates?.length ? f.specs.certificates.join(", ") : <span class="tbd">{TBD}</span>}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <p class={styles.muted}>
            Dane według producentów tkanin. Do intensywnego użytku w lokalach zwykle zaleca się ponad 30 000 cykli, a tkaniny w tabeli mają od {minRubs.toLocaleString("pl-PL")}. Jeśli obiekt wymaga konkretnej normy trudnopalności, napisz o tym w zapytaniu.
          </p>
        </div>
      </section>

      <section class="section" aria-labelledby="wspolpraca">
        <div class={`container ${styles.split}`}>
          <div>
            <h2 id="wspolpraca">Jak wygląda współpraca</h2>
            <ol class={styles.steps}>
              <For each={b2b.steps}>
                {(s) => (
                  <li class="reveal">
                    <h3>{s.name}</h3>
                    <p>{s.text}</p>
                  </li>
                )}
              </For>
            </ol>
          </div>
          <div class={styles.panel}>
            <h2 class={styles.small}>Warunki</h2>
            <ul class={styles.checklist}>
              <For each={b2b.perks}>{(p) => <li>{p}</li>}</For>
            </ul>
            <table class="spec-table">
              <caption class="sr-only">Warunki współpracy z firmami</caption>
              <tbody>
                <For each={terms}>
                  {([name, value]) => (
                    <tr><th scope="row">{name}</th><td>{value ?? <span class="tbd">{TBD}</span>}</td></tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class={`section ${styles.band}`} aria-labelledby="zapytanie">
        <div class={`container ${styles.briefGrid}`}>
          <div>
            <h2 id="zapytanie">Zapytanie od firmy</h2>
            <p class="lead">Im więcej wiemy na starcie, tym szybciej dostaniesz rysunek i wycenę.</p>
            <h3 class={styles.small}>Przyda się</h3>
            <ul class={styles.checklist}>
              <For each={b2b.checklist}>{(c) => <li>{c}</li>}</For>
            </ul>
            <p class={styles.muted}>
              Szukasz jednego mebla do domu? Zobacz <NavLink href="/na-zamowienie/">meble na zamówienie</NavLink>.
            </p>
          </div>
          <BriefForm b2b />
        </div>
      </section>
    </Layout>
  );
}
