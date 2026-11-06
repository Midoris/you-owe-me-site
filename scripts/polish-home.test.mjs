import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import {siteLocales,polishPages,polishShared,completedCounterparts,localizedSourceRoute} from '../content/site-locales.mjs';
import {contentRegistry} from '../content/content-registry.mjs';
import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';
import {normalizeReviewedPolishHomeIntegration,normalizeReviewedPolishHomeSource} from '../tests/helpers/reviewed-language-copy.mjs';
const base='e6463edf3c4cc781c09d8168c09a4894b051edda';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const page=read('pl/index.html'),d=parseStaticPage(page);

test('Polish discovery admits reviewed routes and keeps English-content fallback until real counterparts exist',()=>{
 assert.deepEqual(polishPages.map(p=>p.pl),['/pl/','/pl/zastosowania/aplikacja-kto-ile-jest-winien/','/pl/narzedzia/kalkulator-podzialu-wydatkow/','/pl/blog/jak-poprosic-o-zwrot-pieniedzy/']);assert.equal(localizedSourceRoute('/pl/'),'/');assert.equal(localizedSourceRoute('/pl/solutions/app-to-track-money-owed/'),null);
 assert.deepEqual(completedCounterparts('/').map(p=>p.code),['en','es','de','ar','fr','ja','pt','it','pl','ko']);assert.equal(completedCounterparts('/solutions/app-to-track-money-owed/').some(p=>p.code==='pl'),true);
 const nav=d.querySelectorAll('.site-locale-section');assert.equal(nav.length,1);assert.deepEqual(nav[0].querySelectorAll('a').map(n=>n.getAttribute('href')),['/pl/','/pl/zastosowania/aplikacja-kto-ile-jest-winien/','/pl/narzedzia/kalkulator-podzialu-wydatkow/','/pl/blog/jak-poprosic-o-zwrot-pieniedzy/']);assert.equal(nav[0].querySelector('a').getAttribute('aria-current'),'page');assert.equal((page.match(/<!-- polish-section:start -->/g)||[]).length,1);
 assert.equal(renderLocaleHtml(page,'/','pl'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 const fixture='<html lang="pl"><head><link rel="canonical" href="https://you-owe-me.com/pl/" /></head><body><article><a href="/">Strona główna (po angielsku)</a><a href="/solutions/app-to-track-money-owed/">Zastosowania (po angielsku)</a></article><div id="copyright"><ul></ul></div></body></html>';
 const rendered=renderLocaleHtml(fixture,'/','pl');assert.ok(rendered.includes('href="/pl/">Strona główna</a>'));assert.ok(rendered.includes('href="/pl/zastosowania/aplikacja-kto-ile-jest-winien/">Zastosowania</a>'));
 const registry=contentRegistry.find(p=>p.url==='/pl/');assert.equal(contentRegistry.length,152);for(const key of ['primaryAudience','problemSolved','useWhen','primaryCta','nextStep'])assert.equal(registry[key],polishPages[0].registry[key]);assert.equal(registry.primaryAudience,polishShared.primaryAudience);
});

test('Polish active homepage retains established components and honest English links without a dormant story or new FAQ schema',()=>{
 const original=parseStaticPage(execFileSync('git',['show',base+':it/index.html'],{encoding:'utf8'}));
 const direct=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.getAttribute('aria-labelledby'));
 assert.equal(d.querySelectorAll('section').length,16);assert.equal(direct(d).length,12);assert.deepEqual(direct(d),direct(original));assert.equal(d.querySelectorAll('.lt-proofGrid article').length,3);assert.equal(d.querySelectorAll('.lt-reviewRail article').length,18);assert.equal(d.querySelectorAll('.lt-faqList article').length,10);
 for(const a of d.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/pl/'))assert.ok(a.textContent.includes('(po angielsku)'),href);}
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.equal(graph[0].inLanguage,'pl');assert.equal(graph[1].inLanguage.length,10);assert.equal(graph[1].featureList.length,22);assert.equal(graph[2].inLanguage,'en');assert.equal(graph.some(n=>n['@type']==='FAQPage'),false);
 assert.doesNotMatch(page,/homepage-interactive-story-backup|loan-import-entry\.mjs|loc\d+-.*pending/);
});

test('homepage mixed prose and resource cards retain the source component structure',()=>{
 for(const code of ['pl','it','pt']){const doc=parseStaticPage(read(code+'/index.html'));const bullet=doc.querySelector('.lt-includedSection .lt-checkGrid').querySelectorAll('li')[2];assert.equal(bullet.children.length,1);assert.equal(bullet.children[0].tagName,'span');assert.equal(bullet.querySelectorAll('a').length,2);}
 for(const code of ['pl','it']){const doc=parseStaticPage(read(code+'/index.html'));const links=doc.querySelectorAll('.lt-resourceShelfLink');assert.equal(links.length,6);for(const link of links)assert.deepEqual(link.children.filter(n=>n.tagName!=='#text').map(n=>n.tagName),['strong','span']);}
 const ar=parseStaticPage(read('ar/index.html')).querySelector('[data-cta-location="homepage-definition"]');assert.equal(ar.children.length,1);assert.equal(ar.children[0].tagName,'span');assert.equal(ar.querySelector('bdi').getAttribute('dir'),'ltr');
 const nudge=d.querySelector('.lt-findNudge');assert.deepEqual(nudge.children.filter(n=>n.tagName!=='#text').map(n=>n.tagName),['strong','span']);assert.equal(nudge.querySelector('strong').textContent,'Nie wiesz, od czego zacząć?');
});

test('preexisting authored HTML and shared runtime preserve immutable bytes outside exact Polish admissions',()=>{
 const tracked=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');let changed=0;
 for(const f of tracked.filter(f=>f.endsWith('.html'))){const old=execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),current=read(f);if(current!==old)changed++;assert.equal(normalizeReviewedPolishHomeIntegration(current),old,f);}assert.ok(changed>100);
 const admissions=JSON.parse(read('tests/fixtures/polish-home-reviewed-admissions.json'));for(const f of Object.keys(admissions.source))assert.deepEqual(normalizeReviewedPolishHomeSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f),execFileSync('git',['show',base+':'+f]),f);
 const binary=Buffer.from([255,254,0,128]);assert.equal(normalizeReviewedPolishHomeSource(binary,'downloads/protected.xlsx'),binary);
 const extra='<a href="/pl/" lang="pl" data-unapproved="x" hreflang="pl">Polski</a>';assert.equal(normalizeReviewedPolishHomeIntegration(extra),extra);const prose='The full website is available in English, with arbitrary unapproved content.';assert.equal(normalizeReviewedPolishHomeIntegration(prose),prose);
 const protectedFiles=tracked.filter(f=>f.startsWith('private-continuation/')||f.startsWith('images/')||f.startsWith('downloads/')||f.startsWith('styles/')||f.startsWith('content/roommate-workbooks/')||(/^scripts\/.*\.(?:m?js)$/.test(f)&&!f.includes('.test.')&&!Object.keys(admissions.source).includes(f)));
 const oldObjects=new Map(execFileSync('git',['ls-tree','-r','-z',base],{encoding:'utf8'}).split('\0').filter(Boolean).map(line=>[line.slice(line.indexOf('\t')+1),line.slice(0,line.indexOf('\t')).split(' ')[2]]));const currentObjects=execFileSync('git',['hash-object','--stdin-paths'],{input:protectedFiles.join('\n')+'\n',encoding:'utf8'}).trim().split('\n');protectedFiles.forEach((f,i)=>{const current=fs.readFileSync(new URL('../'+f,import.meta.url));const normalized=normalizeReviewedPolishHomeSource(current,f);if(normalized.equals(current))assert.equal(currentObjects[i],oldObjects.get(f),f);else assert.deepEqual(normalized,execFileSync('git',['show',base+':'+f]),f);});
});
