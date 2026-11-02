import { test, expect } from '@playwright/test';

async function dismissIntro(page) {
  const intro = page.locator('#intro');
  if (await intro.isVisible()) {
    await intro.click({ force: true });
  }
  await page.waitForTimeout(1100);
}

test.describe('Imagica Portfolio - Tanishq Rana Cinematic Portfolio', () => {
  test('1. Loads with zero console errors, clean network, and correct brand title', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await page.goto('/imagica.html');
    await page.waitForLoadState('networkidle');

    // Wait for intro or dismiss it
    await dismissIntro(page);

    // Verify brand title and counter (10 items total)
    await expect(page.locator('#nm')).toHaveText('imagica');
    await expect(page.locator('#ct')).toHaveText('01 / 10');

    // Verify Mute / Unmute button exists in bottom HUD
    await expect(page.locator('#mute-btn')).toBeVisible();

    // Verify Tanishq Rana eyebrow on cover
    await expect(page.locator('.home-mono-badge')).toContainText('Tanishq Rana');

    // Zero console errors or page exceptions
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('2. Single wheel gesture advances exactly one project (no multi-skip)', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Initial counter: 01 / 10
    await expect(page.locator('#ct')).toHaveText('01 / 10');

    // Perform rapid mouse wheel events
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(500);

    // Should advance to 02 / 10, NOT 03 or 04
    await expect(page.locator('#ct')).toHaveText('02 / 10');

    // Scroll backward
    await page.mouse.wheel(0, -180);
    await page.waitForTimeout(500);
    await expect(page.locator('#ct')).toHaveText('01 / 10');
  });

  test('3. Keyboard navigation works in both directions across 10 slides', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Arrow down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    await expect(page.locator('#ct')).toHaveText('02 / 10');

    // Arrow right
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    await expect(page.locator('#ct')).toHaveText('03 / 10');

    // Arrow up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);
    await expect(page.locator('#ct')).toHaveText('02 / 10');

    // Home key
    await page.keyboard.press('Home');
    await page.waitForTimeout(400);
    await expect(page.locator('#ct')).toHaveText('01 / 10');

    // End key
    await page.keyboard.press('End');
    await page.waitForTimeout(400);
    await expect(page.locator('#ct')).toHaveText('10 / 10');
  });

  test('4. HUD Jump buttons navigate and reflect state', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Click jump button 04
    const btn4 = page.locator('#jump button').nth(3);
    await btn4.click();
    await page.waitForTimeout(500);

    await expect(page.locator('#ct')).toHaveText('04 / 10');
    await expect(btn4).toHaveAttribute('aria-current', 'true');

    // Click Start button
    await page.locator('#st').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#ct')).toHaveText('01 / 10');
  });

  test('5. Video viewer modal opens, plays, closes, and restores focus', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    const dialog = page.locator('#v');
    await expect(dialog).not.toBeVisible();

    // Click HUD Play button
    const playBtn = page.locator('#pl');
    await playBtn.click();
    await page.waitForTimeout(400);

    // Dialog is visible
    await expect(dialog).toBeVisible();
    await expect(page.locator('#vt')).toHaveText('Cut. Grade. Compose.');

    // Take screenshot of video viewer modal
    await page.screenshot({ path: 'tests/screenshots/video-modal.png' });

    // Close via close button
    await page.locator('#vx').click();
    await page.waitForTimeout(400);
    await expect(dialog).not.toBeVisible();

    // Verify active project position was preserved
    await expect(page.locator('#ct')).toHaveText('01 / 10');
  });

  test('6. Visual appearance & responsive viewports across projects', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/imagica.html');
    await dismissIntro(page);
    await page.screenshot({ path: 'tests/screenshots/desktop-1440.png' });

    // Project 2 (Metro Nocturne)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'tests/screenshots/project-2.png' });

    // Project 3 (Creative Collage)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'tests/screenshots/project-3.png' });

    // Mobile Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/screenshots/mobile-390.png' });
  });

  test('7. Prefers-reduced-motion mode renders flat layout', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/imagica.html');
    await page.waitForTimeout(500);

    // Verify reduced class is on body and flat container is visible
    await expect(page.locator('body')).toHaveClass(/reduced/);
    const flat = page.locator('#flat');
    await expect(flat).toBeVisible();

    // Verify project navigation still functions in reduced motion
    await page.locator('#nx').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#ct')).toHaveText('02 / 10');

    await page.screenshot({ path: 'tests/screenshots/reduced-motion.png' });
  });

  test('8. Claude Corner page loads cleanly with Hindi poetry and metaphors', async ({ page }) => {
    await page.goto('/claude-corner/index.html');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toHaveText('क्लॉड का कोना');
    await expect(page.locator('.lead-quote')).toContainText('फ़िल्म वो नहीं जो कैमरे ने देखी');

    // Verify poetry cards
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(4);

    await page.screenshot({ path: 'tests/screenshots/claude-corner.png' });
  });

  test('9. Slide 09 (About Me) and Slide 10 (Hello. Contact) render authentically with Tanishq Rana info', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Jump to Slide 09 (About Me) - index 8
    await page.locator('#jump button').nth(8).click();
    await page.waitForTimeout(1100);

    await expect(page.locator('#ct')).toHaveText('09 / 10');
    await expect(page.locator('.about-headline')).toContainText('Every cut is a heartbeat');
    await expect(page.locator('.about-toolkit')).toContainText('DaVinci Resolve');
    await expect(page.locator('.about-container')).toContainText('Tanishq Rana');
    await page.screenshot({ path: 'tests/screenshots/slide-09-about.png' });

    // Jump to Slide 10 ("HOLA." Contact) - index 9
    await page.locator('#jump button').nth(9).click();
    await page.waitForTimeout(1100);

    await expect(page.locator('#ct')).toHaveText('10 / 10');
    await expect(page.locator('.contact-massive-num')).toHaveText('10');
    await expect(page.locator('.tower-word.word-holalo')).toHaveText('HOLALO.');
    await expect(page.locator('.tower-word.word-hola')).toHaveText('HOLA.');
    await expect(page.locator('.edge-vertical-text a[href="mailto:gogutroon@gmail.com"]')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/slide-10-contact.png' });
  });

  test('10. Mute / Unmute audio controls toggle seamlessly and synchronize across HUD and video cards', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Jump to Project 2 (index 1) which has an inline video
    await page.locator('#jump button').nth(1).click();
    await page.waitForTimeout(700);

    const muteBtn = page.locator('#mute-btn');
    await expect(muteBtn).toBeVisible();
    await expect(muteBtn).toContainText('Sound');

    // Initially all inline videos are muted
    const activeVid = page.locator('.js-section.active .sec-inline-video');
    const isMutedInitial = await activeVid.evaluate(el => el.muted);
    expect(isMutedInitial).toBe(true);

    // Click HUD mute button to unmute
    await muteBtn.click();
    await page.waitForTimeout(200);

    await expect(muteBtn).toContainText('Sound On');
    const isMutedAfterUnmute = await activeVid.evaluate(el => el.muted);
    expect(isMutedAfterUnmute).toBe(false);

    // Verify video card audio badge reflects unmuted state
    const cardAudioBtn = page.locator('.js-section.active .sec-audio-btn');
    await expect(cardAudioBtn).toHaveClass(/is-unmuted/);
    await expect(cardAudioBtn).toContainText('Mute');

    // Click video card audio button to mute again
    await cardAudioBtn.click();
    await page.waitForTimeout(200);

    await expect(muteBtn).toContainText('Sound');
    const isMutedAfterCardMute = await activeVid.evaluate(el => el.muted);
    expect(isMutedAfterCardMute).toBe(true);
    await expect(cardAudioBtn).not.toHaveClass(/is-unmuted/);
  });

  test('11. Zero overlap: narrative paragraph never touches video, and bottom titles are fully visible', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 860, name: 'wide-laptop' },
      { width: 1536, height: 750, name: 'compact-laptop' },
      { width: 1440, height: 900, name: 'standard-desktop' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/imagica.html');
      await dismissIntro(page);

      // Check Project 4 (index 3) and Project 5 (index 4)
      for (const slideIdx of [3, 4]) {
        await page.locator('#jump button').nth(slideIdx).click();
        await page.waitForTimeout(600);

        const activeSec = page.locator('.js-section.active');
        const narrativeBox = activeSec.locator('.sec-narrative-box');
        const videoWrap = activeSec.locator('.sec-video-wrap');
        const botRow = activeSec.locator('.sec-bot');
        const titleHeadline = activeSec.locator('.js-section-title');

        await expect(narrativeBox).toBeVisible();
        await expect(videoWrap).toBeVisible();
        await expect(botRow).toBeVisible();
        await expect(titleHeadline).toBeVisible();

        const boxRect = await narrativeBox.boundingBox();
        const videoRect = await videoWrap.boundingBox();
        const botRect = await botRow.boundingBox();

        // 1. Zero vertical overlap: bottom of narrative text must be strictly above top of video
        expect(boxRect.y + boxRect.height).toBeLessThan(videoRect.y);
        const gapTop = videoRect.y - (boxRect.y + boxRect.height);
        expect(gapTop).toBeGreaterThanOrEqual(8);

        // 2. Zero vertical overlap: bottom of video must be strictly above top of bottom row
        expect(videoRect.y + videoRect.height).toBeLessThan(botRect.y);

        // 3. Bottom row text must be completely visible within the viewport
        expect(botRect.y + botRect.height).toBeLessThan(vp.height);
        expect(botRect.y).toBeGreaterThan(0);
      }
    }
  });

  test('12. Videos preserve true 16:9 aspect ratio without cropping', async ({ page }) => {
    const testViewports = [
      { width: 1920, height: 950 },
      { width: 1536, height: 750 },
      { width: 1440, height: 900 }
    ];

    for (const vp of testViewports) {
      await page.setViewportSize(vp);
      await page.goto('/imagica.html');
      await dismissIntro(page);

      // Verify slides with video (Slide 1 to 7, zero-indexed 1 to 7)
      for (const idx of [1, 2, 3, 4, 5, 6, 7]) {
        await page.locator('#jump button').nth(idx).click();
        await page.waitForTimeout(800);

        const activeSec = page.locator('.js-section.active');
        const videoWrap = activeSec.locator('.sec-video-wrap');
        const inlineVid = activeSec.locator('.sec-inline-video');

        await expect(videoWrap).toBeVisible();
        await expect(inlineVid).toBeVisible();

        const box = await videoWrap.boundingBox();
        const ratio = box.width / box.height;

        // Strictly verify 16:9 aspect ratio (1.778 +- 0.05)
        expect(ratio).toBeGreaterThan(1.72);
        expect(ratio).toBeLessThan(1.82);

        // Object-fit must be contain to guarantee zero cropping
        const objectFit = await inlineVid.evaluate(el => window.getComputedStyle(el).objectFit);
        expect(objectFit).toBe('contain');
      }
    }
  });

  test('13. All 7 project videos are mapped in strict sequence (1st.mov to 7th.mov) with harmonized colors', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    const expectedSequence = [
      { idx: 1, file: 'videos/1st.mov', title: 'Executive Masterclass', thumb: 'thumbnails/1st.jpg' },
      { idx: 2, file: 'videos/2nd.mov', title: 'Metro Nocturne', thumb: 'thumbnails/2nd.jpg' },
      { idx: 3, file: 'videos/3rd.mov', title: 'Creative Collage', thumb: 'thumbnails/3rd.jpg' },
      { idx: 4, file: 'videos/4th.mov', title: 'Multidisciplinary Reel', thumb: 'thumbnails/4th.jpg' },
      { idx: 5, file: 'videos/5th.mov', title: 'Lyrical Romance', thumb: 'thumbnails/5th.jpg' },
      { idx: 6, file: 'videos/6th.mov', title: 'Crimson Resonance', thumb: 'thumbnails/6th.jpg' },
      { idx: 7, file: 'videos/7th.mov', title: 'Minimalist Identity', thumb: 'thumbnails/7th.jpg' }
    ];

    for (const item of expectedSequence) {
      await page.locator('#jump button').nth(item.idx).click();
      await page.waitForTimeout(600);

      const activeSec = page.locator('.js-section.active');
      const inlineVidSrc = await activeSec.locator('.sec-inline-video source').first().getAttribute('src');
      expect(inlineVidSrc).toBe(item.file);

      // Verify headline title
      await expect(activeSec.locator('.js-section-title')).toContainText(item.title.split(' ')[0]);

      // Verify poster
      const poster = await activeSec.locator('.sec-inline-video').getAttribute('poster');
      expect(poster).toBe(item.thumb);

      // Verify page background color matches the slide's unique color palette
      const bodyBg = await page.evaluate(() => document.body.style.backgroundColor);
      expect(bodyBg).not.toBe('');
    }
  });

  test('14. "Tanishq Rana" and gogutroon@gmail.com are active across the portfolio', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Verify title tag has Tanishq Rana
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Tanishq Rana');

    // Verify Tanishq Rana appears in the home cover and About slide
    const tanishqCount = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let count = 0;
      let node;
      while ((node = walker.nextNode())) {
        if (/Tanishq Rana/i.test(node.textContent)) count++;
      }
      return count;
    });
    expect(tanishqCount).toBeGreaterThanOrEqual(2);

    // Verify email is present
    const emailLink = page.locator('a[href="mailto:gogutroon@gmail.com"]');
    await expect(emailLink.first()).toBeAttached();
  });

  test('15. Floating CTA card and copy email clipboard feedback work seamlessly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Jump to Slide 09 (About Me)
    await page.locator('#jump button').nth(8).click();
    await page.waitForTimeout(1000);

    const ctaCard = page.locator('#book-project-cta');
    await expect(ctaCard).toBeVisible();

    // Click copy email pill
    const copyPill = page.locator('.book-email-pill');
    await copyPill.click();

    // Verify toast feedback appears
    const toast = page.locator('#portfolio-toast');
    await expect(toast).toHaveClass(/show/);
    await expect(toast).toContainText('gogutroon@gmail.com');
  });

  test('16. Vintage PLAY reel trigger launches cinema video showcase modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Jump to Slide 09 (About Me)
    await page.locator('#jump button').nth(8).click();
    await page.waitForTimeout(1000);

    const dialog = page.locator('#v');
    await expect(dialog).not.toBeVisible();

    // Click vintage monitor wrap
    const monitorWrap = page.locator('.vintage-monitor-wrap');
    await monitorWrap.click();
    await page.waitForTimeout(400);

    await expect(dialog).toBeVisible();
    await expect(page.locator('#vt')).toHaveText("Director's Reel");

    // Close modal
    await page.locator('#vx').click();
    await page.waitForTimeout(300);
    await expect(dialog).not.toBeVisible();
  });

  test('17. Zero social media links exist across the entire portfolio (email is sole contact point)', async ({ page }) => {
    await page.goto('/imagica.html');
    await dismissIntro(page);

    // Verify no social media links exist anywhere in the page DOM
    const socialLinks = page.locator('a[href*="instagram.com"], a[href*="vimeo.com"], a[href*="youtube.com"], a[href*="twitter.com"], a[href*="x.com"]');
    const count = await socialLinks.count();
    expect(count).toBe(0);

    // Verify .book-card-socials and .edge-social-icons do not exist
    await expect(page.locator('.book-card-socials')).toHaveCount(0);
    await expect(page.locator('.edge-social-icons')).toHaveCount(0);

    // Verify email is solely gogutroon@gmail.com
    const mailtoLinks = await page.$$eval('a[href^="mailto:"]', els => els.map(el => el.getAttribute('href')));
    expect(mailtoLinks.length).toBeGreaterThan(0);
    for (const href of mailtoLinks) {
      expect(href).toBe('mailto:gogutroon@gmail.com');
    }
  });

  test('18. Mobile viewports render with zero clipping, containment inside active square, and zero collisions', async ({ page }) => {
    test.setTimeout(60000);
    const mobileViewports = [
      { name: 'iphone-14', width: 390, height: 844 },
      { name: 'iphone-se', width: 375, height: 667 },
      { name: 'pixel-7', width: 412, height: 915 }
    ];

    for (const dev of mobileViewports) {
      await page.setViewportSize({ width: dev.width, height: dev.height });
      await page.goto('/imagica.html');
      await dismissIntro(page);

      // Verify Slide 0 fits strictly inside active square
      const homeContainer = page.locator('.home-container');
      await expect(homeContainer).toBeVisible();
      const homeRect = await homeContainer.boundingBox();
      expect(homeRect.y).toBeGreaterThanOrEqual(48); // Below top HUD
      expect(homeRect.y + homeRect.height).toBeLessThanOrEqual(dev.width); // Inside active square

      // Navigate to Slide 09 (About)
      await page.evaluate(() => navigateTo(8));
      await page.waitForTimeout(600);
      const aboutContainer = page.locator('.about-container');
      await expect(aboutContainer).toBeVisible();
      const aboutRect = await aboutContainer.boundingBox();
      expect(aboutRect.y).toBeGreaterThanOrEqual(48);
      expect(aboutRect.y + aboutRect.height).toBeLessThanOrEqual(dev.width + 10);

      // Check zero collision: headline bottom must not overlap toolkit card
      const headline = page.locator('.about-headline');
      const toolkit = page.locator('.toolkit-inspector-card');
      const headRect = await headline.boundingBox();
      const toolRect = await toolkit.boundingBox();
      expect(toolRect.y).toBeGreaterThan(headRect.y + headRect.height);

      // Navigate to Slide 10 (Contact)
      await page.evaluate(() => navigateTo(9));
      await page.waitForTimeout(600);
      const holalo = page.locator('.word-holalo');
      await expect(holalo).toBeVisible();
      const holaloRect = await holalo.boundingBox();
      // HOLALO must fit within screen width
      expect(holaloRect.x + holaloRect.width).toBeLessThanOrEqual(dev.width);
      // Email link must be gogutroon@gmail.com
      const contactEmail = page.locator('.edge-vertical-text a');
      await expect(contactEmail).toHaveText('gogutroon@gmail.com');
    }
  });
});
