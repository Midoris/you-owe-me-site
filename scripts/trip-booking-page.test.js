#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const route = "/blog/when-to-collect-money-before-a-group-trip/";
const htmlPath = path.join(root, route.slice(1), "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

assert(html.includes("<title>Should Friends Pay You Back Before a Group Trip? A Fair Booking Plan</title>"), "exact title tag");
assert(html.includes('content="Decide which hotel, Airbnb, ticket, and deposit costs friends should repay before travel, what can wait, and how to set a clear deadline, refund rule, and message."'), "exact meta description");
assert(html.includes('<link rel="canonical" href="https://you-owe-me.com/blog/when-to-collect-money-before-a-group-trip/"'), "exact canonical");
assert.strictEqual((html.match(/<h1\b/g) || []).length, 1, "exactly one H1");
assert(html.includes("<h1 id=\"hero-title\">When to Collect Hotel and Booking Money Before a Group Trip</h1>"), "exact H1");
assert(!/lt-appStoreBtn[\s\S]{0,1500}tbp-hero/.test(html), "no App Store CTA before hero");
assert(html.indexOf("When You Owe Me becomes useful") > html.indexOf("Choose the right tool for what happens next"), "product bridge appears after tool choice");
assert(html.indexOf("apps.apple.com") > html.indexOf("When You Owe Me becomes useful"), "App Store CTA appears only in late product section");
assert(html.indexOf("<!-- best-next-step:start -->") > html.indexOf("Can everyone update the same group trip record in You Owe Me?"), "BNS marker follows FAQ");
assert(html.includes("<!-- best-next-step:end -->"), "BNS end marker exists");

const exactRoutes = [
  "/blog/", "/blog/how-to-track-who-paid-you-back-for-a-group-expense/", "/tools/split-expense-calculator/",
  "/tools/group-payback-calculator/", "/blog/how-to-split-shared-costs-when-someone-cancels/",
  "/compare/splitwise-alternative/", "/tools/running-balance-calculator/",
  "/blog/how-to-remind-a-group-to-pay-you-back-without-spamming-everyone/", "/solutions/group-payback-tracker/",
];
for (const href of exactRoutes) {
  assert(html.includes(`href="${href}"`), `page links to ${href}`);
  assert(fs.existsSync(path.join(root, href.slice(1), "index.html")), `destination exists: ${href}`);
}

const cpp = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d333ba53-318b-44d7-ad07-f29841091043&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";
assert(html.includes(`href="${cpp}"`), "verified Group Paybacks CPP used");
const registry = fs.readFileSync(path.join(root, "content/content-registry.mjs"), "utf8");
assert(registry.includes(`"group-paybacks": "${cpp.replaceAll("&amp;", "&")}"`), "CPP matches repository registry fact");

const requiredHeadings = [
  "Three ways to handle group trip costs", "Plan the fixed booking before anyone pays",
  "Agree on these seven things before one person pays", "When collecting before booking is the fairest option",
  "When it is reasonable to book first", "Which trip costs can usually wait",
  "Set the cancellation rule while everyone still agrees", "What this looks like in real life",
  "Messages you can actually send", "Choose the right tool for what happens next",
  "When You Owe Me becomes useful", "Questions about collecting money before a group trip",
];
let previous = -1;
for (const heading of requiredHeadings) {
  const current = html.indexOf(heading);
  assert(current > previous, `section order includes ${heading}`);
  previous = current;
}

const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
assert.strictEqual(jsonBlocks.length, 1, "one parseable JSON-LD graph");
const graph = jsonBlocks[0]["@graph"];
const faqSchema = graph.find((node) => node["@type"] === "FAQPage");
assert(faqSchema, "FAQ schema exists");
assert.strictEqual(faqSchema.mainEntity.length, 10, "ten FAQ schema entries");
for (const item of faqSchema.mainEntity) {
  assert(html.includes(`<summary>${item.name}</summary>`), `FAQ question visible: ${item.name}`);
  assert(html.includes(`<p>${item.acceptedAnswer.text}</p>`), `FAQ answer exactly visible: ${item.name}`);
}

assert(html.includes("This planner does not move money."), "planner payment boundary visible");
assert(html.includes("You Owe Me does not process the payment."), "payment-processing boundary visible");
assert(html.includes("it is not a full collaborative trip ledger"), "collaborative-ledger boundary visible");
assert(!/trip_planner_start|trip_planner_complete/.test(html), "no new analytics event taxonomy");
assert(!/<img[^>]+(?:travel|trip|hotel|airbnb)[^>]*>/i.test(html), "no generic travel raster image");

console.log("trip-booking page tests passed");
