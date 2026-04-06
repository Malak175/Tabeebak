import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorWorkflowService } from "@/services/doctor-workflow.service";
import {
  CreateDoctorAppointmentRequestMessagePayload,
  CreatePrescriptionPayload,
  DoctorAppointmentRequestFilterParams,
  DoctorAppointmentFilterParams,
  DoctorPatientFilterParams,
  DoctorPrescriptionFilterParams,
  DoctorReviewFilterParams,
  UpdateDoctorAppointmentRequestStatusPayload,
} from "@/types/doctor-workflow.types";

const normalizeListParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  ) as T;

export const doctorWorkflowQueryKeys = {
  all: ["doctor-workflow"] as const,
  appointmentRequests: (params?: DoctorAppointmentRequestFilterParams) =>
    ["doctor-workflow", "appointment-requests", normalizeListParams(params)] as const,
  appointmentRequestDetails: (requestId: string) =>
    ["doctor-workflow", "appointment-requests", "detail", requestId] as const,
  appointments: (params?: DoctorAppointmentFilterParams) =>
    ["doctor-workflow", "appointments", normalizeListParams(params)] as const,
  todayAppointments: (params?: DoctorAppointmentFilterParams) =>
    ["doctor-workflow", "appointments", "today", normalizeListParams(params)] as const,
  appointmentDetails: (appointmentId: string) =>
    ["doctor-workflow", "appointments", "detail", appointmentId] as const,
  patients: (params?: DoctorPatientFilterParams) =>
    ["doctor-workflow", "patients", normalizeListParams(params)] as const,
  patientSummary: (patientId: string) =>
    ["doctor-workflow", "patients", "summary", patientId] as const,
  prescriptions: (params?: DoctorPrescriptionFilterParams) =>
    ["doctor-workflow", "prescriptions", normalizeListParams(params)] as const,
  prescriptionDetails: (prescriptionId: string) =>
    ["doctor-workflow", "prescriptions", "detail", prescriptionId] as const,
  reviewsSummary: () => ["doctor-workflow", "reviews", "summary"] as const,
  reviews: (params?: DoctorReviewFilterParams) =>
    ["doctor-workflow", "reviews", normalizeListParams(params)] as const,
};

export const useDoctorAppointmentRequestsQuery = (
  params?: DoctorAppointmentRequestFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.appointmentRequests(params),
    queryFn: () => doctorWorkflowService.getDoctorAppointmentRequests(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useDoctorAppointmentRequestDetailsQuery = (
  requestId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.appointmentRequestDetails(requestId ?? ""),
    queryFn: () => doctorWorkflowService.getDoctorAppointmentRequestById(requestId ?? ""),
    enabled: enabled && Boolean(requestId),
  });

export const useUpdateDoctorAppointmentRequestStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: UpdateDoctorAppointmentRequestStatusPayload;
    }) => doctorWorkflowService.updateDoctorAppointmentRequestStatus(requestId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.appointmentRequests() });
      queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: doctorWorkflowQueryKeys.appointmentRequestDetails(variables.requestId),
      });
    },
  });
};

export const useDoctorAppointmentRequestMessageMutation = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorAppointmentRequestMessagePayload) =>
      doctorWorkflowService.sendDoctorAppointmentRequestMessage(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorWorkflowQueryKeys.appointmentRequestDetails(requestId),
      });
      queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.appointmentRequests() });
    },
  });
};

export const useDoctorAppointmentsQuery = (
  params?: DoctorAppointmentFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.appointments(params),
    queryFn: () => doctorWorkflowService.getDoctorAppointments(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useDoctorTodayAppointmentsQuery = (
  params?: DoctorAppointmentFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.todayAppointments(params),
    queryFn: () => doctorWorkflowService.getDoctorTodayAppointments(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useDoctorAppointmentDetailsQuery = (
  appointmentId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.appointmentDetails(appointmentId ?? ""),
    queryFn: () => doctorWorkflowService.getDoctorAppointmentById(appointmentId ?? ""),
    enabled: enabled && Boolean(appointmentId),
  });

export const useDoctorPatientsQuery = (
  params?: DoctorPatientFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.patients(params),
    queryFn: () => doctorWorkflowService.getDoctorPatients(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useDoctorPatientSummaryQuery = (
  patientId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.patientSummary(patientId ?? ""),
    queryFn: () => doctorWorkflowService.getDoctorPatientSummary(patientId ?? ""),
    enabled: enabled && Boolean(patientId),
  });

export const useDoctorPrescriptionsQuery = (
  params?: DoctorPrescriptionFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.prescriptions(params),
    queryFn: () => doctorWorkflowService.getDoctorPrescriptions(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useDoctorPrescriptionDetailsQuery = (
  prescriptionId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.prescriptionDetails(prescriptionId ?? ""),
    queryFn: () => doctorWorkflowService.getDoctorPrescriptionById(prescriptionId ?? ""),
    enabled: enabled && Boolean(prescriptionId),
  });

export const useCreateDoctorPrescriptionMutation = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) =>
      doctorWorkflowService.createDoctorPrescription(payload),
    onSuccess: () => {
      if (appointmentId) {
        queryClient.invalidateQueries({
          queryKey: doctorWorkflowQueryKeys.appointmentDetails(appointmentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.prescriptions() });
    },
  });
};

export const useDoctorReviewsSummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.reviewsSummary(),
    queryFn: doctorWorkflowService.getDoctorReviewsSummary,
    enabled,
  });

export const useDoctorReviewsQuery = (
  params?: DoctorReviewFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: doctorWorkflowQueryKeys.reviews(params),
    queryFn: () => doctorWorkflowService.getDoctorReviews(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
