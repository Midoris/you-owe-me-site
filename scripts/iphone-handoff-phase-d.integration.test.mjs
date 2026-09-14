import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const phaseD = "iphone-handoff-phase-d-20260914-1";
const appStoreBase = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670";

const [
  moneyOwed,
  roommate,
  paymentPlan,
  reminder,
  css,
  manifestText,
  generator,
  moneyOwedPng,
  repaymentPlanPng,
] = await Promise.all([
  readFile(new URL("solutions/app-to-track-money-owed/index.html", root), "utf8"),
  readFile(new URL("tools/roommate-bill-split-calculator/index.html", root), "utf8"),
  readFile(new URL("tools/payment-plan-calculator/index.html", root), "utf8"),
  readFile(new URL("blog/how-to-remind-someone-they-owe-you-money-politely/index.html", root), "utf8"),
  readFile(new URL("styles/iphone-handoff.css", root), "utf8"),
  readFile(new URL("images/shared/iphone-handoff/manifest.json", root), "utf8"),
  readFile(new URL("scripts/generate-iphone-handoff-qr.swift", root), "utf8"),
  readFile(new URL("images/shared/iphone-handoff/money-owed.png", root)),
  readFile(new URL("images/shared/iphone-handoff/repayment-plan.png", root)),
]);

function count(source, value) {
  return source.split(value).length - 1;
}

