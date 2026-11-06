// "STEP ON THE KEYS": a giant grand-piano keyboard seen from far above, with tiny people walking on it and playing it.
// Mounted at the very bottom of the music production page by js/musicshop.js.  KeysStage.mount(element)
// Mouse / finger: tap a key and someone runs over to press it. Sound is off until the visitor switches it on.
//
// This version uses a real perspective camera (pulled far back, long lens) instead of a flat tilted drawing:
//   world units: 1 = the width of one white key.  x runs along the keys, y is up, z runs toward the viewer.
//   The scene is: wooden stage floor, the piano body with its glossy fallboard, ivory keys, gloss-black keys,
//   soft shadows from one light (upper back-right), and people built from simple 3D parts so they walk,
//   climb onto the keys, and bounce in time with the music.
(function () {
  var KL = 6.2;                              // white key length
  var BH = 1.0;                              // height of the piano body above the stage floor
  var FRONT = .5;                            // height of the front face of a white key
  var BKW = .58, BKT = .43, BKL = 3.7, BKH = .62;   // black key: base width, top width, length, height
  var WALL = 3.9;                            // height of the fallboard (the black panel behind the keys)
  var YAW = .15, PITCH = .93, DIST = 46;     // camera: turned a little, looking down ~53 degrees, far away
  var LX = .5, LZ = -.35;                    // light from upper back-right: a shadow falls to the left and toward the viewer
  // ---- the song: a slow lo-fi loop in A minor (Am7 - Fmaj7 - Cmaj7 - G6), 8 bars, only white keys.
  //      Notes are white-key steps counted from middle C (C4 = 0, D4 = 1 ... C5 = 7, A3 = -2).
  var BPM = 72, LOOP = 32, SWING = .1, MAJ = [0, 2, 4, 5, 7, 9, 11];
  var CH = [{ b: -9, v: [-2, 0, 2, 4] }, { b: -11, v: [-2, 0, 2, 3] }, { b: -7, v: [0, 2, 4, 6] }, { b: -10, v: [-1, 1, 2, 4] }];
  var MEL = [[[0, 9, 1.5], [2, 7, .5], [2.5, 9, .5], [3, 11, 1]], [[0, 10, 1.5], [2, 9, 1], [3, 7, 1]], [[0, 9, 1], [1.5, 11, .5], [2, 11, 1], [3, 9, 1]], [[0, 8, 1.5], [2, 9, .5], [2.5, 8, .5], [3, 7, 1]],
    [[.5, 7, .5], [1, 9, 1], [2.5, 12, .5], [3, 11, 1]], [[0, 12, 1], [1, 10, 1], [2, 9, 2]], [[0, 11, 1.5], [2, 9, .5], [2.5, 7, .5], [3, 9, 1]], [[0, 9, 1], [1, 8, 1], [2, 7, 2]]];
  var ARP = [[.5, 0], [1, 1], [1.5, 2], [2.5, 3], [3, 2], [3.5, 1]];
  function midiOf(d) { return 60 + 12 * Math.floor(d / 7) + MAJ[((d % 7) + 7) % 7]; }
  function buildSong() {
    var ev = [];
    function add(b, k, d, dur, v) { if (b % 1 === .5) b += SWING; ev.push({ b: b, k: k, d: d, dur: dur, v: v }); }
    for (var bar = 0; bar < 8; bar++) {
      var c = CH[bar % 4], t = bar * 4;
      add(t, 'p', c.b, 2, .85); add(t + 2, 'p', c.b + 4, 1.5, .6);
      ARP.forEach(function (a) { add(t + a[0], 'p', c.v[a[1]], .6, .42 + Math.random() * .08); });
      MEL[bar].forEach(function (m) { add(t + m[0], 'p', m[1], m[2], .8); });
      add(t, 'kick', 0, 0, .9); add(t + 2.5, 'kick', 0, 0, .7); add(t + 1, 'snare', 0, 0, .8); add(t + 3, 'snare', 0, 0, .8);
      for (var h = 0; h < 8; h++) add(t + h * .5, 'hat', 0, 0, h % 2 ? .45 : .8);
    }
    return ev.sort(function (a, b) { return a.b - b.b; });
  }
  var SKIN = ['#8d5a3c', '#c68642', '#f1c27d', '#5a3825', '#ffdbac', '#a8693f'];
  var SHIRT = ['#f2c230', '#2bb39b', '#3aa66b', '#5b7fe0', '#f08a3c', '#6c4dff', '#e85d75', '#4aa3df'];
  var PANTS = ['#2f3d73', '#3b4a7a', '#27345f', '#4a3f6b', '#3a3a42', '#5b4a3a'];
  var HAIR = ['#1c1410', '#3a2415', '#0f0f14', '#6b3f1e'];
  var IVORY = ['#f9f5ea', '#f6f1e3', '#fbf8ef', '#f4eedd'];
  var BLACK_AFTER = [1, 1, 0, 1, 1, 1, 0];   // black key after C D _ F G A _

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function shade(h, f, a) { // f < 1 darkens, f > 1 lightens toward white
    var c = hex(h), r = [];
    for (var i = 0; i < 3; i++) r[i] = Math.round(f < 1 ? c[i] * f : c[i] + (255 - c[i]) * (f - 1));
    return a == null ? 'rgb(' + r + ')' : 'rgba(' + r + ',' + a + ')';
  }
  function seeded(n) { return function () { n |= 0; n = n + 0x6D2B79F5 | 0; var t = Math.imul(n ^ n >>> 15, 1 | n); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function mount(host) {
    if (!host || host._ks) return; host._ks = true;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    host.innerHTML = '<canvas aria-label="A giant piano seen from above with tiny people walking on it. Tap a key to call someone over." role="img"></canvas>' +
      '<div class="ms-hud"><button type="button" class="snd" aria-pressed="false">\u266a Sound off</button></div>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), snd = host.querySelector('.snd');
    var cache = document.createElement('canvas'), sctx = cache.getContext('2d');   // floor + piano, drawn once
    var fxc = document.createElement('canvas'), fctx = fxc.getContext('2d');       // lighting + vignette, drawn once
    var W = 0, H = 0, dpr = 1, F = 1, CX = 0, CY = 0, N = 0, ctr = 0, sc0 = 1, phone = false, keyC = 0;
    var TX = 0, TY = -.25, TZ = 1.4;
    var cp = Math.cos(PITCH), sp = Math.sin(PITCH), cyw = Math.cos(YAW), syw = Math.sin(YAW);
    var people = [], hl = [], flash = [], ripples = [], keyCount = [], onCount = 0, shown = -1;
    var running = false, last = 0, beat = 0, burst = 0, soundOn = false, AC = null, master = null, voices = 0;

    // ---------- the camera: world (x,y,z) <-> screen ----------
    function P(x, y, z) {
      var dx = x - TX, dy = y - TY, dz = z - TZ;
      var x1 = dx * cyw + dz * syw, z1 = -dx * syw + dz * cyw;
      var zc = DIST - dy * sp - z1 * cp, yc = dy * cp - z1 * sp, s = F / zc;
      return { x: CX + x1 * s, y: CY - yc * s, s: s, d: zc };
    }
    function U(sx, sy, yp) { // screen point -> point on the horizontal plane y = yp
      var a = (sx - CX) / F, b = -(sy - CY) / F, y1 = yp - TY;
      var z1 = (b * (DIST - y1 * sp) - y1 * cp) / (b * cp - sp), zc = DIST - y1 * sp - z1 * cp, x1 = a * zc;
      return { x: x1 * cyw - z1 * syw + TX, z: x1 * syw + z1 * cyw + TZ };
    }
    function path(c, pts) { var q = P(pts[0][0], pts[0][1], pts[0][2]); c.beginPath(); c.moveTo(q.x, q.y); for (var i = 1; i < pts.length; i++) { q = P(pts[i][0], pts[i][1], pts[i][2]); c.lineTo(q.x, q.y); } c.closePath(); }
    function quad(c, pts, fill) { path(c, pts); c.fillStyle = fill; c.fill(); }
    function grad(c, a, b, stops) { var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]), g = c.createLinearGradient(p.x, p.y, q.x, q.y); for (var i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]); return g; }

    // ---------- layout ----------
    function layout() {
      W = host.clientWidth || 800; H = cv.clientHeight || 480; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cache.width = fxc.width = cv.width; cache.height = fxc.height = cv.height;
      phone = W <= 760;
      sc0 = W / (phone ? 11.5 : 26);                       // pixels per world unit at the middle of the scene
      F = DIST * sc0; CX = W / 2; CY = H * (phone ? .6 : .57);
      N = Math.ceil(2 * W / sc0 * .8) + 18; if (N % 2) N++; ctr = N / 2;
      keyC = 7 * Math.round(ctr / 7);                      // a C key near the middle, so black keys fall in the right places
      drawStatic(); drawFx();
      var want = phone ? 8 : 15;
      while (people.length < want) people.push(newPerson());
      people.length = want;
    }
    function noteOf(i) { return midiOf(i - keyC); }
    function foldKey(d) { var i = keyC + d, vis = Math.max(3, Math.floor(W / sc0 * .5) - 1); while (i - ctr > vis) i -= 7; while (i - ctr < -vis) i += 7; return i; } // keep every note on a visible key

    // ---------- the stage, the piano (drawn once) ----------
    function floor(c) {
      c.fillStyle = '#2b2018'; c.fillRect(0, 0, W, H);
      var rnd = seeded(7), pal = ['#5c4533', '#664c37', '#52402f', '#6d513a', '#5a4231'], pw = 1.15, X = ctr + 14;
      for (var j = Math.floor(-18 / pw); j * pw < 26; j++) {
        var z0 = j * pw + .02, z1 = j * pw + pw - .02, x = -X - rnd() * 5;
        while (x < X) {
          var len = 3.6 + rnd() * 3.4, col = pick2(pal, rnd), x1 = x + len - .03;
          quad(c, [[x, -BH, z0], [x1, -BH, z0], [x1, -BH, z1], [x, -BH, z1]], col);
          for (var g = 0; g < 3; g++) { // wood grain
            var zg = z0 + (z1 - z0) * (.2 + rnd() * .6); path(c, [[x, -BH, zg], [x1, -BH, zg + (rnd() - .5) * .08]]);
            c.strokeStyle = rnd() < .5 ? 'rgba(255,225,180,.07)' : 'rgba(20,10,0,.12)'; c.lineWidth = Math.max(.6, .05 * sc0); c.stroke();
          }
          c.fillStyle = 'rgba(0,0,0,' + (rnd() * .1).toFixed(3) + ')'; path(c, [[x, -BH, z0], [x1, -BH, z0], [x1, -BH, z1], [x, -BH, z1]]); c.fill();
          x += len;
        }
      }
      c.fillStyle = 'rgba(255,215,170,.05)'; c.fillRect(0, 0, W, H);
    }
    function pick2(a, rnd) { return a[Math.floor(rnd() * a.length)]; }
    function pianoShadow(c) { // soft shadow of the piano body on the floor, falling toward the viewer
      var zf = KL / 2 + .03, X = ctr + 12;
      for (var k = 0; k < 10; k++) {
        var a = .5 * Math.pow(1 - k / 10, 2);
        quad(c, [[-X, -BH, zf + k * .13], [X, -BH, zf + k * .13], [X, -BH, zf + (k + 1) * .13], [-X, -BH, zf + (k + 1) * .13]], 'rgba(0,0,0,' + a.toFixed(3) + ')');
      }
    }
    function wallAndFelt(c) {
      var zb = -KL / 2, zw = zb - .32, X = ctr + 12;
      quad(c, [[-X, WALL, zw], [X, WALL, zw], [X, WALL, zw - 3], [-X, WALL, zw - 3]], grad(c, [0, WALL, zw], [0, WALL, zw - 3], [0, '#26262e', 1, '#0c0c10']));       // top of the fallboard
      quad(c, [[-X, 0, zw], [X, 0, zw], [X, WALL, zw], [-X, WALL, zw]], grad(c, [0, 0, zw], [0, WALL, zw], [0, '#1d1d25', .55, '#0e0e13', 1, '#17171d']));          // its glossy face
      var st = [[[-7, 0], [-5.6, 0], [-1.6, WALL], [-3, WALL]], [[3.4, 0], [4.2, 0], [7.8, WALL], [7, WALL]], [[-1.2, 0], [-.7, 0], [2.6, WALL], [2.1, WALL]]];
      st.forEach(function (s, i) { var sh = i == 2 ? .035 : .06; quad(c, s.map(function (q) { return [q[0] + (i == 1 ? 0 : 0), q[1], zw + .001]; }), 'rgba(255,255,255,' + sh + ')'); });
      quad(c, [[-X, WALL - .09, zw + .001], [X, WALL - .09, zw + .001], [X, WALL, zw + .001], [-X, WALL, zw + .001]], 'rgba(255,255,255,.1)');                       // rim light on the edge
      // gold lettering, drawn flat on the panel (an affine approximation of the perspective is enough at this size)
      var o = P(0, 1.55, zw), ex = P(1, 1.55, zw), ey = P(0, .55, zw), k = .01;
      c.save(); c.setTransform(dpr * (ex.x - o.x) * k, dpr * (ex.y - o.y) * k, dpr * (ey.x - o.x) * k, dpr * (ey.y - o.y) * k, dpr * o.x, dpr * o.y);
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      var gg = c.createLinearGradient(-300, -100, 300, 20); gg.addColorStop(0, '#f6e3a1'); gg.addColorStop(.5, '#c9a24a'); gg.addColorStop(1, '#8a6a22');
      c.fillStyle = gg; c.font = '900 118px "Playfair Display",Georgia,serif'; if ('letterSpacing' in c) c.letterSpacing = '14px'; c.fillText('SPECOOLASI', 0, 0);
      c.font = '400 34px "Space Mono",monospace'; if ('letterSpacing' in c) c.letterSpacing = '22px'; c.globalAlpha = .75; c.fillText('GRAND  ·  SESSIONS', 0, 70);
      c.restore();
      quad(c, [[-X, 0, zw], [X, 0, zw], [X, 0, zb], [-X, 0, zb]], grad(c, [0, 0, zw], [0, 0, zb], [0, '#4a0f1a', 1, '#7a1d2a']));                                 // red felt
      quad(c, [[-X, 0, zb], [X, 0, zb], [X, 0, KL / 2], [-X, 0, KL / 2]], '#0b0b0f');                                                                            // the key bed seen through the gaps
    }
    function whiteKeys(c) {
      var rnd = seeded(21), zb = -KL / 2, zf = KL / 2;
      for (var i = 0; i < N; i++) {
        var xL = i - ctr + .03, xR = xL + .94, a = P(xL, 0, zf), tint = pick2(IVORY, rnd);
        if (a.x < -120 || a.x > W + 120) { rnd(); continue; }
        quad(c, [[xL, 0, zb], [xR, 0, zb], [xR, 0, zf], [xL, 0, zf]], grad(c, [xL, 0, zb], [xL, 0, zf], [0, shade(tint, .9), .5, tint, 1, shade(tint, 1.4)]));
        c.fillStyle = 'rgba(120,95,40,' + (rnd() * .05).toFixed(3) + ')'; path(c, [[xL, 0, zb], [xR, 0, zb], [xR, 0, zf], [xL, 0, zf]]); c.fill();
        quad(c, [[xL, 0, zf], [xR, 0, zf], [xR, -FRONT, zf], [xL, -FRONT, zf]], grad(c, [0, 0, zf], [0, -FRONT, zf], [0, '#dad5c6', 1, '#a7a294']));
        path(c, [[xL, 0, zf], [xR, 0, zf]]); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1, .03 * sc0); c.stroke();
      }
      quad(c, [[-ctr - 12, -FRONT, zf], [ctr + 12, -FRONT, zf], [ctr + 12, -BH, zf], [-ctr - 12, -BH, zf]], grad(c, [0, -FRONT, zf], [0, -BH, zf], [0, '#5d3b24', .5, '#432816', 1, '#2b1a0e'])); // wooden key slip
      path(c, [[-ctr - 12, -FRONT - .02, zf], [ctr + 12, -FRONT - .02, zf]]); c.strokeStyle = 'rgba(255,220,170,.3)'; c.lineWidth = Math.max(1, .03 * sc0); c.stroke();
      quad(c, [[-ctr - 12, 0, zb], [ctr + 12, 0, zb], [ctr + 12, 0, zb + 2], [-ctr - 12, 0, zb + 2]], grad(c, [0, 0, zb], [0, 0, zb + 2], [0, 'rgba(0,0,0,.5)', 1, 'rgba(0,0,0,0)'])); // the fallboard shades the back of the keys
    }
    function blackShadow(c, i) {
      if (!BLACK_AFTER[((i % 7) + 7) % 7]) return;
      var cx = i + 1 - ctr, zb = -KL / 2, zf = zb + BKL, dx = -LX * BKH, dz = -LZ * BKH, w = BKW / 2, t = BKT / 2;
      [[.12, .12], [0, .3]].forEach(function (e) {
        var g = e[0];
        quad(c, [[cx - w, 0, zb], [cx - t + dx - g, 0, zb + dz], [cx - t + dx - g, 0, zf - .25 + dz + g], [cx + t + dx, 0, zf - .25 + dz + g], [cx + w, 0, zf + g * .4], [cx + w, 0, zb]], 'rgba(15,10,5,' + e[1] * .62 + ')');
      });
    }
    function black(c, i) {
      if (!BLACK_AFTER[((i % 7) + 7) % 7]) return;
      var cx = i + 1 - ctr, zb = -KL / 2, zf = zb + BKL, w = BKW / 2, t = BKT / 2, zt = zf - .25, sx = P(cx, 0, zb).x - CX;
      if (sx > 0) quad(c, [[cx - w, 0, zb], [cx - w, 0, zf], [cx - t, BKH, zt], [cx - t, BKH, zb]], '#060608');  // left side, seen from the right of the screen
      else quad(c, [[cx + w, 0, zb], [cx + w, 0, zf], [cx + t, BKH, zt], [cx + t, BKH, zb]], '#060608');
      quad(c, [[cx - w, 0, zf], [cx + w, 0, zf], [cx + t, BKH, zt], [cx - t, BKH, zt]], grad(c, [0, 0, zf], [0, BKH, zt], [0, '#0a0a0d', 1, '#2a2a31']));
      quad(c, [[cx - t, BKH, zb], [cx + t, BKH, zb], [cx + t, BKH, zt], [cx - t, BKH, zt]], grad(c, [cx - t, 0, zb], [cx + t, 0, zt], [0, '#34343d', .55, '#17171c', 1, '#0d0d11']));
      quad(c, [[cx - t * .55, BKH + .001, zb + .15], [cx - t * .1, BKH + .001, zb + .15], [cx - t * .1, BKH + .001, zt - .25], [cx - t * .55, BKH + .001, zt - .25]], 'rgba(255,255,255,.1)');
    }
    function drawStatic() {
      var c = sctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cache.width, cache.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      floor(c); pianoShadow(c); wallAndFelt(c); whiteKeys(c);
      var i; for (i = 0; i < N; i++) blackShadow(c, i);
      for (i = 0; i < N; i++) black(c, i);
    }
    function drawFx() { // warm pool of light in the middle, dark corners
      var c = fctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, fxc.width, fxc.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = c.createRadialGradient(W * .5, H * .55, H * .1, W * .5, H * .55, Math.max(W * .62, H * 1.1));
      g.addColorStop(0, 'rgba(255,228,180,.07)'); g.addColorStop(.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,6,18,.62)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      var v = c.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(8,12,30,.35)'); v.addColorStop(.25, 'rgba(0,0,0,0)'); v.addColorStop(.8, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(6,8,20,.4)');
      c.fillStyle = v; c.fillRect(0, 0, W, H);
    }

    // ---------- keys that are being played ----------
    function drawPressed(c, i, a) {
      var xL = i - ctr + .03, xR = xL + .94, zb = -KL / 2, zf = KL / 2, d = .17 * a;
      quad(c, [[xL - .03, 0, zb], [xR + .03, 0, zb], [xR + .03, 0, zf + .02], [xL - .03, 0, zf + .02]], 'rgba(5,5,10,.8)');                                   // the gaps beside it go dark
      var key = [[xL, 0, zb], [xR, 0, zb], [xR, -d, zf], [xL, -d, zf]];
      quad(c, key, grad(c, [xL, 0, zb], [xL, -d, zf], [0, '#cfc7e6', .6, '#e4def5', 1, '#f4f0ff']));
      quad(c, key, grad(c, [xL, 0, zb], [xL, -d, zf], [0, 'rgba(96,74,210,' + .32 * a + ')', 1, 'rgba(120,96,240,' + .55 * a + ')']));
      quad(c, [[xL, -d, zf], [xR, -d, zf], [xR, -FRONT - d, zf], [xL, -FRONT - d, zf]], 'rgb(' + Math.round(150 - 20 * a) + ',' + Math.round(146 - 28 * a) + ',' + Math.round(150 - 4 * a) + ')');
      c.save(); path(c, key); c.clip();
      quad(c, [[xL - 1, 0, zb], [xR + 1, 0, zb], [xR + 1, 0, zb + 2], [xL - 1, 0, zb + 2]], grad(c, [0, 0, zb], [0, 0, zb + 2], [0, 'rgba(0,0,0,.5)', 1, 'rgba(0,0,0,0)']));
      blackShadow(c, i - 1); blackShadow(c, i); c.restore();
      black(c, i - 1); black(c, i);
    }

    // ---------- people ----------
    function newPerson() {
      var sh = pick(SHIRT), sk = pick(SKIN), pa = pick(PANTS), ha = pick(HAIR), hat = Math.random() < .25 ? (sh === '#6c4dff' ? '#f2c230' : '#6c4dff') : null;
      var q = U(rand(60, Math.max(120, W - 60)), H * .8, -BH);
      return { x: q.x, z: Math.max(KL / 2 + .8, q.z), tx: 0, tz: 0, st: 'idle', wait: rand(.1, 2), ph: rand(0, 6), sp: rand(.85, 1.2), run: false, key: -1, t: 0, rep: 0, psi: rand(-.5, .5),
        k: (phone ? .8 : .68) * rand(.9, 1.1), hatc: hat,
        c: { sh: shade(sh, 1), shH: shade(sh, 1.35), shD: shade(sh, .72), sk: shade(sk, 1), skH: shade(sk, 1.25), pa: shade(pa, 1), paH: shade(pa, 1.4), hair: ha, hairH: shade(ha, 2.1), hat: hat ? shade(hat, 1) : null, hatH: hat ? shade(hat, 1.35) : null } };
    }
    function keyPoint(i) { return { x: i - ctr + .5 + rand(-.15, .15), z: rand(1.15, 2.5) }; }
    function visibleKey() {
      for (var tries = 0; tries < 24; tries++) {
        var i = Math.floor(rand(ctr - W / sc0 * .5 - 1, ctr + W / sc0 * .5 + 1)), q = P(i - ctr + .5, 0, 1.8);
        if (q.x > 40 && q.x < W - 40) return i;
      }
      return ctr;
    }
    function wanderPoint() {
      var sy0 = P(0, 0, 1.2).y + 8, q = U(rand(50, W - 50), rand(sy0, H - 34), 0);
      if (q.z > KL / 2 + .35) q = U(q.x * 0 + rand(50, W - 50), rand(Math.max(sy0, P(0, -BH, KL / 2 + .5).y), H - 34), -BH);
      return { x: q.x, z: Math.max(1.1, q.z) };
    }
    function chooseTarget(p) {
      var q;
      if (Math.random() < .5 && onCount < 4) { p.key = visibleKey(); q = keyPoint(p.key); p.st = 'toKey'; }
      else { q = wanderPoint(); p.st = 'walk'; }
      p.tx = q.x; p.tz = q.z; p.run = false;
    }
    function release(p) { if (p.key >= 0) keyCount[p.key] = Math.max(0, (keyCount[p.key] || 1) - 1); p.key = -1; }
    function turn(p, to, dt) { var d = to - p.psi; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; p.psi += d * Math.min(1, dt * 9); }
    function step(p, dt) {
      if (p.st === 'idle') { p.wait -= dt; turn(p, 0, dt * .4); if (p.wait <= 0) chooseTarget(p); }
      else if (p.st === 'walk' || p.st === 'toKey') {
        var dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz), v = 1.25 * p.sp * (p.run ? 2.1 : 1) * dt * p.k / .68;
        if (d <= v + .02) {
          p.x = p.tx; p.z = p.tz;
          if (p.st === 'toKey') { p.st = 'on'; p.t = rand(2.5, 5.5); onCount++; }
          else { p.st = 'idle'; p.wait = rand(.3, 1.8); }
          p.run = false;
        } else { p.x += dx / d * v; p.z += dz / d * v; p.ph += dt * 9 * (p.run ? 1.5 : 1); turn(p, Math.atan2(dx, dz), dt); }
      } else if (p.st === 'on') {
        p.t -= dt; turn(p, 0, dt);
        if (p.t <= 0) { onCount--; release(p); p.st = 'idle'; p.wait = rand(.4, 1.4); }
      }
    }
    function footY(p) {
      var dz = p.z - KL / 2, up = dz <= 0 ? 1 : Math.max(0, 1 - dz / .75), y = -BH * (1 - up);
      if (p.st === 'on' && p.key >= 0) y -= .09 * (hl[p.key] || 0);
      return y;
    }
    function cap(c, A, B, r, col, hi) {
      var a = P(A[0], A[1], A[2]), b = P(B[0], B[1], B[2]), w = Math.max(1.2, r * 2 * (a.s + b.s) / 2);
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      if (hi && w > 3) { c.strokeStyle = hi; c.globalAlpha = .55; c.lineWidth = w * .42; c.beginPath(); c.moveTo(a.x - w * .14, a.y - w * .17); c.lineTo(b.x - w * .14, b.y - w * .17); c.stroke(); c.globalAlpha = 1; }
    }
    function personShadow(c, p) {
      var k = p.k, y = footY(p), hh = .94 * k;
      var q = P(p.x, y, p.z), e = [];
      for (var a = 0; a < 14; a++) { var an = a / 14 * 6.2832, r = P(p.x + Math.cos(an) * .2 * k, y, p.z + Math.sin(an) * .13 * k); e.push(r); }
      c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.moveTo(e[0].x, e[0].y); for (var m = 1; m < e.length; m++) c.lineTo(e[m].x, e[m].y); c.closePath(); c.fill();
      var h = P(p.x - LX * hh, y, p.z - LZ * hh), w = Math.max(2, .3 * k * q.s);
      c.strokeStyle = 'rgba(0,0,0,.26)'; c.lineCap = 'round'; c.lineWidth = w; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(h.x, h.y); c.stroke();
    }
    function drawPerson(c, p) {
      var k = p.k, cc = p.c, on = p.st === 'on', walking = p.st === 'walk' || p.st === 'toKey', hF = footY(p), sn = Math.sin(p.psi), cs = Math.cos(p.psi);
      var swing = walking ? Math.sin(p.ph) : 0, yb = on ? -(.5 + .5 * Math.cos(beat * 2)) * .05 * k : (walking ? Math.abs(Math.sin(p.ph)) * .02 * k : 0);
      var lean = on ? (.02 + Math.sin(beat) * .02) * k : (walking ? .03 * k : 0);
      function at(dx, dy, dz) { return [p.x + dx * cs + dz * sn, hF + dy, p.z - dx * sn + dz * cs]; }
      var hy = .4 * k + yb, parts = [];
      var hipL = at(-.07 * k, hy, 0), hipR = at(.07 * k, hy, 0);
      var liftL = walking ? Math.max(0, Math.cos(p.ph)) * .05 * k : 0, liftR = walking ? Math.max(0, -Math.cos(p.ph)) * .05 * k : 0;
      var footL = at(-.07 * k, liftL, swing * .14 * k + (on ? .02 * k : 0)), footR = at(.07 * k, liftR, -swing * .14 * k + (on ? .02 * k : 0));
      parts.push([hipL, footL, .056 * k, cc.pa, cc.paH], [hipR, footR, .056 * k, cc.pa, cc.paH]);
      parts.push([footL, at(-.07 * k, liftL, swing * .14 * k + .09 * k), .046 * k, '#1b1b22', '#4a4a55'], [footR, at(.07 * k, liftR, -swing * .14 * k + .09 * k), .046 * k, '#1b1b22', '#4a4a55']);
      var tb = at(0, hy - .02 * k, 0), tt = at(0, hy + .3 * k, lean);
      parts.push([tb, tt, .108 * k, cc.sh, cc.shH]);
      var sL = at(-.15 * k, hy + .27 * k, lean), sR = at(.15 * k, hy + .27 * k, lean), hL, hR;
      if (on) { hL = at(-.27 * k, hy + .38 * k + Math.abs(Math.sin(beat)) * .1 * k, lean + .05 * k); hR = at(.27 * k, hy + .38 * k + Math.abs(Math.sin(beat + 1.4)) * .1 * k, lean + .05 * k); }
      else { hL = at(-.19 * k, hy - .02 * k, lean - swing * .13 * k); hR = at(.19 * k, hy - .02 * k, lean + swing * .13 * k); }
      var eL = at(-.23 * k, (sL[1] - hF + hL[1] - hF) / 2 - .05 * k, (lean + (hL[2] - p.z) * 0) + (walking ? -swing * .06 * k : .03 * k)), eR = at(.23 * k, (sR[1] - hF + hR[1] - hF) / 2 - .05 * k, (walking ? swing * .06 * k : .03 * k) + lean);
      parts.push([sL, eL, .044 * k, cc.sh, cc.shH], [eL, hL, .034 * k, cc.sk, cc.skH], [sR, eR, .044 * k, cc.sh, cc.shH], [eR, hR, .034 * k, cc.sk, cc.skH]);
      parts.forEach(function (q) { q.z = P((q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2, (q[0][2] + q[1][2]) / 2).d; });
      parts.sort(function (a, b) { return b.z - a.z; });
      c.save();
      parts.forEach(function (q) { cap(c, q[0], q[1], q[2], q[3], q[4]); });
      var nk = at(0, hy + .32 * k, lean), hd = at(0, hy + .45 * k, lean * 1.3);
      cap(c, nk, hd, .04 * k, cc.sk, null);
      var h = P(hd[0], hd[1], hd[2]), r = .105 * k * h.s;
      c.fillStyle = cc.sk; c.beginPath(); c.arc(h.x, h.y, r, 0, 6.2832); c.fill();
      c.save(); c.beginPath(); c.arc(h.x, h.y, r, 0, 6.2832); c.clip();
      c.fillStyle = cc.hair; c.beginPath(); c.arc(h.x, h.y - r * .22, r * 1.02, 0, 6.2832); c.fill();
      c.fillStyle = cc.hairH; c.globalAlpha = .45; c.beginPath(); c.arc(h.x - r * .3, h.y - r * .5, r * .42, 0, 6.2832); c.fill(); c.globalAlpha = 1;
      if (cc.hat) { c.fillStyle = cc.hat; c.beginPath(); c.arc(h.x, h.y - r * .32, r * 1.05, 0, 6.2832); c.fill(); c.fillStyle = cc.hatH; c.globalAlpha = .5; c.beginPath(); c.arc(h.x - r * .3, h.y - r * .6, r * .4, 0, 6.2832); c.fill(); c.globalAlpha = 1; }
      c.restore();
      c.restore();
    }

    // ---------- frame ----------
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cache, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var i;
      for (i = 0; i < hl.length; i++) if (hl[i] > .02) drawPressed(ctx, i, Math.min(1, hl[i]));
      for (i = ripples.length - 1; i >= 0; i--) {
        var r = ripples[i], k = r.t / .9; if (k >= 1) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(196,178,255,' + (1 - k) * .5 + ')'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.2, .04 * sc0);
        for (var a = 0; a < 13; a++) {
          var ang = Math.PI * (.06 + a * .071), r0 = .5 + k * 1.1, r1 = r0 + .22, zc = KL / 2 + .05;
          var p0 = P(r.x + Math.cos(ang) * r0, -BH + .01, zc + Math.sin(ang) * r0 * .9), p1 = P(r.x + Math.cos(ang) * r1, -BH + .01, zc + Math.sin(ang) * r1 * .9);
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        }
      }
      var order = people.slice().sort(function (a, b) { return P(b.x, 0, b.z).d - P(a.x, 0, a.z).d; });
      order.forEach(function (p) { personShadow(ctx, p); });
      order.forEach(function (p) { drawPerson(ctx, p); });
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(fxc, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var song = buildSong(), ev = 0, sb = 0;
    function fire(e) {
      if (e.k !== 'p') { drum(e.k, e.v); return; }
      var i = foldKey(e.d), sec = e.dur * 60 / BPM;
      flash[i] = Math.max(flash[i] || 0, sec * .9); if (e.dur >= 1 || e.v > .7) ripples.push({ x: i - ctr + .5, t: 0 });
      noteOn(midiOf(e.d), e.v, sec);
      if (e.v > .7 && Math.random() < .5 && onCount < 5) {        // someone runs over to dance on the key that just played
        var best = null, bd = 1e9, tg = keyPoint(i);
        people.forEach(function (p) { if (p.st === 'on' || p.st === 'toKey') return; var d = Math.hypot(p.x - tg.x, p.z - tg.z); if (d < bd) { bd = d; best = p; } });
        if (best) { best.key = i; best.tx = tg.x; best.tz = tg.z; best.st = 'toKey'; best.run = true; }
      }
    }
    function update(dt) {
      sb += dt * BPM / 60; beat = sb * Math.PI * 2;
      if (sb >= LOOP) { sb -= LOOP; ev = 0; }
      while (ev < song.length && song[ev].b <= sb) fire(song[ev++]);
      for (var i = 0; i < people.length; i++) step(people[i], dt);
      for (var k = 0; k < N; k++) {
        var want = (keyCount[k] > 0 || flash[k] > 0) ? 1 : 0; hl[k] = (hl[k] || 0) + (want - (hl[k] || 0)) * Math.min(1, dt * 14);
        if (flash[k] > 0) flash[k] -= dt;
      }
      ripples.forEach(function (r) { r.t += dt; });
    }

    // ---------- sound (only after the visitor switches it on) ----------
    var rev = null, noiseBuf = null;
    function initAudio() {
      var AX = window.AudioContext || window.webkitAudioContext; if (!AX) return false;
      AC = new AX(); var comp = AC.createDynamicsCompressor(); master = AC.createGain(); master.gain.value = .7; master.connect(comp); comp.connect(AC.destination);
      var len = AC.sampleRate * 2.4, ib = AC.createBuffer(2, len, AC.sampleRate);
      for (var c = 0; c < 2; c++) { var d = ib.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      var cv2 = AC.createConvolver(); cv2.buffer = ib; rev = AC.createGain(); rev.gain.value = .9; var wet = AC.createGain(); wet.gain.value = .32; rev.connect(cv2); cv2.connect(wet); wet.connect(master);
      noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); var nd = noiseBuf.getChannelData(0); for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
      return true;
    }
    function noteOn(midi, vel, dur) { // a soft, slightly detuned electric-piano tone with a long tail
      if (!soundOn || !AC || voices > 18) return;
      var f = 440 * Math.pow(2, (midi - 69) / 12), t = AC.currentTime + .01, v = (vel || 1) * .4, d = dur || 1;
      var o1 = AC.createOscillator(), o2 = AC.createOscillator(), o3 = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter(), g2 = AC.createGain(), g3 = AC.createGain(), send = AC.createGain();
      o1.type = 'triangle'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; o3.type = 'triangle'; o3.frequency.value = f; o3.detune.value = 7;
      g2.gain.value = .2; g3.gain.value = .55; lp.type = 'lowpass'; lp.frequency.setValueAtTime(2800, t); lp.frequency.exponentialRampToValueAtTime(900, t + 1.2);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(v * .38, t + .45); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 1.7);
      o1.connect(lp); o2.connect(g2); g2.connect(lp); o3.connect(g3); g3.connect(lp); lp.connect(g); g.connect(master); send.gain.value = .55; g.connect(send); send.connect(rev);
      var end = t + d + 1.8; o1.start(t); o2.start(t); o3.start(t); o1.stop(end); o2.stop(end); o3.stop(end); voices++; o1.onended = function () { voices--; };
    }
    function drum(kind, vel) { // quiet lo-fi kit: soft kick, brushed snare, tiny hats
      if (!soundOn || !AC) return; var t = AC.currentTime + .01, g = AC.createGain(), v = vel || 1;
      if (kind === 'kick') {
        var o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
        g.gain.setValueAtTime(.5 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .32); o.connect(g); g.connect(master); o.start(t); o.stop(t + .35);
      } else {
        var n = AC.createBufferSource(), f = AC.createBiquadFilter(); n.buffer = noiseBuf; f.type = kind === 'snare' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 'snare' ? 1800 : 7500;
        var top = kind === 'snare' ? .16 * v : .045 * v, len = kind === 'snare' ? .2 : .05;
        g.gain.setValueAtTime(top, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random() * .5); n.stop(t + len + .02);
      }
    }
    snd.addEventListener('click', function () {
      soundOn = !soundOn;
      if (soundOn) { if (!AC && !initAudio()) { soundOn = false; return; } if (AC.resume) AC.resume(); }
      snd.textContent = soundOn ? '\u266a Sound on' : '\u266a Sound off'; snd.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); kick();
    });

    // ---------- tapping a key ----------
    cv.addEventListener('pointerdown', function (e) {
      var b = cv.getBoundingClientRect(), q = U(e.clientX - b.left, e.clientY - b.top, 0);
      if (q.z < -KL / 2 || q.z > KL / 2) return;
      var i = Math.floor(q.x + ctr); if (i < 0 || i >= N) return;
      flash[i] = .4; noteOn(noteOf(i), .9, .8); ripples.push({ x: i - ctr + .5, t: 0 });
      var best = null, bd = 1e9, tgt = keyPoint(i);
      people.forEach(function (p) { if (p.st === 'on') return; var d = Math.hypot(p.x - tgt.x, p.z - tgt.z); if (d < bd) { bd = d; best = p; } });
      if (best) { best.key = i; best.tx = tgt.x; best.tz = tgt.z; best.st = 'toKey'; best.run = true; }
      kick();
    });

    // ---------- loop: only runs while the stage is on screen ----------
    function frame(now) {
      if (!running) return;
      var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      update(dt); draw();
      if (calm) { burst -= dt; if (burst <= 0) { running = false; return; } }
      requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function kick() { if (calm) { burst = 1.2; start(); } }
    var visible = false;
    function sync() { if (calm) return; if (visible && !document.hidden) start(); else running = false; }
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: .05 }).observe(host); else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); respawn(); draw(); }, 160); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawStatic(); if (!running) draw(); });

    function respawn() { people.forEach(function (p) { if (p.st === 'on') { onCount--; release(p); } var q = wanderPoint(); p.x = q.x; p.z = q.z; p.st = 'idle'; p.wait = rand(.1, 1.2); }); }
    layout(); respawn();
    for (var i = 0; i < 4; i++) { var p = people[i]; p.key = visibleKey(); var q = keyPoint(p.key); p.x = p.tx = q.x; p.z = p.tz = q.z; p.st = 'on'; p.t = rand(2, 5); onCount++; }
    update(0); draw();
    if (calm) { burst = 0; }
  }
  window.KeysStage = { mount: mount };
})();
