import React, { useState, useEffect, useRef } from 'react';

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
    collectionTitle: 'Classic Black',
    subtitle: '240 GSM organic combed black tee paired with dark utility cargo lowers.',
    imageUrl: '/assets/hero_teal_black_tee_1792954954454-G9frm-7N.jpg',
    altText: 'Leovra Clothes fashion model in black graphic t-shirt with dark cargo lowers'
  },
  {
    id: 2,
    collectionTitle: 'Oversized Streetwear',
    subtitle: 'Drop-shoulder relaxed white silhouette with tailored charcoal casual lowers.',
    imageUrl: '/assets/hero_look_2_white_1792955003839-DuF9mD7F.jpg',
    altText: 'Leovra Clothes fashion model in oversized white t-shirt with contrasting casual lowers'
  },
  {
    id: 3,
    collectionTitle: 'Everyday Essentials',
    subtitle: 'Pigment-dyed crimson statement tee styled with tapered black streetwear lowers.',
    imageUrl: '/assets/hero_look_3_red_1792955018082-DeIGYVMO.jpg',
    altText: 'Leovra Clothes fashion model in red streetwear t-shirt with black lowers'
  },
  {
    id: 4,
    collectionTitle: 'Fresh Neutrals',
    subtitle: 'Effortless earth-tone sand oversized tee paired with relaxed lounge lowers.',
    imageUrl: '/assets/hero_look_4_neutral_1792955032271-B-A41n1s.jpg',
    altText: 'Leovra Clothes fashion model in neutral sand t-shirt with grey casual lowers'
  },
  {
    id: 5,
    collectionTitle: 'Urban Cargo',
    subtitle: 'Signature typography print on heavy cotton tee with relaxed everyday lowers.',
    imageUrl: '/assets/hero_look_5_single_1792955088357-CxK3QTHd.jpg',
    altText: 'Leovra Clothes fashion model in premium graphic t-shirt with relaxed-fit lowers'
  }
];

const ROTATION_INTERVAL_MS = 3500;

export const HeroBanner: React.FC<HeroBannerProps> = ({
  buttonText = 'Shop all',
  onCtaClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Preload images into browser cache
  useEffect(() => {
    HERO_LOOKS.forEach(look => {
      const img = new Image();
      img.src = look.imageUrl;
    });
  }, []);

  // Auto rotation
  useEffect(() => {
    if (!prefersReducedMotion) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % HERO_LOOKS.length);
      }, ROTATION_INTERVAL_MS);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [prefersReducedMotion]);

  const currentLook = HERO_LOOKS[currentIndex];

  return (
    <section
      aria-label="Leovra Clothes Cinematic Fashion Showcase"
      className="relative w-full h-[58vh] sm:h-[64vh] md:h-[68vh] min-h-[420px] max-h-[640px] bg-[#1a383b] flex items-center justify-center overflow-hidden select-none"
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
              className={`w-full h-full object-cover object-[center_28%] filter brightness-[0.84] ${
                prefersReducedMotion
                  ? ''
                  : `transition-transform duration-[3800ms] ease-out ${isCurrent ? 'scale-105' : 'scale-100'}`
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-radial-[circle_at_center] from-transparent via-transparent to-black/30" />

      {/* Hero Typography & CTA */}
      <div className="relative z-30 text-center px-4 max-w-xl mx-auto flex flex-col items-center">
        <div key={currentLook.id} className="animate-fade-in flex flex-col items-center">
          <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-md">
            {currentLook.collectionTitle}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-md mb-6 font-normal drop-shadow-sm leading-relaxed">
            {currentLook.subtitle}
          </p>
        </div>

        <button
          onClick={onCtaClick}
          className="hero-btn text-white text-sm sm:text-base font-medium px-9 py-3 rounded-full inline-flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};
