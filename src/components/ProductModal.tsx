import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Truck, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: string, quantity: number) => void;
  onOpenPolicy: (title: string, content: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenPolicy
}) => {
  if (!isOpen || !product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedSize(product.sizes[0] || 'M');
      setSelectedColorIndex(0);
      setQuantity(1);
    }
  }, [product]);

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const galleryImages = [product.image, ...(product.additionalImages || [])];
  const activeColor = product.colors[selectedColorIndex] || { name: 'Standard', hex: '#000000' };
  const isSoldOut = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white max-w-4xl w-full my-auto rounded-none overflow-hidden relative shadow-2xl flex flex-col md:flex-row max-h-[92vh] md:max-h-[88vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-30 bg-white/95 rounded-full w-8 h-8 flex items-center justify-center text-black text-sm hover:bg-black hover:text-white transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Image Preview Gallery */}
        <div className="md:w-1/2 bg-[#f3f3f3] flex flex-col justify-between p-3 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
          <div className="w-full flex-1 flex items-center justify-center overflow-hidden h-48 sm:h-64 md:h-full min-h-[200px] sm:min-h-[260px] md:min-h-[340px] max-h-[260px] sm:max-h-[320px] md:max-h-[460px]">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-contain transition-all duration-300"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex space-x-2 mt-3 overflow-x-auto no-scrollbar justify-center">
              {galleryImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 shrink-0 border-2 overflow-hidden bg-white transition-colors cursor-pointer ${
                    activeImage === imgUrl ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information, Options, & Checkout Actions */}
        <div className="md:w-1/2 p-4 sm:p-7 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                {product.category.replace(/_/g, ' ')}
              </p>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#121212] tracking-tight">
                {product.title}
              </h2>
              <div className="mt-2 flex items-baseline space-x-3">
                <span className="text-lg sm:text-xl font-bold text-[#121212]">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-800">Select Size:</span>
                  <button
                    onClick={() => onOpenPolicy('Size Guide & Tailoring', 'All LEOVRA CLOTHES apparel is cut true to size with pre-shrunk combed cotton. If you prefer a loose relaxed streetwear drape, we recommend ordering one size above your usual fit.')}
                    className="text-[11px] text-gray-500 underline hover:text-black cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[42px] px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-800 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-800 mb-1.5">
                  Color: <span className="text-gray-500 font-normal">{activeColor.name}</span>
                </div>
                <div className="flex space-x-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIndex(idx)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full p-0.5 border transition-all cursor-pointer ${
                        selectedColorIndex === idx ? 'border-black ring-1 ring-black' : 'border-gray-300'
                      }`}
                    >
                      <span className="block w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div>
              <div className="text-xs font-semibold text-gray-800 mb-1.5">Quantity:</div>
              <div className="flex items-center border border-gray-300 w-fit">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 font-semibold text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock || 10, prev + 1))}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Product Narrative & Highlights */}
            {product.description && (
              <div className="pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                <p>{product.description}</p>
                {product.details && product.details.length > 0 && (
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-500">
                    {product.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Value Guarantees */}
            <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong>7-Day Return Guarantee:</strong> Hassle-free exchanges measured from delivery date.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-black shrink-0" />
                <span>Fast express delivery with real-time tracking code.</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <span>100% genuine guaranteed quality & reinforced stitching.</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => {
                if (!isSoldOut) onAddToCart(product, selectedSize, activeColor.name, quantity);
              }}
              disabled={isSoldOut}
              className={`w-full py-3 text-xs uppercase font-bold tracking-wider transition-all border border-[#121212] cursor-pointer ${
                isSoldOut
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-[#121212] hover:bg-gray-50 active:scale-[0.99]'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Add to cart'}
            </button>
            <button
              onClick={() => {
                if (!isSoldOut) onBuyNow(product, selectedSize, activeColor.name, quantity);
              }}
              disabled={isSoldOut}
              className={`w-full py-3 text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                isSoldOut
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#121212] text-white hover:bg-black active:scale-[0.99]'
              }`}
            >
              {isSoldOut ? 'Item Unavailable' : 'Buy it now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
