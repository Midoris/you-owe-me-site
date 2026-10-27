#!/usr/bin/env node
// Static fictional source files for the loan-import tutorial. No provider calls.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const runtime = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies');
const require = createRequire(path.join(runtime, 'node/node_modules/.resolve.cjs'));
const {Workbook, SpreadsheetFile, FileBlob} = await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
const root = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewDir = process.argv[3];
const out = path.join(root, 'downloads/examples');
await fs.mkdir(out, {recursive: true});
export const headers = ['Date','Person','Entry','Amount','Currency','Note'];
export const rows = [
  ['2026-01-10','Jordan','Initial lending',1200,'USD','Alex lent Jordan money. One interest-free loan.'],
  ['2026-02-12','Jordan','Repayment received',150,'USD','Jordan repaid Alex.'],
  ['2026-03-20','Jordan','Repayment received',300,'USD','Jordan repaid Alex.'],
  ['2026-04-02','Jordan','Additional lending',100,'USD','Alex lent Jordan more on the same loan.'],
];
const notes = 'I am Alex. I lent money to Jordan. This is one interest-free loan in USD.\n2026-01-10: I lent Jordan 1200 USD.\n2026-02-12: Jordan repaid me 150 USD.\n2026-03-20: Jordan repaid me 300 USD.\n2026-04-02: I lent Jordan another 100 USD on the same loan.\nThese are actual events. No future repayment schedule is included.\n';
const csvCell = value => /[",\r\n]/.test(String(value)) ? '"'+String(value).replaceAll('"','""')+'"' : String(value);
await fs.writeFile(path.join(out,'loan-history-import-example.csv'), [headers,...rows].map(row=>row.map(csvCell).join(',')).join('\n')+'\n');
await fs.writeFile(path.join(out,'loan-history-import-example.txt'), notes);
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Loan history');
sheet.getRange('A1:F5').values = [headers,...rows];
sheet.getRange('A1:F5').format.font = {name:'Aptos',size:12,color:'#212931'};
sheet.getRange('A1:F5').format.verticalAlignment = 'center';
sheet.getRange('A1:F5').format.wrapText = true;
sheet.getRange('A1:F1').format.fill = '#AFE67E';
sheet.getRange('A1:F1').format.font = {name:'Aptos',size:12,bold:true,color:'#18212B'};
sheet.getRange('A1:F1').format.rowHeight = 30;
sheet.getRange('A2:F5').format.rowHeight = 45;
for(const [col,width] of [['A',15],['B',14],['C',25],['D',13],['E',13],['F',58]]) sheet.getRange(`${col}1:${col}5`).format.columnWidth=width;
sheet.getRange('D2:D5').setNumberFormat('#,##0');
sheet.freezePanes.freezeRows(1);
sheet.showGridLines = true;
workbook.recalculate();
const check = await workbook.inspect({kind:'table',range:"'Loan history'!A1:F5",include:'values,formulas',tableMaxRows:5,tableMaxCols:6,maxChars:5000});
console.log(check.ndjson);
const xlsxPath = path.join(out,'loan-history-import-example.xlsx');
await (await SpreadsheetFile.exportXlsx(workbook)).save(xlsxPath);
// Normalize exported document properties and ZIP times to a reproducible public fixture.
// The workbook intentionally has no formulas, external links or hidden content.
const patch = String.raw`import sys,xml.etree.ElementTree as E
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
from pathlib import Path
p=Path(sys.argv[1]); target=p.with_suffix('.tmp.xlsx')
core=b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>You Owe Me</dc:creator><cp:lastModifiedBy>You Owe Me</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-10-27T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-10-27T00:00:00Z</dcterms:modified></cp:coreProperties>'
with ZipFile(p) as source,ZipFile(target,'w',ZIP_DEFLATED) as dest:
 for name in source.namelist():
  data=core if name=='docProps/core.xml' else source.read(name)
  if name=='[Content_Types].xml':
   ns='http://schemas.openxmlformats.org/package/2006/content-types'; E.register_namespace('',ns); tree=E.fromstring(data)
   E.SubElement(tree,'{'+ns+'}Override',{'PartName':'/docProps/core.xml','ContentType':'application/vnd.openxmlformats-package.core-properties+xml'})
   data=E.tostring(tree,encoding='utf-8',xml_declaration=True)
  elif name=='_rels/.rels':
   ns='http://schemas.openxmlformats.org/package/2006/relationships'; E.register_namespace('',ns); tree=E.fromstring(data)
   E.SubElement(tree,'{'+ns+'}Relationship',{'Type':'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties','Target':'/docProps/core.xml','Id':'CoreProperties'})
   data=E.tostring(tree,encoding='utf-8',xml_declaration=True)
  elif name=='xl/worksheets/sheet1.xml':
   ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main'; E.register_namespace('',ns); tree=E.fromstring(data)
   view=tree.find('.//{'+ns+'}sheetView')
   for pane in list(view.findall('{'+ns+'}pane')): view.remove(pane)
   view.insert(0,E.Element('{'+ns+'}pane',{'ySplit':'1','topLeftCell':'A2','activePane':'bottomLeft','state':'frozen'}))
   data=E.tostring(tree,encoding='utf-8',xml_declaration=True)
  info=ZipInfo(name,(2026,10,27,0,0,0)); info.compress_type=ZIP_DEFLATED; dest.writestr(info,data)
 if 'docProps/core.xml' not in source.namelist():
  info=ZipInfo('docProps/core.xml',(2026,10,27,0,0,0)); info.compress_type=ZIP_DEFLATED; dest.writestr(info,core)
target.replace(p)`;
const patched = spawnSync(path.join(runtime,'python/bin/python3'), ['-c',patch,xlsxPath], {encoding:'utf8'});
if(patched.status!==0) throw Error(patched.stderr || 'Workbook metadata normalization failed');
await fs.rm(xlsxPath+'.inspect.ndjson',{force:true});
if(previewDir){
  await fs.mkdir(previewDir,{recursive:true});
  const saved = await SpreadsheetFile.importXlsx(await FileBlob.load(xlsxPath));
  const preview = await saved.render({sheetName:'Loan history',range:'A1:F5',scale:2,format:'png'});
  await fs.writeFile(path.join(previewDir,'loan-history-workbook.png'), new Uint8Array(await preview.arrayBuffer()));
  console.log((await saved.inspect({kind:'table',range:"'Loan history'!A1:F5",include:'values,formulas',tableMaxRows:5,tableMaxCols:6,maxChars:5000})).ndjson);
}
console.log('Generated one fictional XLSX, CSV and notes example. No interpretation performed.');
