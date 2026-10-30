import { Product, Order, Coupon, StoreSettings } from '../types';
import { 
  DEFAULT_PRODUCTS, 
  DEFAULT_COUPONS, 
  DEFAULT_SETTINGS, 
  DEFAULT_ORDERS 
} from '../data/defaultCatalog';

const STORAGE_KEYS = {
  PRODUCTS: 'lc_products_v2',
  ORDERS: 'lc_orders_v2',
  COUPONS: 'lc_coupons_v2',
  SETTINGS: 'lc_settings_v2',
};

class StoreService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      }
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
    this.listeners.forEach(fn => {
      try { fn(); } catch (err) { console.error('Store notification error:', err); }
    });
  }

  // ---------------- PRODUCTS ----------------
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public saveProduct(product: Partial<Product> & { id?: string }): Product {
    const products = this.getProducts();
    const index = product.id ? products.findIndex(p => p.id === product.id) : -1;

    if (index > -1) {
      const updated: Product = { ...products[index], ...product } as Product;
      products[index] = updated;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
      return updated;
    } else {
      const newProd: Product = {
        id: product.id || `sf-${Date.now()}`,
        sku: product.sku || `SF-${Math.floor(1000 + Math.random() * 9000)}`,
        title: product.title || 'Untitled Product',
        description: product.description || '',
        details: product.details || ['100% Breathable Cotton', 'Reinforced seams', 'Streetwear standard fit'],
        price: Number(product.price) || 999,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        category: product.category || 'mens_tshirts',
        gender: product.gender || 'gents',
        type: product.type || 'tshirts',
        isNew: product.isNew ?? true,
        isBestseller: product.isBestseller ?? false,
        isActive: product.isActive ?? true,
        stock: Number(product.stock ?? 25),
        image: product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        additionalImages: product.additionalImages || [],
        sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
        colors: product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Navy Charcoal', hex: '#1e293b' }, { name: 'Pure White', hex: '#ffffff' }],
        createdAt: new Date().toISOString()
      };
      products.unshift(newProd);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
      return newProd;
    }
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const len = products.length;
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== len) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  public toggleProductStatus(id: string): Product | undefined {
    const products = this.getProducts();
    const prod = products.find(p => p.id === id);
    if (prod) {
      prod.isActive = !prod.isActive;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notify();
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
    return this.getOrders().find(o => o.orderNumber.toLowerCase() === clean);
  }

  public trackOrder(orderNumber: string, phone?: string): Order | undefined {
    const cleanNum = orderNumber.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    return this.getOrders().find(o => {
      const matchNum = o.orderNumber.toLowerCase() === cleanNum;
      if (cleanPhone) {
        const orderPhone = (o.customer?.phone || '').replace(/\D/g, '').slice(-10);
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
        fullName: 'Customer',
        phone: '9870168023',
        address: 'Delivery address',
        city: 'Delhi'
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
            ? `Order created with UPI Payment (9870168023@ptsbi). UTR Reference: ${orderData.upiUtrNumber || 'Pending verification'}` 
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

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`,
      updatedBy
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  public cancelOrder(orderId: string, reason: string = 'Customer request', by: string = 'Customer'): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.status = 'cancelled';
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
    return order;
  }

  public requestReturn(orderNumber: string, reason: string, notes?: string): { success: boolean; message: string } {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());
    if (!order) {
      return { success: false, message: 'Order reference not found.' };
    }

    if (order.status !== 'delivered') {
      return { success: false, message: 'Return can only be initiated for delivered orders.' };
    }

    order.status = 'return_requested';
    order.statusHistory.push({
      status: 'return_requested',
      timestamp: new Date().toISOString(),
      note: `Return initiated by customer. Reason: ${reason}${notes ? ` - ${notes}` : ''}`,
      updatedBy: 'Customer'
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
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
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
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
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    this.notify();
  }
}

export const storeService = new StoreService();
