import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  PhoneCall, 
  Star, 
  Check, 
  AlertCircle,
  Truck,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { estimateDeliveryByPincode, PincodeEstimation } from '../services/shiprocket';

export const ProductModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    businessPhone,
    setIsReturnPolicyOpen
  } = useStore();

  // IMPORTANT: All hooks must be called before any early return (Rules of Hooks)
  const [selectedSize, setSelectedSize] = useState<string>(selectedProduct?.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    selectedProduct?.colors && selectedProduct.colors.length > 0 ? selectedProduct.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeEstimation | null>(null);

  // Synchronize state whenever a new product is selected
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes[0] : 'Standard');
      setSelectedColor(selectedProduct.colors && selectedProduct.colors.length > 0 ? selectedProduct.colors[0] : undefined);
      setQuantity(1);
      setIsAdded(false);
      setPincodeInput('');
      setPincodeResult(null);
    }
  }, [selectedProduct]);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    const res = estimateDeliveryByPincode(pincodeInput.trim());
    setPincodeResult(res);
  };

  if (!selectedProduct) return null;

  const isOutOfStock = selectedProduct.isOutOfStock || selectedProduct.stock <= 0;
  const discountPercent = selectedProduct.originalPrice > selectedProduct.price 
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setSelectedProduct(null);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setSelectedProduct(null)}
      id="product-detail-modal-overlay"
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col md:flex-row border border-neutral-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="product-detail-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute right-3 top-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-neutral-700 hover:text-neutral-950 flex items-center justify-center shadow-md hover:bg-white transition-all cursor-pointer"
          aria-label="Close modal"
          id="close-product-modal-btn"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-neutral-100 min-h-[200px] max-h-[280px] md:max-h-none md:min-h-[420px] flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            width={600}
            height={600}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `${import.meta.env.BASE_URL}hero-earring.jpg`;
            }}
            className={`w-full h-full object-cover object-center ${
              isOutOfStock ? 'grayscale-40' : ''
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {selectedProduct.tag && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-neutral-900 text-white shadow-xs">
                {selectedProduct.tag}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-neutral-950 shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Stock Tag on Image */}
          <div className="absolute bottom-3 left-3">
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Out of Stock</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>In Stock: {selectedProduct.stock} Available</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {selectedProduct.category === 'earrings' && 'Artisanal Earrings / झुमके'}
                {selectedProduct.category === 'tshirts' && 'Streetwear T-Shirt / टी-शर्ट'}
                {selectedProduct.category === 'lowers' && 'Trackpants & Lowers / लोअर'}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating}</span>
                <span className="text-neutral-400">({selectedProduct.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-snug">
              {selectedProduct.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-neutral-100">
              <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                ₹{selectedProduct.price}
              </span>
              {selectedProduct.originalPrice > selectedProduct.price && (
                <span className="text-sm text-neutral-400 line-through">
                  ₹{selectedProduct.originalPrice}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Inclusive of all taxes
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Description & Material
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Size Selector */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1.5">
                  <span>Select Size: <strong className="text-amber-700">{selectedSize}</strong></span>
                  <span className="text-neutral-400 text-[11px]">Free Exchange Available</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors if available */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div>
                <div className="text-xs font-bold text-neutral-800 mb-1.5">
                  Available Shades:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedColor === c
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-neutral-700">Quantity:</span>
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-bold text-xs text-neutral-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-200 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-neutral-400">
                  (Max {selectedProduct.stock} units)
                </span>
              </div>
            )}

            {/* Shiprocket Delivery Pincode Checker */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Check Delivery & COD:</span>
                </span>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Shiprocket Express
                </span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    id="modal-pincode-input"
                    name="pincode"
                    aria-label="Enter 6-digit delivery pincode"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 110001)"
                    value={pincodeInput}
                    onChange={(e) => {
                      setPincodeInput(e.target.value.replace(/\D/g, ''));
                      if (pincodeResult) setPincodeResult(null);
                    }}
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Check delivery pincode"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white cursor-pointer transition-colors shadow-2xs"
                >
                  Check
                </button>
              </form>

              {pincodeResult && (
                <div className={`p-2.5 rounded-xl text-[11px] ${
                  pincodeResult.isValid 
                    ? 'bg-purple-50 border border-purple-200 text-purple-900' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {pincodeResult.isValid ? (
                    <div className="space-y-0.5">
                      <div className="font-bold text-purple-950 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Estimated Delivery: {pincodeResult.estimatedDays}</span>
                      </div>
                      <div className="text-neutral-600 text-[10px]">
                        Cash on Delivery Available • Delhi Hub Dispatch via Blue Dart / Delhivery
                      </div>
                    </div>
                  ) : (
                    <span>{pincodeResult.message}</span>
                  )}
                </div>
              )}
            </div>

            {/* 3-Day Return Policy Note */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-neutral-700">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>3-Day Return Policy:</strong> Defective / wrong items only
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnPolicyOpen(true)}
                className="text-amber-800 font-bold hover:underline cursor-pointer shrink-0"
              >
                View Policy
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 mt-2 border-t border-neutral-100 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-md'
                }`}
                id="modal-add-to-cart-btn"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Item Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Add to Bag (₹{selectedProduct.price * quantity})</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent(
                  `Hello Leovra Enterprises!\nI want to place an order for:\n*${selectedProduct.name}*\n- Size: ${selectedSize}\n${selectedColor ? `- Color: ${selectedColor}\n` : ''}- Quantity: ${quantity}\n- Price: ₹${selectedProduct.price * quantity}\n\nPlease share delivery details to my address.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
                id="modal-whatsapp-order-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Helpline Call Button */}
            <div className="flex items-center justify-center text-xs pt-1 text-neutral-500">
              <a
                href={`tel:+91${businessPhone}`}
                className="inline-flex items-center gap-1.5 font-semibold text-neutral-800 hover:text-amber-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>Helpline / Direct Order: +91 {businessPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
