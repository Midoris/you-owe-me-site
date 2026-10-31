import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
import {siteLocales,japanesePages,completedCounterparts,sharedAssetVersions} from '../content/site-locales.mjs';
import {renderLocaleHtml} from './sync-site-locales.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('ja/index.html'),doc=parseStaticPage(page),expected=JSON.parse(read('tests/fixtures/japanese-home-copy.json'));
const text=n=>n.textContent.trim().replace(/\s+/g,' ');

test('Japanese home retains all ten reviewed FAQs and all twenty-one translated review cards',()=>{
 const linkedAnswers={1:['無料の計算ツール','Live Link','Balance Sync'],4:['返済をお願いするメッセージ集'],6:['親の費用を記録する使い方']};
 const articles=doc.querySelectorAll('.lt-faqList article');assert.equal(articles.length,10);
 for(const [i,node]of articles.entries()){
  assert.equal(text(node.querySelector('h3')),expected.faq[i].question);
  let answer=expected.faq[i].answer;for(const anchor of linkedAnswers[i]||[])answer=answer.replace(anchor,anchor+'（英語）');
  assert.equal(text(node.querySelector('p')),answer);
 }
 const proof=doc.querySelectorAll('.lt-proofGrid article');assert.equal(proof.length,3);
 proof.forEach((node,i)=>{assert.equal(text(node.querySelector('.lt-reviewLabel')),expected.proof[i][1]);assert.deepEqual(node.querySelectorAll('blockquote p').map(text),expected.proof[i].slice(2));assert.equal(text(node.querySelector('.lt-reviewAttribution')),'App Storeのレビュー・日本語訳 · '+expected.proof[i][0].trim());});
 const rail=doc.querySelectorAll('.lt-reviewRail article');assert.equal(rail.length,18);
 rail.forEach((node,i)=>{if(expected.rail[i][1])assert.equal(text(node.querySelector('.lt-reviewLabel')),expected.rail[i][1]);assert.equal(text(node.querySelector('blockquote p')),expected.rail[i][2]);assert.ok(text(node.querySelector('.lt-reviewAttribution')).startsWith('App Storeのレビュー・日本語訳'));});
 assert.ok(page.includes('子どもたちも、借りた金額や返した金額を忘れずに済みます。'));
});

test('Japanese admission contains only its reviewed home and solution with exact route semantics and fullwidth fallback removal',()=>{
 assert.deepEqual(japanesePages.map(p=>p.ja),['/ja/','/ja/solutions/app-to-track-money-owed/','/ja/blog/how-to-keep-track-of-who-owes-you-money/']);
 assert.deepEqual(completedCounterparts('/').map(p=>p.code),['en','es','de','ar','fr','ja']);
 assert.equal(completedCounterparts('/tools/split-expense-calculator/').some(p=>p.code==='ja'),false);
 assert.equal(renderLocaleHtml(page,'/','ja'),page);
 const fixture='<html lang="ja"><head><link rel="canonical" href="https://you-owe-me.com/ja/" /></head><body><nav id="nav" aria-label="メインメニュー"><ul class="links"></ul></nav><article><a href="/tools/split-expense-calculator/">計算する（英語）</a><a href="/tools/personal-loan-payment-tracker/">履歴を取り込む（英語）</a></article><div id="copyright"><ul></ul></div></body></html>';
 const locales=siteLocales.map(l=>l.code==='ja'?{...l,pages:[...l.pages,{en:'/tools/split-expense-calculator/',ja:'/ja/test-split/',title:'計算する',complete:true}]}:l);
 const rendered=renderLocaleHtml(fixture,'/','ja',locales);
 assert.ok(rendered.includes('href="/ja/test-split/">計算する</a>'));assert.ok(rendered.includes('href="/tools/personal-loan-payment-tracker/">履歴を取り込む（英語）</a>'));
 assert.ok(text(parseStaticPage(rendered).querySelector('a[href="/tools/"]')).includes('計算ツール・テンプレート（英語）'));assert.equal(renderLocaleHtml(rendered,'/','ja',locales),rendered);
 for(const counterpart of completedCounterparts('/'))assert.ok(read(counterpart.route.slice(1)+'index.html').includes('hreflang="ja" href="https://you-owe-me.com/ja/"'));
});

