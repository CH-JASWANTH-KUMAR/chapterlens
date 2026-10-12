import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * Bespoke ChapterLens Mark:
 * An open literary codex/book harmoniously integrated with an optical inspection lens,
 * symbolizing rigorous linguistic scrutiny and craft clarity.
 */
export function BrandLogo({ className = 'h-9 w-9', size = 36 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" className="fill-[var(--brand-forest)] transition-colors duration-200" />
      
      {/* Left Folio Page */}
      <path
        d="M9 13.5C11.5 12.8 14.5 13.2 17 14.5V25.5C14.5 24.2 11.5 23.8 9 24.5V13.5Z"
        fill="currentColor"
        className="text-[#F5F4EE] opacity-90"
      />
      
      {/* Right Folio Page */}
      <path
        d="M27 13.5C24.5 12.8 21.5 13.2 19 14.5V25.5C21.5 24.2 24.5 23.8 27 24.5V13.5Z"
        fill="currentColor"
        className="text-[#F5F4EE] opacity-75"
      />
      
      {/* Book Spine Center Line */}
      <line
        x1="18"
        y1="14"
        x2="18"
        y2="25.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-[var(--brand-emerald)]"
      />
      
      {/* Optical Inspecting Lens Rim */}
      <circle
        cx="20.5"
        cy="15.5"
        r="4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        className="text-[var(--brand-emerald)]"
      />
      
      {/* Lens Internal Focal Dot */}
      <circle
        cx="20.5"
        cy="15.5"
        r="1.2"
        fill="currentColor"
        className="text-[#FFFFFF]"
      />
      
      {/* Lens Handle Arc */}
      <path
        d="M24 19L27 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-[var(--brand-emerald)]"
      />
    </svg>
  );
}
