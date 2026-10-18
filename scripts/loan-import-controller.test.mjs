import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as model from './loan-import-model.mjs';
import {LoanImportLimitError} from './loan-import-errors.mjs';
import {loanImportInputStage} from './loan-import-analytics.mjs';
import {loanImportMarkup} from './loan-import-ui.mjs';

const fixture=()=>({...model.manualDraft(),person:'Synthetic Alex',currency:'USD',direction:'lent',openingContext:'full-history',records:[{...model.newRow('opening'),date:'2026-01-01',amount:'1000'}]});
const code=(await readFile(new URL('./loan-import.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export function','function');
// A small DOM test double exercises the real controller and model, not a parallel flow.
function harness({draft=fixture(),prepared=null,preview=false,respond=async(url,options)=>({ok:true,json:async()=>({version:1,importID:'a'.repeat(64),createdAt:1000,expiresAt:86401000,origin:'web',draft:JSON.parse(options.body).draft})})}={}){
  let active=null;const events=[],requests=[],downloads=[],storage=new Map();
  class Element{
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.dataset={};this.value='';this.hidden=false;this.text='';}
    set textContent(value){this.text=value;this.children=[];}get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}
    get firstElementChild(){return this.children[0];}
    setAttribute(key,value){this[key]=value;}removeAttribute(key){delete this[key];}
    append(...nodes){for(let n of nodes){if(typeof n==='string')n=document.createTextNode(n);n.parentElement=this;this.children.push(n);}}
    replaceChildren(...nodes){this.text='';this.children=[];this.append(...nodes);}
    insertBefore(node,before){this.children=this.children.filter(n=>n!==node);this.children.splice(this.children.indexOf(before),0,node);}
    querySelector(selector){return this.all().find(n=>selector[0]==='#'?n.id===selector.slice(1):n.tagName===selector.toUpperCase())??null;}
    all(){return this.children.flatMap(n=>[n,...n.all()]);}
    addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
    click(){void this.fire();}
    focus(){active=this;}scrollIntoView(){}
    fire(type='click',extra={}){return Promise.all((this.listeners[type]??[]).map(fn=>fn({target:this,detail:1,...extra})));}
  }
  const document={createElement:tag=>new Element(tag),createTextNode:text=>{const n=new Element('text');n.textContent=text;return n;}};
  const root=new Element('section');
  for(const [,tag,id] of loanImportMarkup.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g)){if(id==='import-loan-history')continue;const node=new Element(tag);node.id=id;root.append(node);}
  if(draft)storage.set('uomi.loan-import.review.v1',JSON.stringify({draft,prepared,revision:0}));
  const context={...model,LoanImportLimitError,loanImportInputStage,prepareLoanPhoto(){throw Error('not used');},photoQualityCopy:'Synthetic',enabled:true,localPreview:preview,apiBase:'http://fixture/',continuationBase:'https://example.invalid/',root,document,
    crypto:webcrypto,structuredClone,TextEncoder,Intl,Date,AbortController,queueMicrotask,setTimeout:callback=>callback(),Blob,URL:{createObjectURL(blob){downloads.push(blob);return 'blob:synthetic';},revokeObjectURL(){}},
    sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    window:{dispatchEvent:event=>events.push(event.detail),qrcode:null},navigator:{userAgent:'Desktop'},CustomEvent:class{constructor(type,options){this.detail=options.detail;}},
    fetch:async(url,options)=>{requests.push({url,options});return respond(url,options);}};
  runInNewContext(code+'\nstartLoanImport(root);',context);
  return {root,events,requests,downloads,storage,get active(){return active;},get saved(){return JSON.parse(storage.get('uomi.loan-import.review.v1')||'null');},
    $:id=>root.querySelector('#'+id),button:text=>root.all().find(n=>n.tagName==='BUTTON'&&n.textContent===text)};
}
const names=h=>h.events.map(e=>e.name);

test('guidance and rerendering emit nothing; rejection focuses the required field and coalesces double-clicks',async()=>{
  const draft=fixture();draft.person=null;draft.unresolved=['Confirm who lent the money'];const h=harness({draft});
  assert.deepEqual(h.events,[]);assert.match(h.$('loan-review-readiness').textContent,/person/);
  const first=h.$('loan-review-continue').fire();const duplicate=h.$('loan-review-continue').fire();await Promise.all([first,duplicate]);
  await h.$('loan-review-continue').fire('click',{detail:2});
  assert.deepEqual(names(h),['continue_attempt','continue_rejected']);assert.equal(h.requests.length,0);assert.equal(h.active.id,'loan-review-person');
  const input=h.$('loan-review-person');input.value='Corrected Synthetic';input.focus();await input.fire('input');
  assert.equal(h.active,input);assert.equal(h.saved.draft.unresolved.length,1);assert.match(h.$('loan-review-readiness').textContent,/questions/);
  await h.$('loan-review-fix').fire();assert.equal(h.active.id,'loan-review-question-0');
  await h.button('Confirm resolved').fire();assert.equal(h.active.id,'loan-review-continue');assert.equal(h.saved.draft.unresolved.length,0);
  assert.deepEqual(names(h),['continue_attempt','continue_rejected']);
});

