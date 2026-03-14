import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FlaskConical,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateLabBranchMutation,
  useCreateLabServiceMutation,
  useDeleteLabServiceMutation,
  useLabBranchesQuery,
  useLabProfileQuery,
  useLabServicesQuery,
  useUpdateLabBranchMutation,
  useUpdateLabProfileMutation,
  useUpdateLabServiceMutation,
} from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateLabBranchRequest,
  CreateLabServiceRequest,
  LabBranch,
  LabService,
  UpdateLabBranchRequest,
  UpdateLabProfileRequest,
  UpdateLabServiceRequest,
} from "@/types/lab-profile.types";

const toNullableString = (value: string) => {
  const normalized = value.trim();
  return normalized ? normalized : null;
};

const toNullableNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getBranchLocation = (branch: LabBranch) =>
  [branch.city, branch.state, branch.country].filter(Boolean).join(", ") || "No location provided";

const getServiceMeta = (service: LabService) =>
  [service.category, service.sampleType, service.turnaroundTime].filter(Boolean).join(" | ") ||
  "No service metadata provided";

const createEmptyBranchForm = () => ({
  name: "",
  code: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  operatingHours: "",
  isMainBranch: false,
  isActive: true,
});

const createEmptyServiceForm = () => ({
  name: "",
  code: "",
  description: "",
  category: "",
  sampleType: "",
  turnaroundTime: "",
  price: "",
  currency: "EGP",
  preparationInstructions: "",
  isActive: true,
});

