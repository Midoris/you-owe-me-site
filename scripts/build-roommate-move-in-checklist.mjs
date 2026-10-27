// Regenerate with the bundled runtime. No project dependencies are required.
// ARTIFACT_NODE_MODULES can point to a different bundled node_modules directory.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const modules = process.env.ARTIFACT_NODE_MODULES || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require = createRequire(path.join(modules, 'artifact-loader.cjs'));
const { Workbook, SpreadsheetFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const repo = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = process.argv[3] || path.join(repo, 'docs/verification/outreach-pages-2026-10-27/roommate');
await fs.mkdir(path.join(repo, 'downloads'), { recursive: true });
await fs.mkdir(evidence, { recursive: true });
const headers = ['Room','Item','Decision','Owner or buyer','Expected cost','Actual cost','Currency','Agreed shares','Status','Needed by','Move-out agreement','Notes'];
const rooms = [
 ['Kitchen', ['Plates, bowls and mugs','Cutlery and cooking utensils','Pots and pans','Kettle or coffee maker','Food containers','Dish soap and towels']],
 ['Living and dining', ['Sofa or chairs','Table and chairs','Lamps','Rugs or curtains']],
 ['Bathroom', ['Shower curtain or bath mat','Toilet brush','Hand soap','Shared cleaning supplies']],
 ['Cleaning and laundry', ['Vacuum or broom','Mop and bucket','Drying rack','Laundry supplies']],
 ['Shared essentials', ['Internet router, if needed','Bins and bin bags','Basic tools','Extension leads, if suitable']],
 ['Personal items', ['Bed and bedding','Desk or personal furniture','Personal towels','Personal toiletries']],
];
const starter = rooms.flatMap(([room,items]) => items.map(item => [room,item,...Array(10).fill(null)]));
const workbook = Workbook.create();
const planner = workbook.worksheets.add('Move-in planner');
const example = workbook.worksheets.add('Example');
function base(sheet, end) {
 sheet.showGridLines = false;
 sheet.getRange(`A1:L${end}`).format = { font: { name: 'Arial', size: 11, color: '#212931' }, verticalAlignment: 'center', wrapText: true };
 const widths = [21,34,16,23,17,17,13,32,18,17,42,56];
 widths.forEach((width,i) => {sheet.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}${end}`).format.columnWidth=width;});
 sheet.getRange('A1:L1').merge(); sheet.getRange('A1:L1').format={fill:'#182B43',font:{name:'Arial',size:17,bold:true,color:'#FFFFFF'},rowHeight:46};
 sheet.getRange('A7:L7').values=[headers];
 sheet.getRange('A7:L7').format={fill:'#E7F2DC',font:{name:'Arial',size:11,bold:true,color:'#18212B'},horizontalAlignment:'center',verticalAlignment:'center',rowHeight:38,wrapText:true};
 for(let row=8;row<=end;row++) sheet.getRange(`A${row}:L${row}`).format={fill:row%2===0?'#FFFFFF':'#F1F5F9',rowHeight:40};
 sheet.getRange(`E8:F${end}`).setNumberFormat('0.00');
 sheet.getRange(`E8:F${end}`).format.horizontalAlignment='right';
 sheet.getRange(`J8:J${end}`).setNumberFormat('yyyy-mm-dd');
 sheet.getRange(`C8:C${end}`).dataValidation={rule:{type:'list',values:['','Undecided','Bring','Buy','Skip']}};
 sheet.getRange(`I8:I${end}`).dataValidation={rule:{type:'list',values:['','Not started','Bringing','Ordered','Ready','Skipped']}};
 sheet.freezePanes.freezeRows(7); sheet.freezePanes.freezeColumns(2);
}
function banner(sheet,row,text,height=28){sheet.getRange(`A${row}:L${row}`).merge();sheet.getRange(`A${row}`).values=[[text]];sheet.getRange(`A${row}:L${row}`).format.rowHeight=height;}
base(planner,107);
planner.getRange('A1').values=[['Roommate move-in planner']];
banner(planner,2,'List what you have before you buy. Agree on costs before recording anything as owed.');
banner(planner,3,'Bring = existing owner. Buy = person arranging the purchase. Leave unknown costs blank.');
banner(planner,4,'Keep ownership separate from repayment. This planner does not calculate balances or determine legal ownership.');
banner(planner,5,'Free resource: https://you-owe-me.com/tools/roommate-move-in-checklist/');
planner.getRange('A8:L33').values=starter;
const table = planner.tables.add('A7:L107',true,'RoommateMoveInPlanner');
table.style='TableStyleLight9'; table.showFilterButton=true;
// Direct formatting keeps the approved pale header and white/slate input rows.
planner.getRange('A7:L7').format.fill='#E7F2DC';
base(example,10);
example.getRange('A1').values=[['Example: keep ownership and money separate']];
banner(example,2,'Maya, Leo and Sam are moving in together. Maya brings her own kettle. They agree to buy a sofa for 240 USD and split that purchase equally.',44);
example.getRange('A8:L10').values=[
 ['Kitchen','Kettle','Bring','Maya',null,null,null,'No contribution agreed','Bringing',null,'Maya takes it when she leaves','Existing item; no new expense.'],
 ['Living and dining','Sofa — before purchase','Buy','Maya',240,null,'USD','Maya 80; Leo 80; Sam 80','Not started',null,'Discuss and agree before purchase','Planned cost only; nothing recorded as owed yet.'],
 ['Living and dining','Sofa — after purchase','Buy','Maya',240,240,'USD','Maya 80; Leo 80; Sam 80','Ready',null,'Review the agreement together at move-out','Maya paid. Leo and Sam each owe Maya 80 USD. Leo later pays 30 USD, leaving 50 USD; Sam still owes 80 USD.'],
];
example.getRange('A8:L10').format.rowHeight=84;
banner(example,12,'The two sofa rows show stages of the same purchase. In your own planner, update one row instead of entering the purchase twice.',38);
example.getRange('A12:L12').format={font:{name:'Arial',size:11,color:'#212931'},wrapText:true};
workbook.recalculate();
for (const [sheetName,range,name] of [['Move-in planner','A1:L5','planner-title'],['Example','A1:L5','example-title'],['Example','A12:L12','example-note'],['Move-in planner','A7:F15','planner-left'],['Move-in planner','G7:L15','planner-right'],['Example','A1:F12','example-left'],['Example','G7:L12','example-right']]) {
 const preview=await workbook.render({sheetName,range,scale:1.5,format:'png'});
 await fs.writeFile(path.join(evidence,`${name}.png`),new Uint8Array(await preview.arrayBuffer()));
}
const inspection=await workbook.inspect({kind:'region',sheetId:'Example',range:'A7:L10',maxChars:6000,tableMaxCols:12,tableMaxRows:4});
await fs.writeFile(path.join(evidence,'workbook-inspection.ndjson'),inspection.ndjson);
const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'final formula error scan'});
await fs.writeFile(path.join(evidence,'workbook-error-scan.ndjson'),errors.ndjson);
const out=await SpreadsheetFile.exportXlsx(workbook);
await out.save(path.join(repo,'downloads/roommate-move-in-checklist.xlsx'));
await fs.rename(path.join(repo,'downloads/roommate-move-in-checklist.xlsx.inspect.ndjson'),path.join(evidence,'export-inspection.ndjson')).catch(error => { if(error.code !== 'ENOENT') throw error; });
const csvrow = row => row.map(v => v == null ? '' : '"'+String(v).replaceAll('"','""')+'"').join(',');
await fs.writeFile(path.join(repo,'downloads/roommate-move-in-checklist.csv'),'\uFEFF'+[headers,...starter].map(csvrow).join('\r\n')+'\r\n');
console.log('Exported roommate move-in XLSX and CSV, with seven sheet detail renders.');
