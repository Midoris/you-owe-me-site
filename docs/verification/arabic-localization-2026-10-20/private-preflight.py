"""Read-only private-host deployment preflight; never supplies financial references."""
import urllib.request, json, hashlib, datetime, subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path.cwd();files=subprocess.check_output(['git','ls-files','private-continuation'],text=True).splitlines()
# Only the split presentation changes in this batch; all other hosted bytes must match.
files=[f for f in files if '/split/' not in f]
def check(file):
 path=file.removeprefix('private-continuation/');path=path.removesuffix('index.html')
 url='https://continue.you-owe-me.com/'+path
 with urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=20) as r:
  body=r.read();h={k.lower():v for k,v in r.headers.items()}
  assert body==(root/file).read_bytes(),file
  assert 'noindex' in h.get('x-robots-tag','');assert 'no-store' in h.get('cache-control','');assert h.get('referrer-policy')=='no-referrer'
  return {'file':file,'url':url,'status':r.status,'sameReviewedBytes':True,'sha256':hashlib.sha256(body).hexdigest(),'headers':{k:v for k,v in h.items() if k in ['x-robots-tag','cache-control','referrer-policy','content-security-policy']}}
with ThreadPoolExecutor(max_workers=5) as e:receipts=list(e.map(check,files))
result={'allPassed':True,'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unchangedResources':receipts,'financialReferencesSent':0}
(root/'docs/verification/arabic-localization-2026-10-20/private-target-preflight.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'allPassed':True,'unchangedResources':len(receipts),'privateHeadersPreserved':True}))
