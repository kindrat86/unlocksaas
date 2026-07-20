/**
 * ux.js — World-Class Interactive UX Enhancements (R16)
 * Zero dependencies. Progressive enhancement. 8KB total.
 * Features: reading progress bar, back-to-top, lazy image loading,
 * accordions, smooth scroll, mobile nav toggle, exit-intent helper,
 * stagger animation observer.
 */
(function() {
  'use strict';

  // ── READING PROGRESS BAR ────────────────────────────────────────
  function initReadingProgress() {
    var bar = document.createElement('div');
    bar.id = 'ux-reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-label', 'Page reading progress');
    document.body.prepend(bar);

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrollTop = window.scrollY || document.documentElement.scrollTop;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
          bar.style.width = progress + '%';
          bar.setAttribute('aria-valuenow', Math.round(progress));
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── BACK-TO-TOP BUTTON ──────────────────────────────────────────
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'ux-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '\u2191';
    btn.title = 'Back to top';
    document.body.appendChild(btn);

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (window.scrollY > 500) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── LAZY IMAGE LOADING ──────────────────────────────────────────
  function initLazyImages() {
    if ('IntersectionObserver' in window) {
      var imgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            img.addEventListener('load', function() {
              img.classList.add('loaded');
            });
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '300px 0px' });

      document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
        if (img.complete) {
          img.classList.add('loaded');
        }
      });
    }
  }

  // ── ACCORDIONS ──────────────────────────────────────────────────
  function initAccordions() {
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      var targetId = trigger.getAttribute('data-accordion-trigger');
      var content = document.querySelector('[data-accordion="' + targetId + '"]');
      if (!content) return;

      var isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  }

  // ── SMOOTH ANCHOR SCROLL (respects sticky nav) ──────────────────
  function initSmoothAnchors() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '#main-content' || targetId === '#main') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var navHeight = 80;
      var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without jump
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  }

  // ── MOBILE NAV TOGGLE (with body scroll lock + overlay) ─────────
  function initMobileNav() {
    document.addEventListener('click', function(e) {
      var toggle = e.target.closest('[data-mobile-nav-toggle]');
      if (!toggle) return;

      var targetId = toggle.getAttribute('data-mobile-nav-toggle');
      var nav = document.querySelector('[data-mobile-nav="' + targetId + '"]');
      if (!nav) return;

      var isOpen = nav.classList.contains('open');
      nav.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', !isOpen);
      document.body.classList.toggle('nav-open', !isOpen);

      // Close on Escape
      if (!isOpen) {
        var closeOnEsc = function(ev) {
          if (ev.key === 'Escape') {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
            document.removeEventListener('keydown', closeOnEsc);
          }
        };
        document.addEventListener('keydown', closeOnEsc, { once: false });
      }
    });

    // Close mobile nav on anchor link click
    document.addEventListener('click', function(e) {
      var link = e.target.closest('[data-mobile-nav] a[href^="#"]');
      if (!link) return;

      var nav = link.closest('[data-mobile-nav].open');
      if (!nav) return;

      nav.classList.remove('open');
      var toggle = document.querySelector('[data-mobile-nav-toggle][aria-expanded="true"]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('nav-open');
    });
  }

  // ── STAGGER ANIMATION OBSERVER ──────────────────────────────────
  function initStaggerObserver() {
    if ('IntersectionObserver' in window) {
      var staggerObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ux-stagger');
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('[data-stagger]').forEach(function(el) {
        staggerObserver.observe(el);
      });
    } else {
      // Fallback: show without animation
      document.querySelectorAll('[data-stagger]').forEach(function(el) {
        el.classList.add('ux-stagger');
      });
    }
  }

  // ── EXIT-INTENT DETECTION HELPER (reusable) ─────────────────────
  function initExitIntent(callback) {
    var fired = false;
    document.addEventListener('mouseleave', function(e) {
      if (fired) return;
      if (e.clientY <= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth) {
        fired = true;
        if (typeof callback === 'function') callback();
      }
    });
  }

  // ── INITIALIZE EVERYTHING ───────────────────────────────────────
  function init() {
    initReadingProgress();
    initBackToTop();
    initLazyImages();
    initAccordions();
    initSmoothAnchors();
    initMobileNav();
    initStaggerObserver();

    // Expose exit-intent for site-specific use
    window.uxExitIntent = initExitIntent;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
