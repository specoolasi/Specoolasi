/* Terraria-style pixel scenes: one full-page, live side-view scene per account (account pages only).
   Needs <canvas id="tr-c" data-scene="account-id">. No libraries. Click empty space: characters jump. */
(function () {
'use strict';
const cv = document.getElementById('tr-c'); if (!cv) return;
const SC = cv.dataset.scene, X = cv.getContext('2d'), bgc = document.createElement('canvas'), BX = bgc.getContext('2d');
let c = BX, W, H, s, gy, bx, T = 0, seed = 7, Y0, Y1, chars = [], dyn = [], fg = [], pops = [];
const BW = 140;
const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const R = (x, y, w, h, k) => { c.fillStyle = k; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hx = k => [1, 3, 5].map(i => parseInt(k.slice(i, i + 2), 16));
const mix = (a, b, t) => { const p = hx(a), q = hx(b); return 'rgb(' + p.map((v, i) => Math.round(v + (q[i] - v) * t)).join(',') + ')'; };
const tex = (x, y, w, h, a, b, d = .12) => { R(x, y, w, h, a); for (let i = w * h * d; i > 0; i--) R(x + (rnd() * w | 0), y + (rnd() * h | 0), 1, 1, b); };
const sky = (a, b, cl) => { for (let y = 0; y < H; y++) R(0, y, W, 1, mix(a, b, Math.min(1, y / gy))); if (cl) for (let i = 0; i < Math.ceil(W / 22); i++) { const x = rnd() * W, y = 6 + rnd() * gy * .4; R(x, y, 22, 4, cl); R(x + 4, y - 3, 14, 3, cl); R(x + 8, y + 4, 12, 2, cl); } };
const stars = n => { for (let i = 0; i < (n || 50); i++) R(rnd() * W | 0, rnd() * gy * .7 | 0, 1, 1, '#fff'); dyn.push(t => { for (let i = 0; i < 9; i++) R((i * 71 + 13) % W, (i * 37 + 9) % (gy * .6 | 0), 1, 1, Math.sin(t * 3 + i) > 0 ? '#fff' : '#8a8fd0'); }); };
const hills = (k, base, amp, f, ph) => { for (let x = 0; x < W; x++) { const h = base + amp * Math.sin(x * f + ph) + amp * .5 * Math.sin(x * f * 2.3 + ph * 2); R(x, gy - h, 1, h, k); } };
const ground = (t, m, l) => { tex(0, gy, W, H - gy, m, l, .2); R(0, gy, W, 3, t); };
const tree = (x, h, k, tk) => { R(x - 1, gy - h, 3, h, tk || '#5a3a1e'); [[-7, -6, 15, 8], [-5, -10, 11, 6], [-9, -2, 19, 5]].forEach(q => tex(x + q[0], gy - h + q[1], q[2], q[3], k, mix(k, '#ffffff', .25), .2)); };
const forest = (k, tk) => { let x = 8; while (x < W) { if (x < bx - 14 || x > bx + BW + 14) tree(x | 0, 18 + (rnd() * 14 | 0), k, tk); x += 24 + (rnd() * 20 | 0); } };
function house(x, y, w, h, o) {
  tex(x, y, w, h, o.w, o.w2, .14); R(x, y, 2, h, o.b); R(x + w - 2, y, 2, h, o.b);
  (o.f || []).forEach(f => R(x, y + f, w, 2, o.b)); R(x, y + h - 2, w, 2, o.b);
  const rh = o.rh || 26; for (let i = 0; i < rh; i++) { const ww = (w + 10) * (1 - i / rh); R(x + w / 2 - ww / 2, y - 1 - i, ww, 1, i % 5 === 4 ? o.r2 : o.r); }
}
const IC = { heart: ['01010', '11111', '11111', '01110', '00100'], star: ['00100', '01110', '11111', '01110', '01010'], note: ['00110', '00101', '00100', '11100', '11100'], bang: ['00100', '00100', '00100', '00000', '00100'], ball: ['01110', '11111', '11111', '11111', '01110'] };
const IK = { heart: '#ff4f9a', star: '#ffb300', note: '#6c4dff', bang: '#e63946', ball: '#17131f' };
const ico = (n, x, y, k) => IC[n].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '1') R(x + i, y + j, 1, 1, k); });
const ch = (x, y, o) => chars.push(Object.assign({ x, y, x0: x, t: rnd() * 9, act: 'idle', skin: '#f2c29b', hair: '#3a2a1a', top: '#6c4dff', bot: '#2d2a44', dir: 1, e: 'star', sp: 1.2, rg: 10, hop: 0, cx: x, cy: y }, o));
function drawCh(p) {
  const t = T * 8 + p.t, sn = Math.sin(t), a = p.act; let x = p.x, la = 0, ra = 0, lg = 0, up = 0;
  if (p.hop > 0) { p.hop -= .025; up = Math.abs(Math.sin(p.hop * 10)) * 7; la = ra = 2; }
  else if (a === 'dance') { up = Math.abs(sn) * 2; la = sn > 0 ? 2 : 0; ra = 2 - la; }
  else if (a === 'cheer') { up = Math.abs(sn) * 2; la = ra = 2; }
  else if (a === 'type') { la = ra = 1; }
  else if (a === 'walk') { x = p.x0 + Math.sin(T * p.sp + p.t) * p.rg; p.dir = Math.cos(T * p.sp + p.t) > 0 ? 1 : -1; lg = sn > 0 ? 1 : -1; la = sn > 0 ? 1 : 0; ra = 1 - la; }
  else if (a === 'dj') { la = sn > 0 ? 1 : 0; ra = 1 - la; }
  else if (a === 'wave') { ra = sn > 0 ? 2 : 1; }
  else if (a === 'talk') { up = sn > .85 ? 1 : 0; ra = Math.sin(t / 2) > .2 ? 1 : 0; }
  const y = p.y - up, d = p.dir; p.cx = x; p.cy = y;
  if (p.sit) { R(d > 0 ? x - 1 : x - 4, y - 5, 5, 2, p.bot); R(d > 0 ? x + 2 : x - 3, y - 3, 2, 3, p.bot); }
  else { R(x - 2 + (lg > 0 ? 1 : 0), y - 5, 2, 5, p.bot); R(x + (lg < 0 ? -1 : 0), y - 5, 2, 5, p.bot); }
  R(x - 2, y - 10, 4, 5, p.top); R(x - 2, y - 15, 4, 5, p.skin); R(x - 2, y - 15, 4, 2, p.hair); R(d > 0 ? x - 2 : x + 1, y - 15, 1, 4, p.hair); R(x + (d > 0 ? 1 : -2), y - 12, 1, 1, '#111');
  if (p.acc === 'hp') { R(x - 3, y - 14, 1, 3, '#17131f'); R(x + 2, y - 14, 1, 3, '#17131f'); R(x - 2, y - 16, 4, 1, '#17131f'); }
  [[x - 3, la], [x + 2, ra]].forEach(q => {
    const k = q[1], sx = q[0];
    if (k === 0) R(sx, y - 9, 1, 4, p.top);
    else if (k === 1) { R(d > 0 ? x + 2 : x - 4, y - 8, 3, 1, p.top); R(d > 0 ? x + 5 : x - 5, y - 8, 1, 1, p.skin); }
    else { R(sx, y - 14, 1, 5, p.top); R(sx, y - 15, 1, 1, p.skin); if (p.acc === 'lst') R(sx, y - 19, 1, 4, p.lc || '#ff4fa3'); }
  });
  if (p.acc === 'mic') R(d > 0 ? x + 5 : x - 6, y - 9, 1, 2, '#222');
  if (p.acc === 'umb') { R(x - 5, y - 22, 11, 2, p.lc || '#e63946'); R(x, y - 20, 1, 6, '#222'); }
  if (p.e && (T + p.t) % 6 < 1.8) { const b0 = x - 5, by = y - 26; R(b0, by, 10, 9, '#fff'); R(b0 + 4, by + 9, 2, 2, '#fff'); ico(p.e, b0 + 2, by + 2, IK[p.e]); }
}
/* props */
const desk = (x, y, w) => { R(x, y - 5, w, 2, '#7a4a24'); R(x + 1, y - 3, 2, 3, '#5a3416'); R(x + w - 3, y - 3, 2, 3, '#5a3416'); };
const scr = (x, y, w, h, cols, sp) => { R(x - 1, y - 1, w + 2, h + 2, '#222'); dyn.push(t => R(x, y, w, h, cols[Math.floor(t * (sp || 2) + x) % cols.length])); };
const mon = (x, y, cols) => { R(x + 3, y - 7, 1, 2, '#222'); scr(x, y - 12, 7, 5, cols, 2); };
const speaker = (x, y, k) => { R(x, y - 14, 8, 14, '#111'); R(x + 2, y - 12, 4, 3, '#333'); dyn.push(t => { const r = Math.sin(t * 9 + x) > 0 ? 5 : 4; R(x + 4 - r / 2, y - 6 - r / 2, r, r, k || '#6c4dff'); }); };
const lamp = (x, y, k) => { R(x, y - 10, 1, 10, '#555'); R(x - 2, y - 13, 5, 3, k || '#ffd36b'); };
const shelf = (x, y, w, h) => { R(x, y - h, w, h, '#6b3d17'); for (let r = 0; r < h - 3; r += 6) for (let i = 0; i < w - 2; i += 2) R(x + 1 + i, y - h + 2 + r, 1, 4, ['#e63946', '#ffd84d', '#4fa3ff', '#4cc38a', '#ff7ab8'][(i + r) % 5]); };
const sofa = (x, y, k) => { R(x, y - 5, 18, 5, k); R(x, y - 10, 3, 10, k); R(x + 15, y - 10, 3, 10, k); R(x + 3, y - 9, 12, 4, mix(k, '#000000', .25)); };
const front = (x, y, w, h, k) => fg.push(() => R(x, y - h, w, h, k));
const text = (t, x, y, k) => { c.fillStyle = k; c.font = 'bold 6px monospace'; c.textBaseline = 'top'; c.fillText(t, x, y); };
const blink = (x, y, w, h, a, b, per) => dyn.push(t => R(x, y, w, h, Math.floor(t / per) % 2 ? a : b));
const glow = (x, y, r, k, a) => dyn.push(t => { c.globalAlpha = a * (.8 + .2 * Math.sin(t * 7 + x)); c.fillStyle = k; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1; });
const beam = (x, y, w, h, k, sp) => dyn.push(t => { const o = Math.sin(t * sp) * 14; c.globalAlpha = .2; c.fillStyle = k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + o - w, y + h); c.lineTo(x + o + w, y + h); c.fill(); c.globalAlpha = 1; });
const rise = (n, x, y, w, k) => dyn.push(t => { for (let i = 0; i < 3; i++) ico(n, x + i * w / 3, y - ((t * 10 + i * 13) % 30), k); });
const camera = (x, y) => { R(x, y - 14, 9, 6, '#333'); R(x - 3, y - 12, 3, 3, '#9ad0ff'); R(x + 3, y - 8, 1, 8, '#333'); R(x, y - 2, 3, 2, '#333'); R(x + 5, y - 2, 3, 2, '#333'); blink(x + 7, y - 13, 2, 2, '#ff3b30', '#5a1410', .5); };
const SCN = {};

