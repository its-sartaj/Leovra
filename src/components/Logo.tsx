import React from 'react';
import { LeovraLogoIcon } from './LeovraLogoIcon';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'auto',
}) => {
  // Proportional emblem height that keeps the golden crest and wings sharp and balanced
  const emblemHeight = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9 md:h-10',
    lg: 'h-11 sm:h-13',
    xl: 'h-14 sm:h-16',
  }[size];

  const titleSize = {
    sm: 'text-xs sm:text-sm font-bold tracking-tight',
    md: 'text-sm sm:text-base md:text-lg font-extrabold tracking-tight',
    lg: 'text-lg sm:text-2xl font-black tracking-tight',
    xl: 'text-2xl sm:text-3xl font-black tracking-tight',
  }[size];

  const subtitleSize = {
    sm: 'text-[7.5px] sm:text-[8.5px]',
    md: 'text-[8px] sm:text-[9.5px]',
    lg: 'text-[10px] sm:text-xs',
    xl: 'text-xs sm:text-sm',
  }[size];

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`} id="brand-logo-container">
      {/* Official Royal Crest Emblem (Golden L with wings, ring and stars on luxury dark midnight background) */}
      <div className="shrink-0 flex items-center justify-center">
        <LeovraLogoIcon 
          className={`${emblemHeight} w-auto rounded-lg sm:rounded-xl shadow-md border border-amber-400/40 transition-transform duration-200 hover:scale-105`} 
          includeBackground={true} 
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight min-w-0 justify-center">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
          <span className={`${titleSize} font-serif uppercase tracking-wider font-extrabold whitespace-nowrap ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            Leovra
          </span>
          <span className={`${titleSize} bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-sans uppercase font-bold tracking-normal whitespace-nowrap`}>
            Enterprises
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 font-medium truncate">
            <span className={`${subtitleSize} uppercase tracking-wider sm:tracking-[0.16em] font-semibold whitespace-nowrap truncate ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              <span className="hidden sm:inline">Earrings • T-Shirts • Lowers</span>
              <span className="sm:hidden">Fashion & Lifestyle</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
