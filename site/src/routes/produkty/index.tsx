import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import Catalogue from "~/components/Catalogue";
import { allProducts } from "~/utils/catalog";
import styles from "./produkty.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Wszystkie meble" }];

export default function Products() {
  return (
    <Layout>
      <SeoHead
        title="Wszystkie meble tapicerowane SIMAX: wyszukiwarka i galeria"
        description={`Przeszukaj ${allProducts.length} modeli mebli SIMAX: fotele uszaki, fotele bujane, sofy boucle, łóżka 160x200 i krzesła. Filtruj po kategorii, kolorze i tkaninie, przeglądaj galerię zdjęć.`}
        canonical="/produkty/"
        image={allProducts[0].cover!}
        pageType="CollectionPage"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute("/produkty/")}#lista`,
            name: "Meble SIMAX",
            numberOfItems: allProducts.length,
            itemListElement: allProducts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/produkty/${p.slug}/`), name: p.name })),
          },
        ]}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Wszystkie meble SIMAX</h1>
          <p class="lead">Wpisz model, kolor albo tkaninę. Przełącz na galerię, żeby zobaczyć wszystkie zdjęcia naraz.</p>
        </header>
        <Catalogue products={allProducts} search />
      </div>
    </Layout>
  );
}
