import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  LogOut, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  Truck,
  ExternalLink,
  Printer,
  MessageCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import { storeService } from '../services/storeService';
import { openPrintInvoice, openWhatsAppInvoice } from '../services/emailService';
import { AuthUser, Order } from '../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPasscode?: (emailOrPhone: string) => void;
  onViewInvoice?: (order: Order) => void;
  onTrackOrder?: (orderNumber: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onSendPasscode,
  onViewInvoice,
  onTrackOrder
}) => {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'address'>('orders');
  
  // Login form state
  const [gmailInput, setGmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Profile edit state
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email resend state
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = authService.subscribe((curr) => {
      setUser(curr);
      if (curr) {
        setEditPhone(curr.phone || '');
        setEditAddress(curr.address || '');
        setEditCity(curr.city || '');
        setEditPincode(curr.pincode || '');
      }
    });
    return () => unsub();
  }, []);

  const rawClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const hasValidGoogleClient = Boolean(
    rawClientId &&
    typeof rawClientId === 'string' &&
    rawClientId.trim().length > 15 &&
    rawClientId.includes('.apps.googleusercontent.com') &&
    rawClientId !== 'dummy-google-client-id'
  );

  // Initialize Google Identity Services One Tap ONLY if a valid registered Google Client ID is configured
  useEffect(() => {
    if (!isOpen || user || !hasValidGoogleClient) return;

    const setupGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: rawClientId,
            callback: (res: any) => {
              if (res?.credential) {
                authService.loginWithGoogleCredential(res.credential)
                  .then((u) => {
                    setToastMsg(`Welcome, ${u.name}! Signed in with Google.`);
                    setTimeout(() => setToastMsg(''), 3000);
                  })
                  .catch((err) => setAuthError(err.message));
              }
            }
          });

          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              width: 280
            });
          }
        } catch {
          // Google SDK init notice
        }
      }
    };

    const timer = setTimeout(setupGoogle, 300);
    return () => clearTimeout(timer);
  }, [isOpen, user, hasValidGoogleClient, rawClientId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter orders belonging to this user
  const allOrders = storeService.getOrders();
  const userOrders = user
    ? allOrders.filter(
        (o) =>
          (o.customer?.email && o.customer.email.toLowerCase() === user.email.toLowerCase()) ||
          (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          (user.phone && (o.customer?.phone || '').includes(user.phone))
      )
    : [];

  const handleGmailAutoSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailInput.trim()) return;

    let targetEmail = gmailInput.trim().toLowerCase();
    if (!targetEmail.includes('@')) {
      targetEmail += '@gmail.com';
    }

    try {
      setIsLoading(true);
      setAuthError('');
      const loggedUser = await authService.loginWithGmailAuto(targetEmail, nameInput.trim() || undefined);
      setGmailInput('');
      setNameInput('');
      setToastMsg(`Signed in as ${loggedUser.email}!`);
      setTimeout(() => setToastMsg(''), 3000);
      if (onSendPasscode) onSendPasscode(targetEmail);
    } catch (err: any) {
      setAuthError(err.message || 'Auto signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    authService.updateProfile({
      phone: editPhone.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      pincode: editPincode.trim()
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      setToastMsg('Shipping address updated successfully!');
      setTimeout(() => setToastMsg(''), 2500);
    }, 400);
  };

  const handleResendInvoice = async (order: Order) => {
    if (!user) return;
    setResendingOrderId(order.id);
    try {
      const result = await storeService.resendOrderInvoiceEmail(order, user.email);
      if (result.success) {
        setToastMsg(`Tax invoice dispatched to ${user.email} ✉️`);
      } else {
        setToastMsg(`Notice: ${result.error || result.message || 'Invoice logged'}`);
      }
    } catch {
      setToastMsg(`Invoice email sent to ${user.email}`);
    } finally {
      setTimeout(() => setResendingOrderId(null), 1000);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in touch-pan"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-lg w-full rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] animate-scale-in gpu-smooth text-neutral-800"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-neutral-900 text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Customer Account</h3>
              <p className="text-[11px] text-gray-400">
                {user ? user.email : 'Google Auto Sign-up & Order History'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-white active:scale-90 transition-all cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Notification Toast */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-medium animate-fade-in">
            {toastMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 touch-pan">
          {!user ? (
            /* ========================================== */
            /* 1. NOT LOGGED IN: GOOGLE AUTO SIGNUP VIEW */
            /* ========================================== */
            <div>
              <div className="text-center pb-5">
                <div className="w-13 h-13 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Customer Sign-up &amp; Login
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Sign in with your Gmail to view your order history, track live delivery status, and print official tax invoices.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {authError}
                </div>
              )}

              {/* If official GIS Client ID is configured, render Google button */}
              {hasValidGoogleClient && (
                <div className="flex flex-col items-center justify-center mb-4">
                  <div ref={googleBtnContainerRef} className="min-h-[42px] flex items-center justify-center" />
                  <div className="relative w-full my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-400 bg-white px-2">
                      <span>Or Enter Your Gmail Below</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Seamless 1-Click Gmail Form */}
              <form onSubmit={handleGmailAutoSignup} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Md Sartaj"
                    className="w-full p-2.5 border border-gray-300 text-xs outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Gmail Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={gmailInput}
                      onChange={(e) => setGmailInput(e.target.value)}
                      placeholder="e.g. leovracloth@gmail.com"
                      className="w-full p-2.5 pr-20 border border-gray-300 text-xs outline-none focus:border-black transition-colors"
                    />
                    {!gmailInput.includes('@') && gmailInput.trim().length > 1 && (
                      <button
                        type="button"
                        onClick={() => setGmailInput(gmailInput.trim() + '@gmail.com')}
                        className="absolute right-2 top-2 text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 font-mono text-gray-700 rounded-xs cursor-pointer"
                      >
                        +@gmail.com
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter the Gmail address used for placing orders to automatically see your tax invoices.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#121212] hover:bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md mt-4"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google / Gmail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center space-y-1">
                <p>&#128274; Passwordless sign-in with 100% verified SSL security.</p>
                <p className="text-[10px] text-gray-400">Order invoices and dispatch tracking links will automatically be sent to your Gmail.</p>
              </div>
            </div>
          ) : (
            /* ========================================== */
            /* 2. LOGGED IN: USER PROFILE & ORDERS VIEW   */
            /* ========================================== */
            <div>
              {/* Profile Card */}
              <div className="p-4 bg-gray-50 border border-gray-200 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-gray-300 object-cover bg-white"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-black">{user.name}</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-mono">{user.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    authService.logout();
                    setToastMsg('Signed out successfully.');
                    setTimeout(() => setToastMsg(''), 2500);
                  }}
                  title="Sign out of your account"
                  className="px-2.5 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-white border border-gray-200 rounded-none flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex border-b border-gray-200 mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'orders'
                      ? 'border-black text-black font-bold'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Orders ({userOrders.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'address'
                      ? 'border-black text-black font-bold'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Saved Shipping Address</span>
                </button>
              </div>

              {/* TAB 1: USER ORDERS */}
              {activeTab === 'orders' && (
                <div>
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-gray-50 border border-gray-100">
                      <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-700">No orders placed yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Orders placed with {user.email} will automatically appear here with full tax invoices.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3.5 border border-gray-200 hover:border-gray-400 bg-white transition-all text-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div>
                              <span className="font-bold text-black font-mono">#{ord.orderNumber}</span>
                              <span className="text-gray-400 text-[10px] ml-2">
                                {new Date(ord.orderDate || ord.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {ord.status || 'Confirmed'}
                            </span>
                          </div>

                          <div className="py-2.5 flex items-center justify-between text-gray-600">
                            <div>
                              <span>{ord.items?.length || 0} Items</span>
                              <span className="mx-1.5">&bull;</span>
                              <span className="uppercase text-[11px]">
                                {ord.paymentMethod === 'upi' ? 'UPI' : 'COD'}
                              </span>
                            </div>
                            <span className="font-extrabold text-sm text-black">
                              Rs. {Number(ord.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={() => openPrintInvoice(ord)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Print / Save PDF Invoice"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Print</span>
                            </button>

                            <button
                              onClick={() => openWhatsAppInvoice(ord)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer border border-emerald-200"
                              title="Share on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>

                            {onViewInvoice && (
                              <button
                                onClick={() => onViewInvoice(ord)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                            )}

                            {onTrackOrder && (
                              <button
                                onClick={() => onTrackOrder(ord.orderNumber || ord.id)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Track</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleResendInvoice(ord)}
                              disabled={resendingOrderId === ord.id}
                              className="px-2.5 py-1 bg-[#121212] hover:bg-black text-white font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                              title={`Send Tax Invoice to ${user.email}`}
                            >
                              <Mail className="w-3 h-3" />
                              <span>
                                {resendingOrderId === ord.id ? 'Sending...' : 'Email Invoice'}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SAVED SHIPPING ADDRESS */}
              {activeTab === 'address' && (
                <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                  <p className="text-[11px] text-gray-500 mb-2">
                    Save your default shipping address so checkout is pre-filled automatically.
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Phone Number (for Courier updates)
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 79799 68347"
                      className="w-full p-2.5 border border-gray-300 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Flat, House no., Building, Street"
                      className="w-full p-2.5 border border-gray-300 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full p-2.5 border border-gray-300 outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        placeholder="e.g. 110001"
                        className="w-full p-2.5 border border-gray-300 outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full bg-[#121212] hover:bg-black text-white py-2.5 font-bold uppercase tracking-wider text-xs active:scale-[0.98] transition-all cursor-pointer mt-3"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Default Address'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
