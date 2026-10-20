const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAmount } = require('./arabic-number-input.js');

test('Arabic numeric boundary preserves signs, digits, grouping and decimal precision', () => {
  for (const [raw, canonical] of [
    ['98', '98'], ['٩٨', '98'], ['۹۸', '98'], [' ١٢٣٤٫٥٠ ', '1234.50'],
    ['١٬٢٣٤٫٥٠', '1234.50'], ['1,234.50', '1234.50'], ['١٢٣٤.٥٠', '1234.50'],
    ['-١٢٫٥٠', '-12.50'], ['٠', '0'], ['٠٫٢٩', '0.29'], ['0.001', '0.001'],
    ['١٢٬٣٤٥٬٦٧٨٫٩٠', '12345678.90'], ['1٢۳.٤٥', '123.45'],
  ]) assert.equal(normalizeAmount(raw), canonical, raw);
});

test('ambiguous separators and malformed values never silently become positive money', () => {
  for (const raw of ['', ' ', '1,2', '١٬٢٣', '1.234,50', '١٫٢٫٣', '١٬٢٣٤.٥٠',
    '١,٢٣٤٫٥٠', '1 234.50', '١\u00a0٢٣٤٫٥٠', 'NaN', 'Infinity', '1e2', '+10',
    '−10', '(10)', '1/2', '1,234,56', '<b>10</b>', '10 USD', '1.']) {
    assert.equal(normalizeAmount(raw), null, raw);
  }
  assert.equal(normalizeAmount(Number.POSITIVE_INFINITY), null);
});
