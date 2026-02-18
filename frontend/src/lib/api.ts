// frontend/src/lib/api.ts
import type {
  Concert,
  Reservation,
  CreateConcertPayload,
  AuthResponse,
} from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(error.message?.message)
      ? error.message.message.join(', ')
      : error.message?.message || error.message || 'Request failed';
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

export const authApi = {
  register: (body: { email: string; name: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const concertsApi = {
  getAll: () => request<Concert[]>('/concerts'),
  getOne: (id: string) => request<Concert>(`/concerts/${id}`),
  create: (body: CreateConcertPayload) =>
    request<Concert>('/concerts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<CreateConcertPayload>) =>
    request<Concert>(`/concerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request<void>(`/concerts/${id}`, { method: 'DELETE' }),
};

export const reservationsApi = {
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
