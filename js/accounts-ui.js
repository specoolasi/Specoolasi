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
    var SOCIAL = {
      instagram: { label: 'Instagram', url: function (h) { return 'https://www.instagram.com/' + h; }, dm: function (h) { return 'https://ig.me/m/' + h; },
        icon: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor"/>' },
      tiktok: { label: 'TikTok', url: function (h) { return 'https://www.tiktok.com/@' + h; },
        icon: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 3c.3 2.6 2 4.4 5 4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
      youtube: { label: 'YouTube', url: function (h) { return 'https://www.youtube.com/@' + h; },
        icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.2v5.6l5-2.8z" fill="currentColor"/>' },
      x: { label: 'X', url: function (h) { return 'https://x.com/' + h; },
        icon: '<path d="M4.5 4.5l15 15M19.5 4.5l-15 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' },
      facebook: { label: 'Facebook', url: function (h) { return 'https://www.facebook.com/' + h; }, dm: function (h) { return 'https://m.me/' + h; },
        icon: '<path d="M14 21v-8h2.8l.5-3.3H14V7.6c0-1 .4-1.7 1.8-1.7h1.6V3.1C17 3 16.1 3 15.1 3 12.7 3 11 4.5 11 7.2v2.5H8.2V13H11v8z" fill="currentColor"/>' },
      threads: { label: 'Threads', url: function (h) { return 'https://www.threads.net/@' + h; },
        icon: '<path d="M17.5 9.5C16.8 6.5 14.6 5 12 5c-3.3 0-5.5 2.5-5.5 7s2.2 7 5.5 7c2.6 0 4.5-1.4 4.5-3.5 0-2.3-2-3.2-4.2-3.2-1.7 0-2.8.8-2.8 2 0 1.1 1 1.8 2.2 1.8 1.9 0 3-1.4 3-4.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
      telegram: { label: 'Telegram', url: function (h) { return 'https://t.me/' + h; },
        icon: '<path d="M21 4L2.8 11.2l5.6 2.1L10.5 20l3.2-4 4.6 3.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.4 13.3L21 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
      whatsapp: { label: 'WhatsApp', url: function (h) { return 'https://wa.me/' + h.replace(/\D/g, ''); },
        icon: '<path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.7-2-1-.8.8c-1-.4-1.8-1.2-2.2-2.2l.8-.8-1-2z" fill="currentColor"/>' }
    };
    function svg(key) { return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + SOCIAL[key].icon + '</svg>'; }
    function safe(u) { return /^https?:\/\//.test(u || '') ? u : ''; }

    var id = new URLSearchParams(location.search).get('id');
    var a = ACCOUNTS.filter(function (x) { return x.id === id; })[0];
    if (!a) {
      detail.innerHTML = '<a class="back" href="index.html#social">← All accounts</a><h2>Account not found</h2>';
      return;
    }
    document.title = a.name + ' – Specoolasi';

    var socials = (a.socials || []).filter(function (s) { return SOCIAL[s.type] && (s.handle || s.url); }).map(function (s) {
      var d = SOCIAL[s.type], h = String(s.handle || '').replace(/^@/, '');
      var profile = safe(s.url) || (h ? d.url(h) : '');
      var dm = safe(s.dm) || (h && d.dm ? d.dm(h) : profile);
      return { key: s.type, label: d.label, profile: profile, dm: dm };
    }).filter(function (s) { return s.profile; });

    var img = a.logo ? '<img class="ap-logo" src="' + esc(a.logo) + '" alt="' + esc(a.name) + ' logo">'
                     : '<div class="ap-logo letter">' + esc(a.name.charAt(0)) + '</div>';
    var html = '<a class="back" href="index.html#social">← All accounts</a>' +
      '<div class="ap-hero">' + img + '<div>' +
      '<h1>' + esc(a.name) + '</h1>' +
      (a.desc ? '<p class="ap-desc">' + esc(a.desc) + '</p>' : '') +
      (socials.length ? '<div class="ap-icons">' + socials.map(function (s) {
        return '<a class="ap-icon" href="' + esc(s.profile) + '" target="_blank" rel="noopener" aria-label="' + esc(a.name) + ' on ' + esc(s.label) + '">' + svg(s.key) + '</a>';
      }).join('') + '</div>' : '') +
      '</div></div>';

    var samples = (a.samples || []).filter(function (x) { return x && x.img; });
    if (samples.length) {
      html += '<div class="ap-block"><span class="eyebrow">Content samples</span><h2>Our work on this account.</h2><div class="ap-samples">' +
        samples.map(function (x) {
          var im = '<img src="' + esc(x.img) + '" alt="Content sample from ' + esc(a.name) + '" loading="lazy">';
          var to = safe(x.link) || x.img;
          return '<a class="ap-sample" href="' + esc(to) + '" target="_blank" rel="noopener">' + im + '</a>';
        }).join('') + '</div></div>';
    }

    if (socials.length) {
      html += '<div class="contact ap-contact"><h2>Contact</h2><p>Send ' + esc(a.name) + ' a direct message.</p><div class="btns">' +
        socials.map(function (s) {
          return '<a class="ap-dm" href="' + esc(s.dm) + '" target="_blank" rel="noopener">' + svg(s.key) + '<span>Message on ' + esc(s.label) + '</span></a>';
        }).join('') + '</div></div>';
    }
    detail.innerHTML = html;
  }
})();
