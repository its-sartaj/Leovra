import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  AlertTriangle
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
    products,
    currentCustomer,
    setIsAccountModalOpen,
    setAccountModalTab
  } = useStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI / Direct Call'>('Cash on Delivery');
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

  const handlePlaceDirectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim();
    const cleanAddress = customerAddress.trim();

    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for order delivery.');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 10) {
      setFormError('Please enter complete house/flat no., street, and locality.');
      return;
    }

    const fullDeliveryAddress = `${cleanAddress}${customerPincode ? ` - Pincode: ${customerPincode}` : ''}${customerCity ? `, ${customerCity}` : ''}`;

    const order = placeOrder({
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerAddress: fullDeliveryAddress,
      customerCity: customerCity || undefined,
      paymentMethod,
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
    setLastConfirmedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerPincode('');
    setCustomerCity('');
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
                  Your Shopping Bag ({cartCount})
                </h2>
                <p className="text-[10px] text-neutral-500">
                  Leovra Enterprises • Doorstep Delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && !lastConfirmedOrder && !isCheckingOut && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
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
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
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
                    <span className="text-neutral-500 font-medium">Total Amount:</span>
                    <strong className="text-sm font-black text-neutral-950">₹{lastConfirmedOrder.totalAmount}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Payment Mode:</span>
                    <strong className="text-neutral-900 font-semibold">{lastConfirmedOrder.paymentMethod}</strong>
                  </div>
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

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent(`Hello Leovra Enterprises! I just placed order #${lastConfirmedOrder.id} for ₹${lastConfirmedOrder.totalAmount}. Please confirm dispatch timing.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Order to WhatsApp (+91 {businessPhone})</span>
                  </a>

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
              /* Checkout Form */
              <form onSubmit={handlePlaceDirectOrder} className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Delivery & Contact Details</h3>
                    <p className="text-[10px] text-neutral-500">Fill your delivery details below</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer"
                  >
                    ← Back to Bag
                  </button>
                </div>

                {/* Validation Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-in shake">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma / Pooja Verma"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-sm"
                      id="checkout-name-input"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210 (10 digits)"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-sm"
                      id="checkout-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Complete Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Flat/House No., Building name, Street, Landmark"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden resize-none text-sm"
                      id="checkout-address-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        placeholder="e.g. 110001"
                        value={customerPincode}
                        onChange={(e) => setCustomerPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden text-sm"
                        id="checkout-pincode-input"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">City / Region</label>
                      <input
                        type="text"
                        placeholder="e.g. City or District"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 outline-hidden text-sm"
                        id="checkout-city-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Payment Preference</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Cash on Delivery')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          paymentMethod === 'Cash on Delivery'
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI / Direct Call')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          paymentMethod === 'UPI / Direct Call'
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        UPI / Direct Pay
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex justify-between text-sm font-extrabold text-neutral-900">
                    <span>Total Amount:</span>
                    <span>₹{grandTotal}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
                    id="confirm-direct-order-btn"
                  >
                    Confirm & Place Order (₹{grandTotal})
                  </button>

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
              </form>
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
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || 'default'}`} className="pt-3 flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-18 h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                                className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium text-neutral-700">
                                Size: {item.selectedSize}
                              </span>
                              {item.selectedColor && (
                                <span className="text-neutral-600">{item.selectedColor}</span>
                              )}
                            </div>

                            {isOutOfStock ? (
                              <div className="text-[10px] text-rose-600 font-bold mt-1">
                                Notice: Item recently went out of stock
                              </div>
                            ) : liveProduct.stock < item.quantity ? (
                              <div className="text-[10px] text-amber-600 font-bold mt-1">
                                Only {liveProduct.stock} units available
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
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
                  onClick={() => setIsCheckingOut(true)}
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
