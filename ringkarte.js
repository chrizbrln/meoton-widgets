/* Meoton Ringkarte – Inline-Karte für Outlets im Claude-Chat.
   Aufruf: Ringkarte(element, daten, mitte)
   daten: [["Outlet","PLZ Ort",lat,lon], ...]
   mitte: null (Median der Outlets) oder ["Name",lat,lon] */
(function () {
  function Ringkarte(root, D, M) {
    M = M || null;
    root.innerHTML =
      '<div style="display:flex;gap:8px;align-items:center;margin:0 0 10px;font-size:13px;color:var(--text-secondary)">' +
      '<button data-k="A">Alle</button><button data-k="N">Nahbereich</button>' +
      '<span data-k="info" style="margin-left:auto;text-align:right"></span></div>' +
      '<div style="position:relative"><svg viewBox="0 0 680 520" style="width:100%;height:auto;display:block;background:var(--surface-1);border-radius:12px"></svg>' +
      '<div data-k="tip" style="position:absolute;pointer-events:none;display:none;background:var(--surface-3);border:0.5px solid var(--border-strong);border-radius:var(--radius);padding:6px 10px;font-size:13px;color:var(--text-primary);white-space:nowrap"></div></div>';
    var q = function (k) { return root.querySelector('[data-k="' + k + '"]'); };
    var svg = root.querySelector('svg'), tip = q('tip'), info = q('info');
    var NS = 'http://www.w3.org/2000/svg', W = 680, H = 520, cx = W / 2, cy = H / 2, RP = 228;
    if (!D || !D.length) { info.textContent = 'Keine Outlets'; return; }
    var med = function (a) { a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
    var la0 = M ? M[1] : med(D.map(function (d) { return d[2]; }));
    var lo0 = M ? M[2] : med(D.map(function (d) { return d[3]; }));
    var k = Math.cos(la0 * Math.PI / 180), mitte = M ? M[0] : 'Mitte der Outlets';
    var P = D.map(function (d) {
      var x = (d[3] - lo0) * 111.32 * k, y = (d[2] - la0) * 110.57;
      return { n: d[0], o: d[1], ort: String(d[1]).replace(/^\d+\s*/, ''), x: x, y: y, d: Math.hypot(x, y) };
    });
    var ds = P.map(function (p) { return p.d; }).sort(function (a, b) { return a - b; });
    var RA = Math.max(ds[ds.length - 1], 0.2), RN = Math.max(ds[Math.floor((ds.length - 1) * 0.7)], 0.2);
    var km = function (v) { return v < 1 ? Math.round(v * 1000) + ' m' : v.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' km'; };
    var halo = 'paint-order:stroke;stroke:var(--surface-1);stroke-width:3px;stroke-linejoin:round;';
    function el(t, a, txt) { var e = document.createElementNS(NS, t); for (var i in a) e.setAttribute(i, a[i]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; }
    function draw(R) {
      svg.innerHTML = ''; tip.style.display = 'none';
      var s = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500].find(function (v) { return R / v <= 5; }) || 500;
      var n = Math.max(1, Math.ceil(R / s - 1e-9)), Ro = n * s, f = RP / Ro, B = [];
      var hit = function (b) { return b[0] < 2 || b[1] < 2 || b[2] > W - 2 || b[3] > H - 2 || B.some(function (c) { return b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]; }); };
      function label(txt, b, style, force) {
        var t = el('text', { 'class': 'ts', style: halo + style }, txt), w = t.getComputedTextLength(), xm = (b[0] + b[2]) / 2, ym = (b[1] + b[3]) / 2 + 4;
        var c = [[b[2] + 4, ym, 'start', b[2] + 4], [b[0] - 4, ym, 'end', b[0] - 4 - w], [xm, b[1] - 5, 'middle', xm - w / 2], [xm, b[3] + 14, 'middle', xm - w / 2]]
          .map(function (q) { return q.concat([[q[3] - 2, q[1] - 11, q[3] + w + 2, q[1] + 4]]); });
        var p = c.find(function (q) { return !hit(q[4]); }) || (force && c[0]);
        if (!p) { t.remove(); return; }
        B.push(p[4]); t.setAttribute('x', p[0]); t.setAttribute('y', p[1]); t.setAttribute('text-anchor', p[2]);
      }
      var i, r;
      for (i = 1; i <= n; i++) { r = i * s * f; el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'var(--text-muted)', 'stroke-opacity': 0.5, 'stroke-dasharray': '5 4' }); }
      B.push([cx - 7, cy - 7, cx + 7, cy + 7]);
      var V = P.filter(function (p) { return p.d <= Ro + 1e-9; }).map(function (p) { return Object.assign({}, p, { X: cx + p.x * f, Y: cy - p.y * f }); });
      V.forEach(function (p) { B.push([p.X - 6, p.Y - 6, p.X + 6, p.Y + 6]); });
      V.forEach(function (p) {
        var c = el('circle', { cx: p.X, cy: p.Y, r: 5.5, fill: '#1B7A8C', stroke: 'var(--surface-1)', 'stroke-width': 1.2 });
        c.style.cursor = 'pointer';
        var show = function () {
          var rc = svg.getBoundingClientRect(), sc = rc.width / W;
          tip.textContent = '';
          var b = document.createElement('b'); b.style.fontWeight = '500'; b.textContent = p.n;
          var u = document.createElement('span'); u.style.color = 'var(--text-secondary)'; u.textContent = p.o + ' · ' + km(p.d) + ' von: ' + mitte;
          tip.append(b, document.createElement('br'), u); tip.style.display = 'block';
          var l = p.X * sc + 12; if (l + tip.offsetWidth > rc.width) l = p.X * sc - 12 - tip.offsetWidth;
          tip.style.left = Math.max(0, l) + 'px'; tip.style.top = Math.max(0, p.Y * sc - 14) + 'px'; c.setAttribute('r', 7.5);
        };
        c.addEventListener('mouseenter', show); c.addEventListener('click', show);
        c.addEventListener('mouseleave', function () { tip.style.display = 'none'; c.setAttribute('r', 5.5); });
      });
      el('path', { d: 'M' + (cx - 9) + ' ' + cy + 'H' + (cx + 9) + 'M' + cx + ' ' + (cy - 9) + 'V' + (cy + 9), stroke: 'var(--text-primary)', 'stroke-width': 1.5, fill: 'none', 'pointer-events': 'none' });
      for (i = 1; i <= n; i++) { r = i * s * f; var x = cx + r * 0.766, y = cy + r * 0.643; label(km(i * s), [x + 2, y + 2, x + 2, y + 12], 'font-size:12px;fill:var(--text-secondary)', 1); }
      var G = {}; V.forEach(function (p) { (G[p.ort] = G[p.ort] || []).push(p); });
      var O = Object.entries(G).sort(function (a, b) { return b[1].length - a[1].length; });
      if (O.length > 1) O.slice(0, 5).forEach(function (e) {
        var a = e[1];
        label(e[0], [Math.min.apply(null, a.map(function (p) { return p.X; })) - 6, Math.min.apply(null, a.map(function (p) { return p.Y; })) - 6,
          Math.max.apply(null, a.map(function (p) { return p.X; })) + 6, Math.max.apply(null, a.map(function (p) { return p.Y; })) + 6],
          'font-size:12px;font-weight:500;fill:var(--text-secondary)');
      });
      V.forEach(function (p) { label(p.n.length > 28 ? p.n.slice(0, 27) + '…' : p.n, [p.X - 6, p.Y - 6, p.X + 6, p.Y + 6], 'font-size:11px;fill:var(--text-primary);pointer-events:none'); });
      info.textContent = V.length + ' von ' + P.length + (P.length == 1 ? ' Outlet' : ' Outlets') + ' · Ringe alle ' + km(s) + ' · Fadenkreuz: ' + mitte;
    }
    q('A').onclick = function () { draw(RA); };
    q('N').onclick = function () { draw(RN); };
    draw(RA);
  }
  window.Ringkarte = Ringkarte;
})();
