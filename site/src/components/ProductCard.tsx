import { For, Show } from "solid-js";
import NavLink from "./NavLink";
import Picture from "./Picture";
import { categoryName, priceLabel, variantColour, variantsLabel, variantAlt, type Product } from "~/utils/catalog";
import styles from "./ProductCard.module.css";

interface Props {
  product: Product;
  /** Heading level inside the card (h2 on listing pages, h3 under a section heading). */
  level?: 2 | 3;
  priority?: boolean;
}

export default function ProductCard(props: Props) {
  const p = () => props.product;
  const v0 = () => p().variants[0];
  const second = () => v0().images[1] ?? p().variants[1]?.images[0];
  const Heading = (hp: { children: string }) => (props.level === 2 ? <h2 class={styles.name}>{hp.children}</h2> : <h3 class={styles.name}>{hp.children}</h3>);
  const search = () => [p().name, categoryName(p().category), ...p().variants.map((v) => `${v.label} ${v.fullName} ${v.fabricName ?? ""}`)].join(" ").toLowerCase();

  return (
    <article class={`${styles.card} reveal`} data-search={search()} data-category={p().category}>
      <NavLink href={`/produkty/${p().slug}/`} class={styles.link}>
        <div class={styles.media} data-vt={p().slug}>
          <Picture image={p().cover!} alt={variantAlt(p(), v0(), 0)} class={styles.pic} imgClass={styles.img} priority={props.priority} />
          <Show when={second()}>
            <Picture image={second()!} alt="" class={`${styles.pic} ${styles.alt}`} imgClass={styles.img} deferred />
          </Show>
          <span class={styles.price}>{priceLabel(p())}</span>
        </div>
        <div class={styles.body}>
          <Heading>{p().name}</Heading>
          <div class={styles.meta}>
            <ul class={styles.dots} aria-label={`Dostępne wersje: ${p().variants.map((v) => v.label).join(", ")}`}>
              <For each={p().variants.slice(0, 7)}>{(v) => <li style={{ background: variantColour(v) }} />}</For>
            </ul>
            <span>{variantsLabel(p().variants.length)}</span>
          </div>
        </div>
      </NavLink>
    </article>
  );
}
