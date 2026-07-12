#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { contentRegistry } from "../content/content-registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://you-owe-me.com";
const excludedRouteDirs = new Set([".git", ".agents", ".codex", "assets", "downloads", "images", "styles", "scripts"]);
const oldAppStoreSlug = "https://apps.apple.com/app/you-owe-me-short-term-loans/id1147058670?l=en";
const registryOptionalNoindexRoutes = new Set(["/connect/"]);

const requiredRobotPolicies = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "*",
];

const strategicTruths = [
  "money between people",
  "between real people",
  "one running balance",
  "running balance",
  "clear record",
  "clear records",
  "repayment history",
  "partial repayment",
  "partial repayments",
  "memory",
  "clarity",
  "not a lender",
  "does not lend",
  "does not need to install",
  "one person can keep",
];

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

    if (name === "index.html") routes.set(routeFromIndexPath(filePath), filePath);
  }
}

function decodeHtml(value) {
  const named = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    rsquo: "'",
    lsquo: "'",
    ldquo: '"',
    rdquo: '"',
    ndash: "-",
    mdash: "-",
    hellip: "...",
    middot: ".",
    euro: "euro",
    pound: "pound",
  };

  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith("#x")) return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith("#")) return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return Object.prototype.hasOwnProperty.call(named, lower) ? named[lower] : match;
  });
}

function normalizeText(value) {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return normalizeText(body.replace(/<noscript[\s\S]*?<\/noscript>/gi, " "));
}

function crawlableText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return normalizeText(body);
}

