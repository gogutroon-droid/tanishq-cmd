const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const videoFiles = [
    '1st.mov', '2nd.mov', '3rd.mov', '4th.mov',
    '5th.mov', '6th.mov', '7th.mov', '8th.mov'
  ];

  console.log('Testing video loadability in Chromium...');

  for (const vf of videoFiles) {
    const absPath = path.resolve(__dirname, '../videos', vf).replace(/\\/g, '/');
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <video id="v" src="file://${absPath}" muted playsinline></video>
        </body>
      </html>
    `;
    await page.setContent(html);
    const result = await page.evaluate(async () => {
      const v = document.getElementById('v');
      return new Promise((resolve) => {
        v.onloadedmetadata = () => {
          resolve({ ok: true, duration: v.duration, width: v.videoWidth, height: v.videoHeight });
        };
        v.onerror = (e) => {
          resolve({ ok: false, error: v.error ? v.error.message || v.error.code : 'unknown error' });
        };
        setTimeout(() => resolve({ ok: false, error: 'timeout' }), 4000);
      });
    });
    console.log(vf, result);
  }

  await browser.close();
})();
