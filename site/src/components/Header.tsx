import { For } from "solid-js";
import NavLink from "./NavLink";
import site from "~/data/site.json";
import { allCategories } from "~/utils/catalog";
import styles from "./Header.module.css";

const links = [
  // Short labels keep the bar to one line; full names are in the footer and the H1s.
  ...allCategories.filter((c) => c.products.length).map((c) => ({ href: `/${c.slug}/`, label: c.name.split(" ")[0] })),
  { href: "/tkaniny/", label: "Tkaniny" },
  { href: "/kontakt/", label: "Kontakt" },
];

export default function Header() {
  return (
    <header class={styles.header}>
      <div class={`container ${styles.bar}`}>
        <NavLink href="/" class={styles.brand} aria-label="SIMAX meble, strona główna">
          <span class={styles.mark} aria-hidden="true">S</span>
          <span class={styles.word}>SIMAX<span>meble</span></span>
          <span class={styles.logo} aria-hidden="true" />
        </NavLink>
        <details class={styles.menu}>
          <summary class={styles.toggle}>
            <span class={styles.burger} aria-hidden="true" />
            <span>Menu</span>
          </summary>
          <nav class={styles.nav} aria-label="Główna nawigacja">
            <ul>
              <For each={links}>{(l) => <li><NavLink href={l.href}>{l.label}</NavLink></li>}</For>
            </ul>
          </nav>
        </details>
        <div class={styles.actions}>
          <NavLink href="/produkty/" class={styles.search} aria-label="Szukaj mebli">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" /><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
            <span>Szukaj</span>
          </NavLink>
          <a class={styles.phone} href={`tel:${site.phoneHref}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" /></svg>
            <span>{site.phone.replace("+48 ", "")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
