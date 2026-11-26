import { For, Show } from "solid-js";
import NavLink from "./NavLink";
import Picture from "./Picture";
import ProductCard from "./ProductCard";
import { basePath } from "~/utils/base";
import { allCategories, categoryName, variantAlt, type Product } from "~/utils/catalog";
import styles from "./Catalogue.module.css";

interface Props {
  products: Product[];
  /** Show the search box and category filter (the /produkty/ page). */
  search?: boolean;
  /** Category this listing belongs to, highlighted in the chips. */
  current?: string;
}

// Client-side filter over the prerendered cards and photos; without JS every item stays visible.
const searchScript = `(function(){var root=document.currentScript.parentElement,input=root.querySelector("input[type=search]"),chips=root.querySelectorAll("[data-chip]"),items=root.querySelectorAll("[data-search]"),count=root.querySelector("[data-count]"),empty=root.querySelector("[data-empty]"),cat="";
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/ł/g,"l")}
function run(){var q=norm(input.value.trim()).split(/\\s+/).filter(Boolean),n=0;items.forEach(function(el){var t=norm(el.getAttribute("data-search")),ok=(!cat||el.getAttribute("data-category")===cat)&&q.every(function(w){return t.indexOf(w)>-1});el.hidden=!ok;if(ok&&el.tagName==="ARTICLE")n++});count.textContent=n;empty.hidden=n>0;var u=new URL(location.href);if(input.value.trim())u.searchParams.set("q",input.value.trim());else u.searchParams.delete("q");if(cat)u.searchParams.set("kategoria",cat);else u.searchParams.delete("kategoria");history.replaceState(null,"",u)}
var p=new URLSearchParams(location.search);input.value=p.get("q")||"";cat=p.get("kategoria")||"";
chips.forEach(function(c){c.setAttribute("aria-pressed",String(c.getAttribute("data-chip")===cat));c.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();cat=c.getAttribute("data-chip");chips.forEach(function(o){o.setAttribute("aria-pressed",String(o===c))});run()},true)});
input.addEventListener("input",run);root.querySelector("form").addEventListener("submit",function(e){e.preventDefault();run()});if(input.value||cat)run()})()`;

export default function Catalogue(props: Props) {
  const photos = () =>
    props.products.flatMap((p) =>
      p.variants.flatMap((v) => v.images.slice(0, 2).map((img, i) => ({ p, v, img, i }))),
    );
  const searchText = (p: Product, extra = "") => [p.name, categoryName(p.category), extra].join(" ").toLowerCase();

  return (
    <div class={styles.catalogue}>
      <Show when={props.search}>
        <form class={styles.searchBar} role="search" action={`${basePath}/produkty/`} method="get">
          <label for="q" class="sr-only">Szukaj mebli</label>
          <input id="q" name="q" type="search" placeholder="Szukaj: fotel uszak, boucle, musztardowy…" autocomplete="off" />
          <button class="btn btn-primary" type="submit">Szukaj</button>
        </form>
        <div class={styles.chips} role="group" aria-label="Kategoria">
          <a href={`${basePath}/produkty/`} data-chip="" class={styles.chip}>Wszystko</a>
          <For each={allCategories.filter((c) => c.products.length)}>
            {(c) => <a href={`${basePath}/${c.slug}/`} data-chip={c.slug} class={styles.chip}>{c.name}</a>}
          </For>
        </div>
      </Show>

      <div class={styles.views}>
        <p class={styles.count} aria-live="polite">
          Znaleziono: <strong data-count>{props.products.length}</strong>
        </p>
        <fieldset class={styles.toggle}>
          <legend class="sr-only">Widok</legend>
          <label><input type="radio" name="widok" value="modele" checked /> Modele</label>
          <label><input type="radio" name="widok" value="galeria" /> Galeria zdjęć</label>
        </fieldset>
      </div>

      <div class={styles.grid} data-view="modele">
        <For each={props.products}>{(p, i) => <ProductCard product={p} level={2} priority={i() < 3} />}</For>
      </div>

      <ul class={styles.gallery} data-view="galeria" aria-label="Galeria zdjęć mebli">
        <For each={photos()}>
          {(ph) => (
            <li data-search={searchText(ph.p, `${ph.v.label} ${ph.v.fullName}`)} data-category={ph.p.category}>
              <NavLink href={ph.p.variants.length > 1 ? `/produkty/${ph.p.slug}/?wariant=${ph.v.id}` : `/produkty/${ph.p.slug}/`}>
                <Picture image={ph.img} alt={variantAlt(ph.p, ph.v, ph.i)} sizes="(min-width: 1000px) 300px, 45vw" />
                <span>{ph.p.name}<small>{ph.v.label}</small></span>
              </NavLink>
            </li>
          )}
        </For>
      </ul>

      <p class={styles.empty} data-empty hidden>
        Nic nie pasuje do wyszukiwania. Zadzwoń i zapytaj, czy uszyjemy mebel nietypowy.
      </p>
      <Show when={props.search}>
        <script innerHTML={searchScript} />
      </Show>
    </div>
  );
}
