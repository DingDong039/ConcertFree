// frontend/src/entities/concert/model/concert.store.ts
import { create } from 'zustand';
import type { Concert } from './types';

interface ConcertState {
  concerts: Concert[];
  isLoading: boolean;
  error: string | null;
  setConcerts: (concerts: Concert[]) => void;
  addConcert: (concert: Concert) => void;
  updateConcert: (id: string, data: Partial<Concert>) => void;
  removeConcert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConcertStore = create<ConcertState>((set) => ({
  concerts: [],
  isLoading: false,
  error: null,

  setConcerts: (concerts) => set({ concerts }),

  addConcert: (concert) =>
    set((state) => ({ concerts: [...state.concerts, concert] })),

  updateConcert: (id, data) =>
    set((state) => ({
      concerts: state.concerts.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    })),

  removeConcert: (id) =>
    set((state) => ({
      concerts: state.concerts.filter((c) => c.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
