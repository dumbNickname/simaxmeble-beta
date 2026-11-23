import { For } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import ProductCard from "~/components/ProductCard";
import CustomerPhotos from "~/components/CustomerPhotos";
import bestsellers from "~/data/bestsellers.json";
import site from "~/data/site.json";
import { allCategories, allFabrics, allProducts, productBySlug, formatPrice, variantColour, type Product } from "~/utils/catalog";
import styles from "./index.module.css";

const grande = productBySlug("fotel-grande")!;
const heroVariants = [12, 13, 18, 19, 15].map((id) => grande.variants.find((v) => v.id === id)!);
const picks = bestsellers.products.map((slug) => productBySlug(slug)).filter(Boolean) as Product[];
const cheapest = Math.min(...allProducts.map((p) => p.priceMin));
const variantCount = allProducts.reduce((n, p) => n + p.variants.length, 0);

const steps = [
  { title: "Wybierz model", text: "Fotel, sofa, łóżko albo krzesło. Każdy model ma zdjęcia, wymiary i cenę." },
  { title: "Dobierz tkaninę", text: "Velvet, boucle, wełna, żakard. Kolor nóg też wybierasz Ty, domyślnie buk." },
  { title: "Zadzwoń i zamów", text: `Pod numerem ${site.phone} ustalimy szczegóły. Szyjemy pod Twoje zamówienie.` },
];

