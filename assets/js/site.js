document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isDiagnostic = currentFile === 'diagnostic.html';

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
    sticky.className = 'mobile-sticky-cta';
    sticky.href = `${routePrefix}diagnostic.html`;
    sticky.dataset.event = 'mobile_diagnostic_cta_click';
    sticky.innerHTML = '<span>Записаться на встречу</span><span aria-hidden="true">↗</span>';
    document.body.appendChild(sticky);
    document.body.classList.add('has-mobile-sticky');
    if (currentFile === 'materialy.html') sticky.classList.add('is-hidden');
    sticky.addEventListener('click', () => track(sticky.dataset.event));

    const watched = [...document.querySelectorAll('.form-card, .cta-band')];
    if (watched.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        sticky.classList.toggle('is-hidden', visible);
      }, { threshold: 0.18, rootMargin: '0px 0px -64px 0px' });
      watched.forEach((element) => observer.observe(element));
    }
    const overlapTargets = [...document.querySelectorAll('.card-link, .text-link, .content-card, .media-card, .article-content p, .article-content h2, .form-card input, .form-card select, .form-card textarea, .form-card button')];
    const updateOverlap = () => {
      const edge = window.innerHeight - 112;
      const overlap = overlapTargets.some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > edge;
      });
      sticky.classList.toggle('is-hidden', overlap || sticky.classList.contains('is-keyboard'));
    };
    window.addEventListener('scroll', updateOverlap, { passive: true });
    window.addEventListener('resize', updateOverlap);
    updateOverlap();
    window.setTimeout(updateOverlap, 250);
    const updateKeyboardState = () => {
      const active = document.activeElement;
      sticky.classList.toggle('is-keyboard', Boolean(active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)));
    };
    window.addEventListener('resize', updateKeyboardState);
    document.addEventListener('focusin', updateKeyboardState);
    document.addEventListener('focusout', updateKeyboardState);
  }
});
