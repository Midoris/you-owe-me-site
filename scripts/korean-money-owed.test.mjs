import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';import {siteLocales,koreanPages,completedCounterparts,localizedSourceRoute} from '../content/site-locales.mjs';import {contentRegistry} from '../content/content-registry.mjs';import {renderLocaleHtml,renderLocaleDiscovery} from './sync-site-locales.mjs';import {normalizeReviewedKoreanMoneyOwedIntegration,normalizeReviewedKoreanMoneyOwedSource} from '../tests/helpers/reviewed-language-copy.mjs';
const base='5d22e08db923216ecf2145b9944a0e284304abe3',route='/ko/solutions/app-to-track-money-owed/',source='/solutions/app-to-track-money-owed/',read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),page=read(route.slice(1)+'index.html'),d=parseStaticPage(page),original=parseStaticPage(execFileSync('git',['show',base+':solutions/app-to-track-money-owed/index.html'],{encoding:'utf8'})),text=n=>n.textContent.trim().replace(/\s+/g,' '),store='https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8';

test('Korean solution contains18visible/schema FAQs including interest and22unchanged source destinations',()=>{
 const faqs=d.querySelectorAll('.solution-faq-item');assert.equal(faqs.length,18);assert.equal(faqs[0].hasAttribute('open'),true);assert.ok(faqs.slice(1).every(n=>!n.hasAttribute('open')));
 const schemas=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)].map(m=>JSON.parse(m[1]));const faqSchema=schemas.find(n=>n['@type']==='FAQPage');assert.equal(faqSchema.inLanguage,'ko');assert.deepEqual(faqSchema.mainEntity.map(n=>({q:n.name,a:n.acceptedAnswer.text.trim().replace(/\s+/g,' ')})),faqs.map(n=>({q:text(n.querySelector('summary')),a:text(n.querySelector('p'))})));assert.equal(text(faqs[10].querySelector('summary')),'이자도 기록할 수 있나요?');
 const cards=d.querySelectorAll('.lt-relatedCard');assert.equal(cards.length,22);assert.deepEqual(cards.map(n=>n.querySelector('a').getAttribute('href')),original.querySelectorAll('.lt-relatedCard').map(n=>n.querySelector('a').getAttribute('href')));
 assert.equal(d.querySelector('.money-owed-related-directory').hasAttribute('open'),false);assert.equal(d.querySelector('.money-owed-extra-features').hasAttribute('open'),false);
});

test('Korean solution retains English active structure, analytics identity and valid fallback/fragment semantics',()=>{
 const sections=doc=>doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main').map(n=>[n.className,n.id,n.getAttribute('aria-labelledby')]);assert.equal(sections(d).length,16);assert.deepEqual(sections(d),sections(original));
 const attrs=doc=>doc.querySelectorAll('.best-next-step__card').map(n=>[...n.attributes].filter(([k])=>k==='href'||k.startsWith('data-')));const expected=attrs(original);expected[3]=expected[3].map(([k,v])=>[k,k==='href'?store:k==='data-step-destination'?'app-store:general':v]);assert.deepEqual(attrs(d),expected);
 for(const a of d.querySelectorAll('#main a')){const h=a.getAttribute('href');assert.notEqual(h,'undefined');if(h?.startsWith('/')&&!h.startsWith('/ko/'))assert.ok(text(a).includes('(영어)'),h);if(h?.includes('apps.apple.com'))assert.equal(h,store);if(h?.startsWith('#'))assert.ok(d.querySelector(h),h);}
 const web=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(n=>n['@type']==='WebPage');assert.equal(web.inLanguage,'ko');assert.equal(web.name,text(d.querySelector('h1')));assert.equal(web.dateModified,'2026-11-06');assert.equal(web.url,'https://you-owe-me.com'+route);assert.doesNotMatch(page,/loan-import-entry\.mjs|data-loan-import-open|ppid=/);
 const footerLinks=doc=>doc.querySelectorAll('#copyright a').filter(n=>!n.closest('.site-language-switch')).map(n=>n.getAttribute('href'));assert.deepEqual(footerLinks(d),footerLinks(original));
});

test('Korean discovery/nav/inward links admit exactly the accepted routes and correct family',()=>{
 assert.deepEqual(koreanPages.map(p=>p.ko),['/ko/',route]);assert.equal(localizedSourceRoute(route),source);assert.equal(localizedSourceRoute('/ko/tools/split-expense-calculator/'),null);assert.deepEqual(completedCounterparts(source).map(p=>p.code),['en','es','de','ar','fr','ja','pt','it','pl','ko']);assert.equal(completedCounterparts('/tools/split-expense-calculator/').some(p=>p.code==='ko'),false);
 assert.equal(contentRegistry.length,152);assert.equal(renderLocaleHtml(page,source,'ko'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
 for(const r of koreanPages.map(p=>p.ko)){const raw=read(r.slice(1)+'index.html'),doc=parseStaticPage(raw),navs=doc.querySelectorAll('.site-locale-section');assert.equal(navs.length,1);assert.equal((raw.match(/<!-- korean-section:start -->/g)||[]).length,1);assert.deepEqual(navs[0].querySelectorAll('a').map(n=>n.getAttribute('href')),koreanPages.map(p=>p.ko));assert.equal(navs[0].querySelectorAll('a').filter(n=>n.getAttribute('aria-current')==='page')[0].getAttribute('href'),r);}
 const home=parseStaticPage(read('ko/index.html'));assert.equal(home.querySelector('.best-next-step__card').getAttribute('href'),route);assert.equal(home.querySelector('.lt-situationPrimaryCta').getAttribute('href'),route);assert.ok(!text(home.querySelector('.best-next-step__card')).includes('(영어)'));assert.ok(!text(home.querySelector('.lt-situationPrimaryCta')).includes('(영어)'));
 for(const c of completedCounterparts(source))assert.ok(read(c.route.slice(1)+'index.html').includes('hreflang="ko" href="https://you-owe-me.com'+route+'"'));
});

test('all previous HTML/shared source preserve exact bytes beyond narrow Korean solution admissions',()=>{
 const present=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n'));const files=execFileSync('git',['diff','--name-only',base,'--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(f=>present.has(f));assert.ok(files.length>100);for(const f of files)assert.equal(normalizeReviewedKoreanMoneyOwedIntegration(read(f)),execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f);
 const admissions=JSON.parse(read('tests/fixtures/korean-money-owed-reviewed-admissions.json'));for(const f of Object.keys(admissions.source))assert.deepEqual(normalizeReviewedKoreanMoneyOwedSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f),execFileSync('git',['show',base+':'+f]),f);
 const altered=admissions.homeAnchors[1][0].replace(' class=',' data-unapproved="x" class=');assert.equal(normalizeReviewedKoreanMoneyOwedIntegration(altered),altered);
 const bytes=Buffer.from([0xff,0xfe,0x00,0x80]);assert.equal(normalizeReviewedKoreanMoneyOwedSource(bytes,'downloads/protected.xlsx'),bytes);
});


test('Korean FAQ and directory prose exactly matches the parent-reviewed copy',()=>{
 const approved=JSON.parse(read('tests/fixtures/korean-money-owed-copy.json'));
 assert.deepEqual(d.querySelectorAll('.solution-faq-item').map(n=>({q:text(n.querySelector('summary')),a:text(n.querySelector('p'))})),approved.faq);
 assert.deepEqual(d.querySelectorAll('.lt-relatedCard').map(n=>[n.querySelector('a').getAttribute('href'),text(n.querySelector('h3')),text(n.querySelector('p')),text(n.querySelector('a'))]),approved.cards);
});
