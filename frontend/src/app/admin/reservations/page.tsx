// frontend/src/app/admin/reservations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/(components)/layout/Navbar';
import type { Reservation } from '@/types';

export default function AdminReservationsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, authLoading, router]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getAll();
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
    if (isAdmin) fetchAll();
  }, [isAdmin, fetchAll]);

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 All Reservations
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Overview of all user reservations
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card">
                <div className="skeleton h-5 w-1/3 mb-3" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-500 text-lg">No reservations found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table w-full card overflow-hidden">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Concert</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-violet-50/40 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">
                        {r.user?.name || '-'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
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
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-cards space-y-4">
              {reservations.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {r.user?.name || '-'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.user?.email}
                      </p>
                    </div>
                    {r.status === 'active' ? (
                      <span className="badge-available">Active</span>
                    ) : (
                      <span className="badge-cancelled">Cancelled</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Concert: {r.concert?.name || r.concertId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
