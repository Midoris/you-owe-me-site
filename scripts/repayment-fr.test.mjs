import { normalizeReviewedFrenchRoommateCopy } from "../tests/helpers/reviewed-language-copy.mjs";
import { normalizeReviewedStatsCopy, normalizeReviewedFrenchBorrowCopy } from "../tests/helpers/reviewed-language-copy.mjs";
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
const route='/fr/blog/comment-reclamer-son-argent-poliment/';
const sourceRoute='/blog/how-to-remind-someone-they-owe-you-money-politely/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/repayment-fr.js');
const expected=JSON.parse(read('tests/fixtures/french-repayment-copy.json'));
const records=[...expected.messages,{template:'fr_repayment_record',tone:'neutral',payload:expected.record}];
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

test('French repayment guide retains reviewed payloads, matching FAQ, official badge and admitted routing',()=>{
 const env=runtime();
 assert.equal(env.document.querySelectorAll('.template-card').length,10);
 assert.equal(env.document.querySelectorAll('[data-copy-template]').length,11);
 for(const record of records){
  const button=env.query(buttonSelector(record));
  assert.equal(button.closest('.repayment-fr-card').querySelector('.template-card__message').textContent.trim(),record.payload);
  assert.equal(button.dataset.tone,record.tone);
  assert.equal(button.dataset.category,'repayment');
  assert.equal(button.hidden,false);
 }
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 const faq=graph.find(node=>node['@type']==='FAQPage');
 assert.equal(faq.inLanguage,'fr');
 assert.deepEqual(faq.mainEntity.map(node=>({question:node.name,answer:node.acceptedAnswer.text})),expected.faq);
 const visible=env.document.querySelectorAll('.repayment-fr-faq details');
 assert.deepEqual(visible.map(node=>({question:node.querySelector('summary').textContent,answer:node.querySelector('p').textContent})),expected.faq);
 assert.equal(localizedSourceRoute(route),sourceRoute);
 assert.equal(contentRegistry.length,125);
 const registry=contentRegistry.find(entry=>entry.url===route);
 assert.equal(registry.appStoreCpp,'general');assert.equal(registry.locale,'fr');
 assert.equal(siteLocales.find(locale=>locale.code==='fr').pages.length,8);
 assert.equal(renderLocaleHtml(page,sourceRoute,'fr'),page);
 assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/fr/app-store/download-on-the-app-store-black.svg',import.meta.url))).digest('hex'),'86b6a05f6c8ac9e9a0637edf4f15420d06c8c7bc69662792a46793c1f948b023');
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../images/fr/iphone-handoff/app-store.png',import.meta.url))).digest('hex'),createHash('sha256').update(execFileSync('git',['show','693b1f4:images/fr/iphone-handoff/app-store.png'])).digest('hex'));
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`all eleven French controls preserve payload, status and event boundaries through ${scenario}`,async()=>{
 const env=runtime({clipboardFails:scenario!=='api'&&scenario!=='pending',fallbackFails:scenario==='manual'||scenario==='terminal'});
 if(scenario==='terminal')env.document.createRange=()=>{throw Error('Selection unavailable');};
 for(const record of records){
  const button=env.query(buttonSelector(record)),status=button.closest('.repayment-fr-card').querySelector('[data-copy-status]');
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
   assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'fr_repayment_messages',template_id:record.template,tone:record.tone,category:'repayment'}});
  }else{
   assert.equal(env.events.length,before);assert.equal(env.copied.length,copiesBefore);
   assert.equal(status.textContent,expected.ui[scenario==='manual'?'Manual selection status':'Terminal failure status']);
   if(scenario==='manual')assert.equal(env.window.getSelection().toString(),record.payload);
  }
  env.timers.at(-1)();
  assert.equal(button.textContent,expected.ui[record.template==='fr_repayment_record'?'Initial record label':'Initial message label']);
 }
 assert.equal(env.document.querySelectorAll('textarea').length,0);
});

test('French handoff allowlist forwards only existing metadata keys',()=>{
 const listeners=new Map(),logged=[];
 bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(type,callback)=>listeners.set(type,callback)},trackEvent:(name,detail)=>logged.push({name,detail})});
 listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'fr_repayment_iphone_handoff',message:'must never be forwarded'}});
 assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'fr_repayment_iphone_handoff'}}]);
});

test('all original French page text is preserved outside exact approved navigation and context additions',()=>{
 // Preserve the original baseline; remove only exact approved October 30 Stats delta (69b3628).
 const cache=html=>normalizeReviewedFrenchRoommateCopy(normalizeReviewedFrenchBorrowCopy(normalizeReviewedStatsCopy(html))).replace(/((?:src|href)="[^"?]*scripts\/analytics\.js)(?:\?[^" ]*)?/g,'$1?v=approved-cache');
 const navAddition='\n              <a href="'+route+'">Messages de remboursement</a>';
 const paragraphs=[
  '            <p>Avant de relancer, vérifiez les paiements déjà reçus. Retrouvez des <a href="'+route+'">messages pour demander un remboursement</a> adaptés à votre situation.</p>\n',
  '            <p>Une fois le solde vérifié, choisissez <a href="'+route+'">un message pour demander un remboursement</a>. Adaptez-le aux paiements déjà reçus et à ce qui a été convenu.</p>\n',
 ];
 let reminders=0;
 for(const file of execFileSync('git',['ls-tree','-r','--name-only','693b1f4','fr'],{encoding:'utf8'}).trim().split('\n').filter(file=>file.endsWith('/index.html'))){
  const baseline=execFileSync('git',['show',`693b1f4:${file}`],{encoding:'utf8'});
  let current=read(file).replace(navAddition,'');
  for(const paragraph of paragraphs)current=current.replace(paragraph,'');
  for(const original of baseline.matchAll(/<a\b[^>]*href="\/blog\/how-to-remind-someone-they-owe-you-money-politely\/"[^>]*>[\s\S]*?<\/a>/g)){
   const opening=original[0].match(/^<a\b[^>]*>/)[0].replace(sourceRoute,route);
   const transformed=opening+(/\blt-cardCta\b/.test(opening)?'Messages pour demander un remboursement':'messages pour demander un remboursement')+'</a>';
   assert.ok(current.includes(transformed),`Exact retargeted anchor: ${file}`);
   current=current.replace(transformed,original[0]);
   current=current.replace('découvrez des '+original[0], 'découvrez '+original[0]).replace('Découvrez des '+original[0], 'Découvrez '+original[0]);reminders++;
  }
  assert.equal(cache(current),cache(baseline),`Original French content: ${file}`);
 }
 assert.equal(reminders,5);
});
