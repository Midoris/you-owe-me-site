import {test} from 'node:test';import assert from 'node:assert/strict';import {balance,validate,reviewDraft,recoveryState,minorUnits,validDate,interpretedDraft} from './loan-import-model.mjs';
const fixture=()=>({version:1,type:'loan-history',person:'Alex Synthetic',title:'Loan',currency:'USD',direction:'lent',openingContext:'full-history',records:[{id:'root',kind:'opening',date:'2026-01-01',amount:'1000',note:'原始 note',sourceRefs:[]},{id:'p1',kind:'payment',date:'2026-02-01',amount:'100',note:'Paid',sourceRefs:[]},{id:'p2',kind:'payment',date:'2026-03-01',amount:'200',note:'Paid',sourceRefs:[]}],unresolved:[],exclusions:[],plan:null});
test('exact balances, direction, currency precision and opening context',()=>{const d=fixture();assert.equal(validate(d),70000);d.direction='borrowed';assert.equal(validate(d),70000);d.openingContext='opening-balance';d.records=[{...d.records[0],amount:'700'}, {...d.records[1],amount:'50'}];assert.equal(balance(d),65000);assert.equal(minorUnits('1.234','KWD'),1234);assert.throws(()=>minorUnits('1.1','JPY'));});
test('malformed recovery, duplicate rows, unknown dates, precision and future payments reject without mutation',()=>{for(const mutate of [d=>d.records[0].note={},d=>d.records[0].sourceRefs=null,d=>d.records.push(d.records[0]),d=>d.currency='FAK',d=>d.records[0].date='2026-99-01',d=>d.extra='ignored']){const d=fixture();mutate(d);assert.throws(()=>reviewDraft(d));}assert.equal(validDate('2026-99-01'),false);const d=fixture();d.records[1].date='2199-01-01';assert.throws(()=>validate(d));d.records[1].date=null;assert.doesNotThrow(()=>reviewDraft(d));assert.throws(()=>validate(d));});
test('recovery keeps original identity and Clip additions after server expiry',()=>{const raw={version:1,envelope:{version:1,importID:'a'.repeat(64),createdAt:1000,expiresAt:86401000,origin:'web',draft:fixture()},payments:[{id:'clip',kind:'payment',date:'2026-04-01',amount:'50',note:'Clip',sourceRefs:[]}],adoptionIntent:true,acceptedAt:2000};const recovered=recoveryState(raw);assert.equal(recovered.state.envelope.importID,raw.envelope.importID);assert.equal(validate(recovered.draft),65000);assert.equal(raw.envelope.draft.records.length,3);});
test('100 full records preserved, 101 rejected, overpayment never clipped',()=>{const d=fixture();d.records=[d.records[0],...Array.from({length:99},(_,i)=>({...d.records[1],id:'r'+i,amount:'1'}))];assert.equal(validate(d),90100);d.records.push({...d.records[1],id:'extra'});assert.throws(()=>validate(d));const over=fixture();over.records[1].amount='1001';assert.throws(()=>validate(over));});
test('optional future plan never creates historical payments and unsupported terms can be history only',()=>{const d=fixture();d.plan={include:false,interestFree:false,payment:'100',frequency:'monthly',nextDueDate:'2026-01-01',timeZone:'Asia/Bangkok'};assert.equal(validate(d),70000);d.plan.include=true;assert.throws(()=>validate(d));d.plan.interestFree=true;d.plan.nextDueDate='2027-01-01';assert.equal(validate(d),70000);assert.equal(d.records.length,3);});

// Input boundaries are independent of the generated financial interpretation.
import {photoDimensions,validatePhotoFile} from './loan-import-image.mjs';
test('photo sizing preserves aspect ratio without enlarging, and rejects unsafe inputs',()=>{
  assert.deepEqual(photoDimensions(3000,1500),{width:2048,height:1024});
  assert.deepEqual(photoDimensions(600,800),{width:600,height:800});
  for(const dimensions of [[0,10],[9000,9000],[NaN,10]])assert.throws(()=>photoDimensions(...dimensions));
  assert.doesNotThrow(()=>validatePhotoFile({name:'LOAN.HEIC',size:1000}));
  assert.throws(()=>validatePhotoFile({name:'loan.jpg',size:20_000_001}));
  assert.throws(()=>validatePhotoFile({name:'loan.svg',size:1000}));
});

