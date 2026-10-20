const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {normalizeAmount} = require('./french-number-input.js');
const fixtures = JSON.parse(fs.readFileSync('tests/fixtures/french-number-input-fixtures.json','utf8'));
test('French boundary follows independently authored valid, ambiguous and malformed fixtures',()=>{
  for(const [raw,canonical] of fixtures.accepted) assert.equal(normalizeAmount(raw),canonical,JSON.stringify(raw));
  for(const raw of fixtures.formatRejected) assert.equal(normalizeAmount(raw),null,JSON.stringify(raw));
  for(const raw of fixtures.nonPositiveInvalidForCalculation) assert.ok(Number(normalizeAmount(raw))<=0,raw);
});
