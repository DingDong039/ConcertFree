// frontend/src/features/auth/model/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/entities/user";
import { ROUTES } from "@/shared/config";
import { authApi } from "../api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

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
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response,
            // Token is now handled via HttpOnly cookie
            token: "cookie-handled", 
            isLoading: false,
          });

          // Redirect based on role
          if (typeof window !== "undefined") {
            const redirectPath =
              response.role === "admin"
                ? ROUTES.ADMIN_CONCERTS
                : ROUTES.CONCERTS;
            window.location.href = redirectPath;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, name, password });
          set({
            user: response,
            token: "cookie-handled",
            isLoading: false,
          });

          // Redirect to concerts page
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.CONCERTS;
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Registration failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ user: null, token: null, error: null });
        
        try {
          // Call the backend to clear the cookie
          await authApi.logout();
        } catch (err) {
          console.error("Logout error", err);
        }

        // Redirect to home
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.HOME;
        }
      },

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        // we map token so that useIsAuthenticated still works
        token: state.token,
      }),
    },
  ),
);

// Convenience hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.user && !!state.token);
export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === "admin");
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
