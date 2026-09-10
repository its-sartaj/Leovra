import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product, CartItem, Order, FilterOptions, CustomerUser } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  fetchRemoteProducts, 
  saveRemoteProducts, 
  fetchRemoteOrders, 
  saveRemoteOrders,
  subscribeRemoteProducts,
  subscribeRemoteOrders 
} from '../services/firebaseSync';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSideNavOpen: boolean;
  setIsSideNavOpen: (open: boolean) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;

  // Customer Account & Profile
  currentCustomer: CustomerUser | null;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  accountModalTab: 'login' | 'register' | 'profile' | 'orders';
  setAccountModalTab: (tab: 'login' | 'register' | 'profile' | 'orders') => void;
  registerCustomer: (name: string, phone: string, email?: string, address?: string, city?: string) => { success: boolean; message: string };
  loginCustomer: (phone: string, name?: string) => { success: boolean; message: string };
  logoutCustomer: () => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  customerOrders: Order[];
  
  // Admin authentication for separated panel
  isAdminLoggedIn: boolean;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;

  // Real-time inventory operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  toggleStockStatus: (id: string) => void;
  updateStockQuantity: (id: string, quantity: number) => void;
  resetInventoryToDefaults: () => void;

  // Cart operations
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Checkout & Orders
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity?: string;
    paymentMethod: 'Cash on Delivery' | 'UPI / Direct Call';
  }) => Order;
  generateWhatsAppOrderUrl: (orderItems?: CartItem[], customerInfo?: { name: string; phone: string; address: string }) => string;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Company info
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

