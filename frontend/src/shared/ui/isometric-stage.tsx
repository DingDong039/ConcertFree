import React from "react";

/**
 * 3D Isometric Concert Stage Footer Component
 * Refined to match the specific 3D reference image.
 */
export function IsometricStage() {
  return (
    <div className="relative w-full max-w-[800px] mx-auto flex justify-center items-end py-10 px-4 mt-20">
      {/* 
        Adjusted viewBox to better frame the isometric perspective 
        from the reference image.
      */}
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base Drop Shadow */}
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="25" />
            <feOffset dx="0" dy="30" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glowing Effects */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="heavyGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="25" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          {/* Main Stage Floor Base - Deep Blue/Purple */}
          <linearGradient id="floorBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e2b77" /> {/* Indigo-ish */}
            <stop offset="100%" stopColor="#1e185e" /> {/* Darker Deep Blue */}
          </linearGradient>

          {/* Floor Edge (Thickness) */}
          <linearGradient id="floorEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#252069" />
            <stop offset="100%" stopColor="#16133a" />
          </linearGradient>

          {/* Inner Raised Stage Surface - Blue Matte */}
          <linearGradient id="raisedFloor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" /> {/* Indigo 700 */}
            <stop offset="100%" stopColor="#312e81" /> {/* Indigo 900 */}
          </linearGradient>

          {/* Backdrop Curved Wall */}
          <linearGradient id="backdropWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" /> {/* Slate 800 */}
            <stop offset="100%" stopColor="#0f172a" /> {/* Slate 900 */}
          </linearGradient>

          <linearGradient id="backdropEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" /> {/* Slate 700 */}
            <stop offset="100%" stopColor="#1e293b" /> {/* Slate 800 */}
          </linearGradient>

          {/* Spotlight Beams */}
          <linearGradient id="lightBeam" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          {/* Gold Props */}
          <linearGradient id="goldCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Lightbulb Fill */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#38bdf8" />
          </radialGradient>
        </defs>

        {/* ================= BACKGROUND AMBIENT GLOW ================= */}
        <ellipse
          cx="500"
          cy="650"
          rx="450"
          ry="80"
          fill="#4c1d95"
          opacity="0.4"
          filter="url(#heavyGlow)"
        />
        <ellipse
          cx="200"
          cy="650"
          rx="200"
          ry="60"
          fill="#7e22ce"
          opacity="0.4"
          filter="blur(30px)"
        />
        <ellipse
          cx="800"
          cy="650"
          rx="200"
          ry="60"
          fill="#7e22ce"
          opacity="0.4"
          filter="blur(30px)"
        />

        <g filter="url(#softShadow)">
          {/* ================= MAIN BASE CYLINDER (Thick dark edge) ================= */}
          <path
            d="M 100 600 A 400 130 0 0 0 900 600 L 900 660 A 400 130 0 0 1 100 660 Z"
            fill="url(#floorEdge)"
          />
          {/* Main Surface Base */}
          <ellipse cx="500" cy="600" rx="400" ry="130" fill="url(#floorBase)" />

          {/* ================= BACKDROP CURVED WALL ================= */}
          {/* Inner back wall */}
          <path
            d="M 120 540 A 380 110 0 0 1 880 540 L 880 280 A 380 110 0 0 0 120 280 Z"
            fill="url(#backdropWall)"
          />
          {/* Outer edge thickness */}
          <path
            d="M 880 280 A 380 110 0 0 0 120 280 L 110 270 A 390 120 0 0 1 890 270 Z"
            fill="url(#backdropEdge)"
          />

          {/* --- STAGE LIGHTS RACK (Curved along the top) --- */}
          {/* Left light */}
          <g transform="translate(350, 230)">
            <rect
              x="0"
              y="0"
              width="35"
              height="45"
              rx="6"
              fill="#64748b"
              transform="rotate(-15)"
            />
            <path
              d="M -5 10 L 25 20 A 20 10 0 0 1 20 40 L -10 30 Z"
              fill="#94a3b8"
            />
            <ellipse
              cx="10"
              cy="30"
              rx="15"
              ry="8"
              fill="url(#bulbGlow)"
              filter="url(#glow)"
            />
            <line
              x1="17"
              y1="0"
              x2="30"
              y2="-40"
              stroke="#cbd5e1"
              strokeWidth="4"
            />
          </g>

          {/* Center Left light */}
          <g transform="translate(450, 210)">
            <rect
              x="0"
              y="0"
              width="35"
              height="45"
              rx="6"
              fill="#64748b"
              transform="rotate(-5)"
            />
            <path
              d="M 0 15 L 30 15 A 20 10 0 0 1 30 35 L 0 35 Z"
              fill="#94a3b8"
            />
            <ellipse
              cx="15"
              cy="35"
              rx="15"
              ry="8"
              fill="url(#bulbGlow)"
              filter="url(#glow)"
            />
            <line
              x1="17"
              y1="0"
              x2="20"
              y2="-40"
              stroke="#cbd5e1"
              strokeWidth="4"
            />
          </g>

          {/* Center Right light */}
          <g transform="translate(550, 210)">
            <rect
              x="0"
              y="0"
              width="35"
              height="45"
              rx="6"
              fill="#64748b"
              transform="rotate(5)"
            />
            <path
              d="M 5 15 L 35 15 A 20 10 0 0 1 35 35 L 5 35 Z"
              fill="#94a3b8"
            />
            <ellipse
              cx="20"
              cy="35"
              rx="15"
              ry="8"
              fill="url(#bulbGlow)"
              filter="url(#glow)"
            />
            <line
              x1="17"
              y1="0"
              x2="15"
              y2="-40"
              stroke="#cbd5e1"
              strokeWidth="4"
            />
          </g>

          {/* Right light */}
          <g transform="translate(650, 230)">
            <rect
              x="0"
              y="0"
              width="35"
              height="45"
              rx="6"
              fill="#64748b"
              transform="rotate(20)"
            />
            <path
              d="M 10 10 L 40 25 A 20 10 0 0 1 25 45 L -5 30 Z"
              fill="#94a3b8"
            />
            <ellipse
              cx="15"
              cy="35"
              rx="15"
              ry="8"
              fill="url(#bulbGlow)"
              filter="url(#glow)"
            />
            <line
              x1="17"
              y1="0"
              x2="0"
              y2="-40"
              stroke="#cbd5e1"
              strokeWidth="4"
            />
          </g>

          {/* ================= INNER RAISED CARPET/PLATFORM ================= */}
          <path
            d="M 250 580 L 750 580 L 800 630 L 200 630 Z"
            fill="url(#raisedFloor)"
          />
          {/* Subtle line to show the edge of the mat */}
          <path
            d="M 200 630 L 800 630"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            opacity="0.5"
          />

          {/* ================= LIGHT BEAMS (Animated) ================= */}
          <polygon
            points="360,260 250,650 450,650"
            fill="url(#lightBeam)"
            className="animate-pulse"
            style={{ mixBlendMode: "screen" }}
          />
          <polygon
            points="465,245 350,650 550,650"
            fill="url(#lightBeam)"
            className="animate-pulse"
            style={{ animationDelay: "1s", mixBlendMode: "screen" }}
          />
          <polygon
            points="570,245 450,650 650,650"
            fill="url(#lightBeam)"
            className="animate-pulse"
            style={{ animationDelay: "2s", mixBlendMode: "screen" }}
          />
          <polygon
            points="665,265 550,650 750,650"
            fill="url(#lightBeam)"
            className="animate-pulse"
            style={{ animationDelay: "0.5s", mixBlendMode: "screen" }}
          />

          {/* Back wall glowing line art (The swirly blue thing) */}
          <path
            d="M 450 400 Q 550 300 500 200 Q 400 150 420 250"
            fill="none"
            stroke="#60a5fa"
            opacity="0.6"
            strokeWidth="3"
            filter="url(#glow)"
          />
          {/* Floating glowing orbs */}
          <circle cx="480" cy="380" r="12" fill="#bfdbfe" filter="url(#glow)" />
          <circle cx="480" cy="380" r="6" fill="#ffffff" />

          {/* ================= PROPS ================= */}
          {/* The Gold Drums on the right */}
          <g transform="translate(680, 560)">
            {/* Drum 1 (Back left) */}
            <g transform="translate(-20, -30)">
              <ellipse
                cx="0"
                cy="0"
                rx="35"
                ry="12"
                fill="url(#goldCylinder)"
              />
              <path
                d="M -35 0 L 35 0 L 35 45 A 35 12 0 0 1 -35 45 Z"
                fill="url(#goldCylinder)"
              />
              <ellipse cx="0" cy="45" rx="35" ry="12" fill="#854d0e" />
              <ellipse cx="0" cy="0" rx="30" ry="9" fill="#fef08a" />
            </g>
            {/* Drum 2 (Back right) */}
            <g transform="translate(45, -15)">
              <ellipse
                cx="0"
                cy="0"
                rx="35"
                ry="12"
                fill="url(#goldCylinder)"
              />
              <path
                d="M -35 0 L 35 0 L 35 45 A 35 12 0 0 1 -35 45 Z"
                fill="url(#goldCylinder)"
              />
              <ellipse cx="0" cy="45" rx="35" ry="12" fill="#854d0e" />
              <ellipse cx="0" cy="0" rx="30" ry="9" fill="#fef08a" />
            </g>
            {/* Drum 3 (Front center) */}
            <g transform="translate(10, 20)">
              <ellipse
                cx="0"
                cy="0"
                rx="35"
                ry="12"
                fill="url(#goldCylinder)"
              />
              <path
                d="M -35 0 L 35 0 L 35 45 A 35 12 0 0 1 -35 45 Z"
                fill="url(#goldCylinder)"
              />
              <ellipse cx="0" cy="45" rx="35" ry="12" fill="#854d0e" />
              <ellipse cx="0" cy="0" rx="30" ry="9" fill="#fef08a" />
            </g>
          </g>

          {/* Stool in the middle-left */}
          <g transform="translate(400, 570)">
            <ellipse
              cx="0"
              cy="30"
              rx="20"
              ry="6"
              fill="#000"
              opacity="0.3"
              filter="blur(2px)"
            />
            {/* Legs */}
            <line
              x1="-15"
              y1="0"
              x2="-20"
              y2="30"
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <line
              x1="15"
              y1="0"
              x2="20"
              y2="30"
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <line
              x1="0"
              y1="5"
              x2="0"
              y2="30"
              stroke="#94a3b8"
              strokeWidth="3"
            />
            <line
              x1="-18"
              y1="15"
              x2="18"
              y2="15"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {/* Seat */}
            <ellipse cx="0" cy="0" rx="25" ry="10" fill="#1e293b" />
            <ellipse cx="0" cy="-3" rx="25" ry="10" fill="#334155" />
          </g>

          {/* Mic Stand */}
          <g transform="translate(450, 580)">
            <ellipse
              cx="0"
              cy="20"
              rx="10"
              ry="3"
              fill="#000"
              opacity="0.3"
              filter="blur(2px)"
            />
            <line
              x1="0"
              y1="20"
              x2="0"
              y2="-40"
              stroke="#94a3b8"
              strokeWidth="3"
            />
            <circle
              cx="0"
              cy="20"
              r="8"
              fill="#475569"
              transform="scale(1, 0.5)"
            />
            {/* Mic top */}
            <circle cx="-5" cy="-45" r="5" fill="#334155" />
            <line
              x1="0"
              y1="-40"
              x2="-2"
              y2="-42"
              stroke="#94a3b8"
              strokeWidth="2"
            />
          </g>

          {/* ================= CHARACTERS ================= */}

          {/* Character 1: Left Guitar/Keytar Player */}
          <g transform="translate(250, 480)">
            {/* Shadow */}
            <ellipse
              cx="25"
              cy="120"
              rx="30"
              ry="8"
              fill="#000"
              opacity="0.3"
              filter="blur(2px)"
            />
            {/* Pants/Legs - Minimal Blocky Style */}
            <path
              d="M 0 60 Q 5 90 0 120"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M 30 60 Q 40 90 40 120"
              fill="none"
              stroke="#2563eb"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Shoes */}
            <circle cx="0" cy="120" r="10" fill="#f8fafc" />
            <circle cx="40" cy="120" r="10" fill="#f8fafc" />
            {/* Torso/Shirt */}
            <path
              d="M -10 10 Q -5 35 5 60 L 25 60 Q 35 35 40 10 Z"
              fill="#8b5cf6"
            />
            {/* Arm (Left holding neck) */}
            <path
              d="M -10 15 Q -25 35 0 55"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <circle cx="0" cy="55" r="8" fill="#fef08a" /> {/* Hand */}
            {/* Guitar Body */}
            <g transform="translate(15, 30) rotate(45)">
              <rect
                x="-40"
                y="-12"
                width="60"
                height="24"
                rx="4"
                fill="#d97706"
              />
              <rect
                x="-35"
                y="-12"
                width="50"
                height="24"
                rx="4"
                fill="#fbbf24"
              />
              <rect
                x="-80"
                y="-4"
                width="40"
                height="8"
                rx="2"
                fill="#78350f"
              />
            </g>
            {/* Arm (Right strumming) */}
            <path
              d="M 40 15 Q 50 35 30 45"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <circle cx="30" cy="45" r="8" fill="#fef08a" /> {/* Hand */}
            {/* Head & VR */}
            <circle cx="15" cy="-10" r="24" fill="#fef08a" />
            {/* VR Goggles */}
            <rect x="-5" y="-20" width="40" height="18" rx="4" fill="#1e293b" />
            <rect x="0" y="-18" width="30" height="14" rx="2" fill="#0f172a" />
            <rect
              x="25"
              y="-20"
              width="10"
              height="18"
              rx="4"
              fill="#3b82f6"
              opacity="0.8"
            />{" "}
            {/* Reflection */}
          </g>

          {/* Character 2: Center Singer (with glasses) */}
          <g transform="translate(480, 480)">
            {/* Shadow */}
            <ellipse
              cx="10"
              cy="120"
              rx="25"
              ry="8"
              fill="#000"
              opacity="0.3"
              filter="blur(2px)"
            />

            {/* Pants/Legs */}
            <path
              d="M -10 60 Q -20 90 -15 120"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 15 60 Q 25 90 20 120"
              fill="none"
              stroke="#0284c7"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Shoes */}
            <circle cx="-15" cy="120" r="8" fill="#9333ea" />
            <circle cx="20" cy="120" r="8" fill="#9333ea" />

            {/* Vest/Torso */}
            <path
              d="M -20 10 Q -15 35 -10 60 L 15 60 Q 20 35 25 10 Z"
              fill="#c084fc"
            />

            {/* Arms - White sleeved shirt underneath */}
            <path
              d="M -20 15 Q -40 30 -30 45"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 25 15 Q 40 15 35 -5"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Hands */}
            <circle cx="-30" cy="45" r="7" fill="#fef08a" />
            <circle cx="35" cy="-5" r="7" fill="#fef08a" />

            {/* Head */}
            <circle cx="2" cy="-15" r="22" fill="#fef08a" />
            {/* Hair */}
            <path
              d="M -18 -20 Q 2 -35 22 -20"
              fill="none"
              stroke="#52525b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Glasses */}
            <rect x="-10" y="-18" width="10" height="6" rx="2" fill="#18181b" />
            <rect x="4" y="-18" width="10" height="6" rx="2" fill="#18181b" />
            <line
              x1="0"
              y1="-15"
              x2="4"
              y2="-15"
              stroke="#18181b"
              strokeWidth="2"
            />
          </g>

          {/* Character 3: Right Female Dancer/Singer in Pink Dress */}
          <g transform="translate(600, 480)">
            {/* Shadow */}
            <ellipse
              cx="10"
              cy="120"
              rx="30"
              ry="8"
              fill="#000"
              opacity="0.3"
              filter="blur(2px)"
            />

            {/* Legs */}
            <path
              d="M -5 60 L -15 115"
              fill="none"
              stroke="#fef08a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 15 60 L 25 115"
              fill="none"
              stroke="#fef08a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* White Shoes */}
            <circle cx="-15" cy="115" r="7" fill="#ffffff" />
            <circle cx="25" cy="115" r="7" fill="#ffffff" />

            {/* Dress Skirt */}
            <path
              d="M -10 50 Q -50 90 -45 110 L 55 110 Q 60 90 20 50 Z"
              fill="#db2777"
            />
            {/* Skirt highlight */}
            <path
              d="M -5 50 Q -30 90 -20 95 L 30 95 Q 40 90 15 50 Z"
              fill="#f472b6"
              opacity="0.6"
            />

            {/* Dress Top */}
            <path
              d="M -15 10 Q -10 30 -10 50 L 20 50 Q 20 30 25 10 Z"
              fill="#ec4899"
            />

            {/* Arms raised up */}
            <path
              d="M -15 15 Q -40 -10 -25 -45"
              fill="none"
              stroke="#fef08a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 25 15 Q 50 0 45 -35"
              fill="none"
              stroke="#fef08a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Hands */}
            <circle cx="-25" cy="-45" r="6" fill="#fef08a" />
            <circle cx="45" cy="-35" r="6" fill="#fef08a" />

            {/* Head */}
            <circle cx="5" cy="-15" r="20" fill="#fef08a" />
            {/* Red Hair */}
            <path
              d="M -15 -15 Q -30 10 -15 25"
              fill="none"
              stroke="#dc2626"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 25 -15 Q 40 10 25 25"
              fill="none"
              stroke="#dc2626"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Headband / Visor */}
            <path
              d="M -12 -20 Q 5 -25 22 -20"
              fill="none"
              stroke="#9333ea"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
