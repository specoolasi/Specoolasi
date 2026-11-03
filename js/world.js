/* Specoolasi HQ: realistic isometric social-media diorama (needs three.js r128 + #hq in index.html) */
(function(){'use strict';
/* ===== EDIT YOUR ACCOUNTS HERE (texts are placeholders) =====
   posts: [{img:'https://...', link:'https://...'}]   link: the account URL */
const ACC=[
{id:'popthusiast',n:'Popthusiast',e:'🎤',vibe:'Fan energy, 24/7',tags:['K-pop','Idol edits','Girl groups'],link:'',posts:[],d:'Edits of your favorite K-pop girl idols.'},
{id:'ketahui-id',n:'Ketahui.id',e:'🇮🇩',vibe:'Kabar terbaru, setiap hari',tags:['Indonesia','News','Updates'],link:'',posts:[],d:'Indonesian news updates.'},
{id:'globall-id',n:'Globall_id',e:'⚽',vibe:'Full time, worldwide',tags:['Football','Match news','Transfers'],link:'',posts:[],d:'Football news from all around the world.'},
{id:'popnewsiast',n:'Popnewsiast',e:'🎵',vibe:'Music news, on air',tags:['Music news','Releases','Worldwide'],link:'',posts:[],d:'Music news from all around the world.'},
{id:'dramories',n:'Dramories',e:'🎬',vibe:'Feel every scene',tags:['K-drama','Movie edits','Clips'],link:'',posts:[],d:'Clips and edits from Korean movies and series.'},
{id:'listenation',n:'Listenation',e:'🎧',vibe:'Turn it up',tags:['EDM','Recommendations','Playlists'],link:'',posts:[],d:'EDM and music recommendations.'},
{id:'gloome',n:'Gloome',e:'🌙',vibe:'Quiet, moody, aesthetic',tags:['Quotes','Relatable','Late night'],link:'',posts:[],d:'Relatable quotes.'},
{id:'clippods-id',n:'Clippods.id',e:'🎙️',vibe:'Press record',tags:['Podcast clips','Indonesian creators','Video'],link:'',posts:[],d:'Clips from Indonesian content creator podcasts.'}
];
/* Real data from js/accounts.js (read again every time a room opens, so posts added later show up) */
const sync=a=>{if(!window.ACCOUNTS)return;const m=ACCOUNTS.find(x=>x.id===a.id);if(!m)return;
 a.n=m.name||a.n;if(m.desc)a.d=m.desc;a.page='account.html?id='+encodeURIComponent(m.id);a.posts=(m.samples||[]).slice(0,6)};
ACC.forEach(sync);
/* ---------- three.js basics ---------- */
const mount=document.getElementById('hq');if(!mount||!window.THREE)return;
const $=id=>document.getElementById(id);
mount.innerHTML='<p class="hq-hint">Drag to explore &middot; tap a room &middot; +/&minus; or Ctrl + scroll to zoom</p><div class="hq-stage" id="hq-stage"><canvas id="hq-c"></canvas><div class="hq-tools"><button id="hq-zi" aria-label="Zoom in">+</button><button id="hq-zo" aria-label="Zoom out">&minus;</button><button id="hq-hm">HQ</button></div><aside class="hq-info" id="hq-info"></aside></div>';
const stage=$('hq-stage'),canvas=$('hq-c');
/* One-room mode: <div id="hq" data-room="account-id"> shows only that account's room (used on account pages) */
const SOLO=mount.dataset.room||'',SI=SOLO?ACC.findIndex(a=>a.id===SOLO):-1;
if(SOLO&&SI<0){mount.innerHTML='';return}
const BGM=SI>=0&&!!mount.dataset.bg; /* data-bg: use the room as a page background (account pages) */
if(SI>=0){mount.classList.add(BGM?'hq-bgm':'hq-solo');$('hq-hm').style.display='none'}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})}
catch(err){mount.innerHTML='<p class="state">The HQ needs WebGL, which this browser could not start. You can still open each account from the <a href="index.html#social">home page</a>.</p>';return}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
/* soft daylight: sky/ground bounce + one warm sun that casts the shadows */
scene.add(new THREE.HemisphereLight(0xffffff,0xb7a6e6,.72));
const sun=new THREE.DirectionalLight(0xfff1dc,1.25);
sun.position.set(60,58,30);sun.target.position.set(24,0,12);scene.add(sun,sun.target);
sun.castShadow=true;const SM=matchMedia('(pointer:coarse)').matches?2048:4096;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-58,right:58,top:46,bottom:-46,near:1,far:220});
sun.shadow.bias=-.0004;sun.shadow.normalBias=.05;sun.shadow.radius=3;
const fill=new THREE.DirectionalLight(0xcfd8ff,.3);fill.position.set(-30,30,-20);scene.add(fill);
const HF=46,camera=new THREE.OrthographicCamera(-1,1,1,-1,-300,500);

/* ---------- materials & shapes (soft PBR instead of flat voxels) ---------- */
const BG=new THREE.BoxGeometry(1,1,1),SG=new THREE.SphereGeometry(1,24,16),CG=new THREE.CylinderGeometry(1,1,1,24);
const HAIR=new THREE.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI*.56);
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
function setC(m,h){const c=lin(h);m.color.copy(c);if(m.userData.glow)m.emissive.copy(c)}
const mats={};
function mat(c){if(typeof c!=='string')return c;if(mats[c])return mats[c];let m;
 if(c[0]==='*'){const k=lin(c.slice(1));m=new THREE.MeshStandardMaterial({color:k,emissive:k,emissiveIntensity:.8,roughness:.5,metalness:0});m.userData.glow=1}
 else m=new THREE.MeshStandardMaterial({color:lin(c),roughness:.72,metalness:.04});
 return mats[c]=m}
const mesh=(geo,c)=>{const m=new THREE.Mesh(geo,mat(c));m.castShadow=m.receiveShadow=true;return m};
/* rounded, bevelled box (cached by size) so edges catch light like real objects */
const RG={};
function rbox(w,h,d){const key=[w,h,d].map(v=>v.toFixed(3)).join();if(RG[key])return RG[key];
 const r=Math.min(.07,w/3,h/3,d/3);let g;
 if(Math.min(w,h,d)<.09)g=new THREE.BoxGeometry(w,h,d);
 else{const b=r*.6,sw=w-2*b,sd=d-2*b,cr=Math.max(.001,Math.min(r,sw/2-.001,sd/2-.001)),x=-sw/2,y=-sd/2,s=new THREE.Shape();
  s.moveTo(x+cr,y);s.lineTo(x+sw-cr,y);s.quadraticCurveTo(x+sw,y,x+sw,y+cr);s.lineTo(x+sw,y+sd-cr);s.quadraticCurveTo(x+sw,y+sd,x+sw-cr,y+sd);
  s.lineTo(x+cr,y+sd);s.quadraticCurveTo(x,y+sd,x,y+sd-cr);s.lineTo(x,y+cr);s.quadraticCurveTo(x,y,x+cr,y);
  g=new THREE.ExtrudeGeometry(s,{depth:h-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});g.rotateX(-Math.PI/2);g.center()}
 return RG[key]=g}
