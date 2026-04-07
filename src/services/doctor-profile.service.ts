import { apiRequest } from "@/services/api";
import {
  DoctorAvailability,
  DoctorAvailabilityDay,
  DoctorAvailabilityDaySchedule,
  DoctorAvailabilitySlot,
  DoctorDashboardSummary,
  DoctorProfessionalProfile,
  DoctorProfile,
  UpdateDoctorAvailabilityRequest,
  UpdateDoctorProfessionalProfileRequest,
  UpdateDoctorProfileRequest,
} from "@/types/doctor-profile.types";

const WEEK_DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const WEEK_DAY_LABELS: Record<(typeof WEEK_DAY_ORDER)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

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
      return value.trim();
    }
  }

  return undefined;
};

const pickIdentifier = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
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

const pickNullableNumber = (record: Record<string, unknown>, keys: string[]) => {
  const value = pickNumber(record, keys);
  return value ?? null;
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

const pickStringArray = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
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

const parseJsonValue = (value: unknown) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeSlot = (payload: unknown): DoctorAvailabilitySlot | null => {
  const raw = asRecord(payload);
  const startTime =
    pickString(raw, ["startTime", "start_time", "from", "start"]) ?? "";
  const endTime =
    pickString(raw, ["endTime", "end_time", "to", "end"]) ?? "";

  if (!startTime || !endTime) return null;

  return { startTime, endTime };
};

const normalizeAvailabilityDaySchedule = (
  payload: unknown,
  fallbackDay?: string,
): DoctorAvailabilityDaySchedule => {
  const raw = asRecord(payload);
  const dayOfWeek = normalizeDayName(
    pickString(raw, ["dayOfWeek", "day_of_week", "day", "weekday"]) ?? fallbackDay,
  );
  const slotsSource =
    (Array.isArray(raw.slots) && raw.slots) ||
    (Array.isArray(raw.timeSlots) && raw.timeSlots) ||
    (Array.isArray(raw.intervals) && raw.intervals) ||
    [];
  const slots = (slotsSource as unknown[])
    .map(normalizeSlot)
    .filter((slot): slot is DoctorAvailabilitySlot => Boolean(slot));

  return {
    dayOfWeek,
    isAvailable: pickBoolean(raw, ["isAvailable", "is_available", "available", "enabled"]) ?? slots.length > 0,
    slots,
    breakStartTime: pickNullableString(raw, ["breakStartTime", "break_start_time", "breakFrom"]),
    breakEndTime: pickNullableString(raw, ["breakEndTime", "break_end_time", "breakTo"]),
    maxAppointments: pickNullableNumber(raw, ["maxAppointments", "max_appointments", "capacity"]),
  };
};

const normalizeWeeklyScheduleJson = (payload: unknown): DoctorAvailabilityDaySchedule[] | null => {
  const parsed = parseJsonValue(payload);
  if (!parsed) return null;

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => normalizeAvailabilityDaySchedule(item))
      .filter((day) => Boolean(day.dayOfWeek));
  }

  const record = asRecord(parsed);
  const daysSource =
    (Array.isArray(record.days) && record.days) ||
    (Array.isArray(record.weeklySchedule) && record.weeklySchedule) ||
    (Array.isArray(record.weekly_schedule) && record.weekly_schedule) ||
    null;

  if (daysSource) {
    return (daysSource as unknown[])
      .map((item) => normalizeAvailabilityDaySchedule(item))
      .filter((day) => Boolean(day.dayOfWeek));
  }

  const keyedDays = WEEK_DAY_ORDER.map((day) =>
    normalizeAvailabilityDaySchedule(record[day] ?? {}, WEEK_DAY_LABELS[day]),
  ).filter((day) => Boolean(day.dayOfWeek));

  return keyedDays.length ? keyedDays : null;
};

