import { Product, Order } from '../types';

export const FIREBASE_DB_URL = 'https://leovra-9e869-default-rtdb.asia-southeast1.firebasedatabase.app';

// Blocklist for any dummy demo products
const DUMMY_PRODUCT_IDS = new Set([
  'sf-01', 'sf-02', 'sf-03', 'sf-04', 'sf-05', 'sf-06',
  'sf-07', 'sf-08', 'sf-09', 'sf-10', 'sf-11', 'sf-12',
  'prod-earring-1', 'prod-earring-2', 'prod-earring-3', 'prod-earring-4', 'prod-earring-5',
  'prod-tshirt-1', 'prod-tshirt-2', 'prod-tshirt-3', 'prod-tshirt-4', 'prod-tshirt-5',
  'prod-lower-1', 'prod-lower-2', 'prod-lower-3', 'prod-lower-4', 'prod-lower-5'
]);

/**
 * Normalizes a raw product object from Firebase or local storage
 */
export const normalizeProduct = (raw: any): Product | null => {
  if (!raw || typeof raw !== 'object' || !raw.id) return null;
  if (DUMMY_PRODUCT_IDS.has(raw.id) || raw.deletedAt) return null;

  const title = String(raw.title || raw.name || 'Untitled Product');
  const price = Number(raw.price) || 99;
  const originalPrice = raw.originalPrice ? Number(raw.originalPrice) : undefined;
  const image = String(
    raw.image || 
    (Array.isArray(raw.images) && raw.images[0]) || 
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'
  );

  let additionalImages: string[] = [];
  if (Array.isArray(raw.additionalImages)) {
    additionalImages = raw.additionalImages;
  } else if (Array.isArray(raw.images)) {
    additionalImages = raw.images.slice(1);
  }

  const sizes = Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ['Free Size'];
  const colors = Array.isArray(raw.colors) && raw.colors.length > 0 
    ? raw.colors 
    : [{ name: 'Standard', hex: '#121212' }];

  let category = String(raw.category || 'jewellery').toLowerCase();
  if (category === 'earrings' || category === 'earring') category = 'jewellery';
  if (category === 'lowers' || category === 'lower') category = 'mens_lowers';
  if (category === 'tshirts' || category === 'tshirt') category = 'mens_tshirts';

  return {
    id: String(raw.id),
    sku: raw.sku || `SKU-${String(raw.id).slice(-6)}`,
    title,
    name: title,
    price,
    originalPrice,
    category,
    subcategory: raw.subcategory,
    gender: raw.gender || 'unisex',
    type: raw.type || 'apparel',
    isNew: raw.isNew ?? true,
    isBestseller: raw.isBestseller ?? true,
    isActive: raw.isActive ?? !raw.isOutOfStock ?? true,
    stock: typeof raw.stock === 'number' ? raw.stock : 10,
    image,
    additionalImages,
    sizes,
    colors,
    description: raw.description || '',
    details: Array.isArray(raw.details) ? raw.details : ['Premium craftsmanship', 'Guaranteed quality'],
    createdAt: raw.createdAt || new Date().toISOString()
  };
};

/**
 * Fetch all products from Firebase Cloud Database
 */
export const fetchRemoteProducts = async (): Promise<Product[] | null> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data === null) return []; // Empty database
    if (data.error) return null;

    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data.filter(Boolean);
    } else if (typeof data === 'object') {
      list = Object.values(data);
    }

    const normalized = list
      .map(normalizeProduct)
      .filter((p): p is Product => p !== null);

    return normalized;
  } catch (err) {
    console.warn('[Firebase] fetchRemoteProducts error:', err);
    return null;
  }
};

/**
 * Save all products to Firebase Cloud Database (replaces /products.json)
 */
export const saveRemoteProducts = async (products: Product[]): Promise<boolean> => {
  try {
    const clean = products.filter(p => !DUMMY_PRODUCT_IDS.has(p.id));
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clean)
    });
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteProducts error:', err);
    return false;
  }
};

/**
 * Fetch all customer orders from Firebase Cloud Database
 */
