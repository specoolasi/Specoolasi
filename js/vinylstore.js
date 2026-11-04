// VINYL STORE: the cabinet of records on the Music production page.
// services.js calls  VinylStore.mount(element, listOfTracks)  with your music list.
// The cabinet holds 4 records per shelf unit and always shows at least 2 units (8 slots).
// When you have more music than slots, extra shelf units are added automatically.
(function () {
  var PER_UNIT = 4, MIN_UNITS = 2;
  var calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var recs = [], vm = null, cur = null, timers = [];

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // one tidy shape for every record, whatever fields you filled in
  function norm(r, i) {
    var tracks = (r.tracks && r.tracks.length) ? r.tracks.map(function (t) { return { title: t.title || '', length: t.length || '' }; })
      : [{ title: r.title || 'Untitled', length: r.length || '' }];
    return {
      title: r.title || 'Untitled', artist: r.client || '', tag: r.tag || '', year: r.year || '', length: r.length || '',
      desc: r.desc || '', link: r.link || '', audio: r.audio || '', img: r.big || r.img || '', thumb: r.img || '',
      tracks: tracks, hue: (250 + i * 47) % 360
    };
  }
  function cover(d, noText) {
    if (d.img) return '<img src="' + esc(d.thumb || d.img) + '" alt="" draggable="false" loading="lazy">';
    return '<span class="vs-gen' + (noText ? ' nt' : '') + '" style="--h:' + d.hue + '"><b>' + esc(d.title) + '</b><i>✦</i></span>';
  }
  function bigCover(d, noText) {
    if (d.img) return '<img src="' + esc(d.img) + '" alt="" draggable="false">';
    return cover(d, noText);
  }

  // ---------- the cabinet ----------
  function mount(root, list) {
    if (!root) return;
    recs = (list || []).map(norm);
    var n = recs.length, units = Math.max(MIN_UNITS, Math.ceil(n / PER_UNIT)), h = '', u, j, k;
    for (u = 0; u < units; u++) {
      h += '<div class="vs-unit">';
      for (j = 0; j < PER_UNIT; j++) {
        k = u * PER_UNIT + j;
        var d = recs[k];
        if (d) h += '<div class="vs-cell"><span class="vs-stack"></span><span class="vs-stack b"></span>' +
          '<button type="button" class="vs-rec" data-i="' + k + '" style="--k:' + k + '" aria-label="Pull out ' + esc(d.title) + (d.artist ? ' by ' + esc(d.artist) : '') + '"><span class="vs-cov">' + cover(d) + '</span></button>' +
          '<i class="vs-wing l"></i><i class="vs-wing r"></i><i class="vs-bar"></i><span class="vs-tray"><em>' + esc(d.title) + '</em></span></div>';
        else h += '<div class="vs-cell"><i class="vs-wing l"></i><i class="vs-wing r"></i><i class="vs-bar"></i><span class="vs-tray"></span></div>';
      }
      h += '</div>';
    }
    root.innerHTML = '<div class="vs-room">' +
      '<div class="vs-decor vs-gold"><i></i><span>500 PLAYS CLUB</span></div>' +
      '<div class="vs-decor vs-poster"><b>Specoolasi Records</b><small>MADE HERE · PLAYED EVERYWHERE</small></div>' +
      '<div class="vs-cabwrap"><div class="vs-chalk"><b>New arrivals</b><small>' + n + (n === 1 ? ' record' : ' records') + ' on the shelf</small></div>' +
      '<div class="vs-cab"><i class="vs-leg a"></i><i class="vs-leg b"></i>' + h + '</div></div><div class="vs-floor"></div></div>';
    root.onclick = function (e) {
      var b = e.target.closest && e.target.closest('.vs-rec');
      if (b) openRec(+b.dataset.i, b);
    };
  }

  // ---------- the viewer ----------
  var rot, fly, stage, rx = 0, ry = 0, vx = 0, vy = 0, touched = false, drag = false, resetting = false, raf = 0, lx = 0, ly = 0, audio = null;

  function build() {
    if (vm) return;
    vm = document.createElement('div');
    vm.className = 'vm'; vm.setAttribute('role', 'dialog'); vm.setAttribute('aria-modal', 'true'); vm.setAttribute('aria-labelledby', 'vm-t');
    vm.innerHTML = '<div class="vm-bg"></div><button type="button" class="vm-x" aria-label="Close">×</button>' +
      '<div class="vm-stage" tabindex="0" aria-label="Record viewer. Drag, or use the arrow keys, to rotate.">' +
        '<div class="vm-shadow"></div>' +
        '<div class="vm-fly"><div class="vm-shift"><div class="vm-rot">' +
          '<div class="vd"><div class="vd-f"><div class="vd-spin"><div class="vd-lb" data-lb></div></div><i class="vd-sheen"></i></div>' +
          '<div class="vd-b"><div class="vd-spin"><div class="vd-lb" data-lb></div></div><i class="vd-sheen"></i></div></div>' +
          '<div class="vk"><i class="vk-e l"></i><i class="vk-e r"></i><i class="vk-e t"></i><i class="vk-e b2"></i><div class="vk-f" data-front></div><div class="vk-b" data-back></div></div>' +
        '</div></div></div>' +
        '<div class="vm-ctl"><span>Drag to rotate</span><button type="button" data-act="spin">Spin</button><button type="button" data-act="reset">Reset view</button></div>' +
      '</div>' +
      '<aside class="vm-card"><div class="vm-paper" data-card></div></aside>';
    document.body.appendChild(vm);
    rot = vm.querySelector('.vm-rot'); fly = vm.querySelector('.vm-fly'); stage = vm.querySelector('.vm-stage');

    vm.querySelector('.vm-x').addEventListener('click', closeRec);
    vm.querySelector('.vm-bg').addEventListener('click', closeRec);
    vm.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'spin') setSpin(!vm.classList.contains('spin'));
      if (a.dataset.act === 'reset') { resetting = true; touched = true; vx = vy = 0; }
      if (a.dataset.act === 'play') togglePlay(a);
    });
    // drag to rotate
    stage.addEventListener('pointerdown', function (e) {
      drag = true; touched = true; resetting = false; lx = e.clientX; ly = e.clientY; vx = vy = 0;
      try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      ry += dx * 0.55; rx = Math.max(-55, Math.min(55, rx - dy * 0.4)); vy = dx * 0.55; vx = -dy * 0.4;
    });
    function up() { drag = false; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('keydown', function (e) {
      var m = { ArrowLeft: [0, -12], ArrowRight: [0, 12], ArrowUp: [-8, 0], ArrowDown: [8, 0] }[e.key];
      if (!m) return; e.preventDefault(); touched = true; resetting = false; vx = m[0] * 0.3; vy = m[1] * 0.3;
    });
    // keep Tab inside the popup, Esc closes
    document.addEventListener('keydown', function (e) {
      if (!vm || !vm.classList.contains('on')) return;
      if (e.key === 'Escape') { closeRec(); return; }
      if (e.key !== 'Tab') return;
      var f = [].slice.call(vm.querySelectorAll('button,a[href],[tabindex="0"]')).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function paint() {
    rot.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    var f = vm.querySelector('.vk-f'); if (f) f.style.setProperty('--gp', (50 + 48 * Math.sin(ry * Math.PI / 180)).toFixed(1) + '%');
  }
  function loop(ts) {
    if (resetting) {
      var ty = Math.round(ry / 360) * 360; ry += (ty - ry) * 0.14; rx += (0 - rx) * 0.14; vx = vy = 0;
      if (Math.abs(ty - ry) < 0.3 && Math.abs(rx) < 0.3) { ry = 0; rx = 0; resetting = false; touched = false; }
    } else if (!drag) {
      if (!touched && !calm) { ry = Math.sin(ts / 1500) * 18; rx = Math.sin(ts / 2100) * 6; }
      else { ry += vy; rx = Math.max(-55, Math.min(55, rx + vx)); vy *= 0.94; vx *= 0.94; }
    }
    paint(); raf = requestAnimationFrame(loop);
  }
  function setSpin(on) {
    vm.classList.toggle('spin', on);
    var b = vm.querySelector('[data-act="spin"]'); if (b) b.textContent = on ? 'Pause spin' : 'Spin';
  }
  function togglePlay(btn) {
    if (!audio) return;
    if (audio.paused) { audio.play(); setSpin(true); btn.innerHTML = '❚❚ Pause'; }
    else { audio.pause(); setSpin(false); btn.innerHTML = '▶ Play preview'; }
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function openRec(i, btn) {
    var d = recs[i]; if (!d) return;
    build(); clearTimers();
    cur = { i: i, btn: btn };
    // fill the sleeve, the record label and the details
    vm.querySelector('[data-front]').innerHTML = bigCover(d);
    vm.querySelectorAll('[data-lb]').forEach(function (el) { el.innerHTML = bigCover(d, true); });
    vm.querySelector('[data-back]').innerHTML = '<small>SIDE A</small><b>' + esc(d.title) + '</b><ol>' + d.tracks.map(function (t, k) {
      return '<li><span>' + pad(k + 1) + '</span>' + esc(t.title) + (t.length ? '<em>' + esc(t.length) + '</em>' : '') + '</li>'; }).join('') + '</ol><p>SPECOOLASI RECORDS</p>';
    var chips = [d.year, d.length && d.tracks.length < 2 ? d.length : '', d.tracks.length > 1 ? d.tracks.length + ' tracks' : ''].filter(Boolean);
    vm.querySelector('[data-card]').innerHTML =
      '<p class="mono"><b>(Now spinning)</b>' + (d.tag ? ' # ' + esc(d.tag) : '') + '</p><h2 id="vm-t">' + esc(d.title) + '</h2>' +
      (d.artist ? '<p class="vm-by">' + esc(d.artist) + '</p>' : '') +
      (chips.length ? '<ul class="vm-chips">' + chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      (d.desc ? '<p class="vm-desc">' + esc(d.desc) + '</p>' : '') +
      '<ol class="vm-tracks">' + d.tracks.map(function (t, k) { return '<li><span>' + pad(k + 1) + '</span><b>' + esc(t.title) + '</b>' + (t.length ? '<em>' + esc(t.length) + '</em>' : '') + '</li>'; }).join('') + '</ol>' +
      '<div class="vm-act">' + (d.audio ? '<button type="button" class="bt" data-act="play">▶ Play preview</button>' : '') +
      (d.link ? '<a class="bt' + (d.audio ? ' alt' : '') + '" href="' + esc(d.link) + '" target="_blank" rel="noopener">Listen ↗</a>' : '') + '</div>';
    if (audio) { audio.pause(); audio = null; }
    if (d.audio) { audio = new Audio(d.audio); audio.addEventListener('ended', function () { setSpin(false); var p = vm.querySelector('[data-act="play"]'); if (p) p.innerHTML = '▶ Play preview'; }); }

    rx = ry = vx = vy = 0; touched = false; resetting = false; drag = false;
    rot.style.transform = ''; setSpin(false);
    vm.className = 'vm on'; document.documentElement.classList.add('vs-lock');
    // fly from the shelf to the middle of the screen (FLIP)
    fly.style.transition = 'none'; fly.style.transform = '';
    var sr = fly.getBoundingClientRect(), fr = btn.getBoundingClientRect();
    if (!calm) fly.style.transform = 'translate(' + ((fr.left + fr.width / 2) - (sr.left + sr.width / 2)) + 'px,' + ((fr.top + fr.height / 2) - (sr.top + sr.height / 2)) + 'px) scale(' + (fr.width / sr.width) + ')';
    void fly.offsetWidth;
    btn.classList.add('pulled');
    vm.classList.add('open');
    requestAnimationFrame(function () {
      fly.style.transition = calm ? 'none' : 'transform .85s cubic-bezier(.2,.85,.25,1)'; fly.style.transform = '';
    });
    later(function () {
      vm.classList.add('out'); if (!calm) setSpin(true);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      stage.focus({ preventScroll: true });
    }, calm ? 60 : 800);
  }

  function closeRec() {
    if (!cur || !vm.classList.contains('on')) return;
    clearTimers();
    var c = cur; cur = null;
    if (audio) { audio.pause(); audio = null; }
    setSpin(false); vm.classList.remove('out');
    resetting = true; touched = true; vx = vy = 0;
    later(function () {
      var sr = fly.getBoundingClientRect(), fr = c.btn.getBoundingClientRect();
      if (!calm) {
        fly.style.transition = 'transform .75s cubic-bezier(.55,0,.25,1)';
        fly.style.transform = 'translate(' + ((fr.left + fr.width / 2) - (sr.left + sr.width / 2)) + 'px,' + ((fr.top + fr.height / 2) - (sr.top + sr.height / 2)) + 'px) scale(' + (fr.width / sr.width) + ')';
      }
      vm.classList.remove('open');
    }, calm ? 0 : 500);
    later(function () {
      cancelAnimationFrame(raf);
      vm.className = 'vm'; c.btn.classList.remove('pulled');
      document.documentElement.classList.remove('vs-lock');
      try { c.btn.focus({ preventScroll: true }); } catch (x) {}
    }, calm ? 80 : 1280);
  }

  window.VinylStore = { mount: mount, load: function (list) { recs = (list || []).map(norm); }, open: function (i, btn) { openRec(i, btn); } };
})();
