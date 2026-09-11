import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import heroTshirtImg from '../assets/hero-tshirt.png';

const BACKGROUND_SLIDES = [
  {
    id: 'earrings' as ProductCategory,
    label: 'Artisanal Jewelry',
    hindiTag: 'शाही झुमके संग्रह',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=80',
    glowColor: 'from-amber-500/35 via-orange-500/20 to-transparent',
  },
  {
    id: 'tshirts' as ProductCategory,
    label: 'Streetwear Apparel',
    hindiTag: 'क्लासिक टी-शर्ट्स',
    image: heroTshirtImg,
    glowColor: 'from-amber-600/35 via-orange-500/20 to-transparent',
  },
  {
    id: 'lowers' as ProductCategory,
    label: 'Comfort Lowers & Joggers',
    hindiTag: 'फ्लेक्सिबल लोअर',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1600&q=80',
    glowColor: 'from-emerald-500/35 via-teal-500/20 to-transparent',
  },
];

export const HeroBanner: React.FC = () => {
  const { products, filters, setFilters, businessPhone } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  // Unconditional auto-slide transition every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentBg = BACKGROUND_SLIDES[activeSlide];

  const getCategoryInStock = (cat: ProductCategory) => {
    return products.filter((p) => p.category === cat && !p.isOutOfStock && p.stock > 0).length;
  };

  const CATEGORY_SHOWCASE = [
    {
      id: 'earrings' as ProductCategory,
      title: 'Artisanal Jewelry',
      shortTitle: 'Earrings',
      hindiTitle: 'शाही झुमके',
      subtitle: 'Oxidized, Kundan & Studs',
      priceTag: 'From ₹249',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
      icon: '💎',
    },
    {
      id: 'tshirts' as ProductCategory,
      title: 'Streetwear T-Shirts',
      shortTitle: 'T-Shirts',
      hindiTitle: 'टी-शर्ट्स',
      subtitle: 'Oversized & Supima Cotton',
      priceTag: 'From ₹449',
      image: heroTshirtImg,
      icon: '👕',
    },
    {
      id: 'lowers' as ProductCategory,
      title: 'Comfort Lowers',
      shortTitle: 'Lowers & Joggers',
      hindiTitle: 'फ्लेक्सिबल लोअर',
      subtitle: 'Cargo Joggers & Stretch',
      priceTag: 'From ₹549',
      image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80',
      icon: '👖',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 pt-2 sm:pt-4 pb-3 sm:pb-6 overflow-hidden" id="hero-banner-section">
      {/* Top Banner Hero Card with Background Slider */}
      <div className="relative rounded-2xl md:rounded-3xl bg-neutral-950 text-white overflow-hidden shadow-2xl border border-neutral-800 w-full transform-gpu min-h-[300px] sm:min-h-[340px] flex items-center">
        
        {/* Animated Top Progress Bar (Auto-slide Timer) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900/80 z-30 overflow-hidden">
          <div 
            key={activeSlide} 
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 w-full animate-hero-progress" 
          />
        </div>

        {/* Background Slider Images with Smooth Crossfade & Subtle Zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {BACKGROUND_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                activeSlide === index
                  ? 'opacity-65 scale-105'
                  : 'opacity-0 scale-100 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.label}
                className="w-full h-full object-cover object-right md:object-center"
              />
            </div>
          ))}

          {/* Luxury Multi-layer Gradient Dark Overlays: Darker on left for text, semi-transparent on right for image */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />

          {/* Dynamic Background Ambient Glow */}
          <div className={`absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br ${currentBg.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-1000 animate-hero-glow`} />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
          {/* Left Column: Heading, Pitch & CTAs */}
          <div className="max-w-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] sm:text-xs font-semibold backdrop-blur-xs transition-all">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Express Dispatch • <span className="text-white font-bold">{currentBg.hindiTag}</span> ({currentBg.label})
              </span>
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

          {/* Right Column: Quick Value Points (Restored from user's screenshot) */}
          <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-1 gap-2.5 shrink-0 pt-2 sm:pt-0 border-t border-neutral-800/80 md:border-t-0">
            <div className="flex items-center gap-2.5 bg-neutral-900/90 border border-neutral-800/90 p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-left min-w-0 shadow-lg backdrop-blur-md">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate">Fast Delivery</div>
                <div className="text-[10px] sm:text-xs text-neutral-400 truncate">Doorstep shipping</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-neutral-900/90 border border-neutral-800/90 p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-left min-w-0 shadow-lg backdrop-blur-md">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate">Quality Checked</div>
                <div className="text-[10px] sm:text-xs text-neutral-400 truncate">Inspected items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Arrows for Manual Navigation */}
        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev - 1 + BACKGROUND_SLIDES.length) % BACKGROUND_SLIDES.length)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-xs active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-xs active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Background Slide Indicators (Bottom Right Pills) */}
        <div className="absolute bottom-2.5 right-3 sm:bottom-3 sm:right-6 z-20 flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800/80 text-[10px]">
          <span className="text-[10px] text-neutral-400 hidden sm:inline font-medium mr-1">
            {currentBg.label}
          </span>
          {BACKGROUND_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                activeSlide === idx 
                  ? 'w-5 h-1.5 bg-amber-400 shadow-xs' 
                  : 'w-1.5 h-1.5 bg-neutral-600 hover:bg-neutral-400'
              }`}
              title={slide.label}
            />
          ))}
        </div>
      </div>

      {/* 3 Categories Showcase: Luxury visual cards with rich imagery & gold accents */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3.5 sm:mt-5 w-full">
        {CATEGORY_SHOWCASE.map((card) => {
          const isSelected = filters.category === card.id;
          const count = getCategoryInStock(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setFilters((prev) => ({ 
                  ...prev, 
                  category: prev.category === card.id ? 'all' : card.id 
                }));
                const catalogEl = document.getElementById('products-catalog-section');
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl text-left transition-all duration-300 cursor-pointer h-[135px] sm:h-[165px] md:h-[180px] p-2.5 sm:p-4 flex flex-col justify-between border ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'border-neutral-800 hover:border-amber-500/60 shadow-md hover:shadow-xl'
              }`}
              id={`hero-category-card-${card.id}`}
            >
              {/* Background Image with Zoom on Hover */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Multi-layer Dark Gradient for 100% Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/45" />
                <div className={`absolute inset-0 bg-gradient-to-r from-neutral-950/80 to-transparent transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`} />
              </div>

              {/* Top Row: Hindi Tag & Active / Price Badge */}
              <div className="relative z-10 flex items-center justify-between gap-1 w-full">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-[10px] sm:text-xs font-bold text-amber-400">
                  <span>{card.icon}</span>
                  <span className="truncate">{card.hindiTitle}</span>
                </span>

                {isSelected ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Active
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-neutral-900/80 text-neutral-300 text-[10px] font-semibold border border-neutral-700/60">
                    {card.priceTag}
                  </span>
                )}
              </div>

              {/* Bottom Content: Title, Subtitle, & Explore CTA */}
              <div className="relative z-10 w-full space-y-0.5 sm:space-y-1">
                <h3 className="text-xs sm:text-base md:text-lg font-extrabold text-white leading-tight truncate group-hover:text-amber-400 transition-colors">
                  {card.shortTitle}
                </h3>
                
                <p className="hidden sm:block text-[11px] text-neutral-300 truncate font-normal">
                  {card.subtitle}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 w-full">
                  <span className="text-[10px] sm:text-xs font-semibold text-amber-400/90 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{isSelected ? 'Clear Filter' : 'Explore'}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </span>

                  <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">
                    {count > 0 ? `${count} In Stock` : 'In Stock'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
