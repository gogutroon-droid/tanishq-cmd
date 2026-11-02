const { chromium } = require('playwright');
const path = require('path');

const devices = [
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'ipad-mini', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

(async () => {
  const browser = await chromium.launch();

  for (const dev of devices) {
    const page = await browser.newPage({ viewport: { width: dev.width, height: dev.height } });
    const fileUrl = 'file:///' + path.resolve('imagica.html').split(path.sep).join('/');
    await page.goto(fileUrl);
    await page.waitForTimeout(400);

    const intro = await page.$('#intro');
    if (intro) {
      await intro.click();
      await page.waitForTimeout(600);
    }

    // Capture Slide 0
    await page.screenshot({ path: `tests/screenshots/showcase-${dev.name}-slide-0.png` });

    // Capture Slide 1 (Project 1)
    await page.evaluate(() => navigateTo(1));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `tests/screenshots/showcase-${dev.name}-slide-1.png` });

    // Capture Slide 8 (About Me / Slide 09)
    await page.evaluate(() => navigateTo(8));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screenshots/showcase-${dev.name}-slide-8.png` });

    // Capture Slide 9 (Contact / Slide 10)
    await page.evaluate(() => navigateTo(9));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screenshots/showcase-${dev.name}-slide-9.png` });

    await page.close();
    console.log(`Rendered clean showcase for ${dev.name}`);
  }

  await browser.close();
  console.log('All device showcase screenshots successfully refreshed.');
})();
