import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { parseStaticPage } from "../tests/helpers/static-dom.mjs";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("tools/split-expense-calculator/index.html", root), "utf8");
const calculator = await readFile(new URL("scripts/split-expense-calculator.js", root), "utf8");
const analytics = await readFile(new URL("scripts/analytics.js", root), "utf8");
const styles = await readFile(new URL("styles/split-expense-calculator.css", root), "utf8");

const RESULT_APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";
const spanishLocale = await readFile(new URL("scripts/split-expense-locale.js", root), "utf8");
const transferScript = await readFile(new URL("scripts/tool-transfer.js", root), "utf8");
const germanCanonical = "https://you-owe-me.com/de/tools/ausgaben-aufteilen/";
const spanishCanonical = "https://you-owe-me.com/es/herramientas/calculadora-de-gastos-compartidos/";
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));

function localizedCalculator(lang = "es", options = {}) {
  const document = parseStaticPage(page);
  document.documentElement = { lang };
  if (lang === "de") document.querySelector('link[rel="canonical"]').setAttribute("href", germanCanonical);
  if (lang === "es") document.querySelector('link[rel="canonical"]').setAttribute("href", spanishCanonical);
  const copied = [], shared = [], events = [], requests = [], navigations = [], timers = [];
  const storage = new Map(options.storage || []);
  const window = {
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout(callback) { timers.push(callback); return timers.length; }, clearTimeout() {},
    dispatchEvent(event) { events.push(plain(event)); }, document,
  };
  const navigator = { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 1,
    clipboard: { async writeText(text) { if (options.clipboardFails) throw new Error("denied"); copied.push(text); } },
    async share(payload) { shared.push(payload); if (options.shareError) throw options.shareError; },
  };
  document.execCommand = () => {
    if (options.fallbackFails) return false;
    copied.push(document.querySelector("textarea").value); return true;
  };
  const context = vm.createContext({ window, document, navigator, crypto: webcrypto, AbortController,
    location: { assign(url) { navigations.push(url); } },
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    fetch: async (...args) => { requests.push(args); return options.fetch ? options.fetch(...args) : { ok: true }; },
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
  });
  vm.runInContext(spanishLocale, context);
  vm.runInContext(transferScript, context);
  vm.runInContext(calculator.replace('  if (document.readyState === "loading")',
    '  window.testCalculator = {state, calculate, render, formatNumber, parseAmount, buildSummaryText, renderExpenseValidation};\n  if (document.readyState === "loading")'), context);
  const query = selector => { const node = document.querySelector(selector); assert.ok(node, selector); return node; };
  const edit = (selector, value, type = "input") => {
    const node = query(selector); if (typeof value === "boolean") node.checked = value; else node.value = value;
    node.dispatchEvent({ type });
  };
  const action = name => query(`[data-action="${name}"]`).dispatchEvent({ type: "click" });
  return { document, window, api: window.testCalculator, query, edit, action, copied, shared, events, requests, navigations, storage, timers };
}

test("Spanish dictionary covers every generated phrase and retains interpolation fields", () => {
  const root = { window: {} }; vm.runInNewContext(spanishLocale, root);
  const messages = root.window.UomiSplitExpenseLocale;
  for (const [, english] of calculator.matchAll(/translate\("([^"]+)"/g)) {
    assert.ok(messages[english], `missing Spanish: ${english}`);
    assert.deepEqual([...english.matchAll(/\{\w+\}/g)].map(m => m[0]).sort(), [...messages[english].matchAll(/\{\w+\}/g)].map(m => m[0]).sort());
  }
});

test("Spanish calculator localizes generated names, rows, validation and empty/settled results", () => {
  const env = localizedCalculator();
  assert.equal(env.api.state.currency, "$");
  assert.equal(env.api.state.people[0].name, "Persona 1");
  assert.equal(env.api.state.expenses[0].description, "Cena");
  assert.equal(env.query("[data-people-summary]").textContent, "Personas (3): editar nombres o quitar personas");
  assert.equal(env.query(".remove-action").getAttribute("aria-label"), "Quitar a Persona 1");
  assert.equal(env.query(`#description-${env.api.state.expenses[0].id}`).placeholder, "Cena, alimentos, alquiler, taxi…");
  assert.match(env.query("[data-settlement]").textContent, /Persona 2 debe \$30 a Persona 1/);
  const expense = env.api.state.expenses[0];
  env.edit(`#amount-${expense.id}`, "-1");
  assert.match(env.query(".expense-validation").textContent, /mayor que cero/);
  assert.match(env.query("[data-settlement]").textContent, /Añade un gasto/);
  expense.amount = "12.50"; expense.includedPeople = []; env.api.render();
  assert.match(env.query(".expense-validation").textContent, /Selecciona al menos una persona/);
  expense.includedPeople = [expense.paidBy]; env.api.render();
  assert.equal(env.query("[data-settlement]").textContent, "Todas las cuentas están saldadas.");
  assert.match(env.query("[data-result-app-message]").textContent, /Este reparto está saldado/);
  expense.paidBy = "unknown";
  env.api.renderExpenseValidation(expense, env.query(".expense-card"));
  assert.equal(env.query(".expense-validation").textContent, "Elige quién pagó este gasto.");
});

