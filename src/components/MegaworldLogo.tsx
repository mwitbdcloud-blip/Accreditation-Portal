import React from 'react';

interface MegaworldLogoProps {
  className?: string;
  variant?: 'full' | 'emblem-only';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Megaworld International Logo
 * Exactly based on the attached image (public/assets/aistudio/image_944d0c43.png).
 * Unaltered, original colors and resolution.
 */
export const MegaworldLogo: React.FC<MegaworldLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  };

  const currentHeight = sizeHeights[size] || 'h-11 sm:h-12';

  return (
    <img
      src="/assets/aistudio/image_944d0c43.png"
      alt="Megaworld International"
      className={`${currentHeight} w-auto object-contain ${className}`}
    />
  );
};
