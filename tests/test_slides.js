import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 950 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:8089/imagica.html');
  await page.waitForTimeout(400);

  const intro = page.locator('#intro');
  if (await intro.isVisible()) {
    await intro.click();
  }
  await page.waitForTimeout(1300);

  // Check Slide 0 (Home)
  const homeBox = await page.locator('.js-section.active').boundingBox();
  console.log('Slide 0 active section:', homeBox);
  await page.screenshot({ path: 'tests/screenshots/slide-0-fullwidth-fixed.png' });

  // Jump to project 4 (Analog Textures - index 3)
  await page.locator('#jump button').nth(3).click();
  await page.waitForTimeout(800);

  const activeSec4 = page.locator('.js-section.active');
  const box4 = await activeSec4.boundingBox();
  const narrative4 = await activeSec4.locator('.sec-narrative-box').boundingBox();
  const video4 = await activeSec4.locator('.sec-video-wrap').boundingBox();
  const bot4 = await activeSec4.locator('.sec-bot').boundingBox();
  const title4 = await activeSec4.locator('.js-section-title').innerText();

  console.log('Slide 4 Section Box:', box4);
  console.log('Slide 4 Title:', title4.replace(/\n/g, ' '));
  console.log('Slide 4 Narrative bottom:', narrative4.y + narrative4.height, 'Video top:', video4.y, 'Gap:', video4.y - (narrative4.y + narrative4.height));
  console.log('Slide 4 Video bottom:', video4.y + video4.height, 'Bot top:', bot4.y, 'Gap:', bot4.y - (video4.y + video4.height));
  console.log('Slide 4 Bot bottom:', bot4.y + bot4.height, 'Viewport height:', 950, 'HUD distance:', 950 - 54 - (bot4.y + bot4.height));

  await page.screenshot({ path: 'tests/screenshots/slide-4-fullwidth-fixed.png' });

  // Jump to project 5 (Creative Collage - index 4)
  await page.locator('#jump button').nth(4).click();
  await page.waitForTimeout(800);

  const activeSec5 = page.locator('.js-section.active');
  const box5 = await activeSec5.boundingBox();
  const narrative5 = await activeSec5.locator('.sec-narrative-box').boundingBox();
  const video5 = await activeSec5.locator('.sec-video-wrap').boundingBox();
  const bot5 = await activeSec5.locator('.sec-bot').boundingBox();
  const title5 = await activeSec5.locator('.js-section-title').innerText();

  console.log('Slide 5 Section Box:', box5);
  console.log('Slide 5 Title:', title5.replace(/\n/g, ' '));
  console.log('Slide 5 Narrative bottom:', narrative5.y + narrative5.height, 'Video top:', video5.y, 'Gap:', video5.y - (narrative5.y + narrative5.height));
  console.log('Slide 5 Bot bottom:', bot5.y + bot5.height, 'Viewport height:', 950, 'HUD distance:', 950 - 54 - (bot5.y + bot5.height));

  await page.screenshot({ path: 'tests/screenshots/slide-5-fullwidth-fixed.png' });

  await browser.close();
}

run().catch(console.error);
