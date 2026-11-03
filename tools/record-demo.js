/* Records the desktop walkthrough in the same order as the reference reel
 * (landing → tower → floor → office → stacking → amenities → neighborhood → design → gallery → tower night).
 * Usage: node tools/record-demo.js   (server must be running on :5173)
 * Output: demo/vantage-hero-desktop.mp4 */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.env.URL || 'http://localhost:5173/';
const RAW = path.join(__dirname, '..', 'demo', 'raw');
const OUT = path.join(__dirname, '..', 'demo');
fs.mkdirSync(RAW, { recursive: true });

const wait = (page, ms) => page.waitForTimeout(ms);
async function center(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('no box for ' + selector);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
async function glide(page, selector, steps = 24) {
  const c = await center(page, selector);
  await page.mouse.move(c.x, c.y, { steps });
}
async function glideClick(page, selector, dwell = 450) {
  await glide(page, selector);
  await wait(page, dwell);
  await page.mouse.down(); await page.mouse.up();
}
async function hoverSeq(page, selectors, dwell = 600) {
  for (const s of selectors) { await glide(page, s, 12); await wait(page, dwell); }
}
async function scrollPage(page, top, ms = 1200) {
  await page.evaluate(t => document.querySelector('.alt-page').scrollTo({ top: t, behavior: 'smooth' }), top);
  await wait(page, ms);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    recordVideo: { dir: RAW, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.vtHero, null, { timeout: 20000 });
  const cookie = page.locator('#cookieAccept');
  if (await cookie.isVisible().catch(() => false)) await cookie.click();
  await page.mouse.move(720, 500);
  await wait(page, 3200);

  // 1 · landing → enter
  await glideClick(page, '[data-act="enter"]', 700);
  await wait(page, 2600);

  // 2 · tower: floor stack hover, tooltip on the building
  await hoverSeq(page, ['.alt-frow[data-block="A"][data-floor="8"]', '.alt-frow[data-block="A"][data-floor="7"]', '.alt-frow[data-block="A"][data-floor="6"]', '.alt-frow[data-block="A"][data-floor="5"]'], 650);
  await hoverSeq(page, ['.alt-frow[data-block="B"][data-floor="8"]', '.alt-frow[data-block="B"][data-floor="6"]', '.alt-frow[data-block="B"][data-floor="3"]'], 650);
  await page.mouse.move(720, 760, { steps: 16 }); await wait(page, 500);

  // 3 · time of day + camera angles
  await glideClick(page, '.alt-time[data-time="gold"]', 400); await wait(page, 1600);
  await glideClick(page, '.alt-time[data-time="night"]', 400); await wait(page, 1800);
  await glideClick(page, '.alt-time[data-time="day"]', 300); await wait(page, 1300);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1500);   // topdown
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1300);   // frontal
  await hoverSeq(page, ['.alt-frow[data-block="A"][data-floor="4"]', '.alt-frow[data-block="A"][data-floor="3"]'], 700);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1400);   // plaza
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1300);   // road
  await hoverSeq(page, ['.alt-frow[data-block="B"][data-floor="5"]', '.alt-frow[data-block="B"][data-floor="4"]'], 700);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1400);   // closeup
  await hoverSeq(page, ['.alt-frow[data-block="A"][data-floor="6"]'], 800);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1400);   // aerial

  // 4 · pick a floor → floor plan page
  await hoverSeq(page, ['.alt-frow[data-block="A"][data-floor="5"]'], 700);
  await page.mouse.down(); await page.mouse.up();
  await wait(page, 2200);
  await hoverSeq(page, ['.alt-urow[data-unit="11"]', '.alt-urow[data-unit="13"]', '.alt-pu[data-unit="18"]', '.alt-pu[data-unit="16"]'], 650);

  // 5 · office page
  await glideClick(page, '.alt-urow[data-unit="16"]', 500);
  await wait(page, 2600);
  await scrollPage(page, 520, 1500);
  await scrollPage(page, 1250, 1500);
  await scrollPage(page, 2050, 1400);
  await scrollPage(page, 2650, 1300);
  await glideClick(page, '.alt-int-tabs button:nth-child(2)', 300); await wait(page, 1400);
  await glideClick(page, '[data-int="kucuk"]', 300); await wait(page, 1400);

  // 7 · stacking plan
  await glideClick(page, '.alt-nav-item[data-nav="stacking"]', 300);
  await wait(page, 2000);
  await glideClick(page, '.alt-cell[data-code="B-614"]', 400); await wait(page, 1500);
  await glideClick(page, '.alt-cell[data-code="C-318"]', 400); await wait(page, 1500);
  await glideClick(page, '.alt-cell[data-code="A-713"]', 400); await wait(page, 1500);

  // 8 · amenities by level
  await glideClick(page, '.alt-nav-item[data-nav="amenities"]', 300);
  await wait(page, 1800);
  await hoverSeq(page, ['.alt-amen-row[data-id="roof"]', '.alt-amen-row[data-id="office"]', '.alt-amen-row[data-id="lobby"]'], 1100);
  await page.click('.alt-amen-row[data-id="lobby"]'); await wait(page, 500);
  await page.click('.alt-amen-thumbs button[data-idx="1"]'); await wait(page, 1600);
  await page.click('[data-act="viewer-next"]'); await wait(page, 1300);
  await page.click('[data-act="viewer-next"]'); await wait(page, 1300);
  await page.click('[data-act="viewer-close"]'); await wait(page, 900);

  // 9 · neighborhood
  await glideClick(page, '.alt-nav-item[data-nav="neighborhood"]', 300);
  await wait(page, 1800);
  await hoverSeq(page, ['.alt-drive li[data-id="kentpark"]', '.alt-drive li[data-id="metro"]', '.alt-drive li[data-id="bakanlik"]', '.alt-drive li[data-id="esenboga"]'], 750);

  // 10 · design
  await glideClick(page, '.alt-nav-item[data-nav="design"]', 300);
  await wait(page, 1800);
  await hoverSeq(page, ['.alt-points li[data-i="0"]', '.alt-points li[data-i="1"]', '.alt-points li[data-i="3"]'], 850);

  // 11 · gallery
  await glideClick(page, '.alt-nav-item[data-nav="gallery"]', 300);
  await wait(page, 1900);
  await scrollPage(page, 380, 1200);
  await page.click('.alt-gal-card[data-g="dis"][data-i="1"]'); await wait(page, 1600);
  await page.click('[data-act="viewer-next"]'); await wait(page, 1300);
  await page.click('[data-act="viewer-next"]'); await wait(page, 1300);
  await page.click('[data-act="viewer-close"]'); await wait(page, 900);

  // 12 · back to the tower at night, final rotation
  await glideClick(page, '.alt-nav-item[data-nav="tower"]', 300);
  await wait(page, 1600);
  await glideClick(page, '.alt-time[data-time="night"]', 300); await wait(page, 1800);
  await hoverSeq(page, ['.alt-frow[data-block="B"][data-floor="7"]', '.alt-frow[data-block="B"][data-floor="6"]'], 800);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1500);
  await glideClick(page, '[data-act="angle-next"]', 300); await wait(page, 1500);
  await glideClick(page, '[data-act="angle-prev"]', 300); await wait(page, 1200);
  await glideClick(page, '[data-act="angle-prev"]', 300); await wait(page, 2400);

  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  const out = path.join(OUT, 'vantage-hero-desktop.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  const out720 = path.join(OUT, 'vantage-hero-desktop-720p.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out720]);
  fs.rmSync(RAW, { recursive: true, force: true });
  for (const f of [out, out720]) console.log('wrote', f, (fs.statSync(f).size / 1e6).toFixed(1) + ' MB');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
