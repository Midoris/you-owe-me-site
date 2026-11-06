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
function localizedCalculator(lang = "ja", options = {}) {
  const document = parseStaticPage(lang === "ja" ? read("ja/tools/split-expense-calculator/index.html") : page);
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
    '  window.testCalculator = {state, calculate, render, formatNumber, parseAmount, buildSummaryText, renderExpenseValidation, transferState, formatMoney, clearAll, useExample, restoreReturnState};\n  if (document.readyState === "loading")'), context);
  const query = selector => { const node = document.querySelector(selector); assert.ok(node, selector); return node; };
  const edit = (selector, value, type = "input") => {
    const node = query(selector); if (typeof value === "boolean") node.checked = value; else node.value = value;
    node.dispatchEvent({ type });
  };
  const action = name => query(`[data-action="${name}"]`).dispatchEvent({ type: "click" });
  return { document, window, api: window.testCalculator, query, edit, action, copied, shared, events, requests, navigations, storage, timers };
}

test('Japanese default example and clear/example cycles preserve exact selective-participant arithmetic without stale data',()=>{
 const e=localizedCalculator();let r=e.api.calculate();
 assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['悠太','美咲','葵']);assert.deepEqual(plain(e.api.state.expenses.map(p=>p.amount)),['9000','6000','3000']);
 assert.equal(r.total,18000);assert.deepEqual(plain(r.net.map(p=>[p.paid,p.share,p.net])),[[9000,6500,2500],[6000,5000,1000],[3000,6500,-3500]]);assert.deepEqual(plain(r.transfers.map(p=>[p.from,p.to,p.amount])),[['葵','悠太',2500],['葵','美咲',1000]]);
 assert.equal(e.api.state.currency,'円');assert.equal(e.query('[data-result-actions]').hidden,true);
 e.action('clear-all');assert.deepEqual(plain(e.api.state.expenses.map(p=>p.amount)),['']);assert.equal(e.api.calculate().validCount,0);assert.deepEqual(plain(e.api.state.people.map(p=>p.name)),['参加者1','参加者2','参加者3']);assert.equal(e.api.state.currency,'円');
 e.action('use-example');assert.equal(e.api.calculate().total,18000);assert.equal(e.query('[data-result-actions]').hidden,false);assert.equal(e.query('[data-tool-transfer]').hidden,true);
 e.action('clear-all');assert.equal(e.api.calculate().validCount,0);assert.equal(e.query('[data-result-actions]').hidden,true);
});

test('Japanese amount labels preserve fractions, explicit symbols, custom currencies and unchanged halfwidth/comma parsing',()=>{
 const e=localizedCalculator();for(const [label,wanted] of [['円','1,234.5円'],['','1,234.5円'],['¥','¥1,234.5'],['￥','￥1,234.5'],['$','$1,234.5'],['€','€1,234.5'],['£','£1,234.5'],['USD','1,234.5 USD']]){e.api.state.currency=label;assert.equal(e.api.formatMoney(1234.5),wanted);}
 for(const [raw,n] of [['1,234.50',1234.5],['1000',1000],['12,50',1250],['9000.25',9000.25]])assert.equal(e.api.parseAmount(raw),n);
 e.api.state.currency='円';e.api.state.people=[{id:'a',name:'悠太'},{id:'b',name:'美咲'},{id:'c',name:'葵'}];e.api.state.expenses=[{id:'one',description:'夕食',amount:'1000',paidBy:'a',includedPeople:['a','b','c']}];e.api.render();assert.deepEqual(plain(e.api.calculate().net.map(p=>p.share)),[333.33,333.33,333.33]);assert.match(e.api.buildSummaryText(e.api.calculate()),/333\.33円/);assert.equal(e.window.UomiToolTransfer.prepare(e.api.state).costs[0].amount,100000);
 e.api.state.currency='$';e.api.state.expenses[0].amount='0.29';e.api.state.people.pop();e.api.state.expenses[0].includedPeople=['a','b'];e.api.render();assert.equal(e.window.UomiToolTransfer.prepare(e.api.state),null);assert.match(e.api.buildSummaryText(e.api.calculate()),/\$0\.14/);
});

test('Japanese participant/expense limits, invalid selections and fully settled results retain the accepted capacity and eligibility boundaries',()=>{
 const e=localizedCalculator();for(let i=0;i<12;i++)e.action('add-person');assert.equal(e.api.state.people.length,12);assert.equal(e.query('#people-message').textContent,'参加者は12人まで追加できます。');
 e.action('clear-all');for(let i=0;i<30;i++)e.action('add-expense');assert.equal(e.api.state.expenses.length,30);assert.equal(e.query('#people-message').textContent,'費用は30件まで追加できます。');
 e.action('clear-all');const expense=e.api.state.expenses[0];expense.amount='0';e.api.render();assert.equal(e.api.calculate().validCount,0);assert.equal(e.window.UomiToolTransfer.prepare(e.api.state),null);expense.amount='9000';expense.includedPeople=[];e.api.render();assert.equal(e.api.calculate().validCount,0);assert.match(e.query('.expense-validation').textContent,/この費用を分ける人を1人以上選んでください。/);
 expense.includedPeople=[expense.paidBy];e.api.render();assert.equal(e.api.calculate().transfers.length,0);assert.equal(e.query('[data-settlement]').textContent,'差し引きの支払いはありません。');assert.equal(e.window.UomiToolTransfer.prepare(e.api.state),null);
 const fixtures=JSON.parse(read('tests/fixtures/tool-transfer-fixtures.json'));for(const fixture of fixtures){const state={currency:fixture.draft.currencyLabel,people:fixture.draft.participants,expenses:fixture.draft.costs.map(c=>({id:c.id,description:c.label,amount:(c.amount/100).toFixed(2),paidBy:c.payerID,includedPeople:c.participantIDs}))};const draft=e.window.UomiToolTransfer.prepare(state);if(fixture.expected)assert.deepEqual(plain(draft),fixture.draft,fixture.name);else assert.equal(draft,null,fixture.name);}
});

