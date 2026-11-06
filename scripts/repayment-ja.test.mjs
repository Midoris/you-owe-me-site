import {normalizeReviewedPortugueseRepaymentSource} from '../tests/helpers/reviewed-language-copy.mjs';
import {normalizeReviewedPortugueseSplitSource} from '../tests/helpers/reviewed-language-copy.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { siteLocales, localizedSourceRoute } from '../content/site-locales.mjs';
import { contentRegistry } from '../content/content-registry.mjs';
import { renderLocaleHtml, renderLocaleDiscovery } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
import { normalizeReviewedJapaneseRepaymentIntegration } from '../tests/helpers/reviewed-language-copy.mjs';
const route='/ja/blog/how-to-remind-someone-they-owe-you-money-politely/';
const sourceRoute='/blog/how-to-remind-someone-they-owe-you-money-politely/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/repayment-ja.js');
const approved=JSON.parse(read('tests/fixtures/japanese-repayment-copy.json'));
const expected={messages:approved.messages.map(v=>({template:'ja_repayment_'+v.key,tone:v.tone,payload:v.text})),record:approved.record.text,faq:approved.faq.map(v=>({question:v.q,answer:v.a})),ui:{'Busy label':approved.copyUI.busy,'Successful button label':approved.copyUI.successButton,'Successful live status':approved.copyUI.successStatus,'Manual selection status':approved.copyUI.manualSelected,'Terminal failure status':approved.copyUI.failure,'Initial record label':approved.copyUI.record,'Initial message label':approved.copyUI.message}};
const records=[...expected.messages,{template:'ja_repayment_record',tone:'neutral',payload:expected.record}];
function runtime(options={}) {
 const env=pageRuntime(page,options);
 const remove=node=>{node.remove=()=>node.parentNode?.removeChild(node);return node;};
 env.document.querySelectorAll('*').forEach(remove);
 const create=env.document.createElement;
 env.document.createElement=tag=>remove(create(tag));
 env.window.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>env.selections.at(-1)?.textContent.trim()||''});
 env.run(controller);
 return env;
}
const buttonSelector=record=>`[data-copy-template="${record.template}"]`;

test('Japanese repayment guide retains reviewed payloads, matching FAQ, official badge and admitted routing',()=>{
 const env=runtime();
 assert.equal(env.document.querySelectorAll('.template-card').length,10);
 assert.equal(env.document.querySelectorAll('[data-copy-template]').length,11);
 for(const record of records){
  const button=env.query(buttonSelector(record));
  assert.equal(button.closest('.repayment-ja-card').querySelector('.template-card__message').textContent.trim(),record.payload);
  assert.equal(button.dataset.tone,record.tone);
  assert.equal(button.dataset.category,'repayment');
  assert.equal(button.hidden,false);
 }
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 const faq=graph.find(node=>node['@type']==='FAQPage');
 assert.equal(faq.inLanguage,'ja');
 assert.deepEqual(faq.mainEntity.map(node=>({question:node.name,answer:node.acceptedAnswer.text})),expected.faq);
 const visible=env.document.querySelectorAll('.repayment-ja-faq details');
 assert.deepEqual(visible.map(node=>({question:node.querySelector('summary').textContent,answer:node.querySelector('p').textContent})),expected.faq);
 assert.equal(localizedSourceRoute(route),sourceRoute);
 assert.equal(contentRegistry.length,152);
 const registry=contentRegistry.find(entry=>entry.url===route);
 assert.equal(registry.appStoreCpp,'general');assert.equal(registry.locale,'ja');
 assert.equal(siteLocales.find(locale=>locale.code==='ja').pages.length,8);
 assert.equal(renderLocaleHtml(page,sourceRoute,'ja'),page);
 assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/ja/app-store/download-on-the-app-store-black.svg',import.meta.url))).digest('hex'),'988fe0a48015c5a56dac88172487a1f5cda96340b34d80fd94312d02e9f67865');
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/ja/iphone-handoff/app-store.png',import.meta.url))).digest('hex'),createHash('sha256').update(execFileSync('git',['show','1a33aa7:images/ja/iphone-handoff/app-store.png'])).digest('hex'));
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`all eleven Japanese controls preserve payload, status and event boundaries through ${scenario}`,async()=>{
 const env=runtime({clipboardFails:scenario!=='api'&&scenario!=='pending',fallbackFails:scenario==='manual'||scenario==='terminal'});
 if(scenario==='terminal')env.document.createRange=()=>{throw Error('Selection unavailable');};
 for(const record of records){
  const button=env.query(buttonSelector(record)),status=button.closest('.repayment-ja-card').querySelector('[data-copy-status]');
  button.focus();
  const before=env.events.length,copiesBefore=env.copied.length;
  let release;
  if(scenario==='pending')env.context.navigator.clipboard.writeText=text=>new Promise(resolve=>{release=()=>{env.copied.push(text);resolve();};});
  await env.click(buttonSelector(record));
  if(scenario==='pending'){
   assert.equal(button.getAttribute('aria-busy'),'true');assert.equal(button.textContent,expected.ui['Busy label']);
   await env.click(buttonSelector(record));assert.equal(env.events.length,before);assert.equal(env.copied.length,copiesBefore);
   release();for(let i=0;i<10;i++)await Promise.resolve();
  }
  assert.equal(button.hasAttribute('aria-busy'),false);
  assert.equal(env.document.activeElement,button);
  if(['api','fallback','pending'].includes(scenario)){
   assert.equal(env.copied.at(-1),record.payload);assert.equal(env.copied.length,copiesBefore+1);
   assert.equal(button.textContent,expected.ui['Successful button label']);assert.equal(status.textContent,expected.ui['Successful live status']);
   assert.equal(env.events.length,before+1);
   assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'ja_repayment_messages',template_id:record.template,tone:record.tone,category:'repayment'}});
  }else{
   assert.equal(env.events.length,before);assert.equal(env.copied.length,copiesBefore);
   assert.equal(status.textContent,expected.ui[scenario==='manual'?'Manual selection status':'Terminal failure status']);
   if(scenario==='manual')assert.equal(env.window.getSelection().toString(),record.payload);
  }
  env.timers.at(-1)();
  assert.equal(button.textContent,expected.ui[record.template==='ja_repayment_record'?'Initial record label':'Initial message label']);
 }
 assert.equal(env.document.querySelectorAll('textarea').length,0);
});

