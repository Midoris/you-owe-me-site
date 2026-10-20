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
    assert.match(html, new RegExp(`<html lang="${locale.code}"${locale.code === "ar" ? ' dir="rtl"' : ""}>`));
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

test("English page content differs from the accepted base only by explicit locale links", () => {
  for (const page of spanishPages) {
    const file = page.en === "/" ? "index.html" : `${page.en.slice(1)}index.html`;
    const original = execFileSync("git", ["show", `3f78611:${file}`], { encoding: "utf8" });
    const current = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
      .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "")
      .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "");
    assert.equal(current, original, `English source unexpectedly changed: ${page.en}`);
  }
});

test("locale routes are unique, stable and contain no financial inputs", () => {
  assert.deepEqual(siteLocales.map(locale => locale.code), ["en", "es", "de", "ar"]);
  const routes = siteLocales.flatMap(locale => locale.pages.map(page => page[locale.code]));
  assert.equal(new Set(routes).size, routes.length);
  for (const locale of siteLocales) for (const page of locale.pages) {
    assert.match(page[locale.code], new RegExp(`^/${locale.code}/(?:[a-z0-9/-]+/)?$`));
    assert.ok(!/[?#]/.test(page[locale.code]));
  }
});

test("Spanish authored HTML stays byte-for-byte intact from the accepted public release", () => {
  const stripOwned = html => html
    .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "")
    .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "")
    // Only explicitly changed shared dependencies may receive cache URL updates.
    .replace(/((?:src|href)=")([^"?]+)\?v=([^"&]+)(")/g, (original, start, asset, version, end) =>
      sharedAssetVersions[asset] && [sharedAssetVersions[asset], "es20261020"].includes(version) ? `${start}${asset}?v=shared-cache-version${end}` : original);
  for (const page of spanishPages) {
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
  assert.equal(metadata, baseline.match(/const PAGE_METADATA = \{[\s\S]*?\n\};/)[0]);
  assert.match(source, /import \{ localizedSourceRoute \} from "\.\.\/content\/site-locales\.mjs\?v=ar20261020"/);
  const functions = source.match(/function normalizePath\(path\) \{[\s\S]*?\nfunction sanitizeText/)[0].replace(/\nfunction sanitizeText$/, "");
  const context = { window: { location: { pathname: "/" } }, localizedSourceRoute: route => localizedSourceRoute(route, threeLocales()) };
  vm.createContext(context);
  vm.runInContext(`${metadata}\n${functions}\nglobalThis.metadataFor = getPageMetadata;`, context);
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
