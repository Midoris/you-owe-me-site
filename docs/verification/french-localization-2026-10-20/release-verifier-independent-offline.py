"""Exercise selected verifier implementations without executing their live main."""
import ast,json,re,subprocess,hashlib,urllib.request,urllib.parse,tempfile,runpy,sys,contextlib,io
from pathlib import Path
from html.parser import HTMLParser
from email.message import Message
ROOT=Path.cwd();OUT=ROOT/'docs/verification/french-localization-2026-10-20';ORIGIN='https://you-owe-me.com'
source=(OUT/'verify-public.py').read_text();verifier_source=source;tree=ast.parse(source)
scope={'HTMLParser':HTMLParser,'ORIGIN':ORIGIN,'urllib':urllib,'hashlib':hashlib,'HEADERS':{'User-Agent':'offline review'}}
for name in ['Document','ExactUrlOnly','fetch','RedirectLog']:
 node=next(n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef)) and n.name==name)
 exec(compile(ast.Module(body=[node],type_ignores=[]),'production-'+name,'exec'),scope)
Document=scope['Document'];issues=[]
fixture=Document();fixture.feed('<body><p>outside-before</p><div id="main">inside-a<img src="/image.png" />inside-b<br />inside-c</div><p>outside-after</p></body>')
assert ''.join(fixture.mainText)=='inside-ainside-binside-c'
robot_fixture=Document();robot_fixture.feed('<meta name="robots" content="noindex"><meta name="robots" content="index,follow">')
if 'noindex' not in str(robot_fixture.robots):issues.append('Public parser hides an earlier noindex meta directive')
duplicate_fixture=Document();duplicate_rejected=False
try:duplicate_fixture.feed('<link rel="alternate" hreflang="fr" href="https://you-owe-me.com/fr/"><link rel="alternate" hreflang="fr" href="https://you-owe-me.com/fr/">')
except (AssertionError,ValueError):duplicate_rejected=True
if not duplicate_rejected:issues.append('Public parser does not fail on duplicate hreflang')
raw_tree=ast.parse((OUT/'raw-html-check.py').read_text());raw_scope={'HTMLParser':HTMLParser,'VOID':{'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}}
raw_node=next(n for n in raw_tree.body if isinstance(n,ast.ClassDef) and n.name=='Doc');exec(compile(ast.Module(body=[raw_node],type_ignores=[]),'production-raw-parser','exec'),raw_scope)
icons=Document();icons.feed('<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/images/touch.png"><link rel="preconnect" href="https://fonts.example.com">')
if icons.resources!=['/favicon.ico','/images/touch.png']:issues.append('Public resource parser omits icon/touch resources or includes preconnects')
raw_icons=raw_scope['Doc']();raw_icons.feed('<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/images/touch.png">')
if raw_icons.assets!=['/favicon.ico','/images/touch.png']:issues.append('Raw resource parser omits icon/touch resources')
raw=raw_scope['Doc']();raw.feed('<meta name="robots" content="noindex"><meta name="robots" content="index,follow">')
if 'noindex' not in str(raw.robots):issues.append('Local raw parser hides an earlier noindex meta directive')
raw_duplicate=raw_scope['Doc']();duplicate_raw_rejected=False
try:raw_duplicate.feed('<link rel="alternate" hreflang="fr" href="https://you-owe-me.com/fr/"><link rel="alternate" hreflang="fr" href="https://you-owe-me.com/fr/">')
except (AssertionError,ValueError):duplicate_raw_rejected=True
if not duplicate_raw_rejected:issues.append('Local raw parser does not fail on duplicate hreflang')
duplicate_id=raw_scope['Doc']()
try:duplicate_id.feed('<h2 id="same">First</h2><h2 id="same">Second</h2>')
except (AssertionError,ValueError):pass
else:issues.append('Local raw parser does not fail on duplicate IDs')
# Execute the current production graph over every currently admitted document.
PAGES=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {siteLocales,completedCounterparts} from './content/site-locales.mjs';console.log(JSON.stringify(siteLocales.find(l=>l.code==='es').pages.flatMap(p=>completedCounterparts(p.en))));"],text=True))
resources=set();page_receipts=[]
for page in PAGES:
 route=page['route'];file=ROOT/route.strip('/')/'index.html' if route!='/' else ROOT/'index.html';d=Document();d.feed(file.read_text());assert len(' '.join(d.mainText))>2000;page_receipts.append({'route':route,'mainTextLength':len(' '.join(d.mainText))})
 for ref in d.resources:
  u=urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN+route,ref))
  if u.netloc=='you-owe-me.com':resources.add(u.path+('?' +u.query if u.query else ''))
