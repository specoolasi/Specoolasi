/* Specoolasi scenes: a full-screen cinematic scene behind each account page.
   Plain Canvas 2D, no libraries. Each scene lives in js/scenes/a.js or b.js and is registered with SCENES.reg(id, fn).
   Everything is drawn in a 1600x900 "design space" that is scaled to cover the screen. */
(function () {
'use strict';
var DW = 1600, DH = 900;
var REG = {};
window.SCENES = { reg: function (id, fn) { REG[id] = fn; }, start: start };

/* ---------- small helpers ---------- */
var seed = 1;
function rs(n) { seed = n || 1; }
function rnd() { return (seed = seed * 16807 % 2147483647) / 2147483647; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function ss(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function hex(h) { if (h[0] === 'r') return h.match(/[\d.]+/g).slice(0, 3).map(Number); h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function A(h, a) { var c = hex(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')'; }
function sh(h, f) { var c = hex(h); return 'rgb(' + clamp(c[0] * f | 0, 0, 255) + ',' + clamp(c[1] * f | 0, 0, 255) + ',' + clamp(c[2] * f | 0, 0, 255) + ')'; }
function mc(a, b, t) { var p = hex(a), q = hex(b); return '#' + p.map(function (v, i) { return ((v + (q[i] - v) * t) | 0).toString(16).padStart(2, '0'); }).join(''); }
function lg(c, x0, y0, x1, y1, st) { var g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
function rg(c, x, y, r0, r1, st) { var g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
function rect(c, x, y, w, h, f) { c.fillStyle = f; c.fillRect(x, y, w, h); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function poly(c, pts, f) { c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } }
/* soft additive light blob */
function glow(c, x, y, r, col, a, sx) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(sx || 1, 1);
  c.fillStyle = rg(c, 0, 0, 0, r, [[0, A(col, a)], [.35, A(col, a * .35)], [1, A(col, 0)]]); c.fillRect(-r, -r, r * 2, r * 2); c.restore();
}
/* light cone from (x0,y0) of width w0 to (x1,y1) of width w1, fading out along its length */
function beam(c, x0, y0, w0, x1, y1, w1, col, a) {
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = lg(c, x0, y0, x1, y1, [[0, A(col, a)], [1, A(col, 0)]]);
  c.beginPath(); c.moveTo(x0 - w0 / 2, y0); c.lineTo(x0 + w0 / 2, y0); c.lineTo(x1 + w1 / 2, y1); c.lineTo(x1 - w1 / 2, y1); c.closePath(); c.fill(); c.restore();
}
function glowText(c, txt, x, y, font, col, blur, a) {
  c.save(); c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = a == null ? 1 : a;
  c.shadowColor = col; c.shadowBlur = blur; c.fillStyle = col; c.fillText(txt, x, y); c.shadowBlur = blur / 2; c.fillStyle = '#fff'; c.globalAlpha *= .75; c.fillText(txt, x, y); c.restore();
}
/* glossy floor: mirror the strip above line y into the strip below it, fading out */
function reflect(c, y, h, a) {
  var s = c.getTransform().a, tmp = document.createElement('canvas'); tmp.width = Math.ceil(DW * s); tmp.height = Math.ceil(h * s);
  var t = tmp.getContext('2d');
  t.save(); t.translate(0, tmp.height); t.scale(1, -1); t.drawImage(c.canvas, 0, (y - h) * s, DW * s, h * s, 0, 0, DW * s, h * s); t.restore();
  t.globalCompositeOperation = 'destination-in'; t.fillStyle = lg(t, 0, 0, 0, tmp.height, [[0, 'rgba(0,0,0,' + a + ')'], [1, 'rgba(0,0,0,0)']]); t.fillRect(0, 0, tmp.width, tmp.height);
  c.drawImage(tmp, 0, y, DW, h);
}
/* wooden floor in perspective: planks run toward the vanishing point (vx,vy) */
function floorWood(c, y0, vx, vy, base, n, gap) {
  c.fillStyle = lg(c, 0, y0, 0, DH, [[0, sh(base, .55)], [.5, sh(base, .9)], [1, sh(base, 1.05)]]); c.fillRect(0, y0, DW, DH - y0);
  for (var i = -n; i <= n; i++) {
    var bx = vx + i * gap, tx = vx + (bx - vx) * (y0 - vy) / (DH - vy);
    c.strokeStyle = 'rgba(0,0,0,' + (.18 + (i & 1) * .08) + ')'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(tx, y0); c.lineTo(bx, DH); c.stroke();
    if (i % 2 === 0) { c.fillStyle = 'rgba(255,255,255,' + (.015 + rnd() * .03) + ')'; poly(c, [[tx, y0], [vx + (bx + gap - vx) * (y0 - vy) / (DH - vy), y0], [bx + gap, DH], [bx, DH]], c.fillStyle); }
  }
  for (var k = 0; k < 6; k++) { var yy = y0 + Math.pow(k / 6, 1.7) * (DH - y0); c.strokeStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.moveTo(0, yy + rnd() * 20); c.lineTo(DW, yy + rnd() * 20); c.stroke(); }
}
function dots(c, n, x, y, w, h, cols, r0, r1, a) { /* scatter of soft discs (bokeh, lit windows, crowd lights) */
  for (var i = 0; i < n; i++) { var r = lerp(r0, r1, rnd()), col = cols[(rnd() * cols.length) | 0]; c.fillStyle = A(col, a * (.4 + rnd() * .6)); c.beginPath(); c.arc(x + rnd() * w, y + rnd() * h, r, 0, 7); c.fill(); }
}

/* ---------- people: a small articulated figure with soft lighting ---------- */
var SKIN = { a: '#f6d9c2', b: '#e8bb94', c: '#c98f67', d: '#94603f', e: '#6e4531' };
var SCR = document.createElement('canvas'), sx = SCR.getContext('2d');
function limb(c, x1, y1, x2, y2, w1, w2, col) {
  var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, mw = (w1 + w2) / 2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  c.fillStyle = lg(c, mx - nx * mw / 2, my - ny * mw / 2, mx + nx * mw / 2, my + ny * mw / 2, [[0, sh(col, .9)], [.4, sh(col, 1.04)], [1, sh(col, .62)]]);
  c.beginPath(); c.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2); c.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.closePath(); c.fill();
  c.beginPath(); c.arc(x1, y1, w1 / 2, 0, 7); c.fill(); c.beginPath(); c.arc(x2, y2, w2 / 2, 0, 7); c.fill();
}
var dir = function (a) { return [Math.sin(a), Math.cos(a)]; };
function hairBack(c, o, H, rx, ry, sway) {
  if (o.hair !== 'long' || o.view === 'b') return;
  c.fillStyle = sh(o.hc, .8); c.beginPath(); c.moveTo(-rx * 1.12, -ry * .3);
  c.bezierCurveTo(-rx * 1.5, ry * 1.4, -rx * 1.3 + sway, ry * 3.1, -rx * .6 + sway, ry * 3.2);
  c.lineTo(rx * .6 + sway, ry * 3.2); c.bezierCurveTo(rx * 1.3 + sway, ry * 3.1, rx * 1.5, ry * 1.4, rx * 1.12, -ry * .3); c.closePath(); c.fill();
}
function hairFront(c, o, H, rx, ry, sway) {
  var v = o.view, st = o.hair, col = o.hc; if (st === 'none') return;
  c.fillStyle = lg(c, -rx, -ry, rx, ry, [[0, sh(col, 1.25)], [1, sh(col, .75)]]);
  if (v === 'b') {
    c.beginPath(); c.ellipse(0, -ry * .06, rx * 1.1, ry * 1.08, 0, 0, 7); c.fill();
    if (st === 'long') { c.fillStyle = sh(col, .9); c.beginPath(); c.moveTo(-rx * 1.08, 0); c.bezierCurveTo(-rx * 1.5, ry * 1.6, -rx * 1.1 + sway, ry * 3, -rx * .4 + sway, ry * 3.3); c.lineTo(rx * .5 + sway, ry * 3.35); c.bezierCurveTo(rx * 1.2 + sway, ry * 3, rx * 1.5, ry * 1.6, rx * 1.08, 0); c.closePath(); c.fill(); }
    if (st === 'bun') { c.beginPath(); c.arc(0, -ry * 1.15, rx * .5, 0, 7); c.fill(); }
    return;
  }
  c.beginPath();
  if (v === 'f') { c.moveTo(-rx * 1.1, ry * .2); c.bezierCurveTo(-rx * 1.3, -ry * 1.45, rx * 1.3, -ry * 1.45, rx * 1.1, ry * .2); c.lineTo(rx * .92, -ry * .05); c.quadraticCurveTo(rx * .25, -ry * .66, -rx * .95, -ry * .05); }
  else { c.moveTo(rx * .96, -ry * .3); c.bezierCurveTo(rx * .85, -ry * 1.45, -rx * 1.45, -ry * 1.3, -rx * 1.15, ry * .5); c.lineTo(-rx * .5, ry * .2); c.quadraticCurveTo(-rx * .05, -ry * .3, rx * .96, -ry * .3); }
  c.closePath(); c.fill();
  if (st === 'bun') { c.beginPath(); c.arc(v === 'f' ? 0 : -rx * .5, -ry * 1.25, rx * .5, 0, 7); c.fill(); }
  if (st === 'cap') { c.fillStyle = o.cap || '#222'; c.beginPath(); c.ellipse(0, -ry * .4, rx * 1.15, ry * .85, 0, Math.PI, 0); c.fill(); if (v === 's') rect(c, rx * .5, -ry * .45, rx * 1.1, ry * .18, o.cap || '#222'); else rect(c, -rx * 1.1, -ry * .45, rx * 2.2, ry * .16, sh(o.cap || '#222', .8)); }
}
function head(c, o, H, P, hx, hy) {
  var rx = .056 * H, ry = .07 * H, v = o.view, sway = (P.sway || 0) * H;
  c.save(); c.translate(hx, hy); c.rotate(P.head + (P.tilt || 0));
  c.fillStyle = lg(c, -rx, 0, rx, 0, [[0, sh(o.skin, .95)], [.55, sh(o.skin, 1.04)], [1, sh(o.skin, .7)]]);
  c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill();
  if (v !== 's') { c.beginPath(); c.ellipse(-rx * .98, ry * .1, rx * .16, ry * .22, 0, 0, 7); c.ellipse(rx * .98, ry * .1, rx * .16, ry * .22, 0, 0, 7); c.fill(); }
  if (v === 'f') {
    c.fillStyle = 'rgba(30,18,18,.85)'; [-1, 1].forEach(function (s) { c.beginPath(); c.ellipse(s * rx * .42, ry * .05, rx * .13, ry * .07, 0, 0, 7); c.fill(); c.fillRect(s * rx * .42 - rx * .2, -ry * .16, rx * .4, ry * .045); });
    c.fillStyle = 'rgba(190,70,70,.35)'; c.fillRect(-rx * .5, ry * .38, rx, ry * .22);
    c.fillStyle = 'rgba(80,20,25,' + (.55 + P.mouth * .4) + ')'; c.beginPath(); c.ellipse(0, ry * .5, rx * (.2 + .1 * P.mouth), ry * (.04 + .15 * P.mouth), 0, 0, 7); c.fill();
  } else if (v === 's') {
    c.fillStyle = sh(o.skin, .95); c.beginPath(); c.moveTo(rx * .96, ry * .02); c.lineTo(rx * 1.2, ry * .3); c.lineTo(rx * .9, ry * .32); c.closePath(); c.fill();
    c.fillStyle = 'rgba(30,18,18,.85)'; c.beginPath(); c.ellipse(rx * .5, ry * .02, rx * .1, ry * .06, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(80,20,25,' + (.55 + P.mouth * .4) + ')'; c.beginPath(); c.ellipse(rx * .5, ry * .52, rx * (.14 + .06 * P.mouth), ry * (.035 + .13 * P.mouth), 0, 0, 7); c.fill();
  }
  hairFront(c, o, H, rx, ry, sway);
  if (o.hp) {
    c.strokeStyle = '#15151c'; c.lineWidth = H * .014; c.beginPath(); c.arc(0, -ry * .05, rx * 1.18, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
    c.fillStyle = '#1b1b24'; if (v === 's') { c.beginPath(); c.ellipse(-rx * .38, ry * .14, rx * .32, ry * .48, 0, 0, 7); c.fill(); } else [-1, 1].forEach(function (s) { c.beginPath(); c.ellipse(s * rx * 1.17, ry * .1, rx * .26, ry * .5, 0, 0, 7); c.fill(); });
  }
  c.restore();
}
function drawBody(c, o) {
  var H = o.h, v = o.view, P = o.p, T = .245 * H, SH = .245 * H, i;
  var drop = function (l) { return T * Math.cos(l[0]) + SH * Math.cos(l[1]); };
  var hipY = o.hipAt != null ? o.hipAt : o.y - Math.max(drop(P.lL), drop(P.lR)) + P.dy * H, hipX = o.x + P.hx * H;
  var ts = Math.sin(P.torso), tc = Math.cos(P.torso), TL = .3 * H, sxp = hipX + ts * TL, syp = hipY - tc * TL;
  var wS = (v === 's' ? .03 : .115) * H, wH = (v === 's' ? .02 : .06) * H;
  var sL = [sxp - tc * wS, syp - ts * wS], sR = [sxp + tc * wS, syp + ts * wS], hL = [hipX - wH, hipY], hR = [hipX + wH, hipY];
  var legC = o.legs === 'short' || o.legs === 'skirt' ? o.skin : o.bottom;
  var drawLeg = function (l, hp) {
    var d1 = dir(l[0]), d2 = dir(l[1]), kx = hp[0] + d1[0] * T, ky = hp[1] + d1[1] * T, ax = kx + d2[0] * SH, ay = ky + d2[1] * SH;
    limb(c, hp[0], hp[1], kx, ky, .095 * H, .062 * H, o.bottom); limb(c, kx, ky, ax, ay, .062 * H, .042 * H, legC);
    c.fillStyle = lg(c, ax - .05 * H, ay, ax + .05 * H, ay, [[0, sh(o.shoe, 1.2)], [1, sh(o.shoe, .6)]]); c.beginPath();
    if (v === 's') c.ellipse(ax + .035 * H, ay + .014 * H, .07 * H, .03 * H, 0, 0, 7); else c.ellipse(ax + d2[0] * .01 * H, ay + .02 * H, .046 * H, .03 * H, 0, 0, 7); c.fill();
  };
  var arm = function (a, sp) {
    var d1 = dir(a[0]), d2 = dir(a[1]), ex = sp[0] + d1[0] * .165 * H, ey = sp[1] + d1[1] * .165 * H, wx = ex + d2[0] * .145 * H, wy = ey + d2[1] * .145 * H, hxp = wx + d2[0] * .03 * H, hyp = wy + d2[1] * .03 * H;
    var sleeve = o.sleeve === 'long' ? o.top : o.sleeve === 'short' ? o.skin : o.skin;
    limb(c, sp[0], sp[1], ex, ey, .06 * H, .047 * H, o.sleeve === 'none' ? o.skin : o.top);
    limb(c, ex, ey, wx, wy, .047 * H, .036 * H, sleeve); c.fillStyle = sh(o.skin, .95); c.beginPath(); c.ellipse(hxp, hyp, .027 * H, .035 * H, Math.atan2(d2[0], -d2[1]), 0, 7); c.fill();
    return [hxp, hyp];
  };
  drawLeg(P.lL, hL); drawLeg(P.lR, hR);
  var aLp = null, aRp = null;
  if (v === 's') aLp = arm(P.aL, sL);
  /* torso */
  var wsT = (v === 's' ? .078 : .13) * H, wm = (v === 's' ? .064 : .095) * H, whT = (v === 's' ? .074 : .11) * H, mx = hipX + ts * TL * .5, my = hipY - tc * TL * .5;
  var hcx = sxp + Math.sin(P.head) * .105 * H, hcy = syp - Math.cos(P.head) * .105 * H;
  c.save(); c.translate(hcx, hcy); c.rotate(P.head + (P.tilt || 0)); hairBack(c, o, H, .052 * H, .066 * H, (P.sway || 0) * H); c.restore();
  var tg = lg(c, hipX - wsT, 0, hipX + wsT, 0, [[0, sh(o.top, .98)], [.5, sh(o.top, 1.04)], [1, sh(o.top, .6)]]);
  c.fillStyle = tg; c.strokeStyle = tg; c.lineWidth = .045 * H; c.lineJoin = 'round';
  var tp = [[hipX - whT, hipY + .02 * H], [mx - tc * wm, my - ts * wm], [sxp - tc * wsT, syp - ts * wsT], [sxp + tc * wsT, syp + ts * wsT], [mx + tc * wm, my + ts * wm], [hipX + whT, hipY + .02 * H]];
  poly(c, tp, tg); c.stroke();
  if (o.legs === 'skirt') { var kk = hipY + .2 * H; poly(c, [[hipX - whT, hipY], [hipX + whT, hipY], [hipX + whT * 1.9, kk], [hipX - whT * 1.9, kk]], lg(c, hipX - whT, 0, hipX + whT, 0, [[0, sh(o.bottom, 1)], [1, sh(o.bottom, .6)]])); }
  if (o.belt) rect(c, hipX - whT, hipY - .012 * H, whT * 2, .03 * H, o.belt);
  if (o.tie && v === 'f') poly(c, [[sxp - .012 * H, syp + .01 * H], [sxp + .012 * H, syp + .01 * H], [sxp + .018 * H, syp + .12 * H], [sxp, syp + .15 * H], [sxp - .018 * H, syp + .12 * H]], o.tie);
  if (o.collar && v === 'f') poly(c, [[sxp - .04 * H, syp - .005 * H], [sxp + .04 * H, syp - .005 * H], [sxp, syp + .09 * H]], o.collar);
  if (o.rim) { c.lineWidth = .006 * H; c.strokeStyle = lg(c, sxp - wsT * (o.rimSide || 1) * -1, 0, sxp + wsT * (o.rimSide || 1) * -1, 0, [[0, A(o.rim, .75)], [.5, A(o.rim, 0)], [1, A(o.rim, 0)]]); c.beginPath(); poly(c, tp); c.stroke(); }
  /* neck + head */
  limb(c, sxp, syp + .01 * H, hcx, hcy + .04 * H, .045 * H, .04 * H, sh(o.skin, .85));
  head(c, o, H, P, hcx, hcy);
  if (v !== 's') { aLp = arm(P.aL, sL); }
  aRp = arm(P.aR, sR);
  return { hL: aLp, hR: aRp, head: [hcx, hcy], chest: [mx, my], sh: [sxp, syp], hip: [hipX, hipY] };
}
/* person(c, o): o.x,o.y (feet), o.h (height in px), o.view 'f'|'b'|'s', o.flip, o.p (pose), o.lit (lighting), colours.
   Pose angles are in screen space: 0 = pointing down, +x = to the right, PI = straight up. */
var POSE = { hx: 0, dy: 0, torso: 0, head: 0, tilt: 0, sway: 0, mouth: 0, aL: [-.1, -.1], aR: [.1, .1], lL: [-.05, -.03], lR: [.05, .03] };
function person(c, o) {
  o = Object.assign({ view: 'f', skin: SKIN.b, hair: 'short', hc: '#2a1d18', top: '#555', bottom: '#2c3550', shoe: '#e8e8ee', sleeve: 'short', legs: 'long', h: 500, flip: false, alpha: 1 }, o);
  o.p = Object.assign({}, POSE, o.p || {});
  var H = o.h, m = c.getTransform(), s = m.a, bx = o.x - .75 * H, by = o.y - 1.32 * H, bw = 1.5 * H, bh = 1.46 * H;
  if (o.hipAt != null) { by = Math.min(by, o.hipAt - 1.1 * H); bh = Math.max(bh, o.hipAt + .55 * H - by); }
  var wp = Math.ceil(bw * s), hp = Math.ceil(bh * s);
  if (SCR.width < wp || SCR.height < hp) { SCR.width = Math.max(SCR.width, wp); SCR.height = Math.max(SCR.height, hp); }
  sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, SCR.width, SCR.height);
  sx.setTransform(s, 0, 0, s, -bx * s, -by * s);
  if (o.shadow !== false && o.hipAt == null) { sx.fillStyle = rg(sx, o.x, o.y, 0, H * .3, [[0, 'rgba(0,0,0,.5)'], [1, 'rgba(0,0,0,0)']]); sx.save(); sx.translate(o.x, o.y); sx.scale(1, .16); sx.translate(-o.x, -o.y); sx.beginPath(); sx.arc(o.x, o.y, H * .3, 0, 7); sx.fill(); sx.restore(); }
  sx.save(); if (o.flip) { sx.translate(o.x, 0); sx.scale(-1, 1); sx.translate(-o.x, 0); }
  var r = drawBody(sx, o); sx.restore();
  if (o.flip) { ['hL', 'hR'].forEach(function (k) { if (r[k]) r[k] = [2 * o.x - r[k][0], r[k][1]]; }); ['head', 'chest', 'sh', 'hip'].forEach(function (k) { r[k] = [2 * o.x - r[k][0], r[k][1]]; }); }
  var L = o.lit;
  if (L) {
    sx.globalCompositeOperation = 'source-atop';
    if (L.amb) { sx.fillStyle = L.amb; sx.fillRect(bx, by, bw, bh); }
    (L.keys || []).forEach(function (k) { sx.fillStyle = lg(sx, o.x + k.side * H * .42, 0, o.x - k.side * H * .42, 0, [[0, A(k.c, k.a)], [.7, A(k.c, 0)], [1, A(k.c, 0)]]); sx.fillRect(bx, by, bw, bh); });
    if (L.top) { sx.fillStyle = lg(sx, 0, o.y - 1.2 * H, 0, o.y - .55 * H, [[0, A(L.top.c, L.top.a)], [1, A(L.top.c, 0)]]); sx.fillRect(bx, by, bw, bh); }
  }
  c.save(); c.globalAlpha = o.alpha; c.drawImage(SCR, 0, 0, wp, hp, bx, by, bw, bh); c.restore();
  return r;
}
/* cheap crowd silhouette: body, head, arms up (swing) */
function sil(c, x, y, h, col, rim, arms, t, ph, lit) {
  var w = h * .34, up = arms ? Math.sin(t * 3.1 + ph) * .5 : 0;
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  rr(c, x - w / 2, y - h * .75, w, h * 1.1, w * .4); c.fill();
  c.beginPath(); c.arc(x, y - h * .86, h * .13, 0, 7); c.fill();
  if (arms) {
    c.lineWidth = h * .08; var len = h * .5;
    [-1, 1].forEach(function (s, i) { var ang = .35 + (i ? up : -up) * .5 + (arms > 1 ? .25 : 0); c.beginPath(); c.moveTo(x + s * w * .4, y - h * .62); c.lineTo(x + s * (w * .4 + Math.sin(ang) * len), y - h * .62 - Math.cos(ang) * len); c.stroke(); });
    if (lit) glow(c, x + w * .5 + Math.sin(t + ph) * 3, y - h * 1.15, h * .35, lit, .6);
  }
  if (rim) { c.strokeStyle = A(rim, .55); c.lineWidth = Math.max(1, h * .012); c.beginPath(); c.arc(x, y - h * .86, h * .13, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
}

/* ---------- engine ---------- */
var U = { DW: DW, DH: DH, rs: rs, rnd: rnd, clamp: clamp, lerp: lerp, ss: ss, A: A, sh: sh, mc: mc, lg: lg, rg: rg, rect: rect, rr: rr, poly: poly, glow: glow, beam: beam, glowText: glowText, reflect: reflect, floorWood: floorWood, dots: dots, person: person, sil: sil, SKIN: SKIN, dir: dir };
function start(id) {
  var cv = document.getElementById('sc-c'); if (!cv || !REG[id]) return false;
  var X = cv.getContext('2d'), calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var scene = REG[id](U), bgc = document.createElement('canvas'), bgx = bgc.getContext('2d'), vig = document.createElement('canvas'), noise = document.createElement('canvas');
  var S, ox, oy, dpr, px = 0, py = 0, tx = 0, ty = 0, last = 0, t0 = performance.now(), pat;
  var nx = noise.getContext('2d'); noise.width = noise.height = 160; var im = nx.createImageData(160, 160);
  for (var i = 0; i < im.data.length; i += 4) { var v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } nx.putImageData(im, 0, 0);
  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    S = Math.max(cv.width / DW, cv.height / DH) * 1.04; ox = (cv.width - DW * S) / 2; oy = (cv.height - DH * S) / 2;
    bgc.width = Math.ceil(DW * S); bgc.height = Math.ceil(DH * S); bgx.setTransform(S, 0, 0, S, 0, 0); rs(7); scene.bg(bgx);
    vig.width = cv.width; vig.height = cv.height; var v = vig.getContext('2d');
    v.fillStyle = rg(v, cv.width / 2, cv.height * .48, Math.min(cv.width, cv.height) * .3, Math.hypot(cv.width, cv.height) * .62, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.62)']]); v.fillRect(0, 0, cv.width, cv.height);
    pat = X.createPattern(noise, 'repeat');
  }
  function draw(t) {
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.fillStyle = '#000'; X.fillRect(0, 0, cv.width, cv.height);
    X.setTransform(S, 0, 0, S, ox + px * 6 * S, oy + py * 4 * S); X.drawImage(bgc, 0, 0, DW, DH);
    X.setTransform(S, 0, 0, S, ox + px * 10 * S, oy + py * 6 * S); if (scene.live) scene.live(X, t);
    X.setTransform(S, 0, 0, S, ox + px * 18 * S, oy + py * 10 * S); if (scene.front) scene.front(X, t);
    X.setTransform(1, 0, 0, 1, 0, 0);
    if (scene.grade) { X.fillStyle = scene.grade; X.fillRect(0, 0, cv.width, cv.height); }
    X.drawImage(vig, 0, 0);
    X.save(); X.globalCompositeOperation = 'overlay'; X.globalAlpha = .1; X.translate((rnd() * 160) | 0, (rnd() * 160) | 0); X.fillStyle = pat; X.fillRect(-160, -160, cv.width + 320, cv.height + 320); X.restore();
  }
  function frame(now) {
    requestAnimationFrame(frame); if (document.hidden || now - last < 33) return; last = now;
    var t = (now - t0) / 1000; px += (tx - px) * .05; py += (ty - py) * .05;
    if (!fine) { tx = Math.sin(t * .13) * .7; ty = Math.cos(t * .1) * .5; }
    draw(t);
  }
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) addEventListener('pointermove', function (e) { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { setup(); if (calm) draw(2.2); }, 120); });
  setup(); window.__sceneDraw = function (t) { draw(t); };
  if (calm) draw(2.2); else requestAnimationFrame(frame);
  return true;
}
})();
