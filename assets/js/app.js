/* Portfolio app: reads data/content.json (or the inlined copy in the single-file build) */
function start(DATA){
var D=document,root=D.documentElement;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
function b(i,e){return '<span lang="id">'+i+'</span><span lang="en">'+e+'</span>'}
function T(v){return typeof v==='string'?v:b(v.id,v.en)}
var ARW='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/* fill bilingual text and contact data from content.json */
D.querySelectorAll('[data-t]').forEach(function(el){var v=DATA.strings[el.getAttribute('data-t')];if(v)el.innerHTML=b(v.id,v.en)});
D.querySelectorAll('[data-mail]').forEach(function(el){el.href='mailto:'+DATA.meta.email;el.textContent=DATA.meta.email});
D.querySelectorAll('[data-linkedin]').forEach(function(el){el.href=DATA.meta.linkedin});

/* career capsules */
var CAPS=DATA.career;
D.getElementById('caps').innerHTML=CAPS.map(function(c,i){return '<div class="cap" title="'+c.name+', '+c.years+'"><i style="--h:'+Math.max(12,Math.round(c.years/9.3*100))+';--j:'+i+'"></i><small>'+c.initial+'</small></div>'}).join('');

/* tabs data */
var XP=DATA.experience.map(function(x){
  var tab=x.tab.label?T(x.tab.label):'<b>'+x.tab.name+'</b><small>'+T(x.tab.dates)+'</small>';
  return {l:tab,one:x.tab.label?1:0,n:T(x.company),r:T(x.role),w:T(x.period),d:T(x.desc)};
});
function mkTabs(id,items,render){
  var box=D.getElementById(id),tb=box.querySelector('.tabs'),tc=box.querySelector('.tc');
  tb.innerHTML=items.map(function(it,i){return '<button type="button" role="tab" aria-selected="'+(i===0)+'" data-i="'+i+'">'+it.l+'</button>'}).join('');
  function sel(i){tb.querySelectorAll('button').forEach(function(x,k){x.setAttribute('aria-selected',String(k===i))});tc.innerHTML=render(items[i]);tc.classList.remove('swap');void tc.offsetWidth;tc.classList.add('swap')}
  tb.addEventListener('click',function(e){var bt=e.target.closest('button');if(bt)sel(+bt.dataset.i)});
  sel(0);
}
var STORY=DATA.story.map(function(s){
  var o={l:T(s.label),h:T(s.text)};
  if(s.languages)o.x='<div class="lgs"><span class="k">'+T(s.languages.label)+'</span>'+s.languages.items.map(function(i){return '<span>'+T(i)+'</span>'}).join('')+'</div>';
  return o;
});
mkTabs('tb-story',STORY,function(it){return '<p>'+it.h+'</p>'+(it.x||'')});
mkTabs('tb-exp',XP,function(it){return '<div class="exd"><b>'+it.n+'</b><div class="exr">'+it.r+' <i>&bull;</i> '+it.w+'</div><p>'+it.d+'</p></div>'});
D.querySelectorAll('#tb-exp .tabs button').forEach(function(bt,i){if(XP[i].one)bt.classList.add('one')});

/* charts */
function rnd(seed){var s=seed;return function(){s=(s*9301+49297)%233280;return s/233280}}
function viz(k,d){
  var o='<svg viewBox="0 0 400 200" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',i,n;
  for(i=0;i<4;i++)o+='<path d="M20 '+(24+i*44)+'H386" stroke-width="1" opacity=".16"/>';
  if(k==='bars'){d.forEach(function(h,i){o+='<rect class="bar" style="--j:'+i+'" x="'+(36+i*58)+'" y="'+(188-h)+'" width="40" height="'+h+'" rx="20" fill="currentColor" stroke="none" opacity=".8"/>'})}
  else if(k==='line'||k==='steps'){
    n=d.length;var pts=d.map(function(v,i){return [30+i*(340/(n-1)),188-v]}),p='';
    if(k==='line')pts.forEach(function(q,i){p+=(i?'L':'M')+q[0].toFixed(1)+' '+q[1]});
    else pts.forEach(function(q,i){p+=(i?'H'+q[0].toFixed(1)+'V'+q[1]:'M'+q[0].toFixed(1)+' '+q[1])});
    o+='<path class="dr" pathLength="1" d="'+p+'"/>';
    if(k==='line')pts.forEach(function(q){o+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="4" fill="#0D0D0D"/>'});
  }
  else if(k==='scatter'){var r=rnd(7);for(i=0;i<110;i++){var a=i%2,x=a?280+(r()-.5)*110:70+r()*130,y=a?100+(r()-.5)*100:150-(x-70)*.55+(r()-.5)*40;o+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.4" fill="currentColor" stroke="none" opacity=".85"/>'}}
  else if(k==='dots'){for(var c=0;c<16;c++)for(var j=0;j<6;j++){var rr=1+(Math.sin(c*.7+j*.9)+1)*2;o+='<circle cx="'+(32+c*22)+'" cy="'+(30+j*28)+'" r="'+rr.toFixed(1)+'" fill="currentColor" stroke="none" opacity=".8"/>'}}
  else if(k==='curve'){var ps='';for(i=0;i<=40;i++){ps+=(i?'L':'M')+(24+i*9)+' '+(130-42*Math.sin(i/6.5)-i*1.1).toFixed(1)}o+='<path d="'+ps+'L384 190L24 190Z" fill="currentColor" stroke="none" opacity=".14"/><path class="dr" pathLength="1" d="'+ps+'"/>'}
  return o+'</svg>';
}
var PRJ=DATA.projects;
var CATS=DATA.filters;
var pf='all',pg=0,PER=3,cards=D.getElementById('cards'),flt=D.getElementById('flt');
flt.innerHTML=CATS.map(function(c,i){return '<button type="button" data-f="'+c.key+'" aria-pressed="'+(i===0)+'">'+T(c.label)+'</button>'}).join('');
function renderCards(){
  var L=PRJ.filter(function(p){return pf==='all'||p.cat===pf}),pages=Math.max(1,Math.ceil(L.length/PER));
  if(pg>=pages)pg=0;if(pg<0)pg=pages-1;
  cards.innerHTML=L.slice(pg*PER,pg*PER+PER).map(function(p){
    return '<article class="tile card"><div class="viz">'+viz(p.viz,p.data)+'<i class="cb"><i class="ar"></i></i></div><h3>'+T(p.title)+'</h3><p>'+T(p.desc)+'</p><div class="tags">'+p.tags.map(function(g){return '<span>'+T(g)+'</span>'}).join('')+'</div><span class="more">'+T(DATA.ui.caseSoon)+'</span></article>';
  }).join('');
  cards.querySelectorAll('i.ar').forEach(function(e){e.innerHTML=ARW});
  var ts=cards.querySelectorAll('.tile');
  ts.forEach(function(t,i){t.style.setProperty('--d',(i*70)+'ms')});
  requestAnimationFrame(function(){ts.forEach(function(t){t.classList.add('on','pop')})});
  D.getElementById('pinfo').textContent=(pg+1)+' / '+pages;
  D.getElementById('pcount').textContent=String(L.length).padStart(2,'0');
}
flt.addEventListener('click',function(e){var bt=e.target.closest('button');if(!bt)return;pf=bt.dataset.f;pg=0;flt.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x===bt))});renderCards()});
D.getElementById('prev').addEventListener('click',function(){pg--;renderCards()});
D.getElementById('next').addEventListener('click',function(){pg++;renderCards()});
renderCards();

D.querySelectorAll('i.ar').forEach(function(e){e.innerHTML=ARW});
D.querySelectorAll('.rl span[lang]').forEach(function(el){
  el.innerHTML=el.innerHTML.split(/<br\s*\/?>/i).map(function(t,i){return '<span class="ln"><span class="ci" style="--i:'+i+'">'+t+'</span></span>'}).join('');
  el.style.display='block';
});

/* language + routing state */
var btns=D.querySelectorAll('.lang button'),PAGES=['home','projects','about','contact'];
var TT=DATA.pageTitles;
var cur=PAGES.indexOf(location.hash.slice(1))>-1?location.hash.slice(1):'home';
function title(){D.title=TT[cur][root.getAttribute('data-l')==='en'?'en':'id']+DATA.meta.titleSuffix}
function setLang(l){root.setAttribute('data-l',l);root.lang=l;btns.forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.set===l))});title();try{localStorage.setItem('lang',l)}catch(e){}setTimeout(updInd,30)}
btns.forEach(function(x){x.addEventListener('click',function(){setLang(x.dataset.set)})});
var sv=null;try{sv=localStorage.getItem('lang')}catch(e){}
if(sv==='id'||sv==='en')setLang(sv);

