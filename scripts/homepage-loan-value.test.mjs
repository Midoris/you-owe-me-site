import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("index.html", root), "utf8");
const styles = await readFile(new URL("styles/landing.css", root), "utf8");
const registry = await readFile(new URL("content/content-registry.mjs", root), "utf8");
const APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?pt=117888502&amp;ct=website_cta&amp;mt=8";

function sectionMarkup(className) {
  const match = page.match(new RegExp(`<section\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/section>`, "i"));
  assert.ok(match, `${className} section should be present`);
  return match[0];
}

function heroMarkup() {
  const start = page.indexOf('<section class="lt-hero"');
  const end = page.indexOf('\n\n          <section class="homepage-loan-value"', start);
  assert.ok(start >= 0 && end > start, "homepage hero should be present before the loan-value section");
  return page.slice(start, end);
}

function homepageRegistryMarkup() {
  const start = registry.indexOf('    url: "/",');
  const end = registry.indexOf('  {\n    url: "/10-years/",', start);
  assert.ok(start >= 0 && end > start, "homepage registry entry should be present");
  return registry.slice(start, end);
}

test("homepage starts with the continuing-record hero and preserves its handoffs", () => {
  const hero = heroMarkup();

  for (const copy of [
    "Loan &amp; IOU tracker for iPhone",
    "Know what&rsquo;s still owed.",
    "Keep loans, shared costs and repayments in one clear record. See the balance with each person&mdash;even when payments arrive in parts.",
    "Free download &middot; In-app purchases available",
    "Core tracking works offline without an account.",
    "Keep your own records. Others don&rsquo;t need the app.",
    "Example: a loan repaid in part",
    "You record the payment. You Owe Me updates the balance.",
    "A running balance in You Owe Me",
  ]) {
    assert.ok(hero.includes(copy), `hero should include approved copy: ${copy}`);
  }

  assert.match(hero, /<dl class="homepage-balance-example__amounts">[\s\S]*?<dt>Lent<\/dt>[\s\S]*?<dd>\$500<\/dd>[\s\S]*?<dt>Repaid<\/dt>[\s\S]*?<dd>\$100<\/dd>[\s\S]*?<dt>Still owed<\/dt>[\s\S]*?<dd>\$400<\/dd>[\s\S]*?<\/dl>/);
  assert.match(hero, /class="homepage-balance-example__remaining"/);
  assert.doesNotMatch(hero, /<(?:button|input|select|textarea|form|script)\b|on\w+=|animation/i);
  assert.match(hero, /src="\/images\/shared\/app-screenshots\/6\.8\.5_one_running_balance\.webp" alt="You Owe Me showing a person&rsquo;s current balance and dated repayments\." loading="eager" fetchpriority="high" decoding="async" width="1290" height="2796"/);
  assert.doesNotMatch(hero, /6\.8\.5_money_between_people\.webp/);

  assert.match(hero, new RegExp(APP_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(hero, /class="lt-appStoreBtn"[\s\S]*?data-cta-location="hero"/);
  assert.match(hero, /<img src="https:\/\/tools\.applemediaservices\.com\/api\/badges\/download-on-the-app-store\/black\/en-us\?size=250x83" alt="Download You Owe Me on the App Store"/);
  assert.match(hero, /<a href="#situations" class="lt-textCta" data-cta-location="hero-secondary">Find your situation<\/a>/);
  assert.match(hero, /<span class="lt-salePill" aria-label="Current app sale" hidden>Sale - Now on Sale<\/span>/);
  assert.match(hero, /data-iphone-handoff-mode="visible" data-cta-location="homepage_iphone_handoff"/);
  assert.match(hero, /data-iphone-handoff-qr src="\/images\/shared\/iphone-handoff\/home\.png" width="408" height="408"/);
  assert.equal((hero.match(/data-app-language-support-anchor/g) ?? []).length, 1);
});

test("homepage section order favors proof, three paths, and then preserves lower routes", () => {
  const loanValue = sectionMarkup("homepage-loan-value");
  const loanIndex = page.indexOf(loanValue);
  const reviewIndex = page.indexOf('<figure class="homepage-review-teaser">');
  const situationsIndex = page.indexOf('<div id="situations">');
  const generatedIndex = page.indexOf('<!-- best-next-step:start -->');
  const definitionIndex = page.indexOf('class="lt-pageSection lt-definitionPanel"');
  const moreSituationsIndex = page.indexOf('<section id="more-situations"');
  const researchIndex = page.indexOf('class="lt-pageSection lt-researchPanel"');
  const moreSituations = sectionMarkup("lt-situationsSection");

  assert.equal((page.match(/<section\b[^>]*\bhomepage-loan-value\b/gi) ?? []).length, 1);
  assert.equal((page.match(/id="situations"/g) ?? []).length, 1);
  assert.equal((page.match(/class="homepage-review-teaser"/g) ?? []).length, 1);
  assert.ok(loanIndex < reviewIndex && reviewIndex < situationsIndex && situationsIndex < generatedIndex && generatedIndex < definitionIndex && definitionIndex < moreSituationsIndex && moreSituationsIndex < researchIndex, "required homepage document order should be preserved");

  for (const copy of [
    "From the first amount to the final repayment",
    "Keep the history as the balance changes",
    "Record the person and amount",
    "Add money lent, borrowed or paid for someone, with a note when you need one.",
    "Add each repayment",
    "Record what was actually paid. The balance updates while earlier entries stay in the history.",
    "Keep the next step clear",
    "For a longer loan, use a repayment plan, reminders or a PDF statement when you need them.",
    "Face ID / Touch ID app lock &middot; Available in 10 languages.",
    "Since 2016",
    "Actively maintained.",
  ]) {
    assert.ok(loanValue.includes(copy), `loan-value section should include approved copy: ${copy}`);
  }

  assert.equal((loanValue.match(/<li>/g) ?? []).length, 3);
  assert.match(loanValue, /<a href="\/privacy-and-data\/">Privacy and data<\/a>/);
  assert.doesNotMatch(loanValue, /apps\.apple\.com|<(?:button|input|select|textarea|form|script)\b|on\w+=|animation/i);
  assert.match(page, /class="homepage-review-teaser"[\s\S]*?This app is a lifesaver![\s\S]*?<a href="\/reviews\/">App Store review<\/a> &middot; ThePres_560/);
  assert.doesNotMatch(page, /class="lt-bnsProof"/);

  assert.match(moreSituations, /id="more-situations"[\s\S]*?aria-labelledby="more-situations-title"/);
  assert.match(moreSituations, /Other situations and tools[\s\S]*?<h2 id="more-situations-title">More ways to use You Owe Me<\/h2>[\s\S]*?Explore other situations, or use a free tool for a one-time calculation\./);
  assert.equal((moreSituations.match(/class="lt-situationCard\b/g) ?? []).length, 8);
  assert.match(moreSituations, /href="\/find\/" class="lt-findNudge"/);
});

test("homepage registry remains the generated module source of truth", () => {
  const homepageRegistry = homepageRegistryMarkup();

  for (const copy of [
    'relatedSolutions: ["/solutions/app-to-track-money-owed/", "/solutions/shared-expense-tracker/", "/solutions/personal-loan-repayment-tracker/", "/solutions/family-reimbursement-tracker/"]',
    'updated: "2026-09-23"',
    'enabled: true',
    'variant: "hub"',
    'placement: "after-loan-value"',
    'template: "custom"',
    'eyebrow: "Find your situation"',
    'heading: "See how it fits your situation"',
    'intro: "Start with the record you need to keep."',
    'analyticsId: "home_money_owed"',
    'analyticsId: "home_loan_repayments"',
    'analyticsId: "home_family_costs"',
  ]) {
    assert.ok(homepageRegistry.includes(copy), `homepage registry should include: ${copy}`);
  }

  assert.equal((homepageRegistry.match(/priority: [123],/g) ?? []).length, 3);
  assert.match(homepageRegistry, /label: "Money owed"[\s\S]*?href: "\/solutions\/app-to-track-money-owed\/"[\s\S]*?type: "solution"[\s\S]*?intent: "track_ongoing_balance"/);
  assert.match(homepageRegistry, /label: "Personal loans"[\s\S]*?href: "\/solutions\/personal-loan-repayment-tracker\/"[\s\S]*?type: "solution"[\s\S]*?intent: "track_ongoing_balance"/);
  assert.match(homepageRegistry, /label: "Family costs"[\s\S]*?href: "\/solutions\/family-reimbursement-tracker\/"[\s\S]*?type: "solution"[\s\S]*?intent: "track_ongoing_balance"/);
  assert.doesNotMatch(homepageRegistry, /home_find_situation|home_running_balance|app-store:self/);
});

test("homepage styles are scoped, responsive, and keep the example legible", () => {
  assert.match(styles, /body\.homepage-page \.lt-hero h1\s*\{[\s\S]*?max-width: 14ch;[\s\S]*?font-size: clamp\(2\.5rem, 4\.5vw, 4rem\) !important;[\s\S]*?line-height: 1\.04;/);
  assert.match(styles, /body\.homepage-page \.lt-heroLead,[\s\S]*?max-width: 50ch;[\s\S]*?font-size: 18px;[\s\S]*?line-height: 1\.5;/);
  assert.match(styles, /body\.homepage-page \.homepage-balance-example__amounts\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?gap: 8px;/);
  assert.match(styles, /body\.homepage-page \.homepage-balance-example__amounts dt\s*\{[\s\S]*?font-size: 12px;/);
  assert.match(styles, /body\.homepage-page \.homepage-balance-example__amounts dd\s*\{[\s\S]*?font-size: 24px;/);
  assert.match(styles, /body\.homepage-page \.homepage-balance-example__amounts \.homepage-balance-example__remaining dd\s*\{[\s\S]*?font-size: 28px;/);
  assert.match(styles, /body\.homepage-page \.lt-heroMedia \.lt-heroShot\s*\{[\s\S]*?max-width: 280px;/);
  assert.match(styles, /body\.homepage-page #situations\s*\{[\s\S]*?scroll-margin-top: 6rem;/);
  assert.match(styles, /@media \(min-width: 737px\)\s*\{[\s\S]*?body\.homepage-page #situations \.best-next-step__grid\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(styles, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.homepage-page \.lt-hero h1\s*\{[\s\S]*?max-width: 17ch;[\s\S]*?font-size: clamp\(2\.25rem, 8\.8vw, 2\.75rem\) !important;[\s\S]*?line-height: 1\.08;/);
  assert.match(styles, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.homepage-page \.lt-heroMedia \.lt-heroShot\s*\{[\s\S]*?max-width: 210px;/);
  assert.match(styles, /body\.homepage-page \.homepage-loan-value__steps\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /body\.homepage-page \.homepage-loan-value__trust a:focus-visible/);
  assert.doesNotMatch(styles.match(/body\.homepage-page \.homepage-loan-value\s*\{[\s\S]*?\n      \}/)?.[0] ?? "", /(?:min-)?height\s*:/);
  assert.match(page, /href="\.\/styles\/landing\.css\?v=20260925-mobile-layout-2"/);
  assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/);
});

test("homepage search-facing metadata and software schema remain unchanged", () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/" \/>/);
  assert.match(page, /name="description"[\s\S]*Track money between people without awkward conversations/);
  assert.match(page, /"@type": "SoftwareApplication"/);
  assert.match(page, /"applicationCategory": "FinanceApplication"/);
});
