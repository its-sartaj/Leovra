import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

interface SeoBrandSectionProps {
  onSelectCategory: (category: string) => void;
}

export const SeoBrandSection: React.FC<SeoBrandSectionProps> = React.memo(({ onSelectCategory }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'What is LEOVRA CLOTHS and what style does the brand represent?',
      a: 'LEOVRA CLOTHS (also known as Leovra Clothes) is an Indian modern streetwear and casual clothing brand. We specialize in heavyweight oversized graphic t-shirts, relaxed wide-leg baggy track pants, joggers, and minimalist daily essentials crafted with premium combed cotton and engineered silhouettes for all-day comfort.'
    },
    {
      q: 'Does Leovra Cloths offer Cash on Delivery (COD) across India?',
      a: 'Yes! Leovra Cloths provides nationwide Cash on Delivery (COD) across all serviceable postal PIN codes in India. In addition, all prepaid and UPI orders enjoy 100% FREE express shipping with zero payment surcharge.'
    },
    {
      q: 'How do I choose the right size for Leovra oversized tees and track pants?',
      a: 'All LEOVRA garments are designed with a relaxed, modern streetwear drape. For an authentic oversized look, our standard sizes (S to XXL) already feature dropped shoulders and roomy proportions. If you prefer a closer, tailored fit, choose your regular size; if you love a dramatic baggy aesthetic, size up by one.'
    },
    {
      q: 'What is the 7-Day Return and Exchange Policy at Leovra?',
      a: 'We offer a transparent 7-Day Return & Exchange Policy measured from the courier delivery confirmation date. Items must be in unwashed, unworn condition with all original brand tags intact. Size exchanges and returns can be easily requested through our customer support.'
    },
    {
      q: 'How fast are orders packed and dispatched?',
      a: 'Every confirmed order is packed and dispatched from our fulfillment hub within 24 to 48 business hours. Deliveries typically arrive in 3-5 business days in metro cities and 4-7 business days across regional zones with live SMS tracking.'
    }
  ];

  return (
    <section aria-labelledby="seo-brand-heading" className="bg-[#faf9f8] border-t border-[#eae7e2] py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Value Proposition Grid / USPs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pb-12 border-b border-[#eae7e2]">
          <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                Modern Streetwear
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                Engineered relaxed &amp; baggy silhouettes
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-black">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                Cash on Delivery
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                COD &amp; Free UPI shipping across India
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-black">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                7-Day Easy Returns
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                Hassle-free size replacement guarantee
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-black">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                100% Combed Cotton
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                Pre-shrunk, breathable &amp; durable
              </p>
            </div>
          </div>
        </div>

        {/* Brand Narrative SEO Content Block */}
        <article className="pt-10 pb-12 max-w-5xl mx-auto text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 bg-neutral-200 px-2.5 py-1 rounded-full">
            Homegrown Fashion &amp; Streetwear
          </span>
          <h2 id="seo-brand-heading" className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight mt-3 mb-4">
            LEOVRA CLOTHS — Modern Streetwear &amp; Everyday Clothing Brand
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-3xl mx-auto mb-4">
            Welcome to <strong>LEOVRA CLOTHS</strong> (also known as <em>Leovra Clothes</em>), an independent Indian clothing brand built for the bold and the style-conscious. We design premium streetwear basics, heavyweight 240+ GSM oversized t-shirts, dual-tone wide leg track pants, relaxed bottom-wear, and everyday casual fashion essentials that merge contemporary aesthetics with maximum comfort.
          </p>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
            Whether you are curating an aesthetic college fit, gearing up for an active weekend, or looking for cozy baggy track pants for everyday lounging, Leovra Cloths delivers pre-shrunk bio-washed combed cotton, tailored drapes, and high-density detailing. Shop effortlessly online with zero delivery fees on prepaid UPI orders and dependable Cash on Delivery across all Indian states.
          </p>

          {/* Targeted Internal Links / Quick Category Pills - Strictly One Single Line */}
          <div className="w-full overflow-x-auto no-scrollbar pt-2 pb-1">
            <div className="inline-flex items-center justify-start sm:justify-center gap-2.5 whitespace-nowrap min-w-full px-2">
              <span className="text-xs font-semibold text-gray-900 shrink-0">Popular Collections:</span>
              <button
                onClick={() => onSelectCategory('mens_tshirts')}
                aria-label="Filter Men's Oversized T-Shirts"
                className="whitespace-nowrap shrink-0 text-xs bg-white text-gray-900 hover:bg-black hover:text-white transition-colors border border-gray-300 rounded-full px-4 py-2.5 min-h-[48px] flex items-center font-medium cursor-pointer active:scale-95 shadow-2xs"
              >
                Men's Oversized T-Shirts
              </button>
              <button
                onClick={() => onSelectCategory('womens_lowers')}
                aria-label="Filter Women's Wide Leg Pants"
                className="whitespace-nowrap shrink-0 text-xs bg-white text-gray-900 hover:bg-black hover:text-white transition-colors border border-gray-300 rounded-full px-4 py-2.5 min-h-[48px] flex items-center font-medium cursor-pointer active:scale-95 shadow-2xs"
              >
                Women's Wide Leg Pants
              </button>
              <button
                onClick={() => onSelectCategory('mens_lowers')}
                aria-label="Filter Baggy Track Pants and Lowers"
                className="whitespace-nowrap shrink-0 text-xs bg-white text-gray-900 hover:bg-black hover:text-white transition-colors border border-gray-300 rounded-full px-4 py-2.5 min-h-[48px] flex items-center font-medium cursor-pointer active:scale-95 shadow-2xs"
              >
                Baggy Track Pants &amp; Lowers
              </button>
              <button
                onClick={() => onSelectCategory('bestsellers')}
                aria-label="Filter Best Selling Streetwear"
                className="whitespace-nowrap shrink-0 text-xs bg-white text-gray-900 hover:bg-black hover:text-white transition-colors border border-gray-300 rounded-full px-4 py-2.5 min-h-[48px] flex items-center font-medium cursor-pointer active:scale-95 shadow-2xs"
              >
                Best Selling Streetwear
              </button>
              <button
                onClick={() => onSelectCategory('new')}
                aria-label="Filter New Streetwear Arrivals"
                className="whitespace-nowrap shrink-0 text-xs bg-white text-gray-900 hover:bg-black hover:text-white transition-colors border border-gray-300 rounded-full px-4 py-2.5 min-h-[48px] flex items-center font-medium cursor-pointer active:scale-95 shadow-2xs"
              >
                New Arrivals
              </button>
            </div>
          </div>
        </article>

        {/* Search Engine Friendly Interactive FAQ Accordion */}
        <div className="max-w-3xl mx-auto pt-6 border-t border-[#eae7e2]">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#121212] tracking-tight">
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Everything you need to know about shopping with LEOVRA CLOTHS
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200/90 rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    id={`faq-trigger-${index}`}
                    aria-controls={`faq-panel-${index}`}
                    aria-expanded={isOpen}
                    className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-900 hover:text-black transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-700 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-black' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-[13px] text-gray-700 leading-relaxed border-t border-gray-100 animate-fade-in"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});
