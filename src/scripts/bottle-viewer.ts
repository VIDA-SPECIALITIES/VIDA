/* =========================================================================
   VIDA Collection: 360° bottle viewer (three.js, client-side WebGL only).
   Ported from reference/vida-collection-360.html. No API keys, tokens or
   remote configuration are used; three.js is bundled from npm.

   Loaded lazily by CollectionSection.astro when the section approaches the
   viewport: `const { mountCollection } = await import('…/bottle-viewer')`.
   ========================================================================= */
import * as THREE from 'three';
import lockupSvg from '../assets/brand/vida-logo-lockup.svg?raw';
import { VIDA_VARIANT_MAP, type VariantKey, type VidaVariant } from '../data/vida-variants';

const TAU = Math.PI * 2;
// The site's self-hosted fonts (Fontsource variable families), not Google Fonts.
const SERIF = '"Cormorant Garamond Variable", "Cormorant Garamond", Garamond, "Times New Roman", serif';
const SANS = '"Montserrat Variable", Montserrat, "Helvetica Neue", Arial, sans-serif';

/* ---------- Bottle geometry (traced from the Living Curve render) ----------
   [y px from image top, half-width px]; base sits at y = 1312, 100 px = 1 unit. */
const TRACE: ReadonlyArray<readonly [number, number]> = [
  [1310, 145], [1306, 150], [1300, 154.5], [1292, 157], [1283, 159.5], [1272, 161.5], [1248, 164], [1224, 164.5],
  [1200, 162.5], [1176, 160], [1152, 156.5], [1128, 152.5], [1104, 148.5], [1080, 143.5], [1056, 138.5], [1032, 134.5],
  [1008, 132], [984, 129.5], [960, 128], [936, 127], [912, 126.5], [888, 127], [864, 128], [840, 130], [816, 132.5],
  [792, 135], [768, 138], [744, 141], [720, 143.5], [696, 146], [672, 148.5], [648, 150.5], [624, 152], [600, 152.5],
  [576, 152], [552, 150.5], [528, 147.5], [504, 143], [480, 137.5], [456, 130.5], [432, 122], [408, 112.5], [384, 103.5],
  [360, 95.5], [336, 88], [312, 81], [288, 75], [264, 70], [240, 66], [216, 62.5], [192, 59.5], [168, 57.8], [140, 57],
  [122, 57.2], [114, 59.5], [108, 65.5], [101, 66.5], [95, 63.5], [90, 58.5], [86, 56],
];
const BASE_Y = 1312;
const GLASS_TOP = (BASE_Y - 86) / 100; // 12.26
const CAP_BOTTOM = 12.22;
const CAP_TOP = 12.94;
const SLEEVE_LO = (BASE_Y - 1105) / 100;
const SLEEVE_HI = (BASE_Y - 855) / 100;
const EMBOSS_LO = 5.02;
const EMBOSS_HI = 8.26;
const BOTTLE_CENTER_Y = CAP_TOP / 2;
const PITCH_MAX = 1.48;
const UNDERSIDE_V = 0.0125;
const VIEWS: Record<string, number> = { side: 0, top: 1.4, base: -1.4 };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function glassProfile(): THREE.Vector2[] {
  const pts = (
    [
      [0, 0.13], [0.55, 0.095], [1.0, 0.035], [1.28, 0.004], [1.36, 0.0], [1.42, 0.012],
    ] as const
  ).map(([r, h]) => new THREE.Vector3(r, h, 0));
  for (const [y, hw] of TRACE) pts.push(new THREE.Vector3(hw / 100, (BASE_Y - y) / 100, 0));
  pts.push(new THREE.Vector3(0.53, GLASS_TOP + 0.005, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return curve.getSpacedPoints(340).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
}

/** v follows height so textures map to real units. */
function setUVv(geo: THREE.BufferGeometry, lo: number, hi: number) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) - lo) / (hi - lo));
  uv.needsUpdate = true;
}

/** Outer radius at height h (above the base). */
function radiusAt(profile: THREE.Vector2[], h: number): number {
  for (let i = 8; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    if ((a.y - h) * (b.y - h) <= 0 && a.y !== b.y) return a.x + ((b.x - a.x) * (h - a.y)) / (b.y - a.y);
  }
  return 1.3;
}

