import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Check, Copy, QrCode, Banknote } from 'lucide-react';
import { CartItem, Order, AuthUser } from '../types';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
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
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const unsub = authService.subscribe((u) => {
      setCurrentUser(u);
      if (u) {
        setFullName((prev) => prev || u.name || '');
        setEmail(u.email || '');
        if (u.phone) setPhone((prev) => prev || u.phone || '');
        if (u.address) setAddress((prev) => prev || u.address || '');
        if (u.city) setCity((prev) => prev || u.city || '');
        if (u.pincode) setPincode((prev) => prev || u.pincode || '');
      }
    });
    return () => unsub();
  }, [isOpen]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  // Shipping fee: COD = Rs. 99, Paid (UPI/online) = Rs. 0
  const deliveryCharge = paymentMethod === 'cod' ? 99 : 0;
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

      const finalEmail = (currentUser?.email || email).trim();

      const order = storeService.createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: finalEmail || undefined,
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim() || undefined,
          notes: notes.trim() || undefined
        },
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: finalEmail || undefined,
        customerAddress: address.trim(),
        customerCity: city.trim(),
        items: [...items],
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        deliveryCharge,
        totalAmount,
        paymentMethod,
        upiUtrNumber: paymentMethod === 'upi' ? upiUtr.trim() : undefined
      });

      // Update customer profile or auto-signup if email was provided
      if (currentUser) {
        authService.updateProfile({
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim()
        });
      } else if (finalEmail && finalEmail.includes('@')) {
        authService.loginWithGmailAuto(finalEmail, fullName.trim()).catch(() => {});
      }

      onOrderSuccess(order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in touch-pan"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white max-w-2xl w-full my-auto rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] animate-scale-in gpu-smooth"
      >
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
            aria-label="Close checkout"
            className="p-1.5 text-gray-400 hover:text-black active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 touch-pan">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                1. Delivery &amp; Contact Details
              </h3>
              {currentUser && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✓ Google Verified
                </span>
              )}
            </div>

            {/* Google Account Authentication Banner */}
            {currentUser ? (
              <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={currentUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full border border-emerald-300 object-cover shrink-0"
                  />
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                      <span>Logged in: {currentUser.email}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Official Tax Invoice &amp; dispatch notifications will be emailed directly to this Gmail.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-3.5 p-3 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-semibold text-neutral-900">1-Click Auto Sign-in with Gmail</p>
                  <p className="text-[11px] text-gray-500">
                    Get order confirmation &amp; official tax invoice delivered straight to your Gmail.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetEmail = (email || '').trim().toLowerCase();
                    if (targetEmail) {
                      let e = targetEmail;
                      if (!e.includes('@')) e += '@gmail.com';
                      authService.loginWithGmailAuto(e, fullName.trim() || undefined).then((u) => {
                        setFullName(u.name);
                        setEmail(u.email);
                        if (u.phone) setPhone(u.phone);
                        if (u.address) setAddress(u.address);
                        if (u.city) setCity(u.city);
                        if (u.pincode) setPincode(u.pincode);
                      });
                    } else {
                      emailInputRef.current?.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:border-black text-xs font-semibold text-black rounded-none flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Gmail</span>
                </button>
              </div>
            )}

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
                <label className="block text-gray-600 font-medium mb-1">
                  Gmail / Email Address <span className="text-gray-400 font-normal">(Invoice &amp; delivery updates sent here)</span>
                </label>
                <div className="relative">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={currentUser?.email || email}
                    onChange={e => !currentUser && setEmail(e.target.value)}
                    readOnly={Boolean(currentUser)}
                    placeholder="name@gmail.com"
                    className={`w-full p-2.5 pr-20 border outline-none ${
                      currentUser
                        ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                        : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {currentUser ? (
                    <span className="absolute right-3 top-2.5 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <span>✓ Auto-Linked</span>
                    </span>
                  ) : (
                    !email.includes('@') && email.trim().length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEmail(email.trim() + '@gmail.com')}
                        className="absolute right-2 top-2 text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 font-mono text-gray-700 rounded-xs cursor-pointer"
                      >
                        +@gmail.com
                      </button>
                    )
                  )}
                </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-black bg-gray-50 font-semibold' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
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
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                  +Rs. 99 Delivery
                </span>
              </label>

              <label
                className={`p-3 border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'upi' ? 'border-black bg-gray-50 font-semibold' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
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
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                  FREE Delivery
                </span>
              </label>
            </div>

            {/* Delivery Fee Notice Banner */}
            {paymentMethod === 'cod' ? (
              <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-sm flex items-center justify-between">
                <span>💡 Tip: Choose <strong>Instant UPI QR</strong> to get <strong>100% FREE Delivery</strong> (Save Rs. 99)!</span>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm flex items-center">
                <span>🎉 <strong>FREE Delivery applied!</strong> You saved Rs. 99 by paying online via UPI.</span>
              </div>
            )}

            {/* UPI QR Payment Detail Block */}
            {paymentMethod === 'upi' && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 text-center animate-fade-in">
                <p className="text-xs font-bold text-black mb-1">Scan QR Code to Pay via any UPI App</p>
                <p className="text-[11px] text-gray-500 mb-3">GPay, PhonePe, Paytm, BHIM or Mobile Banking</p>

                <div className="inline-block p-2 bg-white border border-gray-200 shadow-xs mb-3">
                  <img
                    src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Leovra%20Enterprises&am=${totalAmount.toFixed(2)}&cu=INR&tn=Order%20Payment%20Leovra`)}`}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

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
