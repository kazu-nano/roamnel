// Product page: photo thumbnails, quantity stepper, add-to-cart feedback (demo only, no backend).
(() => {
  'use strict';

  // ---- Thumbnails switch the main photo ----
  const main = document.getElementById('gallery-main');
  const thumbs = document.querySelectorAll('.thumb');

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.setAttribute('aria-current', String(t === thumb)));
      const { src, srcset, alt } = thumb.dataset;
      main.src = src;
      main.srcset = srcset;
      main.alt = alt;
    });
  });

  // ---- Quantity stepper (1-99) ----
  const qty = document.getElementById('qty-value');
  const setQty = (n) => { qty.value = Math.max(1, Math.min(99, n)); };
  document.getElementById('qty-minus').addEventListener('click', () => setQty(Number(qty.value) - 1));
  document.getElementById('qty-plus').addEventListener('click', () => setQty(Number(qty.value) + 1));

  // ---- Add to cart: shows a short message only ----
  const add = document.getElementById('add-to-cart');
  const label = add.textContent;
  let timer;
  add.addEventListener('click', () => {
    add.textContent = 'カートに入れました（デモ）';
    clearTimeout(timer);
    timer = setTimeout(() => { add.textContent = label; }, 1800);
  });
})();