var links=D.getElementById('links'),ind=D.getElementById('ind');
function updInd(){var a=links.querySelector('[aria-current="page"]');if(!a)return;ind.style.left=a.offsetLeft+'px';ind.style.width=a.offsetWidth+'px'}
addEventListener('resize',updInd);
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(updInd);

var ready=false;
function countUp(p,instant){
  p.querySelectorAll('.cnt').forEach(function(el){
    var to=+el.dataset.to,suf=el.dataset.suf||'',pad=+el.dataset.pad||0;
    function fmt(v){var s=String(v);while(s.length<pad)s='0'+s;return s+suf}
    if(reduce||instant){el.textContent=fmt(to);return}
    var t0=null;function step(t){if(t0===null)t0=t;var k=Math.min(1,Math.max(0,(t-t0-500)/1200)),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(to*e));if(k<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  });
}
function enter(p){
  var ts=p.querySelectorAll('.tile');
  ts.forEach(function(t,i){t.classList.remove('on','pop');t.style.setProperty('--d',(i*80)+'ms')});
  void p.offsetWidth;
  requestAnimationFrame(function(){ts.forEach(function(t){t.classList.add('on')});countUp(p)});
}

var linesKill=null;
function killLines(){if(linesKill)linesKill()}
function drawAllLines(done){
  killLines();
  var NS='http://www.w3.org/2000/svg',sr=stage.getBoundingClientRect(),SW=stage.offsetWidth,SH=stage.offsetHeight;
  var hadLoading=root.classList.contains('loading');
  if(hadLoading){root.classList.add('notrans');root.classList.remove('loading')}
  function rect(el){var r=el.getBoundingClientRect();return {x:(r.left-sr.left)/K,y:(r.top-sr.top)/K,w:r.width/K,h:r.height/K}}
  function clear(c){return !c||c==='transparent'||/^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(c)}
  function clipped(el,b){
    for(var a=el.parentElement;a&&a!==stage;a=a.parentElement){
      var cs=getComputedStyle(a);
      if(cs.overflowX==='visible'&&cs.overflowY==='visible')continue;
      var r=rect(a);
      if(b.x<r.x-1.5||b.y<r.y-1.5||b.x+b.w>r.x+r.w+1.5||b.y+b.h>r.y+r.h+1.5)return true;
    }
    return false;
  }
  var items=[];
  [].forEach.call(stage.querySelectorAll('*'),function(el){
    if(el instanceof SVGElement||el.tagName==='CANVAS')return;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return;
    var bw=[cs.borderTopWidth,cs.borderRightWidth,cs.borderBottomWidth,cs.borderLeftWidth].map(parseFloat);
    if(!(bw[0]>0||bw[1]>0||bw[2]>0||bw[3]>0))return;
    var bc=[cs.borderTopColor,cs.borderRightColor,cs.borderBottomColor,cs.borderLeftColor];
    var b=rect(el);if(b.w<2||b.h<2||clipped(el,b))return;
    var rr=cs.borderTopLeftRadius,rx=parseFloat(rr)||0;if(/%/.test(rr))rx=rx/100*Math.min(b.w,b.h);
    rx=Math.min(rx,b.w/2,b.h/2);
    var cx=b.x+b.w/2,cy=b.y+b.h/2,shell=el.classList.contains('shell');
    if(bw[0]>0&&bw.every(function(v){return v===bw[0]})&&bc.every(function(c){return c===bc[0]})&&!clear(bc[0])){
      items.push({t:'box',b:b,w:bw[0],c:bc[0],rx:rx,cx:cx,cy:cy,shell:shell});
      if(el.classList.contains('pill'))items.push({t:'box',b:{x:b.x+3.5-bw[0]/2,y:b.y+3.5-bw[0]/2,w:b.w-7+bw[0],h:b.h-7+bw[0]},w:1,c:bc[0],rx:Math.max(0,rx-3),cx:cx,cy:cy});
    }else{
      for(var i=0;i<4;i++)if(bw[i]>0&&!clear(bc[i]))items.push({t:'side',i:i,b:b,w:bw[i],c:bc[i],cx:cx,cy:cy});
    }
  });
  root.classList.add('lines');
  if(hadLoading)root.classList.add('loading');
  requestAnimationFrame(function(){root.classList.remove('notrans')});
  var ov=D.createElementNS(NS,'svg');
  ov.setAttribute('class','lo');ov.setAttribute('width',SW);ov.setAttribute('height',SH);ov.setAttribute('viewBox','0 0 '+SW+' '+SH);ov.setAttribute('aria-hidden','true');
  var maxEnd=0;
  function add(tag,attrs,it,len){
    var e=D.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);
    e.setAttribute('pathLength','1');e.setAttribute('fill','none');
    e.style.cssText='stroke:'+it.c+';stroke-width:'+it.w+'px;stroke-dasharray:1;stroke-dashoffset:1';
    ov.appendChild(e);
    var delay=it.shell?0:((it.cx/SW)*.55+(it.cy/SH)*.45)*750+60,dur=it.shell?1100:Math.max(450,Math.min(1000,len*.9));
    maxEnd=Math.max(maxEnd,delay+dur);
    if(e.animate)e.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:dur,delay:delay,easing:'cubic-bezier(.45,0,.2,1)',fill:'both'});
  }
  items.forEach(function(it){
    var b=it.b,w=it.w;
    if(it.t==='box'){
      var x=b.x+w/2,y=b.y+w/2,ww=Math.max(0,b.w-w),hh=Math.max(0,b.h-w),r=Math.max(0,it.rx-w/2);
      add('rect',{x:x,y:y,width:ww,height:hh,rx:r,ry:r},it,2*(ww+hh));
    }else{
      var d;
      if(it.i===0)d='M'+b.x+' '+(b.y+w/2)+'H'+(b.x+b.w);
      else if(it.i===2)d='M'+b.x+' '+(b.y+b.h-w/2)+'H'+(b.x+b.w);
      else if(it.i===3)d='M'+(b.x+w/2)+' '+b.y+'V'+(b.y+b.h);
      else d='M'+(b.x+b.w-w/2)+' '+b.y+'V'+(b.y+b.h);
      add('path',{d:d},it,it.i%2?b.h:b.w);
    }
  });
  stage.appendChild(ov);
  var timer=setTimeout(end,maxEnd+80);
  function end(){
    clearTimeout(timer);linesKill=null;
    root.classList.remove('lines');
    ov.style.transition='opacity .35s';ov.style.opacity='0';setTimeout(function(){ov.remove()},420);
    if(done)done();
  }
  linesKill=function(){clearTimeout(timer);linesKill=null;root.classList.remove('lines');ov.remove()};
}
function linesIn(p){
  killLines();
  var ts=[].slice.call(p.querySelectorAll('.tile'));
  root.classList.add('instant');
  [].forEach.call(p.querySelectorAll('.swap'),function(e){e.classList.remove('swap')});
  ts.forEach(function(t){t.style.setProperty('--d','0ms');t.classList.remove('pop');t.classList.add('on')});
  countUp(p,true);
  drawAllLines();
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.remove('instant')})});
}
var wipe=D.querySelector('.wipe');
function show(name,mode){
  if(mode==='lines')root.classList.add('notrans');
  PAGES.forEach(function(n){D.getElementById('p-'+n).hidden=n!==name});
  links.querySelectorAll('a').forEach(function(a){if(a.dataset.p===name)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  cur=name;root.setAttribute('data-pg',name);title();updInd();scrollTo(0,0);
  if(ready){if(mode==='lines')linesIn(D.getElementById('p-'+name));else enter(D.getElementById('p-'+name))}
  if(name==='home')sizeOrb();
}
function go(){
  var n=location.hash.slice(1);if(PAGES.indexOf(n)<0)n='home';
  if(n===cur)return;
  if(reduce||!ready){show(n);return}
  show(n,'lines');
}
addEventListener('hashchange',go);

/* orb */
var hero=D.getElementById('heroT'),cv=D.getElementById('orb'),cx=cv.getContext('2d'),PT=[],W=0,H=0,mx=0,my=0,smx=0,smy=0;
for(var i=0;i<800;i++){var yy=1-2*(i+.5)/800,rr=Math.sqrt(1-yy*yy),th=i*2.399963;PT.push([Math.cos(th)*rr,yy,Math.sin(th)*rr])}
function sizeOrb(){var d=Math.min((devicePixelRatio||1)*K,2.5);if(!hero.offsetWidth)return;W=hero.offsetWidth;H=hero.offsetHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);drawOrb(performance.now())}
function drawOrb(t){
  if(!W)return;cx.clearRect(0,0,W,H);
  var R=Math.min(H*.55,W*.3),ox=W*.78,oy=H*.5,ry=(reduce?0:t*.00018)+smx*.5,rx=-.3+smy*.3,cy=Math.cos(ry),sy=Math.sin(ry),cxr=Math.cos(rx),sxr=Math.sin(rx);
  cx.fillStyle='#fff';
  for(var i=0;i<PT.length;i++){
    var p=PT[i],x1=p[0]*cy+p[2]*sy,z1=-p[0]*sy+p[2]*cy,y2=p[1]*cxr-z1*sxr,z2=p[1]*sxr+z1*cxr,X=ox+x1*R,Y=oy+y2*R,d=(z2+1)/2;
    cx.globalAlpha=Math.min(1,(.12+d*.8)*(.15+Math.min(1,X/W)*1.1));
    cx.beginPath();cx.arc(X,Y,.6+d*1.6,0,6.2832);cx.fill();
  }
  cx.globalAlpha=1;
}
hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5});
hero.addEventListener('mouseleave',function(){mx=0;my=0});
addEventListener('resize',sizeOrb);
if(!reduce)(function loop(t){smx+=(mx-smx)*.06;smy+=(my-smy)*.06;if(!D.getElementById('p-home').hidden&&!D.hidden)drawOrb(t);requestAnimationFrame(loop)})(0);

