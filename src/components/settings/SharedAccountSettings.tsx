import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Bell,
  Camera,
  LoaderCircle,
  Lock,
  Mail,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import {
  useChangePasswordMutation,
  useDeleteAvatarMutation,
  useMyProfileQuery,
  useNotificationPreferencesQuery,
  useSecuritySettingsQuery,
  useUpdateBasicInfoMutation,
  useUpdateContactInfoMutation,
  useUpdateNotificationPreferencesMutation,
  useUpdateSecuritySettingsMutation,
  useUploadAvatarMutation,
} from "@/hooks/useMe";
import type {
  ChangePasswordRequest,
  NotificationPreferences,
  SecuritySettings,
  UpdateBasicInfoRequest,
  UpdateContactInfoRequest,
} from "@/types/me.types";

interface SharedAccountSettingsProps {
  variant: "individual" | "organization";
  pageDescription: string;
  profileTitle: string;
  profileDescription: string;
  showDemographics?: boolean;
  showBio?: boolean;
  bioLabel?: string;
}

const defaultBasicInfo: UpdateBasicInfoRequest = {
  firstName: "",
  lastName: "",
  name: "",
  dateOfBirth: "",
  gender: "",
  bio: "",
};

const defaultContactInfo: UpdateContactInfoRequest = {
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  appointmentReminders: true,
  marketingEmails: false,
  securityAlerts: true,
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginAlerts: true,
  sessionTimeoutMinutes: 30,
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "TB";

const SharedAccountSettings = ({
  variant,
  pageDescription,
  profileTitle,
  profileDescription,
  showDemographics = false,
  showBio = false,
  bioLabel = "Bio",
}: SharedAccountSettingsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const profileQuery = useMyProfileQuery();
  const notificationPreferencesQuery = useNotificationPreferencesQuery();
  const securitySettingsQuery = useSecuritySettingsQuery();
  const updateBasicInfoMutation = useUpdateBasicInfoMutation();
  const updateContactInfoMutation = useUpdateContactInfoMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const updateNotificationPreferencesMutation = useUpdateNotificationPreferencesMutation();
  const updateSecuritySettingsMutation = useUpdateSecuritySettingsMutation();

  const [basicInfo, setBasicInfo] = useState<UpdateBasicInfoRequest>(defaultBasicInfo);
  const [contactInfo, setContactInfo] = useState<UpdateContactInfoRequest>(defaultContactInfo);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    defaultSecuritySettings,
  );

  useEffect(() => {
    if (!profileQuery.data) return;

    setBasicInfo({
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      name: profileQuery.data.name ?? "",
      dateOfBirth: profileQuery.data.dateOfBirth?.slice(0, 10) ?? "",
      gender: profileQuery.data.gender ?? "",
      bio: profileQuery.data.bio ?? "",
    });

    setContactInfo({
      email: profileQuery.data.email ?? "",
      phone: profileQuery.data.phone ?? "",
      address: profileQuery.data.address ?? "",
      city: profileQuery.data.city ?? "",
      country: profileQuery.data.country ?? "",
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!notificationPreferencesQuery.data) return;
    setNotificationPreferences(notificationPreferencesQuery.data);
  }, [notificationPreferencesQuery.data]);

  useEffect(() => {
    if (!securitySettingsQuery.data) return;
    setSecuritySettings(securitySettingsQuery.data);
  }, [securitySettingsQuery.data]);

  const activeProfile = profileQuery.data ?? user;
  const fallbackName = [activeProfile?.firstName, activeProfile?.lastName].filter(Boolean).join(" ");
  const displayName =
    activeProfile?.name ?? (fallbackName || "Account");

  const handleAvatarSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadAvatarMutation.mutate(file, {
      onSuccess: (response) => {
        toast.success(response.message ?? "Avatar updated successfully.");
      },
      onError: (error: Error) => toast.error(error.message),
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const saveBasicInfo = () => {
    updateBasicInfoMutation.mutate(basicInfo, {
      onSuccess: () => toast.success("Basic information updated successfully."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const saveContactInfo = () => {
    updateContactInfoMutation.mutate(contactInfo, {
      onSuccess: () => toast.success("Contact information updated successfully."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const savePassword = () => {
    changePasswordMutation.mutate(passwordForm, {
      onSuccess: (response) => {
        toast.success(response.message);
        setPasswordForm({ currentPassword: "", newPassword: "" });
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const saveNotificationPreferences = () => {
    updateNotificationPreferencesMutation.mutate(notificationPreferences, {
      onSuccess: () => toast.success("Notification preferences saved."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const saveSecuritySettings = () => {
    updateSecuritySettingsMutation.mutate(securitySettings, {
      onSuccess: () => toast.success("Security settings saved."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      {(profileQuery.isError ||
        notificationPreferencesQuery.isError ||
        securitySettingsQuery.isError) && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Some settings could not be loaded</AlertTitle>
          <AlertDescription>
            {profileQuery.error?.message ||
              notificationPreferencesQuery.error?.message ||
              securitySettingsQuery.error?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {profileTitle}
              </CardTitle>
              <CardDescription>{profileDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {variant === "individual" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={basicInfo.firstName ?? ""}
                        onChange={(event) =>
                          setBasicInfo((current) => ({
                            ...current,
                            firstName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={basicInfo.lastName ?? ""}
                        onChange={(event) =>
                          setBasicInfo((current) => ({
                            ...current,
                            lastName: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="organizationName">Laboratory Name</Label>
                    <Input
                      id="organizationName"
                      value={basicInfo.name ?? ""}
                      onChange={(event) =>
                        setBasicInfo((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {variant === "individual" && showDemographics && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={basicInfo.dateOfBirth ?? ""}
                        onChange={(event) =>
                          setBasicInfo((current) => ({
                            ...current,
                            dateOfBirth: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={basicInfo.gender ?? ""}
                        onChange={(event) =>
                          setBasicInfo((current) => ({
                            ...current,
                            gender: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              {showBio && (
                <div className="space-y-2">
                  <Label htmlFor="bio">{bioLabel}</Label>
                  <Textarea
                    id="bio"
                    value={basicInfo.bio ?? ""}
                    onChange={(event) =>
                      setBasicInfo((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                  />
                </div>
              )}

              <Button
                className="gap-2"
                onClick={saveBasicInfo}
                disabled={updateBasicInfoMutation.isPending || profileQuery.isLoading}
                type="button"
              >
                {updateBasicInfoMutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Save Basic Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Manage how the platform can reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email ?? ""}
                    onChange={(event) =>
                      setContactInfo((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone ?? ""}
                    onChange={(event) =>
                      setContactInfo((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={contactInfo.address ?? ""}
                    onChange={(event) =>
                      setContactInfo((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactInfo.city ?? ""}
                    onChange={(event) =>
                      setContactInfo((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={contactInfo.country ?? ""}
                    onChange={(event) =>
                      setContactInfo((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                className="gap-2"
                onClick={saveContactInfo}
                disabled={updateContactInfoMutation.isPending || profileQuery.isLoading}
                type="button"
              >
                {updateContactInfoMutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Save Contact Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose which account updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["Email Notifications", "emailNotifications"],
                  ["SMS Notifications", "smsNotifications"],
                  ["Push Notifications", "pushNotifications"],
                  ["Appointment Reminders", "appointmentReminders"],
                  ["Marketing Emails", "marketingEmails"],
                  ["Security Alerts", "securityAlerts"],
                ] as const
              ).map(([label, key]) => (
                <div className="flex items-center justify-between" key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    checked={notificationPreferences[key]}
                    id={key}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences((current) => ({
                        ...current,
                        [key]: checked,
                      }))
                    }
                  />
                </div>
              ))}

              <Button
                className="gap-2"
                onClick={saveNotificationPreferences}
                disabled={
                  updateNotificationPreferencesMutation.isPending ||
                  notificationPreferencesQuery.isLoading
                }
                type="button"
              >
                {updateNotificationPreferencesMutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Upload or remove your current avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage alt={displayName} src={activeProfile?.avatarUrl} />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {(activeProfile?.role ?? user?.role ?? "Account").toString()}
                  </p>
                </div>
              </div>

              <input
                className="hidden"
                onChange={handleAvatarSelection}
                ref={fileInputRef}
                type="file"
                accept="image/*"
              />

              <div className="flex gap-3">
                <Button
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  type="button"
                >
                  {uploadAvatarMutation.isPending && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  <Camera className="h-4 w-4" />
                  Upload Avatar
                </Button>
                <Button
                  className="gap-2"
                  onClick={() =>
                    deleteAvatarMutation.mutate(undefined, {
                      onSuccess: (response) => toast.success(response.message),
                      onError: (error: Error) => toast.error(error.message),
                    })
                  }
                  disabled={deleteAvatarMutation.isPending}
                  type="button"
                  variant="outline"
                >
                  {deleteAvatarMutation.isPending && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  <Trash2 className="h-4 w-4" />
                  Remove Avatar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="gap-2"
                onClick={savePassword}
                disabled={changePasswordMutation.isPending}
                type="button"
                variant="outline"
              >
                {changePasswordMutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage shared account and session protections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorEnabled">Two-factor authentication</Label>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  id="twoFactorEnabled"
                  onCheckedChange={(checked) =>
                    setSecuritySettings((current) => ({
                      ...current,
                      twoFactorEnabled: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="loginAlerts">Login alerts</Label>
                <Switch
                  checked={securitySettings.loginAlerts}
                  id="loginAlerts"
                  onCheckedChange={(checked) =>
                    setSecuritySettings((current) => ({
                      ...current,
                      loginAlerts: checked,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeoutMinutes"
                  type="number"
                  min={5}
                  step={5}
                  value={securitySettings.sessionTimeoutMinutes}
                  onChange={(event) =>
                    setSecuritySettings((current) => ({
                      ...current,
                      sessionTimeoutMinutes: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
              <Button
                className="gap-2"
                onClick={saveSecuritySettings}
                disabled={updateSecuritySettingsMutation.isPending || securitySettingsQuery.isLoading}
                type="button"
              >
                {updateSecuritySettingsMutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Save Security
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SharedAccountSettings;
