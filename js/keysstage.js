// "STEP ON THE KEYS": a giant tilted piano seen from above. Tiny people walk onto the keys and play them.
// Mounted at the very bottom of the music production page by js/musicshop.js.  KeysStage.mount(element)
// Mouse / finger: tap a key and someone runs over to press it. Sound is off until the visitor switches it on.
(function () {
  var TILT = -0.245;                       // keyboard angle in radians (about 14 degrees)
  var SCALE = [0, 3, 5, 8, 10], BASE = 46; // A# minor pentatonic, so every key sounds good with every other
  var SKIN = ['#8d5a3c', '#c68642', '#f1c27d', '#5a3825', '#ffdbac', '#a8693f'];
  var SHIRT = ['#f2c230', '#2bb39b', '#3aa66b', '#5b7fe0', '#f08a3c', '#6c4dff', '#e85d75', '#4aa3df'];
  var PANTS = ['#2f3d73', '#3b4a7a', '#27345f', '#4a3f6b'];
  var HAIR = ['#1c1410', '#3a2415', '#0f0f14', '#6b3f1e'];
  var BLACK_AFTER = [1, 1, 0, 1, 1, 1, 0];  // black key after C D _ F G A _
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function mount(host) {
    if (!host || host._ks) return; host._ks = true;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    host.innerHTML = '<canvas aria-label="A giant piano with tiny people walking on it. Tap a key to call someone over." role="img"></canvas>' +
      '<div class="ms-hud"><span class="tl">specoolasi sessions</span><span class="tr">98 BPM &middot; A#m</span>' +
      '<span class="bl"><b class="n">0</b> on the keys</span><button type="button" class="snd" aria-pressed="false">Sound off</button></div>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), nEl = host.querySelector('.n'), snd = host.querySelector('.snd');
    var W = 0, H = 0, dpr = 1, kw = 0, kh = 0, th = 0, Hp = 0, N = 0, ctr = 0, u0 = 0, v0 = 0, C = { x: 0, y: 0 }, cos = Math.cos(TILT), sin = Math.sin(TILT);
    var cache = document.createElement('canvas'), cctx = cache.getContext('2d');
    var people = [], hl = [], flash = [], ripples = [], keyCount = [], onCount = 0, shown = -1, offset = 0;
    var running = false, last = 0, beat = 0, burst = 0, soundOn = false, AC = null, master = null, voices = 0;

    // ---------- geometry: keyboard space (u along the keys, v across them) <-> screen ----------
    function toScreen(u, v) { var dx = u - u0, dy = v - v0; return { x: C.x + dx * cos - dy * sin, y: C.y + dx * sin + dy * cos }; }
    function toKey(x, y) { var px = x - C.x, py = y - C.y; return { u: px * cos + py * sin + u0, v: -px * sin + py * cos + v0 }; }
    function kt(c, k) { k = k || dpr; c.setTransform(k * cos, k * sin, -k * sin, k * cos, k * (C.x - u0 * cos + v0 * sin), k * (C.y - u0 * sin - v0 * cos)); }

    function layout() {
      W = host.clientWidth || 800; H = cv.clientHeight || 480; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cache.width = cv.width; cache.height = cv.height;
      var phone = W <= 760;
      kw = phone ? W / 6.2 : W / 14.2; kh = kw * 4.5; th = kw * .2; Hp = kw * .64;
      C = { x: W * .5, y: H * (phone ? .56 : .58) };
      N = Math.ceil(W / kw) + 16; if (N % 2) N++; ctr = N / 2; u0 = ctr * kw; v0 = kh / 2;
      offset = ctr - (phone ? 3 : 6);
      drawCache();
      var want = phone ? 9 : 16;
      while (people.length < want) people.push(newPerson());
      people.length = want;
      people.forEach(function (p) { p.x = Math.max(Hp, Math.min(W - Hp, p.x)); p.y = Math.max(Hp * 1.5, Math.min(H - Hp, p.y)); });
    }

    function noteOf(i) { var j = Math.max(0, i - offset); return BASE + 12 * Math.floor(j / 5) + SCALE[j % 5]; }

    // ---------- the keyboard, drawn once ----------
    function drawBlack(c, i) {
      if (!BLACK_AFTER[((i % 7) + 7) % 7]) return;
      var bw = kw * .58, u = (i + 1) * kw - bw / 2, vEnd = kh * .62;
      c.fillStyle = 'rgba(15,25,60,.22)'; c.fillRect(u - kw * .1, kw * .05, bw, vEnd);                 // shadow on the white keys, falling to the lower left
      var g = c.createLinearGradient(u, 0, u + bw, 0); g.addColorStop(0, '#2c2c33'); g.addColorStop(.5, '#17171b'); g.addColorStop(1, '#0d0d10');
      c.fillStyle = g; c.fillRect(u, 0, bw, vEnd);
      c.fillStyle = '#3d3d46'; c.fillRect(u, vEnd, bw, kw * .1);                                          // front face of the black key
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(u + bw * .12, 0, bw * .16, vEnd);
    }
    function drawCache() {
      cctx.setTransform(1, 0, 0, 1, 0, 0); cctx.fillStyle = '#6c9be4'; cctx.fillRect(0, 0, cache.width, cache.height);
      kt(cctx);
      var total = N * kw;
      cctx.fillStyle = 'rgba(20,45,100,.3)'; cctx.fillRect(-kw * .45, kw * .55, total, kh + th * 3);      // the keyboard's shadow on the floor
      cctx.fillStyle = '#1c2547'; cctx.fillRect(0, -th * 1.3, total, th * 1.3);                           // top rail
      cctx.fillRect(0, kh + th, total, th * 1.3);                                                          // front rail
      for (var i = 0; i < N; i++) {
        var u = i * kw, g = cctx.createLinearGradient(0, 0, 0, kh);
        g.addColorStop(0, '#fbfbfd'); g.addColorStop(.85, '#f2f3f7'); g.addColorStop(1, '#e3e5ee');
        cctx.fillStyle = g; cctx.fillRect(u, 0, kw, kh);
        cctx.fillStyle = '#d5d8e3'; cctx.fillRect(u, kh, kw, th);                                          // front face of the key
        cctx.fillStyle = 'rgba(40,50,90,.28)'; cctx.fillRect(u + kw - 1.2, 0, 1.2, kh + th);               // gap between keys
      }
      for (i = 0; i < N; i++) drawBlack(cctx, i);
    }

    // ---------- people ----------
    function newPerson() {
      return { x: rand(0, W || 600), y: rand(0, H || 400), tx: 0, ty: 0, st: 'idle', wait: rand(.1, 2), ph: rand(0, 6), sp: rand(.8, 1.25), run: false, key: -1, t: 0, rep: 0,
        skin: pick(SKIN), shirt: pick(SHIRT), pants: pick(PANTS), hair: pick(HAIR), hat: Math.random() < .25 };
    }
    function keyPoint(i) { var q = toScreen((i + .5) * kw + rand(-.15, .15) * kw, rand(.4, .72) * kh); return q; }
    function visibleKey() {
      for (var tries = 0; tries < 20; tries++) {
        var i = Math.floor(rand(ctr - W / kw / 2 - 1, ctr + W / kw / 2 + 1)), q = toScreen((i + .5) * kw, .55 * kh);
        if (q.x > Hp && q.x < W - Hp && q.y > Hp * 1.5 && q.y < H - Hp) return i;
      }
      return ctr;
    }
    function chooseTarget(p) {
      if (Math.random() < .5 && onCount < 4) { p.key = visibleKey(); var q = keyPoint(p.key); p.tx = q.x; p.ty = q.y; p.st = 'toKey'; p.run = false; }
      else { p.tx = rand(Hp, W - Hp); p.ty = rand(Hp * 1.5, H - Hp); p.st = 'walk'; p.run = false; }
    }
    function press(i, p) {
      keyCount[i] = (keyCount[i] || 0) + 1; flash[i] = Math.max(flash[i] || 0, .25);
      noteOn(i);
      var b = toScreen((i + .5) * kw, kh + th * 1.5); ripples.push({ x: b.x, y: b.y, t: 0 });
    }
    function release(p) { if (p.key >= 0) { keyCount[p.key] = Math.max(0, (keyCount[p.key] || 1) - 1); } p.key = -1; }
    function step(p, dt) {
      if (p.st === 'idle') { p.wait -= dt; if (p.wait <= 0) chooseTarget(p); }
      else if (p.st === 'walk' || p.st === 'toKey') {
        var dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), v = Hp * p.sp * (p.run ? 2 : 1) * dt;
        if (d <= v + .5) {
          p.x = p.tx; p.y = p.ty;
          if (p.st === 'toKey') { p.st = 'on'; p.t = rand(1.6, 3.4); p.rep = 1.22; onCount++; press(p.key, p); }
          else { p.st = 'idle'; p.wait = rand(.3, 1.8); }
          p.run = false;
        } else { p.x += dx / d * v; p.y += dy / d * v; p.ph += dt * 9 * (p.run ? 1.5 : 1); }
      } else if (p.st === 'on') {
        p.t -= dt; p.rep -= dt; p.ph += dt * 6;
        if (p.rep <= 0) { p.rep = 1.22; var b = toScreen((p.key + .5) * kw, kh + th * 1.5); ripples.push({ x: b.x, y: b.y, t: 0 }); noteOn(p.key, .5); }
        if (p.t <= 0) { onCount--; release(p); p.st = 'idle'; p.wait = rand(.4, 1.4); }
      }
    }

    // ---------- drawing ----------
    function drawPerson(p) {
      var h = Hp, x = p.x, y = p.y, on = p.st === 'on', walking = p.st === 'walk' || p.st === 'toKey';
      var bob = on ? Math.abs(Math.sin(beat)) * h * .05 : 0, sw = walking ? Math.sin(p.ph) * h * .08 : 0;
      ctx.fillStyle = 'rgba(20,45,100,.28)'; ctx.beginPath(); ctx.ellipse(x - h * .24, y + h * .03, h * .32, h * .06, -.55, 0, 6.3); ctx.fill();
      ctx.fillStyle = p.pants; ctx.fillRect(x - h * .14, y - h * .3 - bob + sw * .4, h * .11, h * .3 - sw * .4); ctx.fillRect(x + h * .03, y - h * .3 - bob - sw * .4, h * .11, h * .3 + sw * .4);
      ctx.fillStyle = p.shirt; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - h * .17, y - h * .66 - bob, h * .34, h * .38, h * .06); else ctx.rect(x - h * .17, y - h * .66 - bob, h * .34, h * .38); ctx.fill();
      ctx.strokeStyle = p.shirt; ctx.lineWidth = h * .085; ctx.lineCap = 'round'; ctx.fillStyle = p.skin;
      for (var s = -1; s <= 1; s += 2) {
        var ax = x + s * h * .2, ay = y - h * .6 - bob, ex, ey;
        if (on) { ex = x + s * h * (.3 + Math.sin(beat * 2) * .04); ey = y - h * (.9 + Math.abs(Math.sin(beat + s)) * .08) - bob; }
        else { ex = x + s * h * .22; ey = y - h * .34 - bob + (walking ? s * sw : 0); }
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, h * .05, 0, 6.3); ctx.fill();
      }
      ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(x, y - h * .8 - bob, h * .14, 0, 6.3); ctx.fill();
      ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(x, y - h * .82 - bob, h * .145, Math.PI, 0); ctx.fill();
      if (p.hat) { ctx.fillStyle = p.shirt === '#6c4dff' ? '#f2c230' : '#6c4dff'; ctx.fillRect(x - h * .16, y - h * .96 - bob, h * .32, h * .07); }
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cache, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var any = false, i;
      for (i = 0; i < hl.length; i++) {
        if (!(hl[i] > .02)) continue;
        any = true; kt(ctx);
        var g = ctx.createLinearGradient(0, 0, 0, kh); g.addColorStop(0, 'rgba(70,52,170,' + .9 * hl[i] + ')'); g.addColorStop(1, 'rgba(98,76,220,' + .9 * hl[i] + ')');
        ctx.fillStyle = g; ctx.fillRect(i * kw + 1, 0, kw - 2, kh + th);
        drawBlack(ctx, i - 1); drawBlack(ctx, i);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var order = people.slice().sort(function (a, b) { return a.y - b.y; });
      order.forEach(drawPerson);
      for (i = ripples.length - 1; i >= 0; i--) {
        var r = ripples[i], k = r.t / .8; if (k >= 1) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(32,28,120,' + (1 - k) * .85 + ')'; ctx.lineWidth = Math.max(1.5, kw * .035); ctx.lineCap = 'round';
        for (var a = 0; a < 11; a++) {
          var ang = Math.PI * (.1 + a * .08), r0 = kw * (.45 + k * .5), r1 = r0 + kw * .22;
          ctx.beginPath(); ctx.moveTo(r.x + Math.cos(ang) * r0, r.y + Math.sin(ang) * r0 * .8); ctx.lineTo(r.x + Math.cos(ang) * r1, r.y + Math.sin(ang) * r1 * .8); ctx.stroke();
        }
      }
      if (shown !== onCount) { shown = onCount; nEl.textContent = onCount; }
    }
    function update(dt) {
      beat += dt * Math.PI * 2 * (98 / 60);
      for (var i = 0; i < people.length; i++) step(people[i], dt);
      for (var k = 0; k < N; k++) {
        var want = (keyCount[k] > 0 || flash[k] > 0) ? 1 : 0; hl[k] = (hl[k] || 0) + (want - (hl[k] || 0)) * Math.min(1, dt * 14);
        if (flash[k] > 0) flash[k] -= dt;
      }
      ripples.forEach(function (r) { r.t += dt; });
    }

    // ---------- sound (only after the visitor switches it on) ----------
    function noteOn(i, vel) {
      if (!soundOn || !AC || voices > 10) return;
      var f = 440 * Math.pow(2, (noteOf(i) - 69) / 12), t = AC.currentTime, v = (vel || 1) * .5;
      var o1 = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
      o1.type = 'triangle'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; lp.type = 'lowpass'; lp.frequency.value = 2600;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * .55, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o1.connect(lp); var g2 = AC.createGain(); g2.gain.value = .25; o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(master);
      o1.start(t); o2.start(t); o1.stop(t + 1.6); o2.stop(t + 1.6); voices++; o1.onended = function () { voices--; };
    }
    snd.addEventListener('click', function () {
      soundOn = !soundOn;
      if (soundOn) { if (!AC) { var AX = window.AudioContext || window.webkitAudioContext; if (!AX) { soundOn = false; return; } AC = new AX(); master = AC.createGain(); master.gain.value = .35; master.connect(AC.destination); } if (AC.resume) AC.resume(); }
      snd.textContent = soundOn ? 'Sound on' : 'Sound off'; snd.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); kick();
    });

    // ---------- tapping a key ----------
    cv.addEventListener('pointerdown', function (e) {
      var b = cv.getBoundingClientRect(), q = toKey(e.clientX - b.left, e.clientY - b.top);
      if (q.v < 0 || q.v > kh + th) return;
      var i = Math.floor(q.u / kw); if (i < 0 || i >= N) return;
      flash[i] = .4; noteOn(i, .9); var rb = toScreen((i + .5) * kw, kh + th * 1.5); ripples.push({ x: rb.x, y: rb.y, t: 0 });
      var best = null, bd = 1e9, tgt = keyPoint(i);
      people.forEach(function (p) { if (p.st === 'on') return; var d = Math.hypot(p.x - tgt.x, p.y - tgt.y); if (d < bd) { bd = d; best = p; } });
      if (best) { best.key = i; best.tx = tgt.x; best.ty = tgt.y; best.st = 'toKey'; best.run = true; }
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
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var w = host.clientWidth; if (Math.abs(w - W) > 8 || true) { layout(); draw(); } }, 160); });

    layout();
    for (var i = 0; i < 4; i++) { var p = people[i]; p.key = visibleKey(); var q = keyPoint(p.key); p.x = p.tx = q.x; p.y = p.ty = q.y; p.st = 'on'; p.t = rand(1, 3); p.rep = rand(.3, 1.2); onCount++; keyCount[p.key] = (keyCount[p.key] || 0) + 1; hl[p.key] = 1; }
    update(0); draw();
    if (calm) { burst = 0; }
  }
  window.KeysStage = { mount: mount };
})();
