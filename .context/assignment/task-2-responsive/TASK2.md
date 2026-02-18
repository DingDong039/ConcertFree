# Task 2 — Responsive Design

## Strategy

ใช้ **Tailwind CSS** เป็น utility framework หลัก + เขียน **Custom CSS** ด้วย CSS Custom Properties  
Breakpoints: `mobile < 640px`, `tablet 640–1024px`, `desktop > 1024px`

---

## globals.css — Custom CSS (Required)

```css
/* frontend/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Custom Design Tokens ───────────────────────────────── */
:root {
  --color-primary:       #6d28d9;
  --color-primary-hover: #5b21b6;
  --color-accent:        #f59e0b;
  --color-success:       #10b981;
  --color-danger:        #ef4444;
  --color-surface:       #ffffff;
  --color-bg:            #f5f3ff;
  --color-text:          #1e1b4b;
  --color-muted:         #6b7280;
  --radius:              0.75rem;
  --shadow:              0 4px 24px rgba(109, 40, 217, 0.08);
}

/* ─── Base Resets ────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

/* ─── Reusable Component Classes (@layer) ────────────────── */
@layer components {

  /* Buttons */
  .btn-primary {
    @apply bg-violet-700 hover:bg-violet-800 text-white font-semibold
           px-6 py-2.5 rounded-xl transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
           disabled:opacity-60 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-white hover:bg-violet-50 text-violet-700 font-semibold
           border border-violet-200 px-6 py-2.5 rounded-xl transition-all duration-200;
  }

  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white font-semibold
           px-6 py-2.5 rounded-xl transition-all duration-200
           disabled:opacity-60 disabled:cursor-not-allowed;
  }

  /* Card */
  .card {
    @apply bg-white rounded-2xl shadow-md border border-violet-50 p-6
           transition-shadow duration-200 hover:shadow-lg;
  }

  /* Form */
  .input {
    @apply w-full border border-gray-200 rounded-xl px-4 py-2.5
           focus:outline-none focus:ring-2 focus:ring-violet-400
           placeholder-gray-400 text-gray-800 bg-white;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  /* Status Badges */
  .badge-available {
    @apply inline-flex items-center gap-1 text-xs font-semibold
           text-emerald-700 bg-emerald-50 border border-emerald-200
           px-2.5 py-0.5 rounded-full;
  }

  .badge-soldout {
    @apply inline-flex items-center gap-1 text-xs font-semibold
           text-red-600 bg-red-50 border border-red-200
           px-2.5 py-0.5 rounded-full;
  }

  .badge-cancelled {
    @apply inline-flex items-center text-xs font-semibold
           text-gray-500 bg-gray-100 border border-gray-200
           px-2.5 py-0.5 rounded-full;
  }
}

/* ─── Hero Section Gradient ──────────────────────────────── */
.hero-gradient {
  background: linear-gradient(
    135deg,
    #6d28d9 0%,
    #4f46e5 50%,
    #7c3aed 100%
  );
}

/* ─── Concert card lift on hover ─────────────────────────── */
.concert-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.concert-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(109, 40, 217, 0.12);
}

/* ─── Responsive Navbar (Custom CSS — not Tailwind) ─────── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-links.open {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: #ffffff;
    padding: 1rem 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    z-index: 50;
    gap: 0.75rem;
  }
}

/* ─── Responsive Table (hide on mobile, show cards) ─────── */
@media (max-width: 768px) {
  .desktop-table { display: none; }
  .mobile-cards  { display: block; }
}
@media (min-width: 769px) {
  .desktop-table { display: table; }
  .mobile-cards  { display: none; }
}

/* ─── Loading skeleton animation ────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 0.5rem;
}
```

---

## Responsive Navbar

```tsx
// frontend/src/app/(components)/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = isAdmin
    ? [
        { href: '/admin/concerts',     label: 'Manage Concerts' },
        { href: '/admin/reservations', label: 'All Reservations' },
      ]
    : [
        { href: '/concerts',       label: 'Concerts' },
        { href: '/reservations/me', label: 'My Tickets' },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-violet-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="font-bold text-violet-700 text-lg">ConcertFree</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-violet-700'
                    : 'text-gray-600 hover:text-violet-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500">
                  Hi, <strong>{user.name}</strong>
                  {isAdmin && (
                    <span className="ml-1.5 text-xs bg-violet-100 text-violet-700
                                     px-2 py-0.5 rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                </span>
                <button onClick={logout} className="btn-secondary text-sm px-4 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"    className="btn-secondary text-sm px-4 py-2">Login</Link>
                <Link href="/auth/register" className="btn-primary  text-sm px-4 py-2">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-violet-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {/* Animated hamburger lines */}
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-600 transition-all origin-center
                               ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-gray-600 transition-all
                               ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-gray-600 transition-all origin-center
                               ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>

        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-violet-50 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-violet-600 py-1"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-violet-100" />
          {user ? (
            <button onClick={logout} className="w-full btn-danger text-sm">Logout</button>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login"
                className="block w-full btn-secondary text-sm text-center">Login</Link>
              <Link href="/auth/register"
                className="block w-full btn-primary text-sm text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
```

