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
function localizedCalculator(lang = "pl", options = {}) {
  const document = parseStaticPage(page);
  document.documentElement = { lang };
  if (lang === "pl") document.querySelector('link[rel="canonical"]').setAttribute("href", "https://you-owe-me.com/pl/narzedzia/kalkulator-podzialu-wydatkow/");
  if (lang === "it") document.querySelector('link[rel="canonical"]').setAttribute("href", "https://you-owe-me.com/it/strumenti/calcolatore-spese-condivise/");
  if (lang === "pt-BR") document.querySelector('link[rel="canonical"]').setAttribute("href", "https://you-owe-me.com/pt/ferramentas/calculadora-dividir-despesas/");
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
  vm.runInContext(read("scripts/portuguese-number-input.js"), context);
  vm.runInContext(read("scripts/italian-number-input.js"), context);
  vm.runInContext(read("scripts/polish-number-input.js"), context);
  vm.runInContext(spanishLocale, context);
  vm.runInContext(transferScript, context);
  vm.runInContext(calculator.replace('  if (document.readyState === "loading")',
    '  window.testCalculator = {state, calculate, render, formatNumber, parseAmount, buildSummaryText, renderExpenseValidation, transferState, formatMoney, clearAll, useExample, restoreReturnState};\n  if (document.readyState === "loading")'), context);
  const query = selector => { const node = document.querySelector(selector); assert.ok(node, selector); return node; };
  const edit = (selector, value, type = "input") => {
    const node = query(selector); if (typeof value === "boolean") node.checked = value; else node.value = value;
    node.dispatchEvent({ type });
  };
  const action = name => query(`[data-action="${name}"]`).dispatchEvent({ type: "click" });
  return { document, window, api: window.testCalculator, query, edit, action, copied, shared, events, requests, navigations, storage, timers };
}