test('Japanese handoff allowlist forwards only existing metadata keys',()=>{
 const listeners=new Map(),logged=[];
 bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(type,callback)=>listeners.set(type,callback)},trackEvent:(name,detail)=>logged.push({name,detail})});
 listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'ja_repayment_iphone_handoff',message:'must never be forwarded'}});
 assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'ja_repayment_iphone_handoff'}}]);
});

test('Japanese authored guide preserves every approved static section, exact nine-line record, truthful money/date examples and six FAQ pairs',()=>{
 const env=runtime(),doc=env.document,text=doc.querySelector('#main').textContent,attrs=doc.querySelectorAll('img').map(n=>n.getAttribute('alt')).join(' ')+' '+doc.querySelectorAll('[aria-label]').map(n=>n.getAttribute('aria-label')).join(' ');
 const flatten=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(flatten):Object.values(value).flatMap(flatten);
 for(const key of ['hero','before','balance','app','record','faq','related'])for(const value of flatten(approved[key]))if(!value.startsWith('/'))assert.ok((text+' '+attrs).includes(value),key+': '+value);
 const sections=doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main');assert.equal(sections.length,8);assert.deepEqual(sections.slice(1).map(n=>n.id),['messages','before','balance','app','record','faq','resources']);assert.equal(doc.querySelectorAll('.repayment-ja-related').length,3);assert.equal(doc.querySelectorAll('.repayment-ja-check-grid article').length,3);assert.equal(doc.querySelectorAll('.repayment-ja-visual blockquote')[0].textContent,approved.messages[0].text);
 const record=doc.querySelector('pre').textContent;assert.equal(record,approved.record.text);assert.equal(record.split('\n').length,9);assert.equal((record.match(/\n/g)||[]).length,8);assert.ok(!record.includes('\\n'));assert.ok(record.includes('［'));assert.equal(12000-4000,8000);assert.equal(8000-3000,5000);
 const table=doc.querySelector('table');assert.equal(table.querySelectorAll('th').length,4);assert.deepEqual(table.querySelectorAll('tbody tr').map(row=>row.children.map(cell=>cell.textContent)),approved.balance.rows);assert.equal(doc.querySelector('.repayment-ja-table-wrap').getAttribute('role'),'region');assert.equal(doc.querySelector('.repayment-ja-table-wrap').getAttribute('tabindex'),'0');assert.match(read('styles/repayment-ja.css'),/@container \(max-width: 42rem\)/);
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert.equal(graph[0].headline,approved.h1);assert.equal(graph[0].datePublished,'2026-11-05');assert.equal(graph[0].dateModified,'2026-11-05');assert.equal(graph[0].author.name,'Ievgenii Iablonskyi');assert.equal(graph[0].publisher.name,'You Owe Me');assert.equal(doc.querySelector('title').textContent,approved.title);assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'),'https://you-owe-me.com'+route);assert.equal(doc.querySelector('meta[name="twitter:card"]').getAttribute('content'),'summary');assert.equal(doc.querySelector('meta[property="og:image"]').getAttribute('content'),'https://you-owe-me.com/images/shared/brand/icon_3_0.png');
 for(const link of doc.querySelectorAll('#main a')){const href=link.getAttribute('href');if(href.startsWith('#'))assert.ok(doc.querySelector(href),href);else if(href.startsWith('/'))assert.ok(fs.existsSync(new URL('..'+href+'index.html',import.meta.url)),href);}
 assert.equal(doc.querySelectorAll('[data-iphone-handoff]').length,1);assert.ok(doc.querySelector('.site-japanese-disclosure'));assert.ok(!doc.querySelector('.site-japanese-disclosure').hasAttribute('open'));assert.doesNotMatch(page,/repayment-de|repayment-fr|ppid=|2026-05-17/);
});

