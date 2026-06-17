/* ============================================================
   SINDI QENANI — script.js
   Vanilla JS | No jQuery | No frameworks
   ============================================================ */

'use strict';

/* ── UTILITY HELPERS ─────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);

/* ── DOM READY ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initReveal();
  initCounters();
  initPortfolioFilter();
  initLightbox();
  initReelsSlider();
  initTestimonialsSlider();
  initFormValidation();
  initActiveNavLinks();
});

/* ──────────────────────────────────────────────────────────
   1. STICKY HEADER
   ────────────────────────────────────────────────────────── */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  const SCROLL_THRESHOLD = 60;

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  on(window, 'scroll', update, { passive: true });
  update(); // run once on load
}

/* ──────────────────────────────────────────────────────────
   2. MOBILE MENU TOGGLE
   ────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const navMenu   = $('#navMenu');
  const overlay   = $('#navOverlay');
  if (!hamburger || !navMenu) return;

  const open = () => {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    overlay && overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    overlay && overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggle = () => hamburger.classList.contains('open') ? close() : open();

  on(hamburger, 'click', toggle);
  on(overlay, 'click', close);

  // Close on nav link click
  on(navMenu, 'click', e => {
    if (e.target.matches('.nav__link')) close();
  });

  // Close on ESC
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) close();
  });
}

/* ──────────────────────────────────────────────────────────
   3. SMOOTH SCROLLING
   ────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  on(document, 'click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();

    const header     = $('#header');
    const headerH    = header ? header.offsetHeight : 0;
    const targetTop  = target.getBoundingClientRect().top + window.scrollY - headerH;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────────────────
   4. ACTIVE NAV LINK HIGHLIGHTING
   ────────────────────────────────────────────────────────── */
function initActiveNavLinks() {
  const navLinks = $$('.nav__link[href^="#"]');
  if (!navLinks.length) return;

  const sections = navLinks
    .map(l => $(l.getAttribute('href')))
    .filter(Boolean);

  const header = $('#header');

  const setActive = () => {
    const offset = (header ? header.offsetHeight : 0) + 20;
    let current  = '';

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) {
        current = '#' + sec.id;
      }
    });

    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === current);
    });
  };

  on(window, 'scroll', setActive, { passive: true });
  setActive();
}

/* ──────────────────────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
   ────────────────────────────────────────────────────────── */
