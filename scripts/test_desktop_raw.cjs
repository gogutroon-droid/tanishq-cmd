const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const fileUrl = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(fileUrl);
  await page.waitForTimeout(400);

  const intro = await page.$('#intro');
  if (intro) {
    await intro.click();
    await page.waitForTimeout(600);
  }

  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1600);

  await page.screenshot({ path: 'tests/screenshots/test-desktop-raw-s9.png' });
  await browser.close();
})();
