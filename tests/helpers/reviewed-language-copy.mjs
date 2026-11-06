import fs from "node:fs";





const polishRepaymentAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/polish-repayment-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedPolishRepaymentSource(source, file) {
  if (!polishRepaymentAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of polishRepaymentAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedPolishRepaymentIntegration(html) {
  const route = '/pl/blog/jak-poprosic-o-zwrot-pieniedzy/';
  html = html.replace('    <link rel="alternate" hreflang="pl" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pl"'+direction+' hreflang="pl">Polski</a>', '');
  html = html.replace('\n              <a href="'+route+'">Wiadomości z prośbą o zwrot pieniędzy</a>', '');
  for (const [current, previous] of polishRepaymentAdmissions.integrations) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=plrepayment20261106(?=")/g, '$1?v=plsplit20261106');
}

const polishSplitAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/polish-split-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedPolishSplitSource(source, file) {
  source = normalizeReviewedPolishRepaymentSource(source, file);
  if (!polishSplitAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of polishSplitAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedPolishSplitIntegration(html) {
  html = normalizeReviewedPolishRepaymentIntegration(html);
  html = normalizeReviewedPolishSplitSource(html, 'private-continuation/split/index.html');
  const route = '/pl/narzedzia/kalkulator-podzialu-wydatkow/';
  html = html.replace('    <link rel="alternate" hreflang="pl" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pl"'+direction+' hreflang="pl">Polski</a>', '');
  html = html.replace('\n              <a href="'+route+'">Kalkulator podziału wydatków</a>', '');
  for (const [current, previous] of polishSplitAdmissions.inwardAnchors) html = html.replace(current, previous);
  html = html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=plsplit20261106(?=")/g, '$1?v=plmoney20261106');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-locale\.js)\?v=plsplit20261106(?=")/g, '$1?v=itsplit20261106');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-calculator\.js)\?v=plsplit20261106(?=")/g, '$1?v=itsplit20261106');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/tool-transfer\.js)\?v=plsplit20261106(?=")/g, '$1?v=itsplit20261106');
  return html;
}

const polishMoneyOwedAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/polish-money-owed-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedPolishMoneyOwedSource(source, file) {
  source = normalizeReviewedPolishSplitSource(source, file);
  if (!polishMoneyOwedAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of polishMoneyOwedAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedPolishMoneyOwedIntegration(html) {
  html = normalizeReviewedPolishSplitIntegration(html);
  const route = '/pl/zastosowania/aplikacja-kto-ile-jest-winien/';
  html = html.replace('    <link rel="alternate" hreflang="pl" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pl"'+direction+' hreflang="pl">Polski</a>', '');
  html = html.replace('\n              <a href="'+route+'">Aplikacja do zapisywania rozliczeń</a>', '');
  for (const [current, previous] of polishMoneyOwedAdmissions.homeAnchors) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=plmoney20261106(?=")/g, '$1?v=plhome20261106');
}

const polishHomeAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/polish-home-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedPolishHomeSource(source, file) {
  source = normalizeReviewedPolishMoneyOwedSource(source, file);
  if (!polishHomeAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of polishHomeAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedPolishHomeIntegration(html) {
  html = normalizeReviewedPolishMoneyOwedIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="pl" href="https://you-owe-me.com/pl/" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="/pl/" lang="pl"'+direction+' hreflang="pl">Polski</a>', '');
  for (const {current, previous} of polishHomeAdmissions.availability) html = html.replaceAll(current, previous);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  for (const [current, previous] of polishHomeAdmissions.cacheByCanonical[canonical] || []) html = html.replaceAll(current, previous);
  for (const [current, previous] of polishHomeAdmissions.proseWrappersByCanonical[canonical] || []) html = html.replace(current, previous);
  for (const [current, previous] of polishHomeAdmissions.additionalHtmlByCanonical[canonical] || []) html = html.replace(current, previous);
  return html;
}

const italianRoommateAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-roommate-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianRoommateSource(source, file) {
  source = normalizeReviewedPolishHomeSource(source, file);
  if (!italianRoommateAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianRoommateAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianRoommateIntegration(html) {
  html = normalizeReviewedPolishHomeIntegration(html);
  const route = '/it/strumenti/modello-spese-coinquilini/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Modello spese tra coinquilini</a>', '');
  for (const [current, previous] of italianRoommateAdmissions.integrations) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itroommate20261106(?=")/g, '$1?v=itborrow20261106');
}

const italianBorrowAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-borrow-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianBorrowSource(source, file) {
  source = normalizeReviewedItalianRoommateSource(source, file);
  if (!italianBorrowAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianBorrowAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianBorrowIntegration(html) {
  html = normalizeReviewedItalianRoommateIntegration(html);
  const route = '/it/blog/come-chiedere-soldi-in-prestito-a-un-amico/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Come chiedere soldi in prestito</a>', '');
  for (const [current, previous] of italianBorrowAdmissions.integrations) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itborrow20261106(?=")/g, '$1?v=itrepayment20261106');
}

const italianRepaymentAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-repayment-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianRepaymentSource(source, file) {
  source = normalizeReviewedItalianBorrowSource(source, file);
  if (!italianRepaymentAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianRepaymentAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianRepaymentIntegration(html) {
  html = normalizeReviewedItalianBorrowIntegration(html);
  const route = '/it/blog/come-chiedere-indietro-soldi-a-un-amico/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Messaggi per chiedere un rimborso</a>', '');
  for (const [current, previous] of italianRepaymentAdmissions.integrations) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itrepayment20261106(?=")/g, '$1?v=itsplit20261106');
}

const italianSplitAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-split-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianSplitSource(source, file) {
  source = normalizeReviewedItalianRepaymentSource(source, file);
  if (!italianSplitAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianSplitAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianSplitIntegration(html) {
  html = normalizeReviewedItalianRepaymentIntegration(html);
  html = normalizeReviewedItalianSplitSource(html, 'private-continuation/split/index.html');
  const route = '/it/strumenti/calcolatore-spese-condivise/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Calcolatore per dividere le spese</a>', '');
  for (const [current, previous] of italianSplitAdmissions.inwardAnchors) html = html.replace(current, previous);
  html = html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itsplit20261106(?=")/g, '$1?v=itloan20261106');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-locale\.js)\?v=itsplit20261106(?=")/g, '$1?v=ptsplit20261105');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-calculator\.js)\?v=itsplit20261106(?=")/g, '$1?v=ptsplit20261105');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/tool-transfer\.js)\?v=itsplit20261106(?=")/g, '$1?v=ptsplit20261105');
  return html;
}

const italianPersonalLoanAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-personal-loan-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianPersonalLoanSource(source, file) {
  source = normalizeReviewedItalianSplitSource(source, file);
  if (!italianPersonalLoanAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianPersonalLoanAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianPersonalLoanIntegration(html) {
  html = normalizeReviewedItalianSplitIntegration(html);
  const route = '/it/soluzioni/gestire-prestiti-tra-amici-e-familiari/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Prestiti e piani di rimborso</a>', '');
  for (const [current, previous] of italianPersonalLoanAdmissions.inwardAnchors) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itloan20261106(?=")/g, '$1?v=itrecord20261106');
}

const italianRecordGuideAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-record-guide-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianRecordGuideSource(source, file) {
  source = normalizeReviewedItalianPersonalLoanSource(source, file);
  if (!italianRecordGuideAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianRecordGuideAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianRecordGuideIntegration(html) {
  html = normalizeReviewedItalianPersonalLoanIntegration(html);
  const route = '/it/blog/come-tenere-il-conto-di-chi-ti-deve-soldi/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">Come tenere il conto di chi ti deve soldi</a>', '');
  for (const [current, previous] of italianRecordGuideAdmissions.homeAnchors) html = html.replace(current, previous);
  html = html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itrecord20261106(?=")/g, '$1?v=itmoney20261106');
  return html.replace(/((?:src|href)="[^"?]*scripts\/recordkeeping-guide-es\.js)\?v=itrecord20261106(?=")/g, '$1?v=ptrecord20261105');
}

const italianMoneyOwedAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-money-owed-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianMoneyOwedSource(source, file) {
  source = normalizeReviewedItalianRecordGuideSource(source, file);
  if (!italianMoneyOwedAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianMoneyOwedAdmissions.source[file]) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianMoneyOwedIntegration(html) {
  html = normalizeReviewedItalianRecordGuideIntegration(html);
  const route = '/it/soluzioni/app-per-segnare-chi-ti-deve-soldi/';
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  html = html.replace('\n              <a href="'+route+'">App per segnare chi ti deve soldi</a>', '');
  for (const [current, previous] of italianMoneyOwedAdmissions.homeAnchors) html = html.replace(current, previous);
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=itmoney20261106(?=")/g, '$1?v=ithome20261106');
}

const italianHomeAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/italian-home-reviewed-admissions.json", import.meta.url), "utf8"));
export function normalizeReviewedItalianHomeSource(source, file) {
  source = normalizeReviewedItalianMoneyOwedSource(source, file);
  if (!italianHomeAdmissions.source[file]) return source;
  const bytes = Buffer.isBuffer(source);
  let text = bytes ? source.toString("utf8") : source;
  for (const [current, previous] of italianHomeAdmissions.source[file] || []) text = text.replace(current, previous);
  return bytes ? Buffer.from(text) : text;
}
export function normalizeReviewedItalianHomeIntegration(html) {
  html = normalizeReviewedItalianMoneyOwedIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="it" href="https://you-owe-me.com/it/" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="/it/" lang="it"'+direction+' hreflang="it">Italiano</a>', '');
  for (const {current, previous} of italianHomeAdmissions.availability) html = html.replaceAll(current, previous);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  for (const [current, previous] of italianHomeAdmissions.cacheByCanonical[canonical] || []) html = html.replaceAll(current, previous);
  return html;
}

const portugueseCacheUpdates = JSON.parse(fs.readFileSync(new URL("../fixtures/portuguese-home-cache-updates.json", import.meta.url), "utf8"));
const statsApprovedCopy = JSON.parse(fs.readFileSync(new URL("../fixtures/stats-approved-copy.json", import.meta.url), "utf8"));

const portugueseSplitAdmissions = JSON.parse(fs.readFileSync(new URL("../fixtures/portuguese-split-reviewed-admissions.json", import.meta.url), "utf8"));
// Only exact reviewed PT branch additions/selector changes are reversible here.
// No arbitrary attributes, prior-language literals or calculation math is erased.
export function normalizeReviewedPortugueseSplitSource(source, file) {
  source = normalizeReviewedItalianSplitSource(source, file);
  if (!portugueseSplitAdmissions[file]) return source;
  const bytes = Buffer.isBuffer(source);
  if (bytes) source = source.toString("utf8");
  for (const [current, previous] of portugueseSplitAdmissions[file]) source = source.replace(current, previous);
  return bytes ? Buffer.from(source) : source;
}
export function normalizeReviewedPortugueseRoommateSource(source, file) {
  source = normalizeReviewedItalianHomeSource(source, file);
  if (file === 'scripts/analytics.js') return source.replace('../content/site-locales.mjs?v=ptroommate20261106', '../content/site-locales.mjs?v=ptborrow20261106').replace('./iphone-handoff-analytics-bridge.mjs?v=ptroommate20261106', './iphone-handoff-analytics-bridge.mjs?v=ptborrow20261106');
  if (file === 'scripts/iphone-handoff-analytics-bridge.mjs') return source.replace('  "pt_roommate_template_iphone_handoff",\n', '');
  return source;
}
export function normalizeReviewedPortugueseRoommateIntegration(html) {
  html = normalizeReviewedItalianHomeIntegration(html);
  const route = '/pt/ferramentas/planilha-despesas-casa-compartilhada/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Planilha de despesas da casa</a>', '');
  html = html.replace("\n              <p class=\"lt-paragraphGap\">Para registrar despesas e acertos da casa ao longo dos meses, use a <a href=\"/pt/ferramentas/planilha-despesas-casa-compartilhada/\">planilha de despesas da casa compartilhada</a>. Há modelos em português para Excel e Google Planilhas, além de um CSV para registro.</p>", '');
  html = html.replace("\n            <p>Para despesas com quem mora com você, use também a <a href=\"/pt/ferramentas/planilha-despesas-casa-compartilhada/\">planilha de despesas da casa compartilhada</a>. Registre as despesas originais e os acertos posteriores separadamente.</p>", '');
  html = html.replace("\n                <article class=\"lt-toolCard\">\n                  <span class=\"lt-statusChip\" lang=\"pt\">Português</span>\n                  <h3><a href=\"/pt/ferramentas/planilha-despesas-casa-compartilhada/\" hreflang=\"pt\">Roommate expense tracker template in Portuguese</a></h3>\n                  <p>Portuguese Excel, Google Sheets and CSV resources for agreed shared costs and repayments.</p>\n                </article>", '');
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptroommate20261106(?=")/g, '$1?v=ptborrow20261106');
}

export function normalizeReviewedPortugueseBorrowSource(source, file) {
  source = normalizeReviewedPortugueseRoommateSource(source, file);
  if (file === 'scripts/analytics.js') return source.replace('../content/site-locales.mjs?v=ptborrow20261106', '../content/site-locales.mjs?v=ptrepayment20261106').replace('./iphone-handoff-analytics-bridge.mjs?v=ptborrow20261106', './iphone-handoff-analytics-bridge.mjs?v=ptrepayment20261106');
  if (file === 'scripts/iphone-handoff-analytics-bridge.mjs') return source.replace('  "pt_borrow_iphone_handoff",\n', '');
  return source;
}
export function normalizeReviewedPortugueseBorrowIntegration(html) {
  html = normalizeReviewedPortugueseRoommateIntegration(html);
  const route = '/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Como pedir dinheiro emprestado</a>', '');
  html = html.replace("\n            <p>Se você vai pedir dinheiro emprestado a um amigo, veja <a href=\"/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/\">como explicar o pedido e combinar a devolução</a>. Confirme o valor e as condições com a pessoa e registre o recebimento quando o dinheiro chegar.</p>", '');
  html = html.replace("<p>Se você quer pedir um empréstimo a um amigo, veja as <a href=\"/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/\">mensagens para pedir dinheiro emprestado</a>. Separe o acordo de emprestar do dinheiro que você realmente recebeu.</p>", '');
  html = html.replace("\n\n                <article class=\"lt-blogCard lt-roomyCard\">\n                  <p class=\"lt-cardLabel\" lang=\"pt\">Português</p>\n                  <h3 class=\"lt-cardHeadingGap\"><a href=\"/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/\" hreflang=\"pt\">Ask a friend to lend you money: Portuguese messages</a></h3>\n                  <p>Eight Portuguese messages, an agreement record and a worked repayment example.</p>\n                </article>", '');
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptborrow20261106(?=")/g, '$1?v=ptrepayment20261106');
}

export function normalizeReviewedPortugueseRepaymentSource(source, file) {
  source = normalizeReviewedPortugueseBorrowSource(source, file);
  if (file === 'scripts/analytics.js') return source.replace('../content/site-locales.mjs?v=ptrepayment20261106', '../content/site-locales.mjs?v=ptsplit20261105').replace('./iphone-handoff-analytics-bridge.mjs?v=ptrepayment20261106', './iphone-handoff-analytics-bridge.mjs?v=pt20261105');
  if (file === 'scripts/iphone-handoff-analytics-bridge.mjs') return source.replace('  "pt_repayment_iphone_handoff",\n', '');
  return source;
}
export function normalizeReviewedPortugueseRepaymentIntegration(html) {
  html = normalizeReviewedPortugueseBorrowIntegration(html);
  const route = '/pt/blog/como-cobrar-um-amigo-com-educacao/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Mensagens para pedir seu dinheiro de volta</a>', '');
  html = html.replace("<a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\">guia de mensagens para pedir o dinheiro de volta</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">guia de mensagens para pedir o dinheiro de volta <span class=\"site-locale-fallback\">(em inglês)</span></a>");
  html = html.replace("<a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\">como pedir o dinheiro de volta com educação</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">como pedir o dinheiro de volta com educação <span class=\"site-locale-fallback\">(em inglês)</span></a>");
  html = html.replace("<a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Ler o guia para pedir o dinheiro de volta</span></a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Ler o guia para pedir o dinheiro de volta <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  html = html.replace("<a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\">como pedir seu dinheiro de volta com educação</a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\">como pedir seu dinheiro de volta com educação <span class=\"site-locale-fallback\">(em inglês)</span></a>");
  html = html.replace("<a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Ver como pedir o pagamento</span></a>", "<a href=\"/blog/how-to-remind-someone-they-owe-you-money-politely/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Ver como pedir o pagamento <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  html = html.replace("\n              <p>Antes de pedir um pagamento, confira o que já recebeu. Use uma das <a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\">mensagens para pedir seu dinheiro de volta</a> e adapte ao valor que ainda falta.</p>", "");
  html = html.replace("\n            <p>Com o saldo conferido, escolha uma das <a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\">mensagens para pedir seu dinheiro de volta</a>. Inclua o valor atualizado e o que vocês combinaram na última conversa.</p>", "");
  html = html.replace("\n\n                <article class=\"lt-blogCard lt-roomyCard\">\n                  <p class=\"lt-cardLabel\" lang=\"pt\">Português</p>\n                  <h3 class=\"lt-cardHeadingGap\"><a href=\"/pt/blog/como-cobrar-um-amigo-com-educacao/\" hreflang=\"pt\">Friendly repayment messages in Portuguese</a></h3>\n                  <p>Portuguese messages for asking friends to repay, with a partial-payment example and a record of the remaining balance.</p>\n                </article>", "");
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptrepayment20261106(?=")/g, '$1?v=ptsplit20261105');
}

export function normalizeReviewedPortugueseSplitIntegration(html) {
  html = normalizeReviewedPortugueseRepaymentIntegration(html);
  html = normalizeReviewedPortugueseSplitSource(html, 'private-continuation/split/index.html');
  const route = '/pt/ferramentas/calculadora-dividir-despesas/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Calculadora para dividir despesas</a>', '');
  html = html.replace("<a href=\"/pt/ferramentas/calculadora-dividir-despesas/\" class=\"lt-situationPrimaryCta\" data-cta-location=\"situation-card\"><span class=\"pt-link-label\">Dividir uma despesa</span></a>", "<a href=\"/tools/split-expense-calculator/\" class=\"lt-situationPrimaryCta\" data-cta-location=\"situation-card\"><span class=\"pt-link-label\">Dividir uma despesa <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  html = html.replace("<a href=\"/pt/ferramentas/calculadora-dividir-despesas/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Dividir uma despesa</span></a>", "<a href=\"/tools/split-expense-calculator/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Dividir uma despesa <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  html = html.replace("<a href=\"/pt/ferramentas/calculadora-dividir-despesas/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Dividir a despesa</span></a>", "<a href=\"/tools/split-expense-calculator/\" class=\"lt-cardCta\"><span class=\"pt-link-label\">Dividir a despesa <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  html = html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptsplit20261105(?=")/g, '$1?v=ptloan20261105');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-locale\.js)\?v=ptsplit20261105(?=")/g, '$1?v=jasplit20261105');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/split-expense-calculator\.js)\?v=ptsplit20261105(?=")/g, '$1?v=jasplit20261105');
  html = html.replace(/((?:src|href)="[^"?]*scripts\/tool-transfer\.js)\?v=ptsplit20261105(?=")/g, '$1?v=jasplit20261105');
  return html;
}

export function normalizeReviewedPortugueseLoanIntegration(html) {
  html = normalizeReviewedPortugueseSplitIntegration(html);
  const route = '/pt/solucoes/controle-de-emprestimos-entre-pessoas/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Empréstimos e planos de pagamento</a>', '');
  html = html.replace("<a class=\"best-next-step__card\" href=\"/pt/solucoes/controle-de-emprestimos-entre-pessoas/\" data-module=\"best-next-step\" data-track-event=\"best_next_step_click\" data-track-location=\"home_best_next_step_2\" data-source-page=\"home\" data-source-cluster=\"homepage\" data-destination-cluster=\"repayments\" data-step-type=\"solution\" data-step-intent=\"track_ongoing_balance\" data-step-destination=\"/solutions/personal-loan-repayment-tracker/\" data-step-position=\"2\" data-module-variant=\"hub\" data-module-template=\"custom\" data-step-analytics-id=\"home_loan_repayments\">", "<a class=\"best-next-step__card\" href=\"/solutions/personal-loan-repayment-tracker/\" data-module=\"best-next-step\" data-track-event=\"best_next_step_click\" data-track-location=\"home_best_next_step_2\" data-source-page=\"home\" data-source-cluster=\"homepage\" data-destination-cluster=\"repayments\" data-step-type=\"solution\" data-step-intent=\"track_ongoing_balance\" data-step-destination=\"/solutions/personal-loan-repayment-tracker/\" data-step-position=\"2\" data-module-variant=\"hub\" data-module-template=\"custom\" data-step-analytics-id=\"home_loan_repayments\">");
  html = html.replace("<strong>Quero acompanhar um empréstimo até o fim</strong>", "<strong>Quero acompanhar um empréstimo até o fim <span class=\"site-locale-fallback\">(em inglês)</span></strong>");
  html = html.replace("<a href=\"/pt/solucoes/controle-de-emprestimos-entre-pessoas/\">controle de empréstimos entre pessoas</a>", "<a href=\"/solutions/personal-loan-repayment-tracker/\">controle de empréstimos entre pessoas <span class=\"site-locale-fallback\">(em inglês)</span></a>");
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptloan20261105(?=")/g, '$1?v=ptrecord20261105');
}

export function normalizeReviewedPortugueseRecordGuideIntegration(html) {
  html = normalizeReviewedPortugueseLoanIntegration(html);
  const route = '/pt/blog/como-controlar-quem-te-deve-dinheiro/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">Como registrar quem te deve</a>', '');
  html = html.replace("<a href=\"/pt/blog/como-controlar-quem-te-deve-dinheiro/\" class=\"lt-situationMicroLink\"><span class=\"pt-link-label\">Antes de escolher um app, veja como organizar seus registros.</span></a>", "<a href=\"/blog/how-to-keep-track-of-who-owes-you-money/\" class=\"lt-situationMicroLink\"><span class=\"pt-link-label\">Antes de escolher um app, veja como organizar seus registros <span class=\"site-locale-fallback\">(em inglês)</span>.</span></a>");
  html = html.replace("<a href=\"/pt/blog/como-controlar-quem-te-deve-dinheiro/\" class=\"lt-resourceShelfLink\">\n                  <strong>Como registrar quem deve a você</strong>", "<a href=\"/blog/how-to-keep-track-of-who-owes-you-money/\" class=\"lt-resourceShelfLink\">\n                  <strong>Como registrar quem deve a você <span class=\"site-locale-fallback\">(em inglês)</span></strong>");
  html = html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptrecord20261105(?=")/g, '$1?v=ptmoney20261105');
  return html.replace(/((?:src|href)="[^"?]*scripts\/recordkeeping-guide-es\.js)\?v=ptrecord20261105(?=")/g, '$1?v=jarecord20261031');
}

export function normalizeReviewedPortugueseMoneyOwedIntegration(html) {
  html = normalizeReviewedPortugueseRecordGuideIntegration(html);
  const route = '/pt/solucoes/app-para-controlar-quem-te-deve/';
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replace('\n              <a href="'+route+'">App para controlar quem te deve</a>', '');
  html = html.replace("<a class=\"best-next-step__card\" href=\"/pt/solucoes/app-para-controlar-quem-te-deve/\" data-module=\"best-next-step\" data-track-event=\"best_next_step_click\" data-track-location=\"home_best_next_step_1\" data-source-page=\"home\" data-source-cluster=\"homepage\" data-destination-cluster=\"money-owed\" data-step-type=\"solution\" data-step-intent=\"track_ongoing_balance\" data-step-destination=\"/solutions/app-to-track-money-owed/\" data-step-position=\"1\" data-module-variant=\"hub\" data-module-template=\"custom\" data-step-analytics-id=\"home_money_owed\">", "<a class=\"best-next-step__card\" href=\"/solutions/app-to-track-money-owed/\" data-module=\"best-next-step\" data-track-event=\"best_next_step_click\" data-track-location=\"home_best_next_step_1\" data-source-page=\"home\" data-source-cluster=\"homepage\" data-destination-cluster=\"money-owed\" data-step-type=\"solution\" data-step-intent=\"track_ongoing_balance\" data-step-destination=\"/solutions/app-to-track-money-owed/\" data-step-position=\"1\" data-module-variant=\"hub\" data-module-template=\"custom\" data-step-analytics-id=\"home_money_owed\">");
  html = html.replace("<strong>Quero acompanhar o dinheiro que me devem</strong>", "<strong>Quero acompanhar o dinheiro que me devem <span class=\"site-locale-fallback\">(em inglês)</span></strong>");
  html = html.replace("<a href=\"/pt/solucoes/app-para-controlar-quem-te-deve/\" class=\"lt-situationPrimaryCta\" data-cta-location=\"situation-card\"><span class=\"pt-link-label\">Organizar valores a receber</span></a>", "<a href=\"/solutions/app-to-track-money-owed/\" class=\"lt-situationPrimaryCta\" data-cta-location=\"situation-card\"><span class=\"pt-link-label\">Organizar valores a receber <span class=\"site-locale-fallback\">(em inglês)</span></span></a>");
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=ptmoney20261105(?=")/g, '$1?v=pt20261105');
}

export function normalizeReviewedPortugueseHomeIntegration(html) {
  html = normalizeReviewedPortugueseMoneyOwedIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="pt" href="https://you-owe-me.com/pt/" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="/pt/" lang="pt"'+direction+' hreflang="pt">Português</a>', '');
  html = html.replaceAll("The full website is available in English, with selected pages also available in Spanish, German, Arabic, French, Japanese and Portuguese.", "The full website is available in English, with selected pages also available in Spanish, German, Arabic, French and Japanese.");
  html = html.replaceAll("Este sitio web ofrece páginas en español, alemán, árabe, francés, japonés y portugués, además de todos sus contenidos en inglés.", "Este sitio web ofrece páginas en español, alemán, árabe, francés y japonés, además de todos sus contenidos en inglés.");
  html = html.replaceAll("Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch, Französisch, Japanisch und Portugiesisch sowie alle Inhalte auf Englisch.", "Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch, Französisch und Japanisch sowie alle Inhalte auf Englisch.");
  html = html.replaceAll("يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية واليابانية والبرتغالية، إلى جانب جميع محتوياته بالإنجليزية.", "يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية واليابانية، إلى جانب جميع محتوياته بالإنجليزية.");
  html = html.replaceAll("Le site propose une sélection de pages en français, espagnol, allemand, arabe, japonais et portugais, ainsi que l’ensemble de ses contenus en anglais.", "Le site propose une sélection de pages en français, espagnol, allemand, arabe et japonais, ainsi que l’ensemble de ses contenus en anglais.");
  html = html.replaceAll("ウェブサイト全体は英語で、一部のページは日本語、スペイン語、ドイツ語、アラビア語、フランス語、ポルトガル語でも読めます。", "ウェブサイト全体は英語で、一部のページは日本語、スペイン語、ドイツ語、アラビア語、フランス語でも読めます。");
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  for (const [updated, previous] of portugueseCacheUpdates[canonical] || []) html = html.replaceAll(updated, previous);
  return html;
}

export function normalizeReviewedJapaneseRoommateIntegration(html) {
  html = normalizeReviewedPortugueseHomeIntegration(html);
  const route = '/ja/tools/roommate-expense-tracker-template/';
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const dir of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="ja"'+dir+' hreflang="ja">日本語</a>', '');
  html = html.replace('\n              <a href="'+route+'">ルームシェアの家計・精算表</a>', '');
  html = html.replace("<p>月をまたいで共通の支出と精算を残したい場合は、<a href=\"/ja/tools/roommate-expense-tracker-template/\">ルームシェアの家計・精算表</a>を使えます。日本語のExcel・Googleスプレッドシートテンプレートと、記録用CSVを用意しています。</p>\n              ", '');
  html = html.replace("\n            <p>一緒に暮らす人との支出には、<a href=\"/ja/tools/roommate-expense-tracker-template/\">ルームシェアの家計・精算表</a>も使えます。元の支出と、あとから精算した分を分けて残せます。</p>", '');
  html = html.replace("\n                <article class=\"lt-toolCard\">\n                  <span class=\"lt-statusChip\" lang=\"ja\">日本語</span>\n                  <h3><a href=\"/ja/tools/roommate-expense-tracker-template/\" hreflang=\"ja\">Roommate expense tracker template in Japanese</a></h3>\n                  <p>Japanese Excel, Google Sheets and CSV resources for agreed shared costs and repayments.</p>\n                </article>", '');
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=jaroommate20261105(?=")/g, '$1?v=jaborrow20261105');
}

export function normalizeReviewedJapaneseBorrowIntegration(html) {
  html = normalizeReviewedJapaneseRoommateIntegration(html);
  const route='/ja/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/';
  html=html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com'+route+'" />\n','');
  for(const dir of['',' dir="ltr"'])html=html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="ja"'+dir+' hreflang="ja">日本語</a>','');
  html=html.replace('\n              <a href="'+route+'">お金を借りるときの例文</a>','');
  html=html.replace('\n            <p>これから友人に借りる相談をするなら、<a href="'+route+'">お金を借りるときの例文</a>も参考にできます。金額と返す見通しを伝え、相手と約束を確認してから記録しましょう。</p>','');
  html=html.replace('<p>これから自分がお金を借りたい場合は、<a href="'+route+'">友人にお金を借りるときの例文</a>をご覧ください。相手の了承と、実際にお金を受け取ったことは分けて記録しましょう。</p>','');
  html=html.replace('\n\n                <article class="lt-blogCard lt-roomyCard">\n                  <p class="lt-cardLabel" lang="ja">日本語</p>\n                  <h3 class="lt-cardHeadingGap"><a href="'+route+'" hreflang="ja">Ask a friend to lend you money: Japanese messages</a></h3>\n                  <p>Eight Japanese messages, an agreement record and a worked repayment example.</p>\n                </article>','');
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=jaborrow20261105(?=")/g,'$1?v=jarepayment20261105');
}
// LOC-15: exact completed Japanese reminder family, five existing-anchor
// retargets, two approved paragraphs, one English index card and analytics pin.
export function normalizeReviewedJapaneseRepaymentIntegration(html) {
  html=normalizeReviewedJapaneseBorrowIntegration(html);
  const route = '/ja/blog/how-to-remind-someone-they-owe-you-money-politely/';
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com'+route+'" />\n', '');
  for (const direction of ['', ' dir="ltr"']) html = html.replace('<span aria-hidden="true"> · </span><a href="'+route+'" lang="ja"'+direction+' hreflang="ja">日本語</a>', '');
  html = html.replace('\n              <a href="'+route+'">返済をお願いする例文</a>', '');
  for (const label of ['返済をお願いするメッセージ集','返済をお願いする伝え方','返済のお願いのガイドを読む','角が立ちにくい返済の頼み方','返済の頼み方を読む']) {
    const attrs = label==='返済のお願いのガイドを読む'||label==='返済の頼み方を読む'?' class="lt-cardCta"':'';
    html = html.replace('<a href="'+route+'"'+attrs+'>'+label+'</a>', '<a href="/blog/how-to-remind-someone-they-owe-you-money-politely/"'+attrs+'>'+label+'<span class="site-locale-fallback">（英語）</span></a>');
  }
  html = html.replace('\n              <p>返済をお願いする前に、受け取った金額を確認しておきましょう。<a href="'+route+'">状況に合う返済の例文</a>を、今の残額に合わせて使えます。</p>', '');
  html = html.replace('\n            <p>残額がはっきりしたら、<a href="'+route+'">返済をお願いする例文</a>から合うものを選べます。受け取った返済と、最後に話し合った内容を文面に反映しましょう。</p>', '');
  html = html.replace('\n\n                <article class="lt-blogCard lt-roomyCard">\n                  <p class="lt-cardLabel" lang="ja">日本語</p>\n                  <h3 class="lt-cardHeadingGap"><a href="'+route+'" hreflang="ja">Friendly repayment messages in Japanese</a></h3>\n                  <p>Japanese messages for asking friends to repay, with a partial-payment example and a record of the remaining balance.</p>\n                </article>', '');
  return html.replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)\?v=jarepayment20261105(?=")/g, '$1?v=roommatefr20261031');
}
// LOC-14: admit only the Japanese calculator counterpart, generated navigation,
// three exact approved inward links and the three changed shared-script pins.
// Original commit IDs and every other authored byte stay pinned.
export function normalizeReviewedJapaneseSplitIntegration(html) {
  html = normalizeReviewedJapaneseRepaymentIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com/ja/tools/split-expense-calculator/" />\n', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/tools/split-expense-calculator/" lang="ja" hreflang="ja">日本語</a>', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/tools/split-expense-calculator/" lang="ja" dir="ltr" hreflang="ja">日本語</a>', '');
  html = html.replace('\n              <a href="/ja/tools/split-expense-calculator/">割り勘・立て替え精算</a>', '');
  if (/rel="canonical" href="https:\/\/you-owe-me.com\/ja\/(?:"|solutions\/app-to-track-money-owed\/"|blog\/how-to-keep-track-of-who-owes-you-money\/\")/.test(html)) {
    html = html.replace(/<a href="\/ja\/tools\/split-expense-calculator\/" (class="(?:lt-cardCta|lt-situationPrimaryCta)"(?: data-cta-location="situation-card")?)>割り勘を計算する<\/a>/g,
      '<a href="/tools/split-expense-calculator/" $1>割り勘を計算する<span class="site-locale-fallback">（英語）</span></a>');
  }
  const oldPins = { 'split-expense-locale': 'fr20261020', 'split-expense-calculator': 'copy20261025', 'tool-transfer': 'fr20261020' };
  for (const [file, version] of Object.entries(oldPins)) html = html.replace(new RegExp(`((?:src|href)="[^"?]*scripts/${file}\\.js)\\?v=jasplit20261105(?=")`, 'g'), `$1?v=${version}`);
  return html;
}

// LOC-10 (2026-10-31): exact parent-approved homepage language sentences,
// generated Japanese home counterpart annotations, and five changed shared script pins.
// Immutable historical commit IDs and all other authored bytes remain checked.
export function normalizeReviewedJapaneseHomeIntegration(html) {
  html = normalizeReviewedJapaneseRecordGuideIntegration(html);
  // LOC-11: exact new completed Japanese solution annotations only.
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com/ja/solutions/app-to-track-money-owed/" />\n', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/solutions/app-to-track-money-owed/" lang="ja" hreflang="ja">日本語</a>', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/solutions/app-to-track-money-owed/" lang="ja" dir="ltr" hreflang="ja">日本語</a>', '');
  html = html.replaceAll("The full website is available in English, with selected pages also available in Spanish, German, Arabic, French and Japanese.", "The full website is available in English, with selected pages also available in Spanish, German, Arabic and French.");
  html = html.replaceAll("Este sitio web ofrece páginas en español, alemán, árabe, francés y japonés, además de todos sus contenidos en inglés.", "Este sitio web ofrece páginas en español, alemán, árabe y francés, además de todos sus contenidos en inglés.");
  html = html.replaceAll("Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch, Französisch und Japanisch sowie alle Inhalte auf Englisch.", "Die Website bietet ausgewählte Seiten auf Deutsch, Spanisch, Arabisch und Französisch sowie alle Inhalte auf Englisch.");
  html = html.replaceAll("يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية واليابانية، إلى جانب جميع محتوياته بالإنجليزية.", "يوفّر الموقع صفحات بالعربية والإسبانية والألمانية والفرنسية، إلى جانب جميع محتوياته بالإنجليزية.");
  html = html.replaceAll("Le site propose une sélection de pages en français, espagnol, allemand, arabe et japonais, ainsi que l’ensemble de ses contenus en anglais.", "Le site propose une sélection de pages en français, espagnol, allemand et arabe, ainsi que l’ensemble de ses contenus en anglais.");
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com/ja/" />\n', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/" lang="ja" hreflang="ja">日本語</a>', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/" lang="ja" dir="ltr" hreflang="ja">日本語</a>', '');
  html = html.replace(/((?:src|href)="[^"?]*(?:scripts\/(?:sales|anniversary-announcement|app-language-support|video-embed)|assets\/js\/main)\.js)\?v=ja20261031(?=")/g, '$1?v=fr20261020');
  return html;
}

// LOC-13: only the admitted personal-loan family annotations, Japanese section
// navigation, and two exact approved inward links. Historical snapshots stay pinned.
export function normalizeReviewedJapaneseLoanIntegration(html) {
  html = normalizeReviewedJapaneseSplitIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com/ja/solutions/personal-loan-repayment-tracker/" />\n', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/solutions/personal-loan-repayment-tracker/" lang="ja" hreflang="ja">日本語</a>', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/solutions/personal-loan-repayment-tracker/" lang="ja" dir="ltr" hreflang="ja">日本語</a>', '');
  html = html.replace('\n              <a href="/ja/solutions/personal-loan-repayment-tracker/">貸し借りと返済計画の管理</a>', '');
  if (html.includes('rel="canonical" href="https://you-owe-me.com/ja/"')) {
    html = html.replace('href="/ja/solutions/personal-loan-repayment-tracker/" data-module="best-next-step"', 'href="/solutions/personal-loan-repayment-tracker/" data-module="best-next-step"');
    html = html.replace('<strong>ひとつの貸し借りを最後まで記録したい</strong>', '<strong>ひとつの貸し借りを最後まで記録したい<span class="site-locale-fallback">（英語）</span></strong>');
  }
  if (html.includes('rel="canonical" href="https://you-owe-me.com/ja/solutions/app-to-track-money-owed/"')) {
    html = html.replace('<a href="/ja/solutions/personal-loan-repayment-tracker/">貸し借りと返済計画の管理</a>', '<a href="/solutions/personal-loan-repayment-tracker/">貸し借りと返済計画の管理<span class="site-locale-fallback">（英語）</span></a>');
  }
  return html;
}

// LOC-12: only the admitted guide annotations, one changed shared controller pin,
// Japanese section navigation and the two exact reviewed homepage guide links.
export function normalizeReviewedJapaneseRecordGuideIntegration(html) {
  html = normalizeReviewedJapaneseLoanIntegration(html);
  html = html.replace('    <link rel="alternate" hreflang="ja" href="https://you-owe-me.com/ja/blog/how-to-keep-track-of-who-owes-you-money/" />\n', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/blog/how-to-keep-track-of-who-owes-you-money/" lang="ja" hreflang="ja">日本語</a>', '');
  html = html.replace('<span aria-hidden="true"> · </span><a href="/ja/blog/how-to-keep-track-of-who-owes-you-money/" lang="ja" dir="ltr" hreflang="ja">日本語</a>', '');
  html = html.replace('\n              <a href="/ja/blog/how-to-keep-track-of-who-owes-you-money/">貸したお金の記録方法</a>', '');
  html = html.replaceAll('/scripts/recordkeeping-guide-es.js?v=jarecord20261031', '/scripts/recordkeeping-guide-es.js?v=fr20261020');
  if (html.includes('rel="canonical" href="https://you-owe-me.com/ja/"')) {
    html = html.replace('<a href="/ja/blog/how-to-keep-track-of-who-owes-you-money/" class="lt-situationMicroLink">まずは記録を整理したい方へ。貸し借りの記録の付け方</a>', '<a href="/blog/how-to-keep-track-of-who-owes-you-money/" class="lt-situationMicroLink">まずは記録を整理したい方へ。貸し借りの記録の付け方<span class="site-locale-fallback">（英語）</span></a>');
    html = html.replace('<a href="/ja/blog/how-to-keep-track-of-who-owes-you-money/" class="lt-resourceShelfLink">\n                  <strong>貸し借りの記録の付け方</strong>', '<a href="/blog/how-to-keep-track-of-who-owes-you-money/" class="lt-resourceShelfLink">\n                  <strong>貸し借りの記録の付け方<span class="site-locale-fallback">（英語）</span></strong>');
  }
  return html;
}

// October 20 independent review: normalize only the approved stale website-language FAQ correction.
// Exact reviewed Stats additions from production commit 69b3628 (October 30).
export function normalizeReviewedStatsCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
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
  html = normalizeReviewedJapaneseHomeIntegration(html);
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
  html = normalizeReviewedJapaneseHomeIntegration(html);
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
  html = normalizeReviewedJapaneseHomeIntegration(html);
  // LOC-03: exact new native navigation link and two parent-authored context paragraphs.
  html = html.replace("\n              <a href=\"/de/blog/freunde-um-geld-bitten/\">Freunde um Geld bitten</a>", "");
  html = html.replace("\n              <p>Noch vor der Auszahlung hilft eine klare Absprache. Hier findest du <a href=\"/de/blog/freunde-um-geld-bitten/\">Nachrichten, mit denen du Freunde um Geld bitten kannst</a>, ohne Druck zu machen.</p>", "");
  html = html.replace("\n<p>Möchtest du dir selbst Geld leihen? Nutze die <a href=\"/de/blog/freunde-um-geld-bitten/\">Nachrichten zum Bitten um Geld</a> und halte eine spätere Zusage getrennt vom tatsächlichen Geldeingang fest.</p>", "");
  return html;
}

export function normalizeReviewedArabicBorrowCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  // LOC-04: exact parent-approved native navigation and two context paragraphs.
  html = html.replace("\n              <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">طلب المال من صديق</a>", "");
  html = html.replace("\n              <p>قبل استلام المال، يساعدك الاتفاق الواضح على تجنب سوء الفهم. إليك <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">رسائل لطلب المال من صديق</a> دون ضغط.</p>", "");
  html = html.replace("\n<p>هل تريد أن تقترض المال بدلًا من طلب استرجاعه؟ استخدم <a href=\"/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/\">رسائل طلب المال من صديق</a>، وميّز بين الموافقة على الإقراض ووصول المبلغ فعلًا.</p>", "");
  return html;
}

export function normalizeReviewedFrenchBorrowCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  // LOC-05: only exact parent-approved French navigation and two context paragraphs.
  html = html.replace("\n              <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">Demander de l’argent à un ami</a>", "");
  html = html.replace("\n              <p>Avant le versement, une demande claire aide à poser les bases de l’accord. Retrouvez des <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">messages pour demander de l’argent à un ami</a> sans lui mettre la pression.</p>", "");
  html = html.replace("\n<p>Vous souhaitez emprunter de l’argent plutôt que demander un remboursement ? Consultez les <a href=\"/fr/blog/comment-demander-de-l-argent-a-un-ami/\">messages pour demander un prêt à un ami</a>, puis distinguez son accord de la réception effective de l’argent.</p>", "");
  return html;
}

// LOC-06: exact parent-authored Spanish discovery and the two inward paragraphs.
// Original snapshots remain immutable; any other source delta stays visible.
export function normalizeReviewedSpanishRoommateCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  return html
    .replace('\n              <a href="/es/herramientas/plantilla-gastos-piso-compartido/">Plantilla de gastos del piso compartido</a>', '')
    .replace('\n  <p>Si quieres conservar los gastos del piso y los pagos de varios periodos, utiliza la <a href="/es/herramientas/plantilla-gastos-piso-compartido/">plantilla de gastos para un piso compartido</a>. Incluye Excel y Google Sheets en español.</p>', '')
    .replace('\n  <p>Para los gastos de una vivienda compartida, esta <a href="/es/herramientas/plantilla-gastos-piso-compartido/">plantilla para compañeros de piso</a> separa los gastos originales, los pagos entre personas y el saldo pendiente.</p>', '');
}

// LOC-07: only the exact approved German navigation and two contextual paragraphs.
// Immutable historical snapshots stay pinned; all other source changes remain visible.
export function normalizeReviewedGermanRoommateCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  return html
    .replace("\n              <a href=\"/de/tools/wg-kasse-vorlage/\">WG-Kasse-Vorlage</a>", "")
    .replace("\n  <p>Wenn du WG-Ausgaben und Zahlungen über mehrere Zeiträume festhalten möchtest, nutze die <a href=\"/de/tools/wg-kasse-vorlage/\">WG-Kasse-Vorlage</a>. Sie enthält Excel, Google Sheets und eine einfache CSV-Liste auf Deutsch.</p>", "")
    .replace("            <p>Für gemeinsame Haushaltskosten hilft dir die <a href=\"/de/tools/wg-kasse-vorlage/\">WG-Kasse-Vorlage</a>, ursprüngliche Ausgaben, spätere Zahlungen und offene Beträge getrennt zu halten.</p>\n", "");
}

// LOC-08: exact approved Arabic navigation and two contextual paragraphs only.
// Historical release baselines remain pinned and all other changes stay visible.
export function normalizeReviewedArabicRoommateCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  return html
    .replace("\n              <a href=\"/ar/tools/roommate-expense-tracker-template/\">قالب مصاريف السكن</a>", "")
    .replace("\n  <p>إذا أردت الاحتفاظ بمصاريف السكن والدفعات عبر فترات متعددة، استخدم <a href=\"/ar/tools/roommate-expense-tracker-template/\">قالب مصاريف السكن المشترك</a>. يتضمن <bdi dir=\"ltr\">Excel</bdi> و<bdi dir=\"ltr\">Google Sheets</bdi> وسجل <bdi dir=\"ltr\">CSV</bdi> بسيطًا بالعربية.</p>", "")
    .replace("            <p>لمصاريف المنزل المشتركة، يساعدك <a href=\"/ar/tools/roommate-expense-tracker-template/\">قالب مصاريف السكن المشترك</a> على فصل المصاريف الأصلية والدفعات اللاحقة والمبالغ المتبقية.</p>\n", "");
}

// LOC-09: exact approved French navigation and two contextual paragraphs only.
// Keep every historical release baseline pinned.
export function normalizeReviewedFrenchRoommateCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  return html
    .replace("\n              <a href=\"/fr/outils/tableau-depenses-colocation/\">Dépenses de colocation</a>", "")
    .replace("\n              <p>Pour garder un historique des dépenses et des remboursements d’un mois sur l’autre, utilisez le <a href=\"/fr/outils/tableau-depenses-colocation/\">tableau des dépenses de colocation</a>. Il comprend des versions Excel et Google Sheets en français, ainsi qu’un registre CSV simple.</p>", "")
    .replace("            <p>Pour les dépenses de la maison, le <a href=\"/fr/outils/tableau-depenses-colocation/\">tableau des dépenses de colocation</a> distingue les dépenses d’origine, les remboursements et les montants restants.</p>\n", "");
}

export function normalizeReviewedLanguageCopy(html) {
  html = normalizeReviewedJapaneseHomeIntegration(html);
  html = normalizeReviewedFrenchRoommateCopy(html);
  html = normalizeReviewedArabicRoommateCopy(html);
  html = normalizeReviewedGermanRoommateCopy(html);
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