function extractCanonical(html) {
  return html.match(/<link\b[^>]*\brel=(["'])canonical\1[^>]*\bhref=(["'])(.*?)\2/i)?.[3]
    || html.match(/<link\b[^>]*\bhref=(["'])(.*?)\1[^>]*\brel=(["'])canonical\3/i)?.[2]
    || "";
}

function extractMetaRobots(html) {
  return html.match(/<meta\b[^>]*\bname=(["'])robots\1[^>]*\bcontent=(["'])(.*?)\2/i)?.[3]
    || html.match(/<meta\b[^>]*\bcontent=(["'])(.*?)\1[^>]*\bname=(["'])robots\3/i)?.[2]
    || "";
}

function isNoindex(html) {
  return extractMetaRobots(html).toLowerCase().split(",").map((item) => item.trim()).includes("noindex");
}

function isIndexFollow(html) {
  const robots = extractMetaRobots(html).toLowerCase();
  return robots.includes("index") && robots.includes("follow") && !robots.includes("noindex");
}

function extractDateStrings(html, pattern) {
  const dates = [];
  let match;
  while ((match = pattern.exec(html))) {
    dates.push(match[2] || match[1]);
  }
  return dates;
}

function pageModifiedDates(html) {
  return {
    structured: extractDateStrings(html, /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g),
    visible: extractDateStrings(html, /<time\b[^>]*datetime=(["'])(\d{4}-\d{2}-\d{2})\1/gi),
  };
}

function deriveLastmod(entry, html) {
  const dates = [...pageModifiedDates(html).structured, ...pageModifiedDates(html).visible];
  if (dates.length > 0) return dates.sort().at(-1);
  return entry.updated;
}

function extractH1Count(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

function extractDescription(html) {
  return html.match(/<meta\b[^>]*\bname=(["'])description\1[^>]*\bcontent=(["'])(.*?)\2/i)?.[3]
    || html.match(/<meta\b[^>]*\bcontent=(["'])(.*?)\1[^>]*\bname=(["'])description\3/i)?.[2]
    || "";
}

function extractJsonLd(html) {
  const blocks = [];
  const pattern = /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    blocks.push(decodeHtml(match[2]).trim());
  }
  return blocks;
}

function flattenJsonLd(node, list = []) {
  if (!node) return list;
  if (Array.isArray(node)) {
    for (const item of node) flattenJsonLd(item, list);
    return list;
  }
  if (typeof node !== "object") return list;
  list.push(node);
  if (Array.isArray(node["@graph"])) flattenJsonLd(node["@graph"], list);
  return list;
}

function nodeTypes(node) {
  return Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]].filter(Boolean);
}

function parseSitemap() {
  const sitemapPath = path.join(rootDir, "sitemap.xml");
  const xml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
  const urls = new Map();
  const pattern = /<url>\s*<loc>https:\/\/you-owe-me\.com([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
  let match;
  while ((match = pattern.exec(xml))) {
    const url = match[1] === "" ? "/" : match[1];
    urls.set(url, match[2]);
  }
  return urls;
}

function parseRobots() {
  const robotsPath = path.join(rootDir, "robots.txt");
  const text = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8") : "";
  const groups = new Map();
  let currentAgents = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) {
      currentAgents = [];
      continue;
    }

    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim();

    if (key === "user-agent") {
      currentAgents.push(value);
      if (!groups.has(value)) groups.set(value, []);
      continue;
    }

    for (const agent of currentAgents) {
      groups.get(agent).push({ key, value });
    }
  }

  return { text, groups };
}

function robotGroupAllowsRoot(groups, agent) {
  const rules = groups.get(agent) || [];
  const disallowsRoot = rules.some((rule) => rule.key === "disallow" && rule.value === "/");
  const allowsRoot = rules.some((rule) => rule.key === "allow" && rule.value === "/");
  return allowsRoot && !disallowsRoot;
}

function add(list, message) {
  list.push(message);
}

function auditFaqVisibility(url, html, jsonLdNodes, warnings) {
  const text = visibleText(html);
  const faqNodes = jsonLdNodes.filter((node) => nodeTypes(node).includes("FAQPage"));

  for (const faq of faqNodes) {
    const entities = Array.isArray(faq.mainEntity) ? faq.mainEntity : [];
    for (const entity of entities) {
      const question = entity.name || "";
      const answer = Array.isArray(entity.acceptedAnswer)
        ? entity.acceptedAnswer[0]?.text
        : entity.acceptedAnswer?.text;
      const normalizedQuestion = normalizeText(question);
      const normalizedAnswer = normalizeText(answer || "");
      const answerProbe = normalizedAnswer.slice(0, Math.min(90, normalizedAnswer.length));

      if (normalizedQuestion && !text.includes(normalizedQuestion)) {
        add(warnings, `${url}: FAQ schema question is not visible text: "${question}"`);
      }
      if (answerProbe.length > 30 && !text.includes(answerProbe)) {
        add(warnings, `${url}: FAQ schema answer may not match visible text for "${question}"`);
      }
    }
  }
}

function auditToolFallback(entry, html, warnings) {
  if (entry.pageType !== "tool") return;
  const hasDynamicOutput = /\bdata-(result|summary|output|timeline|copy)|aria-live=| hidden\b/i.test(html);
  if (!hasDynamicOutput) return;

  const crawlable = crawlableText(html);
  const hasNoscriptExample = /<noscript[\s\S]{120,}?<\/noscript>/i.test(html);
  const hasVisibleExample = /example (result|calculation|plan|messages|output|summary)|worked example|final result|result:|copy a repayment reminder text|template library|what the copied summary can look like|static example/i.test(crawlable);

  if (!hasNoscriptExample && !hasVisibleExample) {
    add(warnings, `${entry.url}: dynamic tool output has no obvious crawlable example or noscript fallback`);
  }
}

function auditExtractability(entry, html, warnings) {
  if (!["core", "high"].includes(entry.priority)) return;
  if (!["home", "hub", "solution", "tool", "guide", "compare", "feature", "reviews", "quick-start"].includes(entry.pageType)) return;

  const text = visibleText(html);
  const truthCount = strategicTruths.filter((truth) => text.includes(truth)).length;
  if (truthCount === 0) {
    add(warnings, `${entry.url}: visible text does not clearly reinforce the money-between-people positioning truths`);
  }

  if (entry.problemSolved) {
    const problemWords = normalizeText(entry.problemSolved)
      .split(" ")
      .filter((word) => word.length > 5)
      .slice(0, 8);
    const matchedWords = problemWords.filter((word) => text.includes(word)).length;
    if (problemWords.length >= 4 && matchedWords < 2) {
      add(warnings, `${entry.url}: visible text may not clearly match registry problemSolved`);
    }
  }
}

function main() {
  const errors = [];
  const warnings = [];
  const routeFiles = new Map();
  const byUrl = new Map(contentRegistry.map((entry) => [entry.url, entry]));
  const sitemap = parseSitemap();
  const robots = parseRobots();

  collectIndexRoutes(rootDir, routeFiles);

  for (const agent of requiredRobotPolicies) {
    if (!robotGroupAllowsRoot(robots.groups, agent)) {
      add(errors, `robots.txt: ${agent} must be explicitly allowed for the current AI/search access policy`);
    }
  }

  if (!/Sitemap:\s*https:\/\/you-owe-me\.com\/sitemap\.xml/i.test(robots.text)) {
    add(errors, "robots.txt: missing sitemap declaration");
  }

  for (const [route, filePath] of routeFiles) {
    const html = fs.readFileSync(filePath, "utf8");
    const isAllowedRegistryOmission = registryOptionalNoindexRoutes.has(route)
      && isNoindex(html);
    if (!byUrl.has(route) && !isAllowedRegistryOmission) {
      add(errors, `${route}: route file is missing from content registry`);
    }
  }

  for (const entry of contentRegistry) {
    if (entry.status !== "live") continue;

    const filePath = routeFilePath(entry.url);
    if (!fs.existsSync(filePath)) {
      add(errors, `${entry.url}: live registry entry points to a missing route file`);
      continue;
    }

    const html = fs.readFileSync(filePath, "utf8");
    const noindex = isNoindex(html);
    const canonical = extractCanonical(html);
    const expectedCanonical = `${siteOrigin}${entry.url}`;
    const inSitemap = sitemap.has(entry.url);

    if (entry.priority !== "low" && noindex) {
      add(errors, `${entry.url}: important live page is noindex`);
    }

    if (!noindex && canonical !== expectedCanonical) {
      add(errors, `${entry.url}: canonical should be ${expectedCanonical}, got ${canonical || "(missing)"}`);
    }

    if (!noindex && !isIndexFollow(html)) {
      add(warnings, `${entry.url}: indexable page should declare index, follow`);
    }

    if (noindex && inSitemap) {
      add(errors, `${entry.url}: noindex page is present in sitemap.xml`);
    }

    if (!noindex && !inSitemap && entry.priority !== "low") {
      add(errors, `${entry.url}: indexable non-low-priority page is missing from sitemap.xml`);
    } else if (!noindex && !inSitemap) {
      add(warnings, `${entry.url}: indexable low-priority page is missing from sitemap.xml`);
    }

    const expectedLastmod = deriveLastmod(entry, html);
    if (!noindex && inSitemap && sitemap.get(entry.url) !== expectedLastmod) {
      add(errors, `${entry.url}: sitemap lastmod ${sitemap.get(entry.url)} does not match page modified date ${expectedLastmod}`);
    }

    if (extractH1Count(html) !== 1 && !noindex) {
      add(errors, `${entry.url}: indexable page should have exactly one H1`);
    }

    if (!extractDescription(html) && !noindex) {
      add(errors, `${entry.url}: indexable page is missing meta description`);
    }

    const jsonBlocks = extractJsonLd(html);
    const jsonLdNodes = [];
    for (const block of jsonBlocks) {
      try {
        jsonLdNodes.push(...flattenJsonLd(JSON.parse(block)));
      } catch (error) {
        add(errors, `${entry.url}: JSON-LD parse error: ${error.message}`);
      }
    }

    if (!noindex && jsonBlocks.length === 0) {
      add(warnings, `${entry.url}: indexable page has no JSON-LD structured data`);
    }

    const modifiedDates = pageModifiedDates(html);
    const structuredModified = modifiedDates.structured.sort().at(-1);
    const visibleModified = modifiedDates.visible.sort().at(-1);
    if (structuredModified && visibleModified && structuredModified !== visibleModified) {
      add(warnings, `${entry.url}: JSON-LD dateModified ${structuredModified} does not match visible updated date ${visibleModified}`);
    }

    auditFaqVisibility(entry.url, html, jsonLdNodes, warnings);
    auditToolFallback(entry, html, warnings);
    auditExtractability(entry, html, warnings);

    if (html.includes(oldAppStoreSlug)) {
      add(warnings, `${entry.url}: uses old App Store slug "you-owe-me-short-term-loans"; preserve CPPs but prefer the current general App Store URL for non-CPP links`);
    }

    const genericAppLabels = (html.match(/aria-label=(["'])Download You Owe Me on the App Store\1/g) || []).length;
    if (genericAppLabels > 0 && ["solution", "tool", "guide", "compare"].includes(entry.pageType)) {
      add(warnings, `${entry.url}: ${genericAppLabels} App Store CTA label(s) are generic; situation-specific labels are stronger for agents and accessibility`);
    }
  }

  for (const [url] of sitemap) {
    const entry = byUrl.get(url);
    if (!entry) {
      add(errors, `${url}: sitemap URL is missing from content registry`);
      continue;
    }
    if (!routeFiles.has(url)) {
      add(errors, `${url}: sitemap URL points to a missing route file`);
    }
  }

  console.log("Technical SEO and AI hygiene audit");
  console.log(`Route files: ${routeFiles.size}`);
  console.log(`Registry entries: ${contentRegistry.length}`);
  console.log(`Sitemap URLs: ${sitemap.size}`);
  console.log(`Hard errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.error("\nHard errors:");
    for (const error of errors) console.error(`- ${error}`);
  }

  if (warnings.length > 0) {
    console.warn("\nWarnings:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (errors.length > 0) process.exit(1);
}

main();
