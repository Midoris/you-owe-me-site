import { normalizeReviewedLanguageCopy } from "../tests/helpers/reviewed-language-copy.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {siteLocales, frenchPages, completedCounterparts, localizedSourceRoute, localizedRegistryEntries, sharedAssetVersions} from '../content/site-locales.mjs';
import {contentRegistry} from '../content/content-registry.mjs';
import {renderLocaleHtml, renderLocaleDiscovery} from './sync-site-locales.mjs';

const fixture = '<html lang="fr"><head><link rel="canonical" href="https://you-owe-me.com/fr/" /></head><body><nav id="nav"><ul class="links"></ul></nav><article><p id="authored">Un paiement partiel réduit le solde restant.</p><a href="/" lang="en">English</a><a href="/solutions/app-to-track-money-owed/">Lire (en anglais)</a></article><div id="copyright"><ul></ul></div></body></html>';
function locales(complete){return siteLocales.map(l=>l.code==='fr'?{...l,pages:l.pages.map((p,i)=>({...p,complete:complete&&i===0}))}:l);}
test('French admission requires review and produces reciprocal idempotent five-language clusters',()=>{
 const planned=locales(false),reviewed=locales(true);
 assert.equal(localizedSourceRoute('/fr/',planned),null);
 assert.throws(()=>renderLocaleHtml(fixture,'/','fr',planned),/Unreviewed/);
 assert.ok(!renderLocaleDiscovery('# Site\n',planned).includes('https://you-owe-me.com/fr/'));
 assert.ok(!localizedRegistryEntries(contentRegistry.filter(p=>!p.locale),planned).some(p=>p.locale==='fr'));
 for(const lang of ['en','es','de','ar','fr']){
  const html=renderLocaleHtml(fixture,'/',lang,reviewed);
  for(const {code,route} of completedCounterparts('/',reviewed))assert.ok(html.includes(`hreflang="${code}" href="https://you-owe-me.com${route}"`));
  assert.ok(html.includes('hreflang="x-default" href="https://you-owe-me.com/"'));
  assert.ok(html.includes('lang="ar" dir="rtl" hreflang="ar"'));
  if(lang==='ar')assert.ok(html.includes('lang="fr" dir="ltr" hreflang="fr"'));
  assert.equal(renderLocaleHtml(html,'/',lang,reviewed),html);
  assert.ok(html.includes('<p id="authored">Un paiement partiel réduit le solde restant.</p>'));
 }
 const html=renderLocaleHtml(fixture,'/','fr',reviewed);
 assert.ok(html.includes('href="/fr/">You Owe Me'));
 assert.ok(html.includes('href="/" lang="en">English'));
 for(const p of frenchPages.slice(1)) assert.ok(!html.includes(p.fr));
});
test('released translations retain accepted bytes and English rendering preserves current authored content',()=>{
 function normalize(html,route){return normalizeReviewedLanguageCopy(html).replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g,'').replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g,'').replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?(")/g,(original,start,ref,end)=>sharedAssetVersions[new URL(ref,'https://you-owe-me.com'+route).pathname]?`${start}${ref}?v=shared-cache${end}`:original);}
 // These three Arabic clusters were released after the immutable a2eb93d baseline;
 // their dedicated repayment/borrowing/template tests preserve their accepted history.
 for(const p of siteLocales.filter(l=>l.code==='ar').flatMap(l=>l.pages.filter(p=>p.ar!=='/ar/blog/how-to-remind-someone-they-owe-you-money-politely/'&&p.ar!=='/ar/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/'&&p.ar!=='/ar/tools/roommate-expense-tracker-template/')))for(const l of siteLocales.filter(l=>['en','es','de','ar'].includes(l.code))){
  const route=l.code==='en'?p.en:l.pages.find(x=>x.en===p.en)[l.code];
  const file=route==='/'?'index.html':route.slice(1)+'index.html';
  const current=fs.readFileSync(file,'utf8');
  // English articles can evolve after localization; preserve renderer ownership,
  // while published translations retain their independently accepted history.
  const expected=l.code==='en'?current:execFileSync('git',['show',`a2eb93d:${file}`],{encoding:'utf8'});
  const actual=l.code==='en'?renderLocaleHtml(current,p.en,'en'):current;
  assert.equal(normalize(actual,route),normalize(expected,route),route);
 }
});
