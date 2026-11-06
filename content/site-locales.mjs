// Public locale counterparts. A route joins discovery only after its page review.
export const localeOrigin = "https://you-owe-me.com";
export const spanishAssetVersion = "es20261020";
export const germanAssetVersion = "de20261020";
// Add a shared dependency here when its bytes change. The same new URL must
// reach every localized page, including already-published Spanish pages.
export const sharedAssetVersions = {
  "/scripts/analytics.js": "kohome20261106",
  "/scripts/sales.js": "kohome20261106",
  "/scripts/anniversary-announcement.js": "kohome20261106",
  "/scripts/app-language-support.js": "kohome20261106",
  "/scripts/video-embed.js": "kohome20261106",
  "/assets/js/main.js": "kohome20261106",
  "/styles/site-locale.css": "review20261020",
  "/styles/site-nav.css": "ar20261020",
  "/scripts/recordkeeping-guide-es.js": "itrecord20261106",
  "/scripts/split-expense-locale.js": "plsplit20261106",
  "/scripts/split-expense-calculator.js": "plsplit20261106",
  "/scripts/tool-transfer.js": "plsplit20261106",
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
export const japanesePages = [
  {
    "en": "/",
    "ja": "/ja/",
    "title": "お金の貸し借り・立て替えを記録",
    "updated": "2026-10-31",
    "complete": true,
    "registry": {
      "primaryAudience": "人とのお金の貸し借りや立て替えを、わかりやすく記録したい方。",
      "problemSolved": "相手ごとに金額と返済の履歴を残し、まだ残っている金額を確認できます。",
      "useWhen": "貸し借りや立て替えの記録を始めたいとき。",
      "primaryCta": "App Storeからダウンロード",
      "nextStep": "You Owe Meをダウンロードして、相手と金額を登録しましょう。"
    }
  },
{
  "en": "/solutions/app-to-track-money-owed/",
  "ja": "/ja/solutions/app-to-track-money-owed/",
  "title": "貸したお金の管理アプリ",
  "updated": "2026-10-31",
  "complete": true,
  "discoveryDescription": "誰にいくら貸して、いくら返してもらったか。You Owe Meなら、貸し借りと返済を相手ごとに記録して残額を確認できます。日本語対応のiPhone・iPadアプリ。",
  "registry": {
    "primaryAudience": "友人や家族への貸し借り、立て替え、一部返済を継続して記録したい方。",
    "problemSolved": "相手ごとに元の金額と返済の履歴を残し、まだ返してもらっていない金額を確認できます。",
    "useWhen": "返済が何回かに分かれるときや、同じ相手とのお金のやり取りが続くとき。",
    "primaryCta": "App Storeからダウンロード",
    "nextStep": "You Owe Meに相手と金額を登録し、返済があるたびに記録しましょう。"
  }
},
{
  "en": "/blog/how-to-keep-track-of-who-owes-you-money/",
  "ja": "/ja/blog/how-to-keep-track-of-who-owes-you-money/",
  "title": "貸したお金の記録方法",
  "updated": "2026-10-31",
  "complete": true,
  "discoveryDescription": "貸したお金や立て替えた費用を、相手・返済・残額に分けて記録する方法。コピーできる記録テンプレートと確認メッセージ、円での記入例、メモ・表計算・アプリの選び方を紹介します。",
  "registry": {
    "primaryAudience": "貸したお金や立て替えを、無理なく記録する方法を知りたい方。",
    "problemSolved": "元の金額、実際の返済、今の残額を分けて残し、確認漏れを防ぎます。",
    "useWhen": "メモに何を書けばよいか、一部返済をどう残すか迷ったとき。",
    "primaryCta": "記録テンプレートをコピー",
    "nextStep": "ひとりの相手とひとつの通貨から、今の残額を整理しましょう。"
  }
},
{
  "en": "/solutions/personal-loan-repayment-tracker/",
  "ja": "/ja/solutions/personal-loan-repayment-tracker/",
  "title": "貸し借りと返済計画の管理",
  "updated": "2026-10-31",
  "complete": true,
  "discoveryDescription": "友人や家族との貸し借りを分けて記録し、実際の返済に合わせて残額・次の支払い・返済計画を確認。貸す側も借りる側も使える、日本語対応のYou Owe Me。",
  "registry": {
    "primaryAudience": "友人や家族とのひとつの貸し借りを、実際の返済とともに記録し続けたい方。",
    "problemSolved": "貸し借りごとの履歴、残額、返済計画、次の確認事項をまとめます。",
    "useWhen": "一部返済や追加の貸し借りがあり、予定と実際の記録を合わせたいとき。",
    "primaryCta": "App Storeからダウンロード",
    "nextStep": "ひとつの貸し借りを登録し、実際に返済があったら記録しましょう。"
  }
},
{
  "en": "/tools/split-expense-calculator/",
  "ja": "/ja/tools/split-expense-calculator/",
  "title": "割り勘・立て替え精算",
  "updated": "2026-11-05",
  "complete": true,
  "discoveryDescription": "誰がいくら立て替えたかを入力して、誰にいくら払えば精算できるかを確認。食事・旅行・買い物を、費用ごとの参加者で割り勘にできる無料ツールです。",
  "registry": {
    "primaryAudience": "食事や旅行などで立て替えたお金を、参加者同士で精算したい方。",
    "problemSolved": "各自の支払額と負担額を比べて、誰にいくら払えばよいかを計算します。",
    "useWhen": "ひとつ、または複数の費用を、それぞれの参加者で均等に分けたいとき。",
    "primaryCta": "割り勘を計算する",
    "nextStep": "結果を共有し、あとで返してもらう分は記録を続けましょう。"
  }
},
{
  "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
  "ja": "/ja/blog/how-to-remind-someone-they-owe-you-money-politely/",
  "title": "返済をお願いする例文",
  "updated": "2026-11-05",
  "complete": true,
  "discoveryDescription": "友人への返済のお願いに使える例文10選。一部返済後の残額の例と、コピーできる記録テンプレート付き。",
  "registry": {
    "primaryAudience": "友人に貸したお金や、合意した立て替え分の返済をお願いしたい方。",
    "problemSolved": "今の残額と相手との約束に合わせて、具体的な連絡文を選べます。",
    "useWhen": "初めての連絡、返済日の確認、一部返済後のやり取りに。",
    "primaryCta": "10の例文を見る",
    "nextStep": "You Owe Meで貸し借りと返済を記録する"
  }
},
{
  "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
  "ja": "/ja/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
  "title": "お金を借りるときの例文",
  "updated": "2026-11-05",
  "complete": true,
  "discoveryDescription": "友人にお金を借りたいとき、どう頼めばいい？金額や返す予定を伝える例文8選と、約束・受け取ったお金・返済を分けて残す記録テンプレート。",
  "registry": {
    "primaryAudience": "友人にお金を借りる相談をし、返済の約束を残したい方。",
    "problemSolved": "借りたい金額と返す見通しを伝え、約束・受け取り・実際の返済を分けて記録できます。",
    "useWhen": "友人にお金を借りる前の相談と、その後の返済の確認に。",
    "primaryCta": "8つの例文を見る",
    "nextStep": "貸し借りと返済計画を記録する"
  }
}
,{
  "en": "/tools/roommate-expense-tracker-template/",
  "ja": "/ja/tools/roommate-expense-tracker-template/",
  "title": "ルームシェアの家計・精算表",
  "updated": "2026-11-05",
  "complete": true,
  "discoveryDescription": "ルームシェアの家賃、光熱費、食費と精算をまとめて記録。2〜6人で使える日本語の無料Excel・Googleスプレッドシートテンプレート。均等割りにも、決めた負担額にも対応。",
  "registry": {
    "primaryAudience": "ルームシェアの共通の支出と精算を、ひとつの表で確認したい方。",
    "problemSolved": "支出とメンバー間の精算を分け、誰がいくら受け取る・支払うかを確認できます。",
    "useWhen": "日々の記録、期間の終わりの確認、残高を次の期間へ引き継ぐときに。",
    "primaryCta": "Excelテンプレートをダウンロード",
    "nextStep": "You Owe Meで相手ごとの残額を記録する"
  }
}
];
export const japaneseShared = Object.freeze({
  "languageLabel": "ページの言語",
  "englishFallback": "英語",
  "storeLabel": "App Storeからダウンロード",
  "navigation": {
    "home": "ホーム",
    "solutions": "使い方・用途",
    "features": "機能",
    "reviews": "レビュー",
    "tools": "計算ツール・テンプレート",
    "compare": "比較",
    "blog": "ガイド"
  },
  "footer": {
    "/quick-start/": "はじめに",
    "/privacy-and-data/": "プライバシーとデータ",
    "/privacy-policy/": "プライバシーポリシー",
    "/contact/": "お問い合わせ"
  },
  "sectionLabel": "日本語のページ",
  "discoveryDescription": "日本語で読めるページです。各ページに専用のURLがあり、英語のみのリンク先には「英語」と表示しています。",
  "primaryAudience": "人とのお金の貸し借りや立て替えを、わかりやすく記録したい方。",
  "useWhen": "日本語で内容を確認し、目的に合う次のページを選びたいとき。",
  "nextStep": "関連するガイドを読むか、iPhoneのYou Owe Meで記録を始めましょう。"
});
export const portuguesePages = [
  {
    "en": "/",
    "pt": "/pt/",
    "title": "Dinheiro emprestado e valores a receber",
    "updated": "2026-11-05",
    "complete": true,
    "registry": {
      "primaryAudience": "Quem quer organizar o dinheiro emprestado, as despesas que pagou para outras pessoas e os valores que precisa devolver.",
      "problemSolved": "Mantenha o histórico por pessoa e confira o que já foi pago e o que ainda falta.",
      "useWhen": "Quando você precisa começar a registrar valores a receber ou a devolver.",
      "primaryCta": "Baixar na App Store",
      "nextStep": "Baixe o You Owe Me e registre a primeira pessoa e o primeiro valor."
    }
  },
  {
    "en": "/solutions/app-to-track-money-owed/",
    "pt": "/pt/solucoes/app-para-controlar-quem-te-deve/",
    "title": "App para controlar quem te deve",
    "updated": "2026-11-05",
    "complete": true,
    "discoveryDescription": "Registre quem te deve, os pagamentos recebidos e quanto ainda falta receber. Organize dinheiro emprestado e despesas que você pagou por alguém no You Owe Me para iPhone e iPad.",
    "registry": {
      "primaryAudience": "Quem precisa acompanhar dinheiro emprestado, despesas que você pagou por amigos ou familiares e pagamentos feitos aos poucos.",
      "problemSolved": "Reúne o valor original, os pagamentos e o saldo de cada pessoa para você saber quanto ainda falta receber.",
      "useWhen": "Quando os pagamentos vêm em partes ou as despesas com a mesma pessoa continuam acontecendo.",
      "primaryCta": "Baixar na App Store",
      "nextStep": "Adicione uma pessoa e um valor no You Owe Me. Registre cada pagamento para manter o saldo atualizado."
    }
  },
  {
    "en": "/blog/how-to-keep-track-of-who-owes-you-money/",
    "pt": "/pt/blog/como-controlar-quem-te-deve-dinheiro/",
    "title": "Como registrar quem te deve",
    "updated": "2026-11-05",
    "complete": true,
    "discoveryDescription": "Organize dinheiro emprestado e despesas que você pagou por alguém. Use um modelo para copiar, exemplos em reais e mensagens para conferir pagamentos e saldo.",
    "registry": {
      "primaryAudience": "Quem quer organizar dinheiro emprestado e despesas que pagou por alguém, sem complicar os registros.",
      "problemSolved": "Separa valor inicial, pagamentos recebidos e saldo atual para você conferir o que ainda falta.",
      "useWhen": "Quando você não sabe o que anotar ou como registrar um pagamento parcial.",
      "primaryCta": "Copiar modelo de registro",
      "nextStep": "Comece com uma pessoa e uma moeda e confira o saldo que existe hoje."
    }
  },
  {
    "en": "/solutions/personal-loan-repayment-tracker/",
    "pt": "/pt/solucoes/controle-de-emprestimos-entre-pessoas/",
    "title": "Empréstimos e planos de pagamento",
    "updated": "2026-11-05",
    "complete": true,
    "discoveryDescription": "Organize empréstimos entre amigos e familiares. Registre pagamentos, confira o saldo e acompanhe o plano de devolução no You Owe Me para iPhone, em português.",
    "registry": {
      "primaryAudience": "Quem emprestou ou pegou dinheiro emprestado e quer acompanhar o saldo, os pagamentos e o plano de devolução.",
      "problemSolved": "Reúne o histórico de cada empréstimo, o saldo restante, o plano e o próximo pagamento.",
      "useWhen": "Quando pagamentos parciais, valores extras ou mudanças no plano precisam continuar ligados ao mesmo empréstimo.",
      "primaryCta": "Baixar na App Store",
      "nextStep": "Cadastre um empréstimo e registre cada pagamento que realmente acontecer."
    }
  }
, {
  "en": "/tools/split-expense-calculator/",
  "pt": "/pt/ferramentas/calculadora-dividir-despesas/",
  "title": "Calculadora para dividir despesas",
  "updated": "2026-11-05",
  "complete": true,
  "discoveryDescription": "Some o que cada pessoa pagou e veja quem precisa pagar a quem. Divida jantar, viagem, mercado e outras despesas, escolhendo os participantes de cada gasto.",
  "registry": {
    "primaryAudience": "Quem divide despesas com amigos ou outras pessoas e quer acertar os valores que cada um pagou.",
    "problemSolved": "Compara o que cada pessoa pagou com sua parte nas despesas e calcula os valores para acertar.",
    "useWhen": "Quando uma ou várias despesas precisam ser divididas igualmente entre os participantes de cada gasto.",
    "primaryCta": "Calcular a divisão",
    "nextStep": "Compartilhe o resultado e acompanhe os pagamentos que ficarem para depois."
  }
}
, {
  "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
  "pt": "/pt/blog/como-cobrar-um-amigo-com-educacao/",
  "title": "Mensagens para pedir seu dinheiro de volta",
  "updated": "2026-11-06",
  "complete": true,
  "discoveryDescription": "Dez mensagens para cobrar um amigo com educação, com exemplo de pagamentos parciais e modelo de registro para copiar.",
  "registry": {
    "primaryAudience": "Quem quer pedir a devolução de um empréstimo entre amigos ou de uma parte combinada de uma despesa.",
    "problemSolved": "Ajuda a escolher uma mensagem que corresponda ao combinado e ao valor que ainda falta receber.",
    "useWhen": "Para começar a conversa, confirmar uma data ou pedir o restante depois de um pagamento parcial.",
    "primaryCta": "Ver as 10 mensagens",
    "nextStep": "Registrar empréstimos e pagamentos no You Owe Me"
  }
}
, {
  "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
  "pt": "/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/",
  "title": "Como pedir dinheiro emprestado",
  "updated": "2026-11-06",
  "complete": true,
  "discoveryDescription": "Oito mensagens para conversar sobre um empréstimo entre amigos, com modelo de registro e exemplo de pagamentos.",
  "registry": {
    "primaryAudience": "Quem quer pedir dinheiro emprestado a um amigo e registrar o combinado de devolução.",
    "problemSolved": "Ajuda a explicar o pedido e a separar o acordo, o dinheiro recebido e os pagamentos realizados.",
    "useWhen": "Antes de pedir um empréstimo a um amigo e ao conversar sobre a devolução depois.",
    "primaryCta": "Ver as 8 mensagens",
    "nextStep": "Registrar o empréstimo e acompanhar os pagamentos"
  }
}
, {
  "en": "/tools/roommate-expense-tracker-template/",
  "pt": "/pt/ferramentas/planilha-despesas-casa-compartilhada/",
  "title": "Planilha de despesas da casa",
  "updated": "2026-11-06",
  "complete": true,
  "discoveryDescription": "Planilha gratuita em português para registrar despesas compartilhadas, acertos entre moradores e saldos. Versões Excel, Google Planilhas e CSV.",
  "registry": {
    "primaryAudience": "Quem divide casa ou apartamento e quer conferir despesas e acertos em um registro comum.",
    "problemSolved": "Separa despesas e pagamentos entre moradores para mostrar quem ainda precisa pagar e quem tem a receber.",
    "useWhen": "Ao registrar os gastos, fechar um período ou levar um saldo conferido ao período seguinte.",
    "primaryCta": "Baixar a planilha Excel",
    "nextStep": "Acompanhar os saldos por pessoa no You Owe Me"
  }
}
];
export const portugueseShared = Object.freeze({
  "languageLabel": "Idioma da página",
  "englishFallback": "em inglês",
  "storeLabel": "Baixar na App Store",
  "navigation": {
    "home": "Início",
    "solutions": "Como usar",
    "features": "Recursos",
    "reviews": "Avaliações",
    "tools": "Ferramentas",
    "compare": "Comparações",
    "blog": "Guias"
  },
  "footer": {
    "/quick-start/": "Primeiros passos",
    "/privacy-and-data/": "Privacidade e dados",
    "/privacy-policy/": "Política de privacidade",
    "/contact/": "Contato"
  },
  "sectionLabel": "Páginas em português",
  "discoveryDescription": "Páginas disponíveis em português. Cada página tem seu próprio endereço; os links para conteúdos ainda não traduzidos indicam “em inglês”.",
  "primaryAudience": "Quem quer organizar o dinheiro emprestado, as despesas que pagou para outras pessoas e os valores que precisa devolver.",
  "useWhen": "Para entender as opções em português e escolher o próximo passo.",
  "nextStep": "Leia um guia relacionado ou comece seus registros no You Owe Me para iPhone."
});
export const italianPages = [
  {
    "en": "/",
    "it": "/it/",
    "title": "Soldi prestati, spese anticipate e rimborsi",
    "updated": "2026-11-06",
    "complete": true,
    "registry": {
      "primaryAudience": "Chi vuole tenere il conto dei soldi prestati, delle spese anticipate e degli importi da restituire.",
      "problemSolved": "Conserva il riepilogo per persona e controlla quanto è già stato restituito e quanto manca.",
      "useWhen": "Quando vuoi iniziare a tenere il conto dei soldi da ricevere o restituire.",
      "primaryCta": "Scarica dall’App Store",
      "nextStep": "Scarica You Owe Me e aggiungi la prima persona e il primo importo."
    }
  },
  {
    "en": "/solutions/app-to-track-money-owed/",
    "it": "/it/soluzioni/app-per-segnare-chi-ti-deve-soldi/",
    "title": "App per segnare chi ti deve soldi",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Registra chi ti deve dei soldi, i rimborsi ricevuti e quanto manca. Tieni in ordine prestiti e spese anticipate con You Owe Me per iPhone e iPad.",
    "registry": {
      "primaryAudience": "Chi vuole tenere il conto dei soldi prestati, delle spese anticipate per amici o familiari e dei rimborsi ricevuti a poco a poco.",
      "problemSolved": "Riunisce l’importo iniziale, i rimborsi e il saldo di ogni persona, così sai quanto resta da ricevere.",
      "useWhen": "Quando i rimborsi arrivano in più volte o continui ad anticipare spese per la stessa persona.",
      "primaryCta": "Scarica dall’App Store",
      "nextStep": "Aggiungi una persona e un importo in You Owe Me. Registra ogni rimborso per tenere aggiornato il saldo."
    }
  },
  {
    "en": "/blog/how-to-keep-track-of-who-owes-you-money/",
    "it": "/it/blog/come-tenere-il-conto-di-chi-ti-deve-soldi/",
    "title": "Come tenere il conto di chi ti deve soldi",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Tieni in ordine soldi prestati e spese anticipate. Usa un modello da copiare, esempi in euro e messaggi per verificare rimborsi e saldo.",
    "registry": {
      "primaryAudience": "Chi vuole tenere in ordine soldi prestati e spese anticipate per altre persone, senza complicare i conti.",
      "problemSolved": "Separa importo iniziale, rimborsi ricevuti e saldo attuale per chiarire quanto manca da ricevere.",
      "useWhen": "Quando non sai cosa annotare o come registrare un rimborso parziale.",
      "primaryCta": "Copia il modello di registro",
      "nextStep": "Comincia con una persona e una valuta e verifica il saldo di oggi."
    }
  },
  {
    "en": "/solutions/personal-loan-repayment-tracker/",
    "it": "/it/soluzioni/gestire-prestiti-tra-amici-e-familiari/",
    "title": "Prestiti e piani di rimborso",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Tieni in ordine i prestiti tra amici e familiari: registra i rimborsi, verifica quanto manca e segui il piano di rimborso con You Owe Me per iPhone.",
    "registry": {
      "primaryAudience": "Chi ha prestato o ricevuto denaro e vuole seguire rimborsi, saldo e scadenze dello stesso prestito.",
      "problemSolved": "Tiene insieme il saldo residuo, i pagamenti effettivi, il piano di rimborso e la prossima scadenza.",
      "useWhen": "Quando un prestito prosegue con rimborsi parziali, nuovi importi o modifiche al piano.",
      "primaryCta": "Scarica dall’App Store",
      "nextStep": "Crea il registro del prestito e aggiungi ogni pagamento quando avviene davvero."
    }
  },
  {
    "en": "/tools/split-expense-calculator/",
    "it": "/it/strumenti/calcolatore-spese-condivise/",
    "title": "Calcolatore per dividere le spese",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Inserisci quanto ha pagato ciascuno e scopri chi deve restituire cosa. Dividi cena, viaggio, spesa e altri costi scegliendo chi partecipa a ogni spesa.",
    "registry": {
      "primaryAudience": "Chi divide le spese con amici o altre persone e vuole chiarire quanto deve pagare o ricevere ciascuno.",
      "problemSolved": "Confronta gli importi già pagati con la quota di ciascuno e calcola i pagamenti per saldare le differenze.",
      "useWhen": "Quando una o più spese vanno divise in parti uguali tra le persone che partecipano a ogni spesa.",
      "primaryCta": "Calcola la divisione",
      "nextStep": "Condividi il risultato e tieni il conto dei pagamenti che arriveranno dopo."
    }
  },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "it": "/it/blog/come-chiedere-indietro-soldi-a-un-amico/",
    "title": "Messaggi per chiedere un rimborso",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Dieci messaggi per chiedere indietro i soldi a un amico con tatto, con un esempio di rimborsi parziali e un registro da copiare.",
    "registry": {
      "primaryAudience": "Chi vuole chiedere la restituzione di un prestito tra amici o della quota concordata di una spesa.",
      "problemSolved": "Aiuta a scegliere un messaggio coerente con l’accordo e con l’importo ancora da ricevere.",
      "useWhen": "Per aprire la conversazione, confermare una data o chiedere ciò che manca dopo un rimborso parziale.",
      "primaryCta": "Leggi i 10 messaggi",
      "nextStep": "Registra prestiti e rimborsi in You Owe Me"
    }
  },
  {
    "en": "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/",
    "it": "/it/blog/come-chiedere-soldi-in-prestito-a-un-amico/",
    "title": "Come chiedere soldi in prestito",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Otto messaggi per parlare di un prestito tra amici, con un modello per annotare l’accordo e un esempio di rimborso.",
    "registry": {
      "primaryAudience": "Chi vuole chiedere soldi in prestito a un amico e tenere traccia dell’accordo sulla restituzione.",
      "problemSolved": "Aiuta a formulare la richiesta e a distinguere l’accordo, il denaro ricevuto e i pagamenti effettuati.",
      "useWhen": "Prima di chiedere un prestito a un amico e nelle conversazioni successive sul rimborso.",
      "primaryCta": "Leggi gli 8 messaggi",
      "nextStep": "Registra il prestito e segui i rimborsi"
    }
  },
{
  "en": "/tools/roommate-expense-tracker-template/",
  "it": "/it/strumenti/modello-spese-coinquilini/",
  "title": "Modello spese tra coinquilini",
  "updated": "2026-11-06",
  "complete": true,
  "discoveryDescription": "Modello gratuito in italiano per spese condivise, rimborsi tra coinquilini e saldi. Versioni Excel, Fogli Google e CSV.",
  "registry": {
    "primaryAudience": "Chi condivide casa e vuole controllare spese e rimborsi con gli altri coinquilini.",
    "problemSolved": "Separa le spese dai pagamenti tra coinquilini per mostrare chi deve ancora pagare e chi deve ricevere denaro.",
    "useWhen": "Quando registrate le spese, chiudete un periodo o riportate un saldo verificato al periodo successivo.",
    "primaryCta": "Scarica il modello Excel",
    "nextStep": "Segui i saldi per persona in You Owe Me"
  }
}
];
export const italianShared = Object.freeze({
  "languageLabel": "Lingua della pagina",
  "englishFallback": "in inglese",
  "storeLabel": "Scarica dall’App Store",
  "navigation": {
    "home": "Home",
    "solutions": "Soluzioni",
    "features": "Funzioni",
    "reviews": "Recensioni",
    "tools": "Strumenti",
    "compare": "Confronti",
    "blog": "Guide"
  },
  "footer": {
    "/quick-start/": "Primi passi",
    "/privacy-and-data/": "Privacy e dati",
    "/privacy-policy/": "Informativa sulla privacy",
    "/contact/": "Contatti"
  },
  "sectionLabel": "Pagine in italiano",
  "discoveryDescription": "Pagine disponibili in italiano. Ogni pagina ha un indirizzo dedicato; i collegamenti ai contenuti non ancora localizzati riportano “in inglese”.",
  "primaryAudience": "Chi vuole tenere il conto dei soldi prestati, delle spese anticipate e degli importi da restituire.",
  "useWhen": "Per conoscere le possibilità in italiano e scegliere da dove iniziare.",
  "nextStep": "Leggi una guida collegata oppure inizia a registrare i movimenti su You Owe Me per iPhone."
});
export const polishPages = [
  {
    "en": "/",
    "pl": "/pl/",
    "title": "Pożyczone pieniądze, wspólne wydatki i spłaty",
    "updated": "2026-11-06",
    "complete": true,
    "registry": {
      "primaryAudience": "Osoby, które chcą zapisywać pożyczone pieniądze, wydatki opłacone za innych i kwoty do zwrotu.",
      "problemSolved": "Zbiera kwoty i spłaty przy każdej osobie, żeby było jasne, ile już oddano i ile jeszcze zostało.",
      "useWhen": "Gdy chcesz uporządkować pieniądze do otrzymania lub oddania.",
      "primaryCta": "Pobierz z App Store",
      "nextStep": "Pobierz You Owe Me, dodaj pierwszą osobę i zapisz kwotę."
    }
  },
  {
    "en": "/solutions/app-to-track-money-owed/",
    "pl": "/pl/zastosowania/aplikacja-kto-ile-jest-winien/",
    "title": "Aplikacja do zapisywania rozliczeń",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Zapisuj pożyczone pieniądze, wydatki opłacone za innych i każdą spłatę. Sprawdzaj, ile zostało do oddania. You Owe Me po polsku na iPhone’a i iPada.",
    "registry": {
      "primaryAudience": "Osoby, które pożyczają pieniądze znajomym lub rodzinie, płacą za innych i otrzymują zwroty w kilku częściach.",
      "problemSolved": "Łączy początkową kwotę, kolejne spłaty i saldo każdej osoby, żeby było wiadomo, ile zostało do oddania.",
      "useWhen": "Gdy pieniądze wracają w częściach albo regularnie płacisz za tę samą osobę.",
      "primaryCta": "Pobierz z App Store",
      "nextStep": "Dodaj osobę i pierwszą kwotę w You Owe Me. Dopisuj każdą spłatę, aby saldo było aktualne."
    }
  },
  {
    "en": "/tools/split-expense-calculator/",
    "pl": "/pl/narzedzia/kalkulator-podzialu-wydatkow/",
    "title": "Kalkulator podziału wydatków",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Wpisz, ile zapłaciła każda osoba, i sprawdź, kto komu ma oddać pieniądze. Podziel koszty kolacji, wyjazdu lub zakupów, wybierając uczestników każdego wydatku.",
    "registry": {
      "primaryAudience": "Osoby dzielące koszty ze znajomymi lub innymi osobami, które chcą ustalić, kto komu i ile ma oddać.",
      "problemSolved": "Porównuje już zapłacone kwoty z udziałem każdej osoby w kosztach i oblicza wpłaty potrzebne do rozliczenia.",
      "useWhen": "Gdy jeden lub kilka wydatków trzeba podzielić po równo między uczestników każdego z nich.",
      "primaryCta": "Oblicz podział",
      "nextStep": "Udostępnij wynik i zapisuj wpłaty, które pojawią się później."
    }
  },
  {
    "en": "/blog/how-to-remind-someone-they-owe-you-money-politely/",
    "pl": "/pl/blog/jak-poprosic-o-zwrot-pieniedzy/",
    "title": "Wiadomości z prośbą o zwrot pieniędzy",
    "updated": "2026-11-06",
    "complete": true,
    "discoveryDescription": "Dziesięć naturalnych wiadomości z prośbą o zwrot pieniędzy od znajomego, przykład częściowych spłat i zapis pożyczki do skopiowania.",
    "registry": {
      "primaryAudience": "Osoby, które chcą poprosić znajomego o spłatę pożyczki lub uzgodnionej części wspólnego wydatku.",
      "problemSolved": "Pomaga wybrać wiadomość zgodną z ustaleniami i kwotą, która rzeczywiście została do oddania.",
      "useWhen": "Przy pierwszym przypomnieniu, potwierdzaniu terminu lub proszeniu o resztę po częściowej spłacie.",
      "primaryCta": "Zobacz 10 wiadomości",
      "nextStep": "Zapisuj pożyczki i spłaty w You Owe Me"
    }
  }
];
export const polishShared = Object.freeze({
  "languageLabel": "Język strony",
  "englishFallback": "po angielsku",
  "storeLabel": "Pobierz z App Store",
  "navigation": {
    "home": "Strona główna",
    "solutions": "Zastosowania",
    "features": "Funkcje",
    "reviews": "Opinie",
    "tools": "Narzędzia",
    "compare": "Porównania",
    "blog": "Poradniki"
  },
  "footer": {
    "/quick-start/": "Pierwsze kroki",
    "/privacy-and-data/": "Prywatność i dane",
    "/privacy-policy/": "Polityka prywatności",
    "/contact/": "Kontakt"
  },
  "sectionLabel": "Strony po polsku",
  "discoveryDescription": "Strony dostępne po polsku. Każda ma własny adres. Linki do treści, których jeszcze nie ma po polsku, mają dopisek „po angielsku”.",
  "primaryAudience": "Osoby, które chcą zapisywać pożyczone pieniądze, wydatki opłacone za innych i kwoty do zwrotu.",
  "useWhen": "Gdy chcesz poznać aplikację po polsku i wybrać, od czego zacząć.",
  "nextStep": "Przeczytaj powiązany poradnik lub zacznij zapisywać rozliczenia w You Owe Me na iPhonie."
});
export const koreanPages = [
  {
    "en": "/",
    "ko": "/ko/",
    "title": "빌려준 돈과 함께 쓴 돈 관리",
    "updated": "2026-11-06",
    "complete": true,
    "registry": {
      "primaryAudience": "빌려준 돈, 대신 낸 비용, 돌려받거나 갚아야 할 금액을 기록하려는 사람.",
      "problemSolved": "사람별로 금액과 입금 내역을 모아, 얼마나 돌려받았고 얼마가 남았는지 확인할 수 있게 합니다.",
      "useWhen": "받을 돈이나 갚을 돈을 한곳에 정리하고 싶을 때.",
      "primaryCta": "App Store에서 다운로드",
      "nextStep": "You Owe Me를 내려받고, 사람을 추가한 뒤 금액을 기록하세요."
    }
  }
];
export const koreanShared = Object.freeze({
  "languageLabel": "페이지 언어",
  "englishFallback": "영어",
  "storeLabel": "App Store에서 다운로드",
  "navigation": {
    "home": "홈",
    "solutions": "활용 방법",
    "features": "기능",
    "reviews": "사용자 후기",
    "tools": "무료 도구",
    "compare": "비교",
    "blog": "가이드"
  },
  "footer": {
    "/quick-start/": "시작 가이드",
    "/privacy-and-data/": "개인정보와 데이터",
    "/privacy-policy/": "개인정보 처리방침",
    "/contact/": "문의"
  },
  "sectionLabel": "한국어 페이지",
  "discoveryDescription": "한국어로 읽을 수 있는 페이지입니다. 각 페이지에는 고유한 주소가 있으며, 아직 한국어로 제공되지 않는 콘텐츠의 링크에는 ‘영어’라고 표시합니다.",
  "primaryAudience": "빌려준 돈, 대신 낸 비용, 돌려받거나 갚아야 할 금액을 기록하려는 사람.",
  "useWhen": "You Owe Me를 한국어로 살펴보고 내 상황에 맞는 시작 방법을 찾을 때.",
  "nextStep": "관련 가이드를 읽거나 iPhone의 You Owe Me에서 첫 기록을 시작하세요."
});
export const siteLocales = [
  { code: "en", label: "English", home: "/", pages: [], shared: { languageLabel: "Page language" } },
  { code: "es", label: "Español", home: "/es/", pages: spanishPages, shared: spanishShared, assetVersion: spanishAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "spanish", sectionClass: "site-spanish-section", nextStepComment: "Spanish next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Spanish next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "de", label: "Deutsch", home: "/de/", pages: germanPages, shared: germanShared, assetVersion: germanAssetVersion, versionedAssets: spanishVersionedAssets, sectionMarker: "german", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "ar", label: "العربية", direction: "rtl", home: "/ar/", pages: arabicPages, shared: arabicShared, assetVersion: "ar20261020", versionedAssets: [...spanishVersionedAssets, "/scripts/arabic-number-input.js"], sectionMarker: "arabic", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "fr", label: "Français", home: "/fr/", pages: frenchPages, shared: frenchShared, assetVersion: "fr20261020", versionedAssets: [...spanishVersionedAssets, "/scripts/french-number-input.js"], sectionMarker: "french", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "ja", label: "日本語", home: "/ja/", pages: japanesePages, shared: japaneseShared, assetVersion: "ja20261031", versionedAssets: spanishVersionedAssets, sectionMarker: "japanese", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "pt", documentLanguage: "pt-BR", label: "Português", home: "/pt/", pages: portuguesePages, shared: portugueseShared, assetVersion: "pt20261105", versionedAssets: spanishVersionedAssets, sectionMarker: "portuguese", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "it", label: "Italiano", home: "/it/", pages: italianPages, shared: italianShared, assetVersion: "ithome20261106", versionedAssets: spanishVersionedAssets, sectionMarker: "italian", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "pl", label: "Polski", home: "/pl/", pages: polishPages, shared: polishShared, assetVersion: "plhome20261106", versionedAssets: spanishVersionedAssets, sectionMarker: "polish", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
  { code: "ko", label: "한국어", home: "/ko/", pages: koreanPages, shared: koreanShared, assetVersion: "kohome20261106", versionedAssets: spanishVersionedAssets, sectionMarker: "korean", sectionClass: "site-locale-section", nextStepComment: "Localized next steps are authored in this page; the English module builder does not own this block.", registrySkipReason: "Localized next steps are translated in the public HTML; the English module generator must not overwrite them." },
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