function B(g,x,z,w,d,h,c,y=0){const m=mesh(rbox(w,h,d),c);m.position.set(x+w/2,y+h/2,z+d/2);if(h<.09)m.castShadow=false;g.add(m);return m}
function S(g,x,y,z,r,c){const m=mesh(SG,c);m.scale.setScalar(r);m.position.set(x,y,z);g.add(m);return m}
function Cy(g,x,z,r,h,c,y=0){const m=mesh(CG,c);m.scale.set(r,h,r);m.position.set(x,y+h/2,z);g.add(m);return m}
function P(g,x,z,w,d,y,m){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);p.rotation.x=-Math.PI/2;p.position.set(x+w/2,y,z+d/2);p.receiveShadow=true;g.add(p);return p}
function tint(h,f){const n=parseInt(h.slice(1),16);return'#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('')}

/* procedural textures: wood boards, tiles, mown grass, paving (no image files needed) */
const rgba=(h,f=1,a=1)=>{const n=parseInt(h.slice(1),16);return`rgba(${[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f)))).join(',')},${a})`};
function canvasTex(size,draw,rx=1,ry=rx){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.repeat.set(rx,ry);return t}
const speck=(x,s,n,a)=>{for(let i=0;i<n;i++){x.fillStyle=Math.random()<.5?`rgba(0,0,0,${a})`:`rgba(255,255,255,${a})`;x.fillRect(Math.random()*s,Math.random()*s,1+Math.random()*2,1+Math.random()*2)}};
const TEX={
 wood:(col)=>canvasTex(1024,(x,s)=>{const cols=10,pw=s/cols;x.fillStyle=col;x.fillRect(0,0,s,s);
  for(let i=0;i<cols;i++){let y=-Math.random()*s*.4;while(y<s){const len=s*(.3+Math.random()*.4);x.fillStyle=rgba(col,.86+Math.random()*.26);x.fillRect(i*pw,y,pw,len);
   for(let k=0;k<10;k++){x.strokeStyle=`rgba(0,0,0,${.03+Math.random()*.05})`;x.lineWidth=1;const gx=i*pw+Math.random()*pw;x.beginPath();x.moveTo(gx,y);x.lineTo(gx+(Math.random()*6-3),y+len);x.stroke()}
   x.fillStyle='rgba(0,0,0,.32)';x.fillRect(i*pw,y,pw,2);y+=len}
   x.fillStyle='rgba(0,0,0,.3)';x.fillRect(i*pw,0,2,s)}speck(x,s,2500,.05)}),
 tile:(col)=>canvasTex(1024,(x,s)=>{const n=5,t=s/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=rgba(col,(i+j)%2?1.16:.94);x.fillRect(i*t,j*t,t,t);
   const g=x.createLinearGradient(i*t,j*t,(i+1)*t,(j+1)*t);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.08)');x.fillStyle=g;x.fillRect(i*t,j*t,t,t)}
  x.fillStyle='rgba(0,0,0,.28)';for(let i=0;i<=n;i++){x.fillRect(i*t-1.5,0,3,s);x.fillRect(0,i*t-1.5,s,3)}speck(x,s,3000,.04)}),
 grass:(col)=>canvasTex(1024,(x,s)=>{const n=10,t=s/n;for(let j=0;j<n;j++){x.fillStyle=rgba(col,j%2?1.1:.92);x.fillRect(0,j*t,s,t)}
  for(let i=0;i<9000;i++){x.strokeStyle=Math.random()<.5?'rgba(0,60,10,.14)':'rgba(190,255,170,.12)';x.lineWidth=1;const gx=Math.random()*s,gy=Math.random()*s;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+Math.random()*3-1.5,gy-3-Math.random()*4);x.stroke()}}),
 ground:(col)=>canvasTex(512,(x,s)=>{x.fillStyle=col;x.fillRect(0,0,s,s);for(let i=0;i<7000;i++){x.strokeStyle=Math.random()<.5?'rgba(0,70,20,.16)':'rgba(200,255,190,.14)';x.lineWidth=1;const gx=Math.random()*s,gy=Math.random()*s;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+Math.random()*3-1.5,gy-3-Math.random()*4);x.stroke()}},10,8),
 stone:(col)=>canvasTex(1024,(x,s)=>{const n=8,t=s/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=rgba(col,.93+Math.random()*.13);x.fillRect(i*t,j*t,t,t)}
  x.fillStyle='rgba(60,50,90,.28)';for(let i=0;i<=n;i++){x.fillRect(i*t-1.5,0,3,s);x.fillRect(0,i*t-1.5,s,3)}speck(x,s,5000,.05)},9.5,4)
};
const floorMat=(style,col)=>new THREE.MeshStandardMaterial({map:TEX[style==='grass'?'grass':style==='tile'?'tile':'wood'](col),roughness:style==='tile'?.35:style==='grass'?.95:.5,metalness:0});

const ticks=[],NPCS=[],bubs=[];let curRoom=-1;
function blink(m,a,b,per=.5,ph=0){m.material=m.material.clone();ticks.push(t=>setC(m.material,Math.floor((t+ph)/per)%2?a:b))}
const anc=(g,x,y,z)=>{const o=new THREE.Object3D();o.position.set(x,y,z);g.add(o);return o};
function bb(target,emoji,delay,cls='hq-bb',dy=3){const el=document.createElement('div');el.className=cls;el.innerHTML=`<span style="animation-delay:${delay}s">${emoji}</span>`;el.style.display='none';stage.appendChild(el);bubs.push({el,target,room:curRoom,dy:cls==='hq-bb'?dy:0})}
const fx=(g,x,y,z,e,d)=>bb(anc(g,x,y,z),e,d,'hq-fx');

