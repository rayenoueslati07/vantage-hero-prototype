/* Vantage Office – reel-faithful hero · data
 * ---------------------------------------------------------------
 * Real facts (website + catalogue): 4 blocks × 8 office floors × 10
 * offices, 847 m² full floor, unit sizes 66.90–107.07 m², 123 shops,
 * 1,041 parking spaces, 3.75 m ceilings.
 * DEMO data (deterministic, flagged "ÖRNEK" in the UI): availability,
 * sample prices, net/balcony splits, drive times.
 * Geometry: polygons traced on the official renders (0..1 coords).
 * ---------------------------------------------------------------*/

export const BRAND = {
  name: 'VANTAGE',
  tagline: 'Kalenderler İnşaat',
  city: 'Çankaya · Ankara',
  phone: '0312 235 7 111',
  email: 'info@vantageoffice.com.tr',
  address: 'Mustafa Kemal Mah. 2082. Cad. No: 48, Çankaya',
};

export const PROJECT = {
  totalOffices: 320, totalShops: 123, parking: 1041, area: '95.000', ceiling: '3,75 m', fullFloor: 847,
};

/* ---------- Blocks ---------- */
export const BLOCKS = {
  A: { id: 'A', name: 'A Blok', pos: 'Ön · Batı',  floors: 8, offices: 80, shops: 24, view: 'Eskişehir Yolu ve meydan' },
  B: { id: 'B', name: 'B Blok', pos: 'Ön · Doğu',  floors: 8, offices: 80, shops: 24, view: 'Eskişehir Yolu ve Kentpark aksı' },
  C: { id: 'C', name: 'C Blok', pos: 'Arka · Batı', floors: 8, offices: 80, shops: 26, view: 'Sakıp Sabancı Bulvarı ve yeşil alan' },
  D: { id: 'D', name: 'D Blok', pos: 'Arka · Doğu', floors: 8, offices: 80, shops: 26, view: 'Bulvar ve sabah ışığı' },
};
export const BLOCK_ORDER = ['A', 'B', 'C', 'D'];

/* ---------- Camera angles (tower screen) ----------
 * cols = the visible facade of the 8 office floors, as columns left → right
 *   (front face, rounded corner, side face): [x, roofLine, floor1Line].
 *   roofLine = underside of the roof slab (top of floor 8), floor1Line = floor
 *   level of floor 1. Floor lines between are evenly spaced per column, which
 *   matches the renders' 2-point perspective. Measured from the slab edges in
 *   each render (all 8 slab lines detected per column, error ≈ 1–3 px).
 * z = depth order: a block with higher z hides lower-z blocks where they overlap.
 * hidden = floors not visible from this angle (no highlight, no click area).
 * occluders = structures in front of the facades (podium parapets, canopies):
 *   floor highlights are masked there and clicks there select nothing.
 * box = rough bounding box of the block for angles without a traced facade.
 * behind = this block is hidden behind another block in this angle. */
