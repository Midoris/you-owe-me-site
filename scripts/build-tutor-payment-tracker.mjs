// Rebuild with the bundled artifact-tool runtime; no repository dependencies.
// Usage: node scripts/build-tutor-payment-tracker.mjs [repo] [evidence-directory]
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const modules=process.env.ARTIFACT_NODE_MODULES || path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require=createRequire(path.join(modules,'artifact-loader.cjs'));
const {Workbook,SpreadsheetFile,FileBlob}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const repo=process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=process.argv[3] || path.join(repo,'docs/verification/tutor-payment-tracker-2026-10-27/workbook');
await fs.mkdir(path.join(repo,'downloads'),{recursive:true});await fs.mkdir(evidence,{recursive:true});
const ready='Ready — review the records before sharing or following up.';
const review='Review input checks before using balances.';
const ids=Array.from({length:30},(_,i)=>`A${String(i+1).padStart(3,'0')}`);
const headers=['Date','Account ID','Student / context','Description','Type','Amount','Reference / note'];
const wb=Workbook.create();
const accounts=wb.worksheets.add('Accounts'),entries=wb.worksheets.add('Entries'),example=wb.worksheets.add('Example');
const navy='#182B43', ink='#212931', blue='#205D92', red='#9C2630';
const money='0.00';
function base(sheet,end,widths) {
 sheet.showGridLines=false;
 sheet.getRange(`A1:H${end}`).format={font:{name:'Arial',size:11,color:ink},verticalAlignment:'center',wrapText:true};
 widths.forEach((width,i)=>{sheet.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}${end}`).format.columnWidth=width;});
 sheet.getRange('A1:H1').merge();sheet.getRange('A1:H1').format={font:{name:'Arial',size:17,bold:true,color:navy},rowHeight:42};
}
function banner(sheet,row,text,height=30) {
 sheet.getRange(`A${row}:H${row}`).merge();sheet.getRange(`A${row}`).values=[[text]];
 sheet.getRange(`A${row}:H${row}`).format.rowHeight=height;
}
function workingTable(sheet,end,tableName,labels) {
 sheet.getRange('A9:H9').values=[labels];
 const table=sheet.tables.add(`A9:H${end}`,true,tableName);table.style='TableStyleLight9';table.showFilterButton=true;
 sheet.getRange('A9:H9').format={fill:'#E7F2DC',font:{name:'Arial',size:11,bold:true,color:navy},rowHeight:42,horizontalAlignment:'center',wrapText:true};
 for(let r=10;r<=end;r++) sheet.getRange(`A${r}:H${r}`).format={fill:r%2===0?'#FFFFFF':'#F1F5F9',rowHeight:34};
 sheet.freezePanes.freezeRows(9);sheet.freezePanes.freezeColumns(2);
 sheet.getRange(`H10:H${end}`).conditionalFormats.add('expression',{formula:'LEFT(H10,5)="Check"',format:{fill:'#FCE8E8',font:{color:red,bold:true}}});
}
base(accounts,45,[16,30,20,17,17,18,22,27]);base(entries,209,[17,17,26,38,18,18,38,27]);base(example,18,[18,30,20,20,20,25,17,17]);
accounts.getRange('A1').values=[['Tutor payment tracker']];
banner(accounts,2,'Record each charge and received payment once. Keep one account for each payer or household.');
accounts.getRange('A3').values=[['Currency']];accounts.getRange('B3').values=[['USD']];
accounts.getRange('D3').values=[['Period (label only)']];accounts.getRange('E3:H3').merge();accounts.getRange('A3:H3').format.rowHeight=34;
for(const [r,t] of [[4,'All Entries rows are included. The period label does not filter dates. Use one currency per file.'],[5,'Keep Account IDs unchanged. Opening balance means an earlier amount still owed; do not enter the same history again.'],[6,'Prepared capacity: 30 accounts and 200 entries. Rows outside those ranges are not included automatically.'],[8,'Edit the input columns; shaded calculation columns update automatically.'],[42,'A negative balance is a money-record exception to review. It does not calculate prepaid lessons or authorize a refund.'],[43,'To start a new period, copy a checked closing amount owed once into Opening balance. Keep the old file for its history.'],[44,"Share only the relevant payer's details. This workbook may contain several families' information."],[45,'Guide: https://you-owe-me.com/tools/tutor-payment-tracker-template/']]) banner(accounts,r,t);
accounts.getRange('A7:H7').merge();accounts.getRange('A7:H7').format={font:{name:'Arial',size:11,bold:true,color:navy},rowHeight:34};
workingTable(accounts,39,'TutorAccounts',['Account ID','Payer / household','Opening balance','Charges','Payments','Remaining','Status','Check']);
accounts.getRange('A10:A39').values=ids.map(id=>[id]);
accounts.getRange('C10:F39').setNumberFormat(money);
accounts.getRange('C10:F39').format.horizontalAlignment='right';
accounts.getRange('A10:C39').format.font={name:'Arial',size:11,color:blue};
accounts.getRange('B3').format={fill:'#EAF4FF',font:{name:'Arial',size:11,color:blue}};
accounts.getRange('E3:H3').format={fill:'#EAF4FF',font:{name:'Arial',size:11,color:blue}};
accounts.getRange('D10:H39').format.fill='#F1F5F9';
accounts.getRange('G10:G39').conditionalFormats.add('expression',{formula:'$G10="Outstanding"',format:{fill:'#FFF3D9',font:{color:'#74551C'}}});
accounts.getRange('G10:G39').conditionalFormats.add('expression',{formula:'$G10="Settled"',format:{fill:'#E7F2E7',font:{color:'#346345'}}});
for(const text of ['Review credit','Review inputs'])accounts.getRange('G10:G39').conditionalFormats.add('expression',{formula:`$G10="${text}"`,format:{fill:'#FCE8E8',font:{color:red,bold:true}}});
accounts.getRange('A7:H7').conditionalFormats.add('expression',{formula:'$A$7="Review input checks before using balances."',format:{fill:'#FCE8E8',font:{color:red,bold:true}}});
entries.getRange('A1').values=[['Charges and payments']];
for(const [r,t] of [[2,'One row per charge or actual payment. Use a positive amount and choose Charge or Payment.'],[3,'Record one received payment once, even when it covers several lessons. Add the context in Description or Reference / note.'],[4,'Dates do not filter the summary. Add only the records that belong in this file, and do not duplicate an opening balance.'],[5,'Fix Check messages before using the Accounts balances. Blank rows are allowed.'],[6,'Keep each payer\'s records private. This file does not process payments, issue invoices or sync with the app.'],[8,'Edit Date through Reference / note; Check updates automatically.']])banner(entries,r,t);
workingTable(entries,209,'TutorEntries',[...headers,'Check']);
entries.getRange('A10:A209').setNumberFormat('yyyy-mm-dd');entries.getRange('F10:F209').setNumberFormat(money);
entries.getRange('A10:G209').format.font={name:'Arial',size:11,color:blue};entries.getRange('H10:H209').format.fill='#F1F5F9';
entries.getRange('F10:F209').format.horizontalAlignment='right';
entries.getRange('B10:B209').dataValidation={rule:{type:'list',values:['',...ids]}};
entries.getRange('E10:E209').dataValidation={rule:{type:'list',values:['','Charge','Payment']}};
// IDs are reserved; Accounts input checks are independent of Entries.
const allowedId=ref=>"OR("+ids.map(id=>ref+"=\""+id+"\"").join(",")+")";
function accountCheck(r){return `=IF(ISERROR(B${r}),"Check payer name",IF(LEN(TRIM(SUBSTITUTE(CLEAN(B${r}),CHAR(160)," ")))=0,IF(ISERROR(C${r}),"Check payer name",IF(C${r}="","",IF(ISNUMBER(C${r}),IF(C${r}=0,"","Check payer name"),"Check payer name"))),IF(ISERROR(A${r}),"Check account ID",IF(OR(NOT(EXACT(A${r},UPPER(A${r}))),NOT(${allowedId(`A${r}`)})),"Check account ID",IF(COUNTIF($A$10:$A$39,A${r})<>1,"Check duplicate ID",IF(ISERROR(C${r}),"Check opening balance",IF(C${r}="","OK",IF(NOT(ISNUMBER(C${r})),"Check opening balance",IF(OR(C${r}<0,ROUND(C${r},2)<>C${r}),"Check opening balance","OK")))))))))`;}
accounts.getRange('H10:H39').formulas=ids.map((_,i)=>[accountCheck(i+10)]);
function entryCheck(r){return `=IF(COUNTA(A${r}:G${r})=0,"",IF(ISERROR(A${r}),"Check date",IF(NOT(ISNUMBER(A${r})),"Check date",IF(OR(A${r}<1,A${r}>=2958466,INT(A${r})=60),"Check date",IF(ISERROR(B${r}),"Check account ID",IF(OR(NOT(EXACT(B${r},UPPER(B${r}))),COUNTIFS('Accounts'!$A$10:$A$39,B${r},'Accounts'!$H$10:$H$39,\"OK\")<>1),"Check account ID",IF(ISERROR(D${r}),"Check description",IF(LEN(TRIM(SUBSTITUTE(CLEAN(D${r}),CHAR(160)," ")))=0,"Check description",IF(ISERROR(E${r}),"Check type",IF(NOT(OR(EXACT(E${r},"Charge"),EXACT(E${r},"Payment"))),"Check type",IF(ISERROR(F${r}),"Check amount",IF(NOT(ISNUMBER(F${r})),"Check amount",IF(OR(F${r}<=0,ROUND(F${r},2)<>F${r}),"Check amount","OK")))))))))))))`;}
entries.getRange('H10:H209').formulas=Array.from({length:200},(_,i)=>[entryCheck(i+10)]);
// Every prepared input check must be OK or blank. This invariant avoids
// wildcard COUNTIF evaluator defects and rejects unexpected strings/errors.
accounts.getRange('A7').formulas=[[`=IF(ISERROR(B3),\"${review}\",IF(OR(LEN(TRIM(SUBSTITUTE(CLEAN(B3),CHAR(160)," ")))=0,COUNTIF(H10:H39,\"OK\")+COUNTBLANK(H10:H39)<>30,COUNTIF('Entries'!H10:H209,\"OK\")+COUNTBLANK('Entries'!H10:H209)<>200),\"${review}\",\"${ready}\"))`]];
for(let r=10;r<=39;r++) {
 const noName=`IF(ISERROR(B${r}),TRUE,LEN(TRIM(SUBSTITUTE(CLEAN(B${r}),CHAR(160)," ")))=0)`;
 const gated=`OR(${noName},$A$7<>"${ready}")`;
 const sum=type=>`SUMIFS('Entries'!$F$10:$F$209,'Entries'!$B$10:$B$209,$A${r},'Entries'!$E$10:$E$209,"${type}",'Entries'!$H$10:$H$209,"OK")`;
 accounts.getRange(`D${r}:G${r}`).formulas=[[`=IF(${gated},"",${sum('Charge')})`,`=IF(${gated},"",${sum('Payment')})`,`=IF(${gated},"",ROUND(SUM(C${r},D${r})-E${r},2))`,`=IF(AND(${noName},H${r}=""),"",IF($A$7<>"${ready}","Review inputs",IF(F${r}>0,"Outstanding",IF(F${r}=0,"Settled","Review credit"))))`]];
}
example.getRange('A1').values=[['Example: charges and part-payments']];
for(const [r,t] of [[2,'Fictional record: Alex Morgan pays tutor Taylor Reed. Currency: USD. Opening balance: 0.00.'],[3,"The five rows below match the worked example on the guide and the app's example statement."],[4,'This example is separate from Accounts and Entries. Delete or change it without affecting your working records.'],[15,'The payments total 80 USD; they are not extra charges. The later session raises the balance from 80 USD to 120 USD.'],[16,'Record one payment once. This is a money balance, not a count of prepaid lessons.'],[17,'Example statement from the app: https://you-owe-me.com/downloads/samples/you-owe-me-fictional-client-statement.pdf'],[18,'The workbook does not generate this PDF automatically. It is a payment-record summary, not a formal invoice.']])banner(example,r,t);
example.getRange('A6:F6').values=[['Date','Record','Charge (USD)','Payment (USD)','Balance (USD)','Context']];
example.getRange('A6:F6').format={fill:'#E7F2DC',font:{name:'Arial',size:11,bold:true,color:navy},rowHeight:38,horizontalAlignment:'center'};
example.getRange('A7:F11').values=[[new Date('2026-10-02T00:00:00Z'),'Two sessions',80,null,null,'Alex Morgan'],[new Date('2026-10-06T00:00:00Z'),'Two sessions',80,null,null,'Alex Morgan'],[new Date('2026-10-08T00:00:00Z'),'Payment received',null,50,null,'Alex Morgan'],[new Date('2026-10-11T00:00:00Z'),'Payment received',null,30,null,'Alex Morgan'],[new Date('2026-10-15T00:00:00Z'),'Another session',40,null,null,'Alex Morgan']];
example.getRange('A7:A11').setNumberFormat('yyyy-mm-dd');example.getRange('C7:E13').setNumberFormat(money);
example.getRange('C7:E13').format.horizontalAlignment='right';
example.getRange('E7:E11').formulas=Array.from({length:5},(_,i)=>[`=SUM(${i===0?'':`E${i+6},`}C${i+7})-SUM(D${i+7})`]);
example.getRange('A7:F11').format.rowHeight=34;example.getRange('E7:E11').format.fill='#F1F5F9';
example.getRange('B13').values=[['Totals']];example.getRange('C13:E13').formulas=[['=SUM(C7:C11)','=SUM(D7:D11)','=E11']];
example.getRange('B13:F13').format={font:{name:'Arial',size:11,bold:true,color:navy},fill:'#E7F2DC',rowHeight:34};
wb.recalculate();
assert.equal(accounts.getRange('A7').values[0][0],ready);
assert.deepEqual(example.getRange('E7:E11').values.flat(),[80,160,110,80,120]);
assert.deepEqual(example.getRange('C13:E13').values[0],[200,80,120]);
for(const [sheetName,range,name] of [['Accounts','A1:H14','accounts-overview'],['Accounts','A42:H45','accounts-notes'],['Entries','A1:H14','entries-overview'],['Example','A1:H18','example']]) {
 const blob=await wb.render({sheetName,range,scale:1.5,format:'png'});await fs.writeFile(path.join(evidence,`${name}.png`),new Uint8Array(await blob.arrayBuffer()));
}
const scan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'blank template formula error scan'});
await fs.writeFile(path.join(evidence,'formula-error-scan.ndjson'),scan.ndjson);
for(const sheetName of ['Accounts','Entries','Example']){const inspect=await wb.inspect({kind:'region',sheetId:sheetName,range:sheetName==='Example'?'A6:F13':'A7:H12',maxChars:4500,tableMaxRows:7,tableMaxCols:8});await fs.writeFile(path.join(evidence,`${sheetName.toLowerCase()}-inspection.ndjson`),inspect.ndjson);}
const output=path.join(repo,'downloads/tutor-payment-tracker-template.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(output);
await fs.rename(output+'.inspect.ndjson',path.join(evidence,'export-inspection.ndjson')).catch(e=>{if(e.code!=='ENOENT')throw e;});
await fs.writeFile(path.join(repo,'downloads/tutor-payment-tracker-template.csv'),['Date','Payer / household','Student / context','Description','Type','Amount','Currency','Reference / note'].join(',')+'\r\n,,,,,,,\r\n','utf8');
// Reopen the actual download bytes, then mutate only the imported disposable
// workbook. Expected balances come from an independent integer-cents oracle.
const checkBook=await SpreadsheetFile.importXlsx(await FileBlob.load(output));
const ca=checkBook.worksheets.getItem('Accounts'),ce=checkBook.worksheets.getItem('Entries');
const cases=[];
function reset(){ca.getRange('A10:A39').values=ids.map(id=>[id]);ca.getRange('B10:C39').clear({applyTo:'contents'});ca.getRange('B3').values=[['USD']];ce.getRange('A10:G211').clear({applyTo:'contents'});ce.getRange('H209').formulas=[[entryCheck(209)]];}
const cents=v=>Math.round((v||0)*100);
function oracle(opening,events){return (cents(opening)+events.reduce((total,e)=>total+(e[4]==='Charge'?cents(e[5]):-cents(e[5])),0))/100;}
const date=46300; // Synthetic numeric spreadsheet date used only in tests.
const event=(id,type,amount,description='Synthetic test')=>[date,id,null,description,type,amount,null];
function run(name,setup,verify){reset();setup();checkBook.recalculate();try{verify();}catch(error){console.error(name,JSON.stringify(ca.getRange('A7:H11').values),JSON.stringify(ce.getRange('A10:H10').values));throw error;}cases.push({name,result:'pass'});}
function expectBalance(row,value,status){assert.equal(ca.getRange(`F${row}`).values[0][0],value);if(status)assert.equal(ca.getRange(`G${row}`).values[0][0],status);}
function expectBlocked(checkCell,text){assert.equal(ca.getRange('A7').values[0][0],review);assert.deepEqual(ca.getRange('D10:F11').values,[['','',''],['','','']]);assert.equal(ca.getRange('G10').values[0][0],'Review inputs');if(checkCell)assert.equal((checkCell.startsWith('Accounts!')?ca:ce).getRange(checkCell.split('!')[1]).values[0][0],text);}
const nameFirst=()=>{ca.getRange('B10:C10').values=[['Payer one',20]];};
run('two named accounts isolated; opening 20 plus 80 less 30 equals 70',()=>{nameFirst();ca.getRange('B11').values=[['Payer two']];ce.getRange('A10:G12').values=[event('A001','Charge',80),event('A001','Payment',30),event('A002','Charge',7.25)];},()=>{expectBalance(10,oracle(20,[event('A001','Charge',80),event('A001','Payment',30)]),'Outstanding');expectBalance(11,7.25);});
const exampleEvents=[event('A001','Charge',80),event('A001','Charge',80),event('A001','Payment',50),event('A001','Payment',30),event('A001','Charge',40)];
run('worked example charges 200 payments 80 remaining 120',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G14').values=exampleEvents;},()=>{assert.deepEqual(ca.getRange('D10:F10').values[0],[200,80,oracle(0,exampleEvents)]);});
run('one transfer covering multiple charges counted once; settled zero visible',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G12').values=[event('A001','Charge',40),event('A001','Charge',60),event('A001','Payment',100)];},()=>{expectBalance(10,0,'Settled');assert.equal(ca.getRange('E10').values[0][0],100);});
run('overpayment remains negative with Review credit',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G11').values=[event('A001','Charge',40),event('A001','Payment',50)];},()=>expectBalance(10,-10,'Review credit'));
const invalids=[['missing date',0,null,'Check date'],['text date',0,'2026-10-02','Check date'],['too early date',0,0,'Check date'],['Excel fictitious leap day',0,60,'Check date'],['too late date',0,2958466,'Check date'],['unknown account',1,'A999','Check account ID'],['unnamed account',1,'A003','Check account ID'],['blank description',3,'  ','Check description'],['unknown type',4,'Transfer','Check type'],['lowercase type',4,'charge','Check type'],['missing amount',5,null,'Check amount'],['text amount',5,'30','Check amount'],['zero amount',5,0,'Check amount'],['negative amount',5,-1,'Check amount'],['too many decimals',5,1.001,'Check amount']];
for(const [label,col,value,message]of invalids)run(label+' globally blocks balances',()=>{nameFirst();ca.getRange('B11').values=[['Payer two']];const row=event('A001','Charge',80);row[col]=value;ce.getRange('A10:G10').values=[row];},()=>expectBlocked('Entries!H10',message));
run('duplicate named account IDs globally block',()=>{nameFirst();ca.getRange('A11:B11').values=[['A001','Payer two']];},()=>expectBlocked('Accounts!H10','Check duplicate ID'));
run('unused reserved duplicate blocks named account',()=>{nameFirst();ca.getRange('A11:C11').values=[['A001','   ',0]];},()=>{expectBlocked('Accounts!H10','Check duplicate ID');assert.equal(ca.getRange('H11').values[0][0],'');});
run('whitespace-only payer with original reserved ID remains unused',()=>{nameFirst();ca.getRange('B11:C11').values=[['   ',0]];},()=>{expectBalance(10,20);assert.equal(ca.getRange('H11').values[0][0],'');assert.equal(ca.getRange('G11').values[0][0],'');});
run('lowercase entry ID blocks',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G10').values=[event('a001','Charge',4.56)];},()=>expectBlocked('Entries!H10','Check account ID'));
run('blank working rows and optional fields allowed',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A20:G20').values=[event('A001','Charge',1.25)];},()=>{expectBalance(10,1.25);assert.equal(ce.getRange('H10').values[0][0],'');assert.equal(ce.getRange('H20').values[0][0],'OK');});
run('blank currency blocks',nameFirst,()=>{ca.getRange('B3').clear({applyTo:'contents'});checkBook.recalculate();expectBlocked();});
run('whitespace currency blocks',()=>{nameFirst();ca.getRange('B3').values=[['   ']];},()=>expectBlocked());
for(const [label,input,message]of [['negative opening',-1,'Check opening balance'],['text opening','20','Check opening balance'],['too many opening decimals',1.001,'Check opening balance']])run(label,()=>{ca.getRange('B10:C10').values=[['Payer one',input]];},()=>expectBlocked('Accounts!H10',message));
run('opening without payer blocks',()=>ca.getRange('C10').values=[[20]],()=>{assert.equal(ca.getRange('H10').values[0][0],'Check payer name');assert.equal(ca.getRange('G10').values[0][0],'Review inputs');assert.equal(ca.getRange('A7').values[0][0],review);});
run('lowercase account ID blocks',()=>{nameFirst();ca.getRange('A10').values=[['a001']];},()=>expectBlocked('Accounts!H10','Check account ID'));
run('sorting row order leaves totals invariant',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G14').values=[...exampleEvents].reverse();},()=>expectBalance(10,oracle(0,exampleEvents)));
run('last prepared account and entry included; outside entry excluded',()=>{ca.getRange('B39').values=[['Last payer']];ce.getRange('A209:G209').values=[event('A030','Charge',12.34)];ce.getRange('A210:G210').values=[event('A030','Charge',99)];},()=>{expectBalance(39,12.34);assert.equal(ce.getRange('H209').values[0][0],'OK');});
run('numeric date boundaries and time component supported',()=>{ca.getRange('B10').values=[['Payer one']];const first=event('A001','Charge',1.01),last=event('A001','Payment',0.01);first[0]=1;last[0]=2958465.75;ce.getRange('A10:G11').values=[first,last];},()=>{expectBalance(10,1);assert.deepEqual(ce.getRange('H10:H11').values,[['OK'],['OK']]);});
run('rounding reconciles cent amounts',()=>{ca.getRange('B10').values=[['Payer one']];ce.getRange('A10:G12').values=[event('A001','Charge',0.1),event('A001','Charge',0.2),event('A001','Payment',0.3)];},()=>expectBalance(10,0,'Settled'));
run('input Excel error is human-readable and blocks',()=>{nameFirst();ce.getRange('A10:G10').values=[event('A001','Charge',80)];ce.getRange('F10').formulas=[['=1/0']];},()=>expectBlocked('Entries!H10','Check amount'));
run('unexpected check formula error blocks global readiness',()=>{nameFirst();ce.getRange('H209').formulas=[['=1/0']];},()=>expectBlocked());
run('unknown check text blocks readiness invariant',()=>{nameFirst();ce.getRange('H209').values=[['Unexpected check text']];},()=>expectBlocked());
run('tabs newline and nonbreaking spaces are blank payer text',()=>{nameFirst();ca.getRange('B11').values=[[' \t\n\u00a0 ']];},()=>{expectBalance(10,20);assert.equal(ca.getRange('H11').values[0][0],'');});
run('whitespace description rejects pasted nonbreaking/control spaces',()=>{nameFirst();ce.getRange('A10:G10').values=[event('A001','Charge',80,' \t\n\u00a0 ')];},()=>expectBlocked('Entries!H10','Check description'));
run('currency whitespace rejects pasted nonbreaking/control spaces',()=>{nameFirst();ca.getRange('B3').values=[[' \t\n\u00a0 ']];},()=>expectBlocked());
// Representative state previews come from this disposable imported workbook only.
reset();ca.getRange('B10:C11').values=[['Synthetic payer one',20],['Synthetic payer two',null]];ce.getRange('A10:G12').values=[event('A001','Charge',80),event('A001','Payment',30),event('A002','Payment',5)];ca.getRange('B12').values=[['Synthetic settled payer']];checkBook.recalculate();
for(const [sheetName,range,name]of [['Accounts','A7:H13','calculated-valid-state']]){const blob=await checkBook.render({sheetName,range,scale:1.5,format:'png'});await fs.writeFile(path.join(evidence,name+'.png'),new Uint8Array(await blob.arrayBuffer()));}
ce.getRange('E10').values=[['Transfer']];checkBook.recalculate();
for(const [sheetName,range,name]of [['Accounts','A7:H12','calculated-error-state'],['Entries','A9:H12','entry-error-state']]){const blob=await checkBook.render({sheetName,range,scale:1.5,format:'png'});await fs.writeFile(path.join(evidence,name+'.png'),new Uint8Array(await blob.arrayBuffer()));}
await fs.writeFile(path.join(evidence,'formula-tests.json'),JSON.stringify({engine:'Bundled @oai/artifact-tool; imported actual exported XLSX bytes. No native Excel, Google Sheets or Apple Numbers interaction.',oracle:'Separate integer-cents JavaScript arithmetic; exact string/status assertions.',cases},null,2)+'\n');
console.log(`Exported tutor tracker XLSX/CSV; ${cases.length} imported-file evaluator cases passed.`);
