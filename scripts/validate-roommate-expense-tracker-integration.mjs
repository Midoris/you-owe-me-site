#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appStoreCppRouting,
  appStoreCppUrls,
  bestNextStepStrategicUrls,
  contentRegistry,
} from "../content/content-registry.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = "/tools/roommate-expense-tracker-template/";
const productionOrigin = "https://you-owe-me.com";
const cppKey = "roommates-shared-household-costs";
const cppUrl = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12&pt=117888502&ct=website_cta&mt=8";

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function occurrences(text, value) {
  return text.split(value).length - 1;
}

const registryByUrl = new Map(contentRegistry.map((entry) => [entry.url, entry]));
const entry = registryByUrl.get(route);
assert.ok(entry, "roommate spreadsheet registry entry is missing");
assert.deepEqual(
  {
    title: entry.title,
    pageType: entry.pageType,
    cluster: entry.cluster,
    parent: entry.parent,
    conversionRole: entry.conversionRole,
    analyticsCluster: entry.analyticsCluster,
    appStoreCpp: entry.appStoreCpp,
    appStoreDestinationState: entry.appStoreDestinationState,
    appStoreIntendedCluster: entry.appStoreIntendedCluster,
    updated: entry.updated,
    status: entry.status,
    priority: entry.priority,
  },
  {
    title: "Roommate Expense Tracker Spreadsheet",
    pageType: "tool",
    cluster: "roommates",
    parent: "/tools/",
    conversionRole: "utility",
    analyticsCluster: "roommates_household_costs",
    appStoreCpp: cppKey,
    appStoreDestinationState: "activeCpp",
    appStoreIntendedCluster: "roommates",
    updated: "2026-08-23",
    status: "live",
    priority: "core",
  },
);
assert.deepEqual(entry.relatedPages, [
  "/blog/how-to-track-money-between-roommates/",
  "/blog/how-to-split-rent-utilities-and-groceries-with-roommates/",
  "/compare/spreadsheet-vs-app-for-tracking-money-owed/",
]);
assert.deepEqual(entry.relatedTools, [
  "/tools/roommate-bill-split-calculator/",
  "/tools/split-expense-calculator/",
  "/tools/repayment-receipt-generator/",
  "/tools/running-balance-calculator/",
]);
assert.deepEqual(entry.relatedSolutions, [
  "/solutions/roommate-expense-tracker/",
  "/solutions/shared-expense-tracker/",
]);
assert.equal(entry.problemSolved, "Gives roommates a reusable Excel workbook for agreed expenses, equal or custom shares, separate repayments, opening balances, and a clear monthly settle-up—without requiring an app.");
assert.equal(entry.useWhen, "Use when roommate costs repeat across months, one person can maintain the file, and a one-month calculator is no longer enough.");
assert.equal(entry.nextStep, "Use the roommate bill calculator for one month. Keep the spreadsheet for repeated manual tracking, or use the roommate expense tracker when ongoing upkeep becomes the problem.");
assert.equal(entry.bestNextSteps.steps.length, 4);
assert.equal(entry.bestNextSteps.placement, "after-product-bridge");
assert.equal(entry.bestNextSteps.heading, "Choose the next step for your roommate record");
assert.equal(entry.bestNextSteps.intro, "Keep the spreadsheet if it fits. Otherwise, choose the option that matches what is still unclear: this month’s total, the sharing rules, whether manual upkeep is enough, or how ongoing tracking works.");
assert.deepEqual(entry.bestNextSteps.steps.map((step) => step.href), [
  "/tools/roommate-bill-split-calculator/",
  "/blog/how-to-split-rent-utilities-and-groceries-with-roommates/",
  "/compare/spreadsheet-vs-app-for-tracking-money-owed/",
  "/solutions/roommate-expense-tracker/",
]);
assert.ok(bestNextStepStrategicUrls.includes(route));
assert.equal(appStoreCppUrls[cppKey], cppUrl);
assert.deepEqual(appStoreCppRouting[cppKey], {
  destinationState: "activeCpp",
  analyticsCluster: "roommates_household_costs",
  intendedCluster: "roommates",
});

