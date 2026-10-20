"""Verify deployed bytes and public crawl signals; never creates private transfers."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import urllib.request, urllib.parse, hashlib, json, subprocess, datetime
ROOT=Path.cwd(); OUT=ROOT/'docs/verification/spanish-localization-2026-10-20'
ORIGIN='https://you-owe-me.com'
PAGES=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {spanishPages} from './content/site-locales.mjs';console.log(JSON.stringify(spanishPages.filter(p=>p.complete)));"],text=True))
HEADERS={'Cache-Control':'no-cache','User-Agent':'Mozilla/5.0 (publication verification)'}
class Document(HTMLParser):
 def __init__(self):
  super().__init__();self.canonical=[];self.alternates={};self.robots='';self.lang='';self.text=[];self.skip=0;self.resources=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang','')
  if tag in ['script','style']:self.skip+=1
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='link' and a.get('rel')=='alternate':self.alternates[a.get('hreflang')]=a.get('href')
  if tag=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
  if tag in ['script','img'] and a.get('src','').startswith('/'):self.resources.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet' and a.get('href','').startswith('/'):self.resources.append(a['href'])
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.text.append(data)
def fetch(url,ua=None):
 req=urllib.request.Request(url,headers={**HEADERS,**({'User-Agent':ua} if ua else {})})
 with urllib.request.urlopen(req,timeout=20) as response:
  body=response.read();headers={k.lower():v for k,v in response.headers.items()}
  return {'url':url,'finalUrl':response.url,'status':response.status,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'headers':{k:v for k,v in headers.items() if k in ['content-type','x-robots-tag','referrer-policy','cache-control','content-security-policy','last-modified','date']},'_body':body}
def local_bytes(route):
 return (ROOT/(route.strip('/')+'/index.html' if route!='/' else 'index.html')).read_bytes()
def verify_page(pair,lang):
 route=pair[lang];r=fetch(ORIGIN+route);assert r['status']==200 and r['finalUrl']==ORIGIN+route,route
 assert r['sha256']==hashlib.sha256(local_bytes(route)).hexdigest(),f'Byte mismatch: {route}'
 d=Document();d.feed(r['_body'].decode());assert d.lang==lang
 assert d.canonical==[ORIGIN+route],route
 assert d.alternates=={'en':ORIGIN+pair['en'],'es':ORIGIN+pair['es'],'x-default':ORIGIN+pair['en']},route
 assert 'noindex' not in d.robots and 'noindex' not in r['headers'].get('x-robots-tag','')
 assert len(' '.join(d.text))>2000
 r['lang']=lang;r['canonical']=d.canonical[0];r['alternates']=d.alternates;r['htmlTextLength']=len(' '.join(d.text));r['_resources']=d.resources
 return r
with ThreadPoolExecutor(max_workers=8) as executor: pages=list(executor.map(lambda job:verify_page(*job),[(p,l) for p in PAGES for l in ['en','es']]))
resources=sorted(set(resource for page in pages for resource in page['_resources']))
def verify_asset(resource):
 r=fetch(ORIGIN+resource);local=ROOT/urllib.parse.unquote(urllib.parse.urlsplit(resource).path.lstrip('/'));assert r['sha256']==hashlib.sha256(local.read_bytes()).hexdigest(),resource
 r.pop('_body');return r
with ThreadPoolExecutor(max_workers=8) as executor:assets=list(executor.map(verify_asset,resources))
discovery=[]
for name in ['robots.txt','sitemap.xml','llms.txt']:
 r=fetch(ORIGIN+'/'+name);assert r['_body']==(ROOT/name).read_bytes(),name
 if name=='sitemap.xml':
  for page in PAGES:assert '<loc>'+ORIGIN+page['es']+'</loc>' in r['_body'].decode()
 r.pop('_body');discovery.append(r)
bots=['Googlebot','bingbot','OAI-SearchBot','ChatGPT-User','Claude-SearchBot','Claude-User','PerplexityBot','Perplexity-User']
expected={p['url']:p['sha256'] for p in pages}
def verify_bot(job):
 page,bot=job;r=fetch(ORIGIN+page['es'],bot);assert r['sha256']==expected[r['url']],f'Bot differs: {bot} {r["url"]}'
 return {'url':r['url'],'userAgent':bot,'status':r['status'],'samePublicHTML':True,'xRobotsTag':r['headers'].get('x-robots-tag')}
with ThreadPoolExecutor(max_workers=8) as executor:bot_checks=list(executor.map(verify_bot,[(p,b) for p in PAGES for b in bots]))
private=fetch('https://continue.you-owe-me.com/split/');assert 'noindex' in private['headers'].get('x-robots-tag','');assert private['headers'].get('referrer-policy')=='no-referrer';assert 'no-store' in private['headers'].get('cache-control','');private.pop('_body')
for p in pages:p.pop('_body');p.pop('_resources')
result={'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'allPassed':True,'pages':pages,'assets':assets,'discovery':discovery,'botUserAgentProbes':bot_checks,'privateContinuation':private,'limits':'User-agent probes are ordinary client requests, not actual verified crawler-IP observations; no indexing, rankings or AI citations are established.'}
(OUT/'public-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'allPassed':True,'pages':len(pages),'assets':len(assets),'discovery':len(discovery),'botProbes':len(bot_checks),'privateNoindex':True}))
