import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FlaskConical,
  HelpCircle,
  Heart,
  Home,
  ImagePlus,
  Lock,
  LucideIcon,
  Settings,
  Shield,
  Stethoscope,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AccountActivitySections } from "@/components/settings/AccountActivitySections";
import { getDisplayName, getInitials } from "@/lib/auth";
import { validatePasswordPolicy } from "@/lib/password-policy";
import {
  useChangeMyPasswordMutation,
  useDeleteAvatarMutation,
  myAccountQueryKeys,
  useMyProfileQuery,
  useNotificationPreferencesQuery,
  useSecuritySettingsQuery,
  useUpdateBasicInfoMutation,
  useUpdateContactInfoMutation,
  useUpdateNotificationPreferencesMutation,
  useUpdateSecuritySettingsMutation,
  useUploadAvatarMutation,
} from "@/hooks/useMyAccount";
import { useAuth } from "@/hooks/useAuth";
import { NotificationPreferences, SecuritySettings } from "@/types/me.types";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface AccountSettingsContentProps {
  dashboardRole: "patient" | "doctor" | "laboratory";
  title: string;
  description: string;
  navItems: NavItem[];
  layoutIcon: LucideIcon;
  children?: ReactNode;
}

const prettifyKey = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const isEditableSettingValue = (value: unknown): value is string | number | boolean | null =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  value === null;

const SettingsEditor = <T extends Record<string, string | number | boolean | null | undefined>>({
  title,
  description,
  icon: Icon,
  values,
  setValues,
  error,
  isLoading,
  isSaving,
  onSave,
  onRetry,
  emptyState,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  values: T;
  setValues: (next: T) => void;
  error?: Error | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRetry?: () => void;
  emptyState: string;
}) => {
  const entries = Object.entries(values).filter(([, value]) => isEditableSettingValue(value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load {title.toLowerCase()}</AlertTitle>
            <AlertDescription>
              {error.message}
              {onRetry ? (
                <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyState}</p>
        ) : (
          entries.map(([key, value]) => {
            if (typeof value === "boolean") {
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{prettifyKey(key)}</p>
                    <p className="text-sm text-muted-foreground">Toggle {prettifyKey(key).toLowerCase()}.</p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setValues({ ...values, [key]: checked })}
                  />
                </div>
              );
            }

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{prettifyKey(key)}</Label>
                <Input
                  id={key}
                  type={typeof value === "number" ? "number" : "text"}
                  value={value ?? ""}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      [key]:
                        typeof value === "number" ? Number(event.target.value || 0) : event.target.value,
                    })
                  }
                />
              </div>
            );
          })
        )}

        <Button onClick={onSave} disabled={isSaving || isLoading || entries.length === 0}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
};

export const patientNavItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: ClipboardList },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

export const doctorNavItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Prescriptions", url: "/doctor/prescriptions", icon: ClipboardList },
  { title: "Reviews", url: "/doctor/reviews", icon: Bell },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