/* ---------- people: smooth stylised figures ---------- */
const SKIN=['#f2c29b','#e0a67a','#c68a5f','#8d5a3b','#f7d2b3'];
function npc(g,x,z,shirt,act,o={}){
 const n=new THREE.Group();n.position.set(x,o.y||0,z);n.rotation.y=o.rot||0;
 const sk=o.skin||SKIN[Math.abs(Math.floor(x*3+z*5))%SKIN.length],hr=o.hair||'#2b1d17',pants=o.pants||'#2d3a5a';
 const part=(geo,c,sx,sy,sz,px,py,pz,par=n)=>{const m=mesh(geo,c);m.scale.set(sx,sy,sz);m.position.set(px,py,pz);par.add(m);return m};
 const limb=(px,py,w,h,c,end,shoulder)=>{const p=new THREE.Group();p.position.set(px,py,0);n.add(p);part(CG,c,w/2,h,w/2,0,-h/2,0,p);
  if(end)part(SG,end,w*.56,w*.56,w*.56,0,-h,0,p);if(shoulder)part(SG,c,w*.62,w*.62,w*.62,0,0,0,p);return p};
 const legL=limb(-.2,.75,.32,.75,pants),legR=limb(.2,.75,.32,.75,pants);
 [legL,legR].forEach(l=>part(SG,'#f2f2f2',.19,.12,.27,0,-.72,.07,l));
 if(o.sit){legL.rotation.x=legR.rotation.x=-1.57;if(o.chair!==0)B(g,x-.5,z-.5,1,1,.7,o.chair||'#555',o.y||0)}
 part(rbox(.8,.3,.46),pants,1,1,1,0,.82,0);
 part(rbox(.85,.9,.5),shirt,1,1,1,0,1.2,0);
 const armL=limb(-.55,1.6,.26,.85,shirt,sk,1),armR=limb(.55,1.6,.26,.85,shirt,sk,1);
 if(o.stick)part(CG,'*#b8ff3d',.05,.9,.05,0,-1,0,armR);
 const head=new THREE.Group();head.position.set(0,1.65,0);n.add(head);
 part(CG,sk,.12,.18,.12,0,.02,0,head);
 part(SG,sk,.34,.35,.33,0,.32,0,head);
 const cap=part(HAIR,hr,.375,.375,.375,0,.33,-.015,head);cap.rotation.x=-.28;
 part(SG,hr,.35,.3,.26,0,.26,-.14,head);
 [-.12,.12].forEach(ex=>{part(SG,'#17131f',.045,.058,.03,ex,.35,.31,head);part(SG,'#ff9aa8',.06,.035,.02,ex*1.9,.26,.28,head).material=mat('#e8a39a')});
 part(SG,'#b5524b',.06,.02,.02,0,.2,.325,head);
 if(o.hp){const band=new THREE.Mesh(new THREE.TorusGeometry(.37,.028,8,28,Math.PI),mat('#17131f'));band.position.set(0,.32,0);band.castShadow=true;head.add(band);
  [-.37,.37].forEach(sx=>{const cup=part(CG,'#ff4f9a',.13,.05,.13,sx,.32,0,head);cup.rotation.z=Math.PI/2})}
 g.add(n);
 const ob={n,armL,armR,legL,legR,head,act,ph:o.ph??Math.random()*6,by:n.position.y,path:o.path,pi:0,wait:0};NPCS.push(ob);return ob;
}

function upd(o,t,dt){const a=o.act,p=o.ph,s=Math.sin(t*6+p);
 if(o.hop>0){o.hop-=dt*1.6;if(o.hop>0){o.n.position.y=o.by+Math.abs(Math.sin(o.hop*Math.PI*2))*.9;o.armL.rotation.z=-2.6;o.armR.rotation.z=2.6;return}o.n.position.y=o.by;o.armL.rotation.z=o.armR.rotation.z=0}
 if(a==='dance'||a==='cheer'){if(a==='dance')o.n.position.y=o.by+Math.abs(s)*.3;o.armL.rotation.z=-(2.5+.4*s);o.armR.rotation.z=2.5+.4*Math.sin(t*6+p+1.5);o.legL.rotation.x=s*.3;o.legR.rotation.x=-s*.3}
 else if(a==='type'){o.armL.rotation.x=-1.4+.15*Math.sin(t*14+p);o.armR.rotation.x=-1.4+.15*Math.sin(t*14+p+2)}
 else if(a==='read'){o.armL.rotation.x=o.armR.rotation.x=-1.2;o.head.rotation.x=.25+.1*Math.sin(t*1.5+p)}
 else if(a==='nod'){o.head.rotation.x=.14*Math.sin(t*3+p);o.n.position.y=o.by+.05*Math.sin(t*3+p)}
 else if(a==='wave'){o.armR.rotation.z=2.5+.4*Math.sin(t*8+p)}
 else if(a==='talk'){o.head.rotation.x=.12*Math.sin(t*9+p);o.armR.rotation.x=-.9+.5*Math.sin(t*4+p)}
 else if(a==='mic'){o.armR.rotation.x=-2.4;o.armL.rotation.x=-.3;o.head.rotation.x=.1*Math.sin(t*9+p)}
 else if(a==='point'){o.armR.rotation.z=1.9+.1*Math.sin(t*2+p);o.head.rotation.y=.25*Math.sin(t+p)}
 else if(a==='dj'){o.armL.rotation.x=-1.2+.4*Math.sin(t*5+p);o.armR.rotation.x=-1.2+.4*Math.sin(t*5+p+2);o.head.rotation.x=.15*Math.sin(t*6+p)}
 else if(a==='walk'){
  if(o.wait>0){o.wait-=dt;o.legL.rotation.x=o.legR.rotation.x=o.armL.rotation.x=o.armR.rotation.x=0;return}
  const w=o.path[o.pi],dx=w[0]-o.n.position.x,dz=w[1]-o.n.position.z,d=Math.hypot(dx,dz);
  if(d<.12){o.pi=(o.pi+1)%o.path.length;o.wait=.8;return}
  o.n.position.x+=dx/d*2*dt;o.n.position.z+=dz/d*2*dt;o.n.rotation.y=Math.atan2(dx,dz);
  const w2=Math.sin(t*9);o.legL.rotation.x=w2*.6;o.legR.rotation.x=-w2*.6;o.armL.rotation.x=-w2*.5;o.armR.rotation.x=w2*.5}
}

