import React, { useState, useEffect } from 'react';
import { Menu, Search, User, ShoppingBag, Truck } from 'lucide-react';
import { Logo } from './Logo';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenTracking: () => void;
  onResetToHome: () => void;
  announcementText: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  cartCount,
  onOpenCart,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenAccount,
  onOpenTracking,
  onResetToHome,
  announcementText
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe(setCurrentUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Black Minimal Announcement Bar */}
      <div className="w-full bg-[#121212] text-white text-[11px] font-medium py-2 px-4 text-center tracking-wider uppercase flex items-center justify-center space-x-2 select-none">
        <span>{announcementText}</span>
        <button
          onClick={onOpenTracking}
          className="hidden sm:inline-flex items-center text-gray-300 hover:text-white underline text-[10px] ml-4 transition-colors cursor-pointer active:scale-95"
        >
          <Truck className="w-3 h-3 mr-1" /> Track Order
        </button>
      </div>

      {/* Main Sticky Navbar with Smooth Elevation on Scroll */}
      <header
        className={`sticky top-0 z-40 bg-white/98 border-b transition-[box-shadow,border-color] duration-150 ${
          isScrolled
            ? 'border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]'
            : 'border-[#f0f0f0]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Left Actions: Hamburger Menu & Search */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#121212] hover:opacity-75 active:scale-90 focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[1.75]" />
            </button>
            <button
              onClick={onOpenSearch}
              aria-label="Search Catalog"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#121212] hover:opacity-75 active:scale-90 focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Center Brand Logo */}
          <div className="flex-1 flex justify-center py-1">
            <Logo
              size="md"
              showText={true}
              onClick={onResetToHome}
              className="cursor-pointer active:scale-98 transition-transform duration-150"
            />
          </div>

          {/* Right Actions: Account & Cart Bag */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={onOpenAccount}
              aria-label="Customer Account & Orders"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#121212] hover:opacity-85 active:scale-95 focus:outline-none transition-all duration-150 cursor-pointer"
            >
              {currentUser ? (
                <div className="flex items-center space-x-1.5">
                  <div className="relative">
                    {currentUser.picture ? (
                      <img
                        src={currentUser.picture}
                        alt={currentUser.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-neutral-800 max-w-[85px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
            <button
              onClick={onOpenCart}
              aria-label="View Shopping Bag"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#121212] hover:opacity-75 active:scale-90 relative focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#121212] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform animate-scale-in shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
});
