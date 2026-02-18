// frontend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  concertId: string;
  status: 'active' | 'cancelled';
  user?: User;
  concert?: Concert;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConcertPayload {
  name: string;
  description: string;
  totalSeats: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