---

## Responsive Concert Card

```tsx
// frontend/src/app/(components)/ui/ConcertCard.tsx
'use client';

import { Concert } from '@/types';

interface ConcertCardProps {
  concert: Concert;
  onReserve?: (id: string) => void;
  onDelete?:  (id: string) => void;
  isReserved?: boolean;
  isAdmin?:    boolean;
  isLoading?:  boolean;
}

export default function ConcertCard({
  concert, onReserve, onDelete, isReserved, isAdmin, isLoading,
}: ConcertCardProps) {
  const isSoldOut    = concert.availableSeats === 0;
  const occupancyPct = Math.round(
    ((concert.totalSeats - concert.availableSeats) / concert.totalSeats) * 100,
  );

  return (
    <article className="card concert-card flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 truncate flex-1 min-w-0 mr-2">
          {concert.name}
        </h3>
        {isSoldOut
          ? <span className="badge-soldout shrink-0">Sold Out</span>
          : <span className="badge-available shrink-0">Available</span>}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-4">
        {concert.description}
      </p>

      {/* Seat Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{concert.availableSeats} seats left</span>
          <span>{concert.totalSeats} total</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSoldOut
                ? 'bg-red-400'
                : occupancyPct > 75
                ? 'bg-amber-400'
                : 'bg-violet-500'
            }`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {isAdmin ? (
        <button
          onClick={() => onDelete?.(concert.id)}
          disabled={isLoading}
          className="btn-danger w-full text-sm"
        >
          {isLoading ? 'Deleting...' : 'Delete Concert'}
        </button>
      ) : (
        <button
          onClick={() => onReserve?.(concert.id)}
          disabled={isSoldOut || isReserved || isLoading}
          className={`w-full text-sm font-semibold py-2.5 rounded-xl transition-all
                      focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isReserved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : isSoldOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isLoading   ? 'Reserving...'
          : isReserved ? '✓ Reserved'
          :              'Reserve Free Ticket'}
        </button>
      )}
    </article>
  );
}
```

---

## Responsive Grid Layout Pattern

```tsx
{/* 1 col mobile → 2 col tablet → 3 col desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {concerts.map((concert) => (
    <ConcertCard key={concert.id} concert={concert} />
  ))}
</div>
```

---

## Responsive Admin Table (Desktop Table + Mobile Cards)

```tsx
{/* Desktop: full table */}
<table className="w-full text-sm hidden md:table">
  <thead className="bg-violet-50">
    <tr>
      {['User', 'Concert', 'Status', 'Date'].map((h) => (
        <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                               uppercase tracking-wider text-violet-700">
          {h}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-50">
    {reservations.map((r) => (
      <tr key={r.id} className="hover:bg-violet-50/30">
        <td className="px-6 py-4">{r.user?.name}</td>
        <td className="px-6 py-4">{r.concert?.name}</td>
        <td className="px-6 py-4">
          {r.status === 'active'
            ? <span className="badge-available">Active</span>
            : <span className="badge-cancelled">Cancelled</span>}
        </td>
        <td className="px-6 py-4 text-gray-500">
          {new Date(r.createdAt).toLocaleDateString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>

{/* Mobile: card list */}
<div className="md:hidden divide-y divide-gray-50">
  {reservations.map((r) => (
    <div key={r.id} className="p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{r.user?.name}</span>
        <span className={r.status === 'active' ? 'badge-available' : 'badge-cancelled'}>
          {r.status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{r.concert?.name}</p>
    </div>
  ))}
</div>
```

---

## tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        // default Tailwind breakpoints — used throughout
        // sm: '640px', md: '768px', lg: '1024px', xl: '1280px'
      },
    },
  },
  plugins: [],
};
```

---

## Responsive Breakpoints Summary

| Breakpoint | Class Prefix | Use Case |
|---|---|---|
| Mobile (<640px) | (default) | Single column, stacked nav, card list |
| Tablet (640px+) | `sm:` | 2-column grid |
| Desktop (1024px+) | `lg:` | 3-column grid, table layout |
| Large (1280px+) | `xl:` | Max-width container |
