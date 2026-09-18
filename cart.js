(function () {
  const STORAGE_KEY = 'lf_cart';

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  function fmtUSD(n) {
    return 'USD ' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function render() {
    const cart = loadCart();
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!countEl || !itemsEl || !totalEl) return;

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = count;

    if (cart.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">Aún no agregaste nada. Explora la tienda y toca "+ Carrito" en lo que te interese.</p>';
    } else {
      itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <span>${fmtUSD(item.price)} c/u</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Quitar uno">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Agregar uno">+</button>
          </div>
          <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Eliminar">✕</button>
        </div>
      `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    totalEl.textContent = fmtUSD(total);
  }

  function addItem(id, name, price) {
    const cart = loadCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }
    saveCart(cart);
    render();
    openDrawer();
  }

  function changeQty(id, delta) {
    let cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
    render();
  }

  function removeItem(id) {
    const cart = loadCart().filter(i => i.id !== id);
    saveCart(cart);
    render();
  }

  function openDrawer() {
    document.getElementById('cartDrawer')?.classList.add('is-open');
    document.getElementById('cartOverlay')?.classList.add('is-open');
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('is-open');
    document.getElementById('cartOverlay')?.classList.remove('is-open');
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();

    document.querySelectorAll('.add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const { id, name, price } = btn.dataset;
        addItem(id, name, parseFloat(price));
      });
    });

    document.getElementById('cartToggle')?.addEventListener('click', openDrawer);
    document.getElementById('cartClose')?.addEventListener('click', closeDrawer);
    document.getElementById('cartOverlay')?.addEventListener('click', closeDrawer);

    document.getElementById('cartItems')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'inc') changeQty(id, 1);
      if (action === 'dec') changeQty(id, -1);
      if (action === 'remove') removeItem(id);
    });
  });
})();
