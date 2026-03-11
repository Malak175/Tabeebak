import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import type {
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient.types";

export const patientQueryKeys = {
  all: ["patient"] as const,
  dashboardSummary: ["patient", "dashboard-summary"] as const,
  profile: ["patient", "profile"] as const,
  medicalProfile: ["patient", "medical-profile"] as const,
  emergencyContact: ["patient", "emergency-contact"] as const,
  insurance: ["patient", "insurance"] as const,
  medicalHistorySummary: ["patient", "medical-history-summary"] as const,
};

export const usePatientDashboardSummaryQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.dashboardSummary,
    queryFn: patientService.getDashboardSummary,
  });

export const usePatientProfileQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.profile,
    queryFn: patientService.getProfile,
  });

export const useUpdatePatientProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePatientProfileRequest) => patientService.updateProfile(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(patientQueryKeys.profile, profile);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.dashboardSummary }),
      ]);
    },
  });
};

export const usePatientMedicalProfileQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.medicalProfile,
    queryFn: patientService.getMedicalProfile,
  });

export const useUpdatePatientMedicalProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePatientMedicalProfileRequest) =>
      patientService.updateMedicalProfile(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(patientQueryKeys.medicalProfile, profile);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.medicalProfile }),
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.medicalHistorySummary }),
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.dashboardSummary }),
      ]);
    },
  });
};

export const useEmergencyContactQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.emergencyContact,
    queryFn: patientService.getEmergencyContact,
  });

export const useUpdateEmergencyContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmergencyContactRequest) =>
      patientService.updateEmergencyContact(payload),
    onSuccess: async (contact) => {
      queryClient.setQueryData(patientQueryKeys.emergencyContact, contact);
      await queryClient.invalidateQueries({ queryKey: patientQueryKeys.emergencyContact });
    },
  });
};

export const useInsuranceQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.insurance,
    queryFn: patientService.getInsurance,
  });

export const useUpdateInsuranceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInsuranceInfoRequest) =>
      patientService.updateInsurance(payload),
    onSuccess: async (insurance) => {
      queryClient.setQueryData(patientQueryKeys.insurance, insurance);
      await queryClient.invalidateQueries({ queryKey: patientQueryKeys.insurance });
    },
  });
};

export const useMedicalHistorySummaryQuery = () =>
  useQuery({
    queryKey: patientQueryKeys.medicalHistorySummary,
    queryFn: patientService.getMedicalHistorySummary,
  });
