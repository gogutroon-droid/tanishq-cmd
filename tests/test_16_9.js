import { chromium } from 'playwright';

async function testVideoRatios() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 1920, height: 950, name: '1920x950' },
    { width: 1920, height: 860, name: '1920x860' },
    { width: 1536, height: 750, name: '1536x750' },
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1366, height: 768, name: '1366x768' },
    { width: 390, height: 844, name: 'mobile-390' }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8089/imagica.html');
    await page.waitForTimeout(300);

    const intro = page.locator('#intro');
    if (await intro.isVisible()) {
      await intro.click();
    }
    await page.waitForTimeout(1000);

    // Apply the clean 16:9 rule
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .sec-video-wrap {
          position: relative !important;
          aspect-ratio: 16 / 9 !important;
          width: auto !important;
          height: auto !important;
          max-width: 100% !important;
          max-height: min(38vh, calc(100vh - 430px), 420px) !important;
          margin: auto auto !important;
          align-self: center !important;
          border-radius: 6px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }
        .sec-inline-video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          display: block !important;
        }
        @media (max-width: 768px) {
          .sec-content {
            inset: 16px !important;
            height: auto !important;
            bottom: 16px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .sec-top {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
          }
          .sec-video-wrap {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            width: auto !important;
            max-width: 100% !important;
            max-height: 25vh !important;
            aspect-ratio: 16 / 9 !important;
            margin: auto auto !important;
            align-self: center !important;
          }
          .sec-bot {
            position: relative !important;
            top: auto !important;
            bottom: auto !important;
            left: auto !important;
            right: auto !important;
            margin-top: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
    });

    await page.waitForTimeout(200);

    // Jump to Slide 4 (Nocturne Beat)
    if (vp.width >= 768) {
      await page.locator('#jump button').nth(3).click();
    } else {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(600);

    const activeSec = page.locator('.js-section.active');
    const narrativeBox = activeSec.locator('.sec-narrative-box');
    const videoWrap = activeSec.locator('.sec-video-wrap');
    const botRow = activeSec.locator('.sec-bot');

    const video = await videoWrap.boundingBox();
    const bot = await botRow.boundingBox();
    const isNarrativeVisible = await narrativeBox.isVisible();

    const videoRatio = video.width / video.height;
    let gapTop = 'N/A';
    if (isNarrativeVisible) {
      const narrative = await narrativeBox.boundingBox();
      gapTop = (video.y - (narrative.y + narrative.height)).toFixed(1) + 'px';
    }
    const gapBot = (bot.y - (video.y + video.height)).toFixed(1) + 'px';
    const hudMargin = (vp.height - 54 - (bot.y + bot.height)).toFixed(1) + 'px';

    console.log(`[${vp.name}] Video: ${video.width.toFixed(1)}x${video.height.toFixed(1)} (Ratio: ${videoRatio.toFixed(3)}) | Gap Top: ${gapTop} | Gap Bot: ${gapBot} | HUD Margin: ${hudMargin}`);

    if (vp.name === 'mobile-390') {
      await page.screenshot({ path: 'tests/screenshots/test-16-9-mobile.png' });
    }

    await context.close();
  }

  await browser.close();
}

testVideoRatios().catch(console.error);
