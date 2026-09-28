// Timeline-driven renderer: window.seek(t) paints the frame at time t (seconds).
(function(){
const CFG = window.CONFIG, TOTAL = CFG.total, WIN = 0.6, WOUT = 0.4;
const TICKS = CFG.ticks, SHEETS = TICKS.length;
const SVGNS = 'http://www.w3.org/2000/svg';
const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const eout = p=>1-Math.pow(1-p,3);
const einout = p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const back = p=>{const c=1.7;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mk(parent,tag,attrs,text){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;parent.appendChild(e);return e}
window.AI = {mk,rng,SVGNS};

// ---------- generic generators ----------
function genericInit(root){
  root.querySelectorAll('[data-hatch]').forEach(el=>{const [x,y,w,h,s]=el.dataset.hatch.split(',').map(Number);let d='';
    for(let k=s;k<h+w;k+=s){const x1=x+Math.max(0,k-h),y1=y+Math.min(k,h),x2=x+Math.min(k,w),y2=y+Math.max(0,k-w);d+=`M${x1},${y1} L${x2},${y2} `}el.setAttribute('d',d)});
  root.querySelectorAll('[data-snow]').forEach(el=>{const [cx,cy,r]=el.dataset.snow.split(',').map(Number);let d='';
    for(let i=0;i<6;i++){const a=i*Math.PI/3,ex=cx+r*Math.cos(a),ey=cy+r*Math.sin(a);d+=`M${cx},${cy} L${ex},${ey} `;
      const bx=cx+r*.6*Math.cos(a),by=cy+r*.6*Math.sin(a);for(const s of [-1,1]){const b=a+s*.7;d+=`M${bx},${by} L${bx+r*.3*Math.cos(b)},${by+r*.3*Math.sin(b)} `}}el.setAttribute('d',d)});
}

// ---------- collect animations ----------
const DEF = {d:.9,f:.6,w:1.2,p:.35,ty:2,c:1.6,follow:2};
function collect(root){
  const list=[];
  const groupIdx=new Map();
  root.querySelectorAll('.d,.f,.w,.p,.ty,.c,.flow,.spin,.blink,.follow').forEach(el=>{
    const types=['d','f','w','p','ty','c','flow','spin','blink','follow'].filter(c=>el.classList.contains(c));
    for(const type of types){
      const a={el,type,svg:el instanceof SVGElement};
      let t=el.dataset.t;
      if(t==null){const g=el.closest('[data-g]');if(g){const [b,s]=g.dataset.g.split(',').map(Number);const i=groupIdx.get(g)||0;groupIdx.set(g,i+1);t=b+i*s}else t=0}
      a.t=+t; a.d=+(el.dataset.d||DEF[type]||1); a.out=el.dataset.out!=null?+el.dataset.out:null;
      if(type==='d'){el.setAttribute('pathLength','1');el.style.strokeDasharray='1 1';
        const m=el.getAttribute('marker-end'),ms=el.getAttribute('marker-start');if(m){a.me=m;el.removeAttribute('marker-end')}if(ms){a.ms=ms;el.removeAttribute('marker-start')}}
      if(type==='ty'){a.chars=Array.from(el.textContent);if(!el.dataset.d)a.d=a.chars.length*0.055}
      if(type==='w'&&!el.dataset.d)a.d=clamp(Array.from(el.textContent).length*0.075,.6,2.2);
      if(type==='c'){a.to=+el.dataset.to;a.from=+(el.dataset.from||0);a.suf=el.dataset.suf||''}
      if(type==='flow'||type==='follow'){a.path=document.getElementById(el.dataset.path);a.len=a.path.getTotalLength();a.period=+(el.dataset.period||1.6)}
      list.push(a);
    }
  });
  return list;
}
function fmt(n){return Math.round(n).toLocaleString('en-US')}
function apply(a,local){
  const el=a.el;const p=clamp((local-a.t)/a.d);
  const o=a.out==null?1:1-clamp((local-a.out)/.4);
  switch(a.type){
    case 'd':{el.style.strokeDashoffset=1-eout(p);el.style.opacity=(p>0?1:0)*o;
      if(a.me){if(p>=.97)el.setAttribute('marker-end',a.me);else el.removeAttribute('marker-end')}
      if(a.ms){if(p>=.97)el.setAttribute('marker-start',a.ms);else el.removeAttribute('marker-start')}break}
    case 'f':{const e=eout(p);el.style.opacity=e*o;if(!a.svg)el.style.translate=`0 ${(1-e)*14}px`;break}
    case 'w':{el.style.clipPath=`inset(-30px ${(1-p)*100}% -30px -30px)`;el.style.opacity=(p>0?1:0)*o;break}
    case 'p':{el.style.opacity=Math.min(1,p*3)*o;el.style.scale=p>=1?'1':String(Math.max(0,back(p)));break}
    case 'ty':{const n=Math.floor(p*a.chars.length);const s=a.chars.slice(0,n).join('');if(el.textContent!==s)el.textContent=s;el.style.opacity=(p>0?1:0)*o;break}
    case 'c':{el.textContent=fmt(a.from+(a.to-a.from)*eout(p))+a.suf;el.style.opacity=(p>0?1:0)*o;break}
    case 'flow':{if(local<a.t){el.style.opacity=0;break}const f=((local-a.t)/a.period)%1;const pt=a.path.getPointAtLength(f*a.len);
      el.setAttribute('cx',pt.x);el.setAttribute('cy',pt.y);el.style.opacity=Math.sin(Math.PI*f)*o;break}
    case 'follow':{const pt=a.path.getPointAtLength(eout(p)*a.len);el.setAttribute('transform',`translate(${pt.x},${pt.y})`);el.style.opacity=(p>0?1:0)*(1-clamp((local-a.t-a.d-.6)/.5));break}
    case 'spin':{el.style.rotate=`${Math.max(0,local-a.t)*35}deg`;break}
    case 'blink':{el.style.opacity=local<a.t?0:(Math.floor((local-a.t)*2.2)%2?0:1);break}
  }
}

// ---------- setup ----------
let scenes,globalAnims,hud={};
function init(){
  document.querySelectorAll('.scene').forEach(s=>{if(CFG.starts[s.id]!=null)s.dataset.start=CFG.starts[s.id]});
  document.querySelectorAll('.scene').forEach(s=>{const inner=document.createElement('div');inner.className='inner';while(s.firstChild)inner.appendChild(s.firstChild);s.appendChild(inner)});
  genericInit(document);
  (window.SCENE_GEN||[]).forEach(fn=>fn());
  scenes=[...document.querySelectorAll('.scene')].map(el=>({el,inner:el.firstChild,start:+el.dataset.start,ds:el.dataset}));
  scenes.forEach((s,i)=>{s.end=i<scenes.length-1?scenes[i+1].start:TOTAL;s.anims=collect(s.el)});
  globalAnims=collect(document.getElementById('global'));
  // timeline
  const tl=document.getElementById('tl');
  TICKS.forEach((l,i)=>{const x=i*(960/(TICKS.length-1));
    tl.insertAdjacentHTML('beforeend',`<div class="t" style="left:${x}px"></div><div class="l" style="left:${x}px">${l}</div>`)});
  hud.labels=[...tl.querySelectorAll('.l')];hud.mark=tl.querySelector('.on');hud.fill=tl.querySelector('.fill');
  hud.root=document.getElementById('hud');hud.tag=document.getElementById('tag');
  hud.tb=['dwg','by','site'].map(k=>document.getElementById('tb-'+k));
  hud.scan=document.getElementById('scan');hud.fade=document.getElementById('fade');
  hud.cur=-1;hud.sub=document.getElementById('sub');hud.subText=null;
}
function tickX(i){return i*(960/(TICKS.length-1))}

window.seek=function(t){
  for(const a of globalAnims)apply(a,t);
  let cur=0;
  scenes.forEach((s,i)=>{if(t>=s.start)cur=i;
    const from=i===0?-99:s.start-WIN,to=i===scenes.length-1?999:s.end+WOUT;
    if(t<from||t>to){s.el.style.visibility='hidden';return}
    s.el.style.visibility='visible';
    let L=0,R=0;
    if(i>0&&t<s.start+WOUT)R=1920-wipeX(t,s.start);
    if(i<scenes.length-1&&t>s.end-WIN)L=wipeX(t,s.end);
    s.el.style.clipPath=(L||R)?`inset(0 ${R}px 0 ${L}px)`:'none';
    const local=t-s.start;
    s.inner.style.scale=String(1+0.015*clamp(local/(s.end-s.start)));
    for(const a of s.anims)apply(a,local);
  });
  // scan line
  let sx=null;for(let i=1;i<scenes.length;i++){const B=scenes[i].start;if(t>B-WIN&&t<B+WOUT)sx=wipeX(t,B)}
  hud.scan.style.opacity=sx==null?0:1;if(sx!=null)hud.scan.style.left=sx+'px';
  // HUD
  hud.root.style.opacity=eout(clamp((t-(scenes[1].start-0.7))/.9));
  const s=scenes[cur];
  if(cur!==hud.cur){hud.cur=cur;const ds=s.ds.sheet?s.ds:scenes[1].ds;{hud.tag.textContent=`DWG. AI-HIST / SHEET ${ds.sheet} OF ${SHEETS} — ${ds.chap}`;
    hud.tb[0].textContent=ds.dwg;hud.tb[1].textContent=ds.by;hud.tb[2].textContent=ds.site;
    hud.labels.forEach((l,k)=>l.classList.toggle('cur',k===+ds.tick))}}
  const flick=Math.min(clamp(Math.abs(t-s.start)/.35),cur+1<scenes.length?clamp(Math.abs(scenes[cur+1].start-t)/.35):1);
  hud.tb.forEach(e=>e.style.opacity=flick);hud.tag.style.opacity=flick;
  // marker
  let mi=0;
  for(let i=1;i<scenes.length;i++){const B=scenes[i].start;const ti=+scenes[i].ds.tick,tp=+(scenes[i-1].ds.tick||0);
    if(t>=B+WIN)mi=ti;else if(t>B-WIN){mi=tp+(ti-tp)*einout((t-(B-WIN))/(2*WIN))}}
  const mx=tickX(mi);hud.mark.style.left=mx+'px';hud.fill.style.width=mx+'px';
  hud.fade.style.opacity=clamp((t-(TOTAL-1.3))/1.2);
  let cue=null;for(const c of CFG.subs)if(t>=c.s-.05&&t<c.e+.25){cue=c}
  const txt=cue?cue.text:'';if(txt!==hud.subText){hud.subText=txt;hud.sub.firstChild.textContent=txt}
  hud.sub.style.opacity=cue?Math.min(clamp((t-(cue.s-.05))/.12),clamp((cue.e+.25-t)/.12)):0;
};
function wipeX(t,B){return 1920*einout(clamp((t-(B-WIN))/(WIN+WOUT)))}
window.TOTAL=TOTAL;
window.addEventListener('load',()=>{init();window.seek(+(new URLSearchParams(location.search).get('t')||0));
  if(new URLSearchParams(location.search).has('play')){const t0=performance.now()-(+(new URLSearchParams(location.search).get('t')||0))*1000;
    const loop=()=>{seek((performance.now()-t0)/1000);requestAnimationFrame(loop)};loop()}
  window.READY=true});
})();
