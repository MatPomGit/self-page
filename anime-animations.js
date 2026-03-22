/* ============================================================
   Anime.js Animations – additional page effects
   Uses anime.js v4 ES module
   https://animejs.com/documentation/getting-started/module-imports
   ============================================================ */

import { animate, stagger, spring } from './anime.esm.min.js';

(function () {
  'use strict';

  /* Respect prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  /* ── 1. Navigation links stagger entrance ─────────────── */
  /* Set initial state before DOMContentLoaded fires         */
  document.querySelectorAll('.nav-links li').forEach(function (li) {
    li.style.opacity = '0';
  });

  document.addEventListener('DOMContentLoaded', function () {

    animate('.nav-links li', {
      opacity:    [0, 1],
      translateY: [-14, 0],
      delay:      stagger(70, { start: 400 }),
      duration:   500,
      ease:       'easeOutCubic',
    });

    /* ── 2. Hero tags individual stagger ─────────────────── */
    /* The parent .hero-tags uses CSS fade-in for the block.
       We take over: make the container immediately visible
       and stagger each .tag individually with a spring.      */
    var tagsWrap = document.querySelector('.hero-tags');
    if (tagsWrap) {
      tagsWrap.classList.remove('fade-in');
      tagsWrap.style.opacity   = '1';
      tagsWrap.style.transform = 'none';

      var tagEls = tagsWrap.querySelectorAll('.tag');
      tagEls.forEach(function (t) {
        t.style.opacity   = '0';
        t.style.transform = 'translateY(12px) scale(0.88)';
      });

      animate(tagEls, {
        opacity:    [0, 1],
        translateY: [12, 0],
        scale:      [0.88, 1],
        delay:      stagger(65, { start: 680 }),
        duration:   600,
        ease:       spring({ stiffness: 90, damping: 14, mass: 1 }),
      });
    }

    /* ── 3. Hero CTA pulsing glow + click ripple ─────────── */
    var ctaBtn = document.querySelector('.hero-cta');
    if (ctaBtn) {
      /* Infinite glow pulse – fade in then back out, repeat  */
      animate(ctaBtn, {
        boxShadow: '0 4px 30px rgba(6,182,212,0.6)',
        alternate: true,
        loop:      true,
        duration:  1400,
        ease:      'easeInOutSine',
      });

      /* Click ripple */
      ctaBtn.addEventListener('click', function (e) {
        var ripple = document.createElement('span');
        var rect   = ctaBtn.getBoundingClientRect();
        var size   = Math.max(rect.width, rect.height) * 2;
        ripple.className = 'aa-ripple';
        ripple.style.width  = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left   = (e.clientX - rect.left  - size / 2) + 'px';
        ripple.style.top    = (e.clientY - rect.top   - size / 2) + 'px';
        ctaBtn.appendChild(ripple);

        animate(ripple, {
          scale:      [0, 1],
          opacity:    [0.6, 0],
          duration:   620,
          ease:       'easeOutCubic',
          onComplete: function () { ripple.remove(); },
        });
      });
    }

  }); /* end DOMContentLoaded */

  /* ── 4. Research list items stagger on scroll ─────────── */
  var researchObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      var items = e.target.querySelectorAll('.research-list li');
      if (!items.length) { return; }

      /* Wait briefly so the parent column's CSS fade-in has fired */
      setTimeout(function () {
        animate(items, {
          opacity:    [0, 1],
          translateX: [-20, 0],
          delay:      stagger(75, { start: 80 }),
          duration:   500,
          ease:       'easeOutCubic',
        });
      }, 220);

      researchObserver.unobserve(e.target);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.research-col').forEach(function (col) {
    /* Pre-hide list items so they animate in */
    col.querySelectorAll('.research-list li').forEach(function (li) {
      li.style.opacity   = '0';
      li.style.transform = 'translateX(-20px)';
    });
    researchObserver.observe(col);
  });

  /* ── 5. Material card 3-D tilt on hover ───────────────── */
  /* Mirrors the behaviour that scroll-animations.js provides
     for .interest-card / .project-card / .clinical-card.     */
  document.querySelectorAll('.material-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
    });

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var dx   = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      var dy   = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      card.style.transform =
        'perspective(600px) ' +
        'rotateY(' + (dx * 7).toFixed(1) + 'deg) ' +
        'rotateX(' + (-dy * 5).toFixed(1) + 'deg) ' +
        'translateY(-4px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = '';
    });
  });

  /* ── 6. Floating SVG icon on card hover ──────────────── */
  [
    { sel: '.interest-card',  iconSel: '.int-icon'      },
    { sel: '.clinical-card',  iconSel: '.clinical-icon' },
    { sel: '.material-card',  iconSel: '.material-icon' },
  ].forEach(function (cfg) {
    document.querySelectorAll(cfg.sel).forEach(function (card) {
      var icon = card.querySelector(cfg.iconSel);
      if (!icon) { return; }

      var floatAnim = null;

      card.addEventListener('mouseenter', function () {
        if (floatAnim) { floatAnim.pause(); }
        floatAnim = animate(icon, {
          translateY: -5,
          alternate:  true,
          loop:       true,
          duration:   900,
          ease:       'easeInOutSine',
        });
      });

      card.addEventListener('mouseleave', function () {
        if (floatAnim) { floatAnim.pause(); floatAnim = null; }
        animate(icon, {
          translateY: 0,
          duration:   300,
          ease:       'easeOutCubic',
        });
      });
    });
  });

}());
