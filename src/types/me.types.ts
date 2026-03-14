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

export interface PaginatedItemsResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  isRead: boolean;
  createdAt?: string | null;
  readAt?: string | null;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SessionItem {
  id: string;
  deviceName: string;
  deviceType?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  ipAddress?: string | null;
  location?: string | null;
  isCurrent: boolean;
  lastActiveAt?: string | null;
  createdAt?: string | null;
}
