import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:8105/index.html', { waitUntil: 'networkidle' });

const menu = page.locator('.site-nav');
const more = page.locator('.nav-more');
const summary = page.locator('.nav-more summary');
const toggle = page.locator('.menu-toggle');

for (let cycle = 0; cycle < 100; cycle += 1) {
  await toggle.click();
  await menu.waitFor({ state: 'visible' });
  const state = await menu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      open: element.classList.contains('is-open'),
    };
  });
  if (!state.open || state.left < 0 || state.right > state.viewportWidth || state.top < 0 || state.bottom > state.viewportHeight || state.scrollWidth > state.clientWidth + 1) {
    throw new Error(`Unstable closed menu geometry at cycle ${cycle}: ${JSON.stringify(state)}`);
  }

  await summary.click();
  const expanded = await more.evaluate((element) => ({ open: element.open, width: element.getBoundingClientRect().width }));
  if (!expanded.open || expanded.width > state.clientWidth + 1) throw new Error(`More expansion overflow at cycle ${cycle}`);

  const expandedState = await menu.evaluate((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
  if (expandedState.scrollWidth > expandedState.clientWidth + 1) throw new Error(`Horizontal scroll appeared at cycle ${cycle}`);

  await summary.click();
  if (await more.getAttribute('open') !== null) throw new Error(`More did not collapse at cycle ${cycle}`);
  await toggle.click();
}

await toggle.click();
await summary.click();
await page.locator('.nav-more a[href="approach.html"]').click();
await page.waitForURL('**/approach.html');
console.log('mobile menu interaction passed: 100 cycles');
await browser.close();
