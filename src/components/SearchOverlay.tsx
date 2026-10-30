import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-lg border-b border-gray-200 p-6 animate-slide-down">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center border-b-2 border-black pb-2">
          <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search products, tees, lowers, styles, SKUs..."
            className="w-full text-base sm:text-lg focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {searchQuery.trim().length > 1 && (
          <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-gray-100">
            {searchResults.length === 0 ? (
              <p className="py-4 text-xs text-gray-500 text-center">
                No matching products found for "{searchQuery}".
              </p>
            ) : (
              searchResults.map(product => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="py-2.5 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 transition-colors"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="w-10 h-10 object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-black">{product.title}</p>
                    <p className="text-gray-500 font-bold">
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
  );
};
