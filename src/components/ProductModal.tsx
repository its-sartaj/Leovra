import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  ChevronLeft,
  ChevronRight
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
  const [selectedSize, setSelectedSize] = useState<string>(selectedProduct?.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(selectedProduct?.colors?.[0] || undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeEstimation | null>(null);

  // Multi-image list for carousel
  const productImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      return selectedProduct.images;
    }
    return [selectedProduct.image];
  }, [selectedProduct]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Synchronize state whenever a new product is selected
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes?.[0] || 'Standard');
      setSelectedColor(selectedProduct.colors?.[0] || undefined);
      setQuantity(1);
      setIsAdded(false);
      setPincodeInput('');
      setPincodeResult(null);
      setActiveImageIndex(0);
      setIsHoveringImage(false);
    }
  }, [selectedProduct]);

  // Auto-slide effect: automatically advances every 3.2 seconds when multiple photos exist and user isn't hovering
  useEffect(() => {
    if (productImages.length <= 1 || isHoveringImage) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [productImages.length, isHoveringImage]);

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
        className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] md:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
        id="product-detail-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute right-3 top-3 z-30 w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-white/95 text-neutral-700 hover:text-neutral-950 flex items-center justify-center shadow-md hover:bg-white transition-all cursor-pointer border border-neutral-200/80 active:scale-95"
          aria-label="Close modal"
          id="close-product-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image Slider with Auto-Slide */}
        <div 
          className="w-full md:w-1/2 relative bg-neutral-100 flex flex-col items-center justify-center overflow-hidden shrink-0 h-64 sm:h-72 md:h-auto md:min-h-[480px] select-none group"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
          onTouchStart={() => setIsHoveringImage(true)}
          onTouchEnd={() => setIsHoveringImage(false)}
        >
          <img
            key={activeImageIndex}
            src={productImages[activeImageIndex] || selectedProduct.image}
            alt={`${selectedProduct.name} - Photo ${activeImageIndex + 1}`}
            width={600}
            height={600}
            referrerPolicy="no-referrer"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `${import.meta.env.BASE_URL}hero-earring.webp`;
            }}
            className={`w-full h-full object-cover object-center transition-all duration-300 ease-out ${
              isOutOfStock ? 'grayscale-40' : ''
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
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

          {/* Multi-Photo Counter & Auto-Slide Indicator Badge */}
          {productImages.length > 1 && (
            <div className="absolute top-3 right-16 md:right-4 z-20 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
              <span>{activeImageIndex + 1}/{productImages.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] text-amber-300 font-medium">Auto</span>
            </div>
          )}

          {/* Manual Controls (Previous & Next Arrows) */}
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous photo"
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-800" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % productImages.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next photo"
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5 text-neutral-800" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'w-5 h-2 bg-amber-400' 
                        : 'w-2 h-2 bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Stock Tag on Image */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Out of Stock</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>In Stock: {selectedProduct.stock} Available</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 md:p-6 overflow-y-auto flex flex-col justify-between max-h-[calc(92vh-260px)] md:max-h-[88vh] bg-white">
          <div className="space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {selectedProduct.category === 'earrings' && 'Artisanal Jewellery / शाही ज्वेलरी'}
                {selectedProduct.category === 'tshirts' && 'Streetwear T-Shirt / टी-शर्ट'}
                {selectedProduct.category === 'lowers' && 'Trackpants & Lowers / लोअर'}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating}</span>
                {selectedProduct.reviewCount > 0 ? (
                  <span className="text-neutral-400">({selectedProduct.reviewCount} reviews)</span>
                ) : (
                  <span className="text-neutral-400 font-normal">(Inspected Quality)</span>
                )}
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
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Description & Material
              </h3>
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
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
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
                    aria-label="Decrease quantity"
                    className="w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center text-neutral-700 hover:bg-neutral-200 font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-bold text-xs text-neutral-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    aria-label="Increase quantity"
                    className="w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center text-neutral-700 hover:bg-neutral-200 font-bold text-base cursor-pointer"
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
                  className="px-3.5 py-1.5 min-h-[44px] text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white cursor-pointer transition-colors shadow-2xs inline-flex items-center justify-center"
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

            {/* Authentic Quality & Delivery Guarantee */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/90 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900 text-xs">Leovra Quality Assurance</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                    ✓ Hand-Inspected
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                  <span>100% Genuine</span>
                </div>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Direct dispatch from our New Delhi hub. Express courier tracking and Cash on Delivery available across all Indian pincodes.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 mt-2 border-t border-neutral-100 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`min-h-[48px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                className="min-h-[48px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
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
