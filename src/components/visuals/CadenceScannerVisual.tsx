'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createTimeline, stagger } from 'animejs';
import { Gauge, Sparkles, RotateCcw } from 'lucide-react';

interface CadenceScannerVisualProps {
  className?: string;
}

export function CadenceScannerVisual({ className = '' }: CadenceScannerVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const timelineRef = useRef<any>(null);

  const runAnimation = () => {
    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (scanLineRef.current) scanLineRef.current.style.opacity = '0';
      if (highlightRef.current) highlightRef.current.style.opacity = '1';
      if (badgeRef.current) badgeRef.current.style.opacity = '1';
      if (metricsRef.current) metricsRef.current.style.opacity = '1';
      return;
    }

    if (!containerRef.current) return;

    // Reset initial states safely
    if (timelineRef.current) {
      try {
        timelineRef.current.pause();
        timelineRef.current.revert();
      } catch {}
    }

    setIsScanning(true);

    const tl = createTimeline({
      defaults: {
        ease: 'outQuad',
      },
      onComplete: () => {
        setIsScanning(false);
      },
    });

    timelineRef.current = tl;

    // Stage 1: Sweep scan line across prose
    if (scanLineRef.current) {
      tl.add(scanLineRef.current, {
        opacity: [0, 1],
        left: ['0%', '100%'],
        duration: 900,
      });
    }

    // Stage 2: Stagger rhythm bars
    if (waveformRef.current) {
      const bars = waveformRef.current.querySelectorAll('.rhythm-bar');
      if (bars.length > 0) {
        tl.add(
          bars,
          {
            scaleY: [0.2, 1],
            opacity: [0.3, 1],
            duration: 400,
            delay: stagger(45),
          },
          '-=500'
        );
      }
    }

    // Stage 3: Highlight target sentence with emerald glow
    if (highlightRef.current) {
      tl.add(
        highlightRef.current,
        {
          backgroundColor: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.22)'],
          opacity: [0.7, 1],
          duration: 500,
        },
        '-=200'
      );
    }

    // Stage 4: Pop in the Flesch score badge & cadence metrics
    if (badgeRef.current) {
      tl.add(
        badgeRef.current,
        {
          opacity: [0, 1],
          scale: [0.92, 1],
          translateY: [8, 0],
          duration: 450,
          ease: 'outBack',
        },
        '-=150'
      );
    }

    if (metricsRef.current) {
      tl.add(
        metricsRef.current,
        {
          opacity: [0, 1],
          duration: 350,
        },
        '-=200'
      );
    }
  };

  useEffect(() => {
    runAnimation();
    return () => {
      if (timelineRef.current) {
        try {
          timelineRef.current.pause();
          timelineRef.current.revert();
        } catch {}
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-6 shadow-editorial transition-all ${className}`}
      aria-label="Interactive prose cadence diagnostic demonstration"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <span className="font-editorial-serif text-sm font-bold text-[var(--text-main)]">
              Prose Cadence Diagnostics
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-editorial-mono text-[var(--brand-emerald)] uppercase font-semibold">
              Live Engine
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={runAnimation}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-emerald)] transition-colors disabled:opacity-50"
          title="Replay Cadence Scan Animation"
        >
          <RotateCcw className={`h-3 w-3 text-[var(--brand-emerald)] ${isScanning ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-editorial-mono">Replay Scan</span>
        </button>
      </div>

      {/* Inspected Manuscript Prose Area */}
      <div className="relative mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-4 overflow-hidden">
        {/* Animated Scan Line */}
        <div
          ref={scanLineRef}
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--brand-emerald)] to-transparent pointer-events-none opacity-0 shadow-[0_0_8px_var(--brand-emerald)]"
          style={{ left: '0%' }}
        />

        <div className="space-y-2 font-editorial-serif text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
          <p>
            &ldquo;A clockwork heart does not forgive impatience.
            <span
              ref={highlightRef}
              className="inline rounded px-1.5 py-0.5 mx-0.5 font-medium text-[var(--brand-forest)] border border-[var(--brand-emerald)]/30 transition-colors"
            >
              It measures mortal hours with indifferent geometry
            </span>
            , ticking away moments until silence claims the gear-train.&rdquo;
          </p>
        </div>

        {/* Syllable Rhythm Waveform Indicator */}
        <div
          ref={waveformRef}
          className="mt-3 flex items-end gap-1.5 h-6 pt-1 border-t border-[var(--border-subtle)]"
          aria-hidden="true"
        >
          <span className="text-[10px] font-editorial-mono text-[var(--text-faint)] mr-1">Rhythm:</span>
          {[40, 65, 80, 50, 95, 70, 85, 45, 60, 90, 75, 55, 80, 65].map((val, idx) => (
            <div
              key={idx}
              className="rhythm-bar flex-1 rounded-full bg-[var(--brand-emerald)] opacity-30 origin-bottom"
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      </div>

      {/* Flesch Score Stamped Badge & Cadence Diagnostics */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Score Stamp */}
        <div
          ref={badgeRef}
          className="flex items-center gap-3 rounded-xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] p-3 shadow-xs"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-forest)] text-white font-editorial-serif text-base font-bold shadow-xs">
            78.4
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand-accent-text)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>Fairly Easy · Grade 7</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-editorial-mono">
              Optimal syntactic balance
            </p>
          </div>
        </div>

        {/* Cadence Metrics */}
        <div
          ref={metricsRef}
          className="flex flex-col justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3 text-[11px] font-editorial-mono text-[var(--text-muted)] space-y-1"
        >
          <div className="flex justify-between">
            <span>Words/Sentence:</span>
            <strong className="text-[var(--text-main)]">16 words</strong>
          </div>
          <div className="flex justify-between">
            <span>Syllables/Word:</span>
            <strong className="text-[var(--text-main)]">1.38 syl</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
