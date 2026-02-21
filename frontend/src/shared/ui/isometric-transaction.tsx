"use client";

import React from "react";

interface IsometricBlockProps {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  depth: number;
  colorBase: string;
  colorTop: string;
  children?: React.ReactNode;
}

// Reusable pseudo-3D Block component using stacked SVG layers
function IsometricBlock({
  x,
  y,
  width,
  height,
  radius,
  depth,
  colorBase,
  colorTop,
  children,
}: IsometricBlockProps) {
  // SVG doesn't have true 3D extrusions, so we stack layers for pseudo-3D
  const layers = Array.from({ length: depth }).map((_, i) => (
    <g key={i} transform={`translate(0, ${-i}) scale(1, 0.5) rotate(-45)`}>
      <rect
        x={-(width / 2)}
        y={-(height / 2)}
        width={width}
        height={height}
        rx={radius}
        fill={i === depth - 1 ? colorTop : colorBase}
      />
    </g>
  ));

  return (
    <g transform={`translate(${x}, ${y})`}>
      {layers}
      {/* Front Screen Content Layer */}
      {children && (
        <g
          transform={`translate(0, ${-(depth - 1)}) scale(1, 0.5) rotate(-45)`}
        >
          {children}
        </g>
      )}
    </g>
  );
}

/**
 * Animated SVG of two isometric smartphones showing a transaction / coin transfer
 * Inspired by modern flat/pastel 2.5D illustration styles
 */
