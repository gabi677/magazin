const SUPABASE_URL = 'https://khgzdumptkgoxnlgpvss.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3pkdW1wdGtnb3hubGdwdnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzY0NTYsImV4cCI6MjEwNTE1MjQ1Nn0.dh7pkwMrpLgJ5ENE_XYNXRdMn6cRe9L173F_RmrAZvw';

let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error("Supabase init error:", e);
}

let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

// Cele 20 de produse de probă cu imagini reale optimizate
const fallbackProducts = [
  { title: "Mini Aspirator Auto Portabil Wireless", price: 89, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80" },
  { title: "Dispozitiv Ultrasonic Anti-dăunători", price: 49, image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80" },
  { title: "Organizator Rotativ pentru Cosmetice", price: 65, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" },
  { title: "Suport Telefon Magnetic Auto Wireless", price: 119, image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80" },
  { title: "Aparat Portabil pentru Scame Textil", price: 55, image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80" },
  { title: "Mop Rotativ 360° cu Sistem de Stoarcere", price: 139, image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80" },
  { title: "Cameră de Supraveghere WiFi 360°", price: 149, image: "https://images.unsplash.com/photo-1557324232-b8917d7c3dcd?auto=format&fit=crop&w=600&q=80" },
  { title: "Mini Pompă Electrică Portabilă", price: 129, image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80" },
  { title: "Set 4 Benzi LED RGB Ambient Auto", price: 75, image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80" },
  { title: "Trusă Multifuncțională Scule 48-în-1", price: 99, image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80" },
  { title: "Perie Electrică Rotativă Curățenie", price: 85, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80" },
  { title: "Umidificator de Aer Ultrasonic", price: 69, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80" },
  { title: "Suport Ergonomic Pliabil Laptop", price: 59, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80" },
  { title: "Dispozitiv de Masaj Cervical", price: 115, image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80" },
  { title: "Dispozitiv Gătit Ouă la Abur", price: 79, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80" },
  { title: "Covoraș Antiderapant pentru Baie", price: 45, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" },
  { title: "Sistem Irigare Automată Ghivece (12 buc)", price: 60, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80" },
  { title: "Pătură Pufoasă Cocolino cu Mâneci", price: 125, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80" },
  { title: "Folie Solară Autocolantă Geamuri", price: 55, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" },
  { title: "Ochelari Clip-on Conducție Noaptea", price: 70, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80" }
];

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  loadProductsFromSupabase();
  initEvents();
  
  if (typeof window.loadAdminOrders === 'function') {
    setTimeout(window.loadAdminOrders, 1000);
  }
});

async function loadProductsFromSupabase() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let productsToDisplay = [];

  try {
    if (supabaseClient) {
      const { data: products, error } = await supabaseClient.from('products').select('*');
      if (!error && products && products.length > 0) {
        productsToDisplay = products;
      }
    }
  } catch (err) {
    console.warn("Nu s-au putut prelua produsele din Supabase, se folosesc cele de rezervă.");
  }

  // Dacă Supabase nu returnează nimic, folosim cele 20 de produse de probă
  if (productsToDisplay.length === 0) {
    productsToDisplay = fallbackProducts;
  }

  grid.innerHTML = productsToDisplay.map(product => {
    const title = (product.title || product.name || 'Produs').replace(/'/g, "\\'");
    const price = product.price || 0;
    let rawImage = product.image || product.image_url || 'https://picsum.photos/300/260';
    const imageMatch = rawImage.match(/https?:\/\/[^\s)\]]+/);
    const image = imageMatch ? imageMatch[0] : 'https://picsum.photos/300/260';

    return `
      <div class="product-card">
        <div class="product-image"><img src="${image}" alt="${title}"></div>
        <div class="product-info">
          <h3>${title}</h3>
          <div class="price">${price} Lei</div>
          <div class="product-actions">
            <button class="btn-outline" onclick="window.addToCart('${title}', ${price})">Adaugă în Coș</button>
            <button class="btn-primary" onclick="window.buyNowDirect('${title}', ${price})">Cumpără Acum</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initEvents() {
  document.getElementById('cartIcon')?.addEventListener('click', () => {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
  });
  document.getElementById('closeCart')?.addEventListener('click', () => {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
  });
  document.getElementById('cartOverlay')?.addEventListener('click', () => {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
  });
  document.getElementById('openCheckoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) { alert("Coșul este gol!"); return; }
    document.getElementById('checkoutModal')?.classList.add('open');
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
  });
  document.getElementById('closeCheckout')?.addEventListener('click', () => {
    document.getElementById('checkoutModal')?.classList.remove('open');
  });
  document.getElementById('submitOrderBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    executeOrderSubmission();
  });
}

window.addToCart = function(title, price) {
  const item = cart.find(i => i.title === title);
  if (item) item.quantity++;
  else cart.push({ title, price, quantity: 1 });
  updateCartUI();
  alert(`${title} a fost adăugat în coș!`);
};

window.buyNowDirect = function(title, price) {
  window.addToCart(title, price);
  document.getElementById('checkoutModal')?.classList.add('open');
};

function updateCartUI() {
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  const badge = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const container = document.getElementById('cartItemsContainer');

  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  if (badge) badge.innerText = count;
  if (totalEl) totalEl.innerText = `${total} Lei`;

  if (container) {
    if (cart.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">Coșul este gol.</p>';
    } else {
      container.innerHTML = cart.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
          <div>
            <div style="font-weight:500;">${i.title}</div>
            <div style="font-size:0.85rem; color:#666;">${i.price} Lei x ${i.quantity}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button onclick="window.changeQty(${idx}, -1)">-</button>
            <span>${i.quantity}</span>
            <button onclick="window.changeQty(${idx}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.changeQty = function(idx, delta) {
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  updateCartUI();
};

async function executeOrderSubmission() {
  if (cart.length === 0) { alert("Coșul este gol!"); return; }

  const name = document.getElementById('customerName')?.value.trim() || '';
  const phone = document.getElementById('customerPhone')?.value.trim() || '';
  const email = document.getElementById('customerEmail')?.value.trim() || 'Nespecificat';
  const city = document.getElementById('customerCity')?.value.trim() || '';
  const street = document.getElementById('customerStreet')?.value.trim() || '';
  const address = `${city}, ${street}`.trim() || 'Nespecificată';

  if (!name || !phone) { alert("Completează Numele și Telefonul!"); return; }

  const btn = document.getElementById('submitOrderBtn');
  if (btn) { btn.disabled = true; btn.innerText = "Se trimite..."; }

  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const productsSummary = cart.map(i => `${i.title} (x${i.quantity})`).join(', ');

  if (supabaseClient) {
    try {
      const { error: dbErr } = await supabaseClient.from('orders').insert([{
        customer_name: name,
        phone: phone,
        email: email,
        address: address,
        total: total,
        products_summary: productsSummary
      }]);

      if (dbErr) {
        console.error("Supabase Error:", dbErr);
        alert("A apărut o eroare la salvarea în baza de date: " + dbErr.message);
        if (btn) { btn.disabled = false; btn.innerText = "Trimite Comanda"; }
        return;
      }
    } catch (e) {
      console.error("Supabase Exception:", e);
      alert("A apărut o excepție. Verifică consola (F12).");
      if (btn) { btn.disabled = false; btn.innerText = "Trimite Comanda"; }
      return;
    }
  }

  cart = [];
  updateCartUI();
  document.getElementById('checkoutModal')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');

  if (btn) { btn.disabled = false; btn.innerText = "Trimite Comanda"; }

  alert("🎉 Comanda a fost înregistrată cu succes în baza de date!");

  if (typeof window.loadAdminOrders === 'function') {
    window.loadAdminOrders();
  }
}

window.loadAdminOrders = async function() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;

  if (!supabaseClient) {
    container.innerHTML = '<p style="color:red;">Clientul Supabase nu este inițializat.</p>';
    return;
  }

  try {
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Eroare la preluarea comenzilor:", error);
      return;
    }

    if (!orders || orders.length === 0) {
      container.innerHTML = '<p style="color:#888;">Nu există comenzi momentan.</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div style="background: #fff; border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong>👤 ${order.customer_name}</strong>
          <span style="background: #e2f0d9; color: #385723; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${order.total} Lei</span>
        </div>
        <div style="font-size: 0.9rem; color: #555; line-height: 1.5;">
          <div>📞 <strong>Telefon:</strong> ${order.phone}</div>
          <div>📍 <strong>Adresă:</strong> ${order.address}</div>
          <div>🛍️ <strong>Produse:</strong> ${order.products_summary || 'Nespecificate'}</div>
          <div style="font-size: 0.8rem; color: #888; margin-top: 6px;">🕒 ${new Date(order.created_at).toLocaleString('ro-RO')}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Excepție admin:", err);
  }
};
