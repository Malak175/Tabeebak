import type { UserRole } from "@/types/auth.types";

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface MyProfileResponse extends MeResponse {
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

export interface UpdateBasicInfoRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
}

export interface UpdateContactInfoRequest {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeoutMinutes: number;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  message?: string;
}
