export interface LabDashboardSummary {
  labId?: string;
  displayName?: string;
  legalName?: string | null;
  email?: string;
  phone?: string | null;
  accreditation?: string | null;
  licenseNumber?: string | null;
  totalBranchesCount?: number | null;
  activeBranchesCount?: number | null;
  totalServicesCount?: number | null;
  activeServicesCount?: number | null;
  pendingTestsCount?: number | null;
  completedTestsToday?: number | null;
  totalTestsThisMonth?: number | null;
  urgentTestsCount?: number | null;
  profileCompletionPercentage?: number | null;
  rating?: number | null;
  addressSummary?: string | null;
  homeCollectionAvailable?: boolean | null;
  accreditationLabel?: string | null;
  recentOrdersPreview?: LabRecentOrdersPreview | null;
}

export interface LabRecentOrdersPreview {
  items: LabRecentOrderPreviewItem[];
  total?: number | null;
}

export interface LabRecentOrderPreviewItem {
  id?: string | null;
  orderDisplayId?: string | null;
  requestId?: string | null;
  patientName?: string | null;
  testName?: string | null;
  status?: string | null;
  requestedAt?: string | null;
  referenceNumber?: string | null;
}

export interface LabProfile {
  id?: string;
  displayName?: string;
  legalName?: string | null;
  email?: string;
  phone?: string | null;
  alternatePhone?: string | null;
  description?: string | null;
  accreditation?: string | null;
  licenseNumber?: string | null;
  taxNumber?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  logoUrl?: string | null;
  establishedYear?: number | null;
  homeCollectionAvailable?: boolean | null;
  isActive?: boolean | null;
}

export interface UpdateLabProfileRequest {
  displayName?: string;
  legalName?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  description?: string | null;
  accreditation?:
    | {
        name?: string | null;
        number?: string | null;
        status?: string | null;
      }
    | null;
  licenseNumber?: string | null;
  taxNumber?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  establishedYear?: number | null;
  homeCollectionAvailable?: boolean | null;
}

export interface LabBranch {
  id: string;
  name?: string;
  code?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  operatingHours?: string | null;
  isMainBranch?: boolean | null;
  isActive?: boolean | null;
}

export interface CreateLabBranchRequest {
  name: string;
  code?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  operatingHours?: string | null;
  isMainBranch?: boolean | null;
  isActive?: boolean | null;
}

export interface UpdateLabBranchRequest {
  name?: string;
  code?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  operatingHours?: string | null;
  isMainBranch?: boolean | null;
  isActive?: boolean | null;
}

export interface LabService {
  id: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  sampleType?: string | null;
  turnaroundTime?: string | null;
  price?: number | null;
  currency?: string | null;
  preparationInstructions?: string | null;
  isActive?: boolean | null;
}

export interface CreateLabServiceRequest {
  name: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  sampleType?: string | null;
  turnaroundTime?: string | null;
  price?: number | null;
  currency?: string | null;
  preparationInstructions?: string | null;
  isActive?: boolean | null;
}

export interface UpdateLabServiceRequest {
  name?: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  sampleType?: string | null;
  turnaroundTime?: string | null;
  price?: number | null;
  currency?: string | null;
  preparationInstructions?: string | null;
  isActive?: boolean | null;
}