SCN.popthusiast = () => {
  sky('#ffc8e6', '#fff3a6', '#ffffff'); hills('#f6b3e0', 26, 8, .05, 1); hills('#ffd0ea', 14, 6, .08, 3); ground('#7be08a', '#c58a5a', '#9a6a40'); forest('#ff9ccb');
  house(bx, gy - 80, BW, 80, { w: '#ff9ccb', w2: '#ff7ab8', b: '#7c2a6a', f: [38], r: '#6c4dff', r2: '#b8a7ff' });
  R(bx + 22, gy - 76, 96, 30, '#2b1850'); R(bx + 20, Y1 - 4, 100, 4, '#ffd84d');
  dyn.push(t => { for (let i = 0; i < 9; i++) R(bx + 28 + i * 10, gy - 74, 3, 3, ['#ff4fa3', '#ffd84d', '#4cf0c0', '#7c5cff'][Math.floor(t * 3 + i) % 4]); });
  beam(bx + 40, gy - 72, 14, 32, '#ff4fa3', .9); beam(bx + 100, gy - 72, 14, 32, '#ffd84d', 1.3);
  ch(bx + 46, Y1 - 4, { act: 'dance', hair: '#ff4fa3', top: '#ff4fa3', bot: '#fff', e: 'heart' }); ch(bx + 70, Y1 - 4, { act: 'dance', hair: '#4cf0c0', top: '#7c5cff', bot: '#fff' }); ch(bx + 94, Y1 - 4, { act: 'dance', hair: '#b8a7ff', top: '#ffd84d', bot: '#fff', e: 'heart' });
  speaker(bx + 6, Y1); speaker(bx + BW - 14, Y1); rise('heart', bx + 40, Y1 - 20, 60, '#ff4fa3');
  desk(bx + 10, Y0, 34); mon(bx + 13, Y0 - 5, ['#4fa3ff', '#ff4fa3', '#ffd84d']); mon(bx + 25, Y0 - 5, ['#ff4fa3', '#4cf0c0']);
  ch(bx + 40, Y0, { act: 'type', sit: 1, dir: -1, hair: '#222', top: '#fff', e: 'star' });
  [[80, '#ff4fa3'], [96, '#ffd84d'], [112, '#4cf0c0']].forEach(q => ch(bx + q[0], Y0, { act: 'cheer', acc: 'lst', lc: q[1], top: '#fff', hair: '#7a3b1f' }));
  ch(bx - 16, gy, { act: 'cheer', acc: 'lst' }); ch(bx + BW + 16, gy, { act: 'wave', e: 'heart' });
};

