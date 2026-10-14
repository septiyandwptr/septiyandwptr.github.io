#!/usr/bin/env python3
"""Builds dist/portfolio.html: one self-contained file (CSS, JS, JSON, images and CV inlined).
Run:  python3 build.py
Use it for quick previews, offline use, or publishing as a single file."""
import re, json, base64, os, hashlib
ROOT=os.path.dirname(os.path.abspath(__file__))
def read(p,mode='r'):
    with open(os.path.join(ROOT,p),mode,**({} if 'b' in mode else {'encoding':'utf-8'})) as f: return f.read()
def uri(path):
    mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'}[os.path.splitext(path)[1].lower()]
    return f'data:{mime};base64,'+base64.b64encode(read(path,'rb')).decode()

def write(p,t):
    with open(os.path.join(ROOT,p),'w',encoding='utf-8') as f: f.write(t)

# ---- 1) stamp a version into every file so browsers/CDNs never mix old and new files
def strip(t):
    t=re.sub(r'\?v=[0-9a-f]+','',t)
    t=re.sub(r'window\.SITE_V="[0-9a-f]*";','window.SITE_V="";',t)
    t=re.sub(r'var APP_V="[0-9a-f]*";','var APP_V="";',t)
    t=re.sub(r'"version":\s*"[0-9a-f]*"','"version": ""',t)
    return t
h=hashlib.sha1()
for p in ['index.html','assets/css/style.css','assets/js/app.js','data/content.json']: h.update(strip(read(p)).encode())
for dp,dn,fn in sorted(os.walk(os.path.join(ROOT,'assets'))):
    for f in sorted(fn):
        if f.endswith(('.webp','.png','.jpg','.jpeg','.svg','.pdf')):
            full=os.path.join(dp,f); h.update(os.path.relpath(full,ROOT).encode()); h.update(open(full,'rb').read())
V=h.hexdigest()[:10]
def stamp(p,fn):
    t=read(p); n=fn(t)
    if n!=t: write(p,n)
stamp('index.html',lambda t:re.sub(r'window\.SITE_V="[0-9a-f]*";','window.SITE_V="'+V+'";',re.sub(r'\?v=[0-9a-f]+','?v='+V,t)))
stamp('assets/css/style.css',lambda t:re.sub(r'\?v=[0-9a-f]+','?v='+V,t))
stamp('assets/js/app.js',lambda t:re.sub(r'var APP_V="[0-9a-f]*";','var APP_V="'+V+'";',t))
stamp('data/content.json',lambda t:re.sub(r'"version":\s*"[0-9a-f]*"','"version": "'+V+'"',t))
print('version',V)

html=read('index.html'); css=read('assets/css/style.css'); js=read('assets/js/app.js')
data=json.loads(read('data/content.json'))

# CSS: url(../img/x.webp) -> data URI
css=re.sub(r'url\(\.\./img/([^)?]+)(?:\?[^)]*)?\)',lambda m:'url('+uri('assets/img/'+m.group(1))+')',css)
# HTML: src="assets/img/x.webp" -> data URI
html=re.sub(r'src="assets/img/([^"?]+)(?:\?[^"]*)?"',lambda m:'src="'+uri('assets/img/'+m.group(1))+'"',html)
# JSON inlined (escape "<" so it can never close the script tag)
for prj in data.get('projects', []):
    if prj.get('case', {}).get('image', '').startswith('assets/img/'):
        prj['case']['image'] = uri(prj['case']['image'])
blob=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
cv=base64.b64encode(read(data['meta']['cvFile'],'rb')).decode()

html,n1=re.subn(r'<link rel="stylesheet" href="assets/css/style\.css(?:\?v=[0-9a-f]+)?">',lambda m:'<style>\n'+css+'\n</style>',html)
assert n1==1
scripts=('<script type="application/json" id="site-data">'+blob+'</script>\n'
         '<script>window.CV_B64="'+cv+'";</script>\n'
         '<script>\n'+js+'\n</script>')
html,n2=re.subn(r'<script src="assets/js/app\.js(?:\?v=[0-9a-f]+)?"></script>',lambda m:scripts,html)
assert n2==1
os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
out=os.path.join(ROOT,'dist','portfolio.html')
with open(out,'w',encoding='utf-8') as f: f.write(html)
print('OK ->',out,round(len(html)/1024),'KB')
