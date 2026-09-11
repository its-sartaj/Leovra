import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Banknote,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartTotal, 
    cartCount, 
    clearCart,
    placeOrder,
    generateWhatsAppOrderUrl,
    businessPhone,
    businessUpi,
    products,
    currentCustomer,
    setIsAccountModalOpen,
    setAccountModalTab
  } = useStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI / Online Payment'>('UPI / Online Payment');
  const [transactionId, setTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill from logged-in customer profile
  React.useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name || '');
      if (!customerPhone) setCustomerPhone(currentCustomer.phone || '');
      if (!customerAddress) setCustomerAddress(currentCustomer.address || '');
      if (!customerCity) setCustomerCity(currentCustomer.city || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCustomer]);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const isFreeDelivery = cartTotal >= freeDeliveryThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : 49;
  const grandTotal = cartTotal + deliveryCharge;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartTotal);

  const businessUpiId = businessUpi || '7979968347@slc';
  const upiUrl = `upi://pay?pa=${businessUpiId}&pn=${encodeURIComponent('Leovra Enterprises')}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Order Payment Leovra')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = (upi: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Step 1: Validate address and proceed to payment selection
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim().replace(/\D/g, '');
    const cleanAddress = customerAddress.trim();

    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for order delivery.');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      setFormError('Please enter complete house/flat no., street, and locality.');
      return;
    }

    setCheckoutStep('payment');
  };

  // Step 2: Finalize and place the order
  const handlePlaceFinalOrder = () => {
    setFormError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim();
    const cleanAddress = customerAddress.trim();
    const fullDeliveryAddress = `${cleanAddress}${customerPincode ? ` - Pincode: ${customerPincode}` : ''}${customerCity ? `, ${customerCity}` : ''}`;

    const order = placeOrder({
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerAddress: fullDeliveryAddress,
      customerCity: customerCity || undefined,
      paymentMethod,
      totalAmount: grandTotal,
      transactionId: transactionId.trim() || undefined,
    });

    setLastConfirmedOrder(order);
  };

  const getWhatsAppUrl = () => {
    return generateWhatsAppOrderUrl(cart, {
      name: customerName || 'Valued Customer',
      phone: customerPhone || 'Not provided',
      address: customerAddress ? `${customerAddress}${customerCity ? `, ${customerCity}` : ''}` : 'Doorstep Delivery',
    });
  };

  const resetCheckoutModal = () => {
    setIsCheckingOut(false);
    setCheckoutStep('address');
    setLastConfirmedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerPincode('');
    setCustomerCity('');
    setTransactionId('');
    setCopiedUpi(false);
    setFormError(null);
    setIsCartOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
      id="cart-drawer-overlay"
    >
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-tight">
                  {lastConfirmedOrder ? 'Order Confirmation' : isCheckingOut ? (checkoutStep === 'payment' ? 'Payment Options (Step 2/2)' : 'Delivery Details (Step 1/2)') : `Your Shopping Bag (${cartCount})`}
                </h2>
                <p className="text-[10px] text-neutral-500">
                  Leovra Enterprises • 100% Genuine Products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && !lastConfirmedOrder && !isCheckingOut && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 cursor-pointer"
                  title="Remove all items from bag"
                >
                  Clear Bag
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                id="close-cart-drawer-btn"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* If Order Just Placed Successfully */}
            {lastConfirmedOrder ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900">Order Confirmed!</h3>
                  <div className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    Order ID: #{lastConfirmedOrder.id}
                  </div>
                </div>
                
                <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                  Thank you, <strong>{lastConfirmedOrder.customerName}</strong>! Your order has been placed and inventory has been reserved.
                </p>

                {/* Confirmed Order Summary */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                    <span className="text-neutral-500 font-medium">Total Payable:</span>
                    <strong className="text-base font-black text-neutral-950">₹{lastConfirmedOrder.totalAmount}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Payment Mode:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                      lastConfirmedOrder.paymentMethod === 'Cash on Delivery'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      {lastConfirmedOrder.paymentMethod}
                    </span>
                  </div>
                  {lastConfirmedOrder.transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-medium">UPI Ref / UTR:</span>
                      <strong className="font-mono text-emerald-700 font-bold">{lastConfirmedOrder.transactionId}</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-neutral-500 font-medium shrink-0">Delivery Address:</span>
                    <span className="text-neutral-800 text-right font-medium max-w-[200px] leading-snug">
                      {lastConfirmedOrder.customerAddress}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1.5">
                      Reserved Items ({lastConfirmedOrder.items.length}):
                    </div>
                    <div className="space-y-1">
                      {lastConfirmedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-neutral-700">
                          <span className="truncate max-w-[180px]">
                            {item.quantity}x {item.product.name} ({item.selectedSize})
                          </span>
                          <span className="font-semibold shrink-0">₹{item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* If UPI, provide post-order payment assistance */}
                {lastConfirmedOrder.paymentMethod !== 'Cash on Delivery' && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>UPI Payment Confirmation</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Please share your payment screenshot on WhatsApp so our dispatch team can immediately fast-track your package.
                    </p>
                    <a
                      href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent(
                        `Hello Leovra Enterprises! I have placed order #${lastConfirmedOrder.id} for ₹${lastConfirmedOrder.totalAmount} via UPI.${lastConfirmedOrder.transactionId ? ` (UTR: ${lastConfirmedOrder.transactionId})` : ''} Attached is my payment confirmation.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Payment Screenshot on WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetCheckoutModal();
                      setAccountModalTab('orders');
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    View My Orders & Track Account
                  </button>

                  <button
                    onClick={resetCheckoutModal}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : isCheckingOut ? (
              /* Checkout Process: Step 1 or Step 2 */
              <div className="space-y-4">
                
                {/* Stepper Indicator */}
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      checkoutStep === 'address' ? 'bg-amber-500 text-neutral-950' : 'bg-emerald-500 text-white'
                    }`}>
                      {checkoutStep === 'payment' ? '✓' : '1'}
                    </span>
                    <span className={checkoutStep === 'address' ? 'text-neutral-900 font-black' : 'text-neutral-500'}>
                      Delivery
                    </span>
                    <span className="text-neutral-300">→</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      checkoutStep === 'payment' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      2
                    </span>
                    <span className={checkoutStep === 'payment' ? 'text-neutral-900 font-black' : 'text-neutral-500'}>
                      Payment Option
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (checkoutStep === 'payment') {
                        setCheckoutStep('address');
                      } else {
                        setIsCheckingOut(false);
                      }
                    }}
                    className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{checkoutStep === 'payment' ? 'Back' : 'Back to Bag'}</span>
                  </button>
                </div>

                {/* Validation Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-in shake">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: DELIVERY ADDRESS */}
                {checkoutStep === 'address' && (
                  <form onSubmit={handleProceedToPayment} className="space-y-3.5">
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Full Name / पूरा नाम <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma / Pooja Verma"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-sm bg-neutral-50/50"
                          id="checkout-name-input"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-sm font-bold text-neutral-400">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            value={customerPhone}
                            onChange={(e) => {
                              setCustomerPhone(e.target.value.replace(/\D/g, ''));
                              if (formError) setFormError(null);
                            }}
                            className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-sm font-mono bg-neutral-50/50"
                            id="checkout-phone-input"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">Order tracking updates will be sent to this number.</p>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Complete Delivery Address / पूरा पता <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Flat/House No., Building Name, Street, Landmark, Area"
                          value={customerAddress}
                          onChange={(e) => {
                            setCustomerAddress(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden resize-none text-sm bg-neutral-50/50"
                          id="checkout-address-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">City / शहर</label>
                          <input
                            type="text"
                            placeholder="e.g. Patna / Delhi"
                            value={customerCity}
                            onChange={(e) => setCustomerCity(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden text-sm bg-neutral-50/50"
                            id="checkout-city-input"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">Pincode / पिनकोड</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 800001"
                            value={customerPincode}
                            onChange={(e) => setCustomerPincode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden text-sm font-mono bg-neutral-50/50"
                            id="checkout-pincode-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                      <div className="flex justify-between items-center text-sm font-extrabold text-neutral-900">
                        <span>Order Amount:</span>
                        <span className="text-base font-black">₹{grandTotal}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                        id="proceed-to-payment-step-btn"
                      >
                        <span>Continue to Payment Options</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </button>

                      <div className="text-center pt-1">
                        <a
                          href={getWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Or order directly via WhatsApp (+91 {businessPhone})</span>
                        </a>
                      </div>
                    </div>
                  </form>
                )}

                {/* STEP 2: CHOOSE PAYMENT METHOD & COMPLETE ORDER */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-200">
                    
                    {/* Delivery Address Summary Card */}
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Deliver To:</span>
                        <div className="font-extrabold text-neutral-900">{customerName} (+91 {customerPhone})</div>
                        <div className="text-[11px] text-neutral-600 truncate max-w-[240px] mt-0.5">
                          {customerAddress}{customerCity ? `, ${customerCity}` : ''}{customerPincode ? ` - ${customerPincode}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('address')}
                        className="text-xs font-bold text-amber-700 hover:underline px-2 py-1 cursor-pointer shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Amount to Pay Banner */}
                    <div className="p-3.5 bg-neutral-950 text-white rounded-2xl flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Amount to Pay</div>
                        <div className="text-xl font-black text-amber-400 font-mono leading-tight">₹{grandTotal}</div>
                      </div>
                      <div className="text-right text-[11px] text-neutral-300">
                        <div>{cartCount} Items Selected</div>
                        <div className="text-emerald-400 font-semibold">{isFreeDelivery ? 'Free Delivery' : '+ ₹49 Delivery'}</div>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div>
                      <label className="block font-bold text-neutral-800 mb-2">
                        Select Payment Option / भुगतान का तरीका:
                      </label>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Option 1: UPI / Online Payment */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('UPI / Online Payment')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            paymentMethod === 'UPI / Online Payment'
                              ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <QrCode className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              Instant
                            </span>
                          </div>
                          <div className="font-extrabold text-neutral-900 text-xs">UPI / Online Pay</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">GPay, PhonePe, Paytm, QR</div>
                        </button>

                        {/* Option 2: Cash on Delivery */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Cash on Delivery')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            paymentMethod === 'Cash on Delivery'
                              ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                              <Banknote className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              Doorstep
                            </span>
                          </div>
                          <div className="font-extrabold text-neutral-900 text-xs">Cash on Delivery</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">Pay cash when item arrives</div>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC PAYMENT DETAILS BASED ON SELECTED METHOD */}
                    
                    {/* IF UPI IS SELECTED: LIVE QR CODE & DIRECT 1-CLICK PAY APP */}
                    {paymentMethod === 'UPI / Online Payment' && (
                      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3.5">
                        <div className="text-center space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>100% Safe UPI Direct Payment</span>
                          </span>
                          <h4 className="font-black text-neutral-900 text-xs sm:text-sm">Scan QR or Tap to Pay via UPI</h4>
                          <p className="text-[11px] text-neutral-500">Pay directly to Leovra Enterprises: ₹{grandTotal}</p>
                        </div>

                        {/* Live QR Code Box */}
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                          <img 
                            src={qrCodeUrl} 
                            alt="Scan to Pay via UPI" 
                            className="w-40 h-40 object-contain rounded-lg border border-neutral-100"
                          />
                          <div className="text-[10px] text-neutral-400 font-bold mt-1.5 uppercase tracking-wider">
                            Scan with GPay, PhonePe, Paytm or BHIM
                          </div>
                        </div>

                        {/* 1-Click Direct Pay Button for Mobile Users */}
                        <a
                          href={upiUrl}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors text-center"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Pay ₹{grandTotal} with any UPI App (GPay / PhonePe / Paytm)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Copy UPI ID */}
                        <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">UPI ID:</span>
                            <span className="font-mono font-bold text-neutral-900">{businessUpiId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyUpi(businessUpiId)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                          </button>
                        </div>

                        {/* Optional UTR / Reference No. */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                            UPI Ref / UTR No. (Optional / वैकल्पिक)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 12-digit UPI reference number after payment"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:border-emerald-500 outline-hidden text-xs font-mono bg-white"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="button"
                          onClick={handlePlaceFinalOrder}
                          className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                          id="confirm-upi-order-btn"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Confirm Order (Paid ₹{grandTotal} via UPI)</span>
                        </button>
                      </div>
                    )}

                    {/* IF COD IS SELECTED: DIRECT COD CONFIRMATION */}
                    {paymentMethod === 'Cash on Delivery' && (
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3.5">
                        <div className="flex items-start gap-2.5">
                          <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-extrabold text-neutral-900 text-xs">Cash on Delivery Confirmed</h4>
                            <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                              You do not need to pay anything right now. Please keep exact cash of <strong>₹{grandTotal}</strong> ready when the courier partner arrives at your address.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handlePlaceFinalOrder}
                          className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                          id="confirm-cod-order-btn"
                        >
                          <span>Place Cash on Delivery Order (₹{grandTotal})</span>
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        </button>
                      </div>
                    )}

                    <div className="text-center pt-1">
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Or complete order via WhatsApp (+91 {businessPhone})</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : cart.length === 0 ? (
              /* Empty Bag State */
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explore our exclusive collection of designer earrings, trendy t-shirts, and stylish lowers!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              /* Items List */
              <>
                {/* Free Shipping Progress */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between font-semibold text-amber-900 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      {isFreeDelivery ? '🎉 Free Doorstep Delivery Unlocked!' : `Add ₹${amountNeeded} more for Free Delivery`}
                    </span>
                    <span className="font-bold">{isFreeDelivery ? '100%' : `${Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100))}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartTotal / freeDeliveryThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 divide-y divide-neutral-100">
                  {cart.map((item) => {
                    // Check against live product state
                    const liveProduct = products.find(p => p.id === item.product.id) || item.product;
                    const isOutOfStock = liveProduct.isOutOfStock || liveProduct.stock <= 0;

                    return (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || ''}`} className="pt-3 flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">
                                {item.product.name}
                              </h3>
                              <button
                                onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                                className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                              <span className="font-semibold text-neutral-700">Size: {item.selectedSize}</span>
                              {item.selectedColor && (
                                <>
                                  <span>•</span>
                                  <span>{item.selectedColor}</span>
                                </>
                              )}
                            </div>

                            {isOutOfStock && (
                              <div className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Out of stock - please remove or update</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.quantity - 1, item.selectedColor)}
                                className="px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-xs font-bold text-neutral-900 min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.quantity + 1, item.selectedColor)}
                                disabled={item.quantity >= liveProduct.stock}
                                className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors ${
                                  item.quantity >= liveProduct.stock
                                    ? 'text-neutral-300 cursor-not-allowed bg-neutral-100'
                                    : 'text-neutral-700 hover:bg-neutral-200'
                                }`}
                                title={item.quantity >= liveProduct.stock ? 'Maximum available stock reached' : 'Add 1 more'}
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-extrabold text-sm text-neutral-900">
                                ₹{item.product.price * item.quantity}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                (₹{item.product.price} each)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Subtotal & Action CTAs */}
          {cart.length > 0 && !lastConfirmedOrder && !isCheckingOut && (
            <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/70 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal ({cartCount} items):</span>
                  <span className="font-semibold text-neutral-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Doorstep Express Delivery:</span>
                  <span className={`font-semibold ${isFreeDelivery ? 'text-emerald-600' : 'text-neutral-900'}`}>
                    {isFreeDelivery ? 'FREE' : '₹49'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-1.5 border-t border-neutral-200">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCheckingOut(true);
                    setCheckoutStep('address');
                  }}
                  className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                  id="proceed-to-checkout-btn"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-center"
                  id="cart-whatsapp-order-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp (+91 {businessPhone})</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe Checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" /> Fast Delivery
                </span>
                <span>•</span>
                <a href={`tel:${businessPhone}`} className="hover:text-neutral-900 font-medium">
                  +91 {businessPhone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