const relationshipUrls = [
  "/tools/",
  "/find/",
  "/solutions/",
  "/blog/",
  "/solutions/roommate-expense-tracker/",
  "/tools/roommate-bill-split-calculator/",
  "/blog/how-to-track-money-between-roommates/",
  "/blog/how-to-split-rent-utilities-and-groceries-with-roommates/",
  "/compare/spreadsheet-vs-app-for-tracking-money-owed/",
];
for (const url of relationshipUrls) {
  const relatedEntry = registryByUrl.get(url);
  assert.ok(relatedEntry.relatedTools.includes(route), `${url} is missing the roommate spreadsheet relationship`);
  assert.equal(relatedEntry.updated, "2026-08-23", `${url} has a stale registry date`);
}

const page = read("tools/roommate-expense-tracker-template/index.html");
const pageCss = read("styles/roommate-expense-tracker-template.css");
assert.ok(!page.includes("youoweme.io"));
assert.ok(page.includes("<title>Roommate Expense Tracker Spreadsheet | Free Template</title>"));
assert.ok(page.includes('<meta name="viewport" content="width=device-width, initial-scale=1" />'));
for (const absoluteUrl of [
  `${productionOrigin}${route}`,
  `${productionOrigin}/tools/`,
  `${productionOrigin}/images/tools/roommate-expense-tracker-template/roommate-expense-tracker-spreadsheet-hero.webp`,
]) {
  assert.ok(page.includes(absoluteUrl), `new page is missing ${absoluteUrl}`);
}
const smartBanner = '<meta name="apple-itunes-app" content="app-id=1147058670, affiliate-data=pt=117888502&amp;ct=website_smart_banner" />';
assert.equal(occurrences(page, smartBanner), 1);
assert.equal(occurrences(page, "data-app-language-support-anchor hidden"), 1);
assert.equal(occurrences(page, '<link rel="stylesheet" href="/styles/app-language-support.css" />'), 1);
assert.equal(occurrences(page, '<script src="/scripts/app-language-support.js"></script>'), 1);
assert.equal(occurrences(page, `href="${cppUrl}"`), 1);
assert.match(page, new RegExp(`href="${cppUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?class="lt-appStoreBtn"[\\s\\S]*?download-on-the-app-store/black/en-us`));

const comparisonPosition = page.indexOf("When the spreadsheet is enough—and when it is not");
const productPosition = page.indexOf("When the spreadsheet becomes hard to maintain");
const bnsStart = page.indexOf("<!-- best-next-step:start -->");
const bnsEnd = page.indexOf("<!-- best-next-step:end -->");
const faqPosition = page.indexOf("Roommate spreadsheet questions");
assert.ok(comparisonPosition < productPosition && productPosition < bnsStart && bnsStart < bnsEnd && bnsEnd < faqPosition);
const product = page.slice(productPosition, bnsStart);
assert.equal(occurrences(product, `href="${cppUrl}"`), 1);
const badgePosition = product.indexOf(`href="${cppUrl}"`);
const solutionPosition = product.indexOf('href="/solutions/roommate-expense-tracker/"');
const privacyPosition = product.indexOf('href="/privacy-and-data/"');
assert.ok(badgePosition < solutionPosition && solutionPosition < privacyPosition);
assert.ok(!pageCss.includes("width: 154px"));
assert.ok(!pageCss.includes(".roommate-template-product .lt-appStoreBtn img"));
assert.ok(!page.includes("Related roommate tools and guides"));
assert.ok(!page.includes("Download a clean Excel copy"));
assert.ok(!page.includes("Download the example and blank workbook"));
const bns = page.slice(bnsStart, bnsEnd);
assert.equal(occurrences(bns, 'class="best-next-step__card"'), 4);
assert.ok(!bns.includes("apps.apple.com"));
assert.deepEqual(
  [...bns.matchAll(/class="best-next-step__card" href="([^"]+)"/g)].map((match) => match[1]),
  entry.bestNextSteps.steps.map((step) => step.href),
);
for (const step of entry.bestNextSteps.steps) {
  assert.ok(bns.includes(`data-step-analytics-id="${step.analyticsId}"`));
}

