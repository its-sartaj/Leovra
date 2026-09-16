import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  AlertCircle, 
  Star, 
  Eye
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    setSelectedProduct, 
    businessPhone 
  } = useStore();

  const selectedSize = product.sizes[0] || 'Free Size';
  const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isOutOfStock = product.isOutOfStock || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 4;
  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `Hello Leovra Enterprises! I want to order "${product.name}" (Size: ${selectedSize}, Price: ₹${product.price}). Is it ready for shipping?`;
    window.open(`https://wa.me/91${businessPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedProduct(product);
    }
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer shadow-2xs hover:shadow-md product-card-optimize transform-gpu focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
        isOutOfStock 
          ? 'border-neutral-200 opacity-85 hover:border-neutral-300' 
          : 'border-neutral-200 hover:border-amber-400/80'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <img
          src={product.image}
          alt={product.name}
          width={400}
          height={500}
          style={{ aspectRatio: '4/5' }}
          referrerPolicy="no-referrer"
          decoding="async"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `${import.meta.env.BASE_URL}hero-earring.webp`;
          }}
          className={`w-full h-full object-cover object-center transition-transform duration-300 transform-gpu group-hover:scale-105 ${
            isOutOfStock ? 'grayscale-40 contrast-95' : ''
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.tag && (
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide bg-neutral-900 text-white shadow-xs">
              {product.tag}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-neutral-950 shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          {isOutOfStock ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Out of Stock</span>
            </span>
          ) : isLowStock ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>{product.stock} Left</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-emerald-100/90 text-emerald-800 border border-emerald-200">
              In Stock
            </span>
          )}
        </div>

        {/* Quick View Button on Desktop Hover */}
        <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-neutral-900 text-xs font-bold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-2 sm:gap-2.5">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-neutral-500 mb-0.5">
            <span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-amber-700 truncate max-w-[65%]">
              {product.category === 'earrings' && 'Earrings'}
              {product.category === 'tshirts' && 'T-Shirt'}
              {product.category === 'lowers' && 'Lower'}
            </span>
            <div className="flex items-center gap-0.5 font-semibold text-neutral-700">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] sm:text-[11px]">{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-sm sm:text-base font-extrabold text-neutral-950">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Available Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-1 text-[10px] text-neutral-400 truncate">
              Sizes: <span className="font-semibold text-neutral-600">{product.sizes.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: perfectly sized for 2-column mobile screens */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-neutral-100 mt-auto">
          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                : isAddedRecently
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs active:scale-95'
            }`}
            id={`add-to-cart-btn-${product.id}`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Added!</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-amber-400" />
                <span>Add</span>
              </>
            )}
          </button>

          {/* Quick WhatsApp Buy Button */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors active:scale-95 shrink-0"
            id={`whatsapp-buy-btn-${product.id}`}
            title={`Order ${product.name} directly on WhatsApp`}
            aria-label={`Order ${product.name} directly on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          </button>
        </div>
      </div>
    </div>
  );
};
