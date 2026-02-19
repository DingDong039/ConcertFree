// frontend/src/features/auth/model/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/entities/user';
import { STORAGE_KEYS, ROUTES } from '@/shared/config';
import { authApi } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => {
        const state = get();
        return !!state.user && !!state.token;
      },

      isAdmin: () => {
        const state = get();
        return state.user?.role === 'admin';
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          });

          // Store token in localStorage for API requests
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
          }

          // Redirect based on role
          if (typeof window !== 'undefined') {
            const redirectPath = response.user.role === 'admin'
              ? ROUTES.ADMIN_CONCERTS
              : ROUTES.CONCERTS;
            window.location.href = redirectPath;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, name, password });
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          });

          // Store token in localStorage for API requests
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
          }

          // Redirect to concerts page
          if (typeof window !== 'undefined') {
            window.location.href = ROUTES.CONCERTS;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }

        // Redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.HOME;
        }
      },

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

// Convenience hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated());
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin());
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
