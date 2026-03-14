import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meService } from "@/services/me.service";
import {
  ChangePasswordRequest,
  NotificationsFilterParams,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

const normalizeListParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  ) as T;

export const myAccountQueryKeys = {
  all: ["my-account"] as const,
  me: () => ["my-account", "me"] as const,
  profile: () => ["my-account", "profile"] as const,
  notificationPreferences: () => ["my-account", "notification-preferences"] as const,
  notificationsRoot: () => ["my-account", "notifications"] as const,
  notifications: (params?: NotificationsFilterParams) =>
    ["my-account", "notifications", normalizeListParams(params)] as const,
  securitySettings: () => ["my-account", "security-settings"] as const,
  sessions: () => ["my-account", "sessions"] as const,
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

export const useNotificationsQuery = (
  params?: NotificationsFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: myAccountQueryKeys.notifications(params),
    queryFn: () => meService.getNotifications(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => meService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.notificationsRoot() });
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.notificationsRoot() });
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

export const useSessionsQuery = (enabled = true) =>
  useQuery({
    queryKey: myAccountQueryKeys.sessions(),
    queryFn: meService.getSessions,
    enabled,
  });

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => meService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAccountQueryKeys.sessions() });
    },
  });
};