/* ---------- Procedural textures ---------- */
function worleyTile(size: number, cells: number, seed = 7): Float32Array {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const g = Math.round(Math.sqrt(cells));
  const cs = size / g;
  const P: [number, number][] = [];
  for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) P.push([(i + rnd()) * cs, (j + rnd()) * cs]);
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const gi = Math.floor(x / cs);
      const gj = Math.floor(y / cs);
      let d1 = 1e9;
      let d2 = 1e9;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const ii = (gi + di + g) % g;
          const jj = (gj + dj + g) % g;
          const p = P[jj * g + ii];
          const dx = p[0] + (gi + di - ii) * cs - x;
          const dy = p[1] + (gj + dj - jj) * cs - y;
          const d = dx * dx + dy * dy;
          if (d < d1) {
            d2 = d1;
            d1 = d;
          } else if (d < d2) d2 = d;
        }
      out[y * size + x] = Math.min(1, (Math.sqrt(d2) - Math.sqrt(d1)) / (cs * 0.32));
    }
  return out;
}

function tileCanvas(field: Float32Array, size: number, fn: (v: number) => [number, number, number, number]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < field.length; i++) {
    const [r, g, b, a] = fn(field[i]);
    const k = i * 4;
    img.data[k] = r;
    img.data[k + 1] = g;
    img.data[k + 2] = b;
    img.data[k + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  const chars = [...text];
  return chars.reduce((a, ch) => a + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
}
function spacedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const total = spacedWidth(ctx, text, spacing);
  let cx = x - total / 2;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = prev;
  return total;
}

/* ---------- Official VIDA lockup (traced 1:1 from the logo PDF) ----------
   Drawn from the same SVG the site uses, never redrawn or retyped. */
const LOCKUP = (() => {
  const vb = /viewBox="([^"]+)"/.exec(lockupSvg)?.[1].split(/\s+/).map(Number) ?? [0, 0, 1, 1];
  const paths = [...lockupSvg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  return { x: vb[0], y: vb[1], w: vb[2], h: vb[3], paths };
})();
let lockupPaths: Path2D[] | null = null;
function drawLockup(ctx: CanvasRenderingContext2D, cx: number, top: number, height: number, color: string) {
  lockupPaths ??= LOCKUP.paths.map((d) => new Path2D(d));
  const s = height / LOCKUP.h;
  ctx.save();
  ctx.translate(cx - (LOCKUP.w * s) / 2, top);
  ctx.scale(s, s);
  ctx.translate(-LOCKUP.x, -LOCKUP.y);
  ctx.fillStyle = color;
  for (const p of lockupPaths) ctx.fill(p, 'evenodd');
  ctx.restore();
}

