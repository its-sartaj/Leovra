import React, { useRef, useEffect } from 'react';
import { X, Truck } from 'lucide-react';
import { Logo } from './Logo';
import { StoreSettings } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenTracking: () => void;
  settings: StoreSettings;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenTracking,
  settings
}) => {
  const touchStartX = useRef<number | null>(null);

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch swipe left to dismiss menu on phone
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX < -45) {
      onClose();
    }
    touchStartX.current = null;
  };

  const categories = [
    { id: 'all', label: 'Home / Shop All' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'bestsellers', label: 'Best Sellers' },
    { id: 'mens_tshirts', label: "Men's T-Shirts" },
    { id: 'womens_tshirts', label: "Women's T-Shirts" },
    { id: 'mens_lowers', label: "Men's Lowers" },
    { id: 'womens_lowers', label: "Women's Lowers" },
    { id: 'mens_casual', label: 'Casual Wear' },
    { id: 'jewellery', label: 'Jewellery' }
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        } cursor-pointer`}
      />

      {/* Slide-over Menu Panel with Silky Spring Curve and Touch Swipe */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`absolute left-0 top-0 bottom-0 w-[84%] max-w-xs bg-white p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-smooth touch-pan ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <Logo size="xs" showText={true} />
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1.5 text-gray-500 hover:text-black active:scale-90 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-6 flex flex-col space-y-3.5 text-sm font-medium">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className="text-left text-black hover:translate-x-1.5 active:translate-x-2 transition-transform duration-150 cursor-pointer py-0.5"
              >
                {cat.label}
              </button>
            ))}

            <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenTracking();
                }}
                className="text-left text-xs font-bold text-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer hover:translate-x-1 transition-transform"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Your Order</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Support Section at Bottom */}
        <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
          <p className="font-bold text-black">Customer Helpline</p>
          <p>{settings.supportEmail}</p>
          <p>{settings.supportHours}</p>
        </div>
      </div>
    </div>
  );
};
