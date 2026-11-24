import { For, Show } from "solid-js";
import Layout from "./Layout";
import SeoHead, { absolute } from "./SeoHead";
import Breadcrumbs from "./Breadcrumbs";
import Catalogue from "./Catalogue";
import NavLink from "./NavLink";
import { allCategories, categoryBySlug, formatPrice, productsIn } from "~/utils/catalog";
import styles from "./CategoryPage.module.css";

export default function CategoryPage(props: { slug: string }) {
  const c = categoryBySlug(props.slug)!;
  const products = productsIn(c.slug);
  const from = Math.min(...products.map((p) => p.priceMin));
  const crumbs = [{ name: "Strona główna", href: "/" }, { name: c.name }];

  return (
    <Layout>
      <SeoHead
        title={c.title}
        description={c.metaDescription}
        canonical={`/${c.slug}/`}
        image={products[0]?.cover ?? undefined}
        pageType="CollectionPage"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute(`/${c.slug}/`)}#lista`,
            name: c.heading,
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/produkty/${p.slug}/`), name: p.name })),
          },
        ]}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>{c.heading}</h1>
          <p class="lead">{c.lead}</p>
          <p class={styles.count}>
            Gotowe projekty z kolekcji: {products.length} {products.length === 1 ? "model" : products.length < 5 ? "modele" : "modeli"}, od {formatPrice(from)}. <NavLink href="/na-zamowienie/">Chcesz inny wymiar albo kształt?</NavLink>
          </p>
          <Show when={c.slug === "lozka"}>
            <p class={styles.configure}>
              <NavLink href="/lozko-na-zamowienie/" class="btn btn-primary">Skonfiguruj łóżko na wymiar</NavLink>
              <span>Rozmiar, wezgłowie, pojemnik i nogi w kilku kliknięciach.</span>
            </p>
          </Show>
          <nav class={styles.siblings} aria-label="Inne kategorie">
            <For each={allCategories.filter((o) => o.products.length && o.slug !== c.slug)}>
              {(o) => <NavLink href={`/${o.slug}/`}>{o.name}</NavLink>}
            </For>
            <NavLink href="/produkty/">Szukaj we wszystkich</NavLink>
          </nav>
        </header>
        <Catalogue products={products} current={c.slug} />
        <Show when={c.introHtml}>
          <section class={styles.intro} aria-labelledby="o-kategorii">
            <h2 id="o-kategorii">{c.heading}: co warto wiedzieć</h2>
            <div class="prose" innerHTML={c.introHtml} />
          </section>
        </Show>
      </div>
    </Layout>
  );
}
