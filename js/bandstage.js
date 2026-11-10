// "MEET THE BAND": a live band of tiny people playing many instruments, with a crowd in front.
// Mounted at the very bottom of the music production page by js/musicshop.js.   BandStage.mount(element)
// The song plays in YouTube's own player (shown on the page). The band moves in time with it.
(function () {
  // ===================== YOUR SONG: change these three numbers/words =====================
  var SONG = {
    id: 'DKm-pna-QCc',   // the part of the YouTube link after  v=
    bpm: 100,            // the song's tempo (beats per minute). The band's beat follows this number.
    offset: 0            // seconds from the start of the video until the first beat
  };
  // =======================================================================================
  var SKIN = ['#8d5a3c', '#c68642', '#f1c27d', '#5a3825', '#ffdbac', '#a8693f'];
  var SHIRT = ['#f2c230', '#2bb39b', '#3aa66b', '#5b7fe0', '#f08a3c', '#6c4dff', '#e85d75', '#4aa3df'];
  var PANTS = ['#2f3d73', '#3b4a7a', '#27345f', '#4a3f6b'];
  var HAIR = ['#1c1410', '#3a2415', '#0f0f14', '#6b3f1e'];
  var TAU = Math.PI * 2;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pls(phase, len) { var f = phase - Math.floor(phase); return Math.max(0, 1 - f / len); }   // a pulse that fades out after each beat

  function mount(host) {
    if (!host || host._bs) return; host._bs = true;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    host.innerHTML = '<canvas role="img" aria-label="A live band of tiny people playing drums, bass, guitar, keyboard, saxophone, congas and singing, with a crowd dancing in front. Tap a band member to make them show off."></canvas>' +
      '<div class="ms-hud"><span class="tl">specoolasi live</span><span class="tr">' + SONG.bpm + ' BPM</span><span class="bl"><b class="dot">&#9679;</b> <b class="n">6</b> on stage</span></div>' +
      '<button type="button" class="ms-go">&#9654; Start the show</button>' +
      '<div class="ms-ytcard" hidden><div id="ms-yt"></div><small>Now playing &middot; played by YouTube</small></div>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), go = host.querySelector('.ms-go'), card = host.querySelector('.ms-ytcard'), dot = host.querySelector('.dot'), nEl = host.querySelector('.n');
    var W = 0, H = 0, dpr = 1, phone = false, Hp = 40, stage = { x0: 0, x1: 0, y0: 0, y1: 0 }, members = [], crowd = [], notes = [];
    var T = 0, bp = 0, A = 0, playing = false, ended = false, player = null, lastCT = 0, lastAt = 0, running = false, last = 0, burst = 0, visible = false, started = false, flare = {};

    // ---------- layout: the desktop band is spread wide, the phone band is packed into two rows ----------
    function mk(kind, nx, ny, i) {
      return { kind: kind, nx: nx, ny: ny, x: 0, y: 0, skin: SKIN[i % SKIN.length], shirt: SHIRT[(i * 3 + 1) % SHIRT.length], pants: PANTS[i % PANTS.length], hair: HAIR[i % HAIR.length], hat: i % 3 === 1, ph: i * 1.7 };
    }
    function layout() {
      W = host.clientWidth || 800; H = cv.clientHeight || 480; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); phone = W <= 760;
      Hp = phone ? W / 8.2 : Math.min(W / 16, H / 6.2);
      stage = phone ? { x0: W * .03, x1: W * .97, y0: H * .07, y1: H * .57 } : { x0: W * .08, x1: W * .92, y0: H * .1, y1: H * .66 };
      members = [mk('drums', .5, .36, 0), mk('bass', .15, .44, 1), mk('keys', .85, .42, 2), mk('sax', .22, .84, 3), mk('singer', .5, .88, 4), mk('guitar', .78, .84, 5)];
      if (!phone) members.push(mk('congas', .94, .62, 6));
      members.forEach(function (m) { m.x = stage.x0 + m.nx * (stage.x1 - stage.x0); m.y = stage.y0 + m.ny * (stage.y1 - stage.y0); });
      nEl.textContent = members.length;
      crowd = []; var n = phone ? 9 : 16;
      for (var i = 0; i < n; i++) crowd.push({ x: rand(.05, .95) * W, y: H * (phone ? rand(.7, .95) : rand(.77, .96)), ph: rand(0, 6), skin: pick(SKIN), shirt: pick(SHIRT), pants: pick(PANTS), hair: pick(HAIR), up: Math.random() < .55, hat: Math.random() < .2 });
      crowd.sort(function (a, b) { return a.y - b.y; });
    }

    // ---------- drawing helpers ----------
    function circ(x, y, r, f) { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r), 0, TAU); ctx.fill(); }
    function rrect(x, y, w, h, r, f) { ctx.fillStyle = f; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); }
    function line(x1, y1, x2, y2, w, c) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    // a tiny person. o: colours, sit, bob (in heights), lean, aL / aR = hand positions in heights from the shoulder, sing (mouth open 0..1), walk
    function figure(x, y, h, o) {
      var bob = (o.bob || 0) * h, lx = x + (o.lean || 0) * h, sit = o.sit ? .1 * h : 0, by = y - bob;
      ctx.fillStyle = 'rgba(20,45,100,.28)'; ctx.beginPath(); ctx.ellipse(x - h * .24, y + h * .03, h * .32, h * .06, -.55, 0, TAU); ctx.fill();
      ctx.fillStyle = o.pants; var lh = h * .3 - sit; ctx.fillRect(x - h * .14, by - lh, h * .11, lh); ctx.fillRect(x + h * .03, by - lh, h * .11, lh);
      var ty = by - h * .66 + sit; rrect(lx - h * .17, ty, h * .34, h * .38, h * .06, o.shirt);
      var aL = o.aL || [-.22, .26], aR = o.aR || [.22, .26], sy = ty + h * .06;
      ctx.lineWidth = h * .085; ctx.lineCap = 'round';
      [[-1, aL], [1, aR]].forEach(function (s) {
        var ax = lx + s[0] * h * .18, ex = ax + s[1][0] * h, ey = sy + s[1][1] * h;
        ctx.strokeStyle = o.shirt; ctx.beginPath(); ctx.moveTo(ax, sy); ctx.lineTo(ex, ey); ctx.stroke(); circ(ex, ey, h * .05, o.skin);
      });
      var hy = ty - h * .14; circ(lx, hy, h * .14, o.skin);
      ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(lx, hy - h * .02, h * .145, Math.PI, 0); ctx.fill();
      if (o.hat) { ctx.fillStyle = o.shirt === '#6c4dff' ? '#f2c230' : '#6c4dff'; ctx.fillRect(lx - h * .16, hy - h * .17, h * .32, h * .07); }
      if (o.sing > .05) { ctx.fillStyle = '#3a1a1a'; ctx.beginPath(); ctx.ellipse(lx, hy + h * .05, h * .04, h * .02 + h * .035 * o.sing, 0, 0, TAU); ctx.fill(); }
    }
    function drum(x, y, r, hit, face, ring) {
      circ(x, y, r * 1.08, '#1c2547'); circ(x, y, r, ring); circ(x, y, r * .86, hit > .05 ? '#ffffff' : face);
      if (hit > .05) { ctx.strokeStyle = 'rgba(255,255,255,' + hit * .8 + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * (1.15 + (1 - hit) * .6), 0, TAU); ctx.stroke(); }
    }
    function cymbal(x, y, r, hit) { circ(x, y, r, '#c99a2e'); circ(x, y, r * .78, hit > .05 ? '#fff3c4' : '#e6b94a'); circ(x, y, r * .12, '#8a6a1c'); }

    // ---------- the band members ----------
    function jump(m) { var f = flare[m.kind] || 0; return f > 0 ? Math.abs(Math.sin(f * 9)) * .3 * Math.min(1, f * 2) : 0; }
    function drawMember(m) {
      var h = Hp, x = m.x, y = m.y, breath = Math.sin(T * 2 + m.ph) * .012, fl = flare[m.kind] || 0, up = fl > 0 ? 1 : 0, bob = jump(m) + breath;
      var base = { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, bob: bob };
      var b8 = pls(bp * 2, .5) * A, b4 = pls(bp, .45) * A, sw = Math.sin(bp * Math.PI) * A, sw2 = Math.sin(bp * TAU) * A;
      if (m.kind === 'drums') {
        var kick = pls(bp / 2, .22) * A, snare = pls((bp - 1) / 2, .22) * A;
        cymbal(x - h * .95, y - h * 1.05, h * .3, b8); cymbal(x + h * .95, y - h * 1.1, h * .33, snare);
        drum(x, y - h * .55, h * .5, kick, '#f3efff', '#6c4dff');
        var hs = Math.abs(Math.sin(bp * TAU)) * A;
        figure(x, y - h * .1, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, sit: true, bob: bob * .6, aL: [-.5, .3 + hs * .18], aR: [.46, .28 + snare * .2 + (fl > 0 ? -.4 : 0)] });
        drum(x - h * .42, y - h * .02, h * .2, snare, '#fff', '#2bb39b'); drum(x + h * .12, y - h * .0, h * .17, b4, '#fff', '#f08a3c'); drum(x + h * .5, y - h * .02, h * .2, b8 > .3 ? 1 : 0, '#fff', '#e85d75');
        cymbal(x - h * .85, y - h * .25, h * .2, b8);
        line(x - h * .7, y - h * .62, x - h * .52, y - h * .1 - hs * h * .04, h * .03, '#f3efff'); line(x + h * .62, y - h * .55, x + h * .5, y - h * .08, h * .03, '#f3efff');
      } else if (m.kind === 'bass' || m.kind === 'guitar') {
        var isB = m.kind === 'bass', col = isB ? '#1c2547' : '#e85d75', nl = isB ? .72 : .58, st = isB ? sw * .05 : b8 * .09, dir = isB ? -1 : 1;
        figure(x, y, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, bob: bob + b4 * .03, lean: sw * .03 + (isB ? 0 : fl > 0 ? -.05 : 0),
          aR: [.12 * dir * -1 + (isB ? .18 : .1), .3 + st], aL: [dir * (isB ? -.52 : .5), .0 + (isB ? .0 : -.05)] });
        ctx.save(); ctx.translate(x + (sw * .03) * h, y - h * .38); ctx.rotate(dir * -.5);
        line(0, 0, dir * h * nl, -h * .05, h * .06, '#2a2330');                 // neck
        circ(dir * h * nl, -h * .05, h * .06, '#2a2330');                       // headstock
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, h * .24, h * .17, 0, 0, TAU); ctx.fill(); circ(0, 0, h * .05, '#ffffff'); ctx.restore();
        if (!isB) { rrect(x + h * .35 * dir * -1 - h * .22, y - h * .75, h * .44, h * .75, 3, '#1b1b22'); circ(x + h * .35 * dir * -1, y - h * .5, h * .12, '#3a3a46'); } // small amp
      } else if (m.kind === 'keys') {
        var kx = x - h * .6, kyy = y - h * .52;
        figure(x, y, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, bob: bob + b4 * .03, aL: [-.2, .34 + Math.abs(sw2) * .05], aR: [.2, .34 + Math.abs(Math.sin(bp * TAU + 1)) * A * .05] });
        rrect(kx, kyy, h * 1.2, h * .22, 3, '#14141a'); for (var k = 0; k < 9; k++) rrect(kx + 3 + k * (h * 1.2 - 6) / 9, kyy + h * .05, (h * 1.2 - 6) / 9 - 1.5, h * .15, 1, '#fff');
        for (k = 0; k < 9; k++) if (A > .2 && ((Math.floor(bp * 2) * 5 + k * 3) % 7 === 0)) rrect(kx + 3 + k * (h * 1.2 - 6) / 9, kyy + h * .05, (h * 1.2 - 6) / 9 - 1.5, h * .15, 1, '#6c4dff');
        line(kx + h * .15, kyy + h * .22, kx + h * .1, y, h * .04, '#333'); line(kx + h * 1.05, kyy + h * .22, kx + h * 1.1, y, h * .04, '#333');
      } else if (m.kind === 'sax') {
        figure(x, y, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, bob: bob + b4 * .02, lean: sw * .05, aL: [.12, .15], aR: [.22, .28] });
        var sx0 = x + h * .1 + sw * .05 * h, sy0 = y - h * .85; ctx.strokeStyle = '#e2b13c'; ctx.lineWidth = h * .085; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.quadraticCurveTo(x + h * .5, y - h * .55, x + h * .38, y - h * .15); ctx.stroke(); circ(x + h * .38, y - h * .1, h * .1, '#f2ca5a');
      } else if (m.kind === 'singer') {
        var sing = (Math.sin(bp * TAU * 2) * .5 + .5) * A;
        figure(x, y, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, bob: bob + b4 * .04, lean: sw * .04, sing: sing, aR: [.12, -.12 - sing * .04], aL: fl > 0 || (Math.floor(bp / 8) % 2 === 1 && A > 0) ? [-.35, -.55 + Math.sin(bp * Math.PI) * .08] : [-.22, .26] });
        line(x + h * .42, y, x + h * .42, y - h * 1.05, h * .03, '#222'); circ(x + h * .1 + sw * .04 * h, y - h * .78, h * .05, '#222');
      } else if (m.kind === 'congas') {
        var hitL = pls(bp * 2, .4) * A, hitR = pls(bp * 2 + .5, .4) * A;
        figure(x, y, h, { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat, sit: true, bob: bob + b4 * .02, aL: [-.18, .36 - hitL * .1], aR: [.18, .36 - hitR * .1] });
        [[-.3, hitL], [.3, hitR]].forEach(function (c) { var cx = x + c[0] * h, cy = y - h * .12; rrect(cx - h * .15, cy - h * .05, h * .3, h * .38, h * .05, '#b46a2d'); ctx.fillStyle = c[1] > .05 ? '#fff' : '#f0d9a8'; ctx.beginPath(); ctx.ellipse(cx, cy - h * .05, h * .15, h * .06, 0, 0, TAU); ctx.fill(); });
      }
    }
    function drawCrowd(c) {
      var h = Hp * .92, e = A, hop = Math.abs(Math.sin(bp * Math.PI + c.ph)) * .12 * e, wave = Math.sin(bp * TAU + c.ph) * .08 * e, upHands = c.up && e > .3;
      figure(c.x, c.y, h, { skin: c.skin, shirt: c.shirt, pants: c.pants, hair: c.hair, hat: c.hat, bob: hop + Math.sin(T * 1.6 + c.ph) * .01, lean: wave * .5,
        aL: upHands ? [-.26 + wave, -.62] : [-.22, .26], aR: upHands ? [.26 + wave, -.58 + Math.sin(bp * TAU + c.ph) * .06] : [.22, .26] });
    }

    function drawScene() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#6c9be4'; ctx.fillRect(0, 0, W, H);
      var sx = stage.x0, sw = stage.x1 - stage.x0, sy = stage.y0, sh = stage.y1 - stage.y0, th = Hp * .3;
      ctx.fillStyle = 'rgba(20,45,100,.3)'; ctx.fillRect(sx - Hp * .3, sy + Hp * .5, sw + Hp * .3, sh + th);        // shadow of the stage
      rrect(sx, sy + sh, sw, th, 4, '#151c3d'); rrect(sx, sy, sw, sh, Hp * .12, '#2a3563');
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; for (var p = 1; p < 9; p++) { ctx.beginPath(); ctx.moveTo(sx + sw * p / 9, sy); ctx.lineTo(sx + sw * p / 9, sy + sh); ctx.stroke(); }
      ctx.fillStyle = 'rgba(184,167,255,.55)'; ctx.font = '700 ' + Math.max(9, Hp * .17) + 'px "Space Mono",monospace'; ctx.textAlign = 'center'; ctx.fillText('S P E C O O L A S I   L I V E', sx + sw / 2, sy + sh + th * .68);
      // pools of light under the front players
      if (A > .02) members.forEach(function (m) { var g = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, Hp * 1.4); g.addColorStop(0, 'rgba(184,167,255,' + .35 * A + ')'); g.addColorStop(1, 'rgba(184,167,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(m.x, m.y, Hp * 1.4, Hp * .6, 0, 0, TAU); ctx.fill(); });
      members.slice().sort(function (a, b) { return a.y - b.y; }).forEach(drawMember);
      // sweeping stage lights
      if (A > .02) for (var k = 0; k < 3; k++) {
        var ax = sx + sw * (.2 + k * .3), ang = Math.sin(T * .9 + k * 2.1) * .35, ex = ax + Math.sin(ang) * H * .9, ey = sy + Math.cos(ang) * H * .9, wd = Hp * 1.1;
        var g2 = ctx.createLinearGradient(ax, sy - 6, ex, ey); g2.addColorStop(0, 'rgba(255,255,255,' + .22 * A + ')'); g2.addColorStop(1, 'rgba(184,167,255,0)');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(ax - 4, sy - 6); ctx.lineTo(ax + 4, sy - 6); ctx.lineTo(ex + wd, ey); ctx.lineTo(ex - wd, ey); ctx.closePath(); ctx.fill();
      }
      crowd.forEach(drawCrowd);
      notes.forEach(function (n) { ctx.fillStyle = 'rgba(' + n.c + ',' + n.a + ')'; ctx.font = '700 ' + n.s + 'px sans-serif'; ctx.fillText(n.ch, n.x, n.y); });
      if (!playing) { ctx.fillStyle = 'rgba(16,24,48,.18)'; ctx.fillRect(0, 0, W, H); }
    }

    // ---------- time and beat ----------
    function tick(dt, now) {
      T += dt;
      if (player && playing && player.getCurrentTime) {
        var ct = 0; try { ct = player.getCurrentTime(); } catch (e) { }
        if (ct !== lastCT) { lastCT = ct; lastAt = now; }
        bp = Math.max(0, (lastCT + (now - lastAt) / 1000 - SONG.offset) * SONG.bpm / 60);
      } else if (!playing) { bp += 0; }
      A += ((playing ? 1 : 0) - A) * Math.min(1, dt * 3);
      for (var i = notes.length - 1; i >= 0; i--) { var n = notes[i]; n.t += dt; n.y -= dt * Hp * .9; n.x += Math.sin(n.t * 4 + n.ph) * dt * 12; n.a = Math.max(0, .9 - n.t * .7); if (n.a <= 0) notes.splice(i, 1); }
      if (A > .5 && Math.random() < dt * 2.2 && notes.length < 24) { var m = pick(members); notes.push({ x: m.x + rand(-.3, .3) * Hp, y: m.y - Hp * 1.1, ph: rand(0, 6), t: 0, a: .9, s: Hp * rand(.28, .42), ch: pick(['\u266a', '\u266b']), c: pick(['255,255,255', '108,77,255', '36,28,110']) }); }
      for (var k in flare) { flare[k] -= dt; if (flare[k] <= 0) delete flare[k]; }
      dot.style.opacity = playing ? (.5 + .5 * pls(bp, .6)) : .3;
    }
    function frame(now) {
      if (!running) return;
      var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      tick(dt, now); drawScene();
      if (calm) { burst -= dt; if (burst <= 0 && !playing) { running = false; return; } }
      requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function sync() { if (calm) return; if (visible && !document.hidden) start(); else running = false; }

    // ---------- the YouTube player (loaded only when the visitor presses start) ----------
    function failMsg() { card.hidden = false; card.innerHTML = '<small style="display:block;padding:.8rem">The song could not be loaded. Please try again later.</small>'; go.hidden = false; go.textContent = '\u25B6 Try again'; started = false; }
    function loadYT(cb) {
      if (window.YT && YT.Player) { cb(); return; }
      var prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = function () { if (prev) prev(); cb(); };
      if (!document.getElementById('yt-api')) { var s = document.createElement('script'); s.id = 'yt-api'; s.src = 'https://www.youtube.com/iframe_api'; s.onerror = failMsg; document.body.appendChild(s); }
    }
    function startShow() {
      if (player && player.playVideo) { if (ended) { try { player.seekTo(0); } catch (e) { } ended = false; } player.playVideo(); return; }
      if (started) return; started = true; go.hidden = true; card.hidden = false;
      loadYT(function () {
        player = new YT.Player('ms-yt', {
          host: 'https://www.youtube-nocookie.com', videoId: SONG.id, width: '100%', height: '100%',
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
          events: {
            onReady: function () { try { player.playVideo(); } catch (e) { } },
            onStateChange: function (e) {
              playing = e.data === 1; if (e.data === 0) { ended = true; go.hidden = false; go.innerHTML = '&#9654; Play again'; }
              if (playing) { lastAt = performance.now(); ended = false; go.hidden = true; if (calm) start(); }
            },
            onError: failMsg
          }
        });
      });
    }
    go.addEventListener('click', startShow);

    // ---------- tap a band member and they show off ----------
    cv.addEventListener('pointerdown', function (e) {
      var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, best = null, bd = Hp * 1.2;
      members.forEach(function (m) { var d = Math.hypot(m.x - x, m.y - Hp * .5 - y); if (d < bd) { bd = d; best = m; } });
      if (best) { flare[best.kind] = 1.4; for (var i = 0; i < 5; i++) notes.push({ x: best.x + rand(-.5, .5) * Hp, y: best.y - Hp, ph: rand(0, 6), t: 0, a: .9, s: Hp * rand(.3, .45), ch: pick(['\u266a', '\u266b']), c: pick(['255,255,255', '108,77,255']) }); if (calm) { burst = 1.4; start(); } }
    });

    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: .05 }).observe(host); else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); drawScene(); }, 160); });
    layout(); drawScene();
  }
  window.BandStage = { mount: mount };
})();
