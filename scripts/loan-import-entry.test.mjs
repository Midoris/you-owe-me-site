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
test('public rollout uses the production API regardless of preview query',async()=>{
 for(const host of ['you-owe-me.com','www.you-owe-me.com','continue.you-owe-me.com','localhost.evil.example']){
  for(const query of ['', '?loan-import=1']){const c=await configuration(host,query);assert.equal(c.enabled,true);assert.equal(c.localPreview,false);assert.equal(c.apiBase,"https://us-central1-you-owe-me-app.cloudfunctions.net/");}
 }
});
test('local preview is explicit and selects only the local API',async()=>{
 for(const host of ['localhost','127.0.0.1']){
  assert.equal((await configuration(host,'')).enabled,true);
  const c=await configuration(host,'?loan-import=1');assert.equal(c.enabled,true);assert.match(c.apiBase,/^http:\/\/127\.0\.0\.1:5001\//);
 }
});
const routes={home:'', 'payment-plan':'tools/payment-plan-calculator/', 'partial-repayment':'tools/partial-repayment-calculator/', 'money-owed':'solutions/app-to-track-money-owed/', 'personal-loan':'solutions/personal-loan-repayment-tracker/', 'loan-guide':'blog/how-to-track-a-personal-loan-between-friends-or-family/', 'polite-reminder':'blog/how-to-remind-someone-they-owe-you-money-politely/', 'running-balance':'blog/what-is-a-running-balance-between-two-people/', 'record-guide':'blog/how-to-keep-track-of-who-owes-you-money/'};
test('all chosen routes serve one visible offer before enhancement',async()=>{
 assert.deepEqual(Object.keys(routes).sort(),Object.keys(loanImportOffers).sort());
 for(const [key,route] of Object.entries(routes)){
  const page=await read(route+'index.html');
  assert.equal((page.match(/data-loan-offer=/g)||[]).length,1,route);
  assert.ok(page.includes(`data-loan-offer="${key}"`),route);
  assert.doesNotMatch(page,new RegExp(`data-loan-offer="${key}" hidden`));
  assert.equal((page.match(/src="\/scripts\/loan-import-entry.mjs\?v=20260923-discovery1"/g)||[]).length,1,route);
  assert.match(page,/<button[^>]*data-loan-import-open[^>]*hidden>/);
  assert.doesNotMatch(page,/id="loan-import-text"|src="\/scripts\/loan-import.mjs"/);
 }
 const tracker=await read('tools/personal-loan-payment-tracker/index.html');
 assert.match(tracker,/<div id="import-loan-history" data-loan-import-root hidden><\/div>/);
});
test('shared private intake has unique IDs and collapsed text/photo inputs',()=>{
 const ids=[...loanImportMarkup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 assert.match(loanImportMarkup,/data-loan-private hidden/);
 assert.match(loanImportMarkup,/id="loan-import-text-panel" hidden/);
 assert.match(loanImportMarkup,/id="loan-import-photo-options"[^>]*hidden>[\s\S]*?id="loan-import-photo-quality"/);
 assert.match(loanImportMarkup,/You Owe Me send your text, photo or file to OpenAI/);
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

async function offerHarness({preview=false, failures=0, gate=null, malformed=false}={}) {
 const {runInNewContext}=await import('node:vm');
 const entry=(await read('scripts/loan-import-entry.mjs')).replace(/^import .*;$/gm,'').replaceAll('import(', 'loadModule(');
 const events=[];let started=0,focused=0,scrolled=0,observed=0,disconnected=0;
 const root={focus(){focused++;},scrollIntoView(){scrolled++;}};
 const workspace={id:'loan-import-workspace',hidden:true,markup:'',note:null,
  querySelector(selector){return selector==='#import-loan-history'&&this.markup?root:null;},
  set innerHTML(value){this.markup=value;this.note=null;},
  replaceChildren(note){this.note=note;this.markup='';}};
 const listeners=[];
 const button={hidden:true,disabled:false,textContent:'Import loan history',attributes:{'aria-expanded':'false'},
  addEventListener(name,handler){if(name==='click')listeners.push(handler);},
  setAttribute(name,value){this.attributes[name]=value;}};
 const card={querySelector(selector){return selector==='[data-loan-import-open]'&&!malformed?button:null;}};
 const guide={href:'/tools/personal-loan-payment-tracker/#loan-import-guide'};
 const host={querySelector(selector){return selector==='.loan-import-offer'?card:selector==='#loan-import-workspace'?workspace:null;},guide};
 const docListeners=new Map();
 const document={visibilityState:'visible',
  querySelectorAll(selector){return selector==='[data-loan-offer]'?[host]:[];},
  querySelector(selector){return selector==='link[href="/styles/loan-import.css"]'?{}:null;},
  addEventListener(name,handler){docListeners.set(name,handler);},
  removeEventListener(name){docListeners.delete(name);},
  createElement(tag){return {tag,setAttribute(name,value){this[name]=value;}};}};
 let observer;
 class IntersectionObserver {
  constructor(callback,options){this.callback=callback;this.options=options;observer=this;}
  observe(target){assert.equal(target,card);observed++;}
  disconnect(){disconnected++;}
 }
 const context={enabled:true,localPreview:preview,document,navigator:{userAgent:'Desktop'},location:{hash:''},
  window:{qrcode(){},dispatchEvent(event){events.push(event.detail.name);}},
  CustomEvent:class{constructor(name,options){this.detail=options.detail;}},IntersectionObserver,
  loadModule:async path=>{
   if(path.includes('loan-import-ui')) {if(gate) await gate;if(failures-- > 0) throw Error('unavailable');return {loanImportMarkup:'private template'};}
   return {startLoanImport(){started++;}};
  }};
 runInNewContext(entry+'\nglobalThis.reinit=enhanceOffer;',context);
 return {context,document,docListeners,events,button,listeners,workspace,guide,root,host,
  get observer(){return observer;},get started(){return started;},get focused(){return focused;},get scrolled(){return scrolled;},get observed(){return observed;},get disconnected(){return disconnected;}};
}

test('enhancement binds once, reveals after binding, focuses success and counts only successful choice',async()=>{
 const h=await offerHarness();
 assert.equal(h.listeners.length,1);
 assert.equal(h.button.hidden,false);
 h.context.reinit(h.host);
 assert.equal(h.listeners.length,1);
 const first=await h.listeners[0]();
 assert.equal(first,undefined);
 assert.equal(h.started,1);
 assert.equal(h.focused,1);
 assert.equal(h.scrolled,1);
 assert.equal(h.button.attributes['aria-expanded'],'true');
 assert.equal(h.button.textContent,'Return to your import');
 assert.deepEqual(h.events,['offer_chosen']);
 await h.listeners[0]();
 assert.equal(h.workspace.querySelector('#import-loan-history'),h.root);
 assert.deepEqual(h.events,['offer_chosen']);
 assert.equal(h.guide.href,'/tools/personal-loan-payment-tracker/#loan-import-guide');
});

test('rapid activation, load failure and retry retain the static guide and event boundaries',async()=>{
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 const rapid=await offerHarness({gate});
 const opening=rapid.listeners[0]();
 await rapid.listeners[0]();
 assert.equal(rapid.button.textContent,'Opening…');
 assert.equal(rapid.started,0);
 release();await opening;
 assert.equal(rapid.started,1);
 assert.deepEqual(rapid.events,['offer_chosen']);
 const retry=await offerHarness({failures:1});
 await retry.listeners[0]();
 assert.equal(retry.button.textContent,'Try opening again');
 assert.equal(retry.button.attributes['aria-expanded'],'false');
 assert.deepEqual(retry.events,[]);
 assert.equal(retry.workspace.note.role,'alert');
 assert.equal(retry.guide.href,'/tools/personal-loan-payment-tracker/#loan-import-guide');
 await retry.listeners[0]();
 assert.equal(retry.button.textContent,'Return to your import');
 assert.deepEqual(retry.events,['offer_chosen']);
});

test('viewport exposure requires half a card in a visible document and emits once',async()=>{
 const h=await offerHarness();
 assert.equal(h.observed,1);
 assert.equal(h.observer.options.threshold,.5);
 h.observer.callback([{isIntersecting:true,intersectionRatio:.49}]);
 assert.deepEqual(h.events,[]);
 h.document.visibilityState='hidden';
 h.observer.callback([{isIntersecting:true,intersectionRatio:.5}]);
 assert.deepEqual(h.events,[]);
 h.document.visibilityState='visible';h.docListeners.get('visibilitychange')();
 assert.deepEqual(h.events,['offer_viewed']);
 assert.equal(h.disconnected,1);
 assert.equal(h.docListeners.has('visibilitychange'),false);
 h.observer.callback([{isIntersecting:true,intersectionRatio:1}]);
 assert.deepEqual(h.events,['offer_viewed']);
 const preview=await offerHarness({preview:true});
 preview.observer.callback([{isIntersecting:true,intersectionRatio:.5}]);
 await preview.listeners[0]();
 assert.deepEqual(preview.events,[]);
 const malformed=await offerHarness({malformed:true});
 assert.equal(malformed.button.hidden,true);
 assert.equal(malformed.observed,0);
});
