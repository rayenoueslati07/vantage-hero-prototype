# Vantage Office – reel-faithful interactive hero (prototype)

Desktop presentation prototype that reproduces the interface, navigation and floor-selection
experience of the reference Instagram reel, with the **Vantage Office** architecture, branding and
catalogue data in place of the reference project. Only the homepage hero of vantageoffice.com.tr is
replaced; the rest of the page is a byte-for-byte mirror of the live site.

> Local only – nothing is deployed. Availability, sample prices (₺), net/balcony splits and drive
> times are **demo data**, flagged "ÖRNEK" in the interface. Block structure, floor plan, unit sizes,
> shop and parking counts come from the Vantage catalogue and website.

## Live links

* **GitHub Pages (use this one):** https://rayenoueslati07.github.io/vantage-hero-prototype/ — redeploy with `git push` (public repo `rayenoueslati07/vantage-hero-prototype`).
* Vercel copy: https://vantage-hero-lake.vercel.app (team rayen8) — `*.vercel.app` is blocked on some Turkish networks, so prefer the Pages link.

## Launch

Requirements: Node.js 18+ (no build step, no external services).

```bash
cd vantage-hero
node serve.js
```

Open **http://localhost:5173** in Chrome or Edge at ≥ 1280 px width (desktop only by scope).
`npm start` does the same; another port: `node serve.js 8080`.

## Walkthrough (same order as the reel)

| Reel scene | Prototype |
|---|---|
| Landing: serif wordmark, "Enter", angle caption | `VANTAGE` landing → **Keşfet** |
| Tower: floor stack left, hover → floor band + tooltip on the building | Floor stack (A/B/C/D × 8 floors + ground), hover highlights the floor on the render |
| (client request) pick floors on the building itself | Hover any visible floor on the render → it highlights following the facade; click → selected (gold), sidebar row and info tooltip follow; click again or **Katı aç** → floor plan |
| Day / sunset / night, rotate camera angles | Gündüz · Altın saat · Gece; 6 camera angles (aerial, top-down, street, plaza, boulevard, close-up) |
| Click floor → floor plan page (cream plan card + unit table) | Catalogue B-block full-floor plan, hover-linked table, sample prices |
| Click unit → residence page (hero, key facts, plan 2D, view, interiors, book) | Office page with the same sections and the site's own "Bilgi Formu" modal as CTA |
| Stacking plan (4 columns of cells, legend, filters, side panel) | Yerleşim planı: 320 cells, status filters, unit panel |
| Ride the elevator: big floor number, elevator slider, direction buttons, blur crossfade | Katınızdan manzara: real drone horizon in 4 directions, floor 1–8 |
| Amenities by level: silhouette + list + image card + thumbnails → viewer | Kat kat olanaklar with gallery viewer |
| Neighborhood: schematic map + drive times | Çankaya map (schematic) + drive times |
| Design: diagram + numbered points | Yatay mimari diagram + 5 points |
| Gallery grid → viewer | 53 site gallery images by category |

Keyboard: `Esc` back/close, `←`/`→` rotate angle, `↑`/`↓` elevator.

## Files

```
index.html            site mirror; only the hero section inside <main> and 3 tags in <head>/<body> changed
css/hero.css          all hero styling (site tokens + Cormorant Garamond for the reel's serif)
js/hero/app.js        screens, camera/tooltip engine, elevator, stacking plan, viewer (vanilla ES module + GSAP)
js/hero/data.js       angles with traced facade quads, blocks, catalogue floor plan, demo generators, copy
js/hero/gsap.min.js   GSAP 3.12.5 (vendored)
img/hero/             web-sized renders (6 angles × day/gold/night), drone horizon views, plans/
img/galeri/           the live site's gallery (53 images)
serve.js              zero-dependency static server (answers /api/config.php with {})
tools/verify.js       Playwright screenshot pass → demo/shots/
tools/record-demo.js  Playwright walkthrough recording → demo/vantage-hero-desktop*.mp4
tools/verify-floorclick.js  hover + click every visible floor in every traced view, checks band/sidebar/tooltip sync
tools/record-floorclick.js  short floor-click recording → demo/vantage-floor-click-demo*.mp4
demo/compare/         reel-vs-prototype comparison page (index.html); rendered copy at demo/reel-vs-prototype.png
```

## Re-check / re-record

```bash
node serve.js                # terminal 1
node tools/verify.js         # screenshots → demo/shots
node tools/record-demo.js    # videos → demo/
```

## Known limitations (asset-driven)

* **No 3D model.** Camera angles are the client's six renders; floors are perspective-mapped bands measured from the
  slab edges of each facade (`cols` in `js/hero/data.js`), with podium parapets as occluders. Direct floor picking works
  in the four views with traced facades (Güneydoğudan, Caddeden, Bulvardan, Yakın plan); top-down and plaza keep the
  sidebar-only selection. Floors hidden behind another block or a podium are not clickable and say so in the tooltip.
* **Golden-hour and night** exist as real renders only for the main aerial; the other angles are colour-graded.
* **Horizon views** are frames from the client's drone orbit (hazy autumn day, construction site below the
  frame line), not renders. The floor slider scales/shifts the same frame.
* **Floor plan**: the catalogue only provides the B-block full-floor plan; it is reused for A/C/D.
* **3D plan toggle** in the office page is present but disabled (no 3D plan asset).
* **EN** language toggle is visual only.
