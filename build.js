#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;

function read(p, enc = 'utf8') {
  return fs.readFileSync(path.join(ROOT, p), enc);
}

function write(p, t) {
  fs.writeFileSync(path.join(ROOT, p), t, 'utf8');
}

function uri(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  const mime = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  }[ext] || 'application/octet-stream';
  const buf = fs.readFileSync(path.join(ROOT, relPath));
  return `data:${mime};base64,` + buf.toString('base64');
}

function strip(t) {
  t = t.replace(/\?v=[0-9a-f]+/g, '');
  t = t.replace(/window\.SITE_V="[0-9a-f]*";/g, 'window.SITE_V="";');
  t = t.replace(/var APP_V="[0-9a-f]*";/g, 'var APP_V="";');
  t = t.replace(/"version":\s*"[0-9a-f]*"/g, '"version": ""');
  return t;
}

// 1) Compute hash
const hash = crypto.createHash('sha1');
for (const p of ['index.html', 'assets/css/style.css', 'assets/js/app.js', 'data/content.json']) {
  if (fs.existsSync(path.join(ROOT, p))) {
    hash.update(strip(read(p)));
  }
}

function walkAssets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAssets(full);
    } else if (/\.(webp|png|jpg|jpeg|svg|pdf)$/i.test(entry.name)) {
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      hash.update(rel);
      hash.update(fs.readFileSync(full));
    }
  }
}
walkAssets(path.join(ROOT, 'assets'));

const V = hash.digest('hex').slice(0, 10);
console.log('version', V);

function stamp(p, fn) {
  const t = read(p);
  const n = fn(t);
  if (n !== t) write(p, n);
}

stamp('index.html', t =>
  t.replace(/window\.SITE_V="[0-9a-f]*";/g, 'window.SITE_V="' + V + '";')
   .replace(/\?v=[0-9a-f]+/g, '?v=' + V)
);
stamp('assets/css/style.css', t => t.replace(/\?v=[0-9a-f]+/g, '?v=' + V));
stamp('assets/js/app.js', t => t.replace(/var APP_V="[0-9a-f]*";/g, 'var APP_V="' + V + '";'));
stamp('data/content.json', t => t.replace(/"version":\s*"[0-9a-f]*"/g, '"version": "' + V + '"'));

let html = read('index.html');
let css = read('assets/css/style.css');
let js = read('assets/js/app.js');
const data = JSON.parse(read('data/content.json'));

// CSS: url(../img/x.webp) -> data URI
css = css.replace(/url\(\.\.\/img\/([^)?]+)(?:\?[^)]*)?\)/g, (m, g1) => 'url(' + uri('assets/img/' + g1) + ')');

// HTML: src="assets/img/x.webp" -> data URI
html = html.replace(/src="assets\/img\/([^"?]+)(?:\?[^"]*)?"/g, (m, g1) => 'src="' + uri('assets/img/' + g1) + '"');

// JSON inlined: inline case images for full standalone support
for (const prj of (data.projects || [])) {
  if (prj.case && prj.case.image && prj.case.image.startsWith('assets/img/')) {
    prj.case.image = uri(prj.case.image);
  }
}
const blob = JSON.stringify(data).replace(/</g, '\\u003c');
const cvBuf = fs.readFileSync(path.join(ROOT, data.meta.cvFile));
const cv = cvBuf.toString('base64');

html = html.replace(/<link rel="stylesheet" href="assets\/css\/style\.css(?:\?v=[0-9a-f]+)?">/, '<style>\n' + css + '\n</style>');
const scripts = '<script type="application/json" id="site-data">' + blob + '</script>\n' +
                '<script>window.CV_B64="' + cv + '";</script>\n' +
                '<script>\n' + js + '\n</script>';
html = html.replace(/<script src="assets\/js\/app\.js(?:\?v=[0-9a-f]+)?"><\/script>/, scripts);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const out = path.join(ROOT, 'dist', 'portfolio.html');
fs.writeFileSync(out, html, 'utf8');
console.log('OK ->', out, Math.round(html.length / 1024), 'KB');
