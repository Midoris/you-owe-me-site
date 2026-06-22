#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  appStoreCppRouting,
  appStoreCppUrls,
  bestNextStepStrategicUrls,
  contentRegistry,
  getContentRoutingMetadata,
} from "../content/content-registry.mjs";
import {
  resolveBestNextSteps,
} from "./best-next-step-component.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://you-owe-me.com";
const startMarker = "<!-- best-next-step:start -->";
const endMarker = "<!-- best-next-step:end -->";
const excludedRouteDirs = new Set([".git", ".agents", ".codex", "assets", "downloads", "images", "styles", "scripts"]);
const hubUrls = ["/find/", "/solutions/", "/tools/"];

const priorityAuditTiers = {
  tier1: [
    "/",
    "/find/",
    "/solutions/",
    "/tools/",
    "/features/",
    "/reviews/",
    "/blog/what-is-a-running-balance-between-two-people/",
    "/tools/running-balance-calculator/",
    "/solutions/app-to-track-money-owed/",
    "/tools/split-expense-calculator/",
    "/blog/how-to-remind-someone-they-owe-you-money-politely/",
  ],
  tier2: [
    "/solutions/temporary-financial-support-tracker/",
    "/blog/how-to-ask-family-for-temporary-financial-help/",
    "/blog/how-to-support-someone-financially-without-confusion/",
    "/blog/how-to-send-a-repayment-update-when-you-need-more-time/",
    "/tools/temporary-financial-support-record-template/",
    "/tools/payment-plan-calculator/",
    "/tools/partial-repayment-calculator/",
    "/blog/how-to-follow-up-after-a-partial-repayment/",
    "/tools/repayment-receipt-generator/",
    "/tools/repayment-reminder-text-examples/",
    "/tools/polite-payback-reminder-generator/",
  ],
  tier3: [
    "/solutions/elderly-parent-expense-tracker/",
    "/blog/how-to-track-money-you-pay-for-elderly-parents/",
    "/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/",
    "/solutions/family-reimbursement-tracker/",
    "/tools/family-reimbursement-tracker-template/",
    "/solutions/roommate-expense-tracker/",
    "/tools/roommate-bill-split-calculator/",
    "/blog/how-to-track-money-between-roommates/",
    "/blog/how-to-split-rent-utilities-and-groceries-with-roommates/",
    "/solutions/expense-tracker-for-couples/",
    "/solutions/client-payment-records/",
    "/compare/splitwise-alternative/",
    "/compare/spreadsheet-vs-app-for-tracking-money-owed/",
    "/quick-start/",
  ],
};

const conversionRoles = new Set(["router", "entry", "utility", "explanation", "solution", "trust", "conversion", "support", "answer-entry-to-group-paybacks-solution-and-app-store"]);
const destinationStates = new Set(["defaultAppStore", "plannedCpp", "activeCpp"]);
const genericCtaText = new Set(["download now", "get started", "learn more", "read more", "click here"]);

function routeFilePath(url) {
  if (url === "/") return path.join(rootDir, "index.html");
  return path.join(rootDir, url.slice(1), "index.html");
}

function routeFromIndexPath(filePath) {
  const relative = path.relative(rootDir, filePath).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  return `/${path.dirname(relative)}/`;
}

function collectIndexRoutes(dir, routes) {
  for (const name of fs.readdirSync(dir)) {
    if (excludedRouteDirs.has(name)) continue;

    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      collectIndexRoutes(filePath, routes);
      continue;
    }

    if (name === "index.html") {
      routes.set(routeFromIndexPath(filePath), filePath);
    }
  }
}

function readHtml(filePath, cache) {
  if (!cache.has(filePath)) cache.set(filePath, fs.readFileSync(filePath, "utf8"));
  return cache.get(filePath);
}

