import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Shield, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useEmergencyContactQuery,
  useInsuranceQuery,
  useMedicalHistorySummaryQuery,
  usePatientMedicalProfileQuery,
  usePatientProfileQuery,
  useUpdateEmergencyContactMutation,
  useUpdateInsuranceMutation,
  useUpdatePatientMedicalProfileMutation,
  useUpdatePatientProfileMutation,
} from "@/hooks/usePatientProfile";
import { getDisplayName } from "@/lib/auth";
import {
  BLOOD_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  ensureObjectOption,
  ensureOption,
  getCityOptions,
  getGovernorateOptions,
  normalizeSelectObjectValue,
  normalizeSelectValue,
} from "@/lib/patient-profile-options";
import {
  formatEgyptianPhoneForDisplay,
  getEgyptianPhoneValidationError,
  normalizeEgyptianPhone,
} from "@/lib/phone";
import {
  EmergencyContact,
  InsuranceInfo,
  PatientMedicalProfile,
  PatientProfile,
} from "@/types/patient-profile.types";

const toCommaSeparated = (values: string[]) => values.join(", ");

const fromCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeOptionalString = (value: string | null | undefined) =>
  typeof value === "string" ? value.trim() : value ?? null;

const buildPatchString = (current: string, original?: string | null) => {
  const next = toNullableString(current);
  const prev = normalizeOptionalString(original);
  return next === prev ? undefined : next;
};

const buildPatchDate = (current: string, original?: string | null) => {
  const next = current.trim() ? current.trim() : null;
  const prev = original ? original.slice(0, 10) : null;
  return next === prev ? undefined : next;
};

const buildPatchNumber = (current: string, original?: number | null) => {
  const next = current.trim() ? Number(current) : null;
  const prev = original ?? null;
  if (Number.isNaN(next as number)) return undefined;
  return next === prev ? undefined : next;
};

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);

const buildPatchArray = (current: string, original?: string[]) => {
  const next = fromCommaSeparated(current);
  const prev = original ?? [];
  return arraysEqual(next, prev) ? undefined : next;
};

const buildPatchPhone = (current: string, original?: string | null) => {
  const trimmed = current.trim();
  const prev = original ?? null;
  if (!trimmed) return prev ? null : undefined;
  const normalized = normalizeEgyptianPhone(trimmed).e164;
  return normalized === prev ? undefined : normalized ?? null;
};

const withoutUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;

const hasValue = (value: string | number | null | undefined) =>
  !(value === undefined || value === null || `${value}`.trim() === "");

const hasAnyProfileValue = (profile: PatientProfile) =>
  [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.dateOfBirth,
    profile.gender,
    profile.address?.line1,
    profile.address?.city,
    profile.address?.country,
  ].some(hasValue);

const hasAnyMedicalValue = (profile: PatientMedicalProfile) =>
  Boolean(
    hasValue(profile.bloodType) ||
      profile.heightCm !== null ||
      profile.weightKg !== null ||
      profile.allergies.length ||
      profile.currentMedications.length ||
      profile.chronicConditions.length ||
      profile.pastSurgeries.length ||
      profile.familyHistory.length ||
      hasValue(profile.medicalNotes),
  );

const hasAnyEmergencyValue = (contact: EmergencyContact) =>
  [contact.fullName, contact.relationship, contact.phone, contact.secondaryPhone].some(hasValue);

const hasAnyInsuranceValue = (insurance: InsuranceInfo) =>
  [
    insurance.providerName,
    insurance.memberId,
    insurance.groupNumber,
    insurance.policyHolderName,
    insurance.policyHolderRelation,
    insurance.providerPhone,
  ].some(hasValue);

const SectionSkeleton = () => (
  <>
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </>
);

