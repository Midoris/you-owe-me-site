#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const registryPath = path.join(rootDir, "content", "content-registry.mjs");
const bestNextStepComponentPath = path.join(rootDir, "scripts", "best-next-step-component.mjs");

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
  "group-paybacks",
  "long-term-balances",
]);

const statuses = new Set(["live", "planned", "draft"]);
const priorities = new Set(["core", "high", "medium", "low"]);
const bestNextStepTypes = new Set(["tool", "guide", "solution", "feature", "app", "compare", "template", "anchor", "hub"]);
const bestNextStepIntents = new Set([
  "clarify_amount",
  "calculate_split",
  "calculate_running_balance",
  "plan_repayment",
  "write_message",
  "browse_examples",
  "confirm_payment",
  "create_record",
  "track_ongoing_balance",
  "set_boundary",
  "compare_methods",
  "download_app",
  "choose_starting_point",
  "handle_partial_repayment",
  "send_update",
  "family_record",
  "roommate_settle_up",
]);
const vagueLinkText = new Set(["read more", "learn more", "click here", "download now"]);

function routeFilePath(url) {
  if (url === "/") return path.join(rootDir, "index.html");
  return path.join(rootDir, url.slice(1), "index.html");
}

function isMissing(value) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function routeFromIndexPath(filePath) {
  const relative = path.relative(rootDir, filePath).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  return `/${path.dirname(relative)}/`;
}

function collectIndexRoutes(dir, routes) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "assets" || name === "images" || name === "downloads") continue;

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

function getHtml(filePath, htmlCache) {
  if (!htmlCache.has(filePath)) {
    htmlCache.set(filePath, fs.readFileSync(filePath, "utf8"));
  }

  return htmlCache.get(filePath);
}

function splitHref(href) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return { pathname: href, hash: "" };
  }

  return {
    pathname: href.slice(0, hashIndex) || "",
    hash: href.slice(hashIndex),
  };
}

