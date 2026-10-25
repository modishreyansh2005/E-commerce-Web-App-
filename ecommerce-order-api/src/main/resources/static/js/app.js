// Modern E-Commerce Storefront Application Logic (Production Level UI/UX)
const API_BASE = '/api';

// Curated High-Resolution Product Images Mapping
const PRODUCT_IMAGE_MAP = {
  'Sony WH-1000XM5 Wireless Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
  'Apple MacBook Air M3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80',
  'Logitech MX Master 3S Mouse': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=80',
  'Nespresso Vertuo Pop Coffee Maker': '/images/nespresso-vertuo.jpg',
  'Instant Pot Duo Plus 9-in-1': '/images/instant-pot-duo.jpg',
  'Apple Watch Ultra 2': '/images/apple-watch-ultra.jpg',
  'Bose QuietComfort Ultra Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80',
  'Garmin Fenix 7 Pro Solar': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80',
  'Dyson V15 Detect Cordless Vacuum': '/images/dyson-v15.jpg',
  'Breville Barista Touch Espresso Machine': '/images/breville-barista.jpg',
  'Philips Hue Smart Ambient Starter Kit': '/images/philips-hue.jpg',
  'Herman Miller Aeron Ergonomic Chair': '/images/herman-miller-aeron.jpg',
  'BenQ ScreenBar Halo Monitor Light': '/images/benq-screenbar.jpg',
  'Sony PlayStation 5 Slim Console': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80',
  'ASUS ROG Swift 32" 4K OLED Gaming Monitor': '/images/asus-rog-monitor.jpg',
  'Keychron Q1 Pro Wireless Mechanical Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
  'Apple iPad Pro 13-inch M4 OLED': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80',
  'Samsung Galaxy S24 Ultra 512GB': '/images/galaxy-s24-ultra.jpg',
  'Sonos Era 300 Spatial Audio Speaker': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80',
  'Ninja Professional Plus Kitchen Blender': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=700&q=80'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80';

// Application State
const state = {
  theme: localStorage.getItem('theme') || 'dark',
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  products: [],
  categories: [],
  selectedCategoryId: null,
  searchQuery: '',
  sortBy: 'featured',
  cart: { items: [], totalAmount: 0 },
  myOrders: [],
  adminOrders: [],
  // Quick Commerce (Blinkit / Zepto / Instamart) state:
  addresses: JSON.parse(localStorage.getItem('saved_addresses') || 'null') || [
    {
      id: 'addr-1',
      tag: 'Home',
      name: 'John Doe',
      phone: '+91 98765 43210',
      flat: 'Flat 402, Skyline Towers',
      street: '100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      pincode: '560038'
    },
    {
      id: 'addr-2',
      tag: 'Work',
      name: 'John Doe',
      phone: '+91 98765 43210',
      flat: 'Tech Hub Tower B, 4th Floor',
      street: 'Electronic City Phase 1',
      city: 'Bengaluru',
      pincode: '560100'
    }
  ],
  selectedAddressId: 'addr-1',
  selectedPaymentMethod: 'UPI',
  selectedTip: 0,
  deliveryInstructions: new Set(["Don't ring doorbell"]),
  activeOrderMetadata: JSON.parse(localStorage.getItem('order_metadata_map') || '{}'),
  trackingTimer: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  updateAuthUI();
  fetchProducts();
  if (state.token && state.user?.role === 'CUSTOMER') {
    fetchCart();
  }
});

// ==================== THEME MANAGEMENT ====================

function initTheme() {
  const current = localStorage.getItem('theme') || 'dark';
  state.theme = current;
  if (typeof syncThemeUI === 'function') {
    syncThemeUI(current);
  } else {
    document.documentElement.setAttribute('data-theme', current);
    document.documentElement.className = current;
    if (document.body) {
      document.body.setAttribute('data-theme', current);
      document.body.className = current;
    }
  }
}

function setAppTheme(mode) {
  const theme = (mode === 'light') ? 'light' : 'dark';
  state.theme = theme;
  if (typeof syncThemeUI === 'function') {
    syncThemeUI(theme);
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
      document.body.className = theme;
    }
    localStorage.setItem('theme', theme);
  }
}
window.setAppTheme = setAppTheme;

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = (current === 'dark') ? 'light' : 'dark';
  setAppTheme(next);
}
window.toggleTheme = toggleTheme;

// ==================== CUSTOM SORT DROPDOWN ====================

function initCustomSortDropdown() {
  const trigger = document.getElementById('sort-dropdown-btn');
  const menu = document.getElementById('sort-dropdown-menu');
  const label = document.getElementById('sort-dropdown-label');
  const hiddenSelect = document.getElementById('sort-select');

  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    trigger.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen);
  });

  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = item.getAttribute('data-value');
      const text = item.querySelector('span')?.textContent.trim() || item.textContent.trim();

      menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (label) {
        label.textContent = text.replace(/^[^\w\s]+\s*/, 'Sort: ');
      }
      if (hiddenSelect) {
        hiddenSelect.value = val;
      }
      state.sortBy = val;
      renderProducts();

      menu.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', () => {
    menu.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Initialize Custom Sort Dropdown
  initCustomSortDropdown();

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Hidden Select fallback if changed programmatically
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });

  // Cart Drawer open/close
  document.getElementById('btn-open-cart')?.addEventListener('click', openCart);
  document.getElementById('btn-close-cart')?.addEventListener('click', closeCart);
  document.getElementById('overlay')?.addEventListener('click', closeAllOverlays);

  // Auth Modal open/close
  document.getElementById('btn-open-auth')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btn-close-auth')?.addEventListener('click', closeAuthModal);

  // Tab switching inside Auth Modal
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const tab = e.target.dataset.tab;
      document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
      document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
    });
  });

  // Auth Forms submission
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);

  // Orders Modal
  document.getElementById('btn-my-orders')?.addEventListener('click', openOrdersModal);
  document.getElementById('btn-close-orders')?.addEventListener('click', closeOrdersModal);

  // Admin Modal
  document.getElementById('btn-admin-console')?.addEventListener('click', openAdminModal);
  document.getElementById('btn-close-admin')?.addEventListener('click', closeAdminModal);
  document.getElementById('admin-order-filter')?.addEventListener('change', (e) => fetchAdminOrders(e.target.value));
  document.getElementById('form-add-product')?.addEventListener('submit', handleCreateProduct);

  // Quick View Close
  document.getElementById('btn-close-quickview')?.addEventListener('click', closeQuickViewModal);

  // Logout button
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

  // Quick Commerce Instant Checkout (Blinkit/Zepto Flow)
  document.getElementById('btn-checkout')?.addEventListener('click', openCheckoutModal);
  document.getElementById('btn-close-checkout')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('btn-toggle-new-addr')?.addEventListener('click', toggleNewAddressForm);
  document.getElementById('btn-cancel-addr')?.addEventListener('click', toggleNewAddressForm);
  document.getElementById('btn-save-addr')?.addEventListener('click', saveNewAddress);

  // Live Tracking Modal
  document.getElementById('btn-close-tracking')?.addEventListener('click', closeLiveTracking);
  document.getElementById('btn-view-orders-from-track')?.addEventListener('click', () => {
    closeLiveTracking();
    openOrdersModal();
  });
  document.getElementById('btn-continue-shopping-from-track')?.addEventListener('click', closeLiveTracking);
}

