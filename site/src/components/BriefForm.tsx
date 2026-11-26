import { For, Show } from "solid-js";
import site from "~/data/site.json";
import { allFabrics, allProducts } from "~/utils/catalog";
import styles from "./BriefForm.module.css";

interface Props {
  /** Company version: business name, number of pieces, kind of venue. */
  b2b?: boolean;
  id?: string;
}

const KINDS = ["fotel", "sofa lub kanapa", "łóżko lub wezgłowie", "krzesła", "ława lub siedzisko pod ścianę", "pufa lub podnóżek", "coś innego"];
const VENUES = ["restauracja lub kawiarnia", "hotel lub pensjonat", "biuro lub poczekalnia", "gabinet lub salon", "inny"];

// No backend: the form opens the visitor's mail app with the brief filled in.
// Without JS the browser posts it as text/plain to mailto:, which most mail apps accept.
const enhance = `(function(){var f=document.currentScript.previousElementSibling,q=new URLSearchParams(location.search);[["model","slug"],["tkanina","fabric"]].forEach(function(a){var v=q.get(a[0]),o=v&&f.querySelector('option[data-'+a[1]+'="'+v+'"]');if(o)o.selected=true});f.addEventListener("submit",function(e){e.preventDefault();var d=new FormData(f),b=[],k;d.forEach(function(v,n){v=String(v).trim();if(v)b.push(n+": "+v)});k=f.dataset.subject+(d.get("Rodzaj mebla")?": "+d.get("Rodzaj mebla"):"");location.href="mailto:"+f.dataset.to+"?subject="+encodeURIComponent(k)+"&body="+encodeURIComponent(b.join("\\n\\n")+"\\n\\n(Zdjęcia, szkice i rzuty dołącz do tej wiadomości.)\\n");f.querySelector("[data-sent]").hidden=false})})()`;

export default function BriefForm(props: Props) {
  const subject = props.b2b ? "Zapytanie od firmy" : "Mebel na zamówienie";
  return (
    <div class={styles.wrap} id={props.id ?? "brief"}>
      <form
        class={styles.form}
        action={`mailto:${site.email}?subject=${encodeURIComponent(subject)}`}
        method="post"
        enctype="text/plain"
        data-to={site.email}
        data-subject={subject}
      >
        <Show when={props.b2b}>
          <label class={styles.field}>
            <span>Firma i miasto</span>
            <input name="Firma" autocomplete="organization" placeholder="np. Kawiarnia Pod Lipą, Wrocław" />
          </label>
          <label class={styles.field}>
            <span>Rodzaj lokalu</span>
            <select name="Lokal">
              <For each={VENUES}>{(v) => <option>{v}</option>}</For>
            </select>
          </label>
        </Show>
        <label class={styles.field}>
          <span>Co chcesz zamówić?</span>
          <select name="Rodzaj mebla">
            <For each={KINDS}>{(k) => <option>{k}</option>}</For>
          </select>
        </label>
        <label class={styles.field}>
          <span>Punkt wyjścia (opcjonalnie)</span>
          <select name="Punkt wyjścia">
            <option value="">Jeszcze nie wiem, proszę o podpowiedź</option>
            <For each={allProducts}>{(p) => <option data-slug={p.slug}>{p.name}</option>}</For>
            <option>Nietypowy projekt, bez modelu z kolekcji</option>
          </select>
        </label>
        <label class={styles.field}>
          <span>Tkanina (opcjonalnie)</span>
          <select name="Tkanina">
            <option value="">Jeszcze nie wiem, proszę o próbki</option>
            <For each={allFabrics}>{(f) => <option data-fabric={f.id}>{f.name}</option>}</For>
            <option>Inna tkanina, opiszę w wiadomości</option>
          </select>
        </label>
        <label class={styles.field}>
          <span>Nogi (opcjonalnie)</span>
          <input name="Nogi" placeholder="np. drewniane, orzech" />
        </label>
        <Show
          when={props.b2b}
          fallback={
            <label class={styles.field}>
              <span>Przeszycia (opcjonalnie)</span>
              <input name="Przeszycia" placeholder="np. pikowanie guzikami, lamówka" />
            </label>
          }
        >
          <label class={styles.field}>
            <span>Liczba sztuk</span>
            <input name="Liczba sztuk" inputmode="numeric" placeholder="np. 24 krzesła, 3 ławy" />
          </label>
        </Show>
        <label class={styles.field}>
          <span>Wymiary albo miejsce</span>
          <input name="Wymiary" placeholder="np. wnęka 210 cm, materac 180x200" />
        </label>
        <label class={`${styles.field} ${styles.wide}`}>
          <span>Opisz pomysł</span>
          <textarea name="Opis" rows="5" required placeholder={props.b2b ? "Styl wnętrza, kolory marki, jak intensywnie meble będą używane." : "Kto będzie siedział, jaki styl, jaka tkanina, czy są zwierzęta. Link do zdjęcia z internetu też wystarczy."} />
        </label>
        <label class={styles.field}>
          <span>{props.b2b ? "Termin (np. otwarcie lokalu)" : "Kiedy mebel jest potrzebny?"}</span>
          <input name="Termin" placeholder="np. przed świętami, bez pośpiechu" />
        </label>
        <label class={styles.field}>
          <span>Imię i telefon</span>
          <input name="Kontakt" autocomplete="name tel" required placeholder="żebyśmy mogli oddzwonić" />
        </label>
        <div class={`${styles.wide} ${styles.submit}`}>
          <button type="submit" class="btn btn-primary">Wyślij opis pomysłu</button>
          <p>
            Otworzy się Twoja poczta z gotową wiadomością do <a href={`mailto:${site.email}`}>{site.email}</a>. Zdjęcia, szkice i rzuty dołączysz w tym mailu, bo formularz nie wysyła plików.
            Wolisz rozmowę? <a href={`tel:${site.phoneHref}`}>{site.phone}</a>.
          </p>
          <p class={styles.sent} data-sent hidden>Jeśli poczta się nie otworzyła, napisz bezpośrednio na {site.email} albo zadzwoń.</p>
        </div>
      </form>
      <script innerHTML={enhance} />
    </div>
  );
}
