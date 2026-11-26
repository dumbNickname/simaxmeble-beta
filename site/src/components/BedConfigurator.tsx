import { For } from "solid-js";
import site from "~/data/site.json";
import { allFabrics } from "~/utils/catalog";
import styles from "./BedConfigurator.module.css";

interface Choice {
  /** Short key read by the CSS fallback preview and the 3D view (`data-o`). */
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

// Field names double as the labels in the e-mail, so they are written for the owner.
export const F = {
  what: "Co zamawiasz",
  size: "Rozmiar materaca",
  shape: "Wezgłowie",
  height: "Wysokość wezgłowia od podłogi (cm)",
  wide: "Wezgłowie szersze od materaca z każdej strony (cm)",
  box: "Pojemnik na pościel",
  legs: "Nogi",
  colour: "Kolor tkaniny (poglądowo)",
} as const;

// Sizes, heights and the two leg types come from the COMO and DIA models; the rest is a starting point for the talk.
const STEPS: Step[] = [
  {
    name: F.what,
    choices: [
      { o: "bed", label: "Łóżko z wezgłowiem", checked: true },
      { o: "head", label: "Samo wezgłowie" },
    ],
  },
  {
    name: F.size,
    hint: "Długość 200 cm. Inną długość, np. 210 cm, wpisz w uwagach.",
    choices: [
      { o: "s90", label: "90 × 200" },
      { o: "s120", label: "120 × 200" },
      { o: "s140", label: "140 × 200" },
      { o: "s160", label: "160 × 200", checked: true },
      { o: "s180", label: "180 × 200" },
      { o: "s200", label: "200 × 200" },
      { o: "sx", label: "Inny, wpiszę w uwagach" },
    ],
  },
  {
    name: F.shape,
    choices: [
      { o: "arc", label: "Gładkie, zaokrąglone (jak COMO)", checked: true },
      { o: "pads", label: "Poduchy (jak DIA)" },
      { o: "tuft", label: "Pikowane" },
      { o: "chan", label: "Pionowe przeszycia" },
    ],
  },
];

const AFTER: Step[] = [
  {
    name: F.legs,
    bedOnly: true,
    choices: [
      { o: "metal", label: "Metalowe (jak COMO)", checked: true },
      { o: "plinth", label: "Niskie, schowane (jak DIA)" },
      { o: "wood", label: "Drewniane" },
    ],
  },
];

/** Preview tints only; the real colour comes from the fabric samples. */
export const COLOURS: { o: string; label: string; hex: string }[] = [
  { o: "c-none", label: "Jeszcze nie wiem", hex: "" },
  { o: "c-cream", label: "Kremowy", hex: "#e9dfcf" },
  { o: "c-grey", label: "Jasnoszary", hex: "#c9c6c0" },
  { o: "c-graphite", label: "Grafitowy", hex: "#4b4c52" },
  { o: "c-bottle", label: "Butelkowa zieleń", hex: "#22513d" },
  { o: "c-navy", label: "Granatowy", hex: "#243461" },
  { o: "c-mustard", label: "Musztardowy", hex: "#c9971c" },
  { o: "c-rust", label: "Rudy", hex: "#b4532f" },
  { o: "c-rose", label: "Pudrowy róż", hex: "#dba7a6" },
];

const TUFTS: [number, number][] = [
  ...[230, 298, 366, 434, 502, 570].flatMap((x) => [[x, 205], [x, 305]] as [number, number][]),
  ...[264, 332, 400, 468, 536].map((x) => [x, 255] as [number, number]),
];
const CHANNELS = [235, 290, 345, 400, 455, 510, 565];
const SIZES = [
  ["s90", "materac 90 × 200 cm"],
  ["s120", "materac 120 × 200 cm"],
  ["s140", "materac 140 × 200 cm"],
  ["s160", "materac 160 × 200 cm"],
  ["s180", "materac 180 × 200 cm"],
  ["s200", "materac 200 × 200 cm"],
  ["sx", "Twój wymiar materaca"],
];

// No backend, same as BriefForm: mail app with the configuration filled in; plain mailto post without JS.
// Fields named "podglad-*" only steer the preview and stay out of the e-mail.
const enhance = `(function(){var f=document.currentScript.previousElementSibling,o=f.querySelector("[data-summary]"),N=${JSON.stringify(F)};
function data(){var d=new FormData(f);Array.from(d.keys()).forEach(function(k){if(/^podglad/.test(k))d.delete(k)});if(!d.get(N.box))d.set(N.box,"nie");if(d.get(N.colour)==="Jeszcze nie wiem")d.delete(N.colour);if(d.get(N.what)==="Samo wezgłowie"){d.delete(N.box);d.delete(N.legs)}return d}
function sum(){f.querySelectorAll("output[data-for]").forEach(function(x){x.textContent=(x.dataset.plus?"+":"")+f.elements[x.dataset.for].value+" cm"});var d=data(),p=[d.get(N.what),"materac "+d.get(N.size),"wezgłowie "+d.get(N.shape).toLowerCase(),d.get(N.height)+" cm wysokości","+"+d.get(N.wide)+" cm z każdej strony"];if(d.get(N.box))p.push(d.get(N.box)==="tak"?"z pojemnikiem":"bez pojemnika");if(d.get(N.legs))p.push("nogi "+d.get(N.legs).toLowerCase());if(d.get(N.colour))p.push(d.get(N.colour).toLowerCase());o.textContent=p.join(", ")+".";o.hidden=false}
f.addEventListener("input",sum);f.addEventListener("change",sum);sum();
f.addEventListener("submit",function(e){e.preventDefault();var d=data(),b=[];d.forEach(function(v,n){v=String(v).trim();if(v)b.push(n+": "+v)});location.href="mailto:"+f.dataset.to+"?subject="+encodeURIComponent(f.dataset.subject)+"&body="+encodeURIComponent(b.join("\\n\\n")+"\\n\\n(Zdjęcie sypialni albo inspiracji dołącz do tej wiadomości.)\\n");f.querySelector("[data-sent]").hidden=false})})()`;

function Choices(props: { step: Step }) {
  return (
    <fieldset class={props.step.bedOnly ? `${styles.step} ${styles.bedOnly}` : styles.step}>
      <legend>{props.step.name}</legend>
      {props.step.hint && <p class={styles.hint}>{props.step.hint}</p>}
      <div class={styles.choices}>
        <For each={props.step.choices}>
          {(c) => (
            <label>
              <input type="radio" name={props.step.name} value={c.label} data-o={c.o} checked={c.checked} />
              <span>{c.label}</span>
            </label>
          )}
        </For>
      </div>
    </fieldset>
  );
}

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
          <div class={styles.preview} data-bed3d>
            <svg class={styles.flat} viewBox="0 0 800 500" role="img" aria-label="Podgląd łóżka z przodu według wybranych opcji">
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
            <canvas class={styles.canvas} data-canvas aria-hidden="true" />
            <svg class={styles.dims} data-dims aria-hidden="true" />
            <p class="sr-only" data-dims-text aria-live="polite" />
          </div>
          <div class={styles.previewOpts} data-preview-opts>
            <fieldset class={styles.mini}>
              <legend>Poduszki na podglądzie</legend>
              <For each={[0, 1, 2, 3, 4]}>
                {(n) => (
                  <label>
                    <input type="radio" name="podglad-poduszki" value={String(n)} checked={n === 2} />
                    <span>{n}</span>
                  </label>
                )}
              </For>
            </fieldset>
            <label class={styles.cat}>
              <input type="checkbox" name="podglad-kot" value="tak" checked />
              <span>Kot dla skali</span>
            </label>
          </div>
          <p class={styles.summary} data-summary aria-live="polite" hidden />
          <p class={styles.note}>Podgląd jest poglądowy. Dokładne wymiary, wypełnienie i cenę ustalamy razem w rozmowie.</p>
        </div>