const normalizeWeeklyScheduleObject = (
  payload: unknown,
): DoctorAvailabilityDaySchedule[] | null => {
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return null;
  const record = asRecord(payload);
  const entries = Object.entries(record);
  if (!entries.length) return null;

  const days = entries
    .map(([key, value]) => {
      const dayLabel = normalizeDayName(key);
      const slotsSource = Array.isArray(value) ? value : [];
      const slots = slotsSource
        .map(normalizeSlot)
        .filter((slot): slot is DoctorAvailabilitySlot => Boolean(slot));

      return {
        dayOfWeek: dayLabel,
        isAvailable: slots.length > 0,
        slots,
      } satisfies DoctorAvailabilityDaySchedule;
    })
    .filter((day) => Boolean(day.dayOfWeek));

  return days.length ? days : null;
};

const normalizeDayName = (value: string | null | undefined) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "";

  if (normalized.length === 3) {
    const matched = WEEK_DAY_ORDER.find((day) => day.startsWith(normalized));
    return matched ? WEEK_DAY_LABELS[matched] : normalized;
  }

  return WEEK_DAY_LABELS[normalized as (typeof WEEK_DAY_ORDER)[number]] ?? normalized;
};

const normalizeDoctorDashboardSummary = (payload: unknown): DoctorDashboardSummary => {
  const raw = unwrapPayload(payload);
  const counts = mergeRecords(
    pickRecord(raw, ["counts", "count", "stats", "metrics", "summary"]),
    pickRecord(raw, ["dashboard", "dashboardSummary", "dashboard_summary"]),
  );
  const quickStats = mergeRecords(
    pickRecord(raw, ["quickStats", "quick_stats"]),
    pickRecord(raw, ["stats", "summary", "metrics"]),
  );
  const todayQueueSource =
    (Array.isArray(raw.todayQueue) && raw.todayQueue) ||
    (Array.isArray(raw.today_queue) && raw.today_queue) ||
    (Array.isArray(raw.queue) && raw.queue) ||
    (Array.isArray(raw.queueItems) && raw.queueItems) ||
    (Array.isArray(asRecord(raw.todayQueue).items) && asRecord(raw.todayQueue).items) ||
    [];
  const todayQueue = todayQueueSource.map((item) => {
    const record = asRecord(item);
    const patient = mergeRecords(
      pickRecord(record, ["patient", "patientProfile", "patientDetails"]),
      pickRecord(record, ["patientInfo", "profile"]),
    );
    const appointment = mergeRecords(
      pickRecord(record, ["appointment", "appointmentDetails", "appointmentInfo"]),
      pickRecord(record, ["appointmentRecord"]),
    );

    return {
      id:
        pickIdentifier(record, ["id", "_id", "appointmentId", "appointment_id"]) ??
        pickIdentifier(appointment, ["id", "_id", "appointmentId", "appointment_id"]) ??
        pickIdentifier(patient, ["id", "_id", "patientId", "patient_id"]),
      patientId:
        pickIdentifier(record, ["patientId", "patient_id"]) ??
        pickIdentifier(patient, ["id", "_id", "patientId", "patient_id"]) ??
        null,
      patientName:
        pickString(record, ["patientName", "patient_name", "fullName", "full_name", "name"]) ??
        pickString(patient, ["fullName", "full_name", "displayName", "name"]) ??
        "Patient",
      status:
        pickNullableString(record, ["status", "appointmentStatus", "appointment_status"]) ??
        pickNullableString(appointment, ["status", "appointmentStatus", "appointment_status"]),
      reason:
        pickNullableString(record, ["reason", "chiefComplaint", "chief_complaint", "complaint"]) ??
        pickNullableString(appointment, ["reason", "chiefComplaint", "chief_complaint", "complaint"]),
      scheduledAt:
        pickNullableString(record, [
          "scheduledAt",
          "scheduled_at",
          "appointmentDateTime",
          "appointment_datetime",
          "startAt",
          "start_at",
        ]) ??
        pickNullableString(appointment, [
          "scheduledAt",
          "scheduled_at",
          "appointmentDateTime",
          "appointment_datetime",
          "startAt",
          "start_at",
        ]),
    };
  });
  const professional = mergeRecords(
    pickRecord(raw, ["professionalProfile", "professional_profile"]),
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
  );
  const quickStatsTotalPatients =
    pickNullableNumber(quickStats, [
      "totalPatients",
      "total_patients",
      "totalPatientsCount",
      "total_patients_count",
      "patientsCount",
      "patientCount",
    ]) ?? null;

  return {
    doctorId: pickString(raw, ["doctorId", "id", "_id", "userId"]),
    firstName: pickString(raw, ["firstName", "first_name"]),
    lastName: pickString(raw, ["lastName", "last_name"]),
    displayName: pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]),
    email: pickString(raw, ["email"]),
    specialty:
      pickString(raw, ["specialty", "specialization"]) ??
      pickString(professional, ["specialty", "specialization"]),
    subspecialty:
      pickNullableString(raw, ["subspecialty", "sub_specialty"]) ??
      pickNullableString(professional, ["subspecialty", "sub_specialty"]),
    clinicName:
      pickNullableString(raw, ["clinicName", "clinic_name"]) ??
      pickNullableString(professional, ["clinicName", "clinic_name"]),
    yearsOfExperience:
      pickNullableNumber(raw, ["yearsOfExperience", "years_of_experience", "experienceYears"]) ??
      pickNullableNumber(professional, ["yearsOfExperience", "years_of_experience", "experienceYears"]),
    rating: pickNullableNumber(raw, ["rating", "averageRating", "average_rating"]),
    totalPatientsCount: pickNullableNumber(raw, [
      "totalPatientsCount",
      "total_patients_count",
      "patientsCount",
      "patientCount",
      "totalPatients",
      "total_patients",
    ]) ?? pickNullableNumber(counts, [
      "totalPatientsCount",
      "total_patients_count",
      "patientsCount",
      "patientCount",
      "totalPatients",
      "total_patients",
    ]) ?? quickStatsTotalPatients,
    totalAppointmentsToday: pickNullableNumber(raw, [
      "totalAppointmentsToday",
      "total_appointments_today",
      "appointmentsToday",
      "todayAppointments",
      "todaysAppointments",
      "today_appointments",
    ]) ?? pickNullableNumber(counts, [
      "totalAppointmentsToday",
      "total_appointments_today",
      "appointmentsToday",
      "todayAppointments",
      "todaysAppointments",
      "today_appointments",
    ]),
    completedAppointmentsToday: pickNullableNumber(raw, [
      "completedAppointmentsToday",
      "completed_appointments_today",
      "completedToday",
      "completed_today",
    ]) ?? pickNullableNumber(counts, [
      "completedAppointmentsToday",
      "completed_appointments_today",
      "completedToday",
      "completed_today",
    ]),
    upcomingAppointmentsToday: pickNullableNumber(raw, [
      "upcomingAppointmentsToday",
      "upcoming_appointments_today",
      "upcomingToday",
      "upcoming_today",
    ]) ?? pickNullableNumber(counts, [
      "upcomingAppointmentsToday",
      "upcoming_appointments_today",
      "upcomingToday",
      "upcoming_today",
    ]),
    pendingAppointmentRequestsCount: pickNullableNumber(raw, [
      "pendingAppointmentRequestsCount",
      "pending_appointment_requests_count",
      "pendingRequestsCount",
      "pendingRequests",
      "pending_requests",
    ]) ?? pickNullableNumber(counts, [
      "pendingAppointmentRequestsCount",
      "pending_appointment_requests_count",
      "pendingRequestsCount",
      "pendingRequests",
      "pending_requests",
    ]),
    nextAvailableSlot: pickNullableString(raw, [
      "nextAvailableSlot",
      "next_available_slot",
      "nextAvailability",
    ]),
    profileCompletionPercentage: pickNullableNumber(raw, [
      "profileCompletionPercentage",
      "profile_completion_percentage",
      "completionPercentage",
    ]),
    quickStats: {
      totalPatients: quickStatsTotalPatients,
      totalPatientsCount: quickStatsTotalPatients,
      pendingRequests:
        pickNullableNumber(quickStats, [
          "pendingRequests",
          "pending_requests",
          "pendingRequestsCount",
          "pending_requests_count",
        ]) ?? null,
      pendingRequestsCount:
        pickNullableNumber(quickStats, [
          "pendingRequests",
          "pending_requests",
          "pendingRequestsCount",
          "pending_requests_count",
        ]) ?? null,
    },
    todayQueue,
  };
};

