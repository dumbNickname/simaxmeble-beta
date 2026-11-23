import { For, Show } from "solid-js";
import NavLink from "./NavLink";
import data from "~/data/customer-photos.json";
import site from "~/data/site.json";
import { basePath } from "~/utils/base";
import { productBySlug } from "~/utils/catalog";
import styles from "./CustomerPhotos.module.css";

export interface CustomerPhoto {
  file: string;
  product?: string;
  author?: string;
  caption?: string;
  date?: string;
  width?: number;
  height?: number;
}

export const customerPhotos = (data.photos ?? []) as CustomerPhoto[];

/** Photos sent by customers (static list in customer-photos.json), or an invitation while empty. */
export default function CustomerPhotos(props: { limit?: number; product?: string }) {
  const photos = () => customerPhotos.filter((p) => !props.product || p.product === props.product).slice(0, props.limit ?? 99);
  const subject = encodeURIComponent("Zdjęcie mebla SIMAX u mnie w domu");

  return (
    <div class={styles.wrap}>
      <Show when={photos().length}>
        <ul class={styles.grid}>
          <For each={photos()}>
            {(ph) => {
              const product = ph.product ? productBySlug(ph.product) : undefined;
              return (
                <li class={`${styles.item} reveal`}>
                  <figure>
                    <img src={`${basePath}/img/klienci/${ph.file}`} alt={ph.caption || (product ? `${product.name} u klienta` : "Mebel SIMAX u klienta")} width={ph.width} height={ph.height} loading="lazy" />
                    <figcaption>
                      <Show when={ph.caption}><span>{ph.caption}</span></Show>
                      <Show when={ph.author}><span class={styles.author}>{ph.author}</span></Show>
                      <Show when={product}><NavLink href={`/produkty/${product!.slug}/`}>{product!.name}</NavLink></Show>
                    </figcaption>
                  </figure>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
      <div class={`${styles.invite} reveal`}>
        <div class={styles.frames} aria-hidden="true">
          <span /><span /><span />
        </div>
        <div>
          <h3>{photos().length ? "Pochwal się swoim meblem" : "Tu pojawią się Wasze zdjęcia"}</h3>
          <p>Masz fotel albo sofę od nas? Wyślij nam zdjęcie z domu. Za zgodą pokażemy je tutaj, z imieniem i miastem albo anonimowo.</p>
          <a class="btn btn-primary" href={`mailto:${site.email}?subject=${subject}`}>Wyślij zdjęcie</a>
        </div>
      </div>
    </div>
  );
}
