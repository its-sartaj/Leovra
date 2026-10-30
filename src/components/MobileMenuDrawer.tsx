import React from 'react';
import { X, Truck } from 'lucide-react';
import { Logo } from './Logo';
import { StoreSettings } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin?: () => void;
  settings: StoreSettings;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenTracking,
  onOpenAdmin,
  settings
}) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-over Menu Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-xs bg-white p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <Logo size="xs" showText={true} />
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-black transition-colors cursor-pointer"
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
                className="text-left text-black hover:translate-x-1 transition-transform cursor-pointer"
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
                className="text-left text-xs font-bold text-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Your Order</span>
              </button>

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="text-left text-xs font-semibold text-gray-500 hover:text-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
                >
                  <span>Owner Admin Portal</span>
                </button>
              )}
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
