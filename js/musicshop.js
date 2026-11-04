// MUSIC PRODUCTION PAGE: a record shop from the roof down to the floor (css/music-shop.css).
// services.js calls  MusicShop.render(element, data)  and, when your Sanity works arrive, MusicShop.update(records).
// Records come from the "music" list in js/services.js (or from Sanity). The crates grow by themselves.
(function () {
  var mq = window.matchMedia('(max-width:640px)');
  var ZONES = [['Roof', 'ms-roof'], ['Window', 'ms-window'], ['Shelves', 'ms-inside'], ['Counter', 'ms-counter'], ['Floor', 'ms-floor']];
  var current = [];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function art(r, i) {
    var title = r.title || 'Untitled';
    if (r.img) return '<span class="ms-art"><img src="' + esc(r.img) + '" alt="" draggable="false" loading="lazy"></span>';
    return '<span class="ms-art"><span class="ms-gen" style="--h:' + ((250 + i * 47) % 360) + '"><b>' + esc(title) + '</b><i>' + esc(r.client || r.tag || 'Specoolasi') + '</i></span></span>';
  }
  function bins(list) {
    var per = mq.matches ? 3 : 4, tilt = [-2.2, 1.2, -.8, 2, -1.4, .9, -2, 1.6], lift = [0, 8, 3, 10, 2, 9, 1, 7], n = list.length, crates = Math.max(1, Math.ceil(n / per)), h = '', c, j, k, cnt;
    for (c = 0; c < crates; c++) {
      h += '<div class="ms-crate"><ul class="ms-sleeves">';
      cnt = 0;
      for (j = 0; j < per; j++) {
        k = c * per + j; if (!list[k]) continue; cnt++;
        h += '<li><button type="button" class="ms-sl" data-i="' + k + '" style="--r:' + tilt[k % 8] + 'deg;--y:' + lift[k % 8] + 'px" aria-label="Pull out ' + esc(list[k].title || 'record') + (list[k].client ? ' by ' + esc(list[k].client) : '') + '">' + art(list[k], k) + '</button></li>';
      }
      h += '</ul><div class="ms-face"><b>Crate ' + String.fromCharCode(65 + c) + '</b><small>' + cnt + (cnt === 1 ? ' record' : ' records') + '</small></div></div>';
    }
    return h;
  }
  function zone(cls, label, inner) { return '<section class="ms-z ' + cls + '" id="' + cls + '" data-z="' + label + '">' + inner + '</section>'; }

  function render(root, d) {
    current = d.records || [];
    if (window.VinylStore && VinylStore.load) VinylStore.load(current);
    var rot = [-2, 1.5, -1, 2.2];
    var posters = d.items.map(function (x, i) { return '<article class="ms-poster" style="--r:' + rot[i % 4] + 'deg"><b>No. 0' + (i + 1) + '</b><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></article>'; }).join('');
    var slips = d.steps.map(function (x, i) { var r = [-1.6, 1.2, -.8, 1.8][i % 4]; return '<div class="ms-slip" style="--r:' + r + 'deg"><small>STEP 0' + (i + 1) + '</small><hr><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></div>'; }).join('');
    var lift = ZONES.map(function (z) { return '<a href="#' + z[1] + '" data-go="' + z[1] + '"><span>' + z[0] + '</span><i></i></a>'; }).join('');

    root.innerHTML = '<div class="ms">' +
      zone('ms-roof', 'Roof',
        '<div class="ms-sky"></div><div class="ms-tiles"></div>' +
        '<div class="ms-facade"><div class="ms-wrap">' +
        '<a class="back" href="index.html#services">← All services</a>' +
        '<p class="mono" style="margin-top:1.4rem"><b>(' + esc(d.n) + ' / 05)</b> Service</p>' +
        '<div class="ms-neon"><span class="ms-script">Specoolasi</span><span class="ms-tube">RECORDS</span></div>' +
        '<div class="ms-board"><h1>' + esc(d.title) + '</h1></div>' +
        '<p class="ms-intro">' + esc(d.intro) + '</p>' +
        '<div class="ms-cta"><a class="ms-brass" href="' + esc(d.mail) + '">Start a project →</a></div>' +
        '</div></div>') +
      zone('ms-window', 'Window',
        '<div class="ms-awning"></div><div class="ms-wrap"><div class="ms-glass">' +
        '<p class="ms-wtitle">WHAT WE DO · ' + esc(d.title.toUpperCase()) + '</p><div class="ms-posters">' + posters + '</div>' +
        '<div class="ms-open">OPEN</div></div></div>') +
      zone('ms-inside', 'Shelves',
        '<div class="ms-beam"></div><div class="ms-wrap"><p class="mono"><b>(A)</b> Results</p><h2>Pick a record.</h2>' +
        '<p class="ms-lead">Welcome inside. Every record in these crates is something we made.</p>' +
        '<p class="ms-hint">Tap a record to pull it out, spin it and see the details</p><div class="ms-bins" id="ms-bins">' + bins(current) + '</div></div>') +
      zone('ms-counter', 'Counter',
        '<div class="ms-wrap"><p class="mono"><b>(B)</b> How it works</p><h2>Four steps. No mystery.</h2>' +
        '<div class="ms-top"><div class="ms-row"><div class="ms-deck" aria-hidden="true"><div class="ms-plat"></div><div class="ms-pivot"></div><div class="ms-arm"></div></div>' +
        '<div class="ms-slips">' + slips + '</div></div></div></div>') +
      zone('ms-floor', 'Floor',
        '<div class="ms-wrap"><div class="ms-rug"><p class="mono">Ready?</p><h2>Let’s talk about your ' + esc(d.title.toLowerCase()) + '.</h2>' +
        '<p>Send us a short note about your brand and what you need. We will reply as soon as we can.</p><a class="ms-brass" href="' + esc(d.mail) + '">Start a project →</a></div>' +
        (d.next ? '<a class="ms-mat" href="service.html?id=' + esc(d.next.id) + '"><span><small>Next service</small>' + esc(d.next.title) + '</span><span>→</span></a>' : '') + '</div>') +
      '<nav class="ms-lift" aria-label="Where you are in the shop">' + lift + '</nav></div>';

    if (!root._ms) {
      root._ms = true;
      root.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.ms-sl');
        if (b && window.VinylStore) VinylStore.open(+b.dataset.i, b);
      });
      var rebin = function () { var el = document.getElementById('ms-bins'); if (el) el.innerHTML = bins(current); };
      if (mq.addEventListener) mq.addEventListener('change', rebin); else if (mq.addListener) mq.addListener(rebin);
    }
    watch(root);
  }

  // marks the lift stop that matches the part of the shop in the middle of the screen
  function watch(root) {
    var links = root.querySelectorAll('.ms-lift a'), zs = root.querySelectorAll('.ms-z');
    function mark(id) { links.forEach(function (a) { a.classList.toggle('on', a.dataset.go === id); }); }
    mark('ms-roof');
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); }); }, { rootMargin: '-50% 0px -50% 0px' });
    zs.forEach(function (z) { io.observe(z); });
  }

  function update(list) {
    current = list || [];
    if (window.VinylStore && VinylStore.load) VinylStore.load(current);
    var el = document.getElementById('ms-bins'); if (el) el.innerHTML = bins(current);
  }

  window.MusicShop = { render: render, update: update };
})();
