// Public locale counterparts. A route joins discovery only after its page review.
export const localeOrigin = "https://you-owe-me.com";
export const spanishAssetVersion = "es20261020";
export const germanAssetVersion = "de20261020";
// Add a shared dependency here when its bytes change. The same new URL must
// reach every localized page, including already-published Spanish pages.
export const sharedAssetVersions = {
  "/scripts/analytics.js": "roommatefr20261031",
  "/scripts/sales.js": "fr20261020",
  "/scripts/anniversary-announcement.js": "fr20261020",
  "/scripts/app-language-support.js": "fr20261020",
  "/scripts/video-embed.js": "fr20261020",
  "/assets/js/main.js": "fr20261020",
  "/styles/site-locale.css": "review20261020",
  "/styles/site-nav.css": "ar20261020",
  "/scripts/recordkeeping-guide-es.js": "fr20261020",
  "/scripts/split-expense-locale.js": "fr20261020",
  "/scripts/split-expense-calculator.js": "copy20261025",
  "/scripts/tool-transfer.js": "fr20261020",
};
export const spanishVersionedAssets = [
  "/scripts/analytics.js", "/scripts/sales.js", "/scripts/anniversary-announcement.js",
  "/scripts/app-language-support.js", "/scripts/video-embed.js", "/assets/js/main.js",
  "/scripts/split-expense-locale.js", "/scripts/tool-transfer.js", "/scripts/split-expense-calculator.js",
  "/scripts/recordkeeping-guide-es.js", "/styles/site-locale.css", "/styles/site-nav.css",
];
export const spanishPages = [
  { en: "/", es: "/es/", title: "You Owe Me: controla préstamos, gastos y pagos", updated: "2026-10-30", complete: true },
  { en: "/solutions/app-to-track-money-owed/", es: "/es/soluciones/app-para-registrar-dinero-adeudado/", title: "App para registrar el dinero que te deben", updated: "2026-10-30", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", es: "/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/", title: "Cómo llevar el control de quién te debe dinero", updated: "2026-10-27", complete: true },
  { en: "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/", es: "/es/blog/como-pedir-dinero-prestado-a-un-amigo/", title: "Cómo pedir dinero prestado a un amigo: mensajes y ejemplos", updated: "2026-10-27", complete: true },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "es": "/es/blog/como-pedir-que-te-devuelvan-dinero/",
    "title": "Cómo pedir que te devuelvan dinero: mensajes y ejemplos",
    "updated": "2026-10-27",
    "complete": true,
    "registry": {
      "primaryAudience": "Personas que necesitan pedir la devolución de un préstamo o un gasto compartido acordado",
      "problemSolved": "Preparar un mensaje claro de devolución a partir del acuerdo y del importe pendiente",
      "useWhen": "Cuando necesitas recordar una devolución, confirmar una fecha o dar seguimiento a un pago parcial",
      "primaryCta": "Elegir un mensaje",
      "nextStep": "Lleva el registro de importes y pagos en You Owe Me."
    }
  },
  { en: "/solutions/personal-loan-repayment-tracker/", es: "/es/soluciones/seguimiento-de-prestamos-personales/", title: "Seguimiento de préstamos personales y sus pagos", updated: "2026-10-27", complete: true },
  { en: "/tools/split-expense-calculator/", es: "/es/herramientas/calculadora-de-gastos-compartidos/", title: "Calculadora de gastos compartidos", complete: true },
  {
    "en": "/tools/roommate-expense-tracker-template/",
    "es": "/es/herramientas/plantilla-gastos-piso-compartido/",
    "title": "Plantilla de gastos del piso compartido",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "Organiza los gastos del piso, los pagos entre compañeros y lo que queda pendiente. Plantilla gratis en español para Excel y Google Sheets, de 2 a 6 personas.",
    "registry": {
      "primaryAudience": "Personas que comparten una vivienda y quieren llevar un registro de gastos, pagos y saldos acordados.",
      "problemSolved": "Separar gastos y pagos entre compañeros para revisar lo que cada persona debe pagar o recibir.",
      "useWhen": "Al registrar gastos del piso, revisar el mes o trasladar un saldo pendiente al siguiente periodo.",
      "nextStep": "Llevar el seguimiento en You Owe Me",
      "primaryCta": "Descargar plantilla de Excel"
    }
  },
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
  { en: "/", de: "/de/", title: "You Owe Me: Geldforderungen, Darlehen und Ausgaben im Blick", updated: "2026-10-30", complete: true },
  { en: "/solutions/app-to-track-money-owed/", de: "/de/loesungen/app-fuer-geldforderungen/", title: "App für Geldforderungen", updated: "2026-10-30", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", de: "/de/blog/wer-schuldet-mir-geld/", title: "Wer schuldet mir Geld? So behältst du den Überblick", complete: true },
  { en: "/solutions/personal-loan-repayment-tracker/", de: "/de/loesungen/private-darlehen-verwalten/", title: "Private Darlehen und Rückzahlungen verwalten", complete: true },
  { en: "/tools/split-expense-calculator/", de: "/de/tools/ausgaben-aufteilen/", title: "Ausgaben aufteilen: Rechner für gemeinsame Kosten", complete: true },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "de": "/de/blog/geld-freundlich-zurueckfordern/",
    "title": "Freundlich um Rückzahlung bitten",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "10 Nachrichten, ein Beispiel mit Teilzahlungen und eine Vorlage für deine Aufzeichnungen.",
    "registry": {
      "primaryAudience": "Menschen, die eine Rückzahlung unter Freunden oder einen vereinbarten Anteil an gemeinsamen Ausgaben festhalten.",
      "problemSolved": "Mit einer passenden Nachricht nachfragen und den tatsächlich offenen Betrag berücksichtigen.",
      "useWhen": "Bei einer Rückfrage, einem neuen Termin oder einer Teilzahlung.",
      "primaryCta": "Zu den 10 Nachrichten",
      "nextStep": "Private Darlehen in You Owe Me festhalten"
    }
  },
  {
    "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
    "de": "/de/blog/freunde-um-geld-bitten/",
    "title": "Freunde um Geld bitten",
    "discoveryDescription": "Wie fragst du Freunde nach einem kleinen Darlehen? 8 natürliche Nachrichten, klare Absprachen zur Rückzahlung und eine Vorlage für deinen Überblick.",
    "updated": "2026-10-31",
    "complete": true,
    "registry": {
      "primaryAudience": "Menschen, die sich privat Geld leihen und die Rückzahlung klar absprechen möchten.",
      "problemSolved": "Eine passende Bitte formulieren und Zusagen, erhaltenes Geld und Rückzahlungen auseinanderhalten.",
      "useWhen": "Vor einer privaten Bitte um Geld und nach einer Zusage.",
      "nextStep": "Private Darlehen festhalten",
      "primaryCta": "Zu den 8 Nachrichten"
    }
  },
  {
    "en": "/tools/roommate-expense-tracker-template/",
    "de": "/de/tools/wg-kasse-vorlage/",
    "title": "WG-Kasse-Vorlage",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "WG-Ausgaben, Zahlungen und offene Beträge übersichtlich festhalten. Kostenlose deutsche Vorlage für Excel und Google Sheets, für zwei bis sechs Personen.",
    "registry": {
      "primaryAudience": "Menschen in einer WG, die vereinbarte Ausgaben, Zahlungen untereinander und offene Beträge gemeinsam nachvollziehen möchten.",
      "problemSolved": "Gemeinsame Ausgaben und spätere Zahlungen getrennt erfassen, damit offene Beträge pro Person nachvollziehbar bleiben.",
      "useWhen": "Beim Pflegen der WG-Kasse, bei der Monatsabrechnung oder beim Übernehmen noch offener Beträge in einen neuen Zeitraum.",
      "nextStep": "Offene Beträge in You Owe Me festhalten",
      "primaryCta": "Excel-Vorlage herunterladen"
    }
  },
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
export const arabicPages = [
  { en: "/", ar: "/ar/", title: "You Owe Me: تابع الديون والقروض والمصروفات", updated: "2026-10-30", complete: true },
  { en: "/solutions/app-to-track-money-owed/", ar: "/ar/solutions/app-to-track-money-owed/", title: "تطبيق لتتبّع المبالغ المستحقة لك", updated: "2026-10-30", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", ar: "/ar/blog/how-to-keep-track-of-who-owes-you-money/", title: "كيف تتابع من يدين لك بالمال", complete: true },
  { en: "/solutions/personal-loan-repayment-tracker/", ar: "/ar/solutions/personal-loan-repayment-tracker/", title: "تتبّع القروض الشخصية وسدادها", complete: true },
  { en: "/tools/split-expense-calculator/", ar: "/ar/tools/split-expense-calculator/", title: "حاسبة تقسيم المصروفات المشتركة", complete: true },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "ar": "/ar/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "title": "رسائل لطلب السداد بلطف",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "10 رسائل بالعربية، ومثال للدفعات الجزئية، ونموذج لتسجيل المبلغ المتبقي.",
    "registry": {
      "primaryAudience": "من يتابعون سداد قرض بين الأصدقاء أو حصة جرى الاتفاق عليها من مصروف مشترك.",
      "problemSolved": "اختيار رسالة مناسبة للمبلغ المتبقي بعد احتساب الدفعات المستلمة.",
      "useWhen": "عند التذكير بالسداد أو الاتفاق على موعد أو استلام دفعة جزئية.",
      "nextStep": "تابع القرض في You Owe Me",
      "primaryCta": "اختر من الرسائل العشر"
    }
  },
  {
    "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
    "ar": "/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
    "title": "طلب المال من صديق",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "8 رسائل لطلب المال من صديق دون ضغط، مع أمثلة للاتفاق على السداد ونموذج لتسجيل المبلغ والدفعات. عدّل الرسالة لتناسب موقفك.",
    "registry": {
      "primaryAudience": "من يريدون اقتراض المال من صديق والاتفاق معه بوضوح على السداد.",
      "problemSolved": "صياغة طلب مناسب والتمييز بين الاتفاق واستلام المال ودفعات السداد.",
      "useWhen": "قبل طلب قرض من صديق وبعد الموافقة عليه.",
      "nextStep": "متابعة سداد القرض",
      "primaryCta": "عرض الرسائل الثماني"
    }
  },
  {
    "en": "/tools/roommate-expense-tracker-template/",
    "ar": "/ar/tools/roommate-expense-tracker-template/",
    "title": "قالب مصاريف السكن",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "سجّل مصاريف السكن والدفعات بين الشركاء واعرف ما تبقّى لكل شخص. قالب مجاني بالعربية لـ Excel وGoogle Sheets، من شخصين إلى ستة أشخاص.",
    "registry": {
      "primaryAudience": "شركاء السكن الذين يريدون تسجيل المصاريف المتفق عليها والدفعات بينهم ومراجعة المبالغ المتبقية.",
      "problemSolved": "فصل المصاريف الأصلية عن الدفعات اللاحقة لمعرفة ما بقي لكل شخص أو عليه.",
      "useWhen": "عند متابعة مصاريف السكن أو مراجعة حسابات الشهر أو نقل مبالغ متبقية إلى فترة جديدة.",
      "nextStep": "متابعة المبالغ في You Owe Me",
      "primaryCta": "تنزيل قالب Excel"
    }
  },
];
export const arabicShared = Object.freeze({
  languageLabel: "لغة الصفحة", exampleLabel: "مثال توضيحي؛ ليس لقطة شاشة من التطبيق",
  englishFallback: "بالإنجليزية", storeLabel: "تنزيل من App Store",
  navigation: { home: "الرئيسية", solutions: "الحلول", features: "المزايا", reviews: "التقييمات", tools: "الأدوات", compare: "المقارنة", blog: "المدونة" },
  footer: { "/privacy-and-data/": "الخصوصية والبيانات", "/privacy-policy/": "سياسة الخصوصية", "/contact/": "التواصل" },
  sectionLabel: "صفحات بالعربية",
  discoveryDescription: "محتوى عام باللغة العربية. لكل صفحة رابط أساسي مستقل، وتُميّز الروابط التي تقود إلى موارد متاحة بالإنجليزية فقط.",
  primaryAudience: "لمن يريد سجلاً واضحاً للمبالغ المستحقة والقروض والمصروفات المشتركة.",
  useWhen: "لقراءة هذه الصفحة بالعربية واختيار الخطوة التالية.",
  nextStep: "اطّلع على الموارد ذات الصلة أو تابع في You Owe Me على iPhone.",
});
export const frenchPages = [
  { en: "/", fr: "/fr/", title: "You Owe Me : suivez vos prêts, dépenses et remboursements", updated: "2026-10-30", complete: true },
  { en: "/solutions/app-to-track-money-owed/", fr: "/fr/solutions/application-suivi-argent-du/", title: "Application pour suivre l’argent qu’on vous doit", updated: "2026-10-30", complete: true },
  { en: "/blog/how-to-keep-track-of-who-owes-you-money/", fr: "/fr/blog/suivre-qui-vous-doit-de-l-argent/", title: "Comment savoir qui vous doit de l’argent", complete: true },
  { en: "/solutions/personal-loan-repayment-tracker/", fr: "/fr/solutions/suivi-remboursement-pret-personnel/", title: "Suivez vos prêts personnels et leurs remboursements", complete: true },
  { en: "/tools/split-expense-calculator/", fr: "/fr/outils/calculateur-partage-depenses/", title: "Calculateur de partage des dépenses", complete: true },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "fr": "/fr/blog/comment-reclamer-son-argent-poliment/",
    "title": "Messages de remboursement",
    "updated": "2026-10-27",
    "complete": true,
    "discoveryDescription": "10 messages en français, un exemple de remboursement partiel et un modèle de suivi.",
    "registry": {
      "primaryAudience": "Personnes qui suivent le remboursement d’un prêt entre proches ou d’une part de dépense partagée.",
      "problemSolved": "Demander un remboursement avec un message adapté au solde réellement restant.",
      "useWhen": "Après un prêt, un paiement partiel ou une date de remboursement à confirmer.",
      "primaryCta": "Voir les 10 messages",
      "nextStep": "Suivre le prêt dans You Owe Me"
    }
  },
  {
    "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
    "fr": "/fr/blog/comment-demander-de-l-argent-a-un-ami/",
    "title": "Demander de l’argent à un ami",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "Comment demander à un ami de te prêter de l’argent ? 8 messages à adapter, un accord clair et un modèle pour suivre les remboursements.",
    "registry": {
      "primaryAudience": "Les personnes qui souhaitent emprunter de l’argent à un ami et convenir clairement du remboursement.",
      "problemSolved": "Formuler une demande adaptée et distinguer l’accord, l’argent reçu et les remboursements.",
      "useWhen": "Avant de demander un prêt à un ami et après son accord.",
      "nextStep": "Suivre un prêt personnel",
      "primaryCta": "Voir les 8 messages"
    }
  },
  {
    "en": "/tools/roommate-expense-tracker-template/",
    "fr": "/fr/outils/tableau-depenses-colocation/",
    "title": "Dépenses de colocation",
    "updated": "2026-10-31",
    "complete": true,
    "discoveryDescription": "Loyer, charges, courses et remboursements : faites les comptes de la coloc avec un tableau gratuit en français pour Excel et Google Sheets, de 2 à 6 personnes.",
    "registry": {
      "primaryAudience": "Colocataires qui souhaitent suivre les dépenses convenues, les remboursements et les montants restants dans un fichier commun.",
      "problemSolved": "Distinguer les dépenses d’origine des remboursements pour garder un solde compréhensible par personne.",
      "useWhen": "Pour tenir les comptes de la colocation, faire le bilan du mois ou reporter les montants encore dus sur une nouvelle période.",
      "primaryCta": "Télécharger le modèle Excel",
      "nextStep": "Suivre les montants restants dans You Owe Me"
    }
  },
];
export const frenchShared = Object.freeze({
  languageLabel: "Langue de la page", exampleLabel: "Exemple illustratif ; ce n’est pas une capture de l’application",
  englishFallback: "en anglais", storeLabel: "Télécharger sur l’App Store",
  navigation: { home: "Accueil", solutions: "Solutions", features: "Fonctionnalités", reviews: "Avis", tools: "Outils", compare: "Comparatifs", blog: "Blog" },
  footer: { "/privacy-and-data/": "Confidentialité et données", "/privacy-policy/": "Politique de confidentialité", "/contact/": "Contact" },
  sectionLabel: "Pages en français",
  discoveryDescription: "Contenus publics en français. Chaque page possède sa propre URL canonique. Les liens vers des ressources disponibles uniquement en anglais sont signalés.",
  primaryAudience: "Les personnes qui souhaitent suivre clairement leurs prêts, remboursements et dépenses partagées.",
  useWhen: "Pour consulter cette page en français et choisir la suite.",
  nextStep: "Consultez les ressources associées ou poursuivez dans You Owe Me sur iPhone.",
});
export const siteLocales = [
  { code: "en", label: "English", home: "/", pages: [], shared: { languageLabel: "Page language" } },
  { code: "es", label: "Español", home: "/es/", pages: spanishPages, shared: spanishShared, assetVersion: spanishAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "spanish", sectionClass: "site-spanish-section", nextStepComment: "Spanish next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Spanish next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "de", label: "Deutsch", home: "/de/", pages: germanPages, shared: germanShared, assetVersion: germanAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "german", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "ar", label: "العربية", direction: "rtl", home: "/ar/", pages: arabicPages, shared: arabicShared, assetVersion: "ar20261020", versionedAssets: [...spanishVersionedAssets, "/scripts/arabic-number-input.js"], sectionMarker: "arabic", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "fr", label: "Français", home: "/fr/", pages: frenchPages, shared: frenchShared, assetVersion: "fr20261020", versionedAssets: [...spanishVersionedAssets, "/scripts/french-number-input.js"], sectionMarker: "french", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
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
      // Only these five editorial fields may differ for a reviewed native adaptation.
      const editorial = page.registry || {};
      return {
        ...source, url: page[locale.code], title: page.title, locale: locale.code, translationOf: page.en,
        primaryAudience: editorial.primaryAudience || locale.shared.primaryAudience,
        problemSolved: editorial.problemSolved || page.title,
        useWhen: editorial.useWhen || locale.shared.useWhen,
        parent: page[locale.code] === locale.home ? "/" : localized("/"),
        relatedPages: source.relatedPages.map(localized),
        relatedTools: source.relatedTools.map(localized),
        relatedSolutions: source.relatedSolutions.map(localized),
        appStoreCpp: "general", appStoreDestinationState: "defaultAppStore",
        updated: page.updated || "2026-10-20", primaryCta: editorial.primaryCta || locale.shared.storeLabel,
        nextStep: editorial.nextStep || locale.shared.nextStep,
        bestNextSteps: { enabled: false, skipReason: locale.registrySkipReason },
      };
    });
  });
}
