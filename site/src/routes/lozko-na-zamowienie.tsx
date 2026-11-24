import { For } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import BedConfigurator from "~/components/BedConfigurator";
import ProductCard from "~/components/ProductCard";
import Process from "~/components/Process";
import site from "~/data/site.json";
import { formatPrice, productsIn } from "~/utils/catalog";
import styles from "./custom.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Łóżka tapicerowane", href: "/lozka/" }, { name: "Łóżko na zamówienie" }];
const beds = productsIn("lozka");
const from = Math.min(...beds.map((p) => p.priceMin));

export default function BedToOrder() {
  return (
    <Layout>
      <SeoHead
        title="Łóżko tapicerowane na wymiar: konfigurator wezgłowia i rozmiaru | SIMAX"
        description="Skonfiguruj łóżko tapicerowane na zamówienie: rozmiar materaca, kształt i wysokość wezgłowia, pojemnik na pościel, nogi i tkanina. Wymiary i cenę ustalamy razem, szyjemy w pracowni SIMAX."
        canonical="/lozko-na-zamowienie/"
        image={beds[0]?.cover ?? undefined}
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "Service",
            "@id": `${absolute("/lozko-na-zamowienie/")}#usluga`,
            name: "Łóżka tapicerowane na zamówienie",
            serviceType: "Produkcja łóżek i wezgłowi tapicerowanych na wymiar",
            provider: { "@id": `${site.url}/#organization` },
            areaServed: { "@type": "Country", name: "Polska" },
            description: "Łóżko albo samo wezgłowie tapicerowane według wymiarów klienta: rozmiar materaca, kształt i wysokość wezgłowia, pojemnik na pościel, nogi, tkanina.",
          },
        ]}
      />

      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Łóżko tapicerowane na zamówienie</h1>
          <p class="lead">
            Wybierz rozmiar, wezgłowie i nogi, a podgląd pokaże, jak to wygląda. Konfiguracja to punkt wyjścia do rozmowy: dokładne wymiary, wypełnienie i cenę ustalimy razem.
          </p>
        </header>
      </div>

      <section class={`section ${styles.flushTop}`} aria-labelledby="konfiguracja">
        <div class="container">
          <h2 id="konfiguracja" class="sr-only">Konfigurator łóżka</h2>
          <BedConfigurator />
        </div>
      </section>

      <section class={`section ${styles.band}`} aria-labelledby="co-dalej">
        <div class="container">
          <div class="section-head">
            <h2 id="co-dalej">Co dzieje się po wysłaniu konfiguracji</h2>
            <p>Oddzwaniamy z pytaniami o sypialnię i materac, wysyłamy próbki tkanin, a po ustaleniu wszystkich wymiarów podajemy cenę i termin.</p>
          </div>
          <Process />
        </div>
      </section>

      <section class="section" aria-labelledby="gotowe-lozka">
        <div class="container">
          <div class="section-head">
            <h2 id="gotowe-lozka">Gotowe łóżka z kolekcji</h2>
            <p>
              Dla porównania: gotowe projekty 160 × 200 z pojemnikiem kosztują od {formatPrice(from)} w sklepie SIMAX. Każdy może być punktem wyjścia do Twojej wersji.
            </p>
          </div>
          <div class={styles.beds}>
            <For each={beds}>{(p) => <ProductCard product={p} />}</For>
          </div>
          <p class={styles.muted}>
            Szukasz czegoś innego niż łóżko? <NavLink href="/na-zamowienie/">Zobacz, jak powstaje każdy mebel na zamówienie</NavLink>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
