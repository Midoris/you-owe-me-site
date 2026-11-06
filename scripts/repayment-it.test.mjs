import {normalizeReviewedItalianRecordGuideSource} from '../tests/helpers/reviewed-language-copy.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { siteLocales, localizedSourceRoute } from '../content/site-locales.mjs';
import { contentRegistry } from '../content/content-registry.mjs';
import { renderLocaleHtml, renderLocaleDiscovery } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
import { normalizeReviewedItalianRepaymentIntegration } from '../tests/helpers/reviewed-language-copy.mjs';
const route='/it/blog/come-chiedere-indietro-soldi-a-un-amico/';
const sourceRoute='/blog/how-to-remind-someone-they-owe-you-money-politely/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/repayment-it.js');
const approved=JSON.parse(read('tests/fixtures/italian-repayment-copy.json'));
const expected={messages:approved.messages.map(v=>({template:'it_repayment_'+v.key,tone:v.tone,payload:v.text})),record:approved.record.text,faq:approved.faq.map(v=>({question:v.q,answer:v.a})),ui:{'Busy label':approved.copyUI.busy,'Successful button label':approved.copyUI.successButton,'Successful live status':approved.copyUI.successStatus,'Manual selection status':approved.copyUI.manualSelected,'Terminal failure status':approved.copyUI.failure,'Initial record label':approved.copyUI.record,'Initial message label':approved.copyUI.message}};
const records=[...expected.messages,{template:'it_repayment_record',tone:'neutral',payload:expected.record}];
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


