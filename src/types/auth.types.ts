export type UserRole = "Patient" | "Doctor" | "Lab" | "Admin";

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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
  user: AuthUser;
}

export interface AuthTokenResponse {
  token: string;
}

export interface AuthStorage {
  token: string;
  user: AuthUser | null;
}