test("Spanish display changes decimal formatting while numerical results, input and currency semantics match English", () => {
  const spanish = localizedCalculator(), english = localizedCalculator("en");
  for (const amount of ["0.29", "10.01", "1234.56", "1,234.56"]) {
    const state = { currency: "MXN", people: [{ id: "a", name: "Alex" }, { id: "b", name: "Mía" }, { id: "c", name: "Sam" }], expenses: [
      { id: "one", amount, description: "Dinner", paidBy: "a", includedPeople: ["a", "b", "c"] },
      { id: "two", amount: "0.1", description: "Taxi", paidBy: "b", includedPeople: ["a", "b"] },
    ] };
    Object.assign(spanish.api.state, plain(state)); Object.assign(english.api.state, plain(state));
    assert.deepEqual(plain(spanish.api.calculate()), plain(english.api.calculate()));
    assert.equal(spanish.api.parseAmount(amount), english.api.parseAmount(amount));
    assert.equal(spanish.api.state.currency, "MXN");
  }
  assert.equal(spanish.api.formatNumber(12.5), "12,5");
  assert.equal(english.api.formatNumber(12.5), "12.5");
  assert.equal(spanish.api.parseAmount("12,50"), english.api.parseAmount("12,50"));
  assert.equal(spanish.api.parseAmount("12,50"), 1250, "legacy parsing stays unchanged; HTML explains dot input");
});

test("Spanish copy/share use the authored canonical, Spanish summaries/statuses and unchanged fixed events", async () => {
  const env = localizedCalculator();
  env.edit("#currency-symbol", "EUR");
  env.action("copy-summary"); await flush();
  assert.match(env.copied[0], /Resumen de gastos compartidos/);
  assert.match(env.copied[0], /Parte correspondiente:/);
  assert.match(env.copied[0], /Persona 2 debe EUR 30 a Persona 1/);
  assert.ok(env.copied[0].endsWith(spanishCanonical));
  assert.equal(env.query("[data-copy-status]").textContent, "Se han copiado el resumen y el enlace de la calculadora.");
  env.action("share-summary"); await flush();
  assert.equal(env.shared[0].url, spanishCanonical);
  assert.equal(env.shared[0].title, "Resumen de gastos compartidos");
  assert.equal(env.query("[data-copy-status]").textContent, "Resultado compartido.");
  for (const event of env.events) assert.deepEqual(Object.keys(event.detail), ["eventName"]);
  assert.ok(env.events.some(event => event.detail.eventName === "split_summary_shared"));
  env.action("clear-all"); env.action("copy-summary"); await flush();
  assert.equal(env.query("[data-copy-status]").textContent, "Añade un gasto antes de copiar el resumen.");
  env.action("share-summary"); await flush();
  assert.equal(env.query("[data-copy-status]").textContent, "Añade un gasto antes de compartir el resumen.");
});

test("Spanish clipboard/share fallbacks and cancellation report the appropriate localized state", async () => {
  const fallback = localizedCalculator("es", { clipboardFails: true, shareError: new Error("unavailable") });
  fallback.action("share-summary"); await flush();
  assert.match(fallback.copied[0], /Resumen de gastos compartidos/);
  assert.equal(fallback.query("[data-copy-status]").textContent, "No se pudo compartir; se ha copiado el resultado.");
  const denied = localizedCalculator("es", { clipboardFails: true, fallbackFails: true, shareError: new Error("unavailable") });
  denied.action("copy-summary"); await flush();
  assert.equal(denied.query("[data-copy-status]").textContent, "No se pudo copiar el resultado.");
  denied.action("share-summary"); await flush();
  assert.equal(denied.query("[data-copy-status]").textContent, "No se pudo compartir ni copiar el resultado.");
  assert.ok(!denied.events.some(event => /copied|shared/.test(event.detail.eventName)));
  const cancelled = localizedCalculator("es", { shareError: { name: "AbortError" } });
  cancelled.action("share-summary"); await flush();
  assert.equal(cancelled.query("[data-copy-status]").textContent, "");
  assert.equal(cancelled.copied.length, 0);
});