/* Glass maps: bump (frost crackle + raised VIDA), and R = transmission, G = roughness */
function buildGlassMaps(profile: THREE.Vector2[], crackle: Float32Array) {
  const W = 2048;
  const H = 4096;
  const unitsY = H / GLASS_TOP;
  const embossR = radiusAt(profile, (EMBOSS_LO + EMBOSS_HI) / 2);
  const unitsX = W / (TAU * embossR);
  const frostTop = (1 - 0.47) * H;
  const frostFull = (1 - 0.3) * H;
  const tileStretch = unitsY / unitsX;

  const paintFrost = (ctx: CanvasRenderingContext2D, tile: HTMLCanvasElement) => {
    const layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;
    const l = layer.getContext('2d')!;
    const pat = l.createPattern(tile, 'repeat')!;
    pat.setTransform(new DOMMatrix().scale(0.42, 0.42 * tileStretch));
    l.fillStyle = pat;
    l.fillRect(0, frostTop - 20, W, H - frostTop + 20);
    const m = l.createLinearGradient(0, frostTop, 0, frostFull);
    m.addColorStop(0, 'rgba(0,0,0,0)');
    m.addColorStop(0.35, 'rgba(0,0,0,.35)');
    m.addColorStop(0.8, '#000');
    m.addColorStop(1, '#000');
    l.globalCompositeOperation = 'destination-in';
    l.fillStyle = m;
    l.fillRect(0, 0, W, H);
    ctx.drawImage(layer, 0, 0);
  };

  const embossPath = (ctx: CanvasRenderingContext2D, draw: (c: CanvasRenderingContext2D, spacing: number) => void) => {
    const cy = (1 - (EMBOSS_LO + EMBOSS_HI) / 2 / GLASS_TOP) * H;
    const len = EMBOSS_HI - EMBOSS_LO;
    ctx.save();
    ctx.translate(W / 2, cy);
    ctx.scale(1, unitsY / unitsX);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `500 ${0.98 * unitsX}px ${SERIF}`;
    ctx.textBaseline = 'middle';
    const base = spacedWidth(ctx, 'VIDA', 0);
    draw(ctx, Math.max(0, (len * unitsX - base) / 3));
    ctx.restore();
  };

  const bump = document.createElement('canvas');
  bump.width = W;
  bump.height = H;
  const b = bump.getContext('2d')!;
  b.fillStyle = '#000';
  b.fillRect(0, 0, W, H);
  paintFrost(b, tileCanvas(crackle, 512, (v) => {
    const g = 30 + 200 * Math.pow(v, 0.45);
    return [g, g, g, 255];
  }));
  b.fillStyle = '#000';
  b.fillRect(0, H * (1 - UNDERSIDE_V), W, H * UNDERSIDE_V + 1); // keep the underside smooth
  b.filter = 'blur(1.5px)';
  embossPath(b, (ctx, sp) => {
    ctx.fillStyle = '#fff';
    spacedText(ctx, 'VIDA', 0, -0.07 * unitsX, sp);
  });
  b.filter = 'none';

  const mat = document.createElement('canvas');
  mat.width = W;
  mat.height = H;
  const m = mat.getContext('2d')!;
  m.fillStyle = 'rgb(255,8,0)';
  m.fillRect(0, 0, W, H);
  paintFrost(m, tileCanvas(crackle, 512, (v) => [Math.round(210 + 42 * v), Math.round(112 - 80 * v), 0, 255]));
  m.fillStyle = 'rgb(255,8,0)';
  m.fillRect(0, H * (1 - UNDERSIDE_V), W, H * UNDERSIDE_V + 1);
  embossPath(m, (ctx, sp) => {
    ctx.fillStyle = 'rgb(236,40,0)';
    spacedText(ctx, 'VIDA', 0, -0.07 * unitsX, sp);
    ctx.strokeStyle = 'rgb(205,70,0)';
    ctx.lineWidth = 5;
    let x = -spacedWidth(ctx, 'VIDA', sp) / 2;
    ctx.textAlign = 'left';
    for (const ch of 'VIDA') {
      ctx.strokeText(ch, x, -0.07 * unitsX);
      x += ctx.measureText(ch).width + sp;
    }
  });
  return { bump, mat };
}

function buildCapBump() {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#808080';
  x.fillRect(0, 0, 2048, 256);
  const ribs = 132;
  const w = 2048 / ribs;
  const top = 256 * (1 - 0.86);
  const bottom = 256 * (1 - 0.24);
  for (let i = 0; i < ribs; i++) {
    const g = x.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    g.addColorStop(0, '#202020');
    g.addColorStop(0.5, '#f0f0f0');
    g.addColorStop(1, '#202020');
    x.fillStyle = g;
    x.fillRect(i * w, top, w, bottom - top);
  }
  x.fillStyle = '#3a3a3a';
  x.fillRect(0, bottom + 4, 2048, 5); // tamper-band groove
  return c;
}

/** V monogram + fine rings, as in the Design Codex top view. */
function buildCapTopBump() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d')!;
  x.fillStyle = '#808080';
  x.fillRect(0, 0, 1024, 1024);
  x.strokeStyle = '#6a6a6a';
  x.lineWidth = 6;
  for (const r of [490, 470]) {
    x.beginPath();
    x.arc(512, 512, r, 0, TAU);
    x.stroke();
  }
  x.filter = 'blur(3px)';
  x.strokeStyle = '#f2f2f2';
  x.lineWidth = 26;
  x.lineJoin = 'miter';
  x.beginPath();
  x.moveTo(372, 352);
  x.lineTo(512, 672);
  x.lineTo(652, 352);
  x.stroke();
  x.filter = 'none';
  return c;
}

