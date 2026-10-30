import { Product, Coupon, StoreSettings, Order } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-necklace-gold-99",
    sku: "SKU-NECKLACE-GOLD-99",
    title: "Gold Plated necklace",
    name: "Gold Plated necklace",
    price: 99,
    originalPrice: 299,
    category: "jewellery",
    subcategory: "Necklace",
    gender: "ladies",
    type: "accessories",
    isNew: false,
    isBestseller: true,
    isActive: true,
    stock: 10,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
    ],
    sizes: [
      "Free Size"
    ],
    colors: [
      {
        name: "Gold",
        hex: "#d4af37"
      }
    ],
    description: "Handcrafted luxury gold plated necklace with royal finish. Perfect for festive celebrations, weddings, and party occasions.",
    details: [
      "Handcrafted luxury gold plated finish",
      "Hypoallergenic alloy with royal shine",
      "Perfect for ethnic wear, weddings, and party celebrations"
    ],
    tag: "Bestseller",
    rating: 5,
    reviewCount: 0,
    createdAt: "2025-01-01T10:00:00.000Z"
  }
];

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "c-welcome10",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minPurchaseAmount: 199,
    expiryDate: "2027-12-31",
    usageLimit: 1000,
    timesUsed: 12,
    isActive: true,
    description: "10% off for new customers on orders above Rs. 199"
  },
  {
    id: "c-leovra50",
    code: "LEOVRA50",
    discountType: "fixed",
    discountValue: 50,
    minPurchaseAmount: 299,
    expiryDate: "2027-12-31",
    usageLimit: 500,
    timesUsed: 5,
    isActive: true,
    description: "Flat Rs. 50 off on orders above Rs. 299"
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  brandName: "LEOVRA CLOTHES",
  upiId: "7979968347@slc",
  announcementText: "FREE Nationwide Delivery on all UPI / Online Orders • Cash on Delivery available (Rs. 99)",
  heroTitle: "Everyday Comfort & Bold Moves",
  heroSubtitle: "Engineered relaxed fit pants and wide leg track pants designed for comfort, style, and everyday movement.",
  heroButtonText: "Shop all",
  heroImageUrl: "/assets/hero_look_beige_comfort.jpg",
  freeShippingThreshold: 0,
  standardShippingFee: 99,
  defaultCourier: "Blue Dart Express",
  supportEmail: "support@leovraclothes.com",
  supportPhone: "+91 79799 68347",
  supportHours: "Mon - Sat: 10:00 AM - 8:00 PM",
  sevenDayReturnPolicyText: "We offer a transparent 7-Day Return & Exchange Policy measured from the date of package delivery. Merchandise must be unworn, unwashed, in original brand packaging with all tags attached.",
  shippingPolicyText: "All confirmed orders are packed and dispatched within 24 to 48 business hours. Deliveries typically arrive within 3-5 business days across major metro cities, and 4-7 business days for regional zones.",
  privacyPolicyText: "Your privacy and data security are paramount. We strictly use industry standard 256-bit encryption for order handling and never share customer information.",
  termsText: "By placing an order on LEOVRA CLOTHES, you agree to our catalog terms, return timelines, and verified payment policies. All prices are stated inclusive of applicable taxes."
};

export const DEFAULT_ORDERS: Order[] = [];
