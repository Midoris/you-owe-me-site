const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {prepare, config} = require('../scripts/tool-transfer.js');
const fixture = () => ({currency:'$', people:[{id:'alex',name:'Alex'},{id:'mia',name:'Mia'},{id:'sam',name:'Sam'}], expenses:[{id:'dinner',description:'Dinner',amount:'90',paidBy:'alex',includedPeople:['alex','mia','sam']}]});
test('released App Clip offer is enabled', () => assert.equal(config.enabled, true));
test('preserves unambiguous identity, costs and ambiguous dollar label', () => {const d=fixture(); d.people[1].name='Alex'; const p=prepare(d); assert.equal(p.currencyLabel,'$'); assert.equal(p.costs[0].amount,9000); assert.equal(p.participants.length,3);});
test('multi-payer and incomplete costs retain web result without upload', () => {const d=fixture(); d.expenses.push({...d.expenses[0],id:'taxi',paidBy:'mia'}); assert.equal(prepare(d),null); d.expenses[1].paidBy='alex'; d.expenses[1].amount=''; assert.equal(prepare(d),null);});
test('precision and capacity limits', () => {for(const amount of ['0','1.001','Infinity','1000000.01']) {const d=fixture(); d.expenses[0].amount=amount; assert.equal(prepare(d),null);} const d=fixture(); d.people.push({id:'four',name:'Four'},{id:'five',name:'Five'}); assert.equal(prepare(d),null);});
test('supported residual and unsupported accumulated rounding', () => {const d=fixture(); d.expenses[0].amount='10'; assert.ok(prepare(d)); d.expenses.push({...d.expenses[0],id:'second'}); assert.equal(prepare(d),null);});
test('private continuation allows only its local locale selector with no personal previews', () => {
  const html=fs.readFileSync('private-continuation/split/index.html','utf8');
  assert.ok(!/analytics|og:|app-argument/i.test(html));
  assert.equal((html.match(/<script\b/g)||[]).length,1);
  assert.deepEqual([...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)].map(match=>[match[1],match[2]]), [['locale.js?v=fr20261020','']]);
  assert.ok(html.includes('no-referrer') && html.includes('noindex,nofollow,noarchive'));
  const cfg=JSON.parse(fs.readFileSync('firebase.exp003.json'));
  for(const [key,value] of [['Cache-Control','no-store'],['Referrer-Policy','no-referrer'],['X-Robots-Tag','noindex, nofollow, noarchive']]) assert.ok(cfg.hosting.headers[0].headers.some(h=>h.key===key&&h.value===value));
  const policy=cfg.hosting.headers.find(h=>h.source==='/split/**').headers.find(h=>h.key==='Content-Security-Policy').value;
  assert.ok(policy.includes("script-src 'self'") && policy.includes("default-src 'none'") && !policy.includes('connect-src'));
  const selector=fs.readFileSync('private-continuation/split/locale.js','utf8');
  assert.ok(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage|location\.search|document\.cookie/.test(selector));
});

test('shared cross-language financial fixtures',()=>{
  for(const c of JSON.parse(fs.readFileSync('tests/fixtures/tool-transfer-fixtures.json','utf8'))){
    const state={currency:c.draft.currencyLabel,people:c.draft.participants,expenses:c.draft.costs.map(cost=>({id:cost.id,description:cost.label,amount:(cost.amount/100).toFixed(2),paidBy:cost.payerID,includedPeople:cost.participantIDs}))};
    if(c.expected)assert.deepEqual(prepare(state),c.draft,c.name);else assert.equal(prepare(state),null,c.name);
  }
});

test('rejects a native half-cent that disagrees with the existing browser answer',()=>{
  const d=fixture();d.people.pop();d.expenses[0].includedPeople=['alex','mia'];d.expenses[0].amount='0.29';
  assert.equal(Math.round((0.29/2)*100),14);assert.equal(prepare(d),null);
});

test('private continuation preserves accepted English/Spanish copy and all three no-JS sections', () => {
  const {createHash} = require('node:crypto');
  const html = fs.readFileSync('private-continuation/split/index.html', 'utf8');
  const accepted = {en: 'e3d45b24163dac74b4c1e91a4d7247efd13aab168234231770aefce4a668a34c', es: 'f5bd51c691f2c9a0db8dd32c5bfb292b421364154edf401215ebe9b0654bc464'};
  for (const [locale, digest] of Object.entries(accepted)) {
    const block = html.match(new RegExp(`<section id="${locale}"[\\s\\S]*?</section>`))[0];
    assert.equal(createHash('sha256').update(block).digest('hex'), digest, `${locale} original copy preserved`);
  }
  for (const locale of ['en', 'es', 'de']) {
    const opening = html.match(new RegExp(`<section id="${locale}"[^>]*>`))[0];
    assert.ok(!/\bhidden\b/.test(opening), `${locale} readable without JS`);
    assert.ok(opening.includes(`lang="${locale}"`) && opening.includes(`data-locale="${locale}"`));
  }
  assert.ok(html.includes('https://you-owe-me.com/de/tools/ausgaben-aufteilen/'));
  assert.ok(html.includes('Dein Übertragungslink läuft nach 24 Stunden ab.'));
  assert.ok(!/\?ref=|<form\b|<iframe\b/.test(html));
});

test('private fragment switching changes only language, title and visible section while retaining sole ref', async () => {
  const vm = require('node:vm');
  const {parseStaticPage} = await import('./helpers/static-dom.mjs');
  const html = fs.readFileSync('private-continuation/split/index.html', 'utf8');
  const selector = fs.readFileSync('private-continuation/split/locale.js', 'utf8');
  const document = parseStaticPage(html); document.documentElement = {lang: 'en'};
  for (const link of document.querySelectorAll('a')) link.removeAttribute = name => link.attributes.delete(name);
  const listeners = {};
  const location = {hash: '#de'};
  Object.defineProperty(location, 'search', {get() { throw new Error('must not read reference'); }});
  const context = {document, window: {location, addEventListener(type, fn) {listeners[type] = fn; }}};
  vm.runInNewContext(selector, context);
  for (const [fragment, locale, ariaLabel] of [['#de', 'de', 'Sprache der Seite'], ['#es', 'es', 'Idioma de la página'], ['#en', 'en', 'Page language'], ['#unrecognized', 'en', 'Page language'], ['', 'en', 'Page language']]) {
    location.hash = fragment; listeners.hashchange();
    assert.equal(document.documentElement.lang, locale);
    assert.equal(document.querySelector('[data-language-navigation]').getAttribute('aria-label'), ariaLabel);
    assert.equal(document.title, document.querySelector(`[data-locale="${locale}"]`).getAttribute('data-title'));
    for (const section of document.querySelectorAll('[data-locale]')) assert.equal(section.hidden, section.getAttribute('data-locale') !== locale);
    for (const link of document.querySelector('[data-language-navigation]').querySelectorAll('a')) {
      assert.equal(link.getAttribute('aria-current'), link.getAttribute('lang') === locale ? 'page' : null);
      const destination = new URL(link.getAttribute('href'), 'https://continue.you-owe-me.com/split/?ref=' + 'a'.repeat(64) + fragment);
      assert.deepEqual([...destination.searchParams.keys()], ['ref']);
      assert.equal(destination.searchParams.get('ref'), 'a'.repeat(64));
      assert.equal(destination.hash, '#' + link.getAttribute('lang'));
    }
  }
});
