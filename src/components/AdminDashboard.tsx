import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Power, 
  Search,
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Layers,
  X,
  Save,
  ShoppingBag,
  ExternalLink,
  Lock,
  LogOut,
  Key,
  ShieldCheck,
  Upload,
  Check,
  Truck,
  Download,
  MapPin,
  Building,
  Ban,
  XCircle,
  Undo2,
  Cloud,
  CloudOff,
  Grid,
  List,
  Eye,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  Copy,
  Phone,
  MessageSquare,
  Calendar,
  Hash,
  CheckCheck,
  Percent
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order, PRODUCT_FALLBACK_PLACEHOLDER } from '../types';
import { Logo } from './Logo';
import { 
  SHIPROCKET_CONFIG, 
  exportShiprocketCSV, 
  getShiprocketTrackingUrl
} from '../services/shiprocket';
import { 
  getAdminLockoutStatus, 
  recordFailedAdminAttempt, 
  clearAdminLockout 
} from '../services/security';
import {
  checkFirebaseStatus,
  forcePushProductsToRemote
} from '../services/firebaseSync';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    removeProduct, 
    toggleStockStatus, 
    updateStockQuantity, 
    setCurrentView,
    orders,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    clearAllOrders,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    showToast
  } = useStore();

  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [lockoutSecs, setLockoutSecs] = useState<number>(() => getAdminLockoutStatus().remainingSeconds);

  // Cloud sync status state
  const [cloudStatus, setCloudStatus] = useState<{
    checked: boolean;
    ok: boolean;
    error?: string;
  }>({ checked: false, ok: false });
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const checkCloudHealth = useCallback(async () => {
    const res = await checkFirebaseStatus();
    setCloudStatus({ checked: true, ok: res.ok, error: res.error });
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      checkCloudHealth();
      const interval = setInterval(checkCloudHealth, 25000);
      return () => clearInterval(interval);
    }
  }, [isAdminLoggedIn, checkCloudHealth]);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    const result = await forcePushProductsToRemote(products);
    setIsSyncingCloud(false);
    if (result.success) {
      setCloudStatus({ checked: true, ok: true });
      showToast(`✅ Synced ${products.length} products to Cloud! Live on all devices.`);
    } else {
      setCloudStatus({ checked: true, ok: false, error: result.error });
      showToast(`❌ Cloud sync failed: ${result.error}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      showToast(`📋 Copied ${label} to clipboard!`);
    } catch {
      // Fallback
      showToast(`Copied: ${text}`);
    }
  };

  // Active countdown timer for security lockout
  useEffect(() => {
    if (lockoutSecs <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAuthError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecs]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lockout = getAdminLockoutStatus();
    if (lockout.isLocked || lockoutSecs > 0) {
      const wait = lockoutSecs > 0 ? lockoutSecs : lockout.remainingSeconds;
      setAuthError(`🛡️ Security Lockout: Too many failed attempts. Please wait ${wait}s.`);
      return;
    }

    if (loginAdmin(passcode)) {
      clearAdminLockout();
      setAuthError('');
      setPasscode('');
      setLockoutSecs(0);
    } else {
      const failStatus = recordFailedAdminAttempt();
      if (failStatus.isLocked) {
        setLockoutSecs(failStatus.remainingSeconds);
        setAuthError(`🛡️ Security Lockout: Too many incorrect attempts (${failStatus.attempts}). Locked for ${failStatus.remainingSeconds}s.`);
      } else {
        setAuthError(`Incorrect passcode. Attempt ${failStatus.attempts} of 3 before temporary lockout.`);
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'shiprocket'>('inventory');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState<'all' | ProductCategory>('all');
  const [adminStockFilter, setAdminStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  
  // Orders search & status filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  // Shiprocket dispatch state
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Order['status']>('Dispatched');
  const [dispatchAwb, setDispatchAwb] = useState('');
  const [dispatchCourier, setDispatchCourier] = useState('Delhivery');

  const openDispatchModal = (order: Order) => {
    setDispatchOrder(order);
    setDispatchStatus(order.status || 'Dispatched');
    setDispatchAwb(order.awbCode || '');
    setDispatchCourier(order.courierName || 'Delhivery');
  };

  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    updateOrderStatus(dispatchOrder.id, dispatchStatus, dispatchAwb.trim(), dispatchCourier.trim());
    setDispatchOrder(null);
  };

  // Order cancellation state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [restoreStockOnCancel, setRestoreStockOnCancel] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const openCancelModal = (order: Order) => {
    setCancellingOrder(order);
    setCancelReason('Customer requested cancellation');
    setRestoreStockOnCancel(true);
  };

  const handleConfirmCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    cancelOrder(cancellingOrder.id, restoreStockOnCancel, cancelReason);
    setCancellingOrder(null);
  };

  const handleConfirmDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setDeletingOrderId(null);
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearOrdersModalOpen, setIsClearOrdersModalOpen] = useState(false);

  // Form State for Adding / Editing Product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('earrings');
  const [formSubcategory, setFormSubcategory] = useState<string>('Necklace');
  const [formPrice, setFormPrice] = useState<string>('99');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('299');
  const [formStock, setFormStock] = useState<string>('10');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formTag, setFormTag] = useState<string>('Trending');
  const [formSizes, setFormSizes] = useState<string[]>(['Free Size']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [formError, setFormError] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState<'device' | 'url'>('device');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => !p.isOutOfStock && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.isOutOfStock || p.stock <= 0).length;
  const lowStockProducts = products.filter(p => !p.isOutOfStock && p.stock > 0 && p.stock <= 4).length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.isOutOfStock ? 0 : p.stock), 0);
  const totalValuation = products.reduce((sum, p) => sum + (p.isOutOfStock ? 0 : p.price * p.stock), 0);

  // Filtered list for admin
  const filteredProducts = products.filter(p => {
    if (adminCategory !== 'all' && p.category !== adminCategory) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    if (adminStockFilter === 'in_stock' && (p.isOutOfStock || p.stock <= 0)) return false;
    if (adminStockFilter === 'out_of_stock' && !p.isOutOfStock && p.stock > 0) return false;
    if (adminStockFilter === 'low_stock' && (p.isOutOfStock || p.stock > 4 || p.stock <= 0)) return false;
    return true;
  });

  // Filtered orders for admin
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderStatusFilter !== 'all' && (ord.status || 'Pending').toLowerCase() !== orderStatusFilter.toLowerCase()) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchId = ord.id.toLowerCase().includes(q);
        const matchName = ord.customerName.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone.includes(q);
        const matchAwb = ord.awbCode ? ord.awbCode.toLowerCase().includes(q) : false;
        if (!matchId && !matchName && !matchPhone && !matchAwb) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('earrings');
    setFormSubcategory('Necklace');
    setFormPrice('99');
    setFormOriginalPrice('299');
    setFormStock('10');
    setFormDescription('Handcrafted luxury jewellery with high quality finish and long lasting shine.');
    setFormImage('');
    setFormImages([]);
    setFormTag('New');
    setFormSizes(['Free Size']);
    setFormError('');
    setImageSourceTab('device');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory || (p.category === 'earrings' ? 'Necklace' : 'Standard'));
    setFormPrice(String(p.price));
    setFormOriginalPrice(String(p.originalPrice));
    setFormStock(String(p.stock));
    setFormDescription(p.description);
    setFormImage(p.image);
    const pImgs = (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : []);
    setFormImages(pImgs);
    setFormTag(p.tag || 'Trending');
    setFormSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['Free Size']);
    setFormError('');
    setImageSourceTab('device');
    setIsAddModalOpen(true);
  };

  // Compress uploaded photo using offscreen canvas to keep quality high and size tiny (~60KB)
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(typeof e.target?.result === 'string' ? e.target.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result;
        if (typeof rawDataUrl !== 'string') {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1000;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Image files handler (Device Gallery / Camera - auto compresses photos for instant sync!)
  const handleProcessImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setFormError('');
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please choose a valid image file (JPG, PNG, WEBP).');
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        setFormError('Image size is too large (max 20MB). Please choose a smaller photo.');
        continue;
      }
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          setFormImages((prev) => [...prev, compressed]);
          setFormImage(compressed);
          setFormError('');
        }
      } catch {
        setFormError('Failed to process image photo.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessImageFiles(e.target.files);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessImageFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFormImage = (indexToRemove: number) => {
    setFormImages((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      if (updated.length > 0) {
        setFormImage(updated[0]);
      } else {
        setFormImage('');
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormImages((prev) => {
      const selected = prev[indexToPrimary];
      const others = prev.filter((_, i) => i !== indexToPrimary);
      const updated = [selected, ...others];
      setFormImage(selected);
      return updated;
    });
  };

  const handleAddUrlImage = () => {
    if (formImage.trim() && !formImages.includes(formImage.trim())) {
      setFormImages((prev) => [...prev, formImage.trim()]);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter a product title / name.');
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid selling price greater than 0.');
      return;
    }

    const origPriceNum = Number(formOriginalPrice);
    const parsedOriginal = isNaN(origPriceNum) || origPriceNum <= priceNum ? Math.round(priceNum * 1.5) : origPriceNum;
    const stockNum = isNaN(Number(formStock)) ? 10 : Math.max(0, parseInt(formStock, 10));

    // Clean primary image
    const validImages = formImages.filter(img => img && img.trim().length > 0);
    const finalPrimaryImage = validImages[0] || formImage.trim() || PRODUCT_FALLBACK_PLACEHOLDER;
    const finalImagesList = validImages.length > 0 ? validImages : [finalPrimaryImage];

    const subcategoryVal = formCategory === 'earrings' 
      ? (formSubcategory.trim() || 'Necklace')
      : (formSubcategory.trim() || undefined);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        subcategory: subcategoryVal,
        price: priceNum,
        originalPrice: parsedOriginal,
        stock: stockNum,
        isOutOfStock: stockNum <= 0,
        description: formDescription.trim() || 'Handcrafted premium quality product from Leovra Enterprises.',
        image: finalPrimaryImage,
        images: finalImagesList,
        tag: (formTag as any) || undefined,
        sizes: formSizes.length > 0 ? formSizes : ['Free Size'],
        colors: editingProduct.colors,
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        subcategory: subcategoryVal,
        price: priceNum,
        originalPrice: parsedOriginal,
        stock: stockNum,
        isOutOfStock: stockNum <= 0,
        description: formDescription.trim() || 'Handcrafted premium quality product from Leovra Enterprises.',
        image: finalPrimaryImage,
        images: finalImagesList,
        tag: (formTag as any) || undefined,
        sizes: formSizes.length > 0 ? formSizes : ['Free Size'],
        rating: 5.0,
        reviewCount: 0,
      });
      // Clear filters so new product appears right away at the top
      setAdminCategory('all');
      setAdminStockFilter('all');
      setAdminSearch('');
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleCategoryChange = (cat: ProductCategory) => {
    setFormCategory(cat);
    // Auto-suggest smart defaults if starting new product
    if (!editingProduct) {
      if (cat === 'earrings') {
        setFormSubcategory('Necklace');
        setFormSizes(['Free Size']);
        setFormPrice('99');
        setFormOriginalPrice('299');
      } else if (cat === 'tshirts') {
        setFormSubcategory('Oversized Tee');
        setFormSizes(['S', 'M', 'L', 'XL']);
        setFormPrice('599');
        setFormOriginalPrice('1199');
      } else if (cat === 'lowers') {
        setFormSubcategory('Cargo Joggers');
        setFormSizes(['M', 'L', 'XL', 'XXL']);
        setFormPrice('699');
        setFormOriginalPrice('1399');
      }
    } else {
      // If editing, adjust sizes if empty
      if (cat === 'earrings' && formSizes.length === 0) {
        setFormSizes(['Free Size']);
      } else if ((cat === 'tshirts' || cat === 'lowers') && formSizes.includes('Free Size')) {
        setFormSizes(['S', 'M', 'L', 'XL']);
      }
    }
  };

  const toggleSizeSelection = (size: string) => {
    if (formSizes.includes(size)) {
      if (formSizes.length === 1) return; // keep at least 1
      setFormSizes(formSizes.filter(s => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !formSizes.includes(trimmed)) {
      setFormSizes([...formSizes, trimmed]);
      setCustomSizeInput('');
    }
  };

  // If admin is not logged in, render the dedicated luxury executive Login Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12 relative overflow-hidden" id="admin-login-screen">
        {/* Ambient luxury radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-neutral-900/90 backdrop-blur-xl rounded-3xl p-8 sm:p-9 border border-neutral-800 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Merchant HQ • Leovra
              </div>
              <h2 className="text-2xl font-black text-white font-serif tracking-tight">Leovra Commerce OS</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Enter your merchant passcode to access live catalog controls, orders, and real-time syncing.
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="admin-login-form">
            <div>
              <label className="block text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider mb-2">
                Merchant Passcode / PIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder={lockoutSecs > 0 ? `Locked for ${lockoutSecs}s` : "Enter PIN (Default: 7979)"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={lockoutSecs > 0}
                  className={`w-full pl-10 pr-4 py-3.5 bg-neutral-950 border rounded-xl text-sm font-semibold text-white outline-hidden transition-all ${
                    lockoutSecs > 0 
                      ? 'border-rose-500/50 bg-rose-950/20 text-rose-400 cursor-not-allowed' 
                      : 'border-neutral-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                  id="admin-passcode-input"
                  autoFocus={lockoutSecs === 0}
                />
              </div>
              {authError && (
                <p className="text-rose-400 text-xs mt-2 font-medium flex items-center gap-1.5 animate-in shake">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
              {lockoutSecs === 0 && (
                <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Brute-force security and automated attack protection active.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={lockoutSecs > 0}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                lockoutSecs > 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 shadow-amber-500/25 active:scale-95'
              }`}
              id="admin-login-submit-btn"
            >
              <Lock className="w-4 h-4" />
              <span>{lockoutSecs > 0 ? `System Locked (${lockoutSecs}s)` : 'Unlock Merchant Dashboard'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={() => setCurrentView('store')}
              className="text-xs text-neutral-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              id="admin-login-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6" id="admin-dashboard-container">
      
      {/* Executive Command Header */}
      <header className="bg-neutral-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-neutral-800/80 relative overflow-hidden">
        {/* Ambient luxury glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Brand & Store Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setCurrentView('store')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-all cursor-pointer"
                id="admin-back-to-store-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Storefront</span>
              </button>

              <span className="text-neutral-700">•</span>

              {cloudStatus.checked && cloudStatus.ok ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Active • All Phones Synced</span>
                </div>
              ) : cloudStatus.checked && !cloudStatus.ok ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse" title={cloudStatus.error}>
                  <CloudOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cloud Locked • Saving locally</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[11px] font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  <span>Verifying Cloud Sync...</span>
                </div>
              )}

              <span className="text-neutral-700 hidden sm:inline">•</span>
              
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Merchant HQ
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
                Leovra Commerce OS
              </h1>
              <span className="text-xs font-semibold text-neutral-400 hidden sm:inline">
                Live Inventory & Fulfillment Hub
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Real-time multi-device stock synchronization, instant out-of-stock toggling, and customer order management.
            </p>
          </div>

          {/* Quick Operations Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {/* Sync to Cloud Button */}
            <button
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-60"
              title="Force sync all products to Firebase Cloud"
              id="admin-sync-cloud-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            {/* Open Storefront in New Tab */}
            <a
              href="./"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                const origin = window.location.origin.replace(/\.+$/, '');
                const cleanBase = (import.meta.env.BASE_URL || '/').replace(/^\.?\//, '/');
                window.open(`${origin}${cleanBase}`, '_blank');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
              title="Preview public storefront in a new tab"
              id="admin-open-store-new-tab-btn"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Store</span>
            </a>

            {/* Primary Action: Add Product */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
              id="admin-add-product-btn"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Product</span>
            </button>

            {/* Lock / Logout */}
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-neutral-800 hover:bg-rose-950/80 hover:text-rose-400 text-neutral-400 hover:border-rose-800/60 border border-neutral-700 transition-all cursor-pointer"
              title="Lock Admin Session"
              id="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Cloud locked alert banner */}
      {cloudStatus.checked && !cloudStatus.ok && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-900">
                Firebase Cloud Sync Blocked (Permission Denied)
              </div>
              <div className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Naye products sirf is phone me dikh rahe hain kyunki Firebase Realtime Database me Rules locked hain. Firebase Console me Rules ko publish karein taaki sabhi phones par products live dikhein.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href="https://console.firebase.google.com/project/leovra-9e869/database/leovra-9e869-default-rtdb/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Firebase Rules</span>
            </a>
            <button
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>Test & Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Luxury Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Catalog */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Live Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">{totalProducts}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Active styles in store</span>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/70 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Available Stock</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">{inStockProducts}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for customers</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all group ${
          outOfStockProducts > 0 
            ? 'bg-rose-50/60 border-rose-300 text-rose-950' 
            : 'bg-white border-neutral-200/80'
        }`}>
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Sold Out</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${outOfStockProducts > 0 ? 'text-rose-700' : 'text-neutral-900'}`}>
            {outOfStockProducts}
          </div>
          <div className="text-[11px] mt-1 font-medium text-neutral-500">
            {outOfStockProducts > 0 ? (
              <span className="text-rose-600 font-bold">⚠️ Needs restocking</span>
            ) : (
              '100% styles in stock'
            )}
          </div>
        </div>

        {/* Inventory Units & Valuation */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Stock Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-medium">
            {totalStockUnits} units in warehouse
          </div>
        </div>

        {/* Customer Orders */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Customer Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">{orders.length}</div>
          <div className="text-[11px] text-purple-700 mt-1 font-semibold flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>{orders.filter(o => o.status === 'Dispatched' || o.status === 'Confirmed').length} active shipments</span>
          </div>
        </div>
      </div>

      {/* Modern Floating Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-neutral-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'inventory'}
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            id="admin-tab-inventory"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products Catalog</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'inventory' ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            id="admin-tab-orders"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders & Dispatch</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'orders' ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'shiprocket'}
            onClick={() => setActiveTab('shiprocket')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shiprocket'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
            id="admin-tab-shiprocket"
          >
            <Truck className="w-3.5 h-3.5 text-purple-500" />
            <span>Shiprocket</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* View Mode Switcher on Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="flex items-center gap-1 self-end sm:self-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Table view with inline stock editing"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold hidden sm:inline">Table View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Cards Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold hidden sm:inline">Grid View</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          
          {/* Controls: Search, Category Filter, Stock Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search by title, category, or product ID..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-neutral-50 text-xs text-neutral-900 pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden transition-all font-medium"
                id="admin-search-field"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'earrings', 'tshirts', 'lowers'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAdminCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    adminCategory === cat
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                  id={`admin-filter-cat-${cat}`}
                >
                  {cat === 'all' && 'All Categories'}
                  {cat === 'earrings' && '💍 Jewellery'}
                  {cat === 'tshirts' && '👕 T-Shirts'}
                  {cat === 'lowers' && '👖 Lowers'}
                </button>
              ))}
            </div>

            {/* Stock status filter dropdown */}
            <div className="flex items-center gap-1">
              <select
                value={adminStockFilter}
                onChange={(e) => setAdminStockFilter(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                id="admin-stock-filter-select"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
                <option value="low_stock">Low Stock (≤ 4)</option>
              </select>
            </div>
          </div>

          {/* Product Items Table / Cards */}
          {products.length === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto" id="admin-empty-catalog-state">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
                <Package className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-neutral-900">Your store catalog is empty</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Add your first handcrafted jewellery piece, streetwear t-shirt, or gym lower with photos and pricing to start selling to customers nationwide.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  id="admin-add-first-product-btn"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add First Product</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-xs font-semibold">No products match your search or filter.</p>
              <button
                onClick={() => { setAdminSearch(''); setAdminCategory('all'); setAdminStockFilter('all'); }}
                className="text-xs font-bold text-amber-600 hover:underline pt-1"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ========================================================
               MODERN GRID CARDS VIEW
               ======================================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.isOutOfStock || product.stock <= 0;
                const discountPercent = product.originalPrice > product.price 
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                  : 0;

                return (
                  <div 
                    key={product.id}
                    className={`group relative bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between hover:shadow-lg ${
                      isOutOfStock ? 'border-rose-200 bg-rose-50/20' : 'border-neutral-200/80 hover:border-amber-300'
                    }`}
                    id={`admin-product-card-${product.id}`}
                  >
                    {/* Card Thumbnail Area */}
                    <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={product.image || PRODUCT_FALLBACK_PLACEHOLDER}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PRODUCT_FALLBACK_PLACEHOLDER;
                        }}
                      />
                      
                      {/* Top Left Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          {product.category === 'earrings' ? 'Jewellery' : product.category === 'tshirts' ? 'T-Shirt' : 'Lower'}
                          {product.subcategory ? ` • ${product.subcategory}` : ''}
                        </span>
                        {product.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                            {product.tag}
                          </span>
                        )}
                      </div>

                      {/* Photo Count */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                          📷 {product.images.length} photos
                        </div>
                      )}

                      {/* Stock status pill top right */}
                      <div className="absolute top-2.5 right-2.5">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sold Out
                          </span>
                        ) : product.stock <= 4 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low ({product.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock ({product.stock})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1 leading-snug">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                          <span className="text-base font-black text-neutral-950">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice}</span>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {discountPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="text-[10px] text-neutral-400 font-medium mt-1">
                            Sizes: {product.sizes.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Quick Stock Controls & Actions */}
                      <div className="pt-2.5 border-t border-neutral-100 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase text-neutral-400">Warehouse Stock:</span>
                          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 shadow-2xs">
                            <button
                              onClick={() => updateStockQuantity(product.id, Math.max(0, product.stock - 1))}
                              className="px-2.5 py-1 hover:bg-neutral-200 text-neutral-700 font-black text-xs cursor-pointer"
                              title="Decrease 1 unit"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={product.stock}
                              onChange={(e) => updateStockQuantity(product.id, parseInt(e.target.value) || 0)}
                              className="w-10 text-center font-bold text-xs text-neutral-900 bg-transparent py-0.5 outline-hidden"
                            />
                            <button
                              onClick={() => updateStockQuantity(product.id, product.stock + 1)}
                              className="px-2.5 py-1 hover:bg-neutral-200 text-neutral-700 font-black text-xs cursor-pointer"
                              title="Increase 1 unit"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            onClick={() => toggleStockStatus(product.id)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              isOutOfStock
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{isOutOfStock ? 'Make In-Stock' : 'Set Sold Out'}</span>
                          </button>

                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                            title="Edit Product Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================
               MODERN TABLE DATA VIEW
               ======================================================== */
            <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-[12px]">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.isOutOfStock || product.stock <= 0;
                const discountPercent = product.originalPrice > product.price 
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                  : 0;

                return (
                  <div 
                    key={product.id} 
                    className="bg-white border border-neutral-200 rounded-[12px] p-[14px_16px] shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-[72px_1fr_auto_auto] gap-3 md:gap-[16px] items-center"
                    id={`admin-product-row-${product.id}`}
                  >
                    {/* Row 1 on mobile: Image + Product info / Col 1 & 2 on desktop via md:contents */}
                    <div className="flex items-center gap-3.5 w-full md:contents">
                      {/* Image: 72x72px, object-fit: cover, 10px radius, aligned left */}
                      <div className="relative w-[72px] h-[72px] shrink-0">
                        <img
                          src={product.image || PRODUCT_FALLBACK_PLACEHOLDER}
                          alt={product.name}
                          width={72}
                          height={72}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PRODUCT_FALLBACK_PLACEHOLDER;
                          }}
                          className="w-[72px] h-[72px] rounded-[10px] object-cover bg-neutral-100 border border-neutral-200/80 shadow-2xs"
                        />
                        {product.images && product.images.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-neutral-900 text-white text-[9px] font-bold shadow-xs">
                            +{product.images.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Product info (left-aligned): category tag + "New" badge on top, product name below, then price + old price + discount badge + sizes in one line (flex-wrap) */}
                      <div className="space-y-1 min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800">
                            {product.category === 'earrings' 
                              ? (product.subcategory ? `Jewellery • ${product.subcategory}` : 'Jewellery')
                              : product.category === 'tshirts'
                              ? (product.subcategory ? `T-Shirts • ${product.subcategory}` : 'T-Shirts')
                              : (product.subcategory ? `Lowers • ${product.subcategory}` : 'Lowers')}
                          </span>
                          {product.tag && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900 leading-snug truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 flex-wrap">
                          <span className="text-neutral-950 font-black">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-[11px] text-neutral-400 line-through">₹{product.originalPrice}</span>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {discountPercent}% OFF
                              </span>
                            </>
                          )}
                          {product.sizes && product.sizes.length > 0 && (
                            <span className="text-[10px] text-neutral-400">Sizes: {product.sizes.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 2 on mobile: Stock counter on left, status + buttons on right / Col 3 & 4 on desktop via md:contents */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 w-full pt-3 border-t border-neutral-100 md:pt-0 md:border-0 md:contents">
                      {/* Stock counter: label "STOCK COUNTER" above, the -/+ box below, vertically centered with the other columns */}
                      <div className="flex flex-col items-start gap-1 shrink-0">
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                          STOCK COUNTER
                        </span>
                        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateStockQuantity(product.id, Math.max(0, product.stock - 1))}
                            className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-black text-sm cursor-pointer transition-colors"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => updateStockQuantity(product.id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center font-bold text-xs text-neutral-900 py-1 outline-hidden"
                            id={`stock-input-${product.id}`}
                          />
                          <button
                            type="button"
                            onClick={() => updateStockQuantity(product.id, product.stock + 1)}
                            className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-black text-sm cursor-pointer transition-colors"
                            title="Increase 1 unit"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Right section: Live Status badge on top, and below it the "Set Sold Out", edit and delete buttons in one row, right-aligned with 8px gap */}
                      <div className="flex flex-col items-end gap-2 shrink-0 ml-auto md:ml-0">
                        {/* Live Status badge on top */}
                        <div>
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-black border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Out of Stock</span>
                            </span>
                          ) : product.stock <= 4 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Low ({product.stock})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>In Stock ({product.stock})</span>
                            </span>
                          )}
                        </div>

                        {/* Buttons in one row, right-aligned with 8px gap (gap-2) */}
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => toggleStockStatus(product.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                              isOutOfStock
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                            id={`admin-toggle-btn-${product.id}`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? 'Make Available' : 'Set Sold Out'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                            title="Edit Product Details"
                            id={`admin-edit-btn-${product.id}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 rounded-xl bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Product"
                            id={`admin-delete-btn-${product.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-4 sm:p-6 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-neutral-900 tracking-tight">Customer Orders & Fulfillment</h3>
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-black">
                  {orders.length}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time orders placed via online storefront or inquiry • Direct WhatsApp contact & Shiprocket dispatch
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportShiprocketCSV(orders)}
                disabled={orders.length === 0}
                className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                title="Download CSV formatted for Shiprocket Bulk Import"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Shiprocket CSV</span>
              </button>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearOrdersModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Purge all test and dummy orders"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Test Orders</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar & Status Filter Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-50 p-2.5 rounded-2xl border border-neutral-200/80">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, phone, or AWB tracking..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white text-xs text-neutral-900 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-amber-500 font-medium placeholder:text-neutral-400"
              />
              {orderSearch && (
                <button 
                  onClick={() => setOrderSearch('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'All Orders', count: orders.length },
                { id: 'pending', label: 'Pending', count: orders.filter(o => !o.status || o.status.toLowerCase() === 'pending').length },
                { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length },
                { id: 'dispatched', label: 'Dispatched', count: orders.filter(o => o.status?.toLowerCase() === 'dispatched' || o.status?.toLowerCase() === 'shipped').length },
                { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status?.toLowerCase() === 'delivered').length },
                { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    orderStatusFilter === tab.id
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 hover:bg-neutral-200/80 border border-neutral-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    orderStatusFilter === tab.id ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-black text-neutral-900 text-base">No Customer Orders Yet</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                When customers place an order on your storefront or contact you via WhatsApp, orders will appear here automatically in real time.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-xs font-bold text-neutral-700">No orders match "{orderSearch || orderStatusFilter}"</p>
              <button
                onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); }}
                className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusLower = (order.status || 'Pending').toLowerCase();
                const isCancelled = statusLower === 'cancelled';
                const isDelivered = statusLower === 'delivered';
                const isDispatched = statusLower === 'dispatched' || statusLower === 'shipped';
                const isConfirmed = statusLower === 'confirmed';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 space-y-4 hover:shadow-md ${
                      isCancelled
                        ? 'border-rose-200 bg-rose-50/20'
                        : isDelivered
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : isDispatched
                        ? 'border-purple-200 bg-purple-50/10'
                        : 'border-neutral-200/90'
                    }`}
                  >
                    {/* Top Row: Order ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-neutral-900 font-mono text-xs px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-neutral-500" />
                          <span>{order.id}</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.id, 'Order ID')}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Copy Order ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          isDispatched ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          isConfirmed ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                          isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isDelivered ? 'bg-emerald-600' :
                            isDispatched ? 'bg-purple-600 animate-pulse' :
                            isConfirmed ? 'bg-sky-600' :
                            isCancelled ? 'bg-rose-600' :
                            'bg-amber-600 animate-pulse'
                          }`} />
                          <span>{order.status || 'Pending'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: Customer & Shipping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Info */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Customer Details</div>
                        <div className="font-bold text-neutral-900 text-sm">{order.customerName}</div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <a
                            href={`tel:${order.customerPhone.startsWith('+') ? order.customerPhone : `+91${order.customerPhone}`}`}
                            className="inline-flex items-center gap-1 text-neutral-700 hover:text-amber-700 font-semibold text-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <span>{order.customerPhone}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.customerPhone, 'Phone Number')}
                            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            title="Copy Phone"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-neutral-500 text-[11px] pt-1 leading-relaxed">
                          <span className="font-semibold text-neutral-700">Address: </span>
                          {order.customerAddress}
                          {order.customerCity && ` (${order.customerCity})`}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 md:col-span-1">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                          Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)} units)
                        </div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {order.items.map((it, idx) => (
                            <div key={`${it.product.id}-${it.selectedSize}-${idx}`} className="flex items-center justify-between text-[11px] gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-neutral-200 text-neutral-800 text-[10px] font-black flex items-center justify-center shrink-0">
                                  {it.quantity}x
                                </span>
                                <span className="font-semibold text-neutral-900 truncate">{it.product.name}</span>
                              </div>
                              <div className="shrink-0 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700 font-bold text-[10px]">
                                  {it.selectedSize}
                                </span>
                                <span className="font-bold text-neutral-900">₹{it.quantity * it.product.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment & Logistics summary */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Payment & Total</div>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-black text-neutral-950">₹{order.totalAmount}</span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800 font-bold text-[10px] uppercase">
                              {order.paymentMethod || 'Prepaid / UPI'}
                            </span>
                          </div>
                          {order.transactionId && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span>UTR: {order.transactionId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(order.transactionId || '', 'UTR')}
                                className="text-emerald-600 hover:text-emerald-900 ml-auto cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* AWB info if available */}
                        {order.awbCode ? (
                          <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1 text-purple-800 font-bold">
                              <Truck className="w-3.5 h-3.5 text-purple-600" />
                              <span>{order.courierName || 'Shiprocket'}:</span>
                              <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-purple-200">{order.awbCode}</span>
                            </div>
                            <a
                              href={getShiprocketTrackingUrl(order.awbCode)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-700 hover:text-purple-900 font-bold underline inline-flex items-center gap-0.5"
                            >
                              <span>Track</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-400 font-medium">
                            No AWB assigned yet. Click "Dispatch & AWB" to add.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cancelled Banner if cancelled */}
                    {isCancelled && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Order Cancelled: {order.cancellationReason || 'Cancelled by store admin'}</span>
                      </div>
                    )}

                    {/* Bottom Row: Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dispatch & AWB Modal launcher */}
                        <button
                          type="button"
                          onClick={() => openDispatchModal(order)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-purple-400" />
                          <span>{order.awbCode ? 'Update AWB / Courier' : 'Dispatch Order (Add AWB)'}</span>
                        </button>

                        {/* WhatsApp Customer Update Button */}
                        <a
                          href={
                            isCancelled
                              ? `https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}!\nYour order #${order.id} at Leovra Enterprises has been cancelled.\nReason: ${order.cancellationReason || 'Cancelled by store admin'}.\nIf you have any questions or wish to re-order, please reply here.`
                                )}`
                              : order.awbCode
                              ? `https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}!\nYour Leovra Order #${order.id} has been dispatched via ${order.courierName || 'Shiprocket Express'}.\nAWB Tracking No: ${order.awbCode}\nLive Tracking: ${getShiprocketTrackingUrl(order.awbCode)}\nThank you for shopping with Leovra Enterprises!`
                                )}`
                              : `https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}!\nWe received your order #${order.id} for ₹${order.totalAmount} at Leovra Enterprises. We are preparing it for packaging and dispatch soon!`
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isCancelled ? 'WhatsApp Cancel Msg' : order.awbCode ? 'Send Tracking on WhatsApp' : 'Chat with Customer'}</span>
                        </a>
                      </div>

                      {/* Cancel / Re-open / Delete */}
                      <div className="flex items-center gap-1.5">
                        {isCancelled ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'Pending')}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Re-open this order"
                            >
                              <Undo2 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Re-open</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingOrderId(order.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCancelModal(order)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Cancel this order"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shiprocket Logistics Tab */}
      {activeTab === 'shiprocket' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-neutral-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CONNECTED & ACTIVE
                  </span>
                  <span className="text-xs text-neutral-400">Company ID: {SHIPROCKET_CONFIG.companyId}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>Shiprocket Logistics Integration</span>
                </h3>
                <p className="text-xs text-neutral-300 max-w-xl">
                  Automated logistics dispatch, multi-courier network (Blue Dart, Delhivery, Shadowfax, DTDC), and live tracking for Leovra Enterprises.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportShiprocketCSV(orders)}
                  disabled={orders.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Bulk Orders CSV</span>
                </button>
                <a
                  href={SHIPROCKET_CONFIG.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/20"
                >
                  <span>Open Shiprocket Panel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Pickup Hub Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Account Info */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                <Building className="w-4 h-4" />
                <span>Account Credentials</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div><span className="text-neutral-500">Email:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.accountEmail}</strong></div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(SHIPROCKET_CONFIG.accountEmail, 'Shiprocket Email')}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                    title="Copy Email"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div><span className="text-neutral-500">Merchant:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.companyName}</strong></div>
                <div><span className="text-neutral-500">Account Status:</span> <span className="text-emerald-700 font-bold">Verified & Active</span></div>
              </div>
            </div>

            {/* Pickup Hub */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Primary Pickup Location</span>
              </div>
              <div className="text-xs space-y-1">
                <div><span className="text-neutral-500">Location Tag:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.pickupLocation}</strong></div>
                <div className="flex items-center justify-between">
                  <div><span className="text-neutral-500">Hub Pincode:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.pickupPincode} ({SHIPROCKET_CONFIG.pickupCity})</strong></div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(SHIPROCKET_CONFIG.pickupPincode, 'Pickup Pincode')}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                    title="Copy Pincode"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div><span className="text-neutral-500">Pickup Contact:</span> <strong className="text-neutral-900">Sartaj (7979968347)</strong></div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('7979968347', 'Contact Number')}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                    title="Copy Contact Phone"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courier Partners */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Truck className="w-4 h-4" />
                <span>Active Courier Network</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <p>Shiprocket assigns the fastest courier automatically:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Blue Dart', 'Delhivery', 'Shadowfax', 'DTDC', 'XpressBees', 'Ekart'].map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-bold border border-neutral-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Dispatch Guide */}
          <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-black text-sm text-neutral-900 flex items-center gap-2">
              <span>🚀 3-Step Shiprocket Dispatch Workflow</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">1</div>
                <div className="font-bold text-xs text-neutral-900">Download Orders CSV</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Click "Download Bulk Orders CSV" button above. It formats all customer names, addresses, pincodes, and items for Shiprocket.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">2</div>
                <div className="font-bold text-xs text-neutral-900">Bulk Upload on Shiprocket</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Go to <a href="https://app.shiprocket.in/orders" target="_blank" rel="noopener noreferrer" className="text-purple-700 font-bold underline">Shiprocket Orders</a> &gt; Add Order &gt; Bulk Import. Upload your CSV and print shipping labels.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">3</div>
                <div className="font-bold text-xs text-neutral-900">Paste AWB in Leovra</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  In Customer Orders, click "Dispatch & AWB" and enter the generated AWB number. Customers will see live Shiprocket tracking in their account!
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
              <a
                href="https://app.shiprocket.in/orders"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Manage Orders in Shiprocket</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://app.shiprocket.in/shipments"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Track Active Shipments</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://app.shiprocket.in/billing/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Recharge Shipping Wallet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://app.shiprocket.in/rate-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Shipping Rate Calculator</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Shiprocket Dispatch / AWB Modal */}
      {dispatchOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDispatchOrder(null);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-purple-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-700" />
                <div>
                  <h3 className="text-sm font-black text-neutral-900">Shiprocket Order Dispatch</h3>
                  <p className="text-[11px] text-purple-700 font-mono">Order ID: {dispatchOrder.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} className="p-5 space-y-3.5 text-xs">
              <div>
                <div className="text-[11px] text-neutral-500 font-semibold mb-0.5">Customer & Address:</div>
                <div className="font-bold text-neutral-900">{dispatchOrder.customerName} ({dispatchOrder.customerPhone})</div>
                <div className="text-[11px] text-neutral-600 truncate">{dispatchOrder.customerAddress}</div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Order Status
                </label>
                <select
                  value={dispatchStatus}
                  onChange={(e) => setDispatchStatus(e.target.value as Order['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed (Processing)</option>
                  <option value="Dispatched">Dispatched (In Transit)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Courier Partner
                </label>
                <select
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="DTDC">DTDC</option>
                  <option value="XpressBees">XpressBees</option>
                  <option value="Ekart">Ekart Logistics</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Shiprocket Express">Shiprocket Express</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Shiprocket AWB / Tracking Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 143242314543 or SR12345678"
                  value={dispatchAwb}
                  onChange={(e) => setDispatchAwb(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Customers can live-track their parcel on Shiprocket once AWB is entered.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save & Update Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCancellingOrder(null);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-950">Cancel Order #{cancellingOrder.id}</h3>
                  <p className="text-[11px] text-rose-700">Customer: {cancellingOrder.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmCancelOrder} className="p-5 space-y-4 text-xs">
              {/* Order Info summary */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Customer Phone:</span>
                  <span className="font-bold text-neutral-900">{cancellingOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Total Amount:</span>
                  <span className="font-bold text-neutral-900">₹{cancellingOrder.totalAmount} ({cancellingOrder.paymentMethod})</span>
                </div>
                <div className="text-neutral-500 pt-1 border-t border-neutral-200/60">
                  <span>Items: </span>
                  <span className="text-neutral-800 font-medium">
                    {cancellingOrder.items.map(i => `${i.quantity}x ${i.product.name} (${i.selectedSize})`).join(', ')}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Reason for Cancellation / रद्द करने का कारण
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation (ग्राहक का अनुरोध)</option>
                  <option value="Item out of stock / Inventory issue">Item out of stock (स्टॉक उपलब्ध नहीं)</option>
                  <option value="Customer phone unreachable / Invalid address">Customer unreachable / Address issue (संपर्क नहीं हो पाया)</option>
                  <option value="Delivery location not serviceable">Delivery location not serviceable (डिलीवरी संभव नहीं)</option>
                  <option value="Duplicate or test order">Duplicate or test order (डुप्लिकेट या टेस्ट ऑर्डर)</option>
                  <option value="Payment not completed / Fraud alert">Payment not received / COD cancelled (भुगतान नहीं हुआ)</option>
                  <option value="Other / Store policy">Other (अन्य कारण)</option>
                </select>
              </div>

              {/* Restore Stock Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStockOnCancel}
                  onChange={(e) => setRestoreStockOnCancel(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-[11px] leading-snug">
                  <span className="font-bold text-neutral-900 block">Restore Stock to Catalog (स्टॉक वापस जोड़ें)</span>
                  <span className="text-neutral-500">
                    Automatically adds {cancellingOrder.items.reduce((s, i) => s + i.quantity, 0)} units back to the shop's live product stock.
                  </span>
                </div>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold cursor-pointer"
                >
                  Don't Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deletingOrderId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeletingOrderId(null);
          }}
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 p-5 space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-neutral-900 text-sm">Delete Order #{deletingOrderId}?</h3>
              <p className="text-[11px] text-neutral-500">
                This will permanently remove this order from order history and Firebase. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrderId(null)}
                className="flex-1 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteOrder(deletingOrderId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddModalOpen(false);
              setEditingProduct(null);
            }
          }}
          id="product-form-modal-overlay"
        >
          <form 
            onSubmit={handleSaveProduct}
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden my-auto"
            id="product-form-modal-content"
          >
            {/* Modal Header (Fixed / Sticky) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  {editingProduct ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-tight">
                    {editingProduct ? 'Edit Product Details' : 'Add New Product to Shop'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Real-time catalog sync • Instantly visible on storefront
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
              
              {/* Form Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Product Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Oxidized Silver Chandbali / Oversized Graphic Cotton Tee"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    formError && !formName.trim()
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                      : 'border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-neutral-50/50'
                  }`}
                  id="admin-form-name"
                  autoFocus
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'earrings', label: 'Jewellery (ज्वेलरी)', sub: 'Jewellery' },
                    { id: 'tshirts', label: 'T-Shirts (टी-शर्ट)', sub: 'Apparel' },
                    { id: 'lowers', label: 'Lowers (लोअर)', sub: 'Pants/Joggers' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as ProductCategory)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        formCategory === cat.id
                          ? 'bg-neutral-950 text-white border-amber-500 ring-2 ring-amber-400/40 font-bold shadow-md'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{cat.label}</div>
                      <div className={`text-[10px] ${formCategory === cat.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{cat.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory selector */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1.5">
                  Subcategory (विशिष्ट प्रकार)
                </label>
                {formCategory === 'earrings' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {['Necklace', 'Earrings & Jhumkas', 'Bangles & Bracelets', 'Rings', 'Pendants', 'Anklets', 'Other'].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          formSubcategory === sub
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold shadow-2xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                ) : formCategory === 'tshirts' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {['Oversized Tee', 'Polo T-Shirt', 'Classic Crewneck', 'Graphic Streetwear', 'Sleeveless / Tank', 'Other'].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          formSubcategory === sub
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold shadow-2xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {['Cargo Joggers', 'Trackpants', 'Gym & Running Lower', 'Chino Casual Lower', 'Shorts', 'Other'].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          formSubcategory === sub
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold shadow-2xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Or enter custom subcategory (e.g. Necklace, Choker, etc.)..."
                  value={formSubcategory}
                  onChange={(e) => setFormSubcategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-medium focus:border-amber-500 outline-hidden bg-neutral-50/50"
                  id="admin-form-subcategory"
                />
              </div>

              {/* Pricing & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="399"
                      value={formPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormPrice(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden font-bold text-neutral-900 bg-neutral-50/50"
                      id="admin-form-price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Original MRP (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="799"
                      value={formOriginalPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormOriginalPrice(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden font-medium text-neutral-700 bg-neutral-50/50"
                      id="admin-form-original-price"
                    />
                  </div>
                  {Number(formOriginalPrice) > Number(formPrice) && Number(formPrice) > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                      {Math.round(((Number(formOriginalPrice) - Number(formPrice)) / Number(formOriginalPrice)) * 100)}% Discount
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12"
                    value={formStock}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormStock(val);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden font-bold text-neutral-900 bg-neutral-50/50"
                    id="admin-form-stock"
                  />
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {Number(formStock) === 0 ? 'Will show as Out of Stock' : `${Number(formStock) || 0} units available`}
                  </span>
                </div>
              </div>

              {/* Live Customer Deal Margin Preview */}
              {Number(formPrice) > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-neutral-900">Live Customer Deal: </span>
                      <span className="text-neutral-700 font-medium">
                        Selling at <strong className="text-neutral-950 font-black">₹{formPrice}</strong>
                        {Number(formOriginalPrice) > Number(formPrice) && (
                          <span> (MRP ₹{formOriginalPrice} • <strong className="text-emerald-700">{Math.round(((Number(formOriginalPrice) - Number(formPrice)) / Number(formOriginalPrice)) * 100)}% OFF</strong> • Customer Saves ₹{Number(formOriginalPrice) - Number(formPrice)})</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    Live Deal Badge
                  </span>
                </div>
              )}

              {/* Sizes Available */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Available Sizes ({formSizes.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeSelection(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formSizes.includes(sz)
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom size (e.g. 38, Oversized M)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 outline-hidden text-xs bg-neutral-50/50"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>
              </div>

              {/* Product Photos Section: Multi-Photo Auto-Slide Supported */}
              <div className="space-y-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-neutral-800 text-xs sm:text-sm block">
                      Product Photos ({formImages.length} {formImages.length === 1 ? 'Photo' : 'Photos'})
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold block">
                      {formImages.length >= 2 
                        ? '✨ 2+ Photos Uploaded — Auto-Slide Carousel Active on Storefront!' 
                        : '💡 Upload 2 or more photos to enable Auto-Slide Carousel on product!'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Auto-compressed to ~60KB for instant multi-phone cloud sync
                    </span>
                  </div>
                  
                  {/* Tabs: Device / URL */}
                  <div className="flex items-center bg-white border border-neutral-200 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('device')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageSourceTab === 'device' ? 'bg-neutral-900 text-white font-bold shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Gallery / File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageSourceTab === 'url' ? 'bg-neutral-900 text-white font-bold shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {/* Hidden File Input (supports multiple file selection!) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="admin-file-upload-input"
                />

                {/* Upload Action Card */}
                {imageSourceTab === 'device' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-3.5 sm:p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isDraggingFile 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-neutral-300 hover:border-amber-500 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 text-xs">
                        Click to select photo(s) from device
                      </span>
                      <p className="text-[10px] text-neutral-500">
                        Supports phone gallery photos, JPG, PNG or WebP (select 1 or multiple)
                      </p>
                    </div>
                  </div>
                )}

                {/* URL Paste Tab */}
                {imageSourceTab === 'url' && (
                  <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-neutral-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image link: https://..."
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden font-mono text-[11px]"
                        id="admin-form-image"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
                      >
                        + Add Photo
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Paste any public image link and click "+ Add Photo".
                    </p>
                  </div>
                )}

                {/* Uploaded Photos Grid Preview */}
                {formImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                      <span>Uploaded Photos ({formImages.length}):</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Upload 2nd / Another Photo</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {formImages.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          className={`relative rounded-xl overflow-hidden border p-1 bg-white shadow-2xs group flex flex-col ${
                            idx === 0 ? 'border-amber-500 ring-1 ring-amber-400' : 'border-neutral-200'
                          }`}
                        >
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100">
                            <img
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Slide Number Badge */}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-neutral-900/80 text-white backdrop-blur-xs">
                              {idx === 0 ? '★ Main' : `#${idx + 1} Slide`}
                            </div>
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveFormImage(idx)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
                              title="Delete this photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="mt-1 text-[9px] font-bold text-amber-700 hover:text-amber-900 text-center py-0.5 cursor-pointer"
                            >
                              Set as Main Photo
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tag / Promotional Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Promotional Tag
                  </label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden bg-neutral-50/50 cursor-pointer font-medium"
                  >
                    <option value="Trending">Trending</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New Arrival</option>
                    <option value="Limited Stock">Limited Stock</option>
                    <option value="Festive">Festive Special</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Tag Preview
                  </label>
                  <div className="pt-1.5 flex items-center">
                    <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-neutral-900 text-white shadow-2xs">
                      {formTag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Material, styling tips, washing instructions, fit..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden resize-none bg-neutral-50/50"
                  id="admin-form-description"
                />
              </div>

            </div>

            {/* Modal Footer (Sticky / Always Visible & Clickable) */}
            <div className="px-5 py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-neutral-500 hidden sm:block">
                All changes save locally and sync in real time.
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  aria-label={editingProduct ? 'Save Changes' : 'Publish Product to Shop'}
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2 text-xs active:scale-95"
                  id="admin-submit-save-btn"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingProduct ? 'Save & Sync Product' : 'Publish Product to Shop'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-neutral-900">Remove Product?</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete this product from the inventory? It will immediately disappear from the customer shop.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                id="confirm-delete-product-btn"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Test Orders Confirmation Modal */}
      {isClearOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-neutral-900">Clear All Test Orders?</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to purge all orders from database? All test and dummy orders will be permanently removed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearOrdersModalOpen(false)}
                className="py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllOrders();
                  setIsClearOrdersModalOpen(false);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                id="confirm-clear-orders-btn"
              >
                Yes, Purge Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
