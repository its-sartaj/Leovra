import React, { useState, useEffect } from 'react';
import { Menu, Search, User, ShoppingBag, Truck } from 'lucide-react';
import { Logo } from './Logo';

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

export const Header: React.FC<HeaderProps> = ({
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
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

      {/* Main Sticky Navbar with Smooth Backdrop Blur and Elevation on Scroll */}
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled
            ? 'border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]'
            : 'border-[#f0f0f0]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Left Actions: Hamburger Menu & Search */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="p-1.5 -ml-1 text-[#121212] hover:opacity-75 active:scale-90 focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[1.75]" />
            </button>
            <button
              onClick={onOpenSearch}
              aria-label="Search Catalog"
              className="p-1.5 text-[#121212] hover:opacity-75 active:scale-90 focus:outline-none transition-all duration-150 cursor-pointer"
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
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onOpenAccount}
              aria-label="Customer Account & Orders"
              className="p-1.5 text-[#121212] hover:opacity-75 active:scale-90 focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <User className="w-5 h-5 stroke-[1.75]" />
            </button>
            <button
              onClick={onOpenCart}
              aria-label="View Shopping Bag"
              className="p-1.5 -mr-1 text-[#121212] hover:opacity-75 active:scale-90 relative focus:outline-none transition-all duration-150 cursor-pointer"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#121212] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform animate-scale-in shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
