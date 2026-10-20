"""Scoped local static/unit gates and generator idempotence; browser/reviews separate."""
from pathlib import Path
import subprocess,json,hashlib,datetime,sys
root=Path.cwd();out=root/'docs/verification/french-localization-2026-10-20';route=sys.argv[1];key=sys.argv[2];tests=sys.argv[3:]
pages=json.loads(subprocess.check_output(['node','--input-type=module','-e','import {siteLocales} from "./content/site-locales.mjs";console.log(JSON.stringify([...new Set(siteLocales.flatMap(l=>l.pages.filter(p=>p.complete).flatMap(p=>[p.en,p[l.code]])))]))'],text=True))
files=[root/(p.strip('/')+'/index.html' if p!='/' else 'index.html') for p in pages]+[root/'sitemap.xml',root/'llms.txt']
def snapshot():return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
before=snapshot();commands=[['node','scripts/sync-site-locales.mjs'],['node','scripts/build-sitemap.mjs'],['node','scripts/audit-page-design.mjs',route],['python3',str(out.relative_to(root)/'raw-html-check.py'),route],['node','--test',*tests]];checks=[]
for command in commands:
 r=subprocess.run(command,capture_output=True,text=True);checks.append({'command':command,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr});assert r.returncode==0,checks[-1]
assert snapshot()==before,'Generator changed accepted content/discovery'
(out/(key+'-acceptance.json')).write_text(json.dumps({'allPassed':True,'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'route':route,'generatorByteIdempotent':True,'checks':checks},indent=2)+'\n');print(json.dumps({'allPassed':True,'route':route,'checks':len(checks),'generatorByteIdempotent':True}))