const RetryAlert = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) => (
  <Alert variant="destructive">
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription className="space-y-3">
      <p>{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

const PatientSettings = () => {
  const { user, setBootstrappedUser } = useAuth();
  const enabled = Boolean(user);

  const profileQuery = usePatientProfileQuery(enabled);
  const medicalProfileQuery = usePatientMedicalProfileQuery(enabled);
  const emergencyContactQuery = useEmergencyContactQuery(enabled);
  const insuranceQuery = useInsuranceQuery(enabled);
  const medicalHistoryQuery = useMedicalHistorySummaryQuery(enabled);

  const updateProfileMutation = useUpdatePatientProfileMutation();
  const updateMedicalProfileMutation = useUpdatePatientMedicalProfileMutation();
  const updateEmergencyContactMutation = useUpdateEmergencyContactMutation();
  const updateInsuranceMutation = useUpdateInsuranceMutation();

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    secondaryPhone: "",
    dateOfBirth: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [medicalForm, setMedicalForm] = useState({
    bloodType: "",
    heightCm: "",
    weightKg: "",
    allergies: "",
    currentMedications: "",
    chronicConditions: "",
    pastSurgeries: "",
    familyHistory: "",
    medicalNotes: "",
  });
  const [emergencyForm, setEmergencyForm] = useState({
    fullName: "",
    relationship: "",
    phone: "",
    secondaryPhone: "",
  });
  const [insuranceForm, setInsuranceForm] = useState({
    providerName: "",
    memberId: "",
    groupNumber: "",
    policyHolderName: "",
    policyHolderRelation: "",
    providerPhone: "",
  });
  const [profileErrors, setProfileErrors] = useState({
    phone: "",
    secondaryPhone: "",
  });
  const [emergencyErrors, setEmergencyErrors] = useState({
    phone: "",
    secondaryPhone: "",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    const profileAddress = profileQuery.data.address ?? {};
    const normalizedCountry = normalizeSelectObjectValue(
      profileAddress.country ?? "",
      COUNTRY_OPTIONS,
    );
    const governorateOptions = getGovernorateOptions(normalizedCountry);
    const normalizedState = normalizeSelectValue(
      profileAddress.state ?? "",
      governorateOptions,
    );
    const cityOptions = getCityOptions(normalizedCountry, normalizedState);
    const normalizedCity = normalizeSelectValue(profileAddress.city ?? "", cityOptions);

    setProfileForm({
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      displayName: profileQuery.data.displayName ?? "",
      phone: formatEgyptianPhoneForDisplay(profileQuery.data.phone ?? ""),
      secondaryPhone: formatEgyptianPhoneForDisplay(profileQuery.data.secondaryPhone ?? ""),
      dateOfBirth: profileQuery.data.dateOfBirth?.slice(0, 10) ?? "",
      gender: normalizeSelectValue(profileQuery.data.gender ?? "", GENDER_OPTIONS),
      addressLine1: profileAddress.line1 ?? "",
      addressLine2: profileAddress.line2 ?? "",
      city: normalizedCity,
      state: normalizedState,
      country: normalizedCountry,
      postalCode: profileAddress.postalCode ?? "",
    });
    setProfileErrors({ phone: "", secondaryPhone: "" });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!medicalProfileQuery.data) return;

    setMedicalForm({
      bloodType: normalizeSelectValue(medicalProfileQuery.data.bloodType ?? "", BLOOD_TYPE_OPTIONS),
      heightCm:
        medicalProfileQuery.data.heightCm === null || medicalProfileQuery.data.heightCm === undefined
          ? ""
          : String(medicalProfileQuery.data.heightCm),
      weightKg:
        medicalProfileQuery.data.weightKg === null || medicalProfileQuery.data.weightKg === undefined
          ? ""
          : String(medicalProfileQuery.data.weightKg),
      allergies: toCommaSeparated(medicalProfileQuery.data.allergies),
      currentMedications: toCommaSeparated(medicalProfileQuery.data.currentMedications),
      chronicConditions: toCommaSeparated(medicalProfileQuery.data.chronicConditions),
      pastSurgeries: toCommaSeparated(medicalProfileQuery.data.pastSurgeries),
      familyHistory: toCommaSeparated(medicalProfileQuery.data.familyHistory),
      medicalNotes: medicalProfileQuery.data.medicalNotes ?? "",
    });
  }, [medicalProfileQuery.data]);

  useEffect(() => {
    if (!emergencyContactQuery.data) return;

    setEmergencyForm({
      fullName: emergencyContactQuery.data.fullName ?? "",
      relationship: normalizeSelectValue(
        emergencyContactQuery.data.relationship ?? "",
        RELATIONSHIP_OPTIONS,
      ),
      phone: formatEgyptianPhoneForDisplay(emergencyContactQuery.data.phone ?? ""),
      secondaryPhone: formatEgyptianPhoneForDisplay(
        emergencyContactQuery.data.secondaryPhone ?? "",
      ),
    });
    setEmergencyErrors({ phone: "", secondaryPhone: "" });
  }, [emergencyContactQuery.data]);

  useEffect(() => {
    if (!insuranceQuery.data) return;

    setInsuranceForm({
      providerName: insuranceQuery.data.providerName ?? "",
      memberId: insuranceQuery.data.memberId ?? "",
      groupNumber: insuranceQuery.data.groupNumber ?? "",
      policyHolderName: insuranceQuery.data.policyHolderName ?? "",
      policyHolderRelation: insuranceQuery.data.policyHolderRelation ?? "",
      providerPhone: formatEgyptianPhoneForDisplay(insuranceQuery.data.providerPhone ?? ""),
    });
  }, [insuranceQuery.data]);

  const displayName = useMemo(
    () =>
      getDisplayName({
        displayName: profileQuery.data?.displayName ?? user?.displayName,
        firstName: profileQuery.data?.firstName ?? user?.firstName,
        lastName: profileQuery.data?.lastName ?? user?.lastName,
        email: profileQuery.data?.email ?? user?.email,
      }),
    [profileQuery.data, user],
  );

  const countryOptions = useMemo(
    () => ensureObjectOption(COUNTRY_OPTIONS, profileForm.country),
    [profileForm.country],
  );

  const governorateOptions = useMemo(() => {
    const base = getGovernorateOptions(profileForm.country);
    return ensureOption(base, profileForm.state);
  }, [profileForm.country, profileForm.state]);

  const cityOptions = useMemo(() => {
    const base = getCityOptions(profileForm.country, profileForm.state);
    return ensureOption(base, profileForm.city);
  }, [profileForm.country, profileForm.state, profileForm.city]);

  const handleCountryChange = (value: string) => {
    setProfileForm((current) => {
      if (current.country === value) return current;
      return {
        ...current,
        country: value,
        state: "",
        city: "",
      };
    });
  };

  const handleStateChange = (value: string) => {
    setProfileForm((current) => {
      const nextCities = getCityOptions(current.country, value);
      const nextCity = nextCities.includes(current.city) ? current.city : "";
      return { ...current, state: value, city: nextCity };
    });
  };

  const handleProfileSave = () => {
    const phoneError = getEgyptianPhoneValidationError(profileForm.phone, "Phone number");
    const secondaryPhoneError = getEgyptianPhoneValidationError(
      profileForm.secondaryPhone,
      "Secondary phone number",
    );

    if (phoneError || secondaryPhoneError) {
      setProfileErrors({
        phone: phoneError ?? "",
        secondaryPhone: secondaryPhoneError ?? "",
      });
      toast.error("Please correct the phone number format before saving.");
      return;
    }

    setProfileErrors({ phone: "", secondaryPhone: "" });

    const profileAddress = profileQuery.data?.address ?? {};
    const addressPayload = withoutUndefined({
      line1: buildPatchString(profileForm.addressLine1, profileAddress.line1),
      line2: buildPatchString(profileForm.addressLine2, profileAddress.line2),
      city: buildPatchString(profileForm.city, profileAddress.city),
      state: buildPatchString(profileForm.state, profileAddress.state),
      country: buildPatchString(profileForm.country, profileAddress.country),
      postalCode: buildPatchString(profileForm.postalCode, profileAddress.postalCode),
    });

    const payload = withoutUndefined({
      firstName: buildPatchString(profileForm.firstName, profileQuery.data?.firstName),
      lastName: buildPatchString(profileForm.lastName, profileQuery.data?.lastName),
      displayName: buildPatchString(profileForm.displayName, profileQuery.data?.displayName),
      phone: buildPatchPhone(profileForm.phone, profileQuery.data?.phone),
      secondaryPhone: buildPatchPhone(profileForm.secondaryPhone, profileQuery.data?.secondaryPhone),
      dateOfBirth: buildPatchDate(profileForm.dateOfBirth, profileQuery.data?.dateOfBirth),
      gender: buildPatchString(profileForm.gender, profileQuery.data?.gender),
    });

    if (Object.keys(addressPayload).length) {
      payload.address = addressPayload;
    }

    updateProfileMutation.mutate(payload, {
      onSuccess: (updatedProfile) => {
        setProfileErrors({ phone: "", secondaryPhone: "" });
        const fullName = [updatedProfile.firstName, updatedProfile.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        setBootstrappedUser({
          ...(user ?? {}),
          firstName: updatedProfile.firstName ?? user?.firstName,
          lastName: updatedProfile.lastName ?? user?.lastName,
          displayName: updatedProfile.displayName ?? user?.displayName,
          name: updatedProfile.displayName ?? (fullName || user?.name),
          email: updatedProfile.email ?? user?.email ?? "",
          phone: updatedProfile.phone ?? user?.phone,
          dateOfBirth: updatedProfile.dateOfBirth ?? user?.dateOfBirth,
          gender: updatedProfile.gender ?? user?.gender,
          avatarUrl: updatedProfile.avatarUrl ?? user?.avatarUrl ?? null,
          role: user?.role ?? "Patient",
          id: user?.id ?? updatedProfile.id ?? "",
        });
        toast.success("Profile updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleMedicalProfileSave = () => {
    const payload = withoutUndefined({
      bloodType: buildPatchString(medicalForm.bloodType, medicalProfileQuery.data?.bloodType),
      heightCm: buildPatchNumber(medicalForm.heightCm, medicalProfileQuery.data?.heightCm ?? null),
      weightKg: buildPatchNumber(medicalForm.weightKg, medicalProfileQuery.data?.weightKg ?? null),
      allergies: buildPatchArray(medicalForm.allergies, medicalProfileQuery.data?.allergies),
      currentMedications: buildPatchArray(
        medicalForm.currentMedications,
        medicalProfileQuery.data?.currentMedications,
      ),
      chronicConditions: buildPatchArray(
        medicalForm.chronicConditions,
        medicalProfileQuery.data?.chronicConditions,
      ),
      pastSurgeries: buildPatchArray(medicalForm.pastSurgeries, medicalProfileQuery.data?.pastSurgeries),
      familyHistory: buildPatchArray(medicalForm.familyHistory, medicalProfileQuery.data?.familyHistory),
      medicalNotes: buildPatchString(medicalForm.medicalNotes, medicalProfileQuery.data?.medicalNotes),
    });

    updateMedicalProfileMutation.mutate(payload, {
      onSuccess: () => toast.success("Medical profile updated successfully"),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleEmergencyContactSave = () => {
    if (!emergencyForm.fullName.trim() || !emergencyForm.relationship.trim() || !emergencyForm.phone.trim()) {
      toast.error("Full name, relationship, and phone are required for emergency contacts.");
      return;
    }

    const phoneError = getEgyptianPhoneValidationError(emergencyForm.phone, "Phone number");
    const secondaryPhoneError = getEgyptianPhoneValidationError(
      emergencyForm.secondaryPhone,
      "Secondary phone number",
    );

    if (phoneError || secondaryPhoneError) {
      setEmergencyErrors({
        phone: phoneError ?? "",
        secondaryPhone: secondaryPhoneError ?? "",
      });
      toast.error("Please correct the emergency contact phone numbers.");
      return;
    }

    const normalizedPhone = normalizeEgyptianPhone(emergencyForm.phone).e164;
    const normalizedSecondaryPhone = normalizeEgyptianPhone(emergencyForm.secondaryPhone).e164;

    setEmergencyErrors({ phone: "", secondaryPhone: "" });

    updateEmergencyContactMutation.mutate(
      {
        fullName: emergencyForm.fullName.trim(),
        relationship: emergencyForm.relationship.trim(),
        phone: normalizedPhone ?? null,
        secondaryPhone: emergencyForm.secondaryPhone.trim()
          ? normalizedSecondaryPhone ?? null
          : null,
      },
      {
        onSuccess: () => {
          setEmergencyErrors({ phone: "", secondaryPhone: "" });
          toast.success("Emergency contact updated successfully");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleInsuranceSave = () => {
    if (!insuranceForm.providerName.trim() || !insuranceForm.memberId.trim()) {
      toast.error("Provider name and member ID are required.");
      return;
    }

    const providerPhoneError = getEgyptianPhoneValidationError(
      insuranceForm.providerPhone,
      "Provider phone",
    );
    if (providerPhoneError) {
      toast.error(providerPhoneError);
      return;
    }

    const normalizedProviderPhone = normalizeEgyptianPhone(insuranceForm.providerPhone).e164;

    updateInsuranceMutation.mutate(
      {
        providerName: insuranceForm.providerName.trim(),
        memberId: insuranceForm.memberId.trim(),
        groupNumber: toNullableString(insuranceForm.groupNumber),
        policyHolderName: toNullableString(insuranceForm.policyHolderName),
        policyHolderRelation: toNullableString(insuranceForm.policyHolderRelation),
        providerPhone: insuranceForm.providerPhone.trim() ? normalizedProviderPhone ?? null : null,
      },
      {
        onSuccess: () => toast.success("Insurance information updated successfully"),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={displayName}
      userSubtitle="Patient account"
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Patient Settings</h1>
        <p className="text-muted-foreground">
          Manage the profile, medical, emergency, and insurance information stored for your patient account.
        </p>
      </div>

      {(profileQuery.isError ||
        medicalProfileQuery.isError ||
        emergencyContactQuery.isError ||
        insuranceQuery.isError) && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Some patient sections could not be loaded</AlertTitle>
          <AlertDescription>
            You can still update the sections that loaded successfully, and retry the others below.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Loaded from `/api/v1/patients/me/profile` and updated with `PATCH /api/v1/patients/me/profile`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileQuery.isLoading ? (
              <SectionSkeleton />
            ) : profileQuery.isError ? (
              <RetryAlert
                title="Unable to load patient profile"
                message={(profileQuery.error as Error).message}
                onRetry={() => void profileQuery.refetch()}
              />
            ) : (
              <>
                {!hasAnyProfileValue(profileQuery.data ?? {}) && (
                  <p className="text-sm text-muted-foreground">
                    Your patient profile is mostly empty right now. Add the key details below to complete it.
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileForm.displayName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01012345678"
                      value={profileForm.phone}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setProfileForm((current) => ({ ...current, phone: nextValue }));
                        if (profileErrors.phone) {
                          setProfileErrors((current) => ({ ...current, phone: "" }));
                        }
                      }}
                      onBlur={() =>
                        setProfileErrors((current) => ({
                          ...current,
                          phone: getEgyptianPhoneValidationError(profileForm.phone, "Phone number") ?? "",
                        }))
                      }
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-destructive">{profileErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                    <Input
                      id="secondaryPhone"
                      type="tel"
                      placeholder="01012345678"
                      value={profileForm.secondaryPhone}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setProfileForm((current) => ({
                          ...current,
                          secondaryPhone: nextValue,
                        }));
                        if (profileErrors.secondaryPhone) {
                          setProfileErrors((current) => ({ ...current, secondaryPhone: "" }));
                        }
                      }}
                      onBlur={() =>
                        setProfileErrors((current) => ({
                          ...current,
                          secondaryPhone:
                            getEgyptianPhoneValidationError(
                              profileForm.secondaryPhone,
                              "Secondary phone number",
                            ) ?? "",
                        }))
                      }
                    />
                    {profileErrors.secondaryPhone && (
                      <p className="text-sm text-destructive">{profileErrors.secondaryPhone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileForm.gender}
                      onValueChange={(value) =>
                        setProfileForm((current) => ({ ...current, gender: value }))
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {ensureOption(GENDER_OPTIONS, profileForm.gender).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profileForm.postalCode}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, postalCode: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={profileForm.addressLine1}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          addressLine1: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={profileForm.addressLine2}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          addressLine2: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={profileForm.city}
                      onValueChange={(value) =>
                        setProfileForm((current) => ({ ...current, city: value }))
                      }
                      disabled={cityOptions.length === 0}
                    >
                      <SelectTrigger id="city">
                        <SelectValue
                          placeholder={
                            profileForm.state
                              ? "Select city"
                              : "Select governorate first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Governorate</Label>
                    <Select
                      value={profileForm.state}
                      onValueChange={handleStateChange}
                      disabled={governorateOptions.length === 0}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorateOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={profileForm.country} onValueChange={handleCountryChange}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Medical Profile
            </CardTitle>
            <CardDescription>
              Loaded from `/api/v1/patients/me/medical-profile` and updated with `PATCH /api/v1/patients/me/medical-profile`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalProfileQuery.isLoading ? (
              <SectionSkeleton />
            ) : medicalProfileQuery.isError ? (
              <RetryAlert
                title="Unable to load medical profile"
                message={(medicalProfileQuery.error as Error).message}
                onRetry={() => void medicalProfileQuery.refetch()}
              />
            ) : (
              <>
                {!hasAnyMedicalValue(
                  medicalProfileQuery.data ?? {
                    allergies: [],
                    currentMedications: [],
                    chronicConditions: [],
                    pastSurgeries: [],
                    familyHistory: [],
                  },
                ) && (
                  <p className="text-sm text-muted-foreground">
                    No medical profile details are on file yet. Add the essentials so clinicians can review them quickly.
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={medicalForm.bloodType}
                      onValueChange={(value) =>
                        setMedicalForm((current) => ({ ...current, bloodType: value }))
                      }
                    >
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ensureOption(BLOOD_TYPE_OPTIONS, medicalForm.bloodType).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      type="number"
                      value={medicalForm.heightCm}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, heightCm: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      value={medicalForm.weightKg}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, weightKg: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="Peanuts, Penicillin"
                      value={medicalForm.allergies}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, allergies: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Input
                      id="currentMedications"
                      placeholder="Metformin, Lisinopril"
                      value={medicalForm.currentMedications}
                      onChange={(event) =>
                        setMedicalForm((current) => ({
                          ...current,
                          currentMedications: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                    <Input
                      id="chronicConditions"
                      value={medicalForm.chronicConditions}
                      onChange={(event) =>
                        setMedicalForm((current) => ({
                          ...current,
                          chronicConditions: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pastSurgeries">Past Surgeries</Label>
                    <Input
                      id="pastSurgeries"
                      value={medicalForm.pastSurgeries}
                      onChange={(event) =>
                        setMedicalForm((current) => ({
                          ...current,
                          pastSurgeries: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="familyHistory">Family History</Label>
                    <Input
                      id="familyHistory"
                      value={medicalForm.familyHistory}
                      onChange={(event) =>
                        setMedicalForm((current) => ({
                          ...current,
                          familyHistory: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medicalNotes">Notes</Label>
                    <Textarea
                      id="medicalNotes"
                      rows={4}
                      value={medicalForm.medicalNotes}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, medicalNotes: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleMedicalProfileSave}
                  disabled={updateMedicalProfileMutation.isPending}
                >
                  {updateMedicalProfileMutation.isPending ? "Saving..." : "Save Medical Profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Loaded from `/api/v1/patients/me/emergency-contact` and updated with `PUT /api/v1/patients/me/emergency-contact`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergencyContactQuery.isLoading ? (
                <SectionSkeleton />
              ) : emergencyContactQuery.isError ? (
                <RetryAlert
                  title="Unable to load emergency contact"
                  message={(emergencyContactQuery.error as Error).message}
                  onRetry={() => void emergencyContactQuery.refetch()}
                />
              ) : (
                <>
                  {!hasAnyEmergencyValue(emergencyContactQuery.data ?? {}) && (
                    <p className="text-sm text-muted-foreground">
                      No emergency contact has been added yet.
                    </p>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyFullName">Full Name</Label>
                      <Input
                        id="emergencyFullName"
                        value={emergencyForm.fullName}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select
                        value={emergencyForm.relationship}
                        onValueChange={(value) =>
                          setEmergencyForm((current) => ({
                            ...current,
                            relationship: value,
                          }))
                        }
                      >
                        <SelectTrigger id="relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {ensureOption(RELATIONSHIP_OPTIONS, emergencyForm.relationship).map(
                            (option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="01012345678"
                        value={emergencyForm.phone}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setEmergencyForm((current) => ({ ...current, phone: nextValue }));
                          if (emergencyErrors.phone) {
                            setEmergencyErrors((current) => ({ ...current, phone: "" }));
                          }
                        }}
                        onBlur={() =>
                          setEmergencyErrors((current) => ({
                            ...current,
                            phone:
                              getEgyptianPhoneValidationError(
                                emergencyForm.phone,
                                "Phone number",
                              ) ?? "",
                          }))
                        }
                      />
                      {emergencyErrors.phone && (
                        <p className="text-sm text-destructive">{emergencyErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyAlternatePhone">Secondary Phone</Label>
                      <Input
                        id="emergencyAlternatePhone"
                        type="tel"
                        placeholder="01012345678"
                        value={emergencyForm.secondaryPhone}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setEmergencyForm((current) => ({
                            ...current,
                            secondaryPhone: nextValue,
                          }));
                          if (emergencyErrors.secondaryPhone) {
                            setEmergencyErrors((current) => ({
                              ...current,
                              secondaryPhone: "",
                            }));
                          }
                        }}
                        onBlur={() =>
                          setEmergencyErrors((current) => ({
                            ...current,
                            secondaryPhone:
                              getEgyptianPhoneValidationError(
                                emergencyForm.secondaryPhone,
                                "Secondary phone number",
                              ) ?? "",
                          }))
                        }
                      />
                      {emergencyErrors.secondaryPhone && (
                        <p className="text-sm text-destructive">
                          {emergencyErrors.secondaryPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleEmergencyContactSave}
                    disabled={updateEmergencyContactMutation.isPending}
                  >
                    {updateEmergencyContactMutation.isPending ? "Saving..." : "Save Emergency Contact"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>
                Loaded from `/api/v1/patients/me/insurance` and updated with `PUT /api/v1/patients/me/insurance`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insuranceQuery.isLoading ? (
                <SectionSkeleton />
              ) : insuranceQuery.isError ? (
                <RetryAlert
                  title="Unable to load insurance information"
                  message={(insuranceQuery.error as Error).message}
                  onRetry={() => void insuranceQuery.refetch()}
                />
              ) : (
                <>
                  {!hasAnyInsuranceValue(insuranceQuery.data ?? {}) && (
                    <p className="text-sm text-muted-foreground">
                      No insurance details are on file yet.
                    </p>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="providerName">Provider</Label>
                      <Input
                        id="providerName"
                        value={insuranceForm.providerName}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            providerName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberId">Member ID</Label>
                      <Input
                        id="memberId"
                        value={insuranceForm.memberId}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            memberId: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupNumber">Group Number</Label>
                      <Input
                        id="groupNumber"
                        value={insuranceForm.groupNumber}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            groupNumber: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="policyHolderName">Policy Holder Name</Label>
                      <Input
                        id="policyHolderName"
                        value={insuranceForm.policyHolderName}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            policyHolderName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="policyHolderRelation">Policy Holder Relation</Label>
                      <Input
                        id="policyHolderRelation"
                        value={insuranceForm.policyHolderRelation}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            policyHolderRelation: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="providerPhone">Provider Phone</Label>
                      <Input
                        id="providerPhone"
                        type="tel"
                        value={insuranceForm.providerPhone}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            providerPhone: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleInsuranceSave} disabled={updateInsuranceMutation.isPending}>
                    {updateInsuranceMutation.isPending ? "Saving..." : "Save Insurance"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medical History Summary</CardTitle>
            <CardDescription>
              Read-only summary from `/api/v1/patients/me/medical-history-summary`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicalHistoryQuery.isLoading ? (
              <SectionSkeleton />
            ) : medicalHistoryQuery.isError ? (
              <RetryAlert
                title="Unable to load medical history summary"
                message={(medicalHistoryQuery.error as Error).message}
                onRetry={() => void medicalHistoryQuery.refetch()}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium">Allergies</p>
                  <p className="text-sm text-muted-foreground">
                    {medicalHistoryQuery.data?.allergies.join(", ") || "None recorded"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium">Chronic Conditions</p>
                  <p className="text-sm text-muted-foreground">
                    {medicalHistoryQuery.data?.chronicConditions.join(", ") || "None recorded"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium">Medications</p>
                  <p className="text-sm text-muted-foreground">
                    {medicalHistoryQuery.data?.medications.join(", ") || "None recorded"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium">Surgeries</p>
                  <p className="text-sm text-muted-foreground">
                    {medicalHistoryQuery.data?.surgeries.join(", ") || "None recorded"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
