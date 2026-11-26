import { For } from "solid-js";
import Layout from "~/components/Layout";
import SeoHead, { absolute } from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import NavLink from "~/components/NavLink";
import Picture from "~/components/Picture";
import Process from "~/components/Process";
import BriefForm from "~/components/BriefForm";
import custom from "~/data/custom.json";
import site from "~/data/site.json";
import { allFabrics, allProducts, formatPrice } from "~/utils/catalog";
import styles from "./custom.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Meble na zamówienie" }];
const cheapest = Math.min(...allProducts.map((p) => p.priceMin));
const fill = (text: string) => text.replace("{cheapest}", formatPrice(cheapest)).replace("{fabrics}", String(allFabrics.length));
const faq = custom.faq.map((f) => ({ q: f.q, a: fill(f.a) }));

const prepare = [
  "model z kolekcji, który Ci się podoba, albo zdjęcie z internetu",
  "wymiary miejsca, w którym mebel stanie",
  "kto będzie z niego korzystał, jak długo się siedzi, czy są zwierzęta",
  "tkanina albo kolor, jeśli już wiesz",
  "termin i budżet, jeśli są sztywne",
];

export default function MadeToOrder() {
  return (
    <Layout>
      <SeoHead
        title="Meble tapicerowane na zamówienie: fotele, sofy, łóżka na wymiar | SIMAX"
        description="Fotel, sofa albo łóżko tapicerowane na zamówienie: sprawdzony model z kolekcji, a do tego Twoja tkanina, kolor, wzór, przeszycia i nogi. Doradzamy piankę i materiały, szyjemy w pracowni SIMAX w Wielkopolsce."
        canonical="/na-zamowienie/"
        image="b2b-1"
        breadcrumbs={crumbs}
        graph={[
          {
            "@type": "Service",
            "@id": `${absolute("/na-zamowienie/")}#usluga`,
            name: "Meble tapicerowane na zamówienie",
            serviceType: "Produkcja mebli tapicerowanych na zamówienie",
            provider: { "@id": `${site.url}/#organization` },
            areaServed: { "@type": "Country", name: "Polska" },
            description: "Fotele, sofy, łóżka i siedziska tapicerowane na zamówienie na bazie sprawdzonych modeli: tkanina, kolor, wzór, przeszycia, nogi i wypełnienie według wyboru klienta, łóżka także na wymiar. Doradztwo przy doborze pianki i tkaniny.",
          },
          {
            "@type": "FAQPage",
            "@id": `${absolute("/na-zamowienie/")}#faq`,
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Meble tapicerowane na zamówienie</h1>
          <p class="lead">
            Fotel, sofa albo łóżko, które pasuje do Ciebie. Bazą jest sprawdzony model z naszej kolekcji, a tkaninę, kolor, wzór, przeszycia i nogi dobierasz z nami. Doradzimy piankę i materiały, a mebel uszyjemy w pracowni w Łęce Mroczeńskiej.
          </p>
          <div class={styles.ctas}>
            <NavLink href="/na-zamowienie/#brief" class="btn btn-primary">Opisz swój pomysł</NavLink>
            <a class="btn btn-ghost" href={`tel:${site.phoneHref}`}>Zadzwoń: {site.phone.replace("+48 ", "")}</a>
          </div>
        </header>
      </div>

      <section class="section" aria-labelledby="etapy">
        <div class="container">
          <div class="section-head">
            <h2 id="etapy">Od pomysłu do gotowego mebla</h2>
            <p>Cztery etapy. Na każdym wiesz, co robisz Ty, a co my.</p>
          </div>
          <Process detailed />
        </div>
      </section>

      <section class={`section ${styles.band}`} aria-labelledby="co-zmienic">
        <div class={`container ${styles.split}`}>
          <div>
            <h2 id="co-zmienic">Co możesz zmienić</h2>
            <p class="lead">{custom.optionsLead}</p>
            <ul class={styles.options}>
              <For each={custom.options}>
                {(o) => (
                  <li class="reveal">
                    <h3>{o.name}</h3>
                    <p>{fill(o.text)}</p>
                  </li>
                )}
              </For>
            </ul>
            <p class={styles.muted}>
              Planujesz łóżko? Zacznij od <NavLink href="/lozko-na-zamowienie/">konfiguratora łóżka</NavLink>: rozmiar, wezgłowie, pojemnik i nogi z podglądem. Fotel? Zobacz, <NavLink href="/fotele/">z czego go składasz</NavLink>.
            </p>
          </div>
          <div class={styles.photoStack}>
            <Picture image="b2b-1" alt="Zielony fotel uszak SIMAX we wnętrzu" sizes="(min-width: 960px) 480px, 92vw" />
            <Picture image="o-nas-1" alt="Tapicerowane krzesła i fotele w jasnej kawiarni" sizes="(min-width: 960px) 360px, 70vw" />
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="drogi">
        <div class="container">
          <div class="section-head">
            <h2 id="drogi">Trzy drogi do mebla na zamówienie</h2>
            <p>Najczęściej wystarcza pierwsza: sprawdzony model, a reszta po Twojemu.</p>
          </div>
          <div class={`${styles.paths} ${styles.paths3}`}>
            <article class={styles.path}>
              <h3>Model z kolekcji po Twojemu</h3>
              <p>Bierzesz fotel GRANDE, sofę NUVEM albo inny model i dobierasz tkaninę, kolor, wzór, przeszycia i nogi z naszych wzorów.</p>
              <ul>
                <li>konstrukcja i wygoda są sprawdzone</li>
                <li>szybciej i taniej niż nietypowy projekt</li>
                <li>widzisz zdjęcia podobnego mebla przed zamówieniem</li>
              </ul>
              <NavLink href="/produkty/" class="btn btn-ghost">Wybierz model z kolekcji</NavLink>
            </article>
            <article class={styles.path}>
              <h3>Łóżko na wymiar</h3>
              <p>Łóżka robimy w całości u siebie, więc zmienisz w nich najwięcej: rozmiar pod materac, kształt i wysokość wezgłowia, pojemnik, nogi.</p>
              <ul>
                <li>rozmiar pod Twój materac</li>
                <li>wezgłowie pod Twoją ścianę</li>
                <li>podgląd w konfiguratorze</li>
              </ul>
              <NavLink href="/lozko-na-zamowienie/" class="btn btn-ghost">Skonfiguruj łóżko</NavLink>
            </article>
            <article class={styles.path}>
              <h3>Mebel nietypowy</h3>
              <p>Zupełnie nowy kształt albo nietypowy wymiar też czasem szyjemy. To osobny projekt i konstrukcja, więc rzadsza droga.</p>
              <ul>
                <li>pod nietypowe wnętrze albo zastosowanie</li>
                <li>wycena indywidualna, zwykle wyższa</li>
                <li>więcej czasu na projekt i poprawki</li>
              </ul>
              <NavLink href="/na-zamowienie/#brief" class="btn btn-ghost">Opisz swój pomysł</NavLink>
            </article>
          </div>
          <aside class={styles.loop} aria-labelledby="do-kolekcji">
            <svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 14a46 46 0 1 1-40.6 24.4" /><path d="M10 26l9.4 12.4L33 32" /></svg>
            <div>
              <h3 id="do-kolekcji">Czasem projekt wraca do kolekcji</h3>
              <p>
                Czasem nietypowy projekt trafia później do naszej kolekcji jako gotowy model. Kolejna osoba kupuje go taniej i szybciej, bo projekt, konstrukcja i doświadczenie z szycia już są. Gotowe projekty kupisz w <a href={site.shop} rel="noopener">sklepie SIMAX</a>. Twój projekt trafi tam tylko za Twoją zgodą.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section class="section" aria-labelledby="doradzamy">
        <div class="container">
          <div class="section-head">
            <h2 id="doradzamy">Doradzamy przy wyborze materiałów</h2>
            <p>Dobra rada przy zamówieniu jest tak samo ważna jak szycie. Pytamy, jak będziesz z mebla korzystać, i proponujemy materiały, które to wytrzymają.</p>
          </div>
          <ul class={`${styles.options} ${styles.advice}`}>
            <For each={custom.advice}>
              {(a) => (
                <li class="reveal">
                  <h3>{a.name}</h3>
                  <p innerHTML={a.html} />
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>

      <section class={`section ${styles.band}`} aria-labelledby="napisz">
        <div class={`container ${styles.briefGrid}`}>
          <div>
            <h2 id="napisz">Opisz swój pomysł</h2>
            <p class="lead">Na początek wystarczy kilka zdań. Odezwiemy się z pytaniami, doradzimy materiały, a potem podamy wycenę.</p>
            <h3 class={styles.small}>Co warto przygotować</h3>
            <ul class={styles.checklist}>
              <For each={prepare}>{(item) => <li>{item}</li>}</For>
            </ul>
            <p class={styles.muted}>
              Tkaniny obejrzysz na żywo: <NavLink href="/tkaniny/">{allFabrics.length} kolekcji tkanin</NavLink>, próbki wysyłamy do paczkomatu.
            </p>
          </div>
          <BriefForm />
        </div>
      </section>

      <section class="section" aria-labelledby="pytania">
        <div class={`container ${styles.faqGrid}`}>
          <h2 id="pytania">Pytania o meble na zamówienie</h2>
          <div class={styles.faq}>
            <For each={faq}>
              {(f) => (
                <details>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              )}
            </For>
          </div>
        </div>
      </section>

      <section class={styles.cta} aria-labelledby="dla-firm-skrot">
        <div class={`container ${styles.ctaInner}`}>
          <div>
            <h2 id="dla-firm-skrot">Urządzasz restaurację, hotel albo biuro?</h2>
            <p>Serie mebli dla firm, w tkaninach do intensywnego użytku.</p>
          </div>
          <NavLink href="/dla-firm/" class="btn btn-primary">Meble dla firm</NavLink>
        </div>
      </section>
    </Layout>
  );
}
