// --- CONECTARE SUPABASE ---https://khgzdumptkgoxnlgpvss.supabase.co/rest/v1/
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3pkdW1wdGtnb3hubGdwdnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzY0NTYsImV4cCI6MjEwNTE1MjQ1Nn0.dh7pkwMrpLgJ5ENE_XYNXRdMn6cRe9L173F_RmrAZvw
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// --- CONECTARE SUPABASE ---
const SUPABASE_URL = 'https://abcdefghijklm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...';
// --- STARE APLICAȚIE (COS) ---
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

// --- EVENIMENT ÎNCĂRCARE PAGINĂ ---
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  initSlideOnClick();
  createToastContainer();
  updateCartUI();
  
  // Încărcăm produsele din Supabase
  fetchProductsFromSupabase();
});

// --- ÎNCĂRCARE PRODUSE DIN SUPABASE ---
async function fetchProductsFromSupabase() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Se încarcă produsele...</p>';

  try {
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('*');

    if (error) throw error;

    if (!products || products.length === 0) {
      grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nu există produse în baza de date. Adaugă câteva rânduri în Supabase!</p>';
      return;
    }

    renderProducts(products);
  } catch (err) {
    console.error('Eroare Supabase:', err);
    grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: red;">Eroare la conectarea cu baza de date. Verifică cheile API din script.js!</p>';
  }
}

// --- AFISARE PRODUSE ÎN HTML ---
function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = products.map(product => `
    <div class="product-card" data-category="${product.category || 'all'}">
      <div class="product-image">
        ${product.tag ? `<span class="tag tag-sale">${product.tag}</span>` : ''}
        <img src="${product.image}" alt="${product.title}">
        <button class="add-to-cart-btn" onclick="addToCartFromData('${product.title}', ${product.price})">
          <i data-lucide="shopping-cart"></i> Adaugă în Coș
        </button>
      </div>
      <div class="product-info">
        <span class="category">${product.category || 'General'}</span>
        <h3>${product.title}</h3>
        <div class="price">
          <span class="current-price">${product.price} Lei</span>
          ${product.old_price ? `<span class="old-price">${product.old_price} Lei</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
  initCategoryFilters(); // Re-activăm filtrele după afișare
}

// --- FILTRARE CATEGORII ---
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
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
}

// --- INTERACȚIUNE BUTON HERO (STYLE IPHONE SLIDE / CLICK) ---
function initSlideOnClick() {
  const track = document.getElementById('sliderTrack');
  const thumb = document.getElementById('sliderThumb');
  const productsSection = document.getElementById('products');
  
  if (!track || !thumb || !productsSection) return;

  function triggerAction() {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Click direct
  track.addEventListener('click', (e) => {
    if (e.target.closest('#sliderThumb')) return;
    triggerAction();
  });

  // Drag / Slide pe mobil și desktop
  let isDragging = false;
  let startX = 0;

  const onStart = (e) => {
    isDragging = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    const maxSlide = track.clientWidth - thumb.clientWidth - 8;

    if (deltaX > 0 && deltaX <= maxSlide) {
      thumb.style.transform = `translateX(${deltaX}px)`;
    }

    if (deltaX >= maxSlide - 5) {
      isDragging = false;
      thumb.style.transform = `translateX(${maxSlide}px)`;
      triggerAction();
      setTimeout(() => { thumb.style.transform = 'translateX(0)'; }, 1000);
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.style.transform = 'translateX(0)';
  };

  thumb.addEventListener('mousedown', onStart);
  thumb.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

// --- MANAGEMENT COȘ DE CUMPĂRĂTURI ---
function initEvents() {
  const cartIcon = document.getElementById('cartIcon');
  const closeCart = document.getElementById('closeCart');
  const cartDrawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');

  if (cartIcon && cartDrawer && overlay) {
    cartIcon.addEventListener('click', () => {
      cartDrawer.classList.add('open');
      overlay.classList.add('open');
    });
  }

  if (closeCart && cartDrawer && overlay) {
    closeCart.addEventListener('click', () => {
      cartDrawer.classList.remove('open');
      overlay.classList.remove('open');
    });

    overlay.addEventListener('click', () => {
      cartDrawer.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

function addToCartFromData(title, price) {
  const existingItem = cart.find(item => item.title === title);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ title, price, quantity: 1 });
  }

  updateCartUI();
  showToast(`${title} a fost adăugat în coș!`);
}

function updateCartUI() {
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  
  const cartBadge = document.getElementById('cartCount');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotal = document.getElementById('cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartBadge) cartBadge.innerText = totalItems;
  if (cartTotal) cartTotal.innerText = `${totalPrice} Lei`;

  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Coșul tău este gol.</p>';
    } else {
      cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <div class="cart-item-details">
            <h4>${item.title}</h4>
            <span class="cart-item-price">${item.price} Lei</span>
          </div>
          <div class="cart-item-controls">
            <button onclick="changeQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${index}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function createToastContainer() {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.cssText = 'background:#111;color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:0.9rem;';
  
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}