function hasAnchor(filePath, hash, htmlCache) {
  if (!hash) return true;
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const html = readHtml(filePath, htmlCache);
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\s(?:id|name)=(["'])${escapedId}\\1`).test(html);
}

function extractHrefs(html) {
  const hrefs = [];
  const pattern = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
  let match;
  while ((match = pattern.exec(html))) {
    hrefs.push(match[2].trim());
  }
  return hrefs;
}

function isStaticAsset(pathname) {
  const lastSegment = pathname.split("/").pop() || "";
  if (!lastSegment.includes(".")) return false;
  return !lastSegment.endsWith(".html");
}

function normalizeInternalHref(href, sourceUrl) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return null;
  }

  if (href.startsWith("#")) {
    return { type: "internal", url: sourceUrl, hash: href, raw: href };
  }

  let parsed;
  try {
    parsed = new URL(href, `${siteOrigin}${sourceUrl}`);
  } catch (error) {
    return { type: "invalid", raw: href };
  }

  if (parsed.hostname === "apps.apple.com") {
    return { type: "app-store", href: parsed.href, raw: href };
  }

  if (parsed.origin !== siteOrigin) {
    return { type: "external", href: parsed.href, raw: href };
  }

  if (isStaticAsset(parsed.pathname)) {
    return { type: "asset", href: parsed.href, raw: href };
  }

  let normalizedPath = parsed.pathname;
  if (normalizedPath.endsWith("/index.html")) {
    normalizedPath = normalizedPath.slice(0, -"index.html".length);
  }
  if (normalizedPath === "/index.html") normalizedPath = "/";
  if (normalizedPath !== "/" && !normalizedPath.endsWith("/")) normalizedPath += "/";

  return {
    type: "internal",
    url: normalizedPath,
    hash: parsed.hash,
    raw: href,
  };
}

