import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  onClick,
  inverted = false
}) => {
  const sizeClasses: Record<string, string> = {
    xs: 'h-6',
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  const textClasses: Record<string, string> = {
    xs: 'text-[9px] tracking-widest',
    sm: 'text-[10px] tracking-[0.2em]',
    md: 'text-xs sm:text-sm tracking-[0.22em]',
    lg: 'text-base sm:text-lg tracking-[0.25em]',
    xl: 'text-xl sm:text-2xl tracking-[0.3em]'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/assets/aistudio/IMG-20261025-WA0014_40903815.jpg"
          alt="LEOVRA CLOTHES Logo"
          className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain ${
            inverted ? 'filter invert brightness-125' : 'mix-blend-multiply'
          }`}
          loading="eager"
        />
      </div>
      {showText && (
        <span
          className={`font-black uppercase text-[#121212] font-['Montserrat'] mt-1 leading-none ${
            textClasses[size] || textClasses.md
          }`}
        >
          LEOVRA CLOTHES
        </span>
      )}
    </div>
  );
};
