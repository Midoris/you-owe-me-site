// Fixed event names only: input content and filenames never reach analytics.
const inputStages = new Map(Object.entries({paste:'input_text',image:'input_photo',csv:'input_csv',xlsx:'input_xlsx',docx:'input_docx',manual:'input_manual',recovery:'input_recovery'}));
const stages = new Set(['offer_viewed','offer_chosen','interpret_requested','interpret_ready','interpret_failed','transfer_prepared',...inputStages.values()]);
export function loanImportInputStage(format) { return inputStages.get(format) ?? null; }
export function loanImportEventName(stage) { return stages.has(stage) ? 'uomi_web_loan_' + stage : null; }
