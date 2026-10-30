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
    bgColor: '#e6ded4',
    altText: 'Leovra Clothes fashion model in Everyday Comfort relaxed fit pants'
  },
  {
    id: 2,
    collectionTitle: 'Bold Colours. Bigger Moves.',
    subtitle: 'Wide leg track pants engineered for comfort, style, and everyday movement.',
    imageUrl: '/assets/hero_look_red_moves.jpg',
    bgColor: '#e4dfd8',
    altText: 'Leovra Clothes fashion model in Bold Colours Bigger Moves wide leg track pants'
  }
];

// Auto slide duration: 3.2 seconds
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

  // Continuous auto-slide timer (every 3.2 seconds)
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
      style={{ backgroundColor: currentLook.bgColor }}
      className="relative w-full h-[58vh] sm:h-[64vh] md:h-[68vh] min-h-[420px] max-h-[640px] flex items-center justify-center overflow-hidden select-none transition-colors duration-1000"
    >
      {/* Background Slides with Seamless Cream Theme */}
      {HERO_LOOKS.map((look, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={look.id}
            aria-hidden={!isCurrent}
            style={{
              opacity: isCurrent ? 1 : 0,
              zIndex: isCurrent ? 10 : 1,
              backgroundColor: look.bgColor,
              transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Ambient Blurred Fill in Exact Photo Cream Tones */}
            <img
              src={look.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-125 opacity-60"
            />
            {/* Crisp Main Photo (Uncropped, Seamlessly Blended) */}
            <img
              src={look.imageUrl}
              alt={look.altText}
              style={{
                transform: isCurrent ? 'scale(1.04)' : 'scale(1.00)',
                transition: 'transform 3800ms ease-out'
              }}
              className="relative z-10 w-full h-full object-contain object-center"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Soft Elegant Vignette for Seamless Depth & Contrast */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-black/10" />

      {/* Hero Typography & CTA in Elegant Dark Charcoal/Black on Cream */}
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
