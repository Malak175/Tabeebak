import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myAccountQueryKeys } from "@/hooks/useMyAccount";
import { patientService } from "@/services/patient.service";
import {
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient-profile.types";

export const patientQueryKeys = {
  all: ["patient"] as const,
  dashboardSummary: () => ["patient", "dashboard-summary"] as const,
  profile: () => ["patient", "profile"] as const,
  medicalProfile: () => ["patient", "medical-profile"] as const,
  emergencyContact: () => ["patient", "emergency-contact"] as const,
  insurance: () => ["patient", "insurance"] as const,
  medicalHistorySummary: () => ["patient", "medical-history-summary"] as const,
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
