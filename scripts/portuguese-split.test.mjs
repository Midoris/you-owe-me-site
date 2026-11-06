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
function localizedCalculator(lang = "pt-BR", options = {}) {
  const document = parseStaticPage(page);
  document.documentElement = { lang };
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

const accepted=[['12,50',12.5],['1.234,50',1234.5],['1234.50',1234.5],['1 234,50',1234.5],['1\u00a0234,50',1234.5],['1\u202f234,50',1234.5],['1 234.50',1234.5],['1.234',1234],['12.345',12345],['1.234.567,89',1234567.89],['0,01',.01],['0.01',.01],['0',0],['00012,50',12.5]];
const rejected=['0.001','01.234','1234.567','12,345','1,234.50','1.23,45','12 34,50','1.234 567,89','1e3','-1','+1','R$ 10','','Infinity','NaN','1,','1.','1\t234,50'];
test('PT input boundary recognizes native grouping and canonical cents without coercing invalid forms',()=>{
 const e=localizedCalculator(),parser=e.window.UomiPortugueseNumberInput;
 for(const [raw,number] of accepted){assert.equal(Number(parser.normalizeAmount(raw)),number,raw);assert.equal(e.api.parseAmount(raw),number,raw);}
 for(const raw of rejected){assert.equal(parser.normalizeAmount(raw),null,raw);assert.equal(e.api.parseAmount(raw),0,raw);}
 for(const n of [1234.5,90,0,.01,.29])assert.equal(parser.normalizeAmount(n),String(n));for(const n of [1.234,1.000000001,1e-9,-1,NaN,Infinity])assert.equal(parser.normalizeAmount(n),null);
 for(const canonical of ['1234.00','0.01','1000000.00'])assert.equal(parser.normalizeAmount(canonical),canonical);
});
test('PT default example, clear and money formatting keep arithmetic/selective participation and integer counts',()=>{
 const e=localizedCalculator();assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['Lucas','Marina','Bruno']);assert.equal(e.api.state.currency,'R$');
 const r=e.api.calculate();assert.equal(r.total,180);assert.deepEqual(plain(r.net.map(p=>[p.paid,p.share,p.net])),[[90,65,25],[60,50,10],[30,65,-35]]);assert.deepEqual(plain(r.transfers.map(p=>[p.from,p.to,p.amount])),[['Bruno','Lucas',25],['Bruno','Marina',10]]);
 assert.equal(e.api.formatMoney(1234.5),'R$ 1.234,50');assert.equal(e.api.formatMoney(90),'R$ 90,00');assert.match(e.query('[data-summary]').textContent,/Pessoas3Despesas incluídas3$/);
 for(const [label,wanted]of[['','R$ 12,50'],['USD','USD 12,50'],['€','€12,50']]){e.api.state.currency=label;assert.equal(e.api.formatMoney(12.5),wanted);}
 e.action('clear-all');assert.equal(e.api.calculate().validCount,0);assert.equal(e.api.state.expenses[0].amount,'');assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['Pessoa 1','Pessoa 2','Pessoa 3']);assert.equal(e.api.state.currency,'R$');e.action('use-example');assert.equal(e.api.calculate().total,180);
});
test('PT raw localized amount survives editing while validation/calculation/copy/share/native see one value',async()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0],selector=`#amount-${expense.id}`;
 assert.equal(e.query(selector).type,'text');assert.equal(e.query(selector).inputMode,'decimal');assert.match(e.query(selector).getAttribute('aria-describedby'),/pt-number-help/);
 e.edit(selector,'1.234,50');assert.equal(expense.amount,'1.234,50');assert.equal(e.api.calculate().total,1234.5);assert.equal(e.api.transferState().expenses[0].amount,'1234.50');assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()).costs[0].amount,123450);
 e.action('copy-summary');await flush();e.action('share-summary');await flush();assert.equal(e.copied[0],e.shared[0].text);assert.match(e.copied[0],/Total das despesas: R\$ 1\.234,50/);assert.match(e.copied[0],/https:\/\/you-owe-me.com\/pt\/ferramentas\/calculadora-dividir-despesas\/$/);assert.equal(e.shared[0].title,'Resumo da divisão de despesas');
 assert.equal(e.requests.length,0);e.action('track-split');await flush();assert.equal(JSON.parse(e.requests[0][1].body).draft.costs[0].amount,123450);assert.match(e.navigations[0],/#pt$/);assert.doesNotMatch(e.navigations[0],/#pt-BR/);
 assert.ok(e.events.every(event=>Object.keys(event.detail).join(',')==='eventName'));
});
test('PT invalid/empty/zero amount cannot transfer; native bounds and rounding mismatch remain exact',()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0];
 for(const raw of [...rejected,'0']){expense.amount=raw;e.api.render();assert.equal(e.api.calculate().validCount,0,raw);assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null,raw);assert.equal(e.query('[data-tool-transfer]').hidden,true,raw);}
 expense.amount='0.001';e.api.render();assert.equal(e.query('.expense-validation').textContent,'Digite um valor como 1234,50 ou 1.234,50, com até duas casas decimais.');assert.equal(e.query('.expense-fields input').getAttribute('aria-invalid'),'true');
 expense.amount='1.000.000,00';assert.ok(e.window.UomiToolTransfer.prepare(e.api.transferState()));expense.amount='1.000.000,01';assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);
 e.api.state.people.pop();expense.includedPeople=e.api.state.people.map(p=>p.id);expense.amount='0,29';e.api.render();assert.equal(e.window.UomiToolTransfer.prepare(e.api.transferState()),null);assert.match(e.api.buildSummaryText(e.api.calculate()),/R\$ 0,14/);
 expense.amount='1000';e.api.state.people.push({id:'third',name:'C'});expense.includedPeople.push('third');e.api.render();assert.match(e.api.buildSummaryText(e.api.calculate()),/R\$ 333,33/);
});
test('PT return restores accepted cents across en/fr/ar/ja both ways and retains only matching same-PT raw grouping',async()=>{
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0];expense.description='';e.api.state.people[1].name='';e.edit(`#amount-${expense.id}`,'1.234');e.action('track-split');await flush();
 const payload=JSON.parse(e.requests[0][1].body);assert.equal(payload.draft.costs[0].amount,123400);assert.equal(payload.draft.costs[0].label,'Despesa compartilhada');assert.equal(payload.draft.participants[1].name,'Pessoa 2');
 const snapshot=JSON.parse(e.storage.get('uomi-exp003-return')),fingerprint=snapshot.transferAttempt.fingerprint;
 const same=localizedCalculator('pt-BR',{storage:[['uomi-exp003-return',JSON.stringify(snapshot)]]});assert.equal(same.api.state.expenses[0].amount,'1.234');
 for(const lang of ['en','fr','ar','ja']){const other=localizedCalculator(lang,{storage:[['uomi-exp003-return',JSON.stringify(snapshot)]]});assert.equal(other.api.state.expenses[0].amount,'1234.00');assert.equal(JSON.stringify(other.window.UomiToolTransfer.prepare(other.api.transferState())),fingerprint,lang);const back={locale:lang,state:plain(other.api.state),transferAttempt:snapshot.transferAttempt};const pt=localizedCalculator('pt-BR',{storage:[['uomi-exp003-return',JSON.stringify(back)]]});assert.equal(pt.api.state.expenses[0].amount,'1234.00');assert.equal(JSON.stringify(pt.window.UomiToolTransfer.prepare(pt.api.transferState())),fingerprint);}
 const changed=plain(snapshot);changed.state.expenses[0].amount='12,50';const restored=localizedCalculator('pt-BR',{storage:[['uomi-exp003-return',JSON.stringify(changed)]]});assert.equal(restored.api.state.expenses[0].amount,'1234.00');assert.equal(JSON.stringify(restored.window.UomiToolTransfer.prepare(restored.api.transferState())),fingerprint);
});
test('PT share cancellation/fallback/failure and transfer retry/stale edit preserve current local calculation',async()=>{
 const fallback=localizedCalculator('pt-BR',{clipboardFails:true,shareError:new Error('unavailable')});fallback.action('use-example');fallback.action('share-summary');await flush();assert.equal(fallback.copied.length,1);assert.equal(fallback.query('[data-copy-status]').textContent,'Não foi possível abrir o compartilhamento. O resultado foi copiado.');
 const failed=localizedCalculator('pt-BR',{clipboardFails:true,fallbackFails:true,shareError:new Error('unavailable')});failed.action('use-example');failed.action('share-summary');await flush();assert.equal(failed.query('[data-copy-status]').textContent,'Não foi possível compartilhar nem copiar o resultado.');
 const cancel=localizedCalculator('pt-BR',{shareError:{name:'AbortError'}});cancel.action('use-example');cancel.action('share-summary');await flush();assert.equal(cancel.copied.length,0);
 let succeeds=false;const retry=localizedCalculator('pt-BR',{fetch:async()=>({ok:succeeds,status:503})});retry.action('clear-all');retry.edit('.expense-fields input','120');retry.action('track-split');await flush();assert.match(retry.query('[data-transfer-status]').textContent,/Sua divisão continua/);succeeds=true;retry.action('track-split');await flush();assert.equal(retry.navigations.length,1);assert.equal(JSON.parse(retry.requests[0][1].body).reference,JSON.parse(retry.requests[1][1].body).reference);
 let resolve;const stale=localizedCalculator('pt-BR',{fetch:()=>new Promise(r=>{resolve=r})});stale.action('clear-all');stale.edit('.expense-fields input','120');stale.action('track-split');stale.edit('.expense-fields input','150');resolve({ok:true});await flush();assert.equal(stale.navigations.length,0);assert.equal(stale.api.calculate().total,150);
});
test('PT dictionary and precise source admissions preserve all previous dictionaries and original runtime bytes',async()=>{
 const e=localizedCalculator();assert.deepEqual(plain(e.window.UomiSplitExpenseLocales['pt-BR']),JSON.parse(read('tests/fixtures/portuguese-split-copy.json')));
 const oldWindow={document:{documentElement:{lang:'en'}}};vm.runInNewContext(execFileSync('git',['show','eb14092c:scripts/split-expense-locale.js'],{encoding:'utf8'}),{window:oldWindow});for(const lang of ['es','de','ar','fr','ja'])assert.deepEqual(plain(e.window.UomiSplitExpenseLocales[lang]),plain(oldWindow.UomiSplitExpenseLocales[lang]));
 const{normalizeReviewedPortugueseSplitSource}=await import('../tests/helpers/reviewed-language-copy.mjs');for(const file of ['scripts/split-expense-calculator.js','scripts/split-expense-locale.js','scripts/tool-transfer.js','private-continuation/split/index.html','private-continuation/split/locale.js']){assert.equal(normalizeReviewedPortugueseSplitSource(read(file),file),execFileSync('git',['show','eb14092c:'+file],{encoding:'utf8'}),file);assert.ok(normalizeReviewedPortugueseSplitSource(read(file)+'\n// UNAPPROVED',file).endsWith('// UNAPPROVED'));}
});
test('private PT fragment selects presentation without accessing payload and all seven static blocks remain readable',()=>{
 const html=read('private-continuation/split/index.html'),before=execFileSync('git',['show','eb14092c:private-continuation/split/index.html'],{encoding:'utf8'});for(const lang of ['en','es','de','ar','fr','ja']){const re=new RegExp(`<section id="${lang}"[\\s\\S]*?</section>`);assert.equal(html.match(re)[0],before.match(re)[0]);}
 const document=parseStaticPage(html);document.documentElement={lang:'en'};document.querySelectorAll('a').forEach(n=>n.removeAttribute=name=>n.attributes.delete(name));const window={location:{hash:'#pt'},addEventListener(){}};vm.runInNewContext(read('private-continuation/split/locale.js'),{document,window});assert.equal(document.documentElement.lang,'pt-BR');assert.equal(document.documentElement.dir,'ltr');assert.equal(document.querySelector('[data-language-navigation]').getAttribute('aria-label'),'Idioma da página');assert.equal(document.querySelectorAll('a').find(n=>n.getAttribute('href')==='#pt').getAttribute('aria-current'),'page');assert.equal(document.querySelectorAll('[data-locale]').length,9);assert.equal(document.querySelectorAll('[data-locale]').filter(e=>!e.hidden).length,1);assert.equal(document.querySelector('[data-locale="pt"]').hidden,false);assert.doesNotMatch(read('private-continuation/split/locale.js'),/fetch\(|location\.search|cookie|localStorage|sessionStorage/);
});
test('PT calculator retains source structure, FAQ/schema, directory/tracking and exact current integration',async()=>{
 const html=read('pt/ferramentas/calculadora-dividir-despesas/index.html'),d=parseStaticPage(html),original=parseStaticPage(page),text=n=>n.textContent.trim().replace(/\s+/g,' '),sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.id,n.getAttribute('aria-labelledby')]);assert.equal(sections(d).length,14);assert.deepEqual(sections(d),sections(original));assert.equal(d.querySelectorAll('.lt-toolCard').length,20);assert.equal(d.querySelectorAll('.best-next-step__card').length,3);
 const faqs=d.querySelectorAll('.faq-list details').map(n=>[text(n.querySelector('summary')),text(n.querySelector('p'))]);assert.equal(faqs.length,13);const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.deepEqual(graph.find(n=>n['@type']==='FAQPage').mainEntity.map(n=>[n.name,n.acceptedAnswer.text]),faqs);assert.equal(graph[0].inLanguage,'pt-BR');assert.equal(graph[0].dateModified,'2026-11-05');
 for(const a of d.querySelectorAll('#main a')){const h=a.getAttribute('href');if(h?.startsWith('/')&&!h.startsWith('/pt/'))assert.ok(text(a).includes('(em inglês)'),h);if(h?.startsWith('#'))assert.ok(d.querySelector(h),h);}
 const sources=['pt/index.html','pt/solucoes/app-para-controlar-quem-te-deve/index.html','pt/blog/como-controlar-quem-te-deve-dinheiro/index.html'];for(const f of sources){const doc=parseStaticPage(read(f)),a=doc.querySelectorAll('a').filter(n=>n.getAttribute('href')==='/pt/ferramentas/calculadora-dividir-despesas/');assert.ok(a.length>=2);assert.ok(a.every(n=>!text(n).includes('(em inglês)')));}
 assert.ok(html.indexOf('/scripts/portuguese-number-input.js')<html.indexOf('/scripts/split-expense-calculator.js'));assert.doesNotMatch(html,/<script[^>]+portuguese-number-input[^>]+defer/);assert.match(html,/id="pt-number-help"/);assert.match(html,/precisa de JavaScript/);assert.doesNotMatch(read('sitemap.xml')+read('llms.txt'),/continue\.you-owe-me\.com|private-continuation/);
 const{normalizeReviewedPortugueseSplitIntegration}=await import('../tests/helpers/reviewed-language-copy.mjs');const present=new Set(execFileSync('git',['ls-tree','-r','--name-only','eb14092c'],{encoding:'utf8'}).trim().split('\n'));for(const f of execFileSync('git',['diff','--name-only','eb14092c'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html')&&present.has(f)))assert.equal(normalizeReviewedPortugueseSplitIntegration(read(f)),execFileSync('git',['show','eb14092c:'+f],{encoding:'utf8'}),f);
});
