import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loanImportInputStage,loanImportEventName} from './loan-import-analytics.mjs';
test('all input modes emit bounded names without new parameters or content',()=>{
  for(const [input,suffix] of Object.entries({paste:'text',image:'photo',csv:'csv',xlsx:'xlsx',docx:'docx',manual:'manual',recovery:'recovery'})){
    const event=loanImportEventName(loanImportInputStage(input));
    assert.equal(event,'uomi_web_loan_input_'+suffix);assert.ok(event.length<=40);
  }
  for(const input of ['Alex-private.jpg','__proto__','constructor','',null,undefined,{},'image_with_notes']){
    assert.equal(loanImportInputStage(input),null);assert.equal(loanImportEventName(input),null);
  }
});
test('existing funnel stages remain accepted; arbitrary event fields cannot enter the name',()=>{
  for(const stage of ['interpret_requested','interpret_ready','interpret_failed','transfer_prepared'])assert.equal(loanImportEventName(stage),'uomi_web_loan_'+stage);
  assert.equal(loanImportEventName({name:'input_photo',person:'private'}),null);
});
test('three diagnostic stages are event-only, bounded and carry no rejection or cancellation payload',()=>{
  for(const stage of ['continue_attempt','continue_rejected','import_cancelled']){
    const name=loanImportEventName(stage);assert.equal(name,'uomi_web_loan_'+stage);assert.ok(name.length<=40);
  }
  for(const stage of ['continue_rejected_private','import_cancelled_navigation','continue_attempt_100USD','import_saved',{},null])assert.equal(loanImportEventName(stage),null);
});
