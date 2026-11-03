/* Vantage Office – reel-faithful interactive hero
 * ---------------------------------------------------------------
 * Screens (mirroring the reference reel): landing → tower (floor stack,
 * floor tooltip, day/golden/night, camera angles) → floor plan → stacking
 * plan → office page → amenities by level → neighborhood → design → gallery.
 * (The reel's "view from your floor" screen was removed at the client's request.)
 * Vanilla ES module + GSAP. Desktop presentation build.
 * ---------------------------------------------------------------*/
import {
  BRAND, PROJECT, BLOCKS, BLOCK_ORDER, ANGLES, TIMES, PLAN_IMG, PLAN_RATIO, PLAN_CORE, UNIT_LAYOUT, COMBINATIONS,
  STATUS, unitsOf, floorInfo, floorsOf, totals, findUnit, AMENITIES, PLACES, MAP,
  DESIGN_POINTS, GALLERY, INTERIORS,
} from './data.js?v=7';

const gsap = window.gsap;
const hero = document.getElementById('vtHero');
const SVGNS = 'http://www.w3.org/2000/svg';
const fmt = n => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = n => n.toLocaleString('tr-TR');
const money = n => '₺ ' + fmtInt(n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const h = String.raw;

/* ------------------------------------------------------------------ icons */
const I = {
  tower: '<svg viewBox="0 0 24 24"><path d="M6 21V5l6-2 6 2v16"/><path d="M3 21h18M9 9h2M13 9h2M9 13h2M13 13h2M9 17h2M13 17h2"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-7.1 7-12a7 7 0 0 0-14 0c0 4.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  design: '<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  gold: '<svg viewBox="0 0 24 24"><path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 5v2M4.5 9.5l1.4 1.4M19.5 9.5l-1.4 1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  stack: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="4"/><rect x="4" y="10" width="16" height="4"/><rect x="4" y="16" width="16" height="4"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M4 10l1-5h14l1 5M4 10v10h16V10M4 10h16M10 20v-6h4v6"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="M5 19l8-8"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/></svg>',
  plan: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h9V3M12 12v9"/></svg>',
};

const NAV = [
  ['tower', 'Bloklar', I.tower], ['stacking', 'Ofisler', I.grid], ['amenities', 'Olanaklar', I.star],
  ['neighborhood', 'Konum', I.pin], ['design', 'Tasarım', I.design], ['gallery', 'Galeri', I.gallery],
];

/* ------------------------------------------------------------------ state */
const S = {
  screen: 'landing', entered: false,
  angle: 0, time: 'day',
  hover: null, sel: null,            // {block, floor}
  filters: { available: true, reserved: true, sold: true },
  stackSel: null, unit: null,
  amenity: 'plaza', gallery: 'dis', interior: 'tamkat',
};
let W = 0, H = 0;

/* ------------------------------------------------------------------ scaffold */
hero.innerHTML = h`
  <div class="alt-tower">
    <div class="alt-bg"></div>
    <svg class="alt-ov" aria-hidden="true"></svg>
    <div class="alt-tip" hidden></div>
    <aside class="alt-floors">
      <div class="alt-floors-h">Katlar</div>
      <ul class="alt-floors-list"></ul>
    </aside>
    <div class="alt-times">
      ${TIMES.map(t => `<button class="alt-time${t.id === S.time ? ' is-active' : ''}" data-time="${t.id}">${I[t.id === 'day' ? 'sun' : t.id === 'gold' ? 'gold' : 'moon']}<span>${t.label}</span></button>`).join('')}
    </div>
    <div class="alt-angle">
      <button class="alt-round" data-act="angle-prev" aria-label="Önceki açı">${I.left}</button>
      <button class="alt-round alt-round-lg" data-act="angle-next" aria-label="Sonraki açı">${I.compass}</button>
      <button class="alt-round" data-act="angle-next" aria-label="Sonraki açı">${I.right}</button>
      <div class="alt-angle-cap"><b></b><span></span></div>
    </div>
    <div class="alt-tower-actions">
      <button class="alt-pill" data-act="stacking">${I.stack}<span>Yerleşim planı</span></button>
      <button class="alt-pill" data-act="filters">${I.filter}<span>Filtreler</span><i class="alt-badge" hidden></i></button>
      <div class="alt-filters" hidden>
        <b>Durum</b>
        ${Object.values(STATUS).map(s => `<label><input type="checkbox" checked data-status="${s.key}"><i class="alt-dot d-${s.key}"></i>${s.label}</label>`).join('')}
        <small>Filtreler kat listesindeki noktalara ve yerleşim planına uygulanır.</small>
      </div>
    </div>
  </div>

  <div class="alt-page" hidden></div>

  <div class="alt-bar">
    <div class="alt-bar-brand"><b>${BRAND.name}</b><span>${BRAND.tagline}</span></div>
    <nav class="alt-nav">
      ${NAV.map(([id, label, ic]) => `<button class="alt-nav-item" data-nav="${id}">${ic}<span>${label}</span></button>`).join('')}
    </nav>
    <div class="alt-bar-right">
      <div class="alt-lang"><button class="is-active">TR</button><button>EN</button></div>
      <button class="alt-cta" data-act="book">Sunum talep edin</button>
    </div>
  </div>

  <div class="alt-landing">
    <div class="alt-landing-top"><div class="alt-lang"><button class="is-active">TR</button><button>EN</button></div><span class="alt-sunchip">${I.sun}</span></div>
    <div class="alt-landing-body">
      <span class="alt-eyebrow">${BRAND.city}</span>
      <h1 class="alt-wordmark">${BRAND.name}</h1>
      <p class="alt-landing-sub">Ofis ve yaşam merkezi · Eskişehir Yolu, Ankara</p>
      <p class="alt-landing-meta">${PROJECT.totalOffices} OFİS · ${PROJECT.totalShops} MAĞAZA · 4 BLOK · ${PROJECT.area} M²</p>
      <button class="alt-enter" data-act="enter">Keşfet ${I.arrow}</button>
    </div>
    <div class="alt-landing-cap"><b>Güneydoğudan</b><span>Eskişehir Yolu cephesi</span></div>
  </div>

  <div class="alt-viewer" hidden></div>
  <div class="alt-demo-tag" title="Müsaitlik, örnek fiyat ve sürüş süreleri temsili demo verisidir">ÖRNEK VERİ</div>
`;

const towerEl = hero.querySelector('.alt-tower');
const bgEl = hero.querySelector('.alt-bg');
const ovEl = hero.querySelector('.alt-ov');
const tipEl = hero.querySelector('.alt-tip');
const floorsList = hero.querySelector('.alt-floors-list');
const pageEl = hero.querySelector('.alt-page');
const barEl = hero.querySelector('.alt-bar');
const landingEl = hero.querySelector('.alt-landing');
const viewerEl = hero.querySelector('.alt-viewer');
const capB = hero.querySelector('.alt-angle-cap b');
const capS = hero.querySelector('.alt-angle-cap span');

/* ------------------------------------------------------------------ tower background */
const bgImgs = new Map();
let metrics = null;

function bgKey(angleIdx, time) {
  const a = ANGLES[angleIdx];
  return `${a.id}:${time}`;
}
function ensureBg(angleIdx, time) {
  const key = bgKey(angleIdx, time);
  if (bgImgs.has(key)) return bgImgs.get(key);
  const a = ANGLES[angleIdx];
  const img = document.createElement('img');
  img.className = 'alt-bgimg';
  img.alt = '';
  img.decoding = 'async';
  img.src = `img/hero/${a.src[time]}.jpg`;
  img.style.objectPosition = `${a.focal[0] * 100}% ${a.focal[1] * 100}%`;
  bgEl.appendChild(img);
  bgImgs.set(key, img);
  return img;
}
function showBg() {
  const key = bgKey(S.angle, S.time);
  const img = ensureBg(S.angle, S.time);
  const activate = () => bgImgs.forEach((im, k) => im.classList.toggle('is-active', k === key));
  if (img.complete && img.naturalWidth) activate();
  else { img.onload = activate; setTimeout(activate, 1200); }
  measure();
}
function measure() {
  W = hero.clientWidth; H = hero.clientHeight;
  const a = ANGLES[S.angle];
  const k = Math.max(W / a.w, H / a.h);
  const imgW = a.w * k, imgH = a.h * k;
  const x0 = (W - imgW) * a.focal[0], y0 = (H - imgH) * a.focal[1];
  metrics = { imgW, imgH, x0, y0 };
  ovEl.setAttribute('viewBox', `0 0 1000 ${1000 * a.h / a.w}`);
  Object.assign(ovEl.style, { left: `${x0}px`, top: `${y0}px`, width: `${imgW}px`, height: `${imgH}px` });
  paintFloor();
}
const toPx = ([x, y]) => [metrics.x0 + x * metrics.imgW, metrics.y0 + y * metrics.imgH];

/* ------------------------------------------------------------------ floor stack */
function dotHTML(units) {
  return units.map(u => `<i class="alt-dot d-${u.status.key}"></i>`).join('');
}
function buildFloors() {
  floorsList.innerHTML = BLOCK_ORDER.map(b => {
    const block = BLOCKS[b];
    return `
      <li class="alt-fgroup"><b>${block.name}</b><span>1–8 · ${block.pos}</span></li>
      ${floorsOf(b).map(f => `<li class="alt-frow" data-block="${b}" data-floor="${f.floor}" tabindex="0"><span class="n">${f.floor}</span><span class="dots">${dotHTML(f.units)}</span></li>`).join('')}
      <li class="alt-frow alt-fground" data-block="${b}" data-floor="0"><span class="n">Z</span><span class="g">${I.shop}<em>${block.shops} mağaza</em></span></li>`;
  }).join('');
  floorsList.querySelectorAll('.alt-frow').forEach(li => {
    const b = li.dataset.block, f = Number(li.dataset.floor);
    li.addEventListener('pointerenter', () => hoverFloor(b, f));
    li.addEventListener('pointerleave', () => hoverFloor(null));
    li.addEventListener('click', () => { if (f) openFloor(b, f); });
    li.addEventListener('keydown', e => { if (e.key === 'Enter' && f) openFloor(b, f); });
  });
}
function hoverFloor(block, floor) {
  S.hover = block ? { block, floor } : null;
  paintFloor();
}
function selectFloor(block, floor, scroll = false) {
  S.sel = { block, floor };
  floorsList.querySelectorAll('.alt-frow').forEach(li => li.classList.toggle('is-sel', li.dataset.block === block && Number(li.dataset.floor) === floor));
  if (scroll) {
    // centre the row inside the floor list only (scrollIntoView would also scroll the page)
    const li = floorsList.querySelector(`.alt-frow[data-block="${block}"][data-floor="${floor}"]`);
    if (li) {
      const lr = floorsList.getBoundingClientRect(), r = li.getBoundingClientRect();
      floorsList.scrollBy({ top: (r.top - lr.top) - (lr.height - r.height) / 2, behavior: 'smooth' });
    }
  }
  paintFloor();
}
function clearSel() {
  S.sel = null;
  floorsList.querySelectorAll('.alt-frow').forEach(li => li.classList.remove('is-sel'));
  paintFloor();
}

/* ---- traced facades: a block is a chain of columns [x, roofLine, floor1Line]
 * (see data.js); floor f is the band between floor lines 8-f and 9-f. */
const lineY = (col, k) => col[1] + (col[2] - col[1]) * k / 8;
function strip(cols, k0, k1) {
  return [...cols.map(c => [c[0], lineY(c, k0)]), ...cols.slice().reverse().map(c => [c[0], lineY(c, k1)])];
}
const bandPoly = (cols, floor) => strip(cols, 8 - floor, 9 - floor);
function colAt(cols, x) {
  if (x < cols[0][0] || x > cols[cols.length - 1][0]) return null;
  for (let i = 1; i < cols.length; i++) {
    const a = cols[i - 1], b = cols[i];
    if (x <= b[0]) { const t = (x - a[0]) / (b[0] - a[0] || 1); return [x, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  }
  return null;
}
function inPoly([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const traced = a => Object.entries(a.blocks).filter(([, g]) => g.cols && !g.behind);
/* which floor is under the image point (0..1)? Structures in front (occluders)
 * and nearer blocks win; hidden floors and hidden parts return null. */
function facadeHit(x, y) {
  const a = ANGLES[S.angle];
  if ((a.occluders || []).some(o => inPoly([x, y], o))) return null;
  const blocks = traced(a).sort((p, q) => (q[1].z || 0) - (p[1].z || 0));
  for (const [id, g] of blocks) {
    const c = colAt(g.cols, x);
    if (!c || y < c[1] || y > c[2]) continue;
    const floor = 8 - Math.min(7, Math.floor((y - c[1]) / (c[2] - c[1]) * 8));
    return (g.hidden || []).includes(floor) ? null : { block: id, floor };
  }
  return null;
}
/* shapes drawn in front of a block: occluders + silhouettes of nearer blocks */
function occludersOf(blockId) {
  const a = ANGLES[S.angle];
  const z = a.blocks[blockId].z || 0;
  return [...(a.occluders || []), ...traced(a).filter(([id, g]) => id !== blockId && (g.z || 0) > z).map(([, g]) => strip(g.cols, 0, 8))];
}

/* floor → band polygon + anchor point for the current angle */
function floorGeom(block, floor) {
  const a = ANGLES[S.angle];
  let g = a.blocks[block];
  if (!g) return null;
  const behind = g.behind;
  if (behind) g = a.blocks[behind];
  const hidden = (g.hidden || []).includes(floor);
  let point;
  if (floor === 0) {
    const b = g.box;
    point = [g.tip === 'right' ? b[2] : b[0], b[3] + 0.02];
    return { point, polys: [], side: g.tip, note: 'Zemin · mağazalar', behind, hidden: false };
  }
  if (g.cols && !behind) {
    const c = g.tip === 'right' ? g.cols[g.cols.length - 1] : g.cols[0];
    point = [c[0], lineY(c, 8.5 - floor)];
    return { point, polys: hidden ? [] : [bandPoly(g.cols, floor)], side: g.tip, hidden, behind };
  }
  // box fallback (plan view, angles without traced facades)
  const [x0, y0, x1, y1] = g.box;
  const top = y0 + (y1 - y0) * 0.16, bottom = y1;
  const yf = bottom - (floor - 0.5) / 8 * (bottom - top);
  point = [g.tip === 'right' ? x1 : x0, clamp(yf, 0.04, 0.96)];
  return { point, polys: [], side: g.tip, hidden: a.id === 'topdown' || hidden, behind, planView: a.id === 'topdown' };
}

const sameFloor = (p, q) => !!p && !!q && p.block === q.block && p.floor === q.floor;
function paintFloor() {
  if (!metrics) return;
  const t = S.hover || S.sel;
  ovEl.innerHTML = '';
  floorsList.querySelectorAll('.alt-frow').forEach(li => li.classList.toggle('is-hot', !!S.hover && li.dataset.block === S.hover.block && Number(li.dataset.floor) === S.hover.floor));
  if (!t || S.screen !== 'tower') { tipEl.hidden = true; return; }
  const geom = floorGeom(t.block, t.floor);
  if (!geom) { tipEl.hidden = true; return; }
  const a = ANGLES[S.angle];
  const vbh = 1000 * a.h / a.w;
  const pts = poly => poly.map(([x, y]) => `${(x * 1000).toFixed(2)},${(y * vbh).toFixed(2)}`).join(' ');
  // selected floor stays highlighted; the hovered floor gets a lighter band on top
  const bands = [];
  if (S.sel) bands.push([S.sel, 'is-sel']);
  if (S.hover && !sameFloor(S.hover, S.sel)) bands.push([S.hover, 'is-hover']);
  bands.forEach(([f, cls]) => {
    const fg = floorGeom(f.block, f.floor);
    if (!fg || !fg.polys.length) return;
    const grp = document.createElementNS(SVGNS, 'g');
    const occ = occludersOf(f.block);
    if (occ.length) {   // mask out podiums / nearer blocks in front of this floor
      const id = `altMask${f.block}${cls}`;
      ovEl.insertAdjacentHTML('afterbegin', `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="${vbh + 400}"><rect x="-200" y="-200" width="1400" height="${vbh + 400}" fill="#fff"/>${occ.map(o => `<polygon points="${pts(o)}" fill="#000"/>`).join('')}</mask></defs>`);
      grp.setAttribute('mask', `url(#${id})`);
    }
    fg.polys.forEach(poly => {
      const p = document.createElementNS(SVGNS, 'polygon');
      p.setAttribute('class', `alt-band ${cls}`);
      p.setAttribute('points', pts(poly));
      grp.appendChild(p);
    });
    ovEl.appendChild(grp);
  });
  // tooltip
  const block = BLOCKS[t.block];
  const isSel = S.sel && S.sel.block === t.block && S.sel.floor === t.floor;
  const [px, py] = toPx(geom.point);
  let body;
  if (t.floor === 0) {
    body = `<b>${block.name} · Zemin</b><span>${block.shops} cadde mağazası · kafe & perakende</span>`;
  } else {
    const f = floorInfo(t.block, t.floor);
    const status = f.available === 0 ? 'Tükendi' : `${f.available} müsait`;
    const note = geom.behind ? `<em>${BLOCKS[geom.behind].name} arkasında</em>` : geom.hidden ? '<em>Bu açıdan görünmüyor</em>' : '';
    body = `<b>${block.name} · ${t.floor}. Kat</b><span>Ofisler · ${status}</span>${note}<button class="alt-tip-open" data-act="open-floor">Katı aç ${I.arrow}</button>`;
  }
  tipEl.innerHTML = body;
  tipEl.className = `alt-tip side-${geom.side}${isSel ? ' is-sel' : ''}`;
  tipEl.hidden = false;
  const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  let left = geom.side === 'right' ? px + 14 : px - tw - 14;
  let top = py - th / 2;
  left = clamp(left, 190, W - tw - 24);
  top = clamp(top, 160, H - th - 90);
  tipEl.style.left = `${left}px`;
  tipEl.style.top = `${top}px`;
  tipEl.style.setProperty('--ax', `${clamp(px - left, 0, tw)}px`);
  tipEl.style.setProperty('--ay', `${clamp(py - top, 8, th - 8)}px`);
  tipEl.querySelector('[data-act="open-floor"]')?.addEventListener('click', e => { e.stopPropagation(); openFloor(t.block, t.floor); });
}

/* ------------------------------------------------------------------ angles & time */
function setAngle(idx, dir = 1) {
  S.angle = (idx + ANGLES.length) % ANGLES.length;
  const a = ANGLES[S.angle];
  capB.textContent = a.title;
  capS.textContent = a.sub;
  gsap.fromTo(hero.querySelector('.alt-angle-cap'), { opacity: 0, x: 10 * dir }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
  showBg();
  hero.querySelectorAll('.alt-time').forEach(b => b.classList.toggle('is-synthetic', b.dataset.time === 'night' && !a.realNight));
}
function setTime(t) {
  S.time = t;
  hero.querySelectorAll('.alt-time').forEach(b => b.classList.toggle('is-active', b.dataset.time === t));
  hero.classList.toggle('is-night', t === 'night');
  showBg();
}

/* ------------------------------------------------------------------ filters */
function applyFilters() {
  const off = Object.entries(S.filters).filter(([, v]) => !v).map(([k]) => k);
  hero.querySelectorAll('.alt-dot').forEach(d => d.classList.toggle('is-off', off.some(k => d.classList.contains('d-' + k))));
  pageEl.querySelectorAll('.alt-cell').forEach(c => c.classList.toggle('is-off', off.some(k => c.classList.contains('s-' + k))));
  const badge = hero.querySelector('.alt-badge');
  badge.hidden = off.length === 0;
  badge.textContent = off.length;
}

/* ------------------------------------------------------------------ screens */
function setNav(screen) {
  const map = { floor: 'tower', office: 'stacking' };
  const active = map[screen] || screen;
  hero.querySelectorAll('.alt-nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.nav === active));
}

let transitioning = false;
let goSeq = 0;
function go(screen, params = {}) {
  if (!S.entered) enter(true);
  const from = S.screen;
  S.screen = screen;
  setNav(screen);
  const outEl = from === 'tower' ? towerEl : pageEl;
  const d = 0.32;
  transitioning = true;
  const show = () => {
    if (screen === 'tower') {
      pageEl.hidden = true; pageEl.innerHTML = '';
      towerEl.classList.remove('is-hidden');
      gsap.fromTo(towerEl, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out', onComplete: () => { transitioning = false; } });
      measure();
      if (params.block) selectFloor(params.block, params.floor, true);
      paintFloor();
    } else {
      towerEl.classList.add('is-hidden');
      tipEl.hidden = true;
      pageEl.hidden = false;
      pageEl.scrollTop = 0;
      pageEl.innerHTML = '';
      pageEl.className = `alt-page is-${screen}`;
      RENDER[screen](params);
      bindCommon(pageEl);
      fitPlanOverlays(pageEl);
      gsap.fromTo(pageEl, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out', onComplete: () => { transitioning = false; } });
      gsap.fromTo(pageEl.querySelectorAll('.alt-anim'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
    }
  };
  if (from === screen && screen !== 'tower') { show(); return; }
  const token = ++goSeq;
  gsap.to(outEl, { opacity: 0, filter: 'blur(8px)', duration: d, ease: 'power2.in' });
  setTimeout(() => { if (token === goSeq) show(); }, d * 1000 + 10);
}

function back() {
  const parent = { floor: 'tower', stacking: 'tower', office: 'stacking', amenities: 'tower', neighborhood: 'tower', design: 'tower', gallery: 'tower' };
  const p = parent[S.screen] || 'tower';
  if (p === 'tower' && S.sel) go('tower', { ...S.sel });
  else go(p);
}

function openFloor(block, floor) {
  selectFloor(block, floor);
  go('floor', { block, floor });
}

function header({ eyebrow, title, sub, right = '', backTo = true }) {
  return h`
    <header class="alt-ph alt-anim">
      ${backTo ? `<button class="alt-round alt-back" data-act="back" aria-label="Geri">${I.left}</button>` : ''}
      <div class="alt-ph-text">
        <span class="alt-eyebrow">${eyebrow}</span>
        <h1 class="alt-h1">${title}</h1>
        ${sub ? `<p class="alt-sub">${sub}</p>` : ''}
      </div>
      <div class="alt-ph-right">${right}</div>
    </header>`;
}
const brandNote = `<i class="alt-gold">Kalenderler İnşaat</i>`;
const chip = s => `<span class="alt-chip c-${s.key}">${s.label}</span>`;
const sampleChip = `<span class="alt-chip c-sample">ÖRNEK</span>`;

function bookCard(compact = false) {
  return h`
    <div class="alt-book alt-anim${compact ? ' is-compact' : ''}">
      <span class="alt-eyebrow">${BRAND.tagline}</span>
      <h3>Özel sunum talep edin</h3>
      <p>Vantage Ofis'i birlikte gezelim: ofis seçeneklerini, kat planlarını ve teslim takvimini sizin için anlatalım.</p>
      <div class="alt-book-contacts"><span>${I.phone}${BRAND.phone}</span><span>${I.mail}${BRAND.email}</span></div>
      <button class="alt-cta" data-act="book">Sunum talep edin</button>
    </div>`;
}

/* plan overlay svg (unit rects) */
function planOverlay(units, { hot = null, labels = false, cls = '' } = {}) {
  const r = PLAN_RATIO;
  const rects = units.map(u => {
    const [x0, y0, x1, y1] = u.rect;
    return `<g class="alt-pu s-${u.status.key}${hot === u.no ? ' is-hot' : ''}" data-unit="${u.no}">
      <rect x="${(x0 * 100).toFixed(2)}" y="${(y0 * 100 / r).toFixed(2)}" width="${((x1 - x0) * 100).toFixed(2)}" height="${((y1 - y0) * 100 / r).toFixed(2)}" rx="1.2"/>
      ${labels ? `<text x="${((x0 + x1) / 2 * 100).toFixed(2)}" y="${((y0 + y1) / 2 * 100 / r + 1).toFixed(2)}">${u.block}${u.floor}${u.no}</text>` : ''}
    </g>`;
  }).join('');
  return `<svg class="alt-plan-ov ${cls}" viewBox="0 0 100 ${(100 / r).toFixed(2)}" preserveAspectRatio="none">${rects}</svg>`;
}

/* mini block diagram (8 slabs) */
function blockDiagram(floor, block, cls = '') {
  const slabs = [];
  for (let f = 8; f >= 1; f--) slabs.push(`<rect class="sl${f === floor ? ' is-on' : ''}" x="10" y="${12 + (8 - f) * 9}" width="40" height="6" rx="1.5"/>`);
  return `<svg class="alt-blockdiag ${cls}" viewBox="0 0 60 110"><rect class="roof" x="12" y="6" width="36" height="3" rx="1"/>${slabs.join('')}<rect class="podium" x="2" y="86" width="56" height="8" rx="1.5"/><rect class="base" x="2" y="96" width="56" height="10" rx="1"/><text x="30" y="105" class="lbl">${block} BLOK</text></svg>`;
}

/* ---------------- FLOOR ---------------- */
function renderFloor({ block, floor }) {
  const f = floorInfo(block, floor);
  const b = BLOCKS[block];
  pageEl.innerHTML = h`
    ${header({ eyebrow: `${b.name} · 1–8 · ${b.pos}`, title: `${floor}. Kat`, sub: `${b.name} · Ofis katı · tam kat ${PROJECT.fullFloor} m² brüt · ${brandNote}` })}
    <div class="alt-floor-grid">
      <div class="alt-plancard alt-anim">
        <span class="alt-street t">Sakıp Sabancı Bulvarı</span>
        <span class="alt-street b">Eskişehir Yolu</span>
        <span class="alt-street l">Batı · Bakanlıklar</span>
        <span class="alt-street r">Doğu · Meydan</span>
        <div class="alt-compass"><svg viewBox="0 0 24 24"><path d="M12 2l4 10-4-2-4 2z"/><path d="M12 12v10"/></svg><b>K</b></div>
        <div class="alt-plan-wrap"><img src="${PLAN_IMG}" alt="Kat planı">${planOverlay(f.units)}</div>
        <div class="alt-plan-foot"><span><i class="alt-dot d-available"></i>Müsait</span><span><i class="alt-dot d-reserved"></i>Opsiyonlu</span><span><i class="alt-dot d-sold"></i>Satıldı</span><em>Katalog kat planı (B Blok tam kat) · ölçeksiz · ${block} Blok için temsili</em></div>
      </div>
      <div class="alt-floor-side">
        <div class="alt-count alt-anim"><b>${f.units.length}</b> ofis <b>${f.available}</b> müsait ${sampleChip}</div>
        <table class="alt-table alt-anim">
          <thead><tr><th>Ofis</th><th>Tip</th><th>Alan</th><th>Cephe</th><th>Örnek fiyat</th><th>Durum</th></tr></thead>
          <tbody>
            ${f.units.map(u => `
              <tr class="alt-urow" data-unit="${u.no}" data-code="${u.code}" tabindex="0">
                <td class="u-code">${u.short}</td>
                <td class="u-type">${u.type}<small>${u.rooms} oda · ${u.baths} ıslak hacim</small></td>
                <td class="u-size">${fmt(u.m2)} m²<small>Balkon ${fmt(u.balcony)}</small></td>
                <td class="u-face">${u.facing}</td>
                <td class="u-price">${money(u.price)}<small>${money(u.perM2)}/m²</small></td>
                <td>${chip(u.status)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="alt-actions alt-anim">
          <button class="alt-pill" data-act="show-tower" data-block="${block}" data-floor="${floor}">${I.tower}<span>Binada göster</span></button>
        </div>
        ${bookCard()}
      </div>
    </div>`;
  const hot = no => {
    pageEl.querySelectorAll('.alt-pu').forEach(g => g.classList.toggle('is-hot', no !== null && Number(g.dataset.unit) === no));
    pageEl.querySelectorAll('.alt-urow').forEach(r => r.classList.toggle('is-hot', no !== null && Number(r.dataset.unit) === no));
  };
  pageEl.querySelectorAll('.alt-urow, .alt-pu').forEach(el => {
    const no = Number(el.dataset.unit);
    el.addEventListener('pointerenter', () => hot(no));
    el.addEventListener('pointerleave', () => hot(null));
    const open = () => go('office', { code: `${block}-${floor}${no}` });
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });
}

/* ---------------- STACKING PLAN ---------------- */
function renderStacking(params = {}) {
  const t = totals();
  pageEl.innerHTML = h`
    ${header({
      eyebrow: `${BRAND.name} · ${BRAND.city}`, title: 'Yerleşim planı', sub: `${t.total} ofis, blok blok ve kat kat · ${brandNote}`,
      right: `<div class="alt-legend"><span><i class="alt-dot d-available"></i>Müsait <b>${t.available}</b></span><span><i class="alt-dot d-reserved"></i>Opsiyonlu <b>${t.reserved}</b></span><span><i class="alt-dot d-sold"></i>Satıldı <b>${t.sold}</b></span>${sampleChip}</div><button class="alt-pill" data-act="filters-page">${I.filter}<span>Filtreler</span></button>`,
    })}
    <div class="alt-stack alt-anim">
      ${BLOCK_ORDER.map(b => {
        const block = BLOCKS[b];
        return `
          <section class="alt-stack-col" data-block="${b}">
            <div class="alt-stack-colh"><b>${block.name}</b><span>${block.pos} · ${block.view}</span></div>
            ${floorsOf(b).map(f => `
              <div class="alt-stack-row">
                <span class="fl">${f.floor}</span>
                <div class="cells">${f.units.map(u => `<button class="alt-cell s-${u.status.key}" data-code="${u.code}" title="${u.type} · ${fmt(u.m2)} m² · ${u.status.label}"><b>${u.no}</b><small>${Math.round(u.m2)} m²</small></button>`).join('')}</div>
              </div>`).join('')}
            <div class="alt-stack-row is-ground">
              <span class="fl">Z</span>
              <div class="cells"><div class="alt-cell-ground">${I.shop}<span><b>${block.shops} cadde mağazası</b> · kafe, restoran, perakende</span></div></div>
            </div>
          </section>`;
      }).join('')}
    </div>
    <aside class="alt-stack-panel" id="altStackPanel" hidden></aside>`;
  pageEl.querySelectorAll('.alt-cell').forEach(c => c.addEventListener('click', () => selectStack(c.dataset.code)));
  applyFilters();
  if (params.code) selectStack(params.code);
}
function selectStack(code) {
  const u = findUnit(code);
  if (!u) return;
  S.stackSel = code;
  pageEl.querySelectorAll('.alt-cell').forEach(c => c.classList.toggle('is-sel', c.dataset.code === code));
  const panel = pageEl.querySelector('#altStackPanel');
  const f = floorInfo(u.block, u.floor);
  panel.innerHTML = h`
    <button class="alt-round alt-panel-close" data-act="stack-close">${I.close}</button>
    <span class="alt-eyebrow">${u.type} · ${BLOCKS[u.block].name}</span>
    <h2 class="alt-h2"><button class="alt-link" data-act="office" data-code="${u.code}">Ofis ${u.short}</button></h2>
    <p class="alt-sub">${u.floor}. Kat · ${BLOCKS[u.block].pos}</p>
    <ul class="alt-facts-list">
      <li><b>${u.rooms} oda</b> · ${u.baths} ıslak hacim · ${fmt(u.m2)} m² brüt</li>
      <li>Balkon ${fmt(u.balcony)} m² · Net ≈ ${fmt(u.net)} m²</li>
      <li>Cephe: ${u.facing}</li>
      <li>${u.parking} kapalı otopark · 3,75 m tavan</li>
    </ul>
    <div class="alt-price-row"><b>${money(u.price)}</b>${chip(u.status)}${sampleChip}<small>${money(u.perM2)}/m²</small></div>
    <div class="alt-miniplan"><img src="${PLAN_IMG}" alt="">${planOverlay(f.units, { hot: u.no, cls: 'is-mini' })}</div>
    <div class="alt-actions">
      <button class="alt-pill alt-pill-gold" data-act="office" data-code="${u.code}">${I.plan}<span>Ofis sayfasını aç</span></button>
      <button class="alt-pill" data-act="show-tower" data-block="${u.block}" data-floor="${u.floor}">${I.tower}<span>Binada göster</span></button>
    </div>
    <button class="alt-cta" data-act="book">Sunum talep edin</button>`;
  bindCommon(panel);
  if (panel.hidden) { panel.hidden = false; gsap.fromTo(panel, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }); }
  else gsap.fromTo(panel.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.03 });
  fitPlanOverlays(panel);
}

/* ---------------- OFFICE (residence page) ---------------- */
function renderOffice({ code }) {
  const u = findUnit(code);
  if (!u) return go('stacking');
  S.unit = u;
  const b = BLOCKS[u.block];
  const f = floorInfo(u.block, u.floor);
  const interior = INTERIORS[S.interior];
  const heroImg = u.m2 >= 100 ? 'img/galeri/tamkat-03.jpg' : 'img/galeri/kucuk-ofis-01.jpg';
  pageEl.innerHTML = h`
    <div class="alt-office">
      <div class="alt-office-hero">
        <img class="alt-office-heroimg" src="${heroImg}" alt="">
        <div class="alt-office-shade"></div>
        <button class="alt-round alt-back alt-office-back" data-act="back">${I.left}</button>
        <div class="alt-office-title alt-anim">
          <span class="alt-eyebrow">${u.type} · ${b.name}</span>
          <h1 class="alt-h1 xl">Ofis ${u.short}</h1>
          <p class="alt-sub">${u.floor}. Kat · ${b.name} · ${b.pos}</p>
          <p class="alt-sub light">${u.rooms} odalı, ${u.facing.toLowerCase()} cepheli ${u.type.toLowerCase()}</p>
        </div>
        <div class="alt-office-price alt-anim"><b>${money(u.price)}</b><div>${chip(u.status)}${sampleChip}</div><small>${money(u.perM2)}/m² · örnek</small></div>
      </div>
      <nav class="alt-subnav">
        <a href="#ov" data-sec="ov" class="is-active">Genel bakış</a><a href="#plan" data-sec="plan">Plan</a><a href="#int" data-sec="int">İç mekân</a>
        <span class="alt-subnav-brand">${BRAND.tagline.toUpperCase()}</span>
        <button class="alt-cta" data-act="book">Sunum talep edin</button>
      </nav>
      <section class="alt-sec" id="ov">
        <div class="alt-sec-grid">
          <div>
            <h2 class="alt-h2">Temel bilgiler</h2>
            <dl class="alt-facts">
              <div><dt>Oda</dt><dd>${u.rooms}</dd></div>
              <div><dt>Islak hacim</dt><dd>${u.baths}</dd></div>
              <div><dt>Brüt alan</dt><dd>${fmt(u.m2)} m²</dd></div>
              <div><dt>Balkon</dt><dd>${fmt(u.balcony)} m²</dd></div>
              <div><dt>Tavan</dt><dd>3,75 m</dd></div>
              <div><dt>Cephe</dt><dd>${u.facing}</dd></div>
              <div><dt>Konum</dt><dd>${u.floor}. Kat · ${b.name}</dd></div>
              <div><dt>Örnek fiyat</dt><dd>${money(u.price)}<small>${money(u.perM2)}/m² · örnek</small></dd></div>
              <div><dt>Teslim</dt><dd>Natamam<small>iç mekân planlama desteği</small></dd></div>
            </dl>
            <div class="alt-actions">
              <button class="alt-pill alt-pill-gold" data-act="open-floor-page" data-block="${u.block}" data-floor="${u.floor}">${I.grid}<span>${u.floor}. Kat</span></button>
              <button class="alt-pill" data-act="show-tower" data-block="${u.block}" data-floor="${u.floor}">${I.share}<span>Binada göster</span></button>
            </div>
          </div>
          <div class="alt-sec-side">${blockDiagram(u.floor, u.block)}<span>${u.floor} · ${b.name}</span></div>
        </div>
      </section>
      <section class="alt-sec" id="plan">
        <div class="alt-sec-head"><h2 class="alt-h2">Kat planı</h2><div class="alt-seg"><button class="is-active">2D</button><button disabled title="3D plan bu prototipte yok">3D</button></div></div>
        <div class="alt-plancard is-wide">
          <div class="alt-plan-wrap"><img src="${PLAN_IMG}" alt="Kat planı">${planOverlay(f.units, { hot: u.no, labels: true })}</div>
        </div>
        <p class="alt-note">Katalog B Blok tam kat planı; seçili ofis vurgulanmıştır. Ölçeksiz, temsili.</p>
        <div class="alt-combos">${COMBINATIONS.map(c => `<span><b>${c.label || c.count + ' ofis'}</b>${fmt(c.m2)} m²</span>`).join('')}</div>
      </section>
      <section class="alt-sec" id="int">
        <h2 class="alt-h2">İç mekân</h2>
        <div class="alt-interior">
          <img id="altIntImg" src="img/galeri/${interior.tabs[0][1]}.jpg" alt="">
          <div class="alt-int-ui">
            <div class="alt-seg">${Object.entries(INTERIORS).map(([k, v]) => `<button class="${k === S.interior ? 'is-active' : ''}" data-int="${k}">${v.label}</button>`).join('')}</div>
            <div class="alt-int-tabs">${interior.tabs.map(([n, img], i) => `<button class="${i === 0 ? 'is-active' : ''}" data-img="${img}">${n}</button>`).join('')}</div>
            <p class="alt-int-cap"><b id="altIntTitle">${interior.tabs[0][0]} · ${interior.label}</b><span>Ahşap, taş ve cam; doğal ışık alan, natamam teslim edilen esnek ofis hacmi.</span></p>
          </div>
        </div>
      </section>
      <section class="alt-sec">${bookCard()}</section>
    </div>`;
  const heroImgEl = pageEl.querySelector('.alt-office-heroimg');
  gsap.fromTo(heroImgEl, { filter: 'blur(22px)', scale: 1.06 }, { filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'power2.out' });
  pageEl.querySelectorAll('.alt-subnav a').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const sec = pageEl.querySelector('#' + a.dataset.sec);
    pageEl.scrollTo({ top: sec.offsetTop - 150, behavior: 'smooth' });
    pageEl.querySelectorAll('.alt-subnav a').forEach(x => x.classList.toggle('is-active', x === a));
  }));
  pageEl.querySelectorAll('[data-int]').forEach(btn => btn.addEventListener('click', () => {
    S.interior = btn.dataset.int;
    const it = INTERIORS[S.interior];
    pageEl.querySelectorAll('[data-int]').forEach(x => x.classList.toggle('is-active', x === btn));
    const tabs = pageEl.querySelector('.alt-int-tabs');
    tabs.innerHTML = it.tabs.map(([n, img], i) => `<button class="${i === 0 ? 'is-active' : ''}" data-img="${img}">${n}</button>`).join('');
    bindIntTabs();
    swapInterior(it.tabs[0][1], `${it.tabs[0][0]} · ${it.label}`);
  }));
  const swapInterior = (img, title) => {
    const el = pageEl.querySelector('#altIntImg');
    gsap.to(el, { opacity: 0, filter: 'blur(10px)', duration: 0.3, onComplete: () => { el.src = `img/galeri/${img}.jpg`; gsap.to(el, { opacity: 1, filter: 'blur(0px)', duration: 0.6 }); } });
    pageEl.querySelector('#altIntTitle').textContent = title;
  };
  const bindIntTabs = () => pageEl.querySelectorAll('.alt-int-tabs button').forEach(t => t.addEventListener('click', () => {
    pageEl.querySelectorAll('.alt-int-tabs button').forEach(x => x.classList.toggle('is-active', x === t));
    swapInterior(t.dataset.img, `${t.textContent} · ${INTERIORS[S.interior].label}`);
  }));
  bindIntTabs();
}

/* ---------------- AMENITIES ---------------- */
function renderAmenities() {
  const cur = AMENITIES.find(a => a.id === S.amenity) || AMENITIES[0];
  const slabs = [];
  for (let f = 9; f >= -3; f--) {
    const on = f >= cur.slab[0] && f <= cur.slab[1];
    const y = 20 + (9 - f) * 22;
    const cls = f === 9 ? 'roof' : f === 0 ? 'ground' : f < 0 ? 'base' : 'sl';
    slabs.push(`<rect class="${cls}${on ? ' is-on' : ''}" x="${f <= 0 ? 10 : 30}" y="${y}" width="${f <= 0 ? 100 : 60}" height="14" rx="3"/>`);
  }
  pageEl.innerHTML = h`
    ${header({ eyebrow: `${BRAND.name} · ${BRAND.city}`, title: 'Kat kat olanaklar', sub: `Otoparktan çatı terasına · ${brandNote}` })}
    <div class="alt-amen alt-anim">
      <svg class="alt-amen-sil" viewBox="0 0 120 320">${slabs.join('')}</svg>
      <ul class="alt-amen-list">
        ${AMENITIES.map(a => `<li class="alt-amen-row${a.id === cur.id ? ' is-active' : ''}" data-id="${a.id}" tabindex="0"><span class="lv">${a.level}</span><span class="tx"><b>${a.name}</b><small>${a.desc}</small></span><span class="ct">${a.count}</span></li>`).join('')}
      </ul>
      <div class="alt-amen-card" id="altAmenCard"></div>
    </div>`;
  const card = pageEl.querySelector('#altAmenCard');
  const fill = (a, animate) => {
    card.innerHTML = h`
      <div class="alt-amen-main" data-idx="0"><img src="${a.images[0][0]}" alt=""><div class="alt-amen-cap"><span class="alt-eyebrow">${a.level} · Seviye</span><h2 class="alt-h2">${a.name}</h2><p>${a.desc}</p></div></div>
      <div class="alt-amen-thumbs">${a.images.map(([src, cap], i) => `<button data-idx="${i}"><img src="${src}" alt=""><span>${cap}</span></button>`).join('')}</div>`;
    card.querySelectorAll('[data-idx]').forEach(el => el.addEventListener('click', () => openViewer(a.images.map(([src, cap]) => ({ src, title: cap, sub: `${a.level} · ${a.name}` })), Number(el.dataset.idx))));
    if (animate) gsap.fromTo(card.querySelector('.alt-amen-main img'), { opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.8 });
  };
  fill(cur, false);
  pageEl.querySelectorAll('.alt-amen-row').forEach(li => {
    const pick = () => {
      S.amenity = li.dataset.id;
      const a = AMENITIES.find(x => x.id === S.amenity);
      pageEl.querySelectorAll('.alt-amen-row').forEach(x => x.classList.toggle('is-active', x === li));
      pageEl.querySelectorAll('.alt-amen-sil rect').forEach((r, i) => { const f = 9 - i; r.classList.toggle('is-on', f >= a.slab[0] && f <= a.slab[1]); });
      fill(a, true);
    };
    li.addEventListener('click', pick);
    li.addEventListener('pointerenter', pick);
    li.addEventListener('keydown', e => { if (e.key === 'Enter') pick(); });
  });
}

/* ---------------- NEIGHBORHOOD ---------------- */
function renderNeighborhood() {
  const [sx, sy] = MAP.site;   // the client's map image; the SVG on top only draws the hover highlight
  pageEl.innerHTML = h`
    ${header({ eyebrow: 'Konum', title: 'Çankaya, Ankara', sub: `Eskişehir Yolu ile Sakıp Sabancı Bulvarı arasında · ${brandNote}` })}
    <div class="alt-nb alt-anim">
      <div class="alt-map">
        <img class="alt-map-img" src="${MAP.src}" alt="Vantage konum haritası: Eskişehir Yolu, Sakıp Sabancı Bulvarı ve çevredeki merkezler">
        <svg viewBox="0 0 ${MAP.w} ${MAP.h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <circle class="halo" cx="${sx}" cy="${sy}" r="30"/>
          ${PLACES.map(p => `<line class="link" data-id="${p.id}" x1="${sx}" y1="${sy}" x2="${p.pin[0]}" y2="${p.pin[1]}"/>`).join('')}
          ${PLACES.map(p => `<g class="place" data-id="${p.id}"><circle class="ring" cx="${p.pin[0]}" cy="${p.pin[1]}" r="17"/><circle class="hit" cx="${p.pin[0]}" cy="${p.pin[1]}" r="44"/></g>`).join('')}
        </svg>
      </div>
      <div class="alt-nb-side">
        <p class="alt-text">Ankara'nın batı aksında, Söğütözü–Eskişehir Yolu hattında; bakanlıklar, üniversiteler ve büyük şirketlerle çevrili güçlü iş ekosisteminin içinde. Metroya ve ana arterlere birkaç dakika mesafede.</p>
        <h2 class="alt-h2">Sürüş süreleri <small>(yaklaşık)</small></h2>
        <ul class="alt-drive">${PLACES.map(p => `<li data-id="${p.id}"><span>${p.name}</span><b>${p.min} dk</b></li>`).join('')}</ul>
        <p class="alt-note">Yaklaşık sürüş süreleri, hafif trafik · temsili</p>
        <div class="alt-nb-photo"><img src="img/galeri/galeri-01.jpg" alt=""></div>
      </div>
    </div>`;
  const hot = id => {
    pageEl.querySelectorAll('.place, .link, .alt-drive li').forEach(el => el.classList.toggle('is-hot', id !== null && el.dataset.id === id));
  };
  pageEl.querySelectorAll('.alt-drive li, .place').forEach(el => {
    el.addEventListener('pointerenter', () => hot(el.dataset.id));
    el.addEventListener('pointerleave', () => hot(null));
  });
}

/* ---------------- DESIGN ---------------- */
function renderDesign() {
  pageEl.innerHTML = h`
    ${header({ eyebrow: 'Tasarım', title: 'Yatay mimari: dört blok, bir meydan', sub: `${BRAND.name} · ${BRAND.city} · ${brandNote}` })}
    <div class="alt-design alt-anim">
      <div class="alt-design-card">
        <div class="alt-design-cap"><b>Dört blok</b><span>Kuş bakışı: her blok meydana döner, aralarında kafe terasları ve arkad.</span></div>
        <svg viewBox="0 0 200 200" class="alt-design-svg">
          <rect class="plaza" x="70" y="70" width="60" height="60" rx="14"/>
          <circle class="water" cx="100" cy="100" r="8"/>
          <g class="blk" data-i="0"><rect x="22" y="112" width="52" height="66" rx="14"/><text x="48" y="149">A</text></g>
          <g class="blk" data-i="1"><rect x="126" y="112" width="52" height="66" rx="14"/><text x="152" y="149">B</text></g>
          <g class="blk" data-i="2"><rect x="22" y="22" width="52" height="66" rx="14"/><text x="48" y="59">C</text></g>
          <g class="blk" data-i="3"><rect x="126" y="22" width="52" height="66" rx="14"/><text x="152" y="59">D</text></g>
          <path class="arcade" d="M74 112 H126 M74 88 H126 M74 88 V112 M126 88 V112"/>
          <text class="road" x="100" y="194" text-anchor="middle">ESKİŞEHİR YOLU</text>
          <text class="road" x="100" y="12" text-anchor="middle">SAKIP SABANCI BULVARI</text>
        </svg>
        <div class="alt-compass sm"><svg viewBox="0 0 24 24"><path d="M12 2l4 10-4-2-4 2z"/><path d="M12 12v10"/></svg><b>K</b></div>
      </div>
      <div class="alt-design-text">
        <p class="alt-text">Tek, uygulanabilir bir fikir Vantage'ın siluetini belirler: yükselmek yerine yayılmak. Sekiz katlı dört blok ortak bir podyum üzerinde meydanı çevreler; her ofis kendi balkonuyla açık havaya, her kat meydana bakar.</p>
        <ol class="alt-points">${DESIGN_POINTS.map(([t, d], i) => `<li data-i="${i}"><span>0${i + 1}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol>
        <div class="alt-design-legend">${BLOCK_ORDER.map(b => `<span><i>${b}</i>${BLOCKS[b].name} · ${BLOCKS[b].pos}</span>`).join('')}</div>
      </div>
      <div class="alt-design-side">${blockDiagram(0, 'A')}<span>8 ofis katı<br>+ podyum</span></div>
    </div>`;
  const svg = pageEl.querySelector('.alt-design-svg');
  pageEl.querySelectorAll('.alt-points li').forEach(li => {
    li.addEventListener('pointerenter', () => {
      svg.dataset.mode = li.dataset.i;
      gsap.fromTo(svg.querySelectorAll('.blk rect'), { scale: 0.97, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(2)' });
    });
    li.addEventListener('pointerleave', () => { svg.dataset.mode = ''; });
  });
}

/* ---------------- GALLERY ---------------- */
function renderGallery() {
  const total = GALLERY.reduce((s, g) => s + g.images.length, 0);
  pageEl.innerHTML = h`
    ${header({
      eyebrow: `${BRAND.name} · ${BRAND.city}`, title: 'Galeri', sub: `${total} görsel · ${brandNote}`,
      right: `<div class="alt-gal-filters">${GALLERY.map(g => `<button class="alt-gpill${g.id === S.gallery ? ' is-active' : ''}" data-g="${g.id}">${g.name} <b>${g.images.length}</b></button>`).join('')}</div>`,
    })}
    <div class="alt-gal alt-anim">
      ${GALLERY.map(g => `
        <section class="alt-gal-sec" id="gal-${g.id}">
          <h2 class="alt-h2">${g.name} <small>${g.images.length} görsel</small></h2>
          <div class="alt-gal-grid">${g.images.map((src, i) => `<button class="alt-gal-card" data-g="${g.id}" data-i="${i}"><img src="${src}" loading="lazy" alt=""><span><b>${g.name}</b>Görünüm ${String(i + 1).padStart(2, '0')}</span></button>`).join('')}</div>
        </section>`).join('')}
    </div>`;
  pageEl.querySelectorAll('.alt-gpill').forEach(b => b.addEventListener('click', () => {
    S.gallery = b.dataset.g;
    pageEl.querySelectorAll('.alt-gpill').forEach(x => x.classList.toggle('is-active', x === b));
    const sec = pageEl.querySelector('#gal-' + b.dataset.g);
    pageEl.scrollTo({ top: sec.offsetTop - 150, behavior: 'smooth' });
  }));
  pageEl.querySelectorAll('.alt-gal-card').forEach(c => c.addEventListener('click', () => {
    const g = GALLERY.find(x => x.id === c.dataset.g);
    openViewer(g.images.map((src, i) => ({ src, title: `${g.name}`, sub: `Görünüm ${i + 1} / ${g.images.length}` })), Number(c.dataset.i));
  }));
}

const RENDER = { floor: renderFloor, stacking: renderStacking, office: renderOffice, amenities: renderAmenities, neighborhood: renderNeighborhood, design: renderDesign, gallery: renderGallery };

/* keep the unit overlay aligned with the object-fit:contain plan image */
function fitPlanOverlays(root) {
  root.querySelectorAll('.alt-plan-wrap').forEach(w => {
    const svg = w.querySelector('.alt-plan-ov');
    if (!svg) return;
    const apply = () => {
      const bw = w.clientWidth, bh = w.clientHeight;
      let iw = bw, ih = bw / PLAN_RATIO;
      if (ih > bh) { ih = bh; iw = bh * PLAN_RATIO; }
      Object.assign(svg.style, { left: `${(bw - iw) / 2}px`, top: `${(bh - ih) / 2}px`, width: `${iw}px`, height: `${ih}px` });
    };
    apply();
    new ResizeObserver(apply).observe(w);
  });
}

/* ------------------------------------------------------------------ viewer (lightbox) */
let viewerState = null;
function openViewer(items, idx) {
  viewerState = { items, idx };
  viewerEl.hidden = false;
  viewerEl.innerHTML = h`
    <div class="alt-viewer-shade"></div>
    <button class="alt-round alt-viewer-close" data-act="viewer-close">${I.close}</button>
    <figure class="alt-viewer-fig"><img alt=""><figcaption><b></b><span></span></figcaption></figure>
    <div class="alt-viewer-bar">
      <button class="alt-round" data-act="viewer-prev">${I.left}</button>
      <div class="alt-viewer-thumbs">${items.map((it, i) => `<button data-i="${i}"><img src="${it.src}" alt=""></button>`).join('')}</div>
      <button class="alt-round" data-act="viewer-next">${I.right}</button>
    </div>`;
  viewerEl.querySelectorAll('.alt-viewer-thumbs button').forEach(b => b.addEventListener('click', () => showViewer(Number(b.dataset.i))));
  bindCommon(viewerEl);
  gsap.fromTo(viewerEl, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  showViewer(idx, false);
}
function showViewer(idx, animate = true) {
  const { items } = viewerState;
  viewerState.idx = (idx + items.length) % items.length;
  const it = items[viewerState.idx];
  const img = viewerEl.querySelector('.alt-viewer-fig img');
  const swap = () => {
    img.src = it.src;
    viewerEl.querySelector('figcaption b').textContent = it.title;
    viewerEl.querySelector('figcaption span').textContent = `${it.sub} · ${viewerState.idx + 1}/${items.length}`;
    viewerEl.querySelectorAll('.alt-viewer-thumbs button').forEach((b, i) => b.classList.toggle('is-active', i === viewerState.idx));
    gsap.fromTo(img, { opacity: 0, filter: 'blur(14px)', scale: 1.02 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.7, ease: 'power2.out' });
  };
  if (animate) gsap.to(img, { opacity: 0, filter: 'blur(10px)', duration: 0.25, onComplete: swap });
  else swap();
}
function closeViewer() {
  gsap.to(viewerEl, { opacity: 0, duration: 0.3 });
  setTimeout(() => { viewerEl.hidden = true; viewerEl.innerHTML = ''; viewerState = null; }, 310);
}

/* ------------------------------------------------------------------ common actions */
function bindCommon(root) {
  root.querySelectorAll('[data-act]').forEach(el => {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', e => {
      e.stopPropagation();
      const a = el.dataset.act;
      const d = el.dataset;
      switch (a) {
        case 'back': return back();
        case 'book': { const m = document.getElementById('vtBasvuruModal'); if (m) m.classList.add('active'); return; }
        case 'open-floor-page': return go('floor', { block: d.block, floor: Number(d.floor) });
        case 'show-tower': return go('tower', { block: d.block, floor: Number(d.floor) });
        case 'office': return go('office', { code: d.code });
        case 'stack-close': { const p = pageEl.querySelector('#altStackPanel'); if (p) { p.hidden = true; } pageEl.querySelectorAll('.alt-cell').forEach(c => c.classList.remove('is-sel')); return; }
        case 'filters-page': return toggleFilters();
        case 'viewer-close': return closeViewer();
        case 'viewer-prev': return showViewer(viewerState.idx - 1);
        case 'viewer-next': return showViewer(viewerState.idx + 1);
        default: return;
      }
    });
  });
}

function toggleFilters(force) {
  const pop = hero.querySelector('.alt-filters');
  pop.hidden = force === undefined ? !pop.hidden : !force;
}

/* direct floor picking on the render: hover highlights the floor under the
 * cursor, click selects it (sidebar + info tooltip follow), a second click on
 * the selected floor opens its plan */
function hitAt(e) {
  if (!metrics || S.screen !== 'tower') return null;
  const r = hero.getBoundingClientRect();
  return facadeHit((e.clientX - r.left - metrics.x0) / metrics.imgW, (e.clientY - r.top - metrics.y0) / metrics.imgH);
}
let facadeHover = null, unhoverT = 0;
const unhover = () => { clearTimeout(unhoverT); unhoverT = 0; if (facadeHover) { facadeHover = null; hoverFloor(null); } };
bgEl.addEventListener('pointermove', e => {
  const hit = hitAt(e);
  bgEl.classList.toggle('is-hit', !!hit);
  if (hit) {
    clearTimeout(unhoverT); unhoverT = 0;
    if (!sameFloor(hit, facadeHover)) { facadeHover = hit; hoverFloor(hit.block, hit.floor); }
  } else if (facadeHover && !unhoverT) {
    // short grace period: crossing the gap between two buildings must not flash the selected floor's panel back
    unhoverT = setTimeout(unhover, 160);
  }
});
bgEl.addEventListener('pointerleave', () => { bgEl.classList.remove('is-hit'); unhover(); });

/* tower chrome events */
hero.querySelector('.alt-tower').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn && bgEl.contains(e.target)) {
    const hit = hitAt(e);
    if (hit) {
      if (sameFloor(hit, S.sel)) openFloor(hit.block, hit.floor);
      else selectFloor(hit.block, hit.floor, true);
      return;
    }
  }
  if (!btn) { if (S.sel && !e.target.closest('.alt-floors, .alt-tip')) clearSel(); return; }
  e.stopPropagation();
  const a = btn.dataset.act;
  if (a === 'angle-prev') setAngle(S.angle - 1, -1);
  if (a === 'angle-next') setAngle(S.angle + 1, 1);
  if (a === 'stacking') go('stacking');
  if (a === 'filters') toggleFilters();
});
hero.querySelectorAll('.alt-time').forEach(b => b.addEventListener('click', () => setTime(b.dataset.time)));
hero.querySelectorAll('.alt-filters input').forEach(cb => cb.addEventListener('change', () => { S.filters[cb.dataset.status] = cb.checked; applyFilters(); }));
hero.querySelectorAll('.alt-nav-item').forEach(b => b.addEventListener('click', () => {
  const id = b.dataset.nav;
  if (id === 'tower') go('tower', S.sel ? { ...S.sel } : {});
  else go(id);
}));
bindCommon(barEl);
bindCommon(landingEl);
hero.querySelector('[data-act="enter"]').addEventListener('click', () => enter());
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!viewerEl.hidden) return closeViewer();
    if (S.screen === 'landing') return enter();
    if (S.screen !== 'tower') return back();
    if (S.sel) return clearSel();
  }
  if (S.screen === 'tower' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) setAngle(S.angle + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight' ? 1 : -1);
});
document.addEventListener('click', e => { if (!e.target.closest('.alt-filters, [data-act="filters"]')) toggleFilters(false); });

/* ------------------------------------------------------------------ landing / enter */
function enter(immediate = false) {
  if (S.entered) return;
  S.entered = true;
  S.screen = 'tower';
  setNav('tower');
  hero.classList.add('is-entered');
  const d = immediate ? 0 : 1;
  gsap.to(landingEl, { opacity: 0, duration: 0.7 * d, ease: 'power2.inOut', onComplete: () => { landingEl.hidden = true; } });
  gsap.fromTo(barEl, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.8 * d, delay: 0.3 * d, ease: 'power2.out' });
  gsap.fromTo(hero.querySelectorAll('.alt-floors, .alt-times, .alt-angle, .alt-tower-actions'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 * d, stagger: 0.08 * d, delay: 0.45 * d, ease: 'power3.out' });
  gsap.fromTo(bgImgs.get(bgKey(S.angle, S.time)), { scale: 1.06 }, { scale: 1, duration: 2.4 * d, ease: 'power2.out' });
}

/* ------------------------------------------------------------------ boot */
function boot() {
  buildFloors();
  setAngle(0, 1);
  setTime('day');
  window.addEventListener('resize', () => { measure(); });
  landingEl.hidden = false;
  gsap.fromTo(landingEl.querySelectorAll('.alt-landing-body > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, delay: 0.4, ease: 'power3.out' });
  gsap.fromTo(bgEl, { scale: 1.08 }, { scale: 1, duration: 3.5, ease: 'power2.out' });
}
if (document.readyState === 'complete') boot();
else window.addEventListener('load', () => setTimeout(boot, 350), { once: true });

/* test helper: a clickable screen point (client px) on the visible part of a floor in the current angle */
function probeFloor(block, floor, avoid = null) {   // avoid = [left, top, right, bottom] client rect to stay out of
  const g = ANGLES[S.angle].blocks[block];
  if (!g || !g.cols || g.behind || !metrics) return null;
  const r = hero.getBoundingClientRect(), c0 = g.cols[0][0], c1 = g.cols[g.cols.length - 1][0], ok = [];
  for (const v of [0.5, 0.3, 0.7, 0.15]) {   // band middle first, then towards its edges
    for (let i = 1; i < 60; i++) {
      const x = c0 + (c1 - c0) * i / 60, c = colAt(g.cols, x), y = lineY(c, 8 - floor + v);
      const px = r.left + metrics.x0 + x * metrics.imgW, py = r.top + metrics.y0 + y * metrics.imgH;
      if (px < r.left + 200 || px > r.right - 110 || py < r.top + 170 || py > r.bottom - 100) continue;
      if (avoid && px > avoid[0] && px < avoid[2] && py > avoid[1] && py < avoid[3]) continue;
      if (sameFloor(facadeHit(x, y), { block, floor }) && document.elementFromPoint(px, py)?.closest('.alt-bg')) ok.push([px, py]);
    }
    if (ok.length) break;
  }
  return ok.length ? ok[Math.floor(ok.length / 2)] : null;
}

window.vtHero = { S, go, back, enter, hoverFloor, selectFloor, openFloor, setAngle, setTime, selectStack, openViewer, closeViewer,
  clearSel, facadeHit, probeFloor };
