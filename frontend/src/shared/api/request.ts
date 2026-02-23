// frontend/src/shared/api/request.ts
import { API_BASE_URL, STORAGE_KEYS } from "@/shared/config/constants";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  // Try to use toast if available in browser
  let toast: unknown = null;
  if (typeof window !== "undefined") {
    try {
      const sonner = await import("sonner");
      toast = sonner.toast;
    } catch {
      // sonner not available or error importing
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: options.credentials || "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(error.message?.message)
      ? error.message.message.join(", ")
      : error.message?.message || error.message || "Request failed";
    
    // Global client-side error handling
    if (toast && typeof (toast as { error: unknown }).error === 'function') {
      ((toast as { error: (msg: string, opts: Record<string, unknown>) => void }).error)("Error", { description: msg });
    } else if (typeof toast === 'function') {
      (toast as (msg: string, opts: Record<string, unknown>) => void)("Error", { description: msg });
    }
    
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export async function fetcher<T>(url: string): Promise<T> {
  return request<T>(url);
}
