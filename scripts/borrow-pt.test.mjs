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
import { normalizeReviewedPortugueseBorrowIntegration } from '../tests/helpers/reviewed-language-copy.mjs';
const route='/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/';
const sourceRoute='/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/borrow-pt.js');
const approved=JSON.parse(read('tests/fixtures/portuguese-borrow-copy.json'));
const expected={messages:approved.messages.map(v=>({template:'pt_borrow_'+v.key,tone:v.tone,category:v.category,payload:v.text})),record:approved.agreement.text,faq:approved.faq.map(v=>({question:v.q,answer:v.a})),ui:{'Busy label':approved.copyUI.busy,'Successful button label':approved.copyUI.successButton,'Successful live status':approved.copyUI.successStatus,'Manual selection status':approved.copyUI.manualSelected,'Terminal failure status':approved.copyUI.failure,'Initial record label':approved.copyUI.record,'Initial message label':approved.copyUI.message}};
const records=[...expected.messages,{template:'pt_borrow_record',tone:'clear',category:'record',payload:expected.record}];
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


test('Portuguese guide keeps nine exact static/selectable payloads, clear record and six FAQ/schema pairs',()=>{
 const d=runtime().document;assert.equal(d.querySelectorAll('[data-copy-template]').length,9);for(const record of records){const button=d.querySelector(buttonSelector(record)),source=button.closest('.borrow-pt-card').querySelector('.template-card__message');assert.equal(source.textContent,record.payload);assert.equal(button.getAttribute('data-template'),record.payload);assert.equal(button.dataset.tone,record.tone);assert.equal(button.dataset.category,record.category);assert.equal(button.hidden,false);}
 assert.equal(expected.record.split('\n').length,9);assert.equal((expected.record.match(/\n/g)||[]).length,8);assert.ok(!expected.record.endsWith('\n'));assert.ok(!expected.record.includes('\\n'));
 const schemas=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'],faq=schemas.find(n=>n['@type']==='FAQPage');assert.equal(faq.inLanguage,'pt-BR');assert.deepEqual(faq.mainEntity.map(n=>({question:n.name,answer:n.acceptedAnswer.text})),expected.faq);assert.deepEqual(d.querySelectorAll('.borrow-pt-faq details').map(n=>({question:n.querySelector('summary').textContent,answer:n.querySelector('p').textContent})),expected.faq);
 const article=schemas.find(n=>n['@type']==='Article');assert.equal(article.inLanguage,'pt-BR');assert.equal(article.datePublished,'2026-11-06');assert.equal(article.dateModified,'2026-11-06');assert.equal(article.headline,approved.h1);assert.equal(d.querySelector('title').textContent,approved.title);
});
for(const scenario of ['api','fallback','manual','terminal','pending'])test(`Portuguese copy through ${scenario} preserves payload, one nearby announcement, focus and private metadata`,async()=>{
 const env=runtime({clipboardFails:!['api','pending'].includes(scenario),fallbackFails:['manual','terminal'].includes(scenario)});if(scenario==='terminal')env.document.createRange=()=>{throw Error('Selection unavailable');};
 for(const record of scenario==='api'?records:[records[0],records.at(-1)]){
  const button=env.query(buttonSelector(record)),status=button.closest('.borrow-pt-card').querySelector('[data-copy-status]');button.focus();const before=env.events.length,copies=env.copied.length;let release;
  if(scenario==='pending')env.context.navigator.clipboard.writeText=text=>new Promise(resolve=>{release=()=>{env.copied.push(text);resolve();};});
  await env.click(buttonSelector(record));if(scenario==='pending'){assert.equal(button.getAttribute('aria-busy'),'true');assert.equal(button.textContent,approved.copyUI.busy);await env.click(buttonSelector(record));assert.equal(env.copied.length,copies);assert.equal(env.events.length,before);release();for(let n=0;n<10;n++)await Promise.resolve();}
  assert.equal(button.hasAttribute('aria-busy'),false);assert.equal(env.document.activeElement,button);
  if(['api','fallback','pending'].includes(scenario)){assert.equal(env.copied.at(-1),record.payload);assert.equal(env.copied.length,copies+1);assert.equal(status.textContent,approved.copyUI.successStatus);assert.equal(button.textContent,approved.copyUI.successButton);assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'pt_borrow_messages',template_id:record.template,tone:record.tone,category:record.category}});}
  else{assert.equal(env.events.length,before);assert.equal(status.textContent,scenario==='manual'?approved.copyUI.manualSelected:approved.copyUI.failure);assert.equal(button.textContent,record.template==='pt_borrow_record'?approved.copyUI.record:approved.copyUI.message);if(scenario==='manual')assert.equal(env.selections.at(-1).textContent,record.payload);}
  assert.equal(env.document.querySelector('textarea'),null);env.timers.at(-1)();assert.equal(button.textContent,record.template==='pt_borrow_record'?approved.copyUI.record:approved.copyUI.message);
 }
});
test('Portuguese repeated success→failure and old reset callbacks cannot overwrite the latest attempt or another card',async()=>{
 const e=runtime(),first=records[0],second=records[1],b=e.query(buttonSelector(first)),status=b.closest('.borrow-pt-card').querySelector('[data-copy-status]');b.focus();await e.click(buttonSelector(first));const oldTimer=e.timers.at(-1);assert.equal(status.textContent,approved.copyUI.successStatus);
 let reject;e.context.navigator.clipboard.writeText=()=>new Promise((_,r)=>{reject=r});e.document.execCommand=()=>false;e.document.createRange=()=>{throw Error('No selection')};await e.click(buttonSelector(first));assert.equal(b.textContent,approved.copyUI.busy);assert.equal(status.textContent,'');oldTimer();assert.equal(b.textContent,approved.copyUI.busy);reject(Error('Denied'));for(let n=0;n<15;n++)await Promise.resolve();assert.equal(b.textContent,approved.copyUI.message);assert.equal(status.textContent,approved.copyUI.failure);assert.equal(e.events.length,1);
 e.context.navigator.clipboard.writeText=async text=>e.copied.push(text);await e.click(buttonSelector(second));const otherStatus=e.query(buttonSelector(second)).closest('.borrow-pt-card').querySelector('[data-copy-status]');assert.equal(otherStatus.textContent,approved.copyUI.successStatus);oldTimer();assert.equal(status.textContent,approved.copyUI.failure);assert.equal(otherStatus.textContent,approved.copyUI.successStatus);
});
test('Portuguese no-JS and scoped handler preserve selectable text and do not reveal invalid or foreign controls',()=>{
 const untouched=pageRuntime(page);assert.equal(untouched.document.querySelectorAll('[data-copy-template]').length,9);assert.ok(untouched.document.querySelectorAll('[data-copy-template]').every(n=>n.hidden));assert.ok(untouched.document.querySelectorAll('[data-copy-hint]').every(n=>n.textContent===approved.copyUI.noJS));
 const foreign=pageRuntime(page.replace('borrow-pt-page','repayment-pt-page'));foreign.run(controller);assert.ok(foreign.document.querySelectorAll('[data-copy-template]').every(n=>n.hidden));
 const invalid=pageRuntime(page),b=invalid.query(buttonSelector(records[0]));b.closest('.borrow-pt-card').querySelector('.template-card__message').textContent='';invalid.run(controller);assert.equal(b.hidden,true);
});
test('Portuguese guide links/discovery and every previously authored HTML/controller/private byte remain within exact admissions',()=>{
 const d=runtime().document;const localeDisclosures=d.querySelectorAll('details.site-portuguese-disclosure');assert.equal(localeDisclosures.length,1);const localeLinks=localeDisclosures[0].querySelectorAll('a');assert.equal(localeLinks.length,8);assert.deepEqual(localeLinks.map(n=>n.getAttribute('href')),siteLocales.find(l=>l.code==='pt').pages.map(p=>p.pt));const original=parseStaticPage(read('ja/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html')),sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.id);assert.equal(sections(d).length,8);assert.deepEqual(sections(d),sections(original));assert.deepEqual(d.querySelectorAll('.borrow-pt-related').map(n=>n.getAttribute('href')),approved.related.map(n=>n.url));assert.deepEqual(d.querySelector('table').querySelectorAll('tbody tr').map(n=>n.children.map(c=>c.textContent)),approved.example.rows);const region=d.querySelector('[role="region"]');assert.equal(region.getAttribute('tabindex'),'0');assert.equal(region.getAttribute('aria-label'),approved.example.regionLabel);
 assert.equal(localizedSourceRoute(route),sourceRoute);assert.equal(contentRegistry.length,144);assert.equal(siteLocales.find(l=>l.code==='pt').pages.length,8);assert.equal(renderLocaleHtml(page,sourceRoute,'pt'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 const base='f26a10d6bafe3ecc37f25253e38eb8e55b0fc78a',present=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');for(const f of execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html')&&present.includes(f)))assert.equal(normalizeReviewedPortugueseBorrowIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 const protectedFiles=present.filter(f=>f.startsWith('private-continuation/')||f.startsWith('images/')||['scripts/repayment-pt.js','styles/repayment-pt.css','scripts/borrow-ja.js','scripts/repayment-ja.js','scripts/repayment-de.js','scripts/repayment-fr.js','scripts/repayment-ar.js','scripts/split-expense-calculator.js','scripts/split-expense-locale.js','scripts/tool-transfer.js','scripts/portuguese-number-input.js','scripts/recordkeeping-guide-es.js','styles/repayment-ja.css'].includes(f));
 const oldObjects=new Map(execFileSync('git',['ls-tree','-r','-z',base],{encoding:'utf8'}).split('\0').filter(Boolean).map(line=>[line.slice(line.indexOf('\t')+1),line.slice(0,line.indexOf('\t')).split(' ')[2]]));const currentObjects=execFileSync('git',['hash-object','--stdin-paths'],{input:protectedFiles.join('\n')+'\n',encoding:'utf8'}).trim().split('\n');protectedFiles.forEach((f,i)=>{if(['scripts/recordkeeping-guide-es.js','scripts/split-expense-calculator.js','scripts/split-expense-locale.js','scripts/tool-transfer.js','private-continuation/split/index.html','private-continuation/split/locale.js'].includes(f))assert.deepEqual(normalizeReviewedItalianRecordGuideSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f),execFileSync('git',['show',base+':'+f]),f);else assert.equal(currentObjects[i],oldObjects.get(f),f);});
 const altered='<a href="'+route+'" data-unapproved="x">como pedir seu dinheiro de volta com educação</a>';assert.ok(normalizeReviewedPortugueseBorrowIntegration(altered).includes('data-unapproved'));
});

 test('Portuguese borrowing mechanics are exactly the accepted PT repayment flow after scoped labels/classes/metadata substitutions',()=>{
 const equivalent=controller.replace('Portuguese borrowing guide','Portuguese repayment guide').replaceAll('borrow-pt','repayment-pt').replace('pt_borrow_messages','pt_repayment_messages').replace('record ? "Copiar registro do combinado"','record ? "Copiar modelo de registro"').replace('category: button.dataset.category,','category: "repayment",');assert.equal(equivalent,execFileSync('git',['show','f26a10d6:scripts/repayment-pt.js'],{encoding:'utf8'}));
});
