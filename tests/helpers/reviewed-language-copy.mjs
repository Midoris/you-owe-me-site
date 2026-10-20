// October 20 independent review: normalize only the approved stale website-language FAQ correction.
export function normalizeReviewedLanguageCopy(html) {
  html = html.replace('The full website is available in English, with selected pages also available in Spanish, German, Arabic and French.', 'Language availability applies to the app; the You Owe Me website is currently available in English only.');
  html = html.replace('Este sitio web ofrece páginas en español, alemán, árabe y francés, además de todos sus contenidos en inglés. Los enlaces a recursos en inglés se indican como tales.', 'Este sitio web ofrece una sección en español; otros recursos siguen disponibles en inglés y se indican como tales.');
  html = html.replace('Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch und Französisch sowie alle Inhalte auf Englisch. Weiterführende Inhalte auf Englisch sind entsprechend gekennzeichnet.', 'Die Website bietet Bereiche auf Deutsch und Spanisch. Weiterführende Inhalte auf Englisch sind entsprechend gekennzeichnet.');
  html = html.replace('يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية، إلى جانب جميع محتوياته بالإنجليزية. وتُميَّز الروابط إلى المحتوى الإنجليزي بوضوح.', 'يوفّر الموقع صفحات بالعربية والألمانية والإسبانية، وتُميَّز الروابط إلى المحتوى الإنجليزي بوضوح.');
  return html;
}