/** Sleeve artwork. Only approved / validated text (see src/data/vida-variants.ts). */
function buildLabel(v: VidaVariant, profile: THREE.Vector2[]) {
  const avgR =
    (radiusAt(profile, SLEEVE_LO + 0.3) + radiusAt(profile, SLEEVE_HI - 0.3) + radiusAt(profile, (SLEEVE_LO + SLEEVE_HI) / 2)) / 3 +
    0.012;
  const W = 4096;
  const H = Math.round((W * (SLEEVE_HI - SLEEVE_LO)) / (TAU * avgR));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const k = H / 1230;
  const cx = W / 2;

  const base = new THREE.Color(v.sleeve);
  const lighter = base.clone().lerp(new THREE.Color('#ffffff'), 0.12);
  const darker = base.clone().lerp(new THREE.Color('#000000'), 0.06);
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#' + lighter.getHexString());
  g.addColorStop(1, '#' + darker.getHexString());
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  x.fillStyle = v.sleeveText;
  x.textBaseline = 'alphabetic';
  x.textAlign = 'center';
  const sans = (wt: number, px: number) => `${wt} ${Math.round(px * k)}px ${SANS}`;

  // Official lockup: VIDA + SPECIALITIES LIMITED
  drawLockup(x, cx, 70 * k, 124 * k, v.sleeveText);
  x.font = sans(300, 168);
  spacedText(x, v.name, cx, 392 * k, 30 * k);
  x.font = sans(600, 38);
  spacedText(x, v.label.descriptor.toUpperCase(), cx, 482 * k, 6 * k);
  x.globalAlpha = 0.55;
  x.fillRect(cx - 330 * k, 512 * k, 660 * k, 2.4 * k);
  x.globalAlpha = 0.88;
  x.font = sans(400, 31);
  spacedText(x, v.label.secondary.toUpperCase(), cx, 570 * k, 5 * k);
  x.globalAlpha = 1;
  let y = 640;
  for (const line of v.label.extra) {
    x.font = sans(500, 29);
    spacedText(x, line, cx, y * k, 3 * k);
    y += 44;
  }

  const tagY = Math.min((y + 90) * k, H - 80 * k);
  const tag = 'SAMPLE CONCEPT  ·  NOT FOR SALE';
  x.font = sans(600, 28);
  const tw = spacedWidth(x, tag, 5 * k);
  spacedText(x, tag, cx, tagY, 5 * k);
  x.strokeStyle = v.sleeveText;
  x.globalAlpha = 0.75;
  x.lineWidth = 2.4 * k;
  x.strokeRect(cx - tw / 2 - 26 * k, tagY - 40 * k, tw + 52 * k, 58 * k);
  x.globalAlpha = 1;

  // Back panel (seen mid-turn): the lockup, wrapping across the seam.
  for (const bx of [0, W]) drawLockup(x, bx, H * 0.36, 150 * k, v.sleeveText);
  x.fillStyle = 'rgba(255,255,255,.28)';
  x.fillRect(0, 0, W, 3 * k);
  x.fillRect(0, H - 3 * k, W, 3 * k);
  return c;
}

function shadowCanvas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(20,28,40,.42)');
  g.addColorStop(0.45, 'rgba(20,28,40,.16)');
  g.addColorStop(1, 'rgba(20,28,40,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return c;
}

async function loadFonts() {
  const want = [
    `300 40px ${SANS}`, `400 40px ${SANS}`, `500 40px ${SANS}`, `600 40px ${SANS}`, `500 40px ${SERIF}`,
  ];
  await Promise.race([
    Promise.all(want.map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 2500)),
  ]).catch(() => {});
}

/* ---------- Shared assets (built once per mount) ---------- */
interface Shared {
  glassGeo: THREE.LatheGeometry;
  capGeo: THREE.LatheGeometry;
  capTopGeo: THREE.CircleGeometry;
  sleeveGeo: THREE.LatheGeometry;
  glassMat: THREE.MeshPhysicalMaterial;
  capMats: Record<VariantKey, THREE.MeshPhysicalMaterial>;
  capTopMats: Record<VariantKey, THREE.MeshPhysicalMaterial>;
  sleeveMats: Record<VariantKey, THREE.MeshPhysicalMaterial>;
  shadowTex: THREE.Texture;
  textures: THREE.Texture[];
}

