#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { contentRegistry } from "../content/content-registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://you-owe-me.com";
const sitemapPath = path.join(rootDir, "sitemap.xml");

function routeFilePath(url) {
  if (url === "/") return path.join(rootDir, "index.html");
  return path.join(rootDir, url.slice(1), "index.html");
}

function extractMetaRobots(html) {
  const match = html.match(/<meta\b[^>]*\bname=(["'])robots\1[^>]*\bcontent=(["'])(.*?)\2/i)
    || html.match(/<meta\b[^>]*\bcontent=(["'])(.*?)\1[^>]*\bname=(["'])robots\3/i);
  return match ? (match[3] || match[2] || "").toLowerCase() : "";
}

function isNoindex(html) {
  return extractMetaRobots(html).split(",").map((item) => item.trim()).includes("noindex");
}

function extractDateStrings(html) {
  const dates = [];
  const patterns = [
    /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g,
    /<time\b[^>]*datetime=(["'])(\d{4}-\d{2}-\d{2})\1/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) {
      dates.push(match[2] || match[1]);
    }
  }

  return dates;
}

function deriveLastmod(entry, html) {
  const dates = extractDateStrings(html);
  if (dates.length > 0) return dates.sort().at(-1);
  return entry.updated;
}

function sitemapPriority(entry) {
  if (entry.url === "/") return "1.0";
  if (entry.url === "/find/") return "0.92";
  if (["hub", "feature", "reviews"].includes(entry.pageType)) return "0.9";
  if (entry.pageType === "quick-start") return "0.86";
  if (entry.pageType === "tool") return "0.88";
  if (entry.pageType === "solution") return "0.85";
  if (["guide", "compare"].includes(entry.pageType)) return entry.priority === "medium" ? "0.72" : "0.8";
  if (entry.pageType === "legal") return "0.4";
  return entry.priority === "low" ? "0.3" : "0.7";
}

function changefreq(entry) {
  if (entry.pageType === "legal") return "yearly";
  if (["guide", "compare"].includes(entry.pageType) && entry.url !== "/compare/") return "monthly";
  return "weekly";
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function assertIsoDate(date, url) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${url}: updated must be YYYY-MM-DD for sitemap lastmod, got "${date}"`);
  }
}

function main() {
  const urls = [];

  for (const entry of contentRegistry) {
    if (entry.status !== "live") continue;

    const filePath = routeFilePath(entry.url);
    if (!fs.existsSync(filePath)) {
      throw new Error(`${entry.url}: live registry entry points to a missing route file`);
    }

    const html = fs.readFileSync(filePath, "utf8");
    if (isNoindex(html)) continue;

    const lastmod = deriveLastmod(entry, html);
    assertIsoDate(lastmod, entry.url);

    urls.push({
      loc: `${siteOrigin}${entry.url}`,
      lastmod,
      changefreq: changefreq(entry),
      priority: sitemapPriority(entry),
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.flatMap((url) => [
      "  <url>",
      `    <loc>${escapeXml(url.loc)}</loc>`,
      `    <lastmod>${url.lastmod}</lastmod>`,
      `    <changefreq>${url.changefreq}</changefreq>`,
      `    <priority>${url.priority}</priority>`,
      "  </url>",
    ]),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(sitemapPath, xml);
  console.log(`Sitemap built with ${urls.length} indexable URL(s).`);
}

main();
