document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const isDiagnostic = /diagnostic\.html$/.test(window.location.pathname);

  const track = (name, detail = {}) => {
    const payload = { event: `arutiun_${name}`, ...detail };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent('arutiun:conversion', { detail: payload }));
  };
  window.arutiunTrack = track;

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      track(open ? 'menu_open' : 'menu_close');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
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
      if (!started) {
        started = true;
        track('form_start');
      }
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
    sticky.addEventListener('click', () => track(sticky.dataset.event));

    const watched = [...document.querySelectorAll('.form-card, .cta-band')];
    if (watched.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        sticky.classList.toggle('is-hidden', visible);
      }, { threshold: 0.18 });
      watched.forEach((element) => observer.observe(element));
    }
    window.addEventListener('resize', () => {
      if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        sticky.classList.add('is-keyboard');
      } else {
        sticky.classList.remove('is-keyboard');
      }
    });
  }
});