test('Italian guide keeps eleven exact static/selectable payloads, neutral record and six FAQ/schema pairs',()=>{
 const d=runtime().document;assert.equal(d.querySelectorAll('[data-copy-template]').length,11);for(const record of records){const button=d.querySelector(buttonSelector(record)),source=button.closest('.repayment-it-card').querySelector('.template-card__message');assert.equal(source.textContent,record.payload);assert.equal(button.getAttribute('data-template'),record.payload);assert.equal(button.dataset.tone,record.tone);assert.equal(button.dataset.category,'repayment');assert.equal(button.hidden,false);}
 assert.equal(expected.record.split('\n').length,9);assert.equal((expected.record.match(/\n/g)||[]).length,8);assert.ok(!expected.record.endsWith('\n'));assert.ok(!expected.record.includes('\\n'));
 const schemas=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'],faq=schemas.find(n=>n['@type']==='FAQPage');assert.equal(faq.inLanguage,'it');assert.deepEqual(faq.mainEntity.map(n=>({question:n.name,answer:n.acceptedAnswer.text})),expected.faq);assert.deepEqual(d.querySelectorAll('.repayment-it-faq details').map(n=>({question:n.querySelector('summary').textContent,answer:n.querySelector('p').textContent})),expected.faq);
 const article=schemas.find(n=>n['@type']==='Article');assert.equal(article.inLanguage,'it');assert.equal(article.datePublished,'2026-11-06');assert.equal(article.dateModified,'2026-11-06');assert.equal(article.headline,approved.h1);assert.equal(d.querySelector('title').textContent,approved.title);
});
for(const scenario of ['api','fallback','manual','terminal','pending'])test(`Italian copy through ${scenario} preserves payload, one nearby announcement, focus and private metadata`,async()=>{
 const env=runtime({clipboardFails:!['api','pending'].includes(scenario),fallbackFails:['manual','terminal'].includes(scenario)});if(scenario==='terminal')env.document.createRange=()=>{throw Error('Selection unavailable');};
 for(const record of scenario==='api'?records:[records[0],records.at(-1)]){
  const button=env.query(buttonSelector(record)),status=button.closest('.repayment-it-card').querySelector('[data-copy-status]');button.focus();const before=env.events.length,copies=env.copied.length;let release;
  if(scenario==='pending')env.context.navigator.clipboard.writeText=text=>new Promise(resolve=>{release=()=>{env.copied.push(text);resolve();};});
  await env.click(buttonSelector(record));if(scenario==='pending'){assert.equal(button.getAttribute('aria-busy'),'true');assert.equal(button.textContent,approved.copyUI.busy);await env.click(buttonSelector(record));assert.equal(env.copied.length,copies);assert.equal(env.events.length,before);release();for(let n=0;n<10;n++)await Promise.resolve();}
  assert.equal(button.hasAttribute('aria-busy'),false);assert.equal(env.document.activeElement,button);
  if(['api','fallback','pending'].includes(scenario)){assert.equal(env.copied.at(-1),record.payload);assert.equal(env.copied.length,copies+1);assert.equal(status.textContent,approved.copyUI.successStatus);assert.equal(button.textContent,approved.copyUI.successButton);assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'it_repayment_messages',template_id:record.template,tone:record.tone,category:'repayment'}});}
  else{assert.equal(env.events.length,before);assert.equal(status.textContent,scenario==='manual'?approved.copyUI.manualSelected:approved.copyUI.failure);assert.equal(button.textContent,record.template==='it_repayment_record'?approved.copyUI.record:approved.copyUI.message);if(scenario==='manual')assert.equal(env.selections.at(-1).textContent,record.payload);}
  assert.equal(env.document.querySelector('textarea'),null);env.timers.at(-1)();assert.equal(button.textContent,record.template==='it_repayment_record'?approved.copyUI.record:approved.copyUI.message);
 }
});
test('Italian repeated success→failure and old reset callbacks cannot overwrite the latest attempt or another card',async()=>{
 const e=runtime(),first=records[0],second=records[1],b=e.query(buttonSelector(first)),status=b.closest('.repayment-it-card').querySelector('[data-copy-status]');b.focus();await e.click(buttonSelector(first));const oldTimer=e.timers.at(-1);assert.equal(status.textContent,approved.copyUI.successStatus);
 let reject;e.context.navigator.clipboard.writeText=()=>new Promise((_,r)=>{reject=r});e.document.execCommand=()=>false;e.document.createRange=()=>{throw Error('No selection')};await e.click(buttonSelector(first));assert.equal(b.textContent,approved.copyUI.busy);assert.equal(status.textContent,'');oldTimer();assert.equal(b.textContent,approved.copyUI.busy);reject(Error('Denied'));for(let n=0;n<15;n++)await Promise.resolve();assert.equal(b.textContent,approved.copyUI.message);assert.equal(status.textContent,approved.copyUI.failure);assert.equal(e.events.length,1);
 e.context.navigator.clipboard.writeText=async text=>e.copied.push(text);await e.click(buttonSelector(second));const otherStatus=e.query(buttonSelector(second)).closest('.repayment-it-card').querySelector('[data-copy-status]');assert.equal(otherStatus.textContent,approved.copyUI.successStatus);oldTimer();assert.equal(status.textContent,approved.copyUI.failure);assert.equal(otherStatus.textContent,approved.copyUI.successStatus);
});
test('Italian no-JS and scoped handler preserve selectable text and do not reveal invalid or foreign controls',()=>{
 const untouched=pageRuntime(page);assert.equal(untouched.document.querySelectorAll('[data-copy-template]').length,11);assert.ok(untouched.document.querySelectorAll('[data-copy-template]').every(n=>n.hidden));assert.ok(untouched.document.querySelectorAll('[data-copy-hint]').every(n=>n.textContent===approved.copyUI.noJS));
 const foreign=pageRuntime(page.replace('repayment-it-page','repayment-ja-page'));foreign.run(controller);assert.ok(foreign.document.querySelectorAll('[data-copy-template]').every(n=>n.hidden));
 const invalid=pageRuntime(page),b=invalid.query(buttonSelector(records[0]));b.closest('.repayment-it-card').querySelector('.template-card__message').textContent='';invalid.run(controller);assert.equal(b.hidden,true);
});

test('Italian handoff allows only the existing fixed metadata and ordinary generic Store destination',()=>{
 const listeners=new Map(),logged=[];bindIphoneHandoffAnalytics({eventTarget:{addEventListener(n,fn){listeners.set(n,fn)}},trackEvent(name,detail){logged.push({name,detail})}});listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'it_repayment_iphone_handoff',payload:'not forwarded'}});assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'it_repayment_iphone_handoff'}}]);
 const d=runtime().document;assert.equal(d.querySelectorAll('[data-app-language-support-anchor]').length,1);assert.equal(d.querySelector('[data-iphone-handoff-qr]').getAttribute('src'),'/images/it/iphone-handoff/app-store.png');for(const a of d.querySelectorAll('a').filter(n=>(n.getAttribute('href')||'').includes('apps.apple.com')))assert.equal(a.getAttribute('href'),'https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8');assert.doesNotMatch(page,/ppid=|polite-reminder-post-copy\.js|anniversary-announcement\.js|repayment-reminder-text-examples\.js/);
});

