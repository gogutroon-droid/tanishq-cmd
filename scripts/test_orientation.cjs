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

  // Inject refined CSS and DOM for sec-10
  await page.evaluate(() => {
    const s10 = document.getElementById('sec-10');
    if (!s10) return;
    const contactEl = s10.querySelector('.contact-container');
    if (!contactEl) return;

    contactEl.innerHTML = `
      <div class="smpte-test-strip" aria-hidden="true">
        <div class="smpte-bar b-white"></div>
        <div class="smpte-bar b-yellow"></div>
        <div class="smpte-bar b-cyan"></div>
        <div class="smpte-bar b-green"></div>
        <div class="smpte-bar b-magenta"></div>
        <div class="smpte-bar b-red"></div>
        <div class="smpte-bar b-blue"></div>
        <div class="smpte-checkerboard"></div>
        <div class="smpte-gradient"></div>
        <div class="smpte-scanlines"></div>
      </div>

      <div class="contact-tower-stage">
        <!-- Closest to seam (screen left) -->
        <div class="tower-col tower-col-holalo">
          <div class="tower-word word-holalo">HOLALO.</div>
        </div>
        <!-- Middle (screen center-left) -->
        <div class="tower-col tower-col-hola">
          <div class="tower-word word-hola">HOLA.</div>
        </div>
        <!-- Right of hola (screen right of hola) -->
        <div class="tower-col tower-col-contact">
          <div class="tower-contact-text">CONTACT</div>
        </div>
      </div>

      <div class="contact-header-cluster">
        <div class="contact-sub-ticker">09 / 10</div>
        <div class="contact-massive-num">10</div>
        <div class="contact-sub-ticker-bot">10 / 10</div>
      </div>

      <div class="contact-far-right-edge">
        <div class="edge-social-icons">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="edge-icon">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="edge-icon">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </div>
        <div class="edge-vertical-text">
          <a href="mailto:tanishq@imagica.design" class="edge-link">tanishq@imagica.design</a>
          <span class="edge-sep">·</span>
          <span class="edge-link">Instagram</span>
          <span class="edge-link">Vimeo</span>
          <span class="edge-link">Youtube</span>
          <span class="edge-link">twitter/X</span>
        </div>
      </div>

      <div class="vf-sparkle-star">✦</div>
      <div class="vf-corner vf-br">┘</div>
      <div class="vf-crosshair c-2">+</div>
    `;

    // Make floating card visible
    const cta = document.getElementById('book-project-cta');
    if (cta) {
      cta.style.display = 'block';
      cta.style.opacity = '1';
    }
  });

  await page.addStyleTag({
    content: `
      #sec-10 .contact-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      #sec-10 .smpte-test-strip {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        width: 100% !important;
        height: 38px !important;
        display: flex !important;
        flex-direction: row !important;
        border-right: none !important;
        border-top: 1px solid rgba(0,0,0,0.18) !important;
      }
      #sec-10 .smpte-bar {
        height: 100% !important;
        flex: 1 !important;
      }
      #sec-10 .smpte-checkerboard {
        width: 54px !important;
        height: 100% !important;
      }
      #sec-10 .smpte-gradient {
        width: 44px !important;
        height: 100% !important;
        background: linear-gradient(to right, #ffffff, #000000) !important;
      }
      #sec-10 .smpte-scanlines {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px);
        pointer-events: none;
      }
      #sec-10 .contact-tower-stage {
        position: absolute !important;
        bottom: 50px !important;
        left: 36px !important;
        right: 36px !important;
        top: auto !important;
        display: flex !important;
        flex-direction: column-reverse !important;
        gap: 12px !important;
        pointer-events: none;
      }
      #sec-10 .tower-col {
        transform: rotate(180deg);
        display: flex;
        justify-content: flex-end;
      }
      #sec-10 .tower-col-holalo {
        justify-content: flex-end;
      }
      #sec-10 .tower-col-hola {
        justify-content: flex-end;
        padding-right: 32px;
      }
      #sec-10 .tower-col-contact {
        justify-content: flex-end;
        padding-right: 54px;
      }
      #sec-10 .tower-word {
        font-family: var(--font-sans);
        font-weight: 900;
        line-height: 0.85;
        letter-spacing: -0.04em;
        text-transform: uppercase;
        color: #111112;
      }
      #sec-10 .word-holalo {
        font-size: 116px;
        text-shadow: -2.5px 0 rgba(6, 182, 212, 0.6), 2.5px 0 rgba(239, 68, 68, 0.6);
        background: repeating-linear-gradient(0deg, #111112 0px, #111112 2px, #333336 2px, #333336 3px);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      #sec-10 .word-hola {
        font-size: 102px;
      }
      #sec-10 .tower-contact-text {
        font-family: var(--font-sans);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.36em;
        color: #111112;
        opacity: 0.75;
      }
      #sec-10 .contact-header-cluster {
        position: absolute !important;
        top: 36px !important;
        left: 48px !important;
        bottom: auto !important;
        right: auto !important;
        transform: rotate(180deg);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      #sec-10 .contact-massive-num {
        font-family: var(--font-disp);
        font-size: 76px;
        font-style: italic;
        font-weight: 600;
        line-height: 0.85;
      }
      #sec-10 .contact-far-right-edge {
        position: absolute !important;
        top: 36px !important;
        left: 50% !important;
        transform: translateX(-50%) rotate(180deg);
        display: flex;
        align-items: center;
        gap: 16px;
      }
      #sec-10 .edge-vertical-text {
        display: flex;
        gap: 14px;
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.1em;
      }
      #sec-10 .vf-sparkle-star {
        position: absolute !important;
        top: 60px !important;
        right: 60px !important;
        transform: rotate(180deg);
        font-size: 32px;
        color: rgba(0,0,0,0.12);
      }
      #sec-10 .vf-corner.vf-br {
        position: absolute !important;
        top: 36px !important;
        right: 36px !important;
        font-family: var(--font-mono);
        font-size: 20px;
        color: rgba(0,0,0,0.4);
      }
      #sec-10 .vf-crosshair.c-2 {
        position: absolute !important;
        top: 35% !important;
        right: 25% !important;
        font-family: var(--font-mono);
        font-size: 20px;
        color: rgba(0,0,0,0.35);
      }
    `
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test_orientation_perfect.png' });
  console.log('Saved test_orientation_perfect.png');

  await browser.close();
})();
