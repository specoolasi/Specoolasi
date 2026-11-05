/* Specoolasi HQ: one big house at night, cut open so you can see inside. Each room is one account and plays that account's scene.
   Plain Canvas 2D. Needs js/accounts.js and js/scenes/core.js, a.js, b.js loaded first, and a <div id="hq"> to draw into.
   Desktop: one big 4 x 2 house you look at from outside.
   Phones (800px wide or less): their own diorama, a long single-storey row of all the rooms.
   You swipe sideways and one room fills the screen at a time. */
(function () {
'use strict';
var mount = document.getElementById('hq'), SC = window.SCENES;
if (!mount || !SC || !SC.make || !SC.U) return;
var U = SC.U, A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, poly = U.poly, glow = U.glow, rr = U.rr, rnd = U.rnd, rs = U.rs, mc = U.mc;
var clamp = U.clamp, ss = U.ss;

/* ===== YOUR ACCOUNTS: names, texts and posts come from js/accounts.js (this list only adds the emoji and a one-liner) ===== */
var ACC = [
  { id: 'popthusiast', n: 'Popthusiast', e: '🎤', vibe: 'Fan energy, 24/7', tags: ['K-pop', 'Idol edits', 'Girl groups'], link: '', posts: [], d: 'Edits of your favorite K-pop girl idols.', tint: '#ff4fa3' },
  { id: 'ketahui-id', n: 'Ketahui.id', e: '🇮🇩', vibe: 'Kabar terbaru, setiap hari', tags: ['Indonesia', 'News', 'Updates'], link: '', posts: [], d: 'Indonesian news updates.', tint: '#7aa8ff' },
  { id: 'globall-id', n: 'Globall_id', e: '⚽', vibe: 'Full time, worldwide', tags: ['Football', 'Match news', 'Transfers'], link: '', posts: [], d: 'Football news from all around the world.', tint: '#9affb4' },
  { id: 'popnewsiast', n: 'Popnewsiast', e: '🎵', vibe: 'Music news, on air', tags: ['Music news', 'Releases', 'Worldwide'], link: '', posts: [], d: 'Music news from all around the world.', tint: '#ff8aa8' },
  { id: 'dramories', n: 'Dramories', e: '🎬', vibe: 'Feel every scene', tags: ['K-drama', 'Movie edits', 'Clips'], link: '', posts: [], d: 'Clips and edits from Korean movies and series.', tint: '#ff9cc4' },
  { id: 'listenation', n: 'Listenation', e: '🎧', vibe: 'Turn it up', tags: ['EDM', 'Recommendations', 'Playlists'], link: '', posts: [], d: 'EDM and music recommendations.', tint: '#8a6cff' },
  { id: 'gloome', n: 'Gloome', e: '🌙', vibe: 'Quiet, moody, aesthetic', tags: ['Quotes', 'Relatable', 'Late night'], link: '', posts: [], d: 'Relatable quotes.', tint: '#ffb866' },
  { id: 'clippods-id', n: 'Clippods.id', e: '🎙️', vibe: 'Press record', tags: ['Podcast clips', 'Indonesian creators', 'Video'], link: '', posts: [], d: 'Clips from Indonesian content creator podcasts.', tint: '#ff6a5a' }
];
/* real data from js/accounts.js (read again every time a room opens, so posts added later show up) */
function sync(a) {
  if (!window.ACCOUNTS) return; var m = ACCOUNTS.find(function (x) { return x.id === a.id; }); if (!m) return;
  a.n = m.name || a.n; if (m.desc) a.d = m.desc; a.page = 'account.html?id=' + encodeURIComponent(m.id); a.posts = (m.samples || []).slice(0, 6);
}
ACC.forEach(sync);
var scenes = ACC.map(function (a) { return SC.make(a.id); });
if (!scenes.every(Boolean)) { mount.innerHTML = '<p class="state">The HQ could not load. You can still open each account from the <a href="index.html#social">home page</a>.</p>'; return; }

/* ---------- page pieces ---------- */
function $(id) { return document.getElementById(id); }
mount.innerHTML = '<p class="hq-hint">Drag to look around &middot; tap a room to step inside &middot; pinch or +/&minus; to zoom</p><div class="hq-stage house" id="hq-stage"><canvas id="hq-c" role="img" aria-label="A big house cut open to show eight rooms, one for each Specoolasi account"></canvas><div class="hq-tools"><button id="hq-zi" aria-label="Zoom in">+</button><button id="hq-zo" aria-label="Zoom out">&minus;</button><button id="hq-hm">HQ</button></div><aside class="hq-info" id="hq-info"></aside></div>';
var stage = $('hq-stage'), cv = $('hq-c'), info = $('hq-info'), ctx = cv.getContext('2d');
var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
var labs = ACC.map(function (a, i) {
  var el = document.createElement('button'); el.className = 'hq-lab'; el.innerHTML = '<span class="em">' + a.e + '</span><span class="nm">' + a.n + '</span>'; el.setAttribute('aria-label', 'Open ' + a.n);
  el.addEventListener('click', function (e) { e.stopPropagation(); openRoom(i); }); stage.appendChild(el); return el;
});

/* ---------- phone diorama: arrows, dots and a hint of its own ---------- */
stage.insertAdjacentHTML('beforeend', '<button type="button" class="hq-pg prev" aria-label="Previous room">&lsaquo;</button><button type="button" class="hq-pg next" aria-label="Next room">&rsaquo;</button><div class="hq-dots" aria-hidden="true">' + ACC.map(function () { return '<i></i>'; }).join('') + '</div>');
var dots = [].slice.call(stage.querySelectorAll('.hq-dots i')), hintEl = mount.querySelector('.hq-hint'), HINT0 = hintEl ? hintEl.innerHTML : '';
stage.querySelector('.hq-pg.prev').addEventListener('click', function (e) { e.stopPropagation(); stepRoom(-1); });
stage.querySelector('.hq-pg.next').addEventListener('click', function (e) { e.stopPropagation(); stepRoom(1); });

/* ---------- the house: sizes in world units ---------- */
var RW = 336, RH = 189, PT = 18, FS = 26, WT = 40, TOPB = 24, FOUND = 44, OV = 70;
var LITE = false, lastW = 0, lastH = 0, lastScroll = 0, cur = 0;
var L, rooms = [], HOUSE, FRONT, Q = 1, sw = 0, sh_ = 0, dpr = 1, fit = 1, cam = { x: 0, y: 0, z: 1 }, sel = -1, hover = -1, anim = null, needDraw = true;
function layout(portrait, strip) {
  var cols = strip ? 8 : portrait ? 2 : 4, rows = strip ? 1 : portrait ? 4 : 2, gh = strip ? 130 : portrait ? 170 : 200, mx = strip ? 130 : portrait ? 170 : 160, sk = 140, gd = portrait ? 250 : 200;
  var HW = cols * RW + (cols - 1) * PT + 2 * WT, W = HW + 2 * mx, HX = mx, roofBase = sk + gh, RY0 = roofBase + TOPB;
  var rb = RY0 + rows * RH + (rows - 1) * FS, slab = rb + FS, GY = slab + FOUND, H = GY + gd;
  var o = { portrait: portrait, strip: !!strip, cols: cols, rows: rows, gh: gh, sk: sk, HW: HW, W: W, H: H, HX: HX, roofBase: roofBase, RY0: RY0, rb: rb, slab: slab, GY: GY, ax: HX + HW / 2 };
  rooms = ACC.map(function (a, i) { var c = i % cols, r = (i / cols) | 0; return { i: i, x: HX + WT + c * (RW + PT), y: RY0 + r * (RH + FS), w: RW, h: RH, r: r, c: c, vis: true }; });
  return o;
}
function tree(c, x, gy, s) {
  c.fillStyle = lg(c, x - 18 * s, 0, x + 18 * s, 0, [[0, '#1c1424'], [1, '#0b0810']]); poly(c, [[x - 14 * s, gy], [x - 7 * s, gy - 260 * s], [x + 7 * s, gy - 260 * s], [x + 16 * s, gy]], c.fillStyle); c.fill();
  for (var i = 0; i < 16; i++) {
    var a = rnd() * 6.28, d = Math.sqrt(rnd()), cx = x + Math.cos(a) * d * 120 * s, cy = gy - 330 * s + Math.sin(a) * d * 130 * s, r = (46 + rnd() * 44) * s;
    c.fillStyle = rg(c, cx + r * .3, cy - r * .35, r * .1, r, [[0, '#2d6a50'], [.55, '#18452f'], [1, '#08201a']]); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  }
  for (i = 0; i < 40; i++) { var b = rnd() * 6.28, dd = Math.sqrt(rnd()); c.fillStyle = A('#9ad8ff', .05 + rnd() * .08); c.beginPath(); c.arc(x + Math.cos(b) * dd * 110 * s + 20 * s, gy - 360 * s + Math.sin(b) * dd * 110 * s, 3 + rnd() * 5, 0, 7); c.fill(); }
}
function bush(c, x, y, s) {
  for (var i = 0; i < 7; i++) { var r = (16 + rnd() * 14) * s, bx = x + (i - 3) * 14 * s, by = y - rnd() * 14 * s; c.fillStyle = rg(c, bx + r * .3, by - r * .4, 1, r, [[0, '#2e7050'], [.6, '#18452f'], [1, '#0a2418']]); c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); }
  for (i = 0; i < 8; i++) { c.fillStyle = ['#ff8ab8', '#ffe27a', '#fff'][i % 3]; c.beginPath(); c.arc(x + (rnd() - .5) * 90 * s, y - rnd() * 28 * s, 2.2 * s, 0, 7); c.fill(); }
}
function paintHouse(c) {
  var HX = L.HX, HW = L.HW, GY = L.GY, W = L.W, H = L.H, sk = L.sk, gh = L.gh, rb0 = L.roofBase, RY0 = L.RY0, ax = L.ax, slab = L.slab, rows = L.rows, cols = L.cols, x, i, r, k;
  rs(11);
  /* far hills and tree line */
  c.fillStyle = lg(c, 0, GY - 200, 0, GY, [[0, '#1a2050'], [1, '#0e1736']]); c.beginPath(); c.moveTo(0, GY); for (x = 0; x <= W; x += 30) c.lineTo(x, GY - 80 - Math.sin(x * .0045 + 1) * 42 - Math.sin(x * .013) * 14); c.lineTo(W, GY); c.fill();
  c.fillStyle = '#0a1330'; for (x = 0; x < W; x += 16) { var ty = GY - 74 - Math.sin(x * .0045 + 1) * 40 - Math.sin(x * .013) * 13, tr = 10 + rnd() * 16; c.beginPath(); c.arc(x, ty, tr, 0, 7); c.fill(); }
  c.fillStyle = lg(c, 0, GY - 70, 0, GY + 6, [[0, '#0f2a28'], [1, '#0a1f1c']]); c.beginPath(); c.moveTo(0, GY + 6); for (x = 0; x <= W; x += 24) c.lineTo(x, GY - 28 - Math.sin(x * .007 + 2) * 18); c.lineTo(W, GY + 6); c.fill();
  /* lawn */
  rect(c, 0, GY - 4, W, H - GY + 4, lg(c, 0, GY - 4, 0, H, [[0, '#123a28'], [.5, '#0d2a1f'], [1, '#07160f']]));
  for (i = 0; i < 1400; i++) { var gx = rnd() * W, gy2 = GY + rnd() * (H - GY); c.fillStyle = A(rnd() > .5 ? '#7fe0a8' : '#3a8a5a', .05 + rnd() * .1); c.fillRect(gx, gy2, 1.4, 4 + rnd() * 7 * (1 + (gy2 - GY) / 200)); }
  glow(c, ax, GY + 80, 800, '#6d7fd8', .06, 2.4);
  /* big trees behind the house */
  tree(c, HX - (L.portrait ? 80 : 120), GY + 4, 1.15); tree(c, HX + HW + (L.portrait ? 90 : 130), GY + 4, 1);
  /* soft shadow on the ground */
  c.fillStyle = rg(c, ax, GY + 20, 10, HW * .62, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); c.save(); c.translate(0, GY + 20); c.scale(1, .13); c.translate(0, -(GY + 20)); c.fillRect(HX - 200, GY - 400, HW + 400, 800); c.restore();
  /* chimney (sits behind the gable) */
  var slope = gh / (HW / 2), chx = ax + HW * (L.portrait ? .2 : .27), chw = 58, ytop = sk - 46, ybot = sk + (chx + chw - ax) * slope + 30;
  rect(c, chx, ytop, chw, ybot - ytop, '#5a2f3a');
  for (r = 0; r < (ybot - ytop) / 11; r++) for (k = -1; k < 4; k++) { c.fillStyle = mc('#7a3d48', '#3e1f2a', rnd()); c.fillRect(chx + k * 21 + (r & 1) * 10, ytop + r * 11 + 1, 19, 9); }
  rect(c, chx - 6, ytop - 10, chw + 12, 14, '#2c2340'); rect(c, chx - 6, ytop - 10, chw + 12, 3, 'rgba(255,255,255,.18)'); rect(c, chx, ytop, 8, ybot - ytop, 'rgba(0,0,0,.25)'); rect(c, chx + chw - 10, ytop, 10, ybot - ytop, 'rgba(0,0,0,.35)');
  /* inside of the cutaway: dark cross-section that the rooms sit in */
  rect(c, HX, RY0, HW, L.rb - RY0 + FS, '#1a1524');
  for (r = 0; r < rows; r++) {
    var fy = RY0 + r * (RH + FS) + RH;
    rect(c, HX, fy, HW, FS, lg(c, 0, fy, 0, fy + FS, [[0, '#8a6a4a'], [.18, '#4a372e'], [1, '#241a1c']]));
    for (x = HX + WT; x < HX + HW - WT; x += 30) rect(c, x, fy + 7, 12, FS - 12, 'rgba(0,0,0,.28)');
    rect(c, HX, fy, HW, 2, 'rgba(255,230,190,.35)'); rect(c, HX, fy + FS - 3, HW, 3, 'rgba(0,0,0,.6)');
    for (k = 1; k < cols; k++) { var px = HX + WT + (k - 1) * (RW + PT) + RW, py = RY0 + r * (RH + FS); rect(c, px, py, PT, RH, lg(c, px, 0, px + PT, 0, [[0, '#3a3248'], [.5, '#2a2336'], [1, '#1a1624']])); rect(c, px + 3, py, 2, RH, 'rgba(255,255,255,.1)'); rect(c, px + PT - 5, py, 2, RH, 'rgba(0,0,0,.4)'); }
  }
  rect(c, HX, rb0, HW, TOPB, lg(c, 0, rb0, 0, rb0 + TOPB, [[0, '#5a4440'], [1, '#2a1e20']])); for (x = HX + WT + 40; x < HX + HW - WT; x += 120) rect(c, x, rb0 + 8, 40, 5, 'rgba(0,0,0,.45)'); rect(c, HX, rb0, HW, 2, 'rgba(255,230,190,.3)');
  /* outer walls: horizontal siding */
  [HX, HX + HW - WT].forEach(function (wx, wi) {
    rect(c, wx, rb0, WT, slab - rb0, lg(c, wx, 0, wx + WT, 0, wi ? [[0, '#4a4066'], [1, '#34304e']] : [[0, '#6a5e8a'], [1, '#4a4066']]));
    for (var y = rb0; y < slab; y += 10) { rect(c, wx, y, WT, 1.2, 'rgba(0,0,0,.35)'); rect(c, wx, y + 1.2, WT, 1, 'rgba(255,255,255,.06)'); }
    rect(c, wx + (wi ? WT - 6 : 0), rb0, 6, slab - rb0, 'rgba(0,0,0,.28)'); rect(c, wx + (wi ? 0 : WT - 3), rb0, 3, slab - rb0, 'rgba(255,255,255,.12)');
    rect(c, wx + (wi ? 8 : WT - 14), rb0 + 20, 6, slab - rb0 - 24, '#2a2638');
  });
  /* gable: board and batten, with the sign and an attic window */
  var gp = [[HX, rb0], [ax, sk], [HX + HW, rb0]];
  c.save(); poly(c, gp); c.clip(); rect(c, HX, sk, HW, gh + 2, lg(c, HX, sk, HX + HW, rb0, [[0, '#6a5e8a'], [1, '#3e3860']]));
  for (x = HX; x < HX + HW; x += 15) { rect(c, x, sk, 1.4, gh, 'rgba(0,0,0,.32)'); rect(c, x + 1.4, sk, 1, gh, 'rgba(255,255,255,.07)'); }
  for (x = HX; x < HX + HW; x += 60) rect(c, x, sk, 5, gh, 'rgba(0,0,0,.18)');
  c.restore();
  var half = function (h) { return (HW / 2) * (1 - h / gh); }, sgW = Math.min(560, half(112) * 2 * .84), sgH = 62, sgY = rb0 - 22 - sgH;
  rr(c, ax - sgW / 2, sgY, sgW, sgH, 8); c.fillStyle = lg(c, 0, sgY, 0, sgY + sgH, [[0, '#2c2540'], [1, '#17121f']]); c.fill(); c.strokeStyle = '#b8a7ff'; c.lineWidth = 3; c.stroke();
  c.font = '800 100px "Plus Jakarta Sans",system-ui,sans-serif'; var tw = c.measureText('SPECOOLASI HQ').width, fs = 100 * (sgW * .86) / tw; c.font = '800 ' + fs + 'px "Plus Jakarta Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = '#8a6cff'; c.shadowBlur = 16; c.fillStyle = '#efe9ff'; c.fillText('SPECOOLASI HQ', ax, sgY + sgH / 2 + 2); c.shadowBlur = 0;
  c.strokeStyle = '#17121f'; c.lineWidth = 2; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(ax + s * sgW * .35, sgY); c.lineTo(ax + s * sgW * .35, sgY - 14); c.stroke(); });
  var wy = sk + gh * .36, wr = 27; c.fillStyle = '#d9d0ee'; c.beginPath(); c.arc(ax, wy, wr + 7, 0, 7); c.fill(); c.fillStyle = '#17121f'; c.beginPath(); c.arc(ax, wy, wr + 1, 0, 7); c.fill();
  c.fillStyle = rg(c, ax, wy, 2, wr, [[0, '#ffe2a0'], [1, '#d68a3a']]); c.beginPath(); c.arc(ax, wy, wr, 0, 7); c.fill(); c.strokeStyle = '#2a2236'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax - wr, wy); c.lineTo(ax + wr, wy); c.moveTo(ax, wy - wr); c.lineTo(ax, wy + wr); c.stroke();
  /* roof edges: shingles seen on the slanted rake */
  [-1, 1].forEach(function (sd) {
    var P0 = [ax + sd * (HW / 2 + OV), rb0 + OV * slope + 6], A0 = [ax, sk - 8], dx = A0[0] - P0[0], dy = A0[1] - P0[1], len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), th = 40;
    c.save(); c.translate(P0[0], P0[1]); c.rotate(ang); if (sd > 0) { c.scale(1, 1); }
    var ny = sd < 0 ? -1 : 1; /* the outer (upper) side of the slope */
    c.beginPath(); c.rect(0, sd < 0 ? -th : 0, len, th); c.clip();
    rect(c, 0, sd < 0 ? -th : 0, len, th, lg(c, 0, sd < 0 ? -th : 0, 0, sd < 0 ? 0 : th, sd < 0 ? [[0, '#3a3158'], [1, '#221b38']] : [[0, '#221b38'], [1, '#3a3158']]));
    for (var rr_ = 0; rr_ < th / 10; rr_++) { var yy = sd < 0 ? -rr_ * 10 : rr_ * 10; rect(c, 0, yy, len, 1.3, 'rgba(0,0,0,.4)'); for (var xx = (rr_ % 2) * 9; xx < len; xx += 18) rect(c, xx, yy, 1.2, 10 * (sd < 0 ? -1 : 1), 'rgba(0,0,0,.3)'); }
    rect(c, 0, sd < 0 ? -2 : 0, len, 2, 'rgba(255,255,255,.12)');
    c.restore();
    c.strokeStyle = '#b4abd0'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(P0[0], P0[1]); c.lineTo(A0[0], A0[1]); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.stroke();
  });
  rect(c, ax - 7, sk - 22, 14, 22, '#241d3a'); rect(c, ax - 7, sk - 22, 14, 3, 'rgba(255,255,255,.2)');
  /* stone foundation */
  rect(c, HX - 14, slab, HW + 28, FOUND + 2, '#35314c');
  for (r = 0; r < 2; r++) { var bx = HX - 14 + (r % 2) * 22; while (bx < HX + HW + 14) { var bw = 38 + rnd() * 28; c.fillStyle = mc('#4c4868', '#2a2742', rnd()); rr(c, bx + 1, slab + r * 22 + 2, bw - 2, 20, 4); c.fill(); bx += bw; } }
  rect(c, HX - 18, slab - 6, HW + 36, 9, '#6e6890'); rect(c, HX - 18, slab - 6, HW + 36, 2, 'rgba(255,255,255,.3)'); rect(c, 0, GY - 2, W, 4, 'rgba(0,0,0,.35)');
  /* path with stepping stones */
  c.fillStyle = lg(c, 0, GY, 0, H, [[0, 'rgba(120,120,170,.22)'], [1, 'rgba(120,120,170,.08)']]); poly(c, [[ax - 70, GY], [ax + 70, GY], [ax + 230, H], [ax - 230, H]], c.fillStyle); c.fill();
  for (i = 0; i < 6; i++) { var py2 = GY + 20 + i * ((H - GY - 30) / 6) * 1, sc = .6 + i * .2; c.fillStyle = A('#8c8ab4', .35); c.beginPath(); c.ellipse(ax + (i % 2 ? 22 : -22) * sc, py2, 38 * sc, 11 * sc, 0, 0, 7); c.fill(); c.fillStyle = A('#ffffff', .08); c.beginPath(); c.ellipse(ax + (i % 2 ? 22 : -22) * sc, py2 - 2 * sc, 34 * sc, 7 * sc, 0, 0, 7); c.fill(); }
  /* light spilling out of the ground floor rooms onto the lawn */
  rooms.forEach(function (R) { if (R.r === rows - 1) glow(c, R.x + R.w / 2, GY + 36, 250, ACC[R.i].tint, .16, 1.7); });
  /* wall lanterns */
  [HX + 20, HX + HW - 20].forEach(function (lx) { rect(c, lx - 8, rb0 + 60, 16, 22, '#15111f'); rect(c, lx - 5, rb0 + 64, 10, 14, '#ffd68a'); glow(c, lx, rb0 + 71, 70, '#ffb866', .6); });
}
function paintFront(c) {
  var HX = L.HX, HW = L.HW, GY = L.GY, ax = L.ax, W = L.W, x, i;
  rs(23);
  /* every room gets a frame: shadowed side walls, ceiling and floor edge give it depth */
  rooms.forEach(function (R) {
    var x0 = R.x, y0 = R.y, w = R.w, h = R.h, d = 15, e = 9;
    c.fillStyle = lg(c, x0, 0, x0 + d, 0, [[0, 'rgba(6,4,14,.9)'], [1, 'rgba(6,4,14,.45)']]); poly(c, [[x0, y0], [x0 + d, y0 + e], [x0 + d, y0 + h - e], [x0, y0 + h]], c.fillStyle); c.fill();
    c.fillStyle = lg(c, x0 + w, 0, x0 + w - d, 0, [[0, 'rgba(6,4,14,.9)'], [1, 'rgba(6,4,14,.45)']]); poly(c, [[x0 + w, y0], [x0 + w - d, y0 + e], [x0 + w - d, y0 + h - e], [x0 + w, y0 + h]], c.fillStyle); c.fill();
    c.fillStyle = lg(c, 0, y0, 0, y0 + e, [[0, 'rgba(6,4,14,.95)'], [1, 'rgba(6,4,14,.5)']]); poly(c, [[x0, y0], [x0 + w, y0], [x0 + w - d, y0 + e], [x0 + d, y0 + e]], c.fillStyle); c.fill();
    c.fillStyle = lg(c, 0, y0 + h, 0, y0 + h - e, [[0, 'rgba(20,12,10,.85)'], [1, 'rgba(20,12,10,.25)']]); poly(c, [[x0, y0 + h], [x0 + w, y0 + h], [x0 + w - d, y0 + h - e], [x0 + d, y0 + h - e]], c.fillStyle); c.fill();
    c.fillStyle = lg(c, 0, y0 + e, 0, y0 + e + 40, [[0, 'rgba(0,0,0,.38)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(x0 + d, y0 + e, w - 2 * d, 40);
    c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 1; c.strokeRect(x0 + d, y0 + e, w - 2 * d, h - 2 * e); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.strokeRect(x0, y0, w, h);
  });
  /* hedge along the foundation and flower beds */
  for (x = HX - 60; x < HX + HW + 60; x += 70) { if (Math.abs(x - ax) < 110) continue; bush(c, x + rnd() * 20, GY + 16, .9 + rnd() * .3); }
  /* picket fence in front, with a gap at the path */
  var fy = GY + 40, fh = 64;
  for (var side = -1; side <= 1; side += 2) {
    var from = side < 0 ? HX - 150 : ax + 62, to = side < 0 ? ax - 62 : HX + HW + 150;
    c.fillStyle = '#8a84a8'; c.fillRect(from, fy + 14, to - from, 5); c.fillRect(from, fy + 40, to - from, 5);
    for (x = from; x < to - 10; x += 22) { c.fillStyle = lg(c, x, 0, x + 14, 0, [[0, '#d2cbe8'], [1, '#8a84a8']]); poly(c, [[x, fy + fh], [x, fy + 8], [x + 7, fy - 2], [x + 14, fy + 8], [x + 14, fy + fh]], c.fillStyle); c.fill(); rect(c, x + 11, fy + 8, 3, fh - 8, 'rgba(0,0,0,.22)'); }
  }
  /* lamp post and mailbox */
  var lx = HX - (L.portrait ? 70 : 100), ly = GY + 60;
  rect(c, lx - 3, ly - 150, 6, 150, '#15111f'); rect(c, lx - 12, ly - 178, 24, 28, '#15111f'); rect(c, lx - 8, ly - 174, 16, 20, '#ffe2a0'); glow(c, lx, ly - 164, 150, '#ffc878', .75); glow(c, lx, ly, 120, '#ffc878', .16, 2.2);
  var mx = HX + HW + (L.portrait ? 70 : 100);
  rect(c, mx - 3, ly - 66, 6, 66, '#15111f'); rr(c, mx - 22, ly - 92, 44, 30, 12); c.fillStyle = '#6c4dff'; c.fill(); rect(c, mx + 14, ly - 100, 4, 20, '#ffb866');
  c.font = '800 12px "Plus Jakarta Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('HQ', mx - 3, ly - 73);
  bush(c, lx + 36, ly + 30, 1); bush(c, mx - 40, ly + 30, 1);
}

/* ---------- caches, sizes and camera ---------- */
var stars = [], clouds = [], flies = [];
function build() {
  var w = stage.clientWidth; if (!w) return; var strip = w <= 800; stage.classList.toggle('strip', strip); var h = stage.clientHeight; if (!h) return;
  LITE = w <= 800 || (window.matchMedia && matchMedia('(pointer:coarse)').matches); lastW = w; lastH = h;
  dpr = Math.min(window.devicePixelRatio || 1, LITE ? 1.5 : 2); sw = w; sh_ = h;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  var portrait = !strip && w / h < .95; L = layout(portrait, strip);
  var fr = { x: L.HX - 110, y: L.sk - 70, w: L.HW + 220 }; fr.h = L.GY + 120 - fr.y;
  if (strip) { fit = Math.min(w / (RW * 1.1), h / fr.h); L.home = { x: rooms[0].x + RW / 2, y: fr.y + fr.h / 2, z: fit }; }
  else { fit = Math.min(w / fr.w, h / fr.h); L.home = { x: fr.x + fr.w / 2, y: fr.y + fr.h / 2, z: fit }; }
  Q = clamp(fit * dpr * 1.9, .7, LITE ? 1 : 1.6);
  function layer(fn) { var c2 = document.createElement('canvas'); c2.width = Math.ceil(L.W * Q); c2.height = Math.ceil(L.H * Q); var x = c2.getContext('2d'); x.setTransform(Q, 0, 0, Q, 0, 0); fn(x); return c2; }
  HOUSE = layer(paintHouse); FRONT = layer(paintFront);
  rs(5); stars = []; for (var i = 0; i < 130; i++) stars.push([rnd() * L.W, rnd() * (L.GY - 140), .5 + rnd() * 1.3, rnd() * 6]);
  clouds = []; for (i = 0; i < 6; i++) clouds.push({ x: rnd() * L.W, y: 30 + rnd() * (L.GY * .45), s: .7 + rnd() * .9, v: 5 + rnd() * 9 });
  flies = []; for (i = 0; i < 16; i++) flies.push([rnd() * L.W, L.GY + 20 + rnd() * (L.H - L.GY - 30), rnd() * 6, .5 + rnd()]);
  if (sel < 0) cam = homeCam(); else focusCam(sel, true);
  stage.classList.toggle('portrait', portrait); setHint(strip); setCur(cur); needDraw = true;
}
function homeCam() { return L.strip ? { x: rooms[cur].x + rooms[cur].w / 2, y: L.home.y, z: fit } : { x: L.home.x, y: L.home.y, z: fit }; }
function setCur(i) { cur = clamp(i, 0, ACC.length - 1); dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); }); }
function setHint(strip) { if (hintEl) hintEl.innerHTML = strip ? 'Swipe sideways to walk through the rooms &middot; tap a room to step inside' : HINT0; }
function nearest() { var best = 0, bd = 1e9; rooms.forEach(function (R, i) { var d = Math.abs(R.x + R.w / 2 - cam.x); if (d < bd) { bd = d; best = i; } }); return best; }
function snapTo(i) { setCur(i); go({ x: rooms[cur].x + rooms[cur].w / 2, y: L.home.y, z: fit }, 380); }
function stepRoom(d) { var n = clamp(cur + d, 0, ACC.length - 1); if (sel >= 0) openRoom(n); else snapTo(n); }
function focusCam(i, now) {
  var R = rooms[i], mobile = sw <= 800, cardW = mobile ? 0 : Math.min(370, sw * .38) + 32;
  var rw = mobile ? sw : sw - cardW, rh = mobile ? sh_ * .5 : sh_, z = Math.max(fit, Math.min(rw * .94 / R.w, rh * .92 / R.h));
  var px = rw / 2, py = rh / 2, t = { x: R.x + R.w / 2 - (px - sw / 2) / z, y: R.y + R.h / 2 - (py - sh_ / 2) / z, z: z };
  if (now) cam = t; return t;
}
function go(t, ms) {
  needDraw = true; if (calm) { cam = { x: t.x, y: t.y, z: t.z }; anim = null; return; }
  anim = { t0: performance.now(), ms: ms || 900, a: { x: cam.x, y: cam.y, z: cam.z }, b: t };
}
function stepAnim(now) {
  if (!anim) return; var k = clamp((now - anim.t0) / anim.ms, 0, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  cam.x = anim.a.x + (anim.b.x - anim.a.x) * e; cam.y = anim.a.y + (anim.b.y - anim.a.y) * e; cam.z = Math.exp(Math.log(anim.a.z) + (Math.log(anim.b.z) - Math.log(anim.a.z)) * e); if (k >= 1) anim = null;
}
function clampCam() {
  var vw = sw / cam.z, vh = sh_ / cam.z; cam.z = clamp(cam.z, fit * .98, fit * 7);
  vw = sw / cam.z; vh = sh_ / cam.z;
  cam.x = vw >= L.W ? L.W / 2 : clamp(cam.x, -vw * .2, L.W + vw * .2 - 0); cam.y = vh >= L.H ? L.H / 2 : clamp(cam.y, -vh * .2, L.H + vh * .2);
  if (L.strip && sel < 0 && cam.z <= fit * 1.06) cam.x = clamp(cam.x, rooms[0].x + rooms[0].w / 2, rooms[rooms.length - 1].x + rooms[rooms.length - 1].w / 2);
  if (sel < 0 && cam.z <= fit * 1.02 && !anim) { if (!L.strip) cam.x = L.home.x; cam.y = L.home.y; }
  stage.style.touchAction = (LITE ? (sel < 0 && cam.z > fit * 1.06) : (sel >= 0 || cam.z > fit * 1.06)) ? 'none' : 'pan-y';
}

/* ---------- room backgrounds are cached at a few sharpness levels ---------- */
var LV = [.28, .6, 1, 1.6], bgc = ACC.map(function () { return {}; }), madeThisFrame = 0;
function bgFor(i, need, force) {
  var k = 0; while (k < LV.length - (LITE ? 2 : 1) && LV[k] < need * .85) k++;
  var m = bgc[i];
  if (!m[k]) {
    if (!force && madeThisFrame >= 1 && m[0]) { for (var j = k; j >= 0; j--) if (m[j]) return m[j]; for (j = k + 1; j < LV.length; j++) if (m[j]) return m[j]; }
    var c2 = document.createElement('canvas'); c2.width = Math.ceil(1600 * LV[k]); c2.height = Math.ceil(900 * LV[k]); var x = c2.getContext('2d'); x.setTransform(LV[k], 0, 0, LV[k], 0, 0); rs(7); scenes[i].bg(x); m[k] = c2; madeThisFrame++;
    if (k >= 2) for (var o = 0; o < bgc.length; o++) if (o !== i && rooms[o] && !rooms[o].vis && bgc[o][k]) delete bgc[o][k];
  }
  return m[k];
}
var BL = [.12, .18, .26, .34], frameN = 0, ctxDirty = false;
function paintRoom(c, i, t, need) {
  var S = scenes[i]; c.drawImage(bgFor(i, need), 0, 0, 1600, 900);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  var tt = t + i * 2.3;
  try { if (S.live) S.live(c, tt); if (S.front) S.front(c, tt); }
  catch (err) { ctxDirty = true; if (window.console) console.error('HQ room ' + i + ' failed to draw', err); }
  if (S.grade) { c.fillStyle = S.grade; c.fillRect(0, 0, 1600, 900); }
}
function drawRoom(i, t) {
  var R = rooms[i], s = R.w / 1600, c = ctx, need = cam.z * s * dpr;
  c.save(); c.translate(R.x, R.y); c.scale(s, s); c.beginPath(); c.rect(0, 0, 1600, 900); c.clip();
  if (i !== sel && need <= BL[BL.length - 1]) {
    /* small rooms: draw into a little buffer, refreshed at half rate, so eight live rooms stay light */
    var k = 0; while (BL[k] < need * .9 && k < BL.length - 1) k++;
    if (!R.buf || R.bk !== k) { R.buf = document.createElement('canvas'); R.buf.width = Math.ceil(1600 * BL[k]); R.buf.height = Math.ceil(900 * BL[k]); R.bk = k; R.fresh = true; }
    if (R.fresh || ((frameN + i) & 1) === 0 || calm) {
      var b = R.buf.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, R.buf.width, R.buf.height); b.setTransform(BL[k], 0, 0, BL[k], 0, 0); paintRoom(b, i, t, BL[k]); R.fresh = false;
    }
    c.drawImage(R.buf, 0, 0, 1600, 900);
  } else { R.buf = null; paintRoom(c, i, t, need); }
  c.restore();
}

