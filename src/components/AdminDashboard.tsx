import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  FileText, 
  Check, 
  RefreshCw, 
  ArrowLeft,
  Truck,
  IndianRupee,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Product, Order, Coupon, StoreSettings } from '../types';
import { storeService } from '../services/storeService';
import { Logo } from './Logo';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onViewInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onViewInvoice
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('7979968347');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'coupons' | 'settings'>('dashboard');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storeService.getSettings());

  // Filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Selected Order for status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('processing');
  const [statusNote, setStatusNote] = useState('');
  const [trackingAwb, setTrackingAwb] = useState('');
  const [courierName, setCourierName] = useState('Blue Dart Express');

  // Product modal (create / edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Coupon modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const reloadData = () => {
    setOrders(storeService.getOrders());
    setProducts(storeService.getProducts());
    setCoupons(storeService.getCoupons());
    setSettings(storeService.getSettings());
  };

  useEffect(() => {
    const token = sessionStorage.getItem('lc_admin_token') || localStorage.getItem('lc_admin_token');
    if (token === 'admin_authorized_session') {
      setIsAuthenticated(true);
    }
    reloadData();
    return storeService.subscribe(reloadData);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setLoginError('Please enter both your Owner Login ID and Password.');
      return;
    }

    const cleanId = loginId.trim();
    if ((cleanId === '7979968347' || cleanId === 'admin') && password === 'Sarzad@!123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lc_admin_token', 'admin_authorized_session');
      setLoginError('');
      showToast('Welcome back, Owner!');
    } else {
      setLoginError('Invalid Owner ID or Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lc_admin_token');
    localStorage.removeItem('lc_admin_token');
  };

  // Status update
  const handleUpdateOrderStatus = () => {
    if (!selectedOrder) return;
    storeService.updateOrderStatus(
      selectedOrder.id,
      newStatus,
      statusNote.trim() || undefined,
      'Admin',
      trackingAwb.trim() || undefined,
      courierName
    );
    setOrders(storeService.getOrders());
    showToast(`Order #${selectedOrder.orderNumber} updated to ${newStatus}`);
    setSelectedOrder(null);
    setStatusNote('');
    setTrackingAwb('');
  };

  // Product actions
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.price) return;
    storeService.saveProduct(editingProduct);
    setProducts(storeService.getProducts());
    showToast(editingProduct.id ? 'Product updated.' : 'Product created.');
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      storeService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product removed from catalog.');
    }
  };

  const handleToggleProductStatus = (id: string) => {
    const updated = storeService.toggleProductStatus(id);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: updated.isActive } : p));
      showToast(`Product ${updated.isActive ? 'activated' : 'disabled'}.`);
    }
  };

  // Coupon actions
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code || !editingCoupon?.discountValue) return;
    storeService.saveCoupon(editingCoupon as Coupon);
    setCoupons(storeService.getCoupons());
    showToast('Coupon saved successfully.');
    setIsCouponModalOpen(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Delete coupon code?')) {
      storeService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast('Coupon deleted.');
    }
  };

  // Settings action
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storeService.saveSettings(settings);
    setSettings({ ...updated });
    showToast('Store settings saved successfully.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full p-8 shadow-xl border border-neutral-200">
          <div className="flex justify-center mb-4">
            <Logo size="sm" showText={true} />
          </div>
          <h2 className="text-center font-extrabold text-sm uppercase tracking-wider text-black mb-1">
            Owner Inventory Portal
          </h2>
          <p className="text-center text-xs text-neutral-500 mb-6">
            Enter authorized owner credentials to access store operations.
          </p>

          {loginError && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Owner ID</label>
              <input
                type="text"
                required
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="7979968347"
                className="w-full p-2.5 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-neutral-300 focus:border-black outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#121212] hover:bg-black text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In to Admin
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="w-full py-2 text-neutral-500 hover:text-black font-semibold text-center transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      (o.trackingId && o.trackingId.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const pendingOrders = orders.filter(o => o.status === 'order_placed' || o.status === 'payment_pending').length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900">
      {/* Admin Top Navigation Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToStore}
            className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <Logo size="xs" showText={true} />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-800 font-semibold p-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Subheader Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex space-x-6 text-xs font-semibold uppercase tracking-wider">
          {[
            { id: 'dashboard', label: 'Overview', icon: IndianRupee },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
            { id: 'products', label: `Catalog (${products.length})`, icon: Package },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#121212] text-white text-xs px-4 py-3 shadow-2xl flex items-center space-x-2 animate-bounce-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ===================== TAB 1: OVERVIEW DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Store Revenue</span>
                <p className="text-2xl font-black text-black mt-2">Rs. {totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-400 mt-1">Across all confirmed customer orders</p>
              </div>
              <div className="bg-white p-5 border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Orders</span>
                <p className="text-2xl font-black text-black mt-2">{orders.length}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{pendingOrders} pending verification / packing</p>
              </div>
              <div className="bg-white p-5 border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Live Catalog Items</span>
                <p className="text-2xl font-black text-black mt-2">{products.filter(p => p.isActive).length}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{products.length} total SKU variants registered</p>
              </div>
              <div className="bg-white p-5 border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Active Coupons</span>
                <p className="text-2xl font-black text-black mt-2">{coupons.filter(c => c.isActive).length}</p>
                <p className="text-[10px] text-neutral-400 mt-1">LEOVRA200, FESTIVE500 & welcome promos</p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-neutral-200 shadow-2xs p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-black">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  View All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 uppercase font-bold text-[10px]">
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Items</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="py-3 font-mono font-bold text-black">{order.orderNumber}</td>
                        <td className="py-3">
                          <p className="font-semibold text-neutral-900">{order.customer.fullName}</p>
                          <p className="text-[10px] text-neutral-400">{order.customer.phone}</p>
                        </td>
                        <td className="py-3">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</td>
                        <td className="py-3">
                          <span className="uppercase text-[10px] font-bold text-neutral-700">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-neutral-100 text-neutral-800 rounded-xs">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-black">
                          Rs. {order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ORDERS MANAGEMENT ===================== */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-neutral-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by order #, customer, phone, AWB..."
                  className="p-2 border border-neutral-300 text-xs w-64 focus:border-black outline-none"
                />
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="p-2 border border-neutral-300 text-xs bg-white focus:border-black outline-none font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="order_placed">Order Placed</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="return_requested">Return Requested</option>
                </select>
              </div>

              <span className="text-xs text-neutral-500 font-medium">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase font-bold text-[10px]">
                    <th className="py-2.5">Order Reference</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Customer & City</th>
                    <th className="py-2.5">Items / SKU</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        No orders match the selected search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="py-3 font-mono font-bold text-black">
                          {order.orderNumber}
                          {order.trackingId && (
                            <span className="block text-[10px] text-blue-600 font-mono">
                              AWB: {order.trackingId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-neutral-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-black">{order.customer.fullName}</p>
                          <p className="text-[10px] text-neutral-500">
                            {order.customer.phone} • {order.customer.city}
                          </p>
                        </td>
                        <td className="py-3">
                          {order.items.map((it, i) => (
                            <div key={i} className="text-[11px] text-neutral-700">
                              {it.quantity} × {it.title} ({it.size})
                            </div>
                          ))}
                        </td>
                        <td className="py-3">
                          <span className="uppercase text-[10px] font-bold text-neutral-800">
                            {order.paymentMethod}
                          </span>
                          {order.upiUtrNumber && (
                            <span className="block text-[10px] text-neutral-500 font-mono">
                              UTR: {order.upiUtrNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-neutral-100 text-neutral-800 rounded-xs">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-black">
                          Rs. {order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setTrackingAwb(order.trackingId || '');
                            }}
                            className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => onViewInvoice(order)}
                            className="p-1 text-neutral-600 hover:text-black cursor-pointer inline-block"
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Manage Order Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                    <h3 className="font-bold text-sm uppercase text-black">
                      Update Order #{selectedOrder.orderNumber}
                    </h3>
                    <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-black">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Update Status:</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="w-full p-2 border border-neutral-300 bg-white font-medium outline-none text-xs"
                    >
                      <option value="order_placed">Order Placed</option>
                      <option value="payment_pending">Payment Pending Verification</option>
                      <option value="processing">Processing in Warehouse</option>
                      <option value="packed">Packed in Box</option>
                      <option value="dispatched">Dispatched with Courier</option>
                      <option value="delivered">Delivered to Customer</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="return_approved">Return Approved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Carrier / Courier Name:</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={e => setCourierName(e.target.value)}
                      className="w-full p-2 border border-neutral-300 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">AWB Tracking Number:</label>
                    <input
                      type="text"
                      value={trackingAwb}
                      onChange={e => setTrackingAwb(e.target.value)}
                      placeholder="e.g. BD84920194"
                      className="w-full p-2 border border-neutral-300 font-mono outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Timeline Update Note:</label>
                    <textarea
                      rows={2}
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="e.g. Verified payment against bank statement."
                      className="w-full p-2 border border-neutral-300 outline-none text-xs resize-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={handleUpdateOrderStatus}
                      className="flex-1 py-2.5 bg-black text-white font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                    >
                      Save Status
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2.5 bg-neutral-200 text-neutral-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: PRODUCT CATALOG ===================== */}
        {activeTab === 'products' && (
          <div className="bg-white border border-neutral-200 shadow-2xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-black">
                Catalog Inventory ({products.length})
              </h3>
              <button
                onClick={() => {
                  setEditingProduct({
                    title: '',
                    price: 1499,
                    category: 'mens_tshirts',
                    gender: 'gents',
                    type: 'tshirts',
                    stock: 25,
                    image: '',
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: [{ name: 'Black', hex: '#000000' }],
                    isActive: true,
                    isNew: true
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-90 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-300 p-8 space-y-3">
                <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-bold text-neutral-800">No products in catalog</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  All previous demo items have been removed. Click &quot;Add New Product&quot; to list your inventory.
                </p>
                <button
                  onClick={() => {
                    setEditingProduct({
                      title: '',
                      price: 99,
                      category: 'jewellery',
                      gender: 'ladies',
                      type: 'accessories',
                      stock: 10,
                      image: '',
                      sizes: ['Free Size'],
                      colors: [{ name: 'Gold', hex: '#d4af37' }],
                      isActive: true,
                      isNew: true
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 hover:opacity-90 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="border border-neutral-200 p-3 flex flex-col justify-between text-xs space-y-2">
                    <div className="relative aspect-[1/1.12] bg-neutral-100 overflow-hidden">
                      <img src={prod.image} alt="" className="w-full h-full object-cover" />
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 uppercase ${
                          prod.isActive ? 'bg-black text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {prod.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">{prod.sku}</p>
                      <h4 className="font-bold text-black line-clamp-1">{prod.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold">Rs. {prod.price.toLocaleString()}</span>
                        <span className="text-[11px] text-neutral-500">Stock: {prod.stock}</span>
                      </div>
                    </div>

                    <div className="flex space-x-1 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 font-semibold text-center cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleProductStatus(prod.id)}
                        className="px-2 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                        title="Toggle active"
                      >
                        {prod.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Edit / Add Modal */}
            {isProductModalOpen && editingProduct && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <form
                  onSubmit={handleSaveProduct}
                  className="bg-white max-w-lg w-full p-6 shadow-xl space-y-3 text-xs my-auto"
                >
                  <h3 className="font-bold text-sm uppercase text-black pb-2 border-b border-neutral-200">
                    {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                  </h3>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      placeholder="e.g. Heavyweight Minimalist Tee"
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">Selling Price (Rs.) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">Original Price (Rs.)</label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">Category</label>
                      <select
                        value={editingProduct.category || 'mens_tshirts'}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full p-2 border border-neutral-300 bg-white outline-none"
                      >
                        <option value="mens_tshirts">Men's T-Shirts</option>
                        <option value="womens_tshirts">Women's T-Shirts</option>
                        <option value="mens_lowers">Men's Lowers</option>
                        <option value="womens_lowers">Women's Lowers</option>
                        <option value="mens_casual">Casual Wear</option>
                        <option value="jewellery">Jewellery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">Available Stock Units</label>
                      <input
                        type="number"
                        value={editingProduct.stock || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Primary Image URL *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.image || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... or /assets/..."
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Product Description</label>
                    <textarea
                      rows={2}
                      value={editingProduct.description || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none resize-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-black text-white font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                    >
                      Save Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-4 py-2.5 bg-neutral-200 text-neutral-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: COUPONS ===================== */}
        {activeTab === 'coupons' && (
          <div className="bg-white border border-neutral-200 shadow-2xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-black">
                Promo Discount Coupons ({coupons.length})
              </h3>
              <button
                onClick={() => {
                  setEditingCoupon({
                    code: 'DISCOUNT',
                    discountType: 'fixed',
                    discountValue: 200,
                    minPurchaseAmount: 1999,
                    isActive: true,
                    description: 'Flat Rs. 200 off'
                  });
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-90 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-300 p-6 space-y-2">
                <Tag className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs font-bold text-neutral-800">No active coupons configured</p>
                <p className="text-[11px] text-neutral-400">Click &quot;Create Coupon&quot; to provide promotional discounts for your shoppers.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 text-xs">
                {coupons.map(cpn => (
                  <div key={cpn.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-black text-sm bg-neutral-100 px-2 py-0.5 mr-2">
                        {cpn.code}
                      </span>
                      <span className="text-neutral-600">{cpn.description}</span>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Min Purchase: Rs. {cpn.minPurchaseAmount.toLocaleString()} • Discount:{' '}
                        {cpn.discountType === 'percentage' ? `${cpn.discountValue}%` : `Rs. ${cpn.discountValue}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                          cpn.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {cpn.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteCoupon(cpn.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coupon Modal */}
            {isCouponModalOpen && editingCoupon && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveCoupon}
                  className="bg-white max-w-sm w-full p-6 shadow-xl space-y-3 text-xs"
                >
                  <h3 className="font-bold text-sm uppercase text-black pb-2 border-b border-neutral-200">
                    Add / Edit Coupon
                  </h3>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      value={editingCoupon.code || ''}
                      onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full p-2 border border-neutral-300 font-mono uppercase focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Discount Type</label>
                    <select
                      value={editingCoupon.discountType || 'fixed'}
                      onChange={e => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                      className="w-full p-2 border border-neutral-300 bg-white outline-none"
                    >
                      <option value="fixed">Flat Discount (Rs.)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Discount Amount *</label>
                    <input
                      type="number"
                      required
                      value={editingCoupon.discountValue || 0}
                      onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Min Order Amount (Rs.)</label>
                    <input
                      type="number"
                      value={editingCoupon.minPurchaseAmount || 0}
                      onChange={e => setEditingCoupon({ ...editingCoupon, minPurchaseAmount: Number(e.target.value) })}
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Description</label>
                    <input
                      type="text"
                      value={editingCoupon.description || ''}
                      onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                      className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-black text-white font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                    >
                      Save Coupon
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(false)}
                      className="px-4 py-2.5 bg-neutral-200 text-neutral-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: STORE SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-neutral-200 shadow-2xs p-5 space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
              Store & Payment Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={e => setSettings({ ...settings, brandName: e.target.value })}
                    className="w-full p-2 border border-neutral-300 focus:border-black outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">UPI ID for Direct QR</label>
                  <input
                    type="text"
                    value={settings.upiId}
                    onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                    className="w-full p-2 border border-neutral-300 font-mono focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Free Delivery Order Threshold (Rs.)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Standard Delivery Fee (Rs.)</label>
                  <input
                    type="number"
                    value={settings.standardShippingFee}
                    onChange={e => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                  className="w-full p-2 border border-neutral-300 focus:border-black outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 cursor-pointer"
                >
                  Save Store Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([storeService.exportData()], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `leovra_backup_${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-4 py-2.5 bg-neutral-200 text-neutral-800 font-semibold text-xs hover:bg-neutral-300 cursor-pointer"
                >
                  Export Data Backup
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
