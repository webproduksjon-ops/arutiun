document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isDiagnostic = currentFile === 'diagnostic.html';
  const isMaterialsHub = currentFile === 'materialy.html';

  const track = (name, detail = {}) => {
    const payload = { event: `arutiun_${name}`, ...detail };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent('arutiun:conversion', { detail: payload }));
  };
  window.arutiunTrack = track;

  if (nav) {
    nav.querySelectorAll('a.nav-link').forEach((link) => {
      const linkFile = link.getAttribute('href').split('/').pop();
      if (linkFile === currentFile) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  if (toggle && nav) {
    const closeMenu = ({ restoreFocus = false } = {}) => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('menu-is-open');
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('menu-is-open', open);
      track(open ? 'menu_open' : 'menu_close');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
    nav.querySelectorAll('.nav-more').forEach((details) => details.addEventListener('toggle', () => { if (!details.open) return; nav.querySelectorAll('.nav-more').forEach((other) => { if (other !== details) other.open = false; }); }));
    document.addEventListener('pointerup', (event) => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu({ restoreFocus: true });
        track('menu_close_outside');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu({ restoreFocus: true });
        track('menu_close_escape');
      }
    });
  }

  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener('click', () => {
      try { sessionStorage.setItem('arutiun_last_page', window.location.pathname); } catch (_) {}
    });
  });

  document.querySelectorAll('a[href*="diagnostic.html"]').forEach((link) => {
    link.dataset.event = link.dataset.event || 'diagnostic_cta_click';
    link.addEventListener('click', () => track(link.dataset.event));
  });
  document.querySelectorAll('a[href*="t.me/"]').forEach((link) => {
    link.addEventListener('click', () => track('telegram_click'));
  });

  document.querySelectorAll('form[data-conversion-form]').forEach((form) => {
    let started = false;
    form.addEventListener('focusin', () => {
      if (!started) { started = true; track('form_start'); }
    });
    form.addEventListener('invalid', () => track('form_error'), true);
    form.addEventListener('submit', () => track('form_submit'));
  });

  if (!isDiagnostic && window.matchMedia('(max-width: 760px)').matches) {
    const routePrefix = window.location.pathname.includes('/materialy/') ? '../' : '';
    const sticky = document.createElement('a');
    sticky.className = 'mobile-sticky-cta is-hidden';
    sticky.href = `${routePrefix}diagnostic.html`;
    sticky.dataset.event = 'mobile_diagnostic_cta_click';
    sticky.innerHTML = '<span>Записаться на встречу</span><span aria-hidden="true">↗</span>';
    sticky.setAttribute('aria-label', 'Записаться на диагностическую встречу');
    document.body.appendChild(sticky);
    document.body.classList.add('has-mobile-sticky');
    sticky.addEventListener('click', () => track(sticky.dataset.event));

    const hero = document.querySelector('.hero-home, .inner-hero');
    const watched = [...document.querySelectorAll('.form-card, .cta-band')];
    const overlapTargets = [...document.querySelectorAll('.card-link, .text-link, .content-card, .media-card, .article-content p, .article-content h2, .form-card input, .form-card select, .form-card textarea, .form-card button')];
    let heroVisible = Boolean(hero);
    let actionVisible = false;
    let overlap = false;
    let keyboard = false;
    const render = () => sticky.classList.toggle('is-hidden', heroVisible || actionVisible || overlap || keyboard);
    if (hero && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => { heroVisible = entries.some((entry) => entry.isIntersecting); render(); }, { threshold: 0.08 });
      heroObserver.observe(hero);
    } else { heroVisible = false; }
    if (watched.length && 'IntersectionObserver' in window) {
      const actionObserver = new IntersectionObserver((entries) => { actionVisible = entries.some((entry) => entry.isIntersecting); render(); }, { threshold: 0.18, rootMargin: '0px 0px -64px 0px' });
      watched.forEach((element) => actionObserver.observe(element));
    }
    const updateOverlap = () => {
      const edge = window.innerHeight - 112;
      overlap = overlapTargets.some((element) => { const rect = element.getBoundingClientRect(); return rect.top < window.innerHeight && rect.bottom > edge; });
      render();
    };
    const updateKeyboardState = () => { const active = document.activeElement; keyboard = Boolean(active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)); render(); };
    window.addEventListener('scroll', updateOverlap, { passive: true });
    window.addEventListener('resize', () => { updateOverlap(); updateKeyboardState(); });
    document.addEventListener('focusin', updateKeyboardState);
    document.addEventListener('focusout', updateKeyboardState);
    updateOverlap();
    window.setTimeout(() => { updateOverlap(); updateKeyboardState(); }, 350);
  }

  document.querySelectorAll('.video-cover-image').forEach((image) => {
    image.addEventListener('error', () => { image.remove(); image.closest('.media-image')?.classList.add('media-image-failed'); });
  });
});
