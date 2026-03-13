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
}

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

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
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
  user: AuthUser;
}

export interface AuthStorage {
  token: string;
  user: AuthUser;
}
