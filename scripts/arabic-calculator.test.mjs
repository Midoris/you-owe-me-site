import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { parseStaticPage } from "../tests/helpers/static-dom.mjs";
const root = new URL("../", import.meta.url);
const page = await readFile(new URL("tools/split-expense-calculator/index.html", root), "utf8");
const calculator = await readFile(new URL("scripts/split-expense-calculator.js", root), "utf8");
const spanishLocale = await readFile(new URL("scripts/split-expense-locale.js", root), "utf8");
const transferScript = await readFile(new URL("scripts/tool-transfer.js", root), "utf8");
const arabicInput = await readFile(new URL("scripts/arabic-number-input.js", root), "utf8");
const arabicCanonical = "https://you-owe-me.com/ar/tools/split-expense-calculator/";
const germanCanonical = "https://you-owe-me.com/de/tools/ausgaben-aufteilen/";
const spanishCanonical = "https://you-owe-me.com/es/herramientas/calculadora-de-gastos-compartidos/";
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));
const arabicDigits = value => String(value).replace(/\d/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]).replaceAll(".", "٫");
function localizedCalculator(lang = "ar", options = {}) {
  const document = parseStaticPage(page);
  document.documentElement = { lang };
  if (lang === "de") document.querySelector('link[rel="canonical"]').setAttribute("href", germanCanonical);
  if (lang === "es") document.querySelector('link[rel="canonical"]').setAttribute("href", spanishCanonical);
  if (lang === "ar") document.querySelector('link[rel="canonical"]').setAttribute("href", arabicCanonical);
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
  vm.runInContext(arabicInput, context);
  vm.runInContext(spanishLocale, context);
  vm.runInContext(transferScript, context);
  vm.runInContext(calculator.replace('  if (document.readyState === "loading")',
    '  window.testCalculator = {state, calculate, render, formatNumber, parseAmount, buildSummaryText, renderExpenseValidation, transferState};\n  if (document.readyState === "loading")'), context);
  const query = selector => { const node = document.querySelector(selector); assert.ok(node, selector); return node; };
  const edit = (selector, value, type = "input") => {
    const node = query(selector); if (typeof value === "boolean") node.checked = value; else node.value = value;
    node.dispatchEvent({ type });
  };
  const action = name => query(`[data-action="${name}"]`).dispatchEvent({ type: "click" });
  return { document, window, api: window.testCalculator, query, edit, action, copied, shared, events, requests, navigations, storage, timers };
}

test("Arabic digits preserve the complete existing calculator and native-fixture financial contracts", async () => {
  const arabic = localizedCalculator(), english = localizedCalculator("en");
  const fixtures = JSON.parse(await readFile(new URL("tests/fixtures/tool-transfer-fixtures.json", root), "utf8"));
  for (const fixture of fixtures) {
    const state = { currency: fixture.draft.currencyLabel, people: fixture.draft.participants,
      expenses: fixture.draft.costs.map(cost => ({ id: cost.id, description: cost.label,
        amount: (cost.amount / 100).toFixed(2), paidBy: cost.payerID, includedPeople: cost.participantIDs })) };
    Object.assign(english.api.state, plain(state));
    state.expenses.forEach(expense => { expense.amount = arabicDigits(expense.amount); });
    Object.assign(arabic.api.state, plain(state));
    assert.deepEqual(plain(arabic.api.calculate()), plain(english.api.calculate()), fixture.name);
    const arDraft = arabic.window.UomiToolTransfer.prepare(arabic.api.transferState());
    const enDraft = english.window.UomiToolTransfer.prepare(english.api.state);
    assert.deepEqual(plain(arDraft), plain(enDraft), fixture.name);
    if (fixture.expected) assert.deepEqual(plain(arDraft), fixture.draft, fixture.name);
    else assert.equal(arDraft, null, fixture.name);
    assert.equal(arabic.api.state.expenses[0].amount, state.expenses[0].amount, "Canonical transfer clone must not rewrite raw state");
  }
  for (const lang of ["en", "es", "de"]) {
    const env = localizedCalculator(lang);
    assert.equal(env.api.parseAmount("12,50"), 1250, `${lang} retains established parsing`);
    assert.equal(env.api.transferState(), env.api.state, `${lang} does not normalize native inputs`);
  }
});

