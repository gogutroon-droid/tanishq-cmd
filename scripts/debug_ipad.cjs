const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  const fileUrl = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(fileUrl);
  await page.waitForTimeout(400);

  const intro = await page.$('#intro');
  if (intro) {
    await intro.click();
    await page.waitForTimeout(600);
  }

  await page.evaluate(() => navigateTo(8));
  await page.waitForTimeout(1500);

  const s8 = await page.evaluate(() => {
    const el = document.getElementById('sec-8');
    const c = el ? el.querySelector('.about-container') : null;
    return {
      sec8Display: el ? el.style.display : null,
      sec8Classes: el ? el.className : null,
      sec8Rect: el ? el.getBoundingClientRect() : null,
      cRect: c ? c.getBoundingClientRect() : null,
      worldTransform: document.getElementById('world') ? document.getElementById('world').style.transform : null,
      worldRect: document.getElementById('world') ? document.getElementById('world').getBoundingClientRect() : null
    };
  });
  console.log(JSON.stringify(s8, null, 2));

  await page.screenshot({ path: 'tests/screenshots/debug-ipad-s8.png' });
  await browser.close();
})();
