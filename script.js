// Starea coșului de cumpărături
let cart = [];

// Selectare elemente din DOM
const cartBadge = document.querySelector('.cart-badge');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCountTitle = document.getElementById('cart-count-title');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  initSlideOnClick();
  createToastContainer();
});initCategoryFilters();

function initEvents() {
  // Deschidere / Închidere coș
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Evenimente butoane "Adaugă în coș"
  addToCartButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      const title = productCard.querySelector('h3').textContent;
      const priceText = productCard.querySelector('.current-price').textContent;
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const image = productCard.querySelector('.product-image img').src;

      addToCart({ id: title, title, price, image });
    });
  });
}

// Interacțiunea pentru butonul de Hero stil iPhone
function initSlideOnClick() {
  const sliderBtn = document.getElementById('slide-to-action');
  const handle = document.getElementById('slide-handle');

  if (!sliderBtn || !handle) return;

  sliderBtn.addEventListener('click', () => {
    const maxDistance = sliderBtn.clientWidth - handle.clientWidth - 8;

    // Animație de alunecare spre dreapta
    handle.style.left = `${maxDistance + 4}px`;

    // Derulare lină la produse
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);

    // Resetare buton înapoi la stânga după 1.2 secunde
    setTimeout(() => {
      handle.style.left = '4px';
    }, 1200);
  });
}

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

function addToCart(product) {
  const existingProduct = cart.find(item => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  showToast(`Adăugat în coș: <strong>${product.title}</strong>`);
}

function updateQuantity(id, change) {
  const product = cart.find(item => item.id === id);
  if (!product) return;

  product.quantity += change;

  if (product.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateCartUI() {
  // Calculare număr total articole
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartCountTitle) cartCountTitle.textContent = totalItems;

  // Animație scurtă pe badge
  if (cartBadge) {
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
  }

  // Calculare total preț
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cartTotalPrice) cartTotalPrice.textContent = `${total.toFixed(0)} Lei`;

  // Randare produse în sertar
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Coșul tău este gol.</p>';
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}">
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <span class="cart-item-price">${item.price} Lei</span>
          <div class="quantity-controls">
            <button onclick="updateQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `).join('');
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function createToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-content">
      <i data-lucide="check-circle" class="toast-icon"></i>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}// Apelare în DOMContentLoaded:
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  initSlideOnClick();
  initCategoryFilters(); // <-- ADAUGĂ ACEASTĂ LINIE
  createToastContainer();
});

// LOGICĂ FILTRARE CATEGORII
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Schimbă butonul activ
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-category');

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}function initCategoryFilters() { ... }