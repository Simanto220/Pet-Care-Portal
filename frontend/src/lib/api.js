const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7000';

export function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const url = `${API_BASE}${path}`;
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (auth) {
    const token = getToken();
    if (token) init.headers['Authorization'] = `Bearer ${token}`;
  }
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(url, init);
  if (!res.ok) {
    let info;
    try { info = await res.json(); } catch {
      info = undefined;
    }
    throw new Error(info?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const careApi = {
  getServices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/care/services${query ? `?${query}` : ''}`, { auth: false });
  },
  getServiceById: (id) => apiFetch(`/api/care/services/${id}`, { auth: false }),
  getAvailableSlots: (serviceId, date) => 
    apiFetch(`/api/care/services/slots/available?serviceId=${serviceId}&date=${date}`, { auth: false }),
  bookAppointment: (appointmentData) => 
    apiFetch('/api/care/appointments', { method: 'POST', body: appointmentData }),
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/care/appointments${query ? `?${query}` : ''}`);
  },
  getUserAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/care/appointments${query ? `?${query}` : ''}`);
  },
  updateAppointmentStatus: (id, statusData) => 
    apiFetch(`/api/care/appointments/${id}`, { method: 'PUT', body: statusData }),
  seedServices: () => apiFetch('/api/care/services/seed', { method: 'POST' })
};

export const shopApi = {
  listProducts: () => apiFetch('/shop/products', { auth: false }),
  seedProducts: () => apiFetch('/shop/products/seed', { method: 'POST', auth: false }),
  seedProductsForce: () => apiFetch('/shop/products/seed?force=true', { method: 'POST', auth: false }),
  appendProducts: () => apiFetch('/shop/products/append', { method: 'POST', auth: false }),
  getCart: async () => {
    try {
      return await apiFetch('/shop/cart');
    } catch {
      // Local fallback
      const local = JSON.parse(localStorage.getItem('localCart') || '{"items":[]}');
      return local;
    }
  },
  // addToCart accepts either (productId, qty) or ({_id,name,price,image}, qty)
  addToCart: async (productOrId, quantity = 1) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId?._id;
    try {
      return await apiFetch('/shop/cart/add', { method: 'POST', body: { productId, quantity } });
    } catch {
      // Local fallback: store full product for UI
      let cart = JSON.parse(localStorage.getItem('localCart') || '{"items":[]}');
      if (!cart.items) cart.items = [];
      const p = typeof productOrId === 'object' ? productOrId : null;
      if (!p) throw new Error('Offline cart requires product object');
      const idx = cart.items.findIndex(i => i.product && i.product._id === p._id);
      if (idx === -1) cart.items.push({ product: p, quantity });
      else cart.items[idx].quantity += quantity;
      localStorage.setItem('localCart', JSON.stringify(cart));
      return cart;
    }
  },
  updateCart: async (productId, quantity) => {
    try {
      return await apiFetch('/shop/cart/update', { method: 'POST', body: { productId, quantity } });
    } catch {
      let cart = JSON.parse(localStorage.getItem('localCart') || '{"items":[]}');
      if (!cart.items) cart.items = [];
      const idx = cart.items.findIndex(i => i.product && i.product._id === productId);
      if (idx === -1) return cart;
      if (quantity <= 0) cart.items.splice(idx, 1);
      else cart.items[idx].quantity = quantity;
      localStorage.setItem('localCart', JSON.stringify(cart));
      return cart;
    }
  },
  clearCart: async () => {
    try {
      return await apiFetch('/shop/cart/clear', { method: 'POST' });
    } catch {
      const empty = { items: [] };
      localStorage.setItem('localCart', JSON.stringify(empty));
      return empty;
    }
  },
  createCheckout: async () => {
    try {
      return await apiFetch('/shop/checkout', { method: 'POST' });
    } catch {
      // Create a local order and return an object shape similar to backend
      const cart = JSON.parse(localStorage.getItem('localCart') || '{"items":[]}');
      const total = (cart.items || []).reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
      const orderId = `LOCAL-${Date.now()}`;
      let orders = JSON.parse(localStorage.getItem('localOrders') || '[]');
      orders.push({ orderId, items: cart.items || [], total, status: 'pending' });
      localStorage.setItem('localOrders', JSON.stringify(orders));
      // Clear cart on checkout like server (or wait until success? Keeping parallel)
      localStorage.setItem('localCart', JSON.stringify({ items: [] }));
      return { orderId, amount: total, paymentUrl: `/shop/payment?orderId=${orderId}` };
    }
  },
  paymentSuccess: async (orderId, txId) => {
    try {
      return await apiFetch('/shop/payment/success', { method: 'POST', body: { orderId, txId } });
    } catch {
      let orders = JSON.parse(localStorage.getItem('localOrders') || '[]');
      const idx = orders.findIndex(o => o.orderId === orderId);
      if (idx !== -1) {
        orders[idx].status = 'paid';
        orders[idx].transactionId = txId || `MOCK-${Date.now()}`;
        localStorage.setItem('localOrders', JSON.stringify(orders));
        return { message: 'Payment recorded', order: orders[idx] };
      }
      return { message: 'No local order found' };
    }
  },
  paymentFail: async (orderId) => {
    try {
      return await apiFetch('/shop/payment/fail', { method: 'POST', body: { orderId } });
    } catch {
      let orders = JSON.parse(localStorage.getItem('localOrders') || '[]');
      const idx = orders.findIndex(o => o.orderId === orderId);
      if (idx !== -1) {
        orders[idx].status = 'failed';
        localStorage.setItem('localOrders', JSON.stringify(orders));
        return { message: 'Marked as failed', order: orders[idx] };
      }
      return { message: 'No local order found' };
    }
  },
};
