import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';import {siteLocales,portuguesePages,completedCounterparts} from '../content/site-locales.mjs';import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';import {normalizeReviewedPortugueseMoneyOwedIntegration} from '../tests/helpers/reviewed-language-copy.mjs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),route='/pt/solucoes/app-para-controlar-quem-te-deve/',source='/solutions/app-to-track-money-owed/',base='678c260ceabd5e54d31663cc1e7c39ef3039fbfa',page=read(route.slice(1)+'index.html'),d=parseStaticPage(page),original=parseStaticPage(execFileSync('git',['show',base+':solutions/app-to-track-money-owed/index.html'],{encoding:'utf8'})),text=n=>n.textContent.trim().replace(/\s+/g,' '),store='https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8';

test('Portuguese solution has eighteen visible/schema FAQ pairs and all twenty-two source destinations',()=>{
 const faqs=d.querySelectorAll('.solution-faq-item');assert.equal(faqs.length,18);assert.equal(faqs[0].hasAttribute('open'),true);assert.ok(faqs.slice(1).every(n=>!n.hasAttribute('open')));
 const schemas=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)].map(m=>JSON.parse(m[1]));const schema=schemas.find(n=>n['@type']==='FAQPage');assert.equal(schema.inLanguage,'pt-BR');assert.deepEqual(schema.mainEntity.map(n=>({question:n.name,answer:n.acceptedAnswer.text.trim().replace(/\s+/g,' ')})),faqs.map(n=>({question:text(n.querySelector('summary')),answer:text(n.querySelector('p'))})));assert.equal(text(faqs[10].querySelector('summary')),'Posso registrar juros?');
 const cards=d.querySelectorAll('.lt-relatedCard');assert.equal(cards.length,22);assert.deepEqual(cards.map(n=>n.querySelector('a').getAttribute('href')),original.querySelectorAll('.lt-relatedCard').map(n=>n.querySelector('a').getAttribute('href')));
 assert.equal(d.querySelector('.money-owed-related-directory').hasAttribute('open'),false);assert.equal(d.querySelector('.money-owed-extra-features').hasAttribute('open'),false);
});

test('Portuguese solution preserves active English structure, source analytics and exact fragment/link boundaries',()=>{
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.id,n.getAttribute('aria-labelledby')]);assert.ok(sections(d).length>10);assert.deepEqual(sections(d),sections(original));
 const attrs=doc=>doc.querySelectorAll('.best-next-step__card').map(n=>[...n.attributes].filter(([k])=>k==='href'||k.startsWith('data-')));const expected=attrs(original);expected[3]=expected[3].map(([k,v])=>[k,k==='href'?store:k==='data-step-destination'?'app-store:general':v]);assert.deepEqual(attrs(d),expected);
 for(const a of d.querySelectorAll('#main a')){const href=a.getAttribute('href');assert.notEqual(href,'undefined');if(href?.startsWith('/')&&!href.startsWith('/pt/'))assert.ok(text(a).includes('(em inglês)'),href);if(href?.includes('apps.apple.com'))assert.equal(href,store);if(href?.startsWith('#'))assert.ok(d.querySelector(href),href);}
 assert.doesNotMatch(page,/loan-import-entry\.mjs|data-loan-import-open|ppid=/);assert.equal(d.querySelector('.loan-import-offer__button').getAttribute('href'),'/tools/personal-loan-payment-tracker/#import-loan-history');
 const web=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(n=>n['@type']==='WebPage');assert.equal(web.inLanguage,'pt-BR');assert.equal(web.name,text(d.querySelector('h1')));assert.equal(web.dateModified,'2026-11-05');assert.equal(web.url,'https://you-owe-me.com'+route);
});

test('Portuguese solution discovery and two homepage inward links match only the completed family',()=>{
 assert.deepEqual(portuguesePages.map(p=>p.pt),['/pt/',route]);assert.deepEqual(completedCounterparts(source).map(p=>p.code),['en','es','de','ar','fr','ja','pt']);assert.equal(completedCounterparts('/solutions/personal-loan-repayment-tracker/').some(p=>p.code==='pt'),false);
 assert.equal(renderLocaleHtml(page,source,'pt'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));assert.ok(read('sitemap.xml').includes('https://you-owe-me.com'+route));
 const home=parseStaticPage(read('pt/index.html'));
 assert.equal(home.querySelector('.best-next-step__card').getAttribute('href'),route);assert.equal(home.querySelector('.lt-situationPrimaryCta').getAttribute('href'),route);assert.ok(!text(home.querySelector('.best-next-step__card')).includes('(em inglês)'));assert.ok(!text(home.querySelector('.lt-situationPrimaryCta')).includes('(em inglês)'));
 for(const c of completedCounterparts(source))assert.ok(read(c.route.slice(1)+'index.html').includes('hreflang="pt" href="https://you-owe-me.com'+route+'"'));
 assert.equal(siteLocales.find(l=>l.code==='pt').pages.length,2);
});

test('prior HTML and private resources remain exact beyond the precise reviewed Portuguese solution admissions',()=>{
 const present=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n'));const files=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html')&&present.has(f));assert.ok(files.length>100);
 for(const f of files)assert.equal(normalizeReviewedPortugueseMoneyOwedIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 const annotated='<a href="'+route+'" class="lt-situationPrimaryCta" data-unapproved="x" data-cta-location="situation-card"><span class="pt-link-label">Organizar valores a receber</span></a>';assert.ok(normalizeReviewedPortugueseMoneyOwedIntegration(annotated).includes('data-unapproved'));
 for(const f of present)if(f.startsWith('private-continuation/')||f.startsWith('images/pt/home/')||f==='styles/home-pt.css')assert.deepEqual(fs.readFileSync(new URL('../'+f,import.meta.url)),execFileSync('git',['show',base+':'+f]),f);
});
