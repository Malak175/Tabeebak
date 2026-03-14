import { apiRequest } from "@/services/api";
import {
  CreateLabBranchRequest,
  CreateLabServiceRequest,
  LabBranch,
  LabDashboardSummary,
  LabProfile,
  LabService,
  UpdateLabBranchRequest,
  UpdateLabProfileRequest,
  UpdateLabServiceRequest,
} from "@/types/lab-profile.types";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload);

  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return asRecord(record.data);
  }

  return record;
};

const unwrapListPayload = (payload: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);

  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  if (Array.isArray(record.data)) {
    return record.data as unknown[];
  }

  const nested = asRecord(record.data);
  for (const key of keys) {
    if (Array.isArray(nested[key])) {
      return nested[key] as unknown[];
    }
  }

  return [];
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
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

const pickNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const pickNullableNumber = (record: Record<string, unknown>, keys: string[]) =>
  pickNumber(record, keys) ?? null;

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

const joinAddress = (record: Record<string, unknown>) => {
  const parts = [
    pickNullableString(record, ["addressLine1", "address_line_1", "address1"]),
    pickNullableString(record, ["addressLine2", "address_line_2", "address2"]),
    pickNullableString(record, ["city"]),
    pickNullableString(record, ["state", "province"]),
    pickNullableString(record, ["country"]),
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
};

const normalizeLabDashboardSummary = (payload: unknown): LabDashboardSummary => {
  const raw = unwrapPayload(payload);

  return {
    labId: pickString(raw, ["labId", "id", "_id", "userId"]),
    displayName: pickString(raw, ["displayName", "display_name", "name"]),
    legalName: pickNullableString(raw, ["legalName", "legal_name", "registeredName"]),
    email: pickString(raw, ["email"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber", "mobile"]),
    accreditation: pickNullableString(raw, ["accreditation", "certification", "certificate"]),
    licenseNumber: pickNullableString(raw, ["licenseNumber", "license_number"]),
    totalBranchesCount: pickNullableNumber(raw, [
      "totalBranchesCount",
      "total_branches_count",
      "branchesCount",
    ]),
    activeBranchesCount: pickNullableNumber(raw, [
      "activeBranchesCount",
      "active_branches_count",
    ]),
    totalServicesCount: pickNullableNumber(raw, [
      "totalServicesCount",
      "total_services_count",
      "servicesCount",
    ]),
    activeServicesCount: pickNullableNumber(raw, [
      "activeServicesCount",
      "active_services_count",
    ]),
    pendingTestsCount: pickNullableNumber(raw, [
      "pendingTestsCount",
      "pending_tests_count",
      "pendingCount",
    ]),
    completedTestsToday: pickNullableNumber(raw, [
      "completedTestsToday",
      "completed_tests_today",
    ]),
    totalTestsThisMonth: pickNullableNumber(raw, [
      "totalTestsThisMonth",
      "total_tests_this_month",
      "testsThisMonth",
    ]),
    urgentTestsCount: pickNullableNumber(raw, [
      "urgentTestsCount",
      "urgent_tests_count",
      "urgentCount",
    ]),
    profileCompletionPercentage: pickNullableNumber(raw, [
      "profileCompletionPercentage",
      "profile_completion_percentage",
    ]),
    rating: pickNullableNumber(raw, ["rating", "averageRating", "average_rating"]),
    addressSummary: joinAddress(raw),
  };
};

const normalizeLabProfile = (payload: unknown): LabProfile => {
  const raw = unwrapPayload(payload);

  return {
    id: pickString(raw, ["id", "_id", "labId", "userId"]),
    displayName: pickString(raw, ["displayName", "display_name", "name"]),
    legalName: pickNullableString(raw, ["legalName", "legal_name", "registeredName"]),
    email: pickString(raw, ["email"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber", "mobile"]),
    alternatePhone: pickNullableString(raw, ["alternatePhone", "alternate_phone", "secondaryPhone"]),
    description: pickNullableString(raw, ["description", "about", "bio"]),
    accreditation: pickNullableString(raw, ["accreditation", "certification", "certificate"]),
    licenseNumber: pickNullableString(raw, ["licenseNumber", "license_number"]),
    taxNumber: pickNullableString(raw, ["taxNumber", "tax_number", "vatNumber", "vat_number"]),
    website: pickNullableString(raw, ["website", "websiteUrl", "website_url"]),
    addressLine1: pickNullableString(raw, ["addressLine1", "address_line_1", "address1"]),
    addressLine2: pickNullableString(raw, ["addressLine2", "address_line_2", "address2"]),
    city: pickNullableString(raw, ["city"]),
    state: pickNullableString(raw, ["state", "province"]),
    country: pickNullableString(raw, ["country"]),
    postalCode: pickNullableString(raw, ["postalCode", "postal_code", "zipCode", "zip_code"]),
    logoUrl: pickNullableString(raw, ["logoUrl", "logo", "imageUrl", "image_url"]),
    establishedYear: pickNullableNumber(raw, ["establishedYear", "established_year", "foundedYear"]),
    homeCollectionAvailable: pickBoolean(raw, [
      "homeCollectionAvailable",
      "home_collection_available",
      "supportsHomeCollection",
    ]) ?? null,
    isActive: pickBoolean(raw, ["isActive", "is_active", "active"]) ?? null,
  };
};

const normalizeLabBranch = (payload: unknown): LabBranch => {
  const raw = asRecord(payload);

  return {
    id: String(raw.id ?? raw._id ?? raw.branchId ?? raw.branch_id ?? ""),
    name: pickString(raw, ["name", "branchName", "branch_name"]),
    code: pickNullableString(raw, ["code", "branchCode", "branch_code"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber"]),
    email: pickNullableString(raw, ["email"]),
    addressLine1: pickNullableString(raw, ["addressLine1", "address_line_1", "address1"]),
    addressLine2: pickNullableString(raw, ["addressLine2", "address_line_2", "address2"]),
    city: pickNullableString(raw, ["city"]),
    state: pickNullableString(raw, ["state", "province"]),
    country: pickNullableString(raw, ["country"]),
    postalCode: pickNullableString(raw, ["postalCode", "postal_code", "zipCode", "zip_code"]),
    operatingHours: pickNullableString(raw, ["operatingHours", "operating_hours", "hours"]),
    isMainBranch: pickBoolean(raw, ["isMainBranch", "is_main_branch", "mainBranch"]) ?? null,
    isActive: pickBoolean(raw, ["isActive", "is_active", "active"]) ?? null,
  };
};

const normalizeLabService = (payload: unknown): LabService => {
  const raw = asRecord(payload);

  return {
    id: String(raw.id ?? raw._id ?? raw.serviceId ?? raw.service_id ?? ""),
    name: pickString(raw, ["name", "serviceName", "service_name"]),
    code: pickNullableString(raw, ["code", "serviceCode", "service_code"]),
    description: pickNullableString(raw, ["description", "details"]),
    category: pickNullableString(raw, ["category", "serviceCategory", "service_category"]),
    sampleType: pickNullableString(raw, ["sampleType", "sample_type"]),
    turnaroundTime: pickNullableString(raw, ["turnaroundTime", "turnaround_time", "duration"]),
    price: pickNullableNumber(raw, ["price", "amount", "cost"]),
    currency: pickNullableString(raw, ["currency"]),
    preparationInstructions: pickNullableString(raw, [
      "preparationInstructions",
      "preparation_instructions",
      "instructions",
    ]),
    isActive: pickBoolean(raw, ["isActive", "is_active", "active"]) ?? null,
  };
};

export const labProfileService = {
  getDashboardSummary: async (): Promise<LabDashboardSummary> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/dashboard-summary", {
      method: "GET",
      auth: true,
    });

    return normalizeLabDashboardSummary(response);
  },

  getProfile: async (): Promise<LabProfile> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/profile", {
      method: "GET",
      auth: true,
    });

    return normalizeLabProfile(response);
  },

  updateProfile: async (payload: UpdateLabProfileRequest): Promise<LabProfile> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeLabProfile(response);
  },

  getBranches: async (): Promise<LabBranch[]> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/branches", {
      method: "GET",
      auth: true,
    });

    return unwrapListPayload(response, ["branches", "items"]).map(normalizeLabBranch);
  },

  createBranch: async (payload: CreateLabBranchRequest): Promise<LabBranch> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/branches", {
      method: "POST",
      body: payload,
      auth: true,
    });

    return normalizeLabBranch(unwrapPayload(response));
  },

  updateBranch: async (
    branchId: string,
    payload: UpdateLabBranchRequest,
  ): Promise<LabBranch> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/branches/${branchId}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeLabBranch(unwrapPayload(response));
  },

  getServices: async (): Promise<LabService[]> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/services", {
      method: "GET",
      auth: true,
    });

    return unwrapListPayload(response, ["services", "items"]).map(normalizeLabService);
  },

  createService: async (payload: CreateLabServiceRequest): Promise<LabService> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/services", {
      method: "POST",
      body: payload,
      auth: true,
    });

    return normalizeLabService(unwrapPayload(response));
  },

  updateService: async (
    serviceId: string,
    payload: UpdateLabServiceRequest,
  ): Promise<LabService> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/services/${serviceId}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeLabService(unwrapPayload(response));
  },

  deleteService: async (serviceId: string): Promise<void> => {
    await apiRequest<unknown>(`/api/v1/labs/me/services/${serviceId}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
