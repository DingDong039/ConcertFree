// frontend/src/entities/reservation/model/reservation.store.ts
import { create } from 'zustand';
import type { Reservation } from './types';

interface ReservationState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  isLoading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),

  addReservation: (reservation) =>
    set((state) => ({ reservations: [...state.reservations, reservation] })),

  updateReservation: (id, data) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...data } : r,
      ),
    })),

  removeReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