export function IsometricTransaction() {
  return (
    <div className="relative flex items-center justify-center p-8 w-full max-w-4xl mx-auto h-auto">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto drop-shadow-xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Path for the arc / coin travel */}
          <path id="transferArc" d="M 260 250 Q 400 30 540 160" fill="none" />

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="25"
              stdDeviation="10"
              floodColor="#000000"
              floodOpacity="0.08"
            />
          </filter>
        </defs>

        {/* Ambient floating elements */}
        <circle cx="150" cy="100" r="10" fill="#DBEAFE" />
        <circle cx="650" cy="80" r="6" fill="#D1FAE5" />
        <circle cx="700" cy="350" r="15" fill="#FEF3C7" opacity="0.6" />
        <rect
          x="200"
          y="400"
          width="16"
          height="16"
          fill="#E0E7FF"
          transform="rotate(25 200 400)"
        />
        <rect
          x="100"
          y="320"
          width="10"
          height="10"
          fill="#DBEAFE"
          transform="rotate(-15 100 320)"
        />

        {/* --- Phone 1: The Blue Phone (Sending Screen) --- */}
        <g filter="url(#softShadow)">
          <IsometricBlock
            x={260}
            y={330}
            width={160}
            height={280}
            radius={24}
            depth={20}
            colorBase="#60A5FA" // Blue 400
            colorTop="#BFDBFE" // Blue 200
          >
            {/* Screen Inner */}
            <rect
              x={-70}
              y={-130}
              width={140}
              height={260}
              rx={16}
              fill="#F8FAFC"
            />

            {/* Context: "Sending GigTix Ticket" */}
            <path
              d="M-25,-75 L25,-75 A5,5 0 0,1 30,-70 L30,-30 A5,5 0 0,1 25,-25 L-25,-25 A5,5 0 0,1 -30,-30 L-30,-70 A5,5 0 0,1 -25,-75 Z"
              fill="#DBEAFE"
            />

            {/* Ticket details on sender screen */}
            <rect x={-15} y={-65} width={30} height={4} rx={2} fill="#93C5FD" />
            <rect x={-15} y={-55} width={20} height={4} rx={2} fill="#93C5FD" />

            {/* 'Sending' status bars */}
            <rect x={-40} y={0} width={80} height={6} rx={3} fill="#EFF6FF" />

            {/* SEND Button Area */}
            <rect
              x={-50}
              y={70}
              width={100}
              height={40}
              rx={20}
              fill="#3B82F6"
            />

            {/* Since isometric scaling rotates/squashes, text looks painted ON exactly if normally rendered natively. 
                Using normal text inside an isometric plane automatically looks proper and stays on perspective. */}
            <text
              x={0}
              y={95}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#FFFFFF"
              fontFamily="sans-serif"
            >
              SEND
            </text>
          </IsometricBlock>
        </g>

        {/* --- Phone 2: The Green Phone (Wallet/Receiving Screen) --- */}
        <g filter="url(#softShadow)">
          <IsometricBlock
            x={540}
            y={220}
            width={160}
            height={280}
            radius={24}
            depth={20}
            colorBase="#34D399" // Emerald 400
            colorTop="#A7F3D0" // Emerald 200
          >
            {/* Screen Inner */}
            <rect
              x={-70}
              y={-130}
              width={140}
              height={260}
              rx={16}
              fill="#F0FDF4"
            />

            {/* Wallet Header background (Mockup of header UI stretching to sides) */}
            <path
              d="M-70,-98 Q-70,-130 -38,-130 L38,-130 Q70,-130 70,-98 L70,-80 L-70,-80 Z"
              fill="#6EE7B7"
            />
            <text
              x={0}
              y={-100}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#065F46"
              letterSpacing="2"
              fontFamily="sans-serif"
            >
              WALLET
            </text>
            <text
              x={0}
              y={-100}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#065F46"
              letterSpacing="2"
              fontFamily="sans-serif"
            >
              TICKETS
            </text>

            {/* Main Ticket Graphic (Instead of Credit Card) */}
            <g transform="translate(0, -40)">
              <rect
                x={-45}
                y={-25}
                width={90}
                height={50}
                rx={6}
                fill="#059669"
              />
              {/* Ticket Cutouts */}
              <circle cx={-45} cy={0} r={6} fill="#F0FDF4" />
              <circle cx={45} cy={0} r={6} fill="#F0FDF4" />
              {/* Ticket Dashed Line */}
              <line
                x1={20}
                y1={-20}
                x2={20}
                y2={20}
                stroke="#047857"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Ticket Info Lines */}
              <rect
                x={-30}
                y={-10}
                width={35}
                height={6}
                rx={3}
                fill="#34D399"
              />
              <rect x={-30} y={2} width={20} height={4} rx={2} fill="#6EE7B7" />
            </g>

            {/* Mock Transaction List Rows */}
            <rect
              x={-50}
              y={20}
              width={100}
              height={22}
              rx={6}
              fill="#D1FAE5"
            />
            <circle cx={-35} cy={31} r={5} fill="#6EE7B7" />
            <rect x={-20} y={28} width={45} height={6} rx={3} fill="#A7F3D0" />

            <rect
              x={-50}
              y={50}
              width={100}
              height={22}
              rx={6}
              fill="#D1FAE5"
            />
            <circle cx={-35} cy={61} r={5} fill="#6EE7B7" />
            <rect x={-20} y={58} width={30} height={6} rx={3} fill="#A7F3D0" />

            <rect
              x={-50}
              y={80}
              width={100}
              height={22}
              rx={6}
              fill="#D1FAE5"
            />
            <circle cx={-35} cy={91} r={5} fill="#6EE7B7" />
            <rect x={-20} y={88} width={50} height={6} rx={3} fill="#A7F3D0" />
          </IsometricBlock>
        </g>

        {/* --- The Transfer Path Line between screens --- */}
        {/* We place it near the top of the z-index so it arches over the phones nicely */}
        <path
          d="M 260 250 Q 400 30 540 160"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="3"
          strokeDasharray="10 10"
          className="opacity-50"
        />

        {/* --- The Animated Concert Ticket --- */}
        <g>
          {/* Animate motion forces the group to slide exactly along the dashed line */}
          <animateMotion dur="2.5s" repeatCount="indefinite">
            <mpath href="#transferArc" />
          </animateMotion>

          <g>
            {/* The spinning flip effect happens while it flies */}
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1,1; -1,1; 1,1"
              dur="0.8s"
              repeatCount="indefinite"
            />
            {/* The Ticket Object (Replaced Coin) */}
            <g transform="scale(0.8)">
              {/* Main Ticket Body */}
              <rect
                x={-25}
                y={-15}
                width={50}
                height={30}
                rx={4}
                fill="#F59E0B"
              />
              {/* Ticket End Flap */}
              <rect
                x={15}
                y={-15}
                width={10}
                height={30}
                rx={2}
                fill="#D97706"
              />
              {/* Side Cutouts */}
              <circle cx={-25} cy={0} r={4} fill="#FFFFFF" />
              <circle cx={25} cy={0} r={4} fill="#FFFFFF" />
              {/* Perforation Line */}
              <line
                x1={15}
                y1={-12}
                x2={15}
                y2={12}
                stroke="#B45309"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              {/* Star/Icon inside ticket */}
              <path
                d="M -5 -3 L -3 2 L 2 2 L -2 5 L 0 10 L -5 7 L -10 10 L -8 5 L -12 2 L -7 2 Z"
                fill="#FEF3C7"
                transform="scale(0.6) translate(5, -5)"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
