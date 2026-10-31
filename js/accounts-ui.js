(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function logo(a) {
    return a.logo ? '<img class="avatar" src="' + esc(a.logo) + '" alt="">'
                  : '<div class="avatar">' + esc(a.name.charAt(0)) + '</div>';
  }
  var list = document.getElementById('acct-list');
  if (list) {
    list.innerHTML = ACCOUNTS.map(function (a) {
      return '<a class="card acct" href="account.html?id=' + encodeURIComponent(a.id) + '">' + logo(a) + '<h3>' + esc(a.name) + '</h3></a>';
    }).join('');
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
