const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file:///' + path.resolve('imagica.html').replace(/\\/g, '/'));
  await page.waitForTimeout(400);
  const intro = await page.$('#intro');
  if (intro) { await intro.click(); await page.waitForTimeout(600); }

  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const s9 = document.getElementById('sec-9');
    const c = s9 ? s9.querySelector('.contact-container') : null;
    const h = s9 ? s9.querySelector('.word-holalo') : null;
    return {
      s9Box: s9 ? s9.getBoundingClientRect() : null,
      cBox: c ? c.getBoundingClientRect() : null,
      hBox: h ? h.getBoundingClientRect() : null,
      cDisplay: c ? window.getComputedStyle(c).display : null,
      hDisplay: h ? window.getComputedStyle(h).display : null,
      s9Transform: s9 ? window.getComputedStyle(s9).transform : null,
      worldTransform: document.getElementById('world') ? window.getComputedStyle(document.getElementById('world')).transform : null
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
