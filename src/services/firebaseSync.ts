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

/**
 * Save products to Firebase Realtime Database.
 * This triggers real-time updates to all connected devices.
 */
export const saveRemoteProducts = async (products: Product[]): Promise<boolean> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteProducts error:', err);
    return false;
  }
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
 * Save orders to Firebase Realtime Database
 */
export const saveRemoteOrders = async (orders: Order[]): Promise<boolean> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/orders.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteOrders error:', err);
    return false;
  }
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
          const delay = Math.min(3000 * Math.pow(1.5, retryCount), 30000);
          retryCount++;
          setTimeout(connect, delay);
        }
      };
    } catch (err) {
      console.warn('[Firebase SSE] connect error:', err);
      if (!isClosed) {
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
          const delay = Math.min(3000 * Math.pow(1.5, retryCount), 30000);
          retryCount++;
          setTimeout(connect, delay);
        }
      };
    } catch (err) {
      console.warn('[Firebase SSE Orders] connect error:', err);
      if (!isClosed) {
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