// ==================== AUTHENTICATION ====================

function updateAuthUI() {
  const loggedOutNav = document.getElementById('nav-logged-out');
  const loggedInNav = document.getElementById('nav-logged-in');
  const userNameEl = document.getElementById('user-display-name');
  const userAvatarEl = document.getElementById('user-avatar-initial');
  const userRoleEl = document.getElementById('user-display-role');
  const btnAdmin = document.getElementById('btn-admin-console');
  const btnCart = document.getElementById('btn-open-cart');
  const btnOrders = document.getElementById('btn-my-orders');

  if (state.token && state.user) {
    if (loggedOutNav) loggedOutNav.style.display = 'none';
    if (loggedInNav) loggedInNav.style.display = 'flex';
    if (userNameEl) userNameEl.textContent = state.user.name;
    if (userAvatarEl) userAvatarEl.textContent = state.user.name.charAt(0).toUpperCase();
    if (userRoleEl) {
      userRoleEl.textContent = state.user.role;
      userRoleEl.className = 'role-badge ' + (state.user.role === 'ADMIN' ? 'admin' : '');
    }

    if (state.user.role === 'ADMIN') {
      if (btnAdmin) btnAdmin.style.display = 'inline-flex';
      if (btnCart) btnCart.style.display = 'none';
      if (btnOrders) btnOrders.style.display = 'none';
    } else {
      if (btnAdmin) btnAdmin.style.display = 'none';
      if (btnCart) btnCart.style.display = 'inline-flex';
      if (btnOrders) btnOrders.style.display = 'inline-flex';
    }
  } else {
    if (loggedOutNav) loggedOutNav.style.display = 'flex';
    if (loggedInNav) loggedInNav.style.display = 'none';
    if (btnAdmin) btnAdmin.style.display = 'none';
    if (btnCart) btnCart.style.display = 'inline-flex';
    if (btnOrders) btnOrders.style.display = 'none';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login credentials invalid');

    setAuthSession(data.token, data.user);
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    if (data.user.role === 'CUSTOMER') fetchCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    setAuthSession(data.token, data.user);
    closeAuthModal();
    showToast(`Welcome to ApexMart, ${data.user.name}!`, 'success');
    if (data.user.role === 'CUSTOMER') fetchCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

let currentLoginRole = 'customer';

const ROLE_PRESETS = {
  customer: {
    name: 'Customer Account',
    email: 'customer.demo@ecommerce.com',
    password: 'password123',
    icon: '🛍️',
    label: 'Customer Email Address',
    placeholder: 'customer.demo@ecommerce.com',
    buttonText: 'Sign In as Customer',
    tagText: 'Customer Mode'
  },
  admin: {
    name: 'Store Administrator',
    email: 'admin.demo@ecommerce.com',
    password: 'password123',
    icon: '🛡️',
    label: 'Administrator Email Address',
    placeholder: 'admin.demo@ecommerce.com',
    buttonText: 'Sign In as Administrator',
    tagText: 'Admin Mode'
  }
};

function selectLoginRole(role, autoPopulate = true) {
  currentLoginRole = role === 'admin' ? 'admin' : 'customer';
  const preset = ROLE_PRESETS[currentLoginRole];

  // Update role card highlights
  const custCard = document.getElementById('role-card-customer');
  const adminCard = document.getElementById('role-card-admin');
  if (custCard) custCard.classList.toggle('active', currentLoginRole === 'customer');
  if (adminCard) adminCard.classList.toggle('active', currentLoginRole === 'admin');

  // Update tag and banner
  const tag = document.getElementById('active-role-tag');
  if (tag) {
    tag.textContent = preset.tagText;
    tag.className = `role-pill-indicator ${currentLoginRole}`;
  }

  const banner = document.getElementById('role-hint-banner');
  if (banner) {
    banner.className = `role-hint-banner ${currentLoginRole}`;
  }

  const hintIcon = document.getElementById('role-hint-icon');
  if (hintIcon) hintIcon.textContent = preset.icon;

  const hintText = document.getElementById('role-hint-text');
  if (hintText) hintText.textContent = preset.name;

  const hintEmail = document.getElementById('role-hint-email');
  if (hintEmail) hintEmail.textContent = preset.email;

  // Update email input label & placeholder
  const label = document.getElementById('login-email-label');
  if (label) label.textContent = preset.label;

  const emailInput = document.getElementById('login-email');
  if (emailInput) {
    emailInput.placeholder = preset.placeholder;
    if (autoPopulate) emailInput.value = preset.email;
  }

  const passInput = document.getElementById('login-password');
  if (passInput && autoPopulate) {
    passInput.value = preset.password;
  }

  // Update submit button text
  const submitBtn = document.getElementById('btn-submit-login');
  if (submitBtn) submitBtn.textContent = preset.buttonText;
}

function autofillCurrentRole() {
  selectLoginRole(currentLoginRole, true);
}

function openAuthModalWithRole(role = 'customer') {
  openAuthModal('login');
  selectLoginRole(role, true);
}

function quickLogin(type) {
  const role = type === 'admin' ? 'admin' : 'customer';
  selectLoginRole(role, true);
  const form = document.getElementById('login-form');
  if (form) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}

function setAuthSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  updateAuthUI();
}

function handleLogout() {
  state.token = null;
  state.user = null;
  state.cart = { items: [], totalAmount: 0 };
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI();
  updateCartBadge();
  showToast('You have been logged out.', 'info');
}

// ==================== PRODUCT CATALOG ====================

function getProductImage(productName) {
  return PRODUCT_IMAGE_MAP[productName] || DEFAULT_IMAGE;
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?size=100`);
    const data = await res.json();
    state.products = data.content || [];

    // Extract unique categories
    const categoryMap = new Map();
    state.products.forEach(p => {
      if (p.category) {
        categoryMap.set(p.category.id, p.category.name);
      }
    });
    state.categories = Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));

    renderCategoryPills();
    renderProducts();
  } catch (err) {
    showToast('Failed to load catalog: ' + err.message, 'error');
  }
}

function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  container.innerHTML = `
    <button class="cat-pill active" onclick="selectCategory(null)">All Categories (${state.products.length})</button>
    ${state.categories.map(cat => {
      const count = state.products.filter(p => p.category?.id === cat.id).length;
      return `<button class="cat-pill" onclick="selectCategory(${cat.id})">${cat.name} (${count})</button>`;
    }).join('')}
  `;
}

function selectCategory(catId) {
  state.selectedCategoryId = catId;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  let filtered = [...state.products];

  // Category Filter
  if (state.selectedCategoryId) {
    filtered = filtered.filter(p => p.category?.id === state.selectedCategoryId);
  }

  // Search Filter
  if (state.searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(state.searchQuery) ||
      (p.description && p.description.toLowerCase().includes(state.searchQuery))
    );
  }

  // Sorting
  if (state.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3>No Products Found</h3>
        <p>Try searching for a different keyword or selecting a different category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const imageUrl = getProductImage(p.name);
    const stockClass = p.stockQuantity > 10 ? '' : (p.stockQuantity > 0 ? 'low' : 'out');
    const stockText = p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of Stock';

    return `
      <div class="product-card">
        <div class="card-media" onclick="openQuickView(${p.id})">
          <img class="product-img" src="${imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
          <span class="card-tag">${p.category?.name || 'Item'}</span>
          <span class="stock-tag ${stockClass}">${stockText}</span>
        </div>
        <div class="card-body">
          <div class="rating">★★★★★ <span>(4.9 • 180+ verified)</span></div>
          <h3 class="product-title" onclick="openQuickView(${p.id})">${escapeHtml(p.name)}</h3>
          <p class="product-desc">${escapeHtml(p.description || 'Premium engineered item with top performance.')}</p>
          <div class="card-footer">
            <div class="price-container">
              <span class="price-label">Price</span>
              <span class="price-val">$${p.price.toFixed(2)}</span>
            </div>
            <button class="btn-add-cart" onclick="addToCart(${p.id})" ${p.stockQuantity <= 0 ? 'disabled' : ''}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              ${p.stockQuantity <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
          ${state.user?.role === 'ADMIN' ? `
            <div class="admin-card-toolbar">
              <span style="font-weight:700; color:var(--warning);">⚙ Stock: ${p.stockQuantity}</span>
              <div style="display:flex; gap:0.35rem;">
                <button type="button" class="btn-stock-chip" onclick="event.stopPropagation(); quickAddStock(${p.id}, 10)" title="Add 10 to Stock">+10 Stock</button>
                <button type="button" class="btn-delete-item" onclick="event.stopPropagation(); deleteProductById(${p.id})" title="Delete Product">🗑️ Delete</button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ==================== PRODUCT QUICK VIEW ====================

function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickview-modal');
  const container = document.getElementById('quickview-content');
  const overlay = document.getElementById('overlay');
  if (!modal || !container) return;

  const imageUrl = getProductImage(product.name);

  container.innerHTML = `
    <div class="quickview-container">
      <img class="quickview-img" src="${imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
      <div class="quickview-details">
        <span class="role-badge" style="width: fit-content; margin-bottom: 0.5rem;">${product.category?.name || 'Category'}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="rating" style="margin-bottom: 0.75rem;">★★★★★ <span>(4.9 • Verified Buyer Ratings)</span></div>
        <div class="price">$${product.price.toFixed(2)}</div>
        <p>${escapeHtml(product.description || 'Precision-crafted hardware built with industry-standard materials.')}</p>
        <div style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 1.5rem;">
          ✓ Express 2-Day Delivery &nbsp;•&nbsp; ✓ 30-Day Moneyback Guarantee
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeQuickViewModal();" ${product.stockQuantity <= 0 ? 'disabled' : ''}>
          ${product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart & Checkout'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  overlay?.classList.add('open');
}

function closeQuickViewModal() {
  document.getElementById('quickview-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

// ==================== CART OPERATIONS ====================

async function fetchCart() {
  if (!state.token) return;

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      state.cart = await res.json();
      updateCartBadge();
      renderCartItems();
    }
  } catch (err) {
    console.error('Failed to load cart', err);
  }
}

async function addToCart(productId) {
  if (!state.token) {
    showToast('Please sign in or use 1-Click Demo Login first!', 'warning');
    openAuthModal('login');
    return;
  }

  if (state.user?.role !== 'CUSTOMER') {
    showToast('Only Customer accounts can shop. Switch to customer mode.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Could not add to cart');
    }

    showToast('Item added to cart!', 'success');
    await fetchCart();
    openCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeFromCart(cartItemId) {
  try {
    const res = await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    if (res.ok) {
      showToast('Item removed from cart', 'info');
      fetchCart();
    }
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  const totalCount = state.cart?.totalQuantity ?? (state.cart?.items ? state.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0);
  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? 'flex' : 'none';
}

function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const grandTotalEl = document.getElementById('cart-grand-total');
  const checkoutBtn = document.getElementById('btn-checkout');

  if (!container) return;

  if (!state.cart || !state.cart.items || state.cart.items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h4>Your Cart is Empty</h4>
        <p>Explore the store and add premium tech and home gear to your cart.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (grandTotalEl) grandTotalEl.textContent = '$0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  container.innerHTML = state.cart.items.map(item => {
    const name = item.product?.name || item.productName || 'Product';
    const unitPrice = Number(item.product?.price ?? item.unitPrice ?? 0);
    const subtotal = Number(item.subtotal ?? (unitPrice * (item.quantity || 1)) ?? item.totalPrice ?? 0);
    const thumbUrl = getProductImage(name);

    return `
      <div class="cart-item">
        <img class="cart-item-thumb" src="${thumbUrl}" alt="${escapeHtml(name)}" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
        <div class="cart-item-info">
          <h4>${escapeHtml(name)}</h4>
          <p>Qty: ${item.quantity || 1} × $${unitPrice.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <span class="cart-item-price">$${subtotal.toFixed(2)}</span>
          <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove item">✕</button>
        </div>
      </div>
    `;
  }).join('');

  const total = Number(state.cart.totalAmount || 0);
  if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
  if (grandTotalEl) grandTotalEl.textContent = `$${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

// ==================== CHECKOUT & ORDERS ====================

// ==================== QUICK COMMERCE (CHECKOUT & LIVE TRACKING) ====================

function renderAddressCards() {
  const container = document.getElementById('address-cards-container');
  if (!container) return;

  container.innerHTML = state.addresses.map(addr => {
    const isSelected = addr.id === state.selectedAddressId;
    return `
      <div class="address-card ${isSelected ? 'selected' : ''}" onclick="selectAddress('${addr.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="address-tag-pill">${addr.tag === 'Home' ? '🏠' : (addr.tag === 'Work' ? '🏢' : '📍')} ${escapeHtml(addr.tag)}</span>
          ${isSelected ? '<span style="color:var(--accent-primary); font-weight:800; font-size:0.82rem;">✓ Selected</span>' : ''}
        </div>
        <h5>${escapeHtml(addr.name)}</h5>
        <p>${escapeHtml(addr.flat)}, ${escapeHtml(addr.street)}</p>
        <p>${escapeHtml(addr.city)} - ${escapeHtml(addr.pincode)}</p>
        <span class="phone-text">📞 ${escapeHtml(addr.phone)}</span>
      </div>
    `;
  }).join('');
}
window.renderAddressCards = renderAddressCards;

function selectAddress(id) {
  state.selectedAddressId = id;
  renderAddressCards();
}
window.selectAddress = selectAddress;

function toggleNewAddressForm() {
  const formBox = document.getElementById('add-address-box');
  if (formBox) formBox.classList.toggle('open');
}
window.toggleNewAddressForm = toggleNewAddressForm;

function saveNewAddress() {
  const name = document.getElementById('new-addr-name')?.value.trim() || state.user?.name || 'Customer';
  const phone = document.getElementById('new-addr-phone')?.value.trim() || '+91 98765 43210';
  const flat = document.getElementById('new-addr-flat')?.value.trim();
  const street = document.getElementById('new-addr-street')?.value.trim();
  const city = document.getElementById('new-addr-city')?.value.trim() || 'Bengaluru';
  const pincode = document.getElementById('new-addr-pincode')?.value.trim() || '560001';
  const tag = document.getElementById('new-addr-tag')?.value || 'Home';

  if (!flat || !street) {
    showToast('Please enter Flat / Building and Street name', 'warning');
    return;
  }

  const newAddr = {
    id: 'addr-' + Date.now(),
    tag,
    name,
    phone,
    flat,
    street,
    city,
    pincode
  };

  state.addresses.push(newAddr);
  state.selectedAddressId = newAddr.id;
  localStorage.setItem('saved_addresses', JSON.stringify(state.addresses));

  // Reset inputs
  if (document.getElementById('new-addr-flat')) document.getElementById('new-addr-flat').value = '';
  if (document.getElementById('new-addr-street')) document.getElementById('new-addr-street').value = '';
  toggleNewAddressForm();
  renderAddressCards();
  showToast('New delivery address saved!', 'success');
}
window.saveNewAddress = saveNewAddress;

function toggleInstruction(pill) {
  const text = pill.dataset.instruction;
  if (!text) return;

  if (state.deliveryInstructions.has(text)) {
    state.deliveryInstructions.delete(text);
    pill.classList.remove('active');
  } else {
    state.deliveryInstructions.add(text);
    pill.classList.add('active');
  }
}
window.toggleInstruction = toggleInstruction;

function selectTip(amount, chip) {
  state.selectedTip = Number(amount);
  document.querySelectorAll('.tip-chip').forEach(c => c.classList.remove('selected'));
  if (chip) chip.classList.add('selected');
  updateCheckoutBill();
}
window.selectTip = selectTip;

function selectPaymentMethod(method, card) {
  state.selectedPaymentMethod = method;
  document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
  if (card) card.classList.add('selected');

  document.querySelectorAll('.pm-subview').forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(`pm-view-${method}`);
  if (activeView) activeView.classList.add('active');
}
window.selectPaymentMethod = selectPaymentMethod;

function updateCheckoutBill() {
  const itemsSubtotal = Number(state.cart?.totalAmount || 0);
  const handlingFee = itemsSubtotal > 0 ? 0.49 : 0;
  const tip = Number(state.selectedTip || 0);
  const grandTotal = itemsSubtotal + handlingFee + tip;

  const itemsTotalEl = document.getElementById('co-items-total');
  const handlingEl = document.getElementById('co-handling-fee');
  const tipEl = document.getElementById('co-tip-amount');
  const grandEl = document.getElementById('co-grand-total');
  const btnPayAmount = document.getElementById('btn-pay-amount');

  if (itemsTotalEl) itemsTotalEl.textContent = `$${itemsSubtotal.toFixed(2)}`;
  if (handlingEl) handlingEl.textContent = `$${handlingFee.toFixed(2)}`;
  if (tipEl) tipEl.textContent = `$${tip.toFixed(2)}`;
  if (grandEl) grandEl.textContent = `$${grandTotal.toFixed(2)}`;
  if (btnPayAmount) btnPayAmount.textContent = `$${grandTotal.toFixed(2)}`;
}
window.updateCheckoutBill = updateCheckoutBill;

function openCheckoutModal() {
  if (!state.token) {
    showToast('Please sign in or use 1-Click Demo Login to checkout!', 'warning');
    openAuthModal('login');
    return;
  }

  if (!state.cart?.items || state.cart.items.length === 0) {
    showToast('Your cart is empty. Add products before checking out!', 'warning');
    return;
  }

  closeCart();
  renderAddressCards();
  updateCheckoutBill();

  const modal = document.getElementById('checkout-modal');
  const overlay = document.getElementById('overlay');
  if (modal) modal.classList.add('open');
  if (overlay) overlay.classList.add('open');
}
window.openCheckoutModal = openCheckoutModal;

function closeCheckoutModal() {
  document.getElementById('checkout-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}
window.closeCheckoutModal = closeCheckoutModal;

async function executeOrderPlacement() {
  if (!state.token) return;

  const btnPay = document.getElementById('btn-confirm-place-order');
  if (btnPay) {
    btnPay.disabled = true;
    btnPay.innerHTML = '<span>⚡ Processing Instant Dark Store Order...</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');

    // Retrieve selected address
    const chosenAddress = state.addresses.find(a => a.id === state.selectedAddressId) || state.addresses[0];

    // Assign unique delivery partner, unique PIN, and dynamic ETA for this order
    const rider = getDeliveryPartnerForOrder(data.id);
    const pin = generateUniquePIN(data.id);
    const etaMinutes = 10 + (Number(data.id) % 5); // 10, 11, 12, 13, or 14 mins
    const placedAtMs = Date.now();

    const orderMeta = {
      orderId: data.id,
      address: chosenAddress,
      paymentMethod: state.selectedPaymentMethod,
      instructions: Array.from(state.deliveryInstructions).join(' • ') || 'Standard Doorstep Delivery',
      tip: state.selectedTip,
      pin: pin,
      riderName: rider.name,
      riderRating: rider.rating,
      riderVehicle: rider.vehicle,
      riderAvatar: rider.avatar,
      placedAtMs: placedAtMs,
      placedAt: new Date(placedAtMs).toISOString(),
      etaMinutes: etaMinutes
    };

    state.activeOrderMetadata[data.id] = orderMeta;
    localStorage.setItem('order_metadata_map', JSON.stringify(state.activeOrderMetadata));

    closeCheckoutModal();
    showToast(`Order #${data.id} placed! ${rider.name} is arriving in ${etaMinutes} mins.`, 'success');

    await fetchCart();
    await fetchProducts();

    openLiveTracking(data.id, data, orderMeta);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btnPay) {
      btnPay.disabled = false;
      const grandTotal = (Number(state.cart?.totalAmount || 0) + 0.49 + Number(state.selectedTip || 0)).toFixed(2);
      btnPay.innerHTML = `<span>Pay</span> <span id="btn-pay-amount">$${grandTotal}</span> <span>&amp; Place Order ⚡</span>`;
    }
  }
}
window.executeOrderPlacement = executeOrderPlacement;

// Pool of Diverse Delivery Partners (Zepto / Blinkit Quick Commerce Fleet)
const DELIVERY_PARTNERS = [
  { name: 'Ramesh Verma', rating: '4.95 ★', vehicle: 'Ather 450X Gen 3 (EV)', avatar: '🛵' },
  { name: 'Priya Sharma', rating: '4.98 ★', vehicle: 'Ola S1 Pro Gen 2 (EV)', avatar: '⚡' },
  { name: 'Vikram Singh', rating: '4.90 ★', vehicle: 'TVS iQube Electric', avatar: '🏍️' },
  { name: 'Mohammed Farhan', rating: '5.0 ★', vehicle: 'Bajaj Chetak EV', avatar: '🚀' },
  { name: 'Rohit Patel', rating: '4.88 ★', vehicle: 'Hero Electric Photon', avatar: '🛵' },
  { name: 'Ananya Deshmukh', rating: '4.96 ★', vehicle: 'River Indie EV', avatar: '⚡' },
  { name: 'Suresh Raina', rating: '4.92 ★', vehicle: 'Ampere Magnus EX', avatar: '🏍️' },
  { name: 'Kavita Joshi', rating: '4.97 ★', vehicle: 'Simple One EV', avatar: '🛵' }
];

function getDeliveryPartnerForOrder(orderId) {
  if (!orderId) {
    return DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];
  }
  const idNum = parseInt(String(orderId).replace(/\D/g, ''), 10) || 1;
  return DELIVERY_PARTNERS[idNum % DELIVERY_PARTNERS.length];
}
window.getDeliveryPartnerForOrder = getDeliveryPartnerForOrder;

function generateUniquePIN(orderId) {
  if (!orderId) {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
  const idNum = parseInt(String(orderId).replace(/\D/g, ''), 10) || 1;
  const seed = (idNum * 9301 + 49297) % 233280;
  return String(1000 + (seed % 9000));
}
window.generateUniquePIN = generateUniquePIN;

function setStepperStep(currentStep) {
  const step1 = document.getElementById('track-step-1');
  const step2 = document.getElementById('track-step-2');
  const step3 = document.getElementById('track-step-3');
  const step4 = document.getElementById('track-step-4');

  if (!step1 || !step2 || !step3 || !step4) return;

  // Step 1: Order Accepted
  step1.className = 'step-item completed';

  // Step 2: Packing Items
  if (currentStep >= 3) {
    step2.className = 'step-item completed';
  } else if (currentStep >= 2) {
    step2.className = 'step-item active';
  } else {
    step2.className = 'step-item';
  }

  // Step 3: Out for Delivery
  if (currentStep >= 4) {
    step3.className = 'step-item completed';
  } else if (currentStep >= 3) {
    step3.className = 'step-item active';
  } else {
    step3.className = 'step-item';
  }

  // Step 4: Delivered
  if (currentStep >= 4) {
    step4.className = 'step-item completed';
  } else {
    step4.className = 'step-item';
  }
}
window.setStepperStep = setStepperStep;

function openLiveTracking(orderId, orderData, meta) {
  if (!meta) {
    meta = state.activeOrderMetadata[orderId];
  }

  // If not found in localStorage or initialized, generate unique metadata for this order
  if (!meta) {
    const rider = getDeliveryPartnerForOrder(orderId);
    const pin = generateUniquePIN(orderId);
    const orderCreatedMs = orderData?.createdAt ? new Date(orderData.createdAt).getTime() : Date.now();
    const etaMinutes = 10 + ((Number(orderId) || 1) % 5);

    meta = {
      orderId: orderId,
      address: state.addresses[0],
      paymentMethod: 'UPI Instant Pay',
      instructions: "Don't ring doorbell",
      pin: pin,
      riderName: rider.name,
      riderRating: rider.rating,
      riderVehicle: rider.vehicle,
      riderAvatar: rider.avatar,
      placedAtMs: orderCreatedMs,
      placedAt: new Date(orderCreatedMs).toISOString(),
      etaMinutes: etaMinutes
    };

    state.activeOrderMetadata[orderId] = meta;
    localStorage.setItem('order_metadata_map', JSON.stringify(state.activeOrderMetadata));
  }

  const modal = document.getElementById('tracking-modal');
  const overlay = document.getElementById('overlay');
  if (modal) modal.classList.add('open');
  if (overlay) overlay.classList.add('open');

  // Elements
  const orderIdEl = document.getElementById('track-order-id');
  const pinEl = document.getElementById('track-delivery-pin');
  const riderAvatarEl = document.getElementById('track-rider-avatar');
  const riderNameEl = document.getElementById('track-rider-name');
  const riderDetailsEl = document.getElementById('track-rider-details');
  const subtitleEl = document.getElementById('track-subtitle');
  const addressTextEl = document.getElementById('track-address-text');
  const paymentTextEl = document.getElementById('track-payment-text');
  const instructionsTextEl = document.getElementById('track-instructions-text');
  const etaEl = document.getElementById('track-eta');

  // Update Rider & PIN Details dynamically
  if (orderIdEl) orderIdEl.textContent = `Order #${orderId} Confirmed!`;
  if (pinEl) pinEl.textContent = meta.pin || generateUniquePIN(orderId);
  if (riderAvatarEl) riderAvatarEl.textContent = meta.riderAvatar || '🛵';
  if (riderNameEl) riderNameEl.textContent = meta.riderName || 'Ramesh Verma';
  if (riderDetailsEl) riderDetailsEl.textContent = `${meta.riderRating || '4.9 ★'} • ${meta.riderVehicle || 'Ather 450X (EV)'}`;

  if (addressTextEl) {
    const a = meta.address;
    addressTextEl.textContent = a ? `${a.tag}: ${a.flat}, ${a.street}` : 'Home Address';
  }
  if (paymentTextEl) {
    const methodNames = {
      'UPI': '⚡ UPI Instant Pay',
      'CARD': '💳 Credit/Debit Card',
      'NETBANKING': '🏦 Net Banking',
      'COD': '💵 Cash on Delivery'
    };
    paymentTextEl.textContent = methodNames[meta.paymentMethod] || meta.paymentMethod || 'Paid Online';
  }
  if (instructionsTextEl) {
    instructionsTextEl.textContent = meta.instructions || 'Standard Doorstep Delivery';
  }

  // Clear any existing timer before starting fresh
  if (state.trackingTimer) {
    clearInterval(state.trackingTimer);
    state.trackingTimer = null;
  }

  // Calculate real elapsed time from the exact timestamp when order was placed
  const placedTimeMs = meta.placedAtMs || (meta.placedAt ? new Date(meta.placedAt).getTime() : Date.now());
  const totalWindowSeconds = (meta.etaMinutes || 12) * 60;

  function updateTicker() {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - placedTimeMs) / 1000));
    const remainingSeconds = Math.max(0, totalWindowSeconds - elapsedSeconds);

    if (remainingSeconds <= 0 || orderData?.status === 'DELIVERED') {
      if (etaEl) etaEl.textContent = 'Delivered to your doorstep! 🎉';
      if (subtitleEl) subtitleEl.textContent = `${meta.riderName} has safely handed over your parcel.`;
      setStepperStep(4);
      if (state.trackingTimer) {
        clearInterval(state.trackingTimer);
        state.trackingTimer = null;
      }
      return;
    }

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    if (etaEl) {
      etaEl.textContent = `Arriving in ${mins}:${secs < 10 ? '0' : ''}${secs} Mins`;
    }

    // Dynamic progression based on real elapsed time
    const ratio = elapsedSeconds / totalWindowSeconds;
    if (ratio < 0.25) {
      // 0 - 25%: Packing at dark store
      if (subtitleEl) subtitleEl.textContent = `${meta.riderName} is picking up your order from Apex Store`;
      setStepperStep(2);
    } else if (ratio < 0.85) {
      // 25% - 85%: Out for delivery
      if (subtitleEl) subtitleEl.textContent = `${meta.riderName} is on the way (${meta.riderVehicle})`;
      setStepperStep(3);
    } else {
      // 85% - 100%: Arriving at building
      if (subtitleEl) subtitleEl.textContent = `${meta.riderName} is arriving at your doorstep! Share PIN: ${meta.pin}`;
      setStepperStep(3.5);
    }
  }

  // Run immediately, then update every second
  updateTicker();
  state.trackingTimer = setInterval(updateTicker, 1000);
}
window.openLiveTracking = openLiveTracking;

