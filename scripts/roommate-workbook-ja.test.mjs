import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('Japanese workbook example adaptation is bounded and preserves all previous locale programs', () => {
  const result = JSON.parse(execFileSync('python3', ['-c', `
import copy,json,subprocess
from pathlib import Path
p=Path('scripts/generate-localized-roommate-assets.py').resolve()
def load(source,name):
    scope={'__file__':str(p),'__name__':name}
    exec(compile(source,str(p),'exec'),scope)
    return scope['localized_builder_source']
current=load(p.read_text(),'candidate')
baseline=load(subprocess.check_output(['git','show','e32a337:scripts/generate-localized-roommate-assets.py'],text=True),'baseline')
for locale in ('es','de','ar','fr'):
    data=json.loads(Path(f'content/roommate-workbooks/{locale}.json').read_text())
    for edition in ('excel','google-sheets'):
        assert current(data,edition)==baseline(data,edition),(locale,edition)
ja=json.loads(Path('content/roommate-workbooks/ja.json').read_text())
assert len(ja['strings'])==166
for edition in ('excel','google-sheets'):
    source=current(ja,edition)
    assert source.count('example.getRange("D6:D8").values = [[180000], [6000], [12000]];')==1
    assert source.count('example.getRange("D12").values = [[20000]];')==1
    # Every common model constant/formula is still emitted by the canonical
    # builder; only the explicit example-value writes precede final recalc.
    assert source.index('example.getRange("D12").values = [[20000]];')<source.index('workbook.recalculate();')
    assert "const amountFormat = '#,##0.00;[Red]-#,##0.00;0.00';" in source
    if edition=='google-sheets':
        for date in (46143,46147,46154,46162): assert str(date) in source
        assert 'QUOTIENT('+chr(36)+'{totalCents},'+chr(36)+'{includedCount})' in source and '/100' in source
    else:
        for day in ('01','05','12','20'): assert f'new Date("2026-05-{day}T00:00:00Z")' in source
for value in (1,10,1000,None):
    invalid=copy.deepcopy(ja)
    if value is None: del invalid['example_amount_scale']
    else: invalid['example_amount_scale']=value
    try: current(invalid,'excel')
    except (AssertionError,KeyError): pass
    else: raise AssertionError('Unreviewed example scale admitted')
print(json.dumps({'oldLocalePrograms':8,'japaneseEditions':2,'invalidScaleCasesRejected':4}))
`], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }));
  assert.deepEqual(result, { oldLocalePrograms: 8, japaneseEditions: 2, invalidScaleCasesRejected: 4 });
});
