import {
  appStoreCppUrls,
  bestNextStepClusterDefaults,
  bestNextStepPageTypeDefaults,
} from "../content/content-registry.mjs";

const appStorePrefix = "app-store:";

export function getPageSlug(url) {
  if (url === "/") return "home";
  return url.replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9]+/g, "_");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function mergeConfig(template, override) {
  if (!template) return override ? { ...override } : null;
  if (!override) return { ...template };

  return {
    ...template,
    ...override,
    steps: Array.isArray(override.steps) && override.steps.length > 0 ? override.steps : template.steps,
  };
}

function getTemplateForEntry(entry) {
  return bestNextStepClusterDefaults[entry.cluster] || bestNextStepPageTypeDefaults[entry.pageType] || null;
}

function sortSteps(steps) {
  return [...steps].sort((a, b) => {
    const left = Number.isFinite(Number(a.priority)) ? Number(a.priority) : 999;
    const right = Number.isFinite(Number(b.priority)) ? Number(b.priority) : 999;
    return left - right;
  });
}

function resolveAppStoreHref(entry, href) {
  const requestedKey = href.slice(appStorePrefix.length);
  const cppKey = requestedKey === "self" ? entry.appStoreCpp : requestedKey;
  const resolvedUrl = appStoreCppUrls[cppKey] || appStoreCppUrls.general;

  return {
    href: resolvedUrl,
    destinationKey: `app-store:${cppKey || "general"}`,
    destinationCluster: "app-store",
    appStoreCpp: cppKey || "general",
    appStoreFallback: !appStoreCppUrls[cppKey],
  };
}

function normalizeInternalHref(href) {
  if (href === "/") return href;
  if (href.startsWith("#")) return href;
  const [path, hash] = href.split("#");
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  return hash ? `${normalizedPath}#${hash}` : normalizedPath;
}

function resolveStepHref(entry, step, byUrl = new Map()) {
  const href = String(step.href || "").trim();

  if (href.startsWith(appStorePrefix)) {
    return resolveAppStoreHref(entry, href);
  }

  if (href.startsWith("#")) {
    return {
      href,
      destinationKey: `${entry.url}${href}`,
      destinationCluster: entry.cluster,
      appStoreCpp: null,
      appStoreFallback: false,
    };
  }

  const normalizedHref = normalizeInternalHref(href);
  const destination = byUrl.get(normalizedHref);

  return {
    href: normalizedHref,
    destinationKey: normalizedHref,
    destinationCluster: destination ? destination.cluster : "unknown",
    appStoreCpp: null,
    appStoreFallback: false,
  };
}

export function resolveBestNextSteps(entry, byUrl = new Map()) {
  if (!entry || entry.status !== "live") return null;

  const override = entry.bestNextSteps;
  if (override && override.enabled === false) {
    return {
      enabled: false,
      source: "disabled",
      skipReason: override.skipReason || null,
    };
  }

  const template = getTemplateForEntry(entry);
  const merged = mergeConfig(template, override);
  if (!merged || merged.enabled === false) return null;

  const steps = Array.isArray(merged.steps) ? sortSteps(merged.steps) : [];
  if (steps.length === 0) return null;

  const source = override && Array.isArray(override.steps) && override.steps.length > 0
    ? "page"
    : bestNextStepClusterDefaults[entry.cluster]
      ? "cluster"
      : "pageType";

  return {
    enabled: true,
    source,
    variant: merged.variant || entry.pageType,
    placement: merged.placement || "after-direct-answer",
    template: merged.template || "custom",
    heading: merged.heading,
    intro: merged.intro,
    eyebrow: merged.eyebrow || (merged.variant === "hub" ? "Choose your starting point" : "Best next step"),
    steps: steps.map((step, index) => ({
      ...step,
      position: index + 1,
      resolved: resolveStepHref(entry, step, byUrl),
    })),
  };
}

export function renderBestNextStep(entry, byUrl = new Map()) {
  const resolved = resolveBestNextSteps(entry, byUrl);
  if (!resolved || !resolved.enabled) return "";

  const sourcePage = getPageSlug(entry.url);
  const titleId = `best-next-step-${sourcePage}-title`;
  const sectionClasses = [
    "best-next-step",
    `best-next-step--${resolved.variant}`,
    `best-next-step--${resolved.template}`,
  ].join(" ");

  const cards = resolved.steps.map((step) => {
    const destination = step.resolved.destinationKey;
    const destinationCluster = step.resolved.destinationCluster;
    const trackLocation = `${sourcePage}_best_next_step_${step.position}`;

    return [
      `    <a class="best-next-step__card" href="${escapeAttr(step.resolved.href)}" data-module="best-next-step" data-track-event="best_next_step_click" data-track-location="${escapeAttr(trackLocation)}" data-source-page="${escapeAttr(sourcePage)}" data-source-cluster="${escapeAttr(entry.cluster)}" data-destination-cluster="${escapeAttr(destinationCluster)}" data-step-type="${escapeAttr(step.type)}" data-step-intent="${escapeAttr(step.intent)}" data-step-destination="${escapeAttr(destination)}" data-step-position="${escapeAttr(step.position)}" data-module-variant="${escapeAttr(resolved.variant)}" data-module-template="${escapeAttr(resolved.template)}"${step.analyticsId ? ` data-step-analytics-id="${escapeAttr(step.analyticsId)}"` : ""}>`,
      `      <span class="best-next-step__label">${escapeHtml(step.label)}</span>`,
      `      <strong>${escapeHtml(step.title)}</strong>`,
      `      <span>${escapeHtml(step.description)}</span>`,
      "    </a>",
    ].join("\n");
  }).join("\n");

  return [
    `<section class="${escapeAttr(sectionClasses)}" aria-labelledby="${escapeAttr(titleId)}" data-module="best-next-step" data-source-page="${escapeAttr(sourcePage)}" data-source-cluster="${escapeAttr(entry.cluster)}" data-module-variant="${escapeAttr(resolved.variant)}" data-module-template="${escapeAttr(resolved.template)}">`,
    `  <p class="best-next-step__eyebrow">${escapeHtml(resolved.eyebrow)}</p>`,
    `  <h2 id="${escapeAttr(titleId)}">${escapeHtml(resolved.heading)}</h2>`,
    `  <p class="best-next-step__intro">${escapeHtml(resolved.intro)}</p>`,
    "  <div class=\"best-next-step__grid\">",
    cards,
    "  </div>",
    "</section>",
  ].join("\n");
}

export function inspectBestNextStep(entry, byUrl = new Map()) {
  const resolved = resolveBestNextSteps(entry, byUrl);
  if (!resolved || !resolved.enabled) return resolved;

  return {
    source: resolved.source,
    variant: resolved.variant,
    placement: resolved.placement,
    template: resolved.template,
    heading: resolved.heading,
    stepCount: resolved.steps.length,
    steps: resolved.steps.map((step) => ({
      label: step.label,
      title: step.title,
      href: step.resolved.href,
      type: step.type,
      intent: step.intent,
      position: step.position,
      destinationCluster: step.resolved.destinationCluster,
      appStoreFallback: step.resolved.appStoreFallback,
    })),
  };
}