export const ANGLES = [
  {
    id: 'aerial', title: 'Güneydoğudan', sub: 'Eskişehir Yolu cephesi', w: 3200, h: 2160, focal: [0.5, 0.56],
    src: { day: 'aerial-day', gold: 'aerial-gold', night: 'aerial-night' }, realNight: true,
    blocks: {
      A: { cols: [[0.1675,0.4229,0.6628],[0.25,0.4226,0.6641],[0.32,0.4214,0.6611],[0.328,0.4143,0.6484],[0.334,0.4062,0.6303],[0.34,0.3984,0.6126],[0.3455,0.3915,0.6]], z: 1, tip: 'right', box: [0.1675,0.374,0.351,0.659] },
      B: { cols: [[0.6445,0.3955,0.6095],[0.65,0.4031,0.6245],[0.66,0.4062,0.6366],[0.668,0.421,0.6608],[0.74,0.4215,0.6619],[0.8167,0.4209,0.6609]], z: 1, tip: 'left', box: [0.646,0.374,0.8167,0.659] },
      C: { cols: [[0.3455,0.3688,0.5538],[0.41,0.3686,0.5536],[0.433,0.367,0.554]], z: 0, tip: 'right', box: [0.28,0.326,0.437,0.556] },
      D: { cols: [[0.549,0.3677,0.5522],[0.59,0.3681,0.5534],[0.6445,0.367,0.553]], z: 0, tip: 'left', box: [0.549,0.326,0.71,0.556] },
    },
  },
  {
    id: 'topdown', title: 'Kuş bakışı', sub: 'Dört blok ve meydan', w: 3200, h: 2133, focal: [0.52, 0.45],
    src: { day: 'topdown', gold: 'topdown-gold', night: 'topdown-night' },
    blocks: {
      A: { box: [0.336,0.3735,0.535,0.773], tip: 'right' },
      B: { box: [0.645,0.174,0.83,0.5175], tip: 'right' },
      C: { box: [0.24,0.201,0.435,0.54], tip: 'left' },
      D: { box: [0.4575,0.0735,0.6415,0.36], tip: 'right' },
    },
  },
  {
    id: 'frontal', title: 'Caddeden', sub: 'A Blok ve giriş meydanı', w: 2560, h: 1440, focal: [0.58, 0.5],
    src: { day: 'frontal', gold: 'frontal-gold', night: 'frontal-night' },
    blocks: {
      A: { cols: [[0.456,0.3153,0.7505],[0.5,0.2909,0.7475],[0.55,0.2639,0.7422],[0.6,0.2371,0.738],[0.64,0.2132,0.7396],[0.66,0.2058,0.7365],[0.675,0.2077,0.734],[0.7,0.243,0.7345],[0.73,0.2884,0.7389],[0.76,0.3431,0.7444],[0.775,0.3638,0.75]], z: 2, tip: 'right', box: [0.457,0.142,0.775,0.711] },
      C: { cols: [[0.154,0.4362,0.7637],[0.2,0.4068,0.7611],[0.24,0.3809,0.7574],[0.265,0.3653,0.7545],[0.283,0.3572,0.7545],[0.3,0.3611,0.7547],[0.34,0.3834,0.754],[0.38,0.4046,0.7546],[0.425,0.4299,0.7566],[0.431,0.433,0.757]], z: 1, tip: 'left', box: [0.148,0.34,0.43,0.707] },
      B: { cols: [[0.776,0.4747,0.766],[0.8,0.4681,0.765],[0.818,0.464,0.765],[0.835,0.4684,0.761],[0.855,0.5008,0.7635],[0.868,0.5229,0.764]], z: 1, tip: 'left', box: [0.772,0.385,0.925,0.72] },
      D: { box: [0.772,0.385,0.925,0.72], tip: 'left', behind: 'B' },
    },
    occluders: [
      [[0.09,0.751],[0.3,0.735],[0.366,0.731],[0.366,0.7245],[0.45,0.718],[0.55,0.708],[0.62,0.702],[0.655,0.7],[0.665,0.722],[0.776,0.722],[0.776,0.742],[0.88,0.742],[0.88,0.86],[0.09,0.86]],
    ],
  },
  {
    id: 'plaza', title: 'Meydandan', sub: 'Arkad ve kafe terasları', w: 2560, h: 1440, focal: [0.5, 0.55],
    src: { day: 'plaza', gold: 'plaza-gold', night: 'plaza-night' },
    blocks: {
      /* Seen from inside the plaza looking north (west on the left): the two blocks are the back
       * pair C (left) and D (right), with the podium bar and the park between them. The front pair
       * A/B is behind the camera. Building tops are out of frame: floors are counted up from the
       * arcade canopy (floor 1 partly behind it); floor 8 shows only on the receding side faces. */
      C: { cols: [[0,-0.0976,0.6048],[0.298,-0.0976,0.6048],[0.312,-0.0702,0.6079],[0.33,0.0002,0.6157],[0.35,0.0785,0.6244],[0.365,0.1372,0.631],[0.38,0.1959,0.6375]], z: 1, tip: 'right', box: [0.0,-0.1,0.385,0.64] },
      D: { cols: [[0.643,0.1842,0.6435],[0.655,0.1212,0.634],[0.67,0.0425,0.6222],[0.683,-0.0258,0.6119],[0.688,-0.052,0.6079],[0.702,-0.0888,0.6024],[1,-0.0888,0.6024]], z: 1, tip: 'left', box: [0.64,-0.1,1.0,0.64] },
      A: { box: [0.0,-0.35,0.383,0.50], tip: 'right', hidden: [1, 2, 3, 4, 5, 6, 7, 8] },
      B: { box: [0.64,-0.35,1.0,0.50], tip: 'left', hidden: [1, 2, 3, 4, 5, 6, 7, 8] },
    },
    occluders: [
      [[0,0.558],[1,0.558],[1,1],[0,1]],   // arcade canopy and shop fronts
    ],
  },
  {
    id: 'road', title: 'Bulvardan', sub: 'Cadde mağazaları ve ofis katları', w: 2560, h: 1440, focal: [0.5, 0.5],
    src: { day: 'road', gold: 'road-gold', night: 'road-night' },
    blocks: {
      B: { cols: [[0.557,0.3365,0.7647],[0.79,0.2335,0.7529],[0.81,0.2368,0.7538],[0.82,0.2703,0.7554],[0.83,0.3141,0.7628],[0.84,0.3611,0.7665],[0.848,0.3963,0.7713],[0.852,0.4128,0.772]], z: 1, hidden: [1], tip: 'left', box: [0.565,0.17,0.85,0.725] },
      A: { cols: [[0.146,0.5124,0.788],[0.19,0.4956,0.7825],[0.215,0.4847,0.7808],[0.229,0.477,0.7828],[0.245,0.4827,0.7841],[0.3,0.51,0.7874],[0.34,0.5275,0.7898],[0.376,0.5477,0.7914]], z: 1, hidden: [1], tip: 'left', box: [0.14,0.44,0.37,0.775] },
      C: { cols: [[0.381,0.5929,0.7978],[0.42,0.5835,0.7959],[0.45,0.5762,0.7952],[0.497,0.5664,0.7905],[0.52,0.5765,0.795],[0.553,0.5947,0.797]], z: 0, hidden: [1], tip: 'right', box: [0.38,0.52,0.55,0.765] },
      D: { box: [0.565,0.17,0.85,0.725], tip: 'left', behind: 'B' },
    },
    occluders: [
      [[0.457,0.736],[0.52,0.7306],[0.58,0.7229],[0.65,0.7146],[0.72,0.7083],[0.8,0.704],[0.86,0.703],[0.86,0.86],[0.457,0.86]],
      [[0.07,0.764],[0.15,0.7632],[0.2,0.76],[0.3,0.757],[0.377,0.757],[0.381,0.776],[0.457,0.776],[0.457,0.86],[0.07,0.86]],
    ],
  },
  {
    id: 'closeup', title: 'Yakın plan', sub: 'Balkonlu ofis katları', w: 2560, h: 1810, focal: [0.5, 0.45],
    src: { day: 'closeup', gold: 'closeup-gold', night: 'closeup-night' },
    blocks: {
      A: { cols: [[0.213,0.3188,0.7245],[0.3,0.2975,0.715],[0.4,0.2704,0.7158],[0.47,0.252,0.7137],[0.52,0.2391,0.7124],[0.537,0.2389,0.7155],[0.555,0.2496,0.7162],[0.565,0.2814,0.7178],[0.57,0.301,0.718],[0.575,0.316,0.719],[0.585,0.349,0.725],[0.592,0.372,0.73],[0.599,0.394,0.734]], z: 1, tip: 'right', box: [0.215,0.2,0.60,0.72] },
      B: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
      C: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
      D: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
    },
    occluders: [
      [[0.405,0.703],[0.5,0.698],[0.6,0.698],[0.66,0.702],[0.66,0.8],[0.405,0.8]],
    ],
  },
];

