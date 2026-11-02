const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const filePath = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(400);
  const intro = await page.$('#intro');
  if (intro) {
    await intro.click();
    await page.waitForTimeout(1100);
  }

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.evaluate(() => {
    let count = 0;
    window.addEventListener('wheel', e => {
      console.log('Wheel event', ++count, 'deltaY:', e.deltaY, 'isWheelLocked:', isWheelLocked, 'currentSec:', currentSection);
    }, { capture: true });
  });

  console.log('--- Wheel 1 ---');
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(100);
  console.log('--- Wheel 2 ---');
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(500);

  const ct = await page.locator('#ct').textContent();
  console.log('Final ct:', ct);
  await browser.close();
})();
