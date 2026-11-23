import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import site from "~/data/site.json";
import styles from "./simple.module.css";
import k from "./kontakt.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Kontakt" }];

export default function Contact() {
  return (
    <Layout>
      <SeoHead
        title="Kontakt: SIMAX meble, Łęka Mroczeńska 12, tel. 880 503 442"
        description={`Zamów fotel lub sofę SIMAX telefonicznie: ${site.phone}, e-mail ${site.email}. Pracownia i odbiór osobisty: Łęka Mroczeńska 12, ${site.address.postalCode} ${site.address.city} (wielkopolskie).`}
        canonical="/kontakt/"
        pageType="ContactPage"
        breadcrumbs={crumbs}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Kontakt i dojazd</h1>
          <p class="lead">Najszybciej telefonicznie. Doradzimy model i tkaninę, podamy termin i przyjmiemy zamówienie.</p>
        </header>
        <div class={styles.split}>
          <div class={styles.list}>
            <section class={`${styles.panel} ${k.phone}`} aria-labelledby="telefon">
              <h2 id="telefon">Telefon</h2>
              <a class={styles.big} href={`tel:${site.phoneHref}`}>{site.phone}</a>
              <p>Zamówienia, wyceny wersji spoza katalogu, próbki tkanin.</p>
            </section>
            <section class={styles.panel} aria-labelledby="email">
              <h2 id="email">E-mail</h2>
              <a class={k.mail} href={`mailto:${site.email}`}>{site.email}</a>
              <p>Wyślij zdjęcie wnętrza albo mebla, który chcesz obić, odpiszemy z propozycją.</p>
            </section>
          </div>
          <section class={styles.panel} aria-labelledby="adres">
            <h2 id="adres">Pracownia i odbiór osobisty</h2>
            <address class={k.address}>
              <strong>{site.legalName}</strong><br />
              {site.address.street}<br />
              {site.address.postalCode} {site.address.city}<br />
              woj. {site.address.region}
            </address>
            <a class={k.map} href={site.maps.place} target="_blank" rel="noopener" aria-label="Otwórz lokalizację SIMAX w Mapach Google">
              <span class={k.pin} aria-hidden="true" />
              <span class={k.mapLabel}>Łęka Mroczeńska<small>{site.geo.lat.toFixed(5)}° N, {site.geo.lng.toFixed(5)}° E</small></span>
            </a>
            <p class={styles.ctas}>
              <a class="btn btn-primary" href={site.maps.directions} target="_blank" rel="noopener">Wyznacz trasę</a>
              <a class="btn btn-ghost" href={site.maps.place} target="_blank" rel="noopener">Wizytówka Google</a>
            </p>
            <p>Przy odbiorze osobistym zapytaj o rabat, oszczędzasz nam kosztów transportu. Szczegóły w <NavLink href="/dostawa-i-zwroty/">zasadach dostawy</NavLink>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
