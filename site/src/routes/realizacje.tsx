import { For, Show } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import data from "~/data/projects.json";
import site from "~/data/site.json";
import { basePath } from "~/utils/base";
import { productBySlug } from "~/utils/catalog";
import styles from "./custom.module.css";

interface Stage {
  text: string;
  image?: string;
}

interface Project {
  slug: string;
  title: string;
  client: "dom" | "firma";
  place?: string;
  date?: string;
  summary: string;
  idea: Stage;
  project: Stage;
  result: { text: string; images: string[] };
  collection?: string;
}

const projects = data.projects as unknown as Project[];
const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Realizacje" }];
const photo = (file: string) => `${basePath}/img/realizacje/${file}`;

export default function Projects() {
  return (
    <Layout>
      <SeoHead
        title="Realizacje: meble tapicerowane na zamówienie od pomysłu do efektu | SIMAX"
        description="Meble tapicerowane, które uszyliśmy na zamówienie: pomysł klienta, rysunek z wymiarami i gotowy mebel. Fotele, sofy i siedziska dla domów i firm."
        canonical="/realizacje/"
        breadcrumbs={crumbs}
        pageType="CollectionPage"
        noindex={projects.length === 0}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Realizacje na zamówienie</h1>
          <p class="lead">Każda historia w trzech krokach: z czym klient przyszedł, co narysowaliśmy i co z tego wyszło.</p>
        </header>

        <Show
          when={projects.length}
          fallback={
            <div class={styles.panel}>
              <h2 class={styles.small}>Pierwsze historie zbieramy</h2>
              <p>
                Publikujemy tylko realizacje, na które klient się zgodził. Jeśli mamy już Twój mebel i chcesz go tu pokazać, napisz na <a href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
              <NavLink href="/na-zamowienie/" class="btn btn-primary">Jak powstaje mebel na zamówienie</NavLink>
            </div>
          }
        >
          <For each={projects}>
            {(p) => (
              <article class={styles.story} id={p.slug}>
                <header>
                  <h2>{p.title}</h2>
                  <p class={styles.muted}>{[p.client === "firma" ? "Dla firmy" : "Do domu", p.place, p.date].filter(Boolean).join(", ")}</p>
                  <p>{p.summary}</p>
                </header>
                <ol class={styles.storySteps}>
                  <li>
                    <h3>Pomysł</h3>
                    <Show when={p.idea.image}><img src={photo(p.idea.image!)} alt={`Pomysł: ${p.title}`} loading="lazy" /></Show>
                    <p>{p.idea.text}</p>
                  </li>
                  <li>
                    <h3>Projekt</h3>
                    <Show when={p.project.image}><img src={photo(p.project.image!)} alt={`Projekt: ${p.title}`} loading="lazy" /></Show>
                    <p>{p.project.text}</p>
                  </li>
                  <li>
                    <h3>Efekt</h3>
                    <For each={p.result.images}>{(img) => <img src={photo(img)} alt={`Gotowy mebel: ${p.title}`} loading="lazy" />}</For>
                    <p>{p.result.text}</p>
                    <Show when={p.collection && productBySlug(p.collection)}>
                      <p>Dziś w kolekcji: <NavLink href={`/produkty/${p.collection}/`}>{productBySlug(p.collection!)!.name}</NavLink></p>
                    </Show>
                  </li>
                </ol>
              </article>
            )}
          </For>
        </Show>
      </div>
    </Layout>
  );
}