SCN.ketahui = () => {
  sky('#a8d8ff', '#f3e8d8', '#ffffff'); hills('#9fc3dd', 30, 10, .04, 2);
  const mx = bx - 34; R(mx - 7, gy - 8, 15, 8, '#d9d0c0'); R(mx - 2, gy - 52, 5, 44, '#efe9dc'); R(mx - 6, gy - 56, 13, 4, '#efe9dc'); dyn.push(t => R(mx - 1, gy - 64, 3, 8, Math.sin(t * 12) > 0 ? '#ffd84d' : '#ff9f43'));
  ground('#6fcf7a', '#c58a5a', '#9a6a40'); forest('#3fae5a');
  house(bx, gy - 80, BW, 80, { w: '#e8dfd0', w2: '#cfc3ad', b: '#8a1f2b', f: [38], r: '#e63946', r2: '#ffffff' });
  const cx = bx + BW / 2; R(cx, gy - 124, 1, 18, '#ccc');
  dyn.push(t => { for (let i = 0; i < 14; i++) { const w = Math.round(Math.sin(t * 5 + i * .6)); R(cx + 1 + i, gy - 124 + w, 1, 3, '#e63946'); R(cx + 1 + i, gy - 121 + w, 1, 3, '#fff'); } });
  R(bx + 10, gy - 76, 120, 30, '#173a8a'); text('KETAHUI NEWS', bx + 34, gy - 72, '#fff'); scr(bx + 100, gy - 66, 22, 14, ['#4fa3ff', '#e63946', '#ffd84d', '#4cc38a'], .8);
  ch(bx + 54, Y1, { act: 'talk', top: '#17131f', hair: '#2b1d17', e: 'bang' }); ch(bx + 74, Y1, { act: 'talk', top: '#e63946', hair: '#111', e: 'bang' }); front(bx + 44, Y1, 40, 8, '#e63946'); camera(bx + 14, Y1);
  desk(bx + 10, Y0, 28); mon(bx + 13, Y0 - 5, ['#4fa3ff', '#fff']); ch(bx + 34, Y0, { act: 'type', sit: 1, dir: -1, top: '#4cc38a', e: 'bang' });
  desk(bx + 60, Y0, 28); mon(bx + 63, Y0 - 5, ['#e63946', '#fff']); ch(bx + 84, Y0, { act: 'type', sit: 1, dir: -1, top: '#ffd84d' });
  scr(bx + 102, gy - 34, 10, 8, ['#4fa3ff', '#e63946', '#fff'], 1.5); scr(bx + 116, gy - 34, 10, 8, ['#4cc38a', '#ffd84d'], 1.1);
  ch(bx - 14, gy, { act: 'walk', rg: 10, acc: 'mic', top: '#4cc38a', e: 'bang' }); ch(bx + BW + 18, gy, { act: 'walk', rg: 8, top: '#333' });
};