test('Japanese source preserves active English section order, CTA tracking identity and genuine-vs-illustrative asset boundaries',()=>{
 const original=parseStaticPage(execFileSync('git',['show','845ececf8499bee2d92378ac9632e3db17b733aa:index.html'],{encoding:'utf8'}).replace(/<template id="homepage-interactive-story-backup">[\s\S]*?<\/template>/,''));
 assert.doesNotMatch(page,/homepage-interactive-story-backup|loan-import-entry\.mjs|EN_AppStore|i\.ytimg\.com/);
 const ids=d=>d.querySelectorAll('#main section').map(n=>n.getAttribute('aria-labelledby'));
 assert.deepEqual(ids(doc),ids(original));
 const attrs=d=>d.querySelectorAll('.best-next-step__card').map(n=>[...n.attributes].filter(([k])=>k==='href'||k.startsWith('data-')));
 const sourceAttrs=attrs(original);sourceAttrs[0]=sourceAttrs[0].map(([key,value])=>[key,key==='href'?'/ja/solutions/app-to-track-money-owed/':value]);
 assert.deepEqual(attrs(doc),sourceAttrs);
 assert.equal(doc.querySelectorAll('.lt-situationCard').length,8);assert.equal(doc.querySelectorAll('.lt-resourceShelfLink').length,6);
 const included=doc.querySelectorAll('.lt-checkGrid li')[2];assert.equal(included.children.length,1);assert.equal(included.children[0].tagName,'span');assert.equal(included.querySelectorAll('a').length,2);
 for(const a of doc.querySelectorAll('#main a')){const href=a.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/ja/'))assert.ok(text(a).includes('（英語）'),href);if(href?.includes('apps.apple.com'))assert.equal(href,'https://apps.apple.com/app/id1147058670?pt=117888502&ct=website_cta&mt=8');}
 for(const name of ['loan-records','live-link','repayment-plan'])assert.ok(page.includes('/images/ja/home/'+name+'.webp'));
 for(const name of ['stats-overview','stats-repayments']){const svg=read('images/ja/home/'+name+'.svg');assert.match(svg,/lang="ja"/);assert.doesNotMatch(svg,/statusbar|iPhone|button/i);}
 assert.equal(text(doc.querySelector('#home-stats-caption')),'説明用のイメージです。実際のアプリ画面ではありません。');
 assert.ok(page.includes('日付や金額の形式は、端末の地域設定によって異なります。'));
});

test('Japanese metadata retains app identity, language facts and English video truth; changed dependencies are consistently cache-pinned',()=>{
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
 const [web,app,video]=graph;assert.equal(web.inLanguage,'ja');assert.equal(web.url,'https://you-owe-me.com/ja/');assert.equal(app['@id'],'https://you-owe-me.com/#software-application');assert.equal(app.description,expected.faq[0].answer);assert.equal(app.inLanguage.length,10);assert.deepEqual(app.offers,{'@type':'Offer',price:'0',priceCurrency:'USD'});assert.equal(video.inLanguage,'en');assert.equal(video.uploadDate,'2026-04-06T12:20:54+07:00');assert.equal(video.thumbnailUrl,'https://you-owe-me.com/images/ja/home/video-poster.svg');
 const changed=['/scripts/sales.js','/scripts/anniversary-announcement.js','/scripts/app-language-support.js','/scripts/video-embed.js','/assets/js/main.js'];
 for(const locale of siteLocales)for(const p of locale.code==='en'?[{en:'/'}]:locale.pages.filter(p=>p.complete)){const html=read((locale.code==='en'?'':p[locale.code].slice(1))+'index.html');for(const asset of changed)if(html.includes(asset))assert.ok(html.includes(asset+'?v='+sharedAssetVersions[asset]),asset);}
});
