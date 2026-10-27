"""Verify public Groups resources and exact-SHA GitHub Pages deployment; no publication."""
from pathlib import Path
from html.parser import HTMLParser
import urllib.request, json, hashlib, subprocess, datetime, sys
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
ORIGIN='https://you-owe-me.com'
ROUTES=['/','/es/','/de/','/ar/','/fr/','/features/','/quick-start/','/solutions/client-payment-records/','/solutions/group-payback-tracker/','/compare/','/compare/splitwise-alternative/','/blog/how-to-keep-track-of-money-between-family-members/']
FILES=[(r,('index.html' if r=='/' else r.lstrip('/')+'index.html')) for r in ROUTES]+[(r,r.lstrip('/')) for r in ['/styles/features.css','/llms.txt','/sitemap.xml','/robots.txt']]
class Page(HTMLParser):
 def __init__(self,html):
  super().__init__();self.ids=[];self.links=[];self.canonical=None;self.robots='';self.main=False;self.main_text=[];self.schemas=[];self.schema=None;self.feed(html)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
  if tag=='main' or a.get('id')=='main':self.main=True
  if tag=='script' and a.get('type')=='application/ld+json':self.schema=''
 def handle_endtag(self,tag):
  if tag=='script' and self.schema is not None:self.schemas.append(json.loads(self.schema));self.schema=None
 def handle_data(self,text):
  if self.main:self.main_text.append(text)
  if self.schema is not None:self.schema+=text

def read(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'YouOweMe-Groups-Release-Verification','Accept':'application/vnd.github+json'}),timeout=30) as response:
  assert response.status==200,(url,response.status)
  return response.read()

def check_html(route,raw):
 p=Page(raw.decode());assert p.canonical==ORIGIN+route,(route,p.canonical);assert 'noindex' not in p.robots
 assert len(''.join(p.main_text))>1000
 if route=='/features/':
  assert p.ids.count('groups')==1
  assert '#groups' in p.links
  assert 'Requires You Owe Me 7.2.4 or later.' in raw.decode()
  assert 'Groups organize people inside them.' in raw.decode()
  assert any(any(e.get('@id')==ORIGIN+'/features/#groups' for e in s.get('hasPart',[])) for s in p.schemas)
 elif route!='/compare/':assert '/features/#groups' in p.links,route
 return {'route':route,'canonical':p.canonical,'schemaBlocks':len(p.schemas),'groupsLinks':[h for h in p.links if h.endswith('#groups')],'staticMainCharacters':len(''.join(p.main_text))}

def main():
 live='--live' in sys.argv
 checks=[check_html(route,(ROOT/file).read_bytes()) for route,file in FILES if file.endswith('.html')]
 result={'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':'production' if live else 'local-static','pages':checks,'resources':[]}
 if live:
  sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip();result['sha']=sha
  base='https://api.github.com/repos/Midoris/you-owe-me-site'
  deployments=json.loads(read(base+'/deployments?sha='+sha+'&environment=github-pages&per_page=10'))
  assert deployments,'No exact-SHA Pages deployment yet'
  deployment=deployments[0];assert deployment['sha']==sha
  statuses=json.loads(read(base+'/deployments/'+str(deployment['id'])+'/statuses'))
  result['deployment']={'id':deployment['id'],'sha':sha,'statuses':[{k:s.get(k) for k in ['state','created_at','log_url','environment_url']} for s in statuses]}
  assert statuses and statuses[0]['state']=='success',result['deployment']
  for route,file in FILES:
   raw=read(ORIGIN+route);expected=(ROOT/file).read_bytes();assert raw==expected,'Production byte mismatch: '+route
   if file.endswith('.html'):check_html(route,raw)
   result['resources'].append({'url':ORIGIN+route,'file':file,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'matches':True})
 result['accepted']=True
 (OUT/('production-verification.json' if live else 'static-verification.json')).write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
 print(json.dumps({'accepted':True,'mode':result['mode'],'pages':len(checks),'resources':len(result['resources']),'sha':result.get('sha'),'deployment':result.get('deployment')},indent=2))
if __name__=='__main__':main()
