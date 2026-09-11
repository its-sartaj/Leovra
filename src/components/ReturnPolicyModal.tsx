import React from 'react';
import { 
  X, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PackageCheck, 
  ShieldAlert, 
  MessageCircle 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReturnPolicyModal: React.FC = () => {
  const { 
    isReturnPolicyOpen, 
    setIsReturnPolicyOpen, 
    businessPhone 
  } = useStore();

  if (!isReturnPolicyOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={() => setIsReturnPolicyOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in duration-200 cursor-default"
        role="dialog"
        aria-labelledby="return-policy-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 id="return-policy-title" className="text-base sm:text-lg font-black text-white leading-tight">
                Return & Replacement Policy
              </h2>
              <p className="text-[11px] text-neutral-400">
                Leovra Enterprises • Official Customer Policy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReturnPolicyOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-800">
          
          {/* Key Rule Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Strict 3-Day Return Window (72 Hours)</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              All return and replacement requests must be registered within <strong>3 days (72 hours)</strong> from the timestamp of confirmed delivery. Return requests submitted after the 3-day window has expired cannot be accepted or processed.
            </p>
          </div>

          {/* Eligibility Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Accepted Conditions */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="uppercase tracking-wider">Eligible for Return & Refund</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Defective Product:</strong> Manufacturing defects, torn fabric, stitching issues, or damaged goods upon arrival.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Wrong Product Delivered:</strong> Received an incorrect item, wrong size, or wrong color differing from your placed order.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Transit Damage:</strong> Package arrived visibly damaged, open, or broken during courier transit.
                  </span>
                </li>
              </ul>
            </div>

            {/* Non-Accepted Conditions */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="uppercase tracking-wider">Not Eligible for Return</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Correct Product Delivered:</strong> If the correct product was delivered as ordered and is free of defects, returns or refunds are strictly <strong>NOT</strong> accepted.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Change of Mind:</strong> Returns are not accepted if you no longer want the product after delivery.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  <span>
                    <strong>Used or Altered Items:</strong> Items washed, worn, tags removed, or altered will not be eligible.
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* How to Claim Return Step-by-Step */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-600" />
              <span>How to Request a Return or Replacement</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-neutral-200/80 space-y-1">
                <div className="font-extrabold text-neutral-900 text-[11px] text-amber-700">STEP 1: Report</div>
                <p className="text-neutral-600 text-[11px] leading-snug">
                  Contact us within 3 days of delivery via WhatsApp with your Order ID.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200/80 space-y-1">
                <div className="font-extrabold text-neutral-900 text-[11px] text-amber-700">STEP 2: Share Proof</div>
                <p className="text-neutral-600 text-[11px] leading-snug">
                  Send 1-2 clear photos or a short video showing the defect or wrong item received with the shipping label.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200/80 space-y-1">
                <div className="font-extrabold text-neutral-900 text-[11px] text-amber-700">STEP 3: Resolution</div>
                <p className="text-neutral-600 text-[11px] leading-snug">
                  Once verified, we dispatch a free replacement or issue a 100% refund within 24-48 business hours.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Method Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-100/70 border border-neutral-200 text-[11px] text-neutral-600">
            <ShieldAlert className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <span>
              <strong>Refund Processing:</strong> Approved refunds for prepaid/UPI orders will be credited back to your original payment account. For Cash on Delivery (COD) orders, refunds are transferred directly via UPI (Google Pay, PhonePe, Paytm) upon confirmation.
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-500 text-center sm:text-left">
            Have an issue with your delivered order? Contact our support team.
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I want to submit a return request for my delivered order under the 3-day policy for a defective/wrong item. My Order ID is: ')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Request Return on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setIsReturnPolicyOpen(false)}
              className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
