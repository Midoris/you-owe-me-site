import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import {siteLocales,koreanPages,koreanShared,completedCounterparts,localizedSourceRoute} from '../content/site-locales.mjs';
import {contentRegistry} from '../content/content-registry.mjs';
import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';
import {normalizeReviewedKoreanHomeIntegration,normalizeReviewedKoreanHomeSource} from '../tests/helpers/reviewed-language-copy.mjs';
const base='624c89a98641c42076dcb21ad2fb05c7cc897b52';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const page=read('ko/index.html'),d=parseStaticPage(page);

test('Korean discovery contains only completed home and app solution and exact five editorial fields',()=>{
 assert.deepEqual(koreanPages.map(p=>p.ko),['/ko/','/ko/solutions/app-to-track-money-owed/']);assert.equal(localizedSourceRoute('/ko/'),'/');
 for(const f of ['/ko/blog/','/ko/solutions/','/ko/tools/'])assert.equal(localizedSourceRoute(f),null);
 assert.deepEqual(completedCounterparts('/').map(p=>p.code),['en','es','de','ar','fr','ja','pt','it','pl','ko']);
 for(const source of ['/solutions/app-to-track-money-owed/','/tools/split-expense-calculator/','/blog/how-to-remind-someone-they-owe-you-money-politely/'])assert.equal(completedCounterparts(source).some(p=>p.code==='ko'),source==='/solutions/app-to-track-money-owed/');
 assert.equal(siteLocales.find(l=>l.code==='pl').pages.length,4);
 const nav=d.querySelectorAll('.site-locale-section');assert.equal(nav.length,1);assert.deepEqual(nav[0].querySelectorAll('a').map(n=>n.getAttribute('href')),['/ko/','/ko/solutions/app-to-track-money-owed/']);assert.equal(nav[0].querySelector('a').getAttribute('aria-current'),'page');assert.equal((page.match(/<!-- korean-section:start -->/g)||[]).length,1);
 assert.equal(renderLocaleHtml(page,'/','ko'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 const entry=contentRegistry.find(p=>p.url==='/ko/');assert.equal(contentRegistry.length,152);for(const key of ['primaryAudience','problemSolved','useWhen','primaryCta','nextStep'])assert.equal(entry[key],koreanPages[0].registry[key]);assert.equal(entry.primaryAudience,koreanShared.primaryAudience);assert.equal(entry.appStoreCpp,'general');
 assert.equal((read('sitemap.xml').match(/<loc>/g)||[]).length,147);
});

test('Korean active page preserves sixteen source sections and honest English-only content links',()=>{
 const original=parseStaticPage(execFileSync('git',['show',base+':index.html'],{encoding:'utf8'}));
 const direct=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.getAttribute('aria-labelledby'));
 assert.equal(d.querySelectorAll('section').length,16);assert.equal(direct(d).length,12);assert.deepEqual(direct(d),direct(original));assert.equal(d.querySelectorAll('.lt-proofGrid article').length,3);assert.equal(d.querySelectorAll('.lt-reviewRail article').length,18);assert.equal(d.querySelectorAll('.lt-faqList article').length,10);
 for(const a of d.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/ko/'))assert.ok(a.textContent.includes('(영어)'),href);}
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];assert.equal(graph[0].inLanguage,'ko');assert.equal(graph[1].inLanguage.length,10);assert.equal(graph[1].featureList.length,22);assert.equal(graph[2].inLanguage,'en');assert.equal(graph.some(n=>n['@type']==='FAQPage'),false);
 assert.doesNotMatch(page,/homepage-interactive-story-backup|loan-import-entry\.mjs|loc\d+-.*pending/);
 const bullet=d.querySelector('.lt-includedSection .lt-checkGrid').querySelectorAll('li')[2];assert.equal(bullet.children.length,1);assert.equal(bullet.children[0].tagName,'span');assert.equal(bullet.querySelectorAll('a').length,2);
 for(const link of d.querySelectorAll('.lt-resourceShelfLink'))assert.deepEqual(link.children.filter(n=>n.tagName!=='#text').map(n=>n.tagName),['strong','span']);
 assert.equal(d.querySelector('.lt-findNudge strong').textContent,'어디서 시작할지 모르겠나요?');
});

test('all existing HTML and nine shared sources roundtrip exactly to accepted pre-Korean base',()=>{
 const tracked=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
 for(const f of tracked.filter(f=>f.endsWith('.html'))){const old=execFileSync('git',['show',base+':'+f],{encoding:'utf8'});assert.equal(normalizeReviewedKoreanHomeIntegration(read(f)),old,f);}
 const admissions=JSON.parse(read('tests/fixtures/korean-home-reviewed-admissions.json'));assert.equal(Object.keys(admissions.source).length,9);assert.equal(admissions.availability.length,9);
 for(const f of Object.keys(admissions.source))assert.deepEqual(normalizeReviewedKoreanHomeSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f),execFileSync('git',['show',base+':'+f]),f);
 const binary=Buffer.from([255,254,0,128]);assert.equal(normalizeReviewedKoreanHomeSource(binary,'downloads/protected.xlsx'),binary);
 const extra='<a href="/ko/" lang="ko" data-unapproved="x" hreflang="ko">한국어</a>';assert.equal(normalizeReviewedKoreanHomeIntegration(extra),extra);
});

test('old artwork, native templates, private hosting and all prior home design fixes remain exact Git objects',()=>{
 const rows=execFileSync('git',['ls-tree','-r','-z',base],{encoding:'utf8'}).split('\0').filter(Boolean).map(row=>[row.slice(row.indexOf('\t')+1),row.slice(0,row.indexOf('\t')).split(' ')[2]]);
 const protectedRows=rows.filter(([f])=>f.startsWith('private-continuation/')||f.startsWith('images/')||f.startsWith('downloads/')||f.startsWith('styles/')||f.startsWith('content/roommate-workbooks/')||f.startsWith('assets/css/'));
 const hashes=execFileSync('git',['hash-object','--stdin-paths'],{input:protectedRows.map(([f])=>f).join('\n')+'\n',encoding:'utf8'}).trim().split('\n');protectedRows.forEach(([f,h],i)=>assert.equal(hashes[i],h,f));
});