var stage=D.getElementById('stage'),K=1,ori='';
function fit(){
  var vv=window.visualViewport,vw=Math.round(vv?vv.width:innerWidth),vh=Math.round(vv?vv.height:innerHeight);
  var p=vw/vh<.9,bw=p?400:1366,bh=p?880:768,k=Math.min(vw/bw,vh/bh);
  K=k;root.style.setProperty('--k',k);
  root.setAttribute('data-o',p?'p':'l');
  stage.style.width=(vw/k)+'px';stage.style.height=(vh/k)+'px';stage.style.transform='scale('+k+')';
  root.classList.add('fit');
  var np=p?2:3;
  if(ori!==(p?'p':'l')){ori=p?'p':'l';PER=np;pg=0;renderCards()}
  updInd();sizeOrb();
}
addEventListener('resize',fit);addEventListener('orientationchange',function(){setTimeout(fit,120)});
if(window.visualViewport)visualViewport.addEventListener('resize',fit);
fit();
show(cur);
/* intro: blank -> scattered boxes -> assemble -> outlines */
var introStarted=false;
function intro(){
  if(introStarted)return;introStarted=true;
  var page=D.getElementById('p-'+cur);
  var els=[].slice.call(page.querySelectorAll('.tile')).concat([].slice.call(D.querySelectorAll('.top .pill')));
  var tiles=els.filter(function(e){return e.classList.contains('tile')});
  var assembled=false,done=false,timers=[],anims=[],svgs=[];
  function at(ms,fn){timers.push(setTimeout(fn,ms))}
  function settle(){
    if(assembled)return;assembled=true;
    root.classList.add('go');
    tiles.forEach(function(t){t.style.setProperty('--d','0ms');t.classList.add('on')});
    anims.forEach(function(a){try{a.cancel()}catch(e){}});
    countUp(page);
  }
  function finish(){
    if(done)return;done=true;timers.forEach(clearTimeout);
    settle();killLines();
    root.classList.remove('loading');ready=true;
    svgs.forEach(function(sv){sv.style.transition='opacity .5s';sv.style.opacity='0';setTimeout(function(){sv.remove()},650)});
    removeEventListener('pointerdown',finish);removeEventListener('keydown',finish);
  }
  if(!els.length||!els[0].animate){finish();return}
  root.classList.add('measure');
  var SW=stage.offsetWidth,SH=stage.offsetHeight,sr=stage.getBoundingClientRect();
  var info=els.map(function(el){var r=el.getBoundingClientRect();return {cx:(r.left+r.width/2-sr.left)/K,cy:(r.top+r.height/2-sr.top)/K}});
  root.classList.remove('measure');
  var order=els.map(function(_,i){return i}).sort(function(){return Math.random()-.5});
  var T={a:.15,ad:.45,as:1.15,ad2:1.0},endMax=0;
  els.forEach(function(el,i){
    var rk=order[i],sx=SW*(.06+Math.random()*.88),sy=SH*(.1+Math.random()*.8);
    var dx=sx-info[i].cx,dy=sy-info[i].cy,rot=(Math.random()-.5)*30,sc=.26+Math.random()*.34;
    var t0='translate('+dx+'px,'+dy+'px) rotate('+rot+'deg) scale('+(sc*.35)+')';
    var t1='translate('+dx+'px,'+dy+'px) rotate('+rot+'deg) scale('+sc+')';
    var d0=(T.a+rk*.05)*1000,s1=(T.as+rk*.035)*1000,dur=s1+T.ad2*1000-d0;
    endMax=Math.max(endMax,d0+dur);
    anims.push(el.animate([
      {offset:0,opacity:0,transform:t0,easing:'cubic-bezier(.2,.9,.2,1.15)'},
      {offset:T.ad*1000/dur,opacity:1,transform:t1,easing:'linear'},
      {offset:(s1-d0)/dur,opacity:1,transform:t1,easing:'cubic-bezier(.7,0,.2,1)'},
      {offset:1,opacity:1,transform:'translate(0px,0px) rotate(0deg) scale(1)'}
    ],{duration:dur,delay:d0,fill:'both'}));
  });
  at(endMax+40,function(){settle();drawAllLines(finish)});
  at(endMax+40+6000,finish);
  at(9000,finish);
  addEventListener('pointerdown',finish);addEventListener('keydown',finish);
}
if(root.classList.contains('loading')){
  if(D.fonts&&D.fonts.ready){var fto=setTimeout(intro,1200);D.fonts.ready.then(function(){clearTimeout(fto);intro()})}else intro();
}else{ready=true;enter(D.getElementById('p-'+cur))}

