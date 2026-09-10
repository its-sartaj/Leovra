import React from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductCategory } from '../types';

export const ProductGrid: React.FC = () => {
  const { products, filters, setFilters } = useStore();

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) {
        return false;
      }
    }
    // In-Stock only filter
    if (filters.inStockOnly && (product.isOutOfStock || product.stock <= 0)) {
      return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (filters.sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (filters.sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (filters.sortBy === 'stock') {
      return b.stock - a.stock;
    }
    // featured: put in-stock first, then by date
    if (a.isOutOfStock !== b.isOutOfStock) {
      return a.isOutOfStock ? 1 : -1;
    }
    return 0;
  });

  const inStockCount = products.filter(p => !p.isOutOfStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.isOutOfStock || p.stock <= 0).length;

  const categories: { id: 'all' | ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Collection' },
    { id: 'earrings', label: 'Earrings (झुमके)' },
    { id: 'tshirts', label: 'T-Shirts (टी-शर्ट्स)' },
    { id: 'lowers', label: 'Lowers & Joggers (लोअर)' },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 overflow-hidden" id="products-catalog-section">
      {/* Control Bar: Categories, Filters, Sorting */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 shadow-xs mb-4 sm:mb-6 space-y-2.5 sm:space-y-3 w-full">
        {/* Top row: Category Pills & In-stock toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* Category Pills with smooth horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full min-w-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  filters.category === cat.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                id={`filter-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* In-Stock Only Toggle Switch */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs font-semibold text-neutral-800 self-start sm:self-auto shrink-0">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-neutral-300"
            />
            <span>In-Stock Only</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {inStockCount}
            </span>
          </label>
        </div>

        {/* Bottom row: Counter & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-neutral-100 text-[11px] sm:text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-neutral-900">
              {sortedProducts.length} items
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">
              {inStockCount} in stock
            </span>
            {outOfStockCount > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-600 font-medium">
                  {outOfStockCount} out of stock
                </span>
              </>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500 text-[11px]">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
              id="sort-by-select"
            >
              <option value="featured">Featured & Availability</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="stock">Highest Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid: 2-column on mobile phones for optimal e-commerce layout! */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 w-full" id="product-list-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No Products Found</h3>
          <p className="text-xs text-neutral-500">
            {filters.searchQuery 
              ? `No items match "${filters.searchQuery}". Try searching for earrings, lowers, or t-shirts.`
              : 'Try turning off "In-Stock Only" or choosing another category.'}
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setFilters({ category: 'all', searchQuery: '', sortBy: 'featured', inStockOnly: false })}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
