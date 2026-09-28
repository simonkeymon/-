// Procedural drawing for the sheets. Runs before the engine collects animations.
window.SCENE_GEN = [
function gears(){document.querySelectorAll('.gear').forEach(g=>{const {mk}=AI;
  mk(g,'circle',{class:'d',r:34,'data-t':2.4});mk(g,'circle',{class:'d',r:12,'data-t':2.5});
  for(let i=0;i<12;i++){const r=mk(g,'g',{transform:`rotate(${i*30})`});mk(r,'rect',{class:'p',x:-5,y:-45,width:10,height:12,'data-t':2.6+i*.03})}})},

function cards(){const g=document.querySelector('#s5 .cards'),{mk}=AI;
  for(let i=4;i>=1;i--){const x=680+12*i,y=40+12*i;
    mk(g,'path',{class:'d',d:`M${x+308},${y} H${x+320} V${y+200} H${x} V${y+188}`,'data-t':3.4+(4-i)*.1,'stroke-opacity':1-i*.15})}},

function chess(){const {mk}=AI;const sq=document.querySelector('#s6 .squares'),pc=document.querySelector('#s6 .pieces');
  let k=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2)mk(sq,'rect',{class:'f',x:40+c*50,y:100+r*50,width:50,height:50,fill:'#eaf3ff','fill-opacity':.12,stroke:'none','data-t':1.4+(k++)*.012,'data-d':.4});
  const P=[['♜',0,0],['♚',6,0],['♟',5,1],['♟',6,1],['♟',7,1],['♞',5,2],['♟',3,3],['♘',4,3],['♕',3,4],['♗',2,4],['♙',4,4],['♙',5,6],['♙',6,6],['♙',7,6],['♖',5,7],['♔',6,7]];
  P.forEach(([s,c,r],i)=>mk(pc,'text',{class:'p chess','font-size':40,'text-anchor':'middle',x:40+c*50+25,y:100+r*50+40,'data-t':1.8+i*.05},s));
  const tr=document.querySelector('#s6 .tree');
  const X=[480,610,740,870,1010];let prev=[[480,300]];
  for(let L=1;L<=4;L++){const n=Math.pow(3,L),cur=[];
    for(let i=0;i<n;i++){const y=60+(i+.5)*(480/n);cur.push([X[L],y]);const p=prev[Math.floor(i/3)];
      mk(tr,'path',{class:'d',d:`M${p[0]},${p[1]} L${X[L]},${y}`,'stroke-width':L===4?.8:2-L*.3,'stroke-opacity':L===4?.55:1,'data-t':2.2+L*.55+i*(0.25/n),'data-d':.5})}
    prev=cur}
  let lv=[[480,300]];for(let L=0;L<=3;L++){const n=Math.pow(3,L);for(let i=0;i<n;i++){const y=L?60+(i+.5)*(480/n):300;
    mk(tr,'circle',{class:'p',cx:X[L],cy:y,r:[8,6,4,2.5][L],fill:'#eaf3ff',stroke:'none','data-t':2.5+L*.55+i*.004})}}},

function cnn(){const {mk}=AI;const g=document.querySelector('#s7 .boxes');
  const B=[[240,130,24,240,48],[340,165,30,170,44],[445,200,34,110,38],[548,220,38,70,32]];
  B.forEach(([x,y,w,h,d],i)=>{const t=2.0+i*.3;
    mk(g,'path',{class:'d',d:`M${x},${y} h${w} v${h} h${-w} z`,'data-t':t});
    mk(g,'path',{class:'d',d:`M${x},${y} l${d},${-d} h${w} l${-d},${d} M${x+w},${y} l${d},${-d} v${h} l${-d},${d}`,'data-t':t+.15,'stroke-width':1.4});
    if(i<3){const nx=B[i+1][0];mk(g,'path',{class:'d',d:`M${x+w+d*.5},250 H${nx-4}`,'marker-end':'url(#ar)','data-t':t+.25,'stroke-width':1.5})}});
  const dn=document.querySelector('#s7 .dense');const c1=[],c2=[];
  for(let i=0;i<6;i++){c1.push([670,175+i*30]);c2.push([730,175+i*30])}
  c1.forEach(([x,y],i)=>mk(dn,'path',{class:'d',d:`M624,255 L${x-7},${y}`,'stroke-width':.8,'stroke-opacity':.7,'data-t':3.2+i*.03,'data-d':.4}));
  c1.forEach(a=>c2.forEach(b=>mk(dn,'path',{class:'d',d:`M${a[0]+7},${a[1]} L${b[0]-7},${b[1]}`,'stroke-width':.6,'stroke-opacity':.6,'data-t':3.5,'data-d':.5})));
  [...c1,...c2].forEach(([x,y],i)=>mk(dn,'circle',{class:'p',cx:x,cy:y,r:7,fill:'#0f3f86','data-t':3.3+i*.02}))},