/* magnetic + cursor + print */
if(fine&&!reduce){
  D.querySelectorAll('[data-mag]').forEach(function(el){
    el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2/K)+'px,'+((e.clientY-r.top-r.height/2)*.3/K)+'px)'});
    el.addEventListener('mouseleave',function(){el.style.transform=''});
  });
  var c=D.createElement('div');c.className='cur';D.body.appendChild(c);
  var ax=-100,ay=-100,tx=-100,ty=-100;
  addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;c.classList.add('vis')});
  D.addEventListener('mouseleave',function(){c.classList.remove('vis')});
  D.addEventListener('mouseover',function(e){c.classList.toggle('big2',!!(e.target.closest&&e.target.closest('a,button,.tp>span')))});
  (function f(){ax+=(tx-ax)*.2;ay+=(ty-ay)*.2;c.style.transform='translate('+(ax-17)+'px,'+(ay-17)+'px)';requestAnimationFrame(f)})();
}
(function(){
  var m=D.getElementById('cvm'),btn=D.getElementById('cvbtn'),dl=D.getElementById('cvdl'),x=D.getElementById('cvx'),bk=D.getElementById('cvbk'),st=D.getElementById('cvst');
  var idle=st.innerHTML;
  function open(){m.hidden=false;st.innerHTML=idle;x.focus()}
  function close(){m.hidden=true;btn.focus()}
  function msg(i,e){st.innerHTML=b(i,e)}
  function cvBytes(){
    if(window.CV_B64){var bin=atob(window.CV_B64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return Promise.resolve(u)}
    return fetch(DATA.meta.cvFile).then(function(r){if(!r.ok)throw new Error('cv');return r.arrayBuffer()}).then(function(buf){return new Uint8Array(buf)});
  }
  async function save(){
    var name=DATA.meta.cvName,blob;
    try{blob=new Blob([await cvBytes()],{type:'application/pdf'})}catch(e){msg('Gagal memuat file CV.','Could not load the CV file.');return}
    try{
      var d=(window.claude&&window.claude.use)?await window.claude.use('downloads'):null;
      if(d){msg('Menunggu konfirmasi unduhan...','Waiting for download confirmation...');await d.save({filename:name,data:blob});msg('CV berhasil diunduh.','CV downloaded.');return}
    }catch(e){
      if(e&&e.code==='declined'){msg('Unduhan dibatalkan.','Download cancelled.');return}
      if(e&&e.code==='rate_limited'){msg('Mohon tunggu sebentar, lalu coba lagi.','Please wait a moment and try again.');return}
    }
    try{var u=URL.createObjectURL(blob),a=D.createElement('a');a.href=u;a.download=name;D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);msg('CV diunduh.','CV downloaded.')}
    catch(e){msg('Unduhan tidak tersedia di tampilan ini. Gunakan Cetak (Ctrl+P) lalu simpan sebagai PDF.','Download is not available in this view. Use Print (Ctrl+P) and save as PDF.')}
  }
  btn.addEventListener('click',open);x.addEventListener('click',close);bk.addEventListener('click',close);dl.addEventListener('click',save);
  D.addEventListener('keydown',function(e){
    if(m.hidden)return;
    if(e.key==='Escape'){e.preventDefault();close()}
    else if(e.key==='Tab'){var f=[dl,x],i=f.indexOf(D.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}
  });
})();

}

(function(){
  var inline=document.getElementById('site-data');
  if(inline){start(JSON.parse(inline.textContent));return}
  fetch('data/content.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(start).catch(function(err){
    document.documentElement.classList.remove('loading');document.documentElement.classList.add('safe');
    var m=document.createElement('p');m.style.cssText='position:fixed;left:16px;right:16px;top:16px;z-index:200;font:14px/1.5 system-ui;background:#fff;color:#000;border:2px solid #000;border-radius:12px;padding:12px';
    m.textContent='Gagal memuat data/content.json. Jika membuka file langsung dari komputer, jalankan lewat server lokal (mis. "python -m http.server") atau gunakan dist/portfolio.html. / Could not load data/content.json. Serve the folder over HTTP or use dist/portfolio.html.';
    document.body.appendChild(m);console.error(err);
  });
})();
