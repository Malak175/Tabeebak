import {
  AuthResponse,
  AuthStorage,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";
import { apiRequest, authStorageKey, clearStoredAuth } from "@/services/api";

const normalizeAuthResponse = (payload: unknown): AuthResponse => {
  const data = (payload ?? {}) as Record<string, unknown>;
  return {
    token: String(data.token ?? data.accessToken ?? ""),
    user: null,
  };
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiRequest<unknown>("/auth/register", {
      method: "POST",
      body: payload,
    });

    return normalizeAuthResponse(response);
  },

  async signIn(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiRequest<unknown>("/auth/signin", {
      method: "POST",
      body: payload,
    });

    const wrapped = (response ?? {}) as Record<string, unknown>;
    return normalizeAuthResponse(wrapped.data ?? response);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiRequest<{ message?: string }>("/auth/change-password", {
      method: "PUT",
      body: {
        old_password: payload.currentPassword,
        new_password: payload.newPassword,
      },
      auth: true,
    });

    return { message: response.message ?? "Password updated successfully" };
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
