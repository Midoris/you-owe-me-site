import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import {siteLocales,portuguesePages,completedCounterparts,localizedRegistryEntries} from '../content/site-locales.mjs';
import {contentRegistry} from '../content/content-registry.mjs';
import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';
import {normalizeReviewedPortugueseHomeIntegration} from '../tests/helpers/reviewed-language-copy.mjs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const base='390c493b04d6fe5feede3088ac1c5de940b6121d',page=read('pt/index.html'),d=parseStaticPage(page);
const hash=b=>createHash('sha256').update(b).digest('hex');

test('Portuguese discovery admits only the reviewed base-pt homepage with native pt-BR document language',()=>{
 assert.deepEqual(portuguesePages.map(p=>p.pt),['/pt/','/pt/solucoes/app-para-controlar-quem-te-deve/']);
 assert.deepEqual(completedCounterparts('/').map(p=>p.code),['en','es','de','ar','fr','ja','pt']);
 assert.equal(completedCounterparts('/tools/split-expense-calculator/').some(p=>p.code==='pt'),false);
 assert.match(page,/<html lang="pt-BR">/);assert.equal(renderLocaleHtml(page,'/','pt'),page);
 assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 assert.ok(read('sitemap.xml').includes('<loc>https://you-owe-me.com/pt/</loc>'));
 const nav=d.querySelector('.site-locale-section');assert.equal(nav.querySelectorAll('a').length,2);assert.equal(nav.querySelector('a').getAttribute('href'),'/pt/');
 for(const c of completedCounterparts('/'))assert.ok(read(c.route.slice(1)+'index.html').includes('hreflang="pt" href="https://you-owe-me.com/pt/"'));
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 assert.equal(graph[0].inLanguage,'pt-BR');assert.equal(graph[1].inLanguage.length,10);assert.equal(graph[2].inLanguage,'en');
 assert.equal(localizedRegistryEntries(contentRegistry.filter(p=>!p.locale)).find(p=>p.url==='/pt/').appStoreCpp,'general');
});

test('Portuguese home preserves active source structure and English fallback destination semantics',()=>{
 const original=parseStaticPage(execFileSync('git',['show',base+':ja/index.html'],{encoding:'utf8'}));
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>n.getAttribute('aria-labelledby'));
 assert.ok(sections(d).length>10);assert.deepEqual(sections(d),sections(original));
 assert.equal(d.querySelectorAll('.lt-proofGrid article').length,3);assert.equal(d.querySelectorAll('.lt-reviewRail article').length,18);assert.equal(d.querySelectorAll('.lt-faqList article').length,10);
 for(const a of d.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/pt/'))assert.ok(a.textContent.includes('(em inglês)'),href);if(href?.includes('apps.apple.com'))assert.equal(href,'https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8');}
 const locale=siteLocales.find(l=>l.code==='pt');const fixture='<html lang="pt-BR"><head><link rel="canonical" href="https://you-owe-me.com/pt/" /></head><body><article><a href="/">Início (em inglês)</a><a href="/tools/split-expense-calculator/">Dividir (em inglês)</a></article><div id="copyright"><ul></ul></div></body></html>';
 const rendered=renderLocaleHtml(fixture,'/','pt');assert.ok(rendered.includes('href="/pt/">Início</a>'));assert.ok(rendered.includes('href="/tools/split-expense-calculator/">Dividir (em inglês)</a>'));
 assert.equal(locale.documentLanguage,'pt-BR');assert.doesNotMatch(page,/homepage-interactive-story-backup|loan-import-entry\.mjs|EN_AppStore/);
});

test('all prior public HTML preserves exact accepted bytes beyond the approved Portuguese homepage integration',()=>{
 const oldFiles=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n'));
 const files=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html')&&oldFiles.has(f));
 assert.ok(files.length>100);
 for(const file of files){const old=execFileSync('git',['show',base+':'+file],{encoding:'utf8'});assert.equal(normalizeReviewedPortugueseHomeIntegration(read(file)),old,file);}
 const afterAttribute='<a href="/pt/" lang="pt" data-unapproved="x" hreflang="pt">Português</a>';
 assert.ok(normalizeReviewedPortugueseHomeIntegration(afterAttribute).includes('data-unapproved'));
 for(const file of execFileSync('git',['ls-tree','-r','--name-only',base,'private-continuation'],{encoding:'utf8'}).trim().split('\n'))assert.equal(hash(fs.readFileSync(new URL('../'+file,import.meta.url))),hash(execFileSync('git',['show',base+':'+file])),file);
});

test('official badge bytes and neutral generic Store QR retain reviewed provenance',()=>{
 assert.equal(hash(fs.readFileSync(new URL('../images/pt/app-store/download-on-the-app-store-black.svg',import.meta.url))),'0e9291a9c654e479762b75b51dd94a150af6fab76390a79cb2218cdc8f6cc893');
 assert.equal(hash(fs.readFileSync(new URL('../images/pt/iphone-handoff/app-store.png',import.meta.url))),hash(fs.readFileSync(new URL('../images/ja/iphone-handoff/app-store.png',import.meta.url))));
});
