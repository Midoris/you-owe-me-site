import ast,json,urllib.parse,re,subprocess
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path.cwd();ORIGIN='https://you-owe-me.com';OUT=ROOT/'docs/verification/arabic-localization-2026-10-20'
source=(OUT/'verify-public.py').read_text();tree=ast.parse(source);scope={'HTMLParser':HTMLParser,'ORIGIN':ORIGIN};node=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='Document');exec(compile(ast.Module(body=[node],type_ignores=[]),'production-Document','exec'),scope);Document=scope['Document']
fixture=Document();fixture.feed('<body><p>outside-before</p><div id="main">inside-a<img src="/image.png" />inside-b<br />inside-c</div><p>outside-after</p></body>')
main=''.join(fixture.mainText);main_ok=main=='inside-ainside-binside-c';assert main_ok,main
PAGES=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{siteLocales,completedCounterparts}from'./content/site-locales.mjs';console.log(JSON.stringify(siteLocales.find(l=>l.code==='ar').pages.flatMap(p=>completedCounterparts(p.en))));"],text=True))
assert len(PAGES)==20
resources=set();page_receipts=[]
for page in PAGES:
 route=page['route'];html=(ROOT/route.strip('/')/'index.html').read_text() if route!='/' else (ROOT/'index.html').read_text();d=Document();d.feed(html);page_receipts.append({'route':route,'mainTextLength':len(' '.join(d.mainText))})
 for ref in d.resources:
  u=urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN+route,ref))
  if u.netloc==urllib.parse.urlsplit(ORIGIN).netloc:resources.add(u.path+('?' +u.query if u.query else ''))
pending=list(resources);missing=[];legacyMissing=[]
# Execute the actual production graph, including its narrow unchanged legacy exception.
block=source[source.index('while pending:'):source.index('resources=sorted(resources)')]
exec(compile(block,'production-asset-graph','exec'),globals())
assert any(r.startswith('/scripts/loan-import-ui.mjs') for r in resources)
assert any(r.startswith('/scripts/loan-import.mjs?v=20261018-review1') for r in resources)
assert any(r.startswith('/styles/loan-import.css') for r in resources)
assert any('/webfonts/' in r for r in resources)
result={'mainVoidFixturePass':main_ok,'mainVoidFixtureActual':main,'pages':page_receipts,'assetCount':len(resources),'resources':sorted(resources),'missingNestedLocal':missing,'dynamicImportsAndRuntimeCssAndFontsFound':True,'legacyMissing':legacyMissing,'networkRequests':0}
(OUT/'release-verifier-independent-offline.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'mainVoidFixturePass':main_ok,'mainVoidFixtureActual':main,'pages':len(PAGES),'assets':len(resources),'missing':missing},indent=2))

# Test the actual request policy without allowing a network operation.
import urllib.request,hashlib
policy={'urllib':urllib,'hashlib':hashlib,'HEADERS':{'User-Agent':'independent offline verification'}}
for name in ['ExactUrlOnly','fetch','RedirectLog']:
 node=next(n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef)) and n.name==name)
 exec(compile(ast.Module(body=[node],type_ignores=[]),'production-'+name,'exec'),policy)
opened=[]
class Response:
 status=200
 headers={'Content-Type':'text/plain'}
 def __init__(self,url):self.url=url
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self):return b'offline fixture'
class Opener:
 def open(self,req,timeout):
  opened.append({'url':req.full_url,'method':req.get_method(),'body':req.data})
  return Response(req.full_url)
original_opener=urllib.request.build_opener
urllib.request.build_opener=lambda *args:Opener()
rejected=[]
try:
 for url in ['http://you-owe-me.com/ar/','https://example.com/ar/','https://continue.you-owe-me.com/split/?ref','https://continue.you-owe-me.com/split/?ref=','https://continue.you-owe-me.com/split/?ref=financial-data','https://you-owe-me.com/ar/?v=ok&amount=90']:
  before=len(opened)
  try:policy['fetch'](url)
  except AssertionError:rejected.append(url)
  else:raise AssertionError('unsafe URL accepted: '+url)
  assert len(opened)==before
 for url in ['https://you-owe-me.com/ar/','https://you-owe-me.com/scripts/tool-transfer.js?v=fixture','https://continue.you-owe-me.com/split/']:
  policy['fetch'](url)
finally:urllib.request.build_opener=original_opener
assert all(r['method']=='GET' and r['body'] is None for r in opened)
assert policy['ExactUrlOnly']().redirect_request(None,None,302,'Found',{},'https://example.com/') is None
redirect_rejections=[]
req=urllib.request.Request(ORIGIN+'/ar')
for url in ['http://you-owe-me.com/ar/','https://example.com/ar/','https://you-owe-me.com/ar/?ref','https://you-owe-me.com/ar/?v=anything']:
 logger=policy['RedirectLog']()
 try:logger.redirect_request(req,None,301,'Moved',{},url)
 except AssertionError:redirect_rejections.append(url)
 else:raise AssertionError('unsafe redirect accepted: '+url)
 assert not logger.chain
# Verify relative resources and both srcset variants use their document route.
d=Document();d.feed('<div id="main">Fixture<img src="../../images/a.png" srcset="small.webp 320w, /images/large.webp 2x"/><source srcset="../wide.webp 1x, //you-owe-me.com/images/wider.webp 2x"/></div>')
resolved=[urllib.parse.urljoin(ORIGIN+'/ar/tools/example/',r) for r in d.resources]
assert resolved==[ORIGIN+'/ar/images/a.png',ORIGIN+'/ar/tools/example/small.webp',ORIGIN+'/images/large.webp',ORIGIN+'/ar/tools/wide.webp',ORIGIN+'/images/wider.webp'],resolved
result.update({'requestPolicy':{'invalidRequestsRejectedBeforeOpen':rejected,'allowedOfflineRequests':opened,'exactByteFetchRedirectsRefused':True,'unsafeRedirectsRejected':redirect_rejections},'relativeAndSrcsetFixture':resolved})
(OUT/'release-verifier-independent-offline.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'requestPolicyPassed':True,'networkRequests':0,'relativeSrcsetPassed':True}))

private_files=subprocess.check_output(['git','ls-files','private-continuation'],text=True).splitlines()
unchanged=[]
for file in private_files:
 if '/split/' in file:continue
 assert (ROOT/file).read_bytes()==subprocess.check_output(['git','show','f3aee78:'+file]),file
 unchanged.append(file)
config=json.loads((ROOT/'firebase.exp003.json').read_text())
csp={group['source']:next((h['value'] for h in group['headers'] if h['key']=='Content-Security-Policy'),None) for group in config['hosting']['headers']}
assert csp['/split/**']=="default-src 'none'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
assert 'connect-src' not in csp['/split/**']
result.update({'unchangedNonSplitPrivateDependencies':unchanged,'privateSplitCspExact':csp['/split/**']})
(OUT/'release-verifier-independent-offline.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'unchangedNonSplitPrivateDependencies':len(unchanged),'privateSplitCspExact':True}))
