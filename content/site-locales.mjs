// Public locale counterparts. A route joins discovery only after its page review.
export const localeOrigin = "https://you-owe-me.com";
export const spanishAssetVersion = "es20261020";
export const germanAssetVersion = "de20261020";
// Add a shared dependency here when its bytes change. The same new URL must
// reach every localized page, including already-published Spanish pages.
export const sharedAssetVersions = {
  "/scripts/analytics.js": "locales20261020",
  "/scripts/sales.js": "locales20261020",
  "/scripts/anniversary-announcement.js": "locales20261020",
  "/scripts/app-language-support.js": "locales20261020",
  "/scripts/video-embed.js": "locales20261020",
  "/assets/js/main.js": "locales20261020",
  "/styles/site-locale.css": "locales20261020",
  "/scripts/recordkeeping-guide-es.js": "locales20261020",
};
export const spanishVersionedAssets = [
  "/scripts/analytics.js", "/scripts/sales.js", "/scripts/anniversary-announcement.js",
  "/scripts/app-language-support.js", "/scripts/video-embed.js", "/assets/js/main.js",
  "/scripts/split-expense-locale.js", "/scripts/tool-transfer.js", "/scripts/split-expense-calculator.js",
  "/scripts/recordkeeping-guide-es.js", "/styles/site-locale.css",
];
export const spanishPages = [
  { en: "/", es: "/es/", title: "You Owe Me: controla préstamos, gastos y pagos", complete: true },
  { en: "/solutions/app-to-track-money-owed/", es: "/es/soluciones/app-para-registrar-dinero-adeudado/", title: "App para registrar el dinero que te deben", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", es: "/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/", title: "Cómo llevar el control de quién te debe dinero", complete: true },
  { en: "/solutions/personal-loan-repayment-tracker/", es: "/es/soluciones/seguimiento-de-prestamos-personales/", title: "Seguimiento de préstamos personales y sus pagos", complete: true },
  { en: "/tools/split-expense-calculator/", es: "/es/herramientas/calculadora-de-gastos-compartidos/", title: "Calculadora de gastos compartidos", complete: true },
];

export const spanishShared = Object.freeze({
  languageLabel: "Idioma de la página",
  exampleLabel: "Ejemplo ilustrativo; no es una captura de la app",
  englishFallback: "en inglés",
  storeLabel: "Descargar en el App Store",
  navigation: { home: "Inicio", solutions: "Soluciones", features: "Funciones", reviews: "Opiniones", tools: "Herramientas", compare: "Comparar", blog: "Blog" },
  footer: { "/privacy-and-data/": "Privacidad y datos", "/privacy-policy/": "Política de privacidad", "/contact/": "Contacto" },
  sectionLabel: "Páginas en español",
  discoveryDescription: "Contenido público en español. Cada página conserva su propia URL canónica; los recursos todavía disponibles solo en inglés se indican en sus enlaces.",
  primaryAudience: "Personas que necesitan llevar un registro claro del dinero entre personas.",
  useWhen: "Para consultar esta página en español y elegir el siguiente paso.",
  nextStep: "Consulta los recursos relacionados o continúa en You Owe Me para iPhone.",
});

export const germanPages = [
  { en: "/", de: "/de/", title: "You Owe Me: Geldforderungen, Darlehen und Ausgaben im Blick", complete: true },
  { en: "/solutions/app-to-track-money-owed/", de: "/de/loesungen/app-fuer-geldforderungen/", title: "App für Geldforderungen", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", de: "/de/blog/wer-schuldet-mir-geld/", title: "Wer schuldet mir Geld? So behältst du den Überblick", complete: true },
  { en: "/solutions/personal-loan-repayment-tracker/", de: "/de/loesungen/private-darlehen-verwalten/", title: "Private Darlehen und Rückzahlungen verwalten", complete: true },
  { en: "/tools/split-expense-calculator/", de: "/de/tools/ausgaben-aufteilen/", title: "Ausgaben aufteilen: Rechner für gemeinsame Kosten", complete: false },
];

export const germanShared = Object.freeze({
  languageLabel: "Seitensprache",
  exampleLabel: "Illustratives Beispiel; kein Screenshot der App",
  englishFallback: "auf Englisch",
  storeLabel: "Im App Store laden",
  navigation: { home: "Startseite", solutions: "Lösungen", features: "Funktionen", reviews: "Bewertungen", tools: "Rechner und Vorlagen", compare: "Vergleichen", blog: "Blog" },
  footer: { "/privacy-and-data/": "Datenschutz und Daten", "/privacy-policy/": "Datenschutzerklärung", "/contact/": "Kontakt" },
  sectionLabel: "Seiten auf Deutsch",
  discoveryDescription: "Öffentliche Inhalte auf Deutsch. Jede Seite hat ihre eigene kanonische URL. Links zu Ressourcen, die bisher nur auf Englisch verfügbar sind, sind entsprechend gekennzeichnet.",
  primaryAudience: "Menschen, die Geldforderungen, private Darlehen und gemeinsame Ausgaben übersichtlich festhalten möchten.",
  useWhen: "Um diese Seite auf Deutsch zu lesen und den nächsten Schritt auszuwählen.",
  nextStep: "Sieh dir verwandte Inhalte an oder nutze You Owe Me auf dem iPhone.",
});

// Spanish names remain public compatibility exports. All generation consumes
// this common configuration, so adding a locale never needs another generator.
export const siteLocales = [
  { code: "en", label: "English", home: "/", pages: [], shared: { languageLabel: "Page language" } },
  { code: "es", label: "Español", home: "/es/", pages: spanishPages, shared: spanishShared, assetVersion: spanishAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "spanish", sectionClass: "site-spanish-section", nextStepComment: "Spanish next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Spanish next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "de", label: "Deutsch", home: "/de/", pages: germanPages, shared: germanShared, assetVersion: germanAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "german", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
];

export function localeAssetVersion(locale, asset) {
  return sharedAssetVersions[asset] || locale.assetVersion;
}

export function completedCounterparts(englishRoute, locales = siteLocales) {
  return [{ code: "en", route: englishRoute }, ...locales.filter(locale => locale.code !== "en").flatMap(locale =>
    locale.pages.filter(page => page.en === englishRoute && page.complete).map(page => ({ code: locale.code, route: page[locale.code] })))];
}

export function localizedSourceRoute(route, locales = siteLocales) {
  for (const locale of locales) {
    const page = locale.pages.find(page => page.complete && page[locale.code] === route);
    if (page) return page.en;
  }
  return null;
}

export function localizedRegistryEntries(englishEntries, locales = siteLocales) {
  const byUrl = new Map(englishEntries.map(entry => [entry.url, entry]));
  return locales.filter(locale => locale.code !== "en").flatMap(locale => {
    const completed = new Map(locale.pages.filter(page => page.complete).map(page => [page.en, page[locale.code]]));
    const localized = url => completed.get(url) || url;
    return locale.pages.filter(page => page.complete).map(page => {
      const source = byUrl.get(page.en);
      if (!source) throw new Error(`Missing English source: ${page.en}`);
      return {
        ...source, url: page[locale.code], title: page.title, locale: locale.code, translationOf: page.en,
        primaryAudience: locale.shared.primaryAudience,
        problemSolved: page.title,
        useWhen: locale.shared.useWhen,
        parent: page[locale.code] === locale.home ? "/" : localized("/"),
        relatedPages: source.relatedPages.map(localized),
        relatedTools: source.relatedTools.map(localized),
        relatedSolutions: source.relatedSolutions.map(localized),
        appStoreCpp: "general", appStoreDestinationState: "defaultAppStore",
        updated: "2026-10-20", primaryCta: locale.shared.storeLabel,
        nextStep: locale.shared.nextStep,
        bestNextSteps: { enabled: false, skipReason: locale.registrySkipReason },
      };
    });
  });
}
