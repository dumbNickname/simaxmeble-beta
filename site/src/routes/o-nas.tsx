import Layout from "~/components/Layout";
import SeoHead, { ORG_ID } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import site from "~/data/site.json";
import { allProducts } from "~/utils/catalog";
import styles from "./simple.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "O nas" }];

export default function About() {
  return (
    <Layout>
      <SeoHead
        title="O nas: SIMAX, producent mebli tapicerowanych z Wielkopolski"
        description="SIMAX Henryk Maksim z Łęki Mroczeńskiej szyje fotele, sofy, narożniki i łóżka tapicerowane. Kolekcje seryjne i projekty na indywidualne zamówienie, także dla firm (B2B)."
        canonical="/o-nas/"
        image="o-nas-1"
        pageType="AboutPage"
        breadcrumbs={crumbs}
        graph={[{ "@type": "AboutPage", "@id": `${site.url}/o-nas/#about`, mainEntity: { "@id": ORG_ID } }]}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Pracownia mebli tapicerowanych SIMAX</h1>
          <p class="lead">Szyjemy fotele, sofy, narożniki i łóżka w Łęce Mroczeńskiej, między Kępnem a Ostrzeszowem. Nowoczesny kształt, solidna rama, tkanina, którą wybierasz sam.</p>
        </header>
        <div class={styles.split}>
          <div class="prose">
            <h2>Kim jesteśmy</h2>
            <p>SIMAX to producent mebli tapicerowanych, który łączy nowoczesne wzornictwo z solidnym wykonaniem i wieloletnim doświadczeniem w branży meblarskiej. Robimy meble wygodne, funkcjonalne i dopracowane w detalach.</p>
            <p>Specjalizujemy się w fotelach, sofach, narożnikach i innych meblach tapicerowanych. Mamy kolekcje seryjne, takie jak fotel <NavLink href="/produkty/fotel-grande/">GRANDE</NavLink> czy <NavLink href="/produkty/fotel-eterno/">ETERNO</NavLink>, i realizujemy projekty na indywidualne zamówienie.</p>
            <h2>Nasza filozofia</h2>
            <p>Mebel to miejsce codziennego odpoczynku, spotkań i wygody. Dlatego łączymy estetykę z rozwiązaniami, które sprawdzają się na co dzień. Każdy projekt traktujemy indywidualnie: liczy się detal, jakość wykonania i trwałość.</p>
            <h2>Dla firm: hotele, kawiarnie, biura</h2>
            <p>Szyjemy także serie mebli dla firm. Możemy dopasować model z katalogu ({allProducts.length} modeli) do Twojego wnętrza, zmienić tkaninę na trudnopalną albo przygotować projekt od zera. Zadzwoń pod <a href={`tel:${site.phoneHref}`}>{site.phone}</a> albo napisz na <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
            <p class={styles.ctas}>
              <NavLink href="/produkty/" class="btn btn-primary">Zobacz nasze meble</NavLink>
              <NavLink href="/kontakt/" class="btn btn-ghost">Kontakt i dojazd</NavLink>
            </p>
          </div>
          <div class={styles.photos}>
            <Picture image="o-nas-1" alt="Pracownia tapicerska SIMAX" sizes="(min-width: 920px) 560px, 92vw" priority />
            <Picture image="o-nas-2" alt="Meble tapicerowane SIMAX w trakcie produkcji" sizes="(min-width: 920px) 560px, 92vw" />
            <Picture image="b2b-1" alt="Meble SIMAX dla firm i obiektów" sizes="(min-width: 920px) 560px, 92vw" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
