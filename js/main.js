// Shared by the top, product and cart pages: mobile menu drawer and the "new items" carousel.
(() => {
  'use strict';

  // ---- Mobile menu drawer ----
  const drawer = document.getElementById('drawer');
  const openBtn = document.getElementById('menu-open');
  const closeBtn = document.getElementById('menu-close');

  const setDrawer = (open) => {
    if (!drawer) return;
    drawer.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn).focus();
  };

  if (drawer && openBtn) {
    openBtn.addEventListener('click', () => setDrawer(true));
    closeBtn.addEventListener('click', () => setDrawer(false));
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) setDrawer(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) setDrawer(false);
    });
    // The drawer is a phone/tablet UI: close it when the window grows to the PC layout.
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => {
      if (m.matches && !drawer.hidden) setDrawer(false);
    });
  }

  // ---- Scroll reveal (top page): fade in while rising 16px, once per element ----
  // Elements that enter the viewport together are staggered by 0.1s each.
  const revealTargets = document.querySelectorAll(
    '.section__title, .scene, .type, .items__all .btn, .story__image, .story__title, .story__lead, .principles, .story__text .btn'
  );
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealTargets.length && 'IntersectionObserver' in window && !reduceMotion) {
    const revealer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry, i) => {
        entry.target.style.animationDelay = `${i * 0.1}s`;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      revealer.observe(el);
    });
  }

  // ---- "New items" carousel: arrows (PC) and the scroll indicator ----
  const scroller = document.getElementById('carousel-scroller');
  const thumb = document.getElementById('carousel-thumb');
  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  if (!scroller || !thumb) return;

  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const ratio = max > 0 ? scroller.scrollLeft / max : 0;
    const track = thumb.parentElement.clientWidth - thumb.offsetWidth;
    thumb.style.transform = `translateX(${Math.round(ratio * track)}px)`;
    if (prev) prev.hidden = scroller.scrollLeft < 8;
    if (next) next.hidden = scroller.scrollLeft > max - 8;
  };

  // One click moves three cards (card width + the 24px gap).
  const step = (dir) => {
    const card = scroller.querySelector('.card');
    const width = card ? card.getBoundingClientRect().width + 24 : 330;
    scroller.scrollBy({ left: dir * width * 3, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
