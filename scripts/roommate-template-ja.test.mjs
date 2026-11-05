import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { normalizeReviewedJapaneseRoommateIntegration } from '../tests/helpers/reviewed-language-copy.mjs';
import { localizedSourceRoute, sharedAssetVersions } from '../content/site-locales.mjs';
import { renderLocaleHtml } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
const route='/ja/tools/roommate-expense-tracker-template/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/roommate-expense-tracker-template-ja.js');
const expected=JSON.parse(read('tests/fixtures/japanese-roommate-template-copy.json'));
function runtime(options={}){
 const env=pageRuntime(page,options);
 const decorate=node=>{node.remove=()=>node.parentNode?.removeChild(node);return node;};
 env.document.querySelectorAll('*').forEach(decorate);
 const create=env.document.createElement;
 env.document.createElement=tag=>decorate(create(tag));
 env.window.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>env.selections.at(-1)?.textContent.trim()||''});
 env.run(controller);return env;
}

test('Japanese roommate page retains exact summary payload,9matching FAQ and completed counterpart',()=>{
 const env=runtime();
 assert.equal(env.query('#roommate-summary-message').textContent,expected.message);
 assert.equal(env.query('[data-copy-target]').hidden,false);
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 assert.equal(graph[0].inLanguage,'ja');
 assert.match(page,/<html lang="ja" dir="ltr">/);
 const downloadLinks=env.document.querySelectorAll('a').filter(node=>node.hasAttribute('download'));
 assert.equal(downloadLinks.length,5);
 assert.ok(downloadLinks.every(node=>node.getAttribute('download')==='roommate-expense-tracker.'+(node.getAttribute('href').endsWith('.csv')?'csv':'xlsx')));
 assert.deepEqual(graph.find(node=>node['@type']==='FAQPage').mainEntity.map(node=>({question:node.name,answer:node.acceptedAnswer.text})),expected.faq);
 assert.deepEqual(env.document.querySelectorAll('.roommate-template-faq-list details').map(node=>({question:node.querySelector('summary').textContent,answer:node.querySelector('p').textContent})),expected.faq);
 assert.equal(localizedSourceRoute(route),'/tools/roommate-expense-tracker-template/');
 assert.equal(renderLocaleHtml(page,'/tools/roommate-expense-tracker-template/','ja'),page);
 assert.ok(!page.includes('DRAFT-NOT-FOR-RELEASE'));
 const googleLinks=env.document.querySelectorAll('a').filter(node=>node.getAttribute('href')?.includes('docs.google.com/spreadsheets/'));
 assert.equal(googleLinks.length,3);
 assert.ok(googleLinks.every(node=>node.getAttribute('href')==='https://docs.google.com/spreadsheets/d/1FrJtMHAwVo7Md7dmn1_Q1T0SKMKvMp6tGQ-lJoN0a2g/copy'));
 assert.ok(!page.includes('money-story'));
 assert.match(page,/width="1536" height="1024"/);
 assert.equal(env.query('.roommate-template-file-meta').textContent,`Excelファイル・${Math.round(fs.statSync(new URL('../downloads/ja/roommate-expense-tracker.xlsx',import.meta.url)).size/1024)} KB`);
});