test('incomplete detected plan has an explicit reversible history-only choice; transfer is not a committed import',async()=>{
  const draft=fixture();draft.plan={include:true,interestFree:null,payment:'100',frequency:'monthly',nextDueDate:null,timeZone:'Asia/Bangkok'};
  const h=harness({draft});assert.equal(h.$('loan-review-history-only').hidden,false);
  await h.$('loan-review-history-only').fire();assert.equal(h.active.id,'loan-review-continue');
  assert.deepEqual(h.saved.draft.plan,{...draft.plan,include:false});assert.equal(h.saved.draft.records.length,1);
  const checkbox=h.root.all().find(n=>n.type==='checkbox');checkbox.checked=true;await checkbox.fire('change');assert.equal(h.$('loan-review-plan-payment').value,'100');
  await h.$('loan-review-history-only').fire();await h.$('loan-review-continue').fire();
  assert.deepEqual(names(h),['continue_attempt','transfer_prepared']);assert.equal(h.requests.length,1);
  const sent=JSON.parse(h.requests[0].options.body);assert.equal(sent.draft.plan.include,false);assert.equal(sent.draft.plan.payment,'100');
  await h.button('Edit this loan').fire();await h.$('loan-review-continue').fire();
  assert.equal(h.requests.length,1);assert.deepEqual(names(h),['continue_attempt','transfer_prepared']);
});

test('pending double activation creates one transfer; a failed request can be retried',async()=>{
  let release;let calls=0;const gate=new Promise(resolve=>{release=resolve;});
  const h=harness({respond:async()=>{calls++;if(calls===1){await gate;throw Error('Synthetic network failure');}return {ok:true,json:async()=>({version:1})};}});
  const first=h.$('loan-review-continue').fire();await h.$('loan-review-continue').fire();assert.equal(h.requests.length,1);
  release();await first;assert.deepEqual(names(h),['continue_attempt']);assert.equal(h.$('loan-import-review').inert,false);
  await h.$('loan-review-continue').fire();assert.equal(h.requests.length,2);assert.deepEqual(names(h),['continue_attempt','continue_attempt','transfer_prepared']);
});

test('explicit discard counts once, not disclosure, edit, backup or rendering',async()=>{
  const h=harness();assert.deepEqual(h.events,[]);
  const discard=h.button('Discard draft and start again');await discard.fire();await discard.fire();
  assert.deepEqual(names(h),['import_cancelled']);assert.equal(h.saved,null);assert.equal(h.$('loan-import-intake').hidden,false);
});

test('Stop waiting counts once even if a late successful response ignores abort; retry still works',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const h=harness({draft:null,respond:async()=>{await gate;return {ok:true,json:async()=>({draft:fixture(),source:null})};}});
  h.$('loan-import-text').value='Synthetic private notes';const request=h.$('loan-import-interpret').fire();
  await h.$('loan-import-cancel').fire();await h.$('loan-import-cancel').fire();release();await request;
  assert.deepEqual(names(h),['interpret_requested','input_text','import_cancelled']);assert.equal(h.saved,null);
  assert.equal(h.$('loan-import-text').value,'Synthetic private notes');
  await h.$('loan-import-interpret').fire();assert.deepEqual(names(h).slice(-3),['interpret_requested','input_text','interpret_ready']);
});

test('local preview suppresses every action event, including rejection and explicit cancellation',async()=>{
  const draft=fixture();draft.person=null;const h=harness({draft,preview:true});await h.$('loan-review-continue').fire();await h.button('Discard draft and start again').fire();assert.deepEqual(h.events,[]);
});

test('question acknowledgment and record removal retain logical keyboard focus',async()=>{
  const draft=fixture();draft.unresolved=['Synthetic question one','Synthetic question two'];draft.records.push({...model.newRow(),date:'2026-02-01',amount:'10'});
  const h=harness({draft});await h.$('loan-review-question-0').fire();assert.equal(h.active.id,'loan-review-question-0');assert.equal(h.saved.draft.unresolved[0],'Synthetic question two');
  await h.button('Remove this record').fire();assert.equal(h.active.id,'loan-review-record-0-date');assert.deepEqual(h.events,[]);
});

test('malformed optional plan edits cannot offer a misleading history-only shortcut or lose the raw edit',async()=>{
  for(const [field,value,target] of [['payment','100,50','loan-review-plan-payment'],['timeZone','Synthetic/Invalid','loan-review-plan-zone']]){
    const draft=fixture();draft.plan={include:true,interestFree:null,payment:'100',frequency:null,nextDueDate:null,timeZone:'UTC'};
    const h=harness({draft});const control=h.$(target);control.value=value;await control.fire('input');
    assert.equal(h.$('loan-review-history-only').hidden,true);assert.equal(h.$('loan-review-plan-history-only').hidden,true);
    assert.equal(h.saved.draft.plan[field],value);
    const checkbox=h.root.all().find(n=>n.type==='checkbox');checkbox.checked=false;await checkbox.fire('change');
    await h.$('loan-review-continue').fire();assert.deepEqual(names(h),['continue_attempt','continue_rejected']);assert.equal(h.active.id,target);assert.equal(h.requests.length,0);
    assert.equal(h.$('loan-review-plan-fields').hidden,false);control.value='';await control.fire('input');
    assert.match(h.$('loan-review-readiness').textContent,/Ready/);assert.equal(h.saved.draft.plan.include,false);
  }
});

