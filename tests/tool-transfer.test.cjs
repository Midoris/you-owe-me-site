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
  assert.deepEqual([...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)].map(match=>[match[1],match[2]]), [['locale.js?v=es20261020','']]);
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