function buildShared(): Shared {
  const profile = glassProfile();
  const crackle = worleyTile(512, 400);
  const textures: THREE.Texture[] = [];
  const mk = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    textures.push(t);
    return t;
  };

  const glassGeo = new THREE.LatheGeometry(profile, 128, Math.PI, TAU);
  setUVv(glassGeo, 0, GLASS_TOP);
  const capPts = (
    [
      [0.56, CAP_BOTTOM], [0.655, CAP_BOTTOM + 0.015], [0.665, CAP_BOTTOM + 0.06], [0.665, CAP_TOP - 0.08],
      [0.655, CAP_TOP - 0.03], [0.625, CAP_TOP - 0.004], [0.4, CAP_TOP], [0, CAP_TOP + 0.002],
    ] as const
  ).map(([r, h]) => new THREE.Vector2(r, h));
  const capGeo = new THREE.LatheGeometry(capPts, 160, Math.PI, TAU);
  setUVv(capGeo, CAP_BOTTOM, CAP_TOP);
  const sleevePts: THREE.Vector2[] = [];
  for (let i = 0; i <= 48; i++) {
    const h = SLEEVE_LO + ((SLEEVE_HI - SLEEVE_LO) * i) / 48;
    sleevePts.push(new THREE.Vector2(radiusAt(profile, h) + 0.014, h));
  }
  const sleeveGeo = new THREE.LatheGeometry(sleevePts, 160, Math.PI, TAU);
  setUVv(sleeveGeo, SLEEVE_LO, SLEEVE_HI);

  const maps = buildGlassMaps(profile, crackle);
  const bumpTex = mk(maps.bump, false);
  const matTex = mk(maps.mat, false);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 1, roughnessMap: matTex,
    transmission: 1, transmissionMap: matTex, thickness: 0.12, ior: 1.5,
    attenuationColor: new THREE.Color('#eef6f3'), attenuationDistance: 4,
    bumpMap: bumpTex, bumpScale: 3, specularIntensity: 1, envMapIntensity: 1.1,
    side: THREE.DoubleSide,
  });
  // Clear glass reads by its walls: darken where the surface turns away from the
  // viewer (the wall seen edge-on), as in the studio photography.
  glassMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNy;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvObjNy = objectNormal.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNy;')
      .replace(
        '#include <dithering_fragment>',
        `float ndv = abs(dot(normalize(vNormal), normalize(vViewPosition)));
        float wall = 1.0 - smoothstep(0.05, 0.45, ndv);
        float inner = smoothstep(0.36, 0.5, ndv) * (1.0 - smoothstep(0.5, 0.66, ndv));
        float heel = (1.0 - smoothstep(0.004, 0.03, vBumpMapUv.y)) * smoothstep(-0.7, -0.25, vObjNy);
        gl_FragColor.rgb *= (1.0 - 0.74 * wall) * (1.0 - 0.45 * heel);
        gl_FragColor.rgb += 0.05 * inner;
        #include <dithering_fragment>`,
      );
  };

  const capBump = mk(buildCapBump(), false);
  const capTopBump = mk(buildCapTopBump(), false);
  const capTopGeo = new THREE.CircleGeometry(0.6, 96);
  const capMats = {} as Shared['capMats'];
  const capTopMats = {} as Shared['capTopMats'];
  const sleeveMats = {} as Shared['sleeveMats'];
  for (const v of Object.values(VIDA_VARIANT_MAP)) {
    capMats[v.key] = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(v.cap), metalness: 0.45, roughness: 0.42, bumpMap: capBump, bumpScale: 3,
      clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 1,
    });
    capTopMats[v.key] = capMats[v.key].clone();
    capTopMats[v.key].bumpMap = capTopBump;
    capTopMats[v.key].bumpScale = 4;
    sleeveMats[v.key] = new THREE.MeshPhysicalMaterial({
      map: mk(buildLabel(v, profile), true), roughness: 0.5, metalness: 0,
      clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.25, sheenRoughness: 0.8, envMapIntensity: 0.7,
    });
  }
  const shadowTex = mk(shadowCanvas(), true);
  return { glassGeo, capGeo, capTopGeo, sleeveGeo, glassMat, capMats, capTopMats, sleeveMats, shadowTex, textures };
}

/** Dim studio with tall softbox strips: crisp vertical highlights and dark edges. */
function studioEnvironment() {
  const env = new THREE.Scene();
  env.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(30, 30, 30),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.07, 0.072, 0.075), side: THREE.BackSide }),
    ),
  );
  const panel = (w: number, h: number, power: number, pos: [number, number, number], look: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  panel(2.2, 16, 5, [-7, 2, 3], [0, 2, 0]);
  panel(2.2, 16, 4, [7, 2, 2], [0, 2, 0]);
  panel(10, 10, 2.2, [0, 12, 0], [0, 0, 0]);
  panel(9, 9, 1.1, [0, 1, 12], [0, 1, 0]);
  panel(14, 6, 0.6, [0, -6, -10], [0, 0, 0]);
  return env;
}

