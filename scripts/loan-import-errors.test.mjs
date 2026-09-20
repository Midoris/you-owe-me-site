import test from 'node:test';
import assert from 'node:assert/strict';
import {loanAllowanceMessage} from './loan-import-errors.mjs';
test('daily allowance uses server retry time and retains manual alternative',()=>{
 const now=Date.UTC(2026,8,15,23,30), seconds=1800;
 const message=loanAllowanceMessage(String(seconds),now);
 assert.ok(message.includes(new Date(now+seconds*1000).toLocaleString()));
 assert.ok(message.includes('Your input is kept')); assert.ok(message.includes('manually'));
});
test('missing retry time never creates an invalid date',()=>{
 for(const value of [null,'','bad','0','-1']) {
  const message=loanAllowanceMessage(value,0);assert.ok(message.includes('tomorrow'));assert.ok(!message.includes('Invalid'));
 }
});
