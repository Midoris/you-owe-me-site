import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteLocales,sharedAssetVersions,completedCounterparts,localizedSourceRoute,localizedRegistryEntries} from '../../../content/site-locales.mjs';
import {renderLocaleHtml,renderLocaleDiscovery} from '../../../scripts/sync-site-locales.mjs';
import {contentRegistry} from '../../../content/content-registry.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./foundation-independent-checks.json',import.meta.url));
const checks=[];
const check=(name,run)=>{run();checks.push(name);};
const read=route=>fs.readFileSync(path.join(root,route,'index.html'),'utf8');
const normalize=(html,route)=>html
 .replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g,'')
 .replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g,'')
 .replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?("|\s)/g,(original,start,reference,end)=>{
  const asset=new URL(reference,'https://you-owe-me.com'+route).pathname;
  return sharedAssetVersions[asset]?`${start}${reference}?v=owned-cache${end}`:original;
 });
check('All 20 preexisting counterpart authored documents retain accepted a2eb93d bytes outside generated locale blocks and declared shared cache queries',()=>{
 const routes=new Set(['/']);
 for(const locale of siteLocales.filter(l=>!['en','fr'].includes(l.code))) for(const page of locale.pages){routes.add(page.en);routes.add(page[locale.code]);}
 assert.equal(routes.size,20);
 for(const route of routes){const filename=route==='/'?'index.html':route.slice(1)+'index.html';const base=execFileSync('git',['show',`a2eb93d:${filename}`],{cwd:root,encoding:'utf8'});assert.equal(normalize(read(route),route),normalize(base,route),route);}
});
check('French is the fifth common locale and every planned route stays gated until complete',()=>{
 assert.deepEqual(siteLocales.map(l=>l.code),['en','es','de','ar','fr']);
 const french=siteLocales.find(l=>l.code==='fr');assert.equal(french.pages.length,5);
 const registry=localizedRegistryEntries(contentRegistry.filter(e=>!e.locale));
 const discovery=fs.readFileSync(path.join(root,'llms.txt'),'utf8');
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 for(const page of french.pages){const route=page.fr;assert.equal(localizedSourceRoute(route),page.complete?page.en:null);assert.equal(registry.some(e=>e.url===route),page.complete);if(!page.complete){assert.ok(!sitemap.includes(`https://you-owe-me.com${route}`));assert.ok(!discovery.includes(`https://you-owe-me.com${route}`));for(const counterpart of completedCounterparts(page.en))assert.ok(!read(counterpart.route).includes(`hreflang="fr" href="https://you-owe-me.com${route}"`));}}
});
check('Current complete clusters have reciprocal self/default alternates, exactly one current switch and stable generator output',()=>{
 for(const source of siteLocales.find(l=>l.code==='es').pages){const counterparts=completedCounterparts(source.en);for(const {code,route} of counterparts){const html=read(route);assert.equal(renderLocaleHtml(html,source.en,code),html,route);for(const peer of [...counterparts,{code:'x-default',route:source.en}])assert.ok(html.includes(`hreflang="${peer.code}" href="https://you-owe-me.com${peer.route}"`),`${route} → ${peer.code}`);const switcher=html.match(/<!-- locale-switch:start -->([\s\S]*?)<!-- locale-switch:end -->/)?.[1];assert.ok(switcher);assert.equal((switcher.match(/aria-current="page"/g)||[]).length,1);assert.equal((switcher.match(/<a /g)||[]).length,counterparts.length);}}
 const discovery=fs.readFileSync(path.join(root,'llms.txt'),'utf8');assert.equal(renderLocaleDiscovery(discovery),discovery);
});
check('Arabic links keep shaping/isolation in French and French links keep explicit LTR in Arabic',()=>{
 const locales=siteLocales.map(l=>({...l,pages:l.pages.map(p=>({...p,complete:p.en==='/'}))}));
 const fixture='<!doctype html><html lang="fr"><head><link rel="canonical" href="https://you-owe-me.com/fr/" /></head><body><nav id="nav"><ul class="links"></ul></nav><article><h1>Test</h1></article><div id="copyright"><ul></ul></div></body></html>';
 const french=renderLocaleHtml(fixture,'/','fr',locales),arabic=renderLocaleHtml(fixture,'/','ar',locales);
 assert.match(french,/<a href="\/ar\/" lang="ar" dir="rtl" hreflang="ar"/);
 assert.match(arabic,/<a href="\/fr\/" lang="fr" dir="ltr" hreflang="fr"/);
 assert.equal(renderLocaleHtml(french,'/','fr',locales),french);
});
check('Analytics nested configuration import has a fresh French batch URL',()=>{
 const analytics=fs.readFileSync(path.join(root,'scripts/analytics.js'),'utf8');
 const baseline=execFileSync('git',['show','a2eb93d:scripts/analytics.js'],{cwd:root,encoding:'utf8'});
 const get=s=>s.match(/import \{ localizedSourceRoute \} from "([^\"]+)"/)?.[1];
 assert.ok(get(analytics));assert.notEqual(get(analytics),get(baseline));assert.match(get(analytics),/site-locales\.mjs\?v=fr/);
});
fs.writeFileSync(output,JSON.stringify({accepted:true,baseline:'a2eb93d',checkedAt:new Date().toISOString(),checks},null,2)+'\n');
console.log(JSON.stringify({accepted:true,checks:checks.length}));
