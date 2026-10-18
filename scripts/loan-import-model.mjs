export const limits = Object.freeze({records:100,fileBytes:2000000,sourceBytes:48000,draftBytes:180000});
export const currencies = Intl.supportedValuesOf('currency');
export function digits(currency) { if (!currencies.includes(currency)) throw Error('Choose a currency.'); return new Intl.NumberFormat('en-US',{style:'currency',currency}).resolvedOptions().maximumFractionDigits; }
export function minorUnits(amount,currency) {
  const scale=digits(currency), value=String(amount??'');
  if(!/^(0|[1-9]\d{0,10})(\.\d{1,4})?$/.test(value))throw Error('Enter a positive amount using a decimal point and no thousands separators.');
  const [whole,fraction='']=value.split('.');if(fraction.length>scale)throw Error(`${currency} supports ${scale} decimal places.`);
  const result=Number(whole)*10**scale+Number(fraction.padEnd(scale,'0'));
  if(!Number.isSafeInteger(result)||result<=0||result>1e12)throw Error('Check the amount.');return result;
}
export function balance(draft) {
  let value=0;
  for(const [index,row] of draft.records.entries()){value+=minorUnits(row.amount,draft.currency)*(row.kind==='payment'?-1:1);if(value<0||value>1e12)reject('A payment exceeds the amount then owed. Check the dates, opening balance and duplicates.',`loan-review-record-${index}-amount`);}
  return value;
}
export function money(minor,currency) {return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(minor/10**digits(currency));}
export function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value??'')&&value>='1900-01-01'&&value<='2199-12-31'&&Number.isFinite(new Date(value+'T12:00:00Z').getTime())&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
export function calendarToday(timeZone,now=new Date()) {
  const parts=new Intl.DateTimeFormat('en',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>parts.find(p=>p.type===type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
// Targets are local review controls only; never sent to analytics or the transfer service.
function reject(message,target=null){const error=Error(message);error.reviewTarget=target;throw error;}
function amountAt(amount,currency,target){try{return minorUnits(amount,currency);}catch(error){reject(error.message,target);}}
export function validate(draft,today=new Date().toISOString().slice(0,10)) {
  reviewDraft(draft);
  if(!draft.person?.trim())reject('Enter the person’s name.','loan-review-person');
  if(!draft.title?.trim())reject('Enter a loan name.','loan-review-title');
  if(!['lent','borrowed'].includes(draft.direction))reject('Choose who lent the money.','loan-review-direction');
  if(!draft.currency)reject('Choose the loan currency.','loan-review-currency');
  if(!['full-history','opening-balance'].includes(draft.openingContext))reject('Choose where this history begins.','loan-review-opening-context');
  if(!draft.records.length||draft.records.length>100)reject('Keep one complete loan with at most 100 financial records, including its opening balance.');
  if(draft.records[0].kind!=='opening'||draft.records.slice(1).some(r=>!['payment','advance'].includes(r.kind)))reject('The first record must be the opening loan or opening balance.');
  if(draft.person.length>100||draft.title.length>120||draft.records.some(r=>r.note.length>1000))reject('A name, title or note is too long. Shorten it explicitly; nothing has been truncated.');
  if(new Set(draft.records.map(r=>r.id)).size!==draft.records.length)reject('Duplicate record identifiers.');
  draft.records.forEach((r,i)=>{
    const label=i===0?'opening record':`record ${i+1}`;
    if(!validDate(r.date)||r.date>today||(i&&r.date<draft.records[i-1].date))reject(`Check the date for ${label}. Use actual dates in order, with the year included.`, `loan-review-record-${i}-date`);
    amountAt(r.amount,draft.currency,`loan-review-record-${i}-amount`);
  });
  const remaining=balance(draft);
  if(draft.unresolved.length)reject('Check the remaining questions and confirm each is resolved.','loan-review-question-0');
  const p=draft.plan;
  if(p?.include){
    if(p.interestFree!==true)reject('Confirm an explicitly interest-free agreement, or use history only.','loan-review-plan-interest');
    amountAt(p.payment,draft.currency,'loan-review-plan-payment');
    if(!['weekly','biweekly','monthly'].includes(p.frequency))reject('Choose a schedule frequency, or use history only.','loan-review-plan-frequency');
    if(!p.timeZone)reject('Confirm the schedule timezone, or use history only.','loan-review-plan-zone');
    try{new Intl.DateTimeFormat('en',{timeZone:p.timeZone});}catch{reject('Check the schedule timezone, or use history only.','loan-review-plan-zone');}
    if(!validDate(p.nextDueDate)||p.nextDueDate<=calendarToday(p.timeZone))reject('Confirm a future next due date, or use history only.','loan-review-plan-date');
    if(remaining<=0)reject('This history has no remaining balance for a future schedule. Use history only.','loan-review-plan-interest');
  }
  if(new TextEncoder().encode(JSON.stringify(draft)).length>limits.draftBytes)reject('This draft is too large. Nothing has been shortened.');return remaining;
}
// The same strict validator powers guidance and continuation. Rendering emits no events.
export function reviewIssue(draft){try{validate(draft);return null;}catch(error){return {message:error.message,target:error.reviewTarget??null};}}
export function manualDraft(){return {version:1,type:'loan-history',person:null,title:'Personal loan',currency:null,direction:null,openingContext:null,records:[newRow('opening')],unresolved:[],exclusions:[],plan:null};}
export function newRow(kind='payment'){return {id:crypto.randomUUID(),kind,date:null,amount:null,note:'',sourceRefs:[]};}
export function reference(){const bytes=crypto.getRandomValues(new Uint8Array(26));return Date.now().toString(16).padStart(12,'0')+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
export async function envelope(draft,origin='web',ref=reference()) {validate(draft);const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ref));const now=Date.now();return {version:1,importID:Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join(''),createdAt:now,expiresAt:now+86400000,origin,draft:structuredClone(draft)};}

// Editable recovery keeps unfinished amount/timezone strings; handoff remains strict.
export function editableDraft(raw){return checkedDraft(raw,true);}
export function reviewDraft(raw){return checkedDraft(raw,false);}
function checkedDraft(raw,editable) {
  const d=structuredClone(raw), object=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const text=(v,n,nullable=false)=>nullable&&v===null||typeof v==='string'&&v.length<=n&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
  const keys=(o,k)=>object(o)&&Object.keys(o).length===k.length&&k.every(x=>Object.hasOwn(o,x));
  const invalid=()=>{throw Error('This recovery draft is malformed or exceeds the supported limits. Nothing was replaced.');};
  if(!keys(d,['version','type','person','title','currency','direction','openingContext','records','unresolved','exclusions','plan'])||d.version!==1||d.type!=='loan-history'||!text(d.person,100,true)||!text(d.title,120)||!([null,...currencies].includes(d.currency))||![null,'lent','borrowed'].includes(d.direction)||![null,'full-history','opening-balance'].includes(d.openingContext)||!Array.isArray(d.records)||d.records.length>100||!Array.isArray(d.unresolved)||d.unresolved.length>100||!d.unresolved.every(v=>text(v,500))||!Array.isArray(d.exclusions)||d.exclusions.length>800)invalid();
  for(const [index,row] of d.records.entries()){if(!keys(row,['id','kind','date','amount','note','sourceRefs'])||!text(row.id,64)||!/^[A-Za-z0-9_-]+$/.test(row.id)||!['opening','payment','advance'].includes(row.kind)||!(row.date===null||validDate(row.date))||!text(row.amount,20,true)||!text(row.note,1000)||!Array.isArray(row.sourceRefs)||row.sourceRefs.length>20||!row.sourceRefs.every(v=>text(v,80)))invalid();if(!editable&&row.amount&&d.currency)amountAt(row.amount,d.currency,`loan-review-record-${index}-amount`);}
  if(new Set(d.records.map(r=>r.id)).size!==d.records.length)invalid();
  for(const e of d.exclusions)if(!keys(e,['sourceRef','reason'])||!text(e.sourceRef,80)||!text(e.reason,500))invalid();
  if(d.plan!==null){const p=d.plan;if(!keys(p,['interestFree','payment','frequency','nextDueDate','timeZone','include'])||![null,true,false].includes(p.interestFree)||typeof p.include!=='boolean'||!text(p.payment,20,true)||![null,'weekly','biweekly','monthly'].includes(p.frequency)||!(p.nextDueDate===null||validDate(p.nextDueDate))||!text(p.timeZone,80,true))invalid();if(!editable&&p.payment&&d.currency)try{amountAt(p.payment,d.currency,'loan-review-plan-payment');}catch{reject('Correct or clear the schedule payment. Use a decimal point and the currency’s decimal places.','loan-review-plan-payment');}if(!editable&&p.timeZone)try{new Intl.DateTimeFormat('en',{timeZone:p.timeZone});}catch{reject('Enter a valid schedule timezone, or clear it.','loan-review-plan-zone');}}
  if(new TextEncoder().encode(JSON.stringify(d)).length>limits.draftBytes)invalid();return d;
}
export function recoveryState(raw) {
  const state=structuredClone(raw),e=state?.envelope;
  if(state?.version!==1||e?.version!==1||!/^[a-f0-9]{64}$/.test(e.importID)||!['web','native'].includes(e.origin)||!Number.isSafeInteger(e.createdAt)||e.createdAt<=0||e.expiresAt!==e.createdAt+86400000||!Number.isSafeInteger(state.acceptedAt)||state.acceptedAt<=0||typeof state.adoptionIntent!=='boolean'||!Array.isArray(state.payments)||state.payments.length>29)throw Error('Invalid recovery file.');
  reviewDraft(e.draft);const d=structuredClone(e.draft);d.records.push(...state.payments);
  if(state.payments.some(r=>r.kind!=='payment'))throw Error('Invalid recovery payments.');
  if(state.planChoice!=null){if(typeof state.planChoice!=='boolean')throw Error('Invalid recovery plan.');if(d.plan)d.plan.include=state.planChoice;}
  if(state.confirmedNextDueDate!=null&&d.plan)d.plan.nextDueDate=state.confirmedNextDueDate;
  if(state.confirmedTimeZone!=null&&d.plan)d.plan.timeZone=state.confirmedTimeZone;
  reviewDraft(d);const historical=structuredClone(d);if(historical.plan)historical.plan.include=false;validate(historical);
  return {state,draft:d};
}

// Only newly interpreted input gets these defaults. Recovery keeps the user's choices.
export function interpretedDraft(raw,timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone){
  const draft=reviewDraft(raw);
  if(draft.plan){draft.plan.include=true;draft.plan.timeZone??=timeZone;}
  return draft;
}