function go(){const {mk,rng}=AI;const b=document.querySelector('#s8 .goboard');let d='';
  for(let i=1;i<18;i++){d+=`M${40+i*30},50 V590 M40,${50+i*30} H580 `}
  mk(b,'path',{class:'d',d,'stroke-width':1,'data-t':1.0,'data-d':1.2});
  [3,9,15].forEach(c=>[3,9,15].forEach(r=>mk(b,'circle',{class:'p',cx:40+c*30,cy:50+r*30,r:4,fill:'#eaf3ff',stroke:'none','data-t':2.0})));
  const s=document.querySelector('#s8 .stones'),R=rng(37),used=new Set(['13,9']);const pts=[];
  const anchors=[[3,3],[15,3],[3,15],[15,15],[9,9],[3,9],[15,9]];
  while(pts.length<46){const a=anchors[Math.floor(R()*anchors.length)];const c=Math.round(a[0]+(R()-.5)*7),r=Math.round(a[1]+(R()-.5)*7);
    if(c<1||c>17||r<1||r>17||used.has(c+','+r)||(Math.abs(c-13)<2&&Math.abs(r-9)<2))continue;used.add(c+','+r);pts.push([c,r])}
  pts.forEach(([c,r],i)=>{const black=i%2===0;mk(s,'circle',{class:'p',cx:40+c*30,cy:50+r*30,r:13,fill:black?'#eaf3ff':'#0f3f86',stroke:black?'none':'#eaf3ff','stroke-width':2,'data-t':2.3+i*.1,'data-d':.25})});
  mk(s,'circle',{class:'p',cx:430,cy:320,r:13,fill:'#eaf3ff',stroke:'none','data-t':7.3,'data-d':.35});
  mk(s,'text',{class:'f m',x:430,y:325,'text-anchor':'middle','font-size':13,'font-weight':600,fill:'#0f3f86',style:'fill:#0f3f86','data-t':7.4},'37');
  mk(s,'circle',{class:'d ys',cx:430,cy:320,r:22,'stroke-width':3,'data-t':7.5,'data-d':.5});
  mk(s,'path',{class:'d ys',d:'M452,316 C520,300 570,292 626,292','stroke-width':2,'data-t':7.6,'data-d':.5})},

function attention(){const {mk}=AI;const T=['猫','没有','跳上','桌子','，','因为','它','太','累','了'];const W=[1,.15,.3,.45,.05,.2,0,.15,.35,.1];
  const tk=document.querySelector('#s9 .tokens'),ar=document.querySelector('#s9 .arcs');const cx=i=>20+i*104+44;
  T.forEach((s,i)=>{mk(tk,'rect',{class:'d'+(i===6?' ys':''),x:20+i*104,y:330,width:88,height:62,'stroke-width':i===6?3:2,'data-t':0.8+i*.08});
    mk(tk,'text',{class:'f'+(i===6?' y':''),x:cx(i),y:371,'text-anchor':'middle','font-size':28,'data-t':1.0+i*.08},s)});
  let k=0;T.forEach((s,j)=>{if(j===6||j===0)return;const dx=cx(j)-cx(6),h=30+Math.abs(dx)*.35;
    mk(ar,'path',{class:'d',d:`M${cx(6)},328 Q${(cx(6)+cx(j))/2},${328-2*h} ${cx(j)},328`,'stroke-width':1+5*W[j],'stroke-opacity':.35+.65*W[j],'data-t':2.4+(k++)*.18,'data-d':.7})});
  const dx=cx(0)-cx(6),h=30+Math.abs(dx)*.35;
  mk(ar,'path',{class:'d ys',d:`M${cx(6)},328 Q${(cx(6)+cx(0))/2},${328-2*h} ${cx(0)},328`,'stroke-width':6,'data-t':4.3,'data-d':1.2,'marker-end':'url(#ary)'})},

function growth(){const p=document.querySelector('#s10 .growth');const k=.06,N=Math.exp(60*k)-1;let d='';
  for(let day=0;day<=60;day+=0.5){const u=(Math.exp(k*day)-1)/N;const x=700+day*5.5,y=560-u*460;d+=(day?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' '}
  p.setAttribute('d',d)},
];
