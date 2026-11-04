/* Scenes 1-4: Popthusiast, Ketahui.id, Globall_id, Popnewsiast */
(function () {
'use strict';

/* ============ Popthusiast: K-pop dance practice studio, mirror wall, three girls rehearsing ============ */
SCENES.reg('popthusiast', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss, lerp = U.lerp;
  var CANS = [250, 480, 710, 940, 1170, 1400], COLS = ['#ff4fa3', '#9a7bff', '#33d6ff', '#ff4fa3', '#9a7bff', '#33d6ff'];
  var MOVES = [
    function (w) { return { aL: [-1.3 + .5 * Math.sin(w), -1.7 + .7 * Math.sin(w + 1)], aR: [1.3 + .5 * Math.sin(w + 3.14), 1.7 + .7 * Math.sin(w + 4.14)], hx: 0 }; },
    function (w) { var u = ss((Math.sin(w * .5) + 1) / 2); return { aR: [lerp(.3, 2.7, u), lerp(.6, 2.95, u)], aL: [lerp(-2.7, -.3, u), lerp(-2.95, -.6, u)], hx: 0 }; },
    function (w) { return { aL: [-.85, .45], aR: [.85, -.45], hx: .03 * Math.sin(w * .5) }; },
    function (w) { return { aL: [-2.5, -3.05 + .1 * Math.sin(w)], aR: [2.5, 3.05 - .1 * Math.sin(w)], hx: 0 }; }
  ];
  function pose(t, i) {
    var tt = t - i * .07, w = tt * 6.283, seg = 2.5, k = Math.floor(tt / seg), a = MOVES[((k % 4) + 4) % 4](w), b = MOVES[(((k + 1) % 4) + 4) % 4](w), u = ss((tt - k * seg - 2.1) / .4);
    var m = function (x, y) { return [lerp(x[0], y[0], u), lerp(x[1], y[1], u)]; };
    return { aL: m(a.aL, b.aL), aR: m(a.aR, b.aR), hx: lerp(a.hx, b.hx, u), dy: -.024 * Math.abs(Math.sin(Math.PI * 2 * tt)), torso: .05 * Math.sin(w * .5 + i), head: .05 * Math.sin(w * .5 + 1 + i), sway: .035 * Math.sin(w + i), lL: [-.1, -.06], lR: [.1, .06] };
  }
  var D = [
    { x: 620, y: 850, h: 450, hc: '#17110f', top: '#ff4fa3', bottom: '#1d1d28', skin: U.SKIN.b, legs: 'long' },
    { x: 800, y: 872, h: 475, hc: '#5d3320', top: '#f4f2ff', bottom: '#33285c', skin: U.SKIN.a, legs: 'short' },
    { x: 980, y: 850, h: 450, hc: '#d6b074', top: '#7c5cff', bottom: '#1d1d28', skin: U.SKIN.c, legs: 'long' }
  ];
  return {
    grade: 'rgba(40,10,60,.1)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 620, [[0, '#0e0818'], [1, '#2a1740']]));
      /* mirror wall */
      rect(c, 90, 165, 1420, 440, '#0a0612'); rect(c, 100, 175, 1400, 420, lg(c, 0, 175, 0, 595, [[0, '#4a3878'], [.5, '#33275c'], [1, '#1d1538']]));
      for (var i = 1; i < 5; i++) rect(c, 100 + i * 280 - 2, 175, 4, 420, 'rgba(10,6,20,.55)');
      U.poly(c, [[200, 175], [330, 175], [150, 595], [100, 595], [100, 480]], 'rgba(255,255,255,.05)'); U.poly(c, [[620, 175], [700, 175], [520, 595], [450, 595]], 'rgba(255,255,255,.04)'); U.poly(c, [[1100, 175], [1240, 175], [1020, 595], [930, 595]], 'rgba(255,255,255,.045)');
      glow(c, 400, 330, 260, '#ff4fa3', .22); glow(c, 1160, 300, 260, '#33d6ff', .2); glow(c, 800, 200, 300, '#9a7bff', .18);
      /* ballet barre */
      c.strokeStyle = '#d8cdf0'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(130, 470); c.lineTo(1470, 470); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(130, 476); c.lineTo(1470, 476); c.stroke();
      for (i = 0; i < 5; i++) rect(c, 220 + i * 290, 470, 8, 30, '#8a7fa6');
      /* ceiling + rail */
      rect(c, 0, 0, 1600, 70, '#07040d'); rect(c, 60, 28, 1480, 9, '#1c1428'); CANS.forEach(function (x) { rect(c, x - 20, 36, 40, 26, '#120c1c'); });
      /* floor */
      U.floorWood(c, 600, 800, 250, '#9a6540', 18, 120); rect(c, 0, 598, 1600, 14, lg(c, 0, 598, 0, 612, [[0, 'rgba(0,0,0,.55)'], [1, 'rgba(0,0,0,0)']]));
      U.reflect(c, 600, 200, .3);
      /* speakers */
      [[18, 1], [1482, 1]].forEach(function (s) { rect(c, s[0], 420, 100, 200, '#0b0a10'); [[50, 480, 22], [50, 555, 30]].forEach(function (d) { c.fillStyle = rg(c, s[0] + d[0], d[1], 2, d[2], [[0, '#2a2a36'], [1, '#07070a']]); c.beginPath(); c.arc(s[0] + d[0], d[1], d[2], 0, 7); c.fill(); }); });
    },
    live: function (c, t) {
      /* neon sign */
      var fl = Math.sin(t * 40) > .97 ? .5 : 1; U.glowText(c, 'POPTHUSIAST', 800, 112, '800 56px "Plus Jakarta Sans",system-ui,sans-serif', '#ff4fa3', 28, fl);
      /* spot lights */
      CANS.forEach(function (x, i) {
        var col = COLS[(i + Math.floor(t / 4)) % 6], ex = x + Math.sin(t * .8 + i * 1.3) * 190;
        glow(c, x, 50, 46, col, .9); U.beam(c, x, 52, 26, ex, 640, 190, col, .2); glow(c, ex, 735, 190, col, .16, 2.3);
      });
      /* reflections in the mirror */
      var bt = t * 6.283;
      D.forEach(function (d, i) {
        var p = pose(t, i), rx = d.x + (d.x - 800) * .5 + 20;
        U.person(c, { x: rx, y: 596, h: d.h * .5, view: 'f', hair: 'long', hc: d.hc, top: d.top, bottom: d.bottom, skin: d.skin, legs: d.legs, shadow: false, alpha: .6, p: p, lit: { amb: 'rgba(20,10,60,.3)', keys: [{ c: '#ff4fa3', side: -1, a: .3 }] } });
      });
      /* the dancers, seen from behind */
      D.forEach(function (d, i) {
        U.person(c, { x: d.x, y: d.y, h: d.h, view: 'b', hair: 'long', hc: d.hc, top: d.top, bottom: d.bottom, skin: d.skin, legs: d.legs, p: pose(t, i), rim: '#ff9ad0', rimSide: i - 1 || 1,
          lit: { amb: 'rgba(10,4,30,.26)', keys: [{ c: '#ff4fa3', side: -1, a: .45 }, { c: '#33d6ff', side: 1, a: .35 }], top: { c: '#c9b8ff', a: .22 } } });
      });
    },
    front: function (c, t) {
      /* phone on a tripod with a ring light, filming the routine */
      c.strokeStyle = '#08070c'; c.lineWidth = 7; c.lineCap = 'round'; [[190, 890], [250, 900], [312, 890]].forEach(function (f) { c.beginPath(); c.moveTo(250, 560); c.lineTo(f[0], f[1]); c.stroke(); });
      rect(c, 244, 470, 12, 100, '#0c0a12'); glow(c, 250, 440, 150, '#ffffff', .22);
      c.strokeStyle = '#fff'; c.lineWidth = 15; c.beginPath(); c.arc(250, 440, 58, 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 30; c.stroke();
      U.rr(c, 228, 404, 44, 74, 8); c.fillStyle = '#0a0a10'; c.fill(); c.fillStyle = Math.sin(t * 5) > 0 ? '#ff3b3b' : '#6a1414'; c.beginPath(); c.arc(262, 414, 3.5, 0, 7); c.fill();
      /* bag + bottle */
      U.rr(c, 1330, 800, 190, 100, 26); c.fillStyle = lg(c, 0, 800, 0, 900, [[0, '#2a2438'], [1, '#0c0a14']]); c.fill(); rect(c, 1380, 790, 90, 14, '#15111f');
      U.rr(c, 1275, 810, 34, 90, 12); c.fillStyle = 'rgba(160,220,255,.45)'; c.fill(); rect(c, 1280, 800, 24, 16, '#ff4fa3');
    }
  };
});

/* ============ Ketahui.id: live news studio, two anchors at the desk ============ */
SCENES.reg('ketahui-id', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss;
  var TXT = ['BERITA TERKINI', 'LAPORAN UTAMA', 'KETAHUI.ID LIVE', 'UPDATE HARI INI'];
  var HEAD = ['Ketahui.id menghadirkan kabar terbaru dari seluruh Indonesia', 'Siaran langsung · Laporan khusus pagi ini', 'Ikuti terus perkembangan berita hari ini'];
  var map = [];
  function person(c, t, who, hipx, spk) {
    var o = who === 0 ? { hair: 'long', hc: '#1a1210', top: '#e11d2e', collar: '#ffffff', skin: U.SKIN.b } : { hair: 'short', hc: '#14100e', top: '#1b2340', tie: '#e11d2e', collar: '#ffffff', skin: U.SKIN.c };
    var p = spk ? { aL: [-.25, .55], aR: [.55 + .25 * Math.sin(t * 1.3), 1.7 + .35 * Math.sin(t * 2.1)], head: .05 * Math.sin(t * 1.1), torso: .02 * Math.sin(t * .9), mouth: Math.abs(Math.sin(t * 9 + who)) * .85 }
      : { aL: [-.3, .5], aR: [.3, -.5], head: .06 * Math.sin(t * 1.2 + who) + .02, mouth: 0 };
    return U.person(c, Object.assign(o, { x: hipx, y: 640, hipAt: 668, h: 570, view: 'f', sleeve: 'long', legs: 'long', bottom: '#151a2c', shadow: false, p: Object.assign({ lL: [-.05, 0], lR: [.05, 0] }, p), rim: '#9ac4ff', rimSide: who ? 1 : -1,
      lit: { amb: 'rgba(6,10,30,.18)', keys: [{ c: '#ffd9a8', side: -1, a: .25 }, { c: '#7aa8ff', side: 1, a: .3 }], top: { c: '#ffffff', a: .12 } } }));
  }
  return {
    grade: 'rgba(0,10,40,.08)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 650, [[0, '#060b1a'], [1, '#12214a']]));
      /* video wall */
      rect(c, 232, 38, 1136, 380, '#04070f'); rect(c, 244, 50, 1112, 356, lg(c, 0, 50, 0, 406, [[0, '#0d1c4a'], [1, '#152f6e']]));
      U.rs(5); for (var i = 0; i < 520; i++) { var x = 250 + U.rnd() * 560, y = 70 + U.rnd() * 250; if (Math.sin(x * .013) * Math.cos(y * .02) > -.1) { c.fillStyle = A('#7fb2ff', .15 + U.rnd() * .35); c.fillRect(x, y, 3, 3); } }
      /* flag panel */
      rect(c, 1060, 62, 290, 150, '#e11d2e'); rect(c, 1060, 212, 290, 150, '#f4f4f6'); rect(c, 1060, 62, 290, 300, lg(c, 1060, 0, 1350, 0, [[0, 'rgba(0,0,0,.3)'], [.3, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.2)']]));
      [[110, 1], [1420, 1]].forEach(function (p) { rect(c, p[0] - 8, 60, 16, 520, '#0a1228'); rect(c, p[0] - 3, 60, 6, 520, '#e11d2e'); glow(c, p[0], 320, 160, '#e11d2e', .22); });
      /* glossy dark floor */
      rect(c, 0, 600, 1600, 300, lg(c, 0, 600, 0, 900, [[0, '#0a1124'], [1, '#04060d']]));
      U.reflect(c, 600, 260, .5);
      /* desk top */
      c.fillStyle = lg(c, 0, 575, 0, 640, [[0, '#dfe8fb'], [1, '#8fa6d6']]); c.beginPath(); c.ellipse(800, 622, 500, 46, 0, 0, 7); c.fill();
      /* desk props */
      rect(c, 560, 600, 70, 3, 'rgba(255,255,255,.6)'); rect(c, 980, 592, 54, 26, '#fff'); rect(c, 986, 596, 42, 4, '#c9d3ec'); rect(c, 1140, 598, 24, 24, 'rgba(180,220,255,.5)');
      glow(c, 800, 8, 360, '#9ac4ff', .22); glow(c, 340, 8, 220, '#ffd9a8', .22); glow(c, 1260, 8, 220, '#ffd9a8', .22);
    },
    live: function (c, t) {
      /* wall content */
      c.save(); c.beginPath(); c.rect(244, 50, 1112, 356); c.clip();
      var k = Math.floor(t / 3) % TXT.length; U.glowText(c, TXT[k], 560, 150, '800 62px "Plus Jakarta Sans",system-ui,sans-serif', '#ffffff', 16, .96);
      c.strokeStyle = A('#5fa0ff', .8); c.lineWidth = 3; c.beginPath(); for (var i = 0; i < 40; i++) { var x = 270 + i * 18, y = 280 - 40 * Math.sin(i * .35 + t * 1.2) - i * 1.3; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      for (i = 0; i < 9; i++) { var h = 30 + 50 * Math.abs(Math.sin(t * .8 + i * .9)); rect(c, 820 + i * 24, 330 - h, 16, h, A('#5fa0ff', .55)); }
      rect(c, 244, 366, 1112, 40, '#e11d2e'); rect(c, 244, 366, 190, 40, '#fff');
      c.fillStyle = '#e11d2e'; c.font = '800 20px "Plus Jakarta Sans",system-ui,sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText('● LIVE', 270, 387);
      c.fillStyle = '#fff'; var s = HEAD[Math.floor(t / 12) % 3], off = -((t * 90) % 1400) + 1360; c.fillText(s + '   ✦   ' + HEAD[(Math.floor(t / 12) + 1) % 3], off - 700 + 300, 387); c.restore();
      glow(c, 800, 230, 520, '#4f86ff', .1);
      /* anchors: they take turns */
      var turn = Math.floor(t / 6) % 2;
      person(c, t, 0, 640, turn === 0); person(c, t, 1, 960, turn === 1);
      /* desk front */
      c.fillStyle = lg(c, 0, 626, 0, 790, [[0, '#f1f5ff'], [.4, '#c4d2f2'], [1, '#6f86bd']]); U.rr(c, 330, 626, 940, 214, 28); c.fill();
      rect(c, 330, 824, 940, 16, '#e11d2e'); glow(c, 800, 840, 520, '#e11d2e', .35, 1.8); rect(c, 300, 840, 1000, 60, lg(c, 0, 840, 0, 900, [[0, 'rgba(0,0,0,.7)'], [1, '#02030a']]));
      c.fillStyle = '#0d1a3e'; c.font = '800 54px "Plus Jakarta Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KETAHUI.ID', 800, 725);
      rect(c, 330, 626, 940, 5, 'rgba(255,255,255,.7)');
    },
    front: function (c, t) {
      /* broadcast camera in the foreground */
      c.strokeStyle = '#05060b'; c.lineWidth = 9; c.lineCap = 'round'; [[130, 905], [300, 910], [215, 912]].forEach(function (f) { c.beginPath(); c.moveTo(215, 810); c.lineTo(f[0], f[1]); c.stroke(); });
      U.rr(c, 80, 600, 290, 200, 22); c.fillStyle = lg(c, 0, 600, 0, 800, [[0, '#262a3c'], [1, '#090b14']]); c.fill();
      U.rr(c, 330, 650, 120, 100, 14); c.fillStyle = '#0c0e18'; c.fill(); c.fillStyle = rg(c, 440, 700, 4, 40, [[0, '#4a68b8'], [.5, '#10183a'], [1, '#05070f']]); c.beginPath(); c.ellipse(440, 700, 24, 40, 0, 0, 7); c.fill();
      rect(c, 100, 560, 110, 46, '#12141f'); var on = Math.sin(t * 3) > -.2; c.fillStyle = on ? '#ff2b2b' : '#5a1212'; c.beginPath(); c.arc(342, 628, 7, 0, 7); c.fill(); if (on) glow(c, 342, 628, 46, '#ff2b2b', .7);
    }
  };
});

/* ============ Globall_id: floodlit stadium, a striker dribbles, shoots and celebrates ============ */
SCENES.reg('globall-id', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss, lerp = U.lerp, clamp = U.clamp;
  var VPX = 800, VPY = 345, TLOOP = 8.4, off = 0, lastT = 0;
  var GP = { nb: [1235, 565], fb: [1085, 495] }, ppm = function (y) { return (y - VPY) * .584; };
  function run(ph, k) { var a = .7 * Math.sin(ph) * k, sh = a - (.55 + .45 * Math.sin(ph + .9)) * k; return [a, sh]; }
  return {
    grade: 'rgba(0,20,10,.06)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 400, [[0, '#030714'], [1, '#14284f']]));
      /* stands */
      c.fillStyle = lg(c, 0, 120, 0, 352, [[0, '#0b1224'], [1, '#18223d']]); c.beginPath(); c.moveTo(0, 150); c.lineTo(1600, 150); c.lineTo(1600, 352); c.lineTo(0, 352); c.fill();
      U.rs(11); for (var r = 0; r < 9; r++) { var yy = 170 + r * 20; c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(0, yy, 1600, 2); for (var i = 0; i < 150; i++) { c.fillStyle = A(['#e63946', '#fff', '#ffd84d', '#4fa3ff', '#ff9f43', '#9bd'][(U.rnd() * 6) | 0], .18 + U.rnd() * .4); c.fillRect(U.rnd() * 1600, yy + 3 + U.rnd() * 12, 4, 7); } }
      c.fillStyle = '#05080f'; c.beginPath(); c.moveTo(0, 0); c.lineTo(1600, 0); c.lineTo(1600, 120); c.quadraticCurveTo(800, 175, 0, 120); c.fill();
      /* ad boards */
      var cols = ['#e63946', '#1b6bff', '#ffd84d', '#17a34a', '#7c3aed', '#ff7a1a'];
      for (i = 0; i < 16; i++) { var bx = i * 100; rect(c, bx, 352, 100, 40, cols[i % 6]); rect(c, bx, 352, 100, 40, lg(c, 0, 352, 0, 392, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,0,0,.35)']])); if (i % 4 === 1) { c.fillStyle = '#fff'; c.font = '800 15px "Plus Jakarta Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GLOBALL_ID', bx + 50, 373); } else rect(c, bx + 22, 366, 56, 8, 'rgba(255,255,255,.7)'); }
      /* floodlights */
      [[150, 40], [1450, 40], [500, 100], [1100, 100]].forEach(function (p) {
        rect(c, p[0] - 6, p[1] + 36, 12, 340, '#0a0d16'); rect(c, p[0] - 52, p[1] - 8, 104, 54, '#0a0d16');
        for (var a = 0; a < 3; a++) for (var b = 0; b < 4; b++) { c.fillStyle = '#fff'; c.fillRect(p[0] - 46 + b * 25, p[1] - 2 + a * 16, 19, 11); }
        glow(c, p[0], p[1] + 20, 240, '#cfe4ff', .85); glow(c, p[0], p[1] + 20, 90, '#ffffff', 1);
      });
      /* pitch */
      rect(c, 0, 392, 1600, 508, lg(c, 0, 392, 0, 900, [[0, '#14522a'], [1, '#2a8a43']]));
    },
    live: function (c, t) {
      var tt = t % TLOOP, dt = Math.min(.1, Math.max(0, t - lastT)); lastT = t; if (tt < dt + .05) off = 0;
      var v = tt < 2.4 ? 260 * (1 - ss((tt - 1.8) / .6)) : 0; off += v * dt;
      /* mown stripes + lines, in perspective */
      var f = function (xb, y) { return VPX + (xb - VPX) * (y - VPY) / (900 - VPY); };
      for (var i = -3; i < 12; i++) {
        var xb = -500 + i * 230 - (off % 460); if (((i + Math.floor(off / 460)) & 1) === 0) continue;
        U.poly(c, [[f(xb, 392), 392], [f(xb + 230, 392), 392], [xb + 230, 900], [xb, 900]], 'rgba(255,255,255,.055)');
      }
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 394); c.lineTo(1600, 394); c.stroke();
      c.lineWidth = 6; c.beginPath(); c.moveTo(f(1560, 900) - 0, 900); c.lineTo(f(1560, 392), 392); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(f(1560 - 400, 900) + 0, 900); c.lineTo(f(1560 - 400, 392), 392); c.stroke();
      glow(c, 800, 700, 700, '#ffffff', .07, 2);
      /* goal + net + keeper */
      var nb = GP.nb, fb = GP.fb, hn = 2.44 * ppm(nb[1]), hf = 2.44 * ppm(fb[1]), dx = 1.6 * ppm(nb[1]) * .55, dxf = 1.6 * ppm(fb[1]) * .55;
      var goal = tt > 2.78 && tt < 6.4, ripple = goal ? Math.exp(-(tt - 2.95) * 2.2) * Math.sin((tt - 2.95) * 22) * 8 : 0;
      var kp = tt < 2.8 ? 0 : ss((tt - 2.8) / .5), kx = lerp(1160, 1195, kp), kyj = -Math.sin(Math.PI * kp) * 30;
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.2;
      var back = [[nb[0] + dx, nb[1]], [nb[0] + dx, nb[1] - hn * .96], [fb[0] + dxf, fb[1] - hf * .96], [fb[0] + dxf, fb[1]]];
      for (i = 0; i <= 10; i++) { var u = i / 10; c.beginPath(); c.moveTo(lerp(back[1][0], back[2][0], u) + ripple * u, lerp(back[1][1], back[2][1], u)); c.lineTo(lerp(back[0][0], back[3][0], u) + ripple * u, lerp(back[0][1], back[3][1], u)); c.stroke(); }
      for (i = 0; i <= 8; i++) { u = i / 8; c.beginPath(); c.moveTo(lerp(back[0][0], back[1][0], u) + ripple, lerp(back[0][1], back[1][1], u)); c.lineTo(lerp(back[3][0], back[2][0], u) + ripple, lerp(back[3][1], back[2][1], u)); c.stroke(); }
      for (i = 0; i <= 6; i++) { u = i / 6; c.beginPath(); c.moveTo(lerp(nb[0], nb[0] + dx, u), lerp(nb[1] - hn, nb[1] - hn * .96, u)); c.lineTo(lerp(fb[0], fb[0] + dxf, u), lerp(fb[1] - hf, fb[1] - hf * .96, u)); c.stroke(); }
      U.person(c, { x: kx, y: 548 + 0, h: 1.85 * ppm(548), view: 's', flip: true, hair: 'short', hc: '#222', skin: U.SKIN.c, top: '#ffd84d', bottom: '#222', sleeve: 'long', shadow: false, hipAt: null,
        p: tt < 2.8 ? { aL: [-.9, -1.3], aR: [.9, 1.3], lL: [-.3, -.1], lR: [.3, .1], dy: .01 * Math.sin(t * 5) } : { torso: -1.15 * kp, aL: [2.6, 3], aR: [2.9, 3.1], lL: [-.1, .4], lR: [-.5, -.9], dy: -.1 * Math.sin(Math.PI * kp), hx: .1 * kp * 0 } });
      c.strokeStyle = '#fff'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(nb[0], nb[1]); c.lineTo(nb[0], nb[1] - hn); c.lineTo(fb[0], fb[1] - hf); c.lineTo(fb[0], fb[1]); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(nb[0], nb[1] - hn); c.lineTo(fb[0], fb[1] - hf); c.stroke();
      /* striker */
      var pxs = 640, py = 836, ph = t * 11, k = tt < 2.4 ? 1 : 0, pl = { torso: .16, head: -.05, dy: 0 };
      var kick = clamp((tt - 2.42) / .34, 0, 1), cele = tt > 3.2 && tt < 6.4, cu = cele ? ss((tt - 3.2) / .3) : 0, lg1, lg2;
      if (tt < 2.4) { lg1 = run(ph, 1); lg2 = run(ph + Math.PI, 1); pl.lL = lg1; pl.lR = lg2; pl.aL = [-.7 * Math.sin(ph), -.7 * Math.sin(ph) + 1.1]; pl.aR = [.7 * Math.sin(ph), .7 * Math.sin(ph) + 1.1]; pl.dy = -.015 * Math.abs(Math.sin(ph)); }
      else if (tt < 3.2) { var sw = ss(kick); pl.lL = [.1, .05]; pl.lR = [lerp(-1.05, 1.15, sw), lerp(-1.9, .9, sw)]; pl.torso = lerp(.35, -.08, sw); pl.aL = [lerp(.5, -1.2, sw), lerp(1.4, -1.3, sw)]; pl.aR = [lerp(-.8, 1.5, sw), lerp(-.3, 1.7, sw)]; if (tt < 2.42) { pl.lR = [-1.05, -1.9]; } }
      else if (cele) { var j = Math.abs(Math.sin((tt - 3.2) * 4.5)); pl = { torso: -.05, head: -.2, mouth: .8, dy: -.08 * j, aL: [lerp(.3, 2.6, cu), lerp(.5, 3, cu)], aR: [lerp(.3, 2.9, cu), lerp(.5, 2.8, cu)], lL: [.1, .05 + j * .3], lR: [-.1, -.1 - j * .4] }; }
      else { pl.lL = run(ph * .35, .6); pl.lR = run(ph * .35 + Math.PI, .6); pl.aL = [.1, .5]; pl.aR = [.15, .6]; pl.torso = .05; }
      var cx = pxs + (tt > 6.4 ? 0 : 0);
      var r = U.person(c, { x: cx, y: py, h: 530, view: 's', hair: 'short', hc: '#1a120e', skin: U.SKIN.d, top: '#e63946', bottom: '#fafafa', legs: 'short', sleeve: 'short', shoe: '#ffd84d', p: pl, rim: '#bcd7ff', rimSide: 1,
        lit: { amb: 'rgba(0,6,24,.2)', keys: [{ c: '#dff0ff', side: 1, a: .35 }], top: { c: '#ffffff', a: .22 } } });
      c.fillStyle = 'rgba(255,255,255,.88)'; c.font = '800 70px "Plus Jakarta Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(r.chest[0] - 18, r.chest[1] - 6); c.scale(.55, 1); c.fillText('10', 0, 0); c.restore();
      /* ball */
      var br = .11 * ppm(py) * .95, bx0 = cx + 120, bpx, bpy;
      if (tt < 2.4) { bpx = bx0 + 70 + 55 * Math.abs(Math.sin(ph * .5)); bpy = py + 4 - br; }
      else if (tt < 2.78) { bpx = bx0 + 70; bpy = py + 4 - br; }
      else { var u2 = clamp((tt - 2.78) / .8, 0, 1), sx2 = cx + 190, sy2 = py + 4 - br, ex = 1175 + 30 * Math.min(1, 1 - u2) * 0, ey = 440, e = u2 * u2 * .4 + u2 * .6; bpx = lerp(sx2, ex, e); bpy = lerp(sy2, ey, e) - Math.sin(Math.PI * u2) * 70; br = lerp(br, .11 * ppm(500), u2); if (u2 >= 1) { var fall = clamp((tt - 3.58) / .5, 0, 1); bpx = ex + 50 * fall + ripple * .3; bpy = lerp(ey, 548, fall * fall) - Math.abs(Math.sin(fall * 6)) * 14 * (1 - fall); if (tt > 6.4) bpx = -999; } }
      if (tt >= 6.4 && tt < TLOOP) { bpx = bx0 + 70; bpy = py + 4 - br; br = .11 * ppm(py) * .95; }
      c.fillStyle = rg(c, bpx - br * .3, bpy - br * .3, 1, br * 1.1, [[0, '#fff'], [1, '#aeb3c4']]); c.beginPath(); c.arc(bpx, bpy, br, 0, 7); c.fill(); c.fillStyle = 'rgba(20,20,30,.7)'; c.beginPath(); c.arc(bpx + br * .1, bpy, br * .38, 0, 7); c.fill();
      /* crowd cameras flash after the goal */
      if (tt > 3 && tt < 6) { U.rs(Math.floor(t * 8)); for (i = 0; i < 26; i++) { if (U.rnd() > .5) glow(c, 40 + U.rnd() * 1520, 180 + U.rnd() * 160, 26, '#ffffff', .9); } }
      /* loop fade */
      var fa = Math.max(ss((tt - 7.7) / .6), 1 - ss(tt / .5)); if (fa > .01) { c.fillStyle = 'rgba(0,0,0,' + fa + ')'; c.fillRect(0, 0, 1600, 900); }
    },
    front: function (c, t) {
      c.fillStyle = lg(c, 0, 800, 0, 900, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,10,0,.55)']]); c.fillRect(0, 800, 1600, 100);
    }
  };
});

/* ============ Popnewsiast: radio booth at dusk, host on air with a guest ============ */
SCENES.reg('popnewsiast', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow;
  var bl = [];
  return {
    grade: 'rgba(60,10,50,.08)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 900, [[0, '#150c29'], [1, '#241338']]));
      /* window with dusk city */
      rect(c, 100, 70, 700, 470, '#07040e'); rect(c, 114, 84, 672, 442, lg(c, 0, 84, 0, 526, [[0, '#2b1a55'], [.55, '#c04b7a'], [.82, '#ff8a5b'], [1, '#ffc27a']]));
      glow(c, 500, 480, 300, '#ffb36b', .8, 1.5); c.fillStyle = rg(c, 500, 470, 4, 38, [[0, '#fff3d0'], [1, '#ffc27a']]); c.beginPath(); c.arc(500, 470, 36, 0, 7); c.fill();
      U.rs(21);
      [[.28, '#3a1f5e', 120, 260], [.18, '#241242', 90, 340], [.1, '#150a2c', 70, 440]].forEach(function (L, li) {
        var x = 114; while (x < 786) { var w = 34 + U.rnd() * 60, h = 70 + U.rnd() * 190 * (li ? 1.4 : 1); rect(c, x, 526 - h * (1 - li * .1), w, h * 2, L[1]);
          if (li > 0) for (var k = 0; k < h / 14; k++) if (U.rnd() > .55) rect(c, x + 6 + U.rnd() * (w - 12), 526 - h + k * 14, 4, 5, A('#ffd48a', .5 + U.rnd() * .5));
          if (li === 2 && U.rnd() > .75) bl.push([x + w / 2, 526 - h * .9 - 10]); x += w + 2; }
      });
      rect(c, 100, 70, 700, 12, '#0a0612'); rect(c, 100, 528, 700, 14, '#0a0612'); rect(c, 100, 70, 14, 470, '#0a0612'); rect(c, 786, 70, 14, 470, '#0a0612'); rect(c, 444, 70, 12, 470, '#0a0612');
      U.poly(c, [[160, 84], [300, 84], [200, 526], [114, 526]], 'rgba(255,255,255,.06)');
      /* acoustic foam wall */
      rect(c, 880, 90, 620, 470, '#10101a');
      for (var r = 0; r < 9; r++) for (var q = 0; q < 12; q++) { var x0 = 880 + q * 52, y0 = 90 + r * 52, cx = x0 + 26, cy = y0 + 26; U.poly(c, [[cx, y0], [x0 + 52, cy], [cx, y0 + 52], [x0, cy]], lg(c, x0, y0, x0 + 52, y0 + 52, [[0, '#3b3652'], [1, '#14121f']])); }
      glow(c, 1100, 300, 380, '#ff4fa3', .12); glow(c, 1300, 450, 300, '#7c5cff', .1);
      /* screens */
      [[560, 460], [1060, 470]].forEach(function (s) { rect(c, s[0], s[1], 220, 120, '#05060c'); rect(c, s[0] + 6, s[1] + 6, 208, 108, '#0a1630'); rect(c, s[0] + 90, 580, 40, 62, '#0a0a12'); });
    },
    live: function (c, t) {
      /* on air sign */
      var pulse = .75 + .25 * Math.sin(t * 2.4); U.rr(c, 1130, 120, 230, 76, 12); c.fillStyle = '#16080c'; c.fill(); glow(c, 1245, 158, 220, '#ff2b3a', .55 * pulse);
      U.glowText(c, 'ON AIR', 1245, 158, '800 48px "Plus Jakarta Sans",system-ui,sans-serif', '#ff3040', 24, pulse);
      bl.forEach(function (b, i) { if (Math.sin(t * 1.6 + i * 2) > .2) glow(c, b[0], b[1], 14, '#ff3b3b', .9); });
      /* guest (left): nodding to the music */
      var nod = Math.sin(t * 6.283 * 1.0), g = U.person(c, { x: 330, y: 720, hipAt: 706, h: 520, view: 's', hair: 'bun', hc: '#2a1512', skin: U.SKIN.a, top: '#7c5cff', bottom: '#1b1530', hp: 1, shadow: false,
        p: { head: .08 + .06 * nod, torso: .04 + .02 * nod, aL: [.3, 1.6], aR: [.5 + .1 * nod, 1.5], lL: [1.45, .1], lR: [1.5, .08] }, rim: '#ffb36b', rimSide: -1, lit: { amb: 'rgba(30,6,40,.22)', keys: [{ c: '#ffb36b', side: -1, a: .45 }] } });
      /* host (centre): talking, working the console */
      var talk = Math.abs(Math.sin(t * 8.5)) * (Math.sin(t * 1.3) > -.5 ? 1 : .15), pt = Math.sin(t * .5) > .3;
      var hs = U.person(c, { x: 820, y: 700, hipAt: 700, h: 570, view: 'f', hair: 'long', hc: '#1e1210', skin: U.SKIN.c, top: '#ff4fa3', bottom: '#1b1530', hp: 1, shadow: false,
        p: { head: .04 * Math.sin(t * 1.1), torso: .02 * Math.sin(t * .8), mouth: talk * .9, aL: [-.5, .4], aR: pt ? [.4, 1.3 + .3 * Math.sin(t * 2)] : [.7 + .2 * Math.sin(t * .9), .9], lL: [-.1, 0], lR: [.1, 0] },
        rim: '#ffb36b', rimSide: -1, lit: { amb: 'rgba(30,6,40,.2)', keys: [{ c: '#ffb36b', side: -1, a: .4 }, { c: '#ff4fa3', side: 1, a: .3 }] } });
      /* desk slab: hides the seated bodies, then the console sits on it */
      rect(c, 0, 640, 1600, 260, lg(c, 0, 640, 0, 900, [[0, '#3a2a5c'], [.2, '#2a1d44'], [1, '#100820']])); rect(c, 0, 638, 1600, 5, 'rgba(255,255,255,.3)');
      U.poly(c, [[420, 652], [1000, 652], [1060, 742], [360, 742]], lg(c, 0, 652, 0, 742, [[0, '#1d1830'], [1, '#2e2548']]));
      U.rr(c, 1170, 658, 290, 100, 10); c.fillStyle = '#1a1428'; c.fill(); rect(c, 1170, 658, 290, 4, 'rgba(255,255,255,.2)');
      glow(c, 700, 680, 420, '#ff4fa3', .08, 2);
      /* screens: waveform and EQ */
      c.strokeStyle = A('#5fe0ff', .9); c.lineWidth = 2; c.beginPath(); for (var i = 0; i < 52; i++) { var x = 566 + i * 4, y = 520 + Math.sin(i * .5 + t * 6) * 26 * Math.sin(i * .09 + t) * Math.sin(t * 2.2 + i * .2); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      for (i = 0; i < 16; i++) { var h = 8 + 60 * Math.abs(Math.sin(t * 3 + i * .8) * Math.sin(t * 1.7 + i)); rect(c, 1068 + i * 12.5, 576 - h, 9, h, A(i % 3 ? '#ff4fa3' : '#9a7bff', .85)); }
      /* faders and level meters */
      for (i = 0; i < 12; i++) { var fy = 680 + 18 + 14 * Math.sin(t * .6 + i * 1.7); rect(c, 464 + i * 44, fy, 16, 9, '#d8d0ee'); var lv = Math.abs(Math.sin(t * 5 + i * 1.1)) * 6 | 0; for (var k = 0; k < lv; k++) rect(c, 470 + i * 44, 666 - k * 5, 4, 3, k > 4 ? '#ff4040' : '#3dff8a'); }
      /* turntable */
      c.save(); c.translate(1260, 708); c.scale(1, .42); c.rotate(t * 3.5); c.fillStyle = '#05050a'; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; [20, 36, 52, 64].forEach(function (r) { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }); c.fillStyle = '#ff4fa3'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(8, -2, 56, 4); c.restore();
      c.strokeStyle = '#cfc6e8'; c.lineWidth = 4; c.beginPath(); c.moveTo(1400, 680); c.lineTo(1300, 716); c.stroke();
      /* boom mic */
      c.strokeStyle = '#15121f'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(1050, 0); c.lineTo(1010, 220); c.lineTo(hs.head[0] + 30, hs.head[1] + 22); c.stroke();
      c.fillStyle = '#0a0a10'; c.beginPath(); c.ellipse(hs.head[0] + 28, hs.head[1] + 28, 20, 13, .5, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.stroke();
      /* floating notes */
      c.font = '30px system-ui,sans-serif'; c.textAlign = 'center'; for (i = 0; i < 6; i++) { var u = ((t * .12 + i * .17) % 1), nx = 1100 + (i % 3) * 120 + Math.sin(t + i) * 20; c.fillStyle = A(['#ff4fa3', '#9a7bff', '#ffb36b'][i % 3], Math.sin(u * 3.14) * .55); c.fillText(i % 2 ? '♪' : '♫', nx, 560 - u * 360); }
      /* mug */
      rect(c, 1010, 672, 30, 30, '#f0e8ff'); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 3; for (i = 0; i < 2; i++) { c.beginPath(); c.moveTo(1020 + i * 10, 662); c.quadraticCurveTo(1014 + i * 10 + Math.sin(t * 2 + i) * 6, 644, 1022 + i * 10, 628); c.stroke(); }
    },
    front: function (c, t) {
      glow(c, 800, 0, 700, '#ff7ab0', .05);
    }
  };
});
})();
