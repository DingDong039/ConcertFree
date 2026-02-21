// frontend/src/entities/reservation/api/reservation-api.ts
import { request } from '@/shared/api';
import type { Reservation } from '../model';

export const reservationApi = {
  reserve: (concertId: string) =>
    request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ concertId }),
    }),

  cancel: (id: string) =>
    request<Reservation>(`/reservations/${id}`, { method: 'DELETE' }),

  getMine: () => request<Reservation[]>('/reservations/me'),

  getAll: () => request<Reservation[]>('/reservations'),
};
