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
  await page.evaluate(() => navigateTo(8));
  await page.waitForTimeout(1000);

  const sec9Info = await page.evaluate(() => {
    const s9 = document.getElementById('sec-9');
    if (!s9) return null;
    const r = s9.getBoundingClientRect();
    const computed = window.getComputedStyle(s9);
    return {
      rect: { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom },
      transform: computed.transform
    };
  });
  console.log('sec-9 on screen:', sec9Info);

  await browser.close();
})();
