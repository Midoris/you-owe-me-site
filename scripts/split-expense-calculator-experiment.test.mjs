import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

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

test("results put settlement first, then actions, then a native breakdown disclosure", () => {
  const settlementIndex = page.indexOf('class="result-block settlement-block"');
  const actionsIndex = page.indexOf('data-result-actions hidden');
  const detailsIndex = page.indexOf('<details class="split-result-breakdown">');
  assert.ok(settlementIndex >= 0 && settlementIndex < actionsIndex && actionsIndex < detailsIndex);

  for (const requiredCopy of [
    "Copy summary",
    "Share result",
    "See calculation details",
    "Free download &middot; In-app purchases available",
    "See how shared tracking works",
    "Since 2016",
    "Actively maintained.",
  ]) {
    assert.ok(page.includes(requiredCopy), `missing required copy: ${requiredCopy}`);
  }

  for (const selector of ["data-summary", "data-paid", "data-share", "data-net", "data-settlement", "data-copy-status", "data-result-actions"]) {
    assert.equal((page.match(new RegExp(`${selector}(?=\\s|>)`, "g")) ?? []).length, 1, `one ${selector} hook remains`);
  }
  assert.equal((page.match(/data-action="copy-summary"/g) ?? []).length, 1);
  assert.equal((page.match(/data-action="share-summary"/g) ?? []).length, 1);
  assert.match(page, /<details class="split-result-breakdown">[\s\S]*?<summary>See calculation details<\/summary>[\s\S]*?data-summary[\s\S]*?data-paid[\s\S]*?data-share[\s\S]*?data-net/);
  assert.doesNotMatch(page, /Choose what happens next|Settling this split now\?|Will expenses or repayments continue\?/);
  assert.match(calculator, /els\.resultAppTitle = getRequiredElement\("\[data-result-app-title\]"\)/);
  assert.match(calculator, /els\.resultAppMessage = getRequiredElement\("\[data-result-app-message\]"\)/);
  assert.match(calculator, /result\.transfers\.length > 0[\s\S]*?Keep track until everyone has paid[\s\S]*?Keep future shared costs in one place/);

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

test("iOS fallback and desktop QR leave App Clip eligibility intact", () => {
  assert.match(calculator, /function isDesktopIphoneHandoffEligible\(\)[\s\S]*?platform === "MacIntel"[\s\S]*?maxTouchPoints[\s\S]*?\(min-width: 768px\)[\s\S]*?\(hover: hover\) and \(pointer: fine\)/);
  assert.match(calculator, /area\.hidden = !\(allowed && iphone && meaningfulEdit && supported\);/);
  assert.match(calculator, /appCard\.hidden = !\(shouldShow && area\.hidden && \(ios \|\| isDesktopIphoneHandoffEligible\(\)\)\);/);
  assert.match(calculator, /mediaQuery\.addEventListener\("change", refreshResultContinuationForViewport\)/);
});


test("valid iOS results retain an app destination when transfer is unavailable", () => {
  const start = calculator.indexOf("  function renderTransferOffer(shouldShow)");
  const end = calculator.indexOf("  function refreshResultContinuationForViewport", start);
  const source = calculator.slice(start, end);
  const cases = [
    { name: "iPhone multiple payers", ua: "iPhone", supported: false, show: true, card: true, transfer: false },
    { name: "iPhone disabled transfer", ua: "iPhone", supported: true, enabled: false, show: true, card: true, transfer: false },
    { name: "iPhone example result", ua: "iPhone", supported: true, edited: false, show: true, card: true, transfer: false },
    { name: "iPhone eligible transfer", ua: "iPhone", supported: true, show: true, card: false, transfer: true },
    { name: "before interaction", ua: "iPhone", supported: false, show: false, card: false, transfer: false },
    { name: "iPad desktop UA", ua: "Macintosh", platform: "MacIntel", touch: 5, supported: true, show: true, card: true, transfer: false },
    { name: "desktop QR", ua: "Windows NT", desktop: true, supported: true, show: true, card: true, transfer: false },
    { name: "Android tool", ua: "Android Mobile", supported: true, show: true, card: false, transfer: false },
  ];
  for (const scenario of cases) {
    const area = { hidden: true }, card = { hidden: true }, events = [];
    const context = {
      document: { querySelector(selector) { return selector === "[data-tool-transfer]" ? area : card; } },
      window: { UomiToolTransfer: { config: { enabled: scenario.enabled !== false }, prepare: () => scenario.supported } },
      navigator: { userAgent: scenario.ua, platform: scenario.platform || "", maxTouchPoints: scenario.touch || 0 },
      state: {}, meaningfulEdit: scenario.edited !== false, transferExposureEmitted: false,
      isDesktopIphoneHandoffEligible: () => Boolean(scenario.desktop),
      dispatchCalculatorEvent: (event) => events.push(event),
    };
    vm.runInNewContext(source + `\nrenderTransferOffer(${scenario.show}); renderTransferOffer(${scenario.show});`, context);
    assert.equal(!card.hidden, scenario.card, scenario.name + " app fallback");
    assert.equal(!area.hidden, scenario.transfer, scenario.name + " transfer");
    assert.equal(events.length, scenario.transfer ? 1 : 0, scenario.name + " exposure count");
  }
});