        <div class={styles.steps}>
          <For each={STEPS}>{(s) => <Choices step={s} />}</For>

          <label class={styles.range}>
            <span class={styles.rangeHead}>
              <b>Wysokość wezgłowia</b>
              <output data-for={F.height}>110 cm</output>
            </span>
            <input type="range" name={F.height} data-o="height" min="90" max="140" step="5" value="110" />
            <small>Łóżka z kolekcji mają od 103 do 111 cm od podłogi.</small>
          </label>

          <label class={styles.range}>
            <span class={styles.rangeHead}>
              <b>Szerokość wezgłowia</b>
              <output data-for={F.wide} data-plus="1">+25 cm</output>
            </span>
            <input type="range" name={F.wide} data-o="wide" min="10" max="50" step="5" value="25" />
            <small>Ile wezgłowie wystaje poza materac z każdej strony. W kolekcji około 25 cm, szersze może sięgać za szafki nocne.</small>
          </label>

          <label class={`${styles.check} ${styles.bedOnly}`}>
            <input type="checkbox" name={F.box} value="tak" data-o="box" checked />
            <span>
              <b>Pojemnik na pościel</b>
              <small>Stelaż podnoszony na siłownikach, pojemnik pod całą powierzchnią spania.</small>
            </span>
          </label>

          <For each={AFTER}>{(s) => <Choices step={s} />}</For>

          <fieldset class={styles.step}>
            <legend>{F.colour}</legend>
            <p class={styles.hint}>Kolor na podglądzie jest umowny. Prawdziwe odcienie zobaczysz w próbkach tkanin.</p>
            <div class={styles.swatches}>
              <For each={COLOURS}>
                {(c, i) => (
                  <label title={c.label}>
                    <input type="radio" name={F.colour} value={c.label} data-o={c.o} data-hex={c.hex} checked={i() === 0} />
                    <span style={c.hex ? { "--c": c.hex } : undefined} class={c.hex ? undefined : styles.noColour} />
                    <b class="sr-only">{c.label}</b>
                  </label>
                )}
              </For>
            </div>
          </fieldset>

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
