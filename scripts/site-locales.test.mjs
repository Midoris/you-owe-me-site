import { normalizeReviewedLanguageCopy, normalizeReviewedGermanRepaymentCopy, normalizeReviewedArabicRepaymentCopy, normalizeReviewedGermanBorrowCopy } from "../tests/helpers/reviewed-language-copy.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { siteLocales, spanishPages, germanPages, germanShared, localizedRegistryEntries, sharedAssetVersions, localeAssetVersion, localizedSourceRoute } from "../content/site-locales.mjs";
import { contentRegistry } from "../content/content-registry.mjs";
import { renderLocaleHtml, renderLocaleDiscovery, syncSiteLocales } from "./sync-site-locales.mjs";

test("only completed translations join the registry and have substantive public HTML", () => {
  const entries = localizedRegistryEntries(contentRegistry.filter(page => !page.locale));
  assert.equal(entries.length, siteLocales.flatMap(locale => locale.pages.filter(page => page.complete)).length);
  for (const locale of siteLocales.filter(locale => locale.code !== "en")) for (const page of locale.pages) {
    const route = page[locale.code];
    const entry = entries.find(entry => entry.url === route);
    assert.equal(Boolean(entry), page.complete);
    if (!page.complete) continue;
    const html = fs.readFileSync(new URL(`..${route}index.html`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<html lang="${locale.code}"${locale.code === "ar" ? ' dir="rtl"' : '(?: dir="ltr")?'}>`));
    assert.ok(html.includes(`rel="canonical" href="https://you-owe-me.com${route}"`));
    assert.match(html, /<h1\b/);
    assert.ok(html.replace(/<[^>]+>/g, "").length > 2000);
    for (const [lang, counterpartRoute] of [[locale.code, route], ["en", page.en], ["x-default", page.en]]) {
      assert.ok(html.includes(`hreflang="${lang}" href="https://you-owe-me.com${counterpartRoute}"`));
    }
    const english = fs.readFileSync(new URL(`..${page.en}index.html`, import.meta.url), "utf8");
    assert.ok(english.includes(`hreflang="${locale.code}" href="https://you-owe-me.com${route}"`));
    assert.match(html, new RegExp(`<a href="${page.en}" lang="en"${locale.code === "ar" ? ' dir="ltr"' : ""} hreflang="en">English</a>`));
    assert.equal(entry.appStoreCpp, "general");
    assert.equal(entry.translationOf, page.en);
    assert.ok(html.includes("<!-- localized-next-step:start -->") && html.includes("<!-- localized-next-step:end -->"));
    assert.ok(html.includes('data-module="best-next-step"'));
    assert.ok(!html.includes("<!-- best-next-step:start -->"), "Localized hand-authored modules must not claim English generator ownership");
    for (const asset of locale.versionedAssets) {
      if (html.includes(asset)) assert.ok(html.includes(`${asset}?v=${localeAssetVersion(locale, asset)}"`), `Localized dependency must bypass earlier caches: ${asset}`);
    }
    assert.ok(!/<a\b[^>]*href="https:\/\/apps\.apple\.com\/(?:[a-z]{2})\//.test(html), "Localized Store links must not force a country");
    assert.ok(!/<a\b[^>]*href="https:\/\/apps\.apple\.com\/[^\"]*ppid=/.test(html), "No unverified English custom-product page");
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(block[1]);
      for (const node of schema["@graph"] || [schema]) {
        if (["WebPage", "Article", "BlogPosting", "WebSite"].includes(node["@type"])) assert.equal(node.inLanguage, locale.code, `Structured language: ${route}`);
      }
    }
  }
});

test("English locale rendering preserves authored content outside locale links and declared shared cache queries", () => {
  function stripOwned(html, route) {
    html = normalizeReviewedLanguageCopy(html).replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "")
      .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "");
    return html.replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?("|\s)/g, (original, start, reference, end) => {
      const asset = new URL(reference, "https://you-owe-me.com" + route).pathname;
      return sharedAssetVersions[asset] ? `${start}${reference}?v=declared-shared-cache${end}` : original;
    });
  }
  for (const page of spanishPages) {
    const file = page.en === "/" ? "index.html" : `${page.en.slice(1)}index.html`;
    const current = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const rendered = renderLocaleHtml(current, page.en, "en");
    assert.equal(stripOwned(rendered, page.en), stripOwned(current, page.en), `Locale renderer changed English authored content: ${page.en}`);
  }
});

