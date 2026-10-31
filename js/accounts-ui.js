(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function logo(a) {
    return a.logo ? '<img class="avatar" src="' + esc(a.logo) + '" alt="">'
                  : '<div class="avatar">' + esc(a.name.charAt(0)) + '</div>';
  }
  var list = document.getElementById('acct-list');
  if (list) {
    list.innerHTML = ACCOUNTS.map(function (a, i) {
      var img = a.logo ? '<img class="alogo" src="' + esc(a.logo) + '" alt="">'
                       : '<div class="alogo letter">' + esc(a.name.charAt(0)) + '</div>';
      return '<a class="acard" style="--d:' + (i * 0.12) + 's" href="account.html?id=' + encodeURIComponent(a.id) + '">' +
        '<div class="alogo-wrap">' + img + '</div>' +
        '<div class="foot"><h3>' + esc(a.name) + '</h3><span class="go" aria-hidden="true">↗</span></div></a>';
    }).join('');

    // Big outlined running names under the cards
    var one = ACCOUNTS.map(function (a) { return '<span>' + esc(a.name) + '</span><span>✦</span>'; }).join('');
    var set = new Array(5).join(one);
    list.insertAdjacentHTML('afterend', '<div class="names" aria-hidden="true"><div>' + set + set + '</div></div>');

    var cards = list.querySelectorAll('.acard');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.2 });
      cards.forEach(function (c) { io.observe(c); });
    } else {
      cards.forEach(function (c) { c.classList.add('in'); });
    }

    var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (fine && !calm) {
      cards.forEach(function (c) {
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          c.style.setProperty('--mx', (x * 100) + '%');
          c.style.setProperty('--my', (y * 100) + '%');
          c.style.setProperty('--rx', ((0.5 - y) * 10) + 'deg');
          c.style.setProperty('--ry', ((x - 0.5) * 12) + 'deg');
        });
        c.addEventListener('pointerleave', function () {
          c.style.setProperty('--rx', '0deg');
          c.style.setProperty('--ry', '0deg');
        });
      });
    }
  }
  var detail = document.getElementById('acct-detail');
  if (detail) {
    var id = new URLSearchParams(location.search).get('id');
    var a = ACCOUNTS.filter(function (x) { return x.id === id; })[0];
    if (!a) {
      detail.innerHTML = '<a class="back" href="index.html#social">← All accounts</a><h2>Account not found</h2>';
      return;
    }
    document.title = a.name + ' – Specoolasi';
    var link = /^https?:\/\//.test(a.link || '') ? '<p><a class="btn" href="' + esc(a.link) + '" target="_blank" rel="noopener">Visit account</a></p>' : '';
    detail.innerHTML = '<a class="back" href="index.html#social">← All accounts</a>' + logo(a) +
      '<h2>' + esc(a.name) + '</h2>' +
      (a.handle ? '<span class="handle">' + esc(a.handle) + '</span>' : '') +
      (a.desc ? '<p>' + esc(a.desc) + '</p>' : '') +
      (a.platform ? '<span class="chip" style="margin:0 0 1.5rem">' + esc(a.platform) + '</span>' : '') + link;
  }
})();