export const labNavItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Active Work", url: "/lab/pending", icon: Clock },
  { title: "Results & Archive", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

export const AccountSettingsContent = ({
  dashboardRole,
  title,
  description,
  navItems,
  layoutIcon,
  children,
}: AccountSettingsContentProps) => {
  const queryClient = useQueryClient();
  const { user, setBootstrappedUser } = useAuth();
  const profileQuery = useMyProfileQuery(Boolean(user));
  const notificationQuery = useNotificationPreferencesQuery(Boolean(user));
  const securityQuery = useSecuritySettingsQuery(Boolean(user));
  const updateBasicInfoMutation = useUpdateBasicInfoMutation();
  const updateContactInfoMutation = useUpdateContactInfoMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const changePasswordMutation = useChangeMyPasswordMutation();
  const updateNotificationMutation = useUpdateNotificationPreferencesMutation();
  const updateSecurityMutation = useUpdateSecuritySettingsMutation();

  const [basicInfo, setBasicInfo] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
  });
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    form: "",
  });
  const [notificationDraft, setNotificationDraft] = useState<NotificationPreferences>({});
  const [securityDraft, setSecurityDraft] = useState<SecuritySettings>({});
  const [avatarVersion, setAvatarVersion] = useState(0);

  const inputErrorClass = (message?: string) =>
    message ? "border-destructive/60 focus-visible:ring-destructive/40" : "";

  useEffect(() => {
    if (!profileQuery.data) return;

    setBasicInfo({
      displayName: getDisplayName(profileQuery.data),
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      dateOfBirth: profileQuery.data.dateOfBirth?.slice(0, 10) ?? "",
      gender: profileQuery.data.gender ?? "",
    });
    setContactInfo({
      email: profileQuery.data.email ?? "",
      phone: profileQuery.data.phone ?? "",
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (notificationQuery.data) {
      setNotificationDraft(notificationQuery.data);
    }
  }, [notificationQuery.data]);

  useEffect(() => {
    if (securityQuery.data) {
      setSecurityDraft(securityQuery.data);
    }
  }, [securityQuery.data]);

  const handleBasicInfoSave = () => {
    updateBasicInfoMutation.mutate(
      dashboardRole === "laboratory"
        ? { displayName: basicInfo.displayName }
        : {
            displayName: basicInfo.displayName,
            firstName: basicInfo.firstName,
            lastName: basicInfo.lastName,
            dateOfBirth: basicInfo.dateOfBirth || undefined,
            gender: basicInfo.gender || undefined,
          },
      {
        onSuccess: (updatedProfile) => {
          setBootstrappedUser(updatedProfile);
          toast.success("Basic information updated successfully");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleContactInfoSave = () => {
    updateContactInfoMutation.mutate(contactInfo, {
      onSuccess: (updatedProfile) => {
        setBootstrappedUser(updatedProfile);
        toast.success("Contact information updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const updateAvatarCaches = (nextAvatarUrl: string | null) => {
    queryClient.setQueryData(myAccountQueryKeys.profile(), (previous) =>
      previous ? { ...previous, avatarUrl: nextAvatarUrl } : previous,
    );
    queryClient.setQueryData(myAccountQueryKeys.me(), (previous) =>
      previous ? { ...previous, avatarUrl: nextAvatarUrl } : previous,
    );
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    console.log("[Avatar Upload] Selected file", file);
    if (!file) return;

    uploadAvatarMutation.mutate(file, {
      onSuccess: (response) => {
        if (!response.avatarUrl) {
          toast.error("Avatar upload completed but no image URL was returned.");
          return;
        }
        updateAvatarCaches(response.avatarUrl);
        setBootstrappedUser({
          ...(profileQuery.data ?? user ?? {}),
          avatarUrl: response.avatarUrl,
        });
        setAvatarVersion((current) => current + 1);
        toast.success(response.message ?? "Avatar updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleDeleteAvatar = () => {
    deleteAvatarMutation.mutate(undefined, {
      onSuccess: (response) => {
        updateAvatarCaches(null);
        const base = profileQuery.data ?? user;
        if (base) {
          setBootstrappedUser({ ...base, avatarUrl: null });
        }
        setAvatarVersion((current) => current + 1);
        toast.success(response.message);
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handlePasswordSave = () => {
    const nextErrors = {
      currentPassword: passwordForm.currentPassword.trim() ? "" : "Please enter your current password.",
      newPassword: "",
      form: "",
    };

    const passwordError = validatePasswordPolicy(passwordForm.newPassword);
    if (passwordError) {
      nextErrors.newPassword = passwordError;
    }

    setPasswordErrors(nextErrors);

    if (nextErrors.currentPassword || nextErrors.newPassword) {
      return;
    }

    changePasswordMutation.mutate(passwordForm, {
      onSuccess: (response) => {
        toast.success(response.message);
        setPasswordForm({ currentPassword: "", newPassword: "" });
        setPasswordErrors({ currentPassword: "", newPassword: "", form: "" });
      },
      onError: (error: Error) => {
        setPasswordErrors({
          currentPassword: error.message,
          newPassword: "",
          form: "",
        });
      },
    });
  };

  const activeProfile = profileQuery.data ?? user;
  const userName = getDisplayName(activeProfile ?? {});
  const userSubtitle =
    activeProfile?.role === "Lab"
      ? "Laboratory account"
      : activeProfile?.role === "Doctor"
      ? "Doctor account"
      : "Patient account";

  return (
    <DashboardLayout
      userRole={dashboardRole}
      userName={userName}
      userSubtitle={userSubtitle}
      navItems={navItems}
      userIcon={layoutIcon}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {dashboardRole === "laboratory" && (
        <div className="mb-6 rounded-xl border border-dashed bg-background/60 px-4 py-3 text-sm">
          <div className="font-semibold">Account Settings</div>
          <p className="text-muted-foreground">
            These settings apply to the signed-in account and its avatar.
          </p>
        </div>
      )}

      {profileQuery.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Unable to load account settings</AlertTitle>
          <AlertDescription>{(profileQuery.error as Error).message}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {dashboardRole === "laboratory" ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
              Account Summary
            </CardTitle>
            <CardDescription>Your authenticated identity is sourced from `/api/v1/auth/me`.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {profileQuery.isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      activeProfile?.avatarUrl
                        ? `${activeProfile.avatarUrl}${activeProfile.avatarUrl.includes("?") ? "&" : "?"}v=${avatarVersion}`
                        : undefined
                    }
                    alt={userName}
                  />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{userName}</p>
                  <p className="text-sm text-muted-foreground">{activeProfile?.email}</p>
                  <p className="text-sm text-muted-foreground">{activeProfile?.role}</p>
                  {dashboardRole === "laboratory" && (
                    <p className="text-xs text-muted-foreground">
                      Account avatar is separate from the laboratory logo.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Label
                htmlFor="avatar-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
              >
                <ImagePlus className="h-4 w-4" />
                {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Avatar"}
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadAvatarMutation.isPending}
              />
              <Button
                variant="outline"
                onClick={handleDeleteAvatar}
                disabled={!activeProfile?.avatarUrl || deleteAvatarMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteAvatarMutation.isPending ? "Removing..." : "Remove Avatar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {dashboardRole !== "laboratory" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Update the shared account profile fields from `/api/v1/me/basic-info`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={basicInfo.displayName}
                    onChange={(event) =>
                      setBasicInfo((current) => ({ ...current, displayName: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={basicInfo.firstName}
                    onChange={(event) =>
                      setBasicInfo((current) => ({ ...current, firstName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={basicInfo.lastName}
                    onChange={(event) =>
                      setBasicInfo((current) => ({ ...current, lastName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={basicInfo.dateOfBirth}
                    onChange={(event) =>
                      setBasicInfo((current) => ({ ...current, dateOfBirth: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={basicInfo.gender}
                    onChange={(event) =>
                      setBasicInfo((current) => ({ ...current, gender: event.target.value }))
                    }
                  />
                </div>
              </div>
              <Button onClick={handleBasicInfoSave} disabled={updateBasicInfoMutation.isPending || profileQuery.isLoading}>
                {updateBasicInfoMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Manage the shared contact details from `/api/v1/me/contact-info`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(event) =>
                    setContactInfo((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(event) =>
                    setContactInfo((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
            </div>
            <Button onClick={handleContactInfoSave} disabled={updateContactInfoMutation.isPending || profileQuery.isLoading}>
              {updateContactInfoMutation.isPending ? "Saving..." : "Save Contact Info"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>Change your password through `/api/v1/me/password`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                className={inputErrorClass(passwordErrors.currentPassword)}
                value={passwordForm.currentPassword}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPasswordForm((current) => ({ ...current, currentPassword: nextValue }));
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors((current) => ({ ...current, currentPassword: "" }));
                  }
                }}
              />
              <FieldError message={passwordErrors.currentPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                className={inputErrorClass(passwordErrors.newPassword)}
                value={passwordForm.newPassword}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPasswordForm((current) => ({ ...current, newPassword: nextValue }));
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((current) => ({ ...current, newPassword: "" }));
                  }
                }}
              />
              <FieldError message={passwordErrors.newPassword} />
            </div>
            <Button variant="outline" onClick={handlePasswordSave} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        <SettingsEditor
          title="Notification Preferences"
          description="Manage shared notification preferences."
          icon={Bell}
          values={notificationDraft}
          setValues={setNotificationDraft}
          error={notificationQuery.isError ? (notificationQuery.error as Error) : null}
          isLoading={notificationQuery.isLoading}
          isSaving={updateNotificationMutation.isPending}
          onRetry={() => void notificationQuery.refetch()}
          emptyState="No notification preference fields were returned by the API yet."
          onSave={() =>
            updateNotificationMutation.mutate(notificationDraft, {
              onSuccess: () => toast.success("Notification preferences updated successfully"),
              onError: (error: Error) => toast.error(error.message),
            })
          }
        />

        <SettingsEditor
          title="Security Settings"
          description="Manage shared security settings."
          icon={Shield}
          values={securityDraft}
          setValues={setSecurityDraft}
          error={securityQuery.isError ? (securityQuery.error as Error) : null}
          isLoading={securityQuery.isLoading}
          isSaving={updateSecurityMutation.isPending}
          onRetry={() => void securityQuery.refetch()}
          emptyState="No security settings fields were returned by the API yet."
          onSave={() =>
            updateSecurityMutation.mutate(securityDraft, {
              onSuccess: () => toast.success("Security settings updated successfully"),
              onError: (error: Error) => toast.error(error.message),
            })
          }
        />

        <AccountActivitySections />

        {children}
      </div>
    </DashboardLayout>
  );
};

export const settingsIcons = {
  patient: User,
  doctor: Stethoscope,
  laboratory: Building2,
};
