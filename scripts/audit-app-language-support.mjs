#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  classifyRoute,
  htmlPathToRoute,
  normalizeRoute,
} from "./app-language-support-scope.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const languageSupport = require("./app-language-support.js");

const STYLE_HREF = "/styles/app-language-support.css";
const SCRIPT_SRC = "/scripts/app-language-support.js";
const ANCHOR_ATTRIBUTE = "data-app-language-support-anchor";
const RENDERED_ATTRIBUTE = "data-app-language-support-rendered";
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr",
]);
const KNOWN_PPID_VALUES = new Set([
  "0ad25f49-9026-4d8b-99ea-9581a98702db",
  "7f9074ac-4090-4e07-aebe-c5722e76eedc",
  "8e720a01-7489-4044-9f6a-0080793442a0",
  "bc366b6c-90ff-4cde-9ae7-d420c6512e7a",
  "18039f2b-da9e-4d5f-9ba1-b60f117ecf12",
  "794c6086-e032-4408-ab2f-acb4ad23ec98",
  "15af0298-82ca-4a0e-8230-d12774916992",
  "07350272-1b8a-4f9f-a267-dc72c33b4404",
  "d333ba53-318b-44d7-ad07-f29841091043",
  "d845bed2-b88d-47a2-854a-9aa0c35eb049",
]);

function countMatches(text, pattern) {
  return Array.from(text.matchAll(pattern)).length;
}

function openAncestorsAt(html, position) {
  const stack = [];
  const tagPattern = /<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(html)) && match.index < position) {
    const markup = match[0];
    const tagName = match[1].toLowerCase();

    if (markup.startsWith("</")) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tagName === tagName) {
          stack.splice(index);
          break;
        }
      }
      continue;
    }

    if (!markup.endsWith("/>") && !VOID_ELEMENTS.has(tagName)) {
      stack.push({ tagName, markup });
    }
  }

  return stack;
}

