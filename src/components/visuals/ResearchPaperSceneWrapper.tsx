'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicScene = dynamic(
  () => import('./ResearchPaperScene').then((mod) => mod.ResearchPaperScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[380px] flex items-center justify-center p-6 bg-[var(--canvas-card)] rounded-2xl border border-[var(--border-subtle)] shadow-editorial">
        <div className="relative w-56 h-72 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-strong)] p-4 shadow-editorial-elevated space-y-3 -rotate-2 animate-pulse">
          <div className="h-3 w-3/4 rounded-sm bg-[var(--brand-forest)]" />
          <div className="h-2 w-1/2 rounded-sm bg-[var(--brand-emerald)]" />
          <div className="h-px w-full bg-[var(--border-subtle)] my-2" />
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full rounded-sm bg-[var(--border-strong)]" />
            <div className="h-2 w-5/6 rounded-sm bg-[var(--border-strong)]" />
            <div className="h-4 w-full rounded-sm bg-[var(--brand-accent-bg)] border border-[var(--brand-accent-border)]" />
            <div className="h-2 w-4/5 rounded-sm bg-[var(--border-strong)]" />
            <div className="h-2 w-full rounded-sm bg-[var(--border-strong)]" />
          </div>
          <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-[var(--brand-emerald)] text-white text-xs font-bold flex items-center justify-center shadow-md">
            §
          </div>
        </div>
      </div>
    ),
  }
);

interface ResearchPaperSceneWrapperProps {
  className?: string;
}

export function ResearchPaperSceneWrapper({ className = '' }: ResearchPaperSceneWrapperProps) {
  return <DynamicScene className={className} />;
}
