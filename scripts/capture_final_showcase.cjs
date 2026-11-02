const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const filePath = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(500);

  const intro = await page.$('#intro');
  if (intro) {
    await intro.click();
    await page.waitForTimeout(1100);
  }

  // Slide 09: Profile & Philosophy
  await page.evaluate(() => navigateTo(8));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'tests/screenshots/final-slide-09-desktop.png' });
  console.log('Saved final-slide-09-desktop.png');

  // Slide 10: HOLA. / Contact
  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'tests/screenshots/final-slide-10-desktop.png' });
  console.log('Saved final-slide-10-desktop.png');

  // Also capture at mockup viewport 2976x1436
  await page.setViewportSize({ width: 2976, height: 1436 });
  await page.evaluate(() => navigateTo(8));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'tests/screenshots/final-slide-09-mockup-res.png' });
  console.log('Saved final-slide-09-mockup-res.png');

  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'tests/screenshots/final-slide-10-mockup-res.png' });
  console.log('Saved final-slide-10-mockup-res.png');

  await browser.close();
})();