test('Japanese related cards preserve the original analytics metadata shape and stable source key',()=>{
 const env=runtime(),original=pageRuntime(read('tools/roommate-expense-tracker-template/index.html'));
 const cards=env.document.querySelectorAll('.best-next-step__card'),old=original.document.querySelectorAll('.best-next-step__card');
 assert.equal(cards.length,4);
 for(let i=0;i<4;i++){
  const attrs=Object.fromEntries([...cards[i].attributes].filter(([key])=>key.startsWith('data-')));
  const expectedAttrs=Object.fromEntries([...old[i].attributes].filter(([key])=>key.startsWith('data-')));
  expectedAttrs['data-track-location']='ja_'+expectedAttrs['data-track-location'];
  expectedAttrs['data-step-destination']=cards[i].getAttribute('href');
  assert.deepEqual(attrs,expectedAttrs);
  assert.equal(attrs['data-source-page'],'tools_roommate_expense_tracker_template');
 }
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`Japanese summary copy preserves exact payload and private data boundary through ${scenario}`,async()=>{
 const env=runtime({clipboardFails:!['api','pending'].includes(scenario),fallbackFails:['manual','terminal'].includes(scenario)});
 if(scenario==='terminal')env.document.createRange=()=>{throw Error('No selection');};
 const button=env.query('[data-copy-target]'),status=env.query('.roommate-template-copy-status');
 button.focus();let release;
 if(scenario==='pending')env.context.navigator.clipboard.writeText=text=>new Promise(resolve=>{release=()=>{env.copied.push(text);resolve();};});
 await env.click('[data-copy-target]');
 if(scenario==='pending'){
  assert.equal(button.getAttribute('aria-busy'),'true');assert.equal(button.textContent,expected.ui.busy);
  await env.click('[data-copy-target]');assert.equal(env.copied.length,0);
  release();for(let i=0;i<10;i++)await Promise.resolve();
 }
 assert.equal(button.hasAttribute('aria-busy'),false);assert.equal(env.document.activeElement,button);
 if(['api','fallback','pending'].includes(scenario)){
  assert.deepEqual(env.copied,[expected.message]);assert.equal(button.textContent,expected.ui.success);assert.equal(status.textContent,expected.ui.successStatus);
 }else{
  assert.equal(env.copied.length,0);assert.equal(status.textContent,expected.ui[scenario==='manual'?'manual':'failure']);
  if(scenario==='manual')assert.equal(env.window.getSelection().toString(),expected.message);
 }
 assert.equal(env.events.length,0);assert.equal(env.document.querySelectorAll('textarea').length,0);
 env.timers.at(-1)();assert.equal(button.textContent,expected.ui.initial);
});

test('Japanese template handoff forwards only the existing allowlisted location',()=>{
 const listeners=new Map(),logged=[];
 bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(name,callback)=>listeners.set(name,callback)},trackEvent:(name,detail)=>logged.push({name,detail})});
 listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'ja_roommate_template_iphone_handoff',household:'never forwarded'}});
 assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'ja_roommate_template_iphone_handoff'}}]);
});


