import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("index.html", root), "utf8");
const styles = await readFile(new URL("styles/landing.css", root), "utf8");
const APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?pt=117888502&amp;ct=website_cta&amp;mt=8";

function loanValueMarkup() {
  const match = page.match(/<section\b[^>]*class=["'][^"']*\bhomepage-loan-value\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(match, "homepage loan-value section should be present");
  return match[0];
}

test("homepage hero keeps its CTA while loan guidance follows situations", () => {
  const section = loanValueMarkup();
  const ctaIndex = page.indexOf('<div class="lt-ctaRow lt-heroCtas">');
  const heroIndex = page.indexOf('<section class="lt-hero"');
  const heroEndIndex = page.indexOf('</section>', heroIndex);
  const situationsIndex = page.indexOf('<section id="situations"');
  const sectionIndex = page.indexOf(section);
  const bestNextIndex = page.indexOf('<!-- best-next-step:start -->');

  assert.equal((page.match(/<section\b[^>]*\bhomepage-loan-value\b/gi) ?? []).length, 1);
  assert.match(section, /aria-labelledby="homepage-loan-value-title"/);
  assert.match(section, /<h2 id="homepage-loan-value-title">Keep the loan clear from the first amount to the final payment<\/h2>/);
  assert.ok(ctaIndex >= 0 && ctaIndex < heroEndIndex, "hero CTA stays in the hero");
  assert.ok(heroIndex < situationsIndex && situationsIndex < sectionIndex && sectionIndex < bestNextIndex, "loan module follows situations before the generated next step");

  for (const copy of [
    "For money repaid over time",
    "Record the agreement",
    "Keep the amount, reason, due date, and who owes whom together.",
    "Track repayments as they happen",
    "Set a plan by payment amount or payoff date. Recorded partial or extra payments update what comes next.",
    "Share a clear statement",
    "Export a PDF showing what was paid and what remains. Include interest only if you agreed it.",
    "Face ID / Touch ID app lock &middot; Available in 10 languages.",
    "Since 2016",
    "Actively maintained.",
  ]) {
    assert.ok(section.includes(copy), `approved copy should include: ${copy}`);
  }

  assert.equal((section.match(/<li>/g) ?? []).length, 3);
  assert.match(section, /<a href="\/privacy-and-data\/">Privacy and data<\/a>/);
  assert.doesNotMatch(section, /apps\.apple\.com|<(?:button|input|select|textarea|form|script)\b|on\w+=|animation/i);
  assert.doesNotMatch(page, /lt-heroProofList/);
  assert.doesNotMatch(page, /Use You Owe Me as an IOU tracker/);
  assert.match(page, /You Owe Me is an iPhone app for money lent, borrowed, and shared\. Record repayments, see what&rsquo;s still owed, and prepare a clear follow-up when you need one\./);
  assert.match(page, /class="homepage-download-reassurance"[\s\S]*?Free download &middot; In-app purchases available[\s\S]*?Core tracking works offline without an account\./);
  assert.match(page, /class="homepage-review-teaser"[\s\S]*?This app is a lifesaver![\s\S]*?<a href="\/reviews\/">App Store review<\/a> &middot; ThePres_560/);

  assert.match(page, new RegExp(APP_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(page, /class="lt-appStoreBtn"[\s\S]*?data-cta-location="hero"/);
  assert.match(page, /<img src="https:\/\/tools\.applemediaservices\.com\/api\/badges\/download-on-the-app-store\/black\/en-us\?size=250x83" alt="Download You Owe Me on the App Store"/);
  assert.match(page, /<a href="#situations" class="lt-textCta" data-cta-location="hero-secondary">Find your situation<\/a>/);
  assert.match(page, /<span class="lt-salePill" aria-label="Current app sale" hidden>Sale - Now on Sale<\/span>/);
  assert.equal((page.match(/data-app-language-support-anchor/g) ?? []).length, 1);
});

test("homepage loan-value styles are scoped, responsive, and avoid fixed-height treatment", () => {
  assert.match(styles, /body\.homepage-page \.homepage-loan-value\s*\{/);
  assert.match(styles, /body\.homepage-page \.homepage-loan-value__steps\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.homepage-page \.homepage-loan-value__steps\s*\{[\s\S]*?grid-template-columns: 1fr/);
  assert.match(styles, /body\.homepage-page \.homepage-loan-value__trust a:focus-visible/);
  assert.match(styles, /body\.homepage-page \.homepage-download-reassurance\s*\{/);
  assert.match(styles, /body\.homepage-page \.homepage-review-teaser\s*\{/);
  assert.match(styles, /border-radius: 20px/);
  assert.doesNotMatch(styles.match(/body\.homepage-page \.homepage-loan-value\s*\{[\s\S]*?\n      \}/)?.[0] ?? "", /(?:min-)?height\s*:/);
  assert.match(page, /href="\.\/styles\/landing\.css\?v=conversion-polish-20260905-3"/);
});

test("homepage search-facing metadata and software schema remain unchanged", () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/" \/>/);
  assert.match(page, /name="description"[\s\S]*Track money between people without awkward conversations/);
  assert.match(page, /"@type": "SoftwareApplication"/);
  assert.match(page, /"applicationCategory": "FinanceApplication"/);
});
