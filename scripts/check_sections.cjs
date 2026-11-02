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

  const secDetails = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.js-section')).map((s, i) => {
      const r = s.getBoundingClientRect();
      const style = window.getComputedStyle(s);
      return {
        id: s.id,
        index: i,
        display: style.display,
        opacity: style.opacity,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        childrenCount: s.children.length,
        innerHtmlSample: s.innerHTML.slice(0, 100)
      };
    });
  });
  console.log('All sections at start:\n', JSON.stringify(secDetails, null, 2));

  await browser.close();
})();
