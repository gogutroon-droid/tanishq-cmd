const { chromium } = require('playwright');
const path = require('path');

const devices = [
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'ipad-mini', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

const mobileStyleOverrides = `
  /* Mobile Responsive Perfection for max-width: 768px */
  @media (max-width: 768px) {
    /* Slide 0 (Cover / Hero) containment below top HUD */
    .home-container {
      top: 50px !important;
      left: clamp(14px, 3.5vw, 20px) !important;
      right: clamp(14px, 3.5vw, 20px) !important;
      bottom: 8px !important;
      height: calc(100% - 58px) !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }
    .home-mono-badge {
      font-size: 8.5px !important;
      letter-spacing: 0.16em !important;
    }
    .home-eyebrow {
      font-size: 8.5px !important;
      letter-spacing: 0.16em !important;
      margin-bottom: 4px !important;
    }
    .home-title {
      font-size: clamp(20px, 5.5vw, 26px) !important;
      line-height: 0.96 !important;
      margin-bottom: 6px !important;
    }
    .home-desc {
      font-size: clamp(10px, 2.7vw, 11.5px) !important;
      line-height: 1.42 !important;
      margin-bottom: 6px !important;
      max-width: 100% !important;
    }
    .home-meta {
      font-size: 8.5px !important;
      line-height: 1.35 !important;
    }
    .home-arch-wrap {
      width: 28px !important;
      height: 28px !important;
    }

    /* Slide 1 - 7 (Project Slides) containment below top HUD */
    .sec-content {
      top: 50px !important;
      left: clamp(14px, 3.5vw, 20px) !important;
      right: clamp(14px, 3.5vw, 20px) !important;
      bottom: 8px !important;
      height: calc(100% - 58px) !important;
      padding: 0 !important;
    }
    .sec-top {
      margin-bottom: 4px !important;
    }
    .sec-video-wrap {
      max-height: clamp(110px, 18vh, 145px) !important;
      margin: auto auto !important;
    }
    .js-section-title {
      font-size: clamp(15px, 4vw, 18px) !important;
      margin-bottom: 2px !important;
    }
    .sec-metadata {
      font-size: 8px !important;
      line-height: 1.3 !important;
    }
    .js-scroll-pill {
      width: 32px !important;
      height: 52px !important;
    }

    /* Slide 09 (About Me) Mobile Editorial Stack */
    .about-container {
      top: 50px !important;
      left: 14px !important;
      right: 14px !important;
      bottom: 8px !important;
      height: calc(100% - 58px) !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }
    .about-header-row {
      margin-bottom: 4px !important;
    }
    .about-tag {
      font-size: 8.5px !important;
      letter-spacing: 0.14em !important;
    }
    .about-grid {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
      flex: 1 !important;
      justify-content: flex-start !important;
    }
    .about-left-col {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }
    .about-right-col {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }
    .about-headline-wrap {
      max-width: 100% !important;
    }
    .about-headline {
      font-size: clamp(13px, 3.4vw, 15px) !important;
      line-height: 1.2 !important;
      margin-bottom: 4px !important;
    }
    .bbox-word {
      padding: 1px 3px !important;
    }
    .bbox-h {
      width: 3px !important;
      height: 3px !important;
    }
    .about-bio {
      font-size: clamp(8.5px, 2.2vw, 9.5px) !important;
      line-height: 1.35 !important;
      max-width: 100% !important;
      margin-bottom: 5px !important;
      opacity: 0.85 !important;
    }
    .editor-workspace-wrap {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin-top: 4px !important;
      margin-bottom: 4px !important;
      width: 100% !important;
    }
    .nle-timeline-strip {
      padding: 3px 6px !important;
      width: auto !important;
      flex: 1 !important;
      min-width: 0 !important;
    }
    .nle-scrubber-row {
      font-size: 7px !important;
      margin-bottom: 2px !important;
    }
    .nle-filmstrip-row {
      gap: 2px !important;
      margin-bottom: 2px !important;
    }
    .nle-frame {
      width: 28px !important;
      height: 18px !important;
    }
    .nle-track-lane {
      font-size: 7px !important;
    }
    .nle-transport-btn {
      font-size: 7px !important;
    }
    .vintage-monitor-wrap {
      width: clamp(80px, 22vw, 96px) !important;
      flex-shrink: 0 !important;
      margin: 0 !important;
    }
    .monitor-hud-top {
      display: none !important;
    }
    .vintage-monitor-screen {
      aspect-ratio: 16 / 9.8 !important;
    }
    .monitor-frosted-play {
      width: 22px !important;
      height: 22px !important;
    }
    .monitor-frosted-play svg {
      width: 8px !important;
      height: 8px !important;
    }
    .monitor-rec-row {
      display: none !important;
    }
    .monitor-hud-bot {
      bottom: 2px !important;
      left: 3px !important;
      right: 3px !important;
    }
    .monitor-title {
      font-size: 7px !important;
    }
    .monitor-frame-ct {
      font-size: 6px !important;
    }
    .film-collage-top,
    .film-collage-bot,
    .collage-arrow-1,
    .collage-arrow-2,
    .capsule-hello-pill,
    .bbox-arrow-svg {
      display: none !important;
    }
    .toolkit-inspector-card.about-toolkit {
      padding: 4px 6px !important;
      margin-top: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .inspector-section {
      padding: 1px 0 !important;
    }
    .inspector-header {
      font-size: 7.5px !important;
      margin-bottom: 1px !important;
    }
    .inspector-icon {
      width: 8px !important;
      height: 8px !important;
    }
    .inspector-list {
      font-size: 7px !important;
      line-height: 1.25 !important;
    }
    .inspector-divider {
      margin: 2px 0 !important;
    }
    .card-h {
      width: 3px !important;
      height: 3px !important;
    }
    .about-bottom-bar {
      padding-top: 3px !important;
      margin-top: auto !important;
    }
    .about-inquiries-box {
      font-size: 8px !important;
      line-height: 1.3 !important;
    }
    .inquiries-email {
      font-size: 8px !important;
    }
    .inquiries-role {
      font-size: 7px !important;
    }

    /* Slide 10 Upright Adaptation on Mobile below top HUD */
    #sec-9.active .smpte-test-strip {
      margin: 50px 0 0 16px !important;
      max-width: calc(100% - 32px) !important;
      height: 14px !important;
    }
    #sec-9.active .contact-header-cluster {
      top: 50px !important;
      right: 16px !important;
    }
    #sec-9.active .contact-massive-num {
      font-size: clamp(24px, 6.5vw, 34px) !important;
    }
    #sec-9.active .contact-sub-ticker,
    #sec-9.active .contact-sub-ticker-bot {
      font-size: 7.5px !important;
    }
    #sec-9.active .contact-tower-stage {
      margin: 12px 0 0 16px !important;
      gap: 2px !important;
    }
    #sec-9.active .word-holalo {
      font-size: clamp(32px, 8.8vw, 44px) !important;
      line-height: 0.88 !important;
    }
    #sec-9.active .word-hola {
      font-size: clamp(26px, 7.2vw, 36px) !important;
      line-height: 0.88 !important;
    }
    #sec-9.active .tower-contact-text {
      font-size: 8.5px !important;
      letter-spacing: 0.25em !important;
      margin-top: 4px !important;
    }
    #sec-9.active .contact-far-right-edge {
      margin: 12px 0 0 16px !important;
      gap: 12px !important;
    }
    #sec-9.active .edge-link {
      font-size: 11px !important;
    }
    #sec-9.active .vf-sparkle-star,
    #sec-9.active .vf-crosshair,
    #sec-9.active .vf-corner {
      display: none !important;
    }

    /* Floating #book-project-cta on Mobile */
    #book-project-cta {
      bottom: clamp(52px, 6.5vh, 66px) !important;
      left: 14px !important;
      right: 14px !important;
      width: auto !important;
      max-width: 320px !important;
      margin: 0 auto !important;
      padding: 10px 14px !important;
      border-radius: 14px !important;
    }
    .book-card-top-row {
      font-size: 11px !important;
    }
    .book-card-subline {
      margin: 4px 0 8px 0 !important;
    }
    .book-email-pill {
      padding: 6px 10px !important;
      margin-bottom: 8px !important;
    }
    .email-pill-addr {
      font-size: 11px !important;
    }
    .status-email-link {
      font-size: 10px !important;
    }
    .avail-badge {
      font-size: 9px !important;
      padding: 2px 6px !important;
    }
  }
`;

(async () => {
  const browser = await chromium.launch();

  for (const dev of devices) {
    const page = await browser.newPage({ viewport: { width: dev.width, height: dev.height } });
    const fileUrl = 'file:///' + path.resolve('imagica.html').replace(/\\/g, '/');
    await page.goto(fileUrl);
    await page.waitForTimeout(400);

    const intro = await page.$('#intro');
    if (intro) {
      await intro.click();
      await page.waitForTimeout(600);
    }

    // Inject refined responsive stylesheet
    await page.addStyleTag({ content: mobileStyleOverrides });

    // Remove social media elements and replace email for visual test
    await page.evaluate(() => {
      document.querySelectorAll('.book-card-socials, .edge-social-icons').forEach(el => el.remove());
      document.querySelectorAll('.edge-vertical-text').forEach(el => {
        el.innerHTML = '<a href="mailto:gogutroon@gmail.com" class="edge-link" style="font-weight:600;font-size:12px;">gogutroon@gmail.com</a>';
      });
      document.querySelectorAll('.email-pill-addr, .status-email-link, .inquiries-email').forEach(el => {
        el.textContent = 'gogutroon@gmail.com';
        if (el.tagName === 'A') el.setAttribute('href', 'mailto:gogutroon@gmail.com');
      });
    });

    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/screenshots/test-${dev.name}-slide-0.png` });

    await page.evaluate(() => navigateTo(1));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `tests/screenshots/test-${dev.name}-slide-1.png` });

    await page.evaluate(() => navigateTo(8));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screenshots/test-${dev.name}-slide-8.png` });

    await page.evaluate(() => navigateTo(9));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screenshots/test-${dev.name}-slide-9.png` });

    await page.close();
  }

  await browser.close();
  console.log('Refined test screenshots generated successfully.');
})();
