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

const hasValue = (value: string | number | null | undefined) =>
  !(value === undefined || value === null || `${value}`.trim() === "");

const hasAnyProfileValue = (profile: PatientProfile) =>
  [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.dateOfBirth,
    profile.gender,
    profile.addressLine1,
    profile.city,
    profile.country,
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
      hasValue(profile.notes),
  );

const hasAnyEmergencyValue = (contact: EmergencyContact) =>
  [
    contact.name,
    contact.relationship,
    contact.phone,
    contact.alternatePhone,
    contact.email,
    contact.address,
  ].some(hasValue);

const hasAnyInsuranceValue = (insurance: InsuranceInfo) =>
  [
    insurance.providerName,
    insurance.planName,
    insurance.memberId,
    insurance.policyNumber,
    insurance.groupNumber,
    insurance.expiryDate,
    insurance.coverageDetails,
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
    alternatePhone: "",
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
    notes: "",
  });
  const [emergencyForm, setEmergencyForm] = useState({
    name: "",
    relationship: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
  });
  const [insuranceForm, setInsuranceForm] = useState({
    providerName: "",
    planName: "",
    memberId: "",
    policyNumber: "",
    groupNumber: "",
    expiryDate: "",
    coverageDetails: "",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfileForm({
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      displayName: profileQuery.data.displayName ?? "",
      phone: profileQuery.data.phone ?? "",
      alternatePhone: profileQuery.data.alternatePhone ?? "",
      dateOfBirth: profileQuery.data.dateOfBirth?.slice(0, 10) ?? "",
      gender: profileQuery.data.gender ?? "",
      addressLine1: profileQuery.data.addressLine1 ?? "",
      addressLine2: profileQuery.data.addressLine2 ?? "",
      city: profileQuery.data.city ?? "",
      state: profileQuery.data.state ?? "",
      country: profileQuery.data.country ?? "",
      postalCode: profileQuery.data.postalCode ?? "",
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!medicalProfileQuery.data) return;

    setMedicalForm({
      bloodType: medicalProfileQuery.data.bloodType ?? "",
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
      notes: medicalProfileQuery.data.notes ?? "",
    });
  }, [medicalProfileQuery.data]);

  useEffect(() => {
    if (!emergencyContactQuery.data) return;

    setEmergencyForm({
      name: emergencyContactQuery.data.name ?? "",
      relationship: emergencyContactQuery.data.relationship ?? "",
      phone: emergencyContactQuery.data.phone ?? "",
      alternatePhone: emergencyContactQuery.data.alternatePhone ?? "",
      email: emergencyContactQuery.data.email ?? "",
      address: emergencyContactQuery.data.address ?? "",
    });
  }, [emergencyContactQuery.data]);

  useEffect(() => {
    if (!insuranceQuery.data) return;

    setInsuranceForm({
      providerName: insuranceQuery.data.providerName ?? "",
      planName: insuranceQuery.data.planName ?? "",
      memberId: insuranceQuery.data.memberId ?? "",
      policyNumber: insuranceQuery.data.policyNumber ?? "",
      groupNumber: insuranceQuery.data.groupNumber ?? "",
      expiryDate: insuranceQuery.data.expiryDate?.slice(0, 10) ?? "",
      coverageDetails: insuranceQuery.data.coverageDetails ?? "",
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

  const handleProfileSave = () => {
    updateProfileMutation.mutate(
      {
        firstName: profileForm.firstName || undefined,
        lastName: profileForm.lastName || undefined,
        displayName: profileForm.displayName || undefined,
        phone: profileForm.phone || undefined,
        alternatePhone: profileForm.alternatePhone || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        gender: profileForm.gender || undefined,
        addressLine1: profileForm.addressLine1 || undefined,
        addressLine2: profileForm.addressLine2 || undefined,
        city: profileForm.city || undefined,
        state: profileForm.state || undefined,
        country: profileForm.country || undefined,
        postalCode: profileForm.postalCode || undefined,
      },
      {
        onSuccess: (updatedProfile) => {
          const fullName = [
            updatedProfile.firstName,
            updatedProfile.lastName,
          ]
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
      },
    );
  };

  const handleMedicalProfileSave = () => {
    updateMedicalProfileMutation.mutate(
      {
        bloodType: medicalForm.bloodType || undefined,
        heightCm: medicalForm.heightCm ? Number(medicalForm.heightCm) : null,
        weightKg: medicalForm.weightKg ? Number(medicalForm.weightKg) : null,
        allergies: fromCommaSeparated(medicalForm.allergies),
        currentMedications: fromCommaSeparated(medicalForm.currentMedications),
        chronicConditions: fromCommaSeparated(medicalForm.chronicConditions),
        pastSurgeries: fromCommaSeparated(medicalForm.pastSurgeries),
        familyHistory: fromCommaSeparated(medicalForm.familyHistory),
        notes: medicalForm.notes || undefined,
      },
      {
        onSuccess: () => toast.success("Medical profile updated successfully"),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleEmergencyContactSave = () => {
    updateEmergencyContactMutation.mutate(
      {
        name: emergencyForm.name || undefined,
        relationship: emergencyForm.relationship || undefined,
        phone: emergencyForm.phone || undefined,
        alternatePhone: emergencyForm.alternatePhone || undefined,
        email: emergencyForm.email || undefined,
        address: emergencyForm.address || undefined,
      },
      {
        onSuccess: () => toast.success("Emergency contact updated successfully"),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleInsuranceSave = () => {
    updateInsuranceMutation.mutate(
      {
        providerName: insuranceForm.providerName || undefined,
        planName: insuranceForm.planName || undefined,
        memberId: insuranceForm.memberId || undefined,
        policyNumber: insuranceForm.policyNumber || undefined,
        groupNumber: insuranceForm.groupNumber || undefined,
        expiryDate: insuranceForm.expiryDate || undefined,
        coverageDetails: insuranceForm.coverageDetails || undefined,
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
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      value={profileForm.alternatePhone}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          alternatePhone: event.target.value,
                        }))
                      }
                    />
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
                    <Input
                      id="gender"
                      value={profileForm.gender}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, gender: event.target.value }))
                      }
                    />
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
                    <Input
                      id="city"
                      value={profileForm.city}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, city: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileForm.state}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, state: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileForm.country}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, country: event.target.value }))
                      }
                    />
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
                    <Input
                      id="bloodType"
                      value={medicalForm.bloodType}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, bloodType: event.target.value }))
                      }
                    />
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
                      value={medicalForm.notes}
                      onChange={(event) =>
                        setMedicalForm((current) => ({ ...current, notes: event.target.value }))
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
                      <Label htmlFor="emergencyName">Full Name</Label>
                      <Input
                        id="emergencyName"
                        value={emergencyForm.name}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={emergencyForm.relationship}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({
                            ...current,
                            relationship: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={emergencyForm.phone}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyAlternatePhone">Alternate Phone</Label>
                      <Input
                        id="emergencyAlternatePhone"
                        value={emergencyForm.alternatePhone}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({
                            ...current,
                            alternatePhone: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyEmail">Email</Label>
                      <Input
                        id="emergencyEmail"
                        type="email"
                        value={emergencyForm.email}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyAddress">Address</Label>
                      <Textarea
                        id="emergencyAddress"
                        rows={3}
                        value={emergencyForm.address}
                        onChange={(event) =>
                          setEmergencyForm((current) => ({ ...current, address: event.target.value }))
                        }
                      />
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
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input
                        id="planName"
                        value={insuranceForm.planName}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            planName: event.target.value,
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
                      <Label htmlFor="policyNumber">Policy Number</Label>
                      <Input
                        id="policyNumber"
                        value={insuranceForm.policyNumber}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            policyNumber: event.target.value,
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
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={insuranceForm.expiryDate}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            expiryDate: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coverageDetails">Coverage Details</Label>
                      <Textarea
                        id="coverageDetails"
                        rows={3}
                        value={insuranceForm.coverageDetails}
                        onChange={(event) =>
                          setInsuranceForm((current) => ({
                            ...current,
                            coverageDetails: event.target.value,
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