function parseSitemapUrls() {
  const sitemapPath = path.join(rootDir, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return new Set();

  const xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = new Set();
  const pattern = /<loc>https:\/\/you-owe-me\.com([^<]+)<\/loc>/g;
  let match;
  while ((match = pattern.exec(xml))) {
    const normalized = normalizeInternalHref(match[1], "/");
    if (normalized && normalized.type === "internal") urls.add(normalized.url);
  }
  return urls;
}

function isAppStoreUrl(url) {
  return /^https:\/\/apps\.apple\.com\/.+id1147058670/.test(url);
}

function isStrategic(entry) {
  return entry.status === "live" && (entry.priority === "core" || entry.priority === "high");
}

function getTierForUrl(url) {
  for (const [tier, urls] of Object.entries(priorityAuditTiers)) {
    if (urls.includes(url)) return tier;
  }
  return null;
}

function addIssue(list, severity, message, data = {}) {
  list.push({ severity, message, ...data });
}

function formatIssue(issue) {
  return `- ${issue.message}`;
}

function main() {
  const errors = [];
  const warnings = [];
  const htmlCache = new Map();
  const routeFiles = new Map();
  const byUrl = new Map(contentRegistry.map((entry) => [entry.url, entry]));
  const liveEntries = contentRegistry.filter((entry) => entry.status === "live");
  const strategicBnsUrls = new Set(bestNextStepStrategicUrls);
  const sitemapUrls = parseSitemapUrls();
  const hubLinks = new Map();

  collectIndexRoutes(rootDir, routeFiles);

  for (const [route, filePath] of routeFiles) {
    if (!byUrl.has(route)) {
      addIssue(errors, "hard", `${route}: live route file does not have a registry entry`);
    }

    const html = readHtml(filePath, htmlCache);
    for (const href of extractHrefs(html)) {
      const normalized = normalizeInternalHref(href, route);
      if (!normalized || normalized.type === "external" || normalized.type === "asset") continue;

      if (normalized.type === "invalid") {
        addIssue(errors, "hard", `${route}: invalid href "${href}"`);
        continue;
      }

      if (normalized.type === "app-store") {
        if (!isAppStoreUrl(normalized.href)) {
          addIssue(errors, "hard", `${route}: App Store CTA is not an approved You Owe Me App Store URL: ${normalized.href}`);
        }
        continue;
      }

      if (!routeFiles.has(normalized.url)) {
        addIssue(errors, "hard", `${route}: internal link points to missing page ${normalized.raw}`);
        continue;
      }

      if (normalized.hash && !hasAnchor(routeFiles.get(normalized.url), normalized.hash, htmlCache)) {
        addIssue(errors, "hard", `${route}: internal link points to missing anchor ${normalized.url}${normalized.hash}`);
      }
    }
  }

  for (const entry of contentRegistry) {
    if (entry.status === "live" && !routeFiles.has(entry.url)) {
      addIssue(errors, "hard", `${entry.url}: live registry entry points to a missing page`);
    }

    if (entry.status === "live" && !sitemapUrls.has(entry.url) && entry.priority !== "low") {
      addIssue(warnings, "warning", `${entry.url}: live non-low-priority page is missing from sitemap.xml`);
    }

    if (entry.status !== "live") continue;

    const metadata = getContentRoutingMetadata(entry);
    if (!conversionRoles.has(metadata.conversionRole)) {
      addIssue(errors, "hard", `${entry.url}: unsupported conversionRole ${metadata.conversionRole}`);
    }
    if (!destinationStates.has(metadata.appStoreDestinationState)) {
      addIssue(errors, "hard", `${entry.url}: unsupported appStoreDestinationState ${metadata.appStoreDestinationState}`);
    }

    const cppUrl = appStoreCppUrls[entry.appStoreCpp];
    const cppRouting = appStoreCppRouting[entry.appStoreCpp];
    if (!cppRouting) {
      addIssue(errors, "hard", `${entry.url}: appStoreCpp ${entry.appStoreCpp} has no routing metadata`);
    } else if (metadata.appStoreDestinationState === "activeCpp" && !cppUrl) {
      addIssue(errors, "hard", `${entry.url}: appStoreCpp ${entry.appStoreCpp} is activeCpp but has no URL`);
    } else if (metadata.appStoreDestinationState === "plannedCpp" && !cppUrl && isStrategic(entry)) {
      addIssue(warnings, "warning", `${entry.url}: intended App Store CPP ${entry.appStoreCpp} is planned; live app cards will fall back to the default App Store URL`);
    } else if (metadata.appStoreDestinationState === "defaultAppStore" && isStrategic(entry) && !["home", "hub", "feature", "reviews", "quick-start"].includes(entry.pageType)) {
      addIssue(warnings, "warning", `${entry.url}: strategic page uses the default App Store destination`);
    }

    const relatedCount = (entry.relatedPages || []).length + (entry.relatedTools || []).length + (entry.relatedSolutions || []).length;
    if (isStrategic(entry) && relatedCount < 2) {
      addIssue(warnings, "warning", `${entry.url}: page has fewer than two useful related links in the registry`);
    }
    if (relatedCount > 12) {
      addIssue(warnings, "warning", `${entry.url}: registry has ${relatedCount} related links; confirm the page is not over-linked`);
    }

    const filePath = routeFiles.get(entry.url);
    const html = filePath ? readHtml(filePath, htmlCache) : "";
    const hasMarkers = html.includes(startMarker) && html.includes(endMarker);
    const markerBlock = hasMarkers
      ? html.slice(html.indexOf(startMarker), html.indexOf(endMarker) + endMarker.length)
      : "";
    const renderedBns = markerBlock.includes('data-module="best-next-step"');
    const resolved = resolveBestNextSteps(entry, byUrl);
    const shouldAuditBns = strategicBnsUrls.has(entry.url) || Boolean(entry.bestNextSteps) || hasMarkers;

    if (strategicBnsUrls.has(entry.url)) {
      if (!resolved || !resolved.enabled) {
        addIssue(errors, "hard", `${entry.url}: strategic page does not resolve to an enabled Best Next Step module`);
      }
      if (!hasMarkers) {
        addIssue(errors, "hard", `${entry.url}: strategic page is missing Best Next Step marker comments`);
      } else if (!renderedBns) {
        addIssue(errors, "hard", `${entry.url}: Best Next Step marker exists but no module is rendered`);
      }
    } else if (entry.bestNextSteps && entry.bestNextSteps.enabled !== false && !hasMarkers) {
      addIssue(warnings, "warning", `${entry.url}: Best Next Step config exists but the page has no marker block`);
    }

    if (hasMarkers && (!resolved || !resolved.enabled)) {
      addIssue(errors, "hard", `${entry.url}: Best Next Step marker exists but registry data does not resolve`);
    }

    if (shouldAuditBns && resolved && resolved.enabled) {
      for (const step of resolved.steps) {
        const href = step.resolved.href;
        if (/^https?:\/\//.test(href)) {
          if (!isAppStoreUrl(href)) {
            addIssue(errors, "hard", `${entry.url}: Best Next Step card "${step.title}" points to an invalid App Store URL`);
          }
          continue;
        }

        if (href.startsWith("#")) {
          if (filePath && !hasAnchor(filePath, href, htmlCache)) {
            addIssue(errors, "hard", `${entry.url}: Best Next Step card "${step.title}" points to missing anchor ${href}`);
          }
          continue;
        }

        const normalized = normalizeInternalHref(href, entry.url);
        if (!normalized || normalized.type !== "internal" || !byUrl.has(normalized.url) || !routeFiles.has(normalized.url)) {
          addIssue(errors, "hard", `${entry.url}: Best Next Step card "${step.title}" points to missing page ${href}`);
        }
      }

      const firstStep = resolved.steps[0];
      const firstText = String(firstStep.title || firstStep.label || "").trim().toLowerCase();
      if (firstStep.type === "app" && resolved.steps.some((step) => step.type !== "app")) {
        addIssue(warnings, "warning", `${entry.url}: first Best Next Step card is an app CTA even though lower-friction actions exist`);
      }
      if (genericCtaText.has(firstText)) {
        addIssue(warnings, "warning", `${entry.url}: first Best Next Step card uses generic copy "${firstStep.title || firstStep.label}"`);
      }
      if (resolved.source !== "page" && strategicBnsUrls.has(entry.url)) {
        addIssue(warnings, "warning", `${entry.url}: strategic Best Next Step uses ${resolved.source} fallback copy instead of page-specific routing`);
      }
    }
  }

  for (const [route] of routeFiles) {
    if (sitemapUrls.has(route) || !sitemapUrls.size) continue;
    const entry = byUrl.get(route);
    if (entry && entry.status === "live" && entry.priority !== "low") {
      addIssue(warnings, "warning", `${route}: live route is not present in sitemap.xml`);
    }
  }

  for (const sitemapUrl of sitemapUrls) {
    if (!routeFiles.has(sitemapUrl)) {
      addIssue(errors, "hard", `${sitemapUrl}: sitemap URL points to a missing page`);
    }
    if (!byUrl.has(sitemapUrl)) {
      addIssue(errors, "hard", `${sitemapUrl}: sitemap URL is missing from registry`);
    }
  }

  for (const hubUrl of hubUrls) {
    const filePath = routeFiles.get(hubUrl);
    const links = new Set();
    if (filePath) {
      const html = readHtml(filePath, htmlCache);
      for (const href of extractHrefs(html)) {
        const normalized = normalizeInternalHref(href, hubUrl);
        if (normalized && normalized.type === "internal") links.add(normalized.url);
      }
    }
    hubLinks.set(hubUrl, links);
  }

  for (const entry of liveEntries) {
    if (!isStrategic(entry)) continue;

    if (entry.pageType === "solution" && !hubLinks.get("/solutions/").has(entry.url)) {
      addIssue(warnings, "warning", `${entry.url}: strategic solution is not linked from /solutions/`);
    }

    if (entry.pageType === "tool" && !hubLinks.get("/tools/").has(entry.url)) {
      addIssue(warnings, "warning", `${entry.url}: strategic tool is not linked from /tools/`);
    }

    if (["solution", "tool", "guide", "compare"].includes(entry.pageType) && !hubLinks.get("/find/").has(entry.url)) {
      addIssue(warnings, "warning", `${entry.url}: strategic page is not linked from /find/`);
    }
  }

  for (const [tier, urls] of Object.entries(priorityAuditTiers)) {
    for (const url of urls) {
      const fileExists = routeFiles.has(url);
      const entry = byUrl.get(url);
      if (fileExists && !entry) {
        addIssue(errors, "hard", `${url}: ${tier} priority page exists but is missing from registry`);
      } else if (!fileExists) {
        addIssue(warnings, "warning", `${url}: ${tier} priority URL was requested for audit but no live page was found`);
      } else if (entry.status !== "live") {
        addIssue(errors, "hard", `${url}: ${tier} priority page is not marked live in registry`);
      }
    }
  }

  const report = [
    "Content routing audit",
    `Live route files: ${routeFiles.size}`,
    `Registry entries: ${contentRegistry.length}`,
    `Sitemap URLs: ${sitemapUrls.size}`,
    `Strategic BNS URLs: ${strategicBnsUrls.size}`,
    `Hard errors: ${errors.length}`,
    `Warnings: ${warnings.length}`,
  ];

  console.log(report.join("\n"));

  if (errors.length > 0) {
    console.error("\nHard errors:");
    for (const error of errors) console.error(formatIssue(error));
  }

  if (warnings.length > 0) {
    console.warn("\nWarnings:");
    for (const warning of warnings) console.warn(formatIssue(warning));
  }

  if (errors.length > 0) process.exit(1);
}

main();