const STORAGE_KEY_PRODUCTS = 'leovra_products_v1';
const STORAGE_KEY_PRODUCTS_VER = 'leovra_products_ver_v1';
const STORAGE_KEY_CART = 'leovra_cart_v1';
const STORAGE_KEY_ORDERS = 'leovra_orders_v1';
const STORAGE_KEY_ORDERS_VER = 'leovra_orders_ver_v1';
const STORAGE_KEY_ADMIN_AUTH = 'leovra_admin_auth_v1';
const STORAGE_KEY_CUSTOMER = 'leovra_customer_user_v1';
const STORAGE_KEY_ALL_CUSTOMERS = 'leovra_all_customers_v1';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const businessName = 'Leovra Enterprises';
  const businessPhone = '7979968347';
  const businessEmail = 'support@leovraenterprises.com';

  // Check URL initially for dedicated admin route (e.g. #admin or /admin or ?admin=true)
  const isInitialAdminRoute = typeof window !== 'undefined' && (
    window.location.hash.toLowerCase().includes('admin') ||
    window.location.pathname.toLowerCase().includes('/admin') ||
    window.location.search.toLowerCase().includes('admin')
  );

  const [currentView, setCurrentViewState] = useState<'store' | 'admin'>(
    isInitialAdminRoute ? 'admin' : 'store'
  );

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const setCurrentView = useCallback((view: 'store' | 'admin') => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        if (!window.location.hash.toLowerCase().includes('admin')) {
          window.location.hash = 'admin';
        }
      } else {
        if (window.location.hash.toLowerCase().includes('admin')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  }, []);

  // Listen for hash / history changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || pathname.includes('/admin') || search.includes('admin')) {
        setCurrentViewState('admin');
      } else {
        setCurrentViewState('store');
      }
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Admin Login (PIN: 7979 or admin)
  const loginAdmin = useCallback((passcode: string): boolean => {
    const clean = passcode.trim();
    if (clean === '7979' || clean.toLowerCase() === 'admin' || clean === '7979968347') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    } catch {
      // ignore
    }
    setCurrentView('store');
  }, [setCurrentView]);

  // Initialize products from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [accountModalTab, setAccountModalTab] = useState<'login' | 'register' | 'profile' | 'orders'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Customer Account state
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOMER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allCustomers, setAllCustomers] = useState<CustomerUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALL_CUSTOMERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const registerCustomer = useCallback((
    name: string,
    phone: string,
    email?: string,
    address?: string,
    city?: string
  ) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (cleanPhone.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const existing = allCustomers.find(c => c.phone === cleanPhone);
    const customer: CustomerUser = {
      id: existing ? existing.id : 'CUST-' + Date.now(),
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || '',
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    const updatedAll = existing 
      ? allCustomers.map(c => c.phone === cleanPhone ? customer : c)
      : [...allCustomers, customer];

    setAllCustomers(updatedAll);
    setCurrentCustomer(customer);
    try {
      localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(updatedAll));
      localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(customer));
    } catch (e) {
      console.error(e);
    }
    showToast(`Welcome, ${customer.name}! Account created.`);
    return { success: true, message: 'Account created successfully!' };
  }, [allCustomers, showToast]);

  const loginCustomer = useCallback((phone: string, name?: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const found = allCustomers.find(c => c.phone === cleanPhone);
    if (found) {
      setCurrentCustomer(found);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(found));
      } catch (e) {
        console.error(e);
      }
      showToast(`Welcome back, ${found.name}!`);
      return { success: true, message: 'Logged in successfully!' };
    } else {
      // Check if user has past orders with this phone number
      const pastOrder = orders.find(o => (o.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone);
      if (pastOrder || name) {
        const customerName = name?.trim() || pastOrder?.customerName || 'Customer';
        const newCust: CustomerUser = {
          id: 'CUST-' + Date.now(),
          name: customerName,
          phone: cleanPhone,
          address: pastOrder?.customerAddress || '',
          city: pastOrder?.customerCity || '',
          createdAt: new Date().toISOString()
        };
        const updatedAll = [...allCustomers, newCust];
        setAllCustomers(updatedAll);
        setCurrentCustomer(newCust);
        try {
          localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(updatedAll));
          localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(newCust));
        } catch (e) {
          console.error(e);
        }
        showToast(`Welcome, ${newCust.name}! Logged in.`);
        return { success: true, message: 'Account logged in!' };
      }

      return { 
        success: false, 
        message: 'No account found with this number. Please register your account.' 
      };
    }
  }, [allCustomers, orders, showToast]);

  const logoutCustomer = useCallback(() => {
    setCurrentCustomer(null);
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOMER);
    } catch (e) {
      console.error(e);
    }
    showToast('Logged out of customer account.');
  }, [showToast]);

  const updateCustomerProfile = useCallback((updates: Partial<CustomerUser>) => {
    if (!currentCustomer) return;
    const updated: CustomerUser = { ...currentCustomer, ...updates };
    setCurrentCustomer(updated);
    const updatedAll = allCustomers.map(c => c.id === updated.id ? updated : c);
    setAllCustomers(updatedAll);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(updatedAll));
    } catch (e) {
      console.error(e);
    }
    showToast('Profile updated successfully!');
  }, [currentCustomer, allCustomers, showToast]);

  // Customer orders: ONLY show orders that this customer purchased!
  const customerOrders = useMemo(() => {
    if (!currentCustomer) return [];
    const custPhone = currentCustomer.phone.replace(/\D/g, '').slice(-10);
    return orders.filter(o => {
      const orderPhone = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
      return (orderPhone && orderPhone === custPhone) || (o.customerId && o.customerId === currentCustomer.id);
    });
  }, [currentCustomer, orders]);

  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    searchQuery: '',
    sortBy: 'featured',
    inStockOnly: false,
  });

  // Persistent refs for reliable cross-tab/window real-time synchronization
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const currentVersionRef = useRef<number>(Date.now());

  // Persist products and broadcast to other tabs + Firebase Realtime Database for GLOBAL REAL-TIME synchronization
  const saveProducts = useCallback((newProducts: Product[], skipBroadcast = false) => {
    const newVersion = Date.now();
    currentVersionRef.current = newVersion;
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
      localStorage.setItem(STORAGE_KEY_PRODUCTS_VER, String(newVersion));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    // 1. Cloud Sync: Send to Firebase Realtime Database (syncs to all devices across internet)
    saveRemoteProducts(newProducts).catch((err) => {
      console.warn('[Firebase] Save products error:', err);
    });

    // 2. Send via persistent BroadcastChannel (for instant same-browser tabs)
    if (!skipBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ 
          type: 'PRODUCTS_UPDATED', 
          payload: newProducts, 
          version: newVersion, 
          timestamp: newVersion 
        });
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }

    // 3. Dispatch custom event for same-window / iframe components
    if (!skipBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('leovra_sync_products', { 
        detail: { payload: newProducts, version: newVersion } 
      }));
    }
  }, []);

  // Persist orders and broadcast to other tabs + Firebase Realtime Database
  const saveOrders = useCallback((newOrders: Order[], skipBroadcast = false) => {
    const newVersion = Date.now();
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(newOrders));
      localStorage.setItem(STORAGE_KEY_ORDERS_VER, String(newVersion));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    // 1. Cloud Sync: Send to Firebase Realtime Database
    saveRemoteOrders(newOrders).catch((err) => {
      console.warn('[Firebase] Save orders error:', err);
    });

    if (!skipBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ 
          type: 'ORDERS_UPDATED', 
          payload: newOrders, 
          version: newVersion, 
          timestamp: newVersion 
        });
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }

    if (!skipBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('leovra_sync_orders', { 
        detail: { payload: newOrders, version: newVersion } 
      }));
    }
  }, []);

  // REAL-TIME SYNCHRONIZATION:
  // Firebase Realtime Database SSE Stream + Persistent BroadcastChannel + Window Storage Event + Local Custom Event + Heartbeat Polling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Setup Persistent BroadcastChannel
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('leovra_inventory_sync_channel');
        broadcastChannelRef.current = bc;
        
        bc.onmessage = (event) => {
          if (!event.data) return;
          if (event.data.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.payload)) {
            if (event.data.version && event.data.version <= currentVersionRef.current) {
              return; // Already processed
            }
            currentVersionRef.current = event.data.version || Date.now();
            setProducts(event.data.payload);
            showToast('⚡ Live Inventory updated in real time');
          } else if (event.data.type === 'ORDERS_UPDATED' && Array.isArray(event.data.payload)) {
            setOrders(event.data.payload);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel init error:', e);
      }
    }

    // 2. Storage event listener (cross-tab fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PRODUCTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const ver = Number(localStorage.getItem(STORAGE_KEY_PRODUCTS_VER) || Date.now());
            if (ver > currentVersionRef.current) {
              currentVersionRef.current = ver;
              setProducts(parsed);
              showToast('⚡ Live Inventory updated in real time');
            }
          }
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEY_ORDERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Same-window custom event listener
    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail.payload)) {
        if (customEvent.detail.version && customEvent.detail.version <= currentVersionRef.current) {
          return;
        }
        currentVersionRef.current = customEvent.detail.version || Date.now();
        setProducts(customEvent.detail.payload);
      }
    };
    window.addEventListener('leovra_sync_products', handleCustomSync);

    // 4. Heartbeat polling (checks version every 1200ms for tabs where events are throttled)
    const heartbeatTimer = setInterval(() => {
      try {
        const remoteVerStr = localStorage.getItem(STORAGE_KEY_PRODUCTS_VER);
        if (remoteVerStr) {
          const remoteVer = Number(remoteVerStr);
          if (remoteVer > currentVersionRef.current) {
            const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                currentVersionRef.current = remoteVer;
                setProducts(parsed);
                showToast('⚡ Live Inventory updated in real time');
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }, 1200);

    // 5. Firebase Cloud Realtime Database: Initial fetch + Live Server-Sent Events (SSE) Stream
    fetchRemoteProducts().then((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        currentVersionRef.current = Date.now();
        setProducts(remoteProds);
        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(remoteProds));
        } catch {
          // ignore
        }
      }
    });

    fetchRemoteOrders().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
        try {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(remoteOrders));
        } catch {
          // ignore
        }
      }
    });

    const unsubscribeProducts = subscribeRemoteProducts((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        currentVersionRef.current = Date.now();
        setProducts(remoteProds);
        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(remoteProds));
        } catch {
          // ignore
        }
        showToast('⚡ Live Inventory updated in real time');
      }
    });

    const unsubscribeOrders = subscribeRemoteOrders((remoteOrders) => {
      if (remoteOrders) {
        setOrders(remoteOrders);
        try {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(remoteOrders));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('leovra_sync_products', handleCustomSync);
      clearInterval(heartbeatTimer);
    };
  }, [showToast]);

  // Persist cart locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Inventory Actions with Functional State Updates to prevent race conditions
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      saveProducts(updated);
      return updated;
    });
    showToast(`Added "${newProduct.name}" to inventory!`);
    return newProduct;
  }, [saveProducts, showToast]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const updatedProd = { ...p, ...updates };
          if (updates.stock !== undefined) {
            updatedProd.isOutOfStock = updates.stock <= 0;
          }
          return updatedProd;
        }
        return p;
      });
      saveProducts(updated);
      return updated;
    });
    showToast(`Product updated in real time!`);
  }, [saveProducts, showToast]);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const target = prev.find(p => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      if (target) {
        showToast(`Removed "${target.name}" from inventory.`);
      }
      return updated;
    });
  }, [saveProducts, showToast]);

  const toggleStockStatus = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const isCurrentlyOut = p.isOutOfStock || p.stock <= 0;
          if (isCurrentlyOut) {
            // Restore to in-stock with at least 10 units
            const restoreQty = p.stock > 0 ? p.stock : 10;
            return {
              ...p,
              isOutOfStock: false,
              stock: restoreQty,
            };
          } else {
            // Mark out of stock and set stock to 0
            return {
              ...p,
              isOutOfStock: true,
              stock: 0,
            };
          }
        }
        return p;
      });
      saveProducts(updated);
      const target = updated.find(p => p.id === id);
      if (target) {
        showToast(target.isOutOfStock ? `Marked "${target.name}" OUT OF STOCK` : `Marked "${target.name}" IN STOCK (${target.stock} units)`);
      }
      return updated;
    });
  }, [saveProducts, showToast]);

  const updateStockQuantity = useCallback((id: string, quantity: number) => {
    const safeQty = Math.max(0, quantity);
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            stock: safeQty,
            isOutOfStock: safeQty <= 0,
          };
        }
        return p;
      });
      saveProducts(updated);
      return updated;
    });
    showToast(`Stock updated to ${safeQty} units`);
  }, [saveProducts, showToast]);

  const resetInventoryToDefaults = useCallback(() => {
    saveProducts(INITIAL_PRODUCTS);
    showToast('Inventory reset to original catalog items.');
  }, [saveProducts, showToast]);

  // Cart Actions
  const addToCart = useCallback((product: Product, size: string, color?: string, quantity: number = 1) => {
    if (product.isOutOfStock || product.stock <= 0) {
      showToast(`Sorry, "${product.name}" is currently Out of Stock!`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, product.stock);
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, selectedColor: color, quantity: Math.min(quantity, product.stock) }];
      }
    });

    showToast(`Added "${product.name}" (${size}) to Cart!`);
    setIsCartOpen(true);
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, size: string, color?: string) => {
    setCart((prev) => prev.filter((item) => !(
      item.product.id === productId && 
      item.selectedSize === size &&
      (color ? item.selectedColor === color : true)
    )));
  }, []);

  const updateCartQuantity = useCallback((productId: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId && 
          item.selectedSize === size &&
          (color ? item.selectedColor === color : true)
        ) {
          const maxStock = item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Place Order
  const placeOrder = useCallback((orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity?: string;
    paymentMethod: 'Cash on Delivery' | 'UPI / Direct Call';
  }): Order => {
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerId: currentCustomer?.id,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerCity: orderData.customerCity,
      items: [...cart],
      totalAmount: cartTotal,
      status: 'Confirmed',
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Auto-create/link customer account so customer sees their order under My Orders immediately
    const cleanPhone = orderData.customerPhone.replace(/\D/g, '').slice(-10);
    if (!currentCustomer && cleanPhone.length === 10) {
      const autoCust: CustomerUser = {
        id: 'CUST-' + Date.now(),
        name: orderData.customerName,
        phone: cleanPhone,
        address: orderData.customerAddress,
        city: orderData.customerCity || '',
        createdAt: new Date().toISOString()
      };
      setCurrentCustomer(autoCust);
      setAllCustomers(prev => {
        const updatedAll = [...prev.filter(c => c.phone !== cleanPhone), autoCust];
        try {
          localStorage.setItem(STORAGE_KEY_ALL_CUSTOMERS, JSON.stringify(updatedAll));
        } catch (e) {
          console.error(e);
        }
        return updatedAll;
      });
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(autoCust));
      } catch (e) {
        console.error(e);
      }
    }

    // Deduct stock in real-time
    const updatedProducts = products.map((prod) => {
      const boughtItem = cart.find((c) => c.product.id === prod.id);
      if (boughtItem) {
        const remaining = Math.max(0, prod.stock - boughtItem.quantity);
        return {
          ...prod,
          stock: remaining,
          isOutOfStock: remaining <= 0,
        };
      }
      return prod;
    });

    saveProducts(updatedProducts);
    saveOrders([newOrder, ...orders]);
    clearCart();
    showToast(`Order #${newOrder.id} placed! Real-time stock updated.`);
    return newOrder;
  }, [cart, cartTotal, products, orders, saveProducts, saveOrders, clearCart, showToast, currentCustomer]);

  // WhatsApp Order Link generator with contact phone 7979968347
  const generateWhatsAppOrderUrl = useCallback((
    orderItems = cart,
    customerInfo?: { name: string; phone: string; address: string }
  ) => {
    const phoneNum = '917979968347';
    let text = `*New Order Inquiry - Leovra Enterprises*\n\n`;

    if (orderItems.length > 0) {
      text += `*Items:*\n`;
      orderItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.product.name}\n   Size: ${item.selectedSize}${item.selectedColor ? `, Color: ${item.selectedColor}` : ''}\n   Qty: ${item.quantity} x ₹${item.product.price} = ₹${item.quantity * item.product.price}\n\n`;
      });
      const total = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      text += `*Total Order Value:* ₹${total}\n\n`;
    }

    if (customerInfo && customerInfo.name) {
      text += `*Customer Details:*\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone}\nAddress: ${customerInfo.address}\n\n`;
    }

    text += `Please confirm my order for doorstep delivery. Thank you!`;

    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
  }, [cart]);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isSideNavOpen,
        setIsSideNavOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        accountModalTab,
        setAccountModalTab,
        currentCustomer,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        customerOrders,
        filters,
        setFilters,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        removeProduct,
        toggleStockStatus,
        updateStockQuantity,
        resetInventoryToDefaults,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        placeOrder,
        generateWhatsAppOrderUrl,
        toastMessage,
        showToast,
        businessName,
        businessPhone,
        businessEmail,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