test("Arabic malformed input is invalid in both calculation and native preparation without silent reinterpretation", () => {
  const env = localizedCalculator();
  const expense = env.api.state.expenses[0];
  for (const raw of ["1,2", "١٬٢٣", "1.234,50", "١٫٢٫٣", "١٬٢٣٤.٥٠", "Infinity", "NaN", "٩٠ ريال", "-١", "0", "٠٫٠٠"]) {
    expense.amount = raw; env.api.render();
    assert.equal(env.api.calculate().validCount, 0, raw);
    assert.equal(env.window.UomiToolTransfer.prepare(env.api.transferState()), null, raw);
    assert.equal(env.query(`#amount-${expense.id}`).getAttribute("aria-invalid"), "true", raw);
    assert.match(env.query(".expense-validation").textContent, /[\u0600-\u06ff]/, raw);
    assert.equal(expense.amount, raw);
  }
  for (const [raw, expected] of [["٩٠٫٥٠",90.5],["۹۰٫۵۰",90.5],["١٬٢٣٤٫٥٠",1234.5],["1,234.50",1234.5]]) assert.equal(env.api.parseAmount(raw), expected);
});

test("Mixed names receive semantic DOM isolation and only presentation summaries receive balanced Unicode isolates", () => {
  const env = localizedCalculator();
  const names = ["أحمد (Alex 2)", "Mia — مريم", "سام Sam"];
  env.api.state.people.forEach((person,index) => { person.name = names[index]; });
  env.api.render();
  const settlement = env.query(".settlement-item");
  const tokens = settlement.querySelectorAll("bdi");
  assert.equal(tokens.length, 3);
  assert.deepEqual(tokens.map(token => token.getAttribute("dir")), ["auto","ltr","auto"]);
  assert.equal(tokens[0].textContent, names[1]);
  assert.equal(tokens[1].textContent, "30 $");
  assert.equal(tokens[2].textContent, names[0]);
  const summary = env.api.buildSummaryText(env.api.calculate());
  assert.ok(summary.includes(`\u2068${names[1]}\u2069`));
  assert.ok(summary.includes("\u206630 $\u2069"));
  assert.ok(summary.endsWith(`\u2066${arabicCanonical}\u2069\u2069`));
  assert.equal((summary.match(/[\u2066-\u2068]/g)||[]).length,(summary.match(/\u2069/g)||[]).length);
  assert.ok(summary.split("\n").filter(Boolean).every(line=>line.startsWith("\u2067")&&line.endsWith("\u2069")), "Each copied Arabic paragraph retains its base direction when pasted in LTR UI");
  assert.ok(!/[\u202a-\u202e]/.test(summary), "No embedding/override controls");
  const draft=env.window.UomiToolTransfer.prepare(env.api.transferState());
  assert.deepEqual(plain(draft.participants.map(person=>person.name)), names);
  assert.ok(!/[\u2066-\u2069]/.test(JSON.stringify(draft)), "No inserted presentation controls in native financial draft");
  assert.equal(env.query(`#person-${env.api.state.people[0].id}`).getAttribute("dir"),"auto");
});

