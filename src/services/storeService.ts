import { Product, Order, Coupon, StoreSettings } from '../types';
import { 
  DEFAULT_PRODUCTS, 
  DEFAULT_COUPONS, 
  DEFAULT_SETTINGS, 
  DEFAULT_ORDERS 
} from '../data/defaultCatalog';
import { 
  fetchRemoteProducts, 
  saveRemoteProducts, 
  fetchRemoteOrders, 
  saveRemoteOrders,
  subscribeRemoteChanges 
} from './firebaseService';

const STORAGE_KEYS = {
  PRODUCTS: 'lc_products_v2',
  DELETED_PRODUCTS: 'lc_deleted_product_ids_v2',
  ORDERS: 'lc_orders_v2',
  COUPONS: 'lc_coupons_v2',
  SETTINGS: 'lc_settings_v2',
};

// Permanent blocklist for any dummy demo products
const DUMMY_PRODUCT_IDS = new Set([
  'sf-01', 'sf-02', 'sf-03', 'sf-04', 'sf-05', 'sf-06',
  'sf-07', 'sf-08', 'sf-09', 'sf-10', 'sf-11', 'sf-12',
  'prod-earring-1', 'prod-earring-2', 'prod-earring-3', 'prod-earring-4', 'prod-earring-5',
  'prod-tshirt-1', 'prod-tshirt-2', 'prod-tshirt-3', 'prod-tshirt-4', 'prod-tshirt-5',
  'prod-lower-1', 'prod-lower-2', 'prod-lower-3', 'prod-lower-4', 'prod-lower-5'
]);

