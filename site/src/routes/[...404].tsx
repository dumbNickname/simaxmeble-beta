import { For } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import NavLink from "~/components/NavLink";
import ProductCard from "~/components/ProductCard";
import bestsellers from "~/data/bestsellers.json";
import { productBySlug, type Product } from "~/utils/catalog";
import styles from "./simple.module.css";

const picks = bestsellers.products.slice(0, 3).map(productBySlug).filter(Boolean) as Product[];

export default function NotFound() {
  return (
    <Layout>
      <SeoHead title="Nie znaleziono strony" description="Tej strony nie ma. Zobacz fotele, sofy i łóżka SIMAX albo skorzystaj z wyszukiwarki." noindex />
      <div class="container">
        <header class={styles.head}>
          <h1>Ten fotel ktoś już zabrał</h1>
          <p class="lead">Strony nie ma pod tym adresem. Może szukasz jednego z tych mebli?</p>
          <p class={styles.ctas}>
            <NavLink href="/produkty/" class="btn btn-primary">Wyszukiwarka mebli</NavLink>
            <NavLink href="/" class="btn btn-ghost">Strona główna</NavLink>
          </p>
        </header>
        <div style={{ display: "grid", gap: "1.5rem", "grid-template-columns": "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}>
          <For each={picks}>{(p) => <ProductCard product={p} level={2} />}</For>
        </div>
      </div>
    </Layout>
  );
}
