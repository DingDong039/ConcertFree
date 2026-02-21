// frontend/src/features/auth/index.ts

// Model
export type { AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from './model';
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useIsAdmin,
  useAuthLoading,
  useAuthError,
} from './model';

// API
export { authApi } from './api';

// UI
export { LoginForm, RegisterForm } from './ui';
