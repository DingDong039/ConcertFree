"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * Interactive 3D Holographic Ticket Logo
 * Tilts and shimmers based on mouse movement across the screen.
 */
export function InteractiveLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get exact window dimensions for calculating proportions
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const clientX = e.clientX;
      const clientY = e.clientY;

      // Calculate rotation based on mouse position relative to center of screen
      // Limits rotation to roughly +/- 15 degrees
      const maxRotate = 15;

      const moveX = (clientX - centerX) / centerX;
      const moveY = (clientY - centerY) / centerY;

      // Clamp values between -1 and 1 just in case
      const clampedX = Math.max(-1, Math.min(1, moveX));
      const clampedY = Math.max(-1, Math.min(1, moveY));

      setRotation({
        x: -clampedY * maxRotate, // Negative so tilting "up" when mouse is high
        y: clampedX * maxRotate,
      });

      // Move glare reflection
      setGlarePosition({
        x: 50 + clampedX * 50,
        y: 50 + clampedY * 50,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-sm mx-auto p-4"
      style={{ perspective: "1200px" }} // CSS 3D Space definition
    >
      <div
        className="relative w-full aspect-[2/1] rounded-2xl shadow-2xl transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ticket Base Background (Gradient + Noise) */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 rounded-2xl overflow-hidden shadow-inner ring-1 ring-white/20">
          {/* Noise overlay texture */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Ticket structural elements (Perforations & Notch) */}
          <div className="absolute top-0 bottom-0 right-[25%] w-px border-l-2 border-dashed border-white/30" />
          <div className="absolute top-[-15px] right-[25%] w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 translate-x-1/2 shadow-inner" />
          <div className="absolute bottom-[-15px] right-[25%] w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 translate-x-1/2 shadow-inner" />

          {/* Core Ticket Content Layout */}
          <div className="absolute inset-0 flex">
            {/* Left side (Main Branding) */}
            <div className="w-[75%] p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-white/60 text-xs font-mono tracking-widest uppercase">
                  Admit One
                </span>
                <span className="bg-orange-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm select-none border border-orange-400">
                  EARLY BIRD
                </span>
              </div>

              <div>
                <h2
                  className="text-white text-5xl sm:text-6xl font-black italic tracking-tighter drop-shadow-lg select-none"
                  style={{ transform: "translateZ(20px)" }} // Adds physical pop-out to text
                >
                  GigTix
                </h2>
                <p className="text-indigo-200 text-sm font-medium mt-1 tracking-widest uppercase select-none">
                  VIP All-Access
                </p>
              </div>
            </div>

            {/* Right side (Stub) */}
            <div className="w-[25%] flex flex-col items-center justify-center p-4 border-l border-white/10 bg-white/5">
              <div className="text-white/80 font-mono rotate-90 sm:rotate-0 text-xl font-bold tracking-widest select-none">
                #001
              </div>
            </div>
          </div>

          {/* Holographic moving glare effect (Tracks mouse directly) */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-all duration-75 ease-out rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)`,
            }}
          />

          {/* Iridescent Rainbow foil shifting effect */}
          <div
            className="absolute -inset-10 pointer-events-none mix-blend-color-dodge opacity-30 transition-all duration-100 ease-out"
            style={{
              background: `linear-gradient(${rotation.x * 3 + rotation.y * 3}deg, transparent 0%, rgba(255,0,0,0.4) 20%, rgba(0,255,0,0.4) 40%, rgba(0,0,255,0.4) 60%, rgba(255,0,255,0.4) 80%, transparent 100%)`,
              transform: `translate(${rotation.y * 3}%, ${rotation.x * 2}%) scale(1.5)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
