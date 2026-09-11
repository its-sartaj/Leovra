import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MessageCircle, 
  ShoppingBag, 
  LogOut, 
  Edit3, 
  Save, 
  UserPlus, 
  LogIn,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { getShiprocketTrackingUrl } from '../services/shiprocket';

const CUSTOMER_CANCEL_REASONS = [
  'Ordered by mistake / गलती से ऑर्डर हो गया',
  'Changed my mind / अब जरूरत नहीं है',
  'Want to change size or delivery address / साइज या पता बदलना है',
  'Delivery time is too long / डिलीवरी में समय लग रहा है',
  'Found better deal or price / कहीं और पसंद आ गया',
  'Other reason / अन्य कारण',
];

export const CustomerAccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    setIsAccountModalOpen,
    accountModalTab,
    setAccountModalTab,
    currentCustomer,
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    updateCustomerProfile,
    customerOrders,
    cancelOrder,
    businessPhone
  } = useStore();

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Sync profile fields when customer changes
  useEffect(() => {
    if (currentCustomer) {
      setEditName(currentCustomer.name || '');
      setEditAddress(currentCustomer.address || '');
      setEditCity(currentCustomer.city || '');
      setEditEmail(currentCustomer.email || '');
    }
  }, [currentCustomer]);

  // Customer Order Cancellation State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [customerCancelReason, setCustomerCancelReason] = useState(CUSTOMER_CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  const handleOpenCancelModal = (order: Order) => {
    setCancellingOrder(order);
    setCustomerCancelReason(CUSTOMER_CANCEL_REASONS[0]);
    setCustomReasonText('');
    setCancelSuccessMsg(null);
  };

  const handleConfirmCustomerCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const finalReason = customerCancelReason.startsWith('Other') && customReasonText.trim()
      ? `Customer cancelled: ${customReasonText.trim()}`
      : `Customer cancelled: ${customerCancelReason}`;

    // Cancel order and automatically restore stock back to catalog
    cancelOrder(cancellingOrder.id, true, finalReason);
    setCancelSuccessMsg(`Order #${cancellingOrder.id} has been cancelled successfully.`);

    setTimeout(() => {
      setCancellingOrder(null);
      setCancelSuccessMsg(null);
    }, 2000);
  };

  if (!isAccountModalOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerCustomer(regName, regPhone, regEmail, regAddress, regCity);
    if (res.success) {
      setAccountModalTab('orders');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginCustomer(loginPhone, loginName);
    if (res.success) {
      setAccountModalTab('orders');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: editName.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      email: editEmail.trim(),
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => setIsAccountModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 border border-neutral-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-account-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 id="customer-account-title" className="text-sm font-bold text-neutral-900">
                {currentCustomer ? `Hi, ${currentCustomer.name}` : 'Customer Account / ग्राहक खाता'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {currentCustomer 
                  ? `Phone: +91 ${currentCustomer.phone} • Verified Account`
                  : 'Create account or login to view your purchased orders'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close Account Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-200 bg-neutral-100/50 px-4 pt-2">
          {currentCustomer ? (
            <>
              <button
                type="button"
                onClick={() => setAccountModalTab('orders')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  accountModalTab === 'orders'
                    ? 'border-neutral-900 text-neutral-950 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>My Orders (मेरे ऑर्डर)</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                  {customerOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccountModalTab('profile')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  accountModalTab === 'profile'
                    ? 'border-neutral-900 text-neutral-950 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-neutral-700" />
                <span>Profile & Address</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAccountModalTab('register')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  accountModalTab === 'register'
                    ? 'border-neutral-900 text-neutral-950 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>Create Account (नया खाता)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountModalTab('login')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  accountModalTab === 'login'
                    ? 'border-neutral-900 text-neutral-950 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-700" />
                <span>Sign In (लॉगिन करें)</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: CREATE ACCOUNT FORM */}
          {!currentCustomer && accountModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-neutral-600 leading-relaxed">
                  <span className="font-bold text-neutral-900">100% Free Customer Account: </span>
                  Account banane se aapke dwara khareede gaye sabhi orders yahan safely dikhenge aur fast delivery tracking milegi.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name / पूरा नाम <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Mobile Number / मोबाइल नंबर <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Orders placed with this number will be linked here.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Delivery Address / डिलीवरी का पता (वैकल्पिक)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="House/Flat, Street, Area, Colony"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    City & Pincode / शहर
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patna, 800001"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Create Customer Account / खाता बनाएं</span>
              </button>

              <p className="text-center text-xs text-neutral-500 pt-1">
                Already created an account?{' '}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('login')}
                  className="text-amber-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            </form>
          )}

          {/* TAB 2: SIGN IN FORM */}
          {!currentCustomer && accountModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <h4 className="text-xs font-bold text-neutral-800">Quick Sign In / तुरंत लॉगिन करें</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Apna 10-digit mobile number enter karein. Aapke dwara kharide gaye sabhi orders turant screen par aa jayenge.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Registered Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Your Name / आपका नाम (अगर पहली बार हैं)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Sign In & View My Orders / लॉगिन करें</span>
              </button>

              <p className="text-center text-xs text-neutral-500 pt-1">
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('register')}
                  className="text-amber-600 font-bold hover:underline cursor-pointer"
                >
                  Create New Account
                </button>
              </p>
            </form>
          )}

          {/* TAB 3: MY ORDERS (ONLY FOR THIS LOGGED-IN CUSTOMER) */}
          {currentCustomer && accountModalTab === 'orders' && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-neutral-700">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Showing orders for: <strong className="text-neutral-900 font-mono">+91 {currentCustomer.phone}</strong></span>
                </div>
                <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full text-[10px]">
                  {customerOrders.length} {customerOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {customerOrders.length === 0 ? (
                /* Empty state for this specific customer */
                <div className="py-10 px-4 text-center space-y-3 bg-neutral-50/60 rounded-2xl border border-neutral-200/60">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-800">No Orders Found for this Account</h4>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      Aapne abhi tak is account se koi order nahi kiya hai. Apni pasandida items bag me daalein aur order karein.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xs mx-auto justify-center">
                    <button
                      onClick={() => {
                        setIsAccountModalOpen(false);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Shop Now
                    </button>
                    <a
                      href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent(`Hello Leovra Enterprises! My name is ${currentCustomer.name} (${currentCustomer.phone}). I want to place an order.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Orders List specifically for this customer */
                <div className="space-y-3.5">
                  {customerOrders.map((order) => {
                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={order.id}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 shadow-2xs hover:border-amber-400 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-neutral-200/70 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-neutral-900 font-mono tracking-tight">
                                {order.id}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                order.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {order.status === 'Cancelled' ? <XCircle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3" />}
                                {order.status || 'Confirmed'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>Placed on {dateStr}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-neutral-950">
                              ₹{order.totalAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-medium">
                              {order.paymentMethod}
                            </div>
                          </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Purchased Items ({order.items.reduce((s, i) => s + i.quantity, 0)}):
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => {
                              const prodName = item.product?.name || (item as any).name || 'Fashion Item';
                              const prodPrice = item.product?.price ?? (item as any).price ?? 0;
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs text-neutral-800 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200/60">
                                  <span className="font-semibold truncate max-w-[200px] sm:max-w-[260px]">
                                    {prodName} {item.selectedSize ? `(${item.selectedSize})` : ''}
                                  </span>
                                  <span className="text-neutral-600 font-mono text-[11px]">
                                    ×{item.quantity} = ₹{(prodPrice * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="text-[11px] text-neutral-600 bg-white p-2.5 rounded-xl border border-neutral-200 flex items-start gap-2">
                          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-neutral-800">Delivering to: </span>
                            <span>{order.customerAddress}{order.customerCity ? `, ${order.customerCity}` : ''}</span>
                          </div>
                        </div>

                        {/* Shiprocket Live Tracking Status */}
                        {order.awbCode ? (
                          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-purple-700" />
                                <span className="font-extrabold text-neutral-900 text-xs">Shiprocket Express Shipping</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-black text-[10px] uppercase">
                                {order.courierName || 'In Transit'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-neutral-700">
                              <span>AWB / Tracking Number:</span>
                              <span className="font-mono font-bold text-neutral-950 bg-white px-2 py-0.5 rounded border border-purple-200">
                                {order.awbCode}
                              </span>
                            </div>
                            <a
                              href={getShiprocketTrackingUrl(order.awbCode)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-center"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Track Live on Shiprocket</span>
                            </a>
                          </div>
                        ) : order.status === 'Cancelled' ? (
                          <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl flex items-center justify-between gap-2 font-medium">
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Order Cancelled: <strong>{order.cancellationReason || 'Cancelled by customer'}</strong></span>
                            </div>
                            <span className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                              Stock Restored
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500 bg-neutral-100/60 p-2 rounded-xl flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>Order confirmed • Preparing for Shiprocket courier pickup from Delhi hub.</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent(
                              order.status === 'Cancelled'
                                ? `Hello Leovra Enterprises! My order #${order.id} was cancelled (${order.cancellationReason || ''}). Please guide regarding refund or re-ordering.`
                                : order.awbCode 
                                ? `Hello Leovra Enterprises! Regarding my Order #${order.id} (AWB: ${order.awbCode}): Please provide an update on delivery.`
                                : `Hello Leovra Enterprises! Please provide tracking status for my Order ID: ${order.id} (Total: ₹${order.totalAmount.toLocaleString('en-IN')}). Customer Phone: ${currentCustomer?.phone || order.customerPhone || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer text-center min-w-[130px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Track on WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${businessPhone}`}
                            className="py-2 px-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            title="Call customer support for this order"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Support</span>
                          </a>

                          {/* Customer Self-Cancellation Button (Only for active / non-cancelled orders) */}
                          {order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order)}
                              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              title="Cancel this order / ऑर्डर रद्द करें"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & ADDRESS (WHEN LOGGED IN) */}
          {currentCustomer && accountModalTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Customer Information / ग्राहक जानकारी</span>
                  </h4>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Delivery Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="House, Street, Area"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">City / Pincode</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City, State, Pincode"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="py-1.5 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save Address</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="py-1.5 px-3 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2 text-xs text-neutral-700">
                    <div className="flex items-center justify-between py-1 border-b border-neutral-200/50">
                      <span className="text-neutral-500">Name:</span>
                      <span className="font-bold text-neutral-900">{currentCustomer.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-neutral-200/50">
                      <span className="text-neutral-500">Phone:</span>
                      <span className="font-mono font-bold text-neutral-900">+91 {currentCustomer.phone}</span>
                    </div>
                    {currentCustomer.email && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-200/50">
                        <span className="text-neutral-500">Email:</span>
                        <span>{currentCustomer.email}</span>
                      </div>
                    )}
                    <div className="py-1">
                      <span className="text-neutral-500 block mb-0.5">Saved Delivery Address:</span>
                      <span className="font-medium text-neutral-800 block bg-white p-2 rounded-lg border border-neutral-200/60">
                        {currentCustomer.address ? `${currentCustomer.address}${currentCustomer.city ? `, ${currentCustomer.city}` : ''}` : 'No address saved yet. Click edit to add delivery address.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Stats & Logout */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={logoutCustomer}
                  className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out (लॉग आउट)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountModalTab('orders')}
                  className="py-2 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View My Orders</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Support Info */}
        <div className="p-3 bg-neutral-100/80 border-t border-neutral-200 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-2">
          <span>Need help? WhatsApp assistance:</span>
          <a
            href={`https://wa.me/91${businessPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            +91 {businessPhone}
          </a>
        </div>
      </div>

      {/* Customer Order Cancellation Confirmation Dialog */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Cancel Order #{cancellingOrder.id}?</h3>
                  <p className="text-xs text-neutral-500">
                    Total: ₹{cancellingOrder.totalAmount.toLocaleString('en-IN')} • {cancellingOrder.paymentMethod}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelSuccessMsg ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{cancelSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmCustomerCancel} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Reason for Cancellation / रद्द करने का कारण <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customerCancelReason}
                    onChange={(e) => setCustomerCancelReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-neutral-800 cursor-pointer"
                  >
                    {CUSTOMER_CANCEL_REASONS.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {customerCancelReason.startsWith('Other') && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Please specify your reason:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customReasonText}
                      onChange={(e) => setCustomReasonText(e.target.value)}
                      placeholder="Type your reason here..."
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                )}

                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Instant Action & Stock Restored</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Order cancel hone ke baad product ka stock turant wapas live catalog me add ho jayega. Agar UPI/online payment tha to hamari support team se WhatsApp par refund status confirm karein.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    No, Keep Order
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Cancel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
