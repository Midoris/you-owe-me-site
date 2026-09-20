import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loanImportMarkup} from './loan-import-ui.mjs';
import {loanImportOffers} from './loan-import-offers.mjs';
import {loanImportEventName} from './loan-import-analytics.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const config=await read('scripts/loan-import-config.mjs');
async function configuration(hostname,search){return import('data:text/javascript,'+encodeURIComponent(`const globalThis={location:${JSON.stringify({hostname,search})}};\n`+config));}
test('rollout remains off on real hosts even with a preview query',async()=>{
 for(const host of ['you-owe-me.com','www.you-owe-me.com','continue.you-owe-me.com','localhost.evil.example']){
  for(const query of ['', '?loan-import=1']){const c=await configuration(host,query);assert.equal(c.enabled,false);assert.equal(c.localPreview,false);}
 }
});
test('local preview is explicit and selects only the local API',async()=>{
 for(const host of ['localhost','127.0.0.1']){
  assert.equal((await configuration(host,'')).enabled,false);
  const c=await configuration(host,'?loan-import=1');assert.equal(c.enabled,true);assert.match(c.apiBase,/^http:\/\/127\.0\.0\.1:5001\//);
 }
});
const routes={home:'', 'payment-plan':'tools/payment-plan-calculator/', 'partial-repayment':'tools/partial-repayment-calculator/', 'money-owed':'solutions/app-to-track-money-owed/', 'personal-loan':'solutions/personal-loan-repayment-tracker/', 'loan-guide':'blog/how-to-track-a-personal-loan-between-friends-or-family/', 'polite-reminder':'blog/how-to-remind-someone-they-owe-you-money-politely/', 'running-balance':'blog/what-is-a-running-balance-between-two-people/', 'record-guide':'blog/how-to-keep-track-of-who-owes-you-money/'};
test('all chosen routes mount one shared offer, hidden in static HTML',async()=>{
 assert.deepEqual(Object.keys(routes).sort(),Object.keys(loanImportOffers).sort());
 for(const [key,route] of Object.entries(routes)){
  const page=await read(route+'index.html');
  assert.equal((page.match(/data-loan-offer=/g)||[]).length,1,route);
  assert.ok(page.includes(`data-loan-offer="${key}" hidden`),route);
  assert.equal((page.match(/src="\/scripts\/loan-import-entry.mjs"/g)||[]).length,1,route);
  assert.doesNotMatch(page,/id="loan-import-text"|src="\/scripts\/loan-import.mjs"/);
 }
 const tracker=await read('tools/personal-loan-payment-tracker/index.html');
 assert.match(tracker,/<div data-loan-import-root hidden><\/div>/);
});
test('shared private intake has unique IDs and collapsed text/photo inputs',()=>{
 const ids=[...loanImportMarkup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 assert.match(loanImportMarkup,/data-loan-private hidden/);
 assert.match(loanImportMarkup,/id="loan-import-text-panel" hidden/);
 assert.match(loanImportMarkup,/id="loan-import-photo-options"[^>]*hidden>[\s\S]*?id="loan-import-photo-quality"/);
 assert.match(loanImportMarkup,/Review sends your input to You Owe Me and OpenAI/);
});
test('discovery analytics accept only fixed event names, without extra payload fields',()=>{
 assert.equal(loanImportEventName('offer_viewed'),'uomi_web_loan_offer_viewed');
 assert.equal(loanImportEventName('offer_chosen'),'uomi_web_loan_offer_chosen');
 assert.equal(loanImportEventName('offer_chosen_private-name'),null);
});
test('mismatched group and pre-loan journeys keep their existing paths',async()=>{
 for(const route of ['tools/split-expense-calculator/','tools/roommate-expense-tracker-template/','blog/how-to-politely-say-no-when-people-ask-for-money/','blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/']){
  assert.doesNotMatch(await read(route+'index.html'),/data-loan-offer/);
 }
});

test('original tracker initializes immediately and honors a direct import anchor',async()=>{
 const {runInNewContext}=await import('node:vm');
 const entry=(await read('scripts/loan-import-entry.mjs')).replace(/^import .*;$/gm,'').replaceAll('import(', 'loadModule(');
 let started=0,scrolled=0;
 const tool={scrollIntoView(){scrolled++;}};
 const host={hidden:true,markup:'',querySelector(){return this.markup?tool:null;},set innerHTML(v){this.markup=v;}};
 runInNewContext(entry,{
  enabled:true,localPreview:true,loanImportOffers:{},location:{hash:'#import-loan-history'},
  window:{qrcode(){}},navigator:{userAgent:'Desktop'},
  document:{querySelectorAll(){return [];},querySelector(selector){return selector==='[data-loan-import-root]'?host:{};}},
  loadModule:async path=>path.includes('-ui')?{loanImportMarkup:'private template'}:{startLoanImport(root){assert.equal(root,tool);started++;}}
 });
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(started,1);assert.equal(scrolled,1);assert.equal(host.hidden,false);
});
test('disabled bootstrap touches neither the DOM nor private recovery storage',async()=>{
 const {runInNewContext}=await import('node:vm');
 const entry=(await read('scripts/loan-import-entry.mjs')).replace(/^import .*;$/gm,'');
 const forbidden=new Proxy({}, {get(){throw Error('Disabled import must remain inert');}});
 runInNewContext(entry,{enabled:false,localPreview:false,document:forbidden,window:forbidden,sessionStorage:forbidden});
});