/* ---------- room building blocks ---------- */
function shell(g,fl,wb,wl,style){
 B(g,0,0,10,10,.2,tint(fl,.8),-.2);
 P(g,0,0,10,10,.003,floorMat(style||'wood',fl));
 B(g,-.4,-.4,10.4,.4,2.8,wb);B(g,-.4,0,.4,10,2.8,wl);
 B(g,0,0,10,.1,.26,tint(wb,.78));B(g,0,0,.1,10,.26,tint(wl,.78));
 B(g,-.46,-.46,10.46,.52,.14,tint(wb,.66),2.8);B(g,-.46,0,.52,10,.14,tint(wl,.66),2.8);
}
function disc(g,x,z,y){const gr=new THREE.Group();gr.position.set(x,y,z);const m=mesh(CG,'#111');m.scale.set(.55,.08,.55);gr.add(m);
 const k=mesh(BG,'*#ffd84d');k.scale.set(.1,.05,.4);k.position.set(0,.07,.2);gr.add(k);g.add(gr);ticks.push(t=>gr.rotation.y=t*4)}

/* ---------- the 8 rooms (local 10x10, walls on x=0 and z=0) ---------- */
const ROOMS=[
g=>{shell(g,'#ff9ccb','#ffd0e8','#ff7ab8');
 B(g,2.5,0,5,.15,1.8,'*#ffd84d',.8);
 [[4.1,.8,1.9],[5.1,.8,1.9],[4.1,1.8,1.5],[4.5,1,1.1],[4.8,.4,.8]].forEach(p=>B(g,p[0],.15,p[1],.05,.4,'*#ff4f9a',p[2]));
 B(g,2,1.2,6,4,.5,'#ff4f9a');
 [[2.4,'#b8ff3d','#ffd84d'],[4.6,'#ffd84d','#7c5cff'],[6.8,'#7c5cff','#b8ff3d']].forEach((p,i)=>blink(B(g,p[0],1.5,.8,.8,.05,'*'+p[1],.5),p[1],p[2],.5,i*.2));
 B(g,.8,.4,1,1,2.2,'#222');B(g,1,1.4,.6,.06,.6,'*#ff4f9a',.5);B(g,8.2,.4,1,1,2.2,'#222');B(g,8.4,1.4,.6,.06,.6,'*#ff4f9a',.5);
 npc(g,3.5,3.2,'#b8ff3d','dance',{y:.5});const i2=npc(g,5,3.6,'#fff','dance',{y:.5,hair:'#e8863a'});npc(g,6.5,3.2,'#7c5cff','dance',{y:.5,hair:'#222'});
 const f1=npc(g,3,8,'#ffd1e8','cheer',{stick:1}),f2=npc(g,7,8.2,'#ffd1e8','cheer',{stick:1,hair:'#7a3b1f'});
 B(g,.4,5.5,1.2,2.4,.8,'#3a3a52');B(g,.6,5.8,.15,1,.6,'*#74b9ff',.8);const ed=npc(g,2,6.7,'#fff','type',{sit:1,rot:-Math.PI/2,hair:'#444'});bb(ed.n,'✂️',.8);bb(i2.n,'💖',0);bb(f1.n,'⭐',1.2);bb(f2.n,'💖',2.4);fx(g,3.2,3.5,3,'💖',0);fx(g,6.8,3.5,3,'✨',1.6)},
g=>{shell(g,'#e9e2f2','#dfe6f5','#e63946','tile');
 B(g,.55,.02,.1,.1,2.2,'#8a5a2b');B(g,.65,.02,3,.1,.7,'*#e63946',1.6);B(g,.65,.02,3,.1,.7,'*#ffffff',.9);
 B(g,0,0,10,.15,.3,'*#e63946',2.45);[0,1,2,3].forEach(i=>{const m=B(g,0,.16,.8,.04,.18,'*#fff',2.5);ticks.push(t=>m.position.x=((t*2+i*2.5)%11)-.5)});
 [2,5.8].forEach((z,i)=>{B(g,.1,z,.1,1.8,1,'*#12306b',1.2);blink(B(g,.2,z+.2,.05,1.4,.6,'*#4fa3ff',1.4),'#4fa3ff','#e63946',.8,i*.4)});
 B(g,8.2,.9,1,1,.4,'#d9d0c0');B(g,8.5,1.2,.4,.4,1.8,'#efe9dc');blink(B(g,8.55,1.25,.3,.3,.4,'*#ffd84d',2.2),'#ffd84d','#ff9f43',.6);
 B(g,3.5,3.6,3,1.1,1,'#e63946');B(g,3.9,3.65,2.2,.05,.4,'*#ffffff',.3);B(g,4.4,3.8,.9,.6,.05,'*#74b9ff',1);
 const an=npc(g,5,3,'#17131f','talk',{hair:'#2b1d17'});
 B(g,4.7,6.9,.7,.9,.6,'#444',1.3);B(g,4.9,7.8,.1,.1,1.2,'#333',.1);blink(B(g,4.8,6.85,.15,.05,.15,'*#ff3b30',1.8),'#ff3b30','#5a1410',.5);
 const op=npc(g,5,8.5,'#ffd84d','nod',{rot:Math.PI,hair:'#444'});
 const rp=npc(g,8,6,'#4cc38a','mic',{rot:-Math.PI/2,hp:0,hair:'#7a3b1f'});
 npc(g,2,8,'#4fa3ff','walk',{path:[[2,8],[2,4.5],[7.5,8.8],[2,8]]});
 bb(an.n,'📢',0);bb(rp.n,'🇮🇩',1.5);bb(op.n,'🎥',2.8);fx(g,5,3.5,5,'📰',1)},
g=>{shell(g,'#3fae5a','#2f8f48','#1f7a3a','grass');
 const L='*#ffffff';
 B(g,.8,.8,8.4,.1,.03,L,.04);B(g,.8,9.1,8.4,.1,.03,L,.04);B(g,.8,.8,.1,8.4,.03,L,.04);B(g,9.1,.8,.1,8.4,.03,L,.04);B(g,4.95,.8,.1,8.4,.03,L,.04);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2,.05,4,20),mat(L));ring.position.set(5,.06,5);ring.rotation.x=Math.PI/2;g.add(ring);
 [1.1,8.7].forEach(x=>{B(g,x,3.8,.12,.12,1.3,L);B(g,x,6.1,.12,.12,1.3,L);B(g,x,3.8,.12,2.4,.12,L,1.3)});
 B(g,3.5,0,3,.12,1,'*#10161f',1.7);blink(B(g,3.8,.12,.5,.04,.5,'*#ffd84d',1.9),'#ffd84d','#ffffff',.9);blink(B(g,5.7,.12,.5,.04,.5,'*#ffd84d',1.9),'#ffd84d','#ffffff',1.3,.4);
 B(g,6,.3,3.2,1.1,1,'#3a3a52');B(g,6.9,.5,.9,.6,.05,'*#74b9ff',.9);
 const cm=npc(g,7.4,2.4,'#17131f','type',{sit:1,rot:Math.PI,hp:1});
 B(g,1,8.9,8,.9,.6,'#555');
 const f1=npc(g,2.5,9.5,'#ff9f43','cheer',{stick:1}),f2=npc(g,5,9.5,'#e63946','cheer',{hair:'#7a3b1f'}),f3=npc(g,7.5,9.5,'#2b6fe0','cheer');
 npc(g,3,3,'#e63946','walk',{path:[[3,3],[6,4],[7.5,6.5],[4,7]]});npc(g,7,7,'#2b6fe0','walk',{path:[[7,7],[4,6],[3,4],[6,3]]});
 const pl=npc(g,5.5,5.6,'#e63946','walk',{path:[[5.5,5.6],[3.5,6.5],[6.5,4.2]]});npc(g,2,5,'#ffd84d','nod',{rot:-Math.PI/2});npc(g,8.2,5,'#8a2be2','nod',{rot:Math.PI/2});
 const ball=S(g,5,.4,5,.28,'#ffffff');ticks.push(t=>{ball.position.set(5+2.8*Math.sin(t*.9),.35+Math.abs(Math.sin(t*5))*.45,5+2*Math.sin(t*1.8))});
 bb(f2.n,'📣',0);bb(pl.n,'⚽',1.5);bb(cm.n,'🎙️',2.6);fx(g,5,2,5,'⚽',.8);fx(g,5,3.5,9.5,'🎉',1.6)},
