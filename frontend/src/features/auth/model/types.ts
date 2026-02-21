// frontend/src/features/auth/model/types.ts
import type { User } from '@/entities/user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