export const TIMES = [
  { id: 'day', label: 'Gündüz' },
  { id: 'gold', label: 'Altın saat' },
  { id: 'night', label: 'Gece' },
];

/* ---------- Typical floor (B Blok tam kat planı, catalogue) ----------
 * rect = unit outline on img/hero/plans/b-blok-tam-kat-plan.jpg (0..1, x0 y0 x1 y1). */
export const PLAN_IMG = 'img/hero/plans/b-blok-tam-kat-plan.jpg';
export const PLAN_RATIO = 1275 / 1606;
export const PLAN_CORE = [0.298, 0.262, 0.710, 0.778];
export const UNIT_LAYOUT = [
  { no: 11, m2: 100.59, side: 'Kuzey', rect: [0.0745,0.059,0.369,0.305] },
  { no: 12, m2: 81.90,  side: 'Kuzey', rect: [0.369,0.059,0.635,0.262] },
  { no: 13, m2: 107.07, side: 'Kuzey', rect: [0.635,0.059,0.929,0.305] },
  { no: 14, m2: 66.90,  side: 'Doğu',  rect: [0.710,0.305,0.929,0.511] },
  { no: 15, m2: 66.90,  side: 'Doğu',  rect: [0.710,0.511,0.929,0.722] },
  { no: 16, m2: 103.35, side: 'Güney', rect: [0.635,0.722,0.929,0.962] },
  { no: 17, m2: 81.90,  side: 'Güney', rect: [0.369,0.778,0.635,0.962] },
  { no: 18, m2: 104.55, side: 'Güney', rect: [0.0745,0.722,0.369,0.962] },
  { no: 19, m2: 66.90,  side: 'Batı',  rect: [0.0745,0.511,0.298,0.722] },
  { no: 20, m2: 66.90,  side: 'Batı',  rect: [0.0745,0.305,0.298,0.511] },
];