test('Italian guide has one eight-route navigation, exact new links/paragraphs and precise immutable-source inverses',async()=>{
 const d=runtime().document,navs=d.querySelectorAll('.site-locale-section');assert.equal(navs.length,1);const routes=siteLocales.find(l=>l.code==='it').pages.map(p=>p.it);assert.equal(routes.length,8);assert.deepEqual(navs[0].querySelectorAll('a').map(n=>n.getAttribute('href')),routes);assert.equal((page.match(/<!-- italian-section:start -->/g)||[]).length,1);assert.equal(d.querySelectorAll('details.site-italian-disclosure').length,0);
 const original=parseStaticPage(read('ja/blog/how-to-remind-someone-they-owe-you-money-politely/index.html')),sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.id);assert.equal(sections(d).length,8);assert.deepEqual(sections(d),sections(original));assert.deepEqual(d.querySelectorAll('.repayment-it-related').map(n=>n.getAttribute('href')),approved.related.map(n=>n.url));assert.deepEqual(d.querySelector('table').querySelectorAll('tbody tr').map(n=>n.children.map(c=>c.textContent)),approved.balance.rows);assert.equal(d.querySelector('[role="region"]').getAttribute('aria-label'),approved.balance.regionLabel);assert.equal(d.querySelector('[role="region"]').getAttribute('tabindex'),'0');assert.equal(localizedSourceRoute(route),sourceRoute);assert.equal(contentRegistry.length,146);assert.equal(renderLocaleHtml(page,sourceRoute,'it'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 const{normalizeReviewedItalianRepaymentSource,normalizeReviewedItalianRepaymentIntegration}=await import('../tests/helpers/reviewed-language-copy.mjs');const base='a3f6fc67a027b595c584a1c5c16982810f2e3fd6',admissions=JSON.parse(read('tests/fixtures/italian-repayment-reviewed-admissions.json')),present=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');for(const f of execFileSync('git',['diff','--name-only',base,'--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(f=>present.includes(f)))assert.equal(normalizeReviewedItalianRepaymentIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);for(const f of Object.keys(admissions.source))assert.equal(normalizeReviewedItalianRepaymentSource(read(f),f),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 const oldAnchor=admissions.integrations[0][0],altered=oldAnchor.replace('">','" data-unapproved="x">');assert.equal(normalizeReviewedItalianRepaymentIntegration(altered),altered);const bytes=Buffer.from([255,254,128,0]);assert.equal(normalizeReviewedItalianRepaymentSource(bytes,'downloads/protected.xlsx'),bytes);
 for(const f of present.filter(f=>f.startsWith('private-continuation/')||['images/shared/brand/icon_3_0.png','images/it/app-store/download-on-the-app-store-black.svg','images/it/iphone-handoff/app-store.png'].includes(f)||/^scripts\/(?:repayment|borrow)-/.test(f)&&f.endsWith('.js')))assert.deepEqual(fs.readFileSync(new URL('../'+f,import.meta.url)),execFileSync('git',['show',base+':'+f]),f);
});

test('Italian repayment controller retains accepted PT mechanics with only scoped selectors/labels/page metadata changed',()=>{
 let normalized=controller.replace('Italian repayment guide','Portuguese repayment guide').replaceAll('repayment-it','repayment-pt').replace('it_repayment_messages','pt_repayment_messages');const pt=JSON.parse(read('tests/fixtures/portuguese-repayment-copy.json'));for(const key of ['manualSelected','failure','successStatus','record','message','busy','successButton'])normalized=normalized.replace(approved.copyUI[key],pt.copyUI[key]);assert.equal(normalized,execFileSync('git',['show','a3f6fc67:scripts/repayment-pt.js'],{encoding:'utf8'}));
});
