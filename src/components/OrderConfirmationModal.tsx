import React from 'react';
import { CheckCircle2, FileText, Truck, ArrowRight } from 'lucide-react';
import { Order } from '../types';
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
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white max-w-xl w-full my-auto rounded-none shadow-2xl p-6 sm:p-8 text-center relative max-h-[92vh] overflow-y-auto">
        {/* Brand Emblem */}
        <div className="mb-4">
          <Logo size="sm" showText={true} />
        </div>

        {/* Success Icon */}
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#121212] tracking-tight">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Thank you for shopping with LEOVRA CLOTHES. Your order has been securely saved.
        </p>

        {/* Order Identifier Box */}
        <div className="my-5 p-3.5 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div>
            <span className="text-gray-500">Order Reference:</span>{' '}
            <span className="font-bold text-black font-mono">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">Amount:</span>{' '}
            <span className="font-bold text-black">Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="text-left mb-6 max-h-40 overflow-y-auto divide-y divide-gray-100 border-t border-b border-gray-100 py-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <img src={item.image} alt={item.title} className="w-9 h-10 object-cover bg-gray-100 shrink-0" />
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
            className="w-full py-3 bg-[#121212] hover:bg-black text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={() => onViewInvoice(order)}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>View Tax Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-black font-medium transition-colors cursor-pointer inline-flex items-center justify-center space-x-1"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
