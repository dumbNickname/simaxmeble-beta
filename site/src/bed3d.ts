// 3D preview for the bed configurator (BedConfigurator.tsx), loaded lazily by client-setup.ts.
// A pencil sketch on squared paper: paper fill with hatching, ink outlines (inverted hull)
// that "boil" a little like hand-drawn animation, and a watercolour wash once a colour is picked.
// Reads the form, never writes to it. Units are centimetres, y up, the foot of the bed towards +z.
import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  Color,
  ColorManagement,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LinearSRGBColorSpace,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

ColorManagement.enabled = false;

type Shape3 = "arc" | "pads" | "tuft" | "chan";
type Legs = "metal" | "plinth" | "wood";
interface State {
  headOnly: boolean;
  mattress: number;
  customSize: boolean;
  shape: Shape3;
  height: number;
  wide: number;
  box: boolean;
  legs: Legs;
  colour: string | null;
  pillows: number;
  cat: boolean;
}

const L = 200; // mattress length
const SIDE = 13; // rail thickness (COMO)
const RAIL = 32; // rail height (COMO, DIA)
const HEAD_T = 13; // headboard thickness

// ------------------------------------------------------------------ shaders

const NOISE = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
`;

const FILL_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vW;
void main(){
  vec4 w=modelMatrix*vec4(position,1.);
  vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal);
  gl_Position=projectionMatrix*viewMatrix*w;
}`;

const FILL_FRAG = /* glsl */ `
uniform vec3 uPaper,uInk,uTintA,uTintB,uLight;
uniform float uColA,uColB,uMix,uGrain,uDpr,uDraw;
varying vec3 vN; varying vec3 vW;
${NOISE}
vec3 tone(vec3 tint,float col,float l,float hatch,float grain){
  vec3 sketch=mix(uPaper,uInk,hatch*.3*uDraw);
  vec3 wash=tint*(.62+.42*l+grain);
  wash=mix(wash,uInk,hatch*.16);
  return mix(sketch,wash,col);
}
void main(){
  vec3 n=normalize(vN);
  float l=clamp(dot(n,normalize(uLight)),0.,1.);
  vec2 fc=gl_FragCoord.xy/uDpr;
  float wob=.75+.5*noise(fc*.035);
  float d=1.-l;
  float h1=step(.74,fract((fc.x+fc.y)/6.5))*smoothstep(.5,.7,d);
  float h2=step(.72,fract((fc.x-fc.y)/6.5))*smoothstep(.68,.85,d);
  float hatch=clamp((h1+h2)*wob,0.,1.);
  float grain=uGrain*((noise(vW.xy*1.2)+noise(vW.zy*1.2+7.))*.5-.5)*.16;
  vec3 a=tone(uTintA,uColA,l,hatch,grain);
  vec3 b=tone(uTintB,uColB,l,hatch,grain);
  // watercolour front: blotchy screen-space mask, a darker rim where the paint stops
  float m=noise(fc/95.)*.6+noise(fc/24.)*.3+noise(fc/7.)*.1;
  float t=uMix*1.2-.12;
  float s=smoothstep(m-.06,m+.02,t);
  vec3 c=mix(a,b,s);
  float rim=(1.-smoothstep(0.,.05,abs(t-m)))*step(.001,uMix)*step(uMix,.999);
  c*=1.-rim*.18;
  gl_FragColor=vec4(c,1.);
}`;

const HULL_VERT = /* glsl */ `
uniform float uPx,uBoil,uDraw; uniform vec2 uRes,uShift;
void main(){
  vec4 clip=projectionMatrix*modelViewMatrix*vec4(position,1.);
  vec3 vn=normalize(normalMatrix*normal);
  vec2 dir=normalize((projectionMatrix*vec4(vn,0.)).xy+1e-6);
  float wob=.7+.3*sin(dot(position,vec3(.11,.17,.13))+uBoil*2.3)+.15*sin(dot(position,vec3(.37,.29,.41))-uBoil*1.7);
  clip.xy+=(dir*uPx*wob*uDraw+uShift)*clip.w*2./uRes;
  gl_Position=clip;
}`;

const HULL_FRAG = /* glsl */ `
uniform vec3 uInk; uniform float uAlpha;
void main(){gl_FragColor=vec4(uInk,uAlpha);}`;

