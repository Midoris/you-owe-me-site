import test from 'node:test';
import assert from 'node:assert/strict';
import {loanAllowanceMessage,LoanImportLimitError} from './loan-import-errors.mjs';
test('daily allowance shows local reset time without retention promises',()=>{
 const now=Date.UTC(2026,8,15,23,30), seconds=1800;
 for(const reason of ['service','network']) {
  const message=loanAllowanceMessage(String(seconds),now,reason);
  assert.ok(message.includes(new Date(now+seconds*1000).toLocaleString()));
  assert.ok(!message.includes('kept')); assert.ok(!message.includes('AI'));
  assert.equal(message.includes('network'),reason==='network');
 }
});
test('unusable retry time is safely omitted',()=>{
 for(const value of [null,'','bad','0','-1','Infinity','999999999999']) {
  const message=loanAllowanceMessage(value,0);assert.ok(message.includes('later'));assert.ok(!message.includes('Invalid'));
 }
});
test('temporary pressure does not imply tomorrow and old responses still work',()=>{
 assert.match(new LoanImportLimitError({error:'busy',limitReason:'temporary'},'120').message,/few minutes/);
 assert.match(new LoanImportLimitError({error:'busy'},null).message,/few minutes/);
 assert.match(new LoanImportLimitError({error:'daily_limit'},'120').message,/today’s limit/);
 assert.match(new LoanImportLimitError({error:'daily_limit',limitReason:'network'},'120').message,/network/);
});