SCN.globall = () => {
  sky('#79c8ff', '#d6f5ff', '#ffffff'); hills('#8ec9a0', 20, 6, .04, 2);
  const cols = ['#e63946', '#ffd84d', '#4fa3ff', '#fff', '#4cc38a', '#ff9f43'], crowd = [];
  for (let i = 0; i < 5; i++) { R(0, gy - 8 - i * 8, W, 8, i % 2 ? '#394a7a' : '#2f3a5f'); for (let x = 1; x < W - 2; x += 3) crowd.push([x, gy - 8 - i * 8 + 1, cols[rnd() * 6 | 0], i]); }
  dyn.push(t => crowd.forEach(q => R(q[0], q[1] + (Math.sin(t * 5 + q[0] * .7 + q[3]) > .7 ? -1 : 0), 2, 4, q[2])));
  [bx - 22, bx + BW + 22].forEach(x => { R(x, gy - 78, 2, 78, '#555'); R(x - 6, gy - 84, 14, 6, '#e8e8e8'); glow(x + 1, gy - 78, 14, '#fff7b0', .25); });
  R(bx + 40, gy - 72, 56, 22, '#10161f'); text('GLOBALL', bx + 52, gy - 70, '#4cf0c0'); dyn.push(t => { R(bx + 62, gy - 61, 14, 8, '#10161f'); text(Math.floor(t / 7) % 4 + '-' + (Math.floor(t / 11) % 3), bx + 62, gy - 61, '#ffd84d'); });
  R(bx + 100, gy - 70, 40, 24, '#2b2f45'); R(bx + 102, gy - 68, 36, 12, '#8fd3ff'); R(bx + 100, gy - 48, 40, 3, '#7a4a24'); mon(bx + 104, gy - 48, ['#4cc38a', '#fff']);
  ch(bx + 122, gy - 46, { act: 'talk', sit: 1, dir: -1, acc: 'hp', top: '#17131f', e: 'ball' }); ch(bx + 132, gy - 46, { act: 'type', sit: 1, dir: -1, acc: 'hp', top: '#e63946' });
  ground('#3fae5a', '#3fae5a', '#379650'); for (let x = 0; x < W; x += 28) R(x, gy + 3, 14, H - gy, '#46b862'); R(0, gy + 3, W, 1, '#fff'); R(W / 2, gy + 3, 1, H - gy, '#fff'); R(W / 2 - 6, gy + 12, 13, 1, '#fff');
  [bx - 6, bx + BW + 6].forEach((gx, i) => { R(gx, gy - 10, 1, 24, '#fff'); R(gx + (i ? 7 : -7), gy - 10, 1, 24, '#fff'); R(Math.min(gx, gx + (i ? 7 : -7)), gy - 10, 8, 1, '#fff'); for (let k = 0; k < 24; k += 3) R(Math.min(gx, gx + (i ? 7 : -7)), gy - 10 + k, 8, 1, 'rgba(255,255,255,.35)'); });
  [[gy + 9, '#e63946', 1.5, 40], [gy + 15, '#2b6fe0', 1.2, 50], [gy + 21, '#e63946', 1.8, 30], [gy + 12, '#2b6fe0', 1.0, 55], [gy + 19, '#e63946', 1.3, 45]].forEach((q, i) => ch(W / 2 + (i - 2) * 22, q[0], { act: 'walk', sp: q[2], rg: q[3], top: q[1], hair: ['#222', '#7a3b1f', '#e8c050'][i % 3], e: 'ball' }));
  ch(bx + 2, gy + 14, { act: 'wave', top: '#ffd84d' }); ch(bx + BW - 2, gy + 14, { act: 'wave', top: '#8a2be2' });
  for (let i = 0; i < 7; i++) ch(10 + i * (W - 20) / 6, gy - 8 - (i % 4) * 8, { act: 'cheer', top: cols[i % 6], hair: '#222', e: 'ball' });
  fg.push(() => { const x = W / 2 + Math.sin(T * .9) * 40, y = gy + 14 - Math.abs(Math.sin(T * 3)) * 8; R(x, y, 3, 3, '#fff'); R(x + 1, y + 1, 1, 1, '#17131f'); });
};

