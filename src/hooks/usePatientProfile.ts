import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myAccountQueryKeys } from "@/hooks/useMyAccount";
import { patientService } from "@/services/patient.service";
import {
  AppointmentFilterParams,
  LabOrderFilterParams,
  LabResultFilterParams,
  PrescriptionFilterParams,
} from "@/types/patient-records.types";
import {
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient-profile.types";

const normalizeListParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  ) as T;

export const patientQueryKeys = {
  all: ["patient"] as const,
  dashboardSummary: () => ["patient", "dashboard-summary"] as const,
  profile: () => ["patient", "profile"] as const,
  medicalProfile: () => ["patient", "medical-profile"] as const,
  emergencyContact: () => ["patient", "emergency-contact"] as const,
  insurance: () => ["patient", "insurance"] as const,
  medicalHistorySummary: () => ["patient", "medical-history-summary"] as const,
  appointments: (params?: AppointmentFilterParams) =>
    ["patient", "appointments", normalizeListParams(params)] as const,
  upcomingAppointments: () => ["patient", "appointments", "upcoming"] as const,
  appointmentDetails: (appointmentId: string) =>
    ["patient", "appointments", "detail", appointmentId] as const,
  prescriptions: (params?: PrescriptionFilterParams) =>
    ["patient", "prescriptions", normalizeListParams(params)] as const,
  prescriptionDetails: (prescriptionId: string) =>
    ["patient", "prescriptions", "detail", prescriptionId] as const,
  labOrders: (params?: LabOrderFilterParams) =>
    ["patient", "lab-orders", normalizeListParams(params)] as const,
  labResults: (params?: LabResultFilterParams) =>
    ["patient", "lab-results", normalizeListParams(params)] as const,
  labResultDetails: (resultId: string) =>
    ["patient", "lab-results", "detail", resultId] as const,
};

export const usePatientDashboardSummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.dashboardSummary(),
    queryFn: patientService.getDashboardSummary,
    enabled,
  });

export const usePatientProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.profile(),
    queryFn: patientService.getProfile,
    enabled,
  });

export const useUpdatePatientProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePatientProfileRequest) => patientService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
    },
  });
};

export const usePatientMedicalProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.medicalProfile(),
    queryFn: patientService.getMedicalProfile,
    enabled,
  });

export const useUpdatePatientMedicalProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePatientMedicalProfileRequest) =>
      patientService.updateMedicalProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.medicalProfile() });
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.medicalHistorySummary() });
    },
  });
};

export const useEmergencyContactQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.emergencyContact(),
    queryFn: patientService.getEmergencyContact,
    enabled,
  });

export const useUpdateEmergencyContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmergencyContactRequest) =>
      patientService.updateEmergencyContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.emergencyContact() });
    },
  });
};

export const useInsuranceQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.insurance(),
    queryFn: patientService.getInsurance,
    enabled,
  });

export const useUpdateInsuranceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInsuranceInfoRequest) => patientService.updateInsurance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.insurance() });
    },
  });
};

export const useMedicalHistorySummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.medicalHistorySummary(),
    queryFn: patientService.getMedicalHistorySummary,
    enabled,
  });

export const usePatientAppointmentsQuery = (
  params?: AppointmentFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.appointments(params),
    queryFn: () => patientService.getPatientAppointments(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useUpcomingPatientAppointmentsQuery = (enabled = true) =>
  useQuery({
    queryKey: patientQueryKeys.upcomingAppointments(),
    queryFn: patientService.getUpcomingPatientAppointments,
    enabled,
  });

export const usePatientAppointmentDetailsQuery = (
  appointmentId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.appointmentDetails(appointmentId ?? ""),
    queryFn: () => patientService.getPatientAppointmentById(appointmentId ?? ""),
    enabled: enabled && Boolean(appointmentId),
  });

export const usePatientPrescriptionsQuery = (
  params?: PrescriptionFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.prescriptions(params),
    queryFn: () => patientService.getPatientPrescriptions(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const usePatientPrescriptionDetailsQuery = (
  prescriptionId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.prescriptionDetails(prescriptionId ?? ""),
    queryFn: () => patientService.getPatientPrescriptionById(prescriptionId ?? ""),
    enabled: enabled && Boolean(prescriptionId),
  });

export const usePatientLabOrdersQuery = (
  params?: LabOrderFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.labOrders(params),
    queryFn: () => patientService.getPatientLabOrders(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const usePatientLabResultsQuery = (
  params?: LabResultFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.labResults(params),
    queryFn: () => patientService.getPatientLabResults(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const usePatientLabResultDetailsQuery = (
  resultId: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: patientQueryKeys.labResultDetails(resultId ?? ""),
    queryFn: () => patientService.getPatientLabResultById(resultId ?? ""),
    enabled: enabled && Boolean(resultId),
  });
