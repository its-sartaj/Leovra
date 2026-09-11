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
  const { businessPhone, businessEmail, setFilters, setCurrentView } = useStore();

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

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[11px] sm:text-xs truncate">Easy Exchange</div>
              <div className="text-neutral-400 text-[9px] sm:text-[11px] truncate">Size replacement</div>
            </div>
          </div>

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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Categories / उत्पाद श्रेणियां
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <button onClick={() => handleCategory('earrings')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Designer Earrings (झुमके व बालियां)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('tshirts')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Streetwear T-Shirts (टी-शर्ट्स)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('lowers')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Comfort Lowers & Joggers (लोअर व ट्रैक पैंट)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategory('all')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Full Catalog (सभी उत्पाद)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact & Store Info
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">+91 {businessPhone}</div>
                  <div className="text-[11px] text-neutral-500">Available for calls & WhatsApp orders</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">{businessEmail}</div>
                  <div className="text-[11px] text-neutral-500">Official business correspondence</div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 pt-1">
                Express Fast Dispatch Across India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-neutral-900 text-center text-xs text-neutral-500 flex items-center justify-center">
          <div className="flex items-center gap-4 text-[11px] text-neutral-500">
            <span>Specialists in Earrings, T-Shirts & Lowers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
