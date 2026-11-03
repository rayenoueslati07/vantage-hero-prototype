/* Short desktop recording of direct floor picking on the building renders.
 * A visible cursor is drawn by the recorder only (Playwright videos have none);
 * the site itself is unchanged.
 * Usage: node tools/record-floorclick.js   (server running; URL env, default :5173)
 * Output: demo/vantage-floor-click-demo.mp4 (+ -720p) */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.env.URL || 'http://localhost:5173/';
const RAW = path.join(__dirname, '..', 'demo', 'raw');
const OUT = path.join(__dirname, '..', 'demo');
fs.mkdirSync(RAW, { recursive: true });

const CURSOR = `
  window.addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.id = 'rec-cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-200px,-200px)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))' });
    const ring = document.createElement('div');
    Object.assign(ring.style, { position: 'fixed', left: '0', top: '0', width: '34px', height: '34px', margin: '-17px 0 0 -17px', borderRadius: '50%', border: '2px solid #f4e2b8', zIndex: 2147483646, pointerEvents: 'none', opacity: '0' });
    document.body.append(ring, c);
    addEventListener('mousemove', e => { c.style.transform = 'translate(' + (e.clientX - 4) + 'px,' + (e.clientY - 2) + 'px)'; }, true);
    addEventListener('mousedown', e => {
      ring.style.transition = 'none'; ring.style.opacity = '1'; ring.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) scale(.4)';
      requestAnimationFrame(() => { ring.style.transition = 'transform .45s ease-out, opacity .45s ease-out'; ring.style.opacity = '0'; ring.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) scale(1.4)'; });
    }, true);
  });`;

const wait = (page, ms) => page.waitForTimeout(ms);
let cur = [720, 620];
async function move(page, x, y, steps) { await page.mouse.move(x, y, { steps }); cur = [x, y]; }
/* the selected floor's info panel is interactive; route the cursor around it like a person would */
const selPanel = page => page.evaluate(() => {
  if (!vtHero.S.sel) return null;
  const h = vtHero.S.hover; vtHero.hoverFloor(null);
  const t = document.querySelector('.alt-tip'), r = t.hidden ? null : t.getBoundingClientRect();
  vtHero.hoverFloor(h ? h.block : null, h ? h.floor : 0);
  return r && [r.left - 18, r.top - 18, r.right + 18, r.bottom + 18];
});
const crosses = (a, b, r) => { for (let i = 0; i <= 40; i++) { const x = a[0] + (b[0] - a[0]) * i / 40, y = a[1] + (b[1] - a[1]) * i / 40; if (x > r[0] && x < r[2] && y > r[1] && y < r[3]) return true; } return false; };
async function to(page, b, f, steps = 22) {
  const avoid = await selPanel(page);
  const p = await page.evaluate(([b, f, a]) => vtHero.probeFloor(b, f, a), [b, f, avoid]);
  if (!p) {
    const d = await page.evaluate(() => ({ angle: vtHero.S.angle, screen: vtHero.S.screen, sel: vtHero.S.sel }));
    throw new Error(`no visible point for ${b}${f} ` + JSON.stringify(d));
  }
  if (avoid && crosses(cur, p, avoid)) {
    const corners = [[avoid[0], avoid[1]], [avoid[2], avoid[1]], [avoid[0], avoid[3]], [avoid[2], avoid[3]]]
      .filter(c => !crosses(cur, c, avoid) && !crosses(c, p, avoid))
      .sort((m, n) => Math.hypot(m[0] - cur[0], m[1] - cur[1]) + Math.hypot(m[0] - p[0], m[1] - p[1]) - Math.hypot(n[0] - cur[0], n[1] - cur[1]) - Math.hypot(n[0] - p[0], n[1] - p[1]));
    if (corners.length) await move(page, corners[0][0], corners[0][1], Math.ceil(steps / 2));
  }
  await move(page, p[0], p[1], steps);
  const hv = await page.evaluate(() => vtHero.S.hover);
  if (!hv || hv.block !== b || hv.floor !== f) throw new Error(`cursor at ${b}${f} but hover is ${JSON.stringify(hv)}`);
  return p;
}
async function click(page) { await page.mouse.down(); await wait(page, 70); await page.mouse.up(); }
async function sweep(page, b, floors, dwell = 380) { for (const f of floors) { await to(page, b, f, 10); await wait(page, dwell); } }
async function btn(page, selector, steps = 20) {
  const box = await page.locator(selector).first().boundingBox();
  await move(page, box.x + box.width / 2, box.y + box.height / 2, steps);
  await wait(page, 250); await click(page);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: RAW, size: { width: 1440, height: 900 } } });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.vtHero);
  const cookie = page.locator('#cookieAccept');
  if (await cookie.isVisible().catch(() => false)) await cookie.click();
  await move(page, 720, 620, 1);
  await wait(page, 1800);
  await btn(page, '[data-act="enter"]');
  await wait(page, 2900);

  // aerial: hover down A, click A5; then B4; then D7 (back block)
  await sweep(page, 'A', [8, 7, 6, 5, 4, 3]);
  await to(page, 'A', 5, 12); await wait(page, 300); await click(page); await wait(page, 1400);
  await sweep(page, 'B', [7, 6, 5], 330);
  await to(page, 'B', 4, 10); await wait(page, 250); await click(page); await wait(page, 1300);
  await to(page, 'D', 7, 18); await wait(page, 350); await click(page); await wait(page, 1400);

  // frontal (via the angle buttons; the selection is kept)
  await btn(page, '.alt-angle [data-act="angle-next"]:last-of-type'); await wait(page, 1200);
  await btn(page, '.alt-angle [data-act="angle-next"]:last-of-type', 6); await wait(page, 1500);
  await sweep(page, 'C', [7, 6, 5, 4], 330);
  await to(page, 'C', 4, 10); await wait(page, 250); await click(page); await wait(page, 1300);
  await sweep(page, 'A', [8, 7, 6], 330);
  await to(page, 'A', 6, 10); await wait(page, 250); await click(page); await wait(page, 1300);
  await to(page, 'B', 3, 18); await wait(page, 300); await click(page); await wait(page, 1300);

  // road
  await btn(page, '.alt-angle [data-act="angle-next"]:last-of-type'); await wait(page, 1200);
  await btn(page, '.alt-angle [data-act="angle-next"]:last-of-type', 6); await wait(page, 1500);
  await sweep(page, 'B', [8, 6, 4], 330);
  await to(page, 'C', 5, 16); await wait(page, 300); await click(page); await wait(page, 1300);
  await to(page, 'A', 7, 16); await wait(page, 300); await click(page); await wait(page, 1300);

  // close-up: click A2, then click it again → existing floor plan page
  await btn(page, '.alt-angle [data-act="angle-next"]:last-of-type'); await wait(page, 1600);
  await sweep(page, 'A', [6, 4, 3], 330);
  await to(page, 'A', 2, 10); await wait(page, 300); await click(page); await wait(page, 1600);
  await click(page); await wait(page, 2600);
  await move(page, 980, 560, 20); await wait(page, 1200);

  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  const out = path.join(OUT, 'vantage-floor-click-demo.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  const out720 = path.join(OUT, 'vantage-floor-click-demo-720p.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out720]);
  fs.rmSync(webm, { force: true });
  console.log('video:', out, out720);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
