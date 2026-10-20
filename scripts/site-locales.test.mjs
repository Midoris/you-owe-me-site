import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
  }
});

test("locale routes are unique, stable and contain no financial inputs", () => {
  assert.equal(new Set(spanishPages.map(page => page.es)).size, 5);
  for (const page of spanishPages) {
    assert.match(page.es, /^\/es\/(?:[a-z0-9/-]+\/)?$/);
    assert.ok(!/[?#]/.test(page.es));
  }
});
