import { For } from "solid-js";
import site from "~/data/site.json";
import { allFabrics } from "~/utils/catalog";
import styles from "./BedConfigurator.module.css";

interface Choice {
  /** Short key used by the CSS preview (`data-o`). */
  o: string;
  label: string;
  checked?: boolean;
}
interface Step {
  name: string;
  hint?: string;
  /** Steps that only make sense for a full bed fade out for "Samo wezgłowie". */
  bedOnly?: boolean;
  choices: Choice[];
}

// Sizes, heights and the two leg types come from the COMO and DIA models; the rest is a starting point for the talk.
const STEPS: Step[] = [
  {
    name: "Co zamawiasz",
    choices: [
      { o: "bed", label: "Łóżko z wezgłowiem", checked: true },
      { o: "head", label: "Samo wezgłowie" },
    ],
  },
  {
    name: "Rozmiar materaca",
    choices: [
      { o: "s140", label: "140 × 200" },
      { o: "s160", label: "160 × 200", checked: true },
      { o: "s180", label: "180 × 200" },
      { o: "s200", label: "200 × 200" },
      { o: "sx", label: "Inny, wpiszę w uwagach" },
    ],
  },
  {
    name: "Wezgłowie",
    choices: [
      { o: "arc", label: "Gładkie, zaokrąglone (jak COMO)", checked: true },
      { o: "pads", label: "Poduchy (jak DIA)" },
      { o: "tuft", label: "Pikowane" },
      { o: "chan", label: "Pionowe przeszycia" },
    ],
  },
  {
    name: "Wysokość wezgłowia",
    hint: "Łóżka z kolekcji mają od 103 do 111 cm od podłogi.",
    choices: [
      { o: "hlow", label: "Niższe" },
      { o: "hmid", label: "Jak w kolekcji", checked: true },
      { o: "hhigh", label: "Wyższe" },
    ],
  },
  {
    name: "Pojemnik na pościel",
    bedOnly: true,
    choices: [
      { o: "box", label: "Tak", checked: true },
      { o: "nobox", label: "Nie" },
    ],
  },
  {
    name: "Nogi",
    bedOnly: true,
    choices: [
      { o: "metal", label: "Metalowe (jak COMO)", checked: true },
      { o: "plinth", label: "Niskie, schowane (jak DIA)" },
      { o: "wood", label: "Drewniane" },
    ],
  },
];

const TUFTS: [number, number][] = [
  ...[230, 298, 366, 434, 502, 570].flatMap((x) => [[x, 205], [x, 305]] as [number, number][]),
  ...[264, 332, 400, 468, 536].map((x) => [x, 255] as [number, number]),
];
const CHANNELS = [235, 290, 345, 400, 455, 510, 565];
const SIZES = [
  ["s140", "materac 140 × 200 cm"],
  ["s160", "materac 160 × 200 cm"],
  ["s180", "materac 180 × 200 cm"],
  ["s200", "materac 200 × 200 cm"],
  ["sx", "Twój wymiar materaca"],
];

// No backend, same as BriefForm: mail app with the configuration filled in; plain mailto post without JS.
const enhance = `(function(){var f=document.currentScript.previousElementSibling,o=f.querySelector("[data-summary]");function sum(){var d=new FormData(f),p=[];["Co zamawiasz","Rozmiar materaca","Wezgłowie","Wysokość wezgłowia"].forEach(function(n){p.push(n.toLowerCase()+": "+d.get(n))});if(d.get("Co zamawiasz")!=="Samo wezgłowie"){p.push("pojemnik: "+d.get("Pojemnik na pościel").toLowerCase());p.push("nogi: "+d.get("Nogi").toLowerCase())}o.textContent=p.join(", ")+".";o.hidden=false}f.addEventListener("change",sum);sum();f.addEventListener("submit",function(e){e.preventDefault();var d=new FormData(f),b=[];if(d.get("Co zamawiasz")==="Samo wezgłowie"){d.delete("Pojemnik na pościel");d.delete("Nogi")}d.forEach(function(v,n){v=String(v).trim();if(v)b.push(n+": "+v)});location.href="mailto:"+f.dataset.to+"?subject="+encodeURIComponent(f.dataset.subject)+"&body="+encodeURIComponent(b.join("\\n\\n")+"\\n\\n(Zdjęcie sypialni albo inspiracji dołącz do tej wiadomości.)\\n");f.querySelector("[data-sent]").hidden=false})})()`;