test("Spanish limits and example/reset preserve established calculator state behavior", () => {
  const env = localizedCalculator();
  env.action("use-example");
  assert.deepEqual(plain(env.api.state.expenses.map(expense => expense.description)), ["Alimentos", "Cena", "Taxi"]);
  assert.equal(env.api.calculate().total, 180);
  env.action("clear-all");
  assert.equal(env.api.state.currency, "$");
  assert.equal(env.api.state.expenses[0].amount, "");
  env.query(".remove-action").dispatchEvent({ type: "click" });
  env.query(".remove-action").dispatchEvent({ type: "click" });
  assert.equal(env.query("#people-message").textContent, "Añade al menos dos personas para repartir un gasto.");
  for (let i = 0; i < 11; i++) env.action("add-person");
  assert.equal(env.api.state.people.length, 12);
  assert.equal(env.query("#people-message").textContent, "Puedes añadir hasta 12 personas.");
  for (let i = 0; i < 30; i++) env.action("add-expense");
  assert.equal(env.api.state.expenses.length, 30);
  assert.equal(env.query("#people-message").textContent, "Puedes añadir hasta 30 gastos.");
});

test("Spanish transfer preserves exact draft cents/schema and sole ref while language travels only in fragment", async () => {
  const env = localizedCalculator();
  env.edit("#currency-symbol", "MXN");
  env.api.state.people.forEach(person => { person.name = ""; });
  env.api.state.expenses[0].description = "";
  const draft = env.window.UomiToolTransfer.prepare(env.api.state);
  assert.equal(draft.participants[0].name, "Persona 1");
  assert.equal(draft.costs[0].label, "Gasto compartido");
  assert.equal(draft.costs[0].amount, 9000);
  assert.equal(draft.currencyLabel, "MXN");
  env.action("track-split");
  assert.equal(env.query("[data-transfer-status]").textContent, "Preparando el reparto…");
  await flush();
  const request = JSON.parse(env.requests[0][1].body);
  assert.deepEqual(Object.keys(request).sort(), ["action", "draft", "reference"]);
  assert.deepEqual(request.draft, plain(draft));
  const url = new URL(env.navigations[0]);
  assert.equal(url.origin + url.pathname, env.window.UomiToolTransfer.config.continuation);
  assert.deepEqual([...url.searchParams.keys()], ["ref"]);
  assert.match(url.searchParams.get("ref"), /^[a-f0-9]{64}$/);
  assert.equal(url.hash, "#es");
  const restored = localizedCalculator("es", { storage: [...env.storage] });
  assert.equal(restored.api.state.currency, "MXN");
  assert.equal(restored.api.state.expenses[0].amount, "90");
  assert.equal(restored.storage.size, 0);
  const failed = localizedCalculator("es", { fetch: async () => ({ ok: false, status: 503 }) });
  failed.edit("#currency-symbol", "USD"); failed.action("track-split"); await flush();
  assert.equal(failed.navigations.length, 0);
  assert.match(failed.query("[data-transfer-status]").textContent, /Tu reparto sigue aquí/);
});

test("Spanish transfer eligibility and cents match the existing shared financial fixture matrix", async () => {
  const spanish = localizedCalculator(), english = localizedCalculator("en");
  const fixtures = JSON.parse(await readFile(new URL("tests/fixtures/tool-transfer-fixtures.json", root), "utf8"));
  for (const fixture of fixtures) {
    const state = { currency: fixture.draft.currencyLabel, people: fixture.draft.participants,
      expenses: fixture.draft.costs.map(cost => ({ id: cost.id, description: cost.label,
        amount: (cost.amount / 100).toFixed(2), paidBy: cost.payerID, includedPeople: cost.participantIDs })) };
    const spanishDraft = spanish.window.UomiToolTransfer.prepare(state);
    const englishDraft = english.window.UomiToolTransfer.prepare(state);
    assert.deepEqual(plain(spanishDraft), plain(englishDraft), fixture.name);
    if (fixture.expected) assert.deepEqual(plain(spanishDraft), fixture.draft, fixture.name);
    else assert.equal(spanishDraft, null, fixture.name);
  }
  const halfCent = { currency: "$", people: [{ id: "a", name: "Alex" }, { id: "b", name: "Mia" }], expenses: [
    { id: "one", description: "Taxi", amount: "0.29", paidBy: "a", includedPeople: ["a", "b"] },
  ] };
  assert.equal(spanish.window.UomiToolTransfer.prepare(halfCent), null);
  halfCent.expenses[0].amount = "90";
  halfCent.expenses.push({ ...halfCent.expenses[0], id: "two", paidBy: "b" });
  assert.equal(spanish.window.UomiToolTransfer.prepare(halfCent), null);
});

