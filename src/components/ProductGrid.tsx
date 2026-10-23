import React, { useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductCategory, FilterOptions } from '../types';

const CATEGORY_SEO_INFO: Record<string, { title: string; hindiTitle: string; desc: string }> = {
  all: {
    title: 'Curated Fashion & Lifestyle Collection',
    hindiTitle: 'शाही संग्रह',
    desc: 'Explore handcrafted artisanal jewellery, heavy-cotton graphic streetwear t-shirts, and ultra-flexible comfort gym trackpants with Cash on Delivery across India.',
  },
  earrings: {
    title: 'Artisanal Designer Jewellery & Royal Kundan Collection',
    hindiTitle: 'शाही ज्वेलरी संग्रह',
    desc: 'Discover handcrafted antique oxidized silver jhumkas, meenakari chandbali hoops, 18K gold plated teardrop chandelier jewellery, and freshwater pearl danglers with COD in India.',
  },
  tshirts: {
    title: 'Heavyweight Graphic Streetwear T-Shirts (240+ GSM)',
    hindiTitle: 'स्ट्रीटवेयर टी-शर्ट्स',
    desc: 'Pure combed Supima cotton oversized relaxed fit graphic tees, vintage mineral acid wash boxy cuts, and athletic moisture-wicking workout t-shirts.',
  },
  lowers: {
    title: 'Men\'s High-Comfort Gym Trackpants & Tactical Cargo Joggers',
    hindiTitle: 'फ्लेक्सिबल लोअर व जॉगर्स',
    desc: 'Engineered 4-way stretch athletic workout pants, 6-pocket tactical cargo joggers, and heavy 320 GSM French terry cotton lounge sweatpants with fast doorstep dispatch.',
  },
};

export const ProductGrid: React.FC = () => {
  const { products, filters, setFilters } = useStore();

  // Filter and sort products with memoization for performance
  const sortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // In-stock filter
      if (filters.inStockOnly && (product.isOutOfStock || product.stock <= 0)) {
        return false;
      }
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
      return true;
    });

    return [...filtered].sort((a, b) => {
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
      return 0;
    });
  }, [products, filters.category, filters.searchQuery, filters.sortBy]);

  const currentCategoryInfo = CATEGORY_SEO_INFO[filters.category] || CATEGORY_SEO_INFO.all;

  const categories: { id: 'all' | ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Collection' },
    { id: 'earrings', label: 'Jewellery (ज्वेलरी)' },
    { id: 'tshirts', label: 'T-Shirts (टी-शर्ट्स)' },
    { id: 'lowers', label: 'Lowers & Joggers (लोअर)' },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 overflow-hidden" id="products-catalog-section">
      {/* Dynamic SEO Category Header */}
      <div className="mb-4 sm:mb-5 px-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-extrabold text-neutral-900 font-serif tracking-tight">
              {currentCategoryInfo.title}
            </h2>
            <span className="hidden sm:inline-block text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
              {currentCategoryInfo.hindiTitle}
            </span>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Showing {sortedProducts.length} items • 100% Genuine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed max-w-3xl">
          {currentCategoryInfo.desc}
        </p>
      </div>
      {/* Control Bar: Categories & Sorting */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 shadow-xs mb-4 sm:mb-6 space-y-2.5 sm:space-y-3 w-full">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
              className={`px-3.5 py-2.5 min-h-[48px] rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
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

        {/* Bottom row: Counter & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-neutral-100 text-[11px] sm:text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-neutral-900">
              {sortedProducts.length} items
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">
              100% In Stock & Ready to Dispatch
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <label htmlFor="sort-by-select" className="text-neutral-500 text-[11px] cursor-pointer">
              Sort:
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
              className="bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-2.5 py-1.5 min-h-[48px] text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
              id="sort-by-select"
              aria-label="Sort products by"
            >
              <option value="featured">Featured Collection</option>
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
            <ProductCard key={product.id} product={product} priority={false} />
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
              ? `No items match "${filters.searchQuery}". Try searching for jewellery, lowers, or t-shirts.`
              : 'No products currently in stock in this category.'}
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setFilters(prev => ({ ...prev, category: 'all', searchQuery: '', sortBy: 'featured' }))}
              className="px-4 py-2.5 min-h-[48px] rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              View All In-Stock Products
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
