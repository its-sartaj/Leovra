import React, { useState, useEffect, useMemo } from 'react';
import { storeService } from './services/storeService';
import { Product, CartItem, Order, StoreSettings } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { PolicyModal } from './components/PolicyModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { MessageCircle, ArrowUp } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('#admin')) return 'admin';
    }
    return 'store';
  });

  const [products, setProducts] = useState<Product[]>(storeService.getProducts());
  const [settings, setSettings] = useState<StoreSettings>(storeService.getSettings());

  // Shopping Bag Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lc_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation & Category Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modals & Drawers Visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [policyModal, setPolicyModal] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: ''
  });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Subscribe to real-time store changes across tabs & window focus
  useEffect(() => {
    const handleSync = () => {
      setProducts(storeService.getProducts());
      setSettings(storeService.getSettings());
    };
    const unsubscribe = storeService.subscribe(handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('visibilitychange', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('visibilitychange', handleSync);
    };
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lc_cart_v1', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Sync route and hash for admin view
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('#admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('store');
        setProducts(storeService.getProducts());
        setSettings(storeService.getSettings());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateView = (view: 'store' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else {
      window.history.pushState(null, '', '/');
      setProducts(storeService.getProducts());
      setSettings(storeService.getSettings());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO Schema.org ItemList injection
  useEffect(() => {
    let scriptTag = document.getElementById('jsonld-product-schema') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-product-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'LEOVRA CLOTHES Streetwear Catalog',
      numberOfItems: products.length,
      itemListElement: products
        .filter(p => p.isActive)
        .map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: p.title,
            description: p.description,
            image: p.image,
            sku: p.sku,
            brand: {
              '@type': 'Brand',
              name: 'LEOVRA CLOTHES'
            },
            offers: {
              '@type': 'Offer',
              price: p.price,
              priceCurrency: 'INR',
              availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition'
            }
          }
        }))
    };
    scriptTag.textContent = JSON.stringify(schema);
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (!p.isActive) return false;
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'new') return p.isNew;
        if (selectedCategory === 'bestsellers') return p.isBestseller;
        if (selectedCategory === 'mens_tshirts') return p.category === 'mens_tshirts';
        if (selectedCategory === 'womens_tshirts') return p.category === 'womens_tshirts';
        if (selectedCategory === 'mens_lowers') return p.category === 'mens_lowers';
        if (selectedCategory === 'womens_lowers') return p.category === 'womens_lowers';
        if (selectedCategory === 'mens_casual') return p.category === 'mens_casual' || p.category === 'casual';
        if (selectedCategory === 'jewellery') return p.category === 'jewellery' || p.category === 'earrings';
        return p.category === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Featured
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      });
  }, [products, selectedCategory, sortBy]);

  // Live search query matching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(
      p =>
        p.isActive &&
        (p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number) => {
    const idx = cart.findIndex(it => it.productId === product.id && it.size === size && it.color === color);
    if (idx > -1) {
      const next = [...cart];
      next[idx].quantity += quantity;
      setCart(next);
    } else {
      setCart([
        ...cart,
        {
          id: `${product.id}-${size}-${color}-${Date.now()}`,
          productId: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          size,
          color,
          quantity,
          sku: product.sku
        }
      ]);
    }
    showToast(`Added ${quantity} × ${product.title} to bag`);
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    const next = [...cart];
    next[idx].quantity += delta;
    if (next[idx].quantity <= 0) {
      next.splice(idx, 1);
    }
    setCart(next);
  };

  const handleRemoveItem = (idx: number) => {
    const next = [...cart];
    next.splice(idx, 1);
    setCart(next);
  };

  const handleBuyNow = (product: Product, size: string, color: string, quantity: number) => {
    handleAddToCart(product, size, color, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    setCompletedOrder(order);
    showToast(`Order #${order.orderNumber} placed successfully!`);
  };

  const handleTrackOrderFromElsewhere = (orderNumber: string) => {
    setTrackingOrderNumber(orderNumber);
    setIsTrackingOpen(true);
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'new':
        return 'New Arrivals';
      case 'bestsellers':
        return 'Best Sellers';
      case 'mens_tshirts':
        return "Men's T-Shirts";
      case 'womens_tshirts':
        return "Women's T-Shirts";
      case 'mens_lowers':
        return "Men's Lowers";
      case 'womens_lowers':
        return "Women's Lowers";
      case 'mens_casual':
        return "Casual Wear";
      case 'jewellery':
        return 'Designer Jewellery';
      default:
        return 'All Products';
    }
  };

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  // If in dedicated admin view
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToStore={() => navigateView('store')}
        onViewInvoice={order => setInvoiceOrder(order)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#121212] flex flex-col font-sans selection:bg-black selection:text-white relative">
      {/* Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#121212] text-white text-xs px-4 py-3 shadow-2xl rounded-none flex items-center space-x-2 animate-bounce-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Top Announcement Bar */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenSearch={() => {
          setIsSearchOpen(true);
          setSearchQuery('');
        }}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenTracking={() => {
          setTrackingOrderNumber('');
          setIsTrackingOpen(true);
        }}
        onResetToHome={() => {
          setSelectedCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        announcementText={settings.announcementText}
      />

      <main className="flex-1">
        {/* Cinematic Fashion Hero Showcase */}
        <HeroBanner
          title={settings.heroTitle}
          subtitle={settings.heroSubtitle}
          buttonText={settings.heroButtonText}
          imageUrl={settings.heroImageUrl}
          onCtaClick={() => {
            setSelectedCategory('all');
            const el = document.getElementById('catalogSection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Filter Header & Navigation Pills */}
        <section id="catalogSection" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
                {getCategoryTitle(selectedCategory)}
              </h2>
              <p className="text-xs text-gray-400 font-medium tracking-wider mt-0.5">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} available
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="py-1 px-2.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:border-black outline-none cursor-pointer"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Horizontal Scrolling Category Filter Pills */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-3 text-xs sm:text-sm">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'bestsellers', label: 'Best Sellers' },
              { id: 'mens_tshirts', label: "Men's T-Shirts" },
              { id: 'womens_tshirts', label: "Women's T-Shirts" },
              { id: 'mens_lowers', label: "Men's Lowers" },
              { id: 'womens_lowers', label: "Women's Lowers" },
              { id: 'mens_casual', label: 'Casual Wear' },
              { id: 'jewellery', label: 'Jewellery' }
            ].map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full border transition-all font-medium text-xs sm:text-sm cursor-pointer ${
                    isSelected
                      ? 'border-black bg-black text-white font-semibold'
                      : 'border-gray-200 text-gray-700 hover:border-black'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Grid Showcase */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-16">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-medium">No items found in this collection.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-3 text-xs underline font-bold text-black cursor-pointer"
              >
                View all products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={p => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Buttons: Back to top & WhatsApp Support */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2.5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-10 h-10 rounded-full bg-white text-neutral-700 shadow-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <a
          href={`https://wa.me/91${settings.supportPhone.replace(/\D/g, '') || '7979968347'}?text=${encodeURIComponent('Hello LEOVRA CLOTHES! I have an inquiry about your products.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl border border-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="Direct WhatsApp Support"
          aria-label="Direct WhatsApp Support"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300" />
          </div>
          <span className="text-xs font-bold whitespace-nowrap">WhatsApp</span>
        </a>
      </div>

      {/* Footer */}
      <Footer
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalogSection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPolicy={(title, content) => setPolicyModal({ open: true, title, content })}
        onOpenTracking={() => {
          setTrackingOrderNumber('');
          setIsTrackingOpen(true);
        }}
        onOpenAdmin={() => navigateView('admin')}
        settings={settings}
      />

      {/* Modals & Slide-over Drawers */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, size, color, qty) => {
          handleAddToCart(prod, size, color, qty);
          setSelectedProduct(null);
          setIsCartOpen(true);
        }}
        onBuyNow={(prod, size, color, qty) => handleBuyNow(prod, size, color, qty)}
        onOpenPolicy={(title, content) => setPolicyModal({ open: true, title, content })}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        freeShippingThreshold={settings.freeShippingThreshold}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
        freeShippingThreshold={settings.freeShippingThreshold}
        standardShippingFee={settings.standardShippingFee}
        upiId={settings.upiId}
      />

      <OrderConfirmationModal
        order={completedOrder}
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
        onTrackOrder={handleTrackOrderFromElsewhere}
        onViewInvoice={order => setInvoiceOrder(order)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingOrderNumber}
        onViewInvoice={order => setInvoiceOrder(order)}
      />

      <InvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        brandName={settings.brandName}
      />

      <PolicyModal
        isOpen={policyModal.open}
        onClose={() => setPolicyModal({ open: false, title: '', content: '' })}
        title={policyModal.title}
        content={policyModal.content}
      />

      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSendPasscode={val => showToast(`Login passcode sent to ${val || 'your email'}`)}
      />

      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalogSection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTracking={() => {
          setTrackingOrderNumber('');
          setIsTrackingOpen(true);
        }}
        onOpenAdmin={() => navigateView('admin')}
        settings={settings}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectProduct={prod => {
          setSelectedProduct(prod);
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
      />
    </div>
  );
}