test('bad history cannot mask malformed plan; editable local recovery resumes both errors without losing either',async()=>{
  const draft=fixture();draft.records[0].amount='100,';draft.plan={include:true,interestFree:null,payment:'50,',frequency:null,nextDueDate:null,timeZone:'UTC'};
  const h=harness({draft});assert.equal(h.$('loan-review-record-0-amount').value,'100,');assert.equal(h.$('loan-review-plan-payment').value,'50,');
  assert.equal(h.$('loan-review-plan-history-only').hidden,true);
  const history=h.$('loan-review-record-0-amount');history.value='100';await history.fire('input');
  assert.equal(h.$('loan-review-plan-history-only').hidden,true);assert.equal(h.saved.draft.plan.payment,'50,');
  const plan=h.$('loan-review-plan-payment');plan.value='50';await plan.fire('input');assert.equal(h.$('loan-review-plan-history-only').hidden,false);
  await h.$('loan-review-plan-history-only').fire();await h.$('loan-review-continue').fire();assert.deepEqual(names(h),['continue_attempt','transfer_prepared']);
});

test('unfinished editor backup reopens for correction while signed recovery still rejects those same terms',async()=>{
 const draft=fixture();draft.plan={include:true,interestFree:null,payment:'50,',frequency:null,nextDueDate:null,timeZone:'Synthetic/unfinished'};
 const h=harness({draft:null});h.$('loan-import-file').files=[{name:'synthetic.json',size:1000,text:async()=>JSON.stringify({version:1,type:'loan-review-recovery',draft,source:null})}];
 await h.$('loan-import-file').fire('change');assert.equal(h.$('loan-review-plan-payment').value,'50,');assert.equal(h.saved.draft.plan.timeZone,'Synthetic/unfinished');
 await h.$('loan-review-continue').fire();assert.equal(h.requests.length,0);assert.equal(names(h).at(-1),'continue_rejected');
});

function nativeRecovery(){
 const draft=fixture();draft.plan={include:true,interestFree:true,payment:'50',frequency:'monthly',nextDueDate:'2026-01-02',timeZone:'UTC'};
 const state={version:1,envelope:{version:1,importID:'b'.repeat(64),createdAt:1000,expiresAt:86401000,origin:'native',draft},payments:[{...model.newRow(),date:'2026-02-01',amount:'50'}],adoptionIntent:true,acceptedAt:2000};
 return {state,...model.recoveryState(state)};
}
test('validated native recovery retains original identity after reload and overdue schedule backup',async()=>{
 const {state,draft}=nativeRecovery();assert.ok(model.reviewIssue(draft)); // Too late for a new future schedule; still a valid native recovery.
 const h=harness({draft,prepared:{state,envelope:state.envelope,reference:null}});
 assert.ok(h.button('Edit this loan'));assert.equal(h.$('loan-import-review').hidden,true);
 await h.button('Save a backup file').fire();assert.equal(h.downloads.length,1);
 const backup=JSON.parse(await h.downloads[0].text());assert.deepEqual(backup,state);assert.equal(backup.envelope.importID,'b'.repeat(64));assert.equal(backup.payments.length,1);assert.deepEqual(h.events,[]);
 await h.button('Edit this loan').fire();const amount=h.$('loan-review-record-0-amount');amount.value='900';await amount.fire('input');assert.equal(h.saved.prepared,null);
 await h.button('Save a backup file').fire();const edited=JSON.parse(await h.downloads[1].text());assert.equal(edited.type,'loan-review-recovery');assert.equal(edited.envelope,undefined);
});

test('invalid or mismatched cached prepared recovery cannot bypass the current review',async()=>{
 for(const mutate of [p=>p.state.envelope.importID='invalid',p=>p.state.envelope.draft.records[0].amount='100,',p=>p.state.payments[0].amount='50,',p=>p.envelope={...p.envelope,importID:'c'.repeat(64)}]){
  const {state,draft}=nativeRecovery();const prepared=structuredClone({state,envelope:state.envelope,reference:null});mutate(prepared);
  const h=harness({draft,prepared});assert.equal(h.button('Edit this loan'),undefined);await h.$('loan-review-continue').fire();assert.equal(h.requests.length,0);assert.deepEqual(names(h),['continue_attempt','continue_rejected']);
 }
 const {state,draft}=nativeRecovery();draft.person='Different Synthetic';const mismatched=harness({draft,prepared:{state,envelope:state.envelope,reference:null}});assert.equal(mismatched.button('Edit this loan'),undefined);
});