class StoreService {
  private listeners: (() => void)[] = [];
  private syncChannel: BroadcastChannel | null = null;
  private unsubscribeFirebase: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private getDeletedIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_PRODUCTS);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  private addDeletedId(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const s = this.getDeletedIds();
      s.add(id);
      localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(Array.from(s)));
    } catch {}
  }

  private removeDeletedId(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const s = this.getDeletedIds();
      if (s.has(id)) {
        s.delete(id);
        localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(Array.from(s)));
      }
    } catch {}
  }

  private setupSync() {
    if (typeof window === 'undefined') return;
    try {
      if ('BroadcastChannel' in window) {
        this.syncChannel = new BroadcastChannel('leovra_store_realtime_sync');
        this.syncChannel.onmessage = (evt) => {
          if (evt?.data?.type === 'STORE_MUTATION') {
            this.dispatchLocalListeners();
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync init:', e);
    }

    window.addEventListener('storage', (e) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        this.dispatchLocalListeners();
      }
    });

    window.addEventListener('leovra_store_event', () => {
      this.dispatchLocalListeners();
    });
  }

  private dispatchLocalListeners() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (err) { console.error('Store notification error:', err); }
    });
  }

  private async initFirebaseSync() {
    if (typeof window === 'undefined') return;
    try {
      // 1. Fetch remote products from Firebase Cloud Database
      const remoteProds = await fetchRemoteProducts();
      if (remoteProds !== null) {
        const deletedIds = this.getDeletedIds();
        const clean = remoteProds.filter(p => !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(clean));
        this.notify();
      }

      // 2. Fetch remote orders from Firebase Cloud Database
      const remoteOrders = await fetchRemoteOrders();
      if (remoteOrders !== null && remoteOrders.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remoteOrders));
        this.notify();
      }

      // 3. Connect real-time Firebase SSE across all devices worldwide
      if (this.unsubscribeFirebase) {
        this.unsubscribeFirebase();
      }
      this.unsubscribeFirebase = subscribeRemoteChanges(
        (updatedProds) => {
          const deletedIds = this.getDeletedIds();
          const clean = updatedProds.filter(p => !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(clean));
          this.notify();
        },
        (updatedOrders) => {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
          this.notify();
        }
      );
    } catch (e) {
      console.warn('Firebase cloud synchronization warning:', e);
    }
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const deletedIds = this.getDeletedIds();
      const existingProdsRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (existingProdsRaw !== null) {
        try {
          const parsed: Product[] = JSON.parse(existingProdsRaw);
          const cleaned = parsed.filter(p => p && !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleaned));
        } catch {
          const initial = DEFAULT_PRODUCTS.filter(p => !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initial));
        }
      } else {
        const initial = DEFAULT_PRODUCTS.filter(p => !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initial));
      }

      if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
      }

      const existingSettingsRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (existingSettingsRaw) {
        try {
          const s = JSON.parse(existingSettingsRaw);
          s.upiId = '7979968347@slc';
          s.supportPhone = '+91 79799 68347';
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
        } catch {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      }

      this.setupSync();
      this.initFirebaseSync();
    } catch (e) {
      console.warn('LocalStorage initialization warning:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notify() {
    this.dispatchLocalListeners();

    try {
      if (this.syncChannel) {
        this.syncChannel.postMessage({ type: 'STORE_MUTATION', timestamp: Date.now() });
      }
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('leovra_store_event'));
      } catch {}
    }
  }

  // ---------------- PRODUCTS ----------------
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const deletedIds = this.getDeletedIds();
      if (data !== null) {
        const parsed: Product[] = JSON.parse(data);
        return parsed.filter(p => p && !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
      }
      return DEFAULT_PRODUCTS.filter(p => !DUMMY_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id));
    } catch {
      return [];
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public saveProduct(product: Partial<Product> & { id?: string }): Product {
    if (product.id) {
      this.removeDeletedId(product.id);
    }
    const products = this.getProducts();
    const index = product.id ? products.findIndex(p => p.id === product.id) : -1;

    if (index > -1) {
      const updated: Product = { ...products[index], ...product } as Product;
      products[index] = updated;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
      saveRemoteProducts(products).catch(err => console.warn('Failed to sync product to Firebase:', err));
      return updated;
    } else {
      const newProd: Product = {
        id: product.id || `prod-${Date.now()}`,
        sku: product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        title: product.title || product.name || 'Untitled Product',
        name: product.title || product.name || 'Untitled Product',
        description: product.description || '',
        details: product.details || ['Handcrafted luxury quality', 'Durable and long-lasting'],
        price: Number(product.price) || 99,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        category: product.category || 'jewellery',
        subcategory: product.subcategory || 'Necklace',
        gender: product.gender || 'ladies',
        type: product.type || 'accessories',
        isNew: product.isNew ?? false,
        isBestseller: product.isBestseller ?? true,
        isActive: product.isActive ?? true,
        stock: Number(product.stock ?? 10),
        image: product.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        additionalImages: product.additionalImages || [],
        sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['Free Size'],
        colors: product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Gold', hex: '#d4af37' }],
        createdAt: new Date().toISOString()
      };
      products.unshift(newProd);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
      saveRemoteProducts(products).catch(err => console.warn('Failed to sync new product to Firebase:', err));
      return newProd;
    }
  }

  public deleteProduct(id: string): boolean {
    this.addDeletedId(id);
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    this.notify();
    saveRemoteProducts(filtered).catch(err => console.warn('Failed to delete on Firebase:', err));
    return true;
  }

  public toggleProductStatus(id: string): Product | undefined {
    const products = this.getProducts();
    const prod = products.find(p => p.id === id);
    if (prod) {
      prod.isActive = !prod.isActive;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
      saveRemoteProducts(products).catch(() => {});
      return prod;
    }
    return undefined;
  }

  // ---------------- ORDERS ----------------
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  public getOrderByNumber(orderNumber: string): Order | undefined {
    const clean = orderNumber.trim().toLowerCase();
    return this.getOrders().find(o => (o.orderNumber || '').toLowerCase() === clean);
  }

  public trackOrder(orderNumber: string, phone?: string): Order | undefined {
    const cleanNum = orderNumber.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    return this.getOrders().find(o => {
      const matchNum = (o.orderNumber || '').toLowerCase() === cleanNum;
      if (cleanPhone) {
        const orderPhone = (o.customer?.phone || o.customerPhone || '').replace(/\D/g, '').slice(-10);
        return matchNum || orderPhone === cleanPhone;
      }
      return matchNum;
    });
  }

  public createOrder(orderData: Partial<Order>): Order {
    const orders = this.getOrders();
    const date = new Date();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `LC-${date.getFullYear()}-${randomDigits}`;
    const invoiceNum = `INV-LC-${randomDigits}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      orderDate: date.toISOString(),
      customer: orderData.customer || {
        fullName: orderData.customerName || 'Customer',
        phone: orderData.customerPhone || '7979968347',
        address: orderData.customerAddress || 'Delivery address',
        city: orderData.customerCity || 'India'
      },
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      discount: Number(orderData.discount) || 0,
      couponCode: orderData.couponCode,
      deliveryCharge: Number(orderData.deliveryCharge) || 0,
      totalAmount: Number(orderData.totalAmount) || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: orderData.paymentMethod === 'upi' ? 'pending_verification' : 'collected',
      upiUtrNumber: orderData.upiUtrNumber,
      status: orderData.paymentMethod === 'upi' ? 'payment_pending' : 'order_placed',
      statusHistory: [
        {
          status: 'order_placed',
          timestamp: date.toISOString(),
          note: orderData.paymentMethod === 'upi' 
            ? `Order created with UPI Payment (7979968347@slc). UTR Reference: ${orderData.upiUtrNumber || 'Pending verification'}` 
            : 'Order created with Cash on Delivery (COD). Payment status: Pending collection at delivery.',
          updatedBy: 'Customer'
        }
      ],
      invoiceNumber: invoiceNum,
      invoiceDate: date.toISOString()
    };

    // Deduct stock
    const products = this.getProducts();
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();

    saveRemoteProducts(products).catch(() => {});
    saveRemoteOrders(orders).catch(() => {});
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string, 
    newStatus: string, 
    note?: string, 
    updatedBy: string = 'Admin',
    trackingId?: string,
    courierName: string = 'Blue Dart Express'
  ): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.status = newStatus;
    if (trackingId) {
      order.trackingId = trackingId;
      order.courierName = courierName;
      order.courierTrackingUrl = 'https://www.bluedart.com';
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`,
      updatedBy
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    saveRemoteOrders(orders).catch(() => {});
    return order;
  }

  public cancelOrder(orderId: string, reason: string = 'Customer request', by: string = 'Customer'): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.status = 'cancelled';
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: `Order cancelled. Reason: ${reason}`,
      updatedBy: by
    });

    // Restock items
    const products = this.getProducts();
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();

    saveRemoteProducts(products).catch(() => {});
    saveRemoteOrders(orders).catch(() => {});
    return order;
  }

  public requestReturn(orderNumber: string, reason: string, notes?: string): { success: boolean; message: string } {
    const orders = this.getOrders();
    const order = orders.find(o => (o.orderNumber || '').toLowerCase() === orderNumber.trim().toLowerCase());
    if (!order) {
      return { success: false, message: 'Order reference not found.' };
    }

    if (order.status !== 'delivered') {
      return { success: false, message: 'Return can only be initiated for delivered orders.' };
    }

    order.status = 'return_requested';
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'return_requested',
      timestamp: new Date().toISOString(),
      note: `Return initiated by customer. Reason: ${reason}${notes ? ` - ${notes}` : ''}`,
      updatedBy: 'Customer'
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    saveRemoteOrders(orders).catch(() => {});
    return { success: true, message: 'Return request submitted. Our team will verify and arrange reverse pickup.' };
  }

  // ---------------- COUPONS ----------------
  public getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  }

  public saveCoupon(coupon: Coupon): Coupon {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx > -1) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    this.notify();
    return coupon;
  }

  public deleteCoupon(id: string): boolean {
    const coupons = this.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    if (filtered.length !== coupons.length) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; coupon?: Coupon; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.getCoupons().find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, error: 'Invalid or inactive promotional code.' };
    }

    if (subtotal < coupon.minPurchaseAmount) {
      return { 
        valid: false, 
        discount: 0, 
        error: `Requires minimum order subtotal of Rs. ${coupon.minPurchaseAmount.toLocaleString()}.` 
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    return { valid: true, discount: Math.min(discount, subtotal), coupon };
  }

  // ---------------- SETTINGS ----------------
  public getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const s = JSON.parse(data);
        if (s.upiId === '9870168023@ptsbi') {
          s.upiId = '7979968347@slc';
          s.supportPhone = '+91 79799 68347';
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
        }
        return s;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public exportData(): string {
    return JSON.stringify({
      products: this.getProducts(),
      orders: this.getOrders(),
      coupons: this.getCoupons(),
      settings: this.getSettings()
    }, null, 2);
  }

  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.DELETED_PRODUCTS);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    this.notify();
  }
}

export const storeService = new StoreService();
