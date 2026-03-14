import { useEffect, useState } from "react";
import { BriefcaseMedical, MapPin, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  useDoctorProfessionalProfileQuery,
  useDoctorProfileQuery,
  useUpdateDoctorProfessionalProfileMutation,
  useUpdateDoctorProfileMutation,
} from "@/hooks/useDoctorProfile";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  UpdateDoctorProfessionalProfileRequest,
  UpdateDoctorProfileRequest,
} from "@/types/doctor-profile.types";

const toCommaSeparatedValue = (value?: string[]) => value?.join(", ") ?? "";

const toStringArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toNullableNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const DoctorProfileSettingsSections = () => {
  const { user, setBootstrappedUser } = useAuth();
  const profileQuery = useDoctorProfileQuery(Boolean(user));
  const professionalQuery = useDoctorProfessionalProfileQuery(Boolean(user));
  const updateProfileMutation = useUpdateDoctorProfileMutation();
  const updateProfessionalMutation = useUpdateDoctorProfessionalProfileMutation();

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
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
    bio: "",
  });

  const [professionalForm, setProfessionalForm] = useState({
    specialty: "",
    subspecialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    consultationFee: "",
    clinicName: "",
    clinicAddress: "",
    about: "",
    education: "",
    certifications: "",
    languages: "",
    hospitalAffiliations: "",
    servicesOffered: "",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfileForm({
      displayName: profileQuery.data.displayName ?? "",
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
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
      bio: profileQuery.data.bio ?? "",
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!professionalQuery.data) return;

    setProfessionalForm({
      specialty: professionalQuery.data.specialty ?? "",
      subspecialty: professionalQuery.data.subspecialty ?? "",
      licenseNumber: professionalQuery.data.licenseNumber ?? "",
      yearsOfExperience:
        professionalQuery.data.yearsOfExperience?.toString() ?? "",
      consultationFee: professionalQuery.data.consultationFee?.toString() ?? "",
      clinicName: professionalQuery.data.clinicName ?? "",
      clinicAddress: professionalQuery.data.clinicAddress ?? "",
      about: professionalQuery.data.about ?? "",
      education: toCommaSeparatedValue(professionalQuery.data.education),
      certifications: toCommaSeparatedValue(professionalQuery.data.certifications),
      languages: toCommaSeparatedValue(professionalQuery.data.languages),
      hospitalAffiliations: toCommaSeparatedValue(professionalQuery.data.hospitalAffiliations),
      servicesOffered: toCommaSeparatedValue(professionalQuery.data.servicesOffered),
    });
  }, [professionalQuery.data]);

  const handleProfileSave = () => {
    const payload: UpdateDoctorProfileRequest = {
      displayName: profileForm.displayName || undefined,
      firstName: profileForm.firstName || undefined,
      lastName: profileForm.lastName || undefined,
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
      bio: profileForm.bio || undefined,
    };

    updateProfileMutation.mutate(payload, {
      onSuccess: (updatedProfile) => {
        if (user) {
          setBootstrappedUser({
            ...user,
            displayName: updatedProfile.displayName ?? user.displayName,
            firstName: updatedProfile.firstName ?? user.firstName,
            lastName: updatedProfile.lastName ?? user.lastName,
            phone: updatedProfile.phone ?? user.phone,
            dateOfBirth: updatedProfile.dateOfBirth ?? user.dateOfBirth,
            gender: updatedProfile.gender ?? user.gender,
            avatarUrl: updatedProfile.avatarUrl ?? user.avatarUrl,
          });
        }

        toast.success("Doctor profile updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleProfessionalSave = () => {
    const payload: UpdateDoctorProfessionalProfileRequest = {
      specialty: professionalForm.specialty || undefined,
      subspecialty: professionalForm.subspecialty || undefined,
      licenseNumber: professionalForm.licenseNumber || undefined,
      yearsOfExperience: toNullableNumber(professionalForm.yearsOfExperience),
      consultationFee: toNullableNumber(professionalForm.consultationFee),
      clinicName: professionalForm.clinicName || undefined,
      clinicAddress: professionalForm.clinicAddress || undefined,
      about: professionalForm.about || undefined,
      education: toStringArray(professionalForm.education),
      certifications: toStringArray(professionalForm.certifications),
      languages: toStringArray(professionalForm.languages),
      hospitalAffiliations: toStringArray(professionalForm.hospitalAffiliations),
      servicesOffered: toStringArray(professionalForm.servicesOffered),
    };

    updateProfessionalMutation.mutate(payload, {
      onSuccess: () => toast.success("Professional profile updated successfully"),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Doctor Profile
          </CardTitle>
          <CardDescription>
            Personal doctor-facing profile fields from `/api/v1/doctors/me/profile`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full md:col-span-2" />
            </div>
          ) : profileQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load doctor profile</AlertTitle>
              <AlertDescription>
                {(profileQuery.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doctor-display-name">Display Name</Label>
                  <Input
                    id="doctor-display-name"
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        displayName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-phone">Phone</Label>
                  <Input
                    id="doctor-phone"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-first-name">First Name</Label>
                  <Input
                    id="doctor-first-name"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-last-name">Last Name</Label>
                  <Input
                    id="doctor-last-name"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-alt-phone">Alternate Phone</Label>
                  <Input
                    id="doctor-alt-phone"
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
                  <Label htmlFor="doctor-dob">Date of Birth</Label>
                  <Input
                    id="doctor-dob"
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        dateOfBirth: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-gender">Gender</Label>
                  <Input
                    id="doctor-gender"
                    value={profileForm.gender}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, gender: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-city">City</Label>
                  <Input
                    id="doctor-city"
                    value={profileForm.city}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-state">State</Label>
                  <Input
                    id="doctor-state"
                    value={profileForm.state}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, state: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-country">Country</Label>
                  <Input
                    id="doctor-country"
                    value={profileForm.country}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, country: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-postal-code">Postal Code</Label>
                  <Input
                    id="doctor-postal-code"
                    value={profileForm.postalCode}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        postalCode: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-address-line-1">Address Line 1</Label>
                  <Input
                    id="doctor-address-line-1"
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
                  <Label htmlFor="doctor-address-line-2">Address Line 2</Label>
                  <Input
                    id="doctor-address-line-2"
                    value={profileForm.addressLine2}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        addressLine2: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-bio">Bio</Label>
                  <Textarea
                    id="doctor-bio"
                    value={profileForm.bio}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, bio: event.target.value }))
                    }
                    rows={4}
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileSave}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Doctor Profile"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseMedical className="h-5 w-5" />
            Professional Profile
          </CardTitle>
          <CardDescription>
            Practice details from `/api/v1/doctors/me/professional-profile`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {professionalQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full md:col-span-2" />
            </div>
          ) : professionalQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load professional profile</AlertTitle>
              <AlertDescription>
                {(professionalQuery.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doctor-specialty">Specialty</Label>
                  <Input
                    id="doctor-specialty"
                    value={professionalForm.specialty}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        specialty: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-subspecialty">Subspecialty</Label>
                  <Input
                    id="doctor-subspecialty"
                    value={professionalForm.subspecialty}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        subspecialty: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-license-number">License Number</Label>
                  <Input
                    id="doctor-license-number"
                    value={professionalForm.licenseNumber}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        licenseNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-years-of-experience">Years of Experience</Label>
                  <Input
                    id="doctor-years-of-experience"
                    type="number"
                    min="0"
                    value={professionalForm.yearsOfExperience}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        yearsOfExperience: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-consultation-fee">Consultation Fee</Label>
                  <Input
                    id="doctor-consultation-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={professionalForm.consultationFee}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        consultationFee: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-clinic-name">Clinic Name</Label>
                  <Input
                    id="doctor-clinic-name"
                    value={professionalForm.clinicName}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        clinicName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-clinic-address">Clinic Address</Label>
                  <Input
                    id="doctor-clinic-address"
                    value={professionalForm.clinicAddress}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        clinicAddress: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-about">About</Label>
                  <Textarea
                    id="doctor-about"
                    value={professionalForm.about}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        about: event.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-education">Education</Label>
                  <Input
                    id="doctor-education"
                    value={professionalForm.education}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        education: event.target.value,
                      }))
                    }
                    placeholder="Comma-separated values"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-certifications">Certifications</Label>
                  <Input
                    id="doctor-certifications"
                    value={professionalForm.certifications}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        certifications: event.target.value,
                      }))
                    }
                    placeholder="Comma-separated values"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-languages">Languages</Label>
                  <Input
                    id="doctor-languages"
                    value={professionalForm.languages}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        languages: event.target.value,
                      }))
                    }
                    placeholder="Comma-separated values"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-affiliations">Hospital Affiliations</Label>
                  <Textarea
                    id="doctor-affiliations"
                    value={professionalForm.hospitalAffiliations}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        hospitalAffiliations: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Comma-separated values"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doctor-services-offered">Services Offered</Label>
                  <Textarea
                    id="doctor-services-offered"
                    value={professionalForm.servicesOffered}
                    onChange={(event) =>
                      setProfessionalForm((current) => ({
                        ...current,
                        servicesOffered: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Comma-separated values"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                <MapPin className="mb-2 h-4 w-4" />
                Empty values are supported, so this form can work even if the backend has not populated
                every professional profile field yet.
              </div>

              <Button
                onClick={handleProfessionalSave}
                disabled={updateProfessionalMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfessionalMutation.isPending
                  ? "Saving..."
                  : "Save Professional Profile"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
