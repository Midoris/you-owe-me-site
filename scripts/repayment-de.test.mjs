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
const route='/de/blog/geld-freundlich-zurueckfordern/';
const sourceRoute='/blog/how-to-remind-someone-they-owe-you-money-politely/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/repayment-de.js');
const expected=JSON.parse(read('tests/fixtures/german-repayment-copy.json'));
const records=[...expected.messages,{template:'de_repayment_record',tone:'neutral',payload:expected.record}];
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

test('German repayment guide retains reviewed payloads, matching FAQ, official badge and admitted routing',()=>{
 const env=runtime();
 assert.equal(env.document.querySelectorAll('.template-card').length,10);
 assert.equal(env.document.querySelectorAll('[data-copy-template]').length,11);
 for(const record of records){
  const button=env.query(buttonSelector(record));
  assert.equal(button.closest('.repayment-de-card').querySelector('.template-card__message').textContent.trim(),record.payload);
  assert.equal(button.dataset.tone,record.tone);
  assert.equal(button.dataset.category,'repayment');
  assert.equal(button.hidden,false);
 }
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 const faq=graph.find(node=>node['@type']==='FAQPage');
 assert.equal(faq.inLanguage,'de');
 assert.deepEqual(faq.mainEntity.map(node=>({question:node.name,answer:node.acceptedAnswer.text})),expected.faq);
 const visible=env.document.querySelectorAll('.repayment-de-faq details');
 assert.deepEqual(visible.map(node=>({question:node.querySelector('summary').textContent,answer:node.querySelector('p').textContent})),expected.faq);
 assert.equal(localizedSourceRoute(route),sourceRoute);
 assert.equal(contentRegistry.length,116);
 const registry=contentRegistry.find(entry=>entry.url===route);
 assert.equal(registry.appStoreCpp,'general');assert.equal(registry.locale,'de');
 assert.equal(siteLocales.find(locale=>locale.code==='de').pages.length,7);
 assert.equal(renderLocaleHtml(page,sourceRoute,'de'),page);
 assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/de/app-store/download-on-the-app-store-black.svg',import.meta.url))).digest('hex'),'4f2967e1f642dd16eec36ac4022f07b7a881cab6301a13be3a4ccfcd3206a614');
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/de/iphone-handoff/app-store.png',import.meta.url))).digest('hex'),createHash('sha256').update(execFileSync('git',['show','69b3628:images/de/iphone-handoff/app-store.png'])).digest('hex'));
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`all eleven German controls preserve payload, status and event boundaries through ${scenario}`,async()=>{
 const env=runtime({clipboardFails:scenario!=='api'&&scenario!=='pending',fallbackFails:scenario==='manual'||scenario==='terminal'});
 if(scenario==='terminal')env.document.createRange=()=>{throw Error('Selection unavailable');};
 for(const record of records){
  const button=env.query(buttonSelector(record)),status=button.closest('.repayment-de-card').querySelector('[data-copy-status]');
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
   assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'de_repayment_messages',template_id:record.template,tone:record.tone,category:'repayment'}});
  }else{
   assert.equal(env.events.length,before);assert.equal(env.copied.length,copiesBefore);
   assert.equal(status.textContent,expected.ui[scenario==='manual'?'Manual selection status':'Terminal failure status']);
   if(scenario==='manual')assert.equal(env.window.getSelection().toString(),record.payload);
  }
  env.timers.at(-1)();
  assert.equal(button.textContent,expected.ui[record.template==='de_repayment_record'?'Initial record label':'Initial message label']);
 }
 assert.equal(env.document.querySelectorAll('textarea').length,0);
});

test('German handoff allowlist forwards only existing metadata keys',()=>{
 const listeners=new Map(),logged=[];
 bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(type,callback)=>listeners.set(type,callback)},trackEvent:(name,detail)=>logged.push({name,detail})});
 listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'de_repayment_iphone_handoff',message:'must never be forwarded'}});
 assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'de_repayment_iphone_handoff'}}]);
});
