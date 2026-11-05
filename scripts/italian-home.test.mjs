import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import {siteLocales,italianPages,completedCounterparts,localizedSourceRoute} from '../content/site-locales.mjs';
import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';
import {normalizeReviewedItalianHomeIntegration,normalizeReviewedItalianHomeSource} from '../tests/helpers/reviewed-language-copy.mjs';
const base='b92a9ec5a72e2fce58955cca053e0b0e63887c40',read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const page=read('it/index.html'),d=parseStaticPage(page);

test('Italian discovery admits only reviewed home/solution/guide routes and removes only their English fallback',()=>{
 assert.deepEqual(italianPages.map(p=>p.it),['/it/','/it/soluzioni/app-per-segnare-chi-ti-deve-soldi/','/it/blog/come-tenere-il-conto-di-chi-ti-deve-soldi/','/it/soluzioni/gestire-prestiti-tra-amici-e-familiari/','/it/strumenti/calcolatore-spese-condivise/']);assert.equal(localizedSourceRoute('/it/'),'/');
 assert.equal(localizedSourceRoute('/it/tools/split-expense-calculator/'),null);
 assert.deepEqual(completedCounterparts('/').map(p=>p.code),['en','es','de','ar','fr','ja','pt','it']);
 assert.equal(completedCounterparts('/tools/split-expense-calculator/').some(p=>p.code==='it'),true);
 assert.equal(renderLocaleHtml(page,'/','it'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 const fixture='<html lang="it"><head><link rel="canonical" href="https://you-owe-me.com/it/" /></head><body><article><a href="/">Home (in inglese)</a><a href="/tools/split-expense-calculator/">Calcolo (in inglese)</a></article><div id="copyright"><ul></ul></div></body></html>';
 const rendered=renderLocaleHtml(fixture,'/','it');assert.ok(rendered.includes('href="/it/">Home</a>'));assert.ok(rendered.includes('href="/it/strumenti/calcolatore-spese-condivise/">Calcolo</a>'));
 assert.ok(read('sitemap.xml').includes('<loc>https://you-owe-me.com/it/</loc>'));
});

test('Italian active hierarchy, single marked navigation and English destinations retain source semantics',()=>{
 const original=parseStaticPage(execFileSync('git',['show',base+':pt/index.html'],{encoding:'utf8'}));
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.getAttribute('aria-labelledby'));
 assert.equal(d.querySelectorAll('section').length,16);assert.equal(sections(d).length,12);assert.deepEqual(sections(d),sections(original));
 assert.equal(d.querySelectorAll('.lt-proofGrid article').length,3);assert.equal(d.querySelectorAll('.lt-reviewRail article').length,18);assert.equal(d.querySelectorAll('.lt-faqList article').length,10);
 assert.equal((page.match(/<!-- italian-section:start -->/g)||[]).length,1);
 const navs=d.querySelectorAll('.site-locale-section');assert.equal(navs.length,1);assert.deepEqual(navs[0].querySelectorAll('a').map(a=>a.getAttribute('href')),italianPages.map(p=>p.it));
 assert.equal(navs[0].querySelector('a').getAttribute('aria-current'),'page');
 for(const a of d.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/it/'))assert.ok(a.textContent.includes('(in inglese)'),href);}
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 assert.equal(graph[0].inLanguage,'it');assert.equal(graph[1].inLanguage.length,10);assert.equal(graph[1].featureList.length,22);assert.equal(graph[2].inLanguage,'en');assert.equal(graph.some(n=>n['@type']==='FAQPage'),false);
 assert.doesNotMatch(page,/homepage-interactive-story-backup|loan-import-entry\.mjs|loc\d+-.*pending/);
});

test('all preexisting authored HTML and shared runtime roundtrip exact immutable bytes beyond LOC26 admissions',()=>{
 const present=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n'));const files=execFileSync('git',['diff','--name-only',base,'--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(f=>present.has(f));assert.ok(files.length>100);
 for(const f of files)assert.equal(normalizeReviewedItalianHomeIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 const admissions=JSON.parse(read('tests/fixtures/italian-home-reviewed-admissions.json'));
 for(const f of Object.keys(admissions.source))assert.deepEqual(normalizeReviewedItalianHomeSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f),execFileSync('git',['show',base+':'+f]),f);
 const binary=Buffer.from([0xff,0xfe,0x00,0x80]);assert.equal(normalizeReviewedItalianHomeSource(binary,'downloads/protected.xlsx'),binary);
 const extra='<a href="/it/" lang="it" data-unapproved="x" hreflang="it">Italiano</a>';
 assert.equal(normalizeReviewedItalianHomeIntegration(extra),extra);
 const raw='The full website is available in English, with arbitrary unapproved content.';assert.equal(normalizeReviewedItalianHomeIntegration(raw),raw);
});
