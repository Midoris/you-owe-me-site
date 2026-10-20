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
  const document = parseStaticPage(page);
  document.documentElement = { lang };
  if (lang === "de") document.querySelector('link[rel="canonical"]').setAttribute("href", germanCanonical);
  if (lang === "es") document.querySelector('link[rel="canonical"]').setAttribute("href", spanishCanonical);
  if (lang === "fr") document.querySelector('link[rel="canonical"]').setAttribute("href", frenchCanonical);
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
  vm.runInContext(frenchInput, context);
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
