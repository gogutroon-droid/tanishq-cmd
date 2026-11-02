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

  const s9Children = await page.evaluate(() => {
    const s9 = document.getElementById('sec-9');
    const about = s9.querySelector('.about-container');
    const headline = s9.querySelector('.about-headline');
    return {
      aboutRect: about ? about.getBoundingClientRect() : null,
      aboutVisible: about ? window.getComputedStyle(about).visibility : null,
      aboutOpacity: about ? window.getComputedStyle(about).opacity : null,
      headlineRect: headline ? headline.getBoundingClientRect() : null,
      headlineText: headline ? headline.innerText : null,
      headlineColor: headline ? window.getComputedStyle(headline).color : null
    };
  });
  console.log('sec-9 elements after navigateTo(9):\n', JSON.stringify(s9Children, null, 2));

  await browser.close();
})();
