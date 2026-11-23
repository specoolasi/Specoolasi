// MUSIC PRODUCTION PAGE as a real 3D rendered record shop (three.js): roof and neon sign, shop window, shelves of records,
// the counter with a turntable, the floor, and a music studio at the bottom. Scrolling moves the camera from the roof down to the floor.
// Nothing here is a flat drawing and nothing loops: the picture only redraws when you scroll, drag or point at a record.
//   MusicShop3D.render(element, data)  /  MusicShop3D.update(records)  /  MusicShop3D.supported()
(function () {
  var T = window.THREE, S = null;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rnd(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function supported() { try { var c = document.createElement('canvas'); return !!(window.THREE && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }

  // ---------- textures drawn once with the canvas, used as real material maps ----------
  function canvasTex(w, h, draw, rx, ry) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; if (rx) t.repeat.set(rx, ry || rx); t.anisotropy = 4; return t;
  }
  function brickTex() { return canvasTex(256, 256, function (g, w, h) { var r = rnd(7); g.fillStyle = '#35282a'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < 8; y++) for (var x = -1; x < 4; x++) { var ox = (y % 2) * 32, l = 46 + r() * 14; g.fillStyle = 'rgb(' + Math.round(118 + r() * 38) + ',' + Math.round(58 + r() * 22) + ',' + Math.round(50 + r() * 18) + ')'; g.fillRect(x * 64 + ox + 2, y * 32 + 2, 60, 28);
      for (var k = 0; k < 14; k++) { g.fillStyle = 'rgba(0,0,0,' + r() * .16 + ')'; g.fillRect(x * 64 + ox + 2 + r() * 58, y * 32 + 2 + r() * 26, 2 + r() * 4, 1 + r() * 3); } } }); }
  function woodTex(base, dark, horiz) { return canvasTex(512, 512, function (g, w, h) { var r = rnd(11); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 160; i++) { g.strokeStyle = 'rgba(' + dark + ',' + (.05 + r() * .22) + ')'; g.lineWidth = .6 + r() * 2.2; g.beginPath(); var p = r() * (horiz ? h : w); if (horiz) { g.moveTo(0, p); g.bezierCurveTo(w * .3, p + r() * 8 - 4, w * .7, p + r() * 8 - 4, w, p + r() * 6 - 3); } else { g.moveTo(p, 0); g.bezierCurveTo(p + r() * 8 - 4, h * .3, p + r() * 8 - 4, h * .7, p + r() * 6 - 3, h); } g.stroke(); } }); }
  function floorTex() { return canvasTex(512, 512, function (g, w, h) { var r = rnd(5), n = 8; for (var i = 0; i < n; i++) { g.fillStyle = 'rgb(' + Math.round(112 + r() * 28) + ',' + Math.round(70 + r() * 18) + ',' + Math.round(40 + r() * 12) + ')'; g.fillRect(i * w / n, 0, w / n, h);
    for (var k = 0; k < 40; k++) { g.strokeStyle = 'rgba(50,25,10,' + r() * .25 + ')'; g.lineWidth = .8; g.beginPath(); var x = i * w / n + r() * w / n; g.moveTo(x, r() * h * .3); g.lineTo(x + r() * 6 - 3, h); g.stroke(); }
    g.fillStyle = 'rgba(20,8,2,.8)'; g.fillRect(i * w / n, 0, 2, h); g.fillRect(i * w / n, (i % 2) * h / 2, w / n, 2); } }, 4, 4); }
  function tileTex() { return canvasTex(256, 256, function (g, w, h) { g.fillStyle = '#1b1a26'; g.fillRect(0, 0, w, h); for (var y = 0; y < 8; y++) for (var x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#2c2b3c' : '#262536'; g.fillRect(x * 64 + (y % 2) * 32, y * 32, 62, 30); } }); }
  function grooveTex() { return canvasTex(512, 512, function (g, w, h) { g.fillStyle = '#0b0b0d'; g.fillRect(0, 0, w, h); var r = rnd(3);
    for (var i = 30; i < 250; i += 1.5) { g.strokeStyle = 'rgba(255,255,255,' + (.04 + r() * .1) + ')'; g.lineWidth = .6; g.beginPath(); g.arc(256, 256, i, 0, 6.3); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.9)'; [95, 150, 205].forEach(function (rad) { g.lineWidth = 3; g.beginPath(); g.arc(256, 256, rad, 0, 6.3); g.stroke(); }); }); }
  function labelTex() { return canvasTex(256, 256, function (g, w, h) { var gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, '#9a82ff'); gr.addColorStop(1, '#4a2fc0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 26px sans-serif'; g.fillText('SPECOOLASI', 128, 118); g.font = '400 16px monospace'; g.fillText('RECORDS  33 RPM', 128, 148); g.fillStyle = '#0b0b0d'; g.beginPath(); g.arc(128, 128, 7, 0, 6.3); g.fill(); }); }
  function coverTex(r, i, onLoad) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'), hue = (250 + i * 47) % 360;
    function art() { var gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'hsl(' + hue + ',60%,38%)'); gr.addColorStop(1, 'hsl(' + ((hue + 45) % 360) + ',65%,14%)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      var rg = g.createRadialGradient(80, 70, 4, 80, 70, 150); rg.addColorStop(0, 'hsla(' + hue + ',80%,70%,.8)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = '800 30px Georgia, serif'; var words = String(r.title || 'Untitled').toUpperCase().split(' '), y = 190, line = '';
      var lines = []; words.forEach(function (w) { if ((line + ' ' + w).length > 12) { lines.push(line); line = w; } else line = (line ? line + ' ' : '') + w; }); lines.push(line); lines = lines.slice(-3); y = 256 - 30 - (lines.length - 1) * 32;
      lines.forEach(function (l, k) { g.fillText(l, 18, y + k * 32); }); g.font = '400 14px monospace'; g.fillText(String(r.client || 'Specoolasi').toUpperCase(), 18, 28); }
    art(); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    if (r.img) { var im = new Image(); im.onload = function () { g.drawImage(im, 0, 0, 256, 256); t.needsUpdate = true; if (onLoad) onLoad(); }; im.src = r.img; }
    return t;
  }
  function neonTex() { return canvasTex(1024, 512, function (g, w, h) { g.fillStyle = '#0a0812'; g.fillRect(0, 0, w, h); g.textAlign = 'center';
    g.font = '700 250px Caveat, cursive'; g.shadowColor = '#8a6bff'; g.shadowBlur = 40; g.fillStyle = '#fff'; g.fillText('Specoolasi', 512, 280); g.shadowBlur = 12; g.fillText('Specoolasi', 512, 280);
    g.font = '400 84px "Bebas Neue", Impact, sans-serif'; g.shadowColor = '#ff7a3d'; g.shadowBlur = 30; g.fillStyle = '#ffe9d6'; var s = 'R   E   C   O   R   D   S'; g.fillText(s, 512, 430); }); }
  function openTex() { return canvasTex(256, 128, function (g, w, h) { g.fillStyle = '#220808'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff4a4a'; g.shadowColor = '#ff2a2a'; g.shadowBlur = 14; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#ffd0d0'; g.textAlign = 'center'; g.font = '700 70px "Bebas Neue", Impact, sans-serif'; g.fillText('OPEN', 128, 88); }); }
  function awningTex() { return canvasTex(256, 64, function (g, w, h) { for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#efe6d2' : '#5b3fd1'; g.fillRect(i * 32, 0, 32, h); } var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }
  function rugTex() { return canvasTex(512, 384, function (g, w, h) { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = '#6c4dff'; g.fillRect(16, 16, w - 32, h - 32); g.fillStyle = '#e8dcc0'; g.fillRect(30, 30, w - 60, h - 60); g.fillStyle = '#2a1766'; g.fillRect(38, 38, w - 76, h - 76);
    var r = rnd(2); for (var i = 0; i < 4000; i++) { g.fillStyle = 'rgba(255,255,255,' + r() * .05 + ')'; g.fillRect(r() * w, r() * h, 2, 2); } g.fillStyle = '#e8dcc0'; g.textAlign = 'center'; g.font = '800 58px Georgia, serif'; g.fillText('SPECOOLASI', w / 2, h / 2 + 8); g.font = '400 22px monospace'; g.fillText('R E C O R D S   ·   M U S I C   P R O D U C T I O N', w / 2, h / 2 + 52); }); }
  function posterTex(title, text) { return canvasTex(256, 360, function (g, w, h) { g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, w, h); var r = rnd(title.length); for (var i = 0; i < 1500; i++) { g.fillStyle = 'rgba(80,50,20,' + r() * .06 + ')'; g.fillRect(r() * w, r() * h, 2, 2); }
    g.fillStyle = '#7a2f2f'; g.font = '400 14px monospace'; g.fillText('SPECOOLASI RECORDS', 18, 30); g.fillStyle = '#1b1610'; g.font = '900 38px Georgia, serif'; var ws = title.split(' '), y = 90; ws.forEach(function (x) { g.fillText(x, 18, y); y += 42; });
    g.font = '400 15px sans-serif'; g.fillStyle = '#3a3125'; String(text).replace(/(.{1,28})(\s|$)/g, function (m, a) { g.fillText(a, 18, y + 14); y += 20; return m; }); }); }
  function skyTex() { return canvasTex(512, 512, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#04040c'); gr.addColorStop(.6, '#15102c'); gr.addColorStop(1, '#2a1f4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); var r = rnd(9); for (var i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,255,255,' + (.3 + r() * .7) + ')'; var s = r() < .1 ? 2 : 1; g.fillRect(r() * w, r() * h * .7, s, s); } }); }

  // ---------- small modelling helpers ----------
  function mat(o) { return new T.MeshStandardMaterial(o); }
  function box(parent, w, h, d, x, y, z, m, cast) { var o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = cast !== false; o.receiveShadow = true; parent.add(o); return o; }
  function cyl(parent, rt, rb, h, x, y, z, m, seg) { var o = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 24), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
  function plane(parent, w, h, x, y, z, m) { var o = new T.Mesh(new T.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.receiveShadow = true; parent.add(o); return o; }
  function rep(tex, rx, ry) { var t = tex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return t; }

  // ---------- the shop ----------
  function buildWorld(data, phone, onTex) {
    var scene = new T.Scene(), world = new T.Group(); scene.add(world); var picks = [], W = { scene: scene, picks: picks, results: new T.Group() };
    scene.fog = new T.Fog(0x0b0a16, 38, 120);
    var sky = new T.Mesh(new T.SphereGeometry(110, 24, 16), new T.MeshBasicMaterial({ map: skyTex(), side: T.BackSide, fog: false })); scene.add(sky);
    var brick = brickTex(), wood = woodTex('#5a3a22', '30,16,6', false), woodH = woodTex('#6a4529', '30,16,6', true), floor = floorTex(), tiles = tileTex();
    var mBrick = function (w, h) { return mat({ map: rep(brick, w / 1.4, h / 1.2), roughness: .92, metalness: 0 }); };
    var mWood = mat({ map: wood, roughness: .55, metalness: 0 }), mWoodH = mat({ map: woodH, roughness: .5, metalness: .02 }), mDark = mat({ color: 0x14121c, roughness: .6, metalness: .1 }), mMetal = mat({ color: 0xc9ccd4, roughness: .28, metalness: .95 });
    // street and sidewalk
    var street = mat({ color: 0x14141c, roughness: .85, metalness: 0 }); plane(world, 140, 100, 0, -.02, 30, street).rotation.x = -Math.PI / 2;
    box(world, 40, .16, 3.4, 0, .06, 1.7, mat({ color: 0x3a3a46, roughness: .9 }), false);
    // front wall with a window and a door
    var FW = function (x0, x1, y0, y1) { var w = x1 - x0, h = y1 - y0; box(world, w, h, .5, (x0 + x1) / 2, (y0 + y1) / 2, -.25, mBrick(w, h)); };
    FW(-9, -6.5, 0, 6.2); FW(-6.5, -.5, 0, .9); FW(-6.5, -.5, 4.4, 6.2); FW(-.5, 2.2, 0, 6.2); FW(2.2, 4, 3.4, 6.2); FW(4, 9, 0, 6.2);
    box(world, 18.4, .7, .5, 0, 6.55, -.25, mBrick(18.4, .7)); box(world, 6.3, .12, .6, -3.5, .94, -.3, mWoodH); box(world, 6.3, .12, .6, -3.5, 4.4, -.3, mWoodH);
    [-6.5, -.5].forEach(function (x) { box(world, .14, 3.6, .6, x, 2.65, -.3, mWoodH); }); box(world, .14, 3.5, .6, 2.2, 1.7, -.3, mWoodH); box(world, .14, 3.5, .6, 4, 1.7, -.3, mWoodH);
    plane(world, 6, 3.5, -3.5, 2.65, -.15, mat({ color: 0xaac4ff, roughness: .05, metalness: 0, transparent: true, opacity: .1, envMapIntensity: 1.6 }));
    plane(world, 1.8, 3.4, 3.1, 1.7, -.15, mat({ color: 0xaac4ff, roughness: .05, transparent: true, opacity: .1 }));
    box(world, .05, .3, .06, 2.35, 1.7, .05, mMetal);
    var awn = new T.Mesh(new T.BoxGeometry(6.6, .07, 1.9), mat({ map: awningTex(), roughness: .85 })); awn.position.set(-3.5, 4.95, .85); awn.rotation.x = .3; awn.castShadow = true; world.add(awn);
    var val = new T.Mesh(new T.BoxGeometry(6.6, .42, .05), mat({ map: awningTex(), roughness: .85 })); val.position.set(-3.5, 4.45, 1.72); val.castShadow = true; world.add(val);
    // roof, parapet, chimney and the neon sign on top
    box(world, 18.4, .4, 12.6, 0, 6.2, -6.3, mat({ map: rep(tiles, 8, 5), roughness: .8 }), false);
    var chim = box(world, 1, 2.2, 1, -5.5, 7.4, -6, mBrick(1, 2.2)); box(world, 1.2, .15, 1.2, -5.5, 8.55, -6, mDark);
    box(world, .22, 2.6, .22, 1.4, 7.5, -2.2, mDark); box(world, .22, 2.6, .22, 5.4, 7.5, -2.2, mDark);
    box(world, 6.4, 3.3, .16, 3.4, 8.9, -2.2, mDark); var nt = neonTex(), neon = new T.Mesh(new T.PlaneGeometry(6.1, 3.05), new T.MeshStandardMaterial({ map: nt, emissiveMap: nt, emissive: 0xffffff, emissiveIntensity: 1.5, roughness: .4 })); neon.position.set(3.4, 8.9, -2.11); world.add(neon);
    // street lamp
    cyl(world, .06, .08, 5.2, 7.6, 2.6, 3.9, mDark); cyl(world, .05, .05, 1.1, 7.05, 5.1, 3.9, mDark).rotation.z = Math.PI / 2; var bulb = new T.Mesh(new T.SphereGeometry(.17, 12, 8), new T.MeshBasicMaterial({ color: 0xffd7a0 })); bulb.position.set(6.55, 5.05, 3.9); world.add(bulb);
    // ----- inside -----
    plane(world, 18, 12, 0, 0, -6, mat({ map: floor, roughness: .42, metalness: .04, envMapIntensity: .7 })).rotation.x = -Math.PI / 2;
    var wallM = mat({ color: 0x3a2538, roughness: .9 });
    plane(world, 12, 6, -9, 3, -6, wallM).rotation.y = Math.PI / 2; plane(world, 12, 6, 9, 3, -6, wallM).rotation.y = -Math.PI / 2; plane(world, 18, 6, 0, 3, -12, wallM);
    plane(world, 18, 12, 0, 6, -6, mat({ color: 0x1a1220, roughness: .95 })).rotation.x = Math.PI / 2;
    box(world, 12, 1.1, .08, -8.96, .55, -6, mWood).rotation.y = Math.PI / 2; box(world, 12, 1.1, .08, 8.96, .55, -6, mWood).rotation.y = Math.PI / 2;
    for (var b = -7.5; b <= 7.5; b += 3) box(world, .3, .35, 12, b, 5.82, -6, mWood);
    [-6, -2, 2, 6].forEach(function (x, i) {                                   // pendant lamps
      cyl(world, .012, .012, .8, x, 5.6, -6, mDark, 6); var sh = new T.Mesh(new T.ConeGeometry(.3, .3, 24, 1, true), mat({ color: 0x1b1b24, roughness: .5, metalness: .4, side: T.DoubleSide })); sh.position.set(x, 5.1, -6); sh.castShadow = false; world.add(sh);
      var bl = new T.Mesh(new T.SphereGeometry(.09, 12, 8), new T.MeshBasicMaterial({ color: 0xffd9a0 })); bl.position.set(x, 4.98, -6); world.add(bl);
    });
    // back wall: shelves with records on ledges (this is the part you can click)
    var backPanel = mat({ color: 0x24160f, roughness: .8 }); box(world, 17.4, 4.6, .1, 0, 2.6, -11.93, backPanel, false);
    var rows = phone ? [.55, 1.6, 2.65] : [.55, 1.6, 2.65, 3.7], step = phone ? .46 : .42, nPer = Math.floor(15.6 / step);
    rows.forEach(function (y) { box(world, 17.4, .06, .5, 0, y - .03, -11.7, mWoodH); box(world, 17.4, .1, .04, 0, y + .02, -11.46, mWoodH, false); });
    for (var u = -8.7; u <= 8.7; u += 2.9) box(world, .08, 4.4, .5, u, 2.5, -11.7, mWood);
    var fills = []; for (var f = 0; f < 10; f++) fills.push(mat({ map: coverTex({ title: ['Sunset', 'Late Night', 'Haze', 'Signal', 'Velvet', 'Neon Rain', 'Slow Motion', 'Daydream', 'Echo', 'Ritual'][f], client: ['Studio', 'Sessions', 'Vol. ' + (f + 1)][f % 3] }, f + 3), roughness: .7 }));
    var edge = mat({ color: 0xd8cfb9, roughness: .9 }), rr = rnd(21), slots = [];
    rows.forEach(function (y, ri) { for (var k = 0; k < nPer; k++) { var x = -7.8 + k * step; if (ri === 2 || ri === 1) { if (k > 2 && slots.length < 60 && (ri === 2 ? true : k < 20)) { slots.push({ x: x, y: y + .17, z: -11.6 }); continue; } }
      var m = fills[Math.floor(rr() * 10)]; var o = new T.Mesh(new T.BoxGeometry(.315, .315, .008), [edge, edge, edge, edge, m, edge]); o.position.set(x, y + .165, -11.62); o.rotation.x = -.06; o.rotation.y = (rr() - .5) * .05; o.castShadow = false; o.receiveShadow = true; world.add(o); } });
    W.slots = slots; W.edge = edge; W.world = world; W.fills = fills; W.fillGroup = new T.Group(); world.add(W.results); world.add(W.fillGroup);
    // posters on the left wall (what we do)
    (data.items || []).slice(0, 3).forEach(function (it, i) { var z = -3 - i * 3; box(world, .05, 1.5, 1.1, -8.93, 2.7, z, mDark); var p = new T.Mesh(new T.PlaneGeometry(1, 1.4), mat({ map: posterTex(it[0], it[1]), roughness: .8 })); p.position.set(-8.9, 2.7, z); p.rotation.y = Math.PI / 2; world.add(p); });
    // window display
    box(world, 5.8, .3, 1.2, -3.5, 1.05, -1.2, mWoodH); box(world, 5.8, 3, .08, -3.5, 2.7, -1.75, mat({ color: 0x1c1018, roughness: .9 }));
    for (var w = 0; w < 5; w++) { var wm = mat({ map: coverTex({ title: ['New', 'Arrivals', 'Fresh', 'Pressings', 'Staff'][w], client: 'Specoolasi' }, w + 20), roughness: .7 }); var wo = new T.Mesh(new T.BoxGeometry(.5, .5, .012), [edge, edge, edge, edge, wm, edge]); wo.position.set(-5.4 + w * 1.05, 1.45, -1.3); wo.rotation.x = -.18; wo.castShadow = true; world.add(wo); box(world, .04, .3, .04, -5.4 + w * 1.05, 1.28, -1.45, mDark); }
    var op = new T.Mesh(new T.PlaneGeometry(.9, .45), new T.MeshStandardMaterial({ map: openTex(), emissiveMap: openTex(), emissive: 0xffffff, emissiveIntensity: 1.2 })); op.position.set(-1.4, 3.7, -.45); world.add(op);
    // the counter, turntable, mixer, speakers and cash register
    var ctr = new T.Group(); world.add(ctr); box(ctr, 7, .95, 1.1, 0, .475, -4.9, mWood); box(ctr, 7.3, .07, 1.25, 0, .985, -4.9, mat({ color: 0x1d130e, roughness: .28, metalness: .05, envMapIntensity: .9 }));
    var tx = -1.4, ty = 1.02, tz = -4.9; box(ctr, .55, .08, .43, tx, ty + .04, tz, mat({ color: 0x15151a, roughness: .5, metalness: .3 }));
    cyl(ctr, .18, .18, .03, tx, ty + .095, tz, mMetal, 40); var vin = cyl(ctr, .172, .172, .006, tx, ty + .112, tz, mat({ map: grooveTex(), roughness: .32, metalness: .15, envMapIntensity: 1.3 }), 48);
    cyl(ctr, .054, .054, .008, tx, ty + .117, tz, mat({ map: labelTex(), roughness: .6 }), 32); cyl(ctr, .006, .006, .03, tx, ty + .13, tz, mMetal, 8);
    var arm = new T.Group(); arm.position.set(tx + .2, ty + .14, tz - .13); arm.rotation.y = .62; ctr.add(arm); cyl(arm, .026, .026, .05, 0, -.02, 0, mMetal, 16); var ar = cyl(arm, .005, .005, .3, 0, .0, .15, mMetal, 8); ar.rotation.x = Math.PI / 2; box(arm, .03, .012, .05, 0, -.004, .31, mDark);
    box(ctr, .34, .06, .3, -.5, ty + .03, tz, mDark); [0, 1, 2, 3].forEach(function (k) { cyl(ctr, .014, .014, .02, -.6 + k * .065, ty + .07, tz - .05, mMetal, 12); }); box(ctr, .03, .012, .12, -.45, ty + .066, tz + .06, mat({ color: 0x6c4dff, emissive: 0x6c4dff, emissiveIntensity: .8 }));
    [-3, 3].forEach(function (x, i) { var sp = new T.Group(); sp.position.set(x, 1.02, tz); ctr.add(sp); box(sp, .36, .6, .32, 0, .3, 0, mat({ color: 0x1a1612, roughness: .8 })); var wf = cyl(sp, .1, .1, .03, 0, .22, .17, mat({ color: 0x0c0c10, roughness: .6 }), 28); wf.rotation.x = Math.PI / 2; var tw = cyl(sp, .03, .03, .02, 0, .48, .17, mMetal, 16); tw.rotation.x = Math.PI / 2; });
    box(ctr, .42, .3, .38, 1.9, ty + .15, tz, mDark); var scr = plane(ctr, .24, .12, 1.9, ty + .25, tz + .195, new T.MeshBasicMaterial({ color: 0x6fd36a })); box(ctr, .4, .02, .3, 1.9, ty + .31, tz - .02, mMetal);
    // rug and door mat
    var rug = plane(world, 4.6, 3.45, .3, .012, -3.0, mat({ map: rugTex(), roughness: .95 })); rug.rotation.x = -Math.PI / 2; plane(world, 1.5, .8, 3.1, .012, -.9, mat({ color: 0x241a12, roughness: 1 })).rotation.x = -Math.PI / 2;
    // lights
    scene.add(new T.HemisphereLight(0x7a76b8, 0x2a1a14, .6));
    var moon = new T.DirectionalLight(0x9fb4ff, .6); moon.position.set(-12, 26, 20); moon.castShadow = true; moon.shadow.mapSize.set(phone ? 512 : 1024, phone ? 512 : 1024); moon.shadow.camera.left = -22; moon.shadow.camera.right = 22; moon.shadow.camera.top = 22; moon.shadow.camera.bottom = -22; moon.shadow.camera.far = 80; moon.shadow.bias = -.0006; moon.shadow.camera.updateProjectionMatrix(); scene.add(moon);
    [-6, -2, 2, 6].forEach(function (x) { var pl = new T.PointLight(0xffb36b, 1.2, 15, 2); pl.position.set(x, 4.8, -6); scene.add(pl); });
    var sp1 = new T.SpotLight(0xffe0b0, 2.4, 12, .6, .5, 1); sp1.position.set(-1.2, 5.6, -3.6); sp1.target.position.set(-1.3, 1, -4.9); sp1.castShadow = true; sp1.shadow.mapSize.set(phone ? 512 : 1024, phone ? 512 : 1024); sp1.shadow.bias = -.0005; scene.add(sp1); scene.add(sp1.target);
    var shelfL = new T.PointLight(0xffd0a0, 1.5, 12, 2); shelfL.position.set(0, 4.7, -9.5); scene.add(shelfL);
    var winL = new T.PointLight(0xffb878, 1.3, 8, 2); winL.position.set(-3.5, 3.4, -.9); scene.add(winL);
    var neonL = new T.PointLight(0x8a6bff, 2.4, 14, 2); neonL.position.set(3.4, 8.9, 0); scene.add(neonL); var neonL2 = new T.PointLight(0xff7a3d, 1.2, 8, 2); neonL2.position.set(3.4, 7.7, -.5); scene.add(neonL2);
    var lampL = new T.PointLight(0xffd7a0, 1.4, 12, 2); lampL.position.set(6.3, 5, 4.2); scene.add(lampL);
    return W;
  }

  // ---------- the camera path from the roof to the floor ----------
  function keyframes(portrait) {
    var k = portrait ? 4 : 0;   // phones stand a little further back
    return [
      { p: [portrait ? 3.4 : -.8, 8.7, 11.4 + k * .4], l: [portrait ? 3.4 : .4, 8.4, -2] },        // roof and neon sign
      { p: [-3.4, 3.0, 9.5 + k * .5], l: [-3.4, 3.0, -1] },          // shop window
      { p: [0, 2.3, -7.1 + (portrait ? .5 : 0)], l: [0, 2.2, -11.9] },    // shelves, all four rows in view
      { p: [-.6, 2.05, -3.0], l: [-1.3, 1.0, -4.9] },           // counter and turntable seen from above
      { p: [.5, 5.0 + k * .15, -1.0], l: [.3, 0, -3.0] }          // the rug on the floor, seen from above
    ];
  }
  function ease(t) { return t * t * (3 - 2 * t); }

  function render(root, d) {
    var phone = window.innerWidth <= 760, steps = (d.steps || []).map(function (x, i) { return '<div class="m3-slip"><small>STEP 0' + (i + 1) + '</small><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></div>'; }).join('');
    var items = (d.items || []).map(function (x, i) { return '<div class="m3-item"><b>No. 0' + (i + 1) + '</b><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></div>'; }).join('');
    root.innerHTML = '<div class="m3"><canvas class="m3-gl" aria-hidden="true"></canvas><div class="m3-vig"></div>' +
      '<section class="m3-sec"><div class="m3-panel hero"><a class="back" href="index.html#services">&larr; All services</a><p class="mono"><b>(' + esc(d.n) + ' / 05)</b> Service</p><h1>' + esc(d.title) + '</h1><p class="lead">' + esc(d.intro) + '</p><a class="m3-btn" href="' + esc(d.mail) + '">Start a project &rarr;</a></div></section>' +
      '<section class="m3-sec"><div class="m3-panel side"><p class="mono">What we do</p><h2>' + esc(d.title) + ', start to finish.</h2><div class="m3-items">' + items + '</div></div></section>' +
      '<section class="m3-sec"><div class="m3-panel top"><p class="mono"><b>(A)</b> Results</p><h2>Pick a record.</h2><p class="lead">Welcome inside. Every record on this wall is something we made. <b class="m3-hint">Drag sideways to walk along the shelf, tap a record to pull it out.</b></p></div></section>' +
      '<section class="m3-sec"><div class="m3-panel side"><p class="mono"><b>(B)</b> How it works</p><h2>Four steps. No mystery.</h2><div class="m3-slips">' + steps + '</div></div></section>' +
      '<section class="m3-sec"><div class="m3-panel low"><p class="mono">Ready?</p><h2>Let&rsquo;s talk about your ' + esc(String(d.title).toLowerCase()) + '.</h2><p class="lead">Send us a short note about your brand and what you need. We will reply as soon as we can.</p><a class="m3-btn" href="' + esc(d.mail) + '">Start a project &rarr;</a>' + (d.next ? ' <a class="m3-btn ghost" href="service.html?id=' + esc(d.next.id) + '">Next: ' + esc(d.next.title) + ' &rarr;</a>' : '') + '</div></section>' +
      '<section class="m3-sec m3-studio" id="m3-studio"><div class="wrap"><p class="mono"><b>(C)</b> Studio</p><h2>Make a beat.</h2><p class="lead">The studio at the back. Press play, click the pads, draw notes in the piano roll, move the faders.</p></div><div class="m3-daw"></div></section></div>';
    var el = root.querySelector('.m3'), cv = el.querySelector('.m3-gl'), secs = [].slice.call(el.querySelectorAll('.m3-sec'));
    var renderer = new T.WebGLRenderer({ canvas: cv, antialias: !phone, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.25 : 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; renderer.outputEncoding = T.sRGBEncoding; renderer.setClearColor(0x05050c, 1);
    var cam = new T.PerspectiveCamera(phone ? 58 : 42, 1, .1, 300), world = null, panX = 0, panLimit = 5, dirty = true, hover = -1, pos = 0, K = keyframes(phone);
    S = { renderer: renderer, cam: cam, d: d, world: null, redraw: function () { dirty = true; } };
    function build() {
      world = buildWorld(d, phone); S.world = world;
      var pm = new T.PMREMGenerator(renderer), es = new T.Scene(), eg = new T.Mesh(new T.BoxGeometry(40, 20, 40), new T.MeshBasicMaterial({ color: 0x1b1428, side: T.BackSide })); es.add(eg);
      [[-10, 9, 0xffb060], [10, 9, 0xb08cff], [0, 9, 0xffffff]].forEach(function (s) { var sb = new T.Mesh(new T.BoxGeometry(8, .3, 8), new T.MeshBasicMaterial({ color: s[2] })); sb.position.set(s[0], s[1], -6); es.add(sb); });
      world.scene.environment = pm.fromScene(es, .04).texture; setRecords(d.records || []);
    }
    function setRecords(list) {
      while (world.results.children.length) world.results.remove(world.results.children[0]); world.picks.length = 0;
      while (world.fillGroup.children.length) world.fillGroup.remove(world.fillGroup.children[0]);
      var rf = rnd(33); for (var q = Math.min(list.length, world.slots.length); q < world.slots.length; q++) { var sl = world.slots[q], fo = new T.Mesh(new T.BoxGeometry(.315, .315, .008), [world.edge, world.edge, world.edge, world.edge, world.fills[Math.floor(rf() * 10)], world.edge]); fo.position.set(sl.x, sl.y, sl.z + .005); fo.rotation.x = -.06; fo.receiveShadow = true; world.fillGroup.add(fo); }
      list.slice(0, world.slots.length).forEach(function (r, i) { var s = world.slots[i], m = mat({ map: coverTex(r, i, S.redraw), roughness: .65 }), o = new T.Mesh(new T.BoxGeometry(.315, .315, .008), [world.edge, world.edge, world.edge, world.edge, m, world.edge]);
        o.position.set(s.x, s.y, s.z + .005); o.rotation.x = -.06; o.castShadow = false; o.userData = { i: i, y: s.y, z: s.z + .005 }; world.results.add(o); world.picks.push(o); });
      dirty = true;
    }
    S.setRecords = setRecords;
    function size() { var w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 58 : 42; cam.updateProjectionMatrix(); dirty = true; }
    function scrollPos() { var vh = window.innerHeight, c = window.scrollY + vh * .5; for (var i = 0; i < secs.length; i++) { var r = secs[i].getBoundingClientRect(), top = r.top + window.scrollY; if (c < top + r.height || i === secs.length - 1) return Math.max(0, i + (c - top) / Math.max(1, r.height) - .5); } return 0; }   // a section sitting in the middle of the screen = its own camera view
    function placeCamera() {
      pos = clamp(scrollPos(), 0, 4); var i = Math.min(3, Math.floor(pos)), t = ease(pos - i), a = K[i], b = K[i + 1], p = [0, 0, 0], l = [0, 0, 0], k;
      for (k = 0; k < 3; k++) { p[k] = a.p[k] + (b.p[k] - a.p[k]) * t; l[k] = a.l[k] + (b.l[k] - a.l[k]) * t; }
      var w = Math.max(0, 1 - Math.abs(pos - 2) * 1.6); p[0] += panX * w; l[0] += panX * w; cam.position.set(p[0], p[1], p[2]); cam.lookAt(new T.Vector3(l[0], l[1], l[2]));
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    var studioEl = el.querySelector('.m3-studio');
    function frame() { requestAnimationFrame(frame); if (!dirty || !world) return; dirty = false; if (studioEl.getBoundingClientRect().top < window.innerHeight * .1) return; placeCamera(); renderer.render(world.scene, cam); }   // the studio hides the picture, so nothing is drawn down there
    // ---- pointer: drag to walk along the shelf, tap a record to pull it out ----
    var ray = new T.Raycaster(), mv = new T.Vector2(), drag = null, btn = null;
    function pick(e) { var b = cv.getBoundingClientRect(); mv.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height * 2 - 1)); ray.setFromCamera(mv, cam); var h = ray.intersectObjects(world.picks, false)[0]; return h ? h.object : null; }
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, p: panX, moved: false }; });
    addEventListener('pointermove', function (e) {
      if (drag) { var dx = e.clientX - drag.x; if (Math.abs(dx) > 5) drag.moved = true; if (drag.moved && Math.abs(pos - 2) < .6) { var mpp = 2 * 4.8 * Math.tan(cam.fov * Math.PI / 360) * cam.aspect / window.innerWidth; panX = clamp(drag.p - dx * mpp, -panLimit, panLimit); dirty = true; } return; }
      if (e.target !== cv || Math.abs(pos - 2) > .6 || !world) return; var o = pick(e), id = o ? o.userData.i : -1; if (id !== hover) { world.picks.forEach(function (m) { m.position.z = m.userData.z + (m.userData.i === id ? .06 : 0); m.position.y = m.userData.y + (m.userData.i === id ? .03 : 0); }); hover = id; cv.style.cursor = id >= 0 ? 'pointer' : 'grab'; dirty = true; }
    });
    addEventListener('pointerup', function (e) {
      var dg = drag; drag = null; if (!dg || dg.moved || !world || Math.abs(pos - 2) > .6 || e.target !== cv) return; var o = pick(e);
      if (o && window.VinylStore) { if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.style.cssText = 'position:fixed;width:96px;height:96px;opacity:0;pointer-events:none'; document.body.appendChild(btn); } btn.style.left = (e.clientX - 48) + 'px'; btn.style.top = (e.clientY - 48) + 'px'; window.VinylStore.open(o.userData.i, btn); }
    });
    addEventListener('scroll', function () { dirty = true; }, { passive: true }); addEventListener('resize', function () { size(); });
    build(); size(); frame();
    // the studio at the bottom
    var dawHost = el.querySelector('.m3-daw'), ld = function () { if (window.DAW) window.DAW.mount(dawHost); else { var s = document.createElement('script'); s.src = 'js/daw.js'; s.onload = function () { if (window.DAW) window.DAW.mount(dawHost); }; document.body.appendChild(s); } }; ld();
    return true;
  }
  function update(list) { if (S && S.setRecords) S.setRecords(list || []); }
  window.MusicShop3D = { render: render, update: update, supported: supported, _build: buildWorld, _keys: keyframes };
})();
