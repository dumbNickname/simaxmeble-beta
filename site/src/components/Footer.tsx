import { For } from "solid-js";
import NavLink from "./NavLink";
import site from "~/data/site.json";
import { allCategories } from "~/utils/catalog";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer class={styles.footer}>
      <div class={`container ${styles.grid}`}>
        <div class={styles.about}>
          <p class={styles.brand}>SIMAX meble</p>
          <p>Szyjemy fotele, sofy i łóżka tapicerowane na zamówienie, w Łęce Mroczeńskiej pod Kępnem.</p>
          <a class={styles.bigPhone} href={`tel:${site.phoneHref}`}>{site.phone}</a>
        </div>
        <nav aria-label="Kategorie">
          <p class={styles.heading}>Meble</p>
          <ul>
            <For each={allCategories.filter((c) => c.products.length)}>{(c) => <li><NavLink href={`/${c.slug}/`}>{c.name}</NavLink></li>}</For>
            <li><NavLink href="/produkty/">Wszystkie produkty</NavLink></li>
          </ul>
        </nav>
        <nav aria-label="Informacje">
          <p class={styles.heading}>Informacje</p>
          <ul>
            <li><NavLink href="/tkaniny/">Tkaniny obiciowe</NavLink></li>
            <li><NavLink href="/dostawa-i-zwroty/">Dostawa i reklamacje</NavLink></li>
            <li><NavLink href="/meble-u-was/">Meble u Was</NavLink></li>
            <li><NavLink href="/o-nas/">O nas</NavLink></li>
            <li><NavLink href="/kontakt/">Kontakt</NavLink></li>
          </ul>
        </nav>
        <address class={styles.address}>
          <p class={styles.heading}>Pracownia</p>
          <p>{site.legalName}<br />{site.address.street}<br />{site.address.postalCode} {site.address.city}</p>
          <p><a href={`mailto:${site.email}`}>{site.email}</a></p>
          <p><a href={site.maps.place} rel="noopener" target="_blank">Zobacz w Mapach Google</a></p>
        </address>
      </div>
      <div class={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} {site.legalName}. Ceny brutto w PLN.</p>
        <p><a href={site.shop} rel="noopener">Sklep internetowy SIMAX</a></p>
      </div>
    </footer>
  );
}
