import { For } from "solid-js";
import NavLink from "./NavLink";
import Picture from "./Picture";
import { formatPrice, type Product, type Variant } from "~/utils/catalog";
import styles from "./IdeaStage.module.css";

interface Props {
  product: Product;
  /** Variant whose packshot the sketch is traced from (coordinates match fotel-grande-50). */
  variant: Variant;
}

const cm = (p: Product, name: string) => parseInt(p.dimensions.find((d) => d.name === name)?.value ?? "", 10) || null;

/** Pencil sketch traced over the 800x878 packshot, so it lines up with the photo stage. */
const SKETCH = [
  // wings and back
  "M332 322C340 205 358 92 410 63C470 48 560 96 640 76C700 60 742 30 772 46C792 62 770 112 745 160C716 228 690 290 655 345",
  // right arm, the jacquard side
  "M400 300C432 284 482 286 560 314C612 332 640 340 655 345C646 420 622 490 600 522C578 560 520 580 450 581C402 581 362 571 350 556C344 470 358 332 400 300Z",
  // left arm
  "M30 300C40 270 82 262 132 265C222 272 292 290 332 322C346 336 351 362 350 402",
  "M30 300C21 342 25 424 46 500C64 512 126 522 204 531L346 556",
  // seat cushion
  "M66 410C152 405 262 414 346 425L346 470C300 462 122 456 70 451C61 441 61 421 66 410Z",
  "M72 451L80 494",
  // rail and legs
  "M142 548L522 590",
  "M116 532L45 734L61 736L148 538",
  "M326 586L305 857L322 858L350 590",
  "M522 572L630 738L643 735L557 572",
  "M357 600L356 650L370 650L372 602",
];
const BUTTONS: [number, number][] = [[483, 183], [562, 196], [635, 183], [498, 280], [574, 288]];
const NOTES: { x: number; y: number; text: string; arrow: string }[] = [
  { x: 470, y: 24, text: "wyższe uszy?", arrow: "M640 20C690 12 720 18 744 34" },
  { x: 20, y: 200, text: "siedzisko 46 cm", arrow: "M120 214C150 260 160 330 166 396" },
  { x: 560, y: 800, text: "boki: żakard", arrow: "M610 770C600 700 580 620 560 560" },
  { x: 40, y: 820, text: "nogi: orzech", arrow: "M90 790C80 770 70 760 74 712" },
];

