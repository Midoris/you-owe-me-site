const test = require('node:test');
const assert = require('node:assert/strict');
const { prepare } = require('./tool-transfer.js');
function state(amount) {
  return { currency: 'USD', people: [{id:'a',name:'Alex أحمد'},{id:'b',name:'Mia'},{id:'c',name:'Mia'}],
    expenses: [{id:'e',description:'Synthetic split',amount,paidBy:'a',includedPeople:['a','b','c']}] };
}
test('native import is withheld when rounded debts exceed the browser settlement credit', () => {
  assert.equal(prepare(state('90.50')), null);
  assert.equal(prepare(state('0.05')), null);
  const exact = prepare(state('90.60'));
  assert.equal(exact.costs[0].amount, 9060);
  assert.deepEqual(exact.participants.map(p=>p.name), ['Alex أحمد','Mia','Mia']);
});
test('accepted residual and precision fixtures keep their existing eligibility and values', () => {
  assert.equal(prepare(state('10')).costs[0].amount, 1000);
  assert.equal(prepare(state('90')).costs[0].amount, 9000);
  const pair = state('0.29'); pair.people.pop(); pair.expenses[0].includedPeople.pop();
  assert.equal(prepare(pair), null);
});