function closeLiveTracking() {
  if (state.trackingTimer) {
    clearInterval(state.trackingTimer);
    state.trackingTimer = null;
  }
  document.getElementById('tracking-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}
window.closeLiveTracking = closeLiveTracking;

function openTrackForOrder(orderId) {
  closeOrdersModal();
  const orderObj = state.myOrders.find(o => o.id === orderId);
  const meta = state.activeOrderMetadata[orderId];
  openLiveTracking(orderId, orderObj, meta);
}
window.openTrackForOrder = openTrackForOrder;

async function openOrdersModal() {
  if (!state.token) return;
  const modal = document.getElementById('orders-modal');
  const overlay = document.getElementById('overlay');
  if (modal) modal.classList.add('open');
  if (overlay) overlay.classList.add('open');

  const container = document.getElementById('orders-list');
  container.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading your orders...</p>';

  try {
    const res = await fetch(`${API_BASE}/orders/mine`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    state.myOrders = data.content || [];
    renderOrdersList();
  } catch (err) {
    showToast('Failed to load orders', 'error');
  }
}

function renderOrdersList() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  if (state.myOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h4>No Orders Yet</h4>
        <p>When you place an order, its real-time shipping status will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.myOrders.map(order => {
    const meta = state.activeOrderMetadata[order.id];
    const addr = meta?.address;
    const addrText = addr ? `${addr.tag}: ${addr.flat}, ${addr.city}` : 'Home: Indiranagar, Bengaluru';
    const payText = meta?.paymentMethod ? `⚡ ${meta.paymentMethod} Pay` : 'Online Prepaid';

    return `
      <div class="order-card">
        <div class="order-header-flex">
          <span class="order-id">Order #${order.id}</span>
          <span class="order-status-badge status-${order.status}">${order.status}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.4rem;">
          Placed on: ${new Date(order.createdAt).toLocaleString()}
        </p>
        <div style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 0.6rem; display: flex; flex-direction: column; gap: 0.2rem;">
          <div>📍 <strong style="color:var(--text-main);">${escapeHtml(addrText)}</strong></div>
          <div>💳 Payment: <strong style="color:var(--success);">${escapeHtml(payText)}</strong></div>
        </div>
        <div style="margin-bottom: 0.75rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.5rem;">
          ${order.items.map(item => `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
              <span>${escapeHtml(item.productName || item.product?.name || 'Item')} (×${item.quantity})</span>
              <span style="font-weight:600;">$${Number(item.subtotal ?? ((item.unitPrice || item.product?.price || 0) * (item.quantity || 1)) ?? item.totalPrice ?? 0).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.5rem;">
          <div>
            <span style="font-size:0.8rem; color:var(--text-dim); display:block;">Total Paid</span>
            <span style="font-size:1.05rem; font-weight:800; color:var(--text-main);">$${order.totalAmount.toFixed(2)}</span>
          </div>
          <button class="btn btn-outline" style="font-size: 0.76rem; padding: 0.35rem 0.75rem; border-color: var(--success); color: var(--success); cursor:pointer;" onclick="openTrackForOrder(${order.id})">
            ⚡ Track Live
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== ADMIN CONSOLE ====================

// ==================== ADMIN CONSOLE & INVENTORY MANAGEMENT ====================

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  const overlay = document.getElementById('overlay');
  if (modal) modal.classList.add('open');
  if (overlay) overlay.classList.add('open');

  // Default to inventory tab
  switchAdminTab('inventory');
}
window.openAdminModal = openAdminModal;

function switchAdminTab(tabName, clickedBtn) {
  // Update tab buttons
  document.querySelectorAll('.admin-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });

  // Toggle tab contents
  const inventoryPanel = document.getElementById('admin-panel-inventory');
  const addProdPanel = document.getElementById('admin-panel-add-prod');
  const ordersPanel = document.getElementById('admin-panel-orders');

  if (inventoryPanel) inventoryPanel.style.display = tabName === 'inventory' ? 'block' : 'none';
  if (addProdPanel) addProdPanel.style.display = tabName === 'add-prod' ? 'block' : 'none';
  if (ordersPanel) ordersPanel.style.display = tabName === 'orders' ? 'block' : 'none';

  if (tabName === 'inventory') {
    renderAdminInventory();
  } else if (tabName === 'orders') {
    fetchAdminOrders();
  }
}
window.switchAdminTab = switchAdminTab;

function renderAdminInventory(filterText = '') {
  const container = document.getElementById('admin-products-list');
  const countEl = document.getElementById('admin-prod-count');
  if (countEl) countEl.textContent = state.products.length;
  if (!container) return;

  let list = [...state.products];
  if (filterText) {
    const q = filterText.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2rem; color: var(--text-dim);">
        <p>No products found matching "${escapeHtml(filterText)}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(p => {
    const imgUrl = getProductImage(p.name);
    const stockClass = p.stockQuantity > 10 ? 'good' : (p.stockQuantity > 0 ? 'low' : 'out');
    const stockText = p.stockQuantity > 10 ? `${p.stockQuantity} in stock` : (p.stockQuantity > 0 ? `Low: ${p.stockQuantity} units` : 'Out of Stock (0)');

    return `
      <div class="admin-prod-row">
        <div class="admin-prod-left">
          <img src="${imgUrl}" alt="${escapeHtml(p.name)}" class="admin-prod-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
          <div class="admin-prod-info">
            <h5>${escapeHtml(p.name)}</h5>
            <p>
              <span class="role-badge" style="font-size:0.68rem; padding:0.15rem 0.45rem;">${escapeHtml(p.category?.name || 'Item')}</span>
              <strong>$${p.price.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div class="admin-prod-actions">
          <span class="stock-badge-pill ${stockClass}">${stockText}</span>

          <!-- Quick Stock Increment Chips -->
          <div style="display:flex; align-items:center; gap:0.25rem;">
            <button type="button" class="btn-stock-chip" onclick="quickAddStock(${p.id}, 5)" title="Add 5 units">+5</button>
            <button type="button" class="btn-stock-chip" onclick="quickAddStock(${p.id}, 10)" title="Add 10 units">+10</button>
            <button type="button" class="btn-stock-chip" onclick="quickAddStock(${p.id}, 25)" title="Add 25 units">+25</button>
          </div>

          <!-- Custom Stock Input -->
          <div style="display:flex; align-items:center; gap:0.25rem;">
            <input type="number" id="adm-stock-input-${p.id}" style="width:52px; font-size:0.75rem; padding:0.2rem 0.35rem; border-radius:4px; border:1px solid var(--border-subtle); background:var(--bg-main); color:var(--text-main);" placeholder="+Qty" min="1">
            <button type="button" class="btn-stock-chip" onclick="addCustomStock(${p.id})">Add</button>
          </div>

          <!-- Delete Product Button -->
          <button type="button" class="btn-delete-item" onclick="deleteProductById(${p.id})" title="Delete from store catalog">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderAdminInventory = renderAdminInventory;

function filterAdminProducts(query) {
  renderAdminInventory(query);
}
window.filterAdminProducts = filterAdminProducts;

async function quickAddStock(productId, delta) {
  if (!state.token || state.user?.role !== 'ADMIN') {
    showToast('Unauthorized: Admin access required', 'error');
    return;
  }

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const newStock = Math.max(0, (product.stockQuantity || 0) + Number(delta));

  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description || 'Premium store item',
        price: product.price,
        stockQuantity: newStock,
        categoryId: product.category?.id || 1
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update stock');
    }

    const updated = await res.json();
    product.stockQuantity = updated.stockQuantity;

    showToast(`Stock updated: "${product.name}" now has ${updated.stockQuantity} units in stock!`, 'success');
    renderAdminInventory(document.getElementById('admin-search-prod')?.value || '');
    renderProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
window.quickAddStock = quickAddStock;

function addCustomStock(productId) {
  const input = document.getElementById(`adm-stock-input-${productId}`);
  if (!input) return;
  const qty = parseInt(input.value, 10);
  if (isNaN(qty) || qty <= 0) {
    showToast('Please enter a valid stock quantity greater than 0', 'warning');
    return;
  }
  input.value = '';
  quickAddStock(productId, qty);
}
window.addCustomStock = addCustomStock;

async function deleteProductById(productId) {
  if (!state.token || state.user?.role !== 'ADMIN') {
    showToast('Unauthorized: Admin access required', 'error');
    return;
  }

  const targetProd = state.products.find(p => p.id === productId);
  const prodName = targetProd ? targetProd.name : `Product #${productId}`;

  const confirmed = confirm(`Are you sure you want to permanently delete "${prodName}" from the store catalog?\n\nThis will remove it from all customer views.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    if (!res.ok && res.status !== 204) {
      let msg = 'Failed to delete product';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch (e) {}
      if (res.status === 500 || res.status === 409 || (msg && msg.toLowerCase().includes('constraint'))) {
        msg = `Cannot delete "${prodName}" because it is referenced in past customer orders.`;
      }
      throw new Error(msg);
    }

    // Remove from in-memory state
    state.products = state.products.filter(p => p.id !== productId);

    showToast(`Product "${prodName}" was deleted successfully!`, 'info');
    renderAdminInventory(document.getElementById('admin-search-prod')?.value || '');
    renderProducts();
    renderCategoryPills();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
window.deleteProductById = deleteProductById;

async function fetchAdminOrders(status = '') {
  const container = document.getElementById('admin-orders-list');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading customer orders...</p>';

  try {
    const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    state.adminOrders = data.content || [];
    renderAdminOrders();
  } catch (err) {
    showToast('Failed to fetch admin orders', 'error');
  }
}

function renderAdminOrders() {
  const container = document.getElementById('admin-orders-list');
  if (!container) return;

  if (state.adminOrders.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding: 1.5rem; color: var(--text-dim);">No orders found for this status.</p>';
    return;
  }

  container.innerHTML = state.adminOrders.map(order => `
    <div class="order-card">
      <div class="order-header-flex">
        <div>
          <span class="order-id">Order #${order.id}</span>
          <span style="font-size:0.8rem; color: var(--text-muted); margin-left: 0.5rem;">Total: $${order.totalAmount.toFixed(2)}</span>
        </div>
        <span class="order-status-badge status-${order.status}">${order.status}</span>
      </div>
      <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
        ${order.status === 'PLACED' ? `<button class="btn btn-primary" style="padding:0.35rem 0.8rem; font-size:0.75rem;" onclick="updateOrderStatus(${order.id}, 'confirm')">Confirm Order</button>` : ''}
        ${order.status === 'CONFIRMED' ? `<button class="btn btn-primary" style="padding:0.35rem 0.8rem; font-size:0.75rem;" onclick="updateOrderStatus(${order.id}, 'ship')">Ship Order</button>` : ''}
        ${order.status === 'SHIPPED' ? `<button class="btn btn-primary" style="padding:0.35rem 0.8rem; font-size:0.75rem;" onclick="updateOrderStatus(${order.id}, 'deliver')">Mark Delivered</button>` : ''}
        ${order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? `<button class="btn btn-outline" style="padding:0.35rem 0.8rem; font-size:0.75rem; color: var(--danger);" onclick="updateOrderStatus(${order.id}, 'cancel')">Cancel & Restock</button>` : ''}
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, action) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status?action=${action}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Status transition failed');
    }

    showToast(`Order #${orderId} marked as ${action}!`, 'success');
    fetchAdminOrders();
    fetchProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prod-name').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const stockQuantity = parseInt(document.getElementById('prod-stock').value, 10);
  const categoryId = parseInt(document.getElementById('prod-category').value, 10);
  const customImg = document.getElementById('prod-image-url')?.value.trim();

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ name, description, price, stockQuantity, categoryId })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create product');
    }

    const created = await res.json();

    if (customImg) {
      PRODUCT_IMAGE_MAP[name] = customImg;
      const customMap = JSON.parse(localStorage.getItem('custom_product_images') || '{}');
      customMap[name] = customImg;
      localStorage.setItem('custom_product_images', JSON.stringify(customMap));
    }

    showToast(`Product "${name}" added to catalog with ${stockQuantity} units!`, 'success');
    document.getElementById('form-add-product').reset();

    await fetchProducts();
    switchAdminTab('inventory');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== DRAWER & MODAL TOGGLES ====================

async function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
  if (state.token && state.user?.role === 'CUSTOMER') {
    await fetchCart();
  } else {
    renderCartItems();
  }
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  const overlay = document.getElementById('overlay');
  if (modal) modal.classList.add('open');
  if (overlay) overlay.classList.add('open');

  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
  if (regForm) regForm.style.display = tab === 'register' ? 'block' : 'none';

  if (tab === 'login') {
    selectLoginRole(currentLoginRole || 'customer', false);
  }
}

function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function closeOrdersModal() {
  document.getElementById('orders-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function closeAdminModal() {
  document.getElementById('admin-modal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function closeAllOverlays() {
  closeCart();
  closeAuthModal();
  closeOrdersModal();
  closeAdminModal();
  closeQuickViewModal();
  closeCheckoutModal();
  closeLiveTracking();
}

// ==================== UTILITIES ====================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : (type === 'error' ? '⚠' : (type === 'warning' ? '⚡' : 'ℹ'))}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