export const COMBINATIONS = [
  { count: 2, m2: 133.80 }, { count: 3, m2: 234.39 }, { count: 4, m2: 338.94 }, { count: 5, m2: 420.84 }, { count: 10, m2: 847, label: 'Tam kat' },
];

export const STATUS = {
  available: { key: 'available', label: 'Müsait' },
  reserved:  { key: 'reserved',  label: 'Opsiyonlu' },
  sold:      { key: 'sold',      label: 'Satıldı' },
};

const FACING = {
  Kuzey: 'Kuzey · Bulvar, yeşil alan',
  Güney: 'Güney · Eskişehir Yolu',
  Doğu:  'Doğu · Meydan, Kentpark',
  Batı:  'Batı · Bakanlıklar aksı',
};

function typeOf(m2) {
  if (m2 >= 100) return { type: 'Köşe ofis', rooms: 3, baths: 2 };
  if (m2 >= 80) return { type: 'Geniş ofis', rooms: 2, baths: 1 };
  return { type: 'Standart ofis', rooms: 1, baths: 1 };
}

/* deterministic pseudo-random, stable between loads */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}

export function unitStatus(block, floor, no) {
  const r = hash(`${block}-${floor}-${no}`);
  const bias = floor >= 7 ? 0.16 : floor <= 2 ? -0.08 : 0;
  if (r < 0.24 + bias) return STATUS.sold;
  if (r < 0.24 + bias + 0.15) return STATUS.reserved;
  return STATUS.available;
}

const PRICE_PER_M2 = 95000; // ₺ · sample only
export function priceOf(m2, floor) {
  const p = m2 * PRICE_PER_M2 * (1 + (floor - 1) * 0.012);
  return Math.round(p / 10000) * 10000;
}

