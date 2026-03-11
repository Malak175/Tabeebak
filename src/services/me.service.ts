import { apiRequest } from "@/services/api";
import type {
  AvatarUploadResponse,
  ChangePasswordRequest,
  MeResponse,
  MyProfileResponse,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";
import type { AuthUser, UserRole } from "@/types/auth.types";

const normalizeRole = (value: unknown): UserRole => {
  const raw = String(value ?? "").toLowerCase();

  if (raw === "patient") return "Patient";
  if (raw === "doctor") return "Doctor";
  if (raw === "lab" || raw === "laboratory") return "Lab";
  return "Admin";
};

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asObject(payload);
  const nested =
    record.data ??
    record.result ??
    record.user ??
    record.profile ??
    record.preferences ??
    record.settings ??
    payload;

  return asObject(nested);
};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const pickBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const pickNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const normalizeMeResponse = (payload: unknown): MeResponse => {
  const data = unwrapPayload(payload);
  const firstName = pickString(data.firstName);
  const lastName = pickString(data.lastName);
  const combinedName = [firstName, lastName].filter(Boolean).join(" ");
  const name =
    pickString(data.name, data.fullName) ?? (combinedName || undefined);

  return {
    id: String(data.id ?? data._id ?? data.userId ?? ""),
    email: String(data.email ?? ""),
    role: normalizeRole(data.role),
    firstName,
    lastName,
    name,
    phone: pickString(data.phone, data.phoneNumber),
    dateOfBirth: pickString(data.dateOfBirth, data.birthDate),
    gender: pickString(data.gender),
    avatarUrl: pickString(data.avatarUrl, data.avatar, data.profileImageUrl),
    isEmailVerified: pickBoolean(data.isEmailVerified),
    isPhoneVerified: pickBoolean(data.isPhoneVerified),
  };
};

const normalizeMyProfileResponse = (payload: unknown): MyProfileResponse => {
  const summary = normalizeMeResponse(payload);
  const data = unwrapPayload(payload);

  return {
    ...summary,
    address: pickString(data.address),
    city: pickString(data.city),
    country: pickString(data.country),
    bio: pickString(data.bio, data.about),
  };
};

const normalizeNotificationPreferences = (payload: unknown): NotificationPreferences => {
  const data = unwrapPayload(payload);

  return {
    emailNotifications: pickBoolean(data.emailNotifications, true),
    smsNotifications: pickBoolean(data.smsNotifications),
    pushNotifications: pickBoolean(data.pushNotifications, true),
    appointmentReminders: pickBoolean(data.appointmentReminders, true),
    marketingEmails: pickBoolean(data.marketingEmails),
    securityAlerts: pickBoolean(data.securityAlerts, true),
  };
};

const normalizeSecuritySettings = (payload: unknown): SecuritySettings => {
  const data = unwrapPayload(payload);

  return {
    twoFactorEnabled: pickBoolean(data.twoFactorEnabled),
    loginAlerts: pickBoolean(data.loginAlerts, true),
    sessionTimeoutMinutes: pickNumber(data.sessionTimeoutMinutes, 30),
  };
};

export const toAuthUser = (me: MeResponse): AuthUser => ({
  id: me.id,
  firstName: me.firstName,
  lastName: me.lastName,
  name: me.name,
  email: me.email,
  role: me.role,
  phone: me.phone,
  dateOfBirth: me.dateOfBirth,
  gender: me.gender,
  avatarUrl: me.avatarUrl,
});

export const meService = {
  async getMe(): Promise<MeResponse> {
    const response = await apiRequest<unknown>("/api/v1/auth/me", {
      auth: true,
    });

    return normalizeMeResponse(response);
  },

  async getMyProfile(): Promise<MyProfileResponse> {
    const response = await apiRequest<unknown>("/api/v1/me/profile", {
      auth: true,
    });

    return normalizeMyProfileResponse(response);
  },

  async updateBasicInfo(payload: UpdateBasicInfoRequest): Promise<MyProfileResponse> {
    const response = await apiRequest<unknown>("/api/v1/me/basic-info", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeMyProfileResponse(response);
  },

  async updateContactInfo(payload: UpdateContactInfoRequest): Promise<MyProfileResponse> {
    const response = await apiRequest<unknown>("/api/v1/me/contact-info", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeMyProfileResponse(response);
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiRequest<unknown>("/api/v1/me/avatar", {
      method: "POST",
      body: formData,
      auth: true,
    });

    const data = unwrapPayload(response);

    return {
      avatarUrl: pickString(data.avatarUrl, data.avatar, data.profileImageUrl) ?? "",
      message: pickString(data.message),
    };
  },

  async deleteAvatar(): Promise<{ message: string }> {
    const response = await apiRequest<Record<string, unknown>>("/api/v1/me/avatar", {
      method: "DELETE",
      auth: true,
    });

    return {
      message: pickString(response.message) ?? "Avatar deleted successfully.",
    };
  },

  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiRequest<Record<string, unknown>>("/api/v1/me/password", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return {
      message: pickString(response.message) ?? "Password updated successfully.",
    };
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await apiRequest<unknown>("/api/v1/me/notification-preferences", {
      auth: true,
    });

    return normalizeNotificationPreferences(response);
  },

  async updateNotificationPreferences(
    payload: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    const response = await apiRequest<unknown>("/api/v1/me/notification-preferences", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeNotificationPreferences(response);
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await apiRequest<unknown>("/api/v1/me/security-settings", {
      auth: true,
    });

    return normalizeSecuritySettings(response);
  },

  async updateSecuritySettings(payload: SecuritySettings): Promise<SecuritySettings> {
    const response = await apiRequest<unknown>("/api/v1/me/security-settings", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeSecuritySettings(response);
  },
};
