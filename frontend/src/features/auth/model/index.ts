// frontend/src/features/auth/model/index.ts
export type { AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from './types';
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useIsAdmin,
  useAuthLoading,
  useAuthError,
} from './auth.store';
