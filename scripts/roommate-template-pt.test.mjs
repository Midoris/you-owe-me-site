import {normalizeReviewedItalianHomeSource} from '../tests/helpers/reviewed-language-copy.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { parseStaticPage } from '../tests/helpers/static-dom.mjs';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { siteLocales, localizedSourceRoute, sharedAssetVersions, completedCounterparts } from '../content/site-locales.mjs';
import { contentRegistry } from '../content/content-registry.mjs';
import { renderLocaleHtml, renderLocaleDiscovery } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
import { normalizeReviewedPortugueseRoommateIntegration, normalizeReviewedPortugueseRoommateSource } from '../tests/helpers/reviewed-language-copy.mjs';
const route='/pt/ferramentas/planilha-despesas-casa-compartilhada/';
const sourceRoute='/tools/roommate-expense-tracker-template/';
const base='6bc192936e10f0eca34448af04f10b297ea8352c';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const page=read(route.slice(1)+'index.html');
const controller=read('scripts/roommate-expense-tracker-template-pt.js');
const approved=JSON.parse(read('tests/fixtures/portuguese-roommate-copy.json'));
function runtime(options={}) {
 const env=pageRuntime(page,options);
 const decorate=node=>{node.remove=()=>node.parentNode?.removeChild(node);return node;};
 env.document.querySelectorAll('*').forEach(decorate);
 const create=env.document.createElement;env.document.createElement=tag=>decorate(create(tag));
 env.window.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>env.selections.at(-1)?.textContent.trim()||''});
 env.run(controller);return env;
}
function assertLocaleNav(html,current) {
 const d=parseStaticPage(html),main=d.querySelector('#main'),navs=main.querySelectorAll('.site-locale-section');
 assert.equal(navs.length,1,current+' must have one native nav, including no unmarked duplicate');
 assert.equal((html.match(/<!-- portuguese-section:start -->/g)||[]).length,1);
 assert.equal((html.match(/<!-- portuguese-section:end -->/g)||[]).length,1);
 const links=navs[0].querySelectorAll('a');assert.equal(links.length,8);
 assert.deepEqual(links.map(a=>a.getAttribute('href')),siteLocales.find(l=>l.code==='pt').pages.map(p=>p.pt));
 assert.deepEqual(links.filter(a=>a.getAttribute('aria-current')==='page').map(a=>a.getAttribute('href')),[current]);
 if(current===route){const disclosures=main.querySelectorAll('.site-portuguese-disclosure');assert.equal(disclosures.length,1);assert.equal(disclosures[0].hasAttribute('open'),false);assert.ok(disclosures[0].contains(navs[0]));}
}