g=>{shell(g,'#2b1f45','#3a2a63','#ff4f9a','tile');
 B(g,.1,3,.1,2,.7,'*#17131f',1.8);blink(B(g,.2,3.2,.1,1.6,.4,'*#ff3b30',1.95),'#ff3b30','#5a1410',.5);
 [0,1,2].forEach(i=>{B(g,3+i*1.3,.02,1,.1,1,'#111',1.4);blink(B(g,3.35+i*1.3,.12,.3,.05,.3,'*#ffd84d',1.75),'#ffd84d','#ff4f9a',.7,i*.3)});
 B(g,3,3,4,1.2,.9,'#4b3a7a');disc(g,3.9,3.6,.9);disc(g,6,3.6,.9);
 [4.6,5.1,5.6].forEach((x,i)=>blink(B(g,x,3.3,.3,.3,.05,'*#b8ff3d',.95),'#b8ff3d','#ff4f9a',.4,i*.13));
 const pr=npc(g,5,4.6,'#ff4f9a','mic',{sit:1,hp:1,rot:Math.PI});
 B(g,7.2,6.5,2,1,.9,'#d9b27c');B(g,7.7,6.8,.9,.6,.05,'*#74b9ff',.9);
 const wr=npc(g,8.2,8,'#4cc38a','type',{sit:1,rot:Math.PI,hp:1});
 B(g,8.3,.5,1.2,1.2,2,'#111');const wf=B(g,8.55,.5,.7,.06,.7,'*#2b8cff',.8);ticks.push(t=>{const k=1+.12*Math.sin(t*10);wf.scale.x=k;wf.scale.y=k});
 B(g,1.2,7.1,.8,.8,.8,'#4b3a7a');const gg=new THREE.Group();gg.position.set(1.6,1.7,7.5);g.add(gg);
 const sp=mesh(SG,'#2b8cff');sp.scale.setScalar(.7);gg.add(sp);[[.5,.2,.3],[-.3,.3,.5]].forEach(q=>{const k=mesh(BG,'#4cc38a');k.scale.set(.3,.25,.3);k.position.set(...q);gg.add(k)});ticks.push(t=>gg.rotation.y=t*.7);
 B(g,.7,5,.5,.5,.7,'#e8863a');B(g,.85,5.15,.15,.15,.9,'#6b3d17',.7);
 npc(g,2.2,8.6,'#ffd84d','walk',{path:[[2.2,8.6],[5.8,8.6],[5.8,6],[2.2,6]]});
 bb(pr.n,'🎙️',0);bb(wr.n,'🎵',1.4);fx(g,5,3.5,3,'♪',0);fx(g,7,3,5,'♫',1.6);fx(g,3,3,5,'🌍',2.6)},
g=>{shell(g,'#5b2f8c','#2a1450','#3d1c6e');
 const sc=B(g,1.5,0,7,.15,2.4,'*#ff9f43',.3);sc.material=sc.material.clone();ticks.push(t=>setC(sc.material,Math.floor(t*6)%3?'#ff9f43':'#ffb870'));
 B(g,1.5,.15,7,.05,.9,'*#5a2a82',.3);B(g,4.3,.15,1.2,.05,1.1,'*#fff3b0',1.1);
 B(g,.6,0,.9,.6,2.7,'#c0392b');B(g,8.5,0,.9,.6,2.7,'#c0392b');
 B(g,2.5,6,5,1.2,.7,'#7a1f2b');B(g,2.5,7.2,5,.5,1.5,'#7a1f2b');B(g,2.2,6,.4,1.7,1.1,'#5b1520');B(g,7.4,6,.4,1.7,1.1,'#5b1520');
 const v1=npc(g,3.6,6.5,'#ffd84d','nod',{sit:1,chair:0,rot:Math.PI}),v2=npc(g,5,6.5,'#fff','nod',{sit:1,chair:0,rot:Math.PI,hair:'#e8863a'}),v3=npc(g,6.4,6.5,'#ff7ab8','nod',{sit:1,chair:0,rot:Math.PI});
 B(g,8.4,5.5,.9,.9,.7,'#ddd');B(g,8.6,5.7,.5,.5,.5,'#fff',.7);B(g,8.6,6.15,.5,.05,.5,'#e63946',.7);
 B(g,4.6,9.2,.8,.7,.5,'#333',1.6);B(g,4.8,8.9,.4,.3,.3,'#999',1.7);
 npc(g,1.3,3.5,'#17131f','walk',{path:[[1.3,3.5],[1.3,9],[1.3,3.5]]});
 bb(v1.n,'😭',0);bb(v2.n,'😂',1.3);bb(v3.n,'😱',2.4)},
