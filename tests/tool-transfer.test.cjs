const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {prepare, config} = require('../scripts/tool-transfer.js');
const fixture = () => ({currency:'$', people:[{id:'alex',name:'Alex'},{id:'mia',name:'Mia'},{id:'sam',name:'Sam'}], expenses:[{id:'dinner',description:'Dinner',amount:'90',paidBy:'alex',includedPeople:['alex','mia','sam']}]});
test('release offer is disabled', () => assert.equal(config.enabled, false));
test('preserves unambiguous identity, costs and ambiguous dollar label', () => {const d=fixture(); d.people[1].name='Alex'; const p=prepare(d); assert.equal(p.currencyLabel,'$'); assert.equal(p.costs[0].amount,9000); assert.equal(p.participants.length,3);});
test('multi-payer and incomplete costs retain web result without upload', () => {const d=fixture(); d.expenses.push({...d.expenses[0],id:'taxi',paidBy:'mia'}); assert.equal(prepare(d),null); d.expenses[1].paidBy='alex'; d.expenses[1].amount=''; assert.equal(prepare(d),null);});
test('precision and capacity limits', () => {for(const amount of ['0','1.001','Infinity','1000000.01']) {const d=fixture(); d.expenses[0].amount=amount; assert.equal(prepare(d),null);} const d=fixture(); d.people.push({id:'four',name:'Four'},{id:'five',name:'Five'}); assert.equal(prepare(d),null);});
test('supported residual and unsupported accumulated rounding', () => {const d=fixture(); d.expenses[0].amount='10'; assert.ok(prepare(d)); d.expenses.push({...d.expenses[0],id:'second'}); assert.equal(prepare(d),null);});
test('private continuation has no analytics, inline scripts or personal previews', () => {const html=fs.readFileSync('private-continuation/split/index.html','utf8'); assert.ok(!/<script|analytics|og:|app-argument/i.test(html)); assert.ok(html.includes('no-referrer')); const cfg=JSON.parse(fs.readFileSync('firebase.exp003.json')); assert.ok(cfg.hosting.headers[0].headers.some(h=>h.key==='Cache-Control' && h.value==='no-store'));});

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