const accepted=[['12,50',12.5],['1234,50',1234.5],['1234.50',1234.5],['1 234,50',1234.5],['1\u00a0234,50',1234.5],['1\u202f234,50',1234.5],['1 234.50',1234.5],['1 234 567,89',1234567.89],['0,01',.01],['0.01',.01],['1234',1234],['0',0],['00012,50',12.5]];
const rejected=['1.234','1.234,50','12.345','1234.567','0.001','01 234','12,345','1,234.50','1.23,45','12 34,50','1 234.567,89','1e3','-1','+1','zł 10','','Infinity','NaN','1,','1.','1\t234,50'];
test('PL input boundary recognizes space grouping and canonical cents without coercing invalid forms',()=>{
 const e=localizedCalculator(),parser=e.window.UomiPolishNumberInput;
 for(const [raw,number] of accepted){assert.equal(Number(parser.normalizeAmount(raw)),number,raw);assert.equal(e.api.parseAmount(raw),number,raw);}
 for(const raw of rejected){assert.equal(parser.normalizeAmount(raw),null,raw);assert.equal(e.api.parseAmount(raw),0,raw);}
 for(const n of [1234.5,90,0,.01,.29])assert.equal(parser.normalizeAmount(n),String(n));for(const n of [1.234,1.000000001,1e-9,-1,NaN,Infinity])assert.equal(parser.normalizeAmount(n),null);
 for(const canonical of ['1234.50','0.01','1000000.00'])assert.equal(parser.normalizeAmount(canonical),canonical);
});
test('PL default example, clear and money formatting keep arithmetic/selective participation and integer counts',()=>{
 const e=localizedCalculator();assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['Anna','Jakub','Julia']);assert.equal(e.api.state.currency,'zł');
 const r=e.api.calculate();assert.equal(r.total,180);assert.deepEqual(plain(r.net.map(p=>[p.paid,p.share,p.net])),[[90,65,25],[60,50,10],[30,65,-35]]);assert.deepEqual(plain(r.transfers.map(p=>[p.from,p.to,p.amount])),[['Julia','Anna',25],['Julia','Jakub',10]]);
 assert.equal(e.api.formatMoney(1234.5),'1\u00a0234,50 zł');assert.equal(e.api.formatMoney(90),'90,00 zł');assert.match(e.query('[data-summary]').textContent,/Osoby3Uwzględnione wydatki3$/);
 for(const [label,wanted]of[['','12,50 zł'],['USD','USD 12,50'],['$','$12,50']]){e.api.state.currency=label;assert.equal(e.api.formatMoney(12.5),wanted);}
 e.action('clear-all');assert.equal(e.api.calculate().validCount,0);assert.equal(e.api.state.expenses[0].amount,'');assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['Osoba 1','Osoba 2','Osoba 3']);assert.equal(e.api.state.currency,'zł');e.action('use-example');assert.equal(e.api.calculate().total,180);
});
test('PL raw localized amount survives editing while validation/calculation/copy/share/native see one value',async()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0],selector=`#amount-${expense.id}`;
 assert.equal(e.query(selector).type,'text');assert.equal(e.query(selector).inputMode,'decimal');assert.match(e.query(selector).getAttribute('aria-describedby'),/pl-number-help/);
 e.edit(selector,'1 234,50');assert.equal(expense.amount,'1 234,50');assert.equal(e.api.calculate().total,1234.5);assert.equal(e.api.transferState().expenses[0].amount,'1234.50');assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()).costs[0].amount,123450);
 e.api.state.people[0].name='Anna\u00a0Nowak';e.action('copy-summary');await flush();e.action('share-summary');await flush();assert.equal(e.copied[0],e.shared[0].text);assert.ok(e.copied[0].includes('Anna\u00a0Nowak'));assert.ok(e.copied[0].includes('1 234,50 zł'));assert.equal(e.api.formatMoney(1234.5),'1\u00a0234,50 zł');assert.match(e.copied[0],/Suma wydatków: 1 234,50 zł/);assert.match(e.copied[0],/https:\/\/you-owe-me.com\/pl\/narzedzia\/kalkulator-podzialu-wydatkow\/$/);assert.equal(e.shared[0].title,'Podsumowanie wspólnych wydatków');
 assert.equal(e.requests.length,0);e.action('track-split');await flush();assert.equal(JSON.parse(e.requests[0][1].body).draft.costs[0].amount,123450);assert.match(e.navigations[0],/#pl$/);assert.doesNotMatch(e.navigations[0],/#pt-BR/);
 assert.ok(e.events.every(event=>Object.keys(event.detail).join(',')==='eventName'));
});
test('PL invalid/empty/zero amount cannot transfer; native bounds and rounding mismatch remain exact',()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0];
 for(const raw of [...rejected,'0']){expense.amount=raw;e.api.render();assert.equal(e.api.calculate().validCount,0,raw);assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null,raw);assert.equal(e.query('[data-tool-transfer]').hidden,true,raw);}
 expense.amount='0.001';e.api.render();assert.equal(e.query('.expense-validation').textContent,'Wpisz kwotę np. 1234,50 lub 1 234,50, z najwyżej dwoma miejscami po przecinku.');assert.equal(e.query('.expense-fields input').getAttribute('aria-invalid'),'true');
 expense.amount='1 000 000,00';assert.ok(e.window.UomiToolTransfer.prepare(e.api.transferState()));expense.amount='1 000 000,01';assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);
 e.api.state.people.pop();expense.includedPeople=e.api.state.people.map(p=>p.id);expense.amount='0,29';e.api.render();assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);assert.match(e.api.buildSummaryText(e.api.calculate()),/0,14 zł/);
 expense.amount='1000';e.api.state.people.push({id:'third',name:'C'});expense.includedPeople.push('third');e.api.render();assert.match(e.api.buildSummaryText(e.api.calculate()),/333,33 zł/);assert.ok(e.window.UomiToolTransfer.prepare(e.api.transferState()));expense.amount='90,50';e.api.render();assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);expense.amount='1000';e.api.state.people.push({id:'fourth',name:'D'});expense.includedPeople=e.api.state.people.slice(1).map(p=>p.id);e.api.render();assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);
});
test('PL return restores accepted cents across en/fr/ar/ja/pt/it both ways and retains only matching same-PL raw grouping',async()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0];expense.description='';e.api.state.people[1].name='';e.edit(`#amount-${expense.id}`,'1 234,50');e.action('track-split');await flush();
 const payload=JSON.parse(e.requests[0][1].body);assert.equal(payload.draft.costs[0].amount,123450);assert.equal(payload.draft.costs[0].label,'Wspólny wydatek');assert.equal(payload.draft.participants[1].name,'Osoba 2');
 const snapshot=JSON.parse(e.storage.get('uomi-exp003-return')),fingerprint=snapshot.transferAttempt.fingerprint;
 const same=localizedCalculator('pl',{storage:[['uomi-exp003-return',JSON.stringify(snapshot)]]});assert.equal(same.api.state.expenses[0].amount,'1 234,50');
 for(const lang of ['en','fr','ar','ja','pt-BR','it']){const other=localizedCalculator(lang,{storage:[['uomi-exp003-return',JSON.stringify(snapshot)]]});assert.equal(other.api.state.expenses[0].amount,'1234.50');assert.equal(JSON.stringify(other.window.UomiToolTransfer.prepare(other.api.transferState())),fingerprint,lang);const back={locale:lang,state:plain(other.api.state),transferAttempt:snapshot.transferAttempt};const pt=localizedCalculator('pl',{storage:[['uomi-exp003-return',JSON.stringify(back)]]});assert.equal(pt.api.state.expenses[0].amount,'1234.50');assert.equal(JSON.stringify(pt.window.UomiToolTransfer.prepare(pt.api.transferState())),fingerprint);}
 const changed=plain(snapshot);changed.state.expenses[0].amount='12,50';const restored=localizedCalculator('pl',{storage:[['uomi-exp003-return',JSON.stringify(changed)]]});assert.equal(restored.api.state.expenses[0].amount,'1234.50');assert.equal(JSON.stringify(restored.window.UomiToolTransfer.prepare(restored.api.transferState())),fingerprint);
});
test('PL share cancellation/fallback/failure and transfer retry/stale edit preserve current local calculation',async()=>{
 const fallback=localizedCalculator('pl',{clipboardFails:true,shareError:new Error('unavailable')});fallback.action('use-example');fallback.action('share-summary');await flush();assert.equal(fallback.copied.length,1);assert.equal(fallback.query('[data-copy-status]').textContent,'Udostępnianie było niedostępne, więc wynik został skopiowany.');
 const failed=localizedCalculator('pl',{clipboardFails:true,fallbackFails:true,shareError:new Error('unavailable')});failed.action('use-example');failed.action('share-summary');await flush();assert.equal(failed.query('[data-copy-status]').textContent,'Nie udało się udostępnić ani skopiować wyniku.');
 const cancel=localizedCalculator('pl',{shareError:{name:'AbortError'}});cancel.action('use-example');cancel.action('share-summary');await flush();assert.equal(cancel.copied.length,0);
 let succeeds=false;const retry=localizedCalculator('pl',{fetch:async()=>({ok:succeeds,status:503})});retry.action('clear-all');retry.edit('.expense-fields input','120');retry.action('track-split');await flush();assert.match(retry.query('[data-transfer-status]').textContent,/Podział nadal jest tutaj/);succeeds=true;retry.action('track-split');await flush();assert.equal(retry.navigations.length,1);assert.equal(JSON.parse(retry.requests[0][1].body).reference,JSON.parse(retry.requests[1][1].body).reference);
 let resolve;const stale=localizedCalculator('pl',{fetch:()=>new Promise(r=>{resolve=r})});stale.action('clear-all');stale.edit('.expense-fields input','120');stale.action('track-split');stale.edit('.expense-fields input','150');resolve({ok:true});await flush();assert.equal(stale.navigations.length,0);assert.equal(stale.api.calculate().total,150);
});

