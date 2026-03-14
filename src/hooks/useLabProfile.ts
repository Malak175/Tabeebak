import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myAccountQueryKeys } from "@/hooks/useMyAccount";
import { labProfileService } from "@/services/lab-profile.service";
import {
  CreateLabBranchRequest,
  CreateLabServiceRequest,
  UpdateLabBranchRequest,
  UpdateLabProfileRequest,
  UpdateLabServiceRequest,
} from "@/types/lab-profile.types";

export const labQueryKeys = {
  all: ["lab"] as const,
  dashboardSummary: () => ["lab", "dashboard-summary"] as const,
  profile: () => ["lab", "profile"] as const,
  branches: () => ["lab", "branches"] as const,
  services: () => ["lab", "services"] as const,
};

export const useLabDashboardSummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: labQueryKeys.dashboardSummary(),
    queryFn: labProfileService.getDashboardSummary,
    enabled,
  });

export const useLabProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: labQueryKeys.profile(),
    queryFn: labProfileService.getProfile,
    enabled,
  });

export const useUpdateLabProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLabProfileRequest) => labProfileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
    },
  });
};

export const useLabBranchesQuery = (enabled = true) =>
  useQuery({
    queryKey: labQueryKeys.branches(),
    queryFn: labProfileService.getBranches,
    enabled,
  });

export const useCreateLabBranchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabBranchRequest) => labProfileService.createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.branches() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
    },
  });
};

export const useUpdateLabBranchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      payload,
    }: {
      branchId: string;
      payload: UpdateLabBranchRequest;
    }) => labProfileService.updateBranch(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.branches() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
    },
  });
};

export const useLabServicesQuery = (enabled = true) =>
  useQuery({
    queryKey: labQueryKeys.services(),
    queryFn: labProfileService.getServices,
    enabled,
  });

export const useCreateLabServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabServiceRequest) => labProfileService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.services() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
    },
  });
};

export const useUpdateLabServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: string;
      payload: UpdateLabServiceRequest;
    }) => labProfileService.updateService(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.services() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
    },
  });
};

export const useDeleteLabServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => labProfileService.deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labQueryKeys.services() });
      queryClient.invalidateQueries({ queryKey: labQueryKeys.dashboardSummary() });
    },
  });
};
