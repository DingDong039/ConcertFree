// frontend/src/entities/concert/api/concert-api.ts
import { request } from '@/shared/api';
import type { Concert, CreateConcertPayload, UpdateConcertPayload } from '../model';

export const concertApi = {
  getAll: () => request<Concert[]>('/concerts'),

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
