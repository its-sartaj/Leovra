import { Product, Order } from '../types';

export const FIREBASE_DB_URL = 'https://leovra-9e869-default-rtdb.asia-southeast1.firebasedatabase.app';

/**
 * Fetch all products from Firebase Realtime Database
 */
export const fetchRemoteProducts = async (): Promise<Product[] | null> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.filter(Boolean);
    }
    if (typeof data === 'object') {
      return Object.values(data);
    }
    return null;
  } catch (err) {
    console.warn('[Firebase] fetchRemoteProducts error:', err);
    return null;
  }
};

// Rate-limiting and Request Coalescing Guards to prevent Firebase quota exhaustion & spam
let pendingProductsTimer: ReturnType<typeof setTimeout> | null = null;
let latestProductsPayload: Product[] | null = null;
let lastProductsWriteTime = 0;

let pendingOrdersTimer: ReturnType<typeof setTimeout> | null = null;
let latestOrdersPayload: Order[] | null = null;
let lastOrdersWriteTime = 0;

const MAX_PAYLOAD_SIZE = 500 * 1024; // 500 KB safety limit
const MIN_WRITE_INTERVAL_MS = 1500; // Minimum 1.5s between cloud writes to prevent DoS

/**
 * Execute actual HTTP PUT to Firebase for products with payload validation
 */
const executeSaveProducts = async (products: Product[]): Promise<boolean> => {
  try {
    const jsonStr = JSON.stringify(products);
    if (jsonStr.length > MAX_PAYLOAD_SIZE) {
      console.warn('[Security Shield] Rejected oversized products payload:', jsonStr.length);
      return false;
    }
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr,
    });
    lastProductsWriteTime = Date.now();
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteProducts error:', err);
    return false;
  }
};

/**
 * Save products to Firebase Realtime Database with anti-spam coalescing.
 * Protects Firebase against rapid bot loops by throttling writes to at most 1 every 1.5 seconds.
 */
export const saveRemoteProducts = async (products: Product[]): Promise<boolean> => {
  latestProductsPayload = products;
  const now = Date.now();
  const timeSinceLast = now - lastProductsWriteTime;

  if (timeSinceLast >= MIN_WRITE_INTERVAL_MS && !pendingProductsTimer) {
    return executeSaveProducts(products);
  }

  // Queue debounced write
  return new Promise<boolean>((resolve) => {
    if (pendingProductsTimer) {
      clearTimeout(pendingProductsTimer);
    }
    const delay = Math.max(200, MIN_WRITE_INTERVAL_MS - timeSinceLast);
    pendingProductsTimer = setTimeout(async () => {
      pendingProductsTimer = null;
      if (latestProductsPayload) {
        const ok = await executeSaveProducts(latestProductsPayload);
        resolve(ok);
      } else {
        resolve(false);
      }
    }, delay);
  });
};

/**
 * Fetch all customer orders from Firebase Realtime Database
 */
export const fetchRemoteOrders = async (): Promise<Order[] | null> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/orders.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.filter(Boolean);
    }
    if (typeof data === 'object') {
      return Object.values(data);
    }
    return null;
  } catch (err) {
    console.warn('[Firebase] fetchRemoteOrders error:', err);
    return null;
  }
};

/**
 * Execute actual HTTP PUT to Firebase for orders with payload validation
 */
