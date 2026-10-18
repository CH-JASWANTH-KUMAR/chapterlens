import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * ChapterLens Primary Product Symbol:
 * Renders the official brand logo mark asset with responsive sizing.
 */
export function BrandLogo({ className = '', size = 32 }: BrandLogoProps) {
  return (
    <Image
      src="/brand-assets/chapterlens-logo-mark.png"
      alt="ChapterLens logo mark"
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-contain ${className}`}
    />
  );
}

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

/**
 * Consolidated Brand Wordmark:
 * Pairs the official logo mark with actual HTML text so that the brand
 * title adapts crisply across both light and dark themes.
 */
export function BrandWordmark({
  className = '',
  size = 'md',
  showTagline = false,
}: BrandWordmarkProps) {
  const iconSizes = { sm: 26, md: 32, lg: 38 };
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandLogo size={iconSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-editorial-serif font-bold tracking-tight text-[var(--text-main)] ${textSizes[size]}`}
          >
            ChapterLens
          </span>
          <span className="rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-accent-text)] select-none">
            Editorial Studio
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-[var(--text-faint)] leading-normal mt-0.5">
            Understand your writing. Keep your voice.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Fixed Dark-Green Wordmark Image:
 * Uses the supplied wordmark PNG on fixed light backgrounds or export documents
 * where a fixed raster wordmark is appropriate.
 */
export function BrandWordmarkImage({
  className = '',
  width = 160,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/brand-assets/chapterlens-wordmark.png"
      alt="ChapterLens"
      width={width}
      height={Math.round(width * 0.25)}
      className={`object-contain ${className}`}
    />
  );
}