const cache = new Map();
export function unitsOf(block, floor) {
  const k = `${block}${floor}`;
  if (cache.has(k)) return cache.get(k);
  const list = UNIT_LAYOUT.map(u => {
    const t = typeOf(u.m2);
    const status = unitStatus(block, floor, u.no);
    const price = priceOf(u.m2, floor);
    return {
      code: `${block}-${floor}${u.no}`, short: `${block}${floor}${u.no}`, block, floor, no: u.no, m2: u.m2, side: u.side, rect: u.rect,
      status, ...t, facing: FACING[u.side],
      net: Math.round(u.m2 * 0.86 * 10) / 10, balcony: Math.round(u.m2 * 0.09 * 10) / 10,
      parking: u.m2 >= 100 ? 3 : 2, price, perM2: Math.round(price / u.m2 / 100) * 100,
    };
  });
  cache.set(k, list);
  return list;
}

export function floorInfo(block, floor) {
  const units = unitsOf(block, floor);
  const available = units.filter(u => u.status.key === 'available').length;
  const reserved = units.filter(u => u.status.key === 'reserved').length;
  return { block, floor, units, available, reserved, sold: units.length - available - reserved,
    height: Math.round((5.5 + (floor - 1) * 3.75 + 1.2) * 10) / 10 };
}

export function floorsOf(block) {
  const out = [];
  for (let f = 8; f >= 1; f--) out.push(floorInfo(block, f));
  return out;
}

export function totals() {
  let available = 0, reserved = 0, sold = 0;
  BLOCK_ORDER.forEach(b => floorsOf(b).forEach(f => { available += f.available; reserved += f.reserved; sold += f.sold; }));
  return { available, reserved, sold, total: available + reserved + sold };
}

export function findUnit(code) {
  const m = /^([ABCD])-?(\d)(\d\d)$/.exec(code);
  if (!m) return null;
  return unitsOf(m[1], Number(m[2])).find(u => u.no === Number(m[3])) || null;
}

/* ---------- Amenities by level ---------- */
export const AMENITIES = [
  { id: 'roof', level: 'Çatı', name: 'Çatı terası', desc: 'Kenti ve meydanı izleyen ortak teras.', count: '4 teras', slab: [9, 9],
    images: [['img/galeri/galeri-13.jpg', 'Çatı terası'], ['img/galeri/galeri-11.jpg', 'Blok cephesi'], ['img/galeri/galeri-06.jpg', 'Balkonlar']] },
  { id: 'office', level: 'K1–8', name: 'Ofis katları', desc: '3,75 m tavan yüksekliği, balkonlu ofisler, natamam teslim.', count: '320 ofis', slab: [1, 8],
    images: [['img/galeri/tamkat-03.jpg', 'Tam kat ofis'], ['img/galeri/tamkat-01.jpg', 'Açık ofis'], ['img/galeri/kucuk-ofis-01.jpg', 'Küçük ofis']] },
  { id: 'lobby', level: 'Zemin', name: 'Giriş lobisi', desc: 'Resepsiyon hizmeti, 7/24 güvenlik ve kontrollü giriş.', count: '4 lobi', slab: [0, 0],
    images: [['img/galeri/giris-01.jpg', 'Giriş holü'], ['img/galeri/giris-02.jpg', 'Resepsiyon'], ['img/galeri/koridor-01.jpg', 'Kat koridoru']] },
  { id: 'plaza', level: 'Zemin', name: 'Meydan ve cadde', desc: 'Kafe, restoran ve açık hava buluşmalarının merkezi.', count: '123 mağaza', slab: [0, 0],
    images: [['img/hero/plaza.jpg', 'Meydan'], ['img/hero/plaza-cafe.jpg', 'Kafe terasları'], ['img/hero/arcade.jpg', 'Arkad'], ['img/hero/plaza-piano.jpg', 'Su öğesi ve sahne']] },
  { id: 'b1', level: 'B1', name: 'Bodrum mağazaları', desc: 'Birinci bodrumda 23 mağaza.', count: '23 mağaza', slab: [-1, -1],
    images: [['img/galeri/galeri-05.jpg', 'Cadde mağazaları'], ['img/galeri/galeri-07.jpg', 'Vitrinler']] },
  { id: 'parking', level: 'B2–B3', name: 'Kapalı otopark', desc: 'Her bağımsız bölüme 2 kapalı yer.', count: '1.041 araçlık', slab: [-3, -2],
    images: [['img/galeri/galeri-08.jpg', 'Otopark girişi'], ['img/galeri/galeri-01.jpg', 'Cadde cephesi']] },
];

