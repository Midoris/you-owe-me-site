import { normalizeReviewedLanguageCopy } from "../tests/helpers/reviewed-language-copy.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { siteLocales, germanPages, sharedAssetVersions, completedCounterparts, localizedSourceRoute, localizedRegistryEntries } from "../content/site-locales.mjs";
import { contentRegistry } from "../content/content-registry.mjs";
import { renderLocaleHtml, renderLocaleDiscovery } from "./sync-site-locales.mjs";

const fixture = '<!doctype html><html lang="ar" dir="rtl"><head><link rel="canonical" href="https://you-owe-me.com/ar/" /></head><body><nav id="nav"><ul class="links"></ul></nav><article><h1>مثال عربي</h1><p id="authored">سجّل ما يدين به الآخرون لك.</p><a href="/" lang="en">English original</a></article><div id="copyright"><ul></ul></div></body></html>';
const homeFixtureLocales = (arabicComplete) => siteLocales.map(locale => ({ ...locale, pages: locale.pages.map(page => ({ ...page, complete: page.en === "/" && (locale.code !== "ar" || arabicComplete) })) }));

test("a reviewed RTL counterpart isolates language links without reordering authored content", () => {
  const locales = homeFixtureLocales(true);
  for (const language of ["en", "es", "de", "ar"]) {
    const rendered = renderLocaleHtml(fixture, "/", language, locales);
    for (const counterpart of completedCounterparts("/", locales)) {
      assert.ok(rendered.includes(`hreflang="${counterpart.code}" href="https://you-owe-me.com${counterpart.route}"`));
    }
    assert.match(rendered, /<a href="\/ar\/" lang="ar" dir="rtl" hreflang="ar"/);
    if (language === "ar") {
      for (const [code, route] of [["en", "/"], ["es", "/es/"], ["de", "/de/"]]) {
        assert.ok(rendered.includes(`<a href="${route}" lang="${code}" dir="ltr" hreflang="${code}">`));
      }
      assert.match(rendered, /<html lang="ar" dir="rtl">/);
      assert.match(rendered, /<a href="\/" lang="en">English original<\/a>/);
    }
    assert.ok(rendered.includes('<p id="authored">سجّل ما يدين به الآخرون لك.</p>'));
    assert.equal(renderLocaleHtml(rendered, "/", language, locales), rendered);
  }
});

test("an unreviewed Arabic batch cannot leak into switches, registry, discovery or runtime mapping", () => {
  const locales = homeFixtureLocales(false);
  assert.ok(!renderLocaleHtml(fixture, "/", "en", locales).includes('hreflang="ar"'));
  assert.ok(!renderLocaleDiscovery("# Public site\n", locales).includes("https://you-owe-me.com/ar/"));
  const english = contentRegistry.filter(entry => !entry.locale);
  assert.ok(!localizedRegistryEntries(english, locales).some(entry => entry.locale === "ar"));
  for (const page of locales.find(locale => locale.code === "ar").pages) {
    assert.equal(localizedSourceRoute(page.ar, locales), null);
    assert.throws(() => renderLocaleHtml(fixture, page.en, "ar", locales), /Unreviewed locale counterpart/);
  }
});

test("German authored pages remain identical to their finalized release outside generated switches and shared cache pins", () => {
  const normalize = html => normalizeReviewedLanguageCopy(html)
    .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "")
    .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "")
    .replace(/((?:src|href)=")([^"?]+)(?:\?v=[^"&]+)?(")/g, (original, start, asset, end) => sharedAssetVersions[asset] ? `${start}${asset}?v=reviewed-shared-cache${end}` : original);
  for (const page of germanPages) {
    const file = `${page.de.slice(1)}index.html`;
    const baseline = execFileSync("git", ["show", `f3aee78:${file}`], { encoding: "utf8" });
    assert.equal(normalize(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8")), normalize(baseline), page.de);
  }
});

