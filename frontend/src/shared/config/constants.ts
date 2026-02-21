// frontend/src/shared/config/constants.ts

export const APP_NAME = "GigTix";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER: "user",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  CONCERTS: "/concerts",
  RESERVATIONS_ME: "/reservations/me",
  ADMIN_CONCERTS: "/admin/concerts",
  ADMIN_RESERVATIONS: "/admin/reservations",
} as const;
