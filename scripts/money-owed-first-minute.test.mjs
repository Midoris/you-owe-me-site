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
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMinuteSection(html) {
  const match = html.match(/<section\b[^>]*class=["'][^"']*\bmoney-owed-first-minute\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(match, "the first-minute reassurance section should be present");
  return match[0];
}

test("money-owed hero keeps its CTA and adds a static first-minute reassurance block", async () => {
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
  const sectionIndex = html.indexOf(section);
  const maintenanceProofIndex = html.indexOf('<p class="lt-maintenanceProof">');
  assert.ok(heroCtaIndex >= 0 && heroCtaIndex < sectionIndex, "hero CTA should precede the reassurance block");
  assert.ok(maintenanceProofIndex > sectionIndex, "maintenance proof should follow the reassurance block");

  for (const copy of [
    "Your first minute",
    "Start with one real balance",
    "Open and begin",
    "The core tracker works without mandatory sign-up.",
    "Add one person and amount",
    "Choose who owes whom and what the balance is for.",
    "Keep it current",
    "Record repayments, add another amount, or share a Live Link.",
    "The other person can open a read-only Live Link in their browser—no app or account needed.",
    "Works offline • Face ID / Touch ID lock",
  ]) {
    assert.ok(sectionText.includes(copy), `first-minute block should include: ${copy}`);
  }

  assert.equal((section.match(/<li\b/gi) ?? []).length, 3, "first-minute block should have exactly three steps");
  assert.doesNotMatch(section, /<(?:a|button|details|script|form|input|select|textarea)\b/i);
  assert.doesNotMatch(section, /apps\.apple\.com|data-track-/i);

  assert.match(html, new RegExp(appStoreUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /data-track-location="solution_money_owed_hero_primary_cta"/);
  assert.doesNotMatch(html, /Works offline\s*(?:&bull;|•)\s*No mandatory sign-up\s*(?:&bull;|•)\s*Face ID \/ Touch ID lock/);
  assert.match(html, /You Owe Me is a private record and communication tool\. It does not lend money, move money, collect debts, or replace accounting software\./);
  assert.match(html, /<p class="lt-maintenanceProof">/);
  assert.match(html, /href="\.\.\/\.\.\/styles\/solution-detail\.css\?v=money-owed-first-minute-1"/);
});

test("first-minute reassurance styles remain page-scoped and responsive", async () => {
  const css = await readFile(stylesheetPath, "utf8");

  assert.match(css, /body\.money-owed-solution-page \.money-owed-first-minute\s*\{[\s\S]*?border: 1px solid rgba\(15, 23, 42, 0\.08\)[\s\S]*?border-radius: 18px[\s\S]*?background: rgba\(255, 255, 255, 0\.76\)/);
  assert.match(css, /body\.money-owed-solution-page \.money-owed-first-minute__steps\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 736px\)\s*\{[\s\S]*?body\.money-owed-solution-page \.money-owed-first-minute__steps\s*\{[\s\S]*?grid-template-columns: 1fr/);
});
