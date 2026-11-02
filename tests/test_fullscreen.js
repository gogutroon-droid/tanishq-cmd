import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 950 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:8089/imagica.html');
  await page.waitForTimeout(500);

  const intro = page.locator('#intro');
  if (await intro.isVisible()) {
    await intro.click();
  }
  await page.waitForTimeout(1300);

  // Evaluate full-width buildSpiral
  await page.evaluate(() => {
    const ASPECT = 0.618033;
    const AXIS = 0.7237;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const smallScreen = winW < 960;
    const landscape = winH < winW;

    let spiralOriginX, spiralOriginY, baseSize;
    if (smallScreen && !landscape) {
      spiralOriginX = Math.floor((winW / ASPECT) * ASPECT * (1 - AXIS));
      spiralOriginY = Math.floor((winW / ASPECT) * AXIS);
      baseSize = winW;
    } else {
      spiralOriginX = Math.floor(winW * AXIS);
      spiralOriginY = Math.floor(winW * ASPECT * AXIS);
      baseSize = Math.floor(winW * ASPECT);
    }

    const world = document.getElementById('world');
    world.style.top = '0px';
    world.style.left = '0px';
    world.style.transformOrigin = `${spiralOriginX}px ${spiralOriginY}px`;

    const sections = document.querySelectorAll('.js-section');
    sections.forEach((sec, i) => {
      const myRot = Math.floor(90 * i);
      const myScale = Math.pow(ASPECT, i);
      sec.style.width = `${baseSize}px`;
      sec.style.height = `${baseSize}px`;
      sec.style.transformOrigin = `${spiralOriginX}px ${spiralOriginY}px`;
      sec.style.transform = `rotate(${myRot}deg) scale(${myScale})`;
    });
  });

  await page.waitForTimeout(300);

  const sec0 = page.locator('.js-section').nth(0);
  const sec1 = page.locator('.js-section').nth(1);
  const box0 = await sec0.boundingBox();
  const box1 = await sec1.boundingBox();

  console.log('--- RESTORED FULL-WIDTH ---');
  console.log('Section 0 bounding box:', box0);
  console.log('Section 1 bounding box:', box1);
  console.log('Total span x:', box0.x, 'to', box1.x + box1.width);

  await page.screenshot({ path: 'tests/screenshots/test-1920-fullwidth.png' });
  await browser.close();
}

run().catch(console.error);
