import { apiRequest } from "@/services/api";
import {
  LabOrder,
  LabOrderDetails,
  LabOrdersFilterParams,
  LabResult,
  LabResultsFilterParams,
  PaginatedResponse,
  ReviewLabOrderRequest,
  SampleCollectionRequest,
  SampleCollectionRequestFilterParams,
  UpdateLabOrderStatusRequest,
  UploadLabResultRequest,
  UploadLabResultValue,
} from "@/types/lab-workflow.types";

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

const pickRecord = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return asRecord(value);
    }
  }

  return {};
};

const pickStringArray = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  }

  return [];
};

const joinAddress = (record: Record<string, unknown>) => {
  const parts = [
    pickNullableString(record, ["address", "addressLine1", "address_line_1", "address1"]),
    pickNullableString(record, ["addressLine2", "address_line_2", "address2"]),
    pickNullableString(record, ["city"]),
    pickNullableString(record, ["state", "province"]),
    pickNullableString(record, ["country"]),
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
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
    container.orders,
    container.labOrders,
    container.lab_orders,
    container.pendingOrders,
    container.pending_orders,
    container.sampleCollectionRequests,
    container.sample_collection_requests,
    raw.items,
    raw.results,
    raw.orders,
    raw.labOrders,
    raw.lab_orders,
    raw.pendingOrders,
    raw.pending_orders,
    raw.sampleCollectionRequests,
    raw.sample_collection_requests,
  ];

  const items = candidates.find(Array.isArray) as unknown[] | undefined;

  return {
    items: items ?? [],
    meta: mergeRecords(raw, raw.meta, raw.pagination, container, container.meta, container.pagination),
  };
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  mapItem: (value: unknown) => T,
): PaginatedResponse<T> => {
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

const normalizeLabOrder = (payload: unknown): LabOrder => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(pickRecord(raw, ["patient", "patientProfile"]));
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const service = mergeRecords(pickRecord(raw, ["service", "labService", "test", "panel"]));
  const orderId =
    pickIdentifier(raw, [
      "id",
      "_id",
      "orderId",
      "order_id",
      "labOrderId",
      "lab_order_id",
      "testRequestId",
      "test_request_id",
    ]) ??
    pickIdentifier(pickRecord(raw, ["order", "labOrder"]), [
      "id",
      "_id",
      "orderId",
      "order_id",
      "labOrderId",
      "lab_order_id",
    ]) ??
    pickIdentifier(raw, ["orderNumber", "order_number", "referenceNumber"]);

  return {
    id: orderId ?? "",
    orderNumber: pickNullableString(raw, ["orderNumber", "order_number", "referenceNumber"]),
    patientName:
      pickString(raw, ["patientName", "patient_name"]) ??
      pickString(patient, ["fullName", "full_name", "displayName", "name"]) ??
      "Patient",
    testName:
      pickString(raw, ["testName", "test_name", "name"]) ??
      pickString(service, ["name", "displayName"]) ??
      "Lab order",
    category:
      pickNullableString(raw, ["category", "testCategory", "test_category"]) ??
      pickNullableString(service, ["category"]),
    status: pickString(raw, ["status", "orderStatus", "order_status"]) ?? "pending",
    priority: pickNullableString(raw, ["priority", "urgency"]),
    sampleId: pickNullableString(raw, ["sampleId", "sample_id", "specimenId", "specimen_id"]),
    orderedAt: pickNullableString(raw, ["orderedAt", "createdAt", "dateOrdered", "date"]),
    scheduledAt: pickNullableString(raw, ["scheduledAt", "scheduledFor", "appointmentDate"]),
    collectedAt: pickNullableString(raw, ["collectedAt", "sampleCollectedAt", "collected_at"]),
    completedAt: pickNullableString(raw, ["completedAt", "completed_at", "reportedAt"]),
    orderingDoctorName:
      pickNullableString(raw, ["orderingDoctorName", "doctorName", "doctor_name"]) ??
      pickNullableString(doctor, ["fullName", "full_name", "displayName", "name"]),
    patientPhone:
      pickNullableString(raw, ["patientPhone", "patient_phone"]) ??
      pickNullableString(patient, ["phone", "phoneNumber", "mobile"]),
    serviceName:
      pickNullableString(raw, ["serviceName", "service_name"]) ??
      pickNullableString(service, ["name", "displayName"]),
    progress: pickNullableNumber(raw, ["progress", "completionPercentage", "completion_percentage"]),
    instructions: pickNullableString(raw, ["instructions", "preparationInstructions"]),
    notes: pickNullableString(raw, ["notes", "internalNotes", "internal_notes"]),
    hasResult:
      pickBoolean(raw, ["hasResult", "has_result"]) ??
      Boolean(pickString(raw, ["resultId", "result_id"])),
  };
};

