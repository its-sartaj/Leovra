import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  brandName = 'LEOVRA CLOTHES'
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print-bg animate-fade-in">
      <div className="bg-white max-w-3xl w-full my-auto rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Actions (Hidden in Print) */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 no-print shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Tax Invoice Preview
            </span>
            <span className="text-xs font-mono text-gray-500">({order.invoiceNumber})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 hover:bg-black transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Invoice Paper */}
        <div id="printableInvoice" className="p-6 sm:p-10 overflow-y-auto text-xs text-neutral-800 leading-normal font-sans">
          {/* Invoice Header */}
          <div className="flex justify-between items-start pb-6 border-b border-gray-300">
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-black font-['Montserrat'] tracking-wider">
                {brandName}
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                Modern Streetwear & Casuals
              </p>
              <div className="text-[11px] text-gray-600 mt-2 space-y-0.5">
                <p>Support: support@leovraclothes.com</p>
                <p>Helpline: +91 98701 68023</p>
                <p>GSTIN: 07AAACL1234F1Z5</p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-extrabold uppercase text-black">TAX INVOICE</h2>
              <div className="text-[11px] text-gray-600 mt-1 space-y-0.5">
                <p>
                  <strong>Invoice #:</strong> <span className="font-mono">{order.invoiceNumber}</span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.invoiceDate || order.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Order Reference:</strong> <span className="font-mono">{order.orderNumber}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Addresses */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-gray-500 mb-1.5">
                Billed / Shipped To:
              </h3>
              <p className="font-bold text-sm text-black">{order.customer.fullName}</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed">{order.customer.address}</p>
              <p className="text-gray-600">
                {order.customer.city}
                {order.customer.pincode ? ` - ${order.customer.pincode}` : ''}
              </p>
              <p className="text-gray-600 mt-1">Phone: {order.customer.phone}</p>
              {order.customer.email && <p className="text-gray-600">Email: {order.customer.email}</p>}
            </div>

            <div className="text-right">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-gray-500 mb-1.5">
                Order & Payment Info:
              </h3>
              <div className="text-gray-600 space-y-1">
                <p>
                  Payment Mode:{' '}
                  <strong className="text-black uppercase">
                    {order.paymentMethod === 'upi' ? 'Instant UPI QR' : 'Cash on Delivery (COD)'}
                  </strong>
                </p>
                {order.upiUtrNumber && (
                  <p className="font-mono text-[11px]">
                    UTR: <strong>{order.upiUtrNumber}</strong>
                  </p>
                )}
                {order.trackingId && (
                  <p>
                    Courier AWB: <strong className="font-mono">{order.trackingId}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6 border-b border-gray-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-[10px] uppercase font-bold text-gray-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">Variant</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2 font-medium text-black">
                      {item.title}
                      <span className="block text-[10px] text-gray-400 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {item.size} • {item.color}
                    </td>
                    <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold text-black">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-6 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Nationwide Shipping:</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `Rs. ${order.deliveryCharge}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between font-extrabold text-sm text-black">
                <span>Total Amount:</span>
                <span>Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Formal Note */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-500 text-center">
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p className="mt-0.5">Thank you for choosing LEOVRA CLOTHES. All taxes included.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
