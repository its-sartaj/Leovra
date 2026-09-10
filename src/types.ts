export type ProductCategory = 'earrings' | 'tshirts' | 'lowers';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  stock: number;
  isOutOfStock: boolean;
  sizes: string[];
  colors?: string[];
  tag?: 'Bestseller' | 'Trending' | 'New' | 'Limited Stock' | 'Festive';
  rating: number;
  reviewCount: number;
  createdAt: string;
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
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered';
  paymentMethod: 'Cash on Delivery' | 'UPI / Direct Call';
  createdAt: string;
}

export interface FilterOptions {
  category: 'all' | ProductCategory;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'stock';
  inStockOnly: boolean;
}