/* ---------- Viewer per card ---------- */
class Viewer {
  card: HTMLElement;
  key: VariantKey;
  stage: HTMLElement;
  trace: SVGPathElement;
  deg: HTMLElement;
  viewBtns: HTMLButtonElement[];
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  pivot: THREE.Group;
  bottle: THREE.Group;
  sleeve: THREE.Mesh;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  envTex: THREE.Texture;
  angle = 0;
  vel = 0;
  pitch = 0;
  pitchTarget = 0;
  spin: { t0: number; from: number; to: number; dur: number } | null = null;
  drag = false;
  visible = true;
  dirty = true;
  turning = false;
  private cleanups: (() => void)[] = [];

  constructor(card: HTMLElement, shared: Shared, private ctx: Context) {
    this.card = card;
    this.key = card.dataset.variant as VariantKey;
    this.stage = card.querySelector<HTMLElement>('[data-stage]')!;
    this.trace = card.querySelector<SVGPathElement>('.trace')!;
    this.deg = card.querySelector<HTMLElement>('.degrees')!;
    this.viewBtns = [...card.querySelectorAll<HTMLButtonElement>('[data-view]')];

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    this.stage.prepend(canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    const onLost = (e: Event) => {
      e.preventDefault();
      this.card.classList.add('fallback');
      this.card.classList.remove('ready');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    this.cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost));

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTex = pmrem.fromScene(studioEnvironment(), 0.02).texture;
    this.scene.environment = this.envTex;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-4, 10, 8);
    this.scene.add(key, new THREE.HemisphereLight(0xffffff, 0xd8d4d0, 0.9));

