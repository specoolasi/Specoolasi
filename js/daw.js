// A small music studio in the style of FL Studio: browser, channel rack, playlist, piano roll and mixer.
// It plays real (not 8-bit) sounds made in the browser: electric piano, sub bass, warm pad, vibes and a lo-fi drum kit.
// Click the pads, draw notes, mute clips, move the faders. Mounted at the bottom of the music production page.   DAW.mount(element)
(function () {
  var BARS = 8, TOTAL = BARS * 16, NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var CHANNELS = [
    { id: 'kick', name: 'Kick', drum: 1, col: '#f9a03f' }, { id: 'snare', name: 'Snare', drum: 1, col: '#f9a03f' }, { id: 'hat', name: 'Hat', drum: 1, col: '#f9a03f' },
    { id: 'oh', name: 'Open Hat', drum: 1, col: '#f9a03f' }, { id: 'perc', name: 'Perc', drum: 1, col: '#f9a03f' },
    { id: 'rhodes', name: 'Rhodes', col: '#4fd1a1', lo: 48, hi: 79, len: 2 }, { id: 'bass', name: 'Sub Bass', col: '#5ea8ff', lo: 28, hi: 59, len: 2 },
    { id: 'pad', name: 'Warm Pad', col: '#c58bff', lo: 48, hi: 79, len: 8 }, { id: 'lead', name: 'Vibes', col: '#ff6b8b', lo: 60, hi: 91, len: 2 }
  ];
  var LANES = [['Drums', ['kick', 'snare', 'hat', 'oh', 'perc'], '#f9a03f'], ['Bass', ['bass'], '#5ea8ff'], ['Rhodes', ['rhodes'], '#4fd1a1'], ['Pad', ['pad'], '#c58bff'], ['Vibes', ['lead'], '#ff6b8b']];
  var CHORD = { Am7: [33, [57, 60, 64, 67]], Fmaj7: [29, [53, 57, 60, 64]], Cmaj7: [36, [55, 59, 60, 64]], G6: [31, [55, 59, 62, 64]], Dm7: [38, [53, 57, 60, 62]] };
  var PROG = ['Am7', 'Fmaj7', 'Cmaj7', 'G6', 'Am7', 'Fmaj7', 'Dm7', 'G6'];
  var MELODY = '-:2 E5:3 D5:1 C5:4 -:2 A4:4 | C5:4 A4:2 -:2 G4:2 A4:2 C5:4 | E5:6 D5:2 C5:4 -:2 B4:2 | D5:4 B4:2 -:2 G4:4 -:4 | -:2 E5:3 G5:1 A5:6 G5:2 E5:2 | F5:4 E5:2 C5:2 A4:6 -:2 | D5:4 F5:4 A5:4 G5:2 F5:2 | E5:6 D5:2 B4:4 G4:4';
  var NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(n) { var m = /^([A-G])(#|b)?(\d)$/.exec(n); return m ? 12 * (+m[3] + 1) + NOTE_BASE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : null; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function freq(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function mount(host) {
    if (!host || host._daw) return; host._daw = true;
    var S = { bpm: 84, swing: .2, playing: false, vol: .8, sel: 'lead' };
    var pat = { kick: '1000000100100000', snare: '0000100000001000', hat: '1010101010101010', oh: '0000000000000010', perc: '0010010000100100' };
    var drums = {}; Object.keys(pat).forEach(function (k) { drums[k] = pat[k].split('').map(Number); });
    var notes = { rhodes: [], bass: [], pad: [], lead: [] };
    PROG.forEach(function (c, b) {
      var d = CHORD[c], s0 = b * 16;
      [[0, 6], [8, 2], [11, 4]].forEach(function (x) { d[1].forEach(function (n) { notes.rhodes.push({ s: s0 + x[0], n: n, l: x[1] }); }); });
      d[1].slice(1).forEach(function (n) { notes.pad.push({ s: s0, n: n, l: 16 }); });
      [[0, 0, 3], [6, 7, 2], [10, 0, 2], [13, 12, 2]].forEach(function (x) { notes.bass.push({ s: s0 + x[0], n: d[0] + x[1], l: x[2] }); });
    });
    (function () { var pos = 0; MELODY.replace(/\|/g, ' ').trim().split(/\s+/).forEach(function (t) { var p = t.split(':'), l = +p[1] || 1, n = midi(p[0]); if (n !== null) notes.lead.push({ s: pos, n: n, l: l }); pos += l; }); })();
    var clipOn = LANES.map(function () { var r = []; for (var i = 0; i < BARS; i++) r.push(true); return r; });
    var muted = {}, gains = {}, level = {}, byStep = [];
    function rebuild() { byStep = []; for (var i = 0; i < TOTAL; i++) byStep.push([]); ['rhodes', 'bass', 'pad', 'lead'].forEach(function (id) { notes[id].forEach(function (n) { if (n.s >= 0 && n.s < TOTAL) byStep[n.s].push({ id: id, n: n.n, l: n.l }); }); }); }
    rebuild();
    function laneOf(id) { for (var i = 0; i < LANES.length; i++) if (LANES[i][1].indexOf(id) >= 0) return i; return 0; }

    // ---------- the screen ----------
    var menu = ['FILE', 'EDIT', 'ADD', 'PATTERNS', 'VIEW', 'OPTIONS', 'TOOLS', 'HELP'].map(function (m) { return '<span>' + m + '</span>'; }).join('');
    host.innerHTML = '<div class="daw"><div class="daw-menu">' + menu + '<em>Specoolasi - chill demo.flp</em></div>' +
      '<div class="daw-bar"><div class="daw-tr"><button class="b-play" aria-label="Play">&#9654;</button><button class="b-stop" aria-label="Stop">&#9632;</button><button class="b-rec" aria-label="Record" disabled>&#9679;</button></div>' +
      '<div class="lcd"><button class="b-bm" aria-label="Slower">&minus;</button><b class="bpm">84.000</b><small>BPM</small><button class="b-bp" aria-label="Faster">+</button></div>' +
      '<div class="lcd wide"><b class="time">1:01:00</b><small>BST</small></div><div class="lcd pt"><small>PAT</small><b>Pattern 1</b></div>' +
      '<label class="mv"><small>MASTER</small><input type="range" min="0" max="100" value="80" class="b-vol" aria-label="Master volume"></label><div class="cpu"><i></i><i></i><i></i><i></i></div></div>' +
      '<div class="daw-body"><aside class="daw-browser"><h4>Browser</h4><ul><li class="o">Current project</li><li>Recent files</li><li>Plugin database</li><li>Plugin presets</li><li class="o">Channel presets</li><li>Mixer presets</li><li>Scores</li><li class="o">Packs</li><li>Samples</li><li>Specoolasi Records</li></ul></aside>' +
      '<section class="daw-rack"><h4>Channel rack <small>Swing</small></h4><div class="rack"></div></section>' +
      '<section class="daw-pl"><h4>Playlist - Arrangement</h4><div class="scroll"><canvas class="pl"></canvas></div></section>' +
      '<section class="daw-roll"><h4>Piano roll - <b class="rn"></b></h4><div class="roll"><canvas class="keys"></canvas><div class="scroll"><canvas class="grid"></canvas></div></div></section>' +
      '<section class="daw-mix"><h4>Mixer</h4><div class="mix"></div></section></div>' +
      '<p class="daw-hint">Press play. Click the pads, click the piano roll to draw or delete notes, click the playlist to mute a bar, drag the faders.</p></div>';
    var $ = function (s) { return host.querySelector(s); };
    var rack = $('.rack'), mix = $('.mix'), plC = $('.pl'), gC = $('.grid'), kC = $('.keys'), timeEl = $('.time'), bpmEl = $('.bpm'), playB = $('.b-play');
    CHANNELS.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'ch'; row.dataset.id = c.id;
      var pads = ''; for (var i = 0; i < 16; i++) pads += '<i class="pad g' + (Math.floor(i / 4) % 2) + '" data-s="' + i + '"></i>';
      row.innerHTML = '<button class="led on" aria-label="Mute ' + c.name + '"></button><span class="knob"></span><button class="nm" style="--c:' + c.col + '">' + c.name + '</button><div class="pads">' + pads + '</div>';
      rack.appendChild(row);
    });
    CHANNELS.concat([{ id: 'master', name: 'Master', col: '#f9a03f' }]).forEach(function (c, i) {
      var s = document.createElement('div'); s.className = 'strip' + (c.id === 'master' ? ' m' : ''); s.dataset.id = c.id;
      s.innerHTML = '<canvas class="vu" width="16" height="96"></canvas><input type="range" class="fader" min="0" max="100" value="' + (c.id === 'master' ? 80 : 72) + '" aria-label="' + c.name + ' volume"><span class="pan"></span><b>' + (i + 1 > 9 ? 'M' : i + 1) + '</b><small>' + c.name + '</small>';
      mix.appendChild(s);
    });

    // ---------- sound ----------
    var AC = null, master = null, comp = null, verb = null, verbIn = null, noiseBuf = null, bus = {}, timer = null, nextTime = 0, stepIdx = 0, stepQ = [], curStep = 0, running = false;
    function makeIR(sec) { var n = Math.floor(AC.sampleRate * sec), b = AC.createBuffer(2, n, AC.sampleRate); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c), lp = 0; for (var i = 0; i < n; i++) { lp += (Math.random() * 2 - 1 - lp) * .35; d[i] = lp * Math.pow(1 - i / n, 2.6) * 1.8; } } return b; }
    function startAudio() {
      var AX = window.AudioContext || window.webkitAudioContext; if (!AX) return false;
      AC = new AX(); master = AC.createGain(); master.gain.value = S.vol; comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3.5; comp.attack.value = .01; comp.release.value = .2;
      var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 11000; master.connect(comp); comp.connect(lp);
      bus.master = AC.createAnalyser(); bus.master.fftSize = 256; lp.connect(bus.master); bus.master.connect(AC.destination);
      verbIn = AC.createGain(); verb = AC.createConvolver(); verb.buffer = makeIR(2.2); var vg = AC.createGain(); vg.gain.value = .5; verbIn.connect(verb); verb.connect(vg); vg.connect(master);
      noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      CHANNELS.forEach(function (c) { var g = AC.createGain(), an = AC.createAnalyser(); an.fftSize = 256; g.gain.value = parseFloat(mix.querySelector('.strip[data-id="' + c.id + '"] .fader').value) / 100; g.connect(an); an.connect(master); gains[c.id] = g; bus[c.id] = an; });
      var cr = AC.createBufferSource(), cg = AC.createGain(), ch = AC.createBiquadFilter(), cb = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate), cd = cb.getChannelData(0);   // quiet vinyl dust under everything
      for (i = 0; i < cd.length; i++) cd[i] = Math.random() < .0009 ? (Math.random() * 2 - 1) * .9 : (Math.random() * 2 - 1) * .012;
      cr.buffer = cb; cr.loop = true; ch.type = 'highpass'; ch.frequency.value = 1500; cg.gain.value = .12; cr.connect(ch); ch.connect(cg); cg.connect(master); cr.start();
      return true;
    }
    function env(t, a, d, peak, end) { var g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak * .0005), t + a + d); g.connect(end); return g; }
    function send(src, amt) { var g = AC.createGain(); g.gain.value = amt; src.connect(g); g.connect(verbIn); }
    function noiseHit(t, dur, vol, type, f, q, out) {
      var s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = env(t, .002, dur, vol, out); s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q || .7; s.connect(fl); fl.connect(g); s.start(t, Math.random() * .6); s.stop(t + dur + .05); return g;
    }
    function play(id, t, n, len, vel) {
      if (muted[id] || !gains[id]) return; var out = gains[id], dur = len * 60 / S.bpm / 4, v = vel || 1, o, g;
      if (id === 'kick') {
        o = AC.createOscillator(); g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(155, t); o.frequency.exponentialRampToValueAtTime(46, t + .13);
        g.gain.setValueAtTime(.9 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .42); o.connect(g); g.connect(out); o.start(t); o.stop(t + .45); noiseHit(t, .012, .35 * v, 'highpass', 2500, .5, out);
      } else if (id === 'snare') {
        noiseHit(t, .2, .42 * v, 'bandpass', 2100, .8, out); o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(140, t + .09); g = env(t, .002, .11, .3 * v, out); o.connect(g); o.start(t); o.stop(t + .15);
        send(g, .6);
      } else if (id === 'hat') { noiseHit(t, .04, .22 * v, 'highpass', 8200, .8, out);
      } else if (id === 'oh') { noiseHit(t, .3, .2 * v, 'highpass', 7000, .7, out);
      } else if (id === 'perc') { o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(820, t); o.frequency.exponentialRampToValueAtTime(520, t + .05); g = env(t, .001, .08, .22 * v, out); o.connect(g); o.start(t); o.stop(t + .1); noiseHit(t, .03, .1 * v, 'bandpass', 5000, 2, out);
      } else if (id === 'rhodes') {            // electric piano: two slightly detuned FM voices with a short bell tine
        var f = freq(n), life = Math.min(2.2, .9 + dur * .8);
        [-4, 4].forEach(function (cents) {
          var car = AC.createOscillator(), mod = AC.createOscillator(), mg = AC.createGain(), cg = env(t, .004, life, .16 * v, out), lp = AC.createBiquadFilter();
          car.type = 'sine'; mod.type = 'sine'; car.frequency.value = f; car.detune.value = cents; mod.frequency.value = f; mg.gain.setValueAtTime(f * 1.5, t); mg.gain.exponentialRampToValueAtTime(f * .12, t + .45);
          mod.connect(mg); mg.connect(car.frequency); lp.type = 'lowpass'; lp.frequency.value = 3800; car.connect(lp); lp.connect(cg); send(cg, .22);
          car.start(t); mod.start(t); car.stop(t + life + .1); mod.stop(t + life + .1);
        });
        var tn = AC.createOscillator(), tg = env(t, .001, .09, .05 * v, out); tn.type = 'sine'; tn.frequency.value = f * 14; tn.connect(tg); tn.start(t); tn.stop(t + .12);
      } else if (id === 'bass') {
        var fb = freq(n), so = AC.createOscillator(), sw = AC.createOscillator(), lpf = AC.createBiquadFilter(), bg = env(t, .008, Math.max(.35, dur * .9), .55 * v, out);
        so.type = 'sine'; sw.type = 'sawtooth'; so.frequency.value = fb; sw.frequency.value = fb; lpf.type = 'lowpass'; lpf.frequency.setValueAtTime(700, t); lpf.frequency.exponentialRampToValueAtTime(160, t + .3);
        var sg = AC.createGain(); sg.gain.value = .35; sw.connect(sg); sg.connect(lpf); so.connect(bg); lpf.connect(bg); so.start(t); sw.start(t); so.stop(t + dur + .6); sw.stop(t + dur + .6);
      } else if (id === 'pad') {
        var pf = freq(n), lpp = AC.createBiquadFilter(), pg = AC.createGain(), hold = Math.max(.8, dur);
        lpp.type = 'lowpass'; lpp.frequency.value = 900; pg.gain.setValueAtTime(.0001, t); pg.gain.linearRampToValueAtTime(.05 * v, t + .5); pg.gain.setValueAtTime(.05 * v, t + hold); pg.gain.linearRampToValueAtTime(.0001, t + hold + .9);
        [-8, 0, 8].forEach(function (c) { var os = AC.createOscillator(); os.type = 'sawtooth'; os.frequency.value = pf; os.detune.value = c; os.connect(lpp); os.start(t); os.stop(t + hold + 1); });
        lpp.connect(pg); pg.connect(out); send(pg, .5);
      } else if (id === 'lead') {              // vibes / marimba style pluck
        var fl = freq(n); [[1, .22, 1.3], [4, .06, .35], [10, .02, .12]].forEach(function (p) { var os = AC.createOscillator(), gg = env(t, .003, p[2] + dur * .3, p[1] * v, out); os.type = 'sine'; os.frequency.value = fl * p[0]; os.connect(gg); send(gg, .35); os.start(t); os.stop(t + p[2] + dur * .3 + .1); });
      }
    }

    // ---------- sequencer ----------
    function scheduleStep(i, t) {
      var step = i % 16, bar = Math.floor(i / 16), stepDur = 60 / S.bpm / 4, sw = (step % 2 === 1) ? S.swing * stepDur * .6 : 0, tt = t + sw;
      stepQ.push({ t: t, i: i });
      ['kick', 'snare', 'hat', 'oh', 'perc'].forEach(function (id) { if (drums[id][step] && clipOn[0][bar]) play(id, tt + rand(-.004, .004), 0, 1, rand(.82, 1)); });
      byStep[i].forEach(function (e) { var li = laneOf(e.id); if (clipOn[li][bar]) play(e.id, tt + rand(-.005, .005), e.n, e.l, rand(.8, 1)); });
    }
    function scheduler() {
      while (nextTime < AC.currentTime + (document.hidden ? 1.2 : .14)) { scheduleStep(stepIdx, nextTime); nextTime += 60 / S.bpm / 4; stepIdx = (stepIdx + 1) % TOTAL; }
    }
    function doPlay() {
      if (!AC && !startAudio()) return; if (AC.state === 'suspended') AC.resume();
      if (S.playing) { doStop(); return; }
      S.playing = true; stepIdx = 0; stepQ = []; nextTime = AC.currentTime + .08; timer = setInterval(scheduler, 25); scheduler(); playB.classList.add('on'); loop();
    }
    function doStop() { S.playing = false; clearInterval(timer); playB.classList.remove('on'); stepQ = []; curStep = 0; draw(); timeEl.textContent = '1:01:00'; }

    // ---------- drawing ----------
    function size(c, w, h) { var dp = Math.min(window.devicePixelRatio || 1, 2); c.width = w * dp; c.height = h * dp; c.style.width = w + 'px'; c.style.height = h + 'px'; var x = c.getContext('2d'); x.setTransform(dp, 0, 0, dp, 0, 0); return x; }
    var CW = 14, CH = 12;
    function drawRack() {
      CHANNELS.forEach(function (c) {
        var row = rack.querySelector('.ch[data-id="' + c.id + '"]'), pads = row.querySelectorAll('.pad');
        for (var i = 0; i < 16; i++) {
          var on = 0;
          if (c.drum) on = drums[c.id][i]; else for (var b = 0; b < BARS; b++) { var l = byStep[b * 16 + i]; for (var k = 0; k < l.length; k++) if (l[k].id === c.id) on = 1; }
          pads[i].classList.toggle('on', !!on); pads[i].classList.toggle('cur', S.playing && (curStep % 16) === i);
        }
        row.classList.toggle('sel', S.sel === c.id); row.querySelector('.led').classList.toggle('on', !muted[c.id]);
      });
    }
    function drawRoll() {
      var c = CHANNELS.filter(function (x) { return x.id === S.sel; })[0] || CHANNELS[8]; if (c.drum) c = CHANNELS[8];
      $('.rn').textContent = c.name; var rows = c.hi - c.lo + 1, kw = 54, w = TOTAL * CW, h = rows * CH;
      var kx = size(kC, kw, h); for (var r = 0; r < rows; r++) { var n = c.hi - r, bl = NAMES[n % 12].length > 1; kx.fillStyle = bl ? '#14171a' : '#e9ecef'; kx.fillRect(0, r * CH, bl ? kw * .62 : kw, CH - 1); if (!bl && n % 12 === 0) { kx.fillStyle = '#555'; kx.font = '9px sans-serif'; kx.fillText('C' + (Math.floor(n / 12) - 1), kw - 18, r * CH + CH - 3); } }
      var g = size(gC, w, h); g.fillStyle = '#2e3338'; g.fillRect(0, 0, w, h);
      for (r = 0; r < rows; r++) { var nn = c.hi - r; g.fillStyle = NAMES[nn % 12].length > 1 ? '#262a2e' : '#32373c'; g.fillRect(0, r * CH, w, CH); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, r * CH + CH - 1, w, 1); }
      for (var s = 0; s <= TOTAL; s++) { g.fillStyle = s % 16 === 0 ? 'rgba(255,255,255,.28)' : s % 4 === 0 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.04)'; g.fillRect(s * CW, 0, 1, h); }
      (notes[c.id] || []).forEach(function (nt) { var y = (c.hi - nt.n) * CH; if (y < 0 || y > h) return; var x = nt.s * CW, nw = nt.l * CW - 1; g.fillStyle = c.col; g.fillRect(x, y + 1, nw, CH - 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y + 1, nw, 2); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, y + CH - 3, nw, 1); });
      if (S.playing) { g.fillStyle = '#f9a03f'; g.fillRect((curStep + .5) * CW, 0, 2, h); }
      gC._cfg = c;
    }
    function drawPlaylist() {
      var lw = 64, w = lw + BARS * 100, h = LANES.length * 34 + 22, g = size(plC, w, h); g.fillStyle = '#2a2f34'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#20242a'; g.fillRect(0, 0, w, 20); g.font = '10px sans-serif';
      for (var b = 0; b < BARS; b++) { g.fillStyle = '#aab'; g.fillText(String(b + 1), lw + b * 100 + 4, 14); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(lw + b * 100, 0, 1, h); }
      LANES.forEach(function (ln, i) {
        var y = 22 + i * 34; g.fillStyle = '#343a40'; g.fillRect(0, y, lw, 32); g.fillStyle = '#d6dae0'; g.font = '11px sans-serif'; g.fillText(ln[0], 8, y + 20);
        for (var b = 0; b < BARS; b++) {
          var on = clipOn[i][b], bx = lw + b * 100; g.globalAlpha = on ? .9 : .55; g.fillStyle = on ? ln[2] : '#3a4046'; g.fillRect(bx + 2, y + 1, 96, 30); g.globalAlpha = 1;
          g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(bx + 2, y + 1, 96, 7); g.fillStyle = on ? '#10151a' : '#8a929a'; g.font = '9px sans-serif'; g.fillText(ln[0] + ' ' + (b + 1), bx + 6, y + 8);
          if (on) {
            g.fillStyle = 'rgba(0,0,0,.45)';
            ln[1].forEach(function (id) { (notes[id] || []).forEach(function (nt) { if (nt.s >= b * 16 && nt.s < b * 16 + 16) g.fillRect(bx + 4 + (nt.s - b * 16) * 5.8, y + 11 + (1 - (nt.n % 24) / 24) * 14, Math.max(2, nt.l * 5.8 - 1), 2); }); });
            if (i === 0) for (var k = 0; k < 16; k++) if (drums.kick[k] || drums.snare[k]) g.fillRect(bx + 4 + k * 5.8, y + 14 + (drums.snare[k] ? 0 : 8), 3, 4);
          }
        }
      });
      if (S.playing) { g.fillStyle = '#f9a03f'; g.fillRect(lw + (curStep / 16) * 100, 0, 2, h); }
    }
    function draw() { drawRack(); drawRoll(); drawPlaylist(); }
    function drawMeters() {
      var buf = new Uint8Array(128);
      mix.querySelectorAll('.strip').forEach(function (s) {
        var id = s.dataset.id, an = bus[id], v = 0;
        if (an && (S.playing || (level[id] || 0) > .01)) { an.getByteTimeDomainData(buf); var pk = 0; for (var i = 0; i < buf.length; i++) pk = Math.max(pk, Math.abs(buf[i] - 128) / 128); v = pk; }
        level[id] = Math.max(v, (level[id] || 0) * .88);
        var c = s.querySelector('.vu'), g = c.getContext('2d'), h = 96, segs = 20, lit = Math.round(clamp(level[id] * (id === 'master' ? 2.4 : 3.2), 0, 1) * segs);
        g.clearRect(0, 0, 16, h); for (var k = 0; k < segs; k++) { g.fillStyle = k < lit ? (k > 16 ? '#ff5252' : k > 12 ? '#f9d03f' : '#6fd36a') : '#1c2024'; g.fillRect(2, h - (k + 1) * (h / segs), 12, h / segs - 1.5); }
      });
    }
    function loop() {
      if (running) return; running = true;
      (function f() {
        if (AC && S.playing) { while (stepQ.length > 1 && stepQ[1].t <= AC.currentTime) stepQ.shift(); if (stepQ.length && stepQ[0].t <= AC.currentTime) curStep = stepQ[0].i; var st = curStep; timeEl.textContent = (Math.floor(st / 16) + 1) + ':0' + (Math.floor((st % 16) / 4) + 1) + ':0' + (st % 4); }
        if (S.playing) { drawRack(); drawRoll(); drawPlaylist(); }
        drawMeters();
        var quiet = !S.playing && Object.keys(level).every(function (k) { return level[k] < .01; });
        if (quiet) { running = false; return; } requestAnimationFrame(f);
      })();
    }

    // ---------- interaction ----------
    playB.addEventListener('click', doPlay); $('.b-stop').addEventListener('click', doStop);
    function setBpm(v) { S.bpm = clamp(Math.round(v), 60, 160); bpmEl.textContent = S.bpm + '.000'; }
    $('.b-bm').addEventListener('click', function () { setBpm(S.bpm - 2); }); $('.b-bp').addEventListener('click', function () { setBpm(S.bpm + 2); });
    $('.b-vol').addEventListener('input', function (e) { S.vol = e.target.value / 100; if (master) master.gain.value = S.vol; });
    mix.addEventListener('input', function (e) { var st = e.target.closest('.strip'); if (!st || !e.target.classList.contains('fader')) return; var v = e.target.value / 100; if (st.dataset.id === 'master') { S.vol = v; if (master) master.gain.value = v; } else if (gains[st.dataset.id]) gains[st.dataset.id].gain.value = v; });
    rack.addEventListener('click', function (e) {
      var row = e.target.closest('.ch'); if (!row) return; var id = row.dataset.id, c = CHANNELS.filter(function (x) { return x.id === id; })[0];
      if (e.target.classList.contains('pad') && c.drum) { var s = +e.target.dataset.s; drums[id][s] = drums[id][s] ? 0 : 1; if (drums[id][s] && AC && AC.state === 'running' && !S.playing) play(id, AC.currentTime + .01, 0, 1, 1); }
      else if (e.target.classList.contains('led')) muted[id] = !muted[id];
      else if (!c.drum) S.sel = id;
      draw();
    });
    gC.addEventListener('pointerdown', function (e) {
      var c = gC._cfg; if (!c) return; var b = gC.getBoundingClientRect(), s = Math.floor((e.clientX - b.left) / CW), n = c.hi - Math.floor((e.clientY - b.top) / CH), list = notes[c.id], hit = -1;
      list.forEach(function (nt, i) { if (nt.n === n && s >= nt.s && s < nt.s + nt.l) hit = i; });
      if (hit >= 0) list.splice(hit, 1);
      else if (s >= 0 && s < TOTAL) { list.push({ s: s, n: n, l: c.len }); if (!AC) startAudio(); if (AC && AC.state === 'suspended') AC.resume(); if (AC && !S.playing) play(c.id, AC.currentTime + .01, n, c.len, 1); }
      rebuild(); draw();
    });
    plC.addEventListener('pointerdown', function (e) { var b = plC.getBoundingClientRect(), x = e.clientX - b.left - 64, y = e.clientY - b.top - 22, bar = Math.floor(x / 100), ln = Math.floor(y / 34); if (bar >= 0 && bar < BARS && ln >= 0 && ln < LANES.length) { clipOn[ln][bar] = !clipOn[ln][bar]; draw(); } });
    addEventListener('keydown', function (e) { if (e.code === 'Space' && host.contains(document.activeElement) && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); doPlay(); } });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
    draw(); drawMeters();
  }
  window.DAW = { mount: mount };
})();
