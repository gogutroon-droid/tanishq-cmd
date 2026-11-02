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

  // Navigate to Slide 10
  await page.evaluate(() => navigateTo(9));
  await page.waitForTimeout(1800);

  // Let's test upright styling for #sec-9.active
  await page.addStyleTag({
    content: `
      /* When Slide 10 is ACTIVE (currentSection = 9) */
      #sec-9.active .contact-container {
        padding: 60px 80px 100px 80px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      #sec-9.active .smpte-test-strip {
        position: relative !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
        width: 100% !important;
        max-width: 520px !important;
        height: 24px !important;
        border: 1px solid rgba(0,0,0,0.14) !important;
      }
      #sec-9.active .contact-tower-stage {
        position: relative !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        margin-top: 40px !important;
      }
      #sec-9.active .tower-col {
        transform: none !important;
        justify-content: flex-start !important;
      }
      #sec-9.active .tower-col-hola {
        padding-right: 0 !important;
      }
      #sec-9.active .tower-col-contact {
        padding-right: 0 !important;
      }
      #sec-9.active .word-holalo {
        font-size: 130px !important;
        line-height: 0.88 !important;
      }
      #sec-9.active .word-hola {
        font-size: 110px !important;
        line-height: 0.88 !important;
      }
      #sec-9.active .tower-contact-text {
        margin-top: 8px !important;
        font-size: 13px !important;
        letter-spacing: 0.4em !important;
      }
      #sec-9.active .contact-header-cluster {
        position: absolute !important;
        top: 60px !important;
        right: 80px !important;
        left: auto !important;
        bottom: auto !important;
        transform: none !important;
        align-items: flex-end !important;
      }
      #sec-9.active .contact-far-right-edge {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        transform: none !important;
        display: flex !important;
        align-items: center !important;
        gap: 20px !important;
        margin-top: 40px !important;
      }
      #sec-9.active .vf-sparkle-star {
        position: absolute !important;
        top: 240px !important;
        right: 120px !important;
        transform: none !important;
        font-size: 40px !important;
        color: rgba(0,0,0,0.15) !important;
      }
      #sec-9.active .vf-corner.vf-br {
        position: absolute !important;
        bottom: 80px !important;
        left: 80px !important;
        top: auto !important;
        right: auto !important;
        transform: none !important;
      }
      #sec-9.active .vf-crosshair.c-2 {
        position: absolute !important;
        top: 45% !important;
        right: 20% !important;
        transform: none !important;
      }
    `
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test_sec9_active_refined.png' });
  console.log('Saved test_sec9_active_refined.png');

  // Also verify Slide 09 settles completely
  await page.evaluate(() => navigateTo(8));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'test_sec8_settled.png' });
  console.log('Saved test_sec8_settled.png');

  await browser.close();
})();
