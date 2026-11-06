import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('Italian workbook corrections preserve previous editions and admit only the reviewed cells', () => {
  const result = JSON.parse(execFileSync('python3', ['-c', `
import copy,json,subprocess
from pathlib import Path
p=Path('scripts/generate-localized-roommate-assets.py').resolve()
def load(source,name):
    scope={'__file__':str(p),'__name__':name}
    exec(compile(source,str(p),'exec'),scope)
    return scope
current=load(p.read_text(),'candidate')
baseline=load(subprocess.check_output(['git','show','967b5a6e9d3dd25ac9c9d6f08f5935bd1e493935:scripts/generate-localized-roommate-assets.py'],text=True),'baseline')
for locale in ('es','de','ar','fr','ja','pt'):
    data=json.loads(Path(f'content/roommate-workbooks/{locale}.json').read_text())
    for edition in ('excel','google-sheets'):
        assert current['localized_builder_source'](data,edition)==baseline['localized_builder_source'](data,edition),(locale,edition)
it=json.loads(Path('content/roommate-workbooks/it.json').read_text())
assert 'example_amount_scale' not in it and 'currency_list_addition' not in it
assert it['cell_overrides']=={'Settings!D15':'Altro','Expenses!S3':'Note','Expenses!S4':'Note'}
for edition in ('excel','google-sheets'):
    source=current['localized_builder_source'](it,edition)
    assert 'setup.getRange("A4").format.wrapText = true;' in source
    assert 'setup.getRange("A4:F4").format.rowHeightPx = 34;' in source
    assert 'expenses.getRange("S3").values = [["Note"]];' in source
    assert 'expenses.getRange("S4").values = [["Note"]];' in source
    assert '"USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF", "SGD", "THB", "Altro"' in source
    assert 'quotedSheet("Elenchi", "$D$5:$D$15")' in source
    assert 'example.getRange("D6:D8").values' not in source
    assert 'example.getRange("D12").values' not in source
invalid=[]
for key,value in [('Expenses!S3','Nota'),('Expenses!T3','Note')]:
    data=copy.deepcopy(it);data['cell_overrides'][key]=value;invalid.append(data)
data=copy.deepcopy(it);del data['cell_overrides']['Expenses!S4'];invalid.append(data)
for data in invalid:
    try:current['localized_builder_source'](data,'excel')
    except AssertionError:pass
    else:raise AssertionError('Unreviewed Italian cell override admitted')
print(json.dumps({'oldPrograms':12,'italianEditions':2,'invalidOverridesRejected':len(invalid)}))
`], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }));
  assert.deepEqual(result, { oldPrograms: 12, italianEditions: 2, invalidOverridesRejected: 3 });
});
