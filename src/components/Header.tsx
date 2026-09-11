import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Menu, 
  MessageCircle,
  User
} from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    setIsCartOpen, 
    setIsSideNavOpen,
    currentCustomer,
    setIsAccountModalOpen,
    setAccountModalTab,
    filters, 
    setFilters,
    businessPhone
  } = useStore();

  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleCategoryClick = (cat: 'all' | ProductCategory) => {
    setFilters(prev => ({ ...prev, category: cat }));
    if (currentView !== 'store') {
      setCurrentView('store');
    }
    setIsMobileMenuOpen(false);
  };

  const navCategories: { id: 'all' | ProductCategory; label: string; sub: string }[] = [
    { id: 'all', label: 'All Items', sub: 'सभी प्रोडक्ट्स' },
    { id: 'earrings', label: 'Earrings', sub: 'झुमके व बालियां' },
    { id: 'tshirts', label: 'T-Shirts', sub: 'टी-शर्ट्स' },
    { id: 'lowers', label: 'Lowers & Joggers', sub: 'लोअर व ट्रैक पैंट' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white border-b border-neutral-200/90 shadow-2xs transform-gpu will-change-transform" id="main-header">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3.5 w-full">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 md:gap-6">
          
          {/* Brand Logo - shrink-0 ensures it NEVER gets compressed or overlapped */}
          <button 
            onClick={() => {
              setCurrentView('store');
              setFilters(prev => ({ ...prev, category: 'all', searchQuery: '' }));
            }} 
            className="text-left focus:outline-hidden cursor-pointer shrink-0 z-10"
            id="header-logo-btn"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Search Bar (Clean, spacious, modern luxury e-commerce style, zero overlap) */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-3 lg:mx-6 min-w-0 relative">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search earrings, oversized tees, gym track pants..."
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                  if (currentView !== 'store') setCurrentView('store');
                }}
                className="w-full bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 pl-10 pr-9 py-2 h-10 rounded-xl border border-neutral-200/90 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all outline-hidden shadow-2xs"
                id="desktop-search-input"
              />
              
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-200/60 cursor-pointer transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons - Consistent Professional E-Commerce Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 border ${
                showSearchInput 
                  ? 'bg-amber-50 text-amber-700 border-amber-400 ring-2 ring-amber-400/20' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 border-neutral-200/90'
              }`}
              aria-label="Search Products"
              id="mobile-search-toggle"
              title="Search products"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {/* Direct WhatsApp Call / Inquire Button (Desktop & Tablet) */}
            <a
              href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I have an inquiry regarding your products.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3.5 h-10 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 font-semibold text-xs border border-neutral-200/90 transition-all shadow-2xs hover:border-neutral-300 active:scale-95"
              id="header-whatsapp-chat-btn"
              title="Chat with Leovra Enterprises on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </a>

            {/* Customer Account Button */}
            <button
              onClick={() => {
                if (currentCustomer) {
                  setAccountModalTab('orders');
                } else {
                  setAccountModalTab('register');
                }
                setIsAccountModalOpen(true);
              }}
              className="relative flex items-center justify-center gap-2 w-9 h-9 sm:w-10 sm:h-10 lg:w-auto lg:px-3.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 border border-neutral-200/90 hover:border-neutral-300 transition-all shadow-2xs cursor-pointer active:scale-95"
              id="header-account-btn"
              aria-label={currentCustomer ? `Account: ${currentCustomer.name}` : "Customer Account"}
              title={currentCustomer ? `Logged in: ${currentCustomer.name} - View Orders` : "Customer Account / Login"}
            >
              {currentCustomer ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 font-bold text-[10px] flex items-center justify-center shadow-2xs shrink-0">
                  {currentCustomer.name ? currentCustomer.name.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <User className="w-4 h-4 text-neutral-700 stroke-[1.8] shrink-0" />
              )}
              <span className="hidden lg:inline text-xs font-semibold text-neutral-800 truncate max-w-[85px]">
                {currentCustomer ? currentCustomer.name.split(' ')[0] : 'Account'}
              </span>
              {currentCustomer && (
                <span className="lg:hidden absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Desktop Quick Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hidden sm:flex items-center justify-center gap-2 w-10 h-10 lg:w-auto lg:px-3.5 rounded-xl text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-50 transition-all font-semibold text-xs border border-neutral-200/90 hover:border-neutral-300 cursor-pointer shadow-2xs active:scale-95"
              id="header-cart-btn"
              aria-label="View Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-700 stroke-[1.8] shrink-0" />
              <span className="hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-[10px] leading-none shrink-0">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 3-Row Menu Button - Opens Full Services & Store Drawer */}
            <button
              onClick={() => setIsSideNavOpen(true)}
              className="flex items-center justify-center gap-2 w-9 h-9 sm:w-10 sm:h-10 lg:w-auto lg:px-3.5 rounded-xl text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-50 transition-all border border-neutral-200/90 hover:border-neutral-300 cursor-pointer shadow-2xs active:scale-95"
              aria-label="Open Services and Navigation Menu"
              id="header-menu-btn"
              title="View all services, categories, and customer support"
            >
              <Menu className="w-4 h-4 stroke-[1.8] shrink-0" />
              <span className="hidden lg:inline text-xs font-semibold text-neutral-800">Services</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar (Clean, full-width, modern touch input) */}
        {showSearchInput && (
          <div className="md:hidden pt-2 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search earrings, t-shirts, lowers..."
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                  if (currentView !== 'store') setCurrentView('store');
                }}
                className="w-full bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white text-sm font-medium text-neutral-900 placeholder:text-neutral-400 pl-10 pr-10 py-2.5 h-10 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-hidden shadow-2xs"
                id="mobile-search-input-field"
                autoFocus
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1 pt-2.5 border-t border-neutral-100 mt-2">
          {/* Amazon-style ☰ All Services Button */}
          <button
            onClick={() => setIsSideNavOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-950 hover:bg-amber-500/25 border border-amber-500/30 transition-all mr-1.5 cursor-pointer shadow-2xs"
            id="desktop-nav-all-services-btn"
          >
            <Menu className="w-3.5 h-3.5 text-amber-700" />
            <span>All Services & Features</span>
          </button>
          {navCategories.map((cat) => {
            const isActive = currentView === 'store' && filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
                id={`desktop-nav-cat-${cat.id}`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
