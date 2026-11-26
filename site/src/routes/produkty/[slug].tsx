import { useParams } from "@solidjs/router";
import { For, Show } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import ProductCard from "~/components/ProductCard";
import CustomerPhotos, { customerPhotos } from "~/components/CustomerPhotos";
import site from "~/data/site.json";
import { basePath } from "~/utils/base";
import {
  allProducts,
  categoryBySlug,
  fabricById,
  formatPrice,
  priceLabel,
  productBySlug,
  TBD,
  variantAlt,
  variantColour,
  variantsLabel,
  type Product,
  type Variant,
} from "~/utils/catalog";
import { fabricLabel, productGraph } from "~/utils/schema";
import styles from "./product.module.css";

// Old shop links are stored with their crawl origin; site.shop says where the shop lives now.
const shopUrl = (url: string) => site.shop.replace(/\/$/, "") + new URL(url).pathname;

const SPEC_ROWS: [key: string, label: string, format?: (v: never) => string][] = [
  ["type", "Rodzaj tkaniny"],
  ["composition", "Skład"],
  ["martindale", "Ścieralność (test Martindale)", (v: number) => `${v.toLocaleString("pl-PL")} cykli`],
  ["weight", "Gramatura", (v: number) => `${v} g/m²`],
  ["width", "Szerokość beli", (v: number) => `${v} cm`],
  ["pilling", "Odporność na mechacenie"],
  ["lightfastness", "Odporność na światło"],
  ["flammability", "Trudnopalność"],
  ["cleaning", "Czyszczenie"],
  ["certificates", "Certyfikaty i atesty", (v: string[]) => v.join(", ")],
];

/** Variant switching works without JS: the checked radio shows its gallery, price and details. */
function variantCss(p: Product) {
  const ids = p.variants.map((v) => v.id);
  const hide = ids.map((id) => `.${styles.product}:has(#v-${id}:checked) [data-v]:not([data-v="${id}"])`).join(",\n");
  const first = ids[0];
  return `@supports selector(:has(*)){${hide}{display:none!important}}
@supports not selector(:has(*)){[data-v]:not([data-v="${first}"]){display:none!important}}`;
}

// Preselect the variant from ?wariant=ID (shared links, offer URLs in JSON-LD) or #wariant-ID
// (legacy redirects), and keep the URL in sync so the current version can be shared.
const variantScript = `(function(){var s=document.currentScript.parentElement,q=new URLSearchParams(location.search).get("wariant")||(location.hash.match(/wariant-(\\d+)/)||[])[1],r=q&&document.getElementById("v-"+q);if(r)r.checked=true;s.addEventListener("change",function(e){var t=e.target;if(t.name!=="wariant")return;var u=new URL(location.href);u.searchParams.set("wariant",t.value);u.hash="";history.replaceState(null,"",u)})})()`;