test("locale routes are unique, stable and contain no financial inputs", () => {
  assert.deepEqual(siteLocales.map(locale => locale.code), ["en", "es", "de", "ar", "fr"]);
  const routes = siteLocales.flatMap(locale => locale.pages.map(page => page[locale.code]));
  assert.equal(new Set(routes).size, routes.length);
  for (const locale of siteLocales) for (const page of locale.pages) {
    assert.match(page[locale.code], new RegExp(`^/${locale.code}/(?:[a-z0-9/-]+/)?$`));
    assert.ok(!/[?#]/.test(page[locale.code]));
  }
});

test("Spanish authored HTML stays byte-for-byte intact from the accepted public release", () => {
  const stripOwned = html => normalizeReviewedLanguageCopy(html)
    .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "")
    .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "")
    // Only explicitly changed shared dependencies may receive cache URL updates.
    .replace(/((?:src|href)=")([^"?]+)(?:\?v=([^"&]+))?(")/g, (original, start, asset, version, end) =>
      sharedAssetVersions[asset] && [undefined, sharedAssetVersions[asset], "es20261020"].includes(version) ? `${start}${asset}?v=shared-cache-version${end}` : original);
  // This immutable-release guard covers its original five routes; the later guides did not exist then.
  for (const page of spanishPages.filter(page => !["/es/blog/como-pedir-dinero-prestado-a-un-amigo/", "/es/blog/como-pedir-que-te-devuelvan-dinero/"].includes(page.es))) {
    const file = `${page.es.slice(1)}index.html`;
    const original = execFileSync("git", ["show", `bfd69d7:${file}`], { encoding: "utf8" });
    const current = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.equal(stripOwned(current), stripOwned(original), `Spanish source unexpectedly changed: ${page.es}`);
  }
});

// A completed fixture exercises three-way generation before any German page is
// approved. Production completion flags remain the only discovery gate.
function threeLocales() {
  return siteLocales.map(locale => locale.code === "de" ? {
    ...locale, pages: locale.pages.map(page => ({ ...page, complete: page.en === "/" })),
  } : locale);
}

const fixture = `<!doctype html><html lang="de"><head><link rel="canonical" href="https://you-owe-me.com/de/" /><link rel="stylesheet" href="/styles/site-locale.css" /></head><body><nav id="nav"><ul class="links"><li>old nav</li></ul></nav><article><h1>Beispiel</h1><a href="/">Startseite</a><a href="/solutions/app-to-track-money-owed/">Lösung (auf Englisch)</a><a href="/" lang="en">English</a></article><div id="copyright"><ul><li><a href="/privacy-policy/">Privacy</a></li></ul></div><script src="/scripts/analytics.js"></script></body></html>`;

test("one generator produces reciprocal three-language switches and leaves planned pages out", () => {
  const locales = threeLocales();
  for (const code of ["en", "es", "de"]) {
    const html = renderLocaleHtml(fixture, "/", code, locales);
    for (const [lang, route] of [["en", "/"], ["es", "/es/"], ["de", "/de/"], ["x-default", "/"]]) {
      assert.ok(html.includes(`hreflang="${lang}" href="https://you-owe-me.com${route}"`));
    }
    assert.equal((html.match(/aria-current="page">(?:English|Español|Deutsch)<\/a>/g) || []).length, 1);
    assert.equal(renderLocaleHtml(html, "/", code, locales), html, `${code}: generation must be idempotent`);
  }
  const german = renderLocaleHtml(fixture, "/", "de", locales);
  assert.match(german, /aria-label="Seitensprache"/);
  assert.match(german, /aria-label="Seiten auf Deutsch"/);
  assert.match(german, /Datenschutzerklärung \(auf Englisch\)/);
  assert.match(german, /href="\/de\/">Startseite/);
  assert.match(german, /href="\/" lang="en">English/);
  assert.match(german, /Lösung \(auf Englisch\)/);
  for (const page of germanPages.slice(1)) assert.ok(!german.includes(page.de));
  for (const asset of ["/scripts/analytics.js", "/styles/site-locale.css"]) assert.ok(german.includes(`${asset}?v=${sharedAssetVersions[asset]}`));
  const discovery = renderLocaleDiscovery("# Site\n", locales);
  assert.match(discovery, /## Seiten auf Deutsch/);
  assert.match(discovery, /https:\/\/you-owe-me.com\/de\//);
  assert.equal(renderLocaleDiscovery(discovery, locales), discovery);
  for (const page of germanPages.slice(1)) assert.ok(!discovery.includes(page.de));
});

test("German registry inherits source routing without linking to unfinished locale pages", () => {
  const entries = localizedRegistryEntries(contentRegistry.filter(page => !page.locale), threeLocales());
  const german = entries.filter(entry => entry.locale === "de");
  assert.equal(german.length, 1);
  assert.equal(german[0].url, "/de/");
  assert.equal(german[0].primaryCta, germanShared.storeLabel);
  assert.equal(german[0].parent, "/");
  assert.equal(german[0].cluster, contentRegistry.find(entry => entry.url === "/").cluster);
  assert.equal(german[0].appStoreCpp, "general");
  for (const field of ["relatedPages", "relatedTools", "relatedSolutions"]) {
    for (const route of german[0][field]) assert.ok(!route.startsWith("/de/"));
  }
});

test("unreviewed German routes do not enter public discovery or runtime matching", () => {
  const discovery = fs.readFileSync(new URL("../llms.txt", import.meta.url), "utf8");
  const sitemap = fs.readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
  for (const page of germanPages.filter(page => !page.complete)) {
    assert.equal(localizedSourceRoute(page.de), null);
    assert.ok(!contentRegistry.some(entry => entry.url === page.de));
    assert.ok(!discovery.includes(`https://you-owe-me.com${page.de}`));
    assert.ok(!sitemap.includes(`https://you-owe-me.com${page.de}`));
    const source = fs.readFileSync(new URL(`..${page.en}index.html`, import.meta.url), "utf8");
    assert.ok(!source.includes(`hreflang="de" href="https://you-owe-me.com${page.de}"`));
  }
});

test("a missing reviewed counterpart fails before any existing page is changed", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "uomi-locales-"));
  try {
    fs.writeFileSync(path.join(root, "index.html"), fixture);
    fs.writeFileSync(path.join(root, "llms.txt"), "# Site\n");
    assert.throws(() => syncSiteLocales(root, threeLocales()), /Reviewed counterpart missing/);
    assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), fixture);
    assert.equal(fs.readFileSync(path.join(root, "llms.txt"), "utf8"), "# Site\n");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("analytics preserves English metadata and maps only completed localized routes", () => {
  const source = fs.readFileSync(new URL("./analytics.js", import.meta.url), "utf8");
  const baseline = execFileSync("git", ["show", "bfd69d7:scripts/analytics.js"], { encoding: "utf8" });
  const metadata = source.match(/const PAGE_METADATA = \{[\s\S]*?\n\};/)[0];
  assert.equal(metadata.replace("  \"/blog/how-to-import-loan-history/\": { page_type: \"guide\", cluster: \"money_owed_followups\", app_store_cpp: \"default\" },\n", "").replace("  \"/tools/roommate-move-in-checklist/\": { page_type: \"tool\", cluster: \"roommates_household_costs\", app_store_cpp: \"roommates_household_costs\" },\n", "").replace("  \"/tools/tutor-payment-tracker-template/\": { page_type: \"tool\", cluster: \"client_payment_records\", app_store_cpp: \"client_payment_records\" },\n", ""), baseline.match(/const PAGE_METADATA = \{[\s\S]*?\n\};/)[0]);
  assert.match(source, /import \{ localizedSourceRoute \} from "\.\.\/content\/site-locales\.mjs\?v=borrowde20261031"/);
  const functions = source.match(/function normalizePath\(path\) \{[\s\S]*?\nfunction sanitizeText/)[0].replace(/\nfunction sanitizeText$/, "");
  const context = { window: { location: { pathname: "/" } }, localizedSourceRoute: route => localizedSourceRoute(route, threeLocales()) };
  vm.createContext(context);
  vm.runInContext(`${metadata}\n${functions}\nglobalThis.metadataFor = getPageMetadata;`, context);
  context.window.location.pathname = "/blog/how-to-import-loan-history/";
  assert.deepEqual(JSON.parse(JSON.stringify(context.metadataFor())), { page_type: "guide", cluster: "money_owed_followups", app_store_cpp: "default" });
  for (const page of spanishPages) {
    context.window.location.pathname = page.en;
    const english = JSON.parse(JSON.stringify(context.metadataFor()));
    context.window.location.pathname = page.es;
    assert.deepEqual(JSON.parse(JSON.stringify(context.metadataFor())), { ...english, app_store_cpp: "default" });
  }
  context.window.location.pathname = "/de/index.html";
  assert.deepEqual(JSON.parse(JSON.stringify(context.metadataFor())), { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" });
  // Exercise a non-home source so the German mapping cannot pass by fallback.
  const locales = threeLocales();
  locales.find(locale => locale.code === "de").pages[1].complete = true;
  context.localizedSourceRoute = route => localizedSourceRoute(route, locales);
  context.window.location.pathname = germanPages[1].de;
  assert.deepEqual(JSON.parse(JSON.stringify(context.metadataFor())), { page_type: "solution", cluster: "money_owed_followups", app_store_cpp: "default" });
});


test("reviewed native registry prose overrides only five editorial fields and retains locale routing", () => {
  const fields = ["primaryAudience", "problemSolved", "useWhen", "primaryCta", "nextStep"];
  const native = spanishPages.find(page => page.es === "/es/blog/como-pedir-que-te-devuelvan-dinero/");
  assert.ok(native.registry);
  const sources = contentRegistry.filter(page => !page.locale);
  const withoutOverrides = siteLocales.map(locale => ({ ...locale, pages: locale.pages.map(page => ({ ...page, registry: undefined })) }));
  const defaults = localizedRegistryEntries(sources, withoutOverrides);
  const authored = localizedRegistryEntries(sources);
  for (const current of authored) {
    const baseline = defaults.find(entry => entry.url === current.url);
    const approvedNative = siteLocales.flatMap(locale => locale.pages).find(page => page.registry && Object.values(page).includes(current.url));
    if (!approvedNative) { assert.deepEqual(current, baseline); continue; }
    assert.deepEqual(Object.keys(current).filter(key => JSON.stringify(current[key]) !== JSON.stringify(baseline[key])).sort(), [...fields].sort());
    for (const field of fields) assert.equal(current[field], approvedNative.registry[field]);
    assert.equal(current.appStoreCpp, "general");
    assert.equal(current.translationOf, approvedNative.en);
  }
  const attemptedRoutingOverride = siteLocales.map(locale => ({ ...locale, pages: locale.pages.map(page => page.es === native.es ? { ...page, registry: { ...page.registry, url: "/wrong/", appStoreCpp: "money-owed-followups" } } : page) }));
  const safe = localizedRegistryEntries(sources, attemptedRoutingOverride).find(entry => entry.translationOf === native.en);
  assert.equal(safe.url, native.es);
  assert.equal(safe.appStoreCpp, "general");
});


test("native guide navigation is closed only on the three reviewed message routes", () => {
  const targets = new Map([
    ["/es/blog/como-pedir-dinero-prestado-a-un-amigo/", ["site-spanish-disclosure", "Más guías en español"]],
    ["/es/blog/como-pedir-que-te-devuelvan-dinero/", ["site-spanish-disclosure", "Más guías en español"]],
    ["/fr/blog/comment-reclamer-son-argent-poliment/", ["site-french-disclosure", "Pages en français"]],
  ]);
  for (const locale of siteLocales.filter(item => item.code !== "en")) for (const page of locale.pages.filter(item => item.complete)) {
    const route = page[locale.code];
    const current = fs.readFileSync(new URL(`..${route}index.html`, import.meta.url), "utf8");
    const rendered = renderLocaleHtml(current, page.en, locale.code);
    assert.equal(rendered, current, `Idempotent generation: ${route}`);
    const nav = current.match(/<nav class="(?:site-spanish-section|site-locale-section)"[\s\S]*?<\/nav>/)[0];
    for (const target of locale.pages.filter(item => item.complete)) assert.ok(nav.includes(`href="${target[locale.code]}"`));
    assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
    if (targets.has(route)) {
      const [className, summary] = targets.get(route);
      assert.ok(current.includes(`<details class="${className}"><summary>${summary}</summary>${nav}</details>`), `Native closed disclosure: ${route}`);
    } else assert.ok(!/class="site-(?:spanish|french)-disclosure"/.test(current), `Original navigation stays expanded: ${route}`);
  }
});

// Preserve the immutable pre-polish navigation guard alongside current idempotence.
// Only this release's exact French discovery link, counterpart annotations, three
// inline labels/two standalone labels and the shared analytics cache URL normalize.
test("original localized navigation retains its immutable pre-polish baseline", () => {
  const frenchRoute = "/fr/blog/comment-reclamer-son-argent-poliment/";
  const targets = new Set(["/es/blog/como-pedir-dinero-prestado-a-un-amigo/", "/es/blog/como-pedir-que-te-devuelvan-dinero/"]);
  function approved(html, baseline) {
    html = normalizeReviewedGermanBorrowCopy(normalizeReviewedArabicRepaymentCopy(normalizeReviewedGermanRepaymentCopy(html)))
      .replace('    <link rel="alternate" hreflang="de" href="https://you-owe-me.com/de/blog/freunde-um-geld-bitten/" />\n', "")
      .replace('<span aria-hidden="true"> · </span><a href="/de/blog/freunde-um-geld-bitten/" lang="de" hreflang="de">Deutsch</a>', "")
      .replace('    <link rel="alternate" hreflang="ar" href="https://you-owe-me.com/ar/blog/how-to-remind-someone-they-owe-you-money-politely/" />\n', "")
      .replace('<span aria-hidden="true"> · </span><a href="/ar/blog/how-to-remind-someone-they-owe-you-money-politely/" lang="ar" dir="rtl" hreflang="ar">العربية</a>', "")      .replace('    <link rel="alternate" hreflang="de" href="https://you-owe-me.com/de/blog/geld-freundlich-zurueckfordern/" />\n', "")
      .replace('<span aria-hidden="true"> · </span><a href="/de/blog/geld-freundlich-zurueckfordern/" lang="de" hreflang="de">Deutsch</a>', "").replace('\n              <a href="' + frenchRoute + '">Messages de remboursement</a>', "")
      .replace('    <link rel="alternate" hreflang="fr" href="https://you-owe-me.com' + frenchRoute + '" />\n', "")
      .replace('<span aria-hidden="true"> · </span><a href="' + frenchRoute + '" lang="fr" hreflang="fr">Français</a>', "");
    for (const original of baseline.matchAll(/<a\b[^>]*href="\/blog\/how-to-remind-someone-they-owe-you-money-politely\/"[^>]*>[\s\S]*?<\/a>/g)) {
      const opening = original[0].match(/^<a\b[^>]*>/)[0].replace('/blog/how-to-remind-someone-they-owe-you-money-politely/', frenchRoute);
      const label = /\blt-cardCta\b/.test(opening) ? 'Messages pour demander un remboursement' : 'messages pour demander un remboursement';
      html = html.replace(opening + label + '</a>', original[0]);
    }
    return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)(?:\?[^" ]*)?/g, '$1?v=approved-cache');
  }
  for (const locale of siteLocales.filter(item => item.code !== "en")) for (const page of locale.pages.filter(item => item.complete && item[locale.code] !== frenchRoute && item[locale.code] !== "/de/blog/geld-freundlich-zurueckfordern/" && item[locale.code] !== "/ar/blog/how-to-remind-someone-they-owe-you-money-politely/" && item[locale.code] !== "/de/blog/freunde-um-geld-bitten/")) {
    const route = page[locale.code];
    const baseline = execFileSync("git", ["show", `739ee644646dff36eeeb646e6848c7b884cdfb51:${route.slice(1)}index.html`], { encoding: "utf8" });
    const rendered = renderLocaleHtml(baseline, page.en, locale.code);
    assert.equal(renderLocaleHtml(rendered, page.en, locale.code), rendered, `Historical source generation is idempotent: ${route}`);
    const nav = html => html.match(/<nav class="(?:site-spanish-section|site-locale-section)"[\s\S]*?<\/nav>/)[0];
    assert.equal(approved(nav(rendered), baseline), nav(baseline), `Immutable navigation labels and current state: ${route}`);
    if (targets.has(route)) {
      const wrapper = `<details class="site-spanish-disclosure"><summary>Más guías en español</summary>${nav(rendered)}</details>`;
      assert.ok(rendered.includes(wrapper), `Native closed disclosure: ${route}`);
      assert.equal(approved(rendered.replace(wrapper, nav(rendered)), baseline), approved(baseline, baseline), `Only the approved wrapper/integration changes: ${route}`);
    } else assert.equal(approved(rendered, baseline), approved(baseline, baseline), `Other historical locale rendering remains unchanged: ${route}`);
  }
});
