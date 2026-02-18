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
        { href: '/admin/concerts', label: 'Manage Concerts' },
        { href: '/admin/reservations', label: 'All Reservations' },
      ]
    : [
        { href: '/concerts', label: 'Concerts' },
        { href: '/reservations/me', label: 'My Tickets' },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-violet-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="font-bold text-violet-700 text-lg">
              ConcertFree
            </span>
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
                    <span className="ml-1.5 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Register
                </Link>
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
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-gray-600 transition-all origin-center ${
                  menuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-600 transition-all ${
                  menuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-600 transition-all origin-center ${
                  menuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
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
            <button onClick={logout} className="w-full btn-danger text-sm">
              Logout
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                className="block w-full btn-secondary text-sm text-center"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="block w-full btn-primary text-sm text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
