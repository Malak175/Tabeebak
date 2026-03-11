import { apiRequest } from "@/services/api";
import type {
  Appointment,
  AppointmentFilterParams,
  LabOrder,
  LabOrderFilterParams,
  LabResult,
  LabResultFilterParams,
  LabResultMeasurement,
  PaginatedResponse,
  Prescription,
  PrescriptionFilterParams,
  PrescriptionMedication,
} from "@/types/patient-records.types";

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const pickNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
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

const pickBoolean = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
};

const pickRecord = (...values: unknown[]): Record<string, unknown> => {
  for (const value of values) {
    const record = asObject(value);

    if (Object.keys(record).length > 0) {
      return record;
    }
  }

  return {};
};

const unwrapEntity = (payload: unknown): Record<string, unknown> => {
  const record = asObject(payload);

  return pickRecord(
    record.data,
    record.result,
    record.item,
    record.appointment,
    record.prescription,
    record.labOrder,
    record.labResult,
    payload,
  );
};

const normalizeAppointment = (payload: unknown): Appointment => {
  const data = asObject(payload);
  const doctor = asObject(data.doctor);
  const scheduledAt =
    pickString(data.scheduledAt, data.dateTime, data.appointmentDate, data.startTime) ??
    undefined;

  return {
    id: String(data.id ?? data._id ?? data.appointmentId ?? ""),
    doctorId: pickString(data.doctorId, doctor.id),
    doctorName: pickString(
      data.doctorName,
      data.providerName,
      data.doctorFullName,
      doctor.name,
      doctor.fullName,
    ),
    specialty: pickString(data.specialty, doctor.specialty),
    status: pickString(data.status),
    type: pickString(data.type, data.appointmentType, data.mode),
    scheduledAt,
    date: pickString(data.date, data.appointmentDate, scheduledAt),
    time: pickString(data.time, data.appointmentTime),
    location: pickString(data.location, data.clinicName, data.room, data.address),
    reason: pickString(data.reason, data.chiefComplaint),
    notes: pickString(data.notes, data.note),
  };
};

const normalizePrescriptionMedication = (payload: unknown): PrescriptionMedication => {
  const data = asObject(payload);

  return {
    id: String(data.id ?? data._id ?? data.medicationId ?? data.name ?? ""),
    name: pickString(data.name, data.medicationName, data.drugName) ?? "Medication",
    dosage: pickString(data.dosage, data.dose),
    frequency: pickString(data.frequency),
    duration: pickString(data.duration),
    instructions: pickString(data.instructions, data.note),
  };
};

const normalizePrescription = (payload: unknown): Prescription => {
  const data = asObject(payload);
  const doctor = asObject(data.doctor);
  const prescriber = asObject(data.prescriber);
  const medications = Array.isArray(data.medications)
    ? data.medications.map(normalizePrescriptionMedication)
    : Array.isArray(data.items)
      ? data.items.map(normalizePrescriptionMedication)
      : [];

  return {
    id: String(data.id ?? data._id ?? data.prescriptionId ?? ""),
    doctorId: pickString(data.doctorId, data.prescriberId),
    doctorName: pickString(
      data.doctorName,
      data.prescriberName,
      doctor.name,
      prescriber.name,
    ),
    status: pickString(data.status),
    prescribedAt: pickString(data.prescribedAt, data.createdAt, data.issuedAt, data.date),
    diagnosis: pickString(data.diagnosis),
    notes: pickString(data.notes, data.note),
    medications,
  };
};

const normalizeLabOrder = (payload: unknown): LabOrder => {
  const data = asObject(payload);
  const doctor = asObject(data.doctor);
  const lab = asObject(data.lab);

  return {
    id: String(data.id ?? data._id ?? data.orderId ?? data.labOrderId ?? ""),
    orderedByDoctorId: pickString(data.orderedByDoctorId, data.doctorId),
    orderedByDoctorName: pickString(data.orderedByDoctorName, data.doctorName, doctor.name),
    testName: pickString(data.testName, data.name, data.panelName) ?? "Lab order",
    status: pickString(data.status),
    orderedAt: pickString(data.orderedAt, data.createdAt, data.date),
    scheduledAt: pickString(data.scheduledAt, data.collectionDate),
    labName: pickString(data.labName, lab.name),
    notes: pickString(data.notes, data.note),
  };
};