export default function IdeaStage(props: Props) {
  const p = () => props.product;
  // Front view, drawn to scale from the real dimensions (fallbacks only guard missing data).
  const drawing = () => {
    const width = cm(p(), "Szerokość") ?? 80;
    const height = cm(p(), "Wysokość całkowita") ?? 93;
    const seat = cm(p(), "Wysokość siedziska") ?? 46;
    const k = 5.4;
    const floor = 740;
    const cx = 400;
    const L = cx - (width * k) / 2;
    const R = cx + (width * k) / 2;
    const T = floor - height * k;
    const S = floor - seat * k;
    const armTop = S - 70;
    const base = S + 72;
    return { width, height, seat, depth: cm(p(), "Głębokość całkowita"), seatDepth: cm(p(), "Głębokość siedziska"), k, floor, cx, L, R, T, S, armTop, base };
  };

  return (
    <div class={styles.stage}>
      <div class={styles.frame}>
        <svg class={styles.sketch} viewBox="0 0 800 878" role="img" aria-label="Szkic fotela z notatkami klienta: wyższe uszy, siedzisko 46 cm, boki z żakardu, nogi w kolorze orzecha">
          <g class={styles.lines}>
            <For each={SKETCH}>{(d, i) => <path d={d} pathLength="1" style={{ "--i": i() }} />}</For>
            <For each={SKETCH}>{(d, i) => <path class={styles.ghost} d={d} pathLength="1" style={{ "--i": i() + 2 }} />}</For>
            <For each={BUTTONS}>{([x, y], i) => <circle cx={x} cy={y} r="7" pathLength="1" style={{ "--i": SKETCH.length + i() }} />}</For>
          </g>
          <g class={styles.notes}>
            <For each={NOTES}>
              {(n, i) => (
                <g style={{ "--i": SKETCH.length + 4 + i() * 2 }}>
                  <text x={n.x} y={n.y + 22}>{n.text}</text>
                  <path d={n.arrow} pathLength="1" />
                </g>
              )}
            </For>
          </g>
        </svg>

        <svg class={styles.drawing} viewBox="0 0 800 878" role="img" aria-label={`Rysunek techniczny fotela ${p().name} z przodu: szerokość ${drawing().width} cm, wysokość ${drawing().height} cm, wysokość siedziska ${drawing().seat} cm`}>
          {(() => {
            const d = drawing();
            const tick = (x: number, y: number) => `M${x - 7} ${y + 7}L${x + 7} ${y - 7}`;
            return (
              <>
                <g class={styles.part}>
                  {/* wings and back */}
                  <path d={`M${d.L + 22} ${d.armTop + 4}C${d.L + 6} ${d.T + 150} ${d.L + 4} ${d.T + 30} ${d.L + 40} ${d.T + 10}C${d.cx - 130} ${d.T - 6} ${d.cx - 90} ${d.T + 26} ${d.cx} ${d.T + 26}C${d.cx + 90} ${d.T + 26} ${d.cx + 130} ${d.T - 6} ${d.R - 40} ${d.T + 10}C${d.R - 4} ${d.T + 30} ${d.R - 6} ${d.T + 150} ${d.R - 22} ${d.armTop + 4}`} />
                  <path d={`M${d.L + 78} ${d.S - 6}L${d.L + 70} ${d.T + 70}C${d.L + 72} ${d.T + 44} ${d.cx - 80} ${d.T + 44} ${d.cx} ${d.T + 50}C${d.cx + 80} ${d.T + 44} ${d.R - 72} ${d.T + 44} ${d.R - 70} ${d.T + 70}L${d.R - 78} ${d.S - 6}`} />
                  {/* arms */}
                  <path d={`M${d.L} ${d.base}L${d.L} ${d.armTop + 24}C${d.L} ${d.armTop} ${d.L + 78} ${d.armTop} ${d.L + 78} ${d.armTop + 24}L${d.L + 78} ${d.base}`} />
                  <path d={`M${d.R} ${d.base}L${d.R} ${d.armTop + 24}C${d.R} ${d.armTop} ${d.R - 78} ${d.armTop} ${d.R - 78} ${d.armTop + 24}L${d.R - 78} ${d.base}`} />
                  {/* seat cushion and frame */}
                  <rect x={d.L + 78} y={d.S - 6} width={d.R - d.L - 156} height="44" rx="10" />
                  <path d={`M${d.L} ${d.base}L${d.R} ${d.base}`} />
                  {/* splayed legs */}
                  <path d={`M${d.L + 34} ${d.base}L${d.L + 8} ${d.floor}L${d.L + 24} ${d.floor}L${d.L + 52} ${d.base}`} />
                  <path d={`M${d.R - 34} ${d.base}L${d.R - 8} ${d.floor}L${d.R - 24} ${d.floor}L${d.R - 52} ${d.base}`} />
                  <For each={[-90, 0, 90]}>{(dx) => <circle cx={d.cx + dx} cy={d.T + 130} r="6" />}</For>
                  <For each={[-45, 45]}>{(dx) => <circle cx={d.cx + dx} cy={d.T + 205} r="6" />}</For>
                </g>
                <g class={styles.dims}>
                  <path class={styles.floor} d={`M${d.L - 100} ${d.floor}L${d.R + 110} ${d.floor}`} />
                  {/* width */}
                  <path d={`M${d.L} ${d.armTop - 6}L${d.L} ${d.T - 44}M${d.R} ${d.armTop - 6}L${d.R} ${d.T - 44}M${d.L} ${d.T - 34}L${d.R} ${d.T - 34}${tick(d.L, d.T - 34)}${tick(d.R, d.T - 34)}`} />
                  <text x={d.cx} y={d.T - 46} text-anchor="middle">{d.width}</text>
                  {/* height */}
                  <path d={`M${d.R - 36} ${d.T + 4}L${d.R + 74} ${d.T + 4}M${d.R + 64} ${d.T + 4}L${d.R + 64} ${d.floor}${tick(d.R + 64, d.T + 4)}${tick(d.R + 64, d.floor)}`} />
                  <text x={d.R + 52} y={(d.T + d.floor) / 2} text-anchor="middle" transform={`rotate(-90 ${d.R + 52} ${(d.T + d.floor) / 2})`}>{d.height}</text>
                  {/* seat height */}
                  <path d={`M${d.L + 78} ${d.S - 6}L${d.L - 74} ${d.S - 6}M${d.L - 64} ${d.S - 6}L${d.L - 64} ${d.floor}${tick(d.L - 64, d.S - 6)}${tick(d.L - 64, d.floor)}`} />
                  <text x={d.L - 76} y={(d.S + d.floor) / 2} text-anchor="middle" transform={`rotate(-90 ${d.L - 76} ${(d.S + d.floor) / 2})`}>{d.seat}</text>
                </g>
                <g class={styles.titleBlock}>
                  <rect x="470" y="784" width="300" height="74" />
                  <path d="M470 812L770 812" />
                  <text x="482" y="805" class={styles.tbName}>FOTEL {p().name.replace(/^Fotel\s+/i, "").toUpperCase()}</text>
                  <text x="482" y="834">widok z przodu, wymiary w cm</text>
                  <text x="482" y="851">{d.depth ? `głębokość ${d.depth}` : ""}{d.seatDepth ? `, siedzisko ${d.seatDepth}` : ""}</text>
                </g>
              </>
            );
          })()}
        </svg>

        <div class={styles.photo}>
          <Picture image={props.variant.images[0]} alt={`${p().name}: ${props.variant.label.toLowerCase()}, gotowy fotel z pracowni SIMAX`} sizes="(min-width: 1000px) 520px, 90vw" priority />
        </div>
      </div>

      <fieldset class={styles.tabs}>
        <legend class="sr-only">Etap powstawania fotela</legend>
        <label><input type="radio" name="etap" value="pomysl" checked /><span>Pomysł</span></label>
        <label><input type="radio" name="etap" value="projekt" /><span>Projekt</span></label>
        <label><input type="radio" name="etap" value="mebel" /><span>Gotowy mebel</span></label>
      </fieldset>

      <div class={styles.captions} aria-live="polite">
        <p data-etap="pomysl">Szkic na kartce, zdjęcie z internetu albo kilka zdań. Od tego zaczynamy.</p>
        <p data-etap="projekt">Każdy wymiar ustalamy razem z Tobą. Tu wymiary prawdziwego modelu {p().name.replace(/^Fotel\s+/i, "")}.</p>
        <p data-etap="mebel">
          <NavLink href={`/produkty/${p().slug}/`}>{p().name}</NavLink>, dziś gotowy projekt z kolekcji, od {formatPrice(p().priceMin)}.
        </p>
      </div>
      <script innerHTML={autoplay} />
    </div>
  );
}

// Walks once through the three stages, then stops; any interaction or reduced motion cancels it.
const autoplay = `(function(){var s=document.currentScript.parentElement,r=s.querySelectorAll('input[name="etap"]'),i=0,t;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;function stop(){clearInterval(t)}t=setInterval(function(){i++;if(i>=r.length)return stop();r[i].checked=true},3400);s.addEventListener("pointerdown",stop);s.addEventListener("keydown",stop)})()`;
