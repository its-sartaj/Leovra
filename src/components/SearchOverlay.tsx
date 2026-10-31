import React, { useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectProduct
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-start animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full bg-white shadow-2xl border-b border-gray-200 p-5 sm:p-7 animate-slide-down gpu-smooth"
      >
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-center border-b-2 border-black pb-2">
            <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
            <input
              autoFocus
              type="text"
              aria-label="Search catalog products"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search products, tees, lowers, styles, SKUs..."
              className="w-full text-base sm:text-lg focus:outline-none bg-transparent placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-gray-400 hover:text-black active:scale-90 mr-1 text-xs cursor-pointer"
                title="Clear input"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close search overlay"
              className="p-1 text-gray-400 hover:text-black active:scale-90 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {searchQuery.trim().length > 1 && (
            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-gray-100 touch-pan">
              {searchResults.length === 0 ? (
                <p className="py-6 text-xs text-gray-500 text-center">
                  No matching products found for "{searchQuery}".
                </p>
              ) : (
                searchResults.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="py-2.5 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 px-2.5 rounded-sm transition-all"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-11 h-14 object-contain bg-gray-100 shrink-0 rounded-xs p-0.5"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-black">{product.title}</p>
                      <p className="text-gray-500 font-bold mt-0.5">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
