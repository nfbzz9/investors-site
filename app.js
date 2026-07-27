/* ============================================================
   Swiss Pet Accessories Portfolio: Business Plan & Projections
   Stability-first animation layer:
   - All content is readable without JS (fallbacks below)
   - IntersectionObserver drives every animation
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- Fallback: if anything fails, show everything ---------- */
  window.addEventListener('error', function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  });

  /* ---------- Scroll progress + nav state ---------- */
  var progressBar = document.getElementById('progressBar');
  var nav = document.getElementById('nav');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (progressBar) progressBar.style.width = pct + '%';
      if (nav) nav.classList.toggle('scrolled', h.scrollTop > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- Counters ---------- */
  function formatNumber(val, decimals, comma) {
    var s = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
    if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s;
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var comma = el.getAttribute('data-comma') === '1';

    if (prefersReduced) {
      el.textContent = prefix + formatNumber(target, decimals, comma) + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = prefix + formatNumber(target * eased, decimals, comma) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ============================================================
     SVG helpers
     ============================================================ */
  function svgText(x, y, str, fill, size, anchor, weight) {
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', anchor || 'middle');
    t.setAttribute('fill', fill);
    t.setAttribute('font-size', size);
    if (weight) t.setAttribute('font-weight', weight);
    t.setAttribute('font-family', "'JetBrains Mono',monospace");
    t.textContent = str;
    return t;
  }

  function animBar(rect) {
    if (prefersReduced) return;
    rect.style.transformBox = 'fill-box';
    rect.style.transformOrigin = 'bottom';
    rect.style.transform = 'scaleY(0.001)';
    rect.style.transition = 'transform 1.1s cubic-bezier(.22,1,.36,1)';
    rect.setAttribute('data-bar', '1');
  }

  function playBars(svg) {
    var i = 0;
    svg.querySelectorAll('[data-bar]').forEach(function (r) {
      r.style.transitionDelay = (i * 0.09) + 's';
      i++;
    });
    requestAnimationFrame(function () {
      svg.querySelectorAll('[data-bar]').forEach(function (r) {
        r.style.transform = 'scaleY(1)';
      });
      svg.querySelectorAll('[data-lbl]').forEach(function (t) {
        t.setAttribute('opacity', '1');
      });
    });
  }

  /* ============================================================
     Expected-case projection chart: revenue + net, years 1 to 5
     Figures exactly as in the source document (rounded to k)
     ============================================================ */
  var PROJ = {
    rev:    [88, 153, 217, 282, 347],   // CHF k
    net:    [21, 10, 38, 66, 94],       // CHF k
    margin: ['24%', '7%', '18%', '23%', '27%']
  };

  function buildProjChart() {
    var svg = document.getElementById('projChart');
    if (!svg) return;
    var W = 1000, H = 460;
    var padL = 74, padR = 24, padT = 56, padB = 66;
    var yMax = 400; // CHF k

    function Y(v) { return padT + (1 - v / yMax) * (H - padT - padB); }
    var groupW = (W - padL - padR) / 5;
    var barW = 54, gap = 10;

    var frag = document.createDocumentFragment();

    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML =
      '<linearGradient id="revGrad" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="rgba(139,139,255,.35)"/><stop offset="100%" stop-color="#8b8bff"/></linearGradient>' +
      '<linearGradient id="netGrad" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="rgba(94,234,212,.35)"/><stop offset="100%" stop-color="#5eead4"/></linearGradient>';
    frag.appendChild(defs);

    // estimate zone shading (years 4 and 5)
    var zone = document.createElementNS(NS, 'rect');
    zone.setAttribute('x', padL + groupW * 3); zone.setAttribute('y', padT - 26);
    zone.setAttribute('width', groupW * 2); zone.setAttribute('height', H - padT - padB + 26);
    zone.setAttribute('fill', 'rgba(251,191,36,.025)');
    frag.appendChild(zone);
    var zline = document.createElementNS(NS, 'line');
    zline.setAttribute('x1', padL + groupW * 3); zline.setAttribute('x2', padL + groupW * 3);
    zline.setAttribute('y1', padT - 26); zline.setAttribute('y2', H - padB);
    zline.setAttribute('stroke', 'rgba(251,191,36,.3)');
    zline.setAttribute('stroke-dasharray', '4 5');
    frag.appendChild(zline);
    frag.appendChild(svgText(padL + groupW * 3 + 10, padT - 10, 'directional estimates', 'rgba(251,191,36,.65)', 10.5, 'start'));
    frag.appendChild(svgText(padL + groupW * 3 - 10, padT - 10, 'modelled from real costs', 'rgba(125,211,252,.65)', 10.5, 'end'));

    // gridlines
    [0, 100, 200, 300, 400].forEach(function (v) {
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', padL); line.setAttribute('x2', W - padR);
      line.setAttribute('y1', Y(v)); line.setAttribute('y2', Y(v));
      line.setAttribute('stroke', v === 0 ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.06)');
      frag.appendChild(line);
      frag.appendChild(svgText(padL - 12, Y(v) + 4, v + 'k', 'rgba(245,245,247,.38)', 11, 'end'));
    });

    for (var i = 0; i < 5; i++) {
      var cx = padL + groupW * i + groupW / 2;
      var xRev = cx - barW - gap / 2;
      var xNet = cx + gap / 2;

      var rRev = document.createElementNS(NS, 'rect');
      rRev.setAttribute('x', xRev); rRev.setAttribute('y', Y(PROJ.rev[i]));
      rRev.setAttribute('width', barW); rRev.setAttribute('height', Y(0) - Y(PROJ.rev[i]));
      rRev.setAttribute('rx', '7');
      rRev.setAttribute('fill', 'url(#revGrad)');
      animBar(rRev);
      frag.appendChild(rRev);

      var rNet = document.createElementNS(NS, 'rect');
      rNet.setAttribute('x', xNet); rNet.setAttribute('y', Y(PROJ.net[i]));
      rNet.setAttribute('width', barW); rNet.setAttribute('height', Y(0) - Y(PROJ.net[i]));
      rNet.setAttribute('rx', '7');
      rNet.setAttribute('fill', 'url(#netGrad)');
      animBar(rNet);
      frag.appendChild(rNet);

      var lRev = svgText(xRev + barW / 2, Y(PROJ.rev[i]) - 10, PROJ.rev[i] + 'k', '#c7c7ff', 12, 'middle', '600');
      lRev.setAttribute('opacity', prefersReduced ? '1' : '0');
      lRev.setAttribute('data-lbl', '1');
      lRev.style.transition = 'opacity .7s ease ' + (0.7 + i * 0.12) + 's';
      frag.appendChild(lRev);

      var lNet = svgText(xNet + barW / 2, Y(PROJ.net[i]) - 10, '+' + PROJ.net[i] + 'k', '#5eead4', 12, 'middle', '600');
      lNet.setAttribute('opacity', prefersReduced ? '1' : '0');
      lNet.setAttribute('data-lbl', '1');
      lNet.style.transition = 'opacity .7s ease ' + (0.85 + i * 0.12) + 's';
      frag.appendChild(lNet);

      frag.appendChild(svgText(cx, H - 38, 'Y' + (i + 1), 'rgba(245,245,247,.55)', 12.5, 'middle', '600'));
      frag.appendChild(svgText(cx, H - 18, PROJ.margin[i] + ' net', 'rgba(245,245,247,.35)', 10.5, 'middle'));
    }

    svg.appendChild(frag);
  }

  /* ---------- Generic width-bar players ---------- */
  function playHBars(panel) {
    panel.querySelectorAll('.b-row').forEach(function (row) {
      var v = parseFloat(row.getAttribute('data-val')) || 0;
      var max = parseFloat(row.getAttribute('data-max')) || 100;
      var bar = row.querySelector('.b-bar');
      if (bar) bar.style.width = (v / max * 100) + '%';
    });
  }

  function playFundsBar(panel) {
    panel.querySelectorAll('.fb-seg').forEach(function (seg) {
      seg.style.width = seg.getAttribute('data-w') + '%';
    });
  }

  /* ---------- Master IntersectionObserver ---------- */
  function initObserver() {
    var handlers = [
      { sel: '#ceilingChart', fn: playHBars },
      { sel: '#compBudgetChart', fn: playHBars },
      { sel: '#distChart', fn: playHBars },
      { sel: '#channelChart', fn: playHBars },
      { sel: '#fundsBar', fn: playFundsBar },
      { sel: '#fundsBar2', fn: playFundsBar },
      { sel: '#projChart', fn: playBars },
      { sel: '.timeline', fn: function (el) { el.classList.add('in'); } }
    ];

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      document.querySelectorAll('.count').forEach(animateCounter);
      handlers.forEach(function (h) {
        document.querySelectorAll(h.sel).forEach(h.fn);
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        obs.unobserve(el);

        if (el.classList.contains('reveal')) el.classList.add('in');

        el.querySelectorAll('.count:not([data-done])').forEach(function (c) {
          c.setAttribute('data-done', '1');
          animateCounter(c);
        });
        if (el.classList.contains('count') && !el.hasAttribute('data-done')) {
          el.setAttribute('data-done', '1');
          animateCounter(el);
        }

        handlers.forEach(function (h) {
          if (el.matches && el.matches(h.sel)) {
            if (!el._played) { el._played = true; h.fn(el); }
          }
          el.querySelectorAll(h.sel).forEach(function (child) {
            if (!child._played) { child._played = true; h.fn(child); }
          });
        });
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
    ['#ceilingChart', '#compBudgetChart', '#distChart', '#channelChart', '#fundsBar', '#fundsBar2', '#projChart', '.timeline', '#thresholdViz'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { obs.observe(el); });
    });
  }

  /* ---------- Card cursor glow ---------- */
  function initCardGlow() {
    if (prefersReduced) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  /* ---------- Subtle hero parallax ---------- */
  function initParallax() {
    if (prefersReduced) return;
    var mesh = document.querySelector('.mesh');
    if (!mesh) return;
    var pTick = false;
    window.addEventListener('scroll', function () {
      if (pTick) return;
      pTick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.3) {
          mesh.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        }
        pTick = false;
      });
    }, { passive: true });
  }

  /* ---------- boot ---------- */
  function boot() {
    buildProjChart();
    initObserver();
    initCardGlow();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Ultimate stability net: after 2.5s, force-show anything still hidden above the fold */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }, 2500);
})();
