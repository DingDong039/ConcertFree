// frontend/src/app/concerts/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { concertsApi, reservationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/app/(components)/layout/Navbar';
import ConcertCard from '@/app/(components)/concerts/ConcertCard';
import type { Concert } from '@/types';

export default function ConcertsPage() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchConcerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await concertsApi.getAll();
      setConcerts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load concerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConcerts();
  }, [fetchConcerts]);

  const handleReserve = async (concertId: string) => {
    setReservingId(concertId);
    setError('');
    setSuccessMsg('');
    try {
      await reservationsApi.reserve(concertId);
      setSuccessMsg('🎉 Seat reserved successfully!');
      await fetchConcerts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎵 Upcoming Concerts
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse and reserve your free tickets
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-6">
            {successMsg}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card">
                <div className="skeleton h-5 w-3/4 mb-4" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-5/6 mb-4" />
                <div className="skeleton h-2 w-full mb-4" />
                <div className="skeleton h-10 w-full" />
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-gray-500 text-lg">
              No concerts available yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Responsive grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <ConcertCard
                key={concert.id}
                concert={concert}
                onReserve={handleReserve}
                isReserving={reservingId === concert.id}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
