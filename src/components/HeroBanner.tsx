import React from 'react';
import { Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

export const HeroBanner: React.FC = () => {
  const { products, filters, setFilters, businessPhone } = useStore();

  const getCategoryInStock = (cat: ProductCategory) => {
    return products.filter((p) => p.category === cat && !p.isOutOfStock && p.stock > 0).length;
  };

  const categoryCards: {
    id: ProductCategory;
    title: string;
    hindiTitle: string;
    tagline: string;
  }[] = [
    {
      id: 'earrings',
      title: 'Earrings',
      hindiTitle: 'झुमके',
      tagline: 'Oxidized, Kundan & Studs',
    },
    {
      id: 'tshirts',
      title: 'T-Shirts',
      hindiTitle: 'टी-शर्ट्स',
      tagline: 'Oversized Streetwear & Cotton',
    },
    {
      id: 'lowers',
      title: 'Lowers & Joggers',
      hindiTitle: 'लोअर',
      tagline: 'Comfort Cargo & Stretch',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 pt-2 sm:pt-4 pb-3 sm:pb-6 overflow-hidden" id="hero-banner-section">
      {/* Top Banner Hero Card */}
      <div className="relative rounded-2xl md:rounded-3xl bg-neutral-950 text-white overflow-hidden shadow-xl border border-neutral-800 w-full transform-gpu">
        {/* Background gradient decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-2xl pointer-events-none transform-gpu" />

        <div className="relative z-10 p-3.5 sm:p-8 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-6 w-full">
          <div className="max-w-2xl space-y-2 sm:space-y-3 w-full min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Express Doorstep Delivery • Artisanal & Streetwear</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif break-words">
              Elevate Your Style with <span className="text-amber-400">Leovra Enterprises</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-xl">
              Curated artisanal earrings, heavyweight streetwear t-shirts, and ultra-flexible comfort lowers with instant dispatch to your doorstep.
            </p>

            {/* Quick CTAs */}
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3 w-full">
              <a
                href={`tel:${businessPhone}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 text-center whitespace-nowrap"
                id="hero-call-now-btn"
              >
                <span>Call: +91 {businessPhone}</span>
              </a>
              <a
                href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I would like to place an order from your catalog.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-700 transition-all active:scale-95 text-center whitespace-nowrap"
                id="hero-whatsapp-order-btn"
              >
                <span>Order via WhatsApp</span>
                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              </a>
            </div>
          </div>

          {/* Quick Value Points */}
          <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-1 gap-2 shrink-0 pt-2 sm:pt-0 border-t border-neutral-800/80 md:border-t-0">
            <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 p-2 sm:px-3.5 sm:py-2 rounded-xl text-left min-w-0">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white truncate">Fast Delivery</div>
                <div className="text-[9px] sm:text-[11px] text-neutral-400 truncate">Doorstep shipping</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 p-2 sm:px-3.5 sm:py-2 rounded-xl text-left min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white truncate">Quality Checked</div>
                <div className="text-[9px] sm:text-[11px] text-neutral-400 truncate">Inspected items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Categories Showcase: Clean name-only cards without photos */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-5 w-full">
        {categoryCards.map((card) => {
          const isSelected = filters.category === card.id;
          const inStockCount = getCategoryInStock(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setFilters((prev) => ({ 
                ...prev, 
                category: prev.category === card.id ? 'all' : card.id 
              }))}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all cursor-pointer p-2.5 sm:p-4 text-left flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-500/30 shadow-xs'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/80 shadow-2xs'
              }`}
              id={`hero-category-card-${card.id}`}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
                  <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-200/70 text-amber-900' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {card.hindiTitle}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <h3 className={`text-xs sm:text-base font-extrabold leading-tight truncate transition-colors ${
                  isSelected ? 'text-amber-900' : 'text-neutral-900 group-hover:text-amber-700'
                }`}>
                  {card.title}
                </h3>
                
                <p className="hidden sm:block text-xs text-neutral-500 line-clamp-1 mt-0.5">
                  {card.tagline}
                </p>
                
                <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 mt-1 truncate">
                  {inStockCount} In Stock
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 w-full">
                <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1 group-hover:text-neutral-900">
                  Filter category <ArrowRight className="w-3 h-3 text-amber-600" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
