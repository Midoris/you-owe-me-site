import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const [home, roommate, split, css, manifestText, generator] = await Promise.all([
  readFile(new URL("index.html", root), "utf8"),
  readFile(new URL("tools/roommate-expense-tracker-template/index.html", root), "utf8"),
  readFile(new URL("tools/split-expense-calculator/index.html", root), "utf8"),
  readFile(new URL("styles/iphone-handoff.css", root), "utf8"),
  readFile(new URL("images/shared/iphone-handoff/manifest.json", root), "utf8"),
  readFile(new URL("scripts/generate-iphone-handoff-qr.swift", root), "utf8"),
]);

const appStoreBase = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670";
const expectedFallbacks = {
  home: `${appStoreBase}?pt=117888502&amp;ct=website_cta&amp;mt=8`,
  roommate: `${appStoreBase}?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
  split: `${appStoreBase}?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc&amp;pt=117888502&amp;ct=website_cta&amp;mt=8`,
};

function phaseBRoot(page, location) {
  const match = page.match(new RegExp(`<section class="iphone-handoff [^"]+" data-iphone-handoff data-iphone-handoff-mode="visible" data-cta-location="${location}"[\\s\\S]*?<\\/section>`));
  assert.ok(match, `missing visible Phase-B handoff for ${location}`);
  return match[0];
}

test("all Phase-B cards are automatic desktop QR cards with truthful copy and ordinary fallback attribution", () => {
  const cards = [
    ["home", phaseBRoot(home, "homepage_iphone_handoff"), "Get You Owe Me on your iPhone", "Keep loans, shared costs and repayments together.", "Scan with your iPhone camera to open the App Store.", expectedFallbacks.home, "/images/shared/iphone-handoff/home.png", "408"],
    ["roommate", phaseBRoot(roommate, "roommate_template_iphone_handoff"), "Prefer tracking on your iPhone?", "Record shared costs and repayments, and see what each roommate still owes.", "Start a new record in the app. Your spreadsheet is not imported.", expectedFallbacks.roommate, "/images/shared/iphone-handoff/roommate.png", "472"],
    ["split", phaseBRoot(split, "split_result_iphone_handoff"), "Track repayments on your iPhone", "See what is still owed as people pay you back.", "This opens the App Store. Your calculator result is not transferred.", expectedFallbacks.split, "/images/shared/iphone-handoff/split.png", "472"],
  ];

  for (const [name, card, heading, benefit, limitation, fallback, image, intrinsicSize] of cards) {
    assert.ok(card.includes("hidden>"), "initial HTML remains hidden until desktop eligibility runs");
    assert.ok(card.includes(heading));
    assert.ok(card.includes(benefit));
    assert.ok(card.includes(limitation));
    if (name === "home") {
      assert.doesNotMatch(card, /class="iphone-handoff__reassurance"/);
    } else {
      assert.ok(card.includes("Free download &middot; In-app purchases available."));
    }
    assert.ok(card.includes("View app details on the App Store"));
    assert.ok(card.includes(`href="${fallback}"`));
    assert.ok(card.includes(`src="${image}" width="${intrinsicSize}" height="${intrinsicSize}"`));
    assert.ok(card.includes('alt="QR code to open You Owe Me on the App Store."'));
    assert.ok(card.includes("data-iphone-handoff-qr"));
    assert.ok(card.includes("data-iphone-handoff-instruction"));
    assert.doesNotMatch(card, /data-iphone-handoff-trigger|data-iphone-handoff-close|Hide QR|aria-expanded/);
  }
});

