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

  const coords = await page.evaluate(() => {
    const s9 = document.getElementById('sec-9');
    function testPoint(x, y) {
      const d = document.createElement('div');
      d.style.position = 'absolute';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.width = '10px';
      d.style.height = '10px';
      s9.appendChild(d);
      const r = d.getBoundingClientRect();
      d.remove();
      return { localX: Math.round(x), localY: Math.round(y), screenX: Math.round(r.left), screenY: Math.round(r.top) };
    }
    const w = s9.offsetWidth;
    const h = s9.offsetHeight;
    return {
      size: { w, h },
      localTopLeft: testPoint(0, 0),
      localTopRight: testPoint(w, 0),
      localBottomLeft: testPoint(0, h),
      localBottomRight: testPoint(w, h),
      localCenter: testPoint(w / 2, h / 2)
    };
  });
  console.log('Local to Screen Mapping for sec-9 when slide 8 is active:\n', JSON.stringify(coords, null, 2));

  await browser.close();
})();