const normalizeDoctorProfile = (payload: unknown): DoctorProfile => {
  const raw = unwrapPayload(payload);

  return {
    id: pickString(raw, ["id", "_id", "doctorId", "userId"]),
    email: pickString(raw, ["email"]),
    firstName: pickString(raw, ["firstName", "first_name"]),
    lastName: pickString(raw, ["lastName", "last_name"]),
    displayName: pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]),
    phone: pickString(raw, ["phone", "phoneNumber", "mobile"]),
    alternatePhone: pickString(raw, ["alternatePhone", "alternate_phone", "secondaryPhone"]),
    dateOfBirth: pickString(raw, ["dateOfBirth", "date_of_birth", "dob"]),
    gender: pickString(raw, ["gender"]),
    addressLine1: pickString(raw, ["addressLine1", "address_line_1", "address1"]),
    addressLine2: pickString(raw, ["addressLine2", "address_line_2", "address2"]),
    city: pickString(raw, ["city"]),
    state: pickString(raw, ["state", "province"]),
    country: pickString(raw, ["country"]),
    postalCode: pickString(raw, ["postalCode", "postal_code", "zipCode", "zip_code"]),
    bio: pickString(raw, ["bio", "about"]),
    avatarUrl: pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
  };
};

const normalizeDoctorProfessionalProfile = (payload: unknown): DoctorProfessionalProfile => {
  const raw = unwrapPayload(payload);

  return {
    specialty: pickString(raw, ["specialty", "specialization"]),
    subspecialty: pickNullableString(raw, ["subspecialty", "sub_specialty"]),
    licenseNumber: pickString(raw, ["licenseNumber", "license_number", "registrationNumber"]),
    yearsOfExperience: pickNullableNumber(raw, [
      "yearsOfExperience",
      "years_of_experience",
      "experienceYears",
    ]),
    consultationFee: pickNullableNumber(raw, [
      "consultationFee",
      "consultation_fee",
      "fee",
      "consultationPrice",
    ]),
    about: pickString(raw, ["about", "bio", "summary"]),
    education: pickStringArray(raw, ["education", "degrees"]),
    certifications: pickStringArray(raw, ["certifications", "licenses"]),
    languages: pickStringArray(raw, ["languages", "spokenLanguages", "spoken_languages"]),
    clinicName: pickString(raw, ["clinicName", "clinic_name"]),
    clinicAddress: pickString(raw, ["clinicAddress", "clinic_address", "address"]),
    hospitalAffiliations: pickStringArray(raw, [
      "hospitalAffiliations",
      "hospital_affiliations",
      "affiliations",
    ]),
    servicesOffered: pickStringArray(raw, [
      "servicesOffered",
      "services_offered",
      "services",
    ]),
  };
};

