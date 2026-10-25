import { Product, Order, CustomerUser } from '../types';

let backendOnline = false;

export const isBackendOnline = () => backendOnline;

const ADMIN_TOKEN_KEY = 'leovra_admin_token_v1';

export const getAdminToken = (): string => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || 'leovra_sec_token_7979_k8v9';
  } catch {
    return 'leovra_sec_token_7979_k8v9';
  }
};

export const setAdminToken = (token: string): void => {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {}
};

/**
 * Verify admin passcode against backend and retrieve secure session token
 */
export const loginAdminApi = async (passcode: string): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ passcode: passcode.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.token) {
        setAdminToken(data.token);
        backendOnline = true;
        return { success: true, token: data.token };
      }
    }
  } catch {
    // If backend is offline (static hosting), fallback gracefully
  }

  // Fallback for static environments
  const clean = passcode.trim();
  if (clean === '7979' || clean === '7979968347' || clean.toLowerCase() === 'admin') {
    const fallbackToken = 'leovra_sec_token_7979_k8v9';
    setAdminToken(fallbackToken);
    return { success: true, token: fallbackToken };
  }
  return { success: false, error: 'Invalid admin passcode' };
};


/**
 * Check if the Express backend API is alive
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Backend offline / static hosting
  }
  backendOnline = false;
  return false;
};

/**
 * Fetch all products from Express backend
 */
export const fetchApiProducts = async (): Promise<Product[] | null> => {
  try {
    const res = await fetch('/api/products', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        backendOnline = true;
        return data;
      }
    }
  } catch {
    // Fallback to local / Firebase
  }
  return null;
};

/**
 * Save products catalog to Express backend (requires admin token)
 */
export const saveApiProducts = async (products: Product[]): Promise<boolean> => {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': getAdminToken(),
      },
      body: JSON.stringify(products),
    });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Offline / static
  }
  return false;
};

/**
 * Permanently delete a product on Express backend
 */
export const deleteApiProduct = async (productId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': getAdminToken() },
    });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Offline / static
  }
  return false;
};

/**
 * Fetch all orders from Express backend
 */
export const fetchApiOrders = async (): Promise<Order[] | null> => {
  try {
    const res = await fetch('/api/orders', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        backendOnline = true;
        return data;
      }
    }
  } catch {
    // Offline / static
  }
  return null;
};

/**
 * Post a new customer order to Express backend (deducts stock server-side)
 */
export const createApiOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.order) {
        backendOnline = true;
        return result.order;
      }
    }
  } catch {
    // Offline / static
  }
  return null;
};

/**
 * Update an order's status, AWB, or courier on Express backend
 */
export const updateApiOrder = async (
  orderId: string,
  updates: Partial<Order> & { restoreInventory?: boolean }
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Offline / static
  }
  return false;
};

/**
 * Delete an order permanently on Express backend
 */
export const deleteApiOrder = async (orderId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': getAdminToken() },
    });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Offline / static
  }
  return false;
};

/**
 * Delete all orders on Express backend (Clean dummy/test orders)
 */
export const clearAllApiOrders = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'x-admin-token': getAdminToken() },
    });
    if (res.ok) {
      backendOnline = true;
      return true;
    }
  } catch {
    // Offline / static
  }
  return false;
};

/**
 * Subscribe to real-time Server-Sent Events (SSE) from Express backend
 */
export const subscribeBackendSse = (
  onProductsUpdate: (products: Product[]) => void,
  onOrdersUpdate: (orders: Order[]) => void
): (() => void) => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;

  try {
    eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      backendOnline = true;
    };

    eventSource.onmessage = (event) => {
      try {
        if (!event.data || event.data.startsWith(':')) return;
        const msg = JSON.parse(event.data);
        if (msg.type === 'PRODUCTS_UPDATED' && Array.isArray(msg.payload)) {
          onProductsUpdate(msg.payload);
        } else if (msg.type === 'ORDERS_UPDATED' && Array.isArray(msg.payload)) {
          onOrdersUpdate(msg.payload);
        }
      } catch (err) {
        console.warn('[SSE Parse Error]:', err);
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      backendOnline = false;
      // Reconnect after 8 seconds if not explicitly closed
      if (!isClosed) {
        setTimeout(() => {
          if (!isClosed) {
            subscribeBackendSse(onProductsUpdate, onOrdersUpdate);
          }
        }, 8000);
      }
    };
  } catch {
    // Offline / unsupported
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};