SCN.popnewsiast = () => {
  sky('#2b1f45', '#ff7ab0'); R(W - 40, gy - 40, 12, 12, '#ffe9b0'); hills('#4a2a6a', 28, 9, .04, 2); hills('#2a1a45', 16, 6, .07, 5); ground('#3a2a63', '#5a3a6a', '#3a2550'); forest('#5b3a8c', '#2a1a45');
  house(bx, gy - 80, BW, 80, { w: '#3a2a63', w2: '#2b1f45', b: '#1a1030', f: [38], r: '#ff4f9a', r2: '#ffb3d1' });
  const cx = bx + BW / 2; R(cx, gy - 150, 2, 44, '#ddd'); R(cx - 4, gy - 130, 10, 1, '#ddd'); blink(cx, gy - 152, 2, 2, '#ff3b30', '#5a1410', .5);
  dyn.push(t => { c.strokeStyle = '#ffb3d1'; for (let i = 0; i < 3; i++) { const r = (t * 14 + i * 12) % 36; c.globalAlpha = 1 - r / 36; c.beginPath(); c.arc(cx + 1, gy - 151, r, 0, 7); c.stroke(); } c.globalAlpha = 1; });
  R(bx + 8, gy - 74, 30, 10, '#17131f'); dyn.push(t => text('ON AIR', bx + 10, gy - 72, Math.floor(t * 2) % 2 ? '#ff3b30' : '#5a1410'));
  desk(bx + 50, Y1, 40); dyn.push(t => { [bx + 54, bx + 74].forEach(x => { R(x, Y1 - 8, 9, 3, '#111'); R(x + ((t * 8) % 9 | 0), Y1 - 8, 1, 3, '#ffd84d'); }); });
  ch(bx + 100, Y1, { act: 'talk', dir: -1, acc: 'mic', top: '#ff4f9a', hair: '#ffd84d', e: 'note' }); R(bx + 96, Y1 - 10, 1, 10, '#333');
  R(bx + 20, Y1 - 6, 10, 6, '#4b3a7a'); dyn.push(t => { c.fillStyle = '#2b8cff'; c.beginPath(); c.arc(bx + 25, Y1 - 14, 7, 0, 7); c.fill(); for (let k = 0; k < 3; k++) { const g = ((t * 5 + k * 5.3) % 16) - 8; if (Math.abs(g) < 5) R(bx + 24 + g, Y1 - 17 + k * 3, 3, 2, '#4cc38a'); } });
  rise('note', bx + 50, Y1 - 24, 60, '#ffb3d1');
  for (let i = 0; i < 4; i++) { R(bx + 10 + i * 14, gy - 34, 10, 10, '#111'); R(bx + 13 + i * 14, gy - 31, 4, 4, '#ffd84d'); }
  ch(bx + 66, Y0, { act: 'dj', top: '#4cc38a', hair: '#c0392b', e: 'note' }); R(bx + 72, Y0 - 9, 8, 5, '#e8863a'); R(bx + 78, Y0 - 8, 8, 1, '#6b3d17');
  desk(bx + 98, Y0, 22); mon(bx + 100, Y0 - 5, ['#74b9ff', '#fff']); ch(bx + 124, Y0, { act: 'type', sit: 1, dir: -1, top: '#ffd84d', acc: 'hp' }); speaker(bx + 8, Y0, '#ff4f9a');
  ch(bx + BW + 18, gy, { act: 'walk', rg: 10, acc: 'hp', top: '#8b8bff', e: 'note' });
};