const normalizeLabOrderDetails = (payload: unknown): LabOrderDetails => {
  const raw = unwrapPayload(payload);
  const base = normalizeLabOrder(raw);
  const patient = mergeRecords(pickRecord(raw, ["patient", "patientProfile"]), raw);
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const service = mergeRecords(pickRecord(raw, ["service", "labService", "test", "panel"]));
  const sampleCollection = mergeRecords(
    pickRecord(raw, ["sampleCollection", "sampleCollectionRequest", "sample_collection_request"]),
  );

  return {
    ...base,
    patient: {
      id:
        pickNullableString(patient, ["id", "_id", "patientId", "patient_id"]) ??
        pickNullableString(raw, ["patientId", "patient_id"]),
      fullName:
        pickString(patient, ["fullName", "full_name", "displayName", "name"]) ??
        base.patientName,
      age: pickNullableNumber(patient, ["age"]),
      gender: pickNullableString(patient, ["gender"]),
      phone:
        pickNullableString(patient, ["phone", "phoneNumber", "mobile"]) ?? base.patientPhone ?? null,
    },
    orderingDoctor: {
      id: pickNullableString(doctor, ["id", "_id", "doctorId", "doctor_id"]),
      fullName:
        pickNullableString(doctor, ["fullName", "full_name", "displayName", "name"]) ??
        base.orderingDoctorName,
      specialty: pickNullableString(doctor, ["specialty", "specialization"]),
    },
    service: {
      id: pickNullableString(service, ["id", "_id", "serviceId", "service_id", "testId", "test_id"]),
      name: pickString(service, ["name", "displayName"]) ?? base.testName,
      code: pickNullableString(service, ["code", "serviceCode", "service_code"]),
      category: pickNullableString(service, ["category"]),
      sampleType: pickNullableString(service, ["sampleType", "sample_type", "specimenType"]),
      turnaroundTime: pickNullableString(service, ["turnaroundTime", "turnaround_time"]),
    },
    resultId: pickNullableString(raw, ["resultId", "result_id"]),
    resultStatus: pickNullableString(raw, ["resultStatus", "result_status"]),
    diagnosis: pickNullableString(raw, ["diagnosis", "clinicalNotes", "clinical_notes"]),
    specimenType: pickNullableString(raw, ["specimenType", "sampleType", "sample_type"]),
    specimenNotes: pickNullableString(raw, ["specimenNotes", "sampleNotes", "sample_notes"]),
    internalNotes: pickNullableString(raw, ["internalNotes", "internal_notes", "labNotes"]),
    sampleCollectionRequested:
      pickBoolean(raw, ["sampleCollectionRequested", "sample_collection_requested"]) ??
      Boolean(
        pickString(sampleCollection, ["id", "_id", "requestId", "request_id"]) ||
          pickString(raw, ["sampleCollectionStatus", "sample_collection_status"]),
      ),
    sampleCollectionStatus:
      pickNullableString(sampleCollection, ["status"]) ??
      pickNullableString(raw, ["sampleCollectionStatus", "sample_collection_status"]),
    sampleCollectionAddress:
      joinAddress(sampleCollection) ??
      pickNullableString(raw, ["sampleCollectionAddress", "sample_collection_address"]),
    attachments: [
      ...pickStringArray(raw, ["attachments", "files"]),
      ...pickStringArray(sampleCollection, ["attachments", "files"]),
    ],
  };
};

