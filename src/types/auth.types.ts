import type { MeResponse } from "@/types/me.types";

export type UserRole = "Patient" | "Doctor" | "Lab" | "Admin";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  role?: "Patient";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user?: MeResponse | null;
}

export interface AuthStorage {
  token: string;
  user?: MeResponse | null;
}
