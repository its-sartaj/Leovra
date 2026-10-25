export const PRODUCT_FALLBACK_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23f3f4f6"/><g fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(152, 140) scale(4)"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></g><text x="50%" y="72%" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" font-weight="600" fill="%236b7280" text-anchor="middle">Product Photo</text></svg>';

export type ProductCategory = 'earrings' | 'tshirts' | 'lowers';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  images?: string[];
  stock: number;
  isOutOfStock: boolean;
  sizes: string[];
  colors?: string[];
  tag?: 'Bestseller' | 'Trending' | 'New' | 'Limited Stock' | 'Festive';
  rating: number;
  reviewCount: number;
  createdAt: string;
  deletedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
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

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity?: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  cancellationReason?: string;
  paymentMethod: 'Cash on Delivery' | 'UPI / Direct Call' | 'UPI / Online Payment';
  transactionId?: string;
  awbCode?: string;
  courierName?: string;
  createdAt: string;
}

export interface FilterOptions {
  category: 'all' | ProductCategory;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'stock';
  inStockOnly: boolean;
}