const normalizeLabResultValue = (payload: unknown): UploadLabResultValue => {
  const raw = asRecord(payload);

  return {
    name: pickString(raw, ["name", "parameter", "label", "testName"]) ?? "Measurement",
    value: pickNullableString(raw, ["value", "result"]),
    unit: pickNullableString(raw, ["unit"]),
    referenceRange: pickNullableString(raw, ["referenceRange", "range", "normalRange"]),
    status: pickNullableString(raw, ["status", "flag"]),
  };
};

const normalizeLabResult = (payload: unknown): LabResult => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(pickRecord(raw, ["patient", "patientProfile"]));
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const valuesSource = [
    ...getListEnvelope(raw.values).items,
    ...getListEnvelope(raw.measurements).items,
    ...getListEnvelope(raw.components).items,
  ];

  return {
    id: pickString(raw, ["id", "_id", "resultId", "result_id", "labResultId", "lab_result_id"]) ?? "",
    orderId: pickNullableString(raw, ["orderId", "order_id", "labOrderId", "lab_order_id"]),
    orderNumber: pickNullableString(raw, ["orderNumber", "order_number", "referenceNumber"]),
    resultNumber: pickNullableString(raw, ["resultNumber", "result_number"]),
    patientName:
      pickString(raw, ["patientName", "patient_name"]) ??
      pickString(patient, ["fullName", "full_name", "displayName", "name"]) ??
      "Patient",
    testName: pickString(raw, ["testName", "test_name", "name"]) ?? "Lab result",
    category: pickNullableString(raw, ["category", "testCategory", "test_category"]),
    status: pickString(raw, ["status", "resultStatus", "result_status"]) ?? "completed",
    priority: pickNullableString(raw, ["priority", "urgency"]),
    reportedAt: pickNullableString(raw, ["reportedAt", "completedAt", "issuedAt", "date"]),
    collectedAt: pickNullableString(raw, ["collectedAt", "sampleCollectedAt"]),
    orderedAt: pickNullableString(raw, ["orderedAt", "createdAt", "dateOrdered"]),
    orderingDoctorName:
      pickNullableString(raw, ["orderingDoctorName", "doctorName", "doctor_name"]) ??
      pickNullableString(doctor, ["fullName", "full_name", "displayName", "name"]),
    summary: pickNullableString(raw, ["summary", "interpretation"]),
    conclusion: pickNullableString(raw, ["conclusion", "impression"]),
    notes: pickNullableString(raw, ["notes", "comment"]),
    reportUrl: pickNullableString(raw, ["reportUrl", "pdfUrl", "downloadUrl"]),
    attachments: [
      ...pickStringArray(raw, ["attachments", "files"]),
      ...pickStringArray(raw, ["reportFiles", "report_files"]),
    ],
    values: valuesSource.map(normalizeLabResultValue),
  };
};

const normalizeSampleCollectionRequest = (payload: unknown): SampleCollectionRequest => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(pickRecord(raw, ["patient", "patientProfile"]));
  const order = mergeRecords(pickRecord(raw, ["order", "labOrder"]));

  return {
    id: pickString(raw, ["id", "_id", "requestId", "request_id"]) ?? "",
    orderId:
      pickNullableString(raw, ["orderId", "order_id", "labOrderId", "lab_order_id"]) ??
      pickNullableString(order, ["id", "_id", "orderId", "order_id"]),
    orderNumber:
      pickNullableString(raw, ["orderNumber", "order_number"]) ??
      pickNullableString(order, ["orderNumber", "order_number", "referenceNumber"]),
    patientName:
      pickString(raw, ["patientName", "patient_name"]) ??
      pickString(patient, ["fullName", "full_name", "displayName", "name"]) ??
      "Patient",
    patientPhone:
      pickNullableString(raw, ["patientPhone", "patient_phone"]) ??
      pickNullableString(patient, ["phone", "phoneNumber", "mobile"]),
    testName:
      pickString(raw, ["testName", "test_name"]) ??
      pickString(order, ["testName", "test_name", "name"]) ??
      "Lab order",
    status: pickString(raw, ["status"]) ?? "requested",
    priority: pickNullableString(raw, ["priority", "urgency"]),
    requestedAt: pickNullableString(raw, ["requestedAt", "createdAt", "date"]),
    scheduledAt: pickNullableString(raw, ["scheduledAt", "scheduledFor"]),
    address: joinAddress(raw) ?? joinAddress(patient),
    notes: pickNullableString(raw, ["notes", "instructions"]),
  };
};

