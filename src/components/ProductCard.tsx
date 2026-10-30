import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails
}) => {
  const isSoldOut = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="product-card group cursor-pointer flex flex-col select-none"
    >
      {/* Product Image Box */}
      <div className="product-img-wrapper w-full overflow-hidden relative">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center img-zoom"
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isNew && (
            <span className="bg-[#121212] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5">
              New
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-[#121212] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5">
              Best Seller
            </span>
          )}
          {isSoldOut && (
            <span className="bg-red-700 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5">
              Sold Out
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5">
              Low Stock: {product.stock} left
            </span>
          )}
        </div>

        {/* Color Palette Indicator on Hover */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-xs p-1 rounded-sm">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-gray-300"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] font-semibold text-gray-700 pl-0.5">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Details Header */}
      <div className="pt-2.5 flex flex-col">
        <h3 className="text-[13px] sm:text-[14px] text-[#121212] font-normal leading-snug line-clamp-1 group-hover:underline">
          {product.title}
        </h3>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-[13px] sm:text-[14px] font-semibold text-[#121212]">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] sm:text-[12px] text-gray-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
