// Look and illustrations for each account page. Used by accounts-ui.js (see "theme" in accounts.js).
(function () {
  function rep(n, fn) { var o = ''; for (var i = 0; i < n; i++) o += fn(i); return o; }
  function sp(x, y, s, c, d) {
    return '<svg class="spk" style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;animation-delay:' + d + 's" viewBox="-20 -20 40 40"><path fill="' + c + '" d="M0-18Q2.5-2.5 18 0Q2.5 2.5 0 18Q-2.5 2.5-18 0Q-2.5-2.5 0-18Z"/></svg>';
  }
  function ticker(txt) {
    var one = '<span>' + txt + '</span><i>✦</i>', set = new Array(7).join(one);
    return '<div class="ap-ticker" aria-hidden="true"><div>' + set + set + '</div></div>';
  }
  function rise(n, cls, chars) {
    return rep(n, function (i) { return '<i class="' + cls + '" style="left:' + (5 + i * (90 / n)) + '%;animation-delay:' + (i * 1.7 % 9).toFixed(1) + 's;animation-duration:' + (9 + i % 4 * 2) + 's;font-size:' + (14 + i % 3 * 8) + 'px">' + chars[i % chars.length] + '</i>'; });
  }

  window.ACCOUNT_THEMES = {
    // ---- Popthusiast: K-pop idol edits -> photocards, sparkles, lightstick
    pop: {
      tag: 'K-pop idol edits', eyebrow: 'Fresh edits', sampleTitle: 'The photocard collection.', empty: 'New edits are on their way ✦',
      ticker: ticker('K-POP IDOL EDITS'),
      stage: '<i class="pblob b1"></i><i class="pblob b2"></i>' + sp(8, 12, 26, '#FFE600', 0) + sp(88, 9, 34, '#FF4FA3', .6) + sp(50, 5, 20, '#17883A', 1.1) + sp(95, 50, 22, '#FFE600', .3) + sp(3, 58, 30, '#FF4FA3', .9) + sp(72, 84, 24, '#FFE600', 1.4) + sp(24, 92, 18, '#17883A', .2) + rise(9, 'hrt', ['♥', '♥', '✦']),
      art: '<svg class="lightstick" viewBox="0 0 120 230"><rect x="53" y="92" width="14" height="124" rx="7" fill="#fff" stroke="#171321" stroke-width="4"/><rect x="48" y="150" width="24" height="12" rx="3" fill="#FFE600" stroke="#171321" stroke-width="4"/><path d="M60 94C18 64 6 22 36 12C50 8 60 20 60 30C60 20 70 8 84 12C114 22 102 64 60 94Z" fill="#FF4FA3" stroke="#171321" stroke-width="4"/><path d="M38 28c4-7 11-7 15-3" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>' + sp(-6, 4, 26, '#FFE600', .2) + sp(88, 22, 20, '#fff', .7)
    },
    // ---- Globall_id: football news -> pitch, floodlights, rolling ball, trophy
    football: {
      tag: 'Live · Football news', eyebrow: 'Match highlights', sampleTitle: 'Latest from the pitch.', empty: 'Full time soon. Highlights are on their way.',
      ticker: ticker('FOOTBALL NEWS · ALL AROUND THE WORLD'),
      stage: '<svg class="pitch" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#fff" stroke-width="4"><rect x="40" y="40" width="1120" height="720"/><path d="M600 40V760"/><circle cx="600" cy="400" r="110"/><rect x="40" y="220" width="180" height="360"/><rect x="980" y="220" width="180" height="360"/><rect x="40" y="320" width="70" height="160"/><rect x="1090" y="320" width="70" height="160"/></g><circle cx="600" cy="400" r="6" fill="#fff"/></svg><i class="beam l"></i><i class="beam r"></i><i class="grass"></i>' +
        '<div class="ball"><svg viewBox="-20 -20 40 40"><g class="spin"><circle r="18" fill="#fff" stroke="#0B0A2E" stroke-width="2"/><path d="M0-8L7-3L4 6H-4L-7-3Z" fill="#0B0A2E"/><path d="M0-8V-18M7-3L17-7M4 6L10 15M-4 6L-10 15M-7-3L-17-7" stroke="#0B0A2E" stroke-width="2"/></g></svg></div>',
      art: '<svg class="trophy" viewBox="0 0 120 150"><defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1A8"/><stop offset=".5" stop-color="#FFC93C"/><stop offset="1" stop-color="#C98A00"/></linearGradient></defs><path d="M30 14h60v38c0 22-14 36-30 36S30 74 30 52z" fill="url(#gold)" stroke="#0B0A2E" stroke-width="4"/><path d="M30 24H12c0 24 8 34 22 36M90 24h18c0 24-8 34-22 36" fill="none" stroke="#FFC93C" stroke-width="7" stroke-linecap="round"/><rect x="52" y="86" width="16" height="22" fill="url(#gold)" stroke="#0B0A2E" stroke-width="4"/><rect x="34" y="108" width="52" height="14" rx="3" fill="url(#gold)" stroke="#0B0A2E" stroke-width="4"/><rect x="26" y="122" width="68" height="14" rx="3" fill="#3DFF8A" stroke="#0B0A2E" stroke-width="4"/><path class="shine" d="M42 20l6 0-8 52-6 0z" fill="#fff" opacity=".55"/></svg>' + sp(4, 6, 22, '#fff', .3) + sp(86, 30, 18, '#3DFF8A', .9)
    },
    // ---- Ketahui.id: Indonesian news -> newspaper masthead, live tag, microphone
    news: {
      tag: 'Breaking · Indonesia', eyebrow: 'Latest updates', sampleTitle: 'Today’s headlines.', empty: 'The next edition is on its way.',
      ticker: ticker('INDONESIAN NEWS UPDATE · KETAHUI.ID'),
      title: function (n) { return n.replace(/(\.id)$/i, '<span class="red">$1</span>'); },
      pre: function () {
        var d = ''; try { d = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(); } catch (e) {}
        return '<div class="ap-date">' + d + ' · EDISI HARIAN</div>';
      },
      stage: '<svg class="np a" viewBox="0 0 160 200"><rect width="160" height="200" fill="#fff" stroke="#16161A" stroke-width="3"/><rect x="12" y="14" width="136" height="26" fill="#16161A"/><rect x="12" y="50" width="62" height="46" fill="#E11D2E"/><g stroke="#16161A" stroke-width="4"><path d="M84 54h64M84 66h64M84 78h50M12 108h136M12 120h136M12 132h110M12 144h136M12 156h90M12 170h136"/></g></svg>' +
        '<svg class="np b" viewBox="0 0 160 200"><rect width="160" height="200" fill="#fff" stroke="#16161A" stroke-width="3"/><rect x="12" y="14" width="136" height="26" fill="#16161A"/><rect x="86" y="50" width="62" height="46" fill="#16161A"/><g stroke="#16161A" stroke-width="4"><path d="M12 54h62M12 66h62M12 78h50M12 108h136M12 120h136M12 132h110M12 144h136M12 156h90"/></g></svg>',
      art: '<svg class="mic" viewBox="0 0 120 170"><g class="waves" fill="none" stroke="#E11D2E" stroke-width="5" stroke-linecap="round"><path d="M14 56c-8 14-8 30 0 44"/><path d="M4 46c-14 20-14 44 0 64"/><path d="M106 56c8 14 8 30 0 44"/><path d="M116 46c14 20 14 44 0 64"/></g><rect x="38" y="10" width="44" height="76" rx="22" fill="#16161A"/><g stroke="#fff" stroke-width="3" opacity=".7"><path d="M44 30h32M44 44h32M44 58h32"/></g><path d="M28 70c0 22 14 36 32 36s32-14 32-36" fill="none" stroke="#16161A" stroke-width="7" stroke-linecap="round"/><path d="M60 106v34M38 144h44" stroke="#16161A" stroke-width="7" stroke-linecap="round"/></svg>'
    },
    // ---- Popnewsiast: music news -> magazine collage, halftone, vinyl, notes
    magazine: {
      tag: 'Music news · Worldwide', eyebrow: 'On the cover', sampleTitle: 'This week’s issue.', empty: 'The next issue is on its way.',
      ticker: ticker('MUSIC NEWS · ALL AROUND THE WORLD'),
      stage: '<i class="ht a"></i><i class="ht b"></i><i class="mblob"></i>' + rise(10, 'mnote', ['♪', '♫', '♬']),
      art: '<svg class="mvinyl" viewBox="0 0 200 200"><g class="rec"><circle cx="100" cy="100" r="96" fill="#0D0D0D"/><g fill="none" stroke="#3a3a3a" stroke-width="1.5"><circle cx="100" cy="100" r="86"/><circle cx="100" cy="100" r="76"/><circle cx="100" cy="100" r="66"/><circle cx="100" cy="100" r="56"/></g><path d="M100 4a96 96 0 0 1 60 22" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="100" cy="100" r="34" fill="#FF2E63"/><circle cx="100" cy="100" r="5" fill="#F4F1EA"/><path d="M80 90h40M84 112h32" stroke="#fff" stroke-width="3" opacity=".7"/></g></svg><b class="sticker">NEW</b>'
    },
    // ---- Dramories: Korean movie and series clips -> cinema, light rays, film grain, clapperboard
    cinema: {
      tag: 'Now showing · K-drama & film', eyebrow: 'Now showing', sampleTitle: 'Scenes we love.', empty: 'The next screening is on its way.',
      ticker: ticker('KOREAN MOVIES &amp; SERIES · CLIPS &amp; EDITS'),
      stage: '<i class="rays"></i><i class="grain"></i><i class="lbar t"></i><i class="lbar b"></i><i class="spr l"></i><i class="spr r"></i>' +
        '<svg class="reel" viewBox="-70 -70 140 140"><g class="rl" fill="none" stroke="#F4C542" stroke-width="4"><circle r="64"/><circle r="12" fill="#F4C542"/>' + rep(6, function (i) { return '<circle cx="' + (Math.cos(i * Math.PI / 3) * 38).toFixed(1) + '" cy="' + (Math.sin(i * Math.PI / 3) * 38).toFixed(1) + '" r="13"/>'; }) + '</g></svg>' +
        rep(14, function (i) { return '<i class="dust" style="left:' + (4 + i * 6.8) + '%;width:' + (2 + i % 3) + 'px;height:' + (2 + i % 3) + 'px;animation-delay:' + (i * 1.1 % 10).toFixed(1) + 's;animation-duration:' + (10 + i % 5 * 2) + 's"></i>'; }),
      art: '<svg class="clap" viewBox="0 0 140 130"><g class="arm" style="transform-box:view-box;transform-origin:10px 44px"><rect x="8" y="14" width="124" height="28" fill="#0a0a14" stroke="#F4C542" stroke-width="4"/><g fill="#F4C542">' + rep(6, function (i) { return '<path d="M' + (14 + i * 20) + ' 16l12 0-10 24-12 0z"/>'; }) + '</g></g><rect x="8" y="46" width="124" height="76" fill="#0a0a14" stroke="#F4C542" stroke-width="4"/><g fill="#F4C542">' + rep(6, function (i) { return '<path d="M' + (14 + i * 20) + ' 48l12 0-10 22-12 0z"/>'; }) + '</g><g stroke="#F5EFD9" stroke-width="3" opacity=".8"><path d="M20 86h60M20 100h90M20 112h50"/></g></svg>'
    },
    // ---- Listenation: EDM and music recommendations -> lasers, neon grid, equalizer, headphones
    club: {
      tag: 'Now playing · EDM', eyebrow: 'On the playlist', sampleTitle: 'Tracks on repeat.', empty: 'The next drop is on its way.',
      ticker: ticker('EDM &amp; MUSIC RECOMMENDATIONS'),
      stage: '<i class="floor"></i>' + [['#22E4FF', 30, 4.2, 18, 0], ['#8A4DFF', 45, 5.4, 12, 1.2], ['#1E5BFF', 50, 3.6, 26, .4], ['#22E4FF', 70, 6, 14, 2], ['#8A4DFF', 55, 4.8, 32, .8], ['#1E5BFF', 20, 5.2, 22, 1.6]].map(function (l) {
        return '<i class="laser" style="left:' + l[1] + '%;--c:' + l[0] + ';--t:' + l[2] + 's;--a:' + l[3] + 'deg;animation-delay:' + l[4] + 's"></i>';
      }).join('') + '<div class="eq">' + rep(64, function (i) { return '<i style="--s:' + (0.5 + (i * 37 % 10) / 9).toFixed(2) + 's;animation-delay:-' + (i * 53 % 17 / 10).toFixed(1) + 's"></i>'; }) + '</div>',
      art: '<i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i><svg class="hp" viewBox="0 0 160 150"><defs><linearGradient id="hpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22E4FF"/><stop offset="1" stop-color="#8A4DFF"/></linearGradient></defs><path d="M22 92V76C22 40 46 18 80 18s58 22 58 58v16" fill="none" stroke="url(#hpg)" stroke-width="10" stroke-linecap="round"/><rect x="10" y="80" width="30" height="52" rx="12" fill="#0B0920" stroke="url(#hpg)" stroke-width="6"/><rect x="120" y="80" width="30" height="52" rx="12" fill="#0B0920" stroke="url(#hpg)" stroke-width="6"/><circle cx="25" cy="106" r="5" fill="#22E4FF"/><circle cx="135" cy="106" r="5" fill="#22E4FF"/></svg>'
    }
  };
})();
