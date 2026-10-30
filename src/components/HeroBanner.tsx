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
    collectionTitle: 'Everyday Comfort',
    subtitle: 'Soft fabric. Clean look. All day comfort. Relaxed fit pants.',
    imageUrl: '/assets/hero_look_beige_comfort.jpg',
    bgColor: '#ded1bf',
    bgGradient: 'linear-gradient(to right, #ded1bf 0%, #ded1bf 50%, #d7c8b3 100%)',
    altText: 'Leovra Clothes fashion model in Everyday Comfort relaxed fit pants'
  },
  {
    id: 2,
    collectionTitle: 'Bold Colours. Bigger Moves.',
    subtitle: 'Wide leg track pants engineered for comfort, style, and everyday movement.',
    imageUrl: '/assets/hero_look_red_moves.jpg',
    bgColor: '#ded8d1',
    bgGradient: 'linear-gradient(to right, #eae4dd 0%, #ded8d1 50%, #bab1a7 100%)',
    altText: 'Leovra Clothes fashion model in Bold Colours Bigger Moves wide leg track pants'
  }
];

// Continuous auto-slide interval: 3.2 seconds
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
      aria-label="Leovra Clothes Cinematic Fashion Showcase"
      style={{
        backgroundColor: currentLook.bgColor,
        backgroundImage: currentLook.bgGradient
      }}
      className="relative w-full h-[64vh] sm:h-[72vh] md:h-[78vh] min-h-[460px] max-h-[700px] flex items-center justify-center overflow-hidden select-none transition-colors duration-1000"
    >
      {/* Background Slides: Full Size Uncropped Photo with 100% Matched Studio Gradient */}
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
            className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
          >
            {/* Full-Size Uncropped Photo with Feathered Edges for Zero-Seam Blending */}
            <img
              src={look.imageUrl}
              alt={look.altText}
              style={{
                transform: isCurrent ? 'scale(1.02)' : 'scale(1.00)',
                transition: 'transform 3800ms ease-out',
                maskImage: 'linear-gradient(to right, transparent 0%, black 2.5%, black 97.5%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2.5%, black 97.5%, transparent 100%)'
              }}
              className="h-full w-auto max-h-full object-contain mx-auto"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Hero Typography & CTA in Deep Charcoal/Black */}
      <div className="relative z-30 text-center px-4 max-w-xl mx-auto flex flex-col items-center">
        <div key={currentLook.id} className="animate-fade-in flex flex-col items-center">
          <h1 className="text-[#121212] text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-sm">
            {currentLook.collectionTitle}
          </h1>
          <p className="text-[#2b2b2b] text-xs sm:text-sm md:text-base max-w-md mb-6 font-medium drop-shadow-xs leading-relaxed">
            {currentLook.subtitle}
          </p>
        </div>

        <button
          onClick={onCtaClick}
          className="bg-[#121212] hover:bg-black text-white text-sm sm:text-base font-semibold px-9 py-3 rounded-full inline-flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};