g=>{shell(g,'#2a6fe0','#16408f','#0f2f6e','tile');
 for(let i=0;i<14;i++){const m=B(g,1.3+i*.55,0,.4,.15,1,i%2?'*#ffffff':'*#ffd84d',.4);ticks.push(t=>{const h=.3+1.6*Math.abs(Math.sin(t*3+i*.7));m.scale.y=h;m.position.y=.4+h/2})}
 B(g,.3,.4,1.4,1.4,2.4,'#111');B(g,8.4,.4,1.4,1.4,2.4,'#111');
 [[.55,1.8],[8.65,1.8]].forEach(p=>{const w=B(g,p[0],1.8,.9,.06,.9,'*#2b8cff',1.2);ticks.push(t=>{const k=1+.12*Math.sin(t*10);w.scale.x=k;w.scale.y=k})});
 B(g,3.5,3,3.5,1.2,1.1,'#2d3a8c');disc(g,4.4,3.6,1.1);disc(g,6.1,3.6,1.1);
 const dj=npc(g,5.2,2.4,'#ff7ab8','dj',{hp:1});
 const d1=npc(g,2.8,6.8,'#fff','dance',{hp:1}),d2=npc(g,7.6,7,'#ffd84d','dance',{hp:1});
 B(g,8.2,3.2,1.4,1.4,.6,'#7c5cff');const ls=npc(g,8.9,3.9,'#ff7ab8','nod',{sit:1,chair:0,y:-.15,hp:1,hair:'#e8863a'});
 [[1,6],[4.4,8.8],[8,6.2]].forEach((p,i)=>blink(B(g,p[0],p[1],.8,.8,.04,'*#ffd84d',.0),'#ffd84d','#ff7ab8',.5,i*.17));
 bb(dj.n,'🎧',0);bb(d1.n,'🎶',1.4);bb(ls.n,'💙',2.6);fx(g,5,3.5,4,'♪',0);fx(g,3,3,5,'♫',1.5);fx(g,7,3,5,'♪',2.5)},
g=>{shell(g,'#25252f','#34344a','#22222f');
 B(g,3.5,0,3,.12,1.8,'*#0e1030',.9);B(g,4.2,.12,.6,.05,.6,'*#ffeaa7',1.8);B(g,4.45,.14,.5,.05,.5,'*#0e1030',1.85);
 [[3.8,1.2],[6,1.4],[5.8,2.4],[4,2.2]].forEach((p,i)=>blink(B(g,p[0],.13,.12,.05,.12,'*#fff',p[1]+.0),'#fff','#556',.7,i*.3));
 for(let i=0;i<9;i++)blink(B(g,.6+i*1.1,0,.25,.2,.25,'*#ffd36b',2.4),'#ffd36b','#8a6a2a',.8,i*.23);
 B(g,.4,4,3,4.6,.6,'#4b4b6b');B(g,.6,4.2,1.4,1,.25,'#fff',.6);B(g,.4,5.6,3,3,.15,'#6a6aa0',.6);
 const rd=npc(g,1.7,5.2,'#8b8bff','read',{sit:1,chair:0,y:-.15,rot:Math.PI/2,hair:'#c0392b'});
 B(g,5.5,.8,3.5,1.2,1,'#3a3a52');B(g,6.6,1.1,.9,.6,.05,'*#74b9ff',1);B(g,6.6,.9,.9,.05,.6,'*#74b9ff',1.05);
 const wr=npc(g,7,2.6,'#ffd36b','type',{sit:1,rot:Math.PI,hp:1});
 B(g,9.2,1,.2,.2,2.2,'#17131f');const sh=B(g,8.9,.7,.8,.8,.5,'*#ffd36b',2.2);
 const pl=new THREE.PointLight(0xffd36b,.9,9);pl.position.set(9,2,1.1);g.add(pl);ticks.push(t=>pl.intensity=.7+.25*Math.sin(t*2));
 B(g,6.5,6.5,1.4,1.4,.6,'#3b3b6b');const lb=npc(g,7.2,7.2,'#c0392b','nod',{sit:1,chair:0,y:-.15,hp:1});
 bb(rd.n,'💭',0);bb(wr.n,'🌙',1.6);bb(lb.n,'🎵',3)},
g=>{shell(g,'#333','#222','#c0392b');
 for(let i=0;i<8;i++)for(let j=0;j<2;j++)B(g,.3+i*1.2,0,1.1,.28,1,(i+j)%2?'#3a3a3a':'#2a2a2a',.5+j*1.1);
 blink(B(g,8.8,.28,.8,.08,.35,'*#ff3b30',2.3),'#ff3b30','#4a1410',.5);
 Cy(g,5,5,1.8,.9,'#f4f4f4');B(g,4.4,4.6,.12,.12,.9,'#17131f',.9);S(g,4.46,1.9,4.66,.18,'#555');B(g,5.5,5.2,.12,.12,.9,'#17131f',.9);S(g,5.56,1.9,5.26,.18,'#555');
 const h1=npc(g,2.6,5,'#c0392b','mic',{rot:Math.PI/2,hp:1,sit:1}),h2=npc(g,7.4,5,'#fff','talk',{rot:-Math.PI/2,hp:1,sit:1,hair:'#7a3b1f'});
 npc(g,5,7.6,'#ffd84d','talk',{rot:Math.PI,hp:1,sit:1});
 B(g,.4,6,1.4,3.2,1,'#444');B(g,.6,6.4,.15,1,.7,'*#74b9ff',1.05);B(g,.6,7.7,.15,1,.7,'*#4cc38a',1.05);
 const ed=npc(g,2.4,7.4,'#ffd84d','type',{sit:1,rot:-Math.PI/2,hair:'#444'});
 B(g,8.3,1.4,.9,.9,.1,'#333');B(g,8.65,1.75,.2,.2,1.4,'#333',.1);B(g,8.1,1.5,1.2,.8,.6,'#444',1.5);B(g,7.7,1.7,.5,.4,.4,'#9ad0ff',1.55);
 npc(g,8.9,2.9,'#6c4cff','nod',{rot:Math.PI});
 bb(h1.n,'🎙️',0);bb(h2.n,'😂',1.3);bb(ed.n,'✂️',.7)}
];

