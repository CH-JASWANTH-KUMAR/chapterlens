import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * ChapterLens Editorial Symbol:
 * A clean, distinctive folio and optical lens reading mark.
 * Proportioned for pixel-crisp rendering from 16px to 64px.
 */
export function BrandLogo({ className = '', size = 32 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-hidden="true"
    >
      {/* Editorial Badge Background */}
      <rect
        width="32"
        height="32"
        rx="8"
        fill="var(--brand-forest)"
        className="transition-colors duration-200"
      />

      {/* Manuscript Folio Leaf */}
      <path
        d="M8.5 7.5H19L23.5 12V24.5H8.5V7.5Z"
        stroke="#F4F6F4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Folded Corner */}
      <path
        d="M19 7.5V12H23.5"
        stroke="#F4F6F4"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Prose Cadence Lines */}
      <line
        x1="11.5"
        y1="12"
        x2="16"
        y2="12"
        stroke="#F4F6F4"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="11.5"
        y1="15.5"
        x2="15"
        y2="15.5"
        stroke="#F4F6F4"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="11.5"
        y1="19"
        x2="15"
        y2="19"
        stroke="#F4F6F4"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* The Optical Inspection Lens */}
      <circle
        cx="19.5"
        cy="18.5"
        r="4.5"
        stroke="var(--brand-emerald)"
        strokeWidth="1.8"
        fill="var(--brand-forest)"
      />

      {/* Lens Focal Center */}
      <circle
        cx="19.5"
        cy="18.5"
        r="1.2"
        fill="var(--brand-emerald)"
      />

      {/* Precision Lens Handle */}
      <path
        d="M22.8 21.8L25.5 24.5"
        stroke="var(--brand-emerald)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

/**
 * Consolidated Brand Wordmark:
 * Used identically across Header and Hero to ensure absolute visual consistency.
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