test("Arabic native retry and Back restoration preserve raw digits, names, cents and sole-reference contract", async () => {
  let succeeds = false;
  const env=localizedCalculator("ar",{fetch:async()=>({ok:succeeds,status:succeeds?200:503})});
  env.api.state.people=env.api.state.people.slice(0,2);
  env.api.state.people[0].name="أحمد (Alex 2)";
  env.api.state.people[1].name="Mia — مريم";
  const expense=env.api.state.expenses[0];
  expense.includedPeople=env.api.state.people.map(person=>person.id);
  env.api.render();
  env.edit(`#amount-${expense.id}`,"٩٠٫٥٠");
  env.action("track-split");await flush();
  assert.equal(env.navigations.length,0);
  succeeds=true;env.action("track-split");await flush();
  const [first,second]=env.requests.map(request=>JSON.parse(request[1].body));
  assert.equal(first.reference,second.reference);
  assert.equal(second.draft.costs[0].amount,9050);
  assert.equal(second.draft.participants[0].name,"أحمد (Alex 2)");
  assert.deepEqual(Object.keys(second).sort(),["action","draft","reference"]);
  assert.ok(!/[\u2066-\u2069]/.test(JSON.stringify(second)));
  const url=new URL(env.navigations[0]);
  assert.deepEqual([...url.searchParams.keys()],["ref"]);assert.equal(url.hash,"#ar");
  const restored=localizedCalculator("ar",{storage:[...env.storage]});
  assert.equal(restored.api.state.expenses[0].amount,"٩٠٫٥٠");
  assert.equal(restored.api.state.people[0].name,"أحمد (Alex 2)");
  assert.equal(restored.storage.size,0);
  for(const event of env.events)assert.deepEqual(Object.keys(event.detail),["eventName"]);
});

test("Arabic edits invalidate in-flight transfers even when canonicalization is deferred to the boundary", async () => {
  let resolveUpload;
  const env=localizedCalculator("ar",{fetch:()=>new Promise(resolve=>{resolveUpload=resolve;})});
  const expense=env.api.state.expenses[0];env.edit(`#amount-${expense.id}`,"٩٠");
  env.action("track-split");await flush();
  env.edit(`#amount-${expense.id}`,"١٢٠");resolveUpload({ok:true});await flush();
  assert.equal(env.navigations.length,0);
  assert.equal(env.api.state.expenses[0].amount,"١٢٠");
  assert.equal(env.storage.size,0,"Never persist a stale financial draft");
});

test("private locale selection resets every RTL/LTR transition using only the fragment", async () => {
  const selector=await readFile(new URL("private-continuation/split/locale.js",root),"utf8");
  let hash="#ar",onHashChange;
  const attributeNode=attributes=>({attributes:new Map(Object.entries(attributes)),setAttribute(key,value){this.attributes.set(key,value);},getAttribute(key){return this.attributes.get(key)||null;},removeAttribute(key){this.attributes.delete(key);}});
  const languages=["en","es","de","ar"];
  const sections=languages.map(language=>attributeNode({"data-locale":language,"data-title":language}));
  const links=languages.map(language=>attributeNode({lang:language}));
  const navigation=attributeNode({});navigation.querySelectorAll=()=>links;
  const document={documentElement:{},querySelectorAll:()=>sections,querySelector:()=>navigation};
  const location={get hash(){return hash;},get search(){throw Error("Private reference must not be read");},get href(){throw Error("Private URL must not be read");}};
  const window={location,addEventListener(type,callback){assert.equal(type,"hashchange");onHashChange=callback;},get localStorage(){throw Error("No storage access");},get sessionStorage(){throw Error("No storage access");}};
  vm.runInNewContext(selector,{window,document,fetch(){throw Error("No private locale network access");}});
  for(const from of languages)for(const to of [...languages,"unknown"]){
    hash=`#${from}`;onHashChange();hash=`#${to}`;onHashChange();
    const selected=to==="unknown"?"en":to;
    assert.equal(document.documentElement.lang,selected);
    assert.equal(document.documentElement.dir,selected==="ar"?"rtl":"ltr");
    assert.deepEqual(sections.map(section=>section.hidden),languages.map(language=>language!==selected));
    assert.deepEqual(links.map(link=>link.getAttribute("aria-current")),languages.map(language=>language===selected?"page":null));
  }
});

