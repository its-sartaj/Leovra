import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

const HERO_SLIDES = [
  {
    id: 'earrings' as ProductCategory,
    categoryName: 'Artisanal Jewelry',
    hindiTag: 'शाही झुमके संग्रह',
    title: 'Royal Oxidized Silver Chandbali',
    tagline: 'Handcrafted Heritage Design',
    price: '₹399',
    originalPrice: '₹799',
    discount: '50% OFF',
    rating: '4.9',
    reviews: '142',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    floatingBadge1: '✨ Pure Silver Finish',
    floatingBadge2: '⭐ 4.9 (140+ Reviews)',
    glowColor: 'from-amber-500/30 via-orange-500/20 to-transparent',
    borderGlow: 'border-amber-500/40',
  },
  {
    id: 'tshirts' as ProductCategory,
    categoryName: 'Streetwear Apparel',
    hindiTag: 'ट्रेंडिंग टी-शर्ट्स',
    title: 'Oversized Streetwear Black Tee',
    tagline: '240 GSM Pure Supima Cotton',
    price: '₹499',
    originalPrice: '₹999',
    discount: '50% OFF',
    rating: '4.8',
    reviews: '98',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    floatingBadge1: '🔥 Best Seller #1',
    floatingBadge2: '⚡ Bio-Washed Cotton',
    glowColor: 'from-purple-500/30 via-indigo-500/20 to-transparent',
    borderGlow: 'border-purple-500/40',
  },
  {
    id: 'lowers' as ProductCategory,
    categoryName: 'Utility Streetwear',
    hindiTag: 'फ्लेक्सिबल लोअर',
    title: 'Comfort Cargo Joggers with Pockets',
    tagline: '4-Way Breathable Stretch Knit',
    price: '₹599',
    originalPrice: '₹1,199',
    discount: '50% OFF',
    rating: '4.9',
    reviews: '116',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    floatingBadge1: '👖 Deep Zipper Pockets',
    floatingBadge2: '🚚 Free COD Available',
    glowColor: 'from-emerald-500/30 via-teal-500/20 to-transparent',
    borderGlow: 'border-emerald-500/40',
  },
];

export const HeroBanner: React.FC = () => {
  const { products, filters, setFilters, businessPhone } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide transition every 3.8s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = HERO_SLIDES[activeSlide];

  const handleExploreCategory = (cat: ProductCategory) => {
    setFilters((prev) => ({ ...prev, category: cat }));
    const catalogEl = document.getElementById('products-catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      <div className="relative rounded-2xl md:rounded-3xl bg-neutral-950 text-white overflow-hidden shadow-2xl border border-neutral-800 w-full transform-gpu">
        {/* Dynamic Background gradient decorative glow */}
        <div className={`absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br ${currentSlide.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-1000 animate-hero-glow`} />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 w-full">
          
          {/* Left Column: Heading, Pitch & CTAs */}
          <div className="max-w-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Express Doorstep Delivery • Artisanal & Streetwear</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif break-words">
              Elevate Your Style with <span className="text-amber-400">Leovra Enterprises</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-lg">
              Curated artisanal earrings, heavyweight streetwear t-shirts, and ultra-flexible comfort lowers with instant dispatch to your doorstep.
            </p>

            {/* Quick CTAs */}
            <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3 w-full">
              <a
                href={`tel:${businessPhone}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 text-center whitespace-nowrap cursor-pointer"
                id="hero-call-now-btn"
              >
                <span>Call: +91 {businessPhone}</span>
              </a>
              <a
                href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I would like to place an order from your catalog.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-700 transition-all active:scale-95 text-center whitespace-nowrap cursor-pointer"
                id="hero-whatsapp-order-btn"
              >
                <span>Order via WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </a>
            </div>

            {/* Trust Badges under CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
                <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">Fast Delhi Dispatch</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">100% Inspected Items</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold">Shiprocket Express COD</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Animation Showcase */}
          <div 
            className="w-full lg:w-[420px] xl:w-[460px] flex flex-col items-center justify-center relative py-2 select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Top-Left Floating Badge */}
            <div className="absolute -top-2 left-2 sm:-left-2 z-20 animate-hero-float pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-900/95 border border-amber-500/40 text-white shadow-xl backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold">{currentSlide.floatingBadge2}</span>
              </div>
            </div>

            {/* Bottom-Right Floating Badge */}
            <div className="absolute -bottom-2 right-2 sm:-right-2 z-20 animate-hero-float-reverse pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-900/95 border border-emerald-500/40 text-white shadow-xl backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold">{currentSlide.floatingBadge1}</span>
              </div>
            </div>

            {/* Main Interactive 3D Showcase Card */}
            <div 
              onClick={() => handleExploreCategory(currentSlide.id)}
              className={`group relative w-full max-w-[340px] sm:max-w-[390px] h-[300px] sm:h-[340px] rounded-3xl overflow-hidden bg-neutral-900/90 border ${currentSlide.borderGlow} shadow-2xl transition-all duration-500 cursor-pointer`}
            >
              {/* Image with smooth transition */}
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                key={currentSlide.image}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 animate-in fade-in zoom-in-95 duration-500"
              />

              {/* Shimmer Light Sweep Overlay */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-hero-shimmer" />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              {/* Top Tags */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {currentSlide.hindiTag}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-neutral-950 font-black text-[10px] uppercase shadow-md">
                  {currentSlide.discount}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {currentSlide.categoryName}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-1 drop-shadow-sm">
                  {currentSlide.title}
                </h3>
                <p className="text-[11px] text-neutral-300 line-clamp-1">
                  {currentSlide.tagline}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/15">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-white">{currentSlide.price}</span>
                    <span className="text-xs text-neutral-400 line-through">{currentSlide.originalPrice}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Navigation Dots & Controls */}
            <div className="flex items-center justify-center gap-2 mt-3 z-10 w-full">
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="p-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Previous Collection"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      activeSlide === idx
                        ? 'bg-amber-400 text-neutral-950 shadow-md scale-105'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {slide.id === 'earrings' && '💎 Jewelry'}
                    {slide.id === 'tshirts' && '👕 T-Shirts'}
                    {slide.id === 'lowers' && '👖 Lowers'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Next Collection"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
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
