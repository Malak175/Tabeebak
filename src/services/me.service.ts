import { apiRequest } from "@/services/api";
import { getDisplayName, normalizeRole } from "@/lib/auth";
import {
  AvatarUploadResponse,
  ChangePasswordRequest,
  MeResponse,
  MyProfileResponse,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload);

  if (record.data && typeof record.data === "object") {
    return asRecord(record.data);
  }

  return record;
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

const pickBoolean = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (typeof record[key] === "boolean") {
      return record[key] as boolean;
    }
  }

  return undefined;
};

const pickNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
};

const normalizeMeResponse = (payload: unknown): MeResponse => {
  const raw = unwrapPayload(payload);
  const firstName = pickString(raw, ["firstName", "first_name"]);
  const lastName = pickString(raw, ["lastName", "last_name"]);
  const nameFromFields = [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;
  const displayName =
    pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]) ??
    nameFromFields;

  return {
    id: String(raw.id ?? raw._id ?? raw.userId ?? ""),
    email: String(raw.email ?? ""),
    role: normalizeRole(raw.role),
    firstName,
    lastName,
    name: displayName,
    displayName,
    phone: pickString(raw, ["phone", "phoneNumber", "mobile"]),
    dateOfBirth: pickString(raw, ["dateOfBirth", "date_of_birth", "dob"]),
    gender: pickString(raw, ["gender"]),
    avatarUrl: pickString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]) ?? null,
    isEmailVerified: pickBoolean(raw, ["isEmailVerified", "emailVerified"]),
    isPhoneVerified: pickBoolean(raw, ["isPhoneVerified", "phoneVerified"]),
  };
};

const normalizeProfileResponse = (payload: unknown): MyProfileResponse => {
  const raw = unwrapPayload(payload);
  const base = normalizeMeResponse(raw);

  return {
    ...base,
    secondaryPhone: pickString(raw, ["secondaryPhone", "secondary_phone"]),
    addressLine1: pickString(raw, ["addressLine1", "address_line_1", "address1"]),
    addressLine2: pickString(raw, ["addressLine2", "address_line_2", "address2"]),
    city: pickString(raw, ["city"]),
    state: pickString(raw, ["state", "province"]),
    country: pickString(raw, ["country"]),
    postalCode: pickString(raw, ["postalCode", "postal_code", "zipCode", "zip_code"]),
    bio: pickString(raw, ["bio", "about"]),
  };
};

const normalizeMessage = (payload: unknown, fallback: string) => {
  const raw = unwrapPayload(payload);
  return { message: pickString(raw, ["message"]) ?? fallback };
};

const normalizeAvatarUploadResponse = (payload: unknown): AvatarUploadResponse => {
  const raw = unwrapPayload(payload);
  const avatarUrl =
    pickString(raw, ["avatarUrl", "avatar", "url", "imageUrl"]) ??
    pickString(asRecord(raw.data), ["avatarUrl", "avatar", "url", "imageUrl"]) ??
    "";

  return {
    avatarUrl,
    message: pickString(raw, ["message"]),
  };
};

const normalizeSettingsRecord = <T extends Record<string, string | number | boolean | null | undefined>>(
  payload: unknown,
): T => {
  const raw = unwrapPayload(payload);
  const normalized = Object.entries(raw).reduce<Record<string, string | number | boolean | null>>(
    (accumulator, [key, value]) => {
      if (
        typeof value === "boolean" ||
        typeof value === "string" ||
        typeof value === "number" ||
        value === null
      ) {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {},
  );

  return normalized as T;
};

const toFormData = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return formData;
};

export const meService = {
  getMe: async (): Promise<MeResponse> => {
    const response = await apiRequest<unknown>("/api/v1/auth/me", {
      method: "GET",
      auth: true,
    });

    return normalizeMeResponse(response);
  },

  getMyProfile: async (): Promise<MyProfileResponse> => {
    const response = await apiRequest<unknown>("/api/v1/me/profile", {
      method: "GET",
      auth: true,
    });

    return normalizeProfileResponse(response);
  },

  updateBasicInfo: async (payload: UpdateBasicInfoRequest): Promise<MyProfileResponse> => {
    const response = await apiRequest<unknown>("/api/v1/me/basic-info", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeProfileResponse(response);
  },

  updateContactInfo: async (payload: UpdateContactInfoRequest): Promise<MyProfileResponse> => {
    const response = await apiRequest<unknown>("/api/v1/me/contact-info", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeProfileResponse(response);
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const response = await apiRequest<unknown>("/api/v1/me/avatar", {
      method: "POST",
      body: toFormData(file),
      auth: true,
    });

    return normalizeAvatarUploadResponse(response);
  },

  deleteAvatar: async (): Promise<{ message: string }> => {
    const response = await apiRequest<unknown>("/api/v1/me/avatar", {
      method: "DELETE",
      auth: true,
    });

    return normalizeMessage(response, "Avatar removed successfully");
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiRequest<unknown>("/api/v1/me/password", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeMessage(response, "Password updated successfully");
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiRequest<unknown>("/api/v1/me/notification-preferences", {
      method: "GET",
      auth: true,
    });

    return normalizeSettingsRecord<NotificationPreferences>(response);
  },

  updateNotificationPreferences: async (
    payload: NotificationPreferences,
  ): Promise<NotificationPreferences> => {
    const response = await apiRequest<unknown>("/api/v1/me/notification-preferences", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeSettingsRecord<NotificationPreferences>(response);
  },

  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await apiRequest<unknown>("/api/v1/me/security-settings", {
      method: "GET",
      auth: true,
    });

    return normalizeSettingsRecord<SecuritySettings>(response);
  },

  updateSecuritySettings: async (payload: SecuritySettings): Promise<SecuritySettings> => {
    const response = await apiRequest<unknown>("/api/v1/me/security-settings", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeSettingsRecord<SecuritySettings>(response);
  },
};

export const meMappers = {
  normalizeMeResponse,
  normalizeProfileResponse,
  getDisplayName,
  pickNumber,
};
