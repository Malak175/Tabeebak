import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myAccountQueryKeys } from "@/hooks/useMyAccount";
import { doctorProfileService } from "@/services/doctor-profile.service";
import {
  UpdateDoctorAvailabilityRequest,
  UpdateDoctorProfessionalProfileRequest,
  UpdateDoctorProfileRequest,
} from "@/types/doctor-profile.types";

export const doctorQueryKeys = {
  all: ["doctor"] as const,
  dashboardSummary: () => ["dashboard-summary"] as const,
  profile: () => ["doctor", "profile"] as const,
  professionalProfile: () => ["doctor", "professional-profile"] as const,
  availability: () => ["doctor", "availability"] as const,
};

export const useDoctorDashboardSummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: doctorQueryKeys.dashboardSummary(),
    queryFn: doctorProfileService.getDashboardSummary,
    enabled,
  });

export const useDoctorProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: doctorQueryKeys.profile(),
    queryFn: doctorProfileService.getProfile,
    enabled,
  });

export const useUpdateDoctorProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDoctorProfileRequest) => doctorProfileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
    },
  });
};

export const useDoctorProfessionalProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: doctorQueryKeys.professionalProfile(),
    queryFn: doctorProfileService.getProfessionalProfile,
    enabled,
  });

export const useUpdateDoctorProfessionalProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDoctorProfessionalProfileRequest) =>
      doctorProfileService.updateProfessionalProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.professionalProfile() });
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.dashboardSummary() });
    },
  });
};

export const useDoctorAvailabilityQuery = (enabled = true) =>
  useQuery({
    queryKey: doctorQueryKeys.availability(),
    queryFn: doctorProfileService.getAvailability,
    enabled,
  });

export const useUpdateDoctorAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDoctorAvailabilityRequest) =>
      doctorProfileService.updateAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.availability() });
      queryClient.invalidateQueries({ queryKey: doctorQueryKeys.dashboardSummary() });
    },
  });
};