const normalizeLabResultMeasurement = (payload: unknown): LabResultMeasurement => {
  const data = asObject(payload);

  return {
    id: String(data.id ?? data._id ?? data.measurementId ?? data.name ?? ""),
    name: pickString(data.name, data.label, data.parameter) ?? "Measurement",
    value: pickString(data.value),
    unit: pickString(data.unit),
    range: pickString(data.range, data.referenceRange),
    status: pickString(data.status, data.flag),
  };
};

const normalizeLabResult = (payload: unknown): LabResult => {
  const data = asObject(payload);
  const lab = asObject(data.lab);
  const measurements = Array.isArray(data.measurements)
    ? data.measurements.map(normalizeLabResultMeasurement)
    : Array.isArray(data.values)
      ? data.values.map(normalizeLabResultMeasurement)
      : Array.isArray(data.results)
        ? data.results.map(normalizeLabResultMeasurement)
        : [];

  return {
    id: String(data.id ?? data._id ?? data.resultId ?? ""),
    labOrderId: pickString(data.labOrderId, data.orderId),
    doctorName: pickString(data.doctorName, data.orderedByDoctorName),
    labName: pickString(data.labName, lab.name),
    testName: pickString(data.testName, data.name, data.panelName) ?? "Lab result",
    status: pickString(data.status),
    resultDate: pickString(data.resultDate, data.completedAt, data.createdAt, data.date),
    notes: pickString(data.notes, data.note),
    summary: pickString(data.summary, data.interpretation),
    fileUrl: pickString(data.fileUrl, data.reportUrl, data.documentUrl),
    measurements,
  };
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  normalizeItem: (value: unknown) => T,
): PaginatedResponse<T> => {
  const record = asObject(payload);
  const nestedData = asObject(record.data);
  const itemsSource =
    record.items ?? record.results ?? record.rows ?? record.docs ?? nestedData.items ?? record.data;
  const items = Array.isArray(itemsSource) ? itemsSource.map(normalizeItem) : [];
  const meta = pickRecord(record.meta, record.pagination, nestedData.meta, record);
  const page = pickNumber(meta.page, meta.currentPage, record.page, 1) ?? 1;
  const limit = pickNumber(meta.limit, meta.pageSize, record.limit, items.length || 10) ?? 10;
  const total = pickNumber(meta.total, meta.totalItems, record.total, items.length) ?? items.length;
  const totalPages =
    pickNumber(meta.totalPages, record.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const hasNextPage =
    pickBoolean(meta.hasNextPage, record.hasNextPage) ?? page < totalPages;
  const hasPreviousPage =
    pickBoolean(meta.hasPreviousPage, record.hasPreviousPage) ?? page > 1;

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

const buildParams = (params?: Record<string, string | number | undefined>) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );

export const patientRecordsService = {
  async getAppointments(
    params?: AppointmentFilterParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments", {
      auth: true,
      params: buildParams(params),
    });

    return normalizePaginatedResponse(response, normalizeAppointment);
  },

  async getUpcomingAppointments(
    params?: AppointmentFilterParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments/upcoming", {
      auth: true,
      params: buildParams(params),
    });

    return normalizePaginatedResponse(response, normalizeAppointment);
  },

  async getAppointmentDetails(appointmentId: string): Promise<Appointment> {
    const response = await apiRequest<unknown>(
      `/api/v1/patients/me/appointments/${appointmentId}`,
      {
        auth: true,
      },
    );

    return normalizeAppointment(unwrapEntity(response));
  },

  async getPrescriptions(
    params?: PrescriptionFilterParams,
  ): Promise<PaginatedResponse<Prescription>> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/prescriptions", {
      auth: true,
      params: buildParams(params),
    });

    return normalizePaginatedResponse(response, normalizePrescription);
  },

  async getPrescriptionDetails(prescriptionId: string): Promise<Prescription> {
    const response = await apiRequest<unknown>(
      `/api/v1/patients/me/prescriptions/${prescriptionId}`,
      {
        auth: true,
      },
    );

    return normalizePrescription(unwrapEntity(response));
  },

  async getLabOrders(params?: LabOrderFilterParams): Promise<PaginatedResponse<LabOrder>> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-orders", {
      auth: true,
      params: buildParams(params),
    });

    return normalizePaginatedResponse(response, normalizeLabOrder);
  },

  async getLabResults(params?: LabResultFilterParams): Promise<PaginatedResponse<LabResult>> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-results", {
      auth: true,
      params: buildParams(params),
    });

    return normalizePaginatedResponse(response, normalizeLabResult);
  },

  async getLabResultDetails(resultId: string): Promise<LabResult> {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/lab-results/${resultId}`, {
      auth: true,
    });

    return normalizeLabResult(unwrapEntity(response));
  },
};