/* ---------- Neighborhood (schematic map, approximate drive times · demo) ---------- */
export const PLACES = [
  { id: 'kentpark', name: 'Kentpark AVM', min: 2, pos: [0.70, 0.60] },
  { id: 'cepa', name: 'Cepa AVM', min: 3, pos: [0.84, 0.62] },
  { id: 'metro', name: 'Söğütözü Metro', min: 4, pos: [0.56, 0.80] },
  { id: 'bakanlik', name: 'Bakanlıklar · EPDK', min: 3, pos: [0.30, 0.40] },
  { id: 'odtu', name: 'ODTÜ', min: 7, pos: [0.22, 0.86] },
  { id: 'bilkent', name: 'Bilkent', min: 10, pos: [0.08, 0.58] },
  { id: 'kizilay', name: 'Kızılay', min: 15, pos: [0.95, 0.84], edge: true },
  { id: 'esenboga', name: 'Esenboğa Havalimanı', min: 35, pos: [0.90, 0.10], edge: true },
];
export const SITE_POS = [0.46, 0.55];

/* ---------- Design ---------- */
export const DESIGN_POINTS = [
  ['Yatay mimari', 'Yüksek kuleler yerine dört blok, sekiz kat: meydana açılan ferah ve dengeli bir yerleşim.'],
  ['Her ofise balkon', 'Kat planındaki her birim kendi balkonuna sahip; gün içinde nefes alma ve kısa molalar.'],
  ['3,75 m tavan', 'Ferah iç hacim; asma tavan ve döşeme altı tesisat için esnek yükseklik.'],
  ['Natamam teslim', '66,90 m² tek ofisten 847 m² tam kata; komşu birimler birleştirilebilir.'],
  ['Meydan ve 123 mağaza', 'Su öğesi, kafe terasları ve arkad ile sürekli hareketli, yüksek ziyaretçi trafiği.'],
];

/* ---------- Gallery (site categories) ---------- */
const g = (p, n) => Array.from({ length: n }, (_, i) => `img/galeri/${p}-${String(i + 1).padStart(2, '0')}.jpg`);
export const GALLERY = [
  { id: 'dis', name: 'Dış cephe', images: ['galeri-01', 'galeri-05', 'galeri-06', 'galeri-07', 'galeri-08', 'galeri-11', 'galeri-13'].map(x => `img/galeri/${x}.jpg`) },
  { id: 'meydan', name: 'Meydan', images: ['galeri-02', 'galeri-09', 'galeri-12'].map(x => `img/galeri/${x}.jpg`) },
  { id: 'giris', name: 'Giriş holü', images: g('giris', 7) },
  { id: 'koridor', name: 'Kat koridoru', images: g('koridor', 5) },
  { id: 'tamkat', name: 'Tam kat ofis', images: g('tamkat', 23) },
  { id: 'kucuk', name: 'Küçük ofis', images: g('kucuk-ofis', 8) },
];

/* interiors for the office page */
export const INTERIORS = {
  tamkat: { label: 'Tam kat', tabs: [['Açık ofis', 'tamkat-01'], ['Toplantı', 'tamkat-05'], ['Yönetici', 'tamkat-09'], ['Dinlenme', 'tamkat-14']] },
  kucuk: { label: 'Küçük ofis', tabs: [['Çalışma alanı', 'kucuk-ofis-01'], ['Toplantı', 'kucuk-ofis-03'], ['Yönetici', 'kucuk-ofis-05'], ['Giriş', 'kucuk-ofis-07']] },
};
