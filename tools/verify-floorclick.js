/* Direct floor picking on the building renders – automated desktop check.
 * For every traced camera angle and every visible floor of every block: hover the
 * floor with the real mouse, click it, then check that the hovered/selected floor,
 * the highlighted band, the sidebar row and the info tooltip all agree.
 * Also checks: occluded podium areas and hidden floors take no clicks, a second
 * click opens the floor plan, back keeps the selection, angle switch keeps it.
 * Usage: node tools/verify-floorclick.js   (server running; URL env, default :5173)
 * Output: console report + demo/shots/fc-*.png */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = path.join(__dirname, '..', 'demo', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const ANGLE_IDS = ['aerial', 'topdown', 'frontal', 'plaza', 'road', 'closeup'];
const TRACED = ['aerial', 'frontal', 'road', 'closeup'];

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('  FAIL', msg); } };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.vtHero);
  const cookie = page.locator('#cookieAccept');
  if (await cookie.isVisible().catch(() => false)) await cookie.click();
  await page.evaluate(() => vtHero.enter(true));
  await page.waitForTimeout(2800);   // let the entry zoom finish

  const state = () => page.evaluate(() => {
    const tip = document.querySelector('.alt-tip');
    return {
      hover: vtHero.S.hover, sel: vtHero.S.sel, screen: vtHero.S.screen,
      bands: [...document.querySelectorAll('.alt-band')].map(b => b.getAttribute('class').replace('alt-band ', '')),
      rowSel: [...document.querySelectorAll('.alt-frow.is-sel')].map(l => l.dataset.block + l.dataset.floor),
      rowHot: [...document.querySelectorAll('.alt-frow.is-hot')].map(l => l.dataset.block + l.dataset.floor),
      tip: tip.hidden ? null : tip.querySelector('b')?.textContent, tipSel: tip.classList.contains('is-sel'),
      tipBtn: !!tip.querySelector('.alt-tip-open') && getComputedStyle(tip.querySelector('.alt-tip-open')).display !== 'none',
    };
  });
  const setAngle = async id => { await page.evaluate(i => vtHero.setAngle(i), ANGLE_IDS.indexOf(id)); await page.waitForTimeout(1300); };
  const name = { A: 'A Blok', B: 'B Blok', C: 'C Blok', D: 'D Blok' };

  // 1 · every visible floor in every traced angle: hover + click
  for (const angle of TRACED) {
    await setAngle(angle);
    const blocks = ['A', 'B', 'C', 'D'];   // probeFloor returns null where a floor has no visible area
    let tested = 0, skipped = [];
    for (const b of blocks) {
      for (let f = 1; f <= 8; f++) {
        const pt = await page.evaluate(([b, f]) => vtHero.probeFloor(b, f), [b, f]);
        if (!pt) { skipped.push(b + f); continue; }
        await page.evaluate(() => vtHero.clearSel());
        await page.mouse.move(pt[0], pt[1], { steps: 3 });
        await page.waitForTimeout(60);
        let s = await state();
        ok(s.hover && s.hover.block === b && s.hover.floor === f, `${angle} hover ${b}${f} → ${JSON.stringify(s.hover)}`);
        ok(s.bands.includes('is-hover'), `${angle} ${b}${f} hover band drawn`);
        ok(s.rowHot.join() === b + f, `${angle} ${b}${f} sidebar hover row ${s.rowHot}`);
        ok(s.tip === `${name[b]} · ${f}. Kat`, `${angle} ${b}${f} hover tooltip "${s.tip}"`);
        await page.mouse.down(); await page.mouse.up();
        await page.waitForTimeout(60);
        s = await state();
        ok(s.sel && s.sel.block === b && s.sel.floor === f, `${angle} click ${b}${f} → sel ${JSON.stringify(s.sel)}`);
        ok(s.bands.includes('is-sel'), `${angle} ${b}${f} selected band drawn`);
        ok(s.rowSel.join() === b + f, `${angle} ${b}${f} sidebar selected row ${s.rowSel}`);
        ok(s.tip === `${name[b]} · ${f}. Kat` && s.tipSel && s.tipBtn, `${angle} ${b}${f} info tooltip "${s.tip}" sel=${s.tipSel} btn=${s.tipBtn}`);
        ok(s.screen === 'tower', `${angle} ${b}${f} stays on tower`);
        tested++;
      }
    }
    console.log(`${angle}: ${tested} floors hovered+clicked; not clickable here: ${skipped.join(' ') || '–'}`);
  }

  // 2 · occluded podium, hidden floor, sky → no selection
  await setAngle('road');
  await page.evaluate(() => vtHero.selectFloor('A', 4));
  const probes = await page.evaluate(() => {
    const m = document.querySelector('.alt-ov').getBoundingClientRect();
    const at = (x, y) => [m.left + x * m.width, m.top + y * m.height];
    return { podium: at(0.66, 0.74), hiddenB1: at(0.66, 0.735), sky: at(0.45, 0.30), b1hit: vtHero.facadeHit(0.66, 0.745) };
  });
  ok(probes.b1hit === null, 'road: B floor 1 (behind parapet) is not hit-testable');
  await page.mouse.move(...probes.podium); await page.waitForTimeout(300);   // hover clears after the 160 ms grace period
  let s = await state();
  ok(!s.hover, `road podium hover → ${JSON.stringify(s.hover)}`);
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(60);
  s = await state();
  ok(!s.sel && s.rowSel.length === 0, 'road podium click clears selection, no floor picked');
  await page.evaluate(() => vtHero.selectFloor('B', 6));
  await page.mouse.move(...probes.sky); await page.waitForTimeout(60);
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(60);
  s = await state();
  ok(!s.sel, 'click on sky clears selection');

  // 3 · second click on the selected floor opens its plan; back keeps the selection
  await setAngle('frontal');
  const p = await page.evaluate(() => vtHero.probeFloor('C', 6));
  await page.mouse.move(p[0], p[1], { steps: 4 }); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/fc-frontal-C6-selected.png` });
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(1500);
  s = await state();
  const head = await page.evaluate(() => document.querySelector('.alt-page .alt-ph')?.textContent.replace(/\s+/g, ' '));
  ok(s.screen === 'floor' && /C Blok/.test(head) && /6/.test(head), `second click opens floor plan: ${s.screen} "${head}"`);
  await page.screenshot({ path: `${OUT}/fc-frontal-C6-plan.png` });
  await page.evaluate(() => vtHero.back()); await page.waitForTimeout(1500);
  s = await state();
  ok(s.screen === 'tower' && s.sel && s.sel.block === 'C' && s.sel.floor === 6 && s.rowSel.join() === 'C6' && s.bands.includes('is-sel'), `back keeps C6 selected: ${JSON.stringify(s.sel)} ${s.rowSel}`);

  // 4 · selection survives angle changes (drawn where visible, tooltip note where not)
  for (const angle of ['aerial', 'road', 'closeup', 'topdown']) {
    await setAngle(angle);
    s = await state();
    ok(s.sel && s.sel.block === 'C' && s.sel.floor === 6 && s.rowSel.join() === 'C6', `${angle}: C6 still selected`);
    console.log(`  ${angle}: C6 band ${s.bands.includes('is-sel') ? 'drawn' : 'not drawn (not visible from here)'}`);
  }

  // 5 · tooltip button opens the plan
  await setAngle('road');
  const q = await page.evaluate(() => vtHero.probeFloor('B', 3));
  await page.mouse.move(q[0], q[1], { steps: 4 }); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/fc-road-B3-selected.png` });
  await page.locator('.alt-tip .alt-tip-open').click(); await page.waitForTimeout(1500);
  s = await state();
  ok(s.screen === 'floor', `"Katı aç" opens the floor plan (${s.screen})`);
  await page.evaluate(() => vtHero.back()); await page.waitForTimeout(1500);

  // 6 · sidebar still drives the facade (existing behaviour)
  await setAngle('aerial');
  await page.locator('.alt-frow[data-block="D"][data-floor="7"]').hover(); await page.waitForTimeout(100);
  s = await state();
  ok(s.hover && s.hover.block === 'D' && s.hover.floor === 7 && s.bands.includes('is-hover'), 'sidebar hover still highlights the facade');

  // review shots: selected + hovered on each traced view
  const shots = [['aerial', 'B', 6, 'A', 3], ['frontal', 'A', 4, 'B', 7], ['road', 'C', 5, 'A', 6], ['closeup', 'A', 2, 'A', 6]];
  for (const [angle, sb, sf, hb, hf] of shots) {
    await setAngle(angle);
    await page.evaluate(([b, f]) => vtHero.selectFloor(b, f), [sb, sf]);
    const h = await page.evaluate(([b, f]) => vtHero.probeFloor(b, f), [hb, hf]);
    await page.mouse.move(h[0], h[1], { steps: 3 }); await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/fc-${angle}-sel${sb}${sf}-hover${hb}${hf}.png` });
  }
  await page.evaluate(() => vtHero.setTime('night')); await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/fc-closeup-night.png` });

  console.log(`\nchecks: ${checks}, failures: ${fails}, page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
