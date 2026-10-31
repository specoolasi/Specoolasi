(function () {
  var cfg = window.SPECOOLASI.sanity;
  var app = document.getElementById('app');
  var base = 'https://' + cfg.projectId + '.apicdn.sanity.io/v' + cfg.apiVersion + '/data/query/' + cfg.dataset;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }

  function query(q, params) {
    var url = base + '?query=' + encodeURIComponent(q);
    for (var k in params) url += '&' + encodeURIComponent('$' + k) + '=' + encodeURIComponent(JSON.stringify(params[k]));
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

  var lead = document.getElementById('blog-lead');
  var listEl = document.getElementById('blog-list');
  function fail(msg) {
    if (lead) lead.textContent = '';
    if (listEl) { listEl.className = ''; listEl.innerHTML = '<div class="state">' + msg + '</div>'; }
  }

  if (cfg.projectId === 'YOUR_PROJECT_ID') {
    fail('The blog is not connected yet. Add your Sanity project ID in js/config.js.');
    return;
  }

  var slug = new URLSearchParams(location.search).get('post');

  if (slug) {
    query('*[_type=="post" && slug.current==$slug][0]{title,author,publishedAt,"cover":coverImage.asset->url,body[]{...,_type=="image"=>{"url":asset->url,alt}}}', { slug: slug })
      .then(function (p) {
        if (!p) { app.innerHTML = '<section class="article"><a class="back" href="blog.html">← All posts</a><h2>Post not found</h2></section>'; return; }
        document.title = p.title + ' – Specoolasi';
        app.innerHTML = '<section class="article"><a class="back" href="blog.html">← All posts</a>' +
          '<span class="meta">' + esc(fmt(p.publishedAt)) + (p.author ? ' · ' + esc(p.author) : '') + '</span>' +
          '<h1>' + esc(p.title) + '</h1>' +
          (p.cover ? '<img class="hero-img" src="' + esc(p.cover) + '?w=1400&auto=format" alt="">' : '') +
          '<div class="text">' + render(p.body) + '</div></section>';
        window.scrollTo(0, 0);
      })
      .catch(function () { app.innerHTML = '<section class="article"><a class="back" href="blog.html">← All posts</a><div class="state">The post could not be loaded. Please try again later.</div></section>'; });
    return;
  }

  query('*[_type=="post" && defined(slug.current)] | order(publishedAt desc){title,"slug":slug.current,author,publishedAt,excerpt,"cover":coverImage.asset->url}', {})
    .then(function (posts) {
      if (!posts || !posts.length) { lead.textContent = ''; fail('No posts yet. Check back soon.'); return; }
      lead.textContent = 'News, ideas and behind-the-scenes from the Specoolasi team.';
      listEl.innerHTML = posts.map(function (p) {
        return '<a class="post-card" href="blog.html?post=' + encodeURIComponent(p.slug) + '">' +
          (p.cover ? '<img class="cover" src="' + esc(p.cover) + '?w=800&auto=format" alt="">' : '<div class="cover"></div>') +
          '<div class="body"><span class="meta">' + esc(fmt(p.publishedAt)) + (p.author ? ' · ' + esc(p.author) : '') + '</span>' +
          '<h3>' + esc(p.title) + '</h3>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') + '</div></a>';
      }).join('');
    })
    .catch(function () { fail('Posts could not be loaded right now. Please try again later.'); });
})();
