import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { patientRecordsService } from "@/services/patient-records.service";
import type {
  AppointmentFilterParams,
  LabOrderFilterParams,
  LabResultFilterParams,
  PrescriptionFilterParams,
} from "@/types/patient-records.types";

const normalizeFilters = <T extends Record<string, unknown> | undefined>(filters?: T) =>
  Object.fromEntries(
    Object.entries(filters ?? {})
      .filter(([, value]) => value !== undefined && value !== "")
      .sort(([left], [right]) => left.localeCompare(right)),
  );

export const patientRecordsQueryKeys = {
  all: ["patient-records"] as const,
  appointments: {
    all: ["patient-records", "appointments"] as const,
    list: (filters?: AppointmentFilterParams) =>
      ["patient-records", "appointments", "list", normalizeFilters(filters)] as const,
    upcoming: (filters?: AppointmentFilterParams) =>
      ["patient-records", "appointments", "upcoming", normalizeFilters(filters)] as const,
    detail: (appointmentId: string) =>
      ["patient-records", "appointments", "detail", appointmentId] as const,
  },
  prescriptions: {
    all: ["patient-records", "prescriptions"] as const,
    list: (filters?: PrescriptionFilterParams) =>
      ["patient-records", "prescriptions", "list", normalizeFilters(filters)] as const,
    detail: (prescriptionId: string) =>
      ["patient-records", "prescriptions", "detail", prescriptionId] as const,
  },
  labOrders: {
    all: ["patient-records", "lab-orders"] as const,
    list: (filters?: LabOrderFilterParams) =>
      ["patient-records", "lab-orders", "list", normalizeFilters(filters)] as const,
  },
  labResults: {
    all: ["patient-records", "lab-results"] as const,
    list: (filters?: LabResultFilterParams) =>
      ["patient-records", "lab-results", "list", normalizeFilters(filters)] as const,
    detail: (resultId: string) =>
      ["patient-records", "lab-results", "detail", resultId] as const,
  },
};

export const usePatientAppointmentsQuery = (filters?: AppointmentFilterParams) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.appointments.list(filters),
    queryFn: () => patientRecordsService.getAppointments(filters),
    placeholderData: keepPreviousData,
  });

export const useUpcomingPatientAppointmentsQuery = (filters?: AppointmentFilterParams) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.appointments.upcoming(filters),
    queryFn: () => patientRecordsService.getUpcomingAppointments(filters),
    placeholderData: keepPreviousData,
  });

export const usePatientAppointmentDetailsQuery = (appointmentId?: string) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.appointments.detail(appointmentId ?? "missing"),
    queryFn: () => patientRecordsService.getAppointmentDetails(appointmentId ?? ""),
    enabled: Boolean(appointmentId),
  });

export const usePatientPrescriptionsQuery = (filters?: PrescriptionFilterParams) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.prescriptions.list(filters),
    queryFn: () => patientRecordsService.getPrescriptions(filters),
    placeholderData: keepPreviousData,
  });

export const usePatientPrescriptionDetailsQuery = (prescriptionId?: string) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.prescriptions.detail(prescriptionId ?? "missing"),
    queryFn: () => patientRecordsService.getPrescriptionDetails(prescriptionId ?? ""),
    enabled: Boolean(prescriptionId),
  });

export const usePatientLabOrdersQuery = (filters?: LabOrderFilterParams) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.labOrders.list(filters),
    queryFn: () => patientRecordsService.getLabOrders(filters),
    placeholderData: keepPreviousData,
  });

export const usePatientLabResultsQuery = (filters?: LabResultFilterParams) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.labResults.list(filters),
    queryFn: () => patientRecordsService.getLabResults(filters),
    placeholderData: keepPreviousData,
  });

export const usePatientLabResultDetailsQuery = (resultId?: string) =>
  useQuery({
    queryKey: patientRecordsQueryKeys.labResults.detail(resultId ?? "missing"),
    queryFn: () => patientRecordsService.getLabResultDetails(resultId ?? ""),
    enabled: Boolean(resultId),
  });
