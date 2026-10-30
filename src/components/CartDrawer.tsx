import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  freeShippingThreshold: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeShippingThreshold
}) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-over Container */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-[#121212]">Shopping Bag</span>
            <span className="text-xs bg-gray-100 font-semibold px-2 py-0.5 rounded-full text-gray-700">
              ({totalCount})
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Milestone Banner */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-700 font-medium mb-1.5">
            {hasFreeShipping ? (
              <span className="text-emerald-700 font-bold">
                🎉 Congratulations! You unlocked Free Delivery nationwide.
              </span>
            ) : (
              <span>
                Add <strong>Rs. {amountNeeded.toLocaleString()}</strong> more to unlock{' '}
                <strong className="text-black">Free Delivery!</strong>
              </span>
            )}
          </p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${hasFreeShipping ? 'bg-emerald-600' : 'bg-black'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bag Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-500">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3 stroke-[1.25]" />
              <p className="text-sm font-semibold text-black">Your bag is empty</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Explore our minimal streetwear tees, lowers, and casual collections.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${idx}`} className="py-4 flex space-x-3 text-xs">
                <div className="w-20 h-24 bg-[#f3f3f3] shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-black pr-2 text-xs line-clamp-1">{item.title}</h4>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Size: <span className="font-medium text-black">{item.size}</span> • Color:{' '}
                      <span className="font-medium text-black">{item.color}</span>
                    </p>
                    <p className="font-bold text-black mt-1">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-gray-400 font-normal ml-1">
                          (Rs. {item.price.toLocaleString()} each)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center border border-gray-200 w-fit mt-2">
                    <button
                      onClick={() => onUpdateQuantity(idx, -1)}
                      className="px-2.5 py-0.5 hover:bg-gray-100 text-xs text-gray-600 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-[11px]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, 1)}
                      className="px-2.5 py-0.5 hover:bg-gray-100 text-xs text-gray-600 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-base text-black">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-4">
              {hasFreeShipping ? (
                <span className="text-emerald-700 font-medium">Free Shipping included!</span>
              ) : (
                'Shipping calculated at checkout.'
              )}
            </p>
            <button
              onClick={onProceedToCheckout}
              className="w-full bg-[#121212] hover:bg-black text-white py-3.5 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Proceed to Checkout • Rs. {subtotal.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
