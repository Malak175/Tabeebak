import { useEffect, useState } from "react";
import {
  AlertCircle,
  ClipboardPlus,
  HeartPulse,
  LoaderCircle,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/hooks/usePatient";
import type {
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient.types";

const toDelimitedString = (value: string[]) => value.join(", ");

const toDelimitedArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const PatientProfileSettings = () => {
  const profileQuery = usePatientProfileQuery();
  const medicalProfileQuery = usePatientMedicalProfileQuery();
  const emergencyContactQuery = useEmergencyContactQuery();
  const insuranceQuery = useInsuranceQuery();
  const medicalHistorySummaryQuery = useMedicalHistorySummaryQuery();

  const updateProfileMutation = useUpdatePatientProfileMutation();
  const updateMedicalProfileMutation = useUpdatePatientMedicalProfileMutation();
  const updateEmergencyContactMutation = useUpdateEmergencyContactMutation();
  const updateInsuranceMutation = useUpdateInsuranceMutation();

  const [profileForm, setProfileForm] = useState<UpdatePatientProfileRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    occupation: "",
    maritalStatus: "",
  });
  const [medicalProfileForm, setMedicalProfileForm] = useState<
    UpdatePatientMedicalProfileRequest & {
      allergiesText: string;
      chronicConditionsText: string;
      currentMedicationsText: string;
      pastSurgeriesText: string;
      familyHistoryText: string;
    }
  >({
    bloodType: "",
    heightCm: undefined,
    weightKg: undefined,
    notes: "",
    allergiesText: "",
    chronicConditionsText: "",
    currentMedicationsText: "",
    pastSurgeriesText: "",
    familyHistoryText: "",
  });
  const [emergencyContactForm, setEmergencyContactForm] = useState<UpdateEmergencyContactRequest>({
    name: "",
    relationship: "",
    phone: "",
    alternatePhone: "",
    address: "",
  });
  const [insuranceForm, setInsuranceForm] = useState<UpdateInsuranceInfoRequest>({
    providerName: "",
    policyNumber: "",
    memberId: "",
    groupNumber: "",
    coverageDetails: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfileForm({
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      phone: profileQuery.data.phone ?? "",
      dateOfBirth: profileQuery.data.dateOfBirth?.slice(0, 10) ?? "",
      gender: profileQuery.data.gender ?? "",
      address: profileQuery.data.address ?? "",
      city: profileQuery.data.city ?? "",
      country: profileQuery.data.country ?? "",
      occupation: profileQuery.data.occupation ?? "",
      maritalStatus: profileQuery.data.maritalStatus ?? "",
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!medicalProfileQuery.data) return;

    setMedicalProfileForm({
      bloodType: medicalProfileQuery.data.bloodType ?? "",
      heightCm: medicalProfileQuery.data.heightCm,
      weightKg: medicalProfileQuery.data.weightKg,
      notes: medicalProfileQuery.data.notes ?? "",
      allergiesText: toDelimitedString(medicalProfileQuery.data.allergies),
      chronicConditionsText: toDelimitedString(medicalProfileQuery.data.chronicConditions),
      currentMedicationsText: toDelimitedString(medicalProfileQuery.data.currentMedications),
      pastSurgeriesText: toDelimitedString(medicalProfileQuery.data.pastSurgeries),
      familyHistoryText: toDelimitedString(medicalProfileQuery.data.familyHistory),
    });
  }, [medicalProfileQuery.data]);

  useEffect(() => {
    if (!emergencyContactQuery.data) return;

    setEmergencyContactForm({
      name: emergencyContactQuery.data.name ?? "",
      relationship: emergencyContactQuery.data.relationship ?? "",
      phone: emergencyContactQuery.data.phone ?? "",
      alternatePhone: emergencyContactQuery.data.alternatePhone ?? "",
      address: emergencyContactQuery.data.address ?? "",
    });
  }, [emergencyContactQuery.data]);

  useEffect(() => {
    if (!insuranceQuery.data) return;

    setInsuranceForm({
      providerName: insuranceQuery.data.providerName ?? "",
      policyNumber: insuranceQuery.data.policyNumber ?? "",
      memberId: insuranceQuery.data.memberId ?? "",
      groupNumber: insuranceQuery.data.groupNumber ?? "",
      coverageDetails: insuranceQuery.data.coverageDetails ?? "",
      expiryDate: insuranceQuery.data.expiryDate?.slice(0, 10) ?? "",
    });
  }, [insuranceQuery.data]);

  const isLoading =
    profileQuery.isLoading ||
    medicalProfileQuery.isLoading ||
    emergencyContactQuery.isLoading ||
    insuranceQuery.isLoading ||
    medicalHistorySummaryQuery.isLoading;

  const firstError =
    profileQuery.error?.message ||
    medicalProfileQuery.error?.message ||
    emergencyContactQuery.error?.message ||
    insuranceQuery.error?.message ||
    medicalHistorySummaryQuery.error?.message;

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileForm, {
      onSuccess: () => toast.success("Patient profile updated successfully."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleMedicalProfileSave = () => {
    updateMedicalProfileMutation.mutate(
      {
        bloodType: medicalProfileForm.bloodType,
        heightCm: medicalProfileForm.heightCm,
        weightKg: medicalProfileForm.weightKg,
        allergies: toDelimitedArray(medicalProfileForm.allergiesText),
        chronicConditions: toDelimitedArray(medicalProfileForm.chronicConditionsText),
        currentMedications: toDelimitedArray(medicalProfileForm.currentMedicationsText),
        pastSurgeries: toDelimitedArray(medicalProfileForm.pastSurgeriesText),
        familyHistory: toDelimitedArray(medicalProfileForm.familyHistoryText),
        notes: medicalProfileForm.notes,
      },
      {
        onSuccess: () => toast.success("Medical profile updated successfully."),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleEmergencyContactSave = () => {
    updateEmergencyContactMutation.mutate(emergencyContactForm, {
      onSuccess: () => toast.success("Emergency contact updated successfully."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleInsuranceSave = () => {
    updateInsuranceMutation.mutate(insuranceForm, {
      onSuccess: () => toast.success("Insurance information updated successfully."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Patient Profile</h2>
        <p className="text-muted-foreground">
          Review and update patient-specific health, contact, and coverage data.
        </p>
      </div>

      {firstError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient profile data could not be fully loaded</AlertTitle>
          <AlertDescription>{firstError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5" />
              Personal Patient Profile
            </CardTitle>
            <CardDescription>Keep your core patient record up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient-first-name">First Name</Label>
                <Input
                  id="patient-first-name"
                  value={profileForm.firstName ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-last-name">Last Name</Label>
                <Input
                  id="patient-last-name"
                  value={profileForm.lastName ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Phone</Label>
                <Input
                  id="patient-phone"
                  value={profileForm.phone ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-date-of-birth">Date of Birth</Label>
                <Input
                  id="patient-date-of-birth"
                  type="date"
                  value={profileForm.dateOfBirth ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-gender">Gender</Label>
                <Input
                  id="patient-gender"
                  value={profileForm.gender ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, gender: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-occupation">Occupation</Label>
                <Input
                  id="patient-occupation"
                  value={profileForm.occupation ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, occupation: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-marital-status">Marital Status</Label>
                <Input
                  id="patient-marital-status"
                  value={profileForm.maritalStatus ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      maritalStatus: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="patient-address">Address</Label>
                <Input
                  id="patient-address"
                  value={profileForm.address ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-city">City</Label>
                <Input
                  id="patient-city"
                  value={profileForm.city ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-country">Country</Label>
                <Input
                  id="patient-country"
                  value={profileForm.country ?? ""}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </div>
            </div>
            <Button
              className="gap-2"
              disabled={updateProfileMutation.isPending}
              onClick={handleProfileSave}
              type="button"
            >
              {updateProfileMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Patient Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Medical Profile
            </CardTitle>
            <CardDescription>Maintain the clinical data used in your care journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="blood-type">Blood Type</Label>
                <Input
                  id="blood-type"
                  value={medicalProfileForm.bloodType ?? ""}
                  onChange={(event) =>
                    setMedicalProfileForm((current) => ({
                      ...current,
                      bloodType: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height-cm">Height (cm)</Label>
                <Input
                  id="height-cm"
                  type="number"
                  value={medicalProfileForm.heightCm ?? ""}
                  onChange={(event) =>
                    setMedicalProfileForm((current) => ({
                      ...current,
                      heightCm: Number(event.target.value) || undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight-kg">Weight (kg)</Label>
                <Input
                  id="weight-kg"
                  type="number"
                  value={medicalProfileForm.weightKg ?? ""}
                  onChange={(event) =>
                    setMedicalProfileForm((current) => ({
                      ...current,
                      weightKg: Number(event.target.value) || undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="Comma-separated values"
                value={medicalProfileForm.allergiesText}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    allergiesText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chronic-conditions">Chronic Conditions</Label>
              <Textarea
                id="chronic-conditions"
                placeholder="Comma-separated values"
                value={medicalProfileForm.chronicConditionsText}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    chronicConditionsText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-medications">Current Medications</Label>
              <Textarea
                id="current-medications"
                placeholder="Comma-separated values"
                value={medicalProfileForm.currentMedicationsText}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    currentMedicationsText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="past-surgeries">Past Surgeries</Label>
              <Textarea
                id="past-surgeries"
                placeholder="Comma-separated values"
                value={medicalProfileForm.pastSurgeriesText}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    pastSurgeriesText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family-history">Family History</Label>
              <Textarea
                id="family-history"
                placeholder="Comma-separated values"
                value={medicalProfileForm.familyHistoryText}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    familyHistoryText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-notes">Clinical Notes</Label>
              <Textarea
                id="medical-notes"
                value={medicalProfileForm.notes ?? ""}
                onChange={(event) =>
                  setMedicalProfileForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
            <Button
              className="gap-2"
              disabled={updateMedicalProfileMutation.isPending}
              onClick={handleMedicalProfileSave}
              type="button"
            >
              {updateMedicalProfileMutation.isPending && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              <Save className="h-4 w-4" />
              Save Medical Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Add the contact your care team should reach first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Name</Label>
                <Input
                  id="emergency-name"
                  value={emergencyContactForm.name ?? ""}
                  onChange={(event) =>
                    setEmergencyContactForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-relationship">Relationship</Label>
                <Input
                  id="emergency-relationship"
                  value={emergencyContactForm.relationship ?? ""}
                  onChange={(event) =>
                    setEmergencyContactForm((current) => ({
                      ...current,
                      relationship: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Phone</Label>
                <Input
                  id="emergency-phone"
                  value={emergencyContactForm.phone ?? ""}
                  onChange={(event) =>
                    setEmergencyContactForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-alt-phone">Alternate Phone</Label>
                <Input
                  id="emergency-alt-phone"
                  value={emergencyContactForm.alternatePhone ?? ""}
                  onChange={(event) =>
                    setEmergencyContactForm((current) => ({
                      ...current,
                      alternatePhone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergency-address">Address</Label>
                <Input
                  id="emergency-address"
                  value={emergencyContactForm.address ?? ""}
                  onChange={(event) =>
                    setEmergencyContactForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button
              className="gap-2"
              disabled={updateEmergencyContactMutation.isPending}
              onClick={handleEmergencyContactSave}
              type="button"
            >
              {updateEmergencyContactMutation.isPending && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              <Save className="h-4 w-4" />
              Save Emergency Contact
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Insurance
            </CardTitle>
            <CardDescription>Store the current insurance information for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="provider-name">Provider</Label>
                <Input
                  id="provider-name"
                  value={insuranceForm.providerName ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      providerName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-number">Policy Number</Label>
                <Input
                  id="policy-number"
                  value={insuranceForm.policyNumber ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      policyNumber: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-id">Member ID</Label>
                <Input
                  id="member-id"
                  value={insuranceForm.memberId ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      memberId: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-number">Group Number</Label>
                <Input
                  id="group-number"
                  value={insuranceForm.groupNumber ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      groupNumber: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance-expiry">Expiry Date</Label>
                <Input
                  id="insurance-expiry"
                  type="date"
                  value={insuranceForm.expiryDate ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      expiryDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coverage-details">Coverage Details</Label>
                <Textarea
                  id="coverage-details"
                  value={insuranceForm.coverageDetails ?? ""}
                  onChange={(event) =>
                    setInsuranceForm((current) => ({
                      ...current,
                      coverageDetails: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button
              className="gap-2"
              disabled={updateInsuranceMutation.isPending}
              onClick={handleInsuranceSave}
              type="button"
            >
              {updateInsuranceMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Insurance
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical History Summary</CardTitle>
          <CardDescription>
            Backend-sourced summary of the key medical history currently on file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!medicalHistorySummaryQuery.data ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No medical history summary available yet</AlertTitle>
              <AlertDescription>
                Add details in your medical profile to populate this section.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Allergies", medicalHistorySummaryQuery.data.allergies],
                  ["Chronic Conditions", medicalHistorySummaryQuery.data.chronicConditions],
                  ["Current Medications", medicalHistorySummaryQuery.data.currentMedications],
                  ["Past Surgeries", medicalHistorySummaryQuery.data.pastSurgeries],
                  ["Family History", medicalHistorySummaryQuery.data.familyHistory],
                ].map(([label, values]) => (
                  <div className="rounded-xl border bg-muted/30 p-4" key={label}>
                    <p className="mb-2 text-sm font-medium">{label}</p>
                    {Array.isArray(values) && values.length > 0 ? (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {values.map((value) => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available.</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">
                  {medicalHistorySummaryQuery.data.notes ?? "No notes available."}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {medicalHistorySummaryQuery.data.lastUpdated ?? "Not available"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfileSettings;
