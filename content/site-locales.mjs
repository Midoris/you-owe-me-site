// Public locale counterparts. A route joins discovery only after its page review.
export const localeOrigin = "https://you-owe-me.com";
export const spanishPages = [
  { en: "/", es: "/es/", title: "You Owe Me: controla préstamos, gastos y pagos", complete: false },
  { en: "/solutions/app-to-track-money-owed/", es: "/es/soluciones/app-para-registrar-dinero-adeudado/", title: "App para registrar el dinero que te deben", complete: false },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", es: "/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/", title: "Cómo llevar el control de quién te debe dinero", complete: false },
  { en: "/solutions/personal-loan-repayment-tracker/", es: "/es/soluciones/seguimiento-de-prestamos-personales/", title: "Seguimiento de préstamos personales y sus pagos", complete: false },
  { en: "/tools/split-expense-calculator/", es: "/es/herramientas/calculadora-de-gastos-compartidos/", title: "Calculadora de gastos compartidos", complete: false },
];

export const spanishShared = Object.freeze({
  languageLabel: "Idioma de la página",
  exampleLabel: "Ejemplo ilustrativo; no es una captura de la app",
  englishFallback: "en inglés",
  storeLabel: "Descargar en el App Store",
  navigation: { home: "Inicio", solutions: "Soluciones", features: "Funciones", reviews: "Opiniones", tools: "Herramientas", compare: "Comparar", blog: "Blog" },
});

export function localizedRegistryEntries(englishEntries) {
  const byUrl = new Map(englishEntries.map(entry => [entry.url, entry]));
  const completed = new Map(spanishPages.filter(page => page.complete).map(page => [page.en, page.es]));
  const localized = url => completed.get(url) || url;
  return spanishPages.filter(page => page.complete).map(page => {
    const source = byUrl.get(page.en);
    if (!source) throw new Error(`Missing English source: ${page.en}`);
    return {
      ...source, url: page.es, title: page.title, locale: "es", translationOf: page.en,
      primaryAudience: "Personas que necesitan llevar un registro claro del dinero entre personas.",
      problemSolved: page.title,
      useWhen: "Para consultar esta página en español y elegir el siguiente paso.",
      parent: page.es === "/es/" ? "/" : "/es/",
      relatedPages: source.relatedPages.map(localized),
      relatedTools: source.relatedTools.map(localized),
      relatedSolutions: source.relatedSolutions.map(localized),
      appStoreCpp: "general", appStoreDestinationState: "defaultAppStore",
      updated: "2026-10-20", primaryCta: spanishShared.storeLabel,
      nextStep: "Consulta los recursos relacionados o continúa en You Owe Me para iPhone.",
      bestNextSteps: { enabled: false, skipReason: "Spanish next steps are translated in the public HTML; the English module generator must not overwrite them." },
    };
  });
}