test('PL limits/removals and settled/selective results retain established controls',()=>{
 const e=localizedCalculator();e.action('clear-all');e.query('.remove-action').dispatchEvent({type:'click'});e.query('.remove-action').dispatchEvent({type:'click'});assert.equal(e.query('#people-message').textContent,'Dodaj co najmniej dwie osoby, aby podzielić wydatek.');
 for(let n=0;n<11;n++)e.action('add-person');assert.equal(e.api.state.people.length,12);assert.equal(e.query('#people-message').textContent,'Możesz dodać maksymalnie 12 osób.');for(let n=0;n<30;n++)e.action('add-expense');assert.equal(e.api.state.expenses.length,30);assert.equal(e.query('#people-message').textContent,'Możesz dodać maksymalnie 30 wydatków.');
 e.action('use-example');for(const cost of e.api.state.expenses){cost.amount='30';cost.includedPeople=e.api.state.people.map(p=>p.id);}e.api.render();assert.equal(e.api.calculate().transfers.length,0);assert.equal(e.query('[data-settlement]').textContent,'Wszyscy są rozliczeni.');e.action('clear-all');assert.equal(e.api.state.expenses[0].amount,'');assert.equal(e.api.state.currency,'zł');
});

test('PL dictionary preserves placeholders and all previous dictionaries/source bytes through precise admissions',async()=>{
 const e=localizedCalculator(),copy=JSON.parse(read('tests/fixtures/polish-split-copy.json'));assert.deepEqual(plain(e.window.UomiSplitExpenseLocales.pl),copy);assert.equal(Object.keys(copy).length,60);for(const [key,value]of Object.entries(copy))assert.deepEqual((key.match(/\{\w+\}/g)||[]).sort(),(value.match(/\{\w+\}/g)||[]).sort(),key);
 const before={};vm.runInNewContext(execFileSync('git',['show','ddb36b6d:scripts/split-expense-locale.js'],{encoding:'utf8'}),{window:before});for(const lang of Object.keys(before.UomiSplitExpenseLocales))assert.deepEqual(plain(e.window.UomiSplitExpenseLocales[lang]),plain(before.UomiSplitExpenseLocales[lang]),lang);
 const{normalizeReviewedPolishSplitSource}=await import('../tests/helpers/reviewed-language-copy.mjs');const admissions=JSON.parse(read('tests/fixtures/polish-split-reviewed-admissions.json'));for(const file of Object.keys(admissions.source)){assert.equal(normalizeReviewedPolishSplitSource(read(file),file),execFileSync('git',['show','ddb36b6d:'+file],{encoding:'utf8'}),file);assert.ok(normalizeReviewedPolishSplitSource(read(file)+'\n// UNAPPROVED',file).endsWith('// UNAPPROVED'));}const bytes=Buffer.from([255,254,128,0]);assert.equal(normalizeReviewedPolishSplitSource(bytes,'downloads/protected.xlsx'),bytes);
});

