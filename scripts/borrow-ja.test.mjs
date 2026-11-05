import {normalizeReviewedPortugueseSplitSource} from '../tests/helpers/reviewed-language-copy.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
import { siteLocales, localizedSourceRoute } from '../content/site-locales.mjs';
import { contentRegistry } from '../content/content-registry.mjs';
import { renderLocaleHtml, renderLocaleDiscovery } from './sync-site-locales.mjs';
import { bindIphoneHandoffAnalytics } from './iphone-handoff-analytics-bridge.mjs';
import { normalizeReviewedJapaneseBorrowIntegration } from '../tests/helpers/reviewed-language-copy.mjs';
const route='/ja/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),page=read(route.slice(1)+'index.html'),controller=read('scripts/borrow-ja.js'),copy=JSON.parse(read('tests/fixtures/japanese-borrow-copy.json'));
const records=[...copy.messages.map(v=>({template:'ja_borrow_'+v.key,payload:v.text,tone:'respectful',category:'friend_borrow'})),{template:'ja_borrow_record',payload:copy.record.text,tone:'clear',category:'record'}];
function runtime(options={}) {
 const env=pageRuntime(page,options);
 const remove=node=>{node.remove=()=>node.parentNode?.removeChild(node);return node;};
 env.document.querySelectorAll('*').forEach(remove);
 const create=env.document.createElement;
 env.document.createElement=tag=>remove(create(tag));
 env.window.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>env.selections.at(-1)?.textContent.trim()||''});
 env.run(controller);
 return env;
}
const buttonSelector=record=>`[data-copy-template="${record.template}"]`;

test('Japanese borrowing copies all nine exact approved payloads and only existing source-tone metadata',async()=>{
 const env=runtime();assert.equal(env.document.querySelectorAll('[data-copy-template]').length,9);
 for(const record of records){const button=env.query(buttonSelector(record));assert.equal(button.closest('.borrow-ja-card').querySelector('.template-card__message').textContent.trim(),record.payload);assert.equal(button.dataset.tone,record.tone);assert.equal(button.dataset.category,record.category);button.focus();await env.click(buttonSelector(record));assert.equal(env.copied.at(-1),record.payload);assert.equal(env.document.activeElement,button);assert.equal(button.closest('.borrow-ja-card').querySelector('[data-copy-status]').textContent,copy.copyUI.successStatus);assert.deepEqual(env.events.at(-1),{type:'youoweme:tool-template-copy',detail:{page:'ja_borrow_messages',template_id:record.template,tone:record.tone,category:record.category}});}
 assert.equal(env.events.length,9);assert.equal(copy.record.text.split('\n').length,9);assert.equal((copy.record.text.match(/\n/g)||[]).length,8);
 const fallback=runtime({clipboardFails:true});await fallback.click('[data-copy-template="ja_borrow_record"]');assert.equal(fallback.copied.at(-1),copy.record.text);
});

test('Japanese borrowing retains proven Japanese copy logic with only scoped UI and source-metadata substitutions',()=>{
 const normalized=controller.replace('Japanese borrowing guide','Japanese repayment guide').replaceAll('borrow-ja','repayment-ja').replace('ja_borrow_messages','ja_repayment_messages').replace('約束の記録をコピー','記録テンプレートをコピー').replace('category: button.dataset.category,','category: "repayment",');assert.equal(normalized,execFileSync('git',['show','2b88200:scripts/repayment-ja.js'],{encoding:'utf8'}));
 for(const f of ['scripts/repayment-ja.js','scripts/borrow-fr.js','scripts/borrow-de.js','scripts/borrow-ar.js','scripts/split-expense-calculator.js','scripts/tool-transfer.js',...execFileSync('git',['ls-tree','-r','--name-only','2b88200','private-continuation'],{encoding:'utf8'}).trim().split('\n')])assert.deepEqual(Buffer.from(normalizeReviewedPortugueseSplitSource(fs.readFileSync(new URL('../'+f,import.meta.url)),f)),execFileSync('git',['show','2b88200:'+f]),f);
});

test('Japanese borrowing has its full eight-section hierarchy, nine-line record, six matching FAQs and exact borrower-side arithmetic',()=>{
 const env=runtime(),doc=env.document,text=doc.querySelector('#main').textContent;
 for(const message of copy.messages)for(const key of ['heading','guidance','text'])assert.ok(text.includes(message[key]),message[key]);
 for(const key of ['before','agreement','example','app']){const flatten=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(flatten):Object.values(v).flatMap(flatten);for(const v of flatten(copy[key]))assert.ok(text.includes(v),key+': '+v);}
 const sections=doc.querySelectorAll('section').filter(n=>n.parentNode?.tagName==='article'&&n.parentNode.parentNode?.id==='main');assert.equal(sections.length,8);assert.deepEqual(sections.slice(1).map(n=>n.id),['messages','before','agreement','example','app','faq','resources']);assert.equal(doc.querySelector('.borrow-ja-visual blockquote').textContent,copy.messages[0].text);assert.equal(doc.querySelectorAll('.borrow-ja-related').length,3);assert.equal(doc.querySelectorAll('table th').length,3);assert.equal(doc.querySelector('pre').textContent,copy.record.text);assert.equal(12000-4000,8000);assert.equal(4000*3,12000);assert.deepEqual(doc.querySelectorAll('tbody tr').map(n=>n.children.map(c=>c.textContent)),copy.example.rows);
 const graph=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert.equal(graph[0].headline,copy.h1);assert.equal(graph[0].inLanguage,'ja');assert.equal(graph[0].datePublished,'2026-11-05');assert.equal(graph[0].dateModified,'2026-11-05');assert.deepEqual(graph[2].mainEntity.map(n=>({q:n.name,a:n.acceptedAnswer.text})),copy.faq);assert.deepEqual(doc.querySelectorAll('.borrow-ja-faq details').map(n=>({q:n.querySelector('summary').textContent,a:n.querySelector('p').textContent})),copy.faq);assert.equal(doc.querySelectorAll('[data-iphone-handoff]').length,1);assert.equal(doc.querySelector('[data-iphone-handoff]').getAttribute('data-cta-location'),'ja_borrow_iphone_handoff');assert.equal(doc.querySelector('.borrow-ja-table-wrap').getAttribute('tabindex'),'0');assert.equal(doc.querySelector('title').textContent,copy.title);assert.doesNotMatch(page,/borrow-fr|ppid=|Copier|fr_friend_borrow/);
});

test('Japanese borrowing integration admits only exact approved prior HTML and cache changes',()=>{
 const files=execFileSync('git',['diff','--name-only','--diff-filter=M','2b88200','--','*.html'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);assert.ok(files.length>100);for(const f of files)assert.equal(normalizeReviewedJapaneseBorrowIntegration(read(f)),execFileSync('git',['show','2b88200:'+f],{encoding:'utf8'}),f);
 const original=execFileSync('git',['show','2b88200:ja/solutions/app-to-track-money-owed/index.html'],{encoding:'utf8'});assert.ok(original.includes('/blog/how-to-handle-a-friend-who-keeps-borrowing-money/'));assert.ok(read('ja/solutions/app-to-track-money-owed/index.html').includes('/blog/how-to-handle-a-friend-who-keeps-borrowing-money/'));assert.equal(contentRegistry.length,139);assert.equal(siteLocales.find(l=>l.code==='ja').pages.length,8);assert.equal(localizedSourceRoute(route),route.replace('/ja',''));assert.equal(renderLocaleHtml(page,route.replace('/ja',''),'ja'),page);assert.equal(renderLocaleDiscovery(read('llms.txt')),read('llms.txt'));
});