    this.pivot = new THREE.Group();
    this.pivot.position.y = BOTTLE_CENTER_Y;
    this.bottle = new THREE.Group();
    this.bottle.position.y = -BOTTLE_CENTER_Y;
    this.bottle.add(new THREE.Mesh(shared.glassGeo, shared.glassMat));
    this.bottle.add(new THREE.Mesh(shared.capGeo, shared.capMats[this.key]));
    const capTop = new THREE.Mesh(shared.capTopGeo, shared.capTopMats[this.key]);
    capTop.rotation.x = -Math.PI / 2;
    capTop.position.y = CAP_TOP + 0.004;
    this.bottle.add(capTop);
    this.sleeve = new THREE.Mesh(shared.sleeveGeo, shared.sleeveMats[this.key]);
    this.sleeve.visible = ctx.sleeveOn;
    this.bottle.add(this.sleeve);
    this.pivot.add(this.bottle);
    this.scene.add(this.pivot);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.2),
      new THREE.MeshBasicMaterial({ map: shared.shadowTex, transparent: true, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.002;
    this.scene.add(this.shadow);

    this.camera = new THREE.PerspectiveCamera(20, 0.8, 1, 200);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.stage);
    const io = new IntersectionObserver(
      ([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.dirty = true;
      },
      { rootMargin: '120px' },
    );
    io.observe(this.stage);
    this.cleanups.push(() => ro.disconnect(), () => io.disconnect());
    this.bind();
    this.resize();
  }

  /** Background matches the card's tint (read from the stage's CSS background). */
  paintBackground() {
    const bg = getComputedStyle(this.stage).backgroundColor || '#eeeeee';
    this.renderer.setClearColor(new THREE.Color().setStyle(bg, THREE.SRGBColorSpace), 1);
    this.dirty = true;
  }

  resize() {
    const w = this.stage.clientWidth;
    const h = this.stage.clientHeight;
    if (!w || !h) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.ctx.coarse ? 1.75 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.paintBackground();
  }

  startSpin() {
    if (this.spin || this.ctx.reduceMotion) return;
    const from = this.angle;
    const front = Math.round(from / TAU) * TAU;
    this.vel = 0;
    this.drag = false;
    this.spin = { t0: performance.now(), from, to: front + TAU, dur: 2600 };
    this.dirty = true;
  }

  private on<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) {
    el.addEventListener(type, fn);
    this.cleanups.push(() => el.removeEventListener(type, fn));
  }

  bind() {
    const { card, stage } = this;
    this.on(card, 'pointerenter', (e) => {
      if (e.pointerType === 'mouse') this.startSpin();
    });
    this.on(card, 'keydown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startSpin();
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.setPitch(this.pitchTarget + (e.key === 'ArrowDown' ? 0.35 : -0.35));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.spin = null;
        this.vel = (e.key === 'ArrowRight' ? 1 : -1) * 0.09;
        this.dirty = true;
      }
    });
    for (const b of this.viewBtns) this.on(b, 'click', () => this.setPitch(VIEWS[b.dataset.view ?? 'side']));

    type Down = { id: number; x: number; y: number; lastX: number; lastY: number; lastT: number; moved: boolean; type: string; mode?: 'turn' | 'tilt' };
    let down: Down | null = null;
    this.on(stage, 'pointerdown', (e) => {
      if (e.button !== 0) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), moved: false, type: e.pointerType };
    });
    this.on(stage, 'pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (!down.moved) {
        if (Math.abs(dx) >= 6 && Math.abs(dx) >= Math.abs(dy)) down.mode = 'turn';
        else if (down.type === 'mouse' && Math.abs(dy) >= 6) down.mode = 'tilt';
        else return;
        down.moved = true;
        down.lastY = e.clientY;
        if (down.mode === 'turn') {
          this.spin = null;
          this.drag = true;
        }
        stage.setPointerCapture(e.pointerId);
        stage.classList.add('dragging');
      }
      if (down.mode === 'tilt') {
        this.setPitch(this.pitchTarget + (e.clientY - down.lastY) * (Math.PI / Math.max(320, stage.clientHeight)), true);
        down.lastY = e.clientY;
        return;
      }
      const now = performance.now();
      const step = (e.clientX - down.lastX) * (TAU / Math.max(260, stage.clientWidth * 1.15));
      this.angle += step;
      this.vel = step * (16.7 / Math.max(8, now - down.lastT));
      down.lastX = e.clientX;
      down.lastT = now;
      this.dirty = true;
    });
    const end = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (!down.moved && e.type === 'pointerup' && (down.type !== 'mouse' || !this.spin)) this.startSpin();
      if (down.moved) {
        this.drag = false;
        stage.classList.remove('dragging');
      }
      down = null;
      this.dirty = true;
    };
    this.on(stage, 'pointerup', end);
    this.on(stage, 'pointercancel', end);
  }

  setPitch(p: number, immediate = false) {
    this.pitchTarget = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, p));
    if (immediate || this.ctx.reduceMotion) this.pitch = this.pitchTarget;
    for (const b of this.viewBtns)
      b.setAttribute('aria-pressed', String(Math.abs(VIEWS[b.dataset.view ?? 'side'] - this.pitchTarget) < 0.06));
    this.dirty = true;
  }

  update(dt: number, now: number) {
    let active = false;
    let progress: number | null = null;
    let zoom = 0;
    const dp = this.pitchTarget - this.pitch;
    if (Math.abs(dp) > 0.0005) {
      this.pitch += dp * (1 - Math.exp(-dt * 5.5));
      active = true;
    } else if (dp !== 0) {
      this.pitch = this.pitchTarget;
      this.dirty = true;
    }
    if (this.spin) {
      const s = this.spin;
      const t = Math.min(1, (now - s.t0) / s.dur);
      const e = easeInOut(t);
      this.angle = s.from + (s.to - s.from) * e;
      progress = e;
      zoom = Math.sin(Math.PI * e);
      active = true;
      if (t >= 1) {
        this.spin = null;
        this.angle = s.to % TAU;
      }
    } else if (this.drag) {
      active = true;
      progress = (((this.angle % TAU) + TAU) % TAU) / TAU;
    } else if (Math.abs(this.vel) > 0.0008) {
      this.angle += this.vel * dt * 60;
      this.vel *= Math.pow(0.93, dt * 60);
      active = true;
      progress = (((this.angle % TAU) + TAU) % TAU) / TAU;
    } else {
      this.vel = 0;
      const diff = Math.round(this.angle / TAU) * TAU - this.angle;
      if (Math.abs(diff) > 0.0005) {
        this.angle += diff * (1 - Math.exp(-dt * 5));
        active = true;
      } else if (this.angle !== 0) {
        this.angle = 0;
        this.dirty = true;
      }
    }

    const turning = !!(this.spin || this.drag || Math.abs(this.vel) > 0.0008);
    if (turning !== this.turning) {
      this.turning = turning;
      this.card.classList.toggle('turning', turning);
    }
    if (progress !== null) {
      this.trace.setAttribute('stroke-dashoffset', (1 - progress).toFixed(4));
      const d = Math.round(((((this.angle % TAU) + TAU) % TAU) / TAU) * 360) % 360;
      this.deg.textContent = String(d).padStart(3, '0') + '°';
    }

    this.bottle.rotation.y = this.angle;
    this.pivot.rotation.x = this.pitch;
    const tilt = Math.abs(Math.sin(this.pitch));
    this.shadow.material.opacity = Math.max(0, 1 - tilt * 2.2);
    // Frame whatever the bottle presents: full height side-on, its footprint end-on.
    const c = Math.abs(Math.cos(this.pitch));
    const half = Math.max(BOTTLE_CENTER_Y * c + 1.7 * tilt, 2.1);
    const fit = half / 0.86 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) + BOTTLE_CENTER_Y * tilt;
    const dist = fit * Math.max(1, 0.8 / this.camera.aspect) * (1 - 0.055 * zoom);
    this.camera.position.set(0, BOTTLE_CENTER_Y + 0.35 * zoom, dist);
    this.camera.lookAt(0, BOTTLE_CENTER_Y - 0.08 * (1 - tilt), 0);

    if ((active || this.dirty) && this.visible) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
      if (!this.card.classList.contains('ready')) this.card.classList.add('ready');
    }
  }

  dispose() {
    for (const fn of this.cleanups) fn();
    this.shadow.geometry.dispose();
    this.shadow.material.dispose();
    this.envTex.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.card.classList.remove('ready', 'turning');
  }
}

