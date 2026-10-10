#!/usr/bin/env python3
"""Builds dist/portfolio.html: one self-contained file (CSS, JS, JSON, images and CV inlined).
Run:  python3 build.py
Use it for quick previews, offline use, or publishing as a single file."""
import re, json, base64, os, mimetypes
ROOT=os.path.dirname(os.path.abspath(__file__))
def read(p,mode='r'):
    with open(os.path.join(ROOT,p),mode,**({} if 'b' in mode else {'encoding':'utf-8'})) as f: return f.read()
def uri(path):
    mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'}[os.path.splitext(path)[1].lower()]
    return f'data:{mime};base64,'+base64.b64encode(read(path,'rb')).decode()

html=read('index.html'); css=read('assets/css/style.css'); js=read('assets/js/app.js')
data=json.loads(read('data/content.json'))

# CSS: url(../img/x.webp) -> data URI
css=re.sub(r'url\(\.\./img/([^)]+)\)',lambda m:'url('+uri('assets/img/'+m.group(1))+')',css)
# HTML: src="assets/img/x.webp" -> data URI
html=re.sub(r'src="assets/img/([^"]+)"',lambda m:'src="'+uri('assets/img/'+m.group(1))+'"',html)
# JSON inlined (escape "<" so it can never close the script tag)
blob=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
cv=base64.b64encode(read(data['meta']['cvFile'],'rb')).decode()

html=html.replace('<link rel="stylesheet" href="assets/css/style.css">','<style>\n'+css+'\n</style>')
scripts=('<script type="application/json" id="site-data">'+blob+'</script>\n'
         '<script>window.CV_B64="'+cv+'";</script>\n'
         '<script>\n'+js+'\n</script>')
assert '<script src="assets/js/app.js"></script>' in html
html=html.replace('<script src="assets/js/app.js"></script>',scripts)
os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
out=os.path.join(ROOT,'dist','portfolio.html')
with open(out,'w',encoding='utf-8') as f: f.write(html)
print('OK ->',out,round(len(html)/1024),'KB')
