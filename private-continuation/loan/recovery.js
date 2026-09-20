'use strict';
// Reference stays in the fragment (not HTTP request URLs/referrers). POST only to our endpoint.
const reference = new URLSearchParams(location.hash.slice(1)).get('ref');
const status = document.getElementById('status'), button = document.getElementById('recover');
if(!/^[a-f0-9]{64}$/.test(reference||'')){button.disabled=true;status.textContent='This link is incomplete. Open the full link or your backup file.';}
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='Preparing your backup…';
 try{
  const response=await fetch('https://us-central1-you-owe-me-app.cloudfunctions.net/loanTransfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'fetch',reference}),credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(response.status===410)throw Error('This link expired. Open your backup file or the loan already on your device. You can also create a new link from your browser review.');
  if(!response.ok)throw Error('The draft could not be retrieved. Keep this link and try again shortly.');
  const envelope=await response.json();
  if(envelope.version!==1||envelope.draft?.type!=='loan-history')throw Error('This draft is not supported.');
  const file={version:1,envelope,payments:[],adoptionIntent:false,acceptedAt:Date.now()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(file)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='You-Owe-Me-loan.uomiloan';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Backup saved. Open this file in You Owe Me on your iPhone. Keep it private.';
 }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
