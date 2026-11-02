/* Desktop screenshot pass over every screen of the reel-faithful hero.
 * Usage: node tools/verify.js   (server must be running on :5173) → demo/shots/ */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'demo', 'shots');
const URL = process.env.URL || 'http://localhost:5173/';
fs.mkdirSync(OUT, { recursive: true });

const wait = (p, ms) => p.waitForTimeout(ms);
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/passive event listener/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.vtHero, null, { timeout: 20000 });
  const cookie = page.locator('#cookieAccept');
  if (await cookie.isVisible().catch(() => false)) await cookie.click();
  await wait(page, 2500);
  await shot(page, 'r00-landing');

  await page.click('[data-act="enter"]');
  await wait(page, 2200);
  await shot(page, 'r01-tower');

  await page.hover('.alt-frow[data-block="A"][data-floor="5"]');
  await wait(page, 500);
  await shot(page, 'r02-hover-A5');

  await page.hover('.alt-frow[data-block="B"][data-floor="2"]');
  await wait(page, 500);
  await shot(page, 'r03-hover-B2');

  await page.click('.alt-frow[data-block="A"][data-floor="5"]');
  await wait(page, 1500);
  await shot(page, 'r04-floor');
  await page.hover('.alt-urow[data-unit="13"]');
  await wait(page, 400);
  await shot(page, 'r05-floor-hover');

  await page.click('.alt-floor-side [data-act="view"]');
  await wait(page, 1800);
  await shot(page, 'r06-view');
  await page.evaluate(() => vtHero.setViewFloor(8));
  await wait(page, 1200);
  await shot(page, 'r07-view-f8');
  await page.click('.alt-dir[data-dir="D"]');
  await wait(page, 1600);
  await shot(page, 'r08-view-dir');

  await page.click('.alt-nav-item[data-nav="stacking"]');
  await wait(page, 1500);
  await shot(page, 'r09-stacking');
  await page.click('.alt-cell[data-code="B-614"]');
  await wait(page, 900);
  await shot(page, 'r10-stacking-panel');

  await page.click('#altStackPanel [data-act="office"]');
  await wait(page, 2200);
  await shot(page, 'r11-office');
  await page.evaluate(() => document.querySelector('.alt-page').scrollTo({ top: 620 }));
  await wait(page, 800);
  await shot(page, 'r12-office-facts');
  await page.evaluate(() => document.querySelector('.alt-page').scrollTo({ top: 1500 }));
  await wait(page, 800);
  await shot(page, 'r13-office-plan');
  await page.evaluate(() => document.querySelector('.alt-page').scrollTo({ top: 2500 }));
  await wait(page, 800);
  await shot(page, 'r14-office-interiors');

  await page.click('.alt-nav-item[data-nav="amenities"]');
  await wait(page, 1500);
  await shot(page, 'r15-amenities');
  await page.click('.alt-amen-row[data-id="lobby"]');
  await wait(page, 1000);
  await shot(page, 'r16-amenities-lobby');
  await page.click('.alt-amen-thumbs button[data-idx="1"]');
  await wait(page, 1000);
  await shot(page, 'r17-viewer');
  await page.keyboard.press('Escape');
  await wait(page, 500);

  await page.click('.alt-nav-item[data-nav="neighborhood"]');
  await wait(page, 1500);
  await page.hover('.alt-drive li[data-id="kentpark"]');
  await wait(page, 400);
  await shot(page, 'r18-neighborhood');

  await page.click('.alt-nav-item[data-nav="design"]');
  await wait(page, 1500);
  await page.hover('.alt-points li[data-i="1"]');
  await wait(page, 500);
  await shot(page, 'r19-design');

  await page.click('.alt-nav-item[data-nav="gallery"]');
  await wait(page, 1800);
  await shot(page, 'r20-gallery');

  await page.click('.alt-nav-item[data-nav="tower"]');
  await wait(page, 1500);
  await page.click('.alt-time[data-time="gold"]');
  await wait(page, 1400);
  await shot(page, 'r21-gold');
  await page.click('.alt-time[data-time="night"]');
  await wait(page, 1400);
  await page.hover('.alt-frow[data-block="B"][data-floor="6"]');
  await wait(page, 400);
  await shot(page, 'r22-night-hover');
  await page.click('[data-act="angle-next"]');
  await wait(page, 1400);
  await shot(page, 'r23-angle-topdown');
  await page.click('[data-act="angle-next"]');
  await wait(page, 1400);
  await page.hover('.alt-frow[data-block="A"][data-floor="3"]');
  await wait(page, 400);
  await shot(page, 'r24-angle-frontal');
  await page.click('[data-act="angle-next"]');
  await wait(page, 1400);
  await shot(page, 'r25-angle-plaza');
  await page.click('[data-act="angle-next"]');
  await wait(page, 1400);
  await page.hover('.alt-frow[data-block="B"][data-floor="4"]');
  await wait(page, 400);
  await shot(page, 'r26-angle-road');
  await page.click('[data-act="filters"]');
  await wait(page, 400);
  await shot(page, 'r27-filters');

  await ctx.close();
  await browser.close();
  console.log('errors:', errors.length ? errors : 'none');
})().catch(e => { console.error(e); process.exit(1); });
