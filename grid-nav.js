/* ============================================================
   2D Grid Navigation – inter-page navigation logic
   ============================================================ */

(function () {
  'use strict';

  /*
   *  Grid layout:
   *
   *   [ publications.html ] ← [ index.html ] → [ materials.html ]
   *                                    ↓
   *                            [ projects.html ]
   *
   *  Each page carries  data-grid-pos="center|left|right|bottom"
   *  on its <body> element.
   */

  var DESTINATIONS = {
    center: { left: 'publications.html', right: 'materials.html', down: 'projects.html' },
    left:   { right: 'index.html' },
    right:  { left:  'index.html' },
    bottom: { up:    'index.html' },
  };

  var ICONS = {
    left:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 5 5 12 12 19"/></svg>',
    right: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    down:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    up:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  };

  /* Label is based on the destination page, not the direction */
  var DEST_LABELS = {
    'publications.html': 'Zainteresowania / Badania',
    'materials.html':    'Materiały dydaktyczne',
    'projects.html':     'Projekty / Klinika',
    'index.html':        'Ekran główny',
  };

  function getPos() {
    return document.body.getAttribute('data-grid-pos') || 'center';
  }

  /* ── Build a single directional arrow ────────────────────── */
  function buildArrow(dir, href) {
    var a = document.createElement('a');
    a.href = href;
    a.className = 'grid-nav-arrow grid-nav-' + dir;
    var label = DEST_LABELS[href] || href;
    a.setAttribute('aria-label', label);

    var icon = document.createElement('span');
    icon.className = 'gna-icon';
    icon.innerHTML = ICONS[dir];

    var labelEl = document.createElement('span');
    labelEl.className = 'gna-label';
    labelEl.textContent = label;

    a.appendChild(icon);
    a.appendChild(labelEl);

    /* Slide-out transition on click */
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var target = a.href;

      /* Persist current position + direction so the destination
         page knows from which direction to slide in            */
      try {
        sessionStorage.setItem('gn-from-pos', getPos());
        sessionStorage.setItem('gn-from-dir', dir);
      } catch (_) {}

      /* Slide out – current page exits in the direction of travel */
      var tx = { left: '80px', right: '-80px', up: '0', down: '0' };
      var ty = { left: '0', right: '0', up: '80px', down: '-80px' };
      document.body.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      document.body.style.opacity    = '0';
      document.body.style.transform  =
        'translate(' + (tx[dir] || '0') + ', ' + (ty[dir] || '0') + ')';

      setTimeout(function () { window.location.href = target; }, 290);
    });

    return a;
  }

  /* ── Build mini-map ──────────────────────────────────────── */
  function buildMinimap(pos, dests) {
    /*  Row 0:  [left] [center] [right]
        Row 1:  [    ] [bottom] [     ]   */
    var cells = [
      { key: 'left',   row: 0, col: 0 },
      { key: 'center', row: 0, col: 1 },
      { key: 'right',  row: 0, col: 2 },
      { key: 'empty1', row: 1, col: 0 },
      { key: 'bottom', row: 1, col: 1 },
      { key: 'empty2', row: 1, col: 2 },
    ];

    var map = document.createElement('div');
    map.className = 'grid-minimap';
    map.setAttribute('aria-hidden', 'true');
    map.setAttribute('title', 'Nawigacja 2D');

    cells.forEach(function (c) {
      var cell = document.createElement('div');
      cell.className = 'grid-minimap-cell';

      if (c.key === pos) {
        cell.classList.add('gm-active');
      } else if (c.key.startsWith('empty')) {
        cell.classList.add('gm-inactive');
      } else {
        /* Available if any dest maps to this cell's position */
        var isAvailable = Object.values(dests).some(function (href) {
          return (
            (c.key === 'left'   && href.startsWith('publications')) ||
            (c.key === 'right'  && href.startsWith('materials'))    ||
            (c.key === 'bottom' && href.startsWith('projects'))     ||
            (c.key === 'center' && href.startsWith('index'))
          );
        });
        if (isAvailable) {
          cell.classList.add('gm-available');
        } else {
          cell.classList.add('gm-inactive');
        }
      }

      map.appendChild(cell);
    });

    return map;
  }

  /* ── Slide-in on page load ───────────────────────────────── */
  function applySlidein() {
    var fromPos, fromDir;
    try {
      fromPos = sessionStorage.getItem('gn-from-pos');
      fromDir = sessionStorage.getItem('gn-from-dir');
      sessionStorage.removeItem('gn-from-pos');
      sessionStorage.removeItem('gn-from-dir');
    } catch (_) {}

    var startTransform = null;
    if (fromDir) {
      var tx = { left: '-80px', right: '80px', up: '0', down: '0' };
      var ty = { left: '0', right: '0', up: '-80px', down: '80px' };
      startTransform =
        'translate(' + (tx[fromDir] || '0') + ', ' + (ty[fromDir] || '0') + ')';
    }

    document.body.style.opacity   = '0';
    if (startTransform) { document.body.style.transform = startTransform; }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        document.body.style.opacity    = '1';
        document.body.style.transform  = 'none';
      });
    });
  }

  /* ── Mouse-edge navigation ───────────────────────────────── */
  function addMouseEdge(dests) {
    var EDGE_PX    = 4;   /* px from viewport edge to trigger countdown */
    var NEAR_PX    = 60;  /* px from edge to highlight the arrow        */
    var EDGE_DELAY = 900; /* ms to hold at edge before navigating       */
    var edgeTimer  = null;

    /* Track current highlight to avoid unnecessary DOM writes */
    var curDir   = null; /* direction of currently highlighted arrow  */
    var curState = null; /* 'near' | 'active'                         */

    function getArrow(dir) {
      return document.querySelector('.grid-nav-' + dir);
    }

    function applyHighlight(dir, state) {
      if (dir === curDir && state === curState) { return; }
      if (curDir) {
        var prev = getArrow(curDir);
        if (prev) { prev.classList.remove('gna-edge-near', 'gna-edge-active'); }
      }
      curDir   = dir;
      curState = state;
      if (dir) {
        var next = getArrow(dir);
        if (next) { next.classList.add(state === 'active' ? 'gna-edge-active' : 'gna-edge-near'); }
      }
    }

    document.addEventListener('mousemove', function (e) {
      clearTimeout(edgeTimer);

      var w = window.innerWidth;
      var h = window.innerHeight;
      var x = e.clientX;
      var y = e.clientY;

      var atDir   = null;
      var nearDir = null;

      if      (x <= EDGE_PX       && dests.left)  { atDir   = 'left';  }
      else if (x >= w - EDGE_PX   && dests.right) { atDir   = 'right'; }
      else if (y >= h - EDGE_PX   && dests.down)  { atDir   = 'down';  }
      else if (y <= EDGE_PX       && dests.up)    { atDir   = 'up';    }
      else if (x <= NEAR_PX       && dests.left)  { nearDir = 'left';  }
      else if (x >= w - NEAR_PX   && dests.right) { nearDir = 'right'; }
      else if (y >= h - NEAR_PX   && dests.down)  { nearDir = 'down';  }
      else if (y <= NEAR_PX       && dests.up)    { nearDir = 'up';    }

      applyHighlight(atDir || nearDir || null, atDir ? 'active' : 'near');

      if (atDir) {
        edgeTimer = setTimeout(function () {
          var a = getArrow(atDir);
          if (a) { a.click(); }
        }, EDGE_DELAY);
      }
    });

    document.addEventListener('mouseleave', function () {
      clearTimeout(edgeTimer);
      applyHighlight(null, null);
    });
  }

  /* ── Touch-swipe navigation ──────────────────────────────── */
  function addSwipe(dests) {
    var MIN_DIST = 60; /* minimum swipe distance in px */
    var startX = null;
    var startY = null;

    document.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (startX === null || startY === null) { return; }

      var dx  = e.changedTouches[0].clientX - startX;
      var dy  = e.changedTouches[0].clientY - startY;
      var adx = Math.abs(dx);
      var ady = Math.abs(dy);

      startX = startY = null;

      if (Math.max(adx, ady) < MIN_DIST) { return; }

      /* Swipe left  → right page; swipe right → left page
         Swipe up    → down page;  swipe down  → up page   */
      var dir;
      if (adx > ady) {
        dir = dx < 0 ? 'right' : 'left';
      } else {
        dir = dy < 0 ? 'down' : 'up';
      }

      if (dests[dir]) {
        var arrow = document.querySelector('.grid-nav-' + dir);
        if (arrow) { arrow.click(); }
      }
    }, { passive: true });
  }

  /* ── Init ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var pos   = getPos();
    var dests = DESTINATIONS[pos];
    if (!dests) { return; }

    /* Apply slide-in */
    applySlidein();

    /* Add directional arrows */
    Object.keys(dests).forEach(function (dir) {
      document.body.appendChild(buildArrow(dir, dests[dir]));
    });

    /* Add mini-map */
    document.body.appendChild(buildMinimap(pos, dests));

    /* Mouse-edge and touch-swipe support */
    addMouseEdge(dests);
    addSwipe(dests);
  });

}());
