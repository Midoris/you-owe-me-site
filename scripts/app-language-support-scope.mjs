import path from "node:path";

export const INCLUDED_EXACT_ROUTES = new Set([
  "/",
  "/ja/",
  "/pl/",
  "/it/",
  "/it/strumenti/modello-spese-coinquilini/",
  "/it/blog/come-chiedere-soldi-in-prestito-a-un-amico/",
  "/it/blog/come-chiedere-indietro-soldi-a-un-amico/",
  "/it/strumenti/calcolatore-spese-condivise/",
  "/it/soluzioni/gestire-prestiti-tra-amici-e-familiari/",
  "/it/blog/come-tenere-il-conto-di-chi-ti-deve-soldi/",
  "/it/soluzioni/app-per-segnare-chi-ti-deve-soldi/",
  "/pt/",
  "/pt/ferramentas/planilha-despesas-casa-compartilhada/",
  "/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/",
  "/pt/blog/como-cobrar-um-amigo-com-educacao/",
  "/pt/ferramentas/calculadora-dividir-despesas/",
  "/pt/solucoes/controle-de-emprestimos-entre-pessoas/",
  "/pt/blog/como-controlar-quem-te-deve-dinheiro/",
  "/pt/solucoes/app-para-controlar-quem-te-deve/",
  "/ja/solutions/app-to-track-money-owed/",
  "/ja/blog/how-to-keep-track-of-who-owes-you-money/",
  "/ja/solutions/personal-loan-repayment-tracker/",
  "/ja/tools/split-expense-calculator/",
  "/ja/tools/roommate-expense-tracker-template/",
  "/ja/blog/how-to-remind-someone-they-owe-you-money-politely/",
  "/ja/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
  "/features/",
  "/live-link/",
  "/voice-to-entry/",
  "/reviews/",
  "/find/",
  "/quick-start/",
  "/10-years/",
]);

export const INCLUDED_ROUTE_PREFIXES = Object.freeze([
  "/es/",
  "/de/",
  "/ar/",
  "/fr/",
  "/blog/",
  "/solutions/",
  "/tools/",
  "/compare/",
]);

export const EXCLUDED_EXACT_ROUTES = new Set([
  "/app-clip-review/", // Unlisted synthetic App Review utility, not an acquisition page.
  "/connect/",
  "/contact/",
  "/invite/",
  "/privacy-and-data/",
  "/privacy-policy/",
  "/redeem/",
]);

export const EXCLUDED_ROUTE_PREFIXES = Object.freeze([
  "/events/",
  "/private-continuation/", // Private Firebase handoff pages have no marketing widgets.
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