function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  // Stagger siblings inside the same parent grid/flex container
  const staggerDelay = (el) => {
    const siblings = $$('.reveal', el.parentElement);
    const idx      = siblings.indexOf(el);
    return Math.min(idx * 80, 400); // cap at 400 ms
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = staggerDelay(el);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────
   6. ANIMATED COUNTERS
   ────────────────────────────────────────────────────────── */
function initCounters() {
  const counters = $$('.stat__number[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const DURATION = 1800; // ms

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const start   = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────
   7. PORTFOLIO FILTERING
   ────────────────────────────────────────────────────────── */
function initPortfolioFilter() {
  const filters = $$('.portfolio__filter');
  const items   = $$('.portfolio__item');
  if (!filters.length || !items.length) return;

  const HIDDEN_CLS  = 'hidden';
  const ACTIVE_CLS  = 'portfolio__filter--active';

  const applyFilter = (filter) => {
    filters.forEach(btn => btn.classList.toggle(ACTIVE_CLS, btn === filter));

    const value = filter.dataset.filter;

    items.forEach(item => {
      const show = value === 'all' || item.dataset.category === value;
      if (show) {
        item.classList.remove(HIDDEN_CLS);
        // Re-trigger reveal if not yet visible
        if (!item.classList.contains('visible')) {
          requestAnimationFrame(() => item.classList.add('visible'));
        }
      } else {
        item.classList.add(HIDDEN_CLS);
      }
    });
  };

  filters.forEach(btn => on(btn, 'click', () => applyFilter(btn)));
}

/* ──────────────────────────────────────────────────────────
   8. LIGHTBOX
   ────────────────────────────────────────────────────────── */
function initLightbox() {
  const lightbox      = $('#lightbox');
  const closeBtn      = $('#lightboxClose');
  const mediaEl       = $('#lightboxMedia');
  const tagEl         = $('#lightboxTag');
  const titleEl       = $('#lightboxTitle');
  const descEl        = $('#lightboxDesc');
  if (!lightbox) return;

  // Map category to gradient (matches portfolio placeholders)
  const GRADIENTS = {
    Elektrike:  'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    Hidraulike: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)',
    Ngrohje:    'linear-gradient(135deg, #7c2d12, #ef4444)',
    Ftohje:     'linear-gradient(135deg, #312e81, #6366f1)',
  };

  const ICONS = {
    Elektrike:  'fa-bolt',
    Hidraulike: 'fa-faucet',
    Ngrohje:    'fa-fire',
    Ftohje:     'fa-snowflake',
  };

  const openLightbox = ({ title, cat, desc }) => {
    const gradient = GRADIENTS[cat] || 'linear-gradient(135deg, #0a2260, #1a5cf6)';
    const icon     = ICONS[cat]     || 'fa-image';

    mediaEl.innerHTML = `
      <div class="lightbox__media-placeholder" style="background:${gradient}">
        <i class="fas ${icon}"></i>
      </div>`;

    tagEl.textContent   = cat;
    titleEl.textContent = title;
    descEl.textContent  = desc;

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };

  // Event delegation on document for open buttons
  on(document, 'click', e => {
    const btn = e.target.closest('.portfolio__open');
    if (!btn) return;
    openLightbox({
      title: btn.dataset.title || '',
      cat:   btn.dataset.cat   || '',
      desc:  btn.dataset.desc  || '',
    });
  });

  on(closeBtn, 'click', closeLightbox);

  // Click outside content closes
  on(lightbox, 'click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  on(document, 'keydown', e => {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
  });
}

/* ──────────────────────────────────────────────────────────
   9. REELS SLIDER (Projektet)
   ────────────────────────────────────────────────────────── */
function initReelsSlider() {
  const track    = $('#reelsTrack');
  const prevBtn  = $('#reelsPrev');
  const nextBtn  = $('#reelsNext');
  const dotsWrap = $('#reelsDots');
  if (!track) return;

  const cards    = $$('.reel__card', track);
  if (!cards.length) return;

  let currentIndex   = 0;
  let visibleCount   = getVisibleCount();
  const totalSlides  = Math.ceil(cards.length / visibleCount);

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 960) return 2;
    return 4;
  }

  // Build dots
  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = Math.ceil(cards.length / visibleCount);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className   = 'reels__dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Reel grupi ${i + 1}`);
      on(dot, 'click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  };

  const updateDots = () => {
    $$('.reels__dot', dotsWrap).forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex));
  };

  const updateButtons = () => {
    const maxIdx = Math.ceil(cards.length / visibleCount) - 1;
    prevBtn && (prevBtn.disabled = currentIndex === 0);
    nextBtn && (nextBtn.disabled = currentIndex >= maxIdx);
  };

  const getSlideWidth = () => {
    if (!cards[0]) return 0;
    const gap   = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].offsetWidth + gap;
  };

  const goTo = (index) => {
    const maxIdx = Math.ceil(cards.length / visibleCount) - 1;
    currentIndex = Math.max(0, Math.min(index, maxIdx));
    const offset = currentIndex * visibleCount * getSlideWidth();
    track.style.transform = `translateX(-${offset}px)`;
    track.style.transition = 'transform 0.45s cubic-bezier(.4,0,.2,1)';
    updateDots();
    updateButtons();
  };

  on(prevBtn, 'click', () => goTo(currentIndex - 1));
  on(nextBtn, 'click', () => goTo(currentIndex + 1));

  // Touch / drag support
  addSwipeSupport(track,
    () => goTo(currentIndex + 1),
    () => goTo(currentIndex - 1)
  );

  // Resize handler
  let resizeTimer;
  on(window, 'resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newVisible = getVisibleCount();
      if (newVisible !== visibleCount) {
        visibleCount  = newVisible;
        currentIndex  = 0;
        buildDots();
      }
      goTo(currentIndex);
    }, 150);
  });

  buildDots();
  goTo(0);
}

/* ──────────────────────────────────────────────────────────
   10. TESTIMONIALS SLIDER
   ────────────────────────────────────────────────────────── */
function initTestimonialsSlider() {
  const track    = $('#testimonialsTrack');
  const prevBtn  = $('#testimonialsPrev');
  const nextBtn  = $('#testimonialsNext');
  const dotsWrap = $('#testimonialsDots');
  if (!track) return;

  const cards = $$('.testimonial__card', track);
  if (!cards.length) return;

  let currentIndex  = 0;
  let visibleCount  = getVisibleCount();
  let autoTimer     = null;
  const AUTO_DELAY  = 5000;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = Math.ceil(cards.length / visibleCount);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className   = 'testimonials__dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Vlerësimi grupi ${i + 1}`);
      on(dot, 'click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  };

  const updateDots = () => {
    $$('.testimonials__dot', dotsWrap).forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex));
  };

  const getSlideWidth = () => {
    if (!cards[0]) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].offsetWidth + gap;
  };

  const goTo = (index) => {
    const maxIdx = Math.ceil(cards.length / visibleCount) - 1;
    currentIndex = ((index % (maxIdx + 1)) + (maxIdx + 1)) % (maxIdx + 1);
    const offset = currentIndex * visibleCount * getSlideWidth();
    track.style.transform  = `translateX(-${offset}px)`;
    track.style.transition = 'transform 0.45s cubic-bezier(.4,0,.2,1)';
    updateDots();
  };

  const startAuto = () => {
    autoTimer = setInterval(() => goTo(currentIndex + 1), AUTO_DELAY);
  };

  const resetAuto = () => {
    clearInterval(autoTimer);
    startAuto();
  };

  on(prevBtn, 'click', () => { goTo(currentIndex - 1); resetAuto(); });
  on(nextBtn, 'click', () => { goTo(currentIndex + 1); resetAuto(); });

  // Pause on hover
  on(track.parentElement, 'mouseenter', () => clearInterval(autoTimer));
  on(track.parentElement, 'mouseleave', startAuto);

  // Touch support
  addSwipeSupport(track,
    () => { goTo(currentIndex + 1); resetAuto(); },
    () => { goTo(currentIndex - 1); resetAuto(); }
  );

  let resizeTimer;
  on(window, 'resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newVisible = getVisibleCount();
      if (newVisible !== visibleCount) {
        visibleCount = newVisible;
        currentIndex = 0;
        buildDots();
      }
      goTo(currentIndex);
    }, 150);
  });

  buildDots();
  goTo(0);
  startAuto();
}

