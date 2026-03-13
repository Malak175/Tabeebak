import {
  AuthResponse,
  AuthStorage,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserRole,
} from "@/types/auth.types";
import { apiRequest, authStorageKey, clearStoredAuth } from "@/services/api";

const normalizeRole = (value: unknown): UserRole => {
  const raw = String(value ?? "").toLowerCase();

  if (raw === "patient") return "Patient";
  if (raw === "doctor") return "Doctor";
  if (raw === "lab" || raw === "laboratory") return "Lab";
  return "Admin";
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const buildUserFromToken = (token: string): AuthUser => {
  const payload = decodeJwtPayload(token) ?? {};
  const firstName = (payload.firstName as string) || undefined;
  const lastName = (payload.lastName as string) || undefined;
  const nameFromToken =
    (payload.name as string) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    undefined;

  return {
    id: String(payload.sub ?? payload.id ?? ""),
    email: String(payload.email ?? ""),
    firstName,
    lastName,
    name: nameFromToken,
    role: normalizeRole(payload.role),
    phone: (payload.phone as string) || undefined,
    dateOfBirth: (payload.dateOfBirth as string) || undefined,
    gender: (payload.gender as string) || undefined,
  };
};

const normalizeAuthResponse = (payload: unknown): AuthResponse => {
  const data = (payload ?? {}) as Record<string, unknown>;
  const token = String(data.token ?? "");
  const rawUser = (data.user ?? data.profile ?? null) as Record<string, unknown> | null;

  const user: AuthUser = rawUser
    ? {
      id: String(rawUser.id ?? rawUser._id ?? ""),
      firstName: (rawUser.firstName as string) || undefined,
      lastName: (rawUser.lastName as string) || undefined,
      name:
        (rawUser.name as string) ||
        [rawUser.firstName, rawUser.lastName].filter(Boolean).join(" ") ||
        undefined,
      email: String(rawUser.email ?? ""),
      role: normalizeRole(rawUser.role),
      phone: (rawUser.phone as string) || undefined,
      dateOfBirth: (rawUser.dateOfBirth as string) || undefined,
      gender: (rawUser.gender as string) || undefined,
    }
    : buildUserFromToken(token);

  return { token, user };
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

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const response = await apiRequest<Record<string, unknown>>("/auth/update-profile", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    const rawUser = (response.user ?? response.profile ?? response) as Record<string, unknown>;

    return {
      id: String(rawUser.id ?? rawUser._id ?? ""),
      firstName: (rawUser.firstName as string) || undefined,
      lastName: (rawUser.lastName as string) || undefined,
      name:
        (rawUser.name as string) ||
        [rawUser.firstName, rawUser.lastName].filter(Boolean).join(" ") ||
        undefined,
      email: String(rawUser.email ?? ""),
      role: normalizeRole(rawUser.role),
      phone: (rawUser.phone as string) || undefined,
      dateOfBirth: (rawUser.dateOfBirth as string) || undefined,
      gender: (rawUser.gender as string) || undefined,
    };
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiRequest<{ message?: string }>("/auth/change-password", {
      method: "PUT",
      body: payload,
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
      if (!parsed.token || !parsed.user) return null;
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
