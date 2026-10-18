'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ResearchPaperSceneProps {
  className?: string;
}

export function ResearchPaperScene({ className = '' }: ResearchPaperSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animFrameId: number | null = null;
    let isVisible = true;
    let isDisposed = false;

    // Detect WebGL capability safely
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!renderer.getContext()) {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 300;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Warm ambient and directional editorial lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd1fae5, 1.2);
    dirLight.position.set(4, 6, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xfef3c7, 0.4);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Group to hold and rotate our paper composition
    const paperGroup = new THREE.Group();
    paperGroup.rotation.x = 0.22;
    paperGroup.rotation.y = -0.32;
    paperGroup.rotation.z = 0.08;
    scene.add(paperGroup);

    // Track all created resources for deterministic disposal
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Helper to generate paper texture with simulated scholarly text lines
    const createPaperCanvas = (isBackdrop: boolean = false) => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512;
      texCanvas.height = 700;
      const ctx = texCanvas.getContext('2d');
      if (ctx) {
        // Base sheet color
        ctx.fillStyle = isBackdrop ? '#f4f3ec' : '#fcfbf7';
        ctx.fillRect(0, 0, 512, 700);

        // Document header title bar
        ctx.fillStyle = '#193d2d';
        ctx.fillRect(40, 48, isBackdrop ? 220 : 280, 16);

        // Subtitle / metadata line
        ctx.fillStyle = '#10b981';
        ctx.fillRect(40, 74, 140, 8);

        // Section dividing line
        ctx.fillStyle = '#e6e3d8';
        ctx.fillRect(40, 100, 432, 2);

        // Simulated paragraphs with varying cadence
        const lines = [
          { y: 125, w: 432, highlight: false },
          { y: 145, w: 400, highlight: false },
          { y: 165, w: 416, highlight: false },
          { y: 185, w: 340, highlight: false },

          // High-friction highlighted sentence (Emerald highlight marker)
          { y: 225, w: 432, highlight: true },
          { y: 245, w: 432, highlight: true },
          { y: 265, w: 320, highlight: true },

          { y: 310, w: 432, highlight: false },
          { y: 330, w: 390, highlight: false },
          { y: 350, w: 420, highlight: false },
          { y: 370, w: 280, highlight: false },

          { y: 415, w: 432, highlight: false },
          { y: 435, w: 410, highlight: false },
          { y: 455, w: 360, highlight: false },
        ];

        for (const line of lines) {
          if (line.highlight && !isBackdrop) {
            // Emerald annotation highlight strip
            ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.fillRect(36, line.y - 4, line.w + 8, 18);
            ctx.fillStyle = '#193d2d';
          } else {
            ctx.fillStyle = isBackdrop ? '#8b948e' : '#4b524e';
          }
          ctx.fillRect(40, line.y, line.w, 9);
        }

        // Section 2 Header
        ctx.fillStyle = '#193d2d';
        ctx.fillRect(40, 500, 200, 14);
        ctx.fillStyle = '#e6e3d8';
        ctx.fillRect(40, 524, 432, 2);

        // Footer score badge stamp
        if (!isBackdrop) {
          ctx.fillStyle = 'rgba(25, 61, 45, 0.08)';
          ctx.beginPath();
          ctx.roundRect(40, 580, 200, 60, 8);
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.fillRect(56, 598, 12, 12);
          ctx.fillStyle = '#193d2d';
          ctx.fillRect(76, 598, 120, 10);
          ctx.fillStyle = '#4b524e';
          ctx.fillRect(76, 616, 80, 8);
        }
      }

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      return texture;
    };

    // 1. Base manuscript paper sheet (Lower Layer)
    const baseGeo = new THREE.BoxGeometry(2.8, 3.8, 0.04);
    geometries.push(baseGeo);
    const baseTex = createPaperCanvas(true);
    const baseMat = new THREE.MeshStandardMaterial({
      map: baseTex,
      roughness: 0.65,
      metalness: 0.05,
    });
    materials.push(baseMat);
    const basePaper = new THREE.Mesh(baseGeo, baseMat);
    basePaper.position.set(-0.35, -0.25, -0.2);
    basePaper.rotation.z = -0.06;
    paperGroup.add(basePaper);

    // 2. Primary inspected manuscript sheet (Front Active Layer)
    const frontGeo = new THREE.BoxGeometry(2.9, 4.0, 0.05);
    geometries.push(frontGeo);
    const frontTex = createPaperCanvas(false);
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: 0.55,
      metalness: 0.08,
    });
    materials.push(frontMat);
    const frontPaper = new THREE.Mesh(frontGeo, frontMat);
    frontPaper.position.set(0.1, 0.1, 0.15);
    paperGroup.add(frontPaper);

    // 3. Subtle floating linguistic index badge (Floating pill)
    const badgeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 24);
    geometries.push(badgeGeo);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.2,
    });
    materials.push(badgeMat);
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(1.4, 1.6, 0.45);
    badge.rotation.x = Math.PI / 2;
    paperGroup.add(badge);

    // Mouse tilt tracking with gentle lerp
    let targetRotX = 0.22;
    let targetRotY = -0.32;
    let currentRotX = 0.22;
    let currentRotY = -0.32;
    let isMoving = false;
    let idleCounter = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Restrained tilt angle limit (max ~6 degrees)
      targetRotY = -0.32 + normX * 0.12;
      targetRotX = 0.22 - normY * 0.10;
      isMoving = true;
      idleCounter = 0;
    };

    const handlePointerLeave = () => {
      targetRotX = 0.22;
      targetRotY = -0.32;
      isMoving = true;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    // Resize Observer for fluid responsiveness
    const handleResize = () => {
      if (!renderer || !camera || !container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene!, camera);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Intersection Observer to stop render loop when scrolled off-screen
    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    });
    intersectionObserver.observe(container);

    // Initial render
    renderer.render(scene, camera);
    setIsReady(true);

    // Animation Loop (Render-on-demand & lerp damping)
    const render = () => {
      if (isDisposed) return;

      if (isVisible) {
        if (!prefersReducedMotion) {
          // Lerp rotation smoothly
          const diffX = targetRotX - currentRotX;
          const diffY = targetRotY - currentRotY;

          if (Math.abs(diffX) > 0.0005 || Math.abs(diffY) > 0.0005) {
            currentRotX += diffX * 0.06;
            currentRotY += diffY * 0.06;
            paperGroup.rotation.x = currentRotX;
            paperGroup.rotation.y = currentRotY;

            // Subtle counter-float on badge
            badge.position.y = 1.6 + Math.sin(Date.now() * 0.002) * 0.04;

            if (renderer && scene && camera) {
              renderer.render(scene, camera);
            }
          } else if (isMoving) {
            idleCounter++;
            if (idleCounter > 10) {
              isMoving = false;
            }
          }
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    // Cleanup resources
    return () => {
      isDisposed = true;
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      baseTex.dispose();
      frontTex.dispose();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] sm:h-[380px] flex items-center justify-center select-none overflow-hidden ${className}`}
      role="img"
      aria-label="Interactive 3D representation of an inspected research paper with layered analysis and highlighted prose"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full transition-opacity duration-700 ${
          isReady && hasWebGL ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Static Fallback for reduced motion, WebGL unsuitability, or loading */}
      {(!hasWebGL || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[var(--canvas-card)] rounded-2xl border border-[var(--border-subtle)] shadow-editorial">
          <div className="relative w-56 h-72 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-strong)] p-4 shadow-editorial-elevated space-y-3 -rotate-2">
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
      )}
    </div>
  );
}
