// Cart page: quantity stepper, remove, and live totals (demo only, no backend).
(() => {
  'use strict';

  const FREE_SHIPPING_FROM = 11000; // yen, tax included
  const SHIPPING_FEE = 660;         // demo value

  const itemsEl = document.getElementById('items');
  const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;
  const $ = (id) => document.getElementById(id);

  const update = () => {
    const rows = itemsEl.querySelectorAll('.item');
    let subtotal = 0;
    let count = 0;

    rows.forEach((row) => {
      const quantity = Number(row.querySelector('.qty-value').textContent);
      const total = Number(row.dataset.price) * quantity;
      subtotal += total;
      count += quantity;
      row.querySelector('.item__total').textContent = yen(total);
    });

    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    $('subtotal').textContent = yen(subtotal);
    $('shipping').textContent = yen(shipping);
    $('total').textContent = yen(subtotal + shipping);
    $('count').textContent = `${count}点の商品`;
    $('empty').hidden = rows.length > 0;
    $('checkout').disabled = rows.length === 0;
  };

  itemsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    const output = item.querySelector('.qty-value');
    const quantity = Number(output.textContent);

    if (e.target.closest('.qty-minus')) output.textContent = Math.max(1, quantity - 1);
    else if (e.target.closest('.qty-plus')) output.textContent = Math.min(99, quantity + 1);
    else if (e.target.closest('.item__remove')) item.remove();
    else return;

    update();
  });

  // Checkout is not available: show a short message only.
  const checkout = $('checkout');
  const label = checkout.textContent;
  let timer;
  checkout.addEventListener('click', () => {
    checkout.textContent = 'デモのため購入はできません';
    clearTimeout(timer);
    timer = setTimeout(() => { checkout.textContent = label; }, 1800);
  });

  update();
})();
