// Custom cursor: the Specoolasi four-point star, a soft ring that follows it, and sparkles.
// Only runs on computers with a mouse. Touch screens and "reduce motion" users keep the normal cursor.
(function () {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var root = document.documentElement;
  var dot = document.createElement('div');
  dot.className = 'cur-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<svg viewBox="-20 -20 40 40"><path d="M0-18Q2.5-2.5 18 0Q2.5 2.5 0 18Q-2.5 2.5-18 0Q-2.5-2.5 0-18Z"/></svg>';
  var ring = document.createElement('div');
  ring.className = 'cur-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<span></span>';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  var x = -100, y = -100, rx = -100, ry = -100, lx = -100, ly = -100, on = false;
  var colors = ['#6C4DFF', '#B8A7FF'];

  function spark(px, py, big) {
    var s = document.createElement('div');
    s.className = 'cur-spark';
    var size = big ? 12 + Math.random() * 10 : 6 + Math.random() * 6;
    s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + px + 'px;top:' + py + 'px;background:' + colors[Math.random() < 0.5 ? 0 : 1];
    document.body.appendChild(s);
    var dx = (Math.random() - 0.5) * (big ? 120 : 40), dy = (Math.random() - 0.5) * (big ? 120 : 40) + (big ? 0 : 14);
    var a = s.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(0) rotate(180deg)', opacity: 0 }
    ], { duration: big ? 700 : 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
    a.onfinish = function () { s.remove(); };
  }

  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    if (!on) { on = true; rx = x; ry = y; lx = x; ly = y; root.classList.add('has-cursor'); }
    dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    var dx = x - lx, dy = y - ly;
    if (dx * dx + dy * dy > 1600) { spark(x, y, false); lx = x; ly = y; }
  }, { passive: true });

  (function loop() {
    rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    requestAnimationFrame(loop);
  })();

  var HOT = '.sv,a,button,[role="button"],summary,label,.acard,.ap-sample,.post-card';
  var TEXT = 'input,textarea,select,[contenteditable="true"]';
  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    var text = t.closest && t.closest(TEXT);
    root.classList.toggle('cur-text', !!text);
    root.classList.toggle('cur-hot', !text && !!(t.closest && t.closest(HOT)));
  });
  document.addEventListener('mousedown', function () {
    root.classList.add('cur-down');
    if (!root.classList.contains('cur-text')) for (var i = 0; i < 8; i++) spark(x, y, true);
  });
  document.addEventListener('mouseup', function () { root.classList.remove('cur-down'); });
  document.documentElement.addEventListener('mouseleave', function () { root.classList.add('cur-away'); });
  document.documentElement.addEventListener('mouseenter', function () { root.classList.remove('cur-away'); });
})();
