#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const ignoredBodyClasses = new Set(["is-preload", "site-nav-page"]);
const commonStylesheets = new Set([
  "assets/css/main.css",
  "assets/css/noscript.css",
  "styles/site-nav.css",
  "styles/best-next-step.css",
]);

const requiredTokens = [
  ["page background", "#f4f6f8"],
  ["main background green wash", "radial-gradient(circle at top left, rgba(175, 230, 126, 0.16), transparent 30%)"],
  ["main background base gradient", "linear-gradient(180deg, #fbfdff 0%, #f4f6f8 76%)"],
  ["hero gradient", "linear-gradient(135deg, rgba(175, 230, 126, 0.22), rgba(255, 255, 255, 0.98) 48%, rgba(228, 238, 248, 0.92))"],
  ["heading color", "#18212b"],
  ["neutral eyebrow color", "rgba(33, 41, 49, 0.88)"],
  ["primary CTA lime", "#afe67e"],
  ["primary CTA hover lime", "#bcf18c"],
  ["standard border color", "rgba(15, 23, 42, 0.08)"],
  ["standard card shadow", "0 14px 36px rgba(15, 23, 42, 0.08)"],
  ["standard hero shadow", "0 18px 42px rgba(15, 23, 42, 0.08)"],
  ["standard visual-card shadow", "0 18px 38px rgba(15, 23, 42, 0.1)"],
  ["standard focus outline", "rgba(53, 84, 40, 0.32)"],
];

