import { apiRequest, API_BASE_URL } from "@/services/api";
import { getDisplayName, normalizeRole } from "@/lib/auth";
import {
  AvatarUploadResponse,
  ChangePasswordRequest,
  MeResponse,
  MyProfileResponse,
  NotificationItem,
  NotificationPreferences,
  NotificationsFilterParams,
  PaginatedItemsResponse,
  SecuritySettings,
  SessionItem,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const mergeRecords = (...values: unknown[]) =>
  values.reduce<Record<string, unknown>>((result, value) => {
    Object.assign(result, asRecord(value));
    return result;
  }, {});

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload);

  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
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
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }

    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
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

const pickNullableString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const normalized = value.trim();
      return normalized || null;
    }
  }

  return null;
};

const pickRecord = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return asRecord(value);
    }
  }

  return {};
};

const normalizeAvatarUrl = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `http:${trimmed}`;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};

const getListEnvelope = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: {},
    };
  }

  const raw = asRecord(payload);
  const data = raw.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: mergeRecords(raw, raw.meta, raw.pagination),
    };
  }

  const container = asRecord(data);
  const candidates = [
    container.items,
    container.results,
    container.records,
    container.notifications,
    container.sessions,
    raw.items,
    raw.results,
    raw.records,
    raw.notifications,
    raw.sessions,
  ];

  const items = candidates.find(Array.isArray) as unknown[] | undefined;

  return {
    items: items ?? [],
    meta: mergeRecords(raw, raw.meta, raw.pagination, container, container.meta, container.pagination),
  };
};

const buildQueryParams = <T extends Record<string, unknown>>(params?: T) => {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  );
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  mapItem: (value: unknown) => T,
): PaginatedItemsResponse<T> => {
  const { items, meta } = getListEnvelope(payload);
  const page = pickNumber(meta, ["page", "currentPage", "pageNumber"]) ?? 1;
  const limit =
    pickNumber(meta, ["limit", "perPage", "pageSize", "size"]) ??
    (items.length > 0 ? items.length : 10);
  const total = pickNumber(meta, ["total", "totalCount", "totalItems", "count"]) ?? items.length;
  const totalPages =
    pickNumber(meta, ["totalPages", "pageCount", "pages"]) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const hasNextPage =
    pickBoolean(meta, ["hasNextPage", "hasMore", "has_next_page"]) ?? page < totalPages;
  const hasPreviousPage =
    pickBoolean(meta, ["hasPreviousPage", "hasPrevPage", "has_previous_page"]) ?? page > 1;

  return {
    data: items.map(mapItem),
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
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
    avatarUrl: normalizeAvatarUrl(
      pickString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]) ?? null,
    ),
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
  const fileRecord = pickRecord(raw, ["file", "uploadedFile", "upload"]);
  const avatarUrl = normalizeAvatarUrl(
    pickString(raw, ["avatarUrl", "avatar", "url", "imageUrl", "fileUrl", "file", "path"]) ??
      pickString(asRecord(raw.data), [
        "avatarUrl",
        "avatar",
        "url",
        "imageUrl",
        "fileUrl",
        "file",
        "path",
      ]) ??
      pickString(fileRecord, ["avatarUrl", "url", "imageUrl", "fileUrl", "path"]) ??
      "",
  );

  return {
    avatarUrl: avatarUrl ?? "",
    message: pickString(raw, ["message"]),
  };
};

const normalizeNotification = (payload: unknown): NotificationItem => {
  const raw = unwrapPayload(payload);

  return {
    id: String(raw.id ?? raw._id ?? raw.notificationId ?? raw.notification_id ?? ""),
    title:
      pickString(raw, ["title", "subject", "headline", "name"]) ??
      "Notification",
    message:
      pickString(raw, ["message", "body", "content", "description"]) ??
      "No notification content was returned.",
    type: pickNullableString(raw, ["type", "category", "channel"]),
    isRead: pickBoolean(raw, ["isRead", "read", "is_read"]) ?? false,
    createdAt: pickNullableString(raw, ["createdAt", "created_at", "sentAt", "timestamp"]),
    readAt: pickNullableString(raw, ["readAt", "read_at", "seenAt"]),
    actionUrl: pickNullableString(raw, ["actionUrl", "action_url", "link", "url"]),
    metadata:
      Object.keys(pickRecord(raw, ["metadata", "meta", "payload"])).length > 0
        ? pickRecord(raw, ["metadata", "meta", "payload"])
        : null,
  };
};

const normalizeSession = (payload: unknown): SessionItem => {
  const raw = unwrapPayload(payload);
  const device = mergeRecords(pickRecord(raw, ["device", "client"]));

  return {
    id: String(raw.id ?? raw._id ?? raw.sessionId ?? raw.session_id ?? ""),
    deviceName:
      pickString(raw, ["deviceName", "device_name", "name"]) ??
      pickString(device, ["name", "label"]) ??
      "Unknown device",
    deviceType:
      pickNullableString(raw, ["deviceType", "device_type", "platform"]) ??
      pickNullableString(device, ["type", "platform"]),
    browser:
      pickNullableString(raw, ["browser", "browserName", "browser_name"]) ??
      pickNullableString(device, ["browser", "browserName"]),
    operatingSystem:
      pickNullableString(raw, ["operatingSystem", "operating_system", "os"]) ??
      pickNullableString(device, ["operatingSystem", "os"]),
    ipAddress: pickNullableString(raw, ["ipAddress", "ip_address", "ip"]),
    location: pickNullableString(raw, ["location", "city", "region"]),
    isCurrent: pickBoolean(raw, ["isCurrent", "current", "is_current"]) ?? false,
    lastActiveAt: pickNullableString(raw, ["lastActiveAt", "last_active_at", "updatedAt", "updated_at"]),
    createdAt: pickNullableString(raw, ["createdAt", "created_at", "loggedInAt", "loginAt"]),
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
  formData.append("file", file);
  console.log("[Avatar Upload] FormData file", formData.get("file"));
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

  getNotifications: async (
    params?: NotificationsFilterParams,
  ): Promise<PaginatedItemsResponse<NotificationItem>> => {
    const response = await apiRequest<unknown>("/api/v1/me/notifications", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeNotification);
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await apiRequest<unknown>(`/api/v1/me/notifications/${notificationId}/read`, {
      method: "PATCH",
      auth: true,
    });

    return normalizeMessage(response, "Notification marked as read");
  },

  markAllNotificationsAsRead: async (): Promise<{ message: string }> => {
    const response = await apiRequest<unknown>("/api/v1/me/notifications/read-all", {
      method: "PATCH",
      auth: true,
    });

    return normalizeMessage(response, "All notifications marked as read");
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

  getSessions: async (): Promise<SessionItem[]> => {
    const response = await apiRequest<unknown>("/api/v1/me/sessions", {
      method: "GET",
      auth: true,
    });

    return getListEnvelope(response).items.map(normalizeSession);
  },

  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await apiRequest<unknown>(`/api/v1/me/sessions/${sessionId}`, {
      method: "DELETE",
      auth: true,
    });

    return normalizeMessage(response, "Session revoked successfully");
  },
};

export const meMappers = {
  normalizeMeResponse,
  normalizeProfileResponse,
  getDisplayName,
  pickNumber,
};