const FLOOR_FRAG = /* glsl */ `
uniform vec3 uInk; uniform vec2 uHalf,uCenter; uniform float uDpr,uDraw;
varying vec3 vW; varying vec3 vN;
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){
  float d=box(vW.xz-uCenter,uHalf,14.);
  float a=1.-smoothstep(-10.,26.,d);
  vec2 fc=gl_FragCoord.xy/uDpr;
  float h=step(.6,fract((fc.x+fc.y)/6.5));
  gl_FragColor=vec4(uInk,a*(.08+.16*h)*uDraw);
}`;

// ------------------------------------------------------------------ colours

const fixed: Record<string, string> = {
  linen: "#efeee9",
  duvet: "#d6d8dc",
  throw: "#8e8b86",
  metal: "#2b2b2f",
  wood: "#a3713f",
  inside: "#dac8a6",
  slats: "#e3d2ab",
  cat: "#d98a43",
  catDark: "#9a5a26",
};

/** Any CSS colour (including color-mix results) to hex, via a 2D canvas. */
function cssColour(el: Element, name: string, fallback: string) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim() || fallback;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = fallback;
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// -------------------------------------------------------------------- form

function readState(form: HTMLFormElement): State {
  const q = <T extends Element = HTMLInputElement>(s: string) => form.querySelector(s) as T | null;
  const checked = (o: string) => !!q(`[data-o="${o}"]:checked`);
  const size = q(`input[data-o^="s"]:checked`)?.dataset.o ?? "s160";
  const num = (o: string, d: number) => Number(q(`[data-o="${o}"]`)?.value ?? d) || d;
  const shape = (["arc", "pads", "tuft", "chan"] as Shape3[]).find(checked) ?? "arc";
  const legs = (["metal", "plinth", "wood"] as Legs[]).find(checked) ?? "metal";
  return {
    headOnly: checked("head"),
    mattress: size === "sx" ? 160 : Number(size.slice(1)) || 160,
    customSize: size === "sx",
    shape,
    height: num("height", 110),
    wide: num("wide", 25),
    box: checked("box"),
    legs,
    colour: q(`input[data-hex]:checked`)?.dataset.hex || null,
    pillows: Number(q(`input[name="podglad-poduszki"]:checked`)?.value ?? 2),
    cat: !!q(`input[name="podglad-kot"]:checked`),
  };
}

// ------------------------------------------------------------------ mount

