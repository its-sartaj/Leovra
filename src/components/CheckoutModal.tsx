import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Check, Copy, QrCode, Banknote } from 'lucide-react';
import { CartItem, Order } from '../types';
import { storeService } from '../services/storeService';
import { Logo } from './Logo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  freeShippingThreshold: number;
  standardShippingFee: number;
  upiId: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  freeShippingThreshold,
  standardShippingFee,
  upiId
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [upiUtr, setUpiUtr] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharge = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

  // Generate real UPI payment QR code
  useEffect(() => {
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=LEOVRA%20CLOTHES&am=${totalAmount.toFixed(2)}&cu=INR&tn=LEOVRA%20CLOTHES%20Order`;
    QRCode.toDataURL(upiLink, {
      width: 240,
      margin: 1,
      color: {
        dark: '#121212',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate UPI QR code', err));
  }, [upiId, totalAmount]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    const res = storeService.validateCoupon(couponInput, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon({
        code: res.coupon.code,
        discount: res.discount,
        description: res.coupon.description
      });
      setCouponInput('');
    } else {
      setCouponError(res.error || 'Invalid coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Please fill in all mandatory customer & delivery fields.');
      return;
    }

    if (paymentMethod === 'upi' && !upiUtr.trim()) {
      setErrorMessage('Please enter your 12-digit UPI Reference / UTR Number after completing your payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const order = storeService.createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim() || undefined,
          notes: notes.trim() || undefined
        },
        items: [...items],
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        deliveryCharge,
        totalAmount,
        paymentMethod,
        upiUtrNumber: paymentMethod === 'upi' ? upiUtr.trim() : undefined
      });

      onOrderSuccess(order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white max-w-2xl w-full my-auto rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <Logo size="xs" showText={false} />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-black uppercase tracking-wider">
                Express Checkout
              </h2>
              <p className="text-[11px] text-gray-500">Secure Order Verification & Shipping</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3 pb-1 border-b border-gray-100">
              1. Delivery & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-600 font-medium mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="For invoice and tracking notifications"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-600 font-medium mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Landmark"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="6-digit postal code"
                  className="w-full p-2.5 border border-gray-300 focus:border-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3 pb-1 border-b border-gray-100">
              2. Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 border flex items-center space-x-2.5 cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-black bg-gray-50 font-semibold' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-black"
                />
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery (COD)</span>
              </label>

              <label
                className={`p-3 border flex items-center space-x-2.5 cursor-pointer transition-colors ${
                  paymentMethod === 'upi' ? 'border-black bg-gray-50 font-semibold' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-black"
                />
                <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Instant UPI QR</span>
              </label>
            </div>

            {/* UPI QR Payment Detail Block */}
            {paymentMethod === 'upi' && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 text-center animate-fade-in">
                <p className="text-xs font-bold text-black mb-1">Scan QR Code to Pay via any UPI App</p>
                <p className="text-[11px] text-gray-500 mb-3">GPay, PhonePe, Paytm, BHIM or Mobile Banking</p>

                {qrCodeDataUrl && (
                  <div className="inline-block p-2 bg-white border border-gray-200 shadow-xs mb-3">
                    <img src={qrCodeDataUrl} alt="UPI QR Code" className="w-44 h-44 object-contain mx-auto" />
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2 text-xs mb-4">
                  <span className="text-gray-600">UPI ID:</span>
                  <span className="font-mono font-bold text-black bg-white px-2 py-0.5 border border-gray-200">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 text-gray-600 hover:text-black transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="max-w-md mx-auto text-left">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Enter UPI Transaction ID / 12-digit UTR *
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === 'upi'}
                    value={upiUtr}
                    onChange={e => setUpiUtr(e.target.value)}
                    placeholder="e.g. 429019284102"
                    className="w-full p-2.5 bg-white border border-gray-300 focus:border-black outline-none text-xs font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Your order will be verified and dispatched once the transaction UTR is matched.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Coupon Code */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3 pb-1 border-b border-gray-100">
              3. Promo Code
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <div>
                  <span className="font-bold">{appliedCoupon.code}</span> applied: {appliedCoupon.description} (-Rs.{' '}
                  {appliedCoupon.discount})
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-emerald-700 hover:text-red-700 font-bold ml-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex space-x-2 text-xs">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. LEOVRA200 or FESTIVE500"
                    className="flex-1 p-2 border border-gray-300 focus:border-black outline-none uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-black text-white font-semibold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-600 text-[11px] mt-1">{couponError}</p>}
              </div>
            )}
          </div>

          {/* Section 4: Order Summary Recap */}
          <div className="p-4 bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promotional Discount</span>
                <span>-Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Nationwide Shipping</span>
              <span>{deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${deliveryCharge}`}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-black">
              <span>Final Total Payable</span>
              <span>Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Order Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 bg-[#121212] hover:bg-black text-white text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? 'Verifying & Placing Order...' : `Confirm & Place Order • Rs. ${totalAmount.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};