test('private Polish fragment is presentation only and preserves every existing static block/non-split file',()=>{
 const html=read('private-continuation/split/index.html'),before=execFileSync('git',['show','ddb36b6d:private-continuation/split/index.html'],{encoding:'utf8'});for(const lang of ['en','es','de','ar','fr','ja','pt','it']){const re=new RegExp(`<section id="${lang}"[\\s\\S]*?</section>`);assert.equal(html.match(re)[0],before.match(re)[0]);}
 const document=parseStaticPage(html);document.documentElement={lang:'en'};document.querySelectorAll('a').forEach(n=>n.removeAttribute=name=>n.attributes.delete(name));let change;const window={location:{hash:'#pl'},addEventListener(_,fn){change=fn}};vm.runInNewContext(read('private-continuation/split/locale.js'),{document,window});assert.equal(document.documentElement.lang,'pl');assert.equal(document.documentElement.dir,'ltr');assert.equal(document.querySelector('[data-language-navigation]').getAttribute('aria-label'),'Język strony');assert.equal(document.querySelectorAll('a').find(n=>n.getAttribute('href')==='#pl').getAttribute('aria-current'),'page');assert.equal(document.querySelectorAll('[data-locale]').length,9);assert.deepEqual(document.querySelectorAll('[data-locale]').filter(n=>!n.hidden).map(n=>n.getAttribute('data-locale')),['pl']);window.location.hash='#pt';change();assert.equal(document.documentElement.lang,'pt-BR');assert.doesNotMatch(read('private-continuation/split/locale.js'),/fetch\(|location\.search|cookie|localStorage|sessionStorage/);
 const files=execFileSync('git',['ls-tree','-r','--name-only','ddb36b6d','private-continuation'],{encoding:'utf8'}).trim().split('\n');for(const f of files.filter(f=>!['private-continuation/split/index.html','private-continuation/split/locale.js'].includes(f)))assert.deepEqual(fs.readFileSync(new URL('../'+f,import.meta.url)),execFileSync('git',['show','ddb36b6d:'+f]),f);for(const f of['firebase.exp003.json','.firebaserc'])assert.equal(read(f),execFileSync('git',['show','ddb36b6d:'+f],{encoding:'utf8'}),f);
});

test('PL calculator retains source hierarchy and precise current integration without hiding arbitrary anchor changes',async()=>{
 const html=read('pl/narzedzia/kalkulator-podzialu-wydatkow/index.html'),d=parseStaticPage(html),source=parseStaticPage(page),sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.id,n.getAttribute('aria-labelledby')]);assert.equal(sections(d).length,14);assert.deepEqual(sections(d),sections(source));assert.equal(d.querySelectorAll('.lt-toolCard').length,20);assert.equal(d.querySelectorAll('.best-next-step__card').length,3);const text=n=>n.textContent.trim().replace(/\s+/g,' '),faqs=d.querySelectorAll('.faq-list details').map(n=>[text(n.querySelector('summary')),text(n.querySelector('p'))]);assert.equal(faqs.length,13);const approved=JSON.parse(read('tests/fixtures/polish-split-page-copy.json'));assert.deepEqual(faqs,approved.faq);assert.deepEqual(d.querySelectorAll('.lt-toolCard').map(n=>[n.querySelector('a').getAttribute('href'),text(n.querySelector('h3')),text(n.querySelector('p')),text(n.querySelector('a'))]),approved.cards.map(row=>row[0]==='/blog/how-to-remind-someone-they-owe-you-money-politely/'?['/pl/blog/jak-poprosic-o-zwrot-pieniedzy/',row[1],row[2],row[3].replace(' (po angielsku)','')]:row));const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.deepEqual(graph.find(n=>n['@type']==='FAQPage').mainEntity.map(n=>[n.name,n.acceptedAnswer.text]),faqs);assert.equal(graph[0].inLanguage,'pl');assert.equal(graph[0].dateModified,'2026-11-06');assert.ok(html.indexOf('/scripts/polish-number-input.js')<html.indexOf('/scripts/split-expense-calculator.js'));assert.doesNotMatch(html,/<script[^>]+polish-number-input[^>]+defer/);assert.match(html,/id="pl-number-help"/);assert.doesNotMatch(read('sitemap.xml')+read('llms.txt'),/continue\.you-owe-me\.com|private-continuation/);
 const{normalizeReviewedPolishSplitIntegration}=await import('../tests/helpers/reviewed-language-copy.mjs');const present=new Set(execFileSync('git',['ls-tree','-r','--name-only','ddb36b6d'],{encoding:'utf8'}).trim().split('\n'));for(const f of execFileSync('git',['diff','--name-only','ddb36b6d','--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(f=>present.has(f)))assert.equal(normalizeReviewedPolishSplitIntegration(read(f)),execFileSync('git',['show','ddb36b6d:'+f],{encoding:'utf8'}),f);
 const a=JSON.parse(read('tests/fixtures/polish-split-reviewed-admissions.json')).inwardAnchors[0][0],changed=a.replace('href="','data-unapproved="x" href="');assert.equal(normalizeReviewedPolishSplitIntegration(changed),changed);const after=a.replace('" class=','" data-unapproved="x" class=');assert.equal(normalizeReviewedPolishSplitIntegration(after),after);
});
