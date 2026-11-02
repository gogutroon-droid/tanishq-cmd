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
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test_slide9_active.png' });
  console.log('Saved test_slide9_active.png');

  await browser.close();
})();