export const LabProfileSettingsSections = () => {
  const { user, setBootstrappedUser } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const branchesQuery = useLabBranchesQuery(Boolean(user));
  const servicesQuery = useLabServicesQuery(Boolean(user));
  const updateProfileMutation = useUpdateLabProfileMutation();
  const createBranchMutation = useCreateLabBranchMutation();
  const updateBranchMutation = useUpdateLabBranchMutation();
  const createServiceMutation = useCreateLabServiceMutation();
  const updateServiceMutation = useUpdateLabServiceMutation();
  const deleteServiceMutation = useDeleteLabServiceMutation();

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    legalName: "",
    phone: "",
    alternatePhone: "",
    description: "",
    accreditation: "",
    licenseNumber: "",
    taxNumber: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    establishedYear: "",
    homeCollectionAvailable: false,
  });
  const [createBranchForm, setCreateBranchForm] = useState(createEmptyBranchForm);
  const [branchDrafts, setBranchDrafts] = useState<Record<string, ReturnType<typeof createEmptyBranchForm>>>({});
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [createServiceForm, setCreateServiceForm] = useState(createEmptyServiceForm);
  const [serviceDrafts, setServiceDrafts] = useState<Record<string, ReturnType<typeof createEmptyServiceForm>>>({});
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<LabService | null>(null);

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfileForm({
      displayName: profileQuery.data.displayName ?? "",
      legalName: profileQuery.data.legalName ?? "",
      phone: profileQuery.data.phone ?? "",
      alternatePhone: profileQuery.data.alternatePhone ?? "",
      description: profileQuery.data.description ?? "",
      accreditation: profileQuery.data.accreditation ?? "",
      licenseNumber: profileQuery.data.licenseNumber ?? "",
      taxNumber: profileQuery.data.taxNumber ?? "",
      website: profileQuery.data.website ?? "",
      addressLine1: profileQuery.data.addressLine1 ?? "",
      addressLine2: profileQuery.data.addressLine2 ?? "",
      city: profileQuery.data.city ?? "",
      state: profileQuery.data.state ?? "",
      country: profileQuery.data.country ?? "",
      postalCode: profileQuery.data.postalCode ?? "",
      establishedYear: profileQuery.data.establishedYear?.toString() ?? "",
      homeCollectionAvailable: Boolean(profileQuery.data.homeCollectionAvailable),
    });
  }, [profileQuery.data]);

  useEffect(() => {
    if (!branchesQuery.data) return;

    setBranchDrafts(
      branchesQuery.data.reduce<Record<string, ReturnType<typeof createEmptyBranchForm>>>(
        (accumulator, branch) => {
          accumulator[branch.id] = {
            name: branch.name ?? "",
            code: branch.code ?? "",
            phone: branch.phone ?? "",
            email: branch.email ?? "",
            addressLine1: branch.addressLine1 ?? "",
            addressLine2: branch.addressLine2 ?? "",
            city: branch.city ?? "",
            state: branch.state ?? "",
            country: branch.country ?? "",
            postalCode: branch.postalCode ?? "",
            operatingHours: branch.operatingHours ?? "",
            isMainBranch: Boolean(branch.isMainBranch),
            isActive: branch.isActive ?? true,
          };
          return accumulator;
        },
        {},
      ),
    );
  }, [branchesQuery.data]);

  useEffect(() => {
    if (!servicesQuery.data) return;

    setServiceDrafts(
      servicesQuery.data.reduce<Record<string, ReturnType<typeof createEmptyServiceForm>>>(
        (accumulator, service) => {
          accumulator[service.id] = {
            name: service.name ?? "",
            code: service.code ?? "",
            description: service.description ?? "",
            category: service.category ?? "",
            sampleType: service.sampleType ?? "",
            turnaroundTime: service.turnaroundTime ?? "",
            price: service.price?.toString() ?? "",
            currency: service.currency ?? "EGP",
            preparationInstructions: service.preparationInstructions ?? "",
            isActive: service.isActive ?? true,
          };
          return accumulator;
        },
        {},
      ),
    );
  }, [servicesQuery.data]);

  const activeBranchesCount = useMemo(
    () => branchesQuery.data?.filter((branch) => branch.isActive !== false).length ?? 0,
    [branchesQuery.data],
  );

  const activeServicesCount = useMemo(
    () => servicesQuery.data?.filter((service) => service.isActive !== false).length ?? 0,
    [servicesQuery.data],
  );

  const handleProfileSave = () => {
    const payload: UpdateLabProfileRequest = {
      displayName: profileForm.displayName || undefined,
      legalName: toNullableString(profileForm.legalName),
      phone: toNullableString(profileForm.phone),
      alternatePhone: toNullableString(profileForm.alternatePhone),
      description: toNullableString(profileForm.description),
      accreditation: toNullableString(profileForm.accreditation),
      licenseNumber: toNullableString(profileForm.licenseNumber),
      taxNumber: toNullableString(profileForm.taxNumber),
      website: toNullableString(profileForm.website),
      addressLine1: toNullableString(profileForm.addressLine1),
      addressLine2: toNullableString(profileForm.addressLine2),
      city: toNullableString(profileForm.city),
      state: toNullableString(profileForm.state),
      country: toNullableString(profileForm.country),
      postalCode: toNullableString(profileForm.postalCode),
      establishedYear: toNullableNumber(profileForm.establishedYear),
      homeCollectionAvailable: profileForm.homeCollectionAvailable,
    };

    updateProfileMutation.mutate(payload, {
      onSuccess: (updatedProfile) => {
        if (user) {
          setBootstrappedUser({
            ...user,
            displayName: updatedProfile.displayName ?? user.displayName,
            email: updatedProfile.email ?? user.email,
            phone: updatedProfile.phone ?? user.phone,
          });
        }

        toast.success("Laboratory profile updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleCreateBranch = () => {
    if (!createBranchForm.name.trim()) {
      toast.error("Branch name is required");
      return;
    }

    const payload: CreateLabBranchRequest = {
      name: createBranchForm.name.trim(),
      code: toNullableString(createBranchForm.code),
      phone: toNullableString(createBranchForm.phone),
      email: toNullableString(createBranchForm.email),
      addressLine1: toNullableString(createBranchForm.addressLine1),
      addressLine2: toNullableString(createBranchForm.addressLine2),
      city: toNullableString(createBranchForm.city),
      state: toNullableString(createBranchForm.state),
      country: toNullableString(createBranchForm.country),
      postalCode: toNullableString(createBranchForm.postalCode),
      operatingHours: toNullableString(createBranchForm.operatingHours),
      isMainBranch: createBranchForm.isMainBranch,
      isActive: createBranchForm.isActive,
    };

    createBranchMutation.mutate(payload, {
      onSuccess: () => {
        setCreateBranchForm(createEmptyBranchForm());
        toast.success("Branch created successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleUpdateBranch = (branchId: string) => {
    const draft = branchDrafts[branchId];

    if (!draft?.name.trim()) {
      toast.error("Branch name is required");
      return;
    }

    const payload: UpdateLabBranchRequest = {
      name: draft.name.trim(),
      code: toNullableString(draft.code),
      phone: toNullableString(draft.phone),
      email: toNullableString(draft.email),
      addressLine1: toNullableString(draft.addressLine1),
      addressLine2: toNullableString(draft.addressLine2),
      city: toNullableString(draft.city),
      state: toNullableString(draft.state),
      country: toNullableString(draft.country),
      postalCode: toNullableString(draft.postalCode),
      operatingHours: toNullableString(draft.operatingHours),
      isMainBranch: draft.isMainBranch,
      isActive: draft.isActive,
    };

    updateBranchMutation.mutate(
      { branchId, payload },
      {
        onSuccess: () => {
          setEditingBranchId(null);
          toast.success("Branch updated successfully");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleCreateService = () => {
    if (!createServiceForm.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    const payload: CreateLabServiceRequest = {
      name: createServiceForm.name.trim(),
      code: toNullableString(createServiceForm.code),
      description: toNullableString(createServiceForm.description),
      category: toNullableString(createServiceForm.category),
      sampleType: toNullableString(createServiceForm.sampleType),
      turnaroundTime: toNullableString(createServiceForm.turnaroundTime),
      price: toNullableNumber(createServiceForm.price),
      currency: toNullableString(createServiceForm.currency),
      preparationInstructions: toNullableString(createServiceForm.preparationInstructions),
      isActive: createServiceForm.isActive,
    };

    createServiceMutation.mutate(payload, {
      onSuccess: () => {
        setCreateServiceForm(createEmptyServiceForm());
        toast.success("Service created successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleUpdateService = (serviceId: string) => {
    const draft = serviceDrafts[serviceId];

    if (!draft?.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    const payload: UpdateLabServiceRequest = {
      name: draft.name.trim(),
      code: toNullableString(draft.code),
      description: toNullableString(draft.description),
      category: toNullableString(draft.category),
      sampleType: toNullableString(draft.sampleType),
      turnaroundTime: toNullableString(draft.turnaroundTime),
      price: toNullableNumber(draft.price),
      currency: toNullableString(draft.currency),
      preparationInstructions: toNullableString(draft.preparationInstructions),
      isActive: draft.isActive,
    };

    updateServiceMutation.mutate(
      { serviceId, payload },
      {
        onSuccess: () => {
          setEditingServiceId(null);
          toast.success("Service updated successfully");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleDeleteService = () => {
    if (!serviceToDelete) return;

    deleteServiceMutation.mutate(serviceToDelete.id, {
      onSuccess: () => {
        toast.success("Service deleted successfully");
        setServiceToDelete(null);
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Laboratory Profile
          </CardTitle>
          <CardDescription>
            Core laboratory details backed by `/api/v1/labs/me/profile`.
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
              <AlertTitle>Unable to load laboratory profile</AlertTitle>
              <AlertDescription>{(profileQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lab-display-name">Laboratory Name</Label>
                  <Input
                    id="lab-display-name"
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-legal-name">Legal Name</Label>
                  <Input
                    id="lab-legal-name"
                    value={profileForm.legalName}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, legalName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-phone">Phone</Label>
                  <Input
                    id="lab-phone"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-alt-phone">Alternate Phone</Label>
                  <Input
                    id="lab-alt-phone"
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
                  <Label htmlFor="lab-accreditation">Accreditation</Label>
                  <Input
                    id="lab-accreditation"
                    value={profileForm.accreditation}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        accreditation: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-license">License Number</Label>
                  <Input
                    id="lab-license"
                    value={profileForm.licenseNumber}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        licenseNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-tax-number">Tax Number</Label>
                  <Input
                    id="lab-tax-number"
                    value={profileForm.taxNumber}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, taxNumber: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-website">Website</Label>
                  <Input
                    id="lab-website"
                    value={profileForm.website}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, website: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-established-year">Established Year</Label>
                  <Input
                    id="lab-established-year"
                    type="number"
                    value={profileForm.establishedYear}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        establishedYear: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="font-medium">Home Collection</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle whether the lab offers home sample collection.
                    </p>
                  </div>
                  <Switch
                    checked={profileForm.homeCollectionAvailable}
                    onCheckedChange={(checked) =>
                      setProfileForm((current) => ({
                        ...current,
                        homeCollectionAvailable: checked,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lab-description">Description</Label>
                  <Textarea
                    id="lab-description"
                    rows={4}
                    value={profileForm.description}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lab-address-1">Address Line 1</Label>
                  <Input
                    id="lab-address-1"
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
                  <Label htmlFor="lab-address-2">Address Line 2</Label>
                  <Input
                    id="lab-address-2"
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
                  <Label htmlFor="lab-city">City</Label>
                  <Input
                    id="lab-city"
                    value={profileForm.city}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-state">State</Label>
                  <Input
                    id="lab-state"
                    value={profileForm.state}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, state: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-country">Country</Label>
                  <Input
                    id="lab-country"
                    value={profileForm.country}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, country: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-postal-code">Postal Code</Label>
                  <Input
                    id="lab-postal-code"
                    value={profileForm.postalCode}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        postalCode: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Laboratory Profile"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Branches
          </CardTitle>
          <CardDescription>
            Manage laboratory branches using `/api/v1/labs/me/branches`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">{branchesQuery.data?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Total branches</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">{activeBranchesCount}</div>
              <div className="text-sm text-muted-foreground">Active branches</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">
                {branchesQuery.data?.filter((branch) => branch.isMainBranch).length ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Main branches</div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed p-4">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <h3 className="font-semibold">Add Branch</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-branch-name">Branch Name</Label>
                <Input
                  id="new-branch-name"
                  value={createBranchForm.name}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-code">Code</Label>
                <Input
                  id="new-branch-code"
                  value={createBranchForm.code}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, code: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-phone">Phone</Label>
                <Input
                  id="new-branch-phone"
                  value={createBranchForm.phone}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-email">Email</Label>
                <Input
                  id="new-branch-email"
                  value={createBranchForm.email}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-branch-address-1">Address Line 1</Label>
                <Input
                  id="new-branch-address-1"
                  value={createBranchForm.addressLine1}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({
                      ...current,
                      addressLine1: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-branch-address-2">Address Line 2</Label>
                <Input
                  id="new-branch-address-2"
                  value={createBranchForm.addressLine2}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({
                      ...current,
                      addressLine2: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-city">City</Label>
                <Input
                  id="new-branch-city"
                  value={createBranchForm.city}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-state">State</Label>
                <Input
                  id="new-branch-state"
                  value={createBranchForm.state}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, state: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-country">Country</Label>
                <Input
                  id="new-branch-country"
                  value={createBranchForm.country}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-branch-postal-code">Postal Code</Label>
                <Input
                  id="new-branch-postal-code"
                  value={createBranchForm.postalCode}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({
                      ...current,
                      postalCode: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-branch-hours">Operating Hours</Label>
                <Input
                  id="new-branch-hours"
                  placeholder="Sat-Thu, 8:00 AM - 10:00 PM"
                  value={createBranchForm.operatingHours}
                  onChange={(event) =>
                    setCreateBranchForm((current) => ({
                      ...current,
                      operatingHours: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="font-medium">Main Branch</p>
                  <p className="text-sm text-muted-foreground">Mark as primary branch.</p>
                </div>
                <Switch
                  checked={createBranchForm.isMainBranch}
                  onCheckedChange={(checked) =>
                    setCreateBranchForm((current) => ({ ...current, isMainBranch: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">
                    Expose this branch in the lab account.
                  </p>
                </div>
                <Switch
                  checked={createBranchForm.isActive}
                  onCheckedChange={(checked) =>
                    setCreateBranchForm((current) => ({ ...current, isActive: checked }))
                  }
                />
              </div>
            </div>

            <Button className="mt-4" onClick={handleCreateBranch} disabled={createBranchMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createBranchMutation.isPending ? "Creating..." : "Create Branch"}
            </Button>
          </div>

          {branchesQuery.isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : branchesQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load branches</AlertTitle>
              <AlertDescription>{(branchesQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : branchesQuery.data?.length ? (
            <div className="space-y-4">
              {branchesQuery.data.map((branch) => {
                const draft = branchDrafts[branch.id];
                const isEditing = editingBranchId === branch.id;

                return (
                  <Card key={branch.id}>
                    <CardContent className="space-y-4 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{branch.name || "Unnamed branch"}</h3>
                            {branch.isMainBranch && <Badge variant="secondary">Main</Badge>}
                            <Badge variant={branch.isActive === false ? "outline" : "default"}>
                              {branch.isActive === false ? "Inactive" : "Active"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{getBranchLocation(branch)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingBranchId((current) => (current === branch.id ? null : branch.id))
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {isEditing ? "Close" : "Edit"}
                        </Button>
                      </div>

                      {isEditing && draft && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Branch Name</Label>
                            <Input
                              value={draft.name}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, name: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                              value={draft.code}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, code: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={draft.phone}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, phone: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={draft.email}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, email: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Address Line 1</Label>
                            <Input
                              value={draft.addressLine1}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, addressLine1: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Address Line 2</Label>
                            <Input
                              value={draft.addressLine2}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, addressLine2: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              value={draft.city}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, city: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input
                              value={draft.state}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, state: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                              value={draft.country}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, country: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              value={draft.postalCode}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, postalCode: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Operating Hours</Label>
                            <Input
                              value={draft.operatingHours}
                              onChange={(event) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, operatingHours: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <div>
                              <p className="font-medium">Main Branch</p>
                              <p className="text-sm text-muted-foreground">Promote as primary.</p>
                            </div>
                            <Switch
                              checked={draft.isMainBranch}
                              onCheckedChange={(checked) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, isMainBranch: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <div>
                              <p className="font-medium">Active</p>
                              <p className="text-sm text-muted-foreground">
                                Control branch availability.
                              </p>
                            </div>
                            <Switch
                              checked={draft.isActive}
                              onCheckedChange={(checked) =>
                                setBranchDrafts((current) => ({
                                  ...current,
                                  [branch.id]: { ...draft, isActive: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Button
                              onClick={() => handleUpdateBranch(branch.id)}
                              disabled={updateBranchMutation.isPending}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              {updateBranchMutation.isPending ? "Saving..." : "Save Branch"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No branches were returned yet. Create the first branch to populate this section.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Services Catalog
          </CardTitle>
          <CardDescription>
            Manage test offerings through `/api/v1/labs/me/services`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">{servicesQuery.data?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Total services</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">{activeServicesCount}</div>
              <div className="text-sm text-muted-foreground">Active services</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-2xl font-bold">
                {servicesQuery.data?.filter((service) => service.category).length ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Categorized services</div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed p-4">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <h3 className="font-semibold">Add Service</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-service-name">Service Name</Label>
                <Input
                  id="new-service-name"
                  value={createServiceForm.name}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-code">Code</Label>
                <Input
                  id="new-service-code"
                  value={createServiceForm.code}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({ ...current, code: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-category">Category</Label>
                <Input
                  id="new-service-category"
                  value={createServiceForm.category}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-sample-type">Sample Type</Label>
                <Input
                  id="new-service-sample-type"
                  value={createServiceForm.sampleType}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      sampleType: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-turnaround">Turnaround Time</Label>
                <Input
                  id="new-service-turnaround"
                  value={createServiceForm.turnaroundTime}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      turnaroundTime: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-price">Price</Label>
                <Input
                  id="new-service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={createServiceForm.price}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({ ...current, price: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-service-currency">Currency</Label>
                <Input
                  id="new-service-currency"
                  value={createServiceForm.currency}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      currency: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">Show this service to consumers.</p>
                </div>
                <Switch
                  checked={createServiceForm.isActive}
                  onCheckedChange={(checked) =>
                    setCreateServiceForm((current) => ({ ...current, isActive: checked }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-service-description">Description</Label>
                <Textarea
                  id="new-service-description"
                  rows={3}
                  value={createServiceForm.description}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-service-prep">Preparation Instructions</Label>
                <Textarea
                  id="new-service-prep"
                  rows={3}
                  value={createServiceForm.preparationInstructions}
                  onChange={(event) =>
                    setCreateServiceForm((current) => ({
                      ...current,
                      preparationInstructions: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Button className="mt-4" onClick={handleCreateService} disabled={createServiceMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createServiceMutation.isPending ? "Creating..." : "Create Service"}
            </Button>
          </div>

          {servicesQuery.isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : servicesQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load services</AlertTitle>
              <AlertDescription>{(servicesQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : servicesQuery.data?.length ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesQuery.data.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="font-medium">{service.name || "Unnamed service"}</div>
                        <div className="text-xs text-muted-foreground">{getServiceMeta(service)}</div>
                      </TableCell>
                      <TableCell>{service.category || "Uncategorized"}</TableCell>
                      <TableCell>
                        {service.price != null ? `${service.currency ?? "EGP"} ${service.price}` : "No price"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive === false ? "outline" : "default"}>
                          {service.isActive === false ? "Inactive" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingServiceId((current) => (current === service.id ? null : service.id))
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {editingServiceId === service.id ? "Close" : "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setServiceToDelete(service)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {servicesQuery.data.map((service) => {
                const draft = serviceDrafts[service.id];
                const isEditing = editingServiceId === service.id;

                if (!isEditing || !draft) return null;

                return (
                  <Card key={`${service.id}-editor`}>
                    <CardHeader>
                      <CardTitle>Edit {service.name || "Service"}</CardTitle>
                      <CardDescription>
                        Update pricing, category, and status for this catalog item.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input
                          value={draft.name}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, name: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                          value={draft.code}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, code: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={draft.category}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, category: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sample Type</Label>
                        <Input
                          value={draft.sampleType}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, sampleType: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Turnaround Time</Label>
                        <Input
                          value={draft.turnaroundTime}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, turnaroundTime: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.price}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, price: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input
                          value={draft.currency}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, currency: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <div>
                          <p className="font-medium">Active</p>
                          <p className="text-sm text-muted-foreground">
                            Control service availability.
                          </p>
                        </div>
                        <Switch
                          checked={draft.isActive}
                          onCheckedChange={(checked) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, isActive: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={draft.description}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: { ...draft, description: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Preparation Instructions</Label>
                        <Textarea
                          rows={3}
                          value={draft.preparationInstructions}
                          onChange={(event) =>
                            setServiceDrafts((current) => ({
                              ...current,
                              [service.id]: {
                                ...draft,
                                preparationInstructions: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Button
                          onClick={() => handleUpdateService(service.id)}
                          disabled={updateServiceMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateServiceMutation.isPending ? "Saving..." : "Save Service"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No services were returned yet. Add your first catalog item to start managing the lab service list.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service</AlertDialogTitle>
            <AlertDialogDescription>
              {serviceToDelete
                ? `This will permanently remove "${serviceToDelete.name || "this service"}" from the catalog.`
                : "This will permanently remove the selected service."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteServiceMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} disabled={deleteServiceMutation.isPending}>
              {deleteServiceMutation.isPending ? "Deleting..." : "Delete Service"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