test('Portuguese template preserves13active source sections,5exact accessible tables and9FAQ/schema pairs',()=>{
 const d=parseStaticPage(page),old=parseStaticPage(read(sourceRoute.slice(1)+'index.html'));
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.getAttribute('aria-labelledby')]);
 assert.equal(sections(d).length,13);assert.deepEqual(sections(d),sections(old));assert.equal(d.querySelectorAll('template').length,0);assert.doesNotMatch(page,/roommate-interactive-story-backup|data-money-story|friend-borrow-post-copy/);
 const tables=d.querySelectorAll('.roommate-template-table-scroll'),expected=[
  [approved.example.expenseCaption,approved.example.expenseHeaders,approved.example.expenseRows],
  [approved.example.summaryCaption,approved.example.summaryHeaders,approved.example.summaryRows],
  [approved.workbook.caption,approved.workbook.headers,approved.workbook.rows],
  [approved.situations.caption,approved.situations.headers,approved.situations.rows],
  [approved.comparison.caption,approved.comparison.headers,approved.comparison.rows],
 ];assert.equal(tables.length,5);tables.forEach((t,i)=>{const[c,h,rows]=expected[i];assert.equal(t.getAttribute('role'),'region');assert.equal(t.getAttribute('tabindex'),'0');assert.equal(t.getAttribute('aria-label'),c);assert.equal(t.querySelector('caption').textContent,c);assert.deepEqual(t.querySelectorAll('thead th').map(n=>n.textContent),h);assert.ok(t.querySelectorAll('thead th').every(n=>n.getAttribute('scope')==='col'));assert.deepEqual(t.querySelectorAll('tbody tr').map(n=>n.children.map(c=>c.textContent)),rows);assert.ok(t.querySelectorAll('tbody th').every(n=>n.getAttribute('scope')==='row'));});
 assert.deepEqual(tables[4].querySelectorAll('tbody tr').map(n=>n.children.map(c=>c.getAttribute('data-label'))),approved.comparison.rows.map(()=>approved.comparison.headers));
 assert.deepEqual(d.querySelectorAll('.roommate-template-faq-list details').map(n=>({q:n.querySelector('summary').textContent,a:n.querySelector('p').textContent})),approved.faq);
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.deepEqual(graph.map(n=>n['@type']),['WebPage','BreadcrumbList','FAQPage']);const web=graph[0];assert.equal(web.inLanguage,'pt-BR');assert.equal(web.name,approved.h1);assert.equal(web.datePublished,'2026-11-06');assert.equal(web.dateModified,'2026-11-06');assert.equal(web.url,'https://you-owe-me.com'+route);assert.equal(web.description,approved.description);assert.deepEqual(graph[2].mainEntity.map(n=>({q:n.name,a:n.acceptedAnswer.text})),approved.faq);assert.equal(graph[2].inLanguage,'pt-BR');assert.equal(d.querySelector('h1').textContent,approved.h1);assert.equal(d.querySelector('title').textContent,approved.title);assert.equal(d.querySelector('#roommate-summary-message').textContent,approved.review.text);
});

test('Portuguese download, calculator, comparison and best-next-step destinations retain exact source semantics',()=>{
 const d=parseStaticPage(page),cards=d.querySelectorAll('.best-next-step__card'),old=parseStaticPage(read(sourceRoute.slice(1)+'index.html')).querySelectorAll('.best-next-step__card');assert.equal(cards.length,4);
 cards.forEach((n,i)=>{assert.equal(n.getAttribute('href'),approved.nextSteps.cards[i].url);assert.equal(n.querySelector('.best-next-step__label').textContent,approved.nextSteps.cards[i].label);assert.equal(n.querySelector('strong').textContent,approved.nextSteps.cards[i].title);const spans=n.querySelectorAll('span');assert.equal(spans.at(-1).textContent,approved.nextSteps.cards[i].body);let attrs=Object.fromEntries([...n.attributes].filter(([k])=>k.startsWith('data-'))),expected=Object.fromEntries([...old[i].attributes].filter(([k])=>k.startsWith('data-')));expected['data-track-location']='pt_roommate_template_best_next_step_'+(i+1);expected['data-step-destination']=approved.nextSteps.cards[i].url;assert.deepEqual(attrs,expected);});
 const downloads=d.querySelectorAll('a').filter(n=>n.hasAttribute('download'));assert.equal(downloads.length,5);assert.ok(downloads.every(n=>n.getAttribute('href')==='/downloads/pt/'+n.getAttribute('download')));assert.ok(downloads.every(n=>/^planilha-despesas-casa-compartilhada\.(xlsx|csv)$/.test(n.getAttribute('download'))));assert.equal(d.querySelector('.roommate-template-file-meta').textContent,approved.downloads.excel.sizeLabel.replace('{actual rounded KB}',Math.round(fs.statSync(new URL('../downloads/pt/planilha-despesas-casa-compartilhada.xlsx',import.meta.url)).size/1024)));
 const method=d.querySelector('.roommate-template-method-table').querySelectorAll('tbody tr');assert.equal(method[0].querySelectorAll('a').length,0);assert.deepEqual(method.slice(1).map(n=>n.querySelector('a').getAttribute('href')),['/tools/roommate-bill-split-calculator/','/downloads/pt/planilha-despesas-casa-compartilhada.xlsx','/pt/solucoes/app-para-controlar-quem-te-deve/']);assert.equal(d.querySelector('.roommate-template-final .lt-textCta').getAttribute('href'),'/pt/ferramentas/calculadora-dividir-despesas/');
});

