import fs from "node:fs";
const statsApprovedCopy = JSON.parse(fs.readFileSync(new URL("../fixtures/stats-approved-copy.json", import.meta.url), "utf8"));

// October 20 independent review: normalize only the approved stale website-language FAQ correction.
// Exact reviewed Stats additions from production commit 69b3628 (October 30).
export function normalizeReviewedStatsCopy(html) {
  // October 30 Stats release: allow only exact reviewed localized additions.
  // Any later edit to these blocks remains visible to the preservation checks.
  for (const [file, insertion] of Object.entries(statsApprovedCopy.insertions)) {
    const route = "/" + file.replace(/index\.html$/, "");
    if (!html.includes(`rel="canonical" href="https://you-owe-me.com${route}"`)) continue;
    html = html.replace(insertion, "").replace(statsApprovedCopy.stylesheet, "");
    const originalMeta = statsApprovedCopy.originalPageMeta[file];
    if (originalMeta) {
      html = html.replace(statsApprovedCopy.updatedPageMeta[file], originalMeta)
        .replace(statsApprovedCopy.updatedDateModified[file], statsApprovedCopy.originalDateModified[file]);
    }
  }
  return html;
}

export function normalizeReviewedGermanRepaymentCopy(html) {
  // LOC-01: only the five exact reviewed German guide anchors and two context links.
  html = html.replace("\n              <a href=\"/de/blog/geld-freundlich-zurueckfordern/\">Freundlich um Rückzahlung bitten</a>", "");
  html = html.replaceAll("<a href=\"/de/blog/geld-freundlich-zurueckfordern/\" class=\"lt-cardCta\">Leitfaden für freundliche Erinnerungen lesen</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">Leitfaden für freundliche Erinnerungen lesen (auf Englisch)</a>");
  html = html.replaceAll("<a href=\"/de/blog/geld-freundlich-zurueckfordern/\" class=\"lt-cardCta\">Leitfaden für freundliche Erinnerungen lesen </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">Leitfaden für freundliche Erinnerungen lesen <span class=\"site-locale-fallback\">(auf Englisch)</span></a>");
  html = html.replaceAll("<a href=\"/de/blog/geld-freundlich-zurueckfordern/\">Freundlich an einen offenen Betrag erinnern</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">Freundlich an einen offenen Betrag erinnern (auf Englisch)</a>");
  html = html.replaceAll("<a href=\"/de/blog/geld-freundlich-zurueckfordern/\">Freundlich an einen offenen Betrag erinnern </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">Freundlich an einen offenen Betrag erinnern <span class=\"site-locale-fallback\">(auf Englisch)</span></a>");
  html = html.replaceAll("<a href=\"/de/blog/geld-freundlich-zurueckfordern/\">freundlichen Formulierungen für Zahlungserinnerungen </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">freundlichen Formulierungen für Zahlungserinnerungen <span class=\"site-locale-fallback\">(auf Englisch)</span></a>");
  html = html.replace("\n                <p>Bevor du nachfragst, prüfe die bereits erhaltenen Zahlungen. Hier findest du <a href=\"/de/blog/geld-freundlich-zurueckfordern/\">freundliche Nachrichten für die Rückzahlung</a>, die du an euren aktuellen Stand anpassen kannst.</p>", "");
  html = html.replace("\n              <p>Wenn der offene Betrag feststeht, kannst du <a href=\"/de/blog/geld-freundlich-zurueckfordern/\">eine passende Nachricht auswählen</a>. Berücksichtige dabei die bisherigen Rückzahlungen und eure letzte Absprache.</p>", "");
  return html;
}

export function normalizeReviewedArabicRepaymentCopy(html) {
  // LOC-02: exact approved Arabic guide navigation, five retargeted anchors and two context links.
  html = html.replace("\n              <a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">رسائل لطلب السداد بلطف</a>", "");
  html = html.replaceAll("<a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">اقرأ دليل التذكيرات اللطيفة</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">اقرأ دليل التذكيرات اللطيفة (بالإنجليزية)</a>");
  html = html.replaceAll("<a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">قراءة دليل التذكيرات اللطيفة </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">قراءة دليل التذكيرات اللطيفة <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a>");
  html = html.replaceAll("<a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">تذكير شخص بلطف بأنه يدين لك بالمال</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">تذكير شخص بلطف بأنه يدين لك بالمال (بالإنجليزية)</a>");
  html = html.replaceAll("<a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">تذكير شخص بلطف بأنه يدين لك بالمال </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">تذكير شخص بلطف بأنه يدين لك بالمال <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a>");
  html = html.replaceAll("<a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">نماذج التذكير اللطيف بسداد المال </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">نماذج التذكير اللطيف بسداد المال <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a>");
  html = html.replace("\n                <p>قبل المتابعة، راجع الدفعات التي استلمتها. ستجد هنا <a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">رسائل لطلب السداد بلطف</a> يمكنك تعديلها بحسب المبلغ المتبقي واتفاقكما.</p>", "");
  html = html.replace("\n              <p>بعد التأكد من المبلغ المتبقي، اختر <a href=\"/ar/blog/how-to-remind-someone-they-owe-you-money-politely/\">رسالة تناسب الموقف</a>. عدّلها وفق الدفعات المستلمة وآخر اتفاق بينكما.</p>", "");
  return html;
}

export function normalizeReviewedGermanBorrowCopy(html) {
  // LOC-03: exact new native navigation link and two parent-authored context paragraphs.
  html = html.replace("\n              <a href=\"/de/blog/freunde-um-geld-bitten/\">Freunde um Geld bitten</a>", "");
  html = html.replace("\n              <p>Noch vor der Auszahlung hilft eine klare Absprache. Hier findest du <a href=\"/de/blog/freunde-um-geld-bitten/\">Nachrichten, mit denen du Freunde um Geld bitten kannst</a>, ohne Druck zu machen.</p>", "");
  html = html.replace("\n<p>Möchtest du dir selbst Geld leihen? Nutze die <a href=\"/de/blog/freunde-um-geld-bitten/\">Nachrichten zum Bitten um Geld</a> und halte eine spätere Zusage getrennt vom tatsächlichen Geldeingang fest.</p>", "");
  return html;
}

export function normalizeReviewedArabicBorrowCopy(html) {
  // LOC-04: exact parent-approved native navigation and two context paragraphs.
  html = html.replace("\n              <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">طلب المال من صديق</a>", "");
  html = html.replace("\n              <p>قبل استلام المال، يساعدك الاتفاق الواضح على تجنب سوء الفهم. إليك <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">رسائل لطلب المال من صديق</a> دون ضغط.</p>", "");
  html = html.replace("\n<p>هل تريد أن تقترض المال بدلًا من طلب استرجاعه؟ استخدم <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">رسائل طلب المال من صديق</a>، وميّز بين الموافقة على الإقراض ووصول المبلغ فعلًا.</p>", "");
  return html;
}

export function normalizeReviewedFrenchBorrowCopy(html) {
  // LOC-05: only exact parent-approved French navigation and two context paragraphs.
  html = html.replace("\n              <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">Demander de l’argent à un ami</a>", "");
  html = html.replace("\n              <p>Avant le versement, une demande claire aide à poser les bases de l’accord. Retrouvez des <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">messages pour demander de l’argent à un ami</a> sans lui mettre la pression.</p>", "");
  html = html.replace("\n<p>Vous souhaitez emprunter de l’argent plutôt que demander un remboursement ? Consultez les <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">messages pour demander un prêt à un ami</a>, puis distinguez son accord de la réception effective de l’argent.</p>", "");
  return html;
}

// LOC-06: exact parent-authored Spanish discovery and the two inward paragraphs.
// Original snapshots remain immutable; any other source delta stays visible.
export function normalizeReviewedSpanishRoommateCopy(html) {
  return html
    .replace('\n              <a href="/es/herramientas/plantilla-gastos-piso-compartido/">Plantilla de gastos del piso compartido</a>', '')
    .replace('\n  <p>Si quieres conservar los gastos del piso y los pagos de varios periodos, utiliza la <a href="/es/herramientas/plantilla-gastos-piso-compartido/">plantilla de gastos para un piso compartido</a>. Incluye Excel y Google Sheets en español.</p>', '')
    .replace('\n  <p>Para los gastos de una vivienda compartida, esta <a href="/es/herramientas/plantilla-gastos-piso-compartido/">plantilla para compañeros de piso</a> separa los gastos originales, los pagos entre personas y el saldo pendiente.</p>', '');
}

export function normalizeReviewedLanguageCopy(html) {
  html = normalizeReviewedSpanishRoommateCopy(html);
  html = normalizeReviewedFrenchBorrowCopy(html);
  html = normalizeReviewedArabicBorrowCopy(html);
  html = normalizeReviewedGermanBorrowCopy(html);
  html = normalizeReviewedArabicRepaymentCopy(html);
  html = normalizeReviewedGermanRepaymentCopy(html);
  html = normalizeReviewedStatsCopy(html);
  html = html.replace('The full website is available in English, with selected pages also available in Spanish, German, Arabic and French.', 'Language availability applies to the app; the You Owe Me website is currently available in English only.');
  html = html.replace('Este sitio web ofrece páginas en español, alemán, árabe y francés, además de todos sus contenidos en inglés. Los enlaces a recursos en inglés se indican como tales.', 'Este sitio web ofrece una sección en español; otros recursos siguen disponibles en inglés y se indican como tales.');
  html = html.replace('Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch und Französisch sowie alle Inhalte auf Englisch. Weiterführende Inhalte auf Englisch sind entsprechend gekennzeichnet.', 'Die Website bietet Bereiche auf Deutsch und Spanisch. Weiterführende Inhalte auf Englisch sind entsprechend gekennzeichnet.');
  html = html.replace('يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية، إلى جانب جميع محتوياته بالإنجليزية. وتُميَّز الروابط إلى المحتوى الإنجليزي بوضوح.', 'يوفّر الموقع صفحات بالعربية والألمانية والإسبانية، وتُميَّز الروابط إلى المحتوى الإنجليزي بوضوح.');
  // October 27 Groups release: approve only these exact homepage feature-bullet replacements.
  html = html.replace("<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(en inglés)</span></a> para separar contextos; <a href=\"/features/#groups\">Grupos <span class=\"site-locale-fallback\">(en inglés)</span></a> para organizar a las personas dentro de un mismo contexto. Sincronización opcional entre dispositivos y Balance Sync entre dos usuarios</span></li>", "<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(en inglés)</span></a> para registros separados, con sincronización opcional entre dispositivos y Balance Sync entre dos usuarios</span></li>");
  html = html.replace("<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(auf Englisch)</span></a> für getrennte Bereiche; <a href=\"/features/#groups\">Gruppen <span class=\"site-locale-fallback\">(auf Englisch)</span></a> zum Ordnen von Personen innerhalb eines Bereichs. Optionale Synchronisierung zwischen Geräten und Balance Sync zwischen zwei Nutzern</span></li>", "<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(auf Englisch)</span></a> für getrennte Aufzeichnungen, mit optionaler Synchronisierung zwischen Geräten und Balance Sync zwischen zwei Nutzern</span></li>");
  html = html.replace("<li><span><a href=\"/features/#spaces\"><bdi dir=\"ltr\">Spaces</bdi> <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a> لفصل السجلات حسب السياق؛ و<a href=\"/features/#groups\">المجموعات <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a> لتنظيم الأشخاص داخل السياق نفسه. مزامنة اختيارية بين الأجهزة وميزة <bdi dir=\"ltr\">Balance Sync</bdi> بين مستخدمين اثنين</span></li>", "<li><span><a href=\"/features/#spaces\"><bdi dir=\"ltr\">Spaces</bdi> <span class=\"site-locale-fallback\">(بالإنجليزية)</span></a> لسجلات مستقلة، مع مزامنة اختيارية بين الأجهزة وميزة <bdi dir=\"ltr\">Balance Sync</bdi> بين مستخدمين اثنين</span></li>");
  html = html.replace("<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(en anglais)</span></a> pour séparer les contextes ; <a href=\"/features/#groups\">Groupes <span class=\"site-locale-fallback\">(en anglais)</span></a> pour organiser les personnes dans un même contexte. Synchronisation facultative entre appareils et Balance Sync entre deux utilisateurs</span></li>", "<li><span><a href=\"/features/#spaces\">Spaces <span class=\"site-locale-fallback\">(en anglais)</span></a> pour des suivis distincts, avec synchronisation facultative entre appareils et Balance Sync entre deux utilisateurs</span></li>");
  // Keep Arabic bidi labels inside one flex item, without changing accepted words.
  html = html.replace('<li><span>تذكيرات ورسائل متابعة مع <bdi dir="ltr">Money Conversations</bdi></span></li>', '<li>تذكيرات ورسائل متابعة مع <bdi dir="ltr">Money Conversations</bdi></li>');
  html = html.replace('<li><span>فائدة بنسبة مئوية أو بمبلغ ثابت، مع تصدير <bdi dir="ltr">CSV</bdi></span></li>', '<li>فائدة بنسبة مئوية أو بمبلغ ثابت، مع تصدير <bdi dir="ltr">CSV</bdi></li>');
  // October 27 outreach pages: allow only the approved new Spanish discovery and context links.
  html = html.replace("                <a href=\"/es/blog/como-pedir-dinero-prestado-a-un-amigo/\" class=\"lt-resourceShelfLink\">\n                  <strong>Cómo pedir dinero prestado a un amigo</strong>\n                  <span>Mensajes para explicar lo que necesitas, acordar la devolución y dejar espacio para decir que no.</span>\n                </a>\n", "");
  html = html.replace("            <p>Si todavía no hay un préstamo y quieres pedirlo, consulta los <a href=\"/es/blog/como-pedir-dinero-prestado-a-un-amigo/\">mensajes para pedir dinero prestado a un amigo</a>. Empieza el registro del dinero recibido cuando el préstamo se haga efectivo.</p>\n", "");
  html = html.replace("          <p>¿Aún necesitas hablar del préstamo? Estos <a href=\"/es/blog/como-pedir-dinero-prestado-a-un-amigo/\">ejemplos para pedir dinero prestado a un amigo</a> te ayudan a plantear el importe y la devolución antes de registrarlos.</p>\n\n", "");
  html = html.replace("\n              <a href=\"/es/blog/como-pedir-dinero-prestado-a-un-amigo/\">Cómo pedir dinero prestado a un amigo: mensajes y ejemplos</a>", "");
  // These two Spanish pages received approved context links on October 27; publication dates stay intact.
  if (html.includes('rel="canonical" href="https://you-owe-me.com/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/"') || html.includes('rel="canonical" href="https://you-owe-me.com/es/soluciones/seguimiento-de-prestamos-personales/"') || html.includes('rel="canonical" href="https://you-owe-me.com/es/soluciones/app-para-registrar-dinero-adeudado/"')) {
    html = html.replace('"dateModified": "2026-10-27"', '"dateModified": "2026-10-20"')
      .replace('property="article:modified_time" content="2026-10-27"', 'property="article:modified_time" content="2026-10-20"')
      .replace('Actualizado el <time datetime="2026-10-27">27 de octubre de 2026</time>', 'Actualizado el <time datetime="2026-10-20">20 de octubre de 2026</time>');
  }
  // October 27 repayment guide: normalize only approved new Spanish discovery/context links.
  html = html.replace("                <a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\" class=\"lt-resourceShelfLink\">\n                  <strong>Mensajes para pedir que te devuelvan dinero</strong>\n                  <span>Elige un recordatorio, revisa los pagos recibidos y pide una fecha con claridad.</span>\n                  <span>Ver los mensajes</span>\n                </a>\n", "");
  html = html.replace("            <p>Cuando tengas claro el saldo, puedes adaptar uno de estos <a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\">mensajes para pedir que te devuelvan dinero</a> antes de escribir a la otra persona.</p>\n", "");
  html = html.replace("            <p>Para preparar un recordatorio con el importe correcto, consulta la guía de <a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\">mensajes para pedir una devolución</a>.</p>\n", "");
  html = html.replace("\n              <a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\">Cómo pedir que te devuelvan dinero: mensajes y ejemplos</a>", "");
  // Existing locale generator retargets only these three exact authored anchor forms (five occurrences).
  html = html.replaceAll("<a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\">cómo recordar a alguien que te debe dinero con amabilidad</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">cómo recordar a alguien que te debe dinero con amabilidad (en inglés)</a>");
  html = html.replaceAll("<a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\" class=\"lt-cardCta\">Leer la guía de recordatorios amables</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\">Leer la guía de recordatorios amables (en inglés)</a>");
  html = html.replaceAll("<a href=\"/es/blog/como-pedir-que-te-devuelvan-dinero/\">mensajes amables para recordar un pago pendiente </a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">mensajes amables para recordar un pago pendiente <span class=\"site-locale-fallback\">(en inglés)</span></a>");
  return html;
}
