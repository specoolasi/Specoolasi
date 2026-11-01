// Animations: reveal on scroll, word splitting, scroll progress, parallax, magnetic buttons.
(function () {
  var mb = document.querySelector('.menu-btn');
  if (mb) {
    var de = document.documentElement;
    function setMenu(o) { de.classList.toggle('menu-open', o); mb.setAttribute('aria-expanded', o); mb.lastChild.textContent = o ? 'Close' : 'Menu'; }
    mb.addEventListener('click', function () { setMenu(!de.classList.contains('menu-open')); });
    document.querySelectorAll('#menu-links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width:761px)').addEventListener('change', function () { setMenu(false); });
  }
  try {
    var root = document.documentElement, calm = matchMedia('(prefers-reduced-motion:reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    var AUTO = '.post-card,.widget,.ap-hero,.ap-block,.ap-sample,.ap-contact';
    setTimeout(function () { root.classList.add('reveal-all'); }, 6000);
    if (calm) { root.classList.add('reveal-all'); return; }
    function split(el, cls) {
      var n = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var f = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'), i = document.createElement('i');
              if (cls) { w.className = cls; w.textContent = t; w.dataset.k = n++; }
              else { w.className = 'w'; i.textContent = t; i.style.setProperty('--i', n++); w.appendChild(i); }
              f.appendChild(w);
            });
            c.replaceWith(f);
          } else if (c.nodeType === 1) walk(c);
        });
      })(el);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    var scrubs = [];
    function watch() {
      document.querySelectorAll('[data-split]:not(.sp)').forEach(function (el) { el.classList.add('sp'); split(el); io.observe(el); });
      document.querySelectorAll('[data-scrub]:not(.sp)').forEach(function (el) { el.classList.add('sp'); split(el, 'sw'); scrubs.push(el); });
      document.querySelectorAll('[data-r]:not(.rv),' + AUTO.split(',').map(function (s) { return s + ':not(.rv)'; }).join(',')).forEach(function (el, i) {
        el.classList.add('rv', 'rv-' + (el.dataset.r || 'up'));
        el.style.setProperty('--rd', (el.dataset.d || ((i % 4) * 0.08)) + 's');
        io.observe(el);
      });
    }
    watch();
    var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(watch, 80); }).observe(document.body, { childList: true, subtree: true });
    var prog = document.getElementById('prog'), nav = document.querySelector('nav.top'), ticking = false;
    function frame() {
      ticking = false;
      var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.setProperty('--p', h > 0 ? y / h : 0);
      if (nav) nav.classList.toggle('stuck', y > 20);
      document.querySelectorAll('[data-speed]').forEach(function (el) { el.style.translate = '0 ' + (y * el.dataset.speed) + 'px'; });
      scrubs.forEach(function (el) {
        var r = el.getBoundingClientRect(), p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), ws = el.querySelectorAll('.sw');
        ws.forEach(function (w) { w.classList.toggle('on', w.dataset.k / ws.length < p); });
      });
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
    if (fine) {
      var hero = document.querySelector('.hx');
      if (hero) hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        hero.querySelectorAll('[data-depth]').forEach(function (el) { el.style.translate = (x * el.dataset.depth) + 'px ' + (y * el.dataset.depth) + 'px'; });
      });
      document.querySelectorAll('[data-magnet]').forEach(function (b) {
        b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.25) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.35) + 'px'; });
        b.addEventListener('pointerleave', function () { b.style.translate = ''; });
      });
    }
  } catch (e) { document.documentElement.classList.add('reveal-all'); }
})();
