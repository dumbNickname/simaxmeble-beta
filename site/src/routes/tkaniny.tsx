import { For, Show } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute, absoluteImage } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import cms from "~/data/cms.json";
import site from "~/data/site.json";
import { allFabrics, allProducts, TBD, type Fabric } from "~/utils/catalog";
import styles from "./tkaniny.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Tkaniny obiciowe" }];
const GROUPS: [string, string][] = [
  ["podstawowe", "Tkaniny podstawowe"],
  ["premium", "Tkaniny premium"],
  ["żakardowe", "Tkaniny żakardowe"],
];

const ROWS: [key: keyof Fabric["specs"], label: string, format?: (v: never) => string][] = [
  ["type", "Rodzaj"],
  ["composition", "Skład"],
  ["martindale", "Ścieralność (Martindale)", (v: number) => `${v.toLocaleString("pl-PL")} cykli`],
  ["weight", "Gramatura", (v: number) => `${v} g/m²`],
  ["width", "Szerokość beli", (v: number) => `${v} cm`],
  ["pilling", "Mechacenie"],
  ["lightfastness", "Odporność na światło"],
  ["flammability", "Trudnopalność"],
  ["cleaning", "Czyszczenie"],
  ["certificates", "Certyfikaty", (v: string[]) => v.join(", ")],
];

const usedIn = (f: Fabric) => allProducts.filter((p) => p.variants.some((v) => v.fabricId === f.id));
// Bar length: 100 000 cycles fills it; furniture for daily use starts around 25 000.
const wear = (f: Fabric) => Math.min(100, Math.round(((f.specs.martindale ?? 0) / 115000) * 100));
const woodHtml = (cms as Record<string, { html: string }>)["12-wybarwienia-drewna"].html.replace(/^<h3>[^<]*<\/h3>/, "");

export default function Fabrics() {
  return (
    <Layout>
      <SeoHead
        title="Tkaniny obiciowe: velvet, boucle, wełna, żakard | SIMAX"
        description="Tkaniny do foteli i sof SIMAX: Bluvel, French Velvet, Touch Me, Feel Me boucle, Dama wełna i inne. Ścieralność w cyklach Martindale, skład, gramatura i wybarwienia drewna buk."
        canonical="/tkaniny/"
        image={allFabrics[0].image!}
        pageType="CollectionPage"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "ItemList",
            "@id": `${absolute("/tkaniny/")}#lista`,
            name: "Tkaniny obiciowe SIMAX",
            itemListElement: allFabrics.map((f, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Thing",
                "@id": `${absolute("/tkaniny/")}#${f.id}`,
                name: `Tkanina ${f.name}`,
                description: f.description,
                ...(f.image ? { image: absoluteImage(f.image) } : {}),
              },
            })),
          },
        ]}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Tkaniny obiciowe do foteli i sof</h1>
          <p class="lead">
            Każdy mebel SIMAX uszyjemy w tkaninie z poniższych kolekcji. Przy każdej podajemy parametry. Tam, gdzie widzisz „{TBD}”, dane jeszcze uzupełniamy. Próbki wysyłamy do paczkomatu, wystarczy zadzwonić.
          </p>
          <nav class={styles.jump} aria-label="Spis tkanin">
            <For each={allFabrics}>{(f) => <NavLink href={`/tkaniny/#${f.id}`}>{f.name}</NavLink>}</For>
            <NavLink href="/tkaniny/#wybarwienia-drewna">Wybarwienia drewna</NavLink>
          </nav>
        </header>

        <For each={GROUPS}>
          {([group, label]) => (
            <section class={styles.group} aria-labelledby={`grupa-${group}`}>
              <h2 id={`grupa-${group}`}>{label}</h2>
              <div class={styles.list}>
                <For each={allFabrics.filter((f) => f.group === group)}>
                  {(f) => (
                    <article id={f.id} class={`${styles.fabric} reveal`}>
                      <div class={styles.swatch}>
                        <Show when={f.image}>
                          <Picture image={f.image!} alt={`Próbnik kolorów tkaniny ${f.name}`} sizes="(min-width: 900px) 420px, 92vw" />
                        </Show>
                      </div>
                      <div class={styles.body}>
                        <h3>{f.name}</h3>
                        <Show when={f.specs.martindale}>
                          <div class={styles.wear} style={{ "--w": `${wear(f)}%` }}>
                            <span>Ścieralność</span>
                            <strong>{(f.specs.martindale! / 1000).toFixed(0)} tys. cykli</strong>
                          </div>
                        </Show>
                        <p>{f.description}</p>
                        <table class="spec-table">
                          <caption class="sr-only">Parametry tkaniny {f.name}</caption>
                          <tbody>
                            <For each={ROWS}>
                              {([key, rowLabel, format]) => {
                                const value = f.specs[key];
                                return (
                                  <tr>
                                    <th scope="row">{rowLabel}</th>
                                    <td>{value == null ? <span class="tbd">{TBD}</span> : format ? format(value as never) : String(value)}</td>
                                  </tr>
                                );
                              }}
                            </For>
                          </tbody>
                        </table>
                        <Show when={usedIn(f).length}>
                          <p class={styles.used}>
                            Na zdjęciach w:{" "}
                            <For each={usedIn(f)}>{(p, i) => <>{i() ? ", " : ""}<NavLink href={`/produkty/${p.slug}/`}>{p.name}</NavLink></>}</For>
                          </p>
                        </Show>
                      </div>
                    </article>
                  )}
                </For>
              </div>
            </section>
          )}
        </For>

        <section id="wybarwienia-drewna" class={styles.wood} aria-labelledby="wybarwienia-h">
          <div>
            <h2 id="wybarwienia-h">Wybarwienia drewna</h2>
            <div class="prose" innerHTML={woodHtml} />
          </div>
          <Picture image="wybarwienia-1" alt="Próbki wybarwień drewna bukowego do nóg mebli SIMAX" sizes="(min-width: 900px) 560px, 92vw" />
        </section>

        <section class={styles.samples} aria-labelledby="probki">
          <h2 id="probki">Chcesz dotknąć tkaniny przed zamówieniem?</h2>
          <p>Wyślemy próbki do najbliższego paczkomatu. Zadzwoń albo napisz, jakie kolory Cię interesują.</p>
          <div class={styles.ctas}>
            <a class="btn btn-primary" href={`tel:${site.phoneHref}`}>{site.phone}</a>
            <a class="btn btn-ghost" href={`mailto:${site.email}?subject=${encodeURIComponent("Próbki tkanin")}`}>Zamów próbki mailem</a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
