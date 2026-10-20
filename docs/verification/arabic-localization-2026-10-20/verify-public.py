"""Verify deployed bytes and public crawl signals; never creates private transfers."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import urllib.request, urllib.parse, hashlib, json, subprocess, datetime, re
ROOT=Path.cwd(); OUT=ROOT/'docs/verification/arabic-localization-2026-10-20'
ORIGIN='https://you-owe-me.com'
PAGES=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {spanishPages,germanPages,arabicPages} from './content/site-locales.mjs';console.log(JSON.stringify(arabicPages.filter(p=>p.complete).map(p=>({...p,es:spanishPages.find(s=>s.en===p.en).es,de:germanPages.find(s=>s.en===p.en).de}))));"],text=True))
assert len(PAGES)==5, 'Only verify the complete five-page release'
HEADERS={'Cache-Control':'no-cache','User-Agent':'Mozilla/5.0 (publication verification)'}
class Document(HTMLParser):
 def __init__(self):
  super().__init__();self.canonical=[];self.alternates={};self.robots='';self.lang='';self.direction='';self.text=[];self.skip=0;self.resources=[];self.mainDepth=0;self.mainText=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if self.mainDepth and tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.mainDepth+=1
  elif a.get('id')=='main':self.mainDepth=1
  if tag=='html':self.lang=a.get('lang','');self.direction=a.get('dir','ltr')
  if tag in ['script','style']:self.skip+=1
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='link' and a.get('rel')=='alternate':self.alternates[a.get('hreflang')]=a.get('href')
  if tag=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
  if tag=='meta' and a.get('property',a.get('name')) in ['og:image','twitter:image'] and a.get('content','').startswith(ORIGIN+'/'):self.resources.append(a['content'][len(ORIGIN):])
  if tag in ['script','img'] and a.get('src'):self.resources.append(a['src'])
  if tag in ['img','source'] and a.get('srcset'):self.resources.extend(part.strip().split()[0] for part in a['srcset'].split(',') if part.strip())
  if tag=='link' and a.get('rel')=='stylesheet' and a.get('href'):self.resources.append(a['href'])
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
  if self.mainDepth and tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.mainDepth-=1
 def handle_data(self,data):
  if not self.skip:
   self.text.append(data)
   if self.mainDepth:self.mainText.append(data)
class ExactUrlOnly(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
def fetch(url,ua=None):
 u=urllib.parse.urlsplit(url)
 assert u.scheme=='https' and u.netloc in ['you-owe-me.com','continue.you-owe-me.com']
 assert {key for key,value in urllib.parse.parse_qsl(u.query,keep_blank_values=True)}.issubset({'v'}),'No private reference or financial query may be sent'
 req=urllib.request.Request(url,method='GET',headers={**HEADERS,**({'User-Agent':ua} if ua else {})})
 with urllib.request.build_opener(ExactUrlOnly()).open(req,timeout=20) as response:
  assert response.status==200 and response.url==url, f'Unexpected response/redirect: {url} -> {response.url} ({response.status})'
  body=response.read();headers={k.lower():v for k,v in response.headers.items()}
  return {'url':url,'finalUrl':response.url,'status':response.status,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'headers':{k:v for k,v in headers.items() if k in ['content-type','x-robots-tag','referrer-policy','cache-control','content-security-policy','last-modified','date']},'_body':body}
def local_bytes(route):
 return (ROOT/(route.strip('/')+'/index.html' if route!='/' else 'index.html')).read_bytes()
def verify_page(pair,lang):
 route=pair[lang];r=fetch(ORIGIN+route);assert r['status']==200 and r['finalUrl']==ORIGIN+route,route
 assert r['sha256']==hashlib.sha256(local_bytes(route)).hexdigest(),f'Byte mismatch: {route}'
 d=Document();d.feed(r['_body'].decode());assert d.lang==lang
 assert d.direction==('rtl' if lang=='ar' else 'ltr')
 assert d.canonical==[ORIGIN+route],route
 assert d.alternates=={'en':ORIGIN+pair['en'],'es':ORIGIN+pair['es'],'de':ORIGIN+pair['de'],'ar':ORIGIN+pair['ar'],'x-default':ORIGIN+pair['en']},route
 assert not re.search(r'\b(?:noindex|none)\b', (d.robots+' '+r['headers'].get('x-robots-tag','')).lower()),route
 assert len(' '.join(d.mainText))>2000,route
 r['lang']=lang;r['canonical']=d.canonical[0];r['alternates']=d.alternates;r['htmlTextLength']=len(' '.join(d.text));r['mainTextLength']=len(' '.join(d.mainText));r['_resources']=[urllib.parse.urlsplit(absolute).path+('?' + urllib.parse.urlsplit(absolute).query if urllib.parse.urlsplit(absolute).query else '') for value in d.resources for absolute in [urllib.parse.urljoin(ORIGIN+route,value)] if urllib.parse.urlsplit(absolute).netloc==urllib.parse.urlsplit(ORIGIN).netloc]
 return r
with ThreadPoolExecutor(max_workers=8) as executor: pages=list(executor.map(lambda job:verify_page(*job),[(p,l) for p in PAGES for l in ['en','es','de','ar']]))
resources=set(resource for page in pages for resource in page['_resources'])
pending=list(resources)
legacyMissing=[]
while pending:
 resource=pending.pop();pathname=urllib.parse.urlsplit(resource).path
 if not pathname.endswith(('.mjs','.js','.css')):continue
 source=(ROOT/urllib.parse.unquote(pathname.lstrip('/'))).read_text()
 # Static and literal dynamic ES module imports, CSS resources, and literal
 # same-origin assets inserted by runtime code. Computed URLs are not executed.
 references=re.findall(r'''(?:from\s+|import\s*(?:\(\s*)?)["']([^"']+)["']''',source)
 if pathname.endswith('.css'):
  references+=re.findall(r'''url\(\s*["']?([^"'\s)]+)''',source)
  references+=re.findall(r'''@import\s+["']([^"']+)["']''',source)
 references+=re.findall(r'''["'](/(?:scripts|styles|images)/[^"'\s]+\.(?:mjs|js|css|png|webp|svg|jpg|jpeg|gif)(?:\?[^"'\s]*)?)["']''',source)
 for imported in references:
  if not imported.startswith(('./','../','/')) and not pathname.endswith('.css'):continue
  u=urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN+resource,imported))
  if u.netloc!=urllib.parse.urlsplit(ORIGIN).netloc or u.scheme!='https':continue
  target=u.path+('?' +u.query if u.query else '')
  if not (ROOT/urllib.parse.unquote(u.path.lstrip('/'))).is_file():
   assert pathname=='/assets/css/noscript.css' and u.path=='/assets/css/font-awesome.min.css',(resource,imported,target)
   assert (ROOT/'assets/css/noscript.css').read_bytes()==subprocess.check_output(['git','show','f3aee78:assets/css/noscript.css'])
   legacyMissing.append({'source':resource,'missingLegacyAsset':target,'unchangedSince':'f3aee78','context':'Existing noscript fallback imports a missing legacy font stylesheet; every current document already loads fontawesome-all.min.css.'})
   continue
  if target not in resources:resources.add(target);pending.append(target)
resources=sorted(resources)
def verify_asset(resource):
 r=fetch(ORIGIN+resource);local=ROOT/urllib.parse.unquote(urllib.parse.urlsplit(resource).path.lstrip('/'));assert r['sha256']==hashlib.sha256(local.read_bytes()).hexdigest(),resource
 r.pop('_body');return r
with ThreadPoolExecutor(max_workers=8) as executor:assets=list(executor.map(verify_asset,resources))
discovery=[]
for name in ['robots.txt','sitemap.xml','llms.txt']:
 r=fetch(ORIGIN+'/'+name);assert r['_body']==(ROOT/name).read_bytes(),name
 if name=='sitemap.xml':
  for page in PAGES:
   for lang in ['en','es','de','ar']:assert '<loc>'+ORIGIN+page[lang]+'</loc>' in r['_body'].decode()
 r.pop('_body');discovery.append(r)
private=fetch('https://continue.you-owe-me.com/split/');assert 'noindex' in private['headers'].get('x-robots-tag','');assert private['headers'].get('referrer-policy')=='no-referrer';assert 'no-store' in private['headers'].get('cache-control','');assert private['_body']==(ROOT/'private-continuation/split/index.html').read_bytes();private.pop('_body')
config=json.loads((ROOT/'firebase.exp003.json').read_text())
def expected_csp(source):return next(h['value'] for group in config['hosting']['headers'] if group['source']==source for h in group['headers'] if h['key']=='Content-Security-Policy')
assert private['headers'].get('content-security-policy','')==expected_csp('/split/**')
private_script=fetch('https://continue.you-owe-me.com/split/locale.js?v=ar20261020');assert private_script['_body']==(ROOT/'private-continuation/split/locale.js').read_bytes();private_script.pop('_body')
assert private_script['headers'].get('content-security-policy','')==expected_csp('/split/**')
assert 'noindex' in private_script['headers'].get('x-robots-tag','').lower() and 'no-store' in private_script['headers'].get('cache-control','').lower() and private_script['headers'].get('referrer-policy')=='no-referrer'
class RedirectLog(urllib.request.HTTPRedirectHandler):
 def __init__(self):super().__init__();self.chain=[]
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  target=urllib.parse.urlsplit(newurl)
  assert target.scheme=='https' and target.netloc=='you-owe-me.com' and not target.query
  self.chain.append({'from':req.full_url,'status':code,'to':newurl})
  return super().redirect_request(req,fp,code,msg,headers,newurl)
redirects=[]
for pair in PAGES:
 logger=RedirectLog();url=ORIGIN+pair['ar'].rstrip('/')
 with urllib.request.build_opener(logger).open(urllib.request.Request(url,headers=HEADERS),timeout=20) as response:
  assert response.status==200 and response.url==ORIGIN+pair['ar']
  assert logger.chain and logger.chain[0]['status'] in [301,302,307,308]
  redirects.append({'requested':url,'finalUrl':response.url,'chain':logger.chain})
def verify_private_dependency(file):
 path=file.removeprefix('private-continuation/').removesuffix('index.html');r=fetch('https://continue.you-owe-me.com/'+path)
 assert r['_body']==(ROOT/file).read_bytes(),file
 if '/split/' not in file:assert (ROOT/file).read_bytes()==subprocess.check_output(['git','show','f3aee78:'+file]),file
 assert 'noindex' in r['headers'].get('x-robots-tag','') and 'no-store' in r['headers'].get('cache-control','') and r['headers'].get('referrer-policy')=='no-referrer'
 assert r['headers'].get('content-security-policy','')==expected_csp('/loan/**' if '/loan/' in file else '/split/**' if '/split/' in file else '**')
 r.pop('_body');return r
private_files=subprocess.check_output(['git','ls-files','private-continuation'],text=True).splitlines()
with ThreadPoolExecutor(max_workers=5) as executor:private_dependencies=list(executor.map(verify_private_dependency,[f for f in private_files if '/split/' not in f]))
private_arabic_style=verify_private_dependency('private-continuation/split/arabic.css')
for p in pages:p.pop('_body');p.pop('_resources')
result={'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'allPassed':True,'financialReferencesSent':0,'productionUploads':0,'unchangedLegacyMissingAssets':legacyMissing,'assetCoverage':'All direct HTML resources, srcset variants, static/literal dynamic module imports, local CSS url/import resources and literal runtime asset paths; computed runtime destinations covered by browser journeys.','pages':pages,'assets':assets,'discovery':discovery,'privateContinuation':private,'privateLocaleScript':private_script,'privateArabicStyle':private_arabic_style,'unchangedPrivateDependencies':private_dependencies,'arabicTrailingSlashRedirects':redirects,'limits':'Ordinary release verification requests only. No Search Console, indexing request/submission/follow-up, bot-UA probing or actual indexing/ranking/AI-citation evidence.'}
(OUT/'public-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'allPassed':True,'pages':len(pages),'assets':len(assets),'discovery':len(discovery),'privateNoindex':True}))