function rootMarkup(page, location) {
  const match = page.match(new RegExp(
    `<section class="iphone-handoff[^"]*" data-iphone-handoff data-iphone-handoff-mode="visible" data-cta-location="${location}"[\\s\\S]*?<\\/section>`,
  ));
  assert.ok(match, `missing visible QR root for ${location}`);
  return match[0];
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

test("Phase D adds four exact, bounded desktop QR handoffs without changing their ordinary mobile/failure paths", () => {
  const pages = [
    {
      page: moneyOwed,
      location: "money_owed_hero_iphone_handoff",
      heading: '<h2 id="money-owed-iphone-handoff-title">Keep track on your iPhone</h2>',
      benefit: "Record repayments and see what each person still owes.",
      clarification: null,
      pairing: "money-owed-hero-primary-download",
      badgeLocation: "solution_money_owed_hero_primary_cta",
      image: "money-owed.png",
      fallback: `${appStoreBase}?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
    },
    {
      page: roommate,
      location: "roommate_calculator_iphone_handoff",
      heading: '<h2 id="roommate-calculator-iphone-handoff-title">Keep roommate balances clear on your iPhone</h2>',
      benefit: "Record new shared costs and repayments without rebuilding the balance each month.",
      clarification: "Start a new record in the app. Your calculator result is not transferred.",
      pairing: null,
      image: "roommate.png",
      fallback: `${appStoreBase}?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
    },
    {
      page: paymentPlan,
      location: "payment_plan_results_iphone_handoff",
      heading: '<h4 id="payment-plan-iphone-handoff-title">Keep repayments on track on your iPhone</h4>',
      benefit: "Record actual payments and keep the remaining balance, plan and reminders together.",
      clarification: "Start a new loan record in the app. This website plan is not transferred.",
      pairing: "payment-plan-result-primary-download",
      badgeLocation: "payment_plan_results_badge",
      image: "repayment-plan.png",
      fallback: `${appStoreBase}?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
    },
    {
      page: reminder,
      location: "polite_reminder_post_copy_iphone_handoff",
      heading: '<h4 id="polite-reminder-iphone-handoff-title">Keep the next repayment clear on your iPhone</h4>',
      benefit: "Record payments and check what&rsquo;s still owed before your next reminder.",
      clarification: "Start a new record in the app. Your copied message is not imported.",
      pairing: "polite-reminder-post-copy-primary-download",
      badgeLocation: "polite_reminder_post_copy_app_store_cta",
      image: "money-owed.png",
      fallback: `${appStoreBase}?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
    },
  ];

  for (const configuration of pages) {
    const card = rootMarkup(configuration.page, configuration.location);
    assert.equal(count(configuration.page, `data-cta-location="${configuration.location}"`), 1);
    assert.ok(card.includes("hidden>"), "the authored QR root starts hidden");
    assert.ok(card.includes(configuration.heading));
    assert.ok(card.includes(configuration.benefit));
    assert.ok(card.includes("Scan with your iPhone camera to get You Owe Me."));
    assert.ok(card.includes("Free download &middot; In-app purchases available."));
    assert.ok(card.includes(`href="${configuration.fallback}"`));
    assert.ok(card.includes(`src="/images/shared/iphone-handoff/${configuration.image}" width="472" height="472"`));
    assert.ok(card.includes('alt="QR code to open You Owe Me on the App Store." loading="eager"'));
    assert.ok(card.includes("data-iphone-handoff-qr"));
    assert.ok(card.includes("data-iphone-handoff-instruction"));
    if (configuration.clarification) assert.ok(card.includes(configuration.clarification));
    else assert.doesNotMatch(card, /iphone-handoff__clarification/);

    assert.equal(count(configuration.page, `styles/iphone-handoff.css?v=${phaseD}`), 1);
    assert.equal(count(configuration.page, `analytics.js?v=${phaseD}`), 1);
    assert.equal(count(configuration.page, `iphone-handoff.mjs?v=${phaseD}`), 1);

    if (configuration.pairing) {
      assert.ok(card.includes(`data-iphone-handoff-replaces="${configuration.pairing}"`));
      const pairedBadge = configuration.page.match(
        new RegExp(`<a\\b[^>]*id="${configuration.pairing}"[^>]*>`),
      )?.[0];
      assert.ok(pairedBadge, `missing paired App Store badge for ${configuration.location}`);
      assert.doesNotMatch(pairedBadge, /\\bhidden\\b/, "the ordinary App Store badge remains visible without JavaScript");
      assert.match(pairedBadge, new RegExp(`data-track-location="${configuration.badgeLocation}"`));
      assert.match(pairedBadge, /data-iphone-handoff-replaceable/);
    } else {
      assert.doesNotMatch(card, /data-iphone-handoff-replaces/);
    }
  }

  const roommateRootIndex = roommate.indexOf('data-cta-location="roommate_calculator_iphone_handoff"');
  assert.ok(roommate.indexOf('id="calculator"') < roommateRootIndex);
  assert.ok(roommateRootIndex < roommate.indexOf("data-anniversary-announcement"));
  assert.match(roommate, /<section\b[^>]*id="calculator"[\s\S]*?<\/section>\s*<section class="iphone-handoff roommate-calculator-iphone-handoff"/);

  const paymentRootIndex = paymentPlan.indexOf('data-cta-location="payment_plan_results_iphone_handoff"');
  assert.ok(paymentPlan.indexOf('class="pp-app-actions"') < paymentRootIndex);
  assert.ok(paymentRootIndex < paymentPlan.indexOf('class="lt-maintenanceProof"'));

  const reminderAside = reminder.match(/<aside\b(?=[^>]*data-post-copy-app-prompt)[\s\S]*?<\/aside>/)?.[0] || "";
  assert.ok(reminderAside.includes('data-cta-location="polite_reminder_post_copy_iphone_handoff"'));
  assert.ok(reminderAside.indexOf("polite-reminder-post-copy__actions") < reminderAside.indexOf("polite_reminder_post_copy_iphone_handoff"));
  assert.equal(count(reminder, "data-post-copy-app-prompt"), 1);

  assert.match(css, /data-iphone-handoff-mode="visible"\] h2,[\s\S]*?data-iphone-handoff-mode="visible"\] h4,[\s\S]*?data-iphone-handoff-mode="visible"\] h5/);
  assert.match(css, /\.pp-result-cta > \.pp-app-actions:has\(#payment-plan-result-primary-download\[hidden\]\)/);
  assert.match(css, /\.pp-result-cta > \.payment-plan-results-iphone-handoff\s*\{\s*grid-column: 1 \/ -1;/);
  assert.match(css, /#polite-reminder-post-copy-primary-download\[hidden\] ~ \.polite-reminder-post-copy__price/);

  const manifest = JSON.parse(manifestText);
  assert.deepEqual(manifest.codes.map((code) => code.filename), [
    "home.png",
    "roommate.png",
    "split.png",
    "money-owed.png",
    "repayment-plan.png",
  ]);
  assert.equal(sha256(moneyOwedPng), "d514dd538a9c7007b64c8a31a6c2d5a33a390e5de28153fef49646eb77d89c91");
  assert.equal(sha256(repaymentPlanPng), "f75999df5cc513f3a007c9cfc40f839cbed2147bdb8aa803f4ef14689b249010");
  for (const [filename, ppid] of [
    ["money-owed.png", "0ad25f49-9026-4d8b-99ea-9581a98702db"],
    ["repayment-plan.png", "d845bed2-b88d-47a2-854a-9aa0c35eb049"],
  ]) {
    const code = manifest.codes.find((item) => item.filename === filename);
    assert.equal(code.url, `${appStoreBase}?ppid=${ppid}&pt=117888502&ct=website_qr_exp006&mt=8`);
    assert.ok(generator.includes(`HandoffCode(filename: "${filename}"`));
  }
});