test('Japanese dictionary covers every accepted runtime key and preserves all previously published dictionaries byte-for-byte in meaning',()=>{
 const e=localizedCalculator(),expected=JSON.parse(read('tests/fixtures/japanese-split-copy.json')).runtime;assert.deepEqual(plain(e.window.UomiSplitExpenseLocales.ja),expected);
 const oldWindow={document:{documentElement:{lang:'en'}}};vm.runInNewContext(execFileSync('git',['show','0714b406:scripts/split-expense-locale.js'],{encoding:'utf8'}),{window:oldWindow});
 for(const lang of ['es','de','ar','fr']){assert.deepEqual(plain(e.window.UomiSplitExpenseLocales[lang]),plain(oldWindow.UomiSplitExpenseLocales[lang]));for(const key of Object.keys(oldWindow.UomiSplitExpenseLocales[lang]))assert.ok(key in expected,lang+': '+key);}
 const sourceKeys=[...calculator.matchAll(/(?:translate(?:Plain)?\(|message:\s*)"([^"]+)"/g)].map(m=>m[1]);for(const key of sourceKeys.filter(k=>!['Keep track as repayments come in','Create a record in You Owe Me for the amounts you need to track. Record each payment and keep the remaining balances clear.'].includes(k)))assert.ok(key in expected,key);
});

test('Japanese copying and native sharing use the edited result, Japanese canonical, exact text and truthful failure statuses',async()=>{
 const e=localizedCalculator();e.action('use-example');e.edit('.person-row input','長い名前の参加者');e.edit('.expense-fields input','12000');e.action('copy-summary');await flush();assert.equal(e.copied.length,1);assert.match(e.copied[0],/長い名前の参加者/);assert.match(e.copied[0],/共有した費用の合計：21,000円/);assert.ok(e.copied[0].endsWith('https://you-owe-me.com/ja/tools/split-expense-calculator/'));assert.equal(e.query('[data-copy-status]').textContent,'結果と計算ツールのリンクをコピーしました。');
 e.action('share-summary');await flush();assert.equal(e.shared[0].text,e.copied[0]);assert.equal(e.shared[0].title,'割り勘・精算の結果');assert.equal(e.query('[data-copy-status]').textContent,'結果を共有しました。');
 const fallback=localizedCalculator('ja',{clipboardFails:true,shareError:new Error('unavailable')});fallback.action('use-example');fallback.action('share-summary');await flush();assert.equal(fallback.copied.length,1);assert.equal(fallback.query('[data-copy-status]').textContent,'共有機能が使えなかったため、結果をコピーしました。');
 const failed=localizedCalculator('ja',{clipboardFails:true,fallbackFails:true,shareError:new Error('unavailable')});failed.action('use-example');failed.action('share-summary');await flush();assert.equal(failed.query('[data-copy-status]').textContent,'結果を共有・コピーできませんでした。');
 const empty=localizedCalculator();empty.action('clear-all');empty.action('copy-summary');await flush();assert.equal(empty.query('[data-copy-status]').textContent,'費用を入力してから結果をコピーしてください。');
});

test('Japanese native transfer is explicit, preserves hundredths and fallback labels, and recovers its exact fingerprint across French/Arabic/English both ways',async()=>{
 const accepted=JSON.parse(read('tests/fixtures/tool-transfer-fixtures.json')).filter(f=>f.expected);
 for(const fixture of accepted){const ja=localizedCalculator();Object.assign(ja.api.state,{currency:fixture.draft.currencyLabel,people:fixture.draft.participants,expenses:fixture.draft.costs.map(c=>({id:c.id,description:c.label,amount:(c.amount/100).toFixed(2),paidBy:c.payerID,includedPeople:c.participantIDs}))});assert.deepEqual(plain(ja.window.UomiToolTransfer.prepare(ja.api.state)),fixture.draft,fixture.name);}
 const e=localizedCalculator();e.action('clear-all');const expense=e.api.state.expenses[0];e.api.state.people[1].name='';expense.description='';e.edit(`#amount-${expense.id}`,'1000');assert.equal(e.requests.length,0);e.action('track-split');await flush();assert.equal(e.requests.length,1);const payload=JSON.parse(e.requests[0][1].body);assert.equal(payload.draft.costs[0].amount,100000);assert.equal(payload.draft.costs[0].label,'共有した費用');assert.equal(payload.draft.participants[1].name,'参加者2');assert.ok(e.navigations[0].endsWith('#ja'));
 const snapshot=JSON.parse(e.storage.get('uomi-exp003-return'));const fingerprint=snapshot.transferAttempt.fingerprint;
 for(const lang of ['fr','ar','en']){const other=localizedCalculator(lang,{storage:[['uomi-exp003-return',JSON.stringify(snapshot)]]});assert.equal(JSON.stringify(other.window.UomiToolTransfer.prepare(other.api.transferState())),fingerprint);const back={locale:lang,state:plain(other.api.state),transferAttempt:snapshot.transferAttempt};const ja=localizedCalculator('ja',{storage:[['uomi-exp003-return',JSON.stringify(back)]]});assert.equal(JSON.stringify(ja.window.UomiToolTransfer.prepare(ja.api.transferState())),fingerprint);assert.equal(ja.api.state.expenses[0].amount,'1000.00');}
 const failed=localizedCalculator('ja',{fetch:async()=>({ok:false,status:503})});failed.action('clear-all');failed.edit('.expense-fields input','1000');failed.action('track-split');await flush();assert.equal(failed.query('[data-transfer-status]').textContent,'引き継ぎを準備できませんでした。入力内容はこの画面に残っています。もう一度試すか、結果をコピーしてください。');assert.equal(failed.api.calculate().total,1000);
});

test('Japanese page retains the full source structure, exact FAQ/schema pairs and all twenty related destinations with truthful English labels',()=>{
 const html=read('ja/tools/split-expense-calculator/index.html'),d=parseStaticPage(html),expected=JSON.parse(read('tests/fixtures/japanese-split-copy.json')),original=parseStaticPage(page),t=n=>n.textContent.trim().replace(/\s+/g,' ');
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.id,n.getAttribute('aria-labelledby')]);
 assert.equal(sections(d).length,14);assert.deepEqual(sections(d),sections(original));assert.equal(d.querySelectorAll('.best-next-step__card').length,3);assert.equal(d.querySelectorAll('.lt-toolCard').length,20);
 d.querySelectorAll('.lt-toolCard').forEach((card,i)=>assert.deepEqual(['h3','p','a'].map(s=>t(card.querySelector(s))),expected.cards[i].map((v,j)=>i===5&&j===2?v.replace("（英語）",""):v)));const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.equal(graph[0].name,expected.title);assert.equal(graph[0].description,expected.description);assert.equal(graph[0].inLanguage,'ja');assert.equal(graph[0].dateModified,'2026-11-05');assert.equal(d.querySelector('title').textContent,expected.title);
 assert.deepEqual(d.querySelectorAll('.faq-list details').map(n=>[t(n.querySelector('summary')),t(n.querySelector('p'))]),expected.faq);assert.deepEqual(graph[2].mainEntity.map(n=>[n.name,n.acceptedAnswer.text]),expected.faq);
 for(const n of d.querySelectorAll('#main a')){const h=n.getAttribute('href');if(h.startsWith('/')&&!h.startsWith('/ja/'))assert.ok(t(n).includes('（英語）'),h);}
 const attrs=n=>[...n.attributes].filter(([k])=>k==='href'||k.startsWith('data-'));assert.deepEqual(d.querySelectorAll('.best-next-step__card').map(attrs),original.querySelectorAll('.best-next-step__card').map(attrs));
 assert.match(html,/計算にはJavaScriptが必要です/);assert.match(html,/円でも端数が出る場合/);assert.doesNotMatch(html,/ppid=|apps\.apple\.com\/us\//);
});

