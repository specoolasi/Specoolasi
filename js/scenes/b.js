/* Scenes 5-8: Dramories, Listenation, Gloome, Clippods.id */
(function () {
'use strict';

/* ============ Dramories: a dark cinema, a couple sharing popcorn at a rainy K-drama scene ============ */
SCENES.reg('dramories', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss, lerp = U.lerp, clamp = U.clamp;
  var SUB = ['Kamu masih ingat malam itu?', 'Aku nggak pernah lupa.', 'Jangan pergi dulu…', 'Hujannya belum reda.'];
  var SX = 330, SY = 80, SW = 940, SHH = 410, lamps = [], dust = [];
  U.rs(3); for (var i = 0; i < 46; i++) dust.push([U.rnd(), U.rnd(), U.rnd() * 6, .3 + U.rnd() * .7]);
  function walk(ph) { var a = .55 * Math.sin(ph); return [a, a - (.45 + .4 * Math.sin(ph + .9))]; }
  function row(c, y, s, n, shade) {
    for (var k = 0; k < n; k++) {
      var x = 150 + k * (1300 / (n - 1)), w = 80 * s;
      U.rr(c, x - w / 2, y, w, 90 * s, 14 * s); c.fillStyle = lg(c, 0, y, 0, y + 90 * s, [[0, '#3c1220'], [1, '#12050a']]); c.fill();
      c.strokeStyle = 'rgba(120,150,255,' + (.14 * shade) + ')'; c.lineWidth = 1.5; c.stroke();
      if (U.rnd() > .38) { var hx = x + (U.rnd() - .5) * 14 * s, hy = y - 8 * s; c.fillStyle = '#07040a'; c.beginPath(); c.arc(hx, hy, 17 * s, 0, 7); c.fill(); U.rr(c, hx - 30 * s, hy + 12 * s, 60 * s, 40 * s, 18 * s); c.fill(); c.strokeStyle = 'rgba(160,180,255,' + (.35 * shade) + ')'; c.beginPath(); c.arc(hx, hy, 17 * s, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    }
  }
  return {
    grade: 'rgba(10,0,30,.12)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 900, [[0, '#07081a'], [1, '#030308']]));
      /* curtains */
      [[0, 300], [1300, 300]].forEach(function (s) { rect(c, s[0], 0, s[1], 620, '#4a0c1a'); for (var i = 0; i < 12; i++) rect(c, s[0] + i * 25, 0, 14, 620, A('#000000', .18 + (i % 2) * .12)); rect(c, s[0], 0, s[1], 620, lg(c, 0, 0, 0, 620, [[0, 'rgba(0,0,0,.6)'], [.4, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']])); });
      rect(c, 0, 0, 1600, 54, '#0a0306'); rect(c, SX - 14, SY - 14, SW + 28, SHH + 28, '#020204');
      /* side sconces */
      [[120, 300], [1480, 300]].forEach(function (p) { glow(c, p[0], p[1], 120, '#ff9f4a', .55); rect(c, p[0] - 6, p[1] - 20, 12, 40, '#e8b070'); });
      /* floor + rows of seats and people */
      rect(c, 0, 520, 1600, 380, lg(c, 0, 520, 0, 900, [[0, '#120508'], [1, '#050203']]));
      U.rs(17); row(c, 540, .5, 18, 1); row(c, 590, .72, 15, .9); row(c, 668, 1, 12, .8);
      U.rs(5); for (var i = 0; i < 7; i++) { rect(c, 188 + i * 4, 560 + i * 18, 6, 6, '#ffb15a'); rect(c, 1408 - i * 4, 560 + i * 18, 6, 6, '#ffb15a'); }
    },
    live: function (c, t) {
      /* the film */
      c.save(); c.beginPath(); c.rect(SX, SY, SW, SHH); c.clip();
      var k = Math.sin(t * .2) * .5 + .5;
      c.fillStyle = lg(c, 0, SY, 0, SY + SHH, [[0, mixc('#101b44', '#2a1a52', k)], [.55, '#4a2c6a'], [1, '#1a1030']]); c.fillRect(SX, SY, SW, SHH);
      var sc = (t * 55) % 520;
      for (var i = -1; i < 4; i++) { var bx = SX + i * 330 - sc * .5; rect(c, bx, SY + 120, 180 + (i & 1) * 70, 300, '#0d0a22'); for (var w = 0; w < 14; w++) rect(c, bx + 14 + (w % 4) * 34, SY + 140 + ((w / 4) | 0) * 44, 12, 18, A(['#ffd48a', '#ff9cb8', '#8ad0ff'][w % 3], .55)); glow(c, bx + 100, SY + 250, 70, i & 1 ? '#ff4f9a' : '#33d6ff', .55); }
      [[-60, 30], [820, 18]].forEach(function (b, bi) { var cx = SX + b[0] + (bi ? 0 : 0); c.fillStyle = A('#ffb0c8', .55); for (var q = 0; q < 14; q++) { c.beginPath(); c.arc(cx + 70 + Math.cos(q * 2.1) * 80, SY + 40 + Math.sin(q * 1.7) * 60, 36, 0, 7); c.fill(); } });
      rect(c, SX, SY + 330, SW, 90, lg(c, 0, SY + 330, 0, SY + 420, [[0, '#1a1236'], [1, '#07050f']]));
      for (i = 0; i < 9; i++) { var lx = SX + 80 + i * 110 - ((t * 55) % 110); rect(c, lx, SY + 340, 3, 80, A('#ff9cb8', .22)); }
      /* couple under one umbrella */
      var px = SX + 470, ph = t * 4.2, ph2 = U.person(c, { x: px - 26, y: SY + 405, h: 150, view: 's', hair: 'long', hc: '#1a1210', top: '#ffd0e0', bottom: '#2a2f50', skin: U.SKIN.a, shadow: false, p: { lL: walk(ph), lR: walk(ph + 3.14), aL: [.2, .5], aR: [.3, .7], torso: .03 } });
      U.person(c, { x: px + 22, y: SY + 405, h: 165, view: 's', hair: 'short', hc: '#0f0b0a', top: '#1c2230', bottom: '#14172a', skin: U.SKIN.b, shadow: false, p: { lL: walk(ph + .3), lR: walk(ph + 3.4), aL: [.1, .3], aR: [.5, 1.9], torso: .02 } });
      c.fillStyle = '#c92a4a'; c.beginPath(); c.ellipse(px, SY + 250, 78, 32, 0, Math.PI, 0); c.fill(); rect(c, px - 1, SY + 250, 2, 100, '#2a1020');
      c.strokeStyle = 'rgba(190,210,255,.35)'; c.lineWidth = 1; for (i = 0; i < 70; i++) { var rx = SX + (i * 97 + t * 260) % SW, ry = SY + (i * 53 + t * 520) % SHH; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 4, ry + 16); c.stroke(); }
      c.fillStyle = A('#ffc4d6', .85); for (i = 0; i < 26; i++) { var fx = SX + ((i * 71 + t * 30) % SW), fy = SY + ((i * 41 + t * 38 + Math.sin(t + i) * 12) % SHH); c.beginPath(); c.ellipse(fx, fy, 3.5, 2.2, i, 0, 7); c.fill(); }
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 26px "Plus Jakarta Sans",system-ui,sans-serif'; var si = Math.floor(t / 4.5) % SUB.length, sa = Math.min(1, Math.sin((t % 4.5) / 4.5 * Math.PI) * 3);
      c.fillStyle = 'rgba(0,0,0,' + (.5 * sa) + ')'; c.fillText(SUB[si], 800 + 2, SY + 380 + 2); c.fillStyle = 'rgba(255,255,255,' + sa + ')'; c.fillText(SUB[si], 800, SY + 380);
      c.restore();
      /* light from the screen + projector beam with dust */
      var tint = k > .5 ? '#ff9cc4' : '#8fb4ff';
      glow(c, 800, 300, 760, tint, .2, 1.5); U.beam(c, 800, -20, 50, 800, 300, 980, '#cfe0ff', .07);
      dust.forEach(function (d) { var dx = 800 + (d[0] - .5) * (120 + d[1] * 800), dy = d[1] * 330 + Math.sin(t * .4 + d[2]) * 14; glow(c, dx + Math.sin(t * .3 + d[2]) * 22, dy, 7 + d[3] * 5, '#ffffff', .35 * d[3]); });
      /* the couple */
      var T = t % 14, laugh = ss((T - 3.3) / .3) * (1 - ss((T - 7) / .3)), cry = ss((T - 7.2) / .4) * (1 - ss((T - 10.5) / .4)), pop = 1 - laugh - cry; pop = clamp(pop, 0, 1);
      var shake = laugh * .018 * Math.sin(t * 24), bob = Math.sin(t * 8) * .5 + .5;
      var lit = { amb: 'rgba(5,4,20,.38)', keys: [{ c: tint, side: 0, a: 0 }], top: { c: tint, a: .5 } };
      U.person(c, { x: 680, y: 1010, hipAt: 945, h: 600, view: 'b', hair: 'long', hc: '#4a2a1c', top: '#e9e2ff', bottom: '#223', skin: U.SKIN.a, sleeve: 'long', shadow: false, rim: tint, rimSide: -1, lit: lit,
        p: { tilt: .1 * pop + .16 * cry - .1 * laugh, head: -.06 * laugh, dy: shake * 3, torso: shake, sway: .01 * Math.sin(t * 1.2), aL: [-.3, -.3], aR: [lerp(.8, .55, cry) + .12 * pop * bob, lerp(1.7, 2.9, cry) + .5 * pop * bob], hx: -.01 * cry } });
      U.person(c, { x: 930, y: 1010, hipAt: 945, h: 610, view: 'b', hair: 'short', hc: '#120c0b', top: '#2b3a55', bottom: '#223', skin: U.SKIN.b, sleeve: 'long', shadow: false, rim: tint, rimSide: 1, lit: lit,
        p: { tilt: -.08 * pop - .22 * cry + .12 * laugh, head: -.1 * laugh, dy: shake * 3, torso: shake - .05 * cry, hx: -.08 * cry, aL: [lerp(-.6, -.35, laugh), lerp(-1.2, -2.7, laugh)], aR: [.35 + .05 * bob * pop, .5] } });
      /* popcorn flying up when they laugh */
      if (laugh > .2) { U.rs(9); for (i = 0; i < 12; i++) { var u = ((t * 1.6 + U.rnd()) % 1), kx = 760 + U.rnd() * 170 + Math.sin(i + t * 2) * 12, ky = 830 - 150 * Math.sin(u * 3.14); c.fillStyle = A('#fff3c0', laugh * (1 - u * .4)); c.beginPath(); c.arc(kx, ky, 5 + U.rnd() * 3, 0, 7); c.fill(); } }
    },
    front: function (c, t) {
      [[540, 280], [790, 280]].forEach(function (s, i) {
        U.rr(c, s[0], 860, s[1], 120, 64); c.fillStyle = lg(c, 0, 860, 0, 980, [[0, '#5e1424'], [1, '#2a0810']]); c.fill();
        c.strokeStyle = 'rgba(170,190,255,.28)'; c.lineWidth = 2; c.beginPath(); c.moveTo(s[0] + 40, 862); c.lineTo(s[0] + s[1] - 40, 862); c.stroke();
        c.fillStyle = lg(c, s[0], 0, s[0] + s[1], 0, [[0, 'rgba(0,0,0,.25)'], [.5, 'rgba(255,255,255,.05)'], [1, 'rgba(0,0,0,.35)']]); c.fill();
      });
      rect(c, -40, 820, 230, 120, '#0a0306'); rect(c, 1410, 820, 230, 120, '#0a0306');
    }
  };
  function mixc(a, b, k) { return U.mc(a, b, k); }
});

/* ============ Listenation: main stage at night, DJ on the decks, crowd going wild ============ */
SCENES.reg('listenation', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss, lerp = U.lerp;
  var BEAT = .469, LAS = [], rowsFar = [], rowsMid = [], rowsNear = [], conf = [];
  U.rs(9); for (var i = 0; i < 9; i++) LAS.push(260 + i * 135);
  function mk(arr, n, y, h, jit) { for (var k = 0; k < n; k++) arr.push({ x: (k + .5) * (1700 / n) - 50 + (U.rnd() - .5) * jit, y: y + U.rnd() * 14, h: h * (.85 + U.rnd() * .3), ph: U.rnd() * 6, lit: U.rnd() > .86 }); }
  mk(rowsFar, 38, 640, 100, 18); mk(rowsMid, 22, 730, 160, 40); mk(rowsNear, 12, 900, 210, 80);
  var hot = ['#ff2bd6', '#33d6ff', '#7c5cff', '#b8ff3d', '#ff4f6a'];
  return {
    grade: 'rgba(20,0,50,.1)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 900, [[0, '#04020f'], [.6, '#120640'], [1, '#07031c']]));
      U.rs(2); for (var i = 0; i < 160; i++) { c.fillStyle = 'rgba(255,255,255,' + (.2 + U.rnd() * .6) + ')'; c.fillRect(U.rnd() * 1600, U.rnd() * 140, 1.5, 1.5); }
      rect(c, 0, 0, 1600, 70, '#05040c'); for (i = 0; i < 40; i++) { c.strokeStyle = 'rgba(120,120,160,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(i * 42, 8); c.lineTo(i * 42 + 21, 60); c.lineTo(i * 42 + 42, 8); c.stroke(); } rect(c, 0, 8, 1600, 4, '#222236'); rect(c, 0, 58, 1600, 4, '#222236');
      rect(c, 246, 84, 1108, 396, '#020208'); rect(c, 120, 100, 100, 380, '#020208'); rect(c, 1380, 100, 100, 380, '#020208');
      rect(c, 0, 480, 1600, 420, lg(c, 0, 480, 0, 900, [[0, '#10062c'], [1, '#04010c']]));
      rect(c, 120, 480, 1360, 5, '#7c5cff'); glow(c, 800, 482, 700, '#7c5cff', .22, 2.4);
      rect(c, 560, 520, 480, 100, '#07050f'); rect(c, 560, 506, 480, 16, '#1a1230');
    },
    live: function (c, t) {
      var T = t % 16, drop = T > 8 && T < 12, bt = t / BEAT, pulse = Math.pow(1 - (bt % 1), 3), hue = (t * 14) % 360;
      /* LED wall */
      c.save(); c.beginPath(); c.rect(256, 94, 1088, 376); c.clip();
      c.fillStyle = lg(c, 256, 0, 1344, 0, [[0, 'hsl(' + hue + ',90%,32%)'], [.5, 'hsl(' + (hue + 70) + ',95%,40%)'], [1, 'hsl(' + (hue + 140) + ',90%,30%)']]); c.fillRect(256, 94, 1088, 376);
      for (var i = 0; i < 34; i++) { var h = 30 + 280 * Math.abs(Math.sin(t * 2.2 + i * .55) * Math.sin(t * 1.1 + i * .21)) * (drop ? 1 : .7); rect(c, 266 + i * 31.8, 470 - h, 24, h, A('#ffffff', .22 + pulse * .2)); }
      c.strokeStyle = A('#ffffff', .75); c.lineWidth = 5; for (i = 0; i < 4; i++) { c.beginPath(); c.arc(800, 300, 50 + i * 40 + pulse * 30 + (drop ? 30 : 0), 0, 7); c.globalAlpha = .8 - i * .18; c.stroke(); } c.globalAlpha = 1;
      U.glowText(c, 'LISTENATION', 800, 300, '800 66px "Plus Jakarta Sans",system-ui,sans-serif', '#ffffff', 22, .95);
      c.restore();
      [[120, 1], [1380, 1]].forEach(function (p) { for (var r = 0; r < 14; r++) rect(c, p[0] + 4, 106 + r * 26, 92, 18, 'hsla(' + (hue + r * 20 + (p[0] > 800 ? 90 : 0)) + ',95%,' + (35 + 25 * Math.abs(Math.sin(t * 3 + r))) + '%,.9)'); });
      glow(c, 800, 300, 900, 'hsl(' + hue + ',90%,55%)', .22, 1.4);
      /* lasers */
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      LAS.forEach(function (x, i) {
        var col = hot[(i + (drop ? Math.floor(t * 4) : 0)) % 5], n = drop ? 7 : 4;
        for (var k = 0; k < n; k++) { var a = Math.sin(t * (drop ? 1.6 : .7) + i * .8) * .55 + (k - n / 2) * (.16 + .05 * Math.sin(t + i)); c.strokeStyle = A(col, drop ? .7 : .5); c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, 64); c.lineTo(x + Math.sin(a) * 1500, 64 + Math.cos(a) * 1500); c.stroke(); }
        U.beam(c, x, 64, 24, x + Math.sin(Math.sin(t * .7 + i * .8) * .55) * 700, 640, 260, col, .1); glow(c, x, 66, 30, col, .9);
      });
      c.restore();
      /* haze + far crowd */
      glow(c, 800, 600, 900, '#6a3cff', .14, 2); glow(c, 400, 560, 500, '#ff2bd6', .08, 2); glow(c, 1200, 560, 500, '#33d6ff', .09, 2);
      rowsFar.forEach(function (p) { U.sil(c, p.x, p.y, p.h, '#0a0620', '#7c5cff', 1 + (drop ? 1 : 0), t * (drop ? 1.3 : 1), p.ph, p.lit ? '#ffffff' : null); });
      /* DJ booth + DJ */
      var arm = drop ? { aL: [-2.7, -2.9], aR: [2.7, 2.9] } : { aL: [-.45 + .12 * Math.sin(bt * 3.14), -.1 + .2 * Math.sin(bt * 3.14)], aR: [.45 - .12 * Math.sin(bt * 3.14 + 1.6), .1 - .2 * Math.sin(bt * 3.14 + 1.6)] };
      U.person(c, { x: 800, y: 620, hipAt: 604, h: 440, view: 'f', hair: 'short', hc: '#120d10', skin: U.SKIN.c, top: '#15121f', bottom: '#111', hp: 1, sleeve: 'long', shadow: false, rim: '#9a7bff', rimSide: -1,
        p: { aL: arm.aL, aR: arm.aR, dy: -.012 * pulse, head: .08 * Math.sin(bt * 3.14), mouth: drop ? .9 : 0, torso: .02 * Math.sin(bt * 3.14), lL: [-.05, 0], lR: [.05, 0] }, lit: { amb: 'rgba(8,2,30,.35)', keys: [{ c: '#7c5cff', side: 1, a: .45 }, { c: '#33d6ff', side: -1, a: .4 }], top: { c: '#ffffff', a: .2 } } });
      rect(c, 560, 506, 480, 16, '#1a1230'); rect(c, 560, 520, 480, 100, '#07050f');
      for (var cx = 0; cx < 16; cx++) for (var cy = 0; cy < 3; cy++) rect(c, 572 + cx * 29.5, 532 + cy * 28, 24, 22, 'hsla(' + (hue + cx * 12 + cy * 40) + ',95%,' + (25 + 40 * Math.abs(Math.sin(t * 4 + cx * .7 + cy))) + '%,.95)');
      [680, 920].forEach(function (x) { c.fillStyle = '#05050a'; c.beginPath(); c.ellipse(x, 512, 62, 12, 0, 0, 7); c.fill(); glow(c, x, 512, 70, '#33d6ff', .5, 1.5); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 512); c.lineTo(x + Math.cos(t * 5 + x) * 55, 512 + Math.sin(t * 5 + x) * 10); c.stroke(); });
      /* fire columns on the drop */
      if (drop) [520, 1080].forEach(function (x, i) { for (var k = 0; k < 7; k++) { var f = (t * 3 + k * .7 + i) % 1; glow(c, x + Math.sin(t * 9 + k) * 16, 480 - f * 190, 54 * (1 - f * .5), k % 2 ? '#ff9a2a' : '#ff4a1a', .75 * (1 - f)); } });
      rowsMid.forEach(function (p) { U.sil(c, p.x, p.y, p.h, '#070416', '#7c5cff', 1 + (drop ? 1 : 0), t * (drop ? 1.3 : 1), p.ph, p.lit ? '#9affff' : null); });
      /* confetti */
      if (drop) { U.rs(77); for (i = 0; i < 90; i++) { var u = (t * .4 + U.rnd()) % 1, x = 100 + U.rnd() * 1400 + Math.sin(t * 3 + i) * 20; c.fillStyle = A(hot[i % 5], 1 - u); c.save(); c.translate(x, 60 + u * 700); c.rotate(t * 5 + i); c.fillRect(-4, -2, 8, 4); c.restore(); } }
      /* strobe */
      if (drop && Math.floor(t * 12) % 2 === 0) { c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, 0, 1600, 900); }
    },
    front: function (c, t) {
      var T = t % 16, drop = T > 8 && T < 12;
      rowsNear.forEach(function (p) { U.sil(c, p.x, p.y, p.h, '#04020c', '#33d6ff', 1 + (drop ? 1 : 0), t * (drop ? 1.3 : 1), p.ph, p.lit ? '#ffffff' : null); });
      c.fillStyle = lg(c, 0, 760, 0, 900, [[0, 'rgba(4,2,12,0)'], [1, 'rgba(4,2,12,.8)']]); c.fillRect(0, 760, 1600, 140);
    }
  };
});

/* ============ Gloome: quiet rainy night, someone writing in a journal by the window ============ */
SCENES.reg('gloome', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss, clamp = U.clamp;
  var WX = 120, WY = 80, WW = 880, WH = 560, drops = [], runs = [], bulbs = [];
  var Q = ['Some nights are just quiet.', 'It’s okay to not be okay.', 'Still here. Still trying.', 'Rest is not quitting.'];
  U.rs(4); for (var i = 0; i < 70; i++) drops.push([U.rnd(), U.rnd(), .4 + U.rnd(), 1 + U.rnd() * 3]);
  for (i = 0; i < 9; i++) runs.push([U.rnd(), U.rnd(), .02 + U.rnd() * .05]);
  for (i = 0; i < 16; i++) bulbs.push([WX + 20 + i * 56, WY - 22 + Math.sin(i / 15 * 3.14) * 4 + (i % 2) * 8, U.rnd() * 6]);
  return {
    grade: 'rgba(8,10,40,.14)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, lg(c, 0, 0, 0, 900, [[0, '#0a0c18'], [1, '#141830']]));
      /* outside: blurred city */
      rect(c, WX, WY, WW, WH, lg(c, 0, WY, 0, WY + WH, [[0, '#070a1c'], [.6, '#18223f'], [1, '#2a3050']]));
      c.save(); c.beginPath(); c.rect(WX, WY, WW, WH); c.clip();
      U.rs(8); c.shadowBlur = 40; for (var i = 0; i < 16; i++) { var bx = WX + i * 60 - 10, bh = 120 + U.rnd() * 220; c.shadowColor = '#18204a'; c.fillStyle = '#0d1230'; c.fillRect(bx, WY + WH - bh - 40, 50 + U.rnd() * 30, bh + 60); } c.shadowBlur = 0;
      for (i = 0; i < 90; i++) { var col = ['#ffcf7a', '#ff8a5b', '#8ab4ff', '#ffffff', '#ff4a5a', '#ffe9a8'][(U.rnd() * 6) | 0], r = 8 + U.rnd() * 30, x = WX + U.rnd() * WW, y = WY + 180 + U.rnd() * 330; c.fillStyle = rg(c, x, y, 0, r, [[0, A(col, .55)], [.7, A(col, .25)], [1, A(col, 0)]]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
      c.restore();
      rect(c, WX, WY + WH - 150, WW, 150, lg(c, 0, WY + WH - 150, 0, WY + WH, [[0, 'rgba(180,200,255,0)'], [1, 'rgba(180,200,255,.22)']]));
      U.poly(c, [[WX + 80, WY], [WX + 220, WY], [WX + 20, WY + WH], [WX, WY + WH]], 'rgba(255,255,255,.04)');
      /* frame */
      var fr = '#161320'; rect(c, WX - 26, WY - 26, WW + 52, 26, fr); rect(c, WX - 26, WY + WH, WW + 52, 34, '#201b2c'); rect(c, WX - 26, WY - 26, 26, WH + 60, fr); rect(c, WX + WW, WY - 26, 26, WH + 60, fr); rect(c, WX + WW / 2 - 8, WY, 16, WH, fr);
      /* polaroids */
      for (i = 0; i < 6; i++) { c.save(); c.translate(1230 + (i % 3) * 100, 150 + ((i / 3) | 0) * 130); c.rotate((i - 2.5) * .04); rect(c, 0, 0, 74, 88, '#d8d2c6'); rect(c, 6, 6, 62, 62, ['#46507a', '#7a5a46', '#3c5a58', '#6a4a6a', '#58607a', '#7a6a46'][i]); rect(c, 28, -6, 18, 10, 'rgba(255,230,160,.6)'); c.restore(); }
      /* plant */
      [[90, 560, -.9], [110, 540, -.3], [130, 560, .3], [70, 570, -1.3]].forEach(function (l) { c.save(); c.translate(l[0], l[1] + 60); c.rotate(l[2]); c.fillStyle = lg(c, 0, -150, 0, 0, [[0, '#2f5a45'], [1, '#12281f']]); c.beginPath(); c.ellipse(0, -80, 34, 90, 0, 0, 7); c.fill(); c.restore(); });
      U.rr(c, 40, 640, 120, 100, 14); c.fillStyle = '#3a2a2a'; c.fill();
      /* desk */
      rect(c, 0, 690, 1600, 210, lg(c, 0, 690, 0, 900, [[0, '#3a2a26'], [.15, '#2a1d1b'], [1, '#0e0a0c']])); rect(c, 0, 688, 1600, 4, 'rgba(255,220,180,.25)');
      /* books + chair back */
      ['#4a3a5a', '#3a4a5a', '#5a4a3a'].forEach(function (b, k) { rect(c, 800, 668 - k * 22, 150 - k * 14, 22, b); });
      U.rr(c, 1190, 520, 120, 400, 40); c.fillStyle = '#12101a'; c.fill();
    },
    live: function (c, t) {
      /* fairy lights */
      c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; c.beginPath(); bulbs.forEach(function (b, i) { i ? c.lineTo(b[0], b[1]) : c.moveTo(b[0], b[1]); }); c.stroke();
      bulbs.forEach(function (b) { glow(c, b[0], b[1] + 6, 34, '#ffc878', .6 + .3 * Math.sin(t * 1.4 + b[2])); });
      /* rain on the glass */
      c.save(); c.beginPath(); c.rect(WX, WY, WW, WH); c.clip();
      var fl = (t % 13) > 12.75 ? .22 : 0; if (fl) { c.fillStyle = 'rgba(170,190,255,' + fl + ')'; c.fillRect(WX, WY, WW, WH); }
      c.strokeStyle = 'rgba(190,210,255,.28)'; c.lineWidth = 1.4; drops.forEach(function (d) { var y = WY + ((d[1] + t * .7 * d[2]) % 1) * (WH + 60) - 30, x = WX + d[0] * WW; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 14 + d[3] * 8); c.stroke(); });
      drops.forEach(function (d, i) { if (i % 2) return; var x = WX + ((d[0] * 7.3) % 1) * WW, y = WY + ((d[1] * 5.1) % 1) * WH; c.fillStyle = rg(c, x - 1, y - 1, 0, 6 + d[3], [[0, 'rgba(255,255,255,.55)'], [.5, 'rgba(160,190,255,.2)'], [1, 'rgba(160,190,255,0)']]); c.beginPath(); c.arc(x, y, 5 + d[3], 0, 7); c.fill(); });
      runs.forEach(function (r) { var x = WX + r[0] * WW, y = WY + ((r[1] + t * r[2]) % 1) * WH; c.strokeStyle = 'rgba(200,220,255,.22)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x + Math.sin(y * .05) * 3, y); c.stroke(); c.fillStyle = 'rgba(210,225,255,.45)'; c.beginPath(); c.arc(x + Math.sin(y * .05) * 3, y, 3.4, 0, 7); c.fill(); });
      var qi = Math.floor(t / 10) % Q.length, qa = Math.min(1, Math.sin((t % 10) / 10 * Math.PI) * 2.5) * .5;
      c.font = '700 54px Caveat,cursive'; c.textAlign = 'center'; c.fillStyle = 'rgba(235,240,255,' + qa + ')'; c.fillText(Q[qi], WX + WW / 2 + 110, WY + WH - 70); c.restore();
      /* lamp */
      U.beam(c, 1360, 500, 30, 1130, 700, 520, '#ffb866', .1); glow(c, 1130, 700, 420, '#ff9f4a', .22, 1.7); glow(c, 1360, 496, 90, '#ffd9a0', .95);
      c.strokeStyle = '#08070c'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(1470, 692); c.lineTo(1430, 600); c.lineTo(1368, 505); c.stroke(); c.fillStyle = '#0b0a10'; c.beginPath(); c.moveTo(1330, 508); c.lineTo(1392, 490); c.lineTo(1378, 530); c.closePath(); c.fill();
      /* notebook + ink */
      U.poly(c, [[930, 700], [1070, 700], [1090, 745], [915, 745]], '#e9e1cf'); U.poly(c, [[930, 700], [1070, 700], [1090, 745], [915, 745]], 'rgba(255,200,130,.2)');
      var L = (t * 34) % 540; c.strokeStyle = 'rgba(30,25,50,.8)'; c.lineWidth = 1.3;
      for (var k = 0; k < 5; k++) { var len = clamp(L - k * 100, 0, 100); if (len <= 0) break; var yy = 708 + k * 7; c.beginPath(); c.moveTo(936 + k * 3, yy); for (var s = 0; s < len; s += 4) c.lineTo(936 + k * 3 + s, yy + Math.sin(s * .9) * 1.6 - (s % 12 < 4 ? 1 : 0)); c.stroke(); }
      /* the writer: writes, looks out at the rain, sips tea */
      var T = t % 14, look = ss((T - 6) / .6) * (1 - ss((T - 8.2) / .6)), sip = ss((T - 9.5) / .6) * (1 - ss((T - 12) / .6)), wr = 1 - look - sip, sc = Math.sin(t * 13);
      U.person(c, { x: 1150, y: 900, hipAt: 790, h: 560, view: 's', flip: true, hair: 'bun', hc: '#2a1a1e', skin: U.SKIN.a, top: '#6b6a9c', bottom: '#222a44', sleeve: 'long', shadow: false, rimSide: -1, rim: '#ffb866',
        p: { torso: .2 * wr + .05 * look + .08 * sip, head: .26 * wr - .14 * look + .1 * sip, tilt: 0, mouth: 0, dy: .004 * Math.sin(t * .8), aL: [.38 + .02 * Math.sin(t * .5), 1.18 + .05 * sc * wr], aR: [.5 * wr + .45 * sip + .4 * look, 1.1 * wr + 2.1 * sip + .9 * look], lL: [1.5, .1], lR: [1.45, .15] },
        lit: { amb: 'rgba(6,6,30,.34)', keys: [{ c: '#ffb866', side: 1, a: .55 }, { c: '#7a9cff', side: -1, a: .22 }] } });
      /* mug and steam */
      rect(c, 1010, 650, 38, 40, '#d9d0e6'); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; for (var j = 0; j < 3; j++) { c.beginPath(); c.moveTo(1020 + j * 9, 644); c.quadraticCurveTo(1012 + j * 9 + Math.sin(t * 1.7 + j) * 7, 620, 1022 + j * 9, 596); c.stroke(); }
    },
    front: function (c, t) {
      c.fillStyle = lg(c, 0, 0, 0, 900, [[0, 'rgba(0,0,10,.25)'], [.4, 'rgba(0,0,10,0)'], [1, 'rgba(0,0,10,.35)']]); c.fillRect(0, 0, 1600, 900);
    }
  };
});

/* ============ Clippods.id: podcast studio, two people deep in conversation ============ */
SCENES.reg('clippods-id', function (U) {
  var A = U.A, lg = U.lg, rg = U.rg, rect = U.rect, glow = U.glow, ss = U.ss;
  return {
    grade: 'rgba(40,10,0,.08)',
    bg: function (c) {
      rect(c, 0, 0, 1600, 900, '#1a0f0e');
      /* brick wall */
      U.rs(6); for (var r = 0; r < 20; r++) for (var q = -1; q < 12; q++) { var x = q * 70 + (r & 1) * 35, y = r * 26; rect(c, x + 1, y + 1, 68, 24, U.mc('#6a2a22', '#3a1612', U.rnd())); }
      rect(c, 0, 0, 820, 640, lg(c, 0, 0, 0, 640, [[0, 'rgba(0,0,0,.55)'], [.5, 'rgba(0,0,0,.15)'], [1, 'rgba(0,0,0,.6)']]));
      /* wood slats */
      for (i = 0; i < 28; i++) rect(c, 820 + i * 28, 0, 26, 640, lg(c, 0, 0, 0, 640, [[0, U.sh('#8a5a34', .45)], [1, U.sh('#8a5a34', .8)]])); rect(c, 820, 0, 780, 640, 'rgba(0,0,0,.2)');
      for (var i = 0; i < 3; i++) { U.rr(c, 90, 150 + i * 150, 160, 120, 10); c.fillStyle = ['#1f7a8c', '#c98a2b', '#7a3a5a'][i]; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 3; c.stroke(); for (var k = 1; k < 4; k++) rect(c, 90 + k * 40, 150 + i * 150, 2, 120, 'rgba(0,0,0,.25)'); }
      /* shelves */
      [250, 400].forEach(function (y) { rect(c, 1200, y, 300, 12, '#2a1a12'); });
      for (i = 0; i < 6; i++) rect(c, 1214 + i * 14, 188 + (i % 2) * 6, 11, 62 - (i % 2) * 6, ['#c0392b', '#2b6fe0', '#e8c26a', '#3a8a5a', '#7a4a9a', '#e8e0d0'][i]);
      c.fillStyle = '#2e6b46'; [[1380, 330], [1420, 320], [1400, 300]].forEach(function (l) { c.beginPath(); c.ellipse(l[0], l[1] + 20, 14, 52, (l[0] - 1400) * .02, 0, 7); c.fill(); }); U.rr(c, 1370, 356, 60, 44, 8); c.fillStyle = '#a65a3a'; c.fill();
      rect(c, 1260, 352, 18, 48, '#e6c35a'); c.fillStyle = '#e6c35a'; c.beginPath(); c.arc(1269, 346, 14, 0, 7); c.fill();
      U.rr(c, 1330, 360, 24, 40, 4); c.fillStyle = '#1b1b24'; c.fill();
      /* floor + rug */
      U.floorWood(c, 640, 800, 300, '#6a4128', 14, 140); rect(c, 0, 638, 1600, 12, lg(c, 0, 638, 0, 650, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]));
      c.fillStyle = '#7a2a2a'; c.beginPath(); c.ellipse(800, 820, 520, 90, 0, 0, 7); c.fill(); c.strokeStyle = '#e0b87a'; c.lineWidth = 4; c.beginPath(); c.ellipse(800, 820, 490, 76, 0, 0, 7); c.stroke(); c.strokeStyle = 'rgba(224,184,122,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(800, 820, 420, 62, 0, 0, 7); c.stroke();
      /* chair backs */
      U.rr(c, 360, 440, 270, 400, 60); c.fillStyle = lg(c, 360, 0, 630, 0, [[0, '#b97a22'], [1, '#6a420f']]); c.fill();
      U.rr(c, 970, 440, 270, 400, 60); c.fillStyle = lg(c, 970, 0, 1240, 0, [[0, '#1a6a7c'], [1, '#0d3a46']]); c.fill();
    },
    live: function (c, t) {
      /* neon */
      var fl = Math.sin(t * 31) > .985 ? .35 : 1;
      U.glowText(c, 'CLIPPODS', 800, 150, '800 78px "Plus Jakarta Sans",system-ui,sans-serif', '#ff2b3a', 30, fl);
      c.strokeStyle = '#2b6bff'; c.shadowColor = '#2b6bff'; c.shadowBlur = 20; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (var i = 0; i <= 40; i++) { var x = 620 + i * 9.5, y = 226 + Math.sin(i * .6 + t * 4) * 12 * Math.sin(i / 40 * 3.14) * (.6 + .4 * Math.sin(t * 2.3 + i * .2)); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.shadowBlur = 0;
      glow(c, 800, 200, 520, '#ff2b3a', .12, 1.6);
      /* pendant lamps */
      [300, 800, 1300].forEach(function (x) { c.strokeStyle = '#0a0706'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 330 + (x === 800 ? 40 : 0)); c.stroke(); var ly = 330 + (x === 800 ? 40 : 0); c.fillStyle = '#16100e'; c.beginPath(); c.moveTo(x - 46, ly + 36); c.lineTo(x + 46, ly + 36); c.lineTo(x + 18, ly); c.lineTo(x - 18, ly); c.closePath(); c.fill(); glow(c, x, ly + 40, 150, '#ffb870', .8); U.beam(c, x, ly + 36, 80, x, 800, 480, '#ffb870', .13); });
      /* table */
      c.fillStyle = '#7a5230'; c.beginPath(); c.ellipse(800, 762, 190, 44, 0, 0, 7); c.fill(); c.fillStyle = lg(c, 0, 716, 0, 770, [[0, '#d6a56c'], [1, '#a87444']]); c.beginPath(); c.ellipse(800, 748, 190, 40, 0, 0, 7); c.fill(); rect(c, 790, 780, 20, 60, '#1a110c');
      rect(c, 700, 726, 26, 22, '#f0e8da'); rect(c, 876, 728, 26, 22, '#e8c0a0'); U.rr(c, 778, 742, 36, 14, 3); c.fillStyle = '#15151c'; c.fill();
      /* speaker alternates */
      var T = t % 10, hostTalks = T < 5, pa = Math.abs(Math.sin(t * 9)) * .9, laugh = Math.sin(t * 20);
      function rim(col) { return { amb: 'rgba(30,10,0,.22)', keys: [{ c: '#ffb870', side: 0, a: 0 }, { c: col, side: 1, a: .3 }], top: { c: '#ffd9a8', a: .3 } }; }
      var hp = hostTalks ? { mouth: pa, torso: .1, head: .04 * Math.sin(t * 2), aL: [.9, 1.9], aR: [.8 + .35 * Math.sin(t * 3), 1.5 + .6 * Math.sin(t * 4)], lL: [1.45, .12], lR: [1.5, .08] }
        : { mouth: 0, torso: -.04 + .01 * Math.sin(t * 3), head: .06 * Math.sin(t * 2.4) + .03, aL: [.4, 1.3], aR: [.5, 1.6], lL: [1.45, .12], lR: [1.5, .08] };
      var gp = !hostTalks ? { mouth: pa, torso: .1, head: .04 * Math.sin(t * 2), aL: [.9, 1.9], aR: [.8 + .35 * Math.sin(t * 3.3), 1.5 + .6 * Math.sin(t * 3.9)], lL: [1.45, .12], lR: [1.5, .08] }
        : { mouth: .5 + .4 * laugh * ((T % 5) > 2.5), torso: -.15 + .03 * laugh * ((T % 5) > 2.5), head: -.12, aL: [.7, 2.6], aR: [.5, 1.5], dy: .006 * laugh * ((T % 5) > 2.5), lL: [1.45, .12], lR: [1.5, .08] };
      U.person(c, { x: 520, y: 868, h: 540, view: 's', hair: 'short', hc: '#12100e', skin: U.SKIN.b, top: '#f0ece4', bottom: '#2a3a5a', sleeve: 'short', shoe: '#c9c2b4', shadow: false, p: hp, rim: '#ffb870', rimSide: -1, lit: rim('#2b6bff') });
      U.person(c, { x: 1080, y: 868, h: 520, view: 's', flip: true, hair: 'long', hc: '#2a1a14', skin: U.SKIN.c, top: '#d9a066', bottom: '#222633', sleeve: 'long', shoe: '#1a1a22', shadow: false, p: gp, rim: '#ffb870', rimSide: -1, lit: rim('#ff2b3a') });
      /* chair seats and arms in front of the people */
      [[360, 270, '#c98a2b'], [970, 270, '#1f8a9c']].forEach(function (s) { U.rr(c, s[0] - 10, 770, s[1] + 20, 110, 30); c.fillStyle = lg(c, 0, 770, 0, 880, [[0, s[2]], [1, U.sh(s[2], .4)]]); c.fill(); });
    },
    front: function (c, t) {
      /* boom mics from the ceiling */
      c.strokeStyle = '#08070a'; c.lineWidth = 9; c.lineCap = 'round'; [[[440, 0], [520, 280], [690, 560]], [[1160, 0], [1090, 280], [910, 560]]].forEach(function (p) { c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]); c.lineTo(p[2][0], p[2][1]); c.stroke(); c.fillStyle = '#0d0c10'; c.beginPath(); c.ellipse(p[2][0], p[2][1] + 8, 24, 36, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#08070a'; c.lineWidth = 9; });
      /* camera on a tripod, red tally light */
      c.strokeStyle = '#05050a'; c.lineWidth = 8; [[1380, 905], [1470, 910], [1555, 900]].forEach(function (f) { c.beginPath(); c.moveTo(1470, 740); c.lineTo(f[0], f[1]); c.stroke(); });
      U.rr(c, 1380, 610, 190, 140, 18); c.fillStyle = lg(c, 0, 610, 0, 750, [[0, '#262630'], [1, '#09090e']]); c.fill(); U.rr(c, 1330, 640, 70, 80, 10); c.fillStyle = '#0c0c12'; c.fill(); c.fillStyle = rg(c, 1338, 680, 3, 30, [[0, '#4a68b8'], [.5, '#10183a'], [1, '#05070f']]); c.beginPath(); c.ellipse(1338, 680, 14, 32, 0, 0, 7); c.fill();
      var on = Math.sin(t * 3) > -.2; c.fillStyle = on ? '#ff2b2b' : '#4a1010'; c.beginPath(); c.arc(1540, 630, 6, 0, 7); c.fill(); if (on) glow(c, 1540, 630, 44, '#ff2b2b', .8);
      /* REC pill */
      var secs = (2537 + Math.floor(t)) | 0, mm = ('0' + ((secs / 60) | 0) % 60).slice(-2), ss2 = ('0' + (secs % 60)).slice(-2);
      U.rr(c, 70, 50, 200, 46, 23); c.fillStyle = 'rgba(8,6,10,.6)'; c.fill(); c.fillStyle = on ? '#ff3b3b' : '#6a1a1a'; c.beginPath(); c.arc(100, 73, 8, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.font = '700 20px "Space Mono",monospace'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('REC  00:' + mm + ':' + ss2, 120, 74);
    }
  };
});
})();