const normalizeAvailabilityDay = (payload: unknown, fallbackDay?: string): DoctorAvailabilityDay => {
  const raw = asRecord(payload);
  const dayOfWeek = normalizeDayName(
    pickString(raw, ["dayOfWeek", "day_of_week", "day", "weekday"]) ?? fallbackDay,
  );

  return {
    dayOfWeek,
    isAvailable:
      pickBoolean(raw, ["isAvailable", "is_available", "available", "enabled"]) ?? false,
    startTime: pickNullableString(raw, ["startTime", "start_time", "from"]),
    endTime: pickNullableString(raw, ["endTime", "end_time", "to"]),
    breakStartTime: pickNullableString(raw, ["breakStartTime", "break_start_time", "breakFrom"]),
    breakEndTime: pickNullableString(raw, ["breakEndTime", "break_end_time", "breakTo"]),
    maxAppointments: pickNullableNumber(raw, [
      "maxAppointments",
      "max_appointments",
      "capacity",
    ]),
  };
};

const normalizeDoctorAvailability = (payload: unknown): DoctorAvailability => {
  const raw = unwrapPayload(payload);
  const scheduleContainer = mergeRecords(
    pickRecord(raw, ["weeklySchedule", "weekly_schedule"]),
    pickRecord(raw, ["schedule"]),
  );
  const weeklyScheduleObject =
    normalizeWeeklyScheduleObject(raw.weeklySchedule) ??
    normalizeWeeklyScheduleObject(raw.weekly_schedule) ??
    normalizeWeeklyScheduleObject(scheduleContainer.weeklySchedule) ??
    normalizeWeeklyScheduleObject(scheduleContainer.weekly_schedule);
  const weeklyScheduleJson =
    weeklyScheduleObject ??
    normalizeWeeklyScheduleJson(
      raw.weekly_schedule_json ??
        raw.weeklyScheduleJson ??
        scheduleContainer.weekly_schedule_json ??
        scheduleContainer.weeklyScheduleJson,
    ) ??
    null;

  const daysSource =
    (Array.isArray(raw.weeklySchedule) && raw.weeklySchedule) ||
    (Array.isArray(raw.weekly_schedule) && raw.weekly_schedule) ||
    (Array.isArray(raw.days) && raw.days) ||
    (Array.isArray(scheduleContainer.days) && scheduleContainer.days) ||
    null;

  const weeklySchedule = daysSource
    ? (daysSource as unknown[]).map((item) => normalizeAvailabilityDay(item))
    : WEEK_DAY_ORDER.map((day) =>
        normalizeAvailabilityDay(
          scheduleContainer[day] ?? raw[day] ?? {},
          WEEK_DAY_LABELS[day],
        ),
      );

  return {
    timezone:
      pickString(raw, ["timezone", "timeZone"]) ??
      pickString(scheduleContainer, ["timezone", "timeZone"]),
    appointmentDurationMinutes:
      pickNullableNumber(raw, [
        "appointmentDurationMinutes",
        "appointment_duration_minutes",
        "slotDurationMinutes",
      ]) ??
      pickNullableNumber(scheduleContainer, [
        "appointmentDurationMinutes",
        "appointment_duration_minutes",
        "slotDurationMinutes",
      ]),
    bufferBetweenAppointmentsMinutes:
      pickNullableNumber(raw, [
        "bufferBetweenAppointmentsMinutes",
        "buffer_between_appointments_minutes",
        "bufferMinutes",
      ]) ??
      pickNullableNumber(scheduleContainer, [
        "bufferBetweenAppointmentsMinutes",
        "buffer_between_appointments_minutes",
        "bufferMinutes",
      ]),
    notes:
      pickNullableString(raw, ["notes", "availabilityNotes", "availability_notes"]) ??
      pickNullableString(scheduleContainer, ["notes", "availabilityNotes", "availability_notes"]),
    weeklySchedule: weeklySchedule
      .filter((day) => Boolean(day.dayOfWeek))
      .sort(
        (left, right) =>
          WEEK_DAY_ORDER.indexOf(left.dayOfWeek.toLowerCase() as (typeof WEEK_DAY_ORDER)[number]) -
          WEEK_DAY_ORDER.indexOf(right.dayOfWeek.toLowerCase() as (typeof WEEK_DAY_ORDER)[number]),
      ),
    weeklyScheduleJson,
  };
};

export const doctorProfileService = {
  getDashboardSummary: async (): Promise<DoctorDashboardSummary> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/dashboard-summary", {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorDashboardSummary(response);
  },

  getProfile: async (): Promise<DoctorProfile> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/profile", {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorProfile(response);
  },

  updateProfile: async (payload: UpdateDoctorProfileRequest): Promise<DoctorProfile> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeDoctorProfile(response);
  },

  getProfessionalProfile: async (): Promise<DoctorProfessionalProfile> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/professional-profile", {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorProfessionalProfile(response);
  },

  updateProfessionalProfile: async (
    payload: UpdateDoctorProfessionalProfileRequest,
  ): Promise<DoctorProfessionalProfile> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/professional-profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeDoctorProfessionalProfile(response);
  },

  getAvailability: async (): Promise<DoctorAvailability> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/availability", {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorAvailability(response);
  },

  updateAvailability: async (
    payload: UpdateDoctorAvailabilityRequest,
  ): Promise<DoctorAvailability> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/availability", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    return normalizeDoctorAvailability(response);
  },
};
