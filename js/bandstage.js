// "MEET THE BAND": a live band of tiny people playing an 8-bit song, with a crowd dancing in front.
// Mounted at the bottom of the music production page by js/musicshop.js.   BandStage.mount(element)
// The music is made right here with the browser's sound engine (square waves, triangle bass and noise drums),
// and every player moves exactly when their own notes sound. Nothing is downloaded.
(function () {
  // ===================== THE SONG: edit this block to change the music =====================
  // Notes are written as  NOTE:LENGTH  where the length counts 16th-notes (4 = one beat). "-" is a rest. "|" is only for reading.
  // The tune below is an ORIGINAL demo written for this page. Put your own song here (send me a MIDI file and I will convert it).
  var SONG = {
    title: 'Specoolasi 8-bit demo (original)', bpm: 132, key: 'A minor',
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],            // one chord per bar: drives the bass and the keyboard
    lead: 'A4:2 C5:2 E5:4 D5:2 C5:2 A4:4 | F4:2 A4:2 C5:4 A4:2 F4:2 C5:4 | E5:2 G5:2 E5:4 D5:2 C5:2 G4:4 | D5:2 B4:2 G4:4 B4:2 D5:2 G5:4 | ' +
          'A4:2 C5:2 E5:2 A5:2 G5:4 E5:4 | A5:2 G5:2 F5:4 E5:2 C5:2 F5:4 | G5:4 E5:2 C5:2 D5:4 C5:4 | B4:2 D5:2 G5:4 F5:2 D5:2 B4:2 G4:2',
    sax:  '-:64 | C5:8 E5:8 | A4:8 C5:8 | E5:8 G5:8 | D5:8 B4:8'
  };
  // =========================================================================================
  var ROOT = { Am: 33, F: 29, C: 36, G: 31 };                      // bass note of each chord (MIDI numbers)
  var TRIAD = { Am: [57, 60, 64], F: [53, 57, 60], C: [60, 64, 67], G: [55, 59, 62] };
  var STEP_NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var SKIN = ['#8d5a3c', '#c68642', '#f1c27d', '#5a3825', '#ffdbac', '#a8693f'];
  var SHIRT = ['#f2c230', '#2bb39b', '#3aa66b', '#5b7fe0', '#f08a3c', '#6c4dff', '#e85d75', '#4aa3df'];
  var PANTS = ['#2f3d73', '#3b4a7a', '#27345f', '#4a3f6b'];
  var HAIR = ['#1c1410', '#3a2415', '#0f0f14', '#6b3f1e'];
  var TAU = Math.PI * 2;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function midi(name) { var m = /^([A-G])(#|b)?(\d)$/.exec(name); if (!m) return null; return 12 * (+m[3] + 1) + STEP_NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }

  // ---------- turn the song text into one list of events per 16th-note step ----------
  function buildGrid() {
    var bars = SONG.chords.length, total = bars * 16, grid = [], s, b, i;
    for (s = 0; s < total; s++) grid.push([]);
    function melody(text, voice) {
      var pos = 0; text.replace(/\|/g, ' ').trim().split(/\s+/).forEach(function (tok) {
        var p = tok.split(':'), len = +p[1] || 1, n = midi(p[0]);
        if (n !== null && pos < total) grid[pos].push({ v: voice, n: n, len: len }); pos += len;
      });
    }
    melody(SONG.lead, 'lead'); melody(SONG.sax, 'sax');
    for (b = 0; b < bars; b++) {
      var base = b * 16, root = ROOT[SONG.chords[b]], tri = TRIAD[SONG.chords[b]];
      [[0, 0, 2], [3, 0, 1], [6, 12, 1], [8, 0, 2], [11, 0, 1], [14, 12, 1]].forEach(function (x) { grid[base + x[0]].push({ v: 'bass', n: root + x[1], len: x[2] }); });
      [2, 6, 10, 14].forEach(function (st) { grid[base + st].push({ v: 'keys', n: tri, len: 1 }); });
      [0, 6, 8].concat(b % 2 ? [10] : []).forEach(function (st) { grid[base + st].push({ v: 'kick' }); });
      [4, 12].forEach(function (st) { grid[base + st].push({ v: 'snare' }); });
      for (i = 0; i < 16; i += 2) grid[base + i].push({ v: 'hat' });
      [3, 7, 11, 15].forEach(function (st, k) { grid[base + st].push({ v: 'perc', n: k % 2 }); });
      if (b === 0 || b === 4) grid[base].push({ v: 'crash' });
      if (b === 3 || b === 7) [13, 14, 15].forEach(function (st) { grid[base + st].push({ v: 'snare' }); });
    }
    return grid;
  }

  function pls(x, len) { return Math.max(0, 1 - x / len); }

  function mount(host) {
    if (!host || host._bs) return; host._bs = true;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    host.innerHTML = '<canvas role="img" aria-label="A live band of tiny people playing an 8-bit song on drums, bass, guitar, keyboard, saxophone and congas, with a singer and a crowd dancing in front. Tap a band member to make them show off."></canvas>' +
      '<div class="ms-hud"><span class="tl">specoolasi live</span><span class="tr">' + SONG.bpm + ' BPM &middot; ' + SONG.key + '</span><span class="bl"><b class="dot">&#9679;</b> <b class="n">6</b> on stage</span><button type="button" class="snd" hidden>Pause</button></div>' +
      '<button type="button" class="ms-go">&#9654; Start the show</button>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), go = host.querySelector('.ms-go'), pauseBtn = host.querySelector('.snd'), dot = host.querySelector('.dot'), nEl = host.querySelector('.n');
    var W = 0, H = 0, dpr = 1, phone = false, Hp = 40, stage = { x0: 0, x1: 0, y0: 0, y1: 0 }, members = [], crowd = [], notes = [];
    var T = 0, bp = 0, A = 0, ct = 0, running = false, last = 0, burst = 0, visible = false, flare = {};
    var grid = buildGrid(), TOTAL = grid.length, stepDur = 60 / SONG.bpm / 4;
    var AC = null, master = null, noiseBuf = null, waves = {}, timer = null, stepIdx = 0, nextTime = 0, startAt = 0, queue = [], lastHit = {}, heldUntil = {}, lastNote = {};
    var KIND = { lead: 'guitar', bass: 'bass', keys: 'keys', sax: 'sax', perc: 'congas', kick: 'drums', snare: 'drums', hat: 'drums', crash: 'drums' };

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
    function byKind(k) { for (var i = 0; i < members.length; i++) if (members[i].kind === k) return members[i]; return null; }

    // ---------- drawing helpers ----------
    function circ(x, y, r, f) { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r), 0, TAU); ctx.fill(); }
    function rrect(x, y, w, h, r, f) { ctx.fillStyle = f; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); }
    function line(x1, y1, x2, y2, w, c) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
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

    // ---------- the band members: each one reacts to the notes of their own instrument ----------
    function P(name, len) { return A * pls(ct - (lastHit[name] === undefined ? -9 : lastHit[name]), len); }   // 1 right when a note starts, then fades
    function held(name) { return (heldUntil[name] || 0) > ct && A > .1 ? 1 : 0; }
    function jump(m) { var f = flare[m.kind] || 0; return f > 0 ? Math.abs(Math.sin(f * 9)) * .3 * Math.min(1, f * 2) : 0; }
    function drawMember(m) {
      var h = Hp, x = m.x, y = m.y, breath = Math.sin(T * 2 + m.ph) * .012, fl = flare[m.kind] || 0, bob = jump(m) + breath;
      var sw = Math.sin(bp * Math.PI) * A, base = { skin: m.skin, shirt: m.shirt, pants: m.pants, hair: m.hair, hat: m.hat };
      function fig(extra) { var o = {}; for (var k in base) o[k] = base[k]; for (k in extra) o[k] = extra[k]; figure(x, extra.yy === undefined ? y : extra.yy, h, o); }
      if (m.kind === 'drums') {
        var kick = P('kick', .16), snare = P('snare', .16), hat = P('hat', .1), crash = P('crash', .5);
        cymbal(x - h * .95, y - h * 1.05, h * .3, hat); cymbal(x + h * .95, y - h * 1.1, h * .33, crash);
        drum(x, y - h * .55, h * .5, kick, '#f3efff', '#6c4dff');
        fig({ yy: y - h * .1, sit: true, bob: bob * .6, aL: [-.5, .3 + hat * .18], aR: [.46, .28 + snare * .2 + (fl > 0 ? -.4 : 0)] });
        drum(x - h * .42, y - h * .02, h * .2, snare, '#fff', '#2bb39b'); drum(x + h * .12, y - h * .0, h * .17, snare * .7, '#fff', '#f08a3c'); drum(x + h * .5, y - h * .02, h * .2, kick * .7, '#fff', '#e85d75');
        cymbal(x - h * .85, y - h * .25, h * .2, hat);
        line(x - h * .7, y - h * .62, x - h * .52, y - h * .1 - hat * h * .04, h * .03, '#f3efff'); line(x + h * .62, y - h * .55, x + h * .5, y - h * .08, h * .03, '#f3efff');
      } else if (m.kind === 'bass' || m.kind === 'guitar') {
        var isB = m.kind === 'bass', pu = P(isB ? 'bass' : 'lead', .16), col = isB ? '#1c2547' : '#e85d75', nl = isB ? .72 : .58, dir = isB ? -1 : 1;
        fig({ bob: bob + pu * .04, lean: sw * .03 + (isB ? 0 : fl > 0 ? -.05 : 0), aR: [(isB ? .06 : -.02), .3 + pu * .1], aL: [dir * (isB ? -.52 : .5), isB ? 0 : -.05] });
        ctx.save(); ctx.translate(x + (sw * .03) * h, y - h * .38); ctx.rotate(dir * -.5);
        line(0, 0, dir * h * nl, -h * .05, h * .06, '#2a2330'); circ(dir * h * nl, -h * .05, h * .06, '#2a2330');
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, h * .24, h * .17, 0, 0, TAU); ctx.fill(); circ(0, 0, h * .05, '#ffffff'); ctx.restore();
        if (!isB) { rrect(x - h * .57, y - h * .75, h * .44, h * .75, 3, '#1b1b22'); circ(x - h * .35, y - h * .5, h * .12, '#3a3a46'); }
      } else if (m.kind === 'keys') {
        var kx = x - h * .6, kyy = y - h * .52, kp = P('keys', .2), kw = (h * 1.2 - 6) / 9, tri = lastNote.keys || [];
        fig({ bob: bob + kp * .05, aL: [-.2, .34 + kp * .05], aR: [.2, .34 + kp * .05] });
        rrect(kx, kyy, h * 1.2, h * .22, 3, '#14141a');
        for (var k = 0; k < 9; k++) { var on = kp > .1 && tri.some(function (n) { return (n * 5) % 9 === k; }); rrect(kx + 3 + k * kw, kyy + h * .05, kw - 1.5, h * .15, 1, on ? '#6c4dff' : '#fff'); }
        line(kx + h * .15, kyy + h * .22, kx + h * .1, y, h * .04, '#333'); line(kx + h * 1.05, kyy + h * .22, kx + h * 1.1, y, h * .04, '#333');
      } else if (m.kind === 'sax') {
        var hs = held('sax'), sp = P('sax', .2);
        fig({ bob: bob + sp * .03, lean: sw * .05 * (.4 + hs), aL: [.12, .15], aR: [.22, .28] });
        var sx0 = x + h * .1 + sw * .05 * h, sy0 = y - h * .85; ctx.strokeStyle = '#e2b13c'; ctx.lineWidth = h * .085; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.quadraticCurveTo(x + h * .5, y - h * .55, x + h * .38, y - h * .15); ctx.stroke(); circ(x + h * .38, y - h * .1 - hs * h * .02, h * .1, '#f2ca5a');
      } else if (m.kind === 'singer') {
        var sing = held('lead') * (.45 + .55 * Math.abs(Math.sin(T * 14)));
        fig({ bob: bob + P('lead', .2) * .04, lean: sw * .04, sing: sing, aR: [.12, -.12 - sing * .04], aL: fl > 0 || held('sax') ? [-.35, -.55 + Math.sin(bp * Math.PI) * .08] : [-.22, .26] });
        line(x + h * .42, y, x + h * .42, y - h * 1.05, h * .03, '#222'); circ(x + h * .1 + sw * .04 * h, y - h * .78, h * .05, '#222');
      } else if (m.kind === 'congas') {
        var pc = P('perc', .16), side = lastNote.perc || 0, hitL = side === 0 ? pc : 0, hitR = side === 1 ? pc : 0;
        fig({ sit: true, bob: bob + pc * .02, aL: [-.18, .36 - hitL * .12], aR: [.18, .36 - hitR * .12] });
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
      ctx.fillStyle = 'rgba(20,45,100,.3)'; ctx.fillRect(sx - Hp * .3, sy + Hp * .5, sw + Hp * .3, sh + th);
      rrect(sx, sy + sh, sw, th, 4, '#151c3d'); rrect(sx, sy, sw, sh, Hp * .12, '#2a3563');
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; for (var p = 1; p < 9; p++) { ctx.beginPath(); ctx.moveTo(sx + sw * p / 9, sy); ctx.lineTo(sx + sw * p / 9, sy + sh); ctx.stroke(); }
      ctx.fillStyle = 'rgba(184,167,255,.55)'; ctx.font = '700 ' + Math.max(9, Hp * .17) + 'px "Space Mono",monospace'; ctx.textAlign = 'center'; ctx.fillText('S P E C O O L A S I   L I V E', sx + sw / 2, sy + sh + th * .68);
      if (A > .02) members.forEach(function (m) { var g = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, Hp * 1.4); g.addColorStop(0, 'rgba(184,167,255,' + .35 * A + ')'); g.addColorStop(1, 'rgba(184,167,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(m.x, m.y, Hp * 1.4, Hp * .6, 0, 0, TAU); ctx.fill(); });
      members.slice().sort(function (a, b) { return a.y - b.y; }).forEach(drawMember);
      if (A > .02) for (var k = 0; k < 3; k++) {
        var ax = sx + sw * (.2 + k * .3), ang = Math.sin(T * .9 + k * 2.1) * .35, ex = ax + Math.sin(ang) * H * .9, ey = sy + Math.cos(ang) * H * .9, wd = Hp * 1.1;
        var g2 = ctx.createLinearGradient(ax, sy - 6, ex, ey); g2.addColorStop(0, 'rgba(255,255,255,' + .22 * A + ')'); g2.addColorStop(1, 'rgba(184,167,255,0)');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(ax - 4, sy - 6); ctx.lineTo(ax + 4, sy - 6); ctx.lineTo(ex + wd, ey); ctx.lineTo(ex - wd, ey); ctx.closePath(); ctx.fill();
      }
      crowd.forEach(drawCrowd);
      notes.forEach(function (n) { ctx.fillStyle = 'rgba(' + n.c + ',' + n.a + ')'; ctx.font = '700 ' + n.s + 'px sans-serif'; ctx.fillText(n.ch, n.x, n.y); });
      if (A < .98) { ctx.fillStyle = 'rgba(16,24,48,' + .18 * (1 - A) + ')'; ctx.fillRect(0, 0, W, H); }
    }

    // ---------- the 8-bit sound engine ----------
    function wave(duty) {
      if (waves[duty]) return waves[duty]; var n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (var i = 1; i < n; i++) { re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * duty); im[i] = 2 / (i * Math.PI) * (1 - Math.cos(i * Math.PI * duty)); }
      return (waves[duty] = AC.createPeriodicWave(re, im));
    }
    function env(t, dur, vol) { var g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.setValueAtTime(vol * .8, t + Math.max(.01, dur * .7)); g.gain.linearRampToValueAtTime(0.0001, t + dur); g.connect(master); return g; }
    function tone(type, duty, f, t, dur, vol) {
      var o = AC.createOscillator(), g = env(t, dur, vol);
      if (type === 'pulse') o.setPeriodicWave(wave(duty)); else o.type = type;
      o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + dur + .03);
    }
    function noise(t, dur, vol, hp) {
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = env(t, dur, vol); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
      s.connect(f); f.connect(g); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    }
    function kickDrum(t) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
      g.gain.setValueAtTime(.55, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(master); o.start(t); o.stop(t + .22); }
    function freq(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function voice(e, t) {
      var dur = (e.len || 1) * stepDur;
      switch (e.v) {
        case 'lead': tone('pulse', .25, freq(e.n), t, dur * .92, .1); break;
        case 'sax': tone('pulse', .125, freq(e.n), t, dur * .95, .075); break;
        case 'bass': tone('triangle', 0, freq(e.n), t, dur * .9, .3); break;
        case 'keys': e.n.forEach(function (n) { tone('pulse', .5, freq(n), t, dur * .8, .035); }); break;
        case 'kick': kickDrum(t); break;
        case 'snare': noise(t, .13, .16, 1500); tone('triangle', 0, 190, t, .06, .1); break;
        case 'hat': noise(t, .04, .06, 7000); break;
        case 'crash': noise(t, .6, .1, 4500); break;
        case 'perc': tone('triangle', 0, e.n ? 330 : 250, t, .07, .13); break;
      }
    }
    function scheduleStep(i, t) {
      grid[i].forEach(function (e) { voice(e, t); queue.push({ t: t, e: e }); });
    }
    function scheduler() {
      var ahead = document.hidden ? 1.5 : .15;
      while (nextTime < AC.currentTime + ahead) { scheduleStep(stepIdx, nextTime); nextTime += stepDur; stepIdx = (stepIdx + 1) % TOTAL; }
      if (queue.length > 900) queue.splice(0, queue.length - 600);
    }
    function startAudio() {
      var AX = window.AudioContext || window.webkitAudioContext; if (!AX) return false;
      AC = new AX(); master = AC.createGain(); master.gain.value = .55;
      var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; master.connect(lp); lp.connect(AC.destination);
      noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      startAt = nextTime = AC.currentTime + .1; stepIdx = 0; queue = []; timer = setInterval(scheduler, 25); scheduler();
      return true;
    }
    function playing() { return !!AC && AC.state === 'running'; }
    function togglePause() {
      if (!AC) return;
      if (AC.state === 'running') { AC.suspend(); pauseBtn.textContent = 'Play'; } else { AC.resume(); pauseBtn.textContent = 'Pause'; if (calm) start(); }
    }

    // ---------- time ----------
    function tick(dt) {
      T += dt;
      if (AC) {
        ct = AC.currentTime - (AC.outputLatency || 0);
        while (queue.length && queue[0].t <= ct) {
          var q = queue.shift(), e = q.e; lastHit[e.v] = q.t;
          if (e.len) heldUntil[e.v] = q.t + e.len * stepDur * .95; if (e.n !== undefined) lastNote[e.v] = e.n;
          if (A > .5 && (e.v === 'lead' || e.v === 'sax' || e.v === 'bass') && notes.length < 26 && Math.random() < .6) {
            var m = byKind(KIND[e.v]); if (m) notes.push({ x: m.x + rand(-.3, .3) * Hp, y: m.y - Hp * 1.1, ph: rand(0, 6), t: 0, a: .9, s: Hp * rand(.28, .42), ch: pick(['\u266a', '\u266b']), c: pick(['255,255,255', '108,77,255', '36,28,110']) });
          }
        }
        bp = Math.max(0, (AC.currentTime - startAt) * SONG.bpm / 60);
      }
      A += ((playing() ? 1 : 0) - A) * Math.min(1, dt * 4);
      for (var i = notes.length - 1; i >= 0; i--) { var n = notes[i]; n.t += dt; n.y -= dt * Hp * .9; n.x += Math.sin(n.t * 4 + n.ph) * dt * 12; n.a = Math.max(0, .9 - n.t * .7); if (n.a <= 0) notes.splice(i, 1); }
      for (var k in flare) { flare[k] -= dt; if (flare[k] <= 0) delete flare[k]; }
      dot.style.opacity = playing() ? (.4 + .6 * pls((bp % 1), .6)) : .3;
    }
    function frame(now) {
      if (!running) return;
      var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      tick(dt); drawScene();
      if (calm) { burst -= dt; if (burst <= 0 && !playing()) { running = false; return; } }
      requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function sync() { if (calm) return; if (visible && !document.hidden) start(); else running = false; }

    go.addEventListener('click', function () {
      if (!AC && !startAudio()) { go.textContent = 'Sound is not available here'; return; }
      if (AC.state === 'suspended') AC.resume();
      go.hidden = true; pauseBtn.hidden = false; pauseBtn.textContent = 'Pause'; start();
    });
    pauseBtn.addEventListener('click', togglePause);

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
  window.BandStage = { mount: mount, song: SONG };
})();
