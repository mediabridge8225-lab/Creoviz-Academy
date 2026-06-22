/**
 * Creoviz Academy — Application Logic
 * ─────────────────────────────────────
 * Handles: SPA routing, mobile menu, course filters + search,
 *          enrollment modal, contact form, scroll effects, toasts.
 */

(function () {
  'use strict';

  /* ─── DOM Ready ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNavigation();
    initMobileMenu();
    initCourseFilters();
    initModal();
    initContactForm();
    initScrollEffects();
    initNavbarScroll();
    initLevelPicker();

    // Activate about grid responsiveness on load
    makeAboutGridResponsive();
    makeContactGridResponsive();
    window.addEventListener('resize', () => {
      makeAboutGridResponsive();
      makeContactGridResponsive();
    });
  }

  /* ─── 1. SPA Navigation ──────────────────────────────── */
  const PAGES = ['home', 'courses', 'about', 'contact'];

  function initNavigation() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link-js');
      if (!link) return;
      e.preventDefault();
      const target = link.dataset.nav;
      if (target) navigateTo(target);
    });
  }

  function navigateTo(page) {
    if (!PAGES.includes(page)) return;

    // Hide all pages
    PAGES.forEach((p) => {
      const el = document.getElementById(`page-${p}`);
      if (el) {
        el.classList.remove('active');
      }
    });

    // Show target page with a tiny delay for transition
    setTimeout(() => {
      const target = document.getElementById(`page-${page}`);
      if (target) target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Trigger reveal animations for the new page
      setTimeout(triggerReveal, 120);
    }, 30);

    // Update nav active states
    document.querySelectorAll('.nav-link-js').forEach((l) => {
      if (l.dataset.nav === page) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    // Close mobile menu if open
    closeMobileMenu();
  }

  /* ─── 2. Navbar Scroll Effect ────────────────────────── */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ─── 3. Mobile Menu ─────────────────────────────────── */
  function initMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-mobile');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-mobile');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
  }

  function closeMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-mobile');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    if (menu) menu.classList.remove('open');
  }

  /* ─── 4. Course Filters & Search ────────────────────── */
  function initCourseFilters() {
    const filterBtns = document.querySelectorAll('.filter-tab');
    const searchInput = document.getElementById('course-search');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
  }

  function applyFilters() {
    const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    const query = (document.getElementById('course-search')?.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#courses-grid .course-card');
    const noResults = document.getElementById('no-results');
    let visible = 0;

    cards.forEach((card) => {
      const cat = card.dataset.category || '';
      const title = (card.dataset.title || '').toLowerCase();
      const matchCat = activeFilter === 'all' || cat === activeFilter;
      const matchSearch = !query || title.includes(query);

      if (matchCat && matchSearch) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.classList.toggle('hidden', visible > 0);
    }
  }

  /* ─── 5. Enrollment Modal ────────────────────────────── */
  function initModal() {
    const overlay = document.getElementById('enroll-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const courseSelect = document.getElementById('e-course');
    const form = document.getElementById('enroll-form');

    if (!overlay) return;

    // Open triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.open-modal');
      if (!trigger) return;
      e.preventDefault();

      // Pre-select course if specified
      const course = trigger.dataset.course;
      if (course && courseSelect) {
        Array.from(courseSelect.options).forEach((opt) => {
          opt.selected = opt.text.includes(course);
        });
      }

      openModal();
    });

    // Close triggers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('e-name')?.value?.trim();
        const email = document.getElementById('e-email')?.value?.trim();
        const course = courseSelect?.value;

        if (!name || !email) return;

        closeModal();
        form.reset();
        resetLevelPicker();

        showToast(
          '🎉 Registration Submitted!',
          `Welcome, ${name}! Check ${email} for your ${course} access details.`,
          'success'
        );
      });
    }
  }

  function openModal() {
    const overlay = document.getElementById('enroll-modal');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('enroll-modal');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── 6. Level Picker Radio Styling ─────────────────── */
  function initLevelPicker() {
    const labels = document.querySelectorAll('[name="level"]');
    labels.forEach((radio) => {
      radio.addEventListener('change', updateLevelStyles);
    });
    updateLevelStyles();
  }

  function updateLevelStyles() {
    const radios = document.querySelectorAll('[name="level"]');
    radios.forEach((radio) => {
      const lbl = radio.closest('label');
      if (!lbl) return;
      if (radio.checked) {
        lbl.style.borderColor = 'var(--primary)';
        lbl.style.background = 'var(--primary-dim)';
        lbl.style.color = 'var(--primary)';
      } else {
        lbl.style.borderColor = 'var(--border)';
        lbl.style.background = 'var(--bg)';
        lbl.style.color = '#fff';
      }
    });
  }

  function resetLevelPicker() {
    const first = document.querySelector('[name="level"]');
    if (first) { first.checked = true; updateLevelStyles(); }
  }

  /* ─── 7. Contact Form ────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-name')?.value?.trim();
      const email = document.getElementById('c-email')?.value?.trim();

      if (!name || !email) return;

      form.reset();
      showToast(
        '📩 Message Received!',
        `Hi ${name}! We'll reply to ${email} within 12 hours.`,
        'info'
      );
    });
  }

  /* ─── 8. Toast Notifications ─────────────────────────── */
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icon = type === 'success' ? '✅' : 'ℹ️';

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Entrance
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.replace('show', 'hide');
      setTimeout(() => toast.remove(), 450);
    }, 5000);
  }

  /* ─── 9. Scroll Reveal Animations ───────────────────── */
  function triggerReveal() {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }

  function initScrollEffects() {
    window.addEventListener('scroll', triggerReveal, { passive: true });
    // Initial trigger
    setTimeout(triggerReveal, 100);
  }

  /* ─── 10. Responsive Grid Helpers ────────────────────── */
  function makeAboutGridResponsive() {
    const grid = document.querySelector('.about-grid');
    if (!grid) return;
    if (window.innerWidth <= 768) {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gap = '40px';
    } else {
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.gap = '64px';
    }
  }

  function makeContactGridResponsive() {
    const grid = document.querySelector('.contact-grid');
    if (!grid) return;
    if (window.innerWidth <= 768) {
      grid.style.gridTemplateColumns = '1fr';
    } else {
      grid.style.gridTemplateColumns = '1.4fr 1fr';
    }
  }

})();