function isUnsafePlacementAncestor(ancestor) {
  if (ancestor.tagName === "nav") return true;

  const id = ancestor.markup.match(/\bid=(['"])(.*?)\1/i)?.[2] || "";
  const className = ancestor.markup.match(/\bclass=(['"])(.*?)\1/i)?.[2] || "";
  return id.toLowerCase() === "nav" || /sticky/i.test(`${id} ${className}`);
}

function hasRelevantConversionMarkup(markup) {
  return /https:\/\/apps\.apple\.com\//i.test(markup)
    || /\bclass=(['"])[^'"]*(?:cta|app|product|download|action)[^'"]*\1/i.test(markup)
    || /\bhref=(['"])\/(?:features|solutions)\/[^'"]*\1/i.test(markup);
}

function listIndexHtmlFiles(directory = rootDir) {
  const results = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...listIndexHtmlFiles(absolutePath));
    } else if (entry.isFile() && entry.name === "index.html") {
      results.push(absolutePath);
    }
  }

  return results.sort();
}

function softwareApplicationLanguages(homepageHtml) {
  const blocks = Array.from(
    homepageHtml.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => JSON.parse(match[1]),
  );

  for (const block of blocks) {
    const nodes = Array.isArray(block?.["@graph"]) ? block["@graph"] : [block];
    const softwareApplication = nodes.find((node) => {
      const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
      return types.includes("SoftwareApplication");
    });
    if (softwareApplication) return softwareApplication.inLanguage || [];
  }

  return [];
}

function validateAppStoreLinks(html, route) {
  const errors = [];
  const hrefs = Array.from(
    html.matchAll(/<a\b[^>]*\bhref=(["'])(https:\/\/apps\.apple\.com\/[^"']+)\1/gi),
    (match) => match[2].replaceAll("&amp;", "&"),
  );

  for (const href of hrefs) {
    let url;
    try {
      url = new URL(href);
    } catch {
      errors.push(`${route}: invalid App Store URL: ${href}`);
      continue;
    }

    if (!url.pathname.includes("id1147058670")) {
      errors.push(`${route}: App Store URL does not retain the You Owe Me app ID: ${href}`);
    }

    const ppid = url.searchParams.get("ppid");
    if (ppid && !KNOWN_PPID_VALUES.has(ppid)) {
      errors.push(`${route}: unknown App Store Custom Product Page identifier: ${ppid}`);
    }
  }

  return errors;
}

export function auditHtmlForRoute(route, html) {
  const normalizedRoute = normalizeRoute(route);
  const classification = classifyRoute(normalizedRoute);
  const errors = [];
  const styleCount = countMatches(html, new RegExp(`<link\\b[^>]*\\bhref=["']${STYLE_HREF.replaceAll("/", "\\/")}["']`, "gi"));
  const scriptCount = countMatches(html, new RegExp(`<script\\b[^>]*\\bsrc=["']${SCRIPT_SRC.replaceAll("/", "\\/")}["'][^>]*>`, "gi"));
  const anchorCount = countMatches(html, new RegExp(`\\b${ANCHOR_ATTRIBUTE}(?:\\s|=|>)`, "gi"));
  const authoredRenderTargetCount = countMatches(html, new RegExp(`\\b${RENDERED_ATTRIBUTE}(?:\\s|=|>)`, "gi"));

  if (classification === "included") {
    if (styleCount !== 1) errors.push(`${normalizedRoute}: expected one ${STYLE_HREF} link, found ${styleCount}`);
    if (scriptCount !== 1) errors.push(`${normalizedRoute}: expected one ${SCRIPT_SRC} script, found ${scriptCount}`);
    if (anchorCount !== 1) errors.push(`${normalizedRoute}: expected one language-support anchor, found ${anchorCount}`);

    const mainPosition = html.search(/<(?:div|main)\b[^>]*\bid=["']main["']/i);
    const anchorPosition = html.search(new RegExp(`\\b${ANCHOR_ATTRIBUTE}(?:\\s|=|>)`, "i"));
    const copyrightPosition = html.search(/<div\b[^>]*\bid=["']copyright["']/i);
    if (anchorPosition !== -1 && mainPosition !== -1 && anchorPosition < mainPosition) {
      errors.push(`${normalizedRoute}: language-support anchor appears before the main content`);
    }
    if (anchorPosition !== -1 && copyrightPosition !== -1 && anchorPosition > copyrightPosition) {
      errors.push(`${normalizedRoute}: language-support anchor appears in or after the footer`);
    }
    if (anchorPosition !== -1 && openAncestorsAt(html, anchorPosition).some(isUnsafePlacementAncestor)) {
      errors.push(`${normalizedRoute}: language-support anchor appears inside navigation or sticky UI`);
    }
    if (!new RegExp(`<div\\s+${ANCHOR_ATTRIBUTE}\\s+hidden><\\/div>`, "i").test(html)) {
      errors.push(`${normalizedRoute}: anchor must use the no-JavaScript-safe hidden slot markup`);
    }
    if (anchorPosition !== -1) {
      const nearbyMarkup = html.slice(Math.max(0, anchorPosition - 2600), anchorPosition + 2600);
      if (!hasRelevantConversionMarkup(nearbyMarkup)) {
        errors.push(`${normalizedRoute}: no relevant CTA or product conversion group was found near the language-support anchor`);
      }
    }
    if (authoredRenderTargetCount !== 0) {
      errors.push(`${normalizedRoute}: rendered targets must be created only by the shared component`);
    }
    if (!/<html\b[^>]*\blang=["']en["']/i.test(html)) {
      errors.push(`${normalizedRoute}: the document language must remain English`);
    }
    if (!fs.existsSync(path.join(rootDir, STYLE_HREF.slice(1)))) {
      errors.push(`${normalizedRoute}: shared stylesheet does not exist at ${STYLE_HREF}`);
    }
    if (!fs.existsSync(path.join(rootDir, SCRIPT_SRC.slice(1)))) {
      errors.push(`${normalizedRoute}: shared script does not exist at ${SCRIPT_SRC}`);
    }
  } else if (classification === "excluded") {
    if (styleCount !== 0) errors.push(`${normalizedRoute}: excluded route includes the language-support stylesheet`);
    if (scriptCount !== 0) errors.push(`${normalizedRoute}: excluded route includes the language-support script`);
    if (anchorCount !== 0) errors.push(`${normalizedRoute}: excluded route contains a language-support anchor`);
  } else {
    errors.push(`${normalizedRoute}: route is not classified as included or excluded`);
  }

  errors.push(...validateAppStoreLinks(html, normalizedRoute));
  return errors;
}

export function auditRoute(route) {
  const normalizedRoute = normalizeRoute(route);
  const relativePath = normalizedRoute === "/"
    ? "index.html"
    : `${normalizedRoute.replace(/^\//, "")}index.html`;
  const htmlPath = path.join(rootDir, relativePath);
  if (!fs.existsSync(htmlPath)) return [`${normalizedRoute}: route file does not exist`];
  return auditHtmlForRoute(normalizedRoute, fs.readFileSync(htmlPath, "utf8"));
}

export function auditWholeSite() {
  const errors = [];
  const files = listIndexHtmlFiles();
  const counts = { included: 0, excluded: 0, unclassified: 0 };

  for (const absolutePath of files) {
    const relativePath = path.relative(rootDir, absolutePath);
    const route = htmlPathToRoute(relativePath);
    counts[classifyRoute(route)] += 1;
    errors.push(...auditHtmlForRoute(route, fs.readFileSync(absolutePath, "utf8")));
  }

  const runtimeLocales = [...languageSupport.SUPPORTED_APP_LOCALES].sort();
  if (new Set(runtimeLocales).size !== runtimeLocales.length) {
    errors.push("Locale drift: the runtime locale list contains duplicates");
  }
  const homepageLocales = [...softwareApplicationLanguages(fs.readFileSync(path.join(rootDir, "index.html"), "utf8"))].sort();
  if (JSON.stringify(runtimeLocales) !== JSON.stringify(homepageLocales)) {
    errors.push(`Locale drift: runtime=${runtimeLocales.join(",")} homepage=${homepageLocales.join(",")}`);
  }

  const translatedLocales = Object.keys(languageSupport.MESSAGES).sort();
  const expectedTranslations = runtimeLocales.filter((locale) => locale !== "en").sort();
  if (JSON.stringify(translatedLocales) !== JSON.stringify(expectedTranslations)) {
    errors.push(`Translation drift: expected=${expectedTranslations.join(",")} actual=${translatedLocales.join(",")}`);
  }

  for (const [locale, message] of Object.entries(languageSupport.MESSAGES)) {
    if (!new Set(["ltr", "rtl"]).has(message.direction)) {
      errors.push(`${locale}: invalid direction metadata ${message.direction}`);
    } else if (locale === "ar" && message.direction !== "rtl") {
      errors.push("Arabic translation must declare rtl direction");
    } else if (locale !== "ar" && message.direction !== "ltr") {
      errors.push(`${locale}: non-Arabic translation must declare ltr direction`);
    }
  }

  return { counts, errors, files };
}

function main() {
  const { counts, errors } = auditWholeSite();
  console.log(`App language support audit: ${counts.included} included, ${counts.excluded} excluded, ${counts.unclassified} unclassified`);

  if (errors.length > 0) {
    console.error(`Hard errors: ${errors.length}`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("Hard errors: 0");
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