/* ---------- build the universe ---------- */
const PX=13,PZ=16,roomG=[],labs=[];
function bannerTex(){const c=document.createElement('canvas');c.width=2048;c.height=440;const x=c.getContext('2d');
 const draw=()=>{const g=x.createLinearGradient(0,0,2048,440);g.addColorStop(0,'#7b5cff');g.addColorStop(1,'#4f31e0');x.fillStyle=g;x.fillRect(0,0,2048,440);
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=6;x.strokeRect(22,22,2004,396);
  x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';let fs=210;x.font=`800 ${fs}px "Plus Jakarta Sans",system-ui,sans-serif`;
  while(x.measureText('SPECOOLASI HQ').width>1560&&fs>60){fs-=6;x.font=`800 ${fs}px "Plus Jakarta Sans",system-ui,sans-serif`}
  x.fillText('SPECOOLASI HQ',1024,228);x.font='120px system-ui,sans-serif';x.fillStyle='#ffd84d';x.fillText('✦',150,225);x.fillText('✦',1898,225)};
 draw();const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
 if(document.fonts&&document.fonts.load)document.fonts.load('800 120px "Plus Jakarta Sans"').then(()=>{draw();t.needsUpdate=true}).catch(()=>{});return t}
if(SI<0){
 B(scene,-15,-13,79,58,1.6,'#efe9ff',-2.4);
 B(scene,-14,-12,77,56,.5,'#7fcf92',-.8);
 P(scene,-14,-12,77,56,-.299,new THREE.MeshStandardMaterial({map:TEX.ground('#7fcf92'),roughness:1}));
 B(scene,-2,-2,53,32,.3,'#cfc8e6',-.3);
 P(scene,-2,-2,53,32,.003,new THREE.MeshStandardMaterial({map:TEX.stone('#d6d0ea'),roughness:.8}));
 [[-10,-8],[55,-8],[-10,34],[55,34],[18,33],[36,34],[-8,12],[57,13]].forEach(p=>{const x=p[0]+.3,z=p[1]+.3;
  Cy(scene,x,z,.3,1.9,'#7a4f2a',-.3);S(scene,x,2.4,z,1.55,'#45b97f');S(scene,x+.55,3.2,z-.2,1.1,'#5fd69c');S(scene,x-.5,2.1,z+.5,1.0,'#3da673')});
 [[12.3,13.7],[25.3,13.7],[38.3,13.7],[12.3,-.7],[38.3,-.7]].forEach(p=>{Cy(scene,p[0],p[1],.07,2.6,'#2b2b3a');S(scene,p[0],2.75,p[1],.2,'*#ffe9a8')});
 B(scene,19.8,30,9.4,.5,2.4,'#3a2a9a',-.3);
 const bn=new THREE.Mesh(new THREE.PlaneGeometry(8.9,1.9),new THREE.MeshStandardMaterial({map:bannerTex(),roughness:.45}));bn.position.set(24.5,.85,30.52);bn.receiveShadow=true;scene.add(bn);
}
ACC.forEach((a,i)=>{
 if(SI>=0&&i!==SI)return;
 curRoom=i;const g=new THREE.Group();g.position.set((i%4)*PX,.2,((i/4)|0)*PZ);g.userData.room=i;scene.add(g);roomG.push(g);ROOMS[i](g);
 if(SI<0){const el=document.createElement('button');el.className='hq-lab';el.innerHTML='<span class="em">'+a.e+'</span><span class="nm">'+a.n+'</span>';el.setAttribute('aria-label','Open '+a.n);el.onclick=()=>openRoom(i);stage.appendChild(el);
  labs.push({el,a:anc(g,5,3.5,0)})}
});
curRoom=-1;
if(SI<0)[[[11.5,-1],[11.5,27]],[[24.5,-1],[24.5,27]],[[37.5,27],[37.5,-1]],[[-1,13],[50,13]]].forEach((p,i)=>npc(scene,p[0][0],p[0][1],['#ff7ab8','#ffd84d','#4fa3ff','#4cc38a'][i],'walk',{path:p}));

/* ---------- camera ---------- */
const dir=new THREE.Vector3(1,1.25,1).normalize(),SIN=dir.y;
const RV=new THREE.Vector3(1,0,-1).normalize(),FV=new THREE.Vector3(-1,0,-1).normalize();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),asp=()=>stage.clientWidth/stage.clientHeight;
const homeCam=()=>{if(SI>=0){const wide=asp()>1,d=BGM?15:17,z=wide?HF/d:HF*asp()/d,vw=HF/z*asp(),k=BGM&&wide?.22:0,cx=(SI%4)*PX+5,cz=((SI/4)|0)*PZ+5;return{x:cx-RV.x*vw*k,z:cz-RV.z*vw*k,zoom:z}}return{x:24.5,z:12.5,zoom:Math.min(HF/47,HF*asp()/64)}};
let cam=homeCam(),raf,sel=-1;
let ox=0,oz=0,tx=0,tz=0; /* gentle mouse parallax for the background */
if(BGM)addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*1.8;tz=(e.clientY/innerHeight-.5)*1.4},{passive:true});
function placeCam(){ox+=(tx-ox)*.04;oz+=(tz-oz)*.04;const px=cam.x+RV.x*ox+FV.x*oz,pz=cam.z+RV.z*ox+FV.z*oz;
 camera.zoom=cam.zoom;camera.position.set(px+dir.x*120,dir.y*120,pz+dir.z*120);camera.lookAt(px,0,pz);camera.updateProjectionMatrix()}
function resize(){const w=stage.clientWidth,h=stage.clientHeight,a=w/h;renderer.setSize(w,h,false);
 camera.left=-HF*a/2;camera.right=HF*a/2;camera.top=HF/2;camera.bottom=-HF/2;stage.classList.toggle('compact',w<640)}
function go(t,ms=900){cancelAnimationFrame(raf);const s={...cam},t0=performance.now();
 (function f(n){let k=Math.min(1,(n-t0)/ms);k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
 cam={x:s.x+(t.x-s.x)*k,z:s.z+(t.z-s.z)*k,zoom:s.zoom+(t.zoom-s.zoom)*k};if(k<1)raf=requestAnimationFrame(f)})(t0)}
let pd=null,moved=false;
stage.addEventListener('pointerdown',e=>{if(SI>=0||e.target.closest('button,.hq-info'))return;pd={x:e.clientX,y:e.clientY};moved=false;cancelAnimationFrame(raf)});
addEventListener('pointermove',e=>{
 if(!pd)return;
 const dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(!moved&&Math.hypot(dx,dy)<6)return;
 moved=true;stage.classList.add('drag');const u=(HF/cam.zoom)/stage.clientHeight;
 cam.x=clamp(cam.x-RV.x*dx*u+FV.x*dy*u/SIN,-6,55);cam.z=clamp(cam.z-RV.z*dx*u+FV.z*dy*u/SIN,-6,33);pd={x:e.clientX,y:e.clientY}});
