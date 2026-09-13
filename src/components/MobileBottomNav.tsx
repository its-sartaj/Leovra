import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  Flame, 
  User, 
  ShoppingBag 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    setIsCartOpen,
    setIsSideNavOpen,
    setIsAccountModalOpen,
    setAccountModalTab,
    currentCustomer,
    filters, 
    setFilters
  } = useStore();

  // Only render on consumer store view
  if (currentView === 'admin') {
    return null;
  }

  const isHomeActive = filters.category === 'all' && filters.sortBy === 'featured';
  const isTrendingActive = filters.sortBy === 'rating';

  const handleHomeClick = () => {
    setCurrentView('store');
    setFilters(prev => ({ ...prev, category: 'all', sortBy: 'featured', searchQuery: '' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrendingClick = () => {
    setCurrentView('store');
    setFilters(prev => ({ ...prev, sortBy: 'rating' }));
    const grid = document.getElementById('products-catalog-section') || document.getElementById('products-grid-section');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleCategoriesClick = () => {
    setIsSideNavOpen(true);
  };

  const handleAccountClick = () => {
    if (currentCustomer) {
      setAccountModalTab('orders');
    } else {
      setAccountModalTab('register');
    }
    setIsAccountModalOpen(true);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200/90 shadow-[0_-2px_15px_rgba(0,0,0,0.05)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transform-gpu will-change-transform"
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        
        {/* 1. Home Button */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Home"
          className={`group flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
            isHomeActive
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 font-medium hover:text-neutral-900'
          }`}
          id="mobile-nav-home"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">
            Home
          </span>
        </button>

        {/* 2. Categories Button */}
        <button
          type="button"
          onClick={handleCategoriesClick}
          aria-label="Categories"
          className="group flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl text-neutral-500 font-medium hover:text-neutral-900 transition-all cursor-pointer active:scale-90"
          id="mobile-nav-categories"
          title="Browse All Categories & Collections"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <LayoutGrid className="w-5 h-5 stroke-[1.75] group-hover:stroke-[2.25] transition-transform group-hover:scale-105" />
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">
            Categories
          </span>
        </button>

        {/* 3. Trending / Best Sellers Button */}
        <button
          type="button"
          onClick={handleTrendingClick}
          aria-label="Trending Products"
          className={`group flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
            isTrendingActive
              ? 'text-amber-600 font-bold'
              : 'text-neutral-500 font-medium hover:text-neutral-900'
          }`}
          id="mobile-nav-trending"
          title="Trending Items & Best Sellers"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <Flame className={`w-5 h-5 transition-transform ${isTrendingActive ? 'scale-110 text-amber-500 fill-amber-500/20' : 'stroke-[1.75]'}`} />
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-rose-500 text-white font-black text-[8px] leading-none shadow-2xs animate-pulse">
              HOT
            </span>
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">
            Trending
          </span>
        </button>

        {/* 4. Bag / Cart Button */}
        <button
          type="button"
          onClick={handleCartClick}
          aria-label="Shopping Cart"
          className="group relative flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl text-neutral-900 font-medium transition-all cursor-pointer active:scale-90"
          id="mobile-nav-cart"
          title="Open Shopping Bag"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <ShoppingBag className="w-5 h-5 stroke-[1.75] group-hover:stroke-[2.25] transition-transform group-hover:scale-105" />
            {cartCount > 0 ? (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-4 px-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-bold tracking-tight leading-tight mt-0.5">
            Cart
          </span>
        </button>

        {/* 5. Customer Account & Orders Button (Replaces open orders button) */}
        <button
          type="button"
          onClick={handleAccountClick}
          aria-label="Customer Account"
          className="group flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl text-neutral-600 font-medium hover:text-neutral-950 transition-all cursor-pointer active:scale-90"
          id="mobile-nav-account"
          title="Customer Account & My Orders"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <User className="w-5 h-5 stroke-[1.75] group-hover:stroke-[2.25] transition-transform group-hover:scale-105" />
            {currentCustomer && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[55px]">
            {currentCustomer ? (currentCustomer.name?.trim().split(' ')[0] || 'Account') : 'Account'}
          </span>
        </button>

      </div>
    </nav>
  );
};
