(function(){
  'use strict';

  var slides = document.querySelectorAll('.vt-slider-slide');
  var dots = document.querySelectorAll('.vt-slider-dot');
  var prev = document.querySelector('.vt-slider-prev');
  var next = document.querySelector('.vt-slider-next');

  if(!slides.length) return;

  var current = 0;
  var total = slides.length;
  var interval = 7000;
  var timer;
  var animating = false;

  // Split titles into chars on init
  slides.forEach(function(slide){
    var title = slide.querySelector('.vt-slider-title');
    if(title){
      var text = title.textContent.trim();
      title.innerHTML = '';
      text.split('').forEach(function(ch, i){
        var span = document.createElement('span');
        span.className = 'vt-char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = (i * 0.04) + 's';
        title.appendChild(span);
      });
    }
  });

  function goTo(idx){
    if(animating || idx === current) return;
    animating = true;

    var oldSlide = slides[current];
    var newIdx = (idx + total) % total;
    var newSlide = slides[newIdx];

    // Old slide leaves
    oldSlide.classList.remove('active');
    oldSlide.classList.add('leaving');

    // Reset new slide chars
    var chars = newSlide.querySelectorAll('.vt-char');
    chars.forEach(function(c){ c.classList.remove('vt-char-in'); });

    // New slide enters
    newSlide.classList.add('active');
    dots[current].classList.remove('active');
    dots[newIdx].classList.add('active');

    // Trigger char animation after clip reveals
    setTimeout(function(){
      chars.forEach(function(c){ c.classList.add('vt-char-in'); });
    }, 600);

    // Clean up old
    setTimeout(function(){
      oldSlide.classList.remove('leaving');
      animating = false;
    }, 1500);

    current = newIdx;
    resetTimer();
  }

  function nextSlide(){ goTo((current + 1) % total); }
  function prevSlide(){ goTo((current - 1 + total) % total); }

  function resetTimer(){
    clearInterval(timer);
    timer = setInterval(nextSlide, interval);
  }

  // Initial char animation
  setTimeout(function(){
    var chars = slides[0].querySelectorAll('.vt-char');
    chars.forEach(function(c){ c.classList.add('vt-char-in'); });
  }, 500);

  // Events
  if(next) next.addEventListener('click', nextSlide);
  if(prev) prev.addEventListener('click', prevSlide);

  dots.forEach(function(dot, i){
    dot.addEventListener('click', function(){ goTo(i); });
  });

  // Touch swipe
  var startX = 0;
  var slider = document.querySelector('.vt-slider');

  slider.addEventListener('touchstart', function(e){
    startX = e.touches[0].clientX;
  }, {passive: true});

  slider.addEventListener('touchend', function(e){
    var diff = startX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 50){
      diff > 0 ? nextSlide() : prevSlide();
    }
  }, {passive: true});

  // Auto play
  timer = setInterval(nextSlide, interval);

})();