addEventListener('pointerup',()=>{pd=null;stage.classList.remove('drag')});
stage.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();cam.zoom=clamp(cam.zoom*(e.deltaY>0?.9:1.1),.45,6)},{passive:false});
$('hq-zi').onclick=()=>cam.zoom=clamp(cam.zoom*1.25,.45,6);$('hq-zo').onclick=()=>cam.zoom=clamp(cam.zoom/1.25,.45,6);$('hq-hm').onclick=()=>closeRoom();
const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
function pick(e){if(e.target.closest&&e.target.closest('button,.hq-info'))return-1;const b=canvas.getBoundingClientRect();
 mv.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(mv,camera);
 const h=ray.intersectObjects(roomG,true)[0];if(!h)return-1;let o=h.object;while(o&&o.userData.room===undefined)o=o.parent;return o?o.userData.room:-1}
function npcAt(e){if(e.target.closest&&e.target.closest('button'))return null;const b=canvas.getBoundingClientRect();
 mv.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(mv,camera);
 const h=ray.intersectObjects(NPCS.map(o=>o.n),true)[0];if(!h)return null;let o=h.object;while(o&&!NPCS.some(p=>p.n===o))o=o.parent;return o?NPCS.find(p=>p.n===o):null}
function react(e){const o=npcAt(e);if(!o)return;o.hop=1;const em=[ACC[SI].e,'✨','💜','🔥','😄'][Math.floor(Math.random()*5)];
 const el=document.createElement('div');el.className='hq-pop';el.innerHTML='<span>'+em+'</span>';stage.appendChild(el);const b={el,target:o.n,room:-2,dy:3.3};bubs.push(b);
 setTimeout(()=>{el.remove();const k=bubs.indexOf(b);if(k>=0)bubs.splice(k,1)},1100)}
stage.addEventListener('click',e=>{if(moved)return;if(SI>=0){react(e);return}const i=pick(e);if(i>=0)openRoom(i)});
/* background mode: click an empty part of the page and the people react */
if(BGM)addEventListener('click',e=>{if(e.target.closest&&e.target.closest('a,button,input,textarea,video,img,h1,h2,h3,p,.ap-sample'))return;react(e)});

/* ---------- popup + zoom ---------- */
const info=$('hq-info');
/* emoji bubbles only float over the room you opened, so the overview stays clean and the labels stay readable */
const showBubs=()=>bubs.forEach(b=>{b.el.style.display=(b.room===-2||(b.room>=0&&(SI>=0||sel===b.room)))?'':'none'});
function openRoom(i){
 const a=ACC[i],wide=asp()>1;sel=i;stage.classList.add('focus');labs.forEach((l,k)=>l.el.classList.toggle('sel',k===i));showBubs();
 const cx=(i%4)*PX+5,cz=((i/4)|0)*PZ+5,z=wide?HF/17:HF*asp()/17,visW=HF/z*asp(),visH=HF/z;
 const t=wide?{x:cx+RV.x*visW*.2,z:cz+RV.z*visW*.2,zoom:z}:{x:cx-FV.x*visH*.2/SIN,z:cz-FV.z*visH*.2/SIN,zoom:z};
 go(t);
 sync(a);
 const list=a.posts.length?a.posts:Array.from({length:3},()=>({}));
 const tile=p=>p.video?`<div class="hq-post"><video src="${p.video}"${p.poster?` poster="${p.poster}"`:''} muted loop autoplay playsinline></video></div>`
  :p.img?`<a class="hq-post" href="${p.link||p.img}" target="_blank" rel="noopener" style="background-image:url('${p.img}')"></a>`
  :p.embed?`<a class="hq-post" href="${p.embed}" target="_blank" rel="noopener">&#9654; VIEW POST</a>`
  :`<div class="hq-post">Coming soon</div>`;
 info.innerHTML=`<button class="hq-back" id="hq-bk">← Back to HQ</button><div class="hq-head"><span class="hq-emo">${a.e}</span><h2>${a.n}</h2></div><p class="hq-vibe">${a.vibe}</p>
 <div class="hq-chips">${a.tags.map(t=>`<span>${t}</span>`).join('')}</div><p class="hq-desc">${a.d}</p>
 <div class="hq-acts">${a.link?`<a class="hq-go" href="${a.link}" target="_blank" rel="noopener">Visit ${a.n} ↗</a>`:''}${a.page?`<a class="hq-go" href="${a.page}">Open page →</a>`:''}</div>
 <div class="hq-posts">${list.map(tile).join('')}</div>`;
 info.scrollTop=0;info.classList.add('on');$('hq-bk').onclick=closeRoom;
}
function closeRoom(){sel=-1;stage.classList.remove('focus');info.classList.remove('on');labs.forEach(l=>l.el.classList.remove('sel'));showBubs();go(homeCam(),800)}
addEventListener('keydown',e=>{if(e.key==='Escape'&&sel>=0)closeRoom()});
addEventListener('resize',()=>{resize();if(sel<0)cam=homeCam();else openRoom(sel)});

/* ---------- loop ---------- */
const V=new THREE.Vector3();let last=0;
function put(el,o,dy,pre){o.getWorldPosition(V);V.y+=dy;V.project(camera);
 el.style.transform=`translate(${(V.x*.5+.5)*stage.clientWidth}px,${(-V.y*.5+.5)*stage.clientHeight}px) translate(-50%,-100%)${pre||''}`}
let vis=true;if(window.IntersectionObserver)new IntersectionObserver(en=>{vis=en[0].isIntersecting}).observe(stage);
function frame(ms){const t=ms/1000,dt=Math.min(.05,t-last);last=t;if(!vis||document.hidden){requestAnimationFrame(frame);return}
 NPCS.forEach(o=>upd(o,t,dt));ticks.forEach(f=>f(t));placeCam();renderer.render(scene,camera);
 labs.forEach(l=>put(l.el,l.a,0));bubs.forEach(b=>{if(b.el.style.display!=='none')put(b.el,b.target,b.dy)});
 requestAnimationFrame(frame)}
stage.addEventListener('pointermove',e=>{if(!pd)stage.classList.toggle('hot',SI>=0?!!npcAt(e):pick(e)>=0)});
resize();showBubs();requestAnimationFrame(frame);

})();
