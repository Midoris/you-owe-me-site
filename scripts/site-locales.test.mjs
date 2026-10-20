import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { spanishPages, localizedRegistryEntries } from "../content/site-locales.mjs";
import { contentRegistry } from "../content/content-registry.mjs";

test("only completed translations join the registry and have substantive public HTML", () => {
  const entries = localizedRegistryEntries(contentRegistry.filter(page => page.locale !== "es"));
  assert.equal(entries.length, spanishPages.filter(page => page.complete).length);
  for (const page of spanishPages) {
    const entry = entries.find(entry => entry.url === page.es);
    assert.equal(Boolean(entry), page.complete);
    if (!page.complete) continue;
    const html = fs.readFileSync(new URL(`..${page.es}index.html`, import.meta.url), "utf8");
    assert.match(html, /<html lang="es">/);
    assert.ok(html.includes(`rel="canonical" href="https://you-owe-me.com${page.es}"`));
    assert.match(html, /<h1\b/);
    assert.ok(html.replace(/<[^>]+>/g, "").length > 2000);
    for (const [lang, route] of [["es", page.es], ["en", page.en], ["x-default", page.en]]) {
      assert.ok(html.includes(`hreflang="${lang}" href="https://you-owe-me.com${route}"`));
    }
    const english = fs.readFileSync(new URL(`..${page.en}index.html`, import.meta.url), "utf8");
    assert.ok(english.includes(`hreflang="es" href="https://you-owe-me.com${page.es}"`));
    assert.match(html, new RegExp(`<a href="${page.en}" lang="en" hreflang="en">English</a>`));
    assert.equal(entry.appStoreCpp, "general");
    assert.equal(entry.translationOf, page.en);
    assert.ok(html.includes("<!-- localized-next-step:start -->") && html.includes("<!-- localized-next-step:end -->"));
    assert.ok(html.includes('data-module="best-next-step"'));
    assert.ok(!html.includes("<!-- best-next-step:start -->"), "Localized hand-authored modules must not claim English generator ownership");
    assert.ok(!/<a\b[^>]*href="https:\/\/apps\.apple\.com\/(?:us|es)\//.test(html), "Spanish Store links must not force a country");
    assert.ok(!/<a\b[^>]*href="https:\/\/apps\.apple\.com\/[^\"]*ppid=/.test(html), "No unverified English custom-product page");
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(block[1]);
      for (const node of schema["@graph"] || [schema]) {
        if (["WebPage", "Article", "BlogPosting", "WebSite"].includes(node["@type"])) assert.equal(node.inLanguage, "es", `Structured language: ${page.es}`);
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
  assert.equal(new Set(spanishPages.map(page => page.es)).size, 5);
  for (const page of spanishPages) {
    assert.match(page.es, /^\/es\/(?:[a-z0-9/-]+\/)?$/);
    assert.ok(!/[?#]/.test(page.es));
  }
});