export default function BedConfigurator() {
  const subject = "Łóżko na zamówienie: konfiguracja";
  return (
    <div class={styles.wrap} id="konfigurator">
      <form
        class={styles.cfg}
        action={`mailto:${site.email}?subject=${encodeURIComponent(subject)}`}
        method="post"
        enctype="text/plain"
        data-to={site.email}
        data-subject={subject}
      >
        <div class={styles.previewCol}>
          <div class={styles.preview}>
            <svg viewBox="0 0 800 500" role="img" aria-label="Podgląd łóżka z przodu według wybranych opcji">
              <path class={styles.floor} d="M40 470L760 470" />
              <g class={styles.bed}>
                <path class={styles.dimLine} d="M160 44L640 44M160 32L160 56M640 32L640 56" />
                <g class={styles.head}>
                  <g data-h="arc">
                    <path class={styles.fabric} d="M180 370L180 232Q180 150 262 150L538 150Q620 150 620 232L620 370Z" />
                    <path class={styles.seam} d="M400 156L400 330" />
                  </g>
                  <g data-h="pads">
                    <For each={[182, 330, 478]}>{(x) => <rect class={styles.fabric} x={x} y="158" width="140" height="212" rx="44" />}</For>
                  </g>
                  <g data-h="tuft">
                    <rect class={styles.fabric} x="180" y="150" width="440" height="220" rx="20" />
                    <For each={TUFTS}>{([x, y]) => <circle class={styles.button} cx={x} cy={y} r="6" />}</For>
                  </g>
                  <g data-h="chan">
                    <rect class={styles.fabric} x="180" y="150" width="440" height="220" rx="20" />
                    <For each={CHANNELS}>{(x) => <path class={styles.seam} d={`M${x} 162L${x} 330`} />}</For>
                  </g>
                </g>
                <g class={styles.frame}>
                  <g class={styles.legs}>
                    <g data-l="metal">
                      <path d="M206 430L190 470M594 430L610 470" />
                    </g>
                    <g data-l="plinth">
                      <rect x="230" y="430" width="340" height="40" rx="4" />
                    </g>
                    <g data-l="wood">
                      <path d="M200 430L210 470L226 470L232 430ZM600 430L590 470L574 470L568 430Z" />
                    </g>
                  </g>
                  <rect class={styles.mattress} x="178" y="300" width="444" height="44" rx="16" />
                  <ellipse class={styles.pillow} cx="290" cy="300" rx="82" ry="26" />
                  <ellipse class={styles.pillow} cx="510" cy="300" rx="82" ry="26" />
                  <rect class={styles.fabric} x="160" y="330" width="480" height="100" rx="40" />
                  <g class={styles.box}>
                    <path d="M196 352L604 352" />
                  </g>
                </g>
              </g>
              <g class={styles.sizeText}>
                <For each={SIZES}>{([o, t]) => <text x="400" y="26" text-anchor="middle" data-s={o}>{t}</text>}</For>
              </g>
              <text class={styles.boxText} x="400" y="400" text-anchor="middle">pojemnik na pościel</text>
            </svg>
          </div>
          <p class={styles.summary} data-summary aria-live="polite" hidden />
          <p class={styles.note}>Podgląd jest poglądowy. Dokładne wymiary, wypełnienie i cenę ustalamy razem w rozmowie.</p>
        </div>

        <div class={styles.steps}>
          <For each={STEPS}>
            {(s) => (
              <fieldset class={s.bedOnly ? `${styles.step} ${styles.bedOnly}` : styles.step}>
                <legend>{s.name}</legend>
                {s.hint && <p class={styles.hint}>{s.hint}</p>}
                <div class={styles.choices}>
                  <For each={s.choices}>
                    {(c) => (
                      <label>
                        <input type="radio" name={s.name} value={c.label} data-o={c.o} checked={c.checked} />
                        <span>{c.label}</span>
                      </label>
                    )}
                  </For>
                </div>
              </fieldset>
            )}
          </For>

          <label class={styles.field}>
            <span>Tkanina</span>
            <select name="Tkanina">
              <option>Jeszcze nie wiem, proszę o próbki</option>
              <For each={allFabrics}>{(f) => <option>{f.name}</option>}</For>
            </select>
          </label>
          <label class={styles.field}>
            <span>Uwagi (opcjonalnie)</span>
            <textarea name="Uwagi" rows="3" placeholder="np. materac 160 × 210, wezgłowie pod skos 90 cm, kolor nóg" />
          </label>
          <label class={styles.field}>
            <span>Imię i telefon</span>
            <input name="Kontakt" autocomplete="name tel" required placeholder="żebyśmy mogli oddzwonić" />
          </label>
          <div class={styles.submit}>
            <button type="submit" class="btn btn-primary">Wyślij konfigurację</button>
            <p>
              Otworzy się Twoja poczta z gotową wiadomością do <a href={`mailto:${site.email}`}>{site.email}</a>. Zdjęcia sypialni albo inspiracji dołączysz w tym mailu.
              Wolisz rozmowę? <a href={`tel:${site.phoneHref}`}>{site.phone}</a>.
            </p>
            <p class={styles.sent} data-sent hidden>Jeśli poczta się nie otworzyła, napisz bezpośrednio na {site.email} albo zadzwoń.</p>
          </div>
        </div>
      </form>
      <script innerHTML={enhance} />
    </div>
  );
}