function Specs(props: { v: Variant }) {
  const fabric = () => fabricById(props.v.fabricId);
  const value = (key: string) => (fabric()?.specs as Record<string, unknown> | undefined)?.[key];
  const missing = () => SPEC_ROWS.filter(([key]) => value(key) == null).map(([, label]) => label);
  return (
    <table class="spec-table">
      <caption class="sr-only">Parametry tkaniny: {fabricLabel(props.v) ?? "do wyboru"}</caption>
      <tbody>
        <tr>
          <th scope="row">Tkanina</th>
          <td>
            <Show when={fabric()} fallback={fabricLabel(props.v) ?? <span>do wyboru z <NavLink href="/tkaniny/">próbnika tkanin</NavLink></span>}>
              <NavLink href={`/tkaniny/#${fabric()!.id}`}>{fabric()!.name}</NavLink>
            </Show>
          </td>
        </tr>
        <For each={SPEC_ROWS.filter(([key]) => value(key) != null)}>
          {([key, label, format]) => (
            <tr>
              <th scope="row">{label}</th>
              <td>{format ? format(value(key) as never) : String(value(key))}</td>
            </tr>
          )}
        </For>
        <Show when={missing().length}>
          <tr class={styles.missing}>
            <th scope="row">{missing().join(", ")}</th>
            <td><span class="tbd">{TBD}</span></td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
}

export default function ProductPage() {
  const params = useParams();
  const product = () => productBySlug(params.slug!);

  return (
    <Show when={product()} fallback={<Layout><div class="container section"><h1>Nie znaleziono produktu</h1></div></Layout>}>
      {(p) => {
        const category = () => categoryBySlug(p().category)!;
        const multi = () => p().variants.length > 1;
        const related = () => allProducts.filter((o) => o.category === p().category && o.slug !== p().slug).slice(0, 3);
        const fill = () => (related().length < 3 ? allProducts.filter((o) => o.category !== p().category && o.slug !== p().slug).slice(0, 3 - related().length) : []);
        const crumbs = () => [
          { name: "Strona główna", href: "/" },
          { name: category().name, href: `/${category().slug}/` },
          { name: p().name },
        ];
        const allegro = (v: Variant) => v.allegroUrl ?? p().allegroUrl;
        // The shop owns this content until it moves here (site.json indexCollection).
        const shopCanonical = () => {
          const old = p().oldUrl ?? p().variants[0].oldUrl;
          return !site.indexCollection && old ? shopUrl(old) : undefined;
        };
        const hasPhotos = () => customerPhotos.some((ph) => ph.product === p().slug);

        return (
          <Layout>
            <SeoHead
              title={p().title}
              description={p().metaDescription}
              canonical={`/produkty/${p().slug}/`}
              canonicalUrl={shopCanonical()}
              image={p().cover!}
              pageType="ItemPage"
              breadcrumbs={crumbs()}
              graph={shopCanonical() ? [] : productGraph(p())}
            />
            <style innerHTML={variantCss(p())} />

            <article class={styles.product}>
              <div class="container">
                <Breadcrumbs items={crumbs()} />
              </div>

              <div class={`container ${styles.top}`}>
                <div class={styles.galleries}>
                  <For each={p().variants}>
                    {(v, vi) => (
                      <div class={styles.gallery} data-v={v.id}>
                        <div class={styles.slides}>
                          <For each={v.images}>
                            {(img, i) => (
                              <figure
                                id={`zdjecie-${img}`}
                                class={styles.slide}
                                data-slide
                                style={i() === 0 ? { "view-transition-name": `p-${p().slug}` } : undefined}
                              >
                                <Picture
                                  image={img}
                                  alt={variantAlt(p(), v, i())}
                                  sizes="(min-width: 1000px) 640px, 94vw"
                                  priority={vi() === 0 && i() === 0}
                                />
                              </figure>
                            )}
                          </For>
                        </div>
                        <Show when={v.images.length > 1}>
                          <ul class={styles.thumbs} aria-label="Zdjęcia">
                            <For each={v.images}>
                              {(img, i) => (
                                <li>
                                  <a href={`${basePath}/produkty/${p().slug}/#zdjecie-${img}`} aria-label={`Zdjęcie ${i() + 1} z ${v.images.length}`}>
                                    <Picture image={img} alt="" sizes="96px" />
                                  </a>
                                </li>
                              )}
                            </For>
                          </ul>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>

                <div class={styles.info}>
                  <h1 class={styles.title}>{p().name}</h1>

                  <div class={styles.priceRow}>
                    <For each={p().variants}>
                      {(v) => (
                        <p class={styles.price} data-v={v.id}>
                          {formatPrice(v.price)}
                          <span>brutto, gotowy projekt z kolekcji{p().priceMin !== p().priceMax ? `. Wersje od ${formatPrice(p().priceMin)} do ${formatPrice(p().priceMax)}` : ""}</span>
                        </p>
                      )}
                    </For>
                  </div>

                  <fieldset class={styles.picker} hidden={!multi()}>
                    <legend>
                      Wersja <span>({variantsLabel(p().variants.length)})</span>
                      <For each={p().variants}>{(v) => <b class={styles.chosen} data-v={v.id}>{v.label}, {formatPrice(v.price)}</b>}</For>
                    </legend>
                    <div class={styles.options}>
                      <For each={p().variants}>
                        {(v, i) => (
                          <label class={styles.option} id={`wariant-${v.id}`} title={`${v.label}, ${formatPrice(v.price)}`}>
                            <input type="radio" name="wariant" id={`v-${v.id}`} value={String(v.id)} checked={i() === 0} />
                            <span class={styles.swatch} style={{ "--sw": variantColour(v) }}>
                              <Picture image={v.images[0]} alt="" sizes="64px" />
                            </span>
                            <span class="sr-only">{v.label}, {formatPrice(v.price)}</span>
                          </label>
                        )}
                      </For>
                    </div>
                    <script innerHTML={variantScript} />
                  </fieldset>

                  <For each={p().variants}>
                    {(v) => (
                      <div class={styles.order} data-v={v.id}>
                        <div class={styles.ctas}>
                          <Show when={v.oldUrl}>
                            <a class="btn btn-primary" href={shopUrl(v.oldUrl!)} rel="noopener">Kup w sklepie SIMAX</a>
                          </Show>
                          <a class="btn btn-ghost" href={`tel:${site.phoneHref}`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" /></svg>
                            {site.phone.replace("+48 ", "")}
                          </a>
                          <Show when={allegro(v)}>
                            <a class="btn btn-ghost" href={allegro(v)!} rel="noopener nofollow" target="_blank">Kup na Allegro</a>
                          </Show>
                        </div>
                        <dl class={styles.facts}>
                          <Show when={multi()}><div><dt>Wybrana wersja</dt><dd>{v.label}</dd></div></Show>
                          <Show when={v.base}><div><dt>Podstawa</dt><dd>{v.base}</dd></div></Show>
                          <div><dt>Tkanina</dt><dd>{fabricLabel(v) ?? "do wyboru"}</dd></div>
                          <div><dt>Kod</dt><dd>{v.sku}</dd></div>
                        </dl>
                      </div>
                    )}
                  </For>

                  <p class={styles.lead}>{p().lead}</p>

                  <ul class={styles.trust}>
                    <li>Szyty ręcznie w Polsce, w naszej pracowni</li>
                    <li>Projekt i konstrukcja już sprawdzone, dlatego taniej niż od zera</li>
                    <li>Dostawa pod drzwi albo odbiór osobisty</li>
                  </ul>

                  <aside class={styles.custom} aria-labelledby="po-twojemu">
                    <h2 id="po-twojemu">{p().name} po Twojemu</h2>
                    <Show
                      when={p().category === "lozka"}
                      fallback={
                        <>
                          <p>Twoja tkanina, kolor i wzór, inne przeszycia, nogi spośród naszych wzorów, twardsze albo miększe siedzisko. Ten model może być bazą Twojego mebla na zamówienie.</p>
                          <NavLink href={`/na-zamowienie/?model=${p().slug}`} class="btn btn-accent">Zamów w swojej tkaninie i kolorze</NavLink>
                        </>
                      }
                    >
                      <p>Inny rozmiar materaca, wyższe wezgłowie, Twoja tkanina, inne nogi. Ten model może być punktem wyjścia do łóżka na wymiar.</p>
                      <NavLink href="/lozko-na-zamowienie/" class="btn btn-accent">Skonfiguruj łóżko na wymiar</NavLink>
                    </Show>
                  </aside>
                </div>
              </div>

              <div class={`container ${styles.details}`}>
                <section class={styles.block} aria-labelledby="opis">
                  <h2 id="opis">Opis</h2>
                  <div class="prose" innerHTML={p().descriptionHtml} />
                </section>

                <aside class={styles.side}>
                  <Show when={p().dimensions.length}>
                    <section class={styles.card} aria-labelledby="wymiary">
                      <h2 id="wymiary">Wymiary</h2>
                      <For each={p().variants}>
                        {(v) => (
                          <table class="spec-table" data-v={v.id}>
                            <caption class="sr-only">Wymiary: {v.label}</caption>
                            <tbody>
                              <For each={v.dimensions}>{(d) => <tr><th scope="row">{d.name}</th><td>{d.value}</td></tr>}</For>
                            </tbody>
                          </table>
                        )}
                      </For>
                    </section>
                  </Show>

                  <section class={styles.card} aria-labelledby="tkanina">
                    <h2 id="tkanina">Tkanina</h2>
                    <For each={p().variants}>{(v) => <div data-v={v.id}><Specs v={v} /></div>}</For>
                    <p class={styles.note}>Parametry oznaczone „{TBD}” uzupełnimy po potwierdzeniu u dostawcy tkanin.</p>
                  </section>
                </aside>
              </div>

              <Show when={multi()}>
                <section class={`container ${styles.block}`} aria-labelledby="wersje">
                  <h2 id="wersje">Wszystkie wersje: {p().name}</h2>
                  <div class={styles.tableWrap}>
                    <table class={styles.versions}>
                      <thead>
                        <tr><th scope="col">Wersja</th><th scope="col">Kolor</th><th scope="col">Podstawa</th><th scope="col">Tkanina</th><th scope="col">Cena</th></tr>
                      </thead>
                      <tbody>
                        <For each={p().variants}>
                          {(v) => (
                            <tr>
                              <th scope="row"><a href={`${basePath}/produkty/${p().slug}/?wariant=${v.id}`}>{v.label}</a></th>
                              <td>{v.colour ? <><i style={{ background: variantColour(v) }} />{v.colour}</> : "do wyboru"}</td>
                              <td>{v.base ?? "-"}</td>
                              <td>{fabricLabel(v) ?? "do wyboru"}</td>
                              <td>{formatPrice(v.price)}</td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </section>
              </Show>

              <Show when={hasPhotos()}>
                <section class={`container ${styles.block}`} aria-labelledby="u-klientow">
                  <h2 id="u-klientow">{p().name} u klientów</h2>
                  <CustomerPhotos product={p().slug} />
                </section>
              </Show>

              <section class={`container ${styles.block}`} aria-labelledby="podobne">
                <h2 id="podobne">Zobacz też</h2>
                <div class={styles.related}>
                  <For each={[...related(), ...fill()]}>{(o) => <ProductCard product={o} />}</For>
                </div>
                <p class={styles.priceNote}>
                  {p().name}: {priceLabel(p())}. Ceny brutto w PLN. Gotowe projekty kupisz w sklepie SIMAX albo telefonicznie. Wersje zmienione pod Ciebie wyceniamy osobno.
                </p>
              </section>
            </article>
          </Layout>
        );
      }}
    </Show>
  );
}