/* ---------- drawing the whole picture ---------- */
function sky(t) {
  var c = ctx, g = lg(c, 0, 0, 0, L.GY, [[0, '#04061a'], [.45, '#101648'], [.8, '#2c2468'], [1, '#6a3b78']]);
  c.fillStyle = g; c.fillRect(-4000, -4000, L.W + 8000, L.GY + 4000);
  c.fillStyle = lg(c, 0, L.GY - 4, 0, L.H, [[0, '#123a28'], [.5, '#0d2a1f'], [1, '#07160f']]); c.fillRect(-4000, L.GY - 4, L.W + 8000, L.H - L.GY + 4400);
  var mx = L.strip ? L.HX + 430 : L.W - (L.portrait ? 150 : 190), my = L.portrait ? 120 : 110;
  glow(c, mx, my, 260, '#9fb4ff', .38); c.fillStyle = '#f4f1ff'; c.beginPath(); c.arc(mx, my, 34, 0, 7); c.fill(); c.fillStyle = '#d6d2ee'; [[-10, -6, 8], [8, 10, 6], [12, -12, 5]].forEach(function (k) { c.beginPath(); c.arc(mx + k[0], my + k[1], k[2], 0, 7); c.fill(); });
  c.fillStyle = '#fff'; for (var i = 0; i < stars.length; i++) { var s = stars[i]; c.globalAlpha = (.35 + .65 * Math.abs(Math.sin(t * .9 + s[3]))) * (s[1] < L.GY - 220 ? 1 : .5); c.fillRect(s[0], s[1], s[2], s[2]); } c.globalAlpha = 1;
  clouds.forEach(function (k) {
    var x = ((k.x + t * k.v) % (L.W + 700)) - 350; c.save(); c.translate(x, k.y); c.scale(k.s, k.s);
    for (var j = 0; j < 5; j++) { c.fillStyle = rg(c, (j - 2) * 60, -j % 2 * 12, 4, 80, [[0, 'rgba(150,140,220,.2)'], [1, 'rgba(150,140,220,0)']]); c.beginPath(); c.ellipse((j - 2) * 60, -j % 2 * 12, 90, 34, 0, 0, 7); c.fill(); }
    c.restore();
  });
}
function liveExtras(t) {
  var c = ctx, HX = L.HX, HW = L.HW, ax = L.ax, sk = L.sk, gh = L.gh;
  var chx = ax + HW * (L.portrait ? .2 : .27); for (var i = 0; i < 7; i++) { var u = ((t * .13 + i / 7) % 1); c.fillStyle = 'rgba(190,185,220,' + (.22 * (1 - u)) + ')'; c.beginPath(); c.arc(chx + 29 + Math.sin(t * .7 + i) * 10 * u + u * 24, sk - 62 - u * 150, 12 + u * 30, 0, 7); c.fill(); }
  glow(c, ax, sk + gh * .36, 90, '#ffb866', .45 + .15 * Math.sin(t * 2.1));
  [HX + 20, HX + HW - 20].forEach(function (lx, k) { glow(c, lx, L.roofBase + 71, 90, '#ffb866', .45 + .1 * Math.sin(t * 3 + k)); });
}
function overlay(t) {
  var c = ctx;
  flies.forEach(function (f) { var x = f[0] + Math.sin(t * .4 * f[3] + f[2]) * 40, y = f[1] + Math.cos(t * .5 * f[3] + f[2] * 2) * 22, a = Math.max(0, Math.sin(t * 1.3 + f[2] * 3)); if (a > .05) glow(c, x, y, 14, '#d6ff7a', .9 * a); });
  var h = hover >= 0 && sel < 0 ? rooms[hover] : null;
  if (h) { c.save(); c.strokeStyle = 'rgba(184,167,255,.95)'; c.lineWidth = 3 / cam.z * 1.6; c.shadowColor = '#b8a7ff'; c.shadowBlur = 24; c.strokeRect(h.x - 2, h.y - 2, h.w + 4, h.h + 4); c.restore(); }
}
function frame(t) {
  t = Math.max(0, +t || 0); /* the very first frame can arrive a hair before t0: a negative time broke the scene colour lookups */
  var c = ctx; madeThisFrame = 0; frameN++;
  if (ctxDirty) { ctxDirty = false; cv.width = cv.width; for (var q = 0; q < rooms.length; q++) rooms[q].buf = null; } /* an earlier frame failed halfway: wipe the leftover clip/blend state */
  if (L.strip && sel < 0 && !anim && !pinch) { var nr = nearest(); if (nr !== cur) setCur(nr); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = '#04061a'; c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (sw / 2 - cam.x * cam.z), dpr * (sh_ / 2 - cam.y * cam.z));
  var vx0 = cam.x - sw / 2 / cam.z, vx1 = cam.x + sw / 2 / cam.z, vy0 = cam.y - sh_ / 2 / cam.z, vy1 = cam.y + sh_ / 2 / cam.z;
  sky(t); c.drawImage(HOUSE, 0, 0, L.W, L.H); liveExtras(t);
  rooms.forEach(function (R, i) { R.vis = R.x < vx1 && R.x + R.w > vx0 && R.y < vy1 && R.y + R.h > vy0; });
  rooms.forEach(function (R, i) { if (R.vis) drawRoom(i, t); });
  c.drawImage(FRONT, 0, 0, L.W, L.H); overlay(t);
  /* name tags follow the rooms */
  var compact = rooms[0].w * cam.z < 170; stage.classList.toggle('compact', compact);
  labs.forEach(function (el, i) { var R = rooms[i], x = (R.x + R.w / 2 - cam.x) * cam.z + sw / 2, y = (R.y + R.h + FS / 2 - cam.y) * cam.z + sh_ / 2; if (compact && i !== sel) { x = (R.x + R.w - 14 - cam.x) * cam.z + sw / 2; y = (R.y + R.h - 12 - cam.y) * cam.z + sh_ / 2; } el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%)'; el.style.visibility = R.vis ? '' : 'hidden'; });
}

/* ---------- opening a room ---------- */
function openRoom(i) {
  var a = ACC[i]; sel = i; setCur(i); sync(a); stage.classList.add('focus'); labs.forEach(function (l, k) { l.classList.toggle('sel', k === i); });
  var t = focusCam(i, false); bgFor(i, t.z * rooms[i].w / 1600 * dpr, true); go(t);
  var list = a.posts.length ? a.posts : [{}, {}, {}];
  var tile = function (p) {
    return p.video ? '<div class="hq-post"><video src="' + p.video + '"' + (p.poster ? ' poster="' + p.poster + '"' : '') + ' muted loop autoplay playsinline></video></div>'
      : p.img ? '<a class="hq-post" href="' + (p.link || p.img) + '" target="_blank" rel="noopener" style="background-image:url(\'' + p.img + '\')"></a>'
      : p.embed ? '<a class="hq-post" href="' + p.embed + '" target="_blank" rel="noopener">&#9654; VIEW POST</a>' : '<div class="hq-post">Coming soon</div>';
  };
  info.innerHTML = '<button class="hq-back" id="hq-bk">← Back to HQ</button><div class="hq-head"><span class="hq-emo">' + a.e + '</span><h2>' + a.n + '</h2></div><p class="hq-vibe">' + a.vibe + '</p>' +
    '<div class="hq-chips">' + a.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div><p class="hq-desc">' + a.d + '</p>' +
    '<div class="hq-acts">' + (a.link ? '<a class="hq-go" href="' + a.link + '" target="_blank" rel="noopener">Visit ' + a.n + ' ↗</a>' : '') + (a.page ? '<a class="hq-go" href="' + a.page + '">Open page →</a>' : '') + '</div>' +
    '<div class="hq-posts">' + list.map(tile).join('') + '</div>';
  info.scrollTop = 0; info.classList.add('on'); $('hq-bk').onclick = closeRoom; clampCam();
}
function closeRoom() {
  sel = -1; stage.classList.remove('focus'); info.classList.remove('on'); labs.forEach(function (l) { l.classList.remove('sel'); });
  go(homeCam(), 800); stage.style.touchAction = 'pan-y';
}

/* ---------- mouse, touch and keys ---------- */
var ptrs = {}, drag = null, pinch = null;
function nPtr() { return Object.keys(ptrs).length; }
function toWorld(sx, sy) { return { x: (sx - sw / 2) / cam.z + cam.x, y: (sy - sh_ / 2) / cam.z + cam.y }; }
function pickAt(e) {
  var b = cv.getBoundingClientRect(), p = toWorld(e.clientX - b.left, e.clientY - b.top);
  for (var i = 0; i < rooms.length; i++) { var R = rooms[i]; if (p.x >= R.x && p.x <= R.x + R.w && p.y >= R.y && p.y <= R.y + R.h) return i; } return -1;
}
function zoomAt(f, sx, sy) {
  var p = toWorld(sx, sy); cam.z = clamp(cam.z * f, fit * .98, fit * 7); cam.x = p.x - (sx - sw / 2) / cam.z; cam.y = p.y - (sy - sh_ / 2) / cam.z; clampCam(); needDraw = true;
}
stage.addEventListener('pointerdown', function (e) {
  if (e.target.closest('button,.hq-info,a')) return;
  ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; try { stage.setPointerCapture(e.pointerId); } catch (_) {}
  if (nPtr() === 1) drag = { moved: 0, tx: 0, i0: L.strip ? nearest() : 0 }; else if (nPtr() === 2) { var k = Object.keys(ptrs).map(function (q) { return ptrs[q]; }); pinch = { d: Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y), z: cam.z }; if (drag) drag.moved = 99; }
  anim = null; stage.classList.add('drag');
});
stage.addEventListener('pointermove', function (e) {
  var p = ptrs[e.pointerId];
  if (!p) { if (e.pointerType === 'mouse') { var h = pickAt(e); if (h !== hover) { hover = h; stage.classList.toggle('hot', h >= 0); needDraw = true; } } return; }
  var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (nPtr() === 2 && pinch) {
    var k = Object.keys(ptrs).map(function (q) { return ptrs[q]; }), d = Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y), b = cv.getBoundingClientRect();
    zoomAt(pinch.z * d / pinch.d / cam.z, (k[0].x + k[1].x) / 2 - b.left, (k[0].y + k[1].y) / 2 - b.top); return;
  }
  if (drag) {
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.tx += dx;
    if (drag.moved > 8) {
      var zoomed = cam.z > fit * 1.06;
      if (L.strip) { if (sel < 0) { cam.x -= dx / cam.z; if (zoomed) cam.y -= dy / cam.z; clampCam(); needDraw = true; } } /* phones: sideways only, a swipe changes room */
      else if (sel >= 0 || zoomed) { cam.x -= dx / cam.z; cam.y -= dy / cam.z; clampCam(); needDraw = true; }
    }
  }
});
function endPtr(e, cancel) {
  var p = ptrs[e.pointerId]; if (!p) return; delete ptrs[e.pointerId];
  if (!cancel && drag && nPtr() === 0 && drag.moved < 9) { var i = pickAt(e); if (i >= 0 && i !== sel) openRoom(i); }
  else if (!cancel && drag && nPtr() === 0 && L.strip && drag.moved < 99) {
    var tx = drag.tx || 0;
    if (sel >= 0) { if (Math.abs(tx) > 60) openRoom(clamp(sel + (tx < 0 ? 1 : -1), 0, ACC.length - 1)); }
    else if (cam.z <= fit * 1.06) snapTo(clamp(tx < -40 ? drag.i0 + 1 : tx > 40 ? drag.i0 - 1 : nearest(), 0, ACC.length - 1));
  }
  if (nPtr() < 2) pinch = null; if (nPtr() === 0) { drag = null; stage.classList.remove('drag'); }
}
stage.addEventListener('pointerup', function (e) { endPtr(e, false); });
stage.addEventListener('pointercancel', function (e) { endPtr(e, true); });
stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && hover >= 0) { hover = -1; stage.classList.remove('hot'); needDraw = true; } });
stage.addEventListener('wheel', function (e) { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); var b = cv.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * .003), e.clientX - b.left, e.clientY - b.top); }, { passive: false });
$('hq-zi').onclick = function () { zoomAt(1.3, sw / 2, sh_ / 2); }; $('hq-zo').onclick = function () { zoomAt(1 / 1.3, sw / 2, sh_ / 2); }; $('hq-hm').onclick = closeRoom;
addEventListener('keydown', function (e) { if (e.key === 'Escape' && sel >= 0) closeRoom(); });

