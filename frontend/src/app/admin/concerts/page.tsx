// frontend/src/app/admin/concerts/page.tsx
'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { concertsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/(components)/layout/Navbar';
import type { Concert, CreateConcertPayload } from '@/types';

const emptyForm: CreateConcertPayload = {
  name: '',
  description: '',
  totalSeats: 100,
};

export default function AdminConcertsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateConcertPayload>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, authLoading, router]);

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
    if (isAdmin) fetchConcerts();
  }, [isAdmin, fetchConcerts]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editId) {
        await concertsApi.update(editId, form);
      } else {
        await concertsApi.create(form);
      }
      resetForm();
      await fetchConcerts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (concert: Concert) => {
    setEditId(concert.id);
    setForm({
      name: concert.name,
      description: concert.description,
      totalSeats: concert.totalSeats,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this concert?')) return;
    setDeletingId(id);
    try {
      await concertsApi.delete(id);
      await fetchConcerts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎛️ Manage Concerts
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, edit, and delete concerts
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + New Concert
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-lg font-bold mb-4">
              {editId ? 'Edit Concert' : 'New Concert'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  required
                  minLength={3}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Concert name"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  minLength={10}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Event description (min 10 chars)"
                  className="input resize-y"
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100000}
                  value={form.totalSeats}
                  onChange={(e) =>
                    setForm({ ...form, totalSeats: Number(e.target.value) })
                  }
                  className="input max-w-[200px]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting
                    ? 'Saving...'
                    : editId
                      ? 'Update Concert'
                      : 'Create Concert'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Concerts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card">
                <div className="skeleton h-5 w-1/3 mb-3" />
                <div className="skeleton h-3 w-2/3 mb-3" />
                <div className="skeleton h-8 w-20" />
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-500 text-lg">
              No concerts yet. Create one above!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table w-full card overflow-hidden">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Reserved</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {concerts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-violet-50/40 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">
                        {c.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{c.totalSeats}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.availableSeats > 0 ? (
                        <span className="badge-available">
                          {c.availableSeats}
                        </span>
                      ) : (
                        <span className="badge-soldout">Sold Out</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.totalSeats - c.availableSeats}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="btn-secondary text-xs px-3 py-1.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          {deletingId === c.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-cards space-y-4">
              {concerts.map((c) => (
                <div key={c.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    {c.availableSeats > 0 ? (
                      <span className="badge-available">
                        {c.availableSeats} left
                      </span>
                    ) : (
                      <span className="badge-soldout">Sold Out</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {c.description}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Total: {c.totalSeats} · Reserved:{' '}
                    {c.totalSeats - c.availableSeats}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="btn-secondary text-sm flex-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="btn-danger text-sm flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
