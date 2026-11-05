import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('Portuguese currency extension preserves previous programs and the original money model', () => {
  const result = JSON.parse(execFileSync('python3', ['-c', `
import copy,json,subprocess
from pathlib import Path
p=Path('scripts/generate-localized-roommate-assets.py').resolve()
def load(source,name):
    scope={'__file__':str(p),'__name__':name}
    exec(compile(source,str(p),'exec'),scope)
    return scope
current=load(p.read_text(),'candidate')
baseline=load(subprocess.check_output(['git','show','6bc192936e10f0eca34448af04f10b297ea8352c:scripts/generate-localized-roommate-assets.py'],text=True),'baseline')
for locale in ('es','de','ar','fr','ja'):
    data=json.loads(Path(f'content/roommate-workbooks/{locale}.json').read_text())
    for edition in ('excel','google-sheets'):
        assert current['localized_builder_source'](data,edition)==baseline['localized_builder_source'](data,edition),(locale,edition)
pt=json.loads(Path('content/roommate-workbooks/pt.json').read_text())
assert 'example_amount_scale' not in pt
assert pt['cell_overrides']=={'Settings!D16':'Outro'}
for edition in ('excel','google-sheets'):
    source=current['localized_builder_source'](pt,edition)
    assert '"USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF", "SGD", "THB", "BRL", "Outro"' in source
    assert 'const settingsRows = Array.from({ length: 12 }' in source
    assert source.count('settings.getRange("A5:D16")')==2
    assert 'quotedSheet("Listas", "$D$5:$D$16")' in source
    assert '"Listas": "A1:D16"' in source
    assert 'example.getRange("D6:D8").values' not in source
    assert 'example.getRange("D12").values' not in source
    assert "const amountFormat = '#,##0.00;[Red]-#,##0.00;0.00';" in source
    assert 'const dateFormat = "dd/mm/yyyy";' in source
    if edition=='google-sheets':
        assert all(str(value) in source for value in (46143,46147,46154,46162))
        assert 'QUOTIENT('+chr(36)+'{totalCents},'+chr(36)+'{includedCount})' in source and '/100' in source
    else:
        assert all(f'new Date("2026-05-{day}T00:00:00Z")' in source for day in ('01','05','12','20'))
invalid=[]
for key,value in (('code','JPY'),('insert_before','USD'),('final_range','D5:D15'),('other_cell','D15')):
    data=copy.deepcopy(pt);data['currency_list_addition'][key]=value;invalid.append(data)
data=copy.deepcopy(pt);data['cell_overrides']={'Settings!D15':'Outro'};invalid.append(data)
data=copy.deepcopy(pt);data['example_amount_scale']=100;invalid.append(data)
for data in invalid:
    try:current['localized_builder_source'](data,'excel')
    except AssertionError:pass
    else:raise AssertionError('Unreviewed currency or scale configuration admitted')
print(json.dumps({'oldPrograms':10,'ptEditions':2,'invalidConfigurationsRejected':len(invalid)}))
`], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }));
  assert.deepEqual(result, { oldPrograms: 10, ptEditions: 2, invalidConfigurationsRejected: 6 });
});
