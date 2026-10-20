"""Read one exact-SHA GitHub Pages deployment snapshot; no publication action."""
import urllib.request,urllib.parse,json,subprocess,sys,datetime
from pathlib import Path
sha=sys.argv[1] if len(sys.argv)>1 else subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
label=sys.argv[2] if len(sys.argv)>2 else 'application'
base='https://api.github.com/repos/Midoris/you-owe-me-site'
def get(path):
 with urllib.request.urlopen(urllib.request.Request(base+path,headers={'Accept':'application/vnd.github+json','User-Agent':'YouOweMe-release-verification'}),timeout=30) as r:return json.load(r)
deployments=get('/deployments?sha='+urllib.parse.quote(sha)+'&environment=github-pages&per_page=10')
receipts=[]
for d in deployments:
 assert d['sha']==sha
 states=get('/deployments/'+str(d['id'])+'/statuses')
 receipts.append({'deploymentId':d['id'],'sha':d['sha'],'environment':d['environment'],'createdAt':d['created_at'],'statuses':[{'state':s['state'],'createdAt':s['created_at'],'logUrl':s['log_url'],'environmentUrl':s['environment_url']} for s in states]})
success=bool(receipts and receipts[0]['statuses'] and receipts[0]['statuses'][0]['state']=='success')
result={'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha':sha,'success':success,'deployments':receipts}
Path('docs/verification/arabic-localization-2026-10-20/'+label+'-pages-deployment.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
sys.exit(0 if success else 2)
