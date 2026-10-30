import React, { useState, useEffect } from 'react';

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
    imageUrl: './assets/hero_look_red_stepout.jpg?v=20261031_03',
    bgColor: '#e5ddd3',
    bgGradient: 'linear-gradient(to right, #e7ded4 0%, #e5ddd3 50%, #e4dbd1 100%)',
    altText: 'Leovra Clothes Step Out Red Track Pants 3D Polaroid'
  },
  {
    id: 2,
    collectionTitle: 'Bold Colours. Bigger Moves.',
    subtitle: 'Lightweight fabric, breathable comfort, and relaxed everyday fit.',
    imageUrl: './assets/hero_look_beige_moves.jpg?v=20261031_03',
    bgColor: '#e4ddd5',
    bgGradient: 'linear-gradient(to right, #e8e3dc 0%, #e4ddd5 50%, #e4ddd5 100%)',
    altText: 'Leovra Clothes Bold Colours Bigger Moves Relaxed Fit Pants 3D Polaroid'
  }
];

// Auto-slide interval: 3.2 seconds
const ROTATION_INTERVAL_MS = 3200;

export const HeroBanner: React.FC<HeroBannerProps> = ({
  buttonText = 'Shop all',
  onCtaClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload images into browser cache
  useEffect(() => {
    HERO_LOOKS.forEach(look => {
      const img = new Image();
      img.src = look.imageUrl;
    });
  }, []);

  // Continuous auto-slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const currentLook = HERO_LOOKS[currentIndex];

  return (
    <section
      aria-label="Leovra Clothes Fashion Showcase"
      onClick={onCtaClick}
      style={{
        backgroundColor: currentLook.bgColor,
        backgroundImage: currentLook.bgGradient
      }}
      className="relative w-full h-[64vh] sm:h-[74vh] md:h-[82vh] min-h-[480px] max-h-[820px] flex items-center justify-center overflow-hidden select-none cursor-pointer transition-colors duration-1000"
    >
      {/* Background Slides: 100% Full-Size Uncropped Photo with Matched Studio Cream Canvas */}
      {HERO_LOOKS.map((look, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={look.id}
            aria-hidden={!isCurrent}
            style={{
              opacity: isCurrent ? 1 : 0,
              zIndex: isCurrent ? 10 : 1,
              background: look.bgGradient,
              transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center p-2 sm:p-4"
          >
            {/* 100% Full-Size Uncropped Photo with Soft Feathered Edges */}
            <img
              src={look.imageUrl}
              alt={look.altText}
              style={{
                transform: isCurrent ? 'scale(1.018)' : 'scale(1.0)',
                transition: 'transform 3800ms ease-out',
                maskImage: 'linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%)'
              }}
              className="h-full w-auto max-h-full max-w-full object-contain mx-auto drop-shadow-2xl"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Floating Pill CTA at the bottom - never obstructs the artwork or model */}
      <div className="absolute bottom-5 sm:bottom-7 z-30 pointer-events-auto flex flex-col items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCtaClick();
          }}
          className="bg-[#121212]/90 hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide uppercase px-8 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
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
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-[#121212]' : 'w-1.5 bg-[#121212]/30 hover:bg-[#121212]/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
