(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. Custom Cursor
  // =========================================================================
  function initCustomCursor() {
    var isDesktop = window.matchMedia('(min-width: 769px)').matches;
    if (!isDesktop) return;

    // Create cursor elements
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    // Hide default cursor
    document.body.classList.add('custom-cursor-active');

    var mouseX = -100;
    var mouseY = -100;
    var ringX = -100;
    var ringY = -100;
    var speed = 0.15;

    var interactiveSelectors = 'a, button, .archive-card, .past-event-card, .hero-card, .about-member';
    var zoomSelectors = 'img, .photo-item';

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows immediately
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    // Lerp ring position via rAF
    function animateRing() {
      ringX += (mouseX - ringX) * speed;
      ringY += (mouseY - ringY) * speed;

      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    // Hover states
    document.addEventListener('mouseover', function (e) {
      var target = e.target;

      if (target.closest(interactiveSelectors)) {
        ring.classList.add('cursor-hover');
        dot.classList.add('cursor-hover');
      }

      if (target.closest(zoomSelectors)) {
        ring.classList.add('cursor-zoom');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target;

      if (target.closest(interactiveSelectors)) {
        ring.classList.remove('cursor-hover');
        dot.classList.remove('cursor-hover');
      }

      if (target.closest(zoomSelectors)) {
        ring.classList.remove('cursor-zoom');
      }
    });

    // Hide cursor when it leaves the window
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  // =========================================================================
  // 2. Tilt / Parallax on Cards
  // =========================================================================
  function initTiltCards() {
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    var cards = document.querySelectorAll('.tilt-card');

    cards.forEach(function (card) {
      card.style.perspective = '800px';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.1s ease-out';

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cardWidth = rect.width;
        var cardHeight = rect.height;

        // Position relative to card center, normalised to -1..1
        var x = ((e.clientX - rect.left) / cardWidth - 0.5) * 2;
        var y = ((e.clientY - rect.top) / cardHeight - 0.5) * 2;

        var maxAngle = 5;
        var rotateY = x * maxAngle;
        var rotateX = -y * maxAngle;

        card.style.transform =
          'perspective(800px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) translateZ(10px)';

        // Glare / shine overlay
        var glare = card.querySelector('.tilt-glare');
        if (!glare) {
          glare = document.createElement('div');
          glare.className = 'tilt-glare';
          glare.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;' +
            'pointer-events:none;border-radius:inherit;' +
            'background:linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%);' +
            'opacity:0;transition:opacity 0.2s ease;';
          card.style.position = card.style.position || 'relative';
          card.style.overflow = 'hidden';
          card.appendChild(glare);
        }

        // Position glare based on mouse
        var glareX = ((e.clientX - rect.left) / cardWidth) * 100;
        var glareY = ((e.clientY - rect.top) / cardHeight) * 100;
        glare.style.background =
          'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)';
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s ease-out';
        card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';

        var glare = card.querySelector('.tilt-glare');
        if (glare) {
          glare.style.opacity = '0';
        }

        // Reset fast transition for next move
        setTimeout(function () {
          card.style.transition = 'transform 0.1s ease-out';
        }, 500);
      });
    });
  }

  // =========================================================================
  // 3. Split Text Reveal
  // =========================================================================
  function initTextReveal() {
    var elements = document.querySelectorAll('.text-reveal');
    if (!elements.length) return;

    elements.forEach(function (el) {
      var text = el.textContent;
      var words = text.split(/\s+/).filter(function (w) { return w.length > 0; });

      el.innerHTML = '';

      words.forEach(function (word, i) {
        var wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.overflow = 'hidden';
        wordSpan.style.display = 'inline-block';

        var innerSpan = document.createElement('span');
        innerSpan.className = 'word-inner';
        innerSpan.style.display = 'inline-block';

        if (!prefersReducedMotion) {
          innerSpan.style.transform = 'translateY(100%)';
          innerSpan.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          innerSpan.style.transitionDelay = (i * 0.05) + 's';
        }

        innerSpan.textContent = word;
        wordSpan.appendChild(innerSpan);
        el.appendChild(wordSpan);

        // Add a space between words
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      // If reduced motion, mark as revealed immediately
      if (prefersReducedMotion) {
        el.classList.add('text-revealed');
      }
    });

    // Skip observer entirely if reduced motion
    if (prefersReducedMotion) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var inners = el.querySelectorAll('.word-inner');

        inners.forEach(function (inner) {
          inner.style.transform = 'translateY(0)';
        });

        // Mark as revealed once the last word finishes animating
        var totalDuration = inners.length * 50 + 500;
        setTimeout(function () {
          el.classList.add('text-revealed');
        }, totalDuration);

        observer.unobserve(el);
      });
    }, {
      threshold: 0.2
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================================================================
  // 4. Scroll Progress Bar
  // =========================================================================
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  // =========================================================================
  // 5. Parallax Header Image
  // =========================================================================
  function initHeaderParallax() {
    var bg = document.getElementById('headerBg');
    if (!bg || prefersReducedMotion) return;

    var header = bg.closest('.site-header');
    var ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrollTop = window.pageYOffset;
          var headerH = header.offsetHeight;
          if (scrollTop < headerH) {
            bg.style.transform = 'translateY(' + (scrollTop * 0.35) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // =========================================================================
  // 6. Back to Top Button
  // =========================================================================
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Наверх');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 600) {
        btn.classList.add('back-to-top--visible');
      } else {
        btn.classList.remove('back-to-top--visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 7. Animated Counters
  // =========================================================================
  function initCounters() {
    var counters = document.querySelectorAll('.counter-value');
    if (!counters.length) return;

    var animated = false;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach(function(counter) {
            var target = parseInt(counter.getAttribute('data-target'), 10);
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              counter.textContent = Math.floor(eased * target);
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                counter.textContent = target + '+';
              }
            }

            if (prefersReducedMotion) {
              counter.textContent = target + '+';
            } else {
              requestAnimationFrame(step);
            }
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    var section = document.querySelector('.counters-section');
    if (section) observer.observe(section);
  }

  // =========================================================================
  // Initialise everything on DOMContentLoaded
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initCustomCursor();
    initTiltCards();
    initTextReveal();
    initScrollProgress();
    initHeaderParallax();
    initBackToTop();
    initCounters();
  });
})();
