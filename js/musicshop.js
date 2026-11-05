// MUSIC PRODUCTION PAGE: a record shop from the roof down to the floor (css/music-shop.css).
// services.js calls  MusicShop.render(element, data)  and, when your Sanity works arrive, MusicShop.update(records).
// Records come from the "music" list in js/services.js (or from Sanity). The crates grow by themselves.
(function () {
  var ZONES = [['Roof', 'ms-roof'], ['Window', 'ms-window'], ['Shelves', 'ms-inside'], ['Counter', 'ms-counter'], ['Floor', 'ms-floor']];
  var current = [];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function art(r, i) {
    var title = r.title || 'Untitled';
    if (r.img) return '<span class="ms-art"><img src="' + esc(r.img) + '" alt="" draggable="false" loading="lazy"></span>';
    return '<span class="ms-art"><span class="ms-gen" style="--h:' + ((250 + i * 47) % 360) + '"><b>' + esc(title) + '</b><i>' + esc(r.client || r.tag || 'Specoolasi') + '</i></span></span>';
  }
  var BOX = ['#2a67b5', '#14141a', '#14141a', '#1d1d24'];
  function rec(r, k) {
    var tilt = [-.8, .6, -.4, .9, -.7, .5, -.9, .7], drop = [0, 3, 1, 4, 2, 3, 0, 2];
    return '<li><button type="button" class="ms-rec" data-i="' + k + '" style="--r:' + tilt[k % 8] + 'deg;--d:' + drop[k % 8] + 'px" aria-label="Pull out ' + esc(r.title || 'record') + (r.client ? ' by ' + esc(r.client) : '') + '">' + art(r, k) + '</button></li>';
  }
  function bay(items, from, label) {
    var h = items.length ? items.map(function (r, j) { return rec(r, from + j); }).join('') : '<li class="ms-none">Records coming soon</li>';
    return '<div class="ms-bayw"><button type="button" class="ms-arr l" aria-label="Scroll the shelf left">&lsaquo;</button><ul class="ms-bay" tabindex="0" aria-label="' + label + ' - swipe sideways">' + h + '</ul><button type="button" class="ms-arr r" aria-label="Scroll the shelf right">&rsaquo;</button></div>';
  }
  function boxes() { // the lower shelf holds box sets while there are only a few records
    var h = ''; for (var i = 0; i < 12; i++) h += '<li class="ms-box" style="--c:' + BOX[i % 4] + '"><span>SPECOOLASI</span></li>';
    return '<div class="ms-bayw"><ul class="ms-bay ms-boxes" aria-hidden="true">' + h + '</ul></div>';
  }
  function bins(list) {
    var n = list.length, split = n > 6 ? Math.ceil(n / 2) : n, top = list.slice(0, split), bot = list.slice(split);
    return '<div class="ms-cab"><div class="ms-board top"></div>' + bay(top, 0, 'Top shelf') + '<div class="ms-board mid"></div>' +
      (bot.length ? bay(bot, split, 'Bottom shelf') : boxes()) + '<div class="ms-board bot"></div><i class="ms-leg l"></i><i class="ms-leg r"></i></div><div class="ms-fshadow"></div>';
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
        '<div class="ms-meta"><a class="back" href="index.html#services">← All services</a>' +
        '<p class="mono"><b>(' + esc(d.n) + ' / 05)</b> Service</p></div>' +
        '<div class="ms-neon"><span class="ms-script">Specoolasi</span><span class="ms-tube">RECORDS</span></div>' +
        '<div class="ms-sign"><h1>' + esc(d.title) + '</h1></div>' +
        '<div class="ms-pitch"><p class="ms-intro">' + esc(d.intro) + '</p>' +
        '<div class="ms-cta"><a class="ms-brass" href="' + esc(d.mail) + '">Start a project →</a></div></div>' +
        '</div></div>') +
      zone('ms-window', 'Window',
        '<div class="ms-awning"></div><div class="ms-wrap"><div class="ms-glass">' +
        '<p class="ms-wtitle">WHAT WE DO · ' + esc(d.title.toUpperCase()) + '</p><div class="ms-posters">' + posters + '</div>' +
        '<div class="ms-open">OPEN</div></div></div>') +
      zone('ms-inside', 'Shelves',
        '<div class="ms-beam"></div><div class="ms-wrap"><p class="mono"><b>(A)</b> Results</p><h2>Pick a record.</h2>' +
        '<p class="ms-lead">Welcome inside. Every record in these crates is something we made.</p>' +
        '<p class="ms-hint">Swipe the shelf sideways to see every record &middot; tap one to pull it out</p><div class="ms-bins" id="ms-bins">' + bins(current) + '</div></div>') +
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
      var drag = null, quiet = false;
      root.addEventListener('click', function (e) {
        if (quiet) { e.stopPropagation(); e.preventDefault(); return; }
        var t = e.target, arr = t.closest && t.closest('.ms-arr');
        if (arr) { var ul = arr.parentNode.querySelector('.ms-bay'); ul.scrollBy({ left: (arr.classList.contains('l') ? -1 : 1) * ul.clientWidth * .8, behavior: 'smooth' }); return; }
        var b = t.closest && t.closest('.ms-rec');
        if (b && window.VinylStore) VinylStore.open(+b.dataset.i, b);
      }, true);
      root.addEventListener('pointerdown', function (e) { // a mouse can drag the shelf like a finger swipes it
        var ul = e.pointerType === 'mouse' && e.target.closest && e.target.closest('.ms-bay');
        if (!ul || ul.classList.contains('ms-boxes')) return;
        drag = { ul: ul, x: e.clientX, s: ul.scrollLeft, moved: false };
      });
      window.addEventListener('pointermove', function (e) {
        if (!drag) return; var dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; drag.ul.classList.add('grab'); }
        if (drag.moved) drag.ul.scrollLeft = drag.s - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!drag) return; var moved = drag.moved; drag.ul.classList.remove('grab'); drag = null;
        if (moved) { quiet = true; setTimeout(function () { quiet = false; }, 0); }
      });
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