for(const scenario of ['api','fallback','manual','terminal','pending'])test(`Portuguese household summary copy through ${scenario} preserves exact payload, focus, feedback and privacy`,async()=>{
 const env=runtime({clipboardFails:!['api','pending'].includes(scenario),fallbackFails:['manual','terminal'].includes(scenario)});if(scenario==='terminal')env.document.createRange=()=>{throw Error('No selection')};const button=env.query('[data-copy-target]'),status=env.query('.roommate-template-copy-status');button.focus();let release;
 if(scenario==='pending')env.context.navigator.clipboard.writeText=text=>new Promise(resolve=>{release=()=>{env.copied.push(text);resolve()}});
 await env.click('[data-copy-target]');if(scenario==='pending'){assert.equal(button.getAttribute('aria-busy'),'true');assert.equal(button.textContent,approved.copyUI.busy);assert.equal(status.textContent,'');await env.click('[data-copy-target]');assert.equal(env.copied.length,0);release();for(let i=0;i<10;i++)await Promise.resolve();}
 assert.equal(button.hasAttribute('aria-busy'),false);assert.equal(env.document.activeElement,button);assert.equal(env.events.length,0);assert.equal(env.document.querySelectorAll('textarea').length,0);
 if(['api','fallback','pending'].includes(scenario)){assert.deepEqual(env.copied,[approved.review.text]);assert.equal(button.textContent,approved.copyUI.successButton);assert.equal(status.textContent,approved.copyUI.successStatus);}else{assert.equal(env.copied.length,0);assert.equal(button.textContent,approved.copyUI.button);assert.equal(status.textContent,scenario==='manual'?approved.copyUI.manual:approved.copyUI.failure);if(scenario==='manual')assert.equal(env.window.getSelection().toString(),approved.review.text);}
 env.timers.at(-1)();assert.equal(button.textContent,approved.copyUI.button);
});

test('Portuguese summary retries clear stale success and old callbacks cannot replace pending or newer feedback',async()=>{
 const env=runtime(),button=env.query('[data-copy-target]'),status=env.query('.roommate-template-copy-status');button.focus();await env.click('[data-copy-target]');const oldTimer=env.timers.at(-1);assert.equal(status.textContent,approved.copyUI.successStatus);
 let reject;env.context.navigator.clipboard.writeText=()=>new Promise((_,r)=>reject=r);env.document.execCommand=()=>false;env.document.createRange=()=>{throw Error('No selection')};await env.click('[data-copy-target]');assert.equal(button.textContent,approved.copyUI.busy);assert.equal(status.textContent,'');oldTimer();assert.equal(button.textContent,approved.copyUI.busy);await env.click('[data-copy-target]');reject(Error('Denied'));for(let i=0;i<15;i++)await Promise.resolve();assert.equal(status.textContent,approved.copyUI.failure);assert.equal(button.textContent,approved.copyUI.button);oldTimer();assert.equal(status.textContent,approved.copyUI.failure);assert.equal(env.events.length,0);
});

