export const PRODUCT_FALLBACK_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23f3f4f6"/><g fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(152, 140) scale(4)"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></g><text x="50%" y="72%" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" font-weight="600" fill="%236b7280" text-anchor="middle">Product Photo</text></svg>';

export type ProductCategory = 'earrings' | 'tshirts' | 'lowers' | 'mens_tshirts' | 'womens_tshirts' | 'mens_lowers' | 'womens_lowers' | 'mens_casual' | 'womens_casual' | 'jewellery' | 'all' | string;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  name?: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  subcategory?: string;
  gender?: 'gents' | 'ladies' | 'unisex' | string;
  type?: 'tshirts' | 'lowers' | 'casual' | string;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive: boolean;
  isOutOfStock?: boolean;
  stock: number;
  image: string;
  images?: string[];
  additionalImages?: string[];
  sizes: string[];
  colors: ProductColor[];
  description: string;
  details?: string[];
  tag?: 'Bestseller' | 'Trending' | 'New' | 'Limited Stock' | 'Festive' | string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  deletedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  selectedSize?: string;
  color: string;
  selectedColor?: string;
  quantity: number;
  sku: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  description: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode?: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: string;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  orderDate?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customer?: OrderCustomer;
  items: CartItem[];
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  deliveryCharge?: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery' | 'UPI / Direct Call' | 'UPI / Online Payment' | 'upi' | 'cod' | string;
  paymentStatus?: 'pending_verification' | 'collected' | 'verified' | string;
  transactionId?: string;
  upiUtrNumber?: string;
  status: 'order_placed' | 'payment_pending' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled' | 'return_requested' | 'return_approved' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled' | string;
  statusHistory?: OrderStatusHistoryItem[];
  cancellationReason?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  awbCode?: string;
  trackingId?: string;
  courierName?: string;
  courierTrackingUrl?: string;
  estimatedDeliveryDate?: string;
  createdAt?: string;
}

export interface StoreSettings {
  brandName: string;
  upiId: string;
  announcementText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImageUrl: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  defaultCourier: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  sevenDayReturnPolicyText: string;
  shippingPolicyText: string;
  privacyPolicyText: string;
  termsText: string;
}

export interface FilterOptions {
  category: 'all' | ProductCategory;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'stock' | string;
  inStockOnly: boolean;
}
