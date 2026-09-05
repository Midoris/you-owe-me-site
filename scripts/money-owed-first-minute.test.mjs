import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../solutions/app-to-track-money-owed/index.html", import.meta.url);
const stylesheetPath = new URL("../styles/solution-detail.css", import.meta.url);
const appStoreUrl = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";

function normalizeText(value) {
  return value
    .replaceAll("&mdash;", "—")
    .replaceAll("&bull;", "•")
    .replaceAll("&rsquo;", "’")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMinuteSection(html) {
  const match = html.match(/<section\b[^>]*class=["'][^"']*\bmoney-owed-first-minute\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(match, "the first-minute reassurance section should be present");
  return match[0];
}

test("money-owed hero leads to a separate first-balance setup module", async () => {
  const html = await readFile(pagePath, "utf8");
  const section = firstMinuteSection(html);
  const sectionText = normalizeText(section);
  const body = html.match(/<body\b[^>]*class=["']([^"']*)["'][^>]*>/i)?.[1] ?? "";

  for (const className of ["is-preload", "solutions-page", "solution-detail-page", "money-owed-solution-page", "site-nav-page"]) {
    assert.match(body, new RegExp(`\\b${className}\\b`), `body should retain ${className}`);
  }

  assert.equal((html.match(/<section\b[^>]*\bmoney-owed-first-minute\b/gi) ?? []).length, 1);
  assert.match(section, /aria-labelledby=["']money-owed-first-minute-title["']/i);
  assert.match(section, /<h2\b[^>]*id=["']money-owed-first-minute-title["'][^>]*>\s*Start with one real balance\s*<\/h2>/i);

  const heroCtaIndex = html.indexOf('data-track-location="solution_money_owed_hero_primary_cta"');
  const heroIndex = html.indexOf('<section class="lt-detailHero">');
  const heroEndIndex = html.indexOf('</section>', heroIndex);
  const sectionIndex = html.indexOf(section);
  const maintenanceProofIndex = html.indexOf('<p class="lt-maintenanceProof">');
  const anniversaryIndex = html.indexOf('<aside\n            class="lt-anniversaryNotice"');
  assert.ok(heroCtaIndex >= 0 && heroCtaIndex < heroEndIndex, "hero CTA should remain in the hero");
  assert.ok(heroEndIndex < sectionIndex && sectionIndex < anniversaryIndex, "setup follows the complete hero before the anniversary notice");
  assert.ok(maintenanceProofIndex > sectionIndex && maintenanceProofIndex < anniversaryIndex, "maintenance proof follows setup before the notice");

  for (const copy of [
    "Get started",
    "Start with one real balance",
    "Add one person",
    "Choose whose balance you want to track.",
    "Record the amount",
    "Choose who owes whom and add what the money was for.",
    "Log a repayment",
    "Record a payment when it happens and see what’s left.",
    "Share when you’re ready. A read-only Live Link opens in the other person’s browser without an app or account.",
    "Face ID / Touch ID app lock",
  ]) {
    assert.ok(sectionText.includes(copy), `first-minute block should include: ${copy}`);
  }

  assert.equal((section.match(/<li\b/gi) ?? []).length, 3, "first-minute block should have exactly three steps");
  assert.doesNotMatch(section, /<(?:a|button|details|script|form|input|select|textarea)\b/i);
  assert.doesNotMatch(section, /apps\.apple\.com|data-track-/i);

  assert.match(html, new RegExp(appStoreUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /data-track-location="solution_money_owed_hero_primary_cta"/);
  assert.match(html, /href="#money-owed-first-minute-title"[\s\S]*?See how it works/);
  assert.match(html, /class="money-owed-download-reassurance"[\s\S]*?Free download &middot; In-app purchases available[\s\S]*?Core tracking works offline without an account\./);
  assert.doesNotMatch(html.slice(heroIndex, heroEndIndex), /solution-hero-highlights|(?:class|id)="money-owed-first-minute/);
  assert.match(html, /You Owe Me is a private record and communication tool\. It does not lend money, move money, collect debts, or replace accounting software\./);
  assert.match(html, /<p class="lt-maintenanceProof">/);
  assert.match(html, /href="\.\.\/\.\.\/styles\/solution-detail\.css\?v=conversion-polish-20260905-3"/);
});

test("first-minute reassurance styles remain page-scoped and responsive", async () => {
  const css = await readFile(stylesheetPath, "utf8");

  assert.match(css, /body\.money-owed-solution-page \.money-owed-first-minute\s*\{[\s\S]*?border: 1px solid rgba\(15, 23, 42, 0\.08\)[\s\S]*?border-radius: 20px[\s\S]*?background: rgba\(255, 255, 255, 0\.76\)/);
  assert.match(css, /body\.money-owed-solution-page \.money-owed-first-minute__steps\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.money-owed-solution-page \.money-owed-first-minute__steps\s*\{[\s\S]*?grid-template-columns: 1fr/);
  assert.match(css, /body\.money-owed-solution-page #money-owed-first-minute-title\s*\{[\s\S]*?scroll-margin-top: 5rem/);
});