/* ---------- loop ---------- */
var vis = true, last = 0, t0 = performance.now(), cost = 16, minDt = 1000 / 30;
if (window.IntersectionObserver) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(stage);
function loop(now) {
  requestAnimationFrame(loop); if (!vis || document.hidden || !L) return;
  if (calm && !needDraw && !anim) return;
  if (now - last < (LITE && now - lastScroll < 160 ? 1000 / 12 : minDt)) return; last = now;
  stepAnim(now); if (anim) clampCam();
  var s0 = performance.now(); frame(calm ? 2.2 : (now - t0) / 1000); needDraw = false;
  cost = cost * .9 + (performance.now() - s0) * .1; minDt = cost > 45 ? 1000 / 12 : cost > 26 ? 1000 / 20 : LITE ? 1000 / 24 : 1000 / 30;
}
var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () {
  var w = stage.clientWidth, h = stage.clientHeight;
  if (lastW && Math.abs(w - lastW) < 8 && (LITE || Math.abs(h - lastH) < 8)) return; /* only the bar moved, nothing to redraw */
  var was = sel; build(); if (was >= 0) openRoom(was); }, 150); });
addEventListener('scroll', function () { lastScroll = performance.now(); }, { passive: true });
build(); requestAnimationFrame(loop);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { build(); });
window.__hq = { pt: function (i) { var R = rooms[i]; return { x: (R.x + R.w / 2 - cam.x) * cam.z + sw / 2, y: (R.y + R.h / 2 - cam.y) * cam.z + sh_ / 2 }; }, open: openRoom, close: closeRoom, frame: function (t) { frame(t); }, get layout() { return L; } };
})();