test('new interpretations include schedules and use device timezone only when missing',()=>{
  const raw=fixture();raw.plan={include:false,interestFree:true,payment:'100',frequency:'monthly',nextDueDate:'2027-01-01',timeZone:null};
  const d=interpretedDraft(raw,'Europe/Paris');assert.equal(d.plan.include,true);assert.equal(d.plan.timeZone,'Europe/Paris');assert.equal(validate(d),70000);
  raw.plan.timeZone='Asia/Tokyo';assert.equal(interpretedDraft(raw,'Europe/Paris').plan.timeZone,'Asia/Tokyo');
  assert.equal(raw.plan.include,false);assert.equal(reviewDraft(raw).plan.include,false); // Recovery does not re-enable an opt-out.
  raw.plan.interestFree=null;assert.throws(()=>validate(interpretedDraft(raw)));
  assert.equal(interpretedDraft(fixture()).plan,null);
});

import {reviewIssue} from './loan-import-model.mjs';
test('readiness uses strict validation, targets missing facts and never treats editing as confirmation',()=>{
  const d=fixture();d.person=null;d.unresolved=['Confirm the lender'];
  assert.equal(reviewIssue(d).target,'loan-review-person');d.person='Corrected Synthetic';
  assert.equal(reviewIssue(d).target,'loan-review-question-0');assert.equal(d.unresolved.length,1);
  d.unresolved=[];assert.equal(reviewIssue(d),null);d.records[1].amount='1001';
  assert.equal(reviewIssue(d).target,'loan-review-record-1-amount');assert.throws(()=>validate(d));
});
test('malformed excluded schedule terms still require explicit correction; incomplete terms can be history only',()=>{
  const d=fixture();d.plan={include:false,interestFree:null,payment:null,frequency:null,nextDueDate:null,timeZone:null};
  assert.equal(reviewIssue(d),null);const before=structuredClone(d);d.plan.include=true;assert.throws(()=>validate(d));
  d.plan.include=false;assert.deepEqual(d,before);
  d.plan.payment='100,50';assert.equal(reviewIssue(d).target,'loan-review-plan-payment');assert.throws(()=>reviewDraft(d));
  d.plan.payment=null;d.plan.timeZone='Synthetic/Invalid';assert.equal(reviewIssue(d).target,'loan-review-plan-zone');assert.throws(()=>reviewDraft(d));
  d.plan.timeZone=null;assert.equal(reviewIssue(d),null);
});
test('strict readiness retains malformed recovery, precision, date and overpayment boundaries',()=>{
  for(const mutate of [d=>d.records[0].date='2026-02-30',d=>d.records[1].date=null,d=>d.records[1].date='2199-01-01',d=>d.records[1].date='2025-01-01',d=>d.records[0].amount='1.001',d=>d.records[0].amount='-100',d=>d.records[0].amount='0',d=>d.extra='private',d=>d.records.push({...d.records[0]})]){
    const d=fixture();mutate(d);const before=structuredClone(d);assert.ok(reviewIssue(d));assert.throws(()=>validate(d));assert.deepEqual(d,before);
  }
});

import {editableDraft} from './loan-import-model.mjs';
test('editable recovery preserves unfinished amounts and timezone without weakening any handoff boundary',async()=>{
  const d=fixture();d.records[1].amount='100,';d.plan={include:false,interestFree:null,payment:'50,',frequency:null,nextDueDate:null,timeZone:'Synthetic/unfinished'};
  const restored=editableDraft(JSON.parse(JSON.stringify(d)));assert.deepEqual(restored,d);
  assert.throws(()=>validate(restored));assert.throws(()=>reviewDraft(restored));
  const {envelope}=await import('./loan-import-model.mjs');await assert.rejects(envelope(restored));
  const raw={version:1,envelope:{version:1,importID:'a'.repeat(64),createdAt:1000,expiresAt:86401000,origin:'web',draft:d},payments:[],adoptionIntent:false,acceptedAt:2000};
  assert.throws(()=>recoveryState(raw));
  for(const mutate of [d=>d.extra='ignored',d=>d.person='a'.repeat(101),d=>d.records[0].amount={},d=>d.plan.payment='1'.repeat(21),d=>d.plan.timeZone='z'.repeat(81),d=>d.records[0].date='2026-02-30',d=>d.records[0].note='\u0000',d=>d.records.push(d.records[0])]){
    const malformed=structuredClone(d);mutate(malformed);assert.throws(()=>editableDraft(malformed));
  }
});