/* ──────────────────────────────────────────────────────────
   11. FORM VALIDATION
   ────────────────────────────────────────────────────────── */
function initFormValidation() {
  const form      = $('#kontaktForm');
  const submitBtn = $('#submitBtn');
  const success   = $('#formSuccess');
  if (!form) return;

  const rules = {
    emri:     { required: true, minLength: 2,  errorId: 'emriError',     label: 'Emri i plotë' },
    telefoni: { required: true, pattern: /^[\d\s\+\-\(\)]{6,20}$/, errorId: 'telefoniError', label: 'Numri i telefonit' },
    email:    { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorId: 'emailError', label: 'Email' },
    sherbimi: { required: true,  errorId: 'sherbimiError', label: 'Shërbimi' },
    mesazhi:  { required: true,  minLength: 10, errorId: 'mesazhiError',  label: 'Mesazhi' },
  };

  const showError = (fieldName, message) => {
    const rule  = rules[fieldName];
    const field = form.elements[fieldName];
    const errEl = rule ? $('#' + rule.errorId) : null;
    field && field.classList.add('invalid');
    if (errEl) errEl.textContent = message;
  };

  const clearError = (fieldName) => {
    const rule  = rules[fieldName];
    const field = form.elements[fieldName];
    const errEl = rule ? $('#' + rule.errorId) : null;
    field && field.classList.remove('invalid');
    if (errEl) errEl.textContent = '';
  };

  const validateField = (fieldName) => {
    const rule  = rules[fieldName];
    if (!rule) return true;
    const field = form.elements[fieldName];
    if (!field) return true;
    const val   = field.value.trim();

    if (rule.required && !val) {
      showError(fieldName, `${rule.label} është i detyrueshëm.`);
      return false;
    }
    if (val && rule.minLength && val.length < rule.minLength) {
      showError(fieldName, `${rule.label} duhet të ketë të paktën ${rule.minLength} karaktere.`);
      return false;
    }
    if (val && rule.pattern && !rule.pattern.test(val)) {
      showError(fieldName, `${rule.label} nuk është i vlefshëm.`);
      return false;
    }
    clearError(fieldName);
    return true;
  };

  // Live validation on blur
  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    on(field, 'blur',  () => validateField(name));
    on(field, 'input', () => {
      if (field.classList.contains('invalid')) validateField(name);
    });
  });

  on(form, 'submit', async (e) => {
    e.preventDefault();

    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.invalid');
      firstInvalid && firstInvalid.focus();
      return;
    }

    // Simulate sending (replace with real fetch if backend is set up)
    const btnText   = submitBtn.querySelector('.btn__text');
    const btnLoader = submitBtn.querySelector('.btn__loader');

    submitBtn.disabled = true;
    btnText   && (btnText.hidden   = true);
    btnLoader && (btnLoader.hidden = false);

    await fakeRequest(1200);

    submitBtn.disabled = false;
    btnText   && (btnText.hidden   = false);
    btnLoader && (btnLoader.hidden = true);

    form.reset();
    Object.keys(rules).forEach(clearError);
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { success.hidden = true; }, 6000);
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {

    const image = document.querySelector(".hero__right img");

    if (!image) return;

    let position = 0;

    function animate() {
        position += 0.02;

        image.style.transform =
            `translateY(${Math.sin(position) * 12}px)`;

        requestAnimationFrame(animate);
    }

    animate();

});
const fakeRequest = (ms) => new Promise(res => setTimeout(res, ms));

/* ──────────────────────────────────────────────────────────
   SHARED: TOUCH / SWIPE SUPPORT
   ────────────────────────────────────────────────────────── */
function addSwipeSupport(el, onSwipeLeft, onSwipeRight) {
  if (!el) return;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  on(el, 'touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  on(el, 'touchmove', e => {
    if (!startX) return;
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > dy && dx > 8) isDragging = true;
  }, { passive: true });

  on(el, 'touchend', e => {
    if (!isDragging) return;
    const diffX = e.changedTouches[0].clientX - startX;
    if (Math.abs(diffX) < 40) return;
    diffX < 0 ? onSwipeLeft() : onSwipeRight();
    startX = 0;
    isDragging = false;
  });
}
