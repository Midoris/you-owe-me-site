const {chromium}=require('/Users/ievgeniiiablonskyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const lang=process.argv[2]||'de';const route=lang==='de'?'/de/blog/wer-schuldet-mir-geld/':lang==='es'?'/es/blog/como-llevar-el-control-de-quien-te-debe-dinero/':'/blog/how-to-keep-track-of-who-owes-you-money/';const copiedLabel={de:'Kopiert',es:'Copiado',en:'Copied'}[lang];const failureLabel={de:'Kopieren nicht möglich',es:'No se pudo copiar',en:'Copy did not work'}[lang];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const cases=[];try{
for(const mode of ['clipboard','fallback','failure']){
 const context=await browser.newContext({viewport:{width:390,height:844}});await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:8790'&&!r.request().url().includes('/analytics.js')?r.continue():r.abort());
 const page=await context.newPage();await page.addInitScript(({mode})=>{window.__qaCopies=[];window.__qaEvents=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(mode!=='clipboard')throw new Error('denied for QA');window.__qaCopies.push(text);}}});document.execCommand=command=>{if(command!=='copy'||mode==='failure')return false;window.__qaCopies.push(document.querySelector('textarea').value);return true;};window.addEventListener('youoweme:tool-template-copy',e=>window.__qaEvents.push(e.detail));},{mode});
 await page.goto('http://127.0.0.1:8790'+route,{waitUntil:'networkidle'});
 const buttons=page.locator('[data-copy-template]');assert.equal(await buttons.count(),3);
 for(let i=0;i<3;i++){
  const button=buttons.nth(i);const id=await button.getAttribute('data-copy-template');const original=await button.textContent();const message=page.locator(`[data-template-id="${id}"] .template-card__message`);const text=lang==='en'?await message.textContent():await message.getAttribute('data-template');await button.click();
  if(mode==='failure'){await page.waitForFunction(label=>document.querySelector('[data-copy-status]').textContent.includes(label),failureLabel);assert.equal(await button.textContent(),original);}
  else{await page.waitForFunction(({id,label})=>document.querySelector(`[data-copy-template="${id}"]`).textContent===label,{id,label:copiedLabel});const copied=await page.evaluate(()=>window.__qaCopies.at(-1));assert.equal(copied,text.trim());if(lang!=='en')assert.ok(!copied.includes('Who owes'));if(i===0)assert.ok(copied.split('\n').length>=9);await page.waitForFunction(({id,original})=>document.querySelector(`[data-copy-template="${id}"]`).textContent===original,{id,original});}
 }
 const events=await page.evaluate(()=>window.__qaEvents);assert.equal(events.length,mode==='failure'?0:3);for(const event of events){assert.deepEqual(Object.keys(event).sort(),['category','page','template_id','tone']);assert.equal(event.page,'money_owed_record');assert.equal(event.tone,'clear');}
 assert.equal(await page.locator('textarea').count(),0);cases.push({mode,threeButtons:true,payloadMatchesLocalizedTemplate:mode!=='failure',lineBreaksPreserved:mode!=='failure',events:events.length,temporaryTextareaRemoved:true});await context.close();
}
fs.writeFileSync('docs/verification/german-localization-2026-10-20/guide-copy-'+lang+'-checks.json',JSON.stringify({allPassed:true,cases},null,2)+'\n');console.log(JSON.stringify({allPassed:true,cases},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