test('Portuguese summary progressively reveals only a valid scoped control and leaves selectable noJS copy',()=>{
 const env=pageRuntime(page);assert.equal(env.query('[data-copy-target]').hidden,true);assert.equal(env.query('[data-roommate-copy-hint]').textContent,approved.copyUI.noJS);assert.equal(env.query('#roommate-summary-message').textContent,approved.review.text);
 const foreign=pageRuntime(page.replace('site-lang-pt','site-lang-ja'));foreign.run(controller);assert.equal(foreign.query('[data-copy-target]').hidden,true);
 const invalid=pageRuntime(page);invalid.query('#roommate-summary-message').textContent='';invalid.run(controller);assert.equal(invalid.query('[data-copy-target]').hidden,true);
 const d=runtime().document;assert.equal(d.querySelector('[data-copy-target]').hidden,false);assert.equal(d.querySelector('[data-roommate-copy-hint]').hidden,true);assert.equal(d.querySelectorAll('.roommate-template-copy-status').length,1);assert.equal(d.querySelector('.roommate-template-copy-status').getAttribute('role'),'status');assert.equal(d.querySelector('[data-copy-target]').getAttribute('aria-label'),approved.copyUI.aria);assert.doesNotMatch(controller,/fetch\(|dispatchEvent|sendBeacon|localStorage|sessionStorage/);
});

test('Portuguese eighth route has exactly one marked navigation on all8pages and complete reciprocal discovery',()=>{
 const pt=siteLocales.find(l=>l.code==='pt');assert.equal(pt.pages.length,8);for(const p of pt.pages)assertLocaleNav(read(p.pt.slice(1)+'index.html'),p.pt);
 assert.throws(()=>assertLocaleNav(page.replace('<!-- portuguese-section:end -->','<!-- portuguese-section:end --><details class="site-portuguese-disclosure"><nav class="site-locale-section"></nav></details>'),route),/one native nav/);
 const counterparts=completedCounterparts(sourceRoute);assert.deepEqual(counterparts.map(n=>n.code),['en','es','de','ar','fr','ja','pt','it']);for(const p of counterparts){const html=read(p.route.slice(1)+'index.html');for(const target of[...counterparts,{code:'x-default',route:sourceRoute}])assert.ok(html.includes('hreflang="'+target.code+'" href="https://you-owe-me.com'+target.route+'"'));}
 assert.equal(localizedSourceRoute(route),sourceRoute);assert.equal(contentRegistry.length,152);const entry=contentRegistry.find(x=>x.url===route);assert.equal(entry.title,approved.registry.title);assert.equal(entry.translationOf,sourceRoute);assert.equal(entry.appStoreCpp,'general');for(const key of['primaryAudience','problemSolved','useWhen','primaryCta','nextStep'])assert.equal(entry[key],approved.registry[key]);assert.ok(read('llms.txt').includes('https://you-owe-me.com'+route));assert.ok(read('sitemap.xml').includes('<loc>https://you-owe-me.com'+route+'</loc>'));assert.equal(renderLocaleHtml(page,sourceRoute,'pt'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));assert.equal(sharedAssetVersions['/scripts/analytics.js'],'komoney20261106');
});

test('Portuguese template handoff admits one location and rejects payload or unknown metadata',()=>{
 const listeners=new Map(),logged=[];bindIphoneHandoffAnalytics({eventTarget:{addEventListener:(n,f)=>listeners.set(n,f)},trackEvent:(name,detail)=>logged.push({name,detail})});for(const[type,fn]of listeners){fn({type,detail:{cta_location:'pt_roommate_template_iphone_handoff',message:approved.review.text,amount:'R$1.980'}});fn({type,detail:{cta_location:'unapproved',message:approved.review.text}})}assert.equal(logged.length,3);assert.ok(logged.every(x=>JSON.stringify(x.detail)==='{"cta_location":"pt_roommate_template_iphone_handoff"}'));
});

test('Portuguese shared integration keeps every old authored HTML and protected runtime/asset byte intact after exact admissions',()=>{
 const files=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');const changed=execFileSync('git',['diff','--name-only',base,'--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(f=>f && files.includes(f));assert.ok(changed.length>100);for(const f of changed)assert.equal(normalizeReviewedPortugueseRoommateIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 for(const f of['scripts/analytics.js','scripts/iphone-handoff-analytics-bridge.mjs'])assert.equal(normalizeReviewedPortugueseRoommateSource(read(f),f),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 assert.equal(normalizeReviewedItalianHomeSource(read('scripts/app-language-support-scope.mjs'),'scripts/app-language-support-scope.mjs').replace('  "'+route+'",\n',''),execFileSync('git',['show',base+':scripts/app-language-support-scope.mjs'],{encoding:'utf8'}));
 const oldSync=execFileSync('git',['show',base+':scripts/sync-site-locales.mjs'],{encoding:'utf8'});const currentSelector=': lang === "pt" && ["/pt/blog/como-cobrar-um-amigo-com-educacao/", "/pt/blog/como-pedir-dinheiro-emprestado-a-um-amigo/", "'+route+'"].includes(route)';assert.equal(read('scripts/sync-site-locales.mjs').replace(currentSelector,currentSelector.replace(', "'+route+'"','')),oldSync);
 const entry={en:sourceRoute,pt:route,title:approved.registry.title,updated:'2026-11-06',complete:true,discoveryDescription:approved.registry.discoveryDescription,registry:Object.fromEntries(['primaryAudience','problemSolved','useWhen','primaryCta','nextStep'].map(k=>[k,approved.registry[k]]))};const config=normalizeReviewedItalianHomeSource(read('content/site-locales.mjs'),'content/site-locales.mjs').replace('\n, '+JSON.stringify(entry,null,2)+'\n];\nexport const portugueseShared','\n];\nexport const portugueseShared').replace('"/scripts/analytics.js": "ptroommate20261106"','"/scripts/analytics.js": "ptborrow20261106"');assert.equal(config,execFileSync('git',['show',base+':content/site-locales.mjs'],{encoding:'utf8'}));
 const protectedFiles=files.filter(f=>f.startsWith('private-continuation/')||f.startsWith('images/')||f.startsWith('downloads/')||f.startsWith('styles/')||f.startsWith('content/roommate-workbooks/')||(/^scripts\/.*\.(?:m?js)$/.test(f)&&!f.includes('.test.')&&!['scripts/analytics.js','scripts/iphone-handoff-analytics-bridge.mjs','scripts/app-language-support-scope.mjs','scripts/sync-site-locales.mjs'].includes(f)));
 const oldObjects=new Map(execFileSync('git',['ls-tree','-r','-z',base],{encoding:'utf8'}).split('\0').filter(Boolean).map(line=>[line.slice(line.indexOf('\t')+1),line.slice(0,line.indexOf('\t')).split(' ')[2]]));const currentObjects=execFileSync('git',['hash-object','--stdin-paths'],{input:protectedFiles.join('\n')+'\n',encoding:'utf8'}).trim().split('\n');protectedFiles.forEach((f,i)=>{const current=fs.readFileSync(new URL('../'+f,import.meta.url));const normalized=normalizeReviewedItalianHomeSource(current,f);if(normalized.equals(current))assert.equal(currentObjects[i],oldObjects.get(f),f);else assert.deepEqual(normalized,execFileSync('git',['show',base+':'+f]),f);});
 const extra='\n              <a data-unapproved="x" href="'+route+'">Planilha de despesas da casa</a>';assert.equal(normalizeReviewedPortugueseRoommateIntegration(extra),extra);
});

test('Portuguese native assembly binds the verified Google master and genuine1536×1024hero with no publication placeholders',()=>{
 assert.ok(fs.existsSync(new URL('../tests/fixtures/portuguese-roommate-native.json',import.meta.url)),'Native assembly pending: main must supply the verified Google copy URL and genuine hero before full acceptance');
 const native=JSON.parse(read('tests/fixtures/portuguese-roommate-native.json')),d=parseStaticPage(page);assert.equal(native.status,'verified');assert.match(native.copyUrl,/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+\/copy$/);const google=d.querySelectorAll('a').filter(n=>n.getAttribute('href')?.includes('docs.google.com/spreadsheets/'));assert.equal(google.length,3);assert.ok(google.every(n=>n.getAttribute('href')===native.copyUrl));assert.doesNotMatch(page,/loc25-native-master-pending|dev pending|actual rounded KB|DRAFT-NOT-FOR-RELEASE/);
 const image=d.querySelector('.roommate-template-hero-visual img');assert.equal(image.getAttribute('src'),'/images/pt/tools/planilha-despesas-casa-compartilhada/planilha-despesas-casa-compartilhada-hero.webp');assert.equal(image.getAttribute('alt'),approved.hero.imageAlt);assert.equal(image.getAttribute('width'),'1536');assert.equal(image.getAttribute('height'),'1024');const bytes=fs.readFileSync(new URL('..'+image.getAttribute('src'),import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),native.heroSha256);assert.equal(native.width,1536);assert.equal(native.height,1024);
});
