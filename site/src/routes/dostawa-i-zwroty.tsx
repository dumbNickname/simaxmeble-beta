import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import cms from "~/data/cms.json";
import site from "~/data/site.json";
import styles from "./simple.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Dostawa, zwroty i reklamacje" }];
const pages = cms as Record<string, { title: string; html: string }>;

// Old shop copy, cleaned: no repeated headings, no shouting, no checkout-only steps.
const delivery = pages["1-dostawa-i-platnosc"].html
  .replace(/^<h3>Dostawa<\/h3>/, "")
  .replace(/<h3><strong>UWAGA!!!<\/strong><\/h3><h3>(.*?)<\/h3>/, '<p><strong>Ważne:</strong> $1</p>');
const returns = pages["2-reklamacje-i-zwroty"].html
  .replace(/<h3>ZMIANA I ANULOWANE ZAMÓWIEŃ<\/h3>/, "<h3>Zmiana i anulowanie zamówienia</h3>")
  .replace(/<h3>ZWROTY<\/h3>/, "<h3>Zwroty</h3>")
  .replace(/<h3>REKLAMACJE<\/h3>/, "<h3>Reklamacje: szczegóły</h3>");

export default function Delivery() {
  return (
    <Layout>
      <SeoHead
        title="Dostawa, zwroty i reklamacje mebli SIMAX"
        description="Jak dostarczamy meble SIMAX: przewoźnik do drzwi, opcja wnoszenia, odbiór osobisty z rabatem, wysyłka za granicę. Zasady zwrotu w 14 dni dla wersji standardowych i reklamacji."
        canonical="/dostawa-i-zwroty/"
        breadcrumbs={crumbs}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Dostawa, zwroty i reklamacje</h1>
          <p class="lead">Krótko: dowozimy pod drzwi w całej Polsce, odbiór osobisty jest możliwy w Łęce Mroczeńskiej. Pytania? Zadzwoń: <a href={`tel:${site.phoneHref}`}>{site.phone}</a>.</p>
        </header>
        <ul class={styles.toc}>
          <li><NavLink href="/dostawa-i-zwroty/#dostawa">Dostawa</NavLink></li>
          <li><NavLink href="/dostawa-i-zwroty/#zwroty">Zmiany, zwroty i reklamacje</NavLink></li>
        </ul>
        <p class={`${styles.note} prose`}>
          Prawo zwrotu w 14 dni dotyczy mebli w standardowym wzorze. Meble szyte na indywidualne zamówienie (inna tkanina, zmiany wymiarów) nie podlegają zwrotowi. Koszt dostawy podamy przy zamówieniu.
        </p>
        <section id="dostawa" class={`${styles.legal} prose`} aria-labelledby="dostawa-h">
          <h2 id="dostawa-h">Dostawa</h2>
          <div innerHTML={delivery} />
        </section>
        <section id="zwroty" class={`${styles.legal} prose`} aria-labelledby="zwroty-h">
          <h2 id="zwroty-h">Zmiany zamówienia, zwroty i reklamacje</h2>
          <div innerHTML={returns} />
        </section>
      </div>
    </Layout>
  );
}
