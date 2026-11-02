const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const filePath = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(400);
  const intro = await page.$('#intro');
  if (intro) {
    await intro.click();
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1400);

  const s9 = await page.$('#sec-9');
  if (s9) {
    await s9.screenshot({ path: 's9_only.png' });
    console.log('Saved s9_only.png');
  }
  await page.screenshot({ path: 'page_s9.png' });
  console.log('Saved page_s9.png');

  await browser.close();
})();
