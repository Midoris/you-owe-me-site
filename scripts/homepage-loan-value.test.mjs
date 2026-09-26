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
  const end = page.indexOf('\n\n          <!-- money-story:start -->', start);
  assert.ok(start >= 0 && end > start, "homepage hero should end before the money story");
  return page.slice(start, end);
}

function homepageRegistryMarkup() {
  const start = registry.indexOf('    url: "/",');
  const end = registry.indexOf('  {\n    url: "/10-years/",', start);
  assert.ok(start >= 0 && end > start, "homepage registry entry should be present");
  return registry.slice(start, end);
}

test("homepage hero keeps its primary download and separate QR handoff", () => {
  const hero = heroMarkup();
  const heroCopyStart = hero.indexOf('<div class="lt-heroCopy">');
  const handoffStart = hero.indexOf('<section class="iphone-handoff homepage-iphone-handoff"');
  const heroCopyEnd = hero.lastIndexOf('</div>', handoffStart);
  assert.ok(heroCopyStart >= 0 && handoffStart > heroCopyStart && heroCopyEnd > heroCopyStart, "hero copy should end before its QR handoff sibling");
  const heroCopy = hero.slice(heroCopyStart, heroCopyEnd);

  for (const copy of [
    "Loan &amp; IOU tracker for iPhone",
    "Know what&rsquo;s still owed.",
    "Keep loans, shared costs and repayments in one clear record. See the balance with each person&mdash;even when payments arrive in parts.",
  ]) {
    assert.ok(hero.includes(copy), `hero should include approved copy: ${copy}`);
  }

  assert.doesNotMatch(hero, /homepage-balance-example|6\.8\.5_one_running_balance\.webp|6\.8\.5_money_between_people\.webp|homepage-hero-shot-caption/);
  assert.doesNotMatch(hero, /homepage-download-reassurance|Core tracking works offline without an account\.|Keep your own records\./);
  assert.doesNotMatch(heroCopy, /Find your situation|data-cta-location="hero-secondary"/);
  assert.doesNotMatch(hero, /<(?:button|input|select|textarea|form|script)\b|on\w+=|animation/i);

  assert.match(hero, new RegExp(APP_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(hero, /class="lt-appStoreBtn"[\s\S]*?data-cta-location="hero"/);
  assert.match(hero, /<img src="https:\/\/tools\.applemediaservices\.com\/api\/badges\/download-on-the-app-store\/black\/en-us\?size=250x83" alt="Download You Owe Me on the App Store"/);
  assert.match(hero, /<span class="lt-salePill" aria-label="Current app sale" hidden>Sale - Now on Sale<\/span>/);

  assert.ok(handoffStart > heroCopyEnd, "QR handoff should be a sibling after the hero copy");
  assert.match(hero.slice(handoffStart), /data-iphone-handoff-mode="visible" data-cta-location="homepage_iphone_handoff"/);
  assert.match(hero.slice(handoffStart), /data-iphone-handoff-qr src="\/images\/shared\/iphone-handoff\/home\.png" width="408" height="408"/);
  assert.equal((hero.match(/data-app-language-support-anchor/g) ?? []).length, 1);
});

test("story, import, definition, and generated situation hub stay in the intended order", () => {
  const storyStart = page.indexOf('<!-- money-story:start -->');
  const storyEnd = page.indexOf('<!-- money-story:end -->', storyStart);
  const importStart = page.indexOf('<!-- loan-import-offer:start -->');
  const reviewIndex = page.indexOf('<figure class="homepage-review-teaser">');
  const definitionIndex = page.indexOf('class="lt-pageSection lt-definitionPanel"');
  const hubStart = page.indexOf('<!-- best-next-step:start -->');
  const anniversaryIndex = page.indexOf('<section class="lt-anniversaryCallout"');
  const featureIndex = page.indexOf('id="core-capabilities-title"');
  const includedIndex = page.indexOf('class="lt-pageSection lt-includedSection"');
  const moreSituationsIndex = page.indexOf('<section id="more-situations"');
  const researchIndex = page.indexOf('class="lt-pageSection lt-researchPanel"');

  assert.ok(storyStart >= 0 && storyEnd > storyStart, "the story block should be present");
  assert.ok(storyStart < importStart && importStart < reviewIndex && reviewIndex < definitionIndex && definitionIndex < hubStart, "story → import → review → definition → generated situation hub order should be preserved");
  assert.ok(hubStart < anniversaryIndex && anniversaryIndex < featureIndex && featureIndex < includedIndex && includedIndex < moreSituationsIndex && moreSituationsIndex < researchIndex, "later homepage sections should remain in order");
  assert.equal((page.match(/<!-- money-story:start -->/g) ?? []).length, 1);
  assert.match(page, /<h3>Alex asks, “What do I still owe\?”<\/h3><p>You share a PDF with every entry and the \$160 balance\.<\/p>/);
  assert.equal((page.match(/<!-- loan-import-offer:start -->/g) ?? []).length, 1);
  assert.equal((page.match(/id="situations"/g) ?? []).length, 1);
  assert.equal((page.match(/class="homepage-review-teaser"/g) ?? []).length, 1);
  assert.doesNotMatch(page, /homepage-loan-value|id="how-it-works-title"|How YouOweMe keeps shared money clear/);

  const definition = sectionMarkup("lt-definitionPanel");
  assert.match(definition, /<h2 id="what-is-youoweme">What is You Owe Me\?<\/h2>[\s\S]*?You Owe Me is an iPhone app for tracking money you lend, borrow or cover for someone\./);
  assert.match(definition, /Track on your own—the other person doesn’t need the app\.[\s\S]*?Share a statement or a live balance/);
  const definitionCta = definition.match(/<a\b[^>]*data-cta-location="homepage-definition"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
  assert.ok(definitionCta, "definition should offer an App Store download");
  assert.ok(definitionCta.includes(`href="${APP_STORE_URL}"`));
  assert.match(definitionCta, /class="lt-appStoreBtn"/);
  assert.match(definitionCta, /aria-label="Download You Owe Me on the App Store"/);
  assert.match(definitionCta, /<img src="https:\/\/tools\.applemediaservices\.com\/api\/badges\/download-on-the-app-store\/black\/en-us\?size=250x83" alt="Download You Owe Me on the App Store"/);
  assert.match(definition, /class="homepage-definition-trust"[^>]*>Available in 10 languages\.<\/p>/);
  assert.doesNotMatch(definition, /Face ID|Touch ID|Privacy and data|Since 2016|actively maintained/);

  assert.match(page, /<figure class="homepage-review-teaser">[\s\S]*?<blockquote><strong>This app is a lifesaver!<\/strong> I finally have an easy way to track money I&rsquo;ve loaned or am owed\.<\/blockquote>\s*<figcaption><a href="\/reviews\/">ThePres_560<\/a>/);
  const moreSituations = sectionMarkup("lt-situationsSection");
  assert.match(moreSituations, /id="more-situations"[\s\S]*?aria-labelledby="more-situations-title"/);
  assert.match(moreSituations, /Other situations and tools[\s\S]*?<h2 id="more-situations-title">More ways to use You Owe Me<\/h2>[\s\S]*?Explore other situations, or use a free tool for a one-time calculation\./);
  assert.equal((moreSituations.match(/class="lt-situationCard\b/g) ?? []).length, 8);
  assert.match(moreSituations, /href="\/find\/" class="lt-findNudge"/);
});

test("generated hub retains its registered homepage content and placement", () => {
  const homepageRegistry = homepageRegistryMarkup();

  for (const copy of [
    'relatedSolutions: ["/solutions/app-to-track-money-owed/", "/solutions/shared-expense-tracker/", "/solutions/personal-loan-repayment-tracker/", "/solutions/family-reimbursement-tracker/"]',
    'updated: "2026-09-23"',
    'enabled: true',
    'variant: "hub"',
    'placement: "after-definition"',
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
  assert.match(page, /<!-- best-next-step:start -->[\s\S]*?<!-- Generated by scripts\/build-best-next-steps\.mjs\. Edit content\/content-registry\.mjs instead\./);
});

test("the condensed feature section and included-tools links remain intact", () => {
  const featureGrid = page.match(/<div class="lt-coreFeatureGrid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
  assert.ok(featureGrid, "core feature grid should be present");
  assert.equal((featureGrid.match(/class="lt-coreFeatureCard"/g) ?? []).length, 3);
  for (const label of ["Loan Records", "Repayment plans", "Live Link"]) {
    assert.ok(featureGrid.includes(label), `feature card should retain ${label}`);
  }

  const included = sectionMarkup("lt-includedSection");
  assert.equal((included.match(/<li>/g) ?? []).length, 4);
  for (const copy of ["Recurring entries and multi-currency records", "Reminders and Money Conversations", "Balance Sync", "CSV export"]) {
    assert.ok(included.includes(copy), `included tools should retain ${copy}`);
  }
  assert.match(included, /href="\.\/features\/" class="lt-textCta" data-cta-location="features-link">View all features<\/a>/);
  assert.match(included, /href="\.\/quick-start\/" class="lt-textCta" data-cta-location="quick-start-link">See how it works<\/a>/);
});

test("homepage styles remain scoped and responsive", () => {
  assert.match(styles, /body\.homepage-page \.lt-hero h1\s*\{[\s\S]*?max-width: 14ch;[\s\S]*?font-size: clamp\(2\.5rem, 4\.5vw, 4rem\) !important;[\s\S]*?line-height: 1\.04;/);
  assert.match(styles, /body\.homepage-page \.lt-heroLead,[\s\S]*?max-width: 50ch;[\s\S]*?font-size: 18px;[\s\S]*?line-height: 1\.5;/);
  assert.match(styles, /body\.homepage-page #situations\s*\{[\s\S]*?scroll-margin-top: 6rem;/);
  assert.match(styles, /@media \(min-width: 737px\)\s*\{[\s\S]*?body\.homepage-page #situations \.best-next-step__grid\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(styles, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.homepage-page \.lt-hero h1\s*\{[\s\S]*?font-size: clamp\(2\.25rem, 8\.8vw, 2\.75rem\) !important;/);
  assert.match(page, /href="\.\/styles\/landing\.css\?v=20260925-mobile-layout-2"/);
  assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/);
});

test("homepage search-facing metadata and software schema remain unchanged", () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/" \/>/);
  assert.match(page, /name="description"[\s\S]*Track money between people without awkward conversations/);
  assert.match(page, /"@type": "SoftwareApplication"/);
  assert.match(page, /"applicationCategory": "FinanceApplication"/);
});