pending=list(resources);legacyMissing=[]
exec(compile(source[source.index('while pending:'):source.index('resources=sorted(resources)')],'production-dependency-graph','exec'),globals())
for expected in ['/scripts/loan-import-ui.mjs','/styles/loan-import.css']:
 assert any(r.startswith(expected) for r in resources),expected
assert any('/webfonts/' in r for r in resources)
# The actual request function is used with a fake opener. No socket is opened.
opened=[]
class Response:
 status=200
 def __init__(self,url):
  self.url=url;self.headers=Message();self.headers.add_header('Content-Type','text/plain');self.headers.add_header('X-Robots-Tag','noindex');self.headers.add_header('X-Robots-Tag','index')
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self):return b'offline fixture'
class Opener:
 def open(self,req,timeout):opened.append({'url':req.full_url,'method':req.get_method(),'body':req.data});return Response(req.full_url)
original=urllib.request.build_opener;urllib.request.build_opener=lambda *args:Opener();rejected=[]
try:
 for url in ['http://you-owe-me.com/fr/','https://example.com/fr/','https://continue.you-owe-me.com/split/?ref','https://continue.you-owe-me.com/split/?ref=','https://continue.you-owe-me.com/split/?ref=financial-data','https://you-owe-me.com/fr/?v=ok&amount=90']:
  before=len(opened)
  try:scope['fetch'](url)
  except AssertionError:rejected.append(url)
  else:raise AssertionError('Unsafe request accepted: '+url)
  assert len(opened)==before
 header_fixture=scope['fetch'](ORIGIN+'/fr/')
 if 'noindex' not in header_fixture['headers'].get('x-robots-tag',''):issues.append('Fetch hides an earlier duplicate X-Robots-Tag noindex header')
finally:urllib.request.build_opener=original
assert all(r['method']=='GET' and r['body'] is None for r in opened)
assert scope['ExactUrlOnly']().redirect_request(None,None,302,'Found',{},'https://example.com/') is None
redirect_rejections=[]
for url in ['http://you-owe-me.com/fr/','https://example.com/fr/','https://you-owe-me.com/fr/?ref','https://you-owe-me.com/fr/?v=anything']:
 logger=scope['RedirectLog']()
 try:logger.redirect_request(urllib.request.Request(ORIGIN+'/fr'),None,301,'Moved',{},url)
 except AssertionError:redirect_rejections.append(url)
 else:raise AssertionError('Unsafe redirect accepted: '+url)
 assert not logger.chain
private_files=subprocess.check_output(['git','ls-files','private-continuation'],text=True).splitlines();unchanged=[]
for file in private_files:
 if '/split/' in file:continue
 assert (ROOT/file).read_bytes()==subprocess.check_output(['git','show','a2eb93d:'+file]),file
 unchanged.append(file)
