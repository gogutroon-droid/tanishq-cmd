const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const filePath = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(300);

  const s9Children = await page.evaluate(() => {
    const s9 = document.getElementById('sec-9');
    return Array.from(s9.children).map(c => ({
      tag: c.tagName,
      class: c.className,
      rect: c.getBoundingClientRect(),
      style: window.getComputedStyle(c).display,
      html: c.innerHTML.slice(0, 150)
    }));
  });
  console.log('sec-9 children:\n', JSON.stringify(s9Children, null, 2));

  await browser.close();
})();