SCN.dramories = () => {
  sky('#0b1240', '#3b6aa8'); stars(60); R(W - 34, 16, 9, 9, '#fff3c4'); hills('#1d2f6a', 26, 8, .05, 1); ground('#4a7a5a', '#3a2c24', '#2a2018'); forest('#ffb3d1', '#4a2a2a');
  dyn.push(t => { for (let k = 0; k < 16; k++) R(((k * 37 + t * 6) % W) + Math.sin(t + k) * 3, (t * 9 + k * 23) % gy, 1, 1, '#ffd0e4'); });
  house(bx, gy - 80, BW, 80, { w: '#efe3c6', w2: '#d9c9a0', b: '#5a3a1e', f: [38], r: '#3d4455', r2: '#5a6275', rh: 14 }); R(bx - 8, gy - 84, 8, 2, '#3d4455'); R(bx + BW, gy - 84, 8, 2, '#3d4455');
  R(bx + 104, gy - 76, 30, 32, '#222'); dyn.push(t => { R(bx + 106, gy - 74, 26, 28, ['#6a4cff', '#ff7ab0', '#2b8cff', '#ffb347'][Math.floor(t / 2) % 4]); const o = (t * 5) % 12; R(bx + 112 + o / 3, gy - 62, 3, 10, '#10122a'); R(bx + 120 - o / 3, gy - 62, 3, 10, '#10122a'); });
  R(bx + 6, Y1 - 22, 10, 6, '#555'); dyn.push(() => { c.globalAlpha = .12; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(bx + 16, Y1 - 19); c.lineTo(bx + 104, gy - 76); c.lineTo(bx + 104, gy - 46); c.fill(); c.globalAlpha = 1; });
  [24, 42, 60, 78].forEach((x, i) => { R(bx + x - 4, Y1 - 4, 10, 4, '#7a1f2b'); ch(bx + x, Y1 - 4, { sit: 1, top: ['#ffd84d', '#fff', '#ff7ab8', '#4cc38a'][i], hair: ['#222', '#e8863a', '#111', '#7a3b1f'][i], e: i % 2 ? 'heart' : 'star' }); });
  desk(bx + 10, Y0, 34); mon(bx + 13, Y0 - 5, ['#6a4cff', '#ff7ab0', '#2b8cff']); ch(bx + 40, Y0, { act: 'type', sit: 1, dir: -1, top: '#fff', hair: '#222' });
  R(bx + 70, Y0 - 9, 34, 9, '#c0392b'); ch(bx + 86, Y0 - 9, { act: 'talk', top: '#fff', e: 'heart' }); R(bx + 108, gy - 34, 22, 26, '#fff'); R(bx + 111, gy - 31, 16, 14, '#ff7ab0');
  ch(bx - 24, gy, { act: 'walk', rg: 12, top: '#ff7ab0', hair: '#111', e: 'heart' }); ch(bx - 18, gy, { act: 'walk', rg: 12, top: '#4fa3ff', hair: '#222' });
};