test("Phase-B placement preserves home/template actions and confines split QR to valid result actions", () => {
  const homeHero = home.indexOf('<section class="lt-hero"');
  const homeCard = home.indexOf('data-cta-location="homepage_iphone_handoff"');
  const homeReview = home.indexOf('class="homepage-review-teaser"');
  assert.ok(homeHero < homeCard && homeCard < homeReview);
  assert.ok(!home.slice(home.indexOf('class="lt-heroCtas"'), homeCard).includes("data-iphone-handoff"));
  assert.doesNotMatch(home, /class="homepage-download-reassurance"/);
  assert.ok(home.includes("Find your situation"));
  assert.match(home, /id="homepage-primary-download"[\s\S]*?data-cta-location="hero"[\s\S]*?data-iphone-handoff-replaceable/);
  assert.match(home, /data-cta-location="homepage_iphone_handoff" data-iphone-handoff-replaces="homepage-primary-download"/);

  const roommateHero = roommate.indexOf('class="lt-toolsHero roommate-template-hero"');
  const roommateCard = roommate.indexOf('data-cta-location="roommate_template_iphone_handoff"');
  const roommateFit = roommate.indexOf('class="roommate-template-section roommate-template-fit"');
  assert.ok(roommateHero < roommateCard && roommateCard < roommateFit);
  assert.ok(roommate.includes("Download the Excel template"));
  assert.ok(roommate.includes("Use in Google Sheets"));
  const roommateStoryStart = roommate.indexOf('<!-- money-story:start -->');
  assert.ok(roommateFit < roommateStoryStart);
  assert.doesNotMatch(roommate.slice(0, roommateStoryStart), /data-iphone-handoff-replaces|data-iphone-handoff-replaceable/);
  assert.match(roommate.slice(roommateStoryStart), /id="roommate-story-primary-download"[\s\S]*?data-iphone-handoff-replaceable/);
  assert.match(roommate.slice(roommateStoryStart), /data-cta-location="roommate_expense_story_iphone_handoff" data-iphone-handoff-replaces="roommate-story-primary-download"/);

  const splitActions = split.indexOf('class="split-result-app-card__actions"');
  const splitCard = split.indexOf('data-cta-location="split_result_iphone_handoff"');
  const maintenanceProof = split.indexOf('class="lt-maintenanceProof"', splitActions);
  assert.ok(splitActions < splitCard && splitCard < maintenanceProof);
  assert.ok(split.indexOf('data-result-actions hidden') < splitCard, "the QR remains inside the hidden result surface");
  assert.ok(split.includes("Track this split"), "the separate iPhone App Clip flow is retained");
  assert.match(split, /id="split-result-primary-download"[\s\S]*?data-track-location="split_expense_result_app_store_cta"[\s\S]*?data-iphone-handoff-replaceable/);
  assert.match(split, /data-cta-location="split_result_iphone_handoff" data-iphone-handoff-replaces="split-result-primary-download"/);
});

test("visible cards use the shared desktop-only layout and cache-busted module path", () => {
  assert.match(css, /\.iphone-handoff\[hidden\]\s*\{\s*display: none !important;/);
  assert.match(css, /\.iphone-handoff \[hidden\]\s*\{\s*display: none !important;/);
  assert.match(css, /data-iphone-handoff-mode="visible"[\s\S]*?container-type: inline-size/);
  assert.match(css, /width: 200px;[\s\S]*?height: 200px;/);
  assert.doesNotMatch(css, /width: 200px;\s*max-width:/);
  assert.match(css, /@container \(min-width: 480px\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 200px;/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.iphone-handoff\s*\{\s*display: none !important;/);
  assert.match(css, /\[data-iphone-handoff-replaceable\]\[hidden\]\s*\{\s*display: none !important;/);
  assert.match(css, /\.iphone-handoff__fallback\s*\{[\s\S]*?display: inline-flex;[\s\S]*?min-height: 44px;/);
  assert.match(css, /\.lt-heroCtas:has\(#homepage-primary-download\[hidden\]\) \.lt-textCta/);
  assert.match(css, /#split-result-primary-download\[hidden\] ~ \.split-result-app-card__price/);

  for (const page of [home, roommate]) {
    assert.ok(page.includes("analytics.js?v=20260926-story-1"));
  }
  assert.ok(split.includes("analytics.js?v=iphone-handoff-phase-d-20260914-1"));
  for (const page of [home, roommate, split]) {
    assert.ok(page.includes("iphone-handoff.mjs?v=iphone-handoff-phase-d-20260914-1"));
    assert.ok(page.includes("styles/iphone-handoff.css?v=iphone-handoff-phase-d-20260914-1"));
  }
  assert.match(split, /split-expense-calculator\.js\?v=iphone-handoff-phase-b-20260914-2/);
});

test("the QR manifest and reproducible generator retain the original pooled-campaign destinations", () => {
  const manifest = JSON.parse(manifestText);
  assert.deepEqual(manifest.codes.slice(0, 3).map((code) => code.filename), ["home.png", "roommate.png", "split.png"]);
  const splitCode = manifest.codes.find((code) => code.filename === "split.png");
  assert.equal(splitCode.sha256, "abeb73e2adf67567fc83c9fc6c08a183b01756f9a57a23ea2312810104abcc95");
  assert.equal(splitCode.url, `${appStoreBase}?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc&pt=117888502&ct=website_qr_exp006&mt=8`);
  for (const code of manifest.codes) {
    assert.match(code.url, /pt=117888502&ct=website_qr_exp006&mt=8$/);
    assert.ok(generator.includes(`HandoffCode(filename: "${code.filename}"`));
  }
});
