import React, { useState, useRef } from 'react';
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
  Image as ImageIcon,
  Check,
  Truck,
  Download,
  MapPin,
  Building,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order } from '../types';
import { Logo } from './Logo';
import { 
  SHIPROCKET_CONFIG, 
  exportShiprocketCSV, 
  getShiprocketTrackingUrl 
} from '../services/shiprocket';

// Preset high quality images for quick 1-click photo selection when adding product
const SAMPLE_IMAGE_PRESETS: { label: string; cat: ProductCategory; url: string }[] = [
  {
    label: 'Oxidized Silver Jhumka',
    cat: 'earrings',
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Gold Kundan Chandelier',
    cat: 'earrings',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Modern Minimal Studs',
    cat: 'earrings',
    url: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Oversized Streetwear Black Tee',
    cat: 'tshirts',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Supima Cotton White Tee',
    cat: 'tshirts',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Acid Wash Boxy Tee',
    cat: 'tshirts',
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cargo Joggers with Pockets',
    cat: 'lowers',
    url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'French Terry Trackpants',
    cat: 'lowers',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '4-Way Stretch Training Lower',
    cat: 'lowers',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    removeProduct, 
    toggleStockStatus, 
    updateStockQuantity, 
    resetInventoryToDefaults,
    setCurrentView,
    orders,
    updateOrderStatus,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin
  } = useStore();

  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passcode)) {
      setAuthError('');
      setPasscode('');
    } else {
      setAuthError('Incorrect passcode. Please enter valid owner PIN (e.g. 7979).');
    }
  };

  const handleQuickUnlock = () => {
    loginAdmin('7979');
    setAuthError('');
  };

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'shiprocket'>('inventory');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState<'all' | ProductCategory>('all');
  const [adminStockFilter, setAdminStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  
  // Shiprocket dispatch state
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Order['status']>('shipped');
  const [dispatchAwb, setDispatchAwb] = useState('');
  const [dispatchCourier, setDispatchCourier] = useState('Delhivery');

  const openDispatchModal = (order: Order) => {
    setDispatchOrder(order);
    setDispatchStatus(order.status || 'shipped');
    setDispatchAwb(order.awbCode || '');
    setDispatchCourier(order.courierName || 'Delhivery');
  };

  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    updateOrderStatus(dispatchOrder.id, dispatchStatus, dispatchAwb.trim(), dispatchCourier.trim());
    setDispatchOrder(null);
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Adding / Editing Product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('earrings');
  const [formPrice, setFormPrice] = useState<string>('399');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('799');
  const [formStock, setFormStock] = useState<string>('12');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTag, setFormTag] = useState<string>('Trending');
  const [formSizes, setFormSizes] = useState<string[]>(['Free Size']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [formError, setFormError] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState<'device' | 'presets' | 'url'>('device');
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

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('earrings');
    setFormPrice('399');
    setFormOriginalPrice('799');
    setFormStock('12');
    setFormDescription('Handcrafted with premium materials. Long-lasting polish, anti-allergic finish, and lightweight comfort.');
    setFormImage(SAMPLE_IMAGE_PRESETS[0].url);
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
    setFormPrice(String(p.price));
    setFormOriginalPrice(String(p.originalPrice));
    setFormStock(String(p.stock));
    setFormDescription(p.description);
    setFormImage(p.image);
    setFormTag(p.tag || 'Trending');
    setFormSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['Free Size']);
    setFormError('');
    setImageSourceTab('device');
    setIsAddModalOpen(true);
  };

  // Image file handler (Gallery / Computer)
  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please choose a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFormError('Image size is too large (max 8MB). Please choose a smaller photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormImage(event.target.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImageFile(file);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessImageFile(file);
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

    // Fallback image if left blank
    const fallbackImage = SAMPLE_IMAGE_PRESETS.find(p => p.cat === formCategory)?.url || SAMPLE_IMAGE_PRESETS[0].url;
    const finalImage = formImage.trim() || fallbackImage;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        originalPrice: parsedOriginal,
        stock: stockNum,
        isOutOfStock: stockNum <= 0,
        description: formDescription.trim() || 'Handcrafted premium quality product from Leovra Enterprises.',
        image: finalImage,
        tag: (formTag as any) || undefined,
        sizes: formSizes.length > 0 ? formSizes : ['Free Size'],
        // Preserve existing colors when editing (form has no colors field)
        colors: editingProduct.colors,
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        originalPrice: parsedOriginal,
        stock: stockNum,
        isOutOfStock: stockNum <= 0,
        description: formDescription.trim() || 'Handcrafted premium quality product from Leovra Enterprises.',
        image: finalImage,
        tag: (formTag as any) || undefined,
        sizes: formSizes.length > 0 ? formSizes : ['Free Size'],
        rating: 4.9,
        reviewCount: 1,
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
        setFormSizes(['Free Size']);
        setFormPrice('399');
        setFormOriginalPrice('799');
        setFormImage(SAMPLE_IMAGE_PRESETS[0].url);
      } else if (cat === 'tshirts') {
        setFormSizes(['S', 'M', 'L', 'XL']);
        setFormPrice('599');
        setFormOriginalPrice('1199');
        setFormImage(SAMPLE_IMAGE_PRESETS[3].url);
      } else if (cat === 'lowers') {
        setFormSizes(['M', 'L', 'XL', 'XXL']);
        setFormPrice('699');
        setFormOriginalPrice('1399');
        setFormImage(SAMPLE_IMAGE_PRESETS[6].url);
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

  // If admin is not logged in, render the dedicated secure Login Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12" id="admin-login-screen">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Logo size="lg" />
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mt-2">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900">Admin Inventory Portal</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your merchant passcode to access live stock controls, product editing, and orders.
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="admin-login-form">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Owner Passcode / PIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter Passcode (Default PIN: 7979)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden transition-all"
                  id="admin-passcode-input"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              id="admin-login-submit-btn"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-100 space-y-3 text-center">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              id="admin-quick-unlock-btn"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>1-Click Owner Access (PIN: 7979)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('store')}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              id="admin-login-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6" id="admin-dashboard-container">
      
      {/* Top Banner / Actions Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              onClick={() => setCurrentView('store')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              id="admin-back-to-store-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
            <span className="text-neutral-300">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Cloud Sync Active (Live on all devices)</span>
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Leovra Enterprises Inventory Admin
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time stock controls, instant out-of-stock toggling, and product management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors"
            title="Open customer website in a separate tab to test real-time stock updates side-by-side"
            id="admin-open-store-new-tab-btn"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
            <span>Open Store in New Tab</span>
          </a>

          <button
            onClick={openAddModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 font-bold text-xs transition-colors cursor-pointer"
            title="Lock / Logout Admin"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{totalProducts}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Active styles</div>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Stock</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{inStockProducts}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Available for sale</div>
        </div>

        {/* Out of Stock Alert */}
        <div className={`rounded-2xl p-4 border shadow-xs ${
          outOfStockProducts > 0 
            ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-700">{outOfStockProducts}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">
            {outOfStockProducts > 0 ? 'Action needed to restock' : 'Zero sold-out items'}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock (&le; 4)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-800">{lowStockProducts}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Nearing out-of-stock</div>
        </div>

        {/* Total Stock Valuation */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Units</span>
            <Layers className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{totalStockUnits}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Valuation: ₹{totalValuation.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
          id="admin-tab-inventory"
        >
          <span>Inventory & Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
          id="admin-tab-orders"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shiprocket')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'shiprocket'
              ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-purple-50 border border-neutral-200'
          }`}
          id="admin-tab-shiprocket"
        >
          <Truck className="w-3.5 h-3.5 text-purple-400" />
          <span>Shiprocket Logistics</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Shiprocket Connected" />
        </button>

        <button
          onClick={resetInventoryToDefaults}
          className="ml-auto text-xs font-semibold text-neutral-500 hover:text-rose-600 p-2 rounded-lg hover:bg-neutral-100 transition-colors inline-flex items-center gap-1"
          title="Reset back to standard initial products"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Default Catalog</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
          
          {/* Controls: Search, Category Filter, Stock Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                placeholder="Search by title or product ID..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-neutral-50 text-xs text-neutral-900 pl-8 pr-3 py-2 rounded-xl border border-neutral-200 focus:border-amber-500 outline-hidden"
                id="admin-search-field"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'earrings', 'tshirts', 'lowers'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAdminCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    adminCategory === cat
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                  id={`admin-filter-cat-${cat}`}
                >
                  {cat === 'all' && 'All'}
                  {cat === 'earrings' && 'Earrings'}
                  {cat === 'tshirts' && 'T-Shirts'}
                  {cat === 'lowers' && 'Lowers'}
                </button>
              ))}
            </div>

            {/* Stock status filter */}
            <div className="flex items-center gap-1">
              <select
                value={adminStockFilter}
                onChange={(e) => setAdminStockFilter(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
                id="admin-stock-filter-select"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
                <option value="low_stock">Low Stock (&le; 4)</option>
              </select>
            </div>
          </div>

          {/* Real-time Notice */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Stock Management:</strong> Adjusting stock counters or clicking <strong>"Set Out-of-Stock"</strong> updates the catalog immediately!
              </span>
            </div>
          </div>

          {/* Product Items Table / Cards */}
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Package className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs">No products match your search or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.isOutOfStock || product.stock <= 0;
                return (
                  <div 
                    key={product.id} 
                    className={`py-3.5 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors rounded-xl px-2 ${
                      isOutOfStock ? 'bg-rose-50/30' : 'hover:bg-neutral-50/60'
                    }`}
                    id={`admin-product-row-${product.id}`}
                  >
                    {/* Left: Thumbnail & Name & Category */}
                    <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[260px] max-w-md">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200 shadow-2xs"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                            {product.category}
                          </span>
                          {product.tag && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 flex-wrap">
                          <span className="text-neutral-900 font-extrabold">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-[11px] text-neutral-400 line-through">₹{product.originalPrice}</span>
                          )}
                          <span className="text-[10px] text-neutral-400">Sizes: {product.sizes?.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Live Stock Quantity Controller */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full md:w-auto">
                      
                      {/* Quantity Increaser/Decreaser */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Stock Quantity:
                        </span>
                        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => updateStockQuantity(product.id, Math.max(0, product.stock - 1))}
                            className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-extrabold text-sm"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => updateStockQuantity(product.id, parseInt(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-xs text-neutral-900 py-1 outline-hidden"
                            id={`stock-input-${product.id}`}
                          />
                          <button
                            onClick={() => updateStockQuantity(product.id, product.stock + 1)}
                            className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-extrabold text-sm"
                            title="Increase 1 unit"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Stock Status Badge */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Status:
                        </span>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </span>
                        ) : product.stock <= 4 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Low ({product.stock})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock ({product.stock})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick 1-Click Out-of-stock toggle & Edit & Delete */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                      
                      {/* 1-Click Out-of-Stock Toggle Button */}
                      <button
                        onClick={() => toggleStockStatus(product.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                          isOutOfStock
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                        id={`admin-toggle-btn-${product.id}`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Set In-Stock' : 'Set Out of Stock'}</span>
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        title="Edit Product Details"
                        id={`admin-edit-btn-${product.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 transition-colors"
                        title="Delete Product"
                        id={`admin-delete-btn-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Customer Orders History</h3>
              <p className="text-xs text-neutral-500">Real-time orders placed via storefront or customer inquiry</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportShiprocketCSV(orders)}
                disabled={orders.length === 0}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download CSV formatted for Shiprocket Bulk Import"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Shiprocket CSV</span>
              </button>
              <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-full">
                {orders.length} Total Orders
              </span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs font-medium">No customer orders yet.</p>
              <p className="text-[11px] text-neutral-500">
                When visitors place an order on the storefront, it will instantly appear here!
              </p>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-neutral-100">
              {orders.map((order) => (
                <div key={order.id} className="pt-3 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-neutral-900 font-mono">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                      <span className="text-neutral-400 text-[10px]">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="font-bold text-neutral-800">
                      {order.customerName} • <a href={`tel:${order.customerPhone}`} className="text-amber-700 hover:underline">{order.customerPhone}</a>
                    </div>
                    <div className="text-neutral-500 text-[11px] max-w-md">
                      Address: {order.customerAddress} {order.customerCity ? `(${order.customerCity})` : ''}
                    </div>

                    <div className="pt-1 text-[11px] text-neutral-700 space-y-0.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{it.quantity}x <strong>{it.product.name}</strong> ({it.selectedSize}) - ₹{it.quantity * it.product.price}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shiprocket AWB Badge & Live Track if available */}
                    {order.awbCode && (
                      <div className="mt-2 inline-flex flex-wrap items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-semibold">{order.courierName || 'Shiprocket'} AWB:</span>
                        <span className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-purple-200">
                          {order.awbCode}
                        </span>
                        <a
                          href={getShiprocketTrackingUrl(order.awbCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 font-bold underline ml-1 inline-flex items-center gap-0.5"
                        >
                          <span>Live Track</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-end gap-2 shrink-0">
                    <div>
                      <div className="text-xs text-neutral-400">Total Amount:</div>
                      <div className="text-base font-black text-neutral-950">₹{order.totalAmount}</div>
                      <div className="text-[10px] text-neutral-500 font-medium">{order.paymentMethod}</div>
                      {order.transactionId && (
                        <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                          UTR: {order.transactionId}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDispatchModal(order)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Truck className="w-3.5 h-3.5 text-purple-400" />
                        <span>{order.awbCode ? 'Edit AWB / Status' : 'Dispatch & AWB'}</span>
                      </button>

                      <a
                        href={
                          order.awbCode
                            ? `https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customerName}!\nYour Leovra Order #${order.id} has been dispatched via Shiprocket (${order.courierName || 'Express Courier'}).\nAWB Tracking No: ${order.awbCode}\nLive Tracking: ${getShiprocketTrackingUrl(order.awbCode)}\nThank you for shopping with Leovra Enterprises!`
                              )}`
                            : `https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customerName}! We received your order #${order.id} at Leovra Enterprises.`
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                      >
                        <span>{order.awbCode ? 'WhatsApp Tracking' : 'WhatsApp Customer'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
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
                <div><span className="text-neutral-500">Email:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.accountEmail}</strong></div>
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
                <div><span className="text-neutral-500">Hub Pincode:</span> <strong className="text-neutral-900">{SHIPROCKET_CONFIG.pickupPincode} ({SHIPROCKET_CONFIG.pickupCity})</strong></div>
                <div><span className="text-neutral-500">Pickup Contact:</span> <strong className="text-neutral-900">Sartaj (7979968347)</strong></div>
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
                  onChange={(e) => setDispatchStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing (Packing)</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
                    { id: 'earrings', label: 'Earrings (झुमके)', sub: 'Jewelry' },
                    { id: 'tshirts', label: 'T-Shirts (टी-शर्ट)', sub: 'Apparel' },
                    { id: 'lowers', label: 'Lowers (लोअर)', sub: 'Pants/Joggers' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as ProductCategory)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        formCategory === cat.id
                          ? 'bg-neutral-950 text-white border-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{cat.label}</div>
                      <div className={`text-[10px] ${formCategory === cat.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{cat.sub}</div>
                    </button>
                  ))}
                </div>
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

              {/* Product Image Section: Device Upload + Presets + URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-700">
                    Product Photo
                  </label>
                  
                  {/* Tabs: Device / Presets / URL */}
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('device')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        imageSourceTab === 'device' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
                      }`}
                    >
                      Gallery / File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('presets')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        imageSourceTab === 'presets' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
                      }`}
                    >
                      Sample Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('url')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        imageSourceTab === 'url' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="admin-file-upload-input"
                />

                {/* Image Tab 1: Device File Upload */}
                {imageSourceTab === 'device' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDraggingFile 
                        ? 'border-amber-500 bg-amber-50/50' 
                        : 'border-neutral-200 hover:border-amber-400 bg-neutral-50/50 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                        Click to select photo from device
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Supports phone gallery photos, JPG, PNG or WebP (up to 8MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Tab 2: Sample Presets */}
                {imageSourceTab === 'presets' && (
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">
                      Click any sample image for {formCategory}:
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {SAMPLE_IMAGE_PRESETS.filter(s => s.cat === formCategory).concat(
                        SAMPLE_IMAGE_PRESETS.filter(s => s.cat !== formCategory)
                      ).slice(0, 6).map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImage(sample.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                            formImage === sample.url 
                              ? 'border-amber-500 ring-2 ring-amber-400/40' 
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                          title={sample.label}
                        >
                          <img
                            src={sample.url}
                            alt={sample.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {formImage === sample.url && (
                            <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Tab 3: URL Paste */}
                {imageSourceTab === 'url' && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Paste image link: https://..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden font-mono text-[11px] bg-neutral-50/50"
                      id="admin-form-image"
                    />
                    <p className="text-[10px] text-neutral-400">
                      You can paste any public image link from Unsplash, Imgur, or cloud storage.
                    </p>
                  </div>
                )}

                {/* Selected Image Preview Pill */}
                {formImage && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-100/70 rounded-xl border border-neutral-200">
                    <img
                      src={formImage}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-neutral-800 block">
                        Photo Ready
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate block">
                        {formImage.startsWith('data:') ? 'Custom uploaded image from device' : formImage}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Change
                    </button>
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
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 text-xs"
                  id="admin-submit-save-btn"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product to Shop'}</span>
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
    </div>
  );
};
