import {
  AuthStorage,
  AuthTokenResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from "@/types/auth.types";
import { apiRequest, authStorageKey, clearStoredAuth } from "@/services/api";
const normalizeAuthTokenResponse = (payload: unknown): AuthTokenResponse => {
  const data = (payload ?? {}) as Record<string, unknown>;
  const token = String(data.token ?? "");

  return { token };
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokenResponse> {
    const response = await apiRequest<unknown>("/auth/register", {
      method: "POST",
      body: payload,
    });

    return normalizeAuthTokenResponse(response);
  },

  async signIn(payload: LoginPayload): Promise<AuthTokenResponse> {
    const response = await apiRequest<unknown>("/auth/signin", {
      method: "POST",
      body: payload,
    });

    return normalizeAuthTokenResponse(response);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const response = await apiRequest<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    });

    return { message: response.message ?? "Reset link sent successfully" };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await apiRequest<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: payload,
    });

    return { message: response.message ?? "Password reset successfully" };
  },

  saveAuth(data: AuthStorage): void {
    localStorage.setItem(authStorageKey, JSON.stringify(data));
  },

  loadAuth(): AuthStorage | null {
    const raw = localStorage.getItem(authStorageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as AuthStorage;
      if (!parsed.token) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    clearStoredAuth();
  },
};

export const routeByRole = (role: UserRole): string => {
  switch (role) {
    case "Patient":
      return "/patient/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Lab":
      return "/lab/dashboard";
    default:
      return "/";
  }
};
