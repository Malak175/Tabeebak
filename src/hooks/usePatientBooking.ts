import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientQueryKeys } from "@/hooks/usePatientProfile";
import { patientBookingService } from "@/services/patient-booking.service";
import {
  CreateAppointmentRequestPayload,
  CreateRequestMessagePayload,
  CreateTestRequestPayload,
  DiscoveryLocationParams,
  DoctorRequestListParams,
  DoctorSearchParams,
  LabRequestListParams,
  LabSearchParams,
} from "@/types/patient-booking.types";

const normalizeListParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  ) as T;

export const patientBookingQueryKeys = {
  all: ["patient-booking"] as const,
  doctors: (params?: DoctorSearchParams) =>
    ["patient-booking", "doctors", normalizeListParams(params)] as const,
  nearbyDoctors: (params?: DiscoveryLocationParams | null) =>
    ["patient-booking", "doctors", "near", params ?? null] as const,
  doctorDetail: (doctorId: string) => ["patient-booking", "doctors", "detail", doctorId] as const,
  doctorAvailability: (doctorId: string) =>
    ["patient-booking", "doctors", "availability", doctorId] as const,
  labs: (params?: LabSearchParams) =>
    ["patient-booking", "labs", normalizeListParams(params)] as const,
  nearbyLabs: (params?: DiscoveryLocationParams | null) =>
    ["patient-booking", "labs", "near", params ?? null] as const,
  labDetail: (labId: string) => ["patient-booking", "labs", "detail", labId] as const,
  labBranches: (labId: string) => ["patient-booking", "labs", "branches", labId] as const,
  labServices: (labId: string) => ["patient-booking", "labs", "services", labId] as const,
  appointmentRequests: (params?: DoctorRequestListParams) =>
    ["patient-booking", "appointment-requests", normalizeListParams(params)] as const,
  appointmentRequestDetail: (requestId: string) =>
    ["patient-booking", "appointment-requests", "detail", requestId] as const,
  testRequests: (params?: LabRequestListParams) =>
    ["patient-booking", "test-requests", normalizeListParams(params)] as const,
  testRequestDetail: (requestId: string) =>
    ["patient-booking", "test-requests", "detail", requestId] as const,
};

export const useDoctorDirectoryQuery = (params?: DoctorSearchParams) =>
  useQuery({
    queryKey: patientBookingQueryKeys.doctors(params),
    queryFn: () => patientBookingService.getDoctors(params),
  });

export const useNearbyDoctorDirectoryQuery = (params: DiscoveryLocationParams | null) =>
  useQuery({
    queryKey: patientBookingQueryKeys.nearbyDoctors(params),
    queryFn: () => patientBookingService.getNearbyDoctors(params as DiscoveryLocationParams),
    enabled: Boolean(params),
  });

export const useDoctorBookingDetailQuery = (doctorId: string | undefined) =>
  useQuery({
    queryKey: patientBookingQueryKeys.doctorDetail(doctorId ?? ""),
    queryFn: () => patientBookingService.getDoctorById(doctorId ?? ""),
    enabled: Boolean(doctorId),
  });

export const useDoctorBookingAvailabilityQuery = (doctorId: string | undefined) =>
  useQuery({
    queryKey: patientBookingQueryKeys.doctorAvailability(doctorId ?? ""),
    queryFn: () => patientBookingService.getDoctorAvailability(doctorId ?? ""),
    enabled: Boolean(doctorId),
  });

export const useLabDirectoryQuery = (params?: LabSearchParams) =>
  useQuery({
    queryKey: patientBookingQueryKeys.labs(params),
    queryFn: () => patientBookingService.getLabs(params),
  });

export const useNearbyLabDirectoryQuery = (params: DiscoveryLocationParams | null) =>
  useQuery({
    queryKey: patientBookingQueryKeys.nearbyLabs(params),
    queryFn: () => patientBookingService.getNearbyLabs(params as DiscoveryLocationParams),
    enabled: Boolean(params),
  });

export const useLabBookingDetailQuery = (labId: string | undefined) =>
  useQuery({
    queryKey: patientBookingQueryKeys.labDetail(labId ?? ""),
    queryFn: () => patientBookingService.getLabById(labId ?? ""),
    enabled: Boolean(labId),
  });

export const useLabBranchesDetailQuery = (labId: string | undefined) =>
  useQuery({
    queryKey: patientBookingQueryKeys.labBranches(labId ?? ""),
    queryFn: () => patientBookingService.getLabBranches(labId ?? ""),
    enabled: Boolean(labId),
  });

export const useLabServicesDetailQuery = (labId: string | undefined) =>
  useQuery({
    queryKey: patientBookingQueryKeys.labServices(labId ?? ""),
    queryFn: () => patientBookingService.getLabServices(labId ?? ""),
    enabled: Boolean(labId),
  });

export const useCreateAppointmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentRequestPayload) =>
      patientBookingService.createAppointmentRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.appointmentRequests() });
      queryClient.invalidateQueries({
        queryKey: patientBookingQueryKeys.appointmentRequestDetail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.appointments() });
    },
  });
};

export const useAppointmentRequestsQuery = (params?: DoctorRequestListParams, enabled = true) =>
  useQuery({
    queryKey: patientBookingQueryKeys.appointmentRequests(params),
    queryFn: () => patientBookingService.getAppointmentRequests(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useAppointmentRequestDetailQuery = (requestId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: patientBookingQueryKeys.appointmentRequestDetail(requestId ?? ""),
    queryFn: () => patientBookingService.getAppointmentRequestById(requestId ?? ""),
    enabled: enabled && Boolean(requestId),
  });

export const useCancelAppointmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => patientBookingService.cancelAppointmentRequest(requestId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.appointmentRequests() });
      queryClient.setQueryData(
        patientBookingQueryKeys.appointmentRequestDetail(data.id),
        data,
      );
    },
  });
};

export const useAppointmentRequestMessageMutation = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestMessagePayload) =>
      patientBookingService.sendAppointmentRequestMessage(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: patientBookingQueryKeys.appointmentRequestDetail(requestId),
      });
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.appointmentRequests() });
    },
  });
};

export const useCreateTestRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTestRequestPayload) => patientBookingService.createTestRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.testRequests() });
      queryClient.invalidateQueries({
        queryKey: patientBookingQueryKeys.testRequestDetail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.labOrders() });
    },
  });
};

export const useTestRequestsQuery = (params?: LabRequestListParams, enabled = true) =>
  useQuery({
    queryKey: patientBookingQueryKeys.testRequests(params),
    queryFn: () => patientBookingService.getTestRequests(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useTestRequestDetailQuery = (requestId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: patientBookingQueryKeys.testRequestDetail(requestId ?? ""),
    queryFn: () => patientBookingService.getTestRequestById(requestId ?? ""),
    enabled: enabled && Boolean(requestId),
  });

export const useCancelTestRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => patientBookingService.cancelTestRequest(requestId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.testRequests() });
      queryClient.setQueryData(patientBookingQueryKeys.testRequestDetail(data.id), data);
    },
  });
};

export const useTestRequestMessageMutation = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestMessagePayload) =>
      patientBookingService.sendTestRequestMessage(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: patientBookingQueryKeys.testRequestDetail(requestId),
      });
      queryClient.invalidateQueries({ queryKey: patientBookingQueryKeys.testRequests() });
    },
  });
};
