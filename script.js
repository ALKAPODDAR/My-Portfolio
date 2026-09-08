const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. QUERY-BAR TYPING EFFECT (hero)
   ========================================================= */
(function typeQuery() {
  const el = document.getElementById('queryText');
  if (!el) return;
  const full = "SELECT * FROM alka.experience WHERE self_taught = true;";

  if (reduceMotion) {
    el.textContent = full;
    return;
  }

  let i = 0;
  function tick() {
    el.textContent = full.slice(0, i);
    i++;
    if (i <= full.length) {
      setTimeout(tick, 28);
    }
  }
  tick();
})();

/* =========================================================
   2. KPI COUNT-UP + BAR FILL (triggered once, on view)
   ========================================================= */
(function kpiCounters() {
  const cards = document.querySelectorAll('.kpi-card');
  if (!cards.length) return;

  function animateCard(card) {
    const target = parseInt(card.dataset.target, 10);
    const countEl = card.querySelector('.kpi-count');
    card.classList.add('in-view');

    if (reduceMotion) {
      countEl.textContent = target;
      return;
    }

    const duration = 1100;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countEl.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCard(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach((card) => observer.observe(card));
})();

/* =========================================================
   3. SCROLL REVEAL for sections
   ========================================================= */
(function scrollReveal() {
  const targets = document.querySelectorAll(
    '.about-grid, .skills-table, .project-card, .timeline-row, .cert-note, .footer-inner > *'
  );
  targets.forEach((t) => t.classList.add('reveal'));

  if (reduceMotion) {
    targets.forEach((t) => t.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((t) => observer.observe(t));
})();

/* =========================================================
   4. PROJECT ACCORDION
   ========================================================= */
(function projectAccordion() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card) => {
    const btn = card.querySelector('.project-head');
    btn.addEventListener('click', () => {
      const isOpen = card.dataset.open === 'true';
      // close others for a tidy single-open accordion feel
      cards.forEach((c) => {
        c.dataset.open = 'false';
        c.querySelector('.project-head').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        card.dataset.open = 'true';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* =========================================================
   5. IMAGE GALLERY — graceful placeholder for missing files
   ========================================================= */
(function galleryFallback() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;
    const filename = img.getAttribute('src').split('/').pop();

    img.addEventListener('error', () => {
      img.classList.add('img-missing');
      item.classList.add('is-missing');
      item.setAttribute('data-filename', filename);
    });

    // if it's already broken by the time this runs (cached failure)
    if (img.complete && img.naturalWidth === 0) {
      img.classList.add('img-missing');
      item.classList.add('is-missing');
      item.setAttribute('data-filename', filename);
    }
  });
})();

/* =========================================================
   6. MOBILE NAV TOGGLE
   ========================================================= */
(function mobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.col-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // close the menu if the viewport is resized back to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* =========================================================
   7b. IMAGE LIGHTBOX — click a project screenshot to enlarge,
       moving the cursor off the enlarged image shrinks it back
   ========================================================= */
(function imageLightbox() {
  const lightbox = document.getElementById('imgLightbox');
  const lightboxImg = document.getElementById('imgLightboxImg');
  const lightboxCaption = document.getElementById('imgLightboxCaption');
  if (!lightbox || !lightboxImg) return;

  let lastTrigger = null;

  function openLightbox(img) {
    lightboxImg.src = img.getAttribute('src');
    lightboxImg.alt = img.getAttribute('alt') || '';
    const caption = img.closest('.gallery-item')?.querySelector('figcaption');
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('is-active');
    lightbox.setAttribute('aria-hidden', 'false');
    lastTrigger = img;
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lastTrigger) {
      lastTrigger = null;
    }
  }

  document.querySelectorAll('.gallery-item img').forEach((img) => {
    img.addEventListener('click', () => {
      if (img.classList.contains('img-missing')) return;
      openLightbox(img);
    });
  });

  // moving the cursor away from the enlarged image closes it again
  // (desktop / any device with a real mouse pointer)
  lightboxImg.addEventListener('mouseleave', closeLightbox);

  // mobile / touch has no hover or "moving the cursor away" — so tapping
  // the enlarged image itself is the equivalent close gesture there
  lightboxImg.addEventListener('click', closeLightbox);

  // click the dim backdrop (outside the image/frame) to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
      closeLightbox();
    }
  });
})();

/* =========================================================
   7. DARK MODE TOGGLE
   ========================================================= */
(function themeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const STORAGE_KEY = 'alka-portfolio-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem(STORAGE_KEY);
  const startDark = stored ? stored === 'dark' : prefersDark;

  function applyTheme(isDark) {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    btn.setAttribute('aria-pressed', String(isDark));
  }

  applyTheme(startDark);

  btn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
    localStorage.setItem(STORAGE_KEY, !isDark ? 'dark' : 'light');
  });
})();