interface Context {
  sleeveOn: boolean;
  reduceMotion: boolean;
  coarse: boolean;
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export interface CollectionHandle {
  dispose: () => void;
}

/** Mount viewers on every `[data-bottle-card]` inside `root`. */
export async function mountCollection(root: HTMLElement): Promise<CollectionHandle> {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-bottle-card]')];
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  const ctx: Context = {
    sleeveOn: true,
    reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarse: matchMedia('(pointer: coarse)').matches,
  };
  if (hint)
    hint.textContent = ctx.reduceMotion
      ? 'Drag a bottle to rotate it. Use Cap and Base to see the top and bottom.'
      : matchMedia('(hover: hover) and (pointer: fine)').matches
        ? 'Hover a bottle to turn it. Drag sideways to rotate, or up and down to see the cap and base.'
        : 'Tap a bottle to turn it. Drag to rotate, or use Cap and Base to see the top and bottom.';

  if (!webglOK()) {
    for (const c of cards) c.classList.add('fallback');
    return { dispose() {} };
  }
  await loadFonts();
  const shared = buildShared();
  const viewers: Viewer[] = [];
  for (const c of cards) {
    try {
      viewers.push(new Viewer(c, shared, ctx));
    } catch (err) {
      console.error(err);
      c.classList.add('fallback');
    }
  }

  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    for (const v of viewers) v.update(dt, now);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const segBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-sleeve]')];
  const onSeg = (btn: HTMLButtonElement) => () => {
    ctx.sleeveOn = btn.dataset.sleeve === 'on';
    for (const b of segBtns) b.setAttribute('aria-pressed', String(b === btn));
    for (const v of viewers) {
      v.sleeve.visible = ctx.sleeveOn;
      v.dirty = true;
    }
  };
  const segHandlers = segBtns.map((b) => {
    const h = onSeg(b);
    b.addEventListener('click', h);
    return () => b.removeEventListener('click', h);
  });

  return {
    dispose() {
      cancelAnimationFrame(raf);
      segHandlers.forEach((off) => off());
      viewers.forEach((v) => v.dispose());
      shared.textures.forEach((t) => t.dispose());
      [shared.glassGeo, shared.capGeo, shared.capTopGeo, shared.sleeveGeo].forEach((g) => g.dispose());
      shared.glassMat.dispose();
      for (const m of [...Object.values(shared.capMats), ...Object.values(shared.capTopMats), ...Object.values(shared.sleeveMats)])
        m.dispose();
    },
  };
}
