const {chromium}=require('/Users/ievgeniiiablonskyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const route=process.argv[2]||'/ar/';
const key=route==='/ar/'?'home':route.split('/').filter(Boolean).pop();
const out=path.resolve('docs/verification/arabic-localization-2026-10-20');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[];
try{for(const width of [390,1440]){const context=await browser.newContext({viewport:{width,height:1000},locale:'ar'});
await context.route('**/*',r=>{const u=new URL(r.request().url());return u.origin==='http://127.0.0.1:8790'&&!u.pathname.endsWith('/analytics.js')?r.continue():r.abort();});
const page=await context.newPage();await page.goto('http://127.0.0.1:8790'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.body.classList.remove('is-preload'));
for(const img of await page.locator('img').all()){if(await img.isVisible())await img.scrollIntoViewIfNeeded();}
await page.locator('h1').scrollIntoViewIfNeeded();
const data=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,direction:document.documentElement.dir,main:document.querySelector('#main').innerText,support:document.querySelector('[data-app-language-support-rendered]')?.innerText,examples:[...document.querySelectorAll('.site-locale-example')].map(e=>e.innerText),images:[...document.images].map(i=>({src:i.getAttribute('src'),alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),pageWidth:document.documentElement.scrollWidth,font:getComputedStyle(document.querySelector('h1')).fontFamily}));
await page.locator('.lt-hero,.lt-detailHero,.mow-hero,.plrt-hero,.lt-toolHero').first().screenshot({path:path.join(out,`language-${key}-hero-${width}.png`)});
if(await page.locator('.lt-coreFeatureGrid').count())await page.locator('.lt-coreFeatureGrid').screenshot({path:path.join(out,`language-${key}-features-${width}.png`)});
if(await page.locator('.plrt-record-once__connected').count()){await page.locator('.plrt-record-once__connected').screenshot({path:path.join(out,`language-${key}-record-${width}.png`)});await page.locator('.plrt-relationship-map').screenshot({path:path.join(out,`language-${key}-diagram-${width}.png`)});}
await page.screenshot({path:path.join(out,`language-${key}-${width}.png`),fullPage:true});
if(width===390){await page.locator('#navPanelToggle').click();await page.locator('body.is-navPanel-visible').waitFor();await page.waitForTimeout(700);data.mobileMenu=await page.locator('#navPanel').innerText();data.menuClose=await page.locator('#navPanel .close').getAttribute('aria-label');await page.screenshot({path:path.join(out,`language-${key}-menu-${width}.png`)});}
results.push({width,...data});await context.close();}
fs.writeFileSync(path.join(out,`language-${key}-browser.json`),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results.map(({width,title,lang,direction,support,examples,images,pageWidth,font,mobileMenu,menuClose})=>({width,title,lang,direction,support,examples,images,pageWidth,font,mobileMenu,menuClose})),null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
