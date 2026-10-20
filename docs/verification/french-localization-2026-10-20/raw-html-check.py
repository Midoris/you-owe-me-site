"""Local reviewed-cluster HTML/link/asset audit; no external requests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote,urljoin
import json,sys,subprocess,re
ROOT=Path.cwd();OUT=ROOT/'docs/verification/french-localization-2026-10-20';ORIGIN='https://you-owe-me.com'
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Doc(HTMLParser):
 def __init__(self):
  super().__init__();self.lang='';self.direction='ltr';self.ids=set();self.links=[];self.assets=[];self.canonical=[];self.alternates={};self.robots=[];self.h1=0;self.text=[];self.main=0;self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if self.main and tag not in VOID:self.main+=1
  elif a.get('id')=='main':self.main=1
  if 'id' in a:
   assert a['id'] not in self.ids,'Duplicate id: '+a['id'];self.ids.add(a['id'])
  if tag=='html':self.lang=a.get('lang','');self.direction=a.get('dir','ltr')
  if tag=='h1':self.h1+=1
  if tag in ['script','style']:self.skip+=1
  if tag=='a':self.links.append(a.get('href',''))
  if tag in ['img','script'] and a.get('src'):self.assets.append(a['src'])
  if tag in ['img','source'] and a.get('srcset'):self.assets.extend(v.strip().split()[0] for v in a['srcset'].split(',') if v.strip())
  if tag=='link':
   if a.get('rel')=='canonical':self.canonical.append(a.get('href'))
   if a.get('rel')=='alternate':
    code=a.get('hreflang');assert code not in self.alternates,'Duplicate hreflang: '+str(code);self.alternates[code]=a.get('href')
   if a.get('rel') in ['stylesheet','icon','apple-touch-icon']:self.assets.append(a.get('href',''))
  if tag=='meta' and a.get('name','').lower()=='robots':self.robots.append(a.get('content',''))
  if tag=='meta' and a.get('property',a.get('name')) in ['og:image','twitter:image']:self.assets.append(a.get('content',''))
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
  if self.main and tag not in VOID:self.main-=1
 def handle_data(self,data):
  if self.main and not self.skip:self.text.append(data)
def file_for(route):return ROOT/route.strip('/')/'index.html' if route!='/' else ROOT/'index.html'
def read(route):
 d=Doc();d.feed(file_for(route).read_text());return d
route=sys.argv[1];d=read(route);assert d.lang=='fr';assert d.direction=='ltr';assert d.canonical==[ORIGIN+route];assert d.h1==1;assert not re.search(r'\b(?:noindex|none)\b',' '.join(d.robots).lower());assert len(' '.join(d.text))>2000
pairs=json.loads(subprocess.check_output(['node','--input-type=module','-e','import {siteLocales,frenchPages,completedCounterparts} from "./content/site-locales.mjs";console.log(JSON.stringify(frenchPages.map(p=>({route:p.fr,counterparts:completedCounterparts(p.en)}))))'],text=True));pair=next(p for p in pairs if p['route']==route);expected={p['code']:ORIGIN+p['route'] for p in pair['counterparts']};expected['x-default']=expected['en'];assert d.alternates==expected
missing=[]
for resource in d.assets:
 u=urlsplit(urljoin(ORIGIN+route,resource))
 if u.netloc=='you-owe-me.com':assert (ROOT/unquote(u.path).lstrip('/')).is_file(),resource
for href in d.links:
 u=urlsplit(urljoin(ORIGIN+route,href))
 if u.netloc!='you-owe-me.com' or not href or href=='#':continue
 target=u.path;f=file_for(target)
 if not f.is_file():
  if not (ROOT/unquote(target).lstrip('/')).is_file():missing.append(href)
  continue
 if u.fragment and u.fragment!='navPanel' and u.fragment not in read(target).ids:missing.append(href)
assert not missing,missing
out={'allPassed':True,'route':route,'lang':d.lang,'direction':d.direction,'canonical':d.canonical,'alternates':d.alternates,'staticMainTextCharacters':len(' '.join(d.text)),'staticLinkCount':len(d.links),'assets':d.assets,'missingLinksOrFragments':missing,'noJavaScriptTranslationRequired':True}
key='home' if route=='/fr/' else route.strip('/').split('/')[-1];(OUT/('raw-'+key+'.json')).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='assets'}))