function hasAnchor(filePath, hash, htmlCache) {
  if (!hash) return true;

  const id = hash.slice(1);
  if (!id) return false;

  const html = getHtml(filePath, htmlCache);
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\sid=(["'])${escapedId}\\1`).test(html);
}

function isAppStoreUrl(url) {
  return /^https:\/\/apps\.apple\.com\/.+id1147058670/.test(url);
}

function validateBestNextStepHref(entry, step, errors, warnings, byUrl, htmlCache) {
  const href = step.resolved.href;

  if (!href) {
    errors.push(`${entry.url}: Best Next Step "${step.title}" has an empty href`);
    return;
  }

  if (href.startsWith("#")) {
    if (!hasAnchor(routeFilePath(entry.url), href, htmlCache)) {
      errors.push(`${entry.url}: Best Next Step anchor ${href} does not exist on the source page`);
    }
    return;
  }

  if (/^https?:\/\//.test(href)) {
    if (!isAppStoreUrl(href)) {
      errors.push(`${entry.url}: Best Next Step external href must be an approved App Store URL: ${href}`);
    }

    if (step.type !== "app") {
      errors.push(`${entry.url}: Best Next Step external App Store href must use type "app"`);
    }

    if (step.resolved.appStoreFallback) {
      warnings.push(`${entry.url}: App Store step "${step.title}" falls back to the general App Store URL because the CPP mapping is missing`);
    }

    return;
  }

  if (!href.startsWith("/")) {
    errors.push(`${entry.url}: Best Next Step href must be internal, same-page anchor, or App Store URL: ${href}`);
    return;
  }

  const { pathname, hash } = splitHref(href);
  const normalizedPath = pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;

  if (normalizedPath === entry.url && !hash) {
    errors.push(`${entry.url}: Best Next Step must not link to itself unless it is a same-page anchor`);
  }

  const destination = byUrl.get(normalizedPath);
  if (!destination) {
    errors.push(`${entry.url}: Best Next Step references unknown internal URL ${normalizedPath}`);
    return;
  }

  const destinationFile = routeFilePath(normalizedPath);
  if (!fs.existsSync(destinationFile)) {
    errors.push(`${entry.url}: Best Next Step destination file does not exist for ${normalizedPath}`);
    return;
  }

  if (hash && !hasAnchor(destinationFile, hash, htmlCache)) {
    errors.push(`${entry.url}: Best Next Step destination anchor ${href} does not exist`);
  }
}

function validateBestNextSteps(entry, errors, warnings, byUrl, htmlCache, resolveBestNextSteps, cardTextSignatures, isStrategic) {
  const explicit = entry.bestNextSteps;

  if (explicit && explicit.enabled === false) {
    if (isMissing(explicit.skipReason)) {
      errors.push(`${entry.url}: disabled Best Next Step modules must include skipReason`);
    }
    return;
  }

  if (!explicit && !isStrategic) {
    warnings.push(`${entry.url}: no Best Next Step config yet; review before the page is considered complete`);
    return;
  }

  if (isStrategic && explicit && explicit.enabled === false) {
    errors.push(`${entry.url}: strategic pages must not disable Best Next Step`);
    return;
  }

  const resolved = resolveBestNextSteps(entry, byUrl);
  if (!resolved || !resolved.enabled) {
    errors.push(`${entry.url}: enabled Best Next Step did not resolve to a module`);
    return;
  }

  if (!resolved.heading || !resolved.intro) {
    errors.push(`${entry.url}: Best Next Step must include heading and intro`);
  }

  if (!Array.isArray(resolved.steps) || resolved.steps.length < 2 || resolved.steps.length > 4) {
    errors.push(`${entry.url}: Best Next Step must resolve to 2-4 cards`);
    return;
  }

  if (resolved.steps.length === 2) {
    warnings.push(`${entry.url}: Best Next Step has only 2 cards; confirm that is intentional`);
  }

  if (resolved.source !== "page") {
    warnings.push(`${entry.url}: Best Next Step uses ${resolved.source} fallback text; consider page-specific copy`);
  }

  for (const step of resolved.steps) {
    for (const field of ["label", "title", "description", "href", "type", "intent", "priority"]) {
      if (isMissing(step[field])) {
        errors.push(`${entry.url}: Best Next Step card is missing ${field}`);
      }
    }

    if (!bestNextStepTypes.has(step.type)) {
      errors.push(`${entry.url}: unsupported Best Next Step card type ${step.type}`);
    }

    if (!bestNextStepIntents.has(step.intent)) {
      errors.push(`${entry.url}: unsupported Best Next Step card intent ${step.intent}`);
    }

    const titleText = String(step.title || "").trim().toLowerCase();
    const labelText = String(step.label || "").trim().toLowerCase();
    if (vagueLinkText.has(titleText) || vagueLinkText.has(labelText)) {
      errors.push(`${entry.url}: Best Next Step card uses vague link text "${step.title || step.label}"`);
    }

    validateBestNextStepHref(entry, step, errors, warnings, byUrl, htmlCache);

    const signature = [
      String(step.label || "").trim().toLowerCase(),
      String(step.title || "").trim().toLowerCase(),
      String(step.description || "").trim().toLowerCase(),
      String(step.resolved.href || "").trim().toLowerCase(),
    ].join("|");

    if (!cardTextSignatures.has(signature)) {
      cardTextSignatures.set(signature, []);
    }
    cardTextSignatures.get(signature).push({ url: entry.url, cluster: entry.cluster });
  }
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
  const warnings = [];
  const htmlCache = new Map();
  const cardTextSignatures = new Map();
  const routeFiles = new Map();
  const { contentRegistry, appStoreCppUrls, bestNextStepStrategicUrls } = await import(pathToFileURL(registryPath).href);
  const { resolveBestNextSteps } = await import(pathToFileURL(bestNextStepComponentPath).href);
  const strategicUrls = new Set(bestNextStepStrategicUrls || []);

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

  collectIndexRoutes(rootDir, routeFiles);
  for (const [route] of routeFiles) {
    if (!byUrl.has(route)) {
      errors.push(`${route}: live route file does not have a registry entry`);
    }
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

    if (entry.status === "live") {
      validateBestNextSteps(
        entry,
        errors,
        warnings,
        byUrl,
        htmlCache,
        resolveBestNextSteps,
        cardTextSignatures,
        strategicUrls.has(entry.url)
      );
    }
  }

  for (const url of strategicUrls) {
    const entry = byUrl.get(url);
    if (!entry) {
      errors.push(`${url}: strategic Best Next Step URL is missing from registry`);
      continue;
    }

    if (entry.status !== "live") {
      errors.push(`${url}: strategic Best Next Step URL must be live`);
    }

    if (entry.bestNextSteps && entry.bestNextSteps.enabled === false) {
      errors.push(`${url}: strategic Best Next Step URL must not disable the module`);
    }

    const filePath = routeFilePath(url);
    if (fs.existsSync(filePath)) {
      const html = getHtml(filePath, htmlCache);
      if (!html.includes("<!-- best-next-step:start -->") || !html.includes("<!-- best-next-step:end -->")) {
        errors.push(`${url}: strategic page is missing Best Next Step marker comments`);
      }
    }
  }

  for (const [signature, usages] of cardTextSignatures) {
    if (!signature.trim()) continue;

    const clustersUsed = new Set(usages.map((usage) => usage.cluster));
    if (usages.length >= 3 && clustersUsed.size > 1) {
      errors.push(`Best Next Step card text is repeated across unrelated clusters: ${usages.map((usage) => usage.url).join(", ")}`);
    }
  }

  if (errors.length > 0) {
    console.error(`Content registry validation failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    if (warnings.length > 0) {
      console.error(`Warnings (${warnings.length}):`);
      for (const warning of warnings) console.error(`- ${warning}`);
    }
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn(`Content registry validation passed with ${warnings.length} warning(s):`);
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  console.log(`Content registry validation passed for ${contentRegistry.length} page(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
