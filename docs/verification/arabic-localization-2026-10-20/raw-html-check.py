"""Local static HTML audit. Makes no network or analytics requests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, sys
ROOT=Path.cwd()
class Doc(HTMLParser):
 def __init__(self):
  super().__init__();self.lang='';self.ids=set();self.links=[];self.assets=[];self.canonical=[];self.alternates={};self.robots='';self.h1=0;self.text=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='html':self.lang=a.get('lang','')
  if tag=='h1':self.h1+=1
  if tag in ['script','style']:self.skip+=1
  if tag=='a':self.links.append(a.get('href',''))
  if tag in ['img','script'] and a.get('src','').startswith('/'):self.assets.append(a['src'])
  if tag=='link':
   if a.get('rel')=='canonical':self.canonical.append(a.get('href'))
   if a.get('rel')=='alternate':self.alternates[a.get('hreflang')]=a.get('href')
   if a.get('rel')=='stylesheet' and a.get('href','').startswith('/'):self.assets.append(a['href'])
  if tag=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.text.append(data)
def file_for(route):return ROOT/route.strip('/')/'index.html' if route!='/' else ROOT/'index.html'
def read(route):
 d=Doc();d.feed(file_for(route).read_text());return d
route=sys.argv[1];d=read(route);assert d.lang=='ar';assert d.canonical==['https://you-owe-me.com'+route];assert d.h1==1;assert 'noindex' not in d.robots;assert len(' '.join(d.text))>3000
missing=[]
for asset in d.assets:
 assert (ROOT/unquote(urlsplit(asset).path).lstrip('/')).is_file(),asset
for href in d.links:
 u=urlsplit(href)
 if u.scheme or u.netloc or not href or href=='#':continue
 target=u.path or route
 if not target.startswith('/'):continue
 f=file_for(target)
 if u.path and not f.is_file():
  if not (ROOT/unquote(u.path).lstrip('/')).exists():missing.append(href)
  continue
 if u.fragment and u.fragment!='navPanel' and u.fragment not in read(target).ids:missing.append(href)
assert not missing,missing
out={'allPassed':True,'route':route,'lang':d.lang,'canonical':d.canonical,'alternates':d.alternates,'staticTextCharacters':len(' '.join(d.text)),'staticLinkCount':len(d.links),'localAssets':d.assets,'missingLinksOrFragments':missing,'noJavaScriptTranslationRequired':True}
key='home' if route=='/ar/' else route.strip('/').split('/')[-1]
(ROOT/'docs/verification/arabic-localization-2026-10-20'/('raw-'+key+'.json')).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='localAssets'}))
