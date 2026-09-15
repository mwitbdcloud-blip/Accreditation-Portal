import React from 'react';

interface MegaworldLogoProps {
  className?: string;
  variant?: 'full' | 'emblem-only';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Megaworld International Emblem & Logo
 * Faithfully matches the white monogram inside the square outline:
 * 4 interlaced diagonal chevrons (XXXX) inside a square border,
 * paired with MEGAWORLD INTERNATIONAL typography.
 */
export const MegaworldLogo: React.FC<MegaworldLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'dark',
  size = 'md',
}) => {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#ffffff' : '#0f172a'; // White or deep slate/navy
  const secondaryColor = isDark ? '#e2e8f0' : '#1e3a8a';

  // Sizing definitions
  const emblemSizes = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 72,
  };

  const currentEmblemSize = emblemSizes[size] || 40;

  // The square emblem with 4 geometric intersecting chevrons
  const renderEmblem = () => (
    <svg
      width={currentEmblemSize}
      height={currentEmblemSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Outer Square Border */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        stroke={primaryColor}
        strokeWidth="6"
        fill="none"
      />

      {/* 
        Inner 4 Interlaced 'X' Monograms (MW Geometric Chevron Lattice)
        x ranges from 16 to 84 (width 68).
        4 columns of width 17 each:
        Col 0: 16 to 33
        Col 1: 33 to 50
        Col 2: 50 to 67
        Col 3: 67 to 84
        Top y = 18, Bottom y = 82.
      */}
      <g stroke={primaryColor} strokeWidth="5.5" strokeLinecap="square">
        {/* Diagonals going down-right (\) */}
        <line x1="16" y1="18" x2="33" y2="82" />
        <line x1="33" y1="18" x2="50" y2="82" />
        <line x1="50" y1="18" x2="67" y2="82" />
        <line x1="67" y1="18" x2="84" y2="82" />

        {/* Diagonals going down-left (/) */}
        <line x1="33" y1="18" x2="16" y2="82" />
        <line x1="50" y1="18" x2="33" y2="82" />
        <line x1="67" y1="18" x2="50" y2="82" />
        <line x1="84" y1="18" x2="67" y2="82" />
      </g>
    </svg>
  );

  if (variant === 'emblem-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderEmblem()}</div>;
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {renderEmblem()}
      <div className="mt-3 text-center tracking-[0.22em] uppercase font-sans">
        <div
          style={{ color: primaryColor }}
          className={`font-semibold leading-tight ${
            size === 'sm'
              ? 'text-xs'
              : size === 'lg'
              ? 'text-lg tracking-[0.28em]'
              : size === 'xl'
              ? 'text-2xl tracking-[0.3em]'
              : 'text-sm sm:text-base'
          }`}
        >
          MEGAWORLD
        </div>
        <div
          style={{ color: secondaryColor }}
          className={`font-light leading-none mt-1 ${
            size === 'sm'
              ? 'text-[8px] tracking-[0.25em]'
              : size === 'lg'
              ? 'text-xs tracking-[0.32em]'
              : size === 'xl'
              ? 'text-sm tracking-[0.36em]'
              : 'text-[10px] tracking-[0.28em]'
          }`}
        >
          INTERNATIONAL
        </div>
      </div>
    </div>
  );
};