export const fetchRemoteOrders = async (): Promise<Order[] | null> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/orders.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data === null) return [];
    if (data.error) return null;

    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data.filter(Boolean);
    } else if (typeof data === 'object') {
      list = Object.values(data);
    }

    const orders: Order[] = list
      .filter(o => o && typeof o === 'object' && o.id)
      .map(o => ({
        id: String(o.id),
        orderNumber: String(o.orderNumber || o.id),
        orderDate: o.orderDate || o.createdAt || new Date().toISOString(),
        customer: o.customer || {
          fullName: o.customerName || 'Customer',
          phone: o.customerPhone || '7979968347',
          address: o.customerAddress || 'Address',
          city: o.customerCity || 'City',
          pincode: o.customerPincode
        },
        items: Array.isArray(o.items) ? o.items : [],
        subtotal: Number(o.subtotal) || Number(o.totalAmount) || 0,
        discount: Number(o.discount) || 0,
        couponCode: o.couponCode,
        deliveryCharge: Number(o.deliveryCharge) || 0,
        totalAmount: Number(o.totalAmount) || 0,
        paymentMethod: o.paymentMethod || 'cod',
        paymentStatus: o.paymentStatus || 'pending',
        upiUtrNumber: o.upiUtrNumber,
        status: o.status || 'order_placed',
        statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
        trackingId: o.trackingId || o.awbCode,
        courierName: o.courierName,
        courierTrackingUrl: o.courierTrackingUrl
      }));

    return orders;
  } catch (err) {
    console.warn('[Firebase] fetchRemoteOrders error:', err);
    return null;
  }
};

/**
 * Save all customer orders to Firebase Cloud Database (replaces /orders.json)
 */
export const saveRemoteOrders = async (orders: Order[]): Promise<boolean> => {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/orders.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    });
    return res.ok;
  } catch (err) {
    console.warn('[Firebase] saveRemoteOrders error:', err);
    return false;
  }
};

/**
 * Real-time SSE listener for instant cross-device push notifications
 */
export const subscribeRemoteChanges = (
  onProductsUpdate: (products: Product[]) => void,
  onOrdersUpdate: (orders: Order[]) => void
): (() => void) => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  let productsSource: EventSource | null = null;
  let ordersSource: EventSource | null = null;
  let isClosed = false;

  const connectProducts = () => {
    if (isClosed) return;
    try {
      productsSource = new EventSource(`${FIREBASE_DB_URL}/products.json`);
      productsSource.addEventListener('put', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.path === '/') {
            let list: any[] = [];
            if (Array.isArray(parsed.data)) list = parsed.data.filter(Boolean);
            else if (typeof parsed.data === 'object' && parsed.data !== null) list = Object.values(parsed.data);
            const prods = list.map(normalizeProduct).filter((p): p is Product => p !== null);
            onProductsUpdate(prods);
          } else {
            fetchRemoteProducts().then(prods => {
              if (prods) onProductsUpdate(prods);
            });
          }
        } catch {}
      });
      productsSource.onerror = () => {
        if (productsSource) {
          productsSource.close();
          productsSource = null;
        }
        if (!isClosed) setTimeout(connectProducts, 8000);
      };
    } catch {}
  };

  const connectOrders = () => {
    if (isClosed) return;
    try {
      ordersSource = new EventSource(`${FIREBASE_DB_URL}/orders.json`);
      ordersSource.addEventListener('put', () => {
        fetchRemoteOrders().then(ords => {
          if (ords) onOrdersUpdate(ords);
        });
      });
      ordersSource.onerror = () => {
        if (ordersSource) {
          ordersSource.close();
          ordersSource = null;
        }
        if (!isClosed) setTimeout(connectOrders, 8000);
      };
    } catch {}
  };

  connectProducts();
  connectOrders();

  return () => {
    isClosed = true;
    if (productsSource) {
      productsSource.close();
      productsSource = null;
    }
    if (ordersSource) {
      ordersSource.close();
      ordersSource = null;
    }
  };
};
