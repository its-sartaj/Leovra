import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Shirt, 
  Layers, 
  Package, 
  CreditCard, 
  Clock, 
  ChevronRight, 
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  User
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { LeovraLogoIcon } from './LeovraLogoIcon';

export const SideNavDrawer: React.FC = () => {
  const { 
    isSideNavOpen, 
    setIsSideNavOpen, 
    setCurrentView, 
    setFilters, 
    setIsCartOpen, 
    cartCount,
    businessPhone,
    products,
    currentCustomer,
    setIsAccountModalOpen,
    setAccountModalTab,
    customerOrders,
    setIsReturnPolicyOpen
  } = useStore();

  if (!isSideNavOpen) return null;

  const handleCategorySelect = (category: 'all' | ProductCategory) => {
    setCurrentView('store');
    setFilters(prev => ({ ...prev, category }));
    setIsSideNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCart = () => {
    setIsSideNavOpen(false);
    setIsCartOpen(true);
  };

  const getCatCount = (cat: ProductCategory) => 
    products.filter(p => p.category === cat && !p.isOutOfStock && p.stock > 0).length;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={() => setIsSideNavOpen(false)}
      id="side-nav-drawer-overlay"
    >
      <div 
        className="fixed inset-y-0 left-0 max-w-full flex pr-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col justify-between border-r border-neutral-200 animate-in slide-in-from-left duration-300">
          
          {/* Top Brand Banner */}
          <div className="bg-neutral-950 text-white p-5 relative overflow-hidden shrink-0 border-b border-neutral-800">
            {/* Subtle glow decorative background */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <LeovraLogoIcon 
                  className="h-12 w-auto rounded-xl shadow-md border border-amber-400/50 shrink-0" 
                  includeBackground={true} 
                />
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold tracking-widest uppercase">
                    <span>Trusted Fashion Brand</span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-white font-serif leading-tight">
                    Leovra Enterprises
                  </h2>
                  <p className="text-[11px] text-neutral-300">
                    Artisanal Jewelry • Streetwear • Lowers
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSideNavOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                id="close-side-nav-btn"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Welcome Greeting Pill */}
            <div className="mt-4 pt-3 border-t border-neutral-800/90 flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>नमस्ते! Welcome to our Store</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                100% Genuine
              </span>
            </div>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            
            {/* Customer Account & My Orders Card */}
            <div 
              onClick={() => {
                setIsSideNavOpen(false);
                if (currentCustomer) {
                  setAccountModalTab('orders');
                } else {
                  setAccountModalTab('register');
                }
                setIsAccountModalOpen(true);
              }}
              className="bg-neutral-900 text-white rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-all shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {currentCustomer ? `Account: ${currentCustomer.name}` : 'Customer Account / ग्राहक खाता'}
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    {currentCustomer 
                      ? `${customerOrders.length} order(s) • Tap to view your purchases` 
                      : 'Create account or login to track your orders'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </div>

            {/* Quick Bag / Cart Access Banner */}
            <div 
              onClick={handleOpenCart}
              className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-neutral-900">Your Shopping Bag</div>
                  <div className="text-[11px] text-neutral-600">
                    {cartCount > 0 ? `${cartCount} items in cart ready for checkout` : '0 items • Tap to view bag'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* 1. Shop By Category */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Shop By Category / उत्पाद श्रेणियां</span>
              </div>
              <div className="space-y-1.5">
                
                {/* All Products */}
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">All Collections (सभी उत्पाद)</div>
                      <div className="text-[10px] text-neutral-500">Explore complete catalog</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Artisanal Earrings */}
                <button
                  onClick={() => handleCategorySelect('earrings')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Earrings & Jhumkas (झुमके)</div>
                      <div className="text-[10px] text-neutral-500">Oxidized, Kundan & Chandbali</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {getCatCount('earrings')} in stock
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* T-Shirts */}
                <button
                  onClick={() => handleCategorySelect('tshirts')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Shirt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Graphic T-Shirts (टी-शर्ट्स)</div>
                      <div className="text-[10px] text-neutral-500">Oversized Streetwear & Cotton</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {getCatCount('tshirts')} in stock
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Lowers & Joggers */}
                <button
                  onClick={() => handleCategorySelect('lowers')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Lowers & Joggers (लोअर)</div>
                      <div className="text-[10px] text-neutral-500">Cargo Pockets & Comfort Stretch</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {getCatCount('lowers')} in stock
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Our Services & Guarantees */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Our Services & Guarantees / हमारी सेवाएं
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                
                {/* Express Doorstep Delivery */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Express Doorstep Delivery</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Fast express dispatch to your doorstep across India. Free delivery above ₹499.
                    </div>
                  </div>
                </div>

                {/* 100% Quality Checked */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">100% Quality Checked & Inspected</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Every piece of jewelry, t-shirt, and lower is hand-checked for stitch, stone settings, and finish before dispatch.
                    </div>
                  </div>
                </div>

                {/* Hassle-Free Size Exchange */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Hassle-Free Size Exchange</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Size doesn't fit? Instant size replacement within 48 hours via direct WhatsApp or phone call.
                    </div>
                  </div>
                </div>

                {/* WhatsApp Quick Ordering */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                      <span>1-Click WhatsApp Ordering</span>
                      <span className="text-[9px] bg-emerald-200/80 px-1.5 py-0.2 rounded font-bold text-emerald-900">Fast</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Prefer ordering without online forms? Send a photo or product name directly to our WhatsApp support.
                    </div>
                    <a
                      href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I would like to place an order directly.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline mt-1.5"
                    >
                      <span>Chat on WhatsApp (+91 {businessPhone})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Wholesale & Bulk Orders */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Bulk & Wholesale Pricing</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Special commercial discounts for boutique owners, gift orders, and garment resellers.
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">COD & UPI Accepted</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      Pay cash on doorstep delivery or scan UPI QR code securely upon order confirmation.
                    </div>
                  </div>
                </div>

                {/* 3-Day Return Policy */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSideNavOpen(false);
                    setIsReturnPolicyOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:bg-amber-100/60 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                      <span>3-Day Return Policy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      72-hour coverage for damaged or incorrectly delivered products. Click to read terms.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Customer Care & Helplines */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Customer Support / ग्राहक सहायता
              </div>
              <div className="space-y-2 text-xs">
                
                {/* Direct Phone Call */}
                <a
                  href={`tel:${businessPhone}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Call Helpline: +91 {businessPhone}</span>
                  </div>
                  <span className="text-[10px] text-neutral-300">Daily 9am-9pm</span>
                </a>

                {/* Direct WhatsApp Chat */}
                <a
                  href={`https://wa.me/91${businessPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </div>
                  <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded-full">Live</span>
                </a>

                {/* Operational Details */}
                <div className="p-3 rounded-xl bg-neutral-100/70 border border-neutral-200 space-y-1.5 text-[11px] text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Support Timings: 9:00 AM - 9:00 PM IST (Mon - Sun)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Express Dispatch Across All India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Email: support@leovraenterprises.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Safe Packaging
              </span>
            </div>

          </div>

          {/* Footer of Drawer */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center text-xs text-neutral-500">
            <p className="font-semibold text-neutral-700">Leovra Enterprises © {new Date().getFullYear()}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Premium Fashion & Lifestyle Destination</p>
          </div>

        </div>
      </div>
    </div>
  );
};
