import {loanAllowanceMessage} from './loan-import-errors.mjs';
import {loanImportInputStage} from './loan-import-analytics.mjs';
import {prepareLoanPhoto,photoQualityCopy} from './loan-import-image.mjs';
import {enabled,localPreview,apiBase,continuationBase} from './loan-import-config.mjs';
import {currencies,limits,manualDraft,newRow,balance,money,validate,reference,envelope,reviewDraft,recoveryState,interpretedDraft} from './loan-import-model.mjs';
export function startLoanImport(root){
  if(!enabled || root.dataset.initialized) return;
  root.dataset.initialized='true';
  root.hidden=false;
  const $=id=>root.querySelector('#'+id), key='uomi.loan-import.review.v1';
  let draft=null,source=null,file=null,controller=null,prepared=null,revision=0,storageWarning=false,photo=null,inputMode=null;
  $('loan-import-photo-quality').textContent=photoQualityCopy;
  const status=message=>{$('loan-import-status').textContent=message;};
  const event=name=>{if(!localPreview)window.dispatchEvent(new CustomEvent('youoweme:loan-import-event',{detail:{name}}));};
  root.insertBefore($('loan-import-image'),$('loan-import-review'));
  function focusPanel(panel){panel.tabIndex=-1;panel.focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
  function persist(){try{sessionStorage.setItem(key,JSON.stringify({draft,source,file:file?.format==='image'?{format:'image'}:file,photo,text:$('loan-import-text').value,prepared,revision}));}catch{storageWarning=true;status('This browser could not save recovery state. Keep this tab open and download your loan draft.');}}
  try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved){draft=saved.draft?reviewDraft(saved.draft):null;source=saved.source;file=saved.file;photo=typeof saved.photo==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(saved.photo)?saved.photo:null;if(file?.format==='image')file=photo?{format:'image',base64:photo.split(',')[1]}:null;prepared=saved.prepared;revision=saved.revision||0;$('loan-import-text').value=saved.text||'';showPhoto();if(draft)render();if(prepared)showTransfer();}}catch{status('Saved review could not be read. Paste or choose your recovery file.');}
  function showSource(mode){
    inputMode=mode;
    $('loan-import-text-panel').hidden=mode!=='text';
    $('loan-import-text-label').textContent='Paste notes or a table';
    $('loan-import-photo-options').hidden=mode!=='photo';
    $('loan-import-source-text').setAttribute('aria-expanded',String(mode==='text'));
    $('loan-import-source-photo').setAttribute('aria-expanded',String(mode==='photo'));
    for(const name of ['text','document','photo'])$('loan-import-source-'+name).dataset.selected=String(mode===name);
    const selectedPhoto=mode==='photo'&&file?.format==='image';
    $('loan-import-photo-notes').hidden=!selectedPhoto;
    $('loan-import-photo-notes').textContent=$('loan-import-text').value.trim()?'Review additional notes':'Add details (optional)';
    $('loan-import-selected-document').hidden=!(mode==='document'&&file);
    $('loan-import-selected-document').textContent=file?.name||'Document ready';
    $('loan-import-processing-actions').hidden=!(mode==='text'||selectedPhoto||(mode==='document'&&file));
    showPhoto();
  }
  $('loan-import-source-text').addEventListener('click',()=>{
    if(controller||draft)return;file=null;photo=null;$('loan-import-file').value='';showSource('text');persist();$('loan-import-text').focus();
  });
  $('loan-import-source-document').addEventListener('click',()=>{if(!controller&&!draft)$('loan-import-file').click();});
  $('loan-import-source-photo').addEventListener('click',()=>{if(!controller&&!draft){showSource('photo');focusPanel($('loan-import-photo-options'));}});
  $('loan-import-photo-library').addEventListener('click',()=>$('loan-import-photo').click());
  $('loan-import-photo-take').addEventListener('click',()=>$('loan-import-camera').click());
  $('loan-import-photo-notes').addEventListener('click',()=>{
    $('loan-import-text-panel').hidden=false;$('loan-import-text-label').textContent='Additional details (optional)';$('loan-import-text').focus();
  });
  if(file&&!draft)showSource(file.format==='image'?'photo':'document');
  function loading(active, transfer=false){
    const panel=$('loan-import-loading');panel.hidden=!active;
    root.setAttribute('aria-busy',String(active));
    $('loan-import-loading-title').textContent=transfer?'Preparing your iPhone link…':'Preparing your loan…';
    $('loan-import-loading-note').hidden=transfer;
    $('loan-import-cancel').hidden=transfer;
    if(active){$('loan-import-intake').hidden=true;$('loan-import-review').hidden=true;$('loan-import-image').hidden=true;focusPanel(panel);}
    else {$('loan-import-intake').hidden=!!draft;if(draft&&!prepared)$('loan-import-review').hidden=false;showPhoto();if(prepared)$('loan-import-image').hidden=true;}
  }
  function lockInput(busy){
    for(const id of ['loan-import-text','loan-import-file','loan-import-photo','loan-import-camera','loan-import-manual','loan-import-interpret','loan-import-photo-remove','loan-import-source-text','loan-import-source-document','loan-import-source-photo','loan-import-photo-library','loan-import-photo-take','loan-import-photo-notes'])$(id).disabled=busy||!!draft;
  }
  function showPhoto(){
    $('loan-import-image').hidden=!photo||(!draft&&inputMode!=='photo');
    if(photo)$('loan-import-image-preview').src=photo;else $('loan-import-image-preview').removeAttribute('src');
    $('loan-import-photo-remove').hidden=!!draft;
  }
  async function choosePhoto(selected){
    lockInput(true);
    try{const image=await prepareLoanPhoto(selected);photo=image.dataURL;file={format:'image',base64:image.base64};showSource('photo');persist();status('Photo ready. Add any missing details in the notes, then review.');}
    catch(error){status(error.message);}finally{lockInput(false);}
  }
  for(const id of ['loan-import-photo','loan-import-camera'])$(id).addEventListener('change',async e=>{if(controller||draft)return;const selected=e.target.files[0];if(selected)await choosePhoto(selected);e.target.value='';});
  $('loan-import-photo-zoom').addEventListener('click',()=>{const image=$('loan-import-image-preview');image.classList.toggle('enlarged');$('loan-import-photo-zoom').textContent=image.classList.contains('enlarged')?'Fit photo to screen':'Enlarge photo';});
  $('loan-import-photo-remove').addEventListener('click',()=>{if(controller||draft)return;photo=null;file=null;showSource('photo');persist();status('Photo removed.');});
  function change(){revision++;prepared=null;$('loan-import-transfer').hidden=true;persist();updateBalance();}
  function node(tag,text,attributes={}){const e=document.createElement(tag);if(text!==null)e.textContent=text;for(const [key,value] of Object.entries(attributes))e.setAttribute(key,value);return e;}
  function button(label,action){const b=node('button',label,{type:'button'});b.addEventListener('click',action);return b;}
  function field(parent,label,value,set,{type='text',choices=null,maxlength=null}={}){
    const wrapper=node('div',null), id='loan-field-'+crypto.randomUUID();wrapper.append(node('label',label,{for:id}));
    const input=node(choices?'select':type==='textarea'?'textarea':'input',null,{id});
    if(choices){input.append(node('option','Choose…',{value:''}));for(const [v,label] of choices)input.append(node('option',label,{value:v}));}
    else if(type!=='textarea')input.type=type;
    if(maxlength)input.maxLength=maxlength;input.value=value??'';
    input.addEventListener('input',()=>{set(input.value||null);change();});wrapper.append(input);parent.append(wrapper);return input;
  }
  function download(value,extension='uomiloan'){
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='You-Owe-Me-loan.'+extension;a.referrerPolicy='no-referrer';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function recovery(){try{validate(draft);if(prepared?.state){download(prepared.state);return;}const env=prepared?.envelope??await envelope(draft);download({version:1,envelope:env,payments:[],adoptionIntent:false,acceptedAt:Date.now()});}catch{download({version:1,type:'loan-review-recovery',draft,source},'json');status('Review saved with its unresolved questions. Reopen it here to finish before importing.');}}
  async function post(endpoint,body,signal){
    const r=await fetch(apiBase+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    let data;try{data=await r.json();}catch{throw Error('Could not finish. Your review is kept. Try again shortly.');}if(!r.ok)throw Error((data.error==='daily_limit'?loanAllowanceMessage(r.headers.get('Retry-After')):null)||errors[data.error]||'The service could not finish. Your input and corrections are still here.');return data;
  }
  $('loan-import-text').addEventListener('input',()=>{if(file?.format!=='image'){file=null;$('loan-import-file').value='';}persist();});
  $('loan-import-file').addEventListener('change',async e=>{
    if(controller||draft)return;const selected=e.target.files[0];if(!selected)return;
    if(/\.(jpe?g|png|webp|heic|heif)$/i.test(selected.name)){await choosePhoto(selected);return;}
    if(selected.size>limits.fileBytes){status('Choose a file up to 2 MB. Nothing was uploaded.');return;}
    const ext=selected.name.split('.').pop().toLowerCase();
    if(['json','uomiloan'].includes(ext)){
      try{
        const raw=JSON.parse(await selected.text());
        let candidate,nextSource=null,nextPrepared=null;
        if(raw.type==='loan-review-recovery'){candidate=reviewDraft(raw.draft);nextSource=raw.source;}
        else if(raw.envelope){const recovery=recoveryState(raw);candidate=recovery.draft;nextPrepared={envelope:raw.envelope,state:recovery.state,reference:null};}
        else if(raw.type==='loan-history'){candidate=reviewDraft(raw);}else throw Error('Choose a You Owe Me loan recovery file.');
        draft=candidate;source=nextSource;file=null;photo=null;showPhoto();change();prepared=nextPrepared;persist();render();event(loanImportInputStage('recovery'));
        status('Recovery opened with its original import identity. Open the recovery file on your iPhone. Editing its financial details starts a separate import.');
      }catch(error){status(error.message);}return;
    }
    if(!['csv','xlsx','docx'].includes(ext)){status('Choose CSV, XLSX, DOCX or a saved loan draft.');return;}
    photo=null;showPhoto();file={format:ext,name:selected.name,base64:btoa(Array.from(new Uint8Array(await selected.arrayBuffer()),b=>String.fromCharCode(b)).join(''))};
    showSource('document');persist();status('Document ready. Choose Convert to a loan.');
  });
  $('loan-import-manual').addEventListener('click',()=>{event(loanImportInputStage('manual'));draft=manualDraft();source=null;photo=null;file=null;showPhoto();change();render();status('Enter actual history. Manual entry does not use AI.');});
  $('loan-import-cancel').addEventListener('click',()=>{controller?.abort();status('Stopped waiting. The server may finish processing; no loan has been imported. Your input is still here.');});
  $('loan-import-interpret').addEventListener('click',async()=>{
    if(controller)return;
    if(draft){status('Your current review is preserved. Download it or finish it before starting a new interpretation.');return;}
    const body=file?{format:file.format,base64:file.base64,...(file.format==='image'?{text:$('loan-import-text').value}:{})}:{format:'paste',text:$('loan-import-text').value};if(body.format==='paste'&&!body.text.trim()){status('Paste loan notes or choose a file first.');return;}
    controller=new AbortController();lockInput(true);loading(true);status('Preparing your loan…');event('interpret_requested');event(loanImportInputStage(body.format));
    try{const result=await post('loanInterpret',body,controller.signal);draft=interpretedDraft(result.draft);source=result.source;file=null;change();render();status('Check each amount and date. You can edit anything below.');focusPanel($('loan-import-review'));event('interpret_ready');}
    catch(error){if(error.name!=='AbortError'){status(error.message);event('interpret_failed');}}
    finally{controller=null;loading(false);lockInput(false);if(!draft)focusPanel($('loan-import-intake'));}
  });
  function updateBalance(){const output=$('loan-review-balance');if(!output||!draft)return;try{output.textContent='Remaining: '+money(balance(draft),draft.currency);}catch(e){output.textContent=e.message;}}
  function render(){
    const panel=$('loan-import-review');panel.hidden=false;panel.replaceChildren();$('loan-import-intake').hidden=true;
    panel.append(node('h3','2. Check your loan'));showPhoto();lockInput(false);
    if(photo)panel.append(node('p','Compare each amount and date with your photo. AI can make mistakes.'));
    if(draft.unresolved?.length){const questions=node('div',null,{class:'loan-import-questions'});questions.append(node('h4','Resolve these questions first'));
      draft.unresolved.forEach((question,index)=>{const row=node('div',null);row.append(node('p',question),button('I’ve corrected this',()=>{draft.unresolved.splice(index,1);change();render();}));questions.append(row);});panel.append(questions);}
    const grid=node('div',null,{class:'loan-import-grid'});panel.append(grid);
    field(grid,'Person',draft.person,v=>draft.person=v,{maxlength:100});field(grid,'Loan name',draft.title,v=>draft.title=v,{maxlength:120});
    field(grid,'Who lent the money?',draft.direction,v=>draft.direction=v,{choices:[['lent','I lent to this person'],['borrowed','I borrowed from this person']]});
    field(grid,'Currency',draft.currency,v=>draft.currency=v,{choices:currencies.map(c=>[c,c])});
    field(grid,'Where does this history begin?',draft.openingContext,v=>draft.openingContext=v,{choices:[['full-history','Original loan, with all known payments'],['opening-balance','Known balance on a stated date']]});
    const openingHelp=node('details',null);openingHelp.append(node('summary','What is an opening balance?'),node('p','The amount owed on a known date. Earlier payments are already included; add only payments made after that date.'));panel.append(openingHelp);
    const history=node('div',null);
    draft.records.forEach((row,index)=>{
      const card=node('section',null,{class:'loan-import-row'});card.append(node('h4',index===0?'Opening loan or balance':`Record ${index+1}`));const fields=node('div',null,{class:'loan-import-grid'});card.append(fields);
      if(index)field(fields,'Activity',row.kind,v=>row.kind=v,{choices:[['payment','Repayment'],['advance','Additional amount lent / borrowed']]});
      field(fields,'Date',row.date,v=>row.date=v,{type:'date'});field(fields,'Amount',row.amount,v=>row.amount=v,{maxlength:20}).inputMode='decimal';
      field(card,'Note',row.note,v=>row.note=v??'',{type:'textarea',maxlength:1000});
      if(row.sourceRefs?.length&&source){const details=node('details',null);details.append(node('summary','Inspect source'));row.sourceRefs.forEach(ref=>details.append(node('pre',source.lines.find(l=>l.id===ref)?.text??'Source reference unavailable')));card.append(details);}
      if(index)card.append(button('Remove this record',()=>{draft.records.splice(index,1);change();render();}));history.append(card);
    });
    panel.append(history,button('Add actual payment or advance',()=>{if(draft.records.length>=100){status('Maximum 100 financial records. Keep the full source for recovery.');return;}draft.records.push(newRow());change();render();}));
    panel.append(node('p','',{id:'loan-review-balance',class:'loan-import-balance','aria-live':'polite'}));
    if(draft.exclusions?.length){const list=node('section',null,{class:'loan-import-questions'});list.append(node('h4','Not counted as payments'));draft.exclusions.forEach(e=>list.append(node('p',e.reason)));panel.append(list);}
    if(draft.plan){const p=draft.plan,section=node('section',null,{class:'loan-import-row'});section.append(node('h4','Repayment schedule found'),node('p','Optional. Add future payments from the remaining balance. Past payments stay unchanged; reminders start off.'));
      const label=node('label',null),check=node('input',null,{type:'checkbox'});check.checked=p.include;const planFields=node('div',null);planFields.hidden=!p.include;check.addEventListener('change',()=>{p.include=check.checked;planFields.hidden=!p.include;change();});label.append(check,document.createTextNode('Include a future schedule'));section.append(label);
      field(planFields,'Interest-free agreement',p.interestFree===null?'':String(p.interestFree),v=>p.interestFree=v==='true'?true:v==='false'?false:null,{choices:[['true','Explicitly interest-free'],['false','Interest or other charges apply — history only']]});
      field(planFields,'Regular payment',p.payment,v=>p.payment=v,{maxlength:20}).inputMode='decimal';field(planFields,'Frequency',p.frequency,v=>p.frequency=v,{choices:[['weekly','Weekly'],['biweekly','Every two weeks'],['monthly','Monthly']]});
      field(planFields,'Confirmed next due date',p.nextDueDate,v=>p.nextDueDate=v,{type:'date'});const zoneDetails=node('details',null);zoneDetails.append(node('summary','Timezone'));field(zoneDetails,'Schedule timezone',p.timeZone,v=>p.timeZone=v,{maxlength:80});
      zoneDetails.append(button('Use this device’s timezone',()=>{p.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;change();render();}));planFields.append(zoneDetails);section.append(planFields);panel.append(section);
    }
    const capacity=node('details',null);capacity.append(node('summary','Will this fit in the free app?'),node('p','Free includes 3 people, 30 entries and 2 active loans, including existing records. Each loan, repayment or advance uses an entry. Plans have a separate allowance. The app checks capacity before saving; larger histories may need an upgrade.'));panel.append(capacity);
    const actions=node('div',null,{class:'loan-import-actions'});const proceed=button('Continue on iPhone',prepare);proceed.className='lt-primaryCta';actions.append(proceed,button('Save a backup file',recovery));const restart=node('details',null);restart.append(node('summary','Start another import'),node('p','Save a backup first if you want to keep this review.'),button('Discard draft and start again',()=>{if(controller)return;revision++;draft=null;source=null;file=null;photo=null;prepared=null;showSource(null);lockInput(false);persist();panel.hidden=true;$('loan-import-transfer').hidden=true;$('loan-import-intake').hidden=false;status('Ready for another loan.');focusPanel($('loan-import-intake'));}));panel.append(actions,restart);updateBalance();
  }
  async function prepare(){
    if(controller)return;
    try{validate(draft);}catch(error){status(error.message);$('loan-import-status').scrollIntoView({block:'nearest'});return;}
    if(prepared){showTransfer();focusPanel($('loan-import-transfer'));return;}
    const currentRevision=revision,ref=reference();controller=new AbortController();$('loan-import-review').inert=true;loading(true,true);status('Preparing your iPhone link…');
    try{const result=await post('loanTransfer',{action:'create',reference:ref,origin:'web',draft},controller.signal);if(currentRevision!==revision){status('Your review changed while preparing. Continue again to transfer the corrected history.');return;}prepared={reference:ref,envelope:result};persist();showTransfer();focusPanel($('loan-import-transfer'));event('transfer_prepared');status('Your loan is ready to open on iPhone.');}
    catch(error){status(error.message);}finally{controller=null;loading(false);$('loan-import-review').inert=false;if(!prepared)focusPanel($('loan-import-review'));}
  }
  function showTransfer(){
    const panel=$('loan-import-transfer');panel.hidden=false;panel.replaceChildren();$('loan-import-review').hidden=true;$('loan-import-intake').hidden=true;$('loan-import-image').hidden=true;
    if(!prepared.reference){panel.append(node('h3','Open your recovery file on iPhone'),node('p','This file preserves the original loan identity and any App Clip payments. Download it and open it in You Owe Me to avoid importing the same loan twice.'),button('Save a backup file',recovery),button('Edit this loan',()=>{panel.hidden=true;render();focusPanel($('loan-import-review'));}));return;}
    const url=continuationBase+'#ref='+prepared.reference;
    panel.append(node('h3','3. Open on your iPhone'),node('p','Your reviewed loan is ready. Keep this link private: anyone with it can open your loan for 24 hours.'));
    const onPhone=/iPhone|iPod/.test(navigator.userAgent);
    if(!onPhone){panel.append(node('p','Scan with your iPhone camera, then tap Open in the Apple banner. In the App Clip, choose Continue in full app to keep your loan.'));if(typeof window.qrcode==='function'){const qr=window.qrcode(0,'M');qr.addData(url);qr.make();const holder=node('div',null);holder.innerHTML=qr.createSvgTag({cellSize:5,margin:4,scalable:true});holder.querySelector('svg')?.setAttribute('aria-label','Private continuation QR for this reviewed loan');panel.append(holder);}else panel.append(node('p','QR could not load. Use the private link or recovery draft.'));}
    const transferActions=node('div',null,{class:'loan-import-actions'});
    transferActions.append(button(onPhone?'Open this loan on iPhone':'Copy private iPhone link',async()=>{if(onPhone)location.assign(url);else{try{await navigator.clipboard.writeText(url);status('Private loan link copied. Share it only with your own iPhone.');}catch{status('Clipboard unavailable. Download the recovery draft and open it on your iPhone.');}}}),button('Save a backup file',recovery));
    transferActions.firstElementChild.className='lt-primaryCta';panel.append(transferActions);
    if(onPhone)panel.append(node('p','Tap Open in the Apple banner. In the App Clip, choose Continue in full app to keep your loan.'));
    transferActions.append(button('Edit this loan',()=>{panel.hidden=true;render();focusPanel($('loan-import-review'));}));
    const help=node('details',null);help.append(node('summary','Trouble opening your loan?'),node('p','Open the link in Safari. If the installed app misses your loan, update it and reopen this link within 24 hours. Save a backup before closing this tab; you can open that file after the link expires. Visiting the App Store alone does not transfer the loan.'));panel.append(help);
    if(storageWarning)panel.append(node('p','Browser recovery storage is unavailable: download your draft now.'));
  }
}
const errors={invalid_image:'The image could not be read. Choose a clear JPEG or PNG photo of one complete loan.',limit:'This source is too large. Use one complete loan, at most 100 financial records, a 2 MB file and 48 KB of extracted text. Nothing was truncated.',busy:'AI import is busy. Your input is kept. Try again later, or enter the history manually.',unavailable:'Loan import is not available yet or the service is temporarily unavailable. Keep your draft and try again later.',formula_review_required:'This spreadsheet contains formulas with cached values. Review the values in your spreadsheet, then paste or export the values as CSV. Formulas were not executed.',formula_without_value:'A formula has no cached result. Calculate it in your spreadsheet, review it, then paste or export values.',external_content:'The document contains external links or linked content. Paste the complete reviewed text or export values as CSV; no links were opened.',unsupported_document:'This document contains unsupported content, such as drawings, embedded files or tracked changes. Paste its complete reviewed text instead.',encoding:'Use UTF-8 CSV, or paste the text directly.',coverage:'The interpretation did not account for the complete source. Nothing was imported. Try clearer notes or manual entry.',incomplete:'The interpretation did not finish completely. Nothing was imported. Keep your source and try again or use manual entry.',refused:'The service could not interpret this source. Use manual entry or a supported loan record.',plan:'Confirm a supported future interest-free plan or continue with history only.',expired:'This private link expired. Prepare another link from your saved review.',conflict:'This link already belongs to another reviewed revision. Prepare a new private link.'};
