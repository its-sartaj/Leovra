import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export const FAQSection: React.FC = () => {
  const { businessPhone } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Is Cash on Delivery (COD) available on Leovra Enterprises?',
      answer: 'Yes, Cash on Delivery (COD) is available on all products across India. You can also pay via UPI (GPay, PhonePe, Paytm) for instant confirmation.',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
    },
    {
      question: 'What is the return policy for Leovra Enterprises?',
      answer: 'Leovra offers a 3-day return window from the date of delivery for defective, damaged, or wrong products received. Correctly delivered items in good condition are not eligible for return.',
      icon: <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
    },
    {
      question: 'How long does delivery take?',
      answer: 'Orders are dispatched via Shiprocket Express courier partners (Delhivery, Blue Dart, Shadowfax) within 24-48 hours. Delivery usually takes 2-5 business days depending on your pincode.',
      icon: <Truck className="w-4 h-4 text-purple-600 shrink-0" />
    },
    {
      question: 'How can I track my Leovra order?',
      answer: 'You can track your order directly in the "My Orders" tab of your account or reach out to our customer support on WhatsApp with your Order ID for real-time Shiprocket AWB updates.',
      icon: <HelpCircle className="w-4 h-4 text-neutral-600 shrink-0" />
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-8 sm:py-12" 
      id="faq-section"
      aria-labelledby="faq-heading"
    >
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs p-5 sm:p-8 md:p-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold border border-amber-500/20">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 id="faq-heading" className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 font-serif">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Everything you need to know about shopping, shipping, and returns at <strong>Leovra Enterprises</strong>.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-neutral-200 rounded-2xl overflow-hidden transition-colors bg-neutral-50/50 hover:border-amber-400"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-btn-${index}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {faq.icon}
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`} 
                  />
                </button>

                {isOpen && (
                  <div 
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-white"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support CTA */}
        <div className="mt-8 text-center pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-neutral-500">
          <span>Still have questions about an order?</span>
          <a
            href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I have a question about shopping on your store.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
