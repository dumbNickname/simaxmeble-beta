import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import Catalogue from "~/components/Catalogue";
import NavLink from "~/components/NavLink";
import site from "~/data/site.json";
import { allProducts } from "~/utils/catalog";
import styles from "./produkty.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Kolekcja" }];

export default function Products() {
  return (
    <Layout>
      <SeoHead
        title="Kolekcja SIMAX: gotowe projekty foteli, sof i łóżek tapicerowanych"
        description={`${allProducts.length} gotowych projektów z pracowni SIMAX: fotele uszaki, fotele bujane, sofy boucle, łóżka 160x200 i krzesła. Kup w sklepie albo zamów w swojej tkaninie i kolorze.`}
        canonical="/produkty/"
        image={allProducts[0].cover!}
        pageType="CollectionPage"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute("/produkty/")}#lista`,
            name: "Kolekcja gotowych projektów SIMAX",
            numberOfItems: allProducts.length,
            itemListElement: allProducts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/produkty/${p.slug}/`), name: p.name })),
          },
        ]}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Kolekcja gotowych projektów</h1>
          <p class="lead">
            Modele, które szyjemy seryjnie. Kupisz je w <a href={site.shop} rel="noopener">sklepie SIMAX</a>, a każdy może być punktem wyjścia do <NavLink href="/na-zamowienie/">mebla na zamówienie</NavLink>. Wpisz model, kolor albo tkaninę.
          </p>
        </header>
        <Catalogue products={allProducts} search />
      </div>
    </Layout>
  );
}