SCN.listenation = () => {
  sky('#0a0620', '#2a0f5c'); stars(70); R(W - 34, 14, 9, 9, '#e8e0ff'); hills('#1a0f3a', 24, 8, .05, 1); ground('#2a1a55', '#2b1b4a', '#1c1233'); forest('#2b1b6a', '#1a1030');
  house(bx, gy - 80, BW, 80, { w: '#1a1233', w2: '#241848', b: '#4b2bb0', f: [38], r: '#22e4ff', r2: '#8a4dff', rh: 6 });
  dyn.push(t => { for (let i = 0; i < 28; i++) { const h = 3 + Math.abs(Math.sin(t * 4 + i * .7)) * 8; R(bx + 4 + i * 5, gy - 87 - h, 3, h, ['#22e4ff', '#ff4fa3', '#b8ff3d'][i % 3]); } });
  R(bx + 50, Y1 - 6, 40, 6, '#2d3a8c'); ch(bx + 70, Y1 - 6, { act: 'dj', acc: 'hp', top: '#ff7ab8', hair: '#22e4ff', e: 'note' }); ch(bx + 30, Y1, { act: 'dance', top: '#22e4ff', e: 'note' }); ch(bx + 112, Y1, { act: 'dance', top: '#b8ff3d', hair: '#ff4fa3' });
  speaker(bx + 6, Y1, '#22e4ff'); speaker(bx + BW - 14, Y1, '#ff4fa3');
  dyn.push(t => { R(bx + 66, gy - 76, 8, 8, '#cfd6ff'); for (let k = 0; k < 4; k++) R(bx + 66 + (k * 3 + t * 6 | 0) % 8, gy - 76 + (k * 5 + t * 4 | 0) % 8, 1, 1, '#fff'); c.lineWidth = 1; for (let k = 0; k < 5; k++) { c.strokeStyle = ['#22e4ff', '#ff4fa3', '#b8ff3d', '#ffd84d', '#8a4dff'][(k + Math.floor(t * 2)) % 5]; c.globalAlpha = .5; c.beginPath(); c.moveTo(bx + 70, gy - 68); c.lineTo(bx + 10 + k * 30 + Math.sin(t * 2 + k) * 12, Y1); c.stroke(); } c.globalAlpha = 1; });
  dyn.push(t => { for (let i = 0; i < 12; i++) R(bx + 10 + i * 10, Y0 - 2, 9, 2, ['#22e4ff', '#ff4fa3', '#b8ff3d', '#8a4dff'][Math.floor(t * 3 + i) % 4]); });
  [[24, '#ff4fa3'], [50, '#ffd84d'], [78, '#22e4ff'], [106, '#b8ff3d']].forEach((q, i) => ch(bx + q[0], Y0 - 2, { act: 'dance', top: q[1], hair: ['#222', '#e8863a', '#111', '#7a3b1f'][i], e: i % 2 ? 'note' : 'heart' }));
  ch(bx - 18, gy, { act: 'dance', acc: 'lst', lc: '#22e4ff' }); ch(bx + BW + 18, gy, { act: 'dance', acc: 'lst', lc: '#ff4fa3', top: '#ff4fa3' });
};

SCN.gloome = () => {
  sky('#0d1020', '#222a44', '#2c3556'); stars(40); c.fillStyle = '#d8def0'; c.beginPath(); c.arc(W - 34, 24, 6, 0, 7); c.fill(); c.fillStyle = '#141a30'; c.beginPath(); c.arc(W - 31, 22, 5.5, 0, 7); c.fill(); hills('#1a2038', 26, 8, .05, 1); ground('#2f4a3a', '#3a2c24', '#2a2018'); forest('#1f3a33', '#2a2018');
  house(bx, gy - 80, BW, 80, { w: '#6a4f55', w2: '#5a4048', b: '#1b1520', f: [38], r: '#2a2a44', r2: '#3a3a60' });
  R(bx + 70, gy - 72, 14, 16, '#10142a'); R(bx + 75, gy - 68, 1, 1, '#fff');
  desk(bx + 14, Y1, 40); R(bx + 22, Y1 - 7, 8, 2, '#fff'); R(bx + 38, Y1 - 9, 2, 4, '#fff'); dyn.push(t => R(bx + 38, Y1 - 12, 2, 3, Math.sin(t * 14) > 0 ? '#ffd84d' : '#ff9f43')); glow(bx + 39, Y1 - 14, 16, '#ffcf6b', .08);
  ch(bx + 58, Y1, { act: 'type', sit: 1, dir: -1, top: '#8b8bff', hair: '#222', e: 'star' });
  R(bx + 88, Y1 - 6, 40, 6, '#5a3a8a'); R(bx + 106, Y1 - 10, 8, 4, '#d99a4a'); R(bx + 112, Y1 - 12, 3, 3, '#d99a4a'); dyn.push(t => R(bx + 102 + Math.sin(t * 2) * 1.5, Y1 - 9, 4, 1, '#d99a4a'));
  sofa(bx + 14, Y0, '#7a3b4f'); ch(bx + 26, Y0, { sit: 1, top: '#c0392b', e: 'heart' }); R(bx + 33, Y0 - 9, 3, 4, '#fff');
  dyn.push(t => { for (let i = 0; i < 3; i++) R(bx + 40 + Math.sin(t * 2 + i) * 1.5, Y0 - 12 - ((t * 6 + i * 4) % 10), 1, 1, '#ddd'); });
  R(bx + 38, Y0 - 5, 4, 3, '#fff'); shelf(bx + 70, Y0, 26, 30); lamp(bx + 108, Y0); glow(bx + 108, Y0 - 12, 22, '#ffcf6b', .08); R(bx + 120, Y0 - 8, 6, 8, '#6b3d17'); R(bx + 119, Y0 - 14, 8, 6, '#3fae5a');
  ch(bx - 20, gy, { act: 'walk', rg: 12, acc: 'umb', lc: '#e63946', top: '#444', e: 'star' });
  dyn.push(t => { for (let k = 0; k < 8; k++) if (Math.sin(t * 2 + k * 2) > 0) R((k * 53 + t * 3) % W, gy - 8 - k * 3, 1, 1, '#d8ff7a'); for (let k = 0; k < 90; k++) { const y = (t * 60 + k * 29) % H, x0 = (k * 37) % W; R(x0 - y * .2, y, 1, 3, 'rgba(160,190,255,.5)'); } });
};

