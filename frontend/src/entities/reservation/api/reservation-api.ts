// frontend/src/entities/reservation/api/reservation-api.ts
import { request, PaginatedResponse } from '@/shared/api';
import type { Reservation } from '../model';

export const reservationApi = {
  reserve: (concertId: string) =>
    request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ concertId }),
    }),

  cancel: (id: string) =>
    request<Reservation>(`/reservations/${id}`, { method: 'DELETE' }),

  getMine: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<PaginatedResponse<Reservation>>(`/reservations/me${queryString}`);
  },

  getAll: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<PaginatedResponse<Reservation>>(`/reservations${queryString}`);
  },
};
