import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.SITE_BASE || 'http://127.0.0.1:8104/';
const manifest = JSON.parse(await fs.readFile('route-manifest.json', 'utf8'));
const routes = [...manifest.indexable_core, ...manifest.legal_noindex, ...manifest.technical_noindex];
for (const article of (await fs.readdir('materialy')).filter((file) => file.endsWith('.html'))) routes.push(`materialy/${article}`);
const widths = [320, 375, 390, 430, 1024, 1280, 1440];
const screenshotRoutes = new Set(['index.html', 'diagnostic.html', 'format.html', 'materialy.html', 'materialy/trevoga-u-predprinimatelya.html', 'video.html', 'about.html', 'politika-obrabotki-pd.html', 'polzovatelskoe-soglashenie.html']);
const publicRoutes = new Set([...manifest.indexable_core, ...routes.filter((route) => route.startsWith('materialy/'))]);
const out = process.env.VIEWPORT_REPORT_DIR || 'artifacts/viewport';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const report = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
page.on('pageerror', (error) => failures.push(`runtime error: ${error.message}`));
for (const route of routes) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const url = new URL(route, base).href;
    let response;
    try { response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); }
    catch (error) { failures.push(`${route} @ ${width}px: navigation failed: ${error.message}`); continue; }
    const result = await page.evaluate(() => {
      const actionable = [...document.querySelectorAll('a,button,input,select,textarea')].filter((el) => {
        const style = getComputedStyle(el); const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      const clipped = actionable.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1 || rect.bottom < rect.top;
      });
      const images = [...document.images].map((img) => ({ src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 }));
      const sticky = document.querySelector('.mobile-sticky-cta');
      const stickyRect = sticky?.getBoundingClientRect();
      const stickyVisible = Boolean(sticky && getComputedStyle(sticky).display !== 'none' && getComputedStyle(sticky).visibility !== 'hidden' && stickyRect?.height);
      const stickyOverlap = stickyVisible && actionable.some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.right > stickyRect.left && rect.left < stickyRect.right && rect.bottom > stickyRect.top && rect.top < stickyRect.bottom && el !== sticky;
      });
      return {
        title: document.title.trim(), h1: Boolean(document.querySelector('h1')),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        nav: Boolean(document.querySelector('.site-nav')),
        menu: window.innerWidth < 760 ? Boolean(document.querySelector('.menu-toggle')) : true,
        offer: Boolean(document.body.innerText.match(/50\s*минут|10\s*000\s*RUB|150\s*USD/i)),
        clipped: clipped.length,
        stickyOverlap,
        images
      };
    });
    const row = { route, width, status: response?.status() ?? 0, ...result };
    report.push(row);
    if (row.status !== 200) failures.push(`${route} @ ${width}px: HTTP ${row.status}`);
    if (!row.title || !row.h1) failures.push(`${route} @ ${width}px: missing title or H1`);
    if (row.overflow) failures.push(`${route} @ ${width}px: horizontal overflow`);
    if (publicRoutes.has(route) && !row.menu) failures.push(`${route} @ ${width}px: mobile menu button missing`);
    if (publicRoutes.has(route) && ['diagnostic.html', 'format.html', 'contact.html'].includes(route) && !row.offer) failures.push(`${route} @ ${width}px: canonical offer missing`);
    if (row.clipped) failures.push(`${route} @ ${width}px: ${row.clipped} actionable element(s) clipped`);
    if (row.stickyOverlap) failures.push(`${route} @ ${width}px: sticky CTA overlaps an actionable element`);
    if (row.images.some((image) => !image.loaded)) failures.push(`${route} @ ${width}px: image failed to load`);
    if (screenshotRoutes.has(route) && (width === 390 || width === 1440)) {
      const file = path.join(out, `${route.replaceAll('/', '__').replace('.html', '')}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
    }
  }
}
await browser.close();
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify({ base, widths, routes, report, failures }, null, 2));
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`viewport smoke passed: ${routes.length} routes × ${widths.length} widths`);
