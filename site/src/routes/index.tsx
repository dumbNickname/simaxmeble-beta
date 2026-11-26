import { For, Show } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import ProductCard from "~/components/ProductCard";
import CustomerPhotos from "~/components/CustomerPhotos";
import IdeaStage from "~/components/IdeaStage";
import Process from "~/components/Process";
import bestsellers from "~/data/bestsellers.json";
import custom from "~/data/custom.json";
import site from "~/data/site.json";
import customerPhotos from "~/data/customer-photos.json";
import projects from "~/data/projects.json";
import { allCategories, allFabrics, allProducts, productBySlug, formatPrice, type Product } from "~/utils/catalog";
import styles from "./index.module.css";

const grande = productBySlug("fotel-grande")!;
// The hero sketch is traced from this packshot (fotel-grande-50).
const heroVariant = grande.variants.find((v) => v.id === 12)!;
const picks = bestsellers.products.map((slug) => productBySlug(slug)).filter(Boolean) as Product[];
const cheapest = Math.min(...allProducts.map((p) => p.priceMin));

export default function Home() {
  return (
    <Layout>
      <SeoHead
        title="Meble tapicerowane na zamówienie: od pomysłu do gotowego mebla | SIMAX"
        description="Pracownia SIMAX z Wielkopolski szyje fotele, sofy i łóżka tapicerowane na zamówienie: sprawdzony model, Twoja tkanina, kolor, przeszycia i nogi, doradztwo przy wyborze pianki. Także serie dla restauracji i hoteli."
        canonical="/"
        image={heroVariant.images[0]}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute("/")}#gotowe-projekty`,
            name: "Gotowe projekty SIMAX",
            itemListElement: picks.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/produkty/${p.slug}/`), name: p.name })),
          },
        ]}
      />

      <section class={styles.hero}>
        <div class={`container ${styles.heroGrid}`}>
          <div class={styles.heroText}>
            <h1>
              Meble tapicerowane <span class={styles.hl}>na zamówienie</span>
            </h1>
            <p class="lead">
              Wybierz sprawdzony model, a tkaninę, kolor, wzór, przeszycia i nogi dobierz z nami. Doradzimy piankę i materiały, a mebel uszyjemy w naszej pracowni w Wielkopolsce. Od pomysłu do fotela, który stanie u Ciebie.
            </p>
            <div class={styles.ctas}>
              <NavLink href="/na-zamowienie/#brief" class="btn btn-primary">Opisz swój pomysł</NavLink>
              <NavLink href="/na-zamowienie/" class="btn btn-ghost">Jak to działa</NavLink>
            </div>
            <p class={styles.heroNote}>
              Dla firm: <NavLink href="/dla-firm/">restauracje, hotele, biura</NavLink>. Wolisz gotowy model? <a href={site.shop} rel="noopener">Sklep SIMAX</a>.
            </p>
          </div>
          <IdeaStage product={grande} variant={heroVariant} />
        </div>
      </section>

      <section class="section" aria-labelledby="jak-powstaje">
        <div class="container">
          <div class="section-head">
            <h2 id="jak-powstaje">Jak powstaje mebel na zamówienie</h2>
            <p>Bez katalogu i bez koszyka. Zaczynamy od rozmowy o tym, czego potrzebujesz.</p>
          </div>
          <Process />
          <p class={styles.more}><NavLink href="/na-zamowienie/" class="btn btn-ghost">Szczegóły, wycena i pytania</NavLink></p>
        </div>
      </section>

      <section class={`section ${styles.options}`} aria-labelledby="co-zmienic">
        <div class="container">
          <div class="section-head">
            <h2 id="co-zmienic">Co możesz zmienić</h2>
            <p>{custom.optionsLead}</p>
          </div>
          <ul class={styles.optionList}>
            <For each={custom.options}>
              {(o) => (
                <li class="reveal">
                  <h3>{o.name}</h3>
                  <p>{o.text.replace("{fabrics}", String(allFabrics.length))}</p>
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>

      <section class="section" aria-labelledby="gotowe-projekty">
        <div class="container">
          <div class="section-head">
            <h2 id="gotowe-projekty">Gotowe projekty</h2>
            <p>
              Modele, które już zaprojektowaliśmy i szyjemy seryjnie. Konstrukcja jest sprawdzona, więc są tańsze i szybsze niż mebel od zera: od {formatPrice(cheapest)} w sklepie SIMAX. Każdy może też być punktem wyjścia do Twojego projektu.
            </p>
          </div>
          <div class={styles.products}>
            <For each={picks}>{(p) => <ProductCard product={p} />}</For>
          </div>
          <nav class={styles.chips} aria-label="Gotowe projekty według rodzaju">
            <For each={allCategories.filter((c) => c.products.length)}>
              {(c) => <NavLink href={`/${c.slug}/`}>{c.name}</NavLink>}
            </For>
            <NavLink href="/produkty/">Cała kolekcja</NavLink>
          </nav>
        </div>
      </section>

      <section class={styles.b2b} aria-labelledby="dla-firm">
        <div class={`container ${styles.b2bGrid}`}>
          <div class={styles.b2bPhoto}>
            <Picture image="o-nas-2" alt="Turkusowe fotele i sofa tapicerowana w kawiarni" sizes="(min-width: 960px) 520px, 92vw" />
          </div>
          <div>
            <h2 id="dla-firm">Meble dla restauracji, hoteli i biur</h2>
            <p>Ławy pod ścianę, krzesła do sali, fotele do pokoi, wezgłowia, sofy do lobby. Szyjemy serie według projektu, w tkaninach do intensywnego użytku.</p>
            <ul class={styles.b2bList}>
              <For each={custom.b2b.sectors}>{(s) => <li>{s.name}</li>}</For>
            </ul>
            <NavLink href="/dla-firm/" class="btn btn-accent">Współpraca dla firm</NavLink>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="realizacje">
        <div class={`container ${styles.work}`}>
          <div>
            <h2 id="realizacje">Realizacje</h2>
            <p>
              <Show
                when={projects.projects.length}
                fallback="Zbieramy historie mebli szytych na zamówienie: z czym klient przyszedł, jak wyglądał projekt i co z tego wyszło. Pokazujemy tylko te, na które klient się zgodził. Zdjęcia z pracowni są już na Instagramie."
              >
                Historie mebli szytych na zamówienie: z czym klient przyszedł, jak wyglądał projekt i co z tego wyszło.
              </Show>
            </p>
          </div>
          <div class={styles.callActions}>
            <NavLink href="/realizacje/" class="btn btn-primary">Zobacz realizacje</NavLink>
            <a class="btn btn-ghost" href={site.instagram} target="_blank" rel="noopener">Instagram @simaxmeble.pl</a>
          </div>
        </div>
      </section>

      <section class={`section ${styles.fabrics}`} aria-labelledby="tkaniny">
        <div class="container">
          <div class="section-head">
            <h2 id="tkaniny">Tkaniny do Twojego projektu</h2>
            <p>Od velvetu po wełnę. Przy każdej kolekcji podajemy ścieralność, skład i gramaturę, a próbki wysyłamy do paczkomatu.</p>
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

      <Show when={customerPhotos.photos.length}>
      <section class="section" aria-labelledby="meble-u-was">
        <div class="container">
          <div class="section-head">
            <h2 id="meble-u-was">Meble SIMAX u Was w domu</h2>
            <p>Zdjęcia od klientów, bez studia i bez retuszu.</p>
          </div>
          <CustomerPhotos limit={6} />
        </div>
      </section>
      </Show>

      <section class={styles.call} aria-labelledby="kontakt-skrot">
        <div class={`container ${styles.callInner}`}>
          <div>
            <h2 id="kontakt-skrot">Masz pomysł? Opowiedz nam o nim</h2>
            <p>Kilka zdań i zdjęcie wystarczą na początek. Oddzwonimy z pytaniami, razem dopracujemy projekt, a potem podamy wycenę.</p>
          </div>
          <div class={styles.callActions}>
            <NavLink href="/na-zamowienie/#brief" class="btn btn-accent">Opisz pomysł</NavLink>
            <a class="btn btn-ghost" href={`tel:${site.phoneHref}`}>{site.phone}</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
