import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
}

interface CategoryFilterBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = React.memo(({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isInteractingRef = useRef<boolean>(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update scroll gradient / indicator boundaries
  const updateScrollBounds = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 6);
    setCanScrollRight(container.scrollLeft < maxScroll - 6);
  }, []);

  // Continuous auto-slide mechanism: smoothly glides category pills forward
  useEffect(() => {
    updateScrollBounds();

    const intervalId = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container || isInteractingRef.current) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 8) return; // Container doesn't overflow (e.g. desktop), no scroll needed

      // Loop back smoothly if reached the end
      if (container.scrollLeft >= maxScroll - 12) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Slide by one or two pills width (~150px)
        const step = Math.min(160, Math.max(120, container.clientWidth * 0.45));
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 2800);

    return () => clearInterval(intervalId);
  }, [updateScrollBounds]);

  // Pause on user interaction and resume after 3.5s of inactivity
  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 3500);
  }, []);

  const handleCategoryClick = (catId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    handleInteractionStart();
    onSelectCategory(catId);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    handleInteractionEnd();
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    handleInteractionStart();
    const container = scrollContainerRef.current;
    if (!container) return;
    const offset = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: offset, behavior: 'smooth' });
    handleInteractionEnd();
  };

  return (
    <div className="relative group w-full py-1">
      {/* Left Navigation Chevron Button (Desktop / Tablet) */}
      {canScrollLeft && (
        <button
          onClick={() => handleManualScroll('left')}
          aria-label="Scroll categories left"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-gray-200 shadow-md items-center justify-center text-gray-800 hover:text-black hover:border-black active:scale-90 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Right Navigation Chevron Button (Desktop / Tablet) */}
      {canScrollRight && (
        <button
          onClick={() => handleManualScroll('right')}
          aria-label="Scroll categories right"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs border border-gray-200 shadow-md items-center justify-center text-gray-800 hover:text-black hover:border-black active:scale-90 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Soft edge gradient indicators */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
      )}

      {/* Scrolling Track */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollBounds}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 px-1 touch-pan"
      >
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              aria-label={`Filter by ${cat.label}`}
              onClick={e => handleCategoryClick(cat.id, e)}
              className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2.5 min-h-[48px] flex items-center justify-center rounded-full border transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'border-black bg-black text-white font-semibold shadow-xs ring-1 ring-black'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black active:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