const forbiddenTokens = [
  ["legacy brown accent", /#6f4a25\b/i],
  ["legacy cream chip background", /#fff7ef\b/i],
  ["legacy warm cream gradient", /rgba\(\s*255,\s*248,\s*240\b/i],
  ["legacy brown border", /rgba\(\s*111,\s*74,\s*37\b/i],
  ["dark green primary CTA fill", /background\s*:\s*#355428\b/i],
  ["dark green primary CTA hover", /background\s*:\s*#273f1d\b/i],
];

function usage() {
  console.error("Usage: node scripts/audit-page-design.mjs /page-route/ [styles/page.css]");
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

function cssPathFromHref(href, htmlPath) {
  if (!href.endsWith(".css") || /^(https?:)?\/\//.test(href)) return null;
  const cleanHref = href.split("#")[0].split("?")[0];
  if (cleanHref.startsWith("/")) return path.join(rootDir, cleanHref);
  return path.resolve(path.dirname(htmlPath), cleanHref);
}

function routeToHtmlPath(route) {
  if (route === "/") return path.join(rootDir, "index.html");
  const normalized = route.startsWith("/") ? route : `/${route}`;
  return path.join(rootDir, normalized.replace(/^\/|\/$/g, ""), "index.html");
}

function bodyClassFromHtml(html) {
  const match = html.match(/<body\b[^>]*\bclass=(["'])(.*?)\1/i);
  if (!match) return null;
  const classes = match[2].split(/\s+/).filter(Boolean);
  return classes.find((className) => className.endsWith("-page") && !ignoredBodyClasses.has(className))
    || classes.find((className) => !ignoredBodyClasses.has(className))
    || null;
}

function normalizeRelative(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function preferredCssFiles(input, bodyClass, cssFiles) {
  const routeSlug = input
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean)
    .pop();
  const bodySlug = bodyClass ? bodyClass.replace(/-page$/, "") : null;
  const candidates = cssFiles.filter((cssPath) => !commonStylesheets.has(normalizeRelative(cssPath)));
  const preferred = candidates.filter((cssPath) => {
    const name = path.basename(cssPath, ".css");
    return (bodySlug && (name === bodySlug || name.includes(bodySlug)))
      || (routeSlug && (name === routeSlug || name.includes(routeSlug)));
  });

  return preferred.length > 0 ? preferred : candidates;
}

function readTarget(input) {
  if (input.endsWith(".css")) {
    const cssPath = path.resolve(rootDir, input);
    return {
      label: input,
      bodyClass: null,
      linkedCssFiles: [cssPath],
      auditCssFiles: [cssPath],
      cssText: fs.readFileSync(cssPath, "utf8"),
    };
  }

  const htmlPath = routeToHtmlPath(input);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`No route file found for ${input}: ${path.relative(rootDir, htmlPath)}`);
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const bodyClass = bodyClassFromHtml(html);
  const cssFiles = [];
  const linkPattern = /<link\b[^>]*\brel=(["'])stylesheet\1[^>]*\bhref=(["'])(.*?)\2|<link\b[^>]*\bhref=(["'])(.*?)\4[^>]*\brel=(["'])stylesheet\6/gi;
  let match;
  while ((match = linkPattern.exec(html))) {
    const href = match[3] || match[5];
    const cssPath = cssPathFromHref(href, htmlPath);
    if (cssPath && fs.existsSync(cssPath)) cssFiles.push(cssPath);
  }

  const auditCssFiles = preferredCssFiles(input, bodyClass, cssFiles);

  return {
    label: input,
    bodyClass,
    linkedCssFiles: cssFiles,
    auditCssFiles,
    cssText: auditCssFiles.map((cssPath) => fs.readFileSync(cssPath, "utf8")).join("\n\n"),
  };
}

function selectorHasRule(cssText, selector, rulePattern) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+");
  const blockPattern = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "i");
  const match = cssText.match(blockPattern);
  return Boolean(match && rulePattern.test(match[1]));
}

function auditTarget(target) {
  const errors = [];
  const warnings = [];
  const cssText = target.cssText;
  const compactCss = compact(cssText);

  if (target.auditCssFiles.length === 0) {
    errors.push("No local stylesheet links were found for this target.");
  }

  for (const [label, token] of requiredTokens) {
    if (!compactCss.includes(compact(token))) {
      errors.push(`Missing canonical ${label}: ${token}`);
    }
  }

  for (const [label, pattern] of forbiddenTokens) {
    if (pattern.test(cssText)) {
      errors.push(`Uses forbidden ${label}.`);
    }
  }

  if (target.bodyClass) {
    const bodySelector = `body.${target.bodyClass}`;
    const shellChecks = [
      [`${bodySelector} #header`, /display\s*:\s*none\s*!important/i, "legacy #header must be hidden"],
      [`${bodySelector} #wrapper > .bg`, /display\s*:\s*none\s*!important/i, "legacy wrapper background must be hidden"],
      [`${bodySelector} #wrapper.fade-in:before`, /background\s*:\s*#f4f6f8/i, "fade-in overlay must use modern background"],
      [`${bodySelector} #main`, /background\s*:/i, "main must define modern full-page background"],
    ];

    for (const [selector, rulePattern, message] of shellChecks) {
      if (!selectorHasRule(cssText, selector, rulePattern)) {
        errors.push(`${message} (${selector}).`);
      }
    }

    if (!new RegExp(`body\\.${target.bodyClass}\\s+#nav,\\s*body\\.${target.bodyClass}\\s+#main`, "i").test(cssText)) {
      warnings.push("Could not find the grouped full-width #nav/#main shell selector for this body class.");
    }
  } else {
    warnings.push("CSS-file mode skips body-class shell checks. Pass a route such as /privacy-and-data/ for the full audit.");
  }

  return { errors, warnings };
}

function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    usage();
    process.exit(2);
  }

  let hasErrors = false;
  for (const input of inputs) {
    const target = readTarget(input);
    const { errors, warnings } = auditTarget(target);
    hasErrors ||= errors.length > 0;

    console.log(`Page design audit: ${target.label}`);
    if (target.bodyClass) console.log(`Body class: ${target.bodyClass}`);
    console.log(`Audited stylesheets: ${target.auditCssFiles.map((cssPath) => normalizeRelative(cssPath)).join(", ") || "none"}`);

    if (errors.length === 0) {
      console.log("Hard errors: 0");
    } else {
      console.log(`Hard errors: ${errors.length}`);
      for (const error of errors) console.log(`- ${error}`);
    }

    if (warnings.length > 0) {
      console.log(`Warnings: ${warnings.length}`);
      for (const warning of warnings) console.log(`- ${warning}`);
    }
  }

  process.exit(hasErrors ? 1 : 0);
}

main();
