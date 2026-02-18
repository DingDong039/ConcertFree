// frontend/src/app/reservations/me/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/(components)/layout/Navbar';
import type { Reservation } from '@/types';

export default function MyReservationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getMine();
      setReservations(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load reservations',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchReservations();
  }, [user, fetchReservations]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    setCancellingId(id);
    try {
      await reservationsApi.cancel(id);
      await fetchReservations();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Cancellation failed',
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎫 My Tickets
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Your concert reservations
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card">
                <div className="skeleton h-5 w-1/2 mb-3" />
                <div className="skeleton h-3 w-3/4 mb-2" />
                <div className="skeleton h-9 w-28" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-gray-500 text-lg">
              No reservations yet. Browse concerts to reserve!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table w-full card overflow-hidden">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Concert</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reserved At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-violet-50/40 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.concert?.name || r.concertId}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'active' ? (
                        <span className="badge-available">Active</span>
                      ) : (
                        <span className="badge-cancelled">Cancelled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'active' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-cards space-y-4">
              {reservations.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {r.concert?.name || r.concertId}
                    </h3>
                    {r.status === 'active' ? (
                      <span className="badge-available">Active</span>
                    ) : (
                      <span className="badge-cancelled">Cancelled</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Reserved: {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.status === 'active' && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      disabled={cancellingId === r.id}
                      className="btn-danger text-sm w-full"
                    >
                      {cancellingId === r.id
                        ? 'Cancelling...'
                        : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
