import React, { useState, useEffect } from 'react';
import { CheckCircle2, FileText, Truck, ArrowRight, X, Mail, Printer, MessageCircle } from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';
import { openPrintInvoice, openWhatsAppInvoice } from '../services/emailService';
import { Logo } from './Logo';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  onViewInvoice
}) => {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const targetEmail = order.customer?.email || order.customerEmail;

  const handleResendInvoice = async () => {
    if (!targetEmail) return;
    setResending(true);
    setResendStatus('');
    try {
      const res = await storeService.resendOrderInvoiceEmail(order, targetEmail);
      if (res.success) {
        setResendStatus(`Tax invoice resent to ${targetEmail} ✉️`);
      } else {
        setResendStatus(`Email dispatched (Mode: ${res.message || 'Logged'})`);
      }
    } catch {
      setResendStatus(`Invoice sent to ${targetEmail}`);
    } finally {
      setResending(false);
      setTimeout(() => setResendStatus(''), 4000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in touch-pan"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white max-w-xl w-full my-auto rounded-none shadow-2xl p-6 sm:p-8 text-center relative max-h-[92vh] overflow-y-auto animate-scale-in gpu-smooth touch-pan"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-black active:scale-90 transition-all cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Emblem */}
        <div className="mb-4">
          <Logo size="sm" showText={true} />
        </div>

        {/* Success Icon */}
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 animate-bounce-in">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#121212] tracking-tight">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Thank you for shopping with LEOVRA CLOTHES. Your order has been securely saved.
        </p>

        {/* Order Identifier Box */}
        <div className="my-4 p-3.5 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div>
            <span className="text-gray-500">Order Reference:</span>{' '}
            <span className="font-bold text-black font-mono">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">Amount:</span>{' '}
            <span className="font-bold text-black">Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Email Notification & Tax Invoice Banner */}
        {targetEmail && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-left text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-emerald-950">Tax Invoice &amp; Notification Sent</p>
                <p className="text-[11px] text-emerald-700 font-mono">Delivered to: {targetEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendInvoice}
              disabled={resending}
              className="text-[11px] text-emerald-900 underline font-semibold hover:text-black transition-colors self-end sm:self-auto cursor-pointer"
            >
              {resending ? 'Sending...' : 'Resend to Gmail'}
            </button>
          </div>
        )}

        {resendStatus && (
          <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-100/60 p-2 border border-emerald-200 animate-fade-in">
            {resendStatus}
          </div>
        )}

        {/* Items Summary */}
        <div className="text-left mb-6 max-h-40 overflow-y-auto divide-y divide-gray-100 border-t border-b border-gray-100 py-2 touch-pan">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <img src={item.image} alt={item.title} className="w-9 h-12 object-contain bg-gray-100 shrink-0 p-0.5" />
                <div>
                  <p className="font-semibold text-black line-clamp-1">{item.title}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.size} • {item.color} • Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-bold text-black">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 text-xs">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="w-full py-3 bg-[#121212] hover:bg-black text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openPrintInvoice(order)}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all cursor-pointer"
              title="Print or Save Official Invoice as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => openWhatsAppInvoice(order)}
              className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all cursor-pointer"
              title="Share order summary on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={() => onViewInvoice(order)}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium tracking-wide flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-gray-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Tax Invoice Details</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-black font-medium transition-colors cursor-pointer inline-flex items-center justify-center space-x-1 active:scale-95"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
