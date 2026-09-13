import React from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw
} from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

export const Footer: React.FC = () => {
  const { businessPhone, businessEmail, setFilters, setCurrentView, setIsReturnPolicyOpen } = useStore();

  const handleCategory = (cat: 'all' | ProductCategory) => {
    setCurrentView('store');
    setFilters(prev => ({ ...prev, category: cat }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-full bg-neutral-950 text-neutral-300 pt-8 sm:pt-12 pb-24 md:pb-12 border-t border-neutral-800 overflow-hidden" id="main-footer">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        
        {/* Trust Points Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pb-8 sm:pb-10 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[11px] sm:text-xs truncate">Express Delivery</div>
              <div className="text-neutral-400 text-[9px] sm:text-[11px] truncate">Fast doorstep dispatch</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[11px] sm:text-xs truncate">Quality Checked</div>
              <div className="text-neutral-400 text-[9px] sm:text-[11px] truncate">Hand-inspected</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReturnPolicyOpen(true)}
            className="flex items-center gap-2 sm:gap-3 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
            title="Read 3-Day Return Policy"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0 group-hover:border-amber-500/50 transition-colors">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[11px] sm:text-xs truncate">3-Day Return</div>
              <div className="text-neutral-400 text-[9px] sm:text-[11px] truncate group-hover:text-amber-400 transition-colors">Defective / wrong item</div>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[11px] sm:text-xs truncate">WhatsApp Support</div>
              <div className="text-neutral-400 text-[9px] sm:text-[11px] truncate">9 AM - 9 PM IST</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          
          {/* Company Bio */}
          <div className="space-y-4 md:col-span-2">
            <Logo size="lg" theme="dark" />
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              <strong>Leovra Enterprises</strong> is your trusted destination for designer artisanal earrings, heavy-cotton streetwear graphic tees, and high-comfort stretch lowers & cargo joggers. We combine fine craftsmanship with unbeatable value.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${businessPhone}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-800 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 {businessPhone}</span>
              </a>

              <a
                href={`https://wa.me/91${businessPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Categories / उत्पाद श्रेणियां
            </h2>
            <ul className="space-y-1 text-xs text-neutral-300 font-medium">
              <li>
                <button onClick={() => handleCategory('earrings')} className="py-1.5 hover:text-amber-400 transition-colors text-left cursor-pointer inline-block">
                  Designer Earrings (झुमके व बालियां)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('tshirts')} className="py-1.5 hover:text-amber-400 transition-colors text-left cursor-pointer inline-block">
                  Streetwear T-Shirts (टी-शर्ट्स)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('lowers')} className="py-1.5 hover:text-amber-400 transition-colors text-left cursor-pointer inline-block">
                  Comfort Lowers & Joggers (लोअर व ट्रैक पैंट)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('all')} className="py-1.5 hover:text-amber-400 transition-colors text-left cursor-pointer inline-block">
                  Full Catalog (सभी उत्पाद)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact & Store Info
            </h2>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">+91 {businessPhone}</div>
                  <div className="text-[11px] text-neutral-400">Available for calls & WhatsApp orders</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">{businessEmail}</div>
                  <div className="text-[11px] text-neutral-400">Official business correspondence</div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 pt-1">
                Express Fast Dispatch Across India
              </div>

              <div className="pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsReturnPolicyOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>3-Day Return Policy (View Details)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Overview & Search Engine Optimization Content */}
        <div className="pt-8 mt-6 border-t border-neutral-900 text-xs text-neutral-400 space-y-3">
          <h2 className="font-bold text-neutral-200 text-xs uppercase tracking-wider">
            Online Shopping at Leovra Enterprises — Premium Fashion & Lifestyle
          </h2>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Welcome to <strong>Leovra Enterprises</strong>, your trusted online destination for handcrafted designer earrings, trendy oversized graphic t-shirts, and premium activewear lowers. From royal Kundan jhumkas and oxidized statement jewelry to breathable 100% cotton streetwear and flexible training trackpants, we bring you unmatched quality at fair prices. Shop with complete peace of mind with <strong>Cash on Delivery (COD)</strong>, real-time stock sync, a 3-day return policy, and express doorstep delivery across all Indian pincodes.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-neutral-400">
            <span className="text-neutral-300 font-semibold">Popular Searches:</span>
            <span>Leovra Enterprises</span> •
            <span>LeovraEnterprises</span> •
            <span>Loevra Enterprises</span> •
            <span>Buy Designer Earrings Online</span> •
            <span>Kundan Jhumka</span> •
            <span>Oxidized Silver Earrings</span> •
            <span>Oversized T-Shirts India</span> •
            <span>Mens Gym Trackpants</span> •
            <span>Stretch Lowers</span> •
            <span>Cash on Delivery Shopping India</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-4 border-t border-neutral-900 text-center text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Specialists in Earrings, T-Shirts & Lowers</span>
          </div>
          <button
            type="button"
            onClick={() => setIsReturnPolicyOpen(true)}
            className="py-1.5 px-2 text-[11px] text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer font-medium"
          >
            Return & Refund Policy (3 Days)
          </button>
        </div>
      </div>
    </footer>
  );
};
