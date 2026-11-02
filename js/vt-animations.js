/*  Vantage Ofis - Animations & Effects  */

(function(){
  'use strict';

  /* ── Counter Animation ── */
  function animateCounter(el){
    if(el.dataset.animated) return;
    el.dataset.animated = '1';

    var finalText = el.dataset.final || el.textContent.trim();
    var target = parseFloat(el.dataset.count);
    var isDecimal = finalText.indexOf(',') > -1 || finalText.indexOf('.') > -1 && target < 100;
    var duration = 2200;
    var startTime = null;

    el.textContent = '0';

    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // easeOutExpo for dramatic slowdown
      var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      var current = ease * target;

      if(isDecimal){
        el.textContent = current.toFixed(2).replace('.', ',');
      } else {
        el.textContent = Math.floor(current).toLocaleString('tr-TR');
      }

      if(progress < 1){
        requestAnimationFrame(step);
      } else {
        el.textContent = finalText;
      }
    }
    requestAnimationFrame(step);
  }

  /* ── Scroll Reveal ── */
  function revealOnScroll(){
    var els = document.querySelectorAll('.vt-reveal');
    els.forEach(function(el){
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.85;
      if(inView && !el.classList.contains('vt-revealed')){
        el.classList.add('vt-revealed');
      }
    });

    // Counter trigger
    var counters = document.querySelectorAll('.vt-stat-num[data-count]');
    counters.forEach(function(el){
      var rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight * 0.9){
        animateCounter(el);
      }
    });
  }

  /* ── Magnetic Hover on Buttons ── */
  function initMagneticButtons(){
    var btns = document.querySelectorAll('.btn');
    btns.forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + x * 0.15 + 'px,' + y * 0.15 + 'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = 'translate(0,0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
      });
      btn.addEventListener('mouseenter', function(){
        btn.style.transition = 'transform 0.1s ease';
      });
    });
  }

  /* ── Tilt (devre dışı - performans) ── */

  /* ── Parallax (devre dışı - stellar.js kullanılıyor) ── */

  /* ── Text Shimmer on Section Titles ── */
  function initTextShimmer(){
    var titles = document.querySelectorAll('.vt-title, .vt-showcase-title, .section-title');
    titles.forEach(function(t){
      t.classList.add('vt-shimmer');
    });
  }

  /* ── Stagger Reveal for Stats ── */
  function initStaggerReveal(){
    var stats = document.querySelectorAll('.vt-stat');
    stats.forEach(function(stat, i){
      stat.classList.add('vt-reveal');
      stat.style.transitionDelay = (i * 0.15) + 's';
    });

    // Split sections
    var splits = document.querySelectorAll('.vt-split');
    splits.forEach(function(s){
      var text = s.querySelector('.vt-split-text');
      var img = s.querySelector('.vt-split-img');
      if(text) text.classList.add('vt-reveal');
      if(img) img.classList.add('vt-reveal', 'vt-reveal--right');
    });

    // Regular blocks
    var blocks = document.querySelectorAll('.vt-block .vt-title, .vt-block .vt-text, .vt-block .row > div');
    blocks.forEach(function(b, i){
      b.classList.add('vt-reveal');
      b.style.transitionDelay = (i * 0.08) + 's';
    });

    // Gallery items
    var gallery = document.querySelectorAll('.vt-gallery-item');
    gallery.forEach(function(g, i){
      g.classList.add('vt-reveal');
      g.style.transitionDelay = (i * 0.2) + 's';
    });

    // Footer columns
    var footCols = document.querySelectorAll('.footer > .container > .row > div');
    footCols.forEach(function(c, i){
      c.classList.add('vt-reveal');
      c.style.transitionDelay = (i * 0.1) + 's';
    });

    // About section columns
    var aboutCols = document.querySelectorAll('.about .col-about-info, .section-content .col-md-7, .section-content .col-md-5');
    aboutCols.forEach(function(c){
      c.classList.add('vt-reveal');
    });

    // Contact form
    var formEls = document.querySelectorAll('.contacts .form-group, .vt-kvkk-label');
    formEls.forEach(function(f, i){
      f.classList.add('vt-reveal');
      f.style.transitionDelay = (i * 0.05) + 's';
    });
  }

  /* ── Cursor Glow (devre dışı) ── */

  /* ── Nav Menu Hover Underline ── */
  function initNavHover(){
    var links = document.querySelectorAll('.navbar-desctop-menu li a');
    links.forEach(function(a){
      a.classList.add('vt-nav-link');
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function(){
    initStaggerReveal();
    initMagneticButtons();
    // initTiltEffect(); // devre dışı
    initTextShimmer();
    // initCursorGlow(); // devre dışı
    initNavHover();

    window.addEventListener('scroll', revealOnScroll, {passive: true});
    revealOnScroll(); // initial check
  });

})();
