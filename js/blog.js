(function () {
  var cfg = window.SPECOOLASI.sanity;
  var main = document.getElementById('blog-main');
  var side = document.getElementById('blog-side');
  var base = 'https://' + cfg.projectId + '.apicdn.sanity.io/v' + cfg.apiVersion + '/data/query/' + cfg.dataset;
  var params = new URLSearchParams(location.search);
  var PER_PAGE = 6;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function monthLabel(m) { return new Date(m + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
  function link(o) {
    var q = [];
    for (var k in o) if (o[k]) q.push(k + '=' + encodeURIComponent(o[k]));
    return 'blog.html' + (q.length ? '?' + q.join('&') : '');
  }
  function state(msg) { main.innerHTML = '<div class="state">' + msg + '</div>'; }

  function query(q, p) {
    var url = base + '?query=' + encodeURIComponent(q);
    for (var k in p) url += '&' + encodeURIComponent('$' + k) + '=' + encodeURIComponent(JSON.stringify(p[k]));
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { return j.result; });
  }

  // Turns Sanity "portable text" into simple HTML.
  function span(child, defs) {
    var t = esc(child.text);
    (child.marks || []).forEach(function (m) {
      if (m === 'strong') t = '<strong>' + t + '</strong>';
      else if (m === 'em') t = '<em>' + t + '</em>';
      else if (m === 'code') t = '<code>' + t + '</code>';
      else {
        var d = defs.filter(function (x) { return x._key === m; })[0];
        if (d && /^(https?:|mailto:)/.test(d.href || '')) t = '<a href="' + esc(d.href) + '" target="_blank" rel="noopener">' + t + '</a>';
      }
    });
    return t.replace(/\n/g, '<br>');
  }
  function render(blocks) {
    var out = '', list = null;
    function close() { if (list) { out += '</' + list + '>'; list = null; } }
    (blocks || []).forEach(function (b) {
      if (b._type === 'image') { close(); if (b.url) out += '<img src="' + esc(b.url) + '?w=1200&auto=format" alt="' + esc(b.alt) + '">'; return; }
      if (b._type !== 'block') return;
      var html = (b.children || []).map(function (c) { return span(c, b.markDefs || []); }).join('');
      if (b.listItem) {
        var tag = b.listItem === 'number' ? 'ol' : 'ul';
        if (list !== tag) { close(); out += '<' + tag + '>'; list = tag; }
        out += '<li>' + html + '</li>'; return;
      }
      close();
      var s = b.style || 'normal';
      if (s === 'h2' || s === 'h3' || s === 'h4') out += '<' + s + '>' + html + '</' + s + '>';
      else if (s === 'blockquote') out += '<blockquote>' + html + '</blockquote>';
      else out += '<p>' + html + '</p>';
    });
    close();
    return out;
  }

  function meta(p) {
    return '<span class="meta">' + [p.author, fmt(p.publishedAt), p.category].filter(Boolean).map(esc).join(' · ') + '</span>';
  }

  function sidebar(posts) {
    var months = {}, cats = {}, tags = {};
    posts.forEach(function (p) {
      var m = (p.publishedAt || '').slice(0, 7);
      if (m) months[m] = (months[m] || 0) + 1;
      if (p.category) cats[p.category] = (cats[p.category] || 0) + 1;
      (p.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; });
    });
    function items(map, key, label) {
      return Object.keys(map).sort().reverse().map(function (k) {
        var o = {}; o[key] = k;
        return '<li><a href="' + link(o) + '">' + esc(label ? label(k) : k) + '</a> <span class="count">(' + map[k] + ')</span></li>';
      }).join('');
    }
    var h = '<div class="widget"><form class="search" action="blog.html"><input type="search" name="q" placeholder="Search posts…" aria-label="Search posts" value="' + esc(params.get('q') || '') + '"><button type="submit">Search</button></form></div>';
    h += '<div class="widget recent"><h3>Recent posts</h3><ul>' + posts.slice(0, 5).map(function (p) {
      return '<li><a href="' + link({ post: p.slug }) + '">' + (p.cover ? '<img class="thumb" src="' + esc(p.cover) + '?w=120&h=120&fit=crop&auto=format" alt="">' : '<span class="thumb"></span>') +
        '<span><b>' + esc(p.title) + '</b><small>' + esc(fmt(p.publishedAt)) + '</small></span></a></li>';
    }).join('') + '</ul></div>';
    if (Object.keys(months).length) h += '<div class="widget"><h3>Archives</h3><ul>' + items(months, 'month', monthLabel) + '</ul></div>';
    if (Object.keys(cats).length) h += '<div class="widget"><h3>Categories</h3><ul>' + items(cats, 'category') + '</ul></div>';
    if (Object.keys(tags).length) h += '<div class="widget"><h3>Tags</h3><div class="tagcloud">' + Object.keys(tags).sort().map(function (t) {
      return '<a href="' + link({ tag: t }) + '">' + esc(t) + '</a>';
    }).join('') + '</div></div>';
    side.innerHTML = h;
  }

  function showList(posts) {
    var q = (params.get('q') || '').trim().toLowerCase(), cat = params.get('category'), tag = params.get('tag'), month = params.get('month');
    var note = [];
    if (q) note.push('Search: “' + esc(params.get('q')) + '”');
    if (cat) note.push('Category: ' + esc(cat));
    if (tag) note.push('Tag: ' + esc(tag));
    if (month) note.push('Archive: ' + esc(monthLabel(month)));
    var filtered = posts.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (tag && (p.tags || []).indexOf(tag) < 0) return false;
      if (month && (p.publishedAt || '').slice(0, 7) !== month) return false;
      if (q && [p.title, p.excerpt, p.author, p.category, (p.tags || []).join(' ')].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    var page = Math.min(Math.max(parseInt(params.get('page'), 10) || 1, 1), pages);
    var html = note.length ? '<p class="filter-note">' + note.join(' · ') + ' · <a href="blog.html">Show all posts</a></p>' : '';
    if (!filtered.length) { state(posts.length ? 'No posts match this filter.' : 'No posts yet. Check back soon.'); if (note.length) main.insertAdjacentHTML('afterbegin', html); return; }
    html += '<div class="post-list">' + filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(function (p) {
      return '<a class="post-card" href="' + link({ post: p.slug }) + '">' +
        (p.cover ? '<img class="cover" src="' + esc(p.cover) + '?w=1000&auto=format" alt="">' : '<div class="cover"></div>') +
        '<div class="body">' + meta(p) + '<h3>' + esc(p.title) + '</h3>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') + '<span class="go">Read more →</span></div></a>';
    }).join('') + '</div>';
    if (pages > 1) {
      html += '<nav class="pager" aria-label="Pages">';
      for (var i = 1; i <= pages; i++) {
        var o = { q: params.get('q'), category: cat, tag: tag, month: month, page: i > 1 ? i : '' };
        html += '<a href="' + link(o) + '"' + (i === page ? ' class="on" aria-current="page"' : '') + '>' + i + '</a>';
      }
      html += '</nav>';
    }
    main.innerHTML = html;
  }

  function showPost(slug) {
    query('*[_type=="post" && slug.current==$slug][0]{title,author,publishedAt,category,tags,"cover":coverImage.asset->url,body[]{...,_type=="image"=>{"url":asset->url,alt}}}', { slug: slug })
      .then(function (p) {
        if (!p) { main.innerHTML = '<section class="article"><a class="back" href="blog.html">← All posts</a><h2>Post not found</h2></section>'; return; }
        document.title = p.title + ' – Specoolasi';
        main.innerHTML = '<section class="article"><a class="back" href="blog.html">← All posts</a>' + meta(p) +
          '<h1>' + esc(p.title) + '</h1>' +
          (p.cover ? '<img class="hero-img" src="' + esc(p.cover) + '?w=1400&auto=format" alt="">' : '') +
          '<div class="text">' + render(p.body) + '</div>' +
          ((p.tags || []).length ? '<div class="tagcloud" style="margin-top:2rem">' + p.tags.map(function (t) { return '<a href="' + link({ tag: t }) + '">' + esc(t) + '</a>'; }).join('') + '</div>' : '') +
          '</section>';
        window.scrollTo(0, 0);
      })
      .catch(function () { state('The post could not be loaded. Please try again later.'); });
  }

  if (cfg.projectId === 'YOUR_PROJECT_ID') {
    state('The blog is not connected yet. Add your Sanity project ID in js/config.js.');
    return;
  }

  query('*[_type=="post" && defined(slug.current)] | order(publishedAt desc){title,"slug":slug.current,author,publishedAt,excerpt,category,tags,"cover":coverImage.asset->url}', {})
    .then(function (posts) {
      posts = posts || [];
      sidebar(posts);
      var slug = params.get('post');
      if (slug) showPost(slug); else showList(posts);
    })
    .catch(function () { state('Posts could not be loaded right now. Please try again later.'); });
})();