test("Arabic sale presentation preserves campaign IDs, timing and event privacy", () => {
  const source = fs.readFileSync(new URL("./sales.js", import.meta.url), "utf8");
  function run(lang, month, day) {
    const badge = { hidden: true, dataset: {}, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } };
    const events = [];
    const window = { setInterval() {}, dispatchEvent(event) { events.push(event); } };
    const FixedDate = class extends Date { constructor(...args) { super(...(args.length ? args : [2026, month - 1, day, 12])); } };
    vm.runInNewContext(source, { window, document: { readyState: "complete", documentElement: { lang }, querySelectorAll: () => [badge] }, Date: FixedDate, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } } });
    return { badge, events, campaign: window.YouOweMeSaleState.getActiveSale() };
  }
  for (const [month, day] of [[12, 24], [1, 1], [6, 19], [7, 4]]) {
    const arabic = run("ar", month, day), english = run("en", month, day);
    assert.match(arabic.badge.textContent, /[\u0600-\u06ff]/);
    assert.ok(!arabic.badge.textContent.includes("undefined"));
    assert.equal(arabic.badge.hidden, false);
    assert.equal(arabic.badge.dataset.saleId, english.badge.dataset.saleId);
    assert.equal(JSON.stringify(arabic.campaign), JSON.stringify(english.campaign));
    assert.equal(JSON.stringify(arabic.events), JSON.stringify(english.events));
  }
  assert.equal(run("ar", 10, 20).badge.hidden, true);
});

test("SEO extraction preserves actual inline bidi punctuation and affixes while separating blocks", () => {
  const source = fs.readFileSync(new URL("./audit-seo-ai-hygiene.mjs", import.meta.url), "utf8");
  const implementation = source.match(/function normalizeText\(value\) \{[\s\S]*?\n\}/)?.[0];
  const decodeHtml = source.match(/function decodeHtml\(value\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(implementation, "Exercise the production extractor");
  const context = vm.createContext({});
  vm.runInContext(`${decodeHtml}\n${implementation}\nglobalThis.extractText = normalizeText;`, context);
  for (const [html, visibleText] of [
    ['هل يتوفر على <bdi dir="ltr">Android</bdi>؟', 'هل يتوفر على Android؟'],
    ['على <bdi dir="ltr">iPhone</bdi> و<bdi dir="ltr">iPad</bdi>.', 'على iPhone وiPad.'],
    ['سجلّ القرض (<bdi dir="ltr">Loan Record</bdi>)', 'سجلّ القرض (Loan Record)'],
    ['<p>القرض</p><p>السداد</p>', 'القرض السداد'],
    ['<div>Loan</div><div>Record</div>', 'Loan Record'],
  ]) assert.equal(context.extractText(html), visibleText.toLowerCase());
  assert.notEqual(context.extractText('القرض (<bdi dir="ltr">Loan Record</bdi>)'), context.extractText('القرض (Different Record)'), 'Substantive schema mismatches remain distinguishable');
});

test("English shared cache pins preserve every authored path form and leave unrelated queries intact", () => {
  for (const [route,references] of [
    ["/",["/scripts/tool-transfer.js","scripts/tool-transfer.js","./scripts/tool-transfer.js"]],
    ["/tools/split-expense-calculator/",["/scripts/tool-transfer.js","../../scripts/tool-transfer.js","./../../scripts/tool-transfer.js"]],
  ]) {
    const assets=references.map(reference=>`<script src="${reference}?v=old-release"></script>`).join("");
    const untouched='<script src="/scripts/unowned.js?v=keep&amp;mode=test"></script><script src="https://example.invalid/scripts/tool-transfer.js?v=external"></script>';
    const html=fixture.replace("</head>",`${assets}${untouched}</head>`);
    const rendered=renderLocaleHtml(html,route,"en");
    for (const reference of references) assert.ok(rendered.includes(`src="${reference}?v=${sharedAssetVersions['/scripts/tool-transfer.js']}"`),reference);
    assert.ok(rendered.includes(untouched));
    assert.equal(renderLocaleHtml(rendered,route,"en"),rendered);
  }
});
