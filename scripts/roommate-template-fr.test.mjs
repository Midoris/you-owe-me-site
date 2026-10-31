import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { normalizeReviewedFrenchRoommateCopy } from '../tests/helpers/reviewed-language-copy.mjs';
import { localizedSourceRoute, sharedAssetVersions } from '../content/site-locales.mjs';
import { renderLocaleHtml } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
const route='/fr/outils/tableau-depenses-colocation/';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/roommate-expense-tracker-template-fr.js');
const expected=JSON.parse(read('tests/fixtures/french-roommate-template-copy.json'));
function runtime(options={}){
 const env=pageRuntime(page,options);
 const decorate=node=>{node.remove=()=>node.parentNode?.removeChild(node);return node;};
 env.document.querySelectorAll('*').forEach(decorate);
 const create=env.document.createElement;
 env.document.createElement=tag=>decorate(create(tag));
 env.window.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>env.selections.at(-1)?.textContent.trim()||''});
 env.run(controller);return env;
}

test('French roommate page retains exact summary payload,9matching FAQ and completed counterpart',()=>{
 const env=runtime();
 assert.equal(env.query('#roommate-summary-message').textContent,expected.message);
 assert.equal(env.query('[data-copy-target]').hidden,false);
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 assert.equal(graph[0].inLanguage,'fr');
 assert.match(page,/<html lang="fr" dir="ltr">/);
 const downloadLinks=env.document.querySelectorAll('a').filter(node=>node.hasAttribute('download'));
 assert.equal(downloadLinks.length,5);
 assert.ok(downloadLinks.every(node=>node.getAttribute('download')==='tableau-depenses-colocation.'+(node.getAttribute('href').endsWith('.csv')?'csv':'xlsx')));
 assert.deepEqual(graph.find(node=>node['@type']==='FAQPage').mainEntity.map(node=>({question:node.name,answer:node.acceptedAnswer.text})),expected.faq);
 assert.deepEqual(env.document.querySelectorAll('.roommate-template-faq-list details').map(node=>({question:node.querySelector('summary').textContent,answer:node.querySelector('p').textContent})),expected.faq);
 assert.equal(localizedSourceRoute(route),'/tools/roommate-expense-tracker-template/');
 assert.equal(renderLocaleHtml(page,'/tools/roommate-expense-tracker-template/','fr'),page);
 assert.ok(!page.includes('DRAFT-NOT-FOR-RELEASE'));
 const googleLinks=env.document.querySelectorAll('a').filter(node=>node.getAttribute('href')?.includes('docs.google.com/spreadsheets/'));
 assert.equal(googleLinks.length,3);
 assert.ok(googleLinks.every(node=>node.getAttribute('href')==='https://docs.google.com/spreadsheets/d/1SNejIjROIYOCkkxMwin6baV6V24mLtZb-uTPgDYUWDc/copy'));
 assert.ok(!page.includes('money-story'));
 assert.match(page,/width="1536" height="1024"/);
 assert.equal(env.query('.roommate-template-file-meta').textContent,`Fichier Excel · ${Math.round(fs.statSync(new URL('../downloads/fr/tableau-depenses-colocation.xlsx',import.meta.url)).size/1024)} Ko`);
});

test('French related cards preserve the original analytics metadata shape and stable source key',()=>{
 const env=runtime(),original=pageRuntime(read('tools/roommate-expense-tracker-template/index.html'));
 const cards=env.document.querySelectorAll('.best-next-step__card'),old=original.document.querySelectorAll('.best-next-step__card');
 assert.equal(cards.length,4);
 for(let i=0;i<4;i++){
  const attrs=Object.fromEntries([...cards[i].attributes].filter(([key])=>key.startsWith('data-')));
  const expectedAttrs=Object.fromEntries([...old[i].attributes].filter(([key])=>key.startsWith('data-')));
  expectedAttrs['data-track-location']='fr_'+expectedAttrs['data-track-location'];
  expectedAttrs['data-step-destination']=cards[i].getAttribute('href');
  assert.deepEqual(attrs,expectedAttrs);
  assert.equal(attrs['data-source-page'],'tools_roommate_expense_tracker_template');
 }
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`French summary copy preserves exact payload and private data boundary through ${scenario}`,async()=>{
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

test('French template handoff forwards only the existing allowlisted location',()=>{
 const listeners=new Map(),logged=[];
 bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(name,callback)=>listeners.set(name,callback)},trackEvent:(name,detail)=>logged.push({name,detail})});
 listeners.get('youoweme:iphone-qr-viewed')({type:'youoweme:iphone-qr-viewed',detail:{cta_location:'fr_roommate_template_iphone_handoff',household:'never forwarded'}});
 assert.deepEqual(logged,[{name:'uomi_web_iphone_qr_viewed',detail:{cta_location:'fr_roommate_template_iphone_handoff'}}]);
});

test('English workbook,CSV,hero,builder,story and French Store assets remain byte-identical to approved production',()=>{
 for(const file of ['downloads/roommate-expense-tracker-template.xlsx','downloads/roommate-expense-tracker-template.csv','images/tools/roommate-expense-tracker-template/roommate-expense-tracker-spreadsheet-hero.webp','scripts/build-roommate-expense-tracker-workbook.mjs','scripts/generate-roommate-expense-tracker-assets.py','assets/js/money-story.mjs','styles/money-story.css','images/es/app-store/download-on-the-app-store-black.svg','images/es/iphone-handoff/app-store.png','downloads/es/plantilla-gastos-piso-compartido.xlsx','downloads/es/plantilla-gastos-piso-compartido.csv','images/es/tools/plantilla-gastos-piso-compartido/plantilla-gastos-piso-compartido-hero.webp','images/de/app-store/download-on-the-app-store-black.svg','images/de/iphone-handoff/app-store.png','downloads/de/wg-kasse-vorlage.xlsx','downloads/de/wg-kasse-vorlage.csv','images/de/tools/wg-kasse-vorlage/wg-kasse-vorlage-hero.webp','images/ar/app-store/download-on-the-app-store-black.svg','images/ar/iphone-handoff/app-store.png','downloads/ar/roommate-expense-tracker-template.xlsx','downloads/ar/roommate-expense-tracker-template.csv','images/ar/tools/roommate-expense-tracker-template/roommate-expense-tracker-template-hero.webp','images/fr/app-store/download-on-the-app-store-black.svg','images/fr/iphone-handoff/app-store.png']){
  const hash=value=>createHash('sha256').update(value).digest('hex');
  assert.equal(hash(fs.readFileSync(new URL('../'+file,import.meta.url))),hash(execFileSync('git',['show','19c0038:'+file])),file);
 }
 const normalize=html=>normalizeReviewedFrenchRoommateCopy(html)
  .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g,'')
  .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g,'')
  .replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?(")/g,(original,start,reference,end)=>{
   const path=new URL(reference,'https://you-owe-me.com/tools/roommate-expense-tracker-template/').pathname;
   return sharedAssetVersions[path]?start+reference+'?v=approved-cache'+end:original;
  });
 for(const file of ['tools/roommate-expense-tracker-template/index.html','es/herramientas/plantilla-gastos-piso-compartido/index.html','de/tools/wg-kasse-vorlage/index.html','ar/tools/roommate-expense-tracker-template/index.html','fr/outils/calculateur-partage-depenses/index.html','fr/blog/suivre-qui-vous-doit-de-l-argent/index.html'])assert.equal(normalize(read(file)),normalize(execFileSync('git',['show','19c0038:'+file],{encoding:'utf8'})),file);
});