SCN.clippods = () => {
  sky('#ffd89b', '#fff3d6', '#ffffff'); R(W - 36, 14, 12, 12, '#fff6c8'); hills('#f0b97a', 26, 8, .04, 2); hills('#e89b6a', 14, 6, .07, 4); ground('#8bd36b', '#c58a5a', '#9a6a40'); forest('#4cae5a');
  house(bx, gy - 80, BW, 80, { w: '#f3ead6', w2: '#e2d3b0', b: '#7a1f1f', f: [38], r: '#e02b2b', r2: '#ffffff', rh: 22 });
  [14, 34, 54].forEach(x => scr(bx + x, gy - 72, 16, 10, ['#e02b2b', '#4fa3ff', '#ffd84d', '#4cc38a'], 1.2)); R(bx + 104, gy - 74, 22, 9, '#e02b2b'); dyn.push(t => text('REC', bx + 108, gy - 73, Math.floor(t) % 2 ? '#fff' : '#ffb3b3'));
  R(bx + 40, Y1 - 8, 50, 3, '#7a4a24'); R(bx + 44, Y1 - 5, 2, 5, '#5a3416'); R(bx + 84, Y1 - 5, 2, 5, '#5a3416'); R(bx + 60, Y1 - 14, 1, 6, '#333'); R(bx + 58, Y1 - 15, 5, 2, '#222'); R(bx + 70, Y1 - 14, 1, 6, '#333'); R(bx + 68, Y1 - 15, 5, 2, '#222');
  ch(bx + 46, Y1, { act: 'talk', sit: 1, acc: 'hp', top: '#e02b2b', e: 'note' }); ch(bx + 84, Y1, { act: 'talk', sit: 1, dir: -1, acc: 'hp', top: '#17131f', e: 'star' }); camera(bx + 118, Y1);
  desk(bx + 14, Y0, 34); mon(bx + 17, Y0 - 5, ['#e02b2b', '#4fa3ff', '#fff']); scr(bx + 29, Y0 - 17, 12, 5, ['#222', '#4cc38a', '#222', '#ffd84d'], 3); ch(bx + 44, Y0, { act: 'type', sit: 1, dir: -1, top: '#4cc38a', acc: 'hp' });
  sofa(bx + 78, Y0, '#6b3d17'); ch(bx + 90, Y0, { sit: 1, act: 'wave', top: '#ffd84d', e: 'star' }); R(bx + 118, Y0 - 8, 6, 8, '#6b3d17'); R(bx + 117, Y0 - 14, 8, 6, '#3fae5a');
  ch(bx - 16, gy, { act: 'walk', rg: 10, top: '#e02b2b', e: 'heart' }); ch(bx + BW + 16, gy, { act: 'walk', rg: 10, top: '#4fa3ff', e: 'note' });
};
SCN['globall-id'] = SCN.globall; SCN['ketahui-id'] = SCN.ketahui; SCN['clippods-id'] = SCN.clippods;

function build() {
  const vw = innerWidth, vh = innerHeight;
  s = Math.max(2, Math.min(Math.round(vh / 140), Math.floor(vw / BW))); W = Math.ceil(vw / s); H = Math.ceil(vh / s);
  cv.width = bgc.width = W; cv.height = bgc.height = H; cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
  gy = H - 26; Y1 = gy - 42; Y0 = gy - 2; bx = Math.round((W - BW) / 2);
  chars = []; dyn = []; fg = []; pops = []; seed = 7; c = BX; X.imageSmoothingEnabled = BX.imageSmoothingEnabled = false;
  (SCN[SC] || SCN.popthusiast)();
}
function frame(ms) {
  requestAnimationFrame(frame); if (document.hidden) return;
  T = ms / 1000; X.drawImage(bgc, 0, 0); c = X;
  dyn.forEach(f => f(T)); chars.forEach(drawCh); fg.forEach(f => f(T));
  pops = pops.filter(q => (q.t += .03) < 1); pops.forEach(q => ico(q.e, q.x - 2, q.y - q.t * 14, IK[q.e]));
}
addEventListener('click', e => {
  if (e.target.closest && e.target.closest('a,button,input,textarea,video,img,h1,h2,h3,p,.ap-sample')) return;
  const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) / s, my = (e.clientY - r.top) / s;
  chars.forEach(p => { if (Math.abs(mx - p.cx) < 7 && my < p.cy + 2 && my > p.cy - 19) { p.hop = 1; pops.push({ x: p.cx, y: p.cy - 20, t: 0, e: p.e }); } });
});
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 150); });
build(); requestAnimationFrame(frame);
})();