const buildResultPayload = (payload: UploadLabResultRequest) => {
  const hasFiles =
    Boolean(payload.resultFile) || Boolean(payload.attachments && payload.attachments.length > 0);

  if (!hasFiles) {
    return {
      status: payload.status,
      referenceNumber: payload.referenceNumber,
      summary: payload.summary,
      conclusion: payload.conclusion,
      notes: payload.notes,
      collectedAt: payload.collectedAt,
      reportedAt: payload.reportedAt,
      values: payload.values,
    };
  }

  const formData = new FormData();

  if (payload.status) formData.append("status", payload.status);
  if (payload.referenceNumber) formData.append("referenceNumber", payload.referenceNumber);
  if (payload.summary) formData.append("summary", payload.summary);
  if (payload.conclusion) formData.append("conclusion", payload.conclusion);
  if (payload.notes) formData.append("notes", payload.notes);
  if (payload.collectedAt) formData.append("collectedAt", payload.collectedAt);
  if (payload.reportedAt) formData.append("reportedAt", payload.reportedAt);
  if (payload.resultFile) formData.append("resultFile", payload.resultFile);

  payload.attachments?.forEach((file) => {
    formData.append("attachments", file);
  });

  if (payload.values?.length) {
    formData.append("values", JSON.stringify(payload.values));
  }

  return formData;
};

export const labWorkflowService = {
  getLabOrders: async (
    params?: LabOrdersFilterParams,
  ): Promise<PaginatedResponse<LabOrder>> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/orders", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabOrder);
  },

  getPendingLabOrders: async (
    params?: LabOrdersFilterParams,
  ): Promise<PaginatedResponse<LabOrder>> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/orders/pending", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabOrder);
  },

  getLabOrderById: async (orderId: string): Promise<LabOrderDetails> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/orders/${orderId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeLabOrderDetails(response);
  },

  updateLabOrderStatus: async (
    orderId: string,
    payload: UpdateLabOrderStatusRequest,
  ): Promise<LabOrderDetails> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/orders/${orderId}/status`, {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeLabOrderDetails(response);
  },

  reviewLabOrder: async (
    orderId: string,
    payload: ReviewLabOrderRequest,
  ): Promise<LabOrderDetails> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/orders/${orderId}/review`, {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizeLabOrderDetails(response);
  },

  uploadLabOrderResult: async (
    orderId: string,
    payload: UploadLabResultRequest,
  ): Promise<LabResult> => {
    const response = await apiRequest<unknown>(`/api/v1/labs/me/orders/${orderId}/results`, {
      method: "POST",
      body: buildResultPayload(payload),
      auth: true,
    });

    return normalizeLabResult(response);
  },

  getLabResults: async (
    params?: LabResultsFilterParams,
  ): Promise<PaginatedResponse<LabResult>> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/results", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabResult);
  },

  getSampleCollectionRequests: async (
    params?: SampleCollectionRequestFilterParams,
  ): Promise<PaginatedResponse<SampleCollectionRequest>> => {
    const response = await apiRequest<unknown>("/api/v1/labs/me/sample-collection-requests", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeSampleCollectionRequest);
  },
};
