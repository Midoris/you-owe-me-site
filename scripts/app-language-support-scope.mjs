import path from "node:path";

export const INCLUDED_EXACT_ROUTES = new Set([
  "/",
  "/features/",
  "/reviews/",
  "/find/",
  "/quick-start/",
  "/10-years/",
]);

export const INCLUDED_ROUTE_PREFIXES = Object.freeze([
  "/blog/",
  "/solutions/",
  "/tools/",
  "/compare/",
]);

export const EXCLUDED_EXACT_ROUTES = new Set([
  "/connect/",
  "/contact/",
  "/invite/",
  "/privacy-and-data/",
  "/privacy-policy/",
  "/redeem/",
]);

export const EXCLUDED_ROUTE_PREFIXES = Object.freeze([
  "/events/",
]);

export function normalizeRoute(route) {
  if (!route || route === "/index.html") return "/";
  let normalized = route.startsWith("/") ? route : `/${route}`;
  normalized = normalized.replace(/\/index\.html$/i, "/");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function htmlPathToRoute(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  if (normalizedPath === "index.html") return "/";
  return normalizeRoute(`/${normalizedPath.replace(/\/index\.html$/i, "")}`);
}

export function isIncludedRoute(route) {
  const normalized = normalizeRoute(route);
  return INCLUDED_EXACT_ROUTES.has(normalized)
    || INCLUDED_ROUTE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function isExcludedRoute(route) {
  const normalized = normalizeRoute(route);
  return EXCLUDED_EXACT_ROUTES.has(normalized)
    || EXCLUDED_ROUTE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function classifyRoute(route) {
  if (isIncludedRoute(route)) return "included";
  if (isExcludedRoute(route)) return "excluded";
  return "unclassified";
}
