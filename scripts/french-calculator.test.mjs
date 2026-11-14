import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";
import vm from "node:vm";
import {webcrypto} from "node:crypto";
import {parseStaticPage} from "../tests/helpers/static-dom.mjs";
const read = file => fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
const page=read("tools/split-expense-calculator/index.html");
const calculator=read("scripts/split-expense-calculator.js"),spanishLocale=read("scripts/split-expense-locale.js"),transferScript=read("scripts/tool-transfer.js"),arabicInput=read("scripts/arabic-number-input.js"),frenchInput=read("scripts/french-number-input.js");
const frenchCanonical="https://you-owe-me.com/fr/outils/calculateur-partage-depenses/";
const arabicCanonical="https://you-owe-me.com/ar/tools/split-expense-calculator/",germanCanonical="https://you-owe-me.com/de/tools/ausgaben-aufteilen/",spanishCanonical="https://you-owe-me.com/es/herramientas/calculadora-de-gastos-compartidos/";
const plain=value=>JSON.parse(JSON.stringify(value));
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const fixtures=JSON.parse(read("tests/fixtures/french-number-input-fixtures.json"));
function localizedCalculator(lang = "fr", options = {}) {
  const document = parseStaticPage(lang === "pt-BR"
    ? read("pt/ferramentas/calculadora-dividir-despesas/index.html")
    : page);
  document.documentElement = { lang };
  if (lang === "de") document.querySelector('link[rel="canonical"]').setAttribute("href", germanCanonical);
  if (lang === "es") document.querySelector('link[rel="canonical"]').setAttribute("href", spanishCanonical);
  if (lang === "fr") document.querySelector('link[rel="canonical"]').setAttribute("href", frenchCanonical);
  if (lang === "ar") document.querySelector('link[rel="canonical"]').setAttribute("href", arabicCanonical);
  const copied = [], shared = [], events = [], requests = [], navigations = [], timers = [], confirmations = [];
  const storage = new Map(options.storage || []);
  const window = {
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout(callback) { timers.push(callback); return timers.length; }, clearTimeout() {},
    dispatchEvent(event) { events.push(plain(event)); }, document,
    confirm(message) { confirmations.push(message); return options.confirm?.() ?? false; },
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
  vm.runInContext(frenchInput, context);
  if (lang === "pt-BR") vm.runInContext(read("scripts/portuguese-number-input.js"), context);
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
  return { document, window, api: window.testCalculator, query, edit, action, copied, shared, events, requests, navigations, storage, timers, confirmations };
}


test("French raw decimal/grouping inputs preserve existing browser/native fixture values",()=>{
 const fr=localizedCalculator(),en=localizedCalculator("en");
 const nativeFixtures=JSON.parse(read("tests/fixtures/tool-transfer-fixtures.json"));
 for(const fixture of nativeFixtures){
  const state={currency:fixture.draft.currencyLabel,people:fixture.draft.participants,expenses:fixture.draft.costs.map(c=>({id:c.id,description:c.label,amount:(c.amount/100).toFixed(2),paidBy:c.payerID,includedPeople:c.participantIDs}))};
  Object.assign(en.api.state,plain(state));state.expenses.forEach(e=>e.amount=e.amount.replace(".",","));Object.assign(fr.api.state,plain(state));
  assert.deepEqual(plain(fr.api.calculate()),plain(en.api.calculate()),fixture.name);
  assert.deepEqual(plain(fr.window.UomiToolTransfer.prepare(fr.api.transferState())),plain(en.window.UomiToolTransfer.prepare(en.api.state)),fixture.name);
  assert.equal(fr.api.state.expenses[0].amount,state.expenses[0].amount);
 }
 for(const language of ["en","es","de"]){const old=localizedCalculator(language);assert.equal(old.api.parseAmount("12,50"),1250);assert.equal(old.api.transferState(),old.api.state);}
 for(const raw of ["٩٠٫٥٠","۹۰٫۵۰","1,234.50"]){const ar=localizedCalculator("ar");assert.equal(ar.api.parseAmount(raw),raw==="1,234.50"?1234.5:90.5);}
});
test("French ambiguity and invalid amounts cannot create results or native drafts",()=>{
 const env=localizedCalculator(),expense=env.api.state.expenses[0];
 for(const raw of [...fixtures.formatRejected,...fixtures.nonPositiveInvalidForCalculation]){
  expense.amount=raw;env.api.render();assert.equal(env.api.calculate().validCount,0,JSON.stringify(raw));assert.equal(env.window.UomiToolTransfer.prepare(env.api.transferState()),null,JSON.stringify(raw));
  if(raw.trim()){assert.equal(env.query(`#amount-${expense.id}`).getAttribute("aria-invalid"),"true");assert.ok(env.query(".expense-validation").textContent);}
  assert.equal(expense.amount,raw);
 }
 for(const [raw,canonical] of fixtures.accepted){expense.amount=raw;env.api.render();assert.equal(env.api.parseAmount(raw),Number(canonical));assert.equal(env.query(`#amount-${expense.id}`).type,"text");assert.equal(env.query(`#amount-${expense.id}`).inputMode,"decimal");}
});
test("French retains the accepted native rounding/capacity eligibility guard",()=>{
 for(const fixture of fixtures.nativeEligibilityRegression){
  const env=localizedCalculator();env.api.state.people=Array.from({length:fixture.people},(_,i)=>({id:"p"+i,name:"Personne "+i}));env.api.state.expenses=[{id:"e",description:"Synthétique",amount:fixture.amount,paidBy:"p0",includedPeople:env.api.state.people.map(p=>p.id)}];
  assert.equal(env.api.calculate().validCount,1);const draft=env.window.UomiToolTransfer.prepare(env.api.transferState());assert.equal(Boolean(draft),fixture.eligible,fixture.reason||fixture.amount);if(draft)assert.equal(draft.costs[0].amount,fixture.cents);
 }
});
test("French retry and Back preserve raw comma input, names, cents and sole-reference privacy",async()=>{
 let succeeds=false;const env=localizedCalculator("fr",{fetch:async()=>({ok:succeeds,status:succeeds?200:503})});
 env.api.state.people=env.api.state.people.slice(0,2);env.api.state.people[0].name="Élodie (Alex 2)";env.api.state.people[1].name="Mia — مريم";const e=env.api.state.expenses[0];e.includedPeople=env.api.state.people.map(p=>p.id);env.api.render();env.edit(`#amount-${e.id}`,"90,50");
 env.action("track-split");await flush();assert.equal(env.navigations.length,0);succeeds=true;env.action("track-split");await flush();
 const [first,last]=env.requests.map(r=>JSON.parse(r[1].body));assert.equal(first.reference,last.reference);assert.equal(last.draft.costs[0].amount,9050);assert.equal(last.draft.participants[1].name,"Mia — مريم");assert.deepEqual(Object.keys(last).sort(),["action","draft","reference"]);assert.ok(!/[\u2066-\u2069]/.test(JSON.stringify(last)));
 const url=new URL(env.navigations[0]);assert.deepEqual([...url.searchParams.keys()],["ref"]);assert.equal(url.hash,"#fr");const back=localizedCalculator("fr",{storage:[...env.storage]});assert.equal(back.api.state.expenses[0].amount,"90,50");assert.equal(back.storage.size,0);for(const event of env.events)assert.deepEqual(Object.keys(event.detail),["eventName"]);
});
test("French copied/shared summaries retain currency, creditor direction and localized canonical",async()=>{
 const env=localizedCalculator();env.action("use-example");env.action("copy-summary");await flush();const text=env.copied.at(-1),visible=text.replace(/[\u2066-\u2069]/g,"");assert.ok(visible.includes("Sam doit 25\u00a0$ à Alex"));assert.ok(visible.includes("Sam doit 10\u00a0$ à Mia"));assert.ok(text.split("\n").filter(Boolean).every(line=>line.startsWith("\u2066")&&line.endsWith("\u2069")));assert.equal((text.match(/[\u2066-\u2068]/g)||[]).length,(text.match(/\u2069/g)||[]).length);assert.ok(!/[\u202a-\u202e]/.test(text));assert.ok(text.includes(frenchCanonical));assert.ok(!text.includes("EUR"));env.action("share-summary");await flush();assert.equal(env.shared[0].text,text);assert.equal(env.shared[0].url,frenchCanonical);
});

test("Arabic, French and Brazilian Portuguese prompt only when the example would replace entered work", () => {
  const localized = {
    ar: { amount: "٩٠٫٥٠", currency: "$", prompt: /المثال.*المتابعة؟/ },
    fr: { amount: "90,50", currency: "$", prompt: /l’exemple.*continuer \?/ },
    "pt-BR": { amount: "90,50", currency: "R$", prompt: /Usar o exemplo vai substituir os dados da sua divisão atual\. Quer continuar\?/ },
  };
  for (const [lang, { amount, currency, prompt }] of Object.entries(localized)) {
    const mutations = {
      amount: (env, expense) => env.edit(`#amount-${expense.id}`, amount),
      currency: env => env.edit("#currency-symbol", "EUR"),
      name: env => env.edit(`#person-${env.api.state.people[0].id}`, "Fictional person"),
      description: (env, expense) => env.edit(`#description-${expense.id}`, "Fictional expense"),
      payer: (env, expense) => env.edit(`#paid-${expense.id}`, env.api.state.people[1].id, "change"),
      participant: (env, expense) => env.edit(`#included-${expense.id}-${env.api.state.people[2].id}`, false, "change"),
      addPerson: env => env.action("add-person"),
      removePerson: env => env.query("[data-people-list] .remove-action").dispatchEvent({ type: "click" }),
      addExpense: env => env.action("add-expense"),
      removeExpense: env => env.query("[data-expenses-list] .remove-action").dispatchEvent({ type: "click" }),
    };
    for (const [name, edit] of Object.entries(mutations)) {
      const env = localizedCalculator(lang);
      edit(env, env.api.state.expenses[0]);
      const draft = plain(env.api.state);
      const events = [...env.events];
      const continuationHidden = env.query("[data-tool-transfer]").hidden;
      env.action("use-example");
      assert.equal(env.confirmations.length, 1, `${lang}: ${name}`);
      assert.match(env.confirmations[0], prompt);
      assert.deepEqual(plain(env.api.state), draft);
      assert.deepEqual(env.events, events);
      assert.equal(env.query("[data-tool-transfer]").hidden, continuationHidden);
    }

    const clean = localizedCalculator(lang);
    clean.action("use-example");
    assert.equal(clean.api.state.expenses.length, 3);
    assert.deepEqual(clean.confirmations, []);
    clean.edit("#currency-symbol", "EUR");
    clean.action("clear-all");
    assert.equal(clean.api.state.expenses[0].amount, "");
    clean.action("use-example");
    assert.equal(clean.api.state.expenses.length, 3);
    assert.deepEqual(clean.confirmations, []);

    const accepted = localizedCalculator(lang, { confirm: () => true });
    accepted.edit("#currency-symbol", "EUR");
    accepted.action("use-example");
    assert.equal(accepted.confirmations.length, 1);
    assert.equal(accepted.api.state.currency, currency);
    assert.equal(accepted.api.state.expenses.length, 3);
    assert.equal(accepted.query("[data-tool-transfer]").hidden, true);
    accepted.action("use-example");
    assert.equal(accepted.confirmations.length, 1);
  }

  for (const lang of ["en", "es", "de", "ja", "it", "pl"]) {
    const env = localizedCalculator(lang);
    env.edit("#currency-symbol", "EUR");
    env.action("use-example");
    assert.deepEqual(env.confirmations, [], lang);
  }
});

test("canceling the Arabic, French or Brazilian Portuguese example preserves the copied result and restored iPhone transfer", async () => {
  for (const [lang, amount] of [["ar", "٩٠٫٥٠"], ["fr", "90,50"], ["pt-BR", "90,50"]]) {
    const snapshot = await returnSnapshot(lang, amount);
    const env = localizedCalculator(lang, { storage: [["uomi-exp003-return", JSON.stringify(snapshot)]] });
    const before = plain(env.api.state);
    const settlement = env.query("[data-settlement]").textContent;
    env.action("copy-summary");
    await flush();
    const events = [...env.events];
    const status = env.query("[data-copy-status]").textContent;

    env.action("use-example");
    assert.equal(env.confirmations.length, 1);
    assert.deepEqual(plain(env.api.state), before);
    assert.equal(env.query(`#amount-${before.expenses[0].id}`).value, amount);
    assert.equal(env.query("[data-settlement]").textContent, settlement);
    assert.equal(env.query("[data-copy-status]").textContent, status);
    assert.equal(env.query("[data-result-actions]").hidden, false);
    assert.equal(env.query("[data-tool-transfer]").hidden, false);
    assert.deepEqual(env.events, events);
    assert.deepEqual(env.requests, []);
    assert.deepEqual(env.navigations, []);
    assert.equal(env.storage.size, 0);

    env.action("copy-summary");
    await flush();
    assert.ok(env.copied[0].length);
    assert.equal(env.copied[1], env.copied[0]);
    if (lang === "pt-BR") assert.match(env.copied[1], /Total das despesas: R\$ 90,50/);
    env.action("track-split");
    await flush();
    const body = JSON.parse(env.requests[0][1].body);
    assert.equal(body.reference, snapshot.transferAttempt.reference);
    assert.equal(JSON.stringify(body.draft), snapshot.transferAttempt.fingerprint);
    assert.equal(body.draft.costs[0].amount, 9050);
    assert.deepEqual(JSON.parse(env.storage.get("uomi-exp003-return")), snapshot);
  }
});

test("the Portuguese preview and a canceled replacement do not report a result-ready event", () => {
  const preview = localizedCalculator("pt-BR");
  assert.equal(preview.api.calculate().total, 180);
  assert.equal(preview.query("[data-result-actions]").hidden, true);
  assert.deepEqual(preview.events, []);
  preview.action("use-example");
  assert.deepEqual(preview.confirmations, []);
  assert.equal(preview.query("[data-result-actions]").hidden, false);
  assert.deepEqual(preview.events.map(event => event.detail), [{ eventName: "split_result_ready" }]);

  let accept = false;
  const dirty = localizedCalculator("pt-BR", { confirm: () => accept });
  dirty.action("clear-all");
  const amount = `#amount-${dirty.api.state.expenses[0].id}`;
  dirty.edit(amount, "90,");
  dirty.action("use-example");
  assert.equal(dirty.query(amount).value, "90,");
  assert.equal(dirty.confirmations.length, 1);
  assert.deepEqual(dirty.events, []);
  accept = true;
  dirty.action("use-example");
  assert.equal(dirty.confirmations.length, 2);
  assert.equal(dirty.api.calculate().total, 180);
  assert.deepEqual(dirty.events.map(event => event.detail), [{ eventName: "split_result_ready" }]);
});

test("French restored numeric values follow the same fail-closed input boundary",()=>{
 const env=localizedCalculator(),expense=env.api.state.expenses[0];
 for(const raw of [1.234,Infinity,-Infinity,NaN]){expense.amount=raw;env.api.render();assert.equal(env.api.calculate().validCount,0);assert.equal(env.window.UomiToolTransfer.prepare(env.api.transferState()),null);assert.equal(env.query(`#amount-${expense.id}`).getAttribute("aria-invalid"),"true");}
 expense.amount=1.23;env.api.render();assert.equal(env.api.calculate().validCount,1);
});
test("French blank identity fallbacks agree between visible calculator and native draft",()=>{
 const env=localizedCalculator();env.api.state.people=env.api.state.people.slice(0,2);env.api.state.people.forEach(p=>p.name="");const e=env.api.state.expenses[0];e.amount="90,50";e.description="";e.includedPeople=env.api.state.people.map(p=>p.id);env.api.render();const draft=env.window.UomiToolTransfer.prepare(env.api.transferState());
 assert.deepEqual(plain(draft.participants.map(p=>p.name)),plain(env.api.calculate().net.map(p=>p.name)));assert.deepEqual(plain(draft.participants.map(p=>p.name)),["Personne 1","Personne 2"]);assert.equal(draft.costs[0].label,"Dépense partagée");
 const baseline=execFileSync("git",["show","a2eb93d:scripts/tool-transfer.js"],{encoding:"utf8"});assert.equal(transferScript.slice(transferScript.indexOf("  function prepare(state)")),baseline.slice(baseline.indexOf("  function prepare(state)")),"Native preparation, rounding and eligibility guard remain byte-identical");
});
test("French private continuation preserves all four accepted sections and privacy configuration",()=>{
 const html=read("private-continuation/split/index.html"),baseline=execFileSync("git",["show","a2eb93d:private-continuation/split/index.html"],{encoding:"utf8"});
 for(const code of ["en","es","de","ar"]){const pattern=new RegExp(`<section id="${code}"[\\s\\S]*?</section>`);assert.equal(html.match(pattern)[0],baseline.match(pattern)[0],code);}
 for(const code of ["en","es","de","ar","fr"]){const opening=html.match(new RegExp(`<section id="${code}"[^>]*>`))[0];assert.ok(!/\bhidden\b/.test(opening));}
 assert.equal(read("firebase.exp003.json"),execFileSync("git",["show","a2eb93d:firebase.exp003.json"],{encoding:"utf8"}));
 const document=parseStaticPage(html);document.documentElement={};for(const link of document.querySelectorAll("a"))link.removeAttribute=name=>link.attributes.delete(name);
 let hash="#fr",change;const window={location:{get hash(){return hash},get search(){throw Error("No reference read")},get href(){throw Error("No URL read")}},addEventListener(type,fn){assert.equal(type,"hashchange");change=fn}};
 vm.runInNewContext(read("private-continuation/split/locale.js"),{window,document,fetch(){throw Error("No network")}});
 for(const from of ["en","es","de","ar","fr"])for(const to of ["en","es","de","ar","fr","unknown"]){hash="#"+from;change();hash="#"+to;change();const selected=to==="unknown"?"en":to;assert.equal(document.documentElement.lang,selected);assert.equal(document.documentElement.dir,selected==="ar"?"rtl":"ltr");assert.equal(document.querySelectorAll("[data-locale]").filter(s=>!s.hidden).length,1);assert.equal(document.title,document.querySelector(`[data-locale="${selected}"]`).getAttribute("data-title"));}
});

// Independent October 20 review: a private-page language switch can return to
// another calculator locale in the same tab. Exercise actual consent/storage.
async function returnSnapshot(language, amount, blankLabels = false) {
  const env = localizedCalculator(language);
  Object.assign(env.api.state, { currency: language === "pt-BR" ? "R$" : "EUR", people: [
    { id: "audit-p0", name: blankLabels ? "" : "Élodie" }, { id: "audit-p1", name: "أحمد (Alex 2)" },
  ], expenses: [{ id: "audit-e0", description: blankLabels ? "" : "Synthetic return check", amount,
    paidBy: "audit-p0", includedPeople: ["audit-p0", "audit-p1"] }], nextPersonNumber: 3, nextExpenseNumber: 2 });
  env.api.render(); env.edit("#amount-audit-e0", amount);
  env.action("track-split"); await flush();
  assert.equal(env.requests.length, 1); assert.equal(env.navigations.length, 1);
  return JSON.parse(env.storage.get("uomi-exp003-return"));
}
test("consented return preserves money across every source/target page language", async () => {
  const inputs = { en: "90.50", es: "90.50", de: "90.50", ar: "٩٠٫٥٠", fr: "90,50" };
  for (const [source, raw] of Object.entries(inputs)) {
    const snapshot = await returnSnapshot(source, raw);
    assert.equal(snapshot.locale, source);
    const original = JSON.parse(snapshot.transferAttempt.fingerprint);
    assert.equal(original.costs[0].amount, 9050);
    for (const target of Object.keys(inputs)) {
      const env = localizedCalculator(target, { storage: [["uomi-exp003-return", JSON.stringify(snapshot)]] });
      assert.equal(env.api.calculate().total, 90.5, `${source} -> ${target}`);
      assert.equal(env.api.state.currency, "EUR");
      assert.equal(env.api.state.expenses[0].amount, source === target ? raw : "90.50");
      assert.equal(JSON.stringify(env.window.UomiToolTransfer.prepare(env.api.transferState())), snapshot.transferAttempt.fingerprint);
      assert.equal(env.storage.size, 0); assert.equal(env.requests.length, 0, "restoring never uploads");
      env.action("track-split"); await flush();
      assert.equal(env.requests.length, 1);
      const sent = JSON.parse(env.requests[0][1].body);
      assert.equal(sent.reference, snapshot.transferAttempt.reference, "same accepted split reuses its reference");
      assert.equal(sent.draft.costs[0].amount, 9050);
      assert.equal(sent.draft.participants[1].name, "أحمد (Alex 2)");
    }
  }
});
test("legacy untagged return snapshots use accepted cents instead of guessing separators", async () => {
  for (const [source, raw] of [["fr", "90,50"], ["ar", "٩٠٫٥٠"]]) {
    const snapshot = await returnSnapshot(source, raw); delete snapshot.locale;
    for (const target of ["en", "es", "de", "ar", "fr"]) {
      const env = localizedCalculator(target, { storage: [["uomi-exp003-return", JSON.stringify(snapshot)]] });
      assert.equal(env.api.calculate().total, 90.5, `${source} legacy -> ${target}`);
      assert.equal(JSON.stringify(env.window.UomiToolTransfer.prepare(env.api.transferState())), snapshot.transferAttempt.fingerprint);
    }
  }
});
test("cross-locale return canonicalizes accepted exponent input and preserves fallback labels", async () => {
  const exponent = await returnSnapshot("en", "1e3");
  const fr = localizedCalculator("fr", { storage: [["uomi-exp003-return", JSON.stringify(exponent)]] });
  assert.equal(fr.api.state.expenses[0].amount, "1000.00"); assert.equal(fr.api.calculate().total, 1000);
  const blank = await returnSnapshot("fr", "90,50", true);
  for (const target of ["en", "es", "de", "ar"]) {
    const env = localizedCalculator(target, { storage: [["uomi-exp003-return", JSON.stringify(blank)]] });
    assert.equal(env.api.calculate().total, 90.5);
    assert.equal(JSON.stringify(env.window.UomiToolTransfer.prepare(env.api.transferState())), blank.transferAttempt.fingerprint);
  }
});
test("invalid return snapshots cannot restore a changed financial draft or upload", async () => {
  const original = await returnSnapshot("fr", "90,50");
  const variants = [
    { ...original, transferAttempt: { ...original.transferAttempt, fingerprint: "null" }, state: { ...original.state, expenses: [] } },
    { ...original, transferAttempt: { ...original.transferAttempt, fingerprint: "{invalid" } },
    { ...original, transferAttempt: { ...original.transferAttempt, fingerprint: undefined } },
    { ...original, state: { ...original.state, currency: "USD" } },
    { ...original, state: { ...original.state, people: null } },
    { ...original, state: { ...original.state, expenses: [{ ...original.state.expenses[0], id: "wrong-id" }] } },
  ];
  for (const snapshot of variants) {
    const env = localizedCalculator("en", { storage: [["uomi-exp003-return", JSON.stringify(snapshot)]] });
    assert.equal(env.api.state.people.length, 3); assert.equal(env.api.calculate().total, 90);
    assert.equal(env.requests.length, 0); assert.equal(env.storage.size, 0);
  }
});
