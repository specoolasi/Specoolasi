/* Specoolasi HQ: isometric voxel social-media world (needs three.js r128 + #hq in index.html) */
(function(){'use strict';
/* ===== EDIT YOUR ACCOUNTS HERE (texts are placeholders) =====
   posts: [{img:'https://...', link:'https://...'}]   link: the account URL */
const ACC=[
{n:'Popthusiast',e:'🎤',vibe:'Fan energy, 24/7',tags:['K-pop','Idols','Fan culture'],link:'',posts:[],d:'Where K-pop lives loud. Idol moments, comeback hype and fan-favorite visuals, posted for people who never skip a stage.'},
{n:'Ketahui.id',e:'📚',vibe:'Learn something new',tags:['Facts','Explainers','Knowledge'],link:'',posts:[],d:'Bite-sized facts and clear explainers. If you ever wondered "wait, why?", this room has the answer.'},
{n:'Global_id',e:'🌍',vibe:'The world, right now',tags:['World news','Updates','Global'],link:'',posts:[],d:'A control room for what is happening around the world, kept fast, clear and easy to follow.'},
{n:'Popnewsiast',e:'📰',vibe:'Pop culture, on air',tags:['Pop news','Entertainment','Trending'],link:'',posts:[],d:'The newsroom for pop culture: celebrity updates, releases and trending talk, delivered like a live broadcast.'},
{n:'Dramories',e:'🎬',vibe:'Feel every scene',tags:['Drama','Film','Nostalgia'],link:'',posts:[],d:'A cozy cinema for drama lovers. Scenes, plot twists and the stories that made us cry and cheer.'},
{n:'Listenation',e:'🎧',vibe:'Turn it up',tags:['Music','Playlists','Releases'],link:'',posts:[],d:'Music news, fresh releases and playlist-worthy moments, all with the volume up.'},
{n:'Gloome',e:'🌙',vibe:'Quiet, moody, aesthetic',tags:['Aesthetic','Late night','Mood'],link:'',posts:[],d:'A late-night corner for moody visuals, soft glow and thoughts that hit different after midnight.'},
{n:'Clippods.id',e:'🎙️',vibe:'Press record',tags:['Podcast','Clips','Video'],link:'',posts:[],d:'The studio for podcasts and short clips. The best moments from the conversation, cut and ready to share.'}
];
const PIX=2; /* pixel size: 1 = smooth, 2 = chunky, 3 = very chunky */

/* ---------- three.js basics ---------- */
const mount=document.getElementById('hq');if(!mount||!window.THREE)return;
const $=id=>document.getElementById(id);
mount.innerHTML='<p class="hq-hint">Drag to explore &middot; tap a room &middot; +/&minus; or Ctrl + scroll to zoom</p><div class="hq-stage" id="hq-stage"><canvas id="hq-c"></canvas><div class="hq-tools"><button id="hq-zi" aria-label="Zoom in">+</button><button id="hq-zo" aria-label="Zoom out">&minus;</button><button id="hq-hm">HQ</button></div><aside class="hq-info" id="hq-info"></aside></div>';
const stage=$('hq-stage'),canvas=$('hq-c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false});
const scene=new THREE.Scene();scene.background=new THREE.Color('#cdbfff');
scene.add(new THREE.HemisphereLight(0xffffff,0x9a8fc0,.8));
const sun=new THREE.DirectionalLight(0xffffff,.7);sun.position.set(20,40,10);scene.add(sun);
const HF=46,camera=new THREE.OrthographicCamera(-1,1,1,-1,-300,500);
const BG=new THREE.BoxGeometry(1,1,1),SG=new THREE.SphereGeometry(1,8,6),CG=new THREE.CylinderGeometry(1,1,1,12);
const mats={};
const mat=c=>mats[c]||(mats[c]=c[0]==='*'?new THREE.MeshBasicMaterial({color:c.slice(1)}):new THREE.MeshLambertMaterial({color:c}));
const mesh=(geo,c)=>new THREE.Mesh(geo,mat(c));
function B(g,x,z,w,d,h,c,y=0){const m=mesh(BG,c);m.scale.set(w,h,d);m.position.set(x+w/2,y+h/2,z+d/2);g.add(m);return m}
function S(g,x,y,z,r,c){const m=mesh(SG,c);m.scale.setScalar(r);m.position.set(x,y,z);g.add(m);return m}
function Cy(g,x,z,r,h,c,y=0){const m=mesh(CG,c);m.scale.set(r,h,r);m.position.set(x,y+h/2,z);g.add(m);return m}
function tint(h,f){const n=parseInt(h.slice(1),16);return'#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('')}
const ticks=[],NPCS=[],bubs=[];
function blink(m,a,b,per=.5,ph=0){m.material=m.material.clone();ticks.push(t=>m.material.color.set(Math.floor((t+ph)/per)%2?a:b))}
const anc=(g,x,y,z)=>{const o=new THREE.Object3D();o.position.set(x,y,z);g.add(o);return o};
function bb(target,emoji,delay,cls='hq-bb',dy=3){const el=document.createElement('div');el.className=cls;el.innerHTML=`<span style="animation-delay:${delay}s">${emoji}</span>`;stage.appendChild(el);bubs.push({el,target,dy:cls==='hq-bb'?dy:0})}
const fx=(g,x,y,z,e,d)=>bb(anc(g,x,y,z),e,d,'hq-fx');

/* ---------- voxel people ---------- */
function npc(g,x,z,shirt,act,o={}){
 const n=new THREE.Group();n.position.set(x,o.y||0,z);n.rotation.y=o.rot||0;
 const sk=o.skin||'#f2c29b',hr=o.hair||'#2b1d17';
 const limb=(px,py,w,h,c)=>{const p=new THREE.Group();p.position.set(px,py,0);const m=mesh(BG,c);m.scale.set(w,h,w);m.position.y=-h/2;p.add(m);n.add(p);return p};
 const add=(c,sx,sy,sz,px,py,pz,par=n)=>{const m=mesh(BG,c);m.scale.set(sx,sy,sz);m.position.set(px,py,pz);par.add(m);return m};
 const legL=limb(-.2,.75,.32,.75,'#2d2a44'),legR=limb(.2,.75,.32,.75,'#2d2a44');
 if(o.sit){legL.rotation.x=legR.rotation.x=-1.57;if(o.chair!==0)B(g,x-.5,z-.5,1,1,.7,o.chair||'#555',o.y||0)}
 add(shirt,.85,.9,.5,0,1.2,0);
 const armL=limb(-.55,1.6,.26,.85,shirt),armR=limb(.55,1.6,.26,.85,shirt);
 if(o.stick)add('*#b8ff3d',.14,.9,.14,0,-1,0,armR);
 const head=new THREE.Group();head.position.set(0,1.65,0);n.add(head);
 add(sk,.62,.6,.6,0,.3,0,head);add(hr,.68,.2,.68,0,.62,0,head);add(hr,.68,.45,.2,0,.4,-.25,head);
 add('#17131f',.09,.09,.05,-.14,.32,.31,head);add('#17131f',.09,.09,.05,.14,.32,.31,head);
 if(o.hp){add('#17131f',.72,.08,.1,0,.66,0,head);add('#ff4f9a',.1,.28,.3,-.37,.3,0,head);add('#ff4f9a',.1,.28,.3,.37,.3,0,head)}
 g.add(n);
 const ob={n,armL,armR,legL,legR,head,act,ph:o.ph??Math.random()*6,by:n.position.y,path:o.path,pi:0,wait:0};NPCS.push(ob);return ob;
}
function upd(o,t,dt){const a=o.act,p=o.ph,s=Math.sin(t*6+p);
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
function shell(g,fl,wb,wl){
 B(g,0,0,10,10,.2,fl,-.2);
 for(let i=0;i<5;i++)for(let j=0;j<5;j++)if((i+j)%2)B(g,i*2,j*2,2,2,.03,tint(fl,1.12));
 B(g,-.4,-.4,10.4,.4,2.8,wb);B(g,-.4,0,.4,10,2.8,wl);
}
function shelf(g,x,z,len,d,h,ax){
 B(g,x,z,ax==='z'?len:d,ax==='z'?d:len,h,'#8a5a2b');
 const k=['#e63946','#ffd84d','#4fa3ff','#4cc38a','#ff7ab8','#6c4cff'],n=Math.floor(len/.28)-1;
 for(let r=0;r<3;r++)for(let i=0;i<n;i++){const c=k[(i*3+r)%6],o=.15+i*.28;
  ax==='z'?B(g,x+o,z+d,.22,.12,.5,c,.3+r*.7):B(g,x+d,z+o,.12,.22,.5,c,.3+r*.7)}
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
 bb(i2.n,'💖',0);bb(f1.n,'⭐',1.2);bb(f2.n,'💖',2.4);fx(g,3.2,3.5,3,'💖',0);fx(g,6.8,3.5,3,'✨',1.6)},
g=>{shell(g,'#bcd8ff','#dbe9ff','#8fb6f0');
 shelf(g,1.5,.1,5,1,2.4,'z');shelf(g,.1,2.5,6,1,2.4,'x');
 B(g,5,3.5,.15,.15,.8,'#555');B(g,7.4,3.5,.15,.15,.8,'#555');B(g,4.8,3.5,3,.12,1.8,'#fff',.8);
 [.5,.8,1.1,1.4].forEach((h,i)=>B(g,5.2+i*.6,3.62,.35,.06,h,['*#4fa3ff','*#4cc38a','*#ffd84d','*#e63946'][i],1));
 B(g,3,6.5,3,1.3,1,'#d9b27c');B(g,4,6.8,.8,.6,.1,'#e63946',1);B(g,5.3,6.8,.5,.5,.15,'#555',1);S(g,5.55,1.55,7.05,.4,'#4fa3ff');
 const st=npc(g,4.2,5.4,'#fff','read',{sit:1,hair:'#e8863a'}),pf=npc(g,3,4.2,'#3b6fd8','point',{hair:'#999'});
 B(g,7.2,7.8,2,1,.9,'#d9b27c');B(g,7.7,8.1,.9,.6,.05,'*#74b9ff',.9);
 npc(g,8.2,7,'#4cc38a','type',{sit:1,rot:Math.PI});
 bb(st.n,'❓',0);bb(pf.n,'💡',1.5)},
g=>{shell(g,'#2d3270','#1a2160','#10164a');
 [1,4,7].forEach(x=>{B(g,x,0,2,.15,1.4,'*#0b1a44',1);[0,1,2].forEach(i=>B(g,x+.25+i*.55,.15,.35,.05,.4+i*.2,['*#4cc38a','*#ffd84d','*#4fa3ff'][i],1.1))});
 B(g,0,0,10,.15,.3,'*#e63946',2.45);
 [0,1,2,3].forEach(i=>{const m=B(g,0,.16,.8,.04,.18,'*#fff',2.5);ticks.push(t=>m.position.x=((t*2+i*2.5)%11)-.5)});
 B(g,4,4,2,2,.5,'#1e2a78');const gg=new THREE.Group();gg.position.set(5,2.1,5);g.add(gg);
 const sp=mesh(SG,'#2b8cff');sp.scale.setScalar(1.3);gg.add(sp);
 [[1,.4,.6],[-.8,-.3,.9],[.2,.9,-1]].forEach(p=>{const k=mesh(BG,'#4cc38a');k.scale.set(.5,.4,.5);k.position.set(...p);gg.add(k)});
 ticks.push(t=>gg.rotation.y=t*.6);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.05,4,24),mat('*#ffffff'));ring.position.set(5,2.1,5);ring.rotation.x=1.2;g.add(ring);
 B(g,.4,4,1.6,5,1,'#3b4396');B(g,.6,4.6,.2,.9,.6,'*#12306b',1);B(g,.6,6.6,.2,.9,.6,'*#12306b',1);
 const ty=npc(g,2.7,5,'#4fa3ff','type',{sit:1,rot:-Math.PI/2});npc(g,2.7,7,'#fff','type',{sit:1,rot:-Math.PI/2,hair:'#7a3b1f'});
 const pt=npc(g,7.2,7.4,'#ffd84d','point');
 npc(g,3.4,3,'#e63946','walk',{path:[[3.4,3],[3.4,8.6],[8.6,8.6],[8.6,3]]});
 bb(pt.n,'🌍',0);bb(ty.n,'📡',1.6)},
g=>{shell(g,'#efe4d2','#fff6e8','#e63946');
 B(g,2,0,6,.2,2.4,'#e63946');B(g,2.5,.2,5,.05,1.5,'*#ffffff',.5);
 [0,1,2,3].forEach(i=>B(g,3+i*1,.25,.5,.05,.4+i*.25,['*#6c4cff','*#e63946','*#ffd84d','*#4cc38a'][i],.6));
 B(g,3.5,3.2,3,1,1.1,'#fff');B(g,3.5,4.2,3,.1,.8,'#e63946',.15);
 const an=npc(g,5,2.6,'#17131f','talk',{hair:'#7a3b1f'});
 B(g,1.3,6.8,1,1,.1,'#333');B(g,1.7,7.2,.2,.2,1.4,'#333',.1);B(g,1.2,6.9,1.2,.8,.7,'#444',1.5);B(g,1.6,6.5,.5,.4,.5,'#9ad0ff',1.6);
 npc(g,1.8,8.2,'#ffd84d','nod',{rot:Math.PI,hair:'#444'});
 B(g,0,6,.2,2,.6,'#17131f',1.9);blink(B(g,.2,6.2,.1,.4,.4,'*#ff3b30',2),'#ff3b30','#5a1410',.5);
 const pr=npc(g,7.5,6.6,'#6c4cff','wave');
 npc(g,6,8.6,'#4cc38a','walk',{path:[[6,8.6],[9.2,8.6],[9.2,5],[6,5]]});
 bb(an.n,'🎙️',0);bb(pr.n,'👏',1.5)},
g=>{shell(g,'#5b2f8c','#2a1450','#3d1c6e');
 const sc=B(g,1.5,0,7,.15,2.4,'*#ff9f43',.3);ticks.push(t=>sc.material.color.set(Math.floor(t*6)%3?'#ff9f43':'#ffb870'));sc.material=sc.material.clone();
 B(g,1.5,.15,7,.05,.9,'*#5a2a82',.3);B(g,4.3,.15,1.2,.05,1.1,'*#fff3b0',1.1);
 B(g,.6,0,.9,.6,2.7,'#c0392b');B(g,8.5,0,.9,.6,2.7,'#c0392b');
 B(g,2.5,6,5,1.2,.7,'#7a1f2b');B(g,2.5,7.2,5,.5,1.5,'#7a1f2b');B(g,2.2,6,.4,1.7,1.1,'#5b1520');B(g,7.4,6,.4,1.7,1.1,'#5b1520');
 const v1=npc(g,3.6,6.5,'#ffd84d','nod',{sit:1,chair:0,rot:Math.PI}),v2=npc(g,5,6.5,'#fff','nod',{sit:1,chair:0,rot:Math.PI,hair:'#e8863a'}),v3=npc(g,6.4,6.5,'#ff7ab8','nod',{sit:1,chair:0,rot:Math.PI});
 B(g,8.4,5.5,.9,.9,.7,'#ddd');B(g,8.6,5.7,.5,.5,.5,'#fff',.7);B(g,8.6,6.15,.5,.05,.5,'#e63946',.7);
 B(g,4.6,9.2,.8,.7,.5,'#333',1.6);B(g,4.8,8.9,.4,.3,.3,'#999',1.7);
 npc(g,1.3,3.5,'#17131f','walk',{path:[[1.3,3.5],[1.3,9],[1.3,3.5]]});
 bb(v1.n,'😭',0);bb(v2.n,'😂',1.3);bb(v3.n,'😱',2.4)},
g=>{shell(g,'#2a6fe0','#16408f','#0f2f6e');
 for(let i=0;i<14;i++){const m=B(g,1.3+i*.55,0,.4,.15,1,i%2?'*#ffffff':'*#ffd84d',.4);ticks.push(t=>{const h=.3+1.6*Math.abs(Math.sin(t*3+i*.7));m.scale.y=h;m.position.y=.4+h/2})}
 B(g,.3,.4,1.4,1.4,2.4,'#111');B(g,8.4,.4,1.4,1.4,2.4,'#111');
 [[.55,1.8],[8.65,1.8]].forEach(p=>{const w=B(g,p[0],1.8,.9,.06,.9,'*#2b8cff',1.2);ticks.push(t=>{const k=1+.12*Math.sin(t*10);w.scale.x=.9*k;w.scale.y=.9*k})});
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
const PITCH=13,roomG=[],labs=[];
B(scene,-14,-12,77,50,.5,'#9be3a8',-.8);B(scene,-2,-2,53,27,.3,'#c9c3dd',-.3);
[[-10,-8],[55,-8],[-10,30],[55,30],[18,29],[36,30],[-8,10],[57,12]].forEach(p=>{B(scene,p[0],p[1],.6,.6,1.5,'#8a5a2b',-.3);B(scene,p[0]-.7,p[1]-.7,2,2,1.6,'#4cc38a',1.2);B(scene,p[0]-.4,p[1]-.4,1.4,1.4,1,'#5fd69c',2.8)});
B(scene,20,27,9,.4,2.2,'#6c4cff',-.3);
const signA=anc(scene,24.5,2.4,27.2),sign=document.createElement('div');sign.className='hq-sign';sign.textContent='SPECOOLASI HQ';stage.appendChild(sign);
ACC.forEach((a,i)=>{
 const g=new THREE.Group();g.position.set((i%4)*PITCH,.2,((i/4)|0)*PITCH);g.userData.room=i;scene.add(g);roomG.push(g);ROOMS[i](g);
 const el=document.createElement('button');el.className='hq-lab';el.textContent=a.e+' '+a.n;el.onclick=()=>openRoom(i);stage.appendChild(el);
 labs.push({el,a:anc(g,5,3.3,0)});
});
[[[11.5,-1],[11.5,24]],[[24.5,-1],[24.5,24]],[[37.5,24],[37.5,-1]],[[-1,11.5],[50,11.5]]].forEach((p,i)=>npc(scene,p[0][0],p[0][1],['#ff7ab8','#ffd84d','#4fa3ff','#4cc38a'][i],'walk',{path:p}));

/* ---------- camera ---------- */
const dir=new THREE.Vector3(1,1.25,1).normalize(),SIN=dir.y;
const RV=new THREE.Vector3(1,0,-1).normalize(),FV=new THREE.Vector3(-1,0,-1).normalize();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),asp=()=>stage.clientWidth/stage.clientHeight;
const homeCam=()=>({x:24.5,z:11.5,zoom:Math.min(HF/40,HF*asp()/60)});
let cam=homeCam(),raf,sel=-1;
function placeCam(){camera.zoom=cam.zoom;camera.position.set(cam.x+dir.x*120,dir.y*120,cam.z+dir.z*120);camera.lookAt(cam.x,0,cam.z);camera.updateProjectionMatrix()}
function resize(){const w=stage.clientWidth,h=stage.clientHeight,a=w/h;renderer.setSize(Math.floor(w/PIX),Math.floor(h/PIX),false);
 camera.left=-HF*a/2;camera.right=HF*a/2;camera.top=HF/2;camera.bottom=-HF/2}
function go(t,ms=900){cancelAnimationFrame(raf);const s={...cam},t0=performance.now();
 (function f(n){let k=Math.min(1,(n-t0)/ms);k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
 cam={x:s.x+(t.x-s.x)*k,z:s.z+(t.z-s.z)*k,zoom:s.zoom+(t.zoom-s.zoom)*k};if(k<1)raf=requestAnimationFrame(f)})(t0)}
let pd=null,moved=false;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,.hq-info'))return;pd={x:e.clientX,y:e.clientY};moved=false;cancelAnimationFrame(raf)});
addEventListener('pointermove',e=>{
 if(!pd)return;
 const dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(!moved&&Math.hypot(dx,dy)<6)return;
 moved=true;stage.classList.add('drag');const u=(HF/cam.zoom)/stage.clientHeight;
 cam.x=clamp(cam.x-RV.x*dx*u+FV.x*dy*u/SIN,-6,55);cam.z=clamp(cam.z-RV.z*dx*u+FV.z*dy*u/SIN,-6,29);pd={x:e.clientX,y:e.clientY}});
addEventListener('pointerup',()=>{pd=null;stage.classList.remove('drag')});
stage.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();cam.zoom=clamp(cam.zoom*(e.deltaY>0?.9:1.1),.45,6)},{passive:false});
$('hq-zi').onclick=()=>cam.zoom=clamp(cam.zoom*1.25,.45,6);$('hq-zo').onclick=()=>cam.zoom=clamp(cam.zoom/1.25,.45,6);$('hq-hm').onclick=()=>closeRoom();
const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
function pick(e){if(e.target.closest&&e.target.closest('button,.hq-info'))return-1;const b=canvas.getBoundingClientRect();
 mv.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(mv,camera);
 const h=ray.intersectObjects(roomG,true)[0];if(!h)return-1;let o=h.object;while(o&&o.userData.room===undefined)o=o.parent;return o?o.userData.room:-1}
stage.addEventListener('click',e=>{if(moved)return;const i=pick(e);if(i>=0)openRoom(i)});

/* ---------- popup + zoom ---------- */
const info=$('hq-info');
function openRoom(i){
 const a=ACC[i],wide=asp()>1;sel=i;stage.classList.add('focus');labs.forEach((l,k)=>l.el.classList.toggle('sel',k===i));
 const cx=(i%4)*PITCH+5,cz=((i/4)|0)*PITCH+5,z=wide?HF/17:HF*asp()/17,visW=HF/z*asp(),visH=HF/z;
 const t=wide?{x:cx+RV.x*visW*.2,z:cz+RV.z*visW*.2,zoom:z}:{x:cx-FV.x*visH*.2/SIN,z:cz-FV.z*visH*.2/SIN,zoom:z};
 go(t);
 const list=a.posts.length?a.posts:Array.from({length:3},()=>({}));
 info.innerHTML=`<button class="hq-back" id="hq-bk">← Back to HQ</button><h2>${a.e} ${a.n}</h2><p class="hq-vibe">${a.vibe}</p>
 <div class="hq-chips">${a.tags.map(t=>`<span>${t}</span>`).join('')}</div><p>${a.d}</p>
 ${a.link?`<a class="hq-go" href="${a.link}" target="_blank" rel="noopener">Visit ${a.n} ↗</a>`:''}
 <div class="hq-posts">${list.map(p=>p.link||p.img?`<a class="hq-post" href="${p.link||'#'}" target="_blank" rel="noopener" style="background-image:url('${p.img||''}')"></a>`:`<div class="hq-post">COMING SOON</div>`).join('')}</div>`;
 info.classList.add('on');$('hq-bk').onclick=closeRoom;
}
function closeRoom(){sel=-1;stage.classList.remove('focus');info.classList.remove('on');go(homeCam(),800)}
addEventListener('keydown',e=>{if(e.key==='Escape'&&sel>=0)closeRoom()});
addEventListener('resize',()=>{resize();if(sel<0)cam=homeCam();else openRoom(sel)});

/* ---------- loop ---------- */
const V=new THREE.Vector3();let last=0;
function put(el,o,dy,pre){o.getWorldPosition(V);V.y+=dy;V.project(camera);
 el.style.transform=`translate(${(V.x*.5+.5)*stage.clientWidth}px,${(-V.y*.5+.5)*stage.clientHeight}px) translate(-50%,-100%)${pre||''}`}
let vis=true;if(window.IntersectionObserver)new IntersectionObserver(en=>{vis=en[0].isIntersecting}).observe(stage);
function frame(ms){const t=ms/1000,dt=Math.min(.05,t-last);last=t;if(!vis){requestAnimationFrame(frame);return}
 NPCS.forEach(o=>upd(o,t,dt));ticks.forEach(f=>f(t));placeCam();renderer.render(scene,camera);
 labs.forEach(l=>put(l.el,l.a,0));put(sign,signA,0);bubs.forEach(b=>put(b.el,b.target,b.dy));
 requestAnimationFrame(frame)}
stage.addEventListener('pointermove',e=>{if(!pd)stage.classList.toggle('hot',pick(e)>=0)});
resize();requestAnimationFrame(frame);

})();