const approvedDownloads = new Map([
  ["roommate_expense_spreadsheet_hero_excel_download", "/downloads/roommate-expense-tracker-template.xlsx"],
  ["roommate_expense_spreadsheet_download_card_excel", "/downloads/roommate-expense-tracker-template.xlsx"],
  ["roommate_expense_spreadsheet_download_card_csv", "/downloads/roommate-expense-tracker-template.csv"],
  ["roommate_expense_spreadsheet_method_excel_download", "/downloads/roommate-expense-tracker-template.xlsx"],
  ["roommate_expense_spreadsheet_final_excel_download", "/downloads/roommate-expense-tracker-template.xlsx"],
]);
const downloadLinks = [...page.matchAll(/<a\b[^>]*href="(\/downloads\/roommate-expense-tracker-template\.(?:xlsx|csv))"[^>]*>/g)].map((match) => match[0]);
assert.equal(downloadLinks.length, approvedDownloads.size);
for (const [location, href] of approvedDownloads) {
  const link = downloadLinks.find((candidate) => candidate.includes(`data-track-location="${location}"`));
  assert.ok(link, `missing tracked download ${location}`);
  assert.ok(link.includes(`href="${href}"`), `${location} has the wrong href`);
  assert.ok(link.includes('data-track-event="site_link_click"'), `${location} has the wrong event`);
  assert.ok(link.includes('download="roommate-expense-tracker-template.'), `${location} is missing the download filename`);
}

const inboundChecks = new Map([
  ["tools/index.html", ["Use a reusable Excel workbook for two to six roommates.", "Open roommate spreadsheet template"]],
  ["find/index.html", ["Get a roommate spreadsheet", "Open spreadsheet template", "one person can maintain the file, and a one-month calculator is no longer enough"]],
  ["blog/index.html", ["Free roommate tool", "Roommate Expense Tracker Spreadsheet"]],
  ["solutions/index.html", ["Need a reusable manual record? Get the"]],
  ["blog/how-to-track-money-between-roommates/index.html", ["If you want to use this method manually, open the"]],
  ["blog/how-to-split-rent-utilities-and-groceries-with-roommates/index.html", ["If the costs will repeat and one person wants to maintain a manual file, open the"]],
  ["solutions/roommate-expense-tracker/index.html", ["Open the spreadsheet template", "Need a manual starting point? Get the"]],
  ["tools/roommate-bill-split-calculator/index.html", ["If the costs repeat but one person is comfortable maintaining a manual file, use the"]],
  ["compare/spreadsheet-vs-app-for-tracking-money-owed/index.html", ["For roommate bills, open the"]],
]);
for (const [relativePath, fragments] of inboundChecks) {
  const html = read(relativePath);
  for (const fragment of fragments) assert.ok(html.includes(fragment), `${relativePath} is missing: ${fragment}`);
  assert.ok(html.includes(`href="${route}"`), `${relativePath} is missing the route link`);
}

const sitemap = read("sitemap.xml");
const sitemapBlock = `<loc>${productionOrigin}${route}</loc>\n    <lastmod>2026-08-23</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.88</priority>`;
assert.equal(occurrences(sitemap, sitemapBlock), 1);
for (const url of [...relationshipUrls, route]) {
  const block = sitemap.match(new RegExp(`<url>[\\s\\S]*?<loc>${productionOrigin}${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>[\\s\\S]*?</url>`))?.[0];
  assert.ok(block?.includes("<lastmod>2026-08-23</lastmod>"), `${url} has a stale sitemap date`);
}

const llms = read("llms.txt");
assert.equal(occurrences(llms, `[Roommate Expense Tracker Spreadsheet](${productionOrigin}${route})`), 2);
const analytics = read("scripts/analytics.js");
assert.equal(occurrences(analytics, `"${route}": { page_type: "tool", cluster: "roommates_household_costs", app_store_cpp: "roommates_household_costs" }`), 1);
assert.equal(occurrences(analytics, '"18039f2b-da9e-4d5f-9ba1-b60f117ecf12": "roommates_household_costs"'), 1);
assert.ok(read("scripts/audit-content-routing.mjs").includes(`"${route}",`));

for (const relativePath of ["tools/roommate-expense-tracker-template/index.html", ...inboundChecks.keys()]) {
  const html = read(relativePath);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)) {
    const target = match[1];
    const targetPath = target.endsWith("/")
      ? path.join(rootDir, target, "index.html")
      : path.join(rootDir, target);
    assert.ok(fs.existsSync(targetPath), `${relativePath} points to missing local target ${target}`);
  }
}

console.log("validated roommate spreadsheet registry, routing, hubs, inbound links, BNS, metadata, sitemap, llms, analytics, and local targets");
