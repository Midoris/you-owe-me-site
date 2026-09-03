import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("tools/split-expense-calculator/index.html", root), "utf8");
const calculator = await readFile(new URL("scripts/split-expense-calculator.js", root), "utf8");
const analytics = await readFile(new URL("scripts/analytics.js", root), "utf8");
const styles = await readFile(new URL("styles/split-expense-calculator.css", root), "utf8");

const RESULT_APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";

test("the initial result actions preserve the attributed App Store CTA", () => {
  const actionsIndex = page.indexOf('data-result-actions hidden');
  const resultLinkIndex = page.indexOf('data-track-location="split_expense_result_app_store_cta"');

  assert.ok(actionsIndex >= 0, "result actions start hidden in initial HTML");
  assert.ok(resultLinkIndex > actionsIndex, "result App Store link remains inside result actions");
  assert.match(styles, /\.split-result-actions\[hidden\]\s*\{\s*display: none !important;/);
  assert.match(styles, /\.split-result-action\[hidden\]\s*\{\s*display: none !important;/);
  assert.ok(page.includes(RESULT_APP_STORE_URL));
  assert.match(page, /data-source-cluster="shared-expenses"/);
  assert.match(page, /aria-label="Download You Owe Me on the App Store for ongoing shared expenses and repayments"/);
  assert.match(page, /<img[^>]+alt="Download You Owe Me on the App Store"/);
});

test("the two result paths and static attribution outside the experiment remain present", () => {
  for (const requiredCopy of [
    "Choose what happens next",
    "Next step after this split",
    "Settling this split now?",
    "Copy or share the result with everyone involved.",
    "Copy summary",
    "Share result",
    "Will expenses or repayments continue?",
    "See how ongoing shared-expense tracking works",
  ]) {
    assert.ok(page.includes(requiredCopy), `missing required copy: ${requiredCopy}`);
  }

  assert.match(page, /<meta name="apple-itunes-app" content="app-id=1147058670, affiliate-data=pt=117888502&amp;ct=website_smart_banner"/);
  assert.match(page, /data-track-location="split_calculator_final_primary_cta"/);
});

test("summary, copy, and share use one canonical calculator URL", () => {
  assert.match(calculator, /const CANONICAL_CALCULATOR_URL = "https:\/\/you-owe-me\.com\/tools\/split-expense-calculator\/"/);
  assert.match(calculator, /Calculate your own split: \$\{CANONICAL_CALCULATOR_URL\}/);
  assert.match(calculator, /title: "Shared expense summary"/);
  assert.match(calculator, /url: CANONICAL_CALCULATOR_URL/);
  assert.match(calculator, /Copied summary and calculator link\./);
  assert.match(calculator, /Sharing wasn’t available, so the result was copied\./);
});

test("calculator events are sanitized fixed actions with no result payload", () => {
  assert.match(calculator, /const SPLIT_CALCULATOR_EVENT = "youoweme:split-calculator-event"/);
  assert.match(calculator, /detail: \{ eventName \}/);
  assert.doesNotMatch(calculator, /detail:\s*\{[^}]+(?:name|amount|summary|clipboard|description)/);

  for (const [action, firebaseEvent] of [
    ["split_result_ready", "uomi_web_split_result_ready"],
    ["split_summary_copied", "uomi_web_split_summary_copied"],
    ["split_summary_shared", "uomi_web_split_summary_shared"],
    ["split_share_fallback_copied", "uomi_web_split_share_fallback_copied"],
  ]) {
    assert.match(analytics, new RegExp(`${action}: "${firebaseEvent}"`));
  }

  assert.match(analytics, /const SPLIT_CALCULATOR_EVENT = "youoweme:split-calculator-event"/);
  assert.match(analytics, /const firebaseEventName = SPLIT_CALCULATOR_EVENTS\[eventName\];/);
  assert.match(analytics, /void trackEvent\(firebaseEventName\);/);
  assert.doesNotMatch(analytics, /trackEvent\(firebaseEventName,/);
});

test("result-ready remains an explicit, once-per-page-load milestone", () => {
  assert.match(calculator, /let resultReadyEmitted = false;/);
  assert.match(calculator, /const shouldShow = hasExplicitInteraction && hasValidResult\(result\);/);
  assert.match(calculator, /if \(resultReadyEmitted\) return;/);
  assert.match(calculator, /resultReadyEmitted = true;\s*dispatchCalculatorEvent\("split_result_ready"\);/);
  assert.match(calculator, /if \(error && error\.name === "AbortError"\) return;/);
});
