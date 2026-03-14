import { UserRole } from "@/types/auth.types";

type SettingsValue = string | number | boolean | null;

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  [key: string]: unknown;
}

export interface MyProfileResponse extends MeResponse {
  secondaryPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
}

export interface UpdateBasicInfoRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface UpdateContactInfoRequest {
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  appointmentReminders?: boolean;
  marketingEnabled?: boolean;
  [key: string]: SettingsValue | undefined;
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean;
  loginNotifications?: boolean;
  sessionTimeoutMinutes?: number;
  trustedDeviceGracePeriodDays?: number;
  [key: string]: SettingsValue | undefined;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  message?: string;
}