test('Japanese private continuation is presentation-only and preserves every existing language block and non-split private byte',()=>{
 const html=read('private-continuation/split/index.html'),before=execFileSync('git',['show','0714b406:private-continuation/split/index.html'],{encoding:'utf8'});
 for(const lang of ['en','es','de','ar','fr']){const re=new RegExp(`<section id="${lang}"[\\s\\S]*?</section>`);assert.equal(html.match(re)[0],before.match(re)[0]);}assert.equal((html.match(/data-locale=/g)||[]).length,9);assert.match(html,/data-locale="ja"/);assert.match(html,/href="https:\/\/you-owe-me.com\/ja\/tools\/split-expense-calculator\/"/);assert.match(html,/noindex,nofollow,noarchive/);assert.match(html,/no-referrer/);assert.doesNotMatch(read('private-continuation/split/locale.js'),/fetch\(|location\.search|\.cookie|localStorage|sessionStorage/);
 const privateFiles=execFileSync('git',['ls-tree','-r','--name-only','0714b406','private-continuation'],{encoding:'utf8'}).trim().split('\n').filter(f=>!['private-continuation/split/index.html','private-continuation/split/locale.js'].includes(f));for(const f of [...privateFiles,'firebase.exp003.json','.firebaserc'])assert.deepEqual(fs.readFileSync(new URL('../'+f,import.meta.url)),execFileSync('git',['show','0714b406:'+f]),f);
});
