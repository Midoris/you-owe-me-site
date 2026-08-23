import test from "node:test";
import assert from "node:assert/strict";
import { auditHtmlForRoute, auditWholeSite } from "./audit-app-language-support.mjs";

function includedHtml(body) {
  return `<!doctype html>
<html lang="en">
  <head><link rel="stylesheet" href="/styles/app-language-support.css" /></head>
  <body><main id="main">${body}</main><script src="/scripts/app-language-support.js"></script></body>
</html>`;
}

test("every site route satisfies the language-support inclusion and exclusion contract", () => {
  const result = auditWholeSite();
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.included, 78);
  assert.equal(result.counts.excluded, 8);
  assert.equal(result.counts.unclassified, 0);
});

test("the route audit rejects missing and duplicate integration assets", () => {
  const missing = auditHtmlForRoute("/features/", includedHtml("<a class=\"lt-primaryCta\" href=\"/features/\">Features</a>"));
  assert.ok(missing.some((error) => error.includes("expected one language-support anchor")));

  const duplicate = includedHtml(`
    <div data-app-language-support-anchor hidden></div>
    <div data-app-language-support-anchor hidden></div>
    <a class="lt-primaryCta" href="/features/">Features</a>
  `).replace("</head>", '<link rel="stylesheet" href="/styles/app-language-support.css" /></head>');
  const errors = auditHtmlForRoute("/features/", duplicate);
  assert.ok(errors.some((error) => error.includes("expected one /styles/app-language-support.css link, found 2")));
  assert.ok(errors.some((error) => error.includes("expected one language-support anchor, found 2")));
});

test("the route audit rejects anchors in navigation and sticky UI", () => {
  for (const unsafe of [
    '<nav><div data-app-language-support-anchor hidden></div><a class="lt-primaryCta" href="/features/">Features</a></nav>',
    '<div class="mobile-sticky-cta"><div data-app-language-support-anchor hidden></div><a class="lt-primaryCta" href="/features/">Features</a></div>',
  ]) {
    const errors = auditHtmlForRoute("/features/", includedHtml(unsafe));
    assert.ok(errors.some((error) => error.includes("inside navigation or sticky UI")));
  }
});

test("the route audit requires a real conversion context and no authored render target", () => {
  const errors = auditHtmlForRoute("/features/", includedHtml(`
    <div data-app-language-support-anchor hidden data-app-language-support-rendered></div>
    <a href="/privacy-policy/">Privacy</a>
  `));
  assert.ok(errors.some((error) => error.includes("no relevant CTA or product conversion group")));
  assert.ok(errors.some((error) => error.includes("rendered targets must be created only")));
});

test("excluded routes reject every language-support integration surface", () => {
  const errors = auditHtmlForRoute("/privacy-policy/", includedHtml(`
    <div data-app-language-support-anchor hidden></div>
    <a class="lt-primaryCta" href="/features/">Features</a>
  `));
  assert.ok(errors.some((error) => error.includes("excluded route includes the language-support stylesheet")));
  assert.ok(errors.some((error) => error.includes("excluded route includes the language-support script")));
  assert.ok(errors.some((error) => error.includes("excluded route contains a language-support anchor")));
});
