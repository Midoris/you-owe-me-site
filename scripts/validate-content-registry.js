#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const registryPath = path.join(rootDir, "content", "content-registry.mjs");

const requiredFields = [
  "url",
  "title",
  "pageType",
  "cluster",
  "primaryAudience",
  "problemSolved",
  "useWhen",
  "parent",
  "relatedPages",
  "relatedTools",
  "relatedSolutions",
  "appStoreCpp",
  "tags",
  "updated",
  "status",
  "priority",
  "primaryCta",
  "nextStep",
];

const pageTypes = new Set([
  "home",
  "hub",
  "solution",
  "tool",
  "guide",
  "compare",
  "feature",
  "reviews",
  "quick-start",
  "legal",
  "support",
]);

const clusters = new Set([
  "homepage",
  "money-owed",
  "temporary-support",
  "family",
  "roommates",
  "couples",
  "shared-expenses",
  "repayments",
  "running-balance",
  "tools",
  "compare",
  "features",
  "reviews",
  "caregiving",
  "client-records",
  "long-term-balances",
]);

const statuses = new Set(["live", "planned", "draft"]);
const priorities = new Set(["core", "high", "medium", "low"]);

function routeFilePath(url) {
  if (url === "/") return path.join(rootDir, "index.html");
  return path.join(rootDir, url.slice(1), "index.html");
}

function isMissing(value) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function validateArrayLinks(entry, field, errors, byUrl, expectedType) {
  if (!Array.isArray(entry[field])) {
    errors.push(`${entry.url}: ${field} must be an array`);
    return;
  }

  const seen = new Set();
  for (const url of entry[field]) {
    if (typeof url !== "string") {
      errors.push(`${entry.url}: ${field} entries must be URL strings`);
      continue;
    }

    if (url === entry.url) {
      errors.push(`${entry.url}: ${field} must not link to itself`);
    }

    if (seen.has(url)) {
      errors.push(`${entry.url}: duplicate ${field} link ${url}`);
    }
    seen.add(url);

    const related = byUrl.get(url);
    if (!related) {
      errors.push(`${entry.url}: ${field} references unknown URL ${url}`);
      continue;
    }

    if (expectedType && related.pageType !== expectedType) {
      errors.push(`${entry.url}: ${field} link ${url} must be pageType ${expectedType}, found ${related.pageType}`);
    }
  }
}

async function main() {
  const errors = [];
  const { contentRegistry, appStoreCppUrls } = await import(pathToFileURL(registryPath).href);

  if (!Array.isArray(contentRegistry)) {
    throw new Error("contentRegistry must be an exported array");
  }

  const byUrl = new Map();
  for (const entry of contentRegistry) {
    if (!entry || typeof entry !== "object") {
      errors.push("Every registry item must be an object");
      continue;
    }

    if (byUrl.has(entry.url)) {
      errors.push(`Duplicate URL: ${entry.url}`);
    }
    byUrl.set(entry.url, entry);
  }

  for (const entry of contentRegistry) {
    for (const field of requiredFields) {
      if (isMissing(entry[field])) {
        errors.push(`${entry.url || "(missing url)"}: missing ${field}`);
      }
    }

    if (typeof entry.url === "string" && (!entry.url.startsWith("/") || !entry.url.endsWith("/"))) {
      errors.push(`${entry.url}: URLs must start and end with "/"`);
    }

    if (!pageTypes.has(entry.pageType)) {
      errors.push(`${entry.url}: unsupported pageType ${entry.pageType}`);
    }

    if (!clusters.has(entry.cluster)) {
      errors.push(`${entry.url}: unsupported cluster ${entry.cluster}`);
    }

    if (!statuses.has(entry.status)) {
      errors.push(`${entry.url}: unsupported status ${entry.status}`);
    }

    if (!priorities.has(entry.priority)) {
      errors.push(`${entry.url}: unsupported priority ${entry.priority}`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.updated)) {
      errors.push(`${entry.url}: updated must use YYYY-MM-DD`);
    }

    if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
      errors.push(`${entry.url}: tags must be a non-empty array`);
    }

    if (!appStoreCppUrls || !Object.prototype.hasOwnProperty.call(appStoreCppUrls, entry.appStoreCpp)) {
      errors.push(`${entry.url}: unknown appStoreCpp ${entry.appStoreCpp}`);
    }

    if (entry.status === "live" && !fs.existsSync(routeFilePath(entry.url))) {
      errors.push(`${entry.url}: live route file does not exist`);
    }

    if (!byUrl.has(entry.parent)) {
      errors.push(`${entry.url}: parent ${entry.parent} is not in registry`);
    }

    validateArrayLinks(entry, "relatedPages", errors, byUrl);
    validateArrayLinks(entry, "relatedTools", errors, byUrl, "tool");
    validateArrayLinks(entry, "relatedSolutions", errors, byUrl, "solution");

    if (entry.pageType === "tool" && entry.relatedSolutions.length === 0) {
      errors.push(`${entry.url}: tools must link to at least one related solution`);
    }

    if (entry.pageType === "solution") {
      const hasGuide = entry.relatedPages.some((url) => byUrl.get(url)?.pageType === "guide");
      if (entry.relatedTools.length === 0) {
        errors.push(`${entry.url}: solutions must link to related tools`);
      }
      if (!hasGuide) {
        errors.push(`${entry.url}: solutions must link to at least one related guide`);
      }
    }

    if (entry.pageType === "guide" && (entry.relatedPages.length === 0 || entry.relatedTools.length === 0 || entry.relatedSolutions.length === 0)) {
      errors.push(`${entry.url}: guides must not be isolated`);
    }
  }

  if (errors.length > 0) {
    console.error(`Content registry validation failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Content registry validation passed for ${contentRegistry.length} page(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
