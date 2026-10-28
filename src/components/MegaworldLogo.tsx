import React from 'react';

interface MegaworldLogoProps {
  className?: string;
  variant?: 'full' | 'emblem-only';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Megaworld International Logo
 * - Light theme (Navigation Header): Original blue logo on transparent/white background.
 * - Dark theme (Log In screen & Digital ID Badge): Official white logo
 *   ("Megaworld International Logo_White_2-02") with transparent background,
 *   preserving the exact original layout and design.
 */
export const MegaworldLogo: React.FC<MegaworldLogoProps> = ({
  className = '',
  theme = 'light',
  size = 'md',
}) => {
  const isDark = theme === 'dark';

  const sizeHeights = {
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-12',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-32',
  };

  const currentHeight = sizeHeights[size] || 'h-11 sm:h-12';
  const logoSrc = isDark
    ? '/assets/Megaworld_International_Logo_White_Transparent.png'
    : '/assets/aistudio/image_944d0c43.png';

  return (
    <img
      src={logoSrc}
      alt="Megaworld International"
      className={`${currentHeight} w-auto object-contain bg-transparent shrink-0 ${className}`}
    />
  );
};
