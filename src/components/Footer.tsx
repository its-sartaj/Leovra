import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { StoreSettings } from '../types';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenPolicy: (title: string, content: string) => void;
  onOpenTracking: () => void;
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = React.memo(({
  onSelectCategory,
  onOpenPolicy,
  onOpenTracking,
  settings
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
    setTimeout(() => setSubscribed(false), 6000);
  };

  return (
    <>
      {/* Newsletter Signup Section */}
      <section className="max-w-xl mx-auto px-4 py-16 text-center border-t border-[#f0f0f0]">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight mb-2">
          Join our email list
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-7">
          Get exclusive deals and early access to new products.
        </p>

        <form
          onSubmit={handleSubscribe}
          className="relative max-w-md mx-auto"
          {...{
            toolname: 'newsletterSubscription',
            tooldescription: 'Subscribe customer email to receive exclusive LEOVRA CLOTHS deals and product drops'
          } as any}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address for newsletter
          </label>
          <input
            id="newsletter-email"
            name="email"
            aria-label="Email address for newsletter"
            type="email"
            {...{
              toolparamdescription: 'Valid customer email address to receive discounts'
            } as any}
            required
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="Email address"
            className="pill-input w-full py-3.5 sm:py-4 text-sm bg-transparent placeholder-gray-500 transition-all text-gray-900"
          />
          <button
            type="submit"
            aria-label="Subscribe to email newsletter"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-800 hover:text-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2]" />
          </button>
        </form>

        {subscribed && (
          <p className="text-xs text-emerald-700 font-medium mt-3 flex items-center justify-center space-x-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Thank you for subscribing! Check your inbox for your 10% welcome voucher.</span>
          </p>
        )}
      </section>

      {/* Main Footer */}
      <footer className="bg-white border-t border-[#eaeaea] pt-12 pb-10 text-[#444] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Shop */}
            <div>
              <h3 className="font-bold text-[#121212] uppercase tracking-wider text-[11px] mb-3">
                Shop
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => onSelectCategory('all')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Shop All
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('new')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('bestsellers')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Best Sellers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('mens_tshirts')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Men's T-Shirts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('womens_tshirts')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Women's T-Shirts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('mens_lowers')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Men's Lowers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('womens_lowers')}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Women's Lowers
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Customer Care */}
            <div>
              <h3 className="font-bold text-[#121212] uppercase tracking-wider text-[11px] mb-3">
                Customer Care
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => onOpenPolicy('Shipping & Delivery Policy', settings.shippingPolicyText)}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      onOpenPolicy(
                        'Seven-Day Return & Exchange Policy',
                        settings.sevenDayReturnPolicyText +
                          '<br/><br/><strong>Eligibility Conditions:</strong><br/>1. Items must be initiated within 7 calendar days of courier delivery timestamp.<br/>2. Merchandise must be in unwashed, unworn, original condition with all barcode tags attached.<br/>3. Innerwear and clearance items marked final sale are non-exchangeable for hygiene reasons.<br/>4. Reverse pickup is arranged through our authorized courier partner.'
                      )
                    }
                    className="hover:text-black transition-colors font-medium text-black cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    7-Day Return Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenTracking}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      onOpenPolicy(
                        'Size Guide & Tailoring',
                        'All LEOVRA CLOTHES apparel is cut true to size with pre-shrunk combed cotton. If you prefer a loose relaxed streetwear drape, we recommend ordering one size above your usual fit.'
                      )
                    }
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Size Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Privacy */}
            <div>
              <h3 className="font-bold text-[#121212] uppercase tracking-wider text-[11px] mb-3">
                Legal & Privacy
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => onOpenPolicy('Terms and Conditions', settings.termsText)}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPolicy('Privacy Policy', settings.privacyPolicyText)}
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      onOpenPolicy(
                        'Refund & Cancellation Policy',
                        'Orders can be cancelled before dispatch without charge. Once returned merchandise is verified at our hub, refunds are credited back to your original payment account or UPI within 3-5 business days.'
                      )
                    }
                    className="hover:text-black transition-colors cursor-pointer text-left py-1.5 block min-h-[36px] flex items-center"
                  >
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Brand Story & Details */}
            <div className="space-y-3">
              <div className="flex flex-col items-start">
                <Logo size="sm" showText={true} />
              </div>
              <p className="leading-relaxed text-gray-600 text-xs">
                LEOVRA CLOTHS is an Indian modern streetwear and casual clothing brand. Engineered oversized t-shirts, wide-leg baggy track pants, and everyday essentials crafted for comfort and enduring style.
              </p>
              <div className="text-[11px] text-gray-600 space-y-1 pt-1 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900">Payment Facility:</span> Instant UPI QR, Cards & COD
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Customer Support:</span> {settings.supportEmail}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Support Hours:</span> {settings.supportHours}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-[#f0f0f0] text-center space-y-1">
            <p className="text-gray-600 text-xs font-normal">
              Copyright © 2026 LEOVRA CLOTHS (Leovra Clothes). All rights reserved.
            </p>
            <p className="text-[11px] text-gray-600">
              India's Modern Streetwear &amp; Everyday Clothing Brand • Cash on Delivery &amp; Free UPI Shipping
            </p>
          </div>
        </div>
      </footer>
    </>
  );
});
