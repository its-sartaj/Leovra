import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string;
  onCtaClick: () => void;
}

const HERO_LOOKS = [
  {
    id: 1,
    collectionTitle: 'Step Out',
    subtitle: 'Not your basic track pants. Made to stand out.',
    imageUrl: './assets/hero_look_red_stepout.webp',
    bgColor: '#e5ddd3',
    bgGradient: 'linear-gradient(to right, #e7ded4 0%, #e5ddd3 50%, #e4dbd1 100%)',
    altText: 'Leovra Clothes Step Out Red Track Pants 3D Polaroid'
  },
  {
    id: 2,
    collectionTitle: 'Bold Colours. Bigger Moves.',
    subtitle: 'Lightweight fabric, breathable comfort, and relaxed everyday fit.',
    imageUrl: './assets/hero_look_beige_moves.webp',
    bgColor: '#e4ddd5',
    bgGradient: 'linear-gradient(to right, #e8e3dc 0%, #e4ddd5 50%, #e4ddd5 100%)',
    altText: 'Leovra Clothes Bold Colours Bigger Moves Relaxed Fit Pants 3D Polaroid'
  }
];

// Auto-slide interval: 4 seconds for relaxed, buttery pacing
const ROTATION_INTERVAL_MS = 4000;

export const HeroBanner: React.FC<HeroBannerProps> = React.memo(({
  buttonText = 'Shop all',
  onCtaClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Preload images into browser cache
  useEffect(() => {
    HERO_LOOKS.forEach(look => {
      const img = new Image();
      img.src = look.imageUrl;
    });
  }, []);

  // Continuous auto-slide timer with smooth pause-on-hover / pause-on-touch
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + HERO_LOOKS.length) % HERO_LOOKS.length);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if delta X > 45px and dominant over vertical scroll
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentLook = HERO_LOOKS[currentIndex];

  return (
    <section
      aria-label="Leovra Clothes Fashion Showcase"
      onClick={onCtaClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[64vh] sm:h-[74vh] md:h-[82vh] min-h-[480px] max-h-[820px] flex items-center justify-center overflow-hidden select-none cursor-pointer group touch-pan"
    >
      {/* Horizontal Sliding Carousel: Butter-smooth 120fps translate3d */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translate3d(-${currentIndex * 100}%, 0, 0)` }}
      >
        {HERO_LOOKS.map((look, idx) => (
          <div
            key={look.id}
            style={{
              backgroundColor: look.bgColor,
              backgroundImage: look.bgGradient
            }}
            className="w-full h-full shrink-0 flex items-center justify-center p-2 sm:p-4 relative"
          >
            {/* 100% Full-Size Uncropped Photo */}
            <div className="relative h-full w-auto max-h-full max-w-full flex items-center justify-center">
              <img
                src={look.imageUrl}
                alt={look.altText}
                width={682}
                height={1024}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding={idx === 0 ? 'sync' : 'async'}
                className="h-full w-auto max-h-full max-w-full object-contain mx-auto select-none pointer-events-none"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sleek Laptop / Desktop Navigation Arrows (Smoothly fade in on hover) */}
      <button
        onClick={handlePrev}
        aria-label="Previous look"
        className="hidden md:flex absolute left-4 z-30 w-10 h-10 items-center justify-center rounded-full bg-white text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next look"
        className="hidden md:flex absolute right-4 z-30 w-10 h-10 items-center justify-center rounded-full bg-white text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Floating Pill CTA at the bottom - never obstructs artwork */}
      <div className="absolute bottom-5 sm:bottom-7 z-30 pointer-events-auto flex flex-col items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCtaClick();
          }}
          className="bg-[#121212] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide uppercase px-8 py-2.5 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
        >
          {buttonText}
        </button>

        {/* Carousel indicators showing auto-slide progress */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {HERO_LOOKS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-[#121212]' : 'w-1.5 bg-[#121212]/30 hover:bg-[#121212]/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
