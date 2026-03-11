import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meService } from "@/services/me.service";
import type {
  ChangePasswordRequest,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

export const meQueryKeys = {
  all: ["me"] as const,
  auth: ["me", "auth"] as const,
  profile: ["me", "profile"] as const,
  notificationPreferences: ["me", "notification-preferences"] as const,
  securitySettings: ["me", "security-settings"] as const,
};

const invalidateProfileQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: meQueryKeys.auth }),
    queryClient.invalidateQueries({ queryKey: meQueryKeys.profile }),
  ]);
};

export const useFetchMeQuery = (enabled = true) =>
  useQuery({
    queryKey: meQueryKeys.auth,
    queryFn: meService.getMe,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const useMyProfileQuery = () =>
  useQuery({
    queryKey: meQueryKeys.profile,
    queryFn: meService.getMyProfile,
  });

export const useUpdateBasicInfoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBasicInfoRequest) => meService.updateBasicInfo(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(meQueryKeys.profile, profile);
      await invalidateProfileQueries(queryClient);
    },
  });
};

export const useUpdateContactInfoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateContactInfoRequest) => meService.updateContactInfo(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(meQueryKeys.profile, profile);
      await invalidateProfileQueries(queryClient);
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => meService.uploadAvatar(file),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient);
    },
  });
};

export const useDeleteAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meService.deleteAvatar(),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient);
    },
  });
};

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) => meService.changePassword(payload),
  });

export const useNotificationPreferencesQuery = () =>
  useQuery({
    queryKey: meQueryKeys.notificationPreferences,
    queryFn: meService.getNotificationPreferences,
  });

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      meService.updateNotificationPreferences(payload),
    onSuccess: (preferences) => {
      queryClient.setQueryData(meQueryKeys.notificationPreferences, preferences);
    },
  });
};

export const useSecuritySettingsQuery = () =>
  useQuery({
    queryKey: meQueryKeys.securitySettings,
    queryFn: meService.getSecuritySettings,
  });

export const useUpdateSecuritySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SecuritySettings) => meService.updateSecuritySettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(meQueryKeys.securitySettings, settings);
    },
  });
};
