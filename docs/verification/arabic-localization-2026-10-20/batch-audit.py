"""Local release gates and generator idempotence; no external requests."""
from pathlib import Path
import subprocess, json, hashlib, datetime
root=Path.cwd();out=root/'docs/verification/arabic-localization-2026-10-20'
pairs=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {siteLocales,arabicPages} from './content/site-locales.mjs'; console.log(JSON.stringify(arabicPages.map(p=>siteLocales.map(l=>l.code==='en'?p.en:l.pages.find(x=>x.en===p.en)[l.code]))));"],text=True))
files=[root/(r.strip('/')+'/index.html' if r!='/' else 'index.html') for pair in pairs for r in pair]+[root/'sitemap.xml',root/'llms.txt']
def snapshot():return {str(f.relative_to(root)):hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
before=snapshot();checks=[]
commands=[['node','scripts/sync-site-locales.mjs'],['node','scripts/build-sitemap.mjs'],['node','scripts/build-best-next-steps.mjs']]
commands += [['node','scripts/audit-page-design.mjs',pair[3]] for pair in pairs]
commands += [['node','scripts/audit-content-routing.mjs'],['node','scripts/audit-seo-ai-hygiene.mjs'],['node','scripts/audit-app-language-support.mjs']]
commands += [['python3',str(out.relative_to(root)/'raw-html-check.py'),pair[3]] for pair in pairs]
for command in commands:
 result=subprocess.run(command,capture_output=True,text=True)
 checks.append({'command':command,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
 assert result.returncode==0,checks[-1]
assert snapshot()==before,'Generated counterpart HTML/discovery changed after acceptance'
result={'allPassed':True,'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'counterpartPages':20,'generatorsByteIdempotent':True,'beforeAndAfterSha256':before,'checks':checks}
(out/'batch-audits.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'allPassed':True,'checks':len(checks),'generatorsByteIdempotent':True,'counterpartPages':20}))
