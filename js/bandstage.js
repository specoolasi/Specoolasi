// "MEET THE BAND": a small live band on a concert stage, seen from the front, playing a chill 8-bit tune.
// Mounted at the bottom of the music production page by js/musicshop.js.   BandStage.mount(element)
// The music is made right here with the browser's sound engine (soft square waves, triangle bass, brushed noise drums).
// Every player moves when their own notes sound: the guitarist's hand slides to the note, the keys light up, the drummer hits the drum.
(function () {
  // ===================== THE SONG: edit this block to change the music =====================
  // Notes are written as  NOTE:LENGTH  where the length counts 16th-notes (4 = one beat). "-" is a rest. "|" is only for reading.
  // The tune below is an ORIGINAL chill demo written for this page. Put your own song here (send me a MIDI file and I will convert it).
  var SONG = {
    title: 'Specoolasi chill demo (original)', bpm: 86, key: 'A minor',
    chords: ['Am7', 'Fmaj7', 'Cmaj7', 'G6', 'Am7', 'Fmaj7', 'Dm7', 'G6'],      // one chord per bar: drives the bass and the keyboard
    lead: '-:2 E5:3 D5:1 C5:4 -:2 A4:4 | C5:4 A4:2 -:2 G4:2 A4:2 C5:4 | E5:6 D5:2 C5:4 -:2 B4:2 | D5:4 B4:2 -:2 G4:4 -:4 | ' +
          '-:2 E5:3 G5:1 A5:6 G5:2 E5:2 | F5:4 E5:2 C5:2 A4:6 -:2 | D5:4 F5:4 A5:4 G5:2 F5:2 | E5:6 D5:2 B4:4 G4:4',
    sax:  '-:32 | E4:16 | D4:16 | C5:16 | A4:16 | F4:16 | G4:16'
  };
  // =========================================================================================
  var CHORD = {   // bass note and keyboard voicing (MIDI numbers) of each chord
    Am7: { r: 33, k: [57, 60, 64, 67] }, Fmaj7: { r: 29, k: [53, 57, 60, 64] }, Cmaj7: { r: 36, k: [55, 59, 60, 64] },
    G6: { r: 31, k: [55, 59, 62, 64] }, Dm7: { r: 38, k: [53, 57, 60, 62] }
  };
  var NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var LOOKS = {   // who is on stage
    drums:  { skin: '#c68642', shirt: '#2b3252', pants: '#1e2238', hair: '#15110e', style: 'short', sleeve: false },
    bass:   { skin: '#5a3825', shirt: '#3a5f9e', pants: '#222639', hair: '#15110e', style: 'afro', sleeve: true },
    guitar: { skin: '#f1c27d', shirt: '#b83a4a', pants: '#20243a', hair: '#6b3f1e', style: 'long', sleeve: true },
    keys:   { skin: '#ffdbac', shirt: '#2a9d8f', pants: '#252a40', hair: '#0f0f14', style: 'beanie', sleeve: true },
    sax:    { skin: '#8d5a3c', shirt: '#d9a62b', pants: '#2a2f48', hair: '#15110e', style: 'short', sleeve: true, glasses: true },
    singer: { skin: '#c68642', shirt: '#ece8f6', pants: '#5a3fc0', hair: '#3a2415', style: 'bun', sleeve: false },
    congas: { skin: '#a8693f', shirt: '#e0793a', pants: '#232841', hair: '#15110e', style: 'mohawk', sleeve: false }
  };
  var TAU = Math.PI * 2;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function midi(name) { var m = /^([A-G])(#|b)?(\d)$/.exec(name); if (!m) return null; return 12 * (+m[3] + 1) + NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
  function shade(c, a) {
    var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))); }
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }

  // ---------- turn the song text into a list of events for every 16th-note step ----------
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
      var base = b * 16, ch = CHORD[SONG.chords[b]];
      [[0, 0, 3], [6, 7, 2], [10, 0, 2], [13, 12, 2]].forEach(function (x) { grid[base + x[0]].push({ v: 'bass', n: ch.r + x[1], len: x[2] }); });
      [[0, 6], [8, 2], [11, 4]].forEach(function (x) { grid[base + x[0]].push({ v: 'keys', n: ch.k, len: x[1] }); });
      [0, 10].concat(b % 2 ? [7] : []).forEach(function (st) { grid[base + st].push({ v: 'kick' }); });
      grid[base + 4].push({ v: 'snare' }); grid[base + 12].push({ v: 'snare' });
      for (i = 0; i < 16; i += 2) grid[base + i].push({ v: 'hat', d: i % 4 === 2 ? .3 : 0, g: i % 4 === 0 ? 1 : .7 });  // lazy swing on the off-beats
      [6, 11, 14].forEach(function (st, k) { grid[base + st].push({ v: 'perc', n: k % 2 }); });
      if (b === 0) grid[base].push({ v: 'crash' });
      if (b === 3 || b === 7) { grid[base + 13].push({ v: 'snare', g: .45 }); grid[base + 15].push({ v: 'snare', g: .35 }); }
    }
    return grid;
  }
  function pls(x, len) { return Math.max(0, 1 - x / len); }

  function mount(host) {
    if (!host || host._bs) return; host._bs = true;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    host.innerHTML = '<canvas role="img" aria-label="A small live band on a concert stage playing a chill 8-bit tune: drums, bass, guitar, keyboard, saxophone and congas, with a singer and a crowd in front. Tap a band member to make them show off."></canvas>' +
      '<div class="ms-hud"><span class="tl">specoolasi live</span><span class="tr">' + SONG.bpm + ' BPM &middot; chill</span><span class="bl"><b class="dot">&#9679;</b> <b class="n">6</b> on stage</span><button type="button" class="snd" hidden>Pause</button></div>' +
      '<button type="button" class="ms-go">&#9654; Start the show</button>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), go = host.querySelector('.ms-go'), pauseBtn = host.querySelector('.snd'), dot = host.querySelector('.dot'), nEl = host.querySelector('.n');
    var bgc = document.createElement('canvas'), bg = bgc.getContext('2d');
    var W = 0, H = 0, dpr = 1, phone = false, base = 100, Y0 = 0, Y1 = 0, members = [], crowd = [], notes = [], beams = [];
    var T = 0, bp = 0, A = 0, ct = 0, running = false, last = 0, drawn = 0, burst = 0, visible = false, flare = {}, fret = { lead: 0, bass: 0 };
    var grid = buildGrid(), TOTAL = grid.length, stepDur = 60 / SONG.bpm / 4;
    var AC = null, master = null, noiseBuf = null, waves = {}, timer = null, stepIdx = 0, nextTime = 0, startAt = 0, queue = [], lastHit = {}, heldUntil = {}, lastNote = {};
    var KIND = { lead: 'guitar', bass: 'bass', keys: 'keys', sax: 'sax', perc: 'congas', kick: 'drums', snare: 'drums', hat: 'drums', crash: 'drums' };

    // ---------- small drawing helpers ----------
    function circ(c, x, y, r, f) { c.fillStyle = f; c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, TAU); c.fill(); }
    function ell(c, x, y, rx, ry, f, rot) { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, TAU); c.fill(); }
    function rr(c, x, y, w, h, r, f) { c.fillStyle = f; c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); }
    function ln(c, x1, y1, x2, y2, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    function lg(c, x0, y0, x1, y1, stops) { var g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
    function ik(sx, sy, tx, ty, l1, l2, dir) {
      var dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || .001, mx = l1 + l2 - .001;
      if (d > mx) { tx = sx + dx / d * mx; ty = sy + dy / d * mx; dx = tx - sx; dy = ty - sy; d = mx; }
      var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
      return { ex: sx + a * dx / d - dir * hh * dy / d, ey: sy + a * dy / d + dir * hh * dx / d, hx: tx, hy: ty };
    }
    function arm(b, side, tx, ty) {   // side -1 = the arm on the viewer's left
      var sx = side < 0 ? b.sLx : b.sRx, sy = side < 0 ? b.sLy : b.sRy, u = b.u, o = b.o, k = ik(sx, sy, tx, ty, .17 * u, .16 * u, side < 0 ? 1 : -1);
      ln(ctx, sx, sy, k.ex, k.ey, .06 * u, shade(o.shirt, -.1)); ln(ctx, k.ex, k.ey, k.hx, k.hy, .05 * u, o.sleeve ? shade(o.shirt, -.15) : o.skin); circ(ctx, k.hx, k.hy, .034 * u, o.skin);
      return k;
    }
    function P(name, len) { return A * pls(ct - (lastHit[name] === undefined ? -9 : lastHit[name]), len); }   // 1 when a note starts, then fades
    function held(name) { return (heldUntil[name] || 0) > ct && A > .1 ? 1 : 0; }

    // ---------- a person, seen from the front ----------
    function body(x, y, u, o) {
      var sit = o.sit ? 1 : 0, bob = (o.bob || 0) * u, lx = x + (o.lean || 0) * u, hipY = y - (sit ? .34 : .5) * u - bob, shY = y - (sit ? .63 : .79) * u - bob, hr = .072 * u;
      ell(ctx, x - .05 * u, y + .01 * u, .3 * u, .05 * u, 'rgba(0,0,0,.38)');
      var kneeY = y - (sit ? .2 : .26) * u;
      [-1, 1].forEach(function (s) {
        var hx = lx + s * .05 * u, kx = x + s * (sit ? .085 : .06) * u;
        ln(ctx, hx, hipY, kx, kneeY, .078 * u, shade(o.pants, s < 0 ? .04 : -.06)); ln(ctx, kx, kneeY, x + s * .065 * u, y - .02 * u, .068 * u, shade(o.pants, s < 0 ? .04 : -.06));
        ell(ctx, x + s * .07 * u, y - .01 * u, .055 * u, .024 * u, '#15131b');
      });
      ctx.beginPath(); ctx.moveTo(lx - .125 * u, shY + .012 * u); ctx.quadraticCurveTo(lx - .13 * u, (shY + hipY) / 2, lx - .09 * u, hipY + .03 * u);
      ctx.lineTo(lx + .09 * u, hipY + .03 * u); ctx.quadraticCurveTo(lx + .13 * u, (shY + hipY) / 2, lx + .125 * u, shY + .012 * u); ctx.quadraticCurveTo(lx, shY - .04 * u, lx - .125 * u, shY + .012 * u);
      ctx.fillStyle = lg(ctx, lx - .13 * u, 0, lx + .13 * u, 0, [[0, shade(o.shirt, .18)], [.55, o.shirt], [1, shade(o.shirt, -.3)]]); ctx.fill();
      ctx.strokeStyle = 'rgba(184,167,255,.28)'; ctx.lineWidth = Math.max(1, u * .008); ctx.stroke();
      rr(ctx, lx - .026 * u, shY - .05 * u, .052 * u, .06 * u, 2, shade(o.skin, -.12));
      // head
      ctx.save(); ctx.translate(lx, shY - .02 * u); ctx.rotate(o.tilt || 0);
      var hy = -.1 * u;
      if (o.style === 'long') { ell(ctx, 0, hy + .02 * u, hr * 1.2, hr * 1.5, o.hair); }
      if (o.style === 'afro') circ(ctx, 0, hy - .01 * u, hr * 1.45, o.hair);
      if (o.style === 'bun') circ(ctx, 0, hy - hr * 1.25, hr * .5, o.hair);
      ell(ctx, 0, hy, hr * .96, hr * 1.14, lg(ctx, -hr, 0, hr, 0, [[0, shade(o.skin, .12)], [1, shade(o.skin, -.2)]]));
      ctx.fillStyle = o.hair;
      if (o.style === 'short' || o.style === 'long' || o.style === 'bun') { ctx.beginPath(); ctx.ellipse(0, hy - hr * .35, hr * 1.02, hr * .78, 0, Math.PI, 0); ctx.fill(); }
      if (o.style === 'beanie') { ctx.beginPath(); ctx.ellipse(0, hy - hr * .3, hr * 1.08, hr * .95, 0, Math.PI, 0); ctx.fill(); rr(ctx, -hr * 1.1, hy - hr * .35, hr * 2.2, hr * .32, 2, '#6c4dff'); }
      if (o.style === 'mohawk') { rr(ctx, -hr * .22, hy - hr * 1.7, hr * .44, hr * 1.2, 3, '#e85d75'); }
      if (o.style === 'afro') { ctx.beginPath(); ctx.ellipse(0, hy - hr * .35, hr * 1.05, hr * .7, 0, Math.PI, 0); ctx.fill(); }
      if (o.glasses) { rr(ctx, -hr * .8, hy - hr * .2, hr * .7, hr * .38, 3, '#0d0d12'); rr(ctx, hr * .1, hy - hr * .2, hr * .7, hr * .38, 3, '#0d0d12'); ln(ctx, -hr * .1, hy - hr * .05, hr * .1, hy - hr * .05, 1.2, '#0d0d12'); }
      else { ell(ctx, -hr * .42, hy - hr * .05, hr * .1, hr * .13, '#1a1215'); ell(ctx, hr * .42, hy - hr * .05, hr * .1, hr * .13, '#1a1215'); }
      ln(ctx, -hr * .6, hy - hr * .32, -hr * .22, hy - hr * .36, Math.max(1, hr * .08), shade(o.hair, .05)); ln(ctx, hr * .22, hy - hr * .36, hr * .6, hy - hr * .32, Math.max(1, hr * .08), shade(o.hair, .05));
      ell(ctx, 0, hy + hr * .18, hr * .1, hr * .16, 'rgba(0,0,0,.1)');
      if (o.sing > .05) ell(ctx, 0, hy + hr * .62, hr * .3, hr * (.08 + .22 * o.sing), '#4a1620');
      else { ctx.strokeStyle = '#6b2a2a'; ctx.lineWidth = Math.max(1, hr * .09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-hr * .26, hy + hr * .6); ctx.quadraticCurveTo(0, hy + hr * (.6 + (o.smile || .12)), hr * .26, hy + hr * .6); ctx.stroke(); }
      ctx.restore();
      return { sLx: lx - .12 * u, sLy: shY + .02 * u, sRx: lx + .12 * u, sRy: shY + .02 * u, lx: lx, shY: shY, hipY: hipY, u: u, o: o, headY: shY - .12 * u };
    }

    // ---------- the instruments ----------
    function cymbal(x, y, r, hit, standTo) {
      if (standTo) ln(ctx, x, y, x, standTo, Math.max(1.5, r * .08), '#8b8f9a');
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(T * 55) * .09 * hit);
      ell(ctx, 0, 0, r, r * .2, lg(ctx, -r, 0, r, 0, [[0, '#9c7a24'], [.5, hit > .05 ? '#fff0b8' : '#e8c35a'], [1, '#8a6a1c']])); ell(ctx, 0, -r * .02, r * .12, r * .05, '#7a5a14');
      ctx.restore();
    }
    function drumShell(x, y, r, hit, col, hgt) {
      rr(ctx, x - r, y, r * 2, hgt, r * .12, lg(ctx, x - r, 0, x + r, 0, [[0, shade(col, .25)], [.5, col], [1, shade(col, -.45)]]));
      ell(ctx, x, y + hgt, r, r * .24, shade(col, -.5));
      ell(ctx, x, y, r, r * .3, '#9aa0ae'); ell(ctx, x, y, r * .9, r * .25, hit > .05 ? '#ffffff' : '#ece6d4');
      if (hit > .05) { ctx.strokeStyle = 'rgba(255,255,255,' + hit * .9 + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, r * (1 + (1 - hit) * .5), r * .3 * (1 + (1 - hit) * .5), 0, 0, TAU); ctx.stroke(); }
    }
    function drawDrums(m) {
      var u = m.h, x = m.x, y = m.y, kick = P('kick', .18), sn = P('snare', .16), hat = P('hat', .12), cr = P('crash', .7), A1 = A;
      var look = m.look, jmp = flare.drums > 0 ? Math.abs(Math.sin(flare.drums * 8)) * .06 : 0;
      cymbal(x - .36 * u, y - .86 * u, .17 * u, cr, y - .3 * u); cymbal(x + .48 * u, y - .76 * u, .19 * u, A1 * .04, y - .3 * u);
      rr(ctx, x - .1 * u, y - .24 * u, .2 * u, .24 * u, 4, '#1d1f2c');                                    // stool
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sit: true, bob: kick * .012 + jmp + Math.sin(T * 1.8) * .004, tilt: Math.sin(bp * Math.PI / 2) * .05 * A, sleeve: look.sleeve });
      // hi-hat
      ln(ctx, x - .42 * u, y - .5 * u, x - .42 * u, y - .02 * u, Math.max(1.5, u * .012), '#8b8f9a'); ell(ctx, x - .42 * u, y - .5 * u + hat * u * .012, .1 * u, .02 * u, hat > .05 ? '#fff0b8' : '#d8b24c'); ell(ctx, x - .42 * u, y - .52 * u, .1 * u, .02 * u, '#c9a13a');
      drumShell(x - .1 * u, y - .55 * u, .085 * u, sn * .6, '#2a3563', .08 * u); drumShell(x + .08 * u, y - .55 * u, .085 * u, sn * .4, '#2a3563', .08 * u);
      drumShell(x + .3 * u, y - .36 * u, .1 * u, sn, '#8a8fa0', .07 * u);
      drumShell(x + .56 * u, y - .3 * u, .12 * u, kick * .5, '#2a3563', .26 * u);
      ctx.save(); circ(ctx, x, y - .18 * u, .2 * u, '#11131f'); circ(ctx, x, y - .18 * u, .17 * u, kick > .05 ? '#ffffff' : lg(ctx, x - .17 * u, y - .35 * u, x + .17 * u, y, [[0, '#6c4dff'], [1, '#2f1f8f']]));
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 ' + Math.max(8, u * .09) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('\u2726', x, y - .15 * u); ctx.restore();
      if (kick > .05) { ctx.strokeStyle = 'rgba(184,167,255,' + kick * .8 + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - .18 * u, .2 * u * (1.05 + (1 - kick) * .25), 0, TAU); ctx.stroke(); }
      var lift = .2 * u, hl = { x: x - .42 * u, y: y - .56 * u - (1 - hat) * lift * .9 }, hr = { x: x + .3 * u, y: y - .42 * u - (1 - sn) * lift };
      var k1 = arm(b, -1, hl.x, hl.y - .08 * u), k2 = arm(b, 1, hr.x, hr.y - .08 * u);
      ln(ctx, k1.hx, k1.hy, hl.x, hl.y + .02 * u, Math.max(1.4, u * .014), '#efe2bd'); ln(ctx, k2.hx, k2.hy, hr.x, hr.y + .02 * u, Math.max(1.4, u * .014), '#efe2bd');
    }
    function drawGuitarish(m, isBass) {
      var u = m.h, x = m.x, y = m.y, look = m.look, dir = isBass ? 1 : -1, name = isBass ? 'bass' : 'lead', pu = P(name, .2), sw = Math.sin(bp * Math.PI / 2) * A, jmp = flare[m.kind] > 0 ? Math.abs(Math.sin(flare[m.kind] * 8)) * .07 : 0;
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sleeve: look.sleeve, glasses: look.glasses, bob: pu * .012 + jmp + Math.sin(T * 1.7 + m.ph) * .004, lean: sw * .015, tilt: sw * .06 * dir, smile: .2 });
      var cx = b.lx - dir * .02 * u, cy = y - .5 * u, ang = Math.atan2(-.34, dir), L = (isBass ? .66 : .56) * u, ca = Math.cos(ang), sa = Math.sin(ang);
      ln(ctx, b.lx + dir * .1 * u, b.sLy, cx - dir * .12 * u, cy + .02 * u, u * .022, '#16131c');                             // strap
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); if (dir < 0) ctx.scale(1, -1);
      var body1 = isBass ? '#1d3a78' : '#b3202f', len = L, strings = isBass ? 4 : 6;
      ell(ctx, -.1 * u, 0, .13 * u, .11 * u, lg(ctx, 0, -.11 * u, 0, .11 * u, [[0, shade(body1, .3)], [.5, body1], [1, shade(body1, -.4)]]));
      ell(ctx, .015 * u, 0, .09 * u, .085 * u, body1); rr(ctx, -.12 * u, -.05 * u, .1 * u, .1 * u, 4, 'rgba(255,255,255,.82)');
      rr(ctx, -.07 * u, -.06 * u, .02 * u, .12 * u, 1, '#16131c'); rr(ctx, -.015 * u, -.05 * u, .02 * u, .1 * u, 1, '#16131c'); rr(ctx, -.17 * u, -.05 * u, .025 * u, .1 * u, 1, '#c8ccd6');
      circ(ctx, -.15 * u, .09 * u, .012 * u, '#d6d9e2'); circ(ctx, -.11 * u, .095 * u, .012 * u, '#d6d9e2');
      rr(ctx, .07 * u, -.018 * u, len, .036 * u, 2, '#3b2a22'); for (var f = 1; f < 14; f++) ln(ctx, .07 * u + f * len / 14, -.017 * u, .07 * u + f * len / 14, .017 * u, Math.max(.6, u * .004), '#b9bcc6');
      rr(ctx, .07 * u + len, -.026 * u, .08 * u, .052 * u, 3, '#2a1f1a');
      for (var s = 0; s < strings; s++) {
        var yy = -.016 * u + s * (.032 * u / (strings - 1)), wob = Math.sin(T * 60 + s) * u * .006 * pu;
        ctx.strokeStyle = 'rgba(235,235,240,.75)'; ctx.lineWidth = Math.max(.6, u * .004); ctx.beginPath(); ctx.moveTo(-.16 * u, yy * 1.4); ctx.quadraticCurveTo(len * .5, yy + wob, .07 * u + len + .02 * u, yy); ctx.stroke();
      }
      ctx.restore();
      // the fretting hand slides to where the note is, the other hand picks near the bridge
      var nt = lastNote[name] || 60, tgt = clamp((nt - (isBass ? 28 : 55)) / (isBass ? 24 : 26), 0, 1); fret[name] += (tgt - fret[name]) * .25;
      var fs = lerp(.78, .22, fret[name]), nx = cx + (.07 * u + len * fs) * ca, ny = cy + (.07 * u + len * fs) * sa;
      var pickX = cx + (-.08 * u) * ca + (.02 * u) * (-sa) + (pu * -.06 * u) * (-sa), pickY = cy + (-.08 * u) * sa + (.02 * u) * ca + (pu * -.06 * u) * ca;
      var kA = arm(b, dir > 0 ? 1 : -1, nx, ny);          // fretting
      var kB = arm(b, dir > 0 ? -1 : 1, pickX, pickY);    // strumming
    }
    function drawKeys(m) {
      var u = m.h, x = m.x, y = m.y, look = m.look, kp = P('keys', .35), sw = Math.sin(bp * Math.PI / 2) * A, chord = lastNote.keys || [], on = held('keys') || kp > .1;
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sleeve: look.sleeve, bob: kp * .01 + Math.sin(T * 1.6 + m.ph) * .004, lean: sw * .015, tilt: sw * .07, smile: .18 });
      var kw = 1.1 * u, kx = x - kw / 2, ky = y - .62 * u, kh = .08 * u, N = 21;
      ln(ctx, x - .4 * u, ky + .1 * u, x + .4 * u, y, Math.max(2, u * .018), '#2b2d38'); ln(ctx, x + .4 * u, ky + .1 * u, x - .4 * u, y, Math.max(2, u * .018), '#2b2d38');
      rr(ctx, kx - 2, ky - .1 * u, kw + 4, .1 * u, 4, '#14151d'); for (var k = 0; k < 8; k++) circ(ctx, kx + .06 * u + k * .045 * u, ky - .05 * u, .012 * u, k % 3 === 0 ? '#6c4dff' : '#3a3d4d');
      rr(ctx, kx - 2, ky, kw + 4, kh + .05 * u, 3, '#101118');
      var wi = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], pressed = {};
      chord.forEach(function (n) { pressed[clamp(Math.floor((n - 48) / 12) * 7 + wi[(n - 48 + 120) % 12], 0, N - 1)] = 1; });
      for (k = 0; k < N; k++) rr(ctx, kx + k * kw / N + .5, ky, kw / N - 1, kh, 1, pressed[k] && on ? '#8a6bff' : '#f4f4f8');
      for (k = 0; k < N - 1; k++) if ([0, 1, 3, 4, 5].indexOf(k % 7) >= 0) rr(ctx, kx + (k + 1) * kw / N - kw / N * .28, ky, kw / N * .56, kh * .62, 1, '#14151d');
      var xs = Object.keys(pressed).map(Number), cxk = xs.length ? kx + (xs.reduce(function (a, c) { return a + c; }, 0) / xs.length + .5) * kw / N : x;
      arm(b, -1, cxk - .06 * u, ky - .015 * u + (1 - kp) * -.05 * u * 0 + (on ? .01 * u : -.03 * u)); arm(b, 1, cxk + .06 * u, ky - .015 * u + (on ? .01 * u : -.03 * u));
    }
    function drawSax(m) {
      var u = m.h, x = m.x, y = m.y, look = m.look, hs = held('sax'), sp = P('sax', .25), sw = Math.sin(bp * Math.PI / 2) * A, hi = clamp(((lastNote.sax || 62) - 52) / 20, 0, 1);
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sleeve: look.sleeve, glasses: look.glasses, bob: sp * .008 + Math.sin(T * 1.6 + m.ph) * .004, lean: sw * .02 + hs * .012, tilt: (hs ? -.08 : 0) + sw * .05, smile: .02 });
      var mx = b.lx + .04 * u, my = b.shY - .13 * u, bx = x + .3 * u + hs * .02 * u, by = y - .08 * u;
      ln(ctx, b.lx, b.shY - .03 * u, mx, my, u * .012, '#2a1f1a');
      ctx.strokeStyle = lg(ctx, mx, my, bx, by, [[0, '#f0cf6a'], [.5, '#c99a2e'], [1, '#e8c35a']]); ctx.lineWidth = u * .055; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.bezierCurveTo(mx + .12 * u, my + .1 * u, x + .1 * u, y - .46 * u, x + .2 * u, y - .28 * u); ctx.bezierCurveTo(x + .3 * u, y - .12 * u, x + .2 * u, y + 0, bx, by); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = u * .012; ctx.beginPath(); ctx.moveTo(mx + .01 * u, my + .01 * u); ctx.bezierCurveTo(mx + .12 * u, my + .1 * u, x + .09 * u, y - .46 * u, x + .19 * u, y - .28 * u); ctx.stroke();
      for (var k = 0; k < 6; k++) circ(ctx, lerp(x + .12 * u, x + .27 * u, k / 5), lerp(y - .46 * u, y - .2 * u, k / 5), u * .014, '#8a6a1c');
      ell(ctx, bx + .03 * u, by - .01 * u, .075 * u, .035 * u, '#f4d675', -.5);
      arm(b, -1, x + .12 * u + hi * .02 * u, y - .46 * u + sp * .01 * u); arm(b, 1, x + .2 * u, y - .3 * u - sp * .012 * u);
    }
    function drawSinger(m) {
      var u = m.h, x = m.x, y = m.y, look = m.look, sing = held('lead') * (.4 + .6 * Math.abs(Math.sin(T * 12))), sw = Math.sin(bp * Math.PI / 2) * A, up = (flare.singer > 0 || (Math.floor(bp / 8) % 2 === 1 && A > .1));
      rr(ctx, x - .2 * u, y - .06 * u, .4 * u, .06 * u, 3, '#14151d'); rr(ctx, x - .17 * u, y - .05 * u, .34 * u, .03 * u, 2, '#262836');     // monitor wedge
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sleeve: look.sleeve, sing: sing, bob: Math.sin(T * 1.7) * .004 + P('lead', .2) * .006 + (flare.singer > 0 ? Math.abs(Math.sin(flare.singer * 8)) * .07 : 0), lean: sw * .02, tilt: sw * .08 - sing * .05 });
      var mx = b.lx + .03 * u, my = b.shY - .1 * u;
      var k1 = arm(b, 1, mx + .02 * u, my + .015 * u); rr(ctx, k1.hx - .015 * u, k1.hy - .045 * u, .03 * u, .07 * u, 3, '#20222e'); circ(ctx, k1.hx, k1.hy - .05 * u, .024 * u, '#9aa0b0');
      arm(b, -1, up ? b.sLx - .12 * u : b.sLx - .1 * u, up ? b.sLy - .3 * u + Math.sin(bp * Math.PI) * .02 * u : b.sLy + .22 * u);
      ctx.strokeStyle = 'rgba(30,30,40,.8)'; ctx.lineWidth = Math.max(1, u * .008); ctx.beginPath(); ctx.moveTo(k1.hx, k1.hy + .02 * u); ctx.quadraticCurveTo(x + .3 * u, y - .1 * u, x + .4 * u, y); ctx.stroke();
    }
    function drawCongas(m) {
      var u = m.h, x = m.x, y = m.y, look = m.look, pc = P('perc', .18), side = lastNote.perc || 0, hl = side === 0 ? pc : 0, hr = side === 1 ? pc : 0;
      var b = body(x, y, u, { skin: look.skin, shirt: look.shirt, pants: look.pants, hair: look.hair, style: look.style, sleeve: look.sleeve, bob: pc * .01 + Math.sin(T * 1.8 + m.ph) * .004, lean: Math.sin(bp * Math.PI / 2) * A * .012, tilt: Math.sin(bp * Math.PI / 2) * A * .06, smile: .2 });
      [[-.12, hl], [.12, hr]].forEach(function (c, i) {
        var cx = x + c[0] * u, cy = y - .5 * u, r = .1 * u;
        ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx - r * .72, y - .02 * u); ctx.lineTo(cx + r * .72, y - .02 * u); ctx.lineTo(cx + r, cy); ctx.closePath();
        ctx.fillStyle = lg(ctx, cx - r, 0, cx + r, 0, [[0, '#d98a43'], [.5, '#a9611f'], [1, '#5e3510']]); ctx.fill(); ell(ctx, cx, cy, r, r * .26, '#9aa0ae'); ell(ctx, cx, cy, r * .88, r * .22, c[1] > .05 ? '#ffffff' : '#e9dcc0');
      });
      arm(b, -1, x - .12 * u, y - .55 * u - (1 - hl) * .13 * u); arm(b, 1, x + .12 * u, y - .55 * u - (1 - hr) * .13 * u);
    }
    function drawMember(m) {
      if (m.kind === 'drums') drawDrums(m); else if (m.kind === 'bass') drawGuitarish(m, true); else if (m.kind === 'guitar') drawGuitarish(m, false);
      else if (m.kind === 'keys') drawKeys(m); else if (m.kind === 'sax') drawSax(m); else if (m.kind === 'singer') drawSinger(m); else if (m.kind === 'congas') drawCongas(m);
    }

    // ---------- layout ----------
    function layout() {
      W = host.clientWidth || 800; H = cv.clientHeight || 480; dpr = Math.min(window.devicePixelRatio || 1, 2); phone = W <= 760;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); bgc.width = cv.width; bgc.height = cv.height;
      Y0 = H * (phone ? .4 : .6); Y1 = H * (phone ? .68 : .79); base = phone ? Math.min(W / 3.6, H * .3) : H * .36;
      var spec = phone ? [['drums', .5, 0], ['bass', .17, .5], ['keys', .85, .2], ['sax', .33, .95], ['singer', .52, 1], ['guitar', .78, .85]] :
        [['drums', .5, 0], ['bass', .15, .62], ['keys', .83, .18], ['sax', .31, .92], ['singer', .5, 1], ['guitar', .69, .8], ['congas', .91, .72]];
      members = spec.map(function (s, i) { var depth = s[2], h = base * (.8 + .25 * depth); return { kind: s[0], look: LOOKS[s[0]], x: W * s[1], y: lerp(Y0, Y1, depth), h: h, ph: i * 1.3 }; });
      nEl.textContent = members.length;
      beams = [0, 1, 2, 3, 4].map(function (i) { return { x: W * (.12 + i * .19), col: ['138,107,255', '255,95,168', '74,208,255', '255,179,71', '138,107,255'][i], ph: i * 1.7 }; });
      crowd = []; var n = phone ? 13 : 24;
      for (var i = 0; i < n; i++) { var row = Math.random() < .45 ? 0 : 1, s = H * (row ? .05 : .04) * rand(.9, 1.15); crowd.push({ x: rand(.02, .98) * W, y: H * (row ? rand(.9, .99) : rand(.84, .9)) + 0, s: s, row: row, ph: rand(0, 6), arm: Math.random() < .3, phone: Math.random() < .5 }); }
      crowd.sort(function (a, b) { return a.y - b.y; });
      drawBackground();
    }
    function ampStack(c, x, y, w) {
      for (var i = 0; i < 2; i++) {
        var yy = y - (i + 1) * w * .95; rr(c, x, yy, w, w * .92, 4, lg(c, x, yy, x + w, yy + w, [[0, '#1d1d26'], [1, '#0d0d12']]));
        c.fillStyle = '#2b2b36'; c.fillRect(x + w * .08, yy + w * .16, w * .84, w * .68); c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1;
        for (var k = -8; k < 14; k++) { c.beginPath(); c.moveTo(x + w * .08 + k * w * .07, yy + w * .16); c.lineTo(x + w * .08 + k * w * .07 + w * .5, yy + w * .84); c.stroke(); }
        rr(c, x + w * .38, yy + w * .05, w * .24, w * .07, 2, '#c8ccd6');
      }
    }
    function drawBackground() {
      var c = bg; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#07071a'], [.55, '#1a1440'], [1, '#0b0b1e']]); c.fillRect(0, 0, W, H);
      for (var x = 0; x < W; x += 26) { c.fillStyle = (x / 26) % 2 ? 'rgba(80,50,170,.18)' : 'rgba(0,0,0,.22)'; c.fillRect(x, 0, 13, Y0); }                    // curtain folds
      c.fillStyle = lg(c, 0, Y0 - H * .12, 0, Y0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); c.fillRect(0, Y0 - H * .12, W, H * .12);
      ampStack(c, W * .035, Y0 + 2, Math.min(W * .1, H * .17)); ampStack(c, W * .965 - Math.min(W * .1, H * .17), Y0 + 2, Math.min(W * .1, H * .17));
      // truss with lights
      c.fillStyle = '#15151f'; c.fillRect(0, H * .03, W, 7); c.strokeStyle = '#2a2a38'; c.lineWidth = 1; for (var i = 0; i < W; i += 14) { c.beginPath(); c.moveTo(i, H * .03); c.lineTo(i + 7, H * .03 + 7); c.stroke(); }
      beams.forEach(function (b) { rr(c, b.x - 9, H * .03 + 7, 18, 16, 3, '#0e0e16'); circ(c, b.x, H * .03 + 24, 5, '#2b2b38'); });
      // stage floor: dark boards, shiny from the lights
      c.fillStyle = lg(c, 0, Y0, 0, Y1 + H * .02, [[0, '#2a1d3c'], [1, '#3b2a55']]); c.fillRect(0, Y0, W, Y1 - Y0 + H * .02);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; for (i = 0; i <= 30; i++) { var tx = W * i / 30, bx = W * .5 + (tx - W * .5) * 1.5; c.beginPath(); c.moveTo(tx, Y0); c.lineTo(bx, Y1 + H * .02); c.stroke(); }
      c.fillStyle = lg(c, 0, Y0, 0, Y1, [[0, 'rgba(255,255,255,.0)'], [1, 'rgba(184,167,255,.14)']]); c.fillRect(0, Y0, W, Y1 - Y0);
      c.fillStyle = '#0f0e18'; c.fillRect(0, Y1 + H * .02, W, H * .02); c.fillStyle = lg(c, 0, 0, W, 0, [[0, 'rgba(255,190,110,.0)'], [.5, 'rgba(255,190,110,.55)'], [1, 'rgba(255,190,110,.0)']]); c.fillRect(0, Y1 + H * .02, W, 2);
      c.fillStyle = lg(c, 0, Y1 + H * .04, 0, H, [[0, '#0a0a16'], [1, '#050510']]); c.fillRect(0, Y1 + H * .04, W, H - Y1);
    }

    // ---------- the picture ----------
    function drawCrowd(c) {
      var sway = Math.sin(bp * Math.PI / 2 + c.ph) * A * c.s * .12, hop = Math.abs(Math.sin(bp * Math.PI / 2 + c.ph)) * A * c.s * .1, x = c.x + sway, y = c.y - hop, s = c.s, col = c.row ? '#05050c' : '#0f0f22';
      if (c.arm && A > .1) {
        var hx = x + s * .9 + Math.sin(bp * Math.PI / 2 + c.ph) * s * .25, hy = y - s * 2.6;
        ln(ctx, x + s * .8, y + s * .8, hx, hy, s * .55, col);
        if (c.phone) { rr(ctx, hx - s * .35, hy - s * .75, s * .7, s * 1.0, 2, '#dfe9ff'); ctx.fillStyle = 'rgba(180,210,255,.18)'; ctx.beginPath(); ctx.arc(hx, hy - s * .25, s * 1.5, 0, TAU); ctx.fill(); } else circ(ctx, hx, hy, s * .4, col);
      }
      ell(ctx, x, y + s * 1.6, s * 2, s * 1.2, col); circ(ctx, x, y, s, col);
      ctx.strokeStyle = 'rgba(184,167,255,' + (c.row ? .5 : .3) + ')'; ctx.lineWidth = Math.max(1, s * .12); ctx.beginPath(); ctx.arc(x, y, s, Math.PI * 1.1, Math.PI * 1.95); ctx.stroke();
    }
    function drawScene() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bgc, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var kk = P('kick', .25), glow = .55 + .45 * Math.sin(T * 2.2);
      // neon sign
      ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 ' + Math.max(18, H * .085) + 'px Caveat, cursive'; ctx.shadowColor = 'rgba(138,107,255,' + (.7 + .3 * glow) + ')'; ctx.shadowBlur = H * .03; ctx.fillStyle = 'rgba(255,255,255,' + (.75 + .2 * glow) + ')';
      ctx.fillText('Specoolasi live', W * .5, H * (phone ? .22 : .25)); ctx.restore();
      // light beams, slow and soft for a chill mood
      if (A > .02) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        beams.forEach(function (b, i) {
          var ang = Math.sin(T * .45 + b.ph) * .32, ex = b.x + Math.sin(ang) * H * .95, ey = H * .03 + 24 + Math.cos(ang) * H * .95, wd = H * .09, a = (.1 + .1 * kk) * A;
          var g = ctx.createLinearGradient(b.x, H * .03 + 24, ex, ey); g.addColorStop(0, 'rgba(' + b.col + ',' + a * 1.6 + ')'); g.addColorStop(1, 'rgba(' + b.col + ',0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - 4, H * .03 + 24); ctx.lineTo(b.x + 4, H * .03 + 24); ctx.lineTo(ex + wd, ey); ctx.lineTo(ex - wd, ey); ctx.closePath(); ctx.fill();
          var g2 = ctx.createRadialGradient(ex, Math.min(ey, Y1), 2, ex, Math.min(ey, Y1), wd * 1.4); g2.addColorStop(0, 'rgba(' + b.col + ',' + a * 1.3 + ')'); g2.addColorStop(1, 'rgba(' + b.col + ',0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(ex, Math.min(ey, Y1) , wd * 1.4, wd * .5, 0, 0, TAU); ctx.fill();
        });
        ctx.restore();
      }
      members.slice().sort(function (a, b) { return a.y - b.y; }).forEach(drawMember);
      if (A > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; members.forEach(function (m) { var g = ctx.createRadialGradient(m.x, m.y - m.h * .5, 2, m.x, m.y - m.h * .5, m.h * .9); g.addColorStop(0, 'rgba(160,130,255,' + .16 * A + ')'); g.addColorStop(1, 'rgba(160,130,255,0)'); ctx.fillStyle = g; ctx.fillRect(m.x - m.h, m.y - m.h * 1.5, m.h * 2, m.h * 1.6); }); ctx.restore(); }
      notes.forEach(function (n) { ctx.fillStyle = 'rgba(' + n.c + ',' + n.a + ')'; ctx.font = '700 ' + n.s + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(n.ch, n.x, n.y); });
      crowd.forEach(drawCrowd);
      var vg = ctx.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (A < .98) { ctx.fillStyle = 'rgba(5,5,20,' + .35 * (1 - A) + ')'; ctx.fillRect(0, 0, W, H); }
    }

    // ---------- the 8-bit sound engine (soft and slow) ----------
    function wave(duty) {
      if (waves[duty]) return waves[duty]; var n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (var i = 1; i < n; i++) { re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * duty); im[i] = 2 / (i * Math.PI) * (1 - Math.cos(i * Math.PI * duty)); }
      return (waves[duty] = AC.createPeriodicWave(re, im));
    }
    function env(t, dur, vol) { var g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .014); g.gain.setValueAtTime(vol * .85, t + Math.max(.02, dur * .65)); g.gain.linearRampToValueAtTime(0.0001, t + dur); g.connect(master); return g; }
    function tone(type, duty, f, t, dur, vol, vib) {
      var o = AC.createOscillator(), g = env(t, dur, vol);
      if (type === 'pulse') o.setPeriodicWave(wave(duty)); else o.type = type;
      o.frequency.value = f; o.connect(g);
      if (vib && dur > .25) { var l = AC.createOscillator(), lg2 = AC.createGain(); l.frequency.value = 5.2; lg2.gain.value = vib; l.connect(lg2); lg2.connect(o.detune); l.start(t); l.stop(t + dur + .03); }
      o.start(t); o.stop(t + dur + .03);
    }
    function noise(t, dur, vol, hp, type) {
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = env(t, dur, vol); s.buffer = noiseBuf; f.type = type || 'highpass'; f.frequency.value = hp;
      s.connect(f); f.connect(g); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    }
    function kickDrum(t, v) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + .14);
      g.gain.setValueAtTime(.5 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .26); o.connect(g); g.connect(master); o.start(t); o.stop(t + .28); }
    function freq(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function voice(e, t) {
      var dur = (e.len || 1) * stepDur, g = e.g || 1;
      switch (e.v) {
        case 'lead': tone('pulse', .25, freq(e.n), t, dur * .94, .06, 9); tone('triangle', 0, freq(e.n), t, dur * .94, .1, 9); break;
        case 'sax': tone('pulse', .5, freq(e.n), t, dur * .97, .035, 14); tone('triangle', 0, freq(e.n), t, dur * .97, .06, 14); break;
        case 'bass': tone('triangle', 0, freq(e.n), t, dur * .92, .34); break;
        case 'keys': e.n.forEach(function (n) { tone('pulse', .5, freq(n), t, dur * .9, .022); tone('triangle', 0, freq(n), t, dur * .9, .03); }); break;
        case 'kick': kickDrum(t, g); break;
        case 'snare': noise(t, .16, .075 * g, 1800, 'bandpass'); tone('triangle', 0, 180, t, .07, .05 * g); break;
        case 'hat': noise(t, .035, .03 * g, 8500); break;
        case 'crash': noise(t, .9, .04, 5500); break;
        case 'perc': tone('triangle', 0, e.n ? 300 : 230, t, .08, .07); break;
      }
    }
    function scheduleStep(i, t) { grid[i].forEach(function (e) { var tt = t + (e.d || 0) * stepDur; voice(e, tt); queue.push({ t: tt, e: e }); }); }
    function scheduler() {
      var ahead = document.hidden ? 1.5 : .15;
      while (nextTime < AC.currentTime + ahead) { scheduleStep(stepIdx, nextTime); nextTime += stepDur; stepIdx = (stepIdx + 1) % TOTAL; }
      if (queue.length > 900) queue.splice(0, queue.length - 600);
    }
    function startAudio() {
      var AX = window.AudioContext || window.webkitAudioContext; if (!AX) return false;
      AC = new AX(); master = AC.createGain(); master.gain.value = .6;
      var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; master.connect(lp); lp.connect(AC.destination);
      var dl = AC.createDelay(1), fb = AC.createGain(), wet = AC.createGain(); dl.delayTime.value = stepDur * 3; fb.gain.value = .3; wet.gain.value = .22; lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(AC.destination);
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
    function byKind(k) { for (var i = 0; i < members.length; i++) if (members[i].kind === k) return members[i]; return null; }
    function tick(dt) {
      T += dt;
      if (AC) {
        ct = AC.currentTime - (AC.outputLatency || 0);
        while (queue.length && queue[0].t <= ct) {
          var q = queue.shift(), e = q.e; lastHit[e.v] = q.t;
          if (e.len) heldUntil[e.v] = q.t + e.len * stepDur * .95; if (e.n !== undefined) lastNote[e.v] = e.n;
          if (A > .5 && (e.v === 'lead' || e.v === 'sax') && notes.length < 14 && Math.random() < .5) {
            var m = byKind(KIND[e.v]); if (m) notes.push({ x: m.x + rand(-.15, .15) * m.h, y: m.y - m.h * 1.05, ph: rand(0, 6), t: 0, a: .8, s: m.h * rand(.12, .17), ch: pick(['\u266a', '\u266b']), c: pick(['255,255,255', '184,167,255']) });
          }
        }
        bp = Math.max(0, (AC.currentTime - startAt) * SONG.bpm / 60);
      }
      A += ((playing() ? 1 : 0) - A) * Math.min(1, dt * 3);
      for (var i = notes.length - 1; i >= 0; i--) { var n = notes[i]; n.t += dt; n.y -= dt * base * .22; n.x += Math.sin(n.t * 2.5 + n.ph) * dt * 8; n.a = Math.max(0, .8 - n.t * .35); if (n.a <= 0) notes.splice(i, 1); }
      for (var k in flare) { flare[k] -= dt; if (flare[k] <= 0) delete flare[k]; }
      dot.style.opacity = playing() ? (.4 + .6 * pls(bp % 1, .6)) : .3;
    }
    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (phone && now - drawn < 30) return;   // phones draw 30 times a second
      var dt = Math.min(.05, (now - last) / 1000 || 0); last = now; drawn = now;
      tick(dt); drawScene();
      if (calm) { burst -= dt; if (burst <= 0 && !playing()) running = false; }
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function sync() { if (calm) return; if (visible && !document.hidden) start(); else running = false; }

    go.addEventListener('click', function () {
      if (!AC && !startAudio()) { go.textContent = 'Sound is not available here'; return; }
      if (AC.state === 'suspended') AC.resume();
      go.hidden = true; pauseBtn.hidden = false; pauseBtn.textContent = 'Pause'; start();
    });
    pauseBtn.addEventListener('click', togglePause);
    cv.addEventListener('pointerdown', function (e) {
      var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, best = null, bd = 1e9;
      members.forEach(function (m) { var d = Math.hypot(m.x - x, m.y - m.h * .5 - y); if (d < m.h * .7 && d < bd) { bd = d; best = m; } });
      if (best) { flare[best.kind] = 1.4; for (var i = 0; i < 4; i++) notes.push({ x: best.x + rand(-.4, .4) * best.h, y: best.y - best.h, ph: rand(0, 6), t: 0, a: .8, s: best.h * rand(.13, .18), ch: pick(['\u266a', '\u266b']), c: pick(['255,255,255', '184,167,255']) }); if (calm) { burst = 1.4; start(); } }
    });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: .05 }).observe(host); else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); drawScene(); }, 160); });
    layout(); drawScene();
  }
  window.BandStage = { mount: mount, song: SONG };
})();