const executeSaveOrders = async (orders: Order[]): Promise<boolean> => {
  try {
    const jsonStr = JSON.stringify(orders);
    if (jsonStr.length > MAX_PAYLOAD_SIZE) {
      console.warn('[Security Shield] Rejected oversized orders payload:', jsonStr.length);
      return false;
    }
    const res = await fetch(`${FIREBASE_DB_URL}/orders.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr,
    });
    lastOrdersWriteTime = Date.now();
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteOrders error:', err);
    return false;
  }
};

/**
 * Save orders to Firebase Realtime Database with anti-spam coalescing.
 */
export const saveRemoteOrders = async (orders: Order[]): Promise<boolean> => {
  latestOrdersPayload = orders;
  const now = Date.now();
  const timeSinceLast = now - lastOrdersWriteTime;

  if (timeSinceLast >= MIN_WRITE_INTERVAL_MS && !pendingOrdersTimer) {
    return executeSaveOrders(orders);
  }

  return new Promise<boolean>((resolve) => {
    if (pendingOrdersTimer) {
      clearTimeout(pendingOrdersTimer);
    }
    const delay = Math.max(200, MIN_WRITE_INTERVAL_MS - timeSinceLast);
    pendingOrdersTimer = setTimeout(async () => {
      pendingOrdersTimer = null;
      if (latestOrdersPayload) {
        const ok = await executeSaveOrders(latestOrdersPayload);
        resolve(ok);
      } else {
        resolve(false);
      }
    }, delay);
  });
};

/**
 * Real-time SSE listener using standard browser EventSource.
 * Connects directly to Firebase Realtime Database and receives instant push updates
 * when any product or stock changes from any device.
 */
export const subscribeRemoteProducts = (
  onUpdate: (products: Product[]) => void
): (() => void) => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;
  let retryCount = 0;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(`${FIREBASE_DB_URL}/products.json`);

      eventSource.addEventListener('put', (event: MessageEvent) => {
        retryCount = 0;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.path === '/') {
            if (Array.isArray(parsed.data)) {
              onUpdate(parsed.data.filter(Boolean));
            } else if (parsed.data && typeof parsed.data === 'object') {
              onUpdate(Object.values(parsed.data));
            }
          } else {
            // A specific child was updated, re-fetch full list
            fetchRemoteProducts().then((prods) => {
              if (prods && prods.length > 0) {
                onUpdate(prods);
              }
            });
          }
        } catch (e) {
          console.warn('[Firebase SSE] parse error:', e);
        }
      });

      eventSource.addEventListener('patch', () => {
        retryCount = 0;
        fetchRemoteProducts().then((prods) => {
          if (prods && prods.length > 0) {
            onUpdate(prods);
          }
        });
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          if (retryCount >= 15) {
            console.warn('[Firebase SSE] Max retries reached, pausing connection.');
            return;
          }
          const delay = Math.min(3000 * Math.pow(1.5, retryCount), 30000);
          retryCount++;
          setTimeout(connect, delay);
        }
      };
    } catch (err) {
      console.warn('[Firebase SSE] connect error:', err);
      if (!isClosed) {
        if (retryCount >= 15) return;
        const delay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
        retryCount++;
        setTimeout(connect, delay);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

/**
 * Real-time SSE listener for customer orders
 */
export const subscribeRemoteOrders = (
  onUpdate: (orders: Order[]) => void
): (() => void) => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;
  let retryCount = 0;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(`${FIREBASE_DB_URL}/orders.json`);

      eventSource.addEventListener('put', (event: MessageEvent) => {
        retryCount = 0;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.path === '/') {
            if (Array.isArray(parsed.data)) {
              onUpdate(parsed.data.filter(Boolean));
            } else if (parsed.data && typeof parsed.data === 'object') {
              onUpdate(Object.values(parsed.data));
            }
          } else {
            fetchRemoteOrders().then((ords) => {
              if (ords) onUpdate(ords);
            });
          }
        } catch (e) {
          console.warn('[Firebase SSE Orders] parse error:', e);
        }
      });

      eventSource.addEventListener('patch', () => {
        retryCount = 0;
        fetchRemoteOrders().then((ords) => {
          if (ords) onUpdate(ords);
        });
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          if (retryCount >= 15) {
            console.warn('[Firebase SSE Orders] Max retries reached, pausing connection.');
            return;
          }
          const delay = Math.min(3000 * Math.pow(1.5, retryCount), 30000);
          retryCount++;
          setTimeout(connect, delay);
        }
      };
    } catch (err) {
      console.warn('[Firebase SSE Orders] connect error:', err);
      if (!isClosed) {
        if (retryCount >= 15) return;
        const delay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
        retryCount++;
        setTimeout(connect, delay);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};
