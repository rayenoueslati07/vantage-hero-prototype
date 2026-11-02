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
 * faces.front / faces.side = [tl, tr, br, bl] of the 8 office floors on that facade.
 * box = rough bounding box of the block for angles without a traced facade.
 * behind = this block is hidden behind another block in this angle. */
export const ANGLES = [
  {
    id: 'aerial', title: 'Güneydoğudan', sub: 'Eskişehir Yolu cephesi', w: 3200, h: 2160, focal: [0.5, 0.56],
    src: { day: 'aerial-day', gold: 'aerial-gold', night: 'aerial-night' }, realNight: true,
    blocks: {
      A: { faces: { front: [[0.1675,0.418],[0.3254,0.416],[0.3254,0.658],[0.1675,0.659]], side: [[0.3254,0.416],[0.351,0.405],[0.351,0.645],[0.3254,0.658]] }, tip: 'right', box: [0.1675,0.374,0.351,0.659] },
      B: { faces: { front: [[0.6677,0.416],[0.8167,0.418],[0.8167,0.658],[0.6677,0.658]], side: [[0.646,0.405],[0.6677,0.416],[0.6677,0.658],[0.646,0.645]] }, tip: 'left', box: [0.646,0.374,0.8167,0.659] },
      C: { faces: { front: [[0.343,0.360],[0.431,0.357],[0.431,0.600],[0.343,0.602]] }, hidden: [1, 2], tip: 'right', box: [0.28,0.326,0.437,0.556] },
      D: { faces: { front: [[0.551,0.357],[0.638,0.360],[0.638,0.602],[0.551,0.600]] }, hidden: [1, 2], tip: 'left', box: [0.549,0.326,0.71,0.556] },
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
      A: { faces: { front: [[0.459,0.313],[0.6875,0.220],[0.6875,0.709],[0.459,0.704]], side: [[0.6875,0.220],[0.7725,0.293],[0.7725,0.711],[0.6875,0.709]] }, tip: 'right', box: [0.457,0.142,0.775,0.711] },
      C: { faces: { front: [[0.15,0.416],[0.281,0.396],[0.281,0.707],[0.15,0.707]], side: [[0.281,0.396],[0.4275,0.418],[0.4275,0.707],[0.281,0.707]] }, tip: 'left', box: [0.148,0.34,0.43,0.707] },
      B: { faces: { front: [[0.774,0.449],[0.869,0.425],[0.869,0.72],[0.774,0.72]], side: [[0.869,0.425],[0.925,0.46],[0.925,0.72],[0.869,0.72]] }, tip: 'left', box: [0.772,0.385,0.925,0.72] },
      D: { box: [0.772,0.385,0.925,0.72], tip: 'left', behind: 'B' },
    },
  },
  {
    id: 'plaza', title: 'Meydandan', sub: 'Arkad ve kafe terasları', w: 2560, h: 1440, focal: [0.5, 0.55],
    src: { day: 'plaza', gold: 'plaza-gold', night: 'plaza-night' },
    blocks: {
      A: { box: [0.0,-0.35,0.383,0.50], tip: 'right' },
      B: { box: [0.64,-0.35,1.0,0.50], tip: 'left' },
      C: { box: [0.0,-0.35,0.383,0.50], tip: 'right', behind: 'A' },
      D: { box: [0.64,-0.35,1.0,0.50], tip: 'left', behind: 'B' },
    },
  },
  {
    id: 'road', title: 'Bulvardan', sub: 'Cadde mağazaları ve ofis katları', w: 2560, h: 1440, focal: [0.5, 0.5],
    src: { day: 'road', gold: 'road-gold', night: 'road-night' },
    blocks: {
      B: { faces: { front: [[0.565,0.275],[0.80,0.225],[0.80,0.725],[0.565,0.725]], side: [[0.80,0.225],[0.85,0.255],[0.85,0.725],[0.80,0.725]] }, tip: 'left', box: [0.565,0.17,0.85,0.725] },
      A: { faces: { front: [[0.14,0.49],[0.37,0.47],[0.37,0.765],[0.14,0.775]] }, tip: 'left', box: [0.14,0.44,0.37,0.775] },
      C: { faces: { front: [[0.38,0.555],[0.55,0.545],[0.55,0.765],[0.38,0.765]] }, tip: 'right', box: [0.38,0.52,0.55,0.765] },
      D: { box: [0.565,0.17,0.85,0.725], tip: 'left', behind: 'B' },
    },
  },
  {
    id: 'closeup', title: 'Yakın plan', sub: 'Balkonlu ofis katları', w: 2560, h: 1810, focal: [0.5, 0.45],
    src: { day: 'closeup', gold: 'closeup-gold', night: 'closeup-night' },
    blocks: {
      A: { faces: { front: [[0.215,0.28],[0.52,0.25],[0.52,0.72],[0.215,0.69]], side: [[0.52,0.25],[0.60,0.27],[0.60,0.72],[0.52,0.72]] }, tip: 'right', box: [0.215,0.2,0.60,0.72] },
      B: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
      C: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
      D: { box: [0.215,0.2,0.60,0.72], tip: 'right', behind: 'A' },
    },
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

/* ---------- View from your floor ---------- */
export const DIRECTIONS = [
  { id: 'G', label: 'Eskişehir Yolu', dir: 'Güney', img: 'view-g', caption: 'Eskişehir Yolu, Söğütözü kuleleri ve Ankara silüeti' },
  { id: 'D', label: 'Kentpark', dir: 'Doğu', img: 'view-d', caption: 'Kentpark, Cepa ve Söğütözü iş aksı' },
  { id: 'K', label: 'Bulvar', dir: 'Kuzey', img: 'view-k', caption: 'Sakıp Sabancı Bulvarı ve yeşil alan' },
  { id: 'B', label: 'Bakanlıklar', dir: 'Batı', img: 'view-b', caption: 'Çevre ve Şehircilik Bakanlığı, EPDK ve ODTÜ ormanı' },
];
const SIDE_OF_DIR = { G: 'Güney', D: 'Doğu', K: 'Kuzey', B: 'Batı' };
export function unitsFacing(block, floor, dirId) {
  return unitsOf(block, floor).filter(u => u.side === SIDE_OF_DIR[dirId]);
}

/* ---------- Amenities by level ---------- */
export const AMENITIES = [
  { id: 'roof', level: 'Çatı', name: 'Yeşil çatı terası', desc: 'Ortak teras, kent ve meydan manzarası', count: '4 teras', slab: [9, 9],
    images: [['img/galeri/galeri-13.jpg', 'Çatı terası'], ['img/galeri/galeri-11.jpg', 'Blok cephesi'], ['img/galeri/galeri-06.jpg', 'Balkonlar']] },
  { id: 'office', level: 'K1–8', name: 'Ofis katları', desc: '3,75 m tavan, her ofise balkon, natamam teslim', count: '320 ofis', slab: [1, 8],
    images: [['img/galeri/tamkat-03.jpg', 'Tam kat ofis'], ['img/galeri/tamkat-01.jpg', 'Açık ofis'], ['img/galeri/kucuk-ofis-01.jpg', 'Küçük ofis']] },
  { id: 'lobby', level: 'Zemin', name: 'Giriş lobisi', desc: 'Resepsiyon, 7/24 güvenlik, kontrollü geçiş', count: '4 lobi', slab: [0, 0],
    images: [['img/galeri/giris-01.jpg', 'Giriş holü'], ['img/galeri/giris-02.jpg', 'Resepsiyon'], ['img/galeri/koridor-01.jpg', 'Kat koridoru']] },
  { id: 'plaza', level: 'Zemin', name: 'Meydan ve arkad', desc: 'Kafeler, restoranlar, su öğesi ve sahne', count: '123 mağaza', slab: [0, 0],
    images: [['img/hero/plaza.jpg', 'Meydan'], ['img/hero/plaza-cafe.jpg', 'Kafe terasları'], ['img/hero/arcade.jpg', 'Arkad'], ['img/hero/plaza-piano.jpg', 'Su öğesi ve sahne']] },
  { id: 'b1', level: 'B1', name: 'Bodrum mağazaları', desc: '23 bağımsız ticari birim, servis erişimi', count: '23 birim', slab: [-1, -1],
    images: [['img/galeri/galeri-05.jpg', 'Cadde mağazaları'], ['img/galeri/galeri-07.jpg', 'Vitrinler']] },
  { id: 'parking', level: 'B2–B3', name: 'Kapalı otopark', desc: 'Her ofise min. 2 araç, misafir otoparkı', count: '1.041 araç', slab: [-3, -2],
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
