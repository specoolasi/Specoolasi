// Service pages: edit the words here. Each service has its own concept visual.
(function () {
  var SERVICES = [
    { id: 'social', n: '01', title: 'Social media', th: 'social', next: 'content',
      intro: 'We build a clear voice for your brand and keep it active every week. From content calendars to replying to comments, we help you grow an audience that actually engages.',
      items: [['Strategy', 'A clear plan for what to post, when, and why, built around your goals.'], ['Posting', 'Content calendars and weekly posts that keep your feed active.'], ['Community', 'We reply to comments and messages so your audience feels heard.']],
      make: 'We plan the calendar, write the captions, and design the posts.', launch: 'We publish, reply, and report what is working.' },
    { id: 'content', n: '02', title: 'Content creation', th: 'content', next: 'design',
      intro: 'Photos and short videos made to stop the scroll. We shoot and edit everything, so your feed always has something worth watching.',
      items: [['Photo', 'Product shots, portraits, and lifestyle photos that look like you.'], ['Video', 'Short videos made to stop the scroll.'], ['Editing', 'Cuts, color, captions, and sound, polished and ready to post.']],
      make: 'We shoot and edit, and show you drafts to review.', launch: 'We deliver files that are ready to post.' },
    { id: 'design', n: '03', title: 'Graphic design', th: 'design', next: 'music',
      intro: 'A strong look makes people remember you. We design logos, brand guidelines, posters, and social graphics that feel like you and no one else.',
      items: [['Logos', 'A mark that is simple, memorable, and works at any size.'], ['Brand identity', 'Colors, type, and guidelines so everything looks like one brand.'], ['Posters', 'Posters and social graphics that feel like you and no one else.']],
      make: 'We design a few options and refine the one you pick.', launch: 'We hand over the final files and a guide to use them.' },
    { id: 'music', n: '04', title: 'Music production', th: 'music', next: 'copy',
      intro: 'Sound is what makes a brand feel alive. We compose and produce original tracks, jingles, and sound design for your videos, ads, and releases.',
      items: [['Original tracks', 'Music composed and produced just for your project.'], ['Jingles', 'Short, catchy tunes that stick in people’s heads.'], ['Sound design', 'Sound effects and atmosphere for videos, ads, and releases.']],
      make: 'We compose, record, and mix, and share demos with you.', launch: 'We deliver the final mix in the formats you need.' },
    { id: 'copy', n: '05', title: 'Copywriting', th: 'copy', next: 'social',
      intro: 'Words that sell without sounding like selling. We write captions, slogans, scripts, website text, and ads in your brand’s own voice, so people hear you clearly and remember what you said.',
      items: [['Captions', 'Short lines that fit your voice and get read.'], ['Slogans', 'A few words people remember.'], ['Scripts', 'Words for videos, reels, and ads.'], ['Website copy', 'Clear text that explains what you do and makes people act.']],
      make: 'We write, edit, and polish in your brand’s voice.', launch: 'We deliver the final text, ready to use.' }
  ];
  var root = document.getElementById('svp');
  if (!root) return;
  var calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var id = new URLSearchParams(location.search).get('id');
  var s = SERVICES.filter(function (x) { return x.id === id; })[0];
  if (s && s.th === 'music') document.body.classList.add('ms-page');
  if (!s) { root.innerHTML = '<div class="wrap" style="padding:5rem 1.5rem"><a class="back" href="index.html#services">← All services</a><h2>Service not found</h2></div>'; return; }
  var nx = SERVICES.filter(function (x) { return x.id === s.next; })[0];
  document.title = s.title + ' – Specoolasi';
  var mail = 'mailto:specoolasi@gmail.com?subject=' + encodeURIComponent(s.title + ' project');
  var heart = '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>';

  var vis = {
    social: function () {
      var card = '<div class="pc"><div class="h"><i class="av"></i>specoolasi</div><div class="im"></div><div class="l"></div><div class="l"></div></div>';
      return '<div class="ph"><div class="ph-scr"><div class="ph-feed">' + new Array(9).join(card) + '</div></div>' +
        '<span class="bub" style="--d:0s">' + heart + ' 2.4k</span><span class="bub l" style="--d:1.7s">+ new follower</span><span class="bub" style="--d:3.2s">' + heart + ' 12k</span></div>';
    },
    content: function () {
      var f = new Array(21).join('<i></i>');
      return '<div class="vf"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="vf-rec"><b></b>REC <span id="tc">00:00:00:00</span></div><div class="vf-bat">4K · 25FPS</div><div class="vf-sub"></div><div class="vf-focus"></div></div><div class="film"><div class="film-in">' + f + f + '</div></div>';
    },
    design: function () {
      return '<div class="cv" id="cv"><div class="tag">ARTBOARD 01</div><div class="aa">Aa</div>' +
        '<svg class="art" viewBox="0 0 400 400"><path pathLength="1" class="blob" d="M70 250C60 110 220 50 300 125S390 300 245 345S75 385 70 250Z"/>' +
        '<g class="hd"><line x1="70" y1="250" x2="60" y2="110"/><line x1="300" y1="125" x2="340" y2="190"/><line x1="245" y1="345" x2="150" y2="365"/></g>' +
        '<rect class="an" x="64" y="244" width="12" height="12"/><rect class="an" x="294" y="119" width="12" height="12"/><rect class="an" x="239" y="339" width="12" height="12"/></svg>' +
        '<div class="sws"><i style="--k:0;background:#6C4DFF"></i><i style="--k:1;background:#B8A7FF"></i><i style="--k:2;background:#171321"></i><i style="--k:3;background:#fff"></i></div><i class="gx"></i><i class="gy"></i></div>';
    },
    music: function () {
      // the shop front: neon sign, OPEN sign and a spinning turntable
      return '<div class="vs-front"><div class="vs-neon"><b>Specoolasi</b><small>RECORDS</small></div><div class="vs-open">OPEN</div>' +
        '<div class="vs-deck"><div class="vs-plat"><i></i></div><div class="vs-arm"></div><div class="vs-knob"></div></div></div>';
    },
    copy: function () {
      return '<div class="cp"><div class="cp-q">“</div><div class="cp-paper"><small>Before</small><p class="cp-old" id="old"></p><small style="margin-top:1.2rem">After</small><p class="cp-new"><span id="tw"></span><i class="caret"></i></p></div></div>';
    }
  };


  // ---- RESULTS: your finished work, shown on each service page.
  // Each item:  img    image path (put files in assets/results/<service>/). Leave '' to show a placeholder tile.
  //             title  project name (for Copywriting: the line you wrote)
  //             client who it was for
  //             link   optional address to open when someone clicks it
  // Copy a line, change the words, and add a comma between lines. Delete lines you don't need.
  function ph(t, c) { var a = []; for (var i = 0; i < 6; i++) a.push({ img: '', title: t, client: c, link: '' }); return a; }
  var RESULTS = {
    social: ph('Project name', 'Client name'),
    content: ph('Project name', 'Client name'),
    design: ph('Project name', 'Client name').slice(0, 5),
    // MUSIC is the vinyl cabinet. Each item below is one record on the shelf (4 per shelf unit, the cabinet grows by itself).
    // Per track:  title   track name
    //             client  artist or client
    //             link    paste the track's SoundCloud / Spotify / YouTube address (shows a Listen button)
    //             img     cover art, e.g. 'assets/results/music/cover1.jpg' (leave '' for a placeholder)
    //             year    e.g. '2026'  (optional)
    //             desc    a short note about the music  (optional)
    //             tracks  optional list for an EP/album: [{ title: 'Song', length: '3:10' }, ...]
    //             audio   optional mp3 path for a play preview, e.g. 'assets/results/music/demo1.mp3'
    //             tag     small label, e.g. 'Original', 'Jingle'  (optional)
    //             length  e.g. '3:24'  (optional)
    music: [
      { title: 'Track name', client: 'Artist or client', link: '', img: '', tag: 'Original', length: '3:24', year: '2026',
        desc: 'A short note about this track: the mood, the project, what you made.',
        tracks: [{ title: 'Track name', length: '3:24' }, { title: 'Instrumental mix', length: '3:24' }] },
      { title: 'Track name', client: 'Artist or client', link: '', img: '', tag: 'Jingle', length: '0:30', year: '2026' },
      { title: 'Track name', client: 'Artist or client', link: '', img: '', tag: 'Sound design', length: '1:12', year: '2026' },
      { title: 'Track name', client: 'Artist or client', link: '', img: '', tag: 'Original', length: '2:48', year: '2026' }
    ]
    // Copywriting shows only a button to the blog, so it needs no list here.
  };
  var RTITLE = { social: 'Posts that did the talking.', content: 'Rolling. Cut. Delivered.', design: 'Pinned to the wall.', music: 'Pick a record.', copy: 'Lines that landed.' };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pic(r) {
    var m = r.video ? '<video src="' + esc(r.video) + '" autoplay muted loop playsinline preload="metadata"' + (r.img ? ' poster="' + esc(r.img) + '"' : '') + '></video>'
      : r.img ? '<img src="' + esc(r.img) + '" alt="' + esc(r.title) + '" loading="lazy">' : '<span>✦</span>';
    return '<div class="rs-ph' + (r.img || r.video ? ' rs-real' : '') + '">' + m + '</div>';
  }
  var designR = [];
  function cell(inner, r, cls, i, extra) {
    var tag = r.link ? 'a' : 'div', at = r.link ? ' href="' + esc(r.link) + '" target="_blank" rel="noopener"' : '';
    return '<div class="rs-cell" style="--k:' + i + '" data-r="up" data-d="' + (i * 0.08).toFixed(2) + '"><' + tag + ' class="' + cls + '"' + at + (extra || '') + '>' + inner + '</' + tag + '></div>';
  }
  var ic = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.2A8 8 0 1 1 21 12z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
  };
  var tapeBars = ''; for (var b = 0; b < 14; b++) tapeBars += '<i style="--k:' + b + '"></i>';
  function postCell(r, i) {
    return cell('<div class="hd"><i></i>' + esc(r.client) + '</div>' + pic(r) + '<div class="ic"><span class="hr">' + ic.heart + '</span>' + ic.chat + ic.send + '</div>' + (r.title ? '<p>' + esc(r.title) + '</p>' : ''), r, 'rs-post', i);
  }
  // Results of ONE account (used when a logo is tapped). Uses that account's "samples" from js/accounts.js.
  function acctResults(a) {
    var has = a.samples && a.samples.length;
    var list = has ? a.samples.map(function (x) { return { img: x.img, title: x.title || '', client: a.name, link: x.link || '', video: x.video || '' }; }) : ph('', a.name);
        return '<div class="rs-grid">' + list.map(function (r, i) { return postCell(r, i); }).join('') + '</div>' +
      '<div class="rs-foot"><span class="mono">' + (has ? '' : 'More samples coming soon') + '</span><a class="bt sm" href="account.html?id=' + encodeURIComponent(a.id) + '">Open ' + esc(a.name) + ' ↗</a></div>';
  }
  function resultsHtml(th) {
    var R = RESULTS[th] || []; if (!R.length && th !== 'copy') return '';
    var body = '';
    if (th === 'social') {
      body = '<p class="rs-lead">Welcome to Specoolasi HQ. Every room belongs to an account we run, and the people inside are busy doing what that account is all about.</p>' +
        '<p class="rs-hint"><em>Tap a room to zoom in and see its results</em></p>' +
        '<div class="rs-hqwrap"><div id="hq"></div></div>';
    } else if (th === 'content') {
      body = '<div class="rs-film"><div class="rs-grid">' + R.map(function (r, i) {
        return cell('<span class="no">A' + (i + 1) + '</span>' + pic(r) + '<span class="play"><svg viewBox="0 0 24 24"><path d="M6 3l15 9-15 9z"/></svg></span><div class="cap"><span>' + esc(r.title) + '</span><span>' + esc(r.client) + '</span></div>', r, 'rs-fr', i);
      }).join('') + '</div></div>';
    } else if (th === 'design') {
      designR = R;
      body = '<div class="rs-board"><div class="rs-grid">' + R.map(function (r, i) {
        var lc = (r.img || r.video) ? '<button type="button" class="lc" data-i="' + i + '">Look closely <span aria-hidden="true">⌕</span></button>' : '';
        return cell(pic(r) + '<div class="sw"><i style="background:#6C4DFF"></i><i style="background:#B8A7FF"></i><i style="background:#171321"></i></div><p><b>' + esc(r.title) + '</b><br><small>' + esc(r.client) + '</small></p>' + lc, {}, 'rs-pin', i, lc ? ' tabindex="0"' : '');
      }).join('') + '</div></div>';
    } else if (th === 'music') {
      body = '<p class="rs-lead">Welcome to the shop. Every record on this shelf is something we made.</p>' +
        '<p class="rs-hint"><em>Tap a record to pull it out, spin it and see the details</em></p><div id="vs"></div>';
    } else {
      body = '<div class="rs-more"><a class="bt big" href="blog.html?category=Copywriting">See copywriting results on the blog →</a></div>';
    }
    return '<section class="svp-sec rs rs-' + th + '"><p class="mono"><b>(B)</b> Results</p><h2 data-split>' + RTITLE[th] + '</h2>' + body + '</section>';
  }

  var steps = [['Brief', 'You tell us about your brand and what you want to achieve.'], ['Plan', 'We map out the idea, the look, and the timing.'], ['Make', s.make], ['Launch', s.launch]];
  var tape = new Array(5).join('<span>' + s.title + '</span><span class="o">' + s.title + '</span><span>✦</span>');
  root.innerHTML =
    '<div class="band t-' + s.th + '"><div class="wrap"><div class="svh"><div><a class="back" href="index.html#services" style="color:inherit">← All services</a>' +
    '<p class="mono" style="margin-top:1.5rem"><b>(' + s.n + ' / 05)</b> Service</p><h1 data-split>' + s.title + '</h1><p class="in" data-r="up">' + s.intro + '</p>' +
    '<div class="acts" data-r="up" data-d=".2"><a class="bt" href="' + mail + '">Start a project →</a></div></div><div class="svp-vis" data-r="scale">' + vis[s.th]() + '</div></div></div></div>' +
    '<div class="wrap" style="--sc:' + ({ social: '#6C4DFF', content: '#6C4DFF', design: '#6C4DFF', music: '#6C4DFF', copy: '#6C4DFF' })[s.th] + '">' +
    '<section class="svp-sec"><p class="mono"><b>(A)</b> What we do</p><h2 data-split>' + s.title + ', the Specoolasi way.</h2><div class="its">' +
    s.items.map(function (x, i) { return '<article class="it" data-r="up" data-d="' + (i * 0.1) + '"><b>0' + (i + 1) + '</b><h3>' + x[0] + '</h3><p>' + x[1] + '</p></article>'; }).join('') + '</div></section>' +
    resultsHtml(s.th) + '<section class="svp-sec"><p class="mono"><b>(C)</b> How it works</p><h2 data-split>Four steps. No mystery.</h2><div class="stp">' +
    steps.map(function (x, i) { return '<div data-r="up" data-d="' + (i * 0.12) + '"><i>0' + (i + 1) + '</i><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div>'; }).join('') + '</div></section>' +
    '<div class="mq" aria-hidden="true"><div>' + tape + tape + '</div></div>' +
    '<div class="svp-cta" data-r="up"><p class="mono">Ready?</p><h2 data-split>Let’s talk about your ' + s.title.toLowerCase() + '.</h2><p style="max-width:30rem;margin:0">Send us a short note about your brand and what you need. We reply within two working days.</p><div class="acts"><a class="bt" href="' + mail + '">specoolasi@gmail.com ↗</a><a class="bt" style="background:transparent;color:#fff;border-color:#fff;box-shadow:none" href="index.html#services">All services</a></div></div>' +
    '<a class="next" href="service.html?id=' + nx.id + '"><span><small>Next service</small>' + nx.title + '</span><span>→</span></a></div>';

  // ---- Music production: the whole page is a realistic record shop, roof to floor (css/music-shop.css, js/musicshop.js)
  if (s.th === 'music') {
    root.innerHTML = '<p class="state" style="padding:6rem 1.5rem;text-align:center">Opening the shop…</p>';
    var msFail = function () { root.innerHTML = '<p class="state" style="padding:6rem 1.5rem;text-align:center">The record shop could not load. Please refresh the page.</p>'; };
    var msLoad = function (src, ok) { var t = document.createElement('script'); t.src = src; t.onload = ok; t.onerror = msFail; document.body.appendChild(t); };
    msLoad('js/vinylstore.js', function () {
      msLoad('js/musicshop.js', function () {
        window.MusicShop.render(root, { title: s.title, n: s.n, intro: s.intro, items: s.items, steps: steps, mail: mail, next: nx, records: RESULTS.music });
      });
    });
  }

  // ---- Content creation is not open yet: show a "coming soon" popup with a button back to the homepage
  if (s.th === 'content') {
    var cs = document.createElement('div');
    cs.className = 'cs-pop'; cs.setAttribute('role', 'dialog'); cs.setAttribute('aria-modal', 'true'); cs.setAttribute('aria-labelledby', 'cs-t');
    cs.innerHTML = '<div class="cs-box"><p class="mono"><b>(02 / 05)</b> Content creation</p><h2 id="cs-t">Coming soon.</h2>' +
      '<p>This page is not ready yet. We are still working on it, so please check back a little later.</p>' +
      '<a class="bt" href="index.html" id="cs-home">Back to homepage →</a></div>';
    document.body.appendChild(cs);
    document.body.style.overflow = 'hidden';
    var csHome = document.getElementById('cs-home'); if (csHome) csHome.focus();
    cs.addEventListener('keydown', function (e) { if (e.key === 'Tab') { e.preventDefault(); csHome.focus(); } });
  }

  // ---- concept animations
  var bars = document.getElementById('bars');
  if (bars) { var h = ''; for (var i = 0; i < 44; i++) h += '<i style="--h:' + (0.25 + Math.abs(Math.sin(i * 0.7) * 0.6) + Math.random() * 0.15).toFixed(2) + ';--t:' + (0.4 + Math.random() * 0.7).toFixed(2) + 's"></i>'; bars.innerHTML = h; }
  var tc = document.getElementById('tc');
  if (tc && !calm) { var f = 0; setInterval(function () { f += 3; var fr = f % 25, sec = Math.floor(f / 25) % 60, mn = Math.floor(f / 1500) % 60; tc.textContent = '00:' + ('0' + mn).slice(-2) + ':' + ('0' + sec).slice(-2) + ':' + ('0' + fr).slice(-2); }, 120); }
  var cv = document.getElementById('cv');
  if (cv && !calm) cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); cv.querySelector('.gx').style.left = (e.clientX - r.left) + 'px'; cv.querySelector('.gy').style.top = (e.clientY - r.top) + 'px'; });
  var tw = document.getElementById('tw'), old = document.getElementById('old');
  if (tw) {
    var P = [['Buy our shoes. They are good.', 'Walk like you own the street.'], ['We make coffee.', 'Your morning, done right.'], ['Cheap and fast delivery.', 'At your door before you miss it.']];
    if (calm) { old.textContent = P[0][0]; old.classList.add('x'); tw.textContent = P[0][1]; }
    else (function run(k) {
      var p = P[k % P.length]; old.className = 'cp-old'; old.textContent = p[0]; tw.textContent = '';
      setTimeout(function () { old.classList.add('x'); var i = 0; (function type() {
        tw.textContent = p[1].slice(0, ++i);
        if (i < p[1].length) setTimeout(type, 55); else setTimeout(function () { run(k + 1); }, 2600);
      })(); }, 1400);
    })(0);
  }

  // ---- social results: tap a logo to see that account's results
  function bindSocial() {
    var rsOut = document.getElementById('rs-out');
    if (!rsOut || typeof ACCOUNTS === 'undefined') return;
    var rsBtns = document.querySelectorAll('.rs-story'), rsPick = document.querySelector('.rs-pick');
    rsBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        rsBtns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        rsOut.innerHTML = acctResults(ACCOUNTS[+b.dataset.i]);
        if (rsPick) rsPick.classList.add('done');
      });
    });
  }
  bindSocial();

  // ---- videos: play only while on screen, always muted and looping
  var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
  }, { threshold: 0.25 }) : null;
  function wireVideos() {
    document.querySelectorAll('.rs-ph video:not([data-w])').forEach(function (v) {
      v.dataset.w = '1'; v.muted = true; v.loop = true; v.playsInline = true;
      if (calm) { v.removeAttribute('autoplay'); v.controls = true; return; }
      if (vio) vio.observe(v); else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  wireVideos();
  new MutationObserver(wireVideos).observe(root, { childList: true, subtree: true });

  // ---- graphic design: tap a design -> "Look closely" -> bottom sheet (like an iPhone popup)
  var sheet = document.createElement('div');
  sheet.className = 'sheet'; sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML = '<div class="sheet-bg"></div><div class="sheet-card" role="dialog" aria-modal="true" aria-label="Design preview">' +
    '<div class="sheet-grab" aria-hidden="true"><i></i></div><button type="button" class="sheet-x" aria-label="Close">×</button>' +
    '<div class="sheet-body"></div><div class="sheet-cap"></div></div>';
  document.body.appendChild(sheet);
  var sCard = sheet.querySelector('.sheet-card'), sBody = sheet.querySelector('.sheet-body'), sCap = sheet.querySelector('.sheet-cap'), sBack = null;
  function openSheet(i, from) {
    var r = designR[i]; if (!r) return;
    sBack = from;
    sBody.innerHTML = r.video ? '<video src="' + esc(r.video) + '" autoplay muted loop playsinline controls></video>' : '<img src="' + esc(r.big || r.img) + '" alt="' + esc(r.title) + '">';
    var v = sBody.querySelector('video'); if (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    sCap.innerHTML = '<b>' + esc(r.title) + '</b>' + (r.client ? '<small>' + esc(r.client) + '</small>' : '') + (r.link ? '<a href="' + esc(r.link) + '" target="_blank" rel="noopener">Open original ↗</a>' : '');
    sBody.scrollTop = 0;
    sheet.setAttribute('aria-hidden', 'false'); sheet.classList.add('on');
    document.documentElement.classList.add('sheet-lock');
    sheet.querySelector('.sheet-x').focus();
  }
  function closeSheet() {
    if (!sheet.classList.contains('on')) return;
    sheet.classList.remove('on'); sheet.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('sheet-lock');
    setTimeout(function () { sBody.innerHTML = ''; }, 450);
    if (sBack && sBack.focus) sBack.focus();
  }
  sheet.querySelector('.sheet-bg').addEventListener('click', closeSheet);
  sheet.querySelector('.sheet-x').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSheet(); return; }
    var pin = e.target.closest && e.target.closest('.rs-design .rs-pin');
    if (pin && e.target === pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pin.click(); }
  });
  // drag the handle down to close
  var gy = 0, gd = 0, gOn = false, grab = sheet.querySelector('.sheet-grab');
  grab.addEventListener('pointerdown', function (e) { gOn = true; gy = e.clientY; gd = 0; sCard.style.transition = 'none'; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointermove', function (e) { if (!gOn) return; gd = Math.max(0, e.clientY - gy); sCard.style.transform = 'translateY(' + gd + 'px)'; });
  function gEnd() { if (!gOn) return; gOn = false; sCard.style.transition = ''; sCard.style.transform = ''; if (gd > 110) closeSheet(); }
  grab.addEventListener('pointerup', gEnd); grab.addEventListener('pointercancel', gEnd);
  // tap a design to reveal its button; tap the button to open the sheet
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    var lc = t.closest('.lc');
    if (lc) { e.preventDefault(); openSheet(+lc.dataset.i, lc); return; }
    var pin = t.closest('.rs-design .rs-pin');
    document.querySelectorAll('.rs-pin.open').forEach(function (x) { if (x !== pin) x.classList.remove('open'); });
    if (pin && pin.querySelector('.lc')) pin.classList.toggle('open');
  });

  // ---- your work from Sanity (Studio > "Work sample"): fills the results on this page
  var cfg = window.SPECOOLASI && window.SPECOOLASI.sanity;
  // Social page only: load the HQ house (js/house.js, drawn with the scenes in js/scenes/).
  var hqBox = document.getElementById('hq');
  if (hqBox) {
    var hqFail = function () { hqBox.innerHTML = '<p class="state">The HQ could not load. You can still open each account from the <a href="index.html#social">home page</a>.</p>'; };
    var hqFiles = ['js/scenes/core.js', 'js/scenes/a.js', 'js/scenes/b.js', 'js/house.js'], hqNext = function (i) {
      if (i >= hqFiles.length) return;
      var t = document.createElement('script'); t.src = hqFiles[i]; t.onload = function () { hqNext(i + 1); }; t.onerror = hqFail; document.body.appendChild(t);
    };
    hqNext(0);
  }

  if (cfg && cfg.projectId && cfg.projectId.indexOf('YOUR_') !== 0) {
    var Q = '*[_type=="work" && defined(service)] | order(coalesce(order,9999) asc, _createdAt desc){title, service, account, client, link, description, tag, length, year, "audio": audio.asset->url, "tracks": tracks[]{title, length}, "img": image.asset->url, "video": video.asset->url}';
    fetch('https://' + cfg.projectId + '.apicdn.sanity.io/v' + cfg.apiVersion + '/data/query/' + cfg.dataset + '?query=' + encodeURIComponent(Q))
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var W = (j.result || []).map(function (w) {
          return { service: w.service, account: w.account || '', title: w.title || '', client: w.client || '', link: /^https?:\/\//.test(w.link || '') ? w.link : '',
            desc: w.description || '', tag: w.tag || '', length: w.length || '', year: w.year || '', audio: /^https?:\/\//.test(w.audio || '') ? w.audio : '', tracks: w.tracks || [],
            img: w.img ? w.img + '?w=900&auto=format' : '', big: w.img ? w.img + '?w=2000&auto=format' : '', video: w.video || '' };
        }).filter(function (w) { return w.img || w.video; });
        if (!W.length) return;
        var mine = W.filter(function (w) { return w.service === s.th; });
        if (s.th === 'social' && typeof ACCOUNTS !== 'undefined') {
          ACCOUNTS.forEach(function (a) {
            var add = mine.filter(function (w) { return w.account === a.id; });
            if (add.length) a.samples = (a.samples || []).concat(add);
          });
          return; // the HQ reads ACCOUNTS again whenever a room opens
        } else if (mine.length) RESULTS[s.th] = mine;
        else return;
        if (s.th === 'music') { if (window.MusicShop) window.MusicShop.update(RESULTS.music); return; }
        var sec = document.querySelector('section.rs');
        if (!sec) return;
        var fresh = document.createElement('div'); fresh.innerHTML = resultsHtml(s.th);
        sec.replaceWith(fresh.firstChild);
        bindSocial(); wireVideos();
      })
      .catch(function () {});
  }
})();