test('Japanese page preserves exact parent-approved active copy, section order, schema and safe resource semantics',()=>{
 const env=runtime(),doc=env.document,main=doc.querySelector('#main');
 const corpus=main.textContent+' '+read('content/site-locales.mjs')+' '+pageRuntime(read('tools/index.html')).document.querySelector('#main').textContent+' '+pageRuntime(read('ja/tools/split-expense-calculator/index.html')).document.querySelector('#main').textContent+' '+pageRuntime(read('ja/blog/how-to-keep-track-of-who-owes-you-money/index.html')).document.querySelector('#main').textContent+' '+doc.querySelectorAll('[alt]').map(n=>n.getAttribute('alt')).join(' ')+' '+doc.querySelectorAll('[aria-label]').map(n=>n.getAttribute('aria-label')).join(' ')+' '+page+' '+controller;
 for(const [section,strings]of Object.entries(expected.sections))for(const value of strings){if(value.startsWith('/')||value.includes('{actual rounded KB}'))continue;assert.ok(corpus.includes(value),section+': '+value);}
 assert.equal(doc.querySelector('title').textContent,expected.title);assert.equal(doc.querySelector('meta[name="description"]').getAttribute('content'),expected.description);
 assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'),'https://you-owe-me.com'+route);
 const source=pageRuntime(read('fr/outils/tableau-depenses-colocation/index.html')).document;
 assert.deepEqual(doc.querySelectorAll('#main section').map(n=>n.getAttribute('aria-labelledby')),source.querySelectorAll('#main section').map(n=>n.getAttribute('aria-labelledby')));
 assert.equal(doc.querySelectorAll('.roommate-template-table-scroll').length,5);
 for(const table of doc.querySelectorAll('.roommate-template-table-scroll')){assert.equal(table.getAttribute('tabindex'),'0');assert.equal(table.getAttribute('role'),'region');assert.ok(table.getAttribute('aria-label'));}
 assert.ok(!doc.querySelector('.site-japanese-disclosure').hasAttribute('open'));
 assert.equal(doc.querySelectorAll('.roommate-template-callout-grid article').length,3);
 for(const a of doc.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/ja/')&&!href.startsWith('/downloads/'))assert.ok(a.textContent.includes('（英語）'),href);if(href?.includes('apps.apple.com'))assert.equal(href,'https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8');}
 assert.doesNotMatch(page,/DRAFT|PLACEHOLDER|ppid=|money-story/);
 const noJS=pageRuntime(page);assert.equal(noJS.query('[data-copy-target]').hidden,true);assert.ok(noJS.document.querySelectorAll('noscript').some(n=>n.textContent.includes('JavaScriptが無効です。テキストを選択してコピーできます。')));
 const localized='月をまたいで共通の支出と精算を残したい場合は、<a href="'+route+'">ルームシェアの家計・精算表</a>を使えます。日本語のExcel・Googleスプレッドシートテンプレートと、記録用CSVを用意しています。';
 assert.ok(read('ja/tools/split-expense-calculator/index.html').includes(localized));
});

test('Japanese template allows only exact approved integration changes against the immutable LOC16 source',()=>{
 const base='e32a337ae360f6c4817cd38622892d69bf6b75e4';
 for(const file of execFileSync('git',['diff','--name-only','--diff-filter=M',base,'--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(Boolean))assert.equal(normalizeReviewedJapaneseRoommateIntegration(read(file)),execFileSync('git',['show',base+':'+file],{encoding:'utf8'}),file);
 const nav='\n              <a href="'+route+'">ルームシェアの家計・精算表</a>';
 assert.equal(normalizeReviewedJapaneseRoommateIntegration(nav),'');assert.notEqual(normalizeReviewedJapaneseRoommateIntegration(nav.replace('href=','data-unapproved="x" href=')),'');
 assert.equal(read('scripts/analytics.js').replaceAll('pt20261105','jaroommate20261105').replaceAll('jaroommate20261105','jaborrow20261105'),execFileSync('git',['show',base+':scripts/analytics.js'],{encoding:'utf8'}));
 assert.equal(read('scripts/iphone-handoff-analytics-bridge.mjs').replace('  "ja_roommate_template_iphone_handoff",\n',''),execFileSync('git',['show',base+':scripts/iphone-handoff-analytics-bridge.mjs'],{encoding:'utf8'}));
 for(const file of ['scripts/roommate-expense-tracker-template.js','scripts/roommate-expense-tracker-template-fr.js','scripts/roommate-expense-tracker-template-es.js','scripts/roommate-expense-tracker-template-de.js','scripts/roommate-expense-tracker-template-ar.js','styles/roommate-expense-tracker-template.css','images/ja/app-store/download-on-the-app-store-black.svg','images/ja/iphone-handoff/app-store.png','downloads/roommate-expense-tracker-template.xlsx','downloads/roommate-expense-tracker-template.csv'])assert.deepEqual(fs.readFileSync(new URL('../'+file,import.meta.url)),execFileSync('git',['show',base+':'+file]),file);
 const translations=[[expected.ui.initial,'Copier le message'],[expected.ui.busy,'Copie en cours…'],[expected.ui.success,'Copié'],[expected.ui.successStatus,'Le message a été copié.'],[expected.ui.manual,'Le texte est sélectionné. Utilisez la commande Copier de votre appareil.'],[expected.ui.failure,'La copie a échoué. Sélectionnez le message et copiez-le manuellement.']];
 let normalized=controller.replace('site-lang-ja','site-lang-fr');for(const [ja,fr]of translations)normalized=normalized.replace(ja,fr);assert.equal(normalized,read('scripts/roommate-expense-tracker-template-fr.js'));
});