test('Japanese guide isolates its controller and preserves all earlier language logic and private Hosting bytes',()=>{
 for(const file of ['scripts/repayment-de.js','scripts/repayment-fr.js','scripts/repayment-ar.js','scripts/borrow-de.js','scripts/borrow-fr.js','scripts/split-expense-calculator.js','scripts/tool-transfer.js','styles/repayment-de.css','styles/repayment-fr.css',...execFileSync('git',['ls-tree','-r','--name-only','1a33aa7','private-continuation'],{encoding:'utf8'}).trim().split('\n'),'firebase.exp003.json'])assert.deepEqual(Buffer.from(normalizeReviewedPortugueseSplitSource(fs.readFileSync(new URL('../'+file,import.meta.url)),file)),execFileSync('git',['show','1a33aa7:'+file]),file);
 const env=pageRuntime(page);assert.equal(env.document.querySelectorAll('[data-copy-template]').length,11);assert.ok(env.document.querySelectorAll('[data-copy-template]').every(n=>n.hidden));assert.ok(env.document.querySelectorAll('[data-copy-hint]').every(n=>n.textContent===approved.copyUI.noJS));
});

test('Japanese reminder integration admits only exact approved prior-page bytes and metadata cache changes',()=>{
 const files=execFileSync('git',['diff','--name-only','--diff-filter=M','1a33aa7','--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);assert.ok(files.length>100);
 for(const file of files)assert.equal(normalizeReviewedJapaneseRepaymentIntegration(read(file)),execFileSync('git',['show','1a33aa7:'+file],{encoding:'utf8'}),file);
 const original='<a href="/blog/how-to-remind-someone-they-owe-you-money-politely/">返済をお願いする伝え方<span class="site-locale-fallback">（英語）</span></a>',approvedAnchor='<a href="'+route+'">返済をお願いする伝え方</a>';
 assert.equal(normalizeReviewedJapaneseRepaymentIntegration(approvedAnchor),original);for(const altered of [approvedAnchor.replace('href=','data-unapproved="x" href='),approvedAnchor.replace('\">','\" data-unapproved="x">')]){assert.notEqual(normalizeReviewedJapaneseRepaymentIntegration(altered),original);assert.ok(normalizeReviewedJapaneseRepaymentIntegration(altered).includes('data-unapproved'));}
 const analytics=normalizeReviewedPortugueseRepaymentSource(read('scripts/analytics.js'),'scripts/analytics.js').replaceAll('ptsplit20261105','ptloan20261105').replaceAll('ptloan20261105','ptrecord20261105').replaceAll('ptrecord20261105','ptmoney20261105').replaceAll('ptmoney20261105','pt20261105').replaceAll('pt20261105','jaroommate20261105').replaceAll('jaroommate20261105','jaborrow20261105').replaceAll('jaborrow20261105','jarepayment20261105').replace('../content/site-locales.mjs?v=jarepayment20261105','../content/site-locales.mjs?v=roommatefr20261031').replace('./iphone-handoff-analytics-bridge.mjs?v=jarepayment20261105','./iphone-handoff-analytics-bridge.mjs?v=roommatefr20261031');assert.equal(analytics,execFileSync('git',['show','1a33aa7:scripts/analytics.js'],{encoding:'utf8'}));assert.equal(normalizeReviewedPortugueseRepaymentSource(read('scripts/iphone-handoff-analytics-bridge.mjs'),'scripts/iphone-handoff-analytics-bridge.mjs').replace('  "ja_roommate_template_iphone_handoff",\n','').replace('  "ja_borrow_iphone_handoff",\n','').replace('  "ja_repayment_iphone_handoff",\n',''),execFileSync('git',['show','1a33aa7:scripts/iphone-handoff-analytics-bridge.mjs'],{encoding:'utf8'}));
});