result={'accepted':not issues,'networkRequests':0,'issues':issues,'mainVoidFixturePass':True,'pages':page_receipts,'assetCount':len(resources),'resources':sorted(resources),'legacyMissing':legacyMissing,'queryPolicyRejected':rejected,'redirectPolicyRejected':redirect_rejections,'duplicateHeadersFixture':header_fixture['headers'],'unchangedNonSplitPrivate':unchanged,'limits':'Selected AST parser/request policy functions and production graph executed offline. No release or deployment result is claimed.'}
# Exercise the actual private job collector with hypothetical French assets and
# effective versioned references, without adding any product file.
private_block=verifier_source[verifier_source.index('private_doc=Document()'):verifier_source.index('with ThreadPoolExecutor(max_workers=5) as executor:private_split_dependencies')]
with tempfile.TemporaryDirectory(prefix='french-verifier-review-') as folder:
 fixture_root=Path(folder);split=fixture_root/'private-continuation/split';split.mkdir(parents=True)
 for filename in ['locale.js','french.css','arabic.css']:(split/filename).write_text('fixture')
 (fixture_root/'private-continuation/continuation.css').write_text('fixture')
 fixture_html='<link rel="stylesheet" href="../continuation.css"><link rel="stylesheet" href="/split/french.css?v=fr-fixture"><script src="locale.js?v=fr-fixture"></script>'
 (split/'index.html').write_text(fixture_html)
 private_scope={'Document':Document,'ROOT':fixture_root,'urllib':urllib,'private_files':['private-continuation/split/'+f for f in ['index.html','locale.js','french.css','arabic.css']]}
 exec(compile(private_block,'production-private-jobs','exec'),private_scope)
 jobs=private_scope['private_split_jobs'];assert ('private-continuation/split/french.css',None) in jobs;assert ('private-continuation/split/french.css','split/french.css?v=fr-fixture') in jobs;assert ('private-continuation/split/locale.js','split/locale.js?v=fr-fixture') in jobs;assert ('private-continuation/continuation.css','continuation.css') in jobs
 invalid_private=[]
 for invalid in ['<script src="https://example.com/unsafe.js"></script>','<script src="/split/missing.js"></script>']:
  (split/'index.html').write_text(invalid)
  try:exec(compile(private_block,'production-private-invalid','exec'),private_scope)
  except AssertionError:invalid_private.append(invalid)
  else:raise AssertionError('Unsafe/missing private dependency accepted')
 result['privateDependencyFixture']={'jobs':sorted([list(j) for j in jobs],key=str),'invalidRejected':invalid_private}
# The raw gate must reject robots:none using its actual assertion expression.
none_doc=raw_scope['Doc']();none_doc.feed('<meta name="robots" content="none">')
none_assert=next(n for n in raw_tree.body if isinstance(n,ast.Assert) and 're.search' in ast.unparse(n.test))
try:exec(compile(ast.Module(body=[none_assert],type_ignores=[]),'production-raw-none-check','exec'),{'re':re,'d':none_doc})
except AssertionError:result['rawRobotsNoneRejected']=True
else:raise AssertionError('Raw gate accepted robots:none')
# Run the deployment receipt program against fake exact-SHA API responses.
# A newer failed deployment must not be rescued by an older success receipt.
receipt_script=OUT/'pages-status.py';sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();receipt_results=[]
original_urlopen=urllib.request.urlopen;original_argv=sys.argv
class JsonResponse:
 def __init__(self,value):self.buffer=io.BytesIO(json.dumps(value).encode())
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,*args):return self.buffer.read(*args)
try:
 for state in ['success','failure','empty','wrong-sha']:
  with tempfile.TemporaryDirectory(prefix='french-deployment-review-') as folder:
   output=Path(folder)/'receipt.json';sys.argv=[str(receipt_script),sha,str(output)]
   deployments=[] if state=='empty' else [{'id':2,'sha':'0'*40 if state=='wrong-sha' else sha,'environment':'github-pages','created_at':'fixture-new'},{'id':1,'sha':sha,'environment':'github-pages','created_at':'fixture-old'}]
   def fake_urlopen(req,timeout):
    assert req.get_method()=='GET' and req.data is None
    assert req.full_url.startswith('https://api.github.com/repos/Midoris/you-owe-me-site/')
    if '/statuses' not in req.full_url:return JsonResponse(deployments)
    latest='/deployments/2/' in req.full_url
    return JsonResponse([{'state':'failure' if latest and state=='failure' else 'success','created_at':'fixture','log_url':'https://github.com/fixture','environment_url':ORIGIN}])
   urllib.request.urlopen=fake_urlopen;exit_code=None
   try:
    with contextlib.redirect_stdout(io.StringIO()):runpy.run_path(str(receipt_script),run_name='__main__')
   except SystemExit as error:exit_code=error.code
   except AssertionError:
    assert state=='wrong-sha';exit_code='assert-rejected'
   assert exit_code=={'success':0,'failure':2,'empty':2,'wrong-sha':'assert-rejected'}[state],(state,exit_code)
   receipt_results.append({'fixture':state,'exit':exit_code})
finally:urllib.request.urlopen=original_urlopen;sys.argv=original_argv
result['deploymentReceipts']=receipt_results
(OUT/'release-verifier-independent-offline.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'accepted':not issues,'pages':len(PAGES),'assets':len(resources),'issues':issues,'networkRequests':0},indent=2))