export default function Home() {
  return (
    <Layout>
      <SeoHead
        title="SIMAX meble: fotele, sofy i łóżka tapicerowane na zamówienie"
        description={`Producent mebli tapicerowanych z Wielkopolski. Skandynawskie fotele GRANDE, CARMO, ETERNO, sofy boucle i łóżka 160x200 od ${formatPrice(cheapest)}. Tkanina i kolor na zamówienie.`}
        canonical="/"
        image={grande.cover!}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute("/")}#bestsellery`,
            name: "Najchętniej wybierane meble SIMAX",
            itemListElement: picks.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/produkty/${p.slug}/`), name: p.name })),
          },
        ]}
      />

      <section class={styles.hero}>
        <div class={`container ${styles.heroGrid}`}>
          <div class={styles.heroText}>
            <h1>
              Fotele, sofy i łóżka <span class={styles.hl}>szyte dla Ciebie</span>
            </h1>
            <p class="lead">
              Jesteśmy pracownią tapicerską z Wielkopolski. Każdy mebel powstaje na zamówienie: wybierasz model, tkaninę i kolor nóg, a my go szyjemy.
            </p>
            <div class={styles.ctas}>
              <NavLink href="/fotele/" class="btn btn-primary">Zobacz fotele</NavLink>
              <a class="btn btn-ghost" href={`tel:${site.phoneHref}`}>Zadzwoń: {site.phone.replace("+48 ", "")}</a>
            </div>
            <ul class={styles.facts}>
              <li><strong>{allProducts.length}</strong> modeli</li>
              <li><strong>{variantCount}</strong> gotowych wersji</li>
              <li><strong>{allFabrics.length}</strong> kolekcji tkanin</li>
            </ul>
          </div>

          <div class={styles.stage}>
            <fieldset class={styles.picker}>
              <legend>Fotel GRANDE w kolorze:</legend>
              <For each={heroVariants}>
                {(v, i) => (
                  <label style={{ "--sw": variantColour(v) }} title={v.label}>
                    <input type="radio" name="hero-variant" value={String(i())} checked={i() === 0} />
                    <span class="sr-only">{v.label}</span>
                  </label>
                )}
              </For>
            </fieldset>
            <div class={styles.photos}>
              <For each={heroVariants}>
                {(v, i) => (
                  <Picture
                    image={v.images[0]}
                    alt={`Fotel GRANDE, ${v.label.toLowerCase()}`}
                    class={styles.photo}
                    sizes="(min-width: 1000px) 560px, 90vw"
                    priority={i() === 0}
                  />
                )}
              </For>
              <div class={styles.tag}>
                <NavLink href="/produkty/fotel-grande/">
                  <span>Fotel GRANDE</span>
                  <strong>od {formatPrice(grande.priceMin)}</strong>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
        <div class={styles.ribbon} aria-hidden="true">
          <div>
            <For each={[0, 1]}>
              {() => (
                <span>
                  <For each={allProducts}>{(p) => <i>{p.name}</i>}</For>
                </span>
              )}
            </For>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="bestsellery">
        <div class="container">
          <div class="section-head">
            <h2 id="bestsellery">Najchętniej wybierane</h2>
            <p>Modele, o które pytacie najczęściej. Każdy uszyjemy w innej tkaninie niż na zdjęciu.</p>
          </div>
          <div class={styles.products}>
            <For each={picks}>{(p) => <ProductCard product={p} />}</For>
          </div>
          <p class={styles.more}><NavLink href="/produkty/" class="btn btn-ghost">Wszystkie meble i wyszukiwarka</NavLink></p>
        </div>
      </section>

      <section class={`section ${styles.cats}`} aria-labelledby="kategorie">
        <div class="container">
          <div class="section-head">
            <h2 id="kategorie">Czego szukasz?</h2>
          </div>
          <ul class={styles.catGrid}>
            <For each={allCategories.filter((c) => c.products.length)}>
              {(c) => {
                const p = productBySlug(c.products[0])!;
                return (
                  <li class="reveal">
                    <NavLink href={`/${c.slug}/`} class={styles.cat}>
                      <Picture image={p.cover!} alt="" class={styles.catPic} sizes="(min-width: 1000px) 240px, 45vw" />
                      <span class={styles.catName}>{c.name}</span>
                      <span class={styles.catCount}>{c.products.length} {c.products.length === 1 ? "model" : c.products.length < 5 ? "modele" : "modeli"}</span>
                    </NavLink>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </section>

      <section class="section" aria-labelledby="jak-zamowic">
        <div class={`container ${styles.how}`}>
          <div>
            <h2 id="jak-zamowic">Jak zamówić mebel SIMAX</h2>
            <p class="lead">Nie mamy koszyka, mamy telefon i ludzi, którzy znają każdy szew. Zamówienie zajmuje jedną rozmowę.</p>
          </div>
          <ul class={styles.steps}>
            <For each={steps}>
              {(s) => (
                <li class="reveal">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>

      <section class={`section ${styles.fabrics}`} aria-labelledby="tkaniny">
        <div class="container">
          <div class="section-head">
            <h2 id="tkaniny">Tkaniny, w których szyjemy</h2>
            <p>Od velvetu po wełnę z recyklingu. Przy każdej kolekcji podajemy ścieralność, skład i gramaturę.</p>
          </div>
          <ul class={styles.swatches}>
            <For each={allFabrics.slice(0, 8)}>
              {(f) => (
                <li class="reveal">
                  <NavLink href={`/tkaniny/#${f.id}`}>
                    <Picture image={f.image!} alt={`Próbnik tkaniny ${f.name}`} class={styles.swatchPic} sizes="200px" />
                    <span>{f.name}</span>
                    <small>{f.specs.martindale ? `${(f.specs.martindale / 1000).toFixed(0)} tys. cykli` : f.specs.type}</small>
                  </NavLink>
                </li>
              )}
            </For>
          </ul>
          <p class={styles.more}><NavLink href="/tkaniny/" class="btn btn-ghost">Wszystkie tkaniny i parametry</NavLink></p>
        </div>
      </section>

      <section class="section" aria-labelledby="meble-u-was">
        <div class="container">
          <div class="section-head">
            <h2 id="meble-u-was">Meble SIMAX u Was w domu</h2>
            <p>Zdjęcia od klientów, bez studia i bez retuszu.</p>
          </div>
          <CustomerPhotos limit={6} />
        </div>
      </section>

      <section class={styles.call} aria-labelledby="kontakt-skrot">
        <div class={`container ${styles.callInner}`}>
          <div>
            <h2 id="kontakt-skrot">Porozmawiajmy o Twoim fotelu</h2>
            <p>Doradzimy tkaninę, podamy termin i wycenę wersji spoza katalogu. Odbiór osobisty w Łęce Mroczeńskiej albo dostawa pod drzwi.</p>
          </div>
          <div class={styles.callActions}>
            <a class="btn btn-accent" href={`tel:${site.phoneHref}`}>{site.phone}</a>
            <a class="btn btn-ghost" href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
