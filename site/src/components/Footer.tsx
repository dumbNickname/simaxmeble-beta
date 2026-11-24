import { For } from "solid-js";
import NavLink from "./NavLink";
import site from "~/data/site.json";
import projects from "~/data/projects.json";
import { allCategories } from "~/utils/catalog";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer class={styles.footer}>
      <div class={`container ${styles.grid}`}>
        <div class={styles.about}>
          <p class={styles.brand}>SIMAX meble</p>
          <p>Pracownia mebli tapicerowanych na zamówienie w Łęce Mroczeńskiej pod Kępnem. Od pomysłu i projektu do gotowego mebla, dla domów i firm.</p>
          <a class={styles.bigPhone} href={`tel:${site.phoneHref}`}>{site.phone}</a>
        </div>
        <nav aria-label="Na zamówienie">
          <p class={styles.heading}>Na zamówienie</p>
          <ul>
            <li><NavLink href="/na-zamowienie/">Jak powstaje mebel na zamówienie</NavLink></li>
            <li><NavLink href="/dla-firm/">Meble dla firm i HoReCa</NavLink></li>
            {projects.projects.length > 0 && <li><NavLink href="/realizacje/">Realizacje</NavLink></li>}
            <For each={allCategories.filter((c) => c.products.length)}>{(c) => <li><NavLink href={`/${c.slug}/`}>{c.heading}</NavLink></li>}</For>
          </ul>
        </nav>
        <nav aria-label="Informacje">
          <p class={styles.heading}>Informacje</p>
          <ul>
            <li><NavLink href="/produkty/">Kolekcja gotowych projektów</NavLink></li>
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
        <p><a href={site.shop} rel="noopener">Gotowe meble kupisz w sklepie SIMAX</a></p>
      </div>
    </footer>
  );
}
