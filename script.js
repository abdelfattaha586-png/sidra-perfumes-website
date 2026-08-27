// Sticky nav background on scroll
const nav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Reveal product cards on scroll
const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), (i % 4) * 90);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

cards.forEach(c => observer.observe(c));

// Smooth-close mobile nav if clicked (placeholder for future menu toggle)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ========================================================
   CART + CHECKOUT VIA WHATSAPP
   ======================================================== */
(function () {
  const WHATSAPP_NUMBER = '201067219263'; // 01067219263
  const SHIPPING_FEE = 50; // ج.م — عدّليها هنا لو تغيّرت تكلفة الشحن
  const CART_KEY = 'sidra_cart_v1';

  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartCloseBtn2 = document.getElementById('cartCloseBtn2');
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const sumSubtotal = document.getElementById('sumSubtotal');
  const sumShipping = document.getElementById('sumShipping');
  const sumTotal = document.getElementById('sumTotal');
  const goCheckoutBtn = document.getElementById('goCheckoutBtn');
  const checkoutBackBtn = document.getElementById('checkoutBackBtn');
  const cartView = document.getElementById('cartView');
  const checkoutView = document.getElementById('checkoutView');
  const checkoutForm = document.getElementById('checkoutForm');

  if (!cartDrawer) return; // safety: cart markup not present

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  function fmt(n) {
    return n.toLocaleString('en-US') + ' ج.م';
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    let subtotal = 0;
    let totalQty = 0;

    cart.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      totalQty += item.qty;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">${fmt(item.price)}</div>
          <div class="ci-qty">
            <button type="button" data-action="dec" data-idx="${idx}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" data-idx="${idx}">+</button>
            <button type="button" class="ci-remove" data-action="remove" data-idx="${idx}">حذف</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    const shipping = cart.length ? SHIPPING_FEE : 0;
    const total = subtotal + shipping;

    sumSubtotal.textContent = fmt(subtotal);
    sumShipping.textContent = fmt(shipping);
    sumTotal.textContent = fmt(total);

    cartCountEl.textContent = totalQty;
    cartCountEl.setAttribute('data-empty', totalQty === 0 ? 'true' : 'false');
    cartDrawer.classList.toggle('is-empty', cart.length === 0);
  }

  function addToCart(product) {
    const existing = cart.find(i => i.name === product.name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    renderCart();
    openCart();
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartDrawer.scrollTop = 0;
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    showCartView();
  }
  function showCartView() {
    checkoutView.hidden = true;
    cartView.hidden = false;
    cartDrawer.scrollTop = 0;
  }
  function showCheckoutView() {
    if (!cart.length) return;
    cartView.hidden = true;
    checkoutView.hidden = false;
    cartDrawer.scrollTop = 0;
  }

  // add-to-cart buttons on product cards
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-price')) || 0,
        img: btn.getAttribute('data-img') || ''
      });
      btn.classList.add('added');
      const original = btn.textContent;
      btn.textContent = 'أُضيف ✓';
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = original; }, 1200);
    });
  });

  // qty +/- and remove inside drawer
  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-idx'), 10);
    const action = btn.getAttribute('data-action');
    if (action === 'inc') cart[idx].qty += 1;
    if (action === 'dec') {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    if (action === 'remove') cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  });

  cartOpenBtn && cartOpenBtn.addEventListener('click', openCart);
  cartCloseBtn && cartCloseBtn.addEventListener('click', closeCart);
  cartCloseBtn2 && cartCloseBtn2.addEventListener('click', closeCart);
  cartOverlay && cartOverlay.addEventListener('click', closeCart);
  goCheckoutBtn && goCheckoutBtn.addEventListener('click', showCheckoutView);
  checkoutBackBtn && checkoutBackBtn.addEventListener('click', showCartView);

  checkoutForm && checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cart.length) return;

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const notes = document.getElementById('custNotes').value.trim();

    let subtotal = 0;
    const lines = cart.map(item => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;
      return `• ${item.name} × ${item.qty} — ${fmt(lineTotal)}`;
    });
    const shipping = SHIPPING_FEE;
    const total = subtotal + shipping;

    const message =
`طلب جديد من موقع سدرة للعطور 🌸

*المنتجات:*
${lines.join('\n')}

الإجمالي الفرعي: ${fmt(subtotal)}
الشحن: ${fmt(shipping)}
*الإجمالي الكلي: ${fmt(total)}*

*بيانات العميل:*
الاسم: ${name}
الهاتف: ${phone}
العنوان: ${address}${notes ? `\nملاحظات: ${notes}` : ''}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');

    // reset after sending
    cart = [];
    saveCart(cart);
    renderCart();
    checkoutForm.reset();
    closeCart();
  });

  renderCart();
})();
