import React, { useState, useEffect } from 'react';
import { X, Search, Package, CheckCircle, Clock, Truck, AlertCircle, FileText } from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  onViewInvoice: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  onViewInvoice
}) => {
  if (!isOpen) return null;

  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [phoneQuery, setPhoneQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('Size does not fit');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnMessage, setReturnMessage] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderQuery(initialOrderNumber);
      const o = storeService.getOrderByNumber(initialOrderNumber);
      if (o) setFoundOrder(o);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setReturnMessage('');
    if (!orderQuery.trim()) {
      setErrorMessage('Please enter your Order Reference Number.');
      return;
    }

    const order = phoneQuery.trim()
      ? storeService.trackOrder(orderQuery, phoneQuery)
      : storeService.getOrderByNumber(orderQuery);

    if (order) {
      setFoundOrder(order);
    } else {
      setFoundOrder(null);
      setErrorMessage('No order found matching the provided reference number. Please check your order reference number (e.g. LC-2026-10142).');
    }
  };

  const handleCancelOrder = () => {
    if (!foundOrder) return;
    const updated = storeService.cancelOrder(foundOrder.id, cancelReason, 'Customer');
    if (updated) {
      setFoundOrder({ ...updated });
      setIsCancelling(false);
    }
  };

  const handleRequestReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundOrder) return;
    const res = storeService.requestReturn(foundOrder.orderNumber, returnReason, returnNotes);
    setReturnMessage(res.message);
    if (res.success) {
      const updated = storeService.getOrderByNumber(foundOrder.orderNumber);
      if (updated) setFoundOrder({ ...updated });
      setIsReturning(false);
    }
  };

  const getStepStatus = (order: Order) => {
    const s = order.status;
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 4;
    if (s === 'dispatched') return 3;
    if (s === 'packed') return 2;
    if (s === 'processing' || s === 'payment_pending') return 1;
    return 0; // order_placed
  };

  const currentStep = foundOrder ? getStepStatus(foundOrder) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white max-w-xl w-full my-auto rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-black" />
            <h2 className="text-base font-bold text-black uppercase tracking-wider">
              Track Your Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Order Reference Number *</label>
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={e => setOrderQuery(e.target.value.toUpperCase())}
                  placeholder="e.g. LC-2026-10142"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Customer Phone (Optional)</label>
                <input
                  type="tel"
                  value={phoneQuery}
                  onChange={e => setPhoneQuery(e.target.value)}
                  placeholder="For instant verification"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Lookup Order</span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {returnMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {returnMessage}
            </div>
          )}

          {/* Found Order Timeline & Details */}
          {foundOrder && (
            <div className="space-y-5 pt-3 border-t border-gray-200 animate-fade-in text-xs">
              {/* Order Reference Details */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="text-gray-500">Order:</span>{' '}
                  <span className="font-bold font-mono text-black">{foundOrder.orderNumber}</span>
                  <span className="block text-[10px] text-gray-400">
                    Placed on {new Date(foundOrder.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-black text-white font-semibold text-[10px] uppercase tracking-wider">
                    {foundOrder.status.replace(/_/g, ' ')}
                  </span>
                  <span className="block font-bold text-black mt-0.5">
                    Rs. {foundOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Courier Tracking Info if dispatched */}
              {foundOrder.trackingId && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> {foundOrder.courierName || 'Blue Dart Express'}
                    </span>
                    <a
                      href={foundOrder.courierTrackingUrl || 'https://www.bluedart.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline font-semibold text-[11px]"
                    >
                      Track on Courier Site &rarr;
                    </a>
                  </div>
                  <p className="text-[11px]">
                    AWB Tracking Code: <strong className="font-mono">{foundOrder.trackingId}</strong>
                  </p>
                </div>
              )}

              {/* Timeline Steps */}
              {currentStep !== -1 ? (
                <div className="py-2">
                  <h4 className="font-bold text-black uppercase tracking-wider text-[11px] mb-4">
                    Fulfillment Progress
                  </h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {[
                      { title: 'Order Placed', desc: 'Received in system and queued for verification.' },
                      { title: 'Processing & Verification', desc: 'Payment verified and sent to warehouse.' },
                      { title: 'Packed & Ready', desc: 'Securely packaged in tamper-proof custom bag.' },
                      { title: 'Dispatched with Courier', desc: 'Handed over to carrier for doorstep delivery.' },
                      { title: 'Delivered', desc: 'Successfully delivered to customer.' }
                    ].map((step, idx) => {
                      const isComplete = idx <= currentStep;
                      return (
                        <div key={idx} className="relative">
                          <span
                            className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                              isComplete ? 'border-black bg-black' : 'border-gray-300'
                            }`}
                          >
                            {isComplete && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <p className={`font-bold ${isComplete ? 'text-black' : 'text-gray-400'}`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700">
                  <p className="font-bold">This order has been cancelled.</p>
                </div>
              )}

              {/* Items in Order */}
              <div>
                <h4 className="font-bold text-black uppercase tracking-wider text-[11px] mb-2">
                  Items in this Shipment
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 p-2">
                  {foundOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={item.image} alt="" className="w-8 h-9 object-cover bg-gray-100" />
                        <div>
                          <p className="font-semibold text-black line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-gray-400">
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
              </div>

              {/* Order Actions: Cancel / Return / Tax Invoice */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => onViewInvoice(foundOrder)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Tax Invoice</span>
                </button>

                {foundOrder.status !== 'cancelled' && foundOrder.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => setIsCancelling(!isCancelling)}
                    className="py-2.5 px-4 border border-red-300 text-red-600 hover:bg-red-50 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}

                {foundOrder.status === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => setIsReturning(!isReturning)}
                    className="py-2.5 px-4 border border-black text-black hover:bg-black hover:text-white font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Request 7-Day Return
                  </button>
                )}
              </div>

              {/* Cancel Confirmation Form */}
              {isCancelling && (
                <div className="p-3 bg-red-50 border border-red-200 space-y-2 animate-fade-in">
                  <p className="font-bold text-red-800">Confirm Order Cancellation</p>
                  <label className="block text-gray-600">Reason for cancellation:</label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 outline-none text-xs"
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Ordered wrong size / style">Ordered wrong size / style</option>
                    <option value="Delivery timeline is too long">Delivery timeline is too long</option>
                    <option value="Found a better price">Found a better price</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      className="px-4 py-1.5 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCancelling(false)}
                      className="px-4 py-1.5 bg-gray-200 text-gray-800 font-semibold cursor-pointer"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
              )}

              {/* Return Form */}
              {isReturning && (
                <form onSubmit={handleRequestReturn} className="p-3 bg-gray-50 border border-gray-300 space-y-2 animate-fade-in">
                  <p className="font-bold text-black">Initiate 7-Day Return & Exchange</p>
                  <div>
                    <label className="block text-gray-600 mb-1">Reason for Return:</label>
                    <select
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 outline-none text-xs"
                    >
                      <option value="Size does not fit">Size does not fit</option>
                      <option value="Color or drape looks different">Color or drape looks different</option>
                      <option value="Defective or damaged fabric">Defective or damaged fabric</option>
                      <option value="Quality not as expected">Quality not as expected</option>
                      <option value="Wrong item received">Wrong item received</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Notes / Exchange Size request:</label>
                    <textarea
                      rows={2}
                      value={returnNotes}
                      onChange={e => setReturnNotes(e.target.value)}
                      placeholder="e.g. Please replace with size L instead"
                      className="w-full p-2 bg-white border border-gray-300 outline-none text-xs resize-none"
                    />
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-black text-white font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                    >
                      Submit Return Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReturning(false)}
                      className="px-4 py-1.5 bg-gray-200 text-gray-800 font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
