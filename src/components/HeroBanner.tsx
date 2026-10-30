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
    collectionTitle: 'Everyday Comfort',
    tagline: 'RELAXED FIT PANTS',
    subtitle: 'Soft fabric. Clean look. All day comfort. Engineered for effortless streetwear style.',
    imageUrl: '/assets/hero_look_beige_comfort.jpg',
    altText: 'Leovra Everyday Comfort Relaxed Fit Pants'
  },
  {
    id: 2,
    collectionTitle: 'Bold Colours. Bigger Moves.',
    tagline: 'WIDE LEG TRACK PANTS',
    subtitle: 'Lightweight fabric. Breathable comfort. Relaxed fit designed for everyday movement.',
    imageUrl: '/assets/hero_look_red_moves.jpg',
    altText: 'Leovra Bold Colours Bigger Moves Wide Leg Track Pants'
  }
];

const ROTATION_INTERVAL_MS = 3500;

export const HeroBanner: React.FC<HeroBannerProps> = ({
  buttonText = 'Shop all',
  onCtaClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Preload hero images
  useEffect(() => {
    HERO_LOOKS.forEach(look => {
      const img = new Image();
      img.src = look.imageUrl;
    });
  }, []);

  // Auto rotation with pause on hover
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + HERO_LOOKS.length) % HERO_LOOKS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
  };

  const currentLook = HERO_LOOKS[currentIndex];

  return (
    <section
      aria-label="Leovra Clothes Cinematic Fashion Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[60vh] sm:h-[66vh] md:h-[72vh] min-h-[440px] max-h-[720px] bg-[#1a383b] flex items-center justify-center overflow-hidden select-none"
    >
      {/* Background Slides */}
      {HERO_LOOKS.map((look, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={look.id}
            aria-hidden={!isCurrent}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={look.imageUrl}
              alt={look.altText}
              className={`w-full h-full object-cover object-[center_32%] filter brightness-[0.85] ${
                prefersReducedMotion
                  ? ''
                  : `transition-transform duration-[4000ms] ease-out ${isCurrent ? 'scale-105' : 'scale-100'}`
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-black/35" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-radial-[circle_at_center] from-transparent via-transparent to-black/30" />

      {/* Left/Right Arrows for Navigation */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-6 z-30 p-2 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-md opacity-85 hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-3 sm:right-6 z-30 p-2 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-md opacity-85 hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Hero Typography & CTA */}
      <div className="relative z-30 text-center px-4 max-w-xl mx-auto flex flex-col items-center">
        <div key={currentLook.id} className="flex flex-col items-center">
          <span className="animate-hero-title inline-block uppercase text-[11px] sm:text-xs tracking-[0.25em] text-white/90 font-semibold mb-2 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
            {currentLook.tagline}
          </span>
          <h1 className="animate-hero-title text-white text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-lg">
            {currentLook.collectionTitle}
          </h1>
          <p className="animate-hero-sub text-white/95 text-sm sm:text-base md:text-lg max-w-md mb-6 font-medium drop-shadow-md leading-relaxed">
            {currentLook.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className="animate-hero-cta hero-btn text-white text-sm sm:text-base font-semibold px-9 py-3 rounded-full inline-flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-4 z-30 flex items-center justify-center space-x-2">
        {HERO_LOOKS.map((look, idx) => (
          <button
            key={look.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to look ${idx + 1}`}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