export function mount(root: HTMLElement) {
  const form = root.closest("form") as HTMLFormElement | null;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-canvas]");
  const dimsSvg = root.querySelector<SVGSVGElement>("[data-dims]");
  const dimsText = root.querySelector<HTMLElement>("[data-dims-text]");
  if (!form || !canvas || !dimsSvg) return;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return; // no WebGL: the flat SVG preview stays
  }
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1.6, 10, 5000);
  const res = new Vector2(1, 1);

  // Uniforms shared by every material: one object, so a single write updates all of them.
  const shared = {
    uPaper: { value: new Color("#ffffff") },
    uInk: { value: new Color("#16181d") },
    uLight: { value: new Vector3(-0.45, 1, 0.65).normalize() },
    uColA: { value: 0 },
    uColB: { value: 0 },
    uMix: { value: 1 },
    uDpr: { value: 1 },
    uDraw: { value: 0 },
    uRes: { value: res },
    uBoil: { value: 0 },
  };
  let fabricA = new Color("#ffffff");
  let fabricB = new Color("#ffffff");

  const fills = new Map<string, ShaderMaterial>();
  function fill(kind: string) {
    let m = fills.get(kind);
    if (m) return m;
    const tint = kind === "fabric" ? null : new Color(kind === "button" ? "#000000" : fixed[kind] ?? "#ffffff");
    m = new ShaderMaterial({
      uniforms: {
        ...shared,
        uTintA: { value: tint ?? fabricA },
        uTintB: { value: tint ?? fabricB },
        uGrain: { value: kind === "fabric" ? 1 : kind === "cat" ? 0.6 : 0 },
      },
      vertexShader: FILL_VERT,
      fragmentShader: FILL_FRAG,
    });
    if (kind === "button") m.uniforms.uTintA.value = m.uniforms.uTintB.value = new Color("#333333");
    fills.set(kind, m);
    return m;
  }
  const hull = new ShaderMaterial({
    uniforms: { ...shared, uPx: { value: 1.7 }, uShift: { value: new Vector2(0, 0) }, uAlpha: { value: 1 } },
    vertexShader: HULL_VERT,
    fragmentShader: HULL_FRAG,
    side: BackSide,
  });
  // Faint second line, slightly off, like the doubled pencil stroke on /realizacje/.
  const ghost = new ShaderMaterial({
    uniforms: { ...shared, uPx: { value: 0.8 }, uShift: { value: new Vector2(3, -2.5) }, uAlpha: { value: 0.3 } },
    vertexShader: HULL_VERT,
    fragmentShader: HULL_FRAG,
    side: BackSide,
    transparent: true,
    depthWrite: false,
  });
  const seamMat = new LineDashedMaterial({ color: 0x16181d, dashSize: 2.6, gapSize: 2.2, transparent: true, opacity: 0.55 });
  const floorMat = new ShaderMaterial({
    uniforms: { ...shared, uHalf: { value: new Vector2(100, 100) }, uCenter: { value: new Vector2(0, 0) } },
    vertexShader: FILL_VERT,
    fragmentShader: FLOOR_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const floor = new Mesh(new PlaneGeometry(1400, 1400).rotateX(-Math.PI / 2), floorMat);
  floor.position.y = 0.05;
  floor.renderOrder = -1;
  scene.add(floor);

  function readColours() {
    shared.uPaper.value.set(cssColour(root, "--bg", "#ffffff"));
    shared.uInk.value.set(cssColour(root, "--ink", "#16181d"));
    seamMat.color.copy(shared.uInk.value);
  }
  readColours();

  // -------------------------------------------------------------- builders

  let bed = new Group();
  scene.add(bed);
  const disposables: BufferGeometry[] = [];

  /** A solid part: paper/colour fill, ink outline and the ghost line. */
  function part(geo: BufferGeometry, kind: string, parent: Object3D, at?: [number, number, number]) {
    const g = new Group();
    const solid = new Mesh(geo, fill(kind));
    const outline = geo.clone();
    outline.deleteAttribute("normal");
    outline.deleteAttribute("uv");
    const smooth = mergeVertices(outline, 0.01);
    smooth.computeVertexNormals();
    g.add(solid, new Mesh(smooth, hull), new Mesh(smooth, ghost));
    disposables.push(geo, outline, smooth);
    if (at) g.position.set(...at);
    parent.add(g);
    return g;
  }

  const rbox = (w: number, h: number, d: number, r: number) =>
    new RoundedBoxGeometry(w, h, d, 4, Math.max(0.2, Math.min(r, w / 2 - 0.05, h / 2 - 0.05, d / 2 - 0.05)));

  function addSeam(points: number[], parent: Object3D) {
    const g = new BufferGeometry().setFromPoints(
      Array.from({ length: points.length / 3 }, (_, i) => new Vector3(points[i * 3], points[i * 3 + 1], points[i * 3 + 2])),
    );
    const line = new LineSegments(g, seamMat);
    line.computeLineDistances();
    disposables.push(g);
    parent.add(line);
    return line;
  }

  function pillowGeo(w: number, h: number, t: number) {
    const g = new BoxGeometry(w, h, t, 16, 12, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (w / 2);
      const y = p.getY(i) / (h / 2);
      const f = Math.max(0.1, (1 - x ** 4) * (1 - y ** 4)) ** 0.55;
      p.setZ(i, p.getZ(i) * f);
      p.setX(i, p.getX(i) * (1 - 0.05 * y * y));
      p.setY(i, p.getY(i) * (1 - 0.05 * x * x));
    }
    g.computeVertexNormals();
    return g;
  }

  function headboard(s: State, parent: Object3D, yb: number, wh: number) {
    const h = s.height - yb;
    const z = -L / 2 - HEAD_T / 2;
    const g = new Group();
    g.position.set(0, yb, z);
    parent.add(g);
    if (s.shape === "arc") {
      const bev = 5;
      const w = wh - 2 * bev;
      const hh = h - 2 * bev;
      const rt = Math.min(38, w * 0.24, hh * 0.45);
      const rb = 2;
      const sh = new Shape();
      sh.moveTo(-w / 2 + rb, 0);
      sh.lineTo(w / 2 - rb, 0);
      sh.quadraticCurveTo(w / 2, 0, w / 2, rb);
      sh.lineTo(w / 2, hh - rt);
      sh.quadraticCurveTo(w / 2, hh, w / 2 - rt, hh);
      sh.lineTo(-w / 2 + rt, hh);
      sh.quadraticCurveTo(-w / 2, hh, -w / 2, hh - rt);
      sh.lineTo(-w / 2, rb);
      sh.quadraticCurveTo(-w / 2, 0, -w / 2 + rb, 0);
      const depth = HEAD_T - 2 * bev;
      const geo = new ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 18 });
      geo.translate(0, bev, -depth / 2);
      part(geo, "fabric", g);
      addSeam([0, 6, HEAD_T / 2 + 0.2, 0, h - 3, HEAD_T / 2 + 0.2], g);
    } else if (s.shape === "pads") {
      const n = Math.max(2, Math.min(6, Math.round(wh / 62)));
      const pw = wh / n;
      for (let i = 0; i < n; i++) {
        const outer = i === 0 || i === n - 1;
        const ph = outer ? h : h - Math.min(9, h * 0.08);
        part(rbox(pw - 0.6, ph, HEAD_T + 3, Math.min(15, pw / 2.3)), "fabric", g, [-wh / 2 + pw * (i + 0.5), ph / 2, 0]);
      }
    } else if (s.shape === "chan") {
      const n = Math.max(4, Math.round(wh / 17));
      const pw = wh / n;
      for (let i = 0; i < n; i++) part(rbox(pw - 0.3, h, HEAD_T, Math.min(6, pw / 2.2)), "fabric", g, [-wh / 2 + pw * (i + 0.5), h / 2, 0]);
    } else {
      part(rbox(wh, h, HEAD_T, 6), "fabric", g, [0, h / 2, 0]);
      // diamond tufting above the mattress line
      const front = HEAD_T / 2 + 0.3;
      const top = h - 12;
      const bottom = Math.min(top - 20, (s.headOnly ? 12 : 60 - yb));
      const cols = Math.max(3, Math.round((wh - 24) / 22));
      const dx = (wh - 24) / cols;
      const rows = Math.max(2, Math.round((top - bottom) / 18));
      const dy = (top - bottom) / rows;
      const pts: [number, number][] = [];
      for (let r = 0; r <= rows; r++) {
        const off = r % 2 ? dx / 2 : 0;
        for (let c = 0; c <= cols - (r % 2 ? 1 : 0); c++) pts.push([-wh / 2 + 12 + off + c * dx, bottom + r * dy]);
      }
      const lines: number[] = [];
      for (const [x, y] of pts) {
        part(new SphereGeometry(1.3, 10, 8), "button", g, [x, y, front]);
        for (const [x2, y2] of pts) {
          if (Math.abs(y2 - y - dy) < 0.1 && Math.abs(Math.abs(x2 - x) - dx / 2) < 0.1) lines.push(x, y, front, x2, y2, front);
        }
      }
      addSeam(lines, g);
    }
    return g;
  }

  function cat(parent: Object3D, x: number, y: number, z: number) {
    const c = new Group();
    c.position.set(x, y, z);
    c.rotation.y = 0.7;
    parent.add(c);
    const body = part(new SphereGeometry(1, 20, 14), "cat", c, [0, 7, 0]);
    body.scale.set(20, 9, 15);
    const head = new Group();
    head.position.set(13, 8, 8);
    c.add(head);
    part(new SphereGeometry(6.5, 18, 12), "cat", head);
    for (const s of [-1, 1]) {
      const ear = part(new ConeGeometry(2.4, 5, 8), "catDark", head, [2 * s, 5.8, -0.5]);
      ear.rotation.z = -0.35 * s;
    }
    const tail = part(new TorusGeometry(17, 2.1, 8, 28, Math.PI * 0.95), "catDark", c, [0, 2.5, 0]);
    tail.rotation.x = Math.PI / 2;
    tail.rotation.z = 0.5;
    return { root: c, body };
  }

  // -------------------------------------------------------------- the bed

  let platform: Group | null = null;
  let struts: { mesh: Group; base: Vector3; tip: Vector3 }[] = [];
  let catBody: Group | null = null;
  let size = { w: 200, h: 110, l: 226, frameW: 186, wh: 210, legH: 13 };

  function build(s: State) {
    for (const g of disposables.splice(0)) g.dispose();
    scene.remove(bed);
    bed = new Group();
    scene.add(bed);
    platform = null;
    struts = [];
    catBody = null;

    const W = s.mattress;
    const wh = W + 2 * s.wide;
    const frameW = W + 2 * SIDE;
    const legH = s.legs === "plinth" ? 5 : 13;
    const yb = s.headOnly ? 10 : legH;
    headboard(s, bed, yb, wh);

    if (!s.headOnly) {
      const pads = s.shape === "pads";
      const railY = legH + RAIL / 2;
      // side rails and foot rail
      if (pads) {
        const n = 3;
        const seg = L / n;
        for (const sx of [-1, 1]) {
          for (let i = 0; i < n; i++) part(rbox(SIDE + 2, RAIL, seg - 0.4, 9), "fabric", bed, [sx * (W / 2 + SIDE / 2), railY, -L / 2 + seg * (i + 0.5)]);
        }
        const fw = (frameW + 2) / 3;
        for (let i = 0; i < 3; i++) part(rbox(fw - 0.5, RAIL + 1, SIDE + 5, 11), "fabric", bed, [-frameW / 2 - 1 + fw * (i + 0.5), railY, L / 2 + SIDE / 2 + 1]);
      } else {
        for (const sx of [-1, 1]) {
          part(rbox(SIDE, RAIL, L + 2, 6), "fabric", bed, [sx * (W / 2 + SIDE / 2), railY, 0]);
          addSeam([sx * (W / 2 + SIDE + 0.2), legH + 4, 0, sx * (W / 2 + SIDE + 0.2), legH + RAIL - 4, 0], bed);
        }
        part(rbox(frameW, RAIL, SIDE, 6.4), "fabric", bed, [0, railY, L / 2 + SIDE / 2]);
        addSeam([0, legH + 4, L / 2 + SIDE + 0.2, 0, legH + RAIL - 4, L / 2 + SIDE + 0.2], bed);
      }

      // legs
      const footZ = L / 2 + SIDE - 7;
      const backZ = -L / 2 - HEAD_T / 2;
      const legX = (frameW / 2) - 9;
      const backX = Math.min(frameW, wh) / 2 - 9;
      if (s.legs === "plinth") {
        part(rbox(frameW - 34, legH, L - 30, 1), "metal", bed, [0, legH / 2, 0]);
      } else {
        const geo = () => s.legs === "metal" ? new CylinderGeometry(1.5, 0.7, legH, 10) : new CylinderGeometry(2.6, 1.7, legH, 14);
        for (const [x, z] of [[-legX, footZ], [legX, footZ], [-backX, backZ], [backX, backZ]]) {
          const leg = part(geo(), s.legs, bed, [x, legH / 2, z]);
          if (s.legs === "metal") {
            leg.rotation.z = Math.sign(x) * 0.14;
            leg.rotation.x = Math.sign(z) * 0.08;
          }
        }
      }

      // storage box inside the frame
      const top = legH + RAIL - 5;
      if (s.box) {
        part(new BoxGeometry(W - 0.5, 1.2, L - 0.5), "inside", bed, [0, legH + 3, 0]);
        part(new BoxGeometry(1.6, RAIL - 12, L - 2), "inside", bed, [0, legH + 3 + (RAIL - 12) / 2, 0]);
      } else {
        part(new BoxGeometry(W - 0.5, 1, L - 0.5), "inside", bed, [0, top - 2, 0]);
      }

      // everything on the slatted frame, hinged at the head end
      platform = new Group();
      platform.position.set(0, top, -L / 2 + 1);
      bed.add(platform);
      const pl = new Group();
      pl.position.z = L / 2 - 1;
      platform.add(pl);
      const fw = W - 2;
      for (const sx of [-1, 1]) part(new BoxGeometry(3.5, 4, L - 2), "slats", pl, [sx * (fw / 2 - 1.75), -2, 0]);
      for (const sz of [-1, 1]) part(new BoxGeometry(fw, 4, 3.5), "slats", pl, [0, -2, sz * (L / 2 - 2.75)]);
      const nSlats = 13;
      for (let i = 0; i < nSlats; i++) part(new BoxGeometry(fw - 6, 1.2, 6.5), "slats", pl, [0, -0.6, -L / 2 + 10 + (i * (L - 20)) / (nSlats - 1)]);
      if (s.box) {
        for (const sx of [-1, 1]) {
          const mesh = part(new CylinderGeometry(1, 1, 1, 8), "metal", bed);
          struts.push({ mesh, base: new Vector3(sx * (W / 2 - 4), legH + 9, -L / 2 + 30), tip: new Vector3(sx * (fw / 2 - 5), -4, -L / 2 + 95) });
        }
      }

      const mT = 21;
      part(rbox(W - 1, mT, L - 1, 5), "linen", pl, [0, mT / 2 + 0.5, 0]);
      const dl = 148;
      const dz = L / 2 + 2 - dl / 2;
      part(rbox(W + 4, 5, dl, 2.4), "duvet", pl, [0, mT + 3, dz]);
      const fold = part(new CylinderGeometry(3.2, 3.2, W + 4, 14), "duvet", pl, [0, mT + 4.2, dz - dl / 2 + 1]);
      fold.rotation.z = Math.PI / 2;
      part(rbox(W + 14, 1.8, 46, 0.8), "throw", pl, [0, mT + 6.4, L / 2 - 36]);
      for (const sx of [-1, 1]) part(rbox(1.8, 20, 46, 0.8), "throw", pl, [sx * (W / 2 + 7), mT + 6.4 - 10, L / 2 - 36]);

      // pillows: sleeping pillows against the headboard, then decorative ones in the fabric
      const sleep = Math.min(s.pillows, W >= 140 ? 2 : 1);
      const deco = Math.min(3, s.pillows - sleep);
      const sw = sleep === 2 ? Math.min(70, W / 2 - 5) : Math.min(70, W - 14);
      for (let i = 0; i < sleep; i++) {
        const x = sleep === 2 ? (i ? 1 : -1) * (W / 4 - 1) : 0;
        const p = part(pillowGeo(sw, 48, 15), "linen", pl, [x, mT + 21, -L / 2 + 13]);
        p.rotation.x = -0.5;
      }
      const dw = Math.min(42, (W - 10) / Math.max(1, deco));
      for (let i = 0; i < deco; i++) {
        const x = (i - (deco - 1) / 2) * Math.min(W / deco, 50);
        const p = part(pillowGeo(dw, dw, 12), "fabric", pl, [x, mT + 18, -L / 2 + 30]);
        p.rotation.x = -0.35;
        p.rotation.z = (i - (deco - 1) / 2) * 0.06;
      }
      if (s.cat) catBody = cat(pl, W >= 120 ? W / 4 : 0, mT + 5.5, L / 2 - 75).body;
    }

    const lengthTotal = L + HEAD_T + (s.headOnly ? 0 : SIDE);
    size = { w: s.headOnly ? wh : Math.max(frameW, wh), h: s.height, l: s.headOnly ? HEAD_T : lengthTotal, frameW, wh, legH };
    floorMat.uniforms.uHalf.value.set(size.w / 2, s.headOnly ? 10 : lengthTotal / 2 - 6);
    floorMat.uniforms.uCenter.value.set(0, s.headOnly ? -L / 2 - HEAD_T / 2 + 4 : (SIDE - HEAD_T) / 2);
    if (dimsText) {
      dimsText.textContent = s.headOnly
        ? `Wezgłowie: szerokość ${wh} cm, wysokość ${s.height} cm.`
        : `Wymiary łóżka: szerokość ${size.w} cm, długość ${lengthTotal} cm, wysokość wezgłowia ${s.height} cm.`;
    }
  }

  // ------------------------------------------------------------ dimensions

  const SVGNS = "http://www.w3.org/2000/svg";
  const v = new Vector3();
  function px(x: number, y: number, z: number): [number, number] {
    v.set(x, y, z).project(camera);
    return [((v.x + 1) / 2) * cssW, ((1 - v.y) / 2) * cssH];
  }
  const centre = new Vector3();

  function dimension(a: [number, number, number], b: [number, number, number], label: string, ext: [number, number, number]) {
    const [x1, y1] = px(...a);
    const [x2, y2] = px(...b);
    const [e1x, e1y] = px(a[0] - ext[0], a[1] - ext[1], a[2] - ext[2]);
    const [e2x, e2y] = px(b[0] - ext[0], b[1] - ext[1], b[2] - ext[2]);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const t = 6;
    const tick = (x: number, y: number) => `M${x - nx * t + (dx / len) * 3} ${y - ny * t + (dy / len) * 3}L${x + nx * t - (dx / len) * 3} ${y + ny * t - (dy / len) * 3}`;
    const [cx, cy] = px(centre.x, centre.y, centre.z);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const away = Math.sign(nx * (mx - cx) + ny * (my - cy)) || 1;
    const half = label.length * 4.4 + 6;
    const lx = Math.min(cssW - half, Math.max(half, mx + nx * away * 16));
    const ly = Math.min(cssH - 6, Math.max(16, my + ny * away * 16 + 5));
    return `<path d="M${x1} ${y1}L${x2} ${y2}${tick(x1, y1)}${tick(x2, y2)}M${e1x} ${e1y}L${x1} ${y1}M${e2x} ${e2y}L${x2} ${y2}" opacity="0.9"/><text x="${lx}" y="${ly}" text-anchor="middle">${label}</text>`;
  }

  function drawDims(s: State, side: number) {
    const head = -L / 2 - HEAD_T;
    const parts: string[] = [];
    const topY = s.height + 12;
    parts.push(dimension([-size.wh / 2, topY, -L / 2 - HEAD_T / 2], [size.wh / 2, topY, -L / 2 - HEAD_T / 2], `${size.wh} cm`, [0, 9, 0]));
    const hx = side * (size.wh / 2 + 14);
    parts.push(dimension([hx, 0, head], [hx, s.height, head], `${s.height} cm`, [side * 11, 0, 0]));
    if (!s.headOnly) {
      const foot = L / 2 + SIDE;
      const sx = side * (size.w / 2 + 22);
      parts.push(dimension([sx, 0, head], [sx, 0, foot], `${size.l} cm`, [side * 19, 0, 0]));
      const fz = foot + 24;
      const mat = s.customSize ? "materac na wymiar" : `materac ${s.mattress}`;
      const short = cssW < 560;
      parts.push(dimension([-size.frameW / 2, 0, fz], [size.frameW / 2, 0, fz], short ? `${size.frameW} cm` : `${size.frameW} cm (${mat})`, [0, 0, 21]));
    }
    dimsSvg!.innerHTML = parts.join("");
  }

  // ---------------------------------------------------------------- loop

  let cssW = 800;
  let cssH = 500;
  function resize() {
    const r = root.getBoundingClientRect();
    cssW = Math.max(1, r.width);
    cssH = Math.max(1, r.height);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssW, cssH, false);
    renderer.getDrawingBufferSize(res);
    shared.uDpr.value = dpr;
    hull.uniforms.uPx.value = 1.8 * dpr;
    ghost.uniforms.uPx.value = 0.8 * dpr;
    ghost.uniforms.uShift.value.set(3 * dpr, -2.5 * dpr);
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
    dimsSvg!.setAttribute("viewBox", `0 0 ${cssW} ${cssH}`);
    dirty = true;
  }

  let state = readState(form);
  let colourKey = state.colour;
  if (state.colour) {
    fabricA.set(state.colour);
    fabricB.set(state.colour);
    shared.uColA.value = shared.uColB.value = 1;
  }
  build(state);

  let dirty = true;
  let rebuild = false;
  const onChange = () => {
    rebuild = true;
    if (!running) frame(performance.now());
  };
  form.addEventListener("input", onChange);
  form.addEventListener("change", (e) => {
    if ((e.target as HTMLInputElement).dataset?.o === "box" && (e.target as HTMLInputElement).checked) liftStart = clock - 7.6;
    onChange();
  });

  function applyColour(next: string | null) {
    if (next === colourKey) return;
    // whatever is showing now becomes the "from" layer, the new colour washes over it
    const showingB = shared.uMix.value > 0.5;
    fabricA.copy(showingB ? fabricB : fabricA);
    shared.uColA.value = showingB ? shared.uColB.value : shared.uColA.value;
    if (next) fabricB.set(next);
    shared.uColB.value = next ? 1 : 0;
    shared.uMix.value = reduced.matches ? 1 : 0;
    colourKey = next;
  }

  let clock = 0;
  let last = performance.now();
  let liftStart = -100;
  let camDist = 0;
  let visible = true;
  let running = false;
  let ready = false;
  const up = new Vector3(0, 1, 0);
  const tipW = new Vector3();
  const dir = new Vector3();

  function lift(t: number) {
    // closed 8 s, opens 1.6 s, stays open 2.4 s, closes 1.6 s
    const c = (t - liftStart) % 14;
    const ease = (x: number) => x * x * (3 - 2 * x);
    if (c < 8) return 0;
    if (c < 9.6) return ease((c - 8) / 1.6);
    if (c < 12) return 1;
    if (c < 13.6) return 1 - ease((c - 12) / 1.6);
    return 0;
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const still = reduced.matches;
    clock += dt;

    if (rebuild) {
      rebuild = false;
      const next = readState(form!);
      applyColour(next.colour);
      if (JSON.stringify({ ...next, colour: 0 }) !== JSON.stringify({ ...state, colour: 0 })) build(next);
      state = next;
      dirty = true;
    }

    shared.uDraw.value = still ? 1 : Math.min(1, shared.uDraw.value + dt / 1.2);
    if (shared.uMix.value < 1) shared.uMix.value = Math.min(1, shared.uMix.value + dt / 1.3);
    shared.uBoil.value = still ? 0 : Math.floor(clock * 5);

    // camera sways slowly from one side to the other, around a 3/4 view
    const az = 0.6 + (still ? 0 : 0.55 * Math.sin(clock * ((2 * Math.PI) / 26)));
    const el = 0.3 + (still ? 0 : 0.04 * Math.sin(clock * 0.21));
    const r = 0.5 * Math.hypot(size.w, size.h, size.l + 40);
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const want = (r / Math.sin(Math.min(vfov, hfov) / 2)) * (cssW < 560 ? 1.08 : 0.95);
    camDist = camDist ? camDist + (want - camDist) * (still ? 1 : Math.min(1, dt * 4)) : want;
    centre.set(0, state.headOnly ? state.height / 2 : Math.max(38, state.height * 0.4), state.headOnly ? -L / 2 : 0);
    camera.position.set(
      centre.x + camDist * Math.cos(el) * Math.sin(az),
      centre.y + camDist * Math.sin(el),
      centre.z + camDist * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(centre);

    if (platform) {
      const a = still || !state.box ? 0 : lift(clock) * 0.62;
      platform.rotation.x = -a;
      platform.updateMatrixWorld(true);
      for (const s of struts) {
        s.mesh.visible = a > 0.01;
        if (!s.mesh.visible) continue;
        tipW.copy(s.tip);
        platform.children[0].localToWorld(tipW);
        bed.worldToLocal(tipW);
        dir.subVectors(tipW, s.base);
        s.mesh.position.copy(s.base).addScaledVector(dir, 0.5);
        s.mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
        s.mesh.scale.set(1, dir.length(), 1);
      }
    }
    if (catBody && !still) catBody.scale.y = 9 * (1 + 0.035 * Math.sin(clock * 2.4));

    renderer.render(scene, camera);
    drawDims(state, Math.sin(az) >= 0 ? 1 : -1);
    if (!ready) {
      ready = true;
      root.dataset.ready = "";
    }
    dirty = false;

    const animating = !still || shared.uMix.value < 1 || shared.uDraw.value < 1 || Math.abs(want - camDist) > 0.5;
    running = visible && !document.hidden && (animating || dirty || rebuild);
    if (running) requestAnimationFrame(frame);
  }

  const wake = () => {
    if (!running && visible && !document.hidden) {
      last = performance.now();
      running = true;
      requestAnimationFrame(frame);
    }
  };
  new ResizeObserver(() => {
    resize();
    wake();
  }).observe(root);
  new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
    wake();
  }).observe(root);
  document.addEventListener("visibilitychange", wake);
  reduced.addEventListener("change", wake);
  new MutationObserver(() => {
    readColours();
    dirty = true;
    wake();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-design"] });

  resize();
  wake();
}
