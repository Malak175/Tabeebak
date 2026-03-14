import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meService } from "@/services/me.service";
import {
  ChangePasswordRequest,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

export const myAccountQueryKeys = {
  all: ["my-account"] as const,
  me: () => ["my-account", "me"] as const,
  profile: () => ["my-account", "profile"] as const,
  notificationPreferences: () => ["my-account", "notification-preferences"] as const,
  securitySettings: () => ["my-account", "security-settings"] as const,
};

export const useMeQuery = (enabled = true) =>
  useQuery({
    queryKey: myAccountQueryKeys.me(),
    queryFn: meService.getMe,
    enabled,
  });

export const useMyProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: myAccountQueryKeys.profile(),
    queryFn: meService.getMyProfile,
    enabled,
  });

export const useUpdateBasicInfoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBasicInfoRequest) => meService.updateBasicInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
    },
  });
};

export const useUpdateContactInfoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateContactInfoRequest) => meService.updateContactInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => meService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
    },
  });
};

export const useDeleteAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.me() });
    },
  });
};

export const useChangeMyPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) => meService.changePassword(payload),
  });

export const useNotificationPreferencesQuery = (enabled = true) =>
  useQuery({
    queryKey: myAccountQueryKeys.notificationPreferences(),
    queryFn: meService.getNotificationPreferences,
    enabled,
  });

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      meService.updateNotificationPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myAccountQueryKeys.notificationPreferences(),
      });
    },
  });
};

export const useSecuritySettingsQuery = (enabled = true) =>
  useQuery({
    queryKey: myAccountQueryKeys.securitySettings(),
    queryFn: meService.getSecuritySettings,
    enabled,
  });

export const useUpdateSecuritySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SecuritySettings) => meService.updateSecuritySettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myAccountQueryKeys.securitySettings(),
      });
    },
  });
};
