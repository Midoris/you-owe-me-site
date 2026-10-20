const { chromium } = require('/Users/ievgeniiiablonskyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = __dirname;
const origin = 'http://127.0.0.1:8790';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const results = [];
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, locale: 'fr-CA' });
      await context.route('**/*', r => { const u = new URL(r.request().url()); return u.origin === origin && !u.pathname.endsWith('/analytics.js') ? r.continue() : r.abort(); });
      const page = await context.newPage();
      await page.goto(origin + '/fr/', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.body.classList.remove('is-preload'));
      for (const img of await page.locator('img').all()) if (await img.isVisible()) await img.scrollIntoViewIfNeeded();
      const data = await page.evaluate(() => ({
        title: document.title, language: document.documentElement.lang, direction: document.documentElement.dir,
        main: document.querySelector('#main').innerText,
        support: document.querySelector('[data-app-language-support-rendered]')?.innerText,
        examples: [...document.querySelectorAll('.site-locale-example')].map(e => e.innerText),
        images: [...document.images].map(i => ({ src: i.getAttribute('src'), alt: i.alt, loaded: i.complete && i.naturalWidth > 0 })),
        width: document.documentElement.scrollWidth,
        fonts: { heading: getComputedStyle(document.querySelector('h1')).fontFamily, body: getComputedStyle(document.body).fontFamily },
        appLinks: [...document.querySelectorAll('a[href*="apps.apple.com"]')].map(a => a.href)
      }));
      assert.equal(data.language, 'fr'); assert.equal(data.direction, 'ltr');
      assert.match(data.support, /est disponible en français/);
      assert.equal(data.width, width);
      assert.equal(data.examples.length, 6);
      for (const href of data.appLinks) { const u = new URL(href); assert.equal(u.pathname, '/app/id1147058670'); assert.equal(u.searchParams.get('ct'), 'website_cta'); assert.equal(u.searchParams.get('ppid'), null); }
      for (const [key, selector] of [['hero', '.lt-hero'], ['features', '.lt-coreFeatureGrid'], ['video', '.lt-reviewVideoMedia'], ['faq', '.lt-faqSection']]) {
        await page.locator(selector).screenshot({ path: path.join(out, `language-home-${key}-${width}.png`) });
      }
      await page.locator('h1').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(out, `language-home-${width}.png`) });
      if (width === 390) {
        await page.locator('#navPanelToggle').click(); await page.locator('body.is-navPanel-visible').waitFor(); await page.waitForTimeout(700);
        data.menu = await page.locator('#navPanel').innerText(); data.menuClose = await page.locator('#navPanel .close').getAttribute('aria-label');
        assert.equal(data.menuClose, 'Fermer le menu');
        await page.screenshot({ path: path.join(out, 'language-home-menu-390.png') });
        await page.locator('#navPanel .close').click(); await page.waitForTimeout(700);
      }
      await page.locator('.lt-videoPoster').scrollIntoViewIfNeeded(); await page.locator('.lt-videoPoster').click();
      data.iframeTitle = await page.locator('.lt-videoIframe').getAttribute('title');
      assert.match(data.iframeTitle, /Vidéo en anglais/);
      await page.goto(origin + '/ar/', { waitUntil: 'networkidle' });
      await page.locator('.site-language-switch a[hreflang="fr"]').click();
      await page.waitForLoadState('networkidle');
      data.arabicToFrench = await page.evaluate(() => ({ language: document.documentElement.lang, direction: document.documentElement.dir, font: getComputedStyle(document.querySelector('h1')).fontFamily, arabicLinkDirection: getComputedStyle(document.querySelector('.site-language-switch a[hreflang="ar"]')).direction }));
      assert.equal(data.arabicToFrench.language, 'fr'); assert.equal(data.arabicToFrench.direction, 'ltr'); assert.equal(data.arabicToFrench.arabicLinkDirection, 'rtl');
      results.push({ viewport: width, ...data }); await context.close();
    }
    const nojsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 }, locale: 'fr-CA' });
    await nojsContext.route('**/*', r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
    const nojsPage = await nojsContext.newPage(); await nojsPage.goto(origin + '/fr/', { waitUntil: 'networkidle' });
    const nojs = { main: await nojsPage.locator('#main').innerText(), store: await nojsPage.locator('#homepage-primary-download').isVisible(), importLink: await nojsPage.locator('.loan-import-offer__button').innerText() };
    assert.ok(nojs.main.length > 20000); assert.equal(nojs.store, true); assert.match(nojs.importLink, /en anglais/); await nojsContext.close();
    const brokenContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'fr-FR' });
    await brokenContext.route('**/*', r => { const u = new URL(r.request().url()); return u.origin === origin && !u.pathname.endsWith('/analytics.js') && !u.pathname.includes('/iphone-handoff/') ? r.continue() : r.abort(); });
    const brokenPage = await brokenContext.newPage(); await brokenPage.goto(origin + '/fr/', { waitUntil: 'networkidle' });
    const brokenQR = { primary: await brokenPage.locator('#homepage-primary-download').isVisible(), instruction: await brokenPage.locator('[data-iphone-handoff-instruction]').isVisible(), fallback: await brokenPage.locator('.iphone-handoff__fallback').innerText() };
    assert.equal(brokenQR.primary, true); assert.equal(brokenQR.instruction, false); assert.match(brokenQR.fallback, /Voir l’application/); await brokenContext.close();
    const dateStates = [];
    for (const date of ['2026-08-28T12:00:00Z', '2026-09-03T12:00:00Z', '2026-10-30T12:00:00Z']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 1000 }, locale: 'fr-CA' });
      await context.route('**/*', r => { const u = new URL(r.request().url()); return u.origin === origin && !u.pathname.endsWith('/analytics.js') ? r.continue() : r.abort(); });
      await context.addInitScript(({ now }) => { const RealDate = Date; window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }; }, { now: Date.parse(date) });
      const page = await context.newPage(); await page.goto(origin + '/fr/', { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => ({ anniversary: [...document.querySelectorAll('[data-anniversary-announcement]')].map(e => ({ phase: e.dataset.anniversaryPhase, visible: !e.hidden, text: e.innerText })), sale: [...document.querySelectorAll('.lt-salePill')].map(e => ({ visible: !e.hidden, text: e.innerText, label: e.getAttribute('aria-label') })) }));
      if (date.includes('08-28')) { assert.match(state.anniversary[0].text, /remplissent les conditions/); assert.match(state.anniversary[0].text, /4 septembre/); }
      if (date.includes('09-03')) { assert.match(state.anniversary[0].text, /Derniers jours/); assert.match(state.anniversary[0].text, /4 septembre/); }
      if (date.includes('10-30')) { assert.equal(state.sale[0].visible, true); assert.match(state.sale[0].text, /Halloween.*Offre à durée limitée/); assert.equal(state.anniversary[0].visible, false); }
      dateStates.push({ date, ...state }); await context.close();
    }
    fs.writeFileSync(path.join(out, 'language-home-browser.json'), JSON.stringify({ results, nojs, brokenQR, dateStates, externalRequestsBlocked: true }, null, 2) + '\n');
    console.log(JSON.stringify({ allPassed: true, viewports: results.map(r => r.viewport), nojsCharacters: nojs.main.length, brokenQR, mainCharacters: results.map(r => r.main.length), dateStates }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
