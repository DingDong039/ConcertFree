// frontend/src/entities/concert/api/concert-api.ts
import { request, PaginatedResponse } from '@/shared/api';
import type { Concert, CreateConcertPayload, UpdateConcertPayload } from '../model';

export const concertApi = {
  getAll: (page?: number, limit?: number, search?: string) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<PaginatedResponse<Concert>>(`/concerts${queryString}`);
  },

  getOne: (id: string) => request<Concert>(`/concerts/${id}`),

  create: (payload: CreateConcertPayload) =>
    request<Concert>('/concerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateConcertPayload) =>
    request<Concert>(`/concerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<void>(`/concerts/${id}`, { method: 'DELETE' }),
};