test("the initial result actions preserve the attributed App Store CTA", () => {
  const actionsIndex = page.indexOf('data-result-actions hidden');
  const resultLinkIndex = page.indexOf('data-track-location="split_expense_result_app_store_cta"');

  assert.ok(actionsIndex >= 0, "result actions start hidden in initial HTML");
  assert.ok(resultLinkIndex > actionsIndex, "result App Store link remains inside result actions");
  assert.match(styles, /\.split-result-actions\[hidden\]\s*\{\s*display: none !important;/);
  assert.match(styles, /\.split-result-action\[hidden\]\s*\{\s*display: none !important;/);
  assert.ok(page.includes(RESULT_APP_STORE_URL));
  assert.match(page, /data-source-cluster="shared-expenses"/);
  assert.match(page, /aria-label="Download You Owe Me on the App Store for ongoing shared expenses and repayments"/);
  assert.match(page, /<img[^>]+alt="Download You Owe Me on the App Store"/);
});

test("results put settlement first, then actions, then a native breakdown disclosure", () => {
  const settlementIndex = page.indexOf('class="result-block settlement-block"');
  const actionsIndex = page.indexOf('data-result-actions hidden');
  const detailsIndex = page.indexOf('<details class="split-result-breakdown">');
  assert.ok(settlementIndex >= 0 && settlementIndex < actionsIndex && actionsIndex < detailsIndex);

  for (const requiredCopy of [
    "Copy summary",
    "Share result",
    "See calculation details",
    "Free download &middot; In-app purchases available",
    "See how shared tracking works",
    "Since 2016",
    "Actively maintained.",
  ]) {
    assert.ok(page.includes(requiredCopy), `missing required copy: ${requiredCopy}`);
  }

  for (const selector of ["data-summary", "data-paid", "data-share", "data-net", "data-settlement", "data-copy-status", "data-result-actions"]) {
    assert.equal((page.match(new RegExp(`${selector}(?=\\s|>)`, "g")) ?? []).length, 1, `one ${selector} hook remains`);
  }
  assert.equal((page.match(/data-action="copy-summary"/g) ?? []).length, 1);
  assert.equal((page.match(/data-action="share-summary"/g) ?? []).length, 1);
  assert.match(page, /<details class="split-result-breakdown">[\s\S]*?<summary>See calculation details<\/summary>[\s\S]*?data-summary[\s\S]*?data-paid[\s\S]*?data-share[\s\S]*?data-net/);
  assert.doesNotMatch(page, /Choose what happens next|Settling this split now\?|Will expenses or repayments continue\?/);
  assert.match(calculator, /els\.resultAppTitle = getRequiredElement\("\[data-result-app-title\]"\)/);
  assert.match(calculator, /els\.resultAppMessage = getRequiredElement\("\[data-result-app-message\]"\)/);
  assert.match(calculator, /result\.transfers\.length > 0[\s\S]*?Keep track until everyone has paid[\s\S]*?Keep future shared costs in one place/);

  assert.match(page, /<meta name="apple-itunes-app" content="app-id=1147058670, affiliate-data=pt=117888502&amp;ct=website_smart_banner"/);
  assert.match(page, /data-track-location="split_calculator_final_primary_cta"/);
});

test("summary, copy, and share use one canonical calculator URL", () => {
  assert.match(calculator, /const CANONICAL_CALCULATOR_URL = localizedStrings/);
  assert.match(calculator, /document\.querySelector\('link\[rel="canonical"\]'\)\.getAttribute\("href"\)/);
  assert.match(calculator, /Calculate your own split: \{url\}.*url: CANONICAL_CALCULATOR_URL/);
  assert.match(calculator, /title: translate\("Shared expense summary"\)/);
  assert.match(calculator, /url: CANONICAL_CALCULATOR_URL/);
  assert.match(calculator, /Copied summary and calculator link\./);
  assert.match(calculator, /Sharing wasn’t available, so the result was copied\./);
});

test("calculator events are sanitized fixed actions with no result payload", () => {
  assert.match(calculator, /const SPLIT_CALCULATOR_EVENT = "youoweme:split-calculator-event"/);
  assert.match(calculator, /detail: \{ eventName \}/);
  assert.doesNotMatch(calculator, /detail:\s*\{[^}]+(?:name|amount|summary|clipboard|description)/);

  for (const [action, firebaseEvent] of [
    ["split_result_ready", "uomi_web_split_result_ready"],
    ["split_summary_copied", "uomi_web_split_summary_copied"],
    ["split_summary_shared", "uomi_web_split_summary_shared"],
    ["split_share_fallback_copied", "uomi_web_split_share_fallback_copied"],
  ]) {
    assert.match(analytics, new RegExp(`${action}: "${firebaseEvent}"`));
  }

  assert.match(analytics, /const SPLIT_CALCULATOR_EVENT = "youoweme:split-calculator-event"/);
  assert.match(analytics, /const firebaseEventName = SPLIT_CALCULATOR_EVENTS\[eventName\];/);
  assert.match(analytics, /void trackEvent\(firebaseEventName\);/);
  assert.doesNotMatch(analytics, /trackEvent\(firebaseEventName,/);
});

test("result-ready remains an explicit, once-per-page-load milestone", () => {
  assert.match(calculator, /let resultReadyEmitted = false;/);
  assert.match(calculator, /const shouldShow = hasExplicitInteraction && hasValidResult\(result\);/);
  assert.match(calculator, /if \(resultReadyEmitted\) return;/);
  assert.match(calculator, /resultReadyEmitted = true;\s*dispatchCalculatorEvent\("split_result_ready"\);/);
  assert.match(calculator, /if \(error && error\.name === "AbortError"\) return;/);
});

test("iOS fallback and desktop QR leave App Clip eligibility intact", () => {
  assert.match(calculator, /function isDesktopIphoneHandoffEligible\(\)[\s\S]*?platform === "MacIntel"[\s\S]*?maxTouchPoints[\s\S]*?\(min-width: 768px\)[\s\S]*?\(hover: hover\) and \(pointer: fine\)/);
  assert.match(calculator, /area\.hidden = !\(allowed && iphone && meaningfulEdit && supported\);/);
  assert.match(calculator, /appCard\.hidden = !\(shouldShow && area\.hidden && \(ios \|\| isDesktopIphoneHandoffEligible\(\)\)\);/);
  assert.match(calculator, /mediaQuery\.addEventListener\("change", refreshResultContinuationForViewport\)/);
});


test("valid iOS results retain an app destination when transfer is unavailable", () => {
  const start = calculator.indexOf("  function renderTransferOffer(shouldShow)");
  const end = calculator.indexOf("  function refreshResultContinuationForViewport", start);
  const source = calculator.slice(start, end);
  const cases = [
    { name: "iPhone multiple payers", ua: "iPhone", supported: false, show: true, card: true, transfer: false },
    { name: "iPhone disabled transfer", ua: "iPhone", supported: true, enabled: false, show: true, card: true, transfer: false },
    { name: "iPhone example result", ua: "iPhone", supported: true, edited: false, show: true, card: true, transfer: false },
    { name: "iPhone eligible transfer", ua: "iPhone", supported: true, show: true, card: false, transfer: true },
    { name: "before interaction", ua: "iPhone", supported: false, show: false, card: false, transfer: false },
    { name: "iPad desktop UA", ua: "Macintosh", platform: "MacIntel", touch: 5, supported: true, show: true, card: true, transfer: false },
    { name: "desktop QR", ua: "Windows NT", desktop: true, supported: true, show: true, card: true, transfer: false },
    { name: "Android tool", ua: "Android Mobile", supported: true, show: true, card: false, transfer: false },
  ];
  for (const scenario of cases) {
    const area = { hidden: true }, card = { hidden: true }, events = [];
    const context = {
      document: { querySelector(selector) { return selector === "[data-tool-transfer]" ? area : card; } },
      window: { UomiToolTransfer: { config: { enabled: scenario.enabled !== false }, prepare: () => scenario.supported } },
      navigator: { userAgent: scenario.ua, platform: scenario.platform || "", maxTouchPoints: scenario.touch || 0 },
      transferState: () => ({}),
      state: {}, meaningfulEdit: scenario.edited !== false, transferExposureEmitted: false,
      isDesktopIphoneHandoffEligible: () => Boolean(scenario.desktop),
      dispatchCalculatorEvent: (event) => events.push(event),
    };
    vm.runInNewContext(source + `\nrenderTransferOffer(${scenario.show}); renderTransferOffer(${scenario.show});`, context);
    assert.equal(!card.hidden, scenario.card, scenario.name + " app fallback");
    assert.equal(!area.hidden, scenario.transfer, scenario.name + " transfer");
    assert.equal(events.length, scenario.transfer ? 1 : 0, scenario.name + " exposure count");
  }
});


test("German dictionary covers every generated phrase and preserves interpolation fields", () => {
  const context = { window: { document: { documentElement: { lang: "de" } } } };
  vm.runInNewContext(spanishLocale, context);
  const dictionaries = context.window.UomiSplitExpenseLocales;
  assert.equal(context.window.UomiSplitExpenseLocale, dictionaries.de);
  assert.deepEqual(Object.keys(dictionaries.de).sort(), Object.keys(dictionaries.es).sort());
  for (const [, english] of calculator.matchAll(/translate\("([^"]+)"/g)) {
    assert.ok(dictionaries.de[english], `missing German: ${english}`);
    assert.deepEqual([...english.matchAll(/\{\w+\}/g)].map(m => m[0]).sort(), [...dictionaries.de[english].matchAll(/\{\w+\}/g)].map(m => m[0]).sort());
  }
});

test("German generated fields, accessibility, validation, empty and settled states are localized", () => {
  const env = localizedCalculator("de");
  assert.equal(env.api.state.currency, "$");
  assert.equal(env.api.state.people[0].name, "Person 1");
  assert.equal(env.api.state.expenses[0].description, "Abendessen");
  assert.equal(env.query("[data-people-summary]").textContent, "Personen (3): Namen ändern oder Personen entfernen");
  assert.equal(env.query(".remove-action").getAttribute("aria-label"), "Person 1 entfernen");
  assert.match(env.query("[data-settlement]").textContent, /Person 2 schuldet Person 1 30 \$/);
  const expense = env.api.state.expenses[0];
  assert.equal(env.query(`#description-${expense.id}`).placeholder, "Abendessen, Lebensmittel, Miete, Taxi …");
  env.edit(`#amount-${expense.id}`, "-1");
  assert.equal(env.query(".expense-validation").textContent, "Gib einen Betrag größer als null ein.");
  assert.equal(env.query("[data-settlement]").textContent, "Füge eine Ausgabe hinzu, um zu sehen, wer wem wie viel schuldet.");
  expense.amount = "12.50"; expense.includedPeople = []; env.api.render();
  assert.equal(env.query(".expense-validation").textContent, "Wähle mindestens eine Person aus, auf die diese Ausgabe aufgeteilt wird.");
  expense.includedPeople = [expense.paidBy]; env.api.render();
  assert.equal(env.query("[data-settlement]").textContent, "Alle Salden sind ausgeglichen.");
  assert.match(env.query("[data-result-app-message]").textContent, /Diese Aufteilung ist ausgeglichen/);
  expense.paidBy = "unknown"; env.api.renderExpenseValidation(expense, env.query(".expense-card"));
  assert.equal(env.query(".expense-validation").textContent, "Wähle aus, wer diese Ausgabe bezahlt hat.");
});

test("German formatting preserves English/Spanish financial math, parsing, and currency labels", () => {
  const german = localizedCalculator("de"), spanish = localizedCalculator(), english = localizedCalculator("en");
  for (const amount of ["0.29", "10.01", "1234.56", "1,234.56"]) {
    const state = { currency: "MXN", people: [{ id: "a", name: "Alex" }, { id: "b", name: "Mia" }, { id: "c", name: "Sam" }], expenses: [
      { id: "one", amount, description: "Dinner", paidBy: "a", includedPeople: ["a", "b", "c"] },
      { id: "two", amount: "0.1", description: "Taxi", paidBy: "b", includedPeople: ["a", "b"] },
    ] };
    for (const env of [german, spanish, english]) Object.assign(env.api.state, plain(state));
    assert.deepEqual(plain(german.api.calculate()), plain(english.api.calculate()));
    assert.deepEqual(plain(spanish.api.calculate()), plain(english.api.calculate()));
    assert.equal(german.api.parseAmount(amount), english.api.parseAmount(amount));
  }
  assert.equal(german.api.formatNumber(1234.56), "1.234,56");
  assert.equal(german.api.parseAmount("12,50"), 1250, "legacy dot input unchanged");
  german.action("use-example");
  assert.equal(german.api.calculate().total, 180);
  assert.deepEqual(plain(german.api.state.expenses.map(expense => expense.description)), ["Lebensmittel", "Abendessen", "Taxi"]);
  assert.match(german.query("[data-settlement]").textContent, /Sam schuldet Alex 25 \$Sam schuldet Mia 10 \$/);
  german.action("clear-all"); for (let i = 0; i < 5; i++) german.action("add-person");
  german.edit(`#amount-${german.api.state.expenses[0].id}`, "98"); german.edit("#currency-symbol", "USD");
  assert.equal(german.api.calculate().transfers.length, 7);
  assert.ok(german.api.calculate().transfers.every(transfer => transfer.amount === 12.25));
  assert.match(german.api.buildSummaryText(german.api.calculate()), /12,25 USD/);
  assert.equal(german.api.state.currency, "USD");
});

test("German copy/share, clipboard fallback, cancellation and errors preserve privacy and canonical", async () => {
  const env = localizedCalculator("de"); env.edit("#currency-symbol", "USD");
  env.action("copy-summary"); await flush();
  assert.match(env.copied[0], /^Zusammenfassung der gemeinsamen Ausgaben/);
  assert.match(env.copied[0], /Gemeinsame Ausgaben insgesamt: 90 USD/);
  assert.ok(env.copied[0].endsWith(germanCanonical));
  assert.equal(env.query("[data-copy-status]").textContent, "Zusammenfassung und Link zum Rechner kopiert.");
  env.action("share-summary"); await flush();
  assert.equal(env.shared[0].url, germanCanonical);
  assert.equal(env.shared[0].title, "Zusammenfassung der gemeinsamen Ausgaben");
  assert.equal(env.query("[data-copy-status]").textContent, "Ergebnis geteilt.");
  for (const event of env.events) assert.deepEqual(Object.keys(event.detail), ["eventName"]);
  env.action("clear-all"); env.action("copy-summary"); await flush();
  assert.equal(env.query("[data-copy-status]").textContent, "Füge eine Ausgabe hinzu, bevor du die Zusammenfassung kopierst.");
  env.action("share-summary"); await flush();
  assert.equal(env.query("[data-copy-status]").textContent, "Füge eine Ausgabe hinzu, bevor du die Zusammenfassung teilst.");
  const fallback = localizedCalculator("de", { clipboardFails: true, shareError: new Error("unavailable") });
  fallback.action("share-summary"); await flush();
  assert.equal(fallback.query("[data-copy-status]").textContent, "Teilen war nicht möglich. Das Ergebnis wurde kopiert.");
  assert.match(fallback.copied[0], /^Zusammenfassung der gemeinsamen Ausgaben/);
  const failed = localizedCalculator("de", { clipboardFails: true, fallbackFails: true, shareError: new Error("unavailable") });
  failed.action("copy-summary"); await flush();
  assert.equal(failed.query("[data-copy-status]").textContent, "Das Ergebnis konnte nicht kopiert werden.");
  failed.action("share-summary"); await flush();
  assert.equal(failed.query("[data-copy-status]").textContent, "Das Ergebnis konnte weder geteilt noch kopiert werden.");
  assert.ok(!failed.events.some(event => /copied|shared/.test(event.detail.eventName)));
  const cancelled = localizedCalculator("de", { shareError: { name: "AbortError" } });
  cancelled.action("share-summary"); await flush();
  assert.equal(cancelled.query("[data-copy-status]").textContent, ""); assert.equal(cancelled.copied.length, 0);
});

test("German reset and capacity states retain the established limits", () => {
  const env = localizedCalculator("de"); env.action("clear-all");
  assert.equal(env.api.state.currency, "$"); assert.equal(env.api.state.expenses[0].amount, "");
  env.query(".remove-action").dispatchEvent({ type: "click" }); env.query(".remove-action").dispatchEvent({ type: "click" });
  assert.equal(env.query("#people-message").textContent, "Zum Aufteilen einer Ausgabe brauchst du mindestens zwei Personen.");
  for (let i = 0; i < 11; i++) env.action("add-person");
  assert.equal(env.api.state.people.length, 12);
  assert.equal(env.query("#people-message").textContent, "Du kannst bis zu 12 Personen hinzufügen.");
  for (let i = 0; i < 30; i++) env.action("add-expense");
  assert.equal(env.api.state.expenses.length, 30);
  assert.equal(env.query("#people-message").textContent, "Du kannst bis zu 30 Ausgaben hinzufügen.");
});

test("German transfer preserves cents/schema, consent, sole ref, retry and Back restoration", async () => {
  let attempts = 0;
  const env = localizedCalculator("de", { fetch: async () => ({ ok: ++attempts > 1, status: 503 }) });
  assert.equal(env.requests.length, 0);
  env.edit("#currency-symbol", "MXN"); env.api.state.people.forEach(person => { person.name = ""; });
  env.api.state.expenses[0].description = "";
  const draft = env.window.UomiToolTransfer.prepare(env.api.state);
  assert.equal(draft.participants[0].name, "Person 1"); assert.equal(draft.costs[0].label, "Gemeinsame Ausgabe");
  assert.equal(draft.currencyLabel, "MXN"); assert.equal(draft.costs[0].amount, 9000);
  env.action("track-split");
  assert.equal(env.query("[data-transfer-status]").textContent, "Deine Aufteilung wird vorbereitet …");
  await flush(); assert.equal(env.navigations.length, 0);
  assert.match(env.query("[data-transfer-status]").textContent, /Deine Aufteilung ist noch hier/);
  env.action("track-split"); await flush();
  const request = JSON.parse(env.requests[1][1].body);
  assert.deepEqual(Object.keys(request).sort(), ["action", "draft", "reference"]);
  assert.deepEqual(request.draft, plain(draft));
  assert.equal(request.reference, JSON.parse(env.requests[0][1].body).reference);
  const url = new URL(env.navigations[0]);
  assert.equal(url.origin + url.pathname, env.window.UomiToolTransfer.config.continuation);
  assert.deepEqual([...url.searchParams.keys()], ["ref"]); assert.match(url.searchParams.get("ref"), /^[a-f0-9]{64}$/);
  assert.equal(url.hash, "#de");
  const restored = localizedCalculator("de", { storage: [...env.storage] });
  assert.equal(restored.api.state.currency, "MXN"); assert.equal(restored.api.state.expenses[0].amount, "90"); assert.equal(restored.storage.size, 0);
});

test("German transfer eligibility matches existing financial fixtures and English/Spanish", async () => {
  const german = localizedCalculator("de"), spanish = localizedCalculator(), english = localizedCalculator("en");
  for (const fixture of JSON.parse(await readFile(new URL("tests/fixtures/tool-transfer-fixtures.json", root), "utf8"))) {
    const state = { currency: fixture.draft.currencyLabel, people: fixture.draft.participants,
      expenses: fixture.draft.costs.map(cost => ({ id: cost.id, description: cost.label, amount: (cost.amount / 100).toFixed(2), paidBy: cost.payerID, includedPeople: cost.participantIDs })) };
    const draft = german.window.UomiToolTransfer.prepare(state);
    assert.deepEqual(plain(draft), plain(english.window.UomiToolTransfer.prepare(state)), fixture.name);
    assert.deepEqual(plain(draft), plain(spanish.window.UomiToolTransfer.prepare(state)), fixture.name);
    if (fixture.expected) assert.deepEqual(plain(draft), fixture.draft, fixture.name); else assert.equal(draft, null, fixture.name);
  }
});

test("English and Spanish default summaries retain exact accepted text, order and monetary formatting", () => {
  const english = localizedCalculator("en"), spanish = localizedCalculator("es");
  assert.equal(english.api.buildSummaryText(english.api.calculate()), [
    "Shared expense summary", "", "Total shared expenses: $90", "", "Paid:",
    "Person 1 paid $90", "Person 2 paid $0", "Person 3 paid $0", "", "Fair share:",
    "Person 1's share: $30", "Person 2's share: $30", "Person 3's share: $30", "", "Settlement:",
    "Person 2 owes Person 1 $30", "Person 3 owes Person 1 $30", "",
    "Calculate your own split: https://you-owe-me.com/tools/split-expense-calculator/",
  ].join("\n"));
  assert.equal(spanish.api.buildSummaryText(spanish.api.calculate()), [
    "Resumen de gastos compartidos", "", "Gastos compartidos totales: $90", "", "Pagado:",
    "Persona 1 pagó $90", "Persona 2 pagó $0", "Persona 3 pagó $0", "", "Parte correspondiente:",
    "Parte de Persona 1: $30", "Parte de Persona 2: $30", "Parte de Persona 3: $30", "", "Quién debe a quién:",
    "Persona 2 debe $30 a Persona 1", "Persona 3 debe $30 a Persona 1", "",
    "Calcula tu propio reparto: " + spanishCanonical,
  ].join("\n"));
});